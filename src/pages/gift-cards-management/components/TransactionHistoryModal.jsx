import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TransactionHistoryModal = ({ isOpen, onClose, card }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'issued':
        return 'Plus';
      case 'redeemed':
        return 'Minus';
      case 'balance_adjustment':
        return 'Edit';
      case 'expired':
        return 'Clock';
      case 'cancelled':
        return 'X';
      default:
        return 'Activity';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'issued':
        return 'text-success';
      case 'redeemed':
        return 'text-primary';
      case 'balance_adjustment':
        return 'text-warning';
      case 'expired': case'cancelled':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTransactionLabel = (type) => {
    switch (type) {
      case 'issued':
        return 'Emitida';
      case 'redeemed':
        return 'Canjeada';
      case 'balance_adjustment':
        return 'Ajuste de Balance';
      case 'expired':
        return 'Expirada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return type;
    }
  };

  // Create full transaction history including initial issue
  const allTransactions = [
    {
      id: 0,
      date: card?.issuedDate,
      type: 'issued',
      amount: card?.initialValue,
      balance: card?.initialValue,
      location: 'Sistema'
    },
    ...(card?.transactions || [])
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Historial de Transacciones</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {card?.code} - {card?.recipientName}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Summary */}
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Valor Inicial</p>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(card?.initialValue)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Balance Actual</p>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(card?.currentBalance)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Usado</p>
              <p className="text-lg font-bold text-success">
                {formatCurrency(card?.initialValue - card?.currentBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto p-6">
          {allTransactions?.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="History" size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay transacciones registradas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allTransactions?.map((transaction, index) => (
                <div
                  key={transaction?.id || index}
                  className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={`p-2 rounded-lg bg-background ${getTransactionColor(transaction?.type)}`}>
                    <Icon name={getTransactionIcon(transaction?.type)} size={20} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="font-medium text-foreground">
                          {getTransactionLabel(transaction?.type)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction?.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          transaction?.type === 'issued' ? 'text-success' : 'text-foreground'
                        }`}>
                          {transaction?.type === 'issued' ? '+' : '-'}{formatCurrency(transaction?.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Balance: {formatCurrency(transaction?.balance)}
                        </p>
                      </div>
                    </div>
                    
                    {transaction?.location && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Icon name="MapPin" size={12} />
                        <span>{transaction?.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {allTransactions?.length} transacción{allTransactions?.length !== 1 ? 'es' : ''} en total
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" iconName="Download" iconPosition="left">
              Exportar
            </Button>
            <Button onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryModal;