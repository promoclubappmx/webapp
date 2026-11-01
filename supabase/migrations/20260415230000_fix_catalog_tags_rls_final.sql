-- Final fix for RLS policies on catalog_tags and catalog_attributes
-- Uses FOR ALL pattern which is simpler and avoids policy conflicts

-- ─── catalog_tags ────────────────────────────────────────────────────────────
ALTER TABLE public.catalog_tags ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies (both old and new names)
DROP POLICY IF EXISTS "users_manage_own_catalog_tags" ON public.catalog_tags;
DROP POLICY IF EXISTS "catalog_tags_select_policy" ON public.catalog_tags;
DROP POLICY IF EXISTS "catalog_tags_insert_policy" ON public.catalog_tags;
DROP POLICY IF EXISTS "catalog_tags_update_policy" ON public.catalog_tags;
DROP POLICY IF EXISTS "catalog_tags_delete_policy" ON public.catalog_tags;

-- Single FOR ALL policy (simplest and most reliable)
CREATE POLICY "catalog_tags_owner_policy"
ON public.catalog_tags
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- ─── catalog_attributes ──────────────────────────────────────────────────────
ALTER TABLE public.catalog_attributes ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "users_manage_own_catalog_attributes" ON public.catalog_attributes;
DROP POLICY IF EXISTS "catalog_attributes_select_policy" ON public.catalog_attributes;
DROP POLICY IF EXISTS "catalog_attributes_insert_policy" ON public.catalog_attributes;
DROP POLICY IF EXISTS "catalog_attributes_update_policy" ON public.catalog_attributes;
DROP POLICY IF EXISTS "catalog_attributes_delete_policy" ON public.catalog_attributes;

-- Single FOR ALL policy
CREATE POLICY "catalog_attributes_owner_policy"
ON public.catalog_attributes
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- ─── product_categories ──────────────────────────────────────────────────────
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "users_manage_own_product_categories" ON public.product_categories;
DROP POLICY IF EXISTS "product_categories_select_policy" ON public.product_categories;
DROP POLICY IF EXISTS "product_categories_insert_policy" ON public.product_categories;
DROP POLICY IF EXISTS "product_categories_update_policy" ON public.product_categories;
DROP POLICY IF EXISTS "product_categories_delete_policy" ON public.product_categories;

-- Single FOR ALL policy covering both owner_id and created_by
CREATE POLICY "product_categories_owner_policy"
ON public.product_categories
FOR ALL
TO authenticated
USING (owner_id = auth.uid() OR created_by = auth.uid())
WITH CHECK (owner_id = auth.uid() OR created_by = auth.uid());
