import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BatchCaptureModal = ({ item, onSave, onClose }) => {
  const [form, setForm] = useState({
    batch_number: item?.batch_number || '',
    manufacture_date: item?.manufacture_date || '',
    expiry_date: item?.expiry_date || '',
    location_in_warehouse: item?.location_in_warehouse || ''
  });

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  const today = new Date()?.toISOString()?.split('T')?.[0];

  const isExpiringSoon = form?.expiry_date && (() => {
    const expiry = new Date(form.expiry_date);
    const daysUntilExpiry = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
  })();

  const isExpired = form?.expiry_date && new Date(form.expiry_date) < new Date();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon name="Package" size={18} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Información de Lote</h3>
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{item?.product_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Número de Lote
            </label>
            <input
              type="text"
              value={form?.batch_number}
              onChange={e => setForm(p => ({ ...p, batch_number: e?.target?.value }))}
              placeholder="Ej: LOT-2024-001"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Fecha de Fabricación
              </label>
              <input
                type="date"
                value={form?.manufacture_date}
                max={today}
                onChange={e => setForm(p => ({ ...p, manufacture_date: e?.target?.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Fecha de Caducidad
              </label>
              <input
                type="date"
                value={form?.expiry_date}
                onChange={e => setForm(p => ({ ...p, expiry_date: e?.target?.value }))}
                className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:border-primary ${
                  isExpired ? 'border-red-400 bg-red-50 focus:ring-red-200' : isExpiringSoon ?'border-orange-400 bg-orange-50 focus:ring-orange-200': 'border-border focus:ring-primary/20'
                }`}
              />
              {isExpired && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <Icon name="AlertTriangle" size={11} /> Producto VENCIDO
                </p>
              )}
              {isExpiringSoon && !isExpired && (
                <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                  <Icon name="AlertCircle" size={11} /> Caduca en menos de 90 días
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Ubicación en Almacén
            </label>
            <input
              type="text"
              value={form?.location_in_warehouse}
              onChange={e => setForm(p => ({ ...p, location_in_warehouse: e?.target?.value }))}
              placeholder="Ej: Pasillo A, Estante 3, Nivel 2"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Summary */}
          {(form?.batch_number || form?.expiry_date) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-700 mb-1">Resumen del lote:</p>
              <div className="space-y-0.5">
                {form?.batch_number && <p className="text-xs text-blue-600">Lote: {form?.batch_number}</p>}
                {form?.manufacture_date && <p className="text-xs text-blue-600">Fabricación: {new Date(form.manufacture_date + 'T00:00:00')?.toLocaleDateString('es-MX')}</p>}
                {form?.expiry_date && <p className="text-xs text-blue-600">Caducidad: {new Date(form.expiry_date + 'T00:00:00')?.toLocaleDateString('es-MX')}</p>}
                {form?.location_in_warehouse && <p className="text-xs text-blue-600">Ubicación: {form?.location_in_warehouse}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-5 border-t border-border">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button onClick={handleSave} className="flex-1">
            <Icon name="Check" size={14} className="mr-1" />
            Guardar Lote
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BatchCaptureModal;
