import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const CONFIRMATION_MODES = [
  {
    id: 'auto',
    label: 'Automática',
    icon: 'Zap',
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    activeBg: 'bg-emerald-600',
    border: 'border-emerald-300',
    activeBorder: 'border-emerald-600',
    ring: 'ring-emerald-400',
    description: 'El usuario reserva y se confirma al instante. Sin intervención del negocio.',
    recommended: 'Clases, turnos, mesas con alta rotación',
  },
  {
    id: 'manual',
    label: 'Manual',
    icon: 'UserCheck',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    activeBg: 'bg-amber-600',
    border: 'border-amber-300',
    activeBorder: 'border-amber-600',
    ring: 'ring-amber-400',
    description: 'El negocio revisa y aprueba o rechaza cada solicitud.',
    recommended: 'Restaurantes exclusivos, eventos de cupo limitado',
  },
  {
    id: 'hybrid',
    label: 'Híbrida',
    icon: 'GitBranch',
    color: 'text-violet-600',
    bg: 'bg-violet-100',
    activeBg: 'bg-violet-600',
    border: 'border-violet-300',
    activeBorder: 'border-violet-600',
    ring: 'ring-violet-400',
    description: 'Reglas condicionales: auto para algunos casos, manual para otros.',
    recommended: 'Negocios con reglas específicas por horario, grupo o nivel VIP',
  },
];

const RESPONSE_TIME_OPTIONS = [
  { value: 1, label: '1 hora' },
  { value: 2, label: '2 horas' },
  { value: 4, label: '4 horas' },
  { value: 8, label: '8 horas' },
  { value: 24, label: '24 horas' },
];

const REMINDER_TIME_OPTIONS = [
  { value: 1, label: '1 hora antes' },
  { value: 2, label: '2 horas antes' },
  { value: 4, label: '4 horas antes' },
  { value: 12, label: '12 horas antes' },
  { value: 24, label: '24 horas antes' },
];

const HYBRID_CONDITIONS = [
  { value: 'group_size', label: 'Tamaño del grupo' },
  { value: 'schedule', label: 'Horario (día/hora)' },
  { value: 'vip_level', label: 'Nivel VIP del cliente' },
  { value: 'reservation_type', label: 'Tipo de reservación' },
];

const ConfirmationFlow = ({ config, onChange }) => {
  const mode = config?.confirmationMode || 'auto';
  const hybridRules = config?.hybridRules || [];
  const reminders = config?.reminders || [{ hours: 24, enabled: true }, { hours: 2, enabled: true }];

  const setMode = (m) => onChange({ ...config, confirmationMode: m });

  const addHybridRule = () => {
    onChange({
      ...config,
      hybridRules: [...hybridRules, { condition: 'group_size', operator: 'gte', value: '5', action: 'manual' }],
    });
  };
  const updateRule = (i, field, val) => {
    const rules = hybridRules?.map((r, idx) => idx === i ? { ...r, [field]: val } : r);
    onChange({ ...config, hybridRules: rules });
  };
  const removeRule = (i) => onChange({ ...config, hybridRules: hybridRules?.filter((_, idx) => idx !== i) });

  const updateReminder = (i, field, val) => {
    const newReminders = reminders?.map((r, idx) => idx === i ? { ...r, [field]: val } : r);
    onChange({ ...config, reminders: newReminders });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
        <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon name="CheckCircle2" size={18} className="text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Flujo de confirmación</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Define cómo se procesan las solicitudes de reservación. Esta decisión afecta directamente la experiencia del usuario y el control operativo del negocio.</p>
        </div>
      </div>
      {/* Mode selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CONFIRMATION_MODES?.map(m => {
          const isActive = mode === m?.id;
          return (
            <button
              key={m?.id}
              onClick={() => setMode(m?.id)}
              className={`text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                isActive
                  ? `${m?.activeBorder} ${m?.bg} shadow-md ring-2 ${m?.ring} ring-offset-1`
                  : 'border-border bg-card hover:bg-muted/30'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 ${isActive ? m?.activeBg : m?.bg} rounded-xl flex items-center justify-center`}>
                  <Icon name={m?.icon} size={16} className={isActive ? 'text-white' : m?.color} />
                </div>
                {isActive && (
                  <div className={`w-5 h-5 ${m?.activeBg} rounded-full flex items-center justify-center`}>
                    <Icon name="Check" size={11} className="text-white" />
                  </div>
                )}
              </div>
              <h4 className="font-semibold text-foreground text-sm mb-1">{m?.label}</h4>
              <p className="text-xs text-muted-foreground mb-2">{m?.description}</p>
              <p className="text-xs text-muted-foreground italic">Recomendado: {m?.recommended}</p>
            </button>
          );
        })}
      </div>
      {/* Manual mode: response time */}
      {(mode === 'manual' || mode === 'hybrid') && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
            <Icon name="Clock" size={15} className="text-amber-600" />
            Tiempo máximo de respuesta (modo manual)
          </h4>
          <div className="flex flex-wrap gap-2">
            {RESPONSE_TIME_OPTIONS?.map(opt => (
              <button
                key={opt?.value}
                onClick={() => onChange({ ...config, responseTimeHours: opt?.value })}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  (config?.responseTimeHours ?? 4) === opt?.value
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-amber-100 hover:text-amber-700'
                }`}
              >
                {opt?.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-xl p-3">
            <Icon name="Info" size={12} className="inline mr-1 text-amber-600" />
            Si no respondes en {config?.responseTimeHours ?? 4} horas, la solicitud se cancela automáticamente y el cliente es notificado. Respuestas rápidas generan más confianza.
          </p>
        </div>
      )}
      {/* Hybrid rules */}
      {mode === 'hybrid' && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Icon name="GitBranch" size={15} className="text-violet-600" />
              Reglas condicionales
            </h4>
            <button onClick={addHybridRule} className="flex items-center gap-1.5 text-xs bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-700 transition-colors">
              <Icon name="Plus" size={12} /> Agregar regla
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Las reglas se evalúan en orden. La primera que aplique determina el modo de confirmación.</p>
          <div className="space-y-3">
            {hybridRules?.map((rule, i) => (
              <div key={i} className="flex items-center gap-3 bg-muted/30 border border-border rounded-xl p-3">
                <span className="text-xs font-medium text-muted-foreground w-5 text-center">{i + 1}</span>
                <span className="text-xs text-muted-foreground">SI</span>
                <select value={rule?.condition} onChange={e => updateRule(i, 'condition', e?.target?.value)} className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-violet-400">
                  {HYBRID_CONDITIONS?.map(c => <option key={c?.value} value={c?.value}>{c?.label}</option>)}
                </select>
                <input value={rule?.value} onChange={e => updateRule(i, 'value', e?.target?.value)} placeholder="valor" className="w-20 text-xs border border-border rounded-lg px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-violet-400" />
                <span className="text-xs text-muted-foreground">ENTONCES</span>
                <select value={rule?.action} onChange={e => updateRule(i, 'action', e?.target?.value)} className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-violet-400">
                  <option value="auto">Automática</option>
                  <option value="manual">Manual</option>
                </select>
                <button onClick={() => removeRule(i)} className="ml-auto text-muted-foreground hover:text-destructive"><Icon name="X" size={14} /></button>
              </div>
            ))}
            {hybridRules?.length === 0 && (
              <div className="text-center py-4 text-muted-foreground text-xs border-2 border-dashed border-border rounded-xl">
                Agrega reglas para definir cuándo aplicar confirmación automática o manual
              </div>
            )}
          </div>
        </div>
      )}
      {/* Notification settings */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
          <Icon name="Bell" size={15} className="text-blue-600" />
          Notificaciones al negocio
        </h4>
        <div className="space-y-2">
          {[
            { key: 'notifyPush', label: 'Push al administrador' },
            { key: 'notifyEmail', label: 'Email al propietario' },
          ]?.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={config?.[key] ?? true}
                onChange={e => onChange({ ...config, [key]: e?.target?.checked })}
                className="rounded"
              />
              {label}
            </label>
          ))}
        </div>
      </div>
      {/* Reminder configuration */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
          <Icon name="AlarmClock" size={15} className="text-emerald-600" />
          Recordatorios automáticos al usuario
        </h4>
        <p className="text-xs text-muted-foreground">El sistema envía push al usuario confirmado antes de su reservación.</p>
        <div className="space-y-3">
          {reminders?.map((reminder, i) => (
            <div key={i} className="flex items-center gap-3 bg-muted/30 border border-border rounded-xl p-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminder?.enabled}
                  onChange={e => updateReminder(i, 'enabled', e?.target?.checked)}
                  className="rounded"
                />
              </label>
              <select
                value={reminder?.hours}
                onChange={e => updateReminder(i, 'hours', +e?.target?.value)}
                disabled={!reminder?.enabled}
                className="text-sm border border-border rounded-lg px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50"
              >
                {REMINDER_TIME_OPTIONS?.map(opt => <option key={opt?.value} value={opt?.value}>{opt?.label}</option>)}
              </select>
              <span className="text-xs text-muted-foreground flex-1">
                {reminder?.hours === 24 ? '"Recordatorio: mañana tienes tu reservación en [negocio] a las [hora]"' : `"En ${reminder?.hours} hora${reminder?.hours > 1 ? 's' : ''}: tu reservación en [negocio]. ¿Sigues confirmado?"`}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Custom messages */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
          <Icon name="MessageSquare" size={15} className="text-indigo-600" />
          Mensajes personalizados
        </h4>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Mensaje de confirmación</label>
            <textarea
              value={config?.confirmationMessage ?? '¡Tu reservación en {negocio} está confirmada! {tipo}: {detalle}. {fecha} a las {hora}. ¡Te esperamos!'}
              onChange={e => onChange({ ...config, confirmationMessage: e?.target?.value })}
              rows={2}
              className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">Variables: {'{nombre_cliente}'}, {'{negocio}'}, {'{tipo}'}, {'{fecha}'}, {'{hora}'}, {'{personas}'}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Mensaje de rechazo</label>
            <textarea
              value={config?.rejectionMessage ?? 'Lo sentimos, no pudimos confirmar tu reservación en {negocio} para {fecha} a las {hora}. ¿Te gustaría intentar otro horario?'}
              onChange={e => onChange({ ...config, rejectionMessage: e?.target?.value })}
              rows={2}
              className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationFlow;
