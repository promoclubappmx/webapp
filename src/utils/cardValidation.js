/**
 * Card Validation Utilities
 * Luhn algorithm, card type detection, expiry validation
 */

/**
 * Luhn Algorithm for card number validation
 * @param {string} cardNumber - Card number to validate
 * @returns {boolean} - True if valid
 */
export const luhnCheck = (cardNumber) => {
  if (!cardNumber) return false;
  
  const cleaned = cardNumber?.replace(/\s/g, '');
  if (!/^\d+$/?.test(cleaned)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned?.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned?.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

/**
 * Detect card type from card number
 * @param {string} cardNumber - Card number
 * @returns {object} - Card type info {type, icon, maxLength}
 */
export const detectCardType = (cardNumber) => {
  const cleaned = cardNumber?.replace(/\s/g, '');
  
  // Visa: starts with 4
  if (/^4/?.test(cleaned)) {
    return { type: 'Visa', icon: 'CreditCard', maxLength: 16, cvvLength: 3 };
  }
  
  // Mastercard: starts with 51-55 or 2221-2720
  if (/^(5[1-5]|2[2-7])/?.test(cleaned)) {
    return { type: 'Mastercard', icon: 'CreditCard', maxLength: 16, cvvLength: 3 };
  }
  
  // American Express: starts with 34 or 37
  if (/^3[47]/?.test(cleaned)) {
    return { type: 'American Express', icon: 'CreditCard', maxLength: 15, cvvLength: 4 };
  }
  
  // Default
  return { type: 'Unknown', icon: 'CreditCard', maxLength: 16, cvvLength: 3 };
};

/**
 * Format card number with spaces
 * @param {string} cardNumber - Raw card number
 * @returns {string} - Formatted card number
 */
export const formatCardNumber = (cardNumber) => {
  const cleaned = cardNumber?.replace(/\s/g, '');
  const cardType = detectCardType(cleaned);
  
  if (cardType?.type === 'American Express') {
    // Amex format: 4-6-5
    return cleaned?.replace(/(\d{4})(\d{6})(\d{5})/g, '$1 $2 $3')?.trim();
  }
  
  // Standard format: 4-4-4-4
  return cleaned?.replace(/(\d{4})/g, '$1 ')?.trim();
};

/**
 * Validate expiry date
 * @param {string} month - Expiry month (MM)
 * @param {string} year - Expiry year (YYYY)
 * @returns {object} - {isValid, error}
 */
export const validateExpiry = (month, year) => {
  if (!month || !year) {
    return { isValid: false, error: 'Fecha de expiración incompleta' };
  }
  
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return { isValid: false, error: 'Mes inválido (01-12)' };
  }
  
  const currentDate = new Date();
  const currentYear = currentDate?.getFullYear();
  const currentMonth = currentDate?.getMonth() + 1;
  
  if (yearNum < currentYear || yearNum > currentYear + 20) {
    return { isValid: false, error: `Año inválido (${currentYear}-${currentYear + 20})` };
  }
  
  if (yearNum === currentYear && monthNum < currentMonth) {
    return { isValid: false, error: 'La tarjeta ha expirado' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate CVV
 * @param {string} cvv - CVV code
 * @param {string} cardNumber - Card number for type detection
 * @returns {object} - {isValid, error}
 */
export const validateCVV = (cvv, cardNumber) => {
  if (!cvv) {
    return { isValid: false, error: 'CVV es obligatorio' };
  }
  
  const cardType = detectCardType(cardNumber || '');
  const expectedLength = cardType?.cvvLength || 3;
  
  if (!/^\d+$/?.test(cvv)) {
    return { isValid: false, error: 'CVV debe contener solo números' };
  }
  
  if (cvv?.length !== expectedLength) {
    return { isValid: false, error: `CVV debe tener ${expectedLength} dígitos` };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate cardholder name
 * @param {string} name - Cardholder name
 * @returns {object} - {isValid, error}
 */
export const validateCardholderName = (name) => {
  if (!name) {
    return { isValid: false, error: 'Nombre del titular es obligatorio' };
  }
  
  if (name?.length < 3) {
    return { isValid: false, error: 'Nombre debe tener al menos 3 caracteres' };
  }
  
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/?.test(name)) {
    return { isValid: false, error: 'Nombre solo debe contener letras' };
  }
  
  return { isValid: true, error: null };
};
