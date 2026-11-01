import React, { useState, useEffect } from 'react';
import { fetchClientesData } from '../../../services/analyticsService';

// ─── Donut Chart ──────────────────────────────────────────────────────────────
const DonutChart = ({ data }) => {
  const total = data?.reduce((s, d) => s + d?.value, 0) || 1;
  const cx = 60, cy = 60, r = 48, innerR = 30;
  let startAngle = -Math.PI / 2;

  const slices = data?.map(d => {
    const angle = (d?.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(startAngle + angle);
    const y2 = cy + r * Math.sin(startAngle + angle);
    const xi1 = cx + innerR * Math.cos(startAngle);
    const yi1 = cy + innerR * Math.sin(startAngle);
    const xi2 = cx + innerR * Math.cos(startAngle + angle);
    const yi2 = cy + innerR * Math.sin(startAngle + angle);
    const large = angle > Math.PI ? 1 : 0;
    const path = `M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${xi2},${yi2} A${innerR},${innerR} 0 ${large},0 ${xi1},${yi1} Z`;
    startAngle += angle;
    return { ...d, path };
  });

  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      {slices?.map((s, i) => (
        <path key={i} d={s?.path} fill={s?.color} className="transition-opacity hover:opacity-80" />
      ))}
      <text x="60" y="56" textAnchor="middle" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 700, fill: '#0F1117' }}>{total}</text>
      <text x="60" y="70" textAnchor="middle" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 9, fill: '#9BA3B8' }}>clientes</text>
    </svg>
  );
};

// ─── Bar Chart (vertical) ─────────────────────────────────────────────────────
const VerticalBars = ({ data }) => {
  const maxV = Math.max(...data?.map(d => d?.value), 1);
  return (
    <div className="flex items-end gap-3 h-32">
      {data?.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: d?.highlight ? '#1A3FE0' : '#5A6175' }}>
            ${d?.value?.toLocaleString()}
          </span>
          <div
            className="w-full rounded-t-lg transition-all"
            style={{
              height: `${(d?.value / maxV) * 96}px`,
              background: d?.highlight ? '#1A3FE0' : '#E4E6F0',
            }}
          />
          <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 10, color: '#9BA3B8' }}>{d?.label}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Cohort Cell ──────────────────────────────────────────────────────────────
const getCohortBg = (val) => {
  if (val === null) return { bg: '#F7F8FC', color: '#9BA3B8' };
  if (val === 100) return { bg: '#1A3FE0', color: '#fff' };
  if (val >= 60) return { bg: '#00A86B', color: '#fff' };
  if (val >= 40) return { bg: '#F59E0B', color: '#fff' };
  return { bg: '#EF4444', color: '#fff' };
};

// ─── Default data ─────────────────────────────────────────────────────────────
const DEFAULT_CUSTOMER_STATES = [
  { label: 'Activos', value: 0, color: '#00A86B', total: 1 },
  { label: 'Recurrentes', value: 0, color: '#1A3FE0', total: 1 },
  { label: 'En riesgo', value: 0, color: '#F59E0B', total: 1 },
  { label: 'Dormidos 30d', value: 0, color: '#F97316', total: 1 },
  { label: 'Perdidos 60d', value: 0, color: '#EF4444', total: 1 },
];
const DEFAULT_ACQUISITION = [
  { label: 'Orgánico mapa', value: 35, color: '#1A3FE0' },
  { label: 'Referido', value: 25, color: '#00A86B' },
  { label: 'QR offline', value: 20, color: '#F59E0B' },
  { label: 'Campaña', value: 12, color: '#7C3AED' },
  { label: 'Geofence', value: 8, color: '#0891B2' },
];
const DEFAULT_LTV = [
  { label: 'Sin nivel', value: 0, highlight: false },
  { label: 'Bronce', value: 0, highlight: false },
  { label: 'Plata', value: 0, highlight: true },
  { label: 'Oro', value: 0, highlight: false },
];
const DEFAULT_COHORTS = [
  { month: 'Dic 2025', values: [100, 68, 52, 44, 38, 33] },
  { month: 'Ene 2026', values: [100, 65, 49, 41, 35, null] },
  { month: 'Feb 2026', values: [100, 71, 55, 46, null, null] },
  { month: 'Mar 2026', values: [100, 69, 53, null, null, null] },
  { month: 'Abr 2026', values: [100, 72, null, null, null, null] },
  { month: 'May 2026', values: [100, null, null, null, null, null] },
];

const TabClientesNew = ({ businessId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) { setLoading(false); return; }
    setLoading(true);
    fetchClientesData(businessId)?.then(result => {
      setData(result);
      setLoading(false);
    });
  }, [businessId]);

  const customerStates = data?.customerStates || DEFAULT_CUSTOMER_STATES;
  const acquisitionData = data?.acquisitionData || DEFAULT_ACQUISITION;
  const ltvData = data?.ltvData || DEFAULT_LTV;
  const cohorts = data?.cohorts || DEFAULT_COHORTS;

  return (
    <div className="space-y-5">
      {/* Top 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Customer states */}
        <div className="bg-white rounded-2xl border border-[#E4E6F0] p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 14, color: '#0F1117' }} className="mb-4">
            Estado de clientes
          </h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 })?.map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-3 bg-[#F7F8FC] rounded mb-1 w-3/4" />
                  <div className="h-2 bg-[#F7F8FC] rounded-full w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {customerStates?.map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, color: '#5A6175' }}>{s?.label}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, color: '#0F1117' }}>{s?.value?.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-[#F7F8FC] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min((s?.value / s?.total) * 100, 100)}%`, background: s?.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 2: Acquisition donut */}
        <div className="bg-white rounded-2xl border border-[#E4E6F0] p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 14, color: '#0F1117' }} className="mb-4">
            Canal de adquisición
          </h3>
          {loading ? (
            <div className="flex items-center gap-4 animate-pulse">
              <div className="w-28 h-28 rounded-full bg-[#F7F8FC]" />
              <div className="space-y-2 flex-1">
                {Array.from({ length: 5 })?.map((_, i) => <div key={i} className="h-3 bg-[#F7F8FC] rounded w-full" />)}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <DonutChart data={acquisitionData} />
              <div className="space-y-2 flex-1">
                {acquisitionData?.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d?.color }} />
                      <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 11, color: '#5A6175' }}>{d?.label}</span>
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: '#0F1117' }}>{d?.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Card 3: LTV por nivel VIP */}
        <div className="bg-white rounded-2xl border border-[#E4E6F0] p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 14, color: '#0F1117' }} className="mb-4">
            LTV por nivel VIP
          </h3>
          {loading ? (
            <div className="h-32 bg-[#F7F8FC] rounded-xl animate-pulse" />
          ) : (
            <>
              <VerticalBars data={ltvData} />
              <div
                className="mt-3 px-3 py-2 rounded-lg text-xs"
                style={{ background: 'rgba(26,63,224,0.08)', fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#1A3FE0' }}
              >
                Los clientes Oro generan <strong>más revenue</strong> por visita
              </div>
            </>
          )}
        </div>
      </div>
      {/* Cohort retention table */}
      <div className="bg-white rounded-2xl border border-[#E4E6F0] p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="mb-4">
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 15, color: '#0F1117' }}>
            Retención por cohorte
          </h3>
          <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, color: '#9BA3B8' }} className="mt-0.5">
            Porcentaje de clientes que regresan mes a mes desde su primera visita
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 500 }}>
            <thead>
              <tr>
                <th className="text-left pb-2 pr-4" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, color: '#9BA3B8' }}>
                  Cohorte
                </th>
                {['Mes 0', 'Mes 1', 'Mes 2', 'Mes 3', 'Mes 4', 'Mes 5']?.map(m => (
                  <th key={m} className="pb-2 px-1 text-center" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, color: '#9BA3B8' }}>
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohorts?.map((row, ri) => (
                <tr key={ri}>
                  <td className="py-1 pr-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, color: '#5A6175', whiteSpace: 'nowrap' }}>
                    {row?.month}
                  </td>
                  {row?.values?.map((val, ci) => {
                    const { bg, color } = getCohortBg(val);
                    return (
                      <td key={ci} className="py-1 px-1">
                        <div
                          className="w-14 h-8 rounded-lg flex items-center justify-center mx-auto"
                          style={{ background: bg }}
                        >
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color }}>
                            {val !== null ? `${val}%` : '—'}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TabClientesNew;
