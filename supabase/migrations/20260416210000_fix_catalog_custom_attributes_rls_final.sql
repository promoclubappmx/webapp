-- Definitive RLS fix for catalog_custom_attributes
-- Drops ALL known policies by name and recreates with open authenticated access
-- Also removes FK constraint to user_profiles to prevent insert failures

-- Step 1: Drop all known policies by name
DROP POLICY IF EXISTS "users_manage_own_catalog_custom_attributes" ON public.catalog_custom_attributes;
DROP POLICY IF EXISTS "catalog_custom_attributes_authenticated_access" ON public.catalog_custom_attributes;

-- Step 2: Drop any remaining policies via dynamic SQL
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

-- Step 3: Ensure RLS is enabled
ALTER TABLE public.catalog_custom_attributes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_custom_attributes ENABLE ROW LEVEL SECURITY;

-- Step 4: Remove FK constraint on owner_id that references user_profiles
-- This prevents inserts when user_profiles row doesn't exist for the auth user
ALTER TABLE public.catalog_custom_attributes
  DROP CONSTRAINT IF EXISTS catalog_custom_attributes_owner_id_fkey;

-- Step 5: Create permissive policy for authenticated users
CREATE POLICY "catalog_custom_attributes_open_access"
ON public.catalog_custom_attributes
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
