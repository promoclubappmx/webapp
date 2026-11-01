import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Icon from '../../../components/AppIcon';

const sparklineData = [32, 28, 35, 41, 38, 44, 47];
const sparklineCanjes = [14, 18, 20, 17, 22, 19, 23];
const sparklinePuntos = [820, 950, 1100, 980, 1050, 1180, 1240];
const sparklineClientes = [5, 7, 4, 9, 6, 8, 8];

const MiniSparkline = ({ data, color = '#1A3FE0' }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 32;
  const points = data?.map((v, i) => {
    const x = (i / (data?.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  })?.join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const KPICard = ({ icon, value, label, delta, deltaPositive, subMetric, sparkline, sparklineColor }) => (
  <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
        <Icon name={icon} size={20} className="text-primary" />
      </div>
      <MiniSparkline data={sparkline} color={sparklineColor || '#1A3FE0'} />
    </div>
    <div>
      <div className="text-3xl font-bold text-foreground" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        {value}
      </div>
      <div className="text-sm text-muted-foreground mt-0.5" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        {label}
      </div>
    </div>
    <div className="flex items-center justify-between">
      <span className={`text-sm font-semibold flex items-center gap-1 ${deltaPositive ? 'text-green-600' : 'text-red-500'}`}>
        <Icon name={deltaPositive ? 'TrendingUp' : 'TrendingDown'} size={14} />
        {delta}
      </span>
      <span className="text-xs text-muted-foreground">{subMetric}</span>
    </div>
  </div>
);

const temporalData = [
  { date: '01 Mar', actual: 32, anterior: 28, puntos: 820, promo: false },
  { date: '03 Mar', actual: 28, anterior: 31, puntos: 750, promo: false },
  { date: '05 Mar', actual: 35, anterior: 29, puntos: 950, promo: true },
  { date: '07 Mar', actual: 41, anterior: 33, puntos: 1100, promo: false },
  { date: '09 Mar', actual: 38, anterior: 35, puntos: 980, promo: false },
  { date: '11 Mar', actual: 44, anterior: 37, puntos: 1180, promo: true },
  { date: '13 Mar', actual: 47, anterior: 40, puntos: 1240, promo: false },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload?.map((p, i) => (
          <p key={i} style={{ color: p?.color }}>{p?.name}: {p?.value}</p>
        ))}
        {payload?.[0] && payload?.[1] && (
          <p className={`font-semibold mt-1 ${payload?.[0]?.value > payload?.[1]?.value ? 'text-green-600' : 'text-red-500'}`}>
            Diferencia: {payload?.[0]?.value - payload?.[1]?.value > 0 ? '+' : ''}{payload?.[0]?.value - payload?.[1]?.value}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const heatmapData = [
  { day: 'Lun', weeks: [12, 15, 18, 14] },
  { day: 'Mar', weeks: [10, 12, 11, 13] },
  { day: 'Mié', weeks: [22, 25, 28, 24] },
  { day: 'Jue', weeks: [18, 20, 22, 19] },
  { day: 'Vie', weeks: [35, 38, 40, 36] },
  { day: 'Sáb', weeks: [45, 48, 47, 46] },
  { day: 'Dom', weeks: [30, 32, 35, 31] },
];

const getHeatColor = (value) => {
  if (value < 15) return '#DBEAFE';
  if (value < 25) return '#93C5FD';
  if (value < 35) return '#3B82F6';
  if (value < 45) return '#1D4ED8';
  return '#1A3FE0';
};

const promoData = [
  { promo: '2x1 Martes', canjes: 34, visitas: 28, costo: 680, roi: 312 },
  { promo: 'Descuento 20%', canjes: 12, visitas: 10, costo: 240, roi: 187 },
  { promo: 'Flash deal café', canjes: 8, visitas: 8, costo: 120, roi: 445 },
];

const TabResumen = () => {
  const [metricTab, setMetricTab] = useState('Visitas');
  const [ticketPromedio, setTicketPromedio] = useState(200);
  const [sortBy, setSortBy] = useState('roi');
  const [showCalculadora, setShowCalculadora] = useState(false);
  const [calcInputs, setCalcInputs] = useState({ tipo: 'descuento', descuento: 20, precio: 150, visitas: 50, ticket: 200 });
  const [hoveredCell, setHoveredCell] = useState(null);

  const metricTabs = ['Visitas', 'Canjes', 'Nuevos clientes', 'Puntos', 'Reseñas'];

  const calcROI = (row) => {
    const ingresos = row?.visitas * ticketPromedio;
    return Math.round(((ingresos - row?.costo) / row?.costo) * 100);
  };

  const sortedPromos = [...promoData]?.sort((a, b) => {
    if (sortBy === 'roi') return calcROI(b) - calcROI(a);
    if (sortBy === 'canjes') return b?.canjes - a?.canjes;
    if (sortBy === 'costo') return b?.costo - a?.costo;
    return 0;
  });

  const calcROIFuturo = () => {
    const costo = (calcInputs?.descuento / 100) * calcInputs?.precio * calcInputs?.visitas;
    const ingresos = calcInputs?.visitas * calcInputs?.ticket;
    const roi = costo > 0 ? Math.round(((ingresos - costo) / costo) * 100) : 0;
    const equilibrio = costo > 0 ? Math.ceil(costo / calcInputs?.ticket) : 0;
    return { roi, equilibrio, costo: Math.round(costo) };
  };

  const futuro = calcROIFuturo();

  return (
    <div className="space-y-6">
      {/* KPIs tiempo real */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard icon="MapPin" value="47" label="Visitas verificadas hoy" delta="+12% vs semana anterior" deltaPositive sparkline={sparklineData} sparklineColor="#1A3FE0" subMetric="34 únicos · 13 recurrentes" />
          <KPICard icon="Ticket" value="23" label="Canjes hoy" delta="+8% vs ayer" deltaPositive sparkline={sparklineCanjes} sparklineColor="#1A3FE0" subMetric="15 cupones · 8 promos" />
          <KPICard icon="Star" value="1,240" label="Puntos acreditados hoy" delta="+5% vs ayer" deltaPositive sparkline={sparklinePuntos} sparklineColor="#10B981" subMetric="≈$186 MXN en compromisos" />
          <KPICard icon="UserPlus" value="8" label="Nuevos clientes hoy" delta="+3% vs ayer" deltaPositive sparkline={sparklineClientes} sparklineColor="#1A3FE0" subMetric="3 por referido · 5 orgánicos" />
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground font-medium">En vivo</span>
        </div>
      </div>
      {/* Comparativa temporal */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">Comparativa temporal</h3>
        <div className="flex gap-2 mb-4 flex-wrap">
          {metricTabs?.map(t => (
            <button
              key={t}
              onClick={() => setMetricTab(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                metricTab === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={temporalData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            {temporalData?.filter(d => d?.promo)?.map((d, i) => (
              <ReferenceLine key={i} yAxisId="left" x={d?.date} stroke="#F59E0B" strokeDasharray="4 2" label={{ value: '🎯', position: 'top', fontSize: 12 }} />
            ))}
            <Line yAxisId="left" type="monotone" dataKey="actual" stroke="#1A3FE0" strokeWidth={2.5} dot={{ r: 4 }} name="Período actual" />
            <Line yAxisId="left" type="monotone" dataKey="anterior" stroke="#9CA3AF" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} name="Período anterior" />
            <Line yAxisId="right" type="monotone" dataKey="puntos" stroke="#10B981" strokeWidth={1.5} dot={false} name="Puntos emitidos" />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 p-3 rounded-lg flex items-start gap-2" style={{ background: '#EEF2FF' }}>
          <Icon name="Lightbulb" size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-primary">Tus visitas los martes son 34% menores al resto de la semana. Considera activar una promo de martes.</p>
        </div>
      </div>
      {/* Heatmap semanal */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">Resumen semanal por día</h3>
        <div className="overflow-x-auto">
          <div className="min-w-max">
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="text-xs text-muted-foreground text-center" />
              {['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']?.map(s => (
                <div key={s} className="text-xs text-muted-foreground text-center">{s}</div>
              ))}
            </div>
            {heatmapData?.map((row) => (
              <div key={row?.day} className="grid grid-cols-8 gap-1 mb-1">
                <div className="text-xs text-muted-foreground flex items-center justify-end pr-2 font-medium">{row?.day}</div>
                {row?.weeks?.map((val, wi) => (
                  <div
                    key={wi}
                    className="w-10 h-10 rounded-md cursor-pointer transition-transform hover:scale-110 relative"
                    style={{ background: getHeatColor(val) }}
                    onMouseEnter={() => setHoveredCell(`${row?.day}-${wi}`)}
                    onMouseLeave={() => setHoveredCell(null)}
                    title={`${row?.day} Sem ${wi + 1}: ${val} visitas`}
                  >
                    {hoveredCell === `${row?.day}-${wi}` && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                        {val} visitas
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-muted-foreground">Menos activo</span>
          {['#DBEAFE', '#93C5FD', '#3B82F6', '#1D4ED8', '#1A3FE0']?.map((c, i) => (
            <div key={i} className="w-4 h-4 rounded-sm" style={{ background: c }} />
          ))}
          <span className="text-xs text-muted-foreground">Más activo</span>
        </div>
        <div className="mt-3 p-3 rounded-lg flex items-start gap-2" style={{ background: '#EEF2FF' }}>
          <Icon name="Lightbulb" size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-primary">Tu día más activo es el sábado (promedio 47 visitas). Tu día más flojo es el martes (12 visitas).</p>
        </div>
      </div>
      {/* Calculadora ROI */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-base font-semibold text-foreground">ROI de tus promociones activas</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ticket promedio:</span>
            <div className="flex items-center gap-1 border border-border rounded-lg px-2 py-1">
              <span className="text-sm text-muted-foreground">$</span>
              <input
                type="number"
                value={ticketPromedio}
                onChange={e => setTicketPromedio(Number(e?.target?.value))}
                className="w-16 text-sm font-semibold text-foreground bg-transparent focus:outline-none"
              />
              <span className="text-sm text-muted-foreground">MXN</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground font-medium">Promo</th>
                <th className="text-center py-2 text-muted-foreground font-medium cursor-pointer hover:text-foreground" onClick={() => setSortBy('canjes')}>
                  Canjes {sortBy === 'canjes' && '↓'}
                </th>
                <th className="text-center py-2 text-muted-foreground font-medium">Visitas atribuidas</th>
                <th className="text-center py-2 text-muted-foreground font-medium cursor-pointer hover:text-foreground" onClick={() => setSortBy('costo')}>
                  Costo est. {sortBy === 'costo' && '↓'}
                </th>
                <th className="text-center py-2 text-muted-foreground font-medium cursor-pointer hover:text-foreground" onClick={() => setSortBy('roi')}>
                  ROI {sortBy === 'roi' && '↓'}
                </th>
                <th className="text-center py-2 text-muted-foreground font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {sortedPromos?.map((row, i) => {
                const roi = calcROI(row);
                return (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-medium text-foreground">{row?.promo}</td>
                    <td className="py-3 text-center">{row?.canjes}</td>
                    <td className="py-3 text-center">{row?.visitas}</td>
                    <td className="py-3 text-center">${row?.costo} MXN</td>
                    <td className="py-3 text-center">
                      <span className={`font-bold ${roi > 200 ? 'text-green-600' : roi > 100 ? 'text-blue-600' : 'text-red-500'}`}>
                        {roi}% ↑
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <button className="text-xs text-primary hover:underline">Ver detalle</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Calculadora manual */}
        <div className="mt-4 border-t border-border pt-4">
          <button
            onClick={() => setShowCalculadora(!showCalculadora)}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Icon name={showCalculadora ? 'ChevronUp' : 'ChevronDown'} size={16} />
            + Calcular ROI de promo futura
          </button>
          {showCalculadora && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Tipo de promo</label>
                <select
                  value={calcInputs?.tipo}
                  onChange={e => setCalcInputs(p => ({ ...p, tipo: e?.target?.value }))}
                  className="w-full text-sm border border-border rounded-lg px-2 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="descuento">Descuento %</option>
                  <option value="2x1">2x1</option>
                  <option value="regalo">Regalo</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Descuento %</label>
                <input type="number" value={calcInputs?.descuento} onChange={e => setCalcInputs(p => ({ ...p, descuento: Number(e?.target?.value) }))}
                  className="w-full text-sm border border-border rounded-lg px-2 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Precio del ítem ($)</label>
                <input type="number" value={calcInputs?.precio} onChange={e => setCalcInputs(p => ({ ...p, precio: Number(e?.target?.value) }))}
                  className="w-full text-sm border border-border rounded-lg px-2 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Visitas esperadas</label>
                <input type="number" value={calcInputs?.visitas} onChange={e => setCalcInputs(p => ({ ...p, visitas: Number(e?.target?.value) }))}
                  className="w-full text-sm border border-border rounded-lg px-2 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Ticket promedio ($)</label>
                <input type="number" value={calcInputs?.ticket} onChange={e => setCalcInputs(p => ({ ...p, ticket: Number(e?.target?.value) }))}
                  className="w-full text-sm border border-border rounded-lg px-2 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="sm:col-span-2 lg:col-span-5 mt-2 p-4 rounded-xl" style={{ background: '#EEF2FF' }}>
                <div className="flex items-center gap-6 flex-wrap">
                  <div>
                    <p className="text-xs text-muted-foreground">ROI proyectado</p>
                    <p className="text-2xl font-bold text-primary" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{futuro?.roi}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Punto de equilibrio</p>
                    <p className="text-2xl font-bold text-foreground" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{futuro?.equilibrio} canjes</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Costo estimado</p>
                    <p className="text-2xl font-bold text-foreground" style={{ fontFamily: 'JetBrains Mono, monospace' }}>${futuro?.costo} MXN</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabResumen;
