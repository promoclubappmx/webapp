import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const COOLDOWN_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hora' },
  { value: 120, label: '2 horas' },
  { value: 240, label: '4 horas' },
];

const mockAbuseHistory = [
  { id: 1, user: 'Diego Ramírez', attempts: 8, limit: 1, date: '2026-03-04', method: 'QR', status: 'bloqueado' },
  { id: 2, user: 'Andrés Gutiérrez', attempts: 6, limit: 1, date: '2026-03-03', method: 'Geofence', status: 'bloqueado' },
  { id: 3, user: 'Ricardo Delgado', attempts: 5, limit: 1, date: '2026-03-01', method: 'QR', status: 'alerta' },
];

const CheckInControlTab = () => {
  const [freqType, setFreqType] = useState('once_day');
  const [freqHours, setFreqHours] = useState(4);
  const [freqMax, setFreqMax] = useState(3);
  const [cooldown, setCooldown] = useState(30);
  const [showMethodRules, setShowMethodRules] = useState(false);
  const [methodRulesEnabled, setMethodRulesEnabled] = useState(false);
  const [methodRules, setMethodRules] = useState({
    qr: 'once_day',
    geofence: 'once_day',
    manual: 'once_day',
    nfc: 'once_day',
    beacon: 'max_per_day',
  });
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState(5);
  const [showAbuseHistory, setShowAbuseHistory] = useState(false);

  const freqOptions = [
    {
      id: 'once_day',
      icon: 'Calendar',
      label: '1 vez al día',
      desc: 'El usuario puede hacer check-in una vez por día. Ideal para la mayoría de negocios.',
      badge: 'Más popular',
      badgeColor: 'bg-primary/10 text-primary',
    },
    {
      id: 'every_x_hours',
      icon: 'Clock',
      label: 'Cada X horas',
      desc: 'Permite varias visitas al día si pasan suficientes horas entre cada una.',
      badge: null,
    },
    {
      id: 'max_per_day',
      icon: 'Repeat',
      label: 'Hasta X veces al día',
      desc: 'Fija un máximo diario sin restricción de horas entre check-ins.',
      badge: null,
    },
    {
      id: 'unlimited',
      icon: 'Infinity',
      label: 'Sin límite',
      desc: 'Sin restricciones. Solo recomendado para modelos de negocio con acceso ilimitado.',
      badge: 'No recomendado',
      badgeColor: 'bg-red-100 text-red-600',
    },
  ];

  const methodsList = [
    { id: 'qr', label: 'QR en Mostrador' },
    { id: 'geofence', label: 'Geofence Automático' },
    { id: 'manual', label: 'Código Manual' },
    { id: 'nfc', label: 'NFC / Tap' },
    { id: 'beacon', label: 'BLE Beacon' },
  ];

  const freqLabels = {
    once_day: '1 vez al día',
    every_x_hours: 'Cada X horas',
    max_per_day: 'Hasta X veces',
    unlimited: 'Sin límite',
  };

  const getSummary = () => {
    let freqText = '';
    if (freqType === 'once_day') freqText = '1 vez al día';
    else if (freqType === 'every_x_hours') freqText = `cada ${freqHours} horas`;
    else if (freqType === 'max_per_day') freqText = `hasta ${freqMax} veces al día`;
    else freqText = 'sin límite';
    const cooldownLabel = COOLDOWN_OPTIONS?.find(o => o?.value === cooldown)?.label || '30 min';
    return `Cada usuario puede hacer check-in ${freqText}, con un mínimo de ${cooldownLabel} entre check-ins.${alertsEnabled ? ` Se recibirán alertas si un usuario intenta más de ${alertThreshold} veces en un día.` : ''}`;
  };

  return (
    <div className="max-w-3xl space-y-5">
      {/* Frequency */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Frecuencia máxima de check-in</h3>
        <div className="space-y-3">
          {freqOptions?.map(opt => (
            <button
              key={opt?.id}
              onClick={() => setFreqType(opt?.id)}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                freqType === opt?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                freqType === opt?.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                <Icon name={opt?.icon} size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-foreground">{opt?.label}</span>
                  {opt?.badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${opt?.badgeColor}`}>{opt?.badge}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{opt?.desc}</p>
                {freqType === opt?.id && opt?.id === 'every_x_hours' && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-foreground">Cada</span>
                    <input
                      type="number"
                      min={2}
                      max={12}
                      value={freqHours}
                      onChange={e => setFreqHours(Number(e?.target?.value))}
                      onClick={e => e?.stopPropagation()}
                      className="w-16 border border-border rounded-lg px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <span className="text-sm text-foreground">horas (mín. 2, máx. 12)</span>
                  </div>
                )}
                {freqType === opt?.id && opt?.id === 'max_per_day' && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-foreground">Hasta</span>
                    <input
                      type="number"
                      min={2}
                      max={10}
                      value={freqMax}
                      onChange={e => setFreqMax(Number(e?.target?.value))}
                      onClick={e => e?.stopPropagation()}
                      className="w-16 border border-border rounded-lg px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <span className="text-sm text-foreground">veces al día</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cooldown */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-1">Cooldown entre check-ins</h3>
        <p className="text-xs text-muted-foreground mb-4">Tiempo mínimo entre dos check-ins del mismo usuario. Previene dobles registros accidentales.</p>
        <div className="flex flex-wrap gap-2">
          {COOLDOWN_OPTIONS?.map(opt => (
            <button
              key={opt?.value}
              onClick={() => setCooldown(opt?.value)}
              className={`flex-1 min-w-[70px] py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                cooldown === opt?.value ? 'border-primary bg-primary text-white' : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              {opt?.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Cooldown mínimo técnico: 1 minuto (hardcoded para prevenir race conditions).
        </p>
      </div>

      {/* Method-specific rules */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => setShowMethodRules(!showMethodRules)}
          className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Reglas por método</h3>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Avanzado</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e?.stopPropagation(); setMethodRulesEnabled(!methodRulesEnabled); }}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                methodRulesEnabled ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                methodRulesEnabled ? 'translate-x-4' : 'translate-x-0.5'
              }`} />
            </button>
            <Icon name={showMethodRules ? 'ChevronUp' : 'ChevronDown'} size={18} className="text-muted-foreground" />
          </div>
        </button>
        {showMethodRules && (
          <div className="px-5 pb-5">
            <p className="text-xs text-muted-foreground mb-3">
              {methodRulesEnabled
                ? 'Configura reglas individuales por método. Útil para dar más flexibilidad a métodos automáticos.'
                : 'Activa para configurar reglas diferentes por método. Por default, todos heredan la regla global.'}
            </p>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Método</th>
                  <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Regla de frecuencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {methodsList?.map(m => (
                  <tr key={m?.id}>
                    <td className="py-2.5 text-sm text-foreground">{m?.label}</td>
                    <td className="py-2.5">
                      {methodRulesEnabled ? (
                        <select
                          value={methodRules?.[m?.id]}
                          onChange={e => setMethodRules(prev => ({ ...prev, [m?.id]: e?.target?.value }))}
                          className="border border-border rounded-lg px-2 py-1 text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          <option value="once_day">1 vez al día</option>
                          <option value="every_x_hours">Cada X horas</option>
                          <option value="max_per_day">Hasta X veces</option>
                          <option value="unlimited">Sin límite</option>
                        </select>
                      ) : (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Hereda regla global</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Alerts */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground">Alertas de intentos sospechosos</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Detecta patrones de abuso y envía notificaciones al Admin.</p>
          </div>
          <button
            onClick={() => setAlertsEnabled(!alertsEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              alertsEnabled ? 'bg-primary' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              alertsEnabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
        {alertsEnabled && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-foreground">Alertar si un usuario intenta más de</span>
              <input
                type="number"
                min={2}
                max={20}
                value={alertThreshold}
                onChange={e => setAlertThreshold(Number(e?.target?.value))}
                className="w-16 border border-border rounded-lg px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <span className="text-sm text-foreground">check-ins fallidos en un día</span>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-foreground">Patrones detectados automáticamente:</p>
              {[
                'Intentos muy por encima del límite configurado',
                'Check-ins desde ubicaciones inconsistentes',
                'Velocidad de viaje imposible entre sucursales',
              ]?.map((pattern, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon name="AlertCircle" size={13} className="text-amber-500 flex-shrink-0" />
                  {pattern}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Abuse History */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => setShowAbuseHistory(!showAbuseHistory)}
          className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Historial de intentos sospechosos</h3>
            {mockAbuseHistory?.length > 0 && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{mockAbuseHistory?.length} alertas</span>
            )}
          </div>
          <Icon name={showAbuseHistory ? 'ChevronUp' : 'ChevronDown'} size={18} className="text-muted-foreground" />
        </button>
        {showAbuseHistory && (
          <div className="px-5 pb-5">
            {mockAbuseHistory?.length === 0 ? (
              <div className="text-center py-6">
                <Icon name="ShieldCheck" size={32} className="text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Sin intentos sospechosos registrados.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {mockAbuseHistory?.map(item => (
                  <div key={item?.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <Icon name="AlertTriangle" size={15} className="text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item?.user}</p>
                        <p className="text-xs text-muted-foreground">{item?.attempts} intentos · {item?.method} · {item?.date}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item?.status === 'bloqueado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item?.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Card */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Icon name="FileText" size={18} className="text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Configuración actual</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{getSummary()}</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Icon name="Save" size={16} />
          Guardar configuración de control
        </button>
      </div>
    </div>
  );
};

export default CheckInControlTab;
