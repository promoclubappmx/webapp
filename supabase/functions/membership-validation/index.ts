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
    const { action, business_id, customer_id, subscription_id } = body;

    // ACTION: Validate membership access for a customer
    if (action === 'validate_access') {
      if (!business_id || !customer_id) {
        return errorResponse('Missing required fields: business_id, customer_id', 400);
      }

      const { data: subscription } = await supabase
        .from('membership_subscriptions')
        .select('*, membership_programs(*)')
        .eq('business_id', business_id)
        .eq('customer_id', customer_id)
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .single();

      if (!subscription) {
        return jsonResponse({ has_access: false, reason: 'no_active_membership' });
      }

      return jsonResponse({
        has_access: true,
        subscription_id: subscription.id,
        program: subscription.membership_programs,
        expires_at: subscription.expires_at,
        benefits: subscription.membership_programs?.benefits || [],
      });
    }

    // ACTION: Record a membership consumption/benefit usage
    if (action === 'record_consumption') {
      const { benefit_type, amount, description } = body;

      if (!subscription_id || !benefit_type) {
        return errorResponse('Missing required fields: subscription_id, benefit_type', 400);
      }

      const { data: subscription } = await supabase
        .from('membership_subscriptions')
        .select('*, membership_programs(*)')
        .eq('id', subscription_id)
        .single();

      if (!subscription) return errorResponse('Subscription not found', 404);
      if (subscription.status !== 'active') return errorResponse('Subscription is not active', 400);

      // Check consumption limits if applicable
      const program = subscription.membership_programs;
      if (program?.monthly_limit && benefit_type === 'visit') {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const { count } = await supabase
          .from('membership_consumptions')
          .select('*', { count: 'exact', head: true })
          .eq('subscription_id', subscription_id)
          .eq('benefit_type', 'visit')
          .gte('created_at', monthStart.toISOString());

        if ((count || 0) >= program.monthly_limit) {
          return jsonResponse({ success: false, reason: 'monthly_limit_reached', limit: program.monthly_limit });
        }
      }

      const { data: consumption, error } = await supabase
        .from('membership_consumptions')
        .insert({
          subscription_id,
          business_id: subscription.business_id,
          customer_id: subscription.customer_id,
          benefit_type,
          amount: amount || null,
          description: description || null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) return errorResponse(error.message);
      return jsonResponse({ success: true, consumption });
    }

    // ACTION: Subscribe a customer to a membership program
    if (action === 'subscribe') {
      const { program_id, payment_method, payment_reference } = body;

      if (!business_id || !customer_id || !program_id) {
        return errorResponse('Missing required fields: business_id, customer_id, program_id', 400);
      }

      const { data: program } = await supabase
        .from('membership_programs')
        .select('*')
        .eq('id', program_id)
        .eq('business_id', business_id)
        .single();

      if (!program) return errorResponse('Membership program not found', 404);

      // Calculate expiration
      const now = new Date();
      const expiresAt = new Date(now);
      if (program.billing_cycle === 'monthly') {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else if (program.billing_cycle === 'yearly') {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else if (program.billing_cycle === 'weekly') {
        expiresAt.setDate(expiresAt.getDate() + 7);
      }

      const { data: subscription, error } = await supabase
        .from('membership_subscriptions')
        .insert({
          business_id,
          customer_id,
          program_id,
          status: 'active',
          started_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          payment_method: payment_method || null,
          payment_reference: payment_reference || null,
          created_at: now.toISOString(),
        })
        .select()
        .single();

      if (error) return errorResponse(error.message);

      // Trigger welcome automation
      await supabase.functions.invoke('automation-webhook', {
        body: {
          action: 'trigger_event',
          business_id,
          event_type: 'membership_subscribed',
          customer_id,
          event_data: { program_id, subscription_id: subscription?.id },
        },
      });

      return jsonResponse({ success: true, subscription });
    }

    return errorResponse('Unknown action', 400);
  } catch (err) {
    console.error('membership-validation error:', err);
    return errorResponse(err.message);
  }
});
