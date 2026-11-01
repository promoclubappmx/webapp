import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { SearchableProductSelector } from '../../components/ui/SearchableSelector';

// ─── Constants ───────────────────────────────────────────────────────────────

const REWARD_TYPES = [
  { key: 'free_product', label: 'Producto gratis', icon: 'Gift', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-300', desc: 'Desbloquea un producto sin costo' },
  { key: 'pct_discount', label: '% Descuento', icon: 'Percent', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-300', desc: 'Porcentaje de descuento sobre el total' },
  { key: 'fixed_discount', label: 'Monto fijo', icon: 'Banknote', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-300', desc: '$X MXN de descuento directo' },
  { key: 'combo', label: 'Combo', icon: 'Package', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-300', desc: 'Conjunto de productos canjeables juntos' },
  { key: 'sorpresa', label: 'Sorpresa', icon: 'Sparkles', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-300', desc: 'Activa una sorpresa con puntos' },
];

const ACCENT_COLORS = [
  '#2563EB', '#059669', '#7C3AED', '#D97706', '#0891B2',
  '#DC2626', '#EA580C', '#65A30D', '#0D9488', '#DB2777',
];

const TEMPLATE_IMAGES = [
  { key: 'food', label: 'Comida', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=225&fit=crop' },
  { key: 'drink', label: 'Bebida', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=225&fit=crop' },
  { key: 'beauty', label: 'Belleza', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=225&fit=crop' },
  { key: 'fitness', label: 'Fitness', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=225&fit=crop' },
  { key: 'retail', label: 'Retail', url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=225&fit=crop' },
  { key: 'generic', label: 'Genérico', url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=225&fit=crop' },
];

const DAYS_OF_WEEK = [
  { key: 'mon', label: 'Lun' }, { key: 'tue', label: 'Mar' }, { key: 'wed', label: 'Mié' },
  { key: 'thu', label: 'Jue' }, { key: 'fri', label: 'Vie' }, { key: 'sat', label: 'Sáb' }, { key: 'sun', label: 'Dom' },
];

const VIP_LEVELS = [
  { id: 'all', label: 'Disponible para todos' },
  { id: 'bronze', label: 'Solo Bronce+' },
  { id: 'silver', label: 'Solo Plata+' },
  { id: 'gold', label: 'Solo Oro' },
  { id: 'platinum', label: 'Solo Platino' },
];

const TRIGGER_CATEGORIES = [
  {
    key: 'behavior',
    label: 'Comportamiento del cliente',
    icon: 'Activity',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    triggers: [
      { key: 'first_visit', label: 'Primera visita', icon: 'Star', desc: 'Recompensa de bienvenida al visitar por primera vez', est: '~5/mes', fields: [] },
      { key: 'visit_count', label: 'Número de visitas acumuladas', icon: 'MapPin', desc: 'Desbloquear cuando el cliente alcance N visitas', est: '~20/mes', fields: ['visit_threshold'] },
      { key: 'spend_amount', label: 'Monto acumulado gastado', icon: 'TrendingUp', desc: 'Desbloquear cuando el cliente haya gastado $X MXN en total', est: '~8/mes', fields: ['spend_threshold'] },
      { key: 'checkin_today', label: 'Al hacer check-in hoy', icon: 'CheckCircle', desc: 'Recompensa sorpresa entregada directamente al validar la visita', est: '~30/mes', fields: [] },
      { key: 'inactivity', label: 'Al no visitar en X días', icon: 'Clock', desc: 'Desbloquear si el cliente lleva N días sin visitar', est: '~15/mes', fields: ['inactivity_days'] },
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
      { key: 'review', label: 'Al dejar una reseña verificada', icon: 'Star', desc: 'El cliente recibe la recompensa después de publicar una reseña', est: '~10/mes', fields: [] },
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
      { key: 'level_up', label: 'Al subir de nivel VIP', icon: 'TrendingUp', desc: 'El cliente recibe la recompensa cuando sube a Plata / Oro', est: '~5/mes', fields: ['level_up_target'] },
      { key: 'active_level', label: 'Por nivel VIP activo', icon: 'Shield', desc: 'Solo disponible para clientes con nivel específico activo', est: 'Permanente', fields: ['active_level_min'] },
      { key: 'punch_card', label: 'Al completar una punch card', icon: 'Grid', desc: 'Generado automáticamente cuando se completa la tarjeta', est: '~7/mes', fields: ['punch_card_name'] },
    ],
  },
  {
    key: 'points',
    label: 'Puntos de lealtad',
    icon: 'Star',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    triggers: [
      { key: 'points_milestone', label: 'Al alcanzar X puntos acumulados', icon: 'Zap', desc: 'La recompensa se desbloquea cuando el cliente acumula N puntos totales', est: '~10/mes', fields: ['points_threshold'] },
      { key: 'points_near_reward', label: 'Al estar cerca de otra recompensa', icon: 'Target', desc: 'Recompensa de motivación cuando le faltan pocos puntos para otra', est: '~15/mes', fields: [] },
    ],
  },
];

const TABS = [
  { id: 'distribution', label: 'Distribución', icon: 'Zap' },
  { id: 'benefit', label: 'Beneficio', icon: 'Gift' },
  { id: 'identity', label: 'Identidad', icon: 'Palette' },
  { id: 'validity', label: 'Vigencia', icon: 'Clock' },
  { id: 'restrictions', label: 'Restricciones', icon: 'Shield' },
  { id: 'channel', label: 'Canal', icon: 'Share2' },
  { id: 'notifications', label: 'Notificaciones', icon: 'Bell' },
  { id: 'establishment', label: 'Establecimiento', icon: 'MapPin' },
  { id: 'terms', label: 'Términos', icon: 'FileText' },
];

const INITIAL_FORM = {
  // Distribution
  distributionType: null,
  // Benefit
  rewardType: null,
  pointsCost: '',
  benefitValue: '',
  benefitProductName: '',
  benefitProductPrice: '',
  // Identity
  title: '',
  description: '',
  accentColor: ACCENT_COLORS?.[0],
  selectedImage: TEMPLATE_IMAGES?.[0]?.url,
  // Validity
  validityType: 'no_expiry',
  validityDays: 30,
  validityDate: '',
  // Schedule restrictions
  restrictSchedule: false,
  scheduleDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  scheduleFrom: '08:00',
  scheduleTo: '17:00',
  // Redemption limits
  maxRedemptionsPerCustomer: '',
  redemptionPeriod: 'forever',
  // Min purchase
  minPurchaseRequired: false,
  minPurchaseAmount: '',
  // Combinable
  combinableWithCoupons: false,
  // Excluded categories
  hasExcludedCategories: false,
  excludedCategories: [],
  // Inventory
  hasInventory: false,
  inventoryTotal: '',
  inventoryBehavior: 'deactivate',
  // Redemption message
  redemptionMessage: '',
  // Combo fields
  comboProducts: [{ id: null, name: '', price: '' }, { id: null, name: '', price: '' }],
  comboDiscountType: '',
  comboDiscount: 0,
  comboSpecialPrice: '',
  // Sorpresa fields
  surprisePointsCost: '',
  selectedSurpriseId: null,
  selectedSurpriseName: '',
  // Channel distribution
  channelPublicProfile: false,
  channelCRMSegment: false,
  channelCRMVipLevels: [],
  channelQRPrintable: false,
  channelFlow: false,
  channelNFC: false,
  // Notifications
  notifyNearPoints: false,
  notifyThreshold: 80,
  // Establishment
  establishmentScope: 'all',
  selectedEstablishments: [],
  // Terms
  terms: '',
  termsCustomText: '',
  // VIP
  vipLevel: 'all',
  status: 'active',
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

const SectionHeader = ({ num, title, subtitle = '' }) => (
  <div className="mb-4">
    <h3 className="font-semibold text-foreground flex items-center gap-2">
      <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">{num}</span>
      {title}
    </h3>
    {subtitle && <p className="text-xs text-muted-foreground mt-0.5 ml-8">{subtitle}</p>}
  </div>
);

// ─── Trigger Config Fields ────────────────────────────────────────────────────

const TriggerConfigFields = ({ triggerKey, triggerConfig, setTriggerConfig }) => {
  const set = (k, v) => setTriggerConfig(prev => ({ ...prev, [k]: v }));

  if (triggerKey === 'visit_count') return (
    <div className="flex items-center gap-2 mt-3">
      <span className="text-sm text-muted-foreground">Desbloquear cuando el cliente alcance</span>
      <input type="number" min={1} max={100} value={triggerConfig?.visit_threshold || 5} onChange={e => set('visit_threshold', Number(e?.target?.value))} className="w-20 px-2 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-center font-bold" />
      <span className="text-sm text-muted-foreground">visitas acumuladas</span>
    </div>
  );

  if (triggerKey === 'spend_amount') return (
    <div className="flex items-center gap-2 mt-3">
      <span className="text-sm text-muted-foreground">Desbloquear cuando haya gastado</span>
      <div className="flex items-center border border-border rounded-lg overflow-hidden">
        <span className="px-2 py-1.5 bg-muted text-sm text-muted-foreground">$</span>
        <input type="number" min={1} value={triggerConfig?.spend_threshold || 500} onChange={e => set('spend_threshold', Number(e?.target?.value))} className="w-24 px-2 py-1.5 bg-background text-foreground text-sm focus:outline-none font-bold" />
      </div>
      <span className="text-sm text-muted-foreground">MXN en total</span>
    </div>
  );

  if (triggerKey === 'inactivity') return (
    <div className="flex items-center gap-2 mt-3">
      <span className="text-sm text-muted-foreground">Desbloquear si lleva</span>
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

  if (triggerKey === 'points_milestone') return (
    <div className="flex items-center gap-2 mt-3">
      <span className="text-sm text-muted-foreground">Al acumular</span>
      <input type="number" min={1} value={triggerConfig?.points_threshold || 500} onChange={e => set('points_threshold', Number(e?.target?.value))} className="w-24 px-2 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-center font-bold" />
      <span className="text-sm text-muted-foreground">puntos totales</span>
    </div>
  );

  return null;
};

// ─── Live Preview ─────────────────────────────────────────────────────────────

const RewardLivePreview = ({ form, previewMode, setPreviewMode, triggerMode, selectedTrigger }) => {
  const typeInfo = REWARD_TYPES?.find(t => t?.key === form?.rewardType) || REWARD_TYPES?.[0];
  const benefitLabel = form?.rewardType === 'pct_discount' ? `${form?.benefitValue || '?'}% OFF`
    : form?.rewardType === 'fixed_discount' ? `$${form?.benefitValue || '?'} OFF`
    : form?.rewardType === 'combo' ? (() => {
        const total = (form?.comboProducts || [])?.reduce((s, p) => s + (Number(p?.price) || 0), 0);
        if (form?.comboDiscountType === 'special_price' && form?.comboSpecialPrice) return `Combo $${form?.comboSpecialPrice} MXN`;
        if (total > 0 && form?.comboDiscountType === 'discount' && form?.comboDiscount > 0) return `Combo ${form?.comboDiscount}% OFF`;
        return 'Combo';
      })()
    : form?.rewardType === 'sorpresa' ? `Sorpresa — ${form?.surprisePointsCost || '?'} pts`
    : form?.benefitProductName || form?.title || 'Recompensa';

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
          <Icon name="Eye" size={15} className="text-primary" />
          Vista previa — App B2C
        </h3>
        <div className="flex gap-1">
          {['card', 'redeem']?.map(m => (
            <button key={m} onClick={() => setPreviewMode(m)}
              className={`px-2 py-1 text-xs rounded-lg border transition-all ${previewMode === m ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
              {m === 'card' ? 'Tarjeta' : 'Al canjear'}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-4 flex-wrap">
        {previewMode === 'card' ? (
          <div className="rounded-2xl overflow-hidden shadow-lg border border-border flex-1 min-w-[220px] max-w-xs">
            <div className="relative h-28">
              <img src={form?.selectedImage || TEMPLATE_IMAGES?.[0]?.url} alt="Vista previa de la recompensa en la app B2C" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="text-white font-bold text-lg leading-tight">{benefitLabel}</div>
                <div className="text-white/80 text-xs">{form?.title || 'Nombre de la recompensa'}</div>
              </div>
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-medium">Recompensa</span>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: form?.accentColor || ACCENT_COLORS?.[0] }} />
              </div>
            </div>
            <div className="bg-card p-3 space-y-2">
              <div className="text-xs text-muted-foreground line-clamp-2">{form?.description || 'Descripción de la recompensa'}</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Icon name="Star" size={14} className="text-amber-500" />
                  <span className="text-lg font-bold text-foreground">{(form?.pointsCost || 0)?.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">pts</span>
                </div>
                <button className="px-3 py-1.5 text-xs font-medium text-white rounded-lg" style={{ backgroundColor: form?.accentColor || ACCENT_COLORS?.[0] }}>
                  Canjear
                </button>
              </div>
              {form?.validityType === 'days_from_redemption' && (
                <div className="text-xs text-muted-foreground">Válida {form?.validityDays} días desde el canje</div>
              )}
              {form?.validityType === 'fixed_date' && form?.validityDate && (
                <div className="text-xs text-muted-foreground">Válida hasta: {new Date(form.validityDate)?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              )}
              <div className="h-1 rounded-full" style={{ backgroundColor: form?.accentColor || ACCENT_COLORS?.[0] }} />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden shadow-lg border border-border flex-1 min-w-[220px] max-w-xs bg-card">
            <div className="p-4 space-y-3">
              <div className="text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2 ${typeInfo?.bg}`}>
                  <Icon name={typeInfo?.icon} size={28} className={typeInfo?.color} />
                </div>
                <p className="font-bold text-foreground">{form?.title || 'Recompensa'}</p>
                <p className="text-xs text-muted-foreground mt-1">{form?.redemptionMessage?.replace('{recompensa}', form?.title || 'recompensa')?.replace('{nombre_cliente}', 'Cliente')?.replace('{negocio}', 'Tu negocio') || 'Mensaje de canje'}</p>
              </div>
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border">
                  <div className="text-center">
                    <Icon name="QrCode" size={40} className="text-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">QR de canje</p>
                  </div>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2 text-center">
                <p className="text-xs font-mono font-bold text-foreground tracking-widest">PROMO-XXXX</p>
                <p className="text-xs text-muted-foreground">Código alfanumérico</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 min-w-[180px] space-y-2">
          {triggerMode === 'automatic' && selectedTrigger ? (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-2.5 flex items-center gap-2">
              <Icon name="Zap" size={13} className="text-primary flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-primary">Trigger activo</p>
                <p className="text-xs text-muted-foreground">{TRIGGER_CATEGORIES?.flatMap(c => c?.triggers)?.find(t => t?.key === selectedTrigger)?.label}</p>
              </div>
            </div>
          ) : triggerMode === 'direct' ? (
            <div className="bg-muted/50 border border-border rounded-xl p-2.5 flex items-center gap-2">
              <Icon name="BookOpen" size={13} className="text-muted-foreground flex-shrink-0" />
              <p className="text-xs text-muted-foreground">Catálogo directo</p>
            </div>
          ) : (
            <div className="bg-muted/50 border border-border rounded-xl p-2.5 flex items-center gap-2">
              <Icon name="Zap" size={13} className="text-muted-foreground flex-shrink-0" />
              <p className="text-xs text-muted-foreground">Distribución no configurada</p>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center gap-2">
            <Icon name="Star" size={13} className="text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-700">Costo de canje</p>
              <p className="text-xs text-amber-600">{(form?.rewardType === 'sorpresa' ? (form?.surprisePointsCost || 0) : (form?.pointsCost || 0))?.toLocaleString()} puntos</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-2.5 space-y-1.5">
            <h4 className="text-xs font-semibold text-foreground">Resumen</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon name="Clock" size={10} className="text-blue-500" />
                {form?.validityType === 'no_expiry' ? 'Sin vigencia' : form?.validityType === 'days_from_redemption' ? `${form?.validityDays} días desde canje` : 'Fecha fija'}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon name="Users" size={10} className="text-purple-500" />
                {form?.maxRedemptionsPerCustomer ? `Máx. ${form?.maxRedemptionsPerCustomer}x por cliente` : 'Canjes ilimitados'}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon name={form?.combinableWithCoupons ? 'CheckCircle' : 'XCircle'} size={10} className={form?.combinableWithCoupons ? 'text-green-500' : 'text-red-400'} />
                {form?.combinableWithCoupons ? 'Combinable con cupones' : 'No combinable'}
              </div>
              {form?.hasInventory && form?.inventoryTotal && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon name="Package" size={10} className="text-orange-500" />
                  {form?.inventoryTotal} unidades disponibles
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Push notification</p>
            <div className="bg-gray-900 rounded-xl p-2.5 flex items-start gap-2">
              <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="Gift" size={12} className="text-white" />
              </div>
              <div>
                <div className="text-white text-xs font-semibold">PromoClub</div>
                <div className="text-gray-300 text-xs leading-tight">¡Ya puedes canjear: {form?.title || 'Nueva recompensa'}!</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Sorpresa Fields Component ────────────────────────────────────────────────

const SorpresaFields = ({ form, set }) => {
  const [surprises, setSurprises] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadSurprises = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const { data } = await supabase
          ?.from('surprise_rewards_config')
          ?.select('id, mechanic, active')
          ?.eq('business_id', user?.id)
          ?.eq('active', true);
        setSurprises(data || []);
      } catch {
        setSurprises([]);
      } finally {
        setLoading(false);
      }
    };
    loadSurprises();
  }, [user?.id]);

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <SectionHeader num="3" title="Configuración de la sorpresa" subtitle="Define cuántos puntos activan la sorpresa y qué sorpresa se mostrará al cliente" />
      <div>
        <label className="text-xs font-medium text-foreground block mb-1">Puntos para activar la sorpresa <span className="text-destructive">*</span></label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            value={form?.surprisePointsCost || ''}
            onChange={e => set('surprisePointsCost', parseInt(e?.target?.value) || '')}
            placeholder="Ej: 200"
            className="w-36 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-bold text-center"
          />
          <span className="text-sm text-muted-foreground">puntos activan la compra de la sorpresa</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Al acumular estos puntos, el cliente podrá activar y revelar la sorpresa</p>
      </div>
      <div>
        <label className="text-xs font-medium text-foreground block mb-2">Sorpresa activa a mostrar</label>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <Icon name="Loader2" size={14} className="animate-spin" />
            Cargando sorpresas activas...
          </div>
        ) : surprises?.length > 0 ? (
          <div className="space-y-2">
            {surprises?.map(s => (
              <label key={s?.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form?.selectedSurpriseId === s?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                <input
                  type="radio"
                  name="selectedSurprise"
                  value={s?.id}
                  checked={form?.selectedSurpriseId === s?.id}
                  onChange={() => {
                    set('selectedSurpriseId', s?.id);
                    set('selectedSurpriseName', s?.mechanic || 'Sorpresa');
                  }}
                  className="accent-primary"
                />
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-amber-50`}>
                  <Icon name="Sparkles" size={16} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground capitalize">{s?.mechanic || 'Sorpresa'}</p>
                  <p className="text-xs text-muted-foreground">Activa</p>
                </div>
                {form?.selectedSurpriseId === s?.id && (
                  <Icon name="CheckCircle" size={16} className="text-primary ml-auto" />
                )}
              </label>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <Icon name="AlertTriangle" size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">No hay sorpresas activas</p>
              <p className="text-xs text-amber-700 mt-0.5">Ve al módulo de Sorpresas y activa al menos una para poder seleccionarla aquí.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Tab Content Components ───────────────────────────────────────────────────

const TabDistribution = ({ form, set, triggerMode, setTriggerMode, selectedTrigger, setSelectedTrigger, triggerConfig, setTriggerConfig, expandedCategory, setExpandedCategory }) => (
  <div className="space-y-6">
    <div>
      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
        <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">1</span>
        ¿Cómo se distribuye esta recompensa?
      </h3>
      <p className="text-xs text-muted-foreground ml-8">Define si la recompensa está disponible directamente en el catálogo o se activa por un evento</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => { setTriggerMode('direct'); setSelectedTrigger(null); set('distributionType', 'direct'); }}
        className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${triggerMode === 'direct' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'}`}
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${triggerMode === 'direct' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
          <Icon name="BookOpen" size={18} />
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">Catálogo directo</p>
          <p className="text-xs text-muted-foreground mt-0.5">La recompensa aparece en el catálogo de la app B2C y el cliente la canjea cuando quiera.</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {['App B2C', 'Catálogo', 'Autoservicio']?.map(tag => (
              <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={() => { setTriggerMode('automatic'); set('distributionType', 'triggered'); }}
        className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${triggerMode === 'automatic' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'}`}
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${triggerMode === 'automatic' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
          <Icon name="Zap" size={18} />
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">Con trigger (automático)</p>
          <p className="text-xs text-muted-foreground mt-0.5">La recompensa se desbloquea automáticamente cuando el cliente cumple una condición.</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {['Comportamiento', 'Temporal', 'Lealtad', 'Puntos']?.map(tag => (
              <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        </div>
      </button>
    </div>

    {triggerMode === 'automatic' && (
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Selecciona el trigger que activará esta recompensa:</p>
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
                        onClick={() => setSelectedTrigger(trigger?.key)}
                        className="w-full flex items-start gap-3 px-4 py-3 text-left"
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border ${isSelected ? `${cat?.bg} ${cat?.border}` : 'bg-muted border-border'}`}>
                          <Icon name={trigger?.icon} size={15} className={isSelected ? cat?.color : 'text-muted-foreground'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>{trigger?.label}</span>
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
              <p className="text-xs text-green-700 mt-0.5">La recompensa se desbloqueará automáticamente cuando se cumpla esta condición.</p>
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);

const TabBenefit = ({ form, set }) => (
  <div className="space-y-6">
    <SectionHeader num="1" title="Tipo de recompensa" subtitle="¿Qué recibe el cliente al canjear sus puntos?" />
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {REWARD_TYPES?.map(t => (
        <button key={t?.key} onClick={() => set('rewardType', t?.key)}
          className={`p-3 rounded-xl border-2 text-left transition-all ${form?.rewardType === t?.key ? `border-primary bg-primary/5` : 'border-border hover:border-primary/30'}`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${t?.bg}`}>
            <Icon name={t?.icon} size={16} className={t?.color} />
          </div>
          <p className="text-xs font-semibold text-foreground">{t?.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{t?.desc}</p>
        </button>
      ))}
    </div>

    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <SectionHeader num="2" title="Costo en puntos" subtitle="¿Cuántos puntos necesita el cliente para canjear esta recompensa?" />
      {form?.rewardType === 'sorpresa' ? (
        <p className="text-xs text-muted-foreground">El costo en puntos se configura en la sección de Sorpresa a continuación.</p>
      ) : (
      <div className="flex items-center gap-3">
        <input type="number" min={1} value={form?.pointsCost || ''} onChange={e => set('pointsCost', parseInt(e?.target?.value) || '')}
          placeholder="Ej: 100"
          className="w-36 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-bold text-center" />
        <span className="text-sm text-muted-foreground">puntos</span>
        {form?.pointsCost ? <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">≈ ${((form?.pointsCost || 0) * 0.15)?.toFixed(2)} MXN</span> : null}
      </div>
      )}
    </div>

    {/* Producto gratis: selector de producto/servicio + precio */}
    {form?.rewardType === 'free_product' && (
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <SectionHeader num="3" title="Producto o servicio" subtitle="Especifica el producto o servicio que recibirá el cliente de forma gratuita" />
        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Producto o servicio <span className="text-destructive">*</span></label>
          <SearchableProductSelector
            value={form?.benefitProductName || ''}
            onChange={(name, item) => {
              set('benefitProductName', name);
              set('benefitProductId', item?.id || null);
              if (item?.price) set('benefitProductPrice', item?.price);
            }}
            placeholder="Buscar producto o servicio en el catálogo..."
          />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Precio del producto o servicio</label>
          <div className="flex items-center border border-border rounded-lg overflow-hidden w-48">
            <span className="px-2 py-2 bg-muted text-sm text-muted-foreground">$</span>
            <input type="number" min={0} step="0.01" value={form?.benefitProductPrice || ''} onChange={e => set('benefitProductPrice', e?.target?.value)}
              placeholder="0.00"
              className="flex-1 px-3 py-2 bg-background text-foreground text-sm focus:outline-none font-medium" />
            <span className="px-2 py-2 bg-muted text-sm text-muted-foreground">MXN</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Precio de referencia del producto para calcular el valor del beneficio</p>
        </div>
      </div>
    )}

    {/* % Descuento: valor del descuento + selector de producto/servicio + precio */}
    {form?.rewardType === 'pct_discount' && (
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <SectionHeader num="3" title="Valor del descuento y producto" subtitle="Define el porcentaje de descuento y el producto o servicio al que aplica" />
        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Porcentaje de descuento <span className="text-destructive">*</span></label>
          <div className="flex items-center border border-border rounded-lg overflow-hidden w-40">
            <input type="number" min={1} max={100} value={form?.benefitValue || ''} onChange={e => set('benefitValue', e?.target?.value)}
              placeholder="Ej: 20"
              className="flex-1 px-3 py-2 bg-background text-foreground text-sm focus:outline-none font-bold text-center" />
            <span className="px-2 py-2 bg-muted text-sm text-muted-foreground">%</span>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Producto o servicio al que aplica</label>
          <SearchableProductSelector
            value={form?.benefitProductName || ''}
            onChange={(name, item) => {
              set('benefitProductName', name);
              set('benefitProductId', item?.id || null);
              if (item?.price) set('benefitProductPrice', item?.price);
            }}
            placeholder="Buscar producto o servicio en el catálogo..."
          />
          <p className="text-xs text-muted-foreground mt-1">Deja vacío si aplica sobre el total de la compra</p>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Precio de referencia del producto o servicio</label>
          <div className="flex items-center border border-border rounded-lg overflow-hidden w-48">
            <span className="px-2 py-2 bg-muted text-sm text-muted-foreground">$</span>
            <input type="number" min={0} step="0.01" value={form?.benefitProductPrice || ''} onChange={e => set('benefitProductPrice', e?.target?.value)}
              placeholder="0.00"
              className="flex-1 px-3 py-2 bg-background text-foreground text-sm focus:outline-none font-medium" />
            <span className="px-2 py-2 bg-muted text-sm text-muted-foreground">MXN</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Precio base sobre el que se calcula el descuento</p>
        </div>
      </div>
    )}

    {/* Monto fijo: valor del descuento + selector de producto/servicio */}
    {form?.rewardType === 'fixed_discount' && (
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <SectionHeader num="3" title="Monto de descuento y producto" subtitle="Define el monto fijo de descuento y el producto o servicio al que aplica" />
        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Monto de descuento <span className="text-destructive">*</span></label>
          <div className="flex items-center border border-border rounded-lg overflow-hidden w-48">
            <span className="px-2 py-2 bg-muted text-sm text-muted-foreground">$</span>
            <input type="number" min={1} step="0.01" value={form?.benefitValue || ''} onChange={e => set('benefitValue', e?.target?.value)}
              placeholder="Ej: 50.00"
              className="flex-1 px-3 py-2 bg-background text-foreground text-sm focus:outline-none font-bold" />
            <span className="px-2 py-2 bg-muted text-sm text-muted-foreground">MXN</span>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Producto o servicio al que aplica</label>
          <SearchableProductSelector
            value={form?.benefitProductName || ''}
            onChange={(name, item) => {
              set('benefitProductName', name);
              set('benefitProductId', item?.id || null);
            }}
            placeholder="Buscar producto o servicio en el catálogo..."
          />
          <p className="text-xs text-muted-foreground mt-1">Deja vacío si aplica sobre el total de la compra</p>
        </div>
      </div>
    )}

    {/* Combo: selector de productos del catálogo + suma de precios + puntos */}
    {form?.rewardType === 'combo' && (
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <SectionHeader num="3" title="Productos del combo" subtitle="Selecciona los productos del catálogo que forman parte de este combo" />
        <div className="space-y-2">
          {(form?.comboProducts || [])?.map((prod, idx) => (
            <div key={idx} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border">
              <div className="flex-1">
                <SearchableProductSelector
                  label=""
                  value={prod?.name}
                  onChange={(name, item) => {
                    const updated = [...(form?.comboProducts || [])];
                    updated[idx] = { ...updated?.[idx], name, id: item?.id || null, price: item?.price || '' };
                    set('comboProducts', updated);
                  }}
                  placeholder={`Producto ${idx + 1}...`}
                />
              </div>
              {prod?.price && (
                <span className="text-xs font-semibold text-foreground bg-muted px-2 py-1 rounded-lg whitespace-nowrap">${prod?.price}</span>
              )}
              {(form?.comboProducts || [])?.length > 2 && (
                <button type="button" onClick={() => {
                  const updated = (form?.comboProducts || [])?.filter((_, i) => i !== idx);
                  set('comboProducts', updated);
                }} className="text-destructive hover:text-destructive/80 p-1">
                  <Icon name="Trash2" size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={() => set('comboProducts', [...(form?.comboProducts || []), { id: null, name: '', price: '' }])}
          className="flex items-center gap-1.5 text-xs text-primary hover:underline">
          <Icon name="Plus" size={13} />
          Agregar producto al combo
        </button>
        {(() => {
          const totalPrice = (form?.comboProducts || [])?.reduce((s, p) => s + (Number(p?.price) || 0), 0);
          return totalPrice > 0 ? (
            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border">
              <span className="text-sm font-medium text-foreground">Total de productos del combo</span>
              <span className="text-sm font-bold text-foreground">${totalPrice?.toFixed(2)} MXN</span>
            </div>
          ) : null;
        })()}
        <div>
          <label className="text-xs font-medium text-foreground block mb-2">Tipo de beneficio del combo</label>
          <div className="space-y-2">
            {[
              { key: 'discount', label: '% de descuento sobre el total' },
              { key: 'special_price', label: 'Precio especial del combo' },
            ]?.map(opt => (
              <label key={opt?.key} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-sm transition-all ${form?.comboDiscountType === opt?.key ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'}`}>
                <input type="radio" name="comboDiscountType" value={opt?.key} checked={form?.comboDiscountType === opt?.key} onChange={() => set('comboDiscountType', opt?.key)} className="accent-primary" />
                {opt?.label}
              </label>
            ))}
          </div>
          {form?.comboDiscountType === 'discount' && (
            <div className="mt-3">
              <label className="text-xs font-medium text-foreground block mb-1">Descuento: <span className="text-primary font-bold">{form?.comboDiscount}%</span></label>
              <input type="range" min={5} max={70} value={form?.comboDiscount} onChange={e => set('comboDiscount', Number(e?.target?.value))} className="w-full accent-primary" />
              {(() => {
                const total = (form?.comboProducts || [])?.reduce((s, p) => s + (Number(p?.price) || 0), 0);
                return total > 0 ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    Precio final del combo: <strong className="text-foreground">${(total * (1 - form?.comboDiscount / 100))?.toFixed(2)} MXN</strong>
                  </p>
                ) : null;
              })()}
            </div>
          )}
          {form?.comboDiscountType === 'special_price' && (
            <div className="mt-3">
              <label className="text-xs font-medium text-foreground block mb-1">Precio especial del combo (MXN)</label>
              <div className="flex items-center border border-border rounded-lg overflow-hidden w-48">
                <span className="px-2 py-2 bg-muted text-sm text-muted-foreground">$</span>
                <input type="number" min={0} step="0.01" value={form?.comboSpecialPrice || ''} onChange={e => set('comboSpecialPrice', e?.target?.value)}
                  placeholder="0.00"
                  className="flex-1 px-3 py-2 bg-background text-foreground text-sm focus:outline-none font-medium" />
                <span className="px-2 py-2 bg-muted text-sm text-muted-foreground">MXN</span>
              </div>
            </div>
          )}
        </div>
      </div>
    )}

    {/* Sorpresa: puntos de activación + selector de sorpresa activa */}
    {form?.rewardType === 'sorpresa' && (
      <SorpresaFields form={form} set={set} />
    )}

    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <SectionHeader num="4" title="Inventario limitado" subtitle="¿Esta recompensa tiene un número máximo de canjes disponibles?" />
      <label className="flex items-center gap-3 cursor-pointer">
        <Toggle value={form?.hasInventory} onChange={v => set('hasInventory', v)} />
        <span className="text-sm font-medium text-foreground">Inventario limitado</span>
      </label>
      {form?.hasInventory && (
        <div className="ml-14 space-y-3 pt-2 border-t border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Cantidad total disponible</label>
              <input type="number" min={1} value={form?.inventoryTotal || ''} onChange={e => set('inventoryTotal', e?.target?.value)}
                placeholder="Ej: 50"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Unidades restantes</label>
              <div className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-muted-foreground text-sm">
                {form?.inventoryTotal ? `${form?.inventoryTotal} (calculado automáticamente)` : '—'}
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Comportamiento al agotarse</label>
            <select value={form?.inventoryBehavior || 'deactivate'} onChange={e => set('inventoryBehavior', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="deactivate">Desactivar automáticamente</option>
              <option value="notify">Notificarme para reabastecer</option>
              <option value="manual">Mantener activa y gestionar manualmente</option>
            </select>
          </div>
        </div>
      )}
    </div>
  </div>
);

const TabIdentity = ({ form, set }) => (
  <div className="space-y-6">
    <SectionHeader num="1" title="Identidad visual" subtitle="Nombre, descripción e imagen que verá el cliente en la app B2C" />
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Nombre de la recompensa <span className="text-destructive">*</span></label>
        <input value={form?.title || ''} onChange={e => set('title', e?.target?.value)} maxLength={60}
          placeholder="Ej: Café americano gratis"
          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <p className="text-xs text-muted-foreground mt-1">{(form?.title || '')?.length}/60</p>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Descripción</label>
        <textarea value={form?.description || ''} onChange={e => set('description', e?.target?.value)} maxLength={200} rows={3}
          placeholder="Describe el beneficio que recibe el cliente..."
          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <p className="text-xs text-muted-foreground mt-1">{(form?.description || '')?.length}/200</p>
      </div>
    </div>

    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <SectionHeader num="2" title="Color de acento" />
      <div className="flex flex-wrap gap-2">
        {ACCENT_COLORS?.map(c => (
          <button key={c} onClick={() => set('accentColor', c)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${form?.accentColor === c ? 'border-foreground scale-110' : 'border-transparent'}`}
            style={{ backgroundColor: c }} />
        ))}
      </div>
    </div>

    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <SectionHeader num="3" title="Imagen de la recompensa" />
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {TEMPLATE_IMAGES?.map(img => (
          <button key={img?.key} onClick={() => set('selectedImage', img?.url)}
            className={`relative rounded-xl overflow-hidden border-2 transition-all ${form?.selectedImage === img?.url ? 'border-primary' : 'border-transparent hover:border-primary/40'}`}>
            <img src={img?.url} alt={`Plantilla de imagen: ${img?.label}`} className="w-full h-16 object-cover" />
            <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs text-center py-0.5">{img?.label}</div>
          </button>
        ))}
      </div>
    </div>

    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <SectionHeader num="4" title="Mensaje personalizado al canjear" subtitle="Texto que ve el cliente en pantalla al completar el canje" />
      <textarea value={form?.redemptionMessage || ''} onChange={e => set('redemptionMessage', e?.target?.value)} maxLength={100} rows={2}
        placeholder="Ej: ¡Disfruta tu {recompensa}! Muéstrale esta pantalla al cajero."
        className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
      <p className="text-xs text-muted-foreground">{(form?.redemptionMessage || '')?.length}/100 — Variables disponibles: <code className="bg-muted px-1 rounded">{'{nombre_cliente}'}</code> <code className="bg-muted px-1 rounded">{'{recompensa}'}</code> <code className="bg-muted px-1 rounded">{'{negocio}'}</code></p>
    </div>
  </div>
);

const TabValidity = ({ form, set }) => (
  <div className="space-y-6">
    <SectionHeader num="1" title="Vigencia de la recompensa" subtitle="Una vez que el cliente canjea sus puntos y obtiene la recompensa, ¿cuánto tiempo tiene para usarla?" />
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      {[
        { key: 'no_expiry', label: 'Sin vigencia', desc: 'La recompensa no expira' },
        { key: 'days_from_redemption', label: 'X días desde el canje', desc: 'La recompensa expira N días después de obtenerse' },
        { key: 'fixed_date', label: 'Fecha fija', desc: 'La recompensa vence en una fecha específica' },
      ]?.map(opt => (
        <label key={opt?.key} className="flex items-start gap-3 cursor-pointer">
          <input type="radio" name="validityType" value={opt?.key} checked={form?.validityType === opt?.key} onChange={() => set('validityType', opt?.key)}
            className="mt-1 accent-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{opt?.label}</p>
            <p className="text-xs text-muted-foreground">{opt?.desc}</p>
            {opt?.key === 'days_from_redemption' && form?.validityType === 'days_from_redemption' && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">La recompensa expira</span>
                <input type="number" min={1} max={365} value={form?.validityDays || 30} onChange={e => set('validityDays', parseInt(e?.target?.value) || 30)}
                  className="w-20 px-2 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-center font-bold" />
                <span className="text-sm text-muted-foreground">días después de obtenerse</span>
              </div>
            )}
            {opt?.key === 'fixed_date' && form?.validityType === 'fixed_date' && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">La recompensa vence el</span>
                <input type="date" value={form?.validityDate || ''} onChange={e => set('validityDate', e?.target?.value)}
                  className="px-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            )}
          </div>
        </label>
      ))}
    </div>

    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <SectionHeader num="2" title="Horario y días de validez" subtitle="¿La recompensa tiene restricciones de cuándo se puede usar?" />
      <label className="flex items-center gap-3 cursor-pointer">
        <Toggle value={form?.restrictSchedule} onChange={v => set('restrictSchedule', v)} />
        <span className="text-sm font-medium text-foreground">Restringir horario de uso</span>
      </label>
      {form?.restrictSchedule && (
        <div className="ml-14 space-y-4 pt-3 border-t border-border">
          <div>
            <label className="text-xs font-medium text-foreground block mb-2">Días disponibles</label>
            <div className="flex gap-1.5 flex-wrap">
              {DAYS_OF_WEEK?.map(d => {
                const active = (form?.scheduleDays || [])?.includes(d?.key);
                return (
                  <button key={d?.key} type="button" onClick={() => {
                    const updated = active ? (form?.scheduleDays || [])?.filter(x => x !== d?.key) : [...(form?.scheduleDays || []), d?.key];
                    set('scheduleDays', updated);
                  }} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${active ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-muted-foreground/40'}`}>
                    {d?.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Hora inicio</label>
              <input type="time" value={form?.scheduleFrom || '08:00'} onChange={e => set('scheduleFrom', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Hora fin</label>
              <input type="time" value={form?.scheduleTo || '17:00'} onChange={e => set('scheduleTo', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Ejemplo: Solo válida de lunes a viernes de 8 AM a 5 PM</p>
        </div>
      )}
    </div>
  </div>
);

const TabRestrictions = ({ form, set }) => (
  <div className="space-y-6">
    <SectionHeader num="1" title="Límite de canjes por cliente" subtitle="¿Cuántas veces puede el mismo cliente canjear esta recompensa?" />
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-muted-foreground">Máximo</span>
        <input type="number" min={1} value={form?.maxRedemptionsPerCustomer || ''} onChange={e => set('maxRedemptionsPerCustomer', e?.target?.value)}
          placeholder="∞"
          className="w-24 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-center font-bold" />
        <span className="text-sm text-muted-foreground">veces por cliente</span>
        <select value={form?.redemptionPeriod || 'forever'} onChange={e => set('redemptionPeriod', e?.target?.value)}
          className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="forever">Por siempre</option>
          <option value="month">Por mes</option>
          <option value="week">Por semana</option>
          <option value="day">Por día</option>
        </select>
      </div>
      <p className="text-xs text-muted-foreground">Deja vacío para canjes ilimitados</p>
    </div>

    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <SectionHeader num="2" title="Monto mínimo de compra" subtitle="Para recompensas de descuento: monto mínimo de compra para que aplique" />
      <label className="flex items-center gap-3 cursor-pointer">
        <Toggle value={form?.minPurchaseRequired} onChange={v => set('minPurchaseRequired', v)} />
        <span className="text-sm font-medium text-foreground">Requerir monto mínimo de compra</span>
      </label>
      {form?.minPurchaseRequired && (
        <div className="ml-14 flex items-center gap-2 pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">La recompensa aplica en compras de</span>
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <span className="px-2 py-2 bg-muted text-sm text-muted-foreground">$</span>
            <input type="number" min={1} value={form?.minPurchaseAmount || ''} onChange={e => set('minPurchaseAmount', e?.target?.value)}
              className="w-28 px-3 py-2 bg-background text-foreground text-sm focus:outline-none font-bold" />
          </div>
          <span className="text-sm text-muted-foreground">MXN o más</span>
        </div>
      )}
    </div>

    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <SectionHeader num="3" title="Combinable con otras ofertas" subtitle="¿Se puede usar junto con cupones activos?" />
      <label className="flex items-center gap-3 cursor-pointer">
        <Toggle value={form?.combinableWithCoupons} onChange={v => set('combinableWithCoupons', v)} />
        <div>
          <span className="text-sm font-medium text-foreground">Permitir uso junto con cupones activos</span>
          <p className="text-xs text-muted-foreground mt-0.5">Si está desactivado, el cajero no podrá aplicar esta recompensa cuando el cliente también tenga un cupón activo</p>
        </div>
      </label>
    </div>

    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <SectionHeader num="4" title="Categorías o productos excluidos" subtitle="Productos o categorías que NO aplican para esta recompensa" />
      <label className="flex items-center gap-3 cursor-pointer">
        <Toggle value={form?.hasExcludedCategories} onChange={v => set('hasExcludedCategories', v)} />
        <span className="text-sm font-medium text-foreground">Excluir productos o categorías</span>
      </label>
      {form?.hasExcludedCategories && (
        <div className="ml-14 space-y-3 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">Selecciona las categorías que NO aplican para esta recompensa</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {['Bebidas alcohólicas', 'Tabaco', 'Artículos en oferta', 'Productos importados', 'Servicios premium', 'Membresías']?.map(cat => {
              const isExcluded = (form?.excludedCategories || [])?.includes(cat);
              return (
                <label key={cat} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs transition-all ${isExcluded ? 'border-destructive bg-destructive/5 text-destructive' : 'border-border text-foreground hover:border-muted-foreground/40'}`}>
                  <input type="checkbox" checked={isExcluded} onChange={() => {
                    const updated = isExcluded ? (form?.excludedCategories || [])?.filter(c => c !== cat) : [...(form?.excludedCategories || []), cat];
                    set('excludedCategories', updated);
                  }} className="accent-primary" />
                  {cat}
                </label>
              );
            })}
          </div>
          <input type="text" placeholder="Agregar categoría personalizada..."
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            onKeyDown={e => {
              if (e?.key === 'Enter' && e?.target?.value?.trim()) {
                set('excludedCategories', [...(form?.excludedCategories || []), e?.target?.value?.trim()]);
                e.target.value = '';
              }
            }} />
        </div>
      )}
    </div>
  </div>
);

const TabChannel = ({ form, set }) => {
  const { user } = useAuth();
  const [vipLevels, setVipLevels] = useState([]);
  const [loadingVip, setLoadingVip] = useState(false);

  useEffect(() => {
    const loadVipLevels = async () => {
      if (!user?.id) return;
      setLoadingVip(true);
      try {
        const { data } = await supabase
          ?.from('vip_levels')
          ?.select('id, name, icon, color')
          ?.eq('business_id', user?.id)
          ?.order('sort_order', { ascending: true });
        setVipLevels(data || []);
      } catch {
        setVipLevels([]);
      } finally {
        setLoadingVip(false);
      }
    };
    loadVipLevels();
  }, [user?.id]);

  const toggleVipLevel = (levelId) => {
    const current = form?.channelCRMVipLevels || [];
    const updated = current?.includes(levelId)
      ? current?.filter(id => id !== levelId)
      : [...current, levelId];
    set('channelCRMVipLevels', updated);
  };

  return (
  <div className="space-y-6">
    <SectionHeader num="1" title="Canal de distribución" subtitle="¿Cómo y dónde se distribuye esta recompensa a los clientes?" />

    {/* Grid 2x2 for main channels */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Público en ficha */}
      <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form?.channelPublicProfile ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
        <input type="radio" name="distributionChannel" checked={form?.channelPublicProfile || false}
          onChange={() => {
            set('channelPublicProfile', true);
            set('channelCRMSegment', false);
            set('channelQRPrintable', false);
            set('channelFlow', false);
          }}
          className="mt-1 accent-primary flex-shrink-0" />
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${form?.channelPublicProfile ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
            <Icon name="Globe" size={17} />
          </div>
          <div>
            <p className={`text-sm font-semibold ${form?.channelPublicProfile ? 'text-primary' : 'text-foreground'}`}>Público en ficha</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Cualquier cliente puede tomarlo desde el perfil del negocio</p>
          </div>
        </div>
      </label>

      {/* Solo segmento CRM */}
      <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form?.channelCRMSegment ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
        <input type="radio" name="distributionChannel" checked={form?.channelCRMSegment || false}
          onChange={() => {
            set('channelPublicProfile', false);
            set('channelCRMSegment', true);
            set('channelQRPrintable', false);
            set('channelFlow', false);
          }}
          className="mt-1 accent-primary flex-shrink-0" />
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${form?.channelCRMSegment ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
            <Icon name="Filter" size={17} />
          </div>
          <div>
            <p className={`text-sm font-semibold ${form?.channelCRMSegment ? 'text-primary' : 'text-foreground'}`}>Solo segmento CRM</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Solo usuarios de un segmento específico pueden verlo</p>
          </div>
        </div>
      </label>

      {/* QR imprimible (flyer) */}
      <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form?.channelQRPrintable ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
        <input type="radio" name="distributionChannel" checked={form?.channelQRPrintable || false}
          onChange={() => {
            set('channelPublicProfile', false);
            set('channelCRMSegment', false);
            set('channelQRPrintable', true);
            set('channelFlow', false);
          }}
          className="mt-1 accent-primary flex-shrink-0" />
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${form?.channelQRPrintable ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
            <Icon name="QrCode" size={17} />
          </div>
          <div>
            <p className={`text-sm font-semibold ${form?.channelQRPrintable ? 'text-primary' : 'text-foreground'}`}>QR imprimible (flyer)</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Genera un QR para poner en material físico</p>
          </div>
        </div>
      </label>

      {/* Vinculado a flow/campaña */}
      <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form?.channelFlow ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
        <input type="radio" name="distributionChannel" checked={form?.channelFlow || false}
          onChange={() => {
            set('channelPublicProfile', false);
            set('channelCRMSegment', false);
            set('channelQRPrintable', false);
            set('channelFlow', true);
          }}
          className="mt-1 accent-primary flex-shrink-0" />
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${form?.channelFlow ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
            <Icon name="Link2" size={17} />
          </div>
          <div>
            <p className={`text-sm font-semibold ${form?.channelFlow ? 'text-primary' : 'text-foreground'}`}>Vinculado a flow/campaña</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Se distribuye automáticamente por un flow de automatización</p>
          </div>
        </div>
      </label>
    </div>

    {/* CRM Segment sub-options: shown when Solo segmento CRM is selected */}
    {form?.channelCRMSegment && (
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <SectionHeader num="2" title="Segmento CRM" subtitle="Define a qué segmento y/o nivel VIP aplica esta recompensa" />

        {/* Nivel VIP */}
        <div>
          <label className="text-xs font-medium text-foreground block mb-2 flex items-center gap-1.5">
            <Icon name="Crown" size={13} className="text-amber-500" />
            Nivel VIP
          </label>
          {loadingVip ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Icon name="Loader2" size={14} className="animate-spin" />
              Cargando niveles VIP...
            </div>
          ) : vipLevels?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {vipLevels?.map(level => {
                const isSelected = (form?.channelCRMVipLevels || [])?.includes(level?.id);
                return (
                  <button
                    key={level?.id}
                    type="button"
                    onClick={() => toggleVipLevel(level?.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${isSelected ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground hover:border-primary/30'}`}
                  >
                    {level?.icon && <span>{level?.icon}</span>}
                    {level?.name}
                    {isSelected && <Icon name="Check" size={11} className="text-primary" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-3 bg-muted/40 border border-border rounded-lg flex items-center gap-2">
              <Icon name="Info" size={14} className="text-muted-foreground flex-shrink-0" />
              <p className="text-xs text-muted-foreground">No hay niveles VIP configurados. Ve a Fidelización › Niveles VIP para crearlos.</p>
            </div>
          )}
          {(form?.channelCRMVipLevels || [])?.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1.5">
              {(form?.channelCRMVipLevels || [])?.length} nivel(es) seleccionado(s). Solo clientes con esos niveles verán esta recompensa.
            </p>
          )}
        </div>
      </div>
    )}

    {/* Canje NFC - PREMIUM - full width */}
    <div className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${form?.channelNFC ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
      onClick={() => set('channelNFC', !form?.channelNFC)}>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${form?.channelNFC ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
          <Icon name="Wifi" size={17} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className={`text-sm font-semibold ${form?.channelNFC ? 'text-primary' : 'text-foreground'}`}>Canje NFC</p>
            <span className="text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">PREMIUM</span>
          </div>
          <p className="text-xs text-primary hover:underline mt-0.5 cursor-pointer">Registra tags NFC para habilitar el canje por tap →</p>
        </div>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${form?.channelNFC ? 'border-primary bg-primary' : 'border-muted-foreground/40'}`}>
        {form?.channelNFC && <Icon name="Check" size={11} className="text-white" />}
      </div>
    </div>
  </div>
  );
};

const TabNotifications = ({ form, set }) => (
  <div className="space-y-6">
    <SectionHeader num="1" title="Notificación de puntos próximos" subtitle="Notifica al cliente cuando esté cerca de tener los puntos suficientes para canjear" />
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <label className="flex items-center gap-3 cursor-pointer">
        <Toggle value={form?.notifyNearPoints} onChange={v => set('notifyNearPoints', v)} />
        <div>
          <span className="text-sm font-medium text-foreground">Notificar al cliente cuando esté cerca</span>
          <p className="text-xs text-muted-foreground mt-0.5">Push notification automática cuando el cliente alcance el umbral configurado</p>
        </div>
      </label>
      {form?.notifyNearPoints && (
        <div className="ml-14 space-y-3 pt-3 border-t border-border">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Notificar cuando tenga el</span>
            <input type="number" min={10} max={99} value={form?.notifyThreshold || 80} onChange={e => set('notifyThreshold', parseInt(e?.target?.value) || 80)}
              className="w-20 px-2 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-center font-bold" />
            <span className="text-sm text-muted-foreground">% de los puntos necesarios</span>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 flex items-start gap-2">
            <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon name="Gift" size={12} className="text-white" />
            </div>
            <div>
              <div className="text-white text-xs font-semibold">PromoClub</div>
              <div className="text-gray-300 text-xs leading-tight">
                ¡Te faltan {Math.round((form?.pointsCost || 100) * (1 - (form?.notifyThreshold || 80) / 100))} puntos para canjear "{form?.title || 'tu recompensa'}"!
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Preview del push notification que recibirá el cliente</p>
        </div>
      )}
    </div>
  </div>
);

const TabEstablishment = ({ form, set }) => {
  const establishments = [
    { id: 'est-1', label: 'PromoSpot Centro' },
    { id: 'est-2', label: 'PromoSpot Norte' },
    { id: 'est-3', label: 'PromoSpot Sur' },
    { id: 'est-4', label: 'PromoSpot Polanco' },
  ];
  return (
    <div className="space-y-6">
      <SectionHeader num="1" title="Disponibilidad por establecimiento" subtitle="¿En qué sucursales está disponible esta recompensa?" />
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        {[
          { key: 'all', label: 'Todos los establecimientos', desc: 'La recompensa aplica en todas las sucursales' },
          { key: 'selected', label: 'Establecimientos específicos', desc: 'Elige en qué sucursales aplica' },
        ]?.map(opt => (
          <label key={opt?.key} className="flex items-start gap-3 cursor-pointer">
            <input type="radio" name="establishmentScope" value={opt?.key} checked={form?.establishmentScope === opt?.key} onChange={() => set('establishmentScope', opt?.key)}
              className="mt-1 accent-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">{opt?.label}</p>
              <p className="text-xs text-muted-foreground">{opt?.desc}</p>
            </div>
          </label>
        ))}
        {form?.establishmentScope === 'selected' && (
          <div className="ml-6 pt-3 border-t border-border space-y-2">
            {establishments?.map(est => {
              const isSelected = (form?.selectedEstablishments || [])?.includes(est?.id);
              return (
                <label key={est?.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                  <input type="checkbox" checked={isSelected} onChange={() => {
                    const updated = isSelected ? (form?.selectedEstablishments || [])?.filter(id => id !== est?.id) : [...(form?.selectedEstablishments || []), est?.id];
                    set('selectedEstablishments', updated);
                  }} className="accent-primary" />
                  <Icon name="Store" size={16} className={isSelected ? 'text-primary' : 'text-muted-foreground'} />
                  <span className="text-sm font-medium text-foreground">{est?.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const TabTerms = ({ form, set, generateTerms }) => (
  <div className="space-y-6">
    <SectionHeader num="1" title="Términos y condiciones" subtitle="Texto legal que aparece en la recompensa (opcional)" />

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

    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Términos y condiciones de la recompensa</label>
        <textarea value={form?.termsCustomText || ''} onChange={e => set('termsCustomText', e?.target?.value)} rows={6}
          placeholder="Ej: • Recompensa válida para un solo canje.&#10;• No acumulable con otras promociones.&#10;• El negocio se reserva el derecho de modificar o cancelar esta recompensa en cualquier momento."
          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono" />
        <p className="text-xs text-muted-foreground mt-1">Este texto aparecerá en la sección de términos de la recompensa en la app B2C.</p>
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
            'Presentar recompensa antes de ordenar.',
            'Un canje por cliente por visita.',
            'El negocio se reserva el derecho de modificar esta recompensa.',
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

    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <SectionHeader num="2" title="Estado de la recompensa" />
      <div className="grid grid-cols-3 gap-2">
        {[
          { key: 'active', label: 'Activa', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-300' },
          { key: 'paused', label: 'Pausada', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-300' },
          { key: 'draft', label: 'Borrador', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-300' },
        ]?.map(s => (
          <button key={s?.key} onClick={() => set('status', s?.key)}
            className={`p-3 rounded-xl border-2 text-center transition-all ${form?.status === s?.key ? `${s?.border} ${s?.bg} ${s?.color}` : 'border-border text-foreground hover:border-primary/30'}`}>
            <p className="text-sm font-semibold">{s?.label}</p>
          </button>
        ))}
      </div>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const NuevaRecompensaPage = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('distribution');
  const [previewMode, setPreviewMode] = useState('card');
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Distribution / trigger state
  const [triggerMode, setTriggerMode] = useState(null);
  const [selectedTrigger, setSelectedTrigger] = useState(null);
  const [triggerConfig, setTriggerConfig] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);

  const user = {
    name: authUser?.user_metadata?.full_name || 'Usuario',
    email: authUser?.email || '',
    role: 'owner',
  };

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const currentTabIndex = TABS?.findIndex(t => t?.id === activeTab);
  const progress = Math.round(((currentTabIndex + 1) / TABS?.length) * 100);

  const mainClasses = `pt-16 transition-all duration-500 ease-in-out relative z-10 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`;

  const generateTerms = () => {
    const lines = [];
    const rewardTypeLabel = REWARD_TYPES?.find(t => t?.key === form?.rewardType)?.label || 'Recompensa';
    if (form?.rewardType === 'pct_discount' && form?.benefitValue) {
      lines?.push(`• Descuento del ${form?.benefitValue}% al canjear ${form?.pointsCost || '?'} puntos.`);
    } else if (form?.rewardType === 'fixed_discount' && form?.benefitValue) {
      lines?.push(`• Descuento de $${form?.benefitValue} MXN al canjear ${form?.pointsCost || '?'} puntos.`);
    } else if (form?.rewardType === 'free_product' && form?.benefitProductName) {
      lines?.push(`• Producto gratis: ${form?.benefitProductName} al canjear ${form?.pointsCost || '?'} puntos.`);
    } else if (form?.rewardType === 'combo') {
      const comboNames = (form?.comboProducts || [])?.filter(p => p?.name)?.map(p => p?.name)?.join(' + ');
      lines?.push(`• Combo: ${comboNames || '?'} al canjear ${form?.pointsCost || '?'} puntos.`);
    } else if (form?.rewardType === 'sorpresa') {
      lines?.push(`• Sorpresa activada al acumular ${form?.surprisePointsCost || '?'} puntos.`);
    } else {
      lines?.push(`• ${rewardTypeLabel} al canjear ${form?.pointsCost || '?'} puntos de lealtad.`);
    }
    if (form?.validityType === 'no_expiry') {
      lines?.push(`• La recompensa no tiene fecha de vencimiento.`);
    } else if (form?.validityType === 'days_from_redemption') {
      lines?.push(`• Válida por ${form?.validityDays || 30} días desde la fecha de canje.`);
    } else if (form?.validityType === 'fixed_date' && form?.validityDate) {
      lines?.push(`• Válida hasta el ${new Date(form.validityDate)?.toLocaleDateString('es-MX')}.`);
    }
    if (form?.maxRedemptionsPerCustomer) {
      const period = form?.redemptionPeriod === 'forever' ? 'en total' : form?.redemptionPeriod === 'month' ? 'por mes' : form?.redemptionPeriod === 'week' ? 'por semana' : 'por día';
      lines?.push(`• Máximo ${form?.maxRedemptionsPerCustomer} canje(s) por cliente ${period}.`);
    } else {
      lines?.push(`• Sin límite de canjes por cliente.`);
    }
    if (form?.minPurchaseRequired && form?.minPurchaseAmount) {
      lines?.push(`• Aplica en compras mínimas de $${form?.minPurchaseAmount} MXN.`);
    }
    if (form?.establishmentScope === 'all') {
      lines?.push(`• Válida en todos los establecimientos participantes.`);
    } else if (form?.establishmentScope === 'selected' && (form?.selectedEstablishments || [])?.length > 0) {
      lines?.push(`• Válida únicamente en establecimientos seleccionados.`);
    }
    lines?.push(form?.combinableWithCoupons ? `• Aplica en combinación con cupones activos.` : `• No aplica en combinación con otros cupones o promociones.`);
    if (form?.hasExcludedCategories && (form?.excludedCategories || [])?.length > 0) {
      lines?.push(`• No aplica en: ${form?.excludedCategories?.join(', ')}.`);
    }
    if (form?.vipLevel && form?.vipLevel !== 'all') {
      const vipLabel = VIP_LEVELS?.find(v => v?.id === form?.vipLevel)?.label || form?.vipLevel;
      lines?.push(`• Exclusiva para clientes con nivel: ${vipLabel}.`);
    }
    lines?.push(`• El negocio se reserva el derecho de modificar o cancelar esta recompensa en cualquier momento.`);
    set('termsCustomText', lines?.join('\n'));
  };

  const handleSave = async (publish = false) => {
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        title: form?.title,
        description: form?.description,
        reward_type: form?.rewardType,
        points_cost: form?.pointsCost,
        benefit_value: form?.benefitValue || null,
        benefit_product_name: form?.benefitProductName || null,
        benefit_product_price: form?.benefitProductPrice ? parseFloat(form?.benefitProductPrice) : null,
        accent_color: form?.accentColor,
        image_url: form?.selectedImage,
        distribution_type: form?.distributionType,
        trigger_type: selectedTrigger || null,
        trigger_config: Object.keys(triggerConfig)?.length > 0 ? triggerConfig : null,
        vip_level: form?.vipLevel,
        validity_type: form?.validityType,
        validity_days: form?.validityType === 'days_from_redemption' ? form?.validityDays : null,
        validity_date: form?.validityType === 'fixed_date' ? form?.validityDate : null,
        restrict_schedule: form?.restrictSchedule,
        schedule_days: form?.restrictSchedule ? form?.scheduleDays : null,
        schedule_from: form?.restrictSchedule ? form?.scheduleFrom : null,
        schedule_to: form?.restrictSchedule ? form?.scheduleTo : null,
        max_redemptions_per_customer: form?.maxRedemptionsPerCustomer ? parseInt(form?.maxRedemptionsPerCustomer) : null,
        redemption_period: form?.redemptionPeriod,
        min_purchase_required: form?.minPurchaseRequired,
        min_purchase_amount: form?.minPurchaseRequired ? parseFloat(form?.minPurchaseAmount) : null,
        combinable_with_coupons: form?.combinableWithCoupons,
        has_excluded_categories: form?.hasExcludedCategories,
        excluded_categories: form?.hasExcludedCategories ? form?.excludedCategories : null,
        has_inventory: form?.hasInventory,
        inventory_total: form?.hasInventory ? parseInt(form?.inventoryTotal) : null,
        inventory_remaining: form?.hasInventory ? parseInt(form?.inventoryTotal) : null,
        inventory_behavior: form?.hasInventory ? form?.inventoryBehavior : null,
        redemption_message: form?.redemptionMessage,
        channel_qr: form?.channelQRPrintable,
        channel_code: false,
        channel_nfc: form?.channelNFC,
        channel_manual: false,
        channel_public_profile: form?.channelPublicProfile,
        channel_crm_segment: form?.channelCRMSegment,
        channel_flow: form?.channelFlow,
        notify_near_points: form?.notifyNearPoints,
        notify_threshold: form?.notifyNearPoints ? form?.notifyThreshold : null,
        establishment_scope: form?.establishmentScope,
        selected_establishments: form?.establishmentScope === 'selected' ? form?.selectedEstablishments : null,
        terms: form?.termsCustomText || form?.terms || null,
        status: publish ? 'active' : (form?.status || 'draft'),
        created_by: authUser?.id || null,
        // Combo fields
        combo_products: form?.rewardType === 'combo' ? form?.comboProducts : null,
        combo_discount_type: form?.rewardType === 'combo' ? form?.comboDiscountType : null,
        combo_discount: form?.rewardType === 'combo' ? form?.comboDiscount : null,
        combo_special_price: form?.rewardType === 'combo' && form?.comboSpecialPrice ? parseFloat(form?.comboSpecialPrice) : null,
        // Sorpresa fields
        surprise_points_cost: form?.rewardType === 'sorpresa' ? parseInt(form?.surprisePointsCost) || null : null,
        selected_surprise_id: form?.rewardType === 'sorpresa' ? form?.selectedSurpriseId : null,
      };

      const { error } = await supabase?.from('loyalty_rewards')?.insert(payload);
      if (error) throw error;
      navigate('/loyalty-points-system/catalogo');
    } catch (err) {
      setSaveError(err?.message || 'Error al guardar la recompensa');
    } finally {
      setSaving(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'distribution': return (
        <TabDistribution
          form={form}
          set={set}
          triggerMode={triggerMode}
          setTriggerMode={setTriggerMode}
          selectedTrigger={selectedTrigger}
          setSelectedTrigger={setSelectedTrigger}
          triggerConfig={triggerConfig}
          setTriggerConfig={setTriggerConfig}
          expandedCategory={expandedCategory}
          setExpandedCategory={setExpandedCategory}
        />
      );
      case 'benefit': return <TabBenefit form={form} set={set} />;
      case 'identity': return <TabIdentity form={form} set={set} />;
      case 'validity': return <TabValidity form={form} set={set} />;
      case 'restrictions': return <TabRestrictions form={form} set={set} />;
      case 'channel': return <TabChannel form={form} set={set} />;
      case 'notifications': return <TabNotifications form={form} set={set} />;
      case 'establishment': return <TabEstablishment form={form} set={set} />;
      case 'terms': return <TabTerms form={form} set={set} generateTerms={generateTerms} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        user={user}
        isMenuOpen={isSidebarOpen}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className={mainClasses}>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm mb-4">
            <button onClick={() => navigate('/loyalty-points-system/catalogo')} className="text-muted-foreground hover:text-foreground transition-colors">
              Recompensas
            </button>
            <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
            <span className="text-foreground font-medium">Nueva Recompensa</span>
          </nav>

          {/* Page Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Nueva Recompensa</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Crea una nueva recompensa para el catálogo de canje con puntos de lealtad</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/loyalty-points-system/catalogo')}>
              Cancelar
            </Button>
          </div>

          {/* Live Preview */}
          <div className="mb-6">
            <RewardLivePreview
              form={form}
              previewMode={previewMode}
              setPreviewMode={setPreviewMode}
              triggerMode={triggerMode}
              selectedTrigger={selectedTrigger}
            />
          </div>

          {/* Wizard Progress */}
          <div className="bg-card border border-border rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Progreso del wizard</span>
                <span className="text-sm text-primary font-medium">{TABS?.find(t => t?.id === activeTab)?.label}</span>
              </div>
              <span className="text-sm font-bold text-primary">Paso {currentTabIndex + 1} de {TABS?.length} · {progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            {/* Tab icons */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {TABS?.map((tab, idx) => (
                <React.Fragment key={tab?.id}>
                  <button onClick={() => setActiveTab(tab?.id)}
                    className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all flex-shrink-0 ${activeTab === tab?.id ? 'bg-primary/10 text-primary' : idx < currentTabIndex ? 'text-emerald-600' : 'text-muted-foreground hover:text-foreground'}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all ${activeTab === tab?.id ? 'border-primary bg-primary text-white' : idx < currentTabIndex ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-border bg-background'}`}>
                      <Icon name={tab?.icon} size={16} />
                    </div>
                    <span className="text-xs font-medium whitespace-nowrap">{tab?.label}</span>
                  </button>
                  {idx < TABS?.length - 1 && <div className={`h-px w-4 flex-shrink-0 ${idx < currentTabIndex ? 'bg-emerald-400' : 'bg-border'}`} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-card border border-border rounded-xl p-6 mb-4">
            {renderTabContent()}
          </div>

          {/* Error */}
          {saveError && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive flex items-center gap-2">
              <Icon name="AlertCircle" size={16} />
              {saveError}
            </div>
          )}

          {/* Navigation */}
          <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
            <button onClick={() => {
              const prev = TABS?.[currentTabIndex - 1];
              if (prev) setActiveTab(prev?.id);
            }} disabled={currentTabIndex === 0}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <Icon name="ChevronLeft" size={16} />
              Anterior
            </button>

            <div className="flex gap-1">
              {TABS?.map((_, idx) => (
                <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === currentTabIndex ? 'bg-primary w-6' : idx < currentTabIndex ? 'bg-emerald-400' : 'bg-border'}`} />
              ))}
            </div>

            {currentTabIndex < TABS?.length - 1 ? (
              <button onClick={() => {
                const next = TABS?.[currentTabIndex + 1];
                if (next) setActiveTab(next?.id);
              }} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                Siguiente
                <Icon name="ChevronRight" size={16} />
              </button>
            ) : (
              <button onClick={() => handleSave(true)} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
                {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Gift" size={16} />}
                Publicar recompensa
              </button>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/loyalty-points-system/catalogo')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancelar
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => handleSave(false)} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors disabled:opacity-60">
              {saving ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Save" size={15} />}
              Guardar borrador
            </button>
            <button onClick={() => handleSave(true)} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
              {saving ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Gift" size={15} />}
              Publicar recompensa
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NuevaRecompensaPage;
