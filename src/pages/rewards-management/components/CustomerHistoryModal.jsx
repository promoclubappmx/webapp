import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CustomerHistoryModal = ({ isOpen, onClose, customer }) => {
  const [activeTab, setActiveTab] = useState('progress');

  // Mock history data
  const progressHistory = [
    {
      id: 1,
      date: '2024-10-09T14:30:00Z',
      type: 'visit',
      description: 'Visita registrada',
      value: 1,
      cumulative: 8,
      location: 'Tienda Principal'
    },
    {
      id: 2,
      date: '2024-10-07T12:15:00Z',
      type: 'visit',
      description: 'Visita registrada',
      value: 1,
      cumulative: 7,
      location: 'Tienda Principal'
    },
    {
      id: 3,
      date: '2024-10-05T16:45:00Z',
      type: 'adjustment',
      description: 'Ajuste manual: Corrección por error del sistema',
      value: 2,
      cumulative: 6,
      location: 'Sistema',
      admin: 'Admin Usuario'
    },
    {
      id: 4,
      date: '2024-10-03T10:20:00Z',
      type: 'visit',
      description: 'Visita registrada',
      value: 1,
      cumulative: 4,
      location: 'Tienda Principal'
    },
    {
      id: 5,
      date: '2024-10-01T18:30:00Z',
      type: 'enrolled',
      description: 'Inscrito en el programa de recompensas',
      value: 0,
      cumulative: 0,
      location: 'Online'
    }
  ];

  const rewardHistory = [
    {
      id: 1,
      rewardName: 'Descuento 20% - €100 Gastados',
      status: 'earned',
      earnedDate: '2024-09-15T00:00:00Z',
      redeemedDate: null,
      expiryDate: '2024-12-15T00:00:00Z',
      value: '20% de descuento'
    },
    {
      id: 2,
      rewardName: 'Café Gratis - 10 Visitas',
      status: 'redeemed',
      earnedDate: '2024-08-20T00:00:00Z',
      redeemedDate: '2024-08-22T00:00:00Z',
      expiryDate: '2024-11-20T00:00:00Z',
      value: 'Café gratis'
    },
    {
      id: 3,
      rewardName: 'Puntos Bonus - 5 Compras',
      status: 'expired',
      earnedDate: '2024-07-10T00:00:00Z',
      redeemedDate: null,
      expiryDate: '2024-08-10T00:00:00Z',
      value: '500 puntos'
    }
  ];

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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'visit':
        return 'MapPin';
      case 'adjustment':
        return 'Edit';
      case 'enrolled':
        return 'UserPlus';
      default:
        return 'Activity';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'visit':
        return 'text-primary';
      case 'adjustment':
        return 'text-warning';
      case 'enrolled':
        return 'text-success';
      default:
        return 'text-muted-foreground';
    }
  };

  const getRewardStatusColor = (status) => {
    switch (status) {
      case 'earned':
        return 'bg-success/10 text-success border-success/20';
      case 'redeemed':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'expired':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-border';
    }
  };

  const getRewardStatusText = (status) => {
    switch (status) {
      case 'earned':
        return 'Ganada';
      case 'redeemed':
        return 'Canjeada';
      case 'expired':
        return 'Expirada';
      default:
        return 'Desconocido';
    }
  };

  if (!isOpen || !customer) return null;

  const tabs = [
    { id: 'progress', label: 'Historial de Progreso', icon: 'Activity' },
    { id: 'rewards', label: 'Recompensas Obtenidas', icon: 'Gift' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="User" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{customer?.name}</h2>
              <p className="text-sm text-muted-foreground">{customer?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Customer Summary */}
        <div className="p-6 border-b border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <Icon name="Target" size={16} className="text-primary" />
                <span className="text-sm font-medium text-primary">Progreso Actual</span>
              </div>
              <p className="text-lg font-bold text-foreground">
                {customer?.rewardType === 'amount' 
                  ? formatCurrency(customer?.currentValue)
                  : `${customer?.currentValue} visitas`
                }
              </p>
              <p className="text-xs text-muted-foreground">
                de {customer?.rewardType === 'amount' 
                  ? formatCurrency(customer?.targetValue)
                  : `${customer?.targetValue} visitas`
                }
              </p>
            </div>

            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <Icon name="Calendar" size={16} className="text-success" />
                <span className="text-sm font-medium text-success">Última Actividad</span>
              </div>
              <p className="text-lg font-bold text-foreground">
                {formatDate(customer?.lastActivity)}
              </p>
            </div>

            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <Icon name="Hash" size={16} className="text-warning" />
                <span className="text-sm font-medium text-warning">Total Visitas</span>
              </div>
              <p className="text-lg font-bold text-foreground">{customer?.visits}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'progress' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Historial de Actividad</h3>
              <div className="space-y-3">
                {progressHistory?.map((activity) => (
                  <div key={activity?.id} className="flex items-start space-x-4 p-4 bg-muted/50 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-background ${getActivityColor(activity?.type)}`}>
                      <Icon name={getActivityIcon(activity?.type)} size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-foreground">{activity?.description}</p>
                        <span className="text-xs text-muted-foreground">{formatDate(activity?.date)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Valor: +{activity?.value}</span>
                          <span>Total: {activity?.cumulative}</span>
                          <span>Ubicación: {activity?.location}</span>
                          {activity?.admin && <span>Por: {activity?.admin}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Recompensas Obtenidas</h3>
              <div className="space-y-3">
                {rewardHistory?.map((reward) => (
                  <div key={reward?.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Icon name="Gift" size={20} className="text-primary" />
                        <div>
                          <h4 className="font-medium text-foreground">{reward?.rewardName}</h4>
                          <p className="text-sm text-muted-foreground">{reward?.value}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRewardStatusColor(reward?.status)}`}>
                        {getRewardStatusText(reward?.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Fecha de Obtención:</span>
                        <p className="font-medium text-foreground">{formatDate(reward?.earnedDate)}</p>
                      </div>
                      
                      {reward?.redeemedDate && (
                        <div>
                          <span className="text-muted-foreground">Fecha de Canje:</span>
                          <p className="font-medium text-foreground">{formatDate(reward?.redeemedDate)}</p>
                        </div>
                      )}
                      
                      <div>
                        <span className="text-muted-foreground">Fecha de Expiración:</span>
                        <p className={`font-medium ${new Date(reward?.expiryDate) < new Date() ? 'text-destructive' : 'text-foreground'}`}>
                          {formatDate(reward?.expiryDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {rewardHistory?.length === 0 && (
                  <div className="text-center py-8">
                    <Icon name="Gift" size={48} className="text-muted-foreground mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-foreground mb-2">Sin Recompensas Obtenidas</h4>
                    <p className="text-muted-foreground">
                      Este cliente aún no ha obtenido ninguna recompensa.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerHistoryModal;