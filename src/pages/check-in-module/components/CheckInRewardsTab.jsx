import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const CheckInRewardsTab = () => {
  const [basePoints, setBasePoints] = useState(10);
  const [differentiateByMethod, setDifferentiateByMethod] = useState(false);
  const [showMethodPoints, setShowMethodPoints] = useState(false);
  const [methodPoints, setMethodPoints] = useState({
    qr: 10, geofence: 5, manual: 5, nfc: 15, beacon: 10,
  });
  const [showMultipliers, setShowMultipliers] = useState(false);
  const [showStreak, setShowStreak] = useState(false);
  const [streakEnabled, setStreakEnabled] = useState(false);
  const [streakBonuses, setStreakBonuses] = useState([
    { visit: 2, bonus: 5 },
    { visit: 3, bonus: 10 },
    { visit: 5, bonus: 25 },
    { visit: 7, bonus: 35 },
    { visit: 10, bonus: 50 },
  ]);
  const [streakWindow, setStreakWindow] = useState(7);
  const [multipliers, setMultipliers] = useState([
    { id: 1, type: 'day', condition: 'Martes', multiplier: 2, active: true },
    { id: 2, type: 'time', condition: '2:00 PM - 5:00 PM', multiplier: 1.5, active: false },
  ]);
  const [showAddMultiplier, setShowAddMultiplier] = useState(false);
  const [newMultiplier, setNewMultiplier] = useState({ type: 'day', condition: '', multiplier: 2 });

  const methodConfig = [
    { id: 'qr', label: 'QR en Mostrador', confidence: 'Alta', badgeColor: 'bg-green-100 text-green-700' },
    { id: 'nfc', label: 'NFC / Tap', confidence: 'Alta', badgeColor: 'bg-green-100 text-green-700' },
    { id: 'beacon', label: 'BLE Beacon', confidence: 'Alta', badgeColor: 'bg-green-100 text-green-700' },
    { id: 'geofence', label: 'Geofence', confidence: 'Media', badgeColor: 'bg-yellow-100 text-yellow-700' },
    { id: 'manual', label: 'Código Manual', confidence: 'Manual', badgeColor: 'bg-gray-100 text-gray-600' },
  ];

  const visitsForReward = Math.ceil(100 / basePoints);

  const handleAddMultiplier = () => {
    if (!newMultiplier?.condition) return;
    setMultipliers(prev => [
      ...prev,
      { id: Date.now(), ...newMultiplier, active: true },
    ]);
    setNewMultiplier({ type: 'day', condition: '', multiplier: 2 });
    setShowAddMultiplier(false);
  };

  const removeMultiplier = (id) => {
    setMultipliers(prev => prev?.filter(m => m?.id !== id));
  };

  const typeLabels = { day: 'Día', time: 'Horario', event: 'Evento' };
  const typeColors = {
    day: 'bg-blue-100 text-blue-700',
    time: 'bg-purple-100 text-purple-700',
    event: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="max-w-3xl space-y-5">
      {/* Base Points */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Puntos base por check-in</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setBasePoints(p => Math.max(1, p - 1))}
              className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors text-lg font-bold"
            >−</button>
            <div className="text-center min-w-[60px]">
              <span className="text-4xl font-bold text-primary">{basePoints}</span>
              <p className="text-xs text-muted-foreground mt-0.5">puntos</p>
            </div>
            <button
              onClick={() => setBasePoints(p => p + 1)}
              className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors text-lg font-bold"
            >+</button>
          </div>
          <div className="flex-1 bg-primary/5 border border-primary/20 rounded-xl p-4">
            <p className="text-sm text-foreground">
              Con <strong>{basePoints} puntos</strong> por check-in, un cliente necesita <strong>{visitsForReward} visitas</strong> para su primera recompensa.
            </p>
            <p className="text-xs text-muted-foreground mt-1">El mes pasado, tu cliente promedio visitó <strong>4.2 veces</strong>.</p>
          </div>
        </div>
      </div>

      {/* Points by Method */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => setShowMethodPoints(!showMethodPoints)}
          className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-foreground">Puntos diferenciados por método</h3>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Avanzado</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => { e?.stopPropagation(); setDifferentiateByMethod(!differentiateByMethod); }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                differentiateByMethod ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                differentiateByMethod ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
            <Icon name={showMethodPoints ? 'ChevronUp' : 'ChevronDown'} size={18} className="text-muted-foreground" />
          </div>
        </button>
        {showMethodPoints && differentiateByMethod && (
          <div className="px-5 pb-5">
            <p className="text-xs text-muted-foreground mb-3">Asigna puntos diferentes según el método de check-in para incentivar los métodos que prefieres.</p>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Método</th>
                  <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Confianza</th>
                  <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Puntos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {methodConfig?.map(m => (
                  <tr key={m?.id}>
                    <td className="py-3 text-sm font-medium text-foreground">{m?.label}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${m?.badgeColor}`}>{m?.confidence}</span>
                    </td>
                    <td className="py-3">
                      <input
                        type="number"
                        min={0}
                        value={methodPoints?.[m?.id]}
                        onChange={e => setMethodPoints(p => ({ ...p, [m?.id]: Number(e?.target?.value) }))}
                        className="w-20 border border-border rounded-lg px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {showMethodPoints && !differentiateByMethod && (
          <div className="px-5 pb-5">
            <p className="text-sm text-muted-foreground">Activa el toggle para configurar puntos diferentes por método.</p>
          </div>
        )}
      </div>

      {/* Multipliers */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => setShowMultipliers(!showMultipliers)}
          className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
        >
          <h3 className="font-semibold text-foreground">Multiplicadores de puntos</h3>
          <div className="flex items-center gap-2">
            {multipliers?.filter(m => m?.active)?.length > 0 && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {multipliers?.filter(m => m?.active)?.length} activo{multipliers?.filter(m => m?.active)?.length !== 1 ? 's' : ''}
              </span>
            )}
            <Icon name={showMultipliers ? 'ChevronUp' : 'ChevronDown'} size={18} className="text-muted-foreground" />
          </div>
        </button>
        {showMultipliers && (
          <div className="px-5 pb-5 space-y-3">
            {multipliers?.map(m => (
              <div key={m?.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-2 flex-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors?.[m?.type] || 'bg-gray-100 text-gray-600'}`}>
                    {typeLabels?.[m?.type] || m?.type}
                  </span>
                  <span className="text-sm font-medium text-foreground">{m?.condition}</span>
                  <span className="text-sm text-primary font-semibold">×{m?.multiplier}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMultipliers(prev => prev?.map(x => x?.id === m?.id ? { ...x, active: !x?.active } : x))}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      m?.active ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      m?.active ? 'translate-x-4' : 'translate-x-0.5'
                    }`} />
                  </button>
                  <button
                    onClick={() => removeMultiplier(m?.id)}
                    className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
              </div>
            ))}

            {showAddMultiplier ? (
              <div className="border border-border rounded-xl p-4 space-y-3 bg-muted/20">
                <h4 className="text-sm font-semibold text-foreground">Nuevo multiplicador</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
                    <select
                      value={newMultiplier?.type}
                      onChange={e => setNewMultiplier(p => ({ ...p, type: e?.target?.value }))}
                      className="w-full border border-border rounded-lg px-2 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="day">Día</option>
                      <option value="time">Horario</option>
                      <option value="event">Evento</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Condición</label>
                    <input
                      type="text"
                      placeholder={newMultiplier?.type === 'day' ? 'Ej: Lunes' : newMultiplier?.type === 'time' ? 'Ej: 3-6 PM' : 'Ej: Semana aniversario'}
                      value={newMultiplier?.condition}
                      onChange={e => setNewMultiplier(p => ({ ...p, condition: e?.target?.value }))}
                      className="w-full border border-border rounded-lg px-2 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Multiplicador</label>
                    <select
                      value={newMultiplier?.multiplier}
                      onChange={e => setNewMultiplier(p => ({ ...p, multiplier: Number(e?.target?.value) }))}
                      className="w-full border border-border rounded-lg px-2 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {[1.5, 2, 2.5, 3, 4, 5]?.map(v => (
                        <option key={v} value={v}>×{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <p className="text-xs text-foreground">
                    Preview: Un check-in con este multiplicador activo dará <strong>{basePoints * newMultiplier?.multiplier} puntos</strong> en lugar de {basePoints}.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddMultiplier}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Agregar
                  </button>
                  <button
                    onClick={() => setShowAddMultiplier(false)}
                    className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddMultiplier(true)}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Icon name="Plus" size={15} />
                Agregar multiplicador
              </button>
            )}
          </div>
        )}
      </div>

      {/* Streak Bonuses */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => setShowStreak(!showStreak)}
          className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
        >
          <h3 className="font-semibold text-foreground">Puntos bonus por racha de visitas</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => { e?.stopPropagation(); setStreakEnabled(!streakEnabled); }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                streakEnabled ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                streakEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
            <Icon name={showStreak ? 'ChevronUp' : 'ChevronDown'} size={18} className="text-muted-foreground" />
          </div>
        </button>
        {showStreak && (
          <div className="px-5 pb-5">
            {!streakEnabled ? (
              <p className="text-sm text-muted-foreground">Activa el toggle para configurar puntos bonus por visitas consecutivas.</p>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">Define cuántos puntos extra recibe el cliente por visitas consecutivas. La racha se rompe si no visita en el tiempo configurado.</p>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Visita consecutiva #</th>
                      <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Bonus extra (puntos)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {streakBonuses?.map((sb, i) => (
                      <tr key={i}>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
                              <Icon name="Flame" size={14} className="text-amber-600" />
                            </div>
                            <span className="text-sm font-medium text-foreground">Visita #{sb?.visit}</span>
                          </div>
                        </td>
                        <td className="py-2.5">
                          <input
                            type="number"
                            min={0}
                            value={sb?.bonus}
                            onChange={e => setStreakBonuses(prev => prev?.map((x, j) => j === i ? { ...x, bonus: Number(e?.target?.value) } : x))}
                            className="w-20 border border-border rounded-lg px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <label className="text-sm text-foreground font-medium">Ventana de racha:</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={streakWindow}
                    onChange={e => setStreakWindow(Number(e?.target?.value))}
                    className="w-16 border border-border rounded-lg px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="text-sm text-muted-foreground">días sin visitar antes de romper la racha</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs text-amber-800">Tu cliente más constante visitó <strong>12 veces en racha</strong> el mes pasado.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Icon name="Save" size={16} />
          Guardar configuración de recompensas
        </button>
      </div>
    </div>
  );
};

export default CheckInRewardsTab;
