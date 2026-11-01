import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import CatalogoTab from './components/CatalogoTab';

const ESTABLECIMIENTOS = [
  { id: 'all', label: 'Todos los establecimientos' },
  { id: 'est-1', label: 'PromoSpot Centro' },
  { id: 'est-2', label: 'PromoSpot Norte' },
  { id: 'est-3', label: 'PromoSpot Sur' },
  { id: 'est-4', label: 'PromoSpot Polanco' },
];

const CATEGORIAS = [
  { id: 'all', label: 'Todas las categorías' },
  { id: 'free_product', label: 'Producto gratis' },
  { id: 'pct_discount', label: '% Descuento' },
  { id: 'fixed_discount', label: 'Monto fijo' },
  { id: 'experience', label: 'Experiencia' },
  { id: 'upgrade', label: 'Upgrade' },
  { id: 'other', label: 'Otro' },
];

const ESTADOS = [
  { id: 'all', label: 'Todos los estados' },
  { id: 'active', label: 'Activo' },
  { id: 'paused', label: 'Pausado' },
  { id: 'archived', label: 'Archivado' },
];

const analyticsData = [
  { label: 'Total canjes', value: '491', icon: 'Gift', color: 'text-purple-600', bg: 'bg-purple-50', trend: '+12%', trendUp: true },
  { label: 'Canjes este mes', value: '87', icon: 'TrendingUp', color: 'text-blue-600', bg: 'bg-blue-50', trend: '+8%', trendUp: true },
  { label: 'Puntos canjeados', value: '98,200', icon: 'Star', color: 'text-amber-600', bg: 'bg-amber-50', trend: '+15%', trendUp: true },
  { label: 'Valor entregado', value: '$14,730', icon: 'DollarSign', color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+15%', trendUp: true },
  { label: 'Tasa de canje', value: '34%', icon: 'BarChart2', color: 'text-cyan-600', bg: 'bg-cyan-50', trend: '+3%', trendUp: true },
  { label: 'Recompensa top', value: 'Café gratis', icon: 'Award', color: 'text-rose-600', bg: 'bg-rose-50', trend: '234 canjes', trendUp: null },
];

const topRewards = [
  { name: 'Café americano gratis', canjes: 234, pts: 100, pct: 48 },
  { name: '30% de descuento', canjes: 156, pts: 200, pct: 32 },
  { name: 'Desayuno completo', canjes: 89, pts: 300, pct: 18 },
  { name: 'Cata con el chef', canjes: 12, pts: 1000, pct: 2 },
];

const TABS = [
  { id: 'catalogo', label: 'Catálogo de recompensas', icon: 'Gift' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart2' },
];

const CatalogoRecompensasPage = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [establecimiento, setEstablecimiento] = useState('all');
  const [categoria, setCategoria] = useState('all');
  const [estado, setEstado] = useState('all');
  const [activeTab, setActiveTab] = useState('catalogo');

  const user = {
    name: 'Carlos Mendoza',
    email: 'carlos@promospot.com',
    role: 'owner',
  };

  const mainClasses = `pt-16 transition-all duration-500 ease-in-out relative z-10 ${
    isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
  }`;

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        user={user}
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
      <main className={mainClasses}>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm mb-4">
            <button
              onClick={() => navigate('/loyalty-points-system')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Puntos de Lealtad
            </button>
            <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
            <span className="text-foreground font-medium">Catálogo de Recompensas</span>
          </nav>

          {/* Page Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Catálogo de Recompensas</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Gestiona las recompensas disponibles para canje con puntos de lealtad
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/loyalty-points-system')}>
              Cancelar
            </Button>
          </div>

          {/* Establishment Selector */}
          <div className="bg-card border border-border rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Icon name="Store" size={16} className="text-primary" />
                <span>Establecimiento:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ESTABLECIMIENTOS?.map(est => (
                  <button
                    key={est?.id}
                    onClick={() => setEstablecimiento(est?.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                      establecimiento === est?.id
                        ? 'bg-primary text-white border-primary' :'bg-background text-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {est?.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border mb-6">
            <div className="flex items-center gap-0">
              {TABS?.map(tab => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
                    activeTab === tab?.id
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  <Icon name={tab?.icon} size={15} />
                  {tab?.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'catalogo' && (
            <>
              {/* Filters */}
              <div className="bg-card border border-border rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Icon name="Filter" size={16} className="text-muted-foreground" />
                    <span>Filtros:</span>
                  </div>
                  <div className="flex flex-wrap gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground whitespace-nowrap">Categoría</label>
                      <select
                        value={categoria}
                        onChange={e => setCategoria(e?.target?.value)}
                        className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        {CATEGORIAS?.map(c => (
                          <option key={c?.id} value={c?.id}>{c?.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground whitespace-nowrap">Estado</label>
                      <select
                        value={estado}
                        onChange={e => setEstado(e?.target?.value)}
                        className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        {ESTADOS?.map(s => (
                          <option key={s?.id} value={s?.id}>{s?.label}</option>
                        ))}
                      </select>
                    </div>
                    {(categoria !== 'all' || estado !== 'all') && (
                      <button
                        onClick={() => { setCategoria('all'); setEstado('all'); }}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Icon name="X" size={12} />
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Catálogo content */}
              <CatalogoTab filterCategoria={categoria} filterEstado={estado} />
            </>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-4">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {analyticsData?.map((kpi, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${kpi?.bg}`}>
                      <Icon name={kpi?.icon} size={16} className={kpi?.color} />
                    </div>
                    <p className="text-xs text-muted-foreground mb-0.5">{kpi?.label}</p>
                    <p className="text-lg font-bold text-foreground leading-tight">{kpi?.value}</p>
                    {kpi?.trendUp !== null ? (
                      <div className={`flex items-center gap-0.5 mt-1 text-xs font-medium ${kpi?.trendUp ? 'text-emerald-600' : 'text-destructive'}`}>
                        <Icon name={kpi?.trendUp ? 'TrendingUp' : 'TrendingDown'} size={11} />
                        {kpi?.trend}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">{kpi?.trend}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Top Rewards Table */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Icon name="Trophy" size={15} className="text-amber-500" />
                  Recompensas más canjeadas
                </h4>
                <div className="space-y-2">
                  {topRewards?.map((r, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-foreground truncate">{r?.name}</span>
                          <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                            <span className="text-xs text-muted-foreground">{r?.canjes} canjes</span>
                            <span className="text-xs font-medium text-amber-600">{r?.pts} pts</span>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all"
                            style={{ width: `${r?.pct}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">{r?.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CatalogoRecompensasPage;
