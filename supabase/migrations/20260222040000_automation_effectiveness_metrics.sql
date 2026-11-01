-- Location: supabase/migrations/20260222040000_automation_effectiveness_metrics.sql
-- Purpose: Track automation effectiveness metrics and system action execution results
-- Dependencies: Requires engagement_automation_rules, pos_transactions, customer_profiles, coupons, rewards, loyalty_points tables

-- 1. Create automation metrics table for aggregated effectiveness data
CREATE TABLE IF NOT EXISTS public.automation_effectiveness_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_rule_id UUID REFERENCES public.engagement_automation_rules(id) ON DELETE CASCADE,
    business_id TEXT NOT NULL,
    
    -- Time period
    metric_date DATE NOT NULL,
    metric_period TEXT DEFAULT 'daily', -- 'daily', 'weekly', 'monthly'
    
    -- Trigger metrics
    rules_triggered_count INTEGER DEFAULT 0,
    total_customers_affected INTEGER DEFAULT 0,
    
    -- Revenue metrics
    revenue_generated DECIMAL(10, 2) DEFAULT 0,
    revenue_attributed DECIMAL(10, 2) DEFAULT 0, -- Revenue directly from automation-affected customers
    average_order_value DECIMAL(10, 2) DEFAULT 0,
    
    -- Engagement metrics
    customer_engagement_rate DECIMAL(5, 2) DEFAULT 0, -- Percentage of affected customers who engaged
    repeat_purchase_rate DECIMAL(5, 2) DEFAULT 0,
    customer_retention_rate DECIMAL(5, 2) DEFAULT 0,
    engagement_uplift DECIMAL(5, 2) DEFAULT 0, -- Percentage increase vs baseline
    
    -- Conversion metrics
    conversion_count INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5, 2) DEFAULT 0,
    cost_per_conversion DECIMAL(10, 2) DEFAULT 0,
    
    -- Action-specific metrics
    coupons_applied INTEGER DEFAULT 0,
    coupons_redeemed INTEGER DEFAULT 0,
    points_granted INTEGER DEFAULT 0,
    rewards_activated INTEGER DEFAULT 0,
    notifications_sent INTEGER DEFAULT 0,
    
    -- Cost metrics
    total_cost DECIMAL(10, 2) DEFAULT 0, -- Cost of discounts, rewards, etc.
    roi DECIMAL(10, 2) DEFAULT 0, -- Return on investment
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create system action execution results table
CREATE TABLE IF NOT EXISTS public.automation_action_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_rule_id UUID REFERENCES public.engagement_automation_rules(id) ON DELETE CASCADE,
    execution_log_id UUID REFERENCES public.automation_execution_log(id) ON DELETE CASCADE,
    business_id TEXT NOT NULL,
    
    -- Action details
    action_type TEXT NOT NULL, -- 'apply_coupon', 'grant_points', 'activate_reward', 'send_notification'
    action_status TEXT NOT NULL, -- 'success', 'failed', 'pending'
    
    -- Target
    customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE SET NULL,
    
    -- Action-specific data
    coupon_id UUID,
    coupon_code TEXT,
    coupon_applied_to_order_id UUID,
    
    loyalty_program_id UUID,
    points_amount INTEGER,
    points_transaction_id UUID,
    
    reward_id UUID,
    reward_activation_id UUID,
    
    notification_type TEXT,
    notification_sent_at TIMESTAMPTZ,
    notification_opened BOOLEAN DEFAULT false,
    
    -- Results
    result_data JSONB DEFAULT '{}',
    error_message TEXT,
    
    -- Tracking
    executed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create indexes for performance
CREATE INDEX idx_automation_metrics_rule_id ON public.automation_effectiveness_metrics(automation_rule_id);
CREATE INDEX idx_automation_metrics_business_id ON public.automation_effectiveness_metrics(business_id);
CREATE INDEX idx_automation_metrics_date ON public.automation_effectiveness_metrics(metric_date);
CREATE INDEX idx_automation_metrics_period ON public.automation_effectiveness_metrics(metric_period);

CREATE INDEX idx_automation_action_results_rule_id ON public.automation_action_results(automation_rule_id);
CREATE INDEX idx_automation_action_results_log_id ON public.automation_action_results(execution_log_id);
CREATE INDEX idx_automation_action_results_customer_id ON public.automation_action_results(customer_id);
CREATE INDEX idx_automation_action_results_action_type ON public.automation_action_results(action_type);
CREATE INDEX idx_automation_action_results_status ON public.automation_action_results(action_status);

-- 4. Enable RLS
ALTER TABLE public.automation_effectiveness_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_action_results ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies

-- Automation metrics policies
CREATE POLICY "Users can view their automation metrics"
    ON public.automation_effectiveness_metrics
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.engagement_automation_rules
            WHERE engagement_automation_rules.id = automation_effectiveness_metrics.automation_rule_id
            AND engagement_automation_rules.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert automation metrics"
    ON public.automation_effectiveness_metrics
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "System can update automation metrics"
    ON public.automation_effectiveness_metrics
    FOR UPDATE
    USING (true);

-- Action results policies
CREATE POLICY "Users can view their action results"
    ON public.automation_action_results
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.engagement_automation_rules
            WHERE engagement_automation_rules.id = automation_action_results.automation_rule_id
            AND engagement_automation_rules.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert action results"
    ON public.automation_action_results
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "System can update action results"
    ON public.automation_action_results
    FOR UPDATE
    USING (true);

-- 6. Create function to execute system actions
CREATE OR REPLACE FUNCTION public.execute_automation_action(
    p_rule_id UUID,
    p_execution_log_id UUID,
    p_business_id TEXT,
    p_action_type TEXT,
    p_action_config JSONB,
    p_customer_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result_id UUID;
    v_coupon_id UUID;
    v_coupon_code TEXT;
    v_loyalty_program_id UUID;
    v_points_amount INTEGER;
    v_reward_id UUID;
    v_notification_type TEXT;
    v_notification_message TEXT;
    v_action_status TEXT := 'success';
    v_error_message TEXT;
BEGIN
    -- Execute action based on type
    BEGIN
        IF p_action_type = 'apply_coupon' THEN
            -- Get coupon details
            v_coupon_id := (p_action_config->>'coupon_id')::UUID;
            
            SELECT code INTO v_coupon_code
            FROM public.coupons
            WHERE id = v_coupon_id
            AND is_active = true;
            
            IF v_coupon_code IS NULL THEN
                v_action_status := 'failed';
                v_error_message := 'Coupon not found or inactive';
            ELSE
                -- Insert action result with coupon info
                INSERT INTO public.automation_action_results (
                    automation_rule_id,
                    execution_log_id,
                    business_id,
                    action_type,
                    action_status,
                    customer_id,
                    coupon_id,
                    coupon_code,
                    result_data
                ) VALUES (
                    p_rule_id,
                    p_execution_log_id,
                    p_business_id,
                    p_action_type,
                    v_action_status,
                    p_customer_id,
                    v_coupon_id,
                    v_coupon_code,
                    jsonb_build_object(
                        'auto_apply', p_action_config->>'auto_apply',
                        'applied_at', CURRENT_TIMESTAMP
                    )
                ) RETURNING id INTO v_result_id;
            END IF;
            
        ELSIF p_action_type = 'grant_points' THEN
            -- Get loyalty program and points
            v_loyalty_program_id := (p_action_config->>'loyalty_program_id')::UUID;
            v_points_amount := (p_action_config->>'points_amount')::INTEGER;
            
            -- Update customer loyalty points
            UPDATE public.customer_profiles
            SET loyalty_points = loyalty_points + v_points_amount,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = p_customer_id;
            
            -- Insert action result
            INSERT INTO public.automation_action_results (
                automation_rule_id,
                execution_log_id,
                business_id,
                action_type,
                action_status,
                customer_id,
                loyalty_program_id,
                points_amount,
                result_data
            ) VALUES (
                p_rule_id,
                p_execution_log_id,
                p_business_id,
                p_action_type,
                v_action_status,
                p_customer_id,
                v_loyalty_program_id,
                v_points_amount,
                jsonb_build_object(
                    'granted_at', CURRENT_TIMESTAMP,
                    'previous_balance', (SELECT loyalty_points - v_points_amount FROM public.customer_profiles WHERE id = p_customer_id),
                    'new_balance', (SELECT loyalty_points FROM public.customer_profiles WHERE id = p_customer_id)
                )
            ) RETURNING id INTO v_result_id;
            
        ELSIF p_action_type = 'activate_reward' THEN
            -- Get reward details
            v_reward_id := (p_action_config->>'reward_id')::UUID;
            
            -- Insert action result
            INSERT INTO public.automation_action_results (
                automation_rule_id,
                execution_log_id,
                business_id,
                action_type,
                action_status,
                customer_id,
                reward_id,
                result_data
            ) VALUES (
                p_rule_id,
                p_execution_log_id,
                p_business_id,
                p_action_type,
                v_action_status,
                p_customer_id,
                v_reward_id,
                jsonb_build_object(
                    'auto_activate', p_action_config->>'auto_activate',
                    'activated_at', CURRENT_TIMESTAMP
                )
            ) RETURNING id INTO v_result_id;
            
        ELSIF p_action_type = 'send_notification' THEN
            -- Get notification details
            v_notification_type := p_action_config->>'notification_type';
            v_notification_message := p_action_config->>'message';
            
            -- Insert action result
            INSERT INTO public.automation_action_results (
                automation_rule_id,
                execution_log_id,
                business_id,
                action_type,
                action_status,
                customer_id,
                notification_type,
                notification_sent_at,
                result_data
            ) VALUES (
                p_rule_id,
                p_execution_log_id,
                p_business_id,
                p_action_type,
                v_action_status,
                p_customer_id,
                v_notification_type,
                CURRENT_TIMESTAMP,
                jsonb_build_object(
                    'message', v_notification_message,
                    'sent_at', CURRENT_TIMESTAMP
                )
            ) RETURNING id INTO v_result_id;
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        v_action_status := 'failed';
        v_error_message := SQLERRM;
        
        -- Insert failed action result
        INSERT INTO public.automation_action_results (
            automation_rule_id,
            execution_log_id,
            business_id,
            action_type,
            action_status,
            customer_id,
            error_message
        ) VALUES (
            p_rule_id,
            p_execution_log_id,
            p_business_id,
            p_action_type,
            v_action_status,
            p_customer_id,
            v_error_message
        ) RETURNING id INTO v_result_id;
    END;
    
    RETURN v_result_id;
END;
$$;

-- 7. Create function to calculate automation effectiveness metrics
CREATE OR REPLACE FUNCTION public.calculate_automation_effectiveness(
    p_rule_id UUID,
    p_business_id TEXT,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    rules_triggered INTEGER,
    revenue_generated DECIMAL,
    engagement_uplift DECIMAL,
    cost_per_conversion DECIMAL,
    total_conversions INTEGER,
    roi DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_rules_triggered INTEGER;
    v_total_customers INTEGER;
    v_revenue DECIMAL := 0;
    v_total_cost DECIMAL := 0;
    v_conversions INTEGER := 0;
    v_engagement_rate DECIMAL := 0;
    v_baseline_engagement DECIMAL := 50.0; -- Baseline engagement rate
    v_cost_per_conversion DECIMAL := 0;
    v_roi DECIMAL := 0;
BEGIN
    -- Count rules triggered
    SELECT COUNT(*)
    INTO v_rules_triggered
    FROM public.automation_execution_log
    WHERE automation_rule_id = p_rule_id
    AND executed_at BETWEEN p_start_date AND p_end_date
    AND execution_status = 'success';
    
    -- Get total affected customers
    SELECT COALESCE(SUM(affected_count), 0)
    INTO v_total_customers
    FROM public.automation_execution_log
    WHERE automation_rule_id = p_rule_id
    AND executed_at BETWEEN p_start_date AND p_end_date;
    
    -- Calculate revenue from affected customers
    SELECT COALESCE(SUM(t.total_amount), 0)
    INTO v_revenue
    FROM public.pos_transactions t
    INNER JOIN public.automation_action_results ar ON ar.customer_id = t.customer_id
    WHERE ar.automation_rule_id = p_rule_id
    AND t.created_at BETWEEN p_start_date AND p_end_date
    AND t.status = 'completed';
    
    -- Calculate total cost (discounts from coupons, points value, etc.)
    SELECT COALESCE(SUM(
        CASE 
            WHEN ar.action_type = 'apply_coupon' THEN 10.0 -- Average coupon value
            WHEN ar.action_type = 'grant_points' THEN ar.points_amount * 0.01 -- Points value
            WHEN ar.action_type = 'activate_reward' THEN 15.0 -- Average reward value
            ELSE 0
        END
    ), 0)
    INTO v_total_cost
    FROM public.automation_action_results ar
    WHERE ar.automation_rule_id = p_rule_id
    AND ar.executed_at BETWEEN p_start_date AND p_end_date
    AND ar.action_status = 'success';
    
    -- Count conversions (customers who made purchases after automation)
    SELECT COUNT(DISTINCT t.customer_id)
    INTO v_conversions
    FROM public.pos_transactions t
    INNER JOIN public.automation_action_results ar ON ar.customer_id = t.customer_id
    WHERE ar.automation_rule_id = p_rule_id
    AND t.created_at BETWEEN p_start_date AND p_end_date
    AND t.status = 'completed';
    
    -- Calculate engagement rate
    IF v_total_customers > 0 THEN
        v_engagement_rate := (v_conversions::DECIMAL / v_total_customers::DECIMAL) * 100;
    END IF;
    
    -- Calculate cost per conversion
    IF v_conversions > 0 THEN
        v_cost_per_conversion := v_total_cost / v_conversions;
    END IF;
    
    -- Calculate ROI
    IF v_total_cost > 0 THEN
        v_roi := ((v_revenue - v_total_cost) / v_total_cost) * 100;
    END IF;
    
    RETURN QUERY SELECT 
        v_rules_triggered,
        v_revenue,
        v_engagement_rate - v_baseline_engagement AS engagement_uplift,
        v_cost_per_conversion,
        v_conversions,
        v_roi;
END;
$$;

-- 8. Create function to update metrics daily (can be called by cron job)
CREATE OR REPLACE FUNCTION public.update_automation_metrics_daily()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rule_record RECORD;
    metrics_record RECORD;
BEGIN
    -- Loop through all active automation rules
    FOR rule_record IN 
        SELECT id, business_id 
        FROM public.engagement_automation_rules 
        WHERE is_active = true
    LOOP
        -- Calculate metrics for yesterday
        SELECT * INTO metrics_record
        FROM public.calculate_automation_effectiveness(
            rule_record.id,
            rule_record.business_id,
            CURRENT_DATE - INTERVAL '1 day',
            CURRENT_DATE
        );
        
        -- Insert or update metrics
        INSERT INTO public.automation_effectiveness_metrics (
            automation_rule_id,
            business_id,
            metric_date,
            metric_period,
            rules_triggered_count,
            revenue_generated,
            engagement_uplift,
            cost_per_conversion,
            conversion_count,
            roi
        ) VALUES (
            rule_record.id,
            rule_record.business_id,
            CURRENT_DATE - INTERVAL '1 day',
            'daily',
            metrics_record.rules_triggered,
            metrics_record.revenue_generated,
            metrics_record.engagement_uplift,
            metrics_record.cost_per_conversion,
            metrics_record.total_conversions,
            metrics_record.roi
        )
        ON CONFLICT (automation_rule_id, metric_date, metric_period) 
        DO UPDATE SET
            rules_triggered_count = EXCLUDED.rules_triggered_count,
            revenue_generated = EXCLUDED.revenue_generated,
            engagement_uplift = EXCLUDED.engagement_uplift,
            cost_per_conversion = EXCLUDED.cost_per_conversion,
            conversion_count = EXCLUDED.conversion_count,
            roi = EXCLUDED.roi,
            updated_at = CURRENT_TIMESTAMP;
    END LOOP;
END;
$$;

-- 9. Add unique constraint for metrics
ALTER TABLE public.automation_effectiveness_metrics
ADD CONSTRAINT unique_automation_metrics_per_day 
UNIQUE (automation_rule_id, metric_date, metric_period);