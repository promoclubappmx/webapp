-- Migration: loyalty_planner_config
-- Stores per-user planner parameters for the Planificador de Costos tab
-- Defaults: $200 ticket promedio, 450 visitas/mes, 40% margen

CREATE TABLE IF NOT EXISTS public.loyalty_planner_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  avg_ticket NUMERIC(10,2) NOT NULL DEFAULT 200.00,
  monthly_visits INTEGER NOT NULL DEFAULT 450,
  margin_pct INTEGER NOT NULL DEFAULT 40,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT loyalty_planner_config_user_id_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_loyalty_planner_config_user_id ON public.loyalty_planner_config(user_id);

ALTER TABLE public.loyalty_planner_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_loyalty_planner_config" ON public.loyalty_planner_config;
CREATE POLICY "users_manage_own_loyalty_planner_config"
ON public.loyalty_planner_config
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_loyalty_planner_config_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_loyalty_planner_config_updated_at ON public.loyalty_planner_config;
CREATE TRIGGER trg_loyalty_planner_config_updated_at
  BEFORE UPDATE ON public.loyalty_planner_config
  FOR EACH ROW EXECUTE FUNCTION public.update_loyalty_planner_config_updated_at();
