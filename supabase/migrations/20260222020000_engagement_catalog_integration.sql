-- Location: supabase/migrations/20260222020000_engagement_catalog_integration.sql
-- Purpose: Create coupons, loyalty_points, rewards tables and link all engagement features to catalog items
-- Dependencies: Requires catalog_items and promotions tables

-- 1. Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL DEFAULT 'percentage', -- percentage, fixed, free_shipping, buy_one_get_one
    discount_value DECIMAL(10,2) NOT NULL,
    min_purchase_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2),
    usage_limit INTEGER DEFAULT 0, -- 0 means unlimited
    usage_per_customer INTEGER DEFAULT 1,
    used_count INTEGER DEFAULT 0,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    status TEXT DEFAULT 'active', -- active, paused, expired
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true,
    is_first_time_only BOOLEAN DEFAULT false,
    is_stackable BOOLEAN DEFAULT false,
    target_audience TEXT DEFAULT 'all', -- all, new, returning, vip
    customer_segment TEXT,
    business_id TEXT DEFAULT 'all',
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create loyalty_points table
CREATE TABLE IF NOT EXISTS public.loyalty_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    points_per_euro DECIMAL(10,2) DEFAULT 1.0, -- Points earned per euro spent
    points_per_visit INTEGER DEFAULT 10, -- Points earned per visit
    redemption_rate DECIMAL(10,2) DEFAULT 0.01, -- Euro value per point (e.g., 100 points = 1 euro)
    min_points_to_redeem INTEGER DEFAULT 100,
    points_expiry_days INTEGER DEFAULT 365, -- Days until points expire
    tier_system JSONB DEFAULT '{"bronze": 0, "silver": 1000, "gold": 5000, "platinum": 10000}',
    bonus_multipliers JSONB DEFAULT '{"bronze": 1.0, "silver": 1.2, "gold": 1.5, "platinum": 2.0}',
    status TEXT DEFAULT 'active', -- active, paused, inactive
    is_active BOOLEAN DEFAULT true,
    business_id TEXT DEFAULT 'all',
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create rewards table
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'count', -- count (visits), amount (spending)
    target_value DECIMAL(10,2) NOT NULL, -- Number of visits or amount to spend
    reward_type TEXT NOT NULL DEFAULT 'discount', -- discount, free_item, points, exclusive_access
    reward_value TEXT NOT NULL, -- Description of the reward
    status TEXT DEFAULT 'active', -- active, paused, expired
    is_active BOOLEAN DEFAULT true,
    valid_until TIMESTAMPTZ,
    validity_period INTEGER DEFAULT 30, -- Days the reward is valid after earning
    max_redemptions INTEGER DEFAULT 0, -- 0 means unlimited
    customer_limit INTEGER DEFAULT 1, -- How many times a customer can earn this reward
    total_participants INTEGER DEFAULT 0,
    completed_customers INTEGER DEFAULT 0,
    redemptions INTEGER DEFAULT 0,
    business_id TEXT DEFAULT 'all',
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create junction tables for catalog item relationships

-- Coupon-CatalogItem junction table
CREATE TABLE IF NOT EXISTS public.coupon_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE,
    catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(coupon_id, catalog_item_id)
);

-- LoyaltyPoints-CatalogItem junction table (items that earn bonus points)
CREATE TABLE IF NOT EXISTS public.loyalty_catalog_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loyalty_points_id UUID REFERENCES public.loyalty_points(id) ON DELETE CASCADE,
    catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE CASCADE,
    bonus_points INTEGER DEFAULT 0, -- Extra points for this specific item
    bonus_multiplier DECIMAL(3,2) DEFAULT 1.0, -- Multiplier for this item
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(loyalty_points_id, catalog_item_id)
);

-- Reward-CatalogItem junction table (items that count toward reward or are the reward)
CREATE TABLE IF NOT EXISTS public.reward_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reward_id UUID REFERENCES public.rewards(id) ON DELETE CASCADE,
    catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE CASCADE,
    item_role TEXT DEFAULT 'qualifying', -- qualifying (counts toward reward), reward (is the reward itself)
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(reward_id, catalog_item_id, item_role)
);

-- 5. Create indexes for performance
CREATE INDEX idx_coupons_user_id ON public.coupons(user_id);
CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_status ON public.coupons(status);
CREATE INDEX idx_coupons_valid_dates ON public.coupons(valid_from, valid_until);

CREATE INDEX idx_loyalty_points_user_id ON public.loyalty_points(user_id);
CREATE INDEX idx_loyalty_points_status ON public.loyalty_points(status);

CREATE INDEX idx_rewards_user_id ON public.rewards(user_id);
CREATE INDEX idx_rewards_status ON public.rewards(status);
CREATE INDEX idx_rewards_valid_until ON public.rewards(valid_until);

CREATE INDEX idx_coupon_items_coupon_id ON public.coupon_items(coupon_id);
CREATE INDEX idx_coupon_items_catalog_item_id ON public.coupon_items(catalog_item_id);

CREATE INDEX idx_loyalty_catalog_items_loyalty_id ON public.loyalty_catalog_items(loyalty_points_id);
CREATE INDEX idx_loyalty_catalog_items_catalog_id ON public.loyalty_catalog_items(catalog_item_id);

CREATE INDEX idx_reward_items_reward_id ON public.reward_items(reward_id);
CREATE INDEX idx_reward_items_catalog_item_id ON public.reward_items(catalog_item_id);

-- 6. Enable RLS on all tables
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_items ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies

-- Coupons policies
CREATE POLICY "public_can_read_active_coupons"
ON public.coupons
FOR SELECT
TO public
USING (status = 'active' AND is_public = true);

CREATE POLICY "users_manage_own_coupons"
ON public.coupons
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Loyalty points policies
CREATE POLICY "public_can_read_active_loyalty_programs"
ON public.loyalty_points
FOR SELECT
TO public
USING (status = 'active');

CREATE POLICY "users_manage_own_loyalty_programs"
ON public.loyalty_points
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Rewards policies
CREATE POLICY "public_can_read_active_rewards"
ON public.rewards
FOR SELECT
TO public
USING (status = 'active');

CREATE POLICY "users_manage_own_rewards"
ON public.rewards
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Junction table policies
CREATE POLICY "users_manage_own_coupon_items"
ON public.coupon_items
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.coupons c
        WHERE c.id = coupon_id AND c.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.coupons c
        WHERE c.id = coupon_id AND c.user_id = auth.uid()
    )
);

CREATE POLICY "users_manage_own_loyalty_catalog_items"
ON public.loyalty_catalog_items
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.loyalty_points lp
        WHERE lp.id = loyalty_points_id AND lp.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.loyalty_points lp
        WHERE lp.id = loyalty_points_id AND lp.user_id = auth.uid()
    )
);

CREATE POLICY "users_manage_own_reward_items"
ON public.reward_items
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.rewards r
        WHERE r.id = reward_id AND r.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.rewards r
        WHERE r.id = reward_id AND r.user_id = auth.uid()
    )
);

-- 8. Create helper functions

-- Function to get catalog items linked to a promotion
CREATE OR REPLACE FUNCTION public.get_promotion_catalog_items(promotion_uuid UUID)
RETURNS TABLE (
    item_id UUID,
    item_name TEXT,
    item_price DECIMAL,
    item_image_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ci.id,
        ci.name,
        ci.price,
        ci.image_url
    FROM public.catalog_items ci
    INNER JOIN public.promotion_items pi ON ci.id = pi.catalog_item_id
    WHERE pi.promotion_id = promotion_uuid;
END;
$$;

-- Function to get catalog items linked to a coupon
CREATE OR REPLACE FUNCTION public.get_coupon_catalog_items(coupon_uuid UUID)
RETURNS TABLE (
    item_id UUID,
    item_name TEXT,
    item_price DECIMAL,
    item_image_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ci.id,
        ci.name,
        ci.price,
        ci.image_url
    FROM public.catalog_items ci
    INNER JOIN public.coupon_items cpi ON ci.id = cpi.catalog_item_id
    WHERE cpi.coupon_id = coupon_uuid;
END;
$$;

-- Function to get catalog items linked to a reward
CREATE OR REPLACE FUNCTION public.get_reward_catalog_items(reward_uuid UUID)
RETURNS TABLE (
    item_id UUID,
    item_name TEXT,
    item_price DECIMAL,
    item_image_url TEXT,
    item_role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ci.id,
        ci.name,
        ci.price,
        ci.image_url,
        ri.item_role
    FROM public.catalog_items ci
    INNER JOIN public.reward_items ri ON ci.id = ri.catalog_item_id
    WHERE ri.reward_id = reward_uuid;
END;
$$;

-- Function to get engagement features linked to a catalog item
CREATE OR REPLACE FUNCTION public.get_catalog_item_engagement_features(item_uuid UUID)
RETURNS TABLE (
    feature_type TEXT,
    feature_id UUID,
    feature_name TEXT,
    feature_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Get promotions
    RETURN QUERY
    SELECT 
        'promotion'::TEXT,
        p.id,
        p.title,
        p.status
    FROM public.promotions p
    INNER JOIN public.promotion_items pi ON p.id = pi.promotion_id
    WHERE pi.catalog_item_id = item_uuid;
    
    -- Get coupons
    RETURN QUERY
    SELECT 
        'coupon'::TEXT,
        c.id,
        c.title,
        c.status
    FROM public.coupons c
    INNER JOIN public.coupon_items ci ON c.id = ci.coupon_id
    WHERE ci.catalog_item_id = item_uuid;
    
    -- Get rewards
    RETURN QUERY
    SELECT 
        'reward'::TEXT,
        r.id,
        r.name,
        r.status
    FROM public.rewards r
    INNER JOIN public.reward_items ri ON r.id = ri.reward_id
    WHERE ri.catalog_item_id = item_uuid;
    
    -- Get loyalty programs
    RETURN QUERY
    SELECT 
        'loyalty'::TEXT,
        lp.id,
        lp.name,
        lp.status
    FROM public.loyalty_points lp
    INNER JOIN public.loyalty_catalog_items lci ON lp.id = lci.loyalty_points_id
    WHERE lci.catalog_item_id = item_uuid;
END;
$$;