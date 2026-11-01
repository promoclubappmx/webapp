-- ============================================================
-- PromoSpot: Edge Function Secrets Config & Backend Helpers
-- Timestamp: 20260414191000
-- ============================================================

-- ============================================================
-- APP CONFIG TABLE: stores non-secret runtime configuration
-- ============================================================

CREATE TABLE IF NOT EXISTS public.app_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_config_public_read" ON public.app_config;
CREATE POLICY "app_config_public_read"
ON public.app_config FOR SELECT
TO public
USING (is_public = true);

DROP POLICY IF EXISTS "app_config_auth_read" ON public.app_config;
CREATE POLICY "app_config_auth_read"
ON public.app_config FOR SELECT
TO authenticated
USING (true);

-- ============================================================
-- EDGE FUNCTION INVOCATION LOG
-- ============================================================

CREATE TABLE IF NOT EXISTS public.edge_function_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  action TEXT,
  business_id UUID,
  customer_id UUID,
  status TEXT DEFAULT 'success',
  duration_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_edge_function_logs_function ON public.edge_function_logs(function_name);
CREATE INDEX IF NOT EXISTS idx_edge_function_logs_business ON public.edge_function_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_edge_function_logs_created ON public.edge_function_logs(created_at DESC);

ALTER TABLE public.edge_function_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "edge_function_logs_auth_access" ON public.edge_function_logs;
CREATE POLICY "edge_function_logs_auth_access"
ON public.edge_function_logs FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================
-- WEBHOOK EVENTS TABLE: for external integrations
-- ============================================================

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  source TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON public.webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON public.webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created ON public.webhook_events(created_at DESC);

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "webhook_events_auth_access" ON public.webhook_events;
CREATE POLICY "webhook_events_auth_access"
ON public.webhook_events FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================
-- HELPER FUNCTION: Get business_id for authenticated user
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_business_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT business_id FROM public.user_profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- ============================================================
-- HELPER FUNCTION: Check if user owns a business
-- ============================================================

CREATE OR REPLACE FUNCTION public.user_owns_business(p_business_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND business_id = p_business_id
  );
$$;

-- ============================================================
-- HELPER FUNCTION: Check if user is staff of a business
-- ============================================================

CREATE OR REPLACE FUNCTION public.user_is_staff(p_business_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_members
    WHERE user_id = auth.uid() AND business_id = p_business_id AND is_active = true
  );
$$;

-- ============================================================
-- HELPER FUNCTION: Get customer_id for authenticated user in a business
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_customer_id(p_business_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM public.customer_profiles
  WHERE user_id = auth.uid() AND business_id = p_business_id
  LIMIT 1;
$$;

-- ============================================================
-- SEED: Default app configuration values
-- ============================================================

INSERT INTO public.app_config (config_key, config_value, description, is_public)
VALUES
  ('geofence_defaults', '{"default_radius_meters": 100, "max_radius_meters": 5000, "min_radius_meters": 50}', 'Default geofence configuration', true),
  ('checkin_defaults', '{"cooldown_minutes": 60, "max_daily_checkins": 3, "base_points": 10}', 'Default check-in configuration', true),
  ('loyalty_defaults', '{"points_per_peso": 1, "min_redemption_points": 100, "expiry_days": 365}', 'Default loyalty program configuration', true),
  ('notification_defaults', '{"max_per_day": 5, "quiet_hours_start": "22:00", "quiet_hours_end": "08:00"}', 'Default notification limits', true),
  ('order_defaults', '{"max_advance_days": 7, "min_order_amount": 50, "cancellation_window_minutes": 30}', 'Default order-ahead configuration', true),
  ('membership_defaults', '{"trial_days": 7, "grace_period_days": 3}', 'Default membership configuration', true),
  ('mapbox_config', '{"style": "mapbox://styles/mapbox/streets-v12", "default_zoom": 15, "max_zoom": 20}', 'Mapbox map configuration', true)
ON CONFLICT (config_key) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  updated_at = CURRENT_TIMESTAMP;
