-- Migration: Add location_id to suppliers for establishment-based filtering
-- Timestamp: 20260505080000

-- Add location_id column to suppliers table
ALTER TABLE public.suppliers
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.business_locations(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_suppliers_location_id ON public.suppliers(location_id);
