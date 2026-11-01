import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

import BusinessSelector from '../../../components/BusinessSelector';
import Icon from '../../../components/AppIcon';

const GiftCardForm = ({ card = null, onSave, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    businessId: 'all',
    code: '',
    initialValue: '',
    recipientName: '',
    recipientEmail: '',
    recipientPhone: '',
    expiryDate: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (card) {
      setFormData({
        businessId: card?.businessId || 'all',
        code: card?.code || '',
        initialValue: card?.initialValue || '',
        recipientName: card?.recipientName || '',
        recipientEmail: card?.recipientEmail || '',
        recipientPhone: card?.recipientPhone || '',
        expiryDate: card?.expiryDate ? new Date(card?.expiryDate)?.toISOString()?.split('T')?.[0] : '',
        notes: card?.notes || ''
      });
    } else {
      // Generate random code for new cards
      const generateCode = () => {
        const year = new Date()?.getFullYear();
        const random = Math.random()?.toString(36)?.substr(2, 6)?.toUpperCase();
        return `GC-${year}-${random}`;
      };
      setFormData(prev => ({
        ...prev,
        code: generateCode(),
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)?.toISOString()?.split('T')?.[0]
      }));
    }
  }, [card]);

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

    if (!formData?.code?.trim()) {
      newErrors.code = 'El código es obligatorio';
    }

    if (!formData?.initialValue || formData?.initialValue <= 0) {
      newErrors.initialValue = 'El valor debe ser mayor a 0';
    }

    if (!formData?.recipientName?.trim()) {
      newErrors.recipientName = 'El nombre del destinatario es obligatorio';
    }

    if (formData?.recipientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.recipientEmail)) {
      newErrors.recipientEmail = 'Email inválido';
    }

    if (!formData?.expiryDate) {
      newErrors.expiryDate = 'La fecha de expiración es obligatoria';
    } else if (new Date(formData?.expiryDate) <= new Date()) {
      newErrors.expiryDate = 'La fecha de expiración debe ser futura';
    }

    if (formData?.businessId === 'all') {
      newErrors.businessId = 'Debes seleccionar un negocio específico';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    if (validateForm()) {
      const cardData = {
        ...formData,
        initialValue: parseFloat(formData?.initialValue),
        currentBalance: card ? card?.currentBalance : parseFloat(formData?.initialValue),
        status: card ? card?.status : 'active',
        issuedDate: card ? card?.issuedDate : new Date()?.toISOString()?.split('T')?.[0]
      };
      onSave(cardData);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {card ? 'Editar Tarjeta de Regalo' : 'Nueva Tarjeta de Regalo'}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {card ? 'Actualiza la información de la tarjeta' : 'Completa los datos para emitir una nueva tarjeta'}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <Icon name="X" size={20} />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Selector */}
        <BusinessSelector
          value={formData?.businessId}
          onChange={(value) => handleInputChange('businessId', value)}
          error={errors?.businessId}
          required
        />

        {/* Code and Value */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Código de Tarjeta"
            value={formData?.code}
            onChange={(e) => handleInputChange('code', e?.target?.value)}
            error={errors?.code}
            required
            placeholder="GC-2024-XXXXXX"
          />

          <Input
            label="Valor Inicial (€)"
            type="number"
            step="0.01"
            min="0"
            value={formData?.initialValue}
            onChange={(e) => handleInputChange('initialValue', e?.target?.value)}
            error={errors?.initialValue}
            required
            placeholder="50.00"
          />
        </div>

        {/* Recipient Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Información del Destinatario</h3>
          
          <Input
            label="Nombre Completo"
            value={formData?.recipientName}
            onChange={(e) => handleInputChange('recipientName', e?.target?.value)}
            error={errors?.recipientName}
            required
            placeholder="María García"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData?.recipientEmail}
              onChange={(e) => handleInputChange('recipientEmail', e?.target?.value)}
              error={errors?.recipientEmail}
              placeholder="maria@email.com"
            />

            <Input
              label="Teléfono"
              type="tel"
              value={formData?.recipientPhone}
              onChange={(e) => handleInputChange('recipientPhone', e?.target?.value)}
              error={errors?.recipientPhone}
              placeholder="+34 612 345 678"
            />
          </div>
        </div>

        {/* Expiry Date */}
        <Input
          label="Fecha de Expiración"
          type="date"
          value={formData?.expiryDate}
          onChange={(e) => handleInputChange('expiryDate', e?.target?.value)}
          error={errors?.expiryDate}
          required
          description="La tarjeta expirará automáticamente en esta fecha"
        />

        {/* Notes */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Notas
          </label>
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData?.notes}
            onChange={(e) => handleInputChange('notes', e?.target?.value)}
            placeholder="Información adicional sobre esta tarjeta de regalo..."
            rows={3}
          />
        </div>

        {/* Preview */}
        {formData?.initialValue > 0 && (
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-2">Vista Previa</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{formData?.code}</p>
                <p className="text-xs text-muted-foreground">{formData?.recipientName}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  €{parseFloat(formData?.initialValue || 0)?.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Valor inicial</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            iconName="Save"
            iconPosition="left"
          >
            {card ? 'Actualizar Tarjeta' : 'Crear Tarjeta'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GiftCardForm;