import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';

const DATE_RANGES = [
  { key: 'today', label: 'Hoy' },
  { key: '7d', label: '7 días' },
  { key: '30d', label: '30 días' },
  { key: '90d', label: '90 días' },
  { key: 'custom', label: 'Personalizado' },
];

const Sparkline = ({ data, color }) => {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 60;
  const h = 24;
  const points = data?.map((v, i) => {
    const x = (i / (data?.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  })?.join(' ');
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
    </svg>
  );
};

const generateLineData = (establishments, range) => {
  const days = range === 'today' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const labels = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d?.setDate(d?.getDate() - i);
    labels?.push(days <= 7 ? d?.toLocaleDateString('es-MX', { weekday: 'short' }) : `${d?.getDate()}/${d?.getMonth() + 1}`);
  }
  return labels?.map((label, idx) => {
    const entry = { label };
    establishments?.forEach(e => {
      const base = e?.metrics?.visitsToday || 0;
      const seed = (e?.id * 7 + idx * 3) % 20;
      entry[e.name] = Math.max(0, Math.round(base * (0.6 + (seed / 20) * 0.8)));
    });
    return entry;
  });
};

const COLORS = ['#f97316', '#ef4444', '#8b5cf6', '#0ea5e9', '#22c55e'];
const METHOD_COLORS = { QR: 'bg-blue-100 text-blue-700', NFC: 'bg-purple-100 text-purple-700', Geofence: 'bg-emerald-100 text-emerald-700', Manual: 'bg-gray-100 text-gray-600' };

const VisitasModal = ({ establishments, metrics, onClose }) => {
  const [dateRange, setDateRange] = useState('7d');
  const [loading] = useState(false);

  const lineData = useMemo(() => generateLineData(establishments, dateRange), [establishments, dateRange]);

  const tableData = useMemo(() => {
    return establishments?.map((e, idx) => {
      const visits = lineData?.reduce((sum, d) => sum + (d?.[e?.name] || 0), 0);
      const prevVisits = Math.round(visits * (0.85 + Math.random() * 0.3));
      const total = establishments?.reduce((s, est) => s + lineData?.reduce((ss, d) => ss + (d?.[est?.name] || 0), 0), 0);
      const pct = total > 0 ? ((visits / total) * 100)?.toFixed(1) : '0.0';
      const trend = visits > prevVisits ? 'up' : visits < prevVisits ? 'down' : 'neutral';
      const diff = visits - prevVisits;
      return {
        ...e,
        visits,
        prevVisits,
        pct,
        trend,
        diff,
        color: COLORS?.[idx % COLORS?.length],
        sparkData: e?.kpis?.visitsWeek || [0, 0, 0, 0, 0, 0, 0],
        methods: {
          QR: Math.round(visits * 0.45),
          NFC: Math.round(visits * 0.25),
          Geofence: Math.round(visits * 0.20),
          Manual: Math.round(visits * 0.10),
        },
      };
    });
  }, [establishments, lineData]);

  const totalVisits = tableData?.reduce((s, d) => s + d?.visits, 0);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden"
        onClick={e => e?.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Icon name="Users" size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Visitas Totales</h2>
              <p className="text-sm text-muted-foreground">
                <span className="text-2xl font-bold text-foreground mr-1">{totalVisits?.toLocaleString()}</span>
                visitas en el período
                <span className="ml-2 text-emerald-600 font-semibold text-xs">+{metrics?.visitsTodayChange || 12}% vs período anterior</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-2 transition-colors">
              <Icon name="Download" size={14} />
              Exportar Excel
            </button>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Icon name="X" size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Date range selector */}
          <div className="flex flex-wrap gap-2">
            {DATE_RANGES?.map(r => (
              <button
                key={r?.key}
                onClick={() => setDateRange(r?.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  dateRange === r?.key
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {r?.label}
              </button>
            ))}
            {dateRange === 'custom' && (
              <div className="flex items-center gap-2 ml-2">
                <input type="date" className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background text-foreground" />
                <span className="text-xs text-muted-foreground">—</span>
                <input type="date" className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background text-foreground" />
              </div>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1,2,3]?.map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}
            </div>
          ) : (
            <>
              {/* Line chart */}
              <div className="bg-muted/30 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Visitas por negocio en el período</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={lineData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                    <Tooltip
                      contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    {establishments?.map((e, idx) => (
                      <Line
                        key={e?.id}
                        type="monotone"
                        dataKey={e?.name}
                        stroke={COLORS?.[idx % COLORS?.length]}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Table */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Desglose por negocio</h3>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Negocio</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Visitas</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">vs Anterior</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">% Total</th>
                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Métodos</th>
                        <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Últimos 7d</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {tableData?.map((row) => (
                        <tr key={row?.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                style={{ backgroundColor: row?.color }}
                              >
                                {row?.initial}
                              </div>
                              <button
                                className="font-semibold text-foreground hover:text-primary transition-colors text-left"
                                onClick={() => {}}
                              >
                                {row?.name}
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-foreground">{row?.visits?.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`flex items-center justify-end gap-0.5 font-semibold text-xs ${
                              row?.trend === 'up' ? 'text-emerald-600' : row?.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                            }`}>
                              <Icon name={row?.trend === 'up' ? 'TrendingUp' : row?.trend === 'down' ? 'TrendingDown' : 'Minus'} size={12} />
                              {row?.diff > 0 ? '+' : ''}{row?.diff}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <div className="w-12 bg-muted rounded-full h-1.5">
                                <div className="h-1.5 rounded-full" style={{ width: `${row?.pct}%`, backgroundColor: row?.color }} />
                              </div>
                              <span className="text-xs text-muted-foreground">{row?.pct}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(row?.methods)?.map(([method, count]) => (
                                <span key={method} className={`text-xs px-1.5 py-0.5 rounded font-medium ${METHOD_COLORS?.[method]}`}>
                                  {method} {count}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Sparkline data={row?.sparkData} color={row?.color} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitasModal;
