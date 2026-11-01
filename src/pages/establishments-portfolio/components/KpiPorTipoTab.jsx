import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';


const METRIC_OPTIONS = [
  { key: 'visitsMonth', label: 'Visitas/mes', icon: 'Users', color: '#6366f1', format: (v) => v?.toLocaleString() },
  { key: 'revenueMonth', label: 'Revenue/mes', icon: 'DollarSign', color: '#10b981', format: (v) => `$${(v / 1000)?.toFixed(0)}k` },
  { key: 'activeCustomers', label: 'Clientes activos', icon: 'UserCheck', color: '#f59e0b', format: (v) => v?.toLocaleString() },
  { key: 'profileScore', label: 'Score de perfil', icon: 'Star', color: '#ec4899', format: (v) => `${v}%` },
];

const CustomTooltip = ({ active, payload, label, metricFormat }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-xl p-3 min-w-[160px]">
      <p className="text-sm font-bold text-foreground mb-2">{label}</p>
      {payload?.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground">{entry?.name}</span>
          <span className="text-xs font-bold" style={{ color: entry?.color }}>
            {metricFormat ? metricFormat(entry?.value) : entry?.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const KpiPorTipoTab = ({ establishments, activeCategory, onCategoryChange }) => {
  const [activeMetric, setActiveMetric] = useState('visitsMonth');

  const selectedMetric = METRIC_OPTIONS?.find(m => m?.key === activeMetric);

  // Group by tipo and compute aggregated KPIs
  const tipoData = useMemo(() => {
    const grouped = {};
    establishments?.forEach(e => {
      const tipo = e?.tipo || e?.subcategory || 'Sin tipo';
      if (!grouped?.[tipo]) {
        grouped[tipo] = {
          tipo,
          count: 0,
          visitsMonth: 0,
          revenueMonth: 0,
          activeCustomers: 0,
          profileScore: 0,
          rating: 0,
          ratingCount: 0,
        };
      }
      grouped[tipo].count += 1;
      grouped[tipo].visitsMonth += e?.kpis?.visitsMonth || 0;
      grouped[tipo].revenueMonth += e?.revenueMonth || 0;
      grouped[tipo].activeCustomers += e?.metrics?.activeCustomers30d || 0;
      grouped[tipo].profileScore += e?.kpis?.profileScore || 0;
      if (e?.metrics?.rating > 0) {
        grouped[tipo].rating += e?.metrics?.rating;
        grouped[tipo].ratingCount += 1;
      }
    });

    return Object.values(grouped)?.map(g => ({
      ...g,
      profileScore: g?.count > 0 ? Math.round(g?.profileScore / g?.count) : 0,
      rating: g?.ratingCount > 0 ? (g?.rating / g?.ratingCount)?.toFixed(1) : 0,
    }))?.sort((a, b) => b?.[activeMetric] - a?.[activeMetric]);
  }, [establishments, activeMetric]);

  // Chart data (top 8 tipos)
  const chartData = useMemo(() => {
    return tipoData?.slice(0, 8)?.map(t => ({
      name: t?.tipo?.length > 18 ? t?.tipo?.substring(0, 16) + '…' : t?.tipo,
      fullName: t?.tipo,
      [activeMetric]: t?.[activeMetric],
    }));
  }, [tipoData, activeMetric]);

  // Summary KPIs
  const totalVisits = establishments?.reduce((s, e) => s + (e?.kpis?.visitsMonth || 0), 0);
  const totalRevenue = establishments?.reduce((s, e) => s + (e?.revenueMonth || 0), 0);
  const totalCustomers = establishments?.reduce((s, e) => s + (e?.metrics?.activeCustomers30d || 0), 0);
  const avgProfile = establishments?.length > 0
    ? Math.round(establishments?.reduce((s, e) => s + (e?.kpis?.profileScore || 0), 0) / establishments?.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Info banner */}
      {activeCategory !== 'Todos' && (
        <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5">
          <Icon name="Filter" size={14} className="text-primary" />
          <p className="text-sm text-primary font-medium">
            Mostrando KPIs para: <strong>{activeCategory}</strong>
          </p>
          <button
            onClick={() => onCategoryChange('Todos')}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Icon name="X" size={12} />
            Quitar filtro
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Visitas totales/mes', value: totalVisits?.toLocaleString(), icon: 'Users', color: 'text-indigo-600', bg: 'bg-indigo-50', change: +8 },
          { label: 'Revenue total/mes', value: `$${(totalRevenue / 1000)?.toFixed(0)}k`, icon: 'DollarSign', color: 'text-emerald-600', bg: 'bg-emerald-50', change: +12 },
          { label: 'Clientes activos', value: totalCustomers?.toLocaleString(), icon: 'UserCheck', color: 'text-amber-600', bg: 'bg-amber-50', change: +5 },
          { label: 'Score promedio', value: `${avgProfile}%`, icon: 'TrendingUp', color: 'text-pink-600', bg: 'bg-pink-50', change: +3 },
        ]?.map(kpi => (
          <div key={kpi?.label} className="bg-card border border-border rounded-xl p-4">
            <div className={`w-8 h-8 ${kpi?.bg} rounded-lg flex items-center justify-center mb-2`}>
              <Icon name={kpi?.icon} size={16} className={kpi?.color} />
            </div>
            <p className="text-xl font-bold text-foreground">{kpi?.value}</p>
            <p className="text-xs text-muted-foreground">{kpi?.label}</p>
            <p className={`text-xs font-medium mt-1 ${kpi?.change > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {kpi?.change > 0 ? '↑' : '↓'} {Math.abs(kpi?.change)}% vs mes anterior
            </p>
          </div>
        ))}
      </div>

      {/* Metric selector + Bar Chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h3 className="text-base font-semibold text-foreground">Comparativa por tipo</h3>
            {activeCategory !== 'Todos' && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{activeCategory}</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {METRIC_OPTIONS?.map(m => (
              <button
                key={m?.key}
                onClick={() => setActiveMetric(m?.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  activeMetric === m?.key
                    ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon name={m?.icon} size={12} />
                {m?.label}
              </button>
            ))}
          </div>
        </div>

        {chartData?.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                angle={-35}
                textAnchor="end"
                interval={0}
                height={70}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickFormatter={(v) => selectedMetric?.format ? selectedMetric?.format(v) : v}
              />
              <Tooltip content={<CustomTooltip metricFormat={selectedMetric?.format} />} />
              <Bar dataKey={activeMetric} name={selectedMetric?.label} fill={selectedMetric?.color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Icon name="BarChart2" size={32} className="mb-2 opacity-30" />
            <p className="text-sm">No hay datos para mostrar</p>
          </div>
        )}
      </div>

      {/* Table */}
      {tipoData?.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h3 className="text-sm font-semibold text-foreground">Detalle por tipo</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Tipo</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Establec.</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Visitas/mes</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Clientes</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Score</th>
                </tr>
              </thead>
              <tbody>
                {tipoData?.map((row, i) => (
                  <tr key={row?.tipo} className={`border-t border-border ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                    <td className="px-5 py-3 font-medium text-foreground">{row?.tipo}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{row?.count}</td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">{row?.visitsMonth?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{row?.activeCustomers?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        row?.profileScore >= 80 ? 'bg-green-100 text-green-700' :
                        row?.profileScore >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {row?.profileScore}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default KpiPorTipoTab;
