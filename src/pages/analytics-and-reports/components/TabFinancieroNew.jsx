import React, { useEffect, useState } from 'react';
import { fetchFinancieroData } from '../../../services/analyticsService';

// ─── Area Chart for liability ─────────────────────────────────────────────────
const LiabilityChart = ({ emitidos, canjeados, vencidos, monthLabels }) => {
  const W = 700, H = 180;
  const padL = 50, padR = 20, padT = 10, padB = 30;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const months = monthLabels || ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
  const emit = emitidos?.length ? emitidos : [12000, 14500, 13800, 16200, 15400, 18000];
  const canj = canjeados?.length ? canjeados : [8000, 9200, 10100, 11400, 12000, 13200];
  const venc = vencidos?.length ? vencidos : [1200, 1500, 1800, 2100, 1900, 2400];

  const allVals = [...emit, ...canj, ...venc];
  const maxV = Math.max(...allVals, 1);
  const toX = (i) => padL + (i / (months?.length - 1)) * chartW;
  const toY = (v) => padT + chartH - (v / maxV) * chartH;

  const makePath = (arr) => arr?.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(v)}`)?.join(' ');
  const makeArea = (arr) => `${makePath(arr)} L${toX(arr?.length - 1)},${padT + chartH} L${padL},${padT + chartH} Z`;

  const yTicks = [0, Math.round(maxV * 0.5), maxV];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
      <defs>
        <linearGradient id="lg-emit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lg-canj" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00A86B" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#00A86B" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lg-venc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
        </linearGradient>
      </defs>
      {yTicks?.map((v, i) => (
        <g key={i}>
          <line x1={padL} y1={toY(v)} x2={W - padR} y2={toY(v)} stroke="#E4E6F0" strokeDasharray="4 3" strokeWidth="1" />
          <text x={padL - 5} y={toY(v) + 4} textAnchor="end" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fill: '#9BA3B8' }}>
            {v >= 1000 ? `${(v / 1000)?.toFixed(0)}k` : v}
          </text>
        </g>
      ))}
      {months?.map((m, i) => (
        <text key={i} x={toX(i)} y={H - 5} textAnchor="middle" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fill: '#9BA3B8' }}>{m}</text>
      ))}
      <path d={makeArea(emit)} fill="url(#lg-emit)" />
      <path d={makeArea(canj)} fill="url(#lg-canj)" />
      <path d={makeArea(venc)} fill="url(#lg-venc)" />
      <path d={makePath(venc)} fill="none" stroke="#EF4444" strokeWidth="2" />
      <path d={makePath(canj)} fill="none" stroke="#00A86B" strokeWidth="2" />
      <path d={makePath(emit)} fill="none" stroke="#7C3AED" strokeWidth="2.5" />
    </svg>
  );
};

// ─── Metric Card ──────────────────────────────────────────────────────────────
const MetricCard = ({ emoji, value, label, color, period, loading }) => (
  <div className="bg-white rounded-[14px] border border-[#E4E6F0] p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-xl">{emoji}</span>
      <span
        className="text-xs px-2 py-0.5 rounded-full"
        style={{ background: '#F7F8FC', fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#9BA3B8' }}
      >
        {period}
      </span>
    </div>
    {loading ? (
      <div className="h-8 w-24 bg-[#F7F8FC] rounded animate-pulse mb-1" />
    ) : (
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 900, fontSize: 26, color, letterSpacing: '-0.02em' }}>
        {value}
      </div>
    )}
    <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, color: '#9BA3B8' }} className="mt-0.5">
      {label}
    </div>
  </div>
);

const TabFinancieroNew = ({ period = 'month', businessId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) { setLoading(false); return; }
    setLoading(true);
    fetchFinancieroData(businessId, period)?.then(result => {
      setData(result);
      setLoading(false);
    });
  }, [businessId, period]);

  const fmt = (v) => `$${Math.round(v || 0)?.toLocaleString('es-MX')}`;
  const fmtPct = (v) => `${(v || 0)?.toFixed(1)}%`;
  const periodLabel = period === 'today' ? 'Hoy' : period === '7d' ? '7 días' : period === 'month' ? 'Este mes' : period === 'prev_month' ? 'Mes anterior' : '3 meses';

  const metrics = [
    { emoji: '💵', value: fmt(data?.revenueBruto), label: 'Revenue bruto', color: '#00A86B', period: periodLabel },
    { emoji: '🏷️', value: fmt(data?.descuentos), label: 'Descuentos aplicados', color: '#F59E0B', period: periodLabel },
    { emoji: '💰', value: fmt(data?.revenueNeto), label: 'Revenue neto', color: '#1A3FE0', period: periodLabel },
    { emoji: '🪙', value: fmt(data?.liabilityPuntos), label: 'Liability de puntos', color: '#7C3AED', period: periodLabel },
    { emoji: '✅', value: fmt(data?.breakage), label: 'Breakage del mes', color: '#00A86B', period: periodLabel },
    { emoji: '📉', value: fmtPct(data?.costoProg), label: 'Costo del programa', color: '#EF4444', period: periodLabel },
  ];

  return (
    <div className="space-y-5">
      {/* Metric cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics?.map((m, i) => <MetricCard key={i} {...m} loading={loading} />)}
      </div>
      {/* Liability evolution */}
      <div className="bg-white rounded-2xl border border-[#E4E6F0] p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="mb-4">
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 15, color: '#0F1117' }}>
            Evolución del liability de puntos
          </h3>
          <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, color: '#9BA3B8' }} className="mt-0.5">
            Puntos emitidos vs canjeados vs vencidos
          </p>
        </div>
        {loading ? (
          <div className="h-44 bg-[#F7F8FC] rounded-xl animate-pulse" />
        ) : (
          <LiabilityChart
            emitidos={data?.emitidos}
            canjeados={data?.canjeados}
            vencidos={data?.vencidos}
            monthLabels={data?.monthLabels}
          />
        )}
        <div className="flex items-center justify-center gap-6 mt-3">
          {[
            { color: '#7C3AED', label: 'Puntos emitidos' },
            { color: '#00A86B', label: 'Canjeados' },
            { color: '#EF4444', label: 'Vencidos' },
          ]?.map((l, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 rounded" style={{ background: l?.color }} />
              <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 11, color: '#5A6175' }}>{l?.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabFinancieroNew;
