-- Campaign Builder Extended Migration
-- Extends existing campaign tables with additional fields for full Campaign Builder

-- Add missing columns to campaign_objectives if they don't exist
ALTER TABLE public.campaign_objectives
  ADD COLUMN IF NOT EXISTS campaign_name TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE,
  ADD COLUMN IF NOT EXISTS budget NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS spent NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tag_categoria TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'borrador',
  ADD COLUMN IF NOT EXISTS meta INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS conversiones INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ab_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS control_group_enabled BOOLEAN DEFAULT false;

-- Add timing fields to campaign_sequences
ALTER TABLE public.campaign_sequences
  ADD COLUMN IF NOT EXISTS timing_tipo TEXT DEFAULT 'dias',
  ADD COLUMN IF NOT EXISTS timing_valor INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS accion_espera TEXT,
  ADD COLUMN IF NOT EXISTS fecha_especifica DATE,
  ADD COLUMN IF NOT EXISTS tiene_bifurcacion BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS bifurcacion_si TEXT,
  ADD COLUMN IF NOT EXISTS bifurcacion_no TEXT;

-- Add variant C and duration to campaign_ab_tests
ALTER TABLE public.campaign_ab_tests
  ADD COLUMN IF NOT EXISTS variant_c JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS duracion_dias INTEGER DEFAULT 7,
  ADD COLUMN IF NOT EXISTS winner_variant TEXT,
  ADD COLUMN IF NOT EXISTS winner_deployed BOOLEAN DEFAULT false;

-- Create audience templates table
CREATE TABLE IF NOT EXISTS public.campaign_audience_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID,
  nombre TEXT NOT NULL,
  filtros JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_campaign_audience_templates_business ON public.campaign_audience_templates(business_id);

ALTER TABLE public.campaign_audience_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "open_access_campaign_audience_templates" ON public.campaign_audience_templates;
CREATE POLICY "open_access_campaign_audience_templates" ON public.campaign_audience_templates
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
