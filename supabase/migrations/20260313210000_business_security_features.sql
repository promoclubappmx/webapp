-- Migration: business_security_features
-- Timestamp: 20260313210000
-- Description: Creates business_security_features table for security attributes module

-- ─── TABLE ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.business_security_features (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  feature_key TEXT NOT NULL,
  category    TEXT NOT NULL,
  enabled     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_business_security_features_business_id
  ON public.business_security_features (business_id);

CREATE INDEX IF NOT EXISTS idx_business_security_features_category
  ON public.business_security_features (category);

CREATE UNIQUE INDEX IF NOT EXISTS idx_business_security_features_unique
  ON public.business_security_features (business_id, feature_key);

-- ─── UPDATED_AT TRIGGER ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_business_security_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_business_security_updated_at ON public.business_security_features;
CREATE TRIGGER trg_business_security_updated_at
  BEFORE UPDATE ON public.business_security_features
  FOR EACH ROW EXECUTE FUNCTION public.set_business_security_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.business_security_features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_business_security_features" ON public.business_security_features;
CREATE POLICY "users_manage_own_business_security_features"
  ON public.business_security_features
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_business_security_features" ON public.business_security_features;
CREATE POLICY "public_read_business_security_features"
  ON public.business_security_features
  FOR SELECT
  TO public
  USING (enabled = true);

-- ─── MOCK DATA ───────────────────────────────────────────────────────────────

DO $$
DECLARE
  demo_business_id UUID := gen_random_uuid();
BEGIN
  -- Seguridad del Establecimiento
  INSERT INTO public.business_security_features (business_id, feature_key, category, enabled) VALUES
    (demo_business_id, 'sec_cameras',          'establecimiento', true),
    (demo_business_id, 'sec_surveillance24',   'establecimiento', true),
    (demo_business_id, 'sec_securityStaff',    'establecimiento', true),
    (demo_business_id, 'sec_accessControl',    'establecimiento', false),
    (demo_business_id, 'sec_reception',        'establecimiento', true),
    (demo_business_id, 'sec_remoteMonitoring', 'establecimiento', true),
    (demo_business_id, 'sec_wellLitZone',      'establecimiento', true),
    (demo_business_id, 'sec_exteriorLighting', 'establecimiento', true),
    (demo_business_id, 'sec_emergencyButton',  'establecimiento', false),
    (demo_business_id, 'sec_alarms',           'establecimiento', false),
  -- Seguridad contra Emergencias
    (demo_business_id, 'sec_smokeDetectors',        'emergencias', true),
    (demo_business_id, 'sec_fireExtinguishers',      'emergencias', true),
    (demo_business_id, 'sec_evacuationRoutes',       'emergencias', true),
    (demo_business_id, 'sec_emergencySignage',       'emergencias', false),
    (demo_business_id, 'sec_trainedEmergencyStaff',  'emergencias', false),
    (demo_business_id, 'sec_firstAidKit',            'emergencias', true),
    (demo_business_id, 'sec_fireSystem',             'emergencias', true),
  -- Seguridad Sanitaria
    (demo_business_id, 'sec_hygieneProtocols',       'sanitaria', true),
    (demo_business_id, 'sec_frequentSanitization',   'sanitaria', true),
    (demo_business_id, 'sec_sanitaryCertifications', 'sanitaria', true),
    (demo_business_id, 'sec_capacityControl',        'sanitaria', false),
    (demo_business_id, 'sec_adequateVentilation',    'sanitaria', true),
    (demo_business_id, 'sec_handwashingArea',        'sanitaria', true),
  -- Seguridad del Cliente
    (demo_business_id, 'sec_kidsArea',           'cliente', false),
    (demo_business_id, 'sec_trainedStaff',        'cliente', true),
    (demo_business_id, 'sec_incidentProtocols',   'cliente', false),
    (demo_business_id, 'sec_monitoredSpace',      'cliente', true),
    (demo_business_id, 'sec_nearbyMedical',       'cliente', false)
  ON CONFLICT (business_id, feature_key) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;
