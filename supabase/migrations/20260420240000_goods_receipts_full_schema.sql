-- ============================================================
-- Goods Receipts Full Schema Enhancement
-- Adds missing columns to goods_receipts and goods_receipt_items
-- Vinculado al usuario propietario autenticado
-- ============================================================

-- 1. Add missing columns to goods_receipts
ALTER TABLE public.goods_receipts
  ADD COLUMN IF NOT EXISTS quality_notes TEXT,
  ADD COLUMN IF NOT EXISTS receiver_signature TEXT,
  ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.business_locations(id) ON DELETE SET NULL;

-- 2. Add missing columns to goods_receipt_items
ALTER TABLE public.goods_receipt_items
  ADD COLUMN IF NOT EXISTS product_name TEXT,
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS quantity_ordered NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quantity_rejected NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS batch_number TEXT,
  ADD COLUMN IF NOT EXISTS manufacture_date DATE,
  ADD COLUMN IF NOT EXISTS expiry_date DATE,
  ADD COLUMN IF NOT EXISTS location_in_warehouse TEXT,
  ADD COLUMN IF NOT EXISTS quality_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS quality_notes TEXT,
  ADD COLUMN IF NOT EXISTS purchase_order_item_id UUID REFERENCES public.purchase_order_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS stock_updated BOOLEAN DEFAULT false;

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_goods_receipts_user_id ON public.goods_receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_purchase_order_id ON public.goods_receipts(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_supplier_id ON public.goods_receipts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_status ON public.goods_receipts(status);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_received_date ON public.goods_receipts(received_date);
CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_goods_receipt_id ON public.goods_receipt_items(goods_receipt_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_catalog_item_id ON public.goods_receipt_items(catalog_item_id);

-- 4. Enable RLS (idempotent)
ALTER TABLE public.goods_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_receipt_items ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for goods_receipts
DROP POLICY IF EXISTS "users_manage_own_goods_receipts" ON public.goods_receipts;
CREATE POLICY "users_manage_own_goods_receipts"
ON public.goods_receipts
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 6. RLS Policies for goods_receipt_items (via goods_receipts)
DROP POLICY IF EXISTS "users_manage_own_goods_receipt_items" ON public.goods_receipt_items;
CREATE POLICY "users_manage_own_goods_receipt_items"
ON public.goods_receipt_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.goods_receipts gr
    WHERE gr.id = goods_receipt_items.goods_receipt_id
    AND gr.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.goods_receipts gr
    WHERE gr.id = goods_receipt_items.goods_receipt_id
    AND gr.user_id = auth.uid()
  )
);
