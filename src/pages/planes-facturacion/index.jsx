import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import PlanesTab from './components/PlanesTab';
import FacturasTab from './components/FacturasTab';
import MetodosPagoTab from './components/MetodosPagoTab';
import FiscalDataTab from '../business-settings/components/FiscalDataTab';

const PlanesFacturacion = () => {
  const { user: authUser, userProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('planes');
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const user = authUser ? {
    id: authUser?.id,
    name: userProfile?.full_name || authUser?.email?.split('@')?.[0] || 'Usuario',
    email: authUser?.email,
    role: userProfile?.role || 'owner',
  } : null;

  const menuItems = [
    { id: 'planes', label: 'Planes', icon: 'CreditCard', description: 'Gestiona tu suscripción y plan activo' },
    { id: 'facturas', label: 'Facturas', icon: 'FileText', description: 'Historial de facturas y comprobantes' },
    { id: 'pagos', label: 'Métodos de Pago', icon: 'Wallet', description: 'Tarjetas y métodos de pago registrados' },
    { id: 'fiscal', label: 'Datos Fiscales', icon: 'Building2', description: 'RFC, régimen fiscal y domicilio' },
  ];

  useEffect(() => {
    const params = new URLSearchParams(location?.search);
    const tab = params?.get('tab');
    if (tab) setActiveTab(tab);
  }, [location?.search]);

  useEffect(() => {
    if (authUser?.id) {
      loadData();
    }
  }, [authUser?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, subRes, invoicesRes, pmRes] = await Promise.all([
        supabase?.from('subscription_plans')?.select('*')?.eq('is_active', true)?.order('sort_order'),
        supabase?.from('user_subscriptions')?.select('*, subscription_plans(*)')?.eq('user_id', authUser?.id)?.order('created_at', { ascending: false })?.limit(1)?.maybeSingle(),
        supabase?.from('billing_invoices')?.select('*')?.eq('user_id', authUser?.id)?.order('created_at', { ascending: false })?.limit(20),
        supabase?.from('billing_payment_methods')?.select('*')?.eq('user_id', authUser?.id)?.eq('is_active', true)?.order('is_default', { ascending: false }),
      ]);

      if (!plansRes?.error) setPlans(plansRes?.data || []);
      if (!subRes?.error) setSubscription(subRes?.data || null);
      if (!invoicesRes?.error) setInvoices(invoicesRes?.data || []);
      if (!pmRes?.error) setPaymentMethods(pmRes?.data || []);
    } catch (err) {
      console.error('Error loading billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan, cycle) => {
    if (!authUser?.id) return;
    try {
      const periodEnd = new Date();
      if (cycle === 'annual') {
        periodEnd?.setFullYear(periodEnd?.getFullYear() + 1);
      } else {
        periodEnd?.setMonth(periodEnd?.getMonth() + 1);
      }

      const amount = cycle === 'annual' ? plan?.price_annual : plan?.price_monthly;

      if (subscription?.id) {
        await supabase?.from('user_subscriptions')?.update({
          plan_id: plan?.id,
          plan_slug: plan?.slug,
          billing_cycle: cycle,
          amount,
          current_period_end: periodEnd?.toISOString(),
          updated_at: new Date()?.toISOString(),
        })?.eq('id', subscription?.id);
      } else {
        await supabase?.from('user_subscriptions')?.insert({
          user_id: authUser?.id,
          plan_id: plan?.id,
          plan_slug: plan?.slug,
          status: 'active',
          billing_cycle: cycle,
          amount,
          current_period_start: new Date()?.toISOString(),
          current_period_end: periodEnd?.toISOString(),
          auto_renew: true,
        });
      }
      await loadData();
    } catch (err) {
      console.error('Error updating plan:', err);
    }
  };

  const renderContent = () => {
    if (loading && activeTab !== 'fiscal') {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      );
    }
    switch (activeTab) {
      case 'planes':
        return <PlanesTab plans={plans} subscription={subscription} onSelectPlan={handleSelectPlan} />;
      case 'facturas':
        return <FacturasTab invoices={invoices} />;
      case 'pagos':
        return <MetodosPagoTab paymentMethods={paymentMethods} userId={authUser?.id} onRefresh={loadData} />;
      case 'fiscal':
        return <FiscalDataTab />;
      default:
        return null;
    }
  };

  const activeMenuItem = menuItems?.find(m => m?.id === activeTab);

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div
        className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
        style={{
          transitionProperty: 'margin-left',
          transitionDuration: '500ms',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Icon name="CreditCard" size={22} className="text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Planes y Facturación</h1>
                  <p className="text-sm text-muted-foreground">Gestiona tu suscripción, facturas y datos fiscales</p>
                </div>
              </div>

              {/* Plan activo badge */}
              {subscription && (
                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm font-medium text-success">
                    Plan {subscription?.subscription_plans?.name || subscription?.plan_slug} activo
                  </span>
                  {subscription?.current_period_end && (
                    <span className="text-xs text-muted-foreground">
                      · Renueva el {new Date(subscription?.current_period_end)?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Lateral Menu */}
              <div className="lg:w-64 flex-shrink-0">
                <div className="bg-card rounded-lg border border-border p-4 sticky top-20">
                  <nav className="space-y-1">
                    {menuItems?.map((item) => (
                      <button
                        key={item?.id}
                        onClick={() => setActiveTab(item?.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                          activeTab === item?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <Icon name={item?.icon} size={20} className="flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{item?.label}</p>
                        </div>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 min-w-0">
                <div className="bg-card rounded-lg border border-border">
                  {/* Section Header */}
                  <div className="px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon name={activeMenuItem?.icon || 'CreditCard'} size={20} className="text-primary" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">{activeMenuItem?.label}</h2>
                        <p className="text-sm text-muted-foreground">{activeMenuItem?.description}</p>
                      </div>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-6">
                    {renderContent()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanesFacturacion;
