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
    const { action, business_id, rule_id, event_type, customer_id, event_data = {} } = body;

    // ACTION: Trigger automation rules based on an event
    if (action === 'trigger_event') {
      if (!business_id || !event_type) {
        return errorResponse('Missing required fields: business_id, event_type', 400);
      }

      // Find matching automation rules
      const { data: rules } = await supabase
        .from('engagement_automation_rules')
        .select('*')
        .eq('business_id', business_id)
        .eq('trigger_event', event_type)
        .eq('is_active', true);

      const executionResults: unknown[] = [];

      for (const rule of (rules || [])) {
        try {
          // Check conditions
          let conditionsMet = true;
          if (rule.conditions && typeof rule.conditions === 'object') {
            for (const [key, value] of Object.entries(rule.conditions)) {
              if (event_data[key] !== value) {
                conditionsMet = false;
                break;
              }
            }
          }

          if (!conditionsMet) continue;

          // Execute actions
          const actions = rule.actions || [];
          for (const ruleAction of actions) {
            if (ruleAction.type === 'send_notification' && customer_id) {
              await supabase.from('campaign_notifications').insert({
                business_id,
                customer_id,
                notification_type: 'automation',
                title: ruleAction.title || 'Notificación',
                message: ruleAction.message || '',
                status: 'sent',
                metadata: { rule_id: rule.id, event_type, event_data },
                sent_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
              });
            } else if (ruleAction.type === 'award_points' && customer_id) {
              const points = ruleAction.points || 0;
              if (points > 0) {
                await supabase.from('loyalty_transactions').insert({
                  business_id,
                  customer_id,
                  transaction_type: 'earn',
                  points,
                  source: 'automation',
                  reference_id: rule.id,
                  description: `Automatización: ${rule.name}`,
                  created_at: new Date().toISOString(),
                });
              }
            } else if (ruleAction.type === 'assign_segment' && customer_id) {
              await supabase.from('customer_segment_assignments').upsert({
                customer_id,
                segment_id: ruleAction.segment_id,
                assigned_at: new Date().toISOString(),
              });
            }
          }

          // Log execution
          const { data: logEntry } = await supabase
            .from('automation_execution_log')
            .insert({
              rule_id: rule.id,
              business_id,
              customer_id: customer_id || null,
              event_type,
              event_data,
              status: 'success',
              executed_at: new Date().toISOString(),
            })
            .select()
            .single();

          executionResults.push({ rule_id: rule.id, rule_name: rule.name, status: 'executed', log_id: logEntry?.id });
        } catch (ruleError) {
          console.error(`Error executing rule ${rule.id}:`, ruleError);
          await supabase.from('automation_execution_log').insert({
            rule_id: rule.id,
            business_id,
            customer_id: customer_id || null,
            event_type,
            event_data,
            status: 'error',
            error_message: ruleError.message,
            executed_at: new Date().toISOString(),
          });
          executionResults.push({ rule_id: rule.id, status: 'error', error: ruleError.message });
        }
      }

      return jsonResponse({ success: true, rules_triggered: executionResults.length, results: executionResults });
    }

    // ACTION: Test a specific automation rule
    if (action === 'test_rule') {
      if (!rule_id || !customer_id) {
        return errorResponse('Missing required fields: rule_id, customer_id', 400);
      }

      const { data: rule } = await supabase
        .from('engagement_automation_rules')
        .select('*')
        .eq('id', rule_id)
        .single();

      if (!rule) return errorResponse('Rule not found', 404);

      return jsonResponse({
        success: true,
        rule,
        test_mode: true,
        message: 'Rule would execute with the provided customer_id',
      });
    }

    // ACTION: Get execution logs for a business
    if (action === 'get_logs') {
      if (!business_id) return errorResponse('Missing required field: business_id', 400);

      const { data: logs, error } = await supabase
        .from('automation_execution_log')
        .select('*')
        .eq('business_id', business_id)
        .order('executed_at', { ascending: false })
        .limit(100);

      if (error) return errorResponse(error.message);
      return jsonResponse({ logs });
    }

    return errorResponse('Unknown action', 400);
  } catch (err) {
    console.error('automation-webhook error:', err);
    return errorResponse(err.message);
  }
});
