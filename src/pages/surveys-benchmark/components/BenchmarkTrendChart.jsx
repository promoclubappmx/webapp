import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import Icon from '../../../components/AppIcon';

const data3m = [
  { month: 'Ene', my: 38, avg: 32 },
  { month: 'Feb', my: 42, avg: 33 },
  { month: 'Mar', my: 40, avg: 34 },
  { month: 'Abr', my: 45, avg: 35 },
  { month: 'May', my: 42, avg: 34 },
  { month: 'Jun', my: 47, avg: 36 },
];

const data6m = [
  { month: 'Oct', my: 30, avg: 29 },
  { month: 'Nov', my: 35, avg: 30 },
  { month: 'Dic', my: 38, avg: 31 },
  { month: 'Ene', my: 38, avg: 32 },
  { month: 'Feb', my: 42, avg: 33 },
  { month: 'Mar', my: 40, avg: 34 },
  { month: 'Abr', my: 45, avg: 35 },
  { month: 'May', my: 42, avg: 34 },
  { month: 'Jun', my: 47, avg: 36 },
];

const data12m = [
  { month: 'Jul', my: 22, avg: 26 },
  { month: 'Ago', my: 25, avg: 27 },
  { month: 'Sep', my: 28, avg: 28 },
  { month: 'Oct', my: 30, avg: 29 },
  { month: 'Nov', my: 35, avg: 30 },
  { month: 'Dic', my: 38, avg: 31 },
  { month: 'Ene', my: 38, avg: 32 },
  { month: 'Feb', my: 42, avg: 33 },
  { month: 'Mar', my: 40, avg: 34 },
  { month: 'Abr', my: 45, avg: 35 },
  { month: 'May', my: 42, avg: 34 },
  { month: 'Jun', my: 47, avg: 36 },
];

const BenchmarkTrendChart = () => {
  const [period, setPeriod] = useState('6m');

  const dataMap = { '3m': data3m, '6m': data6m, '12m': data12m };
  const chartData = dataMap?.[period];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-sm">
          <p className="font-semibold text-foreground mb-1">{label}</p>
          {payload?.map((entry, i) => (
            <p key={i} style={{ color: entry?.color }} className="font-medium">
              {entry?.name}: {entry?.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Icon name="TrendingUp" size={18} className="text-primary" />
          Tendencia comparativa
        </h2>
        <div className="flex rounded-lg border border-border overflow-hidden">
          {[{ value: '3m', label: '3 meses' }, { value: '6m', label: '6 meses' }, { value: '12m', label: '1 año' }]?.map(opt => (
            <button
              key={opt?.value}
              onClick={() => setPeriod(opt?.value)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                period === opt?.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-muted/50'
              }`}
            >
              {opt?.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
          <YAxis domain={[0, 80]} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => value === 'my' ? 'Tu NPS' : 'Promedio categoría'}
            wrapperStyle={{ fontSize: 12 }}
          />
          <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="my"
            name="my"
            stroke="#1A3FE0"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#1A3FE0' }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="avg"
            name="avg"
            stroke="#9CA3AF"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={{ r: 3, fill: '#9CA3AF' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BenchmarkTrendChart;
