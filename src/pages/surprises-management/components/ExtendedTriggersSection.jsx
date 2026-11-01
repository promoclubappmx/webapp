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
      { id: 'post_checkin', label: 'Al hacer check-in', desc: 'Cada vez que el cliente registra una visita verificada.', est: '~300/mes', icon: '📍', isBase: true },
      { id: 'milestone', label: 'Al alcanzar hito de visitas', desc: 'Al llegar a 10, 25, 50 visitas acumuladas.', est: '~12/mes', icon: '🏆', isBase: true },
      { id: 'first_visit_month', label: 'Primera visita del mes', desc: 'La primera vez que el cliente visita en el mes calendario. Se reinicia cada mes.', est: '~[X] activaciones/mes', icon: '📅', note: 'Premia la constancia mensual. Un cliente que visita 8 veces al mes recibe solo 1 sorpresa por este trigger.' },
      { id: 'first_visit_ever', label: 'Primera visita histórica (bienvenida)', desc: 'La primera vez que el cliente visita el negocio. Solo ocurre una vez por cliente.', est: '~[X] nuevos clientes/mes', icon: '🌟', note: 'La sorpresa de bienvenida es el primer momento mágico del cliente con tu negocio.' },
      { id: 'specific_time', label: 'Visita en horario/día específico', desc: 'El cliente hace check-in en un día de la semana o rango de horas configurado.', est: 'Calculado por tráfico', icon: '⏰', hasConfig: true },
      { id: 'active_streak', label: 'Racha activa mantenida', desc: 'El cliente mantiene su racha de visitas consecutivas activa.', est: 'Por hito de racha', icon: '🔥', hasConfig: true },
    ],
  },
  {
    id: 'loyalty',
    label: 'Lealtad y Puntos',
    icon: 'Star',
    color: 'text-amber-600',
    bg: 'bg-amber-500/10',
    triggers: [
      { id: 'punch_complete', label: 'Al completar punch card', desc: 'Cuando el cliente acumula todos los sellos de una tarjeta.', est: '~45/mes', icon: '🎴', isBase: true },
      { id: 'vip_upgrade', label: 'Al subir de nivel VIP', desc: 'El cliente asciende de Bronce a Plata, o de Plata a Oro.', est: '~[X] ascensos/mes', icon: '👑', hasConfig: true },
      { id: 'points_redeem', label: 'Al canjear puntos como descuento', desc: 'El cliente usa sus puntos como descuento en la compra.', est: '~[X] canjes/mes', icon: '💳', hasConfig: true },
      { id: 'points_milestone', label: 'Al alcanzar saldo de puntos específico', desc: 'El cliente llega a un umbral de puntos acumulados por primera vez.', est: 'Por umbral configurado', icon: '💎', hasConfig: true },
      { id: 'prepaid_reload', label: 'Al recargar tarjeta prepago', desc: 'El cliente recarga su tarjeta prepago del negocio.', est: '~[X] recargas/mes', icon: '💰', hasConfig: true },
    ],
  },
  {
    id: 'social',
    label: 'Social y Referidos',
    icon: 'Users',
    color: 'text-green-600',
    bg: 'bg-green-500/10',
    triggers: [
      { id: 'referral_register', label: 'Al referir a un amigo (registro)', desc: 'El cliente comparte su link de referido y un amigo se registra con él.', est: '~[X] registros/mes', icon: '🔗', hasConfig: true },
      { id: 'referral_checkin', label: 'Al referido completar su primera visita', desc: 'Cuando el amigo referido hace su primer check-in en el negocio.', est: '~[X] visitas/mes', icon: '🤝', hasConfig: true },
      { id: 'verified_review', label: 'Al dejar una reseña verificada', desc: 'El cliente publica una reseña verificada post-visita.', est: '~[X] reseñas/mes', icon: '⭐', hasConfig: true, note: 'No condicionar el contenido ni el rating de la reseña. La sorpresa es un incentivo por dejar una reseña, no por dejar una reseña positiva.' },
    ],
  },
  {
    id: 'reservations',
    label: 'Reservaciones',
    icon: 'Calendar',
    color: 'text-purple-600',
    bg: 'bg-purple-500/10',
    triggers: [
      { id: 'reservation_kept', label: 'Al cumplir una reservación sin no-show', desc: 'El cliente reservó y se presentó puntualmente.', est: '~[X] reservaciones/mes', icon: '✅', hasConfig: true, note: 'Premia al cliente puntual y crea incentivo positivo para cumplir reservaciones, reduciendo no-shows.' },
      { id: 'first_reservation', label: 'Al hacer su primera reservación', desc: 'La primera vez que el cliente usa el sistema de reservaciones del negocio.', est: 'Una vez por cliente', icon: '📋', note: 'Una sorpresa por la primera reservación crea el hábito y beneficia al negocio.' },
    ],
  },
  {
    id: 'temporal',
    label: 'Comportamiento Temporal',
    icon: 'Clock',
    color: 'text-orange-600',
    bg: 'bg-orange-500/10',
    triggers: [
      { id: 'anniversary', label: 'Aniversario como cliente', desc: 'Exactamente 6 meses o 1 año desde la primera visita del cliente.', est: 'Por hito de aniversario', icon: '🎂', hasConfig: true, note: 'El aniversario es el momento de mayor emoción en la relación negocio-cliente.' },
      { id: 'first_of_day', label: 'Primera visita del día (primeros N clientes)', desc: 'Los primeros [N] clientes en hacer check-in cada día.', est: 'N clientes/día', icon: '🥇', hasConfig: true, note: 'Genera el hábito de "madrugar". Ideal para cafeterías y panaderías.' },
    ],
  },
  {
    id: 'crm',
    label: 'CRM y Segmento',
    icon: 'Database',
    color: 'text-rose-600',
    bg: 'bg-rose-500/10',
    triggers: [
      { id: 'post_coupon', label: 'Al canjear un cupón', desc: 'Después de que el cliente usa un cupón de descuento.', est: '~80/mes', icon: '🎟️', isBase: true },
      { id: 'manual', label: 'Por invitación manual', desc: 'El negocio envía la sorpresa directamente desde el CRM.', est: 'Manual', icon: '📤', isBase: true },
      { id: 'reactivation', label: 'Al reactivarse después de dormido', desc: 'El cliente llevaba más de [X] días sin visitar y regresa.', est: '~[X] reactivaciones/mes', icon: '🔄', hasConfig: true, note: 'La sorpresa de regreso celebra que el cliente volvió, en lugar de solo "compensarlo" con un cupón.' },
      { id: 'profile_complete', label: 'Al completar su perfil en la app', desc: 'El cliente completa todos los datos de su perfil en la app B2C.', est: 'Una vez por cliente', icon: '👤', note: 'Un perfil completo le da al negocio mejores datos en el CRM.' },
    ],
  },
];

// Triggers that are "unique" by nature (should bypass cooldown)
const UNIQUE_TRIGGERS = ['first_visit_ever', 'first_reservation', 'profile_complete', 'anniversary', 'vip_upgrade'];

const Toggle = ({ checked, onChange, size = 'md' }) => {
  const w = size === 'sm' ? 'w-8 h-4' : 'w-10 h-5';
  const dot = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const translate = size === 'sm' ? 'translate-x-4' : 'translate-x-5';
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`${w} rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-primary' : 'bg-muted'}`}
    >
      <div className={`${dot} bg-white rounded-full shadow mt-0.5 transition-transform ${checked ? translate : 'translate-x-0.5'}`} />
    </button>
  );
};

const TriggerCard = ({ trigger, isActive, onToggle, triggerConfig, onConfigChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [useOwnPool, setUseOwnPool] = useState(triggerConfig?.useOwnPool || false);

  return (
    <div className={`rounded-xl border-2 transition-all ${isActive ? 'border-orange-500 bg-orange-500/5' : 'border-border'}`}>
      <div className="flex items-start gap-3 p-4">
        <label className="flex items-start gap-3 flex-1 cursor-pointer">
          <input type="checkbox" checked={isActive} onChange={e => onToggle(e?.target?.checked)} className="mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base">{trigger?.icon}</span>
              <span className="font-medium text-foreground text-sm">{trigger?.label}</span>
              {trigger?.isBase && <span className="px-1.5 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">Base</span>}
              {UNIQUE_TRIGGERS?.includes(trigger?.id) && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">Único</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{trigger?.desc}</p>
            <span className="inline-block mt-1 px-1.5 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">{trigger?.est}</span>
          </div>
        </label>
        {(trigger?.hasConfig || trigger?.note) && (
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 hover:bg-muted rounded-lg transition-colors flex-shrink-0">
            <Icon name={expanded ? 'ChevronUp' : 'ChevronDown'} size={14} className="text-muted-foreground" />
          </button>
        )}
      </div>
      {expanded && (
        <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-3">
          {trigger?.note && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-xs text-blue-700">💡 {trigger?.note}</p>
            </div>
          )}

          {/* Trigger-level monthly limit */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Límite mensual para este trigger</label>
            <div className="flex items-center gap-2">
              <input
                type="number" min="0"
                value={triggerConfig?.monthlyLimit || 0}
                onChange={e => onConfigChange({ ...triggerConfig, monthlyLimit: parseInt(e?.target?.value) })}
                className="w-20 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none"
              />
              <span className="text-xs text-muted-foreground">veces/mes por usuario (0 = sin límite)</span>
            </div>
          </div>

          {/* Specific configs */}
          {trigger?.id === 'specific_time' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Días de la semana</label>
                <div className="flex gap-1 flex-wrap">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']?.map(day => (
                    <button
                      key={day}
                      onClick={() => {
                        const days = triggerConfig?.days || [];
                        const newDays = days?.includes(day) ? days?.filter(d => d !== day) : [...days, day];
                        onConfigChange({ ...triggerConfig, days: newDays });
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${(triggerConfig?.days || [])?.includes(day) ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Hora inicio</label>
                  <input type="time" value={triggerConfig?.startTime || ''} onChange={e => onConfigChange({ ...triggerConfig, startTime: e?.target?.value })} className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Hora fin</label>
                  <input type="time" value={triggerConfig?.endTime || ''} onChange={e => onConfigChange({ ...triggerConfig, endTime: e?.target?.value })} className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Nombre del trigger (para analytics)</label>
                <input type="text" placeholder="Ej: Happy Hour de Sorpresas" value={triggerConfig?.customName || ''} onChange={e => onConfigChange({ ...triggerConfig, customName: e?.target?.value })} className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none" />
              </div>
            </div>
          )}

          {trigger?.id === 'active_streak' && (
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Activar cada [N] visitas de racha</label>
              <div className="flex items-center gap-2">
                <input type="number" min="1" max="50" value={triggerConfig?.streakInterval || 5} onChange={e => onConfigChange({ ...triggerConfig, streakInterval: parseInt(e?.target?.value) })} className="w-24 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none" />
                <span className="text-xs text-muted-foreground">visitas consecutivas</span>
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
                      checked={(triggerConfig?.transitions || ['Bronce → Plata', 'Plata → Oro'])?.includes(t)}
                      onChange={e => {
                        const ts = triggerConfig?.transitions || ['Bronce → Plata', 'Plata → Oro'];
                        const newTs = e?.target?.checked ? [...ts, t] : ts?.filter(x => x !== t);
                        onConfigChange({ ...triggerConfig, transitions: newTs });
                      }}
                    />
                    <span className="text-xs text-foreground">{t}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {trigger?.id === 'points_redeem' && (
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Solo si canjea más de [N] puntos</label>
              <div className="flex items-center gap-2">
                <input type="number" min="0" value={triggerConfig?.minPoints || 0} onChange={e => onConfigChange({ ...triggerConfig, minPoints: parseInt(e?.target?.value) })} className="w-24 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none" />
                <span className="text-xs text-muted-foreground">puntos (0 = sin límite)</span>
              </div>
            </div>
          )}

          {trigger?.id === 'points_milestone' && (
            <div>
              <label className="text-xs font-medium text-foreground block mb-2">Umbrales de puntos acumulados</label>
              <div className="space-y-2">
                {(triggerConfig?.milestones || [100, 500, 1000, 2500])?.map((m, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="number" min="1"
                      value={m}
                      onChange={e => {
                        const ms = [...(triggerConfig?.milestones || [100, 500, 1000, 2500])];
                        ms[i] = parseInt(e?.target?.value);
                        onConfigChange({ ...triggerConfig, milestones: ms });
                      }}
                      className="w-24 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none"
                    />
                    <span className="text-xs text-muted-foreground">puntos acumulados</span>
                    <button onClick={() => { const ms = (triggerConfig?.milestones || [100, 500, 1000, 2500])?.filter((_, idx) => idx !== i); onConfigChange({ ...triggerConfig, milestones: ms }); }} className="p-1 hover:bg-destructive/10 rounded">
                      <Icon name="X" size={12} className="text-muted-foreground" />
                    </button>
                  </div>
                ))}
                <button onClick={() => { const ms = [...(triggerConfig?.milestones || [100, 500, 1000, 2500]), 5000]; onConfigChange({ ...triggerConfig, milestones: ms }); }} className="text-xs text-primary underline">+ Agregar umbral</button>
              </div>
            </div>
          )}

          {trigger?.id === 'prepaid_reload' && (
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Solo si recarga más de $[N] MXN</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">$</span>
                <input type="number" min="0" value={triggerConfig?.minAmount || 0} onChange={e => onConfigChange({ ...triggerConfig, minAmount: parseInt(e?.target?.value) })} className="w-24 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none" />
                <span className="text-xs text-muted-foreground">MXN (0 = sin límite)</span>
              </div>
            </div>
          )}

          {trigger?.id === 'referral_register' && (
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Máximo de sorpresas por referidos por mes</label>
              <div className="flex items-center gap-2">
                <input type="number" min="0" value={triggerConfig?.maxPerMonth || 0} onChange={e => onConfigChange({ ...triggerConfig, maxPerMonth: parseInt(e?.target?.value) })} className="w-24 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none" />
                <span className="text-xs text-muted-foreground">sorpresas/mes (0 = sin límite)</span>
              </div>
            </div>
          )}

          {trigger?.id === 'referral_checkin' && (
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
              <div>
                <p className="text-xs font-medium text-foreground">Enviar sorpresa también al referido</p>
                <p className="text-xs text-muted-foreground">El referido recibe una sorpresa de bienvenida adicional</p>
              </div>
              <Toggle checked={triggerConfig?.alsoRewardReferee || false} onChange={v => onConfigChange({ ...triggerConfig, alsoRewardReferee: v })} />
            </div>
          )}

          {trigger?.id === 'verified_review' && (
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Rating mínimo (opcional)</label>
              <select value={triggerConfig?.minRating || 0} onChange={e => onConfigChange({ ...triggerConfig, minRating: parseInt(e?.target?.value) })} className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none">
                <option value={0}>Cualquier rating (recomendado)</option>
                <option value={3}>3+ estrellas</option>
                <option value={4}>4+ estrellas</option>
                <option value={5}>5 estrellas</option>
              </select>
              {(triggerConfig?.minRating || 0) > 0 && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700">⚠️ Filtrar por rating puede considerarse manipulación de reseñas según políticas de Google.</p>
                </div>
              )}
            </div>
          )}

          {trigger?.id === 'reservation_kept' && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={triggerConfig?.onlyPrepaid || false} onChange={e => onConfigChange({ ...triggerConfig, onlyPrepaid: e?.target?.checked })} />
                <span className="text-xs text-foreground">Solo para reservaciones con pre-pago</span>
              </label>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Frecuencia: cada [N] reservaciones cumplidas</label>
                <div className="flex items-center gap-2">
                  <input type="number" min="1" value={triggerConfig?.everyN || 1} onChange={e => onConfigChange({ ...triggerConfig, everyN: parseInt(e?.target?.value) })} className="w-20 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none" />
                  <span className="text-xs text-muted-foreground">reservaciones (1 = cada vez)</span>
                </div>
              </div>
            </div>
          )}

          {trigger?.id === 'anniversary' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-2">Hitos de aniversario a celebrar</label>
                <div className="flex flex-wrap gap-2">
                  {['6 meses', '1 año', '2 años', '3 años+']?.map(h => (
                    <label key={h} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(triggerConfig?.milestones || ['1 año'])?.includes(h)}
                        onChange={e => {
                          const ms = triggerConfig?.milestones || ['1 año'];
                          const newMs = e?.target?.checked ? [...ms, h] : ms?.filter(x => x !== h);
                          onConfigChange({ ...triggerConfig, milestones: newMs });
                        }}
                      />
                      <span className="text-xs text-foreground">{h}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <div>
                  <p className="text-xs font-medium text-foreground">Enviar push el día del aniversario</p>
                  <p className="text-xs text-muted-foreground">Aunque el cliente no visite ese día</p>
                </div>
                <Toggle checked={triggerConfig?.sendPush || false} onChange={v => onConfigChange({ ...triggerConfig, sendPush: v })} />
              </div>
            </div>
          )}

          {trigger?.id === 'first_of_day' && (
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Primeros [N] clientes del día</label>
              <div className="flex items-center gap-2">
                <input type="number" min="1" max="50" value={triggerConfig?.firstN || 5} onChange={e => onConfigChange({ ...triggerConfig, firstN: parseInt(e?.target?.value) })} className="w-20 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none" />
                <span className="text-xs text-muted-foreground">clientes/día</span>
              </div>
            </div>
          )}

          {trigger?.id === 'reactivation' && (
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Días de inactividad mínimos</label>
              <div className="flex items-center gap-2">
                <input type="number" min="7" max="365" value={triggerConfig?.inactiveDays || 21} onChange={e => onConfigChange({ ...triggerConfig, inactiveDays: parseInt(e?.target?.value) })} className="w-20 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none" />
                <span className="text-xs text-muted-foreground">días sin visitar</span>
              </div>
            </div>
          )}

          {/* Own pool toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl mt-2">
            <div>
              <p className="text-xs font-medium text-foreground">¿Este trigger usa su propio pool de premios?</p>
              <p className="text-xs text-muted-foreground">Si no, usa el pool global configurado arriba</p>
            </div>
            <Toggle
              checked={triggerConfig?.useOwnPool || useOwnPool}
              onChange={v => { setUseOwnPool(v); onConfigChange({ ...triggerConfig, useOwnPool: v }); }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const TriggerGroupSection = ({ group, activeTriggers, onToggle, triggerConfigs, onConfigChange }) => {
  const [collapsed, setCollapsed] = useState(false);
  const activeCount = group?.triggers?.filter(t => activeTriggers?.[t?.id])?.length;

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 ${group?.bg} rounded-xl flex items-center justify-center`}>
            <Icon name={group?.icon} size={16} className={group?.color} />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground text-sm">{group?.label}</p>
            <p className="text-xs text-muted-foreground">{activeCount} de {group?.triggers?.length} activos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${group?.bg} ${group?.color}`}>{activeCount} activo{activeCount !== 1 ? 's' : ''}</span>}
          <Icon name={collapsed ? 'ChevronDown' : 'ChevronUp'} size={16} className="text-muted-foreground" />
        </div>
      </button>
      {!collapsed && (
        <div className="p-4 border-t border-border space-y-3">
          {group?.triggers?.map(trigger => (
            <TriggerCard
              key={trigger?.id}
              trigger={trigger}
              isActive={activeTriggers?.[trigger?.id] || false}
              onToggle={checked => onToggle(trigger?.id, checked)}
              triggerConfig={triggerConfigs?.[trigger?.id] || {}}
              onConfigChange={cfg => onConfigChange(trigger?.id, cfg)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── MOCK LOG DATA ───────────────────────────────────────────────────────────
const MOCK_LOG = [
  { id: 1, reason: 'Límite diario', count: 47, pct: 38 },
  { id: 2, reason: 'Cooldown activo', count: 31, pct: 25 },
  { id: 3, reason: 'Presupuesto agotado', count: 18, pct: 15 },
  { id: 4, reason: 'Límite semanal', count: 14, pct: 11 },
  { id: 5, reason: 'Límite mensual', count: 9, pct: 7 },
  { id: 6, reason: 'Fecha excluida', count: 5, pct: 4 },
];

// ─── ANTI-SATURATION CONTROLS ────────────────────────────────────────────────
const AntiSaturationControls = ({ config, onChange }) => {
  const c = config || {};
  const [showLog, setShowLog] = useState(false);
  const [exclusionDates, setExclusionDates] = useState(c?.exclusionDates || []);
  const [newExclusion, setNewExclusion] = useState({ startDate: '', endDate: '', reason: '' });
  const [showAddExclusion, setShowAddExclusion] = useState(false);

  const addExclusion = () => {
    if (!newExclusion?.startDate || !newExclusion?.reason) return;
    const updated = [...exclusionDates, { ...newExclusion, id: Date.now() }];
    setExclusionDates(updated);
    onChange({ ...c, exclusionDates: updated });
    setNewExclusion({ startDate: '', endDate: '', reason: '' });
    setShowAddExclusion(false);
  };

  const removeExclusion = (id) => {
    const updated = exclusionDates?.filter(e => e?.id !== id);
    setExclusionDates(updated);
    onChange({ ...c, exclusionDates: updated });
  };

  const totalBlocked = MOCK_LOG?.reduce((s, l) => s + l?.count, 0);

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-500/5 to-transparent">
        <div className="w-9 h-9 bg-red-500/10 rounded-xl flex items-center justify-center">
          <Icon name="Shield" size={18} className="text-red-600" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Control Anti-Saturación</p>
          <p className="text-xs text-muted-foreground">Evita que un cliente reciba demasiadas sorpresas en poco tiempo</p>
        </div>
      </div>
      <div className="p-5 border-t border-border space-y-6">

        {/* ── 1. CASCADE LIMITS ─────────────────────────────────────────── */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
            <Icon name="Layers" size={14} className="text-red-500" />
            Límites en cascada por usuario
          </p>
          <p className="text-xs text-muted-foreground mb-3">El sistema aplica el primer límite que se alcance (diario → semanal → mensual).</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-muted/30 rounded-xl">
              <label className="text-xs font-medium text-foreground block mb-1">Límite diario</label>
              <div className="flex items-center gap-2">
                <input
                  type="number" min="1" max="10"
                  value={c?.dailyLimit || 2}
                  onChange={e => onChange({ ...c, dailyLimit: parseInt(e?.target?.value) })}
                  className="w-16 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                />
                <span className="text-xs text-muted-foreground">sorpresas/día</span>
              </div>
            </div>
            <div className="p-3 bg-muted/30 rounded-xl">
              <label className="text-xs font-medium text-foreground block mb-1">Límite semanal</label>
              <div className="flex items-center gap-2">
                <input
                  type="number" min="1" max="30"
                  value={c?.weeklyLimit || 5}
                  onChange={e => onChange({ ...c, weeklyLimit: parseInt(e?.target?.value) })}
                  className="w-16 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                />
                <span className="text-xs text-muted-foreground">sorpresas/sem</span>
              </div>
            </div>
            <div className="p-3 bg-muted/30 rounded-xl">
              <label className="text-xs font-medium text-foreground block mb-1">Límite mensual</label>
              <div className="flex items-center gap-2">
                <input
                  type="number" min="1" max="100"
                  value={c?.monthlyLimit || 12}
                  onChange={e => onChange({ ...c, monthlyLimit: parseInt(e?.target?.value) })}
                  className="w-16 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                />
                <span className="text-xs text-muted-foreground">sorpresas/mes</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. COOLDOWN ───────────────────────────────────────────────── */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Cooldown entre sorpresas</label>
          <p className="text-xs text-muted-foreground mb-2">Mínimo de horas entre sorpresas para el mismo usuario</p>
          <div className="flex items-center gap-3">
            <input
              type="number" min="0" max="72"
              value={c?.cooldownHours || 4}
              onChange={e => onChange({ ...c, cooldownHours: parseInt(e?.target?.value) })}
              className="w-20 px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm focus:outline-none"
            />
            <span className="text-sm text-muted-foreground">horas entre sorpresas</span>
          </div>
        </div>

        {/* ── 3. UNIQUE TRIGGERS BYPASS COOLDOWN ────────────────────────── */}
        <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-xl">
          <div className="flex-1 pr-4">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              <span>🔓</span> Excluir triggers únicos del cooldown
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Triggers de evento único (aniversario, subir de nivel, primera visita, etc.) se entregan aunque el usuario esté en cooldown por un check-in reciente.
            </p>
            <p className="text-xs text-purple-600 mt-1">Aplica a: {UNIQUE_TRIGGERS?.length} triggers marcados como "Único"</p>
          </div>
          <Toggle
            checked={c?.uniqueBypassCooldown !== false}
            onChange={v => onChange({ ...c, uniqueBypassCooldown: v })}
          />
        </div>

        {/* ── 4. GRACE PERIOD ───────────────────────────────────────────── */}
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex-1 pr-4">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <span>🛡️</span> Período de gracia post-gran-premio
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Después de ganar un premio mayor, el usuario solo puede recibir premios de nivel básico durante X días.
              </p>
            </div>
            <Toggle
              checked={c?.gracePeriodEnabled || false}
              onChange={v => onChange({ ...c, gracePeriodEnabled: v })}
            />
          </div>
          {c?.gracePeriodEnabled && (
            <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="number" min="1" max="30"
                  value={c?.gracePeriodDays || 7}
                  onChange={e => onChange({ ...c, gracePeriodDays: parseInt(e?.target?.value) })}
                  className="w-20 px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm focus:outline-none"
                />
                <span className="text-sm text-muted-foreground">días con premios reducidos después de ganar un premio mayor</span>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">¿Qué define un "premio mayor"?</label>
                <select
                  value={c?.majorPrizeDefinition || 'top2'}
                  onChange={e => onChange({ ...c, majorPrizeDefinition: e?.target?.value })}
                  className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm focus:outline-none"
                >
                  <option value="top1">Solo el premio de mayor probabilidad más baja (top 1)</option>
                  <option value="top2">Los 2 premios de menor probabilidad (top 2)</option>
                  <option value="top3">Los 3 premios de menor probabilidad (top 3)</option>
                  <option value="value">Premios con valor mayor a $[N] MXN</option>
                </select>
              </div>
              {c?.majorPrizeDefinition === 'value' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Valor mínimo: $</span>
                  <input
                    type="number" min="1"
                    value={c?.majorPrizeMinValue || 100}
                    onChange={e => onChange({ ...c, majorPrizeMinValue: parseInt(e?.target?.value) })}
                    className="w-24 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                  />
                  <span className="text-sm text-muted-foreground">MXN</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── 5. VIP SEGMENT LIMITS ─────────────────────────────────────── */}
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex-1 pr-4">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <span>👑</span> Límites por nivel de cliente
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Configura límites diferentes según el nivel VIP. Clientes Oro merecen más oportunidades que clientes nuevos.
              </p>
            </div>
            <Toggle
              checked={c?.vipLimitsEnabled || false}
              onChange={v => onChange({ ...c, vipLimitsEnabled: v })}
            />
          </div>
          {c?.vipLimitsEnabled && (
            <div className="px-4 pb-4 border-t border-border/50 pt-3">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-3 font-medium text-muted-foreground">Nivel</th>
                      <th className="text-center py-2 px-2 font-medium text-muted-foreground">Diario</th>
                      <th className="text-center py-2 px-2 font-medium text-muted-foreground">Semanal</th>
                      <th className="text-center py-2 px-2 font-medium text-muted-foreground">Mensual</th>
                      <th className="text-center py-2 pl-2 font-medium text-muted-foreground">Cooldown (h)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: 'new', label: 'Nuevo', emoji: '🆕', defaults: [1, 3, 8, 6] },
                      { key: 'bronze', label: 'Bronce', emoji: '🥉', defaults: [1, 4, 10, 5] },
                      { key: 'silver', label: 'Plata', emoji: '🥈', defaults: [2, 5, 12, 4] },
                      { key: 'gold', label: 'Oro', emoji: '🥇', defaults: [3, 8, 20, 2] },
                    ]?.map(({ key, label, emoji, defaults }) => {
                      const row = c?.vipLimits?.[key] || {};
                      const update = (field, val) => onChange({ ...c, vipLimits: { ...(c?.vipLimits || {}), [key]: { ...row, [field]: val } } });
                      return (
                        <tr key={key} className="border-b border-border/50 last:border-0">
                          <td className="py-2 pr-3 font-medium text-foreground">{emoji} {label}</td>
                          {['daily', 'weekly', 'monthly', 'cooldown']?.map((field, fi) => (
                            <td key={field} className="py-2 px-2 text-center">
                              <input
                                type="number" min="0"
                                value={row?.[field] ?? defaults?.[fi]}
                                onChange={e => update(field, parseInt(e?.target?.value))}
                                className="w-14 px-1.5 py-1 border border-border rounded-lg bg-input text-foreground text-xs text-center focus:outline-none"
                              />
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-2">💡 Requiere que el módulo de Niveles VIP esté activo.</p>
            </div>
          )}
        </div>

        {/* ── 6. DATE EXCLUSIONS ────────────────────────────────────────── */}
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex-1 pr-4">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <span>📅</span> Pausar sorpresas en fechas específicas
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                En fechas de alta demanda (Buen Fin, Navidad, etc.) ningún trigger se activa aunque el usuario califique.
              </p>
            </div>
            <Toggle
              checked={c?.dateExclusionsEnabled || false}
              onChange={v => onChange({ ...c, dateExclusionsEnabled: v })}
            />
          </div>
          {c?.dateExclusionsEnabled && (
            <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-3">
              {exclusionDates?.length > 0 && (
                <div className="space-y-2">
                  {exclusionDates?.map(ex => (
                    <div key={ex?.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                      <span className="text-xs text-foreground flex-1">
                        <strong>{ex?.reason}</strong> · {ex?.startDate}{ex?.endDate && ex?.endDate !== ex?.startDate ? ` → ${ex?.endDate}` : ''}
                      </span>
                      <button onClick={() => removeExclusion(ex?.id)} className="p-1 hover:bg-destructive/10 rounded">
                        <Icon name="X" size={12} className="text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {showAddExclusion ? (
                <div className="p-3 bg-muted/20 border border-border rounded-xl space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Fecha inicio</label>
                      <input type="date" value={newExclusion?.startDate} onChange={e => setNewExclusion(p => ({ ...p, startDate: e?.target?.value }))} className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Fecha fin (opcional)</label>
                      <input type="date" value={newExclusion?.endDate} onChange={e => setNewExclusion(p => ({ ...p, endDate: e?.target?.value }))} className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Motivo</label>
                    <input type="text" placeholder="Ej: Buen Fin, Navidad, Semana Santa…" value={newExclusion?.reason} onChange={e => setNewExclusion(p => ({ ...p, reason: e?.target?.value }))} className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addExclusion} className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90">Agregar</button>
                    <button onClick={() => setShowAddExclusion(false)} className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs hover:bg-muted/80">Cancelar</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowAddExclusion(true)} className="w-full py-2 border-2 border-dashed border-border rounded-xl text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
                  <Icon name="Plus" size={12} />
                  + Nueva fecha de exclusión
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── 7. BUDGET WITH ALERT + FALLBACK ──────────────────────────── */}
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex-1 pr-4">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <span>💰</span> Presupuesto mensual global
              </p>
              <p className="text-xs text-muted-foreground mt-1">Controla el gasto total en premios de sorpresa al mes</p>
            </div>
            <Toggle
              checked={c?.budgetEnabled || false}
              onChange={v => onChange({ ...c, budgetEnabled: v })}
            />
          </div>
          {c?.budgetEnabled && (
            <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">$</span>
                <input
                  type="number" min="100"
                  value={c?.monthlyBudget || 5000}
                  onChange={e => onChange({ ...c, monthlyBudget: parseInt(e?.target?.value) })}
                  className="flex-1 px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm focus:outline-none"
                />
                <span className="text-sm text-muted-foreground">MXN/mes</span>
              </div>

              {/* Budget usage bar */}
              <div className="p-3 bg-muted/30 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Mes actual</span>
                  <span className="text-xs font-medium text-foreground">$0 de ${(c?.monthlyBudget || 5000)?.toLocaleString()} MXN (0%)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }} />
                </div>
              </div>

              {/* Alert threshold */}
              <div>
                <label className="text-xs font-medium text-foreground block mb-1 flex items-center gap-1">
                  <Icon name="Bell" size={12} className="text-amber-500" />
                  Alerta al alcanzar el [N]% del presupuesto
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number" min="10" max="99"
                    value={c?.budgetAlertPct || 80}
                    onChange={e => onChange({ ...c, budgetAlertPct: parseInt(e?.target?.value) })}
                    className="w-20 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                  />
                  <span className="text-sm text-muted-foreground">% del presupuesto</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Recibirás un push: "Has usado el {c?.budgetAlertPct || 80}% de tu presupuesto de sorpresas este mes."
                </p>
              </div>

              {/* Budget exhausted behavior */}
              <div>
                <label className="text-xs font-medium text-foreground block mb-2 flex items-center gap-1">
                  <Icon name="AlertTriangle" size={12} className="text-red-500" />
                  Al agotar el presupuesto:
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'stop', label: 'Detener todos los triggers', desc: 'No se entregan más sorpresas hasta el siguiente mes.' },
                    { value: 'fallback', label: 'Continuar solo con premios menores', desc: 'El pool se sustituye por un pool de emergencia con solo los premios de menor costo. El juego sigue activo.' },
                  ]?.map(opt => (
                    <label key={opt?.value} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${(c?.budgetExhaustedAction || 'stop') === opt?.value ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'}`}>
                      <input
                        type="radio"
                        name="budgetAction"
                        value={opt?.value}
                        checked={(c?.budgetExhaustedAction || 'stop') === opt?.value}
                        onChange={() => onChange({ ...c, budgetExhaustedAction: opt?.value })}
                        className="mt-0.5 flex-shrink-0"
                      />
                      <div>
                        <p className="text-xs font-medium text-foreground">{opt?.label}</p>
                        <p className="text-xs text-muted-foreground">{opt?.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 8. PRIORITY NOTE ─────────────────────────────────────────── */}
        <div className="p-3 bg-muted/30 rounded-xl border border-border">
          <p className="text-xs font-medium text-foreground mb-1">Jerarquía de triggers</p>
          <p className="text-xs text-muted-foreground">Si el usuario activa más triggers que el límite diario, se priorizan por importancia emocional: Aniversario → Subir nivel → Primera visita → Check-in regular.</p>
        </div>

        {/* ── 9. ACTIVATION LOG ────────────────────────────────────────── */}
        <div className="border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setShowLog(!showLog)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-500/10 rounded-xl flex items-center justify-center">
                <Icon name="BarChart2" size={16} className="text-slate-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground text-sm">Historial de control</p>
                <p className="text-xs text-muted-foreground">Sorpresas bloqueadas este mes por tipo de límite</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">{totalBlocked} bloqueadas</span>
              <Icon name={showLog ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground" />
            </div>
          </button>
          {showLog && (
            <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-center">
                  <p className="text-lg font-bold text-green-700">1,247</p>
                  <p className="text-xs text-green-600">Sorpresas entregadas</p>
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center">
                  <p className="text-lg font-bold text-red-700">{totalBlocked}</p>
                  <p className="text-xs text-red-600">Bloqueadas por límites</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Desglose por motivo de bloqueo:</p>
              <div className="space-y-2">
                {MOCK_LOG?.map(row => (
                  <div key={row?.id} className="flex items-center gap-3">
                    <span className="text-xs text-foreground w-36 flex-shrink-0">{row?.reason}</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="bg-red-400 h-2 rounded-full transition-all" style={{ width: `${row?.pct}%` }} />
                    </div>
                    <span className="text-xs font-medium text-foreground w-8 text-right">{row?.count}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mt-2">
                <p className="text-xs text-amber-700">
                  💡 <strong>{Math.round((totalBlocked / (1247 + totalBlocked)) * 100)}% de bloqueo</strong> — tus límites están siendo moderadamente restrictivos. Si el porcentaje supera el 30%, considera aumentar los límites.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const ExtendedTriggersSection = ({ activeTriggers, onToggle, triggerConfigs, onConfigChange, antiSaturation, onAntiSaturationChange }) => {
  const totalActive = Object.values(activeTriggers)?.filter(Boolean)?.length;
  const ownPoolCount = Object.values(triggerConfigs)?.filter(c => c?.useOwnPool)?.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center">
            <Icon name="Zap" size={18} className="text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">⚡ Triggers y Automatizaciones</h3>
            <p className="text-xs text-muted-foreground">Define cuándo se activa el juego de sorpresa</p>
          </div>
        </div>
        <span className="px-2 py-0.5 bg-orange-500/10 text-orange-600 text-xs font-medium rounded-full border border-orange-500/20">
          {totalActive} trigger{totalActive !== 1 ? 's' : ''} activo{totalActive !== 1 ? 's' : ''}
        </span>
      </div>
      {ownPoolCount > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
          <Icon name="AlertTriangle" size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            Tienes <strong>{ownPoolCount}</strong> trigger{ownPoolCount !== 1 ? 's' : ''} con pool{ownPoolCount !== 1 ? 's' : ''} propio{ownPoolCount !== 1 ? 's' : ''}. Asegúrate de que el costo estimado total mensual sea sostenible.
          </p>
        </div>
      )}
      {TRIGGER_GROUPS?.map(group => (
        <TriggerGroupSection
          key={group?.id}
          group={group}
          activeTriggers={activeTriggers}
          onToggle={onToggle}
          triggerConfigs={triggerConfigs}
          onConfigChange={onConfigChange}
        />
      ))}
      <AntiSaturationControls
        config={antiSaturation}
        onChange={onAntiSaturationChange}
      />
    </div>
  );
};

export default ExtendedTriggersSection;
