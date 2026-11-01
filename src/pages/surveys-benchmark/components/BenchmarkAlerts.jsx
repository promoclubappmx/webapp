import React from 'react';
import Icon from '../../../components/AppIcon';

const alerts = [
  {
    type: 'red',
    icon: '🔴',
    message: 'Tu NPS bajó 8 puntos este mes mientras el promedio de tu categoría subió 2.',
    cta: 'Revisar reseñas recientes',
    ctaIcon: 'ExternalLink',
  },
  {
    type: 'green',
    icon: '🟢',
    message: 'Tu satisfacción en Calidad de producto está 0.5 puntos por encima del promedio. ¡Sigue así!',
    cta: null,
  },
  {
    type: 'yellow',
    icon: '🟡',
    message: 'Tu tasa de respuesta (18%) está por debajo del promedio de tu categoría (31%). Considera ofrecer un incentivo.',
    cta: 'Configurar incentivo',
    ctaIcon: 'Settings',
  },
];

const colorMap = {
  red: 'bg-red-50 border-red-200',
  green: 'bg-emerald-50 border-emerald-200',
  yellow: 'bg-amber-50 border-amber-200',
};

const BenchmarkAlerts = () => {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6">
      <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
        <Icon name="Bell" size={18} className="text-primary" />
        Alertas de benchmark
      </h2>
      <div className="space-y-3">
        {alerts?.map((alert, idx) => (
          <div key={idx} className={`flex items-start gap-3 p-4 rounded-xl border ${colorMap?.[alert?.type]}`}>
            <span className="text-lg flex-shrink-0 mt-0.5">{alert?.icon}</span>
            <div className="flex-1">
              <p className="text-sm text-foreground">{alert?.message}</p>
              {alert?.cta && (
                <button className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                  <Icon name={alert?.ctaIcon} size={12} />
                  {alert?.cta}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BenchmarkAlerts;
