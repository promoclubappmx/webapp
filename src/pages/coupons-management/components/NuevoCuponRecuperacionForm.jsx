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
  { key: 'fixed_price', label: 'Precio especial fijo', icon: 'Tag', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-300', desc: 'Precio fijo especial en un producto' },
];

const ACCENT_COLORS = [
  '#EA580C', '#DC2626', '#D97706', '#7C3AED', '#059669',
  '#2563EB', '#0891B2', '#DB2777', '#65A30D', '#CA8A04',
];

const TEMPLATE_IMAGES = [
  { key: 'welcome_back', label: 'Regreso', url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=225&fit=crop' },
  { key: 'coffee', label: 'Café', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=225&fit=crop' },
  { key: 'food', label: 'Comida', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=225&fit=crop' },
  { key: 'retail', label: 'Retail', url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=225&fit=crop' },
  { key: 'beauty', label: 'Belleza', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=225&fit=crop' },
  { key: 'fitness', label: 'Fitness', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=225&fit=crop' },
];

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'REC-' + Array.from({ length: 6 }, () => chars?.[Math.floor(Math.random() * chars?.length)])?.join('');
};

const getBenefitLabel = (form) => {
  if (form?.benefitType === 'percentage') return form?.percentValue ? `${form?.percentValue}% OFF` : '% OFF';
  if (form?.benefitType === 'fixed') return form?.fixedAmount ? `$${form?.fixedAmount} OFF` : '$X OFF';
  if (form?.benefitType === 'free_product') return form?.productName || 'Producto Gratis';
  if (form?.benefitType === 'bogo') return '2×1 / 3×2';
  if (form?.benefitType === 'upgrade') return 'Upgrade';
  if (form?.benefitType === 'free_shipping') return 'Envío gratis';
  if (form?.benefitType === 'vip_access') return 'Acceso VIP';
  if (form?.benefitType === 'cashback_points') return form?.cashbackPoints ? `+${form?.cashbackPoints} pts` : 'Cashback puntos';
  if (form?.benefitType === 'bundle') return 'Bundle / Combo';
  if (form?.benefitType === 'quantity_discount') return 'Desc. por cantidad';
  if (form?.benefitType === 'fixed_price') return form?.fixedPrice ? `$${form?.fixedPrice}` : 'Precio especial fijo';
  return 'Beneficio';
};

const NuevoCuponRecuperacionForm = ({ onSave, onCancel }) => {
  const [form, setForm] = useState({
    benefitType: 'percentage',
    percentValue: 20,
    fixedAmount: '',
    productName: '',
    title: '',
    description: '',
    selectedImage: TEMPLATE_IMAGES?.[0]?.url,
    accentColor: ACCENT_COLORS?.[0],
    autoCode: generateCode(),
    validFrom: '',
    validUntil: '',
    inactivityDays: 21,
    channel: 'push',
    message: '¡Te extrañamos! Aquí va un {beneficio} especial para tu regreso. Válido hasta {fecha_vencimiento}.',
    rulesExpanded: false,
    usagePerUser: '1',
    minPurchase: '',
    requireMinPurchase: false,
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (publish) => {
    const data = {
      title: form?.title || 'Cupón de recuperación',
      description: form?.description,
      benefitType: form?.benefitType,
      benefitValue: form?.benefitType === 'percentage' ? form?.percentValue : form?.fixedAmount,
      code: form?.autoCode,
      image: form?.selectedImage,
      accentColor: form?.accentColor,
      validFrom: form?.validFrom,
      validUntil: form?.validUntil,
      status: publish ? 'active' : 'draft',
      type: 'recovery',
    };
    onSave?.(data);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
      {/* LEFT: Form */}
      <div className="flex-1 space-y-5 overflow-y-auto">
        {/* Back */}
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="ArrowLeft" size={16} />
          Volver a Mis Cupones
        </button>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Icon name="UserX" size={16} className="text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Nuevo cupón de recuperación</h2>
          </div>
          <p className="text-sm text-muted-foreground">Crea un cupón individual para recuperar clientes inactivos</p>
        </div>

        {/* SECTION 1: Beneficio */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">1</span>
            Tipo de beneficio
          </h3>
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

          {form?.benefitType === 'percentage' && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Porcentaje de descuento: <span className="text-orange-600 font-bold">{form?.percentValue}%</span>
                </label>
                <input
                  type="range" min={5} max={90} value={form?.percentValue}
                  onChange={e => set('percentValue', Number(e?.target?.value))}
                  className="w-full accent-orange-500"
                />
                <div className="flex justify-between text-xs text-muted-foreground"><span>5%</span><span>90%</span></div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-xs text-orange-800">
                <Icon name="TrendingUp" size={12} className="inline mr-1" />
                Para recuperar clientes dormidos, recomendamos al menos <strong>15-20%</strong> de descuento.
              </div>
            </div>
          )}
          {form?.benefitType === 'fixed' && (
            <Input label="Monto de descuento (MXN)" type="number" placeholder="Ej: 50" value={form?.fixedAmount} onChange={e => set('fixedAmount', e?.target?.value)} />
          )}
          {form?.benefitType === 'free_product' && (
            <Input label="Nombre del producto gratis" placeholder="Ej: Café americano, Postre de la casa" value={form?.productName} onChange={e => set('productName', e?.target?.value)} />
          )}
          {form?.benefitType === 'bogo' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
              <Icon name="Copy" size={12} className="inline mr-1" />
              El cliente obtiene un producto adicional gratis al comprar el indicado (2×1) o dos al comprar dos (3×2).
            </div>
          )}
          {form?.benefitType === 'upgrade' && (
            <Input label="Descripción del upgrade" placeholder="Ej: Tamaño grande al precio de mediano" value={form?.upgradeDesc || ''} onChange={e => set('upgradeDesc', e?.target?.value)} />
          )}
          {form?.benefitType === 'free_shipping' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs text-emerald-800">
              <Icon name="Truck" size={12} className="inline mr-1" />
              El costo de envío será eliminado automáticamente al aplicar este cupón.
            </div>
          )}
          {form?.benefitType === 'vip_access' && (
            <Input label="Descripción del acceso VIP" placeholder="Ej: Acceso a sala VIP, evento exclusivo" value={form?.vipDesc || ''} onChange={e => set('vipDesc', e?.target?.value)} />
          )}
          {form?.benefitType === 'cashback_points' && (
            <Input label="Puntos de cashback a otorgar" type="number" placeholder="Ej: 200" value={form?.cashbackPoints || ''} onChange={e => set('cashbackPoints', e?.target?.value)} />
          )}
          {form?.benefitType === 'bundle' && (
            <Input label="Descripción del bundle / combo" placeholder="Ej: Hamburguesa + papas + refresco con 20% OFF" value={form?.bundleDesc || ''} onChange={e => set('bundleDesc', e?.target?.value)} />
          )}
          {form?.benefitType === 'quantity_discount' && (
            <Input label="Descripción del descuento por cantidad" placeholder="Ej: Compra 3 y paga 2" value={form?.quantityDesc || ''} onChange={e => set('quantityDesc', e?.target?.value)} />
          )}
          {form?.benefitType === 'fixed_price' && (
            <Input label="Precio especial fijo (MXN)" type="number" placeholder="Ej: 99" value={form?.fixedPrice || ''} onChange={e => set('fixedPrice', e?.target?.value)} />
          )}
        </div>

        {/* SECTION 2: Identidad visual */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">2</span>
            Identidad visual
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Título del cupón <span className="text-muted-foreground text-xs">({form?.title?.length}/40)</span>
              </label>
              <input
                type="text" maxLength={40} value={form?.title}
                onChange={e => set('title', e?.target?.value)}
                placeholder="Ej: ¡Te extrañamos! 20% de regreso"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Descripción <span className="text-muted-foreground text-xs">({form?.description?.length}/120)</span>
              </label>
              <textarea
                maxLength={120} value={form?.description}
                onChange={e => set('description', e?.target?.value)}
                placeholder="Describe el beneficio para el cliente"
                rows={2}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Imagen del cupón</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {TEMPLATE_IMAGES?.map(img => (
                  <button
                    key={img?.key}
                    onClick={() => set('selectedImage', img?.url)}
                    className={`relative rounded-lg overflow-hidden h-14 border-2 transition-all ${
                      form?.selectedImage === img?.url ? 'border-orange-500 shadow-md' : 'border-transparent hover:border-muted-foreground/40'
                    }`}
                  >
                    <img src={img?.url} alt={`Template ${img?.label}`} className="w-full h-full object-cover" />
                    {form?.selectedImage === img?.url && (
                      <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                        <Icon name="Check" size={14} className="text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs text-center py-0.5">{img?.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Color de acento</label>
              <div className="flex gap-2 flex-wrap">
                {ACCENT_COLORS?.map(color => (
                  <button
                    key={color}
                    onClick={() => set('accentColor', color)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      form?.accentColor === color ? 'border-foreground scale-110 shadow-md' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Código */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">3</span>
            Código del cupón
          </h3>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <span className="font-mono text-lg font-bold text-foreground tracking-widest">{form?.autoCode}</span>
            <Button variant="ghost" size="sm" onClick={() => set('autoCode', generateCode())} iconName="RefreshCw" iconPosition="left">
              Regenerar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">El código se genera automáticamente con prefijo REC- para identificar cupones de recuperación.</p>
        </div>

        {/* SECTION 4: Mensaje de envío */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">4</span>
            Mensaje para el cliente
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Mensaje personalizable</label>
              <textarea
                value={form?.message}
                onChange={e => set('message', e?.target?.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">Variables: {'{nombre_cliente}'}, {'{nombre_negocio}'}, {'{beneficio}'}, {'{fecha_vencimiento}'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Canal de envío</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'push', label: 'Push notification', icon: 'Bell' },
                  { key: 'email', label: 'Email', icon: 'Mail' },
                  { key: 'whatsapp', label: 'WhatsApp', icon: 'MessageCircle' },
                  { key: 'wallet', label: 'Wallet', icon: 'Wallet' },
                ]?.map(ch => (
                  <label key={ch?.key} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                    form?.channel === ch?.key ? 'border-orange-500 bg-orange-50' : 'border-border hover:border-muted-foreground/40'
                  }`}>
                    <input
                      type="radio" name="channel" value={ch?.key}
                      checked={form?.channel === ch?.key}
                      onChange={() => set('channel', ch?.key)}
                      className="accent-orange-500"
                    />
                    <Icon name={ch?.icon} size={14} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{ch?.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: Vigencia y reglas */}
        <div className="bg-card border border-border rounded-xl p-5">
          <button
            className="w-full flex items-center justify-between"
            onClick={() => set('rulesExpanded', !form?.rulesExpanded)}
          >
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">5</span>
              Vigencia y condiciones
            </h3>
            <Icon name={form?.rulesExpanded ? 'ChevronUp' : 'ChevronDown'} size={18} className="text-muted-foreground" />
          </button>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Válido desde</label>
              <input type="date" value={form?.validFrom} onChange={e => set('validFrom', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Válido hasta</label>
              <input type="date" value={form?.validUntil} onChange={e => set('validUntil', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Cupones con vigencia corta (3-7 días) tienen mayor tasa de canje porque generan urgencia.</p>

          {form?.rulesExpanded && (
            <div className="mt-4 space-y-4 border-t border-border pt-4">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Límite por usuario</label>
                <select value={form?.usagePerUser} onChange={e => set('usagePerUser', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none">
                  <option value="1">1 uso</option>
                  <option value="2">2 usos</option>
                  <option value="3">3 usos</option>
                  <option value="unlimited">Ilimitado</option>
                </select>
              </div>
              <div className="border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">¿Requiere monto mínimo de compra?</p>
                    <p className="text-xs text-muted-foreground mt-0.5">El cupón solo aplica si el cliente supera este monto</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => set('requireMinPurchase', !form?.requireMinPurchase)}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                      form?.requireMinPurchase ? 'bg-orange-500' : 'bg-muted'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      form?.requireMinPurchase ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                {form?.requireMinPurchase && (
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Monto mínimo requerido</label>
                    <div className="flex items-center">
                      <span className="px-3 py-2 bg-muted border border-r-0 border-border rounded-l-lg text-sm font-medium text-muted-foreground">$</span>
                      <input
                        type="number" min="0" step="0.01"
                        value={form?.minPurchase}
                        onChange={e => set('minPurchase', e?.target?.value)}
                        placeholder="0.00"
                        className="flex-1 px-3 py-2 border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30"
                      />
                      <span className="px-3 py-2 bg-muted border border-l-0 border-border rounded-r-lg text-sm font-medium text-muted-foreground">MXN</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div className="flex gap-3 pb-4">
          <Button variant="outline" onClick={() => handleSubmit(false)} className="flex-1">Guardar borrador</Button>
          <Button onClick={() => handleSubmit(true)} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-orange-500">
            Publicar cupón de recuperación
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
              <img src={form?.selectedImage} alt="Preview del cupón de recuperación" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="text-white font-bold text-xl">{getBenefitLabel(form)}</div>
                <div className="text-white/80 text-xs">{form?.title || 'Título del cupón'}</div>
              </div>
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-medium">Recuperación</span>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: form?.accentColor }} />
              </div>
            </div>
            <div className="bg-card p-3 space-y-2">
              <div className="text-xs text-muted-foreground line-clamp-2">{form?.description || 'Descripción del beneficio aparecerá aquí'}</div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-foreground tracking-wider">
                  {form?.autoCode?.substring(0, 7)}-**
                </span>
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <Icon name="QrCode" size={24} className="text-foreground" />
                </div>
              </div>
              {form?.validUntil && (
                <div className="text-xs text-muted-foreground">
                  Válido hasta: {new Date(form.validUntil)?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              )}
              <div className="h-1 rounded-full" style={{ backgroundColor: form?.accentColor }} />
            </div>
          </div>

          {/* Push notification preview */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Vista previa de notificación push</h4>
            <div className="bg-gray-900 rounded-xl p-3 flex items-start gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="UserX" size={14} className="text-white" />
              </div>
              <div>
                <div className="text-white text-xs font-semibold">PromoClub</div>
                <div className="text-gray-300 text-xs">
                  {form?.message?.replace('{beneficio}', getBenefitLabel(form))?.replace('{nombre_cliente}', 'Cliente')?.replace('{nombre_negocio}', 'Tu negocio')?.replace('{fecha_vencimiento}', form?.validUntil || 'pronto')?.substring(0, 80)}
                </div>
              </div>
            </div>
          </div>

          {/* Info badge */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={14} className="text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-orange-800">
                Este cupón se enviará manualmente a los clientes seleccionados. Para envíos automáticos por inactividad, usa la <strong>configuración de recuperación</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuevoCuponRecuperacionForm;
