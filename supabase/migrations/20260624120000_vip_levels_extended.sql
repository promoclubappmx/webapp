-- ─── VIP LEVELS EXTENDED SCHEMA ─────────────────────────────────────────────
-- Extends existing vip_levels_config, vip_levels, vip_level_benefits tables
-- with new criteria, trigger actions, periodic evaluation config, and analytics

-- 1. Extend vip_levels_config with new criterion options and periodic eval fields
ALTER TABLE public.vip_levels_config
  ADD COLUMN IF NOT EXISTS criterion_secondary TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS eval_frequency_months INTEGER DEFAULT 6,
  ADD COLUMN IF NOT EXISTS eval_min_activity JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS warning_days_before INTEGER DEFAULT 14,
  ADD COLUMN IF NOT EXISTS grace_period_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS grace_period_days INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS combo_visits_threshold INTEGER DEFAULT 8,
  ADD COLUMN IF NOT EXISTS combo_points_threshold INTEGER DEFAULT 300,
  ADD COLUMN IF NOT EXISTS engagement_score_bronze_max INTEGER DEFAULT 40,
  ADD COLUMN IF NOT EXISTS engagement_score_silver_min INTEGER DEFAULT 40,
  ADD COLUMN IF NOT EXISTS engagement_score_silver_max INTEGER DEFAULT 70,
  ADD COLUMN IF NOT EXISTS engagement_score_gold_min INTEGER DEFAULT 70,
  ADD COLUMN IF NOT EXISTS period_window_days INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS period_min_visits INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Extend vip_levels with automation triggers (all trigger types)
ALTER TABLE public.vip_levels
  ADD COLUMN IF NOT EXISTS automation_config JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS maintenance_trigger_config JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS downgrade_trigger_config JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS proximity_trigger_config JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS time_trigger_config JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 3. Extend vip_level_benefits with new benefit types
-- (benefit_type column already exists, just ensuring new types are documented via comment)
COMMENT ON COLUMN public.vip_level_benefits.benefit_type IS
  'Types: points_multiplier, discount, early_access, free_product, priority, custom, welcome_points, priority_reservation, exclusive_service, exclusive_events, punch_card_reduction, exclusive_geofence, prepaid_cashback';

-- 4. Create vip_global_triggers table for global trigger config
CREATE TABLE IF NOT EXISTS public.vip_global_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT NOT NULL,
  on_level_up BOOLEAN DEFAULT true,
  on_level_down BOOLEAN DEFAULT false,
  on_points_milestone BOOLEAN DEFAULT false,
  on_anniversary BOOLEAN DEFAULT true,
  on_risk_downgrade BOOLEAN DEFAULT false,
  on_sustained_loyalty BOOLEAN DEFAULT false,
  on_near_next_level BOOLEAN DEFAULT false,
  near_level_threshold_pct INTEGER DEFAULT 20,
  notify_staff BOOLEAN DEFAULT true,
  send_congrats BOOLEAN DEFAULT true,
  congrats_channel TEXT DEFAULT 'push',
  automation_flow BOOLEAN DEFAULT false,
  flow_id TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id)
);

ALTER TABLE public.vip_global_triggers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vip_global_triggers_owner" ON public.vip_global_triggers;
CREATE POLICY "vip_global_triggers_owner"
  ON public.vip_global_triggers FOR ALL TO authenticated
  USING (business_id = auth.uid()::text)
  WITH CHECK (business_id = auth.uid()::text);

-- 5. Create vip_economic_simulator_config table
CREATE TABLE IF NOT EXISTS public.vip_economic_simulator_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT NOT NULL,
  avg_ticket_mxn NUMERIC(10,2) DEFAULT 150.00,
  avg_visits_per_month NUMERIC(5,2) DEFAULT 4.0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id)
);

ALTER TABLE public.vip_economic_simulator_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vip_economic_simulator_owner" ON public.vip_economic_simulator_config;
CREATE POLICY "vip_economic_simulator_owner"
  ON public.vip_economic_simulator_config FOR ALL TO authenticated
  USING (business_id = auth.uid()::text)
  WITH CHECK (business_id = auth.uid()::text);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_vip_global_triggers_business ON public.vip_global_triggers(business_id);
CREATE INDEX IF NOT EXISTS idx_vip_economic_sim_business ON public.vip_economic_simulator_config(business_id);
