import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const DAYS = [
  { id: 1, label: 'Lunes', short: 'Lun' },
  { id: 2, label: 'Martes', short: 'Mar' },
  { id: 3, label: 'Miércoles', short: 'Mié' },
  { id: 4, label: 'Jueves', short: 'Jue' },
  { id: 5, label: 'Viernes', short: 'Vie' },
  { id: 6, label: 'Sábado', short: 'Sáb' },
  { id: 0, label: 'Domingo', short: 'Dom' },
];

const generateSlotPreview = (start, end, interval) => {
  if (!start || !end || !interval) return [];
  const slots = [];
  const [sh, sm] = start?.split(':')?.map(Number);
  const [eh, em] = end?.split(':')?.map(Number);
  let current = sh * 60 + sm;
  const endMin = eh * 60 + em;
  while (current < endMin) {
    const h = Math.floor(current / 60)?.toString()?.padStart(2, '0');
    const m = (current % 60)?.toString()?.padStart(2, '0');
    slots?.push(`${h}:${m}`);
    current += interval;
  }
  return slots;
};

const SlotConfigurator = ({ onSave }) => {
  const [dayConfigs, setDayConfigs] = useState(
    DAYS?.reduce((acc, d) => ({
      ...acc,
      [d?.id]: {
        active: d?.id >= 1 && d?.id <= 5,
        ranges: [{ start: '09:00', end: '18:00', interval: 30, capacity: 5 }],
      },
    }), {})
  );
  const [copySourceDay, setCopySourceDay] = useState(null);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyTargets, setCopyTargets] = useState([]);

  const toggleDay = (dayId) => {
    setDayConfigs(prev => ({
      ...prev,
      [dayId]: { ...prev?.[dayId], active: !prev?.[dayId]?.active },
    }));
  };

  const updateRange = (dayId, rangeIdx, field, value) => {
    setDayConfigs(prev => {
      const ranges = [...prev?.[dayId]?.ranges];
      ranges[rangeIdx] = { ...ranges?.[rangeIdx], [field]: value };
      return { ...prev, [dayId]: { ...prev?.[dayId], ranges } };
    });
  };

  const addRange = (dayId) => {
    setDayConfigs(prev => ({
      ...prev,
      [dayId]: {
        ...prev?.[dayId],
        ranges: [...prev?.[dayId]?.ranges, { start: '10:00', end: '14:00', interval: 30, capacity: 5 }],
      },
    }));
  };

  const removeRange = (dayId, rangeIdx) => {
    setDayConfigs(prev => {
      const ranges = prev?.[dayId]?.ranges?.filter((_, i) => i !== rangeIdx);
      return { ...prev, [dayId]: { ...prev?.[dayId], ranges } };
    });
  };

  const handleCopyToOthers = (dayId) => {
    setCopySourceDay(dayId);
    setCopyTargets([]);
    setShowCopyModal(true);
  };

  const applyCopy = () => {
    if (!copySourceDay) return;
    const source = dayConfigs?.[copySourceDay];
    setDayConfigs(prev => {
      const updated = { ...prev };
      copyTargets?.forEach(tid => {
        updated[tid] = { ...updated?.[tid], ranges: JSON.parse(JSON.stringify(source?.ranges)) };
      });
      return updated;
    });
    setShowCopyModal(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">Configurador de Slots por Día</h3>
      </div>
      {DAYS?.map(day => {
        const cfg = dayConfigs?.[day?.id];
        return (
          <div key={day?.id} className={`border rounded-xl transition-all ${cfg?.active ? 'border-border bg-card' : 'border-border/40 bg-muted/20'}`}>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleDay(day?.id)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${cfg?.active ? 'bg-primary' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${cfg?.active ? 'left-5' : 'left-0.5'}`} />
                </button>
                <span className={`text-sm font-medium ${cfg?.active ? 'text-foreground' : 'text-muted-foreground'}`}>{day?.label}</span>
              </div>
              {cfg?.active && (
                <div className="flex items-center gap-2">
                  <button onClick={() => handleCopyToOthers(day?.id)} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Icon name="Copy" size={12} /> Copiar a otros días
                  </button>
                  <button onClick={() => addRange(day?.id)} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg hover:bg-primary/20 flex items-center gap-1">
                    <Icon name="Plus" size={12} /> Franja
                  </button>
                </div>
              )}
            </div>
            {cfg?.active && (
              <div className="px-4 pb-4 space-y-3">
                {cfg?.ranges?.map((range, ri) => {
                  const preview = generateSlotPreview(range?.start, range?.end, range?.interval);
                  return (
                    <div key={ri} className="bg-muted/30 rounded-xl p-3 space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Inicio</label>
                          <input type="time" value={range?.start} onChange={e => updateRange(day?.id, ri, 'start', e?.target?.value)}
                            className="w-full text-sm border border-border rounded-lg px-2 py-1.5 bg-background text-foreground" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Fin</label>
                          <input type="time" value={range?.end} onChange={e => updateRange(day?.id, ri, 'end', e?.target?.value)}
                            className="w-full text-sm border border-border rounded-lg px-2 py-1.5 bg-background text-foreground" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Intervalo</label>
                          <select value={range?.interval} onChange={e => updateRange(day?.id, ri, 'interval', Number(e?.target?.value))}
                            className="w-full text-sm border border-border rounded-lg px-2 py-1.5 bg-background text-foreground">
                            <option value={15}>15 min</option>
                            <option value={20}>20 min</option>
                            <option value={30}>30 min</option>
                            <option value={60}>60 min</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Capacidad máx.</label>
                          <div className="flex items-center gap-1">
                            <input type="number" min={1} max={100} value={range?.capacity} onChange={e => updateRange(day?.id, ri, 'capacity', Number(e?.target?.value))}
                              className="w-full text-sm border border-border rounded-lg px-2 py-1.5 bg-background text-foreground" />
                            {cfg?.ranges?.length > 1 && (
                              <button onClick={() => removeRange(day?.id, ri)} className="text-destructive hover:bg-destructive/10 p-1 rounded-lg">
                                <Icon name="Trash2" size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      {preview?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-muted-foreground mr-1">Preview:</span>
                          {preview?.slice(0, 8)?.map(s => (
                            <span key={s} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">{s}</span>
                          ))}
                          {preview?.length > 8 && <span className="text-xs text-muted-foreground">+{preview?.length - 8} más</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      {/* Copy modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-foreground mb-1">Copiar configuración</h3>
            <p className="text-sm text-muted-foreground mb-4">Selecciona los días a los que copiar la configuración de <strong>{DAYS?.find(d => d?.id === copySourceDay)?.label}</strong></p>
            <div className="space-y-2 mb-4">
              {DAYS?.filter(d => d?.id !== copySourceDay)?.map(d => (
                <label key={d?.id} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={copyTargets?.includes(d?.id)}
                    onChange={e => setCopyTargets(prev => e?.target?.checked ? [...prev, d?.id] : prev?.filter(x => x !== d?.id))}
                    className="rounded" />
                  <span className="text-sm text-foreground">{d?.label}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={applyCopy} className="flex-1 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90">Copiar</button>
              <button onClick={() => setShowCopyModal(false)} className="flex-1 py-2 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted/50">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotConfigurator;
