import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CHART_DATA = [
  { day: '9 Feb', sent: 12, received: 4 },
  { day: '14 Feb', sent: 18, received: 7 },
  { day: '19 Feb', sent: 15, received: 6 },
  { day: '24 Feb', sent: 22, received: 10 },
  { day: '1 Mar', sent: 20, received: 9 },
  { day: '5 Mar', sent: 25, received: 13 },
  { day: '10 Mar', sent: 28, received: 15 },
];

const RequestsStats = () => {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-base font-semibold text-foreground mb-5">Estadísticas de solicitudes</h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-muted/30 rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Enviadas este mes</p>
          <p className="text-2xl font-bold text-foreground font-mono">140</p>
        </div>
        <div className="bg-muted/30 rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Tasa de conversión</p>
          <p className="text-2xl font-bold text-green-600 font-mono">42%</p>
        </div>
        <div className="bg-muted/30 rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Con incentivo</p>
          <p className="text-2xl font-bold text-primary font-mono">61%</p>
        </div>
        <div className="bg-muted/30 rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Sin incentivo</p>
          <p className="text-2xl font-bold text-muted-foreground font-mono">28%</p>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground mb-3">Solicitudes enviadas vs reseñas recibidas (últimos 30 días)</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={CHART_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line type="monotone" dataKey="sent" stroke="#6366f1" strokeWidth={2} dot={false} name="Enviadas" />
            <Line type="monotone" dataKey="received" stroke="#22c55e" strokeWidth={2} dot={false} name="Reseñas recibidas" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RequestsStats;
