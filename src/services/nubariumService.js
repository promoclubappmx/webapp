/**
 * Nubarium API Service
 * Service to extract fiscal data from CSF (Constancia de Situación Fiscal) PDF
 */

const NUBARIUM_API_URL = import.meta.env?.VITE_NUBARIUM_API_URL;
const NUBARIUM_USERNAME = import.meta.env?.VITE_NUBARIUM_USERNAME;
const NUBARIUM_PASSWORD = import.meta.env?.VITE_NUBARIUM_PASSWORD;
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY;

/**
 * Convert file to base64
 * @param {File} file - PDF file
 * @returns {Promise<string>} Base64 encoded string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove data:application/pdf;base64, prefix
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Extract fiscal data from CSF PDF
 * @param {File} pdfFile - PDF file of CSF
 * @returns {Promise<Object>} Extracted fiscal data
 */
export const extractCSFData = async (pdfFile) => {
  try {
    // Validate file type
    if (pdfFile?.type !== 'application/pdf') {
      throw new Error('El archivo debe ser un PDF');
    }

    // Validate file size (max 5MB)
    if (pdfFile?.size > 5 * 1024 * 1024) {
      throw new Error('El archivo no debe exceder 5MB');
    }

    // Convert to base64
    const base64Document = await fileToBase64(pdfFile);

    // Call Supabase Edge Function proxy (bypasses CORS)
    const response = await fetch(`${SUPABASE_URL}/functions/v1/nubarium-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        documento: base64Document,
        tipo: 'pdf'
      })
    });

    if (!response?.ok) {
      const errorData = await response?.json()?.catch(() => ({}));
      throw new Error(errorData?.error || errorData?.message || `Error del servidor: ${response.status}`);
    }

    const data = await response?.json();

    // Validate response status
    if (data?.estatus !== 'OK') {
      throw new Error(data?.mensaje || 'No se pudo extraer la información del CSF');
    }

    return data;
  } catch (error) {
    console.error('Error extracting CSF data:', error);
    
    // Provide user-friendly error messages
    if (error?.message?.includes('fetch')) {
      throw new Error('Error de conexión. Por favor, verifica tu conexión a internet o intenta más tarde.');
    }
    
    throw error;
  }
};

/**
 * Parse Nubarium response to form data format
 * @param {Object} nubariumData - Response from Nubarium API
 * @returns {Object} Parsed form data
 */
export const parseCSFToFormData = (nubariumData) => {
  const isPersonaMoral = nubariumData?.rfc?.length === 12;
  const isPersonaFisica = nubariumData?.rfc?.length === 13;

  const formData = {
    rfc: nubariumData?.rfc || '',
    cif: nubariumData?.cif || '',
  };

  // Persona Moral (12 characters)
  if (isPersonaMoral) {
    formData.tipoPersona = 'moral';
    formData.razonSocial = nubariumData?.datosIdentificacion?.razonSocial || '';
    formData.regimenCapital = nubariumData?.datosIdentificacion?.regimenCapital || '';
    formData.fechaConstitucion = nubariumData?.datosIdentificacion?.fechaConstitucion || '';
  }
  // Persona Física (13 characters)
  else if (isPersonaFisica) {
    formData.tipoPersona = 'fisica';
    formData.nombres = nubariumData?.datosIdentificacion?.nombres || '';
    formData.apellidoPaterno = nubariumData?.datosIdentificacion?.apellidoPaterno || '';
    formData.apellidoMaterno = nubariumData?.datosIdentificacion?.apellidoMaterno || '';
    formData.curp = nubariumData?.datosIdentificacion?.curp || '';
    formData.fechaNacimiento = nubariumData?.datosIdentificacion?.fechaNacimiento || '';
  }

  // Common fields
  formData.fechaInicioOperaciones = nubariumData?.datosIdentificacion?.fechaInicioOperaciones || '';
  formData.situacionContribuyente = nubariumData?.datosIdentificacion?.situacionContribuyente || '';

  // Fiscal address (domicilio fiscal)
  if (nubariumData?.datosUbicacion) {
    formData.domicilioFiscal = {
      entidadFederativa: nubariumData?.datosUbicacion?.entidadFederativa || '',
      municipioDelegacion: nubariumData?.datosUbicacion?.municipioDelegacion || '',
      colonia: nubariumData?.datosUbicacion?.colonia || '',
      tipoVialidad: nubariumData?.datosUbicacion?.tipoVialidad || '',
      nombreVialidad: nubariumData?.datosUbicacion?.nombreVialidad || '',
      numeroExterior: nubariumData?.datosUbicacion?.numeroExterior || '',
      numeroInterior: nubariumData?.datosUbicacion?.numeroInterior || '',
      cp: nubariumData?.datosUbicacion?.cp || '',
      correoElectronico: nubariumData?.datosUbicacion?.correoElectronico || ''
    };
  }

  // Fiscal regime (régimen fiscal)
  if (nubariumData?.caracteristicasFiscales && nubariumData?.caracteristicasFiscales?.length > 0) {
    // Get the most recent regime (first in array)
    formData.regimenFiscalDescripcion = nubariumData?.caracteristicasFiscales?.[0]?.regimen || '';
    formData.regimenFiscalFechaAlta = nubariumData?.caracteristicasFiscales?.[0]?.fechaAlta || '';
    formData.todosRegimenes = nubariumData?.caracteristicasFiscales || [];
  }

  return formData;
};

export default {
  extractCSFData,
  parseCSFToFormData,
  fileToBase64
};