import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import OrderCard from './OrderCard';
import OrderDetailDrawer from './OrderDetailDrawer';
import { supabase } from '../../../lib/supabase';

const COLUMNS = [
  { id: 'pending', label: 'Nuevo', color: 'bg-blue-500', lightColor: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700' },
  { id: 'confirmed', label: 'Confirmado', color: 'bg-amber-500', lightColor: 'bg-amber-50 border-amber-200', textColor: 'text-amber-700' },
  { id: 'ready', label: 'Listo', color: 'bg-emerald-500', lightColor: 'bg-emerald-50 border-emerald-200', textColor: 'text-emerald-700' },
  { id: 'completed', label: 'Completado', color: 'bg-slate-400', lightColor: 'bg-slate-50 border-slate-200', textColor: 'text-slate-600' },
  { id: 'cancelled', label: 'Cancelado', color: 'bg-red-400', lightColor: 'bg-red-50 border-red-200', textColor: 'text-red-600', collapsed: true },
];

const STATUS_NEXT = { pending: 'confirmed', confirmed: 'ready', ready: 'completed' };

const MOCK_ORDERS = [
  { id: '1', order_number: '#001', customer_name: 'María García', customer_phone: '+52 55 1234 5678', order_status: 'pending', payment_status: 'pay_on_pickup', pickup_slot: new Date(Date.now() + 45 * 60000)?.toISOString(), subtotal: 185, discount_amount: 0, total: 185, created_at: new Date(Date.now() - 5 * 60000)?.toISOString(), order_items: [{ item_name: 'Tacos de Canasta x3', quantity: 1, subtotal: 85 }, { item_name: 'Agua de Jamaica 1L', quantity: 1, subtotal: 35 }, { item_name: 'Quesadilla de Flor', quantity: 1, subtotal: 65 }], status_history: [] },
  { id: '2', order_number: '#002', customer_name: 'Carlos López', customer_phone: '+52 55 9876 5432', order_status: 'confirmed', payment_status: 'paid_online', pickup_slot: new Date(Date.now() + 60 * 60000)?.toISOString(), subtotal: 320, discount_amount: 0, total: 320, created_at: new Date(Date.now() - 20 * 60000)?.toISOString(), order_items: [{ item_name: 'Combo Familiar', quantity: 1, subtotal: 320 }], status_history: [{ to_status: 'confirmed', changed_by: 'staff', created_at: new Date(Date.now() - 15 * 60000)?.toISOString() }] },
  { id: '3', order_number: '#003', customer_name: 'Ana Martínez', customer_phone: '+52 55 5555 4444', order_status: 'ready', payment_status: 'pay_on_pickup', pickup_slot: new Date(Date.now() + 8 * 60000)?.toISOString(), subtotal: 95, discount_amount: 0, total: 95, created_at: new Date(Date.now() - 45 * 60000)?.toISOString(), order_items: [{ item_name: 'Torta Cubana', quantity: 1, subtotal: 95 }], status_history: [] },
  { id: '4', order_number: '#004', customer_name: 'Roberto Sánchez', customer_phone: '+52 55 3333 2222', order_status: 'completed', payment_status: 'paid_online', pickup_slot: new Date(Date.now() - 2 * 3600000)?.toISOString(), subtotal: 450, discount_amount: 0, total: 450, created_at: new Date(Date.now() - 3 * 3600000)?.toISOString(), order_items: [{ item_name: 'Menú del Día x4', quantity: 1, subtotal: 450 }], status_history: [] },
  { id: '5', order_number: '#005', customer_name: 'Invitado', customer_phone: null, order_status: 'pending', payment_status: 'pay_on_pickup', pickup_slot: new Date(Date.now() + 2 * 3600000)?.toISOString(), subtotal: 75, discount_amount: 0, total: 75, created_at: new Date(Date.now() - 2 * 60000)?.toISOString(), order_items: [{ item_name: 'Café Americano', quantity: 1, subtotal: 45 }, { item_name: 'Pan de Dulce', quantity: 1, subtotal: 30 }], status_history: [] },
];

const LiveOrdersManagement = () => {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [dateFilter, setDateFilter] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [collapsedCols, setCollapsedCols] = useState({ cancelled: true });
  const [isConnected, setIsConnected] = useState(true);
  const [kitchenMode, setKitchenMode] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Supabase Realtime subscription
    const channel = supabase?.channel('orders-realtime')?.on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload?.eventType === 'INSERT') {
          setOrders(prev => [{ ...payload?.new, order_items: [], status_history: [] }, ...prev]);
          if (soundAlerts) {
            // Play notification sound
            try { audioRef?.current?.play(); } catch (e) {}
          }
        } else if (payload?.eventType === 'UPDATE') {
          setOrders(prev => prev?.map(o => o?.id === payload?.new?.id ? { ...o, ...payload?.new } : o));
        }
      })?.subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => { supabase?.removeChannel(channel); };
  }, [soundAlerts]);

  const handleAction = async (order) => {
    const nextStatus = STATUS_NEXT?.[order?.order_status];
    if (!nextStatus) return;
    setOrders(prev => prev?.map(o => o?.id === order?.id ? { ...o, order_status: nextStatus } : o));
    try {
      await supabase?.from('orders')?.update({ order_status: nextStatus, updated_at: new Date()?.toISOString() })?.eq('id', order?.id);
    } catch (e) {}
  };

  const handleStatusChange = async (order, newStatus, reason) => {
    setOrders(prev => prev?.map(o => o?.id === order?.id ? { ...o, order_status: newStatus, cancelled_reason: reason } : o));
    try {
      await supabase?.from('orders')?.update({ order_status: newStatus, cancelled_reason: reason, updated_at: new Date()?.toISOString() })?.eq('id', order?.id);
    } catch (e) {}
  };

  const filteredOrders = orders?.filter(o => {
    if (showActiveOnly && ['completed', 'cancelled']?.includes(o?.order_status)) return false;
    if (searchQuery) {
      const q = searchQuery?.toLowerCase();
      return o?.order_number?.toLowerCase()?.includes(q) || o?.customer_name?.toLowerCase()?.includes(q);
    }
    return true;
  });

  const getColumnOrders = (colId) => filteredOrders?.filter(o => o?.order_status === colId);

  const visibleColumns = kitchenMode
    ? COLUMNS?.filter(c => ['confirmed', 'ready']?.includes(c?.id))
    : COLUMNS;

  if (kitchenMode) {
    return (
      <div className="fixed inset-0 bg-gray-950 z-50 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black text-white">🍳 Modo Cocina</h1>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className="text-sm font-medium">{isConnected ? 'En línea' : 'Sin conexión'}</span>
            </div>
            <button onClick={() => setKitchenMode(false)} className="px-4 py-2 bg-white/10 text-white rounded-xl text-sm hover:bg-white/20">
              Salir del modo cocina
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {visibleColumns?.map(col => {
            const colOrders = getColumnOrders(col?.id);
            return (
              <div key={col?.id}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-4 h-4 rounded-full ${col?.color}`} />
                  <h2 className="text-2xl font-black text-white">{col?.label}</h2>
                  <span className="text-xl font-bold text-white/60">({colOrders?.length})</span>
                </div>
                <div className="space-y-4">
                  {colOrders?.map(order => (
                    <div key={order?.id} className="bg-white/10 rounded-2xl p-5 border border-white/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-black text-white">{order?.order_number}</span>
                        <span className="text-lg font-bold text-white/70">
                          {order?.pickup_slot ? new Date(order.pickup_slot)?.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-xl font-semibold text-white mb-2">{order?.customer_name}</p>
                      {order?.order_items?.map((item, i) => (
                        <p key={i} className="text-base text-white/70">{item?.quantity}× {item?.item_name}</p>
                      ))}
                      {col?.id === 'confirmed' && (
                        <button onClick={() => handleAction(order)} className="mt-4 w-full py-3 bg-emerald-500 text-white rounded-xl text-lg font-bold hover:bg-emerald-600">
                          ✓ Marcar listo
                        </button>
                      )}
                    </div>
                  ))}
                  {colOrders?.length === 0 && (
                    <div className="text-center py-12 text-white/30 text-lg">Sin pedidos</div>
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
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date filter */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
            {[{ id: 'today', label: 'Hoy' }, { id: 'tomorrow', label: 'Mañana' }, { id: 'custom', label: 'Fecha' }]?.map(f => (
              <button key={f?.id} onClick={() => setDateFilter(f?.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${dateFilter === f?.id ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {f?.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e?.target?.value)}
              placeholder="Buscar por número o nombre..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-xl bg-background text-foreground" />
          </div>

          {/* Active only toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <button onClick={() => setShowActiveOnly(!showActiveOnly)}
              className={`relative w-9 h-5 rounded-full transition-colors ${showActiveOnly ? 'bg-primary' : 'bg-slate-300'}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${showActiveOnly ? 'left-4' : 'left-0.5'}`} />
            </button>
            <span className="text-sm text-foreground">Solo activos</span>
          </label>

          {/* Sound toggle */}
          <button onClick={() => setSoundAlerts(!soundAlerts)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border transition-colors ${soundAlerts ? 'border-primary/30 bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`}>
            <Icon name={soundAlerts ? 'Volume2' : 'VolumeX'} size={14} />
            Sonido
          </button>

          {/* Kitchen mode */}
          <button onClick={() => setKitchenMode(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border border-border text-foreground hover:bg-muted/50">
            <Icon name="Monitor" size={14} />
            Modo cocina
          </button>

          {/* Connection indicator */}
          <div className={`flex items-center gap-1.5 ${isConnected ? 'text-emerald-600' : 'text-red-500'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs font-medium">{isConnected ? 'En línea' : 'Sin conexión'}</span>
          </div>
        </div>
      </div>
      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {visibleColumns?.map(col => {
          const colOrders = getColumnOrders(col?.id);
          const isCollapsed = collapsedCols?.[col?.id];

          return (
            <div key={col?.id} className={`flex-shrink-0 transition-all ${isCollapsed ? 'w-16' : 'w-72'}`}>
              {/* Column header */}
              <div
                className={`flex items-center justify-between p-3 rounded-xl border mb-3 cursor-pointer ${col?.lightColor}`}
                onClick={() => setCollapsedCols(prev => ({ ...prev, [col?.id]: !prev?.[col?.id] }))}
              >
                {isCollapsed ? (
                  <div className="flex flex-col items-center gap-1 w-full">
                    <div className={`w-3 h-3 rounded-full ${col?.color}`} />
                    <span className={`text-xs font-bold ${col?.textColor} writing-mode-vertical`} style={{ writingMode: 'vertical-rl' }}>{col?.label}</span>
                    <span className={`text-xs font-bold ${col?.textColor}`}>{colOrders?.length}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${col?.color}`} />
                      <span className={`text-sm font-bold ${col?.textColor}`}>{col?.label}</span>
                    </div>
                    <span className={`text-sm font-bold ${col?.textColor} bg-white/60 px-2 py-0.5 rounded-full`}>{colOrders?.length}</span>
                  </>
                )}
              </div>
              {/* Cards */}
              {!isCollapsed && (
                <div className="space-y-3 min-h-[200px]">
                  {colOrders?.map(order => (
                    <div key={order?.id} className="animate-fadeIn">
                      <OrderCard
                        order={order}
                        onAction={handleAction}
                        onViewDetail={(o) => { setSelectedOrder(o); setIsDrawerOpen(true); }}
                        onCancel={(o) => { setSelectedOrder(o); setIsDrawerOpen(true); }}
                      />
                    </div>
                  ))}
                  {colOrders?.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Icon name="Inbox" size={24} className="text-muted-foreground/40 mb-2" />
                      <p className="text-xs text-muted-foreground">Sin pedidos</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Detail drawer */}
      <OrderDetailDrawer
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setSelectedOrder(null); }}
        onStatusChange={handleStatusChange}
        onNotify={(o) => console.log('Notify', o)}
      />
    </div>
  );
};

export default LiveOrdersManagement;
