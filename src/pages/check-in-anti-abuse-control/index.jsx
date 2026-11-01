import React, { useState } from 'react';
import Icon from '../../components/AppIcon';
import FrequencySection from './components/FrequencySection';
import CooldownSection from './components/CooldownSection';
import MethodRulesSection from './components/MethodRulesSection';
import AlertsSection from './components/AlertsSection';
import AbuseSummaryCard from './components/AbuseSummaryCard';
import AbuseHistoryPanel from './components/AbuseHistoryPanel';

const CheckInAntiAbuseControl = () => {
  const [freqType, setFreqType] = useState('once_day');
  const [freqHours, setFreqHours] = useState(4);
  const [freqMax, setFreqMax] = useState(3);
  const [cooldown, setCooldown] = useState(30);
  const [methodRulesEnabled, setMethodRulesEnabled] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState(5);

  const getSummary = () => {
    let freqText = '';
    if (freqType === 'once_day') freqText = '1 vez al día';
    else if (freqType === 'every_x_hours') freqText = `cada ${freqHours} horas`;
    else if (freqType === 'max_per_day') freqText = `hasta ${freqMax} veces al día`;
    else freqText = 'sin límite';
    const cooldownMap = { 15: '15 minutos', 30: '30 minutos', 60: '1 hora', 120: '2 horas', 240: '4 horas' };
    const cooldownLabel = cooldownMap?.[cooldown] || '30 minutos';
    return `Cada usuario puede hacer check-in ${freqText}, con un mínimo de ${cooldownLabel} entre check-ins.${alertsEnabled ? ` Se recibirán alertas si un usuario intenta más de ${alertThreshold} veces en un día.` : ''}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <a
            href="/check-in-module"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="ArrowLeft" size={16} />
            Check-in
          </a>
          <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
          <span className="text-sm text-foreground font-medium">Control Anti-Abuso</span>
        </div>

        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <Icon name="Shield" size={24} className="text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Control Anti-Abuso</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Configura reglas de frecuencia y protección contra check-ins fraudulentos para mantener la integridad de tu programa.
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Check-ins bloqueados hoy', value: '3', icon: 'Ban', color: 'text-red-600 bg-red-50' },
            { label: 'Intentos sospechosos', value: '1', icon: 'AlertTriangle', color: 'text-amber-600 bg-amber-50' },
            { label: 'Tasa de abuso', value: '0.6%', icon: 'TrendingDown', color: 'text-green-600 bg-green-50' },
            { label: 'Reglas activas', value: '2', icon: 'Shield', color: 'text-blue-600 bg-blue-50' },
          ]?.map(stat => (
            <div key={stat?.label} className="bg-card border border-border rounded-xl p-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${stat?.color}`}>
                <Icon name={stat?.icon} size={18} />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat?.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat?.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Config */}
          <div className="lg:col-span-2 space-y-5">
            <FrequencySection
              freqType={freqType}
              setFreqType={setFreqType}
              freqHours={freqHours}
              setFreqHours={setFreqHours}
              freqMax={freqMax}
              setFreqMax={setFreqMax}
            />
            <CooldownSection cooldown={cooldown} setCooldown={setCooldown} />
            <MethodRulesSection
              enabled={methodRulesEnabled}
              setEnabled={setMethodRulesEnabled}
            />
            <AlertsSection
              alertsEnabled={alertsEnabled}
              setAlertsEnabled={setAlertsEnabled}
              alertThreshold={alertThreshold}
              setAlertThreshold={setAlertThreshold}
            />
            <AbuseSummaryCard summary={getSummary()} />

            {/* Save Button */}
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                Guardar configuración
              </button>
              <button className="px-6 py-3 border border-border rounded-xl text-foreground hover:bg-muted/50 transition-colors">
                Cancelar
              </button>
            </div>
          </div>

          {/* Right: History */}
          <div className="lg:col-span-1">
            <AbuseHistoryPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInAntiAbuseControl;
