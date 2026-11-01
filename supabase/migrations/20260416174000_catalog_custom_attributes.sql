-- Migration: catalog_custom_attributes
-- Creates catalog_custom_attributes table for key-value product attributes
-- visible to customers (Calorías, Origen, Sin gluten, etc.)

CREATE TABLE IF NOT EXISTS public.catalog_custom_attributes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id    UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    attr_key    TEXT NOT NULL,
    attr_value  TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_catalog_custom_attributes_owner_id
    ON public.catalog_custom_attributes(owner_id);

ALTER TABLE public.catalog_custom_attributes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_catalog_custom_attributes" ON public.catalog_custom_attributes;
CREATE POLICY "users_manage_own_catalog_custom_attributes"
ON public.catalog_custom_attributes
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());
