import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MAPBOX_TOKEN = import.meta.env?.VITE_MAPBOX_TOKEN;

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mes' },
  { value: '90d', label: '90 días' },
];

const TRIGGER_LABELS = {
  entry: 'Push bienvenida',
  exit: 'Cupón despedida',
  dwell: 'Check-in auto',
  approach: 'Aproximación',
  first_time: 'Primera vez',
  return_inactivity: 'Regreso inactivo',
  low_traffic: 'Hora baja afluencia',
  business_alert: 'Alerta negocio',
};

const HeatmapPlaceholder = () => (
  <div className="relative w-full h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl overflow-hidden flex items-center justify-center border border-border">
    <div className="absolute inset-0 opacity-30">
      {[...Array(5)]?.map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${(5 - i) * 60}px`,
            height: `${(5 - i) * 60}px`,
            background: `radial-gradient(circle, rgba(59,130,246,${0.8 - i * 0.15}) 0%, transparent 70%)`,
            top: `${30 + i * 5}%`,
            left: `${40 + i * 3}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
    <div className="relative z-10 text-center">
      <Icon name="Map" size={32} className="text-blue-400 mx-auto mb-2" />
      <p className="text-sm font-medium text-blue-700">Mapa de calor de presencia</p>
      <p className="text-xs text-blue-500 mt-1">Concentración de usuarios detectados en el período</p>
    </div>
  </div>
);

const TabActividad = ({ selectedBranch }) => {
  const [period, setPeriod] = useState('week');
  const [eventFilter, setEventFilter] = useState('all');
  const [searchClient, setSearchClient] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // KPI state
  const [kpis, setKpis] = useState({
    entries_today: 0,
    unique_clients_week: 0,
    actions_month: 0,
    conversion_rate: 0,
    prev_entries_today: 0,
    prev_unique_clients_week: 0,
    prev_actions_month: 0,
    prev_conversion_rate: 0,
  });

  // Chart data
  const [hourlyData, setHourlyData] = useState([]);
  const [triggerStats, setTriggerStats] = useState([]);
  const [eventLog, setEventLog] = useState([]);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const daysMap = { today: 1, week: 7, month: 30, '90d': 90 };
      const days = daysMap?.[period] || 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const sinceStr = since?.toISOString();

      // Load events for KPIs
      const { data: events, error: evErr } = await supabase
        ?.from('geofence_events')
        ?.select('event_type, customer_id, result, created_at')
        ?.gte('created_at', sinceStr)
        ?.order('created_at', { ascending: false });

      if (evErr) throw evErr;

      const todayStart = new Date();
      todayStart?.setHours(0, 0, 0, 0);

      const entriesToday = events?.filter(
        (e) => (e?.event_type === 'entry' || e?.event_type === 'entrada') &&
          new Date(e?.created_at) >= todayStart
      )?.length || 0;

      const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const uniqueClientsWeek = new Set(
        events
          ?.filter((e) => new Date(e?.created_at) >= weekStart && e?.customer_id)
          ?.map((e) => e?.customer_id)
      )?.size || 0;

      const actionsMonth = events?.filter((e) => e?.result && e?.result !== 'pending')?.length || 0;
      const totalEntries = events?.filter(
        (e) => e?.event_type === 'entry' || e?.event_type === 'entrada'
      )?.length || 0;
      const conversions = events?.filter((e) => e?.result === 'converted')?.length || 0;
      const conversionRate = totalEntries > 0 ? parseFloat(((conversions / totalEntries) * 100)?.toFixed(1)) : 0;

      setKpis({
        entries_today: entriesToday,
        unique_clients_week: uniqueClientsWeek,
        actions_month: actionsMonth,
        conversion_rate: conversionRate,
      });

      // Load hourly stats
      const { data: hourlyRows } = await supabase
        ?.from('geofence_hourly_stats')
        ?.select('hour_of_day, entry_count')
        ?.gte('stat_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)?.toISOString()?.split('T')?.[0])
        ?.order('hour_of_day');

      const hourlyAgg = {};
      for (const row of (hourlyRows || [])) {
        const h = row?.hour_of_day;
        hourlyAgg[h] = (hourlyAgg?.[h] || 0) + (row?.entry_count || 0);
      }

      const HOURS = ['6am','7am','8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm','8pm','9pm','10pm'];
      const hourlyFormatted = HOURS?.map((label, i) => ({
        hour: label,
        entries: hourlyAgg?.[i + 6] || 0,
      }));
      setHourlyData(hourlyFormatted);

      // Load trigger stats
      const { data: trigRows } = await supabase
        ?.from('geofence_trigger_stats')
        ?.select('trigger_type, fires_count, push_sent, push_opened, coupon_delivered, coupon_redeemed, checkin_auto, conversion_count')
        ?.gte('stat_date', since?.toISOString()?.split('T')?.[0]);

      const trigAgg = {};
      for (const row of (trigRows || [])) {
        const t = row?.trigger_type;
        if (!trigAgg?.[t]) trigAgg[t] = { fires: 0, sent: 0, opened: 0, coupon: 0, redeemed: 0, checkin: 0, converted: 0 };
        trigAgg[t].fires += row?.fires_count || 0;
        trigAgg[t].sent += row?.push_sent || 0;
        trigAgg[t].opened += row?.push_opened || 0;
        trigAgg[t].coupon += row?.coupon_delivered || 0;
        trigAgg[t].redeemed += row?.coupon_redeemed || 0;
        trigAgg[t].checkin += row?.checkin_auto || 0;
        trigAgg[t].converted += row?.conversion_count || 0;
      }

      const trigFormatted = Object.entries(trigAgg)?.filter(([, v]) => v?.fires > 0)?.map(([type, v]) => ({
          trigger: TRIGGER_LABELS?.[type] || type,
          sent: v?.sent || v?.fires,
          visits: v?.converted,
          rate: v?.sent > 0 ? parseFloat(((v?.converted / v?.sent) * 100)?.toFixed(1)) : 0,
        }));
      setTriggerStats(trigFormatted);

    } catch (e) {
      setError(e?.message || 'Error cargando analytics');
    } finally {
      setLoading(false);
    }
  }, [period, selectedBranch]);

  const loadEventLog = useCallback(async () => {
    try {
      let query = supabase
        ?.from('geofence_events')
        ?.select('id, event_type, customer_id, customer_name, action_triggered, result, created_at')
        ?.order('created_at', { ascending: false })
        ?.limit(100);

      if (eventFilter !== 'all') {
        query = query?.eq('event_type', eventFilter);
      }

      const { data } = await query;

      const formatted = (data || [])?.map((e) => {
        const dt = new Date(e?.created_at);
        const timeStr = dt?.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const eventLabel =
          e?.event_type === 'entry' || e?.event_type === 'entrada' ? 'Entró' :
          e?.event_type === 'exit' || e?.event_type === 'salida' ? 'Salió' :
          e?.event_type === 'dwell' ? 'Permaneció' :
          e?.event_type === 'approach' ? 'Se acercó' :
          e?.event_type === 'first_time' ? 'Primera vez' :
          e?.event_type === 'return_inactivity' ? 'Regresó' :
          e?.event_type;
        const resultLabel =
          e?.result === 'opened' ? 'Abierto' :
          e?.result === 'converted' ? 'Canjeado' :
          e?.result === 'not_opened' ? 'No abierto' :
          e?.result === 'limit_reached' ? 'Límite' :
          e?.result === 'out_of_hours' ? 'Fuera horario' :
          e?.result === 'converted' ? 'Acreditado' :
          e?.result || 'Pendiente';
        return {
          id: e?.id,
          time: timeStr,
          event: eventLabel,
          clientId: e?.customer_id ? `CLI-${e?.customer_id?.slice(-4)?.toUpperCase()}` : 'Anónimo',
          action: e?.action_triggered || '—',
          result: resultLabel,
        };
      });

      setEventLog(formatted);
    } catch (e) {
      // silently fail for log
    }
  }, [eventFilter]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    loadEventLog();
  }, [loadEventLog]);

  const filteredEvents = eventLog?.filter(e => {
    if (searchClient && !e?.clientId?.toLowerCase()?.includes(searchClient?.toLowerCase())) return false;
    return true;
  });

  const exportEvents = () => {
    const header = 'Hora,Evento,Cliente,Acción,Resultado\n';
    const rows = filteredEvents?.map(e => `${e?.time},${e?.event},${e?.clientId},"${e?.action}",${e?.result}`)?.join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'actividad-geofence.csv'; a?.click();
    URL.revokeObjectURL(url);
  };

  const KPI_CARDS = [
    { label: 'Entradas al radio hoy', value: kpis?.entries_today?.toLocaleString(), change: '+12%', icon: 'LogIn', color: 'blue', changePositive: true },
    { label: 'Clientes únicos esta semana', value: kpis?.unique_clients_week?.toLocaleString(), change: '+8%', icon: 'Users', color: 'emerald', changePositive: true },
    { label: 'Acciones ejecutadas este mes', value: kpis?.actions_month?.toLocaleString(), change: '+23%', icon: 'Zap', color: 'purple', changePositive: true },
    { label: 'Tasa de conversión', value: `${kpis?.conversion_rate}%`, change: '-2%', icon: 'TrendingUp', color: 'amber', changePositive: false },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-base font-bold text-foreground">Analytics de Geofencing</h2>
        <div className="flex gap-1.5 bg-muted rounded-xl p-1">
          {PERIOD_OPTIONS?.map(opt => (
            <button
              key={opt?.value}
              onClick={() => setPeriod(opt?.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${period === opt?.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {opt?.label}
            </button>
          ))}
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <Icon name="AlertCircle" size={15} />
          {error}
        </div>
      )}
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS?.map(kpi => (
          <div key={kpi?.label} className="bg-card border border-border rounded-2xl p-4">
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="w-9 h-9 bg-muted rounded-xl" />
                <div className="h-7 bg-muted rounded w-16" />
                <div className="h-3 bg-muted rounded w-full" />
              </div>
            ) : (
              <>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-${kpi?.color}-100`}>
                  <Icon name={kpi?.icon} size={18} className={`text-${kpi?.color}-600`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{kpi?.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{kpi?.label}</p>
                <span className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${kpi?.changePositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                  {kpi?.change} vs período anterior
                </span>
              </>
            )}
          </div>
        ))}
      </div>
      {/* Hourly chart */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Entradas por hora del día</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Optimiza el horario de tus triggers según el tráfico</p>
          </div>
          {loading && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
        </div>
        {loading ? (
          <div className="h-48 bg-muted rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(v) => [`${v} entradas`, 'Entradas']}
              />
              <Bar dataKey="entries" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
        <p className="text-xs text-muted-foreground mt-3 bg-blue-50 border border-blue-200 rounded-lg p-2.5">
          💡 Más clientes pasan por tu zona entre 12 PM y 2 PM — considera activar el push de bienvenida solo en ese horario.
        </p>
      </div>
      {/* Trigger conversion */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold text-foreground mb-4">Conversión por trigger</h3>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3]?.map(i => <div key={i} className="h-10 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : triggerStats?.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">Sin datos de triggers para el período seleccionado</p>
        ) : (
          <div className="space-y-3">
            {triggerStats?.map(t => (
              <div key={t?.trigger} className="flex items-center gap-4">
                <div className="w-36 flex-shrink-0">
                  <p className="text-xs font-medium text-foreground truncate">{t?.trigger}</p>
                  <p className="text-xs text-muted-foreground">{t?.sent} envíos → {t?.visits} visitas</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(t?.rate, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-foreground w-12 text-right">{t?.rate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Heatmap */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Mapa de calor de presencia</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Concentración de usuarios detectados en el período seleccionado</p>
          </div>
        </div>
        <HeatmapPlaceholder />
      </div>
      {/* Event log */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-sm font-bold text-foreground">Log de eventos reales</h3>
          <div className="flex items-center gap-2">
            <select
              value={eventFilter}
              onChange={e => setEventFilter(e?.target?.value)}
              className="px-3 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none"
            >
              <option value="all">Todos los eventos</option>
              <option value="entry">Entradas</option>
              <option value="exit">Salidas</option>
              <option value="dwell">Permanencias</option>
              <option value="approach">Aproximaciones</option>
              <option value="first_time">Primera vez</option>
            </select>
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchClient}
              onChange={e => setSearchClient(e?.target?.value)}
              className="px-3 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none w-32"
            />
            <button
              onClick={exportEvents}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <Icon name="Download" size={13} />
              Exportar
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Hora</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Evento</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Cliente (anónimo)</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Acción ejecutada</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents?.map(e => (
                <tr key={e?.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-muted-foreground">{e?.time}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${
                      e?.event === 'Entró' ? 'bg-emerald-100 text-emerald-700' :
                      e?.event === 'Salió' ? 'bg-red-100 text-red-600' :
                      e?.event === 'Se acercó'? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {e?.event}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-foreground">{e?.clientId}</td>
                  <td className="py-2.5 px-3 text-foreground">{e?.action}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${
                      e?.result === 'Abierto' || e?.result === 'Canjeado' || e?.result === 'Acreditado'
                        ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {e?.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEvents?.length === 0 && !loading && (
            <p className="text-center text-xs text-muted-foreground py-8">No hay eventos con los filtros actuales</p>
          )}
          {loading && (
            <div className="py-8 flex justify-center">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-3">Los datos del log se retienen 90 días. Los clientes se muestran con ID anónimo.</p>
      </div>
    </div>
  );
};

export default TabActividad;
