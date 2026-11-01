import React from 'react';
import Icon from '../../../components/AppIcon';

const triggerNodes = [
  { id: 'user-register', label: 'Usuario se registra', icon: 'UserPlus', color: 'text-emerald-600' },
  { id: 'first-visit', label: 'Primera visita', icon: 'MapPin', color: 'text-emerald-600' },
  { id: 'inactivity', label: 'Inactividad X días', icon: 'Clock', color: 'text-emerald-600' },
  { id: 'vip-proximity', label: 'Proximidad nivel VIP', icon: 'Crown', color: 'text-emerald-600' },
  { id: 'birthday', label: 'Cumpleaños X días antes', icon: 'Gift', color: 'text-emerald-600' },
  { id: 'weather', label: 'Condición climática', icon: 'Cloud', color: 'text-emerald-600' },
  { id: 'low-checkins', label: 'Check-ins bajo umbral', icon: 'TrendingDown', color: 'text-emerald-600' },
  { id: 'geofence-enter', label: 'Entra al geofence', icon: 'Navigation', color: 'text-emerald-600' },
  { id: 'review', label: 'Deja reseña', icon: 'Star', color: 'text-emerald-600' },
  { id: 'survey', label: 'Completa encuesta', icon: 'ClipboardList', color: 'text-emerald-600' },
];

const actionNodes = [
  { id: 'send-push', label: 'Enviar push', icon: 'Bell', color: 'text-blue-600' },
  { id: 'send-coupon', label: 'Cupón al wallet', icon: 'Ticket', color: 'text-blue-600' },
  { id: 'send-email', label: 'Enviar email', icon: 'Mail', color: 'text-blue-600' },
  { id: 'send-whatsapp', label: 'Enviar WhatsApp', icon: 'MessageCircle', color: 'text-blue-600' },
  { id: 'publish-story', label: 'Publicar story', icon: 'Image', color: 'text-blue-600' },
  { id: 'credit-points', label: 'Acreditar puntos', icon: 'Coins', color: 'text-blue-600' },
  { id: 'activate-promo', label: 'Activar promoción', icon: 'Tag', color: 'text-blue-600' },
  { id: 'change-tag', label: 'Cambiar tag CRM', icon: 'Hash', color: 'text-blue-600' },
  { id: 'internal-alert', label: 'Alerta interna', icon: 'AlertCircle', color: 'text-blue-600' },
];

const controlNodes = [
  { id: 'wait-time', label: 'Espera (tiempo)', icon: 'Timer', color: 'text-gray-600' },
  { id: 'wait-action', label: 'Espera (hasta acción)', icon: 'Hourglass', color: 'text-gray-600' },
  { id: 'condition-yesno', label: 'Condición sí/no', icon: 'GitBranch', color: 'text-amber-600' },
  { id: 'condition-multi', label: 'Condición múltiple', icon: 'GitMerge', color: 'text-amber-600' },
  { id: 'end-flow', label: 'Fin del flow', icon: 'Square', color: 'text-red-600' },
];

const NodeItem = ({ node, onDragStart }) => (
  <div
    draggable
    onDragStart={(e) => onDragStart(e, node)}
    className="flex items-center gap-2 p-2 rounded-md border border-border bg-background hover:bg-muted/50 cursor-grab active:cursor-grabbing transition-colors group"
    title={node?.label}
  >
    <Icon name={node?.icon} size={14} className={node?.color} />
    <span className="text-xs text-foreground truncate">{node?.label}</span>
  </div>
);

const FlowNodePalette = ({ isCollapsed, onToggle, onDragStart }) => {
  return (
    <div className={`flex flex-col border-r border-border bg-card transition-all duration-200 ${isCollapsed ? 'w-12' : 'w-52'}`}>
      <div className="flex items-center justify-between p-3 border-b border-border">
        {!isCollapsed && <span className="text-xs font-bold text-foreground uppercase tracking-wide">Nodos</span>}
        <button onClick={onToggle} className="p-1 rounded hover:bg-muted transition-colors ml-auto">
          <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={16} className="text-muted-foreground" />
        </button>
      </div>
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Triggers</span>
            </div>
            <div className="space-y-1">
              {triggerNodes?.map(n => <NodeItem key={n?.id} node={n} onDragStart={onDragStart} />)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Acciones</span>
            </div>
            <div className="space-y-1">
              {actionNodes?.map(n => <NodeItem key={n?.id} node={n} onDragStart={onDragStart} />)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Control</span>
            </div>
            <div className="space-y-1">
              {controlNodes?.map(n => <NodeItem key={n?.id} node={n} onDragStart={onDragStart} />)}
            </div>
          </div>
        </div>
      )}
      {isCollapsed && (
        <div className="flex-1 overflow-y-auto py-2 flex flex-col items-center gap-2">
          {[...triggerNodes?.slice(0,3), ...actionNodes?.slice(0,3), ...controlNodes]?.map(n => (
            <div key={n?.id} draggable onDragStart={(e) => onDragStart(e, n)}
              className="w-8 h-8 rounded-md border border-border flex items-center justify-center cursor-grab hover:bg-muted transition-colors"
              title={n?.label}>
              <Icon name={n?.icon} size={14} className={n?.color} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlowNodePalette;
