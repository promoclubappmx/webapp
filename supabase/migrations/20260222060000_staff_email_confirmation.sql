-- Staff Email Confirmation Migration
-- Purpose: Add email confirmation tracking for staff members with pending/active status flow

-- 1. Add email confirmation columns to staff_members table
ALTER TABLE public.staff_members
ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS invitation_token TEXT,
ADD COLUMN IF NOT EXISTS invitation_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS invitation_expires_at TIMESTAMPTZ;

-- 2. Create staff_status enum type
DROP TYPE IF EXISTS public.staff_status CASCADE;
CREATE TYPE public.staff_status AS ENUM ('pending', 'active', 'inactive');

-- 3. Add status column to staff_members
ALTER TABLE public.staff_members
ADD COLUMN IF NOT EXISTS status public.staff_status DEFAULT 'pending'::public.staff_status;

-- 4. Update existing records to 'active' status if they are currently active
DO $$
BEGIN
    UPDATE public.staff_members
    SET status = 'active'::public.staff_status
    WHERE is_active = true AND status IS NULL;
    
    UPDATE public.staff_members
    SET status = 'inactive'::public.staff_status
    WHERE is_active = false AND status IS NULL;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Status update failed: %', SQLERRM;
END $$;

-- 5. Create index for email confirmation lookups
CREATE INDEX IF NOT EXISTS idx_staff_members_invitation_token ON public.staff_members(invitation_token);
CREATE INDEX IF NOT EXISTS idx_staff_members_status ON public.staff_members(status);
CREATE INDEX IF NOT EXISTS idx_staff_members_email_confirmed ON public.staff_members(email_confirmed);

-- 6. Function to generate invitation token
CREATE OR REPLACE FUNCTION public.generate_staff_invitation_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    token TEXT;
BEGIN
    -- Generate a random token (32 characters)
    token := encode(gen_random_bytes(24), 'base64');
    token := replace(token, '/', '_');
    token := replace(token, '+', '-');
    RETURN token;
END;
$$;

-- 7. Function to confirm staff email
CREATE OR REPLACE FUNCTION public.confirm_staff_email(p_invitation_token TEXT)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    staff_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_staff_id UUID;
    v_expires_at TIMESTAMPTZ;
BEGIN
    -- Find staff member by invitation token
    SELECT id, invitation_expires_at INTO v_staff_id, v_expires_at
    FROM public.staff_members
    WHERE invitation_token = p_invitation_token
    AND email_confirmed = false
    LIMIT 1;
    
    -- Check if token exists
    IF v_staff_id IS NULL THEN
        RETURN QUERY SELECT false, 'Invalid or already used invitation token'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- Check if token expired
    IF v_expires_at < CURRENT_TIMESTAMP THEN
        RETURN QUERY SELECT false, 'Invitation token has expired'::TEXT, v_staff_id;
        RETURN;
    END IF;
    
    -- Update staff member status
    UPDATE public.staff_members
    SET 
        email_confirmed = true,
        email_confirmed_at = CURRENT_TIMESTAMP,
        status = 'active'::public.staff_status,
        is_active = true,
        invitation_token = NULL
    WHERE id = v_staff_id;
    
    RETURN QUERY SELECT true, 'Email confirmed successfully'::TEXT, v_staff_id;
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT false, SQLERRM::TEXT, NULL::UUID;
END;
$$;

-- 8. Function to resend invitation
CREATE OR REPLACE FUNCTION public.resend_staff_invitation(p_staff_id UUID)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    invitation_token TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_token TEXT;
    v_email TEXT;
BEGIN
    -- Check if staff member exists and is pending
    SELECT email INTO v_email
    FROM public.staff_members
    WHERE id = p_staff_id
    AND email_confirmed = false
    LIMIT 1;
    
    IF v_email IS NULL THEN
        RETURN QUERY SELECT false, 'Staff member not found or already confirmed'::TEXT, NULL::TEXT;
        RETURN;
    END IF;
    
    -- Generate new token
    v_token := public.generate_staff_invitation_token();
    
    -- Update staff member with new token
    UPDATE public.staff_members
    SET 
        invitation_token = v_token,
        invitation_sent_at = CURRENT_TIMESTAMP,
        invitation_expires_at = CURRENT_TIMESTAMP + INTERVAL '7 days'
    WHERE id = p_staff_id;
    
    RETURN QUERY SELECT true, 'Invitation resent successfully'::TEXT, v_token;
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT false, SQLERRM::TEXT, NULL::TEXT;
END;
$$;

-- 9. Trigger to set invitation token on staff creation
CREATE OR REPLACE FUNCTION public.set_staff_invitation_token()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only set token if email is not confirmed and token is not set
    IF NEW.email_confirmed = false AND NEW.invitation_token IS NULL THEN
        NEW.invitation_token := public.generate_staff_invitation_token();
        NEW.invitation_sent_at := CURRENT_TIMESTAMP;
        NEW.invitation_expires_at := CURRENT_TIMESTAMP + INTERVAL '7 days';
        NEW.status := 'pending'::public.staff_status;
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_staff_invitation_token ON public.staff_members;
CREATE TRIGGER trigger_set_staff_invitation_token
    BEFORE INSERT ON public.staff_members
    FOR EACH ROW
    EXECUTE FUNCTION public.set_staff_invitation_token();

-- 10. RLS Policies for staff email confirmation
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

-- Allow public access to confirm email (by token)
DROP POLICY IF EXISTS "public_can_confirm_staff_email" ON public.staff_members;
CREATE POLICY "public_can_confirm_staff_email"
ON public.staff_members
FOR SELECT
TO public
USING (invitation_token IS NOT NULL AND email_confirmed = false);

-- 11. Mock data for testing (optional)
DO $$
DECLARE
    existing_user_id UUID;
    test_staff_id UUID;
BEGIN
    -- Get an existing user to create test staff
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Create a test pending staff member
        INSERT INTO public.staff_members (
            id,
            business_id,
            staff_role,
            full_name,
            email,
            phone,
            employee_id,
            hire_date,
            is_active,
            email_confirmed,
            status,
            created_by
        ) VALUES (
            gen_random_uuid(),
            'test_business_001',
            'cashier'::public.staff_role_type,
            'Test Pending Staff',
            'pending.staff@example.com',
            '+34 600 000 000',
            'EMP999',
            CURRENT_DATE,
            false,
            false,
            'pending'::public.staff_status,
            existing_user_id
        )
        ON CONFLICT (email) DO NOTHING;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data creation failed: %', SQLERRM;
END $$;