import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';

import Icon from '../../components/AppIcon';
import ActivePlanCard from './components/ActivePlanCard';
import PlanComparison from './components/PlanComparison';
import PaymentMethods from './components/PaymentMethods';
import InvoiceHistory from './components/InvoiceHistory';
import BillingProfile from './components/BillingProfile';

const Billing = () => {
  const { user, userProfile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('plan');
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState({
    currentPlan: 'pro',
    planStartDate: '2024-01-15T00:00:00.000Z',
    planEndDate: '2024-12-15T00:00:00.000Z',
    autoRenew: true
  });

  const tabs = [
    { id: 'plan', label: 'Plan Activo', icon: 'CreditCard' },
    { id: 'payment', label: 'Métodos de Pago', icon: 'Wallet' },
    { id: 'invoices', label: 'Historial de Facturas', icon: 'FileText' },
    { id: 'profile', label: 'Perfil de Facturación', icon: 'User' }
  ];

  useEffect(() => {
    loadBillingData();
  }, [user]);

  const loadBillingData = async () => {
    if (!user?.id) {
      // Si no hay usuario, usar datos mock
      setLoading(false);
      return;
    }
    
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
      } else {
        // Si no hay datos en Supabase, mantener datos mock
        console.log('Usando datos de prueba para facturación');
      }
    } catch (error) {
      console.error('Error loading billing data:', error);
      // En caso de error, mantener datos mock
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
        setActiveTab('plan');
      }
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'plan':
        return (
          <div className="space-y-6">
            <ActivePlanCard 
              currentPlan={billingData?.currentPlan}
              planStartDate={billingData?.planStartDate}
              autoRenew={billingData?.autoRenew}
              onChangePlan={() => setActiveTab('comparison')}
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
      case 'profile':
        return <BillingProfile />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        user={user}
      />

      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
      }`}>
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          title="Facturación"
          user={user}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto p-6 pt-20">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Facturación</h1>
              <p className="text-gray-600">
                Gestiona tu plan, métodos de pago y perfil de facturación
              </p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {tabs?.map((tab) => (
                    <button
                      key={tab?.id}
                      onClick={() => setActiveTab(tab?.id)}
                      className={`
                        flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                        ${
                          activeTab === tab?.id
                            ? 'border-blue-600 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <Icon name={tab?.icon} size={18} />
                      <span>{tab?.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  renderTabContent()
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Billing;