import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useCurrency } from '../../../contexts/CurrencyContext';

const RedemptionInterface = ({ onRedeem, onClose, isLoading = false }) => {
  const [redemptionData, setRedemptionData] = useState({
    code: '',
    customerEmail: '',
    orderAmount: '',
    notes: ''
  });

  const [scanMode, setScanMode] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setRedemptionData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear errors when user types
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Auto-validate coupon code
    if (field === 'code' && value?.length >= 4) {
      validateCoupon(value);
    }
  };

  const validateCoupon = (code) => {
    // Mock validation - in real app this would be an API call
    setTimeout(() => {
      const mockCoupons = [
        {
          code: 'WELCOME20',
          title: 'Descuento de Bienvenida',
          discountType: 'percentage',
          discountValue: 20,
          minPurchaseAmount: 50,
          isValid: true,
          usesRemaining: 45
        },
        {
          code: 'SAVE10EUR',
          title: 'Ahorra 10 Euros',
          discountType: 'fixed',
          discountValue: 10,
          minPurchaseAmount: 25,
          isValid: true,
          usesRemaining: 12
        }
      ];

      const coupon = mockCoupons?.find(c => c?.code === code?.toUpperCase());
      
      if (coupon) {
        setValidationResult({
          ...coupon,
          status: 'valid'
        });
      } else {
        setValidationResult({
          status: 'invalid',
          message: 'Cupón no encontrado o expirado'
        });
      }
    }, 500);
  };

  const calculateDiscount = () => {
    if (!validationResult || validationResult?.status !== 'valid' || !redemptionData?.orderAmount) {
      return 0;
    }

    const orderAmount = parseFloat(redemptionData?.orderAmount);
    
    if (validationResult?.minPurchaseAmount && orderAmount < validationResult?.minPurchaseAmount) {
      return 0;
    }

    if (validationResult?.discountType === 'percentage') {
      return (orderAmount * validationResult?.discountValue) / 100;
    } else {
      return Math.min(validationResult?.discountValue, orderAmount);
    }
  };

  const getFinalAmount = () => {
    const orderAmount = parseFloat(redemptionData?.orderAmount) || 0;
    const discount = calculateDiscount();
    return Math.max(0, orderAmount - discount);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!redemptionData?.code?.trim()) {
      newErrors.code = 'El código del cupón es obligatorio';
    }

    if (!redemptionData?.customerEmail?.trim()) {
      newErrors.customerEmail = 'El email del cliente es obligatorio';
    } else if (!/\S+@\S+\.\S+/?.test(redemptionData?.customerEmail)) {
      newErrors.customerEmail = 'Email inválido';
    }

    if (!redemptionData?.orderAmount || parseFloat(redemptionData?.orderAmount) <= 0) {
      newErrors.orderAmount = 'El monto de la orden debe ser mayor a 0';
    }

    if (validationResult?.status !== 'valid') {
      newErrors.code = 'Cupón inválido o expirado';
    }

    if (validationResult?.minPurchaseAmount && parseFloat(redemptionData?.orderAmount) < validationResult?.minPurchaseAmount) {
      newErrors.orderAmount = `Compra mínima requerida: ${formatPrice(validationResult?.minPurchaseAmount)}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      const redemptionInfo = {
        ...redemptionData,
        coupon: validationResult,
        discountAmount: calculateDiscount(),
        finalAmount: getFinalAmount()
      };
      onRedeem(redemptionInfo);
    }
  };

  const { formatPrice } = useCurrency();

  const formatCurrency = (value) => formatPrice(value);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Canjear Cupón</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Icon name="X" size={20} />
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Coupon Code Input */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                label="Código del Cupón"
                type="text"
                placeholder="Ingresa el código o escanea QR"
                value={redemptionData?.code}
                onChange={(e) => handleInputChange('code', e?.target?.value?.toUpperCase())}
                error={errors?.code}
                required
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant={scanMode ? 'default' : 'outline'}
                onClick={() => setScanMode(!scanMode)}
                iconName="QrCode"
                iconPosition="left"
              >
                {scanMode ? 'Cancelar' : 'Escanear'}
              </Button>
            </div>
          </div>

          {/* QR Scanner Placeholder */}
          {scanMode && (
            <div className="bg-muted/50 border border-border rounded-lg p-8 text-center">
              <Icon name="Camera" size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Apunta la cámara al código QR</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Mock QR scan result
                  handleInputChange('code', 'WELCOME20');
                  setScanMode(false);
                }}
              >
                Simular Escaneo
              </Button>
            </div>
          )}

          {/* Coupon Validation Result */}
          {validationResult && (
            <div className={`border rounded-lg p-4 ${
              validationResult?.status === 'valid' ?'bg-success/5 border-success/20' :'bg-destructive/5 border-destructive/20'
            }`}>
              {validationResult?.status === 'valid' ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="CheckCircle" size={20} className="text-success" />
                    <span className="font-medium text-success">Cupón Válido</span>
                  </div>
                  <p className="text-sm text-foreground mb-2">{validationResult?.title}</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      Descuento: {validationResult?.discountType === 'percentage' 
                        ? `${validationResult?.discountValue}%` 
                        : formatCurrency(validationResult?.discountValue)}
                    </p>
                    {validationResult?.minPurchaseAmount > 0 && (
                      <p>Compra mínima: {formatCurrency(validationResult?.minPurchaseAmount)}</p>
                    )}
                    <p>Usos restantes: {validationResult?.usesRemaining}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Icon name="XCircle" size={20} className="text-destructive" />
                  <span className="font-medium text-destructive">{validationResult?.message}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Información del Cliente</h3>
          
          <Input
            label="Email del Cliente"
            type="email"
            placeholder="cliente@ejemplo.com"
            value={redemptionData?.customerEmail}
            onChange={(e) => handleInputChange('customerEmail', e?.target?.value)}
            error={errors?.customerEmail}
            required
          />
        </div>

        {/* Order Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Información de la Orden</h3>
          
          <Input
            label="Monto de la Orden (€)"
            type="number"
            placeholder="0.00"
            value={redemptionData?.orderAmount}
            onChange={(e) => handleInputChange('orderAmount', e?.target?.value)}
            error={errors?.orderAmount}
            min="0"
            step="0.01"
            required
          />

          <Input
            label="Notas (Opcional)"
            type="text"
            placeholder="Información adicional sobre la orden"
            value={redemptionData?.notes}
            onChange={(e) => handleInputChange('notes', e?.target?.value)}
          />
        </div>

        {/* Order Summary */}
        {redemptionData?.orderAmount && validationResult?.status === 'valid' && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-3">Resumen de la Orden</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(parseFloat(redemptionData?.orderAmount) || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Descuento ({redemptionData?.code}):</span>
                <span className="font-medium text-success">
                  -{formatCurrency(calculateDiscount())}
                </span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">Total:</span>
                  <span className="font-bold text-lg text-foreground">
                    {formatCurrency(getFinalAmount())}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-6 border-t border-border">
          <Button
            type="submit"
            loading={isLoading}
            iconName="Check"
            iconPosition="left"
            disabled={!validationResult || validationResult?.status !== 'valid'}
          >
            Canjear Cupón
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

export default RedemptionInterface;