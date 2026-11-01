-- ============================================================
-- ORDER AHEAD MODULE MIGRATION
-- Tables: order_ahead_config, order_slots, orders, order_items,
--         featured_items, upsell_rules
-- ============================================================

-- 1. ENUM TYPES
DROP TYPE IF EXISTS public.order_ahead_status CASCADE;
CREATE TYPE public.order_ahead_status AS ENUM ('pending', 'confirmed', 'ready', 'completed', 'cancelled');

DROP TYPE IF EXISTS public.order_payment_status CASCADE;
CREATE TYPE public.order_payment_status AS ENUM ('pay_on_pickup', 'paid_online');

DROP TYPE IF EXISTS public.featured_item_position CASCADE;
CREATE TYPE public.featured_item_position AS ENUM ('top_catalog', 'checkout_suggestion', 'business_banner');

DROP TYPE IF EXISTS public.featured_item_status CASCADE;
CREATE TYPE public.featured_item_status AS ENUM ('active', 'paused', 'expired');

-- 2. CORE TABLES

-- Order Ahead global configuration per business
CREATE TABLE IF NOT EXISTS public.order_ahead_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT false,
    delivery_type TEXT DEFAULT 'pickup',
    min_advance_minutes INTEGER DEFAULT 30,
    max_horizon_days INTEGER DEFAULT 7,
    accept_future_days BOOLEAN DEFAULT true,
    notification_push BOOLEAN DEFAULT true,
    notification_email TEXT DEFAULT 'daily',
    notification_whatsapp TEXT,
    sound_alerts BOOLEAN DEFAULT true,
    is_paused BOOLEAN DEFAULT false,
    paused_until TIMESTAMPTZ,
    pause_message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Weekly slot configuration per day
CREATE TABLE IF NOT EXISTS public.order_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID REFERENCES public.order_ahead_config(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    is_active BOOLEAN DEFAULT true,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    interval_minutes INTEGER DEFAULT 30,
    max_capacity INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Special closed days / exceptions
CREATE TABLE IF NOT EXISTS public.order_ahead_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID REFERENCES public.order_ahead_config(id) ON DELETE CASCADE,
    exception_date DATE NOT NULL,
    is_closed BOOLEAN DEFAULT true,
    override_start TIME,
    override_end TIME,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Orders (Order Ahead orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_notes TEXT,
    order_status public.order_ahead_status DEFAULT 'pending',
    payment_status public.order_payment_status DEFAULT 'pay_on_pickup',
    pickup_slot TIMESTAMPTZ,
    subtotal DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    internal_note TEXT,
    cancelled_reason TEXT,
    confirmed_at TIMESTAMPTZ,
    ready_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Order items (linked to catalog_items)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    item_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    variants JSONB DEFAULT '{}',
    modifiers JSONB DEFAULT '{}',
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Order status history
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    from_status public.order_ahead_status,
    to_status public.order_ahead_status NOT NULL,
    changed_by TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Featured items (PREMIUM upsell)
CREATE TABLE IF NOT EXISTS public.featured_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    position_type public.featured_item_position DEFAULT 'top_catalog',
    status public.featured_item_status DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    max_budget DECIMAL(10,2),
    spent_budget DECIMAL(10,2) DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    attributed_orders INTEGER DEFAULT 0,
    fee_per_conversion DECIMAL(10,2) DEFAULT 0,
    total_fees DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Upsell rules
CREATE TABLE IF NOT EXISTS public.upsell_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    rule_type TEXT NOT NULL,
    condition_category TEXT,
    condition_min_amount DECIMAL(10,2),
    suggest_item_id UUID REFERENCES public.catalog_items(id) ON DELETE SET NULL,
    suggest_item_name TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_order_ahead_config_business ON public.order_ahead_config(business_id);
CREATE INDEX IF NOT EXISTS idx_order_slots_config ON public.order_slots(config_id);
CREATE INDEX IF NOT EXISTS idx_orders_business ON public.orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_pickup_slot ON public.orders(pickup_slot);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_featured_items_business ON public.featured_items(business_id);
CREATE INDEX IF NOT EXISTS idx_upsell_rules_business ON public.upsell_rules(business_id);

-- 4. ENABLE RLS
ALTER TABLE public.order_ahead_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_ahead_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upsell_rules ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES
DROP POLICY IF EXISTS "users_manage_own_order_ahead_config" ON public.order_ahead_config;
CREATE POLICY "users_manage_own_order_ahead_config" ON public.order_ahead_config
FOR ALL TO authenticated USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

DROP POLICY IF EXISTS "public_read_order_ahead_config" ON public.order_ahead_config;
CREATE POLICY "public_read_order_ahead_config" ON public.order_ahead_config
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "users_manage_own_order_slots" ON public.order_slots;
CREATE POLICY "users_manage_own_order_slots" ON public.order_slots
FOR ALL TO authenticated
USING (config_id IN (SELECT id FROM public.order_ahead_config WHERE business_id = auth.uid()))
WITH CHECK (config_id IN (SELECT id FROM public.order_ahead_config WHERE business_id = auth.uid()));

DROP POLICY IF EXISTS "users_manage_own_order_exceptions" ON public.order_ahead_exceptions;
CREATE POLICY "users_manage_own_order_exceptions" ON public.order_ahead_exceptions
FOR ALL TO authenticated
USING (config_id IN (SELECT id FROM public.order_ahead_config WHERE business_id = auth.uid()))
WITH CHECK (config_id IN (SELECT id FROM public.order_ahead_config WHERE business_id = auth.uid()));

DROP POLICY IF EXISTS "users_manage_own_orders" ON public.orders;
CREATE POLICY "users_manage_own_orders" ON public.orders
FOR ALL TO authenticated USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

DROP POLICY IF EXISTS "public_read_orders" ON public.orders;
CREATE POLICY "public_read_orders" ON public.orders
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "users_manage_own_order_items" ON public.order_items;
CREATE POLICY "users_manage_own_order_items" ON public.order_items
FOR ALL TO authenticated
USING (order_id IN (SELECT id FROM public.orders WHERE business_id = auth.uid()))
WITH CHECK (order_id IN (SELECT id FROM public.orders WHERE business_id = auth.uid()));

DROP POLICY IF EXISTS "users_manage_own_order_status_history" ON public.order_status_history;
CREATE POLICY "users_manage_own_order_status_history" ON public.order_status_history
FOR ALL TO authenticated
USING (order_id IN (SELECT id FROM public.orders WHERE business_id = auth.uid()))
WITH CHECK (order_id IN (SELECT id FROM public.orders WHERE business_id = auth.uid()));

DROP POLICY IF EXISTS "users_manage_own_featured_items" ON public.featured_items;
CREATE POLICY "users_manage_own_featured_items" ON public.featured_items
FOR ALL TO authenticated USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_own_upsell_rules" ON public.upsell_rules;
CREATE POLICY "users_manage_own_upsell_rules" ON public.upsell_rules
FOR ALL TO authenticated USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

-- 6. MOCK DATA
DO $$
DECLARE
    existing_user_id UUID;
    config_uuid UUID := gen_random_uuid();
    order1_uuid UUID := gen_random_uuid();
    order2_uuid UUID := gen_random_uuid();
    order3_uuid UUID := gen_random_uuid();
    order4_uuid UUID := gen_random_uuid();
    order5_uuid UUID := gen_random_uuid();
    catalog_item_id UUID;
BEGIN
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;

    IF existing_user_id IS NOT NULL THEN
        -- Order Ahead Config
        INSERT INTO public.order_ahead_config (id, business_id, is_active, delivery_type, min_advance_minutes, max_horizon_days, accept_future_days, notification_push, notification_email)
        VALUES (config_uuid, existing_user_id, true, 'pickup', 30, 7, true, true, 'daily')
        ON CONFLICT (id) DO NOTHING;

        -- Slots for Monday (1), Wednesday (3), Friday (5), Saturday (6)
        INSERT INTO public.order_slots (config_id, day_of_week, is_active, start_time, end_time, interval_minutes, max_capacity)
        VALUES
            (config_uuid, 1, true, '09:00', '13:00', 30, 5),
            (config_uuid, 1, true, '15:00', '20:00', 30, 5),
            (config_uuid, 3, true, '09:00', '13:00', 30, 5),
            (config_uuid, 5, true, '09:00', '21:00', 30, 8),
            (config_uuid, 6, true, '10:00', '22:00', 30, 10)
        ON CONFLICT (id) DO NOTHING;

        -- Get a catalog item if exists
        SELECT id INTO catalog_item_id FROM public.catalog_items LIMIT 1;

        -- Mock Orders
        INSERT INTO public.orders (id, business_id, order_number, customer_name, customer_phone, order_status, payment_status, pickup_slot, subtotal, total, created_at)
        VALUES
            (order1_uuid, existing_user_id, '#001', 'María García', '+52 55 1234 5678', 'pending', 'pay_on_pickup', NOW() + INTERVAL '45 minutes', 185.00, 185.00, NOW() - INTERVAL '5 minutes'),
            (order2_uuid, existing_user_id, '#002', 'Carlos López', '+52 55 9876 5432', 'confirmed', 'paid_online', NOW() + INTERVAL '1 hour', 320.00, 320.00, NOW() - INTERVAL '20 minutes'),
            (order3_uuid, existing_user_id, '#003', 'Ana Martínez', '+52 55 5555 4444', 'ready', 'pay_on_pickup', NOW() + INTERVAL '8 minutes', 95.00, 95.00, NOW() - INTERVAL '45 minutes'),
            (order4_uuid, existing_user_id, '#004', 'Roberto Sánchez', '+52 55 3333 2222', 'completed', 'paid_online', NOW() - INTERVAL '2 hours', 450.00, 450.00, NOW() - INTERVAL '3 hours'),
            (order5_uuid, existing_user_id, '#005', 'Invitado', NULL, 'pending', 'pay_on_pickup', NOW() + INTERVAL '2 hours', 75.00, 75.00, NOW() - INTERVAL '2 minutes')
        ON CONFLICT (id) DO NOTHING;

        -- Order items
        INSERT INTO public.order_items (order_id, item_name, item_price, quantity, subtotal)
        VALUES
            (order1_uuid, 'Tacos de Canasta x3', 85.00, 1, 85.00),
            (order1_uuid, 'Agua de Jamaica 1L', 35.00, 1, 35.00),
            (order1_uuid, 'Quesadilla de Flor', 65.00, 1, 65.00),
            (order2_uuid, 'Combo Familiar', 320.00, 1, 320.00),
            (order3_uuid, 'Torta Cubana', 95.00, 1, 95.00),
            (order4_uuid, 'Menú del Día x4', 450.00, 1, 450.00),
            (order5_uuid, 'Café Americano', 45.00, 1, 45.00),
            (order5_uuid, 'Pan de Dulce', 30.00, 1, 30.00)
        ON CONFLICT (id) DO NOTHING;

        -- Status history
        INSERT INTO public.order_status_history (order_id, from_status, to_status, changed_by)
        VALUES
            (order2_uuid, 'pending', 'confirmed', 'staff'),
            (order3_uuid, 'pending', 'confirmed', 'staff'),
            (order3_uuid, 'confirmed', 'ready', 'staff'),
            (order4_uuid, 'pending', 'confirmed', 'staff'),
            (order4_uuid, 'confirmed', 'ready', 'staff'),
            (order4_uuid, 'ready', 'completed', 'staff')
        ON CONFLICT (id) DO NOTHING;

        -- Featured items mock
        INSERT INTO public.featured_items (business_id, item_name, position_type, status, impressions, attributed_orders, fee_per_conversion, total_fees)
        VALUES
            (existing_user_id, 'Combo Familiar Premium', 'top_catalog', 'active', 342, 28, 15.00, 420.00),
            (existing_user_id, 'Postre del Día', 'checkout_suggestion', 'active', 189, 15, 10.00, 150.00),
            (existing_user_id, 'Menú Especial Fin de Semana', 'business_banner', 'paused', 95, 7, 12.00, 84.00)
        ON CONFLICT (id) DO NOTHING;

        -- Upsell rules
        INSERT INTO public.upsell_rules (business_id, is_active, rule_type, condition_min_amount, suggest_item_name, sort_order)
        VALUES
            (existing_user_id, true, 'min_amount', 150.00, 'Postre del Día', 1),
            (existing_user_id, true, 'category', NULL, 'Agua Fresca 1L', 2),
            (existing_user_id, false, 'min_amount', 300.00, 'Combo Familiar Premium', 3)
        ON CONFLICT (id) DO NOTHING;

    ELSE
        RAISE NOTICE 'No existing users found. Run auth migration first.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Order Ahead mock data failed: %', SQLERRM;
END $$;
