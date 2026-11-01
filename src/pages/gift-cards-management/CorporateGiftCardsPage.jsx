import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useCurrency } from '../../contexts/CurrencyContext';
import { supabase } from '../../lib/supabase';

const MOCK_ORDERS = [
  { id: 1, company: 'Grupo Mazatlán', quantity: 50, total: 23750, discount: 5, status: 'paid', date: '2025-02-10' },
  { id: 2, company: 'Corporativo Norteño', quantity: 120, total: 27000, discount: 10, status: 'distributed', date: '2025-01-28' },
  { id: 3, company: 'Empresa Ejemplo SA', quantity: 20, total: 20000, discount: 0, status: 'pending', date: '2025-02-20' },
];

const Section = ({ title, icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 bg-card hover:bg-muted/40 transition-colors">
        <div className="flex items-center gap-3"><Icon name={icon} size={18} className="text-primary" /><span className="font-semibold text-foreground">{title}</span></div>
        <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground" />
      </button>
      {open && <div className="p-5 bg-card border-t border-border space-y-4">{children}</div>}
    </div>
  );
};

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-warning/10 text-warning' },
  paid: { label: 'Pagada', color: 'bg-blue-100 text-blue-600' },
  distributed: { label: 'Distribuida', color: 'bg-success/10 text-success' },
  cancelled: { label: 'Cancelada', color: 'bg-destructive/10 text-destructive' },
};

const CorporateGiftCardsPage = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('config');
  const [saving, setSaving] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const user = { name: 'Admin', email: 'admin@promospot.mx', role: 'owner' };

  const [config, setConfig] = useState({
    isActive: false,
    volumePackages: [
      { minQty: 10, maxQty: 49, discount: 0, name: 'Equipo' },
      { minQty: 50, maxQty: 99, discount: 5, name: 'Empresa' },
      { minQty: 100, maxQty: 499, discount: 10, name: 'Corporativo' },
      { minQty: 500, maxQty: null, discount: null, name: 'Enterprise' },
    ],
    logoPosition: 'top_right', allowCustomMessage: true, useCorporateDesign: false,
    acceptSpei: true, defaultDistribution: 'excel',
  });

  const set = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));

  const updatePackage = (idx, field, val) => {
    const pkgs = [...config?.volumePackages]; pkgs[idx] = { ...pkgs?.[idx], [field]: val }; set('volumePackages', pkgs);
  };
  const addPackage = () => set('volumePackages', [...config?.volumePackages, { minQty: 0, maxQty: null, discount: 0, name: 'Nuevo paquete' }]);
  const removePackage = (idx) => set('volumePackages', config?.volumePackages?.filter((_, i) => i !== idx));

  const calcSaving = (pkg, unitAmt = 500) => {
    if (!pkg?.discount) return null;
    const total = pkg?.minQty * unitAmt;
    const discount = total * (pkg?.discount / 100);
    return { total: total - discount, saving: discount, qty: pkg?.minQty };
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase?.from('gift_card_corporate_config')?.upsert({
        business_id: 'default', is_active: config?.isActive, volume_packages: config?.volumePackages,
        logo_position: config?.logoPosition, allow_custom_message: config?.allowCustomMessage,
        use_corporate_design: config?.useCorporateDesign, accept_spei: config?.acceptSpei,
        default_distribution: config?.defaultDistribution, updated_at: new Date()?.toISOString(),
      }, { onConflict: 'business_id' });
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} userRole={user?.role}
        isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <Header user={user} onMenuClick={() => setIsSidebarOpen(true)} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => navigate('/gift-cards-management')} className="p-2 rounded-lg hover:bg-muted"><Icon name="ArrowLeft" size={20} className="text-muted-foreground" /></button>
                <div><h1 className="text-2xl font-bold text-foreground">Gift Cards Corporativas</h1><p className="text-muted-foreground text-sm">Ventas en volumen para empresas</p></div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate('/gift-cards-management')}>Volver</Button>
                {activeTab === 'config' && <Button onClick={handleSave} loading={saving} iconName="Save" iconPosition="left">Guardar</Button>}
              </div>
            </div>

            <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
              {[{ id: 'config', label: 'Configuración', icon: 'Settings' }, { id: 'orders', label: 'Pedidos Corporativos', icon: 'ShoppingBag' }]?.map(tab => (
                <button key={tab?.id} onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab?.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                  <Icon name={tab?.icon} size={15} />{tab?.label}
                </button>
              ))}
            </div>

            {activeTab === 'config' && (
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Canal corporativo activo</p>
                      <p className="text-sm text-muted-foreground mt-0.5">Genera una landing: <span className="text-primary font-mono text-xs">promospot.mx/negocio/corporativo</span></p>
                    </div>
                    <button type="button" onClick={() => set('isActive', !config?.isActive)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config?.isActive ? 'bg-primary' : 'bg-muted'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config?.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                <Section title="Paquetes por volumen" icon="Package">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-border">
                        {['Cantidad mínima', 'Cantidad máxima', 'Descuento (%)', 'Nombre del paquete', 'Cálculo ejemplo ($500 c/u)', '']?.map(h => (
                          <th key={h} className="text-left pb-2 pr-4 text-xs text-muted-foreground font-medium">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody className="divide-y divide-border">
                        {config?.volumePackages?.map((pkg, idx) => {
                          const calc = calcSaving(pkg);
                          return (
                            <tr key={idx}>
                              <td className="py-2 pr-4"><input type="number" value={pkg?.minQty} onChange={e => updatePackage(idx, 'minQty', Number(e?.target?.value))} className="w-20 rounded border border-input bg-background px-2 py-1 text-sm" /></td>
                              <td className="py-2 pr-4"><input type="number" value={pkg?.maxQty || ''} onChange={e => updatePackage(idx, 'maxQty', e?.target?.value ? Number(e?.target?.value) : null)} placeholder="Sin límite" className="w-24 rounded border border-input bg-background px-2 py-1 text-sm" /></td>
                              <td className="py-2 pr-4">{pkg?.discount === null ? <span className="text-xs text-muted-foreground italic">Personalizado</span> : <input type="number" value={pkg?.discount} onChange={e => updatePackage(idx, 'discount', Number(e?.target?.value))} className="w-16 rounded border border-input bg-background px-2 py-1 text-sm" />}</td>
                              <td className="py-2 pr-4"><input type="text" value={pkg?.name} onChange={e => updatePackage(idx, 'name', e?.target?.value)} className="w-32 rounded border border-input bg-background px-2 py-1 text-sm" /></td>
                              <td className="py-2 pr-4">{calc ? <span className="text-xs text-muted-foreground">{calc?.qty} cards → <span className="text-foreground font-medium">{formatPrice(calc?.total)}</span><span className="text-success ml-1">(ahorro {formatPrice(calc?.saving)})</span></span> : <span className="text-xs text-muted-foreground">Cotización directa</span>}</td>
                              <td className="py-2"><button type="button" onClick={() => removePackage(idx)} className="p-1 text-destructive hover:bg-destructive/10 rounded"><Icon name="Trash2" size={14} /></button></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <button type="button" onClick={addPackage} className="flex items-center gap-2 text-primary text-sm hover:underline"><Icon name="Plus" size={16} /> Agregar paquete</button>
                </Section>

                <Section title="Personalización corporativa" icon="Layers">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Posición del logo corporativo</label>
                      <select value={config?.logoPosition} onChange={e => set('logoPosition', e?.target?.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="top_right">Esquina superior derecha</option>
                        <option value="top_left">Esquina superior izquierda</option>
                        <option value="bottom_right">Esquina inferior derecha</option>
                        <option value="beside_logo">Al lado del logo del negocio</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      {[{ key: 'allowCustomMessage', label: 'Mensaje personalizable de la empresa' }, { key: 'useCorporateDesign', label: 'Diseño específico para corporativos' }]?.map(item => (
                        <div key={item?.key} className="flex items-center justify-between">
                          <p className="text-sm text-foreground">{item?.label}</p>
                          <button type="button" onClick={() => set(item?.key, !config?.[item?.key])}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config?.[item?.key] ? 'bg-primary' : 'bg-muted'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config?.[item?.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-white/20 rounded-lg px-3 py-1.5"><p className="text-white text-xs font-bold">Tu Negocio</p></div>
                      {config?.logoPosition === 'top_right' && <div className="bg-white/20 rounded-lg px-3 py-1.5"><p className="text-white text-xs">Logo Empresa</p></div>}
                    </div>
                    <p className="text-white font-bold text-xl">$500.00 MXN</p>
                    <p className="text-white/70 text-xs mt-1">Gift Card Corporativa</p>
                    {config?.allowCustomMessage && <p className="text-white/60 text-xs mt-2 italic">"Felices fiestas — Tu equipo de RH"</p>}
                  </div>
                </Section>

                <Section title="Facturación y Distribución" icon="FileText">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div><p className="text-sm font-medium text-foreground">Aceptar pago por transferencia SPEI</p><p className="text-xs text-muted-foreground">El pedido se procesa cuando el pago se confirma</p></div>
                      <button type="button" onClick={() => set('acceptSpei', !config?.acceptSpei)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config?.acceptSpei ? 'bg-primary' : 'bg-muted'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config?.acceptSpei ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Método de distribución por defecto</label>
                      <select value={config?.defaultDistribution} onChange={e => set('defaultDistribution', e?.target?.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="excel">Archivo Excel con códigos</option>
                        <option value="email_individual">Envío individual por email</option>
                        <option value="qr_printable">Códigos QR imprimibles</option>
                      </select>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                      <Icon name="Info" size={16} className="text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-amber-700 dark:text-amber-300">Cada pedido corporativo se gestiona desde la bandeja de pedidos corporativos. Las compras corporativas generan una sola factura CFDI por el total del lote.</p>
                    </div>
                  </div>
                </Section>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-4">
                {selectedOrder ? (
                  <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <button type="button" onClick={() => setSelectedOrder(null)} className="p-2 rounded-lg hover:bg-muted"><Icon name="ArrowLeft" size={18} className="text-muted-foreground" /></button>
                      <h2 className="text-lg font-semibold text-foreground">Pedido — {selectedOrder?.company}</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {[{ label: 'Empresa', value: selectedOrder?.company }, { label: 'Cantidad', value: `${selectedOrder?.quantity} gift cards` }, { label: 'Total', value: formatPrice(selectedOrder?.total) }, { label: 'Estado', value: statusConfig?.[selectedOrder?.status]?.label }]?.map(item => (
                        <div key={item?.label} className="bg-muted/30 rounded-lg p-3"><p className="text-xs text-muted-foreground">{item?.label}</p><p className="font-semibold text-foreground mt-0.5">{item?.value}</p></div>
                      ))}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" iconName="CheckCircle" iconPosition="left">Confirmar pago</Button>
                      <Button size="sm" variant="outline" iconName="FileText" iconPosition="left">Generar CFDI</Button>
                      <Button size="sm" variant="outline" iconName="Send" iconPosition="left">Distribuir códigos</Button>
                      <Button size="sm" variant="outline" iconName="X" iconPosition="left" className="text-destructive border-destructive/30">Cancelar pedido</Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-border"><h2 className="text-lg font-semibold text-foreground">Pedidos corporativos</h2></div>
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50"><tr>{['Empresa','Cantidad','Monto total','Descuento','Estado','Fecha','']?.map(h => <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>)}</tr></thead>
                      <tbody className="divide-y divide-border">
                        {MOCK_ORDERS?.map(order => (
                          <tr key={order?.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{order?.company}</td>
                            <td className="px-4 py-3 text-muted-foreground">{order?.quantity}</td>
                            <td className="px-4 py-3 font-medium text-foreground">{formatPrice(order?.total)}</td>
                            <td className="px-4 py-3 text-success">{order?.discount > 0 ? `${order?.discount}%` : '—'}</td>
                            <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig?.[order?.status]?.color}`}>{statusConfig?.[order?.status]?.label}</span></td>
                            <td className="px-4 py-3 text-muted-foreground">{order?.date}</td>
                            <td className="px-4 py-3"><button type="button" onClick={() => setSelectedOrder(order)} className="text-primary text-xs hover:underline">Ver detalle</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CorporateGiftCardsPage;
