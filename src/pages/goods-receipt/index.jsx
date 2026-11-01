import React, { useState, useEffect, useRef, useMemo } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';
import ReceiptItemRow from './components/ReceiptItemRow';
import BatchCaptureModal from './components/BatchCaptureModal';
import DiscrepancyModal from './components/DiscrepancyModal';
import ReceiptPrint from './components/ReceiptPrint';

const STATUS_CONFIG = {
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-700', icon: 'FileText', dot: 'bg-gray-400' },
  in_progress: { label: 'En proceso', color: 'bg-yellow-100 text-yellow-700', icon: 'Clock', dot: 'bg-yellow-500' },
  partial: { label: 'Recibido parcial', color: 'bg-orange-100 text-orange-700', icon: 'PackageOpen', dot: 'bg-orange-500' },
  completed: { label: 'Completado', color: 'bg-green-100 text-green-700', icon: 'PackageCheck', dot: 'bg-green-500' },
  rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-700', icon: 'XCircle', dot: 'bg-red-500' }
};

const GoodsReceipt = () => {
  const { user } = useAuth();
  const { formatPrice, currencySettings } = useCurrency();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'select-po' | 'new'
  const [receipts, setReceipts] = useState([]);
  const [pendingPOs, setPendingPOs] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedPO, setSelectedPO] = useState(null);
  const [receiptItems, setReceiptItems] = useState([]);
  const [batchModalItem, setBatchModalItem] = useState(null);
  const [showDiscrepancy, setShowDiscrepancy] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [receiverName, setReceiverName] = useState('');
  const [qualityNotes, setQualityNotes] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const signatureRef = useRef(null);
  const [signatureData, setSignatureData] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPos = useRef(null);

  const showTaxInOrders = currencySettings?.taxSettings?.showTaxInOrders ?? true;
  const taxRate = currencySettings?.taxRate ?? 16;
  const taxLabel = currencySettings?.taxSettings?.taxLabel || 'IVA';
  const taxIncluded = currencySettings?.taxSettings?.taxIncludedInPrice ?? true;

  const computeTaxBreakdown = (amount) => {
    const tax = taxIncluded
      ? amount - amount / (1 + taxRate / 100)
      : amount * (taxRate / 100);
    const base = taxIncluded ? amount - tax : amount;
    const total = taxIncluded ? amount : amount + tax;
    return { base, tax, total };
  };

  useEffect(() => {
    if (user?.id) {
      fetchAll();
    }
  }, [user?.id]);

  const fetchAll = async () => {
    await Promise.all([fetchReceipts(), fetchPendingPOs(), fetchLocations()]);
  };

  const fetchReceipts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        ?.from('goods_receipts')
        ?.select('*, goods_receipt_items(*)')
        ?.eq('user_id', user?.id)
        ?.order('created_at', { ascending: false });
      if (err) throw err;
      setReceipts(data || []);
    } catch (err) {
      console.error(err);
      setError('Error al cargar recepciones: ' + err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingPOs = async () => {
    try {
      const { data } = await supabase
        ?.from('purchase_orders')
        ?.select('*, purchase_order_items(*, catalog_items(name, sku, cost)), suppliers(name, email)')
        ?.eq('user_id', user?.id)
        ?.in('status', ['sent', 'in_process', 'received_partial'])
        ?.order('created_at', { ascending: false });
      setPendingPOs(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLocations = async () => {
    try {
      if (!user?.id) return;
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
      setLocations(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectPO = (po) => {
    setSelectedPO(po);
    const items = (po?.purchase_order_items || [])?.map(item => ({
      purchase_order_item_id: item?.id,
      catalog_item_id: item?.catalog_item_id,
      product_name: item?.catalog_items?.name || item?.product_name || 'Producto',
      sku: item?.catalog_items?.sku || item?.sku || '',
      quantity_ordered: item?.quantity || 0,
      quantity_received: item?.quantity || 0,
      quantity_rejected: 0,
      unit_cost: item?.unit_cost || item?.catalog_items?.cost || 0,
      batch_number: '',
      manufacture_date: '',
      expiry_date: '',
      location_in_warehouse: '',
      quality_status: 'pending',
      quality_notes: '',
      rejection_reason: ''
    }));
    setReceiptItems(items);
    setView('new');
  };

  const handleItemChange = (index, updatedItem) => {
    setReceiptItems(prev => prev?.map((item, i) => i === index ? updatedItem : item));
  };

  const handleBatchSave = (batchData) => {
    if (batchModalItem !== null) {
      setReceiptItems(prev => prev?.map((item, i) =>
        i === batchModalItem ? { ...item, ...batchData } : item
      ));
    }
    setBatchModalItem(null);
  };

  const generateReceiptNumber = () => {
    const d = new Date();
    return `GR-${d?.getFullYear()}${String(d?.getMonth() + 1)?.padStart(2, '0')}${String(d?.getDate())?.padStart(2, '0')}-${Math.floor(Math.random() * 9000) + 1000}`;
  };

  const determineStatus = (items) => {
    const allReceived = items?.every(i => (parseFloat(i?.quantity_received) || 0) >= (parseFloat(i?.quantity_ordered) || 0));
    const someReceived = items?.some(i => (parseFloat(i?.quantity_received) || 0) > 0);
    const allRejected = items?.every(i => (parseFloat(i?.quantity_rejected) || 0) >= (parseFloat(i?.quantity_ordered) || 0));
    if (allRejected) return 'rejected';
    if (allReceived) return 'completed';
    if (someReceived) return 'partial';
    return 'draft';
  };

  const handleConfirmReceipt = async () => {
    if (!receiverName?.trim()) {
      setError('Por favor ingresa el nombre del receptor');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const status = determineStatus(receiptItems);
      const receiptNumber = generateReceiptNumber();
      const totalReceivedValue = receiptItems?.reduce((s, i) => s + (parseFloat(i?.quantity_received) || 0) * (parseFloat(i?.unit_cost) || 0), 0);
      const totalOrderedValue = receiptItems?.reduce((s, i) => s + (parseFloat(i?.quantity_ordered) || 0) * (parseFloat(i?.unit_cost) || 0), 0);

      const { data: receipt, error: receiptErr } = await supabase
        ?.from('goods_receipts')
        ?.insert({
          user_id: user?.id,
          receipt_number: receiptNumber,
          purchase_order_id: selectedPO?.id,
          purchase_order_number: selectedPO?.order_number,
          supplier_id: selectedPO?.supplier_id,
          supplier_name: selectedPO?.supplier_name || selectedPO?.suppliers?.name,
          supplier_email: selectedPO?.supplier_email || selectedPO?.suppliers?.email,
          status,
          received_date: new Date()?.toISOString(),
          receipt_date: new Date()?.toISOString()?.split('T')?.[0],
          receiver_name: receiverName,
          receiver_signature: signatureData,
          quality_notes: qualityNotes,
          notes: generalNotes,
          total_received: totalReceivedValue,
          total_ordered: totalOrderedValue,
          location_id: selectedLocationId || null
        })
        ?.select()
        ?.single();
      if (receiptErr) throw receiptErr;

      const itemsToInsert = receiptItems?.map(item => ({
        goods_receipt_id: receipt?.id,
        purchase_order_item_id: item?.purchase_order_item_id || null,
        catalog_item_id: item?.catalog_item_id || null,
        product_name: item?.product_name,
        item_name: item?.product_name,
        sku: item?.sku,
        quantity_ordered: parseFloat(item?.quantity_ordered) || 0,
        quantity_expected: parseFloat(item?.quantity_ordered) || 0,
        quantity_received: parseFloat(item?.quantity_received) || 0,
        quantity_rejected: parseFloat(item?.quantity_rejected) || 0,
        quantity_discrepancy: (parseFloat(item?.quantity_ordered) || 0) - (parseFloat(item?.quantity_received) || 0),
        rejection_reason: item?.rejection_reason || null,
        unit_cost: parseFloat(item?.unit_cost) || 0,
        batch_number: item?.batch_number || null,
        manufacture_date: item?.manufacture_date || null,
        expiry_date: item?.expiry_date || null,
        location_in_warehouse: item?.location_in_warehouse || null,
        quality_status: item?.quality_status || 'pending',
        quality_notes: item?.quality_notes || null,
        notes: item?.quality_notes || null,
        stock_updated: false
      }));

      const { error: itemsErr } = await supabase?.from('goods_receipt_items')?.insert(itemsToInsert);
      if (itemsErr) throw itemsErr;

      // Update inventory stock for received items
      for (const item of receiptItems) {
        if (item?.catalog_item_id && (parseFloat(item?.quantity_received) || 0) > 0) {
          const { data: currentItem } = await supabase
            ?.from('catalog_items')
            ?.select('stock_quantity')
            ?.eq('id', item?.catalog_item_id)
            ?.single();
          const currentStock = parseFloat(currentItem?.stock_quantity) || 0;
          const newStock = currentStock + (parseFloat(item?.quantity_received) || 0);
          await supabase
            ?.from('catalog_items')
            ?.update({ stock_quantity: newStock, updated_at: new Date()?.toISOString() })
            ?.eq('id', item?.catalog_item_id);
          await supabase
            ?.from('goods_receipt_items')
            ?.update({ stock_updated: true })
            ?.eq('goods_receipt_id', receipt?.id)
            ?.eq('catalog_item_id', item?.catalog_item_id);
        }
      }

      // Update purchase order status
      const poStatus = status === 'completed' ? 'received_complete' : status === 'partial' ? 'received_partial' : 'in_process';
      await supabase
        ?.from('purchase_orders')
        ?.update({ status: poStatus, updated_at: new Date()?.toISOString() })
        ?.eq('id', selectedPO?.id);

      await fetchReceipts();
      await fetchPendingPOs();
      setView('list');
      resetForm();
    } catch (err) {
      console.error(err);
      setError('Error al confirmar la recepción: ' + err?.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotifySupplier = async () => {
    setIsNotifying(true);
    try {
      if (selectedReceipt?.id) {
        await supabase
          ?.from('goods_receipts')
          ?.update({ supplier_notified: true, supplier_notified_at: new Date()?.toISOString() })
          ?.eq('id', selectedReceipt?.id);
        setReceipts(prev => prev?.map(r => r?.id === selectedReceipt?.id ? { ...r, supplier_notified: true } : r));
      }
      alert(`Notificación enviada a ${selectedReceipt?.supplier_name || selectedPO?.supplier_name || 'proveedor'} sobre las discrepancias encontradas.`);
      setShowDiscrepancy(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsNotifying(false);
    }
  };

  const resetForm = () => {
    setSelectedPO(null);
    setReceiptItems([]);
    setReceiverName('');
    setQualityNotes('');
    setGeneralNotes('');
    setSignatureData(null);
    setSelectedLocationId('');
    if (signatureRef?.current) {
      const ctx = signatureRef?.current?.getContext('2d');
      ctx?.clearRect(0, 0, signatureRef?.current?.width, signatureRef?.current?.height);
    }
  };

  // Signature canvas handlers
  const getPos = (e, canvas) => {
    const rect = canvas?.getBoundingClientRect();
    if (e?.touches) {
      return { x: e?.touches?.[0]?.clientX - rect?.left, y: e?.touches?.[0]?.clientY - rect?.top };
    }
    return { x: e?.clientX - rect?.left, y: e?.clientY - rect?.top };
  };

  const startDraw = (e) => {
    e?.preventDefault();
    setIsDrawing(true);
    lastPos.current = getPos(e, signatureRef?.current);
  };

  const draw = (e) => {
    e?.preventDefault();
    if (!isDrawing || !signatureRef?.current) return;
    const ctx = signatureRef?.current?.getContext('2d');
    const pos = getPos(e, signatureRef?.current);
    ctx?.beginPath();
    ctx?.moveTo(lastPos?.current?.x, lastPos?.current?.y);
    ctx?.lineTo(pos?.x, pos?.y);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx?.stroke();
    lastPos.current = pos;
  };

  const endDraw = () => {
    setIsDrawing(false);
    if (signatureRef?.current) {
      setSignatureData(signatureRef?.current?.toDataURL());
    }
  };

  const clearSignature = () => {
    if (signatureRef?.current) {
      const ctx = signatureRef?.current?.getContext('2d');
      ctx?.clearRect(0, 0, signatureRef?.current?.width, signatureRef?.current?.height);
      setSignatureData(null);
    }
  };

  const filteredReceipts = useMemo(() => receipts?.filter(r => {
    const matchStatus = filterStatus === 'all' || r?.status === filterStatus;
    const matchLocation = filterLocation === 'all' || r?.location_id === filterLocation;
    const matchSearch = !search ||
      r?.receipt_number?.toLowerCase()?.includes(search?.toLowerCase()) ||
      r?.supplier_name?.toLowerCase()?.includes(search?.toLowerCase()) ||
      r?.purchase_order_number?.toLowerCase()?.includes(search?.toLowerCase());
    return matchStatus && matchLocation && matchSearch;
  }), [receipts, filterStatus, filterLocation, search]);

  const metrics = useMemo(() => {
    const todayStr = new Date()?.toISOString()?.split('T')?.[0];
    const todayReceipts = receipts?.filter(r => r?.received_date?.startsWith(todayStr));
    const totalReceivedToday = todayReceipts?.reduce((sum, r) => sum + (parseFloat(r?.total_received) || 0), 0);
    const pendingCount = receipts?.filter(r => ['draft', 'in_progress']?.includes(r?.status))?.length;
    const discrepancyCount = receipts?.filter(r => {
      const items = r?.goods_receipt_items || [];
      return items?.some(i => (parseFloat(i?.quantity_rejected) || 0) > 0 || (parseFloat(i?.quantity_received) || 0) < (parseFloat(i?.quantity_ordered) || 0));
    })?.length;
    const completedCount = receipts?.filter(r => r?.status === 'completed')?.length;
    return { totalReceivedToday, pendingCount, discrepancyCount, completedCount, todayCount: todayReceipts?.length };
  }, [receipts]);

  const hasDiscrepancies = receiptItems?.some(i =>
    (parseFloat(i?.quantity_received) || 0) < (parseFloat(i?.quantity_ordered) || 0) ||
    (parseFloat(i?.quantity_rejected) || 0) > 0
  );

  const totalOrderedValue = receiptItems?.reduce((s, i) => s + (parseFloat(i?.quantity_ordered) || 0) * (parseFloat(i?.unit_cost) || 0), 0);
  const totalReceivedValue = receiptItems?.reduce((s, i) => s + (parseFloat(i?.quantity_received) || 0) * (parseFloat(i?.unit_cost) || 0), 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr)?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} user={user} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} />
      <main className="lg:ml-72 pt-16 min-h-screen">
        <div className="p-4 md:p-6 max-w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Icon name="PackageCheck" size={24} className="text-primary" />
              Recepción de Mercancía
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Registra y verifica la entrada de productos de tus proveedores</p>
          </div>
          {view === 'list' && (
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => navigate('/purchase-orders')} className="flex items-center gap-2">
                <Icon name="ShoppingCart" size={16} />
                Pedidos
              </Button>
              <Button variant="outline" onClick={() => navigate('/inventory-management')} className="flex items-center gap-2">
                <Icon name="Package" size={16} />
                Inventario
              </Button>
              {pendingPOs?.length > 0 && (
                <Button onClick={() => setView('select-po')} className="flex items-center gap-2">
                  <Icon name="Plus" size={16} />
                  Nueva Recepción
                </Button>
              )}
            </div>
          )}
          {view !== 'list' && (
            <Button variant="outline" onClick={() => { setView('list'); resetForm(); }} className="flex items-center gap-2">
              <Icon name="ArrowLeft" size={16} />
              Volver
            </Button>
          )}
        </div>

        {/* Establishment Selector — shown in list and select-po views */}
        {(view === 'list' || view === 'select-po') && (
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Icon name="Building2" size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Establecimiento</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterLocation('all')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filterLocation === 'all' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                Todos los establecimientos
              </button>
              {locations?.map(loc => (
                <button
                  key={loc?.id}
                  onClick={() => setFilterLocation(loc?.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filterLocation === loc?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  {loc?.location_name}
                  {loc?.location_code && (
                    <span className="ml-1.5 opacity-70 text-xs">({loc?.location_code})</span>
                  )}
                </button>
              ))}
              {locations?.length === 0 && (
                <p className="text-sm text-muted-foreground">No hay establecimientos registrados</p>
              )}
            </div>
            {filterLocation !== 'all' && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Icon name="Info" size={12} />
                Mostrando recepciones de: <span className="font-medium text-foreground ml-1">{locations?.find(l => l?.id === filterLocation)?.location_name || ''}</span>
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <Icon name="AlertCircle" size={16} />
            {error}
            <button onClick={() => setError(null)} className="ml-auto"><Icon name="X" size={14} /></button>
          </div>
        )}

        {/* LIST VIEW */}
        {view === 'list' && (
          <div className="space-y-5">
            {/* Metrics KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Icon name="PackageCheck" size={20} className="text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Hoy</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{formatPrice(metrics?.totalReceivedToday)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total recibido hoy ({metrics?.todayCount} recepciones)</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                    <Icon name="Clock" size={20} className="text-yellow-600" />
                  </div>
                  <span className="text-2xl font-bold text-yellow-600">{metrics?.pendingCount}</span>
                </div>
                <p className="text-sm font-semibold text-foreground">Recepciones pendientes</p>
                <p className="text-xs text-muted-foreground mt-0.5">Borrador o en proceso</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                    <Icon name="AlertTriangle" size={20} className="text-red-600" />
                  </div>
                  <span className="text-2xl font-bold text-red-600">{metrics?.discrepancyCount}</span>
                </div>
                <p className="text-sm font-semibold text-foreground">Discrepancias reportadas</p>
                <p className="text-xs text-muted-foreground mt-0.5">Con rechazos o faltantes</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <Icon name="CheckCircle" size={20} className="text-green-600" />
                  </div>
                  <span className="text-2xl font-bold text-green-600">{metrics?.completedCount}</span>
                </div>
                <p className="text-sm font-semibold text-foreground">Completadas</p>
                <p className="text-xs text-muted-foreground mt-0.5">Recepciones finalizadas</p>
              </div>
            </div>

            {/* Pending POs alert */}
            {pendingPOs?.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="AlertCircle" size={18} className="text-yellow-600" />
                    <div>
                      <p className="font-semibold text-yellow-800 text-sm">{pendingPOs?.length} orden(es) de compra pendiente(s) de recibir</p>
                      <p className="text-xs text-yellow-700">Haz clic en "Nueva Recepción" para procesar</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => setView('select-po')} className="bg-yellow-500 hover:bg-yellow-600 text-white">Procesar</Button>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar por folio, proveedor o PO..."
                    value={search}
                    onChange={e => setSearch(e?.target?.value)}
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
                    {Object.entries(STATUS_CONFIG)?.map(([k, v]) => (
                      <option key={k} value={k}>{v?.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Status filter pills */}
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${ filterStatus === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80' }`}
                >
                  Todos ({receipts?.length})
                </button>
                {Object.entries(STATUS_CONFIG)?.map(([key, cfg]) => {
                  const count = receipts?.filter(r => r?.status === key)?.length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={key}
                      onClick={() => setFilterStatus(key)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${ filterStatus === key ? 'bg-primary text-primary-foreground' : `${cfg?.color} hover:opacity-80` }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg?.dot}`} />
                      {cfg?.label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Receipts list */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredReceipts?.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-xl">
                <Icon name="PackageCheck" size={48} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">
                  {receipts?.length === 0 ? 'No hay recepciones registradas' : 'No hay recepciones con los filtros aplicados'}
                </p>
                {receipts?.length === 0 && pendingPOs?.length > 0 && (
                  <Button onClick={() => setView('select-po')} className="mt-4 flex items-center gap-2 mx-auto">
                    <Icon name="Plus" size={16} />
                    Crear primera recepción
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReceipts?.map(receipt => {
                  const st = STATUS_CONFIG?.[receipt?.status] || STATUS_CONFIG?.draft;
                  const items = receipt?.goods_receipt_items || [];
                  const hasDisc = items?.some(i => (parseFloat(i?.quantity_rejected) || 0) > 0 || (parseFloat(i?.quantity_received) || 0) < (parseFloat(i?.quantity_ordered) || 0));
                  const isToday = receipt?.received_date?.startsWith(new Date()?.toISOString()?.split('T')?.[0]);
                  return (
                    <div key={receipt?.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-foreground font-mono">{receipt?.receipt_number}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${st?.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${st?.dot}`} />
                              {st?.label}
                            </span>
                            {isToday && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Hoy</span>
                            )}
                            {hasDisc && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs flex items-center gap-1">
                                <Icon name="AlertTriangle" size={10} /> Discrepancia
                              </span>
                            )}
                            {receipt?.supplier_notified && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs flex items-center gap-1">
                                <Icon name="Send" size={10} /> Proveedor notificado
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Icon name="Building2" size={13} />
                              {receipt?.supplier_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="FileText" size={13} />
                              PO: {receipt?.purchase_order_number || '-'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="Calendar" size={13} />
                              {formatDate(receipt?.received_date)}
                            </span>
                            {receipt?.receiver_name && (
                              <span className="flex items-center gap-1">
                                <Icon name="User" size={13} />
                                {receipt?.receiver_name}
                              </span>
                            )}
                            {receipt?.location_id && locations?.find(l => l?.id === receipt?.location_id) && (
                              <span className="flex items-center gap-1">
                                <Icon name="MapPin" size={13} />
                                {locations?.find(l => l?.id === receipt?.location_id)?.location_name}
                              </span>
                            )}
                          </div>
                          {/* Items summary */}
                          {items?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {items?.slice(0, 3)?.map((item, idx) => (
                                <span key={idx} className="text-xs bg-muted px-2 py-0.5 rounded-md text-muted-foreground">
                                  {item?.product_name || item?.item_name} ({item?.quantity_received}/{item?.quantity_ordered || item?.quantity_expected})
                                </span>
                              ))}
                              {items?.length > 3 && (
                                <span className="text-xs text-muted-foreground">+{items?.length - 3} más</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="text-right">
                            <p className="text-sm font-bold text-foreground">{formatPrice(parseFloat(receipt?.total_received) || 0)}</p>
                            <p className="text-xs text-muted-foreground">{items?.length} producto(s)</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {['draft', 'in_progress', 'partial']?.includes(receipt?.status) && (
                              <button
                                onClick={() => navigate(`/goods-receipt/receive/${receipt?.purchase_order_id}`)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                                title="Contabilizar productos recibidos"
                              >
                                <Icon name="ClipboardCheck" size={13} />
                                Contabilizar
                              </button>
                            )}
                            {['completed', 'rejected']?.includes(receipt?.status) && (
                              <button
                                onClick={() => navigate(`/goods-receipt/receive/${receipt?.purchase_order_id}`)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs font-medium hover:bg-muted/80 transition-colors"
                                title="Ver detalle de recepción"
                              >
                                <Icon name="Eye" size={13} />
                                Ver detalle
                              </button>
                            )}
                            <button
                              onClick={() => { setSelectedReceipt(receipt); setShowDiscrepancy(true); }}
                              className="p-2 hover:bg-muted rounded-lg transition-colors"
                              title="Ver discrepancias"
                              disabled={!hasDisc}
                            >
                              <Icon name="AlertTriangle" size={16} className={hasDisc ? 'text-red-500' : 'text-muted-foreground opacity-30'} />
                            </button>
                            <button
                              onClick={() => { setSelectedReceipt(receipt); setShowPrint(true); }}
                              className="p-2 hover:bg-muted rounded-lg transition-colors"
                              title="Imprimir reporte"
                            >
                              <Icon name="Printer" size={16} className="text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer summary */}
            {filteredReceipts?.length > 0 && (
              <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{filteredReceipts?.length} de {receipts?.length} recepciones</span>
                <span className="text-xs font-semibold text-foreground">
                  Total filtrado: {formatPrice(filteredReceipts?.reduce((s, r) => s + (parseFloat(r?.total_received) || 0), 0))}
                </span>
              </div>
            )}
          </div>
        )}

        {/* SELECT PO VIEW */}
        {view === 'select-po' && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="ShoppingCart" size={20} className="text-primary" />
                Seleccionar Orden de Compra
              </h2>
              {pendingPOs?.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="CheckCircle" size={40} className="text-green-500 mx-auto mb-2" />
                  <p className="text-muted-foreground">No hay órdenes de compra pendientes de recibir</p>
                  <p className="text-xs text-muted-foreground mt-1">Crea un pedido de compra primero desde la sección de Pedidos</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {pendingPOs?.map(po => (
                    <button
                      key={po?.id}
                      onClick={() => handleSelectPO(po)}
                      className="w-full text-left bg-muted/30 hover:bg-primary/5 border border-border hover:border-primary/30 rounded-xl p-4 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{po?.order_number}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              po?.status === 'received_partial' ? 'bg-orange-100 text-orange-700' :
                              po?.status === 'in_process' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {po?.status === 'received_partial' ? 'Parcialmente recibido' :
                               po?.status === 'in_process' ? 'En proceso' : 'Enviado'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">{po?.supplier_name || po?.suppliers?.name}</p>
                          <p className="text-xs text-muted-foreground">{po?.purchase_order_items?.length || 0} productos · {formatPrice(po?.total_amount || 0)}</p>
                        </div>
                        <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* NEW RECEIPT VIEW */}
        {view === 'new' && selectedPO && (
          <div className="space-y-4">
            {/* PO Summary Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-sm font-semibold text-blue-800">Orden de Compra: {selectedPO?.order_number}</p>
                  <p className="text-xs text-blue-700">Proveedor: {selectedPO?.supplier_name || selectedPO?.suppliers?.name} · {receiptItems?.length} productos</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-blue-600">Valor pedido</p>
                    <p className="font-bold text-blue-800">{formatPrice(totalOrderedValue)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-blue-600">Valor recibido</p>
                    <p className="font-bold text-green-700">{formatPrice(totalReceivedValue)}</p>
                  </div>
                </div>
              </div>
              {showTaxInOrders && totalReceivedValue > 0 && (() => {
                const breakdown = computeTaxBreakdown(totalReceivedValue);
                return (
                  <div className="mt-3 pt-3 border-t border-blue-200 grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-blue-600">Subtotal (sin {taxLabel})</p>
                      <p className="text-sm font-semibold text-blue-800">{formatPrice(breakdown?.base)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">{taxLabel} ({taxRate}%)</p>
                      <p className="text-sm font-semibold text-blue-800">{formatPrice(breakdown?.tax)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Total con {taxLabel}</p>
                      <p className="text-sm font-semibold text-blue-800">{formatPrice(breakdown?.total)}</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Products verification */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Icon name="ClipboardList" size={18} className="text-primary" />
                  Verificación de Productos ({receiptItems?.length})
                </h2>
                {hasDiscrepancies && (
                  <button
                    onClick={() => setShowDiscrepancy(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Icon name="AlertTriangle" size={13} />
                    Ver discrepancias
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {receiptItems?.map((item, index) => (
                  <ReceiptItemRow
                    key={index}
                    item={item}
                    index={index}
                    onChange={handleItemChange}
                    onOpenBatch={(idx) => setBatchModalItem(idx)}
                  />
                ))}
              </div>
            </div>

            {/* Receiver info */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="UserCheck" size={18} className="text-primary" />
                Información del Receptor
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Nombre del Receptor *</label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={e => setReceiverName(e?.target?.value)}
                    placeholder="Nombre completo"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Establecimiento {locations?.length === 0 && <span className="text-xs text-muted-foreground">(sin establecimientos registrados)</span>}
                  </label>
                  <select
                    value={selectedLocationId}
                    onChange={e => setSelectedLocationId(e?.target?.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20"
                    disabled={locations?.length === 0}
                  >
                    <option value="">Seleccionar establecimiento...</option>
                    {locations?.map(loc => (
                      <option key={loc?.id} value={loc?.id}>{loc?.location_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Notas de Calidad</label>
                  <input
                    type="text"
                    value={qualityNotes}
                    onChange={e => setQualityNotes(e?.target?.value)}
                    placeholder="Observaciones generales de calidad..."
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Notas Generales</label>
                  <textarea
                    value={generalNotes}
                    onChange={e => setGeneralNotes(e?.target?.value)}
                    placeholder="Observaciones adicionales sobre la recepción..."
                    rows={2}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>
              </div>
              {/* Signature pad */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-foreground">Firma Digital del Receptor</label>
                  <button onClick={clearSignature} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <Icon name="Eraser" size={12} /> Limpiar
                  </button>
                </div>
                <div className="border-2 border-dashed border-border rounded-xl overflow-hidden bg-muted/20">
                  <canvas
                    ref={signatureRef}
                    width={600}
                    height={120}
                    className="w-full cursor-crosshair touch-none"
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={endDraw}
                    onMouseLeave={endDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={endDraw}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Firme en el área de arriba con el mouse o pantalla táctil</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDiscrepancy(true)}
                disabled={!hasDiscrepancies}
                className="flex items-center gap-2"
              >
                <Icon name="AlertTriangle" size={16} />
                Discrepancias {hasDiscrepancies && `(${receiptItems?.filter(i => (parseFloat(i?.quantity_received) || 0) < (parseFloat(i?.quantity_ordered) || 0) || (parseFloat(i?.quantity_rejected) || 0) > 0)?.length})`}
              </Button>
              <Button
                onClick={handleConfirmReceipt}
                isLoading={isSaving}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <Icon name="PackageCheck" size={16} />
                Confirmar Recepción y Actualizar Stock
              </Button>
            </div>
          </div>
        )}
        </div>
      </main>

      {/* Modals */}
      {batchModalItem !== null && (
        <BatchCaptureModal
          item={receiptItems?.[batchModalItem]}
          onSave={handleBatchSave}
          onClose={() => setBatchModalItem(null)}
        />
      )}
      {showDiscrepancy && (
        <DiscrepancyModal
          items={view === 'new' ? receiptItems : (selectedReceipt?.goods_receipt_items || [])}
          supplierEmail={selectedPO?.supplier_email || selectedPO?.suppliers?.email || selectedReceipt?.supplier_email}
          supplierName={selectedPO?.supplier_name || selectedPO?.suppliers?.name || selectedReceipt?.supplier_name}
          onNotifySupplier={handleNotifySupplier}
          onClose={() => setShowDiscrepancy(false)}
          isNotifying={isNotifying}
        />
      )}
      {showPrint && selectedReceipt && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-gray-800">Reporte de Recepción</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90"
                >
                  <Icon name="Printer" size={14} /> Imprimir / PDF
                </button>
                <button
                  onClick={() => { setShowPrint(false); setSelectedReceipt(null); }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Icon name="X" size={18} />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              <ReceiptPrint
                receipt={selectedReceipt}
                items={selectedReceipt?.goods_receipt_items || []}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoodsReceipt;
