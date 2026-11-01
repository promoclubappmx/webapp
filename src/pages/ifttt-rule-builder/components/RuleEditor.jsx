import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const triggers = [
  { id: 'rain', icon: 'CloudRain', label: 'Lluvia', desc: 'Cuando llueve en la zona', category: 'clima', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  { id: 'cold', icon: 'Snowflake', label: 'Frío', desc: 'Temperatura menor a 20°C', category: 'clima', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  { id: 'heat', icon: 'Sun', label: 'Calor', desc: 'Temperatura mayor a 30°C', category: 'clima', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'cloudy', icon: 'Cloud', label: 'Nublado', desc: 'Cielo nublado en la zona', category: 'clima', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'no_checkins', icon: 'Clock', label: 'Sin check-ins', desc: 'Inactividad del negocio X horas', category: 'inactividad', color: 'bg-orange-100 text-orange-700 border-orange-200', hasConfig: true, configLabel: 'Horas sin check-in', configDefault: 2, configMin: 1, configMax: 4 },
  { id: 'dormant_client', icon: 'UserX', label: 'Cliente inactivo', desc: 'Sin visita del cliente X días', category: 'inactividad_cliente', color: 'bg-purple-100 text-purple-700 border-purple-200', hasConfig: true, configLabel: 'Días sin visita', configDefault: 30, configMin: 7, configMax: 90 },
  { id: 'birthday', icon: 'Gift', label: 'Cumpleaños próximo', desc: 'X días antes del cumpleaños', category: 'fecha', color: 'bg-pink-100 text-pink-700 border-pink-200', hasConfig: true, configLabel: 'Días de anticipación', configDefault: 3, configMin: 1, configMax: 7 },
  { id: 'new_registration', icon: 'UserPlus', label: 'Nuevo registro', desc: 'Usuario se registra en el negocio', category: 'registro', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'first_checkin', icon: 'MapPin', label: 'Primer check-in', desc: 'Primera visita verificada', category: 'checkin', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  // Geofence triggers
  { id: 'geo_enter', icon: 'LogIn', label: 'Usuario entra al geofence', desc: 'Cuando un usuario entra a la zona', category: 'geofence', color: 'bg-blue-100 text-blue-700 border-blue-200', hasConfig: true, configLabel: 'Tiempo mínimo dentro', configDefault: 0, configMin: 0, configMax: 2, configOptions: ['Inmediato', '1 min', '5 min'], isGeofence: true },
  { id: 'geo_exit', icon: 'LogOut', label: 'Usuario sale del geofence', desc: 'Cuando un usuario sale de la zona', category: 'geofence', color: 'bg-red-100 text-red-700 border-red-200', hasConfig: true, configLabel: 'Delay de activación', configDefault: 0, configMin: 0, configMax: 2, configOptions: ['Inmediato', '5 min', '15 min'], isGeofence: true },
  { id: 'geo_proximity', icon: 'Radar', label: 'Usuario a menos de X metros', desc: 'Cuando un usuario se acerca al negocio', category: 'geofence', color: 'bg-violet-100 text-violet-700 border-violet-200', hasConfig: true, configLabel: 'Umbral de distancia (m)', configDefault: 1, configMin: 0, configMax: 3, configOptions: ['100 m', '200 m', '500 m', '1000 m'], isGeofence: true },
];

const actions = [
  { id: 'activate_promo', icon: 'Tag', label: 'Activar promoción', desc: 'Activa una promo existente', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'push_nearby', icon: 'Bell', label: 'Push a cercanos', desc: 'Notificación a usuarios en X km', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', hasConfig: true, configLabel: 'Radio (km)', configDefault: 2, configMin: 1, configMax: 10 },
  { id: 'wallet_coupon', icon: 'Ticket', label: 'Cupón al wallet', desc: 'Envía cupón de descuento', color: 'bg-violet-100 text-violet-700 border-violet-200' },
  { id: 'bonus_points', icon: 'Star', label: 'Puntos bonus', desc: 'Acredita puntos extra', color: 'bg-amber-100 text-amber-700 border-amber-200', hasConfig: true, configLabel: 'Puntos a acreditar', configDefault: 50, configMin: 10, configMax: 500 },
  { id: 'publish_story', icon: 'Image', label: 'Publicar story', desc: 'Publica story automática en feed', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { id: 'send_email', icon: 'Mail', label: 'Enviar email', desc: 'Campaña de email al segmento', color: 'bg-teal-100 text-teal-700 border-teal-200' },
];

const templates = [
  { id: 'rain_deal', icon: 'CloudRain', label: 'Si llueve → Flash deal', desc: 'Clima', color: 'from-sky-500 to-blue-600', trigger: 'rain', action: 'activate_promo' },
  { id: 'no_clients', icon: 'Clock', label: 'Sin clientes → Activa promo', desc: 'Inactividad', color: 'from-orange-500 to-red-500', trigger: 'no_checkins', action: 'push_nearby' },
  { id: 'dormant_coupon', icon: 'UserX', label: 'Cliente dormido → Cupón 20%', desc: 'Inactividad individual', color: 'from-purple-500 to-violet-600', trigger: 'dormant_client', action: 'wallet_coupon' },
  { id: 'drip_new', icon: 'Droplets', label: 'Drip semanal nuevos clientes', desc: 'Drip', color: 'from-blue-500 to-indigo-600', trigger: 'new_registration', action: 'send_email' },
  { id: 'birthday_gift', icon: 'Gift', label: 'Cumpleaños → Regalo automático', desc: 'Fecha', color: 'from-pink-500 to-rose-600', trigger: 'birthday', action: 'wallet_coupon' },
  { id: 'welcome_points', icon: 'UserPlus', label: 'Nuevo registro → Puntos bienvenida', desc: 'Registro', color: 'from-emerald-500 to-teal-600', trigger: 'new_registration', action: 'bonus_points' },
];

const RuleEditor = ({ initialRule = null, onSave, onCancel }) => {
  const [selectedTrigger, setSelectedTrigger] = useState(initialRule?.trigger || null);
  const [selectedAction, setSelectedAction] = useState(initialRule?.action || null);
  const [triggerConfig, setTriggerConfig] = useState(initialRule?.triggerConfig || {});
  const [actionConfig, setActionConfig] = useState(initialRule?.actionConfig || {});
  const [ruleName, setRuleName] = useState(initialRule?.name || '');
  const [cooldown, setCooldown] = useState(4);
  const [dailyLimit, setDailyLimit] = useState(2);
  const [activeHours, setActiveHours] = useState({ start: 8, end: 22 });
  const [activeDays, setActiveDays] = useState([1, 2, 3, 4, 5]);

  const days = [
    { value: 1, label: 'L' }, { value: 2, label: 'M' }, { value: 3, label: 'X' },
    { value: 4, label: 'J' }, { value: 5, label: 'V' }, { value: 6, label: 'S' }, { value: 0, label: 'D' },
  ];

  const applyTemplate = (tpl) => {
    const t = triggers?.find(t => t?.id === tpl?.trigger);
    const a = actions?.find(a => a?.id === tpl?.action);
    setSelectedTrigger(tpl?.trigger);
    setSelectedAction(tpl?.action);
    if (t?.hasConfig) setTriggerConfig({ value: t?.configDefault });
    if (a?.hasConfig) setActionConfig({ value: a?.configDefault });
    if (!ruleName) setRuleName(tpl?.label);
  };

  const toggleDay = (d) => {
    setActiveDays(prev => prev?.includes(d) ? prev?.filter(x => x !== d) : [...prev, d]);
  };

  const triggerData = triggers?.find(t => t?.id === selectedTrigger);
  const actionData = actions?.find(a => a?.id === selectedAction);

  const naturalLanguage = () => {
    if (!selectedTrigger || !selectedAction) return 'Selecciona un trigger y una acción para ver el preview...';
    const t = triggerData?.label || '';
    const a = actionData?.label || '';
    const tConf = triggerData?.hasConfig ? ` (${triggerConfig?.value || triggerData?.configDefault} ${triggerData?.configLabel?.toLowerCase()})` : '';
    const aConf = actionData?.hasConfig ? ` (${actionConfig?.value || actionData?.configDefault} ${actionData?.configLabel?.toLowerCase()})` : '';
    const daysStr = activeDays?.length === 7 ? 'todos los días' : `${activeDays?.length} días por semana`;
    return `SI ${t}${tConf} ENTONCES ${a}${aConf}. Máximo ${dailyLimit} veces al día, cooldown de ${cooldown}h, activo de ${activeHours?.start}:00 a ${activeHours?.end}:00, ${daysStr}.`;
  };

  const isValid = selectedTrigger && selectedAction;

  return (
    <div className="space-y-6">
      {/* Rule name */}
      <div>
        <label className="text-sm font-semibold text-foreground mb-1.5 block">Nombre de la regla</label>
        <input
          type="text"
          value={ruleName}
          onChange={e => setRuleName(e?.target?.value)}
          placeholder="Ej: Si llueve → Flash Deal Lluvia"
          className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      {/* Quick templates */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Plantillas rápidas</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {templates?.map(tpl => (
            <button
              key={tpl?.id}
              onClick={() => applyTemplate(tpl)}
              className={`relative p-3 rounded-xl text-left text-white bg-gradient-to-br ${tpl?.color} hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon name={tpl?.icon} size={16} />
                <span className="text-xs font-semibold leading-tight">{tpl?.label}</span>
              </div>
              <span className="text-xs opacity-75">{tpl?.desc}</span>
            </button>
          ))}
        </div>
      </div>
      {/* IF / THEN blocks */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        {/* IF block */}
        <div className="flex-1 bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-black text-emerald-700">SI</span>
            <span className="text-xs text-emerald-600 font-medium">Cuando ocurra...</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {triggers?.map(t => (
              <button
                key={t?.id}
                onClick={() => { setSelectedTrigger(t?.id); if (t?.hasConfig) setTriggerConfig({ value: t?.configDefault }); }}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                  selectedTrigger === t?.id
                    ? 'border-emerald-500 bg-white shadow-sm'
                    : 'border-transparent bg-white/60 hover:bg-white hover:border-emerald-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${t?.color}`}>
                  <Icon name={t?.icon} size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">{t?.label}</p>
                  <p className="text-xs text-muted-foreground">{t?.desc}</p>
                </div>
                {selectedTrigger === t?.id && <Icon name="CheckCircle" size={16} className="text-emerald-500 flex-shrink-0" />}
              </button>
            ))}
          </div>
          {/* Trigger config */}
          {triggerData?.hasConfig && (
            <div className="mt-3 p-3 bg-white rounded-xl border border-emerald-200">
              <label className="text-xs font-semibold text-foreground block mb-2">{triggerData?.configLabel}</label>
              {triggerData?.configOptions ? (
                <div className="space-y-1.5">
                  {triggerData?.configOptions?.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setTriggerConfig({ value: i, label: opt })}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                        (triggerConfig?.value ?? triggerData?.configDefault) === i
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-800' :'border-border text-muted-foreground hover:border-emerald-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                  {triggerData?.isGeofence && (
                    <div className="mt-2 flex items-start gap-1.5 p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <Icon name="Info" size={12} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-700">Requiere geofence activo en <a href="/geofence-config" className="underline font-medium">Mi Geofence</a></p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={triggerData?.configMin}
                    max={triggerData?.configMax}
                    value={triggerConfig?.value || triggerData?.configDefault}
                    onChange={e => setTriggerConfig({ value: parseInt(e?.target?.value) })}
                    className="flex-1 accent-emerald-500"
                  />
                  <span className="text-sm font-bold text-emerald-700 w-8 text-center">{triggerConfig?.value || triggerData?.configDefault}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center">
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <Icon name="ArrowRight" size={16} className="text-white" />
            </div>
            <div className="w-0.5 h-4 bg-gradient-to-b from-primary to-primary/20 hidden md:block" />
          </div>
        </div>

        {/* THEN block */}
        <div className="flex-1 bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-black text-blue-700">ENTONCES</span>
            <span className="text-xs text-blue-600 font-medium">Ejecutar...</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {actions?.map(a => (
              <button
                key={a?.id}
                onClick={() => { setSelectedAction(a?.id); if (a?.hasConfig) setActionConfig({ value: a?.configDefault }); }}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                  selectedAction === a?.id
                    ? 'border-blue-500 bg-white shadow-sm'
                    : 'border-transparent bg-white/60 hover:bg-white hover:border-blue-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${a?.color}`}>
                  <Icon name={a?.icon} size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">{a?.label}</p>
                  <p className="text-xs text-muted-foreground">{a?.desc}</p>
                </div>
                {selectedAction === a?.id && <Icon name="CheckCircle" size={16} className="text-blue-500 flex-shrink-0" />}
              </button>
            ))}
          </div>
          {/* Action config */}
          {actionData?.hasConfig && (
            <div className="mt-3 p-3 bg-white rounded-xl border border-blue-200">
              <label className="text-xs font-semibold text-foreground block mb-2">{actionData?.configLabel}</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={actionData?.configMin}
                  max={actionData?.configMax}
                  value={actionConfig?.value || actionData?.configDefault}
                  onChange={e => setActionConfig({ value: parseInt(e?.target?.value) })}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-sm font-bold text-blue-700 w-8 text-center">{actionConfig?.value || actionData?.configDefault}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Controls */}
      <div className="bg-muted/30 border border-border rounded-2xl p-5 space-y-5">
        <p className="text-sm font-semibold text-foreground">Controles avanzados</p>

        {/* Cooldown */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-foreground">Cooldown entre activaciones</label>
            <span className="text-xs font-bold text-primary">{cooldown}h</span>
          </div>
          <input type="range" min={1} max={24} value={cooldown} onChange={e => setCooldown(parseInt(e?.target?.value))} className="w-full accent-primary" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>1h</span><span>24h</span></div>
        </div>

        {/* Daily limit */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-foreground">Límite de activaciones por día</label>
            <span className="text-xs font-bold text-primary">{dailyLimit}</span>
          </div>
          <input type="range" min={1} max={10} value={dailyLimit} onChange={e => setDailyLimit(parseInt(e?.target?.value))} className="w-full accent-primary" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>1</span><span>10</span></div>
        </div>

        {/* Active hours */}
        <div>
          <label className="text-xs font-medium text-foreground block mb-2">Horario activo</label>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Desde</span>
              <select value={activeHours?.start} onChange={e => setActiveHours(h => ({ ...h, start: parseInt(e?.target?.value) }))} className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background">
                {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i)?.padStart(2, '0')}:00</option>)}
              </select>
            </div>
            <span className="text-xs text-muted-foreground">—</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Hasta</span>
              <select value={activeHours?.end} onChange={e => setActiveHours(h => ({ ...h, end: parseInt(e?.target?.value) }))} className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background">
                {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i)?.padStart(2, '0')}:00</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Active days */}
        <div>
          <label className="text-xs font-medium text-foreground block mb-2">Días activos</label>
          <div className="flex gap-1.5">
            {days?.map(d => (
              <button
                key={d?.value}
                onClick={() => toggleDay(d?.value)}
                className={`w-9 h-9 rounded-lg text-xs font-semibold transition-all ${
                  activeDays?.includes(d?.value)
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-background border border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                {d?.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Natural language preview */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="Eye" size={14} className="text-primary" />
          <p className="text-xs font-semibold text-primary">Preview en lenguaje natural</p>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{naturalLanguage()}</p>
      </div>
      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <button onClick={onCancel} className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">
            Cancelar
          </button>
        )}
        <button
          onClick={() => onSave?.({ trigger: selectedTrigger, action: selectedAction, name: ruleName, triggerConfig, actionConfig, cooldown, dailyLimit, activeHours, activeDays })}
          disabled={!isValid}
          className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <Icon name="Zap" size={16} />
          {initialRule ? 'Guardar cambios' : 'Crear y activar regla'}
        </button>
      </div>
    </div>
  );
};

export default RuleEditor;
