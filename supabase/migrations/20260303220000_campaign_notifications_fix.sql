-- Campaign Notifications Fix Migration
-- Creates campaign_notifications and sequence_promotion_steps tables
-- Also adds missing columns to campaign_sequences if not present

-- 1. Add promotion columns to campaign_sequences if not exists
ALTER TABLE public.campaign_sequences
ADD COLUMN IF NOT EXISTS promotion_id TEXT,
ADD COLUMN IF NOT EXISTS promotion_action TEXT DEFAULT 'activate',
ADD COLUMN IF NOT EXISTS promotion_timing_hours INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS promotion_status TEXT DEFAULT 'pending';

-- 2. Campaign Notifications table
CREATE TABLE IF NOT EXISTS public.campaign_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT NOT NULL,
  business_id TEXT,
  milestone_type TEXT NOT NULL,
  milestone_value NUMERIC,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_campaign_notifications_campaign_id ON public.campaign_notifications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_notifications_business_id ON public.campaign_notifications(business_id);
CREATE INDEX IF NOT EXISTS idx_campaign_notifications_is_read ON public.campaign_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_campaign_notifications_created_at ON public.campaign_notifications(created_at DESC);

-- 3. Sequence Promotion Steps table
CREATE TABLE IF NOT EXISTS public.sequence_promotion_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT NOT NULL,
  sequence_step_id UUID,
  promotion_id TEXT NOT NULL,
  promotion_title TEXT,
  action_type TEXT NOT NULL DEFAULT 'activate',
  scheduled_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  step_status TEXT DEFAULT 'pending',
  business_id TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_seq_promo_steps_campaign_id ON public.sequence_promotion_steps(campaign_id);
CREATE INDEX IF NOT EXISTS idx_seq_promo_steps_promotion_id ON public.sequence_promotion_steps(promotion_id);

-- 4. Enable RLS
ALTER TABLE public.campaign_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_promotion_steps ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "open_access_campaign_notifications" ON public.campaign_notifications;
CREATE POLICY "open_access_campaign_notifications"
ON public.campaign_notifications FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "open_access_sequence_promotion_steps" ON public.sequence_promotion_steps;
CREATE POLICY "open_access_sequence_promotion_steps"
ON public.sequence_promotion_steps FOR ALL TO public USING (true) WITH CHECK (true);
