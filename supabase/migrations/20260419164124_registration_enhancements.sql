-- Migration: Registration flow enhancements
-- Adds tipo_persona, representante legal fields, and contact info

-- Add tipo_persona to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS tipo_persona TEXT CHECK (tipo_persona IN ('fisica', 'moral')),
ADD COLUMN IF NOT EXISTS rfc_moral TEXT,
ADD COLUMN IF NOT EXISTS razon_social_moral TEXT,
ADD COLUMN IF NOT EXISTS rep_curp TEXT,
ADD COLUMN IF NOT EXISTS rep_first_name TEXT,
ADD COLUMN IF NOT EXISTS rep_apellido_paterno TEXT,
ADD COLUMN IF NOT EXISTS rep_apellido_materno TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add contact info and categoria_nombre to business_settings
ALTER TABLE public.business_settings
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS categoria_nombre TEXT,
ADD COLUMN IF NOT EXISTS logo_negocio TEXT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_tipo_persona ON public.user_profiles(tipo_persona);
CREATE INDEX IF NOT EXISTS idx_user_profiles_rfc_moral ON public.user_profiles(rfc_moral);
