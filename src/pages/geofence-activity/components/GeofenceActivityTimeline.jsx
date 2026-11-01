import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const dailyData = [
  { name: 'Lun', detections: 145, notifications: 112, conversions: 38 },
  { name: 'Mar', detections: 178, notifications: 134, conversions: 52 },
  { name: 'Mié', detections: 132, notifications: 98, conversions: 31 },
  { name: 'Jue', detections: 201, notifications: 156, conversions: 67 },
  { name: 'Vie', detections: 234, notifications: 187, conversions: 78 },
  { name: 'Sáb', detections: 312, notifications: 245, conversions: 98 },
  { name: 'Dom', detections: 189, notifications: 143, conversions: 55 },
];

const hourlyData = Array.from({ length: 14 }, (_, i) => ({
  name: `${i + 8}:00`,
  detections: Math.floor(Math.random() * 30) + 5,
  notifications: Math.floor(Math.random() * 22) + 3,
  conversions: Math.floor(Math.random() * 10) + 1,
}));

const weeklyData = [
  { name: 'Sem 1', detections: 890, notifications: 712, conversions: 245 },
  { name: 'Sem 2', detections: 1120, notifications: 934, conversions: 312 },
  { name: 'Sem 3', detections: 987, notifications: 801, conversions: 278 },
  { name: 'Sem 4', detections: 1340, notifications: 1087, conversions: 389 },
];

const GeofenceActivityTimeline = () => {
  const [granularity, setGranularity] = useState('day');

  const chartData = granularity === 'hour' ? hourlyData : granularity === 'week' ? weeklyData : dailyData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-xs">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload?.map((entry) => (
            <div key={entry?.name} className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ background: entry?.color }} />
              <span className="text-muted-foreground">{entry?.name}:</span>
              <span className="font-mono font-semibold text-foreground">{entry?.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-base font-semibold text-foreground">Timeline de actividad</h2>
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {[
            { value: 'hour', label: 'Por hora' },
            { value: 'day', label: 'Por día' },
            { value: 'week', label: 'Por semana' },
          ]?.map(opt => (
            <button
              key={opt?.value}
              onClick={() => setGranularity(opt?.value)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                granularity === opt?.value
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt?.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            formatter={(value) => <span style={{ color: 'var(--muted-foreground)' }}>{value}</span>}
          />
          <Bar dataKey="detections" name="Detecciones" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={20} />
          <Bar dataKey="notifications" name="Notificaciones" fill="#f97316" radius={[3, 3, 0, 0]} maxBarSize={20} />
          <Bar dataKey="conversions" name="Conversiones" fill="#22c55e" radius={[3, 3, 0, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GeofenceActivityTimeline;
