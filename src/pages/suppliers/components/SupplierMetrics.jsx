import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';

import { useCurrency } from '../../../contexts/CurrencyContext';

const SupplierMetrics = ({ supplierId, supplierName }) => {
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (supplierId) fetchMetrics();
  }, [supplierId]);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        supabase?.from('purchase_orders')?.select('*')?.eq('supplier_id', supplierId)?.order('created_at', { ascending: false }),
        supabase?.from('supplier_products')?.select('*, catalog_items(name, sku, price)')?.eq('supplier_id', supplierId)
      ]);

      const ordersData = ordersRes?.data || [];
      const productsData = productsRes?.data || [];

      const totalPurchased = ordersData?.filter(o => o?.status === 'received_complete' || o?.status === 'paid')?.reduce((sum, o) => sum + (o?.total_amount || 0), 0);
      const avgDelivery = ordersData?.filter(o => o?.received_at && o?.sent_at)?.reduce((sum, o, _, arr) => {
        const days = Math.round((new Date(o.received_at) - new Date(o.sent_at)) / (1000 * 60 * 60 * 24));
        return sum + days / arr?.length;
      }, 0);
      const onTimeOrders = ordersData?.filter(o => o?.delivered_on_time)?.length;
      const reliability = ordersData?.length > 0 ? Math.round((onTimeOrders / ordersData?.length) * 100) : 0;

      setMetrics({ totalPurchased, totalOrders: ordersData?.length, avgDelivery: Math.round(avgDelivery), reliability });
      setOrders(ordersData?.slice(0, 10));
      setProducts(productsData);
    } catch (err) {
      console.error('Error fetching supplier metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const statusLabel = {
    draft: { label: 'Borrador', color: 'bg-muted text-muted-foreground' },
    sent: { label: 'Enviado', color: 'bg-blue-100 text-blue-700' },
    in_process: { label: 'En proceso', color: 'bg-yellow-100 text-yellow-700' },
    received_partial: { label: 'Recibido parcial', color: 'bg-orange-100 text-orange-700' },
    received_complete: { label: 'Recibido completo', color: 'bg-green-100 text-green-700' },
    paid: { label: 'Pagado', color: 'bg-emerald-100 text-emerald-700' },
    pending_payment: { label: 'Pendiente pago', color: 'bg-red-100 text-red-700' },
    cancelled: { label: 'Cancelado', color: 'bg-muted text-muted-foreground' }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-12">
      <Icon name="Loader2" size={24} className="animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Métricas: {supplierName}</h3>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total comprado', value: formatPrice(metrics?.totalPurchased || 0), icon: 'DollarSign', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Pedidos realizados', value: metrics?.totalOrders || 0, icon: 'ShoppingCart', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Entrega promedio', value: `${metrics?.avgDelivery || 0} días`, icon: 'Clock', color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Confiabilidad', value: `${metrics?.reliability || 0}%`, icon: 'Shield', color: 'text-purple-600', bg: 'bg-purple-50' }
        ]?.map((kpi, i) => (
          <div key={i} className={`${kpi?.bg} rounded-xl p-4 border border-border`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon name={kpi?.icon} size={16} className={kpi?.color} />
              <span className="text-xs text-muted-foreground">{kpi?.label}</span>
            </div>
            <p className={`text-xl font-bold ${kpi?.color}`}>{kpi?.value}</p>
          </div>
        ))}
      </div>
      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {['overview', 'orders', 'products']?.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === tab ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'
          }`}>
            {tab === 'overview' ? 'Resumen' : tab === 'orders' ? 'Historial de Pedidos' : 'Productos'}
          </button>
        ))}
      </div>
      {activeTab === 'orders' && (
        <div className="space-y-2">
          {orders?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No hay pedidos registrados</p>
          ) : orders?.map(order => (
            <div key={order?.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">{order?.order_number}</p>
                <p className="text-xs text-muted-foreground">{new Date(order.created_at)?.toLocaleDateString('es-MX')}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusLabel?.[order?.status]?.color || 'bg-muted text-muted-foreground'}`}>
                  {statusLabel?.[order?.status]?.label || order?.status}
                </span>
                <span className="text-sm font-semibold text-foreground">{formatPrice(order?.total_amount || 0)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {activeTab === 'products' && (
        <div className="space-y-2">
          {products?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No hay productos asociados</p>
          ) : products?.map(sp => (
            <div key={sp?.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">{sp?.catalog_items?.name}</p>
                <p className="text-xs text-muted-foreground">SKU: {sp?.catalog_items?.sku || '—'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{formatPrice(sp?.purchase_price || 0)}</p>
                <p className="text-xs text-muted-foreground">Precio de compra</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupplierMetrics;
