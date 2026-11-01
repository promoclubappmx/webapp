import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { supabase } from '../../../lib/supabase';

const TerminalsGrid = ({ userId, onOpenTerminal, establishments, selectedEstablishment }) => {
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ serial_number: '', description: '', location_id: '' });

  const loadTerminals = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase?.rpc('get_terminal_with_session', { p_user_id: userId });
      if (error) throw error;
      setTerminals(data || []);
    } catch (err) {
      console.error('Error loading terminals:', err);
      try {
        const { data, error: err2 } = await supabase
          ?.from('pos_terminals')
          ?.select(`id, name, serial_number, description, location_id, is_active, created_at, business_locations(name)`)
          ?.eq('user_id', userId)
          ?.eq('is_active', true)
          ?.order('created_at', { ascending: true });
        if (!err2 && data) {
          const mapped = data?.map(t => ({
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
          }));
          setTerminals(mapped);
        }
      } catch (e) {
        console.error('Fallback error:', e);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadTerminals();
  }, [loadTerminals]);

  // Supabase Realtime subscriptions
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      ?.channel('terminals_table_realtime')
      ?.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pos_terminals',
        filter: `user_id=eq.${userId}`,
      }, () => { loadTerminals(); })
      ?.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'cash_register_sessions',
        filter: `user_id=eq.${userId}`,
      }, () => { loadTerminals(); })
      ?.subscribe();

    return () => { supabase?.removeChannel(channel); };
  }, [userId, loadTerminals]);

  // Auto-generate next TPV name
  const getNextTPVName = () => {
    const tpvNumbers = terminals
      ?.map(t => {
        const match = t?.terminal_name?.match(/^TPV\s*(\d+)$/i);
        return match ? parseInt(match?.[1]) : null;
      })
      ?.filter(n => n !== null);
    const maxNum = tpvNumbers?.length > 0 ? Math.max(...tpvNumbers) : 0;
    return `TPV ${maxNum + 1}`;
  };

  const handleOpenCreate = () => {
    setForm({ serial_number: '', description: '', location_id: establishments?.[0]?.id || '' });
    setShowCreateModal(true);
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const terminalName = getNextTPVName();
      const { error } = await supabase?.from('pos_terminals')?.insert({
        user_id: userId,
        name: terminalName,
        serial_number: form?.serial_number?.trim() || null,
        description: form?.description?.trim() || null,
        location_id: form?.location_id || null,
      });
      if (error) throw error;
      setShowCreateModal(false);
      await loadTerminals();
    } catch (err) {
      console.error('Error creating terminal:', err);
      alert('Error al crear la terminal: ' + err?.message);
    } finally {
      setCreating(false);
    }
  };

  const isTerminalBlocked = (terminal) => {
    if (!terminal?.final_cut_date) return false;
    const today = new Date()?.toISOString()?.split('T')?.[0];
    return terminal?.final_cut_date === today;
  };

  // Filter by establishment if selected
  const filteredTerminals = selectedEstablishment && selectedEstablishment !== 'all'
    ? terminals?.filter(t => t?.location_id === selectedEstablishment)
    : terminals;

  return (
    <div className="space-y-5">
      {/* Section Header — always visible */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Terminales PDV</h2>
          <p className="text-sm text-muted-foreground">
            {filteredTerminals?.length} terminal{filteredTerminals?.length !== 1 ? 'es' : ''} registrada{filteredTerminals?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={handleOpenCreate} iconName="Plus" size="sm">
          Crear caja
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-muted-foreground text-sm">Cargando terminales...</span>
        </div>
      ) : filteredTerminals?.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-14 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Icon name="Monitor" size={24} className="text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium text-foreground mb-1">Sin terminales registradas</h3>
          <p className="text-sm text-muted-foreground mb-4">Crea tu primera terminal para comenzar a operar</p>
          <Button onClick={handleOpenCreate} iconName="Plus" size="sm">
            Crear Terminal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTerminals?.map((terminal) => {
            const isOpen = terminal?.session_status === 'open';
            const isBlocked = isTerminalBlocked(terminal);

            return (
              <div
                key={terminal?.terminal_id}
                className={`bg-card border rounded-xl p-5 flex flex-col gap-4 transition-all hover:shadow-md ${
                  isBlocked
                    ? 'border-slate-200 opacity-70'
                    : isOpen
                    ? 'border-emerald-200 shadow-sm'
                    : 'border-border'
                }`}
              >
                {/* Top: icon + status badge */}
                <div className="flex items-start justify-between">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    isBlocked ? 'bg-slate-100' : isOpen ? 'bg-emerald-50' : 'bg-rose-50'
                  }`}>
                    <Icon
                      name={isBlocked ? 'Lock' : isOpen ? 'MonitorCheck' : 'Monitor'}
                      size={20}
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

                {/* Terminal name & location */}
                <div className="flex-1">
                  <p className="text-base font-semibold text-foreground">{terminal?.terminal_name}</p>
                  {terminal?.serial_number && (
                    <p className="text-xs text-muted-foreground mt-0.5">S/N: {terminal?.serial_number}</p>
                  )}
                  {terminal?.location_name && terminal?.location_name !== '—' && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <Icon name="MapPin" size={11} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground truncate">{terminal?.location_name}</span>
                    </div>
                  )}
                </div>

                {/* Sales info if open */}
                {isOpen && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                    <p className="text-xs text-emerald-600 font-medium">Ventas del turno</p>
                    <p className="text-sm font-bold text-emerald-700">${(terminal?.total_sales || 0)?.toFixed(2)}</p>
                  </div>
                )}

                {/* Action button */}
                <button
                  onClick={() => !isBlocked && onOpenTerminal(terminal)}
                  disabled={isBlocked}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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

      {/* Create Terminal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon name="Monitor" size={16} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Nueva Terminal PDV</h3>
                  <p className="text-xs text-muted-foreground">Se asignará como <span className="font-medium text-foreground">{getNextTPVName()}</span></p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="X" size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-muted/50 border border-border rounded-lg p-3 flex items-center gap-2">
                <Icon name="Info" size={14} className="text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">
                  El nombre se asigna automáticamente (<span className="font-medium text-foreground">{getNextTPVName()}</span>). La terminal iniciará en estado <span className="font-medium text-rose-600">Cerrada</span>.
                </p>
              </div>
              <Input
                label="Número de Serie (Opcional)"
                placeholder="Ej: TPV-001"
                value={form?.serial_number}
                onChange={(e) => setForm(f => ({ ...f, serial_number: e?.target?.value }))}
              />
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Establecimiento</label>
                <select
                  value={form?.location_id}
                  onChange={(e) => setForm(f => ({ ...f, location_id: e?.target?.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Sin establecimiento asignado</option>
                  {establishments?.map(est => (
                    <option key={est?.id} value={est?.id}>{est?.name || est?.location_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Descripción (Opcional)</label>
                <textarea
                  value={form?.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e?.target?.value }))}
                  placeholder="Descripción opcional..."
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleCreate} loading={creating} iconName="Plus" className="flex-1">
                  Crear Terminal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TerminalsGrid;
