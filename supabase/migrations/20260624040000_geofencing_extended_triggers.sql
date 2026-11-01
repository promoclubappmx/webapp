-- Migration: Geofencing Extended Triggers & Frequency Config
-- Adds new trigger types, extended frequency control, and geo-conquesting fields
-- Timestamp: 20260624040000

-- ============================================================
-- EXTEND geofence_triggers: add new trigger types
-- ============================================================

-- Add new trigger types to the check constraint (drop old, add new)
ALTER TABLE public.geofence_triggers
  DROP CONSTRAINT IF EXISTS geofence_triggers_trigger_type_check;

ALTER TABLE public.geofence_triggers
  ADD CONSTRAINT geofence_triggers_trigger_type_check
  CHECK (trigger_type IN (
    'entry',
    'dwell',
    'exit',
    'business_alert',
    'approach',
    'first_time',
    'return_inactivity',
    'low_traffic'
  ));

-- ============================================================
-- EXTEND geofence_frequency_config: add missing columns
-- ============================================================

ALTER TABLE public.geofence_frequency_config
  ADD COLUMN IF NOT EXISTS max_actions_per_week INTEGER DEFAULT 3
    CHECK (max_actions_per_week >= 1 AND max_actions_per_week <= 21),
  ADD COLUMN IF NOT EXISTS grace_period_hours INTEGER DEFAULT 4
    CHECK (grace_period_hours >= 0 AND grace_period_hours <= 72),
  ADD COLUMN IF NOT EXISTS cross_channel_exclusion BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS cross_channel_hours INTEGER DEFAULT 6
    CHECK (cross_channel_hours >= 0 AND cross_channel_hours <= 168),
  ADD COLUMN IF NOT EXISTS cross_channel_channels JSONB DEFAULT '["push"]'::jsonb;

-- ============================================================
-- EXTEND business_geofences: add geo-conquesting fields
-- ============================================================

ALTER TABLE public.business_geofences
  ADD COLUMN IF NOT EXISTS geo_conquesting_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS geo_conquesting_radius_meters INTEGER DEFAULT 100
    CHECK (geo_conquesting_radius_meters >= 50 AND geo_conquesting_radius_meters <= 1000),
  ADD COLUMN IF NOT EXISTS geo_conquesting_message TEXT;

-- ============================================================
-- EXTEND geofence_events: add new event types and metadata
-- ============================================================

ALTER TABLE public.geofence_events
  DROP CONSTRAINT IF EXISTS geofence_events_event_type_check;

-- geofence_events.event_type may be TEXT or ENUM depending on which migration ran first
-- Safely handle both cases
DO $$
BEGIN
  -- Check if event_type column is an enum type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'geofence_events'
      AND column_name = 'event_type'
      AND data_type = 'text'
  ) THEN
    -- It's TEXT, add a check constraint
    ALTER TABLE public.geofence_events
      ADD CONSTRAINT geofence_events_event_type_check
      CHECK (event_type IN (
        'entry', 'exit', 'dwell', 'checkin',
        'approach', 'first_time', 'return_inactivity', 'low_traffic',
        'business_alert',
        'entrada', 'salida', 'checkin_auto'
      ));
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not add event_type check constraint: %', SQLERRM;
END $$;

-- Add trigger_type column to geofence_events to track which trigger fired
ALTER TABLE public.geofence_events
  ADD COLUMN IF NOT EXISTS trigger_type TEXT,
  ADD COLUMN IF NOT EXISTS dwell_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- ============================================================
-- NEW TABLE: geofence_trigger_stats
-- Aggregated stats per trigger for analytics
-- ============================================================

CREATE TABLE IF NOT EXISTS public.geofence_trigger_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  geofence_id UUID REFERENCES public.business_geofences(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL,
  stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
  fires_count INTEGER DEFAULT 0,
  push_sent INTEGER DEFAULT 0,
  push_opened INTEGER DEFAULT 0,
  coupon_delivered INTEGER DEFAULT 0,
  coupon_redeemed INTEGER DEFAULT 0,
  checkin_auto INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_geofence_trigger_stats_unique
  ON public.geofence_trigger_stats(business_id, geofence_id, trigger_type, stat_date);

CREATE INDEX IF NOT EXISTS idx_geofence_trigger_stats_business_date
  ON public.geofence_trigger_stats(business_id, stat_date DESC);

-- ============================================================
-- NEW TABLE: geofence_hourly_stats
-- Hourly entry counts for the "Entradas por hora" chart
-- ============================================================

CREATE TABLE IF NOT EXISTS public.geofence_hourly_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  geofence_id UUID REFERENCES public.business_geofences(id) ON DELETE CASCADE,
  stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
  hour_of_day SMALLINT NOT NULL CHECK (hour_of_day >= 0 AND hour_of_day <= 23),
  entry_count INTEGER DEFAULT 0,
  unique_clients INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_geofence_hourly_stats_unique
  ON public.geofence_hourly_stats(business_id, geofence_id, stat_date, hour_of_day);

CREATE INDEX IF NOT EXISTS idx_geofence_hourly_stats_business_date
  ON public.geofence_hourly_stats(business_id, stat_date DESC);

-- ============================================================
-- RLS for new tables
-- ============================================================

ALTER TABLE public.geofence_trigger_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofence_hourly_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "trigger_stats_all" ON public.geofence_trigger_stats;
CREATE POLICY "trigger_stats_all" ON public.geofence_trigger_stats
  FOR ALL TO authenticated
  USING (business_id = auth.uid())
  WITH CHECK (business_id = auth.uid());

DROP POLICY IF EXISTS "hourly_stats_all" ON public.geofence_hourly_stats;
CREATE POLICY "hourly_stats_all" ON public.geofence_hourly_stats
  FOR ALL TO authenticated
  USING (business_id = auth.uid())
  WITH CHECK (business_id = auth.uid());

-- ============================================================
-- FUNCTION: upsert_geofence_hourly_stat
-- Called when a geofence entry event is recorded
-- ============================================================

CREATE OR REPLACE FUNCTION public.upsert_geofence_hourly_stat(
  p_business_id UUID,
  p_geofence_id UUID,
  p_stat_date DATE,
  p_hour_of_day SMALLINT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
  INSERT INTO public.geofence_hourly_stats
    (business_id, geofence_id, stat_date, hour_of_day, entry_count, unique_clients)
  VALUES
    (p_business_id, p_geofence_id, p_stat_date, p_hour_of_day, 1, 1)
  ON CONFLICT (business_id, geofence_id, stat_date, hour_of_day)
  DO UPDATE SET
    entry_count = public.geofence_hourly_stats.entry_count + 1,
    updated_at = NOW();
END;
$func$;

-- ============================================================
-- FUNCTION: upsert_geofence_trigger_stat
-- Called when a trigger fires
-- ============================================================

CREATE OR REPLACE FUNCTION public.upsert_geofence_trigger_stat(
  p_business_id UUID,
  p_geofence_id UUID,
  p_trigger_type TEXT,
  p_stat_date DATE,
  p_fires_count INTEGER DEFAULT 1,
  p_push_sent INTEGER DEFAULT 0,
  p_push_opened INTEGER DEFAULT 0,
  p_coupon_delivered INTEGER DEFAULT 0,
  p_coupon_redeemed INTEGER DEFAULT 0,
  p_checkin_auto INTEGER DEFAULT 0,
  p_conversion_count INTEGER DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
  INSERT INTO public.geofence_trigger_stats
    (business_id, geofence_id, trigger_type, stat_date,
     fires_count, push_sent, push_opened, coupon_delivered,
     coupon_redeemed, checkin_auto, conversion_count)
  VALUES
    (p_business_id, p_geofence_id, p_trigger_type, p_stat_date,
     p_fires_count, p_push_sent, p_push_opened, p_coupon_delivered,
     p_coupon_redeemed, p_checkin_auto, p_conversion_count)
  ON CONFLICT (business_id, geofence_id, trigger_type, stat_date)
  DO UPDATE SET
    fires_count = public.geofence_trigger_stats.fires_count + p_fires_count,
    push_sent = public.geofence_trigger_stats.push_sent + p_push_sent,
    push_opened = public.geofence_trigger_stats.push_opened + p_push_opened,
    coupon_delivered = public.geofence_trigger_stats.coupon_delivered + p_coupon_delivered,
    coupon_redeemed = public.geofence_trigger_stats.coupon_redeemed + p_coupon_redeemed,
    checkin_auto = public.geofence_trigger_stats.checkin_auto + p_checkin_auto,
    conversion_count = public.geofence_trigger_stats.conversion_count + p_conversion_count,
    updated_at = NOW();
END;
$func$;

-- ============================================================
-- MOCK DATA: seed demo stats for the authenticated demo business
-- ============================================================

DO $$
DECLARE
  v_business_id UUID;
  v_geofence_id UUID;
  v_day DATE;
  v_hour SMALLINT;
BEGIN
  -- Get first business_geofence if any exists
  SELECT business_id, id INTO v_business_id, v_geofence_id
  FROM public.business_geofences
  LIMIT 1;

  IF v_business_id IS NULL THEN
    RAISE NOTICE 'No business_geofences found. Skipping geofencing mock stats.';
    RETURN;
  END IF;

  -- Seed hourly stats for today and yesterday
  FOR v_day IN SELECT generate_series(CURRENT_DATE - 6, CURRENT_DATE, '1 day'::interval)::date LOOP
    FOR v_hour IN SELECT generate_series(6, 22) LOOP
      INSERT INTO public.geofence_hourly_stats
        (business_id, geofence_id, stat_date, hour_of_day, entry_count, unique_clients)
      VALUES (
        v_business_id,
        v_geofence_id,
        v_day,
        v_hour,
        CASE
          WHEN v_hour BETWEEN 12 AND 14 THEN floor(random() * 30 + 60)::int
          WHEN v_hour BETWEEN 8 AND 11 THEN floor(random() * 20 + 25)::int
          WHEN v_hour BETWEEN 15 AND 20 THEN floor(random() * 25 + 35)::int
          ELSE floor(random() * 10 + 5)::int
        END,
        CASE
          WHEN v_hour BETWEEN 12 AND 14 THEN floor(random() * 20 + 40)::int
          ELSE floor(random() * 10 + 5)::int
        END
      )
      ON CONFLICT (business_id, geofence_id, stat_date, hour_of_day) DO NOTHING;
    END LOOP;
  END LOOP;

  -- Seed trigger stats for last 30 days
  FOR v_day IN SELECT generate_series(CURRENT_DATE - 29, CURRENT_DATE, '1 day'::interval)::date LOOP
    INSERT INTO public.geofence_trigger_stats
      (business_id, geofence_id, trigger_type, stat_date,
       fires_count, push_sent, push_opened, coupon_delivered, coupon_redeemed, checkin_auto, conversion_count)
    VALUES
      (v_business_id, v_geofence_id, 'entry', v_day,
       floor(random()*40+20)::int, floor(random()*35+15)::int, floor(random()*20+5)::int,
       floor(random()*10+2)::int, floor(random()*5+1)::int, 0, floor(random()*8+2)::int),
      (v_business_id, v_geofence_id, 'exit', v_day,
       floor(random()*30+10)::int, floor(random()*25+8)::int, floor(random()*12+3)::int,
       floor(random()*15+5)::int, floor(random()*8+2)::int, 0, floor(random()*6+1)::int),
      (v_business_id, v_geofence_id, 'dwell', v_day,
       floor(random()*20+5)::int, floor(random()*15+3)::int, floor(random()*8+2)::int,
       0, 0, floor(random()*10+3)::int, floor(random()*5+1)::int)
    ON CONFLICT (business_id, geofence_id, trigger_type, stat_date) DO NOTHING;
  END LOOP;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Geofencing extended mock data failed: %', SQLERRM;
END $$;
