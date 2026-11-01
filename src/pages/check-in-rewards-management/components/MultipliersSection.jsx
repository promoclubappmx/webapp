import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, Zap } from 'lucide-react';

const MultipliersSection = ({ multipliers, toggleMultiplier, removeMultiplier, showAddMultiplier, setShowAddMultiplier, newMultiplier, setNewMultiplier, addMultiplier, basePoints, getPreviewPoints }) => {
  const [isOpen, setIsOpen] = useState(false);

  const typeLabels = { day: 'Día de la semana', time: 'Horario', event: 'Evento especial' };
  const dayOptions = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const getMultiplierColor = (value) => {
    if (value >= 3) return 'text-red-600 bg-red-50';
    if (value >= 2) return 'text-amber-600 bg-amber-50';
    return 'text-green-600 bg-green-50';
  };

  const totalMultiplier = multipliers?.filter(m => m?.active)?.reduce((acc, m) => acc * m?.multiplier, 1);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-amber-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">Multiplicadores</h3>
            <p className="text-xs text-muted-foreground">{multipliers?.filter(m => m?.active)?.length} activos · Multiplicador total: ×{totalMultiplier?.toFixed(1)}</p>
          </div>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
      </button>
      {isOpen && (
        <div className="px-5 pb-5 border-t border-border">
          <p className="text-xs text-muted-foreground mt-3 mb-4">
            Los multiplicadores se aplican acumulativamente. Si tienes ×2 los martes y ×1.5 en happy hour, un check-in el martes a las 3PM da ×3 total.
          </p>

          {/* Preview */}
          {multipliers?.some(m => m?.active) && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-xs text-amber-800">
                Con todos los multiplicadores activos, un check-in puede dar hasta{' '}
                <span className="font-bold text-amber-900">{getPreviewPoints()} puntos</span>{' '}
                en lugar de {basePoints}.
              </p>
            </div>
          )}

          {/* Multipliers list */}
          <div className="space-y-2 mb-4">
            {multipliers?.map(m => (
              <div key={m?.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border">
                <button
                  onClick={() => toggleMultiplier(m?.id)}
                  className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
                    m?.active ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    m?.active ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground capitalize">{typeLabels?.[m?.type] || m?.type}</span>
                    <span className="text-sm font-medium text-foreground">{m?.condition}</span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-sm font-bold ${getMultiplierColor(m?.multiplier)}`}>
                  ×{m?.multiplier}
                </span>
                <button
                  onClick={() => removeMultiplier(m?.id)}
                  className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Add multiplier form */}
          {showAddMultiplier ? (
            <div className="p-4 bg-muted/30 rounded-xl border border-border space-y-3">
              <p className="text-sm font-medium text-foreground">Nuevo multiplicador</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
                  <select
                    value={newMultiplier?.type}
                    onChange={e => setNewMultiplier(p => ({ ...p, type: e?.target?.value, condition: '' }))}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="day">Día de la semana</option>
                    <option value="time">Horario</option>
                    <option value="event">Evento especial</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Condición</label>
                  {newMultiplier?.type === 'day' ? (
                    <select
                      value={newMultiplier?.condition}
                      onChange={e => setNewMultiplier(p => ({ ...p, condition: e?.target?.value }))}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="">Seleccionar día</option>
                      {dayOptions?.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  ) : (
                    <input
                      value={newMultiplier?.condition}
                      onChange={e => setNewMultiplier(p => ({ ...p, condition: e?.target?.value }))}
                      placeholder={newMultiplier?.type === 'time' ? 'Ej: 14:00-17:00' : 'Ej: Semana aniversario'}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  )}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Multiplicador: ×{newMultiplier?.multiplier}</label>
                  <input
                    type="range"
                    min={1.5}
                    max={5}
                    step={0.5}
                    value={newMultiplier?.multiplier}
                    onChange={e => setNewMultiplier(p => ({ ...p, multiplier: parseFloat(e?.target?.value) }))}
                    className="w-full accent-primary mt-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>×1.5</span><span>×5</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={addMultiplier} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Agregar</button>
                <button onClick={() => setShowAddMultiplier(false)} className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors">Cancelar</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddMultiplier(true)}
              className="flex items-center gap-2 text-sm text-primary hover:underline font-medium"
            >
              <Plus size={14} /> Agregar multiplicador
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MultipliersSection;
