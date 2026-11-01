-- Promotion Analytics table for per-promotion detailed metrics
CREATE TABLE IF NOT EXISTS public.promotion_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID REFERENCES public.promotions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  redemptions INTEGER DEFAULT 0,
  revenue_attributed NUMERIC DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  returning_visitors INTEGER DEFAULT 0,
  avg_order_value NUMERIC DEFAULT 0,
  push_sent INTEGER DEFAULT 0,
  push_opened INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_promotion_analytics_promotion_id ON public.promotion_analytics(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promotion_analytics_user_id ON public.promotion_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_promotion_analytics_date ON public.promotion_analytics(date);

-- Add extra columns to promotions table if not present
ALTER TABLE public.promotions
  ADD COLUMN IF NOT EXISTS promo_type TEXT DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS internal_name TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS discount_type TEXT DEFAULT 'percentage',
  ADD COLUMN IF NOT EXISTS total_limit INTEGER,
  ADD COLUMN IF NOT EXISTS location_id TEXT;

-- Enable RLS
ALTER TABLE public.promotion_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for promotion_analytics
DROP POLICY IF EXISTS "users_manage_own_promotion_analytics" ON public.promotion_analytics;
CREATE POLICY "users_manage_own_promotion_analytics"
ON public.promotion_analytics
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- RLS Policies for promotions (ensure they exist)
DROP POLICY IF EXISTS "users_manage_own_promotions" ON public.promotions;
CREATE POLICY "users_manage_own_promotions"
ON public.promotions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Seed sample analytics data for existing promotions
DO $$
DECLARE
  existing_user_id UUID;
  existing_promo_id UUID;
  promo_record RECORD;
  day_offset INTEGER;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_profiles'
  ) THEN
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;

    IF existing_user_id IS NOT NULL THEN
      -- Seed sample promotions if none exist
      IF NOT EXISTS (SELECT 1 FROM public.promotions LIMIT 1) THEN
        INSERT INTO public.promotions (id, title, description, promotion_type, discount_value, start_date, end_date, status, user_id, promo_type, performance)
        VALUES
          (gen_random_uuid(), 'Flash Deal Tarde — 40% OFF', 'Promocion ultra-corta para llenar horas muertas', 'percentage', 40, CURRENT_DATE - 30, CURRENT_DATE + 30, 'active', existing_user_id, 'flash_deal', '{"views": 312, "clicks": 87, "conversions": 23}'::jsonb),
          (gen_random_uuid(), 'Happy Hour 5-7pm', 'Descuento automatico en horario de baja afluencia', 'percentage', 25, CURRENT_DATE - 60, CURRENT_DATE + 60, 'active', existing_user_id, 'happy_hour', '{"views": 1890, "clicks": 445, "conversions": 156}'::jsonb),
          (gen_random_uuid(), 'Bienvenida Primera Visita', 'Descuento especial para nuevos clientes', 'percentage', 15, CURRENT_DATE - 90, CURRENT_DATE + 90, 'active', existing_user_id, 'first_visit', '{"views": 210, "clicks": 67, "conversions": 34}'::jsonb)
        ON CONFLICT (id) DO NOTHING;
      END IF;

      -- Seed analytics for each promotion (last 30 days)
      FOR promo_record IN SELECT id FROM public.promotions WHERE user_id = existing_user_id LIMIT 5 LOOP
        FOR day_offset IN 0..29 LOOP
          INSERT INTO public.promotion_analytics (
            promotion_id, user_id, date,
            impressions, clicks, redemptions, revenue_attributed,
            unique_visitors, returning_visitors, avg_order_value,
            push_sent, push_opened
          )
          VALUES (
            promo_record.id,
            existing_user_id,
            CURRENT_DATE - day_offset,
            (RANDOM() * 200 + 50)::INTEGER,
            (RANDOM() * 50 + 10)::INTEGER,
            (RANDOM() * 20 + 2)::INTEGER,
            (RANDOM() * 3000 + 500)::NUMERIC,
            (RANDOM() * 80 + 20)::INTEGER,
            (RANDOM() * 40 + 5)::INTEGER,
            (RANDOM() * 200 + 100)::NUMERIC,
            (RANDOM() * 100 + 20)::INTEGER,
            (RANDOM() * 40 + 5)::INTEGER
          )
          ON CONFLICT DO NOTHING;
        END LOOP;
      END LOOP;
    END IF;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Seed data failed: %', SQLERRM;
END $$;
