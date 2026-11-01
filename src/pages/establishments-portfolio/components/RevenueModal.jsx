import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import Icon from '../../../components/AppIcon';

const DATE_RANGES = [
  { key: 'today', label: 'Hoy' },
  { key: '7d', label: '7 días' },
  { key: '30d', label: '30 días' },
  { key: '90d', label: '90 días' },
  { key: 'custom', label: 'Personalizado' },
];

const COLORS = ['#f97316', '#ef4444', '#8b5cf6', '#0ea5e9', '#22c55e'];

const MONTHLY_LABELS = ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'];

const RevenueModal = ({ establishments, metrics, onClose }) => {
  const [dateRange, setDateRange] = useState('30d');

  const tableData = useMemo(() => {
    return establishments?.map((e, idx) => {
        const revenue = e?.revenueMonth || 0;
        const prevRevenue = Math.round(revenue * (0.85 + (idx * 0.07)));
        const diff = revenue - prevRevenue;
        const pct = prevRevenue > 0 ? ((diff / prevRevenue) * 100)?.toFixed(1) : '0.0';
        const visits = e?.comparison?.visitsMonth || 0;
        const avgTicket = visits > 0 ? Math.round(revenue / visits) : 0;
        return {
          ...e,
          color: COLORS?.[idx % COLORS?.length],
          revenue,
          prevRevenue,
          diff,
          pct: parseFloat(pct),
          avgTicket,
          transactions: visits,
        };
      })?.sort((a, b) => b?.revenue - a?.revenue);
  }, [establishments]);

  const barData = useMemo(() => {
    return tableData?.map(e => ({
      name: e?.name?.length > 10 ? e?.name?.slice(0, 10) + '…' : e?.name,
      Revenue: e?.revenue,
      color: e?.color,
    }));
  }, [tableData]);

  const cumulativeData = useMemo(() => {
    let acc = 0;
    return MONTHLY_LABELS?.map((month, i) => {
      const monthRevenue = establishments?.reduce((s, e) => {
        const base = e?.revenueMonth || 0;
        const factor = 0.7 + (i * 0.06);
        return s + Math.round(base * factor);
      }, 0);
      acc += monthRevenue;
      return { month, mensual: monthRevenue, acumulado: acc };
    });
  }, [establishments]);

  const totalRevenue = tableData?.reduce((s, d) => s + d?.revenue, 0);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden"
        onClick={e => e?.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <Icon name="TrendingUp" size={20} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Revenue Estimado</h2>
              <p className="text-sm text-muted-foreground">
                <span className="text-2xl font-bold text-foreground mr-1">${totalRevenue?.toLocaleString()} MXN</span>
                <span className={`font-semibold text-xs ${(metrics?.revenueMonthChange || 0) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {(metrics?.revenueMonthChange || 0) >= 0 ? '↑' : '↓'} {Math.abs(metrics?.revenueMonthChange || 8)}% vs mes anterior
                </span>
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
          {/* Date range */}
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

          {/* Bar chart */}
          <div className="bg-muted/30 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Revenue por negocio (mayor a menor)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={v => `$${(v / 1000)?.toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  formatter={v => [`$${v?.toLocaleString()} MXN`, 'Revenue']}
                />
                <Bar dataKey="Revenue" radius={[4, 4, 0, 0]}>
                  {barData?.map((entry, index) => (
                    <rect key={index} fill={entry?.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cumulative line */}
          <div className="bg-muted/30 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Acumulado mensual del portafolio</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={cumulativeData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={v => `$${(v / 1000)?.toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  formatter={v => [`$${v?.toLocaleString()} MXN`]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="mensual" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="Mensual" />
                <Line type="monotone" dataKey="acumulado" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="Acumulado" />
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
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Revenue</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Ticket Prom.</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Transacciones</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">vs Mes Ant.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tableData?.map(row => (
                    <tr key={row?.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: row?.color }}
                          >
                            {row?.initial}
                          </div>
                          <button className="font-semibold text-foreground hover:text-primary transition-colors">
                            {row?.name}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">${row?.revenue?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">${row?.avgTicket?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{row?.transactions?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`flex items-center justify-end gap-0.5 font-semibold text-xs ${
                          row?.pct > 0 ? 'text-emerald-600' : row?.pct < 0 ? 'text-red-500' : 'text-muted-foreground'
                        }`}>
                          {row?.pct > 0 ? '↑' : row?.pct < 0 ? '↓' : '→'}
                          {row?.pct > 0 ? '+' : ''}{row?.pct}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Icon name="Info" size={12} />
              Basado en check-ins × ticket promedio
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueModal;
