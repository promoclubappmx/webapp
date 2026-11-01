-- Definitive RLS fix for catalog_tags, catalog_attributes, product_categories
-- Drops every possible policy name from all previous migrations and creates clean policies

-- ─── catalog_tags ────────────────────────────────────────────────────────────
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

CREATE POLICY "catalog_tags_all_ops"
ON public.catalog_tags
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- ─── catalog_attributes ──────────────────────────────────────────────────────
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

CREATE POLICY "catalog_attributes_all_ops"
ON public.catalog_attributes
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- ─── product_categories ──────────────────────────────────────────────────────
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

CREATE POLICY "product_categories_all_ops"
ON public.product_categories
FOR ALL
TO authenticated
USING (
  owner_id = auth.uid()
  OR created_by = auth.uid()
  OR (owner_id IS NULL AND created_by IS NULL)
)
WITH CHECK (
  owner_id = auth.uid()
  OR created_by = auth.uid()
);
