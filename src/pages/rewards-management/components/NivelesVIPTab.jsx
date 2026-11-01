import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import {
  fetchVIPConfig, fetchVIPLevels, saveVIPLevels, upsertVIPConfig,
  fetchVIPGlobalTriggers, upsertVIPGlobalTriggers,
  fetchVIPEconomicConfig, upsertVIPEconomicConfig,
  POINTS_RULES, pointsToMXN
} from '../../../services/rewardsService';
import VIPLevelAutomationSection from './VIPLevelAutomationSection';
import { useNavigate } from 'react-router-dom';

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
  {
    id: 'visits',
    label: 'Por visitas acumuladas',
    desc: 'Total histórico de visitas. El contador nunca baja.',
    unit: 'visitas',
    placeholder: 'Ej: 10',
    suggestions: [0, 10, 25],
  },
  {
    id: 'points_historical',
    label: 'Por puntos acumulados históricamente',
    desc: 'Total de puntos ganados en toda la historia (no el saldo actual).',
    unit: 'puntos históricos',
    placeholder: 'Ej: 500',
    suggestions: [0, 500, 2000],
  },
  {
    id: 'spend',
    label: 'Por gasto acumulado en MXN',
    desc: 'Total de dinero gastado históricamente. El criterio más directo de valor económico.',
    unit: 'MXN acumulados',
    prefix: '$',
    placeholder: 'Ej: 2000',
    suggestions: [0, 2000, 8000],
  },
  {
    id: 'combo',
    label: 'Por combinación (visitas + puntos)',
    desc: 'El cliente debe cumplir dos condiciones simultáneamente. Más exigente pero más justo.',
    unit: 'visitas + puntos',
    isCombo: true,
    suggestions: [0, 8, 20],
  },
  {
    id: 'punch_cards',
    label: 'Por punch cards completadas',
    desc: 'El nivel sube al completar N punch cards. Conecta con el módulo de punch cards.',
    unit: 'punch cards completadas',
    placeholder: 'Ej: 2',
    suggestions: [0, 2, 7],
  },
  {
    id: 'period_active',
    label: 'Por periodo activo (frecuencia en ventana de tiempo)',
    desc: 'El cliente debe haber visitado X veces en los últimos Y días. Premia la constancia reciente.',
    unit: 'visitas en ventana',
    isPeriod: true,
    suggestions: [0, 3, 8],
  },
  {
    id: 'engagement_score',
    label: 'Por score de engagement (0-100)',
    desc: 'Basado en el score del CRM que integra visitas, gasto, interacciones, reseñas y referidos.',
    unit: 'score',
    isScore: true,
    suggestions: [0, 40, 70],
  },
];

const Toggle = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative ${value ? 'bg-primary' : 'bg-muted'}`}
  >
    <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
  </button>
);

// ─── BENEFIT CARD ─────────────────────────────────────────────────────────────
const BenefitCard = ({ benefit, onRemove }) => {
  const bType = ALL_BENEFIT_TYPES?.find(b => b?.id === benefit?.type);
  return (
    <div className="flex items-start gap-2 p-2 bg-muted/40 rounded-lg group">
      <span className="text-base">{bType?.icon || '⭐'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground">{bType?.label}</p>
        <p className="text-xs text-muted-foreground truncate">{benefit?.value}</p>
      </div>
      <button
        onClick={() => onRemove(benefit?.id)}
        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-destructive/10 rounded transition-all"
      >
        <Icon name="X" size={12} className="text-destructive" />
      </button>
    </div>
  );
};

// ─── THRESHOLD INPUT ──────────────────────────────────────────────────────────
const ThresholdInput = ({ criterion, level, levelIndex, onUpdate }) => {
  const criteriaInfo = CRITERIA_OPTIONS?.find(c => c?.id === criterion);
  if (levelIndex === 0) return <p className="font-semibold text-white">Nivel base (todos)</p>;

  if (criterion === 'combo') {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <input
            type="number" min="1"
            value={level?.threshold || 0}
            onChange={e => onUpdate(level?.id, { threshold: parseInt(e?.target?.value) || 0 })}
            className="w-16 bg-white/20 text-white rounded px-2 py-1 text-xs border border-white/30 focus:outline-none"
          />
          <span className="text-xs opacity-80">visitas</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs opacity-70">Y</span>
          <input
            type="number" min="1"
            value={level?.thresholdPoints || 0}
            onChange={e => onUpdate(level?.id, { thresholdPoints: parseInt(e?.target?.value) || 0 })}
            className="w-16 bg-white/20 text-white rounded px-2 py-1 text-xs border border-white/30 focus:outline-none"
          />
          <span className="text-xs opacity-80">pts históricos</span>
        </div>
      </div>
    );
  }

  if (criterion === 'period_active') {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <input
            type="number" min="1"
            value={level?.threshold || 0}
            onChange={e => onUpdate(level?.id, { threshold: parseInt(e?.target?.value) || 0 })}
            className="w-14 bg-white/20 text-white rounded px-2 py-1 text-xs border border-white/30 focus:outline-none"
          />
          <span className="text-xs opacity-80">visitas en</span>
          <input
            type="number" min="7"
            value={level?.periodDays || 30}
            onChange={e => onUpdate(level?.id, { periodDays: parseInt(e?.target?.value) || 30 })}
            className="w-14 bg-white/20 text-white rounded px-2 py-1 text-xs border border-white/30 focus:outline-none"
          />
          <span className="text-xs opacity-80">días</span>
        </div>
      </div>
    );
  }

  if (criterion === 'engagement_score') {
    return (
      <div className="space-y-1">
        <p className="text-xs opacity-70">Score mínimo</p>
        <div className="flex items-center gap-1">
          <input
            type="number" min="0" max="100"
            value={level?.threshold || 0}
            onChange={e => onUpdate(level?.id, { threshold: parseInt(e?.target?.value) || 0 })}
            className="w-16 bg-white/20 text-white rounded px-2 py-1 text-xs border border-white/30 focus:outline-none"
          />
          <span className="text-xs opacity-80">/ 100</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {criteriaInfo?.prefix && <span className="text-sm opacity-80">{criteriaInfo?.prefix}</span>}
      <input
        type="number" min="1"
        value={level?.threshold || 0}
        onChange={e => onUpdate(level?.id, { threshold: parseInt(e?.target?.value) || 0 })}
        className="w-20 bg-white/20 text-white rounded px-2 py-1 text-sm border border-white/30 focus:outline-none"
      />
      <span className="text-xs opacity-80">{criteriaInfo?.unit || 'visitas'}</span>
    </div>
  );
};

// ─── LEVEL COLUMN ─────────────────────────────────────────────────────────────
const LevelColumn = ({ level, levelIndex, criterion, onUpdate, onRemove, onAddBenefit }) => {
  const [editingName, setEditingName] = useState(false);
  const [newBenefitType, setNewBenefitType] = useState('points_multiplier');
  const [newBenefitValue, setNewBenefitValue] = useState('');
  const [showAddBenefit, setShowAddBenefit] = useState(false);

  const handleAddBenefit = () => {
    if (!newBenefitValue?.trim()) return;
    onAddBenefit(level?.id, { id: `b-${Date.now()}`, type: newBenefitType, value: newBenefitValue });
    setNewBenefitValue('');
    setShowAddBenefit(false);
  };

  const handleRemoveBenefit = (benefitId) => {
    onUpdate(level?.id, { benefits: level?.benefits?.filter(b => b?.id !== benefitId) });
  };

  return (
    <div className="flex-1 min-w-64 max-w-80">
      <div
        className="rounded-t-2xl p-4 text-white"
        style={{ background: `linear-gradient(135deg, ${level?.color}, ${level?.color}99)` }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-3xl">{level?.icon}</span>
          {levelIndex > 0 && (
            <button
              onClick={() => onRemove(level?.id)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              title="Eliminar nivel"
            >
              <Icon name="X" size={14} className="text-white/70" />
            </button>
          )}
        </div>
        {editingName ? (
          <input
            autoFocus
            value={level?.name}
            onChange={e => onUpdate(level?.id, { name: e?.target?.value })}
            onBlur={() => setEditingName(false)}
            onKeyDown={e => e?.key === 'Enter' && setEditingName(false)}
            className="w-full bg-white/20 text-white placeholder-white/60 rounded px-2 py-1 text-lg font-bold border border-white/30 focus:outline-none"
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="text-lg font-bold hover:bg-white/10 rounded px-1 -mx-1 transition-colors w-full text-left"
          >
            {level?.name} ✏️
          </button>
        )}
        <div className="mt-3">
          <p className="text-xs opacity-70 mb-1">Umbral de entrada</p>
          <ThresholdInput criterion={criterion} level={level} levelIndex={levelIndex} onUpdate={onUpdate} />
        </div>
      </div>
      <div className="border border-t-0 border-border rounded-b-2xl p-4 bg-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Clientes en este nivel</span>
          <span className="font-bold text-foreground">{level?.clients || 0}</span>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Beneficios</p>
          <div className="space-y-2">
            {level?.benefits?.map(b => (
              <BenefitCard key={b?.id} benefit={b} onRemove={handleRemoveBenefit} />
            ))}
          </div>
          <div className="mt-2">
            {showAddBenefit ? (
              <div className="space-y-2 p-3 bg-muted/30 rounded-xl">
                <select
                  value={newBenefitType}
                  onChange={e => setNewBenefitType(e?.target?.value)}
                  className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none"
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
                  className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none"
                />
                <div className="flex gap-2">
                  <button onClick={handleAddBenefit} className="flex-1 py-1 bg-primary text-white rounded-lg text-xs font-medium">Agregar</button>
                  <button onClick={() => setShowAddBenefit(false)} className="flex-1 py-1 bg-muted text-muted-foreground rounded-lg text-xs">Cancelar</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddBenefit(true)}
                className="w-full py-2 border-2 border-dashed border-border rounded-xl text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1"
              >
                <Icon name="Plus" size={12} />
                Agregar beneficio
              </button>
            )}
          </div>
        </div>
        {/* Automation section per level */}
        <VIPLevelAutomationSection
          levelName={level?.name}
          levelIndex={levelIndex}
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
    </div>
  );
};

// ─── ECONOMIC SIMULATOR ───────────────────────────────────────────────────────
const EconomicSimulator = ({ levels, avgTicket, avgVisits, onAvgTicketChange, onAvgVisitsChange }) => {
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
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 bg-success/10 rounded-xl flex items-center justify-center">
          <Icon name="Calculator" size={18} className="text-success" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Simulador de Impacto Económico</h4>
          <p className="text-xs text-muted-foreground">Estimación del costo mensual del programa VIP</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Ticket promedio (MXN)</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">$</span>
            <input
              type="number" min="1"
              value={avgTicket}
              onChange={e => onAvgTicketChange(parseFloat(e?.target?.value) || 150)}
              className="flex-1 px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Visitas promedio/mes</label>
          <input
            type="number" min="1"
            value={avgVisits}
            onChange={e => onAvgVisitsChange(parseFloat(e?.target?.value) || 4)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
          />
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
                <p className="text-xs text-muted-foreground">
                  ${(level?.clients || 0) > 0 ? (cost / (level?.clients || 1))?.toFixed(2) : '0.00'} por cliente
                </p>
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
      <p className="text-xs text-muted-foreground mt-3">
        * Estimación basada en multiplicadores de puntos y descuentos permanentes configurados. No incluye cupones one-time ni beneficios de producto.
      </p>
    </div>
  );
};

// ─── PROGRESSION FUNNEL ───────────────────────────────────────────────────────
const ProgressionFunnel = ({ levels, criterion }) => {
  const navigate = useNavigate();
  const totalClients = levels?.reduce((s, l) => s + (l?.clients || 0), 0);
  const criteriaInfo = CRITERIA_OPTIONS?.find(c => c?.id === criterion);

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
          <Icon name="TrendingUp" size={18} className="text-primary" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Distribución y Embudo de Progresión</h4>
          <p className="text-xs text-muted-foreground">Haz clic en una barra para ver los clientes de ese nivel en el CRM</p>
        </div>
      </div>

      <div className="space-y-3">
        {levels?.map((level, idx) => {
          const pct = totalClients > 0 ? Math.max((level?.clients / totalClients) * 100, 3) : 3;
          const nextLevel = levels?.[idx + 1];
          const nearNextCount = Math.floor((level?.clients || 0) * 0.15);

          return (
            <div key={level?.id}>
              <div
                className="flex items-center gap-4 cursor-pointer group"
                onClick={() => navigate(`/crm-clients-list?vip_level=${encodeURIComponent(level?.name)}`)}
              >
                <div className="flex items-center gap-2 w-28">
                  <span>{level?.icon}</span>
                  <span className="text-sm font-medium text-foreground">{level?.name}</span>
                </div>
                <div className="flex-1 bg-muted rounded-full h-7 relative overflow-hidden">
                  <div
                    className="h-7 rounded-full flex items-center justify-end pr-3 transition-all group-hover:opacity-90"
                    style={{ width: `${pct}%`, background: level?.color }}
                  >
                    <span className="text-white text-xs font-bold">{level?.clients || 0}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-28 justify-end">
                  <span className="text-sm text-muted-foreground">
                    {totalClients > 0 ? (((level?.clients || 0) / totalClients) * 100)?.toFixed(1) : '0.0'}%
                  </span>
                  <Icon name="ExternalLink" size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              {nextLevel && nearNextCount > 0 && (
                <div className="ml-30 ml-[7.5rem] mt-1 mb-2">
                  <p className="text-xs text-muted-foreground">
                    <span className="text-warning font-medium">↑ {nearNextCount} clientes</span> están a menos del 20% del umbral de {nextLevel?.name}
                    {criteriaInfo && ` (${criteriaInfo?.unit})`}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalClients === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <Icon name="Users" size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Aún no hay clientes en el programa VIP</p>
        </div>
      )}
    </div>
  );
};

// ─── CRITERION SELECTOR ───────────────────────────────────────────────────────
const CriterionSelector = ({ criterion, onChange, comboConfig, onComboChange, periodConfig, onPeriodChange, scoreConfig, onScoreChange }) => {
  const selected = CRITERIA_OPTIONS?.find(c => c?.id === criterion);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-warning/10 rounded-xl flex items-center justify-center">
          <Icon name="Target" size={18} className="text-warning" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Criterio de Ascenso</h4>
          <p className="text-xs text-muted-foreground">Define cómo los clientes suben de nivel</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {CRITERIA_OPTIONS?.map(opt => (
          <label
            key={opt?.id}
            className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
              criterion === opt?.id ? 'border-warning bg-warning/5' : 'border-border hover:border-muted-foreground'
            }`}
          >
            <input
              type="radio"
              name="criterion"
              value={opt?.id}
              checked={criterion === opt?.id}
              onChange={() => onChange(opt?.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">{opt?.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{opt?.desc}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Combo config */}
      {criterion === 'combo' && (
        <div className="p-4 bg-warning/5 border border-warning/20 rounded-xl space-y-3">
          <p className="text-sm font-medium text-foreground">Configuración de combinación</p>
          <p className="text-xs text-muted-foreground">Los umbrales de cada nivel se configuran en las columnas de arriba. Aquí define los valores base de referencia:</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Visitas mínimas (Plata)</label>
              <input
                type="number" min="1"
                value={comboConfig?.visitsThreshold || 8}
                onChange={e => onComboChange({ ...comboConfig, visitsThreshold: parseInt(e?.target?.value) })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Puntos históricos (Plata)</label>
              <input
                type="number" min="1"
                value={comboConfig?.pointsThreshold || 300}
                onChange={e => onComboChange({ ...comboConfig, pointsThreshold: parseInt(e?.target?.value) })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Period config */}
      {criterion === 'period_active' && (
        <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-3">
          <p className="text-sm font-medium text-foreground">Ventana de tiempo global</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Ventana (días)</label>
              <input
                type="number" min="7"
                value={periodConfig?.windowDays || 30}
                onChange={e => onPeriodChange({ ...periodConfig, windowDays: parseInt(e?.target?.value) })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Visitas mínimas (Plata)</label>
              <input
                type="number" min="1"
                value={periodConfig?.minVisits || 3}
                onChange={e => onPeriodChange({ ...periodConfig, minVisits: parseInt(e?.target?.value) })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
              />
            </div>
          </div>
          <p className="text-xs text-warning">⚠️ Este criterio solo aplica con evaluación periódica activa.</p>
        </div>
      )}

      {/* Engagement score config */}
      {criterion === 'engagement_score' && (
        <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl space-y-3">
          <p className="text-sm font-medium text-foreground">Rangos de score por nivel</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Bronce (0 a)</label>
              <input
                type="number" min="0" max="100"
                value={scoreConfig?.bronzeMax || 40}
                onChange={e => onScoreChange({ ...scoreConfig, bronzeMax: parseInt(e?.target?.value) })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Plata (40 a)</label>
              <input
                type="number" min="0" max="100"
                value={scoreConfig?.silverMax || 70}
                onChange={e => onScoreChange({ ...scoreConfig, silverMax: parseInt(e?.target?.value) })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Oro (70+)</label>
              <input
                type="number" min="0" max="100"
                value={scoreConfig?.goldMin || 70}
                onChange={e => onScoreChange({ ...scoreConfig, goldMin: parseInt(e?.target?.value) })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">El score de engagement requiere que el CRM esté activo con suficientes datos históricos.</p>
        </div>
      )}

      <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-xl">
        <Icon name="Info" size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          El criterio aplica a todos los niveles. Una vez elegido y con clientes en el programa, cambiar el criterio puede afectar los niveles actuales de tus clientes.
        </p>
      </div>
    </div>
  );
};

// ─── PERIODIC EVALUATION CONFIG ───────────────────────────────────────────────
const PeriodicEvalConfig = ({ evalFrequency, onFreqChange, evalMinActivity, onMinActivityChange, warningDaysBefore, onWarningDaysChange, gracePeriodEnabled, onGracePeriodToggle, gracePeriodDays, onGracePeriodDaysChange, levels }) => {
  return (
    <div className="p-4 bg-muted/30 rounded-xl space-y-4">
      {/* Frequency */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-foreground">Frecuencia de re-evaluación:</label>
        <select
          value={evalFrequency}
          onChange={e => onFreqChange(parseInt(e?.target?.value))}
          className="px-3 py-1.5 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
        >
          <option value={1}>1 mes</option>
          <option value={3}>3 meses</option>
          <option value={6}>6 meses</option>
          <option value={12}>12 meses</option>
        </select>
      </div>

      {/* Minimum activity per level */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Actividad mínima para mantener cada nivel</p>
        <p className="text-xs text-muted-foreground mb-3">Diferente del umbral de entrada. Ejemplo: "Para entrar a Plata: 10 visitas. Para mantener Plata: mínimo 3 visitas cada {evalFrequency} mes(es)."</p>
        <div className="space-y-2">
          {levels?.slice(1)?.map(level => (
            <div key={level?.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
              <span>{level?.icon}</span>
              <span className="text-sm font-medium text-foreground w-20">{level?.name}</span>
              <input
                type="number" min="1"
                value={evalMinActivity?.[level?.id] || ''}
                onChange={e => onMinActivityChange({ ...evalMinActivity, [level?.id]: parseInt(e?.target?.value) || 0 })}
                placeholder="Mínimo"
                className="w-20 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
              />
              <span className="text-xs text-muted-foreground">visitas / {evalFrequency} mes(es)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Warning days slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-foreground">Días de aviso previo antes de bajar</p>
          <span className="text-sm font-bold text-primary">{warningDaysBefore} días</span>
        </div>
        <input
          type="range" min="7" max="30"
          value={warningDaysBefore}
          onChange={e => onWarningDaysChange(parseInt(e?.target?.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>7 días</span>
          <span>30 días</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          "Avisar al cliente {warningDaysBefore} días antes de que su nivel cambie."
        </p>
      </div>

      {/* Grace period */}
      <div className="flex items-center justify-between p-3 bg-card border border-border rounded-xl">
        <div>
          <p className="text-sm font-medium text-foreground">Período de gracia post-bajada</p>
          <p className="text-xs text-muted-foreground">Si el cliente recupera el criterio en N días, el nivel se restaura automáticamente</p>
        </div>
        <Toggle value={gracePeriodEnabled} onChange={onGracePeriodToggle} />
      </div>
      {gracePeriodEnabled && (
        <div className="ml-4 flex items-center gap-2">
          <input
            type="number" min="7" max="90"
            value={gracePeriodDays}
            onChange={e => onGracePeriodDaysChange(parseInt(e?.target?.value))}
            className="w-20 px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
          />
          <span className="text-sm text-muted-foreground">días de gracia para recuperar el nivel</span>
        </div>
      )}
    </div>
  );
};

// ─── GLOBAL TRIGGERS SECTION ──────────────────────────────────────────────────
const GlobalTriggersSection = ({ globalTriggers, setGlobalTriggers }) => {
  const [open, setOpen] = useState(false);
  const set = (k, v) => setGlobalTriggers(prev => ({ ...prev, [k]: v }));
  const activeCount = [
    globalTriggers?.onLevelUp,
    globalTriggers?.onLevelDown,
    globalTriggers?.onPointsMilestone,
    globalTriggers?.onAnniversary,
    globalTriggers?.onRiskDowngrade,
    globalTriggers?.onSustainedLoyalty,
    globalTriggers?.onNearNextLevel,
  ]?.filter(Boolean)?.length;

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-warning/5 to-transparent hover:from-warning/10 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-warning/10 rounded-xl flex items-center justify-center">
            <Icon name="Zap" size={18} className="text-warning" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground">⚡ Triggers Globales VIP</p>
            <p className="text-xs text-muted-foreground">Automatizaciones que aplican a todos los cambios de nivel</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-warning/10 text-warning text-xs font-medium rounded-full border border-warning/20">
            {activeCount} activo{activeCount !== 1 ? 's' : ''}
          </span>
          <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground" />
        </div>
      </button>

      {open && (
        <div className="p-5 border-t border-border space-y-5">
          {/* Trigger events */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Icon name="Zap" size={16} className="text-warning" />
              ¿Cuándo se dispara?
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
                <label
                  key={trigger?.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    globalTriggers?.[trigger?.id] ? 'border-warning bg-warning/5' : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={globalTriggers?.[trigger?.id] || false}
                    onChange={e => set(trigger?.id, e?.target?.checked)}
                    className="mt-1"
                  />
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

          {/* Near level threshold */}
          {globalTriggers?.onNearNextLevel && (
            <div className="p-4 bg-muted/30 rounded-xl">
              <label className="block text-xs font-medium text-foreground mb-2">Activar cuando falte este % del umbral siguiente</label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min="5" max="50"
                  value={globalTriggers?.nearLevelThresholdPct || 20}
                  onChange={e => set('nearLevelThresholdPct', parseInt(e?.target?.value))}
                  className="flex-1 accent-warning"
                />
                <span className="text-sm font-bold text-warning w-12">{globalTriggers?.nearLevelThresholdPct || 20}%</span>
              </div>
            </div>
          )}

          {/* Global actions */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Icon name="Settings" size={16} className="text-warning" />
              Acciones globales al cambio de nivel
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-foreground">Notificar al staff</p>
                  <p className="text-xs text-muted-foreground">Alerta interna cuando cualquier cliente cambia de nivel VIP</p>
                </div>
                <Toggle value={globalTriggers?.notifyStaff !== false} onChange={v => set('notifyStaff', v)} />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-foreground">Enviar felicitación automática</p>
                  <p className="text-xs text-muted-foreground">Complementa la configuración por nivel</p>
                </div>
                <Toggle value={globalTriggers?.sendCongrats !== false} onChange={v => set('sendCongrats', v)} />
              </div>
              {globalTriggers?.sendCongrats !== false && (
                <div className="ml-4 p-3 bg-card border border-border rounded-xl">
                  <label className="block text-xs font-medium text-foreground mb-1">Canal de felicitación</label>
                  <select
                    value={globalTriggers?.congratsChannel || 'push'}
                    onChange={e => set('congratsChannel', e?.target?.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                  >
                    <option value="push">Push notification</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="push_whatsapp">Push + WhatsApp</option>
                    <option value="email">Email</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">Variables: {'{nombre}'} {'{nivel}'} {'{negocio}'}</p>
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-foreground">Inscribir en flow de nivel VIP</p>
                  <p className="text-xs text-muted-foreground">Flow de mensajes automáticos para clientes que cambian de nivel</p>
                </div>
                <Toggle value={globalTriggers?.automationFlow || false} onChange={v => set('automationFlow', v)} />
              </div>
              {globalTriggers?.automationFlow && (
                <div className="ml-4 p-3 bg-card border border-border rounded-xl">
                  <select
                    value={globalTriggers?.flowId || ''}
                    onChange={e => set('flowId', e?.target?.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                  >
                    <option value="">Seleccionar flow...</option>
                    <option value="flow_vip_welcome">Flow Bienvenida VIP</option>
                    <option value="flow_vip_retention">Flow Retención VIP</option>
                    <option value="flow_vip_birthday">Flow Cumpleaños VIP</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const defaultLevels = [
  {
    id: 'default-1', name: 'Bronce', icon: '🥉', color: '#CD7F32',
    threshold: 0, clients: 0,
    benefits: [{ id: 'b1', type: 'welcome_points', value: `50 puntos al registrarse (= $${pointsToMXN(50)} MXN)` }],
    automation: {}, maintenanceTrigger: {}, downgradeTrigger: {}, proximityTrigger: {},
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
  },
];

const NivelesVIPTab = ({ businessId, onDataChange }) => {
  const [levels, setLevels] = useState(defaultLevels);
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

  useEffect(() => {
    if (businessId) loadData();
    else setLoading(false);
  }, [businessId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [config, lvls, globalTrig, econConfig] = await Promise.all([
        fetchVIPConfig(businessId),
        fetchVIPLevels(businessId),
        fetchVIPGlobalTriggers(businessId),
        fetchVIPEconomicConfig(businessId),
      ]);
      if (config) {
        setCriterion(config?.criterion || 'visits');
        setEvaluationType(config?.evaluation_type || 'lifetime');
        setEvalFrequency(config?.eval_frequency_months || 6);
        setEvalMinActivity(config?.eval_min_activity || {});
        setWarningDaysBefore(config?.warning_days_before || 14);
        setGracePeriodEnabled(config?.grace_period_enabled || false);
        setGracePeriodDays(config?.grace_period_days || 30);
        setComboConfig({
          visitsThreshold: config?.combo_visits_threshold || 8,
          pointsThreshold: config?.combo_points_threshold || 300,
        });
        setPeriodConfig({
          windowDays: config?.period_window_days || 30,
          minVisits: config?.period_min_visits || 3,
        });
        setScoreConfig({
          bronzeMax: config?.engagement_score_bronze_max || 40,
          silverMax: config?.engagement_score_silver_max || 70,
          goldMin: config?.engagement_score_gold_min || 70,
        });
      }
      if (lvls && lvls?.length > 0) setLevels(lvls);
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (levelId, updates) => {
    setLevels(prev => prev?.map(l => l?.id === levelId ? { ...l, ...updates } : l));
  };

  const handleRemove = (levelId) => {
    if (levels?.length <= 2) return;
    setLevels(prev => prev?.filter(l => l?.id !== levelId));
  };

  const handleAddBenefit = (levelId, benefit) => {
    setLevels(prev => prev?.map(l =>
      l?.id === levelId ? { ...l, benefits: [...(l?.benefits || []), benefit] } : l
    ));
  };

  const handleAddLevel = () => {
    if (levels?.length >= 5) return;
    const idx = levels?.length;
    const criteriaInfo = CRITERIA_OPTIONS?.find(c => c?.id === criterion);
    const lastThreshold = levels?.[levels?.length - 1]?.threshold || 0;
    const suggestion = criteriaInfo?.suggestions?.[idx] || lastThreshold + 20;
    setLevels(prev => [...prev, {
      id: `new-${Date.now()}`,
      name: `Nivel ${idx + 1}`,
      icon: LEVEL_ICONS?.[idx] || '⭐',
      color: LEVEL_COLORS?.[idx] || '#9C27B0',
      threshold: suggestion,
      clients: 0,
      benefits: [],
      automation: {},
      maintenanceTrigger: {},
      downgradeTrigger: {},
      proximityTrigger: {},
    }]);
  };

  const handleSave = async () => {
    if (!businessId) return;
    try {
      setSaving(true);
      setError(null);
      await Promise.all([
        upsertVIPConfig(businessId, {
          criterion,
          criterionSecondary: null,
          evaluationType,
          evalFrequency,
          evalMinActivity,
          warningDaysBefore,
          gracePeriodEnabled,
          gracePeriodDays,
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
        saveVIPLevels(businessId, levels),
        upsertVIPGlobalTriggers(businessId, globalTriggers),
        upsertVIPEconomicConfig(businessId, { avgTicketMxn: avgTicket, avgVisitsPerMonth: avgVisits }),
      ]);
      await loadData();
      onDataChange?.();
    } catch (err) {
      setError('Error al guardar la configuración VIP');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Icon name="Loader2" size={32} className="text-primary animate-spin" />
        <span className="ml-3 text-muted-foreground">Cargando niveles VIP...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
          <Icon name="AlertCircle" size={16} className="text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
          <button onClick={loadData} className="ml-auto text-xs text-destructive underline">Reintentar</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-foreground">Editor de Niveles VIP</h3>
          <p className="text-sm text-muted-foreground">Configura hasta 5 niveles con criterios, beneficios y triggers</p>
        </div>
        <div className="flex items-center gap-3">
          {levels?.length < 5 && (
            <Button variant="outline" onClick={handleAddLevel}>
              <Icon name="Plus" size={16} className="mr-2" />
              Agregar nivel ({levels?.length}/5)
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Guardando...</>
            ) : (
              <><Icon name="Save" size={16} className="mr-2" />Guardar todo</>
            )}
          </Button>
        </div>
      </div>

      {/* Points rule reminder */}
      <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
        <span className="text-lg">📐</span>
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Regla de puntos:</span> ${POINTS_RULES?.MXN_PER_POINT} MXN = 1 punto · 1 punto = ${POINTS_RULES?.POINT_VALUE_MXN} MXN de descuento
        </p>
      </div>

      {/* BLOCK 1: Criterion Selector */}
      <CriterionSelector
        criterion={criterion}
        onChange={setCriterion}
        comboConfig={comboConfig}
        onComboChange={setComboConfig}
        periodConfig={periodConfig}
        onPeriodChange={setPeriodConfig}
        scoreConfig={scoreConfig}
        onScoreChange={setScoreConfig}
      />

      {/* Kanban Level Editor */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {levels?.map((level, idx) => (
          <LevelColumn
            key={level?.id}
            level={level}
            levelIndex={idx}
            criterion={criterion}
            onUpdate={handleUpdate}
            onRemove={handleRemove}
            onAddBenefit={handleAddBenefit}
          />
        ))}
      </div>

      {/* BLOCK 2: Global Triggers */}
      <GlobalTriggersSection globalTriggers={globalTriggers} setGlobalTriggers={setGlobalTriggers} />

      {/* BLOCK 3: Evaluation Period */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h4 className="font-semibold text-foreground mb-4">Período de evaluación</h4>
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            {[
              { id: 'lifetime', label: 'Acumulado de por vida', desc: 'Una vez que sube, nunca baja. La opción más generosa.' },
              { id: 'periodic', label: 'Evaluación periódica', desc: 'El nivel se re-evalúa cada X meses. Incentiva actividad continua.' },
            ]?.map(opt => (
              <label
                key={opt?.id}
                className={`flex-1 min-w-48 flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  evaluationType === opt?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                }`}
              >
                <input
                  type="radio" name="evalType" value={opt?.id}
                  checked={evaluationType === opt?.id}
                  onChange={e => setEvaluationType(e?.target?.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-foreground text-sm">{opt?.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{opt?.desc}</p>
                </div>
              </label>
            ))}
          </div>

          {evaluationType === 'periodic' && (
            <PeriodicEvalConfig
              evalFrequency={evalFrequency}
              onFreqChange={setEvalFrequency}
              evalMinActivity={evalMinActivity}
              onMinActivityChange={setEvalMinActivity}
              warningDaysBefore={warningDaysBefore}
              onWarningDaysChange={setWarningDaysBefore}
              gracePeriodEnabled={gracePeriodEnabled}
              onGracePeriodToggle={setGracePeriodEnabled}
              gracePeriodDays={gracePeriodDays}
              onGracePeriodDaysChange={setGracePeriodDays}
              levels={levels}
            />
          )}
        </div>
      </div>

      {/* BLOCK 3: Progression Funnel + Distribution */}
      <ProgressionFunnel levels={levels} criterion={criterion} />

      {/* BLOCK 3: Economic Simulator */}
      <EconomicSimulator
        levels={levels}
        avgTicket={avgTicket}
        avgVisits={avgVisits}
        onAvgTicketChange={setAvgTicket}
        onAvgVisitsChange={setAvgVisits}
      />

      {/* Benefits Comparison Table */}
      <div className="bg-card border border-border rounded-2xl p-6 overflow-x-auto">
        <h4 className="font-semibold text-foreground mb-4">Tabla comparativa de beneficios</h4>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Beneficio</th>
              {levels?.map(l => (
                <th key={l?.id} className="text-center py-2 px-3">
                  <span>{l?.icon}</span>
                  <span className="ml-1 font-semibold" style={{ color: l?.color }}>{l?.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL_BENEFIT_TYPES?.map(bt => (
              <tr key={bt?.id} className="border-t border-border">
                <td className="py-2 pr-4 text-foreground text-xs">{bt?.icon} {bt?.label}</td>
                {levels?.map(l => {
                  const hasBenefit = l?.benefits?.some(b => b?.type === bt?.id);
                  const benefit = l?.benefits?.find(b => b?.type === bt?.id);
                  return (
                    <td key={l?.id} className="text-center py-2 px-3">
                      {hasBenefit ? (
                        <span className="text-success text-sm" title={benefit?.value}>✓</span>
                      ) : (
                        <span className="text-muted-foreground/30 text-sm">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Guardando...</>
          ) : (
            <><Icon name="Save" size={16} className="mr-2" />Guardar configuración de niveles</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default NivelesVIPTab;
