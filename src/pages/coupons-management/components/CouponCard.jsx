import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useCurrency } from '../../../contexts/CurrencyContext';

const CouponCard = ({ coupon, onEdit, onDelete, onToggleStatus, onViewAnalytics }) => {
  const { formatPrice } = useCurrency();

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'expired':
        return 'bg-muted text-muted-foreground border-border';
      case 'paused':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getDiscountDisplay = (coupon) => {
    if (coupon?.discountType === 'percentage') {
      return `${coupon?.discountValue}% OFF`;
    }
    return `${formatPrice(coupon?.discountValue)} OFF`;
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getUsagePercentage = () => {
    if (coupon?.usageLimit === 0) return 0;
    return Math.round((coupon?.usedCount / coupon?.usageLimit) * 100);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-foreground">{coupon?.title}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(coupon?.status)}`}>
              {coupon?.status === 'active' ? 'Activo' : 
               coupon?.status === 'expired' ? 'Expirado' : 'Pausado'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{coupon?.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewAnalytics(coupon?.id)}
          >
            <Icon name="BarChart3" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(coupon?.id)}
          >
            <Icon name="Edit" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(coupon?.id)}
          >
            <Icon name="Trash2" size={16} />
          </Button>
        </div>
      </div>
      {/* Discount Display */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-primary mb-1">
              {getDiscountDisplay(coupon)}
            </div>
            <div className="text-sm text-muted-foreground">
              Código: <span className="font-mono font-medium">{coupon?.code}</span>
            </div>
          </div>
          <div className="w-16 h-16 bg-white border border-border rounded-lg flex items-center justify-center">
            <Icon name="QrCode" size={24} className="text-foreground" />
          </div>
        </div>
      </div>
      {/* Usage Statistics */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Uso</span>
          <span className="font-medium text-foreground">
            {coupon?.usedCount} / {coupon?.usageLimit === 0 ? '∞' : coupon?.usageLimit}
          </span>
        </div>
        {coupon?.usageLimit > 0 && (
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(getUsagePercentage(), 100)}%` }}
            />
          </div>
        )}
      </div>
      {/* Dates and Details */}
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <span className="text-muted-foreground block">Válido desde</span>
          <span className="font-medium text-foreground">{formatDate(coupon?.validFrom)}</span>
        </div>
        <div>
          <span className="text-muted-foreground block">Válido hasta</span>
          <span className="font-medium text-foreground">{formatDate(coupon?.validUntil)}</span>
        </div>
      </div>
      {/* Restrictions */}
      {coupon?.minPurchaseAmount > 0 && (
        <div className="text-xs text-muted-foreground mb-4">
          Compra mínima: €{coupon?.minPurchaseAmount}
        </div>
      )}
      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-border">
        <Button
          variant={coupon?.status === 'active' ? 'outline' : 'default'}
          size="sm"
          onClick={() => onToggleStatus(coupon?.id)}
          className="flex-1"
        >
          {coupon?.status === 'active' ? 'Pausar' : 'Activar'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="Share2"
          iconPosition="left"
          className="flex-1"
        >
          Compartir
        </Button>
      </div>
    </div>
  );
};

export default CouponCard;