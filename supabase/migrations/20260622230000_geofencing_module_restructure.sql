-- Migration: Geofencing Module Restructure
-- Adds support for multiple geofences per branch, triggers config, and activity log

-- Ensure PostGIS is enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add created_at to existing geofence_events table if it doesn't have it
-- (older migration 20260311180000_geofence_module.sql created it without created_at)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'geofence_events')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'geofence_events' AND column_name = 'created_at') THEN
    ALTER TABLE public.geofence_events ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- business_geofences: one or more geofences per business/branch
CREATE TABLE IF NOT EXISTS public.business_geofences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id TEXT,
  name TEXT NOT NULL DEFAULT 'Zona principal',
  geofence_type TEXT NOT NULL DEFAULT 'circle' CHECK (geofence_type IN ('circle', 'polygon')),
  radius_meters INTEGER CHECK (radius_meters >= 50 AND radius_meters <= 1000),
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  polygon_geojson TEXT,
  polygon_geometry GEOMETRY(Polygon, 4326),
  area_m2 DOUBLE PRECISION,
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT true,
  purpose TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- geofence_triggers: configuration for each trigger per geofence
CREATE TABLE IF NOT EXISTS public.geofence_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  geofence_id UUID REFERENCES public.business_geofences(id) ON DELETE CASCADE,
  business_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('entry', 'dwell', 'exit', 'business_alert')),
  is_active BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- geofence_frequency_config: global frequency control per business
CREATE TABLE IF NOT EXISTS public.geofence_frequency_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  max_actions_per_day INTEGER DEFAULT 1 CHECK (max_actions_per_day >= 1 AND max_actions_per_day <= 3),
  respect_business_hours BOOLEAN DEFAULT true,
  geo_conquesting_enabled BOOLEAN DEFAULT false,
  geo_conquesting_radius_meters INTEGER DEFAULT 100,
  geo_conquesting_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for time-based queries on events (now safe since created_at is guaranteed to exist)
CREATE INDEX IF NOT EXISTS idx_geofence_events_business_created
  ON public.geofence_events(business_id, created_at DESC);

-- Add geofence_id column to existing geofence_events if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'geofence_events' AND column_name = 'geofence_id') THEN
    ALTER TABLE public.geofence_events ADD COLUMN geofence_id UUID;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_geofence_events_geofence_created
  ON public.geofence_events(geofence_id, created_at DESC)
  WHERE geofence_id IS NOT NULL;

-- Index for spatial queries
CREATE INDEX IF NOT EXISTS idx_business_geofences_active
  ON public.business_geofences(business_id, is_active);

-- RLS Policies for business_geofences
ALTER TABLE public.business_geofences ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'business_geofences' AND policyname = 'geofences_select') THEN
    CREATE POLICY geofences_select ON public.business_geofences
      FOR SELECT USING (business_id = auth.uid()::text);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'business_geofences' AND policyname = 'geofences_insert') THEN
    CREATE POLICY geofences_insert ON public.business_geofences
      FOR INSERT WITH CHECK (business_id = auth.uid()::text);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'business_geofences' AND policyname = 'geofences_update') THEN
    CREATE POLICY geofences_update ON public.business_geofences
      FOR UPDATE USING (business_id = auth.uid()::text);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'business_geofences' AND policyname = 'geofences_delete') THEN
    CREATE POLICY geofences_delete ON public.business_geofences
      FOR DELETE USING (business_id = auth.uid()::text);
  END IF;
END $$;

-- RLS Policies for geofence_triggers
ALTER TABLE public.geofence_triggers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'geofence_triggers' AND policyname = 'triggers_select') THEN
    CREATE POLICY triggers_select ON public.geofence_triggers
      FOR SELECT USING (business_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'geofence_triggers' AND policyname = 'triggers_insert') THEN
    CREATE POLICY triggers_insert ON public.geofence_triggers
      FOR INSERT WITH CHECK (business_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'geofence_triggers' AND policyname = 'triggers_update') THEN
    CREATE POLICY triggers_update ON public.geofence_triggers
      FOR UPDATE USING (business_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'geofence_triggers' AND policyname = 'triggers_delete') THEN
    CREATE POLICY triggers_delete ON public.geofence_triggers
      FOR DELETE USING (business_id = auth.uid());
  END IF;
END $$;

-- RLS Policies for geofence_frequency_config
ALTER TABLE public.geofence_frequency_config ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'geofence_frequency_config' AND policyname = 'freq_select') THEN
    CREATE POLICY freq_select ON public.geofence_frequency_config
      FOR SELECT USING (business_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'geofence_frequency_config' AND policyname = 'freq_insert') THEN
    CREATE POLICY freq_insert ON public.geofence_frequency_config
      FOR INSERT WITH CHECK (business_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'geofence_frequency_config' AND policyname = 'freq_update') THEN
    CREATE POLICY freq_update ON public.geofence_frequency_config
      FOR UPDATE USING (business_id = auth.uid());
  END IF;
END $$;

-- RLS Policies for geofence_events (add new policies if not already present)
ALTER TABLE public.geofence_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'geofence_events' AND policyname = 'events_select') THEN
    CREATE POLICY events_select ON public.geofence_events
      FOR SELECT USING (business_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'geofence_events' AND policyname = 'events_insert') THEN
    CREATE POLICY events_insert ON public.geofence_events
      FOR INSERT WITH CHECK (business_id = auth.uid());
  END IF;
END $$;
