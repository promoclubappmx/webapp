import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none ${
        checked ? 'bg-primary' : 'bg-slate-300'
      }`}
    >
      <span
        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300"
        style={{ left: checked ? '22px' : '2px' }}
      />
    </button>
  </div>
);

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const GlobalNotificationsConfig = () => {
  const [startHour, setStartHour] = useState('08:00');
  const [endHour, setEndHour] = useState('22:00');
  const [activeDays, setActiveDays] = useState(DAYS?.map(() => true));

  const toggleDay = (i) => {
    setActiveDays(prev => prev?.map((v, idx) => idx === i ? !v : v));
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
        <Icon name="Settings" size={18} className="text-primary" />
        Configuración global de notificaciones
      </h2>
      {/* Platform rules */}
      <div className="p-4 bg-muted/30 rounded-xl border border-border mb-5 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Reglas de plataforma</p>
        {[
          'Máximo 1 notificación de bienvenida por cliente por negocio por día',
          'Mínimo 2 horas entre notificación de bienvenida y de despedida',
          'Los clientes pueden desactivar notificaciones geofence desde su perfil',
        ]?.map((rule, i) => (
          <div key={i} className="flex items-start gap-2">
            <Icon name="Info" size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">{rule}</p>
          </div>
        ))}
      </div>
      {/* Time range */}
      <div className="mb-5">
        <p className="text-sm font-medium text-foreground mb-2">Horario de envío permitido</p>
        <div className="flex items-center gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Desde</label>
            <input
              type="time"
              value={startHour}
              onChange={e => setStartHour(e?.target?.value)}
              className="block mt-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <span className="text-muted-foreground mt-5">–</span>
          <div>
            <label className="text-xs text-muted-foreground">Hasta</label>
            <input
              type="time"
              value={endHour}
              onChange={e => setEndHour(e?.target?.value)}
              className="block mt-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Las notificaciones fuera del horario configurado no se acumulan para enviarse después.
        </p>
      </div>
      {/* Active days */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">Días activos</p>
        <div className="flex gap-2 flex-wrap">
          {DAYS?.map((day, i) => (
            <button
              key={day}
              onClick={() => toggleDay(i)}
              className={`w-10 h-10 rounded-xl text-xs font-semibold border-2 transition-all ${
                activeDays?.[i]
                  ? 'bg-primary text-white border-primary' :'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GlobalNotificationsConfig;
