import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { useCurrency } from '../../../contexts/CurrencyContext';

// Closed statuses - no further edits allowed
const CLOSED_STATUSES = ['received_complete', 'rejected'];

const GoodsReceiptDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const printRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [order, setOrder] = useState(null);
  const [existingReceipt, setExistingReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [receiverName, setReceiverName] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [receiptItems, setReceiptItems] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [savedReceiptData, setSavedReceiptData] = useState(null);

  useEffect(() => {
    if (user?.id && orderId) {
      loadOrder();
    }
  }, [orderId, user?.id]);

  const isClosed = order && CLOSED_STATUSES?.includes(order?.status);

  const loadOrder = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        ?.from('purchase_orders')
        ?.select('*, purchase_order_items(*, catalog_items(name, sku, cost)), suppliers(name, email)')
        ?.eq('id', orderId)
        ?.eq('user_id', user?.id)
        ?.single();
      if (err) throw err;
      if (data) {
        setOrder(data);
        // Check if there's an existing receipt for this PO
        const { data: receiptData } = await supabase
          ?.from('goods_receipts')
          ?.select('*, goods_receipt_items(*)')
          ?.eq('purchase_order_id', orderId)
          ?.eq('user_id', user?.id)
          ?.order('created_at', { ascending: false })
          ?.limit(1)
          ?.maybeSingle();
        if (receiptData) {
          setExistingReceipt(receiptData);
          if (CLOSED_STATUSES?.includes(data?.status)) {
            initItemsFromReceipt(receiptData?.goods_receipt_items || [], data?.purchase_order_items || []);
          } else {
            initItems(data?.purchase_order_items || []);
          }
        } else {
          initItems(data?.purchase_order_items || []);
        }
      } else {
        setError('Pedido no encontrado');
      }
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar el pedido: ' + err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const initItems = (items) => {
    const mapped = items?.map(item => ({
      id: item?.id,
      catalog_item_id: item?.catalog_item_id || null,
      product_name: item?.catalog_items?.name || item?.product_name || 'Producto',
      sku: item?.catalog_items?.sku || item?.sku || '',
      quantity_ordered: parseFloat(item?.quantity) || 0,
      quantity_received: parseFloat(item?.quantity) || 0,
      quantity_rejected: 0,
      unit_cost: parseFloat(item?.unit_cost) || parseFloat(item?.catalog_items?.cost) || 0,
      batch_number: '',
      expiry_date: '',
      discrepancy_note: '',
      received: true
    }));
    setReceiptItems(mapped);
  };

  const initItemsFromReceipt = (receiptItemsList, orderItems) => {
    const mapped = receiptItemsList?.map(ri => {
      const oi = orderItems?.find(o => o?.id === ri?.purchase_order_item_id);
      return {
        id: ri?.id,
        catalog_item_id: ri?.catalog_item_id || null,
        product_name: ri?.product_name || ri?.item_name || oi?.catalog_items?.name || 'Producto',
        sku: ri?.sku || oi?.catalog_items?.sku || '',
        quantity_ordered: parseFloat(ri?.quantity_ordered || ri?.quantity_expected) || 0,
        quantity_received: parseFloat(ri?.quantity_received) || 0,
        quantity_rejected: parseFloat(ri?.quantity_rejected) || 0,
        unit_cost: parseFloat(ri?.unit_cost) || 0,
        batch_number: ri?.batch_number || '',
        expiry_date: ri?.expiry_date || '',
        discrepancy_note: ri?.rejection_reason || ri?.quality_notes || ri?.notes || '',
        received: (parseFloat(ri?.quantity_received) || 0) > 0
      };
    });
    setReceiptItems(mapped);
  };

  const handleItemChange = (index, field, value) => {
    if (isClosed) return;
    setReceiptItems(prev => prev?.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      if (field === 'received') {
        updated.quantity_received = value ? updated?.quantity_ordered : 0;
        updated.quantity_rejected = value ? 0 : updated?.quantity_ordered;
      }
      if (field === 'quantity_received') {
        const qr = parseFloat(value) || 0;
        updated.quantity_rejected = Math.max(0, updated?.quantity_ordered - qr);
      }
      return updated;
    }));
  };

  const determineStatus = (items) => {
    const totalOrdered = items?.reduce((s, i) => s + (parseFloat(i?.quantity_ordered) || 0), 0);
    const totalReceived = items?.reduce((s, i) => s + (parseFloat(i?.quantity_received) || 0), 0);
    if (totalReceived === 0) return 'rejected';
    if (totalReceived >= totalOrdered) return 'completed';
    return 'partial';
  };

  const determinePOStatus = (receiptStatus) => {
    if (receiptStatus === 'completed') return 'received_complete';
    if (receiptStatus === 'partial') return 'received_partial';
    return 'rejected';
  };

  const generateReceiptNumber = () => {
    const d = new Date();
    return `GR-${d?.getFullYear()}${String(d?.getMonth() + 1)?.padStart(2, '0')}${String(d?.getDate())?.padStart(2, '0')}-${Math.floor(Math.random() * 9000) + 1000}`;
  };

  const handleSave = async () => {
    if (!receiverName?.trim()) {
      setError('Por favor ingresa el nombre del receptor');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const receiptStatus = determineStatus(receiptItems);
      const poStatus = determinePOStatus(receiptStatus);
      const receiptNumber = generateReceiptNumber();
      const totalReceived = receiptItems?.reduce((s, i) => s + (parseFloat(i?.quantity_received) || 0) * (parseFloat(i?.unit_cost) || 0), 0);
      const totalOrdered = receiptItems?.reduce((s, i) => s + (parseFloat(i?.quantity_ordered) || 0) * (parseFloat(i?.unit_cost) || 0), 0);

      const { data: receipt, error: receiptErr } = await supabase
        ?.from('goods_receipts')
        ?.insert({
          user_id: user?.id,
          receipt_number: receiptNumber,
          purchase_order_id: order?.id,
          purchase_order_number: order?.order_number,
          supplier_id: order?.supplier_id,
          supplier_name: order?.supplier_name || order?.suppliers?.name,
          supplier_email: order?.supplier_email || order?.suppliers?.email,
          status: receiptStatus,
          received_date: new Date()?.toISOString(),
          receipt_date: new Date()?.toISOString()?.split('T')?.[0],
          receiver_name: receiverName,
          quality_notes: '',
          notes: generalNotes,
          total_received: totalReceived,
          total_ordered: totalOrdered
        })
        ?.select()
        ?.single();
      if (receiptErr) throw receiptErr;

      const itemsToInsert = receiptItems?.map(item => ({
        goods_receipt_id: receipt?.id,
        purchase_order_item_id: item?.id || null,
        catalog_item_id: item?.catalog_item_id || null,
        product_name: item?.product_name,
        item_name: item?.product_name,
        sku: item?.sku,
        quantity_ordered: parseFloat(item?.quantity_ordered) || 0,
        quantity_expected: parseFloat(item?.quantity_ordered) || 0,
        quantity_received: parseFloat(item?.quantity_received) || 0,
        quantity_rejected: parseFloat(item?.quantity_rejected) || 0,
        quantity_discrepancy: (parseFloat(item?.quantity_ordered) || 0) - (parseFloat(item?.quantity_received) || 0),
        rejection_reason: item?.discrepancy_note || null,
        unit_cost: parseFloat(item?.unit_cost) || 0,
        batch_number: item?.batch_number || null,
        expiry_date: item?.expiry_date || null,
        quality_status: (parseFloat(item?.quantity_received) || 0) > 0 ? 'approved' : 'rejected',
        quality_notes: item?.discrepancy_note || null,
        notes: item?.discrepancy_note || null,
        stock_updated: false
      }));
      const { error: itemsErr } = await supabase?.from('goods_receipt_items')?.insert(itemsToInsert);
      if (itemsErr) throw itemsErr;

      // Update inventory stock
      for (const item of receiptItems) {
        if (item?.catalog_item_id && (parseFloat(item?.quantity_received) || 0) > 0) {
          const { data: ci } = await supabase
            ?.from('catalog_items')
            ?.select('stock_quantity')
            ?.eq('id', item?.catalog_item_id)
            ?.single();
          const newStock = (parseFloat(ci?.stock_quantity) || 0) + (parseFloat(item?.quantity_received) || 0);
          await supabase
            ?.from('catalog_items')
            ?.update({ stock_quantity: newStock, updated_at: new Date()?.toISOString() })
            ?.eq('id', item?.catalog_item_id);
        }
      }

      // Update PO status
      await supabase
        ?.from('purchase_orders')
        ?.update({
          status: poStatus,
          updated_at: new Date()?.toISOString()
        })
        ?.eq('id', order?.id);

      setOrder(prev => ({ ...prev, status: poStatus }));

      const receiptData = {
        receipt_number: receiptNumber,
        order_number: order?.order_number,
        supplier_name: order?.supplier_name || order?.suppliers?.name,
        supplier_email: order?.supplier_email || order?.suppliers?.email,
        receiver_name: receiverName,
        notes: generalNotes,
        received_date: new Date()?.toISOString(),
        status: receiptStatus,
        po_status: poStatus,
        items: receiptItems
      };
      setSavedReceiptData(receiptData);
      setShowSummary(true);

      const statusLabels = {
        completed: 'Recibido completo',
        partial: 'Recibido parcial',
        rejected: 'Rechazado'
      };
      setSuccessMsg(`Recepción guardada exitosamente. Estado del pedido: ${statusLabels?.[receiptStatus]}`);
    } catch (err) {
      console.error(err);
      setError('Error al guardar la recepción: ' + err?.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalOrdered = receiptItems?.reduce((s, i) => s + (parseFloat(i?.quantity_ordered) || 0) * (parseFloat(i?.unit_cost) || 0), 0);
  const totalReceived = receiptItems?.reduce((s, i) => s + (parseFloat(i?.quantity_received) || 0) * (parseFloat(i?.unit_cost) || 0), 0);
  const receivedCount = receiptItems?.filter(i => (parseFloat(i?.quantity_received) || 0) > 0)?.length;
  const rejectedCount = receiptItems?.filter(i => (parseFloat(i?.quantity_rejected) || 0) > 0)?.length;
  const discrepancyItems = receiptItems?.filter(i => {
    const qr = parseFloat(i?.quantity_received) || 0;
    const qo = parseFloat(i?.quantity_ordered) || 0;
    return qr < qo || (parseFloat(i?.quantity_rejected) || 0) > 0 || i?.discrepancy_note;
  });
  const totalCount = receiptItems?.length;

  const previewStatus = determineStatus(receiptItems);
  const statusPreviewConfig = {
    completed: { label: 'Recibido completo', color: 'bg-green-100 text-green-700 border-green-200', icon: 'PackageCheck' },
    partial: { label: 'Recibido parcial', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: 'PackageOpen' },
    rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-700 border-red-200', icon: 'XCircle' }
  };
  const previewCfg = statusPreviewConfig?.[previewStatus];

  const closedStatusConfig = {
    received_complete: { label: 'Pedido cerrado — Recibido completo', color: 'bg-green-100 text-green-800 border-green-300', icon: 'CheckCircle2' },
    rejected: { label: 'Pedido cerrado — Rechazado', color: 'bg-red-100 text-red-800 border-red-300', icon: 'XCircle' },
    received_partial: { label: 'Recibido parcial', color: 'bg-orange-100 text-orange-800 border-orange-300', icon: 'PackageOpen' }
  };
  const closedCfg = closedStatusConfig?.[order?.status];

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d)?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (d) => {
    if (!d) return '-';
    return new Date(d)?.toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // ---- RECEIPT SUMMARY VIEW (after save) ----
  if (showSummary && savedReceiptData) {
    const summaryItems = savedReceiptData?.items || [];
    const sReceived = summaryItems?.filter(i => (parseFloat(i?.quantity_received) || 0) > 0);
    const sRejected = summaryItems?.filter(i => (parseFloat(i?.quantity_rejected) || 0) >= (parseFloat(i?.quantity_ordered) || 0) && (parseFloat(i?.quantity_received) || 0) === 0);
    const sPartial = summaryItems?.filter(i => {
      const qr = parseFloat(i?.quantity_received) || 0;
      const qo = parseFloat(i?.quantity_ordered) || 0;
      return qr > 0 && qr < qo;
    });
    const sDiscrepancies = summaryItems?.filter(i => {
      const qr = parseFloat(i?.quantity_received) || 0;
      const qo = parseFloat(i?.quantity_ordered) || 0;
      return qr < qo || (parseFloat(i?.quantity_rejected) || 0) > 0 || i?.discrepancy_note;
    });
    const sTotalOrdered = summaryItems?.reduce((s, i) => s + (parseFloat(i?.quantity_ordered) || 0) * (parseFloat(i?.unit_cost) || 0), 0);
    const sTotalReceived = summaryItems?.reduce((s, i) => s + (parseFloat(i?.quantity_received) || 0) * (parseFloat(i?.unit_cost) || 0), 0);
    const sDiff = sTotalOrdered - sTotalReceived;
    const poStatusLabels = { received_complete: 'Recibido completo', received_partial: 'Recibido parcial', rejected: 'Rechazado' };
    const summaryStatusCfg = statusPreviewConfig?.[savedReceiptData?.status];

    return (
      <div className="min-h-screen bg-background">
        <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} user={user} />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} />
        <main className="lg:ml-72 pt-16 p-4 md:p-6">
          <div className="max-w-4xl mx-auto space-y-5">
            <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>

            <div className="flex items-center justify-between flex-wrap gap-3 no-print">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Icon name="FileCheck" size={24} className="text-green-600" />
                  Resumen de Recepción
                </h1>
                <p className="text-muted-foreground text-sm mt-0.5">Recepción guardada exitosamente</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
                  <Icon name="Printer" size={16} />
                  Imprimir / PDF
                </Button>
                <Button onClick={() => navigate('/goods-receipt')} className="flex items-center gap-2">
                  <Icon name="ArrowLeft" size={16} />
                  Volver a Recepciones
                </Button>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
              <Icon name="CheckCircle" size={20} />
              <div>
                <p className="font-semibold text-sm">Recepción registrada exitosamente</p>
                <p className="text-xs text-green-600 mt-0.5">Estado del pedido actualizado a: <strong>{poStatusLabels?.[savedReceiptData?.po_status]}</strong></p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Número de recepción</p>
                  <p className="font-bold text-foreground font-mono text-sm mt-0.5">{savedReceiptData?.receipt_number}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Orden de compra</p>
                  <p className="font-semibold text-foreground text-sm mt-0.5">{savedReceiptData?.order_number}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Proveedor</p>
                  <p className="font-semibold text-foreground text-sm mt-0.5">{savedReceiptData?.supplier_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha y hora</p>
                  <p className="font-semibold text-foreground text-sm mt-0.5">{formatDateTime(savedReceiptData?.received_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Receptor</p>
                  <p className="font-semibold text-foreground text-sm mt-0.5">{savedReceiptData?.receiver_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Estado de recepción</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border mt-0.5 ${summaryStatusCfg?.color}`}>
                    <Icon name={summaryStatusCfg?.icon} size={12} />
                    {savedReceiptData?.status === 'completed' ? 'Recibido completo' : savedReceiptData?.status === 'partial' ? 'Recibido parcial' : 'Rechazado'}
                  </span>
                </div>
                {savedReceiptData?.notes && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground">Notas</p>
                    <p className="text-sm text-foreground mt-0.5 italic">{savedReceiptData?.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{summaryItems?.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Items esperados</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-700">{sReceived?.length}</p>
                <p className="text-xs text-green-600 mt-0.5">Recibidos</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-red-700">{sRejected?.length}</p>
                <p className="text-xs text-red-600 mt-0.5">Rechazados</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-orange-700">{sPartial?.length}</p>
                <p className="text-xs text-orange-600 mt-0.5">Parciales</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border bg-muted/30">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Icon name="Table" size={18} className="text-primary" />
                  Tabla Comparativa de Productos
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Producto</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">SKU</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Esperado</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Recibido</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Rechazado</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Lote</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Caducidad</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {summaryItems?.map((item, idx) => {
                      const qr = parseFloat(item?.quantity_received) || 0;
                      const qo = parseFloat(item?.quantity_ordered) || 0;
                      const qrej = parseFloat(item?.quantity_rejected) || 0;
                      const isFullReceived = qr >= qo;
                      const isRejected = qr === 0 && qrej > 0;
                      const isPartial = qr > 0 && qr < qo;
                      return (
                        <tr key={idx} className={`transition-colors ${isRejected ? 'bg-red-50/40' : isPartial ? 'bg-orange-50/40' : 'bg-green-50/20'}`}>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-foreground">{item?.product_name}</p>
                            <p className="text-xs text-muted-foreground">{formatPrice(item?.unit_cost || 0)} / u</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-mono text-muted-foreground">{item?.sku || '-'}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm font-semibold text-foreground">{qo}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-sm font-bold ${isFullReceived ? 'text-green-600' : isPartial ? 'text-orange-600' : 'text-muted-foreground'}`}>{qr}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-sm font-bold ${qrej > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>{qrej || '—'}</span>
                          </td>
                          <td className="px-4 py-3">
                            {item?.batch_number ? (
                              <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{item?.batch_number}</span>
                            ) : <span className="text-xs text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            {item?.expiry_date ? (
                              <span className="text-xs text-orange-700">{formatDate(item?.expiry_date)}</span>
                            ) : <span className="text-xs text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isFullReceived && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Recibido</span>}
                            {isPartial && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Parcial</span>}
                            {isRejected && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">Rechazado</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-muted/30">
                      <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-foreground">Totales</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold text-foreground">{formatPrice(sTotalOrdered)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold text-green-600">{formatPrice(sTotalReceived)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold text-red-600">{sDiff > 0 ? formatPrice(sDiff) : '—'}</span>
                      </td>
                      <td colSpan={3} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {sDiscrepancies?.length > 0 && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border bg-red-50/50">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Icon name="AlertTriangle" size={18} className="text-red-600" />
                    Discrepancias ({sDiscrepancies?.length})
                  </h3>
                </div>
                <div className="divide-y divide-border">
                  {sDiscrepancies?.map((item, idx) => {
                    const qr = parseFloat(item?.quantity_received) || 0;
                    const qo = parseFloat(item?.quantity_ordered) || 0;
                    const diff = qo - qr;
                    return (
                      <div key={idx} className="px-5 py-3 flex items-start gap-3">
                        <Icon name="AlertCircle" size={16} className="text-red-500 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{item?.product_name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Esperado: <strong>{qo}</strong> · Recibido: <strong className="text-green-600">{qr}</strong> · Diferencia: <strong className="text-red-600">{diff}</strong>
                          </p>
                          {item?.discrepancy_note && (
                            <p className="text-xs text-muted-foreground mt-1 italic">Nota: {item?.discrepancy_note}</p>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-red-600 shrink-0">{formatPrice(diff * (item?.unit_cost || 0))}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total discrepancias</span>
                  <span className="text-sm font-bold text-red-600">{formatPrice(sDiff)}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 pb-4 no-print">
              <Button variant="outline" onClick={() => navigate('/purchase-orders')} className="flex items-center gap-2">
                <Icon name="ArrowLeft" size={16} />
                Volver a Pedidos
              </Button>
              <Button variant="outline" onClick={() => navigate('/inventory-management')} className="flex items-center gap-2">
                Ir a Inventario
                <Icon name="ArrowRight" size={16} />
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ---- MAIN FORM VIEW ----
  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} user={user} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} />
      <main className="lg:ml-72 pt-16 p-4 md:p-6">
        <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 no-print">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Icon name="PackageCheck" size={24} className="text-primary" />
                Recibir Pedido
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {isClosed ? 'Vista de detalle — Pedido cerrado' : 'Marca los productos recibidos y guarda la recepción'}
              </p>
            </div>
            {isClosed && closedCfg && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${closedCfg?.color}`}>
                <Icon name={closedCfg?.icon} size={13} />
                {closedCfg?.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/purchase-orders')} className="flex items-center gap-2">
              <Icon name="ShoppingCart" size={16} />
              Pedidos
            </Button>
            <Button variant="outline" onClick={() => navigate('/goods-receipt')} className="flex items-center gap-2">
              <Icon name="ArrowLeft" size={16} />
              Recepciones
            </Button>
          </div>
        </div>

        {isClosed && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <Icon name="Lock" size={18} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Pedido cerrado — No se permiten más ediciones</p>
              <p className="text-xs text-amber-700 mt-0.5">Este pedido ya fue procesado y su ciclo está completo. Solo puedes ver el detalle o imprimir el documento.</p>
            </div>
            <button onClick={handlePrint} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-xs font-medium hover:bg-amber-200 transition-colors shrink-0">
              <Icon name="Printer" size={13} />
              Imprimir
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
            <Icon name="CheckCircle" size={20} />
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
            <Icon name="AlertCircle" size={16} />
            {error}
            <button onClick={() => setError(null)} className="ml-auto"><Icon name="X" size={14} /></button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Icon name="Loader2" size={32} className="animate-spin text-primary" />
          </div>
        ) : !order ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <Icon name="PackageX" size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Pedido no encontrado</p>
            <p className="text-xs text-muted-foreground mt-1">Verifica que el pedido exista y te pertenezca</p>
            <Button variant="outline" onClick={() => navigate('/purchase-orders')} className="mt-4">Volver a Pedidos</Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Order Info Card */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="text-lg font-bold text-foreground font-mono">{order?.order_number}</h2>
                    {isClosed && closedCfg ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 border ${closedCfg?.color}`}>
                        <Icon name={closedCfg?.icon} size={11} />
                        {closedCfg?.label}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <Icon name="Clock" size={11} />
                        En proceso
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1.5">
                      <Icon name="Building2" size={14} />
                      {order?.supplier_name || order?.suppliers?.name}
                    </span>
                    {(order?.supplier_email || order?.suppliers?.email) && (
                      <span className="flex items-center gap-1.5">
                        <Icon name="Mail" size={14} />
                        {order?.supplier_email || order?.suppliers?.email}
                      </span>
                    )}
                    {order?.order_date && (
                      <span className="flex items-center gap-1.5">
                        <Icon name="Calendar" size={14} />
                        Fecha pedido: {formatDate(order?.order_date)}
                      </span>
                    )}
                  </div>
                  {order?.notes && (
                    <p className="text-sm text-muted-foreground mt-2 italic">"{order?.notes}"</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Valor total del pedido</p>
                  <p className="text-2xl font-bold text-foreground">{formatPrice(order?.total_amount || 0)}</p>
                </div>
              </div>
            </div>

            {/* Progress summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{totalCount}</p>
                <p className="text-xs text-muted-foreground">Items esperados</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{receivedCount}</p>
                <p className="text-xs text-muted-foreground">Recibidos</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
                <p className="text-xs text-muted-foreground">Rechazados</p>
              </div>
              <div className={`border rounded-xl p-3 text-center ${previewCfg?.color}`}>
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Icon name={previewCfg?.icon} size={16} />
                </div>
                <p className="text-xs font-semibold">{previewCfg?.label}</p>
                <p className="text-xs opacity-75">Estado resultante</p>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Icon name="Package" size={18} className="text-primary" />
                    Productos del Pedido
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isClosed ? 'Detalle de productos procesados en esta recepción' : 'Marca cada producto como recibido o no recibido e ingresa la cantidad real'}
                  </p>
                </div>
                {isClosed && (
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors no-print"
                  >
                    <Icon name="Printer" size={13} />
                    Imprimir documento
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {!isClosed && <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Recibido</th>}
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Producto</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">SKU</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Esperado</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Recibido</th>
                      {!isClosed && <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Rechazado</th>}
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Lote</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Caducidad</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{isClosed ? 'Estado' : 'Nota discrepancia'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {receiptItems?.map((item, index) => {
                      const qr = parseFloat(item?.quantity_received) || 0;
                      const qo = parseFloat(item?.quantity_ordered) || 0;
                      const qrej = parseFloat(item?.quantity_rejected) || 0;
                      const isFullRec = qr >= qo;
                      const isRej = qr === 0;
                      const isPart = qr > 0 && qr < qo;
                      return (
                        <tr key={index} className={`transition-colors ${
                          isClosed
                            ? (isRej ? 'bg-red-50/30' : isPart ? 'bg-orange-50/30' : 'bg-green-50/20')
                            : (item?.received ? 'bg-green-50/30 hover:bg-green-50/50' : 'bg-red-50/30 hover:bg-red-50/50')
                        }`}>
                          {!isClosed && (
                            <td className="px-4 py-3">
                              <label className="flex items-center justify-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={item?.received}
                                  onChange={e => handleItemChange(index, 'received', e?.target?.checked)}
                                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                                />
                              </label>
                            </td>
                          )}
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-foreground">{item?.product_name}</p>
                            <p className="text-xs text-muted-foreground">{formatPrice((parseFloat(item?.unit_cost) || 0))} / u</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-mono text-muted-foreground">{item?.sku || '-'}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm font-semibold text-foreground">{qo}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isClosed ? (
                              <span className={`text-sm font-bold ${isFullRec ? 'text-green-600' : isPart ? 'text-orange-600' : 'text-muted-foreground'}`}>{qr}</span>
                            ) : (
                              <input
                                type="number"
                                min="0"
                                max={qo}
                                value={item?.quantity_received}
                                onChange={e => handleItemChange(index, 'quantity_received', e?.target?.value)}
                                disabled={!item?.received}
                                className="w-20 text-center px-2 py-1 border border-border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-40 disabled:cursor-not-allowed"
                              />
                            )}
                          </td>
                          {!isClosed && (
                            <td className="px-4 py-3 text-center">
                              <span className={`text-sm font-bold ${qrej > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>{qrej || '—'}</span>
                            </td>
                          )}
                          <td className="px-4 py-3">
                            {isClosed ? (
                              item?.batch_number ? (
                                <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{item?.batch_number}</span>
                              ) : <span className="text-xs text-muted-foreground">—</span>
                            ) : (
                              <input
                                type="text"
                                placeholder="Núm. lote"
                                value={item?.batch_number}
                                onChange={e => handleItemChange(index, 'batch_number', e?.target?.value)}
                                className="w-28 px-2 py-1 border border-border rounded-lg bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isClosed ? (
                              item?.expiry_date ? (
                                <span className="text-xs text-orange-700">{formatDate(item?.expiry_date)}</span>
                              ) : <span className="text-xs text-muted-foreground">—</span>
                            ) : (
                              <input
                                type="date"
                                value={item?.expiry_date}
                                onChange={e => handleItemChange(index, 'expiry_date', e?.target?.value)}
                                className="w-36 px-2 py-1 border border-border rounded-lg bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isClosed ? (
                              <span className="text-xs">
                                {isFullRec && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">Recibido</span>}
                                {isPart && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium">Parcial</span>}
                                {isRej && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">Rechazado</span>}
                              </span>
                            ) : (
                              <input
                                type="text"
                                placeholder={item?.received ? 'Opcional' : 'Motivo de rechazo'}
                                value={item?.discrepancy_note}
                                onChange={e => handleItemChange(index, 'discrepancy_note', e?.target?.value)}
                                className="w-40 px-2 py-1 border border-border rounded-lg bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">{receivedCount} de {totalCount} productos marcados como recibidos</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">Valor pedido: <strong>{formatPrice(totalOrdered)}</strong></span>
                  <span className="text-xs text-green-700 font-semibold">Valor recibido: {formatPrice(totalReceived)}</span>
                </div>
              </div>
            </div>

            {/* Discrepancies section */}
            {discrepancyItems?.length > 0 && (
              <div className="bg-card border border-red-200 rounded-xl overflow-hidden">
                <div className="px-5 py-3 bg-red-50 border-b border-red-200">
                  <h3 className="font-semibold text-red-800 flex items-center gap-2">
                    <Icon name="AlertTriangle" size={16} className="text-red-600" />
                    Discrepancias detectadas ({discrepancyItems?.length})
                  </h3>
                </div>
                <div className="divide-y divide-border">
                  {discrepancyItems?.map((item, idx) => {
                    const qr = parseFloat(item?.quantity_received) || 0;
                    const qo = parseFloat(item?.quantity_ordered) || 0;
                    const diff = qo - qr;
                    return (
                      <div key={idx} className="px-5 py-3 flex items-start gap-3">
                        <Icon name="AlertCircle" size={15} className="text-red-500 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{item?.product_name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Esperado: <strong>{qo}</strong> · Recibido: <strong className="text-green-600">{qr}</strong> · Faltante: <strong className="text-red-600">{diff}</strong>
                          </p>
                          {item?.discrepancy_note && (
                            <p className="text-xs italic text-muted-foreground mt-0.5">Nota: {item?.discrepancy_note}</p>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-red-600 shrink-0">{formatPrice(diff * (item?.unit_cost || 0))}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Receiver info (only when not closed) */}
            {!isClosed && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Icon name="User" size={18} className="text-primary" />
                  Información del Receptor
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Nombre del receptor <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre completo de quien recibe"
                      value={receiverName}
                      onChange={e => setReceiverName(e?.target?.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Notas generales</label>
                    <input
                      type="text"
                      placeholder="Observaciones adicionales..."
                      value={generalNotes}
                      onChange={e => setGeneralNotes(e?.target?.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Status preview & Save */}
            {!isClosed ? (
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Estado resultante del pedido:</p>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${previewCfg?.color}`}>
                      <Icon name={previewCfg?.icon} size={16} />
                      {previewCfg?.label}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {previewStatus === 'completed' && 'Todos los productos fueron recibidos — el pedido se cerrará'}
                      {previewStatus === 'partial' && 'Algunos productos fueron recibidos, otros no'}
                      {previewStatus === 'rejected' && 'Ningún producto fue recibido — el pedido se cerrará como rechazado'}
                    </p>
                    {(previewStatus === 'completed' || previewStatus === 'rejected') && (
                      <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                        <Icon name="Lock" size={11} />
                        Al guardar, este pedido quedará cerrado y no podrá editarse
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/goods-receipt')}
                      disabled={isSaving}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving || !receiverName?.trim()}
                      className="flex items-center gap-2"
                    >
                      {isSaving ? (
                        <><Icon name="Loader2" size={16} className="animate-spin" /> Guardando...</>
                      ) : (
                        <><Icon name="Save" size={16} /> Guardar Recepción</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Este pedido está cerrado</p>
                    <p className="text-xs text-muted-foreground">No se pueden realizar más cambios. Puedes imprimir el documento de recepción.</p>
                  </div>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Icon name="Printer" size={16} />
                    Imprimir documento de recepción
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 pb-4 no-print">
              <Button variant="outline" onClick={() => navigate('/purchase-orders')} className="flex items-center gap-2">
                <Icon name="ArrowLeft" size={16} />
                Volver a Pedidos de Compra
              </Button>
              <Button variant="outline" onClick={() => navigate('/inventory-management')} className="flex items-center gap-2">
                Ir a Inventario
                <Icon name="ArrowRight" size={16} />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GoodsReceiptDetail;
