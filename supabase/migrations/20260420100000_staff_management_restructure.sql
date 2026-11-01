-- Staff Management Restructure Migration
-- Adds: departments, custom_roles, role_module_permissions, staff photo, CURP, name fields

-- 1. Add new columns to staff_members
ALTER TABLE public.staff_members
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS paternal_surname TEXT,
  ADD COLUMN IF NOT EXISTS maternal_surname TEXT,
  ADD COLUMN IF NOT EXISTS curp TEXT,
  ADD COLUMN IF NOT EXISTS department_id UUID,
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS location_id UUID,
  ADD COLUMN IF NOT EXISTS owner_id UUID;

-- 2. Departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  manager_id UUID,
  color TEXT DEFAULT '#6366f1',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Custom roles table
CREATE TABLE IF NOT EXISTS public.custom_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  role_key TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Unique constraint on role_key per owner
CREATE UNIQUE INDEX IF NOT EXISTS idx_custom_roles_owner_key ON public.custom_roles(owner_id, role_key);

-- 4. Role module permissions table (replaces flat staff_permissions)
CREATE TABLE IF NOT EXISTS public.role_module_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  role_key TEXT NOT NULL,
  module_key TEXT NOT NULL,
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_role_module_perms_unique ON public.role_module_permissions(owner_id, role_key, module_key);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_departments_owner_id ON public.departments(owner_id);
CREATE INDEX IF NOT EXISTS idx_custom_roles_owner_id ON public.custom_roles(owner_id);
CREATE INDEX IF NOT EXISTS idx_role_module_perms_owner ON public.role_module_permissions(owner_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_owner_id ON public.staff_members(owner_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_location_id ON public.staff_members(location_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_department_id ON public.staff_members(department_id);

-- 6. Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_module_permissions ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for departments
DROP POLICY IF EXISTS "users_manage_own_departments" ON public.departments;
CREATE POLICY "users_manage_own_departments"
ON public.departments FOR ALL TO authenticated
USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- 8. RLS Policies for custom_roles
DROP POLICY IF EXISTS "users_manage_own_custom_roles" ON public.custom_roles;
CREATE POLICY "users_manage_own_custom_roles"
ON public.custom_roles FOR ALL TO authenticated
USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- 9. RLS Policies for role_module_permissions
DROP POLICY IF EXISTS "users_manage_own_role_module_permissions" ON public.role_module_permissions;
CREATE POLICY "users_manage_own_role_module_permissions"
ON public.role_module_permissions FOR ALL TO authenticated
USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- 10. Update staff_members RLS to include owner_id filter
DROP POLICY IF EXISTS "users_manage_own_staff_members" ON public.staff_members;
CREATE POLICY "users_manage_own_staff_members"
ON public.staff_members FOR ALL TO authenticated
USING (owner_id = auth.uid() OR created_by = auth.uid())
WITH CHECK (owner_id = auth.uid() OR created_by = auth.uid());

-- 11. Seed default roles for existing users (idempotent)
DO $$
DECLARE
  existing_user_id UUID;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_profiles'
  ) THEN
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    IF existing_user_id IS NOT NULL THEN
      INSERT INTO public.custom_roles (owner_id, name, description, role_key, is_default)
      VALUES
        (existing_user_id, 'Administrador', 'Acceso completo al sistema', 'admin', true),
        (existing_user_id, 'Gerente', 'Gestion operativa y supervision', 'manager', true),
        (existing_user_id, 'Cajero', 'Operaciones de caja y ventas', 'cashier', true)
      ON CONFLICT (owner_id, role_key) DO NOTHING;
    END IF;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Seed roles failed: %', SQLERRM;
END $$;
