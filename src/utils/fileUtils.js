/**
 * File Utility Functions
 * Utilities for file validation and handling
 */

/**
 * Validate file type
 * @param {File} file - File object
 * @param {Array<string>} allowedTypes - Array of allowed MIME types
 * @returns {Object} { valid: boolean, message: string }
 */
export const validateFileType = (file, allowedTypes = ['application/pdf']) => {
  if (!file) {
    return { valid: false, message: 'No se ha seleccionado ningún archivo' };
  }

  if (!allowedTypes?.includes(file?.type)) {
    const typesString = allowedTypes?.map(type => type?.split('/')?.[1]?.toUpperCase())?.join(', ');
    return {
      valid: false,
      message: `Tipo de archivo no permitido. Solo se aceptan: ${typesString}`
    };
  }

  return { valid: true, message: '' };
};

/**
 * Validate file size
 * @param {File} file - File object
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {Object} { valid: boolean, message: string }
 */
export const validateFileSize = (file, maxSizeMB = 5) => {
  if (!file) {
    return { valid: false, message: 'No se ha seleccionado ningún archivo' };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (file?.size > maxSizeBytes) {
    return {
      valid: false,
      message: `El archivo no debe exceder ${maxSizeMB}MB. Tamaño actual: ${(file?.size / 1024 / 1024)?.toFixed(2)}MB`
    };
  }

  return { valid: true, message: '' };
};

/**
 * Format file size to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes?.[i];
};

/**
 * Validate image file
 * @param {File} file - File object
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {Object} { valid: boolean, message: string }
 */
export const validateImageFile = (file, maxSizeMB = 2) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  const typeValidation = validateFileType(file, allowedTypes);
  if (!typeValidation?.valid) {
    return typeValidation;
  }

  const sizeValidation = validateFileSize(file, maxSizeMB);
  if (!sizeValidation?.valid) {
    return sizeValidation;
  }

  return { valid: true, message: '' };
};

/**
 * Convert file to data URL for preview
 * @param {File} file - File object
 * @returns {Promise<string>} Data URL
 */
export const fileToDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export default {
  validateFileType,
  validateFileSize,
  formatFileSize,
  validateImageFile,
  fileToDataURL
};