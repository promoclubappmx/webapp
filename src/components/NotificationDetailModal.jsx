import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import Icon from './AppIcon';

const NotificationDetailModal = ({ notification, onClose, onMarkAsRead }) => {
  const navigate = useNavigate();

  if (!notification) return null;

  const getTypeIcon = (type) => {
    const icons = {
      promotion: 'Megaphone',
      coupon: 'Ticket',
      loyalty: 'Star',
      reward: 'Gift',
      customer: 'Users',
      system: 'Settings',
      high_value_sale: 'DollarSign',
      low_stock: 'AlertTriangle',
      staff_shift_start: 'Clock',
      staff_shift_end: 'Clock',
      staff_no_show: 'UserX',
      customer_milestone: 'Award',
      customer_birthday: 'Cake'
    };
    return icons?.[type] || 'Bell';
  };

  const getTypeColor = (type) => {
    const colors = {
      promotion: 'text-blue-500 bg-blue-50',
      coupon: 'text-blue-500 bg-blue-50',
      loyalty: 'text-yellow-500 bg-yellow-50',
      reward: 'text-purple-500 bg-purple-50',
      customer: 'text-indigo-500 bg-indigo-50',
      system: 'text-gray-500 bg-gray-50',
      high_value_sale: 'text-emerald-500 bg-emerald-50',
      low_stock: 'text-orange-500 bg-orange-50',
      staff_shift_start: 'text-blue-500 bg-blue-50',
      staff_shift_end: 'text-blue-500 bg-blue-50',
      staff_no_show: 'text-red-500 bg-red-50',
      customer_milestone: 'text-purple-500 bg-purple-50',
      customer_birthday: 'text-pink-500 bg-pink-50'
    };
    return colors?.[type] || 'text-gray-500 bg-gray-50';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      critical: 'Crítica',
      high: 'Alta',
      medium: 'Media',
      low: 'Baja'
    };
    return labels?.[priority] || priority;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };
    return colors?.[priority] || 'bg-gray-100 text-gray-800';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date?.toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleNavigateToModule = () => {
    if (notification?.action_url || notification?.actionUrl) {
      const url = notification?.action_url || notification?.actionUrl;
      navigate(url);
      onClose();
    }
  };

  const handleMarkAsReadAndClose = async () => {
    if (notification?.status === 'unread') {
      await onMarkAsRead(notification?.id);
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fadeIn"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-card border border-border rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scaleIn"
          onClick={(e) => e?.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-border">
            <div className="flex items-start space-x-4 flex-1">
              <div className={`p-3 rounded-lg ${getTypeColor(notification?.alert_type || notification?.type)}`}>
                <Icon name={getTypeIcon(notification?.alert_type || notification?.type)} size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground mb-1">
                  {notification?.title}
                </h2>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(notification?.priority)}`}>
                    {getPriorityLabel(notification?.priority)}
                  </span>
                  {notification?.status === 'unread' && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      No leída
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="space-y-4">
              {/* Timestamp */}
              <div className="flex items-center text-sm text-muted-foreground">
                <Icon name="Clock" size={16} className="mr-2" />
                {formatTimestamp(notification?.created_at || notification?.timestamp)}
              </div>

              {/* Message */}
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-foreground leading-relaxed">
                  {notification?.message}
                </p>
              </div>

              {/* Additional metadata if available */}
              {notification?.metadata && Object.keys(notification?.metadata)?.length > 0 && (
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-medium text-foreground mb-2">Información adicional</h3>
                  <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    {Object.entries(notification?.metadata)?.map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{key?.replace(/_/g, ' ')}:</span>
                        <span className="text-foreground font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-6 border-t border-border bg-muted/20">
            <div className="flex items-center space-x-2">
              {notification?.status === 'unread' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMarkAsRead(notification?.id)}
                  iconName="Check"
                  iconPosition="left"
                >
                  Marcar como leída
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {(notification?.action_url || notification?.actionUrl) && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleNavigateToModule}
                  iconName="ExternalLink"
                  iconPosition="right"
                >
                  Ir al módulo
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAsReadAndClose}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationDetailModal;