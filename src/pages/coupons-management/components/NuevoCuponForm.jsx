import React, { useState, useEffect } from 'react';
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
  return 'Beneficio';
};

const NuevoCuponForm = ({ coupon, onSave, onCancel }) => {
  const [form, setForm] = useState({
    benefitType: coupon?.benefitType || 'percentage',
    percentValue: coupon?.benefitValue || 20,
    maxDiscount: '',
    fixedAmount: '',
    productName: '',
    bogoDesc: '',
    upgradeDesc: '',
    vipDesc: '',
    title: coupon?.title || '',
    description: coupon?.description || '',
    selectedImage: coupon?.image || TEMPLATE_IMAGES?.[0]?.url,
    accentColor: coupon?.accentColor || ACCENT_COLORS?.[0],
    codeMode: 'auto',
    customCode: '',
    autoCode: generateCode(),
    batchPrefix: 'PROMO-',
    batchQty: 100,
    batchSingleUse: true,
    validFrom: '',
    validUntil: '',
    usagePerUser: '1',
    minPurchase: '',
    totalLimit: '',
    rulesExpanded: false,
    requireMinPurchase: false,
    status: coupon?.status || 'active',
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

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
          <h2 className="text-xl font-bold text-foreground">{coupon ? 'Editar cupón' : 'Nuevo cupón'}</h2>
          <p className="text-sm text-muted-foreground">Completa la información para crear tu cupón</p>
        </div>

        {/* SECTION 1: Beneficio */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">1</span>
            Tipo de beneficio
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
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
                <div className={`text-xs font-medium ${form?.benefitType === bt?.key ? bt?.color : 'text-foreground'}`}>{bt?.label}</div>
              </button>
            ))}
          </div>

          {/* Benefit-specific fields */}
          {form?.benefitType === 'percentage' && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Porcentaje de descuento: <span className="text-primary font-bold">{form?.percentValue}%</span></label>
                <input
                  type="range" min={5} max={90} value={form?.percentValue}
                  onChange={e => set('percentValue', Number(e?.target?.value))}
                  className="w-full accent-primary"
                />
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
        </div>

        {/* SECTION 2: Identidad */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">2</span>
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
                placeholder="Ej: 20% en tu próxima visita"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Descripción <span className="text-muted-foreground text-xs">({form?.description?.length}/120)</span>
              </label>
              <textarea
                maxLength={120} value={form?.description}
                onChange={e => set('description', e?.target?.value)}
                placeholder="Describe el beneficio brevemente"
                rows={2}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
            {/* Image gallery */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Imagen del cupón</label>
              <div className="grid grid-cols-4 gap-2">
                {TEMPLATE_IMAGES?.map(img => (
                  <button
                    key={img?.key}
                    onClick={() => set('selectedImage', img?.url)}
                    className={`relative rounded-lg overflow-hidden h-14 border-2 transition-all ${
                      form?.selectedImage === img?.url ? 'border-primary shadow-md' : 'border-transparent hover:border-muted-foreground/40'
                    }`}
                  >
                    <img src={img?.url} alt={`Template ${img?.label}`} className="w-full h-full object-cover" />
                    {form?.selectedImage === img?.url && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <Icon name="Check" size={14} className="text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs text-center py-0.5">{img?.label}</div>
                  </button>
                ))}
              </div>
            </div>
            {/* Accent color */}
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
            <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">3</span>
            Código del cupón
          </h3>
          <div className="space-y-3">
            {[{ key: 'custom', label: 'Código personalizado', desc: 'Tú eliges el código (ej: VERANO25)' },
              { key: 'auto', label: 'Código automático', desc: 'El sistema genera un código único' },
              { key: 'batch', label: 'Lote de cupones', desc: 'Genera N cupones únicos simultáneamente' }]?.map(opt => (
              <label key={opt?.key} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                form?.codeMode === opt?.key ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'
              }`}>
                <input type="radio" name="codeMode" value={opt?.key} checked={form?.codeMode === opt?.key} onChange={() => set('codeMode', opt?.key)} className="mt-0.5 accent-primary" />
                <div>
                  <div className="text-sm font-medium text-foreground">{opt?.label}</div>
                  <div className="text-xs text-muted-foreground">{opt?.desc}</div>
                </div>
              </label>
            ))}

            {form?.codeMode === 'custom' && (
              <Input
                label="Código personalizado (4-20 caracteres)"
                value={form?.customCode}
                onChange={e => set('customCode', e?.target?.value?.toUpperCase()?.replace(/[OI01L]/g, ''))}
                placeholder="Ej: VERANO25"
                maxLength={20}
              />
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
                <div className="bg-primary/10 text-primary text-sm px-3 py-2 rounded-lg font-medium">
                  Se generarán <strong>{form?.batchQty}</strong> cupones únicos
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: Reglas */}
        <div className="bg-card border border-border rounded-xl p-5">
          <button
            className="w-full flex items-center justify-between"
            onClick={() => set('rulesExpanded', !form?.rulesExpanded)}
          >
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">4</span>
              Reglas y condiciones
            </h3>
            <Icon name={form?.rulesExpanded ? 'ChevronUp' : 'ChevronDown'} size={18} className="text-muted-foreground" />
          </button>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Válido desde</label>
              <input type="date" value={form?.validFrom} onChange={e => set('validFrom', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Válido hasta</label>
              <input type="date" value={form?.validUntil} onChange={e => set('validUntil', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>

          {form?.rulesExpanded && (
            <div className="mt-4 space-y-4 border-t border-border pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">Límite por usuario</label>
                  <select value={form?.usagePerUser} onChange={e => set('usagePerUser', e?.target?.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none">
                    <option value="1">1 uso</option>
                    <option value="2">2 usos</option>
                    <option value="3">3 usos</option>
                    <option value="5">5 usos</option>
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
                        form?.requireMinPurchase ? 'bg-primary' : 'bg-muted'
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
                      <div className="flex items-center gap-0">
                        <span className="px-3 py-2 bg-muted border border-r-0 border-border rounded-l-lg text-sm font-medium text-muted-foreground">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form?.minPurchase}
                          onChange={e => set('minPurchase', e?.target?.value)}
                          placeholder="0.00"
                          className="flex-1 px-3 py-2 border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="px-3 py-2 bg-muted border border-l-0 border-border rounded-r-lg text-sm font-medium text-muted-foreground">MXN</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Input label="Límite total de canjes" type="number" placeholder="Ej: 200 (vacío = ilimitado)" value={form?.totalLimit} onChange={e => set('totalLimit', e?.target?.value)} />

              {/* Natural language summary */}
              {(form?.validFrom || form?.validUntil || form?.minPurchase || form?.totalLimit) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  <Icon name="FileText" size={14} className="inline mr-1" />
                  <strong>Resumen: </strong>
                  {form?.validFrom && form?.validUntil && `Válido del ${new Date(form.validFrom)?.toLocaleDateString('es-MX')} al ${new Date(form.validUntil)?.toLocaleDateString('es-MX')}. `}
                  {`Cada usuario puede usarlo ${form?.usagePerUser === 'unlimited' ? 'ilimitadas veces' : form?.usagePerUser + ' vez/veces'}. `}
                  {form?.minPurchase && `Mínimo de compra $${form?.minPurchase} MXN. `}
                  {form?.totalLimit && `Máximo ${form?.totalLimit} canjes totales.`}
                </div>
              )}
            </div>
          )}
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
              <img src={form?.selectedImage} alt="Preview del cupón" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="text-white font-bold text-xl">{getBenefitLabel(form)}</div>
                <div className="text-white/80 text-xs">{form?.title || 'Título del cupón'}</div>
              </div>
              <div className="absolute top-2 right-2 w-3 h-3 rounded-full" style={{ backgroundColor: form?.accentColor }} />
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
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="Ticket" size={14} className="text-white" />
              </div>
              <div>
                <div className="text-white text-xs font-semibold">PromoClub</div>
                <div className="text-gray-300 text-xs">
                  Tu negocio te envió un cupón: {form?.title || 'Nuevo cupón'}
                </div>
              </div>
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

export default NuevoCuponForm;
