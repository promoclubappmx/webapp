import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const AdjustmentModal = ({ item, onSave, onClose }) => {
  const [adjustmentType, setAdjustmentType] = useState('increase');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  const adjustmentTypes = [
    { value: 'increase', label: 'Incrementar', icon: 'Plus', color: 'green' },
    { value: 'decrease', label: 'Disminuir', icon: 'Minus', color: 'red' },
    { value: 'correction', label: 'Corrección', icon: 'Edit', color: 'blue' },
    { value: 'damage', label: 'Daño', icon: 'AlertTriangle', color: 'orange' },
    { value: 'theft', label: 'Robo', icon: 'ShieldAlert', color: 'red' },
    { value: 'return', label: 'Devolución', icon: 'RotateCcw', color: 'purple' }
  ];

  const calculateNewQuantity = () => {
    const qty = parseInt(quantity) || 0;
    if (adjustmentType === 'increase' || adjustmentType === 'return') {
      return item?.stockQuantity + qty;
    } else {
      return Math.max(0, item?.stockQuantity - qty);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!quantity || parseInt(quantity) <= 0) {
      newErrors.quantity = 'Cantidad debe ser mayor a 0';
    }
    if (!reason?.trim()) {
      newErrors.reason = 'Razón es requerida';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors)?.length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      adjustmentType,
      quantityChange: parseInt(quantity),
      previousQuantity: item?.stockQuantity,
      newQuantity: calculateNewQuantity(),
      reason,
      notes
    });
  };

  const newQuantity = calculateNewQuantity();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Ajustar Inventario</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <Icon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Item Info */}
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center gap-4">
              {item?.imageUrl ? (
                <img 
                  src={item?.imageUrl} 
                  alt={item?.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-background rounded-lg flex items-center justify-center">
                  <Icon name="Package" size={24} className="text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{item?.name}</h3>
                <p className="text-sm text-muted-foreground">SKU: {item?.sku}</p>
                <p className="text-sm font-medium text-foreground mt-1">
                  Stock actual: <span className="text-primary">{item?.stockQuantity}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Adjustment Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Tipo de Ajuste <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {adjustmentTypes?.map(type => (
                <button
                  key={type?.value}
                  type="button"
                  onClick={() => setAdjustmentType(type?.value)}
                  className={`p-3 border-2 rounded-lg transition-all ${
                    adjustmentType === type?.value
                      ? `border-${type?.color}-500 bg-${type?.color}-50 dark:bg-${type?.color}-900/20`
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <Icon name={type?.icon} size={20} className="mx-auto mb-1" />
                  <p className="text-sm font-medium">{type?.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <Input
              label="Cantidad"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => {
                setQuantity(e?.target?.value);
                if (errors?.quantity) setErrors({ ...errors, quantity: '' });
              }}
              error={errors?.quantity}
              required
              placeholder="Ingrese la cantidad"
            />
          </div>

          {/* New Quantity Preview */}
          {quantity && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Nuevo stock después del ajuste:</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                    {item?.stockQuantity} → {newQuantity}
                  </p>
                </div>
                <Icon 
                  name={newQuantity > item?.stockQuantity ? 'TrendingUp' : 'TrendingDown'} 
                  size={32} 
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Razón <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => {
                setReason(e?.target?.value);
                if (errors?.reason) setErrors({ ...errors, reason: '' });
              }}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="">Seleccione una razón</option>
              <option value="Reabastecimiento">Reabastecimiento</option>
              <option value="Venta manual">Venta manual</option>
              <option value="Producto dañado">Producto dañado</option>
              <option value="Inventario físico">Inventario físico</option>
              <option value="Devolución de cliente">Devolución de cliente</option>
              <option value="Corrección de error">Corrección de error</option>
              <option value="Otro">Otro</option>
            </select>
            {errors?.reason && (
              <p className="text-sm text-red-500 mt-1">{errors?.reason}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Notas Adicionales
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e?.target?.value)}
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              placeholder="Detalles adicionales sobre el ajuste..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit">
              Guardar Ajuste
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustmentModal;