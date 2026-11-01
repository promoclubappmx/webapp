-- Order Ahead Module Migration
-- Tables: order_ahead_config, order_slots, orders, order_items, featured_items, upsell_rules

-- =====================
-- ENUMS
-- =====================
DROP TYPE IF EXISTS public.order_status CASCADE;
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'ready', 'completed', 'cancelled');

DROP TYPE IF EXISTS public.delivery_type CASCADE;
CREATE TYPE public.delivery_type AS ENUM ('pickup', 'delivery');

DROP TYPE IF EXISTS public.featured_position CASCADE;
CREATE TYPE public.featured_position AS ENUM ('top_catalog', 'checkout_suggestion', 'banner');

DROP TYPE IF EXISTS public.featured_status CASCADE;
CREATE TYPE public.featured_status AS ENUM ('active', 'paused', 'expired');

-- =====================
-- CORE TABLES
-- =====================

CREATE TABLE IF NOT EXISTS public.order_ahead_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT false,
  delivery_type public.delivery_type DEFAULT 'pickup',
  min_advance_minutes INTEGER DEFAULT 30,
  max_horizon_days INTEGER DEFAULT 7,
  allow_future_days BOOLEAN DEFAULT true,
  slot_interval_minutes INTEGER DEFAULT 30,
  max_orders_per_slot INTEGER DEFAULT 5,
  notify_push BOOLEAN DEFAULT true,
  notify_email TEXT DEFAULT 'per_order',
  notify_whatsapp TEXT,
  is_paused BOOLEAN DEFAULT false,
  paused_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.order_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES public.order_ahead_config(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0=Mon, 6=Sun
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  interval_minutes INTEGER DEFAULT 30,
  max_orders INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.order_slot_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES public.order_ahead_config(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  is_closed BOOLEAN DEFAULT true,
  override_start_time TIME,
  override_end_time TIME,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_notes TEXT,
  slot_time TIMESTAMPTZ NOT NULL,
  order_status public.order_status DEFAULT 'pending',
  payment_method TEXT DEFAULT 'on_pickup',
  subtotal DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  internal_note TEXT,
  status_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  item_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  variants JSONB DEFAULT '{}'::jsonb,
  modifiers JSONB DEFAULT '[]'::jsonb,
  line_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.featured_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  position_type public.featured_position NOT NULL,
  start_date DATE,
  end_date DATE,
  is_indefinite BOOLEAN DEFAULT false,
  max_budget_mxn DECIMAL(10,2),
  spent_budget_mxn DECIMAL(10,2) DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  attributed_orders INTEGER DEFAULT 0,
  fee_per_conversion DECIMAL(10,2) DEFAULT 0,
  accumulated_fee DECIMAL(10,2) DEFAULT 0,
  item_status public.featured_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.upsell_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL, -- 'category_contains' | 'total_less_than'
  condition_value TEXT NOT NULL,
  suggest_item_id UUID REFERENCES public.catalog_items(id) ON DELETE CASCADE,
  suggest_item_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- INDEXES
-- =====================
CREATE INDEX IF NOT EXISTS idx_order_ahead_config_business ON public.order_ahead_config(business_id);
CREATE INDEX IF NOT EXISTS idx_order_slots_config ON public.order_slots(config_id);
CREATE INDEX IF NOT EXISTS idx_orders_business ON public.orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_slot_time ON public.orders(slot_time);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_featured_items_business ON public.featured_items(business_id);
CREATE INDEX IF NOT EXISTS idx_upsell_rules_business ON public.upsell_rules(business_id);

-- =====================
-- RLS
-- =====================
ALTER TABLE public.order_ahead_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_slot_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upsell_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_order_ahead_config" ON public.order_ahead_config;
CREATE POLICY "users_manage_own_order_ahead_config" ON public.order_ahead_config
FOR ALL TO authenticated USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

DROP POLICY IF EXISTS "public_read_order_ahead_config" ON public.order_ahead_config;
CREATE POLICY "public_read_order_ahead_config" ON public.order_ahead_config
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "users_manage_own_order_slots" ON public.order_slots;
CREATE POLICY "users_manage_own_order_slots" ON public.order_slots
FOR ALL TO authenticated USING (
  config_id IN (SELECT id FROM public.order_ahead_config WHERE business_id = auth.uid())
) WITH CHECK (
  config_id IN (SELECT id FROM public.order_ahead_config WHERE business_id = auth.uid())
);

DROP POLICY IF EXISTS "public_read_order_slots" ON public.order_slots;
CREATE POLICY "public_read_order_slots" ON public.order_slots
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "users_manage_own_order_slot_exceptions" ON public.order_slot_exceptions;
CREATE POLICY "users_manage_own_order_slot_exceptions" ON public.order_slot_exceptions
FOR ALL TO authenticated USING (
  config_id IN (SELECT id FROM public.order_ahead_config WHERE business_id = auth.uid())
) WITH CHECK (
  config_id IN (SELECT id FROM public.order_ahead_config WHERE business_id = auth.uid())
);

DROP POLICY IF EXISTS "users_manage_own_orders" ON public.orders;
CREATE POLICY "users_manage_own_orders" ON public.orders
FOR ALL TO authenticated USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_own_order_items" ON public.order_items;
CREATE POLICY "users_manage_own_order_items" ON public.order_items
FOR ALL TO authenticated USING (
  order_id IN (SELECT id FROM public.orders WHERE business_id = auth.uid())
) WITH CHECK (
  order_id IN (SELECT id FROM public.orders WHERE business_id = auth.uid())
);

DROP POLICY IF EXISTS "users_manage_own_featured_items" ON public.featured_items;
CREATE POLICY "users_manage_own_featured_items" ON public.featured_items
FOR ALL TO authenticated USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_own_upsell_rules" ON public.upsell_rules;
CREATE POLICY "users_manage_own_upsell_rules" ON public.upsell_rules
FOR ALL TO authenticated USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

-- =====================
-- MOCK DATA
-- =====================
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
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_profiles'
  ) THEN
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;

    IF existing_user_id IS NOT NULL THEN
      -- Config
      INSERT INTO public.order_ahead_config (id, business_id, is_active, delivery_type, min_advance_minutes, max_horizon_days, allow_future_days, slot_interval_minutes, max_orders_per_slot, notify_push, notify_email)
      VALUES (config_uuid, existing_user_id, true, 'pickup', 30, 7, true, 30, 5, true, 'per_order')
      ON CONFLICT (id) DO NOTHING;

      -- Slots Mon-Fri
      INSERT INTO public.order_slots (config_id, day_of_week, start_time, end_time, interval_minutes, max_orders, is_active)
      VALUES
        (config_uuid, 0, '09:00', '13:00', 30, 5, true),
        (config_uuid, 0, '14:00', '20:00', 30, 5, true),
        (config_uuid, 1, '09:00', '13:00', 30, 5, true),
        (config_uuid, 1, '14:00', '20:00', 30, 5, true),
        (config_uuid, 2, '09:00', '13:00', 30, 5, true),
        (config_uuid, 3, '09:00', '13:00', 30, 5, true),
        (config_uuid, 4, '09:00', '13:00', 30, 5, true),
        (config_uuid, 5, '10:00', '18:00', 30, 8, true)
      ON CONFLICT (id) DO NOTHING;

      -- Get a catalog item if exists
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'catalog_items') THEN
        SELECT id INTO catalog_item_id FROM public.catalog_items LIMIT 1;
      END IF;

      -- Sample orders
      INSERT INTO public.orders (id, business_id, order_number, customer_name, customer_phone, slot_time, order_status, payment_method, subtotal, total, status_history)
      VALUES
        (order1_uuid, existing_user_id, '#001', 'María García', '+52 55 1234 5678', NOW() + INTERVAL '2 hours', 'pending', 'on_pickup', 285.00, 285.00, '[{"status":"pending","timestamp":"' || NOW()::TEXT || '","note":"Pedido recibido"}]'),
        (order2_uuid, existing_user_id, '#002', 'Carlos López', '+52 55 9876 5432', NOW() + INTERVAL '1 hour', 'confirmed', 'paid_online', 450.00, 450.00, '[{"status":"pending","timestamp":"' || (NOW() - INTERVAL '30 min')::TEXT || '"},{"status":"confirmed","timestamp":"' || NOW()::TEXT || '"}]'),
        (order3_uuid, existing_user_id, '#003', 'Ana Martínez', NULL, NOW() + INTERVAL '30 minutes', 'ready', 'on_pickup', 180.00, 180.00, '[{"status":"pending","timestamp":"' || (NOW() - INTERVAL '1 hour')::TEXT || '"},{"status":"confirmed","timestamp":"' || (NOW() - INTERVAL '45 min')::TEXT || '"},{"status":"ready","timestamp":"' || NOW()::TEXT || '"}]'),
        (order4_uuid, existing_user_id, '#004', 'Roberto Silva', '+52 55 5555 1234', NOW() - INTERVAL '1 hour', 'completed', 'paid_online', 320.00, 320.00, '[{"status":"completed","timestamp":"' || NOW()::TEXT || '"}]'),
        (order5_uuid, existing_user_id, '#005', 'Invitado', NULL, NOW() + INTERVAL '3 hours', 'pending', 'on_pickup', 95.00, 95.00, '[{"status":"pending","timestamp":"' || NOW()::TEXT || '"}]')
      ON CONFLICT (id) DO NOTHING;

      -- Order items
      INSERT INTO public.order_items (order_id, item_name, item_price, quantity, line_total)
      VALUES
        (order1_uuid, 'Tacos de Pastor (3)', 85.00, 2, 170.00),
        (order1_uuid, 'Agua de Jamaica', 35.00, 1, 35.00),
        (order1_uuid, 'Quesadilla de Queso', 80.00, 1, 80.00),
        (order2_uuid, 'Combo Familiar', 350.00, 1, 350.00),
        (order2_uuid, 'Refresco 600ml', 25.00, 4, 100.00),
        (order3_uuid, 'Torta Cubana', 120.00, 1, 120.00),
        (order3_uuid, 'Papa Francesa', 60.00, 1, 60.00),
        (order4_uuid, 'Pizza Mediana', 220.00, 1, 220.00),
        (order4_uuid, 'Orden de Alitas', 100.00, 1, 100.00),
        (order5_uuid, 'Café Americano', 45.00, 1, 45.00),
        (order5_uuid, 'Croissant', 50.00, 1, 50.00)
      ON CONFLICT (id) DO NOTHING;

      -- Featured items (if catalog item exists)
      IF catalog_item_id IS NOT NULL THEN
        INSERT INTO public.featured_items (business_id, catalog_item_id, item_name, position_type, is_indefinite, max_budget_mxn, impressions, attributed_orders, fee_per_conversion, accumulated_fee, item_status)
        VALUES
          (existing_user_id, catalog_item_id, 'Combo Familiar Especial', 'top_catalog', true, 500.00, 1240, 38, 5.00, 190.00, 'active'),
          (existing_user_id, catalog_item_id, 'Postre del Día', 'checkout_suggestion', false, 200.00, 890, 22, 3.00, 66.00, 'active')
        ON CONFLICT (id) DO NOTHING;

        -- Upsell rules
        INSERT INTO public.upsell_rules (business_id, rule_type, condition_value, suggest_item_id, suggest_item_name, is_active, sort_order)
        VALUES
          (existing_user_id, 'total_less_than', '200', catalog_item_id, 'Postre del Día', true, 1),
          (existing_user_id, 'category_contains', 'Tacos', catalog_item_id, 'Agua Fresca', true, 2)
        ON CONFLICT (id) DO NOTHING;
      END IF;

    ELSE
      RAISE NOTICE 'No existing users found. Run auth migration first.';
    END IF;
  ELSE
    RAISE NOTICE 'Table user_profiles does not exist.';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;
