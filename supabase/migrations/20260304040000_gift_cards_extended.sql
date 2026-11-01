-- Gift Cards Extended Schema: Funcionalidades #76, #77, #78, #79

-- TYPES
DROP TYPE IF EXISTS public.corporate_order_status CASCADE;
CREATE TYPE public.corporate_order_status AS ENUM ('pending', 'paid', 'distributed', 'cancelled');

DROP TYPE IF EXISTS public.distribution_method CASCADE;
CREATE TYPE public.distribution_method AS ENUM ('excel', 'email_individual', 'qr_printable');

DROP TYPE IF EXISTS public.prepaid_card_status CASCADE;
CREATE TYPE public.prepaid_card_status AS ENUM ('active', 'inactive', 'blocked');

-- GIFT CARDS CONFIGURATION
CREATE TABLE IF NOT EXISTS public.gift_card_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  denominations JSONB DEFAULT '[]'::jsonb,
  allow_free_amount BOOLEAN DEFAULT false,
  free_amount_min NUMERIC DEFAULT 50,
  free_amount_max NUMERIC DEFAULT 5000,
  selected_template TEXT DEFAULT 'generic_1',
  business_message TEXT DEFAULT '',
  custom_design_url TEXT,
  validity_days INTEGER DEFAULT 365,
  use_fixed_expiry BOOLEAN DEFAULT false,
  fixed_expiry_date DATE,
  allow_partial_use BOOLEAN DEFAULT true,
  min_purchase_amount NUMERIC,
  applies_to_all_catalog BOOLEAN DEFAULT true,
  restricted_categories JSONB DEFAULT '[]'::jsonb,
  combinable_with_promos BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_gift_card_config_business ON public.gift_card_config(business_id);
CREATE INDEX IF NOT EXISTS idx_gift_card_config_active ON public.gift_card_config(is_active);

-- CORPORATE GIFT CARDS
CREATE TABLE IF NOT EXISTS public.gift_card_corporate_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  landing_url TEXT,
  volume_packages JSONB DEFAULT '[]'::jsonb,
  logo_position TEXT DEFAULT 'top_right',
  allow_custom_message BOOLEAN DEFAULT true,
  use_corporate_design BOOLEAN DEFAULT false,
  accept_spei BOOLEAN DEFAULT true,
  default_distribution distribution_method DEFAULT 'excel',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_gc_corporate_config_business ON public.gift_card_corporate_config(business_id);

CREATE TABLE IF NOT EXISTS public.gift_card_corporate_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_rfc TEXT,
  company_email TEXT,
  quantity INTEGER NOT NULL,
  unit_amount NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  discount_pct NUMERIC DEFAULT 0,
  status corporate_order_status DEFAULT 'pending',
  distribution_method distribution_method DEFAULT 'excel',
  custom_message TEXT,
  company_logo_url TEXT,
  payment_reference TEXT,
  paid_at TIMESTAMPTZ,
  distributed_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gc_corporate_orders_business ON public.gift_card_corporate_orders(business_id);
CREATE INDEX IF NOT EXISTS idx_gc_corporate_orders_status ON public.gift_card_corporate_orders(status);

-- PREPAID CARDS
CREATE TABLE IF NOT EXISTS public.prepaid_card_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  card_name TEXT DEFAULT 'Tarjeta Prepago',
  selected_template TEXT DEFAULT 'membership_1',
  reload_amounts JSONB DEFAULT '[]'::jsonb,
  allow_free_reload BOOLEAN DEFAULT false,
  free_reload_min NUMERIC DEFAULT 50,
  free_reload_max NUMERIC DEFAULT 5000,
  max_balance NUMERIC DEFAULT 5000,
  welcome_balance_enabled BOOLEAN DEFAULT false,
  welcome_balance_amount NUMERIC DEFAULT 0,
  combinable_with_other_methods BOOLEAN DEFAULT true,
  balance_expires BOOLEAN DEFAULT false,
  balance_expiry_months INTEGER DEFAULT 12,
  balance_refundable BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_prepaid_card_config_business ON public.prepaid_card_config(business_id);

CREATE TABLE IF NOT EXISTS public.prepaid_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id),
  card_number TEXT UNIQUE NOT NULL,
  current_balance NUMERIC DEFAULT 0,
  total_reloaded NUMERIC DEFAULT 0,
  total_consumed NUMERIC DEFAULT 0,
  status prepaid_card_status DEFAULT 'active',
  activated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  last_reload_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_prepaid_cards_business ON public.prepaid_cards(business_id);
CREATE INDEX IF NOT EXISTS idx_prepaid_cards_user ON public.prepaid_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_prepaid_cards_status ON public.prepaid_cards(status);

-- PREPAID PROMOTIONS
CREATE TABLE IF NOT EXISTS public.prepaid_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  is_permanent BOOLEAN DEFAULT false,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  urgency_message TEXT DEFAULT '',
  bonus_tiers JSONB DEFAULT '[]'::jsonb,
  business_margin_pct NUMERIC DEFAULT 40,
  limit_per_user BOOLEAN DEFAULT true,
  uses_per_tier INTEGER DEFAULT 1,
  limit_total BOOLEAN DEFAULT false,
  total_limit INTEGER,
  total_used INTEGER DEFAULT 0,
  show_in_business_listing BOOLEAN DEFAULT true,
  show_in_wallet BOOLEAN DEFAULT true,
  send_push_to_clients BOOLEAN DEFAULT false,
  promo_image_url TEXT,
  estimated_clients INTEGER DEFAULT 50,
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_prepaid_promotions_business ON public.prepaid_promotions(business_id);
CREATE INDEX IF NOT EXISTS idx_prepaid_promotions_status ON public.prepaid_promotions(status);

-- RLS
ALTER TABLE public.gift_card_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_card_corporate_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_card_corporate_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prepaid_card_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prepaid_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prepaid_promotions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_gift_card_config" ON public.gift_card_config;
CREATE POLICY "auth_gift_card_config" ON public.gift_card_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_gc_corporate_config" ON public.gift_card_corporate_config;
CREATE POLICY "auth_gc_corporate_config" ON public.gift_card_corporate_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_gc_corporate_orders" ON public.gift_card_corporate_orders;
CREATE POLICY "auth_gc_corporate_orders" ON public.gift_card_corporate_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_prepaid_card_config" ON public.prepaid_card_config;
CREATE POLICY "auth_prepaid_card_config" ON public.prepaid_card_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_prepaid_cards" ON public.prepaid_cards;
CREATE POLICY "auth_prepaid_cards" ON public.prepaid_cards FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_prepaid_promotions" ON public.prepaid_promotions;
CREATE POLICY "auth_prepaid_promotions" ON public.prepaid_promotions FOR ALL TO authenticated USING (true) WITH CHECK (true);
