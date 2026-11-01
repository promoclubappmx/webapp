import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import CampaignObjectiveProgress from './components/CampaignObjectiveProgress';
import SequenceTimeline from './components/SequenceTimeline';
import ABTestingResults from './components/ABTestingResults';
import ControlGroupAnalysis from './components/ControlGroupAnalysis';
import ConversionTable from './components/ConversionTable';
import PerformanceAlerts from './components/PerformanceAlerts';
import DailyAccumulationChart from './components/DailyAccumulationChart';
import CampaignMilestoneNotifications from './components/CampaignMilestoneNotifications';
import PromotionSequenceControls from './components/PromotionSequenceControls';
import {
  subscribeToCampaignMetrics,
  checkAndFireMilestones,
  fetchCampaignNotifications,
} from '../../services/campaignNotificationService';

const MOCK_CAMPAIGN = {
  id: 'camp_demo',
  name: 'Campaña Reactivación Verano 2026',
  objetivo: 'reactivacion',
  status: 'active',
  startDate: '2026-02-15',
  endDate: '2026-03-15',
  budget: 8000,
  spent: 5200,
  meta: 40,
  conversiones: 18,
  abEnabled: true,
  controlGroupEnabled: true,
  metrics: {
    impressions: 1240,
    clicks: 420,
    conversions: 18,
    roi: 2.4,
  },
};

const CampaignDashboardPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [campaignStatus, setCampaignStatus] = useState('active');
  const [milestoneNotifCount, setMilestoneNotifCount] = useState(0);
  const prevMetricsRef = useRef(null);

  const user = { id: 1, name: 'Carlos Mendoza', email: 'carlos@mirestaurante.com', role: 'owner' };

  useEffect(() => {
    const loadCampaign = async () => {
      setIsLoading(true);
      try {
        if (id) {
          const { data } = await supabase?.from('campaign_objectives')?.select('*')?.eq('campaign_id', id)?.single();
          if (data) {
            setCampaign({ ...MOCK_CAMPAIGN, ...data, id });
            setCampaignStatus(data?.status || 'active');
          } else {
            setCampaign({ ...MOCK_CAMPAIGN, id });
          }
        } else {
          setCampaign(MOCK_CAMPAIGN);
        }
      } catch (err) {
        setCampaign(MOCK_CAMPAIGN);
      } finally {
        setIsLoading(false);
      }
    };
    loadCampaign();
  }, [id]);

  // Load initial unread milestone notification count
  useEffect(() => {
    const loadCount = async () => {
      const campaignId = id || 'camp_demo';
      const notifs = await fetchCampaignNotifications(campaignId, null);
      const unread = notifs?.filter(n => !n?.is_read)?.length || 0;
      setMilestoneNotifCount(unread);
    };
    loadCount();
  }, [id]);

  // Supabase Realtime: subscribe to campaign metric changes
  useEffect(() => {
    const campaignId = id || 'camp_demo';
    const channel = subscribeToCampaignMetrics(campaignId, async (updatedData) => {
      const prev = prevMetricsRef?.current;
      const curr = {
        conversions: updatedData?.goal_current || 0,
        spent: updatedData?.spent || 0,
      };

      if (prev) {
        await checkAndFireMilestones(
          { ...campaign, id: campaignId, goal_target: updatedData?.goal_target, budget: updatedData?.budget },
          prev,
          curr
        );
      }

      prevMetricsRef.current = curr;
      setCampaign(prev => prev ? { ...prev, ...updatedData } : prev);
    });

    return () => {
      channel?.unsubscribe?.();
    };
  }, [id, campaign?.budget]);

  const handleTogglePause = () => {
    setCampaignStatus(prev => prev === 'active' ? 'paused' : 'active');
    setShowActionsMenu(false);
  };

  const handleDuplicate = () => {
    navigate(`/campaigns-management/new?duplicate=true`);
    setShowActionsMenu(false);
  };

  const budgetProgress = campaign?.budget > 0 ? Math.min((campaign?.spent / campaign?.budget) * 100, 100) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Icon name="Loader2" size={24} className="text-primary animate-spin" />
          <span className="text-muted-foreground">Cargando dashboard...</span>
        </div>
      </div>
    );
  }

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
      <main
        className={`pt-16 transition-all duration-500 ease-in-out ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
      >
        <div className="p-6">

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/campaigns-management')}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Icon name="ArrowLeft" size={20} className="text-muted-foreground" />
              </button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-foreground">{campaign?.name}</h1>
                  {campaign?.controlGroupEnabled && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <Icon name="Shield" size={11} />
                      Con medición de impacto
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    campaignStatus === 'active' ? 'bg-success/10 text-success' :
                    campaignStatus === 'paused'? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'
                  }`}>
                    {campaignStatus === 'active' ? '● Activa' : campaignStatus === 'paused' ? '⏸ Pausada' : campaignStatus}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {campaign?.startDate && new Date(campaign.startDate)?.toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })} —
                  {campaign?.endDate && new Date(campaign.endDate)?.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2">
              {/* Milestone notification badge */}
              {milestoneNotifCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
                  <Icon name="Bell" size={14} className="text-primary" />
                  <span className="text-xs font-medium text-primary">{milestoneNotifCount} hito{milestoneNotifCount !== 1 ? 's' : ''}</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/campaigns-management/edit/${campaign?.id}`)}
                iconName="Edit"
                iconSize={14}
              >
                Editar
              </Button>
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowActionsMenu(v => !v)}
                  iconName="MoreHorizontal"
                  iconSize={16}
                >
                  Acciones
                </Button>
                {showActionsMenu && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-xl shadow-xl z-20">
                    <button onClick={handleTogglePause} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors rounded-t-xl">
                      <Icon name={campaignStatus === 'active' ? 'Pause' : 'Play'} size={14} className="text-primary" />
                      {campaignStatus === 'active' ? 'Pausar campaña' : 'Reanudar campaña'}
                    </button>
                    <button onClick={() => { setShowActionsMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                      <Icon name="DollarSign" size={14} className="text-primary" />
                      Ajustar presupuesto
                    </button>
                    <button onClick={() => { setShowActionsMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                      <Icon name="Calendar" size={14} className="text-primary" />
                      Extender fecha de fin
                    </button>
                    <button onClick={handleDuplicate} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                      <Icon name="Copy" size={14} className="text-primary" />
                      Duplicar campaña
                    </button>
                    <div className="border-t border-border" />
                    <button onClick={() => { setShowActionsMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors rounded-b-xl">
                      <Icon name="StopCircle" size={14} />
                      Finalizar anticipadamente
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Presupuesto */}
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Presupuesto</span>
              <span className="text-sm text-muted-foreground">
                ${campaign?.spent?.toLocaleString()} / ${campaign?.budget?.toLocaleString()} MXN
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-700 ${
                  budgetProgress > 80 ? 'bg-warning' : 'bg-primary'
                }`}
                style={{ width: `${budgetProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{Math.round(budgetProgress)}% del presupuesto utilizado</p>
          </div>

          {/* Alertas de rendimiento */}
          <div className="mb-6">
            <PerformanceAlerts alertas={[]} />
          </div>

          {/* Milestone Notifications + Promotion Controls (2-col) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <CampaignMilestoneNotifications
              campaignId={id || campaign?.id}
              businessId={campaign?.business_id || '1'}
              campaignName={campaign?.name}
            />
            <PromotionSequenceControls
              campaignId={id || campaign?.id}
              sequenceSteps={[]}
            />
          </div>

          {/* Objetivo principal */}
          <div className="mb-6">
            <CampaignObjectiveProgress campaign={campaign} />
          </div>

          {/* Gráfico + Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <DailyAccumulationChart data={[]} />
            <SequenceTimeline campaign={campaign} steps={[]} />
          </div>

          {/* A/B Testing */}
          {campaign?.abEnabled && (
            <div className="mb-6">
              <ABTestingResults campaign={campaign} onDeployWinner={() => {}} />
            </div>
          )}

          {/* Control Group */}
          {campaign?.controlGroupEnabled && (
            <div className="mb-6">
              <ControlGroupAnalysis campaign={campaign} />
            </div>
          )}

          {/* Tabla de conversiones */}
          <div className="mb-6">
            <ConversionTable campaign={campaign} conversiones={[]} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CampaignDashboardPage;
