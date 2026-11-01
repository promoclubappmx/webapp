import React from 'react';
import { TrendingUp } from 'lucide-react';

const BasePointsSection = ({ basePoints, setBasePoints, visitsForFirstReward, avgVisitsPerMonth, cheapestRewardPoints }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <TrendingUp size={16} className="text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">Puntos base por check-in</h3>
      </div>
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* Input */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setBasePoints(p => Math.max(1, p - 1))}
            className="w-10 h-10 rounded-xl border-2 border-border flex items-center justify-center text-foreground hover:bg-muted hover:border-primary/40 transition-all text-lg font-medium"
          >
            −
          </button>
          <div className="text-center">
            <span className="text-5xl font-bold text-foreground">{basePoints}</span>
            <p className="text-xs text-muted-foreground mt-1">puntos</p>
          </div>
          <button
            onClick={() => setBasePoints(p => p + 1)}
            className="w-10 h-10 rounded-xl border-2 border-border flex items-center justify-center text-foreground hover:bg-muted hover:border-primary/40 transition-all text-lg font-medium"
          >
            +
          </button>
        </div>

        {/* Context Card */}
        <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm text-blue-900 leading-relaxed">
            Con <span className="font-bold">{basePoints}</span> puntos por check-in, un cliente necesita{' '}
            <span className="font-bold">{visitsForFirstReward}</span> visitas para su primera recompensa
            ({cheapestRewardPoints} puntos mínimos).
          </p>
          <p className="text-sm text-blue-700 mt-2">
            El mes pasado, tu cliente promedio visitó{' '}
            <span className="font-bold">{avgVisitsPerMonth}</span> veces.
          </p>
          {visitsForFirstReward <= avgVisitsPerMonth ? (
            <div className="mt-2 flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <p className="text-xs text-green-700 font-medium">Tu cliente promedio puede canjear su primera recompensa cada mes ✓</p>
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-1.5">
              <div className="w-2 h-2 bg-amber-500 rounded-full" />
              <p className="text-xs text-amber-700 font-medium">Considera aumentar los puntos para que los clientes lleguen a su primera recompensa más rápido</p>
            </div>
          )}
        </div>
      </div>
      {/* Quick presets */}
      <div className="mt-4">
        <p className="text-xs text-muted-foreground mb-2">Valores sugeridos por vertical:</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Café', value: 5 },
            { label: 'Restaurante', value: 10 },
            { label: 'Retail', value: 10 },
            { label: 'Salón de belleza', value: 15 },
            { label: 'Gimnasio', value: 20 },
          ]?.map(preset => (
            <button
              key={preset?.label}
              onClick={() => setBasePoints(preset?.value)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                basePoints === preset?.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              {preset?.label}: {preset?.value} pts
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BasePointsSection;
