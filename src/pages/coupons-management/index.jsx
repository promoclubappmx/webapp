import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import MisCuponesTab from './components/MisCuponesTab';
import AnalyticsTab from './components/AnalyticsTab';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import useRealtimeData from '../../hooks/useRealtimeData';

const TABS = [
  { key: 'coupons', label: 'Mis Cupones', icon: 'Ticket' },
  { key: 'analytics', label: 'Analytics', icon: 'BarChart3' },
];

const CouponsManagement = () => {
  const { user: authUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('coupons');
  const [realtimeKey, setRealtimeKey] = useState(0);
  const [realtimeIndicator, setRealtimeIndicator] = useState(false);

  // Establishments
  const [establishments, setEstablishments] = useState([]);
  const [loadingEstablishments, setLoadingEstablishments] = useState(false);
  const [selectedEstablishment, setSelectedEstablishment] = useState('all');

  const user = {
    id: authUser?.id,
    name: authUser?.user_metadata?.full_name || 'Admin',
    email: authUser?.email || '',
    role: 'owner',
  };

  useEffect(() => {
    const fetchEstablishments = async () => {
      if (!authUser?.id) return;
      setLoadingEstablishments(true);
      try {
        const { data: profile } = await supabase
          ?.from('user_profiles')
          ?.select('user_id')
          ?.eq('id', authUser?.id)
          ?.single();
        const businessId = profile?.user_id || authUser?.id;
        const { data } = await supabase
          ?.from('business_locations')
          ?.select('id, location_name, location_code, is_active')
          ?.eq('business_id', businessId)
          ?.eq('is_active', true)
          ?.order('location_name', { ascending: true });
        setEstablishments(data || []);
      } catch (err) {
        console.error('Error loading establishments:', err);
      } finally {
        setLoadingEstablishments(false);
      }
    };
    fetchEstablishments();
  }, [authUser?.id]);

  // Real-time: bump key to force MisCuponesTab to re-fetch
  const handleRealtimeChange = useCallback(() => {
    setRealtimeIndicator(true);
    setTimeout(() => setRealtimeIndicator(false), 2000);
    setRealtimeKey(k => k + 1);
  }, []);

  useRealtimeData({
    channelName: `coupons_realtime_${authUser?.id}`,
    tables: ['coupons', 'coupon_redemptions'],
    events: ['INSERT', 'UPDATE', 'DELETE'],
    onRefresh: handleRealtimeChange,
    enabled: !!authUser?.id,
  });

  const selectedEstablishmentName =
    selectedEstablishment === 'all' ?'Todos los establecimientos'
      : establishments?.find(e => e?.id === selectedEstablishment)?.location_name || '';

  const renderTab = () => {
    switch (activeTab) {
      case 'coupons': return <MisCuponesTab key={realtimeKey} selectedEstablishment={selectedEstablishment} />;
      case 'analytics': return <AnalyticsTab key={realtimeKey} />;
      default: return <MisCuponesTab key={realtimeKey} selectedEstablishment={selectedEstablishment} />;
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
        className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
      >
        <div className="p-6 max-w-[1920px] mx-auto space-y-6">

          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Cupones</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Crea, distribuye y analiza cupones digitales para tu negocio
              </p>
            </div>
            {/* Real-time indicator */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5">
              <span className={`w-2 h-2 rounded-full ${realtimeIndicator ? 'bg-emerald-500 animate-ping' : 'bg-emerald-400'}`} />
              <span>En vivo</span>
            </div>
          </div>

          {/* Establishment Selector */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Icon name="Building2" size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Establecimiento</span>
              {loadingEstablishments && (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedEstablishment('all')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedEstablishment === 'all' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                Todos los establecimientos
              </button>
              {establishments?.map(est => (
                <button
                  key={est?.id}
                  onClick={() => setSelectedEstablishment(est?.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedEstablishment === est?.id
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
            {selectedEstablishment !== 'all' && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Icon name="Info" size={12} />
                Mostrando cupones de:{' '}
                <span className="font-medium text-foreground">{selectedEstablishmentName}</span>
              </p>
            )}
          </div>

          {/* Tab navigation */}
          <div className="border-b border-border">
            <nav className="flex gap-0 -mb-px">
              {TABS?.map(tab => (
                <button
                  key={tab?.key}
                  onClick={() => setActiveTab(tab?.key)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                    activeTab === tab?.key
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  {tab?.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab content */}
          {renderTab()}
        </div>
      </main>
    </div>
  );
};

export default CouponsManagement;