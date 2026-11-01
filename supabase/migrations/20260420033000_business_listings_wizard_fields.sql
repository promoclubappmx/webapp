-- Migration: business_listings_wizard_fields
-- Adds extended fields to business_settings for wizard data
-- Creates business_listings table for full establishment records

-- 1. Add missing columns to business_settings for wizard data
ALTER TABLE public.business_settings
  ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES public.business_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subcategoria_id UUID REFERENCES public.business_subcategories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tipo_establecimiento_id UUID REFERENCES public.business_establishment_types(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS brand_primary_color TEXT DEFAULT '#7C3AED',
  ADD COLUMN IF NOT EXISTS brand_secondary_color TEXT DEFAULT '#F59E0B',
  ADD COLUMN IF NOT EXISTS short_description TEXT,
  ADD COLUMN IF NOT EXISTS long_description TEXT,
  ADD COLUMN IF NOT EXISTS branch_name TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS secondary_tags JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS street TEXT,
  ADD COLUMN IF NOT EXISTS interior_number TEXT,
  ADD COLUMN IF NOT EXISTS colonia TEXT,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS how_to_get TEXT,
  ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS special_hours JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS temporarily_closed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS temp_closed_note TEXT,
  ADD COLUMN IF NOT EXISTS business_image_url TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS payment_methods JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS price_range INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS avg_ticket TEXT,
  ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS security_features JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS meta_keywords TEXT,
  ADD COLUMN IF NOT EXISTS search_keywords JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS wizard_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS wizard_step INTEGER DEFAULT 0;

-- 2. Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_business_settings_categoria_id ON public.business_settings(categoria_id);
CREATE INDEX IF NOT EXISTS idx_business_settings_slug ON public.business_settings(slug);
CREATE INDEX IF NOT EXISTS idx_business_settings_owner_id ON public.business_settings(owner_id);
CREATE INDEX IF NOT EXISTS idx_business_settings_is_published ON public.business_settings(is_published);

-- 3. Storage RLS for business-assets bucket (images upload)
-- Allow authenticated users to upload to their own folder
DROP POLICY IF EXISTS "business_assets_insert_policy" ON storage.objects;
CREATE POLICY "business_assets_insert_policy"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'business-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "business_assets_select_policy" ON storage.objects;
CREATE POLICY "business_assets_select_policy"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'business-assets');

DROP POLICY IF EXISTS "business_assets_update_policy" ON storage.objects;
CREATE POLICY "business_assets_update_policy"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'business-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "business_assets_delete_policy" ON storage.objects;
CREATE POLICY "business_assets_delete_policy"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'business-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
