import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const MOCK_ALERTAS = [
  {
    id: 1,
    tipo: 'warning',
    titulo: 'Tasa de apertura baja en Paso 2',
    mensaje: 'La tasa de apertura del paso 2 es 40% menor que el paso 1. Considera ajustar el mensaje o el timing.',
    accion: 'Ajustar mensaje',
    icono: 'AlertTriangle',
  },
  {
    id: 2,
    tipo: 'info',
    titulo: 'Presupuesto al 65%',
    mensaje: 'Tu presupuesto se agotará en aproximadamente 3 días al ritmo actual de conversiones.',
    accion: 'Ajustar presupuesto',
    icono: 'DollarSign',
  },
  {
    id: 3,
    tipo: 'success',
    titulo: 'Variante A ganando con 95% de confianza',
    mensaje: 'La Variante A está superando significativamente a la B. Considera desplegar la variante ganadora.',
    accion: 'Ver resultados A/B',
    icono: 'TrendingUp',
  },
];

const TIPO_CONFIG = {
  warning: { bg: 'bg-warning/10', border: 'border-warning/30', icon: 'text-warning', text: 'text-warning' },
  info: { bg: 'bg-primary/10', border: 'border-primary/30', icon: 'text-primary', text: 'text-primary' },
  success: { bg: 'bg-success/10', border: 'border-success/30', icon: 'text-success', text: 'text-success' },
  error: { bg: 'bg-destructive/10', border: 'border-destructive/30', icon: 'text-destructive', text: 'text-destructive' },
};

const PerformanceAlerts = ({ alertas }) => {
  const [dismissed, setDismissed] = useState([]);
  const data = (alertas?.length > 0 ? alertas : MOCK_ALERTAS)?.filter(a => !dismissed?.includes(a?.id));

  if (data?.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
        <Icon name="Bell" size={18} className="text-primary" />
        Alertas de rendimiento
        <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full">{data?.length}</span>
      </h3>
      <div className="space-y-3">
        {data?.map(alerta => {
          const cfg = TIPO_CONFIG?.[alerta?.tipo] || TIPO_CONFIG?.info;
          return (
            <div key={alerta?.id} className={`flex items-start gap-3 p-3 rounded-xl border ${cfg?.bg} ${cfg?.border}`}>
              <Icon name={alerta?.icono} size={16} className={`${cfg?.icon} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${cfg?.text}`}>{alerta?.titulo}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{alerta?.mensaje}</p>
              </div>
              <button
                onClick={() => setDismissed(prev => [...prev, alerta?.id])}
                className="p-1 hover:bg-black/10 rounded transition-colors flex-shrink-0"
              >
                <Icon name="X" size={12} className="text-muted-foreground" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PerformanceAlerts;
