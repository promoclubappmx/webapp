-- Fix: Add missing location_name and location_code columns to business_locations
-- The master schema rebuild created the table with branch_name instead of location_name

-- Add location_name column if it doesn't exist
ALTER TABLE public.business_locations
  ADD COLUMN IF NOT EXISTS location_name TEXT;

-- Add location_code column if it doesn't exist
ALTER TABLE public.business_locations
  ADD COLUMN IF NOT EXISTS location_code TEXT;

-- Add address column if it doesn't exist
ALTER TABLE public.business_locations
  ADD COLUMN IF NOT EXISTS address TEXT;

-- Add city column if it doesn't exist
ALTER TABLE public.business_locations
  ADD COLUMN IF NOT EXISTS city TEXT;

-- Add state column if it doesn't exist
ALTER TABLE public.business_locations
  ADD COLUMN IF NOT EXISTS state TEXT;

-- Add zip_code column if it doesn't exist
ALTER TABLE public.business_locations
  ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- Add phone column if it doesn't exist
ALTER TABLE public.business_locations
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add email column if it doesn't exist
ALTER TABLE public.business_locations
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Add manager_name column if it doesn't exist
ALTER TABLE public.business_locations
  ADD COLUMN IF NOT EXISTS manager_name TEXT;

-- Add updated_at column if it doesn't exist
ALTER TABLE public.business_locations
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Sync location_name from branch_name for existing rows
UPDATE public.business_locations
  SET location_name = branch_name
  WHERE location_name IS NULL AND branch_name IS NOT NULL;

-- Set default location_name for rows with no branch_name either
UPDATE public.business_locations
  SET location_name = 'Principal'
  WHERE location_name IS NULL;

-- Set default location_code for rows without one
UPDATE public.business_locations
  SET location_code = 'LOC-' || UPPER(SUBSTRING(id::text, 1, 6))
  WHERE location_code IS NULL;

-- Create a trigger to keep location_name and branch_name in sync
CREATE OR REPLACE FUNCTION public.sync_location_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.location_name IS NOT NULL AND (OLD.branch_name IS DISTINCT FROM NEW.location_name) THEN
    NEW.branch_name := NEW.location_name;
  ELSIF NEW.branch_name IS NOT NULL AND (OLD.location_name IS DISTINCT FROM NEW.branch_name) THEN
    NEW.location_name := NEW.branch_name;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_location_name ON public.business_locations;
CREATE TRIGGER trg_sync_location_name
  BEFORE INSERT OR UPDATE ON public.business_locations
  FOR EACH ROW EXECUTE FUNCTION public.sync_location_name();
