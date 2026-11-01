import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const METRIC_COLORS = {
  impressions: '#2563EB',
  clicks: '#7C3AED',
  redemptions: '#059669',
  revenue: '#D97706',
};

const PromotionAnalyticsModal = ({ promotion, onClose }) => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    if (promotion?.id) {
      fetchAnalytics();
    }
  }, [promotion?.id, dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const days = dateRange === '7d' ? 7 : dateRange === '14d' ? 14 : dateRange === '30d' ? 30 : 90;
      const fromDate = new Date();
      fromDate?.setDate(fromDate?.getDate() - days);

      const { data, error: fetchError } = await supabase?.from('promotion_analytics')?.select('*')?.eq('promotion_id', promotion?.id)?.gte('date', fromDate?.toISOString()?.split('T')?.[0])?.order('date', { ascending: true });

      if (fetchError) throw fetchError;
      setAnalytics(data || []);
    } catch (err) {
      setError(err?.message || 'Error al cargar analíticas');
    } finally {
      setLoading(false);
    }
  };

  // Aggregate totals
  const totals = analytics?.reduce(
    (acc, row) => ({
      impressions: acc?.impressions + (row?.impressions || 0),
      clicks: acc?.clicks + (row?.clicks || 0),
      redemptions: acc?.redemptions + (row?.redemptions || 0),
      revenue: acc?.revenue + Number(row?.revenue_attributed || 0),
      pushSent: acc?.pushSent + (row?.push_sent || 0),
      pushOpened: acc?.pushOpened + (row?.push_opened || 0),
      uniqueVisitors: acc?.uniqueVisitors + (row?.unique_visitors || 0),
    }),
    { impressions: 0, clicks: 0, redemptions: 0, revenue: 0, pushSent: 0, pushOpened: 0, uniqueVisitors: 0 }
  );

  const ctr = totals?.impressions > 0 ? ((totals?.clicks / totals?.impressions) * 100)?.toFixed(1) : '0.0';
  const convRate = totals?.clicks > 0 ? ((totals?.redemptions / totals?.clicks) * 100)?.toFixed(1) : '0.0';
  const pushOpenRate = totals?.pushSent > 0 ? ((totals?.pushOpened / totals?.pushSent) * 100)?.toFixed(1) : '0.0';

  // Chart data — group by week if > 30 days
  const chartData = analytics?.map(row => ({
    date: new Date(row?.date)?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
    Impresiones: row?.impressions || 0,
    Clics: row?.clicks || 0,
    Canjes: row?.redemptions || 0,
    Revenue: Number(row?.revenue_attributed || 0),
  }));

  // Funnel data
  const funnelData = [
    { name: 'Impresiones', value: totals?.impressions, color: '#2563EB' },
    { name: 'Clics', value: totals?.clicks, color: '#7C3AED' },
    { name: 'Canjes', value: totals?.redemptions, color: '#059669' },
  ];

  const kpis = [
    { label: 'Impresiones', value: totals?.impressions?.toLocaleString(), icon: 'Eye', color: 'text-blue-600', bg: 'bg-blue-50', change: '+12%' },
    { label: 'Clics', value: totals?.clicks?.toLocaleString(), icon: 'MousePointerClick', color: 'text-purple-600', bg: 'bg-purple-50', change: '+8%' },
    { label: 'Canjes', value: totals?.redemptions?.toLocaleString(), icon: 'Ticket', color: 'text-green-600', bg: 'bg-green-50', change: '+15%' },
    { label: 'Revenue', value: `$${totals?.revenue?.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`, icon: 'DollarSign', color: 'text-amber-600', bg: 'bg-amber-50', change: '+20%' },
    { label: 'CTR', value: `${ctr}%`, icon: 'TrendingUp', color: 'text-cyan-600', bg: 'bg-cyan-50', change: `${ctr}%` },
    { label: 'Conv. Rate', value: `${convRate}%`, icon: 'BarChart2', color: 'text-rose-600', bg: 'bg-rose-50', change: `${convRate}%` },
    { label: 'Push enviados', value: totals?.pushSent?.toLocaleString(), icon: 'Bell', color: 'text-indigo-600', bg: 'bg-indigo-50', change: `${pushOpenRate}% apertura` },
    { label: 'Visitantes únicos', value: totals?.uniqueVisitors?.toLocaleString(), icon: 'Users', color: 'text-teal-600', bg: 'bg-teal-50', change: '+5%' },
  ];

  const getStatusColor = (status) => {
    const map = {
      active: 'bg-green-100 text-green-700',
      paused: 'bg-yellow-100 text-yellow-700',
      draft: 'bg-gray-100 text-gray-600',
      ended: 'bg-gray-100 text-gray-500',
    };
    return map?.[status] || 'bg-gray-100 text-gray-600';
  };

  const getStatusLabel = (status) => {
    const map = { active: 'Activa', paused: 'Pausada', draft: 'Borrador', ended: 'Finalizada' };
    return map?.[status] || status;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border flex-shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon name="BarChart3" size={22} className="text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-foreground">{promotion?.title}</h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(promotion?.status)}`}>
                  {getStatusLabel(promotion?.status)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Analíticas específicas de esta promoción</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Date range */}
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              {[
                { id: '7d', label: '7d' },
                { id: '14d', label: '14d' },
                { id: '30d', label: '30d' },
                { id: '90d', label: '90d' },
              ]?.map(r => (
                <button
                  key={r?.id}
                  onClick={() => setDateRange(r?.id)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    dateRange === r?.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {r?.label}
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Icon name="X" size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Cargando analíticas...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Icon name="AlertCircle" size={32} className="text-destructive mx-auto mb-3" />
                <p className="text-sm text-destructive">{error}</p>
                <button onClick={fetchAnalytics} className="mt-3 text-xs text-primary hover:underline">
                  Reintentar
                </button>
              </div>
            </div>
          ) : analytics?.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Icon name="BarChart3" size={40} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-base font-medium text-foreground mb-1">Sin datos aún</p>
                <p className="text-sm text-muted-foreground">Las analíticas aparecerán cuando la promoción tenga actividad.</p>
              </div>
            </div>
          ) : (
            <>
              {/* KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {kpis?.map((kpi, i) => (
                  <div key={i} className="bg-background border border-border rounded-xl p-4">
                    <div className={`w-8 h-8 rounded-lg ${kpi?.bg} flex items-center justify-center mb-2`}>
                      <Icon name={kpi?.icon} size={16} className={kpi?.color} />
                    </div>
                    <div className="text-xl font-bold text-foreground">{kpi?.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{kpi?.label}</div>
                    <div className="text-xs text-green-600 font-medium mt-1">{kpi?.change}</div>
                  </div>
                ))}
              </div>

              {/* Trend Chart */}
              <div className="bg-background border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Tendencia diaria</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Impresiones" stroke={METRIC_COLORS?.impressions} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Clics" stroke={METRIC_COLORS?.clicks} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Canjes" stroke={METRIC_COLORS?.redemptions} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue + Funnel row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Revenue bar chart */}
                <div className="bg-background border border-border rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Revenue atribuido (MXN)</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData?.slice(-14)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000)?.toFixed(0)}k`} />
                      <Tooltip formatter={v => [`$${Number(v)?.toLocaleString()}`, 'Revenue']} />
                      <Bar dataKey="Revenue" fill="#D97706" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Funnel */}
                <div className="bg-background border border-border rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Embudo de conversión</h3>
                  <div className="space-y-3 mt-2">
                    {funnelData?.map((item, i) => {
                      const pct = funnelData?.[0]?.value > 0
                        ? Math.round((item?.value / funnelData?.[0]?.value) * 100)
                        : 0;
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{item?.name}</span>
                            <span className="font-semibold text-foreground">{item?.value?.toLocaleString()} ({pct}%)</span>
                          </div>
                          <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: item?.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Push stats */}
                  {totals?.pushSent > 0 && (
                    <div className="mt-5 pt-4 border-t border-border">
                      <p className="text-xs font-medium text-foreground mb-2">Push notifications</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-base font-bold text-foreground">{totals?.pushSent?.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Enviados</div>
                        </div>
                        <div>
                          <div className="text-base font-bold text-foreground">{totals?.pushOpened?.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Abiertos</div>
                        </div>
                        <div>
                          <div className="text-base font-bold text-indigo-600">{pushOpenRate}%</div>
                          <div className="text-xs text-muted-foreground">Tasa apertura</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Daily breakdown table */}
              <div className="bg-background border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Desglose diario (últimos 7 días)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Fecha</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Impresiones</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Clics</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Canjes</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Revenue</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">CTR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics?.slice(-7)?.reverse()?.map((row, i) => {
                        const rowCtr = row?.impressions > 0
                          ? ((row?.clicks / row?.impressions) * 100)?.toFixed(1)
                          : '0.0';
                        return (
                          <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="py-2 px-3 text-foreground">
                              {new Date(row?.date)?.toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short' })}
                            </td>
                            <td className="py-2 px-3 text-right text-foreground">{row?.impressions?.toLocaleString()}</td>
                            <td className="py-2 px-3 text-right text-foreground">{row?.clicks?.toLocaleString()}</td>
                            <td className="py-2 px-3 text-right text-foreground">{row?.redemptions?.toLocaleString()}</td>
                            <td className="py-2 px-3 text-right text-foreground">${Number(row?.revenue_attributed)?.toLocaleString('es-MX', { minimumFractionDigits: 0 })}</td>
                            <td className="py-2 px-3 text-right">
                              <span className={`font-medium ${parseFloat(rowCtr) >= 5 ? 'text-green-600' : 'text-muted-foreground'}`}>
                                {rowCtr}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border flex-shrink-0 bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Datos actualizados en tiempo real desde Supabase
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromotionAnalyticsModal;
