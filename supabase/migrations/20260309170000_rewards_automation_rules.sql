-- Rewards Automation Rules Migration
-- Adds automation rules for punch cards, VIP levels, and experiences

-- ─── AUTOMATION RULES TABLE ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.rewards_automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  rule_name TEXT NOT NULL,
  trigger_type TEXT NOT NULL, -- 'punch_card_complete' | 'vip_level_up' | 'experience_claimed'
  trigger_source_id UUID, -- punch_card_id, vip_level_id, or experience_id
  trigger_source_name TEXT, -- human-readable name of the source
  source_module TEXT NOT NULL, -- 'punch_cards' | 'vip_levels' | 'experiences'
  action_type TEXT NOT NULL, -- 'send_message' | 'referral_bonus' | 'surprise_reward' | 'automation_flow' | 'celebration_points' | 'special_benefit' | 'notify_staff' | 'send_confirmation' | 'request_review' | 'bonus_points' | 'special_referral'
  action_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  fires_this_month INTEGER NOT NULL DEFAULT 0,
  total_fires INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rewards_automation_rules_business_id ON public.rewards_automation_rules(business_id);
CREATE INDEX IF NOT EXISTS idx_rewards_automation_rules_trigger_type ON public.rewards_automation_rules(trigger_type);
CREATE INDEX IF NOT EXISTS idx_rewards_automation_rules_source_module ON public.rewards_automation_rules(source_module);
CREATE INDEX IF NOT EXISTS idx_rewards_automation_rules_is_active ON public.rewards_automation_rules(is_active);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.rewards_automation_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_rewards_automation_rules" ON public.rewards_automation_rules;
CREATE POLICY "users_manage_own_rewards_automation_rules"
ON public.rewards_automation_rules
FOR ALL
TO authenticated
USING (business_id = auth.uid())
WITH CHECK (business_id = auth.uid());

-- ─── UPDATED_AT TRIGGER ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_rewards_automation_rules_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS rewards_automation_rules_updated_at ON public.rewards_automation_rules;
CREATE TRIGGER rewards_automation_rules_updated_at
  BEFORE UPDATE ON public.rewards_automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_rewards_automation_rules_updated_at();

-- ─── SAMPLE DATA ─────────────────────────────────────────────────────────────

DO $$
DECLARE
  existing_user_id UUID;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'punch_cards'
  ) THEN
    SELECT business_id INTO existing_user_id FROM public.punch_cards LIMIT 1;
    IF existing_user_id IS NOT NULL THEN
      INSERT INTO public.rewards_automation_rules (
        business_id, rule_name, trigger_type, trigger_source_name, source_module,
        action_type, action_config, is_active, fires_this_month
      ) VALUES
      (
        existing_user_id,
        'Felicitacion al completar tarjeta',
        'punch_card_complete',
        'Tarjeta del Cafecito',
        'punch_cards',
        'send_message',
        jsonb_build_object(
          'channel', 'push',
          'message', 'Felicidades {nombre}! Completaste tu tarjeta en {negocio}. Tu recompensa esta lista.',
          'variables', ARRAY['nombre', 'negocio', 'tarjeta']
        ),
        true,
        14
      ),
      (
        existing_user_id,
        'Puntos de celebracion nivel Oro',
        'vip_level_up',
        'Nivel Oro',
        'vip_levels',
        'celebration_points',
        jsonb_build_object(
          'points', 300,
          'mxn_value', 45.00
        ),
        true,
        3
      ),
      (
        existing_user_id,
        'Confirmacion de experiencia',
        'experience_claimed',
        'Cata privada con el barista',
        'experiences',
        'send_confirmation',
        jsonb_build_object(
          'message', 'Tu experiencia ha sido confirmada. Te esperamos el dia acordado. Cualquier duda contactanos.',
          'channel', 'push'
        ),
        true,
        2
      )
      ON CONFLICT (id) DO NOTHING;
    END IF;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Sample automation rules insertion skipped: %', SQLERRM;
END $$;
