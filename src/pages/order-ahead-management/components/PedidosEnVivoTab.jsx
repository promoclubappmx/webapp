import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';

const CANCEL_REASONS = [
  'Sin stock / sin disponibilidad',
  'Error en el pedido',
  'Cliente solicitó cancelar',
  'Otro',
];

const getTimeRemaining = (slotTime) => {
  if (!slotTime) return null;
  const diff = new Date(slotTime) - new Date();
  if (diff < 0) return { text: 'Vencido', urgent: true };
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return { text: `${hrs}h ${mins % 60}m`, urgent: false };
  return { text: `${mins}m`, urgent: mins < 10 };
};

const formatTime = (dt) => dt ? new Date(dt)?.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '—';
const formatDate = (dt) => dt ? new Date(dt)?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) : '—';
const formatDateTime = (dt) => dt ? new Date(dt)?.toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

const STATUS_LABELS = {
  pending: 'Nuevo',
  confirmed: 'Confirmado',
  ready: 'Listo',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

const COLUMN_STYLES = {
  pending: { header: 'bg-amber-500', border: 'border-amber-300', bg: 'bg-amber-50' },
  confirmed: { header: 'bg-blue-500', border: 'border-blue-300', bg: 'bg-blue-50' },
  ready: { header: 'bg-emerald-500', border: 'border-emerald-300', bg: 'bg-emerald-50' },
  completed: { header: 'bg-slate-500', border: 'border-slate-300', bg: 'bg-slate-50' },
  cancelled: { header: 'bg-red-500', border: 'border-red-300', bg: 'bg-red-50' },
};

const ACTION_MAP = {
  pending: { label: 'Confirmar pedido', icon: 'Check', next: 'confirmed', color: 'bg-blue-600 hover:bg-blue-700' },
  confirmed: { label: 'Marcar como listo', icon: 'CheckCheck', next: 'ready', color: 'bg-emerald-600 hover:bg-emerald-700' },
  ready: { label: 'Completar', icon: 'PackageCheck', next: 'completed', color: 'bg-slate-600 hover:bg-slate-700' },
};

const COLUMNS = [
  { id: 'pending', label: 'Nuevo' },
  { id: 'confirmed', label: 'Confirmado' },
  { id: 'ready', label: 'Listo' },
  { id: 'completed', label: 'Completado' },
  { id: 'cancelled', label: 'Cancelado' },
];

export default function PedidosEnVivoTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('today');
  const [customDate, setCustomDate] = useState('');
  const [search, setSearch] = useState('');
  const [onlyActive, setOnlyActive] = useState(false);
  const [connected, setConnected] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [kitchenMode, setKitchenMode] = useState(false);
  const [collapsedCols, setCollapsedCols] = useState({ cancelled: true });
  const [internalNote, setInternalNote] = useState('');
  const [confirmedLabel, setConfirmedLabel] = useState('Confirmado');
  const channelRef = useRef(null);
  const [newOrderIds, setNewOrderIds] = useState(new Set());

  useEffect(() => {
    loadOrders();
    loadConfig();
    setupRealtime();
    return () => { if (channelRef?.current) supabase?.removeChannel(channelRef?.current); };
  }, [selectedDate, customDate]);

  const loadConfig = async () => {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) return;
      const { data: cfg } = await supabase?.from('order_ahead_config')?.select('confirmed_column_label')?.eq('business_id', user?.id)?.maybeSingle();
      if (cfg?.confirmed_column_label) setConfirmedLabel(cfg?.confirmed_column_label);
    } catch {}
  };

  const getDateFilter = () => {
    const today = new Date();
    if (selectedDate === 'today') return today?.toISOString()?.split('T')?.[0];
    if (selectedDate === 'tomorrow') {
      const t = new Date(today); t?.setDate(t?.getDate() + 1);
      return t?.toISOString()?.split('T')?.[0];
    }
    return customDate;
  };

  const loadOrders = async () => {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) { setLoading(false); return; }
      const dateStr = getDateFilter();
      let query = supabase?.from('orders')?.select('*, order_items(*)')?.eq('business_id', user?.id);
      if (dateStr) {
        query = query?.gte('created_at', `${dateStr}T00:00:00`)?.lte('created_at', `${dateStr}T23:59:59`);
      }
      query = query?.order('created_at', { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (err) { console.log('Error loading orders:', err?.message); }
    finally { setLoading(false); }
  };

  const setupRealtime = async () => {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) return;
      if (channelRef?.current) supabase?.removeChannel(channelRef?.current);
      channelRef.current = supabase?.channel(`orders_realtime_${user?.id}`)
        ?.on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `business_id=eq.${user?.id}` }, (payload) => {
          if (payload?.eventType === 'INSERT') {
            const newOrder = { ...payload?.new, order_items: [] };
            setOrders(prev => [newOrder, ...prev]);
            setNewOrderIds(prev => new Set([...prev, payload?.new?.id]));
            setTimeout(() => setNewOrderIds(prev => { const n = new Set(prev); n?.delete(payload?.new?.id); return n; }), 3000);
            if (soundEnabled) {
              try {
                const ctx = new AudioContext();
                const osc = ctx?.createOscillator();
                const gain = ctx?.createGain();
                osc?.connect(gain);
                gain?.connect(ctx?.destination);
                osc.frequency.value = 880;
                gain.gain.value = 0.3;
                osc?.start();
                osc?.stop(ctx?.currentTime + 0.3);
              } catch {}
            }
          } else if (payload?.eventType === 'UPDATE') {
            setOrders(prev => prev?.map(o => o?.id === payload?.new?.id ? { ...o, ...payload?.new } : o));
            if (selectedOrder?.id === payload?.new?.id) setSelectedOrder(prev => ({ ...prev, ...payload?.new }));
          } else if (payload?.eventType === 'DELETE') {
            setOrders(prev => prev?.filter(o => o?.id !== payload?.old?.id));
          }
        })
        ?.subscribe((status) => setConnected(status === 'SUBSCRIBED'));
    } catch (err) { console.log('Realtime setup error:', err?.message); }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const order = orders?.find(o => o?.id === orderId);
      if (!order) return;
      const history = [...(order?.status_history || []), { status: newStatus, timestamp: new Date()?.toISOString() }];
      const updateData = { order_status: newStatus, status_history: history, updated_at: new Date()?.toISOString() };
      if (newStatus === 'confirmed') updateData.confirmed_at = new Date()?.toISOString();
      if (newStatus === 'ready') updateData.ready_at = new Date()?.toISOString();
      if (newStatus === 'completed') updateData.completed_at = new Date()?.toISOString();
      const { error } = await supabase?.from('orders')?.update(updateData)?.eq('id', orderId);
      if (!error) {
        setOrders(prev => prev?.map(o => o?.id === orderId ? { ...o, ...updateData } : o));
        if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, ...updateData }));
      }
    } catch (err) { console.log(err?.message); }
  };

  const handleCancel = async () => {
    if (!cancelModal || !cancelReason) return;
    const history = [...(cancelModal?.status_history || []), { status: 'cancelled', timestamp: new Date()?.toISOString(), reason: cancelReason }];
    const updateData = { order_status: 'cancelled', status_history: history, cancelled_reason: cancelReason, cancelled_at: new Date()?.toISOString(), updated_at: new Date()?.toISOString() };
    await supabase?.from('orders')?.update(updateData)?.eq('id', cancelModal?.id);
    setOrders(prev => prev?.map(o => o?.id === cancelModal?.id ? { ...o, ...updateData } : o));
    setCancelModal(null);
    setCancelReason('');
  };

  const saveInternalNote = async (orderId) => {
    await supabase?.from('orders')?.update({ internal_note: internalNote })?.eq('id', orderId);
    setOrders(prev => prev?.map(o => o?.id === orderId ? { ...o, internal_note: internalNote } : o));
    setSelectedOrder(prev => ({ ...prev, internal_note: internalNote }));
  };

  const filteredOrders = orders?.filter(o => {
    if (onlyActive && ['completed', 'cancelled']?.includes(o?.order_status)) return false;
    if (search) {
      const s = search?.toLowerCase();
      return o?.order_number?.toLowerCase()?.includes(s) || o?.customer_name?.toLowerCase()?.includes(s);
    }
    return true;
  });

  const getOrdersForColumn = (status) => filteredOrders?.filter(o => o?.order_status === status);

  // Kitchen mode
  if (kitchenMode) {
    return (
      <div className="fixed inset-0 bg-gray-950 z-50 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white">Modo Cocina</h1>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-sm text-gray-400">{connected ? 'En vivo' : 'Sin conexión'}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Último update: {new Date()?.toLocaleTimeString('es-MX')}</span>
            <button onClick={() => setKitchenMode(false)} className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors">
              Salir del modo cocina
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {['confirmed', 'ready']?.map(status => {
            const colOrders = getOrdersForColumn(status);
            const style = COLUMN_STYLES?.[status];
            const label = status === 'confirmed' ? confirmedLabel : 'Listo';
            return (
              <div key={status} className="bg-gray-900 rounded-2xl p-5 min-h-[60vh]">
                <div className="flex items-center gap-3 mb-5">
                  <span className={`w-5 h-5 rounded-full ${style?.header}`} />
                  <h2 className="text-3xl font-bold text-white">{label}</h2>
                  <span className="text-2xl font-bold text-gray-400 ml-2">({colOrders?.length})</span>
                </div>
                <div className="space-y-4">
                  {colOrders?.map(order => {
                    const tr = getTimeRemaining(order?.slot_time || order?.pickup_slot);
                    const items = order?.order_items || [];
                    return (
                      <div key={order?.id} className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-3xl font-bold text-white">{order?.order_number}</span>
                          {tr && <span className={`text-2xl font-bold ${tr?.urgent ? 'text-red-400' : 'text-emerald-400'}`}>{tr?.text}</span>}
                        </div>
                        <p className="text-xl text-gray-300 mb-3">{order?.customer_name || 'Invitado'}</p>
                        <div className="space-y-1">
                          {items?.slice(0, 4)?.map((item, i) => (
                            <p key={i} className="text-lg text-gray-400">{item?.quantity}× {item?.item_name}</p>
                          ))}
                          {items?.length > 4 && <p className="text-lg text-gray-500">+{items?.length - 4} más</p>}
                        </div>
                        <p className="text-2xl font-bold text-white mt-3">${(order?.total || 0)?.toFixed(2)}</p>
                      </div>
                    );
                  })}
                  {colOrders?.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Icon name="Inbox" size={24} className="text-muted-foreground/30 mb-2" />
                      <p className="text-xs text-muted-foreground">Sin pedidos</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3 bg-card border border-border rounded-xl p-4">
        {/* Date filter */}
        <div className="flex items-center gap-1.5">
          {[{ id: 'today', label: 'Hoy' }, { id: 'tomorrow', label: 'Mañana' }, { id: 'custom', label: 'Fecha' }]?.map(d => (
            <button
              key={d?.id}
              onClick={() => setSelectedDate(d?.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedDate === d?.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              {d?.label}
            </button>
          ))}
          {selectedDate === 'custom' && (
            <input type="date" value={customDate} onChange={e => setCustomDate(e?.target?.value)} className="px-2 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm" />
          )}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar # pedido o cliente..."
            value={search}
            onChange={e => setSearch(e?.target?.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Solo activos */}
        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer whitespace-nowrap">
          <input type="checkbox" checked={onlyActive} onChange={e => setOnlyActive(e?.target?.checked)} className="rounded" />
          Solo activos
        </label>

        {/* Right controls */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setSoundEnabled(s => !s)}
            title={soundEnabled ? 'Silenciar alertas' : 'Activar alertas sonoras'}
            className={`p-2 rounded-lg border transition-colors ${soundEnabled ? 'border-primary text-primary bg-primary/5' : 'border-border text-muted-foreground'}`}
          >
            <Icon name={soundEnabled ? 'Volume2' : 'VolumeX'} size={14} />
          </button>
          <button
            onClick={() => setKitchenMode(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted/50 transition-colors"
          >
            <Icon name="Monitor" size={14} />
            Modo TV
          </button>
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-muted/30 rounded-lg">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs text-muted-foreground font-medium">{connected ? 'En vivo' : 'Sin conexión'}</span>
          </div>
        </div>
      </div>

      {/* Kanban */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS?.map(col => {
            const colOrders = getOrdersForColumn(col?.id);
            const style = COLUMN_STYLES?.[col?.id];
            const isCollapsed = collapsedCols?.[col?.id];
            return (
              <div key={col?.id} className={`flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'w-14' : 'w-72'}`}>
                {/* Column header */}
                <div className={`${style?.header} rounded-t-xl px-3 py-2.5 flex items-center gap-2`}>
                  {!isCollapsed && <span className="text-white font-semibold text-sm flex-1">{col?.label}</span>}
                  <span className="text-white text-xs font-bold bg-white/25 px-2 py-0.5 rounded-full">{colOrders?.length}</span>
                  <button
                    onClick={() => setCollapsedCols(prev => ({ ...prev, [col?.id]: !prev?.[col?.id] }))}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={14} />
                  </button>
                </div>

                {/* Column body */}
                {!isCollapsed && (
                  <div className={`${style?.bg} border-x ${style?.border} border-b rounded-b-xl min-h-[500px] p-2 space-y-2`}>
                    {colOrders?.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Icon name="Inbox" size={24} className="text-muted-foreground/30 mb-2" />
                        <p className="text-xs text-muted-foreground">Sin pedidos</p>
                      </div>
                    )}
                    {colOrders?.map(order => {
                      const slotTime = order?.slot_time || order?.pickup_slot;
                      const tr = getTimeRemaining(slotTime);
                      const action = ACTION_MAP?.[order?.order_status];
                      const items = order?.order_items || [];
                      const isNew = newOrderIds?.has(order?.id);
                      return (
                        <div
                          key={order?.id}
                          className={`bg-card border border-border rounded-xl p-3 shadow-sm hover:shadow-md transition-all ${isNew ? 'ring-2 ring-primary animate-pulse' : ''}`}
                        >
                          {/* Header */}
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-foreground text-sm">{order?.order_number}</span>
                            <span className="text-xs text-muted-foreground">{formatTime(order?.created_at)}</span>
                          </div>

                          {/* Customer */}
                          <p className="text-sm font-medium text-foreground mb-1.5">{order?.customer_name || 'Invitado'}</p>

                          {/* Payment badge */}
                          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(order?.payment_method === 'paid_online' || order?.payment_status === 'paid_online') ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {(order?.payment_method === 'paid_online' || order?.payment_status === 'paid_online') ? '✓ Pago online' : 'Pagar al retirar'}
                            </span>
                          </div>

                          {/* Slot or no-slot */}
                          {slotTime ? (
                            <div className="flex items-center gap-2 mb-1.5">
                              <Icon name="Clock" size={12} className="text-muted-foreground flex-shrink-0" />
                              <span className="text-xs text-muted-foreground">{formatTime(slotTime)}</span>
                              {tr && (
                                <span className={`text-xs font-bold ml-auto ${tr?.urgent ? 'text-red-600' : 'text-emerald-600'}`}>
                                  {tr?.text}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Sin slot · Avisa cuando listo</span>
                            </div>
                          )}

                          {/* Items */}
                          <div className="space-y-0.5 mb-2">
                            {items?.slice(0, 3)?.map((item, i) => (
                              <p key={i} className="text-xs text-muted-foreground">{item?.quantity}× {item?.item_name}</p>
                            ))}
                            {items?.length > 3 && <p className="text-xs text-primary font-medium">+{items?.length - 3} más</p>}
                          </div>

                          {/* Total */}
                          <p className="font-bold text-foreground text-sm mb-2">${(order?.total || 0)?.toFixed(2)}</p>

                          {/* Actions */}
                          <div className="flex gap-1.5">
                            {action && (
                              <button
                                onClick={() => updateOrderStatus(order?.id, action?.next)}
                                className={`flex-1 flex items-center justify-center gap-1 py-1.5 ${action?.color} text-white rounded-lg text-xs font-medium transition-colors`}
                              >
                                <Icon name={action?.icon} size={12} />
                                {action?.label}
                              </button>
                            )}
                            <button
                              onClick={() => { setSelectedOrder(order); setInternalNote(order?.internal_note || ''); }}
                              className="px-2 py-1.5 border border-border rounded-lg text-xs text-foreground hover:bg-muted/50 transition-colors"
                              title="Ver detalle"
                            >
                              <Icon name="Eye" size={12} />
                            </button>
                            {!['completed', 'cancelled']?.includes(order?.order_status) && (
                              <button
                                onClick={() => setCancelModal(order)}
                                className="px-2 py-1.5 border border-red-200 rounded-lg text-xs text-red-600 hover:bg-red-50 transition-colors"
                                title="Cancelar"
                              >
                                <Icon name="X" size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Order detail drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={e => e?.target === e?.currentTarget && setSelectedOrder(null)}>
          <div className="bg-card w-full max-w-md h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="font-bold text-foreground">{selectedOrder?.order_number}</h3>
                <p className="text-xs text-muted-foreground">{formatDate(selectedOrder?.created_at)} · {formatTime(selectedOrder?.created_at)}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-muted/50 rounded-lg transition-colors">
                <Icon name="X" size={18} />
              </button>
            </div>
            <div className="p-5 space-y-5">
              {/* Customer */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Cliente</h4>
                <p className="font-medium text-foreground">{selectedOrder?.customer_name || 'Invitado'}</p>
                {selectedOrder?.customer_phone && <p className="text-sm text-muted-foreground mt-0.5">{selectedOrder?.customer_phone}</p>}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                    {selectedOrder?.customer_channel === 'web' ? 'Web' : 'App'}
                  </span>
                </div>
              </div>

              {/* Slot */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Retiro</h4>
                {(selectedOrder?.slot_time || selectedOrder?.pickup_slot) ? (
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <Icon name="Clock" size={16} className="text-primary" />
                    <span className="font-medium text-foreground">
                      {formatDate(selectedOrder?.slot_time || selectedOrder?.pickup_slot)} a las {formatTime(selectedOrder?.slot_time || selectedOrder?.pickup_slot)}
                    </span>
                    {getTimeRemaining(selectedOrder?.slot_time || selectedOrder?.pickup_slot) && (
                      <span className={`text-sm font-bold ml-auto ${getTimeRemaining(selectedOrder?.slot_time || selectedOrder?.pickup_slot)?.urgent ? 'text-red-600' : 'text-emerald-600'}`}>
                        {getTimeRemaining(selectedOrder?.slot_time || selectedOrder?.pickup_slot)?.text}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg">
                    <Icon name="BellRing" size={14} />
                    Sin slot · Avisa cuando listo
                  </span>
                )}
              </div>

              {/* Items */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Ítems del pedido</h4>
                <div className="space-y-2">
                  {(selectedOrder?.order_items || [])?.map((item, i) => (
                    <div key={i} className="flex items-start justify-between py-2 border-b border-border last:border-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{item?.quantity}× {item?.item_name}</p>
                        {item?.variants && Object.keys(item?.variants || {})?.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">{Object.entries(item?.variants)?.map(([k, v]) => `${k}: ${v}`)?.join(', ')}</p>
                        )}
                      </div>
                      <span className="text-sm font-medium text-foreground ml-3">${(item?.line_total || item?.subtotal || 0)?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                {/* Financial breakdown */}
                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${(selectedOrder?.subtotal || 0)?.toFixed(2)}</span>
                  </div>
                  {(selectedOrder?.discount_amount || 0) > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Descuento {selectedOrder?.coupon_code ? `(${selectedOrder?.coupon_code})` : ''}</span>
                      <span>-${(selectedOrder?.discount_amount || 0)?.toFixed(2)}</span>
                    </div>
                  )}
                  {(selectedOrder?.points_used || 0) > 0 && (
                    <div className="flex justify-between text-violet-600">
                      <span>Puntos usados</span>
                      <span>-{selectedOrder?.points_used} pts</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-foreground border-t border-border pt-1.5">
                    <span>Total</span>
                    <span>${(selectedOrder?.total || 0)?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Método de pago</span>
                    <span>{(selectedOrder?.payment_method === 'paid_online' || selectedOrder?.payment_status === 'paid_online') ? 'Pago online ✓' : 'Pagar al retirar'}</span>
                  </div>
                </div>
              </div>

              {/* Customer note */}
              {selectedOrder?.customer_notes && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Nota del cliente</h4>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-foreground italic">"{selectedOrder?.customer_notes}"</p>
                  </div>
                </div>
              )}

              {/* Status history */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Historial de estados</h4>
                <div className="space-y-2">
                  {(selectedOrder?.status_history || [])?.length === 0 && (
                    <p className="text-xs text-muted-foreground">Sin historial registrado</p>
                  )}
                  {(selectedOrder?.status_history || [])?.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      <span className="font-medium text-foreground capitalize">{STATUS_LABELS?.[h?.status] || h?.status}</span>
                      <span className="text-muted-foreground text-xs ml-auto">{formatDateTime(h?.timestamp)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Internal note */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Nota interna (solo staff)</h4>
                <textarea
                  value={internalNote}
                  onChange={e => setInternalNote(e?.target?.value)}
                  rows={3}
                  placeholder="Agregar nota interna..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
                <button
                  onClick={() => saveInternalNote(selectedOrder?.id)}
                  className="mt-2 px-4 py-1.5 bg-muted text-foreground rounded-lg text-sm hover:bg-muted/80 transition-colors"
                >
                  Guardar nota
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl text-sm text-foreground hover:bg-muted/50 transition-colors">
                  <Icon name="Bell" size={14} />
                  Notificar cliente
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl text-sm text-foreground hover:bg-muted/50 transition-colors">
                  <Icon name="Printer" size={14} />
                  Imprimir ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-foreground mb-1">Cancelar pedido {cancelModal?.order_number}</h3>
            <p className="text-sm text-muted-foreground mb-4">Selecciona el motivo de cancelación (obligatorio):</p>
            <div className="space-y-2 mb-4">
              {CANCEL_REASONS?.map(r => (
                <button
                  key={r}
                  onClick={() => setCancelReason(r)}
                  className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-colors ${cancelReason === r ? 'border-red-400 bg-red-50 text-red-700' : 'border-border text-foreground hover:bg-muted/50'}`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setCancelModal(null); setCancelReason(''); }} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted/50">Volver</button>
              <button onClick={handleCancel} disabled={!cancelReason} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
                Cancelar pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
