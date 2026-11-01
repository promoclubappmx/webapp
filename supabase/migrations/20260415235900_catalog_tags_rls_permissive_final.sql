-- Fix: Restore permissive RLS on catalog_tags, catalog_attributes, product_categories
-- The previous migration (20260415230000) re-created restrictive owner_id policies
-- which block inserts. This migration replaces them with open authenticated access.

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

CREATE POLICY "catalog_tags_authenticated_access"
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

CREATE POLICY "catalog_attributes_authenticated_access"
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

CREATE POLICY "product_categories_authenticated_access"
ON public.product_categories
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
