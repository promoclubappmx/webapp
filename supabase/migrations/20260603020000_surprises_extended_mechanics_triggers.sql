-- Extended Surprise Mechanics and Triggers
-- Adds new columns to surprise_rewards_config for 7 new mechanics and extended triggers

-- Extend surprise_rewards_config with new mechanics config and extended triggers
ALTER TABLE public.surprise_rewards_config
  ADD COLUMN IF NOT EXISTS mechanic_config JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS extended_triggers JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS trigger_priority JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS daily_limit INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS cooldown_hours INTEGER DEFAULT 4,
  ADD COLUMN IF NOT EXISTS global_budget_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS global_monthly_budget NUMERIC(10,2) DEFAULT 5000;

-- Table for trigger-specific prize pools
CREATE TABLE IF NOT EXISTS public.surprise_trigger_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  trigger_key TEXT NOT NULL,
  prizes JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_surprise_trigger_pools_business_trigger
  ON public.surprise_trigger_pools(business_id, trigger_key);

CREATE INDEX IF NOT EXISTS idx_surprise_trigger_pools_business_id
  ON public.surprise_trigger_pools(business_id);

ALTER TABLE public.surprise_trigger_pools ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_surprise_trigger_pools" ON public.surprise_trigger_pools;
CREATE POLICY "users_manage_own_surprise_trigger_pools"
  ON public.surprise_trigger_pools
  FOR ALL TO authenticated
  USING (business_id = auth.uid())
  WITH CHECK (business_id = auth.uid());
