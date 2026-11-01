-- QR Check-in Geolocation Migration
-- Adds geolocation config fields to checkin_methods for QR Mostrador 10m radius validation

-- Add geolocation columns to checkin_methods if they don't exist
ALTER TABLE public.checkin_methods
  ADD COLUMN IF NOT EXISTS qr_geo_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS qr_geo_lat DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS qr_geo_lng DECIMAL(11, 8),
  ADD COLUMN IF NOT EXISTS qr_geo_radius_meters INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS qr_geo_location_id UUID REFERENCES public.business_locations(id) ON DELETE SET NULL;

-- Index for geolocation queries
CREATE INDEX IF NOT EXISTS idx_checkin_methods_qr_geo ON public.checkin_methods(business_id, qr_geo_enabled)
  WHERE qr_geo_enabled = true;
