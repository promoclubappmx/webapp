-- ============================================================
-- ACHIEVEMENTS SYSTEM MIGRATION
-- ============================================================

-- 1. ENUM TYPES
DROP TYPE IF EXISTS public.achievement_rarity CASCADE;
CREATE TYPE public.achievement_rarity AS ENUM ('comun', 'raro', 'epico', 'legendario', 'unico');

DROP TYPE IF EXISTS public.achievement_category CASCADE;
CREATE TYPE public.achievement_category AS ENUM ('visitas', 'gasto', 'antiguedad', 'social', 'catalogo', 'lealtad', 'momentos', 'ecosistema', 'personalizado');

DROP TYPE IF EXISTS public.achievement_secondary_action CASCADE;
CREATE TYPE public.achievement_secondary_action AS ENUM ('ninguna', 'cupon_automatico', 'activar_punch_card', 'whatsapp_owner', 'subir_nivel_vip');

-- 2. ACHIEVEMENT CATALOG (standard achievements defined by system)
CREATE TABLE IF NOT EXISTS public.achievement_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    category public.achievement_category NOT NULL,
    name TEXT NOT NULL,
    description_locked TEXT NOT NULL DEFAULT '',
    description_unlocked TEXT NOT NULL DEFAULT '',
    emoji TEXT NOT NULL DEFAULT '🏆',
    color TEXT NOT NULL DEFAULT '#6B7280',
    rarity public.achievement_rarity NOT NULL DEFAULT 'comun',
    condition_type TEXT NOT NULL,
    condition_value NUMERIC,
    condition_config JSONB DEFAULT '{}',
    reward_points INTEGER DEFAULT 0,
    celebration_message TEXT DEFAULT '',
    secondary_action public.achievement_secondary_action DEFAULT 'ninguna',
    secondary_action_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_deletable BOOLEAN DEFAULT true,
    is_visible_locked BOOLEAN DEFAULT true,
    allow_share BOOLEAN DEFAULT true,
    retroactive_eval BOOLEAN DEFAULT false,
    whatsapp_notify BOOLEAN DEFAULT false,
    founder_quota INTEGER,
    founder_granted INTEGER DEFAULT 0,
    early_adopter_deadline TIMESTAMPTZ,
    is_closed BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. BUSINESS ACHIEVEMENTS SYSTEM CONFIG
CREATE TABLE IF NOT EXISTS public.business_achievements_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE,
    system_active BOOLEAN DEFAULT true,
    notify_on_unlock BOOLEAN DEFAULT true,
    notify_nearby BOOLEAN DEFAULT true,
    notify_anniversary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. CUSTOMER ACHIEVEMENTS (earned badges)
CREATE TABLE IF NOT EXISTS public.customer_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES public.achievement_catalog(id) ON DELETE CASCADE,
    customer_id UUID,
    earned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    points_awarded INTEGER DEFAULT 0,
    UNIQUE(achievement_id, customer_id)
);

-- 5. CUSTOM ACHIEVEMENTS (manually granted)
CREATE TABLE IF NOT EXISTS public.custom_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description_locked TEXT DEFAULT '',
    description_unlocked TEXT DEFAULT '',
    emoji TEXT DEFAULT '🏆',
    color TEXT DEFAULT '#6B7280',
    rarity public.achievement_rarity DEFAULT 'comun',
    internal_condition TEXT DEFAULT '',
    reward_points INTEGER DEFAULT 0,
    celebration_message TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. INDEXES
CREATE INDEX IF NOT EXISTS idx_achievement_catalog_business ON public.achievement_catalog(business_id);
CREATE INDEX IF NOT EXISTS idx_achievement_catalog_category ON public.achievement_catalog(category);
CREATE INDEX IF NOT EXISTS idx_achievement_catalog_active ON public.achievement_catalog(is_active);
CREATE INDEX IF NOT EXISTS idx_customer_achievements_business ON public.customer_achievements(business_id);
CREATE INDEX IF NOT EXISTS idx_customer_achievements_achievement ON public.customer_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_custom_achievements_business ON public.custom_achievements(business_id);

-- 7. ENABLE RLS
ALTER TABLE public.achievement_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_achievements_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_achievements ENABLE ROW LEVEL SECURITY;

-- 8. RLS POLICIES
DROP POLICY IF EXISTS "users_manage_achievement_catalog" ON public.achievement_catalog;
CREATE POLICY "users_manage_achievement_catalog" ON public.achievement_catalog
FOR ALL TO authenticated USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_achievements_config" ON public.business_achievements_config;
CREATE POLICY "users_manage_achievements_config" ON public.business_achievements_config
FOR ALL TO authenticated USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_customer_achievements" ON public.customer_achievements;
CREATE POLICY "users_manage_customer_achievements" ON public.customer_achievements
FOR ALL TO authenticated USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_custom_achievements" ON public.custom_achievements;
CREATE POLICY "users_manage_custom_achievements" ON public.custom_achievements
FOR ALL TO authenticated USING (business_id = auth.uid()) WITH CHECK (business_id = auth.uid());

-- 9. UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.update_achievements_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_achievement_catalog_updated_at ON public.achievement_catalog;
CREATE TRIGGER trg_achievement_catalog_updated_at
    BEFORE UPDATE ON public.achievement_catalog
    FOR EACH ROW EXECUTE FUNCTION public.update_achievements_updated_at();

DROP TRIGGER IF EXISTS trg_custom_achievements_updated_at ON public.custom_achievements;
CREATE TRIGGER trg_custom_achievements_updated_at
    BEFORE UPDATE ON public.custom_achievements
    FOR EACH ROW EXECUTE FUNCTION public.update_achievements_updated_at();
