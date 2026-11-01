import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import CustomerIdentification from './CustomerIdentification';
import ProductSearch from './ProductSearch';
import CartPanel from './CartPanel';
import { supabase } from '../../../lib/supabase';
import { useCurrency } from '../../../contexts/CurrencyContext';

// ─── Payment Method Selection Step ───────────────────────────────────────────
const PaymentStep = ({ total, cart, customer, session, onConfirm, onBack, formatPrice }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  const taxRate = 0.16;
  const subtotal = cart?.reduce((sum, item) => sum + (item?.price * item?.quantity), 0) || 0;
  const taxAmount = subtotal * taxRate;

  let couponDiscount = 0;
  if (appliedCoupon) {
    couponDiscount = appliedCoupon?.discountType === 'percentage'
      ? (subtotal * appliedCoupon?.discountValue) / 100
      : appliedCoupon?.discountValue;
  }
  const pointsDiscount = pointsToRedeem * 0.01;
  const totalDiscount = couponDiscount + pointsDiscount;
  const finalTotal = Math.max(0, subtotal + taxAmount - totalDiscount);
  const change = paymentMethod === 'cash' && cashReceived
    ? Math.max(0, parseFloat(cashReceived || 0) - finalTotal)
    : 0;

  const mockCoupons = [
    { code: 'PROMO10', title: '10% Descuento', discountType: 'percentage', discountValue: 10, minPurchaseAmount: 0 },
    { code: 'DESC50', title: '$50 de Descuento', discountType: 'fixed', discountValue: 50, minPurchaseAmount: 100 },
  ];

  const handleApplyCoupon = () => {
    const found = mockCoupons?.find(c => c?.code === couponCode?.toUpperCase()?.trim());
    if (!found) { alert('Cupón no válido'); return; }
    if (subtotal < found?.minPurchaseAmount) {
      alert(`Compra mínima requerida: ${formatPrice(found?.minPurchaseAmount)}`);
      return;
    }
    setAppliedCoupon(found);
    setCouponCode('');
  };

  const handleConfirm = async () => {
    if (paymentMethod === 'cash') {
      if (!cashReceived || parseFloat(cashReceived) < finalTotal) {
        alert('El monto recibido debe ser mayor o igual al total');
        return;
      }
    }
    setIsProcessing(true);
    try {
      // Save transaction to Supabase
      const txData = {
        session_id: session?.id,
        terminal_id: session?.terminal_id,
        business_id: session?.business_id || null,
        customer_id: customer?.id || null,
        subtotal,
        tax_amount: taxAmount,
        discount_amount: totalDiscount,
        total_amount: finalTotal,
        payment_method: paymentMethod,
        cash_received: paymentMethod === 'cash' ? parseFloat(cashReceived) : null,
        change_given: paymentMethod === 'cash' ? change : null,
        status: 'completed',
        items: cart?.map(item => ({
          item_id: item?.id,
          item_name: item?.name,
          quantity: item?.quantity,
          unit_price: item?.price,
          total: item?.price * item?.quantity,
        })),
        created_at: new Date()?.toISOString(),
      };

      const { data: savedTx, error } = await supabase
        ?.from('pos_transactions')
        ?.insert(txData)
        ?.select()
        ?.single();

      if (error) {
        console.warn('Could not save transaction to DB:', error?.message);
      }

      // Update session totals
      if (session?.id) {
        await supabase
          ?.from('cash_register_sessions')
          ?.update({
            total_sales: (session?.total_sales || 0) + finalTotal,
            total_transactions: (session?.total_transactions || 0) + 1,
          })
          ?.eq('id', session?.id);
      }

      onConfirm({
        ...txData,
        transaction_number: savedTx?.id ? `TXN-${savedTx?.id?.slice(0, 8)?.toUpperCase()}` : `TXN-${Date.now()}`,
        id: savedTx?.id,
        customer,
        cart,
        appliedCoupon,
        pointsRedeemed: pointsToRedeem,
        pointsEarned: Math.floor(finalTotal),
        change,
      });
    } catch (err) {
      console.error('Payment error:', err);
      // Still proceed with local transaction
      onConfirm({
        transaction_number: `TXN-${Date.now()}`,
        subtotal,
        tax_amount: taxAmount,
        discount_amount: totalDiscount,
        total_amount: finalTotal,
        payment_method: paymentMethod,
        cash_received: paymentMethod === 'cash' ? parseFloat(cashReceived) : null,
        change_given: change,
        customer,
        cart,
        appliedCoupon,
        pointsRedeemed: pointsToRedeem,
        pointsEarned: Math.floor(finalTotal),
        change,
        created_at: new Date()?.toISOString(),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentMethods = [
    { id: 'cash', label: 'Efectivo', icon: 'Banknote', color: 'emerald' },
    { id: 'card', label: 'Tarjeta', icon: 'CreditCard', color: 'blue' },
    { id: 'transfer', label: 'Transferencia', icon: 'ArrowLeftRight', color: 'violet' },
    { id: 'mixed', label: 'Mixto', icon: 'Layers', color: 'amber' },
  ];

  const quickAmounts = [
    Math.ceil(finalTotal / 50) * 50,
    Math.ceil(finalTotal / 100) * 100,
    Math.ceil(finalTotal / 200) * 200,
    Math.ceil(finalTotal / 500) * 500,
  ]?.filter((v, i, arr) => arr?.indexOf(v) === i && v >= finalTotal)?.slice(0, 4);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
          >
            <Icon name="ArrowLeft" size={16} />
            Volver al carrito
          </button>
          <div className="w-px h-5 bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="CreditCard" size={14} className="text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">Procesar Pago</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total a cobrar</p>
          <p className="text-xl font-bold text-foreground">{formatPrice(finalTotal)}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Payment Method + Cash Input */}
          <div className="space-y-5">
            {/* Payment Method Selection */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Método de Pago</h3>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods?.map(method => (
                  <button
                    key={method?.id}
                    onClick={() => setPaymentMethod(method?.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === method?.id
                        ? `border-${method?.color}-500 bg-${method?.color}-50`
                        : 'border-border bg-card hover:border-border/80 hover:bg-muted/30'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      paymentMethod === method?.id ? `bg-${method?.color}-100` : 'bg-muted'
                    }`}>
                      <Icon
                        name={method?.icon}
                        size={20}
                        className={paymentMethod === method?.id ? `text-${method?.color}-600` : 'text-muted-foreground'}
                      />
                    </div>
                    <span className={`text-sm font-medium ${
                      paymentMethod === method?.id ? 'text-foreground' : 'text-muted-foreground'
                    }`}>{method?.label}</span>
                    {paymentMethod === method?.id && (
                      <span className={`w-2 h-2 rounded-full bg-${method?.color}-500`} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Cash Input */}
            {paymentMethod === 'cash' && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Efectivo Recibido</h3>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={cashReceived}
                  onChange={e => setCashReceived(e?.target?.value)}
                  className="text-lg font-semibold"
                />
                {/* Quick amounts */}
                {quickAmounts?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {quickAmounts?.map(amount => (
                      <button
                        key={amount}
                        onClick={() => setCashReceived(amount?.toString())}
                        className="px-3 py-1.5 rounded-lg bg-muted text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
                      >
                        {formatPrice(amount)}
                      </button>
                    ))}
                    <button
                      onClick={() => setCashReceived(finalTotal?.toFixed(2))}
                      className="px-3 py-1.5 rounded-lg bg-primary/10 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
                    >
                      Exacto
                    </button>
                  </div>
                )}
                {cashReceived && parseFloat(cashReceived) >= finalTotal && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-700">Cambio a devolver</span>
                    <span className="text-lg font-bold text-emerald-700">{formatPrice(change)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Coupon */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Cupón de Descuento</h3>
              {appliedCoupon ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{appliedCoupon?.title}</p>
                    <p className="text-xs text-emerald-600">-{formatPrice(couponDiscount)}</p>
                  </div>
                  <button onClick={() => setAppliedCoupon(null)} className="text-muted-foreground hover:text-foreground">
                    <Icon name="X" size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Código del cupón"
                    value={couponCode}
                    onChange={e => setCouponCode(e?.target?.value?.toUpperCase())}
                  />
                  <Button onClick={handleApplyCoupon} variant="outline" size="sm">Aplicar</Button>
                </div>
              )}
            </div>

            {/* Points Redemption */}
            {customer?.loyaltyPoints > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Canjear Puntos ({customer?.loyaltyPoints} disponibles)
                </h3>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder="0"
                    value={pointsToRedeem || ''}
                    onChange={e => setPointsToRedeem(Math.min(parseInt(e?.target?.value || 0), customer?.loyaltyPoints))}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">= {formatPrice(pointsToRedeem * 0.01)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Resumen de la Orden</h3>

            {/* Customer */}
            {customer && (
              <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="User" size={14} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{customer?.fullName || customer?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{customer?.loyaltyPoints || 0} puntos</p>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="bg-card border border-border rounded-lg divide-y divide-border max-h-48 overflow-y-auto">
              {cart?.map(item => (
                <div key={item?.id} className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item?.name}</p>
                    <p className="text-xs text-muted-foreground">{item?.quantity} × {formatPrice(item?.price)}</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground ml-3">{formatPrice(item?.price * item?.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA (16%)</span>
                <span className="font-medium text-foreground">{formatPrice(taxAmount)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600">Descuentos</span>
                  <span className="font-medium text-emerald-600">-{formatPrice(totalDiscount)}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="text-base font-bold text-foreground">Total</span>
                <span className="text-base font-bold text-foreground">{formatPrice(finalTotal)}</span>
              </div>
              {paymentMethod === 'cash' && cashReceived && parseFloat(cashReceived) >= finalTotal && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Recibido</span>
                    <span className="font-medium text-foreground">{formatPrice(parseFloat(cashReceived))}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-emerald-600">
                    <span>Cambio</span>
                    <span>{formatPrice(change)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirm}
              disabled={isProcessing || (paymentMethod === 'cash' && (!cashReceived || parseFloat(cashReceived) < finalTotal))}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-base transition-all"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Icon name="CheckCircle" size={18} />
                  Confirmar Pago · {formatPrice(finalTotal)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Receipt Step ─────────────────────────────────────────────────────────────
const ReceiptStep = ({ transaction, onNewSale, onBack, formatPrice }) => {
  const handlePrint = () => {
    const w = window?.open('', '_blank');
    w?.document?.write(`
      <!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <title>Recibo ${transaction?.transaction_number}</title>
      <style>
        body { font-family: 'Courier New', monospace; font-size: 12px; width: 80mm; margin: 0 auto; padding: 10mm; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .divider { border-top: 1px dashed #000; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; margin: 3px 0; }
        .grand { font-size: 14px; font-weight: bold; border-top: 2px solid #000; padding-top: 5px; margin-top: 5px; }
        @media print { @page { size: 80mm auto; margin: 0; } }
      </style></head><body>
      <div class="center bold" style="font-size:16px">Mi Negocio</div>
      <div class="center" style="font-size:10px">Punto de Venta</div>
      <div class="divider"></div>
      <div class="row"><span>Recibo:</span><span>${transaction?.transaction_number}</span></div>
      <div class="row"><span>Fecha:</span><span>${new Date(transaction?.created_at)?.toLocaleString('es-MX')}</span></div>
      ${transaction?.customer ? `<div class="row"><span>Cliente:</span><span>${transaction?.customer?.fullName || transaction?.customer?.full_name || ''}</span></div>` : ''}
      <div class="divider"></div>
      ${transaction?.cart?.map(item => `
        <div class="row"><span>${item?.quantity}x ${item?.name}</span><span>$${(item?.price * item?.quantity)?.toFixed(2)}</span></div>
      `)?.join('') || ''}
      <div class="divider"></div>
      <div class="row"><span>Subtotal</span><span>$${(transaction?.subtotal || 0)?.toFixed(2)}</span></div>
      <div class="row"><span>IVA (16%)</span><span>$${(transaction?.tax_amount || 0)?.toFixed(2)}</span></div>
      ${(transaction?.discount_amount || 0) > 0 ? `<div class="row"><span>Descuento</span><span>-$${(transaction?.discount_amount || 0)?.toFixed(2)}</span></div>` : ''}
      <div class="row grand"><span>TOTAL</span><span>$${(transaction?.total_amount || 0)?.toFixed(2)}</span></div>
      ${transaction?.payment_method === 'cash' ? `
        <div class="row"><span>Recibido</span><span>$${(transaction?.cash_received || 0)?.toFixed(2)}</span></div>
        <div class="row"><span>Cambio</span><span>$${(transaction?.change || 0)?.toFixed(2)}</span></div>
      ` : ''}
      <div class="divider"></div>
      <div class="center" style="font-size:10px">Método: ${transaction?.payment_method === 'cash' ? 'Efectivo' : transaction?.payment_method === 'card' ? 'Tarjeta' : 'Transferencia'}</div>
      ${(transaction?.pointsEarned || 0) > 0 ? `<div class="center" style="font-size:10px">Puntos ganados: +${transaction?.pointsEarned}</div>` : ''}
      <div class="divider"></div>
      <div class="center" style="font-size:10px">¡Gracias por su compra!</div>
      </body></html>
    `);
    w?.document?.close();
    w?.focus();
    w?.print();
    w?.close();
  };

  const methodLabel = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
    mixed: 'Pago Mixto',
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full shadow-lg overflow-hidden">
        {/* Success Header */}
        <div className="bg-emerald-500 px-6 py-6 text-center">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <Icon name="CheckCircle" size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">¡Pago Confirmado!</h2>
          <p className="text-emerald-100 text-sm mt-1">{transaction?.transaction_number}</p>
        </div>

        {/* Receipt Body */}
        <div className="p-5 space-y-4">
          {/* Customer */}
          {transaction?.customer && (
            <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name="User" size={14} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{transaction?.customer?.fullName || transaction?.customer?.full_name}</p>
                {(transaction?.pointsEarned || 0) > 0 && (
                  <p className="text-xs text-emerald-600">+{transaction?.pointsEarned} puntos ganados</p>
                )}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {transaction?.cart?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item?.quantity}× {item?.name}</span>
                <span className="font-medium text-foreground">{formatPrice(item?.price * item?.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-border pt-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatPrice(transaction?.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IVA (16%)</span>
              <span className="text-foreground">{formatPrice(transaction?.tax_amount || 0)}</span>
            </div>
            {(transaction?.discount_amount || 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-emerald-600">Descuento</span>
                <span className="text-emerald-600">-{formatPrice(transaction?.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t border-border pt-2">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">{formatPrice(transaction?.total_amount || 0)}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Método de pago</span>
              <span className="font-medium text-foreground">{methodLabel?.[transaction?.payment_method] || transaction?.payment_method}</span>
            </div>
            {transaction?.payment_method === 'cash' && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Recibido</span>
                  <span className="font-medium text-foreground">{formatPrice(transaction?.cash_received || 0)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-emerald-600">
                  <span>Cambio</span>
                  <span>{formatPrice(transaction?.change || 0)}</span>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button variant="outline" onClick={handlePrint} iconName="Printer" className="flex-1">
              Imprimir
            </Button>
            <Button onClick={onNewSale} iconName="Plus" className="flex-1 bg-primary text-primary-foreground">
              Nueva Venta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main POSFullScreen ───────────────────────────────────────────────────────
const POSFullScreen = ({
  businessId,
  cart,
  currentCustomer,
  cashRegisterSession,
  onAddToCart,
  onUpdateCartItem,
  onRemoveFromCart,
  onClearCart,
  onCheckout,
  onCustomerIdentified,
  onClearCustomer,
  onBack,
}) => {
  const [step, setStep] = useState('pos'); // 'pos' | 'payment' | 'receipt'
  const [completedTransaction, setCompletedTransaction] = useState(null);
  const { formatPrice } = useCurrency();

  const handleGoToPayment = () => {
    if (!cart?.length) { alert('El carrito está vacío'); return; }
    if (!currentCustomer) { alert('Debe identificar al cliente primero'); return; }
    if (!cashRegisterSession || cashRegisterSession?.status !== 'open') {
      alert('Debe abrir la caja registradora primero');
      return;
    }
    setStep('payment');
  };

  const handlePaymentConfirmed = (txData) => {
    const transaction = {
      ...txData,
      transaction_number: txData?.transaction_number || `TXN-${Date.now()}`,
      created_at: txData?.created_at || new Date()?.toISOString(),
    };
    setCompletedTransaction(transaction);
    onClearCart();
    onClearCustomer();
    setStep('receipt');
  };

  const handleNewSale = () => {
    setCompletedTransaction(null);
    setStep('pos');
  };

  return (
    <div className="fixed inset-0 z-40 bg-background flex flex-col">
      {/* Full Screen Header — only shown in POS step */}
      {step === 'pos' && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
            >
              <Icon name="ArrowLeft" size={16} />
              Regresar
            </button>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name="ShoppingCart" size={14} className="text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">Punto de Venta</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {cashRegisterSession?.status === 'open' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Caja Abierta
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Caja Cerrada
              </span>
            )}
          </div>
        </div>
      )}

      {/* Step: POS */}
      {step === 'pos' && (
        <div className="flex-1 overflow-y-auto p-5">
          <div className="max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-5">
                <CustomerIdentification
                  currentCustomer={currentCustomer}
                  onCustomerIdentified={onCustomerIdentified}
                  onClearCustomer={onClearCustomer}
                />
                <ProductSearch
                  businessId={businessId}
                  onAddToCart={onAddToCart}
                  disabled={!currentCustomer}
                />
              </div>
              <div className="lg:col-span-1">
                <CartPanel
                  cart={cart}
                  customer={currentCustomer}
                  onUpdateItem={onUpdateCartItem}
                  onRemoveItem={onRemoveFromCart}
                  onClearCart={onClearCart}
                  onCheckout={handleGoToPayment}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step: Payment */}
      {step === 'payment' && (
        <PaymentStep
          total={cart?.reduce((sum, item) => sum + (item?.price * item?.quantity), 0) || 0}
          cart={cart}
          customer={currentCustomer}
          session={cashRegisterSession}
          onConfirm={handlePaymentConfirmed}
          onBack={() => setStep('pos')}
          formatPrice={formatPrice}
        />
      )}

      {/* Step: Receipt */}
      {step === 'receipt' && completedTransaction && (
        <ReceiptStep
          transaction={completedTransaction}
          onNewSale={handleNewSale}
          onBack={() => setStep('pos')}
          formatPrice={formatPrice}
        />
      )}
    </div>
  );
};

export default POSFullScreen;
