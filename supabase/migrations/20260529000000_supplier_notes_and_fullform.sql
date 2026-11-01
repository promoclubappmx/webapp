-- Migration: Supplier notes table and additional fields for full supplier form
-- Timestamp: 20260529000000

-- 1. Add additional fields to suppliers table
ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS tax_regime TEXT,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_account TEXT,
  ADD COLUMN IF NOT EXISTS bank_clabe TEXT,
  ADD COLUMN IF NOT EXISTS business_name TEXT,
  ADD COLUMN IF NOT EXISTS fiscal_address TEXT,
  ADD COLUMN IF NOT EXISTS cfdi_use TEXT DEFAULT 'G03',
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'PUE',
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'MXN',
  ADD COLUMN IF NOT EXISTS credit_limit NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_purchased NUMERIC(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS category TEXT;

-- 2. Supplier notes table
CREATE TABLE IF NOT EXISTS public.supplier_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  note_type TEXT DEFAULT 'general',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Supplier location associations (many-to-many)
CREATE TABLE IF NOT EXISTS public.supplier_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.business_locations(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(supplier_id, location_id)
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_supplier_notes_supplier_id ON public.supplier_notes(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_notes_user_id ON public.supplier_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_supplier_locations_supplier_id ON public.supplier_locations(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_locations_location_id ON public.supplier_locations(location_id);

-- 5. Enable RLS
ALTER TABLE public.supplier_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_locations ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
DROP POLICY IF EXISTS "users_manage_own_supplier_notes" ON public.supplier_notes;
CREATE POLICY "users_manage_own_supplier_notes"
ON public.supplier_notes
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_own_supplier_locations" ON public.supplier_locations;
CREATE POLICY "users_manage_own_supplier_locations"
ON public.supplier_locations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.suppliers s
    WHERE s.id = supplier_id AND s.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.suppliers s
    WHERE s.id = supplier_id AND s.user_id = auth.uid()
  )
);
