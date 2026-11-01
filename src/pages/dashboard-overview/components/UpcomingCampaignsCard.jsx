import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UpcomingCampaignsCard = ({ campaigns = [] }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-primary/10 text-primary';
      case 'draft':
        return 'bg-muted text-muted-foreground';
      case 'pending':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'promotion':
        return 'Megaphone';
      case 'coupon':
        return 'Ticket';
      case 'loyalty':
        return 'Star';
      case 'event':
        return 'Calendar';
      default:
        return 'Clock';
    }
  };

  const formatDateTime = (date) => {
    return new Date(date)?.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntil = (date) => {
    const now = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays > 0) return `En ${diffDays} días`;
    return 'Vencido';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Próximas Campañas</h3>
        <Button variant="outline" size="sm" href="/promotions-management">
          Ver todas
        </Button>
      </div>
      <div className="space-y-3">
        {campaigns?.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon name="Calendar" size={20} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No hay campañas programadas</p>
          </div>
        ) : (
          campaigns?.slice(0, 4)?.map((campaign, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors duration-150">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                  <Icon name={getTypeIcon(campaign?.type)} size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{campaign?.title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(campaign?.status)}`}>
                      {campaign?.status === 'scheduled' ? 'Programada' : 
                       campaign?.status === 'draft' ? 'Borrador' : 
                       campaign?.status === 'pending' ? 'Pendiente' : campaign?.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(campaign?.startDate)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {getDaysUntil(campaign?.startDate)}
                </p>
                <Button variant="ghost" size="sm" className="mt-1">
                  <Icon name="ChevronRight" size={16} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingCampaignsCard;