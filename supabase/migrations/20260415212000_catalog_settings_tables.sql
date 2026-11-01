-- Migration: catalog_settings_tables
-- Creates catalog_tags and catalog_attributes tables linked to owner (user_profiles)
-- Also adds owner_id column to product_categories and tax_rates for direct user ownership

-- ─── catalog_tags ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.catalog_tags (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id    UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL,
    color       TEXT DEFAULT '#3b82f6',
    description TEXT,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_catalog_tags_owner_id ON public.catalog_tags(owner_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_catalog_tags_owner_slug ON public.catalog_tags(owner_id, slug);

ALTER TABLE public.catalog_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_catalog_tags" ON public.catalog_tags;
CREATE POLICY "users_manage_own_catalog_tags"
ON public.catalog_tags
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- ─── catalog_attributes ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.catalog_attributes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id    UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL,
    attr_type   TEXT NOT NULL DEFAULT 'select',
    values      TEXT[] DEFAULT ARRAY[]::TEXT[],
    description TEXT,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_catalog_attributes_owner_id ON public.catalog_attributes(owner_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_catalog_attributes_owner_slug ON public.catalog_attributes(owner_id, slug);

ALTER TABLE public.catalog_attributes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_catalog_attributes" ON public.catalog_attributes;
CREATE POLICY "users_manage_own_catalog_attributes"
ON public.catalog_attributes
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- ─── Add owner_id to product_categories (if not present) ─────────────────────
ALTER TABLE public.product_categories
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_product_categories_owner_id ON public.product_categories(owner_id);

-- Backfill owner_id from created_by where possible
UPDATE public.product_categories
SET owner_id = created_by
WHERE owner_id IS NULL AND created_by IS NOT NULL;

-- Update RLS for product_categories to support owner_id
DROP POLICY IF EXISTS "users_manage_own_product_categories" ON public.product_categories;
CREATE POLICY "users_manage_own_product_categories"
ON public.product_categories
FOR ALL
TO authenticated
USING (owner_id = auth.uid() OR created_by = auth.uid())
WITH CHECK (owner_id = auth.uid() OR created_by = auth.uid());

-- ─── Add owner_id to tax_rates (if not present) ──────────────────────────────
ALTER TABLE public.tax_rates
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tax_rates_owner_id ON public.tax_rates(owner_id);

-- Backfill owner_id from created_by where possible
UPDATE public.tax_rates
SET owner_id = created_by
WHERE owner_id IS NULL AND created_by IS NOT NULL;

-- Update RLS for tax_rates to support owner_id
DROP POLICY IF EXISTS "users_manage_own_tax_rates" ON public.tax_rates;
CREATE POLICY "users_manage_own_tax_rates"
ON public.tax_rates
FOR ALL
TO authenticated
USING (owner_id = auth.uid() OR created_by = auth.uid())
WITH CHECK (owner_id = auth.uid() OR created_by = auth.uid());
