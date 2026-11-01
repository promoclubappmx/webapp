import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useCurrency } from '../../../contexts/CurrencyContext';

const PaymentModal = ({ cart, customer, onClose, onComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash', 'card', 'transfer', 'mixed'
  const [splitPayments, setSplitPayments] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [giftCardCode, setGiftCardCode] = useState('');
  const [appliedGiftCard, setAppliedGiftCard] = useState(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [cashReceived, setCashReceived] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { formatPrice } = useCurrency();

  // Mock coupons
  const mockCoupons = [
    {
      code: 'WELCOME20',
      title: 'Descuento de Bienvenida',
      discountType: 'percentage',
      discountValue: 20,
      minPurchaseAmount: 20
    },
    {
      code: 'SAVE5',
      title: 'Ahorra €5',
      discountType: 'fixed',
      discountValue: 5,
      minPurchaseAmount: 15
    }
  ];

  // Mock gift cards
  const mockGiftCards = [
    {
      code: 'GC-2024-001',
      currentBalance: 50.00
    },
    {
      code: 'GC-2024-002',
      currentBalance: 35.50
    }
  ];

  // Calculate totals
  const subtotal = cart?.reduce((sum, item) => sum + (item?.price * item?.quantity), 0) || 0;
  const taxRate = 0.10;
  const taxAmount = subtotal * taxRate;
  
  // Calculate discounts
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon?.discountType === 'percentage') {
      couponDiscount = (subtotal * appliedCoupon?.discountValue) / 100;
    } else {
      couponDiscount = appliedCoupon?.discountValue;
    }
  }

  // Points redemption (1 point = €0.01)
  const pointsDiscount = pointsToRedeem * 0.01;

  // Gift card discount
  const giftCardDiscount = appliedGiftCard ? Math.min(appliedGiftCard?.currentBalance, subtotal + taxAmount - couponDiscount - pointsDiscount) : 0;

  const totalDiscount = couponDiscount + pointsDiscount + giftCardDiscount;
  const total = Math.max(0, subtotal + taxAmount - totalDiscount);
  const pointsToEarn = Math.floor(total);

  // Calculate change
  const change = paymentMethod === 'cash' && cashReceived ? Math.max(0, parseFloat(cashReceived) - total) : 0;

  const handleApplyCoupon = () => {
    if (!couponCode?.trim()) return;
    const coupon = mockCoupons?.find(c => c?.code === couponCode?.toUpperCase());
    if (coupon) {
      if (subtotal < coupon?.minPurchaseAmount) {
        alert(`Compra mínima requerida: ${formatPrice(coupon?.minPurchaseAmount)}`);
        return;
      }
      setAppliedCoupon(coupon);
      setCouponCode('');
    } else {
      alert('Cupón no válido');
    }
  };

  const handleApplyGiftCard = () => {
    if (!giftCardCode?.trim()) return;

    const giftCard = mockGiftCards?.find(gc => gc?.code === giftCardCode?.toUpperCase());
    if (giftCard) {
      if (giftCard?.currentBalance <= 0) {
        alert('La tarjeta de regalo no tiene saldo disponible');
        return;
      }
      setAppliedGiftCard(giftCard);
      setGiftCardCode('');
    } else {
      alert('Tarjeta de regalo no válida');
    }
  };

  const handleRedeemPoints = () => {
    const maxPoints = Math.min(customer?.loyaltyPoints || 0, Math.floor(subtotal * 100));
    if (pointsToRedeem > maxPoints) {
      alert(`Máximo de puntos a canjear: ${maxPoints}`);
      setPointsToRedeem(maxPoints);
    }
  };

  const handleAddSplitPayment = () => {
    if (splitPayments?.length >= 3) {
      alert('Máximo 3 métodos de pago');
      return;
    }
    setSplitPayments([...splitPayments, { method: 'cash', amount: 0 }]);
  };

  const handleUpdateSplitPayment = (index, field, value) => {
    const updated = [...splitPayments];
    updated[index][field] = value;
    setSplitPayments(updated);
  };

  const handleRemoveSplitPayment = (index) => {
    setSplitPayments(splitPayments?.filter((_, i) => i !== index));
  };

  const handleProcessPayment = () => {
    // Validation
    if (paymentMethod === 'cash' && (!cashReceived || parseFloat(cashReceived) < total)) {
      alert('El monto recibido debe ser mayor o igual al total');
      return;
    }

    if (paymentMethod === 'mixed') {
      const totalSplit = splitPayments?.reduce((sum, p) => sum + parseFloat(p?.amount || 0), 0);
      if (Math.abs(totalSplit - total) > 0.01) {
        alert('La suma de los pagos debe ser igual al total');
        return;
      }
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      const paymentData = {
        cart,
        customer,
        subtotal,
        taxAmount,
        totalDiscount,
        total,
        paymentMethod,
        splitPayments: paymentMethod === 'mixed' ? splitPayments : null,
        appliedCoupon,
        appliedGiftCard,
        pointsRedeemed: pointsToRedeem,
        pointsEarned: pointsToEarn,
        cashReceived: paymentMethod === 'cash' ? parseFloat(cashReceived) : null,
        change: paymentMethod === 'cash' ? change : null,
        timestamp: new Date()?.toISOString()
      };

      onComplete(paymentData);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="CreditCard" size={24} className="text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">Procesar Pago</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Icon name="User" size={20} className="text-primary" />
              <div>
                <p className="font-medium text-foreground">{customer?.fullName}</p>
                <p className="text-sm text-muted-foreground">Puntos disponibles: {customer?.loyaltyPoints}</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Resumen de la Orden</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {cart?.map(item => (
                <div key={item?.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item?.quantity}x {item?.name}
                  </span>
                  <span className="font-medium text-foreground">€{(item?.price * item?.quantity)?.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Coupons & Discounts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Coupon */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Cupón de Descuento</label>
              {appliedCoupon ? (
                <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{appliedCoupon?.title}</p>
                      <p className="text-xs text-success">-€{couponDiscount?.toFixed(2)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAppliedCoupon(null)}
                      iconName="X"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Código del cupón"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e?.target?.value?.toUpperCase())}
                  />
                  <Button onClick={handleApplyCoupon} iconName="Check">
                    Aplicar
                  </Button>
                </div>
              )}
            </div>

            {/* Gift Card */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Tarjeta de Regalo</label>
              {appliedGiftCard ? (
                <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{appliedGiftCard?.code}</p>
                      <p className="text-xs text-success">-€{giftCardDiscount?.toFixed(2)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAppliedGiftCard(null)}
                      iconName="X"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Código de tarjeta"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e?.target?.value?.toUpperCase())}
                  />
                  <Button onClick={handleApplyGiftCard} iconName="Check">
                    Aplicar
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Points Redemption */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Canjear Puntos</label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Puntos a canjear"
                value={pointsToRedeem}
                onChange={(e) => setPointsToRedeem(parseInt(e?.target?.value) || 0)}
                onBlur={handleRedeemPoints}
                max={customer?.loyaltyPoints}
              />
              <Button
                variant="outline"
                onClick={() => setPointsToRedeem(Math.min(customer?.loyaltyPoints || 0, Math.floor(subtotal * 100)))}
              >
                Máximo
              </Button>
            </div>
            {pointsToRedeem > 0 && (
              <p className="text-xs text-success mt-1">Descuento: -€{pointsDiscount?.toFixed(2)}</p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Método de Pago</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('cash')}
                iconName="Banknote"
                className="w-full"
              >
                Efectivo
              </Button>
              <Button
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('card')}
                iconName="CreditCard"
                className="w-full"
              >
                Tarjeta
              </Button>
              <Button
                variant={paymentMethod === 'transfer' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('transfer')}
                iconName="ArrowRightLeft"
                className="w-full"
              >
                Transferencia
              </Button>
              <Button
                variant={paymentMethod === 'mixed' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('mixed')}
                iconName="Split"
                className="w-full"
              >
                Mixto
              </Button>
            </div>
          </div>

          {/* Cash Payment */}
          {paymentMethod === 'cash' && (
            <div>
              <Input
                type="number"
                label="Efectivo Recibido"
                placeholder="0.00"
                value={cashReceived}
                onChange={(e) => setCashReceived(e?.target?.value)}
                step="0.01"
              />
              {change > 0 && (
                <div className="mt-3 bg-primary/10 border border-primary/20 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Cambio</span>
                    <span className="text-xl font-bold text-primary">€{change?.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Split Payment */}
          {paymentMethod === 'mixed' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground">Pagos Divididos</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddSplitPayment}
                  iconName="Plus"
                >
                  Agregar
                </Button>
              </div>
              <div className="space-y-3">
                {splitPayments?.map((payment, index) => (
                  <div key={index} className="flex gap-2">
                    <select
                      value={payment?.method}
                      onChange={(e) => handleUpdateSplitPayment(index, 'method', e?.target?.value)}
                      className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="cash">Efectivo</option>
                      <option value="card">Tarjeta</option>
                      <option value="transfer">Transferencia</option>
                    </select>
                    <Input
                      type="number"
                      placeholder="Monto"
                      value={payment?.amount}
                      onChange={(e) => handleUpdateSplitPayment(index, 'amount', e?.target?.value)}
                      step="0.01"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSplitPayment(index)}
                      iconName="Trash2"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">€{subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IVA (10%)</span>
              <span className="font-medium text-foreground">€{taxAmount?.toFixed(2)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-success">Descuentos Totales</span>
                <span className="font-medium text-success">-€{totalDiscount?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold border-t border-border pt-2">
              <span className="text-foreground">Total a Pagar</span>
              <span className="text-primary">€{total?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Puntos a Ganar</span>
              <span className="font-medium text-primary">+{pointsToEarn} pts</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleProcessPayment}
              loading={isProcessing}
              iconName="Check"
              className="flex-1"
            >
              Confirmar Pago
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;