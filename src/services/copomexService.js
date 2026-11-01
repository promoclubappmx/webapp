/**
 * COPOMEX API Service
 * Primary: Supabase Edge Function proxy (copomex-proxy) — token stored as Supabase secret.
 * Fallback: Direct call to COPOMEX API using VITE_COPOMEX_TOKEN env variable.
 */

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY;
const PROXY_URL = `${SUPABASE_URL}/functions/v1/copomex-proxy`;
const COPOMEX_TOKEN = import.meta.env?.VITE_COPOMEX_TOKEN || '076eac35-f150-43e8-88ca-21f2cb8d50cd';
const COPOMEX_DIRECT_URL = 'https://api.copomex.com/query';

/**
 * Parse raw COPOMEX API response (array or single object) into normalized array
 */
const parseRawCopomexData = (data, postalCode) => {
  if (Array.isArray(data)) {
    if (data?.length === 0) {
      throw new Error('No se encontró información para este código postal');
    }
    if (data?.[0]?.error === true) {
      throw new Error(data[0]?.error_message || 'Código postal no encontrado');
    }
    return data?.map((item) => ({
      cp: item?.response?.cp || postalCode,
      asentamiento: item?.response?.asentamiento || '',
      tipoAsentamiento: item?.response?.tipo_asentamiento || '',
      municipio: item?.response?.municipio || '',
      estado: item?.response?.estado || '',
      ciudad: item?.response?.ciudad || '',
      pais: item?.response?.pais || 'México',
    }));
  }

  if (data && typeof data === 'object') {
    if (data?.error === true) {
      throw new Error(data.error_message || 'Código postal no encontrado');
    }
    const resp = data?.response || data;
    const asentamientos = Array.isArray(resp?.asentamiento)
      ? resp?.asentamiento
      : [resp?.asentamiento]?.filter(Boolean);

    if (asentamientos?.length === 0) {
      throw new Error('No se encontró información para este código postal');
    }

    return asentamientos?.map((asentamiento) => ({
      cp: resp?.cp || postalCode,
      asentamiento,
      tipoAsentamiento: resp?.tipo_asentamiento || '',
      municipio: resp?.municipio || '',
      estado: resp?.estado || '',
      ciudad: resp?.ciudad || '',
      pais: resp?.pais || 'México',
    }));
  }

  throw new Error('Formato de respuesta inesperado del servicio de códigos postales');
};

/**
 * Direct call to COPOMEX API (fallback when proxy is unavailable)
 */
const getAddressByPostalCodeDirect = async (postalCode) => {
  const apiUrl = `${COPOMEX_DIRECT_URL}/info_cp/${postalCode}?token=${COPOMEX_TOKEN}`;
  let response;
  try {
    response = await fetch(apiUrl, { method: 'GET' });
  } catch (networkError) {
    throw new Error('No se pudo conectar con el servicio de códigos postales');
  }

  if (!response?.ok) {
    throw new Error(`Error del servidor COPOMEX: ${response.status}`);
  }

  let data;
  try {
    data = await response?.json();
  } catch {
    throw new Error('Respuesta inválida del servicio de códigos postales');
  }

  return parseRawCopomexData(data, postalCode);
};

/**
 * Get address information from postal code
 * @param {string} postalCode - 5-digit postal code
 * @returns {Promise<Array>} Array of address objects (one per colonia)
 */
export const getAddressByPostalCode = async (postalCode) => {
  if (!postalCode || !/^\d{5}$/?.test(postalCode)) {
    throw new Error('Código postal inválido. Debe tener 5 dígitos');
  }

  // Try proxy first
  try {
    let response = await fetch(`${PROXY_URL}?cp=${postalCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    // If proxy returns 500 (token not configured), fall back to direct call
    if (response?.status === 500) {
      console.warn('COPOMEX proxy returned 500, falling back to direct API call');
      return await getAddressByPostalCodeDirect(postalCode);
    }

    if (!response?.ok) {
      const errBody = await response?.text()?.catch(() => '');
      console.error(`COPOMEX proxy error ${response?.status}: ${errBody}`);
      // Fall back to direct for any proxy error
      return await getAddressByPostalCodeDirect(postalCode);
    }

    let data;
    try {
      data = await response?.json();
    } catch {
      throw new Error('Respuesta inválida del servicio de códigos postales');
    }

    return parseRawCopomexData(data, postalCode);
  } catch (error) {
    // If it's already a meaningful error (not a network/proxy error), rethrow
    if (
      error?.message?.includes('No se encontró') ||
      error?.message?.includes('Código postal no encontrado') ||
      error?.message?.includes('Código postal inválido') ||
      error?.message?.includes('Formato de respuesta')
    ) {
      throw error;
    }
    // Otherwise try direct fallback
    console.warn('COPOMEX proxy failed, trying direct API:', error?.message);
    return await getAddressByPostalCodeDirect(postalCode);
  }
};

/**
 * Get unique colonias from address data
 * @param {Array} addresses - Array of address objects
 * @returns {Array} Array of unique colonia names
 */
export const getColoniasFromAddresses = (addresses) => {
  if (!Array.isArray(addresses) || addresses?.length === 0) return [];
  return [...new Set(addresses.map((addr) => addr?.asentamiento).filter(Boolean))];
};

/**
 * Parse COPOMEX data to form format
 * @param {Object} addressData - Single address object from COPOMEX
 * @returns {Object} Parsed form data
 */
export const parseAddressToFormData = (addressData) => ({
  codigoPostal: addressData?.cp || '',
  colonia: addressData?.asentamiento || '',
  municipio: addressData?.municipio || '',
  ciudad: addressData?.ciudad || addressData?.municipio || '',
  estado: addressData?.estado || '',
  pais: addressData?.pais || 'México',
});

export default {
  getAddressByPostalCode,
  getColoniasFromAddresses,
  parseAddressToFormData,
};