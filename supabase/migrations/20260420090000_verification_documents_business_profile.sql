-- Migration: Add verification documents, business profile contact fields, and verification status

-- ============================================================
-- 1. VERIFICATION DOCUMENTS & STATUS (stored in business_settings)
-- ============================================================
ALTER TABLE public.business_settings
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_reviewer_notes TEXT,
  -- Documents for persona física
  ADD COLUMN IF NOT EXISTS doc_identificacion_oficial_url TEXT,
  ADD COLUMN IF NOT EXISTS doc_identificacion_oficial_name TEXT,
  ADD COLUMN IF NOT EXISTS doc_constancia_sat_url TEXT,
  ADD COLUMN IF NOT EXISTS doc_constancia_sat_name TEXT,
  ADD COLUMN IF NOT EXISTS doc_curp_url TEXT,
  ADD COLUMN IF NOT EXISTS doc_curp_name TEXT,
  ADD COLUMN IF NOT EXISTS doc_comprobante_domicilio_url TEXT,
  ADD COLUMN IF NOT EXISTS doc_comprobante_domicilio_name TEXT,
  -- Documents for persona moral
  ADD COLUMN IF NOT EXISTS doc_acta_constitutiva_url TEXT,
  ADD COLUMN IF NOT EXISTS doc_acta_constitutiva_name TEXT,
  ADD COLUMN IF NOT EXISTS doc_id_representante_url TEXT,
  ADD COLUMN IF NOT EXISTS doc_id_representante_name TEXT,
  ADD COLUMN IF NOT EXISTS doc_foto_fachada_url TEXT,
  ADD COLUMN IF NOT EXISTS doc_foto_fachada_name TEXT;

-- ============================================================
-- 2. BUSINESS PROFILE CONTACT FIELDS (stored in business_settings)
-- ============================================================
ALTER TABLE public.business_settings
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS contact_facebook TEXT,
  ADD COLUMN IF NOT EXISTS contact_instagram TEXT,
  ADD COLUMN IF NOT EXISTS contact_twitter TEXT,
  ADD COLUMN IF NOT EXISTS contact_tiktok TEXT,
  ADD COLUMN IF NOT EXISTS contact_youtube TEXT,
  ADD COLUMN IF NOT EXISTS contact_linkedin TEXT;

-- ============================================================
-- 3. INDEX for verification_status
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_business_settings_verification_status
  ON public.business_settings(verification_status);
