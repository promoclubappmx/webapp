-- Fix audience_templates RLS policies
-- The FOR ALL policy with USING (business_id = auth.uid() OR template_type = 'promoclub_suggested')
-- causes INSERT to fail because USING is evaluated for new rows in FOR ALL policies.
-- Solution: Split into separate operation-specific policies.

-- Drop the existing combined policy
DROP POLICY IF EXISTS "users_manage_own_audience_templates" ON public.audience_templates;

-- SELECT: users can see their own templates AND PromoClub suggested templates
DROP POLICY IF EXISTS "users_select_audience_templates" ON public.audience_templates;
CREATE POLICY "users_select_audience_templates"
  ON public.audience_templates
  FOR SELECT
  TO authenticated
  USING (business_id = auth.uid() OR template_type = 'promoclub_suggested'::public.audience_template_type);

-- INSERT: users can only insert their own templates (business_id must equal auth.uid())
DROP POLICY IF EXISTS "users_insert_audience_templates" ON public.audience_templates;
CREATE POLICY "users_insert_audience_templates"
  ON public.audience_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (business_id = auth.uid());

-- UPDATE: users can only update their own templates (not PromoClub suggested)
DROP POLICY IF EXISTS "users_update_audience_templates" ON public.audience_templates;
CREATE POLICY "users_update_audience_templates"
  ON public.audience_templates
  FOR UPDATE
  TO authenticated
  USING (business_id = auth.uid())
  WITH CHECK (business_id = auth.uid());

-- DELETE: users can only delete their own templates
DROP POLICY IF EXISTS "users_delete_audience_templates" ON public.audience_templates;
CREATE POLICY "users_delete_audience_templates"
  ON public.audience_templates
  FOR DELETE
  TO authenticated
  USING (business_id = auth.uid());
