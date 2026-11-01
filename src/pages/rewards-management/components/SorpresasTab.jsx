import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { fetchSurpriseConfig, upsertSurpriseConfig, POINTS_RULES, pointsToMXN } from '../../../services/rewardsService';
import MechanicsSelector from '../../surprises-management/components/MechanicsSelector';
import ExtendedTriggersSection from '../../surprises-management/components/ExtendedTriggersSection';

const PRIZE_COLORS = ['#3B82F6', '#1D4ED8', '#059669', '#D97706', '#FFD700', '#DC2626'];

const defaultPrizes = [
  { id: 1, name: `5 puntos extra (= $${pointsToMXN(5)} MXN)`, type: 'points', value: '5 pts', probability: 40, color: '#3B82F6' },
  { id: 2, name: `10 puntos extra (= $${pointsToMXN(10)} MXN)`, type: 'points', value: '10 pts', probability: 25, color: '#1D4ED8' },
  { id: 3, name: '15% de descuento', type: 'coupon', value: '15%', probability: 20, color: '#059669' },
  { id: 4, name: 'Galleta gratis', type: 'product', value: '1 galleta', probability: 10, color: '#D97706' },
  { id: 5, name: 'Café gratis', type: 'product', value: '1 café', probability: 4, color: '#FFD700' },
  { id: 6, name: '30% de descuento', type: 'coupon', value: '30%', probability: 1, color: '#DC2626' },
];

const defaultGeneralConfig = {
  moduleActive: true,
  distributionMode: 'probabilistic',
  pendingExpirationDays: 7,
  pendingExpirationNotify: true,
  pendingNotifyDaysBefore: 1,
  doubleSurpriseSeasons: [],
  celebrationOpeningMsg: '¡Prepárate para tu sorpresa!',
  celebrationWinMsg: '¡Felicidades, ganaste {premio}!',
  celebrationConsolationMsg: '¡Sigues ganando! Tus {puntos} puntos ya están en tu cuenta.',
  celebrationBgImage: null,
  almostEffectEnabled: false,
};

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-primary' : 'bg-muted'}`}
  >
    <div className={`w-4 h-4 bg-white rounded-full shadow mt-0.5 transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
  </button>
);

// ─── HISTORY TABLE ────────────────────────────────────────────────────────────
const MOCK_HISTORY = [
  { id: 1, date: '2026-06-02 14:32', client: 'Ana García', trigger: 'Al hacer check-in', mechanic: 'Ruleta', prize: '10 puntos extra', redeemed: true },
  { id: 2, date: '2026-06-02 11:15', client: 'Carlos López', trigger: 'Al subir de nivel VIP', mechanic: 'Cofre Misterioso', prize: 'Café gratis', redeemed: false },
  { id: 3, date: '2026-06-01 18:45', client: 'María Torres', trigger: 'Aniversario como cliente', mechanic: 'Sobre Sorpresa', prize: '30% de descuento', redeemed: true },
  { id: 4, date: '2026-06-01 10:20', client: 'Luis Martínez', trigger: 'Al hacer check-in', mechanic: 'Ruleta', prize: '5 puntos extra', redeemed: true },
  { id: 5, date: '2026-05-31 16:00', client: 'Sofía Ramírez', trigger: 'Al completar punch card', mechanic: 'Raspa y Gana', prize: 'Galleta gratis', redeemed: false },
];

const SurprisesHistoryPanel = () => {
  const [filterTrigger, setFilterTrigger] = useState('');
  const [filterRedeemed, setFilterRedeemed] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = MOCK_HISTORY?.filter(row => {
    if (filterTrigger && !row?.trigger?.toLowerCase()?.includes(filterTrigger?.toLowerCase())) return false;
    if (filterRedeemed === 'yes' && !row?.redeemed) return false;
    if (filterRedeemed === 'no' && row?.redeemed) return false;
    return true;
  });

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500/10 rounded-xl flex items-center justify-center">
            <Icon name="History" size={18} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Historial de activaciones</h3>
            <p className="text-xs text-muted-foreground">Todos los juegos ejecutados en el módulo</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-xs text-muted-foreground transition-colors">
          <Icon name="Download" size={12} />
          Exportar Excel
        </button>
      </div>
      {/* Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <input
          type="text"
          placeholder="Filtrar por trigger…"
          value={filterTrigger}
          onChange={e => setFilterTrigger(e?.target?.value)}
          className="px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none"
        />
        <select
          value={filterRedeemed}
          onChange={e => setFilterRedeemed(e?.target?.value)}
          className="px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none"
        >
          <option value="all">Todos los estados</option>
          <option value="yes">Canjeados</option>
          <option value="no">Sin canjear</option>
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e?.target?.value)} className="px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e?.target?.value)} className="px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none" />
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-3 font-medium text-muted-foreground">Fecha/Hora</th>
              <th className="text-left py-2 pr-3 font-medium text-muted-foreground">Cliente</th>
              <th className="text-left py-2 pr-3 font-medium text-muted-foreground">Trigger</th>
              <th className="text-left py-2 pr-3 font-medium text-muted-foreground">Mecánica</th>
              <th className="text-left py-2 pr-3 font-medium text-muted-foreground">Premio</th>
              <th className="text-center py-2 font-medium text-muted-foreground">Canjeado</th>
            </tr>
          </thead>
          <tbody>
            {filtered?.map(row => (
              <tr key={row?.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                <td className="py-2 pr-3 text-muted-foreground whitespace-nowrap">{row?.date}</td>
                <td className="py-2 pr-3 font-medium text-foreground">{row?.client}</td>
                <td className="py-2 pr-3 text-muted-foreground">{row?.trigger}</td>
                <td className="py-2 pr-3 text-muted-foreground">{row?.mechanic}</td>
                <td className="py-2 pr-3 text-foreground">{row?.prize}</td>
                <td className="py-2 text-center">
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${row?.redeemed ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                    {row?.redeemed ? '✓ Sí' : 'No'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered?.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-xs">No hay activaciones que coincidan con los filtros.</div>
        )}
      </div>
    </div>
  );
};

// ─── GENERAL CONFIG SECTION ───────────────────────────────────────────────────
const GeneralConfigSection = ({ config, onChange }) => {
  const c = config || defaultGeneralConfig;
  const [showSeasonForm, setShowSeasonForm] = useState(false);
  const [newSeason, setNewSeason] = useState({ name: '', startDate: '', endDate: '', triggers: [] });

  const addSeason = () => {
    if (!newSeason?.name || !newSeason?.startDate || !newSeason?.endDate) return;
    const updated = [...(c?.doubleSurpriseSeasons || []), { ...newSeason, id: Date.now() }];
    onChange({ ...c, doubleSurpriseSeasons: updated });
    setNewSeason({ name: '', startDate: '', endDate: '', triggers: [] });
    setShowSeasonForm(false);
  };

  const removeSeason = (id) => {
    onChange({ ...c, doubleSurpriseSeasons: (c?.doubleSurpriseSeasons || [])?.filter(s => s?.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
          <Icon name="Settings" size={18} className="text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">⚙️ Configuración General del Módulo</h3>
          <p className="text-xs text-muted-foreground">Ajustes globales que aplican a todo el módulo de Sorpresas</p>
        </div>
      </div>
      {/* ── 1. MASTER TOGGLE ──────────────────────────────────────────── */}
      <div className={`border-2 rounded-2xl p-4 transition-all ${c?.moduleActive ? 'border-green-500 bg-green-500/5' : 'border-destructive bg-destructive/5'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{c?.moduleActive ? '✅' : '⏸️'}</span>
            <div>
              <p className="font-semibold text-foreground">Sorpresas activas: {c?.moduleActive ? 'SÍ' : 'NO'}</p>
              <p className="text-xs text-muted-foreground">
                {c?.moduleActive
                  ? 'Todos los triggers están activos. Desactiva para pausar sin perder configuración.'
                  : 'Todos los triggers están pausados. La configuración se conserva intacta.'}
              </p>
            </div>
          </div>
          <Toggle checked={c?.moduleActive !== false} onChange={v => onChange({ ...c, moduleActive: v })} />
        </div>
        {!c?.moduleActive && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-700">⚠️ El módulo está pausado. Ningún trigger se activará aunque el usuario califique. Útil para vacaciones o reconfiguración.</p>
          </div>
        )}
      </div>
      {/* ── 2. DISTRIBUTION MODE ──────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
          <Icon name="Shuffle" size={16} className="text-blue-600" />
          Modo de distribución del pool
        </h4>
        <p className="text-xs text-muted-foreground mb-3">Define cómo se aplican las probabilidades configuradas en el pool.</p>
        <div className="space-y-2">
          {[
            {
              value: 'probabilistic',
              label: 'Probabilístico',
              desc: 'Cada juego es independiente. Un usuario puede ganar el gran premio varias veces seguidas por azar. Distribución natural.',
              icon: '🎲',
            },
            {
              value: 'guaranteed',
              label: 'Garantizado',
              desc: 'El sistema asegura que la distribución real coincida exactamente con las probabilidades. Si el gran premio es 1%, exactamente 1 de cada 100 juegos lo dará. Previene rachas de "buena suerte".',
              icon: '📊',
            },
          ]?.map(opt => (
            <label
              key={opt?.value}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${c?.distributionMode === opt?.value ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'}`}
            >
              <input
                type="radio"
                name="distributionMode"
                value={opt?.value}
                checked={c?.distributionMode === opt?.value}
                onChange={() => onChange({ ...c, distributionMode: opt?.value })}
                className="mt-0.5 flex-shrink-0"
              />
              <div>
                <p className="text-sm font-medium text-foreground">{opt?.icon} {opt?.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt?.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
      {/* ── 3. PENDING EXPIRATION ─────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
          <Icon name="Clock" size={16} className="text-orange-600" />
          Expiración de sorpresas pendientes
        </h4>
        <p className="text-xs text-muted-foreground">Cuando un trigger se activa pero el usuario no abre la app, ¿cuánto tiempo permanece pendiente?</p>
        <div className="flex items-center gap-3">
          <input
            type="number" min="1" max="30"
            value={c?.pendingExpirationDays || 7}
            onChange={e => onChange({ ...c, pendingExpirationDays: parseInt(e?.target?.value) })}
            className="w-20 px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm focus:outline-none"
          />
          <span className="text-sm text-muted-foreground">días antes de expirar</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
          <div>
            <p className="text-xs font-medium text-foreground">Notificar al usuario antes de que expire</p>
            <p className="text-xs text-muted-foreground">Push: "¡Tienes una sorpresa esperándote! Vence en X días."</p>
          </div>
          <Toggle
            checked={c?.pendingExpirationNotify !== false}
            onChange={v => onChange({ ...c, pendingExpirationNotify: v })}
          />
        </div>

        {c?.pendingExpirationNotify !== false && (
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Notificar con [N] días de anticipación</label>
            <select
              value={c?.pendingNotifyDaysBefore || 1}
              onChange={e => onChange({ ...c, pendingNotifyDaysBefore: parseInt(e?.target?.value) })}
              className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm focus:outline-none"
            >
              <option value={1}>1 día antes</option>
              <option value={3}>3 días antes</option>
              <option value={5}>5 días antes</option>
            </select>
          </div>
        )}
      </div>
      {/* ── 4. DOUBLE SURPRISE SEASONS ────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
          <Icon name="Sparkles" size={16} className="text-yellow-500" />
          Temporadas de doble sorpresa
        </h4>
        <p className="text-xs text-muted-foreground">Durante estas temporadas, todos los triggers seleccionados dan 2 oportunidades de juego en lugar de 1.</p>

        {(c?.doubleSurpriseSeasons || [])?.length > 0 && (
          <div className="space-y-2">
            {(c?.doubleSurpriseSeasons || [])?.map(season => (
              <div key={season?.id} className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <span className="text-lg">🎉</span>
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">{season?.name}</p>
                  <p className="text-xs text-muted-foreground">{season?.startDate} → {season?.endDate}</p>
                </div>
                <button onClick={() => removeSeason(season?.id)} className="p-1 hover:bg-destructive/10 rounded">
                  <Icon name="X" size={12} className="text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}

        {showSeasonForm ? (
          <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-3">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Nombre de la temporada</label>
              <input
                type="text"
                placeholder="Ej: Semana de Aniversario del Café Roma"
                value={newSeason?.name}
                onChange={e => setNewSeason(p => ({ ...p, name: e?.target?.value }))}
                className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Fecha inicio</label>
                <input type="date" value={newSeason?.startDate} onChange={e => setNewSeason(p => ({ ...p, startDate: e?.target?.value }))} className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Fecha fin</label>
                <input type="date" value={newSeason?.endDate} onChange={e => setNewSeason(p => ({ ...p, endDate: e?.target?.value }))} className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={addSeason} className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90">Agregar temporada</button>
              <button onClick={() => setShowSeasonForm(false)} className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs hover:bg-muted/80">Cancelar</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowSeasonForm(true)}
            className="w-full py-2 border-2 border-dashed border-border rounded-xl text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="Plus" size={12} />
            + Nueva temporada de doble sorpresa
          </button>
        )}
      </div>
      {/* ── 5. CELEBRATION SCREEN ─────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
          <Icon name="PartyPopper" size={16} className="text-pink-600" />
          Pantalla de celebración
        </h4>
        <p className="text-xs text-muted-foreground">Personaliza los mensajes y el fondo de la pantalla donde se revela el premio.</p>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Mensaje de apertura <span className="text-muted-foreground font-normal">(antes de revelar · max 60 chars)</span>
            </label>
            <input
              type="text"
              maxLength={60}
              value={c?.celebrationOpeningMsg || '¡Prepárate para tu sorpresa!'}
              onChange={e => onChange({ ...c, celebrationOpeningMsg: e?.target?.value })}
              className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm focus:outline-none"
            />
            <p className="text-xs text-muted-foreground mt-1">Variable disponible: {'{nombre_cliente}'}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Mensaje de premio ganado
            </label>
            <input
              type="text"
              maxLength={80}
              value={c?.celebrationWinMsg || '¡Felicidades, ganaste {premio}!'}
              onChange={e => onChange({ ...c, celebrationWinMsg: e?.target?.value })}
              className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm focus:outline-none"
            />
            <p className="text-xs text-muted-foreground mt-1">Variables: {'{premio}'}, {'{nombre_cliente}'}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Mensaje de premio consolación <span className="text-muted-foreground font-normal">(premios menores del pool)</span>
            </label>
            <input
              type="text"
              maxLength={100}
              value={c?.celebrationConsolationMsg || '¡Sigues ganando! Tus {puntos} puntos ya están en tu cuenta.'}
              onChange={e => onChange({ ...c, celebrationConsolationMsg: e?.target?.value })}
              className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm focus:outline-none"
            />
            <p className="text-xs text-muted-foreground mt-1">Variables: {'{puntos}'}, {'{premio}'}, {'{nombre_cliente}'}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Imagen de fondo de la pantalla de celebración
            </label>
            <div className="flex items-center gap-3">
              {c?.celebrationBgImage ? (
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg flex-1">
                  <Icon name="Image" size={14} className="text-primary" />
                  <span className="text-xs text-foreground flex-1 truncate">Imagen configurada</span>
                  <button onClick={() => onChange({ ...c, celebrationBgImage: null })} className="p-1 hover:bg-destructive/10 rounded">
                    <Icon name="X" size={12} className="text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <label className="flex-1 flex items-center gap-2 px-3 py-2 border-2 border-dashed border-border rounded-xl text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer">
                  <Icon name="Upload" size={12} />
                  Subir imagen de fondo (JPG/PNG)
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    if (e?.target?.files?.[0]) onChange({ ...c, celebrationBgImage: e?.target?.files?.[0]?.name });
                  }} />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Se mostrará con overlay semi-transparente al revelar el premio.</p>
          </div>
        </div>
      </div>
      {/* ── 6. ALMOST EFFECT ──────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎯</span>
            <div>
              <p className="font-semibold text-foreground text-sm">Efecto "casi" en mecánicas</p>
              <p className="text-xs text-muted-foreground">Muestra brevemente el gran premio antes de revelar el premio real (solo en mecánicas donde aplica).</p>
            </div>
          </div>
          <Toggle
            checked={c?.almostEffectEnabled || false}
            onChange={v => onChange({ ...c, almostEffectEnabled: v })}
          />
        </div>
        {c?.almostEffectEnabled && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-700">
              ⚠️ <strong>Activado conscientemente.</strong> La animación de "casi" muestra brevemente el gran premio antes de revelar el real. Es el mismo principio psicológico de las máquinas reales. Úsalo con sutileza para no generar frustración.
            </p>
          </div>
        )}
        {!c?.almostEffectEnabled && (
          <p className="text-xs text-muted-foreground">Default: desactivado. El negocio lo activa conscientemente.</p>
        )}
      </div>
    </div>
  );
};

// ─── WHEEL PREVIEW ────────────────────────────────────────────────────────────
const WheelPreview = ({ prizes }) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState(null);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setWinner(null);
    const newRotation = rotation + 1440 + Math.random() * 360;
    setRotation(newRotation);
    setTimeout(() => {
      setSpinning(false);
      const rand = Math.random() * 100;
      let cumulative = 0;
      for (const prize of prizes) {
        cumulative += prize?.probability;
        if (rand <= cumulative) { setWinner(prize); break; }
      }
    }, 3000);
  };

  const total = prizes?.reduce((s, p) => s + p?.probability, 0);
  let currentAngle = 0;
  const segments = prizes?.map(p => {
    const angle = (p?.probability / total) * 360;
    const start = currentAngle;
    currentAngle += angle;
    return { ...p, startAngle: start, angle };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div
          className="w-48 h-48 rounded-full border-4 border-foreground shadow-xl transition-transform"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: spinning ? '3s' : '0s',
            transitionTimingFunction: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)',
            background: `conic-gradient(${segments?.map(s => `${s?.color} ${s?.startAngle}deg ${s?.startAngle + s?.angle}deg`)?.join(', ')})`
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-card border-2 border-foreground rounded-full flex items-center justify-center shadow-lg z-10">
          <span className="text-lg">🎯</span>
        </div>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">▼</div>
      </div>
      <button onClick={spin} disabled={spinning} className="px-6 py-2 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors">
        {spinning ? '¡Girando!' : '¡Gira!'}
      </button>
      {winner && (
        <div className="text-center p-3 bg-success/10 border border-success/20 rounded-xl">
          <p className="text-sm font-bold text-success">🏆 ¡Ganaste!</p>
          <p className="text-foreground font-semibold">{winner?.name}</p>
          {winner?.type === 'points' && (
            <p className="text-xs text-muted-foreground mt-1">{parseInt(winner?.value)} pts = ${pointsToMXN(parseInt(winner?.value))} MXN</p>
          )}
        </div>
      )}
    </div>
  );
};

const MECHANIC_PREVIEWS = {
  wheel: (prizes) => <WheelPreview prizes={prizes} />,
  scratch: () => (
    <div className="text-center">
      <div className="w-48 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-xl cursor-pointer hover:opacity-90 transition-opacity">
        <div className="text-center"><p className="text-3xl">🎫</p><p className="text-sm mt-1">Raspa aquí</p></div>
      </div>
      <p className="text-xs text-muted-foreground mt-3">El usuario raspa con el dedo para revelar el premio</p>
    </div>
  ),
  chest: () => (
    <div className="text-center">
      <div className="flex gap-4 justify-center">
        {['📦', '📦', '📦']?.map((c, i) => (
          <button key={i} className="w-16 h-16 bg-amber-100 border-2 border-amber-400 rounded-xl text-3xl hover:scale-110 transition-transform shadow-lg">{c}</button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3">El usuario elige un cofre para revelar su premio</p>
    </div>
  ),
  envelope: () => (
    <div className="text-center">
      <div className="w-32 h-24 bg-blue-100 border-2 border-blue-400 rounded-xl flex items-center justify-center text-5xl cursor-pointer hover:scale-105 transition-transform shadow-lg">✉️</div>
      <p className="text-xs text-muted-foreground mt-3">El usuario toca el sobre para abrirlo</p>
    </div>
  ),
  dice: () => (
    <div className="text-center">
      <div className="flex gap-4 justify-center">
        <div className="w-16 h-16 bg-white border-2 border-gray-300 rounded-xl flex items-center justify-center text-3xl shadow-lg">🎲</div>
      </div>
      <p className="text-xs text-muted-foreground mt-3">El usuario lanza los dados para revelar su premio</p>
    </div>
  ),
  balloon: () => (
    <div className="text-center">
      <div className="w-24 h-32 bg-gradient-to-b from-red-400 to-red-600 rounded-full flex items-center justify-center text-4xl shadow-lg cursor-pointer hover:scale-105 transition-transform">🎈</div>
      <p className="text-xs text-muted-foreground mt-3">El usuario infla el globo tocando la pantalla</p>
    </div>
  ),
  loteria: () => (
    <div className="text-center">
      <div className="grid grid-cols-4 gap-1 w-40 mx-auto">
        {['☕', '⭐', '📍', '💰', '🎵', '🌮', '🔑', '❤️', '🗺️', '⚡', '🏆', '📱', '🌟', '🏠', '👨‍🍳', '😊']?.map((icon, i) => (
          <div key={i} className="w-9 h-9 bg-amber-50 border border-amber-300 rounded flex items-center justify-center text-sm">{icon}</div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3">Cartón de Lotería 4×4 con íconos del negocio</p>
    </div>
  ),
  fishing: () => (
    <div className="text-center">
      <div className="w-48 h-28 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center text-4xl shadow-lg relative overflow-hidden">
        <span className="relative z-10">🎣</span>
        <div className="absolute bottom-2 left-4 text-lg opacity-60">🐟</div>
        <div className="absolute bottom-4 right-6 text-sm opacity-40">🐠</div>
      </div>
      <p className="text-xs text-muted-foreground mt-3">El usuario lanza el anzuelo al estanque</p>
    </div>
  ),
  gacha: () => (
    <div className="text-center">
      <div className="w-32 h-40 bg-gradient-to-b from-gray-200 to-gray-400 rounded-xl border-2 border-gray-500 flex flex-col items-center justify-center shadow-lg">
        <div className="w-20 h-20 bg-blue-100 border-2 border-blue-300 rounded-full flex items-center justify-center text-3xl mb-2">🎰</div>
        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">↻</div>
      </div>
      <p className="text-xs text-muted-foreground mt-3">El usuario gira la manivela para obtener su cápsula</p>
    </div>
  ),
  tree: () => (
    <div className="text-center">
      <div className="text-6xl mb-2">🌳</div>
      <div className="flex gap-2 justify-center text-2xl">🍎 💰 ⭐</div>
      <p className="text-xs text-muted-foreground mt-3">El usuario sacude el teléfono para hacer caer premios</p>
    </div>
  ),
  vending: () => (
    <div className="text-center">
      <div className="w-32 h-40 bg-gradient-to-b from-blue-100 to-blue-200 border-2 border-blue-400 rounded-xl flex flex-col p-2 shadow-lg">
        <div className="grid grid-cols-3 gap-1 flex-1">
          {['☕', '🧁', '🥤', '🍪', '🥐', '🍵']?.map((item, i) => (
            <div key={i} className="bg-white rounded flex items-center justify-center text-sm border border-blue-200">{item}</div>
          ))}
        </div>
        <div className="mt-1 w-full h-6 bg-blue-300 rounded flex items-center justify-center">
          <span className="text-xs text-blue-800 font-medium">Seleccionar</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3">El usuario presiona el botón para obtener su producto</p>
    </div>
  ),
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const SorpresasTab = ({ businessId }) => {
  const [activeTab, setActiveTab] = useState('config');
  const [selectedMechanic, setSelectedMechanic] = useState('wheel');
  const [mechanicConfig, setMechanicConfig] = useState({});
  const [prizes, setPrizes] = useState(defaultPrizes);
  const [activeTriggers, setActiveTriggers] = useState({
    post_checkin: true, post_coupon: false, punch_complete: true, milestone: false, manual: false
  });
  const [triggerConfigs, setTriggerConfigs] = useState({});
  const [antiSaturation, setAntiSaturation] = useState({
    dailyLimit: 2, weeklyLimit: 5, monthlyLimit: 12,
    cooldownHours: 4, budgetEnabled: false, monthlyBudget: 5000,
    budgetAlertPct: 80, budgetExhaustedAction: 'stop',
    uniqueBypassCooldown: true, gracePeriodEnabled: false, gracePeriodDays: 7,
    vipLimitsEnabled: false, dateExclusionsEnabled: false, exclusionDates: [],
  });
  const [generalConfig, setGeneralConfig] = useState(defaultGeneralConfig);
  const [frequency, setFrequency] = useState('per_visit');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (businessId) loadConfig();
    else setLoading(false);
  }, [businessId]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const config = await fetchSurpriseConfig(businessId);
      if (config) {
        setSelectedMechanic(config?.mechanic || 'wheel');
        if (config?.prizes?.length > 0) setPrizes(config?.prizes);
        if (config?.triggers) setActiveTriggers(config?.triggers);
        if (config?.mechanic_config) setMechanicConfig(config?.mechanic_config);
        if (config?.extended_triggers) setActiveTriggers(prev => ({ ...prev, ...config?.extended_triggers }));
        if (config?.trigger_configs) setTriggerConfigs(config?.trigger_configs);
        if (config?.anti_saturation) setAntiSaturation(prev => ({ ...prev, ...config?.anti_saturation }));
        if (config?.general_config) setGeneralConfig(prev => ({ ...prev, ...config?.general_config }));
        setFrequency(config?.frequency || 'per_visit');
      }
    } catch (err) {
      setError('Error al cargar la configuración de sorpresas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalProbability = prizes?.reduce((s, p) => s + (p?.probability || 0), 0);
  const isValid = Math.abs(totalProbability - 100) < 0.01;

  const updatePrize = (id, field, value) => {
    setPrizes(prev => prev?.map(p => p?.id === id ? { ...p, [field]: value } : p));
  };

  const addPrize = () => {
    if (prizes?.length >= 8) return;
    setPrizes(prev => [...prev, {
      id: Date.now(), name: 'Nuevo premio', type: 'points', value: '5 pts',
      probability: 0, color: PRIZE_COLORS?.[prev?.length % PRIZE_COLORS?.length]
    }]);
  };

  const removePrize = (id) => {
    if (prizes?.length <= 3) return;
    setPrizes(prev => prev?.filter(p => p?.id !== id));
  };

  const handleTriggerToggle = (triggerId, checked) => {
    setActiveTriggers(prev => ({ ...prev, [triggerId]: checked }));
  };

  const handleTriggerConfigChange = (triggerId, cfg) => {
    setTriggerConfigs(prev => ({ ...prev, [triggerId]: cfg }));
  };

  const estimatedCost = Math.round(prizes?.reduce((s, p) => {
    let unitCost = 0;
    if (p?.type === 'points') { const pts = parseInt(p?.value) || 0; unitCost = pts * POINTS_RULES?.POINT_VALUE_MXN; }
    else if (p?.type === 'coupon') { unitCost = 50; }
    else if (p?.type === 'product') { unitCost = 80; }
    else if (p?.type === 'experience') { unitCost = 200; }
    return s + (p?.probability / 100) * unitCost;
  }, 0) * 300);

  const handleSave = async () => {
    if (!businessId || !isValid) return;
    try {
      setSaving(true);
      setError(null);
      await upsertSurpriseConfig(businessId, {
        mechanic: selectedMechanic,
        prizes,
        triggers: activeTriggers,
        mechanic_config: mechanicConfig,
        extended_triggers: activeTriggers,
        trigger_configs: triggerConfigs,
        anti_saturation: antiSaturation,
        general_config: generalConfig,
        frequency,
      });
    } catch (err) {
      setError('Error al guardar la configuración de sorpresas');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Icon name="Loader2" size={32} className="text-primary animate-spin" />
        <span className="ml-3 text-muted-foreground">Cargando configuración de sorpresas...</span>
      </div>
    );
  }

  const previewFn = MECHANIC_PREVIEWS?.[selectedMechanic];

  const TABS = [
    { id: 'config', label: 'Configuración', icon: 'Settings' },
    { id: 'triggers', label: 'Triggers', icon: 'Zap' },
    { id: 'general', label: 'Config. General', icon: 'Sliders' },
    { id: 'history', label: 'Historial', icon: 'History' },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
          <Icon name="AlertCircle" size={16} className="text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
          <button onClick={loadConfig} className="ml-auto text-xs text-destructive underline">Reintentar</button>
        </div>
      )}
      {/* Master toggle banner */}
      {!generalConfig?.moduleActive && (
        <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-xl flex items-center gap-3">
          <span className="text-xl">⏸️</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Módulo de Sorpresas pausado</p>
            <p className="text-xs text-amber-700">Ningún trigger se activará. Ve a "Config. General" para reactivar.</p>
          </div>
          <button onClick={() => setGeneralConfig(p => ({ ...p, moduleActive: true }))} className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600">Reactivar</button>
        </div>
      )}
      {/* Points rule reminder */}
      <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
        <span className="text-lg">📐</span>
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Regla de puntos:</strong> ${POINTS_RULES?.MXN_PER_POINT} MXN = 1 punto · 1 punto = ${POINTS_RULES?.POINT_VALUE_MXN} MXN de descuento para el cliente
        </p>
      </div>
      {/* Tab navigation */}
      <div className="flex gap-1 p-1 bg-muted/30 rounded-xl border border-border overflow-x-auto">
        {TABS?.map(tab => (
          <button
            key={tab?.id}
            onClick={() => setActiveTab(tab?.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === tab?.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={tab?.icon} size={14} />
            {tab?.label}
          </button>
        ))}
      </div>
      {/* ── TAB: CONFIG ──────────────────────────────────────────────── */}
      {activeTab === 'config' && (
        <>
          <MechanicsSelector
            selectedMechanic={selectedMechanic}
            onSelect={setSelectedMechanic}
            mechanicConfig={mechanicConfig}
            onConfigChange={setMechanicConfig}
            prizes={prizes}
          />

          {/* Prize Pool + Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Pool de premios global</h3>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${isValid ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                  <span>Total: {totalProbability?.toFixed(1)}%</span>
                  <span>{isValid ? '✅' : '❌'}</span>
                </div>
              </div>
              <div className="space-y-3">
                {prizes?.map(prize => (
                  <div key={prize?.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: prize?.color }} />
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <input type="text" value={prize?.name} onChange={e => updatePrize(prize?.id, 'name', e?.target?.value)} className="px-2 py-1 border border-border rounded bg-input text-foreground text-xs focus:outline-none" placeholder="Nombre" />
                      <select value={prize?.type} onChange={e => updatePrize(prize?.id, 'type', e?.target?.value)} className="px-2 py-1 border border-border rounded bg-input text-foreground text-xs focus:outline-none">
                        <option value="points">Puntos</option>
                        <option value="coupon">Cupón</option>
                        <option value="product">Producto</option>
                        <option value="experience">Experiencia</option>
                      </select>
                      <div className="flex items-center gap-1">
                        <input type="number" min="0" max="100" step="0.5" value={prize?.probability} onChange={e => updatePrize(prize?.id, 'probability', parseFloat(e?.target?.value) || 0)} className="w-full px-2 py-1 border border-border rounded bg-input text-foreground text-xs focus:outline-none" />
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                    </div>
                    {prize?.type === 'points' && prize?.value && (
                      <span className="text-xs text-primary font-medium whitespace-nowrap">${pointsToMXN(parseInt(prize?.value) || 0)}</span>
                    )}
                    <button onClick={() => removePrize(prize?.id)} className="p-1 hover:bg-destructive/10 rounded transition-colors" disabled={prizes?.length <= 3}>
                      <Icon name="X" size={14} className="text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
              {prizes?.length < 8 && (
                <button onClick={addPrize} className="mt-3 w-full py-2 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
                  <Icon name="Plus" size={14} />
                  Agregar premio
                </button>
              )}
              {!isValid && (
                <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                  <p className="text-xs text-destructive">
                    ⚠️ Las probabilidades deben sumar exactamente 100%. Actualmente suman {totalProbability?.toFixed(1)}%.
                    {totalProbability < 100 ? ` Falta ${(100 - totalProbability)?.toFixed(1)}% por asignar.` : ` Sobran ${(totalProbability - 100)?.toFixed(1)}%.`}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground mb-4">Vista previa</h3>
              <div className="flex flex-col items-center min-h-[200px] justify-center">
                {previewFn ? previewFn(prizes) : (
                  <div className="text-center text-muted-foreground">
                    <Icon name="Eye" size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Selecciona una mecánica para ver la vista previa</p>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Distribución de premios</p>
                <div className="flex rounded-full overflow-hidden h-4">
                  {prizes?.map(p => (
                    <div key={p?.id} style={{ width: `${p?.probability}%`, background: p?.color }} title={`${p?.name}: ${p?.probability}%`} />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {prizes?.map(p => (
                    <div key={p?.id} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ background: p?.color }} />
                      <span className="text-xs text-muted-foreground">{p?.name} ({p?.probability}%)</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 p-3 bg-muted/30 rounded-xl">
                <p className="text-xs text-muted-foreground">
                  💡 Costo mensual estimado: <strong>${estimatedCost?.toLocaleString()} MXN</strong> (~300 activaciones)
                  <br /><span className="text-primary">1 punto = ${POINTS_RULES?.POINT_VALUE_MXN} MXN</span>
                </p>
              </div>
            </div>
          </div>

          {/* Frequency */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
              <Icon name="RefreshCw" size={16} className="text-orange-600" />
              Frecuencia máxima por cliente
            </h4>
            <p className="text-xs text-muted-foreground mb-3">¿Con qué frecuencia puede un mismo cliente activar el juego?</p>
            <select value={frequency} onChange={e => setFrequency(e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm focus:outline-none">
              <option value="per_visit">1 vez por visita (recomendado)</option>
              <option value="per_day">1 vez por día</option>
              <option value="per_week">1 vez por semana</option>
              <option value="unlimited">Ilimitado — cada trigger da una oportunidad</option>
            </select>
          </div>
        </>
      )}
      {/* ── TAB: TRIGGERS ────────────────────────────────────────────── */}
      {activeTab === 'triggers' && (
        <ExtendedTriggersSection
          activeTriggers={activeTriggers}
          onToggle={handleTriggerToggle}
          triggerConfigs={triggerConfigs}
          onConfigChange={handleTriggerConfigChange}
          antiSaturation={antiSaturation}
          onAntiSaturationChange={setAntiSaturation}
        />
      )}
      {/* ── TAB: GENERAL CONFIG ──────────────────────────────────────── */}
      {activeTab === 'general' && (
        <GeneralConfigSection config={generalConfig} onChange={setGeneralConfig} />
      )}
      {/* ── TAB: HISTORY ─────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <SurprisesHistoryPanel />
      )}
      {/* Save button (not shown on history tab) */}
      {activeTab !== 'history' && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!isValid || saving}>
            {saving ? (
              <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Guardando...</>
            ) : (
              <><Icon name="Save" size={16} className="mr-2" />Guardar configuración de sorpresas</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SorpresasTab;
