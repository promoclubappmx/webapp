-- Add currency_settings column to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS currency_settings JSONB DEFAULT jsonb_build_object(
  'defaultCurrency', 'MXN',
  'currencySymbol', '$',
  'currencyPosition', 'before',
  'symbolSpace', false,
  'decimalPlaces', 2,
  'thousandsSeparator', ',',
  'decimalSeparator', '.',
  'showCurrencySymbol', true,
  'numberFormat', 'US',
  'taxIncluded', true,
  'taxRate', 16
);
