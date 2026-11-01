import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const TRIGGER_GROUPS = [
  {
    id: 'visits',
    label: 'Visitas y Check-ins',
    icon: 'MapPin',
    color: 'text-blue-600',
    bg: 'bg-blue-500/10',
    triggers: [
      { id: 'post_checkin', label: 'Al hacer check-in', desc: 'Cada vez que el cliente registra una visita verificada.', est: '~300/mes', icon: '📍' },
      { id: 'first_visit_ever', label: 'Primera visita histórica (bienvenida)', desc: 'La primera vez que el cliente visita el negocio. Solo ocurre una vez.', est: '~X nuevos/mes', icon: '🌟' },
      { id: 'first_visit_month', label: 'Primera visita del mes', desc: 'La primera vez que el cliente visita en el mes calendario.', est: '~X activaciones/mes', icon: '📅' },
      { id: 'milestone', label: 'Al alcanzar hito de visitas', desc: 'Al llegar a 10, 25, 50 visitas acumuladas.', est: '~12/mes', icon: '🏆', hasConfig: true },
      { id: 'specific_time', label: 'Visita en horario/día específico', desc: 'El cliente hace check-in en un día de la semana o rango de horas configurado.', est: 'Por tráfico', icon: '⏰', hasConfig: true },
    ],
  },
  {
    id: 'loyalty',
    label: 'Lealtad y Puntos',
    icon: 'Star',
    color: 'text-amber-600',
    bg: 'bg-amber-500/10',
    triggers: [
      { id: 'punch_complete', label: 'Al completar punch card', desc: 'Cuando el cliente acumula todos los sellos de una tarjeta.', est: '~45/mes', icon: '🎴' },
      { id: 'vip_upgrade', label: 'Al subir de nivel VIP', desc: 'El cliente asciende de Bronce a Plata, o de Plata a Oro.', est: '~X ascensos/mes', icon: '👑', hasConfig: true },
      { id: 'points_milestone', label: 'Al alcanzar saldo de puntos específico', desc: 'El cliente llega a un umbral de puntos acumulados por primera vez.', est: 'Por umbral', icon: '💎', hasConfig: true },
    ],
  },
  {
    id: 'temporal',
    label: 'Contexto Temporal',
    icon: 'Calendar',
    color: 'text-purple-600',
    bg: 'bg-purple-500/10',
    triggers: [
      { id: 'birthday', label: 'Cumpleaños', desc: 'Enviado automáticamente en el cumpleaños del cliente.', est: '~8/mes', icon: '🎂', hasConfig: true },
      { id: 'anniversary', label: 'Aniversario como cliente', desc: 'Al cumplir 6 meses o 1 año desde la primera visita.', est: 'Por hito', icon: '🎉', hasConfig: true },
    ],
  },
  {
    id: 'social',
    label: 'Social y Referidos',
    icon: 'Users',
    color: 'text-green-600',
    bg: 'bg-green-500/10',
    triggers: [
      { id: 'referral_register', label: 'Al referir a un amigo (registro)', desc: 'El cliente comparte su link y un amigo se registra.', est: '~X registros/mes', icon: '🔗', hasConfig: true },
      { id: 'verified_review', label: 'Al dejar una reseña verificada', desc: 'El cliente publica una reseña verificada post-visita.', est: '~X reseñas/mes', icon: '⭐' },
    ],
  },
  {
    id: 'crm',
    label: 'CRM y Segmento',
    icon: 'Database',
    color: 'text-rose-600',
    bg: 'bg-rose-500/10',
    triggers: [
      { id: 'reactivation', label: 'Al reactivarse después de dormido', desc: 'El cliente llevaba más de X días sin visitar y regresa.', est: '~X reactivaciones/mes', icon: '🔄', hasConfig: true },
      { id: 'post_coupon', label: 'Al canjear un cupón', desc: 'Después de que el cliente usa un cupón de descuento.', est: '~80/mes', icon: '🎟️' },
      { id: 'manual', label: 'Por invitación manual', desc: 'El negocio envía la sorpresa directamente desde el CRM.', est: 'Manual', icon: '📤' },
    ],
  },
];

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-primary' : 'bg-muted'}`}
  >
    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
  </button>
);

const TriggerCard = ({ trigger, isActive, onToggle, config, onConfigChange }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-xl border-2 transition-all ${isActive ? 'border-primary bg-primary/5' : 'border-border'}`}>
      <div className="flex items-start gap-3 p-4">
        <label className="flex items-start gap-3 flex-1 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={e => onToggle(e?.target?.checked)}
            className="mt-1 flex-shrink-0 accent-primary"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base">{trigger?.icon}</span>
              <span className="font-medium text-foreground text-sm">{trigger?.label}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{trigger?.desc}</p>
            <span className="inline-block mt-1 px-1.5 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">{trigger?.est}</span>
          </div>
        </label>
        {trigger?.hasConfig && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
          >
            <Icon name={expanded ? 'ChevronUp' : 'ChevronDown'} size={14} className="text-muted-foreground" />
          </button>
        )}
      </div>

      {expanded && trigger?.hasConfig && (
        <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-3">
          {/* Limit */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Límite mensual para este trigger</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={config?.monthlyLimit || 0}
                onChange={e => onConfigChange({ ...config, monthlyLimit: parseInt(e?.target?.value) })}
                className="w-20 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none"
              />
              <span className="text-xs text-muted-foreground">veces/mes por usuario (0 = sin límite)</span>
            </div>
          </div>

          {trigger?.id === 'milestone' && (
            <div>
              <label className="text-xs font-medium text-foreground block mb-2">Hitos de visitas</label>
              <div className="flex gap-2 flex-wrap">
                {[5, 10, 25, 50, 100]?.map(n => (
                  <label key={n} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(config?.milestones || [10, 25, 50])?.includes(n)}
                      onChange={e => {
                        const ms = config?.milestones || [10, 25, 50];
                        const newMs = e?.target?.checked ? [...ms, n] : ms?.filter(x => x !== n);
                        onConfigChange({ ...config, milestones: newMs });
                      }}
                      className="accent-primary"
                    />
                    <span className="text-xs text-foreground">{n} visitas</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {trigger?.id === 'specific_time' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Días de la semana</label>
                <div className="flex gap-1 flex-wrap">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']?.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const days = config?.days || [];
                        const newDays = days?.includes(day) ? days?.filter(d => d !== day) : [...days, day];
                        onConfigChange({ ...config, days: newDays });
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${(config?.days || [])?.includes(day) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Hora inicio</label>
                  <input type="time" value={config?.startTime || ''} onChange={e => onConfigChange({ ...config, startTime: e?.target?.value })} className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Hora fin</label>
                  <input type="time" value={config?.endTime || ''} onChange={e => onConfigChange({ ...config, endTime: e?.target?.value })} className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none" />
                </div>
              </div>
            </div>
          )}

          {trigger?.id === 'vip_upgrade' && (
            <div>
              <label className="text-xs font-medium text-foreground block mb-2">Transiciones que activan el trigger</label>
              <div className="space-y-1">
                {['Nuevo → Bronce', 'Bronce → Plata', 'Plata → Oro']?.map(t => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(config?.transitions || ['Bronce → Plata', 'Plata → Oro'])?.includes(t)}
                      onChange={e => {
                        const ts = config?.transitions || ['Bronce → Plata', 'Plata → Oro'];
                        const newTs = e?.target?.checked ? [...ts, t] : ts?.filter(x => x !== t);
                        onConfigChange({ ...config, transitions: newTs });
                      }}
                      className="accent-primary"
                    />
                    <span className="text-xs text-foreground">{t}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {trigger?.id === 'birthday' && (
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Días antes del cumpleaños</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={config?.daysBefore || 0}
                  onChange={e => onConfigChange({ ...config, daysBefore: parseInt(e?.target?.value) })}
                  className="w-20 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none"
                />
                <span className="text-xs text-muted-foreground">días antes (0 = el mismo día)</span>
              </div>
            </div>
          )}

          {trigger?.id === 'reactivation' && (
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Días de inactividad para activar</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="7"
                  max="365"
                  value={config?.inactivityDays || 30}
                  onChange={e => onConfigChange({ ...config, inactivityDays: parseInt(e?.target?.value) })}
                  className="w-20 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none"
                />
                <span className="text-xs text-muted-foreground">días sin visitar</span>
              </div>
            </div>
          )}

          {trigger?.id === 'referral_register' && (
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">¿Quién recibe la sorpresa?</label>
              <div className="space-y-1">
                {['El que refiere', 'El referido', 'Ambos']?.map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`referral_recipient_${trigger?.id}`}
                      checked={(config?.recipient || 'El que refiere') === opt}
                      onChange={() => onConfigChange({ ...config, recipient: opt })}
                      className="accent-primary"
                    />
                    <span className="text-xs text-foreground">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SurpriseTriggersTab = ({ form, onChange }) => {
  const activeTriggers = form?.activeTriggers || {};
  const triggerConfigs = form?.triggerConfigs || {};

  const toggleTrigger = (triggerId, checked) => {
    onChange({ ...form, activeTriggers: { ...activeTriggers, [triggerId]: checked } });
  };

  const updateTriggerConfig = (triggerId, config) => {
    onChange({ ...form, triggerConfigs: { ...triggerConfigs, [triggerId]: config } });
  };

  const activeCount = Object.values(activeTriggers)?.filter(Boolean)?.length;

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Icon name="Zap" size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Triggers de activación</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Define cuándo se entregará esta sorpresa al cliente. Puedes activar múltiples triggers.
            {activeCount > 0 && <span className="font-semibold"> ({activeCount} activo{activeCount !== 1 ? 's' : ''})</span>}
          </p>
        </div>
      </div>

      {/* Anti-saturation */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
            <Icon name="Shield" size={16} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Anti-saturación global</h3>
            <p className="text-xs text-muted-foreground">Límites generales para esta sorpresa</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Máximo por usuario por día</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={form?.maxPerUserDay || 1}
                onChange={e => onChange({ ...form, maxPerUserDay: parseInt(e?.target?.value) })}
                className="w-20 px-2.5 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
              />
              <span className="text-xs text-muted-foreground">sorpresas/día (0 = sin límite)</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Máximo por usuario por mes</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={form?.maxPerUserMonth || 5}
                onChange={e => onChange({ ...form, maxPerUserMonth: parseInt(e?.target?.value) })}
                className="w-20 px-2.5 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
              />
              <span className="text-xs text-muted-foreground">sorpresas/mes (0 = sin límite)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trigger Groups */}
      {TRIGGER_GROUPS?.map(group => (
        <div key={group?.id} className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3 mb-1">
            <div className={`w-8 h-8 ${group?.bg} rounded-lg flex items-center justify-center`}>
              <Icon name={group?.icon} size={16} className={group?.color} />
            </div>
            <h3 className="font-semibold text-foreground">{group?.label}</h3>
          </div>
          <div className="space-y-2">
            {group?.triggers?.map(trigger => (
              <TriggerCard
                key={trigger?.id}
                trigger={trigger}
                isActive={activeTriggers?.[trigger?.id] || false}
                onToggle={checked => toggleTrigger(trigger?.id, checked)}
                config={triggerConfigs?.[trigger?.id] || {}}
                onConfigChange={config => updateTriggerConfig(trigger?.id, config)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SurpriseTriggersTab;
