-- CRM Owner-Customers Full Migration
-- Adds: owner_customers (link table), customer status, business_locations reference,
--       crm_segments (custom, with criteria), crm_leads (prospects/referidos),
--       customer_consents, crm_communication_history, analytics functions

-- ============================================================
-- 1. Add missing columns to customer_profiles
-- ============================================================
ALTER TABLE public.customer_profiles
  ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'activo' CHECK (account_status IN ('activo','suspendido','eliminado')),
  ADD COLUMN IF NOT EXISTS vip_level TEXT DEFAULT 'Nuevo',
  ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_visit_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS first_visit_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS has_whatsapp BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_prepaid BOOLEAN DEFAULT false;

-- ============================================================
-- 2. owner_customers: links a customer_profile to an owner (user_profile)
--    A customer can be linked to multiple owners
-- ============================================================
CREATE TABLE IF NOT EXISTS public.owner_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.business_locations(id) ON DELETE SET NULL,
  linked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  linked_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  notes TEXT,
  UNIQUE(owner_id, customer_id)
);

CREATE INDEX IF NOT EXISTS idx_owner_customers_owner_id ON public.owner_customers(owner_id);
CREATE INDEX IF NOT EXISTS idx_owner_customers_customer_id ON public.owner_customers(customer_id);

-- ============================================================
-- 3. crm_segments: custom segments per owner with criteria
-- ============================================================
CREATE TABLE IF NOT EXISTS public.crm_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  segment_type TEXT DEFAULT 'custom' CHECK (segment_type IN ('auto','retargeting','custom')),
  color TEXT DEFAULT 'blue',
  icon TEXT DEFAULT 'Star',
  description TEXT,
  criteria JSONB DEFAULT '[]'::jsonb,
  customer_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_crm_segments_owner_id ON public.crm_segments(owner_id);

-- ============================================================
-- 4. crm_leads: prospects and referrals per owner
-- ============================================================
CREATE TABLE IF NOT EXISTS public.crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE SET NULL,
  lead_type TEXT DEFAULT 'prospect' CHECK (lead_type IN ('prospect','referral')),
  -- prospect fields
  listing_views INTEGER DEFAULT 0,
  last_view_at TIMESTAMPTZ,
  coupon_downloaded BOOLEAN DEFAULT false,
  coupon_redeemed BOOLEAN DEFAULT false,
  promotions_seen TEXT[] DEFAULT '{}',
  -- referral fields
  referred_by_customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE SET NULL,
  registered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  has_visited BOOLEAN DEFAULT false,
  -- common
  status TEXT DEFAULT 'active' CHECK (status IN ('active','converted','lost')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_crm_leads_owner_id ON public.crm_leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_lead_type ON public.crm_leads(lead_type);

-- ============================================================
-- 5. customer_consents: read-only consent record per customer
-- ============================================================
CREATE TABLE IF NOT EXISTS public.customer_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
  consent_push BOOLEAN DEFAULT false,
  consent_email BOOLEAN DEFAULT false,
  consent_whatsapp BOOLEAN DEFAULT false,
  consent_analytics BOOLEAN DEFAULT false,
  consent_third_party BOOLEAN DEFAULT false,
  arco_pending BOOLEAN DEFAULT false,
  arco_type TEXT,
  arco_requested_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(customer_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_consents_customer_id ON public.customer_consents(customer_id);

-- ============================================================
-- 6. crm_communication_history: history of communications per owner
-- ============================================================
CREATE TABLE IF NOT EXISTS public.crm_communication_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  segment_name TEXT,
  channel TEXT CHECK (channel IN ('push','whatsapp','email','sms')),
  message TEXT,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  redeemed_count INTEGER DEFAULT 0,
  sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_crm_comm_history_owner_id ON public.crm_communication_history(owner_id);

-- ============================================================
-- 7. Enable RLS
-- ============================================================
ALTER TABLE public.owner_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_communication_history ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8. RLS Policies
-- ============================================================

-- owner_customers
DROP POLICY IF EXISTS "owner_customers_owner_access" ON public.owner_customers;
CREATE POLICY "owner_customers_owner_access"
ON public.owner_customers FOR ALL TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- crm_segments
DROP POLICY IF EXISTS "crm_segments_owner_access" ON public.crm_segments;
CREATE POLICY "crm_segments_owner_access"
ON public.crm_segments FOR ALL TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- crm_leads
DROP POLICY IF EXISTS "crm_leads_owner_access" ON public.crm_leads;
CREATE POLICY "crm_leads_owner_access"
ON public.crm_leads FOR ALL TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- customer_consents: owners can read consents for their linked customers
DROP POLICY IF EXISTS "customer_consents_owner_read" ON public.customer_consents;
CREATE POLICY "customer_consents_owner_read"
ON public.customer_consents FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.owner_customers oc
    WHERE oc.customer_id = customer_consents.customer_id
    AND oc.owner_id = auth.uid()
  )
);

-- crm_communication_history
DROP POLICY IF EXISTS "crm_comm_history_owner_access" ON public.crm_communication_history;
CREATE POLICY "crm_comm_history_owner_access"
ON public.crm_communication_history FOR ALL TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- customer_profiles: owners can read profiles of their linked customers
DROP POLICY IF EXISTS "customer_profiles_owner_read" ON public.customer_profiles;
CREATE POLICY "customer_profiles_owner_read"
ON public.customer_profiles FOR SELECT TO authenticated
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.owner_customers oc
    WHERE oc.customer_id = customer_profiles.id
    AND oc.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "customer_profiles_owner_update" ON public.customer_profiles;
CREATE POLICY "customer_profiles_owner_update"
ON public.customer_profiles FOR UPDATE TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- ============================================================
-- 9. Analytics helper function: get CRM stats for owner
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_crm_stats(p_owner_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_total INTEGER;
  v_active INTEGER;
  v_dormant INTEGER;
  v_lost INTEGER;
  v_new_this_month INTEGER;
  v_leads INTEGER;
  v_referrals INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total
  FROM public.owner_customers oc
  WHERE oc.owner_id = p_owner_id;

  SELECT COUNT(*) INTO v_active
  FROM public.owner_customers oc
  JOIN public.customer_profiles cp ON cp.id = oc.customer_id
  WHERE oc.owner_id = p_owner_id AND cp.account_status = 'activo';

  SELECT COUNT(*) INTO v_new_this_month
  FROM public.owner_customers oc
  WHERE oc.owner_id = p_owner_id
  AND oc.linked_at >= date_trunc('month', CURRENT_TIMESTAMP);

  SELECT COUNT(*) INTO v_leads
  FROM public.crm_leads
  WHERE owner_id = p_owner_id AND lead_type = 'prospect' AND status = 'active';

  SELECT COUNT(*) INTO v_referrals
  FROM public.crm_leads
  WHERE owner_id = p_owner_id AND lead_type = 'referral' AND status = 'active';

  v_result := jsonb_build_object(
    'total_customers', COALESCE(v_total, 0),
    'active_customers', COALESCE(v_active, 0),
    'new_this_month', COALESCE(v_new_this_month, 0),
    'total_leads', COALESCE(v_leads, 0),
    'total_referrals', COALESCE(v_referrals, 0)
  );

  RETURN v_result;
END;
$$;

-- ============================================================
-- 10. Function: search customers by phone or email (for add modal)
-- ============================================================
CREATE OR REPLACE FUNCTION public.search_customers_by_contact(
  p_search TEXT,
  p_owner_id UUID
)
RETURNS TABLE(
  id UUID,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  vip_level TEXT,
  account_status TEXT,
  total_visits INTEGER,
  loyalty_points INTEGER,
  already_linked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.full_name,
    cp.email,
    cp.phone,
    COALESCE(cp.vip_level, 'Nuevo') AS vip_level,
    COALESCE(cp.account_status, 'activo') AS account_status,
    COALESCE(cp.total_visits, 0) AS total_visits,
    COALESCE(cp.loyalty_points, 0) AS loyalty_points,
    EXISTS(
      SELECT 1 FROM public.owner_customers oc2
      WHERE oc2.customer_id = cp.id AND oc2.owner_id = p_owner_id
    ) AS already_linked
  FROM public.customer_profiles cp
  WHERE
    (
      (p_search IS NOT NULL AND p_search != '' AND (
        cp.phone ILIKE '%' || p_search || '%'
        OR cp.email ILIKE '%' || p_search || '%'
      ))
    )
    AND cp.account_status != 'eliminado'
  ORDER BY cp.full_name
  LIMIT 20;
END;
$$;

-- ============================================================
-- 11. Function: compute segment count for owner
-- ============================================================
CREATE OR REPLACE FUNCTION public.compute_segment_count(
  p_owner_id UUID,
  p_criteria JSONB
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Simple count of linked customers as base
  SELECT COUNT(*) INTO v_count
  FROM public.owner_customers oc
  JOIN public.customer_profiles cp ON cp.id = oc.customer_id
  WHERE oc.owner_id = p_owner_id
  AND cp.account_status != 'eliminado';

  RETURN COALESCE(v_count, 0);
END;
$$;
