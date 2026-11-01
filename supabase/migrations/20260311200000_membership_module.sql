-- Membership Module Migration
-- Tables: membership_programs, membership_benefits, membership_subscriptions, membership_consumptions, membership_messages

-- 1. Types
DROP TYPE IF EXISTS public.membership_status CASCADE;
CREATE TYPE public.membership_status AS ENUM ('draft', 'active', 'paused', 'cancelled');

DROP TYPE IF EXISTS public.membership_plan CASCADE;
CREATE TYPE public.membership_plan AS ENUM ('monthly', 'annual', 'trial');

DROP TYPE IF EXISTS public.subscription_status CASCADE;
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'trial', 'payment_failed', 'paused');

DROP TYPE IF EXISTS public.benefit_type CASCADE;
CREATE TYPE public.benefit_type AS ENUM ('quantity_included', 'discount_percent', 'catalog_price', 'points_multiplier', 'exclusive_access');

DROP TYPE IF EXISTS public.benefit_model CASCADE;
CREATE TYPE public.benefit_model AS ENUM ('daily_limit', 'monthly_quota', 'unlimited');

DROP TYPE IF EXISTS public.cancellation_policy CASCADE;
CREATE TYPE public.cancellation_policy AS ENUM ('immediate', 'end_of_period');

DROP TYPE IF EXISTS public.message_trigger CASCADE;
CREATE TYPE public.message_trigger AS ENUM ('welcome', 'renewal_confirmation', 'payment_failed', 'cancellation_reminder', 'daily_limit_reached', 'monthly_quota_80');

-- 2. Core Tables
CREATE TABLE IF NOT EXISTS public.membership_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Club Café',
  description TEXT,
  cover_image TEXT,
  accent_color TEXT DEFAULT '#3B82F6',
  monthly_price DECIMAL(10,2),
  annual_price DECIMAL(10,2),
  trial_days INTEGER DEFAULT 0,
  cancellation_policy public.cancellation_policy DEFAULT 'end_of_period',
  status public.membership_status DEFAULT 'draft',
  max_subscribers INTEGER,
  active_subscribers INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.membership_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.membership_programs(id) ON DELETE CASCADE,
  benefit_type public.benefit_type NOT NULL,
  model public.benefit_model,
  item_id UUID,
  item_name TEXT,
  quantity INTEGER,
  discount_percent INTEGER,
  multiplier DECIMAL(4,2),
  config JSONB DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.membership_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.membership_programs(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  plan public.membership_plan DEFAULT 'monthly',
  status public.subscription_status DEFAULT 'active',
  price DECIMAL(10,2),
  started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  next_renewal TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.membership_consumptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.membership_subscriptions(id) ON DELETE CASCADE,
  benefit_id UUID REFERENCES public.membership_benefits(id) ON DELETE CASCADE,
  consumed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  staff_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS public.membership_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.membership_programs(id) ON DELETE CASCADE,
  trigger_type public.message_trigger NOT NULL,
  enabled BOOLEAN DEFAULT true,
  custom_text TEXT,
  whatsapp_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_membership_programs_business_id ON public.membership_programs(business_id);
CREATE INDEX IF NOT EXISTS idx_membership_programs_status ON public.membership_programs(status);
CREATE INDEX IF NOT EXISTS idx_membership_benefits_program_id ON public.membership_benefits(program_id);
CREATE INDEX IF NOT EXISTS idx_membership_subscriptions_program_id ON public.membership_subscriptions(program_id);
CREATE INDEX IF NOT EXISTS idx_membership_subscriptions_customer_id ON public.membership_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_membership_subscriptions_status ON public.membership_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_membership_consumptions_subscription_id ON public.membership_consumptions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_membership_consumptions_benefit_id ON public.membership_consumptions(benefit_id);
CREATE INDEX IF NOT EXISTS idx_membership_consumptions_consumed_at ON public.membership_consumptions(consumed_at);
CREATE INDEX IF NOT EXISTS idx_membership_messages_program_id ON public.membership_messages(program_id);

-- 4. Enable RLS
ALTER TABLE public.membership_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_consumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_messages ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "users_manage_own_membership_programs" ON public.membership_programs;
CREATE POLICY "users_manage_own_membership_programs"
ON public.membership_programs FOR ALL TO authenticated
USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_own_membership_benefits" ON public.membership_benefits;
CREATE POLICY "users_manage_own_membership_benefits"
ON public.membership_benefits FOR ALL TO authenticated
USING (program_id IN (SELECT id FROM public.membership_programs WHERE business_id = auth.uid()))
WITH CHECK (program_id IN (SELECT id FROM public.membership_programs WHERE business_id = auth.uid()));

DROP POLICY IF EXISTS "users_manage_own_membership_subscriptions" ON public.membership_subscriptions;
CREATE POLICY "users_manage_own_membership_subscriptions"
ON public.membership_subscriptions FOR ALL TO authenticated
USING (program_id IN (SELECT id FROM public.membership_programs WHERE business_id = auth.uid()))
WITH CHECK (program_id IN (SELECT id FROM public.membership_programs WHERE business_id = auth.uid()));

DROP POLICY IF EXISTS "users_manage_own_membership_consumptions" ON public.membership_consumptions;
CREATE POLICY "users_manage_own_membership_consumptions"
ON public.membership_consumptions FOR ALL TO authenticated
USING (subscription_id IN (
  SELECT ms.id FROM public.membership_subscriptions ms
  JOIN public.membership_programs mp ON ms.program_id = mp.id
  WHERE mp.business_id = auth.uid()
))
WITH CHECK (subscription_id IN (
  SELECT ms.id FROM public.membership_subscriptions ms
  JOIN public.membership_programs mp ON ms.program_id = mp.id
  WHERE mp.business_id = auth.uid()
));

DROP POLICY IF EXISTS "users_manage_own_membership_messages" ON public.membership_messages;
CREATE POLICY "users_manage_own_membership_messages"
ON public.membership_messages FOR ALL TO authenticated
USING (program_id IN (SELECT id FROM public.membership_programs WHERE business_id = auth.uid()))
WITH CHECK (program_id IN (SELECT id FROM public.membership_programs WHERE business_id = auth.uid()));

-- 6. Mock Data
DO $$
DECLARE
  existing_user_id UUID;
  prog_id UUID := gen_random_uuid();
  benefit1_id UUID := gen_random_uuid();
  benefit2_id UUID := gen_random_uuid();
  benefit3_id UUID := gen_random_uuid();
  sub1_id UUID := gen_random_uuid();
  sub2_id UUID := gen_random_uuid();
  sub3_id UUID := gen_random_uuid();
  sub4_id UUID := gen_random_uuid();
  sub5_id UUID := gen_random_uuid();
  sub6_id UUID := gen_random_uuid();
  sub7_id UUID := gen_random_uuid();
  sub8_id UUID := gen_random_uuid();
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_profiles'
  ) THEN
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;

    IF existing_user_id IS NOT NULL THEN
      -- Create membership program
      INSERT INTO public.membership_programs (
        id, business_id, name, description, cover_image, accent_color,
        monthly_price, annual_price, trial_days, cancellation_policy,
        status, max_subscribers, active_subscribers
      ) VALUES (
        prog_id, existing_user_id,
        'Club Café Premium',
        'Todo lo que necesitas para tu café diario por una cuota fija mensual. Beneficios exclusivos para nuestros socios más fieles.',
        NULL,
        '#3B82F6',
        299.00,
        2988.00,
        7,
        'end_of_period',
        'active',
        NULL,
        47
      ) ON CONFLICT (id) DO NOTHING;

      -- Benefits
      INSERT INTO public.membership_benefits (
        id, program_id, benefit_type, model, item_name, quantity, sort_order
      ) VALUES (
        benefit1_id, prog_id, 'quantity_included', 'daily_limit', 'Café Americano', 1, 1
      ) ON CONFLICT (id) DO NOTHING;

      INSERT INTO public.membership_benefits (
        id, program_id, benefit_type, discount_percent, sort_order, config
      ) VALUES (
        benefit2_id, prog_id, 'discount_percent', 20, 2,
        jsonb_build_object('applies_to', 'all', 'stackable', false)
      ) ON CONFLICT (id) DO NOTHING;

      INSERT INTO public.membership_benefits (
        id, program_id, benefit_type, multiplier, sort_order, config
      ) VALUES (
        benefit3_id, prog_id, 'points_multiplier', 2.0, 3,
        jsonb_build_object('applies_to', 'all')
      ) ON CONFLICT (id) DO NOTHING;

      -- Messages
      INSERT INTO public.membership_messages (program_id, trigger_type, enabled, custom_text) VALUES
        (prog_id, 'welcome', true, 'Bienvenido a Club Café Premium, [Nombre Cliente]! Tu membresía [Nombre Membresía] está activa. Próxima renovación: [Fecha Renovación].'),
        (prog_id, 'renewal_confirmation', true, NULL),
        (prog_id, 'payment_failed', true, NULL),
        (prog_id, 'cancellation_reminder', true, NULL),
        (prog_id, 'daily_limit_reached', true, NULL),
        (prog_id, 'monthly_quota_80', false, NULL)
      ON CONFLICT DO NOTHING;

      -- Subscriptions (8 demo subscribers)
      INSERT INTO public.membership_subscriptions (
        id, program_id, customer_id, plan, status, price, started_at, next_renewal
      ) VALUES
        (sub1_id, prog_id, existing_user_id, 'monthly', 'active', 299.00, NOW() - INTERVAL '45 days', NOW() + INTERVAL '15 days'),
        (sub2_id, prog_id, existing_user_id, 'annual', 'active', 2988.00, NOW() - INTERVAL '120 days', NOW() + INTERVAL '245 days'),
        (sub3_id, prog_id, existing_user_id, 'monthly', 'active', 299.00, NOW() - INTERVAL '30 days', NOW() + INTERVAL '1 day'),
        (sub4_id, prog_id, existing_user_id, 'monthly', 'trial', 0.00, NOW() - INTERVAL '5 days', NOW() + INTERVAL '2 days'),
        (sub5_id, prog_id, existing_user_id, 'monthly', 'active', 299.00, NOW() - INTERVAL '60 days', NOW() + INTERVAL '3 days'),
        (sub6_id, prog_id, existing_user_id, 'annual', 'active', 2988.00, NOW() - INTERVAL '200 days', NOW() + INTERVAL '165 days'),
        (sub7_id, prog_id, existing_user_id, 'monthly', 'payment_failed', 299.00, NOW() - INTERVAL '35 days', NOW() - INTERVAL '5 days'),
        (sub8_id, prog_id, existing_user_id, 'monthly', 'cancelled', 299.00, NOW() - INTERVAL '90 days', NULL)
      ON CONFLICT (id) DO NOTHING;

      -- Some consumptions for today
      INSERT INTO public.membership_consumptions (
        subscription_id, benefit_id, consumed_at, staff_id, quantity
      ) VALUES
        (sub1_id, benefit1_id, NOW() - INTERVAL '2 hours', existing_user_id, 1),
        (sub2_id, benefit1_id, NOW() - INTERVAL '1 hour', existing_user_id, 1)
      ON CONFLICT DO NOTHING;

    ELSE
      RAISE NOTICE 'No existing users found. Skipping mock data.';
    END IF;
  ELSE
    RAISE NOTICE 'Table user_profiles does not exist. Skipping mock data.';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;
