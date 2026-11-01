import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import Icon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const AlertSettings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [businessId, setBusinessId] = useState(null);
  const [user, setUser] = useState({ name: 'Usuario', role: 'owner' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [alertConfigurations, setAlertConfigurations] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();

  const alertTypes = [
    { value: 'high_value_sale', label: 'Ventas de Alto Valor', icon: 'DollarSign', description: 'Alertas cuando una venta supera el umbral configurado' },
    { value: 'low_stock', label: 'Stock Bajo', icon: 'PackageX', description: 'Alertas cuando el inventario está por debajo del mínimo' },
    { value: 'staff_shift_start', label: 'Inicio de Turno', icon: 'Clock', description: 'Notificaciones cuando el personal inicia su turno' },
    { value: 'staff_shift_end', label: 'Fin de Turno', icon: 'Clock', description: 'Notificaciones cuando el personal termina su turno' },
    { value: 'staff_no_show', label: 'Personal No Presentado', icon: 'UserX', description: 'Alertas cuando el personal no se presenta a su turno' },
    { value: 'customer_milestone', label: 'Hitos de Clientes', icon: 'Award', description: 'Notificaciones de logros de clientes' },
    { value: 'customer_birthday', label: 'Cumpleaños de Clientes', icon: 'Cake', description: 'Recordatorios de cumpleaños de clientes' },
    { value: 'system', label: 'Sistema', icon: 'Settings', description: 'Alertas del sistema y mantenimiento' }
  ];

  const frequencyOptions = [
    { value: 'immediate', label: 'Inmediata' },
    { value: 'hourly', label: 'Cada hora' },
    { value: 'daily', label: 'Resumen diario' },
    { value: 'weekly', label: 'Resumen semanal' }
  ];

  // Get business ID and user
  useEffect(() => {
    const fetchBusinessId = async () => {
      const { data: { session } } = await supabase?.auth?.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        ?.from('user_profiles')
        ?.select('user_id, full_name, role')
        ?.eq('id', session?.user?.id)
        ?.single();

      if (profile?.user_id) {
        setBusinessId(profile?.user_id);
        setUser({
          name: profile?.full_name || session?.user?.email || 'Usuario',
          role: profile?.role || 'owner'
        });
      }
    };

    fetchBusinessId();
  }, [navigate]);

  // Fetch locations
  useEffect(() => {
    if (!businessId) return;

    const fetchLocations = async () => {
      try {
        const { data, error } = await supabase
          ?.from('business_locations')
          ?.select('id, location_name, location_code, is_active')
          ?.eq('business_id', businessId)
          ?.eq('is_active', true)
          ?.order('location_name');

        if (error) throw error;
        setLocations(data || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, [businessId]);

  // Fetch alert configurations
  useEffect(() => {
    if (!businessId) return;

    const fetchAlertConfigurations = async () => {
      setLoading(true);
      try {
        let query = supabase
          ?.from('alert_configurations')
          ?.select('*')
          ?.eq('business_id', businessId);

        if (selectedLocation !== 'all') {
          query = query?.eq('location_id', selectedLocation);
        } else {
          query = query?.is('location_id', null)?.eq('applies_to_all_locations', true);
        }

        const { data, error } = await query?.order('alert_type');

        if (error) throw error;

        // Ensure all alert types have a configuration
        const configMap = {};
        data?.forEach(config => {
          configMap[config?.alert_type] = config;
        });

        const completeConfigs = alertTypes?.map(type => {
          if (configMap?.[type?.value]) {
            return configMap?.[type?.value];
          }
          // Return default configuration
          return {
            alert_type: type?.value,
            business_id: businessId,
            is_enabled: true,
            threshold_value: type?.value === 'high_value_sale' ? 100 : type?.value === 'low_stock' ? 10 : null,
            notification_channels: { email: false, push: true, sms: false },
            notification_preferences: { in_app: true, email: false, sms: false, push: false },
            delivery_schedule: {
              enabled: true,
              quiet_hours: { enabled: false, start: '22:00', end: '08:00' },
              frequency: 'immediate',
              days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            },
            applies_to_all_locations: selectedLocation === 'all',
            location_id: selectedLocation === 'all' ? null : selectedLocation
          };
        });

        setAlertConfigurations(completeConfigs);
      } catch (error) {
        console.error('Error fetching alert configurations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlertConfigurations();
  }, [businessId, selectedLocation]);

  const handleConfigChange = (alertType, field, value) => {
    setAlertConfigurations(prev => prev?.map(config => {
      if (config?.alert_type === alertType) {
        return { ...config, [field]: value };
      }
      return config;
    }));
    setHasChanges(true);
  };

  const handleNotificationChannelChange = (alertType, channel, value) => {
    setAlertConfigurations(prev => prev?.map(config => {
      if (config?.alert_type === alertType) {
        return {
          ...config,
          notification_preferences: {
            ...config?.notification_preferences,
            [channel]: value
          }
        };
      }
      return config;
    }));
    setHasChanges(true);
  };

  const handleDeliveryScheduleChange = (alertType, field, value) => {
    setAlertConfigurations(prev => prev?.map(config => {
      if (config?.alert_type === alertType) {
        return {
          ...config,
          delivery_schedule: {
            ...config?.delivery_schedule,
            [field]: value
          }
        };
      }
      return config;
    }));
    setHasChanges(true);
  };

  const handleQuietHoursChange = (alertType, field, value) => {
    setAlertConfigurations(prev => prev?.map(config => {
      if (config?.alert_type === alertType) {
        return {
          ...config,
          delivery_schedule: {
            ...config?.delivery_schedule,
            quiet_hours: {
              ...config?.delivery_schedule?.quiet_hours,
              [field]: value
            }
          }
        };
      }
      return config;
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase?.auth?.getSession();

      // Upsert all configurations
      const upsertPromises = alertConfigurations?.map(config => {
        const configData = {
          business_id: businessId,
          alert_type: config?.alert_type,
          is_enabled: config?.is_enabled,
          threshold_value: config?.threshold_value,
          notification_channels: config?.notification_channels || {},
          notification_preferences: config?.notification_preferences || {},
          delivery_schedule: config?.delivery_schedule || {},
          applies_to_all_locations: selectedLocation === 'all',
          location_id: selectedLocation === 'all' ? null : selectedLocation,
          created_by: session?.user?.id
        };

        return supabase
          ?.from('alert_configurations')
          ?.upsert(configData, {
            onConflict: 'business_id,alert_type,location_id'
          });
      });

      await Promise.all(upsertPromises);

      setHasChanges(false);
      alert('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error saving alert configurations:', error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const getAlertTypeInfo = (alertType) => {
    return alertTypes?.find(type => type?.value === alertType);
  };

  const NotificationToggle = ({ checked, onChange, disabled = false }) => (
    <label className={`relative inline-flex items-center cursor-pointer ${disabled ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e?.target?.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-disabled:opacity-50"></div>
    </label>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
      />

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Configuración de Alertas</h1>
              <p className="text-muted-foreground mt-1">
                Configure umbrales, canales de notificación y horarios de entrega
              </p>
            </div>
            <Button
              onClick={handleSaveSettings}
              loading={saving}
              disabled={!hasChanges || saving}
              iconName="Save"
            >
              Guardar Cambios
            </Button>
          </div>

          {/* Location Selector */}
          {locations?.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-4 mb-6">
              <div className="flex items-center gap-4">
                <Icon name="MapPin" size={20} className="text-muted-foreground" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Configurar alertas para:
                  </label>
                  <Select
                    value={selectedLocation}
                    onChange={setSelectedLocation}
                    options={[
                      { value: 'all', label: 'Todas las ubicaciones' },
                      ...locations?.map(loc => ({
                        value: loc?.id,
                        label: `${loc?.location_name} (${loc?.location_code})`
                      }))
                    ]}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Alert Configurations */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Icon name="Loader" size={32} className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {alertConfigurations?.map(config => {
                const typeInfo = getAlertTypeInfo(config?.alert_type);
                return (
                  <div key={config?.alert_type} className="bg-card border border-border rounded-lg p-6">
                    {/* Alert Type Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon name={typeInfo?.icon} size={24} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{typeInfo?.label}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{typeInfo?.description}</p>
                        </div>
                      </div>
                      <NotificationToggle
                        checked={config?.is_enabled}
                        onChange={(value) => handleConfigChange(config?.alert_type, 'is_enabled', value)}
                      />
                    </div>

                    {config?.is_enabled && (
                      <div className="space-y-6 pl-14">
                        {/* Threshold Configuration */}
                        {(config?.alert_type === 'high_value_sale' || config?.alert_type === 'low_stock') && (
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">
                              {config?.alert_type === 'high_value_sale' ? 'Monto Mínimo (€)' : 'Cantidad Mínima'}
                            </label>
                            <Input
                              type="number"
                              value={config?.threshold_value || ''}
                              onChange={(e) => handleConfigChange(config?.alert_type, 'threshold_value', parseFloat(e?.target?.value))}
                              placeholder={config?.alert_type === 'high_value_sale' ? '100.00' : '10'}
                              className="max-w-xs"
                            />
                          </div>
                        )}

                        {/* Notification Channels */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Canales de Notificación</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                              <div className="flex items-center gap-2">
                                <Icon name="Bell" size={16} className="text-muted-foreground" />
                                <span className="text-sm text-foreground">In-App</span>
                              </div>
                              <Checkbox
                                checked={config?.notification_preferences?.in_app || false}
                                onChange={(e) => handleNotificationChannelChange(config?.alert_type, 'in_app', e?.target?.checked)}
                              />
                            </div>
                            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                              <div className="flex items-center gap-2">
                                <Icon name="Mail" size={16} className="text-muted-foreground" />
                                <span className="text-sm text-foreground">Email</span>
                              </div>
                              <Checkbox
                                checked={config?.notification_preferences?.email || false}
                                onChange={(e) => handleNotificationChannelChange(config?.alert_type, 'email', e?.target?.checked)}
                              />
                            </div>
                            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                              <div className="flex items-center gap-2">
                                <Icon name="MessageSquare" size={16} className="text-muted-foreground" />
                                <span className="text-sm text-foreground">SMS</span>
                              </div>
                              <Checkbox
                                checked={config?.notification_preferences?.sms || false}
                                onChange={(e) => handleNotificationChannelChange(config?.alert_type, 'sms', e?.target?.checked)}
                              />
                            </div>
                            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                              <div className="flex items-center gap-2">
                                <Icon name="Smartphone" size={16} className="text-muted-foreground" />
                                <span className="text-sm text-foreground">Push</span>
                              </div>
                              <Checkbox
                                checked={config?.notification_preferences?.push || false}
                                onChange={(e) => handleNotificationChannelChange(config?.alert_type, 'push', e?.target?.checked)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Delivery Schedule */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3">Horario de Entrega</h4>
                          <div className="space-y-4">
                            <div className="max-w-xs">
                              <Select
                                label="Frecuencia"
                                value={config?.delivery_schedule?.frequency || 'immediate'}
                                onChange={(value) => handleDeliveryScheduleChange(config?.alert_type, 'frequency', value)}
                                options={frequencyOptions}
                              />
                            </div>

                            {/* Quiet Hours */}
                            <div className="border border-border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h5 className="text-sm font-medium text-foreground">Horario Silencioso</h5>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    No enviar alertas durante estas horas
                                  </p>
                                </div>
                                <NotificationToggle
                                  checked={config?.delivery_schedule?.quiet_hours?.enabled || false}
                                  onChange={(value) => handleQuietHoursChange(config?.alert_type, 'enabled', value)}
                                />
                              </div>

                              {config?.delivery_schedule?.quiet_hours?.enabled && (
                                <div className="grid grid-cols-2 gap-4">
                                  <Input
                                    type="time"
                                    label="Inicio"
                                    value={config?.delivery_schedule?.quiet_hours?.start || '22:00'}
                                    onChange={(e) => handleQuietHoursChange(config?.alert_type, 'start', e?.target?.value)}
                                  />
                                  <Input
                                    type="time"
                                    label="Fin"
                                    value={config?.delivery_schedule?.quiet_hours?.end || '08:00'}
                                    onChange={(e) => handleQuietHoursChange(config?.alert_type, 'end', e?.target?.value)}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertSettings;