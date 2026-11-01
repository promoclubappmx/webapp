import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useCurrency } from '../../../contexts/CurrencyContext';

const CartPanel = ({ cart, customer, onUpdateItem, onRemoveItem, onClearCart, onCheckout }) => {
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [selectedShippingZone, setSelectedShippingZone] = useState(null);
  const { formatPrice, currencySettings } = useCurrency();

  // Mock active promotions
  const mockPromotions = [
    {
      id: 'promo1',
      title: '10% Descuento en Comida',
      discountType: 'percentage',
      discountValue: 10,
      minPurchaseAmount: 20,
      isActive: true
    },
    {
      id: 'promo2',
      title: `${formatPrice(5)} de Descuento`,
      discountType: 'fixed_amount',
      discountValue: 5,
      minPurchaseAmount: 30,
      isActive: true
    }
  ];

  // Calculate totals
  const subtotal = cart?.reduce((sum, item) => sum + (item?.price * item?.quantity), 0) || 0;
  const taxSettings = currencySettings?.taxSettings;
  const taxRate = (taxSettings?.useCustomRate
    ? parseFloat(taxSettings?.customRate) || 0
    : taxSettings?.activeRegion === 'frontera' ? 8
    : taxSettings?.activeRegion === 'exento' ? 0
    : 16) / 100;
  const taxIncluded = taxSettings?.taxIncludedInPrice ?? currencySettings?.taxIncluded ?? true;
  const showTaxInCart = taxSettings?.showTaxInCart ?? true;
  const taxLabel = taxSettings?.taxLabel || 'IVA';

  const baseSubtotal = taxIncluded ? subtotal / (1 + taxRate) : subtotal;
  const taxAmount = taxIncluded ? subtotal - baseSubtotal : subtotal * taxRate;

  // Shipping calculation
  const shippingSettings = currencySettings?.shippingSettings;
  const shippingZones = shippingSettings?.zones || [];
  const globalShipping = shippingSettings?.globalConfig || {};
  const showShippingInCart = globalShipping?.showShippingInCart ?? true;
  const shippingLabel = globalShipping?.shippingLabel || 'Envío';
  const enabledZones = shippingZones?.filter(z => z?.enabled);
  const activeZone = selectedShippingZone
    ? shippingZones?.find(z => z?.id === selectedShippingZone)
    : shippingZones?.find(z => z?.id === globalShipping?.defaultZone) || enabledZones?.[0];

  const calcShippingCost = (zone) => {
    if (!zone || !globalShipping?.enableShipping) return 0;
    if (zone?.freeShippingThreshold > 0 && subtotal >= zone?.freeShippingThreshold) return 0;
    return zone?.rateType === 'weight' ? zone?.weightRate : zone?.fixedRate || 0;
  };

  const shippingCost = calcShippingCost(activeZone);
  const isFreeShipping = activeZone?.freeShippingThreshold > 0 && subtotal >= activeZone?.freeShippingThreshold;
  const shippingTax = (activeZone?.taxOnShipping && shippingCost > 0) ? shippingCost * taxRate : 0;

  // Calculate discount
  let discountAmount = 0;
  if (appliedPromotion) {
    if (appliedPromotion?.discountType === 'percentage') {
      discountAmount = (subtotal * appliedPromotion?.discountValue) / 100;
    } else {
      discountAmount = appliedPromotion?.discountValue;
    }
  }

  const total = Math.max(0, taxIncluded
    ? subtotal - discountAmount + shippingCost + shippingTax
    : subtotal + taxAmount - discountAmount + shippingCost + shippingTax
  );

  const pointsToEarn = Math.floor(total);

  const handleApplyPromotion = (promotion) => {
    if (subtotal < promotion?.minPurchaseAmount) {
      alert(`Compra mínima requerida: ${formatPrice(promotion?.minPurchaseAmount)}`);
      return;
    }
    setAppliedPromotion(promotion);
  };

  const handleRemovePromotion = () => {
    setAppliedPromotion(null);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 sticky top-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Icon name="ShoppingCart" size={24} className="text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Carrito</h2>
        </div>
        {cart?.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearCart}
            iconName="Trash2"
          >
            Limpiar
          </Button>
        )}
      </div>
      {cart?.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="ShoppingCart" size={64} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">El carrito está vacío</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
            {cart?.map(item => (
              <div key={item?.id} className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground text-sm">{item?.name}</h3>
                    <p className="text-xs text-muted-foreground">{formatPrice(item?.price)} c/u</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item?.id)}
                    iconName="X"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateItem(item?.id, item?.quantity - 1)}
                      iconName="Minus"
                    />
                    <span className="text-sm font-medium w-8 text-center">{item?.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateItem(item?.id, item?.quantity + 1)}
                      iconName="Plus"
                    />
                  </div>
                  <span className="font-semibold text-foreground">
                    {formatPrice(item?.price * item?.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Shipping Zone Selector */}
          {showShippingInCart && enabledZones?.length > 0 && (
            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Icon name="Truck" size={14} className="text-primary" />
                {shippingLabel}
              </p>
              <select
                value={selectedShippingZone || activeZone?.id || ''}
                onChange={e => setSelectedShippingZone(e?.target?.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {enabledZones?.map(zone => (
                  <option key={zone?.id} value={zone?.id}>
                    {zone?.name} — {zone?.freeShippingThreshold > 0 && subtotal >= zone?.freeShippingThreshold
                      ? 'GRATIS'
                      : formatPrice(zone?.rateType === 'weight' ? zone?.weightRate : zone?.fixedRate)}
                  </option>
                ))}
              </select>
              {activeZone?.freeShippingThreshold > 0 && !isFreeShipping && (
                <p className="text-xs text-muted-foreground mt-1">
                  <Icon name="Info" size={10} className="inline mr-1" />
                  Envío gratis desde {formatPrice(activeZone?.freeShippingThreshold)}
                  {' '}(faltan {formatPrice(activeZone?.freeShippingThreshold - subtotal)})
                </p>
              )}
            </div>
          )}

          {/* Active Promotions */}
          {mockPromotions?.length > 0 && (
            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium text-foreground mb-3">Promociones Activas</p>
              <div className="space-y-2">
                {mockPromotions?.map(promo => (
                  <div
                    key={promo?.id}
                    className={`bg-success/10 border rounded-lg p-3 ${
                      appliedPromotion?.id === promo?.id ? 'border-success' : 'border-success/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{promo?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Mínimo: {formatPrice(promo?.minPurchaseAmount)}
                        </p>
                      </div>
                      {appliedPromotion?.id === promo?.id ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemovePromotion}
                          iconName="X"
                        >
                          Quitar
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApplyPromotion(promo)}
                        >
                          Aplicar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
            </div>
            {showTaxInCart && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{taxLabel} ({Math.round(taxRate * 100)}%)</span>
                <span className="font-medium text-foreground">{formatPrice(taxAmount)}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-success">Descuento</span>
                <span className="font-medium text-success">-{formatPrice(discountAmount)}</span>
              </div>
            )}
            {showShippingInCart && enabledZones?.length > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Icon name="Truck" size={12} />
                  {shippingLabel}
                </span>
                <span className={`font-medium ${
                  isFreeShipping ? 'text-success' : 'text-foreground'
                }`}>
                  {isFreeShipping ? 'GRATIS' : formatPrice(shippingCost)}
                </span>
              </div>
            )}
            {shippingTax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{taxLabel} {shippingLabel}</span>
                <span className="font-medium text-foreground">{formatPrice(shippingTax)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
              <span className="text-foreground">Total</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Points to Earn */}
          {customer && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="Star" size={16} className="text-primary" />
                  <span className="text-sm text-foreground">Puntos a ganar</span>
                </div>
                <span className="font-semibold text-primary">+{pointsToEarn} pts</span>
              </div>
            </div>
          )}

          {/* Checkout Button */}
          <Button
            onClick={onCheckout}
            iconName="CreditCard"
            className="w-full"
            size="lg"
          >
            Procesar Pago
          </Button>
        </div>
      )}
    </div>
  );
};

export default CartPanel;