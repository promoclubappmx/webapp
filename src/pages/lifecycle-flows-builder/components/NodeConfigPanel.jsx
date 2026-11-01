import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const NodeConfigPanel = ({ node, flowStats, onClose, onUpdateNode }) => {
  const [localConfig, setLocalConfig] = useState(node?.config || {});

  if (!node) {
    return (
      <div className="w-72 border-l border-border bg-card p-5 flex flex-col">
        <h3 className="text-sm font-bold text-foreground mb-1">Resumen del Flow</h3>
        <p className="text-xs text-muted-foreground mb-4">Selecciona un nodo para configurarlo</p>
        {flowStats && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Estado</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{flowStats?.status}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Usuarios procesados</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{flowStats?.usersProcessed || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Última activación</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{flowStats?.lastActivation || 'Nunca'}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Tasa de conversión</p>
              <p className="text-sm font-semibold text-success mt-0.5">{flowStats?.conversionRate || '0%'}</p>
            </div>
          </div>
        )}
        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={14} className="text-primary mt-0.5" />
            <p className="text-xs text-muted-foreground">Los nodos con borde ámbar punteado requieren personalización antes de activar el flow.</p>
          </div>
        </div>
      </div>
    );
  }

  const update = (key, value) => {
    const updated = { ...localConfig, [key]: value };
    setLocalConfig(updated);
    onUpdateNode?.({ ...node, config: updated, configured: true });
  };

  const renderConfig = () => {
    switch (node?.type) {
      case 'send-push':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Mensaje del push</label>
              <div className="relative">
                <textarea
                  value={localConfig?.message || ''}
                  onChange={e => update('message', e?.target?.value)}
                  maxLength={100}
                  rows={3}
                  placeholder="¡Bienvenido a [negocio]! Te preparamos algo especial 🎉"
                  className="w-full text-xs border border-border rounded-md p-2 resize-none bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="absolute bottom-2 right-2 text-xs text-muted-foreground">{(localConfig?.message || '')?.length}/100</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground">Incluir nombre del usuario</p>
                <p className="text-xs text-muted-foreground">Inserta la variable {'{nombre}'}</p>
              </div>
              <button onClick={() => update('includeName', !localConfig?.includeName)}
                className={`w-10 h-5 rounded-full transition-colors ${localConfig?.includeName ? 'bg-primary' : 'bg-muted'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${localConfig?.includeName ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            <div className="p-3 rounded-lg bg-gray-900 text-white">
              <p className="text-xs text-gray-400 mb-1">Preview push notification</p>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded bg-primary flex-shrink-0"></div>
                <div>
                  <p className="text-xs font-semibold">PromoSpot</p>
                  <p className="text-xs text-gray-300 mt-0.5">{localConfig?.message || '¡Bienvenido! Te preparamos algo especial 🎉'}</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'send-coupon':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Tipo de descuento</label>
              <select value={localConfig?.discountType || 'percentage'} onChange={e => update('discountType', e?.target?.value)}
                className="w-full text-xs border border-border rounded-md p-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto fijo ($)</option>
                <option value="free-product">Producto gratis</option>
                <option value="2x1">2x1</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Valor</label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">{localConfig?.discountType === 'fixed' ? '$' : ''}</span>
                <input type="number" value={localConfig?.discountValue || ''} onChange={e => update('discountValue', e?.target?.value)}
                  placeholder="15" className="flex-1 text-xs border border-border rounded-md p-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                <span className="text-xs text-muted-foreground">{localConfig?.discountType === 'percentage' ? '%' : localConfig?.discountType === 'fixed' ? 'MXN' : ''}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Vigencia (días)</label>
              <input type="number" value={localConfig?.expiryDays || 14} onChange={e => update('expiryDays', e?.target?.value)}
                className="w-full text-xs border border-border rounded-md p-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
        );
      case 'wait-time':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-2">Días de espera: <span className="text-primary">{localConfig?.waitDays || 3}</span></label>
              <input type="range" min={1} max={30} value={localConfig?.waitDays || 3} onChange={e => update('waitDays', parseInt(e?.target?.value))}
                className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1 día</span><span>30 días</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground">Bifurcación si visitó</p>
                <p className="text-xs text-muted-foreground">Salir del flow si el usuario visita</p>
              </div>
              <button onClick={() => update('checkVisit', !localConfig?.checkVisit)}
                className={`w-10 h-5 rounded-full transition-colors ${localConfig?.checkVisit ? 'bg-primary' : 'bg-muted'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${localConfig?.checkVisit ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        );
      case 'credit-points':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Puntos a acreditar</label>
              <input type="number" value={localConfig?.points || 50} onChange={e => update('points', e?.target?.value)}
                className="w-full text-xs border border-border rounded-md p-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-start gap-2">
                <Icon name="AlertCircle" size={14} className="text-warning mt-0.5" />
                <p className="text-xs text-muted-foreground">Si no tienes programa de puntos activo, este nodo no tendrá efecto. <a href="/loyalty-points-system" className="text-primary underline">Activar programa</a></p>
              </div>
            </div>
          </div>
        );
      case 'internal-alert':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground">Enviar alerta al propietario</p>
                <p className="text-xs text-muted-foreground">Notificación push en el Admin</p>
              </div>
              <button onClick={() => update('alertOwner', !localConfig?.alertOwner)}
                className={`w-10 h-5 rounded-full transition-colors ${localConfig?.alertOwner !== false ? 'bg-primary' : 'bg-muted'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${localConfig?.alertOwner !== false ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Mensaje de alerta</label>
              <textarea value={localConfig?.alertMessage || ''} onChange={e => update('alertMessage', e?.target?.value)}
                placeholder="Cliente con mala experiencia: {nombre} - NPS {score}"
                rows={2} className="w-full text-xs border border-border rounded-md p-2 resize-none bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
        );
      default:
        return (
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Configura los parámetros de este nodo según tus necesidades.</p>
          </div>
        );
    }
  };

  return (
    <div className="w-72 border-l border-border bg-card flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon name={node?.icon || 'Circle'} size={16} className="text-primary" />
          <h3 className="text-sm font-bold text-foreground">{node?.label}</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
          <Icon name="X" size={16} className="text-muted-foreground" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {renderConfig()}
      </div>
      <div className="p-4 border-t border-border">
        <Button variant="outline" size="sm" className="w-full text-destructive border-destructive/30 hover:bg-destructive/5" iconName="Trash2" iconPosition="left">
          Eliminar nodo
        </Button>
      </div>
    </div>
  );
};

export default NodeConfigPanel;
