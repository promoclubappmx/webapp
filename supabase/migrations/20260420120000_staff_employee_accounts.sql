-- ============================================================
-- Staff Employee Accounts Migration
-- Adds account_type distinction (owner vs employee),
-- invitation_token for email confirmation flow (stand-by),
-- and permission loading for employee logins.
-- ============================================================

-- 1. Add account_type to user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'owner'
    CHECK (account_type IN ('owner', 'employee'));

-- 2. Add employee-specific columns to user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS staff_member_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS employer_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL;

-- 3. Add invitation_token and confirmation fields to staff_members
ALTER TABLE public.staff_members
  ADD COLUMN IF NOT EXISTS invitation_token TEXT,
  ADD COLUMN IF NOT EXISTS invitation_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS invitation_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS auth_user_id UUID;

-- 4. Index for invitation_token lookup
CREATE INDEX IF NOT EXISTS idx_staff_members_invitation_token
  ON public.staff_members(invitation_token);

CREATE INDEX IF NOT EXISTS idx_staff_members_auth_user_id
  ON public.staff_members(auth_user_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_staff_member_id
  ON public.user_profiles(staff_member_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_employer_id
  ON public.user_profiles(employer_id);

-- 5. Function: get_employee_permissions
-- Returns all module permissions for an authenticated employee user
CREATE OR REPLACE FUNCTION public.get_employee_permissions(p_user_id UUID)
RETURNS TABLE(
  module_name TEXT,
  can_view BOOLEAN,
  can_create BOOLEAN,
  can_edit BOOLEAN,
  can_delete BOOLEAN,
  staff_role TEXT,
  staff_member_id UUID,
  employer_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_staff_member_id UUID;
  v_employer_id UUID;
  v_staff_role TEXT;
BEGIN
  -- Get employee profile info
  SELECT up.staff_member_id, up.employer_id
  INTO v_staff_member_id, v_employer_id
  FROM public.user_profiles up
  WHERE up.id = p_user_id AND up.account_type = 'employee';

  IF v_staff_member_id IS NULL THEN
    RETURN; -- Not an employee account
  END IF;

  -- Get staff role
  SELECT sm.staff_role::TEXT INTO v_staff_role
  FROM public.staff_members sm
  WHERE sm.id = v_staff_member_id;

  IF v_staff_role IS NOT NULL THEN
    -- Return permissions from role_module_permissions using role_key
    RETURN QUERY
    SELECT
      rmp.module_key::TEXT,
      COALESCE(rmp.can_view, false),
      COALESCE(rmp.can_create, false),
      COALESCE(rmp.can_edit, false),
      COALESCE(rmp.can_delete, false),
      v_staff_role,
      v_staff_member_id,
      v_employer_id
    FROM public.role_module_permissions rmp
    WHERE rmp.owner_id = v_employer_id
      AND rmp.role_key = v_staff_role;
  ELSE
    -- Fallback: return empty permissions (no role configured)
    RETURN;
  END IF;
END;
$$;

-- 6. Function: confirm_staff_invitation
-- Called when employee clicks confirmation link (stand-by for email implementation)
-- Sets status to 'confirmed' and records confirmation time
CREATE OR REPLACE FUNCTION public.confirm_staff_invitation(p_invitation_token TEXT)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  staff_id UUID,
  email TEXT,
  staff_role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_staff RECORD;
BEGIN
  -- Find staff member by token
  SELECT sm.id, sm.email, sm.staff_role::TEXT AS staff_role, sm.invitation_expires_at, sm.status
  INTO v_staff
  FROM public.staff_members sm
  WHERE sm.invitation_token = p_invitation_token
  LIMIT 1;

  IF v_staff.id IS NULL THEN
    RETURN QUERY SELECT false, 'Token de invitación no válido'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  IF v_staff.status = 'active' THEN
    RETURN QUERY SELECT true, 'Cuenta ya confirmada'::TEXT, v_staff.id, v_staff.email, v_staff.staff_role::TEXT;
    RETURN;
  END IF;

  IF v_staff.invitation_expires_at IS NOT NULL AND v_staff.invitation_expires_at < NOW() THEN
    RETURN QUERY SELECT false, 'El enlace de invitación ha expirado'::TEXT, v_staff.id, v_staff.email, v_staff.staff_role::TEXT;
    RETURN;
  END IF;

  -- Update staff member status to confirmed
  UPDATE public.staff_members
  SET
    status = 'active',
    email_confirmed = true,
    confirmed_at = NOW(),
    invitation_token = NULL,
    updated_at = NOW()
  WHERE id = v_staff.id;

  RETURN QUERY SELECT true, 'Invitación confirmada exitosamente'::TEXT, v_staff.id, v_staff.email, v_staff.staff_role::TEXT;
END;
$$;

-- 7. Function: generate_staff_invitation_token
-- Generates a secure invitation token for a staff member (ready for email implementation)
CREATE OR REPLACE FUNCTION public.generate_staff_invitation_token(p_staff_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token TEXT;
BEGIN
  -- Generate a secure random token
  v_token := encode(gen_random_bytes(32), 'hex');

  UPDATE public.staff_members
  SET
    invitation_token = v_token,
    invitation_sent_at = NOW(),
    invitation_expires_at = NOW() + INTERVAL '7 days',
    status = 'pending',
    email_confirmed = false,
    updated_at = NOW()
  WHERE id = p_staff_id;

  RETURN v_token;
END;
$$;

-- 8. Update handle_new_user trigger to support account_type from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_account_type TEXT;
  v_staff_member_id UUID;
  v_employer_id UUID;
BEGIN
  v_account_type := COALESCE(NEW.raw_user_meta_data->>'account_type', 'owner');
  v_staff_member_id := CASE
    WHEN NEW.raw_user_meta_data->>'staff_member_id' IS NOT NULL
    THEN (NEW.raw_user_meta_data->>'staff_member_id')::UUID
    ELSE NULL
  END;
  v_employer_id := CASE
    WHEN NEW.raw_user_meta_data->>'employer_id' IS NOT NULL
    THEN (NEW.raw_user_meta_data->>'employer_id')::UUID
    ELSE NULL
  END;

  INSERT INTO public.user_profiles (
    id,
    email,
    full_name,
    role,
    account_type,
    staff_member_id,
    employer_id
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'owner'),
    v_account_type,
    v_staff_member_id,
    v_employer_id
  )
  ON CONFLICT (id) DO UPDATE SET
    account_type = EXCLUDED.account_type,
    staff_member_id = COALESCE(EXCLUDED.staff_member_id, public.user_profiles.staff_member_id),
    employer_id = COALESCE(EXCLUDED.employer_id, public.user_profiles.employer_id),
    updated_at = NOW();

  -- If employee account, link auth_user_id back to staff_members
  IF v_staff_member_id IS NOT NULL THEN
    UPDATE public.staff_members
    SET auth_user_id = NEW.id,
        updated_at = NOW()
    WHERE id = v_staff_member_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. RLS: employees can read their own permissions
DROP POLICY IF EXISTS "employees_read_own_permissions" ON public.role_module_permissions;
CREATE POLICY "employees_read_own_permissions"
  ON public.role_module_permissions
  FOR SELECT
  TO authenticated
  USING (
    (
      role_key IN (
        SELECT sm.staff_role::TEXT FROM public.staff_members sm
        INNER JOIN public.user_profiles up ON up.staff_member_id = sm.id
        WHERE up.id = auth.uid() AND up.account_type = 'employee'
        LIMIT 1
      )
      AND
      owner_id = (
        SELECT up.employer_id FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.account_type = 'employee'
        LIMIT 1
      )
    )
    OR
    owner_id = auth.uid()
  );
