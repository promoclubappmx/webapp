-- Migration: Loyalty Bonus Behavior, Control & Special Rules
-- Adds columns to loyalty_programs for the new rule categories

DO $$
BEGIN
  -- ─── BONUS POR COMPORTAMIENTO ───────────────────────────────────────────────

  -- Racha (streak) - already may exist from parametrization, ensure bonus_streak_config
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='bonus_streak_enabled') THEN
    ALTER TABLE loyalty_programs ADD COLUMN bonus_streak_enabled BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='bonus_streak_config') THEN
    ALTER TABLE loyalty_programs ADD COLUMN bonus_streak_config JSONB DEFAULT '{"steps":[{"visit":2,"bonus":5},{"visit":5,"bonus":20},{"visit":10,"bonus":50}],"windowDays":7}'::jsonb;
  END IF;

  -- Hitos de visitas (milestone rewards)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='bonus_milestones_enabled') THEN
    ALTER TABLE loyalty_programs ADD COLUMN bonus_milestones_enabled BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='bonus_milestones_config') THEN
    ALTER TABLE loyalty_programs ADD COLUMN bonus_milestones_config JSONB DEFAULT '{"milestones":[{"visit":10,"bonus":50},{"visit":25,"bonus":150},{"visit":50,"bonus":400},{"visit":100,"bonus":1000}]}'::jsonb;
  END IF;

  -- Cumpleaños
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='bonus_birthday_enabled') THEN
    ALTER TABLE loyalty_programs ADD COLUMN bonus_birthday_enabled BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='bonus_birthday_points') THEN
    ALTER TABLE loyalty_programs ADD COLUMN bonus_birthday_points INTEGER DEFAULT 50;
  END IF;

  -- Referido exitoso
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='bonus_referral_enabled') THEN
    ALTER TABLE loyalty_programs ADD COLUMN bonus_referral_enabled BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='bonus_referral_points') THEN
    ALTER TABLE loyalty_programs ADD COLUMN bonus_referral_points INTEGER DEFAULT 100;
  END IF;

  -- Reseña verificada
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='bonus_review_enabled') THEN
    ALTER TABLE loyalty_programs ADD COLUMN bonus_review_enabled BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='bonus_review_points') THEN
    ALTER TABLE loyalty_programs ADD COLUMN bonus_review_points INTEGER DEFAULT 25;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='bonus_review_limit_per_month') THEN
    ALTER TABLE loyalty_programs ADD COLUMN bonus_review_limit_per_month INTEGER DEFAULT 1;
  END IF;

  -- Reservación cumplida
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='bonus_reservation_enabled') THEN
    ALTER TABLE loyalty_programs ADD COLUMN bonus_reservation_enabled BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='bonus_reservation_points') THEN
    ALTER TABLE loyalty_programs ADD COLUMN bonus_reservation_points INTEGER DEFAULT 30;
  END IF;

  -- Completar perfil
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='bonus_profile_complete_enabled') THEN
    ALTER TABLE loyalty_programs ADD COLUMN bonus_profile_complete_enabled BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='bonus_profile_complete_points') THEN
    ALTER TABLE loyalty_programs ADD COLUMN bonus_profile_complete_points INTEGER DEFAULT 75;
  END IF;

  -- ─── REGLAS DE CONTROL ──────────────────────────────────────────────────────

  -- Límite máximo de puntos por día
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='limit_daily_enabled') THEN
    ALTER TABLE loyalty_programs ADD COLUMN limit_daily_enabled BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='limit_daily_points') THEN
    ALTER TABLE loyalty_programs ADD COLUMN limit_daily_points INTEGER DEFAULT 200;
  END IF;

  -- Límite máximo de puntos por mes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='limit_monthly_enabled') THEN
    ALTER TABLE loyalty_programs ADD COLUMN limit_monthly_enabled BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='limit_monthly_points') THEN
    ALTER TABLE loyalty_programs ADD COLUMN limit_monthly_points INTEGER DEFAULT 2000;
  END IF;

  -- Puntos diferenciados por método de check-in
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='checkin_method_points_enabled') THEN
    ALTER TABLE loyalty_programs ADD COLUMN checkin_method_points_enabled BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='checkin_method_points_config') THEN
    ALTER TABLE loyalty_programs ADD COLUMN checkin_method_points_config JSONB DEFAULT '{"qr":10,"nfc":15,"geofence":5,"manual":5}'::jsonb;
  END IF;

  -- ─── REGLAS ESPECIALES ───────────────────────────────────────────────────────

  -- Primera compra de producto nuevo
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='special_new_product_enabled') THEN
    ALTER TABLE loyalty_programs ADD COLUMN special_new_product_enabled BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='special_new_product_points') THEN
    ALTER TABLE loyalty_programs ADD COLUMN special_new_product_points INTEGER DEFAULT 50;
  END IF;

  -- Recarga prepago
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='special_prepaid_reload_enabled') THEN
    ALTER TABLE loyalty_programs ADD COLUMN special_prepaid_reload_enabled BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='special_prepaid_reload_config') THEN
    ALTER TABLE loyalty_programs ADD COLUMN special_prepaid_reload_config JSONB DEFAULT '{"pointsPerHundredMXN":10}'::jsonb;
  END IF;

  -- Puntos dobles primera visita del mes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='special_first_visit_month_enabled') THEN
    ALTER TABLE loyalty_programs ADD COLUMN special_first_visit_month_enabled BOOLEAN DEFAULT false;
  END IF;

  -- Visita en grupo
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='special_group_visit_enabled') THEN
    ALTER TABLE loyalty_programs ADD COLUMN special_group_visit_enabled BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_programs' AND column_name='special_group_visit_config') THEN
    ALTER TABLE loyalty_programs ADD COLUMN special_group_visit_config JSONB DEFAULT '{"minPeople":3,"bonusPoints":50}'::jsonb;
  END IF;

END $$;
