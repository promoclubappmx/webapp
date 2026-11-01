import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const BENEFIT_TYPES = [
  { key: 'percentage', label: '% Descuento', icon: 'Percent', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-300', desc: 'Porcentaje de descuento sobre el total' },
  { key: 'fixed', label: 'Monto fijo', icon: 'Banknote', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-300', desc: '$X MXN de descuento directo' },
  { key: 'free_product', label: 'Producto gratis', icon: 'Gift', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-300', desc: 'Desbloquea un producto sin costo' },
  { key: 'bogo', label: '2×1 / 3×2', icon: 'Copy', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-300', desc: 'Aplica en producto indicado' },
  { key: 'upgrade', label: 'Upgrade', icon: 'ArrowUpCircle', color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-300', desc: 'Upgrade gratuito al siguiente tamaño' },
  { key: 'free_shipping', label: 'Envío gratis', icon: 'Truck', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-300', desc: 'Elimina el costo de envío' },
  { key: 'vip_access', label: 'Acceso VIP', icon: 'Crown', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-300', desc: 'Acceso exclusivo a área o beneficio' },
  { key: 'cashback_points', label: 'Cashback puntos', icon: 'Zap', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-300', desc: 'Puntos extra acumulados por esta compra' },
  { key: 'bundle', label: 'Bundle / Combo', icon: 'Package', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-300', desc: 'Descuento al comprar productos juntos' },
  { key: 'quantity_discount', label: 'Desc. por cantidad', icon: 'Layers', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-300', desc: 'Compra N unidades y la N+1 es gratis o con descuento' },
  { key: 'fixed_price', label: 'Precio especial fijo', icon: 'Tag', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-300', desc: 'Define directamente el precio especial del producto' },
];

const ACCENT_COLORS = [
  '#2563EB', '#059669', '#7C3AED', '#D97706', '#0891B2',
  '#DC2626', '#EA580C', '#65A30D', '#0D9488', '#DB2777',
  '#6366F1', '#CA8A04',
];

const TEMPLATE_IMAGES = [
  { key: 'food', label: 'Comida', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=225&fit=crop' },
  { key: 'drink', label: 'Bebida', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=225&fit=crop' },
  { key: 'beauty', label: 'Belleza', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=225&fit=crop' },
  { key: 'fitness', label: 'Fitness', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=225&fit=crop' },
  { key: 'retail', label: 'Retail', url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=225&fit=crop' },
  { key: 'generic', label: 'Genérico', url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=225&fit=crop' },
  { key: 'festive', label: 'Festivo', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&h=225&fit=crop' },
  { key: 'xmas', label: 'Navidad', url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400&h=225&fit=crop' },
];

const DAYS_OF_WEEK = [
  { key: 'mon', label: 'Lun' }, { key: 'tue', label: 'Mar' }, { key: 'wed', label: 'Mié' },
  { key: 'thu', label: 'Jue' }, { key: 'fri', label: 'Vie' }, { key: 'sat', label: 'Sáb' }, { key: 'sun', label: 'Dom' },
];

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars?.[Math.floor(Math.random() * chars?.length)])?.join('');
};

const getBenefitLabel = (form) => {
  if (form?.benefitType === 'percentage') return form?.percentValue ? `${form?.percentValue}% OFF` : '% OFF';
  if (form?.benefitType === 'fixed') return form?.fixedAmount ? `$${form?.fixedAmount} OFF` : '$X OFF';
  if (form?.benefitType === 'free_product') return form?.productName || 'Producto Gratis';
  if (form?.benefitType === 'bogo') return '2×1';
  if (form?.benefitType === 'upgrade') return form?.upgradeDesc || 'Upgrade Gratis';
  if (form?.benefitType === 'free_shipping') return 'Envío Gratis';
  if (form?.benefitType === 'vip_access') return form?.vipDesc || 'Acceso VIP';
  if (form?.benefitType === 'cashback_points') return form?.cashbackPoints ? `+${form?.cashbackPoints}x Puntos` : 'Puntos Extra';
  if (form?.benefitType === 'bundle') return form?.bundleDesc || 'Bundle Combo';
  if (form?.benefitType === 'quantity_discount') return form?.qtyBuy ? `${form?.qtyBuy}+1 Gratis` : 'Desc. Cantidad';
  if (form?.benefitType === 'fixed_price') return form?.fixedPrice ? `$${form?.fixedPrice} MXN` : 'Precio Especial';
  return 'Beneficio';
};

const Toggle = ({ value, onChange, color = 'bg-primary' }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? color : 'bg-muted'}`}
  >
    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const SectionHeader = ({ num, title, expanded = false, onToggle = () => {}, collapsible = false }) => (
  <button
    className={`w-full flex items-center justify-between ${collapsible ? 'cursor-pointer' : 'cursor-default'}`}
    onClick={collapsible ? onToggle : undefined}
  >
    <h3 className="font-semibold text-foreground flex items-center gap-2">
      <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">{num}</span>
      {title}
    </h3>
    {collapsible && <Icon name={expanded ? 'ChevronUp' : 'ChevronDown'} size={18} className="text-muted-foreground" />}
  </button>
);

const NuevoCuponPromocionForm = ({ coupon, onSave, onCancel }) => {
  const [form, setForm] = useState({
    // Benefit
    benefitType: coupon?.benefitType || 'percentage',
    percentValue: coupon?.benefitValue || 20,
    maxDiscount: '',
    fixedAmount: '',
    productName: '',
    bogoDesc: '',
    upgradeDesc: '',
    vipDesc: '',
    // New benefit types
    cashbackPoints: 3,
    cashbackDesc: '',
    bundleProductA: '',
    bundleProductB: '',
    bundleDiscount: 25,
    bundleDesc: '',
    qtyBuy: 3,
    qtyGetFree: 1,
    qtyGetDiscount: '',
    fixedPrice: '',
    fixedPriceProduct: '',
    fixedPriceNormal: '',
    // Identity
    title: coupon?.title || '',
    description: coupon?.description || '',
    selectedImage: coupon?.image || TEMPLATE_IMAGES?.[0]?.url,
    accentColor: coupon?.accentColor || ACCENT_COLORS?.[0],
    // Code
    codeMode: 'auto',
    customCode: '',
    autoCode: generateCode(),
    batchPrefix: 'PROMO-',
    batchQty: 100,
    batchSingleUse: true,
    batchExportFormat: 'excel',
    // Rules & Conditions
    rulesExpanded: false,
    validFrom: '',
    validUntil: '',
    // Validity from emission (alternative to fixed dates)
    useEmissionValidity: false,
    emissionValidDays: 7,
    // Usage limits
    usagePerUser: '1',
    totalLimit: '',
    maxBudget: '',
    // Min purchase
    requireMinPurchase: false,
    minPurchase: '',
    // Schedule
    useSchedule: false,
    scheduleDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    scheduleFrom: '14:00',
    scheduleTo: '17:00',
    // Audience
    audience: 'all',
    vipLevel: '',
    crmSegment: '',
    // Exclusivity
    isPersonal: false,
    // Combinability
    combineWithPromos: true,
    combineWithCoupons: false,
    // Excluded products
    excludedProducts: '',
    // Valid establishments
    validEstablishments: 'all',
    validEstablishmentsList: '',
    // Customer segment type
    customerSegmentType: 'all',
    customSegmentDesc: '',
    // Terms and conditions
    termsAndConditions: '',
    termsCustomText: '',
    // Distribution channel
    distributionChannel: 'public',
    crmSegmentDist: '',
    // Notifications
    expiryNotifications: false,
    notifyDays: [7, 3, 1],
    notifyText: '¡Tu cupón de {nombre_negocio} vence en {X} días! Úsalo antes de que expire.',
    // Recovery auto-trigger
    isRecoveryTrigger: false,
    recoveryInactivityDays: 21,
    status: coupon?.status || 'active',
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const generateTermsSummary = (f) => {
    const lines = [];
    // Validity
    if (f?.useEmissionValidity) {
      lines?.push(`• Válido por ${f?.emissionValidDays} días desde la fecha de emisión.`);
    } else if (f?.validFrom && f?.validUntil) {
      lines?.push(`• Válido del ${new Date(f.validFrom)?.toLocaleDateString('es-MX')} al ${new Date(f.validUntil)?.toLocaleDateString('es-MX')}.`);
    }
    // Coupons per user
    lines?.push(`• Cada usuario tiene derecho a ${f?.usagePerUser === 'unlimited' ? 'usos ilimitados' : `${f?.usagePerUser} uso(s)`} de este cupón.`);
    // Min purchase
    if (f?.requireMinPurchase && f?.minPurchase) {
      lines?.push(`• Aplica en compras mínimas de $${f?.minPurchase} MXN.`);
    }
    // Establishments
    if (f?.validEstablishments === 'specific' && f?.validEstablishmentsList) {
      lines?.push(`• Válido únicamente en: ${f?.validEstablishmentsList}.`);
    } else if (f?.validEstablishments === 'all') {
      lines?.push(`• Válido en todos los establecimientos participantes.`);
    }
    // Customer segment
    if (f?.customerSegmentType === 'new') {
      lines?.push(`• Exclusivo para clientes nuevos.`);
    } else if (f?.customerSegmentType === 'vip') {
      lines?.push(`• Dirigido a clientes con nivel VIP.`);
    } else if (f?.customerSegmentType === 'custom' && f?.customSegmentDesc) {
      lines?.push(`• Dirigido a: ${f?.customSegmentDesc}.`);
    }
    // Transferable
    lines?.push(f?.isPersonal
      ? `• Cupón personal e intransferible. Solo válido para el usuario asignado.`
      : `• Cupón transferible. Puede compartirse con otras personas.`);
    // Combinability
    lines?.push(f?.combineWithPromos
      ? `• Aplica en combinación con otras promociones vigentes.`
      : `• No aplica en combinación con otras promociones.`);
    if (!f?.combineWithCoupons) {
      lines?.push(`• No acumulable con otros cupones en la misma compra.`);
    }
    // Excluded products
    if (f?.excludedProducts) {
      lines?.push(`• No aplica en: ${f?.excludedProducts}.`);
    }
    // Schedule
    if (f?.useSchedule && f?.scheduleDays?.length > 0) {
      const dayNames = f?.scheduleDays?.map(d => DAYS_OF_WEEK?.find(x => x?.key === d)?.label)?.join(', ');
      lines?.push(`• Válido únicamente los días: ${dayNames}, de ${f?.scheduleFrom} a ${f?.scheduleTo} hrs.`);
    }
    lines?.push(`• El negocio se reserva el derecho de modificar o cancelar esta promoción en cualquier momento.`);
    return lines?.join('\n');
  };

  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      scheduleDays: prev?.scheduleDays?.includes(day)
        ? prev?.scheduleDays?.filter(d => d !== day)
        : [...prev?.scheduleDays, day],
    }));
  };

  const toggleNotifyDay = (day) => {
    setForm(prev => ({
      ...prev,
      notifyDays: prev?.notifyDays?.includes(day)
        ? prev?.notifyDays?.filter(d => d !== day)
        : [...prev?.notifyDays, day],
    }));
  };

  const selectedBenefit = BENEFIT_TYPES?.find(b => b?.key === form?.benefitType);
  const displayCode = form?.codeMode === 'custom' ? (form?.customCode || '--------')
    : form?.codeMode === 'auto' ? form?.autoCode
    : `${form?.batchPrefix}XXXXXX`;

  const handleSubmit = (publish) => {
    const data = {
      title: form?.title || 'Nuevo cupón',
      description: form?.description,
      benefitType: form?.benefitType,
      benefitValue: form?.benefitType === 'percentage' ? form?.percentValue : form?.fixedAmount,
      code: form?.codeMode === 'custom' ? form?.customCode : form?.autoCode,
      image: form?.selectedImage,
      accentColor: form?.accentColor,
      validFrom: form?.validFrom,
      validUntil: form?.validUntil,
      status: publish ? 'active' : 'draft',
      type: 'promotion',
    };
    onSave(data);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
      {/* LEFT: Form */}
      <div className="flex-1 space-y-5 overflow-y-auto">
        {/* Back */}
        <button onClick={onCancel} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Icon name="ArrowLeft" size={16} />
          Volver a Mis Cupones
        </button>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Ticket" size={16} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">{coupon ? 'Editar cupón de promoción' : 'Nuevo cupón de promoción'}</h2>
          </div>
          <p className="text-sm text-muted-foreground">Configura el beneficio, reglas y distribución del cupón</p>
        </div>

        {/* ── SECTION 1: Tipo de beneficio ── */}
        <div className="bg-card border border-border rounded-xl p-5">
          <SectionHeader num="1" title="Tipo de beneficio" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-4 mb-4">
            {BENEFIT_TYPES?.map(bt => (
              <button
                key={bt?.key}
                onClick={() => set('benefitType', bt?.key)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  form?.benefitType === bt?.key
                    ? `${bt?.bg} ${bt?.border} shadow-sm`
                    : 'border-border bg-card hover:border-muted-foreground/30'
                }`}
              >
                <Icon name={bt?.icon} size={18} className={`mb-1 ${form?.benefitType === bt?.key ? bt?.color : 'text-muted-foreground'}`} />
                <div className={`text-xs font-medium leading-tight ${form?.benefitType === bt?.key ? bt?.color : 'text-foreground'}`}>{bt?.label}</div>
              </button>
            ))}
          </div>

          {/* Benefit-specific fields */}
          {form?.benefitType === 'percentage' && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Porcentaje de descuento: <span className="text-primary font-bold">{form?.percentValue}%</span></label>
                <input type="range" min={5} max={90} value={form?.percentValue} onChange={e => set('percentValue', Number(e?.target?.value))} className="w-full accent-primary" />
                <div className="flex justify-between text-xs text-muted-foreground"><span>5%</span><span>90%</span></div>
              </div>
              <Input label="Tope máximo de descuento (MXN, opcional)" type="number" placeholder="Ej: 200" value={form?.maxDiscount} onChange={e => set('maxDiscount', e?.target?.value)} />
            </div>
          )}
          {form?.benefitType === 'fixed' && (
            <Input label="Monto de descuento (MXN)" type="number" placeholder="Ej: 50" value={form?.fixedAmount} onChange={e => set('fixedAmount', e?.target?.value)} />
          )}
          {form?.benefitType === 'free_product' && (
            <Input label="Nombre del producto gratis" placeholder="Ej: Café americano, Postre de la casa" value={form?.productName} onChange={e => set('productName', e?.target?.value)} />
          )}
          {form?.benefitType === 'bogo' && (
            <Input label="Descripción (ej: 2×1 en smoothies)" placeholder="Ej: 2×1 en cualquier café" value={form?.bogoDesc} onChange={e => set('bogoDesc', e?.target?.value)} />
          )}
          {form?.benefitType === 'upgrade' && (
            <Input label="Descripción del upgrade" placeholder="Ej: Pide mediano y recíbelo grande" value={form?.upgradeDesc} onChange={e => set('upgradeDesc', e?.target?.value)} />
          )}
          {form?.benefitType === 'vip_access' && (
            <Input label="Descripción del acceso VIP" placeholder="Ej: Acceso a zona VIP, Reservación prioritaria" value={form?.vipDesc} onChange={e => set('vipDesc', e?.target?.value)} />
          )}

          {/* NEW: Cashback en puntos */}
          {form?.benefitType === 'cashback_points' && (
            <div className="space-y-3">
              <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 text-xs text-violet-800">
                <Icon name="Zap" size={12} className="inline mr-1" />
                <strong>Acumulación acelerada:</strong> El cliente gana puntos extra además de los normales. No es descuento inmediato — es un cupón con fecha de vigencia que multiplica la ganancia de puntos.
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Multiplicador de puntos: <span className="text-violet-600 font-bold">{form?.cashbackPoints}x</span></label>
                <input type="range" min={2} max={10} value={form?.cashbackPoints} onChange={e => set('cashbackPoints', Number(e?.target?.value))} className="w-full accent-violet-500" />
                <div className="flex justify-between text-xs text-muted-foreground"><span>2x</span><span>10x</span></div>
              </div>
              <div className="bg-violet-50 border border-violet-200 rounded-lg px-3 py-2 text-sm text-violet-800 font-medium">
                "Por esta compra recibes <strong>{form?.cashbackPoints}x</strong> puntos extra además de los normales."
              </div>
              <Input label="Descripción adicional (opcional)" placeholder="Ej: Usa este cupón y gana el triple de puntos esta semana" value={form?.cashbackDesc} onChange={e => set('cashbackDesc', e?.target?.value)} />
            </div>
          )}

          {/* NEW: Bundle / Combo forzado */}
          {form?.benefitType === 'bundle' && (
            <div className="space-y-3">
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800">
                <Icon name="Package" size={12} className="inline mr-1" />
                <strong>Combo forzado:</strong> El descuento solo aplica si el cliente lleva los dos productos juntos. Ej: "Café + pastel = 25% OFF en ambos."
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Producto A" placeholder="Ej: Café americano" value={form?.bundleProductA} onChange={e => set('bundleProductA', e?.target?.value)} />
                <Input label="Producto B" placeholder="Ej: Pastel de chocolate" value={form?.bundleProductB} onChange={e => set('bundleProductB', e?.target?.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Descuento del combo: <span className="text-rose-600 font-bold">{form?.bundleDiscount}%</span></label>
                <input type="range" min={5} max={60} value={form?.bundleDiscount} onChange={e => set('bundleDiscount', Number(e?.target?.value))} className="w-full accent-rose-500" />
                <div className="flex justify-between text-xs text-muted-foreground"><span>5%</span><span>60%</span></div>
              </div>
              {form?.bundleProductA && form?.bundleProductB && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-sm text-rose-800 font-medium">
                  "{form?.bundleProductA} + {form?.bundleProductB} = {form?.bundleDiscount}% OFF en ambos"
                </div>
              )}
            </div>
          )}

          {/* NEW: Descuento por cantidad */}
          {form?.benefitType === 'quantity_discount' && (
            <div className="space-y-3">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-xs text-indigo-800">
                <Icon name="Layers" size={12} className="inline mr-1" />
                <strong>Cantidad variable:</strong> Diferente al 2×1 — aplica a cantidades configurables. Ej: "Compra 3 smoothies, el cuarto es gratis."
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Compra <span className="text-indigo-600 font-bold">{form?.qtyBuy}</span> unidades</label>
                  <input type="range" min={2} max={20} value={form?.qtyBuy} onChange={e => set('qtyBuy', Number(e?.target?.value))} className="w-full accent-indigo-500" />
                  <div className="flex justify-between text-xs text-muted-foreground"><span>2</span><span>20</span></div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Y la siguiente <span className="text-indigo-600 font-bold">{form?.qtyGetFree}</span> es gratis</label>
                  <input type="range" min={1} max={5} value={form?.qtyGetFree} onChange={e => set('qtyGetFree', Number(e?.target?.value))} className="w-full accent-indigo-500" />
                  <div className="flex justify-between text-xs text-muted-foreground"><span>1</span><span>5</span></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">O aplicar descuento de</span>
                <input type="number" min={0} max={100} placeholder="50" value={form?.qtyGetDiscount} onChange={e => set('qtyGetDiscount', e?.target?.value)} className="w-20 px-2 py-1 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30" />
                <span className="text-sm text-muted-foreground">% en lugar de gratis</span>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 text-sm text-indigo-800 font-medium">
                "Compra {form?.qtyBuy} unidades y la {form?.qtyBuy + 1}ª es {form?.qtyGetDiscount ? `${form?.qtyGetDiscount}% OFF` : 'gratis'}"
              </div>
            </div>
          )}

          {/* NEW: Precio especial fijo */}
          {form?.benefitType === 'fixed_price' && (
            <div className="space-y-3">
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-xs text-teal-800">
                <Icon name="Tag" size={12} className="inline mr-1" />
                <strong>Precio directo:</strong> El negocio define el precio especial sin calcular porcentajes. Más simple para comunicar al cliente y al cajero.
              </div>
              <Input label="Nombre del producto" placeholder="Ej: Latte grande" value={form?.fixedPriceProduct} onChange={e => set('fixedPriceProduct', e?.target?.value)} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">Precio especial (MXN)</label>
                  <div className="flex items-center">
                    <span className="px-3 py-2 bg-muted border border-r-0 border-border rounded-l-lg text-sm font-medium text-muted-foreground">$</span>
                    <input type="number" min={0} step={0.01} value={form?.fixedPrice} onChange={e => set('fixedPrice', e?.target?.value)} placeholder="45.00" className="flex-1 px-3 py-2 border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30 rounded-r-lg" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">Precio normal (MXN, opcional)</label>
                  <div className="flex items-center">
                    <span className="px-3 py-2 bg-muted border border-r-0 border-border rounded-l-lg text-sm font-medium text-muted-foreground">$</span>
                    <input type="number" min={0} step={0.01} value={form?.fixedPriceNormal} onChange={e => set('fixedPriceNormal', e?.target?.value)} placeholder="75.00" className="flex-1 px-3 py-2 border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30 rounded-r-lg" />
                  </div>
                </div>
              </div>
              {form?.fixedPriceProduct && form?.fixedPrice && (
                <div className="bg-teal-50 border border-teal-200 rounded-lg px-3 py-2 text-sm text-teal-800 font-medium">
                  "{form?.fixedPriceProduct} por <strong>${form?.fixedPrice} MXN</strong>{form?.fixedPriceNormal ? ` (precio normal $${form?.fixedPriceNormal})` : ''}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── SECTION 2: Identidad visual ── */}
        <div className="bg-card border border-border rounded-xl p-5">
          <SectionHeader num="2" title="Identidad visual" />
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Título del cupón <span className="text-muted-foreground text-xs">({form?.title?.length}/40)</span></label>
              <input type="text" maxLength={40} value={form?.title} onChange={e => set('title', e?.target?.value)} placeholder="Ej: 20% en tu próxima visita" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Descripción <span className="text-muted-foreground text-xs">({form?.description?.length}/120)</span></label>
              <textarea maxLength={120} value={form?.description} onChange={e => set('description', e?.target?.value)} placeholder="Describe el beneficio brevemente" rows={2} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Imagen del cupón</label>
              <div className="grid grid-cols-4 gap-2">
                {TEMPLATE_IMAGES?.map(img => (
                  <button key={img?.key} onClick={() => set('selectedImage', img?.url)} className={`relative rounded-lg overflow-hidden h-14 border-2 transition-all ${form?.selectedImage === img?.url ? 'border-primary shadow-md' : 'border-transparent hover:border-muted-foreground/40'}`}>
                    <img src={img?.url} alt={`Template ${img?.label}`} className="w-full h-full object-cover" />
                    {form?.selectedImage === img?.url && <div className="absolute inset-0 bg-primary/20 flex items-center justify-center"><Icon name="Check" size={14} className="text-white" /></div>}
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs text-center py-0.5">{img?.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Color de acento</label>
              <div className="flex gap-2 flex-wrap">
                {ACCENT_COLORS?.map(color => (
                  <button key={color} onClick={() => set('accentColor', color)} className={`w-7 h-7 rounded-full border-2 transition-all ${form?.accentColor === color ? 'border-foreground scale-110 shadow-md' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: color }} title={color} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 3: Código del cupón ── */}
        <div className="bg-card border border-border rounded-xl p-5">
          <SectionHeader num="3" title="Código del cupón" />
          <div className="space-y-3 mt-4">
            {[
              { key: 'custom', label: 'Código personalizado', desc: 'Tú eliges el código (ej: VERANO25)' },
              { key: 'auto', label: 'Código automático', desc: 'El sistema genera un código único' },
              { key: 'batch', label: 'Lote de cupones', desc: 'Genera N cupones únicos simultáneamente' },
            ]?.map(opt => (
              <label key={opt?.key} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${form?.codeMode === opt?.key ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'}`}>
                <input type="radio" name="codeMode" value={opt?.key} checked={form?.codeMode === opt?.key} onChange={() => set('codeMode', opt?.key)} className="mt-0.5 accent-primary" />
                <div>
                  <div className="text-sm font-medium text-foreground">{opt?.label}</div>
                  <div className="text-xs text-muted-foreground">{opt?.desc}</div>
                </div>
              </label>
            ))}
            {form?.codeMode === 'custom' && (
              <Input label="Código personalizado (4-20 caracteres)" value={form?.customCode} onChange={e => set('customCode', e?.target?.value?.toUpperCase()?.replace(/[OI01L]/g, ''))} placeholder="Ej: VERANO25" maxLength={20} />
            )}
            {form?.codeMode === 'auto' && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <span className="font-mono text-lg font-bold text-foreground tracking-widest">{form?.autoCode}</span>
                <Button variant="ghost" size="sm" onClick={() => set('autoCode', generateCode())} iconName="RefreshCw" iconPosition="left">Regenerar</Button>
              </div>
            )}
            {form?.codeMode === 'batch' && (
              <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Prefijo" value={form?.batchPrefix} onChange={e => set('batchPrefix', e?.target?.value?.toUpperCase())} placeholder="PROMO-" />
                  <Input label="Cantidad (10-10,000)" type="number" min={10} max={10000} value={form?.batchQty} onChange={e => set('batchQty', Number(e?.target?.value))} />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form?.batchSingleUse} onChange={e => set('batchSingleUse', e?.target?.checked)} className="accent-primary" />
                  <span className="text-sm text-foreground">Uso único por cupón (recomendado)</span>
                </label>
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">Formato de exportación del lote</label>
                  <div className="flex gap-2">
                    {[{ key: 'excel', label: 'Excel (.xlsx)' }, { key: 'csv', label: 'CSV' }, { key: 'qr_pdf', label: 'QR individuales (PDF)' }]?.map(fmt => (
                      <label key={fmt?.key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer text-xs transition-all ${form?.batchExportFormat === fmt?.key ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-muted-foreground/40'}`}>
                        <input type="radio" name="batchExport" value={fmt?.key} checked={form?.batchExportFormat === fmt?.key} onChange={() => set('batchExportFormat', fmt?.key)} className="accent-primary" />
                        {fmt?.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="bg-primary/10 text-primary text-sm px-3 py-2 rounded-lg font-medium">
                  Se generarán <strong>{form?.batchQty}</strong> cupones únicos
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── SECTION 4: Reglas y condiciones ── */}
        <div className="bg-card border border-border rounded-xl p-5">
          <SectionHeader num="4" title="Reglas y condiciones" collapsible expanded={form?.rulesExpanded} onToggle={() => set('rulesExpanded', !form?.rulesExpanded)} />

          {/* Always visible: dates */}
          <div className="mt-4 space-y-4">
            {/* Validity type toggle */}
            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Vigencia desde emisión</p>
                <p className="text-xs text-muted-foreground">Cada usuario tiene su propio countdown desde que recibe el cupón</p>
              </div>
              <Toggle value={form?.useEmissionValidity} onChange={v => set('useEmissionValidity', v)} />
            </div>

            {form?.useEmissionValidity ? (
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Días de validez desde emisión</label>
                <div className="flex items-center gap-2">
                  <input type="number" min={1} max={365} value={form?.emissionValidDays} onChange={e => set('emissionValidDays', Number(e?.target?.value))} className="w-24 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <span className="text-sm text-muted-foreground">días desde que se asigna al usuario</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Ideal para cupones de flows y automatizaciones donde cada usuario lo recibe en momentos distintos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">Válido desde</label>
                  <input type="date" value={form?.validFrom} onChange={e => set('validFrom', e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">Válido hasta</label>
                  <input type="date" value={form?.validUntil} onChange={e => set('validUntil', e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
            )}

            {/* ── ALWAYS VISIBLE: Cupones por usuario ── */}
            <div className="border border-border rounded-xl p-4">
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Icon name="Hash" size={15} className="text-primary" />
                Cantidad de cupones por usuario
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { value: '1', label: '1 uso' },
                  { value: '2', label: '2 usos' },
                  { value: '3', label: '3 usos' },
                  { value: '5', label: '5 usos' },
                  { value: 'unlimited', label: 'Ilimitado' },
                ]?.map(opt => (
                  <label key={opt?.value} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${form?.usagePerUser === opt?.value ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground hover:border-muted-foreground/40'}`}>
                    <input type="radio" name="usagePerUser" value={opt?.value} checked={form?.usagePerUser === opt?.value} onChange={() => set('usagePerUser', opt?.value)} className="accent-primary" />
                    <span className="text-sm font-medium">{opt?.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Define cuántas veces puede canjear este cupón cada usuario individual.</p>
            </div>

            {/* ── ALWAYS VISIBLE: Establecimientos donde es válido ── */}
            <div className="border border-border rounded-xl p-4">
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Icon name="MapPin" size={15} className="text-primary" />
                Establecimientos donde es válido
              </p>
              <div className="space-y-2">
                {[
                  { key: 'all', label: 'Todos los establecimientos', desc: 'Válido en cualquier sucursal del negocio' },
                  { key: 'specific', label: 'Establecimientos específicos', desc: 'Solo aplica en las sucursales que indiques' },
                ]?.map(opt => (
                  <label key={opt?.key} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${form?.validEstablishments === opt?.key ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'}`}>
                    <input type="radio" name="validEstablishments" value={opt?.key} checked={form?.validEstablishments === opt?.key} onChange={() => set('validEstablishments', opt?.key)} className="mt-0.5 accent-primary" />
                    <div>
                      <div className="text-sm font-medium text-foreground">{opt?.label}</div>
                      <div className="text-xs text-muted-foreground">{opt?.desc}</div>
                    </div>
                  </label>
                ))}
                {form?.validEstablishments === 'specific' && (
                  <div className="mt-2">
                    <textarea
                      value={form?.validEstablishmentsList}
                      onChange={e => set('validEstablishmentsList', e?.target?.value)}
                      placeholder="Ej: Sucursal Centro, Sucursal Norte, Plaza Satélite"
                      rows={2}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Separa los establecimientos con comas.</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── ALWAYS VISIBLE: Segmento / Tipo de clientes ── */}
            <div className="border border-border rounded-xl p-4">
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Icon name="Users" size={15} className="text-primary" />
                Segmento / Tipo de clientes al que va dirigido
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'all', label: 'Todos los clientes', icon: 'Users' },
                  { key: 'new', label: 'Clientes nuevos', icon: 'UserPlus' },
                  { key: 'vip', label: 'Clientes VIP', icon: 'Crown' },
                  { key: 'custom', label: 'Segmento personalizado', icon: 'Filter' },
                ]?.map(opt => (
                  <label key={opt?.key} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${form?.customerSegmentType === opt?.key ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'}`}>
                    <input type="radio" name="customerSegmentType" value={opt?.key} checked={form?.customerSegmentType === opt?.key} onChange={() => set('customerSegmentType', opt?.key)} className="accent-primary" />
                    <Icon name={opt?.icon} size={14} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{opt?.label}</span>
                  </label>
                ))}
              </div>
              {form?.customerSegmentType === 'custom' && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={form?.customSegmentDesc}
                    onChange={e => set('customSegmentDesc', e?.target?.value)}
                    placeholder="Ej: Clientes frecuentes, Clientes con más de 5 visitas, Segmento CRM específico"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              )}
            </div>

            {/* ── ALWAYS VISIBLE: Transferible / Intransferible ── */}
            <div className="border border-border rounded-xl p-4">
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Icon name="ArrowLeftRight" size={15} className="text-primary" />
                Transferibilidad del cupón
              </p>
              <div className="grid grid-cols-2 gap-2">
                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${!form?.isPersonal ? 'border-green-400 bg-green-50' : 'border-border hover:border-muted-foreground/40'}`}>
                  <input type="radio" name="transferability" checked={!form?.isPersonal} onChange={() => set('isPersonal', false)} className="mt-0.5 accent-primary" />
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Icon name="Unlock" size={13} className="text-green-600" />
                      <span className="text-sm font-medium text-foreground">Transferible</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Puede compartirse con otras personas. Código público.</p>
                  </div>
                </label>
                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${form?.isPersonal ? 'border-amber-400 bg-amber-50' : 'border-border hover:border-muted-foreground/40'}`}>
                  <input type="radio" name="transferability" checked={form?.isPersonal} onChange={() => set('isPersonal', true)} className="mt-0.5 accent-primary" />
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Icon name="Lock" size={13} className="text-amber-600" />
                      <span className="text-sm font-medium text-foreground">Intransferible</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Solo válido para el usuario asignado. El QR verifica identidad.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* ── ALWAYS VISIBLE: Aplica con otras promociones ── */}
            <div className="border border-border rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Icon name="Layers" size={15} className="text-primary" />
                ¿Aplica con otras promociones?
              </p>
              <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Combinable con promociones activas</p>
                  <p className="text-xs text-muted-foreground">¿Se puede usar junto con otras promos del negocio?</p>
                </div>
                <Toggle value={form?.combineWithPromos} onChange={v => set('combineWithPromos', v)} />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Combinable con otros cupones</p>
                  <p className="text-xs text-muted-foreground">¿El cliente puede usar dos cupones en la misma compra?</p>
                </div>
                <Toggle value={form?.combineWithCoupons} onChange={v => set('combineWithCoupons', v)} />
              </div>
              {!form?.combineWithPromos && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800 flex items-start gap-1.5">
                  <Icon name="AlertTriangle" size={12} className="mt-0.5 flex-shrink-0" />
                  Este cupón no se podrá usar junto con otras promociones activas del negocio.
                </div>
              )}
            </div>
          </div>

          {form?.rulesExpanded && (
            <div className="mt-4 space-y-5 border-t border-border pt-4">

              {/* Usage limits */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Límites de uso globales</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Límite total de canjes</label>
                    <input type="number" placeholder="Vacío = ilimitado" value={form?.totalLimit} onChange={e => set('totalLimit', e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Presupuesto máx. (MXN)</label>
                    <input type="number" placeholder="Vacío = sin límite" value={form?.maxBudget} onChange={e => set('maxBudget', e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
                {form?.totalLimit && <p className="text-xs text-muted-foreground mt-1">El cupón se desactiva automáticamente después de {form?.totalLimit} canjes totales.</p>}
                {form?.maxBudget && <p className="text-xs text-muted-foreground mt-1">El cupón se desactiva cuando los descuentos acumulados sumen ${form?.maxBudget} MXN.</p>}
              </div>

              {/* Min purchase */}
              <div className="border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Monto mínimo de compra</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Solo aplica en compras de $X MXN o más</p>
                  </div>
                  <Toggle value={form?.requireMinPurchase} onChange={v => set('requireMinPurchase', v)} />
                </div>
                {form?.requireMinPurchase && (
                  <div className="flex items-center gap-0">
                    <span className="px-3 py-2 bg-muted border border-r-0 border-border rounded-l-lg text-sm font-medium text-muted-foreground">$</span>
                    <input type="number" min={0} step={0.01} value={form?.minPurchase} onChange={e => set('minPurchase', e?.target?.value)} placeholder="0.00" className="flex-1 px-3 py-2 border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <span className="px-3 py-2 bg-muted border border-l-0 border-border rounded-r-lg text-sm font-medium text-muted-foreground">MXN</span>
                  </div>
                )}
              </div>

              {/* Schedule */}
              <div className="border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Horario y día de validez</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Solo canjeble en días y horas específicas</p>
                  </div>
                  <Toggle value={form?.useSchedule} onChange={v => set('useSchedule', v)} />
                </div>
                {form?.useSchedule && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-foreground block mb-2">Días de la semana</label>
                      <div className="flex gap-1.5 flex-wrap">
                        {DAYS_OF_WEEK?.map(d => (
                          <button key={d?.key} onClick={() => toggleDay(d?.key)} className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${form?.scheduleDays?.includes(d?.key) ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-muted-foreground/40'}`}>
                            {d?.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-foreground block mb-1">Hora inicio</label>
                        <input type="time" value={form?.scheduleFrom} onChange={e => set('scheduleFrom', e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground block mb-1">Hora fin</label>
                        <input type="time" value={form?.scheduleTo} onChange={e => set('scheduleTo', e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-800">
                      Solo canjeble {form?.scheduleDays?.map(d => DAYS_OF_WEEK?.find(x => x?.key === d)?.label)?.join(', ')} de {form?.scheduleFrom} a {form?.scheduleTo}
                    </div>
                  </div>
                )}
              </div>

              {/* Audience */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Audiencia elegible (CRM avanzado)</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'all', label: 'Todos los clientes', icon: 'Users' },
                    { key: 'new', label: 'Solo nuevos clientes', icon: 'UserPlus' },
                    { key: 'vip', label: 'Nivel VIP específico', icon: 'Crown' },
                    { key: 'segment', label: 'Segmento CRM', icon: 'Filter' },
                  ]?.map(opt => (
                    <label key={opt?.key} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${form?.audience === opt?.key ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'}`}>
                      <input type="radio" name="audience" value={opt?.key} checked={form?.audience === opt?.key} onChange={() => set('audience', opt?.key)} className="accent-primary" />
                      <Icon name={opt?.icon} size={14} className="text-muted-foreground" />
                      <span className="text-sm text-foreground">{opt?.label}</span>
                    </label>
                  ))}
                </div>
                {form?.audience === 'vip' && (
                  <div className="mt-2">
                    <select value={form?.vipLevel} onChange={e => set('vipLevel', e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none">
                      <option value="">Seleccionar nivel VIP</option>
                      <option value="bronze">Bronce</option>
                      <option value="silver">Plata</option>
                      <option value="gold">Oro</option>
                      <option value="platinum">Platino</option>
                    </select>
                  </div>
                )}
                {form?.audience === 'segment' && (
                  <Input className="mt-2" label="" placeholder="Nombre del segmento CRM" value={form?.crmSegment} onChange={e => set('crmSegment', e?.target?.value)} />
                )}
              </div>

              {/* Excluded products */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Productos o categorías excluidas</label>
                <textarea value={form?.excludedProducts} onChange={e => set('excludedProducts', e?.target?.value)} placeholder="Ej: Bebidas alcohólicas, Productos ya en oferta, Café especial de temporada" rows={2} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                <p className="text-xs text-muted-foreground mt-1">Separa con comas. El cupón no aplicará en estos productos/categorías.</p>
              </div>

              {/* Summary */}
              {(form?.validFrom || form?.validUntil || form?.useEmissionValidity || form?.minPurchase || form?.totalLimit || form?.maxBudget) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  <Icon name="FileText" size={14} className="inline mr-1" />
                  <strong>Resumen: </strong>
                  {form?.useEmissionValidity ? `Válido ${form?.emissionValidDays} días desde emisión. ` : (form?.validFrom && form?.validUntil ? `Válido del ${new Date(form.validFrom)?.toLocaleDateString('es-MX')} al ${new Date(form.validUntil)?.toLocaleDateString('es-MX')}. ` : '')}
                  {`Cada usuario puede usarlo ${form?.usagePerUser === 'unlimited' ? 'ilimitadas veces' : form?.usagePerUser + ' vez/veces'}. `}
                  {form?.minPurchase && form?.requireMinPurchase ? `Mínimo $${form?.minPurchase} MXN. ` : ''}
                  {form?.totalLimit ? `Máximo ${form?.totalLimit} canjes totales. ` : ''}
                  {form?.maxBudget ? `Presupuesto máx. $${form?.maxBudget} MXN.` : ''}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── SECTION 5: Canal de distribución ── */}
        <div className="bg-card border border-border rounded-xl p-5">
          <SectionHeader num="5" title="Canal de distribución" />
          <div className="space-y-3 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { key: 'public', label: 'Público en ficha', desc: 'Cualquier cliente puede tomarlo desde el perfil del negocio', icon: 'Globe' },
                { key: 'crm_segment', label: 'Solo segmento CRM', desc: 'Solo usuarios de un segmento específico pueden verlo', icon: 'Filter' },
                { key: 'qr_flyer', label: 'QR imprimible (flyer)', desc: 'Genera un QR para poner en material físico', icon: 'QrCode' },
                { key: 'flow', label: 'Vinculado a flow/campaña', desc: 'Se distribuye automáticamente por un flow de automatización', icon: 'Workflow' },
              ]?.map(ch => (
                <label key={ch?.key} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${form?.distributionChannel === ch?.key ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'}`}>
                  <input type="radio" name="distributionChannel" value={ch?.key} checked={form?.distributionChannel === ch?.key} onChange={() => set('distributionChannel', ch?.key)} className="mt-0.5 accent-primary" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Icon name={ch?.icon} size={14} className="text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{ch?.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{ch?.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            {form?.distributionChannel === 'crm_segment' && (
              <Input label="Segmento CRM" placeholder="Nombre del segmento" value={form?.crmSegmentDist} onChange={e => set('crmSegmentDist', e?.target?.value)} />
            )}
            {form?.distributionChannel === 'qr_flyer' && (
              <div className="bg-muted/40 border border-border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">QR imprimible para distribución offline</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Descarga el QR en PDF para flyers, tent cards o stickers</p>
                </div>
                <Button variant="outline" size="sm" iconName="Download" iconPosition="left">Descargar PDF</Button>
              </div>
            )}
          </div>
        </div>

        {/* ── SECTION 6: Notificaciones de vencimiento ── */}
        <div className="bg-card border border-border rounded-xl p-5">
          <SectionHeader num="6" title="Notificaciones de vencimiento" />
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Enviar push cuando el cupón esté por vencer</p>
                <p className="text-xs text-muted-foreground">El sistema notifica al usuario antes de que expire</p>
              </div>
              <Toggle value={form?.expiryNotifications} onChange={v => set('expiryNotifications', v)} />
            </div>
            {form?.expiryNotifications && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-2">Notificar con anticipación de</label>
                  <div className="flex gap-2 flex-wrap">
                    {[7, 3, 1]?.map(d => (
                      <button key={d} onClick={() => toggleNotifyDay(d)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form?.notifyDays?.includes(d) ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-muted-foreground/40'}`}>
                        {d} día{d > 1 ? 's' : ''} antes
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Texto de la notificación</label>
                  <textarea value={form?.notifyText} onChange={e => set('notifyText', e?.target?.value)} rows={2} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                  <p className="text-xs text-muted-foreground mt-1">Variables: {'{nombre_negocio}'}, {'{X}'} (días restantes), {'{fecha_vencimiento}'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── SECTION 7: Cupón de recuperación automático ── */}
        <div className="bg-card border border-border rounded-xl p-5">
          <SectionHeader num="7" title="Auto-envío como cupón de recuperación" />
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Activar como cupón de recuperación automático</p>
                <p className="text-xs text-muted-foreground mt-0.5">El sistema enviará este cupón automáticamente a clientes inactivos</p>
              </div>
              <Toggle value={form?.isRecoveryTrigger} onChange={v => set('isRecoveryTrigger', v)} color="bg-orange-500" />
            </div>
            {form?.isRecoveryTrigger && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Días de inactividad para activar el envío</label>
                  <div className="flex items-center gap-2">
                    <input type="number" min={7} max={365} value={form?.recoveryInactivityDays} onChange={e => set('recoveryInactivityDays', Number(e?.target?.value))} className="w-24 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30" />
                    <span className="text-sm text-muted-foreground">días sin visita o compra</span>
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-800">
                  <Icon name="Info" size={12} className="inline mr-1" />
                  Este cupón se enviará automáticamente a cualquier cliente que lleve <strong>{form?.recoveryInactivityDays} días</strong> sin actividad. Asegúrate de configurar el canal de distribución como "Vinculado a flow/campaña" para el envío automático.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── SECTION 8: Términos y condiciones ── */}
        <div className="bg-card border border-border rounded-xl p-5">
          <SectionHeader num="8" title="Términos y condiciones" />
          <div className="space-y-4 mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              <Icon name="Info" size={12} className="inline mr-1" />
              El campo se pre-llena automáticamente con el resumen de las reglas configuradas. Puedes editarlo o agregar términos adicionales.
            </div>

            {/* Auto-generated summary */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-foreground">Resumen de reglas (generado automáticamente)</label>
                <button
                  type="button"
                  onClick={() => set('termsAndConditions', generateTermsSummary(form))}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  <Icon name="RefreshCw" size={12} />
                  Actualizar
                </button>
              </div>
              <div className="w-full px-3 py-2 border border-border rounded-lg bg-muted/30 text-foreground text-xs font-mono whitespace-pre-wrap min-h-[80px]">
                {generateTermsSummary(form) || <span className="text-muted-foreground italic">Configura las reglas en la sección anterior para generar el resumen automáticamente.</span>}
              </div>
            </div>

            {/* Editable T&C field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-foreground">Términos y condiciones completos</label>
                <button
                  type="button"
                  onClick={() => set('termsCustomText', (form?.termsCustomText ? form?.termsCustomText + '\n' : '') + generateTermsSummary(form))}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  <Icon name="Copy" size={12} />
                  Copiar resumen aquí
                </button>
              </div>
              <textarea
                value={form?.termsCustomText || generateTermsSummary(form)}
                onChange={e => set('termsCustomText', e?.target?.value)}
                placeholder="Los términos y condiciones se pre-llenan con el resumen de reglas. Puedes agregar o modificar el texto aquí..."
                rows={8}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Este texto aparecerá en la sección de términos del cupón en la app del cliente. Puedes agregar condiciones adicionales, restricciones legales o cualquier información relevante.
              </p>
            </div>

            {/* Quick add suggestions */}
            <div>
              <p className="text-xs font-medium text-foreground mb-2">Agregar cláusulas frecuentes:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'No aplica en días festivos.',
                  'Sujeto a disponibilidad.',
                  'No aplica en productos de temporada.',
                  'Válido solo con consumo mínimo.',
                  'No reembolsable ni canjeable por efectivo.',
                  'El negocio se reserva el derecho de admisión.',
                ]?.map(clause => (
                  <button
                    key={clause}
                    type="button"
                    onClick={() => {
                      const current = form?.termsCustomText || generateTermsSummary(form);
                      set('termsCustomText', current + (current ? '\n' : '') + `• ${clause}`);
                    }}
                    className="px-2.5 py-1 text-xs border border-border rounded-full text-muted-foreground hover:border-primary hover:text-primary transition-colors bg-card"
                  >
                    + {clause}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex gap-3 pb-4">
          <Button variant="outline" onClick={() => handleSubmit(false)} className="flex-1">Guardar borrador</Button>
          <Button onClick={() => handleSubmit(true)} className="flex-1">
            {form?.codeMode === 'batch' ? `Generar ${form?.batchQty} cupones` : 'Publicar cupón'}
          </Button>
        </div>
      </div>
      {/* RIGHT: Preview */}
      <div className="lg:w-80 flex-shrink-0">
        <div className="sticky top-4 space-y-4">
          <h3 className="font-semibold text-foreground text-sm">Vista previa — Wallet del usuario</h3>

          {/* Wallet card */}
          <div className="rounded-2xl overflow-hidden shadow-lg border border-border">
            <div className="relative h-32">
              <img src={form?.selectedImage} alt="Vista previa del cupón de promoción" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="text-white font-bold text-xl">{getBenefitLabel(form)}</div>
                <div className="text-white/80 text-xs">{form?.title || 'Título del cupón'}</div>
              </div>
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-medium">Promoción</span>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: form?.accentColor }} />
              </div>
            </div>
            <div className="bg-card p-3 space-y-2">
              <div className="text-xs text-muted-foreground line-clamp-2">{form?.description || 'Descripción del beneficio aparecerá aquí'}</div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-foreground tracking-wider">
                  {displayCode?.substring(0, 4)}-****
                </span>
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <Icon name="QrCode" size={24} className="text-foreground" />
                </div>
              </div>
              {!form?.useEmissionValidity && form?.validUntil && (
                <div className="text-xs text-muted-foreground">
                  Válido hasta: {new Date(form.validUntil)?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              )}
              {form?.useEmissionValidity && (
                <div className="text-xs text-muted-foreground">
                  Válido {form?.emissionValidDays} días desde que lo recibas
                </div>
              )}
              <div className="h-1 rounded-full" style={{ backgroundColor: form?.accentColor }} />
            </div>
          </div>

          {/* Push notification preview */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Vista previa de notificación push</h4>
            <div className="bg-gray-900 rounded-xl p-3 flex items-start gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="Ticket" size={14} className="text-white" />
              </div>
              <div>
                <div className="text-white text-xs font-semibold">PromoClub</div>
                <div className="text-gray-300 text-xs">Tu negocio te envió un cupón: {form?.title || 'Nuevo cupón'}</div>
              </div>
            </div>
          </div>

          {/* Rules summary */}
          <div className="bg-card border border-border rounded-xl p-3 space-y-2">
            <h4 className="text-xs font-semibold text-foreground">Resumen de reglas</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon name={form?.isPersonal ? 'Lock' : 'Unlock'} size={11} className={form?.isPersonal ? 'text-amber-500' : 'text-green-500'} />
                {form?.isPersonal ? 'Personal — no transferible' : 'Transferible / código público'}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon name="Users" size={11} className="text-blue-500" />
                {form?.audience === 'all' ? 'Todos los clientes' : form?.audience === 'new' ? 'Solo nuevos clientes' : form?.audience === 'vip' ? `Nivel VIP: ${form?.vipLevel || '—'}` : `Segmento: ${form?.crmSegment || '—'}`}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon name="Hash" size={11} className="text-purple-500" />
                {form?.usagePerUser === 'unlimited' ? 'Usos ilimitados por usuario' : `${form?.usagePerUser} uso(s) por usuario`}
              </div>
              {form?.combineWithPromos && (
                <div className="flex items-center gap-1.5 text-xs text-green-600">
                  <Icon name="Check" size={11} />
                  Combinable con promociones
                </div>
              )}
              {!form?.combineWithPromos && (
                <div className="flex items-center gap-1.5 text-xs text-red-500">
                  <Icon name="X" size={11} />
                  No combinable con promociones
                </div>
              )}
            </div>
          </div>

          {/* NFC section */}
          <div className="bg-card border border-border rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon name="Wifi" size={14} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Canje NFC</span>
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full font-medium">PREMIUM</span>
            </div>
            <p className="text-xs text-muted-foreground">Registra tags NFC para habilitar el canje por tap →</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuevoCuponPromocionForm;
