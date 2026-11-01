import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const OrderCard = ({ order, onAction, onViewDetail, onCancel }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending': return { action: 'Confirmar', actionIcon: 'CheckCircle', actionClass: 'bg-blue-500 hover:bg-blue-600 text-white' };
      case 'confirmed': return { action: 'Marcar listo', actionIcon: 'Package', actionClass: 'bg-amber-500 hover:bg-amber-600 text-white' };
      case 'ready': return { action: 'Completar', actionIcon: 'CheckCheck', actionClass: 'bg-emerald-500 hover:bg-emerald-600 text-white' };
      default: return { action: null };
    }
  };

  const getCountdown = (pickupSlot) => {
    if (!pickupSlot) return null;
    const diff = new Date(pickupSlot) - new Date();
    const mins = Math.floor(diff / 60000);
    if (mins < 0) return { text: 'Vencido', red: true };
    if (mins < 60) return { text: `${mins} min`, red: mins < 10 };
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return { text: `${hrs}h ${rem}m`, red: false };
  };

  const statusCfg = getStatusConfig(order?.order_status);
  const countdown = getCountdown(order?.pickup_slot);
  const items = order?.order_items || [];
  const visibleItems = items?.slice(0, 3);
  const extraCount = items?.length - 3;

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">{order?.order_number}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              order?.payment_status === 'paid_online' ?'bg-emerald-100 text-emerald-700' :'bg-slate-100 text-slate-600'
            }`}>
              {order?.payment_status === 'paid_online' ? 'Pagado online' : 'Pagar al retirar'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {order?.customer_name} · {order?.created_at ? new Date(order.created_at)?.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : ''}
          </p>
        </div>
        {countdown && (
          <div className={`text-right ${countdown?.red ? 'text-red-600' : 'text-muted-foreground'}`}>
            <div className="flex items-center gap-1">
              <Icon name="Clock" size={12} />
              <span className={`text-xs font-semibold ${countdown?.red ? 'text-red-600' : ''}`}>{countdown?.text}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {order?.pickup_slot ? new Date(order.pickup_slot)?.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : ''}
            </p>
          </div>
        )}
      </div>
      {/* Items */}
      <div className="space-y-1">
        {visibleItems?.map((item, i) => (
          <div key={i} className="flex justify-between text-xs">
            <span className="text-foreground">{item?.quantity}× {item?.item_name}</span>
            <span className="text-muted-foreground">${item?.subtotal?.toFixed(2)}</span>
          </div>
        ))}
        {extraCount > 0 && <p className="text-xs text-muted-foreground">+{extraCount} más</p>}
      </div>
      {/* Total */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <span className="text-sm font-bold text-foreground">${order?.total?.toFixed(2)}</span>
        <div className="flex items-center gap-1.5">
          <button onClick={() => onViewDetail?.(order)} className="text-xs px-2 py-1 border border-border rounded-lg hover:bg-muted/50 text-foreground">
            Ver detalle
          </button>
          {['pending', 'confirmed', 'ready']?.includes(order?.order_status) && (
            <button onClick={() => onCancel?.(order)} className="text-xs px-2 py-1 border border-red-200 text-red-600 rounded-lg hover:bg-red-50">
              Cancelar
            </button>
          )}
          {statusCfg?.action && (
            <button onClick={() => onAction?.(order)} className={`text-xs px-3 py-1 rounded-lg font-medium flex items-center gap-1 ${statusCfg?.actionClass}`}>
              <Icon name={statusCfg?.actionIcon} size={12} />
              {statusCfg?.action}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
