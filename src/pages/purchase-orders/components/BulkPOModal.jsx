import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { supabase } from '../../../lib/supabase';

// Mock simulation data shown by default
const MOCK_SIMULATION = [
  {
    supplierId: 'mock-1',
    supplierName: 'Distribuidora Alimentos del Norte',
    supplierEmail: 'pedidos@alimentos-norte.mx',
    expectedDelivery: '2026-03-08',
    notes: 'Entrega en almacén principal',
    items: [
      { productName: 'Harina de Trigo 1kg', quantity: 50, unitCost: 18.50, subtotal: 925.00, stockAlert: true },
      { productName: 'Aceite Vegetal 1L', quantity: 30, unitCost: 32.00, subtotal: 960.00, stockAlert: true },
      { productName: 'Azúcar Estándar 1kg', quantity: 40, unitCost: 22.00, subtotal: 880.00, stockAlert: false },
    ],
    total: 2765.00
  },
  {
    supplierId: 'mock-2',
    supplierName: 'Proveedora Lácteos Frescos',
    supplierEmail: 'ventas@lacteosfresco.mx',
    expectedDelivery: '2026-03-06',
    notes: 'Requiere refrigeración',
    items: [
      { productName: 'Leche Entera 1L', quantity: 120, unitCost: 24.00, subtotal: 2880.00, stockAlert: true },
      { productName: 'Queso Manchego 500g', quantity: 25, unitCost: 85.00, subtotal: 2125.00, stockAlert: true },
    ],
    total: 5005.00
  },
  {
    supplierId: 'mock-3',
    supplierName: 'Bebidas y Refrescos SA',
    supplierEmail: 'compras@bebidasrefrescos.mx',
    expectedDelivery: '2026-03-10',
    notes: '',
    items: [
      { productName: 'Refresco Cola 600ml', quantity: 200, unitCost: 12.50, subtotal: 2500.00, stockAlert: false },
      { productName: 'Agua Mineral 500ml', quantity: 150, unitCost: 8.00, subtotal: 1200.00, stockAlert: true },
    ],
    total: 3700.00
  }
];

const BulkPOModal = ({ suppliers, establishments, userId, taxRate, taxLabel, onSave, onClose, isLoading }) => {
  const { formatPrice } = useCurrency();
  const [filterEstablishment, setFilterEstablishment] = useState('all');
  const [selectedSupplierIds, setSelectedSupplierIds] = useState([]);
  const [lowStockData, setLowStockData] = useState([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEstablishmentPicker, setShowEstablishmentPicker] = useState(false);

  useEffect(() => {
    if (userId) fetchLowStockBySupplier();
  }, [userId]);

  const fetchLowStockBySupplier = async () => {
    setLoadingStock(true);
    try {
      const { data, error } = await supabase?.rpc('get_low_stock_items_by_supplier', { p_user_id: userId });
      if (error) throw error;
      setLowStockData(data || []);
    } catch (err) {
      console.error('Error fetching low stock:', err);
      setLowStockData([]);
    } finally {
      setLoadingStock(false);
    }
  };

  // Group low stock items by supplier
  const supplierOrders = useMemo(() => {
    const map = {};
    (lowStockData || [])?.forEach(item => {
      if (!map?.[item?.supplier_id]) {
        map[item?.supplier_id] = {
          supplierId: item?.supplier_id,
          supplierName: item?.supplier_name,
          supplierEmail: item?.supplier_email,
          supplierPhone: item?.supplier_phone,
          items: []
        };
      }
      map?.[item?.supplier_id]?.items?.push({
        catalog_item_id: item?.catalog_item_id,
        item_name: item?.item_name,
        sku: item?.sku,
        stock_quantity: item?.stock_quantity,
        min_stock_level: item?.min_stock_level,
        quantity: item?.suggested_quantity,
        unit_cost: item?.purchase_price,
        subtotal: (item?.purchase_price || 0) * (item?.suggested_quantity || 0)
      });
    });
    return Object.values(map);
  }, [lowStockData]);

  const filteredSupplierOrders = useMemo(() => {
    // Filter by establishment if needed (for now show all since supplier_products doesn't have location)
    return supplierOrders;
  }, [supplierOrders, filterEstablishment]);

  const toggleSupplier = (supplierId) => {
    setSelectedSupplierIds(prev =>
      prev?.includes(supplierId) ? prev?.filter(id => id !== supplierId) : [...prev, supplierId]
    );
  };

  const selectAll = () => {
    setSelectedSupplierIds(filteredSupplierOrders?.map(o => o?.supplierId));
  };

  const clearAll = () => setSelectedSupplierIds([]);

  const selectedOrders = filteredSupplierOrders?.filter(o => selectedSupplierIds?.includes(o?.supplierId));

  const summaryStats = useMemo(() => {
    const totalSuppliers = selectedOrders?.length;
    const totalProducts = selectedOrders?.reduce((s, o) => s + o?.items?.length, 0);
    const totalUnits = selectedOrders?.reduce((s, o) => s + o?.items?.reduce((ss, i) => ss + (i?.quantity || 0), 0), 0);
    const subtotal = selectedOrders?.reduce((s, o) => s + o?.items?.reduce((ss, i) => ss + (i?.subtotal || 0), 0), 0);
    const taxAmt = subtotal * (taxRate || 16) / 100;
    const total = subtotal + taxAmt;
    return { totalSuppliers, totalProducts, totalUnits, subtotal, taxAmt, total };
  }, [selectedOrders, taxRate]);

  const handleCreate = () => {
    if (selectedOrders?.length === 0) {
      alert('Selecciona al menos un proveedor');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    const orders = selectedOrders?.map(o => {
      const subtotal = o?.items?.reduce((s, i) => s + (i?.subtotal || 0), 0);
      const taxAmt = subtotal * (taxRate || 16) / 100;
      return {
        supplier_id: o?.supplierId,
        supplier_name: o?.supplierName,
        supplier_email: o?.supplierEmail,
        supplier_phone: o?.supplierPhone,
        location_id: filterEstablishment !== 'all' ? filterEstablishment : null,
        subtotal_amount: subtotal,
        tax_amount: taxAmt,
        total_amount: subtotal + taxAmt,
        notes: 'Pedido automático por stock bajo',
        items: o?.items?.map(i => ({
          catalog_item_id: i?.catalog_item_id,
          item_name: i?.item_name,
          sku: i?.sku,
          quantity: i?.quantity,
          unit_cost: i?.unit_cost,
          subtotal: i?.subtotal
        }))
      };
    });

    const createdOrders = await onSave(orders);
    if (createdOrders?.length > 0) {
      // Generate PDF per supplier
      createdOrders?.forEach(order => {
        generateSupplierPDF(order);
      });
    }
  };

  const generateSupplierPDF = (order) => {
    const orderDate = new Date()?.toLocaleDateString('es-MX');
    const itemsHtml = (order?.items || [])?.map((item, i) => `
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:8px 12px;">${i + 1}</td>
        <td style="padding:8px 12px;">${item?.item_name || 'Producto'}</td>
        <td style="padding:8px 12px;">${item?.sku || '-'}</td>
        <td style="padding:8px 12px;text-align:center;">${item?.quantity}</td>
        <td style="padding:8px 12px;text-align:right;">$${parseFloat(item?.unit_cost || 0)?.toFixed(2)}</td>
        <td style="padding:8px 12px;text-align:right;">$${parseFloat(item?.subtotal || 0)?.toFixed(2)}</td>
      </tr>
    `)?.join('');

    const subtotal = (order?.items || [])?.reduce((s, i) => s + (i?.subtotal || 0), 0);
    const taxAmt = subtotal * (taxRate || 16) / 100;
    const total = subtotal + taxAmt;

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Pedido ${order?.order_number}</title>
    <style>body{font-family:Arial,sans-serif;margin:0;padding:20px;color:#111;}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #e5e7eb;}
    .title{font-size:24px;font-weight:bold;color:#1d4ed8;}
    table{width:100%;border-collapse:collapse;margin-top:16px;}
    th{background:#f3f4f6;padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase;color:#6b7280;}
    .totals{margin-top:16px;display:flex;justify-content:flex-end;}
    .totals-box{width:280px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;}
    .totals-row{display:flex;justify-content:space-between;padding:8px 16px;border-bottom:1px solid #e5e7eb;}
    .totals-row.total{background:#1d4ed8;color:white;font-weight:bold;font-size:16px;}
    </style></head><body>
    <div class="header">
      <div>
        <div class="title">PEDIDO DE COMPRA</div>
        <div style="font-size:20px;font-weight:600;margin-top:4px;">${order?.order_number || ''}</div>
        <div style="margin-top:4px;font-size:13px;color:#6b7280;">Generación masiva automática</div>
      </div>
      <div style="text-align:right;font-size:13px;color:#6b7280;">
        <div><strong>Fecha:</strong> ${orderDate}</div>
      </div>
    </div>
    <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:24px;">
      <div style="font-size:11px;text-transform:uppercase;color:#6b7280;margin-bottom:8px;">Proveedor</div>
      <div style="font-weight:600;font-size:15px;">${order?.supplier_name || ''}</div>
      ${order?.supplier_email ? `<div style="color:#6b7280;font-size:13px;">${order?.supplier_email}</div>` : ''}
    </div>
    <table>
      <thead><tr>
        <th>#</th><th>Producto</th><th>SKU</th><th style="text-align:center;">Cantidad</th>
        <th style="text-align:right;">Precio Unit.</th><th style="text-align:right;">Subtotal</th>
      </tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <div class="totals">
      <div class="totals-box">
        <div class="totals-row"><span>Subtotal</span><span>$${subtotal?.toFixed(2)}</span></div>
        <div class="totals-row"><span>${taxLabel || 'IVA'} (${taxRate || 16}%)</span><span>$${taxAmt?.toFixed(2)}</span></div>
        <div class="totals-row total"><span>TOTAL</span><span>$${total?.toFixed(2)}</span></div>
      </div>
    </div>
    <script>window.onload=function(){window.print();}</script>
    </body></html>`;

    const win = window.open('', '_blank');
    if (win) {
      win?.document?.write(html);
      win?.document?.close();
    }
  };

  const selectedEstablishmentName = filterEstablishment === 'all' ?'Todos los establecimientos'
    : establishments?.find(e => e?.id === filterEstablishment)?.branch_name
      || establishments?.find(e => e?.id === filterEstablishment)?.location_name
      || 'Establecimiento';

  return (
    <>
      <div className="bg-card rounded-xl shadow-xl w-full max-w-5xl my-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
              <Icon name="Zap" size={18} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Generación Masiva de Pedidos</h2>
              <p className="text-sm text-muted-foreground">Productos con stock 0 o por debajo del mínimo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><Icon name="X" size={20} /></button>
        </div>

        {/* Establishment Selector — improved */}
        <div className="px-6 py-4 border-b border-border bg-muted/10 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="Store" size={15} className="text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Establecimiento</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={selectAll} className="text-xs text-primary hover:underline font-medium">Seleccionar todos</button>
              <span className="text-muted-foreground text-xs">|</span>
              <button onClick={clearAll} className="text-xs text-muted-foreground hover:underline">Limpiar</button>
            </div>
          </div>

          {/* Chips row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* "All" chip */}
            <button
              type="button"
              onClick={() => setFilterEstablishment('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                filterEstablishment === 'all' ?'bg-primary text-primary-foreground border-primary shadow-sm' :'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
              }`}
            >
              <Icon name="Globe" size={13} />
              Todos
            </button>

            {/* Individual establishment chips */}
            {(establishments || [])?.map(est => {
              const name = est?.branch_name || est?.location_name || 'Establecimiento';
              const isSelected = filterEstablishment === est?.id;
              return (
                <button
                  key={est?.id}
                  type="button"
                  onClick={() => setFilterEstablishment(est?.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  <Icon name="Store" size={13} />
                  {name}
                  {isSelected && <Icon name="Check" size={12} />}
                </button>
              );
            })}

            {/* If no establishments loaded, show placeholder */}
            {(!establishments || establishments?.length === 0) && (
              <span className="text-xs text-muted-foreground italic">Sin establecimientos disponibles</span>
            )}
          </div>

          {/* Selected indicator */}
          {filterEstablishment !== 'all' && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-primary">
              <Icon name="MapPin" size={12} />
              <span>Filtrando por: <strong>{selectedEstablishmentName}</strong></span>
              <button
                onClick={() => setFilterEstablishment('all')}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <Icon name="X" size={12} />
              </button>
            </div>
          )}
        </div>

        {/* KPI Summary */}
        <div className="grid grid-cols-4 gap-0 border-b border-border flex-shrink-0">
          <div className="flex flex-col items-center justify-center py-4 border-r border-border">
            <span className="text-2xl font-bold text-foreground">{summaryStats?.totalSuppliers}</span>
            <span className="text-xs text-muted-foreground mt-0.5">Proveedores</span>
          </div>
          <div className="flex flex-col items-center justify-center py-4 border-r border-border">
            <span className="text-2xl font-bold text-foreground">{summaryStats?.totalProducts}</span>
            <span className="text-xs text-muted-foreground mt-0.5">Productos</span>
          </div>
          <div className="flex flex-col items-center justify-center py-4 border-r border-border">
            <span className="text-2xl font-bold text-foreground">{summaryStats?.totalUnits}</span>
            <span className="text-xs text-muted-foreground mt-0.5">Unidades totales</span>
          </div>
          <div className="flex flex-col items-center justify-center py-4">
            <span className="text-2xl font-bold text-primary">{formatPrice(summaryStats?.total)}</span>
            <span className="text-xs text-muted-foreground mt-0.5">Total estimado</span>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {loadingStock ? (
            <div className="flex items-center justify-center py-16">
              <Icon name="Loader2" size={28} className="animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Analizando inventario...</span>
            </div>
          ) : filteredSupplierOrders?.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircle" size={28} className="text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">¡Inventario en buen estado!</h3>
              <p className="text-muted-foreground text-sm">No hay productos con stock bajo o en cero asignados a proveedores.</p>
            </div>
          ) : (
            filteredSupplierOrders?.map((order) => {
              const isSelected = selectedSupplierIds?.includes(order?.supplierId);
              const orderSubtotal = order?.items?.reduce((s, i) => s + (i?.subtotal || 0), 0);
              const orderTax = orderSubtotal * (taxRate || 16) / 100;
              const orderTotal = orderSubtotal + orderTax;

              return (
                <div
                  key={order?.supplierId}
                  className={`border-2 rounded-xl overflow-hidden transition-all ${isSelected ? 'border-primary shadow-md' : 'border-border'}`}
                >
                  {/* Supplier header */}
                  <div
                    className={`flex items-center justify-between px-4 py-3 cursor-pointer ${isSelected ? 'bg-primary/5' : 'bg-muted/40'} border-b border-border`}
                    onClick={() => toggleSupplier(order?.supplierId)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-primary bg-primary' : 'border-border'}`}>
                        {isSelected && <Icon name="Check" size={12} className="text-white" />}
                      </div>
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon name="Truck" size={15} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{order?.supplierName}</p>
                        <p className="text-xs text-muted-foreground">{order?.supplierEmail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total pedido</p>
                      <p className="text-sm font-bold text-primary">{formatPrice(orderTotal)}</p>
                    </div>
                  </div>

                  {/* Products table */}
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Producto</th>
                        <th className="text-center px-3 py-2 text-xs font-semibold text-muted-foreground">Stock</th>
                        <th className="text-center px-3 py-2 text-xs font-semibold text-muted-foreground">Cantidad sugerida</th>
                        <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground">Precio unit.</th>
                        <th className="text-right px-4 py-2 text-xs font-semibold text-muted-foreground">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order?.items?.map((item, ii) => (
                        <tr key={ii} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-muted rounded flex items-center justify-center flex-shrink-0">
                                <Icon name="Package" size={12} className="text-muted-foreground" />
                              </div>
                              <div>
                                <span className="text-foreground font-medium">{item?.item_name}</span>
                                {item?.sku && <span className="text-xs text-muted-foreground ml-1">({item?.sku})</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {item?.stock_quantity === 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                <Icon name="AlertTriangle" size={10} /> Sin stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                                <Icon name="AlertTriangle" size={10} /> Bajo ({item?.stock_quantity})
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="inline-flex items-center justify-center w-10 h-6 bg-primary/10 text-primary text-xs font-bold rounded">
                              {item?.quantity}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right text-muted-foreground">{formatPrice(item?.unit_cost)}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-foreground">{formatPrice(item?.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/20">
                        <td colSpan={3} className="px-4 py-2 text-xs text-muted-foreground text-right">Subtotal / {taxLabel || 'IVA'} ({taxRate}%) / Total:</td>
                        <td colSpan={2} className="px-4 py-2 text-right">
                          <span className="text-xs text-muted-foreground">{formatPrice(orderSubtotal)}</span>
                          <span className="text-xs text-muted-foreground mx-1">/</span>
                          <span className="text-xs text-muted-foreground">{formatPrice(orderTax)}</span>
                          <span className="text-xs text-muted-foreground mx-1">/</span>
                          <span className="font-bold text-primary">{formatPrice(orderTotal)}</span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border flex-shrink-0">
          <div className="text-sm text-muted-foreground">
            {selectedSupplierIds?.length} proveedor(es) seleccionado(s)
            {selectedSupplierIds?.length > 0 && (
              <span className="ml-2 font-semibold text-foreground">— Total: {formatPrice(summaryStats?.total)}</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button
              variant="default"
              onClick={handleCreate}
              disabled={isLoading || selectedSupplierIds?.length === 0}
              iconName={isLoading ? 'Loader2' : 'Zap'}
              iconPosition="left"
              className="bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
            >
              {isLoading ? 'Generando...' : `Crear ${selectedSupplierIds?.length} Pedido(s)`}
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Icon name="Zap" size={22} className="text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Confirmar Generación Masiva</h3>
                <p className="text-sm text-muted-foreground">Se crearán {selectedSupplierIds?.length} pedido(s) de compra</p>
              </div>
            </div>

            {/* Establishment badge in confirm */}
            <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg">
              <Icon name={filterEstablishment === 'all' ? 'Globe' : 'Store'} size={14} className="text-primary" />
              <span className="text-xs font-medium text-foreground">
                Establecimiento: <span className="text-primary font-semibold">{selectedEstablishmentName}</span>
              </span>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Proveedores:</span>
                <span className="font-medium">{summaryStats?.totalSuppliers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Productos:</span>
                <span className="font-medium">{summaryStats?.totalProducts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unidades:</span>
                <span className="font-medium">{summaryStats?.totalUnits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatPrice(summaryStats?.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{taxLabel} ({taxRate}%):</span>
                <span className="font-medium">{formatPrice(summaryStats?.taxAmt)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-border pt-2">
                <span>Total:</span>
                <span className="text-primary">{formatPrice(summaryStats?.total)}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
              <Icon name="FileText" size={12} />
              Se generará un PDF individual por proveedor al confirmar.
            </p>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>Cancelar</Button>
              <Button
                variant="default"
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                onClick={handleConfirm}
                iconName="Check"
                iconPosition="left"
              >
                Confirmar y Generar PDFs
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkPOModal;
