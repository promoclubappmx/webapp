import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const STATUS_CONFIG = {
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' },
  in_process: { label: 'En proceso', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  received_partial: { label: 'Recibido parcial', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  received_complete: { label: 'Recibido completo', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  paid: { label: 'Pagado', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  pending_payment: { label: 'Pendiente de pago', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-300' }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr)?.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
};

const formatCurrency = (val) =>
  (val || 0)?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });

const getStatusHistory = (order) => {
  const history = [];
  if (order?.created_at) history?.push({ label: 'Pedido creado', date: order?.created_at, icon: 'FileText', color: 'text-gray-500' });
  if (order?.sent_at) history?.push({ label: 'Pedido enviado al proveedor', date: order?.sent_at, icon: 'Send', color: 'text-blue-500' });
  if (order?.status === 'in_process' && !order?.received_at) history?.push({ label: 'En proceso de recepción', date: null, icon: 'Clock', color: 'text-yellow-500' });
  if (order?.received_at) {
    const label = order?.status === 'received_complete' ? 'Recibido completo' : order?.status === 'received_partial' ? 'Recibido parcial' : 'Recibido';
    history?.push({ label, date: order?.received_at, icon: 'PackageCheck', color: 'text-green-500' });
  }
  if (order?.status === 'paid') history?.push({ label: 'Pago registrado', date: order?.updated_at || order?.received_at, icon: 'CheckCircle', color: 'text-emerald-500' });
  if (order?.status === 'cancelled') history?.push({ label: 'Pedido cancelado', date: order?.updated_at, icon: 'XCircle', color: 'text-red-500' });
  return history;
};

const PurchaseOrderDetailModal = ({ order, onClose, onPrint }) => {
  if (!order) return null;
  const st = STATUS_CONFIG?.[order?.status] || STATUS_CONFIG?.draft;
  const items = order?.order_items || order?.purchase_order_items || [];
  const subtotal = items?.reduce((sum, item) => sum + (parseFloat(item?.subtotal) || parseFloat(item?.unit_cost || 0) * parseFloat(item?.quantity || 0)), 0);
  const taxRate = 0.16;
  const taxes = subtotal * taxRate;
  const total = order?.total_amount || subtotal + taxes;
  const history = getStatusHistory(order);

  return (
    <div className="bg-card rounded-xl shadow-xl w-full max-w-3xl my-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Icon name="FileText" size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground font-mono">{order?.order_number}</h2>
            <p className="text-sm text-muted-foreground">Detalle del Pedido de Compra</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${st?.color}`}>
            <span className={`w-2 h-2 rounded-full ${st?.dot}`} />
            {st?.label}
          </span>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg ml-2"><Icon name="X" size={20} /></button>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[75vh]">
        {/* Supplier Info */}
        <div className="p-6 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Icon name="Building2" size={15} className="text-primary" />
            Información del Proveedor
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-0.5">Proveedor</p>
              <p className="text-sm font-semibold text-foreground">{order?.supplier_name || '-'}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-0.5">Correo electrónico</p>
              <p className="text-sm font-medium text-foreground">{order?.supplier_email || '-'}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-0.5">Teléfono</p>
              <p className="text-sm font-medium text-foreground">{order?.supplier_phone || '-'}</p>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="p-6 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Icon name="Calendar" size={15} className="text-primary" />
            Fechas del Pedido
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-0.5">Fecha de creación</p>
              <p className="text-sm font-medium text-foreground">{formatDate(order?.created_at)}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-0.5">Enviado al proveedor</p>
              <p className="text-sm font-medium text-foreground">{formatDate(order?.sent_at)}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-0.5">Entrega esperada</p>
              <p className={`text-sm font-medium ${
                order?.expected_delivery_date && !['received_complete','paid','cancelled']?.includes(order?.status) && new Date(order?.expected_delivery_date) < new Date()
                  ? 'text-red-600' : 'text-foreground'
              }`}>{formatDate(order?.expected_delivery_date)}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-0.5">Fecha de recepción</p>
              <p className="text-sm font-medium text-foreground">{formatDate(order?.received_at)}</p>
            </div>
          </div>
          {order?.notes && (
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-xs text-blue-600 font-medium mb-0.5">Notas del pedido</p>
              <p className="text-sm text-blue-800">{order?.notes}</p>
            </div>
          )}
        </div>

        {/* Products Table */}
        <div className="p-6 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Icon name="Package" size={15} className="text-primary" />
            Productos del Pedido
            <span className="ml-auto text-xs font-normal text-muted-foreground normal-case">{items?.length} producto(s)</span>
          </h3>
          {items?.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">No hay productos registrados en este pedido</div>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">Producto</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">SKU</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase">Cantidad</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase">Precio Unit.</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items?.map((item, idx) => {
                    const name = item?.product_name || item?.catalog_items?.name || 'Producto';
                    const sku = item?.sku || item?.catalog_items?.sku || '-';
                    const qty = item?.quantity || 0;
                    const unitCost = parseFloat(item?.unit_cost) || 0;
                    const itemSubtotal = parseFloat(item?.subtotal) || unitCost * qty;
                    return (
                      <tr key={idx} className="hover:bg-muted/10">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-foreground">{name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{sku}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-semibold text-foreground">{qty}</span>
                          <span className="text-xs text-muted-foreground ml-1">uds</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-foreground">{formatCurrency(unitCost)}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-semibold text-foreground">{formatCurrency(itemSubtotal)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* Totals */}
              <div className="border-t border-border bg-muted/20">
                <div className="flex justify-end">
                  <div className="w-64 divide-y divide-border">
                    <div className="flex items-center justify-between px-4 py-2">
                      <span className="text-sm text-muted-foreground">Subtotal</span>
                      <span className="text-sm font-medium text-foreground">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2">
                      <span className="text-sm text-muted-foreground">IVA (16%)</span>
                      <span className="text-sm font-medium text-foreground">{formatCurrency(taxes)}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 bg-primary/5">
                      <span className="text-sm font-bold text-foreground">Total</span>
                      <span className="text-base font-bold text-primary">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status History */}
        <div className="p-6">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
            <Icon name="History" size={15} className="text-primary" />
            Historial del Pedido
          </h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-4">
              {history?.map((event, idx) => (
                <div key={idx} className="flex items-start gap-4 relative">
                  <div className={`w-8 h-8 rounded-full bg-card border-2 border-border flex items-center justify-center flex-shrink-0 relative z-10 ${event?.color}`}>
                    <Icon name={event?.icon} size={14} />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm font-medium text-foreground">{event?.label}</p>
                    {event?.date && (
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(event?.date)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-6 border-t border-border bg-muted/10">
        <div className="text-xs text-muted-foreground">
          {order?.is_auto_generated && (
            <span className="flex items-center gap-1 text-yellow-600">
              <Icon name="Zap" size={12} />
              Pedido generado automáticamente
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onPrint && (
            <Button variant="outline" size="sm" onClick={() => onPrint(order)} iconName="Printer" iconPosition="left">
              Imprimir
            </Button>
          )}
          <Button variant="default" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderDetailModal;
