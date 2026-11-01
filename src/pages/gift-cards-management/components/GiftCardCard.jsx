import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useCurrency } from '../../../contexts/CurrencyContext';

const GiftCardCard = ({ card, onEdit, onDelete, onViewAnalytics, onViewTransactions }) => {
  const { formatPrice } = useCurrency();

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'used':
        return 'bg-muted text-muted-foreground border-border';
      case 'expired':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'cancelled':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'used':
        return 'Usada';
      case 'expired':
        return 'Expirada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (value) => formatPrice(value);

  const getUsagePercentage = () => {
    if (card?.initialValue === 0) return 0;
    return Math.round(((card?.initialValue - card?.currentBalance) / card?.initialValue) * 100);
  };

  const isExpiringSoon = () => {
    if (!card?.expiryDate || card?.status !== 'active') return false;
    const daysUntilExpiry = Math.ceil((new Date(card?.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-foreground font-mono">{card?.code}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(card?.status)}`}>
              {getStatusLabel(card?.status)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{card?.recipientName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewAnalytics(card?.id)}
          >
            <Icon name="BarChart3" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(card?.id)}
          >
            <Icon name="Edit" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(card?.id)}
          >
            <Icon name="Trash2" size={16} />
          </Button>
        </div>
      </div>

      {/* Balance Display */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-muted-foreground">Balance Actual</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(card?.currentBalance)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Valor Inicial</p>
            <p className="text-sm font-medium text-foreground">
              {formatCurrency(card?.initialValue)}
            </p>
          </div>
        </div>
        
        {/* Usage Progress */}
        {card?.status === 'active' && card?.currentBalance < card?.initialValue && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Uso</span>
              <span className="font-medium text-foreground">{getUsagePercentage()}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${getUsagePercentage()}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Dates */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Emitida</span>
          <span className="font-medium text-foreground">{formatDate(card?.issuedDate)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Expira</span>
          <span className={`font-medium ${
            isExpiringSoon() ? 'text-warning' : 'text-foreground'
          }`}>
            {formatDate(card?.expiryDate)}
            {isExpiringSoon() && (
              <Icon name="AlertCircle" size={14} className="inline ml-1" />
            )}
          </span>
        </div>
        {card?.redeemedDate && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Canjeada</span>
            <span className="font-medium text-foreground">{formatDate(card?.redeemedDate)}</span>
          </div>
        )}
      </div>

      {/* Contact Info */}
      <div className="space-y-1 mb-4 text-xs">
        {card?.recipientEmail && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon name="Mail" size={12} />
            <span className="truncate">{card?.recipientEmail}</span>
          </div>
        )}
        {card?.recipientPhone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon name="Phone" size={12} />
            <span>{card?.recipientPhone}</span>
          </div>
        )}
      </div>

      {/* Notes */}
      {card?.notes && (
        <div className="text-xs text-muted-foreground mb-4 p-2 bg-muted rounded">
          {card?.notes}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-border">
        {card?.transactions && card?.transactions?.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewTransactions(card?.id)}
            iconName="History"
            iconPosition="left"
            className="flex-1"
          >
            Historial
          </Button>
        )}
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

export default GiftCardCard;