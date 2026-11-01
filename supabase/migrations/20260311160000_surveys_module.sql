-- Surveys Module Migration
-- Timestamp: 20260311160000

-- NPS Configuration per business
CREATE TABLE IF NOT EXISTS public.nps_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  branch_id UUID,
  is_active BOOLEAN DEFAULT true,
  trigger_post_checkin BOOLEAN DEFAULT true,
  trigger_post_checkin_delay VARCHAR(20) DEFAULT '30min',
  trigger_post_coupon BOOLEAN DEFAULT true,
  trigger_post_coupon_delay VARCHAR(20) DEFAULT 'inmediato',
  trigger_post_order BOOLEAN DEFAULT false,
  trigger_post_order_delay VARCHAR(20) DEFAULT '1hora',
  trigger_post_reservation BOOLEAN DEFAULT true,
  trigger_post_reservation_delay VARCHAR(20) DEFAULT '2horas',
  follow_up_question_active BOOLEAN DEFAULT true,
  incentive_active BOOLEAN DEFAULT false,
  incentive_type VARCHAR(20) DEFAULT 'points',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NPS Responses
CREATE TABLE IF NOT EXISTS public.nps_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  branch_id UUID,
  customer_id UUID,
  is_anonymous BOOLEAN DEFAULT false,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  segment VARCHAR(20) GENERATED ALWAYS AS (
    CASE
      WHEN score >= 9 THEN 'promotor'
      WHEN score >= 7 THEN 'neutro'
      ELSE 'detractor'
    END
  ) STORED,
  follow_up_comment TEXT,
  trigger_type VARCHAR(30) NOT NULL,
  trigger_reference VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Surveys (custom surveys)
CREATE TABLE IF NOT EXISTS public.surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  branch_id UUID,
  internal_name VARCHAR(200) NOT NULL,
  client_title VARCHAR(200),
  description TEXT,
  cover_image_url TEXT,
  anonymous_responses BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'archived')),
  audience_type VARCHAR(20) DEFAULT 'all',
  audience_segment_id UUID,
  start_date DATE,
  end_date DATE,
  max_responses INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Survey Triggers
CREATE TABLE IF NOT EXISTS public.survey_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  trigger_type VARCHAR(30) NOT NULL,
  delay VARCHAR(20) DEFAULT 'inmediato',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Survey Questions
CREATE TABLE IF NOT EXISTS public.survey_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('nps', 'stars', 'single', 'multi', 'open', 'scale', 'yesno')),
  question_text TEXT NOT NULL,
  is_required BOOLEAN DEFAULT true,
  options JSONB,
  scale_min INTEGER DEFAULT 1,
  scale_max INTEGER DEFAULT 10,
  min_label VARCHAR(100),
  max_label VARCHAR(100),
  char_limit VARCHAR(20),
  placeholder TEXT,
  yes_label VARCHAR(50) DEFAULT 'Sí',
  no_label VARCHAR(50) DEFAULT 'No',
  star_display VARCHAR(20) DEFAULT 'stars',
  conditional_logic JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Survey Responses (one per customer per survey event)
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  customer_id UUID,
  is_anonymous BOOLEAN DEFAULT false,
  trigger_type VARCHAR(30),
  trigger_reference VARCHAR(100),
  completed_at TIMESTAMPTZ,
  time_taken_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Survey Answer Items (one per question per response)
CREATE TABLE IF NOT EXISTS public.survey_answer_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.survey_questions(id) ON DELETE CASCADE,
  numeric_value NUMERIC,
  text_value TEXT,
  selected_options JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.nps_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nps_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_answer_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for authenticated users - owner context)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'nps_config' AND policyname = 'nps_config_auth') THEN
    CREATE POLICY nps_config_auth ON public.nps_config FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'nps_responses' AND policyname = 'nps_responses_auth') THEN
    CREATE POLICY nps_responses_auth ON public.nps_responses FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'surveys' AND policyname = 'surveys_auth') THEN
    CREATE POLICY surveys_auth ON public.surveys FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'survey_triggers' AND policyname = 'survey_triggers_auth') THEN
    CREATE POLICY survey_triggers_auth ON public.survey_triggers FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'survey_questions' AND policyname = 'survey_questions_auth') THEN
    CREATE POLICY survey_questions_auth ON public.survey_questions FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'survey_responses' AND policyname = 'survey_responses_auth') THEN
    CREATE POLICY survey_responses_auth ON public.survey_responses FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'survey_answer_items' AND policyname = 'survey_answer_items_auth') THEN
    CREATE POLICY survey_answer_items_auth ON public.survey_answer_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Mock data: NPS config
INSERT INTO public.nps_config (business_id, is_active, trigger_post_checkin, trigger_post_coupon, trigger_post_reservation)
SELECT gen_random_uuid(), true, true, true, true
WHERE NOT EXISTS (SELECT 1 FROM public.nps_config LIMIT 1);

-- Mock data: NPS responses (15 varied)
DO $$
DECLARE
  biz_id UUID := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.nps_responses LIMIT 1) THEN
    INSERT INTO public.nps_responses (business_id, score, follow_up_comment, trigger_type, is_anonymous) VALUES
    (biz_id, 9, 'Excelente servicio, siempre muy amables y el café es delicioso.', 'post_checkin', false),
    (biz_id, 3, 'El tiempo de espera fue muy largo, más de 20 minutos.', 'post_coupon', true),
    (biz_id, 8, '', 'post_reservation', false),
    (biz_id, 10, 'El mejor café de la zona, siempre vuelvo.', 'post_checkin', false),
    (biz_id, 7, 'Bueno en general, pero el empaque podría mejorar.', 'post_order', false),
    (biz_id, 2, 'Mala experiencia, el personal no fue amable.', 'post_checkin', true),
    (biz_id, 9, 'Muy buen servicio y ambiente agradable.', 'post_coupon', false),
    (biz_id, 10, 'Increíble lugar, lo recomiendo a todos.', 'post_checkin', false),
    (biz_id, 6, 'Regular, esperaba más dado el precio.', 'post_reservation', false),
    (biz_id, 9, 'Siempre una experiencia maravillosa.', 'post_checkin', false),
    (biz_id, 8, 'Buen café, atención rápida.', 'post_coupon', false),
    (biz_id, 5, 'Podría mejorar la variedad del menú.', 'post_checkin', true),
    (biz_id, 10, 'Perfecto en todo, volveré pronto.', 'post_order', false),
    (biz_id, 7, 'Buen lugar para trabajar.', 'post_checkin', false),
    (biz_id, 4, 'El WiFi falla con frecuencia.', 'post_reservation', false);
  END IF;
END $$;

-- Mock data: Surveys
DO $$
DECLARE
  biz_id UUID := gen_random_uuid();
  s1_id UUID := gen_random_uuid();
  s2_id UUID := gen_random_uuid();
  s3_id UUID := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.surveys LIMIT 1) THEN
    INSERT INTO public.surveys (id, business_id, internal_name, client_title, description, status) VALUES
    (s1_id, biz_id, 'Encuesta satisfacción post-visita', '¿Cómo fue tu experiencia?', 'Solo toma 1 minuto y nos ayuda a mejorar', 'active'),
    (s2_id, biz_id, 'Evaluación Order Ahead', '¿Cómo fue tu pedido?', 'Tu opinión mejora nuestro servicio', 'active'),
    (s3_id, biz_id, 'Feedback experiencia reservación', '¿Cómo fue tu visita?', 'Cuéntanos tu experiencia', 'active');

    INSERT INTO public.survey_triggers (survey_id, trigger_type, delay) VALUES
    (s1_id, 'post_checkin', '30min'),
    (s1_id, 'post_coupon', 'inmediato'),
    (s2_id, 'post_order', '1hora'),
    (s3_id, 'post_reservation', '2horas'),
    (s3_id, 'manual', 'inmediato');

    INSERT INTO public.survey_questions (survey_id, order_index, question_type, question_text, min_label, max_label) VALUES
    (s1_id, 0, 'nps', '¿Qué tan probable es que nos recomiendes a un amigo?', 'Nada probable', 'Muy probable'),
    (s1_id, 1, 'stars', '¿Cómo calificarías tu experiencia general?', NULL, NULL),
    (s1_id, 2, 'open', '¿Qué podríamos mejorar?', NULL, NULL),
    (s2_id, 0, 'stars', '¿Cómo calificarías la calidad de tu pedido?', NULL, NULL),
    (s2_id, 1, 'yesno', '¿Llegó a tiempo tu pedido?', NULL, NULL),
    (s3_id, 0, 'nps', '¿Recomendarías reservar con nosotros?', 'Nada probable', 'Muy probable'),
    (s3_id, 1, 'stars', '¿Cómo fue la atención durante tu visita?', NULL, NULL);
  END IF;
END $$;
