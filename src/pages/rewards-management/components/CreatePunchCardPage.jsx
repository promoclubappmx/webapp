import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { createPunchCard, POINTS_RULES, pointsToMXN } from '../../../services/rewardsService';

const STAMP_ICONS = [
  { id: 'circle', icon: '⭕', name: 'Círculo' },
  { id: 'star', icon: '⭐', name: 'Estrella' },
  { id: 'heart', icon: '❤️', name: 'Corazón' },
  { id: 'diamond', icon: '💎', name: 'Diamante' },
  { id: 'flame', icon: '🔥', name: 'Llama' },
  { id: 'lightning', icon: '⚡', name: 'Rayo' },
  { id: 'leaf', icon: '🍃', name: 'Hoja' },
  { id: 'coffee', icon: '☕', name: 'Café' },
  { id: 'scissors', icon: '✂️', name: 'Tijera' },
  { id: 'dumbbell', icon: '🏋️', name: 'Mancuerna' },
  { id: 'footprint', icon: '👣', name: 'Huella' },
  { id: 'crown', icon: '👑', name: 'Corona' },
];

const CARD_COLORS = [
  '#7C3AED', '#2563EB', '#059669', '#D97706', '#DC2626',
  '#0891B2', '#7C2D12', '#1D4ED8', '#065F46', '#92400E'
];

const PunchCardPreview = ({ formData }) => {
  const [filledStamps, setFilledStamps] = useState(3);
  const stampIcon = STAMP_ICONS?.find(s => s?.id === formData?.stampIcon)?.icon || '⭐';
  const count = parseInt(formData?.stampCount) || 8;

  return (
    <div className="sticky top-6">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Vista Previa</h3>
      <div
        className="rounded-2xl p-5 text-white shadow-xl"
        style={{ background: `linear-gradient(135deg, ${formData?.cardColor || '#7C3AED'}, ${formData?.cardColor || '#7C3AED'}cc)` }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs opacity-70">PromoClub</p>
            <h4 className="font-bold text-lg leading-tight">{formData?.name || 'Nombre de la tarjeta'}</h4>
          </div>
          <div className="text-3xl">{stampIcon}</div>
        </div>
        <div className="flex flex-wrap gap-2 my-4">
          {Array.from({ length: count })?.map((_, i) => (
            <button
              key={i}
              onClick={() => setFilledStamps(i < filledStamps ? i : i + 1)}
              className="w-9 h-9 rounded-full border-2 border-white/40 flex items-center justify-center text-lg transition-all"
              style={{ background: i < filledStamps ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)' }}
            >
              <span style={{ filter: i < filledStamps ? 'none' : 'grayscale(1) opacity(0.4)' }}>{stampIcon}</span>
            </button>
          ))}
          <div className="w-9 h-9 rounded-full border-2 border-white/40 flex items-center justify-center bg-yellow-400/20">
            🎁
          </div>
        </div>
        <div className="border-t border-white/20 pt-3">
          <p className="text-xs opacity-70">Recompensa al completar</p>
          <p className="font-semibold text-sm">{formData?.rewardValue || 'Premio al completar'}</p>
          {formData?.rewardType === 'points' && formData?.rewardPoints && (
            <p className="text-xs opacity-80 mt-0.5">≈ ${pointsToMXN(parseInt(formData?.rewardPoints))} MXN de descuento</p>
          )}
          {formData?.validityType === 'from_activation' && formData?.validityDays && (
            <p className="text-xs opacity-60 mt-1">Válida por {formData?.validityDays} días desde activación</p>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-2">Toca los sellos para simular</p>
      {filledStamps >= count && (
        <div className="mt-3 bg-success/10 border border-success/20 rounded-xl p-4 text-center">
          <div className="text-2xl mb-1">🎉</div>
          <p className="font-bold text-success text-sm">¡Completaste tu tarjeta!</p>
          <p className="text-xs text-muted-foreground">{formData?.rewardValue || 'Premio al completar'}</p>
        </div>
      )}
      <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
        <p className="text-xs font-semibold text-primary mb-1">📐 Reglas de puntos</p>
        <p className="text-xs text-muted-foreground">${POINTS_RULES?.MXN_PER_POINT} MXN = 1 punto · 1 punto = ${POINTS_RULES?.POINT_VALUE_MXN} MXN</p>
      </div>
    </div>
  );
};

const CreatePunchCardPage = ({ businessId, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    name: '', stampIcon: 'star', cardColor: '#7C3AED', stampRule: 'visit',
    stampAmount: '', stampProduct: '', stampCount: 8,
    rewardType: 'free_item', rewardValue: '', rewardDiscount: '', rewardPoints: '',
    validityType: 'from_activation', validityDays: 90, validityDate: '',
    autoRenew: true, showProgress: true
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }));
  const count = parseInt(formData?.stampCount) || 8;
  const weeksEstimate = Math.ceil(count / 2);

  const handleSave = async (status = 'active') => {
    if (!businessId || !formData?.name) return;
    try {
      setSaving(true);
      setError(null);
      await createPunchCard(businessId, { ...formData, status });
      onSaved?.();
    } catch (err) {
      console.error('Error saving punch card:', err);
      setError('Error al guardar la punch card. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <Icon name="ArrowLeft" size={20} className="text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nueva Punch Card</h1>
          <p className="text-sm text-muted-foreground">Configura tu tarjeta de sellos digital</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
          <Icon name="AlertCircle" size={16} className="text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex gap-6">
        {/* Form - left side */}
        <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Identidad */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center">1</span>
                Identidad
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Nombre de la punch card <span className="text-destructive">*</span></label>
                  <input
                    type="text" maxLength={40}
                    value={formData?.name}
                    onChange={e => set('name', e?.target?.value)}
                    placeholder="Ej: Tarjeta del Cafecito"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{formData?.name?.length}/40 caracteres</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Forma del sello</label>
                  <div className="grid grid-cols-6 gap-2">
                    {STAMP_ICONS?.map(s => (
                      <button
                        key={s?.id}
                        onClick={() => set('stampIcon', s?.id)}
                        className={`p-2 rounded-lg border-2 text-xl flex flex-col items-center gap-1 transition-all ${
                          formData?.stampIcon === s?.id ? 'border-primary bg-primary/10' : 'border-border hover:border-muted-foreground'
                        }`}
                        title={s?.name}
                      >
                        {s?.icon}
                        <span className="text-xs text-muted-foreground">{s?.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Color de la tarjeta</label>
                  <div className="flex gap-2 flex-wrap">
                    {CARD_COLORS?.map(c => (
                      <button
                        key={c}
                        onClick={() => set('cardColor', c)}
                        className={`w-8 h-8 rounded-full border-4 transition-all ${
                          formData?.cardColor === c ? 'border-foreground scale-110' : 'border-transparent'
                        }`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Regla de Sello */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center">2</span>
                Regla de Sello
              </h3>
              <div className="space-y-3">
                {[
                  { id: 'visit', label: 'Por visita', desc: 'Cada check-in verificado cuenta como 1 sello', icon: '🚶' },
                  { id: 'amount', label: 'Por monto', desc: `El sello se otorga al alcanzar un monto mínimo de compra (${POINTS_RULES?.MXN_PER_POINT} MXN = 1 punto)`, icon: '💰' },
                  { id: 'product', label: 'Por producto específico', desc: 'El sello se otorga solo al comprar un producto determinado', icon: '🛍️' },
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
                        <span className="font-medium text-foreground">{opt?.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{opt?.desc}</p>
                      {formData?.stampRule === opt?.id && opt?.id === 'amount' && (
                        <div className="mt-3">
                          <label className="text-xs font-medium text-foreground">Monto mínimo por compra (MXN)</label>
                          <input
                            type="number" min="1"
                            value={formData?.stampAmount}
                            onChange={e => set('stampAmount', e?.target?.value)}
                            placeholder="100"
                            className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                          {formData?.stampAmount && (
                            <p className="text-xs text-primary mt-1">≈ {Math.floor(parseFloat(formData?.stampAmount) / POINTS_RULES?.MXN_PER_POINT)} puntos equivalentes</p>
                          )}
                        </div>
                      )}
                      {formData?.stampRule === opt?.id && opt?.id === 'product' && (
                        <div className="mt-3">
                          <label className="text-xs font-medium text-foreground">Producto o categoría</label>
                          <input
                            type="text"
                            value={formData?.stampProduct}
                            onChange={e => set('stampProduct', e?.target?.value)}
                            placeholder="Ej: Café americano, Clase de spinning"
                            className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Meta */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center">3</span>
                Meta
              </h3>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Sellos necesarios para completar</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range" min="3" max="30"
                    value={formData?.stampCount}
                    onChange={e => set('stampCount', parseInt(e?.target?.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="w-12 text-center font-bold text-2xl text-primary">{count}</span>
                </div>
                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    💡 Con {count} sellos, la tarjeta se completaría en aproximadamente <strong>{weeksEstimate} semanas</strong> (visitando 2 veces/semana). Un ciclo de 4-8 semanas es ideal.
                  </p>
                </div>
              </div>
            </div>

            {/* Recompensa */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center">4</span>
                Recompensa al Completar
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Tipo de recompensa</label>
                  <select
                    value={formData?.rewardType}
                    onChange={e => set('rewardType', e?.target?.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="free_item">Producto gratis</option>
                    <option value="discount">Descuento en próxima compra</option>
                    <option value="points">Puntos bonus</option>
                    <option value="experience">Experiencia exclusiva</option>
                    <option value="upgrade">Upgrade</option>
                  </select>
                </div>
                {formData?.rewardType === 'points' && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl">
                    <label className="block text-xs font-medium text-foreground mb-1">Cantidad de puntos bonus</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number" min="1"
                        value={formData?.rewardPoints}
                        onChange={e => set('rewardPoints', e?.target?.value)}
                        placeholder="200"
                        className="w-32 px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                      />
                      <span className="text-sm text-muted-foreground">puntos</span>
                      {formData?.rewardPoints && (
                        <span className="text-sm font-semibold text-success">= ${pointsToMXN(parseInt(formData?.rewardPoints))} MXN</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">1 punto = ${POINTS_RULES?.POINT_VALUE_MXN} MXN de descuento</p>
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
                      formData?.rewardType === 'discount' ? 'Ej: 30% de descuento en tu próxima visita' :
                      formData?.rewardType === 'points' ? 'Ej: +200 puntos bonus (= $30 MXN)' : 'Ej: Cata privada con el barista'
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            {/* Vigencia */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center">5</span>
                Vigencia
              </h3>
              <div className="space-y-3">
                {[
                  { id: 'none', label: 'Sin vigencia', desc: 'La tarjeta nunca expira. Recomendado para negocios con baja frecuencia.' },
                  { id: 'from_activation', label: 'Vigencia desde activación', desc: 'La tarjeta expira X días después del primer sello.' },
                  { id: 'fixed_date', label: 'Fecha fija de calendario', desc: 'Todas las tarjetas vencen en una fecha específica. Ideal para campañas estacionales.' },
                ]?.map(opt => (
                  <label
                    key={opt?.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData?.validityType === opt?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <input type="radio" name="validityType" value={opt?.id} checked={formData?.validityType === opt?.id} onChange={e => set('validityType', e?.target?.value)} className="mt-1" />
                    <div className="flex-1">
                      <span className="font-medium text-foreground text-sm">{opt?.label}</span>
                      <p className="text-xs text-muted-foreground mt-1">{opt?.desc}</p>
                      {formData?.validityType === opt?.id && opt?.id === 'from_activation' && (
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="number" min="15" max="365"
                            value={formData?.validityDays}
                            onChange={e => set('validityDays', e?.target?.value)}
                            className="w-20 px-2 py-1 border border-border rounded bg-input text-foreground text-sm"
                          />
                          <span className="text-sm text-muted-foreground">días desde el primer sello</span>
                        </div>
                      )}
                      {formData?.validityType === opt?.id && opt?.id === 'fixed_date' && (
                        <input
                          type="date"
                          value={formData?.validityDate}
                          onChange={e => set('validityDate', e?.target?.value)}
                          className="mt-2 px-2 py-1 border border-border rounded bg-input text-foreground text-sm"
                        />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Opciones */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center">6</span>
                Opciones
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 bg-muted/30 rounded-xl cursor-pointer">
                  <div>
                    <p className="font-medium text-foreground text-sm">Auto-renovación al completar</p>
                    <p className="text-xs text-muted-foreground">Al canjear la recompensa, se activa una nueva tarjeta idéntica automáticamente</p>
                  </div>
                  <div
                    onClick={() => set('autoRenew', !formData?.autoRenew)}
                    className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
                      formData?.autoRenew ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${
                      formData?.autoRenew ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </div>
                </label>
                <label className="flex items-center justify-between p-4 bg-muted/30 rounded-xl cursor-pointer">
                  <div>
                    <p className="font-medium text-foreground text-sm">Mostrar progreso al hacer check-in</p>
                    <p className="text-xs text-muted-foreground">Al hacer check-in, se muestra el avance del sello al cajero y al usuario</p>
                  </div>
                  <div
                    onClick={() => set('showProgress', !formData?.showProgress)}
                    className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
                      formData?.showProgress ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${
                      formData?.showProgress ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between p-6 border-t border-border bg-muted/20">
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => handleSave('draft')} disabled={saving || !formData?.name}>
                Guardar borrador
              </Button>
              <Button onClick={() => handleSave('active')} disabled={saving || !formData?.name}>
                {saving ? (
                  <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Guardando...</>
                ) : (
                  <><Icon name="Zap" size={16} className="mr-2" />Publicar punch card</>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Preview - right side */}
        <div className="w-80 flex-shrink-0">
          <PunchCardPreview formData={formData} />
        </div>
      </div>
    </div>
  );
};

export default CreatePunchCardPage;
