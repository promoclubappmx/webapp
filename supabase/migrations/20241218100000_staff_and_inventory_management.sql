-- Staff Management and Inventory Management Migration
-- Purpose: Staff roles, permissions matrix, activity logs, shift scheduling, and inventory tracking

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

CREATE TABLE IF NOT EXISTS public.catalog_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    business_type TEXT,
    category_id UUID,
    price DECIMAL(10,2),
    cost DECIMAL(10,2),
    sku TEXT,
    barcode TEXT,
    image_url TEXT,
    image_path TEXT,
    status TEXT DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT false,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    weight DECIMAL(8,2),
    dimensions JSONB,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Types for Staff Management
DROP TYPE IF EXISTS public.staff_role_type CASCADE;
CREATE TYPE public.staff_role_type AS ENUM ('admin', 'manager', 'cashier', 'clerk');

DROP TYPE IF EXISTS public.activity_type CASCADE;
CREATE TYPE public.activity_type AS ENUM ('login', 'logout', 'sale', 'refund', 'inventory_adjustment', 'permission_change', 'other');

DROP TYPE IF EXISTS public.shift_status CASCADE;
CREATE TYPE public.shift_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

DROP TYPE IF EXISTS public.adjustment_type CASCADE;
CREATE TYPE public.adjustment_type AS ENUM ('increase', 'decrease', 'correction', 'damage', 'theft', 'return');

-- 3. Staff Members Table
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

-- 4. Staff Permissions Table (Permission Matrix)
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

-- 5. Staff Activity Logs Table
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

-- 6. Shift Schedules Table
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

-- 7. Inventory Adjustments Table
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

-- 8. Stock Alerts Table
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

-- 9. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_staff_members_business_id ON public.staff_members(business_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_user_profile_id ON public.staff_members(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_staff_role ON public.staff_members(staff_role);
CREATE INDEX IF NOT EXISTS idx_staff_members_is_active ON public.staff_members(is_active);
CREATE INDEX IF NOT EXISTS idx_staff_members_employee_id ON public.staff_members(employee_id);

CREATE INDEX IF NOT EXISTS idx_staff_activity_logs_staff_member_id ON public.staff_activity_logs(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_staff_activity_logs_business_id ON public.staff_activity_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_staff_activity_logs_activity_type ON public.staff_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_staff_activity_logs_created_at ON public.staff_activity_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_shift_schedules_staff_member_id ON public.shift_schedules(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_shift_schedules_business_id ON public.shift_schedules(business_id);
CREATE INDEX IF NOT EXISTS idx_shift_schedules_shift_date ON public.shift_schedules(shift_date);
CREATE INDEX IF NOT EXISTS idx_shift_schedules_status ON public.shift_schedules(status);

CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_catalog_item_id ON public.inventory_adjustments(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_business_id ON public.inventory_adjustments(business_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_adjustment_type ON public.inventory_adjustments(adjustment_type);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_created_at ON public.inventory_adjustments(created_at);

CREATE INDEX IF NOT EXISTS idx_stock_alerts_catalog_item_id ON public.stock_alerts(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_business_id ON public.stock_alerts(business_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_is_resolved ON public.stock_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_created_at ON public.stock_alerts(created_at);

-- 10. Functions
CREATE OR REPLACE FUNCTION public.update_staff_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_inventory_adjustment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_previous_quantity INTEGER;
    v_business_id TEXT;
BEGIN
    -- Get previous quantity and business_id
    SELECT stock_quantity, user_id INTO v_previous_quantity, v_business_id
    FROM public.catalog_items
    WHERE id = NEW.id;
    
    -- Only log if quantity changed
    IF OLD.stock_quantity != NEW.stock_quantity THEN
        INSERT INTO public.inventory_adjustments (
            catalog_item_id,
            business_id,
            adjustment_type,
            quantity_change,
            previous_quantity,
            new_quantity,
            reason,
            adjusted_by
        ) VALUES (
            NEW.id,
            v_business_id,
            CASE 
                WHEN NEW.stock_quantity > OLD.stock_quantity THEN 'increase'::public.adjustment_type
                ELSE 'decrease'::public.adjustment_type
            END,
            NEW.stock_quantity - OLD.stock_quantity,
            OLD.stock_quantity,
            NEW.stock_quantity,
            'Manual adjustment',
            auth.uid()
        );
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_low_stock_alert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_business_id TEXT;
BEGIN
    -- Get business_id
    SELECT user_id INTO v_business_id
    FROM public.catalog_items
    WHERE id = NEW.id;
    
    -- Check if stock is below minimum level
    IF NEW.stock_quantity < NEW.min_stock_level AND NEW.min_stock_level > 0 THEN
        -- Check if alert already exists and is not resolved
        IF NOT EXISTS (
            SELECT 1 FROM public.stock_alerts
            WHERE catalog_item_id = NEW.id
            AND is_resolved = false
            AND alert_type = 'low_stock'
        ) THEN
            INSERT INTO public.stock_alerts (
                catalog_item_id,
                business_id,
                alert_type,
                current_quantity,
                threshold_quantity
            ) VALUES (
                NEW.id,
                v_business_id,
                'low_stock',
                NEW.stock_quantity,
                NEW.min_stock_level
            );
        END IF;
    ELSE
        -- Resolve existing alerts if stock is back above minimum
        UPDATE public.stock_alerts
        SET is_resolved = true,
            resolved_at = CURRENT_TIMESTAMP,
            resolved_by = auth.uid()
        WHERE catalog_item_id = NEW.id
        AND is_resolved = false
        AND alert_type = 'low_stock';
    END IF;
    
    RETURN NEW;
END;
$$;

-- 11. Triggers
CREATE TRIGGER update_staff_members_timestamp
BEFORE UPDATE ON public.staff_members
FOR EACH ROW
EXECUTE FUNCTION public.update_staff_timestamp();

CREATE TRIGGER update_staff_permissions_timestamp
BEFORE UPDATE ON public.staff_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_staff_timestamp();

CREATE TRIGGER update_shift_schedules_timestamp
BEFORE UPDATE ON public.shift_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_staff_timestamp();

CREATE TRIGGER log_inventory_adjustment_trigger
AFTER UPDATE ON public.catalog_items
FOR EACH ROW
WHEN (OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity)
EXECUTE FUNCTION public.log_inventory_adjustment();

CREATE TRIGGER check_low_stock_alert_trigger
AFTER INSERT OR UPDATE ON public.catalog_items
FOR EACH ROW
EXECUTE FUNCTION public.check_low_stock_alert();

-- 12. Enable RLS
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;

-- 13. RLS Policies
-- Staff Members: Only business owners/admins can manage
CREATE POLICY "owners_manage_staff_members"
ON public.staff_members
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('owner', 'admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('owner', 'admin')
    )
);

-- Staff can view their own record
CREATE POLICY "staff_view_own_record"
ON public.staff_members
FOR SELECT
TO authenticated
USING (user_profile_id = auth.uid());

-- Staff Permissions: Read-only for all authenticated users
CREATE POLICY "authenticated_read_staff_permissions"
ON public.staff_permissions
FOR SELECT
TO authenticated
USING (true);

-- Only owners can modify permissions
CREATE POLICY "owners_manage_staff_permissions"
ON public.staff_permissions
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND role = 'owner'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND role = 'owner'
    )
);

-- Activity Logs: Owners and admins can view all, staff can view their own
CREATE POLICY "owners_view_all_activity_logs"
ON public.staff_activity_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('owner', 'admin')
    )
);

CREATE POLICY "staff_view_own_activity_logs"
ON public.staff_activity_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.staff_members
        WHERE id = staff_member_id
        AND user_profile_id = auth.uid()
    )
);

CREATE POLICY "authenticated_insert_activity_logs"
ON public.staff_activity_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Shift Schedules: Owners/managers manage, staff can view their own
CREATE POLICY "owners_managers_manage_shifts"
ON public.shift_schedules
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('owner', 'admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('owner', 'admin')
    )
);

CREATE POLICY "staff_view_own_shifts"
ON public.shift_schedules
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.staff_members
        WHERE id = staff_member_id
        AND user_profile_id = auth.uid()
    )
);

-- Inventory Adjustments: Owners and authorized staff can manage
CREATE POLICY "authorized_manage_inventory_adjustments"
ON public.inventory_adjustments
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('owner', 'admin', 'staff')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('owner', 'admin', 'staff')
    )
);

-- Stock Alerts: Owners and authorized staff can view and manage
CREATE POLICY "authorized_manage_stock_alerts"
ON public.stock_alerts
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('owner', 'admin', 'staff')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('owner', 'admin', 'staff')
    )
);

-- 14. Insert default permissions for each role
DO $$
BEGIN
    -- Admin: Full permissions except staff management
    INSERT INTO public.staff_permissions (
        staff_role,
        can_manage_staff,
        can_view_reports,
        can_manage_inventory,
        can_process_sales,
        can_process_refunds,
        can_manage_promotions,
        can_manage_catalog,
        can_open_close_register,
        can_adjust_prices,
        can_delete_transactions
    ) VALUES (
        'admin'::public.staff_role_type,
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false
    ) ON CONFLICT (staff_role) DO NOTHING;

    -- Manager: Most permissions except critical ones
    INSERT INTO public.staff_permissions (
        staff_role,
        can_manage_staff,
        can_view_reports,
        can_manage_inventory,
        can_process_sales,
        can_process_refunds,
        can_manage_promotions,
        can_manage_catalog,
        can_open_close_register,
        can_adjust_prices,
        can_delete_transactions
    ) VALUES (
        'manager'::public.staff_role_type,
        false,
        true,
        true,
        true,
        true,
        false,
        false,
        true,
        false,
        false
    ) ON CONFLICT (staff_role) DO NOTHING;

    -- Cashier: Sales and register operations
    INSERT INTO public.staff_permissions (
        staff_role,
        can_manage_staff,
        can_view_reports,
        can_manage_inventory,
        can_process_sales,
        can_process_refunds,
        can_manage_promotions,
        can_manage_catalog,
        can_open_close_register,
        can_adjust_prices,
        can_delete_transactions
    ) VALUES (
        'cashier'::public.staff_role_type,
        false,
        false,
        false,
        true,
        true,
        false,
        false,
        true,
        false,
        false
    ) ON CONFLICT (staff_role) DO NOTHING;

    -- Clerk: Basic sales only
    INSERT INTO public.staff_permissions (
        staff_role,
        can_manage_staff,
        can_view_reports,
        can_manage_inventory,
        can_process_sales,
        can_process_refunds,
        can_manage_promotions,
        can_manage_catalog,
        can_open_close_register,
        can_adjust_prices,
        can_delete_transactions
    ) VALUES (
        'clerk'::public.staff_role_type,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        false,
        false,
        false
    ) ON CONFLICT (staff_role) DO NOTHING;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting default permissions: %', SQLERRM;
END;
$$;