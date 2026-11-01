-- Audience Templates System Migration
-- Timestamp: 20260622200000

-- ─── TYPES ───────────────────────────────────────────────────────────────────
DROP TYPE IF EXISTS public.audience_template_category CASCADE;
CREATE TYPE public.audience_template_category AS ENUM (
  'retencion',
  'adquisicion',
  'lealtad',
  'campanas',
  'personalizada'
);

DROP TYPE IF EXISTS public.audience_template_type CASCADE;
CREATE TYPE public.audience_template_type AS ENUM (
  'user_created',
  'promoclub_suggested'
);

DROP TYPE IF EXISTS public.audience_type CASCADE;
CREATE TYPE public.audience_type AS ENUM (
  'dynamic',
  'static'
);

-- ─── AUDIENCE TEMPLATES TABLE ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audience_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category public.audience_template_category DEFAULT 'personalizada'::public.audience_template_category,
  template_type public.audience_template_type DEFAULT 'user_created'::public.audience_template_type,
  audience_type public.audience_type DEFAULT 'dynamic'::public.audience_type,
  filters JSONB NOT NULL DEFAULT '[]'::jsonb,
  filter_groups JSONB DEFAULT '[]'::jsonb,
  estimated_count INTEGER DEFAULT 0,
  times_used INTEGER DEFAULT 0,
  avg_open_rate DECIMAL(5,2) DEFAULT 0,
  avg_conversion_rate DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  shared_with_locations JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ─── AUDIENCE TEMPLATE USAGE LOG ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audience_template_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.audience_templates(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  campaign_name TEXT,
  campaign_id UUID,
  used_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  result_open_rate DECIMAL(5,2),
  result_conversion_rate DECIMAL(5,2),
  audience_size INTEGER DEFAULT 0
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_audience_templates_business_id ON public.audience_templates(business_id);
CREATE INDEX IF NOT EXISTS idx_audience_templates_category ON public.audience_templates(category);
CREATE INDEX IF NOT EXISTS idx_audience_templates_template_type ON public.audience_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_audience_templates_is_active ON public.audience_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_audience_template_usage_template_id ON public.audience_template_usage(template_id);
CREATE INDEX IF NOT EXISTS idx_audience_template_usage_business_id ON public.audience_template_usage(business_id);

-- ─── UPDATED_AT TRIGGER ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_audience_templates_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audience_templates_updated_at ON public.audience_templates;
CREATE TRIGGER audience_templates_updated_at
  BEFORE UPDATE ON public.audience_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_audience_templates_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.audience_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audience_template_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_audience_templates" ON public.audience_templates;
CREATE POLICY "users_manage_own_audience_templates"
  ON public.audience_templates
  FOR ALL
  TO authenticated
  USING (business_id = auth.uid() OR template_type = 'promoclub_suggested'::public.audience_template_type)
  WITH CHECK (business_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_own_audience_template_usage" ON public.audience_template_usage;
CREATE POLICY "users_manage_own_audience_template_usage"
  ON public.audience_template_usage
  FOR ALL
  TO authenticated
  USING (business_id = auth.uid())
  WITH CHECK (business_id = auth.uid());

-- ─── SEED: PROMOCLUB SUGGESTED TEMPLATES ─────────────────────────────────────
DO $$
BEGIN
  INSERT INTO public.audience_templates (
    id, business_id, name, description, category, template_type, audience_type,
    filters, estimated_count, times_used, avg_open_rate, avg_conversion_rate
  ) VALUES
    (
      gen_random_uuid(), NULL,
      'Clientes a punto de dormirse',
      'Sin visita 15-20 días pero históricamente frecuentes. Ideal para reactivación preventiva.',
      'retencion'::public.audience_template_category,
      'promoclub_suggested'::public.audience_template_type,
      'dynamic'::public.audience_type,
      '["en_riesgo_dormirse", "recurrentes_3"]'::jsonb,
      180, 0, 34.5, 18.2
    ),
    (
      gen_random_uuid(), NULL,
      'Máximo potencial de conversión',
      'Puntos para recompensa + push activo + nivel Bronce. El segmento más receptivo.',
      'lealtad'::public.audience_template_category,
      'promoclub_suggested'::public.audience_template_type,
      'dynamic'::public.audience_type,
      '["puntos_suficientes_recompensa", "push_habilitado", "bronce"]'::jsonb,
      95, 0, 48.3, 27.1
    ),
    (
      gen_random_uuid(), NULL,
      'Candidatos a subir de nivel',
      'Bronce a 2 visitas de Plata + activos en los últimos 30 días. Campaña de empujón.',
      'lealtad'::public.audience_template_category,
      'promoclub_suggested'::public.audience_template_type,
      'dynamic'::public.audience_type,
      '["bronce", "proximos_subir_nivel", "activos_7d"]'::jsonb,
      120, 0, 41.7, 22.8
    ),
    (
      gen_random_uuid(), NULL,
      'VIPs dormidos con puntos',
      'Clientes Oro o Plata sin visita 30+ días que tienen puntos acumulados sin canjear.',
      'retencion'::public.audience_template_category,
      'promoclub_suggested'::public.audience_template_type,
      'dynamic'::public.audience_type,
      '["oro", "dormidos_30d", "puntos_sin_canjear"]'::jsonb,
      42, 0, 52.1, 31.4
    ),
    (
      gen_random_uuid(), NULL,
      'Cumpleaños próximos con push activo',
      'Clientes con cumpleaños en los próximos 7 días y notificaciones habilitadas.',
      'campanas'::public.audience_template_category,
      'promoclub_suggested'::public.audience_template_type,
      'dynamic'::public.audience_type,
      '["cumple_proximos_7d", "push_habilitado"]'::jsonb,
      28, 0, 67.3, 44.2
    ),
    (
      gen_random_uuid(), NULL,
      'Nuevos clientes esta semana',
      'Primera visita en los últimos 7 días. Momento ideal para bienvenida inmediata.',
      'adquisicion'::public.audience_template_category,
      'promoclub_suggested'::public.audience_template_type,
      'dynamic'::public.audience_type,
      '["primera_visita_semana"]'::jsonb,
      35, 0, 58.9, 38.6
    )
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Seed data insertion failed: %', SQLERRM;
END $$;
