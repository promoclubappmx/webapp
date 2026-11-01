import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import BusinessSelector from '../../../components/BusinessSelector';
import CatalogItemSelector from '../../../components/ui/CatalogItemSelector';
import { useCurrency } from '../../../contexts/CurrencyContext';


const CouponForm = ({ coupon = null, onSave, onCancel, isLoading = false }) => {
  const { formatPrice, currencySettings } = useCurrency();
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchaseAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    usagePerCustomer: '1',
    validFrom: '',
    validUntil: '',
    isActive: true,
    isPublic: true,
    targetAudience: 'all',
    businessId: 'all',
    catalogItemIds: [] // NEW: Selected catalog items
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (coupon) {
      setFormData({
        ...coupon,
        validFrom: coupon?.validFrom ? new Date(coupon.validFrom)?.toISOString()?.split('T')?.[0] : '',
        validUntil: coupon?.validUntil ? new Date(coupon.validUntil)?.toISOString()?.split('T')?.[0] : '',
        businessId: coupon?.businessId || 'all',
        catalogItemIds: coupon?.catalogItemIds || [] // NEW: Load existing selections
      });
    } else {
      // Generate random coupon code for new coupons
      const generateCode = () => {
        return 'COUPON' + Math.random()?.toString(36)?.substr(2, 6)?.toUpperCase();
      };
      setFormData(prev => ({
        ...prev,
        code: generateCode()
      }));
    }
  }, [coupon]);

  const discountTypeOptions = [
    { value: 'percentage', label: 'Porcentaje (%)' },
    { value: 'fixed', label: `Cantidad fija (${currencySettings?.currencySymbol || '$'})` },
    { value: 'free_shipping', label: 'Envío gratis' },
    { value: 'buy_one_get_one', label: '2x1 (Compra 1, lleva 2)' }
  ];

  const targetAudienceOptions = [
    { value: 'all', label: 'Todos los clientes' },
    { value: 'new', label: 'Clientes nuevos' },
    { value: 'returning', label: 'Clientes recurrentes' },
    { value: 'vip', label: 'Clientes VIP' }
  ];

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
    const decimalPlaces = currencySettings?.decimalPlaces ?? 2;
    const decimalRegex = new RegExp(`^\\d+(\\.\\d{0,${decimalPlaces}})?$`);

    if (!formData?.code?.trim()) {
      newErrors.code = 'El código del cupón es obligatorio';
    }

    if (!formData?.title?.trim()) {
      newErrors.title = 'El título es obligatorio';
    }

    if (!formData?.description?.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }

    if (formData?.discountType !== 'free_shipping' && formData?.discountType !== 'buy_one_get_one') {
      if (!formData?.discountValue && formData?.discountValue !== 0) {
        newErrors.discountValue = 'El valor del descuento es obligatorio';
      } else {
        const val = parseFloat(formData?.discountValue);
        if (isNaN(val) || val < 0) {
          newErrors.discountValue = 'El descuento no puede ser negativo';
        } else if (val === 0) {
          newErrors.discountValue = 'El valor del descuento debe ser mayor a 0';
        } else if (formData?.discountType === 'percentage') {
          if (val > 100) newErrors.discountValue = 'El porcentaje no puede ser mayor a 100%';
          if (val < 0.01) newErrors.discountValue = 'El porcentaje mínimo es 0.01%';
          const pctRegex = /^\d+(\.\d{0,2})?$/;
          if (!pctRegex?.test(String(formData?.discountValue))) {
            newErrors.discountValue = 'Máximo 2 decimales para porcentaje';
          }
        } else if (formData?.discountType === 'fixed') {
          if (val < 0.01) newErrors.discountValue = `El monto mínimo es ${formatPrice(0.01)}`;
          if (!decimalRegex?.test(String(formData?.discountValue))) {
            newErrors.discountValue = `Máximo ${decimalPlaces} decimales permitidos`;
          }
        }
      }
    }

    if (formData?.minPurchaseAmount) {
      const minVal = parseFloat(formData?.minPurchaseAmount);
      if (isNaN(minVal) || minVal < 0) {
        newErrors.minPurchaseAmount = 'La compra mínima no puede ser negativa';
      } else if (!decimalRegex?.test(String(formData?.minPurchaseAmount))) {
        newErrors.minPurchaseAmount = `Máximo ${decimalPlaces} decimales permitidos`;
      }
    }

    if (formData?.maxDiscountAmount) {
      const maxVal = parseFloat(formData?.maxDiscountAmount);
      if (isNaN(maxVal) || maxVal < 0) {
        newErrors.maxDiscountAmount = 'El descuento máximo no puede ser negativo';
      } else if (!decimalRegex?.test(String(formData?.maxDiscountAmount))) {
        newErrors.maxDiscountAmount = `Máximo ${decimalPlaces} decimales permitidos`;
      }
    }

    if (!formData?.validFrom) {
      newErrors.validFrom = 'La fecha de inicio es obligatoria';
    }

    if (!formData?.validUntil) {
      newErrors.validUntil = 'La fecha de fin es obligatoria';
    }

    if (formData?.validFrom && formData?.validUntil && new Date(formData.validFrom) >= new Date(formData.validUntil)) {
      newErrors.validUntil = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    if (formData?.usageLimit && formData?.usageLimit <= 0) {
      newErrors.usageLimit = 'El límite de uso debe ser mayor a 0';
    }

    if (!formData?.businessId) {
      newErrors.businessId = 'Selecciona el negocio donde aplicar el cupón';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!validateForm()) return;

    onSave(formData);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          {coupon ? 'Editar Cupón' : 'Nuevo Cupón'}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          iconName="X"
          iconSize={16}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Información Básica</h3>
          
          {/* Business Selector */}
          <BusinessSelector
            label="Aplicar a"
            value={formData?.businessId}
            onChange={(value) => handleInputChange('businessId', value)}
            error={errors?.businessId}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Código del Cupón"
              type="text"
              placeholder="CUPON2024"
              value={formData?.code}
              onChange={(e) => handleInputChange('code', e?.target?.value?.toUpperCase())}
              error={errors?.code}
              required
            />

            <Input
              label="Título del Cupón"
              type="text"
              placeholder="Ej: Descuento especial"
              value={formData?.title}
              onChange={(e) => handleInputChange('title', e?.target?.value)}
              error={errors?.title}
              required
            />
          </div>

          <Input
            label="Descripción"
            type="text"
            placeholder="Describe los términos y condiciones del cupón"
            value={formData?.description}
            onChange={(e) => handleInputChange('description', e?.target?.value)}
            error={errors?.description}
            required
          />
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
            />

            {formData?.discountType !== 'free_shipping' && formData?.discountType !== 'buy_one_get_one' && (
              <Input
                label="Valor del Descuento"
                type="number"
                placeholder={formData?.discountType === 'percentage' ? '10' : '50.00'}
                value={formData?.discountValue}
                onChange={(e) => handleInputChange('discountValue', e?.target?.value)}
                error={errors?.discountValue}
                required
                helperText={formData?.discountType === 'percentage' ? 'Entre 0.01% y 100%' : `Mínimo ${formatPrice(0.01)}`}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={`Compra Mínima (${currencySettings?.currencySymbol || '$'})`}
              type="number"
              placeholder="0.00"
              value={formData?.minPurchaseAmount}
              onChange={(e) => handleInputChange('minPurchaseAmount', e?.target?.value)}
              error={errors?.minPurchaseAmount}
              description="Opcional: monto mínimo para aplicar el cupón"
            />

            {formData?.discountType === 'percentage' && (
              <Input
                label={`Descuento Máximo (${currencySettings?.currencySymbol || '$'})`}
                type="number"
                placeholder="100.00"
                value={formData?.maxDiscountAmount}
                onChange={(e) => handleInputChange('maxDiscountAmount', e?.target?.value)}
                error={errors?.maxDiscountAmount}
                description="Opcional: límite máximo del descuento"
              />
            )}
          </div>
        </div>

        {/* Usage Limits */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Límites de Uso</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Límite Total de Uso"
              type="number"
              placeholder="100"
              value={formData?.usageLimit}
              onChange={(e) => handleInputChange('usageLimit', e?.target?.value)}
              error={errors?.usageLimit}
              description="Opcional: número máximo de veces que se puede usar"
            />

            <Input
              label="Uso por Cliente"
              type="number"
              placeholder="1"
              value={formData?.usagePerCustomer}
              onChange={(e) => handleInputChange('usagePerCustomer', e?.target?.value)}
              description="Máximo de veces que un cliente puede usar este cupón"
            />
          </div>
        </div>

        {/* NEW: Catalog Item Selector */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Productos/Servicios Aplicables</h3>
          <CatalogItemSelector
            selectedItems={formData?.catalogItemIds}
            onChange={(items) => handleInputChange('catalogItemIds', items)}
            label="Seleccionar Productos/Servicios"
            description="Selecciona los productos o servicios donde se aplicará este cupón (opcional: dejar vacío para aplicar a todos)"
          />
        </div>

        {/* Validity Period */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Período de Validez</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Válido desde"
              type="date"
              value={formData?.validFrom}
              onChange={(e) => handleInputChange('validFrom', e?.target?.value)}
              error={errors?.validFrom}
              required
            />

            <Input
              label="Válido hasta"
              type="date"
              value={formData?.validUntil}
              onChange={(e) => handleInputChange('validUntil', e?.target?.value)}
              error={errors?.validUntil}
              required
            />
          </div>
        </div>

        {/* Advanced Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Opciones Avanzadas</h3>
          
          <Select
            label="Audiencia Objetivo"
            options={targetAudienceOptions}
            value={formData?.targetAudience}
            onChange={(value) => handleInputChange('targetAudience', value)}
          />

          <div className="space-y-3">
            <Checkbox
              label="Cupón activo"
              checked={formData?.isActive}
              onChange={(e) => handleInputChange('isActive', e?.target?.checked)}
              description="El cupón estará disponible para su uso"
            />

            <Checkbox
              label="Cupón público"
              checked={formData?.isPublic}
              onChange={(e) => handleInputChange('isPublic', e?.target?.checked)}
              description="El cupón aparecerá en la lista pública de cupones"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-border">
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
            variant="default"
            loading={isLoading}
            iconName="Save"
            iconPosition="left"
          >
            {coupon ? 'Actualizar Cupón' : 'Crear Cupón'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CouponForm;