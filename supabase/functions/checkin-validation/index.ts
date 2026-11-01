import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return null;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function errorResponse(message: string, status = 500): Response {
  return jsonResponse({ error: message }, status);
}

declare const Deno: { env: { get: (k: string) => string | undefined } };

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Haversine distance in meters between two lat/lng points
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json();
    const { action, business_id, customer_id, checkin_id } = body;

    // ACTION: Validate a check-in (QR, NFC, Geofence, Beacon)
    if (action === 'validate') {
      const { method, token, latitude, longitude, nfc_tag_id, beacon_id } = body;

      if (!business_id || !customer_id || !method) {
        return errorResponse('Missing required fields: business_id, customer_id, method', 400);
      }

      // Get check-in rules for this business
      const { data: rules } = await supabase
        .from('checkin_rules')
        .select('*')
        .eq('business_id', business_id)
        .single();

      // Anti-abuse: check cooldown
      if (rules?.cooldown_minutes) {
        const cooldownTime = new Date(Date.now() - rules.cooldown_minutes * 60 * 1000).toISOString();
        const { data: recentCheckin } = await supabase
          .from('checkins')
          .select('id, created_at')
          .eq('business_id', business_id)
          .eq('customer_id', customer_id)
          .gte('created_at', cooldownTime)
          .limit(1)
          .single();

        if (recentCheckin) {
          const nextAllowed = new Date(
            new Date(recentCheckin.created_at).getTime() + rules.cooldown_minutes * 60 * 1000
          );
          return jsonResponse({
            valid: false,
            reason: 'cooldown',
            next_allowed_at: nextAllowed.toISOString(),
          });
        }
      }

      // Method-specific validation
      let validationResult: { valid: boolean; reason: string; distance_meters?: number } = { valid: false, reason: 'unknown_method' };

      if (method === 'qr') {
        // Validate QR token against checkin_methods config
        const { data: qrMethod } = await supabase
          .from('checkin_methods')
          .select('id, is_active, qr_geo_enabled, qr_geo_lat, qr_geo_lng, qr_geo_radius_meters')
          .eq('business_id', business_id)
          .in('method_type', ['qr_static', 'qr_dynamic'])
          .eq('is_active', true)
          .limit(1)
          .single();

        if (!qrMethod) {
          validationResult = { valid: false, reason: 'qr_method_disabled' };
        } else if (qrMethod.qr_geo_enabled) {
          // Geolocation validation required
          if (latitude == null || longitude == null) {
            return errorResponse('QR geolocation validation requires latitude and longitude from the client device', 400);
          }

          const geoLat = Number(qrMethod.qr_geo_lat);
          const geoLng = Number(qrMethod.qr_geo_lng);
          const radiusMeters = Number(qrMethod.qr_geo_radius_meters) || 10;

          if (!geoLat || !geoLng) {
            // Geo enabled but no coordinates configured — allow check-in
            validationResult = { valid: true, reason: 'qr_valid_no_geo_coords' };
          } else {
            const distance = haversineDistance(latitude, longitude, geoLat, geoLng);
            if (distance <= radiusMeters) {
              validationResult = { valid: true, reason: 'qr_valid_within_radius', distance_meters: Math.round(distance) };
            } else {
              validationResult = {
                valid: false,
                reason: 'qr_outside_radius',
                distance_meters: Math.round(distance),
              };
              return jsonResponse({
                success: false,
                valid: false,
                reason: 'qr_outside_radius',
                distance_meters: Math.round(distance),
                required_radius_meters: radiusMeters,
                message: `Debes estar dentro de ${radiusMeters} metros del establecimiento para hacer check-in. Distancia actual: ${Math.round(distance)} metros.`,
              });
            }
          }
        } else {
          // Geo validation not enabled — standard QR check-in
          validationResult = { valid: true, reason: 'qr_valid' };
        }
      } else if (method === 'geofence') {
        if (!latitude || !longitude) {
          return errorResponse('Geofence check-in requires latitude and longitude', 400);
        }
        // Check if customer is inside any geofence
        const { data: geofences } = await supabase
          .from('business_geofences')
          .select('*')
          .eq('business_id', business_id)
          .eq('is_active', true);

        let insideGeofence = false;
        for (const gf of (geofences || [])) {
          const dist = haversineDistance(latitude, longitude, gf.center_lat, gf.center_lng);
          if (dist <= (gf.radius_meters || 100)) {
            insideGeofence = true;
            break;
          }
        }
        validationResult = insideGeofence
          ? { valid: true, reason: 'inside_geofence' }
          : { valid: false, reason: 'outside_geofence' };
      } else if (method === 'nfc') {
        const { data: nfcTag } = await supabase
          .from('nfc_tags')
          .select('*')
          .eq('id', nfc_tag_id)
          .eq('business_id', business_id)
          .eq('is_active', true)
          .single();
        validationResult = nfcTag
          ? { valid: true, reason: 'nfc_valid' }
          : { valid: false, reason: 'nfc_tag_invalid' };
      } else if (method === 'beacon') {
        const { data: beacon } = await supabase
          .from('ble_beacons')
          .select('*')
          .eq('id', beacon_id)
          .eq('business_id', business_id)
          .eq('is_active', true)
          .single();
        validationResult = beacon
          ? { valid: true, reason: 'beacon_valid' }
          : { valid: false, reason: 'beacon_invalid' };
      }

      if (!validationResult.valid) {
        return jsonResponse({ success: false, ...validationResult });
      }

      // Record the check-in
      const { data: checkin, error: checkinError } = await supabase
        .from('checkins')
        .insert({
          business_id,
          customer_id,
          method,
          location_lat: latitude || null,
          location_lng: longitude || null,
          checkin_status: 'success',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (checkinError) return errorResponse(checkinError.message);

      // Calculate and award points
      const { data: rewardConfig } = await supabase
        .from('checkin_rewards')
        .select('*')
        .eq('business_id', business_id)
        .single();

      let pointsAwarded = 0;
      if (rewardConfig) {
        pointsAwarded = rewardConfig.base_points || 10;
        // Method multiplier
        const methodMultiplier = rewardConfig[`${method}_multiplier`] || 1;
        pointsAwarded = Math.round(pointsAwarded * methodMultiplier);

        // Award loyalty points
        if (pointsAwarded > 0) {
          await supabase.from('loyalty_transactions').insert({
            business_id,
            customer_id,
            transaction_type: 'earn',
            points: pointsAwarded,
            source: 'checkin',
            reference_id: checkin?.id,
            description: `Check-in via ${method}`,
            created_at: new Date().toISOString(),
          });

          // Update loyalty_points balance
          const { data: loyaltyPoints } = await supabase
            .from('loyalty_points')
            .select('*')
            .eq('business_id', business_id)
            .eq('customer_id', customer_id)
            .single();

          if (loyaltyPoints) {
            await supabase
              .from('loyalty_points')
              .update({ balance: (loyaltyPoints.balance || 0) + pointsAwarded })
              .eq('id', loyaltyPoints.id);
          } else {
            await supabase.from('loyalty_points').insert({
              business_id,
              customer_id,
              balance: pointsAwarded,
            });
          }
        }
      }

      return jsonResponse({
        success: true,
        checkin_id: checkin?.id,
        points_awarded: pointsAwarded,
        method,
        distance_meters: validationResult.distance_meters,
      });
    }

    // ACTION: Get check-in history for a customer
    if (action === 'get_history') {
      if (!business_id || !customer_id) {
        return errorResponse('Missing required fields: business_id, customer_id', 400);
      }

      const { data: history, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('business_id', business_id)
        .eq('customer_id', customer_id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) return errorResponse(error.message);
      return jsonResponse({ history });
    }

    return errorResponse('Unknown action', 400);
  } catch (err) {
    console.error('checkin-validation error:', err);
    return errorResponse((err as Error).message);
  }
});
