import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const EditRewardModal = ({ isOpen, onClose, onSave, reward }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'count',
    targetValue: '',
    rewardType: 'discount',
    rewardValue: '',
    validityPeriod: '30',
    isActive: true,
    maxRedemptions: '',
    customerLimit: '1'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (reward) {
      const validUntil = new Date(reward.validUntil);
      const today = new Date();
      const validityDays = Math.ceil((validUntil - today) / (1000 * 60 * 60 * 24));

      setFormData({
        name: reward?.name || '',
        description: reward?.description || '',
        type: reward?.type || 'count',
        targetValue: reward?.targetValue?.toString() || '',
        rewardType: reward?.rewardType || 'discount',
        rewardValue: reward?.rewardValue || '',
        validityPeriod: Math.max(1, validityDays)?.toString(),
        isActive: reward?.status === 'active',
        maxRedemptions: reward?.maxRedemptions?.toString() || '',
        customerLimit: reward?.customerLimit?.toString() || '1'
      });
    }
  }, [reward]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
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

    if (!formData?.name?.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    if (!formData?.description?.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }
    if (!formData?.targetValue || formData?.targetValue <= 0) {
      newErrors.targetValue = 'El valor objetivo debe ser mayor a 0';
    }
    if (!formData?.rewardValue?.trim()) {
      newErrors.rewardValue = 'El valor de la recompensa es obligatorio';
    }
    if (!formData?.validityPeriod || formData?.validityPeriod <= 0) {
      newErrors.validityPeriod = 'El período de validez debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      const validUntil = new Date();
      validUntil?.setDate(validUntil?.getDate() + parseInt(formData?.validityPeriod));
      
      const updatedReward = {
        ...reward,
        ...formData,
        targetValue: parseFloat(formData?.targetValue),
        validUntil: validUntil?.toISOString(),
        status: formData?.isActive ? 'active' : 'paused',
        updatedAt: new Date()?.toISOString()
      };
      
      onSave(updatedReward);
      onClose();
      setErrors({});
    }
  };

  const handleClose = () => {
    onClose();
    setErrors({});
  };

  if (!isOpen || !reward) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Editar Recompensa</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Nombre de la Recompensa"
                type="text"
                placeholder="Ej: Café Gratis después de 10 visitas"
                value={formData?.name}
                onChange={(e) => handleInputChange('name', e?.target?.value)}
                error={errors?.name}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label="Descripción"
                type="text"
                placeholder="Describe los beneficios de esta recompensa"
                value={formData?.description}
                onChange={(e) => handleInputChange('description', e?.target?.value)}
                error={errors?.description}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tipo de Objetivo
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="type"
                    value="count"
                    checked={formData?.type === 'count'}
                    onChange={(e) => handleInputChange('type', e?.target?.value)}
                    className="text-primary"
                  />
                  <span className="text-sm text-foreground">Basado en Visitas</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="type"
                    value="amount"
                    checked={formData?.type === 'amount'}
                    onChange={(e) => handleInputChange('type', e?.target?.value)}
                    className="text-primary"
                  />
                  <span className="text-sm text-foreground">Basado en Gasto</span>
                </label>
              </div>
            </div>

            <div>
              <Input
                label={formData?.type === 'count' ? 'Número de Visitas' : 'Monto Total (€)'}
                type="number"
                placeholder={formData?.type === 'count' ? '10' : '100.00'}
                value={formData?.targetValue}
                onChange={(e) => handleInputChange('targetValue', e?.target?.value)}
                error={errors?.targetValue}
                required
                min="1"
                step={formData?.type === 'amount' ? '0.01' : '1'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tipo de Recompensa
              </label>
              <select
                value={formData?.rewardType}
                onChange={(e) => handleInputChange('rewardType', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="discount">Descuento</option>
                <option value="free_item">Producto Gratis</option>
                <option value="points">Puntos de Lealtad</option>
                <option value="exclusive_access">Acceso Exclusivo</option>
              </select>
            </div>

            <div>
              <Input
                label="Valor de la Recompensa"
                type="text"
                placeholder={
                  formData?.rewardType === 'discount' ? '20% de descuento' :
                  formData?.rewardType === 'free_item' ? 'Café gratis' :
                  formData?.rewardType === 'points'? '500 puntos' : 'Acceso VIP'
                }
                value={formData?.rewardValue}
                onChange={(e) => handleInputChange('rewardValue', e?.target?.value)}
                error={errors?.rewardValue}
                required
              />
            </div>

            <div>
              <Input
                label="Período de Validez (días)"
                type="number"
                placeholder="30"
                value={formData?.validityPeriod}
                onChange={(e) => handleInputChange('validityPeriod', e?.target?.value)}
                error={errors?.validityPeriod}
                required
                min="1"
              />
            </div>

            <div>
              <Input
                label="Límite por Cliente"
                type="number"
                placeholder="1"
                value={formData?.customerLimit}
                onChange={(e) => handleInputChange('customerLimit', e?.target?.value)}
                min="1"
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label="Máximo de Canjes (opcional)"
                type="number"
                placeholder="Dejar vacío para ilimitado"
                value={formData?.maxRedemptions}
                onChange={(e) => handleInputChange('maxRedemptions', e?.target?.value)}
                min="1"
              />
            </div>

            <div className="md:col-span-2">
              <Checkbox
                label="Recompensa activa"
                checked={formData?.isActive}
                onChange={(e) => handleInputChange('isActive', e?.target?.checked)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" iconName="Save" iconPosition="left">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRewardModal;