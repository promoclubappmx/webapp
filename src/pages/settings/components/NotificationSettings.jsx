import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const NotificationSettings = () => {
  const [emailSettings, setEmailSettings] = useState({
    newPromotions: true,
    couponRedemptions: true,
    loyaltyPointsUpdates: true,
    systemAlerts: true,
    weeklyReports: false,
    monthlyReports: true,
    contentModeration: true,
    userRegistrations: false,
    paymentNotifications: true
  });

  const [pushSettings, setPushSettings] = useState({
    browserNotifications: true,
    newCustomers: false,
    urgentAlerts: true,
    promotionExpiry: true,
    lowStock: true,
    systemMaintenance: true
  });

  const [smsSettings, setSmsSettings] = useState({
    enabled: false,
    criticalAlerts: true,
    promotionalMessages: false,
    customerSupport: true
  });

  const [generalSettings, setGeneralSettings] = useState({
    notificationFrequency: 'immediate',
    quietHours: true,
    quietStart: '22:00',
    quietEnd: '08:00',
    timezone: 'America/Mexico_City',
    language: 'es-MX'
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleEmailChange = (key, value) => {
    setEmailSettings(prev => ({ ...prev, [key]: value }));
  };

  const handlePushChange = (key, value) => {
    setPushSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSmsChange = (key, value) => {
    setSmsSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleGeneralChange = (key, value) => {
    setGeneralSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
    <div className="space-y-8">
      {/* Email Notifications Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-foreground">Notificaciones por Email</h3>
            <p className="text-muted-foreground text-sm">
              Configura las notificaciones que deseas recibir por correo electrónico
            </p>
          </div>
          <Icon name="Mail" size={20} className="text-muted-foreground" />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Nuevas Promociones</div>
              <div className="text-xs text-muted-foreground">Cuando se publican nuevas promociones</div>
            </div>
            <NotificationToggle
              checked={emailSettings?.newPromotions}
              onChange={(value) => handleEmailChange('newPromotions', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Redención de Cupones</div>
              <div className="text-xs text-muted-foreground">Cuando los clientes canjean cupones</div>
            </div>
            <NotificationToggle
              checked={emailSettings?.couponRedemptions}
              onChange={(value) => handleEmailChange('couponRedemptions', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Actualizaciones de Puntos de Lealtad</div>
              <div className="text-xs text-muted-foreground">Cambios en el programa de puntos</div>
            </div>
            <NotificationToggle
              checked={emailSettings?.loyaltyPointsUpdates}
              onChange={(value) => handleEmailChange('loyaltyPointsUpdates', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Alertas del Sistema</div>
              <div className="text-xs text-muted-foreground">Problemas técnicos y mantenimiento</div>
            </div>
            <NotificationToggle
              checked={emailSettings?.systemAlerts}
              onChange={(value) => handleEmailChange('systemAlerts', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Moderación de Contenido</div>
              <div className="text-xs text-muted-foreground">Elementos pendientes de revisión</div>
            </div>
            <NotificationToggle
              checked={emailSettings?.contentModeration}
              onChange={(value) => handleEmailChange('contentModeration', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Notificaciones de Pago</div>
              <div className="text-xs text-muted-foreground">Transacciones y pagos procesados</div>
            </div>
            <NotificationToggle
              checked={emailSettings?.paymentNotifications}
              onChange={(value) => handleEmailChange('paymentNotifications', value)}
            />
          </div>

          <hr className="border-border" />

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Reportes Semanales</div>
              <div className="text-xs text-muted-foreground">Resumen de actividad semanal</div>
            </div>
            <NotificationToggle
              checked={emailSettings?.weeklyReports}
              onChange={(value) => handleEmailChange('weeklyReports', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Reportes Mensuales</div>
              <div className="text-xs text-muted-foreground">Estadísticas y métricas mensuales</div>
            </div>
            <NotificationToggle
              checked={emailSettings?.monthlyReports}
              onChange={(value) => handleEmailChange('monthlyReports', value)}
            />
          </div>
        </div>
      </div>

      {/* Push Notifications Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-foreground">Notificaciones Push</h3>
            <p className="text-muted-foreground text-sm">
              Notificaciones inmediatas en el navegador
            </p>
          </div>
          <Icon name="Bell" size={20} className="text-muted-foreground" />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Habilitar Notificaciones del Navegador</div>
              <div className="text-xs text-muted-foreground">Permite mostrar notificaciones en el escritorio</div>
            </div>
            <NotificationToggle
              checked={pushSettings?.browserNotifications}
              onChange={(value) => handlePushChange('browserNotifications', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Alertas Urgentes</div>
              <div className="text-xs text-muted-foreground">Problemas críticos que requieren atención inmediata</div>
            </div>
            <NotificationToggle
              checked={pushSettings?.urgentAlerts}
              onChange={(value) => handlePushChange('urgentAlerts', value)}
              disabled={!pushSettings?.browserNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Vencimiento de Promociones</div>
              <div className="text-xs text-muted-foreground">Cuando las promociones están por expirar</div>
            </div>
            <NotificationToggle
              checked={pushSettings?.promotionExpiry}
              onChange={(value) => handlePushChange('promotionExpiry', value)}
              disabled={!pushSettings?.browserNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Mantenimiento del Sistema</div>
              <div className="text-xs text-muted-foreground">Actualizaciones y mantenimiento programado</div>
            </div>
            <NotificationToggle
              checked={pushSettings?.systemMaintenance}
              onChange={(value) => handlePushChange('systemMaintenance', value)}
              disabled={!pushSettings?.browserNotifications}
            />
          </div>
        </div>
      </div>

      {/* SMS Notifications Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-foreground">Notificaciones SMS</h3>
            <p className="text-muted-foreground text-sm">
              Mensajes de texto para alertas críticas
            </p>
          </div>
          <Icon name="MessageSquare" size={20} className="text-muted-foreground" />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Habilitar SMS</div>
              <div className="text-xs text-muted-foreground">Activar notificaciones por mensaje de texto</div>
            </div>
            <NotificationToggle
              checked={smsSettings?.enabled}
              onChange={(value) => handleSmsChange('enabled', value)}
            />
          </div>

          {smsSettings?.enabled && (
            <div className="ml-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <Icon name="AlertTriangle" size={16} className="text-yellow-600 mr-2" />
                <span className="text-yellow-800 text-sm">
                  Se aplicarán cargos por SMS según tu plan de servicios
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Alertas Críticas</div>
              <div className="text-xs text-muted-foreground">Problemas urgentes del sistema</div>
            </div>
            <NotificationToggle
              checked={smsSettings?.criticalAlerts}
              onChange={(value) => handleSmsChange('criticalAlerts', value)}
              disabled={!smsSettings?.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Soporte al Cliente</div>
              <div className="text-xs text-muted-foreground">Consultas urgentes de clientes</div>
            </div>
            <NotificationToggle
              checked={smsSettings?.customerSupport}
              onChange={(value) => handleSmsChange('customerSupport', value)}
              disabled={!smsSettings?.enabled}
            />
          </div>
        </div>
      </div>

      {/* General Settings Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-6">Configuración General</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Frecuencia de Notificaciones
            </label>
            <select
              value={generalSettings?.notificationFrequency}
              onChange={(e) => handleGeneralChange('notificationFrequency', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              <option value="immediate">Inmediata</option>
              <option value="hourly">Cada hora</option>
              <option value="daily">Diaria</option>
              <option value="weekly">Semanal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Idioma de Notificaciones
            </label>
            <select
              value={generalSettings?.language}
              onChange={(e) => handleGeneralChange('language', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              <option value="es-MX">Español (México)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español (España)</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium text-foreground">Modo Silencioso</div>
              <div className="text-xs text-muted-foreground">
                Pausar notificaciones no críticas durante horas específicas
              </div>
            </div>
            <NotificationToggle
              checked={generalSettings?.quietHours}
              onChange={(value) => handleGeneralChange('quietHours', value)}
            />
          </div>

          {generalSettings?.quietHours && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Inicio del Modo Silencioso
                </label>
                <input
                  type="time"
                  value={generalSettings?.quietStart}
                  onChange={(e) => handleGeneralChange('quietStart', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Fin del Modo Silencioso
                </label>
                <input
                  type="time"
                  value={generalSettings?.quietEnd}
                  onChange={(e) => handleGeneralChange('quietEnd', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save / Cancel */}
      <div className="flex items-center justify-between pt-2">
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-green-50 border border-green-200 text-green-800">
            <Icon name="CheckCircle" size={16} />
            Configuración de notificaciones guardada
          </div>
        )}
        <div className="ml-auto flex gap-3">
          <Button variant="outline" onClick={() => {}}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
            iconName={saved ? 'Check' : 'Save'}
            iconPosition="left"
            variant={saved ? 'secondary' : 'default'}
          >
            {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;