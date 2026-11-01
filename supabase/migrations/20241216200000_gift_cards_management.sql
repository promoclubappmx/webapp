-- Gift Cards Management Migration
-- Purpose: Complete gift card system for tracking issued and redeemed cards

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

-- 1. Types (with idempotency)
DROP TYPE IF EXISTS public.gift_card_status CASCADE;
CREATE TYPE public.gift_card_status AS ENUM ('active', 'used', 'expired', 'cancelled');

DROP TYPE IF EXISTS public.gift_card_transaction_type CASCADE;
CREATE TYPE public.gift_card_transaction_type AS ENUM ('issued', 'redeemed', 'balance_adjustment', 'expired', 'cancelled');

-- 2. Core Tables
CREATE TABLE IF NOT EXISTS public.gift_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    initial_value DECIMAL(10, 2) NOT NULL,
    current_balance DECIMAL(10, 2) NOT NULL,
    status public.gift_card_status DEFAULT 'active'::public.gift_card_status,
    issued_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMPTZ,
    redeemed_date TIMESTAMPTZ,
    recipient_name TEXT,
    recipient_email TEXT,
    recipient_phone TEXT,
    notes TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.gift_card_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gift_card_id UUID REFERENCES public.gift_cards(id) ON DELETE CASCADE,
    transaction_type public.gift_card_transaction_type NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    balance_after DECIMAL(10, 2) NOT NULL,
    transaction_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    location TEXT,
    notes TEXT,
    performed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_gift_cards_business_id ON public.gift_cards(business_id);
CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON public.gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gift_cards_status ON public.gift_cards(status);
CREATE INDEX IF NOT EXISTS idx_gift_cards_created_by ON public.gift_cards(created_by);
CREATE INDEX IF NOT EXISTS idx_gift_cards_expiry_date ON public.gift_cards(expiry_date);
CREATE INDEX IF NOT EXISTS idx_gift_card_transactions_gift_card_id ON public.gift_card_transactions(gift_card_id);
CREATE INDEX IF NOT EXISTS idx_gift_card_transactions_type ON public.gift_card_transactions(transaction_type);

-- 4. Functions (BEFORE RLS policies)
CREATE OR REPLACE FUNCTION public.update_gift_card_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_gift_card_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create transaction record when gift card is created
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.gift_card_transactions (
            gift_card_id,
            transaction_type,
            amount,
            balance_after,
            location,
            notes,
            performed_by
        ) VALUES (
            NEW.id,
            'issued'::public.gift_card_transaction_type,
            NEW.initial_value,
            NEW.current_balance,
            'Sistema',
            'Tarjeta de regalo emitida',
            NEW.created_by
        );
    END IF;
    
    -- Create transaction when status changes to used
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status = 'used'::public.gift_card_status THEN
        INSERT INTO public.gift_card_transactions (
            gift_card_id,
            transaction_type,
            amount,
            balance_after,
            location,
            notes,
            performed_by
        ) VALUES (
            NEW.id,
            'redeemed'::public.gift_card_transaction_type,
            NEW.current_balance,
            0,
            'Negocio',
            'Tarjeta de regalo canjeada completamente',
            NEW.created_by
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- 5. Enable RLS
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_card_transactions ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies (AFTER functions)
DROP POLICY IF EXISTS "users_manage_own_gift_cards" ON public.gift_cards;
CREATE POLICY "users_manage_own_gift_cards"
ON public.gift_cards
FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "users_view_own_gift_card_transactions" ON public.gift_card_transactions;
CREATE POLICY "users_view_own_gift_card_transactions"
ON public.gift_card_transactions
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.gift_cards gc
        WHERE gc.id = gift_card_id
        AND gc.created_by = auth.uid()
    )
);

DROP POLICY IF EXISTS "users_create_gift_card_transactions" ON public.gift_card_transactions;
CREATE POLICY "users_create_gift_card_transactions"
ON public.gift_card_transactions
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.gift_cards gc
        WHERE gc.id = gift_card_id
        AND gc.created_by = auth.uid()
    )
);

-- 7. Triggers
DROP TRIGGER IF EXISTS update_gift_cards_timestamp ON public.gift_cards;
CREATE TRIGGER update_gift_cards_timestamp
    BEFORE UPDATE ON public.gift_cards
    FOR EACH ROW
    EXECUTE FUNCTION public.update_gift_card_timestamp();

DROP TRIGGER IF EXISTS create_gift_card_transaction_trigger ON public.gift_cards;
CREATE TRIGGER create_gift_card_transaction_trigger
    AFTER INSERT OR UPDATE ON public.gift_cards
    FOR EACH ROW
    EXECUTE FUNCTION public.create_gift_card_transaction();

-- 8. Mock Data
DO $$
DECLARE
    existing_user_id UUID;
    card1_id UUID := gen_random_uuid();
    card2_id UUID := gen_random_uuid();
    card3_id UUID := gen_random_uuid();
    card4_id UUID := gen_random_uuid();
    card5_id UUID := gen_random_uuid();
    card6_id UUID := gen_random_uuid();
BEGIN
    -- Get first user from user_profiles
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Insert gift cards
        INSERT INTO public.gift_cards (
            id, business_id, code, initial_value, current_balance, status,
            issued_date, expiry_date, redeemed_date, recipient_name, recipient_email,
            recipient_phone, notes, created_by
        ) VALUES
            (
                card1_id, '1', 'GC-2024-001', 50.00, 50.00, 'active'::public.gift_card_status,
                CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP + INTERVAL '90 days', NULL,
                'María García', 'maria.garcia@email.com', '+34 612 345 678',
                'Tarjeta de regalo para cliente frecuente', existing_user_id
            ),
            (
                card2_id, '1', 'GC-2024-002', 100.00, 35.50, 'active'::public.gift_card_status,
                CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP + INTERVAL '75 days', NULL,
                'Juan Martínez', 'juan.martinez@email.com', '+34 623 456 789',
                'Regalo de cumpleaños', existing_user_id
            ),
            (
                card3_id, '2', 'GC-2024-003', 75.00, 0.00, 'used'::public.gift_card_status,
                CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP + INTERVAL '60 days',
                CURRENT_TIMESTAMP - INTERVAL '10 days', 'Ana López', 'ana.lopez@email.com',
                '+34 634 567 890', 'Promoción especial', existing_user_id
            ),
            (
                card4_id, '3', 'GC-2024-004', 200.00, 0.00, 'used'::public.gift_card_status,
                CURRENT_TIMESTAMP - INTERVAL '45 days', CURRENT_TIMESTAMP + INTERVAL '45 days',
                CURRENT_TIMESTAMP - INTERVAL '20 days', 'Carlos Ruiz', 'carlos.ruiz@email.com',
                '+34 645 678 901', 'Cliente VIP', existing_user_id
            ),
            (
                card5_id, '1', 'GC-2024-005', 50.00, 0.00, 'expired'::public.gift_card_status,
                CURRENT_TIMESTAMP - INTERVAL '120 days', CURRENT_TIMESTAMP - INTERVAL '30 days', NULL,
                'Laura Fernández', 'laura.fernandez@email.com', '+34 656 789 012',
                'Tarjeta expirada sin uso', existing_user_id
            ),
            (
                card6_id, '2', 'GC-2024-006', 150.00, 150.00, 'active'::public.gift_card_status,
                CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '88 days', NULL,
                'Pedro Sánchez', 'pedro.sanchez@email.com', '+34 667 890 123',
                'Tarjeta corporativa', existing_user_id
            )
        ON CONFLICT (id) DO NOTHING;
        
        -- Additional transactions for partially used card
        INSERT INTO public.gift_card_transactions (
            gift_card_id, transaction_type, amount, balance_after,
            transaction_date, location, notes, performed_by
        ) VALUES
            (
                card2_id, 'redeemed'::public.gift_card_transaction_type, 30.00, 70.00,
                CURRENT_TIMESTAMP - INTERVAL '10 days', 'Restaurante El Jardín',
                'Canje parcial - Cena', existing_user_id
            ),
            (
                card2_id, 'redeemed'::public.gift_card_transaction_type, 34.50, 35.50,
                CURRENT_TIMESTAMP - INTERVAL '5 days', 'Restaurante El Jardín',
                'Canje parcial - Almuerzo', existing_user_id
            )
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Mock gift cards data created successfully';
    ELSE
        RAISE NOTICE 'No users found in user_profiles. Skipping mock data creation.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating mock data: %', SQLERRM;
END;
$$;