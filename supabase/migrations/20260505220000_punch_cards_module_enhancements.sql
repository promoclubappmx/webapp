-- Punch Cards Module Enhancements
-- Adds advanced configuration columns to existing punch_cards table

-- Add advanced columns to punch_cards if they don't exist
ALTER TABLE public.punch_cards
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS stamp_limit_per_visit INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS cumulative_stamps BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS welcome_stamp_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS welcome_stamp_count INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS double_stamp_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS double_stamp_days TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS double_stamp_start_time TEXT,
  ADD COLUMN IF NOT EXISTS double_stamp_end_time TEXT,
  ADD COLUMN IF NOT EXISTS schedule_restriction_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS schedule_days TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS schedule_start_time TEXT,
  ADD COLUMN IF NOT EXISTS schedule_end_time TEXT,
  ADD COLUMN IF NOT EXISTS compatibility_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS audience TEXT DEFAULT 'all',
  ADD COLUMN IF NOT EXISTS audience_segment_id UUID,
  ADD COLUMN IF NOT EXISTS reward_expiry_days INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS perceived_value NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS reward_discount_type TEXT DEFAULT 'percentage',
  ADD COLUMN IF NOT EXISTS reward_discount_max NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS stamp_icon_category TEXT DEFAULT 'generic',
  ADD COLUMN IF NOT EXISTS card_gradient_type TEXT DEFAULT 'solid',
  ADD COLUMN IF NOT EXISTS card_color_secondary TEXT,
  ADD COLUMN IF NOT EXISTS card_gradient_direction TEXT DEFAULT 'diagonal',
  ADD COLUMN IF NOT EXISTS stamp_layout TEXT DEFAULT 'grid',
  ADD COLUMN IF NOT EXISTS stamp_size TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS stamp_effect TEXT DEFAULT 'stamp',
  ADD COLUMN IF NOT EXISTS font_style TEXT DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS show_logo BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#FFFFFF';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_punch_cards_business_status ON public.punch_cards(business_id, status);
CREATE INDEX IF NOT EXISTS idx_punch_card_stamps_card_id ON public.punch_card_stamps(punch_card_id);
CREATE INDEX IF NOT EXISTS idx_punch_card_stamps_customer ON public.punch_card_stamps(customer_id);

-- Ensure punch_card_stamps has needed columns
ALTER TABLE public.punch_card_stamps
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reward_claimed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- RLS for punch_cards (already exists, ensure policies are correct)
ALTER TABLE public.punch_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owners_manage_punch_cards" ON public.punch_cards;
CREATE POLICY "owners_manage_punch_cards"
ON public.punch_cards
FOR ALL
TO authenticated
USING (business_id = auth.uid())
WITH CHECK (business_id = auth.uid());

-- RLS for punch_card_stamps
ALTER TABLE public.punch_card_stamps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owners_view_punch_card_stamps" ON public.punch_card_stamps;
CREATE POLICY "owners_view_punch_card_stamps"
ON public.punch_card_stamps
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.punch_cards pc
    WHERE pc.id = punch_card_stamps.punch_card_id
    AND pc.business_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "owners_manage_punch_card_stamps" ON public.punch_card_stamps;
CREATE POLICY "owners_manage_punch_card_stamps"
ON public.punch_card_stamps
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.punch_cards pc
    WHERE pc.id = punch_card_stamps.punch_card_id
    AND pc.business_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.punch_cards pc
    WHERE pc.id = punch_card_stamps.punch_card_id
    AND pc.business_id = auth.uid()
  )
);
