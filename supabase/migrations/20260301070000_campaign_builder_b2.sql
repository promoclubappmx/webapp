-- Campaign Builder B2 Migration
-- Adds tables for objectives, sequences, A/B tests and control groups

-- ── Types ──────────────────────────────────────────────────────────────────────
DROP TYPE IF EXISTS public.campaign_objective_type CASCADE;
CREATE TYPE public.campaign_objective_type AS ENUM ('adquisicion', 'reactivacion', 'upsell', 'fidelizacion');

DROP TYPE IF EXISTS public.campaign_channel_type CASCADE;
CREATE TYPE public.campaign_channel_type AS ENUM ('push', 'cupon', 'email', 'story', 'sms', 'social');

-- ── Tables ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.campaign_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT NOT NULL,
  business_id UUID,
  objective public.campaign_objective_type NOT NULL,
  audience_segments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.campaign_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT NOT NULL,
  step_order INTEGER NOT NULL DEFAULT 1,
  channel public.campaign_channel_type NOT NULL DEFAULT 'push',
  message TEXT,
  delay_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.campaign_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  variant_a JSONB DEFAULT '{}'::jsonb,
  variant_b JSONB DEFAULT '{}'::jsonb,
  audience_split TEXT DEFAULT '50-50',
  control_group_active BOOLEAN DEFAULT false,
  control_group_percentage INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ── Indexes ────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_campaign_objectives_campaign_id ON public.campaign_objectives(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sequences_campaign_id ON public.campaign_sequences(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_ab_tests_campaign_id ON public.campaign_ab_tests(campaign_id);

-- ── RLS ────────────────────────────────────────────────────────────────────────
ALTER TABLE public.campaign_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_ab_tests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "open_access_campaign_objectives" ON public.campaign_objectives;
CREATE POLICY "open_access_campaign_objectives" ON public.campaign_objectives
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "open_access_campaign_sequences" ON public.campaign_sequences;
CREATE POLICY "open_access_campaign_sequences" ON public.campaign_sequences
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "open_access_campaign_ab_tests" ON public.campaign_ab_tests;
CREATE POLICY "open_access_campaign_ab_tests" ON public.campaign_ab_tests
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
