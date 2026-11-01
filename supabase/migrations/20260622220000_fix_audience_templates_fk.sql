-- Fix audience_templates FK constraint
-- The business_id column references public.user_profiles(id) but user_profiles has no rows.
-- The authenticated user's auth.uid() doesn't exist in user_profiles, causing FK violation on INSERT.
-- Solution: Drop the FK constraint so business_id stores auth.uid() directly without FK enforcement.

-- Drop FK constraint on audience_templates.business_id
ALTER TABLE public.audience_templates
DROP CONSTRAINT IF EXISTS audience_templates_business_id_fkey;

-- Drop FK constraint on audience_template_usage.business_id
ALTER TABLE public.audience_template_usage
DROP CONSTRAINT IF EXISTS audience_template_usage_business_id_fkey;

-- Drop FK constraint on audience_template_usage.template_id (keep it but ensure it still works)
-- This one is fine since it references audience_templates which exists.

-- Ensure RLS policies are correct (re-apply the fix from previous migration to be safe)
DROP POLICY IF EXISTS "users_select_audience_templates" ON public.audience_templates;
CREATE POLICY "users_select_audience_templates"
  ON public.audience_templates
  FOR SELECT
  TO authenticated
  USING (business_id = auth.uid() OR template_type = 'promoclub_suggested'::public.audience_template_type);

DROP POLICY IF EXISTS "users_insert_audience_templates" ON public.audience_templates;
CREATE POLICY "users_insert_audience_templates"
  ON public.audience_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (business_id = auth.uid());

DROP POLICY IF EXISTS "users_update_audience_templates" ON public.audience_templates;
CREATE POLICY "users_update_audience_templates"
  ON public.audience_templates
  FOR UPDATE
  TO authenticated
  USING (business_id = auth.uid())
  WITH CHECK (business_id = auth.uid());

DROP POLICY IF EXISTS "users_delete_audience_templates" ON public.audience_templates;
CREATE POLICY "users_delete_audience_templates"
  ON public.audience_templates
  FOR DELETE
  TO authenticated
  USING (business_id = auth.uid());
