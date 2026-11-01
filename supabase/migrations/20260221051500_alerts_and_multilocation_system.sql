-- =====================================================
-- ALERTS AND MULTI-LOCATION MANAGEMENT SYSTEM
-- Migration: 20260221051500
-- =====================================================

-- 1. ENUMS
DROP TYPE IF EXISTS public.alert_type CASCADE;
CREATE TYPE public.alert_type AS ENUM (
    'high_value_sale',
    'low_stock',
    'staff_shift_start',
    'staff_shift_end',
    'staff_no_show',
    'customer_milestone',
    'customer_birthday',
    'system'
);

DROP TYPE IF EXISTS public.alert_priority CASCADE;
CREATE TYPE public.alert_priority AS ENUM ('low', 'medium', 'high', 'critical');

DROP TYPE IF EXISTS public.alert_status CASCADE;
CREATE TYPE public.alert_status AS ENUM ('unread', 'read', 'dismissed', 'actioned');

-- 2. CENTRALIZED ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.centralized_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    alert_type public.alert_type NOT NULL,
    priority public.alert_priority DEFAULT 'medium'::public.alert_priority,
    status public.alert_status DEFAULT 'unread'::public.alert_status,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    reference_id UUID,
    reference_table TEXT,
    action_url TEXT,
    is_dismissed BOOLEAN DEFAULT false,
    dismissed_at TIMESTAMPTZ,
    dismissed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. ALERT CONFIGURATION TABLE
CREATE TABLE IF NOT EXISTS public.alert_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    alert_type public.alert_type NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    threshold_value DECIMAL(10, 2),
    notification_channels JSONB DEFAULT '{"email": false, "push": true, "sms": false}',
    custom_settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_id, alert_type)
);

-- 4. BUSINESS LOCATIONS TABLE (for multi-location management)
CREATE TABLE IF NOT EXISTS public.business_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    location_name TEXT NOT NULL,
    location_code TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT,
    phone TEXT,
    email TEXT,
    manager_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    opening_date DATE,
    timezone TEXT DEFAULT 'UTC',
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_id, location_code)
);

-- 5. LOCATION INVENTORY TABLE (tracks inventory per location)
CREATE TABLE IF NOT EXISTS public.location_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES public.business_locations(id) ON DELETE CASCADE,
    catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE CASCADE,
    business_id TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 0,
    max_quantity INTEGER,
    last_restock_date DATE,
    last_restock_quantity INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(location_id, catalog_item_id)
);

-- 6. LOCATION STAFF ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.location_staff_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES public.business_locations(id) ON DELETE CASCADE,
    staff_member_id UUID REFERENCES public.staff_members(id) ON DELETE CASCADE,
    business_id TEXT NOT NULL,
    is_primary_location BOOLEAN DEFAULT false,
    assigned_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(location_id, staff_member_id)
);

-- 7. LOCATION SALES SUMMARY TABLE (for reporting)
CREATE TABLE IF NOT EXISTS public.location_sales_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES public.business_locations(id) ON DELETE CASCADE,
    business_id TEXT NOT NULL,
    summary_date DATE NOT NULL,
    total_sales DECIMAL(12, 2) DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    total_customers INTEGER DEFAULT 0,
    average_transaction_value DECIMAL(10, 2) DEFAULT 0,
    top_selling_items JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(location_id, summary_date)
);

-- 8. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_centralized_alerts_business_id ON public.centralized_alerts(business_id);
CREATE INDEX IF NOT EXISTS idx_centralized_alerts_alert_type ON public.centralized_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_centralized_alerts_priority ON public.centralized_alerts(priority);
CREATE INDEX IF NOT EXISTS idx_centralized_alerts_status ON public.centralized_alerts(status);
CREATE INDEX IF NOT EXISTS idx_centralized_alerts_created_at ON public.centralized_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_centralized_alerts_reference ON public.centralized_alerts(reference_table, reference_id);

CREATE INDEX IF NOT EXISTS idx_alert_configurations_business_id ON public.alert_configurations(business_id);
CREATE INDEX IF NOT EXISTS idx_alert_configurations_alert_type ON public.alert_configurations(alert_type);

CREATE INDEX IF NOT EXISTS idx_business_locations_business_id ON public.business_locations(business_id);
CREATE INDEX IF NOT EXISTS idx_business_locations_is_active ON public.business_locations(is_active);
CREATE INDEX IF NOT EXISTS idx_business_locations_location_code ON public.business_locations(location_code);

CREATE INDEX IF NOT EXISTS idx_location_inventory_location_id ON public.location_inventory(location_id);
CREATE INDEX IF NOT EXISTS idx_location_inventory_catalog_item_id ON public.location_inventory(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_location_inventory_business_id ON public.location_inventory(business_id);

CREATE INDEX IF NOT EXISTS idx_location_staff_assignments_location_id ON public.location_staff_assignments(location_id);
CREATE INDEX IF NOT EXISTS idx_location_staff_assignments_staff_member_id ON public.location_staff_assignments(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_location_staff_assignments_business_id ON public.location_staff_assignments(business_id);

CREATE INDEX IF NOT EXISTS idx_location_sales_summary_location_id ON public.location_sales_summary(location_id);
CREATE INDEX IF NOT EXISTS idx_location_sales_summary_business_id ON public.location_sales_summary(business_id);
CREATE INDEX IF NOT EXISTS idx_location_sales_summary_summary_date ON public.location_sales_summary(summary_date DESC);

-- 9. FUNCTIONS
CREATE OR REPLACE FUNCTION public.update_alert_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_high_value_sale_alert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_threshold DECIMAL(10, 2);
    v_enabled BOOLEAN;
    v_customer_name TEXT;
BEGIN
    -- Check if alert is enabled and get threshold
    SELECT is_enabled, threshold_value INTO v_enabled, v_threshold
    FROM public.alert_configurations
    WHERE business_id = NEW.business_id AND alert_type = 'high_value_sale';

    -- Default threshold if not configured
    IF v_threshold IS NULL THEN
        v_threshold := 100.00;
    END IF;

    -- Only create alert if enabled and transaction exceeds threshold
    IF (v_enabled IS NULL OR v_enabled = true) AND NEW.total_amount >= v_threshold AND NEW.status = 'completed' THEN
        -- Get customer name
        SELECT full_name INTO v_customer_name
        FROM public.customer_profiles
        WHERE id = NEW.customer_id;

        INSERT INTO public.centralized_alerts (
            business_id,
            alert_type,
            priority,
            title,
            message,
            metadata,
            reference_id,
            reference_table,
            action_url
        ) VALUES (
            NEW.business_id,
            'high_value_sale',
            'high',
            'Venta de Alto Valor',
            format('Venta de €%s realizada por %s', NEW.total_amount, COALESCE(v_customer_name, 'Cliente')),
            jsonb_build_object(
                'transaction_id', NEW.id,
                'amount', NEW.total_amount,
                'customer_id', NEW.customer_id,
                'transaction_number', NEW.transaction_number
            ),
            NEW.id,
            'pos_transactions',
            '/point-of-sale'
        );
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_low_stock_alert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_enabled BOOLEAN;
    v_item_name TEXT;
BEGIN
    -- Check if alert is enabled
    SELECT is_enabled INTO v_enabled
    FROM public.alert_configurations
    WHERE business_id = NEW.business_id AND alert_type = 'low_stock';

    -- Only create alert if enabled and not already resolved
    IF (v_enabled IS NULL OR v_enabled = true) AND NEW.is_resolved = false THEN
        -- Get item name
        SELECT name INTO v_item_name
        FROM public.catalog_items
        WHERE id = NEW.catalog_item_id;

        INSERT INTO public.centralized_alerts (
            business_id,
            alert_type,
            priority,
            title,
            message,
            metadata,
            reference_id,
            reference_table,
            action_url
        ) VALUES (
            NEW.business_id,
            'low_stock',
            'medium',
            'Advertencia de Stock Bajo',
            format('El producto "%s" tiene stock bajo: %s unidades', COALESCE(v_item_name, 'Producto'), NEW.current_quantity),
            jsonb_build_object(
                'catalog_item_id', NEW.catalog_item_id,
                'current_quantity', NEW.current_quantity,
                'threshold_quantity', NEW.threshold_quantity,
                'alert_type', NEW.alert_type
            ),
            NEW.id,
            'stock_alerts',
            '/inventory-management'
        );
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_shift_alert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_enabled BOOLEAN;
    v_staff_name TEXT;
    v_alert_type_enum public.alert_type;
    v_title TEXT;
    v_message TEXT;
BEGIN
    -- Get staff name
    SELECT full_name INTO v_staff_name
    FROM public.staff_members
    WHERE id = NEW.staff_member_id;

    -- Determine alert type based on status change
    IF NEW.status = 'in_progress' AND OLD.status = 'scheduled' THEN
        v_alert_type_enum := 'staff_shift_start';
        v_title := 'Turno Iniciado';
        v_message := format('%s ha iniciado su turno', COALESCE(v_staff_name, 'Personal'));
    ELSIF NEW.status = 'completed' AND OLD.status = 'in_progress' THEN
        v_alert_type_enum := 'staff_shift_end';
        v_title := 'Turno Finalizado';
        v_message := format('%s ha finalizado su turno', COALESCE(v_staff_name, 'Personal'));
    ELSIF NEW.status = 'no_show' THEN
        v_alert_type_enum := 'staff_no_show';
        v_title := 'Personal No Presentado';
        v_message := format('%s no se presentó a su turno programado', COALESCE(v_staff_name, 'Personal'));
    ELSE
        RETURN NEW;
    END IF;

    -- Check if alert is enabled
    SELECT is_enabled INTO v_enabled
    FROM public.alert_configurations
    WHERE business_id = NEW.business_id AND alert_type = v_alert_type_enum;

    -- Create alert if enabled
    IF v_enabled IS NULL OR v_enabled = true THEN
        INSERT INTO public.centralized_alerts (
            business_id,
            alert_type,
            priority,
            title,
            message,
            metadata,
            reference_id,
            reference_table,
            action_url
        ) VALUES (
            NEW.business_id,
            v_alert_type_enum,
            CASE WHEN v_alert_type_enum = 'staff_no_show' THEN 'high' ELSE 'low' END,
            v_title,
            v_message,
            jsonb_build_object(
                'shift_id', NEW.id,
                'staff_member_id', NEW.staff_member_id,
                'shift_date', NEW.shift_date,
                'start_time', NEW.start_time,
                'end_time', NEW.end_time
            ),
            NEW.id,
            'shift_schedules',
            '/staff-management'
        );
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_customer_milestone_alert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_enabled BOOLEAN;
    v_milestone_type TEXT;
    v_milestone_value INTEGER;
BEGIN
    -- Check if alert is enabled
    SELECT is_enabled INTO v_enabled
    FROM public.alert_configurations
    WHERE business_id = NEW.business_id AND alert_type = 'customer_milestone';

    IF v_enabled IS NULL OR v_enabled = true THEN
        -- Check for visit milestones
        IF NEW.total_visits IN (10, 25, 50, 100, 250, 500, 1000) AND NEW.total_visits > OLD.total_visits THEN
            INSERT INTO public.centralized_alerts (
                business_id,
                alert_type,
                priority,
                title,
                message,
                metadata,
                reference_id,
                reference_table,
                action_url
            ) VALUES (
                NEW.business_id,
                'customer_milestone',
                'medium',
                'Hito de Cliente Alcanzado',
                format('%s ha alcanzado %s visitas', NEW.full_name, NEW.total_visits),
                jsonb_build_object(
                    'customer_id', NEW.id,
                    'milestone_type', 'visits',
                    'milestone_value', NEW.total_visits,
                    'customer_name', NEW.full_name
                ),
                NEW.id,
                'customer_profiles',
                '/customer-management'
            );
        END IF;

        -- Check for points milestones
        IF NEW.loyalty_points IN (100, 500, 1000, 5000, 10000) AND NEW.loyalty_points > OLD.loyalty_points THEN
            INSERT INTO public.centralized_alerts (
                business_id,
                alert_type,
                priority,
                title,
                message,
                metadata,
                reference_id,
                reference_table,
                action_url
            ) VALUES (
                NEW.business_id,
                'customer_milestone',
                'medium',
                'Hito de Puntos Alcanzado',
                format('%s ha alcanzado %s puntos de lealtad', NEW.full_name, NEW.loyalty_points),
                jsonb_build_object(
                    'customer_id', NEW.id,
                    'milestone_type', 'points',
                    'milestone_value', NEW.loyalty_points,
                    'customer_name', NEW.full_name
                ),
                NEW.id,
                'customer_profiles',
                '/loyalty-points-system'
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- 10. TRIGGERS
CREATE TRIGGER update_alert_timestamp_trigger
    BEFORE UPDATE ON public.centralized_alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_alert_timestamp();

CREATE TRIGGER update_alert_config_timestamp_trigger
    BEFORE UPDATE ON public.alert_configurations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_alert_timestamp();

CREATE TRIGGER update_business_location_timestamp_trigger
    BEFORE UPDATE ON public.business_locations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_alert_timestamp();

CREATE TRIGGER create_high_value_sale_alert_trigger
    AFTER INSERT OR UPDATE ON public.pos_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.create_high_value_sale_alert();

CREATE TRIGGER create_low_stock_alert_trigger
    AFTER INSERT ON public.stock_alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.create_low_stock_alert();

CREATE TRIGGER create_shift_alert_trigger
    AFTER UPDATE ON public.shift_schedules
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION public.create_shift_alert();

CREATE TRIGGER create_customer_milestone_alert_trigger
    AFTER UPDATE ON public.customer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.create_customer_milestone_alert();

-- 11. RLS POLICIES
ALTER TABLE public.centralized_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_sales_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view alerts for their business"
    ON public.centralized_alerts FOR SELECT
    USING (business_id = auth.uid()::text);

CREATE POLICY "Users can update alerts for their business"
    ON public.centralized_alerts FOR UPDATE
    USING (business_id = auth.uid()::text);

CREATE POLICY "Users can view alert configurations for their business"
    ON public.alert_configurations FOR SELECT
    USING (business_id = auth.uid()::text);

CREATE POLICY "Users can manage alert configurations for their business"
    ON public.alert_configurations FOR ALL
    USING (business_id = auth.uid()::text);

CREATE POLICY "Users can view locations for their business"
    ON public.business_locations FOR SELECT
    USING (business_id = auth.uid()::text);

CREATE POLICY "Users can manage locations for their business"
    ON public.business_locations FOR ALL
    USING (business_id = auth.uid()::text);

CREATE POLICY "Users can view location inventory for their business"
    ON public.location_inventory FOR SELECT
    USING (business_id = auth.uid()::text);

CREATE POLICY "Users can manage location inventory for their business"
    ON public.location_inventory FOR ALL
    USING (business_id = auth.uid()::text);

CREATE POLICY "Users can view location staff assignments for their business"
    ON public.location_staff_assignments FOR SELECT
    USING (business_id = auth.uid()::text);

CREATE POLICY "Users can manage location staff assignments for their business"
    ON public.location_staff_assignments FOR ALL
    USING (business_id = auth.uid()::text);

CREATE POLICY "Users can view location sales summary for their business"
    ON public.location_sales_summary FOR SELECT
    USING (business_id = auth.uid()::text);

CREATE POLICY "System can insert location sales summary"
    ON public.location_sales_summary FOR INSERT
    WITH CHECK (true);

-- 12. INSERT DEFAULT ALERT CONFIGURATIONS
DO $$
BEGIN
    -- This will be populated when businesses are created
    -- Default configurations for common alert types
END $$;