import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import { useCurrency } from '../../../contexts/CurrencyContext';

const PDVDashboard = ({ userId, establishments, selectedEstablishment, onOpenTerminal }) => {
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [hourlySales, setHourlySales] = useState({});
  const { formatPrice } = useCurrency();

  const loadTerminals = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    try {
      const { data, error } = await supabase?.rpc('get_terminal_with_session', { p_user_id: userId });
      if (error) throw error;
      setTerminals(data || []);
      setLastUpdated(new Date());
    } catch {
      try {
        const { data, error: err2 } = await supabase
          ?.from('pos_terminals')
          ?.select('id, name, serial_number, location_id, is_active, created_at, business_locations(name)')
          ?.eq('user_id', userId)
          ?.eq('is_active', true)
          ?.order('created_at', { ascending: true });
        if (!err2 && data) {
          setTerminals(data?.map(t => ({
            terminal_id: t?.id,
            terminal_name: t?.name,
            serial_number: t?.serial_number,
            location_id: t?.location_id,
            location_name: t?.business_locations?.name || '—',
            is_active: t?.is_active,
            session_id: null,
            session_status: null,
            opened_at: null,
            opening_amount: 0,
            total_sales: 0,
            final_cut_date: null,
          })));
          setLastUpdated(new Date());
        }
      } catch (e) {
        console.error('Fallback error:', e);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadHourlySales = useCallback(async () => {
    if (!userId) return;
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const { data } = await supabase
        ?.from('pos_transactions')
        ?.select('terminal_id, total_amount, created_at')
        ?.gte('created_at', startOfDay?.toISOString())
        ?.eq('status', 'completed');
      if (data) {
        const byTerminal = {};
        data?.forEach(tx => {
          const tid = tx?.terminal_id;
          if (!tid) return;
          if (!byTerminal[tid]) byTerminal[tid] = Array(24).fill(0);
          const hour = new Date(tx?.created_at)?.getHours();
          byTerminal[tid][hour] = (byTerminal[tid][hour] || 0) + (tx?.total_amount || 0);
        });
        setHourlySales(byTerminal);
      }
    } catch {
      // silently fail
    }
  }, [userId]);

  useEffect(() => {
    loadTerminals();
    loadHourlySales();
  }, [loadTerminals, loadHourlySales]);

  // Supabase Realtime subscriptions
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      ?.channel('pdv_dashboard_realtime')
      ?.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pos_terminals',
        filter: `user_id=eq.${userId}`,
      }, () => {
        loadTerminals();
      })
      ?.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'cash_register_sessions',
        filter: `user_id=eq.${userId}`,
      }, () => {
        loadTerminals();
        loadHourlySales();
      })
      ?.on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'pos_transactions',
      }, () => {
        loadTerminals();
        loadHourlySales();
      })
      ?.subscribe();

    return () => { supabase?.removeChannel(channel); };
  }, [userId, loadTerminals, loadHourlySales]);

  const isTerminalBlocked = (terminal) => {
    if (!terminal?.final_cut_date) return false;
    const today = new Date()?.toISOString()?.split('T')?.[0];
    return terminal?.final_cut_date === today;
  };

  const filteredTerminals = selectedEstablishment && selectedEstablishment !== 'all'
    ? terminals?.filter(t => t?.location_id === selectedEstablishment)
    : terminals;

  // Dashboard summary stats
  const openCount = filteredTerminals?.filter(t => t?.session_status === 'open')?.length;
  const closedCount = filteredTerminals?.filter(t => t?.session_status !== 'open' && !isTerminalBlocked(t))?.length;
  const totalSales = filteredTerminals?.reduce((sum, t) => sum + (t?.total_sales || 0), 0);
  const totalCash = filteredTerminals
    ?.filter(t => t?.session_status === 'open')
    ?.reduce((sum, t) => sum + (t?.opening_amount || 0) + (t?.total_sales || 0), 0);

  const getCurrentHourSales = (terminalId) => {
    const hour = new Date()?.getHours();
    return hourlySales?.[terminalId]?.[hour] || 0;
  };

  const getPrevHourSales = (terminalId) => {
    const hour = Math.max(0, new Date()?.getHours() - 1);
    return hourlySales?.[terminalId]?.[hour] || 0;
  };

  const getHourlyTrend = (terminalId) => {
    const curr = getCurrentHourSales(terminalId);
    const prev = getPrevHourSales(terminalId);
    if (prev === 0) return curr > 0 ? 'up' : 'neutral';
    return curr >= prev ? 'up' : 'down';
  };

  const getSessionDuration = (openedAt) => {
    if (!openedAt) return null;
    const diff = Date.now() - new Date(openedAt)?.getTime();
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-muted-foreground text-sm">Cargando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Dashboard PDV en Tiempo Real</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">
              {lastUpdated ? `Actualizado: ${lastUpdated?.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Conectando...'}
            </span>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Icon name="MonitorCheck" size={16} className="text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Abiertas</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{openCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">de {filteredTerminals?.length} terminales</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <Icon name="Monitor" size={16} className="text-rose-500" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Cerradas</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{closedCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">sin actividad</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Icon name="TrendingUp" size={16} className="text-blue-600" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Ventas del Día</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatPrice(totalSales)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">todas las terminales</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Icon name="Banknote" size={16} className="text-amber-600" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Efectivo en Caja</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatPrice(totalCash)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">cajas abiertas</p>
        </div>
      </div>

      {/* Terminals Grid */}
      {filteredTerminals?.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-14 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Icon name="Monitor" size={24} className="text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium text-foreground mb-1">Sin terminales registradas</h3>
          <p className="text-sm text-muted-foreground">Ve a la pestaña Terminales para crear tu primera terminal PDV</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTerminals?.map((terminal) => {
            const isOpen = terminal?.session_status === 'open';
            const isBlocked = isTerminalBlocked(terminal);
            const trend = getHourlyTrend(terminal?.terminal_id);
            const currHourSales = getCurrentHourSales(terminal?.terminal_id);
            const sessionDuration = getSessionDuration(terminal?.opened_at);
            const cashBalance = (terminal?.opening_amount || 0) + (terminal?.total_sales || 0);

            return (
              <div
                key={terminal?.terminal_id}
                className={`bg-card border rounded-xl p-5 flex flex-col gap-3 transition-all hover:shadow-md ${
                  isBlocked ? 'border-slate-200 opacity-70' : isOpen ?'border-emerald-200 shadow-sm ring-1 ring-emerald-100' :'border-border'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isBlocked ? 'bg-slate-100' : isOpen ? 'bg-emerald-50' : 'bg-rose-50'
                  }`}>
                    <Icon
                      name={isBlocked ? 'Lock' : isOpen ? 'MonitorCheck' : 'Monitor'}
                      size={18}
                      className={isBlocked ? 'text-slate-500' : isOpen ? 'text-emerald-600' : 'text-rose-500'}
                    />
                  </div>
                  {isBlocked ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Bloqueada
                    </span>
                  ) : isOpen ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Abierta
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Cerrada
                    </span>
                  )}
                </div>

                {/* Terminal Info */}
                <div>
                  <p className="text-sm font-semibold text-foreground">{terminal?.terminal_name}</p>
                  {terminal?.location_name && terminal?.location_name !== '—' && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Icon name="MapPin" size={10} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground truncate">{terminal?.location_name}</span>
                    </div>
                  )}
                  {isOpen && sessionDuration && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Icon name="Clock" size={10} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Turno: {sessionDuration}</span>
                    </div>
                  )}
                </div>

                {/* Stats — only when open */}
                {isOpen && (
                  <div className="space-y-2">
                    {/* Cash Balance */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-emerald-600 font-medium">Balance Efectivo</p>
                          <p className="text-sm font-bold text-emerald-700">{formatPrice(cashBalance)}</p>
                        </div>
                        <Icon name="Banknote" size={16} className="text-emerald-500" />
                      </div>
                    </div>

                    {/* Sales + Hourly */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted/50 rounded-lg px-2.5 py-2">
                        <p className="text-xs text-muted-foreground">Ventas turno</p>
                        <p className="text-sm font-bold text-foreground">{formatPrice(terminal?.total_sales || 0)}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg px-2.5 py-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">Esta hora</p>
                            <p className="text-sm font-bold text-foreground">{formatPrice(currHourSales)}</p>
                          </div>
                          {trend === 'up' && <Icon name="TrendingUp" size={12} className="text-emerald-500" />}
                          {trend === 'down' && <Icon name="TrendingDown" size={12} className="text-rose-500" />}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => !isBlocked && onOpenTerminal(terminal)}
                  disabled={isBlocked}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all mt-auto ${
                    isBlocked
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : isOpen
                      ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' :'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  <Icon name={isBlocked ? 'Lock' : isOpen ? 'Settings' : 'Unlock'} size={14} />
                  {isBlocked ? 'Bloqueada' : isOpen ? 'Gestionar Caja' : 'Abrir'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PDVDashboard;
