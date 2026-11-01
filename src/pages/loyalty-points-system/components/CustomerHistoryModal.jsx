import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const CustomerHistoryModal = ({ isOpen, onClose, customer, transactions }) => {
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  const filterOptions = [
    { value: 'all', label: 'Todas las Transacciones' },
    { value: 'earned', label: 'Puntos Ganados' },
    { value: 'redeemed', label: 'Puntos Canjeados' },
    { value: 'adjusted', label: 'Ajustes Manuales' },
    { value: 'expired', label: 'Puntos Expirados' }
  ];

  const filteredTransactions = transactions?.filter(transaction => {
      if (filterType === 'all') return true;
      return transaction?.type === filterType;
    })?.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const getTransactionIcon = (type) => {
    const icons = {
      earned: 'Plus',
      redeemed: 'Minus',
      adjusted: 'Edit',
      expired: 'Clock'
    };
    return icons?.[type] || 'Circle';
  };

  const getTransactionColor = (type) => {
    const colors = {
      earned: 'text-success',
      redeemed: 'text-warning',
      adjusted: 'text-primary',
      expired: 'text-muted-foreground'
    };
    return colors?.[type] || 'text-muted-foreground';
  };

  const getTransactionLabel = (type) => {
    const labels = {
      earned: 'Ganados',
      redeemed: 'Canjeados',
      adjusted: 'Ajustados',
      expired: 'Expirados'
    };
    return labels?.[type] || type;
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Historial de Puntos</h3>
              <p className="text-sm text-muted-foreground">{customer?.name}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              iconName="X"
            />
          </div>
        </div>

        <div className="p-6 border-b border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{customer?.points?.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Balance Actual</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold text-success">{customer?.totalEarned?.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Ganado</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold text-warning">{customer?.totalRedeemed?.toLocaleString() || '0'}</p>
              <p className="text-sm text-muted-foreground">Total Canjeado</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Select
              options={filterOptions}
              value={filterType}
              onChange={setFilterType}
              placeholder="Filtrar transacciones"
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              iconName={sortOrder === 'desc' ? 'ArrowDown' : 'ArrowUp'}
            >
              {sortOrder === 'desc' ? 'Más Reciente' : 'Más Antiguo'}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {filteredTransactions?.map((transaction) => (
              <div key={transaction?.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction?.type === 'earned' ? 'bg-success/10' :
                    transaction?.type === 'redeemed' ? 'bg-warning/10' :
                    transaction?.type === 'adjusted'? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <Icon 
                      name={getTransactionIcon(transaction?.type)} 
                      size={20} 
                      className={getTransactionColor(transaction?.type)}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{transaction?.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(transaction?.timestamp)} • {getTransactionLabel(transaction?.type)}
                    </p>
                    {transaction?.reference && (
                      <p className="text-xs text-muted-foreground">Ref: {transaction?.reference}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction?.type === 'earned' ? 'text-success' :
                    transaction?.type === 'redeemed'? 'text-warning' : 'text-foreground'
                  }`}>
                    {transaction?.type === 'earned' ? '+' : transaction?.type === 'redeemed' ? '-' : ''}
                    {transaction?.points?.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Balance: {transaction?.balanceAfter?.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredTransactions?.length === 0 && (
            <div className="text-center py-8">
              <Icon name="History" size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay transacciones para mostrar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerHistoryModal;