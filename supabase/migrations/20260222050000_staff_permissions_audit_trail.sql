-- Location: supabase/migrations/20260222050000_staff_permissions_audit_trail.sql
-- Purpose: Create audit trail system for tracking all staff permission modifications
-- Dependencies: Requires staff_members, staff_permissions, user_profiles tables

-- Create permission_audits table to track all permission changes
CREATE TABLE IF NOT EXISTS public.permission_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_member_id UUID REFERENCES public.staff_members(id) ON DELETE CASCADE,
    staff_role TEXT NOT NULL,
    changed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    change_type TEXT NOT NULL CHECK (change_type IN ('role_config_update', 'individual_permission_update', 'role_assignment')),
    permission_field TEXT,
    old_value JSONB,
    new_value JSONB,
    approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_permission_audits_staff_member_id ON public.permission_audits(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_permission_audits_changed_by ON public.permission_audits(changed_by);
CREATE INDEX IF NOT EXISTS idx_permission_audits_staff_role ON public.permission_audits(staff_role);
CREATE INDEX IF NOT EXISTS idx_permission_audits_created_at ON public.permission_audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_permission_audits_approval_status ON public.permission_audits(approval_status);
CREATE INDEX IF NOT EXISTS idx_permission_audits_change_type ON public.permission_audits(change_type);

-- Enable RLS
ALTER TABLE public.permission_audits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for permission_audits
DROP POLICY IF EXISTS "users_can_view_permission_audits" ON public.permission_audits;
CREATE POLICY "users_can_view_permission_audits"
ON public.permission_audits
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "users_can_create_permission_audits" ON public.permission_audits;
CREATE POLICY "users_can_create_permission_audits"
ON public.permission_audits
FOR INSERT
TO authenticated
WITH CHECK (changed_by = auth.uid());

DROP POLICY IF EXISTS "users_can_update_permission_audits" ON public.permission_audits;
CREATE POLICY "users_can_update_permission_audits"
ON public.permission_audits
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create function to automatically log permission changes
CREATE OR REPLACE FUNCTION public.log_permission_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    changed_fields TEXT[] := ARRAY[]::TEXT[];
    field_name TEXT;
    current_user_id UUID;
BEGIN
    -- Get current authenticated user
    current_user_id := auth.uid();
    
    -- Only log if there are actual changes
    IF TG_OP = 'UPDATE' THEN
        -- Check each permission field for changes
        IF OLD.can_manage_staff IS DISTINCT FROM NEW.can_manage_staff THEN
            INSERT INTO public.permission_audits (
                staff_role,
                changed_by,
                change_type,
                permission_field,
                old_value,
                new_value,
                approval_status
            ) VALUES (
                NEW.staff_role,
                current_user_id,
                'role_config_update',
                'can_manage_staff',
                to_jsonb(OLD.can_manage_staff),
                to_jsonb(NEW.can_manage_staff),
                'approved'
            );
        END IF;
        
        IF OLD.can_view_reports IS DISTINCT FROM NEW.can_view_reports THEN
            INSERT INTO public.permission_audits (
                staff_role,
                changed_by,
                change_type,
                permission_field,
                old_value,
                new_value,
                approval_status
            ) VALUES (
                NEW.staff_role,
                current_user_id,
                'role_config_update',
                'can_view_reports',
                to_jsonb(OLD.can_view_reports),
                to_jsonb(NEW.can_view_reports),
                'approved'
            );
        END IF;
        
        IF OLD.can_manage_inventory IS DISTINCT FROM NEW.can_manage_inventory THEN
            INSERT INTO public.permission_audits (
                staff_role,
                changed_by,
                change_type,
                permission_field,
                old_value,
                new_value,
                approval_status
            ) VALUES (
                NEW.staff_role,
                current_user_id,
                'role_config_update',
                'can_manage_inventory',
                to_jsonb(OLD.can_manage_inventory),
                to_jsonb(NEW.can_manage_inventory),
                'approved'
            );
        END IF;
        
        IF OLD.can_process_sales IS DISTINCT FROM NEW.can_process_sales THEN
            INSERT INTO public.permission_audits (
                staff_role,
                changed_by,
                change_type,
                permission_field,
                old_value,
                new_value,
                approval_status
            ) VALUES (
                NEW.staff_role,
                current_user_id,
                'role_config_update',
                'can_process_sales',
                to_jsonb(OLD.can_process_sales),
                to_jsonb(NEW.can_process_sales),
                'approved'
            );
        END IF;
        
        IF OLD.can_process_refunds IS DISTINCT FROM NEW.can_process_refunds THEN
            INSERT INTO public.permission_audits (
                staff_role,
                changed_by,
                change_type,
                permission_field,
                old_value,
                new_value,
                approval_status
            ) VALUES (
                NEW.staff_role,
                current_user_id,
                'role_config_update',
                'can_process_refunds',
                to_jsonb(OLD.can_process_refunds),
                to_jsonb(NEW.can_process_refunds),
                'approved'
            );
        END IF;
        
        IF OLD.can_manage_promotions IS DISTINCT FROM NEW.can_manage_promotions THEN
            INSERT INTO public.permission_audits (
                staff_role,
                changed_by,
                change_type,
                permission_field,
                old_value,
                new_value,
                approval_status
            ) VALUES (
                NEW.staff_role,
                current_user_id,
                'role_config_update',
                'can_manage_promotions',
                to_jsonb(OLD.can_manage_promotions),
                to_jsonb(NEW.can_manage_promotions),
                'approved'
            );
        END IF;
        
        IF OLD.can_manage_catalog IS DISTINCT FROM NEW.can_manage_catalog THEN
            INSERT INTO public.permission_audits (
                staff_role,
                changed_by,
                change_type,
                permission_field,
                old_value,
                new_value,
                approval_status
            ) VALUES (
                NEW.staff_role,
                current_user_id,
                'role_config_update',
                'can_manage_catalog',
                to_jsonb(OLD.can_manage_catalog),
                to_jsonb(NEW.can_manage_catalog),
                'approved'
            );
        END IF;
        
        IF OLD.can_open_close_register IS DISTINCT FROM NEW.can_open_close_register THEN
            INSERT INTO public.permission_audits (
                staff_role,
                changed_by,
                change_type,
                permission_field,
                old_value,
                new_value,
                approval_status
            ) VALUES (
                NEW.staff_role,
                current_user_id,
                'role_config_update',
                'can_open_close_register',
                to_jsonb(OLD.can_open_close_register),
                to_jsonb(NEW.can_open_close_register),
                'approved'
            );
        END IF;
        
        IF OLD.can_adjust_prices IS DISTINCT FROM NEW.can_adjust_prices THEN
            INSERT INTO public.permission_audits (
                staff_role,
                changed_by,
                change_type,
                permission_field,
                old_value,
                new_value,
                approval_status
            ) VALUES (
                NEW.staff_role,
                current_user_id,
                'role_config_update',
                'can_adjust_prices',
                to_jsonb(OLD.can_adjust_prices),
                to_jsonb(NEW.can_adjust_prices),
                'approved'
            );
        END IF;
        
        IF OLD.can_delete_transactions IS DISTINCT FROM NEW.can_delete_transactions THEN
            INSERT INTO public.permission_audits (
                staff_role,
                changed_by,
                change_type,
                permission_field,
                old_value,
                new_value,
                approval_status
            ) VALUES (
                NEW.staff_role,
                current_user_id,
                'role_config_update',
                'can_delete_transactions',
                to_jsonb(OLD.can_delete_transactions),
                to_jsonb(NEW.can_delete_transactions),
                'approved'
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger on staff_permissions table
DROP TRIGGER IF EXISTS log_staff_permission_changes ON public.staff_permissions;
CREATE TRIGGER log_staff_permission_changes
AFTER UPDATE ON public.staff_permissions
FOR EACH ROW
EXECUTE FUNCTION public.log_permission_change();

-- Create mock audit data
DO $$
DECLARE
    existing_user_id UUID;
    admin_role_id UUID;
BEGIN
    -- Get existing user
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user_profiles'
    ) THEN
        SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
        
        IF existing_user_id IS NOT NULL THEN
            -- Get admin role permissions id
            SELECT id INTO admin_role_id FROM public.staff_permissions WHERE staff_role = 'admin' LIMIT 1;
            
            -- Create sample audit records
            INSERT INTO public.permission_audits (
                id,
                staff_role,
                changed_by,
                change_type,
                permission_field,
                old_value,
                new_value,
                approval_status,
                approved_by,
                approved_at,
                notes,
                created_at
            ) VALUES
                (
                    gen_random_uuid(),
                    'admin',
                    existing_user_id,
                    'role_config_update',
                    'can_manage_inventory',
                    'false'::jsonb,
                    'true'::jsonb,
                    'approved',
                    existing_user_id,
                    NOW() - INTERVAL '2 days',
                    'Granted inventory management access to admin role',
                    NOW() - INTERVAL '2 days'
                ),
                (
                    gen_random_uuid(),
                    'manager',
                    existing_user_id,
                    'role_config_update',
                    'can_adjust_prices',
                    'false'::jsonb,
                    'true'::jsonb,
                    'approved',
                    existing_user_id,
                    NOW() - INTERVAL '1 day',
                    'Enabled price adjustment for managers',
                    NOW() - INTERVAL '1 day'
                ),
                (
                    gen_random_uuid(),
                    'cashier',
                    existing_user_id,
                    'role_config_update',
                    'can_process_refunds',
                    'false'::jsonb,
                    'true'::jsonb,
                    'approved',
                    existing_user_id,
                    NOW() - INTERVAL '5 hours',
                    'Allowed cashiers to process refunds',
                    NOW() - INTERVAL '5 hours'
                ),
                (
                    gen_random_uuid(),
                    'admin',
                    existing_user_id,
                    'role_config_update',
                    'can_delete_transactions',
                    'false'::jsonb,
                    'true'::jsonb,
                    'pending',
                    NULL,
                    NULL,
                    'Pending approval for transaction deletion permission',
                    NOW() - INTERVAL '2 hours'
                )
            ON CONFLICT (id) DO NOTHING;
        ELSE
            RAISE NOTICE 'No existing users found. Run auth migration first.';
        END IF;
    ELSE
        RAISE NOTICE 'Table user_profiles does not exist. Run auth migration first.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock audit data insertion failed: %', SQLERRM;
END $$;