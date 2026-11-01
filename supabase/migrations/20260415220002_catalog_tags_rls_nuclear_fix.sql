-- Nuclear RLS fix for catalog_tags
-- This migration disables and re-enables RLS to clear any cached policy state,
-- then creates a fresh policy with a unique timestamp-based name.

-- ─── catalog_tags ────────────────────────────────────────────────────────────
ALTER TABLE public.catalog_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_tags ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'catalog_tags'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.catalog_tags', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "ct_authenticated_full_access_v2"
ON public.catalog_tags
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ─── catalog_attributes ──────────────────────────────────────────────────────
ALTER TABLE public.catalog_attributes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_attributes ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'catalog_attributes'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.catalog_attributes', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "ca_authenticated_full_access_v2"
ON public.catalog_attributes
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ─── product_categories ──────────────────────────────────────────────────────
ALTER TABLE public.product_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'product_categories'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.product_categories', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "pc_authenticated_full_access_v2"
ON public.product_categories
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
