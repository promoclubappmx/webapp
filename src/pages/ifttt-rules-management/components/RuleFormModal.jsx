import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TRIGGERS = [
  { value: 'weather_rain', type: 'weather', label: 'Lluvia detectada', icon: 'CloudRain', desc: 'Cuando llueve en la zona del negocio' },
  { value: 'weather_cold', type: 'weather', label: 'Frío (< 20°C)', icon: 'Thermometer', desc: 'Temperatura menor a 20°C' },
  { value: 'weather_hot', type: 'weather', label: 'Calor (> 30°C)', icon: 'Sun', desc: 'Temperatura mayor a 30°C' },
  { value: 'weather_cloudy', type: 'weather', label: 'Nublado', icon: 'Cloud', desc: 'Cielo nublado en la zona' },
  { value: 'inactivity_business', type: 'inactivity', label: 'Sin check-ins X horas', icon: 'Clock', desc: 'Negocio sin actividad por horas' },
  { value: 'inactivity_client', type: 'checkins', label: 'Cliente inactivo X días', icon: 'UserX', desc: 'Cliente sin visita por días' },
  { value: 'birthday', type: 'drip', label: 'Cumpleaños próximo', icon: 'Cake', desc: 'X días antes del cumpleaños' },
  { value: 'new_register', type: 'checkins', label: 'Nuevo registro', icon: 'UserPlus', desc: 'Usuario se registra por primera vez' },
  { value: 'first_checkin', type: 'checkins', label: 'Primer check-in', icon: 'MapPin', desc: 'Primera visita al negocio' },
];

const ACTIONS = [
  { value: 'activate_promo', label: 'Activar promoción existente', icon: 'Tag' },
  { value: 'send_push', label: 'Enviar push a cercanos', icon: 'Bell' },
  { value: 'send_coupon', label: 'Enviar cupón al wallet', icon: 'Ticket' },
  { value: 'credit_points', label: 'Acreditar puntos bonus', icon: 'Star' },
  { value: 'publish_story', label: 'Publicar story', icon: 'Image' },
  { value: 'send_email', label: 'Enviar email', icon: 'Mail' },
];

const TEMPLATES = [
  { id: 't1', name: 'Si llueve → Flash deal', icon: 'CloudRain', color: 'from-sky-500 to-blue-600', trigger: 'weather_rain', action: 'activate_promo', triggerType: 'weather', desc: 'Clima' },
  { id: 't2', name: 'Sin clientes → Activa promo', icon: 'Zap', color: 'from-orange-500 to-red-500', trigger: 'inactivity_business', action: 'send_push', triggerType: 'inactivity', desc: 'Inactividad' },
  { id: 't3', name: 'Cliente dormido → Cupón 20%', icon: 'UserX', color: 'from-purple-500 to-violet-600', trigger: 'inactivity_client', action: 'send_coupon', triggerType: 'checkins', desc: 'Inactividad individual' },
  { id: 't4', name: 'Drip semanal nuevos clientes', icon: 'Droplets', color: 'from-teal-500 to-emerald-600', trigger: 'new_register', action: 'send_push', triggerType: 'drip', desc: 'Drip' },
  { id: 't5', name: 'Cumpleaños → Regalo automático', icon: 'Gift', color: 'from-pink-500 to-rose-600', trigger: 'birthday', action: 'send_coupon', triggerType: 'drip', desc: 'Fecha' },
  { id: 't6', name: 'Nuevo registro → Puntos bienvenida', icon: 'UserPlus', color: 'from-amber-500 to-yellow-600', trigger: 'new_register', action: 'credit_points', triggerType: 'checkins', desc: 'Registro' },
];

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const RuleFormModal = ({ rule, onSave, onClose }) => {
  const [name, setName] = useState(rule?.name || '');
  const [selectedTrigger, setSelectedTrigger] = useState(rule?.triggerValue || '');
  const [selectedAction, setSelectedAction] = useState(rule?.actionValue || '');
  const [cooldown, setCooldown] = useState(4);
  const [maxPerDay, setMaxPerDay] = useState(2);
  const [activeDays, setActiveDays] = useState([0,1,2,3,4,5]);
  const [activeHoursStart, setActiveHoursStart] = useState(8);
  const [activeHoursEnd, setActiveHoursEnd] = useState(22);

  const triggerObj = TRIGGERS?.find(t => t?.value === selectedTrigger);
  const actionObj = ACTIONS?.find(a => a?.value === selectedAction);

  const applyTemplate = (tpl) => {
    setName(tpl?.name);
    setSelectedTrigger(tpl?.trigger);
    setSelectedAction(tpl?.action);
  };

  const naturalPreview = () => {
    if (!triggerObj || !actionObj) return 'Selecciona un trigger y una acción para ver el resumen...';
    const days = activeDays?.map(d => DAYS?.[d])?.join(', ');
    return `SI ${triggerObj?.label} ENTONCES ${actionObj?.label}. Máximo ${maxPerDay} veces al día, entre ${activeHoursStart}:00 y ${activeHoursEnd}:00, los días: ${days || 'ninguno'}.`;
  };

  const handleSave = () => {
    if (!name?.trim() || !selectedTrigger || !selectedAction) return;
    const trig = TRIGGERS?.find(t => t?.value === selectedTrigger);
    onSave({
      name: name?.trim(),
      triggerType: trig?.type || 'checkins',
      triggerLabel: trig?.label || '',
      triggerDetail: trig?.desc || '',
      triggerValue: selectedTrigger,
      actionValue: selectedAction,
      action: actionObj?.label || '',
      status: rule?.status || 'draft',
    });
  };

  const toggleDay = (idx) => {
    setActiveDays(prev => prev?.includes(idx) ? prev?.filter(d => d !== idx) : [...prev, idx]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">{rule ? 'Editar Regla IFTTT' : 'Nueva Regla IFTTT'}</h2>
            <p className="text-sm text-muted-foreground">Configura el trigger y la acción automática</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Nombre de la regla</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e?.target?.value)}
              placeholder="Ej: Si llueve → Flash Deal Lluvia"
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Templates */}
          <div>
            <p className="text-sm font-medium text-foreground mb-3">Plantillas rápidas</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TEMPLATES?.map(tpl => (
                <button key={tpl?.id} onClick={() => applyTemplate(tpl)}
                  className="text-left p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tpl?.color} flex items-center justify-center mb-2`}>
                    <Icon name={tpl?.icon} size={16} className="text-white" />
                  </div>
                  <p className="text-xs font-semibold text-foreground leading-tight">{tpl?.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{tpl?.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* SI / ENTONCES blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
            {/* SI Block */}
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <Icon name="Zap" size={14} className="text-white" />
                </div>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">SI...</span>
              </div>
              <div className="space-y-2">
                {TRIGGERS?.map(t => (
                  <button key={t?.value} onClick={() => setSelectedTrigger(t?.value)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center gap-2.5 ${
                      selectedTrigger === t?.value
                        ? 'border-emerald-400 bg-emerald-100 dark:bg-emerald-900/40' :'border-transparent hover:border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                    }`}>
                    <Icon name={t?.icon} size={16} className={selectedTrigger === t?.value ? 'text-emerald-600' : 'text-muted-foreground'} />
                    <div>
                      <p className="text-xs font-medium text-foreground">{t?.label}</p>
                      <p className="text-xs text-muted-foreground">{t?.desc}</p>
                    </div>
                    {selectedTrigger === t?.value && <Icon name="Check" size={14} className="text-emerald-600 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-8 h-8 bg-card border-2 border-primary rounded-full flex items-center justify-center shadow-md">
                <Icon name="ArrowRight" size={16} className="text-primary" />
              </div>
            </div>

            {/* ENTONCES Block */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Icon name="Play" size={14} className="text-white" />
                </div>
                <span className="text-sm font-bold text-blue-700 dark:text-blue-400">ENTONCES...</span>
              </div>
              <div className="space-y-2">
                {ACTIONS?.map(a => (
                  <button key={a?.value} onClick={() => setSelectedAction(a?.value)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center gap-2.5 ${
                      selectedAction === a?.value
                        ? 'border-blue-400 bg-blue-100 dark:bg-blue-900/40' :'border-transparent hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                    }`}>
                    <Icon name={a?.icon} size={16} className={selectedAction === a?.value ? 'text-blue-600' : 'text-muted-foreground'} />
                    <p className="text-xs font-medium text-foreground">{a?.label}</p>
                    {selectedAction === a?.value && <Icon name="Check" size={14} className="text-blue-600 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-muted/30 rounded-xl p-4 space-y-4">
            <p className="text-sm font-semibold text-foreground">Controles de activación</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Cooldown entre activaciones: <span className="text-foreground font-semibold">{cooldown}h</span></label>
                <input type="range" min={1} max={24} value={cooldown} onChange={e => setCooldown(Number(e?.target?.value))}
                  className="w-full accent-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Máx. activaciones/día: <span className="text-foreground font-semibold">{maxPerDay}</span></label>
                <input type="range" min={1} max={10} value={maxPerDay} onChange={e => setMaxPerDay(Number(e?.target?.value))}
                  className="w-full accent-primary" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Hora inicio: <span className="text-foreground font-semibold">{activeHoursStart}:00</span></label>
                <input type="range" min={0} max={23} value={activeHoursStart} onChange={e => setActiveHoursStart(Number(e?.target?.value))}
                  className="w-full accent-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Hora fin: <span className="text-foreground font-semibold">{activeHoursEnd}:00</span></label>
                <input type="range" min={0} max={23} value={activeHoursEnd} onChange={e => setActiveHoursEnd(Number(e?.target?.value))}
                  className="w-full accent-primary" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">Días activos</label>
              <div className="flex gap-2 flex-wrap">
                {DAYS?.map((d, i) => (
                  <button key={i} onClick={() => toggleDay(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      activeDays?.includes(i)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                    }`}>{d}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Natural Language Preview */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Eye" size={16} className="text-primary" />
              <p className="text-sm font-medium text-primary">Vista previa en lenguaje natural</p>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{naturalPreview()}</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { handleSave(); }} disabled={!name?.trim() || !selectedTrigger || !selectedAction}>
              Guardar como borrador
            </Button>
            <Button variant="default" size="sm" onClick={handleSave} disabled={!name?.trim() || !selectedTrigger || !selectedAction} iconName="Zap" iconPosition="left">
              {rule ? 'Guardar cambios' : 'Crear y activar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuleFormModal;
