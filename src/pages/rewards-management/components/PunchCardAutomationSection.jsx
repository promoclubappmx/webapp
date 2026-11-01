import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { POINTS_RULES, pointsToMXN } from '../../../services/rewardsService';

const Toggle = ({ value, onChange, label, description }) => (
  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
    <div className="flex-1 pr-4">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
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
  </div>
);

const PunchCardAutomationSection = ({ automation, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const set = (k, v) => onChange({ ...automation, [k]: v });

  const hasAnyConfig = automation?.sendMessage || automation?.referralBonus || automation?.surpriseReward || automation?.automationFlow;
  const activeCount = [automation?.sendMessage, automation?.referralBonus, automation?.surpriseReward, automation?.automationFlow]?.filter(Boolean)?.length;

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
            <span className="text-base">⚡</span>
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground text-sm">Al completar esta tarjeta...</p>
            <p className="text-xs text-muted-foreground">
              {activeCount > 0 ? `${activeCount} acción${activeCount > 1 ? 'es' : ''} configurada${activeCount > 1 ? 's' : ''}` : 'Configura acciones automáticas'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasAnyConfig && (
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
              {activeCount} activa{activeCount > 1 ? 's' : ''}
            </span>
          )}
          <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground" />
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4 border-t border-border bg-muted/10">
          {/* Send congratulations message */}
          <div className="space-y-3">
            <Toggle
              value={automation?.sendMessage || false}
              onChange={v => set('sendMessage', v)}
              label="Enviar mensaje de felicitación"
              description="Notifica al cliente cuando complete la tarjeta"
            />
            {automation?.sendMessage && (
              <div className="ml-4 space-y-3 p-3 bg-card border border-border rounded-xl">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Canal</label>
                  <select
                    value={automation?.messageChannel || 'push'}
                    onChange={e => set('messageChannel', e?.target?.value)}
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
                    value={automation?.messageText || ''}
                    onChange={e => set('messageText', e?.target?.value)}
                    placeholder="¡Felicidades {nombre}! Completaste tu tarjeta {tarjeta} en {negocio}. Tu recompensa está lista para canjear."
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Referral bonus */}
          <div className="space-y-3">
            <Toggle
              value={automation?.referralBonus || false}
              onChange={v => set('referralBonus', v)}
              label="Activar bonus de referido"
              description="El cliente recibe puntos extra si refiere a alguien después de completar"
            />
            {automation?.referralBonus && (
              <div className="ml-4 p-3 bg-card border border-border rounded-xl space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Puntos bonus</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number" min="1"
                        value={automation?.referralPoints || ''}
                        onChange={e => set('referralPoints', parseInt(e?.target?.value))}
                        placeholder="50"
                        className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                      />
                    </div>
                    {automation?.referralPoints > 0 && (
                      <p className="text-xs text-success mt-1">= ${pointsToMXN(automation?.referralPoints)} MXN</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Válido por (días)</label>
                    <input
                      type="number" min="1" max="365"
                      value={automation?.referralDays || 30}
                      onChange={e => set('referralDays', parseInt(e?.target?.value))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">1 pto = ${POINTS_RULES?.POINT_VALUE_MXN} MXN · ${POINTS_RULES?.MXN_PER_POINT} MXN = 1 pto</p>
              </div>
            )}
          </div>

          {/* Surprise reward */}
          <Toggle
            value={automation?.surpriseReward || false}
            onChange={v => set('surpriseReward', v)}
            label="Activar recompensa sorpresa"
            description="Dispara la mecánica de sorpresa configurada en el tab Sorpresas (ruleta, scratch, cofre)"
          />

          {/* Automation flow */}
          <div className="space-y-3">
            <Toggle
              value={automation?.automationFlow || false}
              onChange={v => set('automationFlow', v)}
              label="Inscribir en flow de automatización"
              description="Agrega al cliente a un flow de mensajes automáticos"
            />
            {automation?.automationFlow && (
              <div className="ml-4 p-3 bg-card border border-border rounded-xl">
                <label className="block text-xs font-medium text-foreground mb-1">Flow activo</label>
                <select
                  value={automation?.flowId || ''}
                  onChange={e => set('flowId', e?.target?.value)}
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
      )}
    </div>
  );
};

export default PunchCardAutomationSection;
