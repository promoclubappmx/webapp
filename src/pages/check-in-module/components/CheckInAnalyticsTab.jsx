import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';

const METHOD_COLORS = {
  qr_static: '#3b82f6',
  qr_dynamic: '#6366f1',
  geofence: '#10b981',
  manual: '#8b5cf6',
  nfc: '#f97316',
  beacon: '#ec4899',
};

const METHOD_LABELS = {
  qr_static: 'QR Estático',
  qr_dynamic: 'QR Dinámico',
  geofence: 'Geofence',
  manual: 'Manual',
  nfc: 'NFC',
  beacon: 'Beacon',
};

const CheckInAnalyticsTab = ({ businessId }) => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ total: 0, avgDaily: 0, returnRate: 0, pointsAwarded: 0 });
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [methodDist, setMethodDist] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);

  const loadAnalytics = useCallback(async () => {
    if (!businessId) { setLoading(false); return; }
    try {
      setLoading(true);
      // Fetch checkins for current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)?.toISOString();
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())?.toISOString();

      const { data: allCheckins } = await supabase
        ?.from('checkins')
        ?.select('id, method, points_awarded, checkin_status, created_at, customer_id')
        ?.eq('business_id', businessId)
        ?.gte('created_at', startOfMonth)
        ?.order('created_at', { ascending: true });

      const checkins = allCheckins || [];

      // KPIs
      const total = checkins?.length;
      const daysInMonth = now?.getDate();
      const avgDaily = daysInMonth > 0 ? Math.round(total / daysInMonth) : 0;
      const totalPoints = checkins?.reduce((s, c) => s + (c?.points_awarded || 0), 0);

      // Return rate: customers with more than 1 checkin / total unique customers
      const customerCounts = {};
      checkins?.forEach(c => { if (c?.customer_id) customerCounts[c?.customer_id] = (customerCounts?.[c?.customer_id] || 0) + 1; });
      const uniqueCustomers = Object.keys(customerCounts)?.length;
      const returningCustomers = Object.values(customerCounts)?.filter(v => v > 1)?.length;
      const returnRate = uniqueCustomers > 0 ? Math.round((returningCustomers / uniqueCustomers) * 100) : 0;

      setKpis({ total, avgDaily, returnRate, pointsAwarded: totalPoints });

      // Weekly data (last 7 days)
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const weekMap = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d?.setDate(d?.getDate() - i);
        const key = d?.toISOString()?.split('T')?.[0];
        weekMap[key] = { day: dayNames?.[d?.getDay()], checkins: 0 };
      }
      checkins?.forEach(c => {
        const day = c?.created_at?.split('T')?.[0];
        if (weekMap?.[day]) weekMap[day].checkins++;
      });
      setWeeklyData(Object.values(weekMap));

      // Monthly data (by week)
      const weekBuckets = [
        { week: 'Sem 1', checkins: 0 },
        { week: 'Sem 2', checkins: 0 },
        { week: 'Sem 3', checkins: 0 },
        { week: 'Sem 4', checkins: 0 },
      ];
      checkins?.forEach(c => {
        const day = new Date(c?.created_at)?.getDate();
        const idx = Math.min(Math.floor((day - 1) / 7), 3);
        weekBuckets[idx].checkins++;
      });
      setMonthlyData(weekBuckets);

      // Method distribution
      const methodMap = {};
      checkins?.forEach(c => {
        if (c?.method) methodMap[c?.method] = (methodMap?.[c?.method] || 0) + 1;
      });
      setMethodDist(
        Object.entries(methodMap)?.map(([method, value]) => ({
          name: METHOD_LABELS?.[method] || method,
          value,
          color: METHOD_COLORS?.[method] || '#94a3b8',
        }))
      );

      // Hourly distribution
      const hourMap = {};
      for (let h = 8; h <= 22; h += 2) {
        hourMap[h] = { hour: `${h > 12 ? h - 12 : h}${h >= 12 ? 'pm' : 'am'}`, checkins: 0 };
      }
      checkins?.forEach(c => {
        let h = new Date(c?.created_at)?.getHours();
        const bucket = Math.floor(h / 2) * 2;
        if (hourMap?.[bucket]) hourMap[bucket].checkins++;
      });
      setHourlyData(Object.values(hourMap));

    } catch (err) {
      console.error('Error loading check-in analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const TOTAL_DIST = methodDist?.reduce((a, b) => a + b?.value, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Icon name="Loader2" size={28} className="text-primary animate-spin mr-3" />
        <span className="text-muted-foreground">Cargando analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Check-ins este mes', value: kpis?.total?.toLocaleString(), icon: 'ScanLine', color: 'text-blue-600 bg-blue-50' },
          { label: 'Promedio diario', value: String(kpis?.avgDaily), icon: 'CalendarDays', color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Tasa de retorno', value: `${kpis?.returnRate}%`, icon: 'RefreshCw', color: 'text-purple-600 bg-purple-50' },
          { label: 'Puntos otorgados', value: kpis?.pointsAwarded?.toLocaleString(), icon: 'Coins', color: 'text-amber-600 bg-amber-50' },
        ]?.map((kpi, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi?.color}`}>
                <Icon name={kpi?.icon} size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{kpi?.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{kpi?.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly bar chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Check-ins por día (últimos 7 días)</h3>
          {weeklyData?.every(d => d?.checkins === 0) ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">Sin check-ins en los últimos 7 días</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} cursor={{ fill: 'var(--muted)', opacity: 0.3 }} />
                <Bar dataKey="checkins" fill="var(--primary)" radius={[6, 6, 0, 0]} name="Check-ins" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Method distribution pie */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Distribución por método</h3>
          {methodDist?.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">Sin datos de métodos</div>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <PieChart width={140} height={140}>
                  <Pie data={methodDist} cx={65} cy={65} innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                    {methodDist?.map((entry, i) => (
                      <Cell key={i} fill={entry?.color} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
              <div className="space-y-2">
                {methodDist?.map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: m?.color }} />
                      <span className="text-muted-foreground">{m?.name}</span>
                    </div>
                    <span className="font-semibold text-foreground">
                      {TOTAL_DIST > 0 ? Math.round((m?.value / TOTAL_DIST) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly trend */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Tendencia mensual</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="checkins" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: 'var(--primary)', r: 4 }} name="Check-ins" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly heatmap */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Horarios pico de check-in</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={hourlyData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="checkins" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Check-ins" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CheckInAnalyticsTab;
