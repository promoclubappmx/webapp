-- Fix RLS policies for pos_terminals to allow authenticated owner to INSERT
-- Root cause: FOR ALL policy may not correctly apply WITH CHECK for INSERT in some Supabase versions
-- Solution: Use explicit separate policies per operation

-- Drop existing policy
DROP POLICY IF EXISTS "users_manage_own_pos_terminals" ON public.pos_terminals;

-- Separate SELECT policy
DROP POLICY IF EXISTS "pos_terminals_select" ON public.pos_terminals;
CREATE POLICY "pos_terminals_select"
ON public.pos_terminals
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Separate INSERT policy (WITH CHECK only — no USING for INSERT)
DROP POLICY IF EXISTS "pos_terminals_insert" ON public.pos_terminals;
CREATE POLICY "pos_terminals_insert"
ON public.pos_terminals
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Separate UPDATE policy
DROP POLICY IF EXISTS "pos_terminals_update" ON public.pos_terminals;
CREATE POLICY "pos_terminals_update"
ON public.pos_terminals
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Separate DELETE policy
DROP POLICY IF EXISTS "pos_terminals_delete" ON public.pos_terminals;
CREATE POLICY "pos_terminals_delete"
ON public.pos_terminals
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Also fix cash_withdrawals RLS with same pattern
DROP POLICY IF EXISTS "users_manage_own_cash_withdrawals" ON public.cash_withdrawals;

DROP POLICY IF EXISTS "cash_withdrawals_select" ON public.cash_withdrawals;
CREATE POLICY "cash_withdrawals_select"
ON public.cash_withdrawals
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "cash_withdrawals_insert" ON public.cash_withdrawals;
CREATE POLICY "cash_withdrawals_insert"
ON public.cash_withdrawals
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "cash_withdrawals_update" ON public.cash_withdrawals;
CREATE POLICY "cash_withdrawals_update"
ON public.cash_withdrawals
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "cash_withdrawals_delete" ON public.cash_withdrawals;
CREATE POLICY "cash_withdrawals_delete"
ON public.cash_withdrawals
FOR DELETE
TO authenticated
USING (user_id = auth.uid());
