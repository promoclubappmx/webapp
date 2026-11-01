-- Add combo and sorpresa reward type fields to loyalty_rewards table

ALTER TABLE public.loyalty_rewards
  ADD COLUMN IF NOT EXISTS combo_products jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS combo_discount_type text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS combo_discount numeric(5,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS combo_special_price numeric(10,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS surprise_points_cost integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS selected_surprise_id uuid DEFAULT NULL;

-- Update reward_type check constraint to include new types
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'loyalty_rewards'
      AND constraint_name = 'loyalty_rewards_reward_type_check'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.loyalty_rewards DROP CONSTRAINT loyalty_rewards_reward_type_check;
  END IF;
END $$;

-- Add updated constraint allowing combo and sorpresa types
ALTER TABLE public.loyalty_rewards
  ADD CONSTRAINT loyalty_rewards_reward_type_check
  CHECK (reward_type IN ('free_product', 'pct_discount', 'fixed_discount', 'combo', 'sorpresa'));
