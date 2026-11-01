import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Icon from '../../../components/AppIcon';

const MOCK_DATA = [
  { dia: 'Día 1', real: 8, proyeccion: 8 },
  { dia: 'Día 2', real: 15, proyeccion: 15 },
  { dia: 'Día 3', real: 28, proyeccion: 28 },
  { dia: 'Día 4', real: 35, proyeccion: 35 },
  { dia: 'Día 5', real: 42, proyeccion: 42 },
  { dia: 'Día 6', real: 50, proyeccion: 50 },
  { dia: 'Día 7', real: null, proyeccion: 58 },
  { dia: 'Día 8', real: null, proyeccion: 66 },
  { dia: 'Día 9', real: null, proyeccion: 74 },
  { dia: 'Día 10', real: null, proyeccion: 82 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
        {payload?.map((entry, i) => (
          <p key={i} className="text-xs" style={{ color: entry?.color }}>
            {entry?.name === 'real' ? 'Conversiones reales' : 'Proyección'}: {entry?.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const DailyAccumulationChart = ({ data }) => {
  const chartData = data?.length > 0 ? data : MOCK_DATA;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Icon name="TrendingUp" size={18} className="text-primary" />
          Acumulación diaria de conversiones
        </h3>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-primary rounded" />
            <span className="text-muted-foreground">Real</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-primary/40 rounded border-dashed border" />
            <span className="text-muted-foreground">Proyección</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="dia" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x="Día 6" stroke="var(--muted-foreground)" strokeDasharray="4 4" label={{ value: 'Hoy', fontSize: 10, fill: 'var(--muted-foreground)' }} />
          <Line type="monotone" dataKey="real" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: 'var(--primary)', r: 4 }} connectNulls={false} name="real" />
          <Line type="monotone" dataKey="proyeccion" stroke="var(--primary)" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="proyeccion" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyAccumulationChart;
