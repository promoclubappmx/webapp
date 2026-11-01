import React from 'react';
import Icon from '../../../components/AppIcon';

const SUSPICIOUS_PATTERNS = [
  { icon: 'TrendingUp', label: 'Intentos muy por encima del límite configurado' },
  { icon: 'MapPin', label: 'Check-ins desde ubicaciones inconsistentes (geofence + manual simultáneo)' },
  { icon: 'Zap', label: 'Velocidad de viaje imposible entre sucursales' },
];

const AlertsSection = ({ alertsEnabled, setAlertsEnabled, alertThreshold, setAlertThreshold }) => (
  <div className="bg-card border border-border rounded-xl p-5">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="font-semibold text-foreground">Alertas de intentos sospechosos</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Detecta patrones de abuso y notifica al Admin en tiempo real.</p>
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
        <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
          <span className="text-sm text-foreground whitespace-nowrap">Alertar si un usuario intenta más de</span>
          <input
            type="number"
            min={2}
            max={20}
            value={alertThreshold}
            onChange={e => setAlertThreshold(Number(e?.target?.value))}
            className="w-16 border border-border rounded-lg px-2 py-1.5 text-sm bg-background text-center font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <span className="text-sm text-foreground whitespace-nowrap">check-ins fallidos en un día</span>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Patrones detectados automáticamente</p>
          <div className="space-y-2">
            {SUSPICIOUS_PATTERNS?.map((p, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 bg-amber-50 border border-amber-100 rounded-lg">
                <Icon name={p?.icon} size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-amber-800">{p?.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-xs text-blue-700">
            <strong>Canales de alerta:</strong> Notificación push al Admin + aparece en el dashboard del negocio con badge de alerta.
          </p>
        </div>
      </div>
    )}
  </div>
);

export default AlertsSection;
