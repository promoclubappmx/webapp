import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { pointsToMXN } from '../../../services/rewardsService';

const Toggle = ({ value, onChange, label, description }) => (
  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
    <div className="flex-1 pr-4">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative ${value ? 'bg-primary' : 'bg-muted'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  </div>
);

const ChannelSelect = ({ value, onChange }) => (
  <select
    value={value || 'push'}
    onChange={e => onChange(e?.target?.value)}
    className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none"
  >
    <option value="push">Push notification</option>
    <option value="whatsapp">WhatsApp</option>
    <option value="push_whatsapp">Push + WhatsApp</option>
    <option value="email">Email</option>
  </select>
);

const TriggerSection = ({ title, icon, color, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between p-3 hover:bg-muted/20 transition-all`}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <p className="font-semibold text-foreground text-xs">{title}</p>
        </div>
        <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={14} className="text-muted-foreground" />
      </button>
      {open && <div className="p-3 space-y-3 border-t border-border bg-muted/10">{children}</div>}
    </div>
  );
};

// ─── ASCENT TRIGGER (Al subir de nivel) ─────────────────────────────────────
const AscentTrigger = ({ levelName, automation, onChange }) => {
  const set = (k, v) => onChange({ ...automation, [k]: v });

  const activeCount = [
    automation?.sendPushCelebration,
    automation?.sendWhatsAppCelebration,
    automation?.celebrationPoints,
    automation?.welcomeCoupon,
    automation?.exclusivePunchCard,
    automation?.registerAchievement,
    automation?.notifyOwner,
    automation?.addCRMTag,
  ]?.filter(Boolean)?.length;

  return (
    <TriggerSection
      title={`Al subir a ${levelName}...`}
      icon="🚀"
      color="warning"
      defaultOpen={false}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground">8 acciones disponibles</p>
        {activeCount > 0 && (
          <span className="px-2 py-0.5 bg-warning/10 text-warning text-xs font-medium rounded-full border border-warning/20">
            {activeCount} activa{activeCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* 1. Push de celebración */}
      <div className="space-y-2">
        <Toggle
          value={automation?.sendPushCelebration || false}
          onChange={v => set('sendPushCelebration', v)}
          label="🎉 Push de celebración personalizado"
          description="Notificación push con mensaje de bienvenida al nivel"
        />
        {automation?.sendPushCelebration && (
          <div className="ml-3 p-3 bg-card border border-border rounded-xl space-y-2">
            <label className="block text-xs font-medium text-foreground mb-1">
              Mensaje <span className="text-muted-foreground font-normal">({'{nombre}'} {'{nivel}'} {'{negocio}'} {'{beneficio_nuevo}'})</span>
            </label>
            <textarea
              value={automation?.pushCelebrationMessage || ''}
              onChange={e => set('pushCelebrationMessage', e?.target?.value)}
              placeholder={`¡Felicidades {nombre}! 🎉 Alcanzaste el nivel ${levelName} en {negocio}. Disfruta: {beneficio_nuevo}`}
              rows={2}
              className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none resize-none"
            />
            {automation?.pushCelebrationMessage && (
              <div className="p-2 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-xs text-muted-foreground font-medium mb-1">Preview:</p>
                <p className="text-xs text-foreground">
                  {automation?.pushCelebrationMessage
                    ?.replace('{nombre}', 'María')
                    ?.replace('{nivel}', levelName)
                    ?.replace('{negocio}', 'Tu Negocio')
                    ?.replace('{beneficio_nuevo}', '10% descuento')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. WhatsApp de celebración */}
      <div className="space-y-2">
        <Toggle
          value={automation?.sendWhatsAppCelebration || false}
          onChange={v => set('sendWhatsAppCelebration', v)}
          label="💬 WhatsApp de celebración"
          description="Canal adicional para clientes sin push activo"
        />
        {automation?.sendWhatsAppCelebration && (
          <div className="ml-3 p-3 bg-card border border-border rounded-xl">
            <label className="block text-xs font-medium text-foreground mb-1">Mensaje WhatsApp</label>
            <textarea
              value={automation?.whatsAppCelebrationMessage || ''}
              onChange={e => set('whatsAppCelebrationMessage', e?.target?.value)}
              placeholder={`¡Hola {nombre}! 🥳 Ya eres cliente ${levelName} de {negocio}. Gracias por tu fidelidad.`}
              rows={2}
              className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none resize-none"
            />
          </div>
        )}
      </div>

      {/* 3. Puntos bonus de bienvenida */}
      <div className="space-y-2">
        <Toggle
          value={automation?.celebrationPoints || false}
          onChange={v => set('celebrationPoints', v)}
          label="⭐ Acreditar puntos bonus de bienvenida"
          description="Puntos one-time al alcanzar el nivel"
        />
        {automation?.celebrationPoints && (
          <div className="ml-3 p-3 bg-card border border-border rounded-xl">
            <div className="flex items-center gap-2">
              <input
                type="number" min="1"
                value={automation?.celebrationPointsAmount || ''}
                onChange={e => set('celebrationPointsAmount', parseInt(e?.target?.value))}
                placeholder="100"
                className="w-24 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none"
              />
              <span className="text-xs text-muted-foreground">puntos</span>
              {(automation?.celebrationPointsAmount || 0) > 0 && (
                <span className="text-xs font-semibold text-success">= ${pointsToMXN(automation?.celebrationPointsAmount)} MXN</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Cupón exclusivo de bienvenida */}
      <div className="space-y-2">
        <Toggle
          value={automation?.welcomeCoupon || false}
          onChange={v => set('welcomeCoupon', v)}
          label="🎟️ Generar cupón exclusivo de bienvenida"
          description="Regalo puntual de celebración (diferente al descuento permanente)"
        />
        {automation?.welcomeCoupon && (
          <div className="ml-3 p-3 bg-card border border-border rounded-xl space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Tipo de cupón</label>
                <select
                  value={automation?.welcomeCouponType || 'discount_pct'}
                  onChange={e => set('welcomeCouponType', e?.target?.value)}
                  className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none"
                >
                  <option value="discount_pct">% Descuento</option>
                  <option value="discount_mxn">MXN Descuento</option>
                  <option value="free_product">Producto gratis</option>
                  <option value="2x1">2x1</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Valor</label>
                <input
                  type="text"
                  value={automation?.welcomeCouponValue || ''}
                  onChange={e => set('welcomeCouponValue', e?.target?.value)}
                  placeholder="20"
                  className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Vigencia (días)</label>
              <input
                type="number" min="1"
                value={automation?.welcomeCouponDays || 30}
                onChange={e => set('welcomeCouponDays', parseInt(e?.target?.value))}
                className="w-24 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* 5. Punch card exclusiva */}
      <div className="space-y-2">
        <Toggle
          value={automation?.exclusivePunchCard || false}
          onChange={v => set('exclusivePunchCard', v)}
          label="🃏 Activar punch card exclusiva del nivel"
          description="Punch card solo disponible para este nivel, se activa automáticamente"
        />
        {automation?.exclusivePunchCard && (
          <div className="ml-3 p-3 bg-card border border-border rounded-xl">
            <label className="block text-xs font-medium text-foreground mb-1">Punch card a activar</label>
            <select
              value={automation?.exclusivePunchCardId || ''}
              onChange={e => set('exclusivePunchCardId', e?.target?.value)}
              className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none"
            >
              <option value="">Seleccionar punch card...</option>
              <option value="pc_exclusive_silver">Punch Card Exclusiva Plata</option>
              <option value="pc_exclusive_gold">Punch Card Exclusiva Oro</option>
              <option value="pc_vip_premium">Punch Card VIP Premium</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">Gestiona punch cards en <span className="text-primary">/punch-cards-management</span></p>
          </div>
        )}
      </div>

      {/* 6. Registrar logro */}
      <div className="space-y-2">
        <Toggle
          value={automation?.registerAchievement || false}
          onChange={v => set('registerAchievement', v)}
          label="🏆 Registrar logro en módulo de Logros"
          description="Conecta el ascenso con un logro específico del sistema"
        />
        {automation?.registerAchievement && (
          <div className="ml-3 p-3 bg-card border border-border rounded-xl">
            <label className="block text-xs font-medium text-foreground mb-1">Logro a registrar</label>
            <input
              type="text"
              value={automation?.achievementName || ''}
              onChange={e => set('achievementName', e?.target?.value)}
              placeholder={`Miembro ${levelName}`}
              className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* 7. Notificar al Owner */}
      <div className="space-y-2">
        <Toggle
          value={automation?.notifyOwner || false}
          onChange={v => set('notifyOwner', v)}
          label="👤 Notificar al Owner"
          description="Push interno al propietario cuando un cliente sube a este nivel"
        />
        {automation?.notifyOwner && (
          <div className="ml-3 p-3 bg-card border border-border rounded-xl">
            <p className="text-xs text-muted-foreground">
              Mensaje automático: <span className="text-foreground font-medium">"[Cliente] acaba de subir a {levelName}. Considera felicitarlo personalmente."</span>
            </p>
          </div>
        )}
      </div>

      {/* 8. Agregar etiqueta CRM */}
      <div className="space-y-2">
        <Toggle
          value={automation?.addCRMTag || false}
          onChange={v => set('addCRMTag', v)}
          label="🏷️ Agregar etiqueta CRM automáticamente"
          description="El cliente recibe un tag en su perfil del CRM al subir de nivel"
        />
        {automation?.addCRMTag && (
          <div className="ml-3 p-3 bg-card border border-border rounded-xl">
            <label className="block text-xs font-medium text-foreground mb-1">Etiqueta a agregar</label>
            <input
              type="text"
              value={automation?.crmTagName || ''}
              onChange={e => set('crmTagName', e?.target?.value)}
              placeholder={levelName === 'Oro' ? 'VIP, Cliente Premium' : `Cliente ${levelName}`}
              className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none"
            />
            <p className="text-xs text-muted-foreground mt-1">Separa múltiples etiquetas con comas</p>
          </div>
        )}
      </div>
    </TriggerSection>
  );
};

// ─── MAINTENANCE TRIGGER (En riesgo de bajar) ────────────────────────────────
const MaintenanceTrigger = ({ levelName, config, onChange }) => {
  const set = (k, v) => onChange({ ...config, [k]: v });
  return (
    <TriggerSection title={`Al estar en riesgo de bajar de ${levelName}`} icon="⚠️" color="warning">
      <p className="text-xs text-muted-foreground mb-2">Solo aplica con evaluación periódica activa</p>
      <Toggle
        value={config?.enabled || false}
        onChange={v => set('enabled', v)}
        label="Activar trigger de riesgo"
        description="Se dispara N días antes de la re-evaluación si el cliente no cumple el mínimo"
      />
      {config?.enabled && (
        <div className="space-y-3 mt-2">
          <div className="p-3 bg-card border border-border rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-foreground whitespace-nowrap">Activar</label>
              <input
                type="number" min="1" max="30"
                value={config?.daysBeforeEval || 7}
                onChange={e => set('daysBeforeEval', parseInt(e?.target?.value))}
                className="w-16 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none"
              />
              <label className="text-xs text-muted-foreground">días antes de la re-evaluación</label>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Canal</label>
              <ChannelSelect value={config?.channel} onChange={v => set('channel', v)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Mensaje motivador</label>
              <textarea
                value={config?.message || ''}
                onChange={e => set('message', e?.target?.value)}
                placeholder={`¡Atención {nombre}! Tu nivel ${levelName} se re-evalúa en {dias} días. Necesitas {faltante} visitas más para mantenerlo.`}
                rows={2}
                className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none resize-none"
              />
            </div>
          </div>
          <Toggle
            value={config?.sustainedLoyalty || false}
            onChange={v => set('sustainedLoyalty', v)}
            label="🏅 Al mantenerse X meses consecutivos en el nivel"
            description="Reconocimiento especial por lealtad sostenida"
          />
          {config?.sustainedLoyalty && (
            <div className="ml-3 p-3 bg-card border border-border rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-foreground">Meses consecutivos:</label>
                <input
                  type="number" min="1"
                  value={config?.sustainedMonths || 3}
                  onChange={e => set('sustainedMonths', parseInt(e?.target?.value))}
                  className="w-16 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none"
                />
              </div>
              <input
                type="text"
                value={config?.sustainedReward || ''}
                onChange={e => set('sustainedReward', e?.target?.value)}
                placeholder="Ej: Cupón especial de fidelidad"
                className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none"
              />
            </div>
          )}
        </div>
      )}
    </TriggerSection>
  );
};

// ─── DOWNGRADE TRIGGER (Al bajar de nivel) ───────────────────────────────────
const DowngradeTrigger = ({ levelName, config, onChange }) => {
  const set = (k, v) => onChange({ ...config, [k]: v });
  return (
    <TriggerSection title={`Al bajar de ${levelName}`} icon="📉" color="error">
      <p className="text-xs text-muted-foreground mb-2">Solo aplica con evaluación periódica activa</p>
      <Toggle
        value={config?.enabled || false}
        onChange={v => set('enabled', v)}
        label="Activar trigger de bajada"
        description="Mensaje empático cuando el cliente pierde este nivel"
      />
      {config?.enabled && (
        <div className="space-y-3 mt-2">
          <div className="p-3 bg-card border border-border rounded-xl space-y-2">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Canal</label>
              <ChannelSelect value={config?.channel} onChange={v => set('channel', v)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Mensaje motivador <span className="text-muted-foreground font-normal">(nunca punitivo)</span>
              </label>
              <textarea
                value={config?.message || ''}
                onChange={e => set('message', e?.target?.value)}
                placeholder={`Tu nivel ha cambiado a {nivel_nuevo}. ¡Aún tienes grandes beneficios! Visítanos {x} veces este mes para recuperar ${levelName}.`}
                rows={3}
                className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none resize-none"
              />
              <p className="text-xs text-warning mt-1">⚠️ El mensaje de bajada define si el cliente se esfuerza por recuperar o abandona. Usa tono positivo.</p>
            </div>
          </div>
          <Toggle
            value={config?.recoveryIncentive || false}
            onChange={v => set('recoveryIncentive', v)}
            label="🎯 Incluir incentivo de recuperación"
            description="Ofrecer algo especial para motivar la recuperación del nivel"
          />
          {config?.recoveryIncentive && (
            <div className="ml-3 p-3 bg-card border border-border rounded-xl">
              <input
                type="text"
                value={config?.recoveryIncentiveDesc || ''}
                onChange={e => set('recoveryIncentiveDesc', e?.target?.value)}
                placeholder="Ej: Doble puntos en tu próxima visita"
                className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none"
              />
            </div>
          )}
        </div>
      )}
    </TriggerSection>
  );
};

// ─── PROXIMITY TRIGGER (Próximo a subir) ─────────────────────────────────────
const ProximityTrigger = ({ levelName, config, onChange }) => {
  const set = (k, v) => onChange({ ...config, [k]: v });
  return (
    <TriggerSection title={`Al estar próximo a subir a ${levelName}`} icon="🎯" color="success">
      <Toggle
        value={config?.enabled || false}
        onChange={v => set('enabled', v)}
        label="Activar motivación preventiva"
        description="Se activa cuando el cliente está a menos del 20% del umbral de este nivel"
      />
      {config?.enabled && (
        <div className="space-y-3 mt-2">
          <div className="p-3 bg-card border border-border rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-foreground">Activar cuando falte</label>
              <input
                type="number" min="5" max="50"
                value={config?.thresholdPct || 20}
                onChange={e => set('thresholdPct', parseInt(e?.target?.value))}
                className="w-16 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none"
              />
              <label className="text-xs text-muted-foreground">% del umbral</label>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Canal</label>
              <ChannelSelect value={config?.channel} onChange={v => set('channel', v)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Mensaje de motivación</label>
              <textarea
                value={config?.message || ''}
                onChange={e => set('message', e?.target?.value)}
                placeholder={`¡Estás a {faltante} visitas de alcanzar ${levelName}! ¿Nos visitas esta semana?`}
                rows={2}
                className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none resize-none"
              />
            </div>
          </div>
          <Toggle
            value={config?.timeInMaxLevel || false}
            onChange={v => set('timeInMaxLevel', v)}
            label="🏆 Al llevar X meses en el nivel máximo"
            description="Celebración de permanencia en el nivel más alto"
          />
          {config?.timeInMaxLevel && (
            <div className="ml-3 p-3 bg-card border border-border rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-foreground">Meses en nivel máximo:</label>
                <input
                  type="number" min="1"
                  value={config?.maxLevelMonths || 6}
                  onChange={e => set('maxLevelMonths', parseInt(e?.target?.value))}
                  className="w-16 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none"
                />
              </div>
              <textarea
                value={config?.maxLevelMessage || ''}
                onChange={e => set('maxLevelMessage', e?.target?.value)}
                placeholder={`¡Llevas {meses} meses como cliente ${levelName} de {negocio}! Gracias por tu fidelidad. 🎉`}
                rows={2}
                className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none resize-none"
              />
            </div>
          )}
        </div>
      )}
    </TriggerSection>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const VIPLevelAutomationSection = ({ levelName, levelIndex, automation, maintenanceTrigger, downgradeTrigger, proximityTrigger, onChange, onMaintenanceChange, onDowngradeChange, onProximityChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalActive = [
    automation?.sendPushCelebration,
    automation?.sendWhatsAppCelebration,
    automation?.celebrationPoints,
    automation?.welcomeCoupon,
    automation?.exclusivePunchCard,
    automation?.registerAchievement,
    automation?.notifyOwner,
    automation?.addCRMTag,
    maintenanceTrigger?.enabled,
    downgradeTrigger?.enabled,
    proximityTrigger?.enabled,
  ]?.filter(Boolean)?.length;

  return (
    <div className="border border-border rounded-xl overflow-hidden mt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-warning/5 to-transparent hover:from-warning/10 transition-all"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">⚡</span>
          <div className="text-left">
            <p className="font-semibold text-foreground text-xs">Triggers y Automatizaciones</p>
            <p className="text-xs text-muted-foreground">
              {totalActive > 0 ? `${totalActive} acción${totalActive > 1 ? 'es' : ''} configurada${totalActive > 1 ? 's' : ''}` : 'Sin acciones configuradas'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalActive > 0 && (
            <span className="px-2 py-0.5 bg-warning/10 text-warning text-xs font-medium rounded-full border border-warning/20">
              {totalActive}
            </span>
          )}
          <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={14} className="text-muted-foreground" />
        </div>
      </button>

      {isExpanded && (
        <div className="p-3 space-y-3 border-t border-border bg-muted/10">
          {/* Ascent trigger - always available */}
          <AscentTrigger
            levelName={levelName}
            automation={automation || {}}
            onChange={onChange}
          />

          {/* Maintenance trigger - only for non-base levels */}
          {levelIndex > 0 && (
            <MaintenanceTrigger
              levelName={levelName}
              config={maintenanceTrigger || {}}
              onChange={onMaintenanceChange}
            />
          )}

          {/* Downgrade trigger - only for non-base levels */}
          {levelIndex > 0 && (
            <DowngradeTrigger
              levelName={levelName}
              config={downgradeTrigger || {}}
              onChange={onDowngradeChange}
            />
          )}

          {/* Proximity trigger - for all levels except last */}
          <ProximityTrigger
            levelName={levelName}
            config={proximityTrigger || {}}
            onChange={onProximityChange}
          />
        </div>
      )}
    </div>
  );
};

export default VIPLevelAutomationSection;
