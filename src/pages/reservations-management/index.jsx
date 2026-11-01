import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// New L1.x components
import ReservationTypeConfig from './components/ReservationTypeConfig';
import ConfirmationFlow from './components/ConfirmationFlow';
import WaitlistConfig from './components/WaitlistConfig';
import NoShowPolicies from './components/NoShowPolicies';
import OperationalCalendar from './components/OperationalCalendar';

// Existing components (preserved)
import LoyaltyIntegration from './components/LoyaltyIntegration';
import MarketingIntegration from './components/MarketingIntegration';
import ReservationMetrics from './components/ReservationMetrics';

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  {
    id: 'calendar',
    label: 'Calendario',
    icon: 'CalendarCheck',
    description: 'Vista operativa diaria',
  },
  {
    id: 'type',
    label: 'Tipo y Capacidad',
    icon: 'LayoutGrid',
    description: 'Mesa, cita, turno, clase, evento',
  },
  {
    id: 'confirmation',
    label: 'Confirmación',
    icon: 'CheckCircle2',
    description: 'Auto, manual o híbrida',
  },
  {
    id: 'waitlist',
    label: 'Lista de espera',
    icon: 'ListOrdered',
    description: 'Waitlist y notificaciones',
  },
  {
    id: 'noshow',
    label: 'No-show',
    icon: 'UserX',
    description: 'Políticas y tracking',
  },
  {
    id: 'loyalty',
    label: 'Fidelización',
    icon: 'Award',
    description: 'Puntos y beneficios',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: 'Mail',
    description: 'Recordatorios y campañas',
  },
  {
    id: 'metrics',
    label: 'Métricas',
    icon: 'BarChart3',
    description: 'Análisis y reportes',
  },
];

// ─── Main component ───────────────────────────────────────────────────────────
const ReservationsManagement = () => {
  const { user: authUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState('all');
  const [activeTab, setActiveTab] = useState('calendar');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Establishments state
  const [establishments, setEstablishments] = useState([]);
  const [loadingEstablishments, setLoadingEstablishments] = useState(false);

  // Module-level config state (L1.1 – L1.4)
  const [typeConfig, setTypeConfig] = useState({ selectedTypes: [], typeConfigs: {} });
  const [confirmationConfig, setConfirmationConfig] = useState({ confirmationMode: 'auto', responseTimeHours: 4, notifyPush: true, notifyEmail: false });
  const [waitlistConfig, setWaitlistConfig] = useState({ waitlistEnabled: true, maxWaitlistSize: 10, confirmationWindowMinutes: 30, orderMode: 'fifo', showPosition: true });
  const [noShowConfig, setNoShowConfig] = useState({ toleranceCount: 3, toleranceMonths: 6, noShowThresholdMinutes: 15, deductPoints: false, prepayEnabled: false, rehabilitationEnabled: true, rehabilitationDays: 60 });

  const user = { name: authUser?.user_metadata?.full_name || 'Admin', email: authUser?.email || '', role: 'owner' };

  // Load establishments from Supabase
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

        const { data, error } = await supabase
          ?.from('business_locations')
          ?.select('id, location_name, location_code, is_active')
          ?.eq('business_id', businessId)
          ?.eq('is_active', true)
          ?.order('location_name', { ascending: true });
        if (error) throw error;
        setEstablishments(data || []);
      } catch (err) {
        console.error('Error loading establishments:', err);
        setEstablishments([]);
      } finally {
        setLoadingEstablishments(false);
      }
    };
    fetchEstablishments();
  }, [authUser?.id]);

  const activeTabData = TABS?.find(t => t?.id === activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case 'calendar':
        return <OperationalCalendar businessId={selectedBusiness} refreshTrigger={refreshTrigger} />;
      case 'type':
        return <ReservationTypeConfig config={typeConfig} onChange={setTypeConfig} />;
      case 'confirmation':
        return <ConfirmationFlow config={confirmationConfig} onChange={setConfirmationConfig} />;
      case 'waitlist':
        return <WaitlistConfig config={waitlistConfig} onChange={setWaitlistConfig} />;
      case 'noshow':
        return <NoShowPolicies config={noShowConfig} onChange={setNoShowConfig} />;
      case 'loyalty':
        return <LoyaltyIntegration businessId={selectedBusiness} />;
      case 'marketing':
        return <MarketingIntegration businessId={selectedBusiness} />;
      case 'metrics':
        return <ReservationMetrics businessId={selectedBusiness} refreshTrigger={refreshTrigger} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userRole={user?.role}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className={`pt-20 px-4 md:px-6 pb-10 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        {/* Page header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Icon name="CalendarCheck" size={18} className="text-white" />
                </span>
                Gestión de Reservaciones
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                El puente entre "quiero ir" y "ya tengo mi lugar asegurado" — integrado con el ecosistema PromoClub
              </p>
            </div>
          </div>

          {/* Establishment selector — pill style matching catalog-management */}
          <div className="bg-card border border-border rounded-lg p-4 mb-5">
            <div className="flex items-center gap-3 mb-3">
              <Icon name="Building2" size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Establecimiento</span>
              {loadingEstablishments && (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedBusiness('all')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedBusiness === 'all' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                Todos los establecimientos
              </button>
              {establishments?.map(est => (
                <button
                  key={est?.id}
                  onClick={() => setSelectedBusiness(est?.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedBusiness === est?.id
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
            {selectedBusiness !== 'all' && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Icon name="Info" size={12} />
                Mostrando reservaciones de: <span className="font-medium text-foreground">{establishments?.find(e => e?.id === selectedBusiness)?.location_name || ''}</span>
              </p>
            )}
          </div>
        </div>

        {/* Tab navigation — underline style matching loyalty-points-system */}
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
        <div className="animate-fadeIn">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default ReservationsManagement;