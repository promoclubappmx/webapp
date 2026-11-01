import React from 'react';
import Icon from '../../../components/AppIcon';

const FREQ_OPTIONS = [
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

const FrequencySection = ({ freqType, setFreqType, freqHours, setFreqHours, freqMax, setFreqMax }) => (
  <div className="bg-card border border-border rounded-xl p-5">
    <h3 className="font-semibold text-foreground mb-4">Frecuencia máxima de check-in</h3>
    <div className="space-y-3">
      {FREQ_OPTIONS?.map(opt => (
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
              <div className="mt-2 flex items-center gap-2" onClick={e => e?.stopPropagation()}>
                <span className="text-sm text-foreground">Cada</span>
                <input
                  type="number"
                  min={2}
                  max={12}
                  value={freqHours}
                  onChange={e => setFreqHours(Number(e?.target?.value))}
                  className="w-16 border border-border rounded-lg px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <span className="text-sm text-foreground">horas (mín. 2, máx. 12)</span>
              </div>
            )}
            {freqType === opt?.id && opt?.id === 'max_per_day' && (
              <div className="mt-2 flex items-center gap-2" onClick={e => e?.stopPropagation()}>
                <span className="text-sm text-foreground">Hasta</span>
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={freqMax}
                  onChange={e => setFreqMax(Number(e?.target?.value))}
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
);

export default FrequencySection;
