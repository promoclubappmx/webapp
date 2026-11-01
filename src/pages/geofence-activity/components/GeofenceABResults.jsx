import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const abData = {
  variantA: {
    title: '¡Hola! Estás cerca de Café Aroma',
    body: 'Tenemos una oferta especial para ti hoy 🎁',
    sent: 144,
    opened: 62,
    openRate: 43,
    converted: 21,
    conversionRate: 34,
  },
  variantB: {
    title: '¿Ya pasaste por Café Aroma hoy? ☕',
    body: 'Tu bebida favorita te está esperando. 20% OFF solo hoy.',
    sent: 143,
    opened: 81,
    openRate: 57,
    converted: 40,
    conversionRate: 49,
  },
};

const GeofenceABResults = () => {
  const [applied, setApplied] = useState(false);

  const winner = abData?.variantB?.openRate > abData?.variantA?.openRate ? 'B' : 'A';
  const confidence = 95;

  const handleApplyWinner = () => {
    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Resultados A/B Testing</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Comparativa de variantes de notificación de bienvenida</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs font-semibold">
          <Icon name="Trophy" size={14} />
          Variante {winner} ganando con {confidence}% de confianza
        </div>
      </div>
      {/* Variant messages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {['A', 'B']?.map((variant) => {
          const data = variant === 'A' ? abData?.variantA : abData?.variantB;
          const isWinner = variant === winner;
          return (
            <div
              key={variant}
              className={`p-4 rounded-xl border-2 ${isWinner ? 'border-green-400 bg-green-50/50' : 'border-border bg-muted/20'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">Variante {variant}</span>
                {isWinner && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Icon name="CheckCircle" size={11} />
                    Ganadora
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-foreground mb-0.5">{data?.title}</p>
              <p className="text-xs text-muted-foreground">{data?.body}</p>
            </div>
          );
        })}
      </div>
      {/* Comparison table */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Métrica</th>
              <th className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground">Variante A</th>
              <th className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground">Variante B</th>
              <th className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground">Diferencia</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/50">
              <td className="py-2.5 px-3 text-xs text-muted-foreground">Enviadas</td>
              <td className="py-2.5 px-3 text-xs font-mono text-center text-foreground">{abData?.variantA?.sent}</td>
              <td className="py-2.5 px-3 text-xs font-mono text-center text-foreground">{abData?.variantB?.sent}</td>
              <td className="py-2.5 px-3 text-xs font-mono text-center text-muted-foreground">~50/50</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2.5 px-3 text-xs text-muted-foreground">Tasa de apertura</td>
              <td className="py-2.5 px-3 text-xs font-mono text-center text-foreground">{abData?.variantA?.openRate}%</td>
              <td className="py-2.5 px-3 text-xs font-mono text-center font-semibold text-green-600">{abData?.variantB?.openRate}%</td>
              <td className="py-2.5 px-3 text-xs font-mono text-center text-green-600 font-semibold">
                +{abData?.variantB?.openRate - abData?.variantA?.openRate}pp ↑
              </td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 text-xs text-muted-foreground">Tasa de conversión</td>
              <td className="py-2.5 px-3 text-xs font-mono text-center text-foreground">{abData?.variantA?.conversionRate}%</td>
              <td className="py-2.5 px-3 text-xs font-mono text-center font-semibold text-green-600">{abData?.variantB?.conversionRate}%</td>
              <td className="py-2.5 px-3 text-xs font-mono text-center text-green-600 font-semibold">
                +{abData?.variantB?.conversionRate - abData?.variantA?.conversionRate}pp ↑
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex justify-end">
        <button
          onClick={handleApplyWinner}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors"
        >
          <Icon name="CheckCircle" size={16} />
          {applied ? '✓ Variante aplicada' : `Aplicar Variante ${winner} como principal`}
        </button>
      </div>
    </div>
  );
};

export default GeofenceABResults;
