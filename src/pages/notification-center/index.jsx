import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const NotificationCenter = () => {
  const { user: authUser, userProfile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    dateRange: '30days',
    search: ''
  });
  const [loading, setLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [error, setError] = useState(null);

  const businessId = authUser?.id;

  const fetchNotifications = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch from campaign_notifications (business notifications)
      const { data: campaignNotifs, error: cnError } = await supabase
        ?.from('campaign_notifications')
        ?.select('id, title, message, is_read, created_at, milestone_type, metadata, campaign_id')
        ?.eq('business_id', businessId)
        ?.order('created_at', { ascending: false })
        ?.limit(100);

      if (cnError) throw cnError;

      // Fetch from alert_settings for system alerts context
      const { data: alertData } = await supabase
        ?.from('alert_settings')
        ?.select('id, alert_type, message, is_active, created_at')
        ?.eq('business_id', businessId)
        ?.order('created_at', { ascending: false })
        ?.limit(50);

      // Map campaign_notifications to unified format
      const mappedCampaign = (campaignNotifs || [])?.map(n => ({
        id: n?.id,
        title: n?.title || 'Notificación',
        message: n?.message || '',
        type: mapMilestoneType(n?.milestone_type),
        status: n?.is_read ? 'read' : 'unread',
        priority: getPriorityFromType(n?.milestone_type),
        timestamp: new Date(n?.created_at),
        actionUrl: n?.campaign_id ? '/campaign-dashboard' : null,
        actionData: n?.metadata || {},
        source: 'campaign',
      }));

      // Map alert_settings to unified format
      const mappedAlerts = (alertData || [])?.map(a => ({
        id: `alert-${a?.id}`,
        title: getAlertTitle(a?.alert_type),
        message: a?.message || getAlertMessage(a?.alert_type),
        type: 'system_alert',
        status: 'read',
        priority: 'medium',
        timestamp: new Date(a?.created_at),
        actionUrl: null,
        actionData: {},
        source: 'alert',
      }));

      const allNotifications = [...mappedCampaign, ...mappedAlerts]
        ?.sort((a, b) => b?.timestamp - a?.timestamp);

      setNotifications(allNotifications);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('No se pudieron cargar las notificaciones.');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time subscription for new notifications
  useEffect(() => {
    if (!businessId) return;
    const channel = supabase
      ?.channel('notification-center-realtime')
      ?.on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'campaign_notifications',
        filter: `business_id=eq.${businessId}`,
      }, (payload) => {
        const n = payload?.new;
        const newNotif = {
          id: n?.id,
          title: n?.title || 'Nueva notificación',
          message: n?.message || '',
          type: mapMilestoneType(n?.milestone_type),
          status: 'unread',
          priority: getPriorityFromType(n?.milestone_type),
          timestamp: new Date(n?.created_at),
          actionUrl: n?.campaign_id ? '/campaign-dashboard' : null,
          actionData: n?.metadata || {},
          source: 'campaign',
        };
        setNotifications(prev => [newNotif, ...prev]);
      })
      ?.subscribe();

    return () => supabase?.removeChannel(channel);
  }, [businessId]);

  const mapMilestoneType = (type) => {
    const map = {
      payment_confirmed: 'payment_confirmation',
      payment_failed: 'failed_charge',
      renewal_reminder: 'renewal_reminder',
      invoice_ready: 'invoice_update',
      campaign_milestone: 'campaign_milestone',
      loyalty_milestone: 'loyalty_milestone',
      checkin_alert: 'checkin_alert',
    };
    return map?.[type] || 'system_alert';
  };

  const getPriorityFromType = (type) => {
    const high = ['payment_failed', 'failed_charge'];
    const medium = ['renewal_reminder', 'campaign_milestone'];
    if (high?.includes(type)) return 'high';
    if (medium?.includes(type)) return 'medium';
    return 'low';
  };

  const getAlertTitle = (type) => {
    const titles = {
      low_stock: 'Alerta de Stock Bajo',
      new_review: 'Nueva Reseña',
      checkin_spike: 'Pico de Check-ins',
      coupon_expiry: 'Cupón por Vencer',
      loyalty_milestone: 'Hito de Lealtad',
    };
    return titles?.[type] || 'Alerta del Sistema';
  };

  const getAlertMessage = (type) => {
    const msgs = {
      low_stock: 'Un producto está por debajo del nivel mínimo de stock.',
      new_review: 'Tu negocio recibió una nueva reseña.',
      checkin_spike: 'Se detectó un aumento inusual en check-ins.',
      coupon_expiry: 'Uno o más cupones están próximos a vencer.',
      loyalty_milestone: 'Un cliente alcanzó un hito en el programa de lealtad.',
    };
    return msgs?.[type] || 'Alerta generada por el sistema.';
  };

  const typeOptions = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'payment_confirmation', label: 'Confirmaciones de Pago' },
    { value: 'failed_charge', label: 'Cargos Fallidos' },
    { value: 'renewal_reminder', label: 'Recordatorios de Renovación' },
    { value: 'invoice_update', label: 'Actualizaciones de Facturas' },
    { value: 'campaign_milestone', label: 'Hitos de Campaña' },
    { value: 'system_alert', label: 'Alertas del Sistema' },
  ];

  const statusOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'unread', label: 'No leídas' },
    { value: 'read', label: 'Leídas' }
  ];

  const dateRangeOptions = [
    { value: '24hours', label: 'Últimas 24 horas' },
    { value: '7days', label: 'Última semana' },
    { value: '30days', label: 'Último mes' },
    { value: 'all', label: 'Todas' }
  ];

  const getTypeIcon = (type) => {
    const icons = {
      payment_confirmation: 'CheckCircle',
      failed_charge: 'XCircle',
      renewal_reminder: 'Clock',
      invoice_update: 'FileText',
      campaign_milestone: 'TrendingUp',
      loyalty_milestone: 'Award',
      checkin_alert: 'MapPin',
      system_alert: 'AlertCircle',
    };
    return icons?.[type] || 'Bell';
  };

  const getTypeColor = (type) => {
    const colors = {
      payment_confirmation: 'text-green-600',
      failed_charge: 'text-red-600',
      renewal_reminder: 'text-blue-600',
      invoice_update: 'text-purple-600',
      campaign_milestone: 'text-amber-600',
      loyalty_milestone: 'text-indigo-600',
      system_alert: 'text-gray-600',
    };
    return colors?.[type] || 'text-gray-500';
  };

  const getTypeBgColor = (type) => {
    const colors = {
      payment_confirmation: 'bg-green-100',
      failed_charge: 'bg-red-100',
      renewal_reminder: 'bg-blue-100',
      invoice_update: 'bg-purple-100',
      campaign_milestone: 'bg-amber-100',
      loyalty_milestone: 'bg-indigo-100',
      system_alert: 'bg-gray-100',
    };
    return colors?.[type] || 'bg-gray-100';
  };

  const getPriorityBorder = (priority) => {
    const colors = {
      high: 'border-l-red-500',
      medium: 'border-l-yellow-500',
      low: 'border-l-blue-500',
    };
    return colors?.[priority] || 'border-l-gray-300';
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'ahora';
    if (minutes < 60) return `hace ${minutes} min`;
    if (hours < 24) return `hace ${hours}h`;
    if (days < 7) return `hace ${days}d`;
    return timestamp?.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filteredNotifications = notifications?.filter(notification => {
    if (filters?.status !== 'all' && notification?.status !== filters?.status) return false;
    if (filters?.type !== 'all' && notification?.type !== filters?.type) return false;
    if (filters?.search && !notification?.title?.toLowerCase()?.includes(filters?.search?.toLowerCase()) &&
        !notification?.message?.toLowerCase()?.includes(filters?.search?.toLowerCase())) return false;
    if (filters?.dateRange !== 'all') {
      const now = new Date();
      const diffHours = (now - notification?.timestamp) / (1000 * 60 * 60);
      if (filters?.dateRange === '24hours' && diffHours > 24) return false;
      if (filters?.dateRange === '7days' && diffHours > 168) return false;
      if (filters?.dateRange === '30days' && diffHours > 720) return false;
    }
    return true;
  });

  const handleMarkAsRead = async (notificationIds) => {
    // Update in Supabase for campaign_notifications
    const campaignIds = notificationIds?.filter(id => !String(id)?.startsWith('alert-'));
    if (campaignIds?.length > 0) {
      await supabase
        ?.from('campaign_notifications')
        ?.update({ is_read: true })
        ?.in('id', campaignIds);
    }
    setNotifications(prev =>
      prev?.map(n => notificationIds?.includes(n?.id) ? { ...n, status: 'read' } : n)
    );
    setSelectedNotifications([]);
  };

  const handleMarkAsUnread = async (notificationIds) => {
    const campaignIds = notificationIds?.filter(id => !String(id)?.startsWith('alert-'));
    if (campaignIds?.length > 0) {
      await supabase
        ?.from('campaign_notifications')
        ?.update({ is_read: false })
        ?.in('id', campaignIds);
    }
    setNotifications(prev =>
      prev?.map(n => notificationIds?.includes(n?.id) ? { ...n, status: 'unread' } : n)
    );
    setSelectedNotifications([]);
  };

  const handleDelete = async (notificationIds) => {
    const campaignIds = notificationIds?.filter(id => !String(id)?.startsWith('alert-'));
    if (campaignIds?.length > 0) {
      await supabase
        ?.from('campaign_notifications')
        ?.delete()
        ?.in('id', campaignIds);
    }
    setNotifications(prev => prev?.filter(n => !notificationIds?.includes(n?.id)));
    setSelectedNotifications([]);
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev =>
      prev?.includes(notificationId)
        ? prev?.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications?.length === filteredNotifications?.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications?.map(n => n?.id));
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications?.filter(n => n?.status === 'unread')?.map(n => n?.id);
    if (unreadIds?.length > 0) await handleMarkAsRead(unreadIds);
  };

  const unreadCount = notifications?.filter(n => n?.status === 'unread')?.length;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        user={userProfile || authUser}
      />

      <div className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}
        style={{ transitionProperty: 'margin-left', transitionDuration: '500ms', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}>
        <Header
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isMenuOpen={isSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          user={userProfile || authUser}
        />

        <main className="p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Centro de Notificaciones</h1>
                  <p className="text-muted-foreground mt-1">Gestiona todas tus notificaciones del negocio</p>
                </div>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <span className="bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1 rounded-full">
                      {unreadCount} sin leer
                    </span>
                  )}
                  {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                      <Icon name="CheckCheck" size={16} className="mr-2" />
                      Marcar todas como leídas
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={fetchNotifications}>
                    <Icon name="RefreshCw" size={16} className="mr-2" />
                    Actualizar
                  </Button>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-card rounded-lg border border-border p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Buscar notificaciones..."
                  value={filters?.search}
                  onChange={(e) => setFilters({ ...filters, search: e?.target?.value })}
                />
                <Select
                  options={typeOptions}
                  value={filters?.type}
                  onChange={(value) => setFilters({ ...filters, type: value })}
                  placeholder="Tipo"
                />
                <Select
                  options={statusOptions}
                  value={filters?.status}
                  onChange={(value) => setFilters({ ...filters, status: value })}
                  placeholder="Estado"
                />
                <Select
                  options={dateRangeOptions}
                  value={filters?.dateRange}
                  onChange={(value) => setFilters({ ...filters, dateRange: value })}
                  placeholder="Período"
                />
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedNotifications?.length > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
                <span className="text-sm font-semibold text-foreground">
                  {selectedNotifications?.length} notificación(es) seleccionada(s)
                </span>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => handleMarkAsRead(selectedNotifications)}>
                    <Icon name="Check" size={16} className="mr-2" />
                    Marcar como leída
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleMarkAsUnread(selectedNotifications)}>
                    <Icon name="Mail" size={16} className="mr-2" />
                    Marcar como no leída
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(selectedNotifications)} className="text-destructive hover:bg-destructive/10 border-destructive/30">
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              </div>
            )}

            {/* Select All row */}
            {filteredNotifications?.length > 0 && (
              <div className="flex items-center gap-3 mb-3 px-1">
                <input
                  type="checkbox"
                  checked={selectedNotifications?.length === filteredNotifications?.length && filteredNotifications?.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">Seleccionar todas</span>
              </div>
            )}

            {/* Notifications List */}
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-16">
                  <Icon name="Loader" size={36} className="text-primary animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Cargando notificaciones...</p>
                </div>
              ) : error ? (
                <div className="bg-card rounded-lg border border-border p-12 text-center">
                  <Icon name="AlertCircle" size={40} className="text-destructive mx-auto mb-4" />
                  <p className="text-foreground font-medium mb-2">Error al cargar notificaciones</p>
                  <p className="text-muted-foreground text-sm mb-4">{error}</p>
                  <Button variant="outline" onClick={fetchNotifications}>
                    <Icon name="RefreshCw" size={16} className="mr-2" />
                    Reintentar
                  </Button>
                </div>
              ) : filteredNotifications?.length === 0 ? (
                <div className="bg-card rounded-lg border border-border p-16 text-center">
                  <Icon name="Bell" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground font-medium text-lg">No hay notificaciones</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    {notifications?.length === 0
                      ? 'Aún no tienes notificaciones. Las recibirás cuando haya actividad en tu negocio.'
                      : 'Intenta ajustar los filtros para ver más resultados.'}
                  </p>
                </div>
              ) : (
                filteredNotifications?.map((notification) => (
                  <div
                    key={notification?.id}
                    className={`bg-card rounded-lg border-l-4 border border-border p-5 hover:shadow-sm transition-shadow ${getPriorityBorder(notification?.priority)} ${notification?.status === 'unread' ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedNotifications?.includes(notification?.id)}
                        onChange={() => handleSelectNotification(notification?.id)}
                        className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary flex-shrink-0"
                      />
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeBgColor(notification?.type)}`}>
                        <Icon name={getTypeIcon(notification?.type)} size={20} className={getTypeColor(notification?.type)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-semibold text-foreground">{notification?.title}</h3>
                            {notification?.status === 'unread' && (
                              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">Nuevo</span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification?.message}</p>
                        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                          <span className="text-xs text-muted-foreground">{formatTimestamp(notification?.timestamp)}</span>
                          <div className="flex gap-2">
                            {notification?.actionUrl && (
                              <Button variant="outline" size="sm" onClick={() => window.location.href = notification?.actionUrl}>
                                Ver Detalles
                              </Button>
                            )}
                            {notification?.status === 'unread' ? (
                              <Button variant="outline" size="sm" onClick={() => handleMarkAsRead([notification?.id])}>
                                <Icon name="Check" size={15} />
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => handleMarkAsUnread([notification?.id])}>
                                <Icon name="Mail" size={15} />
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => handleDelete([notification?.id])} className="text-destructive hover:bg-destructive/10 border-destructive/30">
                              <Icon name="Trash2" size={15} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotificationCenter;