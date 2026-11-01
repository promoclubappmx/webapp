import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { SearchableProductSelector, SearchableCategorySelector, SearchableVariableProductSelector, CurrencyInput } from '../../components/ui/SearchableSelector';

// ─── Constants ────────────────────────────────────────────────────────────────

const BENEFIT_TYPES = [
  { key: 'percentage', label: '% Descuento', icon: 'Percent', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-300', desc: 'Porcentaje de descuento sobre el total' },
  { key: 'fixed', label: 'Monto fijo', icon: 'Banknote', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-300', desc: '$X MXN de descuento directo' },
  { key: 'free_product', label: 'Producto gratis', icon: 'Gift', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-300', desc: 'Desbloquea un producto sin costo' },
  { key: 'bogo', label: '2×1 / 3×2', icon: 'Copy', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-300', desc: 'Aplica en producto indicado' },
  { key: 'upgrade', label: 'Upgrade', icon: 'ArrowUpCircle', color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-300', desc: 'Upgrade gratuito al siguiente tamaño' },
  { key: 'free_shipping', label: 'Envío gratis', icon: 'Truck', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-300', desc: 'Elimina el costo de envío' },
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

const INACTIVITY_PILLS = [
  { days: 14, label: '14 días', tag: 'agresivo', color: 'bg-red-100 text-red-700 border-red-200' },
  { days: 21, label: '21 días', tag: 'recomendado', color: 'bg-green-100 text-green-700 border-green-200' },
  { days: 30, label: '30 días', tag: 'conservador', color: 'bg-blue-100 text-blue-700 border-blue-200' },
];

const DAYS_OF_WEEK = [
  { key: 'mon', label: 'Lun' }, { key: 'tue', label: 'Mar' }, { key: 'wed', label: 'Mié' },
  { key: 'thu', label: 'Jue' }, { key: 'fri', label: 'Vie' }, { key: 'sat', label: 'Sáb' }, { key: 'sun', label: 'Dom' },
];

// ─── Wizard Tabs ──────────────────────────────────────────────────────────────

const TABS = [
  { id: 'trigger', label: 'Inactividad', icon: 'Clock', short: '1' },
  { id: 'benefit', label: 'Beneficio', icon: 'Gift', short: '2' },
  { id: 'identity', label: 'Identidad visual', icon: 'Palette', short: '3' },
  { id: 'message', label: 'Mensaje', icon: 'MessageCircle', short: '4' },
  { id: 'validity', label: 'Vigencia', icon: 'Calendar', short: '5' },
  { id: 'escalation', label: 'Escalada', icon: 'Layers', short: '6' },
  { id: 'eligibility', label: 'Elegibilidad', icon: 'Users', short: '7' },
  { id: 'establishments', label: 'Establecimiento', icon: 'MapPin', short: '8' },
  { id: 'rules', label: 'Reglas', icon: 'Shield', short: '9' },
  { id: 'terms', label: 'Términos', icon: 'FileText', short: '10' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'REC-' + Array.from({ length: 6 }, () => chars?.[Math.floor(Math.random() * chars?.length)])?.join('');
};

const getBenefitLabel = (form) => {
  const type = form?.benefitType;
  if (type === 'percentage') return form?.percentValue ? `${form?.percentValue}% OFF` : '% OFF';
  if (type === 'fixed') return form?.fixedAmount ? `$${form?.fixedAmount} OFF` : '$X OFF';
  if (type === 'free_product') return form?.freeProductName || 'Producto Gratis';
  if (type === 'bogo') return form?.bogoType === '3x2' ? '3×2' : '2×1';
  if (type === 'upgrade') return form?.upgradeProductName ? `Upgrade: ${form?.upgradeProductName}` : 'Upgrade';
  if (type === 'free_shipping') return 'Envío gratis';
  if (type === 'cashback_points') return form?.cashbackPoints ? `+${form?.cashbackPoints}x pts` : 'Cashback puntos';
  if (type === 'bundle') {
    const total = (form?.bundleProducts || [])?.reduce((s, p) => s + (Number(p?.price) || 0), 0);
    if (form?.bundleDiscountType === 'special_price' && form?.bundleSpecialPrice) return `Combo $${form?.bundleSpecialPrice} MXN`;
    if (total > 0 && form?.bundleDiscountType === 'discount' && form?.bundleDiscount > 0) return `Combo ${form?.bundleDiscount}% OFF`;
    return 'Bundle / Combo';
  }
  if (type === 'quantity_discount') return form?.qtyBuy ? `${form?.qtyBuy}+1` : 'Desc. por cantidad';
  if (type === 'fixed_price') return form?.fixedPrice ? `$${form?.fixedPrice}` : 'Precio especial fijo';
  return 'Beneficio';
};

const getBenefitTermsLine = (form) => {
  if (form?.benefitType === 'percentage') {
    let line = `• Descuento del ${form?.percentValue || '?'}%`;
    if (form?.percentAppliesTo === 'product' && form?.percentProductName) line += ` en ${form?.percentProductName}`;
    else if (form?.percentAppliesTo === 'category' && form?.percentCategoryName) line += ` en la categoría ${form?.percentCategoryName}`;
    else line += ` sobre el total de la compra`;
    if (form?.maxDiscount) line += `. Tope máximo de descuento: $${form?.maxDiscount} MXN`;
    if (form?.percentRequireMinPurchase && form?.percentMinPurchase) line += `. Requiere compra mínima de $${form?.percentMinPurchase} MXN`;
    return line + '.';
  }
  if (form?.benefitType === 'fixed') {
    let line = `• Descuento de $${form?.fixedAmount || '?'} MXN`;
    if (form?.fixedAppliesTo === 'product' && form?.fixedProductName) line += ` en ${form?.fixedProductName}`;
    else if (form?.fixedAppliesTo === 'category' && form?.fixedCategoryName) line += ` en la categoría ${form?.fixedCategoryName}`;
    else line += ` en cualquier producto/categoría`;
    if (form?.fixedRequireMinPurchase && form?.fixedMinPurchase) line += `. Requiere compra mínima de $${form?.fixedMinPurchase} MXN`;
    return line + '.';
  }
  if (form?.benefitType === 'free_product') {
    let line = `• Producto gratis: ${form?.freeProductName || '?'}`;
    if (form?.freeProductCondition === 'min_price' && form?.freeProductMinPrice) line += `. Requiere compra mínima de $${form?.freeProductMinPrice} MXN`;
    else if (form?.freeProductCondition === 'buy_product' && form?.freeProductBuyProduct) line += `. Al comprar: ${form?.freeProductBuyProduct}`;
    else if (form?.freeProductCondition === 'buy_category' && form?.freeProductBuyCategory) line += `. Al comprar en la categoría: ${form?.freeProductBuyCategory}`;
    return line + '.';
  }
  if (form?.benefitType === 'bogo') {
    const type = form?.bogoType === '3x2' ? '3×2' : '2×1';
    let line = `• Promoción ${type}`;
    if (form?.bogoAppliesTo === 'product' && form?.bogoProductName) line += ` en ${form?.bogoProductName}`;
    else if (form?.bogoAppliesTo === 'category' && form?.bogoCategoryName) line += ` en la categoría ${form?.bogoCategoryName}`;
    return line + '.';
  }
  if (form?.benefitType === 'upgrade') {
    let line = `• Upgrade gratuito`;
    if (form?.upgradeProductName) line += ` en ${form?.upgradeProductName}`;
    if (form?.upgradeFromVariant && form?.upgradeToVariant) line += `: de ${form?.upgradeFromVariant} a ${form?.upgradeToVariant}`;
    return line + '.';
  }
  if (form?.benefitType === 'free_shipping') {
    let line = `• Envío gratis`;
    if (form?.freeShippingCondition === 'min_amount' && form?.freeShippingMinAmount) line += ` en compras mayores a $${form?.freeShippingMinAmount} MXN`;
    else if (form?.freeShippingCondition === 'product' && form?.freeShippingProduct) line += ` al comprar ${form?.freeShippingProduct}`;
    else if (form?.freeShippingCondition === 'category' && form?.freeShippingCategory) line += ` en la categoría ${form?.freeShippingCategory}`;
    return line + '.';
  }
  if (form?.benefitType === 'cashback_points') {
    let line = `• Cashback de ${form?.cashbackPoints || '?'}x puntos`;
    if (form?.cashbackAppliesTo === 'product' && form?.cashbackProductName) line += ` al comprar ${form?.cashbackProductName}`;
    else if (form?.cashbackAppliesTo === 'category' && form?.cashbackCategoryName) line += ` en la categoría ${form?.cashbackCategoryName}`;
    else line += ` en cualquier compra`;
    return line + '.';
  }
  if (form?.benefitType === 'bundle') {
    const products = (form?.bundleProducts || [])?.filter(p => p?.name);
    let line = `• Bundle/Combo: ${products?.map(p => p?.name)?.join(' + ')}`;
    if (form?.bundleDiscountType === 'special_price' && form?.bundleSpecialPrice) line += ` a precio especial de $${form?.bundleSpecialPrice} MXN`;
    else if (form?.bundleDiscountType === 'discount' && form?.bundleDiscount > 0) line += ` con ${form?.bundleDiscount}% de descuento`;
    return line + '.';
  }
  if (form?.benefitType === 'quantity_discount') {
    let line = `• Descuento por cantidad`;
    if (form?.qtyProductName) line += ` en ${form?.qtyProductName}`;
    if (form?.qtyBuy) {
      if (form?.qtyNextBenefit === 'free') line += `: compra ${form?.qtyBuy} y el siguiente es gratis`;
      else if (form?.qtyNextBenefit === 'discount' && form?.qtyNextDiscount) line += `: compra ${form?.qtyBuy} y el siguiente tiene ${form?.qtyNextDiscount}% de descuento`;
      else if (form?.qtyNextBenefit === 'special_price' && form?.qtyNextSpecialPrice) line += `: compra ${form?.qtyBuy} y el siguiente cuesta $${form?.qtyNextSpecialPrice} MXN`;
    }
    return line + '.';
  }
  if (form?.benefitType === 'fixed_price') {
    let line = `• Precio especial fijo`;
    if (form?.fixedPriceProduct) line += ` en ${form?.fixedPriceProduct}`;
    if (form?.fixedPriceNormal) line += ` (precio catálogo: $${form?.fixedPriceNormal} MXN)`;
    if (form?.fixedPrice) line += `: $${form?.fixedPrice} MXN`;
    return line + '.';
  }
  return '';
};

const resolveMessage = (msg, form) => {
  return msg?.replace(/{nombre_cliente}/g, 'María García')
    ?.replace(/{nombre_negocio}/g, 'Café Roma')
    ?.replace(/{beneficio}/g, getBenefitLabel(form))
    ?.replace(/{fecha_vencimiento}/g, '15 jun 2026')
    ?.replace(/{dias_sin_visitar}/g, String(form?.inactivityDays || 21))
    ?.replace(/{ultima_visita}/g, '10 de mayo')
    ?.replace(/{nombre_promo_favorita}/g, 'promo de café');
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Toggle = ({ value, onChange, color = 'bg-orange-500' }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? color : 'bg-muted'}`}
  >
    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

// ─── Live Preview ─────────────────────────────────────────────────────────────

const CouponLivePreview = ({ form }) => {
  const displayCode = form?.autoCode || 'REC-XXXXXX';
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
          <Icon name="Eye" size={15} className="text-orange-500" />
          Vista previa — Wallet del usuario
        </h3>
        <span className="text-xs text-muted-foreground">En tiempo real</span>
      </div>
      <div className="flex gap-4 flex-wrap">
        {/* Wallet card */}
        <div className="rounded-2xl overflow-hidden shadow-lg border border-border flex-1 min-w-[220px] max-w-xs">
          <div className="relative h-28">
            <img src={form?.selectedImage || TEMPLATE_IMAGES?.[0]?.url} alt="Vista previa del cupón de recuperación" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <div className="text-white font-bold text-lg leading-tight">{getBenefitLabel(form)}</div>
              <div className="text-white/80 text-xs">{form?.title || 'Título del cupón'}</div>
            </div>
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-medium">Recuperación</span>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: form?.accentColor || ACCENT_COLORS?.[0] }} />
            </div>
          </div>
          <div className="bg-card p-3 space-y-2">
            <div className="text-xs text-muted-foreground line-clamp-2">{form?.description || 'Descripción del beneficio aparecerá aquí'}</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-foreground tracking-wider">
                {displayCode?.substring(0, 7)}-**
              </span>
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Icon name="QrCode" size={20} className="text-foreground" />
              </div>
            </div>
            {form?.validityMode === 'from_emission' && form?.validityDays && (
              <div className="text-xs text-muted-foreground">
                Válido {form?.validityDays} días desde que lo recibas
              </div>
            )}
            <div className="h-1 rounded-full" style={{ backgroundColor: form?.accentColor || ACCENT_COLORS?.[0] }} />
          </div>
        </div>

        {/* Right side: trigger + rules summary */}
        <div className="flex-1 min-w-[180px] space-y-2">
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-2.5 flex items-center gap-2">
            <Icon name="Clock" size={13} className="text-orange-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-orange-600">Trigger de inactividad</p>
              <p className="text-xs text-muted-foreground">{form?.inactivityDays || '—'} días sin visitar</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-2.5 space-y-1.5">
            <h4 className="text-xs font-semibold text-foreground">Resumen</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon name={form?.isPersonal ? 'Lock' : 'Unlock'} size={10} className={form?.isPersonal ? 'text-amber-500' : 'text-green-500'} />
                {form?.isPersonal ? 'Personal — no transferible' : 'Transferible'}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon name="Hash" size={10} className="text-purple-500" />
                {form?.usagePerUser === 'unlimited' ? 'Usos ilimitados' : form?.usagePerUser ? `${form?.usagePerUser} uso(s) por usuario` : 'Usos sin definir'}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon name="RefreshCw" size={10} className="text-blue-500" />
                {form?.repeatEnabled ? `Repite hasta ${form?.maxRepeat || '?'}x` : 'Solo 1 vez por cliente'}
              </div>
            </div>
          </div>

          {/* Push notification preview */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Push notification</p>
            <div className="bg-gray-900 rounded-xl p-2.5 flex items-start gap-2">
              <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="UserX" size={12} className="text-white" />
              </div>
              <div>
                <div className="text-white text-xs font-semibold">PromoClub</div>
                <div className="text-gray-300 text-xs leading-tight">
                  {form?.message ? resolveMessage(form?.message, form)?.substring(0, 60) + '...' : 'Te extrañamos, configura el mensaje'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Benefit Rule Fields ──────────────────────────────────────────────────────
const BenefitRuleFields = ({ form, set }) => {
  const inputCls = "w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30";
  const labelCls = "text-xs font-medium text-foreground block mb-1";

  if (form?.benefitType === 'percentage') return (
    <div className="space-y-4 mt-4 pt-4 border-t border-border">
      <div>
        <label className={labelCls}>Porcentaje: <span className="text-orange-600 font-bold">{form?.percentValue || 20}%</span></label>
        <input type="range" min={5} max={90} value={form?.percentValue || 20} onChange={e => set('percentValue', Number(e?.target?.value))} className="w-full accent-orange-500" />
        <div className="flex justify-between text-xs text-muted-foreground"><span>5%</span><span>90%</span></div>
      </div>
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form?.useMaxDiscount || false} onChange={e => set('useMaxDiscount', e?.target?.checked)} className="accent-orange-500 w-4 h-4" />
          <span className="text-sm font-medium text-foreground">Tope máximo de descuento (MXN, opcional)</span>
        </label>
        {form?.useMaxDiscount && (
          <CurrencyInput label="" value={form?.maxDiscount || ''} onChange={v => set('maxDiscount', v)} accentClass="focus:ring-orange-400/30" />
        )}
      </div>
      <div>
        <label className={labelCls}>¿Aplica en?</label>
        <div className="grid grid-cols-3 gap-2">
          {[{ key: 'all', label: 'Todo' }, { key: 'product', label: 'Producto/Servicio' }, { key: 'category', label: 'Categoría' }]?.map(opt => (
            <label key={opt?.key} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs transition-all ${form?.percentAppliesTo === opt?.key ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-border text-foreground hover:border-muted-foreground/40'}`}>
              <input type="radio" name="percentAppliesTo" value={opt?.key} checked={form?.percentAppliesTo === opt?.key} onChange={() => set('percentAppliesTo', opt?.key)} className="accent-orange-500" />
              {opt?.label}
            </label>
          ))}
        </div>
        {form?.percentAppliesTo === 'product' && (
          <div className="mt-2">
            <SearchableProductSelector value={form?.percentProductName || ''} onChange={(name, id) => { set('percentProductName', name); set('percentProductId', id); }} />
          </div>
        )}
        {form?.percentAppliesTo === 'category' && (
          <div className="mt-2">
            <SearchableCategorySelector value={form?.percentCategoryName || ''} onChange={(name, id) => { set('percentCategoryName', name); set('percentCategoryId', id); }} />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form?.percentRequireMinPurchase || false} onChange={e => set('percentRequireMinPurchase', e?.target?.checked)} className="accent-orange-500 w-4 h-4" />
          <span className="text-sm font-medium text-foreground">Requiere compra mínima</span>
        </label>
        {form?.percentRequireMinPurchase && (
          <CurrencyInput label="" value={form?.percentMinPurchase || ''} onChange={v => set('percentMinPurchase', v)} accentClass="focus:ring-orange-400/30" />
        )}
      </div>
    </div>
  );

  if (form?.benefitType === 'fixed') return (
    <div className="space-y-4 mt-4 pt-4 border-t border-border">
      <CurrencyInput label="Monto de descuento (MXN)" value={form?.fixedAmount || ''} onChange={v => set('fixedAmount', v)} accentClass="focus:ring-orange-400/30" />
      <div>
        <label className={labelCls}>¿Aplica en?</label>
        <div className="grid grid-cols-3 gap-2">
          {[{ key: 'all', label: 'Todo' }, { key: 'product', label: 'Producto/Servicio' }, { key: 'category', label: 'Categoría' }]?.map(opt => (
            <label key={opt?.key} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs transition-all ${form?.fixedAppliesTo === opt?.key ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-border text-foreground hover:border-muted-foreground/40'}`}>
              <input type="radio" name="fixedAppliesTo" value={opt?.key} checked={form?.fixedAppliesTo === opt?.key} onChange={() => set('fixedAppliesTo', opt?.key)} className="accent-orange-500" />
              {opt?.label}
            </label>
          ))}
        </div>
        {form?.fixedAppliesTo === 'product' && (
          <div className="mt-2">
            <SearchableProductSelector value={form?.fixedProductName || ''} onChange={(name, id) => { set('fixedProductName', name); set('fixedProductId', id); }} />
          </div>
        )}
        {form?.fixedAppliesTo === 'category' && (
          <div className="mt-2">
            <SearchableCategorySelector value={form?.fixedCategoryName || ''} onChange={(name, id) => { set('fixedCategoryName', name); set('fixedCategoryId', id); }} />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form?.fixedRequireMinPurchase || false} onChange={e => set('fixedRequireMinPurchase', e?.target?.checked)} className="accent-orange-500 w-4 h-4" />
          <span className="text-sm font-medium text-foreground">Requiere compra mínima</span>
        </label>
        {form?.fixedRequireMinPurchase && (
          <CurrencyInput label="" value={form?.fixedMinPurchase || ''} onChange={v => set('fixedMinPurchase', v)} accentClass="focus:ring-orange-400/30" />
        )}
      </div>
    </div>
  );

  if (form?.benefitType === 'free_product') return (
    <div className="space-y-4 mt-4 pt-4 border-t border-border">
      <SearchableProductSelector label="Producto o servicio gratis" value={form?.freeProductName || ''} onChange={(name, id) => { set('freeProductName', name); set('freeProductId', id); }} />
      <div>
        <label className={labelCls}>Condición para obtenerlo</label>
        <div className="space-y-2">
          {[{ key: 'none', label: 'Sin condición' }, { key: 'min_price', label: 'Precio mínimo de compra' }, { key: 'buy_product', label: 'Al comprar otro producto/servicio' }, { key: 'buy_category', label: 'Al comprar en una categoría' }]?.map(opt => (
            <label key={opt?.key} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-sm transition-all ${form?.freeProductCondition === opt?.key ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-border text-foreground hover:border-muted-foreground/40'}`}>
              <input type="radio" name="freeProductCondition" value={opt?.key} checked={form?.freeProductCondition === opt?.key} onChange={() => set('freeProductCondition', opt?.key)} className="accent-orange-500" />
              {opt?.label}
            </label>
          ))}
        </div>
        {form?.freeProductCondition === 'min_price' && <div className="mt-2"><CurrencyInput label="" value={form?.freeProductMinPrice || ''} onChange={v => set('freeProductMinPrice', v)} accentClass="focus:ring-orange-400/30" /></div>}
        {form?.freeProductCondition === 'buy_product' && <div className="mt-2"><SearchableProductSelector value={form?.freeProductBuyProduct || ''} onChange={(name, id) => { set('freeProductBuyProduct', name); set('freeProductBuyProductId', id); }} /></div>}
        {form?.freeProductCondition === 'buy_category' && <div className="mt-2"><SearchableCategorySelector value={form?.freeProductBuyCategory || ''} onChange={(name, id) => { set('freeProductBuyCategory', name); set('freeProductBuyCategoryId', id); }} /></div>}
      </div>
    </div>
  );

  if (form?.benefitType === 'bogo') return (
    <div className="space-y-4 mt-4 pt-4 border-t border-border">
      <div>
        <label className={labelCls}>Tipo de promoción</label>
        <div className="grid grid-cols-2 gap-3">
          {[{ key: '2x1', label: '2×1', desc: 'Compra 1 y lleva 2' }, { key: '3x2', label: '3×2', desc: 'Compra 2 y lleva 3' }]?.map(opt => (
            <label key={opt?.key} className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-all ${form?.bogoType === opt?.key ? 'border-orange-500 bg-orange-50' : 'border-border hover:border-muted-foreground/40'}`}>
              <input type="radio" name="bogoType" value={opt?.key} checked={form?.bogoType === opt?.key} onChange={() => set('bogoType', opt?.key)} className="accent-orange-500 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-foreground">{opt?.label}</div>
                <div className="text-xs text-muted-foreground">{opt?.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className={labelCls}>¿Aplica en?</label>
        <div className="grid grid-cols-2 gap-2">
          {[{ key: 'product', label: 'Producto/Servicio específico' }, { key: 'category', label: 'Categoría' }]?.map(opt => (
            <label key={opt?.key} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-sm transition-all ${form?.bogoAppliesTo === opt?.key ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-border text-foreground hover:border-muted-foreground/40'}`}>
              <input type="radio" name="bogoAppliesTo" value={opt?.key} checked={form?.bogoAppliesTo === opt?.key} onChange={() => set('bogoAppliesTo', opt?.key)} className="accent-orange-500" />
              {opt?.label}
            </label>
          ))}
        </div>
        {form?.bogoAppliesTo === 'product' && <div className="mt-2"><SearchableProductSelector value={form?.bogoProductName || ''} onChange={(name, id) => { set('bogoProductName', name); set('bogoProductId', id); }} /></div>}
        {form?.bogoAppliesTo === 'category' && <div className="mt-2"><SearchableCategorySelector value={form?.bogoCategoryName || ''} onChange={(name, id) => { set('bogoCategoryName', name); set('bogoCategoryId', id); }} /></div>}
      </div>
    </div>
  );

  if (form?.benefitType === 'upgrade') {
    const variants = form?.upgradeVariants || [];
    return (
      <div className="space-y-4 mt-4 pt-4 border-t border-border">
        <SearchableVariableProductSelector
          value={form?.upgradeProductName || ''}
          onSelect={(name, item, fetchedVariants) => {
            set('upgradeProductName', name);
            set('upgradeVariants', fetchedVariants || []);
            set('upgradeFromVariant', '');
            set('upgradeToVariant', '');
          }}
        />
        {form?.upgradeProductName && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Variante origen (desde)</label>
              {variants?.length > 0 ? (
                <select value={form?.upgradeFromVariant || ''} onChange={e => set('upgradeFromVariant', e?.target?.value)} className={inputCls}>
                  <option value="">Seleccionar variante...</option>
                  {variants?.map(v => <option key={v?.id} value={v?.name}>{v?.name}{v?.price ? ` — $${Number(v?.price)?.toFixed(2)}` : ''}</option>)}
                </select>
              ) : (
                <input type="text" value={form?.upgradeFromVariant || ''} onChange={e => set('upgradeFromVariant', e?.target?.value)} className={inputCls} />
              )}
            </div>
            <div>
              <label className={labelCls}>Variante promoción (hasta)</label>
              {variants?.length > 0 ? (
                <select value={form?.upgradeToVariant || ''} onChange={e => set('upgradeToVariant', e?.target?.value)} className={inputCls}>
                  <option value="">Seleccionar variante...</option>
                  {variants?.map(v => <option key={v?.id} value={v?.name}>{v?.name}{v?.price ? ` — $${Number(v?.price)?.toFixed(2)}` : ''}</option>)}
                </select>
              ) : (
                <input type="text" value={form?.upgradeToVariant || ''} onChange={e => set('upgradeToVariant', e?.target?.value)} className={inputCls} />
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (form?.benefitType === 'free_shipping') return (
    <div className="space-y-4 mt-4 pt-4 border-t border-border">
      <div>
        <label className={labelCls}>Condición para envío gratis</label>
        <div className="space-y-2">
          {[{ key: 'always', label: 'Sin condición (siempre gratis)' }, { key: 'min_amount', label: 'Con monto mínimo de compra' }, { key: 'product', label: 'Al comprar un producto/servicio específico' }, { key: 'category', label: 'Al comprar en una categoría específica' }]?.map(opt => (
            <label key={opt?.key} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-sm transition-all ${form?.freeShippingCondition === opt?.key ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-border text-foreground hover:border-muted-foreground/40'}`}>
              <input type="radio" name="freeShippingCondition" value={opt?.key} checked={form?.freeShippingCondition === opt?.key} onChange={() => set('freeShippingCondition', opt?.key)} className="accent-orange-500" />
              {opt?.label}
            </label>
          ))}
        </div>
        {form?.freeShippingCondition === 'min_amount' && <div className="mt-2"><CurrencyInput label="" value={form?.freeShippingMinAmount || ''} onChange={v => set('freeShippingMinAmount', v)} accentClass="focus:ring-orange-400/30" /></div>}
        {form?.freeShippingCondition === 'product' && <div className="mt-2"><SearchableProductSelector value={form?.freeShippingProduct || ''} onChange={(name, id) => { set('freeShippingProduct', name); set('freeShippingProductId', id); }} /></div>}
        {form?.freeShippingCondition === 'category' && <div className="mt-2"><SearchableCategorySelector value={form?.freeShippingCategory || ''} onChange={(name, id) => { set('freeShippingCategory', name); set('freeShippingCategoryId', id); }} /></div>}
      </div>
    </div>
  );

  if (form?.benefitType === 'cashback_points') return (
    <div className="space-y-4 mt-4 pt-4 border-t border-border">
      <div>
        <label className={labelCls}>Multiplicador de puntos: <span className="text-violet-600 font-bold">{form?.cashbackPoints || 2}x</span></label>
        <input type="range" min={2} max={10} value={form?.cashbackPoints || 2} onChange={e => set('cashbackPoints', Number(e?.target?.value))} className="w-full accent-violet-500" />
        <div className="flex justify-between text-xs text-muted-foreground"><span>2x</span><span>10x</span></div>
      </div>
      <div>
        <label className={labelCls}>¿Aplica en?</label>
        <div className="space-y-2">
          {[{ key: 'all', label: 'Todos los productos/categorías' }, { key: 'product', label: 'Producto/Servicio específico' }, { key: 'category', label: 'Categoría específica' }]?.map(opt => (
            <label key={opt?.key} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-sm transition-all ${form?.cashbackAppliesTo === opt?.key ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-border text-foreground hover:border-muted-foreground/40'}`}>
              <input type="radio" name="cashbackAppliesTo" value={opt?.key} checked={form?.cashbackAppliesTo === opt?.key} onChange={() => set('cashbackAppliesTo', opt?.key)} className="accent-orange-500" />
              {opt?.label}
            </label>
          ))}
        </div>
        {form?.cashbackAppliesTo === 'product' && <div className="mt-2"><SearchableProductSelector value={form?.cashbackProductName || ''} onChange={(name, id) => { set('cashbackProductName', name); set('cashbackProductId', id); }} /></div>}
        {form?.cashbackAppliesTo === 'category' && <div className="mt-2"><SearchableCategorySelector value={form?.cashbackCategoryName || ''} onChange={(name, id) => { set('cashbackCategoryName', name); set('cashbackCategoryId', id); }} /></div>}
      </div>
    </div>
  );

  if (form?.benefitType === 'bundle') {
    const products = form?.bundleProducts || [{ id: null, name: '', price: '' }, { id: null, name: '', price: '' }];
    const totalValue = products?.reduce((s, p) => s + (Number(p?.price) || 0), 0);
    const updateProduct = (idx, field, val) => {
      const updated = products?.map((p, i) => i === idx ? { ...p, [field]: val } : p);
      set('bundleProducts', updated);
    };
    return (
      <div className="space-y-4 mt-4 pt-4 border-t border-border">
        <div>
          <label className={labelCls}>Productos del combo</label>
          <div className="space-y-3">
            {products?.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-6 h-6 bg-rose-100 text-rose-700 text-xs rounded-full flex items-center justify-center font-bold flex-shrink-0">{idx + 1}</span>
                <div className="flex-1">
                  <SearchableProductSelector value={p?.name || ''} onChange={(name, item) => { updateProduct(idx, 'name', name); if (item?.price != null) updateProduct(idx, 'price', String(Number(item?.price)?.toFixed(2))); }} />
                </div>
                {products?.length > 2 && (
                  <button type="button" onClick={() => set('bundleProducts', products?.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                    <Icon name="X" size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={() => set('bundleProducts', [...products, { id: null, name: '', price: '' }])} className="mt-3 w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-rose-400 hover:text-rose-600 transition-all">
            <Icon name="Plus" size={14} />
            Agregar producto al combo
          </button>
        </div>
        {totalValue > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-rose-800 mb-1">Total de productos del combo</p>
            <p className="text-lg font-bold text-rose-700">${totalValue?.toFixed(2)} <span className="text-sm font-normal">MXN</span></p>
          </div>
        )}
        <div>
          <label className={labelCls}>Aplicar al combo</label>
          <div className="space-y-2">
            {[{ key: 'discount', label: 'Descuento porcentual sobre el combo' }, { key: 'special_price', label: 'Precio especial fijo para el combo' }]?.map(opt => (
              <label key={opt?.key} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-sm transition-all ${form?.bundleDiscountType === opt?.key ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-border text-foreground hover:border-muted-foreground/40'}`}>
                <input type="radio" name="bundleDiscountType" value={opt?.key} checked={form?.bundleDiscountType === opt?.key} onChange={() => set('bundleDiscountType', opt?.key)} className="accent-orange-500" />
                {opt?.label}
              </label>
            ))}
          </div>
          {form?.bundleDiscountType === 'discount' && (
            <div className="mt-3">
              <label className={labelCls}>Descuento del combo: <span className="text-rose-600 font-bold">{form?.bundleDiscount || 0}%</span></label>
              <input type="range" min={0} max={60} value={form?.bundleDiscount || 0} onChange={e => set('bundleDiscount', Number(e?.target?.value))} className="w-full accent-rose-500" />
            </div>
          )}
          {form?.bundleDiscountType === 'special_price' && (
            <div className="mt-3">
              <CurrencyInput label="Precio especial del combo" value={form?.bundleSpecialPrice || ''} onChange={v => set('bundleSpecialPrice', v)} accentClass="focus:ring-rose-400/30" />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (form?.benefitType === 'quantity_discount') return (
    <div className="space-y-4 mt-4 pt-4 border-t border-border">
      <SearchableProductSelector label="Producto/Servicio específico" value={form?.qtyProductName || ''} onChange={(name, id) => { set('qtyProductName', name); set('qtyProductId', id); }} />
      <div>
        <label className={labelCls}>Compra <span className="text-indigo-600 font-bold">{form?.qtyBuy || 3}</span> unidades y el siguiente:</label>
        <input type="range" min={2} max={20} value={form?.qtyBuy || 3} onChange={e => set('qtyBuy', Number(e?.target?.value))} className="w-full accent-indigo-500" />
        <div className="flex justify-between text-xs text-muted-foreground"><span>2</span><span>20</span></div>
      </div>
      <div>
        <label className={labelCls}>Beneficio en el siguiente</label>
        <div className="space-y-2">
          {[{ key: 'free', label: 'Es gratis' }, { key: 'discount', label: 'Tiene un descuento' }, { key: 'special_price', label: 'Tiene un precio especial' }]?.map(opt => (
            <label key={opt?.key} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-sm transition-all ${form?.qtyNextBenefit === opt?.key ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-border text-foreground hover:border-muted-foreground/40'}`}>
              <input type="radio" name="qtyNextBenefit" value={opt?.key} checked={form?.qtyNextBenefit === opt?.key} onChange={() => set('qtyNextBenefit', opt?.key)} className="accent-orange-500" />
              {opt?.label}
            </label>
          ))}
        </div>
        {form?.qtyNextBenefit === 'discount' && <div className="mt-2"><input type="number" min={1} max={100} value={form?.qtyNextDiscount || ''} onChange={e => set('qtyNextDiscount', e?.target?.value)} className="w-24 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30" /></div>}
        {form?.qtyNextBenefit === 'special_price' && <div className="mt-2"><CurrencyInput label="" value={form?.qtyNextSpecialPrice || ''} onChange={v => set('qtyNextSpecialPrice', v)} accentClass="focus:ring-orange-400/30" /></div>}
      </div>
    </div>
  );

  if (form?.benefitType === 'fixed_price') return (
    <div className="space-y-4 mt-4 pt-4 border-t border-border">
      <SearchableProductSelector
        label="Producto/Servicio del catálogo"
        value={form?.fixedPriceProduct || ''}
        onChange={(name, item) => {
          set('fixedPriceProduct', name);
          if (item?.price) set('fixedPriceNormal', String(Number(item?.price)?.toFixed(2)));
        }}
      />
      {form?.fixedPriceNormal && (
        <div className="p-3 bg-muted/40 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground">Precio del catálogo</p>
          <p className="text-sm font-bold text-foreground">${form?.fixedPriceNormal} MXN</p>
        </div>
      )}
      <CurrencyInput label="Precio especial (MXN)" value={form?.fixedPrice || ''} onChange={v => set('fixedPrice', v)} accentClass="focus:ring-orange-400/30" />
    </div>
  );

  return null;
};

// ─── Escalation Row ───────────────────────────────────────────────────────────
const EscalationRow = ({ row, index, onChange, onRemove, canRemove }) => (
  <div className="border border-border rounded-xl p-4 bg-muted/20 relative">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{index + 1}</div>
        <span className="text-sm font-medium text-foreground">Envío {index + 1}</span>
        {index === 0 && <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">Primer intento</span>}
        {index === 1 && <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">Si no canjeó</span>}
        {index === 2 && <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">Último recurso</span>}
      </div>
      {canRemove && (
        <button onClick={onRemove} className="text-muted-foreground hover:text-destructive transition-colors">
          <Icon name="X" size={16} />
        </button>
      )}
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div>
        <label className="text-xs font-medium text-foreground block mb-1">Días sin visitar</label>
        <div className="flex items-center gap-1">
          <input type="number" min={7} max={180} value={row?.days} onChange={e => onChange('days', Number(e?.target?.value))} className="w-full px-2 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">días</span>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-foreground block mb-1">Tipo de beneficio</label>
        <select value={row?.benefitType} onChange={e => onChange('benefitType', e?.target?.value)} className="w-full px-2 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none">
          {[{ key: 'percentage', label: '% Descuento' }, { key: 'fixed', label: 'Monto fijo' }, { key: 'free_product', label: 'Producto gratis' }, { key: 'bonus_points', label: 'Puntos bonus' }]?.map(o => <option key={o?.key} value={o?.key}>{o?.label}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-foreground block mb-1">Valor</label>
        <input type="text" value={row?.value} onChange={e => onChange('value', e?.target?.value)} className="w-full px-2 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30" />
      </div>
      <div>
        <label className="text-xs font-medium text-foreground block mb-1">Canal</label>
        <select value={row?.channel} onChange={e => onChange('channel', e?.target?.value)} className="w-full px-2 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none">
          {[{ key: 'push', label: 'Push' }, { key: 'email', label: 'Email' }, { key: 'whatsapp', label: 'WhatsApp' }, { key: 'all', label: 'Todos' }]?.map(o => <option key={o?.key} value={o?.key}>{o?.label}</option>)}
        </select>
      </div>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const NuevoCuponRecuperacionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('trigger');
  const [establishments, setEstablishments] = useState([]);
  const [selectedEstablishments, setSelectedEstablishments] = useState([]);

  const [form, setForm] = useState({
    // Inactivity trigger
    inactivityDays: null,
    skipIfFlowReceived: false,

    // Benefit
    benefitType: null,
    percentValue: 20,
    useMaxDiscount: false,
    maxDiscount: '',
    percentAppliesTo: '',
    percentProductName: '',
    percentCategoryName: '',
    percentRequireMinPurchase: false,
    percentMinPurchase: '',
    fixedAmount: '',
    fixedAppliesTo: '',
    fixedProductName: '',
    fixedCategoryName: '',
    fixedRequireMinPurchase: false,
    fixedMinPurchase: '',
    freeProductName: '',
    freeProductCondition: '',
    freeProductMinPrice: '',
    freeProductBuyProduct: '',
    freeProductBuyCategory: '',
    bogoType: '',
    bogoAppliesTo: '',
    bogoProductName: '',
    bogoCategoryName: '',
    upgradeProductName: '',
    upgradeVariants: [],
    upgradeFromVariant: '',
    upgradeToVariant: '',
    freeShippingCondition: '',
    freeShippingMinAmount: '',
    freeShippingProduct: '',
    freeShippingCategory: '',
    cashbackPoints: 2,
    cashbackAppliesTo: '',
    cashbackProductName: '',
    cashbackCategoryName: '',
    bundleProducts: [{ id: null, name: '', price: '' }, { id: null, name: '', price: '' }],
    bundleDiscountType: '',
    bundleDiscount: 0,
    bundleSpecialPrice: '',
    qtyProductName: '',
    qtyBuy: 3,
    qtyNextBenefit: '',
    qtyNextDiscount: '',
    qtyNextSpecialPrice: '',
    fixedPrice: '',
    fixedPriceProduct: '',
    fixedPriceNormal: '',

    // Visual identity
    title: '',
    description: '',
    selectedImage: null,
    accentColor: null,
    autoCode: generateCode(),

    // Message
    message: '¡Te extrañamos, {nombre_cliente}! Llevas {dias_sin_visitar} días sin visitarnos. Tu última visita fue el {ultima_visita}. Aquí va un {beneficio} especial para tu regreso. Válido hasta {fecha_vencimiento}.',
    channel: '',

    // Validity
    validityMode: '',
    validityDays: 7,
    validFrom: '',
    validUntil: '',
    requireMinPurchase: false,
    minPurchase: '',

    // Escalation
    escalationEnabled: false,
    escalationRows: [
      { days: 21, benefitType: 'percentage', value: '15%', channel: 'push' },
      { days: 35, benefitType: 'percentage', value: '20%', channel: 'push' },
    ],

    // Repetition
    repeatEnabled: false,
    maxRepeat: 3,
    waitDaysBeforeRepeat: 45,

    // Eligibility
    minVisits: 1,
    vipLevels: [],
    crmSegment: '',

    // Budget
    monthlyBudget: '',
    budgetEnabled: false,

    // Rules
    usagePerUser: '',
    validEstablishments: '',
    validEstablishmentsList: '',
    customerSegmentType: '',
    customSegmentDesc: '',
    isPersonal: false,
    combineWithPromos: false,
    combineWithCoupons: false,
    excludedProducts: '',
    termsCustomText: '',
  });

  const set = useCallback((key, val) => setForm(prev => ({ ...prev, [key]: val })), []);

  const clientsMatchingCriteria = form?.inactivityDays ? Math.max(0, Math.round(180 - (form?.inactivityDays - 7) * 2.1)) : 0;

  const updateEscalationRow = (index, field, value) => {
    setForm(prev => {
      const rows = [...prev?.escalationRows];
      rows[index] = { ...rows?.[index], [field]: value };
      return { ...prev, escalationRows: rows };
    });
  };

  const addEscalationRow = () => {
    if (form?.escalationRows?.length >= 5) return;
    const lastDays = form?.escalationRows?.[form?.escalationRows?.length - 1]?.days || 21;
    setForm(prev => ({
      ...prev,
      escalationRows: [...prev?.escalationRows, { days: lastDays + 15, benefitType: 'percentage', value: '', channel: 'push' }],
    }));
  };

  const removeEscalationRow = (index) => {
    setForm(prev => ({ ...prev, escalationRows: prev?.escalationRows?.filter((_, i) => i !== index) }));
  };

  const generateTerms = () => {
    const lines = [];
    const benefitLine = getBenefitTermsLine(form);
    if (benefitLine) lines?.push(benefitLine);
    if (form?.validityMode === 'from_emission') {
      lines?.push(`• Válido por ${form?.validityDays} días desde la fecha de emisión.`);
    } else if (form?.validFrom && form?.validUntil) {
      lines?.push(`• Válido del ${new Date(form.validFrom)?.toLocaleDateString('es-MX')} al ${new Date(form.validUntil)?.toLocaleDateString('es-MX')}.`);
    }
    if (form?.usagePerUser) lines?.push(`• Cada usuario tiene derecho a ${form?.usagePerUser === 'unlimited' ? 'usos ilimitados' : `${form?.usagePerUser} uso(s)`} de este cupón.`);
    if (form?.requireMinPurchase && form?.minPurchase) lines?.push(`• Aplica en compras mínimas de $${form?.minPurchase} MXN.`);
    if (form?.validEstablishments === 'specific' && form?.validEstablishmentsList) {
      lines?.push(`• Válido únicamente en: ${form?.validEstablishmentsList}.`);
    } else if (form?.validEstablishments === 'all') {
      lines?.push(`• Válido en todos los establecimientos participantes.`);
    }
    lines?.push(form?.isPersonal ? `• Cupón personal e intransferible.` : `• Cupón transferible.`);
    lines?.push(form?.combineWithPromos ? `• Aplica en combinación con otras promociones vigentes.` : `• No aplica en combinación con otras promociones.`);
    if (!form?.combineWithCoupons) lines?.push(`• No acumulable con otros cupones en la misma compra.`);
    lines?.push(`• El negocio se reserva el derecho de modificar o cancelar esta promoción en cualquier momento.`);
    set('termsCustomText', lines?.join('\n'));
  };

  const handleSave = (publish) => {
    navigate('/coupons-management');
  };

  const userDisplay = {
    name: user?.user_metadata?.full_name || user?.email || 'Usuario',
    email: user?.email || '',
    role: user?.user_metadata?.role || 'owner',
  };

  useEffect(() => {
    const fetchEstablishments = async () => {
      if (!user?.id) return;
      try {
        const { data: profile } = await supabase?.from('user_profiles')?.select('user_id')?.eq('id', user?.id)?.single();
        const businessId = profile?.user_id || user?.id;
        const { data: estData } = await supabase?.from('business_locations')?.select('id, location_name, location_code, is_active')?.eq('business_id', businessId)?.eq('is_active', true)?.order('location_name', { ascending: true });
        setEstablishments(estData || []);
      } catch (err) {
        console.error('Error loading establishments:', err);
      }
    };
    fetchEstablishments();
  }, [user?.id]);

  const mainClasses = `pt-16 transition-all duration-500 ease-in-out relative z-10 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`;

  const currentTabIndex = TABS?.findIndex(t => t?.id === activeTab);
  const canGoNext = currentTabIndex < TABS?.length - 1;
  const canGoPrev = currentTabIndex > 0;

  // ── TAB RENDERERS ─────────────────────────────────────────────────────────

  const renderTriggerTab = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
          <span className="w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">1</span>
          Trigger de inactividad
        </h3>
        <p className="text-xs text-muted-foreground ml-8">Define cuántos días sin visitar activan el envío del cupón</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-foreground">
            Enviar cuando el cliente lleva{' '}
            <span className="text-orange-600 font-bold text-lg">{form?.inactivityDays || '—'}</span>{' '}
            días sin visitar
          </label>
        </div>
        <input
          type="range" min={7} max={90} value={form?.inactivityDays || 21}
          onChange={e => set('inactivityDays', Number(e?.target?.value))}
          className="w-full accent-orange-500 mb-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground mb-3">
          <span>7 días</span><span>90 días</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {INACTIVITY_PILLS?.map(p => (
            <button
              key={p?.days}
              onClick={() => set('inactivityDays', p?.days)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                form?.inactivityDays === p?.days ? p?.color + ' shadow-sm' : 'border-border text-muted-foreground hover:border-muted-foreground/50'
              }`}
            >
              {p?.label} <span className="opacity-70">({p?.tag})</span>
            </button>
          ))}
        </div>

        {form?.inactivityDays && (
          <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">{clientsMatchingCriteria}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-orange-900">
                Actualmente <strong>{clientsMatchingCriteria} clientes</strong> cumplen este criterio
              </p>
              <p className="text-xs text-orange-700">Este número se actualiza al mover el slider</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl">
        <div className="flex items-start gap-2 mb-3">
          <Icon name="AlertTriangle" size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Conflicto con flow de reactivación</p>
            <p className="text-xs text-amber-800 mt-0.5">
              Si tienes un flow de reactivación activo, el cupón y el flow pueden enviarse al mismo cliente. Define cuál tiene prioridad.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between p-2 bg-white border border-amber-200 rounded-lg">
          <div>
            <p className="text-xs font-medium text-foreground">No enviar si el cliente ya recibió el flow de reactivación</p>
            <p className="text-xs text-muted-foreground">Evita saturar al cliente con dos mensajes similares</p>
          </div>
          <Toggle value={form?.skipIfFlowReceived} onChange={v => set('skipIfFlowReceived', v)} />
        </div>
      </div>
    </div>
  );

  const renderBenefitTab = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
          <span className="w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">2</span>
          Tipo de beneficio
        </h3>
        <p className="text-xs text-muted-foreground ml-8">Elige qué recibirá el cliente al regresar</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {BENEFIT_TYPES?.map(bt => (
          <button
            key={bt?.key}
            type="button"
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
      {form?.benefitType && <BenefitRuleFields form={form} set={set} />}
    </div>
  );

  const renderIdentityTab = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
          <span className="w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">3</span>
          Identidad visual
        </h3>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Título del cupón <span className="text-muted-foreground text-xs">({form?.title?.length}/40)</span></label>
        <input type="text" maxLength={40} value={form?.title} onChange={e => set('title', e?.target?.value)} placeholder="Ej: ¡Te extrañamos! Regresa con este descuento" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Descripción <span className="text-muted-foreground text-xs">({form?.description?.length}/120)</span></label>
        <textarea maxLength={120} value={form?.description} onChange={e => set('description', e?.target?.value)} rows={2} placeholder="Ej: Sabemos que nos extrañas. Aquí va un beneficio especial para motivar tu regreso." className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 resize-none" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Imagen del cupón</label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {TEMPLATE_IMAGES?.map(img => (
            <button key={img?.key} type="button" onClick={() => set('selectedImage', img?.url)} className={`relative rounded-lg overflow-hidden h-14 border-2 transition-all ${form?.selectedImage === img?.url ? 'border-orange-500 shadow-md' : 'border-transparent hover:border-muted-foreground/40'}`}>
              <img src={img?.url} alt={`Template ${img?.label}`} className="w-full h-full object-cover" />
              {form?.selectedImage === img?.url && <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center"><Icon name="Check" size={14} className="text-white" /></div>}
              <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs text-center py-0.5">{img?.label}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Color de acento</label>
        <div className="flex gap-2 flex-wrap">
          {ACCENT_COLORS?.map(color => (
            <button key={color} type="button" onClick={() => set('accentColor', color)} className={`w-7 h-7 rounded-full border-2 transition-all ${form?.accentColor === color ? 'border-foreground scale-110 shadow-md' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: color }} title={color} />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
        <span className="font-mono text-base font-bold text-foreground tracking-widest">{form?.autoCode}</span>
        <Button variant="ghost" size="sm" onClick={() => set('autoCode', generateCode())} iconName="RefreshCw" iconPosition="left">Regenerar</Button>
      </div>
    </div>
  );

  const renderMessageTab = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
          <span className="w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">4</span>
          Mensaje para el cliente
        </h3>
        <p className="text-xs text-muted-foreground ml-8">Personaliza el mensaje con variables dinámicas</p>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Mensaje personalizable</label>
        <textarea
          value={form?.message}
          onChange={e => set('message', e?.target?.value)}
          rows={4}
          placeholder="Ej: ¡Te extrañamos, {nombre_cliente}! Llevas {dias_sin_visitar} días sin visitarnos. Tu última visita fue el {ultima_visita}. Aquí va un {beneficio} especial para tu regreso. Válido hasta {fecha_vencimiento}."
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 resize-none"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {['{nombre_cliente}', '{beneficio}', '{fecha_vencimiento}', '{dias_sin_visitar}', '{ultima_visita}', '{nombre_promo_favorita}']?.map(v => (
            <button key={v} onClick={() => set('message', form?.message + v)} className="px-2 py-0.5 bg-orange-50 border border-orange-200 text-orange-700 text-xs rounded-full hover:bg-orange-100 transition-colors font-mono">
              {v}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Canal de envío</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[{ key: 'push', label: 'Push', icon: 'Bell' }, { key: 'email', label: 'Email', icon: 'Mail' }, { key: 'whatsapp', label: 'WhatsApp', icon: 'MessageCircle' }, { key: 'wallet', label: 'Wallet', icon: 'Wallet' }]?.map(ch => (
            <label key={ch?.key} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${form?.channel === ch?.key ? 'border-orange-500 bg-orange-50' : 'border-border hover:border-muted-foreground/40'}`}>
              <input type="radio" name="channel" value={ch?.key} checked={form?.channel === ch?.key} onChange={() => set('channel', ch?.key)} className="accent-orange-500" />
              <Icon name={ch?.icon} size={14} className="text-muted-foreground" />
              <span className="text-sm text-foreground">{ch?.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Preview en tiempo real</label>
        <div className="bg-gray-900 rounded-2xl p-3 border border-gray-700">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon name="UserX" size={14} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-white text-xs font-semibold">PromoClub</span>
                <span className="text-gray-400 text-xs">ahora</span>
              </div>
              <p className="text-gray-200 text-xs mt-0.5 leading-relaxed">
                {resolveMessage(form?.message, form)?.substring(0, 120)}{resolveMessage(form?.message, form)?.length > 120 ? '...' : ''}
              </p>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">Las variables se muestran con datos de ejemplo</p>
      </div>
    </div>
  );

  const renderValidityTab = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
          <span className="w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">5</span>
          Vigencia y condiciones
        </h3>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Modo de vigencia</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { key: 'from_emission', label: 'Desde emisión (recomendado)', desc: 'Válido X días desde que se envía al cliente.' },
            { key: 'fixed_dates', label: 'Fechas fijas', desc: 'Fecha de inicio y fin específicas para todos.' },
          ]?.map(opt => (
            <label key={opt?.key} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form?.validityMode === opt?.key ? 'border-orange-500 bg-orange-50' : 'border-border hover:border-muted-foreground/30'}`}>
              <input type="radio" name="validityMode" value={opt?.key} checked={form?.validityMode === opt?.key} onChange={() => set('validityMode', opt?.key)} className="accent-orange-500 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">{opt?.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt?.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
      {form?.validityMode === 'from_emission' && (
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">
            Válido <span className="text-orange-600 font-bold">{form?.validityDays}</span> días desde que se envía al cliente
          </label>
          <input type="range" min={1} max={30} value={form?.validityDays} onChange={e => set('validityDays', Number(e?.target?.value))} className="w-full accent-orange-500 mb-1" />
          <div className="flex justify-between text-xs text-muted-foreground"><span>1 día</span><span>30 días</span></div>
        </div>
      )}
      {form?.validityMode === 'fixed_dates' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Válido desde</label>
            <input type="date" value={form?.validFrom} onChange={e => set('validFrom', e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Válido hasta</label>
            <input type="date" value={form?.validUntil} onChange={e => set('validUntil', e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30" />
          </div>
        </div>
      )}
      <div className="border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Monto mínimo de compra</p>
            <p className="text-xs text-muted-foreground mt-0.5">Asegura que el cliente que regresa haga una compra real</p>
          </div>
          <Toggle value={form?.requireMinPurchase} onChange={v => set('requireMinPurchase', v)} />
        </div>
        {form?.requireMinPurchase && (
          <CurrencyInput label="Monto mínimo (MXN)" value={form?.minPurchase || ''} onChange={v => set('minPurchase', v)} accentClass="focus:ring-orange-400/30" />
        )}
      </div>
    </div>
  );

  const renderEscalationTab = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
            <span className="w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">6</span>
            Escalada de incentivo
          </h3>
          <p className="text-xs text-muted-foreground ml-8">Si el primer cupón no trajo al cliente, el segundo es más generoso</p>
        </div>
        <Toggle value={form?.escalationEnabled} onChange={v => set('escalationEnabled', v)} />
      </div>
      {form?.escalationEnabled ? (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
            <Icon name="Info" size={12} className="inline mr-1" />
            Si el cliente canjea en cualquier escalón, la secuencia se detiene.
          </div>
          {form?.escalationRows?.map((row, i) => (
            <EscalationRow key={i} row={row} index={i} onChange={(field, value) => updateEscalationRow(i, field, value)} onRemove={() => removeEscalationRow(i)} canRemove={form?.escalationRows?.length > 1} />
          ))}
          {form?.escalationRows?.length < 5 && (
            <button onClick={addEscalationRow} className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-orange-400 hover:text-orange-600 transition-all">
              <Icon name="Plus" size={16} />
              Agregar escalón
            </button>
          )}
        </div>
      ) : (
        <div className="p-4 bg-muted/30 rounded-xl text-center">
          <Icon name="Layers" size={24} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Activa la escalada para convertir el cupón en un sistema de recuperación progresivo</p>
        </div>
      )}

      {/* Repetition */}
      <div className="border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Comportamiento de repetición</p>
            <p className="text-xs text-muted-foreground mt-0.5">¿Repetir si el cliente vuelve a dormirse?</p>
          </div>
          <Toggle value={form?.repeatEnabled} onChange={v => set('repeatEnabled', v)} />
        </div>
        {form?.repeatEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Máximo <span className="text-orange-600 font-bold">{form?.maxRepeat}</span> veces por cliente
              </label>
              <input type="range" min={1} max={10} value={form?.maxRepeat} onChange={e => set('maxRepeat', Number(e?.target?.value))} className="w-full accent-orange-500 mb-1" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>1 vez</span><span>10 veces</span></div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Esperar <span className="text-orange-600 font-bold">{form?.waitDaysBeforeRepeat}</span> días antes de repetir
              </label>
              <input type="range" min={7} max={180} value={form?.waitDaysBeforeRepeat} onChange={e => set('waitDaysBeforeRepeat', Number(e?.target?.value))} className="w-full accent-orange-500 mb-1" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>7 días</span><span>180 días</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderEligibilityTab = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
          <span className="w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">7</span>
          Condición de elegibilidad
        </h3>
        <p className="text-xs text-muted-foreground ml-8">No todos los clientes dormidos merecen el mismo esfuerzo de recuperación</p>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">
          Solo enviar a clientes que visitaron al menos{' '}
          <span className="text-orange-600 font-bold">{form?.minVisits}</span> veces antes de dormirse
        </label>
        <input type="range" min={1} max={20} value={form?.minVisits} onChange={e => set('minVisits', Number(e?.target?.value))} className="w-full accent-orange-500 mb-1" />
        <div className="flex justify-between text-xs text-muted-foreground"><span>1 visita</span><span>20 visitas</span></div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Nivel VIP antes de dormirse</label>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'bronze', label: 'Solo Bronce+', color: 'bg-amber-100 text-amber-700 border-amber-300' },
            { key: 'silver', label: 'Solo Plata+', color: 'bg-gray-100 text-gray-600 border-gray-300' },
            { key: 'gold', label: 'Solo Oro', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
            { key: 'all', label: 'Todos los niveles', color: 'bg-green-100 text-green-700 border-green-300' },
          ]?.map(v => {
            const isSelected = form?.vipLevels?.includes(v?.key);
            return (
              <button key={v?.key} onClick={() => {
                if (v?.key === 'all') {
                  set('vipLevels', isSelected ? [] : ['all']);
                } else {
                  const filtered = form?.vipLevels?.filter(x => x !== 'all');
                  set('vipLevels', isSelected ? filtered?.filter(x => x !== v?.key) : [...filtered, v?.key]);
                }
              }} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${isSelected ? v?.color + ' shadow-sm' : 'border-border text-muted-foreground hover:border-muted-foreground/50'}`}>
                {v?.label}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Segmento CRM</label>
        <select value={form?.crmSegment} onChange={e => set('crmSegment', e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none">
          <option value="">Todos los segmentos</option>
          {['Clientes frecuentes', 'Clientes de alto valor', 'Clientes nuevos', 'Segmento café lovers', 'Segmento fin de semana']?.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {/* Budget */}
      <div className="border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Presupuesto mensual</p>
            <p className="text-xs text-muted-foreground mt-0.5">Controla el costo total del sistema de recuperación</p>
          </div>
          <Toggle value={form?.budgetEnabled} onChange={v => set('budgetEnabled', v)} />
        </div>
        {form?.budgetEnabled && (
          <CurrencyInput label="Presupuesto mensual máximo (MXN)" value={form?.monthlyBudget || ''} onChange={v => set('monthlyBudget', v)} accentClass="focus:ring-orange-400/30" />
        )}
      </div>
    </div>
  );

  const renderRulesTab = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
          <span className="w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">8</span>
          Reglas y condiciones
        </h3>
      </div>

      {/* Cantidad por usuario */}
      <div className="border border-border rounded-xl p-4">
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Icon name="Hash" size={15} className="text-orange-500" />
          Cantidad de cupones por usuario
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[{ value: '1', label: '1 uso' }, { value: '2', label: '2 usos' }, { value: '3', label: '3 usos' }, { value: 'unlimited', label: 'Ilimitado' }]?.map(opt => (
            <label key={opt?.value} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${form?.usagePerUser === opt?.value ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-border text-foreground hover:border-muted-foreground/40'}`}>
              <input type="radio" name="usagePerUser" value={opt?.value} checked={form?.usagePerUser === opt?.value} onChange={() => set('usagePerUser', opt?.value)} className="accent-orange-500" />
              <span className="text-sm font-medium">{opt?.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Establecimientos */}
      <div className="border border-border rounded-xl p-4">
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Icon name="MapPin" size={15} className="text-orange-500" />
          Establecimientos donde es válido
        </p>
        <div className="space-y-2">
          {[{ key: 'all', label: 'Todos los establecimientos', desc: 'Válido en cualquier sucursal del negocio' }, { key: 'specific', label: 'Establecimientos específicos', desc: 'Solo aplica en las sucursales que indiques' }]?.map(opt => (
            <label key={opt?.key} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${form?.validEstablishments === opt?.key ? 'border-orange-500 bg-orange-50' : 'border-border hover:border-muted-foreground/40'}`}>
              <input type="radio" name="validEstablishments" value={opt?.key} checked={form?.validEstablishments === opt?.key} onChange={() => set('validEstablishments', opt?.key)} className="mt-0.5 accent-orange-500" />
              <div>
                <div className="text-sm font-medium text-foreground">{opt?.label}</div>
                <div className="text-xs text-muted-foreground">{opt?.desc}</div>
              </div>
            </label>
          ))}
          {form?.validEstablishments === 'specific' && (
            <div className="mt-2">
              <textarea value={form?.validEstablishmentsList} onChange={e => set('validEstablishmentsList', e?.target?.value)} rows={2} placeholder="Ej: Sucursal Centro, Sucursal Norte, Sucursal Polanco" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 resize-none" />
              <p className="text-xs text-muted-foreground mt-1">Separa los establecimientos con comas.</p>
            </div>
          )}
        </div>
      </div>

      {/* Segmento */}
      <div className="border border-border rounded-xl p-4">
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Icon name="Users" size={15} className="text-orange-500" />
          Segmento / Tipo de clientes
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[{ key: 'all', label: 'Todos los clientes', icon: 'Users' }, { key: 'new', label: 'Clientes nuevos', icon: 'UserPlus' }, { key: 'vip', label: 'Clientes VIP', icon: 'Crown' }, { key: 'custom', label: 'Segmento personalizado', icon: 'Filter' }]?.map(opt => (
            <label key={opt?.key} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${form?.customerSegmentType === opt?.key ? 'border-orange-500 bg-orange-50' : 'border-border hover:border-muted-foreground/40'}`}>
              <input type="radio" name="customerSegmentType" value={opt?.key} checked={form?.customerSegmentType === opt?.key} onChange={() => set('customerSegmentType', opt?.key)} className="accent-orange-500" />
              <Icon name={opt?.icon} size={14} className="text-muted-foreground" />
              <span className="text-sm text-foreground">{opt?.label}</span>
            </label>
          ))}
        </div>
        {form?.customerSegmentType === 'custom' && (
          <div className="mt-2">
            <input type="text" value={form?.customSegmentDesc} onChange={e => set('customSegmentDesc', e?.target?.value)} placeholder="Ej: Clientes que no han visitado en más de 30 días y tienen nivel Bronce" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30" />
          </div>
        )}
      </div>

      {/* Transferibilidad */}
      <div className="border border-border rounded-xl p-4">
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Icon name="ArrowLeftRight" size={15} className="text-orange-500" />
          Transferibilidad del cupón
        </p>
        <div className="grid grid-cols-2 gap-2">
          <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${!form?.isPersonal ? 'border-green-400 bg-green-50' : 'border-border hover:border-muted-foreground/40'}`}>
            <input type="radio" name="transferability" checked={!form?.isPersonal} onChange={() => set('isPersonal', false)} className="mt-0.5 accent-orange-500" />
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Icon name="Unlock" size={13} className="text-green-600" />
                <span className="text-sm font-medium text-foreground">Transferible</span>
              </div>
              <p className="text-xs text-muted-foreground">Puede compartirse con otras personas.</p>
            </div>
          </label>
          <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${form?.isPersonal ? 'border-amber-400 bg-amber-50' : 'border-border hover:border-muted-foreground/40'}`}>
            <input type="radio" name="transferability" checked={form?.isPersonal} onChange={() => set('isPersonal', true)} className="mt-0.5 accent-orange-500" />
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Icon name="Lock" size={13} className="text-amber-600" />
                <span className="text-sm font-medium text-foreground">Intransferible</span>
              </div>
              <p className="text-xs text-muted-foreground">Solo válido para el usuario asignado.</p>
            </div>
          </label>
        </div>
      </div>

      {/* Combinabilidad */}
      <div className="border border-border rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Icon name="Layers" size={15} className="text-orange-500" />
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
      </div>

      {/* Productos excluidos */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Productos o categorías excluidas</label>
        <textarea value={form?.excludedProducts} onChange={e => set('excludedProducts', e?.target?.value)} rows={2} placeholder="Ej: Bebidas alcohólicas, Productos en oferta, Menú del día" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 resize-none" />
        <p className="text-xs text-muted-foreground mt-1">Separa con comas.</p>
      </div>
    </div>
  );

  const renderTermsTab = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
          <span className="w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">9</span>
          Términos y condiciones
        </h3>
      </div>
      <div className="bg-muted/40 border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Icon name="FileText" size={13} className="text-orange-500" />
            Resumen generado automáticamente
          </p>
          <button type="button" onClick={generateTerms} className="text-xs text-orange-600 hover:underline flex items-center gap-1">
            <Icon name="RefreshCw" size={11} />
            Actualizar
          </button>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          El resumen se genera a partir de las reglas y el tipo de beneficio configurados. Haz clic en "Actualizar" para regenerarlo o edita el campo de abajo.
        </p>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Términos y condiciones del cupón</label>
        <textarea value={form?.termsCustomText} onChange={e => set('termsCustomText', e?.target?.value)} rows={6} placeholder="Ej: • Descuento del 20% en cualquier producto del menú.&#10;• Válido por 7 días desde la fecha de emisión.&#10;• Cada usuario tiene derecho a 1 uso de este cupón.&#10;• Válido en todos los establecimientos participantes.&#10;• Cupón personal e intransferible.&#10;• No aplica en combinación con otras promociones." className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 resize-none font-mono" />
        <p className="text-xs text-muted-foreground mt-1">Este texto aparecerá en el cupón digital del usuario.</p>
      </div>
      <div>
        <p className="text-xs font-medium text-foreground mb-2">Cláusulas frecuentes</p>
        <div className="flex flex-wrap gap-2">
          {['No aplica en días festivos.', 'Sujeto a disponibilidad.', 'No reembolsable ni canjeable por efectivo.', 'No aplica en productos ya en oferta.', 'Válido solo para consumo en establecimiento.', 'Presentar cupón antes de ordenar.']?.map(clause => (
            <button key={clause} type="button" onClick={() => set('termsCustomText', (form?.termsCustomText ? form?.termsCustomText + '\n' : '') + `• ${clause}`)} className="px-2.5 py-1 bg-muted border border-border text-xs text-foreground rounded-lg hover:border-orange-400 hover:text-orange-600 transition-colors">
              + {clause}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEstablishmentsTab = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
          <span className="w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">8</span>
          Establecimiento
        </h3>
        <p className="text-xs text-muted-foreground ml-8">Selecciona en qué establecimientos se visualizará y podrá canjearse este cupón de recuperación</p>
      </div>
      {establishments?.length === 0 ? (
        <div className="p-4 bg-muted/30 rounded-xl text-center">
          <Icon name="MapPin" size={24} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No hay establecimientos registrados. El cupón aplicará en todos los establecimientos.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedEstablishments?.length === 0 ? 'border-orange-500 bg-orange-50' : 'border-border hover:border-muted-foreground'}`}>
            <input
              type="checkbox"
              checked={selectedEstablishments?.length === 0}
              onChange={() => setSelectedEstablishments([])}
              className="w-4 h-4 rounded accent-orange-500"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Todos los establecimientos</p>
              <p className="text-xs text-muted-foreground">El cupón aplica en todos los establecimientos activos</p>
            </div>
            {selectedEstablishments?.length === 0 && <Icon name="Check" size={14} className="text-orange-500 ml-auto" />}
          </label>
          {establishments?.map(est => {
            const isSelected = selectedEstablishments?.includes(est?.id);
            return (
              <label key={est?.id}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-orange-500 bg-orange-50' : 'border-border hover:border-muted-foreground'}`}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {
                    if (isSelected) setSelectedEstablishments(prev => prev?.filter(id => id !== est?.id));
                    else setSelectedEstablishments(prev => [...prev, est?.id]);
                  }}
                  className="w-4 h-4 rounded accent-orange-500"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{est?.location_name}</p>
                  {est?.location_code && <p className="text-xs text-muted-foreground">Código: {est?.location_code}</p>}
                </div>
                {isSelected && <Icon name="Check" size={14} className="text-orange-500" />}
              </label>
            );
          })}
        </div>
      )}
      {selectedEstablishments?.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center gap-2">
          <Icon name="Info" size={14} className="text-orange-500 flex-shrink-0" />
          <p className="text-xs text-orange-700">
            El cupón estará disponible en <strong>{selectedEstablishments?.length}</strong> establecimiento{selectedEstablishments?.length > 1 ? 's' : ''} seleccionado{selectedEstablishments?.length > 1 ? 's' : ''}.
          </p>
        </div>
      )}
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'trigger': return renderTriggerTab();
      case 'benefit': return renderBenefitTab();
      case 'identity': return renderIdentityTab();
      case 'message': return renderMessageTab();
      case 'validity': return renderValidityTab();
      case 'escalation': return renderEscalationTab();
      case 'eligibility': return renderEligibilityTab();
      case 'establishments': return renderEstablishmentsTab();
      case 'rules': return renderRulesTab();
      case 'terms': return renderTermsTab();
      default: return renderTriggerTab();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} user={userDisplay} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={userDisplay} onCollapse={setIsSidebarCollapsed} />
      <main className={mainClasses}>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm mb-4">
            <button onClick={() => navigate('/coupons-management')} className="text-muted-foreground hover:text-foreground transition-colors">Cupones</button>
            <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
            <span className="text-foreground font-medium">Nuevo Cupón de Recuperación</span>
          </nav>

          {/* Page Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Nuevo Cupón de Recuperación</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Configura el cupón para recuperar clientes inactivos</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/coupons-management')}>
              Cancelar
            </Button>
          </div>

          {/* ── LIVE PREVIEW ── */}
          <div className="mb-5">
            <CouponLivePreview form={form} />
          </div>

          <div className="flex gap-6 items-start">
            {/* ── WIZARD FORM ── */}
            <div className="flex-1 min-w-0">
              {/* ── WIZARD PROGRESS BAR (business-listing style) ── */}
              <div className="bg-card border border-border rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">Progreso del wizard</span>
                    <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full font-medium">
                      {TABS?.[currentTabIndex]?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground hidden sm:block">Paso {currentTabIndex + 1} de {TABS?.length}</span>
                    <span className="text-sm font-bold text-orange-500">{Math.round(((currentTabIndex + 1) / TABS?.length) * 100)}%</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-4">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(((currentTabIndex + 1) / TABS?.length) * 100)}%` }}
                  />
                </div>
                {/* Step indicators with icons, connectors and labels */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {TABS?.map((tab, idx) => {
                    const isActive = activeTab === tab?.id;
                    const isPast = idx < currentTabIndex;
                    return (
                      <React.Fragment key={tab?.id}>
                        <button
                          type="button"
                          onClick={() => setActiveTab(tab?.id)}
                          title={tab?.label}
                          className={`flex flex-col items-center gap-1 min-w-[56px] p-2 rounded-xl transition-all relative ${
                            isActive
                              ? 'bg-orange-50 text-orange-600'
                              : isPast
                              ? 'text-green-600 hover:bg-green-50 cursor-pointer' :'text-muted-foreground hover:bg-muted cursor-pointer'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                            isActive
                              ? 'bg-orange-500 text-white shadow-sm'
                              : isPast
                              ? 'bg-green-500 text-white' :'bg-muted'
                          }`}>
                            {isPast ? (
                              <Icon name="Check" size={14} className="text-white" />
                            ) : (
                              <Icon name={tab?.icon} size={14} className={isActive ? 'text-white' : 'text-muted-foreground'} />
                            )}
                          </div>
                          <span className="text-xs font-medium text-center leading-tight whitespace-nowrap">{tab?.label?.split(' ')?.[0]}</span>
                        </button>
                        {idx < TABS?.length - 1 && (
                          <div className={`flex-1 h-0.5 min-w-[6px] rounded-full transition-colors ${
                            isPast ? 'bg-green-400' : 'bg-border'
                          }`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* ── WIZARD FORM CONTENT ── */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                {/* Tab content */}
                <div className="p-6">
                  {renderActiveTab()}

                  {/* Navigation buttons */}
                  <div className="flex items-center justify-between mt-8 pt-5 border-t border-border">
                    <button
                      type="button"
                      onClick={() => canGoPrev && setActiveTab(TABS?.[currentTabIndex - 1]?.id)}
                      disabled={!canGoPrev}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${canGoPrev ? 'text-foreground hover:bg-muted' : 'text-muted-foreground cursor-not-allowed opacity-40'}`}
                    >
                      <Icon name="ChevronLeft" size={16} />
                      Anterior
                    </button>

                    {/* Horizontal progress indicator */}
                    <div className="flex items-center gap-1">
                      {TABS?.map((tab, idx) => {
                        const isActive = activeTab === tab?.id;
                        const isPast = currentTabIndex > idx;
                        return (
                          <button key={tab?.id} type="button" onClick={() => setActiveTab(tab?.id)} title={tab?.label}
                            className={`rounded-full transition-all ${isActive ? 'w-6 h-2 bg-orange-500' : isPast ? 'w-2 h-2 bg-green-500' : 'w-2 h-2 bg-muted hover:bg-muted-foreground'}`} />
                        );
                      })}
                    </div>

                    {canGoNext ? (
                      <button
                        type="button"
                        onClick={() => setActiveTab(TABS?.[currentTabIndex + 1]?.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-all"
                      >
                        Siguiente
                        <Icon name="ChevronRight" size={16} />
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => handleSave(false)}>
                          <Icon name="Save" size={14} className="mr-1.5" />
                          Borrador
                        </Button>
                        <Button onClick={() => handleSave(true)} className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500">
                          <Icon name="Zap" size={14} className="mr-1.5" />
                          Activar cupón
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Global footer actions */}
              <div className="flex items-center justify-between py-4">
                <Button variant="outline" onClick={() => navigate('/coupons-management')}>
                  Cancelar
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => handleSave(false)}>
                    <Icon name="Save" size={15} className="mr-2" />
                    Guardar borrador
                  </Button>
                  <Button onClick={() => handleSave(true)} className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500">
                    <Icon name="Zap" size={15} className="mr-2" />
                    Activar cupón de recuperación
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NuevoCuponRecuperacionPage;
