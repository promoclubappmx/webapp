-- Fix: product_categories FK constraint and RLS policies
-- The owner_id FK to user_profiles blocks inserts when user_profiles row doesn't exist for auth user
-- This migration drops the FK constraint and ensures permissive RLS for all catalog settings tables

-- ─── product_categories ──────────────────────────────────────────────────────

-- Step 1: Drop all existing policies dynamically
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

-- Step 2: Drop FK constraint on owner_id (blocks inserts when user_profiles row doesn't exist)
DO $$
DECLARE
  con RECORD;
BEGIN
  FOR con IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.product_categories'::regclass
      AND contype = 'f'
      AND conname LIKE '%owner_id%'
  LOOP
    EXECUTE format('ALTER TABLE public.product_categories DROP CONSTRAINT IF EXISTS %I', con.conname);
  END LOOP;
END $$;

-- Step 3: Make owner_id nullable (removes NOT NULL violation risk)
ALTER TABLE public.product_categories
  ALTER COLUMN owner_id DROP NOT NULL;

-- Step 4: Ensure RLS is enabled
ALTER TABLE public.product_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Step 5: Create permissive policy for all authenticated users
CREATE POLICY "product_categories_open_access_v4"
ON public.product_categories
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ─── catalog_tags (ensure clean state) ───────────────────────────────────────

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

-- Drop FK constraint on owner_id for catalog_tags
DO $$
DECLARE
  con RECORD;
BEGIN
  FOR con IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.catalog_tags'::regclass
      AND contype = 'f'
      AND conname LIKE '%owner_id%'
  LOOP
    EXECUTE format('ALTER TABLE public.catalog_tags DROP CONSTRAINT IF EXISTS %I', con.conname);
  END LOOP;
END $$;

ALTER TABLE public.catalog_tags
  ALTER COLUMN owner_id DROP NOT NULL;

ALTER TABLE public.catalog_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalog_tags_open_access_v4"
ON public.catalog_tags
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ─── catalog_attributes (ensure clean state) ─────────────────────────────────

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

-- Drop FK constraint on owner_id for catalog_attributes
DO $$
DECLARE
  con RECORD;
BEGIN
  FOR con IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.catalog_attributes'::regclass
      AND contype = 'f'
      AND conname LIKE '%owner_id%'
  LOOP
    EXECUTE format('ALTER TABLE public.catalog_attributes DROP CONSTRAINT IF EXISTS %I', con.conname);
  END LOOP;
END $$;

ALTER TABLE public.catalog_attributes
  ALTER COLUMN owner_id DROP NOT NULL;

ALTER TABLE public.catalog_attributes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_attributes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalog_attributes_open_access_v4"
ON public.catalog_attributes
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ─── catalog_custom_attributes (ensure clean state) ──────────────────────────

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

ALTER TABLE public.catalog_custom_attributes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_custom_attributes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalog_custom_attributes_open_access_v4"
ON public.catalog_custom_attributes
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
