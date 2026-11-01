-- Migration: Add product/service fields and distribution channel fields to loyalty_rewards
-- Timestamp: 20260614210000

-- Add benefit_product_price column
ALTER TABLE public.loyalty_rewards
ADD COLUMN IF NOT EXISTS benefit_product_price NUMERIC(10,2) DEFAULT NULL;

-- Add distribution channel columns (replacing old channel_qr/channel_code/channel_manual with new model)
ALTER TABLE public.loyalty_rewards
ADD COLUMN IF NOT EXISTS channel_public_profile BOOLEAN DEFAULT FALSE;

ALTER TABLE public.loyalty_rewards
ADD COLUMN IF NOT EXISTS channel_crm_segment BOOLEAN DEFAULT FALSE;

ALTER TABLE public.loyalty_rewards
ADD COLUMN IF NOT EXISTS channel_flow BOOLEAN DEFAULT FALSE;

-- Add index for channel queries
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_channel_public ON public.loyalty_rewards(channel_public_profile);
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_channel_crm ON public.loyalty_rewards(channel_crm_segment);
