import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const POINT_VALUE_MXN = 0.15;
const AVG_VISIT_FREQUENCY = 5;

const DEFAULT_STREAK = [
  { visit: 2, bonus: 5, name: 'Primer regreso', emoji: '🌱', description: '¡Volviste! Sigue así.' },
  { visit: 3, bonus: 10, name: 'Constante', emoji: '💪', description: 'Ya llevas 3 visitas seguidas.' },
  { visit: 5, bonus: 20, name: 'Racha activa', emoji: '🔥', description: '5 visitas consecutivas. ¡Increíble!' },
  { visit: 7, bonus: 30, name: 'Semana perfecta', emoji: '⭐', description: '7 visitas seguidas. ¡Eres un crack!' },
  { visit: 10, bonus: 50, name: 'Décima visita', emoji: '💎', description: '10 visitas consecutivas. ¡Leyenda!' },
  { visit: 15, bonus: 100, name: 'Racha máxima', emoji: '👑', description: '15 visitas. ¡Eres el mejor cliente!' },
];

const STREAK_EMOJIS = [
  '🔥','💪','⭐','☕','✂️','🏋️','🍕','🎯','💎','🚀',
  '🌟','🏆','❤️','🎉','🌈','⚡','🦁','🎸','🍀','🌺',
  '🌱','🥇','🥈','🥉','🎖️','🏅','🎗️','💫','✨','🎪',
  '🦋','🐉','🦄','🌙','🌅','🌊','🏔️','🎵','🎶','🎨',
  '🍦','🍩','🍔','🌮','🍣','🍜','🥗','🍷','🧁','🎂',
  '🏄','🚴','🧘','🤸','⛷️','🏊','🎾','⚽','🏀','🎱',
  '🐶','🐱','🦊','🐺','🦅','🦋','🐬','🦁','🐯','🦊',
  '💐','🌸','🌻','🌹','🍁','🌿','🌴','🎋','🌵','🍀',
  '🎠','🎡','🎢','🎭','🎬','🎤','🎧','🎮','🕹️','🎲',
  '💡','🔑','🗝️','🔮','🧲','🧪','🔭','📡','💻','📱',
  '🏠','🏰','🗼','⛩️','🌉','🌃','🌆','🌇','🌁','🗺️',
  '🚗','✈️','🚀','⛵','🚂','🏍️','🚁','🛸','🚢','🛺',
];

const STEP_EMOJIS = [
  '🌱','💪','🔥','⭐','💎','👑','🏆','🥇','🎯','🚀',
  '⚡','🌟','❤️','🎉','🌈','🦁','🎸','🍀','🌺','🎖️',
  '🥈','🥉','🏅','🎗️','💫','✨','🎪','🦋','🐉','🦄',
];

const WIZARD_STEPS = [
  { id: 'identidad', label: 'Identidad', icon: 'Tag', description: 'Nombre y emoji de la racha' },
  { id: 'escalones', label: 'Escalones', icon: 'Layers', description: 'Configura cada escalón de la racha' },
  { id: 'recompensas', label: 'Recompensas', icon: 'Gift', description: 'Puntos y beneficios por escalón' },
  { id: 'ventana', label: 'Ventana y Reglas', icon: 'Clock', description: 'Tiempo y comportamiento' },
  { id: 'notificaciones', label: 'Notificaciones', icon: 'Bell', description: 'Alertas y mensajes' },
];

// ─── COMPLEMENT TYPES ─────────────────────────────────────────────────────────
const COMPLEMENT_TYPES = [
  { id: 'coupon', label: 'Cupón de descuento', icon: '🎟️', description: 'Otorga un cupón de descuento al alcanzar el escalón' },
  { id: 'stamp_card', label: 'Tarjeta de sellos', icon: '🎴', description: 'Regala una tarjeta de sellos (punch card) completada o parcial' },
  { id: 'surprise', label: 'Sorpresa', icon: '🎁', description: 'Activa una sorpresa configurada en el módulo de sorpresas' },
  { id: 'free_product', label: 'Producto gratis', icon: '🛍️', description: 'Otorga un producto o servicio gratuito del catálogo' },
  { id: 'vip_upgrade', label: 'Upgrade VIP', icon: '👑', description: 'Sube automáticamente al cliente de nivel VIP' },
  { id: 'gift_card', label: 'Gift card', icon: '💳', description: 'Entrega una gift card con saldo predefinido' },
  { id: 'experience', label: 'Experiencia especial', icon: '🌟', description: 'Acceso a una experiencia o evento exclusivo' },
  { id: 'custom', label: 'Beneficio personalizado', icon: '✨', description: 'Define un beneficio personalizado con texto libre' },
];

const Toggle = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-primary' : 'bg-muted'}`}
  >
    <span
      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
      style={{ left: value ? '24px' : '2px', top: '4px', transition: 'left 0.2s' }}
    />
  </button>
);

// ─── COMPLEMENT DETAIL FIELDS ─────────────────────────────────────────────────
const ComplementDetailFields = ({ ctId, details, onUpdate }) => {
  if (ctId === 'coupon') return (
    <div className="space-y-2" onClick={e => e?.stopPropagation()}>
      <input type="text" placeholder="Nombre del cupón (ej: 10% descuento)" value={details?.name || ''} onChange={e => onUpdate('name', e?.target?.value)}
        className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
      <div className="flex gap-2">
        <input type="number" placeholder="% descuento" value={details?.discount || ''} onChange={e => onUpdate('discount', e?.target?.value)}
          className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
        <input type="number" placeholder="Días vigencia" value={details?.validity || ''} onChange={e => onUpdate('validity', e?.target?.value)}
          className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
      </div>
    </div>
  );
  if (ctId === 'stamp_card') return (
    <div className="flex gap-2" onClick={e => e?.stopPropagation()}>
      <select value={details?.type || 'partial'} onChange={e => onUpdate('type', e?.target?.value)}
        className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none">
        <option value="partial">Parcial (sellos prellenados)</option>
        <option value="complete">Completa (lista para canjear)</option>
      </select>
      {details?.type !== 'complete' && (
        <input type="number" placeholder="# sellos" value={details?.stamps || ''} onChange={e => onUpdate('stamps', e?.target?.value)}
          className="w-24 border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none" />
      )}
    </div>
  );
  if (ctId === 'surprise') return (
    <input type="text" placeholder="Nombre de la sorpresa configurada" value={details?.surpriseName || ''} onChange={e => onUpdate('surpriseName', e?.target?.value)}
      className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" onClick={e => e?.stopPropagation()} />
  );
  if (ctId === 'free_product') return (
    <input type="text" placeholder="Nombre del producto o servicio" value={details?.productName || ''} onChange={e => onUpdate('productName', e?.target?.value)}
      className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" onClick={e => e?.stopPropagation()} />
  );
  if (ctId === 'vip_upgrade') return (
    <select value={details?.level || ''} onChange={e => onUpdate('level', e?.target?.value)}
      className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none" onClick={e => e?.stopPropagation()}>
      <option value="">Seleccionar nivel VIP</option>
      <option value="silver">Plata</option><option value="gold">Oro</option><option value="platinum">Platino</option>
    </select>
  );
  if (ctId === 'gift_card') return (
    <div className="flex gap-2" onClick={e => e?.stopPropagation()}>
      <input type="number" placeholder="Monto ($)" value={details?.amount || ''} onChange={e => onUpdate('amount', e?.target?.value)}
        className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
      <select value={details?.validity || '30'} onChange={e => onUpdate('validity', e?.target?.value)}
        className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none">
        <option value="30">30 días</option><option value="60">60 días</option><option value="90">90 días</option><option value="180">6 meses</option>
      </select>
    </div>
  );
  if (ctId === 'experience') return (
    <input type="text" placeholder="Nombre de la experiencia" value={details?.experienceName || ''} onChange={e => onUpdate('experienceName', e?.target?.value)}
      className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" onClick={e => e?.stopPropagation()} />
  );
  if (ctId === 'custom') return (
    <textarea placeholder="Describe el beneficio personalizado..." value={details?.description || ''} onChange={e => onUpdate('description', e?.target?.value)}
      rows={2} className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none" onClick={e => e?.stopPropagation()} />
  );
  return null;
};

// ─── STEP REWARD BLOCK ────────────────────────────────────────────────────────
const StepRewardBlock = ({ stepIndex, step, identityEmoji, enablePoints, enableComplements, stepRewards, onPointsChange, onToggleComplement, onUpdateComplementDetail }) => {
  const [expanded, setExpanded] = useState(false);
  const rewards = stepRewards || {};
  const selectedComplements = rewards?.complements || [];
  const complementDetails = rewards?.complementDetails || {};
  const points = rewards?.points ?? step?.bonus ?? 0;
  const displayEmoji = identityEmoji || step?.emoji || '🔥';

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{displayEmoji}</span>
          <div className="text-left">
            <p className="font-semibold text-sm text-foreground">
              Escalón {stepIndex + 1}: {step?.name || `Visita #${step?.visit}`}
              <span className="ml-2 text-xs font-normal text-muted-foreground">({step?.visit} visitas consecutivas)</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {enablePoints ? `${points} pts bonus` : 'Sin puntos'}
              {enableComplements && selectedComplements?.length > 0
                ? ` · ${selectedComplements?.length} recompensa${selectedComplements?.length > 1 ? 's' : ''} extra`
                : ''}
            </p>
          </div>
        </div>
        <Icon name={expanded ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground flex-shrink-0" />
      </button>
      {expanded && (
        <div className="p-4 space-y-4 bg-card">
          {enablePoints && (
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">Puntos bonus al alcanzar este escalón</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={points}
                  onChange={e => onPointsChange(parseInt(e?.target?.value) || 0)}
                  className="w-28 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground text-center font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <span className="text-sm text-muted-foreground">puntos bonus</span>
                <span className="text-xs text-muted-foreground ml-1">= ${(points * POINT_VALUE_MXN)?.toFixed(2)} MXN</span>
              </div>
            </div>
          )}
          {enableComplements && (
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">Recompensas complementarias para este escalón</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COMPLEMENT_TYPES?.map(ct => {
                  const isSelected = selectedComplements?.includes(ct?.id);
                  return (
                    <div
                      key={ct?.id}
                      onClick={() => onToggleComplement(ct?.id)}
                      className={`border rounded-xl p-3 cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border hover:border-primary/40 hover:bg-muted/20'}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg flex-shrink-0">{ct?.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-semibold text-foreground">{ct?.label}</p>
                            {isSelected && (
                              <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                <Icon name="Check" size={8} className="text-white" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{ct?.description}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="mt-2 pt-2 border-t border-border/60" onClick={e => e?.stopPropagation()}>
                          <ComplementDetailFields
                            ctId={ct?.id}
                            details={complementDetails?.[ct?.id] || {}}
                            onUpdate={(field, val) => onUpdateComplementDetail(ct?.id, field, val)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {!enablePoints && !enableComplements && (
            <p className="text-xs text-muted-foreground text-center py-2">Activa puntos o recompensas complementarias arriba para configurar este escalón.</p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── EMOJI PICKER MODAL ───────────────────────────────────────────────────────
const EmojiPickerModal = ({ emojis, selected, onSelect, onClose }) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
    <div className="absolute inset-0 bg-black/40" />
    <div
      className="relative bg-card border border-border rounded-2xl shadow-2xl p-4 w-80 max-h-[80vh] flex flex-col"
      onClick={e => e?.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-foreground">Selecciona un emoji</p>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
          <Icon name="X" size={16} className="text-muted-foreground" />
        </button>
      </div>
      <div className="grid grid-cols-8 gap-1 overflow-y-auto flex-1 pr-1" style={{ maxHeight: '320px' }}>
        {emojis?.map(emoji => (
          <button
            key={emoji}
            onClick={() => { onSelect(emoji); onClose(); }}
            className={`text-xl p-1.5 rounded-lg hover:bg-muted/60 transition-colors flex items-center justify-center ${selected === emoji ? 'bg-primary/10 ring-2 ring-primary' : ''}`}
            style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif', lineHeight: 1 }}
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="border-t border-border pt-3 mt-3">
        <label className="text-xs text-muted-foreground block mb-1.5">O escribe un emoji directamente:</label>
        <input
          type="text"
          maxLength={2}
          placeholder="✍️"
          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          onChange={e => { if (e?.target?.value) { onSelect(e?.target?.value); } }}
        />
      </div>
    </div>
  </div>
);

// ─── STEP 1: IDENTIDAD ────────────────────────────────────────────────────────
const StepIdentidad = ({ config, onChange }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  return (
    <div className="space-y-6">
      {showEmojiPicker && (
        <EmojiPickerModal
          emojis={STREAK_EMOJIS}
          selected={config?.streakEmoji || '🔥'}
          onSelect={emoji => onChange('streakEmoji', emoji)}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}
      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <span className="text-2xl">🔥</span>
        <p className="text-sm text-amber-800">
          Las <strong>Rachas de Visitas</strong> premian la constancia a corto plazo con bonus progresivos.
          La racha se reinicia si el cliente deja de visitar dentro de la ventana configurada.
        </p>
      </div>
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/50 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Identidad de la racha</p>
          <p className="text-xs text-muted-foreground mt-0.5">Cómo aparece la racha en la app de tus clientes</p>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">
              Nombre de la racha <span className="text-muted-foreground font-normal">(máx. 25 caracteres)</span>
            </label>
            <input
              type="text"
              maxLength={25}
              value={config?.streakName || 'Racha de Visitas'}
              onChange={e => onChange('streakName', e?.target?.value)}
              placeholder="Racha de Visitas"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {(config?.streakName || 'Racha de Visitas')?.length}/25 · Aparece como: "{config?.streakEmoji || '🔥'} {config?.streakName || 'Racha de Visitas'}: 7 visitas consecutivas"
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Emoji de la racha</label>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(true)}
              className="flex items-center gap-3 border border-border rounded-lg px-3 py-2.5 text-sm bg-background hover:bg-muted/30 transition-colors w-full"
            >
              <span className="text-2xl leading-none" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif' }}>
                {config?.streakEmoji || '🔥'}
              </span>
              <span className="text-foreground flex-1 text-left text-sm">Emoji seleccionado</span>
              <Icon name="Smile" size={16} className="text-muted-foreground" />
            </button>
            <p className="text-xs text-muted-foreground mt-1">Sugerencias: 💪 gym · ☕ café · ✂️ salón · 🍕 restaurante</p>
          </div>
        </div>
      </div>
      {/* Preview */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-sm font-medium text-amber-800 mb-3">{config?.streakEmoji || '🔥'} Vista previa en app B2C</p>
        <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-amber-200">
          <span className="text-3xl">{config?.streakEmoji || '🔥'}</span>
          <div>
            <p className="text-sm font-semibold text-amber-900">{config?.streakName || 'Racha de Visitas'}: 4 visitas consecutivas</p>
            <p className="text-xs text-amber-700">1 visita más para +{(config?.streakSteps || DEFAULT_STREAK)?.find(s => s?.visit === 5)?.bonus || 20} puntos bonus</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── STEP 2: ESCALONES ────────────────────────────────────────────────────────
const StepEscalones = ({ config, onChange }) => {
  const steps = config?.streakSteps || DEFAULT_STREAK;
  const identityEmoji = config?.streakEmoji || '🔥';
  const [expandedStep, setExpandedStep] = useState(null);

  const updateStep = (i, field, val) => {
    const s = [...steps];
    s[i] = { ...s?.[i], [field]: val };
    onChange('streakSteps', s);
  };

  const addStep = () => {
    if (steps?.length < 10) {
      const lastVisit = steps?.[steps?.length - 1]?.visit || 0;
      const lastBonus = steps?.[steps?.length - 1]?.bonus || 0;
      onChange('streakSteps', [...steps, {
        visit: lastVisit + 2,
        bonus: lastBonus + 10,
        name: `Escalón ${steps?.length + 1}`,
        emoji: STEP_EMOJIS?.[steps?.length] || '🎯',
        description: 'Descripción del escalón',
      }]);
    }
  };

  const removeStep = (i) => {
    if (steps?.length > 2) {
      onChange('streakSteps', steps?.filter((_, idx) => idx !== i));
      if (expandedStep === i) setExpandedStep(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Steps list */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/50 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Escalones de racha ({steps?.length}/10)</p>
            <p className="text-xs text-muted-foreground mt-0.5">Configura cada escalón: visitas requeridas, nombre, emoji y descripción</p>
          </div>
          <p className="text-xs text-muted-foreground">Mín. 2 · Máx. 10</p>
        </div>
        <div className="divide-y divide-border">
          {steps?.map((step, i) => (
            <div key={i} className="bg-card">
              {/* Step header row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-xl flex-shrink-0">{identityEmoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{step?.name || `Escalón ${i + 1}`}</span>
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">Visita #{step?.visit}</span>
                    <span className="text-xs px-2 py-0.5 bg-success/10 text-success rounded-full font-medium">+{step?.bonus} pts</span>
                  </div>
                  {step?.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{step?.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                    className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon name={expandedStep === i ? 'ChevronUp' : 'ChevronDown'} size={14} />
                  </button>
                  <button
                    onClick={() => removeStep(i)}
                    disabled={steps?.length <= 2}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive disabled:opacity-30 transition-colors"
                  >
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
              </div>

              {/* Expanded config */}
              {expandedStep === i && (
                <div className="px-4 pb-4 pt-1 bg-muted/10 border-t border-border space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Visit number */}
                    <div>
                      <label className="text-xs font-medium text-foreground block mb-1">Visita consecutiva #</label>
                      <input
                        type="number" min="1"
                        value={step?.visit}
                        onChange={e => updateStep(i, 'visit', parseInt(e?.target?.value) || 1)}
                        className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    {/* Identity emoji display */}
                    <div>
                      <label className="text-xs font-medium text-foreground block mb-1">Emoji del escalón</label>
                      <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-muted/20">
                        <span className="text-xl">{identityEmoji}</span>
                        <span className="text-xs text-muted-foreground">Usa el emoji de identidad de la racha</span>
                      </div>
                    </div>
                    {/* Name */}
                    <div>
                      <label className="text-xs font-medium text-foreground block mb-1">Nombre del escalón</label>
                      <input
                        type="text" maxLength={30}
                        value={step?.name || ''}
                        onChange={e => updateStep(i, 'name', e?.target?.value)}
                        placeholder={`Escalón ${i + 1}`}
                        className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <p className="text-xs text-muted-foreground mt-0.5">{(step?.name || '')?.length}/30</p>
                    </div>
                  </div>
                  {/* Description */}
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Mensaje motivacional <span className="font-normal text-muted-foreground">(aparece en la app del cliente)</span></label>
                    <input
                      type="text" maxLength={60}
                      value={step?.description || ''}
                      onChange={e => updateStep(i, 'description', e?.target?.value)}
                      placeholder="ej: ¡Llevas 5 visitas seguidas! Sigue así."
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <p className="text-xs text-muted-foreground mt-0.5">{(step?.description || '')?.length}/60</p>
                  </div>
                  {/* Preview */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs font-medium text-amber-700 mb-1">Vista previa en app:</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{identityEmoji}</span>
                      <div>
                        <p className="text-sm font-semibold text-amber-900">{step?.name || `Escalón ${i + 1}`} — +{step?.bonus} pts</p>
                        <p className="text-xs text-amber-700">{step?.description || 'Mensaje motivacional aquí'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        {steps?.length < 10 && (
          <button onClick={addStep} className="w-full p-3 text-sm text-primary hover:bg-primary/5 flex items-center justify-center gap-2 border-t border-border transition-colors">
            <Icon name="Plus" size={14} /> Agregar escalón
          </button>
        )}
      </div>

      {/* Visual summary */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/50 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Resumen visual de escalones</p>
        </div>
        <div className="p-4">
          <div className="flex items-end gap-2 overflow-x-auto pb-2">
            {steps?.map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-1 min-w-[56px]">
                <span className="text-xs font-bold text-primary">+{step?.bonus}</span>
                <div
                  className="w-10 bg-primary/20 rounded-t-lg flex items-end justify-center border border-primary/30"
                  style={{ height: `${Math.max(24, Math.min(80, (step?.bonus / (steps?.[steps?.length - 1]?.bonus || 1)) * 80))}px` }}
                >
                  <span className="text-base pb-1">{identityEmoji}</span>
                </div>
                <span className="text-xs text-muted-foreground">#{step?.visit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plateau */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/50 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Plateau en el escalón máximo</p>
          <p className="text-xs text-muted-foreground mt-0.5">Qué pasa cuando el cliente supera el último escalón configurado.</p>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Mantener el bonus máximo indefinidamente después del último escalón</p>
              <p className="text-xs text-muted-foreground mt-1">
                {config?.plateauActive !== false
                  ? `El cliente que pasó la visita ${steps?.[steps?.length - 1]?.visit || 15} sigue recibiendo +${steps?.[steps?.length - 1]?.bonus || 100} pts en cada visita siguiente.`
                  : `Después del último escalón no hay más bonus hasta que se configure uno nuevo.`
                }
              </p>
            </div>
            <Toggle value={config?.plateauActive !== false} onChange={v => onChange('plateauActive', v)} />
          </div>
        </div>
      </div>

      {/* Daily bonus limit */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/50 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Límite de bonus de racha por día</p>
          <p className="text-xs text-muted-foreground mt-0.5">Para negocios con beacon o geofence automático donde el cliente puede hacer múltiples check-ins en un día.</p>
        </div>
        <div className="p-4">
          <label className="text-sm font-medium text-foreground block mb-2">Máximo bonus de racha por día por cliente:</label>
          <div className="flex gap-2">
            {[
              { value: 1, label: '1 (recomendado)' },
              { value: 2, label: '2' },
              { value: 0, label: 'Ilimitado' },
            ]?.map(opt => (
              <button
                key={opt?.value}
                onClick={() => onChange('dailyBonusLimit', opt?.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${(config?.dailyBonusLimit ?? 1) === opt?.value ? 'bg-primary text-white border-primary' : 'border-border text-foreground hover:bg-muted/30'}`}
              >
                {opt?.label}
              </button>
            ))}
          </div>
          {(config?.dailyBonusLimit ?? 1) === 0 && (
            <div className="flex items-start gap-2 mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
              <Icon name="AlertTriangle" size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700">Sin límite puede generar acumulación excesiva de bonus en negocios con check-in automático.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── STEP 3: RECOMPENSAS ──────────────────────────────────────────────────────
const StepRecompensas = ({ config, onChange }) => {
  const steps = config?.streakSteps || DEFAULT_STREAK;
  const identityEmoji = config?.streakEmoji || '🔥';
  const enablePoints = config?.enablePoints !== false;
  const enableComplements = config?.enableComplements || false;
  // Per-step rewards: { 0: { points: 5, complements: ['coupon'], complementDetails: { coupon: {...} } }, ... }
  const stepRewards = config?.stepRewards || {};

  const updateStepPoints = (stepIndex, val) => {
    const prev = stepRewards?.[stepIndex] || {};
    onChange('stepRewards', { ...stepRewards, [stepIndex]: { ...prev, points: val } });
  };

  const toggleStepComplement = (stepIndex, ctId) => {
    const prev = stepRewards?.[stepIndex] || {};
    const current = prev?.complements || [];
    const next = current?.includes(ctId) ? current?.filter(c => c !== ctId) : [...current, ctId];
    onChange('stepRewards', { ...stepRewards, [stepIndex]: { ...prev, complements: next } });
  };

  const updateStepComplementDetail = (stepIndex, ctId, field, val) => {
    const prev = stepRewards?.[stepIndex] || {};
    const prevDetails = prev?.complementDetails || {};
    const prevCt = prevDetails?.[ctId] || {};
    onChange('stepRewards', {
      ...stepRewards,
      [stepIndex]: {
        ...prev,
        complementDetails: { ...prevDetails, [ctId]: { ...prevCt, [field]: val } },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/50 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Configuración de recompensas</p>
          <p className="text-xs text-muted-foreground mt-0.5">Activa qué tipo de recompensas otorga el sistema al alcanzar cada escalón de racha</p>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground flex items-center gap-2"><span>⭐</span> Puntos por escalón</p>
              <p className="text-xs text-muted-foreground mt-0.5">Otorga puntos de lealtad al alcanzar cada escalón de racha</p>
            </div>
            <Toggle value={enablePoints} onChange={v => onChange('enablePoints', v)} />
          </div>
          <div className="border-t border-border pt-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground flex items-center gap-2"><span>🎁</span> Recompensas complementarias</p>
              <p className="text-xs text-muted-foreground mt-0.5">Además de puntos, otorga otros beneficios al alcanzar escalones</p>
            </div>
            <Toggle value={enableComplements} onChange={v => onChange('enableComplements', v)} />
          </div>
          {enablePoints && (
            <div className="border-t border-border pt-3 flex items-start gap-2 p-3 bg-blue-50 border-blue-200 rounded-lg">
              <Icon name="Info" size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-800">Los puntos configurados aquí son <strong>adicionales</strong> al bonus base de cada escalón. Puedes dejar el valor en 0 para usar solo el bonus base.</p>
            </div>
          )}
        </div>
      </div>

      {/* Per-step reward blocks */}
      {(enablePoints || enableComplements) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Recompensas por escalón</p>
            <p className="text-xs text-muted-foreground">{steps?.length} escalones configurados</p>
          </div>
          {steps?.map((step, i) => (
            <StepRewardBlock
              key={i}
              stepIndex={i}
              step={step}
              identityEmoji={identityEmoji}
              enablePoints={enablePoints}
              enableComplements={enableComplements}
              stepRewards={stepRewards?.[i]}
              onPointsChange={val => updateStepPoints(i, val)}
              onToggleComplement={ctId => toggleStepComplement(i, ctId)}
              onUpdateComplementDetail={(ctId, field, val) => updateStepComplementDetail(i, ctId, field, val)}
            />
          ))}
        </div>
      )}

      {!enablePoints && !enableComplements && (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-xl">
          <span className="text-4xl mb-3">🎁</span>
          <p className="text-sm font-medium text-foreground">Sin recompensas configuradas</p>
          <p className="text-xs text-muted-foreground mt-1">Activa puntos o recompensas complementarias para configurar los beneficios por escalón.</p>
        </div>
      )}

      {/* Summary */}
      {(enablePoints || enableComplements) && (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="bg-muted/50 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Resumen de recompensas</p>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {steps?.map((step, i) => {
                const rewards = stepRewards?.[i] || {};
                const pts = rewards?.points ?? step?.bonus ?? 0;
                const complements = rewards?.complements || [];
                return (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                    <span className="text-lg">{config?.streakEmoji || '🔥'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{step?.name || `Escalón ${i + 1}`} <span className="text-muted-foreground font-normal">(visita #{step?.visit})</span></p>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        {enablePoints && <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">+{pts} pts</span>}
                        {enableComplements && complements?.map(ctId => {
                          const ct = COMPLEMENT_TYPES?.find(c => c?.id === ctId);
                          return ct ? <span key={ctId} className="text-xs px-1.5 py-0.5 bg-success/10 text-success rounded font-medium">{ct?.icon} {ct?.label}</span> : null;
                        })}
                        {!enablePoints && (!enableComplements || complements?.length === 0) && (
                          <span className="text-xs text-muted-foreground">Sin recompensas adicionales</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── STEP 4: VENTANA Y REGLAS ─────────────────────────────────────────────────
const StepVentana = ({ config, onChange }) => {
  const streakWindow = config?.streakWindow || 7;
  const recommendedWindow = AVG_VISIT_FREQUENCY + 2;

  return (
    <div className="space-y-6">
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/50 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Ventana de racha (días)</p>
          <p className="text-xs text-muted-foreground mt-0.5">Define cuántos días puede pasar el cliente sin visitar antes de que la racha se resetee a cero.</p>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-foreground whitespace-nowrap">La racha se rompe si el cliente no visita en</span>
            <input
              type="number" min="3" max="30"
              value={streakWindow}
              onChange={e => onChange('streakWindow', Math.min(30, Math.max(3, parseInt(e?.target?.value) || 7)))}
              className="w-16 border border-border rounded px-2 py-1 text-sm bg-background text-foreground text-center font-semibold"
            />
            <span className="text-sm text-foreground">días.</span>
          </div>
          <input
            type="range" min="3" max="30" value={streakWindow}
            onChange={e => onChange('streakWindow', parseInt(e?.target?.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>3 días (estricto)</span>
            <span className="font-semibold text-primary">{streakWindow} días seleccionados</span>
            <span>30 días (flexible)</span>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg text-xs bg-blue-50 border border-blue-200 text-blue-800">
            <Icon name="Info" size={14} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>
              Tu cliente promedio visita cada <strong>{AVG_VISIT_FREQUENCY} días</strong>.
              Recomendamos ventana de <strong>{recommendedWindow} días</strong> para dar margen sin perder urgencia.
              {streakWindow < recommendedWindow && <span className="text-amber-700 font-medium"> Tu ventana actual ({streakWindow} días) es más estricta que lo recomendado.</span>}
              {streakWindow > recommendedWindow + 3 && <span className="text-amber-700 font-medium"> Tu ventana actual ({streakWindow} días) es muy flexible — puede reducir la urgencia.</span>}
            </span>
          </div>
        </div>
      </div>
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/50 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Comportamiento al romper la racha</p>
          <p className="text-xs text-muted-foreground mt-0.5">Qué sucede exactamente cuando el cliente no visita dentro de la ventana.</p>
        </div>
        <div className="p-4 space-y-3">
          <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${(config?.breakBehavior || 'reset') === 'reset' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/20'}`}>
            <input type="radio" name="breakBehavior" value="reset" checked={(config?.breakBehavior || 'reset') === 'reset'} onChange={() => onChange('breakBehavior', 'reset')} className="mt-0.5 accent-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Reiniciar a 0 — el cliente vuelve al escalón base.</p>
              <p className="text-xs text-muted-foreground mt-0.5">Modo más punitivo. Genera mayor urgencia de no perder la racha. <span className="text-primary font-medium">Recomendado.</span></p>
            </div>
          </label>
          <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${config?.breakBehavior === 'downgrade' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/20'}`}>
            <input type="radio" name="breakBehavior" value="downgrade" checked={config?.breakBehavior === 'downgrade'} onChange={() => onChange('breakBehavior', 'downgrade')} className="mt-0.5 accent-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Bajar un escalón — el cliente pierde un nivel pero no todo.</p>
              <p className="text-xs text-muted-foreground mt-0.5">Más suave. Menos frustrante para clientes que fallan por poco.</p>
            </div>
          </label>
        </div>
      </div>
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/50 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Bonus de restauración</p>
          <p className="text-xs text-muted-foreground mt-0.5">Incentivo para el regreso tras romper la racha.</p>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Si el cliente rompe la racha pero regresa en los siguientes días, recibe un bonus de regreso</p>
              <p className="text-xs text-muted-foreground mt-0.5">El cliente recibe el bonus + notificación al regresar dentro del período de gracia.</p>
            </div>
            <Toggle value={config?.restorationActive || false} onChange={v => onChange('restorationActive', v)} />
          </div>
          {config?.restorationActive && (
            <div className="pl-4 border-l-2 border-emerald-400/50 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Bonus de regreso (puntos)</label>
                  <input
                    type="number" min="1"
                    value={config?.restorationBonus || 50}
                    onChange={e => onChange('restorationBonus', parseInt(e?.target?.value) || 50)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">= ${((config?.restorationBonus || 50) * POINT_VALUE_MXN)?.toFixed(2)} MXN</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Días de gracia (1–7)</label>
                  <input
                    type="number" min="1" max="7"
                    value={config?.restorationGraceDays || 3}
                    onChange={e => onChange('restorationGraceDays', Math.min(7, Math.max(1, parseInt(e?.target?.value) || 3)))}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Días después de romper la racha</p>
                </div>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-xs font-medium text-emerald-800 mb-1">Notificación al regresar:</p>
                <p className="text-sm text-emerald-900">¡Volviste! Aquí van <strong>{config?.restorationBonus || 50} puntos</strong> de bienvenida. Tu racha reinicia desde 1.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── STEP 5: NOTIFICACIONES ───────────────────────────────────────────────────
const StepNotificaciones = ({ config, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/50 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Notificación de racha en riesgo</p>
          <p className="text-xs text-muted-foreground mt-0.5">Uno de los pushes con mayor tasa de conversión — la urgencia de perder algo ya ganado.</p>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Avisar al cliente cuando su racha está a punto de romperse</p>
              <p className="text-xs text-muted-foreground mt-0.5">Envía push automático antes de que venza la ventana de racha.</p>
            </div>
            <Toggle value={config?.notifyRisk !== false} onChange={v => onChange('notifyRisk', v)} />
          </div>
          {config?.notifyRisk !== false && (
            <div className="pl-4 border-l-2 border-primary/30 space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Días de anticipación para el aviso:</label>
                <div className="flex gap-2">
                  {[1, 2, 3]?.map(d => (
                    <button
                      key={d}
                      onClick={() => onChange('riskNotifyDays', d)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${(config?.riskNotifyDays || 1) === d ? 'bg-primary text-white border-primary' : 'border-border text-foreground hover:bg-muted/30'}`}
                    >
                      {d} día{d > 1 ? 's' : ''} antes
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <p className="text-xs font-medium text-muted-foreground mb-1">Vista previa del push:</p>
                <p className="text-sm text-foreground">
                  🔥 Tu racha de <strong>7 visitas</strong> en <strong>[tu negocio]</strong> vence en <strong>{config?.riskNotifyDays || 1} día{(config?.riskNotifyDays || 1) > 1 ? 's' : ''}</strong>. ¡No la pierdas! Visítanos antes del <strong>[fecha]</strong>.
                </p>
              </div>
            </div>
          )}
          <div className="border-t border-border pt-3 space-y-2">
            {[
              { key: 'notifyStart', label: 'Notificar al iniciar racha (2ª visita consecutiva)', default: true },
              { key: 'notifyMilestone', label: 'Notificar al alcanzar cada escalón', default: true },
              { key: 'notifyBroken', label: 'Notificar cuando la racha se rompe', default: false },
            ]?.map(item => (
              <label key={item?.key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config?.[item?.key] !== undefined ? config?.[item?.key] : item?.default}
                  onChange={e => onChange(item?.key, e?.target?.checked)}
                  className="rounded accent-primary"
                />
                <span className="text-sm text-foreground">{item?.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      {/* Summary preview */}
      <div className="border border-border rounded-xl p-5 bg-card">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="CheckCircle" size={18} className="text-success" />
          Resumen de configuración
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
            <span className="text-lg">{config?.streakEmoji || '🔥'}</span>
            <div>
              <p className="text-xs text-muted-foreground">Nombre</p>
              <p className="font-medium text-foreground">{config?.streakName || 'Racha de Visitas'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
            <Icon name="Layers" size={16} className="text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Escalones</p>
              <p className="font-medium text-foreground">{(config?.streakSteps || DEFAULT_STREAK)?.length} escalones</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
            <Icon name="Clock" size={16} className="text-amber-500" />
            <div>
              <p className="text-xs text-muted-foreground">Ventana</p>
              <p className="font-medium text-foreground">{config?.streakWindow || 7} días</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
            <Icon name="Bell" size={16} className="text-purple-500" />
            <div>
              <p className="text-xs text-muted-foreground">Notif. riesgo</p>
              <p className="font-medium text-foreground">{config?.notifyRisk !== false ? `${config?.riskNotifyDays || 1} día antes` : 'Desactivada'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
            <Icon name="Gift" size={16} className="text-success" />
            <div>
              <p className="text-xs text-muted-foreground">Recompensas</p>
              <p className="font-medium text-foreground">
                {config?.enablePoints !== false ? 'Puntos' : ''}
                {config?.enablePoints !== false && config?.enableComplements ? ' + ' : ''}
                {config?.enableComplements ? 'Complementarias' : ''}
                {!config?.enablePoints && !config?.enableComplements ? 'Solo bonus base' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN WIZARD PAGE ─────────────────────────────────────────────────────────
const VisitStreaksWizardPage = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loyaltyProgramId, setLoyaltyProgramId] = useState(null);
  const [config, setConfig] = useState({
    active: true,
    streakSteps: DEFAULT_STREAK,
    streakWindow: 7,
    streakName: 'Racha de Visitas',
    streakEmoji: '🔥',
    breakBehavior: 'reset',
    plateauActive: true,
    notifyRisk: true,
    riskNotifyDays: 1,
    notifyStart: true,
    notifyMilestone: true,
    notifyBroken: false,
    restorationActive: false,
    restorationBonus: 50,
    restorationGraceDays: 3,
    dailyBonusLimit: 1,
    enablePoints: true,
    enableComplements: false,
    stepRewards: {},
  });

  const user = {
    name: authUser?.user_metadata?.full_name || authUser?.email || 'Usuario',
    email: authUser?.email || '',
    role: authUser?.user_metadata?.role || 'owner',
  };

  // Load existing config from Supabase
  useEffect(() => {
    const loadConfig = async () => {
      if (!authUser?.id) return;
      try {
        const { data, error } = await supabase
          ?.from('loyalty_programs')
          ?.select('id, bonus_streak_enabled, bonus_streak_config')
          ?.eq('business_id', authUser?.id)
          ?.maybeSingle();
        if (!error && data) {
          setLoyaltyProgramId(data?.id);
          const raw = data?.bonus_streak_config || {};
          if (raw?.streakName || raw?.steps) {
            setConfig(prev => ({
              ...prev,
              active: data?.bonus_streak_enabled || false,
              streakName: raw?.streakName || prev?.streakName,
              streakEmoji: raw?.streakEmoji || prev?.streakEmoji,
              streakWindow: raw?.windowDays || raw?.streakWindow || prev?.streakWindow,
              breakBehavior: raw?.breakBehavior || prev?.breakBehavior,
              notifyRisk: raw?.notifyRisk ?? prev?.notifyRisk,
              riskNotifyDays: raw?.riskNotifyDays || prev?.riskNotifyDays,
              restorationActive: raw?.restorationActive ?? prev?.restorationActive,
              restorationBonus: raw?.restorationBonus || prev?.restorationBonus,
              restorationGraceDays: raw?.restorationGraceDays || prev?.restorationGraceDays,
              dailyBonusLimit: raw?.dailyBonusLimit || prev?.dailyBonusLimit,
              enablePoints: raw?.enablePoints ?? prev?.enablePoints,
              enableComplements: raw?.enableComplements ?? prev?.enableComplements,
              stepRewards: raw?.stepRewards || prev?.stepRewards,
              streakSteps: raw?.steps || raw?.streakSteps || prev?.streakSteps,
              notifyStart: raw?.notifyStart ?? prev?.notifyStart,
              notifyMilestone: raw?.notifyMilestone ?? prev?.notifyMilestone,
              notifyBroken: raw?.notifyBroken ?? prev?.notifyBroken,
              plateauActive: raw?.plateauActive ?? prev?.plateauActive,
            }));
          }
        }
      } catch (err) {
        console.error('Error loading streak config:', err);
      }
    };
    loadConfig();
  }, [authUser?.id]);

  const handleChange = (field, value) => setConfig(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!authUser?.id) return;
    setSaving(true);
    try {
      const streakConfigPayload = {
        streakName: config?.streakName,
        streakEmoji: config?.streakEmoji,
        windowDays: config?.streakWindow,
        streakWindow: config?.streakWindow,
        breakBehavior: config?.breakBehavior,
        plateauActive: config?.plateauActive,
        notifyRisk: config?.notifyRisk,
        riskNotifyDays: config?.riskNotifyDays,
        notifyStart: config?.notifyStart,
        notifyMilestone: config?.notifyMilestone,
        notifyBroken: config?.notifyBroken,
        restorationActive: config?.restorationActive,
        restorationBonus: config?.restorationBonus,
        restorationGraceDays: config?.restorationGraceDays,
        dailyBonusLimit: config?.dailyBonusLimit,
        enablePoints: config?.enablePoints,
        enableComplements: config?.enableComplements,
        stepRewards: config?.stepRewards,
        steps: config?.streakSteps,
        streakSteps: config?.streakSteps,
      };

      if (loyaltyProgramId) {
        // Update existing loyalty program
        await supabase
          ?.from('loyalty_programs')
          ?.update({
            bonus_streak_enabled: config?.active,
            bonus_streak_config: streakConfigPayload,
            updated_at: new Date()?.toISOString(),
          })
          ?.eq('id', loyaltyProgramId);
      } else {
        // Create new loyalty program record
        const { data: newProgram } = await supabase
          ?.from('loyalty_programs')
          ?.insert({
            business_id: authUser?.id,
            bonus_streak_enabled: config?.active,
            bonus_streak_config: streakConfigPayload,
          })
          ?.select('id')
          ?.single();
        if (newProgram?.id) setLoyaltyProgramId(newProgram?.id);
      }

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        navigate('/visit-streaks-management');
      }, 1500);
    } catch (err) {
      console.error('Error saving streak config:', err);
    } finally {
      setSaving(false);
    }
  };

  const progress = Math.round(((currentStep + 1) / WIZARD_STEPS?.length) * 100);

  const stepComponents = [
    <StepIdentidad config={config} onChange={handleChange} />,
    <StepEscalones config={config} onChange={handleChange} />,
    <StepRecompensas config={config} onChange={handleChange} />,
    <StepVentana config={config} onChange={handleChange} />,
    <StepNotificaciones config={config} onChange={handleChange} />,
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isMenuOpen={isSidebarOpen} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <main className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <div className="p-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <button onClick={() => navigate('/visit-streaks-management')} className="hover:text-foreground transition-colors">
              Rachas de Visitas
            </button>
            <Icon name="ChevronRight" size={14} />
            <span className="text-foreground font-medium">Configurar Rachas</span>
          </nav>

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Configurar Rachas de Visitas</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Configura el sistema de rachas paso a paso para premiar la constancia de tus clientes.
              </p>
            </div>
            <button
              onClick={() => navigate('/visit-streaks-management')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-2 transition-colors"
            >
              <Icon name="X" size={14} />
              Cancelar
            </button>
          </div>

          {/* Progress bar + Step indicators */}
          <div className="bg-card border border-border rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Progreso del wizard</span>
                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                  {WIZARD_STEPS?.[currentStep]?.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground hidden sm:block">Paso {currentStep + 1} de {WIZARD_STEPS?.length}</span>
                <span className="text-sm font-bold text-primary">{progress}%</span>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Step indicators */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {WIZARD_STEPS?.map((step, idx) => {
                const isActive = idx === currentStep;
                const isPast = idx < currentStep;
                return (
                  <React.Fragment key={step?.id}>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(idx)}
                      title={step?.label}
                      className={`flex flex-col items-center gap-1 min-w-[72px] p-2 rounded-xl transition-all ${
                        isActive ? 'bg-primary/10 text-primary' : isPast ? 'text-green-600 hover:bg-green-50 cursor-pointer' : 'text-muted-foreground hover:bg-muted cursor-pointer'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                        isActive ? 'bg-primary text-white shadow-sm' : isPast ? 'bg-green-500 text-white' : 'bg-muted'
                      }`}>
                        {isPast ? (
                          <Icon name="Check" size={14} className="text-white" />
                        ) : (
                          <Icon name={step?.icon} size={14} className={isActive ? 'text-white' : 'text-muted-foreground'} />
                        )}
                      </div>
                      <span className="text-xs font-medium text-center leading-tight whitespace-nowrap">{step?.label?.split(' ')?.[0]}</span>
                    </button>
                    {idx < WIZARD_STEPS?.length - 1 && (
                      <div className={`flex-1 h-0.5 min-w-[6px] rounded-full transition-colors ${isPast ? 'bg-green-400' : 'bg-border'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Step content */}
          <div className="">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">{WIZARD_STEPS?.[currentStep]?.label}</h2>
              <p className="text-sm text-muted-foreground">{WIZARD_STEPS?.[currentStep]?.description}</p>
            </div>
            {stepComponents?.[currentStep]}
          </div>

          {/* Navigation footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <button
              onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : navigate('/visit-streaks-management')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg px-4 py-2 transition-colors"
            >
              <Icon name="ChevronLeft" size={14} />
              {currentStep === 0 ? 'Cancelar' : 'Anterior'}
            </button>
            <div className="flex items-center gap-2">
              {WIZARD_STEPS?.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`w-2 h-2 rounded-full transition-colors ${idx === currentStep ? 'bg-primary' : idx < currentStep ? 'bg-success' : 'bg-muted'}`}
                />
              ))}
            </div>
            {currentStep < WIZARD_STEPS?.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex items-center gap-2 text-sm bg-primary text-white rounded-lg px-4 py-2 hover:bg-primary/90 transition-colors font-medium"
              >
                Siguiente
                <Icon name="ChevronRight" size={14} />
              </button>
            ) : (
              <Button onClick={handleSave} iconName={saved ? 'Check' : saving ? 'Loader2' : 'Save'} disabled={saving}>
                {saved ? 'Guardado ✓' : saving ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VisitStreaksWizardPage;
