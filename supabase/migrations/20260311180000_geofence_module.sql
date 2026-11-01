-- Geofence Module Migration
-- Timestamp: 20260311180000

-- 1. Types
DROP TYPE IF EXISTS public.geofence_event_type CASCADE;
CREATE TYPE public.geofence_event_type AS ENUM ('entrada', 'salida', 'checkin_auto');

DROP TYPE IF EXISTS public.geofence_notification_type CASCADE;
CREATE TYPE public.geofence_notification_type AS ENUM ('welcome', 'farewell');

DROP TYPE IF EXISTS public.geofence_action_result CASCADE;
CREATE TYPE public.geofence_action_result AS ENUM ('sent', 'opened', 'converted', 'not_sent_limit', 'not_sent_schedule', 'pending');

-- 2. Tables
CREATE TABLE IF NOT EXISTS public.geofence_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID,
  radius_meters INTEGER NOT NULL DEFAULT 200,
  is_active BOOLEAN NOT NULL DEFAULT true,
  checkin_radius INTEGER DEFAULT 100,
  geofence_type TEXT DEFAULT 'circle',
  actions JSONB DEFAULT '{}'::jsonb,
  schedule JSONB DEFAULT '{"start_hour": 8, "end_hour": 22, "active_days": [0,1,2,3,4,5,6]}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.geofence_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID,
  notification_type public.geofence_notification_type NOT NULL DEFAULT 'welcome',
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  cta_text TEXT DEFAULT 'Ver oferta',
  sound_enabled BOOLEAN DEFAULT true,
  variant_b JSONB DEFAULT NULL,
  ab_test_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.geofence_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID,
  customer_id UUID,
  customer_name TEXT DEFAULT 'Anónimo',
  event_type public.geofence_event_type NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  action_triggered TEXT DEFAULT NULL,
  result public.geofence_action_result DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS public.geofence_ab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID,
  variant TEXT NOT NULL,
  sent INTEGER DEFAULT 0,
  opened INTEGER DEFAULT 0,
  converted INTEGER DEFAULT 0,
  period_start TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  period_end TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_geofence_config_business_id ON public.geofence_config(business_id);
CREATE INDEX IF NOT EXISTS idx_geofence_events_business_id ON public.geofence_events(business_id);
CREATE INDEX IF NOT EXISTS idx_geofence_events_detected_at ON public.geofence_events(detected_at);
CREATE INDEX IF NOT EXISTS idx_geofence_notifications_business_id ON public.geofence_notifications(business_id);
CREATE INDEX IF NOT EXISTS idx_geofence_ab_results_business_id ON public.geofence_ab_results(business_id);

-- 4. Enable RLS
ALTER TABLE public.geofence_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofence_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofence_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofence_ab_results ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "geofence_config_open_access" ON public.geofence_config;
CREATE POLICY "geofence_config_open_access" ON public.geofence_config FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "geofence_notifications_open_access" ON public.geofence_notifications;
CREATE POLICY "geofence_notifications_open_access" ON public.geofence_notifications FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "geofence_events_open_access" ON public.geofence_events;
CREATE POLICY "geofence_events_open_access" ON public.geofence_events FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "geofence_ab_results_open_access" ON public.geofence_ab_results;
CREATE POLICY "geofence_ab_results_open_access" ON public.geofence_ab_results FOR ALL TO public USING (true) WITH CHECK (true);

-- 6. Mock Data
DO $$
DECLARE
  demo_business_id UUID := gen_random_uuid();
  demo_config_id UUID := gen_random_uuid();
  demo_notif_welcome_id UUID := gen_random_uuid();
  demo_notif_farewell_id UUID := gen_random_uuid();
BEGIN
  -- Geofence config
  INSERT INTO public.geofence_config (id, business_id, radius_meters, is_active, checkin_radius, geofence_type, actions, schedule)
  VALUES (
    demo_config_id,
    demo_business_id,
    200,
    true,
    100,
    'circle',
    jsonb_build_object(
      'notify_entry', true,
      'notify_exit', false,
      'auto_checkin', false,
      'review_trigger', false,
      'entry_audience', 'all',
      'exit_delay', 'immediate'
    ),
    jsonb_build_object(
      'start_hour', 8,
      'end_hour', 22,
      'active_days', ARRAY[0,1,2,3,4,5,6]
    )
  ) ON CONFLICT (id) DO NOTHING;

  -- Welcome notification
  INSERT INTO public.geofence_notifications (id, business_id, notification_type, title, body, cta_text, sound_enabled, ab_test_enabled, variant_b)
  VALUES (
    demo_notif_welcome_id,
    demo_business_id,
    'welcome',
    '¡Hola! Estás cerca de Café Aroma',
    'Tenemos una oferta especial para ti hoy 🎁',
    'Ver oferta',
    true,
    true,
    jsonb_build_object(
      'title', '¿Ya pasaste por Café Aroma hoy? ☕',
      'body', 'Tu bebida favorita te está esperando. 20% OFF solo hoy.',
      'cta_text', 'Ver descuento'
    )
  ) ON CONFLICT (id) DO NOTHING;

  -- Farewell notification
  INSERT INTO public.geofence_notifications (id, business_id, notification_type, title, body, cta_text, sound_enabled)
  VALUES (
    demo_notif_farewell_id,
    demo_business_id,
    'farewell',
    '¿Ya te vas? Vuelve pronto 👋',
    'Te dejamos un cupón para tu próxima visita',
    'Ver cupón',
    true
  ) ON CONFLICT (id) DO NOTHING;

  -- Geofence events (12 realistic events)
  INSERT INTO public.geofence_events (id, business_id, customer_name, event_type, detected_at, action_triggered, result) VALUES
    (gen_random_uuid(), demo_business_id, 'Carlos M.', 'entrada', NOW() - INTERVAL '2 hours 28 minutes', 'Notificación enviada', 'opened'),
    (gen_random_uuid(), demo_business_id, 'Ana R.', 'salida', NOW() - INTERVAL '2 hours 42 minutes', 'Notificación enviada', 'converted'),
    (gen_random_uuid(), demo_business_id, 'Miguel T.', 'checkin_auto', NOW() - INTERVAL '3 hours 5 minutes', 'Check-in acreditado', 'converted'),
    (gen_random_uuid(), demo_business_id, 'Anónimo', 'entrada', NOW() - INTERVAL '3 hours 19 minutes', 'No enviada (límite diario)', 'pending'),
    (gen_random_uuid(), demo_business_id, 'Laura G.', 'entrada', NOW() - INTERVAL '3 hours 32 minutes', 'Notificación enviada', 'not_sent_limit'),
    (gen_random_uuid(), demo_business_id, 'Roberto S.', 'salida', NOW() - INTERVAL '3 hours 50 minutes', 'No enviada (fuera de horario)', 'pending'),
    (gen_random_uuid(), demo_business_id, 'Diana F.', 'checkin_auto', NOW() - INTERVAL '4 hours 2 minutes', 'Check-in acreditado', 'converted'),
    (gen_random_uuid(), demo_business_id, 'Pedro L.', 'entrada', NOW() - INTERVAL '4 hours 16 minutes', 'Notificación enviada', 'opened'),
    (gen_random_uuid(), demo_business_id, 'Sofía M.', 'salida', NOW() - INTERVAL '4 hours 30 minutes', 'Notificación enviada', 'converted'),
    (gen_random_uuid(), demo_business_id, 'Anónimo', 'entrada', NOW() - INTERVAL '4 hours 45 minutes', 'Notificación enviada', 'not_sent_limit'),
    (gen_random_uuid(), demo_business_id, 'Jorge H.', 'checkin_auto', NOW() - INTERVAL '5 hours 8 minutes', 'Check-in acreditado', 'converted'),
    (gen_random_uuid(), demo_business_id, 'Valeria C.', 'entrada', NOW() - INTERVAL '5 hours 22 minutes', 'No enviada (límite diario)', 'pending')
  ON CONFLICT (id) DO NOTHING;

  -- A/B test results
  INSERT INTO public.geofence_ab_results (id, business_id, variant, sent, opened, converted, period_start, period_end) VALUES
    (gen_random_uuid(), demo_business_id, 'A', 144, 62, 21, NOW() - INTERVAL '5 days', NOW()),
    (gen_random_uuid(), demo_business_id, 'B', 143, 81, 40, NOW() - INTERVAL '5 days', NOW())
  ON CONFLICT (id) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Geofence mock data insertion failed: %', SQLERRM;
END $$;
