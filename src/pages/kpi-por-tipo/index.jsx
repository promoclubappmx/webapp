import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../components/AppIcon';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import { MOCK_ESTABLISHMENTS } from '../establishments-portfolio/components/mockData';

const CATEGORY_FILTERS = [
  { key: 'Todos', label: 'Todos', icon: 'LayoutGrid' },
  { key: 'Restaurantes y comida', label: 'Restaurantes', icon: 'UtensilsCrossed' },
  { key: 'Compras y retail', label: 'Retail', icon: 'ShoppingBag' },
  { key: 'Salud y medicina', label: 'Salud', icon: 'Heart' },
  { key: 'Belleza y cuidado personal', label: 'Belleza', icon: 'Sparkles' },
  { key: 'Deporte y fitness', label: 'Fitness', icon: 'Dumbbell' },
  { key: 'Mascotas', label: 'Mascotas', icon: 'PawPrint' },
];

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

const KpiPorTipo = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activeMetric, setActiveMetric] = useState('visitsMonth');

  const mockUser = {
    id: 1,
    name: 'Carlos Mendoza',
    email: 'carlos@promospot.com',
    role: 'owner',
    business: 'Mi Portafolio',
  };

  const selectedMetric = METRIC_OPTIONS?.find(m => m?.key === activeMetric);

  // Filter establishments by category
  const filteredEstablishments = useMemo(() => {
    if (activeCategory === 'Todos') return MOCK_ESTABLISHMENTS;
    return MOCK_ESTABLISHMENTS?.filter(e => e?.category === activeCategory);
  }, [activeCategory]);

  // Group by tipo and compute aggregated KPIs
  const tipoData = useMemo(() => {
    const grouped = {};
    filteredEstablishments?.forEach(e => {
      const tipo = e?.tipo || e?.subcategory || 'Sin tipo';
      if (!grouped?.[tipo]) {
        grouped[tipo] = {
          tipo,
          categoria: e?.category,
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
  }, [filteredEstablishments, activeMetric]);

  // Chart data (top 8 tipos)
  const chartData = useMemo(() => {
    return tipoData?.slice(0, 8)?.map(t => ({
      name: t?.tipo?.length > 18 ? t?.tipo?.substring(0, 16) + '…' : t?.tipo,
      fullName: t?.tipo,
      [activeMetric]: t?.[activeMetric],
    }));
  }, [tipoData, activeMetric]);

  // Summary KPIs
  const totalVisits = filteredEstablishments?.reduce((s, e) => s + (e?.kpis?.visitsMonth || 0), 0);
  const totalRevenue = filteredEstablishments?.reduce((s, e) => s + (e?.revenueMonth || 0), 0);
  const totalCustomers = filteredEstablishments?.reduce((s, e) => s + (e?.metrics?.activeCustomers30d || 0), 0);
  const avgProfile = filteredEstablishments?.length > 0
    ? Math.round(filteredEstablishments?.reduce((s, e) => s + (e?.kpis?.profileScore || 0), 0) / filteredEstablishments?.length)
    : 0;

  const availableCategories = new Set(MOCK_ESTABLISHMENTS?.map(e => e?.category));
  const visibleFilters = CATEGORY_FILTERS?.filter(f => f?.key === 'Todos' || availableCategories?.has(f?.key));

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={mockUser}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={mockUser}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main
        className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
        style={{ transitionProperty: 'margin-left', transitionDuration: '500ms', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        <div className="p-4 sm:p-6 max-w-screen-2xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={() => navigate('/establishments-portfolio')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon name="ArrowLeft" size={18} />
                </button>
                <h1 className="text-2xl font-bold text-foreground">KPI por Tipo de Establecimiento</h1>
              </div>
              <p className="text-sm text-muted-foreground ml-7">
                Compara el rendimiento de tus establecimientos agrupados por tipo
              </p>
            </div>
          </div>

          {/* Category segment filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {visibleFilters?.map(f => (
              <button
                key={f?.key}
                onClick={() => setActiveCategory(f?.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 border ${
                  activeCategory === f?.key
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                }`}
              >
                <Icon name={f?.icon} size={13} />
                {f?.label}
              </button>
            ))}
          </div>

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
              {/* Metric selector pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {METRIC_OPTIONS?.map(m => (
                  <button
                    key={m?.key}
                    onClick={() => setActiveMetric(m?.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      activeMetric === m?.key
                        ? 'border-primary bg-primary/10 text-primary' :'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon name={m?.icon} size={12} />
                    {m?.label}
                  </button>
                ))}
              </div>
            </div>

            {chartData?.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
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
                  <Tooltip
                    content={<CustomTooltip metricFormat={selectedMetric?.format} />}
                  />
                  <Bar
                    dataKey={activeMetric}
                    name={selectedMetric?.label}
                    fill={selectedMetric?.color}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Icon name="BarChart2" size={40} className="mb-3 opacity-30" />
                <p className="text-sm">No hay datos para la categoría seleccionada</p>
              </div>
            )}
          </div>

          {/* KPI Table by tipo */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 p-5 border-b border-border">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h3 className="text-base font-semibold text-foreground">Detalle por tipo de establecimiento</h3>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{tipoData?.length} tipos</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Tipo</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Categoría</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Establec.</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Visitas/mes</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Revenue/mes</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Clientes</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Score</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {tipoData?.map((row, i) => (
                    <tr key={row?.tipo} className={`border-b border-border transition-colors hover:bg-muted/30 ${i === 0 ? 'bg-primary/5' : ''}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {i === 0 && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">#1</span>}
                          <span className="font-medium text-foreground">{row?.tipo}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{row?.categoria}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-foreground font-medium">{row?.count}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold ${row?.visitsMonth > 0 ? 'text-indigo-600' : 'text-muted-foreground'}`}>
                          {row?.visitsMonth?.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold ${row?.revenueMonth > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                          {row?.revenueMonth > 0 ? `$${(row?.revenueMonth / 1000)?.toFixed(0)}k` : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-foreground">{row?.activeCustomers?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-muted rounded-full h-1.5">
                            <div
                              className="bg-pink-500 h-1.5 rounded-full"
                              style={{ width: `${row?.profileScore}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-8 text-right">{row?.profileScore}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row?.rating > 0 ? (
                          <span className="flex items-center justify-end gap-1 text-amber-600 font-semibold">
                            ⭐ {row?.rating}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default KpiPorTipo;
