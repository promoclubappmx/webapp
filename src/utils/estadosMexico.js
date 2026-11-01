/**
 * Mexican States Utility
 * Mapping between different state name formats
 */

/**
 * Map of state names to standardized keys
 */
export const estadosMap = {
  'AGUASCALIENTES': 'aguascalientes',
  'BAJA CALIFORNIA': 'baja_california',
  'BAJA CALIFORNIA SUR': 'baja_california_sur',
  'CAMPECHE': 'campeche',
  'CHIAPAS': 'chiapas',
  'CHIHUAHUA': 'chihuahua',
  'COAHUILA': 'coahuila',
  'COAHUILA DE ZARAGOZA': 'coahuila',
  'COLIMA': 'colima',
  'CIUDAD DE MEXICO': 'cdmx',
  'CIUDAD DE MÉXICO': 'cdmx',
  'CDMX': 'cdmx',
  'DISTRITO FEDERAL': 'cdmx',
  'DURANGO': 'durango',
  'GUANAJUATO': 'guanajuato',
  'GUERRERO': 'guerrero',
  'HIDALGO': 'hidalgo',
  'JALISCO': 'jalisco',
  'MEXICO': 'mexico',
  'MÉXICO': 'mexico',
  'ESTADO DE MEXICO': 'mexico',
  'ESTADO DE MÉXICO': 'mexico',
  'MICHOACAN': 'michoacan',
  'MICHOACÁN': 'michoacan',
  'MICHOACAN DE OCAMPO': 'michoacan',
  'MORELOS': 'morelos',
  'NAYARIT': 'nayarit',
  'NUEVO LEON': 'nuevo_leon',
  'NUEVO LEÓN': 'nuevo_leon',
  'OAXACA': 'oaxaca',
  'PUEBLA': 'puebla',
  'QUERETARO': 'queretaro',
  'QUERÉTARO': 'queretaro',
  'QUINTANA ROO': 'quintana_roo',
  'SAN LUIS POTOSI': 'san_luis_potosi',
  'SAN LUIS POTOSÍ': 'san_luis_potosi',
  'SINALOA': 'sinaloa',
  'SONORA': 'sonora',
  'TABASCO': 'tabasco',
  'TAMAULIPAS': 'tamaulipas',
  'TLAXCALA': 'tlaxcala',
  'VERACRUZ': 'veracruz',
  'VERACRUZ DE IGNACIO DE LA LLAVE': 'veracruz',
  'YUCATAN': 'yucatan',
  'YUCATÁN': 'yucatan',
  'ZACATECAS': 'zacatecas'
};

/**
 * Normalize state name to standardized key
 * @param {string} stateName - State name from API or user input
 * @returns {string} Standardized state key
 */
export const normalizeStateName = (stateName) => {
  if (!stateName) return '';
  
  const normalized = stateName?.trim()?.toUpperCase();
  return estadosMap?.[normalized] || stateName?.toLowerCase()?.replace(/\s+/g, '_');
};

/**
 * Get display name for state key
 * @param {string} stateKey - Standardized state key
 * @returns {string} Display name
 */
export const getStateDisplayName = (stateKey) => {
  const displayNames = {
    'aguascalientes': 'Aguascalientes',
    'baja_california': 'Baja California',
    'baja_california_sur': 'Baja California Sur',
    'campeche': 'Campeche',
    'chiapas': 'Chiapas',
    'chihuahua': 'Chihuahua',
    'coahuila': 'Coahuila',
    'colima': 'Colima',
    'cdmx': 'Ciudad de México',
    'durango': 'Durango',
    'guanajuato': 'Guanajuato',
    'guerrero': 'Guerrero',
    'hidalgo': 'Hidalgo',
    'jalisco': 'Jalisco',
    'mexico': 'Estado de México',
    'michoacan': 'Michoacán',
    'morelos': 'Morelos',
    'nayarit': 'Nayarit',
    'nuevo_leon': 'Nuevo León',
    'oaxaca': 'Oaxaca',
    'puebla': 'Puebla',
    'queretaro': 'Querétaro',
    'quintana_roo': 'Quintana Roo',
    'san_luis_potosi': 'San Luis Potosí',
    'sinaloa': 'Sinaloa',
    'sonora': 'Sonora',
    'tabasco': 'Tabasco',
    'tamaulipas': 'Tamaulipas',
    'tlaxcala': 'Tlaxcala',
    'veracruz': 'Veracruz',
    'yucatan': 'Yucatán',
    'zacatecas': 'Zacatecas'
  };
  
  return displayNames?.[stateKey] || stateKey;
};

export default {
  estadosMap,
  normalizeStateName,
  getStateDisplayName
};