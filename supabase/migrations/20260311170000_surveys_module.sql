-- Surveys Module Migration
-- Tables: nps_config, nps_responses, surveys, survey_questions, survey_responses, survey_answer_items, survey_triggers

-- ============================================================
-- 1. ENUM TYPES
-- ============================================================

DROP TYPE IF EXISTS public.survey_status_type CASCADE;
CREATE TYPE public.survey_status_type AS ENUM ('active', 'draft', 'archived');

DROP TYPE IF EXISTS public.survey_trigger_type CASCADE;
CREATE TYPE public.survey_trigger_type AS ENUM ('post_checkin', 'post_coupon', 'post_order', 'post_reservation', 'manual');

DROP TYPE IF EXISTS public.question_type_enum CASCADE;
CREATE TYPE public.question_type_enum AS ENUM ('nps', 'stars', 'single', 'multi', 'open', 'scale', 'yesno');

DROP TYPE IF EXISTS public.nps_segment_type CASCADE;
CREATE TYPE public.nps_segment_type AS ENUM ('promoter', 'neutral', 'detractor');

-- ============================================================
-- 2. TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.nps_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    is_active BOOLEAN DEFAULT true,
    checkin_enabled BOOLEAN DEFAULT true,
    checkin_delay TEXT DEFAULT '30 min',
    coupon_enabled BOOLEAN DEFAULT true,
    coupon_delay TEXT DEFAULT 'Inmediato',
    order_enabled BOOLEAN DEFAULT false,
    order_delay TEXT DEFAULT '1 hora',
    reservation_enabled BOOLEAN DEFAULT true,
    reservation_delay TEXT DEFAULT '2 horas',
    follow_up_enabled BOOLEAN DEFAULT true,
    incentive_enabled BOOLEAN DEFAULT false,
    incentive_type TEXT DEFAULT 'points',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.nps_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    branch_id UUID,
    customer_name TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
    segment public.nps_segment_type,
    trigger_type public.survey_trigger_type,
    trigger_label TEXT,
    follow_up_comment TEXT,
    responded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    name TEXT NOT NULL,
    title TEXT,
    description TEXT,
    survey_status public.survey_status_type DEFAULT 'draft',
    is_anonymous BOOLEAN DEFAULT false,
    incentive_enabled BOOLEAN DEFAULT false,
    incentive_type TEXT DEFAULT 'points',
    thank_you_title TEXT DEFAULT '¡Gracias por tu opinión!',
    thank_you_message TEXT DEFAULT 'Tu feedback nos ayuda a mejorar cada día.',
    start_date DATE,
    end_date DATE,
    max_responses INTEGER,
    total_sent INTEGER DEFAULT 0,
    total_responded INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.survey_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    trigger_type public.survey_trigger_type NOT NULL,
    delay_config TEXT DEFAULT 'Inmediato',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.survey_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL DEFAULT 1,
    question_type public.question_type_enum NOT NULL,
    question_text TEXT NOT NULL,
    placeholder_text TEXT,
    is_required BOOLEAN DEFAULT false,
    options JSONB,
    scale_min INTEGER DEFAULT 1,
    scale_max INTEGER DEFAULT 10,
    char_limit INTEGER,
    conditional_logic JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    customer_name TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    trigger_type public.survey_trigger_type,
    trigger_label TEXT,
    completed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    time_taken_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.survey_answer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.survey_questions(id) ON DELETE CASCADE,
    numeric_value NUMERIC,
    text_value TEXT,
    selected_options JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_nps_config_business ON public.nps_config(business_id);
CREATE INDEX IF NOT EXISTS idx_nps_responses_business ON public.nps_responses(business_id);
CREATE INDEX IF NOT EXISTS idx_nps_responses_segment ON public.nps_responses(segment);
CREATE INDEX IF NOT EXISTS idx_surveys_business ON public.surveys(business_id);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON public.surveys(survey_status);
CREATE INDEX IF NOT EXISTS idx_survey_triggers_survey ON public.survey_triggers(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_questions_survey ON public.survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON public.survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_answer_items_response ON public.survey_answer_items(response_id);

-- ============================================================
-- 4. ENABLE RLS
-- ============================================================

ALTER TABLE public.nps_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nps_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_answer_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. RLS POLICIES (open access for preview mode)
-- ============================================================

DROP POLICY IF EXISTS "open_access_nps_config" ON public.nps_config;
CREATE POLICY "open_access_nps_config" ON public.nps_config FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "open_access_nps_responses" ON public.nps_responses;
CREATE POLICY "open_access_nps_responses" ON public.nps_responses FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "open_access_surveys" ON public.surveys;
CREATE POLICY "open_access_surveys" ON public.surveys FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "open_access_survey_triggers" ON public.survey_triggers;
CREATE POLICY "open_access_survey_triggers" ON public.survey_triggers FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "open_access_survey_questions" ON public.survey_questions;
CREATE POLICY "open_access_survey_questions" ON public.survey_questions FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "open_access_survey_responses" ON public.survey_responses;
CREATE POLICY "open_access_survey_responses" ON public.survey_responses FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "open_access_survey_answer_items" ON public.survey_answer_items;
CREATE POLICY "open_access_survey_answer_items" ON public.survey_answer_items FOR ALL TO public USING (true) WITH CHECK (true);

-- ============================================================
-- 6. MOCK DATA
-- ============================================================

DO $$
DECLARE
    biz_id UUID := gen_random_uuid();
    survey1_id UUID := gen_random_uuid();
    survey2_id UUID := gen_random_uuid();
    survey3_id UUID := gen_random_uuid();
    q1_id UUID := gen_random_uuid();
    q2_id UUID := gen_random_uuid();
    q3_id UUID := gen_random_uuid();
    q4_id UUID := gen_random_uuid();
    q5_id UUID := gen_random_uuid();
    resp1_id UUID := gen_random_uuid();
    resp2_id UUID := gen_random_uuid();
    resp3_id UUID := gen_random_uuid();
BEGIN

    -- NPS Config
    INSERT INTO public.nps_config (
        id, business_id, is_active, checkin_enabled, checkin_delay,
        coupon_enabled, coupon_delay, order_enabled, order_delay,
        reservation_enabled, reservation_delay, follow_up_enabled,
        incentive_enabled, incentive_type
    ) VALUES (
        gen_random_uuid(), biz_id, true, true, '30 min',
        true, 'Inmediato', false, '1 hora',
        true, '2 horas', true,
        false, 'points'
    ) ON CONFLICT (id) DO NOTHING;

    -- NPS Responses (15 varied)
    INSERT INTO public.nps_responses (id, business_id, customer_name, is_anonymous, score, segment, trigger_type, trigger_label, follow_up_comment)
    VALUES
        (gen_random_uuid(), biz_id, 'Carlos M.', false, 9, 'promoter', 'post_checkin', 'Check-in verificado', 'Excelente servicio, siempre muy amables.'),
        (gen_random_uuid(), biz_id, NULL, true, 3, 'detractor', 'post_coupon', 'Canje: Café gratis', 'El tiempo de espera fue muy largo.'),
        (gen_random_uuid(), biz_id, 'María L.', false, 10, 'promoter', 'post_checkin', 'Check-in verificado', 'Los recomendaría sin dudarlo.'),
        (gen_random_uuid(), biz_id, 'Roberto G.', false, 7, 'neutral', 'post_reservation', 'Post reservación', NULL),
        (gen_random_uuid(), biz_id, 'Ana P.', false, 2, 'detractor', 'post_order', 'Order Ahead #042', 'El pedido llegó incompleto y frío.'),
        (gen_random_uuid(), biz_id, 'Luis F.', false, 9, 'promoter', 'post_checkin', 'Check-in verificado', 'Siempre un placer visitar este lugar.'),
        (gen_random_uuid(), biz_id, 'Sofía R.', false, 8, 'neutral', 'post_coupon', 'Canje: Descuento 20%', NULL),
        (gen_random_uuid(), biz_id, NULL, true, 1, 'detractor', 'post_checkin', 'Check-in verificado', 'Pésima atención, no vuelvo.'),
        (gen_random_uuid(), biz_id, 'Diego H.', false, 10, 'promoter', 'post_reservation', 'Post reservación', 'La mejor experiencia que he tenido.'),
        (gen_random_uuid(), biz_id, 'Valentina C.', false, 6, 'detractor', 'post_order', 'Order Ahead #039', 'Podría mejorar la presentación.'),
        (gen_random_uuid(), biz_id, 'Miguel A.', false, 9, 'promoter', 'post_checkin', 'Check-in verificado', NULL),
        (gen_random_uuid(), biz_id, 'Laura B.', false, 8, 'neutral', 'post_coupon', 'Canje: Postre gratis', 'Buen servicio en general.'),
        (gen_random_uuid(), biz_id, 'Fernando S.', false, 10, 'promoter', 'post_checkin', 'Check-in verificado', 'Increíble lugar, lo recomiendo a todos.'),
        (gen_random_uuid(), biz_id, NULL, true, 4, 'detractor', 'post_reservation', 'Post reservación', 'La reservación no estaba registrada.'),
        (gen_random_uuid(), biz_id, 'Patricia M.', false, 9, 'promoter', 'post_checkin', 'Check-in verificado', 'El personal es muy amable y atento.')
    ON CONFLICT (id) DO NOTHING;

    -- Survey 1: Encuesta satisfacción post-visita (active)
    INSERT INTO public.surveys (id, business_id, name, title, description, survey_status, total_sent, total_responded)
    VALUES (survey1_id, biz_id, 'Encuesta satisfacción post-visita', '¿Cómo fue tu experiencia?', 'Solo toma 1 minuto y nos ayuda a mejorar', 'active', 312, 118)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.survey_triggers (survey_id, trigger_type, delay_config, is_active)
    VALUES
        (survey1_id, 'post_checkin', 'Inmediato', true),
        (survey1_id, 'post_reservation', '2 horas', true)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.survey_questions (id, survey_id, question_order, question_type, question_text, is_required)
    VALUES
        (q1_id, survey1_id, 1, 'nps', '¿Qué tan probable es que nos recomiendes?', true),
        (q2_id, survey1_id, 2, 'stars', '¿Cómo calificarías tu experiencia general?', true),
        (q3_id, survey1_id, 3, 'single', '¿Qué aspecto destacarías?', false),
        (q4_id, survey1_id, 4, 'yesno', '¿Volverías a visitarnos?', false),
        (q5_id, survey1_id, 5, 'open', '¿Qué podríamos mejorar?', false)
    ON CONFLICT (id) DO NOTHING;

    -- Survey responses
    INSERT INTO public.survey_responses (id, survey_id, customer_name, is_anonymous, trigger_type, trigger_label, time_taken_seconds)
    VALUES
        (resp1_id, survey1_id, 'Carlos M.', false, 'post_checkin', 'Check-in verificado', 134),
        (resp2_id, survey1_id, NULL, true, 'post_checkin', 'Check-in verificado', 98),
        (resp3_id, survey1_id, 'María L.', false, 'post_reservation', 'Post reservación', 187)
    ON CONFLICT (id) DO NOTHING;

    -- Answer items
    INSERT INTO public.survey_answer_items (response_id, question_id, numeric_value, text_value)
    VALUES
        (resp1_id, q1_id, 9, NULL),
        (resp1_id, q2_id, 5, NULL),
        (resp1_id, q5_id, NULL, 'Excelente servicio, nada que mejorar'),
        (resp2_id, q1_id, 3, NULL),
        (resp2_id, q2_id, 2, NULL),
        (resp2_id, q5_id, NULL, 'El tiempo de espera podría ser menor'),
        (resp3_id, q1_id, 10, NULL),
        (resp3_id, q2_id, 5, NULL)
    ON CONFLICT (id) DO NOTHING;

    -- Survey 2: Feedback Order Ahead (active)
    INSERT INTO public.surveys (id, business_id, name, title, description, survey_status, total_sent, total_responded)
    VALUES (survey2_id, biz_id, 'Feedback Order Ahead', '¿Cómo fue tu pedido?', 'Cuéntanos sobre tu experiencia con el pedido', 'active', 145, 75)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.survey_triggers (survey_id, trigger_type, delay_config, is_active)
    VALUES (survey2_id, 'post_order', '1 hora', true)
    ON CONFLICT (id) DO NOTHING;

    -- Survey 3: Encuesta cupones (draft)
    INSERT INTO public.surveys (id, business_id, name, title, description, survey_status, total_sent, total_responded)
    VALUES (survey3_id, biz_id, 'Encuesta cupones y promociones', '¿Qué te pareció la promoción?', 'Tu opinión sobre nuestras promociones', 'draft', 0, 0)
    ON CONFLICT (id) DO NOTHING;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;
