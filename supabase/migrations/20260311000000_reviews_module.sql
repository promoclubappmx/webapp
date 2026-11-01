-- Reviews Module Migration
-- Timestamp: 20260311000000

-- ============================================================
-- TYPES
-- ============================================================
DROP TYPE IF EXISTS public.review_trigger_type CASCADE;
CREATE TYPE public.review_trigger_type AS ENUM ('checkin', 'coupon_redeem', 'order_completed', 'reservation_completed', 'geofence_visit');

DROP TYPE IF EXISTS public.review_status CASCADE;
CREATE TYPE public.review_status AS ENUM ('pending', 'published', 'reported', 'removed');

DROP TYPE IF EXISTS public.review_request_status CASCADE;
CREATE TYPE public.review_request_status AS ENUM ('sent', 'viewed', 'completed', 'ignored');

DROP TYPE IF EXISTS public.review_incentive_type CASCADE;
CREATE TYPE public.review_incentive_type AS ENUM ('points', 'coupon', 'punch_stamp');

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID,
  customer_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  trigger_type public.review_trigger_type NOT NULL DEFAULT 'checkin',
  event_id UUID,
  photos JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  review_status public.review_status DEFAULT 'published',
  customer_name TEXT,
  customer_level TEXT DEFAULT 'Bronce',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.review_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  published_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.review_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID,
  customer_id UUID,
  customer_name TEXT,
  customer_phone TEXT,
  trigger_type public.review_trigger_type NOT NULL DEFAULT 'checkin',
  request_status public.review_request_status DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  viewed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.review_incentive_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID,
  enabled BOOLEAN DEFAULT false,
  incentive_type public.review_incentive_type DEFAULT 'points',
  points_value INTEGER DEFAULT 10,
  coupon_id UUID,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.review_request_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID,
  auto_requests_enabled BOOLEAN DEFAULT true,
  checkin_enabled BOOLEAN DEFAULT true,
  checkin_delay TEXT DEFAULT 'immediate',
  coupon_enabled BOOLEAN DEFAULT true,
  coupon_delay TEXT DEFAULT 'immediate',
  order_enabled BOOLEAN DEFAULT true,
  order_delay TEXT DEFAULT '30min',
  reservation_enabled BOOLEAN DEFAULT true,
  reservation_delay TEXT DEFAULT '1hour',
  geofence_enabled BOOLEAN DEFAULT true,
  geofence_delay TEXT DEFAULT '1hour',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON public.reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_trigger_type ON public.reviews(trigger_type);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(review_status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_review_replies_review_id ON public.review_replies(review_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_review_id ON public.review_reports(review_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_business_id ON public.review_requests(business_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_status ON public.review_requests(request_status);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_incentive_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_request_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "open_access_reviews" ON public.reviews;
CREATE POLICY "open_access_reviews" ON public.reviews FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "open_access_review_replies" ON public.review_replies;
CREATE POLICY "open_access_review_replies" ON public.review_replies FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "open_access_review_reports" ON public.review_reports;
CREATE POLICY "open_access_review_reports" ON public.review_reports FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "open_access_review_requests" ON public.review_requests;
CREATE POLICY "open_access_review_requests" ON public.review_requests FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "open_access_review_incentive_config" ON public.review_incentive_config;
CREATE POLICY "open_access_review_incentive_config" ON public.review_incentive_config FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "open_access_review_request_config" ON public.review_request_config;
CREATE POLICY "open_access_review_request_config" ON public.review_request_config FOR ALL TO public USING (true) WITH CHECK (true);

-- ============================================================
-- MOCK DATA
-- ============================================================
DO $$
DECLARE
  biz_id UUID := gen_random_uuid();
  r1 UUID := gen_random_uuid();
  r2 UUID := gen_random_uuid();
  r3 UUID := gen_random_uuid();
  r4 UUID := gen_random_uuid();
  r5 UUID := gen_random_uuid();
  r6 UUID := gen_random_uuid();
  r7 UUID := gen_random_uuid();
  r8 UUID := gen_random_uuid();
  r9 UUID := gen_random_uuid();
  r10 UUID := gen_random_uuid();
  r11 UUID := gen_random_uuid();
  r12 UUID := gen_random_uuid();
  r13 UUID := gen_random_uuid();
  r14 UUID := gen_random_uuid();
  r15 UUID := gen_random_uuid();
BEGIN

  -- Reviews
  INSERT INTO public.reviews (id, business_id, rating, comment, trigger_type, customer_name, customer_level, review_status, tags, created_at)
  VALUES
    (r1, biz_id, 5, 'Excelente servicio, el cafe estaba perfecto y la atencion fue muy amable. Definitivamente volvere pronto.', 'checkin', 'Carlos M.', 'Oro', 'published', '["Buen servicio","Cafe excelente","Ambiente agradable"]'::jsonb, NOW() - INTERVAL '1 day'),
    (r2, biz_id, 4, 'Muy buen lugar, el ambiente es genial. El cafe podria estar un poco mas caliente pero en general muy bien.', 'coupon_redeem', 'Ana L.', 'Plata', 'published', '["Buen ambiente","Cafe rico"]'::jsonb, NOW() - INTERVAL '2 days'),
    (r3, biz_id, 5, 'El mejor cafe de la zona sin duda. Personal muy atento y el lugar siempre limpio.', 'checkin', 'Roberto S.', 'Oro', 'published', '["Limpieza","Atencion al cliente","Cafe excelente"]'::jsonb, NOW() - INTERVAL '3 days'),
    (r4, biz_id, 2, 'Tuve que esperar mas de 20 minutos para que me atendieran. El cafe estaba frio cuando llego. No es lo que esperaba.', 'order_completed', 'Maria G.', 'Bronce', 'published', '["Tiempo de espera","Temperatura"]'::jsonb, NOW() - INTERVAL '4 days'),
    (r5, biz_id, 3, 'El lugar es bonito pero el servicio fue lento. El cafe estaba bien pero nada especial. Quizas vuelva a intentarlo.', 'reservation_completed', 'Luis P.', 'Bronce', 'published', '["Servicio lento"]'::jsonb, NOW() - INTERVAL '5 days'),
    (r6, biz_id, 5, 'Increible experiencia. El barista me recomendo el espresso con leche de avena y fue una revelacion. 10/10.', 'checkin', 'Sofia R.', 'Plata', 'published', '["Recomendaciones","Barista experto","Cafe especial"]'::jsonb, NOW() - INTERVAL '6 days'),
    (r7, biz_id, 1, 'Pesima experiencia. Me cobraron de mas y cuando reclame fueron groseros. No recomiendo este lugar para nada.', 'coupon_redeem', 'Jorge T.', 'Bronce', 'reported', '["Cobro incorrecto","Mal trato"]'::jsonb, NOW() - INTERVAL '7 days'),
    (r8, biz_id, 4, 'Buen cafe y buena musica. El lugar tiene mucho encanto. Los pasteles son deliciosos tambien.', 'geofence_visit', 'Patricia V.', 'Plata', 'published', '["Musica","Pasteles","Ambiente"]'::jsonb, NOW() - INTERVAL '8 days'),
    (r9, biz_id, 5, 'Vine con mi familia y todos quedamos encantados. Los ninos disfrutaron mucho y el personal fue muy paciente.', 'checkin', 'Fernando H.', 'Oro', 'published', '["Familiar","Personal amable","Ninos bienvenidos"]'::jsonb, NOW() - INTERVAL '9 days'),
    (r10, biz_id, 3, 'El cafe esta bien pero los precios son un poco altos para lo que ofrecen. El lugar es pequeno y a veces hay mucho ruido.', 'order_completed', 'Carmen D.', 'Bronce', 'published', '["Precio","Ruido","Espacio"]'::jsonb, NOW() - INTERVAL '10 days'),
    (r11, biz_id, 4, 'Me gusto mucho el ambiente. El wifi funciona bien y pude trabajar tranquilamente por horas. El cafe es consistente.', 'checkin', 'Miguel A.', 'Plata', 'published', '["Wifi","Trabajo remoto","Consistencia"]'::jsonb, NOW() - INTERVAL '11 days'),
    (r12, biz_id, 5, 'El mejor cappuccino que he tomado en mi vida. La crema estaba perfecta y el sabor era intenso pero equilibrado.', 'coupon_redeem', 'Isabella C.', 'Oro', 'published', '["Cappuccino","Calidad","Sabor"]'::jsonb, NOW() - INTERVAL '12 days'),
    (r13, biz_id, 2, 'Servicio muy lento y el personal parecia desorganizado. Tuve que pedir mi orden dos veces. Esperaba mas.', 'reservation_completed', 'Eduardo N.', 'Bronce', 'published', '["Servicio lento","Desorganizacion"]'::jsonb, NOW() - INTERVAL '13 days'),
    (r14, biz_id, 4, 'Lugar acogedor con buena seleccion de cafes de especialidad. Me explico el origen de cada grano. Muy educativo.', 'geofence_visit', 'Valentina O.', 'Plata', 'published', '["Cafe de especialidad","Educativo","Acogedor"]'::jsonb, NOW() - INTERVAL '14 days'),
    (r15, biz_id, 5, 'Visita perfecta de principio a fin. Llegue en hora pico y aun asi el servicio fue rapido y el cafe impecable.', 'checkin', 'Alejandro B.', 'Oro', 'published', '["Rapidez","Hora pico","Impecable"]'::jsonb, NOW() - INTERVAL '15 days')
  ON CONFLICT (id) DO NOTHING;

  -- Replies for some reviews
  INSERT INTO public.review_replies (review_id, content, published_at)
  VALUES
    (r1, 'Muchas gracias Carlos! Nos alegra mucho que hayas disfrutado tu visita. Te esperamos pronto con nuevas opciones de cafe de temporada.', NOW() - INTERVAL '20 hours'),
    (r2, 'Gracias Ana por tu comentario! Tomamos nota sobre la temperatura del cafe. Trabajaremos en mejorar ese aspecto para tu proxima visita.', NOW() - INTERVAL '1 day 18 hours'),
    (r4, 'Lamentamos mucho tu experiencia Maria. Ese dia tuvimos un imprevisto con el personal. Te invitamos a regresar y prometemos una mejor atencion.', NOW() - INTERVAL '3 days 12 hours'),
    (r6, 'Sofia, nos alegra que hayas descubierto el espresso con leche de avena! Es uno de nuestros favoritos tambien. Hasta pronto!', NOW() - INTERVAL '5 days 8 hours'),
    (r9, 'Fernando, que gusto que toda la familia haya disfrutado! Los ninos son siempre bienvenidos. Tenemos actividades especiales los fines de semana.', NOW() - INTERVAL '8 days 6 hours')
  ON CONFLICT (id) DO NOTHING;

  -- Report for review r7
  INSERT INTO public.review_reports (review_id, reason, description)
  VALUES (r7, 'Contiene informacion falsa o enganosa', 'El cliente no fue grosero con nosotros, esta informacion es falsa.')
  ON CONFLICT (id) DO NOTHING;

  -- Review requests
  INSERT INTO public.review_requests (business_id, customer_name, customer_phone, trigger_type, request_status, sent_at, viewed_at, completed_at)
  VALUES
    (biz_id, 'Carlos M.', '+52 55 1234 5678', 'checkin', 'completed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours', NOW() - INTERVAL '22 hours'),
    (biz_id, 'Ana L.', '+52 55 2345 6789', 'coupon_redeem', 'completed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '47 hours', NOW() - INTERVAL '46 hours'),
    (biz_id, 'Pedro Q.', '+52 55 3456 7890', 'checkin', 'viewed', NOW() - INTERVAL '3 days', NOW() - INTERVAL '70 hours', NULL),
    (biz_id, 'Laura F.', '+52 55 4567 8901', 'order_completed', 'sent', NOW() - INTERVAL '4 hours', NULL, NULL),
    (biz_id, 'Marco I.', '+52 55 5678 9012', 'checkin', 'sent', NOW() - INTERVAL '6 hours', NULL, NULL),
    (biz_id, 'Diana K.', '+52 55 6789 0123', 'reservation_completed', 'completed', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days 22 hours', NOW() - INTERVAL '4 days 20 hours'),
    (biz_id, 'Oscar W.', '+52 55 7890 1234', 'geofence_visit', 'ignored', NOW() - INTERVAL '6 days', NULL, NULL),
    (biz_id, 'Elena X.', '+52 55 8901 2345', 'checkin', 'completed', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days 23 hours', NOW() - INTERVAL '6 days 22 hours'),
    (biz_id, 'Raul Y.', '+52 55 9012 3456', 'coupon_redeem', 'sent', NOW() - INTERVAL '2 hours', NULL, NULL),
    (biz_id, 'Nora Z.', '+52 55 0123 4567', 'order_completed', 'viewed', NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days 20 hours', NULL)
  ON CONFLICT (id) DO NOTHING;

  -- Incentive config
  INSERT INTO public.review_incentive_config (business_id, enabled, incentive_type, points_value)
  VALUES (biz_id, true, 'points', 15)
  ON CONFLICT (id) DO NOTHING;

  -- Request config
  INSERT INTO public.review_request_config (business_id, auto_requests_enabled, checkin_enabled, checkin_delay, coupon_enabled, coupon_delay, order_enabled, order_delay, reservation_enabled, reservation_delay, geofence_enabled, geofence_delay)
  VALUES (biz_id, true, true, 'immediate', true, 'immediate', true, '30min', true, '1hour', true, '1hour')
  ON CONFLICT (id) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Reviews mock data error: %', SQLERRM;
END $$;
