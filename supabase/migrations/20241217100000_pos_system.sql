-- Point of Sale (POS) System Migration
-- Purpose: Complete POS system for sales, customer identification, payments, and cash register management

-- 0. Ensure user_profiles table exists (dependency check)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'owner',
    business_name TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 0.1 Ensure catalog_items table exists (dependency check)
CREATE TABLE IF NOT EXISTS public.catalog_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    business_type TEXT,
    category_id UUID,
    price DECIMAL(10,2),
    cost DECIMAL(10,2),
    sku TEXT,
    barcode TEXT,
    image_url TEXT,
    image_path TEXT,
    status TEXT DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT false,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    weight DECIMAL(8,2),
    dimensions JSONB,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 1. Types
DROP TYPE IF EXISTS public.customer_identification_type CASCADE;
CREATE TYPE public.customer_identification_type AS ENUM ('qr_code', 'barcode', 'phone', 'email', 'manual');

DROP TYPE IF EXISTS public.transaction_status CASCADE;
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'cancelled', 'refunded', 'partially_refunded');

DROP TYPE IF EXISTS public.payment_method_type CASCADE;
CREATE TYPE public.payment_method_type AS ENUM ('cash', 'card', 'transfer', 'points', 'coupon', 'gift_card', 'mixed');

DROP TYPE IF EXISTS public.cash_register_status CASCADE;
CREATE TYPE public.cash_register_status AS ENUM ('open', 'closed');

-- 2. Customer Profiles Table
CREATE TABLE IF NOT EXISTS public.customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    qr_code TEXT UNIQUE,
    barcode TEXT UNIQUE,
    phone TEXT,
    email TEXT,
    full_name TEXT NOT NULL,
    loyalty_points INTEGER DEFAULT 0,
    total_purchases DECIMAL(10, 2) DEFAULT 0,
    total_visits INTEGER DEFAULT 0,
    tier TEXT DEFAULT 'bronze',
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Cash Register Sessions Table
CREATE TABLE IF NOT EXISTS public.cash_register_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    session_number TEXT NOT NULL,
    status public.cash_register_status DEFAULT 'open'::public.cash_register_status,
    opening_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    closing_amount DECIMAL(10, 2),
    expected_amount DECIMAL(10, 2),
    difference_amount DECIMAL(10, 2),
    total_sales DECIMAL(10, 2) DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    opened_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMPTZ,
    opened_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    closed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Transactions Table
CREATE TABLE IF NOT EXISTS public.pos_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    transaction_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE SET NULL,
    customer_identification_type public.customer_identification_type,
    cash_register_session_id UUID REFERENCES public.cash_register_sessions(id) ON DELETE SET NULL,
    status public.transaction_status DEFAULT 'pending'::public.transaction_status,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    payment_method public.payment_method_type,
    points_redeemed INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    coupon_code TEXT,
    gift_card_code TEXT,
    promotion_applied TEXT,
    notes TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Transaction Items Table
CREATE TABLE IF NOT EXISTS public.pos_transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES public.pos_transactions(id) ON DELETE CASCADE,
    catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    item_type TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Payment Details Table (for split payments)
CREATE TABLE IF NOT EXISTS public.pos_payment_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES public.pos_transactions(id) ON DELETE CASCADE,
    payment_method public.payment_method_type NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    reference_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_customer_profiles_business_id ON public.customer_profiles(business_id);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_qr_code ON public.customer_profiles(qr_code);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_barcode ON public.customer_profiles(barcode);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_phone ON public.customer_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_email ON public.customer_profiles(email);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_created_by ON public.customer_profiles(created_by);

CREATE INDEX IF NOT EXISTS idx_cash_register_sessions_business_id ON public.cash_register_sessions(business_id);
CREATE INDEX IF NOT EXISTS idx_cash_register_sessions_status ON public.cash_register_sessions(status);
CREATE INDEX IF NOT EXISTS idx_cash_register_sessions_opened_by ON public.cash_register_sessions(opened_by);

CREATE INDEX IF NOT EXISTS idx_pos_transactions_business_id ON public.pos_transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_customer_id ON public.pos_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_session_id ON public.pos_transactions(cash_register_session_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_status ON public.pos_transactions(status);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_created_by ON public.pos_transactions(created_by);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_transaction_number ON public.pos_transactions(transaction_number);

CREATE INDEX IF NOT EXISTS idx_pos_transaction_items_transaction_id ON public.pos_transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_pos_transaction_items_catalog_item_id ON public.pos_transaction_items(catalog_item_id);

CREATE INDEX IF NOT EXISTS idx_pos_payment_details_transaction_id ON public.pos_payment_details(transaction_id);

-- 8. Functions
CREATE OR REPLACE FUNCTION public.update_pos_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_transaction_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.transaction_number IS NULL THEN
        NEW.transaction_number := 'TXN-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('pos_transaction_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$;

CREATE SEQUENCE IF NOT EXISTS pos_transaction_seq START 1;

CREATE OR REPLACE FUNCTION public.update_customer_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'completed'::public.transaction_status THEN
        UPDATE public.customer_profiles
        SET 
            total_purchases = total_purchases + NEW.total_amount,
            total_visits = total_visits + 1,
            loyalty_points = loyalty_points + COALESCE(NEW.points_earned, 0) - COALESCE(NEW.points_redeemed, 0),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.customer_id;
    END IF;
    
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status = 'completed'::public.transaction_status THEN
        UPDATE public.customer_profiles
        SET 
            total_purchases = total_purchases + NEW.total_amount,
            total_visits = total_visits + 1,
            loyalty_points = loyalty_points + COALESCE(NEW.points_earned, 0) - COALESCE(NEW.points_redeemed, 0),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.customer_id;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_cash_register_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'completed'::public.transaction_status THEN
        UPDATE public.cash_register_sessions
        SET 
            total_sales = total_sales + NEW.total_amount,
            total_transactions = total_transactions + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.cash_register_session_id;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_inventory_on_sale()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.catalog_items
        SET 
            stock_quantity = stock_quantity - NEW.quantity,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.catalog_item_id
        AND business_type = 'product';
    END IF;
    
    RETURN NEW;
END;
$$;

-- 9. Enable RLS
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_register_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_payment_details ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies
DROP POLICY IF EXISTS "users_manage_own_customer_profiles" ON public.customer_profiles;
CREATE POLICY "users_manage_own_customer_profiles"
ON public.customer_profiles
FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "users_manage_own_cash_register_sessions" ON public.cash_register_sessions;
CREATE POLICY "users_manage_own_cash_register_sessions"
ON public.cash_register_sessions
FOR ALL
TO authenticated
USING (opened_by = auth.uid() OR closed_by = auth.uid())
WITH CHECK (opened_by = auth.uid() OR closed_by = auth.uid());

DROP POLICY IF EXISTS "users_manage_own_pos_transactions" ON public.pos_transactions;
CREATE POLICY "users_manage_own_pos_transactions"
ON public.pos_transactions
FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "users_view_own_pos_transaction_items" ON public.pos_transaction_items;
CREATE POLICY "users_view_own_pos_transaction_items"
ON public.pos_transaction_items
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.pos_transactions pt
        WHERE pt.id = transaction_id
        AND pt.created_by = auth.uid()
    )
);

DROP POLICY IF EXISTS "users_create_pos_transaction_items" ON public.pos_transaction_items;
CREATE POLICY "users_create_pos_transaction_items"
ON public.pos_transaction_items
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.pos_transactions pt
        WHERE pt.id = transaction_id
        AND pt.created_by = auth.uid()
    )
);

DROP POLICY IF EXISTS "users_view_own_pos_payment_details" ON public.pos_payment_details;
CREATE POLICY "users_view_own_pos_payment_details"
ON public.pos_payment_details
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.pos_transactions pt
        WHERE pt.id = transaction_id
        AND pt.created_by = auth.uid()
    )
);

DROP POLICY IF EXISTS "users_create_pos_payment_details" ON public.pos_payment_details;
CREATE POLICY "users_create_pos_payment_details"
ON public.pos_payment_details
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.pos_transactions pt
        WHERE pt.id = transaction_id
        AND pt.created_by = auth.uid()
    )
);

-- 11. Triggers
DROP TRIGGER IF EXISTS update_customer_profiles_timestamp ON public.customer_profiles;
CREATE TRIGGER update_customer_profiles_timestamp
    BEFORE UPDATE ON public.customer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_pos_timestamp();

DROP TRIGGER IF EXISTS update_cash_register_sessions_timestamp ON public.cash_register_sessions;
CREATE TRIGGER update_cash_register_sessions_timestamp
    BEFORE UPDATE ON public.cash_register_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_pos_timestamp();

DROP TRIGGER IF EXISTS update_pos_transactions_timestamp ON public.pos_transactions;
CREATE TRIGGER update_pos_transactions_timestamp
    BEFORE UPDATE ON public.pos_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_pos_timestamp();

DROP TRIGGER IF EXISTS generate_transaction_number_trigger ON public.pos_transactions;
CREATE TRIGGER generate_transaction_number_trigger
    BEFORE INSERT ON public.pos_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_transaction_number();

DROP TRIGGER IF EXISTS update_customer_stats_trigger ON public.pos_transactions;
CREATE TRIGGER update_customer_stats_trigger
    AFTER INSERT OR UPDATE ON public.pos_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_customer_stats();

DROP TRIGGER IF EXISTS update_cash_register_stats_trigger ON public.pos_transactions;
CREATE TRIGGER update_cash_register_stats_trigger
    AFTER INSERT ON public.pos_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_cash_register_stats();

DROP TRIGGER IF EXISTS update_inventory_on_sale_trigger ON public.pos_transaction_items;
CREATE TRIGGER update_inventory_on_sale_trigger
    AFTER INSERT ON public.pos_transaction_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_inventory_on_sale();

-- 12. Mock Data
DO $$
DECLARE
    existing_user_id UUID;
    customer1_id UUID := gen_random_uuid();
    customer2_id UUID := gen_random_uuid();
    customer3_id UUID := gen_random_uuid();
    session1_id UUID := gen_random_uuid();
    transaction1_id UUID := gen_random_uuid();
    transaction2_id UUID := gen_random_uuid();
BEGIN
    -- Get first user from user_profiles
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Insert customer profiles
        INSERT INTO public.customer_profiles (
            id, business_id, qr_code, barcode, phone, email, full_name,
            loyalty_points, total_purchases, total_visits, tier, created_by
        ) VALUES
            (
                customer1_id, '1', 'QR-CUST-001', 'BC-001', '+34612345678',
                'maria.garcia@email.com', 'María García', 1250, 450.50, 15,
                'gold', existing_user_id
            ),
            (
                customer2_id, '1', 'QR-CUST-002', 'BC-002', '+34623456789',
                'juan.martinez@email.com', 'Juan Martínez', 580, 230.75, 8,
                'silver', existing_user_id
            ),
            (
                customer3_id, '2', 'QR-CUST-003', 'BC-003', '+34634567890',
                'ana.lopez@email.com', 'Ana López', 2340, 890.25, 28,
                'platinum', existing_user_id
            )
        ON CONFLICT (id) DO NOTHING;
        
        -- Insert cash register session
        INSERT INTO public.cash_register_sessions (
            id, business_id, session_number, status, opening_amount,
            total_sales, total_transactions, opened_by
        ) VALUES
            (
                session1_id, '1', 'REG-20241217-001', 'open'::public.cash_register_status,
                100.00, 0, 0, existing_user_id
            )
        ON CONFLICT (id) DO NOTHING;
        
        -- Insert sample transactions
        INSERT INTO public.pos_transactions (
            id, business_id, transaction_number, customer_id,
            customer_identification_type, cash_register_session_id, status,
            subtotal, tax_amount, discount_amount, total_amount,
            payment_method, points_earned, created_by
        ) VALUES
            (
                transaction1_id, '1', 'TXN-20241217-000001', customer1_id,
                'qr_code'::public.customer_identification_type, session1_id,
                'completed'::public.transaction_status, 45.00, 4.50, 5.00,
                44.50, 'card'::public.payment_method_type, 45, existing_user_id
            ),
            (
                transaction2_id, '1', 'TXN-20241217-000002', customer2_id,
                'phone'::public.customer_identification_type, session1_id,
                'completed'::public.transaction_status, 28.00, 2.80, 0,
                30.80, 'cash'::public.payment_method_type, 28, existing_user_id
            )
        ON CONFLICT (transaction_number) DO NOTHING;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting mock data: %', SQLERRM;
END;
$$;