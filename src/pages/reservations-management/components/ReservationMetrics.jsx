import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { supabase } from '../../../lib/supabase';

const ReservationMetrics = ({ businessId, refreshTrigger }) => {
  const [metrics, setMetrics] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)?.toISOString()?.split('T')?.[0],
    end: new Date()?.toISOString()?.split('T')?.[0]
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, [businessId, dateRange, refreshTrigger]);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      // Load reservations for the date range
      const { data: reservations, error: reservationsError } = await supabase?.from('reservations')?.select('*')?.eq('business_id', businessId)?.gte('reservation_date', dateRange?.start)?.lte('reservation_date', dateRange?.end);

      if (reservationsError) throw reservationsError;

      // Calculate metrics
      const totalReservations = reservations?.length || 0;
      const confirmedReservations = reservations?.filter(r => r?.status === 'confirmed')?.length || 0;
      const completedReservations = reservations?.filter(r => r?.status === 'completed')?.length || 0;
      const noShowCount = reservations?.filter(r => r?.status === 'no_show')?.length || 0;
      const cancelledCount = reservations?.filter(r => r?.status === 'cancelled')?.length || 0;

      const occupancyRate = totalReservations > 0
        ? ((completedReservations / totalReservations) * 100)?.toFixed(2)
        : 0;

      const noShowRate = totalReservations > 0
        ? ((noShowCount / totalReservations) * 100)?.toFixed(2)
        : 0;

      const conversionRate = totalReservations > 0
        ? ((completedReservations / totalReservations) * 100)?.toFixed(2)
        : 0;

      // Revenue calculation (assuming advance_payment_amount)
      const revenueGenerated = reservations?.reduce((sum, r) => sum + (parseFloat(r?.advance_payment_amount) || 0), 0);

      // Group by date for trend chart
      const reservationsByDate = {};
      reservations?.forEach(r => {
        const date = r?.reservation_date;
        if (!reservationsByDate?.[date]) {
          reservationsByDate[date] = { date, count: 0, completed: 0, noShow: 0, cancelled: 0 };
        }
        reservationsByDate[date].count++;
        if (r?.status === 'completed') reservationsByDate[date].completed++;
        if (r?.status === 'no_show') reservationsByDate[date].noShow++;
        if (r?.status === 'cancelled') reservationsByDate[date].cancelled++;
      });

      const trendData = Object.values(reservationsByDate)?.sort((a, b) => a?.date?.localeCompare(b?.date));

      // Group by hour for peak hours
      const reservationsByHour = {};
      reservations?.forEach(r => {
        const hour = r?.reservation_time?.split(':')?.[0];
        reservationsByHour[hour] = (reservationsByHour?.[hour] || 0) + 1;
      });

      const peakHour = Object.entries(reservationsByHour)?.sort((a, b) => b?.[1] - a?.[1])?.[0];

      // Status distribution
      const statusDistribution = [
        { name: 'Pendiente', value: reservations?.filter(r => r?.status === 'pending')?.length, color: '#FFA500' },
        { name: 'Confirmada', value: confirmedReservations, color: '#45B7D1' },
        { name: 'Completada', value: completedReservations, color: '#2ECC71' },
        { name: 'No-Show', value: noShowCount, color: '#E74C3C' },
        { name: 'Cancelada', value: cancelledCount, color: '#95A5A6' }
      ];

      // Customer reservation history
      const { data: customerHistory, error: historyError } = await supabase?.from('customer_reservation_history')?.select('*')?.eq('business_id', businessId)?.order('total_reservations', { ascending: false })?.limit(10);

      if (historyError) throw historyError;

      setMetrics({
        totalReservations,
        confirmedReservations,
        completedReservations,
        noShowCount,
        cancelledCount,
        occupancyRate,
        noShowRate,
        conversionRate,
        revenueGenerated,
        peakHour: peakHour ? `${peakHour?.[0]}:00` : 'N/A',
        trendData,
        statusDistribution,
        customerHistory: customerHistory || [],
        hourlyData: Object.entries(reservationsByHour)?.map(([hour, count]) => ({
          hour: `${hour}:00`,
          reservas: count
        }))?.sort((a, b) => a?.hour?.localeCompare(b?.hour))
      });
    } catch (error) {
      console.error('Error loading metrics:', error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center text-muted-foreground py-8">Cargando métricas...</div>;
  }

  if (!metrics) {
    return <div className="text-center text-muted-foreground py-8">No hay datos disponibles</div>;
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              label="Fecha Inicio"
              type="date"
              value={dateRange?.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e?.target?.value })}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <Input
              label="Fecha Fin"
              type="date"
              value={dateRange?.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e?.target?.value })}
            />
          </div>
          <Button onClick={loadMetrics} iconName="Search">
            Aplicar
          </Button>
        </div>
      </div>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Reservas</span>
            <span className="text-2xl">📅</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{metrics?.totalReservations}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Tasa de Ocupación</span>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-3xl font-bold text-success">{metrics?.occupancyRate}%</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">No-Show Rate</span>
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-3xl font-bold text-destructive">{metrics?.noShowRate}%</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Conversión</span>
            <span className="text-2xl">🎯</span>
          </div>
          <p className="text-3xl font-bold text-info">{metrics?.conversionRate}%</p>
        </div>
      </div>
      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Completadas</span>
            <span className="text-xl">✅</span>
          </div>
          <p className="text-2xl font-bold text-success">{metrics?.completedReservations}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Ingresos Generados</span>
            <span className="text-xl">💰</span>
          </div>
          <p className="text-2xl font-bold text-foreground">€{metrics?.revenueGenerated?.toFixed(2)}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Hora Pico</span>
            <span className="text-xl">⏰</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{metrics?.peakHour}</p>
        </div>
      </div>
      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="font-semibold text-foreground mb-4">Tendencia de Reservas</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics?.trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#4ECDC4" name="Total" />
              <Line type="monotone" dataKey="completed" stroke="#2ECC71" name="Completadas" />
              <Line type="monotone" dataKey="noShow" stroke="#E74C3C" name="No-Show" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="font-semibold text-foreground mb-4">Distribución por Estado</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics?.statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100)?.toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {metrics?.statusDistribution?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry?.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Hourly Distribution */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="font-semibold text-foreground mb-4">Distribución por Hora</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={metrics?.hourlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="reservas" fill="#45B7D1" name="Reservas" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Top Customers */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="font-semibold text-foreground mb-4">Top 10 Clientes por Reservas</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cliente</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Completadas</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">No-Show</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {metrics?.customerHistory?.map((customer, index) => (
                <tr key={index} className="border-b border-border hover:bg-muted/30">
                  <td className="py-3 px-4 text-sm text-foreground">
                    Cliente #{customer?.customer_id?.slice(0, 8)}
                  </td>
                  <td className="text-center py-3 px-4 text-sm text-foreground">
                    {customer?.total_reservations}
                  </td>
                  <td className="text-center py-3 px-4 text-sm text-success">
                    {customer?.completed_reservations}
                  </td>
                  <td className="text-center py-3 px-4 text-sm text-destructive">
                    {customer?.no_show_count}
                  </td>
                  <td className="text-center py-3 px-4 text-sm text-info">
                    {customer?.total_points_earned - customer?.total_points_penalty}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReservationMetrics;