import React from 'react';
import Icon from '../../../components/AppIcon';

const VFEFunnelPanel = ({ nodes, onClose }) => {
  const funnelSteps = [
    { label: 'Ingresaron al flow', value: 423, color: 'bg-primary' },
    { label: 'Recibieron paso 1', value: 412, color: 'bg-blue-500' },
    { label: 'Avanzaron a paso 2', value: 298, color: 'bg-indigo-500' },
    { label: 'Llegaron a paso 3', value: 156, color: 'bg-violet-500' },
    { label: 'Convirtieron', value: 89, color: 'bg-emerald-500' },
  ];

  const maxVal = funnelSteps?.[0]?.value;
  const biggestDrop = funnelSteps?.reduce((acc, step, i) => {
    if (i === 0) return acc;
    const drop = funnelSteps?.[i - 1]?.value - step?.value;
    return drop > acc?.drop ? { index: i, drop, pct: Math.round(drop / funnelSteps?.[i - 1]?.value * 100) } : acc;
  }, { index: -1, drop: 0, pct: 0 });

  return (
    <div className="border-t border-border bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon name="Filter" size={16} className="text-primary" />
          <span className="text-sm font-bold text-foreground">Funnel de Conversión</span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
          <Icon name="X" size={14} className="text-muted-foreground" />
        </button>
      </div>
      <div className="p-4">
        <div className="space-y-2">
          {funnelSteps?.map((step, i) => {
            const pct = Math.round(step?.value / maxVal * 100);
            const isBigDrop = i === biggestDrop?.index;
            const dropPct = i > 0 ? Math.round((funnelSteps?.[i - 1]?.value - step?.value) / funnelSteps?.[i - 1]?.value * 100) : 0;
            return (
              <div key={i}>
                {i > 0 && (
                  <div className={`flex items-center gap-2 py-1 px-2 rounded text-xs ${
                    isBigDrop ? 'bg-red-50 text-red-600' : 'text-muted-foreground'
                  }`}>
                    <Icon name="ArrowDown" size={11} />
                    <span>-{dropPct}% ({funnelSteps?.[i - 1]?.value - step?.value} usuarios)</span>
                    {isBigDrop && <span className="font-semibold">← Mayor caída</span>}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-36 truncate">{step?.label}</span>
                  <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                    <div
                      className={`h-full ${isBigDrop ? 'bg-red-400' : step?.color} rounded-full transition-all flex items-center justify-end pr-2`}
                      style={{ width: `${pct}%` }}
                    >
                      <span className="text-xs text-white font-medium">{step?.value}</span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-foreground w-8 text-right">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
        {biggestDrop?.index > 0 && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Icon name="AlertTriangle" size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700">
                Aquí se pierde el <strong>{biggestDrop?.pct}%</strong> de los usuarios. Considera cambiar el mensaje o el incentivo de este paso.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VFEFunnelPanel;
