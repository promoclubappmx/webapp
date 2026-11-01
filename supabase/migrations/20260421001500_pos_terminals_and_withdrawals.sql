-- POS Terminals and Cash Withdrawals Migration
-- Adds pos_terminals, cash_withdrawals tables and enhances cash_register_sessions

-- 1. Create pos_terminals table
CREATE TABLE IF NOT EXISTS public.pos_terminals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.business_locations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  serial_number TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add terminal_id and cut_type to cash_register_sessions
ALTER TABLE public.cash_register_sessions
  ADD COLUMN IF NOT EXISTS terminal_id UUID REFERENCES public.pos_terminals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cut_type TEXT DEFAULT 'partial',
  ADD COLUMN IF NOT EXISTS final_cut_date DATE,
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL;

-- 3. Create cash_withdrawals table
CREATE TABLE IF NOT EXISTS public.cash_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.cash_register_sessions(id) ON DELETE CASCADE,
  terminal_id UUID REFERENCES public.pos_terminals(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  reason TEXT,
  notes TEXT,
  withdrawn_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_pos_terminals_user_id ON public.pos_terminals(user_id);
CREATE INDEX IF NOT EXISTS idx_pos_terminals_location_id ON public.pos_terminals(location_id);
CREATE INDEX IF NOT EXISTS idx_cash_withdrawals_session_id ON public.cash_withdrawals(session_id);
CREATE INDEX IF NOT EXISTS idx_cash_withdrawals_user_id ON public.cash_withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_cash_register_sessions_terminal_id ON public.cash_register_sessions(terminal_id);
CREATE INDEX IF NOT EXISTS idx_cash_register_sessions_user_id ON public.cash_register_sessions(user_id);

-- 5. Enable RLS
ALTER TABLE public.pos_terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_withdrawals ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for pos_terminals
DROP POLICY IF EXISTS "users_manage_own_pos_terminals" ON public.pos_terminals;
CREATE POLICY "users_manage_own_pos_terminals"
ON public.pos_terminals
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 7. RLS Policies for cash_withdrawals
DROP POLICY IF EXISTS "users_manage_own_cash_withdrawals" ON public.cash_withdrawals;
CREATE POLICY "users_manage_own_cash_withdrawals"
ON public.cash_withdrawals
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 8. RLS for cash_register_sessions (add user_id based policy)
DROP POLICY IF EXISTS "users_manage_own_cash_register_sessions" ON public.cash_register_sessions;
CREATE POLICY "users_manage_own_cash_register_sessions"
ON public.cash_register_sessions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 9. Function to get terminal status with active session
CREATE OR REPLACE FUNCTION public.get_terminal_with_session(p_user_id UUID)
RETURNS TABLE(
  terminal_id UUID,
  terminal_name TEXT,
  serial_number TEXT,
  location_id UUID,
  location_name TEXT,
  is_active BOOLEAN,
  session_id UUID,
  session_status TEXT,
  opened_at TIMESTAMPTZ,
  opening_amount NUMERIC,
  total_sales NUMERIC,
  final_cut_date DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id AS terminal_id,
    t.name AS terminal_name,
    t.serial_number,
    t.location_id,
    bl.name AS location_name,
    t.is_active,
    s.id AS session_id,
    s.status::TEXT AS session_status,
    s.opened_at,
    s.opening_amount,
    s.total_sales,
    s.final_cut_date
  FROM public.pos_terminals t
  LEFT JOIN public.business_locations bl ON t.location_id = bl.id
  LEFT JOIN public.cash_register_sessions s ON s.terminal_id = t.id
    AND s.status = 'open'
    AND (s.final_cut_date IS NULL OR s.final_cut_date != CURRENT_DATE)
  WHERE t.user_id = p_user_id
    AND t.is_active = true
  ORDER BY t.created_at DESC;
END;
$$;
