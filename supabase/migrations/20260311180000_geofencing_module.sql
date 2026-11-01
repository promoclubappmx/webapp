-- Geofencing Module Migration
-- Creates tables for geofence configuration, events, notifications, and A/B results

-- ============================================================
-- TABLE: geofence_config
-- ============================================================
CREATE TABLE IF NOT EXISTS public.geofence_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL,
  is_active boolean DEFAULT true,
  radius_meters integer DEFAULT 200,
  geofence_type text DEFAULT 'circle' CHECK (geofence_type IN ('circle', 'polygon')),
  checkin_radius integer DEFAULT 100,
  actions jsonb DEFAULT '{
    "welcome_notification": {
      "enabled": true,
      "link_promo": false,
      "promo_id": null,
      "link_coupon": false,
      "coupon_id": null,
      "audience": "all"
    },
    "farewell_notification": {
      "enabled": false,
      "delay": "immediate",
      "condition": "always",
      "link_coupon": false,
      "coupon_id": null,
      "audience": "all"
    },
    "auto_checkin": {
      "enabled": false,
      "radius": 100
    },
    "survey_trigger": {
      "enabled": false,
      "type": "review",
      "condition": "checkin",
      "delay": "30min"
    }
  }'::jsonb,
  schedule jsonb DEFAULT '{
    "start_hour": "08:00",
    "end_hour": "22:00",
    "active_days": [true, true, true, true, true, true, true]
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- TABLE: geofence_events
-- ============================================================
CREATE TABLE IF NOT EXISTS public.geofence_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL,
  customer_id uuid,
  event_type text NOT NULL CHECK (event_type IN ('entry', 'exit', 'checkin')),
  detected_at timestamptz DEFAULT now(),
  action_triggered text,
  result text CHECK (result IN ('opened', 'not_opened', 'converted', 'pending', 'limit_reached', 'out_of_hours')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- TABLE: geofence_notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS public.geofence_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL,
  notification_type text NOT NULL CHECK (notification_type IN ('welcome', 'farewell')),
  title text,
  body text,
  cta_text text DEFAULT 'Ver cupón',
  sound_enabled boolean DEFAULT true,
  variant_b jsonb,
  ab_test_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- TABLE: geofence_ab_results
-- ============================================================
CREATE TABLE IF NOT EXISTS public.geofence_ab_results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL,
  notification_id uuid REFERENCES public.geofence_notifications(id) ON DELETE CASCADE,
  variant text NOT NULL CHECK (variant IN ('A', 'B')),
  sent integer DEFAULT 0,
  opened integer DEFAULT 0,
  converted integer DEFAULT 0,
  period_start date,
  period_end date,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_geofence_config_business ON public.geofence_config(business_id);
CREATE INDEX IF NOT EXISTS idx_geofence_events_business ON public.geofence_events(business_id);
CREATE INDEX IF NOT EXISTS idx_geofence_events_detected_at ON public.geofence_events(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_geofence_notifications_business ON public.geofence_notifications(business_id);
CREATE INDEX IF NOT EXISTS idx_geofence_ab_results_business ON public.geofence_ab_results(business_id);

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE public.geofence_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofence_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofence_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofence_ab_results ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'geofence_config' AND policyname = 'geofence_config_select'
  ) THEN
    CREATE POLICY geofence_config_select ON public.geofence_config FOR SELECT USING (true);
    CREATE POLICY geofence_config_insert ON public.geofence_config FOR INSERT WITH CHECK (true);
    CREATE POLICY geofence_config_update ON public.geofence_config FOR UPDATE USING (true);
    CREATE POLICY geofence_config_delete ON public.geofence_config FOR DELETE USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'geofence_events' AND policyname = 'geofence_events_select'
  ) THEN
    CREATE POLICY geofence_events_select ON public.geofence_events FOR SELECT USING (true);
    CREATE POLICY geofence_events_insert ON public.geofence_events FOR INSERT WITH CHECK (true);
    CREATE POLICY geofence_events_update ON public.geofence_events FOR UPDATE USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'geofence_notifications' AND policyname = 'geofence_notifications_select'
  ) THEN
    CREATE POLICY geofence_notifications_select ON public.geofence_notifications FOR SELECT USING (true);
    CREATE POLICY geofence_notifications_insert ON public.geofence_notifications FOR INSERT WITH CHECK (true);
    CREATE POLICY geofence_notifications_update ON public.geofence_notifications FOR UPDATE USING (true);
    CREATE POLICY geofence_notifications_delete ON public.geofence_notifications FOR DELETE USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'geofence_ab_results' AND policyname = 'geofence_ab_results_select'
  ) THEN
    CREATE POLICY geofence_ab_results_select ON public.geofence_ab_results FOR SELECT USING (true);
    CREATE POLICY geofence_ab_results_insert ON public.geofence_ab_results FOR INSERT WITH CHECK (true);
    CREATE POLICY geofence_ab_results_update ON public.geofence_ab_results FOR UPDATE USING (true);
  END IF;
END $$;

-- ============================================================
-- MOCK DATA
-- ============================================================
DO $$
DECLARE
  v_business_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
  v_notif_id uuid;
BEGIN
  -- Geofence config
  IF NOT EXISTS (SELECT 1 FROM public.geofence_config WHERE business_id = v_business_id) THEN
    INSERT INTO public.geofence_config (business_id, is_active, radius_meters, geofence_type, checkin_radius)
    VALUES (v_business_id, true, 200, 'circle', 100);
  END IF;

  -- Welcome notification
  IF NOT EXISTS (SELECT 1 FROM public.geofence_notifications WHERE business_id = v_business_id AND notification_type = 'welcome') THEN
    INSERT INTO public.geofence_notifications (business_id, notification_type, title, body, ab_test_enabled, variant_b)
    VALUES (
      v_business_id,
      'welcome',
      '¡Hola! Estás cerca de Café Central',
      'Tenemos una oferta especial para ti hoy 🎁',
      true,
      '{"title": "¡Bienvenido! Café Central te espera", "body": "Entra y disfruta nuestras promociones exclusivas ☕"}'::jsonb
    )
    RETURNING id INTO v_notif_id;

    -- A/B results for welcome notification
    INSERT INTO public.geofence_ab_results (business_id, notification_id, variant, sent, opened, converted, period_start, period_end)
    VALUES
      (v_business_id, v_notif_id, 'A', 144, 69, 58, CURRENT_DATE - 7, CURRENT_DATE),
      (v_business_id, v_notif_id, 'B', 143, 74, 66, CURRENT_DATE - 7, CURRENT_DATE);
  END IF;

  -- Farewell notification
  IF NOT EXISTS (SELECT 1 FROM public.geofence_notifications WHERE business_id = v_business_id AND notification_type = 'farewell') THEN
    INSERT INTO public.geofence_notifications (business_id, notification_type, title, body, cta_text)
    VALUES (v_business_id, 'farewell', '¿Ya te vas? Vuelve pronto 👋', 'Te dejamos un cupón para tu próxima visita', 'Ver cupón');
  END IF;

  -- Mock geofence events (12 events over last 5 days)
  IF NOT EXISTS (SELECT 1 FROM public.geofence_events WHERE business_id = v_business_id LIMIT 1) THEN
    INSERT INTO public.geofence_events (business_id, customer_id, event_type, detected_at, action_triggered, result)
    VALUES
      (v_business_id, gen_random_uuid(), 'entry', now() - interval '10 minutes', 'Notificación enviada', 'opened'),
      (v_business_id, gen_random_uuid(), 'exit', now() - interval '22 minutes', 'Notificación enviada', 'not_opened'),
      (v_business_id, gen_random_uuid(), 'checkin', now() - interval '29 minutes', 'Check-in acreditado', 'converted'),
      (v_business_id, NULL, 'entry', now() - interval '35 minutes', 'No enviada (límite diario)', 'limit_reached'),
      (v_business_id, gen_random_uuid(), 'entry', now() - interval '42 minutes', 'Notificación enviada', 'converted'),
      (v_business_id, gen_random_uuid(), 'exit', now() - interval '50 minutes', 'No enviada (fuera de horario)', 'out_of_hours'),
      (v_business_id, gen_random_uuid(), 'entry', now() - interval '1 hour', 'Notificación enviada', 'opened'),
      (v_business_id, gen_random_uuid(), 'checkin', now() - interval '1 hour 12 minutes', 'Check-in acreditado', 'converted'),
      (v_business_id, gen_random_uuid(), 'exit', now() - interval '1 hour 20 minutes', 'Notificación enviada', 'not_opened'),
      (v_business_id, NULL, 'entry', now() - interval '1 hour 35 minutes', 'Notificación enviada', 'opened'),
      (v_business_id, gen_random_uuid(), 'entry', now() - interval '1 hour 47 minutes', 'Notificación enviada', 'converted'),
      (v_business_id, gen_random_uuid(), 'exit', now() - interval '2 hours', 'No enviada (límite diario)', 'limit_reached');
  END IF;
END $$;
