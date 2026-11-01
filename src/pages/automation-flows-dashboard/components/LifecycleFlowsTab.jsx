import React, { useState, useCallback, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

import FlowNodePalette from '../../lifecycle-flows-builder/components/FlowNodePalette';
import FlowCanvas from '../../lifecycle-flows-builder/components/FlowCanvas';
import NodeConfigPanel from '../../lifecycle-flows-builder/components/NodeConfigPanel';
import FlowStatsPanel from '../../lifecycle-flows-builder/components/FlowStatsPanel';

const FLOW_TEMPLATES = {
  welcome: {
    name: 'Flow de Bienvenida',
    description: 'Convierte registros en visitas recurrentes',
    nodes: [
      { id: 'n1', type: 'user-register', label: 'Usuario se registra', icon: 'UserPlus', x: 300, y: 40, configured: true, subtitle: 'o primer check-in', stats: '423 ingresaron' },
      { id: 'n2', type: 'send-push', label: 'Push de bienvenida', icon: 'Bell', x: 300, y: 140, configured: false, subtitle: 'Personalizar mensaje', stats: '412 enviados · 78% abiertos' },
      { id: 'n3', type: 'credit-points', label: 'Acreditar puntos', icon: 'Coins', x: 300, y: 240, configured: false, subtitle: '50 puntos sugeridos', stats: '412 acreditados' },
      { id: 'n4', type: 'wait-time', label: 'Esperar 3 días', icon: 'Timer', x: 300, y: 340, configured: true, subtitle: '¿El usuario visitó?', stats: '45 esperando' },
      { id: 'n5', type: 'send-coupon', label: 'Cupón primera visita', icon: 'Ticket', x: 300, y: 460, configured: false, subtitle: 'Personalizar descuento', stats: '245 enviados · 36% canjeados' },
      { id: 'n6', type: 'end-flow', label: 'Conversión', icon: 'CheckCircle', x: 560, y: 380, configured: true, subtitle: 'Visitó → Éxito', stats: '156 convirtieron' },
    ],
    connections: [
      { from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }, { from: 'n3', to: 'n4' },
      { from: 'n4', to: 'n5', label: 'No visitó' }, { from: 'n4', to: 'n6', label: 'Visitó', dashed: true }, { from: 'n5', to: 'n6' },
    ]
  },
  reactivation: {
    name: 'Flow de Reactivación',
    description: 'Recupera clientes dormidos con escalada progresiva',
    nodes: [
      { id: 'n1', type: 'inactivity', label: 'Inactividad 21 días', icon: 'Clock', x: 300, y: 40, configured: true, subtitle: 'Configurable 7-90 días', stats: '154 ingresaron' },
      { id: 'n2', type: 'send-push', label: 'Push + cupón 10%', icon: 'Bell', x: 300, y: 140, configured: false, subtitle: 'Incentivo suave', stats: '148 enviados · 62% abiertos' },
      { id: 'n3', type: 'wait-time', label: 'Esperar 7 días', icon: 'Timer', x: 300, y: 240, configured: true, subtitle: '¿Visitó o canjeó?', stats: '89 esperando' },
      { id: 'n4', type: 'send-email', label: 'Email cupón 20%', icon: 'Mail', x: 300, y: 360, configured: false, subtitle: 'Incentivo medio', stats: '67 enviados · 45% abiertos' },
      { id: 'n5', type: 'wait-time', label: 'Esperar 7 días más', icon: 'Timer', x: 300, y: 460, configured: true, subtitle: '¿Visitó?', stats: '34 esperando' },
      { id: 'n6', type: 'send-whatsapp', label: 'WhatsApp oferta 25%', icon: 'MessageCircle', x: 300, y: 560, configured: false, subtitle: 'Oferta final 48h', stats: '28 enviados' },
      { id: 'n7', type: 'end-flow', label: '¡De vuelta!', icon: 'CheckCircle', x: 560, y: 400, configured: true, subtitle: 'Push agradecimiento + puntos', stats: '65 convirtieron' },
      { id: 'n8', type: 'change-tag', label: 'Marcar como perdido', icon: 'UserX', x: 300, y: 660, configured: true, subtitle: 'Tag CRM: perdido', stats: '22 marcados' },
    ],
    connections: [
      { from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4', label: 'No visitó' }, { from: 'n3', to: 'n7', label: 'Visitó', dashed: true },
      { from: 'n4', to: 'n5' }, { from: 'n5', to: 'n6', label: 'No visitó' }, { from: 'n5', to: 'n7', label: 'Visitó', dashed: true }, { from: 'n6', to: 'n8' },
    ]
  },
  birthday: {
    name: 'Flow de Cumpleaños',
    description: 'Experiencia memorable con múltiples touchpoints',
    nodes: [
      { id: 'n1', type: 'birthday', label: 'Cumpleaños en 3 días', icon: 'Gift', x: 300, y: 40, configured: true, subtitle: 'Configurable 1-7 días', stats: '89 ingresaron' },
      { id: 'n2', type: 'send-push', label: 'Teaser misterioso', icon: 'Bell', x: 300, y: 140, configured: false, subtitle: '3 días antes', stats: '87 enviados · 82% abiertos' },
      { id: 'n3', type: 'send-coupon', label: 'Oferta día cumpleaños', icon: 'Ticket', x: 300, y: 240, configured: false, subtitle: '9:00 AM del día', stats: '87 enviados · 61% canjeados' },
      { id: 'n4', type: 'wait-time', label: 'Esperar 3 días', icon: 'Timer', x: 300, y: 340, configured: true, subtitle: '¿Canjeó?', stats: '34 esperando' },
      { id: 'n5', type: 'send-push', label: 'Recordatorio', icon: 'Bell', x: 300, y: 440, configured: false, subtitle: 'Si no canjeó', stats: '34 enviados' },
      { id: 'n6', type: 'send-push', label: 'Agradecimiento', icon: 'Heart', x: 560, y: 300, configured: false, subtitle: 'Si canjeó', stats: '53 enviados' },
    ],
    connections: [
      { from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }, { from: 'n3', to: 'n4' },
      { from: 'n4', to: 'n5', label: 'No canjeó' }, { from: 'n4', to: 'n6', label: 'Canjeó', dashed: true },
    ]
  },
  'post-first-visit': {
    name: 'Flow Post-Primera-Visita',
    description: 'Feedback NPS y referidos tras la primera visita',
    nodes: [
      { id: 'n1', type: 'first-visit', label: 'Primera visita + 24h', icon: 'MapPin', x: 300, y: 40, configured: true, subtitle: 'Trigger automático', stats: '312 ingresaron' },
      { id: 'n2', type: 'send-push', label: 'Mini-encuesta NPS', icon: 'Bell', x: 300, y: 140, configured: false, subtitle: '¿Cómo te fue?', stats: '298 enviados · 71% respondieron' },
      { id: 'n3', type: 'condition-multi', label: 'Resultado NPS', icon: 'GitMerge', x: 300, y: 260, configured: true, subtitle: '4 ramas', stats: '' },
      { id: 'n4', type: 'send-push', label: 'Invitación a referir', icon: 'Share2', x: 80, y: 380, configured: false, subtitle: 'NPS 9-10 promotor', stats: '89 enviados' },
      { id: 'n5', type: 'send-coupon', label: 'Cupón 2da visita 15%', icon: 'Ticket', x: 260, y: 380, configured: false, subtitle: 'NPS 7-8 pasivo', stats: '67 enviados' },
      { id: 'n6', type: 'send-coupon', label: 'Disculpa + cupón 25%', icon: 'Heart', x: 440, y: 380, configured: false, subtitle: 'NPS 1-6 detractor', stats: '34 enviados' },
      { id: 'n7', type: 'internal-alert', label: 'Alerta al propietario', icon: 'AlertCircle', x: 440, y: 480, configured: false, subtitle: 'Nombre + calificación', stats: '34 alertas' },
      { id: 'n8', type: 'send-push', label: 'Reenvío ultra-corto', icon: 'Bell', x: 600, y: 380, configured: false, subtitle: 'Sin respuesta 3 días', stats: '45 enviados' },
    ],
    connections: [
      { from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4', label: '9-10' }, { from: 'n3', to: 'n5', label: '7-8' },
      { from: 'n3', to: 'n6', label: '1-6' }, { from: 'n3', to: 'n8', label: 'Sin resp.' }, { from: 'n6', to: 'n7' },
    ]
  },
  'vip-upgrade': {
    name: 'Flow Upgrade VIP',
    description: 'Motiva al usuario a completar su siguiente nivel',
    nodes: [
      { id: 'n1', type: 'vip-proximity', label: 'Al 80% del nivel VIP', icon: 'Crown', x: 300, y: 40, configured: true, subtitle: 'Configurable 50-95%', stats: '67 ingresaron' },
      { id: 'n2', type: 'send-push', label: 'Push motivacional', icon: 'Bell', x: 300, y: 140, configured: false, subtitle: 'X visitas para subir', stats: '65 enviados · 74% abiertos' },
      { id: 'n3', type: 'send-push', label: 'A 1 visita del nivel', icon: 'Bell', x: 300, y: 240, configured: false, subtitle: '¡Casi llegas!', stats: '42 enviados' },
      { id: 'n4', type: 'send-push', label: 'Felicitación nivel', icon: 'Trophy', x: 300, y: 340, configured: false, subtitle: 'Beneficios del nivel', stats: '38 enviados' },
      { id: 'n5', type: 'send-push', label: 'Recordatorio beneficios', icon: 'Bell', x: 300, y: 440, configured: false, subtitle: '3 días después', stats: '38 enviados' },
    ],
    connections: [
      { from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }, { from: 'n3', to: 'n4' }, { from: 'n4', to: 'n5' },
    ]
  },
  referrals: {
    name: 'Flow de Referidos',
    description: 'Programa de referidos automatizado',
    nodes: [
      { id: 'n1', type: 'survey', label: 'Comparte link referido', icon: 'Share2', x: 300, y: 40, configured: true, subtitle: 'Trigger automático', stats: '0 ingresaron' },
      { id: 'n2', type: 'send-push', label: 'Confirmación envío', icon: 'Bell', x: 300, y: 140, configured: false, subtitle: 'Gracias por referir', stats: '0 enviados' },
      { id: 'n3', type: 'wait-time', label: 'Esperar registro', icon: 'Timer', x: 300, y: 240, configured: true, subtitle: '¿El referido se registró?', stats: '0 esperando' },
      { id: 'n4', type: 'credit-points', label: 'Puntos por referido', icon: 'Coins', x: 300, y: 360, configured: false, subtitle: 'Al referidor', stats: '0 acreditados' },
      { id: 'n5', type: 'send-coupon', label: 'Cupón al referido', icon: 'Ticket', x: 300, y: 460, configured: false, subtitle: 'Bienvenida al nuevo', stats: '0 enviados' },
    ],
    connections: [
      { from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4', label: 'Se registró' }, { from: 'n4', to: 'n5' },
    ]
  }
};

const LifecycleFlowsTab = () => {
  const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(false);
  const [activeFlowTab, setActiveFlowTab] = useState('welcome');
  const [flowName, setFlowName] = useState('');
  const [flowStatus, setFlowStatus] = useState('draft');
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [showFunnel, setShowFunnel] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  const flowTabs = [
    { id: 'welcome', label: 'Bienvenida', icon: 'Sparkles' },
    { id: 'reactivation', label: 'Reactivación', icon: 'RefreshCw' },
    { id: 'post-first-visit', label: 'Post-Visita', icon: 'Star' },
    { id: 'birthday', label: 'Cumpleaños', icon: 'Gift' },
    { id: 'vip-upgrade', label: 'VIP Upgrade', icon: 'Crown' },
    { id: 'referrals', label: 'Referidos', icon: 'Share2' },
  ];

  useEffect(() => {
    const template = FLOW_TEMPLATES?.[activeFlowTab];
    if (template) {
      setNodes(template?.nodes?.map(n => ({ ...n })));
      setConnections(template?.connections?.map(c => ({ ...c })));
      setFlowName(template?.name);
      setFlowStatus('draft');
      setSelectedNode(null);
    }
  }, [activeFlowTab]);

  const handleDragStart = useCallback((e, nodeData) => {
    e?.dataTransfer?.setData('nodeData', JSON.stringify(nodeData));
    if (e?.dataTransfer) e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const handleDropNode = useCallback((nodeData) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: nodeData?.id,
      label: nodeData?.label,
      icon: nodeData?.icon,
      x: nodeData?.x || 200,
      y: nodeData?.y || 200,
      configured: false,
    };
    setNodes(prev => [...prev, newNode]);
  }, []);

  const handleUpdateNode = useCallback((updatedNode) => {
    setNodes(prev => prev?.map(n => n?.id === updatedNode?.id ? updatedNode : n));
    setSelectedNode(updatedNode);
  }, []);

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

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mb-8">
      {/* Flow Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-muted/30 overflow-x-auto">
        {flowTabs?.map(tab => (
          <button key={tab?.id} onClick={() => setActiveFlowTab(tab?.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex-shrink-0 ${
              activeFlowTab === tab?.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}>
            <Icon name={tab?.icon} size={12} />
            {tab?.label}
          </button>
        ))}
        <button onClick={() => { setActiveFlowTab('custom'); setNodes([]); setConnections([]); setFlowName('Flow personalizado'); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex-shrink-0 ml-1">
          <Icon name="Plus" size={12} />
          Personalizado
        </button>
      </div>

      {/* Editor Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          {isEditingName ? (
            <input autoFocus value={flowName} onChange={e => setFlowName(e?.target?.value)}
              onBlur={() => setIsEditingName(false)} onKeyDown={e => e?.key === 'Enter' && setIsEditingName(false)}
              className="text-sm font-bold border-b border-primary bg-transparent focus:outline-none" />
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
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowStats(!showStats)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              showStats ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
            }`}>
            <Icon name="BarChart2" size={14} />
            Estadísticas
          </button>
          <button onClick={() => setShowFunnel(!showFunnel)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
            <Icon name="Filter" size={14} />
            Ver funnel
          </button>
          <Button variant="outline" size="sm" iconName="Save" iconPosition="left">Guardar</Button>
          {flowStatus === 'active' ? (
            <Button variant="outline" size="sm" onClick={() => setFlowStatus('paused')} iconName="Pause" iconPosition="left" className="text-warning border-warning/30">Pausar</Button>
          ) : (
            <Button variant="default" size="sm" onClick={() => setShowActivateModal(true)} iconName="Play" iconPosition="left">Activar flow</Button>
          )}
        </div>
      </div>

      {activeFlowTab !== 'custom' && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200">
          <Icon name="Info" size={14} className="text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            Este es el <strong>{flowName}</strong>. Personaliza los mensajes y valores haciendo click en cada nodo.
            {unconfiguredCount > 0 && <span className="ml-1">Los nodos con borde ámbar punteado requieren personalización.</span>}
          </p>
        </div>
      )}

      {/* Main Editor Area */}
      <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 340px)', minHeight: '500px' }}>
        <FlowNodePalette
          isCollapsed={isPaletteCollapsed}
          onToggle={() => setIsPaletteCollapsed(!isPaletteCollapsed)}
          onDragStart={handleDragStart}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <FlowCanvas
            nodes={nodes}
            connections={connections}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            onDeleteNode={(nodeId) => setNodes(prev => prev?.filter(n => n?.id !== nodeId))}
            onDropNode={handleDropNode}
            showStats={showStats}
            flowType={activeFlowTab}
          />
          {showFunnel && <FlowStatsPanel onClose={() => setShowFunnel(false)} />}
        </div>
        <NodeConfigPanel
          node={selectedNode}
          flowStats={{ status: statusConfig?.[flowStatus]?.label, usersProcessed: 423, lastActivation: 'Hace 2 horas', conversionRate: '21%' }}
          onClose={() => setSelectedNode(null)}
          onUpdateNode={handleUpdateNode}
        />
      </div>

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
                  <p className="text-xs text-muted-foreground">Tienes {unconfiguredCount} nodo{unconfiguredCount > 1 ? 's' : ''} sin configurar. El flow funcionará con valores por defecto.</p>
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground mb-6">Este flow se ejecutará automáticamente para cada usuario que cumpla el trigger. ¿Activar?</p>
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

export default LifecycleFlowsTab;
