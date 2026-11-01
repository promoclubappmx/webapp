import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const HOURS = Array.from({ length: 17 }, (_, i) => i + 7); // 7 AM to 11 PM

const STATUS_COLORS = {
  confirmed: { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-100', label: 'Confirmada', dot: 'bg-blue-500' },
  pending: { bg: 'bg-amber-500', text: 'text-amber-700', light: 'bg-amber-100', label: 'Pendiente', dot: 'bg-amber-500' },
  completed: { bg: 'bg-emerald-500', text: 'text-emerald-700', light: 'bg-emerald-100', label: 'Completada', dot: 'bg-emerald-500' },
  no_show: { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-100', label: 'No-show', dot: 'bg-red-500' },
  cancelled: { bg: 'bg-gray-400', text: 'text-gray-600', light: 'bg-gray-100', label: 'Cancelada', dot: 'bg-gray-400' },
};

const MOCK_RESERVATIONS = [
  { id: 1, client: 'María González', hour: 9, duration: 1.5, resource: 'Mesa 3', persons: 4, status: 'confirmed', vip: 'Oro', noShowHistory: 0, type: 'mesa', notes: '' },
  { id: 2, client: 'Carlos Ruiz', hour: 10, duration: 1, resource: 'Estilista Ana', persons: 1, status: 'pending', vip: null, noShowHistory: 2, type: 'cita', notes: 'Corte + tinte' },
  { id: 3, client: 'Laura Pérez', hour: 11, duration: 1, resource: 'Clase Yoga', persons: 1, status: 'confirmed', vip: 'Plata', noShowHistory: 0, type: 'clase', notes: '' },
  { id: 4, client: 'Roberto Silva', hour: 13, duration: 2, resource: 'Mesa 7', persons: 6, status: 'confirmed', vip: null, noShowHistory: 1, type: 'mesa', notes: 'Cumpleaños' },
  { id: 5, client: 'Ana Torres', hour: 14, duration: 0.5, resource: 'Estilista Luis', persons: 1, status: 'completed', vip: 'Bronce', noShowHistory: 0, type: 'cita', notes: '' },
  { id: 6, client: 'Diego Morales', hour: 16, duration: 1, resource: 'Mesa 2', persons: 2, status: 'no_show', vip: null, noShowHistory: 3, type: 'mesa', notes: '' },
  { id: 7, client: 'Sofía Ramírez', hour: 18, duration: 1.5, resource: 'Clase Spinning', persons: 1, status: 'confirmed', vip: 'Oro', noShowHistory: 0, type: 'clase', notes: '' },
  { id: 8, client: 'Miguel Ángel', hour: 19, duration: 2, resource: 'Mesa 5', persons: 3, status: 'pending', vip: null, noShowHistory: 0, type: 'mesa', notes: '' },
  { id: 9, client: 'Valentina Cruz', hour: 20, duration: 1, resource: 'Estilista María', persons: 1, status: 'confirmed', vip: 'Plata', noShowHistory: 0, type: 'cita', notes: 'Manicure' },
];

const MOCK_WAITLIST = [
  { id: 1, client: 'Pedro Jiménez', slot: 'Mesa 3 — 13:00', position: 1, vip: 'Oro', registeredAt: '10:23' },
  { id: 2, client: 'Camila Vega', slot: 'Mesa 3 — 13:00', position: 2, vip: null, registeredAt: '10:45' },
  { id: 3, client: 'Andrés López', slot: 'Clase Yoga — 11:00', position: 1, vip: 'Bronce', registeredAt: '09:15' },
];

const VIEWS = [
  { id: 'day', label: 'Día', icon: 'CalendarDays' },
  { id: 'week', label: 'Semana', icon: 'CalendarRange' },
  { id: 'list', label: 'Lista', icon: 'List' },
];

const VIPBadge = ({ level }) => {
  if (!level) return null;
  const colors = { Oro: 'bg-amber-100 text-amber-700', Plata: 'bg-gray-100 text-gray-600', Bronce: 'bg-orange-100 text-orange-700' };
  return <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${colors?.[level] || 'bg-muted text-muted-foreground'}`}>{level}</span>;
};

const ReservationBlock = ({ res, onClick }) => {
  const status = STATUS_COLORS?.[res?.status] || STATUS_COLORS?.confirmed;
  const topPct = ((res?.hour - 7) / 16) * 100;
  const heightPct = (res?.duration / 16) * 100;

  return (
    <button
      onClick={() => onClick(res)}
      className={`absolute left-1 right-1 ${status?.bg} text-white rounded-lg p-1.5 text-left overflow-hidden shadow-sm hover:shadow-md transition-shadow z-10`}
      style={{ top: `${topPct}%`, height: `${heightPct}%`, minHeight: '32px' }}
    >
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-xs font-semibold truncate">{res?.client}</span>
        {res?.noShowHistory >= 2 && <Icon name="AlertTriangle" size={10} className="text-white opacity-80 flex-shrink-0" />}
      </div>
      {res?.duration >= 1 && <p className="text-xs opacity-80 truncate">{res?.resource}</p>}
    </button>
  );
};

const OperationalCalendar = () => {
  const [view, setView] = useState('day');
  const [selectedRes, setSelectedRes] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const today = new Date();
  const dateStr = today?.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const filteredRes = filterStatus === 'all' ? MOCK_RESERVATIONS : MOCK_RESERVATIONS?.filter(r => r?.status === filterStatus);

  const stats = {
    total: MOCK_RESERVATIONS?.length,
    confirmed: MOCK_RESERVATIONS?.filter(r => r?.status === 'confirmed')?.length,
    pending: MOCK_RESERVATIONS?.filter(r => r?.status === 'pending')?.length,
    waitlist: MOCK_WAITLIST?.length,
    capacity: Math.round((MOCK_RESERVATIONS?.filter(r => ['confirmed', 'completed']?.includes(r?.status))?.length / 12) * 100),
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon name="CalendarCheck" size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">Calendario operativo</h3>
          <p className="text-sm text-muted-foreground mt-0.5 capitalize">{dateStr}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowWaitlist(true)}
            className="flex items-center gap-1.5 text-xs bg-teal-600 text-white px-3 py-2 rounded-xl hover:bg-teal-700 transition-colors"
          >
            <Icon name="ListOrdered" size={13} />
            Lista de espera
            {MOCK_WAITLIST?.length > 0 && (
              <span className="bg-white text-teal-700 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">{MOCK_WAITLIST?.length}</span>
            )}
          </button>
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Icon name="Plus" size={13} />
            Nueva reserva
          </button>
        </div>
      </div>
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total hoy', value: stats?.total, icon: 'Calendar', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
          { label: 'Confirmadas', value: stats?.confirmed, icon: 'CheckCircle2', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { label: 'Pendientes', value: stats?.pending, icon: 'Clock', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
          { label: 'En espera', value: stats?.waitlist, icon: 'Users', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
          { label: 'Capacidad', value: `${stats?.capacity}%`, icon: 'BarChart2', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
        ]?.map((s, i) => (
          <div key={i} className={`${s?.bg} border ${s?.border} rounded-xl p-3 flex items-center gap-3`}>
            <Icon name={s?.icon} size={16} className={s?.color} />
            <div>
              <p className={`text-lg font-bold ${s?.color}`}>{s?.value}</p>
              <p className="text-xs text-muted-foreground">{s?.label}</p>
            </div>
          </div>
        ))}
      </div>
      {/* View switcher + filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 bg-muted/50 p-1 rounded-xl">
          {VIEWS?.map(v => (
            <button
              key={v?.id}
              onClick={() => setView(v?.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === v?.id ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={v?.icon} size={13} />
              {v?.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {[{ id: 'all', label: 'Todas' }, ...Object.entries(STATUS_COLORS)?.map(([id, s]) => ({ id, label: s?.label }))]?.map(f => (
            <button
              key={f?.id}
              onClick={() => setFilterStatus(f?.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                filterStatus === f?.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-blue-100 hover:text-blue-700'
              }`}
            >
              {f?.label}
            </button>
          ))}
        </div>
      </div>
      {/* Status legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(STATUS_COLORS)?.map(([key, s]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${s?.dot}`} />
            <span className="text-xs text-muted-foreground">{s?.label}</span>
          </div>
        ))}
      </div>
      {/* Day view */}
      {view === 'day' && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Column headers */}
              <div className="grid grid-cols-4 border-b border-border bg-muted/30">
                <div className="p-3 text-xs font-semibold text-muted-foreground border-r border-border">Hora</div>
                <div className="p-3 text-xs font-semibold text-muted-foreground border-r border-border">Mesas / Zona</div>
                <div className="p-3 text-xs font-semibold text-muted-foreground border-r border-border">Citas / Profesional</div>
                <div className="p-3 text-xs font-semibold text-muted-foreground">Clases / Eventos</div>
              </div>
              {/* Timeline */}
              <div className="relative" style={{ height: `${HOURS?.length * 60}px` }}>
                {/* Hour lines */}
                {HOURS?.map((h, i) => (
                  <div key={h} className="absolute left-0 right-0 border-t border-border/50 flex" style={{ top: `${(i / HOURS?.length) * 100}%` }}>
                    <div className="w-1/4 px-3 py-1 border-r border-border/50">
                      <span className="text-xs text-muted-foreground">{h}:00</span>
                    </div>
                    <div className="w-1/4 border-r border-border/50 relative" />
                    <div className="w-1/4 border-r border-border/50 relative" />
                    <div className="w-1/4 relative" />
                  </div>
                ))}
                {/* Reservation blocks */}
                {filteredRes?.filter(r => r?.type === 'mesa')?.map(res => (
                  <div key={res?.id} className="absolute" style={{ left: '25%', width: '25%', top: `${((res?.hour - 7) / HOURS?.length) * 100}%`, height: `${(res?.duration / HOURS?.length) * 100}%` }}>
                    <ReservationBlock res={res} onClick={setSelectedRes} />
                  </div>
                ))}
                {filteredRes?.filter(r => r?.type === 'cita')?.map(res => (
                  <div key={res?.id} className="absolute" style={{ left: '50%', width: '25%', top: `${((res?.hour - 7) / HOURS?.length) * 100}%`, height: `${(res?.duration / HOURS?.length) * 100}%` }}>
                    <ReservationBlock res={res} onClick={setSelectedRes} />
                  </div>
                ))}
                {filteredRes?.filter(r => r?.type === 'clase')?.map(res => (
                  <div key={res?.id} className="absolute" style={{ left: '75%', width: '25%', top: `${((res?.hour - 7) / HOURS?.length) * 100}%`, height: `${(res?.duration / HOURS?.length) * 100}%` }}>
                    <ReservationBlock res={res} onClick={setSelectedRes} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* List view */}
      {view === 'list' && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  {['Hora', 'Cliente', 'Tipo / Recurso', 'Personas', 'Estado', 'Acciones']?.map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRes?.map(res => {
                  const status = STATUS_COLORS?.[res?.status];
                  return (
                    <tr key={res?.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{res?.hour}:00</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-foreground">{res?.client}</span>
                          <VIPBadge level={res?.vip} />
                          {res?.noShowHistory >= 2 && (
                            <span title={`${res?.noShowHistory} no-shows`}>
                              <Icon name="AlertTriangle" size={13} className="text-amber-500" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-foreground">{res?.resource}</p>
                          {res?.notes && <p className="text-xs text-muted-foreground">{res?.notes}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{res?.persons}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status?.light} ${status?.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status?.dot}`} />
                          {status?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => setSelectedRes(res)} className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors" title="Ver detalle">
                            <Icon name="Eye" size={13} />
                          </button>
                          {res?.status === 'confirmed' && (
                            <button className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors" title="Check-in">
                              <Icon name="UserCheck" size={13} />
                            </button>
                          )}
                          {res?.status === 'pending' && (
                            <button className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors" title="Confirmar">
                              <Icon name="Check" size={13} />
                            </button>
                          )}
                          <button className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 transition-colors" title="WhatsApp">
                            <Icon name="MessageCircle" size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Week view */}
      {view === 'week' && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-8 border-b border-border bg-muted/30">
                <div className="p-3 text-xs font-semibold text-muted-foreground border-r border-border">Hora</div>
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']?.map((d, i) => (
                  <div key={d} className={`p-3 text-center border-r border-border last:border-r-0 ${i === 1 ? 'bg-blue-50' : ''}`}>
                    <p className="text-xs font-semibold text-muted-foreground">{d}</p>
                    <p className={`text-sm font-bold ${i === 1 ? 'text-blue-600' : 'text-foreground'}`}>{10 + i}</p>
                  </div>
                ))}
              </div>
              {HOURS?.slice(0, 12)?.map(h => (
                <div key={h} className="grid grid-cols-8 border-b border-border/50 min-h-[48px]">
                  <div className="p-2 border-r border-border/50 flex items-start">
                    <span className="text-xs text-muted-foreground">{h}:00</span>
                  </div>
                  {[0, 1, 2, 3, 4, 5, 6]?.map(d => {
                    const dayRes = MOCK_RESERVATIONS?.filter(r => r?.hour === h && (d + r?.id) % 3 === 0);
                    return (
                      <div key={d} className={`p-1 border-r border-border/50 last:border-r-0 ${d === 1 ? 'bg-blue-50/50' : ''}`}>
                        {dayRes?.map(res => {
                          const status = STATUS_COLORS?.[res?.status];
                          return (
                            <button key={res?.id} onClick={() => setSelectedRes(res)} className={`w-full text-left text-xs ${status?.bg} text-white rounded px-1.5 py-0.5 mb-0.5 truncate hover:opacity-90`}>
                              {res?.client?.split(' ')?.[0]}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Reservation detail drawer */}
      {selectedRes && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40" onClick={() => setSelectedRes(null)}>
          <div className="bg-card border border-border rounded-t-3xl md:rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e?.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Icon name="User" size={18} className="text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{selectedRes?.client}</h3>
                    <VIPBadge level={selectedRes?.vip} />
                  </div>
                  <p className="text-xs text-muted-foreground">{selectedRes?.hour}:00 — {selectedRes?.resource}</p>
                </div>
              </div>
              <button onClick={() => setSelectedRes(null)} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={18} />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/30 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">Estado</p>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS?.[selectedRes?.status]?.light} ${STATUS_COLORS?.[selectedRes?.status]?.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS?.[selectedRes?.status]?.dot}`} />
                    {STATUS_COLORS?.[selectedRes?.status]?.label}
                  </span>
                </div>
                <div className="bg-muted/30 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">Personas</p>
                  <p className="text-sm font-semibold text-foreground">{selectedRes?.persons}</p>
                </div>
              </div>
              {selectedRes?.noShowHistory > 0 && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <Icon name="AlertTriangle" size={14} className="text-amber-600" />
                  <p className="text-xs text-amber-700">{selectedRes?.client} tiene <strong>{selectedRes?.noShowHistory} no-shows</strong> en los últimos 6 meses.</p>
                </div>
              )}
              {selectedRes?.notes && (
                <div className="p-3 bg-muted/30 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">Notas</p>
                  <p className="text-sm text-foreground">{selectedRes?.notes}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {selectedRes?.status === 'confirmed' && (
                <button className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
                  <Icon name="UserCheck" size={15} />
                  Check-in
                </button>
              )}
              {selectedRes?.status === 'pending' && (
                <button className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                  <Icon name="Check" size={15} />
                  Confirmar
                </button>
              )}
              {['confirmed', 'pending']?.includes(selectedRes?.status) && (
                <button className="flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors">
                  <Icon name="UserX" size={15} />
                  No-show
                </button>
              )}
              <button className="flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors col-span-1">
                <Icon name="MessageCircle" size={15} />
                WhatsApp
              </button>
              <button onClick={() => setSelectedRes(null)} className="flex items-center justify-center gap-2 bg-muted text-muted-foreground py-2.5 rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors">
                <Icon name="X" size={15} />
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Waitlist drawer */}
      {showWaitlist && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40" onClick={() => setShowWaitlist(false)}>
          <div className="bg-card border border-border rounded-t-3xl md:rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e?.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Icon name="ListOrdered" size={18} className="text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Lista de espera</h3>
                  <p className="text-xs text-muted-foreground">{MOCK_WAITLIST?.length} personas en espera</p>
                </div>
              </div>
              <button onClick={() => setShowWaitlist(false)} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={18} />
              </button>
            </div>
            <div className="space-y-3">
              {MOCK_WAITLIST?.map(w => (
                <div key={w?.id} className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-xl">
                  <span className="text-sm font-bold text-teal-600 w-6 text-center">#{w?.position}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{w?.client}</span>
                      <VIPBadge level={w?.vip} />
                    </div>
                    <p className="text-xs text-muted-foreground">{w?.slot} · Registrado {w?.registeredAt}</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-lg bg-teal-100 text-teal-700 hover:bg-teal-200 transition-colors" title="Notificar">
                      <Icon name="Bell" size={13} />
                    </button>
                    <button className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors" title="Eliminar">
                      <Icon name="Trash2" size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* New reservation form */}
      {showNewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowNewForm(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl mx-4" onClick={e => e?.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-foreground">Nueva reservación manual</h3>
              <button onClick={() => setShowNewForm(false)} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Cliente (buscar o crear)</label>
                <input placeholder="Nombre o teléfono del cliente" className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Fecha</label>
                  <input type="date" className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Hora</label>
                  <input type="time" className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Tipo de reservación</label>
                <select className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option>Mesa</option>
                  <option>Cita</option>
                  <option>Turno</option>
                  <option>Clase</option>
                  <option>Evento</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Notas</label>
                <textarea rows={2} placeholder="Notas adicionales..." className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                  Crear reservación
                </button>
                <button onClick={() => setShowNewForm(false)} className="px-4 bg-muted text-muted-foreground py-2.5 rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationalCalendar;
