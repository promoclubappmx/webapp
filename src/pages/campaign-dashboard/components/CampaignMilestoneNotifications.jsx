import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import {
  fetchCampaignNotifications,
  markCampaignNotificationRead,
  markAllCampaignNotificationsRead,
  subscribeToCampaignNotifications,
  MILESTONE_CONFIG,
} from '../../../services/campaignNotificationService';

const CampaignMilestoneNotifications = ({ campaignId, businessId, campaignName }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newNotifIds, setNewNotifIds] = useState([]);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchCampaignNotifications(campaignId, businessId);
    setNotifications(data);
    setIsLoading(false);
  }, [campaignId, businessId]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Supabase Realtime subscription
  useEffect(() => {
    if (!campaignId) return;
    const channel = subscribeToCampaignNotifications(campaignId, businessId, (newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
      setNewNotifIds(prev => [...prev, newNotif?.id]);
      // Remove "new" highlight after 5s
      setTimeout(() => {
        setNewNotifIds(prev => prev?.filter(id => id !== newNotif?.id));
      }, 5000);
    });
    return () => {
      channel?.unsubscribe?.();
    };
  }, [campaignId, businessId]);

  const handleMarkRead = async (notifId) => {
    await markCampaignNotificationRead(notifId);
    setNotifications(prev =>
      prev?.map(n => n?.id === notifId ? { ...n, is_read: true } : n)
    );
  };

  const handleMarkAllRead = async () => {
    await markAllCampaignNotificationsRead(campaignId);
    setNotifications(prev => prev?.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications?.filter(n => !n?.is_read)?.length || 0;

  const formatTime = (ts) => {
    if (!ts) return '';
    const diff = Date.now() - new Date(ts)?.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'ahora mismo';
    if (mins < 60) return `hace ${mins} min`;
    if (hours < 24) return `hace ${hours}h`;
    return `hace ${days}d`;
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Bell" size={18} className="text-primary" />
          <span className="font-semibold text-foreground">Notificaciones de hitos</span>
        </div>
        <div className="space-y-2">
          {[1, 2]?.map(i => (
            <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (notifications?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Bell" size={18} className="text-primary" />
          <span className="font-semibold text-foreground">Notificaciones de hitos</span>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full ml-auto">Tiempo real</span>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
            <Icon name="BellOff" size={20} className="text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Sin notificaciones de hitos aún</p>
          <p className="text-xs text-muted-foreground mt-1">Recibirás alertas cuando la campaña alcance hitos importantes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon name="Bell" size={18} className="text-primary" />
          <span className="font-semibold text-foreground">Notificaciones de hitos</span>
          {unreadCount > 0 && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
              {unreadCount} nueva{unreadCount !== 1 ? 's' : ''}
            </span>
          )}
          <span className="ml-2 flex items-center gap-1 text-xs text-success">
            <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
            Tiempo real
          </span>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-primary hover:underline transition-colors"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="divide-y divide-border max-h-80 overflow-y-auto">
        {notifications?.map(notif => {
          const config = MILESTONE_CONFIG?.[notif?.milestone_type] || {
            icon: 'Bell',
            color: 'text-primary',
            bg: 'bg-primary/10',
            border: 'border-primary/20',
          };
          const isNew = newNotifIds?.includes(notif?.id);

          return (
            <div
              key={notif?.id}
              className={`flex items-start gap-3 px-5 py-3.5 transition-all duration-500 ${
                isNew ? 'bg-primary/5 border-l-2 border-l-primary' :
                !notif?.is_read ? 'bg-muted/30' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-lg ${config?.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon name={config?.icon} size={15} className={config?.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium leading-tight ${
                    !notif?.is_read ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {notif?.title}
                  </p>
                  {!notif?.is_read && (
                    <button
                      onClick={() => handleMarkRead(notif?.id)}
                      className="flex-shrink-0 p-0.5 hover:bg-muted rounded transition-colors"
                      title="Marcar como leída"
                    >
                      <Icon name="Check" size={12} className="text-muted-foreground" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif?.message}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">{formatTime(notif?.created_at)}</p>
              </div>
              {!notif?.is_read && (
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CampaignMilestoneNotifications;
