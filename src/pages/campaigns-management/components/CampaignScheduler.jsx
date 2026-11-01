import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

// ─── Recurrence Config ────────────────────────────────────────────────────────
const RecurrenceConfig = ({ data, onChange }) => {
  const weekDays = [
    { value: 'mon', label: 'Lun' },
    { value: 'tue', label: 'Mar' },
    { value: 'wed', label: 'Mié' },
    { value: 'thu', label: 'Jue' },
    { value: 'fri', label: 'Vie' },
    { value: 'sat', label: 'Sáb' },
    { value: 'sun', label: 'Dom' },
  ];

  const monthlyOptions = [
    { value: 'first_day', label: 'Primer día del mes' },
    { value: 'last_day', label: 'Último día del mes' },
    { value: 'specific_day', label: 'Día específico' },
    { value: 'first_monday', label: 'Primer lunes del mes' },
    { value: 'last_friday', label: 'Último viernes del mes' },
  ];

  const toggleDay = (day) => {
    const days = data?.recurringDays || [];
    onChange('recurringDays', days?.includes(day) ? days?.filter(d => d !== day) : [...days, day]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange('recurring', !data?.recurring)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            data?.recurring ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            data?.recurring ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </button>
        <span className="text-sm font-medium text-foreground">Activar recurrencia</span>
      </div>
      {data?.recurring && (
        <div className="space-y-4 pl-4 border-l-2 border-primary/30">
          <div className="grid grid-cols-3 gap-2">
            {['weekly', 'monthly', 'custom']?.map(type => (
              <button
                key={type}
                onClick={() => onChange('recurringType', type)}
                className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                  data?.recurringType === type
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                {type === 'weekly' ? 'Semanal' : type === 'monthly' ? 'Mensual' : 'Personalizada'}
              </button>
            ))}
          </div>

          {data?.recurringType === 'weekly' && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Días de ejecución</p>
              <div className="flex gap-1.5 flex-wrap">
                {weekDays?.map(d => (
                  <button
                    key={d?.value}
                    onClick={() => toggleDay(d?.value)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      data?.recurringDays?.includes(d?.value)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {d?.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {data?.recurringType === 'monthly' && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Configuración mensual</p>
              <Select
                options={monthlyOptions}
                value={data?.monthlyConfig || 'first_day'}
                onChange={(v) => onChange('monthlyConfig', v)}
              />
              {data?.monthlyConfig === 'specific_day' && (
                <div className="mt-2">
                  <Input
                    type="number"
                    min="1" max="31"
                    placeholder="Día del mes (1-31)"
                    value={data?.specificDay || ''}
                    onChange={(e) => onChange('specificDay', e?.target?.value)}
                  />
                </div>
              )}
            </div>
          )}

          {data?.recurringType === 'custom' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Cada</p>
                <Input
                  type="number" min="1"
                  value={data?.customInterval || 1}
                  onChange={(e) => onChange('customInterval', e?.target?.value)}
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Unidad</p>
                <Select
                  options={[
                    { value: 'days', label: 'Días' },
                    { value: 'weeks', label: 'Semanas' },
                    { value: 'months', label: 'Meses' },
                  ]}
                  value={data?.customUnit || 'days'}
                  onChange={(v) => onChange('customUnit', v)}
                />
              </div>
            </div>
          )}

          <div>
            <p className="text-xs text-muted-foreground mb-2">Finalizar recurrencia</p>
            <div className="space-y-2">
              {[
                { value: 'never', label: 'Nunca' },
                { value: 'after_date', label: 'En fecha específica' },
                { value: 'after_n', label: 'Después de N ejecuciones' },
              ]?.map(opt => (
                <label key={opt?.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="endRecurrence"
                    value={opt?.value}
                    checked={(data?.endRecurrence || 'never') === opt?.value}
                    onChange={() => onChange('endRecurrence', opt?.value)}
                    className="text-primary"
                  />
                  <span className="text-sm text-foreground">{opt?.label}</span>
                </label>
              ))}
              {data?.endRecurrence === 'after_date' && (
                <Input type="date" value={data?.endDate || ''} onChange={(e) => onChange('endDate', e?.target?.value)} />
              )}
              {data?.endRecurrence === 'after_n' && (
                <Input type="number" min="1" placeholder="Número de ejecuciones" value={data?.endAfterN || ''} onChange={(e) => onChange('endAfterN', e?.target?.value)} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Time Window ──────────────────────────────────────────────────────────────
const TimeWindowConfig = ({ data, onChange }) => {
  const timezones = [
    { value: 'America/Mexico_City', label: 'Ciudad de México (CST)' },
    { value: 'America/Monterrey', label: 'Monterrey (CST)' },
    { value: 'America/Tijuana', label: 'Tijuana (PST)' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Fecha de inicio</label>
          <Input type="date" value={data?.startDate || ''} onChange={(e) => onChange('startDate', e?.target?.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Fecha de fin</label>
          <Input type="date" value={data?.endDate || ''} onChange={(e) => onChange('endDate', e?.target?.value)} />
        </div>
      </div>
      <div className="bg-muted/80 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Clock" size={16} className="text-primary" />
          <p className="text-sm font-semibold text-foreground">Ventana de ejecución diaria</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Hora de inicio</label>
            <Input type="time" value={data?.windowStart || '09:00'} onChange={(e) => onChange('windowStart', e?.target?.value)} />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Hora de fin</label>
            <Input type="time" value={data?.windowEnd || '21:00'} onChange={(e) => onChange('windowEnd', e?.target?.value)} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          La campaña solo se ejecutará dentro de esta ventana horaria cada día.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Zona horaria</label>
        <Select
          options={timezones}
          value={data?.timezone || 'America/Mexico_City'}
          onChange={(v) => onChange('timezone', v)}
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange('respectBusinessHours', !data?.respectBusinessHours)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            data?.respectBusinessHours ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            data?.respectBusinessHours ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </button>
        <div>
          <p className="text-sm font-medium text-foreground">Respetar horario del negocio</p>
          <p className="text-xs text-muted-foreground">No enviar fuera del horario de atención configurado</p>
        </div>
      </div>
    </div>
  );
};

// ─── Trigger Automation ───────────────────────────────────────────────────────
const TriggerAutomation = ({ data, onChange }) => {
  const [showAddTrigger, setShowAddTrigger] = useState(false);
  const [newTrigger, setNewTrigger] = useState({ type: '', config: {} });

  const triggerTypes = [
    {
      value: 'first_visit',
      label: 'Primera visita',
      icon: 'MapPin',
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      description: 'Cuando un usuario visita el negocio por primera vez',
      configFields: [],
    },
    {
      value: 'birthday',
      label: 'Cumpleaños',
      icon: 'Gift',
      color: 'text-pink-500',
      bg: 'bg-pink-50',
      description: 'El día del cumpleaños del usuario',
      configFields: [
        { key: 'daysBefore', label: 'Días antes del cumpleaños', type: 'number', placeholder: '0 = el mismo día' },
      ],
    },
    {
      value: 'inactivity',
      label: 'Inactividad',
      icon: 'UserX',
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      description: 'Cuando el usuario lleva X días sin visitar',
      configFields: [
        { key: 'inactiveDays', label: 'Días sin visita', type: 'number', placeholder: 'ej. 30' },
      ],
    },
    {
      value: 'coupon_redemption',
      label: 'Canjeo de cupón',
      icon: 'Tag',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      description: 'Cuando el usuario canjea un cupón específico',
      configFields: [
        { key: 'couponId', label: 'ID de cupón (opcional)', type: 'text', placeholder: 'Dejar vacío para cualquier cupón' },
      ],
    },
    {
      value: 'specific_date',
      label: 'Fecha específica',
      icon: 'Calendar',
      color: 'text-purple-500',
      bg: 'bg-purple-50',
      description: 'Ejecutar en una fecha y hora exacta',
      configFields: [
        { key: 'triggerDate', label: 'Fecha', type: 'date' },
        { key: 'triggerTime', label: 'Hora', type: 'time' },
      ],
    },
    {
      value: 'user_action',
      label: 'Acción del usuario',
      icon: 'Zap',
      color: 'text-indigo-500',
      bg: 'bg-indigo-50',
      description: 'Cuando el usuario realiza una acción específica en la app',
      configFields: [
        { key: 'action', label: 'Acción', type: 'select', options: [
          { value: 'opened_push', label: 'Abrió notificación push' },
          { value: 'viewed_promo', label: 'Vio una promoción' },
          { value: 'left_review', label: 'Dejó una reseña' },
          { value: 'referred_friend', label: 'Refirió a un amigo' },
        ]},
      ],
    },
  ];

  const triggers = data?.triggers || [];

  const addTrigger = () => {
    if (!newTrigger?.type) return;
    const triggerDef = triggerTypes?.find(t => t?.value === newTrigger?.type);
    onChange('triggers', [
      ...triggers,
      { id: Date.now(), type: newTrigger?.type, label: triggerDef?.label, config: newTrigger?.config },
    ]);
    setNewTrigger({ type: '', config: {} });
    setShowAddTrigger(false);
  };

  const removeTrigger = (id) => {
    onChange('triggers', triggers?.filter(t => t?.id !== id));
  };

  const selectedTriggerDef = triggerTypes?.find(t => t?.value === newTrigger?.type);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Define cuándo se activa automáticamente la campaña</p>
        <Button size="sm" iconName="Plus" iconSize={14} onClick={() => setShowAddTrigger(true)}>
          Agregar trigger
        </Button>
      </div>
      {/* Existing triggers */}
      {triggers?.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-xl border-2 border-dashed border-border">
          <Icon name="Zap" size={28} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Sin triggers configurados</p>
          <p className="text-xs text-muted-foreground mt-1">La campaña se ejecutará según la programación</p>
        </div>
      ) : (
        <div className="space-y-2">
          {triggers?.map(trigger => {
            const def = triggerTypes?.find(t => t?.value === trigger?.type);
            return (
              <div key={trigger?.id} className="flex items-center justify-between bg-card border border-border rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${def?.bg} rounded-lg flex items-center justify-center`}>
                    <Icon name={def?.icon || 'Zap'} size={16} className={def?.color} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{trigger?.label}</p>
                    <p className="text-xs text-muted-foreground">{def?.description}</p>
                    {Object.keys(trigger?.config || {})?.length > 0 && (
                      <div className="flex gap-2 mt-1">
                        {Object.entries(trigger?.config)?.map(([k, v]) => (
                          <span key={k} className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeTrigger(trigger?.id)}
                  className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                >
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
      {/* Add trigger panel */}
      {showAddTrigger && (
        <div className="bg-muted/50 rounded-xl p-4 border border-border space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Seleccionar tipo de trigger</p>
            <button onClick={() => setShowAddTrigger(false)} className="p-1 hover:bg-muted rounded">
              <Icon name="X" size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {triggerTypes?.map(t => (
              <button
                key={t?.value}
                onClick={() => setNewTrigger({ type: t?.value, config: {} })}
                className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                  newTrigger?.type === t?.value
                    ? 'border-primary bg-primary/5' :'border-border bg-card hover:border-primary/40'
                }`}
              >
                <div className={`w-7 h-7 ${t?.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon name={t?.icon} size={14} className={t?.color} />
                </div>
                <span className="text-xs font-medium text-foreground">{t?.label}</span>
              </button>
            ))}
          </div>

          {/* Config fields for selected trigger */}
          {selectedTriggerDef && selectedTriggerDef?.configFields?.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground">Configuración del trigger</p>
              {selectedTriggerDef?.configFields?.map(field => (
                <div key={field?.key}>
                  <label className="block text-xs text-muted-foreground mb-1">{field?.label}</label>
                  {field?.type === 'select' ? (
                    <Select
                      options={field?.options}
                      value={newTrigger?.config?.[field?.key] || ''}
                      onChange={(v) => setNewTrigger(prev => ({ ...prev, config: { ...prev?.config, [field?.key]: v } }))}
                    />
                  ) : (
                    <Input
                      type={field?.type}
                      placeholder={field?.placeholder}
                      value={newTrigger?.config?.[field?.key] || ''}
                      onChange={(e) => setNewTrigger(prev => ({ ...prev, config: { ...prev?.config, [field?.key]: e?.target?.value } }))}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {newTrigger?.type && (
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowAddTrigger(false)}>Cancelar</Button>
              <Button size="sm" onClick={addTrigger}>Agregar trigger</Button>
            </div>
          )}
        </div>
      )}
      {/* Logic operator */}
      {triggers?.length > 1 && (
        <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
          <p className="text-sm text-muted-foreground">Activar cuando:</p>
          <div className="flex gap-2">
            {['any', 'all']?.map(op => (
              <button
                key={op}
                onClick={() => onChange('triggerLogic', op)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  (data?.triggerLogic || 'any') === op
                    ? 'bg-primary text-primary-foreground' :'bg-card border border-border text-muted-foreground'
                }`}
              >
                {op === 'any' ? 'Cualquier trigger' : 'Todos los triggers'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CampaignScheduler = ({ campaign, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState('recurrence');
  const [data, setData] = useState({
    startDate: campaign?.startDate || '',
    endDate: campaign?.endDate || '',
    windowStart: campaign?.windowStart || '09:00',
    windowEnd: campaign?.windowEnd || '21:00',
    timezone: 'America/Mexico_City',
    respectBusinessHours: false,
    recurring: campaign?.recurring || false,
    recurringType: campaign?.recurringType || 'weekly',
    recurringDays: campaign?.recurringDays || [],
    monthlyConfig: 'first_day',
    endRecurrence: 'never',
    triggers: campaign?.triggers || [],
    triggerLogic: 'any',
  });

  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const tabs = [
    { id: 'recurrence', label: 'Recurrencia', icon: 'Repeat' },
    { id: 'timewindow', label: 'Ventana de tiempo', icon: 'Clock' },
    { id: 'triggers', label: 'Triggers', icon: 'Zap' },
  ];

  // Summary badge
  const summaryBadges = [];
  if (data?.recurring) summaryBadges?.push(data?.recurringType === 'weekly' ? 'Semanal' : data?.recurringType === 'monthly' ? 'Mensual' : 'Personalizada');
  if (data?.windowStart && data?.windowEnd) summaryBadges?.push(`${data?.windowStart}–${data?.windowEnd}`);
  if (data?.triggers?.length > 0) summaryBadges?.push(`${data?.triggers?.length} trigger${data?.triggers?.length > 1 ? 's' : ''}`);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold text-foreground">Programación de Campaña</h2>
            {campaign?.name && <p className="text-sm text-muted-foreground">{campaign?.name}</p>}
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Summary badges */}
        {summaryBadges?.length > 0 && (
          <div className="px-6 py-2 flex gap-2 flex-wrap border-b border-border bg-muted/30">
            {summaryBadges?.map((b, i) => (
              <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{b}</span>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-3 border-b border-border bg-muted/20">
          {tabs?.map(t => (
            <button
              key={t?.id}
              onClick={() => setActiveTab(t?.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === t?.id
                  ? 'bg-card text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={t?.icon} size={14} />
              {t?.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'recurrence' && (
            <RecurrenceConfig data={data} onChange={handleChange} />
          )}
          {activeTab === 'timewindow' && (
            <TimeWindowConfig data={data} onChange={handleChange} />
          )}
          {activeTab === 'triggers' && (
            <TriggerAutomation data={data} onChange={handleChange} />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex items-center justify-between bg-card rounded-b-xl">
          <div className="text-xs text-muted-foreground">
            {data?.recurring
              ? `Recurrencia ${data?.recurringType === 'weekly' ? 'semanal' : data?.recurringType === 'monthly' ? 'mensual' : 'personalizada'} activa`
              : 'Sin recurrencia'}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button iconName="Save" iconSize={16} onClick={() => onSave(data)}>Guardar programación</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignScheduler;