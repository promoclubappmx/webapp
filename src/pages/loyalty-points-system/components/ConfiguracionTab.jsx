import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


// ─── GLOBAL CONSTANTS ───────────────────────────────────────────────────────
const PESOS_PER_POINT = 5;   // $5 MXN = 1 punto
const POINT_VALUE_MXN = 0.15; // 1 punto = $0.15 MXN

// ─── SUB-TAB DEFINITIONS ────────────────────────────────────────────────────
const SUB_TABS = [
  { id: 'rules', label: 'Reglas', icon: 'Star' },
  { id: 'expiry', label: 'Vencimiento y ciclo de vida', icon: 'CalendarX' },
  { id: 'methods', label: 'Métodos de acreditación', icon: 'Zap' },
  { id: 'adjustment', label: 'Ajuste manual de saldo', icon: 'Edit' },
  { id: 'control', label: 'Reglas de control y límites', icon: 'Shield' },
];

// ─── TOGGLE COMPONENT ───────────────────────────────────────────────────────
const Toggle = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
      value ? 'bg-primary' : 'bg-muted'
    }`}
  >
    <span
      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
        value ? 'translate-x-6' : 'translate-x-1'
      }`}
      style={{ left: value ? '24px' : '2px', top: '4px', transform: 'none', transition: 'left 0.2s' }}
    />
  </button>
);

// ─── RULE WRAPPER ────────────────────────────────────────────────────────────
const RuleCard = ({ title, icon, description, active, onToggle, children }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      active ? 'border-primary/30 bg-card' : 'border-border bg-muted/20'
    }`}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
            active ? 'bg-primary/10' : 'bg-muted'
          }`}>
            <Icon name={icon} size={18} className={active ? 'text-primary' : 'text-muted-foreground'} />
          </div>
          <div className="min-w-0">
            <p className={`font-semibold text-sm ${
              active ? 'text-foreground' : 'text-muted-foreground'
            }`}>{title}</p>
            <p className="text-xs text-muted-foreground truncate">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
          }`}>
            {active ? 'Activo' : 'Inactivo'}
          </span>
          <Toggle value={active} onChange={onToggle} />
          {active && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Icon name={expanded ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
      {active && expanded && (
        <div className="px-4 pb-4 border-t border-border/50 pt-4">
          {children}
        </div>
      )}
      {active && !expanded && (
        <div className="px-4 pb-3">
          <button
            onClick={() => setExpanded(true)}
            className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
          >
            <Icon name="Settings" size={12} /> Configurar regla
          </button>
        </div>
      )}
    </div>
  );
};

// ─── HEALTH INDICATOR ────────────────────────────────────────────────────────
const HealthIndicator = ({ pointsPerVisit, cheapestReward }) => {
  if (!cheapestReward || cheapestReward <= 0 || !pointsPerVisit || pointsPerVisit <= 0) return null;
  const visitsNeeded = Math.ceil(cheapestReward / pointsPerVisit);
  const costMXN = (cheapestReward * POINT_VALUE_MXN)?.toFixed(2);
  let alertColor = 'bg-emerald-50 border-emerald-200 text-emerald-800';
  let alertMsg = null;
  if (visitsNeeded > 20) {
    alertColor = 'bg-amber-50 border-amber-200 text-amber-800';
    alertMsg = 'Los clientes pueden perder motivación si tardan mucho. Considera bajar el costo de tu recompensa más barata o aumentar los puntos por visita.';
  } else if (visitsNeeded < 3) {
    alertColor = 'bg-orange-50 border-orange-200 text-orange-800';
    alertMsg = 'Los clientes alcanzarán recompensas muy rápido. Asegúrate de que el margen lo permite.';
  }
  return (
    <div className={`mt-4 p-4 rounded-lg border ${alertColor}`}>
      <p className="text-sm font-medium mb-1">📊 Indicador de salud de la regla</p>
      <p className="text-sm">
        Con tu regla actual, un cliente promedio gana <strong>{pointsPerVisit} puntos</strong> por visita.
        Tu recompensa más barata cuesta <strong>{cheapestReward} puntos</strong>, necesita
        <strong> {visitsNeeded} visitas</strong> para canjear. Costo estimado: <strong>${costMXN} MXN</strong>.
      </p>
      {alertMsg && <p className="text-sm mt-2 font-medium">⚠️ {alertMsg}</p>}
    </div>
  );
};

// ─── ACUMULACIÓN POR VISITA ──────────────────────────────────────────────────
const VisitaContent = ({ config, onChange, cheapestReward }) => {
  const pointsPerVisit = config?.pointsPerVisit || 10;
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Otorga una cantidad fija de puntos por cada check-in verificado, sin importar el monto gastado.
      </p>
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-foreground w-40">Puntos por visita:</label>
        <input
          type="number" min="1" value={config?.pointsPerVisit || 10}
          onChange={e => onChange('pointsPerVisit', parseInt(e?.target?.value) || 0)}
          className="w-24 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
        />
      </div>
      <p className="text-xs text-muted-foreground">💡 Para cafeterías, recomendamos 5-10 puntos por visita.</p>
      <HealthIndicator pointsPerVisit={pointsPerVisit} cheapestReward={cheapestReward} />
    </div>
  );
};

// ─── ACUMULACIÓN ADICIONAL POR MONTO GASTADO ─────────────────────────────────
const MontoContent = ({ config, onChange, cheapestReward }) => {
  const pointsPerVisit = Math.floor((config?.amountSpent || 0) / (config?.amountFor || 1)) * (config?.pointsForAmount || 0);
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Otorga puntos proporcionales al monto gastado por el cliente en cada visita.
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-foreground">Otorgar</span>
        <input
          type="number" min="1" value={config?.pointsForAmount || 1}
          onChange={e => onChange('pointsForAmount', parseInt(e?.target?.value) || 1)}
          className="w-20 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
        />
        <span className="text-sm font-medium text-foreground">puntos por cada $</span>
        <input
          type="number" min="1" value={config?.amountFor || 10}
          onChange={e => onChange('amountFor', parseInt(e?.target?.value) || 10)}
          className="w-24 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
        />
        <span className="text-sm font-medium text-foreground">MXN gastados</span>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={config?.roundDown !== false} onChange={e => onChange('roundDown', e?.target?.checked)} className="rounded" />
          <span className="text-foreground">Redondear hacia abajo</span>
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={config?.manualAmount || false} onChange={e => onChange('manualAmount', e?.target?.checked)} className="rounded" />
          <span className="text-foreground">Registrar monto manualmente al hacer check-in</span>
        </label>
      </div>
      <HealthIndicator pointsPerVisit={pointsPerVisit} cheapestReward={cheapestReward} />
    </div>
  );
};

// ─── ACUMULACIÓN POR PRODUCTO O CATEGORÍA ESPECÍFICA ─────────────────────────
const ProductoContent = ({ config, onChange, cheapestReward }) => {
  const addProductRow = () => onChange('productRules', [...(config?.productRules || []), { name: '', points: 0 }]);
  const updateProductRow = (i, field, val) => {
    const rows = [...(config?.productRules || [])];
    rows[i] = { ...rows?.[i], [field]: val };
    onChange('productRules', rows);
  };
  const removeProductRow = (i) => onChange('productRules', (config?.productRules || [])?.filter((_, idx) => idx !== i));
  const pointsPerVisit = config?.defaultPoints || 0;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Otorga puntos según qué producto o categoría compra el cliente. Permite personalización por ítem.
      </p>
      <div className="flex items-center gap-3 mb-2">
        <label className="text-sm font-medium text-foreground w-40">Puntos por default:</label>
        <input
          type="number" min="0" value={config?.defaultPoints || 3}
          onChange={e => onChange('defaultPoints', parseInt(e?.target?.value) || 0)}
          className="w-24 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
        />
        <span className="text-xs text-muted-foreground">(para productos no listados)</span>
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">Producto / Categoría</th>
              <th className="text-left p-3 font-medium text-muted-foreground w-28">Puntos</th>
              <th className="p-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {(config?.productRules || [])?.map((row, i) => (
              <tr key={i} className="border-t border-border">
                <td className="p-2">
                  <input
                    value={row?.name} placeholder="Ej: Café americano"
                    onChange={e => updateProductRow(i, 'name', e?.target?.value)}
                    className="w-full border border-border rounded px-2 py-1 text-sm bg-background text-foreground"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number" min="0" value={row?.points}
                    onChange={e => updateProductRow(i, 'points', parseInt(e?.target?.value) || 0)}
                    className="w-full border border-border rounded px-2 py-1 text-sm bg-background text-foreground"
                  />
                </td>
                <td className="p-2 text-center">
                  <button onClick={() => removeProductRow(i)} className="text-destructive hover:text-destructive/70">
                    <Icon name="Trash2" size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addProductRow} className="w-full p-3 text-sm text-primary hover:bg-primary/5 flex items-center justify-center gap-2 border-t border-border">
          <Icon name="Plus" size={14} /> Agregar producto
        </button>
      </div>
      <HealthIndicator pointsPerVisit={pointsPerVisit} cheapestReward={cheapestReward} />
    </div>
  );
};

// ─── PUNTOS DE BIENVENIDA (#82) ──────────────────────────────────────────────
const PuntosBienvenidaContent = ({ config, onChange, cheapestReward }) => {
  const pct = cheapestReward > 0 ? Math.round((config?.welcomePoints || 20) / cheapestReward * 100) : 0;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-foreground">Acreditar</span>
        <input
          type="number" min="1" value={config?.welcomePoints || 20}
          onChange={e => onChange('welcomePoints', parseInt(e?.target?.value) || 0)}
          className="w-24 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
        />
        <span className="text-sm font-medium text-foreground">puntos al unirse</span>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground mb-2">¿Cuándo se acreditan?</p>
        <div className="flex flex-col gap-2">
          {[
            { id: 'follow', label: 'Al activar el programa (follow del negocio)' },
            { id: 'checkin', label: 'Al hacer primera visita verificada (check-in)' },
          ]?.map(opt => (
            <label key={opt?.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio" name="welcomeTrigger" value={opt?.id}
                checked={(config?.welcomeTrigger || 'checkin') === opt?.id}
                onChange={() => onChange('welcomeTrigger', opt?.id)}
              />
              <span className="text-foreground">{opt?.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-sm">
        <p className="font-medium text-foreground mb-1">👁 Preview en tiempo real</p>
        <p className="text-muted-foreground">
          Un nuevo cliente se une y recibe <strong>{config?.welcomePoints || 20} puntos</strong>.
          Con tu recompensa más barata de <strong>{cheapestReward || '—'} pts</strong>,
          ya tiene el <strong>{pct}%</strong> de progreso. Motivador pero no gratuito.
        </p>
      </div>
    </div>
  );
};

// ─── MULTIPLICADORES POR CATEGORÍA (#83) ─────────────────────────────────────
const MultiplicadoresCategoriaContent = ({ config, onChange }) => {
  const rows = config?.categoryMultipliers || [];
  const add = () => onChange('categoryMultipliers', [...rows, { category: '', multiplier: 2, active: true, hasDates: false, startDate: '', endDate: '' }]);
  const update = (i, field, val) => {
    const r = [...rows]; r[i] = { ...r?.[i], [field]: val }; onChange('categoryMultipliers', r);
  };
  const remove = (i) => onChange('categoryMultipliers', rows?.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Asigna multiplicadores de puntos a categorías específicas de tu catálogo.</p>
      {rows?.length === 0 && (
        <div className="text-center py-6 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
          Sin multiplicadores configurados. Agrega uno para incentivar categorías específicas.
        </div>
      )}
      {rows?.map((row, i) => (
        <div key={i} className="border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <input
              value={row?.category} placeholder="Categoría / Producto"
              onChange={e => update(i, 'category', e?.target?.value)}
              className="flex-1 min-w-32 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">×</span>
              <input
                type="number" min="1.1" step="0.5" value={row?.multiplier}
                onChange={e => update(i, 'multiplier', parseFloat(e?.target?.value) || 2)}
                className="w-20 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
              />
            </div>
            <button
              onClick={() => update(i, 'active', !row?.active)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                row?.active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
              }`}
            >
              {row?.active ? 'Activo' : 'Inactivo'}
            </button>
            <button onClick={() => remove(i)} className="text-destructive hover:text-destructive/70">
              <Icon name="Trash2" size={16} />
            </button>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={row?.hasDates || false} onChange={e => update(i, 'hasDates', e?.target?.checked)} className="rounded" />
            <span className="text-foreground">Vigencia temporal</span>
          </label>
          {row?.hasDates && (
            <div className="flex items-center gap-3">
              <input type="date" value={row?.startDate || ''} onChange={e => update(i, 'startDate', e?.target?.value)}
                className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
              <span className="text-muted-foreground text-sm">al</span>
              <input type="date" value={row?.endDate || ''} onChange={e => update(i, 'endDate', e?.target?.value)}
                className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
            </div>
          )}
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium">
        <Icon name="Plus" size={16} /> Agregar multiplicador de categoría
      </button>
    </div>
  );
};

// ─── MULTIPLICADORES POR HORARIO (#84) ───────────────────────────────────────
const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MultiplicadoresHorarioContent = ({ config, onChange }) => {
  const rules = config?.scheduleMultipliers || [];
  const add = () => onChange('scheduleMultipliers', [...rules, {
    name: '', multiplier: 2, days: [], startTime: '14:00', endTime: '17:00', active: true
  }]);
  const update = (i, field, val) => {
    const r = [...rules]; r[i] = { ...r?.[i], [field]: val }; onChange('scheduleMultipliers', r);
  };
  const toggleDay = (i, day) => {
    const days = rules?.[i]?.days?.includes(day) ? rules?.[i]?.days?.filter(d => d !== day) : [...rules?.[i]?.days, day];
    update(i, 'days', days);
  };
  const remove = (i) => onChange('scheduleMultipliers', rules?.filter((_, idx) => idx !== i));

  const heatmap = Array(7)?.fill(null)?.map(() => Array(24)?.fill(0));
  rules?.filter(r => r?.active)?.forEach(r => {
    const sh = parseInt((r?.startTime || '00:00')?.split(':')?.[0]);
    const eh = parseInt((r?.endTime || '23:00')?.split(':')?.[0]);
    r?.days?.forEach(day => {
      const di = DAYS?.indexOf(day);
      if (di >= 0) for (let h = sh; h <= eh; h++) heatmap[di][h] = Math.max(heatmap?.[di]?.[h] || 1);
    });
  });

  const getHeatColor = (val) => {
    if (val <= 0) return 'bg-muted/20';
    if (val <= 1.5) return 'bg-blue-100';
    if (val <= 2) return 'bg-blue-300';
    if (val <= 3) return 'bg-blue-500';
    return 'bg-blue-700';
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Define horarios y días donde los puntos se multiplican para llenar horas muertas.</p>
      {rules?.map((rule, i) => (
        <div key={i} className="border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <input
              value={rule?.name} placeholder="Ej: Martes doble, Happy hour"
              onChange={e => update(i, 'name', e?.target?.value)}
              className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">×</span>
              <input
                type="number" min="1.1" step="0.5" value={rule?.multiplier}
                onChange={e => update(i, 'multiplier', parseFloat(e?.target?.value) || 2)}
                className="w-20 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
              />
            </div>
            <button
              onClick={() => update(i, 'active', !rule?.active)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                rule?.active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
              }`}
            >
              {rule?.active ? 'Activo' : 'Inactivo'}
            </button>
            <button onClick={() => remove(i)} className="text-destructive hover:text-destructive/70">
              <Icon name="Trash2" size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {DAYS?.map(day => (
              <button
                key={day}
                onClick={() => toggleDay(i, day)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  rule?.days?.includes(day) ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">De</span>
            <input type="time" value={rule?.startTime || '14:00'} onChange={e => update(i, 'startTime', e?.target?.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
            <span className="text-sm text-muted-foreground">a</span>
            <input type="time" value={rule?.endTime || '17:00'} onChange={e => update(i, 'endTime', e?.target?.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
          </div>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium">
        <Icon name="Plus" size={16} /> Agregar regla de horario
      </button>
      {rules?.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Visualización semanal de multiplicadores activos</p>
          <div className="overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {DAYS?.map((day, di) => (
                <div key={day} className="flex flex-col gap-0.5">
                  <span className="text-xs text-center text-muted-foreground mb-1 w-8">{day}</span>
                  {Array.from({ length: 24 }, (_, h) => (
                    <div key={h} title={`${day} ${h}:00 — ×${heatmap?.[di]?.[h] || 1}`}
                      className={`w-8 h-2 rounded-sm ${getHeatColor(heatmap?.[di]?.[h])}`} />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2">
            {[['bg-muted/20', 'Normal'], ['bg-blue-100', '×1.5'], ['bg-blue-300', '×2'], ['bg-blue-500', '×3'], ['bg-blue-700', '×4+']]?.map(([cls, lbl]) => (
              <div key={lbl} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-sm ${cls}`} />
                <span className="text-xs text-muted-foreground">{lbl}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── STREAK CONTENT (Racha tab) ───────────────────────────────────────────────
const DEFAULT_STREAK = [
  { visit: 2, bonus: 5 }, { visit: 3, bonus: 10 }, { visit: 5, bonus: 20 },
  { visit: 7, bonus: 30 }, { visit: 10, bonus: 50 }, { visit: 15, bonus: 100 },
];
const StreakContent = ({ config, onChange }) => {
  const steps = config?.streakSteps || DEFAULT_STREAK;
  const updateStep = (i, field, val) => {
    const s = [...steps]; s[i] = { ...s?.[i], [field]: val }; onChange('streakSteps', s);
  };
  const addStep = () => steps?.length < 10 && onChange('streakSteps', [...steps, { visit: (steps?.[steps?.length - 1]?.visit || 0) + 1, bonus: 0 }]);
  const removeStep = (i) => steps?.length > 2 && onChange('streakSteps', steps?.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Premia la constancia con bonus progresivos. Cada visita consecutiva da más puntos. La racha se reinicia si el cliente deja de venir.</p>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">Visita consecutiva #</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Bonus extra (pts)</th>
              <th className="p-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {steps?.map((step, i) => (
              <tr key={i} className="border-t border-border">
                <td className="p-2">
                  <input type="number" min="1" value={step?.visit}
                    onChange={e => updateStep(i, 'visit', parseInt(e?.target?.value) || 1)}
                    className="w-24 border border-border rounded px-2 py-1 text-sm bg-background text-foreground" />
                </td>
                <td className="p-2">
                  <input type="number" min="0" value={step?.bonus}
                    onChange={e => updateStep(i, 'bonus', parseInt(e?.target?.value) || 0)}
                    className="w-24 border border-border rounded px-2 py-1 text-sm bg-background text-foreground" />
                </td>
                <td className="p-2 text-center">
                  <button onClick={() => removeStep(i)} className="text-destructive hover:text-destructive/70" disabled={steps?.length <= 2}>
                    <Icon name="Trash2" size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {steps?.length < 10 && (
          <button onClick={addStep} className="w-full p-3 text-sm text-primary hover:bg-primary/5 flex items-center justify-center gap-2 border-t border-border">
            <Icon name="Plus" size={14} /> Agregar escalón
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Ventana de racha (días)</label>
          <div className="flex items-center gap-3">
            <input
              type="range" min="3" max="30" value={config?.streakWindow || 7}
              onChange={e => onChange('streakWindow', parseInt(e?.target?.value))}
              className="flex-1"
            />
            <span className="text-sm font-semibold text-foreground w-12 text-center">{config?.streakWindow || 7} días</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">La racha se rompe si el cliente no visita en {config?.streakWindow || 7} días.</p>
        </div>
        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div>
            <p className="text-sm font-medium text-foreground">Reiniciar racha al alcanzar nivel máximo</p>
            <p className="text-xs text-muted-foreground">Si está off, el cliente mantiene el bonus máximo.</p>
          </div>
          <Toggle value={config?.streakReset || false} onChange={v => onChange('streakReset', v)} />
        </div>
      </div>
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm font-medium text-amber-800 mb-2">🔥 Vista previa en app B2C</p>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-sm font-semibold text-amber-900">Racha de 4 visitas</p>
            <p className="text-xs text-amber-700">1 visita más para +{steps?.find(s => s?.visit === 5)?.bonus || 20} bonus</p>
            <p className="text-xs text-amber-600">¡Vuelve antes del {new Date(Date.now() + (config?.streakWindow || 7) * 86400000)?.toLocaleDateString('es-MX')} para mantener tu racha!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── DEFAULT MILESTONES ───────────────────────────────────────────────────────
const DEFAULT_MILESTONES = [
  { visit: 10, bonus: 50, name: 'Primera decena', message: '¡Ya van 10 visitas! Esto apenas empieza 💪', expanded: false },
  { visit: 25, bonus: 150, name: 'Cliente frecuente', message: '¡25 visitas! Eres de nuestros clientes favoritos ⭐', expanded: false },
  { visit: 50, bonus: 400, name: 'Fan del negocio', message: '¡50 visitas! Eres parte de la familia {negocio} 🏆', expanded: false },
  { visit: 100, bonus: 1000, name: 'Leyenda', message: '¡100 visitas! Eres una leyenda de {negocio} 👑', expanded: false },
  { visit: 200, bonus: 2500, name: 'Parte de la familia', message: '¡{visitas} visitas! Eres parte de la familia {negocio} ❤️', expanded: false },
];

// ─── HITOS CONTENT (Milestones tab) ──────────────────────────────────────────
const HitosContent = ({ config, onChange }) => {
  const milestones = config?.milestones || DEFAULT_MILESTONES;
  const [expandedRows, setExpandedRows] = useState({});

  const updateMilestone = (i, field, val) => {
    const m = [...milestones];
    m[i] = { ...m?.[i], [field]: val };
    onChange('milestones', m);
  };

  const addMilestone = () => {
    if (milestones?.length >= 8) return;
    const lastVisit = milestones?.[milestones?.length - 1]?.visit || 0;
    onChange('milestones', [...milestones, { visit: lastVisit + 10, bonus: 100, name: '', message: '', expanded: false }]);
  };

  const removeMilestone = (i) => {
    if (milestones?.length <= 2) return;
    onChange('milestones', milestones?.filter((_, idx) => idx !== i));
  };

  const toggleRowExpand = (i) => {
    setExpandedRows(prev => ({ ...prev, [i]: !prev?.[i] }));
  };

  // Validate ascending order with min 5 visits gap
  const getRowError = (i) => {
    if (i === 0) return null;
    const prev = milestones?.[i - 1]?.visit || 0;
    const curr = milestones?.[i]?.visit || 0;
    if (curr <= prev) return 'Debe ser mayor que el hito anterior';
    if (curr - prev < 5) return 'Separación mínima de 5 visitas';
    return null;
  };

  // Timeline data
  const maxVisit = milestones?.[milestones?.length - 1]?.visit || 200;
  const minVisit = 0;
  const range = maxVisit - minVisit || 1;

  // Mock client data per segment
  const mockClientsPerSegment = [12, 8, 5, 3, 1];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 p-4 bg-violet-50 border border-violet-200 rounded-xl">
        <Icon name="Trophy" size={18} className="text-violet-600 flex-shrink-0" />
        <p className="text-sm text-violet-800">
          Los <strong>hitos</strong> premian la lealtad acumulada a lo largo de toda la relación. A diferencia de la racha, los hitos <strong>nunca se pierden</strong>: una vez alcanzados son permanentes e irreversibles.
        </p>
      </div>
      {/* Milestones table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/50 px-4 py-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Tabla de hitos ({milestones?.length}/8)</p>
          <p className="text-xs text-muted-foreground">Mín. 2 hitos · Máx. 8 · Orden ascendente · Separación mínima 5 visitas</p>
        </div>

        <div className="divide-y divide-border">
          {milestones?.map((m, i) => {
            const rowError = getRowError(i);
            const bonusMXN = (m?.bonus * POINT_VALUE_MXN)?.toFixed(2);
            const isExpanded = expandedRows?.[i];
            return (
              <div key={i} className={`p-4 ${rowError ? 'bg-red-50/50' : ''}`}>
                <div className="flex items-start gap-3 flex-wrap">
                  {/* Visit # */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Visita #</label>
                    <input
                      type="number" min="1" value={m?.visit}
                      onChange={e => updateMilestone(i, 'visit', parseInt(e?.target?.value) || 1)}
                      className={`w-20 border rounded-lg px-3 py-2 text-sm bg-background text-foreground ${
                        rowError ? 'border-destructive' : 'border-border'
                      }`}
                    />
                    {rowError && <p className="text-xs text-destructive">{rowError}</p>}
                  </div>

                  {/* Bonus points */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Bonus (pts)</label>
                    <input
                      type="number" min="1" value={m?.bonus}
                      onChange={e => updateMilestone(i, 'bonus', parseInt(e?.target?.value) || 1)}
                      className="w-24 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                    />
                  </div>

                  {/* MXN equivalent */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Equivalente</label>
                    <div className="flex items-center h-9 px-3 bg-muted/30 border border-border rounded-lg text-sm text-muted-foreground">
                      ${bonusMXN} MXN
                    </div>
                  </div>

                  {/* Name */}
                  <div className="flex flex-col gap-1 flex-1 min-w-32">
                    <label className="text-xs text-muted-foreground">Nombre del hito (opcional, max 30)</label>
                    <input
                      value={m?.name || ''} placeholder={`¡Visita #${m?.visit}!`}
                      maxLength={30}
                      onChange={e => updateMilestone(i, 'name', e?.target?.value)}
                      className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                    />
                  </div>

                  {/* Clients near */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Clientes cerca</label>
                    <div className="flex items-center h-9 px-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 whitespace-nowrap">
                      {mockClientsPerSegment?.[i] || 0} a &lt;5 visitas
                    </div>
                  </div>

                  {/* Expand + Delete */}
                  <div className="flex items-end gap-2 pb-0.5">
                    <button
                      onClick={() => toggleRowExpand(i)}
                      className="h-9 w-9 flex items-center justify-center border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      title="Mensaje de celebración"
                    >
                      <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => removeMilestone(i)}
                      disabled={milestones?.length <= 2}
                      className="h-9 w-9 flex items-center justify-center border border-border rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-30"
                    >
                      <Icon name="X" size={16} className="text-destructive" />
                    </button>
                  </div>
                </div>
                {/* Expanded: celebration message */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <label className="text-xs font-medium text-foreground block mb-1">
                      Mensaje de celebración (max 150 chars) — Variables: {'{nombre}'}, {'{negocio}'}, {'{visitas}'}
                    </label>
                    <textarea
                      value={m?.message || ''}
                      maxLength={150}
                      rows={2}
                      placeholder={`¡${m?.visit} visitas! Eres increíble 🎉`}
                      onChange={e => updateMilestone(i, 'message', e?.target?.value)}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground resize-none"
                    />
                    <p className="text-xs text-muted-foreground text-right mt-1">{(m?.message || '')?.length}/150</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {milestones?.length < 8 && (
          <button
            onClick={addMilestone}
            className="w-full p-3 text-sm text-primary hover:bg-primary/5 flex items-center justify-center gap-2 border-t border-border"
          >
            <Icon name="Plus" size={14} /> Agregar hito
          </button>
        )}
      </div>
      {/* Visual timeline */}
      <div className="border border-border rounded-xl p-4">
        <p className="text-sm font-semibold text-foreground mb-4">📍 Timeline visual de hitos</p>
        <div className="relative pt-8 pb-10">
          {/* Line */}
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-border" style={{ top: '32px' }} />

          {/* Points */}
          <div className="relative flex items-start" style={{ height: '80px' }}>
            {milestones?.map((m, i) => {
              const pct = ((m?.visit - minVisit) / range) * 100;
              const bonusMXN = (m?.bonus * POINT_VALUE_MXN)?.toFixed(0);
              return (
                <div
                  key={i}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${Math.max(2, Math.min(96, pct))}%`, transform: 'translateX(-50%)' }}
                >
                  {/* Bonus above */}
                  <div className="text-center mb-1">
                    <span className="text-xs font-bold text-primary">+{m?.bonus}pts</span>
                    <br />
                    <span className="text-xs text-muted-foreground">${bonusMXN}</span>
                  </div>
                  {/* Dot */}
                  <div className="w-4 h-4 rounded-full bg-primary border-2 border-white shadow-md z-10" />
                  {/* Visit # below */}
                  <div className="text-center mt-1">
                    <span className="text-xs font-semibold text-foreground">#{m?.visit}</span>
                    <br />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{mockClientsPerSegment?.[i] || 0} aquí</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Economic analysis */}
      <div className="border border-border rounded-xl p-4 bg-muted/20">
        <p className="text-sm font-semibold text-foreground mb-3">📊 Análisis económico</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="p-3 bg-card border border-border rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Costo estimado mensual de hitos</p>
            <p className="text-lg font-bold text-foreground">$847 MXN</p>
            <p className="text-xs text-muted-foreground">Basado en ~12 clientes que alcanzarán un hito este mes</p>
          </div>
          <div className="p-3 bg-card border border-border rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Mes pasado</p>
            <p className="text-lg font-bold text-foreground">9 clientes</p>
            <p className="text-xs text-muted-foreground">Recibieron 4,200 pts bonus ($630 MXN en total)</p>
          </div>
          <div className="p-3 bg-card border border-border rounded-lg md:col-span-2">
            <p className="text-xs text-muted-foreground mb-1">Impacto en frecuencia</p>
            <p className="text-sm text-foreground">
              Los clientes que han alcanzado al menos 1 hito visitan
              <strong className="text-emerald-600"> 34% más frecuentemente</strong> que los que no.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── BONUS POR VISITAS CONTENT (Racha + Hitos tabs) ──────────────────────────
const BonusVisitasContent = ({ config, onChange }) => {
  const [activeVisitTab, setActiveVisitTab] = useState('racha');

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Dos sistemas complementarios: la <strong>Racha</strong> premia la constancia a corto plazo (se reinicia si el cliente deja de venir), los <strong>Hitos</strong> premian la lealtad acumulada a largo plazo (nunca se pierden).
      </p>

      {/* Internal tabs */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="flex border-b border-border bg-muted/20">
          {[
            { id: 'racha', label: '🔥 Racha', desc: 'Visitas consecutivas' },
            { id: 'hitos', label: '🏆 Hitos', desc: 'Logros acumulados' },
          ]?.map(tab => (
            <button
              key={tab?.id}
              onClick={() => setActiveVisitTab(tab?.id)}
              className={`flex-1 flex flex-col items-center px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeVisitTab === tab?.id
                  ? 'border-primary text-primary bg-card' :'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              <span>{tab?.label}</span>
              <span className="text-xs font-normal text-muted-foreground">{tab?.desc}</span>
            </button>
          ))}
        </div>
        <div className="p-4 bg-card">
          {activeVisitTab === 'racha' && (
            <StreakContent config={config} onChange={onChange} />
          )}
          {activeVisitTab === 'hitos' && (
            <HitosContent config={config} onChange={onChange} />
          )}
        </div>
      </div>
    </div>
  );
};

// ─── BONUS POR COMPORTAMIENTO — CUMPLEAÑOS ────────────────────────────────────
const CumpleanosContent = ({ config, onChange }) => (
  <div className="space-y-4">
    <p className="text-sm text-muted-foreground">
      Bonus automático el día del cumpleaños del cliente o en la visita más cercana. Se acredita una sola vez por año. Requiere que el cliente tenga fecha de nacimiento registrada en la app B2C.
    </p>
    <div className="flex items-center gap-3 flex-wrap">
      <label className="text-sm font-medium text-foreground w-40">Puntos de cumpleaños:</label>
      <input
        type="number" min="1" value={config?.birthdayPoints || 50}
        onChange={e => onChange('birthdayPoints', parseInt(e?.target?.value) || 50)}
        className="w-24 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
      />
      <span className="text-xs text-muted-foreground">(= ${((config?.birthdayPoints || 50) * POINT_VALUE_MXN)?.toFixed(2)} MXN)</span>
    </div>
    <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg text-sm">
      <p className="font-medium text-pink-800 mb-1">🎂 Preview en app B2C</p>
      <p className="text-pink-700">"¡Feliz cumpleaños! Hoy ganas <strong>{config?.birthdayPoints || 50} puntos extra</strong> en tu visita. ¡Celébralo con nosotros!"</p>
    </div>
  </div>
);

// ─── BONUS POR REFERIDO EXITOSO ───────────────────────────────────────────────
const ReferidoContent = ({ config, onChange }) => (
  <div className="space-y-4">
    <p className="text-sm text-muted-foreground">
      Cuando el amigo referido hace su primera visita, el cliente referidor recibe puntos bonus. Diferente del programa de referidos B2C que da recompensas monetarias — estos son puntos que se suman al programa de lealtad.
    </p>
    <div className="flex items-center gap-3 flex-wrap">
      <label className="text-sm font-medium text-foreground w-40">Puntos por referido:</label>
      <input
        type="number" min="1" value={config?.referralPoints || 100}
        onChange={e => onChange('referralPoints', parseInt(e?.target?.value) || 100)}
        className="w-24 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
      />
      <span className="text-xs text-muted-foreground">(= ${((config?.referralPoints || 100) * POINT_VALUE_MXN)?.toFixed(2)} MXN)</span>
    </div>
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
      <p className="font-medium text-blue-800 mb-1">👥 Notificación al referidor</p>
      <p className="text-blue-700">"Tu amigo visitó gracias a ti — aquí van <strong>{config?.referralPoints || 100} puntos</strong>. ¡Sigue compartiendo!"</p>
    </div>
  </div>
);

// ─── BONUS POR RESEÑA VERIFICADA ──────────────────────────────────────────────
const ResenaContent = ({ config, onChange }) => (
  <div className="space-y-4">
    <p className="text-sm text-muted-foreground">
      Bonus de puntos después de publicar una reseña post-visita. Solo reseñas vinculadas a un check-in real. Límite configurable de reseñas con puntos por mes para evitar abuso.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-foreground w-40">Puntos por reseña:</label>
        <input
          type="number" min="1" value={config?.reviewPoints || 25}
          onChange={e => onChange('reviewPoints', parseInt(e?.target?.value) || 25)}
          className="w-24 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-foreground w-40">Límite por mes:</label>
        <input
          type="number" min="1" max="5" value={config?.reviewLimitPerMonth || 1}
          onChange={e => onChange('reviewLimitPerMonth', parseInt(e?.target?.value) || 1)}
          className="w-20 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
        />
        <span className="text-xs text-muted-foreground">reseña(s)/mes</span>
      </div>
    </div>
    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm">
      <p className="font-medium text-emerald-800 mb-1">⭐ Notificación al cliente</p>
      <p className="text-emerald-700">"Gracias por tu opinión — <strong>+{config?.reviewPoints || 25} puntos</strong> acreditados a tu cuenta."</p>
    </div>
  </div>
);

// ─── BONUS POR RESERVACIÓN CUMPLIDA ──────────────────────────────────────────
const ReservacionContent = ({ config, onChange }) => (
  <div className="space-y-4">
    <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <Icon name="Info" size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
      <p className="text-xs text-amber-800">Requiere que el módulo de reservaciones (L1) esté activo. El cliente gana puntos extra al reservar Y presentarse.</p>
    </div>
    <p className="text-sm text-muted-foreground">
      Incentiva el uso del sistema de reservaciones y reduce no-shows. Solo se acredita cuando el cliente cumple la reservación (check-in confirmado).
    </p>
    <div className="flex items-center gap-3 flex-wrap">
      <label className="text-sm font-medium text-foreground w-40">Puntos bonus:</label>
      <input
        type="number" min="1" value={config?.reservationPoints || 30}
        onChange={e => onChange('reservationPoints', parseInt(e?.target?.value) || 30)}
        className="w-24 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
      />
      <span className="text-xs text-muted-foreground">(= ${((config?.reservationPoints || 30) * POINT_VALUE_MXN)?.toFixed(2)} MXN)</span>
    </div>
    <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg text-sm">
      <p className="font-medium text-violet-800 mb-1">📅 Notificación al cliente</p>
      <p className="text-violet-700">"Reservaste y cumpliste — <strong>+{config?.reservationPoints || 30} puntos bonus</strong> por tu reservación."</p>
    </div>
  </div>
);

// ─── BONUS POR COMPLETAR PERFIL ───────────────────────────────────────────────
const PerfilCompletoContent = ({ config, onChange }) => (
  <div className="space-y-4">
    <p className="text-sm text-muted-foreground">
      One-time bonus cuando el usuario completa el 100% de su perfil en la app B2C (nombre, foto, cumpleaños, preferencias, permisos). Se acredita una sola vez por usuario para siempre. Incentiva datos de calidad en el CRM.
    </p>
    <div className="flex items-center gap-3 flex-wrap">
      <label className="text-sm font-medium text-foreground w-40">Puntos one-time:</label>
      <input
        type="number" min="1" value={config?.profileCompletePoints || 75}
        onChange={e => onChange('profileCompletePoints', parseInt(e?.target?.value) || 75)}
        className="w-24 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
      />
      <span className="text-xs text-muted-foreground">(= ${((config?.profileCompletePoints || 75) * POINT_VALUE_MXN)?.toFixed(2)} MXN)</span>
    </div>
    <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-lg">
      <Icon name="CheckCircle" size={16} className="text-emerald-600 flex-shrink-0" />
      <p className="text-xs text-muted-foreground">Este bonus solo se otorga <strong>una vez por cliente</strong>, sin importar cuántas veces complete o actualice su perfil.</p>
    </div>
    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-sm">
      <p className="font-medium text-indigo-800 mb-1">👤 Notificación al cliente</p>
      <p className="text-indigo-700">"¡Perfil completo! <strong>+{config?.profileCompletePoints || 75} puntos</strong> acreditados. Gracias por completar tu información."</p>
    </div>
  </div>
);

// ─── CONTROL: LÍMITE DIARIO ───────────────────────────────────────────────────
const LimiteDiarioContent = ({ config, onChange }) => (
  <div className="space-y-4">
    <p className="text-sm text-muted-foreground">
      Tope de puntos que un cliente puede ganar en un solo día, independientemente de cuántos triggers active. Previene abuso cuando hay multiplicadores activos simultáneos (racha + horario + categoría).
    </p>
    <div className="flex items-center gap-3 flex-wrap">
      <label className="text-sm font-medium text-foreground w-48">Máximo de puntos por día:</label>
      <input
        type="number" min="10" value={config?.limitDailyPoints || 200}
        onChange={e => onChange('limitDailyPoints', parseInt(e?.target?.value) || 200)}
        className="w-28 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
      />
      <span className="text-xs text-muted-foreground">puntos/día/cliente</span>
    </div>
    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <p className="text-xs text-amber-800">⚠️ Este límite aplica sobre el total de puntos ganados en el día, incluyendo puntos base + bonus de racha + multiplicadores + bonus de comportamiento.</p>
    </div>
  </div>
);

// ─── CONTROL: LÍMITE MENSUAL ──────────────────────────────────────────────────
const LimiteMensualContent = ({ config, onChange }) => (
  <div className="space-y-4">
    <p className="text-sm text-muted-foreground">
      Límite mensual de puntos por cliente. Protege el presupuesto del programa cuando hay clientes que visitan muy frecuentemente.
    </p>
    <div className="flex items-center gap-3 flex-wrap">
      <label className="text-sm font-medium text-foreground w-48">Máximo de puntos por mes:</label>
      <input
        type="number" min="50" value={config?.limitMonthlyPoints || 2000}
        onChange={e => onChange('limitMonthlyPoints', parseInt(e?.target?.value) || 2000)}
        className="w-28 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
      />
      <span className="text-xs text-muted-foreground">puntos/mes/cliente</span>
    </div>
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-xs text-blue-800">💡 Recomendado: 10-20× el promedio de puntos por visita. Con {config?.pointsPerVisit || 10} pts/visita y ~{Math.round((config?.limitMonthlyPoints || 2000) / (config?.pointsPerVisit || 10))} visitas/mes el límite se alcanzaría.</p>
    </div>
  </div>
);

// ─── CONTROL: PUNTOS POR MÉTODO DE CHECK-IN ──────────────────────────────────
const MetodoCheckinContent = ({ config, onChange }) => {
  const methods = [
    { id: 'qr', label: 'QR en mostrador', icon: 'QrCode', color: 'text-blue-600', bg: 'bg-blue-50', desc: 'Alta confianza — escaneo activo del cliente' },
    { id: 'nfc', label: 'NFC / Tap', icon: 'Wifi', color: 'text-orange-600', bg: 'bg-orange-50', desc: 'Incentivar adopción de NFC' },
    { id: 'geofence', label: 'Geofence automático', icon: 'MapPin', color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Media confianza — detección GPS' },
    { id: 'manual', label: 'Código manual', icon: 'Keyboard', color: 'text-violet-600', bg: 'bg-violet-50', desc: 'Media confianza — ingreso por cajero' },
  ];
  const methodPoints = config?.checkinMethodPoints || { qr: 10, nfc: 15, geofence: 5, manual: 5 };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Define cuántos puntos base otorga cada método de check-in. Permite incentivar los métodos que el negocio prefiere. Estos valores reemplazan los puntos por visita configurados en la regla base cuando esta opción está activa.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {methods?.map(m => (
          <div key={m?.id} className={`flex items-center gap-3 p-4 border border-border rounded-xl ${m?.bg}`}>
            <div className="w-9 h-9 rounded-lg bg-white/70 flex items-center justify-center flex-shrink-0">
              <Icon name={m?.icon} size={18} className={m?.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{m?.label}</p>
              <p className="text-xs text-muted-foreground">{m?.desc}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <input
                type="number" min="0" value={methodPoints?.[m?.id] ?? 10}
                onChange={e => onChange('checkinMethodPoints', { ...methodPoints, [m?.id]: parseInt(e?.target?.value) || 0 })}
                className="w-16 border border-border rounded-lg px-2 py-1.5 text-sm bg-white text-foreground text-center"
              />
              <span className="text-xs text-muted-foreground">pts</span>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 bg-muted/30 border border-border rounded-lg">
        <p className="text-xs text-muted-foreground">💡 Sugerencia: NFC &gt; QR &gt; Geofence/Manual para incentivar métodos de mayor confianza y menor fricción operativa.</p>
      </div>
    </div>
  );
};

// ─── ESPECIAL: PRIMERA COMPRA PRODUCTO NUEVO ──────────────────────────────────
const PrimeraCompraProductoContent = ({ config, onChange }) => (
  <div className="space-y-4">
    <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <Icon name="Info" size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
      <p className="text-xs text-amber-800">Requiere catálogo configurado (L2). One-time por producto por cliente.</p>
    </div>
    <p className="text-sm text-muted-foreground">
      La primera vez que el cliente prueba un producto específico, gana puntos extra. Incentiva probar nuevos ítems del menú o catálogo.
    </p>
    <div className="flex items-center gap-3 flex-wrap">
      <label className="text-sm font-medium text-foreground w-48">Puntos por primer prueba:</label>
      <input
        type="number" min="1" value={config?.newProductPoints || 50}
        onChange={e => onChange('newProductPoints', parseInt(e?.target?.value) || 50)}
        className="w-24 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
      />
    </div>
    <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg text-sm">
      <p className="font-medium text-teal-800 mb-1">🆕 Notificación al cliente</p>
      <p className="text-teal-700">"¡Primera vez que pruebas [producto]! <strong>+{config?.newProductPoints || 50} puntos extra</strong> por explorar nuestro menú."</p>
    </div>
  </div>
);

// ─── ESPECIAL: RECARGA PREPAGO ────────────────────────────────────────────────
const RecargaPrepagoContent = ({ config, onChange }) => (
  <div className="space-y-4">
    <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <Icon name="Info" size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
      <p className="text-xs text-amber-800">Requiere tarjeta prepago (D2) activa. Regla separada de la acumulación por compra — la recarga no es una compra directa.</p>
    </div>
    <p className="text-sm text-muted-foreground">
      Las recargas de tarjeta prepago generan puntos. Premia al cliente que deposita dinero anticipado.
    </p>
    <div className="flex items-center gap-3 flex-wrap">
      <label className="text-sm font-medium text-foreground">Por cada $100 MXN recargados:</label>
      <input
        type="number" min="1" value={config?.prepaidReloadPointsPer100 || 10}
        onChange={e => onChange('prepaidReloadPointsPer100', parseInt(e?.target?.value) || 10)}
        className="w-20 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
      />
      <span className="text-sm text-muted-foreground">puntos</span>
    </div>
    <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg text-sm">
      <p className="font-medium text-cyan-800 mb-1">💳 Notificación al cliente</p>
      <p className="text-cyan-700">"Por cada $100 que recargas en tu tarjeta prepago, ganas <strong>{config?.prepaidReloadPointsPer100 || 10} puntos</strong>."</p>
    </div>
  </div>
);

// ─── ESPECIAL: PUNTOS DOBLES PRIMERA VISITA DEL MES ──────────────────────────
const PrimeraVisitaMesContent = ({ config, onChange }) => (
  <div className="space-y-4">
    <p className="text-sm text-muted-foreground">
      La primera visita de cada mes calendario da el doble de puntos. Reinicia automáticamente cada mes. Más simple que el multiplicador por horario pero con el mismo objetivo de distribuir visitas.
    </p>
    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon name="Star" size={20} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">×2 puntos automático</p>
          <p className="text-xs text-muted-foreground">La primera visita de cada mes calendario duplica todos los puntos ganados en esa visita (base + bonus activos).</p>
        </div>
      </div>
    </div>
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
      <p className="font-medium text-yellow-800 mb-1">📅 Notificación al cliente</p>
      <p className="text-yellow-700">"¡Primera visita de {new Date()?.toLocaleString('es-MX', { month: 'long' })}! Tus puntos se duplican hoy. ¡Aprovéchalo!"</p>
    </div>
  </div>
);

// ─── ESPECIAL: VISITA EN GRUPO ────────────────────────────────────────────────
const VisitaGrupoContent = ({ config, onChange }) => (
  <div className="space-y-4">
    <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <Icon name="Info" size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
      <p className="text-xs text-amber-800">Requiere módulo de reservaciones o check-in grupal configurado.</p>
    </div>
    <p className="text-sm text-muted-foreground">
      Si el cliente visita con X o más personas (reservación grupal o check-in múltiple), gana puntos extra. Incentiva traer acompañantes.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-foreground w-40">Mínimo de personas:</label>
        <input
          type="number" min="2" max="20" value={config?.groupVisitMinPeople || 3}
          onChange={e => onChange('groupVisitMinPeople', parseInt(e?.target?.value) || 3)}
          className="w-20 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
        />
        <span className="text-xs text-muted-foreground">personas</span>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-foreground w-40">Puntos bonus:</label>
        <input
          type="number" min="1" value={config?.groupVisitBonusPoints || 50}
          onChange={e => onChange('groupVisitBonusPoints', parseInt(e?.target?.value) || 50)}
          className="w-20 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
        />
      </div>
    </div>
    <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm">
      <p className="font-medium text-rose-800 mb-1">👥 Notificación al cliente</p>
      <p className="text-rose-700">"¡Viniste en grupo! <strong>+{config?.groupVisitBonusPoints || 50} puntos extra</strong> por traer a tus amigos."</p>
    </div>
  </div>
);

// ─── REGLAS SUB-TAB ──────────────────────────────────────────────────────────
const ReglasSubTab = ({ config, onChange, rulesActive, onToggleRule, cheapestReward }) => {
  const rules = [
    {
      id: 'visitAccumulation',
      title: 'Acumulación por Visita',
      icon: 'MapPin',
      description: 'Puntos fijos por cada check-in verificado, sin importar el monto gastado.',
      content: <VisitaContent config={config} onChange={onChange} cheapestReward={cheapestReward} />,
    },
    {
      id: 'amountAccumulation',
      title: 'Acumulación Adicional por Monto Gastado',
      icon: 'DollarSign',
      description: 'Puntos proporcionales al gasto: X puntos por cada $Y MXN gastados.',
      content: <MontoContent config={config} onChange={onChange} cheapestReward={cheapestReward} />,
    },
    {
      id: 'productAccumulation',
      title: 'Acumulación por Producto o Categoría Específica',
      icon: 'ShoppingBag',
      description: 'Tabla de producto/categoría → puntos. Personalización por ítem del catálogo.',
      content: <ProductoContent config={config} onChange={onChange} cheapestReward={cheapestReward} />,
    },
    {
      id: 'welcome',
      title: 'Puntos de bienvenida',
      icon: 'Gift',
      description: 'Bonus automático para nuevos clientes al unirse al programa.',
      content: <PuntosBienvenidaContent config={config} onChange={onChange} cheapestReward={cheapestReward} />,
    },
    {
      id: 'categoryMultiplier',
      title: 'Multiplicadores por categoría de producto',
      icon: 'Tag',
      description: 'Asigna multiplicadores de puntos a categorías específicas del catálogo.',
      content: <MultiplicadoresCategoriaContent config={config} onChange={onChange} />,
    },
    {
      id: 'scheduleMultiplier',
      title: 'Multiplicadores por horario / día',
      icon: 'Clock',
      description: 'Multiplica puntos en horarios específicos para llenar horas muertas.',
      content: <MultiplicadoresHorarioContent config={config} onChange={onChange} />,
    },
  ];

  const bonusRules = [
    {
      id: 'bonusStreak',
      title: 'Racha de visitas (Streak)',
      icon: 'Flame',
      description: 'Puntos bonus escalados por visitas consecutivas. La racha se rompe si el cliente no visita en X días.',
      content: <StreakContent config={config} onChange={onChange} />,
    },
    {
      id: 'bonusMilestones',
      title: 'Hitos de visitas (Milestone rewards)',
      icon: 'Trophy',
      description: 'Bonus one-time al alcanzar visitas acumuladas totales. Nunca se pierden.',
      content: <HitosContent config={config} onChange={onChange} />,
    },
    {
      id: 'bonusBirthday',
      title: 'Puntos por cumpleaños',
      icon: 'Cake',
      description: 'Bonus automático el día del cumpleaños. Una vez por año. Requiere fecha de nacimiento en app B2C.',
      content: <CumpleanosContent config={config} onChange={onChange} />,
    },
    {
      id: 'bonusReferral',
      title: 'Puntos por referido exitoso',
      icon: 'Users',
      description: 'Bonus al referidor cuando su amigo hace su primera visita.',
      content: <ReferidoContent config={config} onChange={onChange} />,
    },
    {
      id: 'bonusReview',
      title: 'Puntos por reseña verificada',
      icon: 'Star',
      description: 'Bonus por publicar reseña vinculada a check-in real. Límite: 1 reseña con puntos por mes.',
      content: <ResenaContent config={config} onChange={onChange} />,
    },
    {
      id: 'bonusReservation',
      title: 'Puntos por reservación cumplida',
      icon: 'CalendarCheck',
      description: 'Bonus cuando el cliente reserva y se presenta. Requiere módulo de reservaciones (L1).',
      content: <ReservacionContent config={config} onChange={onChange} />,
    },
    {
      id: 'bonusProfileComplete',
      title: 'Puntos por completar perfil en la app',
      icon: 'UserCheck',
      description: 'One-time bonus al completar el 100% del perfil en app B2C. Una vez por usuario para siempre.',
      content: <PerfilCompletoContent config={config} onChange={onChange} />,
    },
  ];

  const specialRules = [
    {
      id: 'specialNewProduct',
      title: 'Puntos por primera compra de producto nuevo',
      icon: 'Sparkles',
      description: 'One-time por producto: la primera vez que el cliente prueba un ítem específico. Requiere catálogo (L2).',
      content: <PrimeraCompraProductoContent config={config} onChange={onChange} />,
    },
    {
      id: 'specialPrepaidReload',
      title: 'Puntos por monto de recarga prepago',
      icon: 'CreditCard',
      description: 'Por cada $100 recargados en tarjeta prepago, el cliente gana puntos. Requiere módulo D2.',
      content: <RecargaPrepagoContent config={config} onChange={onChange} />,
    },
    {
      id: 'specialFirstVisitMonth',
      title: 'Puntos dobles en primera visita del mes',
      icon: 'CalendarDays',
      description: 'La primera visita de cada mes calendario da el doble de puntos. Reinicia automáticamente.',
      content: <PrimeraVisitaMesContent config={config} onChange={onChange} />,
    },
    {
      id: 'specialGroupVisit',
      title: 'Puntos por visita en grupo',
      icon: 'UsersRound',
      description: 'Bonus si el cliente visita con X o más personas. Requiere reservación grupal o check-in múltiple.',
      content: <VisitaGrupoContent config={config} onChange={onChange} />,
    },
  ];

  const SectionHeader = ({ title, description, icon }) => (
    <div className="flex items-start gap-3 pt-2 pb-1">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon name={icon} size={16} className="text-primary" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <Icon name="Info" size={18} className="text-primary flex-shrink-0" />
        <p className="text-sm text-foreground">
          Todas las reglas son opcionales. Activa las que deseas aplicar a tu programa de puntos.
          Las reglas adicionales se acumulan sobre las reglas de acumulación activas.
        </p>
      </div>

      {/* Reglas base de acumulación */}
      <SectionHeader
        icon="Coins"
        title="Reglas de acumulación base"
        description="Cómo el cliente gana puntos en cada visita o compra."
      />
      {rules?.map(rule => (
        <RuleCard
          key={rule?.id}
          title={rule?.title}
          icon={rule?.icon}
          description={rule?.description}
          active={rulesActive?.[rule?.id] !== false}
          onToggle={(v) => onToggleRule(rule?.id, v)}
        >
          {rule?.content}
        </RuleCard>
      ))}

      {/* Bonus por comportamiento */}
      <div className="pt-2">
        <SectionHeader
          icon="Zap"
          title="Bonus por comportamiento"
          description="Reglas que premian hábitos y acciones específicas del cliente."
        />
      </div>
      {bonusRules?.map(rule => (
        <RuleCard
          key={rule?.id}
          title={rule?.title}
          icon={rule?.icon}
          description={rule?.description}
          active={rulesActive?.[rule?.id] || false}
          onToggle={(v) => onToggleRule(rule?.id, v)}
        >
          {rule?.content}
        </RuleCard>
      ))}

      {/* Reglas especiales */}
      <div className="pt-2">
        <SectionHeader
          icon="Sparkles"
          title="Reglas especiales"
          description="Incentivos para comportamientos específicos que requieren módulos adicionales."
        />
      </div>
      {specialRules?.map(rule => (
        <RuleCard
          key={rule?.id}
          title={rule?.title}
          icon={rule?.icon}
          description={rule?.description}
          active={rulesActive?.[rule?.id] || false}
          onToggle={(v) => onToggleRule(rule?.id, v)}
        >
          {rule?.content}
        </RuleCard>
      ))}
    </div>
  );
};

// ─── VENCIMIENTO SUB-TAB ──────────────────────────────────────────────────────
const VencimientoSubTab = ({ config, onChange }) => {
  const policies = [
    { id: 'none', icon: 'Infinity', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'Sin vencimiento', desc: 'Los puntos nunca expiran. La opción más amigable.' },
    { id: 'time', icon: 'Clock', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: 'Vencimiento por tiempo', desc: `Cada lote de puntos vence ${config?.expiryMonths || 12} meses después de acumularse.` },
    { id: 'inactivity', icon: 'Moon', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', label: 'Vencimiento por inactividad', desc: `Los puntos solo vencen si el cliente deja de visitarte por ${config?.inactivityMonths || 12} meses.` },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <Icon name="Info" size={18} className="text-primary flex-shrink-0" />
        <p className="text-sm text-foreground">
          El vencimiento crea urgencia de canje pero también puede generar frustración si no está bien comunicado.
          El <strong>breakage</strong> (puntos que expiran sin canjear) es una ganancia implícita para el negocio.
        </p>
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Política de vencimiento</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {policies?.map(p => (
            <button
              key={p?.id}
              onClick={() => onChange('expiryPolicy', p?.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                config?.expiryPolicy === p?.id ? `border-2 ${p?.bg}` : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              <Icon name={p?.icon} size={22} className={`${p?.color} mb-2`} />
              <p className="font-semibold text-sm text-foreground mb-1">{p?.label}</p>
              <p className="text-xs text-muted-foreground">{p?.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {config?.expiryPolicy === 'time' && (
        <div className="p-4 border border-border rounded-xl">
          <label className="text-sm font-medium text-foreground block mb-2">Meses hasta vencimiento: <strong>{config?.expiryMonths || 12}</strong></label>
          <input type="range" min="3" max="24" value={config?.expiryMonths || 12}
            onChange={e => onChange('expiryMonths', parseInt(e?.target?.value))}
            className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>3 meses</span><span>24 meses</span></div>
        </div>
      )}
      {config?.expiryPolicy === 'inactivity' && (
        <div className="p-4 border border-border rounded-xl">
          <label className="text-sm font-medium text-foreground block mb-2">Meses de inactividad: <strong>{config?.inactivityMonths || 12}</strong></label>
          <input type="range" min="6" max="24" value={config?.inactivityMonths || 12}
            onChange={e => onChange('inactivityMonths', parseInt(e?.target?.value))}
            className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>6 meses</span><span>24 meses</span></div>
        </div>
      )}

      <div className="border border-border rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">Notificaciones de vencimiento</p>
        <p className="text-xs text-muted-foreground">El sistema envía avisos automáticos al usuario cuando sus puntos están por vencer.</p>
        {['30 días antes', '7 días antes', '1 día antes']?.map(n => (
          <label key={n} className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-foreground">Aviso {n}</span>
          </label>
        ))}
      </div>

      <div className="flex items-center justify-between p-4 border border-border rounded-xl">
        <div>
          <p className="text-sm font-medium text-foreground">Período de gracia post-vencimiento</p>
          <p className="text-xs text-muted-foreground">Los puntos expirados se recuperan si el cliente visita dentro del período.</p>
        </div>
        <div className="flex items-center gap-3">
          <Toggle value={config?.graceActive || false} onChange={v => onChange('graceActive', v)} />
          {config?.graceActive && (
            <div className="flex items-center gap-2">
              <input type="number" min="7" max="30" value={config?.graceDays || 14}
                onChange={e => onChange('graceDays', parseInt(e?.target?.value))}
                className="w-16 border border-border rounded px-2 py-1 text-sm bg-background text-foreground" />
              <span className="text-sm text-muted-foreground">días</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── MÉTODOS DE ACREDITACIÓN (#86) ───────────────────────────────────────────
const METHOD_DEFS = [
  {
    id: 'tpv',
    name: 'TPV (Punto de Venta)',
    icon: 'CreditCard',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    description: 'Los puntos se acreditan automáticamente al procesar el pago en el sistema TPV. El monto de la transacción se captura directamente.',
    trigger: 'Automático al cerrar venta',
    confidence: 'Muy Alta',
    confidenceColor: 'bg-emerald-100 text-emerald-700',
    requiresHardware: false,
    hardwareNote: null,
    defaultEnabled: true,
    amountSource: 'tpv',
  },
  {
    id: 'qr',
    name: 'QR en Mostrador',
    icon: 'QrCode',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    description: 'El cliente escanea el QR fijo del negocio con la app PromoClub. El cajero puede confirmar el monto si la regla de monto está activa.',
    trigger: 'Escaneo QR por cliente',
    confidence: 'Alta',
    confidenceColor: 'bg-green-100 text-green-700',
    requiresHardware: false,
    hardwareNote: null,
    defaultEnabled: true,
    amountSource: 'manual',
  },
  {
    id: 'geofence',
    name: 'Geofence Automático',
    icon: 'MapPin',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    description: 'Detecta automáticamente cuando el cliente entra al radio del negocio. No requiere acción del cliente ni del cajero.',
    trigger: 'Entrada al radio GPS',
    confidence: 'Media',
    confidenceColor: 'bg-yellow-100 text-yellow-700',
    requiresHardware: false,
    hardwareNote: null,
    defaultEnabled: true,
    amountSource: 'none',
  },
  {
    id: 'manual',
    name: 'Código Manual',
    icon: 'Keyboard',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    description: 'El cajero ingresa el código del cliente para registrar la visita manualmente. Requiere motivo y genera registro de auditoría.',
    trigger: 'Ingreso manual por cajero',
    confidence: 'Alta',
    confidenceColor: 'bg-green-100 text-green-700',
    requiresHardware: false,
    hardwareNote: null,
    defaultEnabled: true,
    amountSource: 'manual',
  },
  {
    id: 'nfc',
    name: 'NFC / Tap',
    icon: 'Wifi',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    description: 'El cliente acerca su teléfono al tag NFC del negocio. Registro instantáneo sin abrir la app.',
    trigger: 'Tap NFC del cliente',
    confidence: 'Alta',
    confidenceColor: 'bg-green-100 text-green-700',
    requiresHardware: true,
    hardwareNote: 'Requiere tag NFC programado (~$50-150 MXN c/u)',
    defaultEnabled: false,
    amountSource: 'none',
  },
  {
    id: 'beacon',
    name: 'Beacon BLE',
    icon: 'Radio',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    description: 'Registro automático sin acción del usuario mediante dispositivo beacon Bluetooth de baja energía.',
    trigger: 'Detección BLE automática',
    confidence: 'Alta',
    confidenceColor: 'bg-green-100 text-green-700',
    requiresHardware: true,
    hardwareNote: 'Requiere dispositivo beacon BLE (~$300-800 MXN)',
    defaultEnabled: false,
    amountSource: 'none',
  },
];

const MethodDetailPanel = ({ method, methodConfig, onConfigChange, rulesActive, onBack }) => {
  const cfg = methodConfig || {};
  const hasAmountRule = rulesActive?.amountAccumulation;
  const hasProductRule = rulesActive?.productAccumulation;

  const amountSourceOptions = [
    { id: 'tpv', label: 'Automático desde TPV', desc: 'El monto se captura directamente del sistema de punto de venta.', onlyFor: ['tpv'] },
    { id: 'manual', label: 'Ingreso manual por cajero', desc: 'El cajero teclea el monto durante el check-in.' },
    { id: 'none', label: 'No registrar monto', desc: 'Solo se acreditan puntos por visita, sin considerar monto.' },
  ];

  const applicableAmountOptions = amountSourceOptions?.filter(opt =>
    !opt?.onlyFor || opt?.onlyFor?.includes(method?.id)
  );

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <Icon name="ArrowLeft" size={16} />
        Volver a Métodos de Acreditación
      </button>

      <div className={`flex items-start gap-4 p-5 rounded-xl border ${method?.border} ${method?.bg}`}>
        <div className="w-12 h-12 rounded-xl bg-white/70 flex items-center justify-center flex-shrink-0">
          <Icon name={method?.icon} size={24} className={method?.color} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-bold text-foreground text-lg">{method?.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${method?.confidenceColor}`}>
              Confianza {method?.confidence}
            </span>
            {method?.requiresHardware && (
              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                Requiere hardware
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{method?.description}</p>
          <p className="text-xs text-muted-foreground mt-1"><strong>Disparador:</strong> {method?.trigger}</p>
        </div>
        <div className="flex-shrink-0">
          <Toggle value={cfg?.enabled !== false} onChange={v => onConfigChange('enabled', v)} />
        </div>
      </div>

      {method?.requiresHardware && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <Icon name="Package" size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Hardware requerido</p>
            <p className="text-xs text-amber-700 mt-0.5">{method?.hardwareNote}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div className="border border-border rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">Puntos por este método</p>
            <p className="text-xs text-muted-foreground">Configura si este método otorga un bonus adicional o un multiplicador sobre las reglas base activas.</p>
            <div className="space-y-3">
              {[
                { id: 'base', label: 'Solo reglas base', desc: 'Aplica exactamente las reglas de acumulación configuradas, sin modificación.' },
                { id: 'bonus', label: 'Bonus adicional fijo', desc: 'Suma puntos extra por usar este método específico.' },
                { id: 'multiplier', label: 'Multiplicador de puntos', desc: 'Multiplica los puntos base por un factor (ej. ×1.5).' },
              ]?.map(opt => (
                <label key={opt?.id} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                  (cfg?.bonusType || 'base') === opt?.id ? 'border-primary/40 bg-primary/5' : 'border-border hover:bg-muted/30'
                }`}>
                  <input type="radio" name={`bonusType_${method?.id}`} value={opt?.id}
                    checked={(cfg?.bonusType || 'base') === opt?.id}
                    onChange={() => onConfigChange('bonusType', opt?.id)} className="mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{opt?.label}</p>
                    <p className="text-xs text-muted-foreground">{opt?.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            {cfg?.bonusType === 'bonus' && (
              <div className="flex items-center gap-3 pt-1">
                <label className="text-sm font-medium text-foreground">Bonus extra:</label>
                <input type="number" min="1" value={cfg?.bonusPoints || 5}
                  onChange={e => onConfigChange('bonusPoints', parseInt(e?.target?.value) || 1)}
                  className="w-24 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
                <span className="text-sm text-muted-foreground">puntos</span>
                <span className="text-xs text-muted-foreground">(= ${((cfg?.bonusPoints || 5) * POINT_VALUE_MXN)?.toFixed(2)} MXN)</span>
              </div>
            )}
            {cfg?.bonusType === 'multiplier' && (
              <div className="flex items-center gap-3 pt-1">
                <label className="text-sm font-medium text-foreground">Multiplicador:</label>
                <input type="number" min="1.1" max="5" step="0.1" value={cfg?.multiplier || 1.5}
                  onChange={e => onConfigChange('multiplier', parseFloat(e?.target?.value) || 1.5)}
                  className="w-24 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
                <span className="text-sm text-muted-foreground">× puntos base</span>
              </div>
            )}
          </div>

          {(hasAmountRule || hasProductRule) && (
            <div className="border border-border rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Registro de monto de compra</p>
              <p className="text-xs text-muted-foreground">La regla de acumulación por monto está activa. Define cómo se captura el monto en este método.</p>
              {applicableAmountOptions?.map(opt => (
                <label key={opt?.id} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                  (cfg?.amountSource || method?.amountSource) === opt?.id ? 'border-primary/40 bg-primary/5' : 'border-border hover:bg-muted/30'
                }`}>
                  <input type="radio" name={`amountSource_${method?.id}`} value={opt?.id}
                    checked={(cfg?.amountSource || method?.amountSource) === opt?.id}
                    onChange={() => onConfigChange('amountSource', opt?.id)} className="mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{opt?.label}</p>
                    <p className="text-xs text-muted-foreground">{opt?.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {method?.id === 'tpv' && (
            <div className="border border-border rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Integración TPV</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Acreditar al cerrar venta</p>
                  <p className="text-xs text-muted-foreground">Los puntos se acreditan automáticamente al finalizar el cobro.</p>
                </div>
                <Toggle value={cfg?.tpvAutoCredit !== false} onChange={v => onConfigChange('tpvAutoCredit', v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Mostrar puntos en ticket</p>
                  <p className="text-xs text-muted-foreground">Imprime los puntos acreditados y saldo total en el recibo.</p>
                </div>
                <Toggle value={cfg?.showOnTicket !== false} onChange={v => onConfigChange('showOnTicket', v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Permitir canje en TPV</p>
                  <p className="text-xs text-muted-foreground">El cliente puede usar sus puntos como descuento al pagar.</p>
                </div>
                <Toggle value={cfg?.allowRedemption !== false} onChange={v => onConfigChange('allowRedemption', v)} />
              </div>
            </div>
          )}

          {method?.id === 'qr' && (
            <div className="border border-border rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Configuración QR</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">QR rotativo (anti-fraude)</p>
                  <p className="text-xs text-muted-foreground">El QR cambia cada N minutos para evitar capturas de pantalla.</p>
                </div>
                <Toggle value={cfg?.rotatingQR !== false} onChange={v => onConfigChange('rotatingQR', v)} />
              </div>
              {cfg?.rotatingQR !== false && (
                <div className="flex items-center gap-3">
                  <label className="text-sm text-muted-foreground">Rotar cada:</label>
                  <input type="number" min="1" max="60" value={cfg?.qrRotationMinutes || 5}
                    onChange={e => onConfigChange('qrRotationMinutes', parseInt(e?.target?.value) || 5)}
                    className="w-20 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
                  <span className="text-sm text-muted-foreground">minutos</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Confirmar monto con cajero</p>
                  <p className="text-xs text-muted-foreground">El cajero valida el monto antes de acreditar (si regla por monto está activa).</p>
                </div>
                <Toggle value={cfg?.requireCashierConfirm || false} onChange={v => onConfigChange('requireCashierConfirm', v)} />
              </div>
            </div>
          )}

          {method?.id === 'geofence' && (
            <div className="border border-border rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Configuración Geofence</p>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-foreground w-32">Radio (metros):</label>
                <input type="range" min="50" max="500" step="10" value={cfg?.geofenceRadius || 100}
                  onChange={e => onConfigChange('geofenceRadius', parseInt(e?.target?.value))} className="flex-1" />
                <span className="text-sm font-semibold text-foreground w-16 text-right">{cfg?.geofenceRadius || 100}m</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-foreground w-32">Tiempo mínimo:</label>
                <input type="number" min="1" max="30" value={cfg?.geofenceMinMinutes || 3}
                  onChange={e => onConfigChange('geofenceMinMinutes', parseInt(e?.target?.value) || 3)}
                  className="w-20 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
                <span className="text-sm text-muted-foreground">min dentro del radio</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Requiere confirmación del cliente</p>
                  <p className="text-xs text-muted-foreground">El cliente recibe una notificación push para confirmar el check-in.</p>
                </div>
                <Toggle value={cfg?.geofenceRequireConfirm !== false} onChange={v => onConfigChange('geofenceRequireConfirm', v)} />
              </div>
            </div>
          )}

          {method?.id === 'manual' && (
            <div className="border border-border rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Configuración Código Manual</p>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Roles con permiso</p>
                {['Owner', 'Admin', 'Cajero']?.map(role => (
                  <label key={role} className="flex items-center gap-2 text-sm cursor-pointer mb-1">
                    <input type="checkbox"
                      checked={(cfg?.allowedRoles || ['Owner', 'Admin', 'Cajero'])?.includes(role)}
                      onChange={e => {
                        const roles = cfg?.allowedRoles || ['Owner', 'Admin', 'Cajero'];
                        onConfigChange('allowedRoles', e?.target?.checked ? [...roles, role] : roles?.filter(r => r !== role));
                      }} className="rounded" />
                    <span className="text-foreground">{role}</span>
                  </label>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Requiere motivo obligatorio</p>
                  <p className="text-xs text-muted-foreground">El cajero debe seleccionar un motivo al registrar manualmente.</p>
                </div>
                <Toggle value={cfg?.requireReason !== false} onChange={v => onConfigChange('requireReason', v)} />
              </div>
            </div>
          )}

          {method?.id === 'nfc' && (
            <div className="border border-border rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Configuración NFC</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Acreditación silenciosa</p>
                  <p className="text-xs text-muted-foreground">Los puntos se acreditan sin mostrar pantalla de confirmación.</p>
                </div>
                <Toggle value={cfg?.nfcSilent || false} onChange={v => onConfigChange('nfcSilent', v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Vibración de confirmación</p>
                  <p className="text-xs text-muted-foreground">El teléfono vibra al detectar el tag NFC correctamente.</p>
                </div>
                <Toggle value={cfg?.nfcVibrate !== false} onChange={v => onConfigChange('nfcVibrate', v)} />
              </div>
            </div>
          )}

          {method?.id === 'beacon' && (
            <div className="border border-border rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Configuración Beacon BLE</p>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-foreground w-32">Potencia señal:</label>
                <select value={cfg?.beaconPower || 'medium'} onChange={e => onConfigChange('beaconPower', e?.target?.value)}
                  className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground">
                  <option value="low">Baja (~3m)</option>
                  <option value="medium">Media (~10m)</option>
                  <option value="high">Alta (~30m)</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-foreground w-32">Tiempo mínimo:</label>
                <input type="number" min="1" max="30" value={cfg?.beaconMinMinutes || 2}
                  onChange={e => onConfigChange('beaconMinMinutes', parseInt(e?.target?.value) || 2)}
                  className="w-20 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
                <span className="text-sm text-muted-foreground">min en rango</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="border border-border rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">Control anti-abuso</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Límite diario por cliente</p>
                <p className="text-xs text-muted-foreground">Máximo de acreditaciones por día por este método.</p>
              </div>
              <Toggle value={cfg?.dailyLimit !== false} onChange={v => onConfigChange('dailyLimit', v)} />
            </div>
            {cfg?.dailyLimit !== false && (
              <div className="flex items-center gap-3">
                <input type="number" min="1" max="10" value={cfg?.dailyLimitCount || 1}
                  onChange={e => onConfigChange('dailyLimitCount', parseInt(e?.target?.value) || 1)}
                  className="w-20 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
                <span className="text-sm text-muted-foreground">acreditación(es) por día</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Cooldown entre acreditaciones</p>
                <p className="text-xs text-muted-foreground">Tiempo mínimo entre dos acreditaciones del mismo cliente.</p>
              </div>
              <Toggle value={cfg?.cooldown || false} onChange={v => onConfigChange('cooldown', v)} />
            </div>
            {cfg?.cooldown && (
              <div className="flex items-center gap-3">
                <input type="number" min="1" max="1440" value={cfg?.cooldownMinutes || 60}
                  onChange={e => onConfigChange('cooldownMinutes', parseInt(e?.target?.value) || 60)}
                  className="w-24 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
                <span className="text-sm text-muted-foreground">minutos</span>
              </div>
            )}
          </div>

          <div className="border border-border rounded-xl p-4">
            <p className="text-sm font-semibold text-foreground mb-3">Flujo de acreditación</p>
            <div className="space-y-2">
              {[
                { icon: method?.icon, label: `Cliente usa ${method?.name}`, color: method?.color },
                { icon: 'Shield', label: 'Verificación anti-abuso', color: 'text-amber-600' },
                { icon: 'Calculator', label: 'Cálculo de puntos (reglas activas)', color: 'text-blue-600' },
                ...(cfg?.bonusType === 'bonus' ? [{ icon: 'Plus', label: `+${cfg?.bonusPoints || 5} pts bonus por método`, color: 'text-emerald-600' }] : []),
                ...(cfg?.bonusType === 'multiplier' ? [{ icon: 'Zap', label: `×${cfg?.multiplier || 1.5} multiplicador por método`, color: 'text-emerald-600' }] : []),
                { icon: 'CheckCircle', label: 'Puntos acreditados al cliente', color: 'text-emerald-600' },
                { icon: 'Bell', label: 'Push: "¡Ganaste X puntos!"', color: 'text-primary' },
              ]?.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
                    <Icon name={step?.icon} size={13} className={step?.color} />
                  </div>
                  <span className="text-xs text-foreground">{step?.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border rounded-xl p-4">
            <p className="text-sm font-semibold text-foreground mb-3">Estadísticas del método</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Check-ins este mes', value: method?.id === 'tpv' ? '1,847' : method?.id === 'qr' ? '1,240' : method?.id === 'geofence' ? '387' : method?.id === 'manual' ? '156' : method?.id === 'nfc' ? '89' : '0' },
                { label: 'Puntos acreditados', value: method?.id === 'tpv' ? '18,470' : method?.id === 'qr' ? '12,400' : method?.id === 'geofence' ? '3,870' : method?.id === 'manual' ? '1,560' : method?.id === 'nfc' ? '890' : '0' },
                { label: 'Clientes únicos', value: method?.id === 'tpv' ? '423' : method?.id === 'qr' ? '312' : method?.id === 'geofence' ? '198' : method?.id === 'manual' ? '87' : method?.id === 'nfc' ? '45' : '0' },
                { label: '% del total', value: method?.id === 'tpv' ? '48%' : method?.id === 'qr' ? '32%' : method?.id === 'geofence' ? '10%' : method?.id === 'manual' ? '4%' : method?.id === 'nfc' ? '2%' : '0%' },
              ]?.map(stat => (
                <div key={stat?.label} className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">{stat?.label}</p>
                  <p className="text-base font-bold text-foreground">{stat?.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MÉTODOS SUB-TAB ──────────────────────────────────────────────────────────
const MetodosSubTab = ({ config, onChange, rulesActive }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [methodConfigs, setMethodConfigs] = useState({});

  const handleMethodConfigChange = (methodId, field, value) => {
    setMethodConfigs(prev => ({
      ...prev,
      [methodId]: { ...(prev?.[methodId] || {}), [field]: value },
    }));
  };

  const getMethodEnabled = (methodId) => {
    const def = METHOD_DEFS?.find(m => m?.id === methodId);
    return methodConfigs?.[methodId]?.enabled ?? def?.defaultEnabled ?? false;
  };

  const enabledCount = METHOD_DEFS?.filter(m => getMethodEnabled(m?.id))?.length;

  if (selectedMethod) {
    const method = METHOD_DEFS?.find(m => m?.id === selectedMethod);
    return (
      <MethodDetailPanel
        method={method}
        methodConfig={methodConfigs?.[selectedMethod]}
        onConfigChange={(field, value) => handleMethodConfigChange(selectedMethod, field, value)}
        rulesActive={rulesActive}
        onBack={() => setSelectedMethod(null)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <Icon name="Zap" size={18} className="text-primary flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">Cómo funciona la acreditación</p>
          <p className="text-sm text-foreground">
            El check-in es el evento que dispara la acreditación de puntos. Cada método activo puede tener su propia configuración de bonus, multiplicador y reglas anti-abuso. Los puntos se calculan aplicando las reglas de acumulación activas (pestaña Reglas) más cualquier bonus específico del método.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <Icon name="CheckCircle" size={16} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{enabledCount} método{enabledCount !== 1 ? 's' : ''} activo{enabledCount !== 1 ? 's' : ''}</p>
            <p className="text-xs text-muted-foreground">de {METHOD_DEFS?.length} disponibles</p>
          </div>
        </div>
        <div className="h-8 w-px bg-border" />
        <p className="text-xs text-muted-foreground flex-1">
          Activa los métodos que tienes disponibles en tu negocio. Cada método puede configurarse de forma independiente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {METHOD_DEFS?.map(method => {
          const enabled = getMethodEnabled(method?.id);
          const cfg = methodConfigs?.[method?.id] || {};
          const bonusType = cfg?.bonusType || 'base';
          return (
            <div
              key={method?.id}
              className={`bg-card rounded-xl border-2 p-5 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${
                enabled ? 'border-border' : 'border-dashed border-border/60 opacity-75'
              }`}
              onClick={() => setSelectedMethod(method?.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl ${method?.bg} flex items-center justify-center`}>
                  <Icon name={method?.icon} size={22} className={method?.color} />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
                  }`}>
                    {enabled ? 'Activo' : 'Inactivo'}
                  </span>
                  <button
                    onClick={e => {
                      e?.stopPropagation();
                      handleMethodConfigChange(method?.id, 'enabled', !enabled);
                    }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      enabled ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      enabled ? 'translate-x-4' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-1">{method?.name}</h3>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-2">{method?.description}</p>
              <div className="flex items-center gap-1.5 mb-3">
                <Icon name="Zap" size={11} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{method?.trigger}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${method?.confidenceColor}`}>
                  Confianza {method?.confidence}
                </span>
                {bonusType !== 'base' && (
                  <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                    {bonusType === 'bonus' ? `+${cfg?.bonusPoints || 5}pts` : `×${cfg?.multiplier || 1.5}`}
                  </span>
                )}
              </div>
              {method?.requiresHardware && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Requiere hardware
                  </span>
                </div>
              )}
              <button
                onClick={e => { e?.stopPropagation(); setSelectedMethod(method?.id); }}
                className="mt-3 w-full py-2 text-xs font-medium border border-border text-muted-foreground rounded-lg hover:bg-muted/30 hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
              >
                <Icon name="Settings" size={12} /> Configurar
              </button>
            </div>
          );
        })}
      </div>

      <div className="border border-border rounded-xl p-4">
        <p className="text-sm font-semibold text-foreground mb-3">📊 Flujo general de acreditación</p>
        <div className="flex items-center gap-2 flex-wrap text-sm">
          {[
            'Cliente hace check-in (cualquier método activo)',
            '→',
            'Verificación anti-abuso',
            '→',
            'Cálculo de puntos (reglas base + bonus de método)',
            '→',
            'Acreditación inmediata',
            '→',
            'Push "¡Ganaste X puntos!"',
          ]?.map((step, i) => (
            <span key={i} className={
              step === '→' ? 'text-muted-foreground' : 'px-2 py-1 bg-card border border-border rounded text-foreground text-xs'
            }>{step}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── AJUSTE MANUAL (#87) ─────────────────────────────────────────────────────
const AjusteManualSubTab = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <Icon name="ShieldAlert" size={18} className="text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          Solo los roles <strong>Owner</strong> y <strong>Admin</strong> pueden realizar ajustes manuales.
          Cada ajuste genera un registro inmutable de auditoría.
        </p>
      </div>

      <p className="text-sm text-muted-foreground">
        Agrega o quita puntos manualmente del saldo de un cliente. Esta es la válvula de seguridad del programa:
        permite corregir errores, dar compensaciones, o manejar excepciones sin depender del sistema automático.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: 'AlertCircle', title: 'Error de acreditación', desc: 'El sistema no acreditó puntos por un check-in fallido.' },
          { icon: 'Heart', title: 'Compensación al cliente', desc: 'El cliente tuvo un problema y se le regalan puntos.' },
          { icon: 'Calculator', title: 'Ajuste contable', desc: 'Corrección de puntos acreditados de más o de menos.' },
          { icon: 'ArrowRightLeft', title: 'Migración de programa', desc: 'Migrar saldos de un programa de lealtad anterior.' },
          { icon: 'Star', title: 'Promoción especial', desc: 'Puntos por evento offline no registrado en el sistema.' },
          { icon: 'FileText', title: 'Otro motivo', desc: 'Cualquier otro ajuste con justificación en texto libre.' },
        ]?.map(item => (
          <div key={item?.title} className="flex items-start gap-3 p-3 border border-border rounded-lg">
            <Icon name={item?.icon} size={18} className="text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">{item?.title}</p>
              <p className="text-xs text-muted-foreground">{item?.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => navigate('/manual-validations')} iconName="ExternalLink" className="flex-1">
          Ir a Validaciones Manuales
        </Button>
      </div>

      <div className="p-4 bg-muted/30 border border-border rounded-xl">
        <p className="text-sm font-semibold text-foreground mb-2">📋 Registro de auditoría</p>
        <p className="text-xs text-muted-foreground mb-3">
          Cada ajuste manual genera un registro inmutable con: quién lo hizo, cuándo, cuántos puntos, a quién, motivo y nota interna.
          Este registro aparece en el timeline del cliente en el CRM y en el log de auditoría.
        </p>
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-2 font-medium text-muted-foreground">Fecha</th>
                <th className="text-left p-2 font-medium text-muted-foreground">Staff</th>
                <th className="text-left p-2 font-medium text-muted-foreground">Cliente</th>
                <th className="text-left p-2 font-medium text-muted-foreground">Operación</th>
                <th className="text-left p-2 font-medium text-muted-foreground">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: 'Hoy 14:32', staff: 'Carlos M.', client: 'Ana García', op: '+50 pts', reason: 'Compensación' },
                { date: 'Ayer 10:15', staff: 'Laura R.', client: 'Juan López', op: '-20 pts', reason: 'Ajuste contable' },
                { date: '03/03 09:00', staff: 'Carlos M.', client: 'María P.', op: '+100 pts', reason: 'Migración' },
              ]?.map((row, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="p-2 text-muted-foreground">{row?.date}</td>
                  <td className="p-2 text-foreground">{row?.staff}</td>
                  <td className="p-2 text-foreground">{row?.client}</td>
                  <td className="p-2">
                    <span className={`font-medium ${row?.op?.startsWith('+') ? 'text-emerald-600' : 'text-destructive'}`}>{row?.op}</span>
                  </td>
                  <td className="p-2 text-muted-foreground">{row?.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── REGLAS DE CONTROL Y LÍMITES SUB-TAB ─────────────────────────────────────
const ControlLimitesSubTab = ({ config, onChange, rulesActive, onToggleRule }) => {
  const controlRules = [
    {
      id: 'limitDaily',
      title: 'Límite máximo de puntos por día',
      icon: 'ShieldAlert',
      description: 'Tope de puntos que un cliente puede ganar en un solo día. Previene abuso con multiplicadores simultáneos.',
      content: <LimiteDiarioContent config={config} onChange={onChange} />,
    },
    {
      id: 'limitMonthly',
      title: 'Límite máximo de puntos por mes',
      icon: 'BarChart2',
      description: 'Límite mensual por cliente. Protege el presupuesto del programa.',
      content: <LimiteMensualContent config={config} onChange={onChange} />,
    },
    {
      id: 'checkinMethodPoints',
      title: 'Puntos diferenciados por método de check-in',
      icon: 'SlidersHorizontal',
      description: 'Diferente número de puntos según el método: QR, NFC, Geofence o Código manual.',
      content: <MetodoCheckinContent config={config} onChange={onChange} />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <Icon name="Shield" size={18} className="text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          Las reglas de control protegen el presupuesto del programa y previenen el abuso de multiplicadores simultáneos.
          Activa las que necesites para mantener el programa sostenible.
        </p>
      </div>

      {controlRules?.map(rule => (
        <RuleCard
          key={rule?.id}
          title={rule?.title}
          icon={rule?.icon}
          description={rule?.description}
          active={rulesActive?.[rule?.id] || false}
          onToggle={(v) => onToggleRule(rule?.id, v)}
        >
          {rule?.content}
        </RuleCard>
      ))}
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const ConfiguracionTab = ({ cheapestReward = 100 }) => {
  const [activeSubTab, setActiveSubTab] = useState('rules');
  const [config, setConfig] = useState({
    // Accumulation rules
    pointsPerVisit: 10,
    pointsForAmount: 1,
    amountFor: 5,
    roundDown: true,
    manualAmount: false,
    defaultPoints: 3,
    productRules: [],
    // Welcome
    welcomePoints: 20,
    welcomeTrigger: 'checkin',
    // Category multipliers
    categoryMultipliers: [],
    // Schedule multipliers
    scheduleMultipliers: [],
    // Streak
    streakSteps: DEFAULT_STREAK,
    streakWindow: 7,
    streakReset: false,
    // Milestones
    milestones: DEFAULT_MILESTONES,
    // Expiry
    expiryPolicy: 'none',
    expiryMonths: 12,
    inactivityMonths: 12,
    graceActive: false,
    graceDays: 14,
    // Methods
    autoCheckin: true,
    amountMode: 'manual',
    // Bonus behavior
    birthdayPoints: 50,
    referralPoints: 100,
    reviewPoints: 25,
    reviewLimitPerMonth: 1,
    reservationPoints: 30,
    profileCompletePoints: 75,
    // Control limits
    limitDailyPoints: 200,
    limitMonthlyPoints: 2000,
    checkinMethodPoints: { qr: 10, nfc: 15, geofence: 5, manual: 5 },
    // Special rules
    newProductPoints: 50,
    prepaidReloadPointsPer100: 10,
    groupVisitMinPeople: 3,
    groupVisitBonusPoints: 50,
  });

  // Rules active state
  const [rulesActive, setRulesActive] = useState({
    visitAccumulation: true,
    amountAccumulation: false,
    productAccumulation: false,
    welcome: true,
    categoryMultiplier: false,
    scheduleMultiplier: false,
    // Bonus behavior
    bonusStreak: false,
    bonusMilestones: false,
    bonusBirthday: false,
    bonusReferral: false,
    bonusReview: false,
    bonusReservation: false,
    bonusProfileComplete: false,
    // Control
    limitDaily: false,
    limitMonthly: false,
    checkinMethodPoints: false,
    // Special
    specialNewProduct: false,
    specialPrepaidReload: false,
    specialFirstVisitMonth: false,
    specialGroupVisit: false,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (field, value) => setConfig(prev => ({ ...prev, [field]: value }));

  const handleToggleRule = (ruleId, value) => {
    setRulesActive(prev => ({ ...prev, [ruleId]: value }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'rules':
        return (
          <ReglasSubTab
            config={config}
            onChange={handleChange}
            rulesActive={rulesActive}
            onToggleRule={handleToggleRule}
            cheapestReward={cheapestReward}
          />
        );
      case 'expiry':
        return <VencimientoSubTab config={config} onChange={handleChange} />;
      case 'methods':
        return <MetodosSubTab config={config} onChange={handleChange} rulesActive={rulesActive} />;
      case 'adjustment':
        return <AjusteManualSubTab />;
      case 'control':
        return (
          <ControlLimitesSubTab
            config={config}
            onChange={handleChange}
            rulesActive={rulesActive}
            onToggleRule={handleToggleRule}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Global rule banner - Regla global style */}
      <div className="flex items-center gap-3 p-4 bg-blue-50/70 border border-blue-200 border-l-4 border-l-blue-500 rounded-r-xl">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon name="Shield" size={16} className="text-blue-600" />
        </div>
        <p className="text-sm text-blue-900">
          <strong className="font-bold">Regla global PromoClub:</strong> Por cada <strong>$5 MXN</strong> de compra registrados = <strong>1 punto</strong> · Cada punto equivale a <strong>$0.15 MXN</strong>
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="flex border-b border-border bg-muted/20 overflow-x-auto">
          {SUB_TABS?.map(tab => (
            <button
              key={tab?.id}
              onClick={() => setActiveSubTab(tab?.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeSubTab === tab?.id
                  ? 'border-primary text-primary bg-card' :'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              <Icon name={tab?.icon} size={15} />
              {tab?.label}
            </button>
          ))}
        </div>
        <div className="p-5 bg-card">
          {renderSubTabContent()}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} iconName={saved ? 'Check' : 'Save'}>
          {saved ? 'Configuración guardada' : 'Guardar configuración'}
        </Button>
      </div>
    </div>
  );
};

export default ConfiguracionTab;
