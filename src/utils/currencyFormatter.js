/**
 * Currency formatting utility
 * Reads currency settings and formats monetary values consistently across the app
 */

export const DEFAULT_CURRENCY_SETTINGS = {
  defaultCurrency: 'MXN',
  currencySymbol: '$',
  currencyPosition: 'before',
  symbolSpace: false,
  decimalPlaces: 2,
  thousandsSeparator: ',',
  decimalSeparator: '.',
  showCurrencySymbol: true,
  numberFormat: 'US',
  taxIncluded: true,
  taxRate: 16
};

/**
 * Number format presets
 */
export const NUMBER_FORMAT_PRESETS = {
  US: { thousandsSeparator: ',', decimalSeparator: '.', label: '1,234.56 (US)' },
  EU: { thousandsSeparator: '.', decimalSeparator: ',', label: '1.234,56 (EU)' },
  FR: { thousandsSeparator: ' ', decimalSeparator: '.', label: '1 234.56 (FR)' },
  ES: { thousandsSeparator: ' ', decimalSeparator: ',', label: '1 234,56 (ES)' }
};

/**
 * Format a monetary value using the provided currency settings
 * @param {number} amount - The numeric value to format
 * @param {object} settings - Currency settings object (uses defaults if not provided)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, settings = DEFAULT_CURRENCY_SETTINGS) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '';
  
  const config = { ...DEFAULT_CURRENCY_SETTINGS, ...settings };
  
  const numAmount = parseFloat(amount);
  const fixed = numAmount?.toFixed(config?.decimalPlaces);
  const [integerPart, decimalPart] = fixed?.split('.');
  
  // Apply thousands separator
  let formattedInteger = integerPart;
  if (config?.thousandsSeparator !== '') {
    formattedInteger = integerPart?.replace(/\B(?=(\d{3})+(?!\d))/g, config?.thousandsSeparator);
  }
  
  // Combine integer and decimal parts
  let formattedNumber;
  if (config?.decimalPlaces > 0 && decimalPart !== undefined) {
    formattedNumber = `${formattedInteger}${config?.decimalSeparator}${decimalPart}`;
  } else {
    formattedNumber = formattedInteger;
  }
  
  // Apply currency symbol
  if (!config?.showCurrencySymbol) {
    return formattedNumber;
  }
  
  const symbol = config?.currencySymbol || '$';
  const space = config?.symbolSpace ? ' ' : '';
  
  if (config?.currencyPosition === 'before') {
    return `${symbol}${space}${formattedNumber}`;
  } else {
    return `${formattedNumber}${space}${symbol}`;
  }
};

/**
 * Format a percentage value
 * @param {number} value - The percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${parseFloat(value)?.toFixed(decimals)}%`;
};

/**
 * Parse currency settings from user_profiles.currency_settings (snake_case from DB)
 * @param {object} dbSettings - Settings from Supabase (may be snake_case or camelCase)
 * @returns {object} Normalized settings object
 */
export const parseCurrencySettings = (dbSettings) => {
  if (!dbSettings) return DEFAULT_CURRENCY_SETTINGS;
  return { ...DEFAULT_CURRENCY_SETTINGS, ...dbSettings };
};
