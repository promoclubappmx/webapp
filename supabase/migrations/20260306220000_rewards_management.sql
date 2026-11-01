-- Rewards Management Module Migration
-- Tables: punch_cards, punch_card_stamps, vip_levels, vip_level_benefits, customer_vip_levels, surprise_rewards_config, exclusive_experiences
-- Business Rules: $5 MXN = 1 punto, 1 punto = $0.15 MXN

-- 1. ENUM TYPES
DROP TYPE IF EXISTS public.punch_card_status CASCADE;
CREATE TYPE public.punch_card_status AS ENUM ('active', 'draft', 'paused', 'expired', 'archived');

DROP TYPE IF EXISTS public.punch_card_stamp_rule CASCADE;
CREATE TYPE public.punch_card_stamp_rule AS ENUM ('visit', 'amount', 'product');

DROP TYPE IF EXISTS public.punch_card_validity_type CASCADE;
CREATE TYPE public.punch_card_validity_type AS ENUM ('none', 'from_activation', 'fixed_date');

DROP TYPE IF EXISTS public.punch_card_reward_type CASCADE;
CREATE TYPE public.punch_card_reward_type AS ENUM ('free_item', 'discount', 'points', 'experience', 'upgrade');

DROP TYPE IF EXISTS public.vip_criterion CASCADE;
CREATE TYPE public.vip_criterion AS ENUM ('visits', 'points', 'spend');

DROP TYPE IF EXISTS public.vip_evaluation_type CASCADE;
CREATE TYPE public.vip_evaluation_type AS ENUM ('lifetime', 'periodic');

DROP TYPE IF EXISTS public.surprise_mechanic CASCADE;
CREATE TYPE public.surprise_mechanic AS ENUM ('wheel', 'scratch', 'chest', 'envelope');

DROP TYPE IF EXISTS public.experience_access_type CASCADE;
CREATE TYPE public.experience_access_type AS ENUM ('all', 'level', 'points', 'visits', 'punch');

-- 2. CORE TABLES

-- Punch Cards
CREATE TABLE IF NOT EXISTS public.punch_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    stamp_icon TEXT DEFAULT 'star',
    card_color TEXT DEFAULT '#7C3AED',
    stamp_rule public.punch_card_stamp_rule DEFAULT 'visit',
    stamp_amount NUMERIC(10,2),
    stamp_product TEXT,
    stamp_count INTEGER DEFAULT 8 CHECK (stamp_count BETWEEN 3 AND 30),
    reward_type public.punch_card_reward_type DEFAULT 'free_item',
    reward_value TEXT,
    reward_discount NUMERIC(5,2),
    reward_points INTEGER,
    validity_type public.punch_card_validity_type DEFAULT 'from_activation',
    validity_days INTEGER DEFAULT 90,
    validity_date DATE,
    auto_renew BOOLEAN DEFAULT true,
    show_progress BOOLEAN DEFAULT true,
    is_seasonal BOOLEAN DEFAULT false,
    season_start DATE,
    season_end DATE,
    status public.punch_card_status DEFAULT 'draft',
    sort_order INTEGER DEFAULT 0,
    active_clients INTEGER DEFAULT 0,
    avg_progress NUMERIC(4,2) DEFAULT 0,
    completion_rate NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- VIP Level Configuration
CREATE TABLE IF NOT EXISTS public.vip_levels_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    criterion public.vip_criterion DEFAULT 'visits',
    evaluation_type public.vip_evaluation_type DEFAULT 'lifetime',
    eval_frequency_months INTEGER DEFAULT 6,
    send_warning BOOLEAN DEFAULT true,
    warning_days INTEGER DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_id)
);

-- VIP Levels
CREATE TABLE IF NOT EXISTS public.vip_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '🥉',
    color TEXT DEFAULT '#CD7F32',
    threshold INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    clients_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- VIP Level Benefits
CREATE TABLE IF NOT EXISTS public.vip_level_benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vip_level_id UUID REFERENCES public.vip_levels(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    benefit_type TEXT NOT NULL,
    benefit_value TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Customer VIP Level Assignments
CREATE TABLE IF NOT EXISTS public.customer_vip_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
    vip_level_id UUID REFERENCES public.vip_levels(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_id, customer_id)
);

-- Surprise Rewards Configuration
CREATE TABLE IF NOT EXISTS public.surprise_rewards_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    mechanic public.surprise_mechanic DEFAULT 'wheel',
    prizes JSONB DEFAULT '[]'::jsonb,
    triggers JSONB DEFAULT '{"post_checkin": true, "post_coupon": false, "punch_complete": false, "milestone": false, "manual": false}'::jsonb,
    frequency TEXT DEFAULT 'per_visit',
    budget_enabled BOOLEAN DEFAULT false,
    monthly_budget NUMERIC(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_id)
);

-- Exclusive Experiences
CREATE TABLE IF NOT EXISTS public.exclusive_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    emoji TEXT DEFAULT '⭐',
    inventory INTEGER DEFAULT 5,
    inventory_used INTEGER DEFAULT 0,
    duration TEXT,
    access_type public.experience_access_type DEFAULT 'level',
    access_level TEXT DEFAULT 'gold',
    access_points INTEGER,
    access_visits INTEGER,
    perceived_value NUMERIC(10,2),
    has_date BOOLEAN DEFAULT false,
    event_date DATE,
    event_time TIME,
    status TEXT DEFAULT 'active',
    claimed INTEGER DEFAULT 0,
    waitlist INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_punch_cards_business_id ON public.punch_cards(business_id);
CREATE INDEX IF NOT EXISTS idx_punch_cards_status ON public.punch_cards(status);
CREATE INDEX IF NOT EXISTS idx_vip_levels_business_id ON public.vip_levels(business_id);
CREATE INDEX IF NOT EXISTS idx_vip_level_benefits_level_id ON public.vip_level_benefits(vip_level_id);
CREATE INDEX IF NOT EXISTS idx_customer_vip_assignments_business ON public.customer_vip_assignments(business_id);
CREATE INDEX IF NOT EXISTS idx_exclusive_experiences_business ON public.exclusive_experiences(business_id);

-- 4. ENABLE RLS
ALTER TABLE public.punch_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_levels_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_level_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_vip_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surprise_rewards_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exclusive_experiences ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES
DROP POLICY IF EXISTS "users_manage_punch_cards" ON public.punch_cards;
CREATE POLICY "users_manage_punch_cards" ON public.punch_cards
FOR ALL TO authenticated USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_vip_levels_config" ON public.vip_levels_config;
CREATE POLICY "users_manage_vip_levels_config" ON public.vip_levels_config
FOR ALL TO authenticated USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_vip_levels" ON public.vip_levels;
CREATE POLICY "users_manage_vip_levels" ON public.vip_levels
FOR ALL TO authenticated USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_vip_level_benefits" ON public.vip_level_benefits;
CREATE POLICY "users_manage_vip_level_benefits" ON public.vip_level_benefits
FOR ALL TO authenticated USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_customer_vip_assignments" ON public.customer_vip_assignments;
CREATE POLICY "users_manage_customer_vip_assignments" ON public.customer_vip_assignments
FOR ALL TO authenticated USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_surprise_rewards_config" ON public.surprise_rewards_config;
CREATE POLICY "users_manage_surprise_rewards_config" ON public.surprise_rewards_config
FOR ALL TO authenticated USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_exclusive_experiences" ON public.exclusive_experiences;
CREATE POLICY "users_manage_exclusive_experiences" ON public.exclusive_experiences
FOR ALL TO authenticated USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

-- 6. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.update_rewards_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS punch_cards_updated_at ON public.punch_cards;
CREATE TRIGGER punch_cards_updated_at
    BEFORE UPDATE ON public.punch_cards
    FOR EACH ROW EXECUTE FUNCTION public.update_rewards_updated_at();

DROP TRIGGER IF EXISTS surprise_rewards_config_updated_at ON public.surprise_rewards_config;
CREATE TRIGGER surprise_rewards_config_updated_at
    BEFORE UPDATE ON public.surprise_rewards_config
    FOR EACH ROW EXECUTE FUNCTION public.update_rewards_updated_at();

DROP TRIGGER IF EXISTS exclusive_experiences_updated_at ON public.exclusive_experiences;
CREATE TRIGGER exclusive_experiences_updated_at
    BEFORE UPDATE ON public.exclusive_experiences
    FOR EACH ROW EXECUTE FUNCTION public.update_rewards_updated_at();

-- 7. MOCK DATA
DO $$
DECLARE
    existing_user_id UUID;
    pc1_id UUID := gen_random_uuid();
    pc2_id UUID := gen_random_uuid();
    pc3_id UUID := gen_random_uuid();
    vl1_id UUID := gen_random_uuid();
    vl2_id UUID := gen_random_uuid();
    vl3_id UUID := gen_random_uuid();
    exp1_id UUID := gen_random_uuid();
    exp2_id UUID := gen_random_uuid();
    exp3_id UUID := gen_random_uuid();
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'user_profiles'
    ) THEN
        SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;

        IF existing_user_id IS NOT NULL THEN
            -- Punch Cards
            INSERT INTO public.punch_cards (
                id, business_id, name, stamp_icon, card_color, stamp_rule, stamp_count,
                reward_type, reward_value, validity_type, validity_days, auto_renew,
                show_progress, status, active_clients, avg_progress, completion_rate, sort_order
            ) VALUES
            (
                pc1_id, existing_user_id, 'Tarjeta del Cafecito', 'coffee', '#7C3AED', 'visit', 8,
                'free_item', 'Cafe americano gratis', 'from_activation', 90, true,
                true, 'active', 156, 4.2, 32, 1
            ),
            (
                pc2_id, existing_user_id, 'Ruta del Smoothie', 'leaf', '#059669', 'amount', 6,
                'discount', '30% descuento en proxima visita', 'fixed_date', null, false,
                true, 'active', 89, 2.8, 18, 2
            ),
            (
                pc3_id, existing_user_id, 'Mi Corte de Siempre', 'scissors', '#D97706', 'product', 5,
                'free_item', 'Corte de cabello gratis', 'none', null, true,
                true, 'draft', 0, 0, 0, 3
            )
            ON CONFLICT (id) DO NOTHING;

            UPDATE public.punch_cards SET stamp_amount = 150 WHERE id = pc2_id;
            UPDATE public.punch_cards SET stamp_product = 'Corte de cabello', validity_date = '2026-06-30' WHERE id = pc2_id;

            -- VIP Levels Config
            INSERT INTO public.vip_levels_config (
                business_id, criterion, evaluation_type, eval_frequency_months, send_warning, warning_days
            ) VALUES (
                existing_user_id, 'visits', 'lifetime', 6, true, 30
            ) ON CONFLICT (business_id) DO NOTHING;

            -- VIP Levels
            INSERT INTO public.vip_levels (
                id, business_id, name, icon, color, threshold, sort_order, clients_count
            ) VALUES
            (vl1_id, existing_user_id, 'Bronce', '🥉', '#CD7F32', 0, 1, 280),
            (vl2_id, existing_user_id, 'Plata', '🥈', '#C0C0C0', 10, 2, 45),
            (vl3_id, existing_user_id, 'Oro', '🥇', '#FFD700', 25, 3, 12)
            ON CONFLICT (id) DO NOTHING;

            -- VIP Level Benefits
            INSERT INTO public.vip_level_benefits (vip_level_id, business_id, benefit_type, benefit_value, sort_order) VALUES
            (vl1_id, existing_user_id, 'welcome_points', '50 puntos al registrarse (= $7.50 MXN)', 1),
            (vl2_id, existing_user_id, 'points_multiplier', 'x1.25 puntos en cada compra', 1),
            (vl2_id, existing_user_id, 'discount', '5% en todas las compras', 2),
            (vl2_id, existing_user_id, 'welcome_points', '+100 puntos al alcanzar Plata (= $15 MXN)', 3),
            (vl3_id, existing_user_id, 'points_multiplier', 'x1.5 puntos en cada compra', 1),
            (vl3_id, existing_user_id, 'discount', '10% en todas las compras', 2),
            (vl3_id, existing_user_id, 'early_access', 'Promos 24h antes que el publico', 3),
            (vl3_id, existing_user_id, 'free_product', '1 cafe gratis por semana', 4),
            (vl3_id, existing_user_id, 'welcome_points', '+300 puntos al alcanzar Oro (= $45 MXN)', 5)
            ON CONFLICT (id) DO NOTHING;

            -- Surprise Rewards Config
            INSERT INTO public.surprise_rewards_config (
                business_id, mechanic, prizes, triggers, frequency, budget_enabled, monthly_budget, is_active
            ) VALUES (
                existing_user_id,
                'wheel',
                jsonb_build_array(
                    jsonb_build_object('id', 1, 'name', '5 puntos extra (= $0.75 MXN)', 'type', 'points', 'value', '5 pts', 'probability', 40, 'color', '#3B82F6'),
                    jsonb_build_object('id', 2, 'name', '10 puntos extra (= $1.50 MXN)', 'type', 'points', 'value', '10 pts', 'probability', 25, 'color', '#1D4ED8'),
                    jsonb_build_object('id', 3, 'name', '15% de descuento', 'type', 'coupon', 'value', '15%', 'probability', 20, 'color', '#059669'),
                    jsonb_build_object('id', 4, 'name', 'Galleta gratis', 'type', 'product', 'value', '1 galleta', 'probability', 10, 'color', '#D97706'),
                    jsonb_build_object('id', 5, 'name', 'Cafe gratis', 'type', 'product', 'value', '1 cafe', 'probability', 4, 'color', '#FFD700'),
                    jsonb_build_object('id', 6, 'name', '30% de descuento', 'type', 'coupon', 'value', '30%', 'probability', 1, 'color', '#DC2626')
                ),
                jsonb_build_object('post_checkin', true, 'post_coupon', false, 'punch_complete', true, 'milestone', false, 'manual', false),
                'per_visit',
                false,
                2000,
                true
            ) ON CONFLICT (business_id) DO NOTHING;

            -- Exclusive Experiences
            INSERT INTO public.exclusive_experiences (
                id, business_id, name, description, emoji, inventory, inventory_used,
                duration, access_type, access_level, access_points, perceived_value,
                has_date, status, claimed, waitlist
            ) VALUES
            (
                exp1_id, existing_user_id,
                'Cata privada con el barista',
                'Una hora con nuestro barista principal aprendiendo los secretos del cafe de especialidad. Incluye degustacion de 5 origenes, tu taza para llevar, y 200 puntos bonus (= $30 MXN).',
                '☕', 5, 2, '60 minutos', 'level', 'gold', 500, 800,
                false, 'active', 2, 3
            ),
            (
                exp2_id, existing_user_id,
                'Sesion VIP con el estilista principal',
                'Sesion personalizada de 90 minutos con nuestro estilista estrella. Incluye diagnostico de cabello, tratamiento premium y estilizado.',
                '✂️', 3, 3, '90 minutos', 'points', 'gold', 1000, 1200,
                false, 'sold_out', 3, 8
            ),
            (
                exp3_id, existing_user_id,
                'Mesa degustacion exclusiva',
                'Mesa para 2 personas con menu degustacion de 7 tiempos maridado con vinos de la casa. Experiencia unica de 3 horas.',
                '🍷', 10, 1, '3 horas', 'level', 'gold', null, 2500,
                true, 'active', 1, 0
            )
            ON CONFLICT (id) DO NOTHING;

            UPDATE public.exclusive_experiences SET event_date = '2026-04-15', event_time = '20:00' WHERE id = exp3_id;

        ELSE
            RAISE NOTICE 'No existing users found. Run auth migration first.';
        END IF;
    ELSE
        RAISE NOTICE 'Table user_profiles does not exist. Run auth migration first.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Rewards mock data insertion failed: %', SQLERRM;
END $$;
