import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';
import VFENodePalette from './components/VFENodePalette';
import VFECanvas from './components/VFECanvas';
import VFEConfigPanel from './components/VFEConfigPanel';
import VFEFunnelPanel from './components/VFEFunnelPanel';
import VFEHealthScore from './components/VFEHealthScore';

// Pre-built flow templates
const FLOW_TEMPLATES = {
  welcome: {
    name: 'Flow de Bienvenida',
    nodes: [
      { id: 'n1', type: 'user-register', label: 'Usuario se registra', icon: 'UserPlus', x: 300, y: 40, configured: true, subtitle: 'o primer check-in', stats: '423 ingresaron', statDetails: [{ label: 'Total ingresaron', value: '423', trend: 'up' }, { label: 'Esta semana', value: '38' }, { label: 'Semana pasada', value: '31' }], benchmark: 'Benchmark: 45+ usuarios/semana' },
      { id: 'n2', type: 'send-push', label: 'Push de bienvenida', icon: 'Bell', x: 300, y: 140, configured: false, subtitle: 'Personalizar mensaje', stats: '412 enviados · 78% abiertos', statDetails: [{ label: 'Enviados', value: '412' }, { label: 'Abiertos', value: '78%', trend: 'up' }, { label: 'Benchmark apertura', value: '45%' }], benchmark: 'Tu tasa de apertura está por encima del promedio' },
      { id: 'n3', type: 'credit-points', label: 'Acreditar puntos', icon: 'Coins', x: 300, y: 240, configured: false, subtitle: '50 puntos sugeridos', stats: '412 acreditados', statDetails: [{ label: 'Acreditados', value: '412' }] },
      { id: 'n4', type: 'wait-time', label: 'Esperar 3 días', icon: 'Timer', x: 300, y: 340, configured: true, subtitle: '¿El usuario visitó?', stats: '45 esperando', statDetails: [{ label: 'Esperando ahora', value: '45' }, { label: 'Promedio espera', value: '2.8 días' }], liveUsers: 45 },
      { id: 'n5', type: 'send-coupon', label: 'Cupón primera visita', icon: 'Ticket', x: 300, y: 460, configured: false, subtitle: 'Personalizar descuento', stats: '245 enviados · 36% canjeados', statDetails: [{ label: 'Enviados', value: '245' }, { label: 'Canjeados', value: '36%', trend: 'up' }] },
      { id: 'n6', type: 'end-flow', label: 'Conversión', icon: 'CheckCircle', x: 560, y: 380, configured: true, subtitle: 'Visitó → Éxito', stats: '156 convirtieron', statDetails: [{ label: 'Convirtieron', value: '156' }, { label: 'Tasa conversión', value: '37%', trend: 'up' }] },
    ],
    connections: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4' },
      { from: 'n4', to: 'n5', label: 'No visitó' },
      { from: 'n4', to: 'n6', label: 'Visitó', dashed: true },
      { from: 'n5', to: 'n6' },
    ]
  },
  reactivation: {
    name: 'Flow de Reactivación',
    nodes: [
      { id: 'n1', type: 'inactivity', label: 'Inactividad 21 días', icon: 'Clock', x: 300, y: 40, configured: true, subtitle: 'Configurable 7-90 días', stats: '154 ingresaron', statDetails: [{ label: 'Ingresaron', value: '154', trend: 'up' }], liveUsers: 12 },
      { id: 'n2', type: 'send-push', label: 'Push + cupón 10%', icon: 'Bell', x: 300, y: 140, configured: false, subtitle: 'Incentivo suave', stats: '148 enviados · 62% abiertos', statDetails: [{ label: 'Enviados', value: '148' }, { label: 'Abiertos', value: '62%', trend: 'up' }] },
      { id: 'n3', type: 'wait-time', label: 'Esperar 7 días', icon: 'Timer', x: 300, y: 240, configured: true, subtitle: '¿Visitó o canjeó?', stats: '89 esperando', liveUsers: 89 },
      { id: 'n4', type: 'send-email', label: 'Email cupón 20%', icon: 'Mail', x: 300, y: 360, configured: false, subtitle: 'Incentivo medio', stats: '67 enviados · 45% abiertos', statDetails: [{ label: 'Enviados', value: '67' }, { label: 'Abiertos', value: '45%' }] },
      { id: 'n5', type: 'wait-time', label: 'Esperar 7 días más', icon: 'Timer', x: 300, y: 460, configured: true, subtitle: '¿Visitó?', stats: '34 esperando', liveUsers: 34 },
      { id: 'n6', type: 'send-whatsapp', label: 'WhatsApp oferta 25%', icon: 'MessageCircle', x: 300, y: 560, configured: false, subtitle: 'Oferta final 48h', stats: '28 enviados' },
      { id: 'n7', type: 'end-flow', label: '¡De vuelta!', icon: 'CheckCircle', x: 560, y: 400, configured: true, subtitle: 'Push agradecimiento + puntos', stats: '65 convirtieron', statDetails: [{ label: 'Convirtieron', value: '65' }, { label: 'Tasa', value: '42%', trend: 'up' }] },
      { id: 'n8', type: 'change-tag', label: 'Marcar como perdido', icon: 'UserX', x: 300, y: 660, configured: true, subtitle: 'Tag CRM: perdido', stats: '22 marcados' },
    ],
    connections: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4', label: 'No visitó' },
      { from: 'n3', to: 'n7', label: 'Visitó', dashed: true },
      { from: 'n4', to: 'n5' },
      { from: 'n5', to: 'n6', label: 'No visitó' },
      { from: 'n5', to: 'n7', label: 'Visitó', dashed: true },
      { from: 'n6', to: 'n8' },
    ]
  },
  'post-first-visit': {
    name: 'Flow Post-Primera-Visita',
    nodes: [
      { id: 'n1', type: 'first-visit', label: 'Primera visita + 24h', icon: 'MapPin', x: 300, y: 40, configured: true, subtitle: 'Trigger automático', stats: '312 ingresaron', liveUsers: 8 },
      { id: 'n2', type: 'send-push', label: 'Mini-encuesta NPS', icon: 'Bell', x: 300, y: 140, configured: false, subtitle: '¿Cómo te fue?', stats: '298 enviados · 71% respondieron' },
      { id: 'n3', type: 'condition-multi', label: 'Resultado NPS', icon: 'GitMerge', x: 300, y: 260, configured: true, subtitle: '4 ramas' },
      { id: 'n4', type: 'send-push', label: 'Invitación a referir', icon: 'Share2', x: 60, y: 400, configured: false, subtitle: 'NPS 9-10 promotor', stats: '89 enviados' },
      { id: 'n5', type: 'send-coupon', label: 'Cupón 2da visita 15%', icon: 'Ticket', x: 240, y: 400, configured: false, subtitle: 'NPS 7-8 pasivo', stats: '67 enviados' },
      { id: 'n6', type: 'send-coupon', label: 'Disculpa + cupón 25%', icon: 'Heart', x: 420, y: 400, configured: false, subtitle: 'NPS 1-6 detractor', stats: '34 enviados' },
      { id: 'n7', type: 'internal-alert', label: 'Alerta al propietario', icon: 'AlertCircle', x: 420, y: 500, configured: false, subtitle: 'Nombre + calificación', stats: '34 alertas' },
      { id: 'n8', type: 'send-push', label: 'Reenvío ultra-corto', icon: 'Bell', x: 600, y: 400, configured: false, subtitle: 'Sin respuesta 3 días', stats: '45 enviados' },
    ],
    connections: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4', label: '9-10' },
      { from: 'n3', to: 'n5', label: '7-8' },
      { from: 'n3', to: 'n6', label: '1-6' },
      { from: 'n3', to: 'n8', label: 'Sin resp.' },
      { from: 'n6', to: 'n7' },
    ]
  },
  birthday: {
    name: 'Flow de Cumpleaños',
    nodes: [
      { id: 'n1', type: 'birthday', label: 'Cumpleaños en 3 días', icon: 'Gift', x: 300, y: 40, configured: true, subtitle: 'Configurable 1-7 días', stats: '89 ingresaron', liveUsers: 5 },
      { id: 'n2', type: 'send-push', label: 'Teaser misterioso', icon: 'Bell', x: 300, y: 140, configured: false, subtitle: '3 días antes', stats: '87 enviados · 82% abiertos' },
      { id: 'n3', type: 'send-coupon', label: 'Oferta día cumpleaños', icon: 'Ticket', x: 300, y: 240, configured: false, subtitle: '9:00 AM del día', stats: '87 enviados · 61% canjeados' },
      { id: 'n4', type: 'wait-time', label: 'Esperar 3 días', icon: 'Timer', x: 300, y: 340, configured: true, subtitle: '¿Canjeó?', stats: '34 esperando', liveUsers: 34 },
      { id: 'n5', type: 'send-push', label: 'Recordatorio', icon: 'Bell', x: 300, y: 440, configured: false, subtitle: 'Si no canjeó', stats: '34 enviados' },
      { id: 'n6', type: 'send-push', label: 'Agradecimiento', icon: 'Heart', x: 560, y: 300, configured: false, subtitle: 'Si canjeó', stats: '53 enviados' },
    ],
    connections: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4' },
      { from: 'n4', to: 'n5', label: 'No canjeó' },
      { from: 'n4', to: 'n6', label: 'Canjeó', dashed: true },
    ]
  },
  'vip-upgrade': {
    name: 'Flow Upgrade VIP',
    nodes: [
      { id: 'n1', type: 'vip-proximity', label: 'Al 80% del nivel VIP', icon: 'Crown', x: 300, y: 40, configured: true, subtitle: 'Configurable 50-95%', stats: '67 ingresaron', liveUsers: 3 },
      { id: 'n2', type: 'send-push', label: 'Push motivacional', icon: 'Bell', x: 300, y: 140, configured: false, subtitle: 'X visitas para subir', stats: '65 enviados · 74% abiertos' },
      { id: 'n3', type: 'send-push', label: 'A 1 visita del nivel', icon: 'Bell', x: 300, y: 240, configured: false, subtitle: '¡Casi llegas!', stats: '42 enviados' },
      { id: 'n4', type: 'send-push', label: 'Felicitación nivel', icon: 'Trophy', x: 300, y: 340, configured: false, subtitle: 'Beneficios del nivel', stats: '38 enviados' },
      { id: 'n5', type: 'send-push', label: 'Recordatorio beneficios', icon: 'Bell', x: 300, y: 440, configured: false, subtitle: '3 días después', stats: '38 enviados' },
    ],
    connections: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4' },
      { from: 'n4', to: 'n5' },
    ]
  },
  custom: {
    name: 'Flow personalizado',
    nodes: [],
    connections: []
  }
};

const VisualFlowEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const flowParam = searchParams?.get('flow');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(false);
  const [user, setUser] = useState({ name: 'Usuario', role: 'owner' });

  const [activeFlowTab, setActiveFlowTab] = useState(flowParam && FLOW_TEMPLATES?.[flowParam] ? flowParam : 'welcome');
  const [flowName, setFlowName] = useState('');
  const [flowStatus, setFlowStatus] = useState('draft');
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [showFunnel, setShowFunnel] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [undoStack, setUndoStack] = useState([]);

  const flowTabs = [
    { id: 'welcome', label: 'Bienvenida', icon: 'Sparkles' },
    { id: 'reactivation', label: 'Reactivación', icon: 'RefreshCw' },
    { id: 'post-first-visit', label: 'Post-Visita', icon: 'Star' },
    { id: 'birthday', label: 'Cumpleaños', icon: 'Gift' },
    { id: 'vip-upgrade', label: 'VIP Upgrade', icon: 'Crown' },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase?.auth?.getSession();
        if (session) {
          const { data: profile } = await supabase?.from('user_profiles')?.select('full_name, role')?.eq('id', session?.user?.id)?.single();
          if (profile) setUser({ name: profile?.full_name || session?.user?.email, role: profile?.role || 'owner' });
        }
      } catch (e) { console.error(e); }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const template = FLOW_TEMPLATES?.[activeFlowTab];
    if (template) {
      setNodes(template?.nodes?.map(n => ({ ...n })));
      setConnections(template?.connections?.map(c => ({ ...c })));
      setFlowName(template?.name);
      setFlowStatus('draft');
      setSelectedNode(null);
      setUndoStack([]);
    }
  }, [activeFlowTab]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e?.ctrlKey || e?.metaKey) && e?.key === 'z' && !e?.shiftKey) {
        e?.preventDefault();
        setUndoStack(prev => {
          if (prev?.length === 0) return prev;
          const last = prev?.[prev?.length - 1];
          setNodes(last?.nodes);
          setConnections(last?.connections);
          return prev?.slice(0, -1);
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const saveToUndo = useCallback(() => {
    setUndoStack(prev => [...prev?.slice(-19), { nodes: [...nodes], connections: [...connections] }]);
  }, [nodes, connections]);

  const handleDragStart = useCallback((e, nodeData) => {
    e?.dataTransfer?.setData('nodeData', JSON.stringify(nodeData));
    if (e?.dataTransfer) e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const handleDropNode = useCallback((nodeData) => {
    saveToUndo();
    const newNode = {
      id: `node-${Date.now()}`,
      type: nodeData?.id || nodeData?.type,
      label: nodeData?.label,
      icon: nodeData?.icon,
      x: nodeData?.x || 200,
      y: nodeData?.y || 200,
      configured: false,
    };
    setNodes(prev => [...prev, newNode]);
  }, [saveToUndo]);

  const handleUpdateNode = useCallback((updatedNode) => {
    setNodes(prev => prev?.map(n => n?.id === updatedNode?.id ? updatedNode : n));
    setSelectedNode(updatedNode);
  }, []);

  const handleDeleteNode = useCallback((nodeId) => {
    saveToUndo();
    setNodes(prev => prev?.filter(n => n?.id !== nodeId));
    setConnections(prev => prev?.filter(c => c?.from !== nodeId && c?.to !== nodeId));
    setSelectedNode(null);
  }, [saveToUndo]);

  const handleActivate = () => {
    setFlowStatus('active');
    setShowActivateModal(false);
  };

  const statusConfig = {
    draft: { label: 'Borrador', cls: 'bg-muted text-muted-foreground' },
    active: { label: 'Activo', cls: 'bg-success/10 text-success animate-pulse' },
    paused: { label: 'Pausado', cls: 'bg-warning/10 text-warning' },
  };

  const unconfiguredCount = nodes?.filter(n => !n?.configured && n?.type !== 'end-flow')?.length;
  const isPrebuilt = activeFlowTab !== 'custom';
  const liveUsersTotal = nodes?.reduce((sum, n) => sum + (n?.liveUsers || 0), 0);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} isCollapsed={isSidebarCollapsed} onCollapsedChange={setIsSidebarCollapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuToggle={() => setIsSidebarOpen(true)} user={user} />

        {/* Flow Tabs Bar */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-card overflow-x-auto flex-shrink-0">
          <button
            onClick={() => navigate('/automation-flows-dashboard')}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mr-2 flex-shrink-0"
          >
            <Icon name="ArrowLeft" size={14} />
            Volver
          </button>
          <div className="w-px h-5 bg-border mr-2 flex-shrink-0"></div>
          {flowTabs?.map(tab => (
            <button
              key={tab?.id}
              onClick={() => setActiveFlowTab(tab?.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex-shrink-0 ${
                activeFlowTab === tab?.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon name={tab?.icon} size={12} />
              {tab?.label}
            </button>
          ))}
          <button
            onClick={() => setActiveFlowTab('custom')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex-shrink-0 ml-1 ${
              activeFlowTab === 'custom' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Icon name="Plus" size={12} />
            Personalizado
          </button>
        </div>

        {/* Editor Top Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card flex-shrink-0">
          <div className="flex items-center gap-3">
            {isEditingName ? (
              <input
                autoFocus
                value={flowName}
                onChange={e => setFlowName(e?.target?.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={e => e?.key === 'Enter' && setIsEditingName(false)}
                className="text-sm font-bold border-b border-primary bg-transparent focus:outline-none min-w-32"
              />
            ) : (
              <button onClick={() => setIsEditingName(true)} className="flex items-center gap-1.5 group">
                <span className="text-sm font-bold text-foreground">{flowName}</span>
                <Icon name="Edit2" size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig?.[flowStatus]?.cls}`}>
              {statusConfig?.[flowStatus]?.label}
            </span>
            {unconfiguredCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-warning">
                <Icon name="AlertCircle" size={12} />
                {unconfiguredCount} nodo{unconfiguredCount > 1 ? 's' : ''} por configurar
              </span>
            )}
            {flowStatus === 'active' && liveUsersTotal > 0 && (
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                {liveUsersTotal} procesándose ahora
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <VFEHealthScore score={72} />
            <button
              onClick={() => setShowStats(!showStats)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                showStats ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Icon name="BarChart2" size={14} />
              Estadísticas
            </button>
            <button
              onClick={() => setShowFunnel(!showFunnel)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                showFunnel ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Icon name="Filter" size={14} />
              Ver funnel
            </button>
            <Button variant="outline" size="sm" iconName="Save" iconPosition="left">Guardar</Button>
            {flowStatus === 'active' ? (
              <Button
                variant="outline" size="sm"
                onClick={() => setFlowStatus('paused')}
                iconName="Pause" iconPosition="left"
                className="text-warning border-warning/30"
              >
                Pausar
              </Button>
            ) : (
              <Button
                variant="default" size="sm"
                onClick={() => setShowActivateModal(true)}
                iconName="Play" iconPosition="left"
              >
                Activar flow
              </Button>
            )}
          </div>
        </div>

        {/* Pre-armed banner */}
        {isPrebuilt && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200 flex-shrink-0">
            <Icon name="Info" size={14} className="text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              Este es el <strong>{flowName}</strong>. Personaliza los mensajes y valores haciendo click en cada nodo.
              {unconfiguredCount > 0 && <span className="ml-1">Los nodos con borde ámbar punteado requieren personalización.</span>}
            </p>
          </div>
        )}

        {/* Main Editor Area */}
        <div className="flex flex-1 overflow-hidden">
          <VFENodePalette
            isCollapsed={isPaletteCollapsed}
            onToggle={() => setIsPaletteCollapsed(!isPaletteCollapsed)}
            onDragStart={handleDragStart}
          />

          <div className="flex-1 flex flex-col overflow-hidden">
            <VFECanvas
              nodes={nodes}
              connections={connections}
              selectedNode={selectedNode}
              onSelectNode={setSelectedNode}
              onDeleteNode={handleDeleteNode}
              onDropNode={handleDropNode}
              showStats={showStats}
              showLive={flowStatus === 'active'}
            />
            {showFunnel && (
              <VFEFunnelPanel
                nodes={nodes}
                onClose={() => setShowFunnel(false)}
              />
            )}
          </div>

          <VFEConfigPanel
            node={selectedNode}
            flowStats={{
              status: statusConfig?.[flowStatus]?.label,
              usersProcessed: 423,
              lastActivation: 'Hace 2 horas',
              conversionRate: '21%',
            }}
            onClose={() => setSelectedNode(null)}
            onUpdateNode={handleUpdateNode}
          />
        </div>
      </div>
      {/* Activate Modal */}
      {showActivateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <Icon name="Play" size={20} className="text-success" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Activar {flowName}</h3>
            </div>
            {unconfiguredCount > 0 && (
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 mb-4">
                <div className="flex items-start gap-2">
                  <Icon name="AlertTriangle" size={14} className="text-warning mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Tienes {unconfiguredCount} nodo{unconfiguredCount > 1 ? 's' : ''} sin configurar. El flow funcionará con valores por defecto.
                  </p>
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground mb-6">
              Este flow se ejecutará automáticamente para cada usuario que cumpla el trigger a partir de ahora. ¿Activar?
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowActivateModal(false)}>Cancelar</Button>
              <Button variant="default" className="flex-1" onClick={handleActivate} iconName="Play" iconPosition="left">Activar flow</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualFlowEditor;
