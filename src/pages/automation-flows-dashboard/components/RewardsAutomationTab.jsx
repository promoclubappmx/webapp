import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { supabase } from '../../../lib/supabase';
import {
  fetchAutomationRules,
  createAutomationRule,
  toggleAutomationRule,
  deleteAutomationRule,
  POINTS_RULES,
  pointsToMXN,
} from '../../../services/rewardsService';

const MODULE_LABELS = {
  punch_cards: { label: 'Punch Cards', emoji: '🎴', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  vip_levels: { label: 'Niveles VIP', emoji: '🏆', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  experiences: { label: 'Experiencias', emoji: '✨', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
};

const TRIGGER_LABELS = {
  punch_card_complete: 'Al completar punch card',
  vip_level_up: 'Al subir de nivel VIP',
  experience_claimed: 'Al reclamar experiencia',
};

const ACTION_LABELS = {
  send_message: { label: 'Enviar mensaje', emoji: '💬' },
  referral_bonus: { label: 'Bonus de referido', emoji: '🤝' },
  surprise_reward: { label: 'Recompensa sorpresa', emoji: '🎁' },
  automation_flow: { label: 'Flow de automatización', emoji: '⚡' },
  celebration_points: { label: 'Puntos de celebración', emoji: '🎉' },
  special_benefit: { label: 'Beneficio especial', emoji: '⭐' },
  notify_staff: { label: 'Notificar al staff', emoji: '🔔' },
  send_confirmation: { label: 'Enviar confirmación', emoji: '✅' },
  request_review: { label: 'Solicitar reseña', emoji: '⭐' },
  bonus_points: { label: 'Puntos bonus', emoji: '💎' },
  special_referral: { label: 'Referral especial', emoji: '🚀' },
};

const TRIGGER_OPTIONS = [
  { value: 'punch_card_complete', label: 'Al completar una punch card', module: 'punch_cards', emoji: '🎴' },
  { value: 'vip_level_up', label: 'Al subir de nivel VIP', module: 'vip_levels', emoji: '🏆' },
  { value: 'experience_claimed', label: 'Al reclamar una experiencia', module: 'experiences', emoji: '✨' },
];

const ACTION_OPTIONS_BY_TRIGGER = {
  punch_card_complete: [
    { value: 'send_message', label: 'Enviar mensaje de felicitación', emoji: '💬' },
    { value: 'referral_bonus', label: 'Activar bonus de referido', emoji: '🤝' },
    { value: 'surprise_reward', label: 'Activar recompensa sorpresa', emoji: '🎁' },
    { value: 'automation_flow', label: 'Inscribir en flow de automatización', emoji: '⚡' },
  ],
  vip_level_up: [
    { value: 'send_message', label: 'Enviar felicitación personalizada', emoji: '💬' },
    { value: 'celebration_points', label: 'Acreditar puntos de celebración', emoji: '🎉' },
    { value: 'special_benefit', label: 'Activar beneficio especial one-time', emoji: '⭐' },
    { value: 'automation_flow', label: 'Inscribir en flow de nivel VIP', emoji: '⚡' },
    { value: 'notify_staff', label: 'Notificar al staff', emoji: '🔔' },
  ],
  experience_claimed: [
    { value: 'send_confirmation', label: 'Enviar confirmación y detalles', emoji: '✅' },
    { value: 'request_review', label: 'Solicitar reseña 24h después', emoji: '⭐' },
    { value: 'bonus_points', label: 'Acreditar puntos bonus', emoji: '💎' },
    { value: 'special_referral', label: 'Activar referral especial', emoji: '🚀' },
  ],
};

const Toggle = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
      value ? 'bg-primary' : 'bg-muted'
    }`}
  >
    <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${
      value ? 'translate-x-5' : 'translate-x-0.5'
    }`} />
  </button>
);

const ActionConfigFields = ({ triggerType, actionType, config, onChange }) => {
  const set = (k, v) => onChange({ ...config, [k]: v });

  if (actionType === 'send_message' || actionType === 'send_confirmation') {
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Canal de envío</label>
          <select
            value={config?.channel || 'push'}
            onChange={e => set('channel', e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
          >
            <option value="push">Push notification</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            Mensaje
            <span className="ml-2 text-muted-foreground font-normal">Variables: {'{nombre}'} {'{negocio}'} {'{tarjeta}'}</span>
          </label>
          <textarea
            value={config?.message || ''}
            onChange={e => set('message', e?.target?.value)}
            placeholder="Ej: ¡Felicidades {nombre}! Completaste tu tarjeta en {negocio}. Tu recompensa está lista."
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none resize-none"
          />
        </div>
      </div>
    );
  }

  if (actionType === 'referral_bonus') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-foreground mb-1">Puntos bonus por referido</label>
            <div className="flex items-center gap-2">
              <input
                type="number" min="1"
                value={config?.bonusPoints || ''}
                onChange={e => set('bonusPoints', parseInt(e?.target?.value))}
                placeholder="50"
                className="w-24 px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
              />
              <span className="text-xs text-muted-foreground">pts</span>
              {config?.bonusPoints > 0 && (
                <span className="text-xs text-success font-medium">= ${pointsToMXN(config?.bonusPoints)} MXN</span>
              )}
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-foreground mb-1">Válido por (días)</label>
            <input
              type="number" min="1" max="365"
              value={config?.validDays || 30}
              onChange={e => set('validDays', parseInt(e?.target?.value))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">El cliente recibe estos puntos si refiere a alguien dentro del período post-completar</p>
      </div>
    );
  }

  if (actionType === 'celebration_points' || actionType === 'bonus_points') {
    return (
      <div className="space-y-2">
        <label className="block text-xs font-medium text-foreground mb-1">Cantidad de puntos</label>
        <div className="flex items-center gap-2">
          <input
            type="number" min="1"
            value={config?.points || ''}
            onChange={e => set('points', parseInt(e?.target?.value))}
            placeholder="100"
            className="w-28 px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
          />
          <span className="text-xs text-muted-foreground">puntos</span>
          {config?.points > 0 && (
            <span className="text-sm font-semibold text-success">= ${pointsToMXN(config?.points)} MXN</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">1 punto = ${POINTS_RULES?.POINT_VALUE_MXN} MXN · ${POINTS_RULES?.MXN_PER_POINT} MXN = 1 punto</p>
      </div>
    );
  }

  if (actionType === 'special_benefit') {
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Tipo de beneficio</label>
          <select
            value={config?.benefitType || 'coupon'}
            onChange={e => set('benefitType', e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
          >
            <option value="coupon">Cupón de descuento</option>
            <option value="free_product">Producto gratis</option>
            <option value="exclusive_experience">Experiencia exclusiva</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Descripción del beneficio</label>
          <input
            type="text"
            value={config?.benefitDescription || ''}
            onChange={e => set('benefitDescription', e?.target?.value)}
            placeholder="Ej: 20% de descuento en tu próxima visita"
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
          />
        </div>
      </div>
    );
  }

  if (actionType === 'automation_flow') {
    return (
      <div>
        <label className="block text-xs font-medium text-foreground mb-1">Flow de automatización</label>
        <select
          value={config?.flowId || ''}
          onChange={e => set('flowId', e?.target?.value)}
          className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
        >
          <option value="">Seleccionar flow activo...</option>
          <option value="flow_welcome">Flow de Bienvenida VIP</option>
          <option value="flow_retention">Flow de Retención</option>
          <option value="flow_reactivation">Flow de Reactivación</option>
          <option value="flow_birthday">Flow de Cumpleaños</option>
        </select>
        <p className="text-xs text-muted-foreground mt-1">Gestiona tus flows en el tab <span className="text-primary">Editor de Flows</span></p>
      </div>
    );
  }

  if (actionType === 'notify_staff') {
    return (
      <div className="p-3 bg-muted/30 rounded-xl">
        <p className="text-xs text-muted-foreground">Se enviará una alerta interna al staff cuando un cliente suba de nivel. No requiere configuración adicional.</p>
      </div>
    );
  }

  if (actionType === 'request_review') {
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Mensaje de encuesta</label>
          <textarea
            value={config?.reviewMessage || ''}
            onChange={e => set('reviewMessage', e?.target?.value)}
            placeholder="¿Cómo fue tu experiencia? Tu opinión nos ayuda a mejorar."
            rows={2}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none resize-none"
          />
        </div>
        <p className="text-xs text-muted-foreground">Se enviará automáticamente 24 horas después de la experiencia</p>
      </div>
    );
  }

  if (actionType === 'special_referral') {
    return (
      <div className="p-3 bg-muted/30 rounded-xl">
        <p className="text-xs text-muted-foreground">El cliente que vivió la experiencia podrá referir con un beneficio mejorado. Se activa automáticamente al reclamar.</p>
      </div>
    );
  }

  if (actionType === 'surprise_reward') {
    return (
      <div className="p-3 bg-muted/30 rounded-xl">
        <p className="text-xs text-muted-foreground">Dispara la mecánica de sorpresa configurada en el módulo Recompensas (ruleta, scratch card, cofre o sobre).</p>
      </div>
    );
  }

  return null;
};

const NewRuleModal = ({ onClose, onSave, saving }) => {
  const [step, setStep] = useState(1);
  const [triggerType, setTriggerType] = useState('');
  const [actionType, setActionType] = useState('');
  const [triggerSourceName, setTriggerSourceName] = useState('');
  const [actionConfig, setActionConfig] = useState({});
  const [ruleName, setRuleName] = useState('');

  const selectedTrigger = TRIGGER_OPTIONS?.find(t => t?.value === triggerType);
  const availableActions = triggerType ? ACTION_OPTIONS_BY_TRIGGER?.[triggerType] || [] : [];
  const selectedAction = availableActions?.find(a => a?.value === actionType);

  const handleTriggerSelect = (val) => {
    setTriggerType(val);
    setActionType('');
    setActionConfig({});
    setStep(2);
  };

  const handleActionSelect = (val) => {
    setActionType(val);
    setActionConfig({});
    setStep(3);
  };

  const handleSave = () => {
    if (!triggerType || !actionType) return;
    const sourceModule = selectedTrigger?.module || 'punch_cards';
    const autoName = ruleName || `${TRIGGER_LABELS?.[triggerType]} → ${ACTION_LABELS?.[actionType]?.label}`;
    onSave({
      ruleName: autoName,
      triggerType,
      triggerSourceName: triggerSourceName || selectedTrigger?.label,
      sourceModule,
      actionType,
      actionConfig,
      isActive: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Nueva Regla — Recompensas</h2>
            <p className="text-sm text-muted-foreground">Constructor IFTTT para punch cards, niveles VIP y experiencias</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 px-6 pt-4">
          {[1, 2, 3]?.map(s => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>{s}</div>
              {s < 3 && <div className={`flex-1 h-1 rounded-full transition-all ${
                step > s ? 'bg-primary' : 'bg-muted'
              }`} />}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between px-6 pb-2">
          <span className="text-xs text-muted-foreground">Trigger</span>
          <span className="text-xs text-muted-foreground">Acción</span>
          <span className="text-xs text-muted-foreground">Configurar</span>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Step 1: Trigger */}
          {step >= 1 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center">1</span>
                SI esto ocurre...
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {TRIGGER_OPTIONS?.map(opt => (
                  <button
                    key={opt?.value}
                    onClick={() => handleTriggerSelect(opt?.value)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                      triggerType === opt?.value
                        ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <span className="text-2xl">{opt?.emoji}</span>
                    <div>
                      <p className="font-medium text-foreground text-sm">{opt?.label}</p>
                      <p className="text-xs text-muted-foreground">Módulo: {MODULE_LABELS?.[opt?.module]?.label}</p>
                    </div>
                    {triggerType === opt?.value && (
                      <Icon name="Check" size={16} className="ml-auto text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Action */}
          {step >= 2 && triggerType && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center">2</span>
                ENTONCES hacer esto...
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {availableActions?.map(opt => (
                  <button
                    key={opt?.value}
                    onClick={() => handleActionSelect(opt?.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      actionType === opt?.value
                        ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <span className="text-xl">{opt?.emoji}</span>
                    <span className="font-medium text-foreground text-xs">{opt?.label}</span>
                    {actionType === opt?.value && (
                      <Icon name="Check" size={14} className="ml-auto text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Config */}
          {step >= 3 && actionType && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center">3</span>
                Configurar acción
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Nombre de la regla (opcional)</label>
                  <input
                    type="text"
                    value={ruleName}
                    onChange={e => setRuleName(e?.target?.value)}
                    placeholder={`${TRIGGER_LABELS?.[triggerType]} → ${ACTION_LABELS?.[actionType]?.label}`}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                  />
                </div>
                <ActionConfigFields
                  triggerType={triggerType}
                  actionType={actionType}
                  config={actionConfig}
                  onChange={setActionConfig}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/20">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button
            onClick={handleSave}
            disabled={saving || !triggerType || !actionType}
          >
            {saving ? (
              <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Guardando...</>
            ) : (
              <><Icon name="Zap" size={16} className="mr-2" />Crear regla</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

const RewardsAutomationTab = () => {
  const [businessId, setBusinessId] = useState(null);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showNewRule, setShowNewRule] = useState(false);
  const [filterModule, setFilterModule] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase?.auth?.getSession();
        if (session) {
          const { data: profile } = await supabase
            ?.from('user_profiles')
            ?.select('business_id')
            ?.eq('id', session?.user?.id)
            ?.single();
          if (profile?.business_id) {
            setBusinessId(profile?.business_id);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (businessId) loadRules();
  }, [businessId]);

  const loadRules = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAutomationRules(businessId);
      setRules(data);
    } catch (err) {
      setError('Error al cargar las reglas de automatización');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (rule) => {
    try {
      await toggleAutomationRule(rule?.id, !rule?.is_active);
      setRules(prev => prev?.map(r => r?.id === rule?.id ? { ...r, is_active: !r?.is_active } : r));
    } catch (err) {
      console.error('Error toggling rule:', err);
    }
  };

  const handleDelete = async (ruleId) => {
    if (!window.confirm('¿Eliminar esta regla de automatización?')) return;
    try {
      await deleteAutomationRule(ruleId);
      setRules(prev => prev?.filter(r => r?.id !== ruleId));
    } catch (err) {
      console.error('Error deleting rule:', err);
    }
  };

  const handleSaveRule = async (ruleData) => {
    if (!businessId) return;
    try {
      setSaving(true);
      await createAutomationRule(businessId, ruleData);
      await loadRules();
      setShowNewRule(false);
    } catch (err) {
      console.error('Error saving rule:', err);
      setError('Error al guardar la regla');
    } finally {
      setSaving(false);
    }
  };

  const filteredRules = rules?.filter(r => {
    if (filterModule !== 'all' && r?.source_module !== filterModule) return false;
    if (filterStatus === 'active' && !r?.is_active) return false;
    if (filterStatus === 'paused' && r?.is_active) return false;
    return true;
  });

  const totalFires = rules?.reduce((s, r) => s + (r?.fires_this_month || 0), 0);
  const activeCount = rules?.filter(r => r?.is_active)?.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Icon name="Loader2" size={32} className="text-primary animate-spin" />
        <span className="ml-3 text-muted-foreground">Cargando automatizaciones de recompensas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Context banner */}
      <div className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
        <span className="text-2xl">🏆</span>
        <div>
          <p className="text-sm font-semibold text-foreground">Automatizaciones del Módulo Recompensas</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Reglas IFTTT que se disparan cuando los clientes completan punch cards, suben de nivel VIP o reclaman experiencias exclusivas.
            Las reglas creadas aquí también aparecen en <span className="text-primary font-medium">/rewards-management → Automatizaciones</span>.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
          <Icon name="AlertCircle" size={16} className="text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
          <button onClick={loadRules} className="ml-auto text-xs text-destructive underline">Reintentar</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">Reglas de Recompensas</h3>
          <p className="text-sm text-muted-foreground">Triggers de punch cards, niveles VIP y experiencias exclusivas</p>
        </div>
        <Button onClick={() => setShowNewRule(true)}>
          <Icon name="Plus" size={16} className="mr-2" />
          Nueva regla
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Reglas activas', value: activeCount, icon: '⚡', color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Total reglas', value: rules?.length, icon: '📋', color: 'text-foreground', bg: 'bg-muted/50' },
          { label: 'Disparos este mes', value: totalFires, icon: '🎯', color: 'text-success', bg: 'bg-success/10' },
          { label: 'Módulos cubiertos', value: [...new Set(rules?.map(r => r?.source_module))]?.length, icon: '🔗', color: 'text-warning', bg: 'bg-warning/10' },
        ]?.map((kpi, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-4">
            <div className={`w-9 h-9 ${kpi?.bg} rounded-xl flex items-center justify-center text-lg mb-2`}>
              {kpi?.icon}
            </div>
            <p className={`text-2xl font-bold ${kpi?.color}`}>{kpi?.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi?.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Módulo:</span>
          <div className="flex gap-1 flex-wrap">
            {[
              { value: 'all', label: 'Todos' },
              { value: 'punch_cards', label: '🎴 Punch Cards' },
              { value: 'vip_levels', label: '🏆 VIP' },
              { value: 'experiences', label: '✨ Experiencias' },
            ]?.map(f => (
              <button
                key={f?.value}
                onClick={() => setFilterModule(f?.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterModule === f?.value ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >{f?.label}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Estado:</span>
          <div className="flex gap-1">
            {[{ value: 'all', label: 'Todos' }, { value: 'active', label: 'Activos' }, { value: 'paused', label: 'Pausados' }]?.map(f => (
              <button
                key={f?.value}
                onClick={() => setFilterStatus(f?.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterStatus === f?.value ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >{f?.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Rules Table */}
      {filteredRules?.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">⚡</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {rules?.length === 0 ? 'No hay reglas configuradas' : 'Sin resultados para este filtro'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {rules?.length === 0
              ? 'Crea tu primera regla de automatización para el módulo de recompensas' :'Prueba cambiando los filtros'}
          </p>
          {rules?.length === 0 && (
            <Button onClick={() => setShowNewRule(true)}>
              <Icon name="Plus" size={16} className="mr-2" />
              Crear primera regla
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Trigger</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Acción</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Módulo origen</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estado</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Disparos/mes</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRules?.map(rule => {
                  const moduleInfo = MODULE_LABELS?.[rule?.source_module];
                  const actionInfo = ACTION_LABELS?.[rule?.action_type];
                  return (
                    <tr key={rule?.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-foreground text-sm">{rule?.rule_name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{TRIGGER_LABELS?.[rule?.trigger_type]}</p>
                          {rule?.trigger_source_name && (
                            <p className="text-xs text-primary mt-0.5">📌 {rule?.trigger_source_name}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{actionInfo?.emoji}</span>
                          <span className="text-sm text-foreground">{actionInfo?.label}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          moduleInfo?.color
                        }`}>
                          {moduleInfo?.emoji} {moduleInfo?.label}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Toggle
                            value={rule?.is_active}
                            onChange={() => handleToggle(rule)}
                          />
                          <span className={`text-xs font-medium ${
                            rule?.is_active ? 'text-success' : 'text-muted-foreground'
                          }`}>
                            {rule?.is_active ? 'Activo' : 'Pausado'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm font-bold text-foreground">{rule?.fires_this_month || 0}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleDelete(rule?.id)}
                          className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Eliminar regla"
                        >
                          <Icon name="Trash2" size={14} className="text-destructive" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trigger reference cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            emoji: '🎴',
            title: 'Punch Cards',
            desc: 'Triggers al completar tarjetas de sellos',
            actions: ['Mensaje de felicitación', 'Bonus de referido', 'Recompensa sorpresa', 'Inscribir en flow'],
            color: 'border-blue-500/30 bg-blue-500/5',
            badge: 'bg-blue-500/10 text-blue-600',
          },
          {
            emoji: '🏆',
            title: 'Niveles VIP',
            desc: 'Triggers al subir de nivel de membresía',
            actions: ['Felicitación personalizada', 'Puntos de celebración', 'Beneficio especial', 'Notificar staff'],
            color: 'border-yellow-500/30 bg-yellow-500/5',
            badge: 'bg-yellow-500/10 text-yellow-600',
          },
          {
            emoji: '✨',
            title: 'Experiencias',
            desc: 'Triggers al reclamar experiencias exclusivas',
            actions: ['Confirmación y detalles', 'Solicitar reseña 24h', 'Puntos bonus', 'Referral especial'],
            color: 'border-purple-500/30 bg-purple-500/5',
            badge: 'bg-purple-500/10 text-purple-600',
          },
        ]?.map((card, i) => (
          <div key={i} className={`rounded-xl border p-4 ${card?.color}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{card?.emoji}</span>
              <div>
                <p className="font-semibold text-foreground text-sm">{card?.title}</p>
                <p className="text-xs text-muted-foreground">{card?.desc}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {card?.actions?.map((action, j) => (
                <div key={j} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
                  <span className="text-xs text-muted-foreground">{action}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showNewRule && (
        <NewRuleModal
          onClose={() => setShowNewRule(false)}
          onSave={handleSaveRule}
          saving={saving}
        />
      )}
    </div>
  );
};

export default RewardsAutomationTab;
