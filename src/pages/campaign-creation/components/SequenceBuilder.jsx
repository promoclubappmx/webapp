import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { fetchAvailablePromotions } from '../../../services/campaignNotificationService';

const ACCIONES = [
  { id: 'push', nombre: 'Push Notification', icono: 'Bell', color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'cupon', nombre: 'Cupón al wallet', icono: 'Tag', color: 'text-green-500', bg: 'bg-green-50' },
  { id: 'email', nombre: 'Email', icono: 'Mail', color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'story', nombre: 'Story en feed', icono: 'Image', color: 'text-pink-500', bg: 'bg-pink-50' },
  { id: 'promo', nombre: 'Activar promoción', icono: 'Percent', color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'whatsapp', nombre: 'WhatsApp', icono: 'MessageCircle', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'puntos', nombre: 'Acreditar puntos bonus', icono: 'Star', color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { id: 'badge', nombre: 'Asignar badge/misión', icono: 'Award', color: 'text-indigo-500', bg: 'bg-indigo-50' },
];

const TIMING_TYPES = [
  { id: 'immediate', label: 'Inmediato' },
  { id: 'wait_time', label: 'Esperar tiempo' },
  { id: 'wait_action', label: 'Esperar acción del usuario' },
  { id: 'wait_date', label: 'Esperar fecha específica' },
];

const USER_ACTIONS = [
  { id: 'opened_push', label: 'Abrió el push' },
  { id: 'redeemed_coupon', label: 'Canjeó el cupón' },
  { id: 'visited', label: 'Visitó el negocio' },
  { id: 'left_review', label: 'Dejó reseña' },
];

const PROMO_STATUS_CONFIG = {
  active: { label: 'Activa', color: 'text-success', dot: 'bg-success' },
  paused: { label: 'Pausada', color: 'text-warning', dot: 'bg-warning' },
  draft: { label: 'Borrador', color: 'text-muted-foreground', dot: 'bg-muted-foreground' },
};

// Promotion selector sub-component
const PromotionSelector = ({ step, onUpdate, availablePromotions }) => {
  const selectedPromo = availablePromotions?.find(p => p?.id === step?.promotionId);
  const statusCfg = PROMO_STATUS_CONFIG?.[selectedPromo?.status] || PROMO_STATUS_CONFIG?.draft;

  return (
    <div className="space-y-3">
      {/* Promotion picker */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          Seleccionar promoción del catálogo
        </label>
        <select
          value={step?.promotionId || ''}
          onChange={e => {
            const promo = availablePromotions?.find(p => p?.id === e?.target?.value);
            onUpdate(step?.id, 'promotionId', e?.target?.value);
            onUpdate(step?.id, 'promotionTitle', promo?.title || '');
          }}
          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">— Selecciona una promoción —</option>
          {availablePromotions?.map(promo => (
            <option key={promo?.id} value={promo?.id}>
              {promo?.title} ({promo?.status === 'active' ? '● Activa' : promo?.status === 'paused' ? '⏸ Pausada' : '○ Borrador'})
            </option>
          ))}
        </select>
      </div>

      {/* Selected promo status badge */}
      {selectedPromo && (
        <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
          <span className={`w-2 h-2 rounded-full ${statusCfg?.dot}`} />
          <span className="text-xs text-orange-700 font-medium">{selectedPromo?.title}</span>
          <span className={`text-xs ${statusCfg?.color} ml-auto`}>{statusCfg?.label}</span>
        </div>
      )}

      {/* Action type */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Acción sobre la promoción</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onUpdate(step?.id, 'promotionAction', 'activate')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
              (step?.promotionAction || 'activate') === 'activate'
                ? 'border-success bg-success/10 text-success' :'border-border text-muted-foreground hover:border-success/40'
            }`}
          >
            <Icon name="Play" size={12} />
            Activar promoción
          </button>
          <button
            onClick={() => onUpdate(step?.id, 'promotionAction', 'deactivate')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
              step?.promotionAction === 'deactivate' ?'border-warning bg-warning/10 text-warning' :'border-border text-muted-foreground hover:border-warning/40'
            }`}
          >
            <Icon name="Pause" size={12} />
            Desactivar promoción
          </button>
        </div>
      </div>

      {/* Timing hours */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Duración de activación (horas, 0 = indefinida)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={720}
            value={step?.promotionTimingHours || 0}
            onChange={e => onUpdate(step?.id, 'promotionTimingHours', parseInt(e?.target?.value) || 0)}
            className="w-24 px-2 py-1.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="text-xs text-muted-foreground">horas activa (0 = hasta desactivar manualmente)</span>
        </div>
      </div>
    </div>
  );
};

const StepNode = ({ step, index, total, onUpdate, onDelete, availablePromotions }) => {
  const [expanded, setExpanded] = useState(true);
  const accion = ACCIONES?.find(a => a?.id === step?.action) || ACCIONES?.[0];
  const isPromoStep = step?.action === 'promo';

  return (
    <div className="relative">
      <div className={`border-2 rounded-xl bg-card overflow-hidden transition-colors ${
        isPromoStep ? 'border-orange-200 hover:border-orange-400' : 'border-border hover:border-primary/40'
      }`}>
        {/* Header del nodo */}
        <div className={`flex items-center gap-3 p-3 border-b ${
          isPromoStep ? 'bg-orange-50/50 border-orange-100' : 'bg-muted/30 border-border'
        }`}>
          <div className={`w-8 h-8 rounded-lg ${accion?.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon name={accion?.icono} size={16} className={accion?.color} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Paso {index + 1}</p>
            <p className="text-xs text-muted-foreground truncate">
              {isPromoStep && step?.promotionTitle ? step?.promotionTitle : accion?.nombre}
            </p>
          </div>
          {isPromoStep && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
              {step?.promotionAction === 'deactivate' ? 'Desactivar' : 'Activar'}
            </span>
          )}
          <div className="flex items-center gap-1">
            <button onClick={() => setExpanded(v => !v)} className="p-1 hover:bg-muted rounded transition-colors">
              <Icon name={expanded ? 'ChevronUp' : 'ChevronDown'} size={14} className="text-muted-foreground" />
            </button>
            {total > 1 && (
              <button onClick={() => onDelete(step?.id)} className="p-1 hover:bg-destructive/10 rounded transition-colors">
                <Icon name="Trash2" size={14} className="text-destructive" />
              </button>
            )}
          </div>
        </div>

        {expanded && (
          <div className="p-4 space-y-3">
            {/* Acción */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Acción</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {ACCIONES?.map(a => (
                  <button
                    key={a?.id}
                    onClick={() => onUpdate(step?.id, 'action', a?.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-center transition-all ${
                      step?.action === a?.id ? `${a?.bg} border-current ${a?.color}` : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <Icon name={a?.icono} size={14} className={step?.action === a?.id ? a?.color : 'text-muted-foreground'} />
                    <span className={`text-xs leading-tight ${step?.action === a?.id ? a?.color : 'text-muted-foreground'}`}>{a?.nombre}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Promotion selector (only for promo steps) */}
            {isPromoStep ? (
              <PromotionSelector
                step={step}
                onUpdate={onUpdate}
                availablePromotions={availablePromotions}
              />
            ) : (
              /* Mensaje for non-promo steps */
              (<div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Mensaje / Contenido</label>
                <textarea
                  value={step?.message || ''}
                  onChange={e => onUpdate(step?.id, 'message', e?.target?.value)}
                  placeholder="Escribe el contenido de este paso..."
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>)
            )}

            {/* Timing */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Timing</label>
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                {TIMING_TYPES?.map(t => (
                  <button
                    key={t?.id}
                    onClick={() => onUpdate(step?.id, 'timingType', t?.id)}
                    disabled={index === 0 && t?.id !== 'immediate'}
                    className={`px-2 py-1.5 rounded-lg border text-xs font-medium transition-all disabled:opacity-40 ${
                      step?.timingType === t?.id ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {t?.label}
                  </button>
                ))}
              </div>

              {step?.timingType === 'wait_time' && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={step?.waitDays || 1}
                    onChange={e => onUpdate(step?.id, 'waitDays', parseInt(e?.target?.value) || 1)}
                    className="w-20 px-2 py-1.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-muted-foreground">días después del paso anterior</span>
                </div>
              )}

              {step?.timingType === 'wait_action' && (
                <select
                  value={step?.waitAction || 'visited'}
                  onChange={e => onUpdate(step?.id, 'waitAction', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {USER_ACTIONS?.map(a => (
                    <option key={a?.id} value={a?.id}>{a?.label}</option>
                  ))}
                </select>
              )}

              {step?.timingType === 'wait_date' && (
                <input
                  type="date"
                  value={step?.waitDate || ''}
                  onChange={e => onUpdate(step?.id, 'waitDate', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            </div>

            {/* Condición de salida */}
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs font-medium text-foreground mb-1 flex items-center gap-1.5">
                <Icon name="GitBranch" size={12} className="text-primary" />
                Condición de salida
              </p>
              <p className="text-xs text-muted-foreground">El usuario sale de la secuencia automáticamente si completa el objetivo (visitó, canjeó, compró) en cualquier punto.</p>
            </div>

            {/* Bifurcaciones (non-promo steps only) */}
            {index > 0 && !isPromoStep && (
              <div className="border border-dashed border-border rounded-lg p-3">
                <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
                  <Icon name="GitFork" size={12} className="text-primary" />
                  Bifurcación condicional
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                    <p className="text-xs font-medium text-green-700 mb-1">✓ Si canjeó</p>
                    <input
                      type="text"
                      value={step?.branchYes || ''}
                      onChange={e => onUpdate(step?.id, 'branchYes', e?.target?.value)}
                      placeholder="Enviar agradecimiento"
                      className="w-full px-2 py-1 border border-green-200 rounded text-xs bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-green-400"
                    />
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                    <p className="text-xs font-medium text-amber-700 mb-1">✗ Si no canjeó</p>
                    <input
                      type="text"
                      value={step?.branchNo || ''}
                      onChange={e => onUpdate(step?.id, 'branchNo', e?.target?.value)}
                      placeholder="Escalar incentivo"
                      className="w-full px-2 py-1 border border-amber-200 rounded text-xs bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Conector */}
      {index < total - 1 && (
        <div className="flex flex-col items-center py-2">
          <div className="w-0.5 h-4 bg-border" />
          <Icon name="ArrowDown" size={14} className="text-muted-foreground" />
          <div className="w-0.5 h-4 bg-border" />
        </div>
      )}
    </div>
  );
};

const SequenceBuilder = ({ steps, onChange }) => {
  const [availablePromotions, setAvailablePromotions] = useState([]);

  useEffect(() => {
    fetchAvailablePromotions()?.then(setAvailablePromotions);
  }, []);

  const addStep = () => {
    const newStep = {
      id: Date.now(),
      action: 'push',
      message: '',
      timingType: 'wait_time',
      waitDays: 1,
      waitAction: 'visited',
      waitDate: '',
      branchYes: '',
      branchNo: '',
      promotionId: '',
      promotionTitle: '',
      promotionAction: 'activate',
      promotionTimingHours: 0,
    };
    onChange([...steps, newStep]);
  };

  const deleteStep = (id) => {
    onChange(steps?.filter(s => s?.id !== id));
  };

  const updateStep = (id, field, value) => {
    onChange(steps?.map(s => s?.id === id ? { ...s, [field]: value } : s));
  };

  const promoStepsCount = steps?.filter(s => s?.action === 'promo')?.length || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Constructor de secuencia multi-paso</h3>
          <p className="text-sm text-muted-foreground">Define los pasos de tu campaña con acciones y tiempos de espera.</p>
        </div>
        <div className="flex items-center gap-2">
          {promoStepsCount > 0 && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center gap-1">
              <Icon name="Percent" size={11} />
              {promoStepsCount} promo{promoStepsCount !== 1 ? 's' : ''}
            </span>
          )}
          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">{steps?.length} paso{steps?.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="space-y-0">
        {steps?.map((step, idx) => (
          <StepNode
            key={step?.id}
            step={step}
            index={idx}
            total={steps?.length}
            onUpdate={updateStep}
            onDelete={deleteStep}
            availablePromotions={availablePromotions}
          />
        ))}
      </div>

      <button
        onClick={addStep}
        className="mt-4 w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
      >
        <Icon name="Plus" size={16} />
        Agregar paso
      </button>
    </div>
  );
};

export default SequenceBuilder;
