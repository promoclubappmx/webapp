-- Migration: access_logs table for login tracking
-- Timestamp: 20260420004500

CREATE TABLE IF NOT EXISTS public.access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    event_type TEXT NOT NULL DEFAULT 'login_success',
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON public.access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_email ON public.access_logs(email);
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON public.access_logs(created_at DESC);

ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_view_own_access_logs" ON public.access_logs;
CREATE POLICY "users_view_own_access_logs"
ON public.access_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "service_insert_access_logs" ON public.access_logs;
CREATE POLICY "service_insert_access_logs"
ON public.access_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "anon_insert_access_logs" ON public.access_logs;
CREATE POLICY "anon_insert_access_logs"
ON public.access_logs
FOR INSERT
TO anon
WITH CHECK (true);
