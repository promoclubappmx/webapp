import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';
import NotificationDetailModal from '../../components/NotificationDetailModal';
import { supabase } from '../../lib/supabase';

const NotificationsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [filters, setFilters] = useState({
    status: 'unread',
    type: 'all',
    dateRange: '7days',
    search: ''
  });
  const [loading, setLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase?.auth?.getUser();
        if (authUser) {
          const { data: profile } = await supabase?.from('user_profiles')?.select('*')?.eq('id', authUser?.id)?.single();
          
          setUser({
            id: authUser?.id,
            email: authUser?.email,
            ...profile
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  // Fetch notifications from Supabase
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id, filters]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let query = supabase?.from('centralized_alerts')?.select('*')?.eq('business_id', user?.business_id || user?.id)?.order('created_at', { ascending: false });

      // Apply status filter
      if (filters?.status !== 'all') {
        query = query?.eq('status', filters?.status);
      }

      // Apply type filter
      if (filters?.type !== 'all') {
        query = query?.eq('alert_type', filters?.type);
      }

      // Apply date range filter
      if (filters?.dateRange !== 'all') {
        const now = new Date();
        let startDate;
        
        if (filters?.dateRange === '24hours') {
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        } else if (filters?.dateRange === '7days') {
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (filters?.dateRange === '30days') {
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        
        if (startDate) {
          query = query?.gte('created_at', startDate?.toISOString());
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      // Apply search filter locally
      let filteredData = data || [];
      if (filters?.search) {
        const searchLower = filters?.search?.toLowerCase();
        filteredData = filteredData?.filter(n => 
          n?.title?.toLowerCase()?.includes(searchLower) ||
          n?.message?.toLowerCase()?.includes(searchLower)
        );
      }

      setNotifications(filteredData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'high_value_sale', label: 'Venta de alto valor' },
    { value: 'low_stock', label: 'Stock bajo' },
    { value: 'staff_shift_start', label: 'Inicio de turno' },
    { value: 'staff_shift_end', label: 'Fin de turno' },
    { value: 'staff_no_show', label: 'Ausencia de personal' },
    { value: 'customer_milestone', label: 'Hito de cliente' },
    { value: 'customer_birthday', label: 'Cumpleaños de cliente' },
    { value: 'system', label: 'Sistema' }
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

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handleSidebarCollapseToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const getTypeIcon = (type) => {
    const icons = {
      high_value_sale: 'DollarSign',
      low_stock: 'AlertTriangle',
      staff_shift_start: 'Clock',
      staff_shift_end: 'Clock',
      staff_no_show: 'UserX',
      customer_milestone: 'Award',
      customer_birthday: 'Cake',
      system: 'Settings'
    };
    return icons?.[type] || 'Bell';
  };

  const getTypeColor = (type) => {
    const colors = {
      high_value_sale: 'text-emerald-500',
      low_stock: 'text-orange-500',
      staff_shift_start: 'text-blue-500',
      staff_shift_end: 'text-blue-500',
      staff_no_show: 'text-red-500',
      customer_milestone: 'text-purple-500',
      customer_birthday: 'text-pink-500',
      system: 'text-gray-500'
    };
    return colors?.[type] || 'text-gray-500';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'border-l-red-600 bg-red-50',
      high: 'border-l-orange-500 bg-orange-50',
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

  const handleMarkAsRead = async (notificationIds) => {
    try {
      const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
      
      const { error } = await supabase?.from('centralized_alerts')?.update({ status: 'read', updated_at: new Date()?.toISOString() })?.in('id', ids);

      if (error) throw error;

      // Refresh notifications
      await fetchNotifications();
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleMarkAsUnread = async (notificationIds) => {
    try {
      const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
      
      const { error } = await supabase?.from('centralized_alerts')?.update({ status: 'unread', updated_at: new Date()?.toISOString() })?.in('id', ids);

      if (error) throw error;

      // Refresh notifications
      await fetchNotifications();
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error marking notifications as unread:', error);
    }
  };

  const handleDelete = async (notificationIds) => {
    try {
      const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
      
      const { error } = await supabase?.from('centralized_alerts')?.delete()?.in('id', ids);

      if (error) throw error;

      // Refresh notifications
      await fetchNotifications();
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error deleting notifications:', error);
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifications?.length === filteredNotifications?.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications?.map(n => n?.id));
    }
  };

  const unreadCount = notifications?.filter(n => n?.status === 'unread')?.length;

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user} 
        onMenuToggle={handleSidebarToggle}
        isMenuOpen={isSidebarOpen}
        onToggleCollapse={handleSidebarCollapseToggle}
      />
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={handleSidebarClose}
        user={user}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleSidebarCollapseToggle}
      />
      <main 
        className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
        style={{
          transitionProperty: 'margin-left',
          transitionDuration: '500ms',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="p-6">

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
                              notification?.priority === 'critical' ? 'bg-red-100 text-red-800' :
                              notification?.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              notification?.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {notification?.priority === 'critical' ? 'Crítica' :
                               notification?.priority === 'high' ? 'Alta' :
                               notification?.priority === 'medium' ? 'Media' : 'Baja'}
                            </span>
                            <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full capitalize">
                              {typeOptions?.find(t => t?.value === notification?.alert_type)?.label}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e?.stopPropagation();
                                handleNotificationClick(notification);
                              }}
                            >
                              Ver detalle
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e?.stopPropagation();
                                if (notification?.status === 'unread') {
                                  handleMarkAsRead([notification?.id]);
                                } else {
                                  handleMarkAsUnread([notification?.id]);
                                }
                              }}
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
      </main>
      {/* Notification Detail Modal */}
      {showDetailModal && selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedNotification(null);
          }}
          onMarkAsRead={handleMarkAsRead}
        />
      )}
    </div>
  );
};

export default NotificationsPage;