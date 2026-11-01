// Inline CORS headers to avoid bundling issues
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response>) => void;
  env: { get: (key: string) => string | undefined };
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

const COPOMEX_BASE_URL = 'https://api.copomex.com/query';

Deno.serve(async (req: Request) => {
  const corsResult = handleCors(req);
  if (corsResult) return corsResult;

  try {
    // Read token from Supabase secret (set via: supabase secrets set COPOMEX_TOKEN=...)
    const COPOMEX_TOKEN = Deno.env.get('COPOMEX_TOKEN') || '';

    const url = new URL(req.url);
    const postalCode = url.searchParams.get('cp');

    if (!postalCode || !/^\d{5}$/.test(postalCode)) {
      return errorResponse('Código postal inválido. Debe tener 5 dígitos', 400);
    }

    if (!COPOMEX_TOKEN) {
      console.error('COPOMEX_TOKEN secret not configured in Supabase');
      return errorResponse('Token de COPOMEX no configurado', 500);
    }

    const apiUrl = `${COPOMEX_BASE_URL}/info_cp/${postalCode}?token=${COPOMEX_TOKEN}`;
    console.log(`Fetching COPOMEX: ${COPOMEX_BASE_URL}/info_cp/${postalCode}?token=***`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`COPOMEX API error ${response.status}: ${body}`);
      return errorResponse(`Error del servidor COPOMEX: ${response.status}`, response.status);
    }

    const data = await response.json();
    console.log('COPOMEX response received, items:', Array.isArray(data) ? data.length : 'not array');

    return jsonResponse(data);
  } catch (error) {
    console.error('COPOMEX proxy error:', error);
    return errorResponse(`Error al consultar COPOMEX: ${error.message}`, 500);
  }
});
