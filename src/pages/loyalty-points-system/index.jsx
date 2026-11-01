import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import AnalyticsLoyaltyTab from './components/AnalyticsLoyaltyTab';
import HistorialTab from './components/HistorialTab';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import useRealtimeData from '../../hooks/useRealtimeData';

const TABS = [
  { id: 'resumen', label: 'Resumen', icon: 'LayoutDashboard' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
  { id: 'historial', label: 'Historial', icon: 'History' },
];

// ─── FALLBACK CONSTANTS (used when no DB record exists) ──────────────────────
const DEFAULT_ACCUMULATION_THRESHOLD = 5;   // $5 MXN = 1 punto
const DEFAULT_POINT_VALUE_MXN = 0.15;        // 1 punto = $0.15 MXN
const DEFAULT_CHECKIN_POINTS = 10;
const DEFAULT_WELCOME_POINTS = 20;
const DEFAULT_EXPIRY_MONTHS = 12;
const DEFAULT_AVG_TICKET = 200;
const DEFAULT_MONTHLY_VISITS = 450;
const REDEMPTION_RATE = 0.35;

const StatCard = ({ label, value, sub, icon, color, trend }) => (
  <div className="bg-card border border-border rounded-xl p-5">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon name={icon} size={20} />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-medium flex items-center gap-1 ${trend >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
          <Icon name={trend >= 0 ? 'TrendingUp' : 'TrendingDown'} size={12} />
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-foreground">{value}</p>
    <p className="text-sm text-muted-foreground mt-1">{label}</p>
    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

const ResumenTab = ({ onEdit, onGoToPlanner, onGoToEstablishments, loyaltyConfig, configLoading, liveKPIs }) => {
  const avgTicket = loyaltyConfig?.avg_ticket || DEFAULT_AVG_TICKET;
  const monthlyVisits = loyaltyConfig?.monthly_visits || DEFAULT_MONTHLY_VISITS;

  // Accumulation rules from DB or defaults
  const acumulacionRules = {
    umbralCompra: loyaltyConfig?.accumulation_threshold || DEFAULT_ACCUMULATION_THRESHOLD,
    puntosVisita: loyaltyConfig?.checkin_points ?? DEFAULT_CHECKIN_POINTS,
    puntoBienvenida: loyaltyConfig?.welcome_points ?? DEFAULT_WELCOME_POINTS,
    vencimiento: loyaltyConfig?.expiry_months ?? DEFAULT_EXPIRY_MONTHS,
  };

  const pointValueMXN = loyaltyConfig?.point_value_mxn || DEFAULT_POINT_VALUE_MXN;

  // Real calculations based on configured rules
  const ptsBasePerVisit = Math.floor(avgTicket / acumulacionRules?.umbralCompra);
  const discountPerVisit = ptsBasePerVisit * pointValueMXN;
  const retornoPct = parseFloat(((discountPerVisit / avgTicket) * 100)?.toFixed(2));

  // Monthly cost estimation
  const totalPtsMonth = ptsBasePerVisit * monthlyVisits;
  const grossCost = totalPtsMonth * pointValueMXN;
  const realCostMonth = grossCost * REDEMPTION_RATE;
  const revenueMonth = avgTicket * monthlyVisits;

  // Use live KPIs from Supabase
  const clientes = liveKPIs?.clientes ?? 0;
  const puntosCirculacion = liveKPIs?.puntosCirculacion ?? 0;
  const tasaCanje = liveKPIs?.tasaCanje ?? 0;
  const recompensas = liveKPIs?.recompensas ?? 0;

  if (configLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Icon name="Loader2" size={20} className="animate-spin" />
          <span className="text-sm">Cargando configuración del programa...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Clientes activos"
          value={clientes?.toLocaleString()}
          sub="Con saldo de puntos"
          icon="Users"
          color="text-blue-600 bg-blue-50"
          trend={8.2}
        />
        <StatCard
          label="Puntos en circulación"
          value={puntosCirculacion?.toLocaleString()}
          sub={`$${(puntosCirculacion * pointValueMXN)?.toFixed(0)} MXN en valor`}
          icon="Coins"
          color="text-amber-600 bg-amber-50"
          trend={12.5}
        />
        <StatCard
          label="Tasa de canje"
          value={`${tasaCanje}%`}
          sub="Promedio últimos 3 meses"
          icon="Gift"
          color="text-purple-600 bg-purple-50"
          trend={-1.8}
        />
        <StatCard
          label="Costo del programa"
          value={`$${realCostMonth?.toFixed(0)}`}
          sub={`${((realCostMonth / revenueMonth) * 100)?.toFixed(1)}% del revenue mensual`}
          icon="DollarSign"
          color="text-emerald-600 bg-emerald-50"
          trend={3.1}
        />
      </div>
      {/* Configuration summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accumulation rules — real values from DB */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon name="Coins" size={18} className="text-primary" />
              <h3 className="font-semibold text-foreground">Reglas de acumulación</h3>
            </div>
            <button
              onClick={onEdit}
              className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
            >
              <Icon name="Edit3" size={12} /> Editar
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Icon name="ShoppingCart" size={14} className="text-blue-600" />
                </div>
                <span className="text-sm text-foreground">Por monto de compra</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                ${Number(acumulacionRules?.umbralCompra)?.toFixed(2)} MXN = 1 pto
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Icon name="MapPin" size={14} className="text-emerald-600" />
                </div>
                <span className="text-sm text-foreground">Por visita (check-in)</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {acumulacionRules?.puntosVisita} pts/visita
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Icon name="Gift" size={14} className="text-purple-600" />
                </div>
                <span className="text-sm text-foreground">Puntos de bienvenida</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {acumulacionRules?.puntoBienvenida} pts
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Icon name="CalendarX" size={14} className="text-amber-600" />
                </div>
                <span className="text-sm text-foreground">Vencimiento de puntos</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {acumulacionRules?.vencimiento} meses
              </span>
            </div>
          </div>
          {/* Calculation note */}
          <div className="mt-4 p-3 bg-blue-50/60 border border-blue-100 rounded-lg">
            <p className="text-xs text-blue-700">
              Con ticket promedio de <strong>${avgTicket} MXN</strong>: el cliente acumula{' '}
              <strong>{ptsBasePerVisit} pts</strong> por compra + <strong>{acumulacionRules?.puntosVisita} pts</strong> por check-in ={' '}
              <strong>{ptsBasePerVisit + acumulacionRules?.puntosVisita} pts/visita</strong> en total.
            </p>
          </div>
        </div>

        {/* Point value & return — real calculations from DB */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon name="TrendingUp" size={18} className="text-primary" />
              <h3 className="font-semibold text-foreground">Valor del punto y retorno</h3>
            </div>
            <button
              onClick={onEdit}
              className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
            >
              <Icon name="Edit3" size={12} /> Editar
            </button>
          </div>
          <div className="space-y-4">
            {/* Point value */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">Valor por punto</span>
                <span className="text-xl font-bold text-primary">${Number(pointValueMXN)?.toFixed(2)} MXN</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Descuento directo al canjear · Configuración del programa
              </p>
            </div>
            {/* Return % — real calculation */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-emerald-700">Retorno al cliente</span>
                <span className="text-xl font-bold text-emerald-700">{retornoPct}%</span>
              </div>
              <p className="text-xs text-emerald-600">
                Por cada ${avgTicket} MXN gastados, el cliente recupera{' '}
                <strong>${discountPerVisit?.toFixed(2)} MXN</strong> en descuento futuro
              </p>
              <p className="text-xs text-emerald-500 mt-1">
                Cálculo: {ptsBasePerVisit} pts × ${Number(pointValueMXN)?.toFixed(2)} MXN/pto ÷ ${avgTicket} ticket = {retornoPct}%
              </p>
            </div>
            {/* Extra metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <p className="text-lg font-bold text-foreground">{recompensas}</p>
                <p className="text-xs text-muted-foreground">Recompensas activas</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <p className="text-lg font-bold text-foreground">${realCostMonth?.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Costo estimado/mes</p>
              </div>
            </div>
            {/* Monthly cost breakdown */}
            <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Proyección mensual ({monthlyVisits} visitas)
              </p>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Pts generados/mes</span>
                <span className="font-medium text-foreground">{totalPtsMonth?.toLocaleString()} pts</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Descuentos potenciales</span>
                <span className="font-medium text-foreground">${grossCost?.toFixed(0)} MXN</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Costo real ({(REDEMPTION_RATE * 100)?.toFixed(0)}% canje)</span>
                <span className="font-semibold text-primary">${realCostMonth?.toFixed(0)} MXN</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Ver catálogo de recompensas',
            icon: 'Gift',
            desc: `${recompensas} recompensas configuradas`,
            action: onEdit,
          },
          {
            label: 'Planificador de costo del programa',
            icon: 'BarChart3',
            desc: 'Proyectar y analizar el costo del programa',
            action: onGoToPlanner,
          },
          {
            label: 'Ver/Configurar establecimientos',
            icon: 'MapPin',
            desc: 'Gestionar establecimientos en el programa',
            action: onGoToEstablishments,
          },
        ]?.map(item => (
          <button
            key={item?.label}
            onClick={item?.action}
            className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
          >
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon name={item?.icon} size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{item?.label}</p>
              <p className="text-xs text-muted-foreground">{item?.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const LoyaltyPointsSystem = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('resumen');
  const [loyaltyConfig, setLoyaltyConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [liveKPIs, setLiveKPIs] = useState({ clientes: 0, puntosCirculacion: 0, tasaCanje: 0, recompensas: 0 });
  const [realtimeIndicator, setRealtimeIndicator] = useState(false);

  const user = {
    name: authUser?.user_metadata?.full_name || 'Carlos Mendoza',
    email: authUser?.email || 'carlos@promospot.com',
    role: 'owner',
  };

  useEffect(() => {
    const fetchLoyaltyConfig = async () => {
      if (!authUser?.id) {
        setConfigLoading(false);
        return;
      }
      try {
        setConfigLoading(true);
        const { data, error } = await supabase
          ?.from('loyalty_programs')
          ?.select('accumulation_threshold, point_value_mxn, mxn_per_point, points_per_mxn, avg_ticket, monthly_visits, is_active, name')
          ?.eq('business_id', authUser?.id)
          ?.maybeSingle();
        if (!error && data) {
          setLoyaltyConfig({
            ...data,
            point_value_mxn: data?.point_value_mxn || data?.mxn_per_point || DEFAULT_POINT_VALUE_MXN,
            accumulation_threshold: data?.accumulation_threshold || (data?.points_per_mxn ? (1 / data?.points_per_mxn) : DEFAULT_ACCUMULATION_THRESHOLD),
          });
        }
      } catch (err) {
        // silently handle
      } finally {
        setConfigLoading(false);
      }
    };
    fetchLoyaltyConfig();
  }, [authUser?.id]);

  // Load real KPI stats from loyalty_points and loyalty_rewards tables
  const fetchKPIs = useCallback(async () => {
    if (!authUser?.id) return;
    try {
      const [pointsRes, rewardsRes] = await Promise.all([
        supabase
          ?.from('loyalty_points')
          ?.select('points_balance, total_earned, total_redeemed')
          ?.eq('business_id', authUser?.id),
        supabase
          ?.from('loyalty_rewards')
          ?.select('id, status')
          ?.eq('business_id', authUser?.id)
          ?.eq('status', 'active'),
      ]);

      const pointsData = pointsRes?.data || [];
      const rewardsData = rewardsRes?.data || [];

      const activeClients = pointsData?.filter(p => (p?.points_balance || 0) > 0)?.length;
      const totalCirculation = pointsData?.reduce((s, p) => s + (p?.points_balance || 0), 0);
      const totalEarned = pointsData?.reduce((s, p) => s + (p?.total_earned || 0), 0);
      const totalRedeemed = pointsData?.reduce((s, p) => s + (p?.total_redeemed || 0), 0);
      const tasaCanje = totalEarned > 0 ? Math.round((totalRedeemed / totalEarned) * 100) : 0;

      setLiveKPIs({
        clientes: activeClients,
        puntosCirculacion: totalCirculation,
        tasaCanje,
        recompensas: rewardsData?.length,
      });
    } catch (err) {
      console.error('Error loading loyalty KPIs:', err);
    }
  }, [authUser?.id]);

  useEffect(() => {
    fetchKPIs();
  }, [fetchKPIs]);

  // Real-time: refresh KPIs when loyalty data changes
  const handleRealtimeChange = useCallback(() => {
    setRealtimeIndicator(true);
    setTimeout(() => setRealtimeIndicator(false), 2000);
    fetchKPIs();
  }, [fetchKPIs]);

  useRealtimeData({
    channelName: `loyalty_realtime_${authUser?.id}`,
    tables: ['loyalty_points', 'loyalty_transactions', 'loyalty_reward_redemptions', 'loyalty_rewards'],
    events: ['INSERT', 'UPDATE', 'DELETE'],
    onRefresh: handleRealtimeChange,
    enabled: !!authUser?.id,
  });

  const handleEdit = () => {
    navigate('/loyalty-points-system/edit');
  };

  const handleGoToPlanner = () => {
    navigate('/loyalty-points-system/edit', { state: { subTab: 'parametrizacion' } });
  };

  const handleGoToEstablishments = () => {
    navigate('/loyalty-points-system/edit', { state: { subTab: 'establecimientos' } });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'resumen':
        return (
          <ResumenTab
            onEdit={handleEdit}
            onGoToPlanner={handleGoToPlanner}
            onGoToEstablishments={handleGoToEstablishments}
            loyaltyConfig={loyaltyConfig}
            configLoading={configLoading}
            liveKPIs={liveKPIs}
          />
        );
      case 'analytics': return <AnalyticsLoyaltyTab />;
      case 'historial': return <HistorialTab />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main
        className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}
        style={{ transitionProperty: 'margin-left', transitionDuration: '500ms', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Programa de Puntos de Lealtad</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Resumen del programa activo, analytics e historial de transacciones.
              </p>
            </div>
            <div className="flex items-center gap-3 self-start">
              {/* Real-time indicator */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5">
                <span className={`w-2 h-2 rounded-full ${realtimeIndicator ? 'bg-emerald-500 animate-ping' : 'bg-emerald-400'}`} />
                <span>En vivo</span>
              </div>
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                <Icon name="Edit3" size={16} />
                Editar / Configurar programa
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border mb-6">
            <nav className="flex space-x-1 overflow-x-auto">
              {TABS?.map(tab => (
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

          {/* Tab content */}
          <div className="pb-12">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoyaltyPointsSystem;