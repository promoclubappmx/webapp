import React, { useState } from 'react';

const funnelSteps = [
  { label: 'Clientes en radio', value: 1240, pct: null, benchmark: null },
  { label: 'Con app activa', value: 312, pct: 25, benchmark: 28, tooltip: 'Clientes con la app PromoClub instalada y activa en el radio. Sugerencia: Incentiva la descarga de la app con puntos de bienvenida.' },
  { label: 'Notificación enviada', value: 287, pct: 92, benchmark: 88, tooltip: 'Notificaciones enviadas exitosamente. Tasa excelente, por encima del benchmark.' },
  { label: 'Notificación abierta', value: 143, pct: 50, benchmark: 41, tooltip: 'Clientes que abrieron la notificación. Estás por encima del benchmark. ¡Buen trabajo!' },
  { label: 'Conversión (visita/canje)', value: 61, pct: 43, benchmark: 35, tooltip: 'Clientes que realizaron check-in o canje en las siguientes 2 horas. Excelente tasa de conversión.' },
];

const GeofenceFunnelChart = () => {
  const [hoveredStep, setHoveredStep] = useState(null);

  const maxValue = funnelSteps?.[0]?.value;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 h-full">
      <h2 className="text-base font-semibold text-foreground mb-4">Funnel de conversión</h2>
      <div className="space-y-2">
        {funnelSteps?.map((step, i) => {
          const widthPct = (step?.value / maxValue) * 100;
          const isAboveBenchmark = step?.pct !== null && step?.benchmark !== null && step?.pct >= step?.benchmark;
          const isBelowBenchmark = step?.pct !== null && step?.benchmark !== null && step?.pct < step?.benchmark;

          return (
            <div
              key={i}
              className="relative cursor-pointer"
              onMouseEnter={() => setHoveredStep(i)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground truncate max-w-[140px]">{step?.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground font-mono">{step?.value?.toLocaleString()}</span>
                  {step?.pct !== null && (
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                      isAboveBenchmark ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {step?.pct}%
                    </span>
                  )}
                </div>
              </div>
              <div className="h-7 bg-muted rounded-lg overflow-hidden">
                <div
                  className={`h-full rounded-lg transition-all duration-500 ${
                    i === 0 ? 'bg-blue-500' : isAboveBenchmark ?'bg-green-500': isBelowBenchmark ?'bg-red-400' : 'bg-blue-400'
                  }`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
              {/* Tooltip */}
              {hoveredStep === i && step?.tooltip && (
                <div className="absolute z-20 bottom-full left-0 mb-2 w-56 bg-foreground text-background text-xs p-2.5 rounded-xl shadow-xl">
                  {step?.tooltip}
                  <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            Por encima del benchmark
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            Por debajo del benchmark
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeofenceFunnelChart;
