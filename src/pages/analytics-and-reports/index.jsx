import React, { useState, useRef, useEffect, useCallback } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import AnalyticsSection from './components/AnalyticsSection';
import ReportesSection from './components/ReportesSection';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import useRealtimeData from '../../hooks/useRealtimeData';

const MAIN_TABS = [
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
  { id: 'reportes', label: 'Reportes', icon: 'FileText' },
];

const PERIODS = [
  { id: 'today', label: 'Hoy' },
  { id: '7d', label: '7 días' },
  { id: 'month', label: 'Este mes' },
  { id: 'prev_month', label: 'Mes anterior' },
  { id: '3m', label: '3 meses' },
  { id: 'custom', label: 'Personalizado' },
];

const EXPORT_OPTIONS = [
  { icon: '📊', label: 'Excel (.xlsx)' },
  { icon: '📄', label: 'CSV (.csv)' },
  { icon: '🖨️', label: 'PDF' },
  { icon: '{ }', label: 'JSON' },
  { icon: '⏰', label: 'Programar envío automático' },
];

const AnalyticsAndReports = () => {
  const { user, userProfile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mainTab, setMainTab] = useState('analytics');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [exportOpen, setExportOpen] = useState(false);
  const [establishments, setEstablishments] = useState([]);
  const [loadingEstablishments, setLoadingEstablishments] = useState(false);
  const [realtimeKey, setRealtimeKey] = useState(0);
  const [realtimeIndicator, setRealtimeIndicator] = useState(false);
  const exportRef = useRef(null);

  const businessId = user?.id;

  // Close export dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (exportRef?.current && !exportRef?.current?.contains(e?.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Fetch branches from Supabase
  useEffect(() => {
    if (!user?.id) return;
    const fetchEstablishments = async () => {
      setLoadingEstablishments(true);
      try {
        const { data: profile } = await supabase
          ?.from('user_profiles')
          ?.select('user_id')
          ?.eq('id', user?.id)
          ?.single();
        const bid = profile?.user_id || user?.id;
        const { data } = await supabase
          ?.from('business_locations')
          ?.select('id, location_name, location_code, is_active')
          ?.eq('business_id', bid)
          ?.eq('is_active', true)
          ?.order('location_name', { ascending: true });
        setEstablishments(data || []);
      } catch (err) {
        console.error('fetchEstablishments error:', err);
      } finally {
        setLoadingEstablishments(false);
      }
    };
    fetchEstablishments();
  }, [user?.id]);

  // Real-time: bump key to force sub-tab components to re-fetch
  const handleRealtimeChange = useCallback(() => {
    setRealtimeIndicator(true);
    setTimeout(() => setRealtimeIndicator(false), 2000);
    setRealtimeKey(k => k + 1);
  }, []);

  useRealtimeData({
    channelName: `analytics_realtime_${businessId}`,
    tables: [
      'checkins',
      'coupon_redemptions',
      'loyalty_transactions',
      'promotion_analytics',
      'customer_profiles',
      'reviews',
      'nps_responses',
      'orders',
    ],
    events: ['INSERT', 'UPDATE'],
    onRefresh: handleRealtimeChange,
    enabled: !!businessId,
  });

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
        user={userProfile}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main
        className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}
      >
        <div className="p-6">
          {/* ── Page Header ─────────────────────────────────────────────── */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Visualiza el rendimiento de tu negocio en tiempo real
              </p>
            </div>
            {/* Real-time live indicator */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5 self-start">
              <span className={`w-2 h-2 rounded-full ${realtimeIndicator ? 'bg-emerald-500 animate-ping' : 'bg-emerald-400'}`} />
              <span>Datos en vivo</span>
            </div>
          </div>

          {/* ── Establishment Selector ───────────────────────────────────── */}
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Icon name="Building2" size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Establecimiento</span>
              {loadingEstablishments && (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedBranch('all')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedBranch === 'all' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                Todos los establecimientos
              </button>
              {establishments?.map(est => (
                <button
                  key={est?.id}
                  onClick={() => setSelectedBranch(est?.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedBranch === est?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  {est?.location_name}
                  {est?.location_code && (
                    <span className="ml-1.5 opacity-70 text-xs">({est?.location_code})</span>
                  )}
                </button>
              ))}
              {!loadingEstablishments && establishments?.length === 0 && (
                <p className="text-sm text-muted-foreground">No hay establecimientos registrados</p>
              )}
            </div>
          </div>

          {/* ── Period Pills ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
            {PERIODS?.map(p => (
              <button
                key={p?.id}
                onClick={() => setSelectedPeriod(p?.id)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedPeriod === p?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                }`}
              >
                {p?.label}
              </button>
            ))}
          </div>

          {/* ── Main Tabs ────────────────────────────────────────────────── */}
          <div className="border-b border-border mb-6">
            <nav className="flex space-x-1 overflow-x-auto">
              {MAIN_TABS?.map(tab => (
                <button
                  key={tab?.id}
                  onClick={() => setMainTab(tab?.id)}
                  className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    mainTab === tab?.id
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  {tab?.label}
                </button>
              ))}
            </nav>
          </div>

          {/* ── Tab Content ──────────────────────────────────────────────── */}
          <div className="pb-12">
            {mainTab === 'analytics' ? (
              <AnalyticsSection
                key={realtimeKey}
                period={selectedPeriod}
                branch={selectedBranch}
                businessId={businessId}
              />
            ) : (
              <ReportesSection key={realtimeKey} businessId={businessId} />
            )}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .live-pulse { animation: livePulse 2s infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default AnalyticsAndReports;