import React from 'react';
import Icon from '../../../components/AppIcon';

const DimensionsBenchmarkPanel = ({ dimensions, hasEnoughData }) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6">
      <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
        <Icon name="LayoutGrid" size={18} className="text-primary" />
        Comparativa por dimensiones
      </h2>
      {!hasEnoughData ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="Lock" size={22} className="text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No hay suficientes negocios para mostrar esta comparativa.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dimensión</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tu score</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Promedio categoría</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {dimensions?.map((dim, idx) => {
                const diff = (dim?.myScore - dim?.avgScore)?.toFixed(1);
                const isPositive = diff > 0;
                const isNeutral = diff == 0;
                return (
                  <tr key={idx} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">{dim?.name}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-foreground">{dim?.myScore} ★</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-muted-foreground">{dim?.avgScore} ★</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 font-semibold ${
                        isNeutral ? 'text-muted-foreground' : isPositive ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {isNeutral ? '—' : (
                          <>
                            <Icon name={isPositive ? 'ArrowUp' : 'ArrowDown'} size={14} />
                            {Math.abs(diff)}
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DimensionsBenchmarkPanel;
