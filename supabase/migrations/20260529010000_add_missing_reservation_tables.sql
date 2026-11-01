-- Add missing reservation tables that were not applied from the original migration
-- This migration is idempotent and safe to run multiple times

-- Ensure enum types exist (they may have been dropped by CASCADE)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reminder_type' AND typnamespace = 'public'::regnamespace) THEN
        CREATE TYPE public.reminder_type AS ENUM ('push', 'email', 'sms');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reminder_status' AND typnamespace = 'public'::regnamespace) THEN
        CREATE TYPE public.reminder_status AS ENUM ('pending', 'sent', 'failed');
    END IF;
END $$;

-- Manual Time Blocks
CREATE TABLE IF NOT EXISTS public.reservation_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    location_id UUID REFERENCES public.business_locations(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    reason TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Loyalty Integration Configuration
CREATE TABLE IF NOT EXISTS public.reservation_loyalty_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL UNIQUE,
    points_per_reservation INTEGER DEFAULT 10,
    points_per_show BOOLEAN DEFAULT true,
    bonus_points_first_reservation INTEGER DEFAULT 50,
    vip_priority_booking BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Marketing Integration Configuration
CREATE TABLE IF NOT EXISTS public.reservation_marketing_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL UNIQUE,
    reminder_enabled BOOLEAN DEFAULT true,
    reminder_hours_before INTEGER DEFAULT 24,
    reminder_types public.reminder_type[] DEFAULT ARRAY['push', 'email']::public.reminder_type[],
    inactive_customer_days INTEGER DEFAULT 30,
    inactive_customer_campaign_enabled BOOLEAN DEFAULT true,
    low_demand_promotion_enabled BOOLEAN DEFAULT true,
    post_service_survey_enabled BOOLEAN DEFAULT true,
    survey_delay_hours INTEGER DEFAULT 2,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Reservation Metrics (aggregated analytics)
CREATE TABLE IF NOT EXISTS public.reservation_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    location_id UUID REFERENCES public.business_locations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_reservations INTEGER DEFAULT 0,
    confirmed_reservations INTEGER DEFAULT 0,
    cancelled_reservations INTEGER DEFAULT 0,
    no_show_count INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    avg_party_size DECIMAL(5,2) DEFAULT 0,
    revenue_generated DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_id, location_id, date)
);

-- Customer Reservation History (for analytics)
CREATE TABLE IF NOT EXISTS public.customer_reservation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
    business_id TEXT NOT NULL,
    total_reservations INTEGER DEFAULT 0,
    completed_reservations INTEGER DEFAULT 0,
    cancelled_reservations INTEGER DEFAULT 0,
    no_show_count INTEGER DEFAULT 0,
    last_reservation_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, business_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reservation_blocks_business_id ON public.reservation_blocks(business_id);
CREATE INDEX IF NOT EXISTS idx_reservation_blocks_location_id ON public.reservation_blocks(location_id);
CREATE INDEX IF NOT EXISTS idx_reservation_loyalty_config_business_id ON public.reservation_loyalty_config(business_id);
CREATE INDEX IF NOT EXISTS idx_reservation_marketing_config_business_id ON public.reservation_marketing_config(business_id);
CREATE INDEX IF NOT EXISTS idx_reservation_metrics_business_id ON public.reservation_metrics(business_id);
CREATE INDEX IF NOT EXISTS idx_customer_reservation_history_customer_id ON public.customer_reservation_history(customer_id);

-- Enable RLS
ALTER TABLE public.reservation_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_loyalty_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_marketing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_reservation_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "users_manage_reservation_blocks" ON public.reservation_blocks;
CREATE POLICY "users_manage_reservation_blocks"
ON public.reservation_blocks
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_reservation_loyalty_config" ON public.reservation_loyalty_config;
CREATE POLICY "users_manage_reservation_loyalty_config"
ON public.reservation_loyalty_config
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_marketing_config" ON public.reservation_marketing_config;
CREATE POLICY "users_manage_marketing_config"
ON public.reservation_marketing_config
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_reservation_metrics" ON public.reservation_metrics;
CREATE POLICY "users_manage_reservation_metrics"
ON public.reservation_metrics
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "users_manage_customer_reservation_history" ON public.customer_reservation_history;
CREATE POLICY "users_manage_customer_reservation_history"
ON public.customer_reservation_history
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
