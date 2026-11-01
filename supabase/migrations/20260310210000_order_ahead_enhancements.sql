-- ============================================================
-- ORDER AHEAD MODULE ENHANCEMENTS
-- Adds missing columns for payment mode, delivery mode,
-- confirmation settings, client instructions, and column renames
-- ============================================================

-- Add missing columns to order_ahead_config
ALTER TABLE public.order_ahead_config
ADD COLUMN IF NOT EXISTS payment_mode TEXT DEFAULT 'pay_on_pickup',
ADD COLUMN IF NOT EXISTS delivery_mode TEXT DEFAULT 'with_slot',
ADD COLUMN IF NOT EXISTS confirmation_mode TEXT DEFAULT 'automatic',
ADD COLUMN IF NOT EXISTS confirmation_timeout_minutes INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS client_instructions TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS confirmed_column_label TEXT DEFAULT 'En preparación',
ADD COLUMN IF NOT EXISTS inactive_message TEXT DEFAULT 'Este negocio no acepta pedidos anticipados por el momento',
ADD COLUMN IF NOT EXISTS allow_future_days BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_push BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_email TEXT DEFAULT 'per_order',
ADD COLUMN IF NOT EXISTS notify_whatsapp TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS notify_push_number TEXT DEFAULT '';

-- Add missing columns to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS slot_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS has_slot BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pay_on_pickup',
ADD COLUMN IF NOT EXISTS customer_channel TEXT DEFAULT 'app',
ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS points_used INTEGER DEFAULT 0;

-- Sync slot_time from pickup_slot for existing rows
UPDATE public.orders SET slot_time = pickup_slot WHERE slot_time IS NULL AND pickup_slot IS NOT NULL;

-- Add missing columns to order_items
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS line_total DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Sync line_total from subtotal for existing rows
UPDATE public.order_items SET line_total = subtotal WHERE line_total IS NULL;

-- Add missing columns to featured_items
ALTER TABLE public.featured_items
ADD COLUMN IF NOT EXISTS item_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS accumulated_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_indefinite BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS max_budget_mxn DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS catalog_item_id_ref UUID;

-- Sync item_status from status for existing rows
UPDATE public.featured_items SET item_status = status::TEXT WHERE item_status IS NULL OR item_status = 'active';

-- Add missing columns to upsell_rules
ALTER TABLE public.upsell_rules
ADD COLUMN IF NOT EXISTS condition_value TEXT,
ADD COLUMN IF NOT EXISTS suggest_item_id_ref UUID;

-- Sync condition_value
UPDATE public.upsell_rules SET condition_value = condition_min_amount::TEXT WHERE condition_value IS NULL AND condition_min_amount IS NOT NULL;
UPDATE public.upsell_rules SET condition_value = condition_category WHERE condition_value IS NULL AND condition_category IS NOT NULL;

-- Add order_slot_exceptions alias (the app uses this name)
CREATE TABLE IF NOT EXISTS public.order_slot_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID REFERENCES public.order_ahead_config(id) ON DELETE CASCADE,
    exception_date DATE NOT NULL,
    is_closed BOOLEAN DEFAULT true,
    override_start TIME,
    override_end TIME,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_slot_exceptions_config ON public.order_slot_exceptions(config_id);
ALTER TABLE public.order_slot_exceptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_order_slot_exceptions" ON public.order_slot_exceptions;
CREATE POLICY "users_manage_own_order_slot_exceptions" ON public.order_slot_exceptions
FOR ALL TO authenticated
USING (config_id IN (SELECT id FROM public.order_ahead_config WHERE business_id = auth.uid()))
WITH CHECK (config_id IN (SELECT id FROM public.order_ahead_config WHERE business_id = auth.uid()));

-- Update mock data with new fields
DO $$
DECLARE
    existing_user_id UUID;
    config_id_val UUID;
BEGIN
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    IF existing_user_id IS NOT NULL THEN
        SELECT id INTO config_id_val FROM public.order_ahead_config WHERE business_id = existing_user_id LIMIT 1;
        IF config_id_val IS NOT NULL THEN
            UPDATE public.order_ahead_config
            SET
                payment_mode = 'both',
                delivery_mode = 'both',
                confirmation_mode = 'manual',
                confirmation_timeout_minutes = 20,
                client_instructions = 'Pasa por la ventanilla lateral con tu código de pedido. Tu pedido estará listo en aprox. 20 minutos.',
                confirmed_column_label = 'En preparación',
                inactive_message = 'Este negocio no acepta pedidos anticipados por el momento',
                notify_push = true,
                notify_email = 'per_order'
            WHERE id = config_id_val;

            -- Update orders with slot_time and payment_method
            UPDATE public.orders SET
                slot_time = pickup_slot,
                payment_method = payment_status::TEXT,
                has_slot = true,
                status_history = '[]'::jsonb
            WHERE business_id = existing_user_id AND slot_time IS NULL;

            -- Update order_items with line_total
            UPDATE public.order_items SET line_total = subtotal
            WHERE order_id IN (SELECT id FROM public.orders WHERE business_id = existing_user_id)
            AND line_total IS NULL;
        END IF;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Enhancement mock data update failed: %', SQLERRM;
END $$;
