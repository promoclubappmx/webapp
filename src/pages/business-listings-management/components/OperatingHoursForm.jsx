import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const DAYS = [
  { key: 'lunes', label: 'Lunes', short: 'Lun' },
  { key: 'martes', label: 'Martes', short: 'Mar' },
  { key: 'miercoles', label: 'Miércoles', short: 'Mié' },
  { key: 'jueves', label: 'Jueves', short: 'Jue' },
  { key: 'viernes', label: 'Viernes', short: 'Vie' },
  { key: 'sabado', label: 'Sábado', short: 'Sáb' },
  { key: 'domingo', label: 'Domingo', short: 'Dom' },
];

const TIMEZONES = [
  { value: 'America/Mexico_City', label: 'Tiempo del Centro (UTC-6)' },
  { value: 'America/Mazatlan', label: 'Tiempo del Pacífico (UTC-7)' },
  { value: 'America/Chihuahua', label: 'Tiempo de la Montaña (UTC-7)' },
  { value: 'America/Tijuana', label: 'Tiempo del Noroeste (UTC-8)' },
];

const MEXICAN_HOLIDAYS = [
  { date: '2026-01-01', name: 'Año Nuevo' },
  { date: '2026-02-02', name: 'Día de la Constitución' },
  { date: '2026-03-21', name: 'Natalicio Benito Juárez' },
  { date: '2026-04-02', name: 'Jueves Santo' },
  { date: '2026-04-03', name: 'Viernes Santo' },
  { date: '2026-05-01', name: 'Día del Trabajo' },
  { date: '2026-09-16', name: 'Independencia de México' },
  { date: '2026-11-02', name: 'Día de Muertos' },
  { date: '2026-11-16', name: 'Revolución Mexicana' },
  { date: '2026-12-25', name: 'Navidad' },
];

const SHIFT_PRESETS = ['Desayuno', 'Comida', 'Cena', 'Turno AM', 'Turno PM', 'Clases', 'Apertura', 'Cierre', 'Brunch', 'Happy Hour', 'Madrugada'];

const timeOptions = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 15) {
    const t = `${String(h)?.padStart(2,'0')}:${String(m)?.padStart(2,'0')}`;
    timeOptions?.push({ value: t, label: t });
  }
}

const defaultDay = () => ({ isOpen: true, shifts: [{ open: '09:00', close: '22:00', label: '' }] });
const defaultHours = () => Object.fromEntries(DAYS?.map(d => [d?.key, defaultDay()]));

// Toggle component for reuse
const Toggle = ({ checked, onChange, colorClass = 'bg-primary', ringClass = 'focus:ring-primary/30', label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onChange}
    className={`relative inline-flex w-12 h-6 rounded-full transition-colors duration-200 ease-in-out flex-shrink-0 focus:outline-none focus:ring-2 ${ringClass} ${
      checked ? colorClass : 'bg-gray-200'
    }`}
  >
    <span
      className={`pointer-events-none inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out mt-0.5 ${
        checked ? 'translate-x-6' : 'translate-x-0.5'
      }`}
    />
  </button>
);

const OperatingHoursForm = ({ formData, onChange, errors }) => {
  const [showSpecial, setShowSpecial] = useState(false);
  // Tracks which shift label panels are open: key = "dayKey-shiftIdx"
  const [openLabelPanels, setOpenLabelPanels] = useState({});
  // Tracks custom label input values
  const [customLabelInputs, setCustomLabelInputs] = useState({});

  const hours = formData?.operatingHours || defaultHours();
  const specialHours = formData?.specialHours || [];
  const timezone = formData?.timezone || 'America/Mexico_City';
  const tempClosed = formData?.temporarilyClosed || false;
  const tempNote = formData?.tempClosedNote || '';
  const showLiveStats = formData?.showLiveStats !== false;

  const updateHours = (updated) => onChange('operatingHours', updated);

  const toggleDay = (day) => {
    const updated = { ...hours };
    updated[day] = { ...updated?.[day], isOpen: !updated?.[day]?.isOpen };
    updateHours(updated);
  };

  const updateShift = (day, idx, field, val) => {
    const updated = { ...hours };
    const shifts = [...(updated?.[day]?.shifts || [])];
    shifts[idx] = { ...shifts?.[idx], [field]: val };
    updated[day] = { ...updated?.[day], shifts };
    updateHours(updated);
  };

  const addShift = (day) => {
    const updated = { ...hours };
    updated[day] = { ...updated?.[day], shifts: [...(updated?.[day]?.shifts || []), { open: '17:00', close: '22:00', label: '' }] };
    updateHours(updated);
  };

  const removeShift = (day, idx) => {
    const updated = { ...hours };
    updated[day] = { ...updated?.[day], shifts: updated?.[day]?.shifts?.filter((_,i) => i !== idx) };
    updateHours(updated);
  };

  const copyMondayToAll = () => {
    const mondayHours = hours?.['lunes'];
    const updated = {};
    DAYS?.forEach(d => { updated[d.key] = { ...mondayHours, shifts: mondayHours?.shifts?.map(s => ({ ...s })) }; });
    updateHours(updated);
  };

  const set24Hours = () => {
    const updated = {};
    DAYS?.forEach(d => { updated[d.key] = { isOpen: true, shifts: [{ open: '00:00', close: '23:59', label: '' }] }; });
    updateHours(updated);
  };

  const addSpecialHour = (date = '', name = '') => {
    onChange('specialHours', [...specialHours, { date, name, closed: false, shifts: [{ open: '09:00', close: '22:00' }] }]);
  };

  const removeSpecialHour = (idx) => {
    onChange('specialHours', specialHours?.filter((_,i) => i !== idx));
  };

  const updateSpecial = (idx, field, val) => {
    const updated = specialHours?.map((s,i) => i === idx ? { ...s, [field]: val } : s);
    onChange('specialHours', updated);
  };

  const openLabelPanel = (key) => {
    setOpenLabelPanels(prev => ({ ...prev, [key]: true }));
  };

  const closeLabelPanel = (key) => {
    setOpenLabelPanels(prev => { const n = { ...prev }; delete n?.[key]; return n; });
    setCustomLabelInputs(prev => { const n = { ...prev }; delete n?.[key]; return n; });
  };

  const setCustomLabelInput = (key, val) => {
    setCustomLabelInputs(prev => ({ ...prev, [key]: val }));
  };

  const applyLabel = (day, idx, label) => {
    updateShift(day, idx, 'label', label);
    const key = `${day}-${idx}`;
    closeLabelPanel(key);
  };

  const getCurrentStatus = () => {
    const now = new Date();
    const dayKeys = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
    const todayKey = dayKeys?.[now?.getDay()];
    const todayHours = hours?.[todayKey];
    if (!todayHours?.isOpen) return { open: false, text: 'Cerrado hoy' };
    const cur = `${String(now?.getHours())?.padStart(2,'0')}:${String(now?.getMinutes())?.padStart(2,'0')}`;
    for (const s of (todayHours?.shifts || [])) {
      if (cur >= s?.open && cur <= s?.close) return { open: true, text: `Abierto ahora — Cierra a las ${s?.close}` };
    }
    const nextShift = todayHours?.shifts?.find(s => cur < s?.open);
    if (nextShift) return { open: false, text: `Cerrado — Abre hoy a las ${nextShift?.open}` };
    return { open: false, text: 'Cerrado — Abre mañana' };
  };

  const status = getCurrentStatus();

  return (
    <div className="space-y-6">
      {/* Timezone + status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="text-base font-semibold text-foreground">Horario regular</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${
            status?.open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status?.open ? 'bg-green-500' : 'bg-red-500'}`} />
            {status?.text}
          </span>
          <div className="flex items-center gap-2">
            <Icon name="Globe" size={14} className="text-muted-foreground" />
            <select value={timezone} onChange={e => onChange('timezone', e?.target?.value)}
              className="text-xs border border-border rounded-lg px-2 py-1 bg-background text-foreground focus:outline-none">
              {TIMEZONES?.map(tz => <option key={tz?.value} value={tz?.value}>{tz?.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <button onClick={copyMondayToAll}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors">
          <Icon name="Copy" size={12} /> Copiar Lunes a todos los días
        </button>
        <button onClick={set24Hours}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors">
          <Icon name="Clock" size={12} /> Horario 24 horas
        </button>
      </div>

      {/* Days grid */}
      <div className="space-y-2">
        {DAYS?.map(day => {
          const d = hours?.[day?.key] || { isOpen: false, shifts: [] };
          return (
            <div key={day?.key} className={`border rounded-xl transition-all ${
              d?.isOpen ? 'border-border bg-card' : 'border-border/50 bg-muted/20'
            }`}>
              {/* Day header row */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Toggle
                    checked={d?.isOpen}
                    onChange={() => toggleDay(day?.key)}
                    colorClass="bg-primary"
                    ringClass="focus:ring-primary/30"
                    label={d?.isOpen ? `Cerrar ${day?.label}` : `Abrir ${day?.label}`}
                  />
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold w-24 ${d?.isOpen ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {day?.label}
                    </span>
                    {!d?.isOpen && (
                      <span className="text-xs text-muted-foreground italic">Cerrado</span>
                    )}
                    {d?.isOpen && d?.shifts?.length > 0 && (
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {d?.shifts?.map(s => `${s?.open}–${s?.close}${s?.label ? ` (${s?.label})` : ''}`)?.join(' · ')}
                      </span>
                    )}
                  </div>
                </div>
                {d?.isOpen && (
                  <button onClick={() => addShift(day?.key)}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium">
                    <Icon name="Plus" size={12} /> Turno
                  </button>
                )}
              </div>

              {/* Shifts */}
              {d?.isOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
                  {(d?.shifts || [])?.map((shift, idx) => {
                    const labelKey = `${day?.key}-${idx}`;
                    const isPanelOpen = !!openLabelPanels?.[labelKey];
                    const isCustomMode = customLabelInputs?.[labelKey] !== undefined;

                    return (
                      <div key={idx} className="space-y-2">
                        {/* Time selectors row */}
                        <div className="flex flex-wrap items-center gap-2">
                          <select value={shift?.open} onChange={e => updateShift(day?.key, idx, 'open', e?.target?.value)}
                            className="px-2 py-1.5 border border-border rounded-lg bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/30">
                            {timeOptions?.map(t => <option key={t?.value} value={t?.value}>{t?.label}</option>)}
                          </select>
                          <span className="text-muted-foreground text-xs">a</span>
                          <select value={shift?.close} onChange={e => updateShift(day?.key, idx, 'close', e?.target?.value)}
                            className="px-2 py-1.5 border border-border rounded-lg bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/30">
                            {timeOptions?.map(t => <option key={t?.value} value={t?.value}>{t?.label}</option>)}
                          </select>

                          {/* Show label badge if set, or "Agregar etiqueta" button */}
                          {shift?.label ? (
                            <span className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                              <Icon name="Tag" size={10} />
                              {shift?.label}
                              <button
                                type="button"
                                onClick={() => updateShift(day?.key, idx, 'label', '')}
                                className="hover:text-destructive ml-0.5"
                              >
                                <Icon name="X" size={9} />
                              </button>
                            </span>
                          ) : !isPanelOpen && (
                            <button
                              type="button"
                              onClick={() => openLabelPanel(labelKey)}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Icon name="Tag" size={11} />
                              Agregar etiqueta al turno
                            </button>
                          )}

                          {idx > 0 && (
                            <button onClick={() => removeShift(day?.key, idx)}
                              className="p-1 text-muted-foreground hover:text-destructive transition-colors ml-auto">
                              <Icon name="X" size={14} />
                            </button>
                          )}
                        </div>

                        {/* Label panel — only shown when user clicked "Agregar etiqueta" */}
                        {isPanelOpen && !shift?.label && (
                          <div className="ml-2 p-3 bg-muted/30 border border-border/60 rounded-xl space-y-2">
                            <p className="text-xs font-medium text-foreground">Selecciona o crea una etiqueta:</p>
                            {!isCustomMode ? (
                              <div className="flex flex-wrap gap-1.5">
                                {SHIFT_PRESETS?.map(preset => (
                                  <button
                                    key={preset}
                                    type="button"
                                    onClick={() => applyLabel(day?.key, idx, preset)}
                                    className="text-xs px-2.5 py-1 border border-border rounded-full bg-background hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-colors text-foreground"
                                  >
                                    {preset}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => setCustomLabelInput(labelKey, '')}
                                  className="text-xs px-2.5 py-1 border border-dashed border-primary/50 rounded-full bg-background hover:bg-primary/5 text-primary transition-colors flex items-center gap-1"
                                >
                                  <Icon name="Plus" size={9} /> Personalizada
                                </button>
                                <button
                                  type="button"
                                  onClick={() => closeLabelPanel(labelKey)}
                                  className="text-xs px-2.5 py-1 border border-border rounded-full bg-background hover:bg-muted text-muted-foreground transition-colors"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  autoFocus
                                  value={customLabelInputs?.[labelKey] || ''}
                                  onChange={e => setCustomLabelInput(labelKey, e?.target?.value)}
                                  onKeyDown={e => {
                                    if (e?.key === 'Enter' && customLabelInputs?.[labelKey]?.trim()) {
                                      applyLabel(day?.key, idx, customLabelInputs?.[labelKey]?.trim());
                                    }
                                    if (e?.key === 'Escape') closeLabelPanel(labelKey);
                                  }}
                                  placeholder="Ej: Turno especial..."
                                  className="flex-1 px-2.5 py-1.5 border border-primary/40 rounded-lg bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (customLabelInputs?.[labelKey]?.trim()) {
                                      applyLabel(day?.key, idx, customLabelInputs?.[labelKey]?.trim());
                                    }
                                  }}
                                  className="p-1.5 text-primary hover:text-primary/80 disabled:opacity-40"
                                  disabled={!customLabelInputs?.[labelKey]?.trim()}
                                >
                                  <Icon name="Check" size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => closeLabelPanel(labelKey)}
                                  className="p-1.5 text-muted-foreground hover:text-foreground"
                                >
                                  <Icon name="X" size={14} />
                                </button>
                              </div>
                            )}
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
      </div>

      {/* Horarios especiales */}
      <div>
        <button onClick={() => setShowSpecial(!showSpecial)}
          className="flex items-center gap-2 text-sm font-semibold text-foreground w-full">
          <div className="w-1 h-5 bg-primary rounded-full" />
          Horarios especiales
          <Icon name={showSpecial ? 'ChevronUp' : 'ChevronDown'} size={16} className="ml-auto" />
        </button>
        {showSpecial && (
          <div className="mt-4 space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-700 mb-2">Festivos mexicanos sugeridos:</p>
              <div className="flex flex-wrap gap-2">
                {MEXICAN_HOLIDAYS?.map(h => (
                  <button key={h?.date} onClick={() => addSpecialHour(h?.date, h?.name)}
                    className="text-xs px-2 py-1 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-blue-700">
                    + {h?.name}
                  </button>
                ))}
              </div>
            </div>

            {specialHours?.map((sh, idx) => (
              <div key={idx} className="border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-2 gap-3 flex-1 mr-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Fecha</label>
                      <input type="date" value={sh?.date} onChange={e => updateSpecial(idx, 'date', e?.target?.value)}
                        className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-xs focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Motivo</label>
                      <input type="text" maxLength={80} value={sh?.name} onChange={e => updateSpecial(idx, 'name', e?.target?.value)}
                        placeholder="Ej: Día de las Madres"
                        className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-xs focus:outline-none" />
                    </div>
                  </div>
                  <button onClick={() => removeSpecialHour(idx)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                    <Icon name="Trash2" size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                    <input type="checkbox" checked={sh?.closed} onChange={e => updateSpecial(idx, 'closed', e?.target?.checked)}
                      className="w-3 h-3 rounded" />
                    Cerrado ese día
                  </label>
                  {!sh?.closed && (
                    <div className="flex items-center gap-2">
                      <select value={sh?.shifts?.[0]?.open || '09:00'} onChange={e => updateSpecial(idx, 'shifts', [{ open: e?.target?.value, close: sh?.shifts?.[0]?.close || '22:00' }])}
                        className="px-2 py-1 border border-border rounded-lg bg-background text-foreground text-xs focus:outline-none">
                        {timeOptions?.map(t => <option key={t?.value} value={t?.value}>{t?.label}</option>)}
                      </select>
                      <span className="text-xs text-muted-foreground">a</span>
                      <select value={sh?.shifts?.[0]?.close || '22:00'} onChange={e => updateSpecial(idx, 'shifts', [{ open: sh?.shifts?.[0]?.open || '09:00', close: e?.target?.value }])}
                        className="px-2 py-1 border border-border rounded-lg bg-background text-foreground text-xs focus:outline-none">
                        {timeOptions?.map(t => <option key={t?.value} value={t?.value}>{t?.label}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button onClick={() => addSpecialHour()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors">
              <Icon name="Plus" size={16} /> Agregar horario especial
            </button>
          </div>
        )}
      </div>

      {/* Cierre temporal */}
      <div className="border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-amber-500 rounded-full" />
            <h3 className="text-base font-semibold text-foreground">Cierre temporal</h3>
          </div>
          <Toggle
            checked={tempClosed}
            onChange={() => onChange('temporarilyClosed', !tempClosed)}
            colorClass="bg-amber-500"
            ringClass="focus:ring-amber-300"
            label="Activar cierre temporal"
          />
        </div>
        {tempClosed && (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
              <Icon name="AlertTriangle" size={14} className="inline mr-1" />
              Tu ficha seguirá visible pero mostrará un banner "Temporalmente cerrado". Los usuarios que te tienen como favorito recibirán notificación cuando reactives.
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Nota para los clientes <span className="text-muted-foreground">(máx. 200 caracteres)</span></label>
              <div className="relative">
                <textarea maxLength={200} rows={2} value={tempNote} onChange={e => onChange('tempClosedNote', e?.target?.value)}
                  placeholder='Ej: Cerrado por remodelación, regresamos el 15 de abril'
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                <span className="absolute right-3 bottom-2 text-xs text-muted-foreground">{tempNote?.length}/200</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tiempo de espera y afluencia */}
      <div className={`border rounded-xl p-4 transition-all ${showLiveStats ? 'border-blue-300 bg-blue-50/50' : 'border-border bg-card'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${showLiveStats ? 'bg-blue-600' : 'bg-muted'}`}>
              <Icon name="Activity" size={18} className={showLiveStats ? 'text-white' : 'text-muted-foreground'} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold leading-tight ${showLiveStats ? 'text-blue-800' : 'text-foreground'}`}>
                Mostrar tiempo de espera y afluencia en tiempo real
              </p>
              <p className={`text-xs mt-0.5 ${showLiveStats ? 'text-blue-600' : 'text-muted-foreground'}`}>
                Se calculan automáticamente a partir de los check-ins registrados.
              </p>
            </div>
          </div>
          <Toggle
            checked={showLiveStats}
            onChange={() => onChange('showLiveStats', !showLiveStats)}
            colorClass="bg-blue-600"
            ringClass="focus:ring-blue-300"
            label="Mostrar estadísticas en vivo"
          />
        </div>
        {showLiveStats && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2.5 bg-white border border-blue-200 rounded-xl">
              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="Clock" size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-800">Tiempo de espera</p>
                <p className="text-xs text-blue-600">Actualización automática</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-white border border-blue-200 rounded-xl">
              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="Users" size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-800">Afluencia en vivo</p>
                <p className="text-xs text-blue-600">Basado en check-ins</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperatingHoursForm;