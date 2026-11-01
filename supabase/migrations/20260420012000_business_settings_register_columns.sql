-- Migration: Add missing columns to business_settings for registration flow
-- These columns are written by Step7Confirmation during user registration

ALTER TABLE public.business_settings
  ADD COLUMN IF NOT EXISTS rfc TEXT,
  ADD COLUMN IF NOT EXISTS razon_social TEXT,
  ADD COLUMN IF NOT EXISTS regimen_fiscal TEXT,
  ADD COLUMN IF NOT EXISTS nombre_comercial TEXT,
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS subscription_price INTEGER DEFAULT 0;
