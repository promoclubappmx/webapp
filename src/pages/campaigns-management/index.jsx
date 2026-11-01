import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';


import CampaignCard from './components/CampaignCard';
import CampaignForm from './components/CampaignForm';


import BulkActions from './components/BulkActions';
import CampaignScheduler from './components/CampaignScheduler';
import CampaignAnalytics from './components/CampaignAnalytics';
import CampaignPreview from './components/CampaignPreview';
import CampaignDashboard from '../campaign-creation/components/CampaignDashboard';
import RoleGuard from '../../components/ui/RoleGuard';


const CampaignsManagement = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showScheduler, setShowScheduler] = useState(false);
  const [schedulingCampaign, setSchedulingCampaign] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsCampaign, setAnalyticsCampaign] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewCampaign, setPreviewCampaign] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardCampaign, setDashboardCampaign] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardInitialData, setWizardInitialData] = useState(null);

  const user = {
    id: 1,
    name: "Carlos Mendoza",
    email: "carlos@mirestaurante.com",
    role: "owner"
  };

  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: "Campaña Verano 2024",
      description: "Campaña de marketing para promocionar ofertas de verano en todos los canales digitales.",
      type: "seasonal",
      status: "active",
      startDate: "2024-06-01",
      endDate: "2024-08-31",
      budget: 5000,
      spent: 3200,
      channels: ["email", "social", "sms"],
      targetAudience: "all",
      metrics: {
        impressions: 45000,
        clicks: 3400,
        conversions: 890,
        roi: 2.8
      },
      promotions: [1, 2],
      imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      name: "Black Friday 2024",
      description: "Campaña especial para el Black Friday con descuentos exclusivos y ofertas limitadas.",
      type: "event",
      status: "scheduled",
      startDate: "2024-11-25",
      endDate: "2024-11-29",
      budget: 8000,
      spent: 0,
      channels: ["email", "social", "push"],
      targetAudience: "returning",
      metrics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        roi: 0
      },
      promotions: [],
      imageUrl: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      name: "Lanzamiento Nuevo Menú",
      description: "Campaña de lanzamiento para el nuevo menú de otoño con platos especiales.",
      type: "product_launch",
      status: "draft",
      startDate: "2024-09-15",
      endDate: "2024-10-15",
      budget: 3000,
      spent: 0,
      channels: ["email", "social"],
      targetAudience: "vip",
      metrics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        roi: 0
      },
      promotions: [],
      imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop"
    },
    {
      id: 4,
      name: "Programa Fidelización",
      description: "Campaña continua para promover el programa de puntos de lealtad y recompensas.",
      type: "loyalty",
      status: "active",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      budget: 12000,
      spent: 7800,
      channels: ["email", "push", "sms"],
      targetAudience: "all",
      metrics: {
        impressions: 120000,
        clicks: 8900,
        conversions: 2340,
        roi: 3.2
      },
      promotions: [3, 4],
      imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop"
    }
  ]);

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    type: 'all',
    channel: 'all',
    sortBy: 'created_desc',
    dateFrom: '',
    dateTo: ''
  });

  const stats = {
    active: campaigns?.filter(c => c?.status === 'active')?.length,
    scheduled: campaigns?.filter(c => c?.status === 'scheduled')?.length,
    drafts: campaigns?.filter(c => c?.status === 'draft')?.length,
    totalBudget: campaigns?.reduce((sum, c) => sum + (c?.budget || 0), 0)
  };

  const filteredCampaigns = campaigns?.filter(campaign => {
    if (filters?.search && !campaign?.name?.toLowerCase()?.includes(filters?.search?.toLowerCase()) &&
        !campaign?.description?.toLowerCase()?.includes(filters?.search?.toLowerCase())) {
      return false;
    }
    
    if (filters?.status !== 'all' && campaign?.status !== filters?.status) {
      return false;
    }
    
    if (filters?.type !== 'all' && campaign?.type !== filters?.type) {
      return false;
    }

    if (filters?.channel !== 'all' && !campaign?.channels?.includes(filters?.channel)) {
      return false;
    }
    
    if (filters?.dateFrom && new Date(campaign.startDate) < new Date(filters.dateFrom)) {
      return false;
    }
    
    if (filters?.dateTo && new Date(campaign.endDate) > new Date(filters.dateTo)) {
      return false;
    }
    
    return true;
  })?.sort((a, b) => {
    switch (filters?.sortBy) {
      case 'created_desc':
        return new Date(b.startDate) - new Date(a.startDate);
      case 'created_asc':
        return new Date(a.startDate) - new Date(b.startDate);
      case 'name_asc':
        return a?.name?.localeCompare(b?.name);
      case 'name_desc':
        return b?.name?.localeCompare(a?.name);
      case 'budget_desc':
        return (b?.budget || 0) - (a?.budget || 0);
      case 'budget_asc':
        return (a?.budget || 0) - (b?.budget || 0);
      default:
        return 0;
    }
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      type: 'all',
      channel: 'all',
      sortBy: 'created_desc',
      dateFrom: '',
      dateTo: ''
    });
  };

  const handleCreateCampaign = () => {
    navigate('/campaigns-management/new');
  };

  const handleEditCampaign = (campaign) => {
    navigate(`/campaigns-management/edit/${campaign?.id}`);
  };

  const handleSaveCampaign = (campaignData) => {
    setIsLoading(true);
    setTimeout(() => {
      if (editingCampaign) {
        setCampaigns(prev => prev?.map(c => c?.id === editingCampaign?.id ? { ...c, ...campaignData } : c));
      } else {
        const newCampaign = {
          ...campaignData,
          id: campaigns?.length + 1,
          spent: 0,
          metrics: {
            impressions: 0,
            clicks: 0,
            conversions: 0,
            roi: 0
          }
        };
        setCampaigns(prev => [newCampaign, ...prev]);
      }
      setShowForm(false);
      setEditingCampaign(null);
      setIsLoading(false);
    }, 1000);
  };

  const handleDeleteCampaign = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta campaña?')) {
      setCampaigns(prev => prev?.filter(c => c?.id !== id));
    }
  };

  const handleDuplicateCampaign = (campaign) => {
    navigate(`/campaigns-management/new?duplicate=true`);
  };

  const handleScheduleCampaign = (campaign) => {
    setSchedulingCampaign(campaign);
    setShowScheduler(true);
  };

  const handleSaveSchedule = (scheduleData) => {
    setCampaigns(prev => prev?.map(c => 
      c?.id === schedulingCampaign?.id 
        ? { ...c, ...scheduleData }
        : c
    ));
    setShowScheduler(false);
    setSchedulingCampaign(null);
  };

  const handleViewAnalytics = (campaign) => {
    navigate(`/campaign-dashboard/${campaign?.id}`);
  };

  const handleToggleActivation = (campaign) => {
    const newStatus = campaign?.status === 'active' ? 'scheduled' : 'active';
    setCampaigns(prev => prev?.map(c => 
      c?.id === campaign?.id 
        ? { ...c, status: newStatus }
        : c
    ));
  };

  const handlePreview = (campaign) => {
    setPreviewCampaign(campaign);
    setShowPreview(true);
  };

  const handleSelectCampaign = (id) => {
    setSelectedCampaigns(prev =>
      prev?.includes(id) ? prev?.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedCampaigns?.length === filteredCampaigns?.length) {
      setSelectedCampaigns([]);
    } else {
      setSelectedCampaigns(filteredCampaigns?.map(c => c?.id));
    }
  };

  const handleBulkAction = (action) => {
    console.log('Bulk action:', action, 'on campaigns:', selectedCampaigns);
    setSelectedCampaigns([]);
  };

  const handleExport = () => {
    console.log('Exporting campaigns...');
  };

  const handleSelectTemplate = (plantilla) => {
    navigate('/campaigns-management/new');
  };

  const handleWizardSave = (campaignData) => {
    setIsLoading(true);
    setTimeout(() => {
      const newCampaign = {
        ...campaignData,
        id: Date.now(),
        spent: 0,
        description: campaignData?.description || `Campaña de ${campaignData?.objetivo || 'marketing'}`,
        metrics: { impressions: 0, clicks: 0, conversions: 0, roi: 0 },
        imageUrl: '',
      };
      setCampaigns(prev => [newCampaign, ...prev]);
      setShowWizard(false);
      setWizardInitialData(null);
      setIsLoading(false);
    }, 800);
  };

  return (
    <RoleGuard allowedRoles={['owner', 'admin', 'staff']} userRole={user?.role} module="campaigns">
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
          className={`lg:ml-72 pt-16 transition-all duration-500 ease-in-out relative z-10 ${
            isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
          }`}
          style={{
            transitionProperty: 'margin-left',
            transitionDuration: '500ms',
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div className="p-6">

            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gestión de Campañas</h1>
                <p className="text-sm text-muted-foreground mt-1">Crea, programa y analiza tus campañas de marketing multicanal</p>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleCreateCampaign} iconName="Plus" iconSize={16}>
                  Nueva Campaña
                </Button>
                {selectedCampaigns?.length > 0 && (
                  <BulkActions
                    selectedCount={selectedCampaigns?.length}
                    onAction={(action) => handleBulkAction(action)}
                    onClear={() => setSelectedCampaigns([])}
                    onActivate={() => console.log('Activar seleccionadas')}
                    onPause={() => console.log('Pausar seleccionadas')}
                    onDelete={() => console.log('Eliminar seleccionadas')}
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  iconName="Grid"
                  iconSize={16}
                  className={viewMode === 'grid' ? 'bg-primary text-primary-foreground' : ''}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('table')}
                  iconName="List"
                  iconSize={16}
                  className={viewMode === 'table' ? 'bg-primary text-primary-foreground' : ''}
                />
              </div>
            </div>

            {/* Campaigns Grid/Table */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredCampaigns?.map(campaign => (
                <CampaignCard
                  key={campaign?.id}
                  campaign={campaign}
                  isSelected={selectedCampaigns?.includes(campaign?.id)}
                  onSelect={handleSelectCampaign}
                  onEdit={handleEditCampaign}
                  onDelete={handleDeleteCampaign}
                  onDuplicate={handleDuplicateCampaign}
                  onViewAnalytics={handleViewAnalytics}
                  onToggleActivation={handleToggleActivation}
                  onPreview={handlePreview}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {filteredCampaigns?.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Megaphone" size={32} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No hay campañas</h3>
                <p className="text-muted-foreground mb-4">Comienza creando tu primera campaña de marketing</p>
                <Button onClick={handleCreateCampaign} iconName="Plus" iconSize={16}>
                  Crear Campaña
                </Button>
              </div>
            )}
          </div>
        </main>

        {showForm && (
          <CampaignForm
            campaign={editingCampaign}
            onSave={handleSaveCampaign}
            onCancel={() => {
              setShowForm(false);
              setEditingCampaign(null);
            }}
            isLoading={isLoading}
          />
        )}

        {showScheduler && (
          <CampaignScheduler
            campaign={schedulingCampaign}
            onSave={handleSaveSchedule}
            onCancel={() => {
              setShowScheduler(false);
              setSchedulingCampaign(null);
            }}
          />
        )}

        {showAnalytics && (
          <CampaignAnalytics
            campaign={analyticsCampaign}
            onClose={() => {
              setShowAnalytics(false);
              setAnalyticsCampaign(null);
            }}
          />
        )}

        {showPreview && (
          <CampaignPreview
            campaign={previewCampaign}
            onClose={() => {
              setShowPreview(false);
              setPreviewCampaign(null);
            }}
          />
        )}

        {showWizard && (
          <div style={{ display: 'none' }} />
        )}

        {/* Campaign Dashboard Modal */}
        {showDashboard && dashboardCampaign && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Dashboard de Campaña</h2>
                  <p className="text-sm text-muted-foreground">{dashboardCampaign?.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/campaign-creation/edit/${dashboardCampaign?.id}`)}
                    iconName="Edit"
                    iconSize={14}
                  >
                    Editar
                  </Button>
                  <button
                    onClick={() => { setShowDashboard(false); setDashboardCampaign(null); }}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <Icon name="X" size={20} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <CampaignDashboard
                  campaign={{ ...dashboardCampaign, abEnabled: dashboardCampaign?.abActivo || false }}
                  onAction={(action) => {
                    if (action === 'pause') handleToggleActivation(dashboardCampaign);
                    setShowDashboard(false);
                    setDashboardCampaign(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
};

export default CampaignsManagement;