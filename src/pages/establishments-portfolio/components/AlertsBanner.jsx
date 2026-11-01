import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { useNavigate } from 'react-router-dom';

const AlertsBanner = ({ establishments }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const allAlerts = establishments?.flatMap(e =>
    (e?.alerts || [])?.map(a => ({ ...a, businessName: e?.name, businessColor: e?.logoColor, businessInitial: e?.initial }))
  )?.sort((a, b) => {
    const order = { red: 0, yellow: 1, green: 2 };
    return order?.[a?.type] - order?.[b?.type];
  });

  if (allAlerts?.length === 0) return null;

  const alertConfig = {
    red: { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800', icon: 'AlertCircle', iconColor: 'text-red-500', btnClass: 'bg-red-500 hover:bg-red-600 text-white' },
    yellow: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', icon: 'AlertTriangle', iconColor: 'text-amber-500', btnClass: 'bg-amber-500 hover:bg-amber-600 text-white' },
    green: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', icon: 'CheckCircle', iconColor: 'text-emerald-500', btnClass: 'bg-emerald-500 hover:bg-emerald-600 text-white' },
  };

  const redCount = allAlerts?.filter(a => a?.type === 'red')?.length;
  const yellowCount = allAlerts?.filter(a => a?.type === 'yellow')?.length;
  const greenCount = allAlerts?.filter(a => a?.type === 'green')?.length;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon name="Bell" size={18} className="text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Alertas del portafolio</span>
          <div className="flex items-center gap-1.5">
            {redCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{redCount}</span>}
            {yellowCount > 0 && <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{yellowCount}</span>}
            {greenCount > 0 && <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{greenCount}</span>}
          </div>
        </div>
        <Icon name={isCollapsed ? 'ChevronDown' : 'ChevronUp'} size={16} className="text-muted-foreground" />
      </button>
      {!isCollapsed && (
        <div className="px-5 pb-4 space-y-2">
          {allAlerts?.map((alert, i) => {
            const cfg = alertConfig?.[alert?.type];
            return (
              <div key={i} className={`flex items-center justify-between gap-3 p-3 rounded-lg border ${cfg?.bg} ${cfg?.border}`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: alert?.businessColor }}
                  >
                    {alert?.businessInitial}
                  </div>
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <Icon name={cfg?.icon} size={16} className={`${cfg?.iconColor} flex-shrink-0 mt-0.5`} />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-foreground">{alert?.businessName}: </span>
                      <span className="text-xs text-foreground/80">{alert?.message}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(alert?.actionPath)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex-shrink-0 transition-colors ${cfg?.btnClass}`}
                >
                  {alert?.action}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertsBanner;
