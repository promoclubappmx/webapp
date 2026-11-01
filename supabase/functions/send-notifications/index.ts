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
    const { action, business_id, customer_id, notification_ids } = body;

    // ACTION: Send a push/in-app notification to a customer
    if (action === 'send') {
      const { title, message, notification_type = 'general', metadata = {} } = body;

      if (!business_id || !customer_id || !title || !message) {
        return errorResponse('Missing required fields: business_id, customer_id, title, message', 400);
      }

      const { data: notification, error } = await supabase
        .from('campaign_notifications')
        .insert({
          business_id,
          customer_id,
          notification_type,
          title,
          message,
          status: 'sent',
          metadata,
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) return errorResponse(error.message);
      return jsonResponse({ success: true, notification });
    }

    // ACTION: Send bulk notifications to a segment
    if (action === 'send_bulk') {
      const { segment_id, title, message, notification_type = 'campaign', metadata = {} } = body;

      if (!business_id || !title || !message) {
        return errorResponse('Missing required fields: business_id, title, message', 400);
      }

      let customerIds: string[] = [];

      if (segment_id) {
        const { data: assignments } = await supabase
          .from('customer_segment_assignments')
          .select('customer_id')
          .eq('segment_id', segment_id);
        customerIds = (assignments || []).map((a) => a.customer_id);
      } else if (Array.isArray(body.customer_ids)) {
        customerIds = body.customer_ids;
      }

      if (customerIds.length === 0) {
        return jsonResponse({ success: true, sent_count: 0, message: 'No customers to notify' });
      }

      const notifications = customerIds.map((cid) => ({
        business_id,
        customer_id: cid,
        notification_type,
        title,
        message,
        status: 'sent',
        metadata,
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('campaign_notifications').insert(notifications);
      if (error) return errorResponse(error.message);

      return jsonResponse({ success: true, sent_count: customerIds.length });
    }

    // ACTION: Mark notifications as read
    if (action === 'mark_read') {
      if (!notification_ids || !Array.isArray(notification_ids)) {
        return errorResponse('Missing required field: notification_ids (array)', 400);
      }

      const { error } = await supabase
        .from('campaign_notifications')
        .update({ status: 'read', read_at: new Date().toISOString() })
        .in('id', notification_ids);

      if (error) return errorResponse(error.message);
      return jsonResponse({ success: true });
    }

    // ACTION: Get unread notifications for a customer
    if (action === 'get_unread') {
      if (!business_id || !customer_id) {
        return errorResponse('Missing required fields: business_id, customer_id', 400);
      }

      const { data: notifications, error } = await supabase
        .from('campaign_notifications')
        .select('*')
        .eq('business_id', business_id)
        .eq('customer_id', customer_id)
        .neq('status', 'read')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) return errorResponse(error.message);
      return jsonResponse({ notifications, count: notifications?.length || 0 });
    }

    return errorResponse('Unknown action', 400);
  } catch (err) {
    console.error('send-notifications error:', err);
    return errorResponse(err.message);
  }
});
