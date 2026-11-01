import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useCurrency } from '../../../contexts/CurrencyContext';

const RewardCard = ({ reward, onEdit, onToggleStatus, onViewDetails }) => {
  const { formatPrice } = useCurrency();
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'paused':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'expired':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-border';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'count':
        return 'Hash';
      case 'amount':
        return 'Euro';
      default:
        return 'Gift';
    }
  };

  const formatCurrency = (amount) => formatPrice(amount);

  const completionRate = (reward?.completedCustomers / reward?.totalParticipants) * 100;

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name={getTypeIcon(reward?.type)} size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{reward?.name}</h3>
            <p className="text-sm text-muted-foreground">{reward?.description}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(reward?.status)}`}>
          {reward?.status === 'active' ? 'Activo' : reward?.status === 'paused' ? 'Pausado' : 'Expirado'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="Target" size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Objetivo</span>
          </div>
          <p className="text-lg font-semibold text-foreground">
            {reward?.type === 'count' 
              ? `${reward?.targetValue} visitas`
              : formatCurrency(reward?.targetValue)
            }
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="Gift" size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Recompensa</span>
          </div>
          <p className="text-lg font-semibold text-foreground">{reward?.rewardValue}</p>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Progreso de Participantes</span>
          <span className="text-sm text-muted-foreground">
            {reward?.completedCustomers}/{reward?.totalParticipants} completados
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(completionRate, 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {completionRate?.toFixed(1)}% de finalización
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
        <div>
          <p className="text-2xl font-bold text-foreground">{reward?.totalParticipants}</p>
          <p className="text-xs text-muted-foreground">Participantes</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-success">{reward?.completedCustomers}</p>
          <p className="text-xs text-muted-foreground">Completados</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">{reward?.redemptions}</p>
          <p className="text-xs text-muted-foreground">Canjeados</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Calendar" size={16} />
          <span>Válido hasta: {new Date(reward.validUntil)?.toLocaleDateString('es-ES')}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(reward)}
            iconName="Eye"
            iconSize={16}
          >
            Ver
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(reward)}
            iconName="Edit"
            iconSize={16}
          >
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleStatus(reward)}
            iconName={reward?.status === 'active' ? 'Pause' : 'Play'}
            iconSize={16}
          >
            {reward?.status === 'active' ? 'Pausar' : 'Activar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RewardCard;