-- Migration: business_listing_drafts
-- Stores wizard draft progress per user

CREATE TABLE IF NOT EXISTS public.business_listing_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 0,
  form_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_business_listing_drafts_owner_id ON public.business_listing_drafts(owner_id);

ALTER TABLE public.business_listing_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_business_listing_drafts" ON public.business_listing_drafts;
CREATE POLICY "users_manage_own_business_listing_drafts"
  ON public.business_listing_drafts
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Function to upsert draft (one draft per user)
CREATE OR REPLACE FUNCTION public.upsert_business_listing_draft(
  p_owner_id UUID,
  p_current_step INTEGER,
  p_form_data JSONB
)
RETURNS public.business_listing_drafts
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result public.business_listing_drafts;
BEGIN
  INSERT INTO public.business_listing_drafts (owner_id, current_step, form_data, updated_at)
  VALUES (p_owner_id, p_current_step, p_form_data, CURRENT_TIMESTAMP)
  ON CONFLICT (owner_id) DO UPDATE
    SET current_step = EXCLUDED.current_step,
        form_data = EXCLUDED.form_data,
        updated_at = CURRENT_TIMESTAMP
  RETURNING * INTO v_result;
  RETURN v_result;
END;
$$;

-- Unique constraint: one draft per owner
ALTER TABLE public.business_listing_drafts
  DROP CONSTRAINT IF EXISTS business_listing_drafts_owner_id_key;
ALTER TABLE public.business_listing_drafts
  ADD CONSTRAINT business_listing_drafts_owner_id_key UNIQUE (owner_id);
