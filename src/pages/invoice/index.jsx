import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { useCurrency } from '../../contexts/CurrencyContext';

// Mock invoice data
const MOCK_INVOICES = [
  {
    id: 'INV-2024-001',
    date: '2024-02-20',
    dueDate: '2024-03-20',
    status: 'paid',
    customer: {
      name: 'María García López',
      email: 'maria.garcia@email.com',
      phone: '+52 55 1234 5678',
      address: 'Av. Insurgentes Sur 1234, Col. Del Valle, CDMX 03100',
      rfc: 'GALM850312AB3'
    },
    business: {
      name: 'Mi Restaurante SA de CV',
      rfc: 'MRE201015XY7',
      address: 'Calle Reforma 456, Col. Centro, CDMX 06000',
      phone: '+52 55 9876 5432',
      email: 'contacto@mirestaurante.com'
    },
    items: [
      { id: 1, name: 'Tacos de Canasta (x3)', sku: 'TAC-001', quantity: 3, unitPrice: 45, subtotal: 135 },
      { id: 2, name: 'Agua Mineral 500ml', sku: 'BEB-002', quantity: 2, unitPrice: 25, subtotal: 50 },
      { id: 3, name: 'Postre del Día', sku: 'POS-003', quantity: 1, unitPrice: 80, subtotal: 80 }
    ],
    promotionDiscount: { label: '10% Descuento en Comida', amount: 26.5 },
    couponDiscount: { code: 'WELCOME20', label: 'Cupón Bienvenida 20%', amount: 0 },
    shippingZone: 'local',
    shippingLabel: 'Envío Local',
    shippingCost: 50,
    shippingTaxable: true,
    taxRegion: 'general',
    taxRate: 16,
    taxIncluded: false,
    paymentMethod: 'Tarjeta de Crédito',
    notes: 'Entrega en puerta. Llamar antes de llegar.'
  },
  {
    id: 'INV-2024-002',
    date: '2024-02-22',
    dueDate: '2024-03-22',
    status: 'pending',
    customer: {
      name: 'Carlos Mendoza Ruiz',
      email: 'carlos.mendoza@empresa.com',
      phone: '+52 33 8765 4321',
      address: 'Blvd. Puerta de Hierro 2350, Zapopan, JAL 45116',
      rfc: 'MERC780901CD5'
    },
    business: {
      name: 'Mi Restaurante SA de CV',
      rfc: 'MRE201015XY7',
      address: 'Calle Reforma 456, Col. Centro, CDMX 06000',
      phone: '+52 55 9876 5432',
      email: 'contacto@mirestaurante.com'
    },
    items: [
      { id: 1, name: 'Orden Especial Chef', sku: 'ESP-001', quantity: 2, unitPrice: 320, subtotal: 640 },
      { id: 2, name: 'Vino de la Casa (botella)', sku: 'VIN-001', quantity: 1, unitPrice: 450, subtotal: 450 },
      { id: 3, name: 'Servicio de Mesa Privada', sku: 'SRV-001', quantity: 1, unitPrice: 200, subtotal: 200 }
    ],
    promotionDiscount: null,
    couponDiscount: { code: 'SAVE5', label: 'Cupón SAVE5', amount: 50 },
    shippingZone: 'nacional',
    shippingLabel: 'Envío Nacional',
    shippingCost: 120,
    shippingTaxable: true,
    taxRegion: 'general',
    taxRate: 16,
    taxIncluded: false,
    paymentMethod: 'Transferencia Bancaria',
    notes: ''
  }
];

const statusConfig = {
  paid: { label: 'Pagada', color: 'bg-success/10 text-success border-success/20' },
  pending: { label: 'Pendiente', color: 'bg-warning/10 text-warning border-warning/20' },
  overdue: { label: 'Vencida', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  cancelled: { label: 'Cancelada', color: 'bg-muted text-muted-foreground border-border' }
};

const Invoice = () => {
  const navigate = useNavigate();
  const { formatPrice, currencySettings } = useCurrency();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(MOCK_INVOICES?.[0]);
  const [filterStatus, setFilterStatus] = useState('all');
  const printRef = useRef(null);

  const user = { name: 'Usuario', role: 'owner' };

  const filteredInvoices = MOCK_INVOICES?.filter(inv =>
    filterStatus === 'all' || inv?.status === filterStatus
  );

  // Calculate invoice totals
  const calcTotals = (invoice) => {
    const itemsSubtotal = invoice?.items?.reduce((sum, item) => sum + item?.subtotal, 0);
    const promotionDiscount = invoice?.promotionDiscount?.amount || 0;
    const couponDiscount = invoice?.couponDiscount?.amount || 0;
    const totalDiscount = promotionDiscount + couponDiscount;
    const taxableBase = invoice?.taxIncluded
      ? itemsSubtotal / (1 + invoice?.taxRate / 100)
      : itemsSubtotal - totalDiscount;
    const taxAmount = invoice?.taxIncluded
      ? itemsSubtotal - taxableBase
      : taxableBase * (invoice?.taxRate / 100);
    const shippingTax = invoice?.shippingTaxable
      ? invoice?.shippingCost * (invoice?.taxRate / 100)
      : 0;
    const subtotalBeforeTax = invoice?.taxIncluded ? taxableBase : itemsSubtotal;
    const total = invoice?.taxIncluded
      ? itemsSubtotal - totalDiscount + invoice?.shippingCost + shippingTax
      : itemsSubtotal - totalDiscount + taxAmount + invoice?.shippingCost + shippingTax;
    return {
      itemsSubtotal,
      promotionDiscount,
      couponDiscount,
      totalDiscount,
      taxableBase: subtotalBeforeTax,
      taxAmount,
      shippingCost: invoice?.shippingCost,
      shippingTax,
      total: Math.max(0, total)
    };
  };

  const handlePrint = () => {
    const inv = selectedInvoice;
    const totals = calcTotals(inv);
    const taxLabel = currencySettings?.taxSettings?.taxLabel || 'IVA';
    const shippingLabel = currencySettings?.shippingSettings?.globalConfig?.shippingLabel || 'Envío';

    const printWindow = window.open('', '_blank');
    printWindow?.document?.write(`
      <!DOCTYPE html><html><head>
      <meta charset="UTF-8"><title>Factura ${inv?.id}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #333; margin: 20px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background: #f5f5f5; padding: 8px; text-align: left; border-bottom: 2px solid #ddd; }
        td { padding: 8px; border-bottom: 1px solid #eee; }
        .totals { margin-left: auto; width: 300px; }
        .totals td { padding: 4px 8px; }
        .total-row { font-weight: bold; font-size: 14px; border-top: 2px solid #333; }
        .text-right { text-align: right; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
      </style></head><body>
      <div class="header">
        <div><h2>${inv?.business?.name}</h2><p>${inv?.business?.address}</p><p>RFC: ${inv?.business?.rfc}</p><p>${inv?.business?.email}</p></div>
        <div style="text-align:right"><h1>FACTURA</h1><p><strong>${inv?.id}</strong></p><p>Fecha: ${inv?.date}</p><p>Vence: ${inv?.dueDate}</p></div>
      </div>
      <hr/>
      <div style="display:flex;justify-content:space-between;margin:15px 0">
        <div><strong>Cliente:</strong><br/>${inv?.customer?.name}<br/>${inv?.customer?.address}<br/>RFC: ${inv?.customer?.rfc}<br/>${inv?.customer?.email}</div>
        <div><strong>Pago:</strong> ${inv?.paymentMethod}<br/><strong>Zona:</strong> ${inv?.shippingLabel}</div>
      </div>
      <table>
        <thead><tr><th>Descripción</th><th>SKU</th><th class="text-right">Cant.</th><th class="text-right">P. Unitario</th><th class="text-right">Subtotal</th></tr></thead>
        <tbody>
          ${inv?.items?.map(item => `<tr><td>${item?.name}</td><td>${item?.sku}</td><td class="text-right">${item?.quantity}</td><td class="text-right">${formatPrice(item?.unitPrice)}</td><td class="text-right">${formatPrice(item?.subtotal)}</td></tr>`)?.join('')}
        </tbody>
      </table>
      <table class="totals">
        <tr><td>Subtotal:</td><td class="text-right">${formatPrice(totals?.itemsSubtotal)}</td></tr>
        ${totals?.promotionDiscount > 0 ? `<tr><td>Descuento Promoción:</td><td class="text-right">-${formatPrice(totals?.promotionDiscount)}</td></tr>` : ''}
        ${totals?.couponDiscount > 0 ? `<tr><td>Descuento Cupón:</td><td class="text-right">-${formatPrice(totals?.couponDiscount)}</td></tr>` : ''}
        <tr><td>${taxLabel} (${inv?.taxRate}%):</td><td class="text-right">${formatPrice(totals?.taxAmount)}</td></tr>
        <tr><td>${shippingLabel}:</td><td class="text-right">${formatPrice(totals?.shippingCost)}</td></tr>
        ${totals?.shippingTax > 0 ? `<tr><td>${taxLabel} ${shippingLabel}:</td><td class="text-right">${formatPrice(totals?.shippingTax)}</td></tr>` : ''}
        <tr class="total-row"><td>TOTAL:</td><td class="text-right">${formatPrice(totals?.total)}</td></tr>
      </table>
      ${inv?.notes ? `<p><strong>Notas:</strong> ${inv?.notes}</p>` : ''}
      </body></html>
    `);
    printWindow?.document?.close();
    printWindow?.focus();
    printWindow?.print();
    printWindow?.close();
  };

  const totals = calcTotals(selectedInvoice);
  const taxLabel = currencySettings?.taxSettings?.taxLabel || 'IVA';
  const shippingLabel = currencySettings?.shippingSettings?.globalConfig?.shippingLabel || 'Envío';

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div
        className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
      >
        <div className="p-6">
          <div className="max-w-7xl mx-auto">

            <div className="flex items-center justify-between mb-6 mt-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Facturas</h1>
                <p className="text-muted-foreground mt-1">Resumen de órdenes con impuestos, descuentos y envío</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" iconName="Download">Exportar</Button>
                <Button iconName="Plus">Nueva Factura</Button>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
              {/* Invoice List */}
              <div className="xl:w-80 space-y-4">
                {/* Filter */}
                <div className="bg-card border border-border rounded-lg p-3">
                  <div className="flex gap-2 flex-wrap">
                    {[{ id: 'all', label: 'Todas' }, { id: 'paid', label: 'Pagadas' }, { id: 'pending', label: 'Pendientes' }, { id: 'overdue', label: 'Vencidas' }]?.map(f => (
                      <button
                        key={f?.id}
                        onClick={() => setFilterStatus(f?.id)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          filterStatus === f?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {f?.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Invoice Cards */}
                <div className="space-y-3">
                  {filteredInvoices?.map(inv => {
                    const t = calcTotals(inv);
                    const sc = statusConfig?.[inv?.status];
                    return (
                      <button
                        key={inv?.id}
                        onClick={() => setSelectedInvoice(inv)}
                        className={`w-full text-left bg-card border rounded-lg p-4 transition-all hover:shadow-md ${
                          selectedInvoice?.id === inv?.id
                            ? 'border-primary shadow-md'
                            : 'border-border'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-foreground text-sm">{inv?.id}</p>
                            <p className="text-xs text-muted-foreground">{inv?.customer?.name}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${sc?.color}`}>
                            {sc?.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{inv?.date}</span>
                          <span className="font-bold text-primary">{formatPrice(t?.total)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Invoice Detail */}
              {selectedInvoice && (
                <div className="flex-1" ref={printRef}>
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    {/* Invoice Header */}
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <Icon name="FileText" size={28} className="text-primary" />
                            <div>
                              <h2 className="text-2xl font-bold text-foreground">{selectedInvoice?.id}</h2>
                              <p className="text-sm text-muted-foreground">Fecha: {selectedInvoice?.date} · Vence: {selectedInvoice?.dueDate}</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full border font-medium ${
                            statusConfig?.[selectedInvoice?.status]?.color
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {statusConfig?.[selectedInvoice?.status]?.label}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" iconName="Printer" onClick={handlePrint}>Imprimir</Button>
                          <Button variant="outline" size="sm" iconName="Download">PDF</Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Business & Customer Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-muted/30 rounded-lg p-4">
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Emisor</h3>
                          <p className="font-semibold text-foreground">{selectedInvoice?.business?.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">{selectedInvoice?.business?.address}</p>
                          <p className="text-sm text-muted-foreground">RFC: {selectedInvoice?.business?.rfc}</p>
                          <p className="text-sm text-muted-foreground">{selectedInvoice?.business?.email}</p>
                          <p className="text-sm text-muted-foreground">{selectedInvoice?.business?.phone}</p>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-4">
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Cliente</h3>
                          <p className="font-semibold text-foreground">{selectedInvoice?.customer?.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">{selectedInvoice?.customer?.address}</p>
                          <p className="text-sm text-muted-foreground">RFC: {selectedInvoice?.customer?.rfc}</p>
                          <p className="text-sm text-muted-foreground">{selectedInvoice?.customer?.email}</p>
                          <p className="text-sm text-muted-foreground">{selectedInvoice?.customer?.phone}</p>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Icon name="Package" size={16} className="text-primary" />
                          Productos / Servicios
                        </h3>
                        <div className="border border-border rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-4 py-3">Descripción</th>
                                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-4 py-3">SKU</th>
                                <th className="text-right text-xs font-semibold text-muted-foreground uppercase px-4 py-3">Cant.</th>
                                <th className="text-right text-xs font-semibold text-muted-foreground uppercase px-4 py-3">P. Unitario</th>
                                <th className="text-right text-xs font-semibold text-muted-foreground uppercase px-4 py-3">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedInvoice?.items?.map((item, idx) => (
                                <tr key={item?.id} className={idx % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                                  <td className="px-4 py-3">
                                    <p className="font-medium text-foreground text-sm">{item?.name}</p>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="text-xs text-muted-foreground font-mono">{item?.sku}</span>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <span className="text-sm text-foreground">{item?.quantity}</span>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <span className="text-sm text-foreground">{formatPrice(item?.unitPrice)}</span>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <span className="font-semibold text-foreground">{formatPrice(item?.subtotal)}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Totals + Shipping + Tax Breakdown */}
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Payment & Shipping Info */}
                        <div className="flex-1 space-y-4">
                          <div className="bg-muted/30 rounded-lg p-4">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Información de Pago y Envío</h3>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Icon name="CreditCard" size={14} className="text-muted-foreground" />
                                <span className="text-sm text-foreground">{selectedInvoice?.paymentMethod}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Icon name="Truck" size={14} className="text-muted-foreground" />
                                <span className="text-sm text-foreground">{selectedInvoice?.shippingLabel}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Icon name="MapPin" size={14} className="text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{selectedInvoice?.customer?.address}</span>
                              </div>
                            </div>
                          </div>

                          {/* Tax Region Badge */}
                          <div className="bg-muted/30 rounded-lg p-4">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Configuración Fiscal</h3>
                            <div className="flex items-center gap-3">
                              <div className="bg-primary/10 rounded-lg p-2">
                                <Icon name="Receipt" size={16} className="text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{taxLabel} {selectedInvoice?.taxRate}%</p>
                                <p className="text-xs text-muted-foreground">
                                  {selectedInvoice?.taxRegion === 'frontera' ? 'Zona Fronteriza'
                                    : selectedInvoice?.taxRegion === 'exento'? 'Exento de IVA' :'IVA General'}
                                  {' · '}{selectedInvoice?.taxIncluded ? 'Incluido en precio' : 'Desglosado'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {selectedInvoice?.notes && (
                            <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
                              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Notas</h3>
                              <p className="text-sm text-foreground">{selectedInvoice?.notes}</p>
                            </div>
                          )}
                        </div>

                        {/* Totals Summary */}
                        <div className="md:w-80">
                          <div className="bg-muted/30 rounded-lg p-5">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Resumen de Totales</h3>
                            <div className="space-y-2.5">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal productos</span>
                                <span className="font-medium text-foreground">{formatPrice(totals?.itemsSubtotal)}</span>
                              </div>

                              {totals?.promotionDiscount > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-success flex items-center gap-1">
                                    <Icon name="Tag" size={12} />
                                    {selectedInvoice?.promotionDiscount?.label}
                                  </span>
                                  <span className="font-medium text-success">-{formatPrice(totals?.promotionDiscount)}</span>
                                </div>
                              )}

                              {totals?.couponDiscount > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-success flex items-center gap-1">
                                    <Icon name="Ticket" size={12} />
                                    {selectedInvoice?.couponDiscount?.code}
                                  </span>
                                  <span className="font-medium text-success">-{formatPrice(totals?.couponDiscount)}</span>
                                </div>
                              )}

                              {totals?.totalDiscount > 0 && (
                                <div className="flex justify-between text-sm border-t border-border pt-2">
                                  <span className="text-muted-foreground">Subtotal con descuentos</span>
                                  <span className="font-medium text-foreground">{formatPrice(totals?.itemsSubtotal - totals?.totalDiscount)}</span>
                                </div>
                              )}

                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  {taxLabel} ({selectedInvoice?.taxRate}%)
                                  {selectedInvoice?.taxIncluded && <span className="text-xs ml-1">(incluido)</span>}
                                </span>
                                <span className="font-medium text-foreground">{formatPrice(totals?.taxAmount)}</span>
                              </div>

                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Icon name="Truck" size={12} />
                                  {shippingLabel}
                                </span>
                                <span className="font-medium text-foreground">
                                  {totals?.shippingCost === 0 ? (
                                    <span className="text-success">GRATIS</span>
                                  ) : formatPrice(totals?.shippingCost)}
                                </span>
                              </div>

                              {totals?.shippingTax > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">{taxLabel} {shippingLabel}</span>
                                  <span className="font-medium text-foreground">{formatPrice(totals?.shippingTax)}</span>
                                </div>
                              )}

                              <div className="border-t border-border pt-3 mt-1">
                                <div className="flex justify-between">
                                  <span className="text-lg font-bold text-foreground">TOTAL</span>
                                  <span className="text-xl font-bold text-primary">{formatPrice(totals?.total)}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 text-right">
                                  {currencySettings?.defaultCurrency || 'MXN'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Tax Breakdown Detail */}
                          <div className="bg-card border border-border rounded-lg p-4 mt-4">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Desglose Fiscal</h4>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Base gravable</span>
                                <span>{formatPrice(totals?.taxableBase - totals?.totalDiscount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">{taxLabel} productos ({selectedInvoice?.taxRate}%)</span>
                                <span>{formatPrice(totals?.taxAmount)}</span>
                              </div>
                              {totals?.shippingTax > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">{taxLabel} {shippingLabel}</span>
                                  <span>{formatPrice(totals?.shippingTax)}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-semibold border-t border-border pt-1.5">
                                <span>Total {taxLabel}</span>
                                <span className="text-primary">{formatPrice(totals?.taxAmount + totals?.shippingTax)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
