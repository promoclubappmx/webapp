import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

import { Checkbox } from '../../../components/ui/Checkbox';
import { supabase } from '../../../lib/supabase';

const MarketingIntegration = ({ businessId }) => {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const reminderTypeOptions = [
    { value: 'push', label: 'Notificación Push' },
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' }
  ];

  useEffect(() => {
    loadConfig();
  }, [businessId]);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase?.from('reservation_marketing_config')?.select('*')?.eq('business_id', businessId)?.single();

      if (error && error?.code !== 'PGRST116') throw error;
      setConfig(data || getDefaultConfig());
    } catch (error) {
      console.error('Error loading marketing config:', error?.message);
      setConfig(getDefaultConfig());
    }
  };

  const getDefaultConfig = () => ({
    business_id: businessId,
    reminder_enabled: true,
    reminder_hours_before: 24,
    reminder_types: ['push', 'email'],
    inactive_customer_days: 30,
    inactive_customer_campaign_enabled: true,
    low_demand_promotion_enabled: true,
    post_service_survey_enabled: true,
    survey_delay_hours: 2
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase?.from('reservation_marketing_config')?.upsert([config], { onConflict: 'business_id' });

      if (error) throw error;
      setIsEditing(false);
      alert('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error saving config:', error?.message);
      alert('Error al guardar configuración: ' + error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReminderType = (type) => {
    const currentTypes = config?.reminder_types || [];
    const newTypes = currentTypes?.includes(type)
      ? currentTypes?.filter(t => t !== type)
      : [...currentTypes, type];
    setConfig({ ...config, reminder_types: newTypes });
  };

  if (!config) {
    return <div className="text-center text-muted-foreground py-8">Cargando configuración...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Configuración de Marketing</h3>
          <p className="text-sm text-muted-foreground">Configura recordatorios y campañas automáticas</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} iconName="Edit">
            Editar
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button onClick={handleSave} disabled={isLoading} iconName="Save">
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button variant="outline" onClick={() => {
              setIsEditing(false);
              loadConfig();
            }}>
              Cancelar
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {/* Automatic Reminders */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="font-semibold text-foreground mb-4">🔔 Recordatorios Automáticos</h4>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={config?.reminder_enabled}
                onCheckedChange={(checked) => setConfig({ ...config, reminder_enabled: checked })}
                disabled={!isEditing}
              />
              <label className="text-sm text-foreground">Habilitar recordatorios automáticos</label>
            </div>

            {config?.reminder_enabled && (
              <>
                <Input
                  label="Enviar recordatorio (horas antes)"
                  type="number"
                  value={config?.reminder_hours_before}
                  onChange={(e) => setConfig({ ...config, reminder_hours_before: parseInt(e?.target?.value) })}
                  disabled={!isEditing}
                />

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Canales de Recordatorio</label>
                  <div className="space-y-2">
                    {reminderTypeOptions?.map((option) => (
                      <div key={option?.value} className="flex items-center space-x-2">
                        <Checkbox
                          checked={config?.reminder_types?.includes(option?.value)}
                          onCheckedChange={() => toggleReminderType(option?.value)}
                          disabled={!isEditing}
                        />
                        <label className="text-sm text-foreground">{option?.label}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Inactive Customer Campaign */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="font-semibold text-foreground mb-4">📬 Campaña para Clientes Inactivos</h4>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={config?.inactive_customer_campaign_enabled}
                onCheckedChange={(checked) => setConfig({ ...config, inactive_customer_campaign_enabled: checked })}
                disabled={!isEditing}
              />
              <label className="text-sm text-foreground">Habilitar campaña automática</label>
            </div>

            {config?.inactive_customer_campaign_enabled && (
              <>
                <Input
                  label="Días de inactividad para activar campaña"
                  type="number"
                  value={config?.inactive_customer_days}
                  onChange={(e) => setConfig({ ...config, inactive_customer_days: parseInt(e?.target?.value) })}
                  disabled={!isEditing}
                />
                <p className="text-sm text-muted-foreground">
                  Se enviará un mensaje automático a clientes que no han reservado en {config?.inactive_customer_days} días
                </p>
              </>
            )}
          </div>
        </div>

        {/* Low Demand Promotions */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="font-semibold text-foreground mb-4">🎉 Promociones en Horarios Muertos</h4>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={config?.low_demand_promotion_enabled}
                onCheckedChange={(checked) => setConfig({ ...config, low_demand_promotion_enabled: checked })}
                disabled={!isEditing}
              />
              <label className="text-sm text-foreground">Habilitar promociones automáticas</label>
            </div>
            <p className="text-sm text-muted-foreground">
              Se enviarán promociones especiales para llenar horarios con baja demanda
            </p>
          </div>
        </div>

        {/* Post-Service Survey */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="font-semibold text-foreground mb-4">📊 Encuesta Post-Servicio</h4>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={config?.post_service_survey_enabled}
                onCheckedChange={(checked) => setConfig({ ...config, post_service_survey_enabled: checked })}
                disabled={!isEditing}
              />
              <label className="text-sm text-foreground">Habilitar encuesta automática</label>
            </div>

            {config?.post_service_survey_enabled && (
              <>
                <Input
                  label="Enviar encuesta después de (horas)"
                  type="number"
                  value={config?.survey_delay_hours}
                  onChange={(e) => setConfig({ ...config, survey_delay_hours: parseInt(e?.target?.value) })}
                  disabled={!isEditing}
                />
                <p className="text-sm text-muted-foreground">
                  Se enviará una encuesta de satisfacción {config?.survey_delay_hours} horas después de completar el servicio
                </p>
              </>
            )}
          </div>
        </div>

        {/* Campaign Examples */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="font-semibold text-foreground mb-4">💡 Ejemplos de Mensajes Automáticos</h4>
          <div className="space-y-3">
            <div className="p-3 bg-muted/30 rounded">
              <p className="text-sm font-medium text-foreground">Recordatorio de Reserva:</p>
              <p className="text-sm text-muted-foreground mt-1">
                "Hola [Nombre], te recordamos tu reserva para [Servicio] mañana a las [Hora]. ¡Te esperamos!"
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded">
              <p className="text-sm font-medium text-foreground">Cliente Inactivo:</p>
              <p className="text-sm text-muted-foreground mt-1">
                "Hace {config?.inactive_customer_days} días que no nos visitas. ¡Tenemos una promoción especial para ti!"
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded">
              <p className="text-sm font-medium text-foreground">Horario de Baja Demanda:</p>
              <p className="text-sm text-muted-foreground mt-1">
                "Reserva hoy entre las 14:00-16:00 y obtén 15% de descuento + puntos extra"
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded">
              <p className="text-sm font-medium text-foreground">Encuesta Post-Servicio:</p>
              <p className="text-sm text-muted-foreground mt-1">
                "¿Cómo fue tu experiencia? Ayúdanos a mejorar con tu opinión. [Link a encuesta]"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingIntegration;