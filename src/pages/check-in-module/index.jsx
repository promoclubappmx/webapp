import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import CheckInAnalyticsTab from './components/CheckInAnalyticsTab';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const TABS = [
  { id: 'resumen', label: 'Resumen', icon: 'LayoutDashboard' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
];

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

const METHOD_LABELS = {
  qr_static: 'QR en Mostrador',
  qr_dynamic: 'QR Dinámico',
  geofence: 'Geofence Automático',
  manual: 'Código Manual',
  nfc: 'NFC / Tap',
  beacon: 'BLE Beacon',
};

const METHOD_ICONS = {
  qr_static: { icon: 'QrCode', color: 'text-blue-600', bg: 'bg-blue-50' },
  qr_dynamic: { icon: 'QrCode', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  geofence: { icon: 'MapPin', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  manual: { icon: 'Keyboard', color: 'text-violet-600', bg: 'bg-violet-50' },
  nfc: { icon: 'Wifi', color: 'text-orange-600', bg: 'bg-orange-50' },
  beacon: { icon: 'Radio', color: 'text-pink-600', bg: 'bg-pink-50' },
};

const CONFIDENCE_MAP = {
  qr_static: { label: 'Alta', color: 'bg-green-100 text-green-700' },
  qr_dynamic: { label: 'Alta', color: 'bg-green-100 text-green-700' },
  geofence: { label: 'Media', color: 'bg-yellow-100 text-yellow-700' },
  manual: { label: 'Alta', color: 'bg-green-100 text-green-700' },
  nfc: { label: 'Alta', color: 'bg-green-100 text-green-700' },
  beacon: { label: 'Alta', color: 'bg-green-100 text-green-700' },
};

const ResumenTab = ({ onEdit, methods, rewards, rules, loading }) => {
  const totalCheckins = methods?.reduce((acc, m) => acc + (m?.checkins_this_month || 0), 0);
  const activeMethods = methods?.filter(m => m?.is_active)?.length;
  const topMethod = methods?.length > 0
    ? methods?.reduce((a, b) => (a?.checkins_this_month || 0) > (b?.checkins_this_month || 0) ? a : b)
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Icon name="Loader2" size={28} className="text-primary animate-spin mr-3" />
        <span className="text-muted-foreground">Cargando datos de check-in...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Check-ins este mes"
          value={totalCheckins?.toLocaleString()}
          sub="Todos los métodos"
          icon="ScanLine"
          color="text-blue-600 bg-blue-50"
          trend={undefined}
        />
        <StatCard
          label="Métodos activos"
          value={`${activeMethods} / ${methods?.length}`}
          sub="Configurados y habilitados"
          icon="ToggleRight"
          color="text-emerald-600 bg-emerald-50"
          trend={undefined}
        />
        <StatCard
          label="Método más usado"
          value={topMethod ? (METHOD_LABELS?.[topMethod?.method_type] || topMethod?.method_type)?.split(' ')?.[0] : '—'}
          sub={topMethod && totalCheckins > 0 ? `${Math.round(((topMethod?.checkins_this_month || 0) / totalCheckins) * 100)}% de todos los check-ins` : 'Sin datos aún'}
          icon="Award"
          color="text-amber-600 bg-amber-50"
          trend={undefined}
        />
        <StatCard
          label="Puntos base/check-in"
          value={rewards?.base_points ?? '—'}
          sub="Configuración actual"
          icon="Coins"
          color="text-purple-600 bg-purple-50"
          trend={undefined}
        />
      </div>

      {/* Methods Summary Grid */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Icon name="QrCode" size={18} className="text-primary" />
            <h3 className="font-semibold text-foreground">Métodos de check-in configurados</h3>
          </div>
          <button
            onClick={onEdit}
            className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
          >
            <Icon name="Edit3" size={12} /> Editar
          </button>
        </div>
        {methods?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="QrCode" size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay métodos de check-in configurados.</p>
            <button onClick={onEdit} className="mt-3 text-xs text-primary underline">Configurar ahora</button>
          </div>
        ) : (
          <div className="space-y-3">
            {methods?.map(method => {
              const meta = METHOD_ICONS?.[method?.method_type] || { icon: 'QrCode', color: 'text-blue-600', bg: 'bg-blue-50' };
              const conf = CONFIDENCE_MAP?.[method?.method_type] || { label: 'Media', color: 'bg-yellow-100 text-yellow-700' };
              return (
                <div key={method?.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${meta?.bg} flex items-center justify-center`}>
                      <Icon name={meta?.icon} size={16} className={meta?.color} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{METHOD_LABELS?.[method?.method_type] || method?.method_type}</p>
                      <p className="text-xs text-muted-foreground">{(method?.checkins_this_month || 0)?.toLocaleString()} check-ins/mes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${conf?.color}`}>
                      Confianza {conf?.label}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      method?.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {method?.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Control & Rewards Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rewards config summary */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon name="Star" size={18} className="text-primary" />
              <h3 className="font-semibold text-foreground">Configuración de recompensas</h3>
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
                  <Icon name="Coins" size={14} className="text-blue-600" />
                </div>
                <span className="text-sm text-foreground">Puntos base por check-in</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{rewards?.base_points ?? '—'} pts</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Icon name="Zap" size={14} className="text-amber-600" />
                </div>
                <span className="text-sm text-foreground">Multiplicadores activos</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {rewards?.multipliers_enabled ? 'Habilitados' : 'Deshabilitados'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Icon name="Flame" size={14} className="text-orange-600" />
                </div>
                <span className="text-sm text-foreground">Bonus por racha</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {rewards?.streak_bonus_enabled ? 'Habilitado' : 'Deshabilitado'}
              </span>
            </div>
          </div>
          {!rewards && (
            <div className="mt-4 p-3 bg-amber-50/60 border border-amber-100 rounded-lg">
              <p className="text-xs text-amber-700">
                No hay configuración de recompensas. <button onClick={onEdit} className="underline font-medium">Configura ahora</button>
              </p>
            </div>
          )}
        </div>

        {/* Control config summary */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon name="Shield" size={18} className="text-primary" />
              <h3 className="font-semibold text-foreground">Control anti-abuso</h3>
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
                <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Icon name="Calendar" size={14} className="text-emerald-600" />
                </div>
                <span className="text-sm text-foreground">Frecuencia máxima</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {rules?.max_daily_checkins ? `${rules?.max_daily_checkins} vez/día` : '1 vez al día'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Icon name="Clock" size={14} className="text-purple-600" />
                </div>
                <span className="text-sm text-foreground">Cooldown entre check-ins</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {rules?.cooldown_minutes ? `${rules?.cooldown_minutes} min` : '30 min'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
                  <Icon name="AlertTriangle" size={14} className="text-red-600" />
                </div>
                <span className="text-sm text-foreground">Alertas de abuso</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {rules?.abuse_alerts_enabled ? 'Activas' : 'Desactivadas'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckInModule = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('resumen');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Supabase data
  const [methods, setMethods] = useState([]);
  const [rewards, setRewards] = useState(null);
  const [rules, setRules] = useState(null);
  const [loading, setLoading] = useState(true);

  const userDisplay = {
    id: authUser?.id,
    name: authUser?.user_metadata?.full_name || authUser?.email || 'Usuario',
    email: authUser?.email || '',
    role: 'owner',
  };

  const loadData = useCallback(async () => {
    if (!authUser?.id) { setLoading(false); return; }
    try {
      setLoading(true);
      const [methodsRes, rewardsRes, rulesRes] = await Promise.all([
        supabase?.from('checkin_methods')?.select('*')?.eq('business_id', authUser?.id)?.order('created_at', { ascending: true }),
        supabase?.from('checkin_rewards')?.select('*')?.eq('business_id', authUser?.id)?.maybeSingle(),
        supabase?.from('checkin_rules')?.select('*')?.eq('business_id', authUser?.id)?.maybeSingle(),
      ]);
      setMethods(methodsRes?.data || []);
      setRewards(rewardsRes?.data || null);
      setRules(rulesRes?.data || null);
    } catch (err) {
      console.error('Error loading check-in data:', err);
    } finally {
      setLoading(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={userDisplay}
        onMenuToggle={() => setIsSidebarOpen(prev => !prev)}
        isMenuOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={userDisplay}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
      />
      <main
        className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Check-in y Validación</h1>
              <p className="text-sm text-muted-foreground mt-1">Resumen del módulo activo, analytics y configuración de métodos.</p>
            </div>
            <button
              onClick={() => navigate('/check-in-module/config')}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-sm text-sm whitespace-nowrap"
            >
              <Icon name="Edit3" size={16} />
              Editar / Configurar Validación
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-border mb-6">
            <div className="flex gap-1 overflow-x-auto">
              {TABS?.map(tab => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab?.id
                      ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  {tab?.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'resumen' && (
              <ResumenTab
                onEdit={() => navigate('/check-in-module/config')}
                methods={methods}
                rewards={rewards}
                rules={rules}
                loading={loading}
              />
            )}
            {activeTab === 'analytics' && <CheckInAnalyticsTab businessId={authUser?.id} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckInModule;
