-- ============================================================
-- Loyalty Rewards Catalog Extended Schema
-- Migration: 20260614190000_loyalty_rewards_catalog_extended.sql
-- ============================================================

-- 1. Create loyalty_rewards table
CREATE TABLE IF NOT EXISTS public.loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Basic info
  title TEXT NOT NULL,
  description TEXT,
  reward_type TEXT NOT NULL DEFAULT 'free_product',
  points_cost INTEGER NOT NULL DEFAULT 100,
  benefit_value TEXT,
  benefit_product_name TEXT,
  -- Identity
  accent_color TEXT DEFAULT '#2563EB',
  image_url TEXT,
  catalog_order INTEGER DEFAULT 1,
  -- Distribution
  distribution_type TEXT NOT NULL DEFAULT 'direct',
  vip_level TEXT NOT NULL DEFAULT 'all',
  status TEXT NOT NULL DEFAULT 'draft',
  -- Validity
  validity_type TEXT NOT NULL DEFAULT 'no_expiry',
  validity_days INTEGER,
  validity_date DATE,
  -- Schedule restrictions
  restrict_schedule BOOLEAN NOT NULL DEFAULT FALSE,
  schedule_days TEXT[],
  schedule_from TIME,
  schedule_to TIME,
  -- Redemption limits
  max_redemptions_per_customer INTEGER,
  redemption_period TEXT DEFAULT 'forever',
  -- Min purchase
  min_purchase_required BOOLEAN NOT NULL DEFAULT FALSE,
  min_purchase_amount NUMERIC(10,2),
  -- Combinable
  combinable_with_coupons BOOLEAN NOT NULL DEFAULT FALSE,
  -- Excluded categories
  has_excluded_categories BOOLEAN NOT NULL DEFAULT FALSE,
  excluded_categories TEXT[],
  -- Inventory
  has_inventory BOOLEAN NOT NULL DEFAULT FALSE,
  inventory_total INTEGER,
  inventory_remaining INTEGER,
  inventory_behavior TEXT DEFAULT 'deactivate',
  -- Redemption message
  redemption_message TEXT,
  -- Channel
  channel_qr BOOLEAN NOT NULL DEFAULT TRUE,
  channel_code BOOLEAN NOT NULL DEFAULT TRUE,
  channel_nfc BOOLEAN NOT NULL DEFAULT FALSE,
  channel_manual BOOLEAN NOT NULL DEFAULT FALSE,
  -- Notifications
  notify_near_points BOOLEAN NOT NULL DEFAULT FALSE,
  notify_threshold INTEGER DEFAULT 80,
  -- Establishment
  establishment_scope TEXT NOT NULL DEFAULT 'all',
  selected_establishments TEXT[],
  -- Terms
  terms TEXT,
  -- Metadata
  total_redeemed INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_status ON public.loyalty_rewards(status);
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_reward_type ON public.loyalty_rewards(reward_type);
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_catalog_order ON public.loyalty_rewards(catalog_order);
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_created_by ON public.loyalty_rewards(created_by);

-- 3. Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_loyalty_rewards_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 4. Enable RLS
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "users_manage_own_loyalty_rewards" ON public.loyalty_rewards;
CREATE POLICY "users_manage_own_loyalty_rewards"
ON public.loyalty_rewards
FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "public_read_active_loyalty_rewards" ON public.loyalty_rewards;
CREATE POLICY "public_read_active_loyalty_rewards"
ON public.loyalty_rewards
FOR SELECT
TO authenticated
USING (status = 'active');

-- 6. Trigger
DROP TRIGGER IF EXISTS trg_loyalty_rewards_updated_at ON public.loyalty_rewards;
CREATE TRIGGER trg_loyalty_rewards_updated_at
  BEFORE UPDATE ON public.loyalty_rewards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_loyalty_rewards_updated_at();

-- 7. Loyalty reward redemptions table
CREATE TABLE IF NOT EXISTS public.loyalty_reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id UUID NOT NULL REFERENCES public.loyalty_rewards(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  points_used INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  redemption_code TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_reward_redemptions_reward_id ON public.loyalty_reward_redemptions(reward_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_reward_redemptions_customer_id ON public.loyalty_reward_redemptions(customer_id);

ALTER TABLE public.loyalty_reward_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_manage_loyalty_reward_redemptions" ON public.loyalty_reward_redemptions;
CREATE POLICY "authenticated_manage_loyalty_reward_redemptions"
ON public.loyalty_reward_redemptions
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
