import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';

const DATE_RANGES = [
  { key: 'today', label: 'Hoy' },
  { key: '7d', label: '7 días' },
  { key: '30d', label: '30 días' },
  { key: '90d', label: '90 días' },
  { key: 'custom', label: 'Personalizado' },
];

const COLORS = ['#f97316', '#ef4444', '#8b5cf6', '#0ea5e9', '#22c55e'];

const ClientesModal = ({ establishments, metrics, onClose }) => {
  const [dateRange, setDateRange] = useState('30d');

  const tableData = useMemo(() => {
    return establishments?.map((e, idx) => ({
      ...e,
      color: COLORS?.[idx % COLORS?.length],
      activeClients: e?.comparison?.activeCustomers || 0,
      newClients: e?.comparison?.newCustomers || 0,
      dormant: e?.comparison?.dormantCustomers || 0,
      retention: e?.comparison?.retentionRate || 0,
      shared: Math.round((e?.comparison?.activeCustomers || 0) * 0.08),
    }));
  }, [establishments]);

  const barData = useMemo(() => {
    return tableData?.map(e => ({
      name: e?.name?.length > 10 ? e?.name?.slice(0, 10) + '…' : e?.name,
      Nuevos: e?.newClients,
      Recurrentes: e?.activeClients - e?.newClients,
    }));
  }, [tableData]);

  const donutData = useMemo(() => {
    return tableData?.filter(e => e?.activeClients > 0)?.map(e => ({ name: e?.name, value: e?.activeClients, color: e?.color }));
  }, [tableData]);

  const totalActive = tableData?.reduce((s, d) => s + d?.activeClients, 0);

  const RADIAN = Math.PI / 180;
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
        {`${(percent * 100)?.toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden"
        onClick={e => e?.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Icon name="UserCheck" size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Clientes Activos</h2>
              <p className="text-sm text-muted-foreground">
                <span className="text-2xl font-bold text-foreground mr-1">{totalActive?.toLocaleString()}</span>
                clientes únicos activos (sin duplicados entre negocios)
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

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Stacked bar chart */}
            <div className="lg:col-span-2 bg-muted/30 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Nuevos vs Recurrentes por negocio</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                  <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Recurrentes" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Nuevos" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Donut chart */}
            <div className="bg-muted/30 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Distribución por negocio</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomLabel}
                  >
                    {donutData?.map((entry, index) => (
                      <Cell key={index} fill={entry?.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    formatter={(value, name) => [value?.toLocaleString(), name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-1">
                {donutData?.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d?.color }} />
                      <span className="text-muted-foreground truncate max-w-[80px]">{d?.name}</span>
                    </div>
                    <span className="font-semibold text-foreground">{d?.value?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Desglose por negocio</h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Negocio</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Activos</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Nuevos</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Dormidos</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Retención</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Compartidos</th>
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
                      <td className="px-4 py-3 text-right font-semibold text-foreground">{row?.activeClients?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-blue-600 font-semibold">+{row?.newClients}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold ${row?.dormant > 20 ? 'text-red-500' : 'text-muted-foreground'}`}>{row?.dormant}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="w-12 bg-muted rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full"
                              style={{
                                width: `${row?.retention}%`,
                                backgroundColor: row?.retention >= 60 ? '#10b981' : row?.retention >= 40 ? '#f59e0b' : '#ef4444'
                              }}
                            />
                          </div>
                          <span className={`text-xs font-semibold ${
                            row?.retention >= 60 ? 'text-emerald-600' : row?.retention >= 40 ? 'text-amber-600' : 'text-red-500'
                          }`}>{row?.retention}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{row?.shared}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientesModal;
