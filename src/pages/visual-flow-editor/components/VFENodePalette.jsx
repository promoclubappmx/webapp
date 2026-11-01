import React from 'react';
import Icon from '../../../components/AppIcon';

const triggerNodes = [
  { id: 'user-register', label: 'Usuario se registra', icon: 'UserPlus' },
  { id: 'first-visit', label: 'Primera visita', icon: 'MapPin' },
  { id: 'inactivity', label: 'Inactividad X días', icon: 'Clock' },
  { id: 'vip-proximity', label: 'Proximidad nivel VIP', icon: 'Crown' },
  { id: 'birthday', label: 'Cumpleaños X días antes', icon: 'Gift' },
  { id: 'weather', label: 'Condición climática', icon: 'Cloud' },
  { id: 'low-checkins', label: 'Check-ins bajo umbral', icon: 'TrendingDown' },
  { id: 'geofence-enter', label: 'Entra al geofence', icon: 'Navigation' },
  { id: 'geofence-exit', label: 'Sale del geofence', icon: 'LogOut' },
  { id: 'review', label: 'Deja reseña', icon: 'Star' },
  { id: 'survey', label: 'Completa encuesta', icon: 'ClipboardList' },
];

const actionNodes = [
  { id: 'send-push', label: 'Enviar push', icon: 'Bell' },
  { id: 'send-coupon', label: 'Cupón al wallet', icon: 'Ticket' },
  { id: 'send-email', label: 'Enviar email', icon: 'Mail' },
  { id: 'send-whatsapp', label: 'Enviar WhatsApp', icon: 'MessageCircle' },
  { id: 'publish-story', label: 'Publicar story', icon: 'Image' },
  { id: 'credit-points', label: 'Acreditar puntos', icon: 'Coins' },
  { id: 'activate-promo', label: 'Activar promoción', icon: 'Tag' },
  { id: 'pause-promo', label: 'Pausar promoción', icon: 'PauseCircle' },
  { id: 'change-tag', label: 'Cambiar tag CRM', icon: 'Hash' },
  { id: 'internal-alert', label: 'Alerta interna', icon: 'AlertCircle' },
];

const controlNodes = [
  { id: 'wait-time', label: 'Espera (tiempo)', icon: 'Timer' },
  { id: 'wait-action', label: 'Espera (hasta acción)', icon: 'Hourglass' },
  { id: 'condition-yesno', label: 'Condición sí/no', icon: 'GitBranch' },
  { id: 'condition-multi', label: 'Condición múltiple', icon: 'GitMerge' },
  { id: 'end-flow', label: 'Fin del flow', icon: 'Square' },
];

const NodeItem = ({ node, onDragStart, type }) => {
  const colorMap = {
    trigger: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    action: 'text-blue-600 bg-blue-50 border-blue-200',
    control: 'text-amber-600 bg-amber-50 border-amber-200',
  };
  const iconColorMap = {
    trigger: 'text-emerald-600',
    action: 'text-blue-600',
    control: 'text-amber-600',
  };
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, { ...node, nodeType: type })}
      className="flex items-center gap-2 p-2 rounded-md border border-border bg-background hover:bg-muted/50 cursor-grab active:cursor-grabbing transition-colors group"
      title={node?.label}
    >
      <Icon name={node?.icon} size={13} className={iconColorMap?.[type]} />
      <span className="text-xs text-foreground truncate leading-tight">{node?.label}</span>
    </div>
  );
};

const VFENodePalette = ({ isCollapsed, onToggle, onDragStart }) => {
  return (
    <div className={`flex flex-col border-r border-border bg-card transition-all duration-200 flex-shrink-0 ${isCollapsed ? 'w-12' : 'w-52'}`}>
      <div className="flex items-center justify-between p-3 border-b border-border">
        {!isCollapsed && <span className="text-xs font-bold text-foreground uppercase tracking-wide">Nodos</span>}
        <button onClick={onToggle} className="p-1 rounded hover:bg-muted transition-colors ml-auto">
          <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={16} className="text-muted-foreground" />
        </button>
      </div>
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Triggers */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Triggers</span>
            </div>
            <div className="space-y-1">
              {triggerNodes?.map(n => <NodeItem key={n?.id} node={n} onDragStart={onDragStart} type="trigger" />)}
            </div>
          </div>

          {/* Actions */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Acciones</span>
            </div>
            <div className="space-y-1">
              {actionNodes?.map(n => <NodeItem key={n?.id} node={n} onDragStart={onDragStart} type="action" />)}
            </div>
          </div>

          {/* Control Flow */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Control de flujo</span>
            </div>
            <div className="space-y-1">
              {controlNodes?.map(n => <NodeItem key={n?.id} node={n} onDragStart={onDragStart} type="control" />)}
            </div>
          </div>
        </div>
      )}
      {isCollapsed && (
        <div className="flex-1 overflow-y-auto py-2 flex flex-col items-center gap-1.5">
          {[...triggerNodes?.slice(0, 3), ...actionNodes?.slice(0, 3), ...controlNodes]?.map(n => (
            <div
              key={n?.id}
              draggable
              onDragStart={(e) => onDragStart(e, n)}
              className="w-8 h-8 rounded-md border border-border flex items-center justify-center cursor-grab hover:bg-muted transition-colors"
              title={n?.label}
            >
              <Icon name={n?.icon} size={13} className="text-muted-foreground" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VFENodePalette;
