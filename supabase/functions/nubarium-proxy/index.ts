import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Inline CORS headers to avoid bundling issues
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

declare const Deno: { env: { get(key: string): string | undefined } };

const NUBARIUM_API_URL = (typeof Deno !== 'undefined' ? Deno?.env?.get('NUBARIUM_API_URL') : undefined) || (typeof Deno !== 'undefined' ? Deno?.env?.get('VITE_NUBARIUM_API_URL') : undefined);
const NUBARIUM_USERNAME = (typeof Deno !== 'undefined' ? Deno?.env?.get('NUBARIUM_USERNAME') : undefined) || (typeof Deno !== 'undefined' ? Deno?.env?.get('VITE_NUBARIUM_USERNAME') : undefined) || 'docubox';
const NUBARIUM_PASSWORD = (typeof Deno !== 'undefined' ? Deno?.env?.get('NUBARIUM_PASSWORD') : undefined) || (typeof Deno !== 'undefined' ? Deno?.env?.get('VITE_NUBARIUM_PASSWORD') : undefined) || 'QwEdJEnMd';
const SUPABASE_URL = typeof Deno !== 'undefined' ? Deno?.env?.get('SUPABASE_URL') : undefined;
const SUPABASE_SERVICE_ROLE_KEY = typeof Deno !== 'undefined' ? Deno?.env?.get('SUPABASE_SERVICE_ROLE_KEY') : undefined;

serve(async (req) => {
  if (req?.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req?.json();
    const { action } = body;

    const credentials = btoa(`${NUBARIUM_USERNAME}:${NUBARIUM_PASSWORD}`);

    // CURP validation action
    if (action === 'validate_curp') {
      const { curp } = body;

      if (!curp) {
        return new Response(
          JSON.stringify({ error: 'Missing required field: curp' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const response = await fetch('https://curp.nubarium.com/renapo/v3/valida_curp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ curp })
      });

      const data = await response?.json();

      // Save to curp_validation_log if we have Supabase credentials
      if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        try {
          const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
          
          // Extract user_id from JWT if present
          let userId = null;
          const authHeader = req?.headers?.get('Authorization');
          if (authHeader) {
            const { data: userData } = await supabase?.auth?.getUser(authHeader?.replace('Bearer ', ''));
            userId = userData?.user?.id || null;
          }

          await supabase?.from('curp_validation_log')?.insert({
            curp_consultada: curp,
            user_id: userId,
            estatus: data?.estatus || null,
            codigo_validacion: data?.codigoValidacion || null,
            curp_respuesta: data?.curp || null,
            nombre: data?.nombre || null,
            apellido_paterno: data?.apellidoPaterno || null,
            apellido_materno: data?.apellidoMaterno || null,
            sexo: data?.sexo || null,
            fecha_nacimiento: data?.fechaNacimiento || null,
            pais_nacimiento: data?.paisNacimiento || null,
            estado_nacimiento: data?.estadoNacimiento || null,
            estatus_curp: data?.estatusCurp || null,
            codigo_mensaje: data?.codigoMensaje || null,
            doc_probatorio: data?.docProbatorio || null,
            datos_doc_probatorio: data?.datosDocProbatorio || null,
            datos_adicionales: {
              raw_response: data,
              timestamp: new Date()?.toISOString()
            }
          });
        } catch (logError) {
          console.error('Error saving CURP log:', logError);
          // Don't fail the main request if logging fails
        }
      }

      return new Response(
        JSON.stringify(data),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // RFC validation action - get name from RFC via SAT
    if (action === 'validate_rfc') {
      const { rfc } = body;

      if (!rfc) {
        return new Response(
          JSON.stringify({ error: 'Missing required field: rfc' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const response = await fetch('https://sat.nubarium.com/sat/v1/obtener-razonsocial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ rfc })
      });

      const data = await response?.json();

      return new Response(
        JSON.stringify(data),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // CSF/CIF extraction action (default / legacy)
    const { documento, tipo } = body;

    if (!documento || !tipo) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: documento and tipo' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!NUBARIUM_API_URL) {
      return new Response(
        JSON.stringify({ error: 'Nubarium API URL not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const response = await fetch(`${NUBARIUM_API_URL}/consultar_cif`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({ documento, tipo })
    });

    const data = await response?.json();

    return new Response(
      JSON.stringify(data),
      {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Nubarium proxy error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});