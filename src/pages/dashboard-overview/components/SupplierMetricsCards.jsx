import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { useCurrency } from '../../../contexts/CurrencyContext';

const SupplierMetricsCards = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchMetrics();
  }, [user?.id]);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const { data: orders } = await supabase
        ?.from('purchase_orders')
        ?.select('supplier_id, supplier_name, total_amount, status, created_at, received_at, sent_at')
        ?.eq('user_id', user?.id)
        ?.neq('status', 'cancelled');

      if (!orders || orders?.length === 0) {
        setMetrics(null);
        return;
      }

      // Top suppliers by volume
      const supplierVolume = {};
      orders?.forEach(o => {
        if (!supplierVolume?.[o?.supplier_name]) {
          supplierVolume[o.supplier_name] = { name: o?.supplier_name, total: 0, count: 0 };
        }
        supplierVolume[o.supplier_name].total += o?.total_amount || 0;
        supplierVolume[o.supplier_name].count += 1;
      });
      const topSuppliers = Object.values(supplierVolume)?.sort((a, b) => b?.total - a?.total)?.slice(0, 5);

      // Delivery time metrics
      const deliveredOrders = orders?.filter(o =>
        (o?.status === 'received_complete' || o?.status === 'received_partial') &&
        o?.sent_at && o?.received_at
      );
      let avgDeliveryDays = 0;
      if (deliveredOrders?.length > 0) {
        const totalDays = deliveredOrders?.reduce((sum, o) => {
          const sent = new Date(o.sent_at);
          const received = new Date(o.received_at);
          return sum + Math.max(0, (received - sent) / (1000 * 60 * 60 * 24));
        }, 0);
        avgDeliveryDays = (totalDays / deliveredOrders?.length)?.toFixed(1);
      }

      // Cost savings (paid vs total ordered)
      const totalOrdered = orders?.reduce((sum, o) => sum + (o?.total_amount || 0), 0);
      const paidOrders = orders?.filter(o => o?.status === 'paid');
      const totalPaid = paidOrders?.reduce((sum, o) => sum + (o?.total_amount || 0), 0);
      const pendingPayment = totalOrdered - totalPaid;

      // Defect/return rates (cancelled or partial)
      const partialOrCancelled = orders?.filter(o =>
        o?.status === 'received_partial' || o?.status === 'cancelled'
      )?.length;
      const defectRate = orders?.length > 0
        ? ((partialOrCancelled / orders?.length) * 100)?.toFixed(1)
        : 0;

      setMetrics({
        topSuppliers,
        avgDeliveryDays,
        totalOrdered,
        totalPaid,
        pendingPayment,
        defectRate,
        totalOrders: orders?.length,
        deliveredCount: deliveredOrders?.length
      });
    } catch (err) {
      console.error('Error fetching supplier metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1,2,3,4]?.map(i => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-3" />
            <div className="h-8 bg-muted rounded w-1/2 mb-2" />
            <div className="h-3 bg-muted rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const maxVolume = metrics?.topSuppliers?.[0]?.total || 1;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Icon name="Truck" size={20} className="text-primary" />
          Métricas de Proveedores
        </h2>
        <a href="/purchase-orders" className="text-sm text-primary hover:underline flex items-center gap-1">
          Ver pedidos <Icon name="ArrowRight" size={14} />
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Top Suppliers by Volume */}
        <div className="bg-card border border-border rounded-xl p-5 col-span-1 md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="TrendingUp" size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Top Proveedores</p>
              <p className="text-sm font-semibold text-foreground">Por Volumen de Compra</p>
            </div>
          </div>
          <div className="space-y-2">
            {metrics?.topSuppliers?.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin datos aún</p>
            ) : (
              metrics?.topSuppliers?.map((s, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-foreground truncate max-w-[120px]">{s?.name}</span>
                    <span className="text-muted-foreground">{formatPrice(s?.total)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: `${(s?.total / maxVolume) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Delivery Time Metrics */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={16} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tiempo de Entrega</p>
              <p className="text-sm font-semibold text-foreground">Promedio</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600 mb-1">
            {metrics?.avgDeliveryDays > 0 ? `${metrics?.avgDeliveryDays}d` : 'N/A'}
          </p>
          <p className="text-xs text-muted-foreground">
            Basado en {metrics?.deliveredCount} pedidos recibidos
          </p>
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1">
              <Icon name="PackageCheck" size={12} className="text-green-500" />
              <span className="text-xs text-muted-foreground">{metrics?.deliveredCount} entregados de {metrics?.totalOrders} totales</span>
            </div>
          </div>
        </div>

        {/* Cost Savings */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon name="DollarSign" size={16} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Compras Totales</p>
              <p className="text-sm font-semibold text-foreground">Historial de Costos</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-600 mb-1">{formatPrice(metrics?.totalOrdered)}</p>
          <p className="text-xs text-muted-foreground">Valor total ordenado</p>
          <div className="mt-3 pt-3 border-t border-border space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Pagado:</span>
              <span className="text-green-600 font-medium">{formatPrice(metrics?.totalPaid)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Pendiente:</span>
              <span className="text-orange-600 font-medium">{formatPrice(metrics?.pendingPayment)}</span>
            </div>
          </div>
        </div>

        {/* Defect/Return Rates */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <Icon name="AlertTriangle" size={16} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tasa de Defectos</p>
              <p className="text-sm font-semibold text-foreground">Devoluciones/Parciales</p>
            </div>
          </div>
          <p className={`text-3xl font-bold mb-1 ${
            parseFloat(metrics?.defectRate) > 20 ? 'text-red-600' :
            parseFloat(metrics?.defectRate) > 10 ? 'text-orange-500' : 'text-green-600'
          }`}>
            {metrics?.defectRate}%
          </p>
          <p className="text-xs text-muted-foreground">Pedidos con incidencias</p>
          <div className="mt-3">
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  parseFloat(metrics?.defectRate) > 20 ? 'bg-red-500' :
                  parseFloat(metrics?.defectRate) > 10 ? 'bg-orange-400' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(parseFloat(metrics?.defectRate), 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {parseFloat(metrics?.defectRate) <= 10 ? '✓ Tasa saludable' : '⚠ Revisar proveedores'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierMetricsCards;
