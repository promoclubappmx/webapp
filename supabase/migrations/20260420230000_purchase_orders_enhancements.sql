-- Purchase Orders Enhancements Migration
-- Adds: location_id, order_date, subtotal_amount, tax_rate, tax_amount to purchase_orders
-- Adds: recurring_order_config table
-- Adds: get_low_stock_items_by_supplier function

-- 1. Add new columns to purchase_orders
ALTER TABLE public.purchase_orders
  ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.business_locations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS order_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS subtotal_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_rate NUMERIC DEFAULT 16,
  ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0;

-- 2. Create recurring_order_config table
CREATE TABLE IF NOT EXISTS public.recurring_order_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT false,
  frequency TEXT DEFAULT 'weekly',
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recurring_order_config_user_id ON public.recurring_order_config(user_id);

-- 3. Enable RLS on recurring_order_config
ALTER TABLE public.recurring_order_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_recurring_order_config" ON public.recurring_order_config;
CREATE POLICY "users_manage_own_recurring_order_config"
ON public.recurring_order_config
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 4. Function: get low stock items grouped by supplier
CREATE OR REPLACE FUNCTION public.get_low_stock_items_by_supplier(p_user_id UUID)
RETURNS TABLE(
  supplier_id UUID,
  supplier_name TEXT,
  supplier_email TEXT,
  supplier_phone TEXT,
  catalog_item_id UUID,
  item_name TEXT,
  sku TEXT,
  stock_quantity INTEGER,
  min_stock_level INTEGER,
  purchase_price NUMERIC,
  suggested_quantity INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS supplier_id,
    s.name AS supplier_name,
    s.email AS supplier_email,
    s.phone AS supplier_phone,
    ci.id AS catalog_item_id,
    ci.name AS item_name,
    ci.sku,
    COALESCE(ci.stock_quantity, 0)::INTEGER AS stock_quantity,
    COALESCE(ci.min_stock_level, 0)::INTEGER AS min_stock_level,
    COALESCE(sp.purchase_price, ci.cost, 0) AS purchase_price,
    GREATEST(
      COALESCE(ci.min_stock_level, 5) * 2 - COALESCE(ci.stock_quantity, 0),
      COALESCE(ci.min_stock_level, 5)
    )::INTEGER AS suggested_quantity
  FROM public.supplier_products sp
  JOIN public.suppliers s ON sp.supplier_id = s.id
  JOIN public.catalog_items ci ON sp.catalog_item_id = ci.id
  WHERE s.user_id = p_user_id
    AND s.is_active = true
    AND (ci.stock_quantity IS NULL OR ci.stock_quantity <= COALESCE(ci.min_stock_level, 0))
  ORDER BY s.name, ci.name;
END;
$$;

-- 5. Function: upsert recurring order config
CREATE OR REPLACE FUNCTION public.upsert_recurring_order_config(
  p_user_id UUID,
  p_is_enabled BOOLEAN,
  p_frequency TEXT DEFAULT 'weekly'
)
RETURNS public.recurring_order_config
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result public.recurring_order_config;
BEGIN
  INSERT INTO public.recurring_order_config (user_id, is_enabled, frequency, updated_at)
  VALUES (p_user_id, p_is_enabled, p_frequency, now())
  ON CONFLICT (user_id) DO UPDATE
    SET is_enabled = EXCLUDED.is_enabled,
        frequency = EXCLUDED.frequency,
        updated_at = now()
  RETURNING * INTO v_result;
  RETURN v_result;
END;
$$;

-- Add unique constraint for recurring_order_config per user (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'recurring_order_config_user_id_key'
  ) THEN
    ALTER TABLE public.recurring_order_config ADD CONSTRAINT recurring_order_config_user_id_key UNIQUE (user_id);
  END IF;
END $$;
