import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { fetchRewardsAnalytics, POINTS_RULES } from '../../services/rewardsService';
import useGamificationRealtime from '../../hooks/useGamificationRealtime';

import PunchCardsTab from './components/PunchCardsTab';
import NivelesVIPTab from './components/NivelesVIPTab';
import SorpresasTab from './components/SorpresasTab';
import ExperienciasTab from './components/ExperienciasTab';
import RewardsAnalyticsTab from './components/RewardsAnalyticsTab';
import CreatePunchCardPage from './components/CreatePunchCardPage';
import CreateExperiencePage from './components/CreateExperiencePage';

const RewardsManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('punch_cards');
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [showCreatePunchCard, setShowCreatePunchCard] = useState(false);
  const [showCreateExperience, setShowCreateExperience] = useState(false);
  const [liveNotification, setLiveNotification] = useState(null);

  const { user } = useAuth();

  const userDisplay = {
    name: user?.user_metadata?.full_name || user?.email || 'Usuario',
    email: user?.email || '',
    role: user?.user_metadata?.role || 'owner'
  };

  // ── Real-time: loyalty points & VIP changes ────────────────────────────────
  const handleLoyaltyChange = useCallback(({ type, payload }) => {
    const { eventType } = payload;
    if (eventType === 'UPDATE' || eventType === 'INSERT') {
      const msg = type === 'transaction' ?'💰 Nueva transacción de puntos registrada' :'⭐ Puntos de cliente actualizados';
      setLiveNotification({ id: Date.now(), message: msg, time: new Date()?.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) });
      setTimeout(() => setLiveNotification(null), 4000);
      // Refresh analytics silently
      if (user?.id) loadAnalytics();
    }
  }, [user?.id]);

  const handleVIPChange = useCallback((payload) => {
    const { eventType } = payload;
    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      setLiveNotification({ id: Date.now(), message: '👑 Nivel VIP de cliente actualizado', time: new Date()?.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) });
      setTimeout(() => setLiveNotification(null), 4000);
      if (user?.id) loadAnalytics();
    }
  }, [user?.id]);

  useGamificationRealtime({
    userId: user?.id,
    onLoyaltyChange: handleLoyaltyChange,
    onVIPChange: handleVIPChange,
  });

  const tabs = [
    { id: 'punch_cards', label: 'Punch Cards', icon: 'CreditCard', description: 'Tarjetas de sellos y metas' },
    { id: 'niveles_vip', label: 'Niveles VIP', icon: 'Award', description: 'Clasificación y beneficios VIP' },
    { id: 'sorpresas', label: 'Sorpresas', icon: 'Gift', description: 'Recompensas inesperadas' },
    { id: 'experiencias', label: 'Experiencias', icon: 'Star', description: 'Experiencias exclusivas' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3', description: 'Análisis y reportes' },
  ];

  useEffect(() => {
    if (user?.id) {
      loadAnalytics();
    } else {
      setLoadingAnalytics(false);
    }
  }, [user?.id]);

  const loadAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const data = await fetchRewardsAnalytics(user?.id);
      setAnalytics(data);
    } catch (err) {
      console.error('Error loading rewards analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const summaryKPIs = [
    {
      label: 'Punch Cards activas',
      value: loadingAnalytics ? '...' : String(analytics?.summary?.activePunchCards ?? 0),
      sub: `de 3 permitidas (PRO)`,
      icon: 'CreditCard', color: 'text-primary', bg: 'bg-primary/10'
    },
    {
      label: 'Clientes con tarjeta',
      value: loadingAnalytics ? '...' : String(analytics?.summary?.totalPunchCardClients ?? 0),
      sub: 'Acumulando sellos activamente',
      icon: 'Users', color: 'text-success', bg: 'bg-success/10'
    },
    {
      label: 'Niveles VIP activos',
      value: loadingAnalytics ? '...' : String(analytics?.vipLevels?.length ?? 0),
      sub: `${analytics?.summary?.totalVIPClients ?? 0} clientes clasificados`,
      icon: 'Award', color: 'text-warning', bg: 'bg-warning/10'
    },
    {
      label: 'Experiencias disponibles',
      value: loadingAnalytics ? '...' : String(analytics?.summary?.activeExperiences ?? 0),
      sub: `${analytics?.summary?.totalWaitlist ?? 0} en lista de espera`,
      icon: 'Sparkles', color: 'text-purple-600', bg: 'bg-purple-100'
    },
  ];

  const mainClasses = `pt-16 transition-all duration-500 ease-in-out relative z-10 ${
    isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
  }`;

  const mainStyle = {
    transitionProperty: 'margin-left',
    transitionDuration: '500ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={userDisplay}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={userDisplay}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isCollapsed={isSidebarCollapsed}
      />
      {/* Full-screen Create Punch Card Page */}
      {showCreatePunchCard && (
        <main className={mainClasses} style={mainStyle}>
          <div className="p-6">
            <CreatePunchCardPage
              businessId={user?.id}
              onClose={() => setShowCreatePunchCard(false)}
              onSaved={() => { setShowCreatePunchCard(false); loadAnalytics(); }}
            />
          </div>
        </main>
      )}
      {/* Full-screen Create Experience Page */}
      {showCreateExperience && (
        <main className={mainClasses} style={mainStyle}>
          <div className="p-6">
            <CreateExperiencePage
              businessId={user?.id}
              onClose={() => setShowCreateExperience(false)}
              onSaved={() => { setShowCreateExperience(false); loadAnalytics(); }}
            />
          </div>
        </main>
      )}
      {/* Main content - hidden when showing full-screen forms */}
      {!showCreatePunchCard && !showCreateExperience && (
        <main className={mainClasses} style={mainStyle}>
          <div className="p-6">

            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Recompensas</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Sistema de metas tangibles: punch cards, niveles VIP, sorpresas y experiencias exclusivas
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Icon name="Info" size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Regla de puntos: <strong>${POINTS_RULES?.MXN_PER_POINT} MXN = 1 pto</strong> · <strong>1 pto = ${POINTS_RULES?.POINT_VALUE_MXN} MXN</strong>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 self-start">
                {/* Live indicator */}
                <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-emerald-700">En vivo</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl">
                  <span className="text-sm text-muted-foreground">Módulo E2</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span className="text-sm font-medium text-success">Activo</span>
                </div>
              </div>
            </div>

            {/* Live notification toast */}
            {liveNotification && (
              <div className="mb-4 flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-lg">⚡</span>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">{liveNotification?.message}</p>
                  <p className="text-xs text-emerald-600">Actualización en tiempo real · {liveNotification?.time}</p>
                </div>
              </div>
            )}

            {/* Summary KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {summaryKPIs?.map((kpi, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-5">
                  <div className={`w-10 h-10 ${kpi?.bg} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon name={kpi?.icon} size={20} className={kpi?.color} />
                  </div>
                  <p className={`text-2xl font-bold ${kpi?.color}`}>{kpi?.value}</p>
                  <p className="text-xs font-medium text-foreground mt-1">{kpi?.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{kpi?.sub}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="border-b border-border mb-6">
              <nav className="flex space-x-1 overflow-x-auto">
                {tabs?.map(tab => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab?.id
                        ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                    }`}
                  >
                    <Icon name={tab?.icon} size={16} />
                    {tab?.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="pb-12">
              {activeTab === 'punch_cards' && (
                <PunchCardsTab
                  businessId={user?.id}
                  onDataChange={loadAnalytics}
                  onCreateNew={() => setShowCreatePunchCard(true)}
                />
              )}
              {activeTab === 'niveles_vip' && <NivelesVIPTab businessId={user?.id} onDataChange={loadAnalytics} />}
              {activeTab === 'sorpresas' && <SorpresasTab businessId={user?.id} />}
              {activeTab === 'experiencias' && (
                <ExperienciasTab
                  businessId={user?.id}
                  onDataChange={loadAnalytics}
                  onCreateNew={() => setShowCreateExperience(true)}
                />
              )}
              {activeTab === 'analytics' && (
                <RewardsAnalyticsTab
                  businessId={user?.id}
                  analytics={analytics}
                  loading={loadingAnalytics}
                  onRefresh={loadAnalytics}
                />
              )}
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default RewardsManagement;