import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const GeofenceMethodConfig = ({ onBack }) => {
  const [radius, setRadius] = useState(50);
  const [dwellTime, setDwellTime] = useState('2min');
  const [notifyUser, setNotifyUser] = useState(true);
  const [pushMessage, setPushMessage] = useState('¡Bienvenido a Mi Negocio! Tu visita fue registrada 🎉');
  const [onlyDuringHours, setOnlyDuringHours] = useState(true);

  const dwellOptions = [
    { value: 'instant', label: 'Instantáneo', note: 'Mayor alcance, puede generar falsos positivos' },
    { value: '2min', label: '2 minutos', note: 'Recomendado para la mayoría' },
    { value: '5min', label: '5 minutos', note: 'Para zonas peatonales concurridas' },
    { value: '10min', label: '10 minutos', note: 'Para negocios donde el cliente permanece tiempo (restaurantes, salones)' },
  ];

  const getRadiusDescription = (r) => {
    if (r <= 25) return 'Solo dentro de tu local';
    if (r <= 40) return 'Tu local y entrada inmediata';
    if (r <= 60) return 'Aproximadamente tu cuadra';
    if (r <= 80) return 'Tu cuadra y alrededores';
    return 'Radio amplio — incluye estacionamiento y vereda';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left */}
      <div className="lg:col-span-7 space-y-5">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <Icon name="ArrowLeft" size={16} />
              Volver a Métodos
            </button>
          )}
          <h2 className="text-xl font-bold text-foreground mb-1">Geofence Automático</h2>
          <p className="text-sm text-muted-foreground">El sistema detecta automáticamente cuando un cliente entra al radio del negocio.</p>
        </div>

        {/* Radius */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3">Radio de activación</h3>
          <input
            type="range"
            min={20}
            max={100}
            step={5}
            value={radius}
            onChange={e => setRadius(Number(e?.target?.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            {[20, 30, 50, 75, 100]?.map(v => <span key={v}>{v}m</span>)}
          </div>
          <div className="mt-3 p-3 bg-primary/5 rounded-lg">
            <p className="text-sm font-medium text-foreground">Radio actual: <strong>{radius}m</strong></p>
            <p className="text-xs text-muted-foreground mt-0.5">{getRadiusDescription(radius)}</p>
          </div>
          {radius < 30 && (
            <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
              <Icon name="Info" size={12} />
              En zonas urbanas densas, radios menores a 30m reducen falsos positivos de negocios vecinos.
            </p>
          )}
        </div>

        {/* Dwell Time */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3">Tiempo mínimo de permanencia</h3>
          <div className="space-y-2">
            {dwellOptions?.map(opt => (
              <button
                key={opt?.value}
                onClick={() => setDwellTime(opt?.value)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                  dwellTime === opt?.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 ${
                  dwellTime === opt?.value ? 'border-primary bg-primary' : 'border-gray-300'
                }`} />
                <div>
                  <p className="text-sm font-medium text-foreground">{opt?.label}</p>
                  <p className="text-xs text-muted-foreground">{opt?.note}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Notification */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Notificación al usuario</h3>
            <button
              onClick={() => setNotifyUser(!notifyUser)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifyUser ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                notifyUser ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          {notifyUser && (
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Mensaje de bienvenida (máx. 100 caracteres)</label>
              <input
                type="text"
                value={pushMessage}
                onChange={e => setPushMessage(e?.target?.value?.slice(0, 100))}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <p className="text-xs text-muted-foreground mt-1">{pushMessage?.length}/100 caracteres</p>
            </div>
          )}
        </div>

        {/* Operating Hours */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Solo en horario de operación</h3>
              <p className="text-xs text-muted-foreground mt-0.5">El geofence se desactiva fuera del horario configurado en tu ficha.</p>
            </div>
            <button
              onClick={() => setOnlyDuringHours(!onlyDuringHours)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                onlyDuringHours ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                onlyDuringHours ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>
      {/* Right: Map */}
      <div className="lg:col-span-5">
        <div className="bg-card border border-border rounded-xl p-5 sticky top-4">
          <h3 className="font-semibold text-foreground mb-3">Zona de check-in automático</h3>
          <div className="relative w-full h-64 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden">
            {/* Map placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Geofence circle */}
                <div
                  className="rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center transition-all duration-300"
                  style={{ width: radius * 2.2, height: radius * 2.2 }}
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <Icon name="MapPin" size={16} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-gray-700 shadow">
              Radio: {radius}m
            </div>
          </div>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>78%</strong> de tus clientes tienen permisos de ubicación activos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeofenceMethodConfig;
