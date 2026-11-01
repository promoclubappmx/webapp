-- Migration: Enhance pos_transactions for PDV Dashboard and POSFullScreen
-- Adds terminal_id, items JSONB, cash_received, change_given columns
-- Adds user_id to cash_register_sessions for realtime filtering

-- 1. Add terminal_id to pos_transactions (for hourly sales per terminal)
ALTER TABLE public.pos_transactions
  ADD COLUMN IF NOT EXISTS terminal_id UUID REFERENCES public.pos_terminals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.cash_register_sessions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cash_received NUMERIC,
  ADD COLUMN IF NOT EXISTS change_given NUMERIC;

-- 2. Index for terminal_id queries (hourly sales dashboard)
CREATE INDEX IF NOT EXISTS idx_pos_transactions_terminal_id ON public.pos_transactions(terminal_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_created_at ON public.pos_transactions(created_at);

-- 3. Ensure cash_register_sessions has total_transactions column
ALTER TABLE public.cash_register_sessions
  ADD COLUMN IF NOT EXISTS total_transactions INTEGER DEFAULT 0;

-- 4. Update RLS on pos_transactions to also allow user_id based access
-- (existing policy uses created_by = auth.uid(), which is fine)
-- Add a permissive policy for terminal-based access
DROP POLICY IF EXISTS "users_read_terminal_transactions" ON public.pos_transactions;
CREATE POLICY "users_read_terminal_transactions"
ON public.pos_transactions
FOR SELECT
TO authenticated
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.pos_terminals pt
    WHERE pt.id = pos_transactions.terminal_id
    AND pt.user_id = auth.uid()
  )
);
