-- Fix RLS policies for catalog_tags, catalog_attributes, and product_categories
-- Ensures authenticated users can insert/update/delete their own rows

-- ─── catalog_tags ────────────────────────────────────────────────────────────
ALTER TABLE public.catalog_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_catalog_tags" ON public.catalog_tags;
DROP POLICY IF EXISTS "catalog_tags_select_policy" ON public.catalog_tags;
DROP POLICY IF EXISTS "catalog_tags_insert_policy" ON public.catalog_tags;
DROP POLICY IF EXISTS "catalog_tags_update_policy" ON public.catalog_tags;
DROP POLICY IF EXISTS "catalog_tags_delete_policy" ON public.catalog_tags;

CREATE POLICY "catalog_tags_select_policy"
ON public.catalog_tags FOR SELECT TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "catalog_tags_insert_policy"
ON public.catalog_tags FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "catalog_tags_update_policy"
ON public.catalog_tags FOR UPDATE TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "catalog_tags_delete_policy"
ON public.catalog_tags FOR DELETE TO authenticated
USING (owner_id = auth.uid());

-- ─── catalog_attributes ──────────────────────────────────────────────────────
ALTER TABLE public.catalog_attributes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_catalog_attributes" ON public.catalog_attributes;
DROP POLICY IF EXISTS "catalog_attributes_select_policy" ON public.catalog_attributes;
DROP POLICY IF EXISTS "catalog_attributes_insert_policy" ON public.catalog_attributes;
DROP POLICY IF EXISTS "catalog_attributes_update_policy" ON public.catalog_attributes;
DROP POLICY IF EXISTS "catalog_attributes_delete_policy" ON public.catalog_attributes;

CREATE POLICY "catalog_attributes_select_policy"
ON public.catalog_attributes FOR SELECT TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "catalog_attributes_insert_policy"
ON public.catalog_attributes FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "catalog_attributes_update_policy"
ON public.catalog_attributes FOR UPDATE TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "catalog_attributes_delete_policy"
ON public.catalog_attributes FOR DELETE TO authenticated
USING (owner_id = auth.uid());

-- ─── product_categories ──────────────────────────────────────────────────────
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_product_categories" ON public.product_categories;
DROP POLICY IF EXISTS "product_categories_select_policy" ON public.product_categories;
DROP POLICY IF EXISTS "product_categories_insert_policy" ON public.product_categories;
DROP POLICY IF EXISTS "product_categories_update_policy" ON public.product_categories;
DROP POLICY IF EXISTS "product_categories_delete_policy" ON public.product_categories;

CREATE POLICY "product_categories_select_policy"
ON public.product_categories FOR SELECT TO authenticated
USING (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "product_categories_insert_policy"
ON public.product_categories FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "product_categories_update_policy"
ON public.product_categories FOR UPDATE TO authenticated
USING (owner_id = auth.uid() OR created_by = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "product_categories_delete_policy"
ON public.product_categories FOR DELETE TO authenticated
USING (owner_id = auth.uid() OR created_by = auth.uid());
