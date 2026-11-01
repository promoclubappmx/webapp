import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { fetchPunchCards, createPunchCard, updatePunchCard, POINTS_RULES, pointsToMXN } from '../../../services/rewardsService';

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
    <div className="sticky top-4">
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
      {/* Business Rules Info */}
      <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
        <p className="text-xs font-semibold text-primary mb-1">📐 Reglas de puntos</p>
        <p className="text-xs text-muted-foreground">${POINTS_RULES?.MXN_PER_POINT} MXN = 1 punto · 1 punto = ${POINTS_RULES?.POINT_VALUE_MXN} MXN</p>
      </div>
    </div>
  );
};

const CreatePunchCardForm = ({ onClose, onSave, saving }) => {
  const [formData, setFormData] = useState({
    name: '', stampIcon: 'star', cardColor: '#7C3AED', stampRule: 'visit',
    stampAmount: '', stampProduct: '', stampCount: 8,
    rewardType: 'free_item', rewardValue: '', rewardDiscount: '', rewardPoints: '',
    validityType: 'from_activation', validityDays: 90, validityDate: '',
    autoRenew: true, showProgress: true
  });

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }));
  const count = parseInt(formData?.stampCount) || 8;
  const weeksEstimate = Math.ceil(count / 2);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-5xl my-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Nueva Punch Card</h2>
            <p className="text-sm text-muted-foreground">Configura tu tarjeta de sellos digital</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>
        <div className="flex gap-0">
          {/* Form - 60% */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[80vh]">
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
                      <span className="text-xs text-muted-foreground">puntos</span>
                      {formData?.rewardPoints && (
                        <span className="text-xs font-semibold text-success">= ${pointsToMXN(parseInt(formData?.rewardPoints))} MXN</span>
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

          {/* Preview - 40% */}
          <div className="w-80 border-l border-border p-6 bg-muted/20">
            <PunchCardPreview formData={formData} />
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/20">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onSave({ ...formData, status: 'draft' })} disabled={saving || !formData?.name}>
              Guardar borrador
            </Button>
            <Button onClick={() => onSave({ ...formData, status: 'active' })} disabled={saving || !formData?.name}>
              {saving ? (
                <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Guardando...</>
              ) : (
                <><Icon name="Zap" size={16} className="mr-2" />Publicar punch card</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PunchCardAnalyticsDrawer = ({ card, onClose }) => {
  if (!card) return null;
  const stampIcon = STAMP_ICONS?.find(s => s?.id === card?.stamp_icon)?.icon || '⭐';
  const stampCount = card?.stamp_count || 8;
  const activeClients = card?.active_clients || 0;
  const distribution = Array.from({ length: stampCount }, (_, i) => ({
    stamp: i + 1,
    clients: Math.max(1, Math.floor(activeClients * Math.exp(-i * 0.3)))
  }));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="bg-card w-full max-w-lg h-full overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{stampIcon}</span>
            <div>
              <h3 className="font-bold text-foreground">{card?.name}</h3>
              <p className="text-sm text-muted-foreground">Analytics de punch card</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Tarjetas emitidas', value: activeClients, icon: 'CreditCard', color: 'text-primary' },
              { label: 'Tasa de completitud', value: `${card?.completion_rate || 0}%`, icon: 'CheckCircle', color: 'text-success' },
              { label: 'Progreso promedio', value: `${card?.avg_progress || 0} / ${stampCount}`, icon: 'TrendingUp', color: 'text-warning' },
              { label: 'Tiempo promedio', value: '6.2 sem', icon: 'Clock', color: 'text-muted-foreground' },
            ]?.map((kpi, i) => (
              <div key={i} className="bg-muted/30 rounded-xl p-4">
                <Icon name={kpi?.icon} size={20} className={`${kpi?.color} mb-2`} />
                <p className={`text-xl font-bold ${kpi?.color}`}>{kpi?.value}</p>
                <p className="text-xs text-muted-foreground">{kpi?.label}</p>
              </div>
            ))}
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">Distribución de progreso</h4>
            <div className="space-y-2">
              {distribution?.slice(0, 10)?.map(d => (
                <div key={d?.stamp} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-16">{d?.stamp} sello{d?.stamp > 1 ? 's' : ''}</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${activeClients > 0 ? (d?.clients / activeClients) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{d?.clients}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
            <p className="text-sm font-medium text-warning mb-1">Tasa de abandono</p>
            <p className="text-2xl font-bold text-foreground">23%</p>
            <p className="text-xs text-muted-foreground">Clientes que dejaron de avanzar después del sello {Math.floor(stampCount * 0.6)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusBadge = (status) => {
  const map = {
    active: { label: 'Activa', cls: 'bg-success/10 text-success border-success/20' },
    draft: { label: 'Borrador', cls: 'bg-muted/50 text-muted-foreground border-border' },
    paused: { label: 'Pausada', cls: 'bg-warning/10 text-warning border-warning/20' },
    expired: { label: 'Vencida', cls: 'bg-destructive/10 text-destructive border-destructive/20' },
    seasonal: { label: 'Estacional', cls: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' },
  };
  return map?.[status] || map?.draft;
};

const PunchCardsTab = ({ businessId, onDataChange, onCreateNew }) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [analyticsCard, setAnalyticsCard] = useState(null);
  const [compatibilityMode, setCompatibilityMode] = useState(true);
  const [globalTriggers, setGlobalTriggers] = useState({
    on_complete: true,
    on_halfway: false,
    on_first_stamp: false,
    on_expiry_warning: true,
  });
  const [globalActions, setGlobalActions] = useState({
    sendMessage: true,
    messageChannel: 'push',
    surpriseReward: false,
    referralBonus: false,
    automationFlow: false,
  });
  const [showTriggersSection, setShowTriggersSection] = useState(false);
  const planLimit = 3;

  useEffect(() => {
    if (businessId) loadCards();
    else setLoading(false);
  }, [businessId]);

  const loadCards = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPunchCards(businessId);
      setCards(data);
    } catch (err) {
      setError('Error al cargar las punch cards');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activeCount = cards?.filter(c => c?.status === 'active')?.length;

  const handleSave = async (formData) => {
    if (!businessId) return;
    try {
      setSaving(true);
      await createPunchCard(businessId, formData);
      await loadCards();
      onDataChange?.();
      setShowCreate(false);
    } catch (err) {
      console.error('Error saving punch card:', err);
      setError('Error al guardar la punch card');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (card) => {
    try {
      const newStatus = card?.status === 'active' ? 'paused' : 'active';
      await updatePunchCard(card?.id, { status: newStatus });
      setCards(prev => prev?.map(c => c?.id === card?.id ? { ...c, status: newStatus } : c));
    } catch (err) {
      console.error('Error toggling punch card:', err);
    }
  };

  const handleDuplicate = async (card) => {
    if (!businessId) return;
    try {
      const dupData = {
        name: `${card?.name} (Copia)`,
        stampIcon: card?.stamp_icon,
        cardColor: card?.card_color,
        stampRule: card?.stamp_rule,
        stampAmount: card?.stamp_amount,
        stampProduct: card?.stamp_product,
        stampCount: card?.stamp_count,
        rewardType: card?.reward_type,
        rewardValue: card?.reward_value,
        validityType: card?.validity_type,
        validityDays: card?.validity_days,
        autoRenew: card?.auto_renew,
        showProgress: card?.show_progress,
        status: 'draft',
      };
      await createPunchCard(businessId, dupData);
      await loadCards();
    } catch (err) {
      console.error('Error duplicating punch card:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Icon name="Loader2" size={32} className="text-primary animate-spin" />
        <span className="ml-3 text-muted-foreground">Cargando punch cards...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
          <Icon name="AlertCircle" size={16} className="text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
          <button onClick={loadCards} className="ml-auto text-xs text-destructive underline">Reintentar</button>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl">
            <Icon name="CreditCard" size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{activeCount} de {planLimit} activas</span>
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">PRO</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Compatibilidad de sellos</span>
            <button
              onClick={() => setCompatibilityMode(!compatibilityMode)}
              className={`w-10 h-5 rounded-full transition-colors ${
                compatibilityMode ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow mt-0.5 transition-transform ${
                compatibilityMode ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
            <span className="text-xs text-muted-foreground">{compatibilityMode ? 'Un check-in puede dar sello en múltiples tarjetas' : 'Solo tarjeta de mayor prioridad'}</span>
          </div>
        </div>
        <Button
          onClick={() => onCreateNew ? onCreateNew() : setShowCreate(true)}
          disabled={activeCount >= planLimit}
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Nueva Punch Card
        </Button>
      </div>

      {/* Cards Grid */}
      {cards?.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎴</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No hay punch cards</h3>
          <p className="text-muted-foreground mb-6">Crea tu primera tarjeta de sellos digital</p>
          <Button onClick={() => onCreateNew ? onCreateNew() : setShowCreate(true)}>
            <Icon name="Plus" size={16} className="mr-2" />
            Crear primera punch card
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {cards?.map(card => {
            const stampIcon = STAMP_ICONS?.find(s => s?.id === card?.stamp_icon)?.icon || '⭐';
            const statusBadge = getStatusBadge(card?.is_seasonal ? 'seasonal' : card?.status);
            return (
              <div key={card?.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all group">
                <div
                  className="p-5 text-white relative"
                  style={{ background: `linear-gradient(135deg, ${card?.card_color}, ${card?.card_color}cc)` }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs opacity-70 mb-1">Punch Card</p>
                      <h4 className="font-bold text-base leading-tight">{card?.name}</h4>
                    </div>
                    <span className="text-3xl">{stampIcon}</span>
                  </div>
                  <div className="flex gap-1 mt-3 flex-wrap">
                    {Array.from({ length: Math.min(card?.stamp_count || 8, 10) })?.map((_, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full border border-white/40 flex items-center justify-center text-xs"
                        style={{ background: i < 3 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)' }}
                      >
                        {i < 3 ? <span style={{ fontSize: '10px' }}>{stampIcon}</span> : ''}
                      </div>
                    ))}
                    {(card?.stamp_count || 8) > 10 && <span className="text-xs opacity-70">+{(card?.stamp_count || 8) - 10}</span>}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge?.cls}`}>
                      {statusBadge?.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{card?.stamp_count} sellos → {card?.reward_value}</span>
                  </div>
                  {card?.reward_type === 'points' && card?.reward_points && (
                    <div className="mb-3 px-2 py-1 bg-primary/5 rounded-lg">
                      <p className="text-xs text-primary font-medium">{card?.reward_points} pts = ${pointsToMXN(card?.reward_points)} MXN</p>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{card?.active_clients || 0}</p>
                      <p className="text-xs text-muted-foreground">Clientes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-primary">{card?.avg_progress || 0}</p>
                      <p className="text-xs text-muted-foreground">Promedio</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-success">{card?.completion_rate || 0}%</p>
                      <p className="text-xs text-muted-foreground">Completan</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 pt-3 border-t border-border">
                    <button
                      onClick={() => setAnalyticsCard(card)}
                      className="flex-1 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Icon name="BarChart3" size={12} />
                      Analytics
                    </button>
                    <button
                      onClick={() => handleToggle(card)}
                      className="flex-1 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Icon name={card?.status === 'active' ? 'Pause' : 'Play'} size={12} />
                      {card?.status === 'active' ? 'Pausar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => handleDuplicate(card)}
                      className="flex-1 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Icon name="Copy" size={12} />
                      Duplicar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ⚡ Triggers y Automatizaciones Globales */}
      <div className="border border-border rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowTriggersSection(!showTriggersSection)}
          className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <Icon name="Zap" size={18} className="text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">⚡ Triggers y Automatizaciones</p>
              <p className="text-xs text-muted-foreground">Configura qué sucede automáticamente al completar una punch card</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
              {Object.values(globalTriggers)?.filter(Boolean)?.length} trigger{Object.values(globalTriggers)?.filter(Boolean)?.length !== 1 ? 's' : ''} activo{Object.values(globalTriggers)?.filter(Boolean)?.length !== 1 ? 's' : ''}
            </span>
            <Icon name={showTriggersSection ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground" />
          </div>
        </button>

        {showTriggersSection && (
          <div className="p-5 border-t border-border space-y-6">
            {/* Trigger Events */}
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Icon name="Zap" size={16} className="text-primary" />
                ¿Cuándo se dispara la automatización?
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { id: 'on_complete', label: 'Al completar la tarjeta', desc: 'Cuando el cliente acumula todos los sellos requeridos', icon: '🎉', est: 'Principal' },
                  { id: 'on_halfway', label: 'Al llegar al 50% de sellos', desc: 'Recordatorio motivacional a mitad del camino', icon: '🔥', est: 'Retención' },
                  { id: 'on_first_stamp', label: 'Al obtener el primer sello', desc: 'Bienvenida y explicación del programa', icon: '👋', est: 'Onboarding' },
                  { id: 'on_expiry_warning', label: 'Aviso de vencimiento próximo', desc: '7 días antes de que expire la tarjeta', icon: '⏰', est: 'Urgencia' },
                ]?.map(trigger => (
                  <label
                    key={trigger?.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      globalTriggers?.[trigger?.id] ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={globalTriggers?.[trigger?.id] || false}
                      onChange={e => setGlobalTriggers(prev => ({ ...prev, [trigger?.id]: e?.target?.checked }))}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>{trigger?.icon}</span>
                        <span className="font-medium text-foreground text-sm">{trigger?.label}</span>
                        <span className="px-1.5 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">{trigger?.est}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{trigger?.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Global Actions */}
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Icon name="Settings" size={16} className="text-primary" />
                Acciones automáticas globales
              </h4>
              <div className="space-y-3">
                {/* Send message */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-medium text-foreground">Enviar mensaje de felicitación</p>
                    <p className="text-xs text-muted-foreground">Notifica al cliente cuando complete cualquier tarjeta</p>
                  </div>
                  <button
                    onClick={() => setGlobalActions(p => ({ ...p, sendMessage: !p?.sendMessage }))}
                    className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                      globalActions?.sendMessage ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${
                      globalActions?.sendMessage ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                {globalActions?.sendMessage && (
                  <div className="ml-4 p-3 bg-card border border-border rounded-xl">
                    <label className="block text-xs font-medium text-foreground mb-1">Canal de envío</label>
                    <select
                      value={globalActions?.messageChannel || 'push'}
                      onChange={e => setGlobalActions(p => ({ ...p, messageChannel: e?.target?.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                    >
                      <option value="push">Push notification</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="email">Email</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">Variables disponibles: {'{nombre}'} {'{negocio}'} {'{tarjeta}'}</p>
                  </div>
                )}

                {/* Surprise reward */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-medium text-foreground">Activar recompensa sorpresa</p>
                    <p className="text-xs text-muted-foreground">Dispara la mecánica del tab Sorpresas (ruleta, scratch, cofre)</p>
                  </div>
                  <button
                    onClick={() => setGlobalActions(p => ({ ...p, surpriseReward: !p?.surpriseReward }))}
                    className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                      globalActions?.surpriseReward ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${
                      globalActions?.surpriseReward ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {/* Referral bonus */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-medium text-foreground">Activar bonus de referido</p>
                    <p className="text-xs text-muted-foreground">El cliente recibe puntos extra si refiere a alguien después de completar</p>
                  </div>
                  <button
                    onClick={() => setGlobalActions(p => ({ ...p, referralBonus: !p?.referralBonus }))}
                    className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                      globalActions?.referralBonus ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${
                      globalActions?.referralBonus ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                {globalActions?.referralBonus && (
                  <div className="ml-4 p-3 bg-card border border-border rounded-xl">
                    <label className="block text-xs font-medium text-foreground mb-1">Puntos bonus de referido</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number" min="1"
                        value={globalActions?.referralPoints || 50}
                        onChange={e => setGlobalActions(p => ({ ...p, referralPoints: parseInt(e?.target?.value) }))}
                        className="w-24 px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                      />
                      <span className="text-xs text-muted-foreground">puntos</span>
                      {(globalActions?.referralPoints || 50) > 0 && (
                        <span className="text-xs font-semibold text-success">= ${pointsToMXN(globalActions?.referralPoints || 50)} MXN</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">1 pto = ${POINTS_RULES?.POINT_VALUE_MXN} MXN · ${POINTS_RULES?.MXN_PER_POINT} MXN = 1 pto</p>
                  </div>
                )}

                {/* Automation flow */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-medium text-foreground">Inscribir en flow de automatización</p>
                    <p className="text-xs text-muted-foreground">Agrega al cliente a un flow de mensajes automáticos</p>
                  </div>
                  <button
                    onClick={() => setGlobalActions(p => ({ ...p, automationFlow: !p?.automationFlow }))}
                    className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                      globalActions?.automationFlow ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${
                      globalActions?.automationFlow ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                {globalActions?.automationFlow && (
                  <div className="ml-4 p-3 bg-card border border-border rounded-xl">
                    <label className="block text-xs font-medium text-foreground mb-1">Flow activo</label>
                    <select
                      value={globalActions?.flowId || ''}
                      onChange={e => setGlobalActions(p => ({ ...p, flowId: e?.target?.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                    >
                      <option value="">Seleccionar flow...</option>
                      <option value="flow_welcome">Flow de Bienvenida VIP</option>
                      <option value="flow_retention">Flow de Retención</option>
                      <option value="flow_reactivation">Flow de Reactivación</option>
                      <option value="flow_birthday">Flow de Cumpleaños</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">Gestiona flows en <span className="text-primary">/automation-flows-dashboard</span></p>
                  </div>
                )}
              </div>
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
              <Icon name="Info" size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Automatizaciones por tarjeta</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cada punch card también puede tener sus propias automatizaciones configuradas individualmente al crearla o editarla. Las reglas globales aquí aplican a <strong>todas</strong> las tarjetas activas.
                </p>
                <p className="text-xs text-primary mt-1">Regla: ${POINTS_RULES?.MXN_PER_POINT} MXN = 1 punto · 1 punto = ${POINTS_RULES?.POINT_VALUE_MXN} MXN</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreate && !onCreateNew && <CreatePunchCardForm onClose={() => setShowCreate(false)} onSave={handleSave} saving={saving} />}
      {analyticsCard && <PunchCardAnalyticsDrawer card={analyticsCard} onClose={() => setAnalyticsCard(null)} />}
    </div>
  );
};

export default PunchCardsTab;
