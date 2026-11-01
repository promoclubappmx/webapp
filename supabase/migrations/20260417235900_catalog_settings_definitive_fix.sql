-- ============================================================
-- DEFINITIVE FIX: catalog-settings all tables
-- Drops ALL conflicting policies and FK constraints on owner_id
-- for product_categories, catalog_tags, catalog_attributes,
-- catalog_custom_attributes, and tax_rates
-- ============================================================

-- Helper: drop ALL policies on a given table
DO $$
DECLARE
  pol RECORD;
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'product_categories',
    'catalog_tags',
    'catalog_attributes',
    'catalog_custom_attributes',
    'tax_rates'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    FOR pol IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = tbl
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tbl);
    END LOOP;
  END LOOP;
END $$;

-- Helper: drop ALL FK constraints on owner_id for each table
DO $$
DECLARE
  con RECORD;
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'product_categories',
    'catalog_tags',
    'catalog_attributes',
    'catalog_custom_attributes',
    'tax_rates'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    FOR con IN
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = ('public.' || tbl)::regclass
        AND contype = 'f'
        AND (conname LIKE '%owner_id%' OR conname LIKE '%created_by%')
    LOOP
      EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I', tbl, con.conname);
    END LOOP;
  END LOOP;
END $$;

-- ─── product_categories ──────────────────────────────────────────────────────
ALTER TABLE public.product_categories ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE public.product_categories ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE public.product_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "catalog_product_categories_all_v5" ON public.product_categories;
CREATE POLICY "catalog_product_categories_all_v5"
  ON public.product_categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

GRANT ALL ON public.product_categories TO authenticated;

-- ─── catalog_tags ────────────────────────────────────────────────────────────
ALTER TABLE public.catalog_tags ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE public.catalog_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "catalog_tags_all_v5" ON public.catalog_tags;
CREATE POLICY "catalog_tags_all_v5"
  ON public.catalog_tags
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

GRANT ALL ON public.catalog_tags TO authenticated;

-- ─── catalog_attributes ──────────────────────────────────────────────────────
ALTER TABLE public.catalog_attributes ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE public.catalog_attributes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_attributes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "catalog_attributes_all_v5" ON public.catalog_attributes;
CREATE POLICY "catalog_attributes_all_v5"
  ON public.catalog_attributes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

GRANT ALL ON public.catalog_attributes TO authenticated;

-- ─── catalog_custom_attributes ───────────────────────────────────────────────
ALTER TABLE public.catalog_custom_attributes ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE public.catalog_custom_attributes ALTER COLUMN attr_value DROP NOT NULL;
ALTER TABLE public.catalog_custom_attributes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_custom_attributes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "catalog_custom_attributes_all_v5" ON public.catalog_custom_attributes;
CREATE POLICY "catalog_custom_attributes_all_v5"
  ON public.catalog_custom_attributes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

GRANT ALL ON public.catalog_custom_attributes TO authenticated;

-- ─── tax_rates ───────────────────────────────────────────────────────────────
ALTER TABLE public.tax_rates ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE public.tax_rates ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE public.tax_rates ALTER COLUMN business_id DROP NOT NULL;
ALTER TABLE public.tax_rates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "catalog_tax_rates_all_v5" ON public.tax_rates;
CREATE POLICY "catalog_tax_rates_all_v5"
  ON public.tax_rates
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

GRANT ALL ON public.tax_rates TO authenticated;

-- Ensure schema usage is granted
GRANT USAGE ON SCHEMA public TO authenticated;
