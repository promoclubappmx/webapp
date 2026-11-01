-- Migration: Enhanced Registration Flow with 7 Steps
-- Adds fields for personal data, fiscal data, business data, location, and subscription plan

-- Add new columns to user_profiles for personal data (Step 2)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS curp TEXT,
ADD COLUMN IF NOT EXISTS role_in_business TEXT;

-- Add new columns to business_settings for fiscal data (Step 3)
ALTER TABLE public.business_settings
ADD COLUMN IF NOT EXISTS rfc TEXT,
ADD COLUMN IF NOT EXISTS razon_social TEXT,
ADD COLUMN IF NOT EXISTS regimen_fiscal TEXT,
ADD COLUMN IF NOT EXISTS codigo_postal_fiscal TEXT;

-- Add new columns to business_settings for business data (Step 4)
ALTER TABLE public.business_settings
ADD COLUMN IF NOT EXISTS nombre_comercial TEXT,
ADD COLUMN IF NOT EXISTS categoria TEXT,
ADD COLUMN IF NOT EXISTS descripcion_breve TEXT;

-- Add new columns to business_settings for location (Step 5)
ALTER TABLE public.business_settings
ADD COLUMN IF NOT EXISTS calle_numero TEXT,
ADD COLUMN IF NOT EXISTS colonia TEXT,
ADD COLUMN IF NOT EXISTS referencias TEXT,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add new columns to business_settings for subscription plan (Step 6)
ALTER TABLE public.business_settings
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS subscription_price DECIMAL(10, 2) DEFAULT 0;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_curp ON public.user_profiles(curp);
CREATE INDEX IF NOT EXISTS idx_business_settings_rfc ON public.business_settings(rfc);
CREATE INDEX IF NOT EXISTS idx_business_settings_subscription_plan ON public.business_settings(subscription_plan);

-- Add comments for documentation
COMMENT ON COLUMN public.user_profiles.curp IS 'CURP (Clave Única de Registro de Población) - 18 characters';
COMMENT ON COLUMN public.business_settings.rfc IS 'RFC (Registro Federal de Contribuyentes) - 12-13 characters';
COMMENT ON COLUMN public.business_settings.regimen_fiscal IS 'Régimen Fiscal SAT (601, 612, 616, 621, 625, 626)';
COMMENT ON COLUMN public.business_settings.subscription_plan IS 'Plan: free, pro, premium';
COMMENT ON COLUMN public.business_settings.subscription_status IS 'Status: draft, active, inactive';