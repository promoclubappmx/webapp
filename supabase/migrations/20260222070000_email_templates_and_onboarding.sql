-- Email Templates and Onboarding Migration
-- Purpose: Add email template editor and onboarding tracking for staff members

-- 1. Create email_templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    template_type TEXT NOT NULL CHECK (template_type IN ('staff_invitation', 'email_confirmation', 'role_assignment', 'welcome')),
    template_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(business_id, template_type, is_default)
);

-- 2. Create staff_onboarding table
CREATE TABLE IF NOT EXISTS public.staff_onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_completed_at TIMESTAMPTZ,
    onboarding_steps_completed JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(staff_id)
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_email_templates_business_id ON public.email_templates(business_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON public.email_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON public.email_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_staff_onboarding_staff_id ON public.staff_onboarding(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_onboarding_completed ON public.staff_onboarding(onboarding_completed);

-- 4. Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_email_template_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_email_template_updated_at ON public.email_templates;
CREATE TRIGGER trigger_update_email_template_updated_at
    BEFORE UPDATE ON public.email_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_email_template_updated_at();

-- 5. Function to create onboarding record when staff confirms email
CREATE OR REPLACE FUNCTION public.create_staff_onboarding_record()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create onboarding record when staff email is confirmed
    IF NEW.email_confirmed = true AND OLD.email_confirmed = false THEN
        INSERT INTO public.staff_onboarding (staff_id)
        VALUES (NEW.id)
        ON CONFLICT (staff_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_create_staff_onboarding_record ON public.staff_members;
CREATE TRIGGER trigger_create_staff_onboarding_record
    AFTER UPDATE ON public.staff_members
    FOR EACH ROW
    EXECUTE FUNCTION public.create_staff_onboarding_record();

-- 6. Function to complete onboarding
CREATE OR REPLACE FUNCTION public.complete_staff_onboarding(p_staff_id UUID)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.staff_onboarding
    SET 
        onboarding_completed = true,
        onboarding_completed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE staff_id = p_staff_id;
    
    IF FOUND THEN
        RETURN QUERY SELECT true, 'Onboarding completed successfully'::TEXT;
    ELSE
        RETURN QUERY SELECT false, 'Onboarding record not found'::TEXT;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT false, SQLERRM::TEXT;
END;
$$;

-- 7. Function to get email template by type
CREATE OR REPLACE FUNCTION public.get_email_template_by_type(
    p_business_id TEXT,
    p_template_type TEXT
)
RETURNS TABLE(
    id UUID,
    template_name TEXT,
    subject TEXT,
    body TEXT,
    variables JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.template_name,
        t.subject,
        t.body,
        t.variables
    FROM public.email_templates t
    WHERE t.business_id = p_business_id
    AND t.template_type = p_template_type
    AND t.is_active = true
    AND t.is_default = true
    LIMIT 1;
END;
$$;

-- 8. RLS Policies
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_onboarding ENABLE ROW LEVEL SECURITY;

-- Email templates policies
DROP POLICY IF EXISTS "users_can_view_own_business_templates" ON public.email_templates;
CREATE POLICY "users_can_view_own_business_templates"
ON public.email_templates
FOR SELECT
USING (
    business_id IN (
        SELECT business_name FROM public.user_profiles WHERE id = auth.uid()
    )
);

DROP POLICY IF EXISTS "users_can_manage_own_business_templates" ON public.email_templates;
CREATE POLICY "users_can_manage_own_business_templates"
ON public.email_templates
FOR ALL
USING (
    business_id IN (
        SELECT business_name FROM public.user_profiles WHERE id = auth.uid()
    )
);

-- Staff onboarding policies
DROP POLICY IF EXISTS "staff_can_view_own_onboarding" ON public.staff_onboarding;
CREATE POLICY "staff_can_view_own_onboarding"
ON public.staff_onboarding
FOR SELECT
USING (
    staff_id IN (
        SELECT id FROM public.staff_members WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    OR
    staff_id IN (
        SELECT id FROM public.staff_members WHERE business_id IN (
            SELECT business_name FROM public.user_profiles WHERE id = auth.uid()
        )
    )
);

DROP POLICY IF EXISTS "staff_can_update_own_onboarding" ON public.staff_onboarding;
CREATE POLICY "staff_can_update_own_onboarding"
ON public.staff_onboarding
FOR UPDATE
USING (
    staff_id IN (
        SELECT id FROM public.staff_members WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
);

-- 9. Insert default email templates
DO $$
DECLARE
    default_business_id TEXT := 'default_business';
BEGIN
    -- Staff Invitation Template
    INSERT INTO public.email_templates (
        business_id,
        template_type,
        template_name,
        subject,
        body,
        variables,
        is_active,
        is_default
    ) VALUES (
        default_business_id,
        'staff_invitation',
        'Invitación de Personal - Predeterminada',
        '¡Bienvenido al equipo de {{businessName}}!',
        '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">¡Hola {{fullName}}!</h1>
            <p>Has sido invitado a unirte al equipo de <strong>{{businessName}}</strong> como <strong>{{role}}</strong>.</p>
            <p>Para confirmar tu cuenta y comenzar, haz clic en el siguiente enlace:</p>
            <a href="{{confirmationLink}}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Confirmar mi cuenta</a>
            <p style="color: #666; font-size: 14px;">Este enlace expirará en 7 días.</p>
            <p>Si no solicitaste esta invitación, puedes ignorar este correo.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #999; font-size: 12px;">© 2024 PromoClub. Todos los derechos reservados.</p>
        </div>',
        '[{"name": "fullName", "description": "Nombre completo del empleado", "required": true}, {"name": "businessName", "description": "Nombre del negocio", "required": true}, {"name": "role", "description": "Rol asignado", "required": true}, {"name": "confirmationLink", "description": "Enlace de confirmación", "required": true}]'::jsonb,
        true,
        true
    )
    ON CONFLICT (business_id, template_type, is_default) DO NOTHING;

    -- Email Confirmation Template
    INSERT INTO public.email_templates (
        business_id,
        template_type,
        template_name,
        subject,
        body,
        variables,
        is_active,
        is_default
    ) VALUES (
        default_business_id,
        'email_confirmation',
        'Confirmación de Email - Predeterminada',
        '¡Tu cuenta ha sido confirmada!',
        '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #10B981;">✓ ¡Cuenta confirmada!</h1>
            <p>Hola {{fullName}},</p>
            <p>Tu correo electrónico ha sido confirmado exitosamente. Tu cuenta ahora está activa.</p>
            <p><strong>Rol asignado:</strong> {{role}}</p>
            <p>Ahora puedes iniciar sesión en la plataforma:</p>
            <a href="{{loginLink}}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Iniciar sesión</a>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #999; font-size: 12px;">© 2024 PromoClub. Todos los derechos reservados.</p>
        </div>',
        '[{"name": "fullName", "description": "Nombre completo del empleado", "required": true}, {"name": "role", "description": "Rol asignado", "required": true}, {"name": "loginLink", "description": "Enlace de inicio de sesión", "required": true}]'::jsonb,
        true,
        true
    )
    ON CONFLICT (business_id, template_type, is_default) DO NOTHING;

    -- Welcome/Onboarding Template
    INSERT INTO public.email_templates (
        business_id,
        template_type,
        template_name,
        subject,
        body,
        variables,
        is_active,
        is_default
    ) VALUES (
        default_business_id,
        'welcome',
        'Bienvenida - Predeterminada',
        '¡Bienvenido a {{businessName}}!',
        '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">¡Bienvenido {{fullName}}!</h1>
            <p>Estamos emocionados de tenerte en el equipo de <strong>{{businessName}}</strong>.</p>
            <h2 style="color: #4F46E5; font-size: 18px;">Tu rol: {{role}}</h2>
            <p>{{roleDescription}}</p>
            <h3 style="color: #333; font-size: 16px;">Primeros pasos:</h3>
            <ul style="line-height: 1.8;">
                <li>Completa tu perfil en la plataforma</li>
                <li>Revisa los permisos asignados a tu rol</li>
                <li>Explora las funcionalidades disponibles</li>
            </ul>
            <p>Si tienes alguna pregunta, no dudes en contactar al administrador.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #999; font-size: 12px;">© 2024 PromoClub. Todos los derechos reservados.</p>
        </div>',
        '[{"name": "fullName", "description": "Nombre completo del empleado", "required": true}, {"name": "businessName", "description": "Nombre del negocio", "required": true}, {"name": "role", "description": "Rol asignado", "required": true}, {"name": "roleDescription", "description": "Descripción del rol", "required": false}]'::jsonb,
        true,
        true
    )
    ON CONFLICT (business_id, template_type, is_default) DO NOTHING;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Default templates creation failed: %', SQLERRM;
END $$;