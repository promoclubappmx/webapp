-- Migration: Extend surprise_rewards_config with anti-saturation v2 and general config fields
-- Timestamp: 20260603030000

-- ─── EXTEND surprise_rewards_config ─────────────────────────────────────────

ALTER TABLE public.surprise_rewards_config
  ADD COLUMN IF NOT EXISTS general_config JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS weekly_limit INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS monthly_limit INTEGER DEFAULT 12,
  ADD COLUMN IF NOT EXISTS grace_period_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS grace_period_days INTEGER DEFAULT 7,
  ADD COLUMN IF NOT EXISTS major_prize_definition TEXT DEFAULT 'top2',
  ADD COLUMN IF NOT EXISTS major_prize_min_value INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS vip_limits_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS vip_limits JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS date_exclusions_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS exclusion_dates JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS budget_alert_pct INTEGER DEFAULT 80,
  ADD COLUMN IF NOT EXISTS budget_exhausted_action TEXT DEFAULT 'stop',
  ADD COLUMN IF NOT EXISTS unique_bypass_cooldown BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS module_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS distribution_mode TEXT DEFAULT 'probabilistic',
  ADD COLUMN IF NOT EXISTS pending_expiration_days INTEGER DEFAULT 7,
  ADD COLUMN IF NOT EXISTS pending_expiration_notify BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS pending_notify_days_before INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS double_surprise_seasons JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS celebration_opening_msg TEXT DEFAULT '¡Prepárate para tu sorpresa!',
  ADD COLUMN IF NOT EXISTS celebration_win_msg TEXT DEFAULT '¡Felicidades, ganaste {premio}!',
  ADD COLUMN IF NOT EXISTS celebration_consolation_msg TEXT DEFAULT '¡Sigues ganando! Tus {puntos} puntos ya están en tu cuenta.',
  ADD COLUMN IF NOT EXISTS celebration_bg_image TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS almost_effect_enabled BOOLEAN DEFAULT false;

-- ─── TRIGGER MONTHLY LIMITS TABLE ────────────────────────────────────────────
-- Stores per-trigger monthly limits (separate from the global monthly limit)

CREATE TABLE IF NOT EXISTS public.surprise_trigger_monthly_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  trigger_id TEXT NOT NULL,
  monthly_limit INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, trigger_id)
);

ALTER TABLE public.surprise_trigger_monthly_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Business owners manage trigger monthly limits" ON public.surprise_trigger_monthly_limits;
CREATE POLICY "Business owners manage trigger monthly limits"
  ON public.surprise_trigger_monthly_limits
  FOR ALL TO authenticated
  USING (business_id = auth.uid())
  WITH CHECK (business_id = auth.uid());

-- ─── SURPRISE ACTIVATION LOG TABLE ───────────────────────────────────────────
-- Tracks blocked surprise activations for the anti-saturation log panel

CREATE TABLE IF NOT EXISTS public.surprise_block_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  trigger_id TEXT NOT NULL,
  block_reason TEXT NOT NULL,
  blocked_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.surprise_block_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Business owners view block log" ON public.surprise_block_log;
CREATE POLICY "Business owners view block log"
  ON public.surprise_block_log
  FOR SELECT TO authenticated
  USING (business_id = auth.uid());

-- Index for fast monthly aggregation
CREATE INDEX IF NOT EXISTS idx_surprise_block_log_business_month
  ON public.surprise_block_log (business_id, blocked_at);

-- ─── SURPRISE ACTIVATION HISTORY TABLE ───────────────────────────────────────
-- Full history of all surprise games executed (for the Historial tab)

CREATE TABLE IF NOT EXISTS public.surprise_activation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  trigger_id TEXT NOT NULL,
  mechanic TEXT NOT NULL,
  prize_name TEXT,
  prize_type TEXT,
  prize_value TEXT,
  redeemed BOOLEAN DEFAULT false,
  redeemed_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.surprise_activation_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Business owners view activation history" ON public.surprise_activation_history;
CREATE POLICY "Business owners view activation history"
  ON public.surprise_activation_history
  FOR SELECT TO authenticated
  USING (business_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_surprise_activation_history_business
  ON public.surprise_activation_history (business_id, activated_at DESC);
