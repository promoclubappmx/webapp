import React from 'react';
import Icon from '../../../components/AppIcon';

const getNPSColor = (score) => {
  if (score >= 50) return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
  if (score >= 0) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
  return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
};

const NPSBenchmarkPanel = ({ myData, benchmarkData, hasEnoughData }) => {
  const myColors = getNPSColor(myData?.nps);
  const isAbove = myData?.nps >= benchmarkData?.avgNPS;
  const percentile = myData?.percentile;

  // Position on gradient bar (0-100%)
  const myPosition = Math.max(5, Math.min(95, ((myData?.nps + 100) / 200) * 100));
  const avgPosition = Math.max(5, Math.min(95, ((benchmarkData?.avgNPS + 100) / 200) * 100));

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6">
      <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
        <Icon name="TrendingUp" size={18} className="text-primary" />
        Comparativa NPS
      </h2>
      {!hasEnoughData ? (
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="Lock" size={28} className="text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Aún no hay suficientes negocios de tu categoría en este radio</p>
          <p className="text-xs text-muted-foreground mt-1">Prueba ampliando el radio de comparación.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* My business */}
            <div className={`rounded-xl p-5 border ${myColors?.bg} ${myColors?.border}`}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Tu negocio</p>
              <div className={`text-5xl font-bold mb-2 ${myColors?.text}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
                {myData?.nps}
              </div>
              <div className="space-y-1 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-600 font-medium">🟢 Promotores</span>
                  <span className="font-semibold">{myData?.promoters}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-600 font-medium">🟡 Neutros</span>
                  <span className="font-semibold">{myData?.neutrals}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-600 font-medium">🔴 Detractores</span>
                  <span className="font-semibold">{myData?.detractors}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{myData?.totalResponses} respuestas en el período</p>
            </div>

            {/* Benchmark */}
            <div className="rounded-xl p-5 border bg-muted/20 border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Benchmark de tu categoría en zona
              </p>
              <div className="text-5xl font-bold text-muted-foreground mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {benchmarkData?.avgNPS}
              </div>
              <div className="space-y-1 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-600 font-medium">🟢 Promotores</span>
                  <span className="font-semibold">{benchmarkData?.promoters}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-600 font-medium">🟡 Neutros</span>
                  <span className="font-semibold">{benchmarkData?.neutrals}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-600 font-medium">🔴 Detractores</span>
                  <span className="font-semibold">{benchmarkData?.detractors}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Basado en {benchmarkData?.businessCount} negocios de tu categoría</p>
            </div>
          </div>

          {/* Gradient bar */}
          <div className="mb-4">
            <div className="relative h-6 rounded-full overflow-visible" style={{ background: 'linear-gradient(to right, #EF4444, #F59E0B, #10B981)' }}>
              {/* Average marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
                style={{ left: `${avgPosition}%`, transform: 'translateX(-50%) translateY(-50%)' }}
              >
                <div className="w-3 h-3 bg-white border-2 border-gray-500 rounded-full shadow" />
                <span className="text-xs text-muted-foreground mt-1 whitespace-nowrap">Promedio</span>
              </div>
              {/* My marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
                style={{ left: `${myPosition}%`, transform: 'translateX(-50%) translateY(-50%)' }}
              >
                <div className="w-4 h-4 bg-primary border-2 border-white rounded-full shadow-lg" />
                <span className="text-xs text-primary font-semibold mt-1 whitespace-nowrap">Tú</span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-5">
              <span>-100</span>
              <span>0</span>
              <span>+100</span>
            </div>
          </div>

          {/* Performance indicator */}
          <div className={`flex items-center gap-2 p-3 rounded-xl ${isAbove ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
            <Icon
              name={isAbove ? 'TrendingUp' : 'TrendingDown'}
              size={18}
              className={isAbove ? 'text-emerald-600' : 'text-red-600'}
            />
            <div>
              <p className={`text-sm font-semibold ${isAbove ? 'text-emerald-700' : 'text-red-700'}`}>
                {isAbove ? '↑ Estás por encima del promedio de tu zona' : '↓ Estás por debajo del promedio de tu zona'}
              </p>
              <p className="text-xs text-muted-foreground">
                Tu NPS está en el percentil <strong>{percentile}</strong> de tu categoría en esta zona
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NPSBenchmarkPanel;
