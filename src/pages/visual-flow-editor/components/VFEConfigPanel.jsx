import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const NodeConfigContent = ({ node, onUpdateNode }) => {
  const [localNode, setLocalNode] = useState({ ...node });

  const update = (field, value) => {
    const updated = { ...localNode, [field]: value, configured: true };
    setLocalNode(updated);
    onUpdateNode(updated);
  };

  const renderFields = () => {
    switch (node?.type) {
      case 'send-push':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">Mensaje push</label>
              <textarea
                value={localNode?.message || ''}
                onChange={e => update('message', e?.target?.value)}
                placeholder="Escribe tu mensaje push..."
                maxLength={100}
                rows={3}
                className="w-full text-xs border border-border rounded-lg p-2.5 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground text-right mt-1">{(localNode?.message || '')?.length}/100</p>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">Incluir nombre del usuario</label>
              <button
                onClick={() => update('includeUserName', !localNode?.includeUserName)}
                className={`w-10 h-5 rounded-full transition-colors ${
                  localNode?.includeUserName ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${
                  localNode?.includeUserName ? 'translate-x-5' : 'translate-x-0'
                }`}></div>
              </button>
            </div>
            {localNode?.message && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1.5 font-medium">Preview</p>
                <div className="bg-card border border-border rounded-lg p-2.5 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 bg-primary rounded-md"></div>
                    <span className="text-xs font-semibold text-foreground">PromoSpot</span>
                  </div>
                  <p className="text-xs text-foreground">{localNode?.message}{localNode?.includeUserName ? ' {nombre}' : ''}</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'send-coupon':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">Tipo de descuento</label>
              <select
                value={localNode?.discountType || 'percentage'}
                onChange={e => update('discountType', e?.target?.value)}
                className="w-full text-xs border border-border rounded-lg p-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto fijo ($)</option>
                <option value="free-product">Producto gratis</option>
                <option value="2x1">2x1</option>
              </select>
            </div>
            {(localNode?.discountType === 'percentage' || !localNode?.discountType) && (
              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">Valor del descuento (%)</label>
                <input
                  type="number" min="1" max="100"
                  value={localNode?.discountValue || ''}
                  onChange={e => update('discountValue', e?.target?.value)}
                  className="w-full text-xs border border-border rounded-lg p-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Ej: 15"
                />
              </div>
            )}
            {localNode?.discountType === 'fixed' && (
              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">Monto fijo (MXN)</label>
                <input
                  type="number" min="1"
                  value={localNode?.discountValue || ''}
                  onChange={e => update('discountValue', e?.target?.value)}
                  className="w-full text-xs border border-border rounded-lg p-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Ej: 50"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">Vigencia (días)</label>
              <input
                type="number" min="1" max="365"
                value={localNode?.validityDays || 14}
                onChange={e => update('validityDays', e?.target?.value)}
                className="w-full text-xs border border-border rounded-lg p-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        );

      case 'wait-time':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Días de espera: <span className="text-primary font-bold">{localNode?.waitDays || 3}</span>
              </label>
              <input
                type="range" min="1" max="30"
                value={localNode?.waitDays || 3}
                onChange={e => update('waitDays', parseInt(e?.target?.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1 día</span>
                <span>30 días</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">Bifurcar si usuario visitó</label>
              <button
                onClick={() => update('checkVisit', !localNode?.checkVisit)}
                className={`w-10 h-5 rounded-full transition-colors ${
                  localNode?.checkVisit ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${
                  localNode?.checkVisit ? 'translate-x-5' : 'translate-x-0'
                }`}></div>
              </button>
            </div>
            {localNode?.checkVisit && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">✓ Si visitó → sale del flow (conversión)</p>
                <p className="text-xs text-muted-foreground mt-1">✗ Si no visitó → continúa al siguiente paso</p>
              </div>
            )}
          </div>
        );

      case 'credit-points':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">Puntos a acreditar</label>
              <input
                type="number" min="1"
                value={localNode?.points || 50}
                onChange={e => update('points', e?.target?.value)}
                className="w-full text-xs border border-border rounded-lg p-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Ej: 50"
              />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Icon name="AlertCircle" size={13} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">Requiere programa de puntos activo en el módulo de Lealtad.</p>
              </div>
            </div>
          </div>
        );

      case 'inactivity':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Días sin visita para activar: <span className="text-primary font-bold">{localNode?.inactiveDays || 21}</span>
              </label>
              <input
                type="range" min="7" max="90"
                value={localNode?.inactiveDays || 21}
                onChange={e => update('inactiveDays', parseInt(e?.target?.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>7 días</span>
                <span>90 días</span>
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Icon name="Users" size={13} className="text-primary" />
                <p className="text-xs text-foreground font-medium">~154 clientes cumplen este criterio</p>
              </div>
            </div>
          </div>
        );

      case 'internal-alert':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">Enviar alerta al propietario</label>
              <button
                onClick={() => update('alertOwner', !localNode?.alertOwner)}
                className={`w-10 h-5 rounded-full transition-colors ${
                  localNode?.alertOwner !== false ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${
                  localNode?.alertOwner !== false ? 'translate-x-5' : 'translate-x-0'
                }`}></div>
              </button>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">El propietario recibirá una notificación push con el nombre del cliente, calificación y comentario para dar seguimiento personal.</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">Nombre del nodo</label>
              <input
                type="text"
                value={localNode?.label || ''}
                onChange={e => update('label', e?.target?.value)}
                className="w-full text-xs border border-border rounded-lg p-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">Descripción</label>
              <input
                type="text"
                value={localNode?.subtitle || ''}
                onChange={e => update('subtitle', e?.target?.value)}
                className="w-full text-xs border border-border rounded-lg p-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Descripción corta..."
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name={node?.icon || 'Circle'} size={16} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{node?.label}</p>
          <p className="text-xs text-muted-foreground capitalize">{node?.type?.replace(/-/g, ' ')}</p>
        </div>
      </div>
      {renderFields()}
      <button
        onClick={() => onUpdateNode({ ...localNode, configured: true })}
        className="w-full mt-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
      >
        Guardar configuración
      </button>
    </div>
  );
};

const FlowSummary = ({ flowStats }) => (
  <div className="flex-1 overflow-y-auto p-4">
    <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-4">Resumen del Flow</p>
    <div className="space-y-3">
      {[
        { label: 'Estado', value: flowStats?.status || 'Borrador', icon: 'Activity' },
        { label: 'Usuarios procesados', value: flowStats?.usersProcessed?.toLocaleString() || '0', icon: 'Users' },
        { label: 'Última activación', value: flowStats?.lastActivation || 'Nunca', icon: 'Clock' },
        { label: 'Tasa de conversión', value: flowStats?.conversionRate || '—', icon: 'TrendingUp' },
      ]?.map((item, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Icon name={item?.icon} size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{item?.label}</span>
          </div>
          <span className="text-xs font-semibold text-foreground">{item?.value}</span>
        </div>
      ))}
    </div>
    <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
      <p className="text-xs text-muted-foreground">Selecciona un nodo del canvas para ver su configuración y estadísticas.</p>
    </div>
  </div>
);

const VFEConfigPanel = ({ node, flowStats, onClose, onUpdateNode }) => {
  return (
    <div className="w-64 flex-shrink-0 border-l border-border bg-card flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <span className="text-xs font-bold text-foreground uppercase tracking-wide">
          {node ? 'Configuración' : 'Panel'}
        </span>
        {node && (
          <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
            <Icon name="X" size={14} className="text-muted-foreground" />
          </button>
        )}
      </div>
      {node
        ? <NodeConfigContent node={node} onUpdateNode={onUpdateNode} />
        : <FlowSummary flowStats={flowStats} />
      }
    </div>
  );
};

export default VFEConfigPanel;
