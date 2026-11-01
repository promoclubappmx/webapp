import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';

// Sub-module tab components
import VisualFlowEditorTab from './components/VisualFlowEditorTab';
import IFTTTRulesTab from './components/IFTTTRulesTab';
import IFTTTBuilderTab from './components/IFTTTBuilderTab';
import FlowTestingTab from './components/FlowTestingTab';
import RewardsAutomationTab from './components/RewardsAutomationTab';

const kpiData = [
  { title: 'Flows Activos', value: '7', change: '+2 este mes', changeType: 'positive', icon: 'Zap', color: 'primary' },
  { title: 'Usuarios Procesándose', value: '243', change: '+18%', changeType: 'positive', icon: 'Users', color: 'success' },
  { title: 'Conversiones del Mes', value: '1,847', change: '+34%', changeType: 'positive', icon: 'TrendingUp', color: 'warning' },
  { title: 'Revenue Atribuido', value: '$48,320', change: '+22%', changeType: 'positive', icon: 'DollarSign', color: 'destructive' },
];

const lifecycleFlows = [
  { id: 'welcome', name: 'Bienvenida', icon: 'Sparkles', desc: 'Convierte registros en visitas recurrentes', recommended: true, color: 'from-emerald-500 to-teal-600', status: 'active', users: 89, conversions: '68%' },
  { id: 'reactivation', name: 'Reactivación', icon: 'RefreshCw', desc: 'Recupera clientes dormidos con escalada progresiva', recommended: true, color: 'from-orange-500 to-red-500', status: 'active', users: 154, conversions: '42%' },
  { id: 'post-first-visit', name: 'Post-Primera-Visita', icon: 'Star', desc: 'Feedback NPS y referidos tras la primera visita', recommended: false, color: 'from-blue-500 to-indigo-600', status: 'draft', users: 0, conversions: '-' },
  { id: 'birthday', name: 'Cumpleaños', icon: 'Gift', desc: 'Experiencia memorable con múltiples touchpoints', recommended: false, color: 'from-pink-500 to-rose-600', status: 'active', users: 23, conversions: '81%' },
  { id: 'vip-upgrade', name: 'Upgrade VIP', icon: 'Crown', desc: 'Motiva al usuario a completar su siguiente nivel', recommended: false, color: 'from-amber-500 to-yellow-600', status: 'paused', users: 0, conversions: '-' },
  { id: 'referrals', name: 'Referidos', icon: 'Share2', desc: 'Programa de referidos automatizado con incentivos duales', recommended: false, color: 'from-violet-500 to-purple-600', status: 'draft', users: 0, conversions: '-' },
];

const iftttRules = [
  { id: 'weather', name: 'Si llueve → Promo activa', icon: 'CloudRain', trigger: 'Condición climática', action: 'Activar promoción', status: 'active', activations: 12, color: 'bg-sky-500' },
  { id: 'no-checkins', name: 'Sin check-ins → Flash Deal', icon: 'Zap', trigger: '2h sin check-ins', action: 'Flash deal + push 2km', status: 'active', activations: 8, color: 'bg-orange-500' },
  { id: 'inactive', name: 'Cliente inactivo → Cupón', icon: 'UserX', trigger: '30 días sin visita', action: 'Enviar cupón al wallet', status: 'paused', activations: 45, color: 'bg-purple-500' },
];

const aiSuggestions = [
  { id: 1, icon: 'Users', text: 'Tienes 45 clientes que visitaron una vez y no volvieron.', action: '¿Activamos un flow post-primera-visita?', cta: 'Activar Flow', flowId: 'post-first-visit' },
  { id: 2, icon: 'TrendingDown', text: 'Tus martes tienen 40% menos tráfico que el promedio.', action: '¿Creamos una regla de flash deal automático?', cta: 'Crear Regla', flowId: 'no-checkins' },
  { id: 3, icon: 'Gift', text: '12 clientes cumplen años este mes y no tienes flow activo.', action: '¿Activamos el flow de cumpleaños?', cta: 'Activar Flow', flowId: 'birthday' },
];

const StatusBadge = ({ status }) => {
  const map = {
    active: { label: 'Activo', cls: 'bg-success/10 text-success' },
    draft: { label: 'Borrador', cls: 'bg-muted text-muted-foreground' },
    paused: { label: 'Pausado', cls: 'bg-warning/10 text-warning' },
  };
  const s = map?.[status] || map?.draft;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s?.cls}`}>{s?.label}</span>;
};

const KPICard = ({ title, value, change, changeType, icon, color }) => {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
  };
  return (
    <div className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap?.[color]}`}>
          <Icon name={icon} size={20} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${changeType === 'positive' ? 'text-success' : 'text-destructive'}`}>
          <Icon name={changeType === 'positive' ? 'TrendingUp' : 'TrendingDown'} size={14} />
          {change}
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{title}</p>
    </div>
  );
};

// Dashboard overview tab
const DashboardTab = ({ onNavigateTab }) => {
  const [flowTab, setFlowTab] = useState('active');
  const [ruleTab, setRuleTab] = useState('active');
  const [dismissedSuggestions, setDismissedSuggestions] = useState([]);

  const filteredFlows = lifecycleFlows?.filter(f => {
    if (flowTab === 'active') return f?.status === 'active';
    if (flowTab === 'draft') return f?.status === 'draft';
    if (flowTab === 'paused') return f?.status === 'paused';
    return true;
  });

  const filteredRules = iftttRules?.filter(r => {
    if (ruleTab === 'active') return r?.status === 'active';
    if (ruleTab === 'draft') return r?.status === 'draft';
    if (ruleTab === 'paused') return r?.status === 'paused';
    return true;
  });

  const visibleSuggestions = aiSuggestions?.filter(s => !dismissedSuggestions?.includes(s?.id));

  return (
    <div>
      {/* KPI Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiData?.map((kpi, i) => <KPICard key={i} {...kpi} />)}
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Mis Flows */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Icon name="GitBranch" size={18} className="text-primary" />
              Mis Flows
            </h2>
            <Button variant="ghost" size="sm" onClick={() => onNavigateTab('visual-editor')} iconName="Plus" iconPosition="left">Nuevo</Button>
          </div>
          <div className="flex border-b border-border px-5">
            {[['active','Activos'],['draft','Borradores'],['paused','Pausados']]?.map(([val,label]) => (
              <button key={val} onClick={() => setFlowTab(val)}
                className={`pb-2 mr-4 text-sm font-medium border-b-2 transition-colors ${
                  flowTab === val ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}>{label}</button>
            ))}
          </div>
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {filteredFlows?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="GitBranch" size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No hay flows en este estado</p>
              </div>
            ) : filteredFlows?.map(flow => (
              <div key={flow?.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors group">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${flow?.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon name={flow?.icon} size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">{flow?.name}</p>
                    <StatusBadge status={flow?.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground">{flow?.users} usuarios</span>
                    {flow?.conversions !== '-' && <span className="text-xs text-success">{flow?.conversions} conv.</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onNavigateTab('visual-editor')} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <Icon name="Edit2" size={14} />
                  </button>
                  <button className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <Icon name={flow?.status === 'active' ? 'Pause' : 'Play'} size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mis Reglas IFTTT */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Icon name="Zap" size={18} className="text-warning" />
              Mis Reglas IFTTT
            </h2>
            <Button variant="ghost" size="sm" onClick={() => onNavigateTab('ifttt-builder')} iconName="Plus" iconPosition="left">Nueva</Button>
          </div>
          <div className="flex border-b border-border px-5">
            {[['active','Activos'],['draft','Borradores'],['paused','Pausados']]?.map(([val,label]) => (
              <button key={val} onClick={() => setRuleTab(val)}
                className={`pb-2 mr-4 text-sm font-medium border-b-2 transition-colors ${
                  ruleTab === val ? 'border-warning text-warning' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}>{label}</button>
            ))}
          </div>
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {filteredRules?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="Zap" size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No hay reglas en este estado</p>
              </div>
            ) : filteredRules?.map(rule => (
              <div key={rule?.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors group">
                <div className={`w-9 h-9 rounded-lg ${rule?.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon name={rule?.icon} size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">{rule?.name}</p>
                    <StatusBadge status={rule?.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground">{rule?.trigger}</span>
                    <span className="text-xs text-muted-foreground">→</span>
                    <span className="text-xs text-muted-foreground">{rule?.action}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-muted-foreground mr-2">{rule?.activations} activaciones</span>
                  <button onClick={() => onNavigateTab('ifttt-rules')} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <Icon name="Edit2" size={14} />
                  </button>
                  <button className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <Icon name={rule?.status === 'active' ? 'Pause' : 'Play'} size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Suggestions Banner */}
      {visibleSuggestions?.length > 0 && (
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Sparkles" size={16} className="text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Sugerencias de la IA</h3>
            <span className="text-xs text-muted-foreground">Basadas en la actividad de tu negocio</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {visibleSuggestions?.map(s => (
              <div key={s?.id} className="bg-card rounded-lg p-4 border border-border relative">
                <button onClick={() => setDismissedSuggestions(prev => [...prev, s?.id])}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Icon name="X" size={14} />
                </button>
                <div className="flex items-start gap-2 mb-3">
                  <div className="w-7 h-7 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name={s?.icon} size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{s?.text}</p>
                    <p className="text-xs font-semibold text-foreground mt-1">{s?.action}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => onNavigateTab('visual-editor')}>{s?.cta}</Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'visual-editor', label: 'Editor de Flows', icon: 'Workflow' },
  { id: 'ifttt-rules', label: 'Reglas IFTTT', icon: 'Zap' },
  { id: 'ifttt-builder', label: 'Constructor IFTTT', icon: 'Settings2' },
  { id: 'rewards-automation', label: 'Reglas Recompensas', icon: 'Trophy' },
  { id: 'flow-testing', label: 'Probar Flow', icon: 'Play' },
];

const AutomationFlowsDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState({ name: 'Usuario', role: 'owner' });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase?.auth?.getSession();
        if (session) {
          const { data: profile } = await supabase
            ?.from('user_profiles')
            ?.select('full_name, role')
            ?.eq('id', session?.user?.id)
            ?.single();
          if (profile) setUser({ name: profile?.full_name || session?.user?.email, role: profile?.role || 'owner' });
        }
      } catch (e) { console.error(e); }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onMenuToggle={() => setIsSidebarOpen(prev => !prev)}
        isMenuOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
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
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow">
                  <Icon name="Zap" size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Automatización de Flows</h1>
                  <p className="text-sm text-muted-foreground">El marketing que trabaja solo, configura una vez y ejecuta para siempre</p>
                </div>
              </div>
            </div>
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
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
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
            {activeTab === 'dashboard' && <DashboardTab onNavigateTab={setActiveTab} />}
            {activeTab === 'visual-editor' && <VisualFlowEditorTab />}
            {activeTab === 'ifttt-rules' && <IFTTTRulesTab />}
            {activeTab === 'ifttt-builder' && <IFTTTBuilderTab />}
            {activeTab === 'rewards-automation' && <RewardsAutomationTab />}
            {activeTab === 'flow-testing' && <FlowTestingTab />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AutomationFlowsDashboard;
