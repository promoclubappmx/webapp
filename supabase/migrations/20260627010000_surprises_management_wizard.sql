-- Migration: surprises_management_extended
-- Adds surprise_configs table for the new surprise wizard

-- ─── surprise_configs ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.surprise_configs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id           UUID NOT NULL,
  name                  TEXT NOT NULL,
  description           TEXT,
  mechanic              TEXT NOT NULL DEFAULT 'ruleta',
  distribution_mode     TEXT NOT NULL DEFAULT 'probabilistic',
  prizes                JSONB DEFAULT '[]'::jsonb,
  expiration_days       INTEGER DEFAULT 7,
  notify_before_expiry  BOOLEAN DEFAULT true,
  active_triggers       JSONB DEFAULT '{}'::jsonb,
  trigger_configs       JSONB DEFAULT '{}'::jsonb,
  max_per_user_day      INTEGER DEFAULT 1,
  max_per_user_month    INTEGER DEFAULT 5,
  apply_to_all          BOOLEAN DEFAULT true,
  establishment_ids     JSONB DEFAULT '[]'::jsonb,
  audience_restriction  TEXT DEFAULT 'all',
  start_date            DATE,
  end_date              DATE,
  status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- Index for business lookups
CREATE INDEX IF NOT EXISTS idx_surprise_configs_business_id ON public.surprise_configs(business_id);
CREATE INDEX IF NOT EXISTS idx_surprise_configs_status ON public.surprise_configs(status);

-- RLS
ALTER TABLE public.surprise_configs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'surprise_configs' AND policyname = 'surprise_configs_owner_all'
  ) THEN
    CREATE POLICY surprise_configs_owner_all ON public.surprise_configs
      FOR ALL
      USING (business_id = auth.uid() OR business_id IN (
        SELECT business_id::uuid FROM public.user_profiles WHERE id = auth.uid()
      ))
      WITH CHECK (business_id = auth.uid() OR business_id IN (
        SELECT business_id::uuid FROM public.user_profiles WHERE id = auth.uid()
      ));
  END IF;
END $$;

-- ─── surprise_activations ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.surprise_activations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id       UUID REFERENCES public.surprise_configs(id) ON DELETE CASCADE,
  business_id     UUID NOT NULL,
  customer_id     UUID,
  trigger_type    TEXT,
  mechanic        TEXT,
  prize_name      TEXT,
  prize_type      TEXT,
  prize_value     TEXT,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'opened', 'redeemed', 'expired')),
  activated_at    TIMESTAMPTZ DEFAULT now(),
  opened_at       TIMESTAMPTZ,
  redeemed_at     TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  location_id     UUID
);

CREATE INDEX IF NOT EXISTS idx_surprise_activations_business ON public.surprise_activations(business_id);
CREATE INDEX IF NOT EXISTS idx_surprise_activations_config ON public.surprise_activations(config_id);
CREATE INDEX IF NOT EXISTS idx_surprise_activations_customer ON public.surprise_activations(customer_id);

ALTER TABLE public.surprise_activations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'surprise_activations' AND policyname = 'surprise_activations_owner_all'
  ) THEN
    CREATE POLICY surprise_activations_owner_all ON public.surprise_activations
      FOR ALL
      USING (business_id = auth.uid() OR business_id IN (
        SELECT business_id::uuid FROM public.user_profiles WHERE id = auth.uid()
      ))
      WITH CHECK (business_id = auth.uid() OR business_id IN (
        SELECT business_id::uuid FROM public.user_profiles WHERE id = auth.uid()
      ));
  END IF;
END $$;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_surprise_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_surprise_configs_updated_at ON public.surprise_configs;
CREATE TRIGGER trg_surprise_configs_updated_at
  BEFORE UPDATE ON public.surprise_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_surprise_configs_updated_at();
