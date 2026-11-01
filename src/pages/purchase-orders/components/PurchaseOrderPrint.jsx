import React, { useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useCurrency } from '../../../contexts/CurrencyContext';

const STATUS_LABELS = {
  draft: 'Borrador', sent: 'Enviado', in_process: 'En proceso',
  received_partial: 'Recibido parcial', received_complete: 'Recibido completo',
  paid: 'Pagado', pending_payment: 'Pendiente de pago', cancelled: 'Cancelado'
};

const PurchaseOrderPrint = ({ order, onClose }) => {
  const { formatPrice, currencySettings } = useCurrency();
  const printRef = useRef();
  const showTaxInOrders = currencySettings?.taxSettings?.showTaxInOrders ?? true;
  const taxRate = currencySettings?.taxRate ?? 16;
  const taxLabel = currencySettings?.taxSettings?.taxLabel || 'IVA';
  const taxIncluded = currencySettings?.taxSettings?.taxIncludedInPrice ?? true;

  const subtotal = order?.order_items?.reduce((s, i) => s + (i?.unit_cost || 0) * (i?.quantity || 0), 0) || order?.total_amount || 0;
  const taxAmount = taxIncluded
    ? subtotal - subtotal / (1 + taxRate / 100)
    : subtotal * (taxRate / 100);
  const baseAmount = taxIncluded ? subtotal - taxAmount : subtotal;
  const total = taxIncluded ? subtotal : subtotal + taxAmount;

  const handlePrint = () => {
    const content = printRef?.current?.innerHTML;
    const win = window.open('', '_blank');
    win?.document?.write(`
      <html><head><title>Pedido ${order?.order_number}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
        th { background: #f5f5f5; font-weight: 600; }
        .header { display: flex; justify-content: space-between; margin-bottom: 24px; }
        .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 16px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; background: #e5e7eb; }
        @media print { button { display: none; } }
      </style></head><body>${content}</body></html>
    `);
    win?.document?.close();
    win?.print();
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-lg p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Pedido de Compra</h2>
        <div className="flex gap-2">
          <Button variant="default" onClick={handlePrint} iconName="Printer" iconPosition="left">Imprimir</Button>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><Icon name="X" size={20} /></button>
        </div>
      </div>
      <div ref={printRef}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">PEDIDO DE COMPRA</h1>
            <p className="text-lg font-semibold text-primary">{order?.order_number}</p>
            <p className="text-sm text-muted-foreground">Fecha: {new Date(order?.created_at)?.toLocaleDateString('es-MX')}</p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 bg-muted rounded-full text-sm font-medium">{STATUS_LABELS?.[order?.status] || order?.status}</span>
            {order?.is_auto_generated && (
              <p className="text-xs text-orange-600 mt-1 flex items-center gap-1 justify-end">
                <Icon name="Zap" size={12} /> Generado automáticamente
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Proveedor</h3>
            <p className="font-medium text-foreground">{order?.supplier_name}</p>
            {order?.supplier_email && <p className="text-sm text-muted-foreground">{order?.supplier_email}</p>}
            {order?.supplier_phone && <p className="text-sm text-muted-foreground">{order?.supplier_phone}</p>}
          </div>
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Entrega</h3>
            <p className="text-sm text-foreground">
              Fecha esperada: {order?.expected_delivery_date ? new Date(order?.expected_delivery_date)?.toLocaleDateString('es-MX') : 'No especificada'}
            </p>
            {order?.notes && <p className="text-sm text-muted-foreground mt-1">{order?.notes}</p>}
          </div>
        </div>

        <table className="w-full border border-border rounded-lg overflow-hidden mb-4">
          <thead>
            <tr className="bg-muted">
              <th className="text-left p-3 text-sm font-semibold text-foreground">Producto</th>
              <th className="text-left p-3 text-sm font-semibold text-foreground">SKU</th>
              <th className="text-center p-3 text-sm font-semibold text-foreground">Cantidad</th>
              <th className="text-right p-3 text-sm font-semibold text-foreground">Costo unitario</th>
              <th className="text-right p-3 text-sm font-semibold text-foreground">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order?.order_items?.map((item, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                <td className="p-3 text-sm text-foreground">{item?.product_name}</td>
                <td className="p-3 text-sm text-muted-foreground">{item?.sku || '—'}</td>
                <td className="p-3 text-sm text-center text-foreground">{item?.quantity}</td>
                <td className="p-3 text-sm text-right text-foreground">{formatPrice(item?.unit_cost || 0)}</td>
                <td className="p-3 text-sm text-right font-semibold text-foreground">{formatPrice((item?.unit_cost || 0) * (item?.quantity || 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 min-w-56 space-y-2">
            {showTaxInOrders ? (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Subtotal (sin {taxLabel}):</span>
                  <span className="font-medium text-foreground">{formatPrice(baseAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{taxLabel} ({taxRate}%):</span>
                  <span className="font-medium text-foreground">{formatPrice(taxAmount)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-primary/20 pt-2">
                  <span className="text-sm text-muted-foreground">Total del pedido:</span>
                  <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total del pedido:</span>
                <span className="text-xl font-bold text-primary">{formatPrice(order?.total_amount || 0)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderPrint;
