import React, { useState, useEffect } from 'react';


import { supabase } from '../../../lib/supabase';

const AutomationExecutionEngine = ({ ruleId, businessId, onExecutionComplete }) => {
  const [executing, setExecuting] = useState(false);
  const [executionStatus, setExecutionStatus] = useState(null);

  const executeAutomationAction = async (rule, triggerContext, affectedCustomers) => {
    setExecuting(true);
    setExecutionStatus(null);

    try {
      const actionResults = [];
      let successCount = 0;
      let failedCount = 0;

      // Create execution log entry
      const { data: logEntry, error: logError } = await supabase
        ?.from('automation_execution_log')
        ?.insert([{
          automation_rule_id: rule?.id,
          business_id: businessId,
          execution_status: 'pending',
          trigger_context: triggerContext,
          affected_customers: affectedCustomers?.map(c => c?.id),
          affected_count: affectedCustomers?.length || 0
        }])
        ?.select()
        ?.single();

      if (logError) throw logError;

      // Execute action for each affected customer
      for (const customer of affectedCustomers) {
        try {
          // Call the execute_automation_action function
          const { data: actionResult, error: actionError } = await supabase
            ?.rpc('execute_automation_action', {
              p_rule_id: rule?.id,
              p_execution_log_id: logEntry?.id,
              p_business_id: businessId,
              p_action_type: rule?.action_type,
              p_action_config: rule?.action_config,
              p_customer_id: customer?.id
            });

          if (actionError) {
            console.error('Action execution error:', actionError);
            failedCount++;
            actionResults?.push({
              customer_id: customer?.id,
              status: 'failed',
              error: actionError?.message
            });
          } else {
            successCount++;
            actionResults?.push({
              customer_id: customer?.id,
              status: 'success',
              result_id: actionResult
            });
          }
        } catch (error) {
          console.error('Error executing action for customer:', customer?.id, error);
          failedCount++;
          actionResults?.push({
            customer_id: customer?.id,
            status: 'failed',
            error: error?.message
          });
        }
      }

      // Update execution log with final status
      const finalStatus = failedCount === 0 ? 'success' : (successCount > 0 ? 'partial' : 'failed');
      await supabase
        ?.from('automation_execution_log')
        ?.update({
          execution_status: finalStatus,
          actions_taken: actionResults
        })
        ?.eq('id', logEntry?.id);

      setExecutionStatus({
        status: finalStatus,
        successCount,
        failedCount,
        totalCount: affectedCustomers?.length
      });

      if (onExecutionComplete) {
        onExecutionComplete({
          status: finalStatus,
          logId: logEntry?.id,
          results: actionResults
        });
      }

      return { success: true, status: finalStatus, logId: logEntry?.id };
    } catch (error) {
      console.error('Error executing automation:', error);
      setExecutionStatus({
        status: 'failed',
        error: error?.message
      });
      return { success: false, error: error?.message };
    } finally {
      setExecuting(false);
    }
  };

  return {
    executeAutomationAction,
    executing,
    executionStatus
  };
};

export default AutomationExecutionEngine;

// Hook for monitoring and executing automation triggers
export const useAutomationTriggerMonitor = (businessId, userId) => {
  const [activeRules, setActiveRules] = useState([]);
  const [monitoring, setMonitoring] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchActiveRules = async () => {
      try {
        const { data, error } = await supabase
          ?.from('engagement_automation_rules')
          ?.select('*')
          ?.eq('user_id', userId)
          ?.eq('is_active', true);

        if (error) throw error;
        setActiveRules(data || []);
      } catch (error) {
        console.error('Error fetching active rules:', error);
      }
    };

    fetchActiveRules();

    // Subscribe to rule changes
    const channel = supabase
      ?.channel('automation_rules_monitor')
      ?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'engagement_automation_rules',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload?.eventType === 'INSERT' && payload?.new?.is_active) {
            setActiveRules(prev => [...prev, payload?.new]);
          } else if (payload?.eventType === 'UPDATE') {
            setActiveRules(prev =>
              prev?.map(rule => rule?.id === payload?.new?.id ? payload?.new : rule)
            );
          } else if (payload?.eventType === 'DELETE') {
            setActiveRules(prev => prev?.filter(rule => rule?.id !== payload?.old?.id));
          }
        }
      )
      ?.subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [userId]);

  // Check if conditions are met for a rule
  const checkRuleConditions = async (rule, contextData) => {
    const { trigger_type, conditions } = rule;

    try {
      if (trigger_type === 'low_stock') {
        const catalogItemId = conditions?.catalog_item_id;
        if (!catalogItemId) return false;

        const { data: item } = await supabase
          ?.from('catalog_items')
          ?.select('stock_quantity')
          ?.eq('id', catalogItemId)
          ?.single();

        if (!item) return false;

        const threshold = conditions?.threshold_quantity || 0;
        const comparison = conditions?.comparison || 'less_than';

        if (comparison === 'less_than' && item?.stock_quantity < threshold) {
          return { met: true, context: { current_quantity: item?.stock_quantity, threshold_quantity: threshold } };
        } else if (comparison === 'less_than_or_equal' && item?.stock_quantity <= threshold) {
          return { met: true, context: { current_quantity: item?.stock_quantity, threshold_quantity: threshold } };
        }
      } else if (trigger_type === 'high_sales') {
        const catalogItemId = conditions?.catalog_item_id;
        const threshold = conditions?.threshold_amount || 0;
        const timePeriod = conditions?.time_period || 'daily';

        const startDate = new Date();
        if (timePeriod === 'daily') {
          startDate?.setHours(0, 0, 0, 0);
        } else if (timePeriod === 'weekly') {
          startDate?.setDate(startDate?.getDate() - 7);
        }

        let query = supabase
          ?.from('pos_transactions')
          ?.select('total_amount')
          ?.eq('business_id', businessId)
          ?.eq('status', 'completed')
          ?.gte('created_at', startDate?.toISOString());

        if (catalogItemId) {
          // Would need to join with transaction_items, simplified here
          query = query?.eq('catalog_item_id', catalogItemId);
        }

        const { data: transactions } = await query;
        const totalSales = transactions?.reduce((sum, t) => sum + parseFloat(t?.total_amount || 0), 0);

        if (totalSales >= threshold) {
          return { met: true, context: { sales_amount: totalSales, threshold_amount: threshold, time_period: timePeriod } };
        }
      } else if (trigger_type === 'customer_inactive') {
        const daysSinceVisit = conditions?.days_since_visit || 30;
        const cutoffDate = new Date();
        cutoffDate?.setDate(cutoffDate?.getDate() - daysSinceVisit);

        const { data: inactiveCustomers } = await supabase
          ?.from('customer_profiles')
          ?.select('id, full_name, email')
          ?.eq('business_id', businessId)
          ?.lt('updated_at', cutoffDate?.toISOString())
          ?.limit(100);

        if (inactiveCustomers?.length > 0) {
          return { 
            met: true, 
            context: { days_since_visit: daysSinceVisit, inactive_count: inactiveCustomers?.length },
            affectedCustomers: inactiveCustomers
          };
        }
      } else if (trigger_type === 'customer_birthday') {
        const daysBefore = conditions?.days_before || 7;
        // Birthday logic would require birthday field in customer_profiles
        // Simplified implementation
        return { met: false };
      } else if (trigger_type === 'milestone_reached') {
        const targetPurchases = conditions?.total_purchases || 10;
        
        const { data: customers } = await supabase
          ?.from('customer_profiles')
          ?.select('id, full_name, email, total_visits')
          ?.eq('business_id', businessId)
          ?.eq('total_visits', targetPurchases)
          ?.limit(50);

        if (customers?.length > 0) {
          return {
            met: true,
            context: { milestone: targetPurchases, customers_count: customers?.length },
            affectedCustomers: customers
          };
        }
      }

      return { met: false };
    } catch (error) {
      console.error('Error checking rule conditions:', error);
      return { met: false, error: error?.message };
    }
  };

  // Monitor and execute rules
  const startMonitoring = async () => {
    setMonitoring(true);

    // Check each active rule
    for (const rule of activeRules) {
      try {
        // Check if rule should execute (frequency, max executions, etc.)
        const { data: shouldExecute } = await supabase
          ?.rpc('should_execute_automation_rule', { rule_id: rule?.id });

        if (!shouldExecute) continue;

        // Check if conditions are met
        const conditionResult = await checkRuleConditions(rule);
        
        if (conditionResult?.met) {
          console.log('Rule conditions met:', rule?.rule_name);
          
          // Get affected customers (from condition check or default)
          const affectedCustomers = conditionResult?.affectedCustomers || [];
          
          if (affectedCustomers?.length > 0) {
            // Execute the automation action
            const engine = AutomationExecutionEngine({ 
              ruleId: rule?.id, 
              businessId,
              onExecutionComplete: (result) => {
                console.log('Automation executed:', result);
              }
            });
            
            await engine?.executeAutomationAction(
              rule,
              conditionResult?.context,
              affectedCustomers
            );
          }
        }
      } catch (error) {
        console.error('Error monitoring rule:', rule?.rule_name, error);
      }
    }

    setMonitoring(false);
  };

  return {
    activeRules,
    monitoring,
    startMonitoring,
    checkRuleConditions
  };
};