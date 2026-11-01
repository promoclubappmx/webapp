import React, { useState, useEffect } from 'react';
import { fetchResumenKPIs, fetchComparativaData, fetchHeatmapData } from '../../../services/analyticsService';

// ─── Fallback mock data ───────────────────────────────────────────────────────
const MOCK_VISITAS = [31,29,35,33,38,42,40,45,43,47,50,48,52,51,55,53,58,56,60,58,62,60];
const MOCK_CANJES = MOCK_VISITAS?.map(v => Math.round(v * 0.49));
const MOCK_PUNTOS = MOCK_VISITAS?.map(v => v * 25);

const MOCK_HEATMAP = [
  [  8,  12,  18,  22,  30,  45,  28],
  [ 10,  14,  20,  24,  32,  48,  30],
  [ 15,  20,  38,  42,  50,  60,  35],
  [ 18,  22,  40,  44,  52,  62,  38],
  [ 12,  16,  28,  32,  40,  55,  30],
  [ 10,  14,  22,  26,  35,  50,  25],
  [  8,  10,  16,  20,  28,  42,  20],
];
const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const hours = ['8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm'];

// ─── Sparkline ───────────────────────────────────────────────────────────────
const Sparkline = ({ data, color, width = 100, height = 40 }) => {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data?.map((v, i) => {
    const x = (i / (data?.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  const polyline = pts?.join(' ');
  const areaPath = `M${pts?.[0]} ${pts?.slice(1)?.map(p => `L${p}`)?.join(' ')} L${width},${height} L0,${height} Z`;
  const gradId = `sg-${color?.replace('#', '')}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KPICard = ({ emoji, value, label, badge, badgeGreen, sub, sparkData, color, iconBg }) => (
  <div
    className="bg-white rounded-2xl p-5 border border-[#E4E6F0] transition-all hover:shadow-md"
    style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg" style={{ background: iconBg }}>
        {emoji}
      </div>
      <Sparkline data={sparkData} color={color} />
    </div>
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 900, fontSize: 28, color, letterSpacing: '-0.02em' }}>
      {value}
    </div>
    <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, color: '#5A6175' }} className="mt-0.5 mb-2">
      {label}
    </div>
    <div className="border-t border-[#E4E6F0] pt-2 flex items-center justify-between">
      <span
        className="text-xs font-semibold px-2 py-0.5 rounded-full"
        style={{
          background: badgeGreen ? '#DCFCE7' : '#FEE2E2',
          color: badgeGreen ? '#16A34A' : '#DC2626',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}
      >
        {badge}
      </span>
      <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 11, color: '#9BA3B8' }}>{sub}</span>
    </div>
  </div>
);

// ─── Area Chart ───────────────────────────────────────────────────────────────
const AreaChart = ({ metricKey, comparativaData }) => {
  const W = 700, H = 200;
  const padL = 40, padR = 20, padT = 10, padB = 30;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const visitasData = comparativaData?.visitasArr || MOCK_VISITAS;
  const canjesData = comparativaData?.canjesArr || MOCK_CANJES;
  const puntosData = comparativaData?.puntosArr || MOCK_PUNTOS;

  const datasets = {
    Visitas: { current: visitasData, prev: visitasData?.map(v => Math.round(v * 0.88)), proj: visitasData?.map(v => Math.round(v * 0.75)) },
    Canjes: { current: canjesData, prev: canjesData?.map(v => Math.round(v * 0.92)), proj: canjesData?.map(v => Math.round(v * 0.8)) },
    Clientes: { current: comparativaData?.clientesArr || visitasData?.map(v => Math.round(v * 0.17)), prev: visitasData?.map(v => Math.round(v * 0.15)), proj: visitasData?.map(v => Math.round(v * 0.12)) },
    Puntos: { current: puntosData, prev: puntosData?.map(v => Math.round(v * 0.9)), proj: puntosData?.map(v => Math.round(v * 0.75)) },
    Reseñas: { current: comparativaData?.resenasArr || visitasData?.map(v => Math.round(v * 0.08)), prev: visitasData?.map(v => Math.round(v * 0.07)), proj: visitasData?.map(v => Math.round(v * 0.06)) },
  };

  const ds = datasets?.[metricKey] || datasets?.Visitas;
  const allVals = [...ds?.current, ...ds?.prev, ...ds?.proj];
  const maxV = Math.max(...allVals, 1);
  const minV = 0;
  const range = maxV - minV || 1;

  const toX = (i) => padL + (i / (ds?.current?.length - 1)) * chartW;
  const toY = (v) => padT + chartH - ((v - minV) / range) * chartH;

  const makePath = (arr) => arr?.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(v)}`)?.join(' ');
  const makeArea = (arr) => `${makePath(arr)} L${toX(arr?.length - 1)},${padT + chartH} L${padL},${padT + chartH} Z`;

  const yTicks = [0, Math.round(maxV * 0.25), Math.round(maxV * 0.5), Math.round(maxV * 0.75), maxV];
  const xLabels = Array.from({ length: ds?.current?.length }, (_, i) => i + 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 200 }}>
      <defs>
        <linearGradient id="ga1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A3FE0" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#1A3FE0" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ga2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00A86B" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#00A86B" stopOpacity="0" />
        </linearGradient>
      </defs>
      {yTicks?.map((v, i) => (
        <g key={i}>
          <line x1={padL} y1={toY(v)} x2={W - padR} y2={toY(v)} stroke="#E4E6F0" strokeDasharray="4 3" strokeWidth="1" />
          <text x={padL - 5} y={toY(v) + 4} textAnchor="end" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fill: '#9BA3B8' }}>{v}</text>
        </g>
      ))}
      {xLabels?.filter((_, i) => i % 3 === 0)?.map((d, i) => {
        const idx = i * 3;
        return (
          <text key={i} x={toX(idx)} y={H - 5} textAnchor="middle" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fill: '#9BA3B8' }}>{d}</text>
        );
      })}
      <path d={makeArea(ds?.current)} fill="url(#ga1)" />
      <path d={makeArea(ds?.prev)} fill="url(#ga2)" />
      <path d={makePath(ds?.proj)} fill="none" stroke="#9BA3B8" strokeWidth="1.5" strokeDasharray="5 3" />
      <path d={makePath(ds?.prev)} fill="none" stroke="#00A86B" strokeWidth="2" />
      <path d={makePath(ds?.current)} fill="none" stroke="#1A3FE0" strokeWidth="2.5" />
      {[
        { arr: ds?.current, color: '#1A3FE0' },
        { arr: ds?.prev, color: '#00A86B' },
        { arr: ds?.proj, color: '#9BA3B8' },
      ]?.map(({ arr, color }, i) => (
        <g key={i}>
          <circle cx={toX(arr?.length - 1)} cy={toY(arr?.[arr?.length - 1])} r="5" fill={color} />
          <circle cx={toX(arr?.length - 1)} cy={toY(arr?.[arr?.length - 1])} r="3" fill="white" />
        </g>
      ))}
    </svg>
  );
};

// ─── Heatmap ──────────────────────────────────────────────────────────────────
const Heatmap = ({ matrix }) => {
  const [tooltip, setTooltip] = useState(null);
  const heatData = matrix || MOCK_HEATMAP;
  const maxVal = Math.max(...heatData?.flat(), 1);

  const getColor = (v) => {
    const intensity = v / maxVal;
    const r = Math.round(26 + (255 - 26) * (1 - intensity));
    const g = Math.round(63 + (255 - 63) * (1 - intensity));
    const b = Math.round(224 + (255 - 224) * (1 - intensity));
    return `rgba(${r},${g},${b},${0.15 + intensity * 0.85})`;
  };

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: 380 }}>
        <div className="flex mb-1" style={{ paddingLeft: 44 }}>
          {days?.map(d => (
            <div key={d} className="flex-1 text-center" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#9BA3B8' }}>{d}</div>
          ))}
        </div>
        {heatData?.map((row, ri) => (
          <div key={ri} className="flex items-center mb-1">
            <div className="w-11 text-right pr-2 flex-shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#9BA3B8' }}>
              {hours?.[ri]}
            </div>
            {row?.map((val, ci) => (
              <div
                key={ci}
                className="flex-1 mx-0.5 rounded-[4px] cursor-pointer relative transition-transform hover:scale-110"
                style={{ height: 20, background: getColor(val) }}
                onMouseEnter={() => setTooltip({ ri, ci, val })}
                onMouseLeave={() => setTooltip(null)}
              >
                {tooltip?.ri === ri && tooltip?.ci === ci && (
                  <div
                    className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0F1117] text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50"
                    style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}
                  >
                    {val} visitas
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
        <div className="flex items-center gap-2 mt-3 pl-11">
          <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 11, color: '#9BA3B8' }}>Menos visitas</span>
          {[0.1, 0.3, 0.5, 0.7, 1.0]?.map((v, i) => (
            <div key={i} className="w-4 h-4 rounded-sm" style={{ background: getColor(v * maxVal) }} />
          ))}
          <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 11, color: '#9BA3B8' }}>Más visitas</span>
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const KPISkeleton = () => (
  <div className="bg-white rounded-2xl p-5 border border-[#E4E6F0] animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="w-9 h-9 rounded-[10px] bg-[#F7F8FC]" />
      <div className="w-24 h-10 bg-[#F7F8FC] rounded" />
    </div>
    <div className="h-8 w-20 bg-[#F7F8FC] rounded mb-2" />
    <div className="h-3 w-32 bg-[#F7F8FC] rounded mb-3" />
    <div className="border-t border-[#E4E6F0] pt-2 flex gap-2">
      <div className="h-5 w-24 bg-[#F7F8FC] rounded-full" />
      <div className="h-5 w-20 bg-[#F7F8FC] rounded ml-auto" />
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const TabResumenNew = ({ period = 'month', businessId }) => {
  const [metricTab, setMetricTab] = useState('Visitas');
  const [kpiData, setKpiData] = useState(null);
  const [comparativaData, setComparativaData] = useState(null);
  const [heatmapMatrix, setHeatmapMatrix] = useState(null);
  const [loading, setLoading] = useState(true);
  const metricTabs = ['Visitas', 'Canjes', 'Clientes', 'Puntos', 'Reseñas'];

  useEffect(() => {
    if (!businessId) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      fetchResumenKPIs(businessId, period),
      fetchComparativaData(businessId, period),
      fetchHeatmapData(businessId),
    ])?.then(([kpis, comparativa, heatmap]) => {
      setKpiData(kpis);
      setComparativaData(comparativa);
      setHeatmapMatrix(heatmap);
      setLoading(false);
    });
  }, [businessId, period]);

  const formatCurrency = (v) => {
    if (!v) return '$0';
    return `$${Math.round(v)?.toLocaleString('es-MX')}`;
  };

  const kpis = kpiData ? [
    {
      emoji: '📍', value: String(kpiData?.visitas?.value ?? 0), label: 'Visitas verificadas hoy',
      badge: `${kpiData?.visitas?.change >= 0 ? '+' : ''}${kpiData?.visitas?.change}% vs período anterior`,
      badgeGreen: (kpiData?.visitas?.change ?? 0) >= 0,
      sub: `${kpiData?.visitas?.unique ?? 0} únicos · ${kpiData?.visitas?.recurring ?? 0} recurrentes`,
      sparkData: kpiData?.visitas?.sparkData || [0,0,0,0,0,0,0,0,0,0],
      color: '#1A3FE0', iconBg: 'rgba(26,63,224,0.12)',
    },
    {
      emoji: '🎟️', value: String(kpiData?.canjes?.value ?? 0), label: 'Canjes hoy',
      badge: `${kpiData?.canjes?.change >= 0 ? '+' : ''}${kpiData?.canjes?.change}% vs ayer`,
      badgeGreen: (kpiData?.canjes?.change ?? 0) >= 0,
      sub: `${kpiData?.canjes?.cupones ?? 0} cupones · ${kpiData?.canjes?.promos ?? 0} promos`,
      sparkData: kpiData?.canjes?.sparkData || [0,0,0,0,0,0,0,0,0,0],
      color: '#00A86B', iconBg: 'rgba(0,168,107,0.12)',
    },
    {
      emoji: '$', value: formatCurrency(kpiData?.revenue?.value), label: 'Revenue estimado hoy',
      badge: `${kpiData?.revenue?.change >= 0 ? '+' : ''}${kpiData?.revenue?.change}% vs ayer`,
      badgeGreen: (kpiData?.revenue?.change ?? 0) >= 0,
      sub: `Ticket promedio: ${formatCurrency(kpiData?.revenue?.ticketPromedio)}`,
      sparkData: kpiData?.revenue?.sparkData || [0,0,0,0,0,0,0,0,0,0],
      color: '#F59E0B', iconBg: 'rgba(245,158,11,0.12)',
    },
    {
      emoji: '👤', value: String(kpiData?.nuevosClientes?.value ?? 0), label: 'Nuevos clientes hoy',
      badge: `${kpiData?.nuevosClientes?.change >= 0 ? '+' : ''}${kpiData?.nuevosClientes?.change}% vs ayer`,
      badgeGreen: (kpiData?.nuevosClientes?.change ?? 0) >= 0,
      sub: `${kpiData?.nuevosClientes?.referidos ?? 0} por referido · ${kpiData?.nuevosClientes?.organicos ?? 0} orgánicos`,
      sparkData: kpiData?.nuevosClientes?.sparkData || [0,0,0,0,0,0,0,0,0,0],
      color: '#7C3AED', iconBg: 'rgba(124,58,237,0.12)',
    },
  ] : [
    {
      emoji: '📍', value: '—', label: 'Visitas verificadas hoy',
      badge: 'Sin datos', badgeGreen: true,
      sub: '— únicos · — recurrentes',
      sparkData: [0,0,0,0,0,0,0,0,0,0],
      color: '#1A3FE0', iconBg: 'rgba(26,63,224,0.12)',
    },
    {
      emoji: '🎟️', value: '—', label: 'Canjes hoy',
      badge: 'Sin datos', badgeGreen: true,
      sub: '— cupones · — promos',
      sparkData: [0,0,0,0,0,0,0,0,0,0],
      color: '#00A86B', iconBg: 'rgba(0,168,107,0.12)',
    },
    {
      emoji: '$', value: '$0', label: 'Revenue estimado hoy',
      badge: 'Sin datos', badgeGreen: true,
      sub: 'Ticket promedio: $0',
      sparkData: [0,0,0,0,0,0,0,0,0,0],
      color: '#F59E0B', iconBg: 'rgba(245,158,11,0.12)',
    },
    {
      emoji: '👤', value: '—', label: 'Nuevos clientes hoy',
      badge: 'Sin datos', badgeGreen: true,
      sub: '— por referido · — orgánicos',
      sparkData: [0,0,0,0,0,0,0,0,0,0],
      color: '#7C3AED', iconBg: 'rgba(124,58,237,0.12)',
    },
  ];

  return (
    <div className="space-y-5">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {loading
          ? Array.from({ length: 4 })?.map((_, i) => <KPISkeleton key={i} />)
          : kpis?.map((kpi, i) => <KPICard key={i} {...kpi} />)
        }
      </div>
      {/* Alert Banner — only show if there's real data and canjes dropped */}
      {!loading && (kpiData?.canjes?.change ?? 0) < 0 && (
        <div
          className="flex items-center gap-3 rounded-[10px] px-4 py-3"
          style={{ background: 'rgba(245,158,11,0.08)', borderLeft: '3px solid #F59E0B' }}
        >
          <span className="text-lg flex-shrink-0">⚠️</span>
          <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, color: '#92400E', flex: 1 }}>
            <strong>Alerta:</strong> Los canjes bajaron {Math.abs(kpiData?.canjes?.change ?? 0)}% vs el período anterior. Revisa si tus promociones están activas.
          </p>
          <button
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors hover:bg-amber-100"
            style={{ border: '1px solid #F59E0B', color: '#92400E', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 12 }}
          >
            Revisar
          </button>
        </div>
      )}
      {/* Comparativa temporal */}
      <div className="bg-white rounded-2xl border border-[#E4E6F0] p-5 pb-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 15, color: '#0F1117' }}>
            Comparativa temporal
          </h3>
          <div className="flex gap-2 flex-wrap">
            {metricTabs?.map(t => (
              <button
                key={t}
                onClick={() => setMetricTab(t)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: 12,
                  background: metricTab === t ? 'rgba(26,63,224,0.08)' : 'transparent',
                  color: metricTab === t ? '#1A3FE0' : '#5A6175',
                  border: metricTab === t ? '1px solid #1A3FE0' : '1px solid #E4E6F0',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="h-48 bg-[#F7F8FC] rounded-xl animate-pulse" />
        ) : (
          <AreaChart metricKey={metricTab} comparativaData={comparativaData} />
        )}
        <div className="flex items-center justify-center gap-6 mt-3">
          {[
            { color: '#1A3FE0', label: 'Período actual', dash: false },
            { color: '#00A86B', label: 'Período anterior', dash: false },
            { color: '#9BA3B8', label: 'Proyectado', dash: true },
          ]?.map((l, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <svg width="24" height="8">
                <line x1="0" y1="4" x2="24" y2="4" stroke={l?.color} strokeWidth="2" strokeDasharray={l?.dash ? '4 2' : 'none'} />
              </svg>
              <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 11, color: '#5A6175' }}>{l?.label}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Heatmap */}
      <div className="bg-white rounded-2xl border border-[#E4E6F0] p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 15, color: '#0F1117' }} className="mb-4">
          Heatmap de horas pico
        </h3>
        {loading ? (
          <div className="h-40 bg-[#F7F8FC] rounded-xl animate-pulse" />
        ) : (
          <Heatmap matrix={heatmapMatrix} />
        )}
      </div>
    </div>
  );
};

export default TabResumenNew;
