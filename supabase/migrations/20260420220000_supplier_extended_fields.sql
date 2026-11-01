-- Migration: Supplier extended fields and ratings
-- Adds address breakdown, category_id, and supplier_ratings table

-- 1. Add extended columns to suppliers table
ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS street TEXT,
  ADD COLUMN IF NOT EXISTS ext_number TEXT,
  ADD COLUMN IF NOT EXISTS int_number TEXT,
  ADD COLUMN IF NOT EXISTS neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'México',
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS tax_regime TEXT,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_account TEXT,
  ADD COLUMN IF NOT EXISTS bank_clabe TEXT,
  ADD COLUMN IF NOT EXISTS products_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- 2. Supplier ratings table
CREATE TABLE IF NOT EXISTS public.supplier_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  rating NUMERIC(3,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  quality_rating NUMERIC(3,1),
  delivery_rating NUMERIC(3,1),
  price_rating NUMERIC(3,1),
  service_rating NUMERIC(3,1),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON public.suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_category_id ON public.suppliers(category_id);
CREATE INDEX IF NOT EXISTS idx_supplier_ratings_supplier_id ON public.supplier_ratings(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_ratings_user_id ON public.supplier_ratings(user_id);

-- 4. Enable RLS
ALTER TABLE public.supplier_ratings ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for supplier_ratings
DROP POLICY IF EXISTS "users_manage_own_supplier_ratings" ON public.supplier_ratings;
CREATE POLICY "users_manage_own_supplier_ratings"
ON public.supplier_ratings
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
