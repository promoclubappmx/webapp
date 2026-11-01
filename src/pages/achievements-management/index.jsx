import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import useGamificationRealtime from '../../hooks/useGamificationRealtime';

const TABS = [
  { id: 'resumen', label: 'Resumen', icon: 'LayoutDashboard' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
];

const CATEGORY_META = {
  visitas:       { name: 'Visitas',     icon: '📍', color: 'bg-blue-100 text-blue-700',   total: 6 },
  antiguedad:    { name: 'Antigüedad',  icon: '📅', color: 'bg-purple-100 text-purple-700', total: 5 },
  social:        { name: 'Social',      icon: '👥', color: 'bg-green-100 text-green-700',  total: 7 },
  lealtad:       { name: 'Lealtad',     icon: '🎯', color: 'bg-amber-100 text-amber-700',  total: 6 },
  momentos:      { name: 'Momentos',    icon: '✨', color: 'bg-pink-100 text-pink-700',    total: 6 },
  ecosistema:    { name: 'Ecosistema',  icon: '📱', color: 'bg-cyan-100 text-cyan-700',    total: 6 },
  gasto:         { name: 'Gasto',       icon: '💰', color: 'bg-gray-100 text-gray-500',    total: 3 },
  catalogo:      { name: 'Catálogo',    icon: '🍽️', color: 'bg-gray-100 text-gray-500',   total: 4 },
  personalizado: { name: 'Personalizados', icon: '⭐', color: 'bg-rose-100 text-rose-700', total: 0 },
};

const RARITY_META = {
  comun:      { label: 'Común',      color: 'bg-gray-100 text-gray-700 border-gray-200',     desc: 'Fácil de obtener, primeras interacciones' },
  raro:       { label: 'Raro',       color: 'bg-blue-100 text-blue-700 border-blue-200',      desc: 'Requiere constancia y esfuerzo' },
  epico:      { label: 'Épico',      color: 'bg-purple-100 text-purple-700 border-purple-200', desc: 'Logros de alto compromiso' },
  legendario: { label: 'Legendario', color: 'bg-amber-100 text-amber-700 border-amber-200',   desc: 'Solo los más fieles los obtienen' },
  unico:      { label: 'Único',      color: 'bg-rose-100 text-rose-700 border-rose-200',      desc: 'Exclusivos, cupo limitado' },
};

// ─── RESUMEN TAB ──────────────────────────────────────────────────────────────
const ResumenTab = ({ onEdit, realtimeEvents, achievementsData, configData, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Icon name="Loader2" size={20} className="animate-spin" />
          <span className="text-sm">Cargando logros...</span>
        </div>
      </div>
    );
  }

  const totalCatalog = achievementsData?.length || 0;
  const totalActive = achievementsData?.filter(a => a?.is_active)?.length || 0;
  const customCount = achievementsData?.filter(a => a?.category === 'personalizado')?.length || 0;

  // Build category stats from real data
  const categoryStats = Object.entries(CATEGORY_META)?.map(([key, meta]) => {
    const items = achievementsData?.filter(a => a?.category === key) || [];
    const active = items?.filter(a => a?.is_active)?.length || 0;
    const total = Math.max(meta?.total, items?.length);
    return { name: meta?.name, icon: meta?.icon, active, total, color: meta?.color };
  })?.filter(c => c?.total > 0);

  // Build rarity stats from real data
  const rarityStats = Object.entries(RARITY_META)?.map(([key, meta]) => {
    const count = achievementsData?.filter(a => a?.rarity === key && a?.is_active)?.length || 0;
    return { rarity: meta?.label, color: meta?.color, desc: meta?.desc, count };
  });

  const uniqueCategories = [...new Set(achievementsData?.filter(a => a?.is_active)?.map(a => a?.category))]?.length || 0;

  return (
    <div className="space-y-6">
      {/* Config summary + Category overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Config summary */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon name="Settings2" size={18} className="text-primary" />
              <h3 className="font-semibold text-foreground">Configuración activa</h3>
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
                <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Icon name="Trophy" size={14} className="text-amber-600" />
                </div>
                <span className="text-sm text-foreground">Logros activos</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{totalActive} de {totalCatalog}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Icon name="Grid3X3" size={14} className="text-blue-600" />
                </div>
                <span className="text-sm text-foreground">Categorías habilitadas</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{uniqueCategories} categorías</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Icon name="Layers" size={14} className="text-purple-600" />
                </div>
                <span className="text-sm text-foreground">Niveles de rareza</span>
              </div>
              <span className="text-sm font-semibold text-foreground">5 niveles</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Icon name="Bell" size={14} className="text-emerald-600" />
                </div>
                <span className="text-sm text-foreground">Mensajes de celebración</span>
              </div>
              <span className={`text-sm font-semibold ${configData?.notify_on_unlock ? 'text-success' : 'text-muted-foreground'}`}>
                {configData?.notify_on_unlock !== false ? 'Activados' : 'Desactivados'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Icon name="Target" size={14} className="text-orange-600" />
                </div>
                <span className="text-sm text-foreground">Notif. cerca del logro</span>
              </div>
              <span className={`text-sm font-semibold ${configData?.notify_nearby ? 'text-success' : 'text-muted-foreground'}`}>
                {configData?.notify_nearby !== false ? 'Activada' : 'Desactivada'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center">
                  <Icon name="Sparkles" size={14} className="text-violet-600" />
                </div>
                <span className="text-sm text-foreground">Logros personalizados</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{customCount} creados</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-primary/5 border border-primary/10 rounded-lg">
            <p className="text-xs text-primary">
              El sistema tiene <strong>{totalActive} logros activos</strong> distribuidos en{' '}
              <strong>{uniqueCategories} categorías</strong> con 5 niveles de rareza.
            </p>
          </div>
        </div>

        {/* Category overview */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon name="LayoutGrid" size={18} className="text-amber-500" />
              <h3 className="font-semibold text-foreground">Logros por categoría</h3>
            </div>
            <button
              onClick={onEdit}
              className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
            >
              <Icon name="Edit3" size={12} /> Configurar
            </button>
          </div>
          <div className="space-y-2">
            {categoryStats?.map((cat, idx) => {
              const pct = cat?.total > 0 ? Math.max((cat?.active / cat?.total) * 100, cat?.active > 0 ? 8 : 0) : 0;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 w-28 flex-shrink-0">
                    <span className="text-sm">{cat?.icon}</span>
                    <span className="text-xs font-medium text-foreground truncate">{cat?.name}</span>
                  </div>
                  <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                    {pct > 0 ? (
                      <div
                        className="h-6 rounded-full flex items-center justify-end pr-2 transition-all bg-gradient-to-r from-amber-400 to-amber-500"
                        style={{ width: `${pct}%` }}
                      >
                        <span className="text-white text-xs font-bold">{cat?.active}</span>
                      </div>
                    ) : (
                      <div className="h-6 flex items-center pl-2">
                        <span className="text-xs text-muted-foreground">0</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right flex-shrink-0">
                    {cat?.active}/{cat?.total}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-xs text-amber-700">
              Total activos: <strong>{totalActive} logros</strong> de {totalCatalog} disponibles en el catálogo.
            </p>
          </div>
        </div>
      </div>
      {/* Rareza y reglas */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="ShieldCheck" size={18} className="text-primary" />
          <h3 className="font-semibold text-foreground">Niveles de rareza y comportamiento</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {rarityStats?.map((r, i) => (
            <div key={i} className={`p-3 rounded-xl border ${r?.color}`}>
              <p className="text-xs font-bold uppercase tracking-wide mb-1">{r?.rarity}</p>
              <p className="text-lg font-bold">{r?.count}</p>
              <p className="text-xs mt-1 opacity-80">{r?.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── ANALYTICS TAB ────────────────────────────────────────────────────────────
const AnalyticsTab = ({ achievementsData }) => {
  const topAchievements = (achievementsData || [])
    ?.filter(a => a?.is_active)
    ?.slice(0, 5)
    ?.map(a => ({
      emoji: a?.emoji || '🏆',
      name: a?.name,
      category: CATEGORY_META?.[a?.category]?.name || a?.category,
      unlocked: a?.founder_granted || 0,
    }));

  const kpis = [
    { label: 'Logros desbloqueados hoy', value: '—', icon: 'Trophy', color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Clientes con al menos 1 logro', value: '—', icon: 'Users', color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Logros únicos otorgados', value: '—', icon: 'Sparkles', color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Tasa de desbloqueo', value: '—', icon: 'TrendingUp', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis?.map((kpi, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className={`w-10 h-10 ${kpi?.bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon name={kpi?.icon} size={20} className={kpi?.color} />
            </div>
            <p className="text-2xl font-bold text-foreground">{kpi?.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi?.label}</p>
          </div>
        ))}
      </div>

      {topAchievements?.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Logros activos del catálogo</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">#</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Logro</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Categoría</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Otorgados</th>
              </tr>
            </thead>
            <tbody>
              {topAchievements?.map((a, i) => (
                <tr key={i} className="border-t border-border hover:bg-muted/20">
                  <td className="p-3 font-bold text-muted-foreground">{i + 1}</td>
                  <td className="p-3">
                    <span className="flex items-center gap-1.5">
                      <span>{a?.emoji}</span>
                      <span className="font-medium text-foreground">{a?.name}</span>
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">{a?.category}</td>
                  <td className="p-3 text-primary font-medium">{a?.unlocked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const AchievementsManagement = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('resumen');
  const [realtimeEvents, setRealtimeEvents] = useState([]);
  const [liveNotification, setLiveNotification] = useState(null);
  const [achievementsData, setAchievementsData] = useState([]);
  const [configData, setConfigData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  const { user: authUser } = useAuth();
  const user = {
    name: authUser?.user_metadata?.full_name || authUser?.email || 'Usuario',
    email: authUser?.email || '',
    role: authUser?.user_metadata?.role || 'owner'
  };

  // Load achievements from Supabase
  const loadAchievements = useCallback(async () => {
    if (!authUser?.id) { setDataLoading(false); return; }
    try {
      const [catalogRes, configRes] = await Promise.all([
        supabase
          ?.from('achievement_catalog')
          ?.select('*')
          ?.eq('business_id', authUser?.id)
          ?.order('sort_order', { ascending: true }),
        supabase
          ?.from('business_achievements_config')
          ?.select('*')
          ?.eq('business_id', authUser?.id)
          ?.maybeSingle(),
      ]);
      if (!catalogRes?.error) setAchievementsData(catalogRes?.data || []);
      if (!configRes?.error && configRes?.data) setConfigData(configRes?.data);
    } catch (err) {
      console.error('Error loading achievements:', err);
    } finally {
      setDataLoading(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  const handleAchievementChange = useCallback((payload) => {
    const { eventType, new: newRecord } = payload;
    if (eventType === 'INSERT' && newRecord) {
      const notification = {
        id: Date.now(),
        message: `🏆 Nuevo logro desbloqueado`,
        detail: `Cliente obtuvo un nuevo logro`,
        time: new Date()?.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      };
      setLiveNotification(notification);
      setRealtimeEvents(prev => [notification, ...prev]?.slice(0, 20));
      setTimeout(() => setLiveNotification(null), 4000);
      loadAchievements();
    }
  }, [loadAchievements]);

  useGamificationRealtime({
    userId: authUser?.id,
    onAchievementChange: handleAchievementChange,
  });

  const handleEdit = () => navigate('/achievements-management/wizard');

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isMenuOpen={isSidebarOpen} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <main className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Logros</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Monitorea y configura el sistema de logros para premiar la fidelidad de tus clientes.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleEdit} iconName="Settings2">
                Editar / Configurar Logros
              </Button>
            </div>
          </div>

          {/* Live notification toast */}
          {liveNotification && (
            <div className="mb-4 flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl animate-pulse">
              <span className="text-lg">🏆</span>
              <div>
                <p className="text-sm font-semibold text-amber-800">{liveNotification?.message}</p>
                <p className="text-xs text-amber-600">{liveNotification?.detail} · {liveNotification?.time}</p>
              </div>
            </div>
          )}

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

          <div className="pb-12">
            {activeTab === 'resumen' && (
              <ResumenTab
                onEdit={handleEdit}
                realtimeEvents={realtimeEvents}
                achievementsData={achievementsData}
                configData={configData}
                loading={dataLoading}
              />
            )}
            {activeTab === 'analytics' && <AnalyticsTab achievementsData={achievementsData} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AchievementsManagement;
