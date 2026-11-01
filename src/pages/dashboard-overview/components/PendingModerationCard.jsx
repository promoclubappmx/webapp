import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PendingModerationCard = ({ items = [] }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'promotion':
        return 'Megaphone';
      case 'business':
        return 'Building2';
      case 'review':
        return 'MessageSquare';
      case 'media':
        return 'Image';
      default:
        return 'AlertCircle';
    }
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-foreground">Moderación Pendiente</h3>
          {items?.length > 0 && (
            <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
              {items?.length}
            </span>
          )}
        </div>
        <Button variant="outline" size="sm">
          Ver todo
        </Button>
      </div>
      <div className="space-y-3">
        {items?.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon name="CheckCircle" size={20} />
            </div>
            <p className="text-muted-foreground">No hay elementos pendientes</p>
          </div>
        ) : (
          items?.slice(0, 5)?.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors duration-150">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                  <Icon name={getTypeIcon(item?.type)} size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item?.title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(item?.priority)}`}>
                      {item?.priority === 'high' ? 'Alta' : item?.priority === 'medium' ? 'Media' : 'Baja'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item?.submittedAt)}
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Icon name="ChevronRight" size={16} />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PendingModerationCard;