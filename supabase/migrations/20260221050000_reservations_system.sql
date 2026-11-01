-- Reservations System Migration
-- Purpose: Complete reservations module with schedule configuration, booking management, loyalty integration, marketing automation, and analytics

-- 1. Types
DROP TYPE IF EXISTS public.reservation_status CASCADE;
CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');

DROP TYPE IF EXISTS public.reminder_type CASCADE;
CREATE TYPE public.reminder_type AS ENUM ('push', 'email', 'sms');

DROP TYPE IF EXISTS public.reminder_status CASCADE;
CREATE TYPE public.reminder_status AS ENUM ('pending', 'sent', 'failed');

-- 2. Core Tables

-- Reservation Services Configuration (which catalog items are reservable)
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

-- Schedule Configuration (business hours for reservations per branch)
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

-- Cancellation Policies
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

-- Reservations Main Table
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

-- Waitlist Management
CREATE TABLE IF NOT EXISTS public.reservation_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.reservation_services(id) ON DELETE CASCADE,
    preferred_date DATE NOT NULL,
    preferred_time TIME,
    party_size INTEGER DEFAULT 1,
    is_notified BOOLEAN DEFAULT false,
    notified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Manual Time Blocks (for blocking specific time slots)
CREATE TABLE IF NOT EXISTS public.reservation_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    branch_name TEXT DEFAULT 'Principal',
    block_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason TEXT NOT NULL,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Loyalty Integration Configuration
CREATE TABLE IF NOT EXISTS public.reservation_loyalty_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL UNIQUE,
    points_per_reservation INTEGER DEFAULT 10,
    points_per_attendance INTEGER DEFAULT 20,
    no_show_penalty_points INTEGER DEFAULT 50,
    low_demand_bonus_points INTEGER DEFAULT 15,
    low_demand_hours TEXT[] DEFAULT ARRAY['14:00-16:00', '21:00-23:00']::TEXT[],
    vip_priority_enabled BOOLEAN DEFAULT true,
    vip_tier_names TEXT[] DEFAULT ARRAY['platinum', 'gold']::TEXT[],
    early_booking_bonus_days INTEGER DEFAULT 7,
    early_booking_bonus_points INTEGER DEFAULT 25,
    app_booking_discount_percentage DECIMAL(5, 2) DEFAULT 5,
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

-- Reminder Tracking
CREATE TABLE IF NOT EXISTS public.reservation_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE,
    reminder_type public.reminder_type NOT NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    status public.reminder_status DEFAULT 'pending'::public.reminder_status,
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Customer Reservation History (for analytics)
CREATE TABLE IF NOT EXISTS public.customer_reservation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
    business_id TEXT NOT NULL,
    total_reservations INTEGER DEFAULT 0,
    completed_reservations INTEGER DEFAULT 0,
    no_show_count INTEGER DEFAULT 0,
    cancelled_count INTEGER DEFAULT 0,
    total_points_earned INTEGER DEFAULT 0,
    total_points_penalty INTEGER DEFAULT 0,
    last_reservation_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, business_id)
);

-- Reservation Metrics (aggregated analytics)
CREATE TABLE IF NOT EXISTS public.reservation_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    metric_date DATE NOT NULL,
    total_reservations INTEGER DEFAULT 0,
    confirmed_reservations INTEGER DEFAULT 0,
    completed_reservations INTEGER DEFAULT 0,
    no_show_count INTEGER DEFAULT 0,
    cancelled_count INTEGER DEFAULT 0,
    occupancy_rate DECIMAL(5, 2) DEFAULT 0,
    revenue_generated DECIMAL(10, 2) DEFAULT 0,
    peak_hour TIME,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_id, metric_date)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_reservation_services_business_id ON public.reservation_services(business_id);
CREATE INDEX IF NOT EXISTS idx_reservation_services_catalog_item_id ON public.reservation_services(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_reservation_schedules_business_id ON public.reservation_schedules(business_id);
CREATE INDEX IF NOT EXISTS idx_reservation_schedules_day ON public.reservation_schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_reservations_business_id ON public.reservations(business_id);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_id ON public.reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservation_waitlist_business_id ON public.reservation_waitlist(business_id);
CREATE INDEX IF NOT EXISTS idx_reservation_blocks_business_id ON public.reservation_blocks(business_id);
CREATE INDEX IF NOT EXISTS idx_reservation_blocks_date ON public.reservation_blocks(block_date);
CREATE INDEX IF NOT EXISTS idx_reservation_reminders_reservation_id ON public.reservation_reminders(reservation_id);
CREATE INDEX IF NOT EXISTS idx_reservation_reminders_status ON public.reservation_reminders(status);
CREATE INDEX IF NOT EXISTS idx_customer_reservation_history_customer_id ON public.customer_reservation_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_reservation_metrics_business_id ON public.reservation_metrics(business_id);
CREATE INDEX IF NOT EXISTS idx_reservation_metrics_date ON public.reservation_metrics(metric_date);

-- 4. Functions

-- Function to update customer reservation history
CREATE OR REPLACE FUNCTION public.update_customer_reservation_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        INSERT INTO public.customer_reservation_history (
            customer_id,
            business_id,
            total_reservations,
            completed_reservations,
            no_show_count,
            cancelled_count,
            total_points_earned,
            total_points_penalty,
            last_reservation_date
        )
        SELECT
            NEW.customer_id,
            NEW.business_id,
            COUNT(*),
            COUNT(*) FILTER (WHERE status = 'completed'),
            COUNT(*) FILTER (WHERE status = 'no_show'),
            COUNT(*) FILTER (WHERE status = 'cancelled'),
            COALESCE(SUM(points_earned), 0),
            COALESCE(SUM(points_penalty), 0),
            MAX(reservation_date)
        FROM public.reservations
        WHERE customer_id = NEW.customer_id AND business_id = NEW.business_id
        GROUP BY customer_id, business_id
        ON CONFLICT (customer_id, business_id)
        DO UPDATE SET
            total_reservations = EXCLUDED.total_reservations,
            completed_reservations = EXCLUDED.completed_reservations,
            no_show_count = EXCLUDED.no_show_count,
            cancelled_count = EXCLUDED.cancelled_count,
            total_points_earned = EXCLUDED.total_points_earned,
            total_points_penalty = EXCLUDED.total_points_penalty,
            last_reservation_date = EXCLUDED.last_reservation_date,
            updated_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$;

-- Function to generate reservation number
CREATE OR REPLACE FUNCTION public.generate_reservation_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.reservation_number IS NULL OR NEW.reservation_number = '' THEN
        NEW.reservation_number := 'RES-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$;

-- 5. Enable RLS
ALTER TABLE public.reservation_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancellation_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_loyalty_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_marketing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_reservation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_metrics ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Reservation Services
DROP POLICY IF EXISTS "users_manage_reservation_services" ON public.reservation_services;
CREATE POLICY "users_manage_reservation_services"
ON public.reservation_services
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Reservation Schedules
DROP POLICY IF EXISTS "users_manage_reservation_schedules" ON public.reservation_schedules;
CREATE POLICY "users_manage_reservation_schedules"
ON public.reservation_schedules
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Cancellation Policies
DROP POLICY IF EXISTS "users_manage_cancellation_policies" ON public.cancellation_policies;
CREATE POLICY "users_manage_cancellation_policies"
ON public.cancellation_policies
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Reservations
DROP POLICY IF EXISTS "users_manage_reservations" ON public.reservations;
CREATE POLICY "users_manage_reservations"
ON public.reservations
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Waitlist
DROP POLICY IF EXISTS "users_manage_waitlist" ON public.reservation_waitlist;
CREATE POLICY "users_manage_waitlist"
ON public.reservation_waitlist
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Blocks
DROP POLICY IF EXISTS "users_manage_blocks" ON public.reservation_blocks;
CREATE POLICY "users_manage_blocks"
ON public.reservation_blocks
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Loyalty Config
DROP POLICY IF EXISTS "users_manage_loyalty_config" ON public.reservation_loyalty_config;
CREATE POLICY "users_manage_loyalty_config"
ON public.reservation_loyalty_config
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Marketing Config
DROP POLICY IF EXISTS "users_manage_marketing_config" ON public.reservation_marketing_config;
CREATE POLICY "users_manage_marketing_config"
ON public.reservation_marketing_config
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Reminders
DROP POLICY IF EXISTS "users_view_reminders" ON public.reservation_reminders;
CREATE POLICY "users_view_reminders"
ON public.reservation_reminders
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Customer History
DROP POLICY IF EXISTS "users_view_customer_history" ON public.customer_reservation_history;
CREATE POLICY "users_view_customer_history"
ON public.customer_reservation_history
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Metrics
DROP POLICY IF EXISTS "users_view_metrics" ON public.reservation_metrics;
CREATE POLICY "users_view_metrics"
ON public.reservation_metrics
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 7. Triggers

DROP TRIGGER IF EXISTS generate_reservation_number_trigger ON public.reservations;
CREATE TRIGGER generate_reservation_number_trigger
BEFORE INSERT ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.generate_reservation_number();

DROP TRIGGER IF EXISTS update_customer_history_trigger ON public.reservations;
CREATE TRIGGER update_customer_history_trigger
AFTER INSERT OR UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.update_customer_reservation_history();

-- 8. Mock Data
DO $$
DECLARE
    existing_user_id UUID;
    existing_customer_id UUID;
    existing_catalog_item_id UUID;
    business_id_val TEXT := '1';
    service_id_val UUID;
    schedule_id_val UUID;
BEGIN
    -- Get existing user
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
        
        IF existing_user_id IS NOT NULL THEN
            -- Get existing customer
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_profiles') THEN
                SELECT id INTO existing_customer_id FROM public.customer_profiles WHERE business_id = business_id_val LIMIT 1;
            END IF;
            
            -- Get existing catalog item
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'catalog_items') THEN
                SELECT id INTO existing_catalog_item_id FROM public.catalog_items LIMIT 1;
            END IF;
            
            -- Create reservation services
            INSERT INTO public.reservation_services (id, business_id, catalog_item_id, service_name, duration_minutes, max_capacity, advance_payment_required, advance_payment_percentage, min_advance_hours, max_advance_days, created_by)
            VALUES 
                (gen_random_uuid(), business_id_val, existing_catalog_item_id, 'Corte de Cabello', 45, 1, false, 0, 2, 30, existing_user_id),
                (gen_random_uuid(), business_id_val, existing_catalog_item_id, 'Consulta Médica', 30, 1, true, 50, 24, 60, existing_user_id),
                (gen_random_uuid(), business_id_val, existing_catalog_item_id, 'Mesa para 4 personas', 120, 4, false, 0, 1, 14, existing_user_id)
            ON CONFLICT (id) DO NOTHING
            RETURNING id INTO service_id_val;
            
            -- Create reservation schedules
            INSERT INTO public.reservation_schedules (business_id, branch_name, day_of_week, is_available, start_time, end_time, slot_duration_minutes, created_by)
            VALUES 
                (business_id_val, 'Principal', 'monday'::public.day_of_week, true, '09:00', '18:00', 30, existing_user_id),
                (business_id_val, 'Principal', 'tuesday'::public.day_of_week, true, '09:00', '18:00', 30, existing_user_id),
                (business_id_val, 'Principal', 'wednesday'::public.day_of_week, true, '09:00', '18:00', 30, existing_user_id),
                (business_id_val, 'Principal', 'thursday'::public.day_of_week, true, '09:00', '18:00', 30, existing_user_id),
                (business_id_val, 'Principal', 'friday'::public.day_of_week, true, '09:00', '20:00', 30, existing_user_id),
                (business_id_val, 'Principal', 'saturday'::public.day_of_week, true, '10:00', '14:00', 30, existing_user_id),
                (business_id_val, 'Principal', 'sunday'::public.day_of_week, false, '00:00', '00:00', 30, existing_user_id)
            ON CONFLICT DO NOTHING;
            
            -- Create cancellation policy
            INSERT INTO public.cancellation_policies (business_id, policy_name, min_hours_before, penalty_percentage, points_penalty, description, is_default)
            VALUES 
                (business_id_val, 'Política Estándar', 24, 0, 0, 'Cancelación gratuita con 24 horas de anticipación', true),
                (business_id_val, 'Política Estricta', 48, 50, 25, 'Penalización del 50% si cancela con menos de 48 horas', false)
            ON CONFLICT DO NOTHING;
            
            -- Create loyalty config
            INSERT INTO public.reservation_loyalty_config (business_id, points_per_reservation, points_per_attendance, no_show_penalty_points, low_demand_bonus_points, early_booking_bonus_points, app_booking_discount_percentage)
            VALUES (business_id_val, 10, 20, 50, 15, 25, 5)
            ON CONFLICT (business_id) DO NOTHING;
            
            -- Create marketing config
            INSERT INTO public.reservation_marketing_config (business_id, reminder_enabled, reminder_hours_before, inactive_customer_days, post_service_survey_enabled)
            VALUES (business_id_val, true, 24, 30, true)
            ON CONFLICT (business_id) DO NOTHING;
            
            -- Create sample reservations if customer exists
            IF existing_customer_id IS NOT NULL AND service_id_val IS NOT NULL THEN
                INSERT INTO public.reservations (business_id, customer_id, service_id, branch_name, reservation_date, reservation_time, duration_minutes, party_size, status, points_earned, created_by)
                VALUES 
                    (business_id_val, existing_customer_id, service_id_val, 'Principal', CURRENT_DATE + INTERVAL '2 days', '10:00', 45, 1, 'confirmed'::public.reservation_status, 10, existing_user_id),
                    (business_id_val, existing_customer_id, service_id_val, 'Principal', CURRENT_DATE + INTERVAL '5 days', '14:00', 45, 1, 'pending'::public.reservation_status, 0, existing_user_id),
                    (business_id_val, existing_customer_id, service_id_val, 'Principal', CURRENT_DATE - INTERVAL '3 days', '11:00', 45, 1, 'completed'::public.reservation_status, 30, existing_user_id)
                ON CONFLICT (reservation_number) DO NOTHING;
            END IF;
            
            RAISE NOTICE 'Reservations mock data created successfully';
        ELSE
            RAISE NOTICE 'No users found. Run auth migration first.';
        END IF;
    ELSE
        RAISE NOTICE 'Table user_profiles does not exist. Run auth migration first.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;