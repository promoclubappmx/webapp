import React, { useState, useEffect, useMemo } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';
import PurchaseOrderCard from './components/PurchaseOrderCard';
import PurchaseOrderForm from './components/PurchaseOrderForm';
import PurchaseOrderPrint from './components/PurchaseOrderPrint';
import PurchaseOrderDetailModal from './components/PurchaseOrderDetailModal';
import BulkPOModal from './components/BulkPOModal';
import RecurringOrderModal from './components/RecurringOrderModal';

const STATUS_CONFIG = {
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' },
  in_process: { label: 'En proceso', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  received_partial: { label: 'Recibido parcial', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  received_complete: { label: 'Recibido completo', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  paid: { label: 'Pagado', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  pending_payment: { label: 'Pendiente de pago', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-300' }
};

const SortIcon = ({ field, sortField, sortDir }) => {
  if (sortField !== field) return <Icon name="ChevronsUpDown" size={13} className="text-muted-foreground/50" />;
  return sortDir === 'asc'
    ? <Icon name="ChevronUp" size={13} className="text-primary" />
    : <Icon name="ChevronDown" size={13} className="text-primary" />;
};

const generateOrderNumber = () => {
  const now = new Date();
  const year = now?.getFullYear();
  const month = String(now?.getMonth() + 1)?.padStart(2, '0');
  const day = String(now?.getDate())?.padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `PO-${year}${month}${day}-${random}`;
};

const PurchaseOrders = () => {
  const { user } = useAuth();
  const { formatPrice, currencySettings } = useCurrency();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [printOrder, setPrintOrder] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [filterEstablishment, setFilterEstablishment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);
  const [showBulkPO, setShowBulkPO] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  const [products, setProducts] = useState([]);
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [viewMode, setViewMode] = useState('table');
  const [recurringEnabled, setRecurringEnabled] = useState(false);

  const showTaxInOrders = currencySettings?.taxSettings?.showTaxInOrders ?? true;
  const taxRate = currencySettings?.taxRate ?? 16;
  const taxLabel = currencySettings?.taxSettings?.taxLabel || 'IVA';
  const taxIncluded = currencySettings?.taxSettings?.taxIncludedInPrice ?? true;

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: err } = await supabase?.from('purchase_orders')?.select(`
          *,
          purchase_order_items (
            id,
            catalog_item_id,
            quantity_ordered,
            unit_cost,
            total_cost,
            item_name,
            sku,
            notes,
            catalog_items (
              id,
              name,
              sku
            ),
            business_locations (
              id,
              branch_name,
              location_name
            )
          )
        `)?.eq('user_id', user?.id)?.order('created_at', { ascending: false });

      if (err) throw err;

      const ordersWithItems = (data || [])?.map(order => ({
        ...order,
        items_count: order?.purchase_order_items?.length || 0,
        establishment_name: order?.business_locations?.branch_name || order?.business_locations?.location_name || null,
        order_items: order?.purchase_order_items?.map(item => ({
          product_name: item?.catalog_items?.name || item?.item_name || 'Sin nombre',
          sku: item?.catalog_items?.sku || item?.sku || '',
          quantity: item?.quantity_ordered,
          unit_cost: item?.unit_cost,
          subtotal: item?.total_cost
        })) || []
      }));

      setOrders(ordersWithItems);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Error al cargar pedidos');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const checkStockAlerts = async () => {
    try {
      const { data } = await supabase?.from('catalog_items')?.select('*')?.eq('user_id', user?.id);
      const lowStock = (data || [])?.filter(item =>
        item?.stock_quantity !== null && item?.min_stock_level !== null &&
        item?.stock_quantity <= item?.min_stock_level
      );
      setAlerts(lowStock);
    } catch (err) {
      console.error('Error checking stock alerts:', err);
    }
  };

  const fetchRecurringConfig = async () => {
    try {
      const { data } = await supabase?.from('recurring_order_config')?.select('*')?.eq('user_id', user?.id)?.single();
      setRecurringEnabled(data?.is_enabled || false);
    } catch {
      setRecurringEnabled(false);
    }
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      const orderNumber = generateOrderNumber();
      const supplier = suppliers?.find(s => s?.id === formData?.supplier_id);
      const subtotal = formData?.subtotal_amount || formData?.total_amount || 0;
      const taxAmt = formData?.tax_amount || (subtotal * taxRate / 100);
      const total = formData?.total_amount || (subtotal + taxAmt);

      const { data: newOrder, error: orderErr } = await supabase?.from('purchase_orders')?.insert({
        user_id: user?.id,
        order_number: orderNumber,
        supplier_id: formData?.supplier_id,
        supplier_name: supplier?.name,
        supplier_email: supplier?.email,
        supplier_phone: supplier?.phone,
        location_id: formData?.location_id || null,
        order_date: formData?.order_date || new Date()?.toISOString()?.split('T')?.[0],
        status: 'in_process',
        subtotal_amount: subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmt,
        total_amount: total,
        notes: formData?.notes,
        is_auto_generated: false
      })?.select()?.single();

      if (orderErr) throw orderErr;

      if (formData?.items?.length > 0) {
        const items = formData?.items?.map(item => ({
          purchase_order_id: newOrder?.id,
          catalog_item_id: item?.catalog_item_id || null,
          item_name: item?.item_name || '',
          sku: item?.sku || null,
          quantity_ordered: parseInt(item?.quantity) || 1,
          unit_cost: parseFloat(item?.unit_cost) || 0,
          total_cost: (parseFloat(item?.unit_cost) || 0) * (parseInt(item?.quantity) || 1),
          notes: item?.notes || null
        }));
        const { error: itemsErr } = await supabase?.from('purchase_order_items')?.insert(items);
        if (itemsErr) throw itemsErr;
      }

      await fetchOrders();
      setShowForm(false);
      return newOrder;
    } catch (err) {
      console.error('Error saving order:', err);
      alert('Error al guardar el pedido: ' + err?.message);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const updateData = { status: newStatus, updated_at: new Date()?.toISOString() };
      if (newStatus === 'sent') updateData.sent_at = new Date()?.toISOString();
      if (newStatus === 'received_complete' || newStatus === 'received_partial') {
        updateData.received_at = new Date()?.toISOString();
        if (newStatus === 'received_complete') {
          const order = orders?.find(o => o?.id === orderId);
          if (order?.purchase_order_items) {
            for (const item of order?.purchase_order_items) {
              if (item?.catalog_item_id) {
                const { data: ci } = await supabase?.from('catalog_items')?.select('stock_quantity')?.eq('id', item?.catalog_item_id)?.single();
                if (ci) {
                  await supabase?.from('catalog_items')?.update({ stock_quantity: (ci?.stock_quantity || 0) + (item?.quantity_ordered || 0) })?.eq('id', item?.catalog_item_id);
                }
              }
            }
          }
        }
      }
      const { error: err } = await supabase?.from('purchase_orders')?.update(updateData)?.eq('id', orderId);
      if (err) throw err;
      await fetchOrders();
      await checkStockAlerts();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error al actualizar el estado');
    }
  };

  const handleAutoGenerateOrder = async (item) => {
    const supplier = suppliers?.[0];
    if (!supplier) {
      alert('Necesitas al menos un proveedor activo para generar pedidos automáticos');
      return;
    }
    setIsSaving(true);
    try {
      const orderNumber = generateOrderNumber();
      const optimalQty = Math.max((item?.optimal_stock_level || item?.min_stock_level * 3) - item?.stock_quantity, item?.min_stock_level);
      const subtotal = (item?.cost || 0) * optimalQty;
      const taxAmt = subtotal * taxRate / 100;
      const { data: newOrder, error: orderErr } = await supabase?.from('purchase_orders')?.insert({
        user_id: user?.id,
        order_number: orderNumber,
        supplier_id: supplier?.id,
        supplier_name: supplier?.name,
        supplier_email: supplier?.email,
        order_date: new Date()?.toISOString()?.split('T')?.[0],
        status: 'draft',
        subtotal_amount: subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmt,
        total_amount: subtotal + taxAmt,
        is_auto_generated: true,
        notes: `Pedido automático: ${item?.name} llegó a stock mínimo (${item?.stock_quantity} uds)`
      })?.select()?.single();
      if (orderErr) throw orderErr;
      await supabase?.from('purchase_order_items')?.insert({
        purchase_order_id: newOrder?.id,
        catalog_item_id: item?.id,
        item_name: item?.name,
        sku: item?.sku,
        quantity_ordered: optimalQty,
        unit_cost: item?.cost || 0,
        total_cost: (item?.cost || 0) * optimalQty
      });
      await fetchOrders();
      alert(`Pedido automático ${orderNumber} creado para ${item?.name}`);
    } catch (err) {
      console.error('Error generating auto order:', err);
      alert('Error al generar pedido automático');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkSave = async (bulkOrders) => {
    setIsSaving(true);
    const createdOrders = [];
    try {
      for (const orderData of bulkOrders) {
        const orderNumber = generateOrderNumber();
        const subtotal = orderData?.subtotal_amount || orderData?.total_amount || 0;
        const taxAmt = orderData?.tax_amount || (subtotal * taxRate / 100);
        const total = subtotal + taxAmt;
        const { data: newOrder, error: orderErr } = await supabase?.from('purchase_orders')?.insert({
          user_id: user?.id,
          order_number: orderNumber,
          supplier_id: orderData?.supplier_id,
          supplier_name: orderData?.supplier_name,
          supplier_email: orderData?.supplier_email,
          supplier_phone: orderData?.supplier_phone,
          location_id: orderData?.location_id || null,
          order_date: new Date()?.toISOString()?.split('T')?.[0],
          status: 'in_process',
          subtotal_amount: subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmt,
          total_amount: total,
          notes: orderData?.notes,
          is_auto_generated: true
        })?.select()?.single();
        if (orderErr) throw orderErr;
        if (orderData?.items?.length > 0) {
          const items = orderData?.items?.map(item => ({
            purchase_order_id: newOrder?.id,
            catalog_item_id: item?.catalog_item_id || null,
            item_name: item?.item_name || item?.product_name || '',
            sku: item?.sku || null,
            quantity_ordered: parseInt(item?.quantity) || 1,
            unit_cost: parseFloat(item?.unit_cost) || 0,
            total_cost: (parseFloat(item?.unit_cost) || 0) * (parseInt(item?.quantity) || 1)
          }));
          await supabase?.from('purchase_order_items')?.insert(items);
        }
        createdOrders?.push({ ...newOrder, supplier_name: orderData?.supplier_name, items: orderData?.items });
      }
      await fetchOrders();
      setShowBulkPO(false);
      return createdOrders;
    } catch (err) {
      console.error(err);
      alert('Error al generar pedidos: ' + err?.message);
      return [];
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRecurring = async (formData) => {
    setIsSaving(true);
    try {
      // Ensure we have a valid user ID - try multiple fallbacks
      let userId = user?.id;
      if (!userId) {
        const { data: sessionData } = await supabase?.auth?.getSession();
        userId = sessionData?.session?.user?.id;
      }
      if (!userId) {
        const { data: userData } = await supabase?.auth?.getUser();
        userId = userData?.user?.id;
      }
      if (!userId) throw new Error('Usuario no autenticado');

      const { error: err } = await supabase?.rpc('upsert_recurring_order_config', {
        p_user_id: userId,
        p_is_enabled: formData?.is_enabled,
        p_frequency: formData?.frequency || 'weekly'
      });
      if (err) throw err;
      setRecurringEnabled(formData?.is_enabled);
      setShowRecurring(false);
      if (formData?.is_enabled) {
        alert('Pedidos recurrentes automáticos activados. El sistema generará pedidos para todos los proveedores con productos en stock bajo o cero.');
      } else {
        alert('Pedidos recurrentes automáticos desactivados.');
      }
    } catch (err) {
      console.error(err);
      alert('Error: ' + err?.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filteredOrders = useMemo(() => {
    let result = orders?.filter(o => {
      const matchStatus = filterStatus === 'all' || o?.status === filterStatus;
      const matchSupplier = filterSupplier === 'all' || o?.supplier_id === filterSupplier;
      const matchEstablishment = filterEstablishment === 'all' || o?.location_id === filterEstablishment;
      const q = searchQuery?.toLowerCase();
      const matchSearch = !q ||
        o?.order_number?.toLowerCase()?.includes(q) ||
        o?.supplier_name?.toLowerCase()?.includes(q) ||
        o?.notes?.toLowerCase()?.includes(q);
      return matchStatus && matchSupplier && matchEstablishment && matchSearch;
    });

    result = [...result]?.sort((a, b) => {
      let aVal = a?.[sortField];
      let bVal = b?.[sortField];
      if (sortField === 'total_amount') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      } else if (sortField === 'created_at' || sortField === 'expected_delivery_date') {
        aVal = aVal ? new Date(aVal)?.getTime() : 0;
        bVal = bVal ? new Date(bVal)?.getTime() : 0;
      } else {
        aVal = (aVal || '')?.toString()?.toLowerCase();
        bVal = (bVal || '')?.toString()?.toLowerCase();
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [orders, filterStatus, filterSupplier, filterEstablishment, searchQuery, sortField, sortDir]);

  const stats = useMemo(() => {
    const active = orders?.filter(o => !['cancelled', 'paid']?.includes(o?.status));
    const received = orders?.filter(o => ['received_complete', 'received_partial']?.includes(o?.status));
    const avgDays = received?.length > 0
      ? received?.reduce((sum, o) => {
          if (!o?.sent_at || !o?.received_at) return sum;
          const diff = (new Date(o?.received_at) - new Date(o?.sent_at)) / (1000 * 60 * 60 * 24);
          return sum + diff;
        }, 0) / received?.filter(o => o?.sent_at && o?.received_at)?.length
      : 0;
    return {
      total: orders?.length,
      activeValue: active?.reduce((sum, o) => sum + (o?.total_amount || 0), 0),
      pending: orders?.filter(o => ['draft', 'sent', 'in_process']?.includes(o?.status))?.length,
      pendingPayment: orders?.filter(o => o?.status === 'pending_payment')?.length,
      avgReceiptDays: isNaN(avgDays) ? 0 : avgDays,
      paidValue: orders?.filter(o => o?.status === 'paid')?.reduce((sum, o) => sum + (o?.total_amount || 0), 0)
    };
  }, [orders]);

  const uniqueSuppliers = useMemo(() => {
    const map = new Map();
    orders?.forEach(o => {
      if (o?.supplier_id && o?.supplier_name) map?.set(o?.supplier_id, o?.supplier_name);
    });
    return Array.from(map?.entries())?.map(([id, name]) => ({ id, name }));
  }, [orders]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr)?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
      checkStockAlerts();
      fetchRecurringConfig();
      fetchEstablishments();
      supabase?.from('suppliers')?.select('*')?.eq('user_id', user?.id)?.eq('is_active', true)?.then(({ data }) => {
        setSuppliers(data || []);
      });
      supabase?.from('catalog_items')?.select('*')?.eq('user_id', user?.id)?.then(({ data }) => {
        setProducts(data || []);
      });
    }
  }, [user?.id]);

  const fetchEstablishments = async () => {
    if (!user?.id) return;
    try {
      const { data: profile } = await supabase
        ?.from('user_profiles')
        ?.select('user_id')
        ?.eq('id', user?.id)
        ?.single();
      const businessId = profile?.user_id || user?.id;
      const { data } = await supabase
        ?.from('business_locations')
        ?.select('id, location_name, location_code, is_active')
        ?.eq('business_id', businessId)
        ?.eq('is_active', true)
        ?.order('location_name', { ascending: true });
      setEstablishments(data || []);
    } catch (err) {
      console.error('Error loading establishments:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isMenuOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} />
      <main className="pt-16 lg:ml-72">
        <div className="p-6">
          {/* Page Header */}
          <div className="flex items-start justify-between mb-4 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Icon name="ShoppingCart" size={24} className="text-primary" />
                Pedidos de Compra
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">Control de pedidos, recepciones y pagos a proveedores</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRecurring(true)}
                iconName="RefreshCw"
                iconPosition="left"
                className={recurringEnabled ? 'border-purple-400 text-purple-700 bg-purple-50 hover:bg-purple-100' : 'border-purple-300 text-purple-600 hover:bg-purple-50'}
              >
                {recurringEnabled ? 'Desactivar Recurrentes Automáticos' : 'Activar Recurrentes Automáticos'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkPO(true)}
                iconName="Zap"
                iconPosition="left"
                className="border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-100"
              >
                Pedido Automático
              </Button>
              <Button variant="default" onClick={() => setShowForm(true)} iconName="Plus" iconPosition="left">Nuevo Pedido</Button>
            </div>
          </div>

          {/* Establishment Selector */}
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Icon name="Building2" size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Establecimiento</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterEstablishment('all')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filterEstablishment === 'all' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                Todos los establecimientos
              </button>
              {establishments?.map(est => (
                <button
                  key={est?.id}
                  onClick={() => setFilterEstablishment(est?.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filterEstablishment === est?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  {est?.location_name}
                  {est?.location_code && (
                    <span className="ml-1.5 opacity-70 text-xs">({est?.location_code})</span>
                  )}
                </button>
              ))}
              {establishments?.length === 0 && (
                <p className="text-sm text-muted-foreground">No hay establecimientos registrados</p>
              )}
            </div>
            {filterEstablishment !== 'all' && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Icon name="Info" size={12} />
                Mostrando pedidos de: <span className="font-medium text-foreground ml-1">{establishments?.find(e => e?.id === filterEstablishment)?.location_name || ''}</span>
              </p>
            )}
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Icon name="TrendingUp" size={20} className="text-blue-600" />
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Activas</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{formatPrice(stats?.activeValue)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total en órdenes activas</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                  <Icon name="Clock" size={20} className="text-yellow-600" />
                </div>
                <span className="text-2xl font-bold text-yellow-600">{stats?.pending}</span>
              </div>
              <p className="text-sm font-semibold text-foreground">Órdenes pendientes</p>
              <p className="text-xs text-muted-foreground mt-0.5">Borrador, enviado o en proceso</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Icon name="Timer" size={20} className="text-purple-600" />
                </div>
                <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Promedio</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats?.avgReceiptDays > 0 ? `${stats?.avgReceiptDays?.toFixed(1)} días` : 'N/A'}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Tiempo promedio de recepción</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Icon name="CheckCircle" size={20} className="text-emerald-600" />
                </div>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Pagado</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{formatPrice(stats?.paidValue)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Valor total pagado</p>
            </div>
          </div>

          {/* Stock Alerts */}
          {alerts?.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="AlertTriangle" size={18} className="text-orange-600" />
                <h3 className="font-semibold text-orange-800">{alerts?.length} producto(s) con stock bajo o sin stock</h3>
              </div>
              <div className="space-y-2">
                {alerts?.slice(0, 5)?.map(item => (
                  <div key={item?.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-orange-200">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item?.name}</p>
                      <p className="text-xs text-orange-600">Stock actual: <strong>{item?.stock_quantity}</strong> | Mínimo: <strong>{item?.min_stock_level}</strong></p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleAutoGenerateOrder(item)} iconName="Zap" iconPosition="left" disabled={isSaving} className="text-orange-700 border-orange-300 hover:bg-orange-50">Generar pedido</Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IVA Summary Banner */}
          {showTaxInOrders && stats?.activeValue > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Receipt" size={16} className="text-primary" />
                <span className="text-sm font-semibold text-foreground">Desglose de {taxLabel} — Pedidos activos</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Subtotal (sin {taxLabel})</p>
                  <p className="text-sm font-bold text-foreground">{formatPrice(taxIncluded ? stats?.activeValue / (1 + taxRate / 100) : stats?.activeValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{taxLabel} ({taxRate}%)</p>
                  <p className="text-sm font-bold text-primary">{formatPrice(taxIncluded ? stats?.activeValue - stats?.activeValue / (1 + taxRate / 100) : stats?.activeValue * (taxRate / 100))}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total con {taxLabel}</p>
                  <p className="text-sm font-bold text-foreground">{formatPrice(taxIncluded ? stats?.activeValue : stats?.activeValue * (1 + taxRate / 100))}</p>
                </div>
              </div>
            </div>
          )}

          {/* Filters & Search Bar */}
          <div className="bg-card border border-border rounded-xl p-4 mb-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por número de orden o proveedor..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e?.target?.value)}
                  className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Filter" size={15} className="text-muted-foreground shrink-0" />
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e?.target?.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">Todos los estados</option>
                  {Object.entries(STATUS_CONFIG)?.map(([val, cfg]) => (
                    <option key={val} value={val}>{cfg?.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={filterSupplier}
                  onChange={e => setFilterSupplier(e?.target?.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">Todos los proveedores</option>
                  {uniqueSuppliers?.map(s => <option key={s?.id} value={s?.id}>{s?.name}</option>)}
                </select>
              </div>
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 text-sm transition-colors ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`}
                >
                  <Icon name="List" size={15} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`}
                >
                  <Icon name="LayoutGrid" size={15} />
                </button>
              </div>
            </div>
            {(filterStatus !== 'all' || filterSupplier !== 'all' || filterEstablishment !== 'all' || searchQuery) && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border flex-wrap">
                <span className="text-xs text-muted-foreground">Filtros activos:</span>
                {filterStatus !== 'all' && (
                  <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {STATUS_CONFIG?.[filterStatus]?.label}
                    <button onClick={() => setFilterStatus('all')}><Icon name="X" size={10} /></button>
                  </span>
                )}
                {filterSupplier !== 'all' && (
                  <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {uniqueSuppliers?.find(s => s?.id === filterSupplier)?.name}
                    <button onClick={() => setFilterSupplier('all')}><Icon name="X" size={10} /></button>
                  </span>
                )}
                {filterEstablishment !== 'all' && (
                  <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {establishments?.find(e => e?.id === filterEstablishment)?.location_name || 'Establecimiento'}
                    <button onClick={() => setFilterEstablishment('all')}><Icon name="X" size={10} /></button>
                  </span>
                )}
                {searchQuery && (
                  <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery('')}><Icon name="X" size={10} /></button>
                  </span>
                )}
                <span className="text-xs text-muted-foreground ml-auto">{filteredOrders?.length} resultado(s)</span>
              </div>
            )}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Icon name="Loader2" size={32} className="animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
          ) : filteredOrders?.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-xl">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="ShoppingCart" size={24} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No hay pedidos</h3>
              <p className="text-muted-foreground mb-4">
                {filterStatus !== 'all' || searchQuery ? 'No hay pedidos que coincidan con los filtros' : 'Crea tu primer pedido de compra'}
              </p>
              {filterStatus === 'all' && !searchQuery && (
                <Button variant="default" onClick={() => setShowForm(true)} iconName="Plus" iconPosition="left">Nuevo Pedido</Button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders?.map(order => (
                <PurchaseOrderCard
                  key={order?.id}
                  order={order}
                  onUpdateStatus={handleUpdateStatus}
                  onPrint={setPrintOrder}
                  onView={setViewOrder}
                  onReceive={(id) => navigate(`/goods-receipt/receive/${id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {[
                        { key: 'order_number', label: 'N° Pedido' },
                        { key: 'supplier_name', label: 'Proveedor' },
                        { key: 'establishment_name', label: 'Establecimiento' },
                        { key: 'status', label: 'Estado' },
                        { key: 'items_count', label: 'Productos' },
                        { key: 'total_amount', label: 'Total' },
                        { key: 'order_date', label: 'Fecha pedido' },
                        { key: 'created_at', label: 'Creado' },
                      ]?.map(col => (
                        <th
                          key={col?.key}
                          onClick={() => handleSort(col?.key)}
                          className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none"
                        >
                          <div className="flex items-center gap-1">
                            {col?.label}
                            <SortIcon field={col?.key} sortField={sortField} sortDir={sortDir} />
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredOrders?.map(order => {
                      const st = STATUS_CONFIG?.[order?.status] || STATUS_CONFIG?.draft;
                      return (
                        <tr key={order?.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {order?.is_auto_generated && (
                                <span title="Auto-generado"><Icon name="Zap" size={12} className="text-yellow-500" /></span>
                              )}
                              <span className="text-sm font-mono font-semibold text-foreground">{order?.order_number}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-foreground">{order?.supplier_name}</p>
                              {order?.supplier_email && (
                                <p className="text-xs text-muted-foreground">{order?.supplier_email}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {order?.establishment_name ? (
                              <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                <Icon name="Store" size={10} />
                                {order?.establishment_name}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${st?.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${st?.dot}`} />
                              {st?.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-foreground">{order?.items_count || order?.order_items?.length || 0}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-semibold text-foreground">{formatPrice(order?.total_amount || 0)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-foreground">{formatDate(order?.order_date || order?.created_at)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-muted-foreground">{formatDate(order?.created_at)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => setViewOrder(order)} className="p-1.5 hover:bg-muted rounded-lg transition-colors" title="Ver detalle">
                                <Icon name="Eye" size={15} className="text-muted-foreground" />
                              </button>
                              <button onClick={() => setPrintOrder(order)} className="p-1.5 hover:bg-muted rounded-lg transition-colors" title="Imprimir">
                                <Icon name="Printer" size={15} className="text-muted-foreground" />
                              </button>
                              {order?.status === 'draft' && (
                                <button onClick={() => handleUpdateStatus(order?.id, 'in_process')} className="p-1.5 hover:bg-yellow-50 rounded-lg transition-colors" title="Marcar en proceso">
                                  <Icon name="Play" size={15} className="text-yellow-500" />
                                </button>
                              )}
                              {order?.status === 'in_process' && (
                                <button
                                  onClick={() => navigate(`/goods-receipt/receive/${order?.id}`)}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                                >
                                  <Icon name="PackageCheck" size={13} />
                                  Recibir
                                </button>
                              )}
                              {['received_complete', 'received_partial', 'pending_payment']?.includes(order?.status) && (
                                <button onClick={() => handleUpdateStatus(order?.id, 'paid')} className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors" title="Marcar como pagado">
                                  <Icon name="CheckCircle" size={15} className="text-emerald-500" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{filteredOrders?.length} de {orders?.length} pedidos</span>
                <span className="text-xs font-semibold text-foreground">
                  Total filtrado: {formatPrice(filteredOrders?.reduce((s, o) => s + (o?.total_amount || 0), 0))}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl">
            <PurchaseOrderForm
              suppliers={suppliers}
              establishments={establishments}
              taxRate={taxRate}
              taxLabel={taxLabel}
              onSave={handleSave}
              onCancel={() => setShowForm(false)}
              isLoading={isSaving}
              order={null}
            />
          </div>
        </div>
      )}

      {/* Print Modal */}
      {printOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl">
            <PurchaseOrderPrint order={printOrder} onClose={() => setPrintOrder(null)} />
          </div>
        </div>
      )}

      {/* Recurring Orders Modal */}
      {showRecurring && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <RecurringOrderModal
            isEnabled={recurringEnabled}
            userId={user?.id}
            establishments={establishments}
            onSave={handleSaveRecurring}
            onClose={() => setShowRecurring(false)}
          />
        </div>
      )}

      {/* View Detail Modal */}
      {viewOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl">
            <PurchaseOrderDetailModal order={viewOrder} onClose={() => setViewOrder(null)} onPrint={setPrintOrder} />
          </div>
        </div>
      )}

      {/* Bulk PO Modal */}
      {showBulkPO && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <BulkPOModal
            suppliers={suppliers}
            establishments={establishments}
            userId={user?.id}
            taxRate={taxRate}
            taxLabel={taxLabel}
            onSave={handleBulkSave}
            onClose={() => setShowBulkPO(false)}
            isLoading={isSaving}
          />
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
