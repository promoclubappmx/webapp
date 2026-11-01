-- Customer notes table for owner-specific notes on customers
CREATE TABLE IF NOT EXISTS public.customer_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid NOT NULL REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note text NOT NULL,
  author_name text DEFAULT 'Admin',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_customer_notes_customer_owner ON public.customer_notes(customer_id, owner_id);

-- RLS
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'customer_notes' AND policyname = 'owner_manage_notes'
  ) THEN
    CREATE POLICY owner_manage_notes ON public.customer_notes
      FOR ALL USING (owner_id = auth.uid())
      WITH CHECK (owner_id = auth.uid());
  END IF;
END $$;

-- Add estimated_spend and score_breakdown columns to customer_profiles if missing
ALTER TABLE public.customer_profiles
  ADD COLUMN IF NOT EXISTS estimated_spend numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS score_breakdown jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS birth_date date;
