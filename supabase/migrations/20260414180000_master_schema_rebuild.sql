-- ============================================================
-- MASTER SCHEMA REBUILD
-- Timestamp: 20260414180000
-- Description: Consolidated migration that creates the complete
--              PromoSpot database schema from scratch.
--              Safe to run multiple times (idempotent).
-- ============================================================

-- ============================================================
-- SECTION 1: EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA public;

-- ============================================================
-- SECTION 2: ENUM TYPES (DROP IF EXISTS + CREATE)
-- ============================================================

-- Core business types
DROP TYPE IF EXISTS public.business_type CASCADE;
CREATE TYPE public.business_type AS ENUM ('product', 'service');

DROP TYPE IF EXISTS public.catalog_status CASCADE;
CREATE TYPE public.catalog_status AS ENUM ('draft', 'active', 'inactive', 'discontinued');

DROP TYPE IF EXISTS public.promotion_type CASCADE;
CREATE TYPE public.promotion_type AS ENUM ('percentage', 'fixed_amount', 'buy_one_get_one', 'bulk_discount');

-- Gift cards
DROP TYPE IF EXISTS public.gift_card_status CASCADE;
CREATE TYPE public.gift_card_status AS ENUM ('active', 'used', 'expired', 'cancelled');

DROP TYPE IF EXISTS public.gift_card_transaction_type CASCADE;
CREATE TYPE public.gift_card_transaction_type AS ENUM ('issued', 'redeemed', 'balance_adjustment', 'expired', 'cancelled');

DROP TYPE IF EXISTS public.corporate_order_status CASCADE;
CREATE TYPE public.corporate_order_status AS ENUM ('pending', 'paid', 'distributed', 'cancelled');

DROP TYPE IF EXISTS public.distribution_method CASCADE;
CREATE TYPE public.distribution_method AS ENUM ('excel', 'email_individual', 'qr_printable');

DROP TYPE IF EXISTS public.prepaid_card_status CASCADE;
CREATE TYPE public.prepaid_card_status AS ENUM ('active', 'inactive', 'blocked');

-- POS system
DROP TYPE IF EXISTS public.customer_identification_type CASCADE;
CREATE TYPE public.customer_identification_type AS ENUM ('qr_code', 'barcode', 'phone', 'email', 'manual');

DROP TYPE IF EXISTS public.transaction_status CASCADE;
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'cancelled', 'refunded', 'partially_refunded');

DROP TYPE IF EXISTS public.payment_method_type CASCADE;
CREATE TYPE public.payment_method_type AS ENUM ('cash', 'card', 'transfer', 'points', 'coupon', 'gift_card', 'mixed');

DROP TYPE IF EXISTS public.cash_register_status CASCADE;
CREATE TYPE public.cash_register_status AS ENUM ('open', 'closed');

-- Staff management
DROP TYPE IF EXISTS public.staff_role_type CASCADE;
CREATE TYPE public.staff_role_type AS ENUM ('admin', 'manager', 'cashier', 'clerk');

DROP TYPE IF EXISTS public.activity_type CASCADE;
CREATE TYPE public.activity_type AS ENUM ('login', 'logout', 'sale', 'refund', 'inventory_adjustment', 'permission_change', 'other');

DROP TYPE IF EXISTS public.shift_status CASCADE;
CREATE TYPE public.shift_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

DROP TYPE IF EXISTS public.adjustment_type CASCADE;
CREATE TYPE public.adjustment_type AS ENUM ('increase', 'decrease', 'correction', 'damage', 'theft', 'return');

-- Business settings
DROP TYPE IF EXISTS public.day_of_week CASCADE;
CREATE TYPE public.day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

DROP TYPE IF EXISTS public.payment_method_status CASCADE;
CREATE TYPE public.payment_method_status AS ENUM ('active', 'inactive');

DROP TYPE IF EXISTS public.segment_type CASCADE;
CREATE TYPE public.segment_type AS ENUM ('vip', 'regular', 'new', 'inactive', 'custom');

-- Reservations
DROP TYPE IF EXISTS public.reservation_status CASCADE;
CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');

DROP TYPE IF EXISTS public.reminder_type CASCADE;
CREATE TYPE public.reminder_type AS ENUM ('push', 'email', 'sms');

DROP TYPE IF EXISTS public.reminder_status CASCADE;
CREATE TYPE public.reminder_status AS ENUM ('pending', 'sent', 'failed');

-- Campaigns
DROP TYPE IF EXISTS public.campaign_objective_type CASCADE;
CREATE TYPE public.campaign_objective_type AS ENUM ('adquisicion', 'reactivacion', 'upsell', 'fidelizacion');

DROP TYPE IF EXISTS public.campaign_channel_type CASCADE;
CREATE TYPE public.campaign_channel_type AS ENUM ('push', 'cupon', 'email', 'story', 'sms', 'social');

-- Check-in
DROP TYPE IF EXISTS public.checkin_method_type CASCADE;
CREATE TYPE public.checkin_method_type AS ENUM ('qr_static', 'qr_dynamic', 'geofence', 'manual', 'nfc', 'beacon');

DROP TYPE IF EXISTS public.checkin_status CASCADE;
CREATE TYPE public.checkin_status AS ENUM ('success', 'rejected', 'suspicious', 'pending');

DROP TYPE IF EXISTS public.nfc_action_type CASCADE;
CREATE TYPE public.nfc_action_type AS ENUM ('checkin_only', 'checkin_coupon', 'checkin_menu', 'promo_only');

DROP TYPE IF EXISTS public.beacon_sensitivity CASCADE;
CREATE TYPE public.beacon_sensitivity AS ENUM ('high', 'medium', 'low');

DROP TYPE IF EXISTS public.frequency_type CASCADE;
CREATE TYPE public.frequency_type AS ENUM ('once_per_day', 'every_x_hours', 'x_per_day', 'unlimited');

-- Rewards
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

-- Reviews
DROP TYPE IF EXISTS public.review_trigger_type CASCADE;
CREATE TYPE public.review_trigger_type AS ENUM ('checkin', 'coupon_redeem', 'order_completed', 'reservation_completed', 'geofence_visit');

DROP TYPE IF EXISTS public.review_status CASCADE;
CREATE TYPE public.review_status AS ENUM ('pending', 'published', 'reported', 'removed');

DROP TYPE IF EXISTS public.review_request_status CASCADE;
CREATE TYPE public.review_request_status AS ENUM ('sent', 'viewed', 'completed', 'ignored');

DROP TYPE IF EXISTS public.review_incentive_type CASCADE;
CREATE TYPE public.review_incentive_type AS ENUM ('points', 'coupon', 'punch_stamp');

-- Membership
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

-- Geofence
DROP TYPE IF EXISTS public.geofence_event_type CASCADE;
CREATE TYPE public.geofence_event_type AS ENUM ('entrada', 'salida', 'checkin_auto');

DROP TYPE IF EXISTS public.geofence_notification_type CASCADE;
CREATE TYPE public.geofence_notification_type AS ENUM ('welcome', 'farewell');

DROP TYPE IF EXISTS public.geofence_action_result CASCADE;
CREATE TYPE public.geofence_action_result AS ENUM ('sent', 'opened', 'converted', 'not_sent_limit', 'not_sent_schedule', 'pending');

-- Order ahead
DROP TYPE IF EXISTS public.order_status CASCADE;
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'ready', 'completed', 'cancelled');

DROP TYPE IF EXISTS public.delivery_type CASCADE;
CREATE TYPE public.delivery_type AS ENUM ('pickup', 'delivery');

DROP TYPE IF EXISTS public.featured_position CASCADE;
CREATE TYPE public.featured_position AS ENUM ('top_catalog', 'checkout_suggestion', 'banner');

DROP TYPE IF EXISTS public.featured_status CASCADE;
CREATE TYPE public.featured_status AS ENUM ('active', 'paused', 'expired');

-- Purchase orders
DROP TYPE IF EXISTS public.purchase_order_status CASCADE;
CREATE TYPE public.purchase_order_status AS ENUM (
  'draft', 'sent', 'in_process', 'received_partial',
  'received_complete', 'paid', 'pending_payment', 'cancelled'
);

-- Geospatial
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'geofence_type_enum' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.geofence_type_enum AS ENUM ('circle', 'polygon');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'geo_event_type_enum' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.geo_event_type_enum AS ENUM (
      'entry', 'exit', 'checkin_auto', 'notification_sent', 'notification_opened', 'conversion'
    );
  END IF;
END $$;

-- ============================================================
-- SECTION 3: CORE TABLES (no foreign key dependencies)
-- ============================================================

-- user_profiles: central user table linked to auth.users
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'owner',
    business_name TEXT,
    business_id TEXT,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    onboarding_completed BOOLEAN DEFAULT false,
    currency_settings JSONB DEFAULT jsonb_build_object(
        'defaultCurrency', 'MXN',
        'currencySymbol', '$',
        'currencyPosition', 'before',
        'symbolSpace', false,
        'decimalPlaces', 2,
        'thousandsSeparator', ',',
        'decimalSeparator', '.',
        'showCurrencySymbol', true,
        'numberFormat', 'US',
        'taxIncluded', true,
        'taxRate', 16
    ),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Business categories (normalized taxonomy)
CREATE TABLE IF NOT EXISTS public.business_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.business_subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_id UUID NOT NULL REFERENCES public.business_categories(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.business_establishment_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subcategoria_id UUID NOT NULL REFERENCES public.business_subcategories(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Business settings
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
    business_country TEXT DEFAULT 'Mexico',
    business_logo_url TEXT,
    business_website TEXT,
    tax_id TEXT,
    default_currency TEXT DEFAULT 'MXN',
    default_language TEXT DEFAULT 'es',
    timezone TEXT DEFAULT 'America/Mexico_City',
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

-- Business hours
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

-- Tax rates
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

-- Product categories
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

-- Payment methods
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

-- System preferences
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

-- Categories (catalog)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon_name TEXT,
    color TEXT DEFAULT '#3B82F6',
    business_type public.business_type NOT NULL,
    is_active BOOLEAN DEFAULT true,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Catalog items
CREATE TABLE IF NOT EXISTS public.catalog_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    business_type public.business_type,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    price DECIMAL(10,2),
    cost DECIMAL(10,2),
    sku TEXT,
    barcode TEXT,
    image_url TEXT,
    image_path TEXT,
    status public.catalog_status DEFAULT 'draft'::public.catalog_status,
    is_featured BOOLEAN DEFAULT false,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    weight DECIMAL(8,2),
    dimensions JSONB,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    business_location_id UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Promotions
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    promotion_type public.promotion_type DEFAULT 'percentage',
    discount_value DECIMAL(10,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME DEFAULT '09:00',
    end_time TIME DEFAULT '21:00',
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    target_days TEXT[] DEFAULT '{}',
    target_audience TEXT DEFAULT 'all',
    min_purchase_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2),
    is_recurring BOOLEAN DEFAULT false,
    recurring_type TEXT,
    status TEXT DEFAULT 'draft',
    image_url TEXT,
    image_path TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    business_type public.business_type,
    applicable_items UUID[] DEFAULT '{}',
    performance JSONB DEFAULT '{"views": 0, "clicks": 0, "conversions": 0}',
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Promotion items junction
CREATE TABLE IF NOT EXISTS public.promotion_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_id UUID REFERENCES public.promotions(id) ON DELETE CASCADE,
    catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(promotion_id, catalog_item_id)
);

-- Customer profiles (POS customers)
CREATE TABLE IF NOT EXISTS public.customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    qr_code TEXT UNIQUE,
    barcode TEXT UNIQUE,
    phone TEXT,
    email TEXT,
    full_name TEXT NOT NULL,
    loyalty_points INTEGER DEFAULT 0,
    total_purchases DECIMAL(10, 2) DEFAULT 0,
    total_visits INTEGER DEFAULT 0,
    tier TEXT DEFAULT 'bronze',
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Customer segments
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

-- Customer segment assignments
CREATE TABLE IF NOT EXISTS public.customer_segment_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    segment_id UUID REFERENCES public.customer_segments(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    UNIQUE(customer_id, segment_id)
);

-- ============================================================
-- SECTION 4: GIFT CARDS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.gift_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    initial_value DECIMAL(10, 2) NOT NULL,
    current_balance DECIMAL(10, 2) NOT NULL,
    status public.gift_card_status DEFAULT 'active'::public.gift_card_status,
    issued_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMPTZ,
    redeemed_date TIMESTAMPTZ,
    recipient_name TEXT,
    recipient_email TEXT,
    recipient_phone TEXT,
    notes TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.gift_card_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gift_card_id UUID REFERENCES public.gift_cards(id) ON DELETE CASCADE,
    transaction_type public.gift_card_transaction_type NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    balance_after DECIMAL(10, 2) NOT NULL,
    transaction_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    location TEXT,
    notes TEXT,
    performed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

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
    default_distribution public.distribution_method DEFAULT 'excel',
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
    status public.corporate_order_status DEFAULT 'pending',
    distribution_method public.distribution_method DEFAULT 'excel',
    custom_message TEXT,
    company_logo_url TEXT,
    payment_reference TEXT,
    paid_at TIMESTAMPTZ,
    distributed_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

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

-- ============================================================
-- SECTION 5: POS SYSTEM
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS pos_transaction_seq START 1;

CREATE TABLE IF NOT EXISTS public.cash_register_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    session_number TEXT NOT NULL,
    status public.cash_register_status DEFAULT 'open'::public.cash_register_status,
    opening_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    closing_amount DECIMAL(10, 2),
    expected_amount DECIMAL(10, 2),
    difference_amount DECIMAL(10, 2),
    total_sales DECIMAL(10, 2) DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    opened_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMPTZ,
    opened_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    closed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.pos_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    transaction_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE SET NULL,
    customer_identification_type public.customer_identification_type,
    cash_register_session_id UUID REFERENCES public.cash_register_sessions(id) ON DELETE SET NULL,
    status public.transaction_status DEFAULT 'pending'::public.transaction_status,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    payment_method public.payment_method_type,
    points_redeemed INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    coupon_code TEXT,
    gift_card_code TEXT,
    promotion_applied TEXT,
    notes TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.pos_transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES public.pos_transactions(id) ON DELETE CASCADE,
    catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    item_type TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.pos_payment_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES public.pos_transactions(id) ON DELETE CASCADE,
    payment_method public.payment_method_type NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    reference_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SECTION 6: STAFF MANAGEMENT
-- ============================================================

CREATE TABLE IF NOT EXISTS public.staff_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    business_id TEXT NOT NULL,
    staff_role public.staff_role_type NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    employee_id TEXT UNIQUE,
    hire_date DATE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.staff_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_role public.staff_role_type NOT NULL UNIQUE,
    can_manage_staff BOOLEAN DEFAULT false,
    can_view_reports BOOLEAN DEFAULT false,
    can_manage_inventory BOOLEAN DEFAULT false,
    can_process_sales BOOLEAN DEFAULT true,
    can_process_refunds BOOLEAN DEFAULT false,
    can_manage_promotions BOOLEAN DEFAULT false,
    can_manage_catalog BOOLEAN DEFAULT false,
    can_open_close_register BOOLEAN DEFAULT false,
    can_adjust_prices BOOLEAN DEFAULT false,
    can_delete_transactions BOOLEAN DEFAULT false,
    custom_permissions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.staff_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_member_id UUID REFERENCES public.staff_members(id) ON DELETE CASCADE,
    business_id TEXT NOT NULL,
    activity_type public.activity_type NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.shift_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_member_id UUID REFERENCES public.staff_members(id) ON DELETE CASCADE,
    business_id TEXT NOT NULL,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status public.shift_status DEFAULT 'scheduled'::public.shift_status,
    actual_start_time TIMESTAMPTZ,
    actual_end_time TIMESTAMPTZ,
    break_duration INTEGER DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SECTION 7: INVENTORY
-- ============================================================

CREATE TABLE IF NOT EXISTS public.inventory_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE CASCADE,
    business_id TEXT NOT NULL,
    adjustment_type public.adjustment_type NOT NULL,
    quantity_change INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    reason TEXT NOT NULL,
    notes TEXT,
    adjusted_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.stock_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE CASCADE,
    business_id TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    current_quantity INTEGER NOT NULL,
    threshold_quantity INTEGER NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SECTION 8: SUPPLIERS & PURCHASE ORDERS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    rfc TEXT,
    payment_terms TEXT DEFAULT 'net30',
    delivery_days INTEGER DEFAULT 3,
    rating NUMERIC(2,1) DEFAULT 0,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    total_purchased NUMERIC(12,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.supplier_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
    catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE CASCADE,
    purchase_price NUMERIC(12,2),
    is_preferred BOOLEAN DEFAULT false,
    lead_time_days INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(supplier_id, catalog_item_id)
);

CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    supplier_name TEXT,
    supplier_email TEXT,
    supplier_phone TEXT,
    status public.purchase_order_status DEFAULT 'draft'::public.purchase_order_status,
    total_amount NUMERIC(12,2) DEFAULT 0,
    expected_delivery_date DATE,
    sent_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    delivered_on_time BOOLEAN,
    is_auto_generated BOOLEAN DEFAULT false,
    notes TEXT,
    invoice_number TEXT,
    invoice_date DATE,
    payment_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    sku TEXT,
    quantity_ordered INTEGER NOT NULL,
    quantity_received INTEGER DEFAULT 0,
    unit_cost NUMERIC(12,2) NOT NULL,
    total_cost NUMERIC(12,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.inventory_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    from_location TEXT NOT NULL,
    to_location TEXT NOT NULL,
    transfer_date DATE NOT NULL,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.inventory_transfer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id UUID REFERENCES public.inventory_transfers(id) ON DELETE CASCADE,
    catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.reorder_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE CASCADE,
    reorder_point INTEGER NOT NULL,
    reorder_quantity INTEGER NOT NULL,
    preferred_supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.goods_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    receipt_number TEXT NOT NULL,
    receipt_date DATE NOT NULL,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'draft',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.goods_receipt_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goods_receipt_id UUID REFERENCES public.goods_receipts(id) ON DELETE CASCADE,
    catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    quantity_expected INTEGER DEFAULT 0,
    quantity_received INTEGER NOT NULL,
    quantity_discrepancy INTEGER DEFAULT 0,
    unit_cost NUMERIC(12,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SECTION 9: RESERVATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reservation_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    max_capacity INTEGER DEFAULT 1,
    advance_payment_required BOOLEAN DEFAULT false,
    advance_payment_percentage DECIMAL(5, 2) DEFAULT 0,
    min_advance_hours INTEGER DEFAULT 1,
    max_advance_days INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.reservation_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    branch_name TEXT DEFAULT 'Principal',
    day_of_week public.day_of_week NOT NULL,
    is_available BOOLEAN DEFAULT true,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INTEGER DEFAULT 30,
    break_start_time TIME,
    break_end_time TIME,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.cancellation_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    policy_name TEXT NOT NULL,
    min_hours_before INTEGER NOT NULL,
    penalty_percentage DECIMAL(5, 2) DEFAULT 0,
    points_penalty INTEGER DEFAULT 0,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    reservation_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE SET NULL,
    service_id UUID REFERENCES public.reservation_services(id) ON DELETE SET NULL,
    branch_name TEXT DEFAULT 'Principal',
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    party_size INTEGER DEFAULT 1,
    status public.reservation_status DEFAULT 'pending'::public.reservation_status,
    advance_payment_amount DECIMAL(10, 2) DEFAULT 0,
    advance_payment_paid BOOLEAN DEFAULT false,
    special_requests TEXT,
    confirmation_sent_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    confirmed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    checked_in_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    no_show_at TIMESTAMPTZ,
    points_earned INTEGER DEFAULT 0,
    points_penalty INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.reservation_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.reservation_services(id) ON DELETE SET NULL,
    preferred_date DATE,
    preferred_time TIME,
    party_size INTEGER DEFAULT 1,
    notes TEXT,
    is_notified BOOLEAN DEFAULT false,
    notified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.reservation_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE,
    reminder_type public.reminder_type NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    status public.reminder_status DEFAULT 'pending'::public.reminder_status,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SECTION 10: CAMPAIGNS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.campaign_objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id TEXT NOT NULL,
    business_id UUID,
    objective public.campaign_objective_type NOT NULL,
    audience_segments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.campaign_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id TEXT NOT NULL,
    step_order INTEGER NOT NULL DEFAULT 1,
    channel public.campaign_channel_type NOT NULL DEFAULT 'push',
    message TEXT,
    delay_days INTEGER DEFAULT 0,
    promotion_id TEXT,
    promotion_action TEXT DEFAULT 'activate',
    promotion_timing_hours INTEGER DEFAULT 0,
    promotion_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.campaign_ab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    variant_a JSONB DEFAULT '{}'::jsonb,
    variant_b JSONB DEFAULT '{}'::jsonb,
    audience_split TEXT DEFAULT '50-50',
    control_group_active BOOLEAN DEFAULT false,
    control_group_percentage INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.campaign_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id TEXT NOT NULL,
    business_id TEXT,
    milestone_type TEXT NOT NULL,
    milestone_value NUMERIC,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.sequence_promotion_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id TEXT NOT NULL,
    sequence_step_id UUID,
    promotion_id TEXT NOT NULL,
    promotion_title TEXT,
    action_type TEXT NOT NULL DEFAULT 'activate',
    scheduled_at TIMESTAMPTZ,
    executed_at TIMESTAMPTZ,
    step_status TEXT DEFAULT 'pending',
    business_id TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SECTION 11: ENGAGEMENT AUTOMATION
-- ============================================================

CREATE TABLE IF NOT EXISTS public.engagement_automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    rule_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    trigger_type TEXT NOT NULL,
    conditions JSONB NOT NULL DEFAULT '{}',
    action_type TEXT NOT NULL,
    action_config JSONB NOT NULL DEFAULT '{}',
    execution_frequency TEXT DEFAULT 'once',
    max_executions INTEGER DEFAULT 0,
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMPTZ,
    target_audience TEXT DEFAULT 'all',
    customer_segment_id UUID,
    priority INTEGER DEFAULT 1,
    valid_from TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.automation_execution_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_rule_id UUID REFERENCES public.engagement_automation_rules(id) ON DELETE CASCADE,
    business_id TEXT NOT NULL,
    executed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    execution_status TEXT NOT NULL,
    trigger_context JSONB DEFAULT '{}',
    affected_customers JSONB DEFAULT '[]',
    affected_count INTEGER DEFAULT 0,
    actions_taken JSONB DEFAULT '[]',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SECTION 12: CHECK-IN MODULE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.checkin_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    method_type public.checkin_method_type NOT NULL,
    is_active BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}',
    checkins_this_month INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    customer_name TEXT,
    customer_code TEXT,
    method public.checkin_method_type NOT NULL,
    points_awarded INTEGER DEFAULT 0,
    validated_by TEXT,
    checkin_status public.checkin_status DEFAULT 'success',
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.checkin_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    base_points INTEGER DEFAULT 10,
    points_by_method JSONB DEFAULT '{}',
    multipliers JSONB DEFAULT '[]',
    streak_config JSONB DEFAULT '{}',
    differentiate_by_method BOOLEAN DEFAULT false,
    streak_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.checkin_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    frequency_type public.frequency_type DEFAULT 'once_per_day',
    frequency_value INTEGER DEFAULT 1,
    cooldown_minutes INTEGER DEFAULT 30,
    rules_by_method JSONB DEFAULT '{}',
    abuse_alerts_enabled BOOLEAN DEFAULT true,
    abuse_threshold INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.nfc_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tag_uid TEXT NOT NULL,
    tag_name TEXT NOT NULL,
    location TEXT,
    action_type public.nfc_action_type DEFAULT 'checkin_only',
    is_active BOOLEAN DEFAULT true,
    taps_this_month INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.ble_beacons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    beacon_id TEXT NOT NULL,
    beacon_name TEXT NOT NULL,
    location TEXT,
    sensitivity public.beacon_sensitivity DEFAULT 'medium',
    min_presence_minutes INTEGER DEFAULT 2,
    detection_radius_meters INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    battery_level INTEGER DEFAULT 100,
    checkins_this_month INTEGER DEFAULT 0,
    dwell_time_avg_minutes INTEGER DEFAULT 15,
    last_signal_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SECTION 13: REWARDS MANAGEMENT
-- ============================================================

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

CREATE TABLE IF NOT EXISTS public.punch_card_stamps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    punch_card_id UUID REFERENCES public.punch_cards(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    stamps_collected INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    reward_claimed BOOLEAN DEFAULT false,
    reward_claimed_at TIMESTAMPTZ,
    activated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS public.vip_level_benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vip_level_id UUID REFERENCES public.vip_levels(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    benefit_type TEXT NOT NULL,
    benefit_value TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.customer_vip_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    vip_level_id UUID REFERENCES public.vip_levels(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.surprise_rewards_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    mechanic public.surprise_mechanic DEFAULT 'wheel',
    is_active BOOLEAN DEFAULT false,
    prizes JSONB DEFAULT '[]'::jsonb,
    trigger_conditions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.exclusive_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    access_type public.experience_access_type DEFAULT 'all',
    access_value TEXT,
    max_claims INTEGER,
    claims_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    valid_from DATE,
    valid_until DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.rewards_automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    rule_name TEXT NOT NULL,
    trigger_type TEXT NOT NULL,
    trigger_source_id UUID,
    trigger_source_name TEXT,
    source_module TEXT NOT NULL,
    action_type TEXT NOT NULL,
    action_config JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    fires_this_month INTEGER NOT NULL DEFAULT 0,
    total_fires INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Loyalty points
CREATE TABLE IF NOT EXISTS public.loyalty_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Programa de Puntos',
    points_per_mxn NUMERIC(10,4) DEFAULT 0.2,
    mxn_per_point NUMERIC(10,4) DEFAULT 0.15,
    min_redemption_points INTEGER DEFAULT 50,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.loyalty_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    points_balance INTEGER DEFAULT 0,
    total_earned INTEGER DEFAULT 0,
    total_redeemed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_id, customer_id)
);

CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL,
    points_amount INTEGER NOT NULL,
    description TEXT,
    reference_id UUID,
    reference_type TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SECTION 14: REVIEWS MODULE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID,
    customer_id UUID,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    trigger_type public.review_trigger_type NOT NULL DEFAULT 'checkin',
    event_id UUID,
    photos JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    review_status public.review_status DEFAULT 'published',
    customer_name TEXT,
    customer_level TEXT DEFAULT 'Bronce',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.review_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    published_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.review_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.review_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID,
    customer_id UUID,
    customer_name TEXT,
    customer_phone TEXT,
    trigger_type public.review_trigger_type NOT NULL DEFAULT 'checkin',
    request_status public.review_request_status DEFAULT 'sent',
    sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    viewed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.review_incentive_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID,
    enabled BOOLEAN DEFAULT false,
    incentive_type public.review_incentive_type DEFAULT 'points',
    points_value INTEGER DEFAULT 10,
    coupon_id UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.review_request_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID,
    auto_request_enabled BOOLEAN DEFAULT false,
    triggers JSONB DEFAULT '[]'::jsonb,
    min_days_between_requests INTEGER DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SECTION 15: SURVEYS MODULE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.nps_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    branch_id UUID,
    is_active BOOLEAN DEFAULT true,
    trigger_post_checkin BOOLEAN DEFAULT true,
    trigger_post_checkin_delay VARCHAR(20) DEFAULT '30min',
    trigger_post_coupon BOOLEAN DEFAULT true,
    trigger_post_coupon_delay VARCHAR(20) DEFAULT 'inmediato',
    trigger_post_order BOOLEAN DEFAULT false,
    trigger_post_order_delay VARCHAR(20) DEFAULT '1hora',
    trigger_post_reservation BOOLEAN DEFAULT true,
    trigger_post_reservation_delay VARCHAR(20) DEFAULT '2horas',
    follow_up_question_active BOOLEAN DEFAULT true,
    incentive_active BOOLEAN DEFAULT false,
    incentive_type VARCHAR(20) DEFAULT 'points',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.nps_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    branch_id UUID,
    customer_id UUID,
    is_anonymous BOOLEAN DEFAULT false,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
    segment VARCHAR(20) GENERATED ALWAYS AS (
        CASE
            WHEN score >= 9 THEN 'promotor'
            WHEN score >= 7 THEN 'neutro'
            ELSE 'detractor'
        END
    ) STORED,
    follow_up_comment TEXT,
    trigger_type VARCHAR(30) NOT NULL,
    trigger_reference VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    branch_id UUID,
    internal_name VARCHAR(200) NOT NULL,
    client_title VARCHAR(200),
    description TEXT,
    cover_image_url TEXT,
    anonymous_responses BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'archived')),
    audience_type VARCHAR(20) DEFAULT 'all',
    audience_segment_id UUID,
    start_date DATE,
    end_date DATE,
    max_responses INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.survey_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    trigger_type VARCHAR(30) NOT NULL,
    delay VARCHAR(20) DEFAULT 'inmediato',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.survey_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 0,
    question_type VARCHAR(30) NOT NULL,
    question_text TEXT NOT NULL,
    is_required BOOLEAN DEFAULT false,
    options JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    customer_id UUID,
    is_anonymous BOOLEAN DEFAULT false,
    answers JSONB DEFAULT '[]'::jsonb,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 16: GEOFENCE MODULE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.geofence_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID,
    radius_meters INTEGER NOT NULL DEFAULT 200,
    is_active BOOLEAN NOT NULL DEFAULT true,
    checkin_radius INTEGER DEFAULT 100,
    geofence_type TEXT DEFAULT 'circle',
    actions JSONB DEFAULT '{}'::jsonb,
    schedule JSONB DEFAULT '{"start_hour": 8, "end_hour": 22, "active_days": [0,1,2,3,4,5,6]}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.geofence_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID,
    notification_type public.geofence_notification_type NOT NULL DEFAULT 'welcome',
    title TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    cta_text TEXT DEFAULT 'Ver oferta',
    sound_enabled BOOLEAN DEFAULT true,
    variant_b JSONB DEFAULT NULL,
    ab_test_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.geofence_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID,
    customer_id UUID,
    customer_name TEXT DEFAULT 'Anonimo',
    event_type public.geofence_event_type NOT NULL,
    detected_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    action_triggered TEXT DEFAULT NULL,
    result public.geofence_action_result DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS public.geofence_ab_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID,
    variant TEXT NOT NULL,
    sent INTEGER DEFAULT 0,
    opened INTEGER DEFAULT 0,
    converted INTEGER DEFAULT 0,
    period_start TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    period_end TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SECTION 17: ORDER AHEAD MODULE
-- ============================================================

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
    day_of_week INTEGER NOT NULL,
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
    position public.featured_position DEFAULT 'top_catalog',
    status public.featured_status DEFAULT 'active',
    sort_order INTEGER DEFAULT 0,
    valid_from DATE,
    valid_until DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.upsell_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    trigger_item_id UUID REFERENCES public.catalog_items(id) ON DELETE CASCADE,
    suggested_item_id UUID REFERENCES public.catalog_items(id) ON DELETE CASCADE,
    message TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SECTION 18: MEMBERSHIP MODULE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.membership_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Club Cafe',
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
    quantity INTEGER DEFAULT 1,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.membership_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES public.membership_programs(id) ON DELETE CASCADE,
    trigger_event public.message_trigger NOT NULL,
    channel TEXT DEFAULT 'push',
    subject TEXT,
    body TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SECTION 19: BUSINESS LISTINGS & MISC
-- ============================================================

CREATE TABLE IF NOT EXISTS public.business_listing_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    current_step INTEGER NOT NULL DEFAULT 0,
    form_data JSONB NOT NULL DEFAULT '{}'::JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT business_listing_drafts_owner_id_key UNIQUE (owner_id)
);

CREATE TABLE IF NOT EXISTS public.curp_validation_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    curp_consultada TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    estatus TEXT,
    codigo_validacion TEXT,
    curp_respuesta TEXT,
    nombre TEXT,
    apellido_paterno TEXT,
    apellido_materno TEXT,
    sexo TEXT,
    fecha_nacimiento TEXT,
    pais_nacimiento TEXT,
    estado_nacimiento TEXT,
    estatus_curp TEXT,
    codigo_mensaje TEXT,
    doc_probatorio INTEGER,
    datos_doc_probatorio JSONB,
    datos_adicionales JSONB
);

CREATE TABLE IF NOT EXISTS public.business_security_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    feature_key TEXT NOT NULL,
    category TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_business_security_features_unique
    ON public.business_security_features (business_id, feature_key);

-- Geospatial tables
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'geometry') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'business_locations'
        ) THEN
            CREATE TABLE public.business_locations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                business_id TEXT,
                branch_name TEXT DEFAULT 'Principal',
                address_normalized TEXT,
                address_references TEXT,
                latitude NUMERIC(10,6),
                longitude NUMERIC(10,6),
                location geometry(Point, 4326),
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMPTZ DEFAULT now(),
                updated_at TIMESTAMPTZ DEFAULT now()
            );
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'business_geofences'
        ) THEN
            CREATE TABLE public.business_geofences (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                business_id TEXT,
                name TEXT NOT NULL DEFAULT 'Geofence principal',
                geofence_type public.geofence_type_enum NOT NULL DEFAULT 'circle',
                center geometry(Point, 4326),
                radius_meters NUMERIC DEFAULT 200,
                polygon geometry(Polygon, 4326),
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMPTZ DEFAULT now(),
                updated_at TIMESTAMPTZ DEFAULT now()
            );
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'geo_events'
        ) THEN
            CREATE TABLE public.geo_events (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                business_id TEXT,
                customer_id UUID,
                geofence_id UUID,
                event_type public.geo_event_type_enum NOT NULL,
                location geometry(Point, 4326),
                detected_at TIMESTAMPTZ DEFAULT now(),
                metadata JSONB DEFAULT '{}'::jsonb
            );
        END IF;
    END IF;
END $$;

-- Email templates
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT,
    template_type TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    variables JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Alert settings
CREATE TABLE IF NOT EXISTS public.alert_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    channels JSONB DEFAULT '["push"]'::jsonb,
    threshold_value NUMERIC,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Coupons
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL DEFAULT 'percentage',
    discount_value DECIMAL(10,2) NOT NULL,
    min_purchase_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    per_customer_limit INTEGER DEFAULT 1,
    valid_from DATE,
    valid_until DATE,
    applicable_items UUID[] DEFAULT '{}',
    applicable_categories UUID[] DEFAULT '{}',
    status TEXT DEFAULT 'active',
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_id, code)
);

CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE SET NULL,
    transaction_id UUID,
    discount_applied DECIMAL(10,2) NOT NULL,
    redeemed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SECTION 20: INDEXES
-- ============================================================

-- user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_business_id ON public.user_profiles(business_id);

-- categories
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_business_type ON public.categories(business_type);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);

-- catalog_items
CREATE INDEX IF NOT EXISTS idx_catalog_items_user_id ON public.catalog_items(user_id);
CREATE INDEX IF NOT EXISTS idx_catalog_items_category_id ON public.catalog_items(category_id);
CREATE INDEX IF NOT EXISTS idx_catalog_items_status ON public.catalog_items(status);
CREATE INDEX IF NOT EXISTS idx_catalog_items_is_featured ON public.catalog_items(is_featured);

-- promotions
CREATE INDEX IF NOT EXISTS idx_promotions_user_id ON public.promotions(user_id);
CREATE INDEX IF NOT EXISTS idx_promotions_status ON public.promotions(status);
CREATE INDEX IF NOT EXISTS idx_promotions_start_date ON public.promotions(start_date);
CREATE INDEX IF NOT EXISTS idx_promotions_end_date ON public.promotions(end_date);

-- customer_profiles
CREATE INDEX IF NOT EXISTS idx_customer_profiles_business_id ON public.customer_profiles(business_id);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_phone ON public.customer_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_email ON public.customer_profiles(email);

-- gift_cards
CREATE INDEX IF NOT EXISTS idx_gift_cards_business_id ON public.gift_cards(business_id);
CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON public.gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gift_cards_status ON public.gift_cards(status);

-- pos
CREATE INDEX IF NOT EXISTS idx_pos_transactions_business_id ON public.pos_transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_customer_id ON public.pos_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_status ON public.pos_transactions(status);
CREATE INDEX IF NOT EXISTS idx_pos_transaction_items_transaction_id ON public.pos_transaction_items(transaction_id);

-- staff
CREATE INDEX IF NOT EXISTS idx_staff_members_business_id ON public.staff_members(business_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_is_active ON public.staff_members(is_active);
CREATE INDEX IF NOT EXISTS idx_staff_activity_logs_business_id ON public.staff_activity_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_staff_activity_logs_created_at ON public.staff_activity_logs(created_at);

-- inventory
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_catalog_item_id ON public.inventory_adjustments(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_business_id ON public.inventory_adjustments(business_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_catalog_item_id ON public.stock_alerts(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_is_resolved ON public.stock_alerts(is_resolved);

-- suppliers
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON public.suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_user_id ON public.purchase_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON public.purchase_orders(status);

-- reservations
CREATE INDEX IF NOT EXISTS idx_reservations_business_id ON public.reservations(business_id);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_id ON public.reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations(reservation_date);

-- campaigns
CREATE INDEX IF NOT EXISTS idx_campaign_objectives_campaign_id ON public.campaign_objectives(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sequences_campaign_id ON public.campaign_sequences(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_notifications_business_id ON public.campaign_notifications(business_id);
CREATE INDEX IF NOT EXISTS idx_campaign_notifications_is_read ON public.campaign_notifications(is_read);

-- automation
CREATE INDEX IF NOT EXISTS idx_automation_rules_business_id ON public.engagement_automation_rules(business_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_is_active ON public.engagement_automation_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_automation_log_rule_id ON public.automation_execution_log(automation_rule_id);

-- checkin
CREATE INDEX IF NOT EXISTS idx_checkins_business_id ON public.checkins(business_id);
CREATE INDEX IF NOT EXISTS idx_checkins_customer_id ON public.checkins(customer_id);
CREATE INDEX IF NOT EXISTS idx_checkins_created_at ON public.checkins(created_at);

-- rewards
CREATE INDEX IF NOT EXISTS idx_punch_cards_business_id ON public.punch_cards(business_id);
CREATE INDEX IF NOT EXISTS idx_vip_levels_business_id ON public.vip_levels(business_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_business_customer ON public.loyalty_points(business_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer_id ON public.loyalty_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_rewards_automation_rules_business_id ON public.rewards_automation_rules(business_id);

-- reviews
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON public.reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON public.reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_business_id ON public.review_requests(business_id);

-- surveys
CREATE INDEX IF NOT EXISTS idx_nps_responses_business_id ON public.nps_responses(business_id);
CREATE INDEX IF NOT EXISTS idx_surveys_business_id ON public.surveys(business_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON public.survey_responses(survey_id);

-- geofence
CREATE INDEX IF NOT EXISTS idx_geofence_config_business_id ON public.geofence_config(business_id);
CREATE INDEX IF NOT EXISTS idx_geofence_events_business_id ON public.geofence_events(business_id);
CREATE INDEX IF NOT EXISTS idx_geofence_events_detected_at ON public.geofence_events(detected_at);

-- orders
CREATE INDEX IF NOT EXISTS idx_orders_business_id ON public.orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- membership
CREATE INDEX IF NOT EXISTS idx_membership_programs_business_id ON public.membership_programs(business_id);
CREATE INDEX IF NOT EXISTS idx_membership_subscriptions_program_id ON public.membership_subscriptions(program_id);
CREATE INDEX IF NOT EXISTS idx_membership_subscriptions_customer_id ON public.membership_subscriptions(customer_id);

-- business categories
CREATE INDEX IF NOT EXISTS idx_business_subcategories_categoria_id ON public.business_subcategories(categoria_id);
CREATE INDEX IF NOT EXISTS idx_business_establishment_types_subcategoria_id ON public.business_establishment_types(subcategoria_id);

-- misc
CREATE INDEX IF NOT EXISTS idx_business_listing_drafts_owner_id ON public.business_listing_drafts(owner_id);
CREATE INDEX IF NOT EXISTS idx_curp_validation_log_user_id ON public.curp_validation_log(user_id);
CREATE INDEX IF NOT EXISTS idx_curp_validation_log_created_at ON public.curp_validation_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_security_features_business_id ON public.business_security_features(business_id);
CREATE INDEX IF NOT EXISTS idx_coupons_business_id ON public.coupons(business_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);

-- ============================================================
-- SECTION 21: FUNCTIONS
-- ============================================================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Handle new user registration (creates user_profile from auth.users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, business_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'business_name', 'Mi Negocio'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'owner')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Generate transaction number
CREATE OR REPLACE FUNCTION public.generate_transaction_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.transaction_number IS NULL THEN
        NEW.transaction_number := 'TXN-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('pos_transaction_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$;

-- Update customer stats on transaction
CREATE OR REPLACE FUNCTION public.update_customer_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.status = 'completed'::public.transaction_status THEN
        UPDATE public.customer_profiles
        SET
            total_purchases = total_purchases + NEW.total_amount,
            total_visits = total_visits + 1,
            loyalty_points = loyalty_points + COALESCE(NEW.points_earned, 0) - COALESCE(NEW.points_redeemed, 0),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.customer_id;
    END IF;
    RETURN NEW;
END;
$$;

-- Update cash register stats
CREATE OR REPLACE FUNCTION public.update_cash_register_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'completed'::public.transaction_status THEN
        UPDATE public.cash_register_sessions
        SET
            total_sales = total_sales + NEW.total_amount,
            total_transactions = total_transactions + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.cash_register_session_id;
    END IF;
    RETURN NEW;
END;
$$;

-- Gift card transaction trigger
CREATE OR REPLACE FUNCTION public.create_gift_card_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.gift_card_transactions (
            gift_card_id, transaction_type, amount, balance_after, location, notes, performed_by
        ) VALUES (
            NEW.id, 'issued'::public.gift_card_transaction_type,
            NEW.initial_value, NEW.current_balance,
            'Sistema', 'Tarjeta de regalo emitida', NEW.created_by
        );
    END IF;
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status = 'used'::public.gift_card_status THEN
        INSERT INTO public.gift_card_transactions (
            gift_card_id, transaction_type, amount, balance_after, location, notes, performed_by
        ) VALUES (
            NEW.id, 'redeemed'::public.gift_card_transaction_type,
            NEW.current_balance, 0,
            'Negocio', 'Tarjeta de regalo canjeada completamente', NEW.created_by
        );
    END IF;
    RETURN NEW;
END;
$$;

-- Upsert business listing draft
CREATE OR REPLACE FUNCTION public.upsert_business_listing_draft(
    p_owner_id UUID,
    p_current_step INTEGER,
    p_form_data JSONB
)
RETURNS public.business_listing_drafts
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result public.business_listing_drafts;
BEGIN
    INSERT INTO public.business_listing_drafts (owner_id, current_step, form_data, updated_at)
    VALUES (p_owner_id, p_current_step, p_form_data, CURRENT_TIMESTAMP)
    ON CONFLICT (owner_id) DO UPDATE
        SET current_step = EXCLUDED.current_step,
            form_data = EXCLUDED.form_data,
            updated_at = CURRENT_TIMESTAMP
    RETURNING * INTO v_result;
    RETURN v_result;
END;
$$;

-- Rewards automation updated_at
CREATE OR REPLACE FUNCTION public.update_rewards_automation_rules_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Business security updated_at
CREATE OR REPLACE FUNCTION public.set_business_security_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- ============================================================
-- SECTION 22: ENABLE RLS
-- ============================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_establishment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_segment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_card_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_card_corporate_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_card_corporate_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prepaid_card_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_register_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_payment_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reorder_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancellation_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_promotion_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_execution_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfc_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ble_beacons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punch_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punch_card_stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_levels_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_level_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_vip_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surprise_rewards_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exclusive_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_incentive_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_request_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nps_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nps_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofence_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofence_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofence_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofence_ab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_ahead_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_slot_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upsell_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_consumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_listing_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curp_validation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_security_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SECTION 23: RLS POLICIES
-- ============================================================

-- user_profiles: Pattern 1 (core user table - no function)
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles FOR ALL TO authenticated
USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Business categories: public read, auth write
DROP POLICY IF EXISTS "public_read_business_categories" ON public.business_categories;
CREATE POLICY "public_read_business_categories"
ON public.business_categories FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "auth_write_business_categories" ON public.business_categories;
CREATE POLICY "auth_write_business_categories"
ON public.business_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_business_subcategories" ON public.business_subcategories;
CREATE POLICY "public_read_business_subcategories"
ON public.business_subcategories FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "auth_write_business_subcategories" ON public.business_subcategories;
CREATE POLICY "auth_write_business_subcategories"
ON public.business_subcategories FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_business_establishment_types" ON public.business_establishment_types;
CREATE POLICY "public_read_business_establishment_types"
ON public.business_establishment_types FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "auth_write_business_establishment_types" ON public.business_establishment_types;
CREATE POLICY "auth_write_business_establishment_types"
ON public.business_establishment_types FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Business settings
DROP POLICY IF EXISTS "users_manage_own_business_settings" ON public.business_settings;
CREATE POLICY "users_manage_own_business_settings"
ON public.business_settings FOR ALL TO authenticated
USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- Business hours, tax rates, product categories, payment methods, system preferences
DROP POLICY IF EXISTS "users_manage_business_hours" ON public.business_hours;
CREATE POLICY "users_manage_business_hours"
ON public.business_hours FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_tax_rates" ON public.tax_rates;
CREATE POLICY "users_manage_tax_rates"
ON public.tax_rates FOR ALL TO authenticated
USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "users_manage_product_categories" ON public.product_categories;
CREATE POLICY "users_manage_product_categories"
ON public.product_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_payment_methods" ON public.payment_methods;
CREATE POLICY "users_manage_payment_methods"
ON public.payment_methods FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_system_preferences" ON public.system_preferences;
CREATE POLICY "users_manage_system_preferences"
ON public.system_preferences FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Categories
DROP POLICY IF EXISTS "users_manage_own_categories" ON public.categories;
CREATE POLICY "users_manage_own_categories"
ON public.categories FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Catalog items
DROP POLICY IF EXISTS "public_can_read_catalog_items" ON public.catalog_items;
CREATE POLICY "public_can_read_catalog_items"
ON public.catalog_items FOR SELECT TO public USING (status = 'active'::public.catalog_status);

DROP POLICY IF EXISTS "users_manage_own_catalog_items" ON public.catalog_items;
CREATE POLICY "users_manage_own_catalog_items"
ON public.catalog_items FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Promotions
DROP POLICY IF EXISTS "public_can_read_promotions" ON public.promotions;
CREATE POLICY "public_can_read_promotions"
ON public.promotions FOR SELECT TO public USING (status = 'active');

DROP POLICY IF EXISTS "users_manage_own_promotions" ON public.promotions;
CREATE POLICY "users_manage_own_promotions"
ON public.promotions FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Promotion items
DROP POLICY IF EXISTS "users_manage_own_promotion_items" ON public.promotion_items;
CREATE POLICY "users_manage_own_promotion_items"
ON public.promotion_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Customer profiles
DROP POLICY IF EXISTS "users_manage_customer_profiles" ON public.customer_profiles;
CREATE POLICY "users_manage_customer_profiles"
ON public.customer_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Customer segments
DROP POLICY IF EXISTS "users_manage_customer_segments" ON public.customer_segments;
CREATE POLICY "users_manage_customer_segments"
ON public.customer_segments FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_segment_assignments" ON public.customer_segment_assignments;
CREATE POLICY "users_manage_segment_assignments"
ON public.customer_segment_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Gift cards
DROP POLICY IF EXISTS "users_manage_own_gift_cards" ON public.gift_cards;
CREATE POLICY "users_manage_own_gift_cards"
ON public.gift_cards FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_view_own_gift_card_transactions" ON public.gift_card_transactions;
CREATE POLICY "users_view_own_gift_card_transactions"
ON public.gift_card_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_gift_card_config" ON public.gift_card_config;
CREATE POLICY "users_manage_gift_card_config"
ON public.gift_card_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_gift_card_corporate_config" ON public.gift_card_corporate_config;
CREATE POLICY "users_manage_gift_card_corporate_config"
ON public.gift_card_corporate_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_gift_card_corporate_orders" ON public.gift_card_corporate_orders;
CREATE POLICY "users_manage_gift_card_corporate_orders"
ON public.gift_card_corporate_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_prepaid_card_config" ON public.prepaid_card_config;
CREATE POLICY "users_manage_prepaid_card_config"
ON public.prepaid_card_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- POS
DROP POLICY IF EXISTS "users_manage_cash_register_sessions" ON public.cash_register_sessions;
CREATE POLICY "users_manage_cash_register_sessions"
ON public.cash_register_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_pos_transactions" ON public.pos_transactions;
CREATE POLICY "users_manage_pos_transactions"
ON public.pos_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_pos_transaction_items" ON public.pos_transaction_items;
CREATE POLICY "users_manage_pos_transaction_items"
ON public.pos_transaction_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_pos_payment_details" ON public.pos_payment_details;
CREATE POLICY "users_manage_pos_payment_details"
ON public.pos_payment_details FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Staff
DROP POLICY IF EXISTS "users_manage_staff_members" ON public.staff_members;
CREATE POLICY "users_manage_staff_members"
ON public.staff_members FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_staff_permissions" ON public.staff_permissions;
CREATE POLICY "users_manage_staff_permissions"
ON public.staff_permissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_staff_activity_logs" ON public.staff_activity_logs;
CREATE POLICY "users_manage_staff_activity_logs"
ON public.staff_activity_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_shift_schedules" ON public.shift_schedules;
CREATE POLICY "users_manage_shift_schedules"
ON public.shift_schedules FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Inventory
DROP POLICY IF EXISTS "users_manage_inventory_adjustments" ON public.inventory_adjustments;
CREATE POLICY "users_manage_inventory_adjustments"
ON public.inventory_adjustments FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_stock_alerts" ON public.stock_alerts;
CREATE POLICY "users_manage_stock_alerts"
ON public.stock_alerts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Suppliers & POs
DROP POLICY IF EXISTS "users_manage_own_suppliers" ON public.suppliers;
CREATE POLICY "users_manage_own_suppliers"
ON public.suppliers FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_supplier_products" ON public.supplier_products;
CREATE POLICY "users_manage_supplier_products"
ON public.supplier_products FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_own_purchase_orders" ON public.purchase_orders;
CREATE POLICY "users_manage_own_purchase_orders"
ON public.purchase_orders FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_purchase_order_items" ON public.purchase_order_items;
CREATE POLICY "users_manage_purchase_order_items"
ON public.purchase_order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_inventory_transfers" ON public.inventory_transfers;
CREATE POLICY "users_manage_inventory_transfers"
ON public.inventory_transfers FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_inventory_transfer_items" ON public.inventory_transfer_items;
CREATE POLICY "users_manage_inventory_transfer_items"
ON public.inventory_transfer_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_reorder_rules" ON public.reorder_rules;
CREATE POLICY "users_manage_reorder_rules"
ON public.reorder_rules FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_goods_receipts" ON public.goods_receipts;
CREATE POLICY "users_manage_goods_receipts"
ON public.goods_receipts FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_goods_receipt_items" ON public.goods_receipt_items;
CREATE POLICY "users_manage_goods_receipt_items"
ON public.goods_receipt_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Reservations
DROP POLICY IF EXISTS "users_manage_reservation_services" ON public.reservation_services;
CREATE POLICY "users_manage_reservation_services"
ON public.reservation_services FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_reservation_schedules" ON public.reservation_schedules;
CREATE POLICY "users_manage_reservation_schedules"
ON public.reservation_schedules FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_cancellation_policies" ON public.cancellation_policies;
CREATE POLICY "users_manage_cancellation_policies"
ON public.cancellation_policies FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_reservations" ON public.reservations;
CREATE POLICY "users_manage_reservations"
ON public.reservations FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_reservation_waitlist" ON public.reservation_waitlist;
CREATE POLICY "users_manage_reservation_waitlist"
ON public.reservation_waitlist FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_reservation_reminders" ON public.reservation_reminders;
CREATE POLICY "users_manage_reservation_reminders"
ON public.reservation_reminders FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Campaigns
DROP POLICY IF EXISTS "open_access_campaign_objectives" ON public.campaign_objectives;
CREATE POLICY "open_access_campaign_objectives"
ON public.campaign_objectives FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "open_access_campaign_sequences" ON public.campaign_sequences;
CREATE POLICY "open_access_campaign_sequences"
ON public.campaign_sequences FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "open_access_campaign_ab_tests" ON public.campaign_ab_tests;
CREATE POLICY "open_access_campaign_ab_tests"
ON public.campaign_ab_tests FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "open_access_campaign_notifications" ON public.campaign_notifications;
CREATE POLICY "open_access_campaign_notifications"
ON public.campaign_notifications FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "open_access_sequence_promotion_steps" ON public.sequence_promotion_steps;
CREATE POLICY "open_access_sequence_promotion_steps"
ON public.sequence_promotion_steps FOR ALL TO public USING (true) WITH CHECK (true);

-- Automation
DROP POLICY IF EXISTS "users_manage_automation_rules" ON public.engagement_automation_rules;
CREATE POLICY "users_manage_automation_rules"
ON public.engagement_automation_rules FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_automation_log" ON public.automation_execution_log;
CREATE POLICY "users_manage_automation_log"
ON public.automation_execution_log FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Check-in
DROP POLICY IF EXISTS "users_manage_checkin_methods" ON public.checkin_methods;
CREATE POLICY "users_manage_checkin_methods"
ON public.checkin_methods FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_checkins" ON public.checkins;
CREATE POLICY "users_manage_checkins"
ON public.checkins FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_checkin_rewards" ON public.checkin_rewards;
CREATE POLICY "users_manage_checkin_rewards"
ON public.checkin_rewards FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_checkin_rules" ON public.checkin_rules;
CREATE POLICY "users_manage_checkin_rules"
ON public.checkin_rules FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_nfc_tags" ON public.nfc_tags;
CREATE POLICY "users_manage_nfc_tags"
ON public.nfc_tags FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_ble_beacons" ON public.ble_beacons;
CREATE POLICY "users_manage_ble_beacons"
ON public.ble_beacons FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Rewards
DROP POLICY IF EXISTS "users_manage_punch_cards" ON public.punch_cards;
CREATE POLICY "users_manage_punch_cards"
ON public.punch_cards FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_punch_card_stamps" ON public.punch_card_stamps;
CREATE POLICY "users_manage_punch_card_stamps"
ON public.punch_card_stamps FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_vip_levels_config" ON public.vip_levels_config;
CREATE POLICY "users_manage_vip_levels_config"
ON public.vip_levels_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_vip_levels" ON public.vip_levels;
CREATE POLICY "users_manage_vip_levels"
ON public.vip_levels FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_vip_level_benefits" ON public.vip_level_benefits;
CREATE POLICY "users_manage_vip_level_benefits"
ON public.vip_level_benefits FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_customer_vip_levels" ON public.customer_vip_levels;
CREATE POLICY "users_manage_customer_vip_levels"
ON public.customer_vip_levels FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_surprise_rewards_config" ON public.surprise_rewards_config;
CREATE POLICY "users_manage_surprise_rewards_config"
ON public.surprise_rewards_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_exclusive_experiences" ON public.exclusive_experiences;
CREATE POLICY "users_manage_exclusive_experiences"
ON public.exclusive_experiences FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_own_rewards_automation_rules" ON public.rewards_automation_rules;
CREATE POLICY "users_manage_own_rewards_automation_rules"
ON public.rewards_automation_rules FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_loyalty_programs" ON public.loyalty_programs;
CREATE POLICY "users_manage_loyalty_programs"
ON public.loyalty_programs FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_loyalty_points" ON public.loyalty_points;
CREATE POLICY "users_manage_loyalty_points"
ON public.loyalty_points FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_loyalty_transactions" ON public.loyalty_transactions;
CREATE POLICY "users_manage_loyalty_transactions"
ON public.loyalty_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Reviews
DROP POLICY IF EXISTS "users_manage_reviews" ON public.reviews;
CREATE POLICY "users_manage_reviews"
ON public.reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_review_replies" ON public.review_replies;
CREATE POLICY "users_manage_review_replies"
ON public.review_replies FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_review_reports" ON public.review_reports;
CREATE POLICY "users_manage_review_reports"
ON public.review_reports FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_review_requests" ON public.review_requests;
CREATE POLICY "users_manage_review_requests"
ON public.review_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_review_incentive_config" ON public.review_incentive_config;
CREATE POLICY "users_manage_review_incentive_config"
ON public.review_incentive_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_review_request_config" ON public.review_request_config;
CREATE POLICY "users_manage_review_request_config"
ON public.review_request_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Surveys
DROP POLICY IF EXISTS "users_manage_nps_config" ON public.nps_config;
CREATE POLICY "users_manage_nps_config"
ON public.nps_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_nps_responses" ON public.nps_responses;
CREATE POLICY "users_manage_nps_responses"
ON public.nps_responses FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_surveys" ON public.surveys;
CREATE POLICY "users_manage_surveys"
ON public.surveys FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_survey_triggers" ON public.survey_triggers;
CREATE POLICY "users_manage_survey_triggers"
ON public.survey_triggers FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_survey_questions" ON public.survey_questions;
CREATE POLICY "users_manage_survey_questions"
ON public.survey_questions FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_survey_responses" ON public.survey_responses;
CREATE POLICY "users_manage_survey_responses"
ON public.survey_responses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Geofence
DROP POLICY IF EXISTS "geofence_config_open_access" ON public.geofence_config;
CREATE POLICY "geofence_config_open_access"
ON public.geofence_config FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "geofence_notifications_open_access" ON public.geofence_notifications;
CREATE POLICY "geofence_notifications_open_access"
ON public.geofence_notifications FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "geofence_events_open_access" ON public.geofence_events;
CREATE POLICY "geofence_events_open_access"
ON public.geofence_events FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "geofence_ab_results_open_access" ON public.geofence_ab_results;
CREATE POLICY "geofence_ab_results_open_access"
ON public.geofence_ab_results FOR ALL TO public USING (true) WITH CHECK (true);

-- Orders
DROP POLICY IF EXISTS "users_manage_order_ahead_config" ON public.order_ahead_config;
CREATE POLICY "users_manage_order_ahead_config"
ON public.order_ahead_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_order_slots" ON public.order_slots;
CREATE POLICY "users_manage_order_slots"
ON public.order_slots FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_order_slot_exceptions" ON public.order_slot_exceptions;
CREATE POLICY "users_manage_order_slot_exceptions"
ON public.order_slot_exceptions FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_orders" ON public.orders;
CREATE POLICY "users_manage_orders"
ON public.orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_order_items" ON public.order_items;
CREATE POLICY "users_manage_order_items"
ON public.order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_featured_items" ON public.featured_items;
CREATE POLICY "users_manage_featured_items"
ON public.featured_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_upsell_rules" ON public.upsell_rules;
CREATE POLICY "users_manage_upsell_rules"
ON public.upsell_rules FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Membership
DROP POLICY IF EXISTS "users_manage_membership_programs" ON public.membership_programs;
CREATE POLICY "users_manage_membership_programs"
ON public.membership_programs FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_membership_benefits" ON public.membership_benefits;
CREATE POLICY "users_manage_membership_benefits"
ON public.membership_benefits FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_membership_subscriptions" ON public.membership_subscriptions;
CREATE POLICY "users_manage_membership_subscriptions"
ON public.membership_subscriptions FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_membership_consumptions" ON public.membership_consumptions;
CREATE POLICY "users_manage_membership_consumptions"
ON public.membership_consumptions FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_membership_messages" ON public.membership_messages;
CREATE POLICY "users_manage_membership_messages"
ON public.membership_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Business listing drafts
DROP POLICY IF EXISTS "users_manage_own_business_listing_drafts" ON public.business_listing_drafts;
CREATE POLICY "users_manage_own_business_listing_drafts"
ON public.business_listing_drafts FOR ALL TO authenticated
USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- CURP log
DROP POLICY IF EXISTS "Users can insert their own curp logs" ON public.curp_validation_log;
CREATE POLICY "Users can insert their own curp logs"
ON public.curp_validation_log FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can read their own curp logs" ON public.curp_validation_log;
CREATE POLICY "Users can read their own curp logs"
ON public.curp_validation_log FOR SELECT TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL);

-- Business security features
DROP POLICY IF EXISTS "users_manage_own_business_security_features" ON public.business_security_features;
CREATE POLICY "users_manage_own_business_security_features"
ON public.business_security_features FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_business_security_features" ON public.business_security_features;
CREATE POLICY "public_read_business_security_features"
ON public.business_security_features FOR SELECT TO public USING (enabled = true);

-- Email templates
DROP POLICY IF EXISTS "users_manage_email_templates" ON public.email_templates;
CREATE POLICY "users_manage_email_templates"
ON public.email_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Alert settings
DROP POLICY IF EXISTS "users_manage_alert_settings" ON public.alert_settings;
CREATE POLICY "users_manage_alert_settings"
ON public.alert_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Coupons
DROP POLICY IF EXISTS "users_manage_coupons" ON public.coupons;
CREATE POLICY "users_manage_coupons"
ON public.coupons FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_coupon_redemptions" ON public.coupon_redemptions;
CREATE POLICY "users_manage_coupon_redemptions"
ON public.coupon_redemptions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- SECTION 24: STORAGE BUCKET
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'promotional-images',
    'promotional-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_can_view_promotional_images" ON storage.objects;
CREATE POLICY "public_can_view_promotional_images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'promotional-images');

DROP POLICY IF EXISTS "authenticated_users_upload_promotional_images" ON storage.objects;
CREATE POLICY "authenticated_users_upload_promotional_images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'promotional-images');

DROP POLICY IF EXISTS "owners_manage_promotional_images" ON storage.objects;
CREATE POLICY "owners_manage_promotional_images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'promotional-images' AND owner = auth.uid());

DROP POLICY IF EXISTS "owners_update_promotional_images" ON storage.objects;
CREATE POLICY "owners_update_promotional_images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'promotional-images' AND owner = auth.uid())
WITH CHECK (bucket_id = 'promotional-images' AND owner = auth.uid());

-- ============================================================
-- SECTION 25: TRIGGERS
-- ============================================================

-- Auth user creation trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at triggers
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_catalog_items_updated_at ON public.catalog_items;
CREATE TRIGGER update_catalog_items_updated_at
    BEFORE UPDATE ON public.catalog_items
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_promotions_updated_at ON public.promotions;
CREATE TRIGGER update_promotions_updated_at
    BEFORE UPDATE ON public.promotions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_gift_cards_timestamp ON public.gift_cards;
CREATE TRIGGER update_gift_cards_timestamp
    BEFORE UPDATE ON public.gift_cards
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS create_gift_card_transaction_trigger ON public.gift_cards;
CREATE TRIGGER create_gift_card_transaction_trigger
    AFTER INSERT OR UPDATE ON public.gift_cards
    FOR EACH ROW EXECUTE FUNCTION public.create_gift_card_transaction();

DROP TRIGGER IF EXISTS update_pos_transactions_updated_at ON public.pos_transactions;
CREATE TRIGGER update_pos_transactions_updated_at
    BEFORE UPDATE ON public.pos_transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_customer_stats_trigger ON public.pos_transactions;
CREATE TRIGGER update_customer_stats_trigger
    AFTER INSERT OR UPDATE ON public.pos_transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_customer_stats();

DROP TRIGGER IF EXISTS update_cash_register_stats_trigger ON public.pos_transactions;
CREATE TRIGGER update_cash_register_stats_trigger
    AFTER INSERT ON public.pos_transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_cash_register_stats();

DROP TRIGGER IF EXISTS rewards_automation_rules_updated_at ON public.rewards_automation_rules;
CREATE TRIGGER rewards_automation_rules_updated_at
    BEFORE UPDATE ON public.rewards_automation_rules
    FOR EACH ROW EXECUTE FUNCTION public.update_rewards_automation_rules_updated_at();

DROP TRIGGER IF EXISTS trg_business_security_updated_at ON public.business_security_features;
CREATE TRIGGER trg_business_security_updated_at
    BEFORE UPDATE ON public.business_security_features
    FOR EACH ROW EXECUTE FUNCTION public.set_business_security_updated_at();

-- ============================================================
-- SECTION 26: SEED DATA - BUSINESS CATEGORIES
-- ============================================================

DO $$
DECLARE
    cat_restaurantes    uuid;
    cat_bares           uuid;
    cat_compras         uuid;
    cat_salud           uuid;
    cat_belleza         uuid;
    cat_entretenimiento uuid;
    cat_deporte         uuid;
    cat_automotriz      uuid;
    cat_servicios       uuid;
    cat_educacion       uuid;
    cat_hogar           uuid;
    cat_mascotas        uuid;
    cat_viajes          uuid;
    sub_id              uuid;
BEGIN
    -- Insert main categories
    INSERT INTO public.business_categories (nombre) VALUES
        ('Restaurantes y Comida'),
        ('Bares y Vida Nocturna'),
        ('Compras y Retail'),
        ('Salud y Bienestar'),
        ('Belleza y Cuidado Personal'),
        ('Entretenimiento'),
        ('Deporte y Fitness'),
        ('Automotriz'),
        ('Servicios Profesionales'),
        ('Educacion y Capacitacion'),
        ('Hogar y Jardineria'),
        ('Mascotas'),
        ('Viajes y Turismo')
    ON CONFLICT (nombre) DO NOTHING;

    SELECT id INTO cat_restaurantes FROM public.business_categories WHERE nombre = 'Restaurantes y Comida' LIMIT 1;
    SELECT id INTO cat_bares FROM public.business_categories WHERE nombre = 'Bares y Vida Nocturna' LIMIT 1;
    SELECT id INTO cat_compras FROM public.business_categories WHERE nombre = 'Compras y Retail' LIMIT 1;
    SELECT id INTO cat_salud FROM public.business_categories WHERE nombre = 'Salud y Bienestar' LIMIT 1;
    SELECT id INTO cat_belleza FROM public.business_categories WHERE nombre = 'Belleza y Cuidado Personal' LIMIT 1;
    SELECT id INTO cat_entretenimiento FROM public.business_categories WHERE nombre = 'Entretenimiento' LIMIT 1;
    SELECT id INTO cat_deporte FROM public.business_categories WHERE nombre = 'Deporte y Fitness' LIMIT 1;
    SELECT id INTO cat_automotriz FROM public.business_categories WHERE nombre = 'Automotriz' LIMIT 1;
    SELECT id INTO cat_servicios FROM public.business_categories WHERE nombre = 'Servicios Profesionales' LIMIT 1;
    SELECT id INTO cat_educacion FROM public.business_categories WHERE nombre = 'Educacion y Capacitacion' LIMIT 1;
    SELECT id INTO cat_hogar FROM public.business_categories WHERE nombre = 'Hogar y Jardineria' LIMIT 1;
    SELECT id INTO cat_mascotas FROM public.business_categories WHERE nombre = 'Mascotas' LIMIT 1;
    SELECT id INTO cat_viajes FROM public.business_categories WHERE nombre = 'Viajes y Turismo' LIMIT 1;

    -- Subcategories for Restaurantes
    IF cat_restaurantes IS NOT NULL THEN
        INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES
            (cat_restaurantes, 'Comida Mexicana'),
            (cat_restaurantes, 'Comida Internacional'),
            (cat_restaurantes, 'Cafeterias y Cafes'),
            (cat_restaurantes, 'Comida Rapida'),
            (cat_restaurantes, 'Panaderia y Pasteleria'),
            (cat_restaurantes, 'Mariscos y Pescados'),
            (cat_restaurantes, 'Pizzerias'),
            (cat_restaurantes, 'Sushi y Comida Japonesa')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Subcategories for Belleza
    IF cat_belleza IS NOT NULL THEN
        INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES
            (cat_belleza, 'Salones de Belleza'),
            (cat_belleza, 'Barberia'),
            (cat_belleza, 'Spa y Masajes'),
            (cat_belleza, 'Manicure y Pedicure'),
            (cat_belleza, 'Estetica Canina')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Subcategories for Salud
    IF cat_salud IS NOT NULL THEN
        INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES
            (cat_salud, 'Gimnasios'),
            (cat_salud, 'Clinicas y Consultorios'),
            (cat_salud, 'Farmacias'),
            (cat_salud, 'Opticas'),
            (cat_salud, 'Nutricion y Dietetica')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Subcategories for Compras
    IF cat_compras IS NOT NULL THEN
        INSERT INTO public.business_subcategories (categoria_id, nombre) VALUES
            (cat_compras, 'Ropa y Moda'),
            (cat_compras, 'Calzado'),
            (cat_compras, 'Accesorios'),
            (cat_compras, 'Electronica'),
            (cat_compras, 'Joyeria'),
            (cat_compras, 'Libreria y Papeleria')
        ON CONFLICT DO NOTHING;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Seed data error: %', SQLERRM;
END $$;

-- ============================================================
-- SECTION 27: SEED DATA - DEMO USER
-- ============================================================

DO $$
DECLARE
    demo_user_id UUID := gen_random_uuid();
BEGIN
    -- Create demo auth user
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES (
        demo_user_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'demo@promospot.mx',
        crypt('Demo1234!', gen_salt('bf', 10)),
        now(),
        now(),
        now(),
        jsonb_build_object(
            'full_name', 'Demo PromoSpot',
            'business_name', 'Negocio Demo',
            'role', 'owner'
        ),
        jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
        false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
    )
    ON CONFLICT (id) DO NOTHING;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Demo user creation skipped: %', SQLERRM;
END $$;
