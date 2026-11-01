import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { createPunchCard, updatePunchCard, POINTS_RULES, pointsToMXN } from '../../../services/rewardsService';

const STAMP_ICONS = [
  { id: 'circle', icon: '⭕', name: 'Círculo', cat: 'generic' },
  { id: 'star', icon: '⭐', name: 'Estrella', cat: 'generic' },
  { id: 'heart', icon: '❤️', name: 'Corazón', cat: 'generic' },
  { id: 'diamond', icon: '💎', name: 'Diamante', cat: 'generic' },
  { id: 'flame', icon: '🔥', name: 'Llama', cat: 'generic' },
  { id: 'lightning', icon: '⚡', name: 'Rayo', cat: 'generic' },
  { id: 'leaf', icon: '🍃', name: 'Hoja', cat: 'generic' },
  { id: 'crown', icon: '👑', name: 'Corona', cat: 'generic' },
  { id: 'coffee', icon: '☕', name: 'Café', cat: 'food' },
  { id: 'pizza', icon: '🍕', name: 'Pizza', cat: 'food' },
  { id: 'taco', icon: '🌮', name: 'Taco', cat: 'food' },
  { id: 'icecream', icon: '🍦', name: 'Helado', cat: 'food' },
  { id: 'cake', icon: '🎂', name: 'Pastel', cat: 'food' },
  { id: 'burger', icon: '🍔', name: 'Hamburguesa', cat: 'food' },
  { id: 'scissors', icon: '✂️', name: 'Tijera', cat: 'service' },
  { id: 'dumbbell', icon: '🏋️', name: 'Mancuerna', cat: 'service' },
  { id: 'spa', icon: '💆', name: 'Spa', cat: 'service' },
  { id: 'yoga', icon: '🧘', name: 'Yoga', cat: 'service' },
  { id: 'bag', icon: '🛍️', name: 'Bolsa', cat: 'retail' },
  { id: 'shoe', icon: '👟', name: 'Zapato', cat: 'retail' },
  { id: 'book', icon: '📚', name: 'Libro', cat: 'retail' },
  { id: 'gem', icon: '💍', name: 'Joya', cat: 'retail' },
  { id: 'footprint', icon: '👣', name: 'Huella', cat: 'generic' },
  { id: 'gift', icon: '🎁', name: 'Regalo', cat: 'generic' },
];

const CARD_COLORS = [
  '#7C3AED', '#2563EB', '#059669', '#D97706', '#DC2626',
  '#0891B2', '#7C2D12', '#1D4ED8', '#065F46', '#92400E',
  '#BE185D', '#0F766E', '#1E40AF', '#6D28D9', '#B45309', '#047857'
];

const DAYS_OF_WEEK = [
  { id: 'mon', label: 'Lun' }, { id: 'tue', label: 'Mar' }, { id: 'wed', label: 'Mié' },
  { id: 'thu', label: 'Jue' }, { id: 'fri', label: 'Vie' }, { id: 'sat', label: 'Sáb' }, { id: 'sun', label: 'Dom' }
];

const Toggle = ({ value, onChange, label, desc }) => (
  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
    <div className="flex-1 pr-4">
      <p className="font-medium text-foreground text-sm">{label}</p>
      {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 relative ${value ? 'bg-primary' : 'bg-muted'}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  </div>
);

const MiniPreview = ({ formData }) => {
  const [filledStamps, setFilledStamps] = useState(3);
  const stampIcon = STAMP_ICONS?.find(s => s?.id === formData?.stampIcon)?.icon || '⭐';
  const count = parseInt(formData?.stampCount) || 8;
  const bgStyle = formData?.cardGradientType === 'gradient'
    ? { background: `linear-gradient(135deg, ${formData?.cardColor || '#7C3AED'}, ${formData?.cardColorSecondary || '#2563EB'})` }
    : { background: formData?.cardColor || '#7C3AED' };

  return (
    <div className="sticky top-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Vista Previa</h3>
      <div className="rounded-2xl p-4 text-white shadow-xl" style={bgStyle}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs opacity-60">PromoClub</p>
            <h4 className="font-bold text-base leading-tight">{formData?.name || 'Nombre de la tarjeta'}</h4>
            {formData?.description && <p className="text-xs opacity-70 mt-0.5">{formData?.description}</p>}
          </div>
          <div className="text-2xl">{stampIcon}</div>
        </div>
        <div className="flex flex-wrap gap-1.5 my-3">
          {Array.from({ length: Math.min(count, 12) })?.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setFilledStamps(i < filledStamps ? i : i + 1)}
              className="w-8 h-8 rounded-full border-2 border-white/40 flex items-center justify-center text-base transition-all"
              style={{ background: i < filledStamps ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)' }}
            >
              <span style={{ fontSize: '14px', filter: i < filledStamps ? 'none' : 'grayscale(1) opacity(0.4)' }}>{stampIcon}</span>
            </button>
          ))}
          {count > 12 && <span className="text-xs opacity-70 self-center">+{count - 12}</span>}
          <div className="w-8 h-8 rounded-full border-2 border-white/40 flex items-center justify-center bg-yellow-400/20 text-sm">🎁</div>
        </div>
        <div className="border-t border-white/20 pt-2">
          <p className="text-xs opacity-60">Recompensa</p>
          <p className="font-semibold text-xs">{formData?.rewardValue || 'Premio al completar'}</p>
        </div>
      </div>
      {filledStamps >= count && (
        <div className="mt-2 bg-success/10 border border-success/20 rounded-xl p-3 text-center">
          <p className="text-lg mb-0.5">🎉</p>
          <p className="font-bold text-success text-xs">¡Tarjeta completada!</p>
        </div>
      )}
      <p className="text-xs text-muted-foreground text-center mt-1.5">Toca los sellos para simular</p>
    </div>
  );
};

const PunchCardCreator = ({ businessId, editCard, onClose, onSaved }) => {
  const isEdit = !!editCard;
  const [formData, setFormData] = useState({
    name: editCard?.name || '',
    description: editCard?.description || '',
    stampIcon: editCard?.stamp_icon || 'star',
    cardColor: editCard?.card_color || '#7C3AED',
    cardColorSecondary: editCard?.card_color_secondary || '#2563EB',
    cardGradientType: editCard?.card_gradient_type || 'solid',
    stampRule: editCard?.stamp_rule || 'visit',
    stampAmount: editCard?.stamp_amount || '',
    stampProduct: editCard?.stamp_product || '',
    stampLimitPerVisit: editCard?.stamp_limit_per_visit || 1,
    cumulativeStamps: editCard?.cumulative_stamps || false,
    stampCount: editCard?.stamp_count || 8,
    rewardType: editCard?.reward_type || 'free_item',
    rewardValue: editCard?.reward_value || '',
    rewardDiscount: editCard?.reward_discount || '',
    rewardDiscountType: editCard?.reward_discount_type || 'percentage',
    rewardDiscountMax: editCard?.reward_discount_max || '',
    rewardPoints: editCard?.reward_points || '',
    rewardExpiryDays: editCard?.reward_expiry_days || 30,
    perceivedValue: editCard?.perceived_value || '',
    validityType: editCard?.validity_type || 'none',
    validityDays: editCard?.validity_days || 90,
    validityDate: editCard?.validity_date || '',
    autoRenew: editCard?.auto_renew !== false,
    showProgress: editCard?.show_progress !== false,
    welcomeStampEnabled: editCard?.welcome_stamp_enabled || false,
    welcomeStampCount: editCard?.welcome_stamp_count || 1,
    doubleStampEnabled: editCard?.double_stamp_enabled || false,
    doubleStampDays: editCard?.double_stamp_days || [],
    doubleStampStartTime: editCard?.double_stamp_start_time || '',
    doubleStampEndTime: editCard?.double_stamp_end_time || '',
    scheduleRestrictionEnabled: editCard?.schedule_restriction_enabled || false,
    scheduleDays: editCard?.schedule_days || [],
    scheduleStartTime: editCard?.schedule_start_time || '',
    scheduleEndTime: editCard?.schedule_end_time || '',
    compatibilityEnabled: editCard?.compatibility_enabled !== false,
    audience: editCard?.audience || 'all',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }));
  const count = parseInt(formData?.stampCount) || 8;
  const weeksEstimate = Math.ceil(count / 2);

  const toggleDay = (arr, day) => arr?.includes(day) ? arr?.filter(d => d !== day) : [...arr, day];

  const handleSave = async (status = 'active') => {
    if (!businessId || !formData?.name?.trim()) return;
    try {
      setSaving(true);
      setError(null);
      const payload = {
        name: formData?.name,
        description: formData?.description,
        stampIcon: formData?.stampIcon,
        cardColor: formData?.cardColor,
        cardColorSecondary: formData?.cardColorSecondary,
        cardGradientType: formData?.cardGradientType,
        stampRule: formData?.stampRule,
        stampAmount: formData?.stampAmount,
        stampProduct: formData?.stampProduct,
        stampLimitPerVisit: formData?.stampLimitPerVisit,
        cumulativeStamps: formData?.cumulativeStamps,
        stampCount: formData?.stampCount,
        rewardType: formData?.rewardType,
        rewardValue: formData?.rewardValue,
        rewardDiscount: formData?.rewardDiscount,
        rewardDiscountType: formData?.rewardDiscountType,
        rewardDiscountMax: formData?.rewardDiscountMax,
        rewardPoints: formData?.rewardPoints,
        rewardExpiryDays: formData?.rewardExpiryDays,
        perceivedValue: formData?.perceivedValue,
        validityType: formData?.validityType,
        validityDays: formData?.validityDays,
        validityDate: formData?.validityDate,
        autoRenew: formData?.autoRenew,
        showProgress: formData?.showProgress,
        welcomeStampEnabled: formData?.welcomeStampEnabled,
        welcomeStampCount: formData?.welcomeStampCount,
        doubleStampEnabled: formData?.doubleStampEnabled,
        doubleStampDays: formData?.doubleStampDays,
        doubleStampStartTime: formData?.doubleStampStartTime,
        doubleStampEndTime: formData?.doubleStampEndTime,
        scheduleRestrictionEnabled: formData?.scheduleRestrictionEnabled,
        scheduleDays: formData?.scheduleDays,
        scheduleStartTime: formData?.scheduleStartTime,
        scheduleEndTime: formData?.scheduleEndTime,
        compatibilityEnabled: formData?.compatibilityEnabled,
        audience: formData?.audience,
        status,
      };
      if (isEdit) {
        await updatePunchCard(editCard?.id, payload);
      } else {
        await createPunchCard(businessId, payload);
      }
      onSaved?.();
    } catch (err) {
      console.error('Error saving punch card:', err);
      setError(err?.message || 'Error al guardar la punch card');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-6xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <Icon name="CreditCard" size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{isEdit ? 'Editar Punch Card' : 'Nueva Punch Card'}</h2>
              <p className="text-xs text-muted-foreground">Configura tu tarjeta de sellos digital</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-2">
            <Icon name="AlertCircle" size={15} className="text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex gap-0 max-h-[80vh] overflow-hidden">
          {/* Form */}
          <div className="flex-1 p-5 space-y-6 overflow-y-auto">

            {/* SECCIÓN 1: IDENTIDAD */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center font-bold">1</span>
                Identidad
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Nombre de la punch card <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text" maxLength={40}
                    value={formData?.name}
                    onChange={e => set('name', e?.target?.value)}
                    placeholder="¿Qué va a ganar tu cliente? Ej: 'Camino al Café Gratis'"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{formData?.name?.length}/40 caracteres</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Descripción corta</label>
                  <input
                    type="text" maxLength={100}
                    value={formData?.description}
                    onChange={e => set('description', e?.target?.value)}
                    placeholder="Explica la regla en una frase simple. Ej: 'Visítanos 8 veces y tu noveno café es gratis'"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{formData?.description?.length}/100 caracteres</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Ícono de la punch card</label>
                  <div className="grid grid-cols-8 gap-1.5">
                    {STAMP_ICONS?.map(s => (
                      <button
                        key={s?.id}
                        type="button"
                        onClick={() => set('stampIcon', s?.id)}
                        title={s?.name}
                        className={`p-2 rounded-lg border-2 text-xl flex items-center justify-center transition-all ${
                          formData?.stampIcon === s?.id ? 'border-primary bg-primary/10' : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        {s?.icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Color de la tarjeta</label>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {CARD_COLORS?.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => set('cardColor', c)}
                        className={`w-8 h-8 rounded-full border-4 transition-all ${formData?.cardColor === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="gradientType" value="solid" checked={formData?.cardGradientType === 'solid'} onChange={() => set('cardGradientType', 'solid')} />
                      <span className="text-sm text-foreground">Color sólido</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="gradientType" value="gradient" checked={formData?.cardGradientType === 'gradient'} onChange={() => set('cardGradientType', 'gradient')} />
                      <span className="text-sm text-foreground">Gradiente</span>
                    </label>
                  </div>
                  {formData?.cardGradientType === 'gradient' && (
                    <div className="mt-2 flex items-center gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Color secundario</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {CARD_COLORS?.map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => set('cardColorSecondary', c)}
                              className={`w-6 h-6 rounded-full border-2 transition-all ${formData?.cardColorSecondary === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                              style={{ background: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: REGLA DE SELLO */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center font-bold">2</span>
                Regla de Sello
              </h3>
              <div className="space-y-3">
                {[
                  { id: 'visit', label: 'Cada visita = 1 sello', desc: 'El cliente gana un sello cada vez que hace check-in, sin importar cuánto gaste. Ideal para premiar la frecuencia.', icon: '📍' },
                  { id: 'amount', label: 'Compra mínima = 1 sello', desc: 'El cliente gana un sello cuando su compra alcanza un monto mínimo. Ideal para premiar el gasto.', icon: '💵' },
                  { id: 'product', label: 'Producto específico = 1 sello', desc: 'El cliente gana un sello solo al comprar un producto determinado. Ideal para incentivar un producto en particular.', icon: '🏷️' },
                ]?.map(opt => (
                  <label
                    key={opt?.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData?.stampRule === opt?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <input type="radio" name="stampRule" value={opt?.id} checked={formData?.stampRule === opt?.id} onChange={e => set('stampRule', e?.target?.value)} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>{opt?.icon}</span>
                        <span className="font-medium text-foreground text-sm">{opt?.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{opt?.desc}</p>
                      {formData?.stampRule === opt?.id && opt?.id === 'amount' && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-foreground">Monto mínimo:</span>
                            <input
                              type="number" min="1"
                              value={formData?.stampAmount}
                              onChange={e => set('stampAmount', e?.target?.value)}
                              placeholder="100"
                              className="w-24 px-2 py-1 border border-border rounded bg-input text-foreground text-sm focus:outline-none"
                            />
                            <span className="text-xs text-muted-foreground">MXN</span>
                          </div>
                          <Toggle
                            value={formData?.cumulativeStamps}
                            onChange={v => set('cumulativeStamps', v)}
                            label="Sellos acumulativos por monto"
                            desc={`Si activo: compra de $${(parseFloat(formData?.stampAmount) || 100) * 3} MXN = 3 sellos`}
                          />
                        </div>
                      )}
                      {formData?.stampRule === opt?.id && opt?.id === 'product' && (
                        <div className="mt-3">
                          <input
                            type="text"
                            value={formData?.stampProduct}
                            onChange={e => set('stampProduct', e?.target?.value)}
                            placeholder="Ej: Café americano, Clase grupal, Corte de cabello"
                            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </label>
                ))}
                <div className="p-3 bg-muted/30 rounded-xl">
                  <label className="block text-xs font-medium text-foreground mb-1">Límite de sellos por visita</label>
                  <select
                    value={formData?.stampLimitPerVisit}
                    onChange={e => set('stampLimitPerVisit', parseInt(e?.target?.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                  >
                    <option value={1}>1 sello por visita (recomendado)</option>
                    <option value={2}>2 sellos por visita</option>
                    <option value={0}>Sin límite</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: META Y RECOMPENSA */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center font-bold">3</span>
                Meta y Recompensa
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Sellos necesarios para completar: <span className="text-primary font-bold text-lg">{count}</span>
                  </label>
                  <input
                    type="range" min="3" max="30"
                    value={formData?.stampCount}
                    onChange={e => set('stampCount', parseInt(e?.target?.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>3</span><span>30</span>
                  </div>
                  <div className="mt-2 p-3 bg-muted/40 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      💡 Con {count} sellos, la tarjeta se completaría en aproximadamente <strong>{weeksEstimate} semanas</strong> (visitando 2 veces/semana).
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">📊 Benchmark: Cafeterías 8-10 · Salones 5-6 · Gimnasios 10-12</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Tipo de recompensa</label>
                  <select
                    value={formData?.rewardType}
                    onChange={e => set('rewardType', e?.target?.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                  >
                    <option value="free_item">Producto gratis</option>
                    <option value="discount_pct">Descuento porcentaje</option>
                    <option value="discount_fixed">Descuento monto fijo</option>
                    <option value="points">Puntos bonus</option>
                    <option value="experience">Experiencia exclusiva</option>
                    <option value="upgrade">Upgrade</option>
                  </select>
                </div>

                {formData?.rewardType === 'discount_pct' && (
                  <div className="p-3 bg-muted/30 rounded-xl space-y-2">
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-medium text-foreground">Descuento:</label>
                      <input
                        type="range" min="5" max="100"
                        value={formData?.rewardDiscount || 20}
                        onChange={e => set('rewardDiscount', e?.target?.value)}
                        className="flex-1 accent-primary"
                      />
                      <span className="text-sm font-bold text-primary w-12">{formData?.rewardDiscount || 20}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-foreground">Tope máximo (opcional):</label>
                      <input
                        type="number" min="0"
                        value={formData?.rewardDiscountMax}
                        onChange={e => set('rewardDiscountMax', e?.target?.value)}
                        placeholder="200"
                        className="w-24 px-2 py-1 border border-border rounded bg-input text-foreground text-sm"
                      />
                      <span className="text-xs text-muted-foreground">MXN</span>
                    </div>
                  </div>
                )}

                {formData?.rewardType === 'discount_fixed' && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">$</span>
                    <input
                      type="number" min="1"
                      value={formData?.rewardDiscount}
                      onChange={e => set('rewardDiscount', e?.target?.value)}
                      placeholder="50"
                      className="w-28 px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                    />
                    <span className="text-sm text-muted-foreground">MXN de descuento</span>
                  </div>
                )}

                {formData?.rewardType === 'points' && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl">
                    <div className="flex items-center gap-2">
                      <input
                        type="number" min="1"
                        value={formData?.rewardPoints}
                        onChange={e => set('rewardPoints', e?.target?.value)}
                        placeholder="200"
                        className="w-28 px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                      />
                      <span className="text-xs text-muted-foreground">puntos</span>
                      {formData?.rewardPoints && (
                        <span className="text-xs font-semibold text-success">= ${pointsToMXN(parseInt(formData?.rewardPoints))} MXN</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">1 punto = ${POINTS_RULES?.POINT_VALUE_MXN} MXN · ${POINTS_RULES?.MXN_PER_POINT} MXN = 1 punto</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Descripción de la recompensa</label>
                  <input
                    type="text"
                    value={formData?.rewardValue}
                    onChange={e => set('rewardValue', e?.target?.value)}
                    placeholder={
                      formData?.rewardType === 'free_item' ? 'Ej: Café americano gratis' :
                      formData?.rewardType === 'experience' ? 'Ej: Cata privada con el barista' :
                      formData?.rewardType === 'upgrade'? 'Ej: Tu café mediano se convierte en grande gratis' : 'Describe la recompensa...'
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Valor percibido (interno)</label>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">$</span>
                      <input
                        type="number" min="0"
                        value={formData?.perceivedValue}
                        onChange={e => set('perceivedValue', e?.target?.value)}
                        placeholder="45"
                        className="flex-1 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                      />
                      <span className="text-xs text-muted-foreground">MXN</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Días para canjear recompensa</label>
                    <input
                      type="number" min="1" max="365"
                      value={formData?.rewardExpiryDays}
                      onChange={e => set('rewardExpiryDays', e?.target?.value)}
                      className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 4: VIGENCIA */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center font-bold">4</span>
                Vigencia de la Tarjeta
              </h3>
              <div className="space-y-3">
                {[
                  { id: 'none', label: 'Sin vigencia', desc: 'La tarjeta nunca expira. Recomendado para negocios con baja frecuencia de visita.', icon: '∞', border: 'border-success/40' },
                  { id: 'from_activation', label: 'Vigencia desde primer sello', desc: 'La tarjeta expira X días después del primer sello.', icon: '⏱', border: 'border-warning/40' },
                  { id: 'fixed_date', label: 'Vigencia por calendario', desc: 'Todas las tarjetas vencen en una fecha específica. Ideal para campañas estacionales.', icon: '📅', border: 'border-cyan-500/40' },
                ]?.map(opt => (
                  <label
                    key={opt?.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData?.validityType === opt?.id ? `${opt?.border} bg-muted/30` : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <input type="radio" name="validityType" value={opt?.id} checked={formData?.validityType === opt?.id} onChange={e => set('validityType', e?.target?.value)} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{opt?.icon}</span>
                        <span className="font-medium text-foreground text-sm">{opt?.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{opt?.desc}</p>
                      {formData?.validityType === opt?.id && opt?.id === 'from_activation' && (
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="range" min="15" max="365"
                            value={formData?.validityDays}
                            onChange={e => set('validityDays', parseInt(e?.target?.value))}
                            className="flex-1 accent-primary"
                          />
                          <span className="text-sm font-bold text-primary w-20">{formData?.validityDays} días</span>
                        </div>
                      )}
                      {formData?.validityType === opt?.id && opt?.id === 'fixed_date' && (
                        <input
                          type="date"
                          value={formData?.validityDate}
                          onChange={e => set('validityDate', e?.target?.value)}
                          className="mt-2 px-3 py-1.5 border border-border rounded-lg bg-input text-foreground text-sm"
                        />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* SECCIÓN 5: OPCIONES AVANZADAS */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center font-bold">5</span>
                Opciones Avanzadas
              </h3>
              <div className="space-y-3">
                <Toggle
                  value={formData?.autoRenew}
                  onChange={v => set('autoRenew', v)}
                  label="Auto-renovación al completar"
                  desc="Al canjear la recompensa, se activa una nueva tarjeta idéntica automáticamente"
                />
                <Toggle
                  value={formData?.showProgress}
                  onChange={v => set('showProgress', v)}
                  label="Mostrar progreso al hacer check-in"
                  desc="Al hacer check-in, se muestra el avance del sello al cajero y al usuario"
                />
                <Toggle
                  value={formData?.welcomeStampEnabled}
                  onChange={v => set('welcomeStampEnabled', v)}
                  label="Sello de bienvenida al activar"
                  desc="La tarjeta se activa con sellos ya llenados para motivación inmediata"
                />
                {formData?.welcomeStampEnabled && (
                  <div className="ml-4 p-3 bg-card border border-border rounded-xl">
                    <label className="block text-xs font-medium text-foreground mb-1">Sellos de bienvenida</label>
                    <input
                      type="number" min="1" max="3"
                      value={formData?.welcomeStampCount}
                      onChange={e => set('welcomeStampCount', parseInt(e?.target?.value))}
                      className="w-20 px-2 py-1 border border-border rounded bg-input text-foreground text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Máximo 3 sellos de bienvenida</p>
                  </div>
                )}
                <Toggle
                  value={formData?.doubleStampEnabled}
                  onChange={v => set('doubleStampEnabled', v)}
                  label="Días de doble sello"
                  desc="En días/horas específicos, cada acción otorga 2 sellos en lugar de 1"
                />
                {formData?.doubleStampEnabled && (
                  <div className="ml-4 p-3 bg-card border border-border rounded-xl space-y-3">
                    <div>
                      <p className="text-xs font-medium text-foreground mb-2">Días de doble sello</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {DAYS_OF_WEEK?.map(d => (
                          <button
                            key={d?.id}
                            type="button"
                            onClick={() => set('doubleStampDays', toggleDay(formData?.doubleStampDays, d?.id))}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                              formData?.doubleStampDays?.includes(d?.id)
                                ? 'bg-primary text-white border-primary' :'bg-muted text-muted-foreground border-border'
                            }`}
                          >
                            {d?.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Horario:</span>
                      <input type="time" value={formData?.doubleStampStartTime} onChange={e => set('doubleStampStartTime', e?.target?.value)} className="px-2 py-1 border border-border rounded bg-input text-foreground text-xs" />
                      <span className="text-xs text-muted-foreground">a</span>
                      <input type="time" value={formData?.doubleStampEndTime} onChange={e => set('doubleStampEndTime', e?.target?.value)} className="px-2 py-1 border border-border rounded bg-input text-foreground text-xs" />
                    </div>
                  </div>
                )}
                <Toggle
                  value={formData?.scheduleRestrictionEnabled}
                  onChange={v => set('scheduleRestrictionEnabled', v)}
                  label="Restricción de horario"
                  desc="La tarjeta solo acumula sellos en ciertos días/horarios"
                />
                {formData?.scheduleRestrictionEnabled && (
                  <div className="ml-4 p-3 bg-card border border-border rounded-xl space-y-3">
                    <div>
                      <p className="text-xs font-medium text-foreground mb-2">Días activos</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {DAYS_OF_WEEK?.map(d => (
                          <button
                            key={d?.id}
                            type="button"
                            onClick={() => set('scheduleDays', toggleDay(formData?.scheduleDays, d?.id))}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                              formData?.scheduleDays?.includes(d?.id)
                                ? 'bg-primary text-white border-primary' :'bg-muted text-muted-foreground border-border'
                            }`}
                          >
                            {d?.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Horario:</span>
                      <input type="time" value={formData?.scheduleStartTime} onChange={e => set('scheduleStartTime', e?.target?.value)} className="px-2 py-1 border border-border rounded bg-input text-foreground text-xs" />
                      <span className="text-xs text-muted-foreground">a</span>
                      <input type="time" value={formData?.scheduleEndTime} onChange={e => set('scheduleEndTime', e?.target?.value)} className="px-2 py-1 border border-border rounded bg-input text-foreground text-xs" />
                    </div>
                  </div>
                )}
                <Toggle
                  value={formData?.compatibilityEnabled}
                  onChange={v => set('compatibilityEnabled', v)}
                  label="Compatible con otras tarjetas activas"
                  desc="Un check-in puede avanzar esta tarjeta Y otras tarjetas activas simultáneamente"
                />
                <div className="p-4 bg-muted/30 rounded-xl">
                  <label className="block text-sm font-medium text-foreground mb-2">Audiencia</label>
                  <select
                    value={formData?.audience}
                    onChange={e => set('audience', e?.target?.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                  >
                    <option value="all">Todos los clientes</option>
                    <option value="new">Solo nuevos clientes (primera visita)</option>
                    <option value="vip">Solo nivel VIP</option>
                    <option value="segment">Solo segmento CRM específico</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="w-64 border-l border-border p-4 bg-muted/20 overflow-y-auto">
            <MiniPreview formData={formData} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-border bg-muted/20">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => handleSave('draft')} disabled={saving || !formData?.name?.trim()}>
              Guardar borrador
            </Button>
            <Button onClick={() => handleSave('active')} disabled={saving || !formData?.name?.trim()}>
              {saving ? (
                <><Icon name="Loader2" size={15} className="mr-2 animate-spin" />Guardando...</>
              ) : (
                <><Icon name="Zap" size={15} className="mr-2" />{isEdit ? 'Guardar cambios' : 'Publicar punch card'}</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PunchCardCreator;
