-- ============================================================
-- NUCLEAR RESET: Catalog Settings RLS - Definitive Fix
-- Drops ALL policies dynamically, fixes NOT NULL constraints,
-- creates single clean permissive policy per table.
-- ============================================================

-- Step 1: Drop ALL existing policies on all 5 catalog tables using dynamic SQL
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'product_categories',
        'catalog_tags',
        'catalog_attributes',
        'catalog_custom_attributes',
        'tax_rates'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- Step 2: Fix NOT NULL constraints that block inserts
-- product_categories.business_id is NOT NULL but code never sends it
ALTER TABLE public.product_categories
  ALTER COLUMN business_id DROP NOT NULL;

-- product_categories.created_by may also cause issues
ALTER TABLE public.product_categories
  ALTER COLUMN created_by DROP NOT NULL;

-- tax_rates.business_id - make nullable
ALTER TABLE public.tax_rates
  ALTER COLUMN business_id DROP NOT NULL;

-- tax_rates.created_by - make nullable
ALTER TABLE public.tax_rates
  ALTER COLUMN created_by DROP NOT NULL;

-- catalog_tags: ensure slug has a default or is nullable
ALTER TABLE public.catalog_tags
  ALTER COLUMN slug DROP NOT NULL;

-- catalog_attributes: ensure slug is nullable
ALTER TABLE public.catalog_attributes
  ALTER COLUMN slug DROP NOT NULL;

-- Step 3: Disable RLS temporarily then re-enable (forces policy reload)
ALTER TABLE public.product_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_attributes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_custom_attributes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_rates DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_custom_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_rates ENABLE ROW LEVEL SECURITY;

-- Step 4: Create single clean permissive policy for each table
-- product_categories
CREATE POLICY "catalog_product_categories_all"
  ON public.product_categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- catalog_tags
CREATE POLICY "catalog_tags_all"
  ON public.catalog_tags
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- catalog_attributes
CREATE POLICY "catalog_attributes_all"
  ON public.catalog_attributes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- catalog_custom_attributes
CREATE POLICY "catalog_custom_attributes_all"
  ON public.catalog_custom_attributes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- tax_rates
CREATE POLICY "catalog_tax_rates_all"
  ON public.tax_rates
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Step 5: Grant explicit privileges to authenticated role
GRANT ALL ON public.product_categories TO authenticated;
GRANT ALL ON public.catalog_tags TO authenticated;
GRANT ALL ON public.catalog_attributes TO authenticated;
GRANT ALL ON public.catalog_custom_attributes TO authenticated;
GRANT ALL ON public.tax_rates TO authenticated;
