import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import { supabase } from '../../../lib/supabase';

const LoyaltyIntegration = ({ businessId }) => {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadConfig();
  }, [businessId]);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase?.from('reservation_loyalty_config')?.select('*')?.eq('business_id', businessId)?.single();

      if (error && error?.code !== 'PGRST116') throw error;
      setConfig(data || getDefaultConfig());
    } catch (error) {
      console.error('Error loading loyalty config:', error?.message);
      setConfig(getDefaultConfig());
    }
  };

  const getDefaultConfig = () => ({
    business_id: businessId,
    points_per_reservation: 10,
    points_per_attendance: 20,
    no_show_penalty_points: 50,
    low_demand_bonus_points: 15,
    low_demand_hours: ['14:00-16:00', '21:00-23:00'],
    vip_priority_enabled: true,
    vip_tier_names: ['platinum', 'gold'],
    early_booking_bonus_days: 7,
    early_booking_bonus_points: 25,
    app_booking_discount_percentage: 5
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase?.from('reservation_loyalty_config')?.upsert([config], { onConflict: 'business_id' });

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

  if (!config) {
    return <div className="text-center text-muted-foreground py-8">Cargando configuración...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Configuración de Fidelización</h3>
          <p className="text-sm text-muted-foreground">Configura puntos y beneficios para reservas</p>
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
        {/* Points Configuration */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="font-semibold text-foreground mb-4">🎯 Puntos por Acción</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Puntos por Reservar"
              type="number"
              value={config?.points_per_reservation}
              onChange={(e) => setConfig({ ...config, points_per_reservation: parseInt(e?.target?.value) })}
              disabled={!isEditing}
            />
            <Input
              label="Puntos por Asistir"
              type="number"
              value={config?.points_per_attendance}
              onChange={(e) => setConfig({ ...config, points_per_attendance: parseInt(e?.target?.value) })}
              disabled={!isEditing}
            />
            <Input
              label="Penalización por No-Show"
              type="number"
              value={config?.no_show_penalty_points}
              onChange={(e) => setConfig({ ...config, no_show_penalty_points: parseInt(e?.target?.value) })}
              disabled={!isEditing}
            />
            <Input
              label="Bonus Horarios de Baja Demanda"
              type="number"
              value={config?.low_demand_bonus_points}
              onChange={(e) => setConfig({ ...config, low_demand_bonus_points: parseInt(e?.target?.value) })}
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Low Demand Hours */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="font-semibold text-foreground mb-4">⏰ Horarios de Baja Demanda</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Los clientes recibirán puntos extra al reservar en estos horarios
          </p>
          <div className="space-y-2">
            {config?.low_demand_hours?.map((hour, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={hour}
                  onChange={(e) => {
                    const newHours = [...config?.low_demand_hours];
                    newHours[index] = e?.target?.value;
                    setConfig({ ...config, low_demand_hours: newHours });
                  }}
                  placeholder="HH:MM-HH:MM"
                  disabled={!isEditing}
                />
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newHours = config?.low_demand_hours?.filter((_, i) => i !== index);
                      setConfig({ ...config, low_demand_hours: newHours });
                    }}
                    iconName="Trash2"
                  />
                )}
              </div>
            ))}
            {isEditing && (
              <Button
                variant="outline"
                onClick={() => {
                  setConfig({
                    ...config,
                    low_demand_hours: [...(config?.low_demand_hours || []), '']
                  });
                }}
                iconName="Plus"
              >
                Agregar Horario
              </Button>
            )}
          </div>
        </div>

        {/* VIP Priority */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="font-semibold text-foreground mb-4">🏆 Prioridad VIP</h4>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={config?.vip_priority_enabled}
                onCheckedChange={(checked) => setConfig({ ...config, vip_priority_enabled: checked })}
                disabled={!isEditing}
              />
              <label className="text-sm text-foreground">Habilitar prioridad para clientes VIP</label>
            </div>
            {config?.vip_priority_enabled && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Niveles VIP</label>
                <div className="space-y-2">
                  {config?.vip_tier_names?.map((tier, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={tier}
                        onChange={(e) => {
                          const newTiers = [...config?.vip_tier_names];
                          newTiers[index] = e?.target?.value;
                          setConfig({ ...config, vip_tier_names: newTiers });
                        }}
                        placeholder="Nombre del nivel"
                        disabled={!isEditing}
                      />
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newTiers = config?.vip_tier_names?.filter((_, i) => i !== index);
                            setConfig({ ...config, vip_tier_names: newTiers });
                          }}
                          iconName="Trash2"
                        />
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setConfig({
                          ...config,
                          vip_tier_names: [...(config?.vip_tier_names || []), '']
                        });
                      }}
                      iconName="Plus"
                    >
                      Agregar Nivel
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Early Booking Bonus */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="font-semibold text-foreground mb-4">📅 Bonus por Reserva Anticipada</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Días de Anticipación"
              type="number"
              value={config?.early_booking_bonus_days}
              onChange={(e) => setConfig({ ...config, early_booking_bonus_days: parseInt(e?.target?.value) })}
              disabled={!isEditing}
            />
            <Input
              label="Puntos Bonus"
              type="number"
              value={config?.early_booking_bonus_points}
              onChange={(e) => setConfig({ ...config, early_booking_bonus_points: parseInt(e?.target?.value) })}
              disabled={!isEditing}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Los clientes recibirán puntos extra al reservar con {config?.early_booking_bonus_days} días o más de anticipación
          </p>
        </div>

        {/* App Booking Discount */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="font-semibold text-foreground mb-4">📱 Descuento por Reserva desde App</h4>
          <Input
            label="Porcentaje de Descuento (%)"
            type="number"
            value={config?.app_booking_discount_percentage}
            onChange={(e) => setConfig({ ...config, app_booking_discount_percentage: parseFloat(e?.target?.value) })}
            disabled={!isEditing}
          />
          <p className="text-sm text-muted-foreground mt-2">
            Los clientes recibirán un descuento al reservar desde la aplicación móvil
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyIntegration;