import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchVIPConfig, fetchVIPLevels, saveVIPLevels, upsertVIPConfig,
  fetchVIPGlobalTriggers, upsertVIPGlobalTriggers,
  fetchVIPEconomicConfig, upsertVIPEconomicConfig,
  POINTS_RULES, pointsToMXN
} from '../../services/rewardsService';
import VIPLevelAutomationSection from '../rewards-management/components/VIPLevelAutomationSection';

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
const LEVEL_ICONS = ['🥉', '🥈', '🥇', '💎', '👑'];
const LEVEL_COLORS = ['#CD7F32', '#C0C0C0', '#FFD700', '#00BCD4', '#9C27B0'];

const ALL_BENEFIT_TYPES = [
  { id: 'points_multiplier', label: 'Multiplicador de puntos', icon: '✖️' },
  { id: 'discount', label: 'Descuento permanente', icon: '🏷️' },
  { id: 'early_access', label: 'Acceso anticipado a promos', icon: '⚡' },
  { id: 'free_product', label: 'Producto periódico gratuito', icon: '🎁' },
  { id: 'welcome_points', label: 'Puntos de bienvenida al subir', icon: '🎉' },
  { id: 'priority_reservation', label: 'Reservación prioritaria sin espera', icon: '📅' },
  { id: 'exclusive_service', label: 'Servicio exclusivo o personalizado', icon: '⭐' },
  { id: 'exclusive_events', label: 'Invitación a eventos exclusivos', icon: '🎭' },
  { id: 'punch_card_reduction', label: 'Punch card con menos sellos', icon: '🃏' },
  { id: 'exclusive_geofence', label: 'Geofence exclusivo (anticipado)', icon: '📍' },
  { id: 'prepaid_cashback', label: 'Cashback mejorado en tarjeta prepago', icon: '💳' },
  { id: 'custom', label: 'Beneficio exclusivo personalizado', icon: '🌟' },
];

const CRITERIA_OPTIONS = [
  { id: 'visits', label: 'Por visitas acumuladas', desc: 'Total histórico de visitas. El contador nunca baja.', unit: 'visitas', placeholder: 'Ej: 10', suggestions: [0, 10, 25] },
  { id: 'points_historical', label: 'Por puntos acumulados históricamente', desc: 'Total de puntos ganados en toda la historia (no el saldo actual).', unit: 'puntos históricos', placeholder: 'Ej: 500', suggestions: [0, 500, 2000] },
  { id: 'spend', label: 'Por gasto acumulado en MXN', desc: 'Total de dinero gastado históricamente.', unit: 'MXN acumulados', prefix: '$', placeholder: 'Ej: 2000', suggestions: [0, 2000, 8000] },
  { id: 'combo', label: 'Por combinación (visitas + puntos)', desc: 'El cliente debe cumplir dos condiciones simultáneamente.', unit: 'visitas + puntos', isCombo: true, suggestions: [0, 8, 20] },
  { id: 'punch_cards', label: 'Por punch cards completadas', desc: 'El nivel sube al completar N punch cards.', unit: 'punch cards completadas', placeholder: 'Ej: 2', suggestions: [0, 2, 7] },
  { id: 'period_active', label: 'Por periodo activo (frecuencia en ventana de tiempo)', desc: 'El cliente debe haber visitado X veces en los últimos Y días.', unit: 'visitas en ventana', isPeriod: true, suggestions: [0, 3, 8] },
  { id: 'engagement_score', label: 'Por score de engagement (0-100)', desc: 'Basado en el score del CRM que integra visitas, gasto, interacciones.', unit: 'score', isScore: true, suggestions: [0, 40, 70] },
];

const LEVEL_TABS = [
  { id: 'criterio', label: 'Criterio', icon: 'Target' },
  { id: 'beneficios', label: 'Beneficios', icon: 'Gift' },
  { id: 'automatizaciones', label: 'Automatizaciones', icon: 'Zap' },
  { id: 'triggers', label: 'Triggers', icon: 'Bell' },
];

const defaultLevels = [
  {
    id: 'default-1', name: 'Bronce', icon: '🥉', color: '#CD7F32',
    threshold: 0, clients: 0,
    benefits: [{ id: 'b1', type: 'welcome_points', value: `50 puntos al registrarse (= $${pointsToMXN(50)} MXN)` }],
    automation: {}, maintenanceTrigger: {}, downgradeTrigger: {}, proximityTrigger: {},
    triggers: { onUpgrade: true, onDowngrade: false, onNearNext: false, notifyChannel: 'push', customMessage: '' },
  },
  {
    id: 'default-2', name: 'Plata', icon: '🥈', color: '#C0C0C0',
    threshold: 10, clients: 0,
    benefits: [
      { id: 'b2', type: 'points_multiplier', value: '×1.25 puntos en cada compra' },
      { id: 'b3', type: 'discount', value: '5% en todas las compras' },
      { id: 'b4', type: 'welcome_points', value: `+100 puntos al alcanzar Plata (= $${pointsToMXN(100)} MXN)` },
    ],
    automation: {}, maintenanceTrigger: {}, downgradeTrigger: {}, proximityTrigger: {},
    triggers: { onUpgrade: true, onDowngrade: false, onNearNext: true, notifyChannel: 'push', customMessage: '' },
  },
  {
    id: 'default-3', name: 'Oro', icon: '🥇', color: '#FFD700',
    threshold: 25, clients: 0,
    benefits: [
      { id: 'b5', type: 'points_multiplier', value: '×1.5 puntos en cada compra' },
      { id: 'b6', type: 'discount', value: '10% en todas las compras' },
      { id: 'b7', type: 'early_access', value: 'Promos 24h antes que el público' },
      { id: 'b8', type: 'free_product', value: '1 café gratis por semana' },
      { id: 'b9', type: 'welcome_points', value: `+300 puntos al alcanzar Oro (= $${pointsToMXN(300)} MXN)` },
    ],
    automation: {}, maintenanceTrigger: {}, downgradeTrigger: {}, proximityTrigger: {},
    triggers: { onUpgrade: true, onDowngrade: true, onNearNext: true, notifyChannel: 'push_whatsapp', customMessage: '' },
  },
];

// ─── TOGGLE ────────────────────────────────────────────────────────────────────
const Toggle = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative ${value ? 'bg-primary' : 'bg-muted'}`}
  >
    <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
  </button>
);

// ─── LEVEL CRITERIO TAB ────────────────────────────────────────────────────────
const LevelCriterioTab = ({ level, levelIndex, criterion, onUpdate }) => {
  const criteriaInfo = CRITERIA_OPTIONS?.find(c => c?.id === criterion);

  if (levelIndex === 0) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-muted/30 rounded-xl flex items-center gap-3">
          <span className="text-2xl">{level?.icon}</span>
          <div>
            <p className="font-semibold text-foreground">{level?.name} — Nivel base</p>
            <p className="text-sm text-muted-foreground">Este es el nivel de entrada. Todos los clientes comienzan aquí automáticamente.</p>
          </div>
        </div>
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
          <Icon name="Info" size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            El criterio de ascenso aplica a todos los niveles y se configura en la sección de <strong>Configuraciones Globales</strong>. El nivel base no requiere umbral de entrada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted/30 rounded-xl">
        <p className="text-sm font-medium text-foreground mb-1">Criterio activo del programa</p>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-warning/10 border border-warning/20 text-warning text-sm font-medium rounded-lg">
            {criteriaInfo?.label || criterion}
          </span>
          <span className="text-xs text-muted-foreground">— Configurable en Configuraciones Globales</span>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-foreground">Umbral de entrada a {level?.name}</label>

        {criterion === 'combo' ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Visitas mínimas</label>
              <input
                type="number" min="1"
                value={level?.threshold || 0}
                onChange={e => onUpdate(level?.id, { threshold: parseInt(e?.target?.value) || 0 })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Puntos históricos</label>
              <input
                type="number" min="1"
                value={level?.thresholdPoints || 0}
                onChange={e => onUpdate(level?.id, { thresholdPoints: parseInt(e?.target?.value) || 0 })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        ) : criterion === 'period_active' ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Visitas requeridas</label>
              <input
                type="number" min="1"
                value={level?.threshold || 0}
                onChange={e => onUpdate(level?.id, { threshold: parseInt(e?.target?.value) || 0 })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">En los últimos (días)</label>
              <input
                type="number" min="7"
                value={level?.periodDays || 30}
                onChange={e => onUpdate(level?.id, { periodDays: parseInt(e?.target?.value) || 30 })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {criteriaInfo?.prefix && <span className="text-sm text-muted-foreground">{criteriaInfo?.prefix}</span>}
            <input
              type="number" min="1"
              value={level?.threshold || 0}
              onChange={e => onUpdate(level?.id, { threshold: parseInt(e?.target?.value) || 0 })}
              className="w-40 px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <span className="text-sm text-muted-foreground">{criteriaInfo?.unit || 'unidades'}</span>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Los clientes que alcancen este umbral subirán automáticamente a <strong>{level?.name}</strong>.
        </p>
      </div>

      {/* Maintenance config */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <p className="text-sm font-semibold text-foreground">Mantenimiento del nivel</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Actividad mínima para mantener el nivel</p>
            <p className="text-xs text-muted-foreground">Solo aplica si la evaluación periódica está activa (ver Configuraciones Globales)</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number" min="1"
              value={level?.minActivityToKeep || ''}
              onChange={e => onUpdate(level?.id, { minActivityToKeep: parseInt(e?.target?.value) || 0 })}
              placeholder="Ej: 3"
              className="w-20 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
            />
            <span className="text-xs text-muted-foreground">visitas/período</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── LEVEL BENEFICIOS TAB ──────────────────────────────────────────────────────
const LevelBeneficiosTab = ({ level, onUpdate }) => {
  const [newBenefitType, setNewBenefitType] = useState('points_multiplier');
  const [newBenefitValue, setNewBenefitValue] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = () => {
    if (!newBenefitValue?.trim()) return;
    const benefit = { id: `b-${Date.now()}`, type: newBenefitType, value: newBenefitValue };
    onUpdate(level?.id, { benefits: [...(level?.benefits || []), benefit] });
    setNewBenefitValue('');
    setShowAdd(false);
  };

  const handleRemove = (benefitId) => {
    onUpdate(level?.id, { benefits: level?.benefits?.filter(b => b?.id !== benefitId) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Beneficios de {level?.name}</p>
        <span className="text-xs text-muted-foreground">{level?.benefits?.length || 0} beneficio(s)</span>
      </div>

      {level?.benefits?.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-xl">
          <Icon name="Gift" size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Sin beneficios configurados</p>
          <p className="text-xs mt-1">Agrega beneficios para motivar a los clientes a alcanzar este nivel</p>
        </div>
      )}

      <div className="space-y-2">
        {level?.benefits?.map(benefit => {
          const bType = ALL_BENEFIT_TYPES?.find(b => b?.id === benefit?.type);
          return (
            <div key={benefit?.id} className="flex items-start gap-3 p-3 bg-muted/40 rounded-xl group">
              <span className="text-lg">{bType?.icon || '⭐'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{bType?.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{benefit?.value}</p>
              </div>
              <button
                onClick={() => handleRemove(benefit?.id)}
                className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <Icon name="Trash2" size={14} className="text-destructive" />
              </button>
            </div>
          );
        })}
      </div>

      {showAdd ? (
        <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-3">
          <p className="text-sm font-medium text-foreground">Nuevo beneficio</p>
          <select
            value={newBenefitType}
            onChange={e => setNewBenefitType(e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
          >
            {ALL_BENEFIT_TYPES?.map(bt => (
              <option key={bt?.id} value={bt?.id}>{bt?.icon} {bt?.label}</option>
            ))}
          </select>
          <input
            type="text"
            value={newBenefitValue}
            onChange={e => setNewBenefitValue(e?.target?.value)}
            placeholder={newBenefitType === 'welcome_points' ? `Ej: +100 puntos (= $${pointsToMXN(100)} MXN)` : 'Describe el beneficio...'}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
          />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              Agregar beneficio
            </button>
            <button onClick={() => setShowAdd(false)} className="flex-1 py-2 bg-muted text-muted-foreground rounded-lg text-sm hover:bg-muted/80 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-3 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
        >
          <Icon name="Plus" size={16} />
          Agregar beneficio
        </button>
      )}

      {/* Quick suggestions */}
      <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl">
        <p className="text-xs font-medium text-foreground mb-2">💡 Sugerencias rápidas</p>
        <div className="flex flex-wrap gap-2">
          {[
            { type: 'points_multiplier', value: '×1.5 puntos en cada compra' },
            { type: 'discount', value: '10% en todas las compras' },
            { type: 'welcome_points', value: `+200 puntos al alcanzar ${level?.name} (= $${pointsToMXN(200)} MXN)` },
          ]?.map((s, i) => {
            const bType = ALL_BENEFIT_TYPES?.find(b => b?.id === s?.type);
            return (
              <button
                key={i}
                onClick={() => onUpdate(level?.id, { benefits: [...(level?.benefits || []), { id: `b-${Date.now()}-${i}`, ...s }] })}
                className="px-2 py-1 bg-white border border-border rounded-lg text-xs text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {bType?.icon} {s?.value}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── LEVEL AUTOMATIZACIONES TAB ────────────────────────────────────────────────
const LevelAutomatizacionesTab = ({ level, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-muted/30 rounded-xl flex items-start gap-2">
        <Icon name="Info" size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          Configura las automatizaciones específicas para el nivel <strong>{level?.name}</strong>: mensajes de ascenso, mantenimiento y descenso.
        </p>
      </div>
      <VIPLevelAutomationSection
        levelName={level?.name}
        levelIndex={0}
        automation={level?.automation || {}}
        maintenanceTrigger={level?.maintenanceTrigger || {}}
        downgradeTrigger={level?.downgradeTrigger || {}}
        proximityTrigger={level?.proximityTrigger || {}}
        onChange={(newAutomation) => onUpdate(level?.id, { automation: newAutomation })}
        onMaintenanceChange={(cfg) => onUpdate(level?.id, { maintenanceTrigger: cfg })}
        onDowngradeChange={(cfg) => onUpdate(level?.id, { downgradeTrigger: cfg })}
        onProximityChange={(cfg) => onUpdate(level?.id, { proximityTrigger: cfg })}
      />
    </div>
  );
};

// ─── LEVEL TRIGGERS TAB ────────────────────────────────────────────────────────
const LevelTriggersTab = ({ level, onUpdate }) => {
  const triggers = level?.triggers || {};
  const set = (k, v) => onUpdate(level?.id, { triggers: { ...triggers, [k]: v } });

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Define qué eventos disparan notificaciones y acciones específicas para el nivel <strong>{level?.name}</strong>.
      </p>

      <div className="space-y-3">
        {[
          { id: 'onUpgrade', label: 'Al alcanzar este nivel', desc: 'Notificar y ejecutar acciones cuando el cliente sube a este nivel', icon: '🚀' },
          { id: 'onDowngrade', label: 'Al perder este nivel', desc: 'Notificar cuando el cliente baja desde este nivel', icon: '📉' },
          { id: 'onNearNext', label: 'Próximo al siguiente nivel', desc: 'Motivar al cliente cuando está cerca de subir al siguiente nivel', icon: '🎯' },
          { id: 'onAnniversary', label: 'Aniversario en el nivel', desc: 'Celebrar cada año que el cliente mantiene este nivel', icon: '🎂' },
        ]?.map(trigger => (
          <div key={trigger?.id} className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
            <span className="text-xl">{trigger?.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{trigger?.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{trigger?.desc}</p>
            </div>
            <Toggle value={triggers?.[trigger?.id] || false} onChange={v => set(trigger?.id, v)} />
          </div>
        ))}
      </div>

      {/* Notification channel */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <p className="text-sm font-semibold text-foreground">Canal de notificación para {level?.name}</p>
        <select
          value={triggers?.notifyChannel || 'push'}
          onChange={e => set('notifyChannel', e?.target?.value)}
          className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
        >
          <option value="push">Push notification</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="push_whatsapp">Push + WhatsApp</option>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
        </select>
      </div>

      {/* Custom message */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <p className="text-sm font-semibold text-foreground">Mensaje personalizado al subir a {level?.name}</p>
        <textarea
          value={triggers?.customMessage || ''}
          onChange={e => set('customMessage', e?.target?.value)}
          placeholder={`Ej: ¡Felicidades {nombre}! Ahora eres ${level?.name} en {negocio}. Disfruta tus nuevos beneficios exclusivos.`}
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none resize-none"
        />
        <p className="text-xs text-muted-foreground">Variables disponibles: {'{nombre}'} {'{nivel}'} {'{negocio}'} {'{beneficios}'}</p>
      </div>
    </div>
  );
};

// ─── GLOBAL SETTINGS SECTION ───────────────────────────────────────────────────
const GlobalSettingsSection = ({
  criterion, setCriterion,
  comboConfig, setComboConfig,
  periodConfig, setPeriodConfig,
  scoreConfig, setScoreConfig,
  evaluationType, setEvaluationType,
  evalFrequency, setEvalFrequency,
  evalMinActivity, setEvalMinActivity,
  warningDaysBefore, setWarningDaysBefore,
  gracePeriodEnabled, setGracePeriodEnabled,
  gracePeriodDays, setGracePeriodDays,
  globalTriggers, setGlobalTriggers,
  avgTicket, setAvgTicket,
  avgVisits, setAvgVisits,
  levels,
}) => {
  const [activeGlobalTab, setActiveGlobalTab] = useState('criterio');
  const setGT = (k, v) => setGlobalTriggers(prev => ({ ...prev, [k]: v }));

  const globalTabs = [
    { id: 'criterio', label: 'Criterio Global', icon: 'Target' },
    { id: 'evaluacion', label: 'Evaluación', icon: 'RefreshCw' },
    { id: 'triggers', label: 'Triggers Globales', icon: 'Zap' },
    { id: 'simulador', label: 'Simulador', icon: 'Calculator' },
  ];

  const totalClients = levels?.reduce((s, l) => s + (l?.clients || 0), 0);
  const calcLevelCost = (level) => {
    const clients = level?.clients || 0;
    if (clients === 0) return 0;
    let monthlyCost = 0;
    level?.benefits?.forEach(b => {
      if (b?.type === 'points_multiplier') {
        const mult = parseFloat(b?.value?.match(/[\d.]+/)?.[0] || 1);
        const extraMult = mult - 1;
        const pointsPerVisit = Math.floor(avgTicket / POINTS_RULES?.MXN_PER_POINT);
        const extraPoints = pointsPerVisit * extraMult * avgVisits;
        monthlyCost += extraPoints * POINTS_RULES?.POINT_VALUE_MXN * clients;
      }
      if (b?.type === 'discount') {
        const pct = parseFloat(b?.value?.match(/[\d.]+/)?.[0] || 0) / 100;
        monthlyCost += avgTicket * pct * avgVisits * clients;
      }
    });
    return monthlyCost;
  };
  const totalMonthlyCost = levels?.slice(1)?.reduce((s, l) => s + calcLevelCost(l), 0);

  return (
    <div className="bg-card border-2 border-primary/20 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Icon name="Settings" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Configuraciones Globales</h3>
            <p className="text-xs text-muted-foreground">Aplican a todos los niveles del programa VIP</p>
          </div>
        </div>
      </div>

      {/* Global tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {globalTabs?.map(tab => (
          <button
            key={tab?.id}
            onClick={() => setActiveGlobalTab(tab?.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeGlobalTab === tab?.id
                ? 'border-primary text-primary bg-primary/5' :'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={tab?.icon} size={14} />
            {tab?.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* CRITERIO GLOBAL */}
        {activeGlobalTab === 'criterio' && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-warning/5 border border-warning/20 rounded-xl">
              <Icon name="AlertTriangle" size={14} className="text-warning mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                El criterio aplica a todos los niveles. Cambiar el criterio con clientes activos puede afectar sus niveles actuales.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {CRITERIA_OPTIONS?.map(opt => (
                <label
                  key={opt?.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    criterion === opt?.id ? 'border-warning bg-warning/5' : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <input type="radio" name="criterion" value={opt?.id} checked={criterion === opt?.id} onChange={() => setCriterion(opt?.id)} className="mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{opt?.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt?.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            {criterion === 'combo' && (
              <div className="p-4 bg-warning/5 border border-warning/20 rounded-xl space-y-3">
                <p className="text-sm font-medium text-foreground">Configuración de combinación</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Visitas mínimas (Plata)</label>
                    <input type="number" min="1" value={comboConfig?.visitsThreshold || 8} onChange={e => setComboConfig({ ...comboConfig, visitsThreshold: parseInt(e?.target?.value) })} className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Puntos históricos (Plata)</label>
                    <input type="number" min="1" value={comboConfig?.pointsThreshold || 300} onChange={e => setComboConfig({ ...comboConfig, pointsThreshold: parseInt(e?.target?.value) })} className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none" />
                  </div>
                </div>
              </div>
            )}
            {criterion === 'period_active' && (
              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-3">
                <p className="text-sm font-medium text-foreground">Ventana de tiempo global</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Ventana (días)</label>
                    <input type="number" min="7" value={periodConfig?.windowDays || 30} onChange={e => setPeriodConfig({ ...periodConfig, windowDays: parseInt(e?.target?.value) })} className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Visitas mínimas (Plata)</label>
                    <input type="number" min="1" value={periodConfig?.minVisits || 3} onChange={e => setPeriodConfig({ ...periodConfig, minVisits: parseInt(e?.target?.value) })} className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none" />
                  </div>
                </div>
              </div>
            )}
            {criterion === 'engagement_score' && (
              <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl space-y-3">
                <p className="text-sm font-medium text-foreground">Rangos de score por nivel</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Bronce (0 a)</label>
                    <input type="number" min="0" max="100" value={scoreConfig?.bronzeMax || 40} onChange={e => setScoreConfig({ ...scoreConfig, bronzeMax: parseInt(e?.target?.value) })} className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Plata (40 a)</label>
                    <input type="number" min="0" max="100" value={scoreConfig?.silverMax || 70} onChange={e => setScoreConfig({ ...scoreConfig, silverMax: parseInt(e?.target?.value) })} className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Oro (70+)</label>
                    <input type="number" min="0" max="100" value={scoreConfig?.goldMin || 70} onChange={e => setScoreConfig({ ...scoreConfig, goldMin: parseInt(e?.target?.value) })} className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* EVALUACIÓN */}
        {activeGlobalTab === 'evaluacion' && (
          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              {[
                { id: 'lifetime', label: 'Acumulado de por vida', desc: 'Una vez que sube, nunca baja. La opción más generosa.' },
                { id: 'periodic', label: 'Evaluación periódica', desc: 'El nivel se re-evalúa cada X meses. Incentiva actividad continua.' },
              ]?.map(opt => (
                <label key={opt?.id} className={`flex-1 min-w-48 flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${evaluationType === opt?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}>
                  <input type="radio" name="evalType" value={opt?.id} checked={evaluationType === opt?.id} onChange={e => setEvaluationType(e?.target?.value)} className="mt-1" />
                  <div>
                    <p className="font-medium text-foreground text-sm">{opt?.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{opt?.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {evaluationType === 'periodic' && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-foreground">Frecuencia de re-evaluación:</label>
                  <select value={evalFrequency} onChange={e => setEvalFrequency(parseInt(e?.target?.value))} className="px-3 py-1.5 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none">
                    <option value={1}>1 mes</option>
                    <option value={3}>3 meses</option>
                    <option value={6}>6 meses</option>
                    <option value={12}>12 meses</option>
                  </select>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Actividad mínima para mantener cada nivel</p>
                  <div className="space-y-2">
                    {levels?.slice(1)?.map(level => (
                      <div key={level?.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                        <span>{level?.icon}</span>
                        <span className="text-sm font-medium text-foreground w-20">{level?.name}</span>
                        <input
                          type="number" min="1"
                          value={evalMinActivity?.[level?.id] || ''}
                          onChange={e => setEvalMinActivity({ ...evalMinActivity, [level?.id]: parseInt(e?.target?.value) || 0 })}
                          placeholder="Mínimo"
                          className="w-20 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                        />
                        <span className="text-xs text-muted-foreground">visitas / {evalFrequency} mes(es)</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">Días de aviso previo antes de bajar</p>
                    <span className="text-sm font-bold text-primary">{warningDaysBefore} días</span>
                  </div>
                  <input type="range" min="7" max="30" value={warningDaysBefore} onChange={e => setWarningDaysBefore(parseInt(e?.target?.value))} className="w-full accent-primary" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>7 días</span>
                    <span>30 días</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-card border border-border rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-foreground">Período de gracia post-bajada</p>
                    <p className="text-xs text-muted-foreground">Si el cliente recupera el criterio en N días, el nivel se restaura automáticamente</p>
                  </div>
                  <Toggle value={gracePeriodEnabled} onChange={setGracePeriodEnabled} />
                </div>
                {gracePeriodEnabled && (
                  <div className="flex items-center gap-2 ml-4">
                    <input type="number" min="7" max="90" value={gracePeriodDays} onChange={e => setGracePeriodDays(parseInt(e?.target?.value))} className="w-20 px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none" />
                    <span className="text-sm text-muted-foreground">días de gracia para recuperar el nivel</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TRIGGERS GLOBALES */}
        {activeGlobalTab === 'triggers' && (
          <div className="space-y-5">
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Icon name="Zap" size={16} className="text-warning" />
                Eventos globales de nivel
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { id: 'onLevelUp', label: 'Al subir de nivel', desc: 'Cuando el cliente alcanza un nuevo nivel VIP', icon: '🚀', tag: 'Principal' },
                  { id: 'onLevelDown', label: 'Al bajar de nivel', desc: 'Cuando el cliente pierde un nivel (evaluación periódica)', icon: '📉', tag: 'Retención' },
                  { id: 'onPointsMilestone', label: 'Al alcanzar hito de puntos', desc: 'Cada 500 puntos acumulados en el nivel actual', icon: '🏆', tag: 'Milestone' },
                  { id: 'onAnniversary', label: 'Aniversario en el nivel', desc: 'Cada año que el cliente mantiene su nivel VIP', icon: '🎂', tag: 'Fidelidad' },
                  { id: 'onRiskDowngrade', label: 'En riesgo de bajar de nivel', desc: 'N días antes de la re-evaluación si no cumple el mínimo', icon: '⚠️', tag: 'Preventivo' },
                  { id: 'onSustainedLoyalty', label: 'Lealtad sostenida X meses', desc: 'Permanencia consecutiva en el mismo nivel', icon: '🏅', tag: 'Lealtad' },
                  { id: 'onNearNextLevel', label: 'Próximo a subir de nivel', desc: 'Cuando está a menos del 20% del umbral siguiente', icon: '🎯', tag: 'Motivación' },
                ]?.map(trigger => (
                  <label key={trigger?.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${globalTriggers?.[trigger?.id] ? 'border-warning bg-warning/5' : 'border-border hover:border-muted-foreground'}`}>
                    <input type="checkbox" checked={globalTriggers?.[trigger?.id] || false} onChange={e => setGT(trigger?.id, e?.target?.checked)} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>{trigger?.icon}</span>
                        <span className="font-medium text-foreground text-sm">{trigger?.label}</span>
                        <span className="px-1.5 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">{trigger?.tag}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{trigger?.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {globalTriggers?.onNearNextLevel && (
              <div className="p-4 bg-muted/30 rounded-xl">
                <label className="block text-xs font-medium text-foreground mb-2">Activar cuando falte este % del umbral siguiente</label>
                <div className="flex items-center gap-3">
                  <input type="range" min="5" max="50" value={globalTriggers?.nearLevelThresholdPct || 20} onChange={e => setGT('nearLevelThresholdPct', parseInt(e?.target?.value))} className="flex-1 accent-warning" />
                  <span className="text-sm font-bold text-warning w-12">{globalTriggers?.nearLevelThresholdPct || 20}%</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Icon name="Settings" size={16} className="text-warning" />
                Acciones globales al cambio de nivel
              </h4>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-foreground">Notificar al staff</p>
                  <p className="text-xs text-muted-foreground">Alerta interna cuando cualquier cliente cambia de nivel VIP</p>
                </div>
                <Toggle value={globalTriggers?.notifyStaff !== false} onChange={v => setGT('notifyStaff', v)} />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-foreground">Enviar felicitación automática</p>
                  <p className="text-xs text-muted-foreground">Complementa la configuración por nivel</p>
                </div>
                <Toggle value={globalTriggers?.sendCongrats !== false} onChange={v => setGT('sendCongrats', v)} />
              </div>
              {globalTriggers?.sendCongrats !== false && (
                <div className="ml-4 p-3 bg-card border border-border rounded-xl">
                  <label className="block text-xs font-medium text-foreground mb-1">Canal de felicitación global</label>
                  <select value={globalTriggers?.congratsChannel || 'push'} onChange={e => setGT('congratsChannel', e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none">
                    <option value="push">Push notification</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="push_whatsapp">Push + WhatsApp</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-foreground">Inscribir en flow de nivel VIP</p>
                  <p className="text-xs text-muted-foreground">Flow de mensajes automáticos para clientes que cambian de nivel</p>
                </div>
                <Toggle value={globalTriggers?.automationFlow || false} onChange={v => setGT('automationFlow', v)} />
              </div>
              {globalTriggers?.automationFlow && (
                <div className="ml-4 p-3 bg-card border border-border rounded-xl">
                  <select value={globalTriggers?.flowId || ''} onChange={e => setGT('flowId', e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none">
                    <option value="">Seleccionar flow...</option>
                    <option value="flow_vip_welcome">Flow Bienvenida VIP</option>
                    <option value="flow_vip_retention">Flow Retención VIP</option>
                    <option value="flow_vip_birthday">Flow Cumpleaños VIP</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SIMULADOR */}
        {activeGlobalTab === 'simulador' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Ticket promedio (MXN)</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">$</span>
                  <input type="number" min="1" value={avgTicket} onChange={e => setAvgTicket(parseFloat(e?.target?.value) || 150)} className="flex-1 px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Visitas promedio/mes</label>
                <input type="number" min="1" value={avgVisits} onChange={e => setAvgVisits(parseFloat(e?.target?.value) || 4)} className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none" />
              </div>
            </div>
            <div className="space-y-3">
              {levels?.slice(1)?.map(level => {
                const cost = calcLevelCost(level);
                return (
                  <div key={level?.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span>{level?.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{level?.name}</p>
                        <p className="text-xs text-muted-foreground">{level?.clients || 0} clientes</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">${cost?.toFixed(2)} MXN/mes</p>
                      <p className="text-xs text-muted-foreground">${(level?.clients || 0) > 0 ? (cost / (level?.clients || 1))?.toFixed(2) : '0.00'} por cliente</p>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <div>
                  <p className="font-semibold text-foreground">Costo total estimado del programa</p>
                  <p className="text-xs text-muted-foreground">Basado en {totalClients} clientes activos</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">${totalMonthlyCost?.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">MXN / mes</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">* Estimación basada en multiplicadores de puntos y descuentos permanentes configurados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
const VIPLevelsWizardPage = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Levels state
  const [levels, setLevels] = useState(defaultLevels);
  const [selectedLevelId, setSelectedLevelId] = useState(defaultLevels?.[0]?.id);
  const [activeLevelTab, setActiveLevelTab] = useState('criterio');

  // Global config state
  const [criterion, setCriterion] = useState('visits');
  const [comboConfig, setComboConfig] = useState({ visitsThreshold: 8, pointsThreshold: 300 });
  const [periodConfig, setPeriodConfig] = useState({ windowDays: 30, minVisits: 3 });
  const [scoreConfig, setScoreConfig] = useState({ bronzeMax: 40, silverMax: 70, goldMin: 70 });
  const [evaluationType, setEvaluationType] = useState('lifetime');
  const [evalFrequency, setEvalFrequency] = useState(6);
  const [evalMinActivity, setEvalMinActivity] = useState({});
  const [warningDaysBefore, setWarningDaysBefore] = useState(14);
  const [gracePeriodEnabled, setGracePeriodEnabled] = useState(false);
  const [gracePeriodDays, setGracePeriodDays] = useState(30);
  const [globalTriggers, setGlobalTriggers] = useState({
    onLevelUp: true, onLevelDown: false, onPointsMilestone: false,
    onAnniversary: true, onRiskDowngrade: false, onSustainedLoyalty: false,
    onNearNextLevel: false, nearLevelThresholdPct: 20,
    notifyStaff: true, sendCongrats: true, congratsChannel: 'push',
    automationFlow: false,
  });
  const [avgTicket, setAvgTicket] = useState(150);
  const [avgVisits, setAvgVisits] = useState(4);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('levels'); // 'levels' | 'global'

  const user = {
    name: authUser?.user_metadata?.full_name || authUser?.email || 'Usuario',
    email: authUser?.email || '',
    role: authUser?.user_metadata?.role || 'owner',
  };

  const selectedLevel = levels?.find(l => l?.id === selectedLevelId) || levels?.[0];
  const selectedLevelIndex = levels?.findIndex(l => l?.id === selectedLevelId);

  useEffect(() => {
    if (authUser?.id) loadData();
    else setLoading(false);
  }, [authUser?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [config, lvls, globalTrig, econConfig] = await Promise.all([
        fetchVIPConfig(authUser?.id),
        fetchVIPLevels(authUser?.id),
        fetchVIPGlobalTriggers(authUser?.id),
        fetchVIPEconomicConfig(authUser?.id),
      ]);
      if (config) {
        setCriterion(config?.criterion || 'visits');
        setEvaluationType(config?.evaluation_type || 'lifetime');
        setEvalFrequency(config?.eval_frequency_months || 6);
        setEvalMinActivity(config?.eval_min_activity || {});
        setWarningDaysBefore(config?.warning_days_before || 14);
        setGracePeriodEnabled(config?.grace_period_enabled || false);
        setGracePeriodDays(config?.grace_period_days || 30);
        setComboConfig({ visitsThreshold: config?.combo_visits_threshold || 8, pointsThreshold: config?.combo_points_threshold || 300 });
        setPeriodConfig({ windowDays: config?.period_window_days || 30, minVisits: config?.period_min_visits || 3 });
        setScoreConfig({ bronzeMax: config?.engagement_score_bronze_max || 40, silverMax: config?.engagement_score_silver_max || 70, goldMin: config?.engagement_score_gold_min || 70 });
      }
      if (lvls && lvls?.length > 0) {
        setLevels(lvls);
        setSelectedLevelId(lvls?.[0]?.id);
      }
      if (globalTrig) {
        setGlobalTriggers({
          onLevelUp: globalTrig?.on_level_up !== false,
          onLevelDown: globalTrig?.on_level_down || false,
          onPointsMilestone: globalTrig?.on_points_milestone || false,
          onAnniversary: globalTrig?.on_anniversary || false,
          onRiskDowngrade: globalTrig?.on_risk_downgrade || false,
          onSustainedLoyalty: globalTrig?.on_sustained_loyalty || false,
          onNearNextLevel: globalTrig?.on_near_next_level || false,
          nearLevelThresholdPct: globalTrig?.near_level_threshold_pct || 20,
          notifyStaff: globalTrig?.notify_staff !== false,
          sendCongrats: globalTrig?.send_congrats !== false,
          congratsChannel: globalTrig?.congrats_channel || 'push',
          automationFlow: globalTrig?.automation_flow || false,
          flowId: globalTrig?.flow_id || '',
        });
      }
      if (econConfig) {
        setAvgTicket(parseFloat(econConfig?.avg_ticket_mxn) || 150);
        setAvgVisits(parseFloat(econConfig?.avg_visits_per_month) || 4);
      }
    } catch (err) {
      setError('Error al cargar la configuración VIP');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (levelId, updates) => {
    setLevels(prev => prev?.map(l => l?.id === levelId ? { ...l, ...updates } : l));
  };

  const handleRemoveLevel = (levelId) => {
    if (levels?.length <= 2) return;
    const newLevels = levels?.filter(l => l?.id !== levelId);
    setLevels(newLevels);
    if (selectedLevelId === levelId) setSelectedLevelId(newLevels?.[0]?.id);
  };

  const handleAddLevel = () => {
    if (levels?.length >= 5) return;
    const idx = levels?.length;
    const criteriaInfo = CRITERIA_OPTIONS?.find(c => c?.id === criterion);
    const lastThreshold = levels?.[levels?.length - 1]?.threshold || 0;
    const suggestion = criteriaInfo?.suggestions?.[idx] || lastThreshold + 20;
    const newLevel = {
      id: `new-${Date.now()}`,
      name: `Nivel ${idx + 1}`,
      icon: LEVEL_ICONS?.[idx] || '⭐',
      color: LEVEL_COLORS?.[idx] || '#9C27B0',
      threshold: suggestion,
      clients: 0,
      benefits: [],
      automation: {}, maintenanceTrigger: {}, downgradeTrigger: {}, proximityTrigger: {},
      triggers: { onUpgrade: true, onDowngrade: false, onNearNext: false, notifyChannel: 'push', customMessage: '' },
    };
    setLevels(prev => [...prev, newLevel]);
    setSelectedLevelId(newLevel?.id);
  };

  const handleSave = async () => {
    if (!authUser?.id) return;
    try {
      setSaving(true);
      setError(null);
      await Promise.all([
        upsertVIPConfig(authUser?.id, {
          criterion, evaluationType, evalFrequency, evalMinActivity,
          warningDaysBefore, gracePeriodEnabled, gracePeriodDays,
          comboVisitsThreshold: comboConfig?.visitsThreshold,
          comboPointsThreshold: comboConfig?.pointsThreshold,
          periodWindowDays: periodConfig?.windowDays,
          periodMinVisits: periodConfig?.minVisits,
          engagementBronzeMax: scoreConfig?.bronzeMax,
          engagementSilverMax: scoreConfig?.silverMax,
          engagementGoldMin: scoreConfig?.goldMin,
          sendWarning: warningDaysBefore > 0,
          warningDays: warningDaysBefore,
        }),
        saveVIPLevels(authUser?.id, levels),
        upsertVIPGlobalTriggers(authUser?.id, globalTriggers),
        upsertVIPEconomicConfig(authUser?.id, { avgTicketMxn: avgTicket, avgVisitsPerMonth: avgVisits }),
      ]);
      setSaved(true);
      setTimeout(() => navigate('/vip-levels-management'), 1200);
    } catch (err) {
      setError('Error al guardar la configuración VIP');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader2" size={32} className="text-primary animate-spin" />
        <span className="ml-3 text-muted-foreground">Cargando configuración VIP...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isMenuOpen={isSidebarOpen} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      <main className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <div className="p-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <button onClick={() => navigate('/vip-levels-management')} className="hover:text-foreground transition-colors">Niveles VIP</button>
            <Icon name="ChevronRight" size={14} />
            <span className="text-foreground font-medium">Configurar Niveles</span>
          </div>

          {/* Page header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Configurar Niveles VIP</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Configura cada nivel con sus propios criterios, beneficios, automatizaciones y triggers. Las configuraciones globales aplican a todos los niveles.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {levels?.length < 5 && (
                <button onClick={handleAddLevel} className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                  <Icon name="Plus" size={16} />
                  Agregar nivel ({levels?.length}/5)
                </button>
              )}
              <button onClick={() => navigate('/vip-levels-management')} className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                <Icon name="X" size={16} />
                Cancelar
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
              <Icon name="AlertCircle" size={16} className="text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
              <button onClick={loadData} className="ml-auto text-xs text-destructive underline">Reintentar</button>
            </div>
          )}

          {/* Points rule */}
          <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl mb-6">
            <span className="text-lg">📐</span>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Regla de puntos:</span> ${POINTS_RULES?.MXN_PER_POINT} MXN = 1 punto · 1 punto = ${POINTS_RULES?.POINT_VALUE_MXN} MXN de descuento
            </p>
          </div>

          {/* Section toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-xl w-fit">
            <button
              onClick={() => setActiveSection('levels')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === 'levels' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon name="Layers" size={16} />
              Configuración por Nivel
            </button>
            <button
              onClick={() => setActiveSection('global')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === 'global' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon name="Settings" size={16} />
              Configuraciones Globales
            </button>
          </div>

          {/* LEVELS SECTION */}
          {activeSection === 'levels' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Level selector sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-2xl overflow-hidden sticky top-20">
                  <div className="p-4 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">Niveles del programa</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Selecciona un nivel para configurarlo</p>
                  </div>
                  <div className="p-2 space-y-1">
                    {levels?.map((level, idx) => (
                      <button
                        key={level?.id}
                        onClick={() => { setSelectedLevelId(level?.id); setActiveLevelTab('criterio'); }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                          selectedLevelId === level?.id
                            ? 'bg-primary/10 border border-primary/20' :'hover:bg-muted/50'
                        }`}
                      >
                        <span className="text-2xl">{level?.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${selectedLevelId === level?.id ? 'text-primary' : 'text-foreground'}`}>
                            {level?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {idx === 0 ? 'Nivel base' : `Umbral: ${level?.threshold}`}
                          </p>
                        </div>
                        {idx > 0 && (
                          <button
                            onClick={e => { e?.stopPropagation(); handleRemoveLevel(level?.id); }}
                            className="p-1 hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Eliminar nivel"
                          >
                            <Icon name="X" size={12} className="text-destructive" />
                          </button>
                        )}
                      </button>
                    ))}
                    {levels?.length < 5 && (
                      <button
                        onClick={handleAddLevel}
                        className="w-full flex items-center gap-2 px-3 py-3 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors border-2 border-dashed border-border hover:border-primary"
                      >
                        <Icon name="Plus" size={16} />
                        <span className="text-sm">Agregar nivel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Level config panel */}
              <div className="lg:col-span-3">
                {selectedLevel && (
                  <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    {/* Level header */}
                    <div
                      className="p-5 text-white"
                      style={{ background: `linear-gradient(135deg, ${selectedLevel?.color}, ${selectedLevel?.color}99)` }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{selectedLevel?.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold">{selectedLevel?.name}</h2>
                            {selectedLevelIndex === 0 && (
                              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">Nivel base</span>
                            )}
                          </div>
                          <p className="text-sm opacity-80 mt-0.5">
                            {selectedLevelIndex === 0
                              ? 'Todos los clientes comienzan aquí'
                              : `Umbral de entrada: ${selectedLevel?.threshold} ${CRITERIA_OPTIONS?.find(c => c?.id === criterion)?.unit || 'unidades'}`
                            }
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{selectedLevel?.clients || 0}</p>
                          <p className="text-xs opacity-70">clientes</p>
                        </div>
                      </div>
                    </div>

                    {/* Level tabs */}
                    <div className="flex border-b border-border overflow-x-auto">
                      {LEVEL_TABS?.map(tab => (
                        <button
                          key={tab?.id}
                          onClick={() => setActiveLevelTab(tab?.id)}
                          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                            activeLevelTab === tab?.id
                              ? 'border-primary text-primary bg-primary/5' :'border-transparent text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Icon name={tab?.icon} size={14} />
                          {tab?.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab content */}
                    <div className="p-6">
                      {activeLevelTab === 'criterio' && (
                        <LevelCriterioTab
                          level={selectedLevel}
                          levelIndex={selectedLevelIndex}
                          criterion={criterion}
                          onUpdate={handleUpdate}
                        />
                      )}
                      {activeLevelTab === 'beneficios' && (
                        <LevelBeneficiosTab
                          level={selectedLevel}
                          onUpdate={handleUpdate}
                        />
                      )}
                      {activeLevelTab === 'automatizaciones' && (
                        <LevelAutomatizacionesTab
                          level={selectedLevel}
                          onUpdate={handleUpdate}
                        />
                      )}
                      {activeLevelTab === 'triggers' && (
                        <LevelTriggersTab
                          level={selectedLevel}
                          onUpdate={handleUpdate}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GLOBAL SECTION */}
          {activeSection === 'global' && (
            <GlobalSettingsSection
              criterion={criterion} setCriterion={setCriterion}
              comboConfig={comboConfig} setComboConfig={setComboConfig}
              periodConfig={periodConfig} setPeriodConfig={setPeriodConfig}
              scoreConfig={scoreConfig} setScoreConfig={setScoreConfig}
              evaluationType={evaluationType} setEvaluationType={setEvaluationType}
              evalFrequency={evalFrequency} setEvalFrequency={setEvalFrequency}
              evalMinActivity={evalMinActivity} setEvalMinActivity={setEvalMinActivity}
              warningDaysBefore={warningDaysBefore} setWarningDaysBefore={setWarningDaysBefore}
              gracePeriodEnabled={gracePeriodEnabled} setGracePeriodEnabled={setGracePeriodEnabled}
              gracePeriodDays={gracePeriodDays} setGracePeriodDays={setGracePeriodDays}
              globalTriggers={globalTriggers} setGlobalTriggers={setGlobalTriggers}
              avgTicket={avgTicket} setAvgTicket={setAvgTicket}
              avgVisits={avgVisits} setAvgVisits={setAvgVisits}
              levels={levels}
            />
          )}

          {/* Footer */}
          <div className="sticky bottom-0 bg-background border-t border-border -mx-6 px-6 py-4 flex items-center justify-between mt-8">
            <button
              onClick={() => navigate('/vip-levels-management')}
              className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              <Icon name="ChevronLeft" size={16} />
              Volver
            </button>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="flex items-center gap-2 px-6 py-2.5 bg-success text-white rounded-xl text-sm font-semibold hover:bg-success/90 transition-colors disabled:opacity-70"
            >
              {saved ? (
                <><Icon name="Check" size={16} />Guardado</>
              ) : saving ? (
                <><Icon name="Loader2" size={16} className="animate-spin" />Guardando...</>
              ) : (
                <><Icon name="Save" size={16} />Guardar Configuración</>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VIPLevelsWizardPage;
