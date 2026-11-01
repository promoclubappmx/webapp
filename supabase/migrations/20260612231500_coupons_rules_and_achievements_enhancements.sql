-- ============================================================
-- COUPONS RULES ENHANCEMENTS + ACHIEVEMENTS CONDITION SUPPORT
-- ============================================================

-- ─── 1. COUPONS TABLE: ADD MISSING FIELDS ─────────────────────────────────────

-- Coupon type: 'promotion' | 'recovery' | 'standard'
ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS coupon_type TEXT DEFAULT 'standard';

-- Valid establishments: 'all' or JSON array of location ids/names
ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS valid_establishments TEXT DEFAULT 'all';

ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS valid_establishments_list JSONB DEFAULT '[]'::jsonb;

-- Customer segment targeting
ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS customer_segment TEXT DEFAULT 'all';

ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS customer_segment_custom TEXT;

-- Transferability
ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS is_transferable BOOLEAN DEFAULT false;

-- Combinability with other promotions and coupons
ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS combinable_with_promos BOOLEAN DEFAULT false;

ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS combinable_with_coupons BOOLEAN DEFAULT false;

-- Terms and conditions (auto-generated + user editable)
ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT DEFAULT '';

-- Extended config for trigger-based coupons (promotion/recovery specific)
ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS trigger_config JSONB DEFAULT '{}'::jsonb;

-- Notification channels config
ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS notification_channels JSONB DEFAULT '{}'::jsonb;

-- Visual design config (color, image, template)
ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS design_config JSONB DEFAULT '{}'::jsonb;

-- ─── 2. ACHIEVEMENT_CATALOG: ADD IMPACT TRACKING COLUMNS ──────────────────────

-- Impact stats: how many customers currently meet the condition
ALTER TABLE public.achievement_catalog
ADD COLUMN IF NOT EXISTS impact_meets_count INTEGER DEFAULT 0;

-- How many customers are close to meeting the condition (within 5 visits/units)
ALTER TABLE public.achievement_catalog
ADD COLUMN IF NOT EXISTS impact_near_count INTEGER DEFAULT 0;

-- Last time impact was recalculated
ALTER TABLE public.achievement_catalog
ADD COLUMN IF NOT EXISTS impact_last_calculated_at TIMESTAMPTZ;

-- Birthday window: 'exact' | '3days'
ALTER TABLE public.achievement_catalog
ADD COLUMN IF NOT EXISTS birthday_window TEXT DEFAULT '3days';

-- Time-of-visit: hour threshold (stored as HH:MM text)
ALTER TABLE public.achievement_catalog
ADD COLUMN IF NOT EXISTS visit_hour_threshold TEXT;

-- Time-of-visit: require different days (not same day)
ALTER TABLE public.achievement_catalog
ADD COLUMN IF NOT EXISTS visit_different_days BOOLEAN DEFAULT true;

-- Day of week: 0=Monday ... 6=Sunday
ALTER TABLE public.achievement_catalog
ADD COLUMN IF NOT EXISTS day_of_week INTEGER;

-- Minimum rating for review achievements (null = no minimum)
ALTER TABLE public.achievement_catalog
ADD COLUMN IF NOT EXISTS min_review_rating INTEGER;

-- Require minimum rating toggle
ALTER TABLE public.achievement_catalog
ADD COLUMN IF NOT EXISTS require_min_rating BOOLEAN DEFAULT false;

-- Punch card scope: 'all' | specific punch_card_id
ALTER TABLE public.achievement_catalog
ADD COLUMN IF NOT EXISTS punch_card_scope TEXT DEFAULT 'all';

ALTER TABLE public.achievement_catalog
ADD COLUMN IF NOT EXISTS punch_card_id UUID;

-- Seniority: require active visits toggle
ALTER TABLE public.achievement_catalog
ADD COLUMN IF NOT EXISTS seniority_require_active BOOLEAN DEFAULT false;

ALTER TABLE public.achievement_catalog
ADD COLUMN IF NOT EXISTS seniority_active_visits INTEGER;

ALTER TABLE public.achievement_catalog
ADD COLUMN IF NOT EXISTS seniority_active_days INTEGER;

-- ─── 3. INDEXES ───────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_coupons_coupon_type ON public.coupons(coupon_type);
CREATE INDEX IF NOT EXISTS idx_coupons_customer_segment ON public.coupons(customer_segment);
CREATE INDEX IF NOT EXISTS idx_coupons_is_transferable ON public.coupons(is_transferable);
CREATE INDEX IF NOT EXISTS idx_achievement_catalog_condition_type ON public.achievement_catalog(condition_type);
CREATE INDEX IF NOT EXISTS idx_achievement_catalog_is_closed ON public.achievement_catalog(is_closed);

-- ─── 4. UPDATED_AT TRIGGER FOR COUPONS ────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_coupons_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_coupons_updated_at ON public.coupons;
CREATE TRIGGER trg_coupons_updated_at
    BEFORE UPDATE ON public.coupons
    FOR EACH ROW EXECUTE FUNCTION public.update_coupons_updated_at();
