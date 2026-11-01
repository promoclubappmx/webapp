import React from 'react';
import Icon from '../../../components/AppIcon';

const ActivityFeed = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'promotion':
        return 'Megaphone';
      case 'coupon':
        return 'Ticket';
      case 'loyalty':
        return 'Star';
      case 'customer':
        return 'Users';
      case 'system':
        return 'Settings';
      default:
        return 'Bell';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'promotion':
        return 'text-primary bg-primary/10';
      case 'coupon':
        return 'text-warning bg-warning/10';
      case 'loyalty':
        return 'text-success bg-success/10';
      case 'customer':
        return 'text-accent bg-accent/10';
      case 'system':
        return 'text-muted-foreground bg-muted';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Actividad Reciente</h3>
        <button className="text-sm text-primary hover:text-primary/80 transition-colors duration-150">
          Ver todo
        </button>
      </div>
      <div className="space-y-4">
        {activities?.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon name="Activity" size={20} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No hay actividad reciente</p>
          </div>
        ) : (
          activities?.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 pb-4 border-b border-border last:border-b-0 last:pb-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity?.type)}`}>
                <Icon name={getActivityIcon(activity?.type)} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground font-medium">{activity?.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity?.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatTime(activity?.timestamp)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;