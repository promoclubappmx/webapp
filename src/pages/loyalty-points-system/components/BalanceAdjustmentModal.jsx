import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const BalanceAdjustmentModal = ({ isOpen, onClose, customer, onAdjustBalance }) => {
  const [adjustmentData, setAdjustmentData] = useState({
    type: 'add',
    amount: '',
    reason: '',
    category: 'manual',
    requiresApproval: false
  });

  const adjustmentTypes = [
    { value: 'add', label: 'Agregar Puntos' },
    { value: 'subtract', label: 'Restar Puntos' },
    { value: 'set', label: 'Establecer Balance' }
  ];

  const categories = [
    { value: 'manual', label: 'Ajuste Manual' },
    { value: 'correction', label: 'Corrección' },
    { value: 'compensation', label: 'Compensación' },
    { value: 'promotion', label: 'Promoción Especial' },
    { value: 'refund', label: 'Reembolso' }
  ];

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    const adjustment = {
      customerId: customer?.id,
      type: adjustmentData?.type,
      amount: parseInt(adjustmentData?.amount),
      reason: adjustmentData?.reason,
      category: adjustmentData?.category,
      timestamp: new Date()?.toISOString(),
      requiresApproval: adjustmentData?.requiresApproval
    };

    onAdjustBalance(adjustment);
    onClose();
    
    // Reset form
    setAdjustmentData({
      type: 'add',
      amount: '',
      reason: '',
      category: 'manual',
      requiresApproval: false
    });
  };

  const updateField = (field, value) => {
    setAdjustmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getNewBalance = () => {
    const amount = parseInt(adjustmentData?.amount) || 0;
    const currentBalance = customer?.points || 0;
    
    switch (adjustmentData?.type) {
      case 'add':
        return currentBalance + amount;
      case 'subtract':
        return Math.max(0, currentBalance - amount);
      case 'set':
        return amount;
      default:
        return currentBalance;
    }
  };

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Ajustar Balance</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              iconName="X"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-primary">
                  {customer?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-foreground">{customer?.name}</p>
                <p className="text-sm text-muted-foreground">
                  Balance actual: {customer?.points?.toLocaleString()} puntos
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Select
              label="Tipo de Ajuste"
              options={adjustmentTypes}
              value={adjustmentData?.type}
              onChange={(value) => updateField('type', value)}
              required
            />

            <Input
              label={adjustmentData?.type === 'set' ? 'Nuevo Balance' : 'Cantidad de Puntos'}
              type="number"
              value={adjustmentData?.amount}
              onChange={(e) => updateField('amount', e?.target?.value)}
              min="0"
              required
            />

            <Select
              label="Categoría"
              options={categories}
              value={adjustmentData?.category}
              onChange={(value) => updateField('category', value)}
            />

            <Input
              label="Motivo del Ajuste"
              value={adjustmentData?.reason}
              onChange={(e) => updateField('reason', e?.target?.value)}
              placeholder="Describe el motivo del ajuste..."
              required
            />

            {adjustmentData?.amount && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Balance actual:</span>
                  <span className="font-medium">{customer?.points?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Nuevo balance:</span>
                  <span className="font-semibold text-foreground">
                    {getNewBalance()?.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Diferencia:</span>
                  <span className={`font-medium ${
                    getNewBalance() > customer?.points ? 'text-success' : 'text-destructive'
                  }`}>
                    {getNewBalance() > customer?.points ? '+' : ''}
                    {(getNewBalance() - customer?.points)?.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3 mt-6">
            <Button type="submit" iconName="Save" className="flex-1">
              Aplicar Ajuste
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BalanceAdjustmentModal;