-- =====================================================
-- ALERT SETTINGS ENHANCEMENTS
-- Migration: 20260221052000
-- Purpose: Add delivery schedules, location-specific alert settings, and automatic triggers
-- =====================================================

-- 1. Add delivery schedule columns to alert_configurations
ALTER TABLE public.alert_configurations
ADD COLUMN IF NOT EXISTS delivery_schedule JSONB DEFAULT '{"enabled": false, "quiet_hours": {"enabled": false, "start": "22:00", "end": "08:00"}, "frequency": "immediate", "days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]}'::jsonb,
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.business_locations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS applies_to_all_locations BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"in_app": true, "email": false, "sms": false, "push": false}'::jsonb;

-- 2. Drop existing unique constraint and create new one that includes location_id
ALTER TABLE public.alert_configurations DROP CONSTRAINT IF EXISTS alert_configurations_business_id_alert_type_key;
ALTER TABLE public.alert_configurations ADD CONSTRAINT alert_configurations_business_location_type_unique UNIQUE(business_id, alert_type, location_id);

-- 3. Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_alert_configurations_location_id ON public.alert_configurations(location_id);

-- 4. Update trigger function for high-value sales to check location-specific settings
CREATE OR REPLACE FUNCTION public.create_high_value_sale_alert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_threshold DECIMAL(10, 2);
    v_enabled BOOLEAN;
    v_customer_name TEXT;
    v_location_id UUID;
    v_notification_channels JSONB;
BEGIN
    -- Get location_id from transaction metadata if available
    v_location_id := (NEW.metadata->>'location_id')::UUID;

    -- Check location-specific configuration first, then fall back to global
    SELECT is_enabled, threshold_value, notification_channels 
    INTO v_enabled, v_threshold, v_notification_channels
    FROM public.alert_configurations
    WHERE business_id = NEW.business_id 
      AND alert_type = 'high_value_sale'
      AND (location_id = v_location_id OR (applies_to_all_locations = true AND location_id IS NULL))
    ORDER BY location_id NULLS LAST
    LIMIT 1;

    -- Default threshold if not configured
    IF v_threshold IS NULL THEN
        v_threshold := 100.00;
    END IF;

    -- Only create alert if enabled and transaction exceeds threshold
    IF (v_enabled IS NULL OR v_enabled = true) AND NEW.total_amount >= v_threshold AND NEW.status = 'completed' THEN
        -- Get customer name
        SELECT full_name INTO v_customer_name
        FROM public.customer_profiles
        WHERE id = NEW.customer_id;

        INSERT INTO public.centralized_alerts (
            business_id,
            alert_type,
            priority,
            title,
            message,
            metadata,
            reference_id,
            reference_table,
            action_url
        ) VALUES (
            NEW.business_id,
            'high_value_sale',
            'high',
            'Venta de Alto Valor',
            format('Venta de €%s realizada por %s', NEW.total_amount, COALESCE(v_customer_name, 'Cliente')),
            jsonb_build_object(
                'transaction_id', NEW.id,
                'amount', NEW.total_amount,
                'customer_id', NEW.customer_id,
                'transaction_number', NEW.transaction_number,
                'location_id', v_location_id,
                'notification_channels', v_notification_channels
            ),
            NEW.id,
            'pos_transactions',
            '/point-of-sale'
        );
    END IF;

    RETURN NEW;
END;
$$;

-- 5. Create trigger for POS transactions (high-value sales)
DROP TRIGGER IF EXISTS trigger_high_value_sale_alert ON public.pos_transactions;
CREATE TRIGGER trigger_high_value_sale_alert
    AFTER INSERT OR UPDATE OF status, total_amount ON public.pos_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.create_high_value_sale_alert();

-- 6. Create enhanced low stock alert function with location support
CREATE OR REPLACE FUNCTION public.create_low_stock_alert_from_inventory()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_enabled BOOLEAN;
    v_item_name TEXT;
    v_threshold INTEGER;
    v_location_name TEXT;
    v_notification_channels JSONB;
BEGIN
    -- Check if stock is below minimum
    IF NEW.quantity <= NEW.min_quantity THEN
        -- Check location-specific configuration
        SELECT is_enabled, threshold_value, notification_channels
        INTO v_enabled, v_threshold, v_notification_channels
        FROM public.alert_configurations
        WHERE business_id = NEW.business_id 
          AND alert_type = 'low_stock'
          AND (location_id = NEW.location_id OR (applies_to_all_locations = true AND location_id IS NULL))
        ORDER BY location_id NULLS LAST
        LIMIT 1;

        -- Only create alert if enabled
        IF (v_enabled IS NULL OR v_enabled = true) THEN
            -- Get item name
            SELECT name INTO v_item_name
            FROM public.catalog_items
            WHERE id = NEW.catalog_item_id;

            -- Get location name
            SELECT location_name INTO v_location_name
            FROM public.business_locations
            WHERE id = NEW.location_id;

            INSERT INTO public.centralized_alerts (
                business_id,
                alert_type,
                priority,
                title,
                message,
                metadata,
                reference_id,
                reference_table,
                action_url
            ) VALUES (
                NEW.business_id,
                'low_stock',
                CASE 
                    WHEN NEW.quantity = 0 THEN 'critical'
                    WHEN NEW.quantity <= (NEW.min_quantity * 0.5) THEN 'high'
                    ELSE 'medium'
                END,
                'Stock Bajo',
                format('Stock bajo para %s en %s: %s unidades restantes', 
                    COALESCE(v_item_name, 'Producto'), 
                    COALESCE(v_location_name, 'Ubicación'),
                    NEW.quantity),
                jsonb_build_object(
                    'catalog_item_id', NEW.catalog_item_id,
                    'location_id', NEW.location_id,
                    'current_quantity', NEW.quantity,
                    'min_quantity', NEW.min_quantity,
                    'notification_channels', v_notification_channels
                ),
                NEW.id,
                'location_inventory',
                '/inventory-management'
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- 7. Create trigger for location_inventory (low stock alerts)
DROP TRIGGER IF EXISTS trigger_low_stock_alert_location_inventory ON public.location_inventory;
CREATE TRIGGER trigger_low_stock_alert_location_inventory
    AFTER INSERT OR UPDATE OF quantity ON public.location_inventory
    FOR EACH ROW
    EXECUTE FUNCTION public.create_low_stock_alert_from_inventory();

-- 8. Create function to check quiet hours
CREATE OR REPLACE FUNCTION public.is_within_quiet_hours(
    p_delivery_schedule JSONB,
    p_timezone TEXT DEFAULT 'UTC'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_quiet_hours_enabled BOOLEAN;
    v_start_time TIME;
    v_end_time TIME;
    v_current_time TIME;
BEGIN
    -- Check if quiet hours are enabled
    v_quiet_hours_enabled := (p_delivery_schedule->'quiet_hours'->>'enabled')::BOOLEAN;
    
    IF NOT v_quiet_hours_enabled THEN
        RETURN false;
    END IF;

    -- Get quiet hours times
    v_start_time := (p_delivery_schedule->'quiet_hours'->>'start')::TIME;
    v_end_time := (p_delivery_schedule->'quiet_hours'->>'end')::TIME;
    v_current_time := CURRENT_TIME;

    -- Check if current time is within quiet hours
    IF v_start_time < v_end_time THEN
        RETURN v_current_time >= v_start_time AND v_current_time <= v_end_time;
    ELSE
        -- Handle overnight quiet hours (e.g., 22:00 to 08:00)
        RETURN v_current_time >= v_start_time OR v_current_time <= v_end_time;
    END IF;
END;
$$;

-- 9. Insert default alert configurations for all alert types
INSERT INTO public.alert_configurations (
    business_id,
    alert_type,
    is_enabled,
    threshold_value,
    notification_channels,
    applies_to_all_locations,
    delivery_schedule,
    notification_preferences
)
SELECT 
    DISTINCT id as business_id,
    alert_type_enum,
    true as is_enabled,
    CASE 
        WHEN alert_type_enum = 'high_value_sale' THEN 100.00
        WHEN alert_type_enum = 'low_stock' THEN 10.00
        ELSE NULL
    END as threshold_value,
    '{"email": false, "push": true, "sms": false}'::jsonb as notification_channels,
    true as applies_to_all_locations,
    '{"enabled": true, "quiet_hours": {"enabled": false, "start": "22:00", "end": "08:00"}, "frequency": "immediate", "days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]}'::jsonb as delivery_schedule,
    '{"in_app": true, "email": false, "sms": false, "push": false}'::jsonb as notification_preferences
FROM public.user_profiles
CROSS JOIN unnest(ARRAY['high_value_sale', 'low_stock', 'staff_shift_start', 'staff_shift_end', 'staff_no_show', 'customer_milestone', 'customer_birthday', 'system']::public.alert_type[]) as alert_type_enum
ON CONFLICT (business_id, alert_type, location_id) DO NOTHING;

-- 10. Add comment documentation
COMMENT ON COLUMN public.alert_configurations.delivery_schedule IS 'JSONB containing quiet hours, frequency, and delivery days configuration';
COMMENT ON COLUMN public.alert_configurations.location_id IS 'Specific location for this alert configuration. NULL means applies to all locations if applies_to_all_locations is true';
COMMENT ON COLUMN public.alert_configurations.applies_to_all_locations IS 'If true and location_id is NULL, this configuration applies to all locations';
COMMENT ON COLUMN public.alert_configurations.notification_preferences IS 'JSONB containing in-app, email, SMS, and push notification preferences';
COMMENT ON FUNCTION public.is_within_quiet_hours IS 'Helper function to check if current time is within configured quiet hours';