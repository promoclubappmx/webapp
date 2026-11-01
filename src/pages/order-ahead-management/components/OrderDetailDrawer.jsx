import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const CANCEL_REASONS = [
  'No hay disponibilidad',
  'Horario muy solicitado',
  'Pedido incompleto',
  'Cliente no contactable',
  'Otro',
];

const OrderDetailDrawer = ({ order, isOpen, onClose, onStatusChange, onNotify }) => {
  const [internalNote, setInternalNote] = useState(order?.internal_note || '');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  if (!isOpen || !order) return null;

  const items = order?.order_items || [];
  const history = order?.status_history || [];

  const statusLabel = {
    pending: 'Nuevo',
    confirmed: 'Confirmado',
    ready: 'Listo',
    completed: 'Completado',
    cancelled: 'Cancelado',
  };

  const statusColor = {
    pending: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-amber-100 text-amber-700',
    ready: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{order?.order_number}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor?.[order?.order_status]}`}>
                {statusLabel?.[order?.order_status]}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {order?.created_at ? new Date(order.created_at)?.toLocaleString('es-MX') : ''}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl"><Icon name="X" size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Customer */}
          <div className="bg-muted/30 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cliente</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="User" size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{order?.customer_name}</p>
                {order?.customer_phone && <p className="text-xs text-muted-foreground">{order?.customer_phone}</p>}
              </div>
            </div>
            {order?.customer_notes && (
              <div className="flex items-start gap-2 mt-2">
                <Icon name="MessageSquare" size={14} className="text-muted-foreground mt-0.5" />
                <p className="text-xs text-muted-foreground italic">"{order?.customer_notes}"</p>
              </div>
            )}
          </div>

          {/* Pickup slot */}
          <div className="bg-muted/30 rounded-xl p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Slot de retiro</p>
            <div className="flex items-center gap-2">
              <Icon name="Clock" size={16} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">
                {order?.pickup_slot ? new Date(order.pickup_slot)?.toLocaleString('es-MX', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Sin slot'}
              </span>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Ítems del pedido</p>
            <div className="space-y-2">
              {items?.map((item, i) => (
                <div key={i} className="flex items-start justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm text-foreground">{item?.quantity}× {item?.item_name}</p>
                    {item?.variants && Object.keys(item?.variants)?.length > 0 && (
                      <p className="text-xs text-muted-foreground">{JSON.stringify(item?.variants)}</p>
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground">${item?.subtotal?.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">${order?.subtotal?.toFixed(2)}</span>
              </div>
              {order?.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600">Descuento</span>
                  <span className="text-emerald-600">-${order?.discount_amount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-border">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">${order?.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Status history */}
          {history?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Historial de estados</p>
              <div className="space-y-2">
                {history?.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon name="ArrowRight" size={12} />
                    <span>{statusLabel?.[h?.to_status]}</span>
                    <span>·</span>
                    <span>{h?.created_at ? new Date(h.created_at)?.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    {h?.changed_by && <span className="text-muted-foreground/60">por {h?.changed_by}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Internal note */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Nota interna (solo staff)</label>
            <textarea
              value={internalNote}
              onChange={e => setInternalNote(e?.target?.value)}
              placeholder="Agregar nota interna..."
              rows={3}
              className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onNotify?.(order)} className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted/50">
              <Icon name="Bell" size={16} />
              Notificar cliente
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted/50">
              <Icon name="Printer" size={16} />
              Imprimir ticket
            </button>
          </div>
          {['pending', 'confirmed', 'ready']?.includes(order?.order_status) && (
            <button onClick={() => setShowCancelModal(true)} className="w-full py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50">
              Cancelar pedido
            </button>
          )}
        </div>
      </div>
      {/* Cancel modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-foreground mb-1">Cancelar pedido</h3>
            <p className="text-sm text-muted-foreground mb-4">Selecciona el motivo de cancelación</p>
            <div className="space-y-2 mb-4">
              {CANCEL_REASONS?.map(r => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="cancelReason" value={r} checked={cancelReason === r} onChange={() => setCancelReason(r)} />
                  <span className="text-sm text-foreground">{r}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { onStatusChange?.(order, 'cancelled', cancelReason); setShowCancelModal(false); onClose(); }}
                disabled={!cancelReason}
                className="flex-1 py-2 bg-destructive text-white rounded-xl text-sm font-medium hover:bg-destructive/90 disabled:opacity-50"
              >
                Confirmar cancelación
              </button>
              <button onClick={() => setShowCancelModal(false)} className="flex-1 py-2 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted/50">
                Volver
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderDetailDrawer;
