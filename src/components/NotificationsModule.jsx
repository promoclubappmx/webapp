import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import Icon from './AppIcon';

const NotificationsModule = () => {
  const [notifications, setNotifications] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    dateRange: '7days',
    search: ''
  });
  const [loading, setLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  // Mock notifications data
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        title: 'Nueva promoción aprobada',
        message: 'Tu promoción "Descuento de Verano" ha sido aprobada y está activa',
        type: 'promotion',
        status: 'unread',
        priority: 'high',
        timestamp: new Date(Date.now() - 300000), // 5 min ago
        actionUrl: '/promotions-management'
      },
      {
        id: 2,
        title: 'Cupón canjeado',
        message: 'María González canjeó tu cupón de 20% de descuento en Café Premium',
        type: 'coupon',
        status: 'unread',
        priority: 'medium',
        timestamp: new Date(Date.now() - 900000), // 15 min ago
        actionUrl: '/coupons-management'
      },
      {
        id: 3,
        title: 'Puntos otorgados',
        message: 'Juan Pérez ganó 50 puntos por su compra de $250.00',
        type: 'loyalty',
        status: 'read',
        priority: 'low',
        timestamp: new Date(Date.now() - 1800000), // 30 min ago
        actionUrl: '/loyalty-points-system'
      },
      {
        id: 4,
        title: 'Nuevo cliente registrado',
        message: 'Ana Rodríguez se unió a tu programa de lealtad',
        type: 'customer',
        status: 'read',
        priority: 'medium',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        actionUrl: '/analytics-and-reports'
      },
      {
        id: 5,
        title: 'Actualización del sistema',
        message: 'Se ha realizado mantenimiento programado exitosamente',
        type: 'system',
        status: 'read',
        priority: 'low',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      },
      {
        id: 6,
        title: 'Recompensa canjeada',
        message: 'Cliente canjeó recompensa "Café gratis" por 100 puntos',
        type: 'reward',
        status: 'unread',
        priority: 'medium',
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        actionUrl: '/rewards-management'
      },
      {
        id: 7,
        title: '¡Racha completada!',
        message: 'María González completó 30 días consecutivos de visitas. Multiplicador: 3x',
        type: 'streak_completed',
        status: 'unread',
        priority: 'high',
        timestamp: new Date(Date.now() - 600000), // 10 min ago
        actionUrl: '/streaks-management',
        actionData: { userId: 1, streakDays: 30, multiplier: 3 }
      },
      {
        id: 8,
        title: 'Misión desbloqueada',
        message: 'Juan Pérez desbloqueó la misión "Explorador del Centro Histórico"',
        type: 'mission_unlocked',
        status: 'unread',
        priority: 'medium',
        timestamp: new Date(Date.now() - 1200000), // 20 min ago
        actionUrl: '/missions-challenges',
        actionData: { userId: 2, missionId: 5, missionName: 'Explorador del Centro Histórico' }
      },
      {
        id: 9,
        title: '¡Nivel subido!',
        message: 'Ana Rodríguez alcanzó el nivel "Pioneer" con 4,200 puntos',
        type: 'level_up',
        status: 'unread',
        priority: 'high',
        timestamp: new Date(Date.now() - 2400000), // 40 min ago
        actionUrl: '/user-levels',
        actionData: { userId: 3, newLevel: 'Pioneer', points: 4200 }
      },
      {
        id: 10,
        title: 'Badge ganado',
        message: 'Carlos Martínez ganó el badge "Maestro de Cupones" (Raro)',
        type: 'badge_earned',
        status: 'read',
        priority: 'medium',
        timestamp: new Date(Date.now() - 4800000), // 1.3 hours ago
        actionUrl: '/achievements-badges',
        actionData: { userId: 4, badgeId: 4, badgeName: 'Maestro de Cupones', rarity: 'rare' }
      }
    ];

    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  const typeOptions = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'promotion', label: 'Promociones' },
    { value: 'coupon', label: 'Cupones' },
    { value: 'loyalty', label: 'Puntos de lealtad' },
    { value: 'reward', label: 'Recompensas' },
    { value: 'customer', label: 'Clientes' },
    { value: 'system', label: 'Sistema' },
    { value: 'streak_completed', label: 'Rachas completadas' },
    { value: 'mission_unlocked', label: 'Misiones desbloqueadas' },
    { value: 'level_up', label: 'Niveles subidos' },
    { value: 'badge_earned', label: 'Badges ganados' }
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
      promotion: 'Megaphone',
      coupon: 'Ticket',
      loyalty: 'Star',
      reward: 'Gift',
      customer: 'Users',
      system: 'Settings',
      streak_completed: 'Flame',
      mission_unlocked: 'Target',
      level_up: 'TrendingUp',
      badge_earned: 'Award'
    };
    return icons?.[type] || 'Bell';
  };

  const getTypeColor = (type) => {
    const colors = {
      promotion: 'text-blue-500',
      coupon: 'text-green-500',
      loyalty: 'text-yellow-500',
      reward: 'text-purple-500',
      customer: 'text-indigo-500',
      system: 'text-gray-500',
      streak_completed: 'text-orange-500',
      mission_unlocked: 'text-blue-600',
      level_up: 'text-green-600',
      badge_earned: 'text-yellow-600'
    };
    return colors?.[type] || 'text-gray-500';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'border-l-red-500 bg-red-50',
      medium: 'border-l-yellow-500 bg-yellow-50',
      low: 'border-l-blue-500 bg-blue-50'
    };
    return colors?.[priority] || 'border-l-gray-500 bg-gray-50';
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
    return timestamp?.toLocaleDateString();
  };

  const filteredNotifications = notifications?.filter(notification => {
    if (filters?.status !== 'all' && notification?.status !== filters?.status) return false;
    if (filters?.type !== 'all' && notification?.type !== filters?.type) return false;
    if (filters?.search && !notification?.title?.toLowerCase()?.includes(filters?.search?.toLowerCase()) &&
        !notification?.message?.toLowerCase()?.includes(filters?.search?.toLowerCase())) return false;
    
    // Date range filter
    if (filters?.dateRange !== 'all') {
      const now = new Date();
      const notificationDate = new Date(notification?.timestamp);
      const diffHours = (now - notificationDate) / (1000 * 60 * 60);
      
      if (filters?.dateRange === '24hours' && diffHours > 24) return false;
      if (filters?.dateRange === '7days' && diffHours > 168) return false;
      if (filters?.dateRange === '30days' && diffHours > 720) return false;
    }
    
    return true;
  });

  const handleMarkAsRead = (notificationIds) => {
    setNotifications(prev =>
      prev?.map(notification =>
        notificationIds?.includes(notification?.id)
          ? { ...notification, status: 'read' }
          : notification
      )
    );
    setSelectedNotifications([]);
  };

  const handleMarkAsUnread = (notificationIds) => {
    setNotifications(prev =>
      prev?.map(notification =>
        notificationIds?.includes(notification?.id)
          ? { ...notification, status: 'unread' }
          : notification
      )
    );
    setSelectedNotifications([]);
  };

  const handleDelete = (notificationIds) => {
    setNotifications(prev =>
      prev?.filter(notification => !notificationIds?.includes(notification?.id))
    );
    setSelectedNotifications([]);
  };

  const handleSelectAll = () => {
    if (selectedNotifications?.length === filteredNotifications?.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications?.map(n => n?.id));
    }
  };

  const unreadCount = notifications?.filter(n => n?.status === 'unread')?.length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Notificaciones
              </h1>
              <p className="text-muted-foreground">
                Gestiona y revisa todas tus notificaciones del sistema
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <div className="bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {unreadCount} no leídas
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Buscar"
              type="text"
              placeholder="Buscar notificaciones..."
              value={filters?.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e?.target?.value }))}
              icon="Search"
            />
            <Select
              label="Estado"
              options={statusOptions}
              value={filters?.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            />
            <Select
              label="Tipo"
              options={typeOptions}
              value={filters?.type}
              onChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
            />
            <Select
              label="Período"
              options={dateRangeOptions}
              value={filters?.dateRange}
              onChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications?.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedNotifications?.length} notificaciones seleccionadas
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAsRead(selectedNotifications)}
                  iconName="Check"
                  iconPosition="left"
                >
                  Marcar como leídas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAsUnread(selectedNotifications)}
                  iconName="Mail"
                  iconPosition="left"
                >
                  Marcar como no leídas
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selectedNotifications)}
                  iconName="Trash"
                  iconPosition="left"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedNotifications?.length === filteredNotifications?.length && filteredNotifications?.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-foreground">
                Notificaciones ({filteredNotifications?.length})
              </span>
            </div>
          </div>

          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando notificaciones...</p>
              </div>
            ) : filteredNotifications?.length === 0 ? (
              <div className="p-8 text-center">
                <Icon name="Bell" size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay notificaciones que coincidan con los filtros</p>
              </div>
            ) : (
              filteredNotifications?.map((notification) => (
                <div
                  key={notification?.id}
                  className={`p-4 border-l-4 transition-colors duration-150 ${
                    notification?.status === 'unread' 
                      ? getPriorityColor(notification?.priority)
                      : 'border-l-gray-200 bg-white'
                  } ${selectedNotifications?.includes(notification?.id) ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                >
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedNotifications?.includes(notification?.id)}
                      onChange={(e) => {
                        if (e?.target?.checked) {
                          setSelectedNotifications(prev => [...prev, notification?.id]);
                        } else {
                          setSelectedNotifications(prev => prev?.filter(id => id !== notification?.id));
                        }
                      }}
                      className="w-4 h-4 mt-1"
                    />
                    
                    <div className={`p-2 rounded-lg ${getTypeColor(notification?.type)} bg-muted`}>
                      <Icon name={getTypeIcon(notification?.type)} size={20} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium ${
                          notification?.status === 'unread' ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification?.title}
                          {notification?.status === 'unread' && (
                            <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                          )}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(notification?.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification?.message}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            notification?.priority === 'high' ? 'bg-red-100 text-red-800' :
                            notification?.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {notification?.priority === 'high' ? 'Alta' :
                             notification?.priority === 'medium' ? 'Media' : 'Baja'}
                          </span>
                          <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full capitalize">
                            {typeOptions?.find(t => t?.value === notification?.type)?.label}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {notification?.actionUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.location.href = notification?.actionUrl}
                            >
                              Ver detalles
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead([notification?.id])}
                          >
                            {notification?.status === 'unread' ? 'Marcar leída' : 'Marcar no leída'}
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
      </div>
    </div>
  );
};

export default NotificationsModule;