import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

declare const Deno: { env: { get: (k: string) => string | undefined } };

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Inlined CORS helpers (replaces broken ../_shared/cors.ts import)
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

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json();
    const { action, business_id, customer_id, latitude, longitude, geofence_id } = body;

    // Verify user auth
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    if (authHeader) {
      const { data: userData } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = userData?.user?.id || null;
    }

    // ACTION: Check if a customer is inside any geofence for a business
    if (action === 'check_entry') {
      if (!business_id || latitude === undefined || longitude === undefined) {
        return errorResponse('Missing required fields: business_id, latitude, longitude', 400);
      }

      const { data: geofences, error: geoError } = await supabase
        .from('business_geofences')
        .select('*')
        .eq('business_id', business_id)
        .eq('is_active', true);

      if (geoError) return errorResponse(geoError.message);

      const insideGeofences: unknown[] = [];
      const approachingGeofences: unknown[] = [];

      for (const geofence of (geofences || [])) {
        const R = 6371000;
        const lat1 = (geofence.center_lat * Math.PI) / 180;
        const lat2 = (latitude * Math.PI) / 180;
        const dLat = ((latitude - geofence.center_lat) * Math.PI) / 180;
        const dLon = ((longitude - geofence.center_lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        if (distance <= (geofence.radius_meters || 100)) {
          insideGeofences.push({ ...geofence, distance_meters: Math.round(distance) });
        } else {
          // Check approach triggers
          const { data: approachTrigger } = await supabase
            .from('geofence_triggers')
            .select('config')
            .eq('geofence_id', geofence.id)
            .eq('trigger_type', 'approach')
            .eq('is_active', true)
            .maybeSingle();

          if (approachTrigger) {
            const approachMeters = approachTrigger.config?.approach_meters || 500;
            const totalRadius = (geofence.radius_meters || 100) + approachMeters;
            if (distance <= totalRadius) {
              approachingGeofences.push({
                ...geofence,
                distance_meters: Math.round(distance),
                approach_config: approachTrigger.config,
              });
            }
          }
        }
      }

      return jsonResponse({
        inside_geofences: insideGeofences,
        approaching_geofences: approachingGeofences,
        count: insideGeofences.length,
      });
    }

    // ACTION: Record a geofence event (entry/exit/dwell/approach/first_time/return_inactivity/low_traffic)
    if (action === 'record_event') {
      if (!business_id || !geofence_id || !customer_id) {
        return errorResponse('Missing required fields: business_id, geofence_id, customer_id', 400);
      }

      const {
        event_type = 'entry',
        trigger_type,
        dwell_seconds,
        customer_name,
        action_triggered,
        result,
        metadata = {},
      } = body;

      const { data: event, error: eventError } = await supabase
        .from('geofence_events')
        .insert({
          business_id,
          geofence_id,
          customer_id,
          event_type,
          trigger_type: trigger_type || event_type,
          latitude,
          longitude,
          dwell_seconds: dwell_seconds || null,
          customer_name: customer_name || 'Anónimo',
          action_triggered: action_triggered || null,
          result: result || 'pending',
          metadata,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (eventError) return errorResponse(eventError.message);

      // Update hourly stats for entry events
      if (event_type === 'entry' || event_type === 'entrada') {
        const now = new Date();
        await supabase.rpc('upsert_geofence_hourly_stat', {
          p_business_id: business_id,
          p_geofence_id: geofence_id,
          p_stat_date: now.toISOString().split('T')[0],
          p_hour_of_day: now.getHours(),
        });
      }

      // Update trigger stats
      const effectiveTrigger = trigger_type || event_type;
      await supabase.rpc('upsert_geofence_trigger_stat', {
        p_business_id: business_id,
        p_geofence_id: geofence_id,
        p_trigger_type: effectiveTrigger,
        p_stat_date: new Date().toISOString().split('T')[0],
        p_fires_count: 1,
        p_push_sent: action_triggered ? 1 : 0,
        p_push_opened: result === 'opened' ? 1 : 0,
        p_coupon_delivered: action_triggered?.includes('cupón') ? 1 : 0,
        p_coupon_redeemed: result === 'converted' ? 1 : 0,
        p_checkin_auto: action_triggered?.includes('Check-in') ? 1 : 0,
        p_conversion_count: result === 'converted' ? 1 : 0,
      });

      // Trigger push notification if entry event
      if (event_type === 'entry' || event_type === 'entrada') {
        const { data: triggers } = await supabase
          .from('geofence_triggers')
          .select('*')
          .eq('geofence_id', geofence_id)
          .eq('trigger_type', 'entry')
          .eq('is_active', true);

        for (const trig of (triggers || [])) {
          if (trig.config?.push_welcome) {
            await supabase.from('campaign_notifications').insert({
              business_id,
              customer_id,
              notification_type: 'geofence',
              title: 'PromoClub',
              message: trig.config?.welcome_message || '¡Estás cerca! Tenemos algo especial para ti.',
              status: 'pending',
              metadata: { geofence_id, event_id: event?.id, trigger_id: trig.id },
              created_at: new Date().toISOString(),
            }).catch(() => {});
          }
        }
      }

      return jsonResponse({ success: true, event });
    }

    // ACTION: Get geofence analytics for a business
    if (action === 'get_analytics') {
      if (!business_id) return errorResponse('Missing required field: business_id', 400);

      const { period = '30d' } = body;
      const daysMap: Record<string, number> = { today: 1, week: 7, month: 30, '90d': 90 };
      const days = daysMap[period] || 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      // KPI counts
      const { data: events } = await supabase
        .from('geofence_events')
        .select('event_type, trigger_type, created_at, customer_id, result')
        .eq('business_id', business_id)
        .gte('created_at', since);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const entriesToday = events?.filter(
        (e) =>
          (e.event_type === 'entry' || e.event_type === 'entrada') &&
          new Date(e.created_at) >= todayStart
      ).length || 0;

      const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const uniqueClientsWeek = new Set(
        events
          ?.filter((e) => new Date(e.created_at) >= weekStart && e.customer_id)
          .map((e) => e.customer_id)
      ).size;

      const actionsThisMonth = events?.filter((e) => e.result && e.result !== 'pending').length || 0;
      const totalEntries = events?.filter(
        (e) => e.event_type === 'entry' || e.event_type === 'entrada'
      ).length || 0;
      const conversions = events?.filter((e) => e.result === 'converted').length || 0;
      const conversionRate = totalEntries > 0 ? ((conversions / totalEntries) * 100).toFixed(1) : '0.0';

      // Hourly stats
      const { data: hourlyStats } = await supabase
        .from('geofence_hourly_stats')
        .select('hour_of_day, entry_count')
        .eq('business_id', business_id)
        .gte('stat_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('hour_of_day');

      const hourlyAgg: Record<number, number> = {};
      for (const row of (hourlyStats || [])) {
        hourlyAgg[row.hour_of_day] = (hourlyAgg[row.hour_of_day] || 0) + row.entry_count;
      }

      // Trigger conversion stats
      const { data: triggerStats } = await supabase
        .from('geofence_trigger_stats')
        .select('trigger_type, fires_count, push_sent, push_opened, coupon_delivered, coupon_redeemed, checkin_auto, conversion_count')
        .eq('business_id', business_id)
        .gte('stat_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      const triggerAgg: Record<string, { fires: number; sent: number; opened: number; coupon: number; redeemed: number; checkin: number; converted: number }> = {};
      for (const row of (triggerStats || [])) {
        if (!triggerAgg[row.trigger_type]) {
          triggerAgg[row.trigger_type] = { fires: 0, sent: 0, opened: 0, coupon: 0, redeemed: 0, checkin: 0, converted: 0 };
        }
        triggerAgg[row.trigger_type].fires += row.fires_count || 0;
        triggerAgg[row.trigger_type].sent += row.push_sent || 0;
        triggerAgg[row.trigger_type].opened += row.push_opened || 0;
        triggerAgg[row.trigger_type].coupon += row.coupon_delivered || 0;
        triggerAgg[row.trigger_type].redeemed += row.coupon_redeemed || 0;
        triggerAgg[row.trigger_type].checkin += row.checkin_auto || 0;
        triggerAgg[row.trigger_type].converted += row.conversion_count || 0;
      }

      return jsonResponse({
        kpis: {
          entries_today: entriesToday,
          unique_clients_week: uniqueClientsWeek,
          actions_month: actionsThisMonth,
          conversion_rate: parseFloat(conversionRate),
        },
        hourly_data: hourlyAgg,
        trigger_stats: triggerAgg,
      });
    }

    // ACTION: Get recent events log
    if (action === 'get_events_log') {
      if (!business_id) return errorResponse('Missing required field: business_id', 400);

      const { limit = 50, event_type_filter, search } = body;

      let query = supabase
        .from('geofence_events')
        .select('id, event_type, trigger_type, customer_id, customer_name, action_triggered, result, created_at, metadata')
        .eq('business_id', business_id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (event_type_filter && event_type_filter !== 'all') {
        query = query.eq('event_type', event_type_filter);
      }

      const { data: events, error } = await query;
      if (error) return errorResponse(error.message);

      return jsonResponse({ events: events || [] });
    }

    // ACTION: Save trigger configuration
    if (action === 'save_triggers') {
      if (!business_id || !geofence_id) {
        return errorResponse('Missing required fields: business_id, geofence_id', 400);
      }

      const { triggers } = body;
      if (!Array.isArray(triggers)) {
        return errorResponse('triggers must be an array', 400);
      }

      const results = [];
      for (const trig of triggers) {
        const { data, error } = await supabase
          .from('geofence_triggers')
          .upsert({
            geofence_id,
            business_id,
            trigger_type: trig.trigger_type,
            is_active: trig.is_active,
            config: trig.config || {},
            updated_at: new Date().toISOString(),
          }, { onConflict: 'geofence_id,trigger_type' })
          .select()
          .single();

        if (!error) results.push(data);
      }

      return jsonResponse({ success: true, saved: results.length });
    }

    // ACTION: Save frequency config
    if (action === 'save_frequency_config') {
      if (!business_id) return errorResponse('Missing required field: business_id', 400);

      const { config } = body;

      const { data, error } = await supabase
        .from('geofence_frequency_config')
        .upsert({
          business_id,
          max_actions_per_day: config.max_actions_per_day || 1,
          max_actions_per_week: config.max_actions_per_week || 3,
          grace_period_hours: config.grace_period_hours || 4,
          cross_channel_exclusion: config.cross_channel_exclusion || false,
          cross_channel_hours: config.cross_channel_hours || 6,
          cross_channel_channels: config.cross_channel_channels || ['push'],
          respect_business_hours: config.respect_business_hours !== false,
          geo_conquesting_enabled: config.geo_conquesting_enabled || false,
          geo_conquesting_radius_meters: config.geo_conquesting_radius_meters || 100,
          geo_conquesting_message: config.geo_conquesting_message || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'business_id' })
        .select()
        .single();

      if (error) return errorResponse(error.message);
      return jsonResponse({ success: true, config: data });
    }

    return errorResponse('Unknown action', 400);
  } catch (err) {
    console.error('geofencing error:', err);
    return errorResponse(err instanceof Error ? err.message : String(err));
  }
});
