-- Fix: Permissive RLS on catalog_custom_attributes
-- The owner_id = auth.uid() policy blocks inserts when user_profiles.id
-- doesn't match auth.uid() in the RLS context. Use open authenticated access
-- consistent with catalog_tags and catalog_attributes pattern.

ALTER TABLE public.catalog_custom_attributes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_custom_attributes ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'catalog_custom_attributes'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.catalog_custom_attributes', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "catalog_custom_attributes_authenticated_access"
ON public.catalog_custom_attributes
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
