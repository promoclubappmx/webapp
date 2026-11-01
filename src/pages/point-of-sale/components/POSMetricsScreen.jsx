import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';

const POSMetricsScreen = ({ selectedEstablishment, establishments }) => {
  const [period, setPeriod] = useState('today');
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, [selectedEstablishment, period]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      let query = supabase?.from('pos_transactions')?.select('total_amount, subtotal, tax_amount, discount_amount, payment_method, status, created_at')?.eq('status', 'completed');

      if (selectedEstablishment && selectedEstablishment !== 'all') {
        query = query?.eq('business_id', selectedEstablishment);
      }

      const now = new Date();
      if (period === 'today') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())?.toISOString();
        query = query?.gte('created_at', start);
      } else if (period === 'week') {
        const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)?.toISOString();
        query = query?.gte('created_at', start);
      } else if (period === 'month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1)?.toISOString();
        query = query?.gte('created_at', start);
      }

      const { data, error } = await query;

      if (!error && data) {
        const totalSales = data?.reduce((sum, t) => sum + (parseFloat(t?.total_amount) || 0), 0);
        const totalTax = data?.reduce((sum, t) => sum + (parseFloat(t?.tax_amount) || 0), 0);
        const totalDiscount = data?.reduce((sum, t) => sum + (parseFloat(t?.discount_amount) || 0), 0);
        const avgTicket = data?.length > 0 ? totalSales / data?.length : 0;

        // Payment methods breakdown
        const paymentBreakdown = data?.reduce((acc, t) => {
          const method = t?.payment_method || 'other';
          if (!acc?.[method]) acc[method] = { count: 0, amount: 0 };
          acc[method].count += 1;
          acc[method].amount += parseFloat(t?.total_amount) || 0;
          return acc;
        }, {});

        // Hourly data (for today)
        const hourlyData = {};
        if (period === 'today') {
          for (let h = 0; h < 24; h++) {
            hourlyData[h] = 0;
          }
          data?.forEach(t => {
            const hour = new Date(t.created_at)?.getHours();
            hourlyData[hour] = (hourlyData?.[hour] || 0) + (parseFloat(t?.total_amount) || 0);
          });
        }

        setMetrics({
          totalSales,
          transactions: data?.length,
          avgTicket,
          totalTax,
          totalDiscount,
          paymentBreakdown,
          hourlyData: period === 'today' ? Object.entries(hourlyData)?.map(([h, v]) => ({ hour: `${String(h)?.padStart(2, '0')}:00`, sales: v }))?.filter(d => d?.sales > 0) : [],
        });
      }
    } catch (err) {
      console.error('Error loading metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const paymentLabels = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia', mixed: 'Mixto' };
  const paymentIcons = { cash: 'Banknote', card: 'CreditCard', transfer: 'ArrowRightLeft', mixed: 'Split' };

  const kpiCards = [
    {
      title: 'Total Ventas',
      value: `$${(metrics?.totalSales || 0)?.toFixed(2)}`,
      icon: 'TrendingUp',
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Transacciones',
      value: metrics?.transactions || 0,
      icon: 'Receipt',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Ticket Promedio',
      value: `$${(metrics?.avgTicket || 0)?.toFixed(2)}`,
      icon: 'ShoppingCart',
      color: 'text-amber-600',
      bg: 'bg-amber-500/10',
    },
    {
      title: 'Total Impuestos',
      value: `$${(metrics?.totalTax || 0)?.toFixed(2)}`,
      icon: 'FileText',
      color: 'text-violet-600',
      bg: 'bg-violet-500/10',
    },
  ];

  const maxHourlySales = metrics?.hourlyData?.length > 0
    ? Math.max(...metrics?.hourlyData?.map(d => d?.sales))
    : 1;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center gap-2 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'today', label: 'Hoy' },
          { id: 'week', label: 'Semana' },
          { id: 'month', label: 'Mes' },
        ]?.map(p => (
          <button
            key={p?.id}
            onClick={() => setPeriod(p?.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              period === p?.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {p?.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Cargando métricas...</p>
          </div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards?.map((kpi, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5">
                <div className={`w-10 h-10 rounded-lg ${kpi?.bg} flex items-center justify-center mb-4`}>
                  <Icon name={kpi?.icon} size={20} className={kpi?.color} />
                </div>
                <p className="text-xs text-muted-foreground mb-1">{kpi?.title}</p>
                <p className="text-2xl font-bold text-foreground">{kpi?.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Methods */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-5">
                <Icon name="CreditCard" size={18} className="text-primary" />
                <h3 className="font-semibold text-foreground">Métodos de Pago</h3>
              </div>
              {Object.keys(metrics?.paymentBreakdown || {})?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Icon name="CreditCard" size={28} className="text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Sin datos para este período</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(metrics?.paymentBreakdown || {})?.map(([method, data]) => (
                    <div key={method}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Icon name={paymentIcons?.[method] || 'DollarSign'} size={15} className="text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">{paymentLabels?.[method] || method}</span>
                          <span className="text-xs text-muted-foreground">({data?.count} txns)</span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">${data?.amount?.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-full rounded-full transition-all"
                          style={{ width: `${metrics?.totalSales > 0 ? (data?.amount / metrics?.totalSales) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-5">
                <Icon name="BarChart3" size={18} className="text-primary" />
                <h3 className="font-semibold text-foreground">Resumen Financiero</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Ventas Brutas', value: `$${(metrics?.totalSales || 0)?.toFixed(2)}`, color: 'text-foreground' },
                  { label: 'Descuentos Aplicados', value: `-$${(metrics?.totalDiscount || 0)?.toFixed(2)}`, color: 'text-rose-600' },
                  { label: 'Impuestos Recaudados', value: `$${(metrics?.totalTax || 0)?.toFixed(2)}`, color: 'text-violet-600' },
                  { label: 'Ticket Promedio', value: `$${(metrics?.avgTicket || 0)?.toFixed(2)}`, color: 'text-amber-600' },
                ]?.map((row, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{row?.label}</span>
                    <span className={`text-sm font-semibold ${row?.color}`}>{row?.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hourly Chart (today only) */}
          {period === 'today' && (
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-5">
                <Icon name="Clock" size={18} className="text-primary" />
                <h3 className="font-semibold text-foreground">Ventas por Hora</h3>
              </div>
              {metrics?.hourlyData?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Icon name="BarChart3" size={28} className="text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Sin ventas registradas hoy</p>
                </div>
              ) : (
                <div className="h-48 flex items-end justify-start gap-2 overflow-x-auto pb-2">
                  {metrics?.hourlyData?.map((data, i) => {
                    const heightPct = maxHourlySales > 0 ? (data?.sales / maxHourlySales) * 100 : 0;
                    return (
                      <div key={i} className="flex flex-col items-center gap-1.5 min-w-[40px] group">
                        <div className="relative w-full flex flex-col justify-end" style={{ height: '160px' }}>
                          <div
                            className="w-full bg-primary/80 hover:bg-primary rounded-t-md transition-all cursor-pointer"
                            style={{ height: `${Math.max(heightPct * 1.6, 4)}px` }}
                          />
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            ${data?.sales?.toFixed(2)}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{data?.hour}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default POSMetricsScreen;
