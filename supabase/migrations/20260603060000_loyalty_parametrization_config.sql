-- Migration: Loyalty Program Parametrization Config
-- Adds parametrization columns to loyalty_programs table for point value and accumulation threshold

-- Add parametrization columns to existing loyalty_programs table
ALTER TABLE public.loyalty_programs
ADD COLUMN IF NOT EXISTS accumulation_threshold DECIMAL(5,2) DEFAULT 5.00,
ADD COLUMN IF NOT EXISTS point_value_mxn DECIMAL(5,2) DEFAULT 0.15,
ADD COLUMN IF NOT EXISTS avg_ticket DECIMAL(10,2) DEFAULT 200.00,
ADD COLUMN IF NOT EXISTS monthly_visits INTEGER DEFAULT 450,
ADD COLUMN IF NOT EXISTS margin_pct INTEGER DEFAULT 40,
ADD COLUMN IF NOT EXISTS parametrization_updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Create index for fast lookup
CREATE INDEX IF NOT EXISTS idx_loyalty_programs_business_id ON public.loyalty_programs(business_id);

-- Ensure RLS is enabled
ALTER TABLE public.loyalty_programs ENABLE ROW LEVEL SECURITY;

-- RLS policies for loyalty_programs
DROP POLICY IF EXISTS "users_manage_own_loyalty_programs" ON public.loyalty_programs;
CREATE POLICY "users_manage_own_loyalty_programs"
ON public.loyalty_programs
FOR ALL
TO authenticated
USING (business_id = auth.uid())
WITH CHECK (business_id = auth.uid());
