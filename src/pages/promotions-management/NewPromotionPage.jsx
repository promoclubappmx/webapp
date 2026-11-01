import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const PROMO_TYPES = [
  { value: 'standard', label: 'Estándar', icon: 'Tag', color: 'bg-blue-100 text-blue-700', borderColor: 'border-blue-400', description: 'Descuento general configurable', plan: 'PRO' },
  { value: 'flash_deal', label: 'Flash Deal', icon: 'Zap', color: 'bg-red-100 text-red-700', borderColor: 'border-red-400', description: '30-60 min con push a cercanos', plan: 'PRO' },
  { value: 'happy_hour', label: 'Happy Hour', icon: 'Clock', color: 'bg-amber-100 text-amber-700', borderColor: 'border-amber-400', description: 'Horarios recurrentes automáticos', plan: 'PRO' },
  { value: 'limited_drop', label: 'Drop Limitado', icon: 'Flame', color: 'bg-purple-100 text-purple-700', borderColor: 'border-purple-400', description: 'Cantidad + ventana de tiempo', plan: 'PRO' },
  { value: 'birthday', label: 'Cumpleaños', icon: 'Cake', color: 'bg-pink-100 text-pink-700', borderColor: 'border-pink-400', description: 'Automática para clientes en su mes', plan: 'PRO' },
  { value: 'first_visit', label: 'Primera Visita', icon: 'Star', color: 'bg-green-100 text-green-700', borderColor: 'border-green-400', description: 'Incentivo para nuevos visitantes', plan: 'PRO' },
  { value: 'weather', label: 'Por Clima', icon: 'Cloud', color: 'bg-cyan-100 text-cyan-700', borderColor: 'border-cyan-400', description: 'Trigger automático por clima', plan: 'PREMIUM' },
  { value: 'inverse_demand', label: 'Demanda Inversa', icon: 'TrendingDown', color: 'bg-orange-100 text-orange-700', borderColor: 'border-orange-400', description: 'Activa con baja afluencia', plan: 'PREMIUM' },
  { value: 'advent', label: 'Calendario Adviento', icon: 'Gift', color: 'bg-yellow-100 text-yellow-700', borderColor: 'border-yellow-400', description: '12, 24 o 31 días de ofertas', plan: 'PREMIUM' },
  { value: 'vip_access', label: 'Acceso VIP', icon: 'Crown', color: 'bg-gray-900 text-yellow-400', borderColor: 'border-yellow-400', description: 'Acceso anticipado para VIPs', plan: 'PREMIUM' },
];

const DISCOUNT_TYPES = [
  { value: 'percentage', label: '% de descuento' },
  { value: 'fixed', label: 'Monto fijo en MXN ($)' },
  { value: 'free_product', label: 'Producto gratis' },
  { value: '2x1', label: '2×1' },
  { value: '3x2', label: '3×2' },
  { value: 'special_price', label: 'Precio especial fijo' },
  { value: 'bundle', label: 'Bundle / Combo' },
];

const DAYS_OF_WEEK = [
  { id: 'lun', label: 'Lun' }, { id: 'mar', label: 'Mar' }, { id: 'mie', label: 'Mié' },
  { id: 'jue', label: 'Jue' }, { id: 'vie', label: 'Vie' }, { id: 'sab', label: 'Sáb' }, { id: 'dom', label: 'Dom' },
];

const WEATHER_CONDITIONS = [
  { value: 'rain', label: 'Lluvia' }, { value: 'drizzle', label: 'Llovizna' },
  { value: 'storm', label: 'Tormenta' }, { value: 'hot', label: 'Temperatura máxima superior a °C' },
  { value: 'cold', label: 'Temperatura mínima inferior a °C' }, { value: 'uv', label: 'Índice UV superior a' },
  { value: 'fog', label: 'Neblina' }, { value: 'wind', label: 'Viento fuerte (>40 km/h)' },
  { value: 'clear', label: 'Clima despejado' },
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

// Trigger categories (same as coupon)
const TRIGGER_CATEGORIES = [
  {
    key: 'behavior', label: 'Comportamiento del cliente', icon: 'Activity',
    color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200',
    triggers: [
      { key: 'first_visit', label: 'Primera visita', icon: 'Star', desc: 'Promo de bienvenida al visitar por primera vez', est: '~5/mes', fields: [] },
      { key: 'visit_count', label: 'Número de visitas acumuladas', icon: 'MapPin', desc: 'Activar cuando el cliente alcance N visitas', est: '~20/mes', fields: ['visit_threshold'] },
      { key: 'spend_amount', label: 'Monto acumulado gastado', icon: 'TrendingUp', desc: 'Activar cuando el cliente haya gastado $X MXN en total', est: '~8/mes', fields: ['spend_threshold'] },
      { key: 'checkin_today', label: 'Al hacer check-in hoy', icon: 'CheckCircle', desc: 'Promo entregada directamente al validar la visita', est: '~30/mes', fields: [] },
      { key: 'inactivity', label: 'Al no visitar en X días', icon: 'Clock', desc: 'Activar si el cliente lleva N días sin visitar', est: '~15/mes', fields: ['inactivity_days'] },
    ],
  },
  {
    key: 'interaction', label: 'Interacción con el negocio', icon: 'MessageSquare',
    color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200',
    triggers: [
      { key: 'review', label: 'Al dejar una reseña verificada', icon: 'Star', desc: 'El cliente recibe la promo después de publicar una reseña', est: '~10/mes', fields: [] },
      { key: 'nps_survey', label: 'Al responder una encuesta NPS', icon: 'BarChart2', desc: 'Al completar la encuesta post-visita', est: '~12/mes', fields: [] },
      { key: 'referral', label: 'Al referir a un amigo registrado', icon: 'UserPlus', desc: 'Cuando el amigo referido se registra en PromoClub', est: '~3/mes', fields: [] },
    ],
  },
  {
    key: 'temporal', label: 'Contexto temporal', icon: 'Calendar',
    color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200',
    triggers: [
      { key: 'birthday', label: 'Cumpleaños', icon: 'Cake', desc: 'Enviado automáticamente X días antes del cumpleaños', est: '~8/mes', fields: ['birthday_days_before'] },
      { key: 'anniversary', label: 'Aniversario como cliente', icon: 'Award', desc: 'Al cumplir 6 meses / 1 año / 2 años desde la primera visita', est: '~4/mes', fields: ['anniversary_milestone'] },
      { key: 'time_window', label: 'Día u horario específico', icon: 'Clock', desc: 'Solo disponible en días y horas configuradas', est: '~25/mes', fields: ['time_window_days', 'time_window_from', 'time_window_to'] },
    ],
  },
  {
    key: 'loyalty', label: 'Nivel de lealtad', icon: 'Crown',
    color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200',
    triggers: [
      { key: 'level_up', label: 'Al subir de nivel VIP', icon: 'TrendingUp', desc: 'El cliente recibe la promo cuando sube a Plata / Oro', est: '~5/mes', fields: ['level_up_target'] },
      { key: 'active_level', label: 'Por nivel VIP activo', icon: 'Shield', desc: 'Solo disponible para clientes con nivel específico activo', est: 'Permanente', fields: ['active_level_min'] },
    ],
  },
  {
    key: 'channel', label: 'Canal externo', icon: 'Wifi',
    color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200',
    triggers: [
      { key: 'qr_scan', label: 'Al escanear un QR físico específico', icon: 'QrCode', desc: 'La promo se activa cuando el cliente escanea el QR del flyer / packaging', est: '~18/mes', fields: ['qr_label'] },
      { key: 'campaign_link', label: 'Al hacer click en un link de campaña', icon: 'Link', desc: 'El cliente llega a la promo desde un link de WhatsApp / email / Instagram', est: '~22/mes', fields: ['campaign_channel'] },
    ],
  },
];

// Wizard tabs
const TABS = [
  { id: 'distribution', label: 'Distribución', icon: 'Zap' },
  { id: 'type', label: 'Tipo', icon: 'Sparkles' },
  { id: 'identity', label: 'Identidad', icon: 'Palette' },
  { id: 'benefit', label: 'Beneficio', icon: 'Percent' },
  { id: 'config', label: 'Configuración', icon: 'Settings' },
];

// ─── SMALL REUSABLE COMPONENTS ────────────────────────────────────────────────

const SectionCard = ({ title, icon, children, className = '', badge = null }) => (
  <div className={`bg-card border border-border rounded-xl p-5 ${className}`}>
    <div className="flex items-center gap-2 mb-4">
      <Icon name={icon} size={17} className="text-primary" />
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {badge && <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{badge}</span>}
    </div>
    {children}
  </div>
);

const Toggle = ({ label, desc = null, value, onChange }) => (
  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
    <div className="flex-1 pr-4">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
    </div>
    <button type="button" onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative ${value ? 'bg-primary' : 'bg-muted'}`}>
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  </div>
);

const Field = ({ label, hint = null, children, required = false }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1">
      {label} {required && <span className="text-destructive">*</span>}
      {hint && <span className="text-muted-foreground font-normal text-xs ml-1">({hint})</span>}
    </label>
    {children}
  </div>
);

const StyledInput = ({ ...props }) => (
  <input {...props} className={`w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${props?.className || ''}`} />
);

const StyledSelect = ({ children, ...props }) => (
  <select {...props} className={`w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${props?.className || ''}`}>
    {children}
  </select>
);

const StyledTextarea = ({ ...props }) => (
  <textarea {...props} className={`w-full px-3 py-2 border border-border rounded-lg bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 ${props?.className || ''}`} />
);

const DayPicker = ({ selected, onChange }) => (
  <div className="flex flex-wrap gap-1.5">
    {DAYS_OF_WEEK?.map(d => (
      <button key={d?.id} type="button"
        onClick={() => onChange(selected?.includes(d?.id) ? (selected || [])?.filter(x => x !== d?.id) : [...(selected || []), d?.id])}
        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selected?.includes(d?.id) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
        {d?.label}
      </button>
    ))}
  </div>
);

const InfoBanner = ({ icon, text, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    green: 'bg-green-50 border-green-200 text-green-700',
  };
  return (
    <div className={`flex items-start gap-2 p-3 rounded-lg border text-xs ${colors?.[color]}`}>
      <Icon name={icon} size={14} className="mt-0.5 flex-shrink-0" />
      <p>{text}</p>
    </div>
  );
};

// ─── LIVE PREVIEW ─────────────────────────────────────────────────────────────

const PromoLivePreview = ({ form, triggerMode, selectedTrigger }) => {
  const typeConfig = PROMO_TYPES?.find(t => t?.value === form?.promoType);
  const benefitLabel = form?.discountType === 'percentage' ? `${form?.discountValue || 0}% OFF`
    : form?.discountType === 'fixed' ? `$${form?.discountValue || 0} OFF`
    : form?.discountType === 'free_product' ? 'Producto Gratis'
    : form?.discountType === '2x1' ? '2×1'
    : form?.discountType === '3x2' ? '3×2'
    : form?.discountType === 'special_price' ? `$${form?.specialPrice || 0} MXN`
    : form?.discountType === 'bundle'? 'Bundle Combo' :'Beneficio';

  const accentColor = form?.accentColor || ACCENT_COLORS?.[0];
  const promoImage = form?.identityImage || TEMPLATE_IMAGES?.[0]?.url;

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
          <Icon name="Eye" size={15} className="text-primary" />
          Vista previa — Ficha del negocio
        </h3>
        <span className="text-xs text-muted-foreground">En tiempo real</span>
      </div>

      <div className="flex gap-4 flex-wrap">
        {/* Promo card preview */}
        <div className="rounded-2xl overflow-hidden shadow-lg border border-border flex-1 min-w-[220px] max-w-xs">
          <div className="relative h-28">
            <img src={promoImage} alt="Vista previa de la promoción" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <div className="text-white font-bold text-lg leading-tight">{benefitLabel}</div>
              <div className="text-white/80 text-xs">{form?.identityTitle || form?.publicTitle || 'Título de la promoción'}</div>
            </div>
            <div className="absolute top-2 right-2 flex items-center gap-1">
              {typeConfig && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: accentColor, color: '#fff' }}>
                  {typeConfig?.label}
                </span>
              )}
            </div>
          </div>
          <div className="bg-card p-3 space-y-2">
            <div className="text-xs text-muted-foreground line-clamp-2">
              {form?.identityDescription || form?.description || 'Descripción de la promoción aparecerá aquí'}
            </div>
            <div className="h-1 rounded-full" style={{ backgroundColor: accentColor }} />
          </div>
        </div>

        {/* Right side: trigger + summary */}
        <div className="flex-1 min-w-[180px] space-y-2">
          {triggerMode === 'automatic' && selectedTrigger ? (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-2.5 flex items-center gap-2">
              <Icon name="Zap" size={13} className="text-primary flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-primary">Con trigger activo</p>
                <p className="text-xs text-muted-foreground">
                  {TRIGGER_CATEGORIES?.flatMap(c => c?.triggers)?.find(t => t?.key === selectedTrigger)?.label || selectedTrigger}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-muted/50 border border-border rounded-xl p-2.5 flex items-center gap-2">
              <Icon name="Hand" size={13} className="text-muted-foreground flex-shrink-0" />
              <p className="text-xs text-muted-foreground">Distribución manual</p>
            </div>
          )}

          <div className="bg-card border border-border rounded-xl p-2.5 space-y-1.5">
            <h4 className="text-xs font-semibold text-foreground">Resumen</h4>
            <div className="space-y-1">
              {typeConfig && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon name={typeConfig?.icon} size={10} className="text-primary" />
                  <span>{typeConfig?.label}</span>
                  <span className={`ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full border ${typeConfig?.plan === 'PREMIUM' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' : 'text-blue-600 bg-blue-50 border-blue-200'}`}>{typeConfig?.plan}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon name="Percent" size={10} className="text-blue-500" />
                {benefitLabel}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon name="Share2" size={10} className="text-purple-500" />
                {form?.showInFeed !== false ? 'Feed de promociones' : 'Sin distribución en feed'}
              </div>
            </div>
          </div>

          {/* Push notification preview */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Push notification</p>
            <div className="bg-gray-900 rounded-xl p-2.5 flex items-start gap-2">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="Tag" size={12} className="text-white" />
              </div>
              <div>
                <div className="text-white text-xs font-semibold">PromoClub</div>
                <div className="text-gray-300 text-xs leading-tight">
                  Tu negocio tiene una nueva promo: {form?.identityTitle || form?.publicTitle || 'Nueva promoción'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── TRIGGER CONFIG FIELDS ────────────────────────────────────────────────────

const TriggerConfigFields = ({ triggerKey, triggerConfig, setTriggerConfig }) => {
  const set = (k, v) => setTriggerConfig(prev => ({ ...prev, [k]: v }));

  if (triggerKey === 'visit_count') return (
    <div className="flex items-center gap-2 mt-3">
      <span className="text-sm text-muted-foreground">Activar cuando el cliente alcance</span>
      <input type="number" min={1} max={100} value={triggerConfig?.visit_threshold || 5} onChange={e => set('visit_threshold', Number(e?.target?.value))} className="w-20 px-2 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-center font-bold" />
      <span className="text-sm text-muted-foreground">visitas acumuladas</span>
    </div>
  );
  if (triggerKey === 'spend_amount') return (
    <div className="flex items-center gap-2 mt-3">
      <span className="text-sm text-muted-foreground">Activar cuando haya gastado</span>
      <div className="flex items-center border border-border rounded-lg overflow-hidden">
        <span className="px-2 py-1.5 bg-muted text-sm text-muted-foreground">$</span>
        <input type="number" min={1} value={triggerConfig?.spend_threshold || 500} onChange={e => set('spend_threshold', Number(e?.target?.value))} className="w-24 px-2 py-1.5 bg-background text-foreground text-sm focus:outline-none font-bold" />
      </div>
      <span className="text-sm text-muted-foreground">MXN en total</span>
    </div>
  );
  if (triggerKey === 'inactivity') return (
    <div className="flex items-center gap-2 mt-3">
      <span className="text-sm text-muted-foreground">Activar si lleva</span>
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
            const days = triggerConfig?.time_window_days || ['lun', 'mar', 'mie', 'jue', 'vie'];
            const active = days?.includes(d?.id);
            return (
              <button key={d?.id} type="button" onClick={() => {
                const updated = active ? days?.filter(x => x !== d?.id) : [...days, d?.id];
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

// ─── BENEFIT SELECTOR ─────────────────────────────────────────────────────────

const BenefitSelector = ({ form, update, suggestions }) => (
  <div className="space-y-4">
    <Field label="Tipo de beneficio" required>
      <StyledSelect value={form?.discountType} onChange={e => update('discountType', e?.target?.value)}>
        {DISCOUNT_TYPES?.map(d => <option key={d?.value} value={d?.value}>{d?.label}</option>)}
      </StyledSelect>
    </Field>

    {form?.discountType === 'percentage' && (
      <Field label="Porcentaje de descuento" hint={`${form?.discountValue || 0}%`}>
        <div className="space-y-2">
          <input type="range" min="5" max="90" step="5" value={form?.discountValue || 10}
            onChange={e => update('discountValue', parseInt(e?.target?.value))}
            className="w-full accent-primary" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5%</span>
            <span className="font-bold text-primary text-sm">{form?.discountValue || 10}%</span>
            <span>90%</span>
          </div>
        </div>
      </Field>
    )}

    {form?.discountType === 'fixed' && (
      <Field label="Monto fijo de descuento (MXN)">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">$</span>
          <StyledInput type="number" min="0" step="0.01" value={form?.discountValue} onChange={e => update('discountValue', e?.target?.value)} placeholder="0.00" />
          <span className="text-muted-foreground text-sm">MXN</span>
        </div>
      </Field>
    )}

    {form?.discountType === 'free_product' && (
      <Field label="Producto gratis">
        <StyledInput type="text" value={form?.freeProductName} onChange={e => update('freeProductName', e?.target?.value)} placeholder="Nombre del producto" />
      </Field>
    )}

    {form?.discountType === 'special_price' && (
      <Field label="Precio especial (MXN)">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">$</span>
          <StyledInput type="number" min="0" step="0.01" value={form?.specialPrice} onChange={e => update('specialPrice', e?.target?.value)} placeholder="0.00" />
          <span className="text-muted-foreground text-sm">MXN</span>
        </div>
      </Field>
    )}

    {form?.discountType === 'bundle' && (
      <div className="grid grid-cols-2 gap-3">
        <Field label="Producto A">
          <StyledInput type="text" value={form?.bundleProductA} onChange={e => update('bundleProductA', e?.target?.value)} placeholder="Producto A" />
        </Field>
        <Field label="Producto B">
          <StyledInput type="text" value={form?.bundleProductB} onChange={e => update('bundleProductB', e?.target?.value)} placeholder="Producto B" />
        </Field>
        <div className="col-span-2">
          <Field label="Precio combinado (MXN)">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">$</span>
              <StyledInput type="number" min="0" step="0.01" value={form?.bundlePrice} onChange={e => update('bundlePrice', e?.target?.value)} placeholder="0.00" />
            </div>
          </Field>
        </div>
      </div>
    )}

    {suggestions && <InfoBanner icon="Lightbulb" text={suggestions} color="amber" />}
  </div>
);

// ─── APPLICABILITY SECTION ────────────────────────────────────────────────────

const ApplicabilitySection = ({ form, update, categories }) => (
  <SectionCard title="Aplicabilidad" icon="Target">
    <div className="space-y-3">
      <Field label="¿Dónde aplica?">
        <StyledSelect value={form?.applicability} onChange={e => update('applicability', e?.target?.value)}>
          <option value="all">Aplica en todo el menú</option>
          <option value="categories">Solo en categorías específicas</option>
          <option value="products">Solo en productos específicos</option>
          <option value="min_purchase">En la compra mínima de $[___] MXN</option>
        </StyledSelect>
      </Field>

      {form?.applicability === 'categories' && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Selecciona las categorías:</p>
          <div className="flex flex-wrap gap-2">
            {(categories || [])?.map(cat => (
              <button key={cat?.id} type="button"
                onClick={() => update('selectedCategories', form?.selectedCategories?.includes(cat?.id)
                  ? (form?.selectedCategories || [])?.filter(x => x !== cat?.id)
                  : [...(form?.selectedCategories || []), cat?.id])}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${form?.selectedCategories?.includes(cat?.id) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                {cat?.name}
              </button>
            ))}
            {(!categories || categories?.length === 0) && <p className="text-xs text-muted-foreground">No hay categorías disponibles</p>}
          </div>
        </div>
      )}

      {form?.applicability === 'products' && (
        <Field label="Productos específicos">
          <StyledInput type="text" value={form?.specificProducts} onChange={e => update('specificProducts', e?.target?.value)} placeholder="Buscar productos del catálogo..." />
        </Field>
      )}

      {form?.applicability === 'min_purchase' && (
        <Field label="Monto mínimo de compra (MXN)">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">$</span>
            <StyledInput type="number" min="0" step="0.01" value={form?.minPurchaseAmount} onChange={e => update('minPurchaseAmount', e?.target?.value)} placeholder="0.00" />
            <span className="text-muted-foreground text-sm">MXN</span>
          </div>
        </Field>
      )}
    </div>
  </SectionCard>
);

// ─── VALIDITY SECTION ─────────────────────────────────────────────────────────

const ValiditySection = ({ form, update }) => (
  <SectionCard title="Vigencia" icon="Calendar">
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha de inicio">
          <StyledInput type="date" value={form?.startDate} onChange={e => update('startDate', e?.target?.value)} />
        </Field>
        <Field label="Fecha de fin">
          <StyledInput type="date" value={form?.endDate} onChange={e => update('endDate', e?.target?.value)} disabled={form?.noEndDate} />
        </Field>
      </div>
      <Toggle label="Sin fecha de fin" desc="La promoción no tiene fecha de expiración" value={form?.noEndDate || false} onChange={v => update('noEndDate', v)} />
      <Field label="Horario">
        <StyledSelect value={form?.timeRange} onChange={e => update('timeRange', e?.target?.value)}>
          <option value="all_day">Todo el día</option>
          <option value="custom">Solo de [hora] a [hora]</option>
        </StyledSelect>
      </Field>
      {form?.timeRange === 'custom' && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Hora inicio">
            <StyledInput type="time" value={form?.startTime} onChange={e => update('startTime', e?.target?.value)} />
          </Field>
          <Field label="Hora fin">
            <StyledInput type="time" value={form?.endTime} onChange={e => update('endTime', e?.target?.value)} />
          </Field>
        </div>
      )}
      <Field label="Días activos">
        <DayPicker selected={form?.activeDays} onChange={v => update('activeDays', v)} />
      </Field>
    </div>
  </SectionCard>
);

// ─── LIMITS SECTION ───────────────────────────────────────────────────────────

const LimitsSection = ({ form, update }) => (
  <SectionCard title="Límites y Control" icon="Shield">
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Máximo de usos totales">
          <StyledInput type="number" min="0" value={form?.totalLimit} onChange={e => update('totalLimit', e?.target?.value)} placeholder="Ilimitado" />
        </Field>
        <Field label="Máximo de usos por cliente">
          <StyledInput type="number" min="1" value={form?.perUserLimit} onChange={e => update('perUserLimit', e?.target?.value)} placeholder="1" />
        </Field>
      </div>
      <Field label="Período del límite por cliente">
        <StyledSelect value={form?.perUserLimitPeriod} onChange={e => update('perUserLimitPeriod', e?.target?.value)}>
          <option value="forever">Por siempre</option>
          <option value="month">Por mes</option>
          <option value="week">Por semana</option>
        </StyledSelect>
      </Field>
      <Toggle label="Combinable con cupones activos" value={form?.combinableWithCoupons || false} onChange={v => update('combinableWithCoupons', v)} />
      <Toggle label="Combinable con descuento de puntos" value={form?.combinableWithPoints || false} onChange={v => update('combinableWithPoints', v)} />
    </div>
  </SectionCard>
);

// ─── TYPE-SPECIFIC CONFIG COMPONENTS ─────────────────────────────────────────

const StandardConfig = ({ form, update, categories }) => (
  <div className="space-y-5">
    <ValiditySection form={form} update={update} />
    <LimitsSection form={form} update={update} />
  </div>
);

const FlashDealConfig = ({ form, update }) => (
  <div className="space-y-5">
    <SectionCard title="Duración del Deal" icon="Timer">
      <div className="space-y-4">
        <Field label="Duración">
          <div className="flex flex-wrap gap-2">
            {[15, 30, 45, 60, 90]?.map(m => (
              <button key={m} type="button" onClick={() => update('flashDuration', m)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${form?.flashDuration === m ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                {m} min
              </button>
            ))}
          </div>
        </Field>
        <InfoBanner icon="Info" text="Un countdown visible en la app B2C se mostrará durante toda la duración del deal." color="blue" />
      </div>
    </SectionCard>
    <SectionCard title="Hora de Inicio" icon="Clock">
      <div className="space-y-3">
        <div className="flex gap-2">
          {[{ v: 'now', l: '⚡ Ahora mismo' }, { v: 'scheduled', l: '📅 Programar' }]?.map(m => (
            <button key={m?.v} type="button" onClick={() => update('flashStartMode', m?.v)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${form?.flashStartMode === m?.v ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
              {m?.l}
            </button>
          ))}
        </div>
        {form?.flashStartMode === 'scheduled' && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha">
              <StyledInput type="date" value={form?.flashScheduledDate} onChange={e => update('flashScheduledDate', e?.target?.value)} />
            </Field>
            <Field label="Hora">
              <StyledInput type="time" value={form?.flashScheduledTime} onChange={e => update('flashScheduledTime', e?.target?.value)} />
            </Field>
          </div>
        )}
      </div>
    </SectionCard>
    <SectionCard title="Radio de Push Geolocalizado" icon="MapPin">
      <div className="space-y-3">
        <Field label="Radio de notificación">
          <div className="space-y-2">
            <input type="range" min="0" max="4" step="1"
              value={[0.5, 1, 2, 3, 5]?.indexOf(form?.pushRadius || 1) === -1 ? 1 : [0.5, 1, 2, 3, 5]?.indexOf(form?.pushRadius || 1)}
              onChange={e => update('pushRadius', [0.5, 1, 2, 3, 5]?.[parseInt(e?.target?.value)])}
              className="w-full accent-primary" />
            <div className="flex justify-between text-xs text-muted-foreground">
              {['500m', '1km', '2km', '3km', '5km']?.map(l => <span key={l}>{l}</span>)}
            </div>
          </div>
        </Field>
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-xs text-primary font-medium">📍 A {form?.pushRadius || 1} km, aproximadamente <strong>~{Math.round((form?.pushRadius || 1) * 850)}</strong> usuarios recibirán la notificación ahora mismo.</p>
        </div>
      </div>
    </SectionCard>
    <SectionCard title="Mensaje del Push" icon="MessageSquare">
      <div className="space-y-3">
        <Field label="Mensaje personalizable" hint="máx. 80 caracteres">
          <StyledTextarea rows={2} maxLength={80} value={form?.pushMessage} onChange={e => update('pushMessage', e?.target?.value)}
            placeholder="Ej: ¡Solo 45 minutos! Ven y aprovecha este deal increíble." />
          <p className="text-xs text-muted-foreground mt-1 text-right">{(form?.pushMessage || '')?.length}/80</p>
        </Field>
        <InfoBanner icon="Info" text="El push incluirá automáticamente: ⚡ Solo {minutos_restantes} minutos: [mensaje]. Vence a las {hora_fin}." color="blue" />
        <div className="flex flex-wrap gap-1.5">
          {['{negocio}', '{beneficio}', '{minutos_restantes}', '{hora_fin}']?.map(v => (
            <button key={v} type="button" onClick={() => update('pushMessage', (form?.pushMessage || '') + v)}
              className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground hover:bg-muted/80 font-mono">{v}</button>
          ))}
        </div>
      </div>
    </SectionCard>
    <SectionCard title="Límite de Canjes" icon="Hash">
      <div className="space-y-3">
        <Field label="Máximo de canjes durante el flash deal">
          <StyledInput type="number" min="1" value={form?.flashMaxRedemptions} onChange={e => update('flashMaxRedemptions', e?.target?.value)} placeholder="Sin límite" />
        </Field>
        <Toggle label="Notificarme cuando se alcance el 80% del límite" value={form?.notifyAt80Pct || false} onChange={v => update('notifyAt80Pct', v)} />
      </div>
    </SectionCard>
    <SectionCard title="Repetición Programada" icon="RefreshCw">
      <div className="space-y-3">
        <Toggle label="Repetir este flash deal" desc="Automatiza flash deals recurrentes sin configurarlos manualmente" value={form?.flashRepeat || false} onChange={v => update('flashRepeat', v)} />
        {form?.flashRepeat && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Field label="Frecuencia">
              <StyledSelect value={form?.flashRepeatFreq} onChange={e => update('flashRepeatFreq', e?.target?.value)}>
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quincenal</option>
                <option value="monthly">Mensual</option>
              </StyledSelect>
            </Field>
            <Field label="Hora preferida de lanzamiento">
              <StyledInput type="time" value={form?.flashRepeatTime} onChange={e => update('flashRepeatTime', e?.target?.value)} />
            </Field>
          </div>
        )}
      </div>
    </SectionCard>
  </div>
);

const HappyHourConfig = ({ form, update }) => {
  const [timeSlots, setTimeSlots] = useState(form?.happyHourSlots || [{ days: [], startTime: '', endTime: '' }]);
  const updateSlot = (idx, key, val) => {
    const updated = timeSlots?.map((s, i) => i === idx ? { ...s, [key]: val } : s);
    setTimeSlots(updated);
    update('happyHourSlots', updated);
  };
  const addSlot = () => {
    const updated = [...timeSlots, { days: [], startTime: '', endTime: '' }];
    setTimeSlots(updated);
    update('happyHourSlots', updated);
  };
  const removeSlot = (idx) => {
    const updated = timeSlots?.filter((_, i) => i !== idx);
    setTimeSlots(updated);
    update('happyHourSlots', updated);
  };
  return (
    <div className="space-y-5">
      <SectionCard title="Beneficio durante el Happy Hour" icon="Percent">
        <div className="space-y-4">
          <Field label="Multiplicador de puntos (opcional)">
            <StyledSelect value={form?.pointsMultiplier} onChange={e => update('pointsMultiplier', e?.target?.value)}>
              <option value="">Sin multiplicador</option>
              <option value="1.5">×1.5 puntos</option>
              <option value="2">×2 puntos</option>
              <option value="3">×3 puntos</option>
            </StyledSelect>
          </Field>
          <InfoBanner icon="Info" text="El tipo de descuento se configura en la pestaña Beneficio. Aquí puedes añadir un multiplicador de puntos adicional." color="blue" />
        </div>
      </SectionCard>
      <SectionCard title="Franjas Horarias" icon="Clock">
        <div className="space-y-3">
          {timeSlots?.map((slot, idx) => (
            <div key={idx} className="p-4 bg-muted/30 rounded-xl border border-border space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Franja {idx + 1}</p>
                {timeSlots?.length > 1 && (
                  <button type="button" onClick={() => removeSlot(idx)} className="text-destructive hover:text-destructive/80 p-1">
                    <Icon name="Trash2" size={14} />
                  </button>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Días</p>
                <DayPicker selected={slot?.days} onChange={v => updateSlot(idx, 'days', v)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Hora inicio">
                  <StyledInput type="time" value={slot?.startTime} onChange={e => updateSlot(idx, 'startTime', e?.target?.value)} />
                </Field>
                <Field label="Hora fin">
                  <StyledInput type="time" value={slot?.endTime} onChange={e => updateSlot(idx, 'endTime', e?.target?.value)} />
                </Field>
              </div>
            </div>
          ))}
          <button type="button" onClick={addSlot}
            className="w-full py-2.5 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-2">
            <Icon name="Plus" size={15} /> Agregar franja
          </button>
        </div>
        <div className="mt-4">
          <p className="text-xs font-medium text-foreground mb-2">Vista semanal (heatmap)</p>
          <div className="grid grid-cols-7 gap-1">
            {DAYS_OF_WEEK?.map(d => {
              const hasSlot = timeSlots?.some(s => s?.days?.includes(d?.id));
              return (
                <div key={d?.id} className={`rounded-lg p-2 text-center ${hasSlot ? 'bg-primary/20 border border-primary/40' : 'bg-muted/30 border border-border'}`}>
                  <p className="text-xs font-medium text-foreground">{d?.label}</p>
                  {hasSlot && <div className="w-2 h-2 bg-primary rounded-full mx-auto mt-1" />}
                </div>
              );
            })}
          </div>
        </div>
      </SectionCard>
      <SectionCard title="Notificación a Clientes" icon="Bell">
        <div className="space-y-3">
          <Toggle label="Enviar push al inicio de cada happy hour" value={form?.happyHourPush || false} onChange={v => update('happyHourPush', v)} />
          {form?.happyHourPush && (
            <>
              <Field label="Audiencia">
                <StyledSelect value={form?.happyHourPushAudience} onChange={e => update('happyHourPushAudience', e?.target?.value)}>
                  <option value="all_followers">Todos los seguidores</option>
                  <option value="nearby">Clientes en radio X km</option>
                  <option value="regulars">Clientes habituales del horario</option>
                </StyledSelect>
              </Field>
              <Field label="Mensaje del push">
                <StyledTextarea rows={2} value={form?.happyHourPushMsg} onChange={e => update('happyHourPushMsg', e?.target?.value)}
                  placeholder="🕐 Happy Hour en {negocio} — {beneficio} hasta las {hora_fin}." />
              </Field>
            </>
          )}
        </div>
      </SectionCard>
      <SectionCard title="Estado Automático" icon="Power">
        <Toggle label="Activar y desactivar automáticamente según el horario"
          desc="La promo aparece y desaparece sola en la app B2C según las franjas configuradas"
          value={form?.autoActivateHappyHour !== false} onChange={v => update('autoActivateHappyHour', v)} />
      </SectionCard>
    </div>
  );
};

const LimitedDropConfig = ({ form, update }) => (
  <div className="space-y-5">
    <SectionCard title="Inventario Disponible" icon="Package">
      <div className="space-y-3">
        <Field label="Unidades disponibles" required>
          <StyledInput type="number" min="1" value={form?.dropStock} onChange={e => update('dropStock', e?.target?.value)} placeholder="Ej: 50" />
        </Field>
        <InfoBanner icon="Info" text="Este es el número de veces que se puede canjear el deal. Puede ser unidades físicas o cupos de un servicio." color="blue" />
      </div>
    </SectionCard>
    <SectionCard title="Ventana de Tiempo" icon="Clock">
      <div className="space-y-3">
        <div className="flex gap-2">
          {[{ v: 'window', l: '📅 Ventana fija' }, { v: 'hours_from_publish', l: '⏱ Horas desde publicación' }]?.map(m => (
            <button key={m?.v} type="button" onClick={() => update('dropTimeMode', m?.v)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${form?.dropTimeMode === m?.v ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
              {m?.l}
            </button>
          ))}
        </div>
        {form?.dropTimeMode === 'window' ? (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Inicio">
              <StyledInput type="datetime-local" value={form?.dropStartDateTime} onChange={e => update('dropStartDateTime', e?.target?.value)} />
            </Field>
            <Field label="Fin">
              <StyledInput type="datetime-local" value={form?.dropEndDateTime} onChange={e => update('dropEndDateTime', e?.target?.value)} />
            </Field>
          </div>
        ) : (
          <Field label="Disponible por X horas desde que se publique">
            <div className="flex items-center gap-2">
              <StyledInput type="number" min="1" value={form?.dropHoursFromPublish} onChange={e => update('dropHoursFromPublish', e?.target?.value)} placeholder="24" className="w-24" />
              <span className="text-sm text-muted-foreground">horas</span>
            </div>
          </Field>
        )}
        <InfoBanner icon="Eye" text="El cliente verá: 'Quedan 47 unidades · 3h 24min restantes' — el countdown es el diferenciador del drop." color="blue" />
      </div>
    </SectionCard>
    <SectionCard title="Modo de Revelación" icon="Eye">
      <div className="space-y-3">
        <div className="flex gap-2">
          {[{ v: 'immediate', l: '👁 Visible inmediatamente' }, { v: 'teaser', l: '🎭 Anunciar como teaser' }]?.map(m => (
            <button key={m?.v} type="button" onClick={() => update('dropRevealMode', m?.v)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${form?.dropRevealMode === m?.v ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
              {m?.l}
            </button>
          ))}
        </div>
        {form?.dropRevealMode === 'teaser' && (
          <>
            <Field label="Horas de anticipación del teaser">
              <div className="flex items-center gap-2">
                <StyledInput type="number" min="1" value={form?.dropTeaserHours} onChange={e => update('dropTeaserHours', e?.target?.value)} placeholder="24" className="w-24" />
                <span className="text-sm text-muted-foreground">horas antes</span>
              </div>
            </Field>
            <InfoBanner icon="Lightbulb" text="El teaser genera anticipación: 'Mañana a las 6 PM: drop especial. ¿Estás listo?' Sin revelar el beneficio hasta el momento exacto." color="amber" />
          </>
        )}
      </div>
    </SectionCard>
    <SectionCard title="Alertas de Stock" icon="AlertTriangle">
      <div className="space-y-3">
        <Toggle label="Notificarme cuando quede el 20% del inventario" value={form?.dropStockAlert20 !== false} onChange={v => update('dropStockAlert20', v)} />
        <Toggle label="Notificar a los clientes cuando queden pocas unidades" value={form?.dropClientStockAlert || false} onChange={v => update('dropClientStockAlert', v)} />
        {form?.dropClientStockAlert && (
          <Field label="Notificar cuando queden">
            <div className="flex items-center gap-2">
              <StyledInput type="number" min="1" value={form?.dropClientStockAlertUnits} onChange={e => update('dropClientStockAlertUnits', e?.target?.value)} placeholder="5" className="w-24" />
              <span className="text-sm text-muted-foreground">unidades</span>
            </div>
          </Field>
        )}
      </div>
    </SectionCard>
    <SectionCard title="Lista de Espera" icon="Users">
      <Toggle label="Activar lista de espera si se agota"
        desc="Si un cliente quiere el deal pero ya se agotó, puede anotarse. Si alguien cancela o el negocio añade más unidades, el primero de la lista recibe notificación."
        value={form?.dropWaitlist || false} onChange={v => update('dropWaitlist', v)} />
    </SectionCard>
  </div>
);

const BirthdayConfig = ({ form, update }) => (
  <div className="space-y-5">
    <SectionCard title="¿Cuándo se Envía?" icon="Clock">
      <div className="space-y-3">
        <Field label="Momento de entrega">
          <StyledSelect value={form?.birthdayTiming} onChange={e => update('birthdayTiming', e?.target?.value)}>
            <option value="exact_day">El día exacto del cumpleaños</option>
            <option value="week">Toda la semana de cumpleaños</option>
            <option value="month">Todo el mes del cumpleaños</option>
            <option value="days_before">X días antes del cumpleaños</option>
          </StyledSelect>
        </Field>
        {form?.birthdayTiming === 'days_before' && (
          <Field label="Días de anticipación">
            <div className="flex flex-wrap gap-2">
              {[3, 5, 7, 14]?.map(d => (
                <button key={d} type="button" onClick={() => update('birthdayDaysBefore', d)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${form?.birthdayDaysBefore === d ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                  {d} días
                </button>
              ))}
            </div>
          </Field>
        )}
        <InfoBanner icon="Lightbulb" text="La opción más efectiva es 'X días antes' porque el cliente tiene tiempo de planear su visita de cumpleaños." color="amber" />
      </div>
    </SectionCard>
    <SectionCard title="Mensaje Personalizado" icon="MessageSquare">
      <div className="space-y-3">
        <Field label="Mensaje del push y de la promo">
          <StyledTextarea rows={3} value={form?.birthdayMessage} onChange={e => update('birthdayMessage', e?.target?.value)}
            placeholder="¡Feliz cumpleaños {nombre_cliente}! En {negocio} queremos celebrarlo contigo. {beneficio} disponible hasta {fecha_vencimiento}." />
        </Field>
        <div className="flex flex-wrap gap-1.5">
          {['{nombre_cliente}', '{negocio}', '{beneficio}', '{fecha_vencimiento}']?.map(v => (
            <button key={v} type="button" onClick={() => update('birthdayMessage', (form?.birthdayMessage || '') + v)}
              className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground hover:bg-muted/80 font-mono">{v}</button>
          ))}
        </div>
      </div>
    </SectionCard>
    <SectionCard title="Restricciones de Uso" icon="Shield">
      <div className="space-y-2">
        <Toggle label="Solo válida en visita presencial (requiere check-in)" value={form?.birthdayRequireCheckin || false} onChange={v => update('birthdayRequireCheckin', v)} />
        <Toggle label="Válida una sola vez durante el período de cumpleaños"
          desc="Sin esta restricción el cliente podría canjear múltiples veces durante el mes"
          value={form?.birthdayOneUse !== false} onChange={v => update('birthdayOneUse', v)} />
      </div>
    </SectionCard>
  </div>
);

const FirstVisitConfig = ({ form, update }) => (
  <div className="space-y-5">
    <SectionCard title="¿Quién Califica?" icon="UserCheck">
      <Field label="Definición de 'nuevo cliente'">
        <StyledSelect value={form?.firstVisitQualifier} onChange={e => update('firstVisitQualifier', e?.target?.value)}>
          <option value="new_in_platform">Cualquier cliente nuevo en PromoClub (primera visita en la plataforma)</option>
          <option value="new_in_business">Cualquier cliente nuevo en este negocio específico</option>
          <option value="referred">Clientes que vienen referidos (solo válida si llegaron por link de referido)</option>
        </StyledSelect>
      </Field>
    </SectionCard>
    <SectionCard title="Vigencia para Canjear" icon="Calendar">
      <div className="space-y-3">
        <Field label="Válida por X días desde la primera visita">
          <div className="flex items-center gap-2">
            <StyledInput type="number" min="1" value={form?.firstVisitValidDays} onChange={e => update('firstVisitValidDays', e?.target?.value)} placeholder="7" className="w-24" />
            <span className="text-sm text-muted-foreground">días</span>
          </div>
        </Field>
        <InfoBanner icon="Info" text="Sin esto, el cliente podría llegar 6 meses después y canjearla. Recomendado: 7 días." color="blue" />
      </div>
    </SectionCard>
    <SectionCard title="Canal de Distribución" icon="Share2">
      <div className="space-y-2">
        {[
          { value: 'wallet_on_register', label: 'Automáticamente en su wallet al registrarse' },
          { value: 'business_listing', label: 'Visible en la ficha del negocio antes de visitar (para atraerlos)' },
          { value: 'on_checkin', label: 'Solo al hacer check-in' },
        ]?.map(opt => (
          <label key={opt?.value} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
            <input type="radio" name="firstVisitChannel" value={opt?.value}
              checked={form?.firstVisitChannel === opt?.value}
              onChange={() => update('firstVisitChannel', opt?.value)} className="accent-primary" />
            <span className="text-sm text-foreground">{opt?.label}</span>
          </label>
        ))}
      </div>
    </SectionCard>
    <SectionCard title="Complemento con Puntos de Bienvenida" icon="Star">
      <Toggle label="Combinar con puntos de bienvenida del programa de puntos"
        desc="Si activo: la primera visita da tanto la promo de bienvenida como los puntos de bienvenida. Si desactivo: solo aplica uno de los dos."
        value={form?.firstVisitCombinePoints || false} onChange={v => update('firstVisitCombinePoints', v)} />
    </SectionCard>
  </div>
);

const WeatherConfig = ({ form, update }) => (
  <div className="space-y-5">
    <SectionCard title="Condición Climática" icon="Cloud">
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">Selecciona una o más condiciones que activarán la promo:</p>
        <div className="space-y-2">
          {WEATHER_CONDITIONS?.map(cond => (
            <label key={cond?.value} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer border border-transparent hover:border-border">
              <input type="checkbox"
                checked={form?.weatherConditions?.includes(cond?.value)}
                onChange={() => update('weatherConditions', form?.weatherConditions?.includes(cond?.value)
                  ? (form?.weatherConditions || [])?.filter(x => x !== cond?.value)
                  : [...(form?.weatherConditions || []), cond?.value])}
                className="accent-primary" />
              <span className="text-sm text-foreground flex-1">{cond?.label}</span>
              {cond?.value === 'hot' && form?.weatherConditions?.includes(cond?.value) && (
                <StyledInput type="number" value={form?.weatherTempMax} onChange={e => update('weatherTempMax', e?.target?.value)} className="w-20" placeholder="°C" />
              )}
              {cond?.value === 'cold' && form?.weatherConditions?.includes(cond?.value) && (
                <StyledInput type="number" value={form?.weatherTempMin} onChange={e => update('weatherTempMin', e?.target?.value)} className="w-20" placeholder="°C" />
              )}
              {cond?.value === 'uv' && form?.weatherConditions?.includes(cond?.value) && (
                <StyledInput type="number" value={form?.weatherUVIndex} onChange={e => update('weatherUVIndex', e?.target?.value)} className="w-20" placeholder="UV" />
              )}
            </label>
          ))}
        </div>
      </div>
    </SectionCard>
    <SectionCard title="Duración de la Promo" icon="Timer">
      <div className="space-y-3">
        <Field label="Modo de duración">
          <StyledSelect value={form?.weatherDurationMode} onChange={e => update('weatherDurationMode', e?.target?.value)}>
            <option value="while_condition">Mientras dure la condición climática (se activa y desactiva automáticamente)</option>
            <option value="fixed_hours">X horas desde que se detecta la condición</option>
            <option value="rest_of_day">El resto del día una vez activada</option>
          </StyledSelect>
        </Field>
        {form?.weatherDurationMode === 'fixed_hours' && (
          <Field label="Horas de duración">
            <div className="flex items-center gap-2">
              <StyledInput type="number" min="1" value={form?.weatherDurationHours} onChange={e => update('weatherDurationHours', e?.target?.value)} placeholder="2" className="w-24" />
              <span className="text-sm text-muted-foreground">horas</span>
            </div>
          </Field>
        )}
      </div>
    </SectionCard>
    <SectionCard title="Notificación Contextual" icon="Bell">
      <div className="space-y-3">
        <Toggle label="Enviar push a clientes cercanos cuando se active por clima" value={form?.weatherPush || false} onChange={v => update('weatherPush', v)} />
        {form?.weatherPush && (
          <>
            <Field label="Mensaje del push">
              <StyledTextarea rows={2} value={form?.weatherPushMsg} onChange={e => update('weatherPushMsg', e?.target?.value)}
                placeholder="☔ Está lloviendo en {ciudad}. Ven a refugiarte en {negocio} — {beneficio} esperándote." />
            </Field>
            <div className="flex flex-wrap gap-1.5">
              {['{ciudad}', '{negocio}', '{beneficio}']?.map(v => (
                <button key={v} type="button" onClick={() => update('weatherPushMsg', (form?.weatherPushMsg || '') + v)}
                  className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground hover:bg-muted/80 font-mono">{v}</button>
              ))}
            </div>
            <Field label="Radio de push (km)">
              <div className="flex items-center gap-2">
                <StyledInput type="number" min="0.5" step="0.5" value={form?.weatherPushRadius} onChange={e => update('weatherPushRadius', e?.target?.value)} placeholder="2" className="w-24" />
                <span className="text-sm text-muted-foreground">km</span>
              </div>
            </Field>
          </>
        )}
      </div>
    </SectionCard>
    <SectionCard title="Horario Permitido" icon="Clock">
      <Toggle label="Activar solo en horario de operación"
        desc="La promo por clima solo se puede activar dentro del horario del negocio"
        value={form?.weatherOnlyInHours !== false} onChange={v => update('weatherOnlyInHours', v)} />
    </SectionCard>
  </div>
);

const InverseDemandConfig = ({ form, update }) => (
  <div className="space-y-5">
    <SectionCard title="Umbral de Baja Afluencia" icon="TrendingDown">
      <div className="space-y-3">
        <Field label="Fuente de detección">
          <StyledSelect value={form?.inverseDemandSource} onChange={e => update('inverseDemandSource', e?.target?.value)}>
            <option value="checkins_per_hour">Check-ins por hora</option>
            <option value="capacity_pct">Porcentaje de capacidad</option>
            <option value="historical_comparison">Comparativa histórica (más inteligente)</option>
          </StyledSelect>
        </Field>
        {form?.inverseDemandSource === 'checkins_per_hour' && (
          <Field label="Activar si en la última hora hubo menos de X check-ins">
            <div className="flex items-center gap-2">
              <StyledInput type="number" min="1" value={form?.inverseCheckinsThreshold} onChange={e => update('inverseCheckinsThreshold', e?.target?.value)} placeholder="5" className="w-24" />
              <span className="text-sm text-muted-foreground">check-ins</span>
            </div>
          </Field>
        )}
        {form?.inverseDemandSource === 'capacity_pct' && (
          <Field label="Activar si la ocupación actual es menor al X% de la capacidad máxima">
            <div className="flex items-center gap-2">
              <StyledInput type="number" min="1" max="100" value={form?.inverseCapacityPct} onChange={e => update('inverseCapacityPct', e?.target?.value)} placeholder="30" className="w-24" />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </Field>
        )}
        {form?.inverseDemandSource === 'historical_comparison' && (
          <Field label="Activar si la afluencia actual es X% menor que el promedio histórico del mismo horario">
            <div className="flex items-center gap-2">
              <StyledInput type="number" min="1" max="100" value={form?.inverseHistoricalPct} onChange={e => update('inverseHistoricalPct', e?.target?.value)} placeholder="40" className="w-24" />
              <span className="text-sm text-muted-foreground">% menor</span>
            </div>
          </Field>
        )}
      </div>
    </SectionCard>
    <SectionCard title="Duración" icon="Timer">
      <div className="space-y-3">
        <Field label="¿Cuánto dura la promo una vez activada?">
          <StyledSelect value={form?.inverseDuration} onChange={e => update('inverseDuration', e?.target?.value)}>
            <option value="while_low">Mientras dure la baja afluencia (se desactiva automáticamente)</option>
            <option value="fixed_minutes">X minutos fijos</option>
            <option value="until_close">Hasta el cierre del negocio</option>
          </StyledSelect>
        </Field>
        {form?.inverseDuration === 'fixed_minutes' && (
          <Field label="Minutos de duración">
            <div className="flex items-center gap-2">
              <StyledInput type="number" min="5" value={form?.inverseFixedMinutes} onChange={e => update('inverseFixedMinutes', e?.target?.value)} placeholder="30" className="w-24" />
              <span className="text-sm text-muted-foreground">minutos</span>
            </div>
          </Field>
        )}
      </div>
    </SectionCard>
    <SectionCard title="Horarios Permitidos" icon="Clock">
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">Define en qué franjas horarias puede activarse la demanda inversa:</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Desde">
            <StyledInput type="time" value={form?.inverseAllowedFrom} onChange={e => update('inverseAllowedFrom', e?.target?.value)} />
          </Field>
          <Field label="Hasta">
            <StyledInput type="time" value={form?.inverseAllowedTo} onChange={e => update('inverseAllowedTo', e?.target?.value)} />
          </Field>
        </div>
        <Field label="Días permitidos">
          <DayPicker selected={form?.inverseAllowedDays} onChange={v => update('inverseAllowedDays', v)} />
        </Field>
      </div>
    </SectionCard>
    <SectionCard title="Activación" icon="Power">
      <div className="space-y-3">
        <div className="flex gap-2">
          {[{ v: 'auto', l: '🤖 Automática' }, { v: 'manual', l: '✋ Confirmar manualmente' }]?.map(m => (
            <button key={m?.v} type="button" onClick={() => update('inverseActivationMode', m?.v)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${form?.inverseActivationMode === m?.v ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
              {m?.l}
            </button>
          ))}
        </div>
        {form?.inverseActivationMode === 'manual' && (
          <InfoBanner icon="Bell" text="El sistema detecta la baja afluencia, envía push al Owner, y el Owner confirma si activa o no." color="amber" />
        )}
      </div>
    </SectionCard>
  </div>
);

const AdventConfig = ({ form, update }) => {
  const adventDays = parseInt(form?.adventDuration) || 24;
  const [dayOffers, setDayOffers] = useState(form?.adventDayOffers || {});
  const [editingDay, setEditingDay] = useState(null);
  const updateDayOffer = (day, offer) => {
    const updated = { ...dayOffers, [day]: offer };
    setDayOffers(updated);
    update('adventDayOffers', updated);
  };
  return (
    <div className="space-y-5">
      <SectionCard title="Duración del Calendario" icon="Calendar">
        <div className="space-y-3">
          <Field label="Número de días">
            <div className="flex flex-wrap gap-2">
              {[12, 24, 31]?.map(d => (
                <button key={d} type="button" onClick={() => update('adventDuration', d)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${form?.adventDuration === d ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                  {d} días
                </button>
              ))}
              <button type="button" onClick={() => update('adventDuration', 'custom')}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${form?.adventDuration === 'custom' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                Personalizado
              </button>
            </div>
          </Field>
          <Field label="Fecha de inicio del calendario">
            <StyledInput type="date" value={form?.adventStartDate} onChange={e => update('adventStartDate', e?.target?.value)} />
          </Field>
        </div>
      </SectionCard>
      <SectionCard title="Modo de Revelación" icon="Eye">
        <div className="space-y-3">
          <div className="flex gap-2">
            {[{ v: 'surprise', l: '🎁 Sorpresa al abrir' }, { v: 'preview', l: '👀 Teaser del día siguiente' }]?.map(m => (
              <button key={m?.v} type="button" onClick={() => update('adventRevealMode', m?.v)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${form?.adventRevealMode === m?.v ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                {m?.l}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>
      <SectionCard title="Condición para Abrir cada Puerta" icon="Lock">
        <Field label="El cliente puede abrir la puerta del día:">
          <StyledSelect value={form?.adventOpenCondition} onChange={e => update('adventOpenCondition', e?.target?.value)}>
            <option value="checkin_today">Solo si hizo check-in hoy en el negocio (fuerza la visita — el más poderoso)</option>
            <option value="checkin_2days">Solo si hizo check-in en los últimos 2 días (más flexible)</option>
            <option value="no_condition">Sin condición de visita — disponible para cualquier cliente</option>
          </StyledSelect>
        </Field>
      </SectionCard>
      <SectionCard title="Configuración por Día" icon="Grid">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Toca cada día para configurar su oferta.</p>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: Math.min(adventDays, 31) }, (_, i) => i + 1)?.map(day => {
              const hasOffer = dayOffers?.[day]?.benefit;
              return (
                <button key={day} type="button" onClick={() => setEditingDay(editingDay === day ? null : day)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium border transition-all ${hasOffer ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-muted/30 border-border text-muted-foreground hover:border-primary/40'} ${editingDay === day ? 'ring-2 ring-primary' : ''}`}>
                  <span>{day}</span>
                  {hasOffer && <span className="text-xs">🎁</span>}
                </button>
              );
            })}
          </div>
          {editingDay && (
            <div className="p-4 bg-muted/30 rounded-xl border border-border space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Día {editingDay}</p>
                <button type="button" onClick={() => setEditingDay(null)} className="text-muted-foreground hover:text-foreground">
                  <Icon name="X" size={16} />
                </button>
              </div>
              <Field label="Tipo de oferta">
                <StyledSelect value={dayOffers?.[editingDay]?.type || ''}
                  onChange={e => updateDayOffer(editingDay, { ...dayOffers?.[editingDay], type: e?.target?.value })}>
                  <option value="">Seleccionar...</option>
                  <option value="product">Producto</option>
                  <option value="discount">Descuento</option>
                  <option value="points_bonus">Puntos bonus</option>
                  <option value="experience">Experiencia</option>
                  <option value="surprise">Sorpresa</option>
                </StyledSelect>
              </Field>
              <Field label="Descripción del beneficio">
                <StyledInput type="text" value={dayOffers?.[editingDay]?.benefit || ''}
                  onChange={e => updateDayOffer(editingDay, { ...dayOffers?.[editingDay], benefit: e?.target?.value })}
                  placeholder="Ej: Café gratis, 20% de descuento..." />
              </Field>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
};

const VIPAccessConfig = ({ form, update }) => (
  <div className="space-y-5">
    <SectionCard title="Promo Subyacente" icon="Layers">
      <div className="space-y-3">
        <InfoBanner icon="Info" text="El Acceso VIP no es un tipo de beneficio en sí mismo — es una capa de exclusividad sobre otro tipo de promo. Elige qué tipo de promo tendrán acceso anticipado." color="blue" />
        <Field label="Tipo de promo base">
          <StyledSelect value={form?.vipBasePromoType} onChange={e => update('vipBasePromoType', e?.target?.value)}>
            <option value="">Seleccionar tipo de promo base...</option>
            <option value="flash_deal">Flash Deal</option>
            <option value="limited_drop">Drop Limitado</option>
            <option value="standard">Promo Estándar especial</option>
          </StyledSelect>
        </Field>
      </div>
    </SectionCard>
    <SectionCard title="Nivel VIP Requerido" icon="Crown">
      <Field label="Nivel mínimo con acceso">
        <StyledSelect value={form?.vipMinLevel} onChange={e => update('vipMinLevel', e?.target?.value)}>
          <option value="gold_only">Solo Oro</option>
          <option value="silver_gold">Plata y Oro</option>
          <option value="all_vip">Todos los niveles VIP (Bronce+)</option>
        </StyledSelect>
      </Field>
    </SectionCard>
    <SectionCard title="Horas de Anticipación" icon="Clock">
      <div className="space-y-3">
        <Field label="Los VIPs pueden ver y canjear esta promo X horas antes que el público general">
          <div className="flex flex-wrap gap-2">
            {[2, 6, 12, 24, 48]?.map(h => (
              <button key={h} type="button" onClick={() => update('vipEarlyHours', h)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${form?.vipEarlyHours === h ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                {h}h
              </button>
            ))}
          </div>
        </Field>
        <InfoBanner icon="Crown" text="La promo existe en el sistema pero es invisible para clientes no-VIP hasta que termina el período de anticipación." color="amber" />
      </div>
    </SectionCard>
    <SectionCard title="Notificación Exclusiva a VIPs" icon="Bell">
      <div className="space-y-3">
        <Field label="Mensaje del push exclusivo">
          <StyledTextarea rows={2} value={form?.vipPushMsg} onChange={e => update('vipPushMsg', e?.target?.value)}
            placeholder="👑 Acceso exclusivo para {nivel_vip}: {beneficio} disponible solo para ti por las próximas {horas} horas." />
        </Field>
        <div className="flex flex-wrap gap-1.5">
          {['{nivel_vip}', '{beneficio}', '{horas}']?.map(v => (
            <button key={v} type="button" onClick={() => update('vipPushMsg', (form?.vipPushMsg || '') + v)}
              className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground hover:bg-muted/80 font-mono">{v}</button>
          ))}
        </div>
      </div>
    </SectionCard>
    <SectionCard title="Límite Exclusivo VIP" icon="Lock">
      <div className="space-y-3">
        <Toggle label="Reservar unidades exclusivamente para VIPs"
          desc="Al abrirse al público general, solo quedan las unidades no tomadas por VIPs"
          value={form?.vipReserveUnits || false} onChange={v => update('vipReserveUnits', v)} />
        {form?.vipReserveUnits && (
          <Field label="Unidades reservadas para VIPs">
            <StyledInput type="number" min="1" value={form?.vipReservedCount} onChange={e => update('vipReservedCount', e?.target?.value)} placeholder="10" className="w-24" />
          </Field>
        )}
      </div>
    </SectionCard>
    <SectionCard title="Visibilidad para No-VIPs" icon="Eye">
      <Toggle label="Mostrar la promo bloqueada a clientes no-VIP"
        desc="Los clientes no-VIP ven la promo con un candado y texto: 'Exclusivo para clientes [nivel]. Sube de nivel para acceder.'"
        value={form?.vipShowLocked !== false} onChange={v => update('vipShowLocked', v)} />
    </SectionCard>
  </div>
);

// ─── MAIN WIZARD COMPONENT ────────────────────────────────────────────────────

const NewPromotionPage = ({ initialData = null, isEdit = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const editPromo = location?.state?.editPromo || null;
  const isEditMode = isEdit || !!editPromo;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('distribution');
  const [categories, setCategories] = useState([]);
  const [selectedType, setSelectedType] = useState(editPromo?.promoType || initialData?.promoType || null);
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Distribution / trigger state
  const [triggerMode, setTriggerMode] = useState('manual'); // 'manual' | 'automatic'
  const [selectedTrigger, setSelectedTrigger] = useState(null);
  const [triggerConfig, setTriggerConfig] = useState({});

  const [form, setForm] = useState({
    internalName: editPromo?.internalName || '',
    publicTitle: editPromo?.publicTitle || '',
    description: editPromo?.description || '',
    // Identity visual fields
    identityTitle: editPromo?.identityTitle || '',
    identityDescription: editPromo?.identityDescription || '',
    identityImage: editPromo?.identityImage || TEMPLATE_IMAGES?.[0]?.url,
    accentColor: editPromo?.accentColor || ACCENT_COLORS?.[0],
    promoImageUrl: editPromo?.promoImageUrl || '',
    tagsInput: editPromo?.tagsInput || '',
    discountType: editPromo?.discountType || 'percentage',
    discountValue: editPromo?.discountValue || 20,
    freeProductName: editPromo?.freeProductName || '',
    specialPrice: editPromo?.specialPrice || '',
    bundleProductA: editPromo?.bundleProductA || '',
    bundleProductB: editPromo?.bundleProductB || '',
    bundlePrice: editPromo?.bundlePrice || '',
    applicability: editPromo?.applicability || 'all',
    selectedCategories: editPromo?.selectedCategories || [],
    specificProducts: editPromo?.specificProducts || '',
    minPurchaseAmount: editPromo?.minPurchaseAmount || '',
    startDate: editPromo?.startDate || '',
    endDate: editPromo?.endDate || '',
    noEndDate: editPromo?.noEndDate || false,
    timeRange: editPromo?.timeRange || 'all_day',
    startTime: editPromo?.startTime || '',
    endTime: editPromo?.endTime || '',
    activeDays: editPromo?.activeDays || [],
    totalLimit: editPromo?.totalLimit || '',
    perUserLimit: editPromo?.perUserLimit || 1,
    perUserLimitPeriod: editPromo?.perUserLimitPeriod || 'forever',
    combinableWithCoupons: editPromo?.combinableWithCoupons || false,
    combinableWithPoints: editPromo?.combinableWithPoints || false,
    showInBusinessListing: editPromo?.showInBusinessListing !== false,
    showInFeed: editPromo?.showInFeed !== false,
    showInMap: editPromo?.showInMap || false,
    sendPushToFollowers: editPromo?.sendPushToFollowers || false,
    flashDuration: editPromo?.flashDuration || 30,
    flashStartMode: editPromo?.flashStartMode || 'now',
    flashScheduledDate: editPromo?.flashScheduledDate || '',
    flashScheduledTime: editPromo?.flashScheduledTime || '',
    pushRadius: editPromo?.pushRadius || 1,
    pushMessage: editPromo?.pushMessage || '',
    flashMaxRedemptions: editPromo?.flashMaxRedemptions || '',
    notifyAt80Pct: editPromo?.notifyAt80Pct || false,
    flashRepeat: editPromo?.flashRepeat || false,
    flashRepeatFreq: editPromo?.flashRepeatFreq || 'weekly',
    flashRepeatTime: editPromo?.flashRepeatTime || '',
    happyHourSlots: editPromo?.happyHourSlots || [{ days: [], startTime: '', endTime: '' }],
    pointsMultiplier: editPromo?.pointsMultiplier || '',
    happyHourPush: editPromo?.happyHourPush || false,
    happyHourPushAudience: editPromo?.happyHourPushAudience || 'all_followers',
    happyHourPushMsg: editPromo?.happyHourPushMsg || '',
    autoActivateHappyHour: editPromo?.autoActivateHappyHour !== false,
    dropStock: editPromo?.dropStock || '',
    dropTimeMode: editPromo?.dropTimeMode || 'window',
    dropStartDateTime: editPromo?.dropStartDateTime || '',
    dropEndDateTime: editPromo?.dropEndDateTime || '',
    dropHoursFromPublish: editPromo?.dropHoursFromPublish || 24,
    dropRevealMode: editPromo?.dropRevealMode || 'immediate',
    dropTeaserHours: editPromo?.dropTeaserHours || 24,
    dropPushAudience: editPromo?.dropPushAudience || 'followers',
    dropPushRadius: editPromo?.dropPushRadius || 2,
    dropStockAlert20: editPromo?.dropStockAlert20 !== false,
    dropClientStockAlert: editPromo?.dropClientStockAlert || false,
    dropClientStockAlertUnits: editPromo?.dropClientStockAlertUnits || 5,
    dropWaitlist: editPromo?.dropWaitlist || false,
    birthdayTiming: editPromo?.birthdayTiming || 'days_before',
    birthdayDaysBefore: editPromo?.birthdayDaysBefore || 7,
    birthdayMessage: editPromo?.birthdayMessage || '',
    birthdayRequireCheckin: editPromo?.birthdayRequireCheckin || false,
    birthdayOneUse: editPromo?.birthdayOneUse !== false,
    firstVisitQualifier: editPromo?.firstVisitQualifier || 'new_in_business',
    firstVisitValidDays: editPromo?.firstVisitValidDays || 7,
    firstVisitChannel: editPromo?.firstVisitChannel || 'wallet_on_register',
    firstVisitCombinePoints: editPromo?.firstVisitCombinePoints || false,
    weatherConditions: editPromo?.weatherConditions || [],
    weatherTempMax: editPromo?.weatherTempMax || 35,
    weatherTempMin: editPromo?.weatherTempMin || 15,
    weatherUVIndex: editPromo?.weatherUVIndex || 8,
    weatherDurationMode: editPromo?.weatherDurationMode || 'while_condition',
    weatherDurationHours: editPromo?.weatherDurationHours || 2,
    weatherPush: editPromo?.weatherPush || false,
    weatherPushMsg: editPromo?.weatherPushMsg || '',
    weatherPushRadius: editPromo?.weatherPushRadius || 2,
    weatherOnlyInHours: editPromo?.weatherOnlyInHours !== false,
    inverseDemandSource: editPromo?.inverseDemandSource || 'checkins_per_hour',
    inverseCheckinsThreshold: editPromo?.inverseCheckinsThreshold || 5,
    inverseCapacityPct: editPromo?.inverseCapacityPct || 30,
    inverseHistoricalPct: editPromo?.inverseHistoricalPct || 40,
    inverseDuration: editPromo?.inverseDuration || 'while_low',
    inverseFixedMinutes: editPromo?.inverseFixedMinutes || 30,
    inverseAllowedFrom: editPromo?.inverseAllowedFrom || '',
    inverseAllowedTo: editPromo?.inverseAllowedTo || '',
    inverseAllowedDays: editPromo?.inverseAllowedDays || [],
    inverseActivationMode: editPromo?.inverseActivationMode || 'auto',
    adventDuration: editPromo?.adventDuration || 24,
    adventStartDate: editPromo?.adventStartDate || '',
    adventRevealMode: editPromo?.adventRevealMode || 'surprise',
    adventOpenCondition: editPromo?.adventOpenCondition || 'checkin_today',
    adventDayOffers: editPromo?.adventDayOffers || {},
    vipBasePromoType: editPromo?.vipBasePromoType || '',
    vipMinLevel: editPromo?.vipMinLevel || 'gold_only',
    vipEarlyHours: editPromo?.vipEarlyHours || 24,
    vipPushMsg: editPromo?.vipPushMsg || '',
    vipReserveUnits: editPromo?.vipReserveUnits || false,
    vipReservedCount: editPromo?.vipReservedCount || 10,
    vipShowLocked: editPromo?.vipShowLocked !== false,
  });

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const userDisplay = {
    name: user?.user_metadata?.full_name || user?.email || 'Usuario',
    email: user?.email || '',
    role: user?.user_metadata?.role || 'owner',
  };

  useEffect(() => {
    const fetchCategories = async () => {
      if (!user?.id) return;
      try {
        const { data } = await supabase?.from('product_categories')?.select('id, name')?.order('name', { ascending: true });
        setCategories(data || []);
      } catch { setCategories([]); }
    };
    fetchCategories();
  }, [user?.id]);

  const handleSubmit = async (status) => {
    if (!selectedType) { alert('Selecciona un tipo de promoción'); setActiveTab('type'); return; }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const payload = { ...form, promoType: selectedType, triggerMode, selectedTrigger, triggerConfig, status };
    console.log('Saving promotion:', payload);
    setIsLoading(false);
    navigate('/promotions-management');
  };

  const typeConfig = PROMO_TYPES?.find(t => t?.value === selectedType);
  const currentTabIndex = TABS?.findIndex(t => t?.id === activeTab);
  const canGoPrev = currentTabIndex > 0;
  const canGoNext = currentTabIndex < TABS?.length - 1;

  // ─── TAB RENDERERS ────────────────────────────────────────────────────────

  const renderDistributionTab = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
          <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">1</span>
          ¿Cómo se distribuye esta promoción?
        </h3>
        <p className="text-xs text-muted-foreground ml-8">Define si la promo se entrega manualmente o se activa automáticamente por un evento</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Sin trigger */}
        <button type="button" onClick={() => setTriggerMode('manual')}
          className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${triggerMode === 'manual' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/40'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${triggerMode === 'manual' ? 'bg-primary/10' : 'bg-muted'}`}>
            <Icon name="Hand" size={20} className={triggerMode === 'manual' ? 'text-primary' : 'text-muted-foreground'} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${triggerMode === 'manual' ? 'text-primary' : 'text-foreground'}`}>Sin trigger (distribución directa)</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">La promo existe y el negocio la distribuye por los canales que elija. Sin automatización.</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {['Ficha del negocio', 'Feed de promos', 'Push manual', 'CRM']?.map(tag => (
                <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        </button>

        {/* Con trigger */}
        <button type="button" onClick={() => setTriggerMode('automatic')}
          className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${triggerMode === 'automatic' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/40'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${triggerMode === 'automatic' ? 'bg-primary/10' : 'bg-muted'}`}>
            <Icon name="Zap" size={20} className={triggerMode === 'automatic' ? 'text-primary' : 'text-muted-foreground'} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${triggerMode === 'automatic' ? 'text-primary' : 'text-foreground'}`}>Con trigger (automático)</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">La promo se activa automáticamente cuando ocurre un evento específico.</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {['Comportamiento', 'Temporal', 'Lealtad', 'Canal']?.map(tag => (
                <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        </button>
      </div>

      {/* Manual distribution channels */}
      {triggerMode === 'manual' && (
        <SectionCard title="Canales de distribución" icon="Share2">
          <div className="space-y-2">
            {[
              { key: 'showInBusinessListing', label: 'Ficha del negocio en app', icon: 'Store' },
              { key: 'showInFeed', label: 'Feed de promociones', icon: 'Rss' },
              { key: 'showInMap', label: 'Mapa destacado (requiere boost)', icon: 'MapPin' },
              { key: 'sendPushToFollowers', label: 'Notificación push a seguidores', icon: 'Bell' },
            ]?.map(opt => (
              <label key={opt?.key} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${form?.[opt?.key] ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'}`}>
                <input type="checkbox" checked={form?.[opt?.key] || false} onChange={e => update(opt?.key, e?.target?.checked)} className="accent-primary" />
                <Icon name={opt?.icon} size={15} className={form?.[opt?.key] ? 'text-primary' : 'text-muted-foreground'} />
                <span className="text-sm text-foreground">{opt?.label}</span>
              </label>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Trigger selection */}
      {triggerMode === 'automatic' && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Selecciona el trigger que activará esta promoción:</p>
          {TRIGGER_CATEGORIES?.map(cat => (
            <div key={cat?.key} className="border border-border rounded-xl overflow-hidden">
              <button type="button"
                onClick={() => setExpandedCategory(expandedCategory === cat?.key ? null : cat?.key)}
                className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/30 transition-colors">
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
                        <button type="button" onClick={() => setSelectedTrigger(trigger?.key)}
                          className="w-full flex items-start gap-3 px-4 py-3 text-left">
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
                <p className="text-xs text-green-700 mt-0.5">La promo se activará automáticamente cuando se cumpla esta condición.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderTypeTab = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
          <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">2</span>
          Tipo de promoción
        </h3>
        <p className="text-xs text-muted-foreground ml-8">Selecciona el tipo de promoción que mejor se adapte a tu estrategia</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROMO_TYPES?.map(type => (
          <button key={type?.value} type="button" onClick={() => { setSelectedType(type?.value); update('promoType', type?.value); }}
            className={`relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
              selectedType === type?.value ? `${type?.borderColor} bg-primary/5 shadow-md` : 'border-border hover:border-primary/40'
            }`}>
            <span className={`absolute top-2 right-2 text-xs font-bold px-1.5 py-0.5 rounded-full border ${
              type?.plan === 'PREMIUM' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' : 'text-blue-600 bg-blue-50 border-blue-200'
            }`}>{type?.plan}</span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${type?.color}`}>
              <Icon name={type?.icon} size={20} />
            </div>
            <div className="flex-1 min-w-0 pr-12">
              <p className="text-sm font-semibold text-foreground">{type?.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{type?.description}</p>
            </div>
            {selectedType === type?.value && (
              <div className="absolute top-2 left-2">
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="Check" size={11} className="text-primary-foreground" />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const renderIdentityTab = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
          <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">3</span>
          Identidad visual
        </h3>
        <p className="text-xs text-muted-foreground ml-8">Configura cómo se verá tu promoción en la app</p>
      </div>

      {/* Internal name */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">
          Nombre interno <span className="text-muted-foreground text-xs">(solo visible para ti)</span>
        </label>
        <StyledInput type="text" value={form?.internalName} onChange={e => update('internalName', e?.target?.value)}
          placeholder="Ej: Happy Hour Diciembre 2026" />
        <p className="text-xs text-muted-foreground mt-1">Para identificar la promo en tu lista. Diferente al título público.</p>
      </div>

      {/* Public title */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">
          Título de la promoción <span className="text-muted-foreground text-xs">({(form?.identityTitle || '')?.length}/40)</span>
        </label>
        <StyledInput type="text" maxLength={40} value={form?.identityTitle} onChange={e => update('identityTitle', e?.target?.value)}
          placeholder="Ej: ¡2×1 en bebidas frías!" />
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">
          Descripción <span className="text-muted-foreground text-xs">({(form?.identityDescription || '')?.length}/120)</span>
        </label>
        <StyledTextarea maxLength={120} value={form?.identityDescription} onChange={e => update('identityDescription', e?.target?.value)} rows={2}
          placeholder="Ej: Descuento exclusivo para clientes frecuentes. Válido en todos los productos del menú." />
      </div>

      {/* Image categories */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Imagen de la promoción</label>
        <div className="grid grid-cols-4 gap-2">
          {TEMPLATE_IMAGES?.map(img => (
            <button key={img?.key} type="button" onClick={() => update('identityImage', img?.url)}
              className={`relative rounded-lg overflow-hidden h-14 border-2 transition-all ${form?.identityImage === img?.url ? 'border-primary shadow-md' : 'border-transparent hover:border-muted-foreground/40'}`}>
              <img src={img?.url} alt={`Categoría ${img?.label}`} className="w-full h-full object-cover" />
              {form?.identityImage === img?.url && <div className="absolute inset-0 bg-primary/20 flex items-center justify-center"><Icon name="Check" size={14} className="text-white" /></div>}
              <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs text-center py-0.5">{img?.label}</div>
            </button>
          ))}
        </div>
        <div className="mt-2">
          <label className="text-xs text-muted-foreground block mb-1">O sube una imagen personalizada (16:9)</label>
          <div className="flex gap-2">
            <StyledInput type="url" value={form?.promoImageUrl} onChange={e => { update('promoImageUrl', e?.target?.value); if (e?.target?.value) update('identityImage', e?.target?.value); }}
              placeholder="https://... URL de imagen" />
            <label className="flex items-center gap-1.5 px-3 py-2 bg-muted rounded-lg text-xs text-muted-foreground cursor-pointer hover:bg-muted/80 whitespace-nowrap">
              <Icon name="Upload" size={13} /> Subir
              <input type="file" accept="image/*" className="hidden" onChange={e => {
                const file = e?.target?.files?.[0];
                if (file) { const r = new FileReader(); r.onload = ev => { update('promoImageUrl', ev?.target?.result); update('identityImage', ev?.target?.result); }; r?.readAsDataURL(file); }
              }} />
            </label>
          </div>
        </div>
      </div>

      {/* Accent color */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Color de acento</label>
        <div className="flex gap-2 flex-wrap">
          {ACCENT_COLORS?.map(color => (
            <button key={color} type="button" onClick={() => update('accentColor', color)}
              className={`w-7 h-7 rounded-full border-2 transition-all ${form?.accentColor === color ? 'border-foreground scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
              style={{ backgroundColor: color }} title={color} />
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Tags internos</label>
        <StyledInput type="text" value={form?.tagsInput} onChange={e => update('tagsInput', e?.target?.value)}
          placeholder="Ej: verano, lanzamiento, temporada alta (separados por coma)" />
        {form?.tagsInput && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {form?.tagsInput?.split(',')?.map(t => t?.trim())?.filter(Boolean)?.map(tag => (
              <span key={tag} className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderBenefitTab = () => {
    if (!selectedType) return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Icon name="Percent" size={32} className="text-muted-foreground mb-3" />
        <p className="text-muted-foreground text-sm">Selecciona un tipo de promoción en la pestaña "Tipo" para ver su configuración de beneficio.</p>
        <button type="button" onClick={() => setActiveTab('type')} className="mt-3 text-sm text-primary hover:underline">Ir a Tipo →</button>
      </div>
    );
    return (
      <div className="space-y-5">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
            <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">4</span>
            Tipo de beneficio
          </h3>
        </div>
        <SectionCard title="Beneficio" icon="Percent">
          <BenefitSelector form={form} update={update}
            suggestions={
              selectedType === 'flash_deal' ? "Los descuentos mayores al 30% generan 3× más conversión en flash deals. Recomendado: % alto (40-60%) o producto gratis de bajo costo." :
              selectedType === 'birthday' ? "Para cumpleaños, los beneficios más efectivos son: producto gratis especial, descuento alto (30-50%), experiencia exclusiva, upgrade gratuito." :
              selectedType === 'first_visit' ? "Para nuevos clientes, los beneficios más efectivos son productos gratis de bajo costo o descuentos del 20-30% que inviten a una segunda visita." :
              selectedType === 'weather' ? "Sugerencias: lluvia → descuento en bebidas calientes; calor extremo → descuento en bebidas frías; frío → descuento en sopas." :
              selectedType === 'inverse_demand' ? "Sugerencias: descuentos altos (30-50%) para generar tráfico inmediato en horas muertas, o flash deals de 30 min para urgencia." :
              null
            }
          />
        </SectionCard>
        <ApplicabilitySection form={form} update={update} categories={categories} />
      </div>
    );
  };

  const renderConfigTab = () => {
    if (!selectedType) return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Icon name="Settings" size={32} className="text-muted-foreground mb-3" />
        <p className="text-muted-foreground text-sm">Selecciona un tipo de promoción primero.</p>
        <button type="button" onClick={() => setActiveTab('type')} className="mt-3 text-sm text-primary hover:underline">Ir a Tipo →</button>
      </div>
    );
    return (
      <div className="space-y-5">
        {(() => {
          switch (selectedType) {
            case 'standard': return <StandardConfig form={form} update={update} categories={categories} />;
            case 'flash_deal': return <FlashDealConfig form={form} update={update} />;
            case 'happy_hour': return <HappyHourConfig form={form} update={update} />;
            case 'limited_drop': return <LimitedDropConfig form={form} update={update} />;
            case 'birthday': return <BirthdayConfig form={form} update={update} />;
            case 'first_visit': return <FirstVisitConfig form={form} update={update} />;
            case 'weather': return <WeatherConfig form={form} update={update} />;
            case 'inverse_demand': return <InverseDemandConfig form={form} update={update} />;
            case 'advent': return <AdventConfig form={form} update={update} />;
            case 'vip_access': return <VIPAccessConfig form={form} update={update} />;
            default: return null;
          }
        })()}
        <SectionCard title="Duplicar Promo" icon="Copy">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Clonar esta configuración</p>
              <p className="text-xs text-muted-foreground mt-0.5">Crea una copia de esta promo como punto de partida para una nueva</p>
            </div>
            <Button variant="outline" iconName="Copy" iconPosition="left" onClick={() => alert('Promo duplicada — se abrirá en modo edición')}>
              Duplicar
            </Button>
          </div>
        </SectionCard>
      </div>
    );
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'distribution': return renderDistributionTab();
      case 'type': return renderTypeTab();
      case 'identity': return renderIdentityTab();
      case 'benefit': return renderBenefitTab();
      case 'config': return renderConfigTab();
      default: return renderDistributionTab();
    }
  };

  const mainClasses = `pt-16 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`;

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} user={userDisplay} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={userDisplay} onCollapse={setIsSidebarCollapsed} />
      <main className={mainClasses}>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm mb-4">
            <button onClick={() => navigate('/promotions-management')} className="text-muted-foreground hover:text-foreground transition-colors">Promociones</button>
            <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
            <span className="text-foreground font-medium">{isEditMode ? 'Editar Promoción' : 'Nueva Promoción'}</span>
          </nav>

          {/* Page Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isEditMode ? 'Editar Promoción' : 'Nueva Promoción'}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {selectedType ? (
                  <span className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig?.color}`}>
                      <Icon name={typeConfig?.icon} size={11} /> {typeConfig?.label}
                    </span>
                    <span>· {typeConfig?.description}</span>
                  </span>
                ) : 'Completa la información de la nueva promoción'}
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/promotions-management')}>
              Cancelar
            </Button>
          </div>

          {/* ── LIVE PREVIEW ── */}
          <div className="mb-5">
            <PromoLivePreview form={{ ...form, promoType: selectedType }} triggerMode={triggerMode} selectedTrigger={selectedTrigger} />
          </div>

          {/* ── WIZARD FORM ── */}
          <div className="flex-1 min-w-0">
            {/* ── WIZARD PROGRESS BAR ── */}
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
                          isActive ? 'bg-primary/10 text-primary' : isPast ? 'text-green-600 hover:bg-green-50 cursor-pointer' : 'text-muted-foreground hover:bg-muted cursor-pointer'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                          isActive ? 'bg-primary text-white shadow-sm' : isPast ? 'bg-green-500 text-white' : 'bg-muted'
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
                        <div className={`flex-1 h-0.5 min-w-[6px] rounded-full transition-colors ${isPast ? 'bg-green-400' : 'bg-border'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* ── WIZARD FORM CONTENT ── */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
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
                    <div className="w-24" />
                  )}
                </div>
              </div>
            </div>

            {/* Global footer actions */}
            <div className="flex items-center justify-between py-4">
              <Button variant="outline" onClick={() => navigate('/promotions-management')}>
                Cancelar
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => handleSubmit('draft')} disabled={isLoading}>
                  <Icon name="Save" size={15} className="mr-2" />
                  Guardar borrador
                </Button>
                <Button onClick={() => handleSubmit('active')} disabled={isLoading} iconName={isLoading ? 'Loader2' : 'Send'} iconPosition="left">
                  {isLoading ? 'Publicando...' : 'Publicar promoción'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewPromotionPage;
