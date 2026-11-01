-- Location: supabase/migrations/20260222030000_engagement_automation_rules.sql
-- Purpose: Create engagement automation rules system for triggering actions based on inventory and transaction thresholds
-- Dependencies: Requires coupons, loyalty_points, rewards, catalog_items, customer_profiles tables

-- 1. Create automation rules table
CREATE TABLE IF NOT EXISTS public.engagement_automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    -- Rule identification
    rule_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    
    -- Trigger conditions
    trigger_type TEXT NOT NULL, -- 'low_stock', 'high_sales', 'customer_inactive', 'customer_birthday', 'milestone_reached'
    
    -- Condition configuration (JSONB for flexibility)
    conditions JSONB NOT NULL DEFAULT '{}',
    -- Examples:
    -- Low stock: {"catalog_item_id": "uuid", "threshold_quantity": 10, "comparison": "less_than"}
    -- High sales: {"catalog_item_id": "uuid", "threshold_amount": 1000, "time_period": "daily", "comparison": "greater_than"}
    -- Customer inactive: {"days_since_visit": 30, "comparison": "greater_than"}
    -- Customer birthday: {"days_before": 7}
    -- Milestone: {"total_purchases": 10, "comparison": "equals"}
    
    -- Action configuration
    action_type TEXT NOT NULL, -- 'apply_coupon', 'grant_points', 'activate_reward', 'send_notification'
    action_config JSONB NOT NULL DEFAULT '{}',
    -- Examples:
    -- Apply coupon: {"coupon_id": "uuid", "auto_apply": true}
    -- Grant points: {"loyalty_program_id": "uuid", "points_amount": 100}
    -- Activate reward: {"reward_id": "uuid", "auto_activate": true}
    -- Send notification: {"notification_type": "email", "template_id": "uuid", "message": "text"}
    
    -- Execution settings
    execution_frequency TEXT DEFAULT 'once', -- 'once', 'daily', 'weekly', 'real_time'
    max_executions INTEGER DEFAULT 0, -- 0 means unlimited
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMPTZ,
    
    -- Targeting
    target_audience TEXT DEFAULT 'all', -- 'all', 'segment', 'individual'
    customer_segment_id UUID, -- Reference to customer_segments if needed
    
    -- Metadata
    priority INTEGER DEFAULT 1, -- Higher number = higher priority
    valid_from TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create automation execution log table
CREATE TABLE IF NOT EXISTS public.automation_execution_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_rule_id UUID REFERENCES public.engagement_automation_rules(id) ON DELETE CASCADE,
    business_id TEXT NOT NULL,
    
    -- Execution details
    executed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    execution_status TEXT NOT NULL, -- 'success', 'failed', 'partial'
    
    -- Context
    trigger_context JSONB DEFAULT '{}', -- What triggered the rule (e.g., stock level, sales amount)
    affected_customers JSONB DEFAULT '[]', -- Array of customer IDs affected
    affected_count INTEGER DEFAULT 0,
    
    -- Results
    actions_taken JSONB DEFAULT '[]', -- Array of actions executed
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create indexes for performance
CREATE INDEX idx_automation_rules_business_id ON public.engagement_automation_rules(business_id);
CREATE INDEX idx_automation_rules_user_id ON public.engagement_automation_rules(user_id);
CREATE INDEX idx_automation_rules_trigger_type ON public.engagement_automation_rules(trigger_type);
CREATE INDEX idx_automation_rules_is_active ON public.engagement_automation_rules(is_active);
CREATE INDEX idx_automation_rules_valid_dates ON public.engagement_automation_rules(valid_from, valid_until);

CREATE INDEX idx_automation_log_rule_id ON public.automation_execution_log(automation_rule_id);
CREATE INDEX idx_automation_log_business_id ON public.automation_execution_log(business_id);
CREATE INDEX idx_automation_log_executed_at ON public.automation_execution_log(executed_at);
CREATE INDEX idx_automation_log_status ON public.automation_execution_log(execution_status);

-- 4. Enable RLS
ALTER TABLE public.engagement_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_execution_log ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies

-- Automation rules policies
CREATE POLICY "Users can view their own automation rules"
    ON public.engagement_automation_rules
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own automation rules"
    ON public.engagement_automation_rules
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own automation rules"
    ON public.engagement_automation_rules
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own automation rules"
    ON public.engagement_automation_rules
    FOR DELETE
    USING (auth.uid() = user_id);

-- Execution log policies
CREATE POLICY "Users can view their automation execution logs"
    ON public.automation_execution_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.engagement_automation_rules
            WHERE engagement_automation_rules.id = automation_execution_log.automation_rule_id
            AND engagement_automation_rules.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert execution logs"
    ON public.automation_execution_log
    FOR INSERT
    WITH CHECK (true);

-- 6. Create helper function to check if rule should execute
CREATE OR REPLACE FUNCTION public.should_execute_automation_rule(rule_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rule_record RECORD;
    can_execute BOOLEAN := false;
BEGIN
    -- Get rule details
    SELECT * INTO rule_record
    FROM public.engagement_automation_rules
    WHERE id = rule_id;
    
    -- Check if rule exists and is active
    IF NOT FOUND OR NOT rule_record.is_active THEN
        RETURN false;
    END IF;
    
    -- Check validity period
    IF rule_record.valid_from IS NOT NULL AND CURRENT_TIMESTAMP < rule_record.valid_from THEN
        RETURN false;
    END IF;
    
    IF rule_record.valid_until IS NOT NULL AND CURRENT_TIMESTAMP > rule_record.valid_until THEN
        RETURN false;
    END IF;
    
    -- Check max executions
    IF rule_record.max_executions > 0 AND rule_record.execution_count >= rule_record.max_executions THEN
        RETURN false;
    END IF;
    
    -- Check execution frequency
    IF rule_record.execution_frequency = 'once' AND rule_record.execution_count > 0 THEN
        RETURN false;
    END IF;
    
    IF rule_record.execution_frequency = 'daily' AND rule_record.last_executed_at IS NOT NULL THEN
        IF CURRENT_TIMESTAMP - rule_record.last_executed_at < INTERVAL '1 day' THEN
            RETURN false;
        END IF;
    END IF;
    
    IF rule_record.execution_frequency = 'weekly' AND rule_record.last_executed_at IS NOT NULL THEN
        IF CURRENT_TIMESTAMP - rule_record.last_executed_at < INTERVAL '7 days' THEN
            RETURN false;
        END IF;
    END IF;
    
    RETURN true;
END;
$$;

-- 7. Create function to log automation execution
CREATE OR REPLACE FUNCTION public.log_automation_execution(
    p_rule_id UUID,
    p_business_id TEXT,
    p_status TEXT,
    p_trigger_context JSONB,
    p_affected_customers JSONB,
    p_actions_taken JSONB,
    p_error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    log_id UUID;
    affected_count INTEGER;
BEGIN
    -- Calculate affected count
    affected_count := jsonb_array_length(p_affected_customers);
    
    -- Insert execution log
    INSERT INTO public.automation_execution_log (
        automation_rule_id,
        business_id,
        execution_status,
        trigger_context,
        affected_customers,
        affected_count,
        actions_taken,
        error_message
    ) VALUES (
        p_rule_id,
        p_business_id,
        p_status,
        p_trigger_context,
        p_affected_customers,
        affected_count,
        p_actions_taken,
        p_error_message
    ) RETURNING id INTO log_id;
    
    -- Update rule execution count and timestamp
    UPDATE public.engagement_automation_rules
    SET 
        execution_count = execution_count + 1,
        last_executed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_rule_id;
    
    RETURN log_id;
END;
$$;

-- 8. Create trigger function for low stock automation
CREATE OR REPLACE FUNCTION public.check_low_stock_automation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rule_record RECORD;
    threshold_qty INTEGER;
    catalog_item_id_filter UUID;
BEGIN
    -- Only process on UPDATE or INSERT when quantity changes
    IF TG_OP = 'UPDATE' AND NEW.quantity = OLD.quantity THEN
        RETURN NEW;
    END IF;
    
    -- Find active low_stock automation rules
    FOR rule_record IN
        SELECT * FROM public.engagement_automation_rules
        WHERE trigger_type = 'low_stock'
        AND is_active = true
        AND (valid_from IS NULL OR valid_from <= CURRENT_TIMESTAMP)
        AND (valid_until IS NULL OR valid_until >= CURRENT_TIMESTAMP)
    LOOP
        -- Extract threshold from conditions
        threshold_qty := (rule_record.conditions->>'threshold_quantity')::INTEGER;
        catalog_item_id_filter := (rule_record.conditions->>'catalog_item_id')::UUID;
        
        -- Check if this item matches the rule conditions
        IF (catalog_item_id_filter IS NULL OR NEW.catalog_item_id = catalog_item_id_filter)
           AND NEW.quantity <= threshold_qty THEN
            
            -- Check if rule should execute
            IF public.should_execute_automation_rule(rule_record.id) THEN
                -- Log the trigger (actual action execution would be handled by application)
                PERFORM public.log_automation_execution(
                    rule_record.id,
                    rule_record.business_id,
                    'success',
                    jsonb_build_object(
                        'catalog_item_id', NEW.catalog_item_id,
                        'current_quantity', NEW.quantity,
                        'threshold_quantity', threshold_qty
                    ),
                    '[]'::JSONB,
                    jsonb_build_array(
                        jsonb_build_object(
                            'action_type', rule_record.action_type,
                            'triggered_at', CURRENT_TIMESTAMP
                        )
                    ),
                    NULL
                );
            END IF;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$;

-- 9. Create trigger for location_inventory low stock detection
DROP TRIGGER IF EXISTS trigger_low_stock_automation ON public.location_inventory;
CREATE TRIGGER trigger_low_stock_automation
    AFTER INSERT OR UPDATE OF quantity
    ON public.location_inventory
    FOR EACH ROW
    EXECUTE FUNCTION public.check_low_stock_automation();

-- 10. Add updated_at trigger for automation rules
CREATE OR REPLACE FUNCTION public.update_automation_rules_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_automation_rules_updated_at ON public.engagement_automation_rules;
CREATE TRIGGER trigger_update_automation_rules_updated_at
    BEFORE UPDATE ON public.engagement_automation_rules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_automation_rules_updated_at();