import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const mockAbuseAttempts = [
  { id: 1, user: 'Diego Ramírez', type: 'limite', attempts: 8, limit: 1, time: 'Hace 2 horas', severity: 'high' },
  { id: 2, user: 'Andrés Gutiérrez', type: 'sospechoso', attempts: 3, limit: 1, time: 'Hace 4 horas', severity: 'medium' },
  { id: 3, user: 'Ricardo Delgado', type: 'limite', attempts: 2, limit: 1, time: 'Ayer 18:30', severity: 'low' },
  { id: 4, user: 'Javier Medina', type: 'ubicacion', attempts: 1, limit: 1, time: 'Ayer 15:12', severity: 'high' },
  { id: 5, user: 'Luis Peña', type: 'limite', attempts: 4, limit: 1, time: 'Hace 2 días', severity: 'medium' },
];

const mockEffectiveness = [
  { label: 'Check-ins bloqueados (7 días)', value: 23, change: -15 },
  { label: 'Usuarios con intentos repetidos', value: 5, change: -2 },
  { label: 'Tasa de abuso', value: '0.6%', change: -0.3 },
];

const severityConfig = {
  high: { color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
  medium: { color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  low: { color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' },
};

const typeLabels = {
  limite: 'Límite excedido',
  sospechoso: 'Patrón sospechoso',
  ubicacion: 'Ubicación inconsistente',
};

const AbuseHistoryPanel = () => {
  const [activeView, setActiveView] = useState('attempts');

  return (
    <div className="space-y-4">
      {/* Effectiveness Metrics */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-semibold text-foreground text-sm mb-3">Efectividad de las reglas</h3>
        <div className="space-y-3">
          {mockEffectiveness?.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{item?.label}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-foreground">{item?.value}</span>
                <span className={`text-xs font-medium ${
                  item?.change < 0 ? 'text-green-600' : 'text-red-500'
                }`}>
                  {item?.change < 0 ? '↓' : '↑'}{Math.abs(item?.change)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Attempts Log */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground text-sm">Intentos recientes</h3>
          <button className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
            <Icon name="Download" size={12} />
            Exportar
          </button>
        </div>
        <div className="divide-y divide-border">
          {mockAbuseAttempts?.map(attempt => {
            const sc = severityConfig?.[attempt?.severity];
            return (
              <div key={attempt?.id} className="p-4">
                <div className="flex items-start gap-2.5">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${sc?.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{attempt?.user}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded border flex-shrink-0 ${sc?.color}`}>
                        {typeLabels?.[attempt?.type]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {attempt?.attempts} intentos (límite: {attempt?.limit}) · {attempt?.time}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {mockAbuseAttempts?.length === 0 && (
          <div className="text-center py-8">
            <Icon name="ShieldCheck" size={32} className="text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Sin intentos sospechosos recientes</p>
          </div>
        )}
      </div>
      {/* Export Report */}
      <button className="w-full py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center justify-center gap-2">
        <Icon name="FileDown" size={15} />
        Exportar reporte de cumplimiento
      </button>
    </div>
  );
};

export default AbuseHistoryPanel;
