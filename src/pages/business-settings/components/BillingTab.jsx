import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import Icon from '../../../components/AppIcon';
import ActivePlanCard from '../../billing/components/ActivePlanCard';
import PlanComparison from '../../billing/components/PlanComparison';
import PaymentMethods from '../../billing/components/PaymentMethods';
import InvoiceHistory from '../../billing/components/InvoiceHistory';

const BillingTab = () => {
  const { user } = useAuth();
  const [activeBillingTab, setActiveBillingTab] = useState('plan');
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState({
    currentPlan: 'pro',
    planStartDate: '2024-01-15T00:00:00.000Z',
    planEndDate: null,
    autoRenew: true
  });

  const billingTabs = [
    { id: 'plan', label: 'Plan Activo', icon: 'CreditCard' },
    { id: 'payment', label: 'Métodos de Pago', icon: 'Wallet' },
    { id: 'invoices', label: 'Historial de Facturas', icon: 'FileText' }
  ];

  useEffect(() => {
    loadBillingData();
  }, [user]);

  const loadBillingData = async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        ?.from('first_time_experience')
        ?.select('subscription_plan, created_at')
        ?.eq('user_id', user?.id)
        ?.single();
      if (!error && data) {
        setBillingData({
          currentPlan: data?.subscription_plan || 'pro',
          planStartDate: data?.created_at || '2024-01-15T00:00:00.000Z',
          planEndDate: null,
          autoRenew: true
        });
      }
    } catch (err) {
      console.error('Error loading billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async (newPlan) => {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        ?.from('first_time_experience')
        ?.update({ subscription_plan: newPlan, updated_at: new Date()?.toISOString() })
        ?.eq('user_id', user?.id);
      if (!error) {
        setBillingData(prev => ({ ...prev, currentPlan: newPlan }));
        setActiveBillingTab('plan');
      }
    } catch (err) {
      console.error('Error updating plan:', err);
    }
  };

  const renderBillingContent = () => {
    switch (activeBillingTab) {
      case 'plan':
        return (
          <div className="space-y-6">
            <ActivePlanCard
              currentPlan={billingData?.currentPlan}
              planStartDate={billingData?.planStartDate}
              autoRenew={billingData?.autoRenew}
              onChangePlan={() => setActiveBillingTab('comparison')}
            />
            <PlanComparison
              currentPlan={billingData?.currentPlan}
              onSelectPlan={handlePlanChange}
            />
          </div>
        );
      case 'payment':
        return <PaymentMethods />;
      case 'invoices':
        return <InvoiceHistory />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Planes y Facturación</h3>
        <p className="text-sm text-muted-foreground">Gestiona tu plan, métodos de pago y perfil de facturación</p>
      </div>

      {/* Billing Sub-tabs */}
      <div className="bg-muted/30 rounded-lg border border-border">
        <div className="border-b border-border">
          <nav className="flex overflow-x-auto" aria-label="Billing tabs">
            {billingTabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveBillingTab(tab?.id)}
                className={`flex items-center space-x-2 py-3 px-5 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeBillingTab === tab?.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            renderBillingContent()
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingTab;
