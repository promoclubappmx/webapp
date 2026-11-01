-- Migration: Suppliers and Purchase Orders
-- Timestamp: 20260225190000

-- ============================================================
-- TYPES
-- ============================================================
DROP TYPE IF EXISTS public.purchase_order_status CASCADE;
CREATE TYPE public.purchase_order_status AS ENUM (
  'draft',
  'sent',
  'in_process',
  'received_partial',
  'received_complete',
  'paid',
  'pending_payment',
  'cancelled'
);

-- ============================================================
-- SUPPLIERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  rfc TEXT,
  payment_terms TEXT DEFAULT 'net30',
  delivery_days INTEGER DEFAULT 3,
  rating NUMERIC(2,1) DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  total_purchased NUMERIC(12,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SUPPLIER PRODUCTS (association)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.supplier_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
  catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE CASCADE,
  purchase_price NUMERIC(12,2),
  is_preferred BOOLEAN DEFAULT false,
  lead_time_days INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(supplier_id, catalog_item_id)
);

-- ============================================================
-- PURCHASE ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  supplier_name TEXT,
  supplier_email TEXT,
  supplier_phone TEXT,
  status public.purchase_order_status DEFAULT 'draft'::public.purchase_order_status,
  total_amount NUMERIC(12,2) DEFAULT 0,
  expected_delivery_date DATE,
  sent_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  delivered_on_time BOOLEAN,
  is_auto_generated BOOLEAN DEFAULT false,
  notes TEXT,
  invoice_number TEXT,
  invoice_date DATE,
  payment_date DATE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PURCHASE ORDER ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_cost NUMERIC(12,2) DEFAULT 0,
  subtotal NUMERIC(12,2) DEFAULT 0,
  received_quantity INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- EXTEND CATALOG ITEMS with inventory fields
-- ============================================================
ALTER TABLE public.catalog_items
  ADD COLUMN IF NOT EXISTS optimal_stock_level INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS purchase_cost NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS lot_number TEXT,
  ADD COLUMN IF NOT EXISTS expiry_date DATE,
  ADD COLUMN IF NOT EXISTS warehouse_location TEXT,
  ADD COLUMN IF NOT EXISTS tax_region TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS manage_inventory BOOLEAN DEFAULT false;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON public.suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_supplier_products_supplier_id ON public.supplier_products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_products_catalog_item_id ON public.supplier_products(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_user_id ON public.purchase_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON public.purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_order_id ON public.purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_catalog_item_id ON public.purchase_order_items(catalog_item_id);

-- ============================================================
-- FUNCTION: Update supplier totals after order status change
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_supplier_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.supplier_id IS NOT NULL AND (NEW.status = 'paid' OR NEW.status = 'received_complete') THEN
    UPDATE public.suppliers
    SET
      total_purchased = (
        SELECT COALESCE(SUM(total_amount), 0)
        FROM public.purchase_orders
        WHERE supplier_id = NEW.supplier_id
          AND status IN ('paid', 'received_complete')
      ),
      total_orders = (
        SELECT COUNT(*)
        FROM public.purchase_orders
        WHERE supplier_id = NEW.supplier_id
          AND status != 'cancelled'
      ),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.supplier_id;
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================================
-- ENABLE RLS
-- ============================================================
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "users_manage_own_suppliers" ON public.suppliers;
CREATE POLICY "users_manage_own_suppliers"
ON public.suppliers FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_own_supplier_products" ON public.supplier_products;
CREATE POLICY "users_manage_own_supplier_products"
ON public.supplier_products FOR ALL TO authenticated
USING (
  supplier_id IN (SELECT id FROM public.suppliers WHERE user_id = auth.uid())
)
WITH CHECK (
  supplier_id IN (SELECT id FROM public.suppliers WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "users_manage_own_purchase_orders" ON public.purchase_orders;
CREATE POLICY "users_manage_own_purchase_orders"
ON public.purchase_orders FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_own_purchase_order_items" ON public.purchase_order_items;
CREATE POLICY "users_manage_own_purchase_order_items"
ON public.purchase_order_items FOR ALL TO authenticated
USING (
  purchase_order_id IN (SELECT id FROM public.purchase_orders WHERE user_id = auth.uid())
)
WITH CHECK (
  purchase_order_id IN (SELECT id FROM public.purchase_orders WHERE user_id = auth.uid())
);

-- ============================================================
-- TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS update_supplier_totals_trigger ON public.purchase_orders;
CREATE TRIGGER update_supplier_totals_trigger
  AFTER UPDATE ON public.purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_supplier_totals();
