-- Goods Receipt Module Migration
-- Timestamp: 20260225210000

-- Create goods_receipts table
CREATE TABLE IF NOT EXISTS public.goods_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  receipt_number TEXT NOT NULL,
  purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
  purchase_order_number TEXT,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  supplier_name TEXT,
  supplier_email TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'partial', 'rejected')),
  received_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  receiver_name TEXT,
  receiver_signature TEXT,
  quality_notes TEXT,
  evidence_photos JSONB DEFAULT '[]'::jsonb,
  discrepancies JSONB DEFAULT '[]'::jsonb,
  total_ordered NUMERIC(12,2) DEFAULT 0,
  total_received NUMERIC(12,2) DEFAULT 0,
  total_rejected NUMERIC(12,2) DEFAULT 0,
  supplier_notified BOOLEAN DEFAULT false,
  supplier_notified_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create goods_receipt_items table
CREATE TABLE IF NOT EXISTS public.goods_receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goods_receipt_id UUID NOT NULL REFERENCES public.goods_receipts(id) ON DELETE CASCADE,
  purchase_order_item_id UUID REFERENCES public.purchase_order_items(id) ON DELETE SET NULL,
  catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  sku TEXT,
  quantity_ordered NUMERIC(12,2) DEFAULT 0,
  quantity_received NUMERIC(12,2) DEFAULT 0,
  quantity_rejected NUMERIC(12,2) DEFAULT 0,
  rejection_reason TEXT,
  unit_cost NUMERIC(12,2) DEFAULT 0,
  batch_number TEXT,
  manufacture_date DATE,
  expiry_date DATE,
  quality_status TEXT DEFAULT 'pending' CHECK (quality_status IN ('pending', 'approved', 'rejected', 'partial')),
  quality_notes TEXT,
  location_in_warehouse TEXT,
  stock_updated BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_goods_receipts_user_id ON public.goods_receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_purchase_order_id ON public.goods_receipts(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_status ON public.goods_receipts(status);
CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_receipt_id ON public.goods_receipt_items(goods_receipt_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_catalog_item_id ON public.goods_receipt_items(catalog_item_id);

-- Enable RLS
ALTER TABLE public.goods_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_receipt_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for goods_receipts
DROP POLICY IF EXISTS "users_manage_own_goods_receipts" ON public.goods_receipts;
CREATE POLICY "users_manage_own_goods_receipts"
ON public.goods_receipts
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- RLS Policies for goods_receipt_items
DROP POLICY IF EXISTS "users_manage_own_goods_receipt_items" ON public.goods_receipt_items;
CREATE POLICY "users_manage_own_goods_receipt_items"
ON public.goods_receipt_items
FOR ALL
TO authenticated
USING (
  goods_receipt_id IN (
    SELECT id FROM public.goods_receipts WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  goods_receipt_id IN (
    SELECT id FROM public.goods_receipts WHERE user_id = auth.uid()
  )
);

-- Function to update goods_receipt totals
CREATE OR REPLACE FUNCTION public.update_goods_receipt_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.goods_receipts
  SET
    total_ordered = (
      SELECT COALESCE(SUM(quantity_ordered * unit_cost), 0)
      FROM public.goods_receipt_items
      WHERE goods_receipt_id = COALESCE(NEW.goods_receipt_id, OLD.goods_receipt_id)
    ),
    total_received = (
      SELECT COALESCE(SUM(quantity_received * unit_cost), 0)
      FROM public.goods_receipt_items
      WHERE goods_receipt_id = COALESCE(NEW.goods_receipt_id, OLD.goods_receipt_id)
    ),
    total_rejected = (
      SELECT COALESCE(SUM(quantity_rejected * unit_cost), 0)
      FROM public.goods_receipt_items
      WHERE goods_receipt_id = COALESCE(NEW.goods_receipt_id, OLD.goods_receipt_id)
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = COALESCE(NEW.goods_receipt_id, OLD.goods_receipt_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger for totals
DROP TRIGGER IF EXISTS update_goods_receipt_totals_trigger ON public.goods_receipt_items;
CREATE TRIGGER update_goods_receipt_totals_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.goods_receipt_items
FOR EACH ROW EXECUTE FUNCTION public.update_goods_receipt_totals();
