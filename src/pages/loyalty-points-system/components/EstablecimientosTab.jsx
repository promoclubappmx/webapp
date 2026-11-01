import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_ESTABLISHMENTS = [
  { id: 'est-1', name: 'Sucursal Centro', address: 'Av. Juárez 120, Col. Centro', type: 'Restaurante', active: true },
  { id: 'est-2', name: 'Sucursal Norte', address: 'Blvd. Díaz Ordaz 450, Col. Cumbres', type: 'Restaurante', active: true },
  { id: 'est-3', name: 'Sucursal Sur', address: 'Av. Insurgentes 890, Col. Del Valle', type: 'Restaurante', active: false },
  { id: 'est-4', name: 'Sucursal Aeropuerto', address: 'Terminal 2, Local B-12', type: 'Express', active: true },
  { id: 'est-5', name: 'Sucursal Polanco', address: 'Presidente Masaryk 340, Polanco', type: 'Restaurante', active: false },
];

const MOCK_RULES = [
  { id: 'rule-base', label: 'Acumulación base ($5 = 1 pto)', icon: 'Coins', color: 'text-blue-600', bg: 'bg-blue-50', active: true, type: 'base' },
  { id: 'rule-streak', label: 'Bonus por racha de visitas', icon: 'Flame', color: 'text-orange-600', bg: 'bg-orange-50', active: true, type: 'bonus' },
  { id: 'rule-birthday', label: 'Puntos por cumpleaños', icon: 'Cake', color: 'text-pink-600', bg: 'bg-pink-50', active: true, type: 'bonus' },
  { id: 'rule-milestone', label: 'Hitos de visitas', icon: 'Trophy', color: 'text-amber-600', bg: 'bg-amber-50', active: false, type: 'bonus' },
  { id: 'rule-referral', label: 'Puntos por referido exitoso', icon: 'Users', color: 'text-violet-600', bg: 'bg-violet-50', active: false, type: 'bonus' },
  { id: 'rule-review', label: 'Puntos por reseña verificada', icon: 'Star', color: 'text-yellow-600', bg: 'bg-yellow-50', active: false, type: 'bonus' },
  { id: 'rule-reservation', label: 'Puntos por reservación cumplida', icon: 'CalendarCheck', color: 'text-emerald-600', bg: 'bg-emerald-50', active: false, type: 'especial' },
  { id: 'rule-firstmonth', label: 'Puntos dobles primera visita del mes', icon: 'Zap', color: 'text-cyan-600', bg: 'bg-cyan-50', active: false, type: 'especial' },
];

// ─── ESTABLISHMENT CARD ───────────────────────────────────────────────────────
const EstablishmentCard = ({ est, programActive, onToggleProgram, ruleOverrides, onToggleRule, activeRules }) => {
  const [expanded, setExpanded] = useState(false);
  const activeCount = activeRules?.filter(r => {
    const override = ruleOverrides?.[r?.id];
    return override !== undefined ? override : r?.active;
  })?.length || 0;

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${programActive ? 'border-border bg-card' : 'border-border/50 bg-muted/20 opacity-70'}`}>
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${programActive ? 'bg-primary/10' : 'bg-muted'}`}>
          <Icon name="Store" size={18} className={programActive ? 'text-primary' : 'text-muted-foreground'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-foreground text-sm truncate">{est?.name}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${programActive ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
              {programActive ? 'Programa activo' : 'Programa inactivo'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{est?.address}</p>
          {programActive && (
            <p className="text-xs text-primary mt-0.5">{activeCount} regla(s) activa(s)</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {programActive && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <Icon name={expanded ? 'ChevronUp' : 'ChevronDown'} size={14} />
              <span className="hidden sm:inline">Reglas</span>
            </button>
          )}
          {/* Toggle program */}
          <button
            onClick={() => onToggleProgram(est?.id)}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${programActive ? 'bg-primary' : 'bg-muted-foreground/30'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${programActive ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Expanded rules per establishment */}
      {expanded && programActive && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Reglas activas en este establecimiento</p>
          <div className="space-y-2">
            {activeRules?.map(rule => {
              const override = ruleOverrides?.[rule?.id];
              const isActive = override !== undefined ? override : rule?.active;
              return (
                <div key={rule?.id} className={`flex items-center gap-3 p-2.5 rounded-lg border ${isActive ? 'border-border bg-muted/20' : 'border-border/40 bg-muted/10 opacity-60'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${rule?.bg}`}>
                    <Icon name={rule?.icon} size={13} className={rule?.color} />
                  </div>
                  <p className="text-xs text-foreground flex-1">{rule?.label}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${rule?.type === 'base' ? 'bg-blue-100 text-blue-700' : rule?.type === 'bonus' ? 'bg-amber-100 text-amber-700' : 'bg-violet-100 text-violet-700'}`}>
                    {rule?.type}
                  </span>
                  <button
                    onClick={() => onToggleRule(est?.id, rule?.id, !isActive)}
                    className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${isActive ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${isActive ? 'left-4' : 'left-0.5'}`} />
                  </button>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground italic mt-2">
            Solo se muestran las reglas con estado activo en la configuración global. Puedes desactivarlas individualmente por establecimiento.
          </p>
        </div>
      )}
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const EstablecimientosTab = () => {
  const [establishments, setEstablishments] = useState(MOCK_ESTABLISHMENTS);
  const [programStatus, setProgramStatus] = useState(() => {
    const init = {};
    MOCK_ESTABLISHMENTS?.forEach(e => { init[e?.id] = e?.active; });
    return init;
  });
  const [ruleOverrides, setRuleOverrides] = useState({});
  const [selectedRule, setSelectedRule] = useState('all');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const activeRules = MOCK_RULES?.filter(r => r?.active);

  const handleToggleProgram = (estId) => {
    setProgramStatus(prev => ({ ...prev, [estId]: !prev?.[estId] }));
  };

  const handleToggleRule = (estId, ruleId, value) => {
    setRuleOverrides(prev => ({
      ...prev,
      [estId]: { ...(prev?.[estId] || {}), [ruleId]: value },
    }));
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const activeCount = Object.values(programStatus)?.filter(Boolean)?.length;
  const totalCount = establishments?.length;

  // Filter by rule
  const filteredEstablishments = selectedRule === 'all'
    ? establishments
    : establishments?.filter(est => {
        if (!programStatus?.[est?.id]) return false;
        const rule = MOCK_RULES?.find(r => r?.id === selectedRule);
        if (!rule) return false;
        const override = ruleOverrides?.[est?.id]?.[selectedRule];
        return override !== undefined ? override : rule?.active;
      });

  return (
    <div className="space-y-6">
      {/* Header summary */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon name="MapPin" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Establecimientos en el programa</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Elige en qué establecimientos aplica el programa de puntos y qué reglas están activas en cada uno.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-primary">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Con programa activo</p>
          </div>
          <div className="bg-muted/30 border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{totalCount - activeCount}</p>
            <p className="text-xs text-muted-foreground">Sin programa</p>
          </div>
          <div className="bg-muted/30 border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{totalCount}</p>
            <p className="text-xs text-muted-foreground">Total establecimientos</p>
          </div>
        </div>
      </div>
      {/* Filter by rule */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Icon name="Filter" size={16} className="text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Consultar por regla activa</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedRule('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${selectedRule === 'all' ? 'bg-primary text-white border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/40'}`}
          >
            Todos los establecimientos
          </button>
          {MOCK_RULES?.filter(r => r?.active)?.map(rule => (
            <button
              key={rule?.id}
              onClick={() => setSelectedRule(rule?.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${selectedRule === rule?.id ? 'bg-primary text-white border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/40'}`}
            >
              <Icon name={rule?.icon} size={11} />
              {rule?.label}
            </button>
          ))}
        </div>
        {selectedRule !== 'all' && (
          <p className="text-xs text-muted-foreground">
            Mostrando establecimientos donde la regla <strong className="text-foreground">{MOCK_RULES?.find(r => r?.id === selectedRule)?.label}</strong> está activa.
          </p>
        )}
      </div>
      {/* Active rules reference */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Icon name="Star" size={16} className="text-amber-500" />
          <p className="text-sm font-semibold text-foreground">Reglas activas en el programa</p>
          <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">{activeRules?.length} activas</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {MOCK_RULES?.map(rule => (
            <div
              key={rule?.id}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border ${rule?.active ? `${rule?.bg} border-transparent` : 'bg-muted/30 border-border opacity-50'}`}
            >
              <Icon name={rule?.icon} size={11} className={rule?.active ? rule?.color : 'text-muted-foreground'} />
              <span className={rule?.active ? rule?.color : 'text-muted-foreground'}>{rule?.label}</span>
              {!rule?.active && <span className="text-[10px] text-muted-foreground">(inactiva)</span>}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground italic">Las reglas inactivas no se pueden activar por establecimiento. Actívalas primero en la pestaña Reglas de acumulación.</p>
      </div>
      {/* Establishments list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">
            {filteredEstablishments?.length} establecimiento(s)
            {selectedRule !== 'all' && ' con esta regla activa'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const newStatus = {};
                establishments?.forEach(e => { newStatus[e?.id] = true; });
                setProgramStatus(newStatus);
              }}
              className="text-xs px-3 py-1.5 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              Activar todos
            </button>
            <button
              onClick={() => {
                const newStatus = {};
                establishments?.forEach(e => { newStatus[e?.id] = false; });
                setProgramStatus(newStatus);
              }}
              className="text-xs px-3 py-1.5 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              Desactivar todos
            </button>
          </div>
        </div>

        {filteredEstablishments?.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Icon name="Store" size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Ningún establecimiento tiene esta regla activa.</p>
          </div>
        ) : (
          filteredEstablishments?.map(est => (
            <EstablishmentCard
              key={est?.id}
              est={est}
              programActive={programStatus?.[est?.id] ?? est?.active}
              onToggleProgram={handleToggleProgram}
              ruleOverrides={ruleOverrides?.[est?.id] || {}}
              onToggleRule={handleToggleRule}
              activeRules={activeRules}
            />
          ))
        )}
      </div>
      {/* Save */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {saveSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
            <Icon name="CheckCircle" size={14} className="text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">Configuración guardada</span>
          </div>
        )}
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          <Icon name="Save" size={16} />
          Guardar configuración
        </button>
      </div>
    </div>
  );
};

export default EstablecimientosTab;
