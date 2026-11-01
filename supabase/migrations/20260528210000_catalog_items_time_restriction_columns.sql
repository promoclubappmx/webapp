-- Migration: Add dedicated time_restriction columns to catalog_items
-- These columns improve querying performance vs relying solely on metadata JSONB

ALTER TABLE public.catalog_items
ADD COLUMN IF NOT EXISTS time_restriction BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS available_time_slots JSONB DEFAULT '[]'::jsonb;

-- Index for filtering items by time restriction
CREATE INDEX IF NOT EXISTS idx_catalog_items_time_restriction
  ON public.catalog_items (time_restriction)
  WHERE time_restriction = true;

-- Backfill from existing metadata (idempotent)
UPDATE public.catalog_items
SET
  time_restriction = COALESCE((metadata->>'timeRestriction')::boolean, false),
  available_time_slots = COALESCE(metadata->'availableTimeSlots', '[]'::jsonb)
WHERE metadata IS NOT NULL
  AND (metadata->>'timeRestriction' IS NOT NULL OR metadata->'availableTimeSlots' IS NOT NULL);
