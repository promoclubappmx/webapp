-- Campaign Builder Extended Migration
-- Adds extended fields to existing campaign tables and creates new ones

-- Add extended columns to campaign_objectives if they don't exist
ALTER TABLE public.campaign_objectives
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE,
  ADD COLUMN IF NOT EXISTS budget NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS category_tag TEXT,
  ADD COLUMN IF NOT EXISTS ab_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS control_group_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS control_group_percent INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS goal_target INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS goal_current INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Add status column if not exists (campaign lifecycle)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'campaign_objectives' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.campaign_objectives ADD COLUMN status TEXT DEFAULT 'draft';
  END IF;
END $$;

-- Add extended columns to campaign_sequences if they don't exist
ALTER TABLE public.campaign_sequences
  ADD COLUMN IF NOT EXISTS message TEXT,
  ADD COLUMN IF NOT EXISTS timing_type TEXT DEFAULT 'immediate',
  ADD COLUMN IF NOT EXISTS wait_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS wait_action TEXT,
  ADD COLUMN IF NOT EXISTS wait_date DATE,
  ADD COLUMN IF NOT EXISTS branch_yes TEXT,
  ADD COLUMN IF NOT EXISTS branch_no TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Add extended columns to campaign_ab_tests if they don't exist
ALTER TABLE public.campaign_ab_tests
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS discount_value TEXT,
  ADD COLUMN IF NOT EXISTS cta_text TEXT,
  ADD COLUMN IF NOT EXISTS audience_split TEXT DEFAULT '50-50',
  ADD COLUMN IF NOT EXISTS test_duration_days INTEGER DEFAULT 7,
  ADD COLUMN IF NOT EXISTS impressions INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS opens INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS redemptions INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS visits INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revenue NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_winner BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Create campaign_audience_filters table
CREATE TABLE IF NOT EXISTS public.campaign_audience_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT NOT NULL,
  filter_category TEXT NOT NULL,
  filter_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_campaign_audience_filters_campaign_id
  ON public.campaign_audience_filters(campaign_id);

-- Create campaign_audience_templates table
CREATE TABLE IF NOT EXISTS public.campaign_audience_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '[]',
  estimated_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create campaign_converted_users table for dashboard
CREATE TABLE IF NOT EXISTS public.campaign_converted_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT NOT NULL,
  user_name TEXT,
  conversion_date DATE,
  step_name TEXT,
  conversion_value NUMERIC(12,2) DEFAULT 0,
  user_type TEXT DEFAULT 'nuevo',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_campaign_converted_users_campaign_id
  ON public.campaign_converted_users(campaign_id);

-- Enable RLS on new tables
ALTER TABLE public.campaign_audience_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_audience_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_converted_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaign_audience_filters
DROP POLICY IF EXISTS "open_access_campaign_audience_filters" ON public.campaign_audience_filters;
CREATE POLICY "open_access_campaign_audience_filters"
  ON public.campaign_audience_filters FOR ALL TO public USING (true) WITH CHECK (true);

-- RLS Policies for campaign_audience_templates
DROP POLICY IF EXISTS "open_access_campaign_audience_templates" ON public.campaign_audience_templates;
CREATE POLICY "open_access_campaign_audience_templates"
  ON public.campaign_audience_templates FOR ALL TO public USING (true) WITH CHECK (true);

-- RLS Policies for campaign_converted_users
DROP POLICY IF EXISTS "open_access_campaign_converted_users" ON public.campaign_converted_users;
CREATE POLICY "open_access_campaign_converted_users"
  ON public.campaign_converted_users FOR ALL TO public USING (true) WITH CHECK (true);

-- Update trigger for campaign_objectives
CREATE OR REPLACE FUNCTION public.update_campaign_objectives_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS campaign_objectives_updated_at ON public.campaign_objectives;
CREATE TRIGGER campaign_objectives_updated_at
  BEFORE UPDATE ON public.campaign_objectives
  FOR EACH ROW
  EXECUTE FUNCTION public.update_campaign_objectives_updated_at();

-- Mock data for audience templates
DO $$
BEGIN
  INSERT INTO public.campaign_audience_templates (name, filters, estimated_count)
  VALUES
    ('Mis VIPs dormidos', '["oro", "dormidos_60d"]'::jsonb, 42),
    ('Zona Centro sin visita', '["radio_1km", "nunca_visitaron"]'::jsonb, 280),
    ('Clientes con puntos', '["puntos_sin_canjear", "recurrentes_3"]'::jsonb, 195)
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Mock data insertion skipped: %', SQLERRM;
END $$;
