import React from 'react';
import Icon from '../../../components/AppIcon';

const funnelData = [
  { label: 'Ingresaron al flow', value: 423, pct: 100, color: 'bg-primary' },
  { label: 'Recibieron paso 1', value: 412, pct: 97, color: 'bg-blue-500' },
  { label: 'Avanzaron a paso 2', value: 298, pct: 70, color: 'bg-indigo-500' },
  { label: 'Llegaron a paso 3', value: 156, pct: 37, color: 'bg-violet-500' },
  { label: 'Convirtieron', value: 89, pct: 21, color: 'bg-success', highlight: false },
];

const FlowStatsPanel = ({ onClose }) => {
  const maxDrop = funnelData?.reduce((acc, curr, i) => {
    if (i === 0) return acc;
    const drop = funnelData?.[i-1]?.pct - curr?.pct;
    return drop > acc?.drop ? { index: i, drop } : acc;
  }, { index: -1, drop: 0 });

  return (
    <div className="border-t border-border bg-card">
      <div className="flex items-center justify-between px-6 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon name="BarChart2" size={16} className="text-primary" />
          <h3 className="text-sm font-bold text-foreground">Funnel del Flow</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
          <Icon name="ChevronDown" size={16} className="text-muted-foreground" />
        </button>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {funnelData?.map((step, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground font-medium">{step?.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">{step?.value?.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">{step?.pct}%</span>
                </div>
              </div>
              <div className="h-6 bg-muted rounded-md overflow-hidden relative">
                <div className={`h-full ${step?.color} rounded-md transition-all duration-500`} style={{ width: `${step?.pct}%` }}></div>
                {maxDrop?.index === i && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Icon name="AlertTriangle" size={12} className="text-destructive" />
                    <span className="text-xs text-destructive font-medium">Mayor caída ({maxDrop?.drop}%)</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {maxDrop?.index > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <div className="flex items-start gap-2">
              <Icon name="Lightbulb" size={14} className="text-warning mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Aquí se pierde el {maxDrop?.drop}% de los usuarios.</span> Considera cambiar el mensaje o aumentar el incentivo en el paso {maxDrop?.index}.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowStatsPanel;
