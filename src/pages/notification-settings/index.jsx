import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';



const NotificationSettings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    channels: {
      inApp: true,
      email: true,
      push: false
    },
    frequency: 'immediate',
    eventTypes: {
      racha: {
        completed: true,
        atRisk: true,
        milestone: true
      },
      misión: {
        unlocked: true,
        completed: true,
        expired: false,
        sponsored: true
      },
      nivel: {
        levelUp: true,
        progress: false,
        maxLevel: true
      },
      badge: {
        earned: true,
        rare: true,
        legendary: true
      },
      general: {
        promotions: true,
        coupons: true,
        loyalty: true,
        rewards: true,
        system: false
      }
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const mockUser = {
      id: 1,
      name: "Carlos Mendoza",
      email: "carlos@restauranteeljardin.com",
      role: "owner",
      business: "Restaurante El Jardín"
    };
    setUser(mockUser);
  }, []);

  const frequencyOptions = [
    { value: 'immediate', label: 'Inmediata' },
    { value: 'hourly', label: 'Cada hora' },
    { value: 'daily', label: 'Resumen diario' },
    { value: 'weekly', label: 'Resumen semanal' }
  ];

  const handleChannelToggle = (channel) => {
    setSettings(prev => ({
      ...prev,
      channels: {
        ...prev?.channels,
        [channel]: !prev?.channels?.[channel]
      }
    }));
    setHasChanges(true);
  };

  const handleFrequencyChange = (value) => {
    setSettings(prev => ({ ...prev, frequency: value }));
    setHasChanges(true);
  };

  const handleEventTypeToggle = (category, eventType) => {
    setSettings(prev => ({
      ...prev,
      eventTypes: {
        ...prev?.eventTypes,
        [category]: {
          ...prev?.eventTypes?.[category],
          [eventType]: !prev?.eventTypes?.[category]?.[eventType]
        }
      }
    }));
    setHasChanges(true);
  };

  const handleQuietHoursToggle = () => {
    setSettings(prev => ({
      ...prev,
      quietHours: {
        ...prev?.quietHours,
        enabled: !prev?.quietHours?.enabled
      }
    }));
    setHasChanges(true);
  };

  const handleQuietHoursChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      quietHours: {
        ...prev?.quietHours,
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Saving notification settings:', settings);
    setHasChanges(false);
    // Here you would typically make an API call to save settings
  };

  const handleReset = () => {
    // Reset to default settings
    setSettings({
      channels: { inApp: true, email: true, push: false },
      frequency: 'immediate',
      eventTypes: {
        racha: { completed: true, atRisk: true, milestone: true },
        misión: { unlocked: true, completed: true, expired: false, sponsored: true },
        nivel: { levelUp: true, progress: false, maxLevel: true },
        badge: { earned: true, rare: true, legendary: true },
        general: { promotions: true, coupons: true, loyalty: true, rewards: true, system: false }
      },
      quietHours: { enabled: false, start: '22:00', end: '08:00' }
    });
    setHasChanges(false);
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
        isMenuOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <div
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

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Configuración de Notificaciones</h1>
            <p className="text-muted-foreground mt-1">
              Personaliza cómo y cuándo recibir notificaciones
            </p>
          </div>

          {hasChanges && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="AlertCircle" size={20} className="text-yellow-600" />
                <span className="text-sm text-yellow-800">Tienes cambios sin guardar</span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleReset}>
                  Descartar
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Guardar Cambios
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Channels */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Icon name="Radio" size={24} className="text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Canales de Notificación</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Notificaciones In-App</div>
                    <div className="text-xs text-muted-foreground">Recibe notificaciones dentro de la aplicación</div>
                  </div>
                  <NotificationToggle
                    checked={settings?.channels?.inApp}
                    onChange={() => handleChannelToggle('inApp')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Email</div>
                    <div className="text-xs text-muted-foreground">Recibe notificaciones por correo electrónico</div>
                  </div>
                  <NotificationToggle
                    checked={settings?.channels?.email}
                    onChange={() => handleChannelToggle('email')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Push (Navegador)</div>
                    <div className="text-xs text-muted-foreground">Recibe notificaciones push en el navegador</div>
                  </div>
                  <NotificationToggle
                    checked={settings?.channels?.push}
                    onChange={() => handleChannelToggle('push')}
                  />
                </div>
              </div>
            </div>

            {/* Frequency */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Icon name="Clock" size={24} className="text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Frecuencia de Notificaciones</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ¿Con qué frecuencia deseas recibir notificaciones?
                </label>
                <Select
                  options={frequencyOptions}
                  value={settings?.frequency}
                  onChange={handleFrequencyChange}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {settings?.frequency === 'immediate' && 'Recibirás notificaciones inmediatamente cuando ocurran eventos'}
                  {settings?.frequency === 'hourly' && 'Recibirás un resumen cada hora con todas las notificaciones'}
                  {settings?.frequency === 'daily' && 'Recibirás un resumen diario con todas las notificaciones del día'}
                  {settings?.frequency === 'weekly' && 'Recibirás un resumen semanal con todas las notificaciones de la semana'}
                </p>
              </div>
            </div>

            {/* Event Types - Rachas */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Icon name="Flame" size={24} className="text-orange-500" />
                <h2 className="text-xl font-semibold text-foreground">Notificaciones de Rachas</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Racha completada</div>
                    <div className="text-xs text-muted-foreground">Cuando un usuario completa una racha</div>
                  </div>
                  <NotificationToggle
                    checked={settings?.eventTypes?.racha?.completed}
                    onChange={() => handleEventTypeToggle('racha', 'completed')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Racha en riesgo</div>
                    <div className="text-xs text-muted-foreground">Cuando una racha está por romperse</div>
                  </div>
                  <NotificationToggle
                    checked={settings?.eventTypes?.racha?.atRisk}
                    onChange={() => handleEventTypeToggle('racha', 'atRisk')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Hitos de racha</div>
                    <div className="text-xs text-muted-foreground">Cuando se alcanzan hitos importantes (30, 60, 90 días)</div>
                  </div>
                  <NotificationToggle
                    checked={settings?.eventTypes?.racha?.milestone}
                    onChange={() => handleEventTypeToggle('racha', 'milestone')}
                  />
                </div>
              </div>
            </div>

            {/* Event Types - Misiones */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Icon name="Target" size={24} className="text-blue-600" />
                <h2 className="text-xl font-semibold text-foreground">Notificaciones de Misiones</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Misión desbloqueada</div>
                    <div className="text-xs text-muted-foreground">Cuando un usuario desbloquea una nueva misión</div>
                  </div>
                  <NotificationToggle
                    checked={settings?.eventTypes?.misión?.unlocked}
                    onChange={() => handleEventTypeToggle('misión', 'unlocked')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Misión completada</div>
                    <div className="text-xs text-muted-foreground">Cuando un usuario completa una misión</div>
                  </div>
                  <NotificationToggle
                    checked={settings?.eventTypes?.misión?.completed}
                    onChange={() => handleEventTypeToggle('misión', 'completed')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Misión expirada</div>
                    <div className="text-xs text-muted-foreground">Cuando una misión expira sin completarse</div>
                  </div>
                  <NotificationToggle
                    checked={settings?.eventTypes?.misión?.expired}
                    onChange={() => handleEventTypeToggle('misión', 'expired')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Misiones patrocinadas</div>
                    <div className="text-xs text-muted-foreground">Notificaciones sobre misiones patrocinadas</div>
                  </div>
                  <NotificationToggle
                    checked={settings?.eventTypes?.misión?.sponsored}
                    onChange={() => handleEventTypeToggle('misión', 'sponsored')}
                  />
                </div>
              </div>
            </div>

            {/* Event Types - Niveles */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Icon name="TrendingUp" size={24} className="text-green-600" />
                <h2 className="text-xl font-semibold text-foreground">Notificaciones de Niveles</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Nivel subido</div>
                    <div className="text-xs text-muted-foreground">Cuando un usuario sube de nivel</div>
                  </div>
                  <NotificationToggle
                    checked={settings?.eventTypes?.nivel?.levelUp}
                    onChange={() => handleEventTypeToggle('nivel', 'levelUp')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Progreso de nivel</div>
                    <div className="text-xs text-muted-foreground">Actualizaciones sobre el progreso hacia el siguiente nivel</div>
                  </div>
                  <NotificationToggle
                    checked={settings?.eventTypes?.nivel?.progress}
                    onChange={() => handleEventTypeToggle('nivel', 'progress')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Nivel máximo alcanzado</div>
                    <div className="text-xs text-muted-foreground">Cuando un usuario alcanza el nivel máximo</div>
                  </div>
                  <NotificationToggle
                    checked={settings?.eventTypes?.nivel?.maxLevel}
                    onChange={() => handleEventTypeToggle('nivel', 'maxLevel')}
                  />
                </div>
              </div>
            </div>

            {/* Event Types - Badges */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Icon name="Award" size={24} className="text-yellow-600" />
                <h2 className="text-xl font-semibold text-foreground">Notificaciones de Badges</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Badge ganado</div>
                    <div className="text-xs text-muted-foreground">Cuando un usuario gana cualquier badge</div>
                  </div>
                  <NotificationToggle
                    checked={settings?.eventTypes?.badge?.earned}
                    onChange={() => handleEventTypeToggle('badge', 'earned')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Badges raros</div>
                    <div className="text-xs text-muted-foreground">Notificaciones especiales para badges raros y épicos</div>
                  </div>
                  <NotificationToggle
                    checked={settings?.eventTypes?.badge?.rare}
                    onChange={() => handleEventTypeToggle('badge', 'rare')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Badges legendarios</div>
                    <div className="text-xs text-muted-foreground">Notificaciones destacadas para badges legendarios</div>
                  </div>
                  <NotificationToggle
                    checked={settings?.eventTypes?.badge?.legendary}
                    onChange={() => handleEventTypeToggle('badge', 'legendary')}
                  />
                </div>
              </div>
            </div>

            {/* Event Types - General */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Icon name="Bell" size={24} className="text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Notificaciones Generales</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Promociones</div>
                    <div className="text-xs text-muted-foreground">Notificaciones sobre promociones</div>
                  </div>
                  <NotificationToggle
                    checked={settings?.eventTypes?.general?.promotions}
                    onChange={() => handleEventTypeToggle('general', 'promotions')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Cupones</div>
                    <div className="text-xs text-muted-foreground">Notificaciones sobre cupones</div>
                  </div>
                  <NotificationToggle
                    checked={settings?.eventTypes?.general?.coupons}
                    onChange={() => handleEventTypeToggle('general', 'coupons')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Puntos de lealtad</div>
                    <div className="text-xs text-muted-foreground">Notificaciones sobre puntos de lealtad</div>
                  </div>
                  <NotificationToggle
                    checked={settings?.eventTypes?.general?.loyalty}
                    onChange={() => handleEventTypeToggle('general', 'loyalty')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Recompensas</div>
                    <div className="text-xs text-muted-foreground">Notificaciones sobre recompensas</div>
                  </div>
                  <NotificationToggle
                    checked={settings?.eventTypes?.general?.rewards}
                    onChange={() => handleEventTypeToggle('general', 'rewards')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Sistema</div>
                    <div className="text-xs text-muted-foreground">Notificaciones del sistema y mantenimiento</div>
                  </div>
                  <NotificationToggle
                    checked={settings?.eventTypes?.general?.system}
                    onChange={() => handleEventTypeToggle('general', 'system')}
                  />
                </div>
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Icon name="Moon" size={24} className="text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Horario de Silencio</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Habilitar horario de silencio</div>
                    <div className="text-xs text-muted-foreground">No recibir notificaciones durante ciertas horas</div>
                  </div>
                  <NotificationToggle
                    checked={settings?.quietHours?.enabled}
                    onChange={handleQuietHoursToggle}
                  />
                </div>
                {settings?.quietHours?.enabled && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Hora de inicio
                      </label>
                      <input
                        type="time"
                        value={settings?.quietHours?.start}
                        onChange={(e) => handleQuietHoursChange('start', e?.target?.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Hora de fin
                      </label>
                      <input
                        type="time"
                        value={settings?.quietHours?.end}
                        onChange={(e) => handleQuietHoursChange('end', e?.target?.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
              <Button variant="outline" onClick={handleReset}>
                Restablecer valores predeterminados
              </Button>
              <Button onClick={handleSave} disabled={!hasChanges}>
                <Icon name="Save" size={16} className="mr-2" />
                Guardar Configuración
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;