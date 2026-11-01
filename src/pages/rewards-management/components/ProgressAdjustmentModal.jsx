import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ProgressAdjustmentModal = ({ isOpen, onClose, customer, onSave }) => {
  const [adjustmentData, setAdjustmentData] = useState({
    type: 'add',
    value: '',
    reason: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setAdjustmentData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!adjustmentData?.value || adjustmentData?.value <= 0) {
      newErrors.value = 'El valor debe ser mayor a 0';
    }
    if (!adjustmentData?.reason?.trim()) {
      newErrors.reason = 'La razón es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      const adjustment = {
        customerId: customer?.id,
        type: adjustmentData?.type,
        value: parseFloat(adjustmentData?.value),
        reason: adjustmentData?.reason,
        notes: adjustmentData?.notes,
        timestamp: new Date()?.toISOString(),
        adminId: 'current-admin-id' // This would come from auth context
      };
      
      onSave(adjustment);
      onClose();
      setAdjustmentData({
        type: 'add',
        value: '',
        reason: '',
        notes: ''
      });
      setErrors({});
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount);
  };

  const calculateNewValue = () => {
    if (!adjustmentData?.value) return customer?.currentValue || 0;
    
    const adjustmentValue = parseFloat(adjustmentData?.value);
    const currentValue = customer?.currentValue || 0;
    
    if (adjustmentData?.type === 'add') {
      return currentValue + adjustmentValue;
    } else if (adjustmentData?.type === 'subtract') {
      return Math.max(0, currentValue - adjustmentValue);
    } else {
      return adjustmentValue;
    }
  };

  if (!isOpen || !customer) return null;

  const newValue = calculateNewValue();
  const progress = (newValue / customer?.targetValue) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Ajustar Progreso</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="p-6">
          {/* Customer Info */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="User" size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{customer?.name}</h3>
                <p className="text-sm text-muted-foreground">{customer?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Valor Actual:</span>
                <p className="font-medium text-foreground">
                  {customer?.rewardType === 'amount' 
                    ? formatCurrency(customer?.currentValue)
                    : `${customer?.currentValue} visitas`
                  }
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Objetivo:</span>
                <p className="font-medium text-foreground">
                  {customer?.rewardType === 'amount' 
                    ? formatCurrency(customer?.targetValue)
                    : `${customer?.targetValue} visitas`
                  }
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tipo de Ajuste
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="type"
                    value="add"
                    checked={adjustmentData?.type === 'add'}
                    onChange={(e) => handleInputChange('type', e?.target?.value)}
                    className="text-primary"
                  />
                  <span className="text-sm text-foreground">Agregar</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="type"
                    value="subtract"
                    checked={adjustmentData?.type === 'subtract'}
                    onChange={(e) => handleInputChange('type', e?.target?.value)}
                    className="text-primary"
                  />
                  <span className="text-sm text-foreground">Restar</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="type"
                    value="set"
                    checked={adjustmentData?.type === 'set'}
                    onChange={(e) => handleInputChange('type', e?.target?.value)}
                    className="text-primary"
                  />
                  <span className="text-sm text-foreground">Establecer valor</span>
                </label>
              </div>
            </div>

            <Input
              label={customer?.rewardType === 'amount' ? 'Valor (€)' : 'Número de visitas'}
              type="number"
              placeholder="0"
              value={adjustmentData?.value}
              onChange={(e) => handleInputChange('value', e?.target?.value)}
              error={errors?.value}
              required
              min="0"
              step={customer?.rewardType === 'amount' ? '0.01' : '1'}
            />

            <Input
              label="Razón del Ajuste"
              type="text"
              placeholder="Ej: Corrección por error del sistema"
              value={adjustmentData?.reason}
              onChange={(e) => handleInputChange('reason', e?.target?.value)}
              error={errors?.reason}
              required
            />

            <Input
              label="Notas Adicionales (opcional)"
              type="text"
              placeholder="Información adicional sobre el ajuste"
              value={adjustmentData?.notes}
              onChange={(e) => handleInputChange('notes', e?.target?.value)}
            />

            {/* Preview */}
            {adjustmentData?.value && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">Vista Previa del Cambio</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor actual:</span>
                    <span className="text-foreground">
                      {customer?.rewardType === 'amount' 
                        ? formatCurrency(customer?.currentValue)
                        : `${customer?.currentValue} visitas`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nuevo valor:</span>
                    <span className="font-medium text-foreground">
                      {customer?.rewardType === 'amount' 
                        ? formatCurrency(newValue)
                        : `${newValue} visitas`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nuevo progreso:</span>
                    <span className={`font-medium ${progress >= 100 ? 'text-success' : 'text-foreground'}`}>
                      {Math.min(progress, 100)?.toFixed(1)}%
                      {progress >= 100 && ' (¡Completado!)'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" iconName="Save" iconPosition="left">
                Guardar Ajuste
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProgressAdjustmentModal;