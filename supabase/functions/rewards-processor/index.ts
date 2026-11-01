import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';

declare const Deno: { env: { get: (k: string) => string | undefined } };

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json();
    const { action, business_id, customer_id } = body;

    // ACTION: Award points to a customer
    if (action === 'award_points') {
      const { points, source, reference_id, description } = body;

      if (!business_id || !customer_id || !points) {
        return errorResponse('Missing required fields: business_id, customer_id, points', 400);
      }

      // Insert transaction
      const { data: transaction, error: txError } = await supabase
        .from('loyalty_transactions')
        .insert({
          business_id,
          customer_id,
          transaction_type: 'earn',
          points,
          source: source || 'manual',
          reference_id: reference_id || null,
          description: description || 'Puntos otorgados',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (txError) return errorResponse(txError.message);

      // Update balance
      const { data: existing } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('business_id', business_id)
        .eq('customer_id', customer_id)
        .single();

      if (existing) {
        await supabase
          .from('loyalty_points')
          .update({ balance: (existing.balance || 0) + points, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase.from('loyalty_points').insert({
          business_id,
          customer_id,
          balance: points,
          created_at: new Date().toISOString(),
        });
      }

      // Check VIP level upgrades
      const { data: loyaltyPoints } = await supabase
        .from('loyalty_points')
        .select('balance')
        .eq('business_id', business_id)
        .eq('customer_id', customer_id)
        .single();

      const newBalance = loyaltyPoints?.balance || points;

      const { data: vipLevels } = await supabase
        .from('vip_levels')
        .select('*')
        .eq('business_id', business_id)
        .lte('points_required', newBalance)
        .order('points_required', { ascending: false })
        .limit(1);

      if (vipLevels?.length) {
        await supabase.from('customer_vip_levels').upsert({
          business_id,
          customer_id,
          vip_level_id: vipLevels[0].id,
          assigned_at: new Date().toISOString(),
        });
      }

      return jsonResponse({ success: true, transaction, new_balance: newBalance });
    }

    // ACTION: Redeem points
    if (action === 'redeem_points') {
      const { points, reward_id, description } = body;

      if (!business_id || !customer_id || !points) {
        return errorResponse('Missing required fields: business_id, customer_id, points', 400);
      }

      // Check balance
      const { data: loyaltyPoints } = await supabase
        .from('loyalty_points')
        .select('balance')
        .eq('business_id', business_id)
        .eq('customer_id', customer_id)
        .single();

      if (!loyaltyPoints || loyaltyPoints.balance < points) {
        return jsonResponse({ success: false, reason: 'insufficient_points', balance: loyaltyPoints?.balance || 0 });
      }

      // Deduct points
      await supabase
        .from('loyalty_points')
        .update({ balance: loyaltyPoints.balance - points, updated_at: new Date().toISOString() })
        .eq('business_id', business_id)
        .eq('customer_id', customer_id);

      // Record transaction
      await supabase.from('loyalty_transactions').insert({
        business_id,
        customer_id,
        transaction_type: 'redeem',
        points: -points,
        source: 'redemption',
        reference_id: reward_id || null,
        description: description || 'Canje de puntos',
        created_at: new Date().toISOString(),
      });

      return jsonResponse({ success: true, points_redeemed: points, new_balance: loyaltyPoints.balance - points });
    }

    // ACTION: Get customer loyalty summary
    if (action === 'get_summary') {
      if (!business_id || !customer_id) {
        return errorResponse('Missing required fields: business_id, customer_id', 400);
      }

      const [pointsResult, transactionsResult, vipResult] = await Promise.all([
        supabase.from('loyalty_points').select('*').eq('business_id', business_id).eq('customer_id', customer_id).single(),
        supabase.from('loyalty_transactions').select('*').eq('business_id', business_id).eq('customer_id', customer_id).order('created_at', { ascending: false }).limit(20),
        supabase.from('customer_vip_levels').select('*, vip_levels(*)').eq('business_id', business_id).eq('customer_id', customer_id).single(),
      ]);

      return jsonResponse({
        balance: pointsResult.data?.balance || 0,
        transactions: transactionsResult.data || [],
        vip_level: vipResult.data?.vip_levels || null,
      });
    }

    return errorResponse('Unknown action', 400);
  } catch (err) {
    console.error('rewards-processor error:', err);
    return errorResponse(err.message);
  }
});
