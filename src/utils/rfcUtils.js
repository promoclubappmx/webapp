/**
 * RFC Utility Functions
 * Utilities for RFC validation and person type detection
 */

/**
 * Detect person type from RFC length
 * @param {string} rfc - RFC string
 * @returns {string|null} 'fisica' | 'moral' | null
 */
export const detectPersonType = (rfc) => {
  if (!rfc) return null;
  
  const cleanRfc = rfc?.trim()?.toUpperCase();
  
  if (cleanRfc?.length === 13) {
    return 'fisica'; // Persona Física
  } else if (cleanRfc?.length === 12) {
    return 'moral'; // Persona Moral
  }
  
  return null;
};

/**
 * Validate RFC format
 * @param {string} rfc - RFC string
 * @returns {Object} { valid: boolean, message: string, type: string|null }
 */
export const validateRFC = (rfc) => {
  if (!rfc) {
    return { valid: false, message: 'El RFC es obligatorio', type: null };
  }

  const cleanRfc = rfc?.trim()?.toUpperCase();
  const length = cleanRfc?.length;

  // RFC Persona Física: 13 caracteres (4 letras + 6 dígitos + 3 alfanuméricos)
  const rfcPersonaFisica = /^[A-Z]{4}\d{6}[A-Z0-9]{3}$/;
  // RFC Persona Moral: 12 caracteres (3 letras + 6 dígitos + 3 alfanuméricos)
  const rfcPersonaMoral = /^[A-Z]{3}\d{6}[A-Z0-9]{3}$/;

  if (length !== 12 && length !== 13) {
    return {
      valid: false,
      message: 'El RFC debe tener 12 caracteres (Persona Moral) o 13 (Persona Física)',
      type: null
    };
  }

  if (length === 13) {
    if (!rfcPersonaFisica?.test(cleanRfc)) {
      return {
        valid: false,
        message: 'RFC inválido. Formato Persona Física: 4 letras + 6 dígitos + 3 alfanuméricos',
        type: 'fisica'
      };
    }
    return { valid: true, message: '', type: 'fisica' };
  }

  if (length === 12) {
    if (!rfcPersonaMoral?.test(cleanRfc)) {
      return {
        valid: false,
        message: 'RFC inválido. Formato Persona Moral: 3 letras + 6 dígitos + 3 alfanuméricos',
        type: 'moral'
      };
    }
    return { valid: true, message: '', type: 'moral' };
  }

  return { valid: false, message: 'RFC inválido', type: null };
};

/**
 * Get person type label
 * @param {string} type - 'fisica' | 'moral'
 * @returns {string} Human-readable label
 */
export const getPersonTypeLabel = (type) => {
  const labels = {
    fisica: 'Persona Física',
    moral: 'Persona Moral'
  };
  return labels?.[type] || '';
};

export default {
  detectPersonType,
  validateRFC,
  getPersonTypeLabel
};