import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

const NotificationsProfileTab = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [emailSettings, setEmailSettings] = useState({
    newPromotions: true,
    couponRedemptions: true,
    loyaltyPointsUpdates: true,
    systemAlerts: true,
    weeklyReports: false,
    monthlyReports: true,
    contentModeration: true,
    paymentNotifications: true
  });

  const [pushSettings, setPushSettings] = useState({
    browserNotifications: true,
    urgentAlerts: true,
    promotionExpiry: true,
    systemMaintenance: true
  });

  const [smsSettings, setSmsSettings] = useState({
    enabled: false,
    criticalAlerts: true,
    customerSupport: true
  });

  const [generalSettings, setGeneralSettings] = useState({
    notificationFrequency: 'immediate',
    quietHours: true,
    quietStart: '22:00',
    quietEnd: '08:00',
    language: 'es-MX'
  });

  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return;
      try {
        const { data } = await supabase?.from('user_profiles')?.select('notif_email_new_promotions, notif_email_coupon_redemptions, notif_email_loyalty_points, notif_email_system_alerts, notif_email_weekly_reports, notif_email_monthly_reports, notif_email_content_moderation, notif_email_payment_notifications, notif_push_browser, notif_push_urgent_alerts, notif_push_promotion_expiry, notif_push_system_maintenance, notif_sms_enabled, notif_sms_critical_alerts, notif_sms_customer_support, notif_frequency, notif_quiet_hours, notif_quiet_start, notif_quiet_end, notif_language')?.eq('id', user?.id)?.maybeSingle();
        if (data) {
          setEmailSettings({
            newPromotions: data?.notif_email_new_promotions ?? true,
            couponRedemptions: data?.notif_email_coupon_redemptions ?? true,
            loyaltyPointsUpdates: data?.notif_email_loyalty_points ?? true,
            systemAlerts: data?.notif_email_system_alerts ?? true,
            weeklyReports: data?.notif_email_weekly_reports ?? false,
            monthlyReports: data?.notif_email_monthly_reports ?? true,
            contentModeration: data?.notif_email_content_moderation ?? true,
            paymentNotifications: data?.notif_email_payment_notifications ?? true,
          });
          setPushSettings({
            browserNotifications: data?.notif_push_browser ?? true,
            urgentAlerts: data?.notif_push_urgent_alerts ?? true,
            promotionExpiry: data?.notif_push_promotion_expiry ?? true,
            systemMaintenance: data?.notif_push_system_maintenance ?? true,
          });
          setSmsSettings({
            enabled: data?.notif_sms_enabled ?? false,
            criticalAlerts: data?.notif_sms_critical_alerts ?? true,
            customerSupport: data?.notif_sms_customer_support ?? true,
          });
          setGeneralSettings({
            notificationFrequency: data?.notif_frequency || 'immediate',
            quietHours: data?.notif_quiet_hours ?? true,
            quietStart: data?.notif_quiet_start || '22:00',
            quietEnd: data?.notif_quiet_end || '08:00',
            language: data?.notif_language || 'es-MX',
          });
        }
      } catch (err) {
        console.error('Error loading notification settings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [user?.id]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setSaveError('');
    try {
      const { error } = await supabase?.from('user_profiles')?.update({
          notif_email_new_promotions: emailSettings?.newPromotions,
          notif_email_coupon_redemptions: emailSettings?.couponRedemptions,
          notif_email_loyalty_points: emailSettings?.loyaltyPointsUpdates,
          notif_email_system_alerts: emailSettings?.systemAlerts,
          notif_email_weekly_reports: emailSettings?.weeklyReports,
          notif_email_monthly_reports: emailSettings?.monthlyReports,
          notif_email_content_moderation: emailSettings?.contentModeration,
          notif_email_payment_notifications: emailSettings?.paymentNotifications,
          notif_push_browser: pushSettings?.browserNotifications,
          notif_push_urgent_alerts: pushSettings?.urgentAlerts,
          notif_push_promotion_expiry: pushSettings?.promotionExpiry,
          notif_push_system_maintenance: pushSettings?.systemMaintenance,
          notif_sms_enabled: smsSettings?.enabled,
          notif_sms_critical_alerts: smsSettings?.criticalAlerts,
          notif_sms_customer_support: smsSettings?.customerSupport,
          notif_frequency: generalSettings?.notificationFrequency,
          notif_quiet_hours: generalSettings?.quietHours,
          notif_quiet_start: generalSettings?.quietStart,
          notif_quiet_end: generalSettings?.quietEnd,
          notif_language: generalSettings?.language,
          updated_at: new Date()?.toISOString()
        })?.eq('id', user?.id);
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError('Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ checked, onChange, disabled = false }) => (
    <label className={`relative inline-flex items-center cursor-pointer ${disabled ? 'opacity-50' : ''}`}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e?.target?.checked)} disabled={disabled} className="sr-only peer" />
      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-disabled:opacity-50"></div>
    </label>
  );

  if (loading) return <div className="flex items-center justify-center py-12"><Icon name="Loader" size={24} className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8">
      {/* Email Notifications */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-foreground">Notificaciones por Email</h3>
            <p className="text-muted-foreground text-sm">Configura las notificaciones que deseas recibir por correo electrónico</p>
          </div>
          <Icon name="Mail" size={20} className="text-muted-foreground" />
        </div>
        <div className="space-y-4">
          {[
            { key: 'newPromotions', label: 'Nuevas Promociones', desc: 'Cuando se publican nuevas promociones' },
            { key: 'couponRedemptions', label: 'Redención de Cupones', desc: 'Cuando los clientes canjean cupones' },
            { key: 'loyaltyPointsUpdates', label: 'Actualizaciones de Puntos de Lealtad', desc: 'Cambios en el programa de puntos' },
            { key: 'systemAlerts', label: 'Alertas del Sistema', desc: 'Problemas técnicos y mantenimiento' },
            { key: 'contentModeration', label: 'Moderación de Contenido', desc: 'Elementos pendientes de revisión' },
            { key: 'paymentNotifications', label: 'Notificaciones de Pago', desc: 'Transacciones y pagos procesados' },
          ]?.map(item => (
            <div key={item?.key} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-foreground">{item?.label}</div>
                <div className="text-xs text-muted-foreground">{item?.desc}</div>
              </div>
              <Toggle checked={emailSettings?.[item?.key]} onChange={v => setEmailSettings(prev => ({ ...prev, [item?.key]: v }))} />
            </div>
          ))}
          <hr className="border-border" />
          {[
            { key: 'weeklyReports', label: 'Reportes Semanales', desc: 'Resumen de actividad semanal' },
            { key: 'monthlyReports', label: 'Reportes Mensuales', desc: 'Estadísticas y métricas mensuales' },
          ]?.map(item => (
            <div key={item?.key} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-foreground">{item?.label}</div>
                <div className="text-xs text-muted-foreground">{item?.desc}</div>
              </div>
              <Toggle checked={emailSettings?.[item?.key]} onChange={v => setEmailSettings(prev => ({ ...prev, [item?.key]: v }))} />
            </div>
          ))}
        </div>
      </div>
      {/* Push Notifications */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-foreground">Notificaciones Push</h3>
            <p className="text-muted-foreground text-sm">Notificaciones inmediatas en el navegador</p>
          </div>
          <Icon name="Bell" size={20} className="text-muted-foreground" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Habilitar Notificaciones del Navegador</div>
              <div className="text-xs text-muted-foreground">Permite mostrar notificaciones en el escritorio</div>
            </div>
            <Toggle checked={pushSettings?.browserNotifications} onChange={v => setPushSettings(prev => ({ ...prev, browserNotifications: v }))} />
          </div>
          {[
            { key: 'urgentAlerts', label: 'Alertas Urgentes', desc: 'Problemas críticos que requieren atención inmediata' },
            { key: 'promotionExpiry', label: 'Vencimiento de Promociones', desc: 'Cuando las promociones están por expirar' },
            { key: 'systemMaintenance', label: 'Mantenimiento del Sistema', desc: 'Actualizaciones y mantenimiento programado' },
          ]?.map(item => (
            <div key={item?.key} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-foreground">{item?.label}</div>
                <div className="text-xs text-muted-foreground">{item?.desc}</div>
              </div>
              <Toggle checked={pushSettings?.[item?.key]} onChange={v => setPushSettings(prev => ({ ...prev, [item?.key]: v }))} disabled={!pushSettings?.browserNotifications} />
            </div>
          ))}
        </div>
      </div>
      {/* SMS Notifications */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-foreground">Notificaciones SMS</h3>
            <p className="text-muted-foreground text-sm">Mensajes de texto para alertas críticas</p>
          </div>
          <Icon name="MessageSquare" size={20} className="text-muted-foreground" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Habilitar SMS</div>
              <div className="text-xs text-muted-foreground">Activar notificaciones por mensaje de texto</div>
            </div>
            <Toggle checked={smsSettings?.enabled} onChange={v => setSmsSettings(prev => ({ ...prev, enabled: v }))} />
          </div>
          {smsSettings?.enabled && (
            <div className="ml-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <Icon name="AlertTriangle" size={16} className="text-yellow-600 mr-2" />
                <span className="text-yellow-800 text-sm">Se aplicarán cargos por SMS según tu plan de servicios</span>
              </div>
            </div>
          )}
          {[
            { key: 'criticalAlerts', label: 'Alertas Críticas', desc: 'Problemas urgentes del sistema' },
            { key: 'customerSupport', label: 'Soporte al Cliente', desc: 'Consultas urgentes de clientes' },
          ]?.map(item => (
            <div key={item?.key} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-foreground">{item?.label}</div>
                <div className="text-xs text-muted-foreground">{item?.desc}</div>
              </div>
              <Toggle checked={smsSettings?.[item?.key]} onChange={v => setSmsSettings(prev => ({ ...prev, [item?.key]: v }))} disabled={!smsSettings?.enabled} />
            </div>
          ))}
        </div>
      </div>
      {/* General Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-6">Configuración General</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Frecuencia de Notificaciones</label>
            <select value={generalSettings?.notificationFrequency} onChange={e => setGeneralSettings(prev => ({ ...prev, notificationFrequency: e?.target?.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background">
              <option value="immediate">Inmediata</option>
              <option value="hourly">Cada hora</option>
              <option value="daily">Diaria</option>
              <option value="weekly">Semanal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Idioma de Notificaciones</label>
            <select value={generalSettings?.language} onChange={e => setGeneralSettings(prev => ({ ...prev, language: e?.target?.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background">
              <option value="es-MX">Español (México)</option>
              <option value="en-US">English (US)</option>
            </select>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium text-foreground">Modo Silencioso</div>
              <div className="text-xs text-muted-foreground">Pausar notificaciones no críticas durante horas específicas</div>
            </div>
            <Toggle checked={generalSettings?.quietHours} onChange={v => setGeneralSettings(prev => ({ ...prev, quietHours: v }))} />
          </div>
          {generalSettings?.quietHours && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Inicio del Modo Silencioso</label>
                <input type="time" value={generalSettings?.quietStart} onChange={e => setGeneralSettings(prev => ({ ...prev, quietStart: e?.target?.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Fin del Modo Silencioso</label>
                <input type="time" value={generalSettings?.quietEnd} onChange={e => setGeneralSettings(prev => ({ ...prev, quietEnd: e?.target?.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background" />
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Save */}
      <div className="flex items-center justify-between pt-2">
        {(saved || saveError) && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${saveError ? 'bg-destructive/10 border border-destructive text-destructive' : 'bg-green-50 border border-green-200 text-green-800'}`}>
            <Icon name={saveError ? 'AlertCircle' : 'CheckCircle'} size={16} />
            {saveError || 'Configuración de notificaciones guardada'}
          </div>
        )}
        <div className="ml-auto flex gap-3">
          <Button variant="outline" onClick={() => {}}>Cancelar</Button>
          <Button onClick={handleSave} loading={saving} iconName={saved ? 'Check' : 'Save'} iconPosition="left" variant={saved ? 'secondary' : 'default'}>
            {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsProfileTab;
