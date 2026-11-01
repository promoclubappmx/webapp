-- Gift Cards Extended: Digital Config, Corporate, Prepaid, Promos
-- Migration: 20260304050000_gift_cards_extended.sql

-- Gift card configuration per business
CREATE TABLE IF NOT EXISTS public.gift_card_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id text NOT NULL,
  is_active boolean DEFAULT false,
  denominations jsonb DEFAULT '[]'::jsonb,
  allow_custom_amount boolean DEFAULT false,
  custom_amount_min numeric DEFAULT 50,
  custom_amount_max numeric DEFAULT 5000,
  selected_template text DEFAULT 'generic-1',
  business_message text DEFAULT '',
  validity_days integer DEFAULT 365,
  use_fixed_expiry boolean DEFAULT false,
  fixed_expiry_date date,
  allow_partial_use boolean DEFAULT true,
  min_purchase_amount numeric,
  applies_to_all_catalog boolean DEFAULT true,
  restricted_categories jsonb DEFAULT '[]'::jsonb,
  combinable_with_promos boolean DEFAULT true,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(business_id)
);

-- Corporate gift card configuration
CREATE TABLE IF NOT EXISTS public.gift_card_corporate_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id text NOT NULL,
  is_active boolean DEFAULT false,
  landing_url text,
  volume_packages jsonb DEFAULT '[]'::jsonb,
  corporate_logo_position text DEFAULT 'top-right',
  allow_company_message boolean DEFAULT true,
  use_separate_design boolean DEFAULT false,
  accept_spei boolean DEFAULT true,
  distribution_method text DEFAULT 'excel',
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(business_id)
);

-- Corporate gift card orders
CREATE TABLE IF NOT EXISTS public.gift_card_corporate_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id text NOT NULL,
  company_name text NOT NULL,
  company_email text,
  company_rfc text,
  quantity integer NOT NULL,
  unit_value numeric NOT NULL,
  discount_pct numeric DEFAULT 0,
  total_amount numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending','paid','distributed','cancelled')),
  payment_method text DEFAULT 'card',
  distribution_method text DEFAULT 'excel',
  company_message text,
  company_logo_url text,
  notes text,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Prepaid card configuration per business
CREATE TABLE IF NOT EXISTS public.prepaid_card_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id text NOT NULL,
  is_active boolean DEFAULT false,
  card_name text DEFAULT 'Tarjeta Prepago',
  selected_template text DEFAULT 'membership-1',
  reload_amounts jsonb DEFAULT '[]'::jsonb,
  allow_custom_reload boolean DEFAULT false,
  custom_reload_min numeric DEFAULT 50,
  custom_reload_max numeric DEFAULT 5000,
  max_balance numeric DEFAULT 5000,
  welcome_balance_enabled boolean DEFAULT false,
  welcome_balance_amount numeric DEFAULT 0,
  combinable_with_other_methods boolean DEFAULT true,
  balance_expires boolean DEFAULT false,
  balance_expiry_months integer,
  balance_refundable boolean DEFAULT false,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(business_id)
);

-- Prepaid card instances per user
CREATE TABLE IF NOT EXISTS public.prepaid_cards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  user_name text,
  user_email text,
  current_balance numeric DEFAULT 0,
  total_reloaded numeric DEFAULT 0,
  total_consumed numeric DEFAULT 0,
  activated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  last_reload_at timestamptz,
  last_used_at timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active','inactive','blocked')),
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Prepaid reload promotions
CREATE TABLE IF NOT EXISTS public.prepaid_reload_promos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id text NOT NULL,
  name text NOT NULL,
  tiers jsonb DEFAULT '[]'::jsonb,
  business_margin_pct numeric DEFAULT 40,
  start_date date,
  end_date date,
  is_permanent boolean DEFAULT false,
  urgency_message text DEFAULT '',
  limit_per_user boolean DEFAULT true,
  uses_per_tier integer DEFAULT 1,
  limit_total boolean DEFAULT false,
  total_limit integer,
  total_used integer DEFAULT 0,
  show_in_business_profile boolean DEFAULT true,
  show_in_wallet boolean DEFAULT true,
  send_push_to_clients boolean DEFAULT false,
  promo_image_url text,
  status text DEFAULT 'draft' CHECK (status IN ('draft','active','paused','ended')),
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- RLS Policies
ALTER TABLE public.gift_card_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_card_corporate_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_card_corporate_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prepaid_card_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prepaid_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prepaid_reload_promos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gift_card_config' AND policyname = 'gift_card_config_all') THEN
    CREATE POLICY gift_card_config_all ON public.gift_card_config FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gift_card_corporate_config' AND policyname = 'gift_card_corporate_config_all') THEN
    CREATE POLICY gift_card_corporate_config_all ON public.gift_card_corporate_config FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gift_card_corporate_orders' AND policyname = 'gift_card_corporate_orders_all') THEN
    CREATE POLICY gift_card_corporate_orders_all ON public.gift_card_corporate_orders FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prepaid_card_config' AND policyname = 'prepaid_card_config_all') THEN
    CREATE POLICY prepaid_card_config_all ON public.prepaid_card_config FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prepaid_cards' AND policyname = 'prepaid_cards_all') THEN
    CREATE POLICY prepaid_cards_all ON public.prepaid_cards FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prepaid_reload_promos' AND policyname = 'prepaid_reload_promos_all') THEN
    CREATE POLICY prepaid_reload_promos_all ON public.prepaid_reload_promos FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gift_card_config_business ON public.gift_card_config(business_id);
CREATE INDEX IF NOT EXISTS idx_gift_card_corporate_config_business ON public.gift_card_corporate_config(business_id);
CREATE INDEX IF NOT EXISTS idx_gift_card_corporate_orders_business ON public.gift_card_corporate_orders(business_id);
CREATE INDEX IF NOT EXISTS idx_prepaid_card_config_business ON public.prepaid_card_config(business_id);
CREATE INDEX IF NOT EXISTS idx_prepaid_cards_business ON public.prepaid_cards(business_id);
CREATE INDEX IF NOT EXISTS idx_prepaid_reload_promos_business ON public.prepaid_reload_promos(business_id);
