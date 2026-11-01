-- ============================================================
-- Módulo: Planes y Facturación
-- Tablas: subscription_plans, user_subscriptions, billing_invoices, billing_payment_methods
-- ============================================================

-- 1. TYPES
DROP TYPE IF EXISTS public.subscription_status_type CASCADE;
CREATE TYPE public.subscription_status_type AS ENUM ('active', 'inactive', 'cancelled', 'trial', 'past_due', 'pending');

DROP TYPE IF EXISTS public.billing_cycle_type CASCADE;
CREATE TYPE public.billing_cycle_type AS ENUM ('monthly', 'annual', 'lifetime');

DROP TYPE IF EXISTS public.invoice_status_type CASCADE;
CREATE TYPE public.invoice_status_type AS ENUM ('paid', 'pending', 'overdue', 'cancelled', 'refunded');

DROP TYPE IF EXISTS public.payment_method_type CASCADE;
CREATE TYPE public.payment_method_type AS ENUM ('card', 'bank_transfer', 'paypal', 'oxxo', 'spei');

-- 2. CORE TABLES

-- Planes disponibles en el sistema
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_annual DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'MXN',
    features JSONB DEFAULT '[]'::jsonb,
    max_establishments INTEGER DEFAULT 1,
    max_staff INTEGER DEFAULT 5,
    max_products INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Suscripciones de usuarios
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
    plan_slug TEXT NOT NULL DEFAULT 'free',
    status public.subscription_status_type DEFAULT 'active'::public.subscription_status_type,
    billing_cycle public.billing_cycle_type DEFAULT 'monthly'::public.billing_cycle_type,
    current_period_start TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    current_period_end TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    auto_renew BOOLEAN DEFAULT true,
    amount DECIMAL(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'MXN',
    external_subscription_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Historial de facturas
CREATE TABLE IF NOT EXISTS public.billing_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    status public.invoice_status_type DEFAULT 'pending'::public.invoice_status_type,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'MXN',
    description TEXT,
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    pdf_url TEXT,
    xml_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Métodos de pago
CREATE TABLE IF NOT EXISTS public.billing_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    type public.payment_method_type DEFAULT 'card'::public.payment_method_type,
    is_default BOOLEAN DEFAULT false,
    card_brand TEXT,
    card_last4 TEXT,
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    card_holder_name TEXT,
    bank_name TEXT,
    account_last4 TEXT,
    external_payment_method_id TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON public.user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_user_id ON public.billing_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_subscription_id ON public.billing_invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_status ON public.billing_invoices(status);
CREATE INDEX IF NOT EXISTS idx_billing_payment_methods_user_id ON public.billing_payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_slug ON public.subscription_plans(slug);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON public.subscription_plans(is_active);

-- 4. FUNCTIONS
CREATE OR REPLACE FUNCTION public.update_updated_at_billing()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- 5. ENABLE RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_payment_methods ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES

-- subscription_plans: lectura pública, escritura solo admin
DROP POLICY IF EXISTS "public_read_subscription_plans" ON public.subscription_plans;
CREATE POLICY "public_read_subscription_plans"
ON public.subscription_plans
FOR SELECT
TO public
USING (is_active = true);

-- user_subscriptions: usuario gestiona las propias
DROP POLICY IF EXISTS "users_manage_own_subscriptions" ON public.user_subscriptions;
CREATE POLICY "users_manage_own_subscriptions"
ON public.user_subscriptions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- billing_invoices: usuario ve las propias
DROP POLICY IF EXISTS "users_manage_own_billing_invoices" ON public.billing_invoices;
CREATE POLICY "users_manage_own_billing_invoices"
ON public.billing_invoices
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- billing_payment_methods: usuario gestiona los propios
DROP POLICY IF EXISTS "users_manage_own_payment_methods" ON public.billing_payment_methods;
CREATE POLICY "users_manage_own_payment_methods"
ON public.billing_payment_methods
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 7. TRIGGERS
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_billing();

DROP TRIGGER IF EXISTS update_billing_invoices_updated_at ON public.billing_invoices;
CREATE TRIGGER update_billing_invoices_updated_at
    BEFORE UPDATE ON public.billing_invoices
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_billing();

DROP TRIGGER IF EXISTS update_billing_payment_methods_updated_at ON public.billing_payment_methods;
CREATE TRIGGER update_billing_payment_methods_updated_at
    BEFORE UPDATE ON public.billing_payment_methods
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_billing();

-- 8. SEED: Planes del sistema
INSERT INTO public.subscription_plans (id, name, slug, description, price_monthly, price_annual, currency, features, max_establishments, max_staff, max_products, is_active, is_popular, sort_order)
VALUES
    (gen_random_uuid(), 'Gratis', 'free', 'Ideal para comenzar y explorar la plataforma', 0, 0, 'MXN',
     '["1 establecimiento","Hasta 5 productos","Soporte por email","Panel básico de analíticas"]'::jsonb,
     1, 2, 5, true, false, 1),
    (gen_random_uuid(), 'Starter', 'starter', 'Para negocios que están creciendo', 299, 2990, 'MXN',
     '["1 establecimiento","Hasta 50 productos","Cupones y promociones","Programa de lealtad básico","Soporte prioritario"]'::jsonb,
     1, 5, 50, true, false, 2),
    (gen_random_uuid(), 'Pro', 'pro', 'La solución completa para negocios establecidos', 699, 6990, 'MXN',
     '["3 establecimientos","Productos ilimitados","CRM completo","Campañas de marketing","Automatizaciones","Analíticas avanzadas","Soporte 24/7"]'::jsonb,
     3, 20, 500, true, true, 3),
    (gen_random_uuid(), 'Enterprise', 'enterprise', 'Para cadenas y franquicias con múltiples sucursales', 1499, 14990, 'MXN',
     '["Establecimientos ilimitados","Productos ilimitados","Multi-ubicación","API personalizada","Manager de cuenta dedicado","SLA garantizado","Integraciones avanzadas"]'::jsonb,
     -1, -1, -1, true, false, 4)
ON CONFLICT (slug) DO NOTHING;
