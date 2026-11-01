import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,  } from 'recharts';
import Icon from '../../../components/AppIcon';

const ZONES = [
  { value: 'centro', label: 'Zona Centro' },
  { value: 'norte', label: 'Zona Norte' },
  { value: 'sur', label: 'Zona Sur' },
  { value: 'terraza', label: 'Terraza / Entrada' },
];

const DWELL_DATA = {
  centro: [
    { bucket: '0–2 min', converted: 4, noConversion: 38, total: 42 },
    { bucket: '2–5 min', converted: 11, noConversion: 29, total: 40 },
    { bucket: '5–10 min', converted: 34, noConversion: 21, total: 55 },
    { bucket: '10–20 min', converted: 28, noConversion: 10, total: 38 },
    { bucket: '20–30 min', converted: 18, noConversion: 5, total: 23 },
    { bucket: '+30 min', converted: 14, noConversion: 3, total: 17 },
  ],
  norte: [
    { bucket: '0–2 min', converted: 6, noConversion: 44, total: 50 },
    { bucket: '2–5 min', converted: 9, noConversion: 31, total: 40 },
    { bucket: '5–10 min', converted: 27, noConversion: 18, total: 45 },
    { bucket: '10–20 min', converted: 22, noConversion: 8, total: 30 },
    { bucket: '20–30 min', converted: 15, noConversion: 4, total: 19 },
    { bucket: '+30 min', converted: 11, noConversion: 2, total: 13 },
  ],
  sur: [
    { bucket: '0–2 min', converted: 3, noConversion: 27, total: 30 },
    { bucket: '2–5 min', converted: 8, noConversion: 22, total: 30 },
    { bucket: '5–10 min', converted: 21, noConversion: 14, total: 35 },
    { bucket: '10–20 min', converted: 19, noConversion: 7, total: 26 },
    { bucket: '20–30 min', converted: 12, noConversion: 3, total: 15 },
    { bucket: '+30 min', converted: 9, noConversion: 2, total: 11 },
  ],
  terraza: [
    { bucket: '0–2 min', converted: 8, noConversion: 52, total: 60 },
    { bucket: '2–5 min', converted: 14, noConversion: 36, total: 50 },
    { bucket: '5–10 min', converted: 38, noConversion: 24, total: 62 },
    { bucket: '10–20 min', converted: 31, noConversion: 11, total: 42 },
    { bucket: '20–30 min', converted: 20, noConversion: 6, total: 26 },
    { bucket: '+30 min', converted: 16, noConversion: 4, total: 20 },
  ],
};

const INSIGHTS = {
  centro: 'El mayor tiempo de permanencia se concentra en 5–10 min con 62% de conversión. Los usuarios que permanecen más de 10 min convierten 2.8x más que los que salen antes de 2 min.',
  norte: 'La zona Norte muestra mayor rebote temprano (0–2 min). Los usuarios que superan los 10 min convierten a una tasa de 73%, 3.1x más que los que salen en los primeros 2 min.',
  sur: 'Zona Sur tiene el mejor ratio de conversión en el bucket 5–10 min (60%). Considera incentivos para retener usuarios más allá de los 5 minutos.',
  terraza: 'La Terraza / Entrada tiene el mayor volumen de detecciones. Los usuarios que permanecen +10 min convierten 2.6x más. Optimiza la señalización en los primeros 2 min para reducir el rebote.',
};

const CustomTooltip = ({ active, payload, label, totalAll }) => {
  if (!active || !payload?.length) return null;
  const converted = payload?.find(p => p?.dataKey === 'converted')?.value || 0;
  const noConversion = payload?.find(p => p?.dataKey === 'noConversion')?.value || 0;
  const total = converted + noConversion;
  const pctOfTotal = totalAll > 0 ? ((total / totalAll) * 100)?.toFixed(1) : 0;
  const convRate = total > 0 ? ((converted / total) * 100)?.toFixed(1) : 0;

  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-xl text-xs min-w-[160px]">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Total usuarios</span>
          <span className="font-bold text-foreground" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{total}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">% del total</span>
          <span className="font-bold text-foreground" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{pctOfTotal}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-blue-500">Convertidos</span>
          <span className="font-bold text-blue-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{converted}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Sin conversión</span>
          <span className="font-bold text-foreground" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{noConversion}</span>
        </div>
        <div className="pt-1 border-t border-border flex justify-between gap-4">
          <span className="text-muted-foreground">Tasa conversión</span>
          <span
            className={`font-bold ${parseFloat(convRate) >= 50 ? 'text-green-500' : parseFloat(convRate) >= 30 ? 'text-yellow-500' : 'text-red-500'}`}
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {convRate}%
          </span>
        </div>
      </div>
    </div>
  );
};

const DwellTimeDistributionChart = () => {
  const [selectedZone, setSelectedZone] = useState('centro');
  const data = DWELL_DATA?.[selectedZone] || DWELL_DATA?.centro;
  const totalAll = data?.reduce((sum, d) => sum + d?.converted + d?.noConversion, 0);
  const insight = INSIGHTS?.[selectedZone] || INSIGHTS?.centro;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">Distribución de tiempo de permanencia</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Tiempo que los usuarios permanecen dentro del geofence por zona</p>
        </div>
        {/* Zone selector */}
        <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2 min-w-[180px]">
          <Icon name="Layers" size={14} className="text-primary shrink-0" />
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e?.target?.value)}
            className="flex-1 bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer"
          >
            {ZONES?.map(z => (
              <option key={z?.value} value={z?.value}>{z?.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
            barCategoryGap="28%"
            barGap={2}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="bucket"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip content={<CustomTooltip totalAll={totalAll} />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              formatter={(value) => value === 'converted' ? 'Convertidos' : 'Sin conversión'}
            />
            <Bar dataKey="converted" name="converted" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
            <Bar dataKey="noConversion" name="noConversion" stackId="a" fill="#6b7280" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insight */}
      <div className="mt-4 flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-3.5">
        <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
          <Icon name="Lightbulb" size={14} className="text-primary" />
        </div>
        <p className="text-xs text-foreground leading-relaxed">
          <span className="font-semibold text-primary">Insight: </span>
          {insight}
        </p>
      </div>
    </div>
  );
};

export default DwellTimeDistributionChart;
