-- Inventory Transfers
CREATE TABLE IF NOT EXISTS public.inventory_transfers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transfer_number TEXT NOT NULL,
  source_warehouse TEXT NOT NULL,
  destination_warehouse TEXT NOT NULL,
  reason TEXT,
  notes TEXT,
  status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'in_transit', 'received', 'cancelled')),
  total_cost_adjustment NUMERIC(12,2) DEFAULT 0,
  requested_by TEXT,
  approved_by TEXT,
  shipped_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_transfer_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transfer_id UUID REFERENCES public.inventory_transfers(id) ON DELETE CASCADE,
  catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE SET NULL,
  product_name TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_cost NUMERIC(12,2) DEFAULT 0,
  batch_number TEXT,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto Reorder Rules
CREATE TABLE IF NOT EXISTS public.auto_reorder_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  trigger_stock_level INTEGER NOT NULL DEFAULT 5,
  reorder_quantity INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.inventory_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_reorder_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own transfers" ON public.inventory_transfers;
CREATE POLICY "Users manage own transfers" ON public.inventory_transfers
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own transfer items" ON public.inventory_transfer_items;
CREATE POLICY "Users manage own transfer items" ON public.inventory_transfer_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.inventory_transfers t WHERE t.id = transfer_id AND t.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users manage own reorder rules" ON public.auto_reorder_rules;
CREATE POLICY "Users manage own reorder rules" ON public.auto_reorder_rules
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
