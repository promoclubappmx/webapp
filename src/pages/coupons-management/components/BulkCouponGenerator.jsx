import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const BulkCouponGenerator = ({ onGenerate, onClose, isLoading = false }) => {
  const [formData, setFormData] = useState({
    quantity: 10,
    prefix: 'BULK',
    discountType: 'percentage',
    discountValue: 10,
    usageLimit: 1,
    minPurchaseAmount: '',
    validFrom: new Date()?.toISOString()?.split('T')?.[0],
    validUntil: '',
    customerSegment: 'all',
    isFirstTimeOnly: false,
    codeLength: 8
  });

  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState([]);

  const discountTypeOptions = [
    { value: 'percentage', label: 'Porcentaje (%)' },
    { value: 'fixed', label: 'Cantidad Fija (€)' }
  ];

  const customerSegmentOptions = [
    { value: 'all', label: 'Todos los clientes' },
    { value: 'new', label: 'Nuevos clientes' },
    { value: 'returning', label: 'Clientes recurrentes' },
    { value: 'vip', label: 'Clientes VIP' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const generatePreview = () => {
    const codes = [];
    for (let i = 0; i < Math.min(formData?.quantity, 5); i++) {
      const randomPart = Math.random()?.toString(36)?.substring(2, formData?.codeLength - formData?.prefix?.length)?.toUpperCase();
      codes?.push(`${formData?.prefix}${randomPart}`);
    }
    setPreview(codes);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.quantity || formData?.quantity < 1) {
      newErrors.quantity = 'La cantidad debe ser mayor a 0';
    } else if (formData?.quantity > 1000) {
      newErrors.quantity = 'La cantidad máxima es 1000 cupones';
    }

    if (!formData?.prefix?.trim()) {
      newErrors.prefix = 'El prefijo es obligatorio';
    } else if (formData?.prefix?.length > 6) {
      newErrors.prefix = 'El prefijo no puede tener más de 6 caracteres';
    }

    if (!formData?.discountValue || formData?.discountValue <= 0) {
      newErrors.discountValue = 'El valor del descuento debe ser mayor a 0';
    }

    if (formData?.discountType === 'percentage' && formData?.discountValue > 100) {
      newErrors.discountValue = 'El porcentaje no puede ser mayor a 100%';
    }

    if (!formData?.validFrom) {
      newErrors.validFrom = 'La fecha de inicio es obligatoria';
    }

    if (!formData?.validUntil) {
      newErrors.validUntil = 'La fecha de fin es obligatoria';
    }

    if (formData?.validFrom && formData?.validUntil && new Date(formData.validFrom) >= new Date(formData.validUntil)) {
      newErrors.validUntil = 'La fecha de fin debe ser posterior a la de inicio';
    }

    if (formData?.codeLength < 6 || formData?.codeLength > 12) {
      newErrors.codeLength = 'La longitud del código debe estar entre 6 y 12 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onGenerate(formData);
    }
  };

  React.useEffect(() => {
    generatePreview();
  }, [formData?.prefix, formData?.codeLength, formData?.quantity]);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Generación Masiva de Cupones</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Icon name="X" size={20} />
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Generation Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Configuración de Generación</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Cantidad de Cupones"
              type="number"
              placeholder="10"
              value={formData?.quantity}
              onChange={(e) => handleInputChange('quantity', parseInt(e?.target?.value) || '')}
              error={errors?.quantity}
              min="1"
              max="1000"
              required
            />

            <Input
              label="Prefijo del Código"
              type="text"
              placeholder="BULK"
              value={formData?.prefix}
              onChange={(e) => handleInputChange('prefix', e?.target?.value?.toUpperCase())}
              error={errors?.prefix}
              maxLength="6"
              required
            />

            <Input
              label="Longitud del Código"
              type="number"
              placeholder="8"
              value={formData?.codeLength}
              onChange={(e) => handleInputChange('codeLength', parseInt(e?.target?.value) || '')}
              error={errors?.codeLength}
              min="6"
              max="12"
              required
            />
          </div>

          {/* Code Preview */}
          {preview?.length > 0 && (
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">Vista Previa de Códigos</h4>
              <div className="flex flex-wrap gap-2">
                {preview?.map((code, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary/10 text-primary text-sm font-mono rounded border"
                  >
                    {code}
                  </span>
                ))}
                {formData?.quantity > 5 && (
                  <span className="px-2 py-1 text-muted-foreground text-sm">
                    ... y {formData?.quantity - 5} más
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Discount Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Configuración del Descuento</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Tipo de Descuento"
              options={discountTypeOptions}
              value={formData?.discountType}
              onChange={(value) => handleInputChange('discountType', value)}
              required
            />

            <Input
              label={`Valor del Descuento ${formData?.discountType === 'percentage' ? '(%)' : '(€)'}`}
              type="number"
              placeholder={formData?.discountType === 'percentage' ? '10' : '5.00'}
              value={formData?.discountValue}
              onChange={(e) => handleInputChange('discountValue', parseFloat(e?.target?.value) || '')}
              error={errors?.discountValue}
              min="0"
              max={formData?.discountType === 'percentage' ? '100' : undefined}
              step={formData?.discountType === 'percentage' ? '1' : '0.01'}
              required
            />
          </div>

          <Input
            label="Compra Mínima (€)"
            type="number"
            placeholder="0.00"
            value={formData?.minPurchaseAmount}
            onChange={(e) => handleInputChange('minPurchaseAmount', parseFloat(e?.target?.value) || '')}
            min="0"
            step="0.01"
            description="Deja en blanco para no requerir compra mínima"
          />
        </div>

        {/* Usage Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Configuración de Uso</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Usos por Cupón"
              type="number"
              placeholder="1"
              value={formData?.usageLimit}
              onChange={(e) => handleInputChange('usageLimit', parseInt(e?.target?.value) || '')}
              min="1"
              description="Número de veces que cada cupón puede ser usado"
            />

            <Select
              label="Segmento de Clientes"
              options={customerSegmentOptions}
              value={formData?.customerSegment}
              onChange={(value) => handleInputChange('customerSegment', value)}
            />
          </div>

          <Checkbox
            label="Solo para primeras compras"
            checked={formData?.isFirstTimeOnly}
            onChange={(e) => handleInputChange('isFirstTimeOnly', e?.target?.checked)}
            description="Los cupones solo pueden ser usados por clientes nuevos"
          />
        </div>

        {/* Validity Period */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Período de Validez</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Válido Desde"
              type="date"
              value={formData?.validFrom}
              onChange={(e) => handleInputChange('validFrom', e?.target?.value)}
              error={errors?.validFrom}
              required
            />

            <Input
              label="Válido Hasta"
              type="date"
              value={formData?.validUntil}
              onChange={(e) => handleInputChange('validUntil', e?.target?.value)}
              error={errors?.validUntil}
              required
            />
          </div>
        </div>

        {/* Summary */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <h4 className="font-medium text-foreground mb-2">Resumen de Generación</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Cupones a generar:</span>
              <span className="font-medium text-foreground ml-2">{formData?.quantity}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Descuento:</span>
              <span className="font-medium text-foreground ml-2">
                {formData?.discountType === 'percentage' ? `${formData?.discountValue}%` : `€${formData?.discountValue}`}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Usos totales:</span>
              <span className="font-medium text-foreground ml-2">
                {formData?.quantity * formData?.usageLimit}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Segmento:</span>
              <span className="font-medium text-foreground ml-2">
                {customerSegmentOptions?.find(opt => opt?.value === formData?.customerSegment)?.label}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-6 border-t border-border">
          <Button
            type="submit"
            loading={isLoading}
            iconName="Zap"
            iconPosition="left"
          >
            Generar {formData?.quantity} Cupones
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BulkCouponGenerator;