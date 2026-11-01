import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const METRICS_ROWS = [
  { key: 'visitsMonth', label: 'Visitas este mes', format: v => (v ?? 0)?.toLocaleString(), group: 'Tráfico' },
  { key: 'activeCustomers', label: 'Clientes activos (30d)', format: v => (v ?? 0)?.toLocaleString(), group: 'Tráfico' },
  { key: 'newCustomers', label: 'Clientes nuevos', format: v => (v ?? 0)?.toLocaleString(), group: 'Tráfico' },
  { key: 'dormantCustomers', label: 'Clientes dormidos', format: v => (v ?? 0)?.toLocaleString(), group: 'Tráfico' },
  { key: 'retentionRate', label: 'Tasa de retención', format: v => `${v ?? 0}%`, group: 'Engagement' },
  { key: 'rating', label: 'Rating promedio', format: v => v > 0 ? `⭐ ${v}` : '—', group: 'Engagement' },
  { key: 'reviewsMonth', label: 'Reseñas este mes', format: v => (v ?? 0)?.toLocaleString(), group: 'Engagement' },
  { key: 'activePromos', label: 'Promos activas', format: v => (v ?? 0)?.toLocaleString(), group: 'Promociones' },
  { key: 'couponsRedeemed', label: 'Cupones canjeados', format: v => (v ?? 0)?.toLocaleString(), group: 'Promociones' },
  { key: 'pointsIssued', label: 'Puntos emitidos', format: v => (v ?? 0)?.toLocaleString(), group: 'Lealtad' },
  { key: 'pointsRedeemed', label: 'Puntos canjeados', format: v => (v ?? 0)?.toLocaleString(), group: 'Lealtad' },
  { key: 'revenueMonth', label: 'Revenue estimado', format: v => `$${(v ?? 0)?.toLocaleString()}`, group: 'Financiero' },
  { key: 'profileScore', label: 'Score de ficha', format: v => `${v ?? 0}%`, group: 'Perfil' },
  { key: 'plan', label: 'Plan actual', format: v => v ?? '—', group: 'Perfil' },
];

const METRIC_GROUPS = ['Tráfico', 'Engagement', 'Promociones', 'Lealtad', 'Financiero', 'Perfil'];

const TREND_ICON = {
  up: { icon: 'TrendingUp', color: 'text-emerald-500' },
  down: { icon: 'TrendingDown', color: 'text-red-500' },
  neutral: { icon: 'Minus', color: 'text-muted-foreground' }
};

const CHART_METRICS = [
  { value: 'visitsMonth', label: 'Visitas este mes' },
  { value: 'revenueMonth', label: 'Revenue estimado' },
  { value: 'activeCustomers', label: 'Clientes activos' },
  { value: 'retentionRate', label: 'Tasa de retención' },
  { value: 'profileScore', label: 'Score de ficha' },
  { value: 'pointsIssued', label: 'Puntos emitidos' },
  { value: 'couponsRedeemed', label: 'Cupones canjeados' },
];

const BUSINESS_COLORS = ['#f97316', '#ef4444', '#8b5cf6', '#0ea5e9', '#22c55e', '#ec4899', '#f59e0b'];

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-xl p-3 min-w-[140px]">
      <p className="text-xs font-bold text-foreground mb-1">{label}</p>
      {payload?.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">{entry?.name || 'Valor'}</span>
          <span className="text-xs font-bold" style={{ color: entry?.fill || entry?.color }}>
            {typeof entry?.value === 'number' ? entry?.value?.toLocaleString() : entry?.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const CompareTab = ({ establishments = [], monthlyTrend = [] }) => {
  const navigate = useNavigate();
  const [chartType, setChartType] = useState('bar');
  const [selectedMetric, setSelectedMetric] = useState('visitsMonth');
  const [activeGroup, setActiveGroup] = useState('Todos');
  const [selectedEstablishments, setSelectedEstablishments] = useState([]);

  // Determine which establishments to compare (all if none selected, up to 5)
  const compareList = useMemo(() => {
    if (selectedEstablishments?.length === 0) return establishments?.slice(0, 5);
    return establishments?.filter(e => selectedEstablishments?.includes(e?.id))?.slice(0, 5);
  }, [establishments, selectedEstablishments]);

  const toggleEstablishment = (id) => {
    setSelectedEstablishments(prev =>
      prev?.includes(id) ? prev?.filter(x => x !== id) : [...prev, id]
    );
  };

  const getMinMax = (key) => {
    const vals = compareList?.map(e => typeof e?.comparison?.[key] === 'number' ? e?.comparison?.[key] : null)?.filter(v => v !== null);
    if (vals?.length === 0) return { min: null, max: null };
    return { min: Math.min(...vals), max: Math.max(...vals) };
  };

  // Bar chart data
  const barData = useMemo(() => compareList?.map((e, i) => ({
    name: e?.name?.split(' ')?.[0] || e?.name,
    fullName: e?.name,
    value: typeof e?.comparison?.[selectedMetric] === 'number' ? e?.comparison?.[selectedMetric] : 0,
    color: BUSINESS_COLORS?.[i % BUSINESS_COLORS?.length],
  })), [compareList, selectedMetric]);

  // Radar data
  const radarMetrics = ['visitsMonth', 'activeCustomers', 'retentionRate', 'profileScore', 'couponsRedeemed'];
  const radarLabels = { visitsMonth: 'Visitas', activeCustomers: 'Clientes', retentionRate: 'Retención', profileScore: 'Ficha', couponsRedeemed: 'Cupones' };
  const radarData = useMemo(() => radarMetrics?.map(key => {
    const row = { metric: radarLabels?.[key] };
    const maxVal = Math.max(...compareList?.map(e => typeof e?.comparison?.[key] === 'number' ? e?.comparison?.[key] : 0), 1);
    compareList?.forEach((e, i) => {
      const shortName = e?.name?.split(' ')?.[0] || e?.name;
      row[shortName] = Math.round(((typeof e?.comparison?.[key] === 'number' ? e?.comparison?.[key] : 0) / maxVal) * 100);
    });
    return row;
  }), [compareList]);

  // Dynamic insights
  const insights = useMemo(() => {
    if (compareList?.length === 0) return [];
    const result = [];

    // Best performer by visits
    const byVisits = [...compareList]?.sort((a, b) => (b?.comparison?.visitsMonth || 0) - (a?.comparison?.visitsMonth || 0));
    if (byVisits?.[0]) {
      const avg = compareList?.reduce((s, e) => s + (e?.comparison?.visitsMonth || 0), 0) / compareList?.length;
      const ratio = avg > 0 ? ((byVisits?.[0]?.comparison?.visitsMonth || 0) / avg)?.toFixed(1) : '—';
      result?.push({
        business: byVisits?.[0],
        icon: 'TrendingUp',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        text: `${byVisits?.[0]?.name} lidera en visitas con ${(byVisits?.[0]?.comparison?.visitsMonth || 0)?.toLocaleString()} visitas/mes (${ratio}× el promedio del portafolio).`,
        cta: 'Ver promos activas',
        path: '/promotions-management',
      });
    }

    // Lowest profile score
    const byProfile = [...compareList]?.sort((a, b) => (a?.comparison?.profileScore || 0) - (b?.comparison?.profileScore || 0));
    if (byProfile?.[0] && (byProfile?.[0]?.comparison?.profileScore || 0) < 80) {
      result?.push({
        business: byProfile?.[0],
        icon: 'AlertCircle',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        text: `La ficha de ${byProfile?.[0]?.name} está ${byProfile?.[0]?.comparison?.profileScore || 0}% completa. Los negocios con ficha completa reciben 4× más visitas.`,
        cta: 'Completar ficha',
        path: '/business-listings-management',
      });
    }

    // Most dormant customers
    const byDormant = [...compareList]?.sort((a, b) => (b?.comparison?.dormantCustomers || 0) - (a?.comparison?.dormantCustomers || 0));
    if (byDormant?.[0] && (byDormant?.[0]?.comparison?.dormantCustomers || 0) > 0) {
      result?.push({
        business: byDormant?.[0],
        icon: 'UserMinus',
        color: 'text-red-600',
        bg: 'bg-red-50',
        text: `${byDormant?.[0]?.name} tiene ${byDormant?.[0]?.comparison?.dormantCustomers || 0} clientes dormidos. Actívalos con una campaña de reactivación.`,
        cta: 'Ver segmento Dormidos',
        path: '/crm-clients-list',
      });
    }

    // No active promos
    const noPromos = compareList?.filter(e => (e?.comparison?.activePromos || 0) === 0);
    if (noPromos?.[0]) {
      result?.push({
        business: noPromos?.[0],
        icon: 'Tag',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        text: `${noPromos?.[0]?.name} no tiene promos activas. Los establecimientos con al menos 1 promo activa generan 2× más visitas.`,
        cta: 'Crear promo',
        path: '/promotions-management',
      });
    }

    return result?.slice(0, 4);
  }, [compareList]);

  // Filtered metrics rows by group
  const filteredRows = activeGroup === 'Todos'
    ? METRICS_ROWS
    : METRICS_ROWS?.filter(r => r?.group === activeGroup);

  // Summary KPIs
  const totalVisits = compareList?.reduce((s, e) => s + (e?.comparison?.visitsMonth || 0), 0);
  const totalRevenue = compareList?.reduce((s, e) => s + (e?.comparison?.revenueMonth || 0), 0);
  const avgRetention = compareList?.length > 0
    ? Math.round(compareList?.reduce((s, e) => s + (e?.comparison?.retentionRate || 0), 0) / compareList?.length)
    : 0;
  const avgProfile = compareList?.length > 0
    ? Math.round(compareList?.reduce((s, e) => s + (e?.comparison?.profileScore || 0), 0) / compareList?.length)
    : 0;

  if (establishments?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
          <Icon name="GitCompare" size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">Sin establecimientos para comparar</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Agrega al menos 2 establecimientos para usar la comparativa.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Establishment selector */}
      {establishments?.length > 1 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-primary rounded-full" />
            <p className="text-sm font-semibold text-foreground">Seleccionar establecimientos a comparar</p>
            <span className="text-xs text-muted-foreground">(máx. 5)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {establishments?.map((e, i) => {
              const isSelected = selectedEstablishments?.length === 0 || selectedEstablishments?.includes(e?.id);
              const color = BUSINESS_COLORS?.[i % BUSINESS_COLORS?.length];
              return (
                <button
                  key={e?.id}
                  onClick={() => toggleEstablishment(e?.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    isSelected
                      ? 'border-transparent text-white shadow-sm'
                      : 'border-border text-muted-foreground bg-card hover:bg-muted'
                  }`}
                  style={isSelected ? { backgroundColor: color } : {}}
                >
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                    {e?.initial}
                  </span>
                  {e?.name?.split(' ')?.[0]}
                </button>
              );
            })}
            {selectedEstablishments?.length > 0 && (
              <button
                onClick={() => setSelectedEstablishments([])}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-muted-foreground border border-dashed border-border hover:bg-muted transition-colors"
              >
                <Icon name="X" size={12} />
                Limpiar selección
              </button>
            )}
          </div>
        </div>
      )}
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Visitas totales/mes', value: totalVisits?.toLocaleString(), icon: 'Users', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
          { label: 'Revenue total/mes', value: `$${(totalRevenue / 1000)?.toFixed(0)}k`, icon: 'DollarSign', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'Retención promedio', value: `${avgRetention}%`, icon: 'RefreshCw', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Score promedio ficha', value: `${avgProfile}%`, icon: 'Star', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
        ]?.map(kpi => (
          <div key={kpi?.label} className="bg-card border border-border rounded-xl p-4">
            <div className={`w-8 h-8 ${kpi?.bg} rounded-lg flex items-center justify-center mb-2`}>
              <Icon name={kpi?.icon} size={16} className={kpi?.color} />
            </div>
            <p className="text-xl font-bold text-foreground">{kpi?.value}</p>
            <p className="text-xs text-muted-foreground">{kpi?.label}</p>
          </div>
        ))}
      </div>
      {/* Charts */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h3 className="font-bold text-foreground">Gráficos comparativos</h3>
          </div>
          <div className="flex items-center gap-2">
            {[
              { v: 'bar', icon: 'BarChart2', label: 'Barras' },
              { v: 'line', icon: 'TrendingUp', label: 'Tendencia' },
              { v: 'radar', icon: 'Hexagon', label: 'Radar' }
            ]?.map(ct => (
              <button
                key={ct?.v}
                onClick={() => setChartType(ct?.v)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  chartType === ct?.v ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Icon name={ct?.icon} size={13} />
                {ct?.label}
              </button>
            ))}
          </div>
        </div>

        {chartType === 'bar' && (
          <div className="space-y-3">
            <select
              value={selectedMetric}
              onChange={e => setSelectedMetric(e?.target?.value)}
              className="text-sm bg-muted border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
            >
              {CHART_METRICS?.map(m => <option key={m?.value} value={m?.value}>{m?.label}</option>)}
            </select>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} name={CHART_METRICS?.find(m => m?.value === selectedMetric)?.label}>
                  {barData?.map((entry, i) => (
                    <Cell key={i} fill={entry?.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 justify-center pt-1">
              {compareList?.map((e, i) => (
                <div key={e?.id} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: BUSINESS_COLORS?.[i % BUSINESS_COLORS?.length] }} />
                  <span className="text-xs text-muted-foreground">{e?.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {chartType === 'line' && (
          <div>
            {monthlyTrend?.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={monthlyTrend} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {compareList?.map((e, i) => (
                    <Line
                      key={e?.id}
                      type="monotone"
                      dataKey={e?.name?.toLowerCase()?.replace(/\s+/g, '')}
                      stroke={BUSINESS_COLORS?.[i % BUSINESS_COLORS?.length]}
                      strokeWidth={2}
                      dot={false}
                      name={e?.name}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Icon name="TrendingUp" size={32} className="mb-2 opacity-30" />
                <p className="text-sm">No hay datos de tendencia disponibles</p>
              </div>
            )}
          </div>
        )}

        {chartType === 'radar' && (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
              <PolarRadiusAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} domain={[0, 100]} />
              {compareList?.map((e, i) => {
                const shortName = e?.name?.split(' ')?.[0] || e?.name;
                return (
                  <Radar
                    key={e?.id}
                    name={e?.name}
                    dataKey={shortName}
                    stroke={BUSINESS_COLORS?.[i % BUSINESS_COLORS?.length]}
                    fill={BUSINESS_COLORS?.[i % BUSINESS_COLORS?.length]}
                    fillOpacity={0.15}
                  />
                );
              })}
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
      {/* Comparative table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h3 className="font-bold text-foreground">Tabla comparativa</h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Group filter */}
            <div className="flex items-center gap-1 flex-wrap">
              {['Todos', ...METRIC_GROUPS]?.map(g => (
                <button
                  key={g}
                  onClick={() => setActiveGroup(g)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                    activeGroup === g
                      ? 'border-primary bg-primary/10 text-primary' :'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <button
              onClick={() => {}}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg transition-colors"
            >
              <Icon name="Download" size={15} />
              Exportar
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 w-44 sticky left-0 bg-muted/30">Métrica</th>
                {compareList?.map((e, i) => (
                  <th key={e?.id} className="text-center px-3 py-3 min-w-[110px]">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: BUSINESS_COLORS?.[i % BUSINESS_COLORS?.length] }}
                      >
                        {e?.initial}
                      </div>
                      <span className="text-xs font-semibold text-foreground truncate max-w-[90px]">{e?.name?.split(' ')?.[0]}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRows?.map((row, rowIdx) => {
                const { min, max } = getMinMax(row?.key);
                const isGroupHeader = rowIdx === 0 || filteredRows?.[rowIdx - 1]?.group !== row?.group;
                return (
                  <React.Fragment key={row?.key}>
                    {isGroupHeader && activeGroup === 'Todos' && (
                      <tr className="bg-muted/50">
                        <td colSpan={compareList?.length + 1} className="px-4 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          {row?.group}
                        </td>
                      </tr>
                    )}
                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5 text-xs font-medium text-muted-foreground sticky left-0 bg-card">{row?.label}</td>
                      {compareList?.map((e, i) => {
                        const val = e?.comparison?.[row?.key];
                        const numVal = typeof val === 'number' ? val : null;
                        const isMax = numVal !== null && numVal === max && max !== min && max > 0;
                        const isMin = numVal !== null && numVal === min && max !== min && min >= 0;
                        const trend = e?.comparison?.trend?.[row?.key];
                        const trendCfg = trend ? TREND_ICON?.[trend] : null;
                        return (
                          <td
                            key={e?.id}
                            className={`px-3 py-2.5 text-center ${
                              isMax ? 'bg-emerald-50 dark:bg-emerald-950/20' :
                              isMin && row?.key !== 'dormantCustomers' ? 'bg-red-50 dark:bg-red-950/20' : ''
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1">
                              <span className={`text-sm font-semibold ${isMax ? 'text-emerald-700 dark:text-emerald-400' : 'text-foreground'}`}>
                                {row?.format(val)}
                              </span>
                              {trendCfg && <Icon name={trendCfg?.icon} size={12} className={trendCfg?.color} />}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-border bg-muted/20 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
            <span>Mejor valor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-100 border border-red-300" />
            <span>Valor más bajo</span>
          </div>
        </div>
      </div>
      {/* Insights */}
      {insights?.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-amber-500 rounded-full" />
            <h3 className="font-bold text-foreground">💡 Insights automáticos</h3>
            <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">{insights?.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {insights?.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl border border-border hover:border-primary/30 transition-colors">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${insight?.bg}`}
                >
                  <Icon name={insight?.icon} size={16} className={insight?.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">{insight?.text}</p>
                  <button
                    onClick={() => navigate(insight?.path)}
                    className="mt-2 text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    {insight?.cta}
                    <Icon name="ArrowRight" size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompareTab;
