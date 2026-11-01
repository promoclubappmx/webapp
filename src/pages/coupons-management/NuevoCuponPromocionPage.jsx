import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { SearchableProductSelector, SearchableCategorySelector, SearchableVariableProductSelector, CurrencyInput } from '../../components/ui/SearchableSelector';

// ─── Constants ───────────────────────────────────────────────────────────────

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

// ─── Wizard Tabs ──────────────────────────────────────────────────────────────

const TABS = [
  { id: 'trigger', label: 'Distribución', icon: 'Zap', short: '1' },
  { id: 'benefit', label: 'Beneficio', icon: 'Gift', short: '2' },
  { id: 'identity', label: 'Identidad visual', icon: 'Palette', short: '3' },
  { id: 'code', label: 'Código', icon: 'Hash', short: '4' },
  { id: 'rules', label: 'Reglas', icon: 'Shield', short: '5' },
  { id: 'establishments', label: 'Establecimiento', icon: 'MapPin', short: '6' },
  { id: 'channel', label: 'Canal', icon: 'Share2', short: '7' },
  { id: 'notifications', label: 'Notificaciones', icon: 'Bell', short: '8' },
  { id: 'terms', label: 'Términos', icon: 'FileText', short: '9' },
];

// ─── Trigger definitions ──────────────────────────────────────────────────────

const TRIGGER_CATEGORIES = [
  {
    key: 'behavior',
    label: 'Comportamiento del cliente',
    icon: 'Activity',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    triggers: [
      { key: 'first_visit', label: 'Primera visita', icon: 'Star', desc: 'Cupón de bienvenida al visitar por primera vez', est: '~5/mes', fields: [] },
      { key: 'visit_count', label: 'Número de visitas acumuladas', icon: 'MapPin', desc: 'Enviar cuando el cliente alcance N visitas', est: '~20/mes', fields: ['visit_threshold'] },
      { key: 'spend_amount', label: 'Monto acumulado gastado', icon: 'TrendingUp', desc: 'Enviar cuando el cliente haya gastado $X MXN en total', est: '~8/mes', fields: ['spend_threshold'] },
      { key: 'checkin_today', label: 'Al hacer check-in hoy', icon: 'CheckCircle', desc: 'Cupón sorpresa entregado directamente al validar la visita', est: '~30/mes', fields: [] },
      { key: 'inactivity', label: 'Al no visitar en X días', icon: 'Clock', desc: 'Enviar si el cliente lleva N días sin visitar', est: '~15/mes', fields: ['inactivity_days'] },
    ],
  },
  {
    key: 'interaction',
    label: 'Interacción con el negocio',
    icon: 'MessageSquare',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    triggers: [
      { key: 'review', label: 'Al dejar una reseña verificada', icon: 'Star', desc: 'El cliente recibe el cupón después de publicar una reseña', est: '~10/mes', fields: [] },
      { key: 'nps_survey', label: 'Al responder una encuesta NPS', icon: 'BarChart2', desc: 'Al completar la encuesta post-visita', est: '~12/mes', fields: [] },
      { key: 'referral', label: 'Al referir a un amigo registrado', icon: 'UserPlus', desc: 'Cuando el amigo referido se registra en PromoClub', est: '~3/mes', fields: [] },
      { key: 'profile_complete', label: 'Al completar su perfil en la app', icon: 'User', desc: 'Cuando el usuario completa el 100% de su perfil', est: '~6/mes', fields: [] },
    ],
  },
  {
    key: 'temporal',
    label: 'Contexto temporal',
    icon: 'Calendar',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    triggers: [
      { key: 'birthday', label: 'Cumpleaños', icon: 'Cake', desc: 'Enviado automáticamente X días antes del cumpleaños', est: '~8/mes', fields: ['birthday_days_before'] },
      { key: 'anniversary', label: 'Aniversario como cliente', icon: 'Award', desc: 'Al cumplir 6 meses / 1 año / 2 años desde la primera visita', est: '~4/mes', fields: ['anniversary_milestone'] },
      { key: 'time_window', label: 'Día u horario específico', icon: 'Clock', desc: 'Solo disponible en días y horas configuradas', est: '~25/mes', fields: ['time_window_days', 'time_window_from', 'time_window_to'] },
    ],
  },
  {
    key: 'loyalty',
    label: 'Nivel de lealtad',
    icon: 'Crown',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    triggers: [
      { key: 'level_up', label: 'Al subir de nivel VIP', icon: 'TrendingUp', desc: 'El cliente recibe el cupón cuando sube a Plata / Oro', est: '~5/mes', fields: ['level_up_target'] },
      { key: 'active_level', label: 'Por nivel VIP activo', icon: 'Shield', desc: 'Solo disponible para clientes con nivel específico activo', est: 'Permanente', fields: ['active_level_min'] },
      { key: 'punch_card', label: 'Al completar una punch card', icon: 'Grid', desc: 'Generado automáticamente cuando se completa la tarjeta', est: '~7/mes', fields: ['punch_card_name'] },
    ],
  },
  {
    key: 'channel',
    label: 'Canal externo',
    icon: 'Wifi',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    triggers: [
      { key: 'qr_scan', label: 'Al escanear un QR físico específico', icon: 'QrCode', desc: 'El cupón se activa cuando el cliente escanea el QR del flyer / packaging', est: '~18/mes', fields: ['qr_label'] },
      { key: 'campaign_link', label: 'Al hacer click en un link de campaña', icon: 'Link', desc: 'El cliente llega al cupón desde un link de WhatsApp / email / Instagram', est: '~22/mes', fields: ['campaign_channel'] },
      { key: 'wifi', label: 'Al conectarse al WiFi del negocio', icon: 'Wifi', desc: 'El cupón aparece automáticamente al usar la red WiFi configurada', est: '~35/mes', fields: [], badge: 'N2 WiFi' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars?.[Math.floor(Math.random() * chars?.length)])?.join('');
};

const getBenefitLabel = (form) => {
  if (form?.benefitType === 'percentage') return form?.percentValue ? `${form?.percentValue}% OFF` : '% OFF';
  if (form?.benefitType === 'fixed') return form?.fixedAmount ? `$${form?.fixedAmount} OFF` : '$X OFF';
  if (form?.benefitType === 'free_product') return form?.freeProductName || 'Producto Gratis';
  if (form?.benefitType === 'bogo') return form?.bogoType === '3x2' ? '3×2' : '2×1';
  if (form?.benefitType === 'upgrade') return form?.upgradeProductName ? `Upgrade: ${form?.upgradeProductName}` : 'Upgrade Gratis';
  if (form?.benefitType === 'free_shipping') return 'Envío Gratis';
  if (form?.benefitType === 'cashback_points') return form?.cashbackPoints ? `+${form?.cashbackPoints}x Puntos` : 'Puntos Extra';
  if (form?.benefitType === 'bundle') {
    const total = (form?.bundleProducts || [])?.reduce((s, p) => s + (Number(p?.price) || 0), 0);
    if (form?.bundleDiscountType === 'special_price' && form?.bundleSpecialPrice) return `Combo $${form?.bundleSpecialPrice} MXN`;
    if (total > 0 && form?.bundleDiscountType === 'discount' && form?.bundleDiscount > 0) return `Combo ${form?.bundleDiscount}% OFF ($${(total * (1 - form?.bundleDiscount / 100))?.toFixed(0)})`;
    return 'Bundle Combo';
  }
  if (form?.benefitType === 'quantity_discount') return form?.qtyBuy ? `${form?.qtyBuy}+1` : 'Desc. Cantidad';
  if (form?.benefitType === 'fixed_price') return form?.fixedPrice ? `$${form?.fixedPrice} MXN` : 'Precio Especial';
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

// ─── Sub-components ───────────────────────────────────────────────────────────

const Toggle = ({ value, onChange, color = 'bg-primary' }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? color : 'bg-muted'}`}
  >
    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const SectionHeader = ({ num, title, expanded = false, onToggle = () => {}, collapsible = false, subtitle }) => (
  <button
    className={`w-full flex items-center justify-between ${collapsible ? 'cursor-pointer' : 'cursor-default'}`}
    onClick={collapsible ? onToggle : undefined}
  >
    <div>
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">{num}</span>
        {title}
      </h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5 ml-8">{subtitle}</p>}
    </div>
    {collapsible && <Icon name={expanded ? 'ChevronUp' : 'ChevronDown'} size={18} className="text-muted-foreground" />}
  </button>
);

// ─── Coupon Live Preview ──────────────────────────────────────────────────────

const CouponLivePreview = ({ form, triggerMode, selectedTrigger, displayCode }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
          <Icon name="Eye" size={15} className="text-primary" />
          Vista previa — Wallet del usuario
        </h3>
        <span className="text-xs text-muted-foreground">En tiempo real</span>
      </div>

      <div className="flex gap-4 flex-wrap">
        {/* Wallet card */}
        <div className="rounded-2xl overflow-hidden shadow-lg border border-border flex-1 min-w-[220px] max-w-xs">
          <div className="relative h-28">
            <img src={form?.selectedImage || TEMPLATE_IMAGES?.[0]?.url} alt="Vista previa del cupón de promoción" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <div className="text-white font-bold text-lg leading-tight">{getBenefitLabel(form)}</div>
              <div className="text-white/80 text-xs">{form?.title || 'Título del cupón'}</div>
            </div>
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-medium">Promoción</span>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: form?.accentColor || ACCENT_COLORS?.[0] }} />
            </div>
          </div>
          <div className="bg-card p-3 space-y-2">
            <div className="text-xs text-muted-foreground line-clamp-2">{form?.description || 'Descripción del beneficio aparecerá aquí'}</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-foreground tracking-wider">
                {displayCode?.substring(0, 4)}-****
              </span>
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Icon name="QrCode" size={20} className="text-foreground" />
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
            <div className="h-1 rounded-full" style={{ backgroundColor: form?.accentColor || ACCENT_COLORS?.[0] }} />
          </div>
        </div>

        {/* Right side: trigger + rules summary */}
        <div className="flex-1 min-w-[180px] space-y-2">
          {triggerMode === 'automatic' && selectedTrigger ? (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-2.5 flex items-center gap-2">
              <Icon name="Zap" size={13} className="text-primary flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-primary">Trigger activo</p>
                <p className="text-xs text-muted-foreground">{TRIGGER_CATEGORIES?.flatMap(c => c?.triggers)?.find(t => t?.key === selectedTrigger)?.label}</p>
              </div>
            </div>
          ) : (
            <div className="bg-muted/50 border border-border rounded-xl p-2.5 flex items-center gap-2">
              <Icon name="Hand" size={13} className="text-muted-foreground flex-shrink-0" />
              <p className="text-xs text-muted-foreground">Distribución manual</p>
            </div>
          )}

          {/* Rules summary */}
          <div className="bg-card border border-border rounded-xl p-2.5 space-y-1.5">
            <h4 className="text-xs font-semibold text-foreground">Resumen</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon name={form?.isPersonal ? 'Lock' : 'Unlock'} size={10} className={form?.isPersonal ? 'text-amber-500' : 'text-green-500'} />
                {form?.isPersonal ? 'Personal — no transferible' : 'Transferible'}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon name="Users" size={10} className="text-blue-500" />
                {form?.audience === 'all' ? 'Todos los clientes' : form?.audience === 'new' ? 'Solo nuevos' : form?.audience === 'vip' ? `VIP: ${form?.vipLevel || '—'}` : `Segmento: ${form?.crmSegment || '—'}`}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon name="Hash" size={10} className="text-purple-500" />
                {form?.usagePerUser === 'unlimited' ? 'Usos ilimitados' : `${form?.usagePerUser} uso(s) por usuario`}
              </div>
            </div>
          </div>

          {/* Push notification preview */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Push notification</p>
            <div className="bg-gray-900 rounded-xl p-2.5 flex items-start gap-2">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="Ticket" size={12} className="text-white" />
              </div>
              <div>
                <div className="text-white text-xs font-semibold">PromoClub</div>
                <div className="text-gray-300 text-xs leading-tight">Tu negocio te envió: {form?.title || 'Nuevo cupón'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Trigger Config Fields ────────────────────────────────────────────────────

const TriggerConfigFields = ({ triggerKey, triggerConfig, setTriggerConfig }) => {
  const set = (k, v) => setTriggerConfig(prev => ({ ...prev, [k]: v }));

  if (triggerKey === 'visit_count') return (
    <div className="flex items-center gap-2 mt-3">
      <span className="text-sm text-muted-foreground">Enviar cuando el cliente alcance</span>
      <input type="number" min={1} max={100} value={triggerConfig?.visit_threshold || 5} onChange={e => set('visit_threshold', Number(e?.target?.value))} className="w-20 px-2 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-center font-bold" />
      <span className="text-sm text-muted-foreground">visitas acumuladas</span>
    </div>
  );

  if (triggerKey === 'spend_amount') return (
    <div className="flex items-center gap-2 mt-3">
      <span className="text-sm text-muted-foreground">Enviar cuando haya gastado</span>
      <div className="flex items-center border border-border rounded-lg overflow-hidden">
        <span className="px-2 py-1.5 bg-muted text-sm text-muted-foreground">$</span>
        <input type="number" min={1} value={triggerConfig?.spend_threshold || 500} onChange={e => set('spend_threshold', Number(e?.target?.value))} className="w-24 px-2 py-1.5 bg-background text-foreground text-sm focus:outline-none font-bold" />
      </div>
      <span className="text-sm text-muted-foreground">MXN en total</span>
    </div>
  );

  if (triggerKey === 'inactivity') return (
    <div className="flex items-center gap-2 mt-3">
      <span className="text-sm text-muted-foreground">Enviar si lleva</span>
      <input type="number" min={1} max={365} value={triggerConfig?.inactivity_days || 21} onChange={e => set('inactivity_days', Number(e?.target?.value))} className="w-20 px-2 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-center font-bold" />
      <span className="text-sm text-muted-foreground">días sin visitar</span>
    </div>
  );

  if (triggerKey === 'birthday') return (
    <div className="flex items-center gap-2 mt-3">
      <span className="text-sm text-muted-foreground">Enviado</span>
      <input type="number" min={0} max={30} value={triggerConfig?.birthday_days_before || 3} onChange={e => set('birthday_days_before', Number(e?.target?.value))} className="w-16 px-2 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-center font-bold" />
      <span className="text-sm text-muted-foreground">días antes del cumpleaños</span>
    </div>
  );

  if (triggerKey === 'anniversary') return (
    <div className="flex items-center gap-2 mt-3">
      <span className="text-sm text-muted-foreground">Al cumplir</span>
      <select value={triggerConfig?.anniversary_milestone || '1_year'} onChange={e => set('anniversary_milestone', e?.target?.value)} className="px-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none font-medium">
        <option value="6_months">6 meses</option>
        <option value="1_year">1 año</option>
        <option value="2_years">2 años</option>
        <option value="3_years">3 años</option>
      </select>
      <span className="text-sm text-muted-foreground">desde la primera visita</span>
    </div>
  );

  if (triggerKey === 'time_window') return (
    <div className="space-y-3 mt-3">
      <div>
        <label className="text-xs font-medium text-foreground block mb-2">Días disponibles</label>
        <div className="flex gap-1.5 flex-wrap">
          {DAYS_OF_WEEK?.map(d => {
            const days = triggerConfig?.time_window_days || ['mon', 'tue', 'wed', 'thu', 'fri'];
            const active = days?.includes(d?.key);
            return (
              <button key={d?.key} type="button" onClick={() => {
                const updated = active ? days?.filter(x => x !== d?.key) : [...days, d?.key];
                set('time_window_days', updated);
              }} className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${active ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-muted-foreground/40'}`}>
                {d?.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Hora inicio</label>
          <input type="time" value={triggerConfig?.time_window_from || '14:00'} onChange={e => set('time_window_from', e?.target?.value)} className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Hora fin</label>
          <input type="time" value={triggerConfig?.time_window_to || '17:00'} onChange={e => set('time_window_to', e?.target?.value)} className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none" />
        </div>
      </div>
    </div>
  );

  if (triggerKey === 'level_up') return (
    <div className="flex items-center gap-2 mt-3">
      <span className="text-sm text-muted-foreground">Al subir a nivel</span>
      <select value={triggerConfig?.level_up_target || 'silver'} onChange={e => set('level_up_target', e?.target?.value)} className="px-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none font-medium">
        <option value="bronze">Bronce</option>
        <option value="silver">Plata</option>
        <option value="gold">Oro</option>
        <option value="platinum">Platino</option>
      </select>
    </div>
  );

  if (triggerKey === 'active_level') return (
    <div className="flex items-center gap-2 mt-3">
      <span className="text-sm text-muted-foreground">Solo para clientes con nivel</span>
      <select value={triggerConfig?.active_level_min || 'silver'} onChange={e => set('active_level_min', e?.target?.value)} className="px-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none font-medium">
        <option value="bronze">Bronce o superior</option>
        <option value="silver">Plata o superior</option>
        <option value="gold">Oro o superior</option>
        <option value="platinum">Solo Platino</option>
      </select>
      <span className="text-xs text-muted-foreground">(condición permanente)</span>
    </div>
  );

  if (triggerKey === 'punch_card') return (
    <div className="flex items-center gap-2 mt-3">
      <span className="text-sm text-muted-foreground">Al completar la tarjeta</span>
      <input type="text" value={triggerConfig?.punch_card_name || ''} onChange={e => set('punch_card_name', e?.target?.value)} className="flex-1 px-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
    </div>
  );

  if (triggerKey === 'qr_scan') return (
    <div className="flex items-center gap-2 mt-3">
      <span className="text-sm text-muted-foreground">Etiqueta del QR</span>
      <input type="text" value={triggerConfig?.qr_label || ''} onChange={e => set('qr_label', e?.target?.value)} className="flex-1 px-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
    </div>
  );

  if (triggerKey === 'campaign_link') return (
    <div className="flex items-center gap-2 mt-3">
      <span className="text-sm text-muted-foreground">Canal de origen</span>
      <select value={triggerConfig?.campaign_channel || 'whatsapp'} onChange={e => set('campaign_channel', e?.target?.value)} className="px-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none font-medium">
        <option value="whatsapp">WhatsApp</option>
        <option value="email">Email</option>
        <option value="instagram">Instagram</option>
        <option value="facebook">Facebook</option>
        <option value="sms">SMS</option>
      </select>
    </div>
  );

  return null;
};

// ─── Benefit Rule Fields ──────────────────────────────────────────────────────

const BenefitRuleFields = ({ form, set }) => {
  const inputCls = "w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";
  const labelCls = "text-xs font-medium text-foreground block mb-1";

  if (form?.benefitType === 'percentage') return (
    <div className="space-y-4 mt-4 pt-4 border-t border-border">
      <div>
        <label className={labelCls}>Porcentaje de descuento: <span className="text-primary font-bold">{form?.percentValue}%</span></label>
        <input type="range" min={5} max={90} value={form?.percentValue} onChange={e => set('percentValue', Number(e?.target?.value))} className="w-full accent-primary" />
        <div className="flex justify-between text-xs text-muted-foreground"><span>5%</span><span>90%</span></div>
      </div>
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form?.useMaxDiscount || false} onChange={e => set('useMaxDiscount', e?.target?.checked)} className="accent-primary w-4 h-4" />
          <span className="text-sm font-medium text-foreground">Tope máximo de descuento (MXN, opcional)</span>
        </label>
        {form?.useMaxDiscount && (
          <CurrencyInput
            label="Tope máximo de descuento (MXN)"
            value={form?.maxDiscount || ''}
            onChange={v => set('maxDiscount', v)}
            accentClass="focus:ring-primary/30"
          />
        )}
      </div>
      <div>
        <label className={labelCls}>¿Aplica en?</label>
        <div className="grid grid-cols-3 gap-2">
          {[{ key: 'all', label: 'Todo' }, { key: 'product', label: 'Producto/Servicio' }, { key: 'category', label: 'Categoría' }]?.map(opt => (
            <label key={opt?.key} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs transition-all ${form?.percentAppliesTo === opt?.key ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground hover:border-muted-foreground/40'}`}>
              <input type="radio" name="percentAppliesTo" value={opt?.key} checked={form?.percentAppliesTo === opt?.key} onChange={() => set('percentAppliesTo', opt?.key)} className="accent-primary" />
              {opt?.label}
            </label>
          ))}
        </div>
        {form?.percentAppliesTo === 'product' && (
          <div className="mt-2">
            <SearchableProductSelector
              label="Producto o servicio"
              value={form?.percentProductName}
              onChange={(name, id) => { set('percentProductName', name); set('percentProductId', id); }}
            />
          </div>
        )}
        {form?.percentAppliesTo === 'category' && (
          <div className="mt-2">
            <SearchableCategorySelector
              label="Categoría"
              value={form?.percentCategoryName}
              onChange={(name, id) => { set('percentCategoryName', name); set('percentCategoryId', id); }}
            />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form?.percentRequireMinPurchase || false} onChange={e => set('percentRequireMinPurchase', e?.target?.checked)} className="accent-primary w-4 h-4" />
          <span className="text-sm font-medium text-foreground">Requiere compra mínima</span>
        </label>
        {form?.percentRequireMinPurchase && (
          <CurrencyInput label="Monto mínimo (MXN)" value={form?.percentMinPurchase || ''} onChange={v => set('percentMinPurchase', v)} accentClass="focus:ring-primary/30" />
        )}
      </div>
    </div>
  );

  if (form?.benefitType === 'fixed') return (
    <div className="space-y-4 mt-4 pt-4 border-t border-border">
      <CurrencyInput label="Monto de descuento (MXN)" value={form?.fixedAmount || ''} onChange={v => set('fixedAmount', v)} accentClass="focus:ring-primary/30" />
      <div>
        <label className={labelCls}>¿Aplica en?</label>
        <div className="grid grid-cols-3 gap-2">
          {[{ key: 'all', label: 'Todo' }, { key: 'product', label: 'Producto/Servicio' }, { key: 'category', label: 'Categoría' }]?.map(opt => (
            <label key={opt?.key} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs transition-all ${form?.fixedAppliesTo === opt?.key ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground hover:border-muted-foreground/40'}`}>
              <input type="radio" name="fixedAppliesTo" value={opt?.key} checked={form?.fixedAppliesTo === opt?.key} onChange={() => set('fixedAppliesTo', opt?.key)} className="accent-primary" />
              {opt?.label}
            </label>
          ))}
        </div>
        {form?.fixedAppliesTo === 'product' && (
          <div className="mt-2">
            <SearchableProductSelector label="Producto o servicio" value={form?.fixedProductName} onChange={(name, id) => { set('fixedProductName', name); set('fixedProductId', id); }} />
          </div>
        )}
        {form?.fixedAppliesTo === 'category' && (
          <div className="mt-2">
            <SearchableCategorySelector label="Categoría" value={form?.fixedCategoryName} onChange={(name, id) => { set('fixedCategoryName', name); set('fixedCategoryId', id); }} />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form?.fixedRequireMinPurchase || false} onChange={e => set('fixedRequireMinPurchase', e?.target?.checked)} className="accent-primary w-4 h-4" />
          <span className="text-sm font-medium text-foreground">Requiere compra mínima</span>
        </label>
        {form?.fixedRequireMinPurchase && (
          <CurrencyInput label="Monto mínimo (MXN)" value={form?.fixedMinPurchase || ''} onChange={v => set('fixedMinPurchase', v)} accentClass="focus:ring-primary/30" />
        )}
      </div>
    </div>
  );

  if (form?.benefitType === 'free_product') return (
    <div className="space-y-4 mt-4 pt-4 border-t border-border">
      <SearchableProductSelector label="Producto gratis" value={form?.freeProductName} onChange={(name, id) => { set('freeProductName', name); set('freeProductId', id); }} />
      <div>
        <label className={labelCls}>Condición para obtenerlo</label>
        <div className="space-y-2">
          {[
            { key: 'none', label: 'Sin condición (siempre aplica)' },
            { key: 'min_price', label: 'Compra mínima de $X MXN' },
            { key: 'buy_product', label: 'Al comprar un producto específico' },
            { key: 'buy_category', label: 'Al comprar en una categoría' },
          ]?.map(opt => (
            <label key={opt?.key} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-sm transition-all ${form?.freeProductCondition === opt?.key ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'}`}>
              <input type="radio" name="freeProductCondition" value={opt?.key} checked={form?.freeProductCondition === opt?.key} onChange={() => set('freeProductCondition', opt?.key)} className="accent-primary" />
              {opt?.label}
            </label>
          ))}
        </div>
        {form?.freeProductCondition === 'min_price' && (
          <div className="mt-2">
            <CurrencyInput label="Monto mínimo (MXN)" value={form?.freeProductMinPrice || ''} onChange={v => set('freeProductMinPrice', v)} accentClass="focus:ring-primary/30" />
          </div>
        )}
        {form?.freeProductCondition === 'buy_product' && (
          <div className="mt-2">
            <SearchableProductSelector label="Producto a comprar" value={form?.freeProductBuyProduct} onChange={(name, id) => { set('freeProductBuyProduct', name); set('freeProductBuyProductId', id); }} />
          </div>
        )}
        {form?.freeProductCondition === 'buy_category' && (
          <div className="mt-2">
            <SearchableCategorySelector label="Categoría" value={form?.freeProductBuyCategory} onChange={(name, id) => { set('freeProductBuyCategory', name); set('freeProductBuyCategoryId', id); }} />
          </div>
        )}
      </div>
    </div>
  );

  if (form?.benefitType === 'bogo') return (
    <div className="space-y-4 mt-4 pt-4 border-t border-border">
      <div>
        <label className={labelCls}>Tipo de promoción</label>
        <div className="grid grid-cols-2 gap-2">
          {[{ key: '2x1', label: '2×1 (lleva 2, paga 1)' }, { key: '3x2', label: '3×2 (lleva 3, paga 2)' }]?.map(opt => (
            <label key={opt?.key} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer text-sm transition-all ${form?.bogoType === opt?.key ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'}`}>
              <input type="radio" name="bogoType" value={opt?.key} checked={form?.bogoType === opt?.key} onChange={() => set('bogoType', opt?.key)} className="accent-primary" />
              <span className="font-medium">{opt?.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className={labelCls}>¿Aplica en?</label>
        <div className="grid grid-cols-2 gap-2">
          {[{ key: 'product', label: 'Producto específico' }, { key: 'category', label: 'Categoría' }]?.map(opt => (
            <label key={opt?.key} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs transition-all ${form?.bogoAppliesTo === opt?.key ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground hover:border-muted-foreground/40'}`}>
              <input type="radio" name="bogoAppliesTo" value={opt?.key} checked={form?.bogoAppliesTo === opt?.key} onChange={() => set('bogoAppliesTo', opt?.key)} className="accent-primary" />
              {opt?.label}
            </label>
          ))}
        </div>
        {form?.bogoAppliesTo === 'product' && (
          <div className="mt-2">
            <SearchableProductSelector label="Producto" value={form?.bogoProductName} onChange={(name, id) => { set('bogoProductName', name); set('bogoProductId', id); }} />
          </div>
        )}
        {form?.bogoAppliesTo === 'category' && (
          <div className="mt-2">
            <SearchableCategorySelector label="Categoría" value={form?.bogoCategoryName} onChange={(name, id) => { set('bogoCategoryName', name); set('bogoCategoryId', id); }} />
          </div>
        )}
      </div>
    </div>
  );

  if (form?.benefitType === 'upgrade') return (
    <div className="space-y-4 mt-4 pt-4 border-t border-border">
      <SearchableVariableProductSelector
        label="Producto con variantes"
        value={form?.upgradeProductName}
        onChange={(name, id, variants) => { set('upgradeProductName', name); set('upgradeProductId', id); set('upgradeVariants', variants || []); }}
        onSelect={(name, id, variants) => { set('upgradeProductName', name); set('upgradeProductId', id); set('upgradeVariants', variants || []); }}
      />
      {form?.upgradeVariants?.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Variante de origen (la que compra)</label>
            <select value={form?.upgradeFromVariant} onChange={e => { set('upgradeFromVariant', e?.target?.value); const v = form?.upgradeVariants?.find(x => x?.name === e?.target?.value); set('upgradeFromPrice', v?.price || ''); }} className={inputCls}>
              <option value="">Seleccionar</option>
              {form?.upgradeVariants?.map(v => <option key={v?.id} value={v?.name}>{v?.name} — ${v?.price}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Variante de upgrade (la que recibe)</label>
            <select value={form?.upgradeToVariant} onChange={e => { set('upgradeToVariant', e?.target?.value); const v = form?.upgradeVariants?.find(x => x?.name === e?.target?.value); set('upgradeToPrice', v?.price || ''); }} className={inputCls}>
              <option value="">Seleccionar</option>
              {form?.upgradeVariants?.map(v => <option key={v?.id} value={v?.name}>{v?.name} — ${v?.price}</option>)}
            </select>
          </div>
        </div>
      )}
      {form?.upgradeFromVariant && form?.upgradeToVariant && form?.upgradeFromPrice && form?.upgradeToPrice && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3 text-sm text-cyan-800">
          El cliente paga <strong>${form?.upgradeFromPrice}</strong> ({form?.upgradeFromVariant}) y recibe <strong>{form?.upgradeToVariant}</strong> (valor ${form?.upgradeToPrice}) — ahorra <strong>${(parseFloat(form?.upgradeToPrice || 0) - parseFloat(form?.upgradeFromPrice || 0))?.toFixed(2)} MXN</strong>
        </div>
      )}
    </div>
  );

  if (form?.benefitType === 'free_shipping') return (
    <div className="space-y-4 mt-4 pt-4 border-t border-border">
      <div>
        <label className={labelCls}>Condición para envío gratis</label>
        <div className="space-y-2">
          {[
            { key: 'always', label: 'Siempre (sin condición)' },
            { key: 'min_amount', label: 'Compra mínima de $X MXN' },
            { key: 'product', label: 'Al comprar un producto específico' },
            { key: 'category', label: 'Al comprar en una categoría' },
          ]?.map(opt => (
            <label key={opt?.key} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-sm transition-all ${form?.freeShippingCondition === opt?.key ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'}`}>
              <input type="radio" name="freeShippingCondition" value={opt?.key} checked={form?.freeShippingCondition === opt?.key} onChange={() => set('freeShippingCondition', opt?.key)} className="accent-primary" />
              {opt?.label}
            </label>
          ))}
        </div>
        {form?.freeShippingCondition === 'min_amount' && (
          <div className="mt-2">
            <CurrencyInput label="Monto mínimo (MXN)" value={form?.freeShippingMinAmount || ''} onChange={v => set('freeShippingMinAmount', v)} accentClass="focus:ring-primary/30" />
          </div>
        )}
        {form?.freeShippingCondition === 'product' && (
          <div className="mt-2">
            <SearchableProductSelector label="Producto" value={form?.freeShippingProduct} onChange={(name, id) => { set('freeShippingProduct', name); set('freeShippingProductId', id); }} />
          </div>
        )}
        {form?.freeShippingCondition === 'category' && (
          <div className="mt-2">
            <SearchableCategorySelector label="Categoría" value={form?.freeShippingCategory} onChange={(name, id) => { set('freeShippingCategory', name); set('freeShippingCategoryId', id); }} />
          </div>
        )}
      </div>
    </div>
  );

  if (form?.benefitType === 'cashback_points') return (
    <div className="space-y-4 mt-4 pt-4 border-t border-border">
      <div>
        <label className={labelCls}>Multiplicador de puntos: <span className="text-primary font-bold">{form?.cashbackPoints}x</span></label>
        <input type="range" min={2} max={10} value={form?.cashbackPoints} onChange={e => set('cashbackPoints', Number(e?.target?.value))} className="w-full accent-primary" />
        <div className="flex justify-between text-xs text-muted-foreground"><span>2x</span><span>10x</span></div>
      </div>
      <div>
        <label className={labelCls}>¿Aplica en?</label>
        <div className="grid grid-cols-3 gap-2">
          {[{ key: 'all', label: 'Todo' }, { key: 'product', label: 'Producto' }, { key: 'category', label: 'Categoría' }]?.map(opt => (
            <label key={opt?.key} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs transition-all ${form?.cashbackAppliesTo === opt?.key ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground hover:border-muted-foreground/40'}`}>
              <input type="radio" name="cashbackAppliesTo" value={opt?.key} checked={form?.cashbackAppliesTo === opt?.key} onChange={() => set('cashbackAppliesTo', opt?.key)} className="accent-primary" />
              {opt?.label}
            </label>
          ))}
        </div>
        {form?.cashbackAppliesTo === 'product' && (
          <div className="mt-2">
            <SearchableProductSelector label="Producto" value={form?.cashbackProductName} onChange={(name, id) => { set('cashbackProductName', name); set('cashbackProductId', id); }} />
          </div>
        )}
        {form?.cashbackAppliesTo === 'category' && (
          <div className="mt-2">
            <SearchableCategorySelector label="Categoría" value={form?.cashbackCategoryName} onChange={(name, id) => { set('cashbackCategoryName', name); set('cashbackCategoryId', id); }} />
          </div>
        )}
      </div>
      <div>
        <label className={labelCls}>Descripción del cashback (opcional)</label>
        <input type="text" value={form?.cashbackDesc || ''} onChange={e => set('cashbackDesc', e?.target?.value)} className={inputCls} />
      </div>
    </div>
  );

  if (form?.benefitType === 'bundle') {
    const totalPrice = (form?.bundleProducts || [])?.reduce((s, p) => s + (Number(p?.price) || 0), 0);
    return (
      <div className="space-y-4 mt-4 pt-4 border-t border-border">
        <div>
          <label className={labelCls}>Productos del combo</label>
          <div className="space-y-2">
            {(form?.bundleProducts || [])?.map((prod, idx) => (
              <div key={idx} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border">
                <div className="flex-1">
                  <SearchableProductSelector
                    label=""
                    value={prod?.name}
                    onChange={(name, id, price) => {
                      const updated = [...(form?.bundleProducts || [])];
                      updated[idx] = { ...updated?.[idx], name, id, price: price || '' };
                      set('bundleProducts', updated);
                    }}
                  />
                </div>
                {prod?.price && (
                  <span className="text-xs font-semibold text-foreground bg-muted px-2 py-1 rounded-lg whitespace-nowrap">${prod?.price}</span>
                )}
                {(form?.bundleProducts || [])?.length > 2 && (
                  <button type="button" onClick={() => { const updated = (form?.bundleProducts || [])?.filter((_, i) => i !== idx); set('bundleProducts', updated); }} className="text-destructive hover:text-destructive/80 p-1">
                    <Icon name="Trash2" size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={() => set('bundleProducts', [...(form?.bundleProducts || []), { id: null, name: '', price: '' }])} className="mt-2 flex items-center gap-1.5 text-xs text-primary hover:underline">
            <Icon name="Plus" size={13} />
            Agregar producto al combo
          </button>
        </div>
        {totalPrice > 0 && (
          <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border">
            <span className="text-sm font-medium text-foreground">Total de productos del combo</span>
            <span className="text-sm font-bold text-foreground">${totalPrice?.toFixed(2)} MXN</span>
          </div>
        )}
        <div>
          <label className={labelCls}>Tipo de descuento del combo</label>
          <div className="space-y-2">
            {[
              { key: 'discount', label: '% de descuento sobre el total' },
              { key: 'special_price', label: 'Precio especial del combo' },
            ]?.map(opt => (
              <label key={opt?.key} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-sm transition-all ${form?.bundleDiscountType === opt?.key ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'}`}>
                <input type="radio" name="bundleDiscountType" value={opt?.key} checked={form?.bundleDiscountType === opt?.key} onChange={() => set('bundleDiscountType', opt?.key)} className="accent-primary" />
                {opt?.label}
              </label>
            ))}
          </div>
          {form?.bundleDiscountType === 'discount' && (
            <div className="mt-3">
              <label className={labelCls}>Descuento: <span className="text-primary font-bold">{form?.bundleDiscount}%</span></label>
              <input type="range" min={5} max={70} value={form?.bundleDiscount} onChange={e => set('bundleDiscount', Number(e?.target?.value))} className="w-full accent-primary" />
              {totalPrice > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Precio final del combo: <strong className="text-foreground">${(totalPrice * (1 - form?.bundleDiscount / 100))?.toFixed(2)} MXN</strong>
                </p>
              )}
            </div>
          )}
          {form?.bundleDiscountType === 'special_price' && (
            <div className="mt-3">
              <CurrencyInput label="Precio especial del combo (MXN)" value={form?.bundleSpecialPrice || ''} onChange={v => set('bundleSpecialPrice', v)} accentClass="focus:ring-primary/30" />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (form?.benefitType === 'quantity_discount') return (
    <div className="space-y-4 mt-4 pt-4 border-t border-border">
      <SearchableProductSelector label="Producto" value={form?.qtyProductName} onChange={(name, id) => { set('qtyProductName', name); set('qtyProductId', id); }} />
      <div>
        <label className={labelCls}>Compra <span className="text-primary font-bold">{form?.qtyBuy}</span> unidades y el siguiente tiene beneficio</label>
        <input type="range" min={1} max={20} value={form?.qtyBuy} onChange={e => set('qtyBuy', Number(e?.target?.value))} className="w-full accent-primary" />
        <div className="flex justify-between text-xs text-muted-foreground"><span>1</span><span>20</span></div>
      </div>
      <div>
        <label className={labelCls}>Beneficio en el siguiente</label>
        <div className="space-y-2">
          {[
            { key: 'free', label: 'Es gratis' },
            { key: 'discount', label: 'Tiene un descuento' },
            { key: 'special_price', label: 'Tiene un precio especial' },
          ]?.map(opt => (
            <label key={opt?.key} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-sm transition-all ${form?.qtyNextBenefit === opt?.key ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'}`}>
              <input type="radio" name="qtyNextBenefit" value={opt?.key} checked={form?.qtyNextBenefit === opt?.key} onChange={() => set('qtyNextBenefit', opt?.key)} className="accent-primary" />
              {opt?.label}
            </label>
          ))}
        </div>
        {form?.qtyNextBenefit === 'discount' && (
          <div className="mt-3">
            <label className={labelCls}>Descuento: <span className="text-primary font-bold">{form?.qtyNextDiscount || 0}%</span></label>
            <input type="range" min={5} max={90} value={form?.qtyNextDiscount || 0} onChange={e => set('qtyNextDiscount', Number(e?.target?.value))} className="w-full accent-primary" />
          </div>
        )}
        {form?.qtyNextBenefit === 'special_price' && (
          <div className="mt-3">
            <CurrencyInput label="Precio especial (MXN)" value={form?.qtyNextSpecialPrice || ''} onChange={v => set('qtyNextSpecialPrice', v)} accentClass="focus:ring-primary/30" />
          </div>
        )}
      </div>
    </div>
  );

  if (form?.benefitType === 'fixed_price') return (
    <div className="space-y-4 mt-4 pt-4 border-t border-border">
      <SearchableProductSelector
        label="Producto o servicio"
        value={form?.fixedPriceProduct}
        onChange={(name, id, price) => {
          set('fixedPriceProduct', name);
          set('fixedPriceProductId', id);
          if (price) set('fixedPriceNormal', price);
        }}
      />
      {form?.fixedPriceNormal && (
        <div className="p-3 bg-muted/40 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground">Precio del catálogo</p>
          <p className="text-sm font-bold text-foreground">${form?.fixedPriceNormal} MXN</p>
        </div>
      )}
      <CurrencyInput label="Precio especial (MXN)" value={form?.fixedPrice || ''} onChange={v => set('fixedPrice', v)} accentClass="focus:ring-primary/30" />
      {form?.fixedPrice && form?.fixedPriceNormal && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-sm text-teal-800">
          El cliente paga <strong>${form?.fixedPrice} MXN</strong> en vez de <strong>${form?.fixedPriceNormal} MXN</strong> — ahorra <strong>${(parseFloat(form?.fixedPriceNormal || 0) - parseFloat(form?.fixedPrice || 0))?.toFixed(2)} MXN</strong>
        </div>
      )}
    </div>
  );

  return null;
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const NuevoCuponPromocionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const coupon = location?.state?.coupon || null;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [activeTab, setActiveTab] = useState('trigger');
  const [triggerMode, setTriggerMode] = useState(null);
  const [selectedTrigger, setSelectedTrigger] = useState(null);
  const [triggerConfig, setTriggerConfig] = useState({});
  const [conflictAlert, setConflictAlert] = useState({ show: false, message: '', action: null });
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [establishments, setEstablishments] = useState([]);
  const [selectedEstablishments, setSelectedEstablishments] = useState([]);

  const [form, setForm] = useState({
    benefitType: coupon?.benefitType || null,
    percentValue: coupon?.benefitValue || 20,
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
    upgradeFromPrice: '',
    upgradeToPrice: '',
    freeShippingCondition: '',
    freeShippingMinAmount: '',
    freeShippingProduct: '',
    freeShippingCategory: '',
    cashbackPoints: 2,
    cashbackAppliesTo: '',
    cashbackProductName: '',
    cashbackCategoryName: '',
    cashbackDesc: '',
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
    title: coupon?.title || '',
    description: coupon?.description || '',
    selectedImage: coupon?.image || null,
    accentColor: coupon?.accentColor || null,
    codeMode: '',
    customCode: '',
    autoCode: generateCode(),
    batchPrefix: 'PROMO-',
    batchQty: 100,
    batchSingleUse: false,
    batchExportFormat: '',
    rulesExpanded: false,
    validFrom: '',
    validUntil: '',
    useEmissionValidity: false,
    emissionValidDays: 7,
    usagePerUser: '',
    totalLimit: '',
    maxBudget: '',
    requireMinPurchase: false,
    minPurchase: '',
    useSchedule: false,
    scheduleDays: [],
    scheduleFrom: '',
    scheduleTo: '',
    audience: '',
    vipLevel: '',
    crmSegment: '',
    isPersonal: false,
    combineWithPromos: false,
    combineWithCoupons: false,
    excludedProducts: '',
    distributionChannel: '',
    crmSegmentDist: '',
    expiryNotifications: false,
    notifyDays: [],
    notifyText: '¡Tu cupón de {nombre_negocio} vence en {X} días! Úsalo antes de que expire.',
    isRecoveryTrigger: false,
    recoveryInactivityDays: 21,
    status: coupon?.status || 'active',
    validEstablishments: '',
    validEstablishmentsList: '',
    customerSegmentType: '',
    customSegmentDesc: '',
    termsCustomText: '',
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

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

  const selectedBenefit = BENEFIT_TYPES?.find(b => b?.key === form?.benefitType);
  const displayCode = form?.codeMode === 'custom' ? (form?.customCode || '--------')
    : form?.codeMode === 'auto' ? form?.autoCode
    : `${form?.batchPrefix}XXXXXX`;

  const handleSubmit = (publish) => {
    navigate('/coupons-management', { state: { saved: true, status: publish ? 'active' : 'draft' } });
  };

  const generateTerms = () => {
    const lines = [];
    const benefitLine = getBenefitTermsLine(form);
    if (benefitLine) lines?.push(benefitLine);
    if (form?.useEmissionValidity) {
      lines?.push(`• Válido por ${form?.emissionValidDays} días desde la fecha de emisión.`);
    } else if (form?.validFrom && form?.validUntil) {
      lines?.push(`• Válido del ${new Date(form.validFrom)?.toLocaleDateString('es-MX')} al ${new Date(form.validUntil)?.toLocaleDateString('es-MX')}.`);
    }
    lines?.push(`• Cada usuario tiene derecho a ${form?.usagePerUser === 'unlimited' ? 'usos ilimitados' : `${form?.usagePerUser} uso(s)`} de este cupón.`);
    if (form?.requireMinPurchase && form?.minPurchase) lines?.push(`• Aplica en compras mínimas de $${form?.minPurchase} MXN.`);
    if (form?.validEstablishments === 'specific' && form?.validEstablishmentsList) {
      lines?.push(`• Válido únicamente en: ${form?.validEstablishmentsList}.`);
    } else {
      lines?.push(`• Válido en todos los establecimientos participantes.`);
    }
    if (form?.customerSegmentType === 'new') lines?.push(`• Exclusivo para clientes nuevos.`);
    else if (form?.customerSegmentType === 'vip') lines?.push(`• Dirigido a clientes con nivel VIP.`);
    else if (form?.customerSegmentType === 'custom' && form?.customSegmentDesc) lines?.push(`• Dirigido a: ${form?.customSegmentDesc}.`);
    lines?.push(form?.isPersonal ? `• Cupón personal e intransferible. Solo válido para el usuario asignado.` : `• Cupón transferible. Puede compartirse con otras personas.`);
    lines?.push(form?.combineWithPromos ? `• Aplica en combinación con otras promociones vigentes.` : `• No aplica en combinación con otras promociones.`);
    if (!form?.combineWithCoupons) lines?.push(`• No acumulable con otros cupones en la misma compra.`);
    if (form?.excludedProducts) lines?.push(`• No aplica en: ${form?.excludedProducts}.`);
    if (form?.useSchedule && form?.scheduleDays?.length > 0) {
      const dayNames = form?.scheduleDays?.map(d => DAYS_OF_WEEK?.find(x => x?.key === d)?.label)?.join(', ');
      lines?.push(`• Válido únicamente los días: ${dayNames}, de ${form?.scheduleFrom} a ${form?.scheduleTo} hrs.`);
    }
    lines?.push(`• El negocio se reserva el derecho de modificar o cancelar esta promoción en cualquier momento.`);
    set('termsCustomText', lines?.join('\n'));
  };

  const currentTabIndex = TABS?.findIndex(t => t?.id === activeTab);
  const canGoNext = currentTabIndex < TABS?.length - 1;
  const canGoPrev = currentTabIndex > 0;

  const breadcrumbItems = [
    { label: 'Cupones', href: '/coupons-management' },
    { label: coupon ? 'Editar Cupón de Promoción' : 'Nuevo Cupón de Promoción' },
  ];

  // ── TAB RENDERERS ─────────────────────────────────────────────────────────

  const renderTriggerTab = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
          <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">1</span>
          ¿Cómo se distribuye este cupón?
        </h3>
        <p className="text-xs text-muted-foreground ml-8">Define si el cupón se entrega manualmente o se activa automáticamente por un evento</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => { setTriggerMode('manual'); setSelectedTrigger(null); setConflictAlert({ show: false }); }}
          className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${triggerMode === 'manual' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'}`}
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${triggerMode === 'manual' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
            <Icon name="Hand" size={18} />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">Sin trigger (distribución directa)</p>
            <p className="text-xs text-muted-foreground mt-0.5">El cupón existe y el negocio lo distribuye por los canales que elija. Sin automatización.</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {['Público en ficha', 'QR imprimible', 'CRM', 'WhatsApp']?.map(tag => (
                <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setTriggerMode('automatic')}
          className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${triggerMode === 'automatic' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'}`}
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${triggerMode === 'automatic' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
            <Icon name="Zap" size={18} />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">Con trigger (automático)</p>
            <p className="text-xs text-muted-foreground mt-0.5">El cupón se genera y envía automáticamente cuando ocurre un evento específico.</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {['Comportamiento', 'Temporal', 'Lealtad', 'Canal']?.map(tag => (
                <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        </button>
      </div>

      {conflictAlert?.show && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Icon name="AlertTriangle" size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">Conflicto detectado</p>
              <p className="text-xs text-amber-700 mt-1">{conflictAlert?.message} El mismo cliente podría recibir dos cupones simultáneamente.</p>
              <div className="flex gap-2 mt-3">
                <button type="button" className="px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 transition-colors">Reemplazar cupón de recuperación</button>
                <button type="button" className="px-3 py-1.5 border border-amber-300 text-amber-700 text-xs font-medium rounded-lg hover:bg-amber-100 transition-colors">Coexistir (definir prioridad)</button>
                <button type="button" onClick={() => setConflictAlert({ show: false })} className="px-3 py-1.5 text-amber-600 text-xs font-medium rounded-lg hover:bg-amber-100 transition-colors">Ignorar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {triggerMode === 'automatic' && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Selecciona el trigger que activará este cupón:</p>
          {TRIGGER_CATEGORIES?.map(cat => (
            <div key={cat?.key} className="border border-border rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedCategory(expandedCategory === cat?.key ? null : cat?.key)}
                className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat?.bg} ${cat?.border} border`}>
                    <Icon name={cat?.icon} size={15} className={cat?.color} />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{cat?.label}</span>
                  <span className="text-xs text-muted-foreground">({cat?.triggers?.length} triggers)</span>
                  {cat?.triggers?.some(t => t?.key === selectedTrigger) && (
                    <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-medium">Seleccionado</span>
                  )}
                </div>
                <Icon name={expandedCategory === cat?.key ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground" />
              </button>
              {expandedCategory === cat?.key && (
                <div className="border-t border-border divide-y divide-border">
                  {cat?.triggers?.map(trigger => {
                    const isSelected = selectedTrigger === trigger?.key;
                    return (
                      <div key={trigger?.key} className={`transition-colors ${isSelected ? 'bg-primary/5' : 'bg-card hover:bg-muted/20'}`}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTrigger(trigger?.key);
                            if (trigger?.key === 'inactivity') {
                              setConflictAlert({ show: true, message: 'Ya tienes un cupón de recuperación activo con criterio de inactividad similar.', action: null });
                            } else {
                              setConflictAlert({ show: false, message: '', action: null });
                            }
                          }}
                          className="w-full flex items-start gap-3 px-4 py-3 text-left"
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border ${isSelected ? `${cat?.bg} ${cat?.border}` : 'bg-muted border-border'}`}>
                            <Icon name={trigger?.icon} size={15} className={isSelected ? cat?.color : 'text-muted-foreground'} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>{trigger?.label}</span>
                              {trigger?.badge && (
                                <span className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-200 px-1.5 py-0.5 rounded-full">{trigger?.badge}</span>
                              )}
                              <span className="text-xs text-muted-foreground ml-auto">{trigger?.est}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{trigger?.desc}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/40'}`}>
                            {isSelected && <Icon name="Check" size={11} className="text-white" />}
                          </div>
                        </button>
                        {isSelected && trigger?.fields?.length > 0 && (
                          <div className={`px-4 pb-4 ${cat?.bg} border-t ${cat?.border}`}>
                            <TriggerConfigFields triggerKey={trigger?.key} triggerConfig={triggerConfig} setTriggerConfig={setTriggerConfig} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
          {selectedTrigger && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
              <Icon name="CheckCircle" size={16} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Trigger configurado: <strong>{TRIGGER_CATEGORIES?.flatMap(c => c?.triggers)?.find(t => t?.key === selectedTrigger)?.label}</strong>
                </p>
                <p className="text-xs text-green-700 mt-0.5">El cupón se enviará automáticamente cuando se cumpla esta condición.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderBenefitTab = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
          <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">2</span>
          Tipo de beneficio
        </h3>
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
          <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">3</span>
          Identidad visual
        </h3>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Título del cupón <span className="text-muted-foreground text-xs">({form?.title?.length}/40)</span></label>
        <input type="text" maxLength={40} value={form?.title} onChange={e => set('title', e?.target?.value)} placeholder="Ej: 20% OFF en tu próxima visita" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Descripción <span className="text-muted-foreground text-xs">({form?.description?.length}/120)</span></label>
        <textarea maxLength={120} value={form?.description} onChange={e => set('description', e?.target?.value)} rows={2} placeholder="Ej: Descuento exclusivo para clientes frecuentes. Válido en todos los productos del menú." className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Imagen del cupón</label>
        <div className="grid grid-cols-4 gap-2">
          {TEMPLATE_IMAGES?.map(img => (
            <button key={img?.key} type="button" onClick={() => set('selectedImage', img?.url)} className={`relative rounded-lg overflow-hidden h-14 border-2 transition-all ${form?.selectedImage === img?.url ? 'border-primary shadow-md' : 'border-transparent hover:border-muted-foreground/40'}`}>
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
            <button key={color} type="button" onClick={() => set('accentColor', color)} className={`w-7 h-7 rounded-full border-2 transition-all ${form?.accentColor === color ? 'border-foreground scale-110 shadow-md' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: color }} title={color} />
          ))}
        </div>
      </div>
    </div>
  );

  const renderCodeTab = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
          <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">4</span>
          Código del cupón
        </h3>
      </div>
      <div className="space-y-3">
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
          <Input label="Código personalizado (4-20 caracteres)" value={form?.customCode} onChange={e => set('customCode', e?.target?.value?.toUpperCase()?.replace(/[OI01L]/g, ''))} maxLength={20} placeholder="Ej: VERANO25" />
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
              <Input label="Prefijo" value={form?.batchPrefix} onChange={e => set('batchPrefix', e?.target?.value?.toUpperCase())} placeholder="Ej: PROMO-" />
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
  );

  const renderRulesTab = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
          <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">5</span>
          Reglas y condiciones
        </h3>
      </div>

      {/* Vigencia */}
      <div className="border border-border rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Icon name="Calendar" size={15} className="text-primary" />
          Vigencia
        </p>
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
      </div>

      {/* Cantidad de cupones por usuario */}
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
      </div>

      {/* Establecimientos */}
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
              <textarea value={form?.validEstablishmentsList} onChange={e => set('validEstablishmentsList', e?.target?.value)} rows={2} placeholder="Ej: Sucursal Centro, Sucursal Norte, Sucursal Polanco" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              <p className="text-xs text-muted-foreground mt-1">Separa los establecimientos con comas.</p>
            </div>
          )}
        </div>
      </div>

      {/* Segmento */}
      <div className="border border-border rounded-xl p-4">
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Icon name="Users" size={15} className="text-primary" />
          Segmento / Tipo de clientes
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
            <input type="text" value={form?.customSegmentDesc} onChange={e => set('customSegmentDesc', e?.target?.value)} placeholder="Ej: Clientes que compraron más de $500 en el último mes" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        )}
      </div>

      {/* Transferibilidad */}
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

      {/* Combinabilidad */}
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

      {/* Límites avanzados */}
      <div className="border border-border rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Icon name="Settings" size={15} className="text-primary" />
          Límites avanzados
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Límite total de canjes</label>
            <input type="number" value={form?.totalLimit} onChange={e => set('totalLimit', e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Presupuesto máx. (MXN)</label>
            <input type="number" value={form?.maxBudget} onChange={e => set('maxBudget', e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
          <div>
            <p className="text-sm font-medium text-foreground">Monto mínimo de compra</p>
            <p className="text-xs text-muted-foreground mt-0.5">Solo aplica en compras de $X MXN o más</p>
          </div>
          <Toggle value={form?.requireMinPurchase} onChange={v => set('requireMinPurchase', v)} />
        </div>
        {form?.requireMinPurchase && (
          <CurrencyInput label="Monto mínimo (MXN)" value={form?.minPurchase || ''} onChange={v => set('minPurchase', v)} />
        )}
        <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
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
                  <button key={d?.key} type="button" onClick={() => toggleDay(d?.key)} className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${form?.scheduleDays?.includes(d?.key) ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-muted-foreground/40'}`}>
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
          </div>
        )}
      </div>

      {/* Productos excluidos */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Productos o categorías excluidas</label>
        <textarea value={form?.excludedProducts} onChange={e => set('excludedProducts', e?.target?.value)} rows={2} placeholder="Ej: Bebidas alcohólicas, Productos en oferta, Menú del día" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        <p className="text-xs text-muted-foreground mt-1">Separa con comas.</p>
      </div>
    </div>
  );

  const renderChannelTab = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
          <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">6</span>
          Canal de distribución
        </h3>
      </div>
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
        <Input label="Segmento CRM" value={form?.crmSegmentDist} onChange={e => set('crmSegmentDist', e?.target?.value)} />
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

      {/* NFC */}
      <div className="bg-card border border-border rounded-xl p-4">
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
  );

  const renderNotificationsTab = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
          <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">7</span>
          Notificaciones de vencimiento
        </h3>
      </div>
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
                <button key={d} type="button" onClick={() => toggleNotifyDay(d)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form?.notifyDays?.includes(d) ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-muted-foreground/40'}`}>
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
  );

  const renderTermsTab = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
          <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">8</span>
          Términos y condiciones
        </h3>
      </div>
      <div className="bg-muted/40 border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Icon name="FileText" size={13} className="text-primary" />
            Resumen generado automáticamente
          </p>
          <button type="button" onClick={generateTerms} className="text-xs text-primary hover:underline flex items-center gap-1">
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
        <textarea value={form?.termsCustomText} onChange={e => set('termsCustomText', e?.target?.value)} rows={6} placeholder="Ej: • Descuento del 20% en cualquier producto del menú.&#10;• Válido por 15 días desde la fecha de emisión.&#10;• Cada usuario tiene derecho a 1 uso de este cupón.&#10;• Válido en todos los establecimientos participantes.&#10;• Cupón personal e intransferible.&#10;• No aplica en combinación con otras promociones." className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none font-mono" />
        <p className="text-xs text-muted-foreground mt-1">Este texto aparecerá en el cupón digital del usuario.</p>
      </div>
      <div>
        <p className="text-xs font-medium text-foreground mb-2">Cláusulas frecuentes</p>
        <div className="flex flex-wrap gap-2">
          {[
            'No aplica en días festivos.',
            'Sujeto a disponibilidad.',
            'No reembolsable ni canjeable por efectivo.',
            'No aplica en productos ya en oferta.',
            'Válido solo para consumo en establecimiento.',
            'Presentar cupón antes de ordenar.',
          ]?.map(clause => (
            <button
              key={clause}
              type="button"
              onClick={() => set('termsCustomText', (form?.termsCustomText ? form?.termsCustomText + '\n' : '') + `• ${clause}`)}
              className="px-2.5 py-1 bg-muted border border-border text-xs text-foreground rounded-lg hover:border-primary hover:text-primary transition-colors"
            >
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
          <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">6</span>
          Establecimiento
        </h3>
        <p className="text-xs text-muted-foreground ml-8">Selecciona en qué establecimientos se visualizará y podrá canjearse este cupón</p>
      </div>
      {establishments?.length === 0 ? (
        <div className="p-4 bg-muted/30 rounded-xl text-center">
          <Icon name="MapPin" size={24} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No hay establecimientos registrados. El cupón aplicará en todos los establecimientos.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedEstablishments?.length === 0 ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}>
            <input
              type="checkbox"
              checked={selectedEstablishments?.length === 0}
              onChange={() => setSelectedEstablishments([])}
              className="w-4 h-4 rounded accent-primary"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Todos los establecimientos</p>
              <p className="text-xs text-muted-foreground">El cupón aplica en todos los establecimientos activos</p>
            </div>
            {selectedEstablishments?.length === 0 && <Icon name="Check" size={14} className="text-primary ml-auto" />}
          </label>
          {establishments?.map(est => {
            const isSelected = selectedEstablishments?.includes(est?.id);
            return (
              <label key={est?.id}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {
                    if (isSelected) setSelectedEstablishments(prev => prev?.filter(id => id !== est?.id));
                    else setSelectedEstablishments(prev => [...prev, est?.id]);
                  }}
                  className="w-4 h-4 rounded accent-primary"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{est?.location_name}</p>
                  {est?.location_code && <p className="text-xs text-muted-foreground">Código: {est?.location_code}</p>}
                </div>
                {isSelected && <Icon name="Check" size={14} className="text-primary" />}
              </label>
            );
          })}
        </div>
      )}
      {selectedEstablishments?.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-2">
          <Icon name="Info" size={14} className="text-primary flex-shrink-0" />
          <p className="text-xs text-primary">
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
      case 'code': return renderCodeTab();
      case 'rules': return renderRulesTab();
      case 'establishments': return renderEstablishmentsTab();
      case 'channel': return renderChannelTab();
      case 'notifications': return renderNotificationsTab();
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
            <span className="text-foreground font-medium">{coupon ? 'Editar Cupón de Promoción' : 'Nuevo Cupón de Promoción'}</span>
          </nav>

          {/* Page Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {coupon ? 'Editar Cupón de Promoción' : 'Nuevo Cupón de Promoción'}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {coupon ? 'Actualiza la información del cupón de promoción' : 'Completa la información del nuevo cupón de promoción'}
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/coupons-management')}>
              Cancelar
            </Button>
          </div>

          {/* ── LIVE PREVIEW ── */}
          <div className="mb-5">
            <CouponLivePreview
              form={form}
              triggerMode={triggerMode}
              selectedTrigger={selectedTrigger}
              displayCode={displayCode}
            />
          </div>

          <div className="flex gap-6 items-start">
            {/* ── WIZARD FORM ── */}
            <div className="flex-1 min-w-0">
              {/* ── WIZARD PROGRESS BAR (business-listing style) ── */}
              <div className="bg-card border border-border rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">Progreso del wizard</span>
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                      {TABS?.[currentTabIndex]?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground hidden sm:block">Paso {currentTabIndex + 1} de {TABS?.length}</span>
                    <span className="text-sm font-bold text-primary">{Math.round(((currentTabIndex + 1) / TABS?.length) * 100)}%</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-4">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
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
                              ? 'bg-primary/10 text-primary'
                              : isPast
                              ? 'text-green-600 hover:bg-green-50 cursor-pointer' :'text-muted-foreground hover:bg-muted cursor-pointer'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                            isActive
                              ? 'bg-primary text-white shadow-sm'
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
                          <button key={tab?.id} type="button" onClick={() => setActiveTab(tab?.id)}
                            title={tab?.label}
                            className={`rounded-full transition-all ${isActive ? 'w-6 h-2 bg-primary' : isPast ? 'w-2 h-2 bg-green-500' : 'w-2 h-2 bg-muted hover:bg-muted-foreground'}`} />
                        );
                      })}
                    </div>

                    {canGoNext ? (
                      <button
                        type="button"
                        onClick={() => setActiveTab(TABS?.[currentTabIndex + 1]?.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-all"
                      >
                        Siguiente
                        <Icon name="ChevronRight" size={16} />
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => handleSubmit(false)}>
                          <Icon name="Save" size={14} className="mr-1.5" />
                          Borrador
                        </Button>
                        <Button onClick={() => handleSubmit(true)} iconName="Save" iconPosition="left">
                          {form?.codeMode === 'batch' ? `Generar ${form?.batchQty} cupones` : 'Publicar cupón'}
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
                  <Button variant="outline" onClick={() => handleSubmit(false)}>
                    <Icon name="Save" size={15} className="mr-2" />
                    Guardar borrador
                  </Button>
                  <Button onClick={() => handleSubmit(true)} iconName="Save" iconPosition="left">
                    {form?.codeMode === 'batch' ? `Generar ${form?.batchQty} cupones` : 'Publicar cupón'}
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

export default NuevoCuponPromocionPage;
