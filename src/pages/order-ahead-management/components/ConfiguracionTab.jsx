import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const defaultSlot = { start: '09:00', end: '18:00', interval: 30, capacity: 5 };

const generateSlotPreview = (start, end, interval) => {
  const slots = [];
  const [sh, sm] = start?.split(':')?.map(Number);
  const [eh, em] = end?.split(':')?.map(Number);
  let current = sh * 60 + sm;
  const endMin = eh * 60 + em;
  while (current < endMin) {
    const h = Math.floor(current / 60)?.toString()?.padStart(2, '0');
    const m = (current % 60)?.toString()?.padStart(2, '0');
    slots?.push(`${h}:${m}`);
    current += interval;
  }
  return slots;
};

const Toggle = ({ checked, onChange, size = 'md' }) => {
  const w = size === 'sm' ? 'w-9 h-5' : 'w-12 h-6';
  const dot = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  const on = size === 'sm' ? '20px' : '26px';
  return (
    <button
      onClick={onChange}
      className={`relative ${w} rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-primary' : 'bg-muted-foreground/30'}`}
    >
      <span
        className={`absolute top-0.5 ${dot} bg-white rounded-full shadow transition-all duration-300`}
        style={{ left: checked ? on : '2px' }}
      />
    </button>
  );
};

export default function ConfiguracionTab({ hasCatalogItems = true }) {
  const [config, setConfig] = useState({
    is_active: false,
    inactive_message: 'Este negocio no acepta pedidos anticipados por el momento',
    payment_mode: 'pay_on_pickup',
    delivery_mode: 'with_slot',
    confirmation_mode: 'automatic',
    confirmation_timeout_minutes: 20,
    min_advance_minutes: 30,
    max_horizon_days: 7,
    allow_future_days: true,
    notify_push: true,
    notify_push_number: '',
    notify_email: 'per_order',
    notify_whatsapp: '',
    client_instructions: '',
    confirmed_column_label: 'En preparación',
  });
  const [daySlots, setDaySlots] = useState(
    DAYS?.map((_, i) => ({ active: i < 5, slots: [{ ...defaultSlot }] }))
  );
  const [exceptions, setExceptions] = useState([]);
  const [newException, setNewException] = useState({ date: '', is_closed: true, reason: '' });
  const [pauseModal, setPauseModal] = useState(false);
  const [pauseDuration, setPauseDuration] = useState(30);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [configId, setConfigId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copyDayModal, setCopyDayModal] = useState(null);
  const [copyTargets, setCopyTargets] = useState([]);

  useEffect(() => { loadConfig(); }, []);

  const loadConfig = async () => {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) { setLoading(false); return; }
      const { data: cfg } = await supabase?.from('order_ahead_config')?.select('*')?.eq('business_id', user?.id)?.maybeSingle();
      if (cfg) {
        setConfigId(cfg?.id);
        setConfig({
          is_active: cfg?.is_active ?? false,
          inactive_message: cfg?.inactive_message || 'Este negocio no acepta pedidos anticipados por el momento',
          payment_mode: cfg?.payment_mode || 'pay_on_pickup',
          delivery_mode: cfg?.delivery_mode || 'with_slot',
          confirmation_mode: cfg?.confirmation_mode || 'automatic',
          confirmation_timeout_minutes: cfg?.confirmation_timeout_minutes || 20,
          min_advance_minutes: cfg?.min_advance_minutes || 30,
          max_horizon_days: cfg?.max_horizon_days || 7,
          allow_future_days: cfg?.allow_future_days ?? true,
          notify_push: cfg?.notify_push ?? true,
          notify_push_number: cfg?.notify_push_number || '',
          notify_email: cfg?.notify_email || 'per_order',
          notify_whatsapp: cfg?.notify_whatsapp || '',
          client_instructions: cfg?.client_instructions || '',
          confirmed_column_label: cfg?.confirmed_column_label || 'En preparación',
        });
        const { data: slots } = await supabase?.from('order_slots')?.select('*')?.eq('config_id', cfg?.id)?.order('day_of_week');
        if (slots?.length) {
          const newDaySlots = DAYS?.map((_, i) => {
            const dayS = slots?.filter(s => s?.day_of_week === i);
            return dayS?.length
              ? { active: true, slots: dayS?.map(s => ({ start: s?.start_time?.slice(0, 5), end: s?.end_time?.slice(0, 5), interval: s?.interval_minutes, capacity: s?.max_capacity || s?.max_orders || 5 })) }
              : { active: false, slots: [{ ...defaultSlot }] };
          });
          setDaySlots(newDaySlots);
        }
        const { data: exc } = await supabase?.from('order_slot_exceptions')?.select('*')?.eq('config_id', cfg?.id)?.order('exception_date');
        if (exc) setExceptions(exc);
      }
    } catch (err) { console.log('Error loading config:', err?.message); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) return;
      let cId = configId;
      const payload = { ...config, updated_at: new Date()?.toISOString() };
      if (cId) {
        await supabase?.from('order_ahead_config')?.update(payload)?.eq('id', cId);
      } else {
        const { data } = await supabase?.from('order_ahead_config')?.insert({ ...payload, business_id: user?.id })?.select()?.single();
        cId = data?.id;
        setConfigId(cId);
      }
      if (cId) {
        await supabase?.from('order_slots')?.delete()?.eq('config_id', cId);
        const slotsToInsert = [];
        daySlots?.forEach((day, i) => {
          if (day?.active) {
            day?.slots?.forEach(s => {
              slotsToInsert?.push({ config_id: cId, day_of_week: i, start_time: s?.start, end_time: s?.end, interval_minutes: s?.interval, max_capacity: s?.capacity, is_active: true });
            });
          }
        });
        if (slotsToInsert?.length) await supabase?.from('order_slots')?.insert(slotsToInsert);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) { console.log('Error saving:', err?.message); }
    finally { setSaving(false); }
  };

  const handlePause = async () => {
    const until = new Date(Date.now() + pauseDuration * 60000)?.toISOString();
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user || !configId) return;
      await supabase?.from('order_ahead_config')?.update({ is_paused: true, paused_until: until })?.eq('id', configId);
      setConfig(c => ({ ...c, is_active: false }));
      setPauseModal(false);
    } catch (err) { console.log(err?.message); }
  };

  const addException = async () => {
    if (!newException?.date || !configId) return;
    try {
      const { data } = await supabase?.from('order_slot_exceptions')?.insert({ config_id: configId, exception_date: newException?.date, is_closed: newException?.is_closed, reason: newException?.reason })?.select()?.single();
      if (data) setExceptions(e => [...e, data]);
      setNewException({ date: '', is_closed: true, reason: '' });
    } catch (err) { console.log(err?.message); }
  };

  const removeException = async (id) => {
    await supabase?.from('order_slot_exceptions')?.delete()?.eq('id', id);
    setExceptions(e => e?.filter(x => x?.id !== id));
  };

  const updateDaySlot = (dayIdx, slotIdx, field, value) => {
    setDaySlots(prev => {
      const next = [...prev];
      next[dayIdx] = { ...next?.[dayIdx], slots: next?.[dayIdx]?.slots?.map((s, i) => i === slotIdx ? { ...s, [field]: value } : s) };
      return next;
    });
  };

  const addSlotToDay = (dayIdx) => {
    setDaySlots(prev => {
      const next = [...prev];
      next[dayIdx] = { ...next?.[dayIdx], slots: [...next?.[dayIdx]?.slots, { ...defaultSlot }] };
      return next;
    });
  };

  const removeSlotFromDay = (dayIdx, slotIdx) => {
    setDaySlots(prev => {
      const next = [...prev];
      next[dayIdx] = { ...next?.[dayIdx], slots: next?.[dayIdx]?.slots?.filter((_, i) => i !== slotIdx) };
      return next;
    });
  };

  const copyToOtherDays = () => {
    const source = daySlots?.[copyDayModal];
    setDaySlots(prev => prev?.map((d, i) => copyTargets?.includes(i) ? { ...d, active: true, slots: source?.slots?.map(s => ({ ...s })) } : d));
    setCopyDayModal(null);
    setCopyTargets([]);
  };

  const upcomingClosed = exceptions?.filter(e => {
    const d = new Date(e?.exception_date);
    const now = new Date();
    const in7 = new Date(now.getTime() + 7 * 86400000);
    return e?.is_closed && d >= now && d <= in7;
  });

  const showSlots = config?.delivery_mode === 'with_slot' || config?.delivery_mode === 'both';

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  if (!hasCatalogItems) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <Icon name="ShoppingBag" size={40} className="text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Catálogo vacío</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          Para recibir precompras necesitas al menos un producto o servicio publicado en tu catálogo.
        </p>
        <a href="/catalog-management" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
          <Icon name="ArrowRight" size={16} />
          Ir a mi catálogo
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming closed alert */}
      {upcomingClosed?.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <Icon name="AlertTriangle" size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Días cerrados próximos</p>
            <p className="text-sm text-amber-700">
              Tienes {upcomingClosed?.length} día(s) cerrado(s) en los próximos 7 días:{' '}
              {upcomingClosed?.map(e => e?.exception_date)?.join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* A. Activación y modo de operación */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="Power" size={16} className="text-primary" />
          Activación y modo de operación
        </h3>
        <div className="space-y-4">
          {/* Master toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
            <div>
              <p className="font-medium text-foreground">Order Ahead activo</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {config?.is_active ? 'Los clientes pueden realizar pedidos anticipados' : 'El botón "Pedir anticipado" está oculto en tu ficha'}
              </p>
            </div>
            <Toggle checked={config?.is_active} onChange={() => setConfig(c => ({ ...c, is_active: !c?.is_active }))} />
          </div>

          {/* Inactive message */}
          {!config?.is_active && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mensaje al cliente cuando está inactivo
              </label>
              <input
                type="text"
                value={config?.inactive_message}
                onChange={e => setConfig(c => ({ ...c, inactive_message: e?.target?.value }))}
                maxLength={280}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground mt-1">{config?.inactive_message?.length}/280 caracteres</p>
            </div>
          )}

          {/* Quick pause */}
          {config?.is_active && (
            <button
              onClick={() => setPauseModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <Icon name="Pause" size={14} />
              Pausa rápida (30 / 60 / 120 min)
            </button>
          )}
        </div>
      </div>

      {/* Payment mode */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="CreditCard" size={16} className="text-primary" />
          Modo de pago
        </h3>
        <div className="space-y-2">
          {[
            { value: 'online', label: 'Pago online al confirmar', desc: 'El cliente paga con Stripe al hacer el pedido', badge: 'Requiere Stripe', badgeColor: 'bg-blue-100 text-blue-700' },
            { value: 'pay_on_pickup', label: 'Pagar al retirar', desc: 'Pedido comprometido, cobro en caja' },
            { value: 'both', label: 'Ambas opciones', desc: 'El cliente elige en el checkout cuál prefiere' },
          ]?.map(opt => (
            <button
              key={opt?.value}
              onClick={() => setConfig(c => ({ ...c, payment_mode: opt?.value }))}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${config?.payment_mode === opt?.value ? 'border-primary bg-primary/5' : 'border-border'}`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${config?.payment_mode === opt?.value ? 'border-primary bg-primary' : 'border-muted-foreground/40'}`}>
                {config?.payment_mode === opt?.value && <span className="block w-2 h-2 bg-white rounded-full m-auto mt-0.5" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-foreground">{opt?.label}</p>
                  {opt?.badge && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${opt?.badgeColor}`}>{opt?.badge}</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{opt?.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Delivery mode */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="Store" size={16} className="text-primary" />
          Modo de entrega
        </h3>
        <div className="space-y-2">
          {[
            { value: 'with_slot', label: 'Con slot de retiro', desc: 'El cliente elige una hora específica disponible' },
            { value: 'no_slot', label: 'Sin slot, notificación cuando listo', desc: 'El negocio prepara y avisa cuando está listo' },
            { value: 'both', label: 'Ambos disponibles', desc: 'El cliente elige durante el checkout' },
          ]?.map(opt => (
            <button
              key={opt?.value}
              onClick={() => setConfig(c => ({ ...c, delivery_mode: opt?.value }))}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-colors ${config?.delivery_mode === opt?.value ? 'border-primary bg-primary/5' : 'border-border'}`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${config?.delivery_mode === opt?.value ? 'border-primary bg-primary' : 'border-muted-foreground/40'}`}>
                {config?.delivery_mode === opt?.value && <span className="block w-2 h-2 bg-white rounded-full m-auto mt-0.5" />}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{opt?.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt?.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* B. Slot configurator — only if delivery mode includes slots */}
      {showSlots && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon name="Clock" size={16} className="text-primary" />
            Configuración de slots por día
          </h3>
          <div className="space-y-3">
            {DAYS?.map((day, dayIdx) => (
              <div key={day} className={`border rounded-xl transition-colors ${daySlots?.[dayIdx]?.active ? 'border-primary/30 bg-primary/2' : 'border-border'}`}>
                <div className="flex items-center gap-3 p-4">
                  <Toggle
                    size="sm"
                    checked={daySlots?.[dayIdx]?.active}
                    onChange={() => setDaySlots(prev => prev?.map((d, i) => i === dayIdx ? { ...d, active: !d?.active } : d))}
                  />
                  <span className="font-medium text-foreground w-24">{day}</span>
                  {daySlots?.[dayIdx]?.active && (
                    <button
                      onClick={() => { setCopyDayModal(dayIdx); setCopyTargets([]); }}
                      className="ml-auto text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Icon name="Copy" size={12} />
                      Copiar a otros días
                    </button>
                  )}
                </div>
                {daySlots?.[dayIdx]?.active && (
                  <div className="px-4 pb-4 space-y-3">
                    {daySlots?.[dayIdx]?.slots?.map((slot, slotIdx) => {
                      const preview = generateSlotPreview(slot?.start, slot?.end, slot?.interval);
                      return (
                        <div key={slotIdx} className="bg-muted/30 rounded-lg p-3 space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Hora inicio</label>
                              <input type="time" value={slot?.start} onChange={e => updateDaySlot(dayIdx, slotIdx, 'start', e?.target?.value)} className="w-full px-2 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                            </div>
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Hora fin</label>
                              <input type="time" value={slot?.end} onChange={e => updateDaySlot(dayIdx, slotIdx, 'end', e?.target?.value)} className="w-full px-2 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                            </div>
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Intervalo</label>
                              <select value={slot?.interval} onChange={e => updateDaySlot(dayIdx, slotIdx, 'interval', Number(e?.target?.value))} className="w-full px-2 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                                <option value={15}>15 min</option>
                                <option value={20}>20 min</option>
                                <option value={30}>30 min</option>
                                <option value={60}>60 min</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Capacidad máx.</label>
                              <input type="number" min={1} max={100} value={slot?.capacity} onChange={e => updateDaySlot(dayIdx, slotIdx, 'capacity', Number(e?.target?.value))} className="w-full px-2 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {preview?.slice(0, 8)?.map(t => <span key={t} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t}</span>)}
                              {preview?.length > 8 && <span className="text-xs text-muted-foreground">+{preview?.length - 8} más</span>}
                              {preview?.length === 0 && <span className="text-xs text-muted-foreground italic">Sin slots generados</span>}
                            </div>
                            {daySlots?.[dayIdx]?.slots?.length > 1 && (
                              <button onClick={() => removeSlotFromDay(dayIdx, slotIdx)} className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0">
                                <Icon name="Trash2" size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <button onClick={() => addSlotToDay(dayIdx)} className="text-sm text-primary hover:underline flex items-center gap-1">
                      <Icon name="Plus" size={14} />
                      Agregar franja horaria
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Exceptions */}
          <div className="mt-6 pt-5 border-t border-border">
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Icon name="CalendarX" size={14} className="text-amber-600" />
              Excepciones y días especiales
            </h4>
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <input type="date" value={newException?.date} onChange={e => setNewException(n => ({ ...n, date: e?.target?.value }))} className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <select value={newException?.is_closed ? 'closed' : 'reduced'} onChange={e => setNewException(n => ({ ...n, is_closed: e?.target?.value === 'closed' }))} className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="closed">Día cerrado</option>
                <option value="reduced">Horario reducido</option>
              </select>
              <input type="text" placeholder="Motivo (opcional)" value={newException?.reason} onChange={e => setNewException(n => ({ ...n, reason: e?.target?.value }))} className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <button onClick={addException} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                Agregar
              </button>
            </div>
            {exceptions?.length > 0 ? (
              <div className="space-y-2">
                {exceptions?.map(exc => (
                  <div key={exc?.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${exc?.is_closed ? 'bg-red-500' : 'bg-amber-500'}`} />
                      <span className="text-sm font-medium text-foreground">{exc?.exception_date}</span>
                      <span className="text-xs text-muted-foreground">{exc?.is_closed ? 'Cerrado' : 'Horario reducido'}</span>
                      {exc?.reason && <span className="text-xs text-muted-foreground">— {exc?.reason}</span>}
                    </div>
                    <button onClick={() => removeException(exc?.id)} className="text-red-500 hover:text-red-700">
                      <Icon name="X" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-3">No hay excepciones configuradas</p>
            )}
          </div>

          {/* Anticipation rules */}
          <div className="mt-6 pt-5 border-t border-border">
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Icon name="Timer" size={14} className="text-primary" />
              Reglas de anticipación
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tiempo mínimo antes del slot</label>
                <select value={config?.min_advance_minutes} onChange={e => setConfig(c => ({ ...c, min_advance_minutes: Number(e?.target?.value) }))} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={60}>1 hora</option>
                  <option value={120}>2 horas</option>
                  <option value={1440}>1 día</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Horizonte máximo de reserva</label>
                <select value={config?.max_horizon_days} onChange={e => setConfig(c => ({ ...c, max_horizon_days: Number(e?.target?.value) }))} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value={0}>Solo hoy</option>
                  <option value={3}>Hasta 3 días</option>
                  <option value={7}>Hasta 7 días</option>
                  <option value={30}>Hasta 30 días</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl mt-3">
              <div>
                <p className="text-sm font-medium text-foreground">Aceptar pedidos para días futuros</p>
                <p className="text-xs text-muted-foreground">Si está off, solo acepta pedidos para hoy</p>
              </div>
              <Toggle checked={config?.allow_future_days} onChange={() => setConfig(c => ({ ...c, allow_future_days: !c?.allow_future_days }))} />
            </div>
          </div>
        </div>
      )}

      {/* C. Confirmation settings */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="CheckCircle" size={16} className="text-primary" />
          Configuración de confirmación
        </h3>
        <div className="space-y-3">
          {[
            { value: 'automatic', label: 'Confirmación automática', desc: 'El pedido pasa directamente a "Confirmado" al entrar' },
            { value: 'manual', label: 'Confirmación manual', desc: 'El negocio debe aceptar cada pedido' },
          ]?.map(opt => (
            <button
              key={opt?.value}
              onClick={() => setConfig(c => ({ ...c, confirmation_mode: opt?.value }))}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-colors ${config?.confirmation_mode === opt?.value ? 'border-primary bg-primary/5' : 'border-border'}`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${config?.confirmation_mode === opt?.value ? 'border-primary bg-primary' : 'border-muted-foreground/40'}`}>
                {config?.confirmation_mode === opt?.value && <span className="block w-2 h-2 bg-white rounded-full m-auto mt-0.5" />}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{opt?.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt?.desc}</p>
              </div>
            </button>
          ))}
          {config?.confirmation_mode === 'manual' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <label className="block text-sm font-medium text-amber-800 mb-2">
                Tiempo límite para confirmar manualmente
              </label>
              <select
                value={config?.confirmation_timeout_minutes}
                onChange={e => setConfig(c => ({ ...c, confirmation_timeout_minutes: Number(e?.target?.value) }))}
                className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30"
              >
                <option value={10}>10 minutos</option>
                <option value={20}>20 minutos</option>
                <option value={30}>30 minutos</option>
              </select>
              <p className="text-xs text-amber-700 mt-2">
                Si no confirmas en este tiempo, el pedido se cancela automáticamente y se reembolsa si fue pago online.
              </p>
            </div>
          )}
          {/* Confirmed column label */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nombre de la columna "Confirmado" en el Kanban
            </label>
            <select
              value={config?.confirmed_column_label}
              onChange={e => setConfig(c => ({ ...c, confirmed_column_label: e?.target?.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="En preparación">En preparación (comida)</option>
              <option value="Empacando">Empacando (ropa / productos)</option>
              <option value="Separado">Separado (servicios prepagados)</option>
              <option value="Confirmado">Confirmado (genérico)</option>
            </select>
          </div>
        </div>
      </div>

      {/* D. Notifications */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="Bell" size={16} className="text-primary" />
          Notificaciones al negocio
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
            <div>
              <p className="text-sm font-medium text-foreground">Push al dueño/staff por pedido nuevo</p>
              <p className="text-xs text-muted-foreground">Notificación inmediata al entrar un pedido</p>
            </div>
            <Toggle checked={config?.notify_push} onChange={() => setConfig(c => ({ ...c, notify_push: !c?.notify_push }))} />
          </div>
          {config?.notify_push && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Número destino para push</label>
              <input
                type="tel"
                placeholder="+52 55 1234 5678"
                value={config?.notify_push_number}
                onChange={e => setConfig(c => ({ ...c, notify_push_number: e?.target?.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email de aviso</label>
              <select value={config?.notify_email} onChange={e => setConfig(c => ({ ...c, notify_email: e?.target?.value }))} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="per_order">Por pedido</option>
                <option value="daily">Resumen diario</option>
                <option value="never">Nunca</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                WhatsApp Business
                <span className="ml-2 text-xs text-muted-foreground font-normal">(si está integrado)</span>
              </label>
              <input
                type="tel"
                placeholder="+52 55 1234 5678"
                value={config?.notify_whatsapp}
                onChange={e => setConfig(c => ({ ...c, notify_whatsapp: e?.target?.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* E. Client instructions */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="MessageSquare" size={16} className="text-primary" />
          Mensaje de instrucciones al cliente
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Aparece en el checkout antes de confirmar el pedido. Máx. 280 caracteres.
        </p>
        <textarea
          value={config?.client_instructions}
          onChange={e => setConfig(c => ({ ...c, client_instructions: e?.target?.value }))}
          maxLength={280}
          rows={3}
          placeholder='Ej: "Pasa por la ventanilla lateral con tu código de pedido"'
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">{config?.client_instructions?.length}/280 caracteres</p>
        {config?.client_instructions && (
          <div className="mt-3 p-3 bg-muted/30 border border-border rounded-lg">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Preview en checkout</p>
            <div className="flex items-start gap-2">
              <Icon name="Info" size={14} className="text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{config?.client_instructions}</p>
            </div>
          </div>
        )}
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : saved ? <Icon name="Check" size={16} /> : <Icon name="Save" size={16} />}
          {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar cambios'}
        </button>
      </div>

      {/* Copy modal */}
      {copyDayModal !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-foreground mb-4">Copiar configuración de {DAYS?.[copyDayModal]}</h3>
            <div className="space-y-2 mb-4">
              {DAYS?.map((d, i) => i !== copyDayModal && (
                <label key={i} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={copyTargets?.includes(i)} onChange={e => setCopyTargets(prev => e?.target?.checked ? [...prev, i] : prev?.filter(x => x !== i))} className="rounded" />
                  <span className="text-sm text-foreground">{d}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setCopyDayModal(null); setCopyTargets([]); }} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted/50">Cancelar</button>
              <button onClick={copyToOtherDays} disabled={!copyTargets?.length} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50">Copiar</button>
            </div>
          </div>
        </div>
      )}

      {/* Pause modal */}
      {pauseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-foreground mb-2">Pausa rápida de Order Ahead</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Los clientes verán un mensaje automático indicando que el servicio está temporalmente pausado.
            </p>
            <div className="space-y-2 mb-4">
              {[30, 60, 120]?.map(d => (
                <button
                  key={d}
                  onClick={() => setPauseDuration(d)}
                  className={`w-full p-3 rounded-xl border-2 text-sm font-medium transition-colors ${pauseDuration === d ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground'}`}
                >
                  Pausar por {d} minutos
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPauseModal(false)} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted/50">Cancelar</button>
              <button onClick={handlePause} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Pausar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
