import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';

const paymentTermsLabel = {
  immediate: 'Pago inmediato',
  net15: 'Neto 15 días',
  net30: 'Neto 30 días',
  net45: 'Neto 45 días',
  net60: 'Neto 60 días'
};

const RatingStars = ({ rating, size = 16, interactive = false, onRate }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5]?.map(star => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
        >
          <Icon
            name="Star"
            size={size}
            className={star <= (hover || rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}
          />
        </button>
      ))}
    </div>
  );
};

// ---- Orders Tab ----
const OrdersTab = ({ supplierId, userId }) => {
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!supplierId || !userId) return;
      setLoading(true);
      try {
        const { data } = await supabase
          ?.from('purchase_orders')
          ?.select('id, order_number, status, total_amount, created_at, expected_delivery_date, notes, purchase_order_items(id, quantity, unit_price, catalog_items(name))')
          ?.eq('supplier_id', supplierId)
          ?.eq('user_id', userId)
          ?.order('created_at', { ascending: false });
        setOrders(data || []);
      } catch (e) {
        console.error('Orders fetch error:', e?.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [supplierId, userId]);

  const statusColors = {
    draft: 'bg-gray-100 text-gray-600',
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
  };

  if (loading) return <div className="py-12 text-center"><Icon name="Loader2" size={24} className="mx-auto animate-spin text-muted-foreground" /></div>;

  if (orders?.length === 0) return (
    <div className="py-12 text-center">
      <Icon name="ShoppingCart" size={32} className="mx-auto mb-2 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">No hay pedidos registrados con este proveedor</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {orders?.map(order => (
        <div key={order?.id} className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-semibold text-foreground text-sm">Pedido #{order?.order_number || order?.id?.slice(0, 8)}</p>
              <p className="text-xs text-muted-foreground">{order?.created_at ? new Date(order?.created_at)?.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors?.[order?.status] || 'bg-gray-100 text-gray-600'}`}>
                {order?.status || 'Borrador'}
              </span>
              <span className="text-sm font-bold text-foreground">{formatPrice(order?.total_amount || 0)}</span>
            </div>
          </div>
          {order?.purchase_order_items?.length > 0 && (
            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground mb-2">Artículos ({order?.purchase_order_items?.length})</p>
              <div className="space-y-1">
                {order?.purchase_order_items?.slice(0, 3)?.map(item => (
                  <div key={item?.id} className="flex items-center justify-between text-xs">
                    <span className="text-foreground">{item?.catalog_items?.name || 'Artículo'}</span>
                    <span className="text-muted-foreground">{item?.quantity} × {formatPrice(item?.unit_price || 0)}</span>
                  </div>
                ))}
                {order?.purchase_order_items?.length > 3 && (
                  <p className="text-xs text-muted-foreground">+{order?.purchase_order_items?.length - 3} más</p>
                )}
              </div>
            </div>
          )}
          {order?.expected_delivery_date && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <Icon name="Calendar" size={12} />
              <span>Entrega esperada: {new Date(order?.expected_delivery_date)?.toLocaleDateString('es-MX')}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ---- Products Tab ----
const ProductsTab = ({ supplierId, userId }) => {
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      if (!supplierId || !userId) return;
      setLoading(true);
      try {
        const { data } = await supabase
          ?.from('supplier_products')
          ?.select('id, unit_price, min_order_qty, lead_time_days, is_preferred, catalog_items(id, name, sku, description, price)')
          ?.eq('supplier_id', supplierId)
          ?.eq('user_id', userId);
        setProducts(data || []);
      } catch (e) {
        console.error('Products fetch error:', e?.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [supplierId, userId]);

  const filtered = products?.filter(p =>
    !search || p?.catalog_items?.name?.toLowerCase()?.includes(search?.toLowerCase()) ||
    p?.catalog_items?.sku?.toLowerCase()?.includes(search?.toLowerCase())
  );

  if (loading) return <div className="py-12 text-center"><Icon name="Loader2" size={24} className="mx-auto animate-spin text-muted-foreground" /></div>;

  return (
    <div>
      <div className="mb-4">
        <div className="relative">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e?.target?.value)}
            placeholder="Buscar productos..."
            className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
      {filtered?.length === 0 ? (
        <div className="py-12 text-center">
          <Icon name="Package" size={32} className="mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No hay productos vinculados a este proveedor</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered?.map(p => (
            <div key={p?.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="Package" size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{p?.catalog_items?.name || 'Producto'}</p>
                {p?.catalog_items?.sku && <p className="text-xs text-muted-foreground">SKU: {p?.catalog_items?.sku}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-foreground">{formatPrice(p?.unit_price || p?.catalog_items?.price || 0)}</p>
                {p?.min_order_qty && <p className="text-xs text-muted-foreground">Mín: {p?.min_order_qty} uds</p>}
              </div>
              {p?.is_preferred && (
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full flex-shrink-0">Preferido</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---- Receipts Tab ----
const ReceiptsTab = ({ supplierId, userId }) => {
  const { formatPrice } = useCurrency();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!supplierId || !userId) return;
      setLoading(true);
      try {
        const { data } = await supabase
          ?.from('goods_receipts')
          ?.select('id, receipt_number, received_at, status, total_received_value, notes, purchase_orders(order_number)')
          ?.eq('supplier_id', supplierId)
          ?.eq('user_id', userId)
          ?.order('received_at', { ascending: false });
        setReceipts(data || []);
      } catch (e) {
        console.error('Receipts fetch error:', e?.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [supplierId, userId]);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    partial: 'bg-orange-100 text-orange-700',
    complete: 'bg-green-100 text-green-700',
    discrepancy: 'bg-red-100 text-red-600',
  };

  if (loading) return <div className="py-12 text-center"><Icon name="Loader2" size={24} className="mx-auto animate-spin text-muted-foreground" /></div>;

  if (receipts?.length === 0) return (
    <div className="py-12 text-center">
      <Icon name="PackageCheck" size={32} className="mx-auto mb-2 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">No hay recepciones de mercancías registradas</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {receipts?.map(r => (
        <div key={r?.id} className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-sm text-foreground">Recepción #{r?.receipt_number || r?.id?.slice(0, 8)}</p>
              {r?.purchase_orders?.order_number && (
                <p className="text-xs text-muted-foreground">Pedido: #{r?.purchase_orders?.order_number}</p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">
                {r?.received_at ? new Date(r?.received_at)?.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors?.[r?.status] || 'bg-gray-100 text-gray-600'}`}>
                {r?.status === 'complete' ? 'Completa' : r?.status === 'partial' ? 'Parcial' : r?.status === 'discrepancy' ? 'Discrepancia' : 'Pendiente'}
              </span>
              <span className="text-sm font-bold text-foreground">{formatPrice(r?.total_received_value || 0)}</span>
            </div>
          </div>
          {r?.notes && (
            <p className="text-xs text-muted-foreground mt-2 border-t border-border pt-2">{r?.notes}</p>
          )}
        </div>
      ))}
    </div>
  );
};

// ---- Rating Tab ----
const RatingTab = ({ supplier, userId, onRatingUpdate }) => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ rating: 0, quality_rating: 0, delivery_rating: 0, price_rating: 0, service_rating: 0, comment: '' });

  const fetchRatings = useCallback(async () => {
    if (!supplier?.id || !userId) return;
    setLoading(true);
    try {
      const { data } = await supabase
        ?.from('supplier_ratings')
        ?.select('*')
        ?.eq('supplier_id', supplier?.id)
        ?.eq('user_id', userId)
        ?.order('created_at', { ascending: false });
      setRatings(data || []);
    } catch (e) {
      console.error('Ratings fetch error:', e?.message);
    } finally {
      setLoading(false);
    }
  }, [supplier?.id, userId]);

  useEffect(() => { fetchRatings(); }, [fetchRatings]);

  const handleSave = async () => {
    if (!form?.rating) return;
    setSaving(true);
    try {
      const { error } = await supabase?.from('supplier_ratings')?.insert({
        supplier_id: supplier?.id,
        user_id: userId,
        ...form,
      });
      if (error) throw error;
      // Update supplier avg rating
      const allRatings = [...ratings, form];
      const avg = allRatings?.reduce((s, r) => s + (r?.rating || 0), 0) / allRatings?.length;
      await supabase?.from('suppliers')?.update({ rating: Math.round(avg * 10) / 10 })?.eq('id', supplier?.id);
      setShowForm(false);
      setForm({ rating: 0, quality_rating: 0, delivery_rating: 0, price_rating: 0, service_rating: 0, comment: '' });
      await fetchRatings();
      onRatingUpdate?.();
    } catch (e) {
      console.error('Save rating error:', e?.message);
    } finally {
      setSaving(false);
    }
  };

  const avgRating = ratings?.length > 0 ? ratings?.reduce((s, r) => s + (r?.rating || 0), 0) / ratings?.length : 0;

  if (loading) return <div className="py-12 text-center"><Icon name="Loader2" size={24} className="mx-auto animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-5">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-600">{avgRating?.toFixed(1)}</div>
            <RatingStars rating={Math.round(avgRating)} size={18} onRate={() => {}} />
            <p className="text-xs text-muted-foreground mt-1">{ratings?.length} evaluaciones</p>
          </div>
          <div className="flex-1 space-y-2">
            {[
              { label: 'Calidad', key: 'quality_rating' },
              { label: 'Entrega', key: 'delivery_rating' },
              { label: 'Precio', key: 'price_rating' },
              { label: 'Servicio', key: 'service_rating' },
            ]?.map(dim => {
              const avg = ratings?.filter(r => r?.[dim?.key])?.reduce((s, r) => s + (r?.[dim?.key] || 0), 0) / (ratings?.filter(r => r?.[dim?.key])?.length || 1);
              return (
                <div key={dim?.key} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-16">{dim?.label}</span>
                  <div className="flex-1 bg-yellow-100 rounded-full h-1.5">
                    <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: `${(avg / 5) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium text-foreground w-6">{avg?.toFixed(1)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="default" size="sm" iconName="Plus" iconPosition="left" onClick={() => setShowForm(!showForm)}>
          Agregar evaluación
        </Button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h4 className="font-semibold text-foreground">Nueva evaluación</h4>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Calificación general *', key: 'rating' },
              { label: 'Calidad', key: 'quality_rating' },
              { label: 'Entrega', key: 'delivery_rating' },
              { label: 'Precio', key: 'price_rating' },
              { label: 'Servicio', key: 'service_rating' },
            ]?.map(dim => (
              <div key={dim?.key}>
                <label className="block text-xs font-medium text-foreground mb-1">{dim?.label}</label>
                <RatingStars rating={form?.[dim?.key]} size={20} interactive onRate={v => setForm(f => ({ ...f, [dim?.key]: v }))} />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Comentario</label>
            <textarea
              value={form?.comment}
              onChange={e => setForm(f => ({ ...f, comment: e?.target?.value }))}
              rows={3}
              placeholder="Describe tu experiencia con este proveedor..."
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button variant="default" size="sm" disabled={!form?.rating || saving} onClick={handleSave}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      )}

      {/* Ratings list */}
      <div className="space-y-3">
        {ratings?.map(r => (
          <div key={r?.id} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <RatingStars rating={r?.rating} size={14} onRate={() => {}} />
              <span className="text-xs text-muted-foreground">{r?.created_at ? new Date(r?.created_at)?.toLocaleDateString('es-MX') : '—'}</span>
            </div>
            {r?.comment && <p className="text-sm text-foreground">{r?.comment}</p>}
            <div className="flex gap-3 mt-2">
              {r?.quality_rating > 0 && <span className="text-xs text-muted-foreground">Calidad: {r?.quality_rating}</span>}
              {r?.delivery_rating > 0 && <span className="text-xs text-muted-foreground">Entrega: {r?.delivery_rating}</span>}
              {r?.price_rating > 0 && <span className="text-xs text-muted-foreground">Precio: {r?.price_rating}</span>}
              {r?.service_rating > 0 && <span className="text-xs text-muted-foreground">Servicio: {r?.service_rating}</span>}
            </div>
          </div>
        ))}
        {ratings?.length === 0 && (
          <div className="py-8 text-center">
            <Icon name="Star" size={28} className="mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Aún no hay evaluaciones</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ---- Analytics Tab ----
const AnalyticsTab = ({ supplier, userId }) => {
  const { formatPrice } = useCurrency();
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!supplier?.id || !userId) return;
      setLoading(true);
      try {
        const { data: orders } = await supabase
          ?.from('purchase_orders')
          ?.select('id, total_amount, status, created_at')
          ?.eq('supplier_id', supplier?.id)
          ?.eq('user_id', userId);

        const { data: receipts } = await supabase
          ?.from('goods_receipts')
          ?.select('id, total_received_value, status, received_at')
          ?.eq('supplier_id', supplier?.id)
          ?.eq('user_id', userId);

        const totalOrders = orders?.length || 0;
        const totalAmount = orders?.reduce((s, o) => s + (o?.total_amount || 0), 0);
        const deliveredOrders = orders?.filter(o => o?.status === 'delivered')?.length || 0;
        const deliveryRate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;
        const avgOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;

        setStats({ totalOrders, totalAmount, deliveredOrders, deliveryRate, avgOrderValue, totalReceipts: receipts?.length || 0 });

        // Monthly data (last 6 months)
        const months = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d?.setMonth(d?.getMonth() - i);
          const monthStr = d?.toISOString()?.slice(0, 7);
          const monthOrders = orders?.filter(o => o?.created_at?.startsWith(monthStr)) || [];
          months?.push({
            label: d?.toLocaleDateString('es-MX', { month: 'short' }),
            amount: monthOrders?.reduce((s, o) => s + (o?.total_amount || 0), 0),
            count: monthOrders?.length,
          });
        }
        setMonthlyData(months);
      } catch (e) {
        console.error('Analytics fetch error:', e?.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [supplier?.id, userId]);

  if (loading) return <div className="py-12 text-center"><Icon name="Loader2" size={24} className="mx-auto animate-spin text-muted-foreground" /></div>;

  const maxAmount = Math.max(...(monthlyData?.map(m => m?.amount) || [1]), 1);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total pedidos', value: stats?.totalOrders || 0, icon: 'ShoppingCart', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
          { label: 'Total comprado', value: formatPrice(stats?.totalAmount || 0), icon: 'TrendingUp', color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
          { label: 'Tasa de entrega', value: `${stats?.deliveryRate || 0}%`, icon: 'CheckCircle', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Valor prom. pedido', value: formatPrice(stats?.avgOrderValue || 0), icon: 'BarChart2', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
          { label: 'Recepciones', value: stats?.totalReceipts || 0, icon: 'PackageCheck', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
          { label: 'Calificación', value: `${supplier?.rating || 0}/5`, icon: 'Star', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100' },
        ]?.map((kpi, i) => (
          <div key={i} className={`${kpi?.bg} rounded-xl p-4 border`}>
            <div className="flex items-center gap-1.5 mb-2">
              <Icon name={kpi?.icon} size={14} className={kpi?.color} />
              <span className="text-xs text-muted-foreground">{kpi?.label}</span>
            </div>
            <p className={`text-lg font-bold ${kpi?.color}`}>{kpi?.value}</p>
          </div>
        ))}
      </div>

      {/* Monthly Chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h4 className="font-semibold text-foreground mb-4">Compras últimos 6 meses</h4>
        <div className="flex items-end gap-2 h-32">
          {monthlyData?.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-muted-foreground">{formatPrice(m?.amount, true)}</span>
              <div
                className="w-full bg-primary/20 rounded-t-md hover:bg-primary/40 transition-colors relative group"
                style={{ height: `${maxAmount > 0 ? (m?.amount / maxAmount) * 80 : 4}px`, minHeight: '4px' }}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10">
                  {m?.count} pedidos · {formatPrice(m?.amount)}
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{m?.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery performance */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h4 className="font-semibold text-foreground mb-4">Rendimiento de entregas</h4>
        <div className="space-y-3">
          {[
            { label: 'Pedidos entregados', value: stats?.deliveredOrders || 0, total: stats?.totalOrders || 1, color: 'bg-green-500' },
            { label: 'Pedidos pendientes', value: (stats?.totalOrders || 0) - (stats?.deliveredOrders || 0), total: stats?.totalOrders || 1, color: 'bg-yellow-500' },
          ]?.map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{item?.label}</span>
                <span className="font-medium text-foreground">{item?.value}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className={`${item?.color} h-2 rounded-full`} style={{ width: `${(item?.value / item?.total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---- Edit Form Modal ----
const EditSupplierModal = ({ supplier, categories, onSave, onClose, isSaving }) => {
  const [form, setForm] = useState({
    name: supplier?.name || '',
    contact_name: supplier?.contact_name || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    rfc: supplier?.rfc || '',
    tax_regime: supplier?.tax_regime || '',
    payment_terms: supplier?.payment_terms || 'net30',
    delivery_days: supplier?.delivery_days || '',
    notes: supplier?.notes || '',
    is_active: supplier?.is_active !== false,
    category_id: supplier?.category_id || '',
    website: supplier?.website || '',
    bank_name: supplier?.bank_name || '',
    bank_account: supplier?.bank_account || '',
    bank_clabe: supplier?.bank_clabe || '',
    // Address
    street: supplier?.street || '',
    ext_number: supplier?.ext_number || '',
    int_number: supplier?.int_number || '',
    neighborhood: supplier?.neighborhood || '',
    city: supplier?.city || '',
    state: supplier?.state || '',
    postal_code: supplier?.postal_code || '',
    country: supplier?.country || 'México',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-card rounded-xl border border-border shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Editar Proveedor</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><Icon name="X" size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          {/* General */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Icon name="Building2" size={16} className="text-primary" />Información general</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-foreground mb-1">Nombre del proveedor *</label>
                <input value={form?.name} onChange={e => set('name', e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Nombre de contacto</label>
                <input value={form?.contact_name} onChange={e => set('contact_name', e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Email</label>
                <input type="email" value={form?.email} onChange={e => set('email', e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Teléfono</label>
                <input value={form?.phone} onChange={e => set('phone', e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Sitio web</label>
                <input value={form?.website} onChange={e => set('website', e?.target?.value)} placeholder="https://..." className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Categoría</label>
                <select value={form?.category_id} onChange={e => set('category_id', e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Sin categoría</option>
                  {categories?.map(c => <option key={c?.id} value={c?.id}>{c?.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Estado</label>
                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" id="is_active_edit" checked={form?.is_active} onChange={e => set('is_active', e?.target?.checked)} className="w-4 h-4 text-primary rounded" />
                  <label htmlFor="is_active_edit" className="text-sm text-foreground cursor-pointer">Proveedor activo</label>
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Icon name="MapPin" size={16} className="text-primary" />Domicilio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-foreground mb-1">Calle</label>
                <input value={form?.street} onChange={e => set('street', e?.target?.value)} placeholder="Nombre de la calle" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Número exterior</label>
                <input value={form?.ext_number} onChange={e => set('ext_number', e?.target?.value)} placeholder="123" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Número interior</label>
                <input value={form?.int_number} onChange={e => set('int_number', e?.target?.value)} placeholder="A, 2B, etc." className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Colonia</label>
                <input value={form?.neighborhood} onChange={e => set('neighborhood', e?.target?.value)} placeholder="Nombre de la colonia" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Código postal</label>
                <input value={form?.postal_code} onChange={e => set('postal_code', e?.target?.value)} placeholder="06600" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Ciudad / Municipio</label>
                <input value={form?.city} onChange={e => set('city', e?.target?.value)} placeholder="Ciudad de México" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Estado</label>
                <input value={form?.state} onChange={e => set('state', e?.target?.value)} placeholder="CDMX" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">País</label>
                <input value={form?.country} onChange={e => set('country', e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
          </div>

          {/* Fiscal */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Icon name="FileText" size={16} className="text-primary" />Datos fiscales y bancarios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">RFC</label>
                <input value={form?.rfc} onChange={e => set('rfc', e?.target?.value)} placeholder="ABC123456789" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Régimen fiscal</label>
                <input value={form?.tax_regime} onChange={e => set('tax_regime', e?.target?.value)} placeholder="Persona Moral" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Banco</label>
                <input value={form?.bank_name} onChange={e => set('bank_name', e?.target?.value)} placeholder="BBVA, Santander..." className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Número de cuenta</label>
                <input value={form?.bank_account} onChange={e => set('bank_account', e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-foreground mb-1">CLABE interbancaria</label>
                <input value={form?.bank_clabe} onChange={e => set('bank_clabe', e?.target?.value)} placeholder="18 dígitos" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
          </div>

          {/* Commercial */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Icon name="Handshake" size={16} className="text-primary" />Condiciones comerciales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Términos de pago</label>
                <select value={form?.payment_terms} onChange={e => set('payment_terms', e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="immediate">Pago inmediato</option>
                  <option value="net15">Neto 15 días</option>
                  <option value="net30">Neto 30 días</option>
                  <option value="net45">Neto 45 días</option>
                  <option value="net60">Neto 60 días</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Días de entrega promedio</label>
                <input type="number" value={form?.delivery_days} onChange={e => set('delivery_days', e?.target?.value)} placeholder="3" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-foreground mb-1">Notas internas</label>
                <textarea value={form?.notes} onChange={e => set('notes', e?.target?.value)} rows={3} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="default" disabled={isSaving || !form?.name} onClick={() => onSave(form)} iconName={isSaving ? 'Loader2' : 'Save'} iconPosition="left">
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ---- Main Page ----
const SupplierProfileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [supplier, setSupplier] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [showEdit, setShowEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSupplier = useCallback(async () => {
    if (!id || !user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        ?.from('suppliers')
        ?.select('*, product_categories(id, name)')
        ?.eq('id', id)
        ?.eq('user_id', user?.id)
        ?.single();
      if (error) throw error;
      setSupplier(data);
    } catch (e) {
      console.error('Supplier fetch error:', e?.message);
    } finally {
      setLoading(false);
    }
  }, [id, user?.id]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await supabase?.from('product_categories')?.select('id, name')?.eq('is_active', true)?.order('name');
      setCategories(data || []);
    } catch (e) {
      console.error('Categories fetch error:', e?.message);
    }
  }, []);

  useEffect(() => {
    fetchSupplier();
    fetchCategories();
  }, [fetchSupplier, fetchCategories]);

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        ?.from('suppliers')
        ?.update({ ...formData, updated_at: new Date()?.toISOString() })
        ?.eq('id', id);
      if (error) throw error;
      await fetchSupplier();
      setShowEdit(false);
    } catch (e) {
      console.error('Save error:', e?.message);
      alert('Error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'orders', label: 'Pedidos', icon: 'ShoppingCart' },
    { id: 'products', label: 'Productos', icon: 'Package' },
    { id: 'receipts', label: 'Recepciones', icon: 'PackageCheck' },
    { id: 'rating', label: 'Calificación', icon: 'Star' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart2' },
  ];

  const fullAddress = [
    supplier?.street && `${supplier?.street}${supplier?.ext_number ? ' #' + supplier?.ext_number : ''}${supplier?.int_number ? ' Int. ' + supplier?.int_number : ''}`,
    supplier?.neighborhood,
    supplier?.city,
    supplier?.state,
    supplier?.postal_code && `CP ${supplier?.postal_code}`,
    supplier?.country,
  ]?.filter(Boolean)?.join(', ') || supplier?.address || '—';

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Header user={user} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isMenuOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} />
      <main className="pt-16 lg:ml-72 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Icon name="Loader2" size={32} className="animate-spin text-primary" />
      </main>
    </div>
  );

  if (!supplier) return (
    <div className="min-h-screen bg-background">
      <Header user={user} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isMenuOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} />
      <main className="pt-16 lg:ml-72 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <Icon name="Truck" size={48} className="text-muted-foreground/40 mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Proveedor no encontrado</h2>
        <Button variant="default" onClick={() => navigate('/suppliers')} iconName="ArrowLeft" iconPosition="left">Volver a proveedores</Button>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isMenuOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} />
      <main className="pt-16 lg:ml-72">
        <div className="p-6 max-w-7xl mx-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
            <button onClick={() => navigate('/suppliers')} className="hover:text-foreground transition-colors flex items-center gap-1">
              <Icon name="ArrowLeft" size={16} />
              Proveedores
            </button>
            <Icon name="ChevronRight" size={14} />
            <span className="text-foreground font-medium truncate">{supplier?.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Profile Card */}
            <div className="lg:col-span-1 space-y-4">
              {/* Main card */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Icon name="Truck" size={28} className="text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${supplier?.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${supplier?.is_active ? 'bg-green-500' : 'bg-red-400'}`} />
                      {supplier?.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                    <button onClick={() => setShowEdit(true)} className="p-2 hover:bg-muted rounded-lg transition-colors" title="Editar proveedor">
                      <Icon name="Pencil" size={16} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <h1 className="text-xl font-bold text-foreground mb-1">{supplier?.name}</h1>
                {supplier?.contact_name && <p className="text-sm text-muted-foreground mb-3">{supplier?.contact_name}</p>}

                {/* Category badge */}
                {(supplier?.product_categories?.name || supplier?.category) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium mb-4">
                    <Icon name="Tag" size={12} />
                    {supplier?.product_categories?.name || supplier?.category}
                  </span>
                )}

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <RatingStars rating={Math.round(supplier?.rating || 0)} size={16} onRate={() => {}} />
                  <span className="text-sm font-semibold text-foreground">{supplier?.rating || 0}</span>
                  <span className="text-xs text-muted-foreground">/ 5</span>
                </div>

                {/* Contact info */}
                <div className="space-y-2">
                  {supplier?.email && (
                    <a href={`mailto:${supplier?.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <Icon name="Mail" size={14} className="flex-shrink-0" />
                      <span className="truncate">{supplier?.email}</span>
                    </a>
                  )}
                  {supplier?.phone && (
                    <a href={`tel:${supplier?.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <Icon name="Phone" size={14} className="flex-shrink-0" />
                      <span>{supplier?.phone}</span>
                    </a>
                  )}
                  {supplier?.website && (
                    <a href={supplier?.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <Icon name="Globe" size={14} className="flex-shrink-0" />
                      <span className="truncate">{supplier?.website?.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Address card */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Icon name="MapPin" size={16} className="text-primary" />
                  Domicilio
                </h3>
                <div className="space-y-2 text-sm">
                  {supplier?.street && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-24 flex-shrink-0">Calle:</span>
                      <span className="text-foreground">{supplier?.street} {supplier?.ext_number ? `#${supplier?.ext_number}` : ''} {supplier?.int_number ? `Int. ${supplier?.int_number}` : ''}</span>
                    </div>
                  )}
                  {supplier?.neighborhood && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-24 flex-shrink-0">Colonia:</span>
                      <span className="text-foreground">{supplier?.neighborhood}</span>
                    </div>
                  )}
                  {supplier?.postal_code && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-24 flex-shrink-0">C.P.:</span>
                      <span className="text-foreground">{supplier?.postal_code}</span>
                    </div>
                  )}
                  {supplier?.city && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-24 flex-shrink-0">Ciudad:</span>
                      <span className="text-foreground">{supplier?.city}</span>
                    </div>
                  )}
                  {supplier?.state && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-24 flex-shrink-0">Estado:</span>
                      <span className="text-foreground">{supplier?.state}</span>
                    </div>
                  )}
                  {supplier?.country && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-24 flex-shrink-0">País:</span>
                      <span className="text-foreground">{supplier?.country}</span>
                    </div>
                  )}
                  {!supplier?.street && !supplier?.neighborhood && supplier?.address && (
                    <p className="text-foreground">{supplier?.address}</p>
                  )}
                  {!supplier?.street && !supplier?.neighborhood && !supplier?.address && (
                    <p className="text-muted-foreground italic text-xs">Sin domicilio registrado</p>
                  )}
                </div>
              </div>

              {/* Fiscal & Commercial */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Icon name="FileText" size={16} className="text-primary" />
                  Datos fiscales
                </h3>
                <div className="space-y-2 text-sm">
                  {supplier?.rfc && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-24 flex-shrink-0">RFC:</span>
                      <span className="text-foreground font-mono">{supplier?.rfc}</span>
                    </div>
                  )}
                  {supplier?.tax_regime && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-24 flex-shrink-0">Régimen:</span>
                      <span className="text-foreground">{supplier?.tax_regime}</span>
                    </div>
                  )}
                  {supplier?.bank_name && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-24 flex-shrink-0">Banco:</span>
                      <span className="text-foreground">{supplier?.bank_name}</span>
                    </div>
                  )}
                  {supplier?.bank_clabe && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-24 flex-shrink-0">CLABE:</span>
                      <span className="text-foreground font-mono text-xs">{supplier?.bank_clabe}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Commercial terms */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Icon name="Handshake" size={16} className="text-primary" />
                  Condiciones comerciales
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/40 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Términos de pago</p>
                    <p className="text-xs font-semibold text-foreground mt-0.5">{paymentTermsLabel?.[supplier?.payment_terms] || supplier?.payment_terms || '—'}</p>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Días de entrega</p>
                    <p className="text-xs font-semibold text-foreground mt-0.5">{supplier?.delivery_days ? `${supplier?.delivery_days} días` : '—'}</p>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Total comprado</p>
                    <p className="text-xs font-semibold text-foreground mt-0.5">{formatPrice(supplier?.total_purchased || 0)}</p>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Total pedidos</p>
                    <p className="text-xs font-semibold text-foreground mt-0.5">{supplier?.total_orders || 0}</p>
                  </div>
                </div>
                {supplier?.notes && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Notas internas</p>
                    <p className="text-sm text-foreground">{supplier?.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Tabs */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Tab bar */}
                <div className="border-b border-border overflow-x-auto">
                  <div className="flex min-w-max">
                    {tabs?.map(tab => (
                      <button
                        key={tab?.id}
                        onClick={() => setActiveTab(tab?.id)}
                        className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                          activeTab === tab?.id
                            ? 'border-primary text-primary bg-primary/5' :'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                        }`}
                      >
                        <Icon name={tab?.icon} size={16} />
                        {tab?.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab content */}
                <div className="p-6">
                  {activeTab === 'orders' && <OrdersTab supplierId={id} userId={user?.id} />}
                  {activeTab === 'products' && <ProductsTab supplierId={id} userId={user?.id} />}
                  {activeTab === 'receipts' && <ReceiptsTab supplierId={id} userId={user?.id} />}
                  {activeTab === 'rating' && <RatingTab supplier={supplier} userId={user?.id} onRatingUpdate={fetchSupplier} />}
                  {activeTab === 'analytics' && <AnalyticsTab supplier={supplier} userId={user?.id} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showEdit && (
        <EditSupplierModal
          supplier={supplier}
          categories={categories}
          onSave={handleSave}
          onClose={() => setShowEdit(false)}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};

export default SupplierProfileDetail;
