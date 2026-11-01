import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import InventoryTable from './components/InventoryTable';
import StockAlerts from './components/StockAlerts';
import AdjustmentModal from './components/AdjustmentModal';
import AdjustmentHistory from './components/AdjustmentHistory';
import { supabase } from '../../lib/supabase';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const InventoryManagement = () => {
  const { user: authUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'received_today', 'alerts', 'history'
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [receivedTodayItems, setReceivedTodayItems] = useState([]);
  const [isLoadingToday, setIsLoadingToday] = useState(false);
  const navigate = useNavigate();

  // Establishments
  const [establishments, setEstablishments] = useState([]);
  const [loadingEstablishments, setLoadingEstablishments] = useState(false);
  const [selectedEstablishment, setSelectedEstablishment] = useState('all');

  // Inventory items from Supabase catalog
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Categories derived from items
  const [categories, setCategories] = useState([]);

  const { formatPrice } = useCurrency();

  const user = {
    id: authUser?.id,
    name: authUser?.user_metadata?.full_name || 'Admin',
    email: authUser?.email || '',
    role: 'owner'
  };

  // Load establishments
  useEffect(() => {
    const fetchEstablishments = async () => {
      if (!authUser?.id) return;
      setLoadingEstablishments(true);
      try {
        const { data: profile } = await supabase
          ?.from('user_profiles')
          ?.select('user_id')
          ?.eq('id', authUser?.id)
          ?.single();
        const businessId = profile?.user_id || authUser?.id;
        const { data } = await supabase
          ?.from('business_locations')
          ?.select('id, location_name, location_code, is_active')
          ?.eq('business_id', businessId)
          ?.eq('is_active', true)
          ?.order('location_name', { ascending: true });
        setEstablishments(data || []);
      } catch (err) {
        console.error('Error loading establishments:', err);
      } finally {
        setLoadingEstablishments(false);
      }
    };
    fetchEstablishments();
  }, [authUser?.id]);

  // Load catalog items as inventory
  const fetchInventoryItems = useCallback(async () => {
    if (!authUser?.id) return;
    setLoadingItems(true);
    try {
      let query = supabase
        ?.from('catalog_items')
        ?.select('id, name, sku, category_id, price, cost, stock_quantity, min_stock_level, max_stock_level, image_url, updated_at, business_location_id, metadata, status')
        ?.eq('user_id', authUser?.id)
        ?.eq('status', 'active')
        ?.eq('business_type', 'product')
        ?.order('name', { ascending: true });

      if (selectedEstablishment !== 'all') {
        query = query?.eq('business_location_id', selectedEstablishment);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch category names
      const catIds = [...new Set((data || [])?.map(i => i?.category_id)?.filter(Boolean))];
      let catMap = {};
      if (catIds?.length > 0) {
        const { data: cats } = await supabase
          ?.from('categories')
          ?.select('id, name')
          ?.in('id', catIds);
        (cats || [])?.forEach(c => { catMap[c?.id] = c?.name; });
      }

      const mapped = (data || [])?.map(item => ({
        id: item?.id,
        name: item?.name,
        sku: item?.sku || '',
        category: catMap?.[item?.category_id] || 'Sin categoría',
        categoryId: item?.category_id,
        stockQuantity: item?.stock_quantity || 0,
        minStockLevel: item?.min_stock_level || 0,
        maxStockLevel: item?.max_stock_level || 100,
        price: item?.price || 0,
        cost: item?.cost || 0,
        lastAdjustment: item?.updated_at,
        imageUrl: item?.image_url,
        businessLocationId: item?.business_location_id,
      }));

      setInventoryItems(mapped);

      // Derive unique categories
      const uniqueCats = [...new Set(mapped?.map(i => i?.category))]?.filter(c => c !== 'Sin categoría');
      setCategories(uniqueCats);
    } catch (err) {
      console.error('Error loading inventory:', err);
      setInventoryItems([]);
    } finally {
      setLoadingItems(false);
    }
  }, [authUser?.id, selectedEstablishment, refreshTrigger]);

  useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  // Load received today items
  useEffect(() => {
    loadReceivedToday();
  }, [authUser?.id]);

  const loadReceivedToday = async () => {
    if (!authUser?.id) return;
    setIsLoadingToday(true);
    try {
      const todayStart = new Date();
      todayStart?.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd?.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        ?.from('goods_receipt_items')
        ?.select(`
          *,
          goods_receipts!inner(
            receipt_number,
            purchase_order_number,
            supplier_name,
            received_date,
            status
          )
        `)
        ?.gte('goods_receipts.received_date', todayStart?.toISOString())
        ?.lte('goods_receipts.received_date', todayEnd?.toISOString())
        ?.gt('quantity_received', 0);

      if (error) throw error;

      if (data && data?.length > 0) {
        const mapped = data?.map(item => ({
          id: item?.id,
          receipt_number: item?.goods_receipts?.receipt_number,
          purchase_order_number: item?.goods_receipts?.purchase_order_number,
          supplier_name: item?.goods_receipts?.supplier_name,
          received_at: item?.goods_receipts?.received_date,
          product_name: item?.product_name,
          sku: item?.sku,
          quantity_received: item?.quantity_received,
          unit_cost: item?.unit_cost,
          batch_number: item?.batch_number,
          expiry_date: item?.expiry_date,
          status: item?.goods_receipts?.status
        }));
        setReceivedTodayItems(mapped);
      } else {
        setReceivedTodayItems([]);
      }
    } catch (err) {
      console.error('Error loading received today:', err);
      setReceivedTodayItems([]);
    } finally {
      setIsLoadingToday(false);
    }
  };

  // Real-time subscriptions - consolidated into single channel
  useEffect(() => {
    if (!authUser?.id) return;
    const channel = supabase
      ?.channel(`inventory_management_${authUser?.id}`)
      ?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'catalog_items' },
        (payload) => {
          // Only refresh if the change is for the current user's items
          if (payload?.new?.user_id === authUser?.id || payload?.old?.user_id === authUser?.id) {
            setRefreshTrigger(prev => prev + 1);
          } else {
            // Refresh anyway since we can't always determine ownership from payload
            setRefreshTrigger(prev => prev + 1);
          }
        }
      )
      ?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stock_alerts' },
        () => setRefreshTrigger(prev => prev + 1)
      )
      ?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory_adjustments' },
        () => setRefreshTrigger(prev => prev + 1)
      )
      ?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'goods_receipt_items' },
        () => loadReceivedToday()
      )
      ?.subscribe();
    return () => { supabase?.removeChannel(channel); };
  }, [authUser?.id]);

  const handleAdjustStock = (item) => {
    setSelectedItem(item);
    setShowAdjustmentModal(true);
  };

  const handleSaveAdjustment = async (adjustmentData) => {
    try {
      // Update catalog_items stock_quantity in Supabase
      const { error } = await supabase
        ?.from('catalog_items')
        ?.update({
          stock_quantity: adjustmentData?.newQuantity,
          updated_at: new Date()?.toISOString()
        })
        ?.eq('id', selectedItem?.id);

      if (error) throw error;

      // Log adjustment
      await supabase?.from('inventory_adjustments')?.insert({
        user_id: authUser?.id,
        catalog_item_id: selectedItem?.id,
        product_name: selectedItem?.name,
        adjustment_type: adjustmentData?.adjustmentType,
        quantity_change: adjustmentData?.quantityChange,
        previous_quantity: adjustmentData?.previousQuantity,
        new_quantity: adjustmentData?.newQuantity,
        reason: adjustmentData?.reason,
        notes: adjustmentData?.notes,
      })?.select();

      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error saving adjustment:', err);
    }
    setShowAdjustmentModal(false);
    setSelectedItem(null);
  };

  const filteredItems = inventoryItems?.filter(item => {
    const matchesSearch = item?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         item?.sku?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item?.category === filterCategory;
    const matchesStock = filterStock === 'all' ||
                        (filterStock === 'low' && item?.stockQuantity < item?.minStockLevel && item?.stockQuantity > 0) ||
                        (filterStock === 'out' && item?.stockQuantity === 0);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const stats = {
    totalItems: inventoryItems?.length,
    lowStock: inventoryItems?.filter(item => item?.stockQuantity < item?.minStockLevel && item?.stockQuantity > 0)?.length,
    outOfStock: inventoryItems?.filter(item => item?.stockQuantity === 0)?.length,
    totalValue: inventoryItems?.reduce((sum, item) => sum + (item?.stockQuantity * (item?.cost || 0)), 0)
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr)?.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr)?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Group received today items by receipt
  const groupedByReceipt = receivedTodayItems?.reduce((acc, item) => {
    const key = item?.receipt_number;
    if (!acc?.[key]) {
      acc[key] = {
        receipt_number: item?.receipt_number,
        purchase_order_number: item?.purchase_order_number,
        supplier_name: item?.supplier_name,
        received_at: item?.received_at,
        status: item?.status,
        items: []
      };
    }
    acc?.[key]?.items?.push(item);
    return acc;
  }, {});

  const todayTotalValue = receivedTodayItems?.reduce((s, i) => s + (i?.quantity_received || 0) * (i?.unit_cost || 0), 0);
  const todayTotalItems = receivedTodayItems?.length;
  const todayUniqueReceipts = Object.keys(groupedByReceipt)?.length;

  const selectedEstablishmentName = selectedEstablishment === 'all' ?'Todos los establecimientos'
    : establishments?.find(e => e?.id === selectedEstablishment)?.location_name || '';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={user}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        } overflow-y-auto`}>
          <div className="p-6 max-w-[1920px] mx-auto space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="min-w-0">
                <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                  <Link to="/catalog-management" className="hover:text-foreground transition-colors truncate">
                    Catálogo
                  </Link>
                  <Icon name="ChevronRight" size={14} className="flex-shrink-0" />
                  <span className="text-foreground font-medium truncate">Gestión de Inventario</span>
                </nav>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestión de Inventario</h1>
                <p className="text-muted-foreground mt-1 text-sm md:text-base">Controla el stock, ajusta cantidades y monitorea alertas de inventario</p>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => navigate('/goods-receipt')}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors whitespace-nowrap"
                >
                  <Icon name="PackageCheck" size={16} />
                  Ver Recepciones
                </button>
              </div>
            </div>

            {/* Establishment Selector */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Icon name="Building2" size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Establecimiento</span>
                {loadingEstablishments && (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedEstablishment('all')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedEstablishment === 'all' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  Todos los establecimientos
                </button>
                {establishments?.map(est => (
                  <button
                    key={est?.id}
                    onClick={() => setSelectedEstablishment(est?.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedEstablishment === est?.id
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
                {!loadingEstablishments && establishments?.length === 0 && (
                  <p className="text-sm text-muted-foreground">No hay establecimientos registrados</p>
                )}
              </div>
              {selectedEstablishment !== 'all' && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Icon name="Info" size={12} />
                  Mostrando inventario de: <span className="font-medium text-foreground">{selectedEstablishmentName}</span>
                </p>
              )}
            </div>

            {/* Stats Cards */}
            {loadingItems ? (
              <div className="flex items-center justify-center py-8">
                <Icon name="Loader2" size={28} className="animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Cargando inventario...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Productos</p>
                        <p className="text-2xl font-bold text-foreground">{stats?.totalItems}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <Icon name="Package" size={24} className="text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Stock Bajo</p>
                        <p className="text-2xl font-bold text-orange-600">{stats?.lowStock}</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                        <Icon name="AlertTriangle" size={24} className="text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Sin Stock</p>
                        <p className="text-2xl font-bold text-red-600">{stats?.outOfStock}</p>
                      </div>
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                        <Icon name="XCircle" size={24} className="text-red-600 dark:text-red-400" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Valor Total</p>
                        <p className="text-2xl font-bold text-blue-600">{formatPrice(stats?.totalValue)}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <Icon name="DollarSign" size={24} className="text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="bg-card border border-border rounded-lg">
                  <div className="border-b border-border">
                    <div className="flex overflow-x-auto">
                      <button
                        onClick={() => setActiveTab('inventory')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === 'inventory' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon name="Package" size={16} className="inline mr-2" />
                        Inventario
                      </button>
                      <button
                        onClick={() => setActiveTab('received_today')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                          activeTab === 'received_today' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon name="PackageCheck" size={16} />
                        Recibido Hoy
                        {todayTotalItems > 0 && (
                          <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">{todayTotalItems}</span>
                        )}
                      </button>
                      <button
                        onClick={() => setActiveTab('alerts')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === 'alerts' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon name="Bell" size={16} className="inline mr-2" />
                        Alertas
                        {(stats?.lowStock + stats?.outOfStock) > 0 && (
                          <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {stats?.lowStock + stats?.outOfStock}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon name="History" size={16} className="inline mr-2" />
                        Historial
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Inventory Tab */}
                    {activeTab === 'inventory' && (
                      <div className="space-y-4">
                        {inventoryItems?.length === 0 && !loadingItems ? (
                          <div className="text-center py-16">
                            <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">Sin productos en inventario</h3>
                            <p className="text-muted-foreground mb-4">
                              {selectedEstablishment !== 'all' ?'No hay productos activos asignados a este establecimiento' :'No hay productos activos en tu catálogo'}
                            </p>
                            <button
                              onClick={() => navigate('/catalog-management')}
                              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors mx-auto"
                            >
                              <Icon name="Plus" size={16} />
                              Ir al Catálogo
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex flex-col md:flex-row gap-4">
                              <div className="flex-1">
                                <Input
                                  placeholder="Buscar por nombre o SKU..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e?.target?.value)}
                                  iconName="Search"
                                />
                              </div>
                              <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e?.target?.value)}
                                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                              >
                                <option value="all">Todas las categorías</option>
                                {categories?.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                              <select
                                value={filterStock}
                                onChange={(e) => setFilterStock(e?.target?.value)}
                                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                              >
                                <option value="all">Todos los niveles</option>
                                <option value="low">Stock bajo</option>
                                <option value="out">Sin stock</option>
                              </select>
                            </div>
                            <InventoryTable
                              items={filteredItems}
                              onAdjust={handleAdjustStock}
                              userRole={user?.role}
                            />
                          </>
                        )}
                      </div>
                    )}

                    {/* Received Today Tab */}
                    {activeTab === 'received_today' && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-green-700 font-medium">Productos recibidos hoy</p>
                                <p className="text-3xl font-bold text-green-800">{todayTotalItems}</p>
                              </div>
                              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <Icon name="PackageCheck" size={24} className="text-green-600" />
                              </div>
                            </div>
                          </div>
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-blue-700 font-medium">Recepciones procesadas</p>
                                <p className="text-3xl font-bold text-blue-800">{todayUniqueReceipts}</p>
                              </div>
                              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Icon name="ClipboardCheck" size={24} className="text-blue-600" />
                              </div>
                            </div>
                          </div>
                          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-purple-700 font-medium">Valor total recibido</p>
                                <p className="text-2xl font-bold text-purple-800">{formatPrice(todayTotalValue)}</p>
                              </div>
                              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Icon name="TrendingUp" size={24} className="text-purple-600" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {isLoadingToday ? (
                          <div className="flex items-center justify-center py-12">
                            <Icon name="Loader2" size={28} className="animate-spin text-primary" />
                          </div>
                        ) : receivedTodayItems?.length === 0 ? (
                          <div className="text-center py-16 bg-muted/20 border border-border rounded-xl">
                            <Icon name="PackageCheck" size={48} className="text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground font-medium">No se han recibido productos hoy</p>
                            <p className="text-sm text-muted-foreground mt-1">Los artículos recibidos desde recepciones de mercancía aparecerán aquí</p>
                            <button
                              onClick={() => navigate('/goods-receipt')}
                              className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors mx-auto"
                            >
                              <Icon name="PackageCheck" size={16} />
                              Ir a Recepciones
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {Object.values(groupedByReceipt)?.map(group => (
                              <div key={group?.receipt_number} className="bg-card border border-border rounded-xl overflow-hidden">
                                <div className="px-5 py-3 bg-muted/30 border-b border-border flex items-center justify-between flex-wrap gap-2">
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <div className="flex items-center gap-1.5">
                                      <Icon name="FileText" size={15} className="text-primary" />
                                      <span className="font-semibold text-foreground font-mono text-sm">{group?.receipt_number}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                      <Icon name="Building2" size={13} />
                                      <span>{group?.supplier_name}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                      <Icon name="Clock" size={13} />
                                      <span className="font-medium text-foreground">{formatTime(group?.received_at)}</span>
                                    </div>
                                    <button
                                      onClick={() => navigate('/goods-receipt')}
                                      className="text-xs text-primary hover:underline flex items-center gap-1"
                                    >
                                      Ver recepción <Icon name="ExternalLink" size={11} />
                                    </button>
                                  </div>
                                </div>
                                <div className="overflow-x-auto">
                                  <table className="w-full">
                                    <thead>
                                      <tr className="border-b border-border">
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">Producto</th>
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">SKU</th>
                                        <th className="px-4 py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase">Cant. Recibida</th>
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">Núm. Lote</th>
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">Fecha Caducidad</th>
                                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase">Costo Unit.</th>
                                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase">Subtotal</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                      {group?.items?.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-muted/20 transition-colors">
                                          <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-foreground">{item?.product_name}</p>
                                          </td>
                                          <td className="px-4 py-3">
                                            <span className="text-xs font-mono text-muted-foreground">{item?.sku || '-'}</span>
                                          </td>
                                          <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center justify-center w-10 h-7 bg-green-100 text-green-700 rounded-lg text-sm font-bold">
                                              {item?.quantity_received}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3">
                                            {item?.batch_number ? (
                                              <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-mono">
                                                <Icon name="Tag" size={10} />{item?.batch_number}
                                              </span>
                                            ) : <span className="text-xs text-muted-foreground">—</span>}
                                          </td>
                                          <td className="px-4 py-3">
                                            {item?.expiry_date ? (
                                              <span className="inline-flex items-center gap-1 text-xs text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md">
                                                <Icon name="Calendar" size={10} />{formatDate(item?.expiry_date)}
                                              </span>
                                            ) : <span className="text-xs text-muted-foreground">—</span>}
                                          </td>
                                          <td className="px-4 py-3 text-right">
                                            <span className="text-sm text-muted-foreground">{formatPrice(item?.unit_cost || 0)}</span>
                                          </td>
                                          <td className="px-4 py-3 text-right">
                                            <span className="text-sm font-semibold text-foreground">
                                              {formatPrice((item?.quantity_received || 0) * (item?.unit_cost || 0))}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot>
                                      <tr className="border-t border-border bg-muted/20">
                                        <td colSpan={6} className="px-4 py-2.5 text-xs text-muted-foreground text-right font-medium">Subtotal recepción:</td>
                                        <td className="px-4 py-2.5 text-right">
                                          <span className="text-sm font-bold text-foreground">
                                            {formatPrice(group?.items?.reduce((s, i) => s + (i?.quantity_received || 0) * (i?.unit_cost || 0), 0))}
                                          </span>
                                        </td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Alerts Tab */}
                    {activeTab === 'alerts' && (
                      <StockAlerts items={inventoryItems} onAdjust={handleAdjustStock} />
                    )}

                    {/* History Tab */}
                    {activeTab === 'history' && (
                      <AdjustmentHistory userId={authUser?.id} establishmentId={selectedEstablishment !== 'all' ? selectedEstablishment : null} />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Adjustment Modal */}
      {showAdjustmentModal && selectedItem && (
        <AdjustmentModal
          item={selectedItem}
          onSave={handleSaveAdjustment}
          onClose={() => {
            setShowAdjustmentModal(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
};

export default InventoryManagement;