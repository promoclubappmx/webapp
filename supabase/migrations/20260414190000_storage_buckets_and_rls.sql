-- ============================================================
-- PromoSpot: Storage Buckets + Additional RLS Policies
-- Timestamp: 20260414190000
-- ============================================================

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

-- Business logos and brand assets (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-assets',
  'business-assets',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Catalog item images (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'catalog-images',
  'catalog-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Gift card designs (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gift-card-designs',
  'gift-card-designs',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Customer avatars (private - signed URLs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'customer-avatars',
  'customer-avatars',
  false,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Staff documents (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'staff-documents',
  'staff-documents',
  false,
  20971520, -- 20MB
  ARRAY['image/jpeg', 'image/png', 'application/pdf', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Survey media (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'survey-media',
  'survey-media',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Campaign media (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'campaign-media',
  'campaign-media',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'video/mp4']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================
-- STORAGE RLS POLICIES
-- ============================================================

-- business-assets: authenticated users can upload to their own folder
DROP POLICY IF EXISTS "business_assets_select" ON storage.objects;
CREATE POLICY "business_assets_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'business-assets');

DROP POLICY IF EXISTS "business_assets_insert" ON storage.objects;
CREATE POLICY "business_assets_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'business-assets');

DROP POLICY IF EXISTS "business_assets_update" ON storage.objects;
CREATE POLICY "business_assets_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'business-assets');

DROP POLICY IF EXISTS "business_assets_delete" ON storage.objects;
CREATE POLICY "business_assets_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'business-assets');

-- catalog-images: public read, authenticated write
DROP POLICY IF EXISTS "catalog_images_select" ON storage.objects;
CREATE POLICY "catalog_images_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'catalog-images');

DROP POLICY IF EXISTS "catalog_images_insert" ON storage.objects;
CREATE POLICY "catalog_images_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'catalog-images');

DROP POLICY IF EXISTS "catalog_images_update" ON storage.objects;
CREATE POLICY "catalog_images_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'catalog-images');

DROP POLICY IF EXISTS "catalog_images_delete" ON storage.objects;
CREATE POLICY "catalog_images_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'catalog-images');

-- gift-card-designs: public read, authenticated write
DROP POLICY IF EXISTS "gift_card_designs_select" ON storage.objects;
CREATE POLICY "gift_card_designs_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gift-card-designs');

DROP POLICY IF EXISTS "gift_card_designs_insert" ON storage.objects;
CREATE POLICY "gift_card_designs_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gift-card-designs');

DROP POLICY IF EXISTS "gift_card_designs_update" ON storage.objects;
CREATE POLICY "gift_card_designs_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'gift-card-designs');

DROP POLICY IF EXISTS "gift_card_designs_delete" ON storage.objects;
CREATE POLICY "gift_card_designs_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'gift-card-designs');

-- promotional-images: public read, authenticated write (existing bucket)
DROP POLICY IF EXISTS "promotional_images_select" ON storage.objects;
CREATE POLICY "promotional_images_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'promotional-images');

DROP POLICY IF EXISTS "promotional_images_insert" ON storage.objects;
CREATE POLICY "promotional_images_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'promotional-images');

DROP POLICY IF EXISTS "promotional_images_update" ON storage.objects;
CREATE POLICY "promotional_images_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'promotional-images');

DROP POLICY IF EXISTS "promotional_images_delete" ON storage.objects;
CREATE POLICY "promotional_images_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'promotional-images');

-- customer-avatars: private, owner only
DROP POLICY IF EXISTS "customer_avatars_select" ON storage.objects;
CREATE POLICY "customer_avatars_select"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'customer-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "customer_avatars_insert" ON storage.objects;
CREATE POLICY "customer_avatars_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'customer-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "customer_avatars_update" ON storage.objects;
CREATE POLICY "customer_avatars_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'customer-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "customer_avatars_delete" ON storage.objects;
CREATE POLICY "customer_avatars_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'customer-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- staff-documents: authenticated users only
DROP POLICY IF EXISTS "staff_documents_select" ON storage.objects;
CREATE POLICY "staff_documents_select"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'staff-documents');

DROP POLICY IF EXISTS "staff_documents_insert" ON storage.objects;
CREATE POLICY "staff_documents_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'staff-documents');

DROP POLICY IF EXISTS "staff_documents_update" ON storage.objects;
CREATE POLICY "staff_documents_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'staff-documents');

DROP POLICY IF EXISTS "staff_documents_delete" ON storage.objects;
CREATE POLICY "staff_documents_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'staff-documents');

-- survey-media: public read, authenticated write
DROP POLICY IF EXISTS "survey_media_select" ON storage.objects;
CREATE POLICY "survey_media_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'survey-media');

DROP POLICY IF EXISTS "survey_media_insert" ON storage.objects;
CREATE POLICY "survey_media_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'survey-media');

-- campaign-media: public read, authenticated write
DROP POLICY IF EXISTS "campaign_media_select" ON storage.objects;
CREATE POLICY "campaign_media_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'campaign-media');

DROP POLICY IF EXISTS "campaign_media_insert" ON storage.objects;
CREATE POLICY "campaign_media_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'campaign-media');

DROP POLICY IF EXISTS "campaign_media_update" ON storage.objects;
CREATE POLICY "campaign_media_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'campaign-media');

DROP POLICY IF EXISTS "campaign_media_delete" ON storage.objects;
CREATE POLICY "campaign_media_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'campaign-media');

-- ============================================================
-- RLS FIX: Enable RLS on tables that are missing it
-- ============================================================

ALTER TABLE public.business_geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geo_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "business_geofences_auth_access" ON public.business_geofences;
CREATE POLICY "business_geofences_auth_access"
ON public.business_geofences FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "business_locations_auth_access" ON public.business_locations;
CREATE POLICY "business_locations_auth_access"
ON public.business_locations FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "geo_events_auth_access" ON public.geo_events;
CREATE POLICY "geo_events_auth_access"
ON public.geo_events FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
