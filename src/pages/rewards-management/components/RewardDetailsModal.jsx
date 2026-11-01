import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RewardDetailsModal = ({ isOpen, onClose, reward, onEdit }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

  const getRewardTypeIcon = (rewardType) => {
    switch (rewardType) {
      case 'discount':
        return 'Percent';
      case 'free_item':
        return 'Gift';
      case 'points':
        return 'Star';
      case 'exclusive_access':
        return 'Crown';
      default:
        return 'Award';
    }
  };

  const completionRate = reward?.totalParticipants > 0 
    ? (reward?.completedCustomers / reward?.totalParticipants) * 100 
    : 0;

  const redemptionRate = reward?.completedCustomers > 0
    ? (reward?.redemptions / reward?.completedCustomers) * 100
    : 0;

  if (!isOpen || !reward) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name={getTypeIcon(reward?.type)} size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{reward?.name}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(reward?.status)}`}>
                {reward?.status === 'active' ? 'Activo' : reward?.status === 'paused' ? 'Pausado' : 'Expirado'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => onEdit(reward)} iconName="Edit" iconSize={16}>
              Editar
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Información Básica */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Información Básica</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Icon name="FileText" size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Descripción</p>
                      <p className="text-sm text-muted-foreground">{reward?.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Icon name={getTypeIcon(reward?.type)} size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Tipo de Objetivo</p>
                      <p className="text-sm text-muted-foreground">
                        {reward?.type === 'count' ? 'Basado en Visitas' : 'Basado en Gasto'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Icon name="Target" size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Objetivo</p>
                      <p className="text-sm text-muted-foreground">
                        {reward?.type === 'count' 
                          ? `${reward?.targetValue} visitas`
                          : formatCurrency(reward?.targetValue)
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Icon name={getRewardTypeIcon(reward?.rewardType)} size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Recompensa</p>
                      <p className="text-sm text-muted-foreground">{reward?.rewardValue}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Fechas y Configuración</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Icon name="Calendar" size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Fecha de Creación</p>
                      <p className="text-sm text-muted-foreground">{formatDate(reward?.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Icon name="Clock" size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Válido Hasta</p>
                      <p className="text-sm text-muted-foreground">{formatDate(reward?.validUntil)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Icon name="Users" size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Límite por Cliente</p>
                      <p className="text-sm text-muted-foreground">{reward?.customerLimit || 1} vez(es)</p>
                    </div>
                  </div>

                  {reward?.maxRedemptions && (
                    <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <Icon name="Hash" size={16} className="text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Máximo de Canjes</p>
                        <p className="text-sm text-muted-foreground">{reward?.maxRedemptions}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas de Rendimiento */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Estadísticas de Rendimiento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Users" size={16} className="text-primary" />
                  <span className="text-sm font-medium text-primary">Participantes</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{reward?.totalParticipants}</p>
                <p className="text-xs text-muted-foreground">Total inscrito</p>
              </div>

              <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="CheckCircle" size={16} className="text-success" />
                  <span className="text-sm font-medium text-success">Completados</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{reward?.completedCustomers}</p>
                <p className="text-xs text-muted-foreground">{completionRate?.toFixed(1)}% de finalización</p>
              </div>

              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Gift" size={16} className="text-warning" />
                  <span className="text-sm font-medium text-warning">Canjeados</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{reward?.redemptions}</p>
                <p className="text-xs text-muted-foreground">{redemptionRate?.toFixed(1)}% de canje</p>
              </div>

              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="TrendingUp" size={16} className="text-destructive" />
                  <span className="text-sm font-medium text-destructive">Eficiencia</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {(completionRate * redemptionRate / 100)?.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Conversión total</p>
              </div>
            </div>
          </div>

          {/* Progreso Visual */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Progreso de Participantes</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Participantes que han completado el objetivo</span>
                <span className="text-sm text-muted-foreground">
                  {reward?.completedCustomers}/{reward?.totalParticipants} ({completionRate?.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-success h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(completionRate, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Clientes que han canjeado</span>
                <span className="text-sm text-muted-foreground">
                  {reward?.redemptions}/{reward?.completedCustomers} ({redemptionRate?.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(redemptionRate, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Insights */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Insights y Recomendaciones</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completionRate > 30 && (
                <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="TrendingUp" size={16} className="text-success" />
                    <span className="text-sm font-medium text-success">Buen Rendimiento</span>
                  </div>
                  <p className="text-sm text-foreground">
                    La tasa de finalización es superior al promedio. Este programa está funcionando bien.
                  </p>
                </div>
              )}

              {redemptionRate < 70 && reward?.completedCustomers > 0 && (
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="AlertTriangle" size={16} className="text-warning" />
                    <span className="text-sm font-medium text-warning">Oportunidad de Mejora</span>
                  </div>
                  <p className="text-sm text-foreground">
                    Algunos clientes completan el objetivo pero no canjean. Considera enviar recordatorios.
                  </p>
                </div>
              )}

              {reward?.totalParticipants < 50 && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="Megaphone" size={16} className="text-primary" />
                    <span className="text-sm font-medium text-primary">Promoción Sugerida</span>
                  </div>
                  <p className="text-sm text-foreground">
                    Pocos participantes hasta ahora. Considera promocionar más este programa.
                  </p>
                </div>
              )}

              {new Date(reward?.validUntil) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="Clock" size={16} className="text-destructive" />
                    <span className="text-sm font-medium text-destructive">Próximo a Vencer</span>
                  </div>
                  <p className="text-sm text-foreground">
                    Este programa vence pronto. Considera extender la fecha o crear uno nuevo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardDetailsModal;