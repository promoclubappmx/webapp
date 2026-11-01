import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useCurrency } from '../../../contexts/CurrencyContext';

const PurchaseOrderForm = ({ order, suppliers, establishments, taxRate, taxLabel, onSave, onCancel, isLoading }) => {
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const [form, setForm] = useState({
    supplier_id: order?.supplier_id || '',
    location_id: order?.location_id || '',
    order_date: order?.order_date || new Date()?.toISOString()?.split('T')?.[0],
    notes: order?.notes || '',
    items: order?.items || []
  });
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const printRef = useRef(null);

  useEffect(() => {
    if (form?.supplier_id) fetchSupplierProducts(form?.supplier_id);
    else setSupplierProducts([]);
  }, [form?.supplier_id]);

  const fetchSupplierProducts = async (supplierId) => {
    setLoadingProducts(true);
    try {
      const { data } = await supabase
        ?.from('supplier_products')
        ?.select(`
          id,
          purchase_price,
          catalog_item_id,
          catalog_items (
            id,
            name,
            sku,
            stock_quantity,
            min_stock_level,
            cost
          )
        `)
        ?.eq('supplier_id', supplierId);
      setSupplierProducts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...(prev?.items || []), { catalog_item_id: '', item_name: '', sku: '', quantity: 1, unit_cost: '', notes: '' }]
    }));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...(form?.items || [])];
    newItems[index] = { ...newItems?.[index], [field]: value };
    if (field === 'catalog_item_id') {
      const sp = supplierProducts?.find(p => p?.catalog_item_id === value);
      if (sp) {
        newItems[index].unit_cost = sp?.purchase_price || sp?.catalog_items?.cost || '';
        newItems[index].item_name = sp?.catalog_items?.name || '';
        newItems[index].sku = sp?.catalog_items?.sku || '';
      }
    }
    setForm(prev => ({ ...prev, items: newItems }));
  };

  const removeItem = (index) => {
    setForm(prev => ({ ...prev, items: prev?.items?.filter((_, i) => i !== index) }));
  };

  const subtotal = (form?.items || [])?.reduce(
    (sum, item) => sum + ((parseFloat(item?.unit_cost) || 0) * (parseInt(item?.quantity) || 0)), 0
  );
  const taxAmount = subtotal * (taxRate || 16) / 100;
  const total = subtotal + taxAmount;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!form?.supplier_id) { alert('Selecciona un proveedor'); return; }
    if (!form?.items?.length) { alert('Agrega al menos un producto'); return; }
    const data = {
      ...form,
      subtotal_amount: subtotal,
      tax_amount: taxAmount,
      total_amount: total
    };
    setPendingData(data);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    const saved = await onSave(pendingData);
    if (saved) {
      // Open PDF
      openPDF(saved, pendingData);
    }
  };

  const openPDF = (savedOrder, formData) => {
    const supplier = suppliers?.find(s => s?.id === formData?.supplier_id);
    const establishment = establishments?.find(e => e?.id === formData?.location_id);
    const orderDate = formData?.order_date || new Date()?.toISOString()?.split('T')?.[0];
    const itemsHtml = (formData?.items || [])?.map((item, i) => `
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:8px 12px;">${i + 1}</td>
        <td style="padding:8px 12px;">${item?.item_name || 'Producto'}</td>
        <td style="padding:8px 12px;">${item?.sku || '-'}</td>
        <td style="padding:8px 12px;text-align:center;">${item?.quantity}</td>
        <td style="padding:8px 12px;text-align:right;">$${parseFloat(item?.unit_cost || 0)?.toFixed(2)}</td>
        <td style="padding:8px 12px;text-align:right;">$${((parseFloat(item?.unit_cost) || 0) * (parseInt(item?.quantity) || 0))?.toFixed(2)}</td>
      </tr>
    `)?.join('');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Pedido ${savedOrder?.order_number}</title>
    <style>body{font-family:Arial,sans-serif;margin:0;padding:20px;color:#111;}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #e5e7eb;}
    .title{font-size:24px;font-weight:bold;color:#1d4ed8;}
    .badge{background:#dbeafe;color:#1d4ed8;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;}
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
        <div style="font-size:20px;font-weight:600;margin-top:4px;">${savedOrder?.order_number}</div>
        <div style="margin-top:8px;"><span class="badge">En Proceso</span></div>
      </div>
      <div style="text-align:right;font-size:13px;color:#6b7280;">
        <div><strong>Fecha de pedido:</strong> ${orderDate}</div>
        ${establishment ? `<div><strong>Establecimiento:</strong> ${establishment?.branch_name || establishment?.location_name}</div>` : ''}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">
      <div style="background:#f9fafb;border-radius:8px;padding:16px;">
        <div style="font-size:11px;text-transform:uppercase;color:#6b7280;margin-bottom:8px;">Proveedor</div>
        <div style="font-weight:600;font-size:15px;">${supplier?.name || ''}</div>
        ${supplier?.email ? `<div style="color:#6b7280;font-size:13px;">${supplier?.email}</div>` : ''}
        ${supplier?.phone ? `<div style="color:#6b7280;font-size:13px;">${supplier?.phone}</div>` : ''}
      </div>
      ${formData?.notes ? `<div style="background:#f9fafb;border-radius:8px;padding:16px;">
        <div style="font-size:11px;text-transform:uppercase;color:#6b7280;margin-bottom:8px;">Notas</div>
        <div style="font-size:13px;">${formData?.notes}</div>
      </div>` : ''}
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
        <div class="totals-row"><span>${taxLabel || 'IVA'} (${taxRate || 16}%)</span><span>$${taxAmount?.toFixed(2)}</span></div>
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

  const selectedSupplier = suppliers?.find(s => s?.id === form?.supplier_id);
  const selectedEstablishment = establishments?.find(e => e?.id === form?.location_id);

  return (
    <>
      <div className="bg-card rounded-xl border border-border shadow-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">{order ? 'Editar Pedido' : 'Nuevo Pedido de Compra'}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-muted rounded-lg"><Icon name="X" size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Supplier */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Proveedor *</label>
              <select
                value={form?.supplier_id}
                onChange={e => setForm(prev => ({ ...prev, supplier_id: e?.target?.value, items: [] }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                required
              >
                <option value="">Seleccionar proveedor...</option>
                {suppliers?.map(s => <option key={s?.id} value={s?.id}>{s?.name}</option>)}
              </select>
            </div>

            {/* Establishment */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Establecimiento</label>
              <select
                value={form?.location_id}
                onChange={e => setForm(prev => ({ ...prev, location_id: e?.target?.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
              >
                <option value="">Seleccionar establecimiento...</option>
                {establishments?.map(e => (
                  <option key={e?.id} value={e?.id}>{e?.branch_name || e?.location_name || e?.address_normalized}</option>
                ))}
              </select>
            </div>

            {/* Order Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Fecha de Pedido *</label>
              <input
                type="date"
                value={form?.order_date}
                onChange={e => setForm(prev => ({ ...prev, order_date: e?.target?.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Notas</label>
              <textarea
                value={form?.notes}
                onChange={e => setForm(prev => ({ ...prev, notes: e?.target?.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm resize-none"
                placeholder="Instrucciones especiales..."
              />
            </div>
          </div>

          {/* Products */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Productos del pedido</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                iconName="Plus"
                iconPosition="left"
                disabled={!form?.supplier_id}
              >
                Agregar producto
              </Button>
            </div>

            {!form?.supplier_id ? (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center text-muted-foreground">
                <Icon name="Package" size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Selecciona un proveedor para ver sus productos asignados</p>
              </div>
            ) : loadingProducts ? (
              <div className="flex items-center justify-center py-8">
                <Icon name="Loader2" size={20} className="animate-spin text-primary" />
              </div>
            ) : form?.items?.length === 0 ? (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center text-muted-foreground">
                <Icon name="Package" size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {supplierProducts?.length === 0
                    ? 'Este proveedor no tiene productos asignados. Asigna productos en el perfil del proveedor.'
                    : 'Haz clic en "Agregar producto" para añadir artículos al pedido'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {form?.items?.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-muted/30 rounded-lg">
                    <div className="col-span-5">
                      <label className="block text-xs text-muted-foreground mb-1">Producto (asignado al proveedor)</label>
                      <select
                        value={item?.catalog_item_id}
                        onChange={e => updateItem(index, 'catalog_item_id', e?.target?.value)}
                        className="w-full px-2 py-1.5 border border-border rounded bg-background text-foreground text-sm"
                      >
                        <option value="">Seleccionar...</option>
                        {supplierProducts?.map(sp => (
                          <option key={sp?.catalog_item_id} value={sp?.catalog_item_id}>
                            {sp?.catalog_items?.name} {sp?.catalog_items?.sku ? `(${sp?.catalog_items?.sku})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-muted-foreground mb-1">Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        value={item?.quantity}
                        onChange={e => updateItem(index, 'quantity', e?.target?.value)}
                        className="w-full px-2 py-1.5 border border-border rounded bg-background text-foreground text-sm"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs text-muted-foreground mb-1">Costo unitario</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item?.unit_cost}
                        onChange={e => updateItem(index, 'unit_cost', e?.target?.value)}
                        className="w-full px-2 py-1.5 border border-border rounded bg-background text-foreground text-sm"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="col-span-2 flex items-end justify-between">
                      <span className="text-sm font-semibold text-foreground">
                        {formatPrice((parseFloat(item?.unit_cost) || 0) * (parseInt(item?.quantity) || 0))}
                      </span>
                      <button type="button" onClick={() => removeItem(index)} className="p-1 text-destructive hover:bg-red-50 rounded">
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Totals */}
            {form?.items?.length > 0 && (
              <div className="mt-4 p-4 bg-muted/20 rounded-xl border border-border">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Artículos solicitados:</span>
                    <span className="font-medium text-foreground">
                      {form?.items?.reduce((s, i) => s + (parseInt(i?.quantity) || 0), 0)} unidades
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{taxLabel || 'IVA'} ({taxRate || 16}%):</span>
                    <span className="font-medium text-foreground">{formatPrice(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold border-t border-border pt-2">
                    <span className="text-foreground">Total del pedido:</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" type="button" onClick={onCancel}>Cancelar</Button>
            <Button variant="default" type="submit" disabled={isLoading} iconName={isLoading ? 'Loader2' : 'ShoppingCart'} iconPosition="left">
              {isLoading ? 'Guardando...' : 'Crear Pedido'}
            </Button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && pendingData && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Icon name="ShoppingCart" size={22} className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Confirmar Pedido</h3>
                <p className="text-sm text-muted-foreground">¿Deseas crear este pedido de compra?</p>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Proveedor:</span>
                <span className="font-medium">{selectedSupplier?.name}</span>
              </div>
              {selectedEstablishment && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Establecimiento:</span>
                  <span className="font-medium">{selectedEstablishment?.branch_name || selectedEstablishment?.location_name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha de pedido:</span>
                <span className="font-medium">{pendingData?.order_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Productos:</span>
                <span className="font-medium">{pendingData?.items?.length} artículo(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatPrice(pendingData?.subtotal_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{taxLabel} ({taxRate}%):</span>
                <span className="font-medium">{formatPrice(pendingData?.tax_amount)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-border pt-2">
                <span>Total:</span>
                <span className="text-primary">{formatPrice(pendingData?.total_amount)}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
              <Icon name="FileText" size={12} />
              Al confirmar, el pedido se guardará con estado "En proceso" y se abrirá el PDF.
            </p>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>Cancelar</Button>
              <Button variant="default" className="flex-1" onClick={handleConfirm} iconName="Check" iconPosition="left">
                Confirmar y Generar PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PurchaseOrderForm;
