import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const CentralizedAlerts = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState(null);
  const [user, setUser] = useState({ name: 'Usuario', role: 'owner' });
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    priority: 'all',
    dateRange: '7days',
    search: ''
  });
  const [selectedAlerts, setSelectedAlerts] = useState([]);
  const navigate = useNavigate();

  // Get business ID from user profile
  useEffect(() => {
    const fetchBusinessId = async () => {
      const { data: { session } } = await supabase?.auth?.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        ?.from('user_profiles')
        ?.select('user_id')
        ?.eq('id', session?.user?.id)
        ?.single();

      if (profile?.user_id) {
        setBusinessId(profile?.user_id);
      }
      if (session?.user) {
        setUser({
          name: session?.user?.email || 'Usuario',
          role: 'owner'
        });
      }
    };

    fetchBusinessId();
  }, [navigate]);

  // Fetch alerts from database
  useEffect(() => {
    if (!businessId) return;

    const fetchAlerts = async () => {
      setLoading(true);
      try {
        let query = supabase
          ?.from('centralized_alerts')
          ?.select('*')
          ?.eq('business_id', businessId)
          ?.order('created_at', { ascending: false });

        // Apply date range filter
        if (filters?.dateRange !== 'all') {
          const now = new Date();
          let startDate = new Date();
          
          if (filters?.dateRange === '24hours') {
            startDate?.setHours(now?.getHours() - 24);
          } else if (filters?.dateRange === '7days') {
            startDate?.setDate(now?.getDate() - 7);
          } else if (filters?.dateRange === '30days') {
            startDate?.setDate(now?.getDate() - 30);
          }
          
          query = query?.gte('created_at', startDate?.toISOString());
        }

        const { data, error } = await query;

        if (error) throw error;
        setAlerts(data || []);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [businessId, filters?.dateRange]);

  // Real-time subscription for new alerts
  useEffect(() => {
    if (!businessId) return;

    const channel = supabase
      ?.channel('centralized_alerts_changes')
      ?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'centralized_alerts',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          console.log('Alert change detected:', payload);
          if (payload?.eventType === 'INSERT') {
            setAlerts(prev => [payload?.new, ...prev]);
          } else if (payload?.eventType === 'UPDATE') {
            setAlerts(prev => prev?.map(alert => 
              alert?.id === payload?.new?.id ? payload?.new : alert
            ));
          } else if (payload?.eventType === 'DELETE') {
            setAlerts(prev => prev?.filter(alert => alert?.id !== payload?.old?.id));
          }
        }
      )
      ?.subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [businessId]);

  const typeOptions = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'high_value_sale', label: 'Ventas de Alto Valor' },
    { value: 'low_stock', label: 'Stock Bajo' },
    { value: 'staff_shift_start', label: 'Inicio de Turno' },
    { value: 'staff_shift_end', label: 'Fin de Turno' },
    { value: 'staff_no_show', label: 'Personal No Presentado' },
    { value: 'customer_milestone', label: 'Hitos de Clientes' },
    { value: 'customer_birthday', label: 'Cumpleaños de Clientes' },
    { value: 'system', label: 'Sistema' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'unread', label: 'No leídas' },
    { value: 'read', label: 'Leídas' },
    { value: 'dismissed', label: 'Descartadas' },
    { value: 'actioned', label: 'Accionadas' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'Todas las prioridades' },
    { value: 'critical', label: 'Crítica' },
    { value: 'high', label: 'Alta' },
    { value: 'medium', label: 'Media' },
    { value: 'low', label: 'Baja' }
  ];

  const dateRangeOptions = [
    { value: '24hours', label: 'Últimas 24 horas' },
    { value: '7days', label: 'Última semana' },
    { value: '30days', label: 'Último mes' },
    { value: 'all', label: 'Todas' }
  ];

  const getTypeIcon = (type) => {
    const icons = {
      high_value_sale: 'TrendingUp',
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
      high_value_sale: 'text-green-500',
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

  const getPriorityBadgeColor = (priority) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };
    return colors?.[priority] || 'bg-gray-100 text-gray-800';
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const alertDate = new Date(timestamp);
    const diff = now - alertDate;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'ahora';
    if (minutes < 60) return `hace ${minutes} min`;
    if (hours < 24) return `hace ${hours}h`;
    if (days < 7) return `hace ${days}d`;
    return alertDate?.toLocaleDateString('es-ES');
  };

  const filteredAlerts = alerts?.filter(alert => {
    if (filters?.status !== 'all' && alert?.status !== filters?.status) return false;
    if (filters?.type !== 'all' && alert?.alert_type !== filters?.type) return false;
    if (filters?.priority !== 'all' && alert?.priority !== filters?.priority) return false;
    if (filters?.search && !alert?.title?.toLowerCase()?.includes(filters?.search?.toLowerCase()) &&
        !alert?.message?.toLowerCase()?.includes(filters?.search?.toLowerCase())) return false;
    return true;
  });

  const handleMarkAsRead = async (alertIds) => {
    try {
      const { error } = await supabase
        ?.from('centralized_alerts')
        ?.update({ status: 'read', updated_at: new Date()?.toISOString() })
        ?.in('id', alertIds);

      if (error) throw error;
      setSelectedAlerts([]);
    } catch (error) {
      console.error('Error marking alerts as read:', error);
    }
  };

  const handleDismiss = async (alertIds) => {
    try {
      const { data: { session } } = await supabase?.auth?.getSession();
      
      const { error } = await supabase
        ?.from('centralized_alerts')
        ?.update({ 
          status: 'dismissed', 
          is_dismissed: true,
          dismissed_at: new Date()?.toISOString(),
          dismissed_by: session?.user?.id,
          updated_at: new Date()?.toISOString()
        })
        ?.in('id', alertIds);

      if (error) throw error;
      setSelectedAlerts([]);
    } catch (error) {
      console.error('Error dismissing alerts:', error);
    }
  };

  const handleAlertClick = (alert) => {
    // Mark as read
    if (alert?.status === 'unread') {
      handleMarkAsRead([alert?.id]);
    }

    // Navigate to action URL if available
    if (alert?.action_url) {
      navigate(alert?.action_url);
    }
  };

  const handleSelectAll = () => {
    if (selectedAlerts?.length === filteredAlerts?.length) {
      setSelectedAlerts([]);
    } else {
      setSelectedAlerts(filteredAlerts?.map(a => a?.id));
    }
  };

  const unreadCount = alerts?.filter(a => a?.status === 'unread')?.length;
  const criticalCount = alerts?.filter(a => a?.priority === 'critical' && a?.status !== 'dismissed')?.length;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        user={user}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={user}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${
          isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}>
          <div className="p-6 space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Alertas Centralizadas</h1>
                <p className="text-muted-foreground mt-1">
                  Monitorea todas las alertas en tiempo real
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  iconName="Settings"
                  onClick={() => navigate('/alert-settings')}
                >
                  Configurar Alertas
                </Button>
                <Button
                  variant="outline"
                  iconName="RefreshCw"
                  onClick={() => setFilters({ ...filters, dateRange: '7days' })}
                >
                  Actualizar
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Input
                  type="text"
                  placeholder="Buscar alertas..."
                  value={filters?.search}
                  onChange={(e) => setFilters({ ...filters, search: e?.target?.value })}
                />
                <Select
                  options={typeOptions}
                  value={filters?.type}
                  onChange={(value) => setFilters({ ...filters, type: value })}
                  placeholder="Tipo de alerta"
                />
                <Select
                  options={statusOptions}
                  value={filters?.status}
                  onChange={(value) => setFilters({ ...filters, status: value })}
                  placeholder="Estado"
                />
                <Select
                  options={priorityOptions}
                  value={filters?.priority}
                  onChange={(value) => setFilters({ ...filters, priority: value })}
                  placeholder="Prioridad"
                />
                <Select
                  options={dateRangeOptions}
                  value={filters?.dateRange}
                  onChange={(value) => setFilters({ ...filters, dateRange: value })}
                  placeholder="Rango de fecha"
                />
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedAlerts?.length > 0 && (
              <div className="bg-primary/10 border border-primary rounded-lg p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {selectedAlerts?.length} alerta(s) seleccionada(s)
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAsRead(selectedAlerts)}
                    iconName="Check"
                  >
                    Marcar como leídas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDismiss(selectedAlerts)}
                    iconName="X"
                  >
                    Descartar
                  </Button>
                </div>
              </div>
            )}

            {/* Alerts List */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : filteredAlerts?.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Inbox" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay alertas que mostrar</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {/* Select All */}
                  <div className="p-4 bg-muted/30 flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedAlerts?.length === filteredAlerts?.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                      Seleccionar todas ({filteredAlerts?.length})
                    </span>
                  </div>

                  {/* Alert Items */}
                  {filteredAlerts?.map(alert => (
                    <div
                      key={alert?.id}
                      className={`border-l-4 transition-colors hover:bg-muted/30 ${
                        getPriorityColor(alert?.priority)
                      } ${
                        alert?.status === 'unread' ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="p-4 flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={selectedAlerts?.includes(alert?.id)}
                          onChange={(e) => {
                            if (e?.target?.checked) {
                              setSelectedAlerts([...selectedAlerts, alert?.id]);
                            } else {
                              setSelectedAlerts(selectedAlerts?.filter(id => id !== alert?.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-border mt-1"
                          onClick={(e) => e?.stopPropagation()}
                        />

                        <div
                          className={`p-3 rounded-lg ${
                            alert?.status === 'unread' ? 'bg-primary/10' : 'bg-muted'
                          }`}
                        >
                          <Icon
                            name={getTypeIcon(alert?.alert_type)}
                            size={24}
                            className={getTypeColor(alert?.alert_type)}
                          />
                        </div>

                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleAlertClick(alert)}>
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1">
                              <h3 className={`font-semibold text-foreground ${
                                alert?.status === 'unread' ? 'font-bold' : ''
                              }`}>
                                {alert?.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {alert?.message}
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                              getPriorityBadgeColor(alert?.priority)
                            }`}>
                              {alert?.priority === 'critical' ? 'Crítica' :
                               alert?.priority === 'high' ? 'Alta' :
                               alert?.priority === 'medium' ? 'Media' : 'Baja'}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Icon name="Clock" size={12} />
                              {formatTimestamp(alert?.created_at)}
                            </span>
                            {alert?.status === 'unread' && (
                              <span className="flex items-center gap-1 text-primary font-medium">
                                <Icon name="Circle" size={8} className="fill-current" />
                                Nueva
                              </span>
                            )}
                            {alert?.action_url && (
                              <span className="flex items-center gap-1 text-primary">
                                <Icon name="ExternalLink" size={12} />
                                Ver detalles
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {alert?.status === 'unread' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e?.stopPropagation();
                                handleMarkAsRead([alert?.id]);
                              }}
                              iconName="Check"
                            />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e?.stopPropagation();
                              handleDismiss([alert?.id]);
                            }}
                            iconName="X"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CentralizedAlerts;