import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import KPICard from './components/KPICard';
import QuickActionCard from './components/QuickActionCard';
import AnalyticsChart from './components/AnalyticsChart';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import SupplierMetricsCards from './components/SupplierMetricsCards';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import useRealtimeData from '../../hooks/useRealtimeData';

const DashboardOverview = () => {
  const { user: authUser, userProfile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [kpiData, setKpiData] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasEstablishment, setHasEstablishment] = useState(null);
  const [hasProducts, setHasProducts] = useState(null);
  const [realtimeIndicator, setRealtimeIndicator] = useState(false);

  // NOTE: Email verification blocking logic is PREPARED but NOT ACTIVE.
  // To activate: uncomment the emailVerified check below and wrap dashboard content
  // with a conditional render that shows a "verify your email" screen when false.
  // const emailVerified = authUser?.email_confirmed_at != null;

  // Build user object from auth + profile
  useEffect(() => {
    if (authUser) {
      setUser({
        id: authUser?.id,
        name: userProfile?.full_name || authUser?.user_metadata?.full_name || authUser?.email?.split('@')?.[0] || 'Usuario',
        email: authUser?.email,
        role: userProfile?.role || 'owner',
        business_name: userProfile?.business_name || '',
        business_id: userProfile?.business_id || authUser?.id,
      });
    }
  }, [authUser, userProfile]);

  // Check establishment and products status
  useEffect(() => {
    if (!authUser?.id) return;
    const checkOnboardingStatus = async () => {
      try {
        const [bsRes, catalogRes] = await Promise.all([
          supabase?.from('business_settings')?.select('id, business_name')?.eq('owner_id', authUser?.id)?.maybeSingle(),
          supabase?.from('catalog_items')?.select('id', { count: 'exact', head: true })?.eq('user_id', authUser?.id),
        ]);
        setHasEstablishment(!bsRes?.error && bsRes?.data?.business_name ? true : false);
        setHasProducts(!catalogRes?.error && (catalogRes?.count || 0) > 0);
      } catch {
        setHasEstablishment(false);
        setHasProducts(false);
      }
    };
    checkOnboardingStatus();
  }, [authUser?.id]);

  // Fetch real KPI data from Supabase
  const fetchDashboardData = useCallback(async (silent = false) => {
    if (!user?.id) return;
    if (!silent) setLoading(true);
    try {
      const businessId = user?.business_id || user?.id;

      const [
        promotionsRes,
        couponsRes,
        loyaltyRes,
        customersRes,
        campaignsRes,
        recentCampaignsRes,
      ] = await Promise.all([
        supabase?.from('promotions')?.select('*', { count: 'exact', head: true })?.eq('user_id', user?.id)?.eq('status', 'active'),
        supabase?.from('coupon_redemptions')?.select('*', { count: 'exact', head: true })?.eq('business_id', businessId),
        supabase?.from('loyalty_transactions')?.select('points_earned', { count: 'exact' })?.eq('business_id', businessId)?.eq('transaction_type', 'earn')?.limit(1000),
        supabase?.from('customer_profiles')?.select('*', { count: 'exact', head: true })?.eq('created_by', user?.id),
        supabase?.from('promotions')?.select('id, name, status, created_at')?.eq('user_id', user?.id)?.eq('status', 'active')?.order('created_at', { ascending: false })?.limit(2),
        supabase?.from('promotions')?.select('id, name, status, created_at')?.eq('user_id', user?.id)?.order('created_at', { ascending: false })?.limit(4),
      ]);

      const activePromosCount = promotionsRes?.count || 0;
      const couponsCount = couponsRes?.count || 0;
      const loyaltyPoints = loyaltyRes?.data?.reduce((sum, t) => sum + (t?.points_earned || 0), 0) || 0;
      const customersCount = customersRes?.count || 0;

      setKpiData([
        { title: 'Promociones Activas', value: activePromosCount?.toString(), change: activePromosCount > 0 ? `+${activePromosCount}` : '0', changeType: activePromosCount > 0 ? 'positive' : 'neutral', icon: 'Megaphone', color: 'primary' },
        { title: 'Cupones Canjeados', value: couponsCount?.toLocaleString('es-MX'), change: couponsCount > 0 ? `+${couponsCount}` : '0', changeType: couponsCount > 0 ? 'positive' : 'neutral', icon: 'Ticket', color: 'success' },
        { title: 'Puntos Distribuidos', value: loyaltyPoints?.toLocaleString('es-MX'), change: loyaltyPoints > 0 ? `+${loyaltyPoints}` : '0', changeType: loyaltyPoints > 0 ? 'positive' : 'neutral', icon: 'Star', color: 'warning' },
        { title: 'Clientes Registrados', value: customersCount?.toLocaleString('es-MX'), change: customersCount > 0 ? `+${customersCount}` : '0', changeType: customersCount > 0 ? 'positive' : 'neutral', icon: 'Users', color: 'destructive' },
      ]);

      const last10Days = Array.from({ length: 10 }, (_, i) => {
        const d = new Date();
        d?.setDate(d?.getDate() - (9 - i));
        return { date: d?.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' }), value: 0 };
      });

      const { data: redemptionsByDay } = await supabase?.from('coupon_redemptions')?.select('redeemed_at')?.eq('business_id', businessId)?.gte('redeemed_at', new Date(Date.now() - 10 * 86400000)?.toISOString());
      if (redemptionsByDay?.length > 0) {
        redemptionsByDay?.forEach(r => {
          const day = new Date(r.redeemed_at)?.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' });
          const entry = last10Days?.find(d => d?.date === day);
          if (entry) entry.value += 1;
        });
      }
      setAnalyticsData(last10Days);

      const activeCampsData = (campaignsRes?.data || [])?.map(c => ({ id: c?.id, name: c?.name, type: 'promotion', status: c?.status, metrics: { impressions: 0, clicks: 0, conversions: 0, roi: 0 }, budget: 0, spent: 0 }));
      setActiveCampaigns(activeCampsData);

      const recentCampsData = (recentCampaignsRes?.data || [])?.map(c => ({ id: c?.id, name: c?.name, type: 'promotion', status: c?.status, createdAt: c?.created_at }));
      setRecentCampaigns(recentCampsData);
    } catch (err) {
      console.error('Dashboard data error:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user?.id, user?.business_id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Real-time: flash indicator and silently refresh KPIs on any change
  const handleRealtimeChange = useCallback(() => {
    setRealtimeIndicator(true);
    setTimeout(() => setRealtimeIndicator(false), 2000);
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  useRealtimeData({
    channelName: `dashboard_kpis_${user?.id}`,
    tables: ['promotions', 'coupon_redemptions', 'loyalty_transactions', 'customer_profiles'],
    events: ['INSERT', 'UPDATE', 'DELETE'],
    onRefresh: handleRealtimeChange,
    enabled: !!user?.id,
  });

  const quickActions = [
    { title: 'Crear Promoción', description: 'Lanza una nueva campaña promocional para atraer más clientes', icon: 'Plus', color: 'primary', href: '/promotions-management' },
    { title: 'Generar Cupones', description: 'Crea cupones de descuento personalizados para tus clientes', icon: 'Ticket', color: 'success', href: '/coupons-management' },
    { title: 'Configurar Recompensas', description: 'Establece un sistema de puntos y recompensas para fidelizar', icon: 'Gift', color: 'warning', href: '/rewards-management' },
  ];

  const handleSidebarToggle = () => setIsSidebarOpen(!isSidebarOpen);
  const handleSidebarClose = () => setIsSidebarOpen(false);
  const handleSidebarCollapseToggle = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onMenuToggle={handleSidebarToggle}
        isMenuOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleSidebarCollapseToggle}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
        user={user}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleSidebarCollapseToggle}
      />
      <main
        className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}
        style={{ transitionProperty: 'margin-left', transitionDuration: '500ms', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        <div className="p-6">

          {/* Welcome Section */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                ¡Bienvenido de vuelta, {user?.name?.split(' ')?.[0] || 'Usuario'}!
              </h1>
              <p className="text-muted-foreground">
                Aquí tienes un resumen de la actividad de tu negocio y las métricas más importantes.
              </p>
            </div>
            {/* Real-time live indicator */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5 flex-shrink-0 mt-1">
              <span className={`w-2 h-2 rounded-full ${realtimeIndicator ? 'bg-emerald-500 animate-ping' : 'bg-emerald-400'}`} />
              <span>En vivo</span>
            </div>
          </div>

          {/* Account Setup Steps */}
          <div className="mb-6 bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="ClipboardList" size={16} className="text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Pasos para validar tu cuenta</h2>
                <p className="text-xs text-muted-foreground">Completa los siguientes pasos para activar todas las funciones de la plataforma.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Step 1 */}
              <a
                href="/establishments-portfolio"
                className="flex-1 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors group"
              >
                <div className="w-7 h-7 bg-amber-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">1</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-900 group-hover:text-amber-800">Crear un establecimiento</p>
                  <p className="text-xs text-amber-700 mt-0.5">Registra tu negocio o sucursal para comenzar a operar en la plataforma.</p>
                </div>
                <Icon name="ChevronRight" size={16} className="text-amber-500 flex-shrink-0 mt-1" />
              </a>
              {/* Step 2 */}
              <a
                href="/business-settings"
                className="flex-1 flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group"
              >
                <div className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">2</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-blue-900 group-hover:text-blue-800">Subir documentos de validación</p>
                  <p className="text-xs text-blue-700 mt-0.5">Carga los documentos requeridos para verificar y validar tu cuenta.</p>
                </div>
                <Icon name="ChevronRight" size={16} className="text-blue-500 flex-shrink-0 mt-1" />
              </a>
            </div>
          </div>

          {/* Onboarding Info Banners */}
          {hasEstablishment === false && (
            <div className="mb-5 flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon name="Building2" size={18} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-800 mb-0.5">Activa tu establecimiento para comenzar</p>
                <p className="text-xs text-amber-700">
                  Para aprovechar todas las funciones de la plataforma, necesitas tener al menos un establecimiento activo configurado.
                </p>
              </div>
              <a
                href="/business-settings"
                className="flex-shrink-0 px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors"
              >
                Configurar
              </a>
            </div>
          )}

          {hasProducts === false && hasEstablishment !== false && (
            <div className="mb-5 flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon name="ShoppingBag" size={18} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-800 mb-0.5">Crea tu primer producto o servicio</p>
                <p className="text-xs text-blue-700">
                  Agrega productos o servicios a tu catálogo para poder crear promociones, cupones y campañas de marketing.
                </p>
              </div>
              <a
                href="/catalog-management"
                className="flex-shrink-0 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Agregar
              </a>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {loading
              ? Array.from({ length: 4 })?.map((_, i) => (
                  <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                    <div className="h-8 bg-muted rounded w-1/2" />
                  </div>
                ))
              : kpiData?.map((kpi, index) => (
                  <KPICard key={index} title={kpi?.title} value={kpi?.value} change={kpi?.change} changeType={kpi?.changeType} icon={kpi?.icon} color={kpi?.color} />
                ))}
          </div>

          {/* Analytics Chart */}
          <div className="mb-8">
            <AnalyticsChart data={analyticsData} title="Actividad de Cupones — Últimos 10 días" />
          </div>

          {/* Supplier Metrics Cards */}
          <SupplierMetricsCards />

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {quickActions?.map((action, index) => (
              <QuickActionCard key={index} title={action?.title} description={action?.description} icon={action?.icon} color={action?.color} href={action?.href} onClick={() => window.location.href = action?.href} />
            ))}
          </div>

          {/* Active Campaigns Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Campañas Activas</h2>
              <Button variant="outline" size="sm" href="/campaigns-management">Ver todas</Button>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[0, 1]?.map(i => (
                  <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                    <div className="h-5 bg-muted rounded w-2/3 mb-4" />
                    <div className="h-4 bg-muted rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : activeCampaigns?.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <Icon name="Megaphone" size={32} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No hay campañas activas en este momento.</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => window.location.href = '/promotions-management'}>
                  Crear Promoción
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeCampaigns?.map(campaign => (
                  <div key={campaign?.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">{campaign?.name}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">Activa</span>
                      </div>
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon name="Zap" size={20} className="text-primary" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Campaigns & Quick Campaign Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Campañas Recientes</h3>
                <Button variant="ghost" size="sm" href="/campaigns-management">Ver todas</Button>
              </div>
              {loading ? (
                <div className="space-y-3">{[0, 1, 2]?.map(i => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}</div>
              ) : recentCampaigns?.length === 0 ? (
                <div className="text-center py-6">
                  <Icon name="Megaphone" size={24} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Sin campañas recientes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCampaigns?.map(campaign => (
                    <div key={campaign?.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon name="Megaphone" size={16} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{campaign?.name}</p>
                          <p className="text-xs text-muted-foreground">{new Date(campaign?.createdAt)?.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${campaign?.status === 'active' ? 'bg-success/10 text-success' : campaign?.status === 'scheduled' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>
                        {campaign?.status === 'active' ? 'Activa' : campaign?.status === 'scheduled' ? 'Programada' : 'Borrador'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Acciones Rápidas de Campañas</h3>
              <div className="space-y-3">
                <button onClick={() => window.location.href = '/campaigns-management'} className="w-full flex items-center gap-3 p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-left">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Icon name="Plus" size={20} className="text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Crear Nueva Campaña</p>
                    <p className="text-xs text-muted-foreground">Lanza una campaña de marketing</p>
                  </div>
                </button>
                <button onClick={() => window.location.href = '/campaigns-management'} className="w-full flex items-center gap-3 p-4 bg-muted/50 hover:bg-muted rounded-lg transition-colors text-left">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                    <Icon name="Calendar" size={20} className="text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Programar Campaña</p>
                    <p className="text-xs text-muted-foreground">Configura activación automática</p>
                  </div>
                </button>
                <button onClick={() => window.location.href = '/analytics-and-reports'} className="w-full flex items-center gap-3 p-4 bg-muted/50 hover:bg-muted rounded-lg transition-colors text-left">
                  <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Icon name="BarChart3" size={20} className="text-warning" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Ver Analíticas</p>
                    <p className="text-xs text-muted-foreground">Revisa rendimiento de campañas</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardOverview;