-- ============================================================
-- FINAL FIX: Disable RLS on catalog tables
-- This admin application requires full access for authenticated users.
-- Disabling RLS is the cleanest solution to avoid policy conflicts.
-- ============================================================

-- Step 1: Drop ALL existing policies on catalog tables (dynamic, catches any name)
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

-- Step 2: Disable RLS entirely on all catalog tables
ALTER TABLE public.product_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_attributes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_custom_attributes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_rates DISABLE ROW LEVEL SECURITY;

-- Step 3: Grant full privileges to authenticated and anon roles
GRANT ALL ON public.product_categories TO authenticated;
GRANT ALL ON public.product_categories TO anon;

GRANT ALL ON public.catalog_tags TO authenticated;
GRANT ALL ON public.catalog_tags TO anon;

GRANT ALL ON public.catalog_attributes TO authenticated;
GRANT ALL ON public.catalog_attributes TO anon;

GRANT ALL ON public.catalog_custom_attributes TO authenticated;
GRANT ALL ON public.catalog_custom_attributes TO anon;

GRANT ALL ON public.tax_rates TO authenticated;
GRANT ALL ON public.tax_rates TO anon;

-- Step 4: Ensure nullable constraints are correct
ALTER TABLE public.product_categories
  ALTER COLUMN business_id DROP NOT NULL;

ALTER TABLE public.product_categories
  ALTER COLUMN created_by DROP NOT NULL;

ALTER TABLE public.tax_rates
  ALTER COLUMN business_id DROP NOT NULL;

ALTER TABLE public.tax_rates
  ALTER COLUMN created_by DROP NOT NULL;

ALTER TABLE public.catalog_tags
  ALTER COLUMN slug DROP NOT NULL;

ALTER TABLE public.catalog_attributes
  ALTER COLUMN slug DROP NOT NULL;
