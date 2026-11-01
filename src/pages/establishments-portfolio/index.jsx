import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

import AlertsBanner from './components/AlertsBanner';
import EstablishmentsGrid from './components/EstablishmentsGrid';
import CompareTab from './components/CompareTab';
import PortfolioMetricCards from './components/PortfolioMetricCards';
import EstablishmentManageModal from './components/EstablishmentManageModal';
import { MONTHLY_TREND_DATA } from './components/mockData';

const CATEGORY_PILLS = [
  { key: 'Todos', label: 'Todos', icon: 'LayoutGrid' },
  { key: 'Restaurantes y comida', label: 'Restaurantes', icon: 'UtensilsCrossed' },
  { key: 'Compras y retail', label: 'Retail', icon: 'ShoppingBag' },
  { key: 'Salud y medicina', label: 'Salud', icon: 'Heart' },
  { key: 'Belleza y cuidado personal', label: 'Belleza', icon: 'Sparkles' },
  { key: 'Deporte y fitness', label: 'Fitness', icon: 'Dumbbell' },
  { key: 'Mascotas', label: 'Mascotas', icon: 'PawPrint' },
  { key: 'Entretenimiento', label: 'Entretenimiento', icon: 'Music' },
  { key: 'Servicios automotrices', label: 'Automotriz', icon: 'Car' },
  { key: 'Servicios profesionales', label: 'Profesionales', icon: 'Briefcase' },
  { key: 'Turismo y hospedaje', label: 'Turismo', icon: 'MapPin' },
  { key: 'Educación', label: 'Educación', icon: 'GraduationCap' },
  { key: 'Bares y vida nocturna', label: 'Bares', icon: 'Wine' },
  { key: 'Servicios generales', label: 'Servicios', icon: 'Wrench' },
];

// Map business_settings row → establishment card shape
const mapSettingsToEstablishment = (row) => {
  const categoryName = row?.categoria_nombre || 'Servicios generales';
  const plan = (row?.subscription_plan || 'free')?.toUpperCase();
  const isPublished = row?.is_published;
  const wizardCompleted = !!row?.wizard_completed_at;
  const profileScore = calculateProfileScore(row);

  let status = 'setup';
  if (isPublished && wizardCompleted) status = 'published';
  else if (row?.subscription_status === 'expired') status = 'expired';
  else if (row?.subscription_status === 'paused') status = 'paused';

  const name = row?.nombre_comercial || row?.business_name || 'Mi negocio';
  const initial = name?.[0]?.toUpperCase() || '?';

  const alerts = [];
  if (!isPublished && profileScore < 50) {
    alerts?.push({ type: 'yellow', message: `Tu ficha está ${profileScore}% completa — complétala para aparecer en búsquedas`, action: 'Completar ficha', actionPath: '/business-listings-management' });
  }

  return {
    id: row?.id,
    name,
    category: categoryName,
    subcategory: row?.categoria_nombre || '',
    tipo: '',
    plan: plan === 'FREE' ? 'FREE' : plan === 'PREMIUM' ? 'PREMIUM' : 'PRO',
    status,
    profileCompletion: profileScore,
    logo: row?.business_image_url || row?.logo_negocio || null,
    logoColor: row?.brand_primary_color || '#7C3AED',
    initial,
    location: [row?.business_city, row?.business_state]?.filter(Boolean)?.join(', ') || row?.business_address || 'Sin dirección',
    branches: 1,
    metrics: {
      visitsToday: 0,
      visitsTodayChange: 0,
      activeCustomers30d: 0,
      activePromos: 0,
      rating: 0,
      reviewCount: 0,
    },
    alerts,
    kpis: {
      visitsWeek: [0, 0, 0, 0, 0, 0, 0],
      visitsMonth: 0,
      revenueMonth: 0,
      topPromo: null,
      profileScore,
      newCustomers: 0,
      dormantCustomers: 0,
    },
    revenueMonth: 0,
    createdAt: row?.created_at || new Date()?.toISOString(),
    lastActivity: row?.updated_at || new Date()?.toISOString(),
    comparison: {
      visitsMonth: 0, revenueMonth: 0, activeCustomers: 0, newCustomers: 0,
      dormantCustomers: 0, retentionRate: 0, rating: 0, reviewsMonth: 0,
      activePromos: 0, couponsRedeemed: 0, pointsIssued: 0, pointsRedeemed: 0,
      profileScore, plan,
      trend: { visitsMonth: 'neutral', revenueMonth: 'neutral', activeCustomers: 'neutral', retentionRate: 'neutral', rating: 'neutral' }
    },
    // Keep raw row for the manage modal
    _raw: row,
  };
};

const calculateProfileScore = (row) => {
  let score = 0;
  if (row?.business_name || row?.nombre_comercial) score += 15;
  if (row?.business_description || row?.short_description) score += 10;
  if (row?.business_address || row?.street) score += 10;
  if (row?.business_city) score += 5;
  if (row?.contact_phone || row?.business_phone) score += 10;
  if (row?.contact_email || row?.business_email) score += 5;
  if (row?.business_image_url || row?.logo_negocio) score += 15;
  if (row?.cover_image_url) score += 10;
  if (row?.operating_hours && Object.keys(row?.operating_hours || {})?.length > 0) score += 10;
  if (row?.payment_methods && Object.keys(row?.payment_methods || {})?.some(k => row?.payment_methods?.[k])) score += 5;
  if (row?.categoria_id) score += 5;
  return Math.min(score, 100);
};

const EstablishmentsPortfolio = () => {
  const navigate = useNavigate();
  const { user: authUser, userProfile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('establishments');
  const [activeCategoryPill, setActiveCategoryPill] = useState('Todos');
  const [kpisEstablishment, setKpisEstablishment] = useState(null);
  const [manageEstablishment, setManageEstablishment] = useState(null);

  // Supabase data state
  const [establishments, setEstablishments] = useState([]);
  const [loadingEstablishments, setLoadingEstablishments] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const loadEstablishments = useCallback(async () => {
    if (!authUser?.id) return;
    setLoadingEstablishments(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase
        ?.from('business_settings')
        ?.select('*')
        ?.eq('owner_id', authUser?.id)
        ?.order('created_at', { ascending: false });

      if (error) throw error;
      setEstablishments((data || [])?.map(mapSettingsToEstablishment));
    } catch (e) {
      console.error('Error loading establishments:', e);
      setLoadError(e?.message || 'Error al cargar establecimientos');
    } finally {
      setLoadingEstablishments(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    loadEstablishments();
  }, [loadEstablishments]);

  // Filter establishments by selected category pill
  const filteredEstablishments = activeCategoryPill === 'Todos'
    ? establishments
    : establishments?.filter(e => e?.category === activeCategoryPill);

  // Only show pills that have at least one establishment OR are "Todos"
  const availableCategories = new Set(establishments?.map(e => e?.category));
  const visiblePills = CATEGORY_PILLS?.filter(p => p?.key === 'Todos' || availableCategories?.has(p?.key));

  const activeCount = filteredEstablishments?.filter(e => e?.status === 'published')?.length;
  const setupCount = filteredEstablishments?.filter(e => e?.status === 'setup')?.length;

  const handleCategoryPillClick = (key) => {
    setActiveCategoryPill(key);
  };

  const handleManage = (est) => {
    setManageEstablishment(est);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={authUser}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={authUser}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main
        className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
        style={{
          transitionProperty: 'margin-left',
          transitionDuration: '500ms',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="p-4 sm:p-6 max-w-screen-2xl mx-auto space-y-6">

          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Establecimientos</h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {loadingEstablishments ? (
                  <span className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground text-sm font-semibold px-3 py-1 rounded-full">
                    <Icon name="Loader" size={12} className="animate-spin" />
                    Cargando...
                  </span>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold px-3 py-1 rounded-full">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      {activeCount} activos
                    </span>
                    {setupCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-semibold px-3 py-1 rounded-full">
                        ⚙️ {setupCount} en configuración
                      </span>
                    )}
                  </>
                )}
                {activeCategoryPill !== 'Todos' && (
                  <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-full">
                    <Icon name="Filter" size={12} />
                    {activeCategoryPill}
                    <button onClick={() => setActiveCategoryPill('Todos')} className="ml-1 hover:text-destructive transition-colors">
                      <Icon name="X" size={12} />
                    </button>
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/business-listing-wizard')}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md"
              >
                <Icon name="Plus" size={18} />
                Nuevo establecimiento
              </button>
            </div>
          </div>

          {/* Error state */}
          {loadError && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
              <Icon name="AlertCircle" size={18} className="flex-shrink-0" />
              <span>{loadError}</span>
              <button onClick={loadEstablishments} className="ml-auto text-xs font-medium underline">Reintentar</button>
            </div>
          )}

          {/* Category filter pills */}
          {!loadingEstablishments && establishments?.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {visiblePills?.map(pill => (
                <button
                  key={pill?.key}
                  onClick={() => handleCategoryPillClick(pill?.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 border ${
                    activeCategoryPill === pill?.key
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  <Icon name={pill?.icon} size={13} />
                  {pill?.label}
                  {pill?.key !== 'Todos' && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ml-0.5 ${
                      activeCategoryPill === pill?.key
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {establishments?.filter(e => e?.category === pill?.key)?.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-border">
            {[
              { key: 'establishments', label: 'Mis Establecimientos', icon: 'Building2' },
              { key: 'analytics', label: 'Analytics', icon: 'BarChart2' },
              { key: 'compare', label: 'Comparar', icon: 'GitCompare' },
            ]?.map(tab => (
              <button
                key={tab?.key}
                onClick={() => setActiveTab(tab?.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === tab?.key
                    ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                {tab?.label}
              </button>
            ))}
          </div>

          {activeTab === 'establishments' && (
            <div className="space-y-6">
              {/* Loading skeleton */}
              {loadingEstablishments && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[1, 2, 3]?.map(i => (
                    <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-muted" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[1, 2, 3, 4]?.map(j => <div key={j} className="h-12 bg-muted rounded-lg" />)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!loadingEstablishments && establishments?.length === 0 && !loadError && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                    <Icon name="Building2" size={32} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">No tienes establecimientos registrados</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mb-6">
                    Crea tu primer establecimiento para empezar a atraer clientes y gestionar tu negocio en PromoClub.
                  </p>
                  <button
                    onClick={() => navigate('/business-listing-wizard')}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                  >
                    <Icon name="Plus" size={16} />
                    Crear primer establecimiento
                  </button>
                </div>
              )}

              {/* Establishments grid */}
              {!loadingEstablishments && establishments?.length > 0 && (
                <>
                  <AlertsBanner establishments={filteredEstablishments} />
                  <EstablishmentsGrid
                    establishments={filteredEstablishments}
                    onKPIs={(est) => setKpisEstablishment(est)}
                    onManage={handleManage}
                  />
                </>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <PortfolioMetricCards
              establishments={filteredEstablishments}
              categoryFilter={activeCategoryPill}
              metrics={{
                totalEstablishments: filteredEstablishments?.length || 0,
                activeEstablishments: filteredEstablishments?.filter(e => e?.status === 'published')?.length || 0,
                setupEstablishments: filteredEstablishments?.filter(e => e?.status === 'setup')?.length || 0,
                totalVisits: filteredEstablishments?.reduce((acc, e) => acc + (e?.metrics?.visitsToday || 0), 0),
                totalCustomers: filteredEstablishments?.reduce((acc, e) => acc + (e?.metrics?.activeCustomers30d || 0), 0),
                avgProfileScore: filteredEstablishments?.length
                  ? Math.round(filteredEstablishments?.reduce((acc, e) => acc + (e?.profileCompletion || 0), 0) / filteredEstablishments?.length)
                  : 0,
              }}
            />
          )}

          {activeTab === 'compare' && (
            <CompareTab
              establishments={filteredEstablishments}
              monthlyTrend={MONTHLY_TREND_DATA}
            />
          )}
        </div>
      </main>

      {/* KPI Analytics Sidebar Drawer */}
      {kpisEstablishment && (
        <KPIAnalyticsDrawer
          establishment={kpisEstablishment}
          onClose={() => setKpisEstablishment(null)}
        />
      )}

      {/* Manage Establishment Modal */}
      {manageEstablishment && (
        <EstablishmentManageModal
          establishment={manageEstablishment}
          onClose={() => setManageEstablishment(null)}
          onSaved={() => {
            loadEstablishments();
          }}
        />
      )}
    </div>
  );
};

// KPI Analytics Drawer - shows analytics content from business-listings-management
const KPIAnalyticsDrawer = ({ establishment, onClose }) => {
  const [period, setPeriod] = useState('30d');

  const MOCK_ANALYTICS = {
    views: 1247,
    mapImpressions: 3892,
    contactClicks: 89,
    directionsClicks: 156,
    conversionRate: 12.5,
    vsLastPeriod: { views: +18, mapImpressions: +7, contactClicks: +23, directionsClicks: +11 },
    categoryAvgViews: 856,
    trafficSources: [
      { source: 'Búsqueda en app', visits: 512, pct: 41, icon: 'Search', color: 'bg-blue-500' },
      { source: 'Mapa', visits: 387, pct: 31, icon: 'Map', color: 'bg-green-500' },
      { source: 'Categoría', visits: 198, pct: 16, icon: 'Tag', color: 'bg-purple-500' },
      { source: 'Link directo', visits: 87, pct: 7, icon: 'Link', color: 'bg-amber-500' },
      { source: 'QR', visits: 38, pct: 3, icon: 'QrCode', color: 'bg-red-500' },
      { source: 'Redes sociales', visits: 25, pct: 2, icon: 'Share2', color: 'bg-pink-500' },
    ],
    suggestions: [
      { id: 1, priority: 'high', icon: 'ImagePlus', text: 'Sube 6 fotos más para alcanzar el mínimo recomendado de 10 fotos', impact: '+35% vistas' },
      { id: 2, priority: 'high', icon: 'HelpCircle', text: 'Agrega al menos 3 preguntas frecuentes (FAQ)', impact: '+18% conversión' },
      { id: 3, priority: 'medium', icon: 'Clock', text: 'Actualiza tus horarios especiales para los próximos festivos', impact: 'Evita visitas fallidas' },
      { id: 4, priority: 'medium', icon: 'CreditCard', text: 'Agrega métodos de pago para aparecer en filtros de la app', impact: '+12% clics' },
      { id: 5, priority: 'low', icon: 'Globe', text: 'Configura tu tour virtual 360° para destacar en búsquedas', impact: '+8% tiempo en ficha' },
    ],
  };

  const isAboveAvg = MOCK_ANALYTICS?.views > MOCK_ANALYTICS?.categoryAvgViews;
  const viewsVsCategory = isAboveAvg
    ? `+${Math.round(((MOCK_ANALYTICS?.views - MOCK_ANALYTICS?.categoryAvgViews) / MOCK_ANALYTICS?.categoryAvgViews) * 100)}% más vistas que el promedio de tu categoría`
    : `${Math.round(((MOCK_ANALYTICS?.categoryAvgViews - MOCK_ANALYTICS?.views) / MOCK_ANALYTICS?.categoryAvgViews) * 100)}% menos vistas que el promedio`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card w-full max-w-md h-full shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: establishment?.logoColor }}
            >
              {establishment?.initial}
            </div>
            <div>
              <h3 className="font-bold text-foreground">{establishment?.name}</h3>
              <p className="text-xs text-muted-foreground">Analytics de ficha</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5 flex-1">
          {/* Period selector */}
          <div className="flex gap-2">
            {[{ value: '7d', label: '7 días' }, { value: '30d', label: '30 días' }, { value: '90d', label: '90 días' }]?.map(p => (
              <button key={p?.value} onClick={() => setPeriod(p?.value)}
                className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors ${
                  period === p?.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
                }`}>
                {p?.label}
              </button>
            ))}
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Vistas de ficha', value: MOCK_ANALYTICS?.views?.toLocaleString(), change: MOCK_ANALYTICS?.vsLastPeriod?.views, icon: 'Eye', color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Impresiones mapa', value: MOCK_ANALYTICS?.mapImpressions?.toLocaleString(), change: MOCK_ANALYTICS?.vsLastPeriod?.mapImpressions, icon: 'Map', color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Clics contacto', value: MOCK_ANALYTICS?.contactClicks?.toLocaleString(), change: MOCK_ANALYTICS?.vsLastPeriod?.contactClicks, icon: 'Phone', color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Clics "Cómo llegar"', value: MOCK_ANALYTICS?.directionsClicks?.toLocaleString(), change: MOCK_ANALYTICS?.vsLastPeriod?.directionsClicks, icon: 'Navigation', color: 'text-amber-600', bg: 'bg-amber-50' },
            ]?.map(kpi => (
              <div key={kpi?.label} className="border border-border rounded-xl p-3">
                <div className={`w-7 h-7 ${kpi?.bg} rounded-lg flex items-center justify-center mb-2`}>
                  <Icon name={kpi?.icon} size={14} className={kpi?.color} />
                </div>
                <p className="text-lg font-bold text-foreground">{kpi?.value}</p>
                <p className="text-xs text-muted-foreground leading-tight">{kpi?.label}</p>
                <p className={`text-xs font-medium mt-1 ${kpi?.change > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {kpi?.change > 0 ? '↑' : '↓'} {Math.abs(kpi?.change)}% vs anterior
                </p>
              </div>
            ))}
          </div>

          {/* Conversión */}
          <div className="border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-foreground">Conversión ficha → visita</p>
              <span className="text-xl font-bold text-primary">{MOCK_ANALYTICS?.conversionRate}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${MOCK_ANALYTICS?.conversionRate}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Basado en clics de "Cómo llegar" y check-ins</p>
          </div>

          {/* Comparativa vs categoría */}
          <div className={`border rounded-xl p-4 ${isAboveAvg ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isAboveAvg ? 'bg-green-100' : 'bg-amber-100'}`}>
                <Icon name={isAboveAvg ? 'TrendingUp' : 'TrendingDown'} size={18} className={isAboveAvg ? 'text-green-600' : 'text-amber-600'} />
              </div>
              <div>
                <p className={`text-sm font-semibold ${isAboveAvg ? 'text-green-700' : 'text-amber-700'}`}>Comparativa vs categoría</p>
                <p className={`text-xs mt-1 ${isAboveAvg ? 'text-green-600' : 'text-amber-600'}`}>
                  <strong>{viewsVsCategory}</strong> en tu zona
                </p>
              </div>
            </div>
          </div>

          {/* Fuentes de tráfico */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-primary rounded-full" />
              <p className="text-sm font-semibold text-foreground">Fuentes de tráfico</p>
            </div>
            <div className="space-y-2.5">
              {MOCK_ANALYTICS?.trafficSources?.map(source => (
                <div key={source?.source} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name={source?.icon} size={13} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-foreground">{source?.source}</span>
                      <span className="text-xs text-muted-foreground">{source?.pct}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className={`${source?.color} h-1.5 rounded-full`} style={{ width: `${source?.pct}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sugerencias */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-amber-500 rounded-full" />
              <p className="text-sm font-semibold text-foreground">Sugerencias de optimización</p>
              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">{MOCK_ANALYTICS?.suggestions?.length}</span>
            </div>
            <div className="space-y-2.5">
              {MOCK_ANALYTICS?.suggestions?.map(suggestion => (
                <div key={suggestion?.id} className={`flex items-start gap-3 p-3 border rounded-xl ${
                  suggestion?.priority === 'high' ? 'border-red-200 bg-red-50' :
                  suggestion?.priority === 'medium' ? 'border-amber-200 bg-amber-50' : 'border-border bg-card'
                }`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    suggestion?.priority === 'high' ? 'bg-red-100' :
                    suggestion?.priority === 'medium' ? 'bg-amber-100' : 'bg-muted'
                  }`}>
                    <Icon name={suggestion?.icon} size={14} className={`${
                      suggestion?.priority === 'high' ? 'text-red-600' :
                      suggestion?.priority === 'medium' ? 'text-amber-600' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-snug">{suggestion?.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Impacto: <strong>{suggestion?.impact}</strong></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstablishmentsPortfolio;
