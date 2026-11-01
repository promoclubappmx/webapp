import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Flame } from 'lucide-react';

const StreakSection = ({ streakEnabled, setStreakEnabled, streakBonuses, updateStreakBonus, streakWindowDays, setStreakWindowDays }) => {
  const [isOpen, setIsOpen] = useState(false);

  const totalPossibleBonus = streakBonuses?.reduce((sum, s) => sum + s?.bonus, 0);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
            <Flame size={16} className="text-orange-500" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">Puntos bonus por racha</h3>
            <p className="text-xs text-muted-foreground">
              {streakEnabled ? `Activo · Hasta +${totalPossibleBonus} pts bonus en visita 10` : 'Desactivado'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={e => { e?.stopPropagation(); setStreakEnabled(!streakEnabled); }}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              streakEnabled ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              streakEnabled ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
          {isOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </div>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 border-t border-border">
          {!streakEnabled ? (
            <div className="mt-4 text-center py-6">
              <Flame size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Activa los bonuses por racha para incentivar visitas frecuentes</p>
              <button
                onClick={() => setStreakEnabled(true)}
                className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Activar rachas
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mt-3 mb-4">
                Los clientes reciben puntos extra por visitas consecutivas. La racha se rompe si no visitan en el tiempo configurado.
              </p>

              {/* Visual streak progression */}
              <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-2">
                {streakBonuses?.map((s, i) => (
                  <React.Fragment key={i}>
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        i === 0 ? 'bg-orange-100 text-orange-700' :
                        i === 1 ? 'bg-orange-200 text-orange-800' :
                        i === 2 ? 'bg-orange-300 text-orange-900' :
                        i === 3 ? 'bg-orange-400 text-white': 'bg-orange-500 text-white'
                      }`}>
                        {s?.visit}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">+{s?.bonus}</p>
                    </div>
                    {i < streakBonuses?.length - 1 && (
                      <div className="w-6 h-0.5 bg-orange-200 flex-shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Editable table */}
              <div className="bg-muted/30 rounded-xl overflow-hidden mb-4">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Visita consecutiva</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Bonus extra (puntos)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {streakBonuses?.map((s, i) => (
                      <tr key={i} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Flame size={14} className={`${
                              i >= 4 ? 'text-orange-500' : i >= 2 ? 'text-orange-400' : 'text-orange-300'
                            }`} />
                            <span className="text-sm font-medium text-foreground">Visita #{s?.visit}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => updateStreakBonus(i, Math.max(0, s?.bonus - 5))}
                              className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors text-sm"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              value={s?.bonus}
                              onChange={e => updateStreakBonus(i, e?.target?.value)}
                              className="w-16 border border-border rounded-lg px-2 py-1.5 text-sm text-center bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                              min={0}
                            />
                            <button
                              onClick={() => updateStreakBonus(i, s?.bonus + 5)}
                              className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors text-sm"
                            >
                              +
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Streak window */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-foreground">Ventana de racha</label>
                  <p className="text-xs text-muted-foreground mt-0.5">Días sin visitar antes de que la racha se rompa</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStreakWindowDays(p => Math.max(1, p - 1))}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-lg font-bold text-foreground">{streakWindowDays}</span>
                  <button
                    onClick={() => setStreakWindowDays(p => p + 1)}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                  >
                    +
                  </button>
                  <span className="text-sm text-muted-foreground">días</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-orange-50 rounded-xl">
                <p className="text-xs text-orange-800">
                  🔥 Tu cliente más constante visitó <span className="font-bold">12 veces en racha</span> el mes pasado.
                  Con tu configuración actual, habría ganado <span className="font-bold">+{streakBonuses?.reduce((s, b) => s + b?.bonus, 0)} puntos bonus</span> adicionales.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StreakSection;
