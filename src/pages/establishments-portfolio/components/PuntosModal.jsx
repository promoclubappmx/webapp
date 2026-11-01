import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';

const DATE_RANGES = [
  { key: 'today', label: 'Hoy' },
  { key: '7d', label: '7 días' },
  { key: '30d', label: '30 días' },
  { key: '90d', label: '90 días' },
  { key: 'custom', label: 'Personalizado' },
];

const COLORS = ['#f97316', '#ef4444', '#8b5cf6', '#0ea5e9', '#22c55e'];
const POINTS_TO_MXN = 0.15;

const PuntosModal = ({ establishments, metrics, onClose }) => {
  const [dateRange, setDateRange] = useState('30d');

  const tableData = useMemo(() => {
    return establishments?.map((e, idx) => {
      const issued = e?.comparison?.pointsIssued || 0;
      const redeemed = e?.comparison?.pointsRedeemed || 0;
      const balance = issued - redeemed;
      const liabilityMXN = balance * POINTS_TO_MXN;
      const redemptionRate = issued > 0 ? ((redeemed / issued) * 100)?.toFixed(1) : '0.0';
      return {
        ...e,
        color: COLORS?.[idx % COLORS?.length],
        issued,
        redeemed,
        balance,
        liabilityMXN,
        redemptionRate: parseFloat(redemptionRate),
      };
    });
  }, [establishments]);

  const barData = useMemo(() => {
    return tableData?.map(e => ({
      name: e?.name?.length > 10 ? e?.name?.slice(0, 10) + '…' : e?.name,
      Emitidos: e?.issued,
      Canjeados: e?.redeemed,
    }));
  }, [tableData]);

  const totalIssued = tableData?.reduce((s, d) => s + d?.issued, 0);
  const totalRedeemed = tableData?.reduce((s, d) => s + d?.redeemed, 0);
  const totalBalance = totalIssued - totalRedeemed;
  const totalLiability = totalBalance * POINTS_TO_MXN;
  const overallRedemptionRate = totalIssued > 0 ? ((totalRedeemed / totalIssued) * 100)?.toFixed(1) : '0.0';
  const breakageEstimate = totalIssued > 0 ? ((1 - totalRedeemed / totalIssued) * 100)?.toFixed(1) : '0.0';

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden"
        onClick={e => e?.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Icon name="Coins" size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Puntos en Circulación</h2>
              <p className="text-sm text-muted-foreground">
                <span className="text-2xl font-bold text-foreground mr-1">{totalBalance?.toLocaleString()} pts</span>
                <span className="text-muted-foreground">(${totalLiability?.toLocaleString()} MXN)</span>
                <span className="ml-2 text-xs text-muted-foreground">1 pt = $0.15 MXN</span>
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

          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Emitidos', value: totalIssued?.toLocaleString(), icon: 'ArrowUpCircle', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { label: 'Total Canjeados', value: totalRedeemed?.toLocaleString(), icon: 'ArrowDownCircle', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              { label: 'Tasa de Canje', value: `${overallRedemptionRate}%`, icon: 'Percent', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
              { label: 'Breakage Est.', value: `${breakageEstimate}%`, icon: 'TrendingDown', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            ]?.map((kpi, i) => (
              <div key={i} className={`${kpi?.bg} rounded-xl p-3`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon name={kpi?.icon} size={14} className={kpi?.color} />
                  <span className="text-xs text-muted-foreground">{kpi?.label}</span>
                </div>
                <p className={`text-lg font-bold ${kpi?.color}`}>{kpi?.value}</p>
              </div>
            ))}
          </div>

          {/* Dual bar chart */}
          <div className="bg-muted/30 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Emitidos vs Canjeados por negocio</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Emitidos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Canjeados" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
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
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Emitidos</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Canjeados</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Saldo</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Liability MXN</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Tasa Canje</th>
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
                      <td className="px-4 py-3 text-right text-blue-600 font-semibold">{row?.issued?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-emerald-600 font-semibold">{row?.redeemed?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">{row?.balance?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-amber-600 font-semibold">${row?.liabilityMXN?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="w-12 bg-muted rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-emerald-500"
                              style={{ width: `${Math.min(row?.redemptionRate, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground">{row?.redemptionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Breakage indicator */}
            <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Icon name="AlertTriangle" size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Breakage estimado del portafolio: {breakageEstimate}%</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                    El {breakageEstimate}% de los puntos emitidos no han sido canjeados. Esto representa un ingreso potencial no realizado de
                    ${(totalIssued * parseFloat(breakageEstimate) / 100 * POINTS_TO_MXN)?.toLocaleString()} MXN en breakage.
                    Considera campañas de reactivación para reducir puntos dormidos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuntosModal;
