-- PostGIS Geospatial Module Migration
-- Enables PostGIS extension and creates geospatial tables, functions, triggers, RLS policies

-- ============================================================
-- 1. ENABLE POSTGIS EXTENSION
-- ============================================================
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA public;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- ============================================================
-- 2. ENUM TYPES
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'geofence_type_enum' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.geofence_type_enum AS ENUM ('circle', 'polygon');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'geo_event_type_enum' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.geo_event_type_enum AS ENUM (
      'entry',
      'exit',
      'checkin_auto',
      'notification_sent',
      'notification_opened',
      'conversion'
    );
  END IF;
END $$;

-- ============================================================
-- 3. TABLES (only if PostGIS geometry type is available)
-- ============================================================
DO $$
BEGIN
  -- Check if PostGIS geometry type is available
  IF EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'geometry'
  ) THEN

    -- business_locations: stores normalized address + geospatial point
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'business_locations'
    ) THEN
      CREATE TABLE public.business_locations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id TEXT,
        address_normalized TEXT,
        address_references TEXT,
        latitude NUMERIC(10,6),
        longitude NUMERIC(10,6),
        location geometry(Point, 4326),
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    ELSE
      -- Add location column if it doesn't exist
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'business_locations' AND column_name = 'location'
      ) THEN
        ALTER TABLE public.business_locations ADD COLUMN location geometry(Point, 4326);
      END IF;
    END IF;

    -- business_geofences: stores geofence definitions (circle or polygon)
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'business_geofences'
    ) THEN
      CREATE TABLE public.business_geofences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id TEXT,
        name TEXT NOT NULL DEFAULT 'Geofence principal',
        geofence_type public.geofence_type_enum NOT NULL DEFAULT 'circle',
        center geometry(Point, 4326),
        radius_meters INTEGER DEFAULT 200,
        polygon geometry(Polygon, 4326),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    END IF;

    -- geo_events: records all geospatial events
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'geo_events'
    ) THEN
      CREATE TABLE public.geo_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id TEXT,
        customer_id UUID,
        event_type public.geo_event_type_enum NOT NULL DEFAULT 'entry',
        location geometry(Point, 4326),
        detected_at TIMESTAMPTZ DEFAULT now(),
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    ELSE
      -- Add location column if it doesn't exist
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'geo_events' AND column_name = 'location'
      ) THEN
        ALTER TABLE public.geo_events ADD COLUMN location geometry(Point, 4326);
      END IF;
    END IF;

    -- analytics_geo_aggregates: pre-aggregated geo analytics
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'analytics_geo_aggregates'
    ) THEN
      CREATE TABLE public.analytics_geo_aggregates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id TEXT,
        agg_date DATE NOT NULL,
        agg_hour INTEGER CHECK (agg_hour >= 0 AND agg_hour <= 23),
        event_type TEXT,
        event_count INTEGER DEFAULT 0,
        geom geometry(Point, 4326),
        created_at TIMESTAMPTZ DEFAULT now()
      );
    ELSE
      -- Add geom column if it doesn't exist
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'analytics_geo_aggregates' AND column_name = 'geom'
      ) THEN
        ALTER TABLE public.analytics_geo_aggregates ADD COLUMN geom geometry(Point, 4326);
      END IF;
    END IF;

    RAISE NOTICE 'PostGIS tables created/updated successfully.';
  ELSE
    RAISE NOTICE 'PostGIS geometry type not available. Creating tables without geometry columns.';

    -- Fallback: create tables without geometry columns
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'business_locations'
    ) THEN
      CREATE TABLE public.business_locations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id TEXT,
        address_normalized TEXT,
        address_references TEXT,
        latitude NUMERIC(10,6),
        longitude NUMERIC(10,6),
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'business_geofences'
    ) THEN
      CREATE TABLE public.business_geofences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id TEXT,
        name TEXT NOT NULL DEFAULT 'Geofence principal',
        geofence_type TEXT NOT NULL DEFAULT 'circle',
        radius_meters INTEGER DEFAULT 200,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'geo_events'
    ) THEN
      CREATE TABLE public.geo_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id TEXT,
        customer_id UUID,
        event_type TEXT NOT NULL DEFAULT 'entry',
        detected_at TIMESTAMPTZ DEFAULT now(),
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'analytics_geo_aggregates'
    ) THEN
      CREATE TABLE public.analytics_geo_aggregates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id TEXT,
        agg_date DATE NOT NULL,
        agg_hour INTEGER CHECK (agg_hour >= 0 AND agg_hour <= 23),
        event_type TEXT,
        event_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    END IF;
  END IF;
END $$;

-- ============================================================
-- 4. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_business_locations_business_id ON public.business_locations(business_id);
CREATE INDEX IF NOT EXISTS idx_business_geofences_business_id ON public.business_geofences(business_id);
CREATE INDEX IF NOT EXISTS idx_geo_events_business_id ON public.geo_events(business_id);
CREATE INDEX IF NOT EXISTS idx_geo_events_customer_id ON public.geo_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_geo_events_event_type ON public.geo_events(event_type);
CREATE INDEX IF NOT EXISTS idx_geo_events_detected_at ON public.geo_events(detected_at);
CREATE INDEX IF NOT EXISTS idx_analytics_geo_agg_business_id ON public.analytics_geo_aggregates(business_id);
CREATE INDEX IF NOT EXISTS idx_analytics_geo_agg_date ON public.analytics_geo_aggregates(agg_date);

-- GIST indexes (only if geometry columns exist)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'business_locations' AND column_name = 'location'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE tablename = 'business_locations' AND indexname = 'idx_business_locations_location'
    ) THEN
      CREATE INDEX idx_business_locations_location ON public.business_locations USING GIST(location);
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'business_geofences' AND column_name = 'center'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE tablename = 'business_geofences' AND indexname = 'idx_business_geofences_center'
    ) THEN
      CREATE INDEX idx_business_geofences_center ON public.business_geofences USING GIST(center);
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'business_geofences' AND column_name = 'polygon'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE tablename = 'business_geofences' AND indexname = 'idx_business_geofences_polygon'
    ) THEN
      CREATE INDEX idx_business_geofences_polygon ON public.business_geofences USING GIST(polygon);
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'geo_events' AND column_name = 'location'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE tablename = 'geo_events' AND indexname = 'idx_geo_events_location'
    ) THEN
      CREATE INDEX idx_geo_events_location ON public.geo_events USING GIST(location);
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'analytics_geo_aggregates' AND column_name = 'geom'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE tablename = 'analytics_geo_aggregates' AND indexname = 'idx_analytics_geo_agg_geom'
    ) THEN
      CREATE INDEX idx_analytics_geo_agg_geom ON public.analytics_geo_aggregates USING GIST(geom);
    END IF;
  END IF;
END $$;

-- ============================================================
-- 5. POSTGIS FUNCTIONS (only if PostGIS is available)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'geometry') THEN

    -- fn_point_in_geofence
    EXECUTE $fn$
      CREATE OR REPLACE FUNCTION public.fn_point_in_geofence(
        p_point geometry,
        p_business_id TEXT
      )
      RETURNS BOOLEAN
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $func$
      DECLARE
        v_result BOOLEAN := false;
      BEGIN
        SELECT EXISTS (
          SELECT 1
          FROM public.business_geofences bg
          WHERE bg.business_id = p_business_id
            AND bg.is_active = true
            AND (
              (bg.geofence_type = 'circle' AND bg.center IS NOT NULL AND bg.radius_meters IS NOT NULL
                AND ST_DWithin(bg.center::geography, p_point::geography, bg.radius_meters))
              OR
              (bg.geofence_type = 'polygon' AND bg.polygon IS NOT NULL
                AND ST_Intersects(bg.polygon, p_point))
            )
        ) INTO v_result;
        RETURN v_result;
      END;
      $func$
    $fn$;

    -- fn_businesses_within_radius
    EXECUTE $fn$
      CREATE OR REPLACE FUNCTION public.fn_businesses_within_radius(
        p_lat FLOAT,
        p_lng FLOAT,
        p_radius_meters FLOAT
      )
      RETURNS TABLE(
        business_id TEXT,
        distance_meters FLOAT
      )
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $func$
      BEGIN
        RETURN QUERY
        SELECT
          bl.business_id,
          ST_Distance(
            bl.location::geography,
            ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
          ) AS distance_meters
        FROM public.business_locations bl
        WHERE bl.location IS NOT NULL
          AND ST_DWithin(
            bl.location::geography,
            ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
            p_radius_meters
          )
        ORDER BY distance_meters ASC;
      END;
      $func$
    $fn$;

    -- fn_geofence_events_geojson
    EXECUTE $fn$
      CREATE OR REPLACE FUNCTION public.fn_geofence_events_geojson(
        p_business_id TEXT,
        p_from TIMESTAMPTZ,
        p_to TIMESTAMPTZ
      )
      RETURNS JSON
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $func$
      DECLARE
        v_result JSON;
      BEGIN
        SELECT json_build_object(
          'type', 'FeatureCollection',
          'features', COALESCE(
            json_agg(
              json_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(ge.location)::json,
                'properties', json_build_object(
                  'id', ge.id,
                  'event_type', ge.event_type,
                  'detected_at', ge.detected_at,
                  'customer_id', ge.customer_id,
                  'metadata', ge.metadata
                )
              )
            ),
            '[]'::json
          )
        )
        INTO v_result
        FROM public.geo_events ge
        WHERE ge.business_id = p_business_id
          AND ge.detected_at >= p_from
          AND ge.detected_at <= p_to
          AND ge.location IS NOT NULL;

        RETURN v_result;
      END;
      $func$
    $fn$;

    RAISE NOTICE 'PostGIS functions created successfully.';
  ELSE
    RAISE NOTICE 'PostGIS not available. Skipping spatial functions.';
  END IF;
END $$;

-- ============================================================
-- 6. TRIGGER FUNCTIONS
-- ============================================================

-- Trigger: auto-calculate geometry(Point) from lat/lng on business_locations
CREATE OR REPLACE FUNCTION public.trg_business_locations_set_geometry()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only set geometry if PostGIS is available and location column exists
  BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
      NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    END IF;
  EXCEPTION
    WHEN undefined_column THEN
      -- location column doesn't exist yet, skip
      NULL;
    WHEN OTHERS THEN
      -- PostGIS not available, skip
      NULL;
  END;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_business_location_geometry ON public.business_locations;
CREATE TRIGGER trg_set_business_location_geometry
  BEFORE INSERT OR UPDATE ON public.business_locations
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_business_locations_set_geometry();

-- Trigger: auto-set updated_at on geofences
CREATE OR REPLACE FUNCTION public.trg_business_geofences_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_business_geofences_updated_at ON public.business_geofences;
CREATE TRIGGER trg_business_geofences_updated_at
  BEFORE UPDATE ON public.business_geofences
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_business_geofences_updated_at();

-- ============================================================
-- 7. ENABLE RLS
-- ============================================================
ALTER TABLE public.business_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geo_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_geo_aggregates ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8. RLS POLICIES
-- ============================================================

-- business_locations policies
DROP POLICY IF EXISTS "business_locations_owner_all" ON public.business_locations;
CREATE POLICY "business_locations_owner_all"
  ON public.business_locations
  FOR ALL
  TO authenticated
  USING (
    business_id IN (
      SELECT bs.business_id FROM public.business_settings bs WHERE bs.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT bs.business_id FROM public.business_settings bs WHERE bs.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "business_locations_public_read" ON public.business_locations;
CREATE POLICY "business_locations_public_read"
  ON public.business_locations
  FOR SELECT
  TO public
  USING (true);

-- business_geofences policies
DROP POLICY IF EXISTS "business_geofences_owner_all" ON public.business_geofences;
CREATE POLICY "business_geofences_owner_all"
  ON public.business_geofences
  FOR ALL
  TO authenticated
  USING (
    business_id IN (
      SELECT bs.business_id FROM public.business_settings bs WHERE bs.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT bs.business_id FROM public.business_settings bs WHERE bs.owner_id = auth.uid()
    )
  );

-- geo_events policies
DROP POLICY IF EXISTS "geo_events_owner_read" ON public.geo_events;
CREATE POLICY "geo_events_owner_read"
  ON public.geo_events
  FOR SELECT
  TO authenticated
  USING (
    business_id IN (
      SELECT bs.business_id FROM public.business_settings bs WHERE bs.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "geo_events_insert_authenticated" ON public.geo_events;
CREATE POLICY "geo_events_insert_authenticated"
  ON public.geo_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- analytics_geo_aggregates policies
DROP POLICY IF EXISTS "analytics_geo_agg_owner_read" ON public.analytics_geo_aggregates;
CREATE POLICY "analytics_geo_agg_owner_read"
  ON public.analytics_geo_aggregates
  FOR SELECT
  TO authenticated
  USING (
    business_id IN (
      SELECT bs.business_id FROM public.business_settings bs WHERE bs.owner_id = auth.uid()
    )
  );

-- ============================================================
-- 9. SEED DATA (CDMX realistic coordinates)
-- ============================================================
DO $$
DECLARE
  v_business_id TEXT;
  v_lat FLOAT;
  v_lng FLOAT;
  v_has_geometry BOOLEAN;
  i INTEGER;
BEGIN
  -- Check if geometry type is available
  SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'geometry') INTO v_has_geometry;

  -- Get first available business from business_settings
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'business_settings'
  ) THEN
    SELECT business_id INTO v_business_id FROM public.business_settings LIMIT 1;

    IF v_business_id IS NOT NULL THEN
      -- Insert sample business_location (CDMX - Condesa)
      IF NOT EXISTS (
        SELECT 1 FROM public.business_locations WHERE business_id = v_business_id LIMIT 1
      ) THEN
        INSERT INTO public.business_locations (
          id, business_id, address_normalized, address_references,
          latitude, longitude
        ) VALUES (
          gen_random_uuid(),
          v_business_id,
          'Av. Ámsterdam 123, Hipódromo Condesa, Cuauhtémoc, CDMX, 06170',
          'Entre Sonora y Laredo, frente al parque',
          19.4126,
          -99.1732
        );
      END IF;

      -- Insert sample business_geofence (circular 200m) - only if geometry available
      IF v_has_geometry AND NOT EXISTS (
        SELECT 1 FROM public.business_geofences WHERE business_id = v_business_id LIMIT 1
      ) THEN
        INSERT INTO public.business_geofences (
          id, business_id, name, geofence_type,
          center, radius_meters, is_active
        ) VALUES (
          gen_random_uuid(),
          v_business_id,
          'Zona principal',
          'circle',
          ST_SetSRID(ST_MakePoint(-99.1732, 19.4126), 4326),
          200,
          true
        );
      ELSIF NOT v_has_geometry AND NOT EXISTS (
        SELECT 1 FROM public.business_geofences WHERE business_id = v_business_id LIMIT 1
      ) THEN
        INSERT INTO public.business_geofences (
          id, business_id, name, geofence_type,
          radius_meters, is_active
        ) VALUES (
          gen_random_uuid(),
          v_business_id,
          'Zona principal',
          'circle',
          200,
          true
        );
      END IF;

      -- Insert 50 geo_events with realistic CDMX coordinates
      IF NOT EXISTS (SELECT 1 FROM public.geo_events WHERE business_id = v_business_id LIMIT 1) THEN
        FOR i IN 1..50 LOOP
          v_lat := 19.3 + (random() * 0.2);
          v_lng := -99.2 + (random() * 0.2);

          IF v_has_geometry THEN
            INSERT INTO public.geo_events (
              id, business_id, event_type, location, detected_at, metadata
            ) VALUES (
              gen_random_uuid(),
              v_business_id,
              CASE (i % 6)
                WHEN 0 THEN 'entry'::public.geo_event_type_enum
                WHEN 1 THEN 'exit'::public.geo_event_type_enum
                WHEN 2 THEN 'checkin_auto'::public.geo_event_type_enum
                WHEN 3 THEN 'notification_sent'::public.geo_event_type_enum
                WHEN 4 THEN 'notification_opened'::public.geo_event_type_enum
                ELSE 'conversion'::public.geo_event_type_enum
              END,
              ST_SetSRID(ST_MakePoint(v_lng, v_lat), 4326),
              now() - (random() * interval '30 days'),
              jsonb_build_object('source', 'seed_data', 'index', i)
            );
          ELSE
            INSERT INTO public.geo_events (
              id, business_id, event_type, detected_at, metadata
            ) VALUES (
              gen_random_uuid(),
              v_business_id,
              CASE (i % 6)
                WHEN 0 THEN 'entry'
                WHEN 1 THEN 'exit'
                WHEN 2 THEN 'checkin_auto'
                WHEN 3 THEN 'notification_sent'
                WHEN 4 THEN 'notification_opened'
                ELSE 'conversion'
              END,
              now() - (random() * interval '30 days'),
              jsonb_build_object('source', 'seed_data', 'index', i)
            );
          END IF;
        END LOOP;
      END IF;

      RAISE NOTICE 'Geospatial seed data inserted for business %', v_business_id;
    ELSE
      RAISE NOTICE 'No businesses found in business_settings. Skipping geospatial seed data.';
    END IF;
  ELSE
    RAISE NOTICE 'business_settings table does not exist. Skipping geospatial seed data.';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Geospatial seed data failed: %', SQLERRM;
END $$;
