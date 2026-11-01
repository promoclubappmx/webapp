import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { useCurrency } from '../../../contexts/CurrencyContext';

const REJECTION_REASONS = [
  'Producto dañado',
  'Fecha de caducidad vencida o próxima',
  'Cantidad incorrecta',
  'Producto incorrecto',
  'Calidad insuficiente',
  'Empaque deteriorado',
  'Sin etiqueta o código',
  'Otro'
];

const ReceiptItemRow = ({ item, index, onChange, onOpenBatch }) => {
  const { formatPrice } = useCurrency();
  const [showRejection, setShowRejection] = useState(item?.quantity_rejected > 0);

  const handleChange = (field, value) => {
    const updated = { ...item, [field]: value };
    if (field === 'quantity_received') {
      const received = parseFloat(value) || 0;
      const ordered = parseFloat(item?.quantity_ordered) || 0;
      const rejected = Math.max(0, ordered - received);
      updated.quantity_rejected = rejected;
      if (rejected > 0) setShowRejection(true);
    }
    if (field === 'quantity_rejected') {
      const rejected = parseFloat(value) || 0;
      if (rejected > 0) setShowRejection(true);
      else setShowRejection(false);
    }
    onChange(index, updated);
  };

  const qualityColors = {
    pending: 'bg-gray-100 text-gray-600',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    partial: 'bg-orange-100 text-orange-700'
  };

  const received = parseFloat(item?.quantity_received) || 0;
  const ordered = parseFloat(item?.quantity_ordered) || 0;
  const rejected = parseFloat(item?.quantity_rejected) || 0;
  const receiptPct = ordered > 0 ? Math.min(100, Math.round((received / ordered) * 100)) : 0;

  return (
    <div className="border border-border rounded-xl p-4 bg-card hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">#{index + 1}</span>
            <h4 className="font-semibold text-foreground text-sm truncate">{item?.product_name}</h4>
            {item?.sku && <span className="text-xs text-muted-foreground">SKU: {item?.sku}</span>}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground">Pedido: <strong>{ordered}</strong> uds</span>
            <span className="text-xs text-muted-foreground">Costo: {formatPrice(item?.unit_cost || 0)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${qualityColors?.[item?.quality_status] || qualityColors?.pending}`}>
            {item?.quality_status === 'approved' ? 'Aprobado' :
             item?.quality_status === 'rejected' ? 'Rechazado' :
             item?.quality_status === 'partial' ? 'Parcial' : 'Pendiente'}
          </span>
        </div>
      </div>
      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Recepción: {receiptPct}%</span>
          <span>{received}/{ordered} uds</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${receiptPct === 100 ? 'bg-green-500' : receiptPct > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}
            style={{ width: `${receiptPct}%` }}
          />
        </div>
      </div>
      {/* Quantity inputs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Cant. Recibida *</label>
          <input
            type="number"
            min="0"
            max={ordered}
            step="0.01"
            value={item?.quantity_received ?? ''}
            onChange={e => handleChange('quantity_received', e?.target?.value)}
            className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Cant. Rechazada</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={item?.quantity_rejected ?? ''}
            onChange={e => handleChange('quantity_rejected', e?.target?.value)}
            className="w-full px-2.5 py-1.5 border border-red-200 rounded-lg bg-red-50/50 text-foreground text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Estado calidad</label>
          <select
            value={item?.quality_status || 'pending'}
            onChange={e => handleChange('quality_status', e?.target?.value)}
            className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm"
          >
            <option value="pending">Pendiente</option>
            <option value="approved">Aprobado</option>
            <option value="partial">Parcial</option>
            <option value="rejected">Rechazado</option>
          </select>
        </div>
      </div>
      {/* Rejection reason */}
      {(showRejection || rejected > 0) && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-red-600 mb-1">Motivo de rechazo *</label>
          <select
            value={item?.rejection_reason || ''}
            onChange={e => handleChange('rejection_reason', e?.target?.value)}
            className="w-full px-2.5 py-1.5 border border-red-200 rounded-lg bg-red-50/30 text-foreground text-sm"
          >
            <option value="">Seleccionar motivo...</option>
            {REJECTION_REASONS?.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      )}
      {/* Batch info & quality notes */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => onOpenBatch(index)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            item?.batch_number
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <Icon name="Package" size={12} />
          {item?.batch_number ? `Lote: ${item?.batch_number}` : 'Capturar lote/caducidad'}
        </button>
        {item?.expiry_date && (
          <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
            <Icon name="Calendar" size={11} />
            Cad: {new Date(item.expiry_date)?.toLocaleDateString('es-MX')}
          </span>
        )}
        {item?.location_in_warehouse && (
          <span className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
            <Icon name="MapPin" size={11} />
            {item?.location_in_warehouse}
          </span>
        )}
      </div>
      {/* Quality notes */}
      <div className="mt-3">
        <input
          type="text"
          value={item?.quality_notes || ''}
          onChange={e => handleChange('quality_notes', e?.target?.value)}
          placeholder="Notas de inspección de calidad..."
          className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>
    </div>
  );
};

export default ReceiptItemRow;
