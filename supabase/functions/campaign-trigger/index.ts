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
    const { action, business_id, campaign_id } = body;

    // ACTION: Launch/activate a campaign and schedule notifications
    if (action === 'launch') {
      if (!business_id || !campaign_id) {
        return errorResponse('Missing required fields: business_id, campaign_id', 400);
      }

      const { data: campaign } = await supabase
        .from('promotions')
        .select('*')
        .eq('id', campaign_id)
        .eq('business_id', business_id)
        .single();

      if (!campaign) return errorResponse('Campaign not found', 404);

      // Update campaign status to active
      await supabase
        .from('promotions')
        .update({ status: 'active', activated_at: new Date().toISOString() })
        .eq('id', campaign_id);

      // Get target audience
      let customerIds: string[] = [];
      if (campaign.target_segment_id) {
        const { data: assignments } = await supabase
          .from('customer_segment_assignments')
          .select('customer_id')
          .eq('segment_id', campaign.target_segment_id);
        customerIds = (assignments || []).map((a) => a.customer_id);
      } else {
        // All customers of the business
        const { data: customers } = await supabase
          .from('customer_profiles')
          .select('id')
          .eq('business_id', business_id);
        customerIds = (customers || []).map((c) => c.id);
      }

      // Create notifications for all target customers
      if (customerIds.length > 0) {
        const notifications = customerIds.map((cid) => ({
          business_id,
          customer_id: cid,
          notification_type: 'campaign',
          title: campaign.title || campaign.name,
          message: campaign.description || 'Nueva promoción disponible',
          status: 'pending',
          metadata: { campaign_id, campaign_type: campaign.promotion_type },
          created_at: new Date().toISOString(),
        }));

        await supabase.from('campaign_notifications').insert(notifications);
      }

      return jsonResponse({
        success: true,
        campaign_id,
        customers_notified: customerIds.length,
      });
    }

    // ACTION: Track campaign performance metrics
    if (action === 'track_metric') {
      const { metric_type, customer_id, value = 1 } = body;

      if (!campaign_id || !metric_type) {
        return errorResponse('Missing required fields: campaign_id, metric_type', 400);
      }

      // Log the metric event
      await supabase.from('automation_execution_log').insert({
        rule_id: campaign_id,
        business_id,
        customer_id: customer_id || null,
        event_type: `campaign_${metric_type}`,
        event_data: { campaign_id, metric_type, value },
        status: 'success',
        executed_at: new Date().toISOString(),
      });

      return jsonResponse({ success: true, metric_type, value });
    }

    // ACTION: Get campaign performance summary
    if (action === 'get_performance') {
      if (!campaign_id) return errorResponse('Missing required field: campaign_id', 400);

      const { data: notifications } = await supabase
        .from('campaign_notifications')
        .select('status, created_at')
        .eq('metadata->>campaign_id', campaign_id);

      const total = notifications?.length || 0;
      const sent = notifications?.filter((n) => n.status === 'sent').length || 0;
      const read = notifications?.filter((n) => n.status === 'read').length || 0;

      return jsonResponse({
        campaign_id,
        total_sent: total,
        delivered: sent,
        opened: read,
        open_rate: total > 0 ? Math.round((read / total) * 100) : 0,
      });
    }

    return errorResponse('Unknown action', 400);
  } catch (err) {
    console.error('campaign-trigger error:', err);
    return errorResponse(err.message);
  }
});
