-- Migration: Add missing columns to user_profiles for registration flow
-- Adds first_name, last_name, apellido_materno, curp, role_in_business

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS apellido_materno TEXT,
ADD COLUMN IF NOT EXISTS curp TEXT,
ADD COLUMN IF NOT EXISTS role_in_business TEXT;
