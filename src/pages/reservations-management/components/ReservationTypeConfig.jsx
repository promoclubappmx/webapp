import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const RESERVATION_TYPES = [
  {
    id: 'mesa',
    label: 'Mesa',
    icon: 'UtensilsCrossed',
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    activeBg: 'bg-orange-600',
    border: 'border-orange-300',
    activeBorder: 'border-orange-600',
    ring: 'ring-orange-400',
    description: 'Para negocios con mesas y comensales',
    verticals: ['Restaurantes', 'Cafeterías', 'Bares', 'Fondas'],
  },
  {
    id: 'cita',
    label: 'Cita',
    icon: 'Scissors',
    color: 'text-violet-600',
    bg: 'bg-violet-100',
    activeBg: 'bg-violet-600',
    border: 'border-violet-300',
    activeBorder: 'border-violet-600',
    ring: 'ring-violet-400',
    description: 'Para servicios con profesional asignado',
    verticals: ['Salones de belleza', 'Barberías', 'Consultorios', 'Spas'],
  },
  {
    id: 'turno',
    label: 'Turno',
    icon: 'Hash',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    activeBg: 'bg-blue-600',
    border: 'border-blue-300',
    activeBorder: 'border-blue-600',
    ring: 'ring-blue-400',
    description: 'Fila virtual con orden de llegada digitalizado',
    verticals: ['Trámites', 'Farmacias', 'Bancos', 'Servicios gubernamentales'],
  },
  {
    id: 'clase',
    label: 'Clase',
    icon: 'Dumbbell',
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    activeBg: 'bg-emerald-600',
    border: 'border-emerald-300',
    activeBorder: 'border-emerald-600',
    ring: 'ring-emerald-400',
    description: 'Horario fijo con cupo máximo e inscripción',
    verticals: ['Gimnasios', 'Yoga/Pilates', 'Academias', 'Talleres'],
  },
  {
    id: 'evento',
    label: 'Evento',
    icon: 'PartyPopper',
    color: 'text-rose-600',
    bg: 'bg-rose-100',
    activeBg: 'bg-rose-600',
    border: 'border-rose-300',
    activeBorder: 'border-rose-600',
    ring: 'ring-rose-400',
    description: 'Fecha única con cupo y precio configurable',
    verticals: ['Eventos especiales', 'Catas', 'Pop-ups', 'Talleres únicos'],
  },
];

// ─── Sub-forms per type ───────────────────────────────────────────────────────

const MesaConfig = ({ config, onChange }) => {
  const addZone = () => {
    const zones = [...(config?.zones || []), { name: '', tables: 2, minPersons: 1, maxPersons: 4, reservable: true }];
    onChange({ ...config, zones });
  };
  const updateZone = (i, field, val) => {
    const zones = config?.zones?.map((z, idx) => idx === i ? { ...z, [field]: val } : z);
    onChange({ ...config, zones });
  };
  const removeZone = (i) => onChange({ ...config, zones: config?.zones?.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-6">
      {/* Zones */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-foreground text-sm">Zonas del establecimiento</h4>
          <button onClick={addZone} className="flex items-center gap-1.5 text-xs bg-orange-600 text-white px-3 py-1.5 rounded-lg hover:bg-orange-700 transition-colors">
            <Icon name="Plus" size={12} /> Agregar zona
          </button>
        </div>
        <div className="space-y-3">
          {(config?.zones || [])?.map((zone, i) => (
            <div key={i} className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <input value={zone?.name} onChange={e => updateZone(i, 'name', e?.target?.value)} placeholder="Nombre de zona (ej: Terraza)" className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400" />
                <button onClick={() => removeZone(i)} className="text-muted-foreground hover:text-destructive transition-colors"><Icon name="Trash2" size={14} /></button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Mesas/asientos</label>
                  <input type="number" min="1" value={zone?.tables} onChange={e => updateZone(i, 'tables', +e?.target?.value)} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Mín. personas</label>
                  <input type="number" min="1" value={zone?.minPersons} onChange={e => updateZone(i, 'minPersons', +e?.target?.value)} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Máx. personas</label>
                  <input type="number" min="1" value={zone?.maxPersons} onChange={e => updateZone(i, 'maxPersons', +e?.target?.value)} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input type="checkbox" checked={zone?.reservable} onChange={e => updateZone(i, 'reservable', e?.target?.checked)} className="rounded" />
                Disponible para reservación
              </label>
            </div>
          ))}
          {(config?.zones || [])?.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
              Agrega zonas para configurar la capacidad de tu establecimiento
            </div>
          )}
        </div>
      </div>
      {/* Duration by service */}
      <div>
        <h4 className="font-semibold text-foreground text-sm mb-3">Duración por tipo de servicio</h4>
        <div className="space-y-2">
          {[
            { key: 'desayuno', label: 'Desayuno', default: 45 },
            { key: 'comida', label: 'Comida', default: 90 },
            { key: 'cena', label: 'Cena', default: 120 },
            { key: 'brunch', label: 'Brunch', default: 75 },
            { key: 'bebidas', label: 'Solo bebidas/barra', default: 60 },
          ]?.map(({ key, label, default: def }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm text-foreground w-36">{label}</span>
              <input type="number" min="15" step="15" value={config?.durations?.[key] ?? def} onChange={e => onChange({ ...config, durations: { ...(config?.durations || {}), [key]: +e?.target?.value } })} className="w-24 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400" />
              <span className="text-xs text-muted-foreground">min</span>
            </div>
          ))}
        </div>
      </div>
      {/* Rotation buffer */}
      <div className="flex items-center gap-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer flex-1">
          <input type="checkbox" checked={config?.rotationEnabled ?? true} onChange={e => onChange({ ...config, rotationEnabled: e?.target?.checked })} className="rounded" />
          Incluir tiempo de rotación entre mesas
        </label>
        {config?.rotationEnabled !== false && (
          <div className="flex items-center gap-2">
            <input type="number" min="5" max="60" value={config?.rotationMinutes ?? 15} onChange={e => onChange({ ...config, rotationMinutes: +e?.target?.value })} className="w-16 text-sm border border-border rounded-lg px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <span className="text-xs text-muted-foreground">min</span>
          </div>
        )}
      </div>
    </div>
  );
};

const CitaConfig = ({ config, onChange }) => {
  const addProfessional = () => {
    const professionals = [...(config?.professionals || []), { name: '', services: [], schedule: {}, buffer: 10 }];
    onChange({ ...config, professionals });
  };
  const updatePro = (i, field, val) => {
    const professionals = config?.professionals?.map((p, idx) => idx === i ? { ...p, [field]: val } : p);
    onChange({ ...config, professionals });
  };
  const removePro = (i) => onChange({ ...config, professionals: config?.professionals?.filter((_, idx) => idx !== i) });

  const addService = () => {
    const services = [...(config?.services || []), { name: '', duration: 30, price: '' }];
    onChange({ ...config, services });
  };
  const updateSvc = (i, field, val) => {
    const services = config?.services?.map((s, idx) => idx === i ? { ...s, [field]: val } : s);
    onChange({ ...config, services });
  };
  const removeSvc = (i) => onChange({ ...config, services: config?.services?.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-6">
      {/* Services */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-foreground text-sm">Servicios disponibles</h4>
          <button onClick={addService} className="flex items-center gap-1.5 text-xs bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-700 transition-colors">
            <Icon name="Plus" size={12} /> Agregar servicio
          </button>
        </div>
        <div className="space-y-2">
          {(config?.services || [])?.map((svc, i) => (
            <div key={i} className="flex items-center gap-3 bg-muted/30 border border-border rounded-xl p-3">
              <input value={svc?.name} onChange={e => updateSvc(i, 'name', e?.target?.value)} placeholder="Nombre del servicio" className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-violet-400" />
              <div className="flex items-center gap-1">
                <input type="number" min="5" value={svc?.duration} onChange={e => updateSvc(i, 'duration', +e?.target?.value)} className="w-16 text-sm border border-border rounded-lg px-2 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-violet-400" />
                <span className="text-xs text-muted-foreground">min</span>
              </div>
              <input value={svc?.price} onChange={e => updateSvc(i, 'price', e?.target?.value)} placeholder="$0" className="w-20 text-sm border border-border rounded-lg px-2 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-violet-400" />
              <button onClick={() => removeSvc(i)} className="text-muted-foreground hover:text-destructive"><Icon name="Trash2" size={14} /></button>
            </div>
          ))}
          {(config?.services || [])?.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">Agrega los servicios que ofreces</div>
          )}
        </div>
      </div>
      {/* Professionals */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-foreground text-sm">Profesionales / Estilistas</h4>
          <button onClick={addProfessional} className="flex items-center gap-1.5 text-xs bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-700 transition-colors">
            <Icon name="Plus" size={12} /> Agregar profesional
          </button>
        </div>
        <div className="space-y-3">
          {(config?.professionals || [])?.map((pro, i) => (
            <div key={i} className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <input value={pro?.name} onChange={e => updatePro(i, 'name', e?.target?.value)} placeholder="Nombre del profesional" className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-violet-400" />
                <button onClick={() => removePro(i)} className="text-muted-foreground hover:text-destructive"><Icon name="Trash2" size={14} /></button>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs text-muted-foreground">Buffer entre citas:</label>
                <input type="number" min="0" max="60" value={pro?.buffer ?? 10} onChange={e => updatePro(i, 'buffer', +e?.target?.value)} className="w-16 text-sm border border-border rounded-lg px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-violet-400" />
                <span className="text-xs text-muted-foreground">min</span>
              </div>
            </div>
          ))}
          {(config?.professionals || [])?.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">Agrega los profesionales de tu equipo</div>
          )}
        </div>
      </div>
      {/* Options */}
      <div className="space-y-3 p-4 bg-violet-50 border border-violet-200 rounded-xl">
        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
          <input type="checkbox" checked={config?.clientChoosesPro ?? true} onChange={e => onChange({ ...config, clientChoosesPro: e?.target?.checked })} className="rounded" />
          El cliente puede elegir profesional preferido
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
          <input type="checkbox" checked={config?.combinableServices ?? false} onChange={e => onChange({ ...config, combinableServices: e?.target?.checked })} className="rounded" />
          Permitir reservar múltiples servicios en una cita
        </label>
      </div>
    </div>
  );
};

const TurnoConfig = ({ config, onChange }) => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Puestos de atención simultáneos</label>
        <input type="number" min="1" max="20" value={config?.stations ?? 1} onChange={e => onChange({ ...config, stations: +e?.target?.value })} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Tiempo promedio por turno (min)</label>
        <input type="number" min="1" max="120" value={config?.avgDuration ?? 15} onChange={e => onChange({ ...config, avgDuration: +e?.target?.value })} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>
    </div>
    <div>
      <label className="text-sm font-medium text-foreground mb-2 block">Capacidad máxima de fila (opcional)</label>
      <input type="number" min="0" value={config?.maxQueue ?? ''} onChange={e => onChange({ ...config, maxQueue: +e?.target?.value || null })} placeholder="Sin límite" className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-400" />
    </div>
    <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
      <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
        <input type="checkbox" checked={config?.remoteQueue ?? true} onChange={e => onChange({ ...config, remoteQueue: e?.target?.checked })} className="rounded" />
        Permitir solicitar turno de forma remota (el usuario llega cuando le toca)
      </label>
    </div>
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
      <h4 className="text-sm font-semibold text-foreground mb-3">Notificaciones de turno</h4>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-sm text-foreground flex-1">Notificar cuando estés a</label>
          <input type="number" min="1" max="10" value={config?.notifyPositions ?? 3} onChange={e => onChange({ ...config, notifyPositions: +e?.target?.value })} className="w-16 text-sm border border-border rounded-lg px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <span className="text-xs text-muted-foreground">posiciones</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-foreground flex-1">Tiempo máximo para presentarse</label>
          <input type="number" min="5" max="60" value={config?.presentTimeout ?? 10} onChange={e => onChange({ ...config, presentTimeout: +e?.target?.value })} className="w-16 text-sm border border-border rounded-lg px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <span className="text-xs text-muted-foreground">min</span>
        </div>
      </div>
    </div>
  </div>
);

const ClaseConfig = ({ config, onChange }) => {
  const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const addClass = () => {
    const classes = [...(config?.classes || []), { name: '', instructor: '', duration: 60, capacity: 15, days: [], time: '07:00', level: 'todos' }];
    onChange({ ...config, classes });
  };
  const updateClass = (i, field, val) => {
    const classes = config?.classes?.map((c, idx) => idx === i ? { ...c, [field]: val } : c);
    onChange({ ...config, classes });
  };
  const toggleDay = (i, day) => {
    const cls = config?.classes?.[i];
    const days = cls?.days?.includes(day) ? cls?.days?.filter(d => d !== day) : [...cls?.days, day];
    updateClass(i, 'days', days);
  };
  const removeClass = (i) => onChange({ ...config, classes: config?.classes?.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-foreground text-sm">Clases del calendario semanal</h4>
        <button onClick={addClass} className="flex items-center gap-1.5 text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors">
          <Icon name="Plus" size={12} /> Agregar clase
        </button>
      </div>
      <div className="space-y-4">
        {(config?.classes || [])?.map((cls, i) => (
          <div key={i} className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <input value={cls?.name} onChange={e => updateClass(i, 'name', e?.target?.value)} placeholder="Nombre de la clase" className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              <button onClick={() => removeClass(i)} className="text-muted-foreground hover:text-destructive"><Icon name="Trash2" size={14} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input value={cls?.instructor} onChange={e => updateClass(i, 'instructor', e?.target?.value)} placeholder="Instructor" className="text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              <input type="time" value={cls?.time} onChange={e => updateClass(i, 'time', e?.target?.value)} className="text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Duración (min)</label>
                <input type="number" min="15" value={cls?.duration} onChange={e => updateClass(i, 'duration', +e?.target?.value)} className="w-full text-sm border border-border rounded-lg px-2 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Cupo máx.</label>
                <input type="number" min="1" value={cls?.capacity} onChange={e => updateClass(i, 'capacity', +e?.target?.value)} className="w-full text-sm border border-border rounded-lg px-2 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Nivel</label>
                <select value={cls?.level} onChange={e => updateClass(i, 'level', e?.target?.value)} className="w-full text-sm border border-border rounded-lg px-2 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  <option value="todos">Todos</option>
                  <option value="principiante">Principiante</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Días de la semana</label>
              <div className="flex gap-2 flex-wrap">
                {DAYS?.map(day => (
                  <button key={day} onClick={() => toggleDay(i, day)} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${cls?.days?.includes(day) ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground hover:bg-emerald-100 hover:text-emerald-700'}`}>
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
        {(config?.classes || [])?.length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">Agrega las clases de tu calendario semanal</div>
        )}
      </div>
    </div>
  );
};

const EventoConfig = ({ config, onChange }) => {
  const addEvent = () => {
    const events = [...(config?.events || []), { name: '', description: '', date: '', time: '', duration: 120, capacity: 50, ticketTypes: [{ name: 'General', price: 0, quota: 50, benefits: '' }] }];
    onChange({ ...config, events });
  };
  const updateEvent = (i, field, val) => {
    const events = config?.events?.map((e, idx) => idx === i ? { ...e, [field]: val } : e);
    onChange({ ...config, events });
  };
  const removeEvent = (i) => onChange({ ...config, events: config?.events?.filter((_, idx) => idx !== i) });
  const addTicketType = (i) => {
    const ev = config?.events?.[i];
    updateEvent(i, 'ticketTypes', [...(ev?.ticketTypes || []), { name: '', price: 0, quota: 10, benefits: '' }]);
  };
  const updateTicket = (evIdx, tIdx, field, val) => {
    const ev = config?.events?.[evIdx];
    const ticketTypes = ev?.ticketTypes?.map((t, idx) => idx === tIdx ? { ...t, [field]: val } : t);
    updateEvent(evIdx, 'ticketTypes', ticketTypes);
  };
  const removeTicket = (evIdx, tIdx) => {
    const ev = config?.events?.[evIdx];
    updateEvent(evIdx, 'ticketTypes', ev?.ticketTypes?.filter((_, idx) => idx !== tIdx));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-foreground text-sm">Eventos programados</h4>
        <button onClick={addEvent} className="flex items-center gap-1.5 text-xs bg-rose-600 text-white px-3 py-1.5 rounded-lg hover:bg-rose-700 transition-colors">
          <Icon name="Plus" size={12} /> Crear evento
        </button>
      </div>
      <div className="space-y-4">
        {(config?.events || [])?.map((ev, i) => (
          <div key={i} className="bg-muted/30 border border-border rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-3">
              <input value={ev?.name} onChange={e => updateEvent(i, 'name', e?.target?.value)} placeholder="Nombre del evento" className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-rose-400" />
              <button onClick={() => removeEvent(i)} className="text-muted-foreground hover:text-destructive"><Icon name="Trash2" size={14} /></button>
            </div>
            <textarea value={ev?.description} onChange={e => updateEvent(i, 'description', e?.target?.value)} placeholder="Descripción del evento (máx. 500 caracteres)" maxLength={500} rows={2} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Fecha</label>
                <input type="date" value={ev?.date} onChange={e => updateEvent(i, 'date', e?.target?.value)} className="w-full text-sm border border-border rounded-lg px-2 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-rose-400" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Hora</label>
                <input type="time" value={ev?.time} onChange={e => updateEvent(i, 'time', e?.target?.value)} className="w-full text-sm border border-border rounded-lg px-2 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-rose-400" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Duración (min)</label>
                <input type="number" min="30" value={ev?.duration} onChange={e => updateEvent(i, 'duration', +e?.target?.value)} className="w-full text-sm border border-border rounded-lg px-2 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-rose-400" />
              </div>
            </div>
            {/* Ticket types */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-foreground">Tipos de entrada</label>
                <button onClick={() => addTicketType(i)} className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1"><Icon name="Plus" size={11} /> Agregar tipo</button>
              </div>
              <div className="space-y-2">
                {(ev?.ticketTypes || [])?.map((t, tIdx) => (
                  <div key={tIdx} className="flex items-center gap-2 bg-background border border-border rounded-lg p-2">
                    <input value={t?.name} onChange={e => updateTicket(i, tIdx, 'name', e?.target?.value)} placeholder="Tipo (ej: General)" className="flex-1 text-xs border border-border rounded px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-rose-400" />
                    <input type="number" min="0" value={t?.price} onChange={e => updateTicket(i, tIdx, 'price', +e?.target?.value)} placeholder="$0" className="w-16 text-xs border border-border rounded px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-rose-400" />
                    <input type="number" min="1" value={t?.quota} onChange={e => updateTicket(i, tIdx, 'quota', +e?.target?.value)} placeholder="Cupo" className="w-16 text-xs border border-border rounded px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-rose-400" />
                    <button onClick={() => removeTicket(i, tIdx)} className="text-muted-foreground hover:text-destructive"><Icon name="X" size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        {(config?.events || [])?.length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">Crea tu primer evento especial</div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ReservationTypeConfig = ({ config, onChange }) => {
  const selectedTypes = config?.selectedTypes || [];
  const typeConfigs = config?.typeConfigs || {};
  const [expandedType, setExpandedType] = useState(null);

  const toggleType = (typeId) => {
    const newSelected = selectedTypes?.includes(typeId)
      ? selectedTypes?.filter(t => t !== typeId)
      : [...selectedTypes, typeId];
    onChange({ ...config, selectedTypes: newSelected });
    if (!selectedTypes?.includes(typeId)) setExpandedType(typeId);
  };

  const updateTypeConfig = (typeId, typeConfig) => {
    onChange({ ...config, typeConfigs: { ...typeConfigs, [typeId]: typeConfig } });
  };

  const renderTypeForm = (typeId) => {
    const tc = typeConfigs?.[typeId] || {};
    switch (typeId) {
      case 'mesa': return <MesaConfig config={tc} onChange={c => updateTypeConfig(typeId, c)} />;
      case 'cita': return <CitaConfig config={tc} onChange={c => updateTypeConfig(typeId, c)} />;
      case 'turno': return <TurnoConfig config={tc} onChange={c => updateTypeConfig(typeId, c)} />;
      case 'clase': return <ClaseConfig config={tc} onChange={c => updateTypeConfig(typeId, c)} />;
      case 'evento': return <EventoConfig config={tc} onChange={c => updateTypeConfig(typeId, c)} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-2xl">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon name="LayoutGrid" size={18} className="text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Tipo de reservación</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Selecciona uno o más tipos según la naturaleza de tu negocio. Cada tipo tiene su propia configuración y vista en el calendario.</p>
        </div>
      </div>
      {/* Type selection cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {RESERVATION_TYPES?.map(type => {
          const isSelected = selectedTypes?.includes(type?.id);
          return (
            <button
              key={type?.id}
              onClick={() => toggleType(type?.id)}
              className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                isSelected
                  ? `${type?.activeBorder} ${type?.bg} shadow-md ring-2 ${type?.ring} ring-offset-1`
                  : `border-border bg-card hover:${type?.bg} hover:${type?.border}`
              }`}
            >
              {isSelected && (
                <div className={`absolute top-3 right-3 w-5 h-5 ${type?.activeBg} rounded-full flex items-center justify-center`}>
                  <Icon name="Check" size={11} className="text-white" />
                </div>
              )}
              <div className={`w-10 h-10 ${isSelected ? type?.activeBg : type?.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon name={type?.icon} size={18} className={isSelected ? 'text-white' : type?.color} />
              </div>
              <h4 className="font-semibold text-foreground text-sm mb-1">{type?.label}</h4>
              <p className="text-xs text-muted-foreground mb-2">{type?.description}</p>
              <div className="flex flex-wrap gap-1">
                {type?.verticals?.map(v => (
                  <span key={v} className={`text-xs px-1.5 py-0.5 rounded ${isSelected ? `${type?.bg} ${type?.color}` : 'bg-muted text-muted-foreground'}`}>{v}</span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
      {/* Configuration panels for selected types */}
      {selectedTypes?.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
            <Icon name="Settings2" size={15} className="text-muted-foreground" />
            Configuración de capacidad y duración
          </h3>
          {selectedTypes?.map(typeId => {
            const type = RESERVATION_TYPES?.find(t => t?.id === typeId);
            if (!type) return null;
            const isExpanded = expandedType === typeId;
            return (
              <div key={typeId} className={`border-2 rounded-2xl overflow-hidden transition-all ${isExpanded ? type?.activeBorder : 'border-border'}`}>
                <button
                  onClick={() => setExpandedType(isExpanded ? null : typeId)}
                  className={`w-full flex items-center justify-between p-4 text-left transition-colors ${isExpanded ? type?.bg : 'bg-card hover:bg-muted/30'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${isExpanded ? type?.activeBg : type?.bg} rounded-lg flex items-center justify-center`}>
                      <Icon name={type?.icon} size={15} className={isExpanded ? 'text-white' : type?.color} />
                    </div>
                    <span className="font-semibold text-foreground text-sm">{type?.label}</span>
                    <span className="text-xs text-muted-foreground">— Capacidad y duración</span>
                  </div>
                  <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground" />
                </button>
                {isExpanded && (
                  <div className="p-5 border-t border-border bg-card">
                    {renderTypeForm(typeId)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {selectedTypes?.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          <Icon name="MousePointerClick" size={32} className="mx-auto mb-2 opacity-40" />
          Selecciona al menos un tipo de reservación para continuar
        </div>
      )}
    </div>
  );
};

export default ReservationTypeConfig;
