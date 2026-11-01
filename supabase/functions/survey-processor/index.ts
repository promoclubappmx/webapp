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
    const { action, business_id, survey_id, customer_id } = body;

    // ACTION: Send a survey to a customer
    if (action === 'send') {
      if (!business_id || !survey_id || !customer_id) {
        return errorResponse('Missing required fields: business_id, survey_id, customer_id', 400);
      }

      // Check if survey exists and is active
      const { data: survey } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', survey_id)
        .eq('business_id', business_id)
        .single();

      if (!survey) return errorResponse('Survey not found', 404);
      if (!survey.is_active) return errorResponse('Survey is not active', 400);

      // Check if customer already received this survey recently
      const { data: existingResponse } = await supabase
        .from('survey_responses')
        .select('id')
        .eq('survey_id', survey_id)
        .eq('customer_id', customer_id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .single();

      if (existingResponse) {
        return jsonResponse({ success: false, reason: 'already_sent_recently' });
      }

      // Create a notification to deliver the survey
      await supabase.from('campaign_notifications').insert({
        business_id,
        customer_id,
        notification_type: 'survey',
        title: survey.title,
        message: survey.description || 'Tienes una encuesta pendiente',
        status: 'sent',
        metadata: { survey_id, survey_type: survey.survey_type },
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });

      return jsonResponse({ success: true, survey_id, customer_id });
    }

    // ACTION: Submit survey responses
    if (action === 'submit_response') {
      const { responses, nps_score } = body;

      if (!survey_id || !customer_id || !responses) {
        return errorResponse('Missing required fields: survey_id, customer_id, responses', 400);
      }

      const { data: responseRecord, error } = await supabase
        .from('survey_responses')
        .insert({
          survey_id,
          customer_id,
          business_id,
          responses,
          nps_score: nps_score || null,
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) return errorResponse(error.message);

      // If NPS survey, also save to nps_responses
      if (nps_score !== undefined && business_id) {
        await supabase.from('nps_responses').insert({
          business_id,
          customer_id,
          score: nps_score,
          survey_id,
          response_data: responses,
          created_at: new Date().toISOString(),
        });
      }

      // Trigger automation for survey completion
      await supabase.functions.invoke('automation-webhook', {
        body: {
          action: 'trigger_event',
          business_id,
          event_type: 'survey_completed',
          customer_id,
          event_data: { survey_id, nps_score },
        },
      });

      return jsonResponse({ success: true, response_id: responseRecord?.id });
    }

    // ACTION: Get survey results/analytics
    if (action === 'get_results') {
      if (!survey_id) return errorResponse('Missing required field: survey_id', 400);

      const { data: responses, error } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('survey_id', survey_id)
        .order('created_at', { ascending: false });

      if (error) return errorResponse(error.message);

      const totalResponses = responses?.length || 0;
      const npsScores = responses?.filter((r) => r.nps_score !== null).map((r) => r.nps_score) || [];
      const avgNps = npsScores.length > 0 ? npsScores.reduce((a, b) => a + b, 0) / npsScores.length : null;

      return jsonResponse({
        total_responses: totalResponses,
        avg_nps: avgNps ? Math.round(avgNps * 10) / 10 : null,
        responses,
      });
    }

    return errorResponse('Unknown action', 400);
  } catch (err) {
    console.error('survey-processor error:', err);
    return errorResponse(err.message);
  }
});
