-- Business Settings and Customer Segments Migration
-- Purpose: Business configuration, tax rates, categories, payment methods, and customer segmentation

-- 1. Ensure dependencies exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'owner',
    business_name TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Types
DROP TYPE IF EXISTS public.day_of_week CASCADE;
CREATE TYPE public.day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

DROP TYPE IF EXISTS public.payment_method_status CASCADE;
CREATE TYPE public.payment_method_status AS ENUM ('active', 'inactive');

DROP TYPE IF EXISTS public.segment_type CASCADE;
CREATE TYPE public.segment_type AS ENUM ('vip', 'regular', 'new', 'inactive', 'custom');

-- 3. Business Settings Table
CREATE TABLE IF NOT EXISTS public.business_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL UNIQUE,
    business_name TEXT NOT NULL,
    business_description TEXT,
    business_email TEXT,
    business_phone TEXT,
    business_address TEXT,
    business_city TEXT,
    business_state TEXT,
    business_postal_code TEXT,
    business_country TEXT DEFAULT 'España',
    business_logo_url TEXT,
    business_website TEXT,
    tax_id TEXT,
    default_currency TEXT DEFAULT 'EUR',
    default_language TEXT DEFAULT 'es',
    timezone TEXT DEFAULT 'Europe/Madrid',
    date_format TEXT DEFAULT 'DD/MM/YYYY',
    time_format TEXT DEFAULT '24h',
    fiscal_year_start DATE,
    enable_loyalty_program BOOLEAN DEFAULT true,
    enable_gift_cards BOOLEAN DEFAULT true,
    enable_coupons BOOLEAN DEFAULT true,
    enable_promotions BOOLEAN DEFAULT true,
    owner_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Business Hours Table
CREATE TABLE IF NOT EXISTS public.business_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    day_of_week public.day_of_week NOT NULL,
    is_open BOOLEAN DEFAULT true,
    open_time TIME,
    close_time TIME,
    is_24_hours BOOLEAN DEFAULT false,
    break_start_time TIME,
    break_end_time TIME,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_id, day_of_week)
);

-- 5. Tax Rates Table
CREATE TABLE IF NOT EXISTS public.tax_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    name TEXT NOT NULL,
    rate DECIMAL(5, 2) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    applies_to_categories TEXT[],
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Product Categories Table
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
    display_order INTEGER DEFAULT 0,
    icon TEXT,
    color TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Payment Methods Table
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    name TEXT NOT NULL,
    method_type TEXT NOT NULL,
    status public.payment_method_status DEFAULT 'active'::public.payment_method_status,
    description TEXT,
    icon TEXT,
    requires_reference BOOLEAN DEFAULT false,
    processing_fee_percentage DECIMAL(5, 2) DEFAULT 0,
    processing_fee_fixed DECIMAL(10, 2) DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    configuration JSONB DEFAULT '{}',
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. System Preferences Table
CREATE TABLE IF NOT EXISTS public.system_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL UNIQUE,
    auto_print_receipts BOOLEAN DEFAULT false,
    receipt_template TEXT DEFAULT 'standard',
    low_stock_alert_threshold INTEGER DEFAULT 10,
    enable_email_notifications BOOLEAN DEFAULT true,
    enable_sms_notifications BOOLEAN DEFAULT false,
    enable_push_notifications BOOLEAN DEFAULT true,
    auto_backup_enabled BOOLEAN DEFAULT true,
    backup_frequency TEXT DEFAULT 'daily',
    pos_idle_timeout INTEGER DEFAULT 300,
    require_customer_identification BOOLEAN DEFAULT false,
    allow_negative_inventory BOOLEAN DEFAULT false,
    round_totals BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Customer Segments Table
CREATE TABLE IF NOT EXISTS public.customer_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    segment_name TEXT NOT NULL,
    segment_type public.segment_type NOT NULL,
    description TEXT,
    color TEXT,
    icon TEXT,
    criteria JSONB DEFAULT '{}',
    customer_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. Customer Segment Assignments Table
CREATE TABLE IF NOT EXISTS public.customer_segment_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    segment_id UUID REFERENCES public.customer_segments(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    UNIQUE(customer_id, segment_id)
);

-- 11. Indexes
CREATE INDEX IF NOT EXISTS idx_business_settings_business_id ON public.business_settings(business_id);
CREATE INDEX IF NOT EXISTS idx_business_settings_owner_id ON public.business_settings(owner_id);
CREATE INDEX IF NOT EXISTS idx_business_hours_business_id ON public.business_hours(business_id);
CREATE INDEX IF NOT EXISTS idx_tax_rates_business_id ON public.tax_rates(business_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_business_id ON public.product_categories(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_business_id ON public.payment_methods(business_id);
CREATE INDEX IF NOT EXISTS idx_system_preferences_business_id ON public.system_preferences(business_id);
CREATE INDEX IF NOT EXISTS idx_customer_segments_business_id ON public.customer_segments(business_id);
CREATE INDEX IF NOT EXISTS idx_customer_segment_assignments_customer_id ON public.customer_segment_assignments(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_segment_assignments_segment_id ON public.customer_segment_assignments(segment_id);

-- 12. Enable RLS
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_segment_assignments ENABLE ROW LEVEL SECURITY;

-- 13. RLS Policies
DROP POLICY IF EXISTS "users_manage_own_business_settings" ON public.business_settings;
CREATE POLICY "users_manage_own_business_settings"
ON public.business_settings
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_business_hours" ON public.business_hours;
CREATE POLICY "users_manage_business_hours"
ON public.business_hours
FOR ALL
TO authenticated
USING (business_id IN (SELECT business_id FROM public.business_settings WHERE owner_id = auth.uid()))
WITH CHECK (business_id IN (SELECT business_id FROM public.business_settings WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "users_manage_tax_rates" ON public.tax_rates;
CREATE POLICY "users_manage_tax_rates"
ON public.tax_rates
FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "users_manage_product_categories" ON public.product_categories;
CREATE POLICY "users_manage_product_categories"
ON public.product_categories
FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "users_manage_payment_methods" ON public.payment_methods;
CREATE POLICY "users_manage_payment_methods"
ON public.payment_methods
FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "users_manage_system_preferences" ON public.system_preferences;
CREATE POLICY "users_manage_system_preferences"
ON public.system_preferences
FOR ALL
TO authenticated
USING (business_id IN (SELECT business_id FROM public.business_settings WHERE owner_id = auth.uid()))
WITH CHECK (business_id IN (SELECT business_id FROM public.business_settings WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "users_manage_customer_segments" ON public.customer_segments;
CREATE POLICY "users_manage_customer_segments"
ON public.customer_segments
FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "users_manage_segment_assignments" ON public.customer_segment_assignments;
CREATE POLICY "users_manage_segment_assignments"
ON public.customer_segment_assignments
FOR ALL
TO authenticated
USING (assigned_by = auth.uid())
WITH CHECK (assigned_by = auth.uid());

-- 14. Mock Data
DO $$
DECLARE
    existing_user_id UUID;
    business_settings_id UUID := gen_random_uuid();
    tax_rate_id UUID := gen_random_uuid();
    category_id UUID := gen_random_uuid();
    payment_method_id UUID := gen_random_uuid();
    segment_id UUID := gen_random_uuid();
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user_profiles'
    ) THEN
        SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
        
        IF existing_user_id IS NOT NULL THEN
            -- Business Settings
            INSERT INTO public.business_settings (
                id, business_id, business_name, business_description, business_email,
                business_phone, business_address, business_city, business_state,
                business_postal_code, business_country, tax_id, owner_id
            ) VALUES (
                business_settings_id, '1', 'Mi Restaurante Demo',
                'Restaurante de comida mediterránea con especialidades locales',
                'info@mirestaurante.com', '+34 912 345 678',
                'Calle Principal 123', 'Madrid', 'Madrid',
                '28001', 'España', 'B12345678', existing_user_id
            ) ON CONFLICT (business_id) DO NOTHING;

            -- Business Hours
            INSERT INTO public.business_hours (business_id, day_of_week, is_open, open_time, close_time)
            VALUES
                ('1', 'monday'::public.day_of_week, true, '09:00', '22:00'),
                ('1', 'tuesday'::public.day_of_week, true, '09:00', '22:00'),
                ('1', 'wednesday'::public.day_of_week, true, '09:00', '22:00'),
                ('1', 'thursday'::public.day_of_week, true, '09:00', '22:00'),
                ('1', 'friday'::public.day_of_week, true, '09:00', '23:00'),
                ('1', 'saturday'::public.day_of_week, true, '10:00', '23:00'),
                ('1', 'sunday'::public.day_of_week, true, '10:00', '21:00')
            ON CONFLICT (business_id, day_of_week) DO NOTHING;

            -- Tax Rates
            INSERT INTO public.tax_rates (id, business_id, name, rate, description, is_default, created_by)
            VALUES
                (tax_rate_id, '1', 'IVA General', 21.00, 'Impuesto sobre el Valor Añadido - Tipo general', true, existing_user_id),
                (gen_random_uuid(), '1', 'IVA Reducido', 10.00, 'Impuesto sobre el Valor Añadido - Tipo reducido', false, existing_user_id),
                (gen_random_uuid(), '1', 'IVA Superreducido', 4.00, 'Impuesto sobre el Valor Añadido - Tipo superreducido', false, existing_user_id)
            ON CONFLICT (id) DO NOTHING;

            -- Product Categories
            INSERT INTO public.product_categories (id, business_id, name, description, icon, color, display_order, created_by)
            VALUES
                (category_id, '1', 'Comida', 'Platos principales y entrantes', 'UtensilsCrossed', '#FF6B6B', 1, existing_user_id),
                (gen_random_uuid(), '1', 'Bebidas', 'Bebidas frías y calientes', 'Coffee', '#4ECDC4', 2, existing_user_id),
                (gen_random_uuid(), '1', 'Postres', 'Postres y dulces', 'Cake', '#FFE66D', 3, existing_user_id),
                (gen_random_uuid(), '1', 'Menús', 'Menús del día y especiales', 'MenuSquare', '#95E1D3', 4, existing_user_id)
            ON CONFLICT (id) DO NOTHING;

            -- Payment Methods
            INSERT INTO public.payment_methods (id, business_id, name, method_type, status, icon, display_order, created_by)
            VALUES
                (payment_method_id, '1', 'Efectivo', 'cash', 'active'::public.payment_method_status, 'Banknote', 1, existing_user_id),
                (gen_random_uuid(), '1', 'Tarjeta', 'card', 'active'::public.payment_method_status, 'CreditCard', 2, existing_user_id),
                (gen_random_uuid(), '1', 'Transferencia', 'transfer', 'active'::public.payment_method_status, 'ArrowRightLeft', 3, existing_user_id),
                (gen_random_uuid(), '1', 'Puntos de Lealtad', 'points', 'active'::public.payment_method_status, 'Star', 4, existing_user_id)
            ON CONFLICT (id) DO NOTHING;

            -- System Preferences
            INSERT INTO public.system_preferences (business_id, auto_print_receipts, low_stock_alert_threshold)
            VALUES ('1', false, 10)
            ON CONFLICT (business_id) DO NOTHING;

            -- Customer Segments
            INSERT INTO public.customer_segments (id, business_id, segment_name, segment_type, description, color, icon, created_by)
            VALUES
                (segment_id, '1', 'VIP', 'vip'::public.segment_type, 'Clientes de alto valor', '#FFD700', 'Crown', existing_user_id),
                (gen_random_uuid(), '1', 'Regulares', 'regular'::public.segment_type, 'Clientes frecuentes', '#4ECDC4', 'Users', existing_user_id),
                (gen_random_uuid(), '1', 'Nuevos', 'new'::public.segment_type, 'Clientes nuevos', '#95E1D3', 'UserPlus', existing_user_id),
                (gen_random_uuid(), '1', 'Inactivos', 'inactive'::public.segment_type, 'Clientes sin actividad reciente', '#95A5A6', 'UserX', existing_user_id)
            ON CONFLICT (id) DO NOTHING;

            RAISE NOTICE 'Mock data created successfully';
        ELSE
            RAISE NOTICE 'No users found in user_profiles';
        END IF;
    ELSE
        RAISE NOTICE 'Table user_profiles does not exist';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;