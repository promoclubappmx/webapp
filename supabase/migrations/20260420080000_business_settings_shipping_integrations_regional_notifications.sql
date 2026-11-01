-- Migration: Add shipping, integrations, regional, and notification settings to business_settings and user_profiles

-- ============================================================
-- 1. SHIPPING SETTINGS (stored in business_settings)
-- ============================================================
ALTER TABLE public.business_settings
  ADD COLUMN IF NOT EXISTS shipping_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS shipping_label text DEFAULT 'Envío',
  ADD COLUMN IF NOT EXISTS shipping_default_zone text DEFAULT 'nacional',
  ADD COLUMN IF NOT EXISTS shipping_tax_on_shipping boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS shipping_show_in_cart boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS shipping_show_in_invoice boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS shipping_zones jsonb DEFAULT '[]'::jsonb;

-- ============================================================
-- 2. INTEGRATIONS SETTINGS (stored in business_settings)
-- ============================================================
ALTER TABLE public.business_settings
  ADD COLUMN IF NOT EXISTS integrations_whatsapp jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS integrations_facebook jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS integrations_instagram jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS integrations_google_analytics jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS integrations_google_ads jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS integrations_stripe jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS integrations_webhooks jsonb DEFAULT '{}'::jsonb;

-- ============================================================
-- 3. REGIONAL SETTINGS (stored in business_settings)
-- ============================================================
ALTER TABLE public.business_settings
  ADD COLUMN IF NOT EXISTS regional_currency text DEFAULT 'MXN',
  ADD COLUMN IF NOT EXISTS regional_timezone text DEFAULT 'America/Mexico_City',
  ADD COLUMN IF NOT EXISTS regional_language text DEFAULT 'es-MX',
  ADD COLUMN IF NOT EXISTS regional_number_format text DEFAULT 'MX',
  ADD COLUMN IF NOT EXISTS regional_thousands_separator text DEFAULT ',',
  ADD COLUMN IF NOT EXISTS regional_decimal_separator text DEFAULT '.',
  ADD COLUMN IF NOT EXISTS regional_decimal_places integer DEFAULT 2,
  ADD COLUMN IF NOT EXISTS regional_currency_position text DEFAULT 'before',
  ADD COLUMN IF NOT EXISTS regional_symbol_space boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS regional_show_currency_symbol boolean DEFAULT true;

-- ============================================================
-- 4. NOTIFICATION SETTINGS (stored in user_profiles)
-- ============================================================
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS notif_email_new_promotions boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_email_coupon_redemptions boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_email_loyalty_points boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_email_system_alerts boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_email_weekly_reports boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS notif_email_monthly_reports boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_email_content_moderation boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_email_payment_notifications boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_push_browser boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_push_urgent_alerts boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_push_promotion_expiry boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_push_system_maintenance boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_sms_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS notif_sms_critical_alerts boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_sms_customer_support boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_frequency text DEFAULT 'immediate',
  ADD COLUMN IF NOT EXISTS notif_quiet_hours boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_quiet_start text DEFAULT '22:00',
  ADD COLUMN IF NOT EXISTS notif_quiet_end text DEFAULT '08:00',
  ADD COLUMN IF NOT EXISTS notif_language text DEFAULT 'es-MX';
