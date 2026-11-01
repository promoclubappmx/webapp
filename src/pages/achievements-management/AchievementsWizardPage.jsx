import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const WIZARD_STEPS = [
  { id: 'general', label: 'General', icon: 'Settings2', description: 'Activación y comportamiento del sistema' },
  { id: 'catalogo', label: 'Catálogo', icon: 'Trophy', description: 'Activa o desactiva logros por categoría' },
  { id: 'recompensas', label: 'Recompensas', icon: 'Gift', description: 'Puntos y beneficios por logro' },
  { id: 'notificaciones', label: 'Notificaciones', icon: 'Bell', description: 'Mensajes de celebración y alertas' },
];

const CATALOG_CATEGORIES = [
  {
    id: 'visitas', label: 'Visitas', icon: '📍',
    achievements: [
      { id: 'v1', name: 'Primer paso', emoji: '🌱', rarity: 'comun', condition: '1 visita' },
      { id: 'v2', name: 'Primera decena', emoji: '🥉', rarity: 'comun', condition: '10 visitas' },
      { id: 'v3', name: 'Cliente frecuente', emoji: '🥈', rarity: 'raro', condition: '25 visitas' },
      { id: 'v4', name: 'Fan del negocio', emoji: '🥇', rarity: 'epico', condition: '50 visitas' },
      { id: 'v5', name: 'Centenario', emoji: '💯', rarity: 'epico', condition: '100 visitas' },
      { id: 'v6', name: 'Leyenda', emoji: '👑', rarity: 'legendario', condition: '200 visitas' },
    ],
  },
  {
    id: 'antiguedad', label: 'Antigüedad', icon: '📅',
    achievements: [
      { id: 'a1', name: 'Primer mes', emoji: '🌙', rarity: 'comun', condition: '30 días' },
      { id: 'a2', name: 'Aniversario', emoji: '🌟', rarity: 'epico', condition: '365 días' },
      { id: 'a3', name: 'Cliente de 2 años', emoji: '🔥', rarity: 'epico', condition: '730 días' },
      { id: 'a4', name: 'Cliente de 3 años', emoji: '🔮', rarity: 'legendario', condition: '1095 días' },
      { id: 'a5', name: 'Fundador', emoji: '🏛️', rarity: 'unico', condition: 'Especial' },
    ],
  },
  {
    id: 'social', label: 'Social', icon: '👥',
    achievements: [
      { id: 's1', name: 'Primer referido', emoji: '🤝', rarity: 'comun', condition: '1 referido' },
      { id: 's2', name: 'Conector', emoji: '🌐', rarity: 'raro', condition: '3 referidos' },
      { id: 's3', name: 'Embajador', emoji: '🦋', rarity: 'epico', condition: '5 referidos' },
      { id: 's4', name: 'Influencer local', emoji: '📡', rarity: 'legendario', condition: '10 referidos' },
      { id: 's5', name: 'Crítico verificado', emoji: '⭐', rarity: 'comun', condition: '3 reseñas' },
      { id: 's6', name: 'Voz del barrio', emoji: '🎙️', rarity: 'raro', condition: '10 reseñas' },
      { id: 's7', name: 'Promotor', emoji: '💬', rarity: 'raro', condition: '3 NPS 9-10' },
    ],
  },
  {
    id: 'lealtad', label: 'Lealtad', icon: '🎯',
    achievements: [
      { id: 'l1', name: 'Primera punch card', emoji: '🎴', rarity: 'comun', condition: '1 punch card' },
      { id: 'l2', name: 'Coleccionista', emoji: '🗂️', rarity: 'raro', condition: '3 punch cards' },
      { id: 'l3', name: 'Súper fan', emoji: '🏆', rarity: 'legendario', condition: '10 punch cards' },
      { id: 'l4', name: 'Gran canjeador', emoji: '💸', rarity: 'comun', condition: '5 canjes' },
      { id: 'l5', name: 'Miembro VIP', emoji: '👑', rarity: 'epico', condition: '3 meses Oro' },
      { id: 'l6', name: 'Miembro recurrente', emoji: '🔄', rarity: 'epico', condition: '3 renovaciones' },
    ],
  },
  {
    id: 'momentos', label: 'Momentos', icon: '✨',
    achievements: [
      { id: 'm1', name: 'Cumpleañero', emoji: '🎂', rarity: 'raro', condition: 'Visita en cumpleaños' },
      { id: 'm2', name: 'Madrugador', emoji: '🌅', rarity: 'raro', condition: '5 visitas antes 8AM' },
      { id: 'm3', name: 'Noctámbulo', emoji: '🌙', rarity: 'raro', condition: '5 visitas después 9PM' },
      { id: 'm4', name: 'Rey del día', emoji: '👑', rarity: 'epico', condition: '10 veces mismo día' },
      { id: 'm5', name: 'Sin falta', emoji: '✅', rarity: 'raro', condition: '10 reservas sin no-show' },
      { id: 'm6', name: 'Flash lover', emoji: '⚡', rarity: 'comun', condition: '3 flash deals' },
    ],
  },
  {
    id: 'ecosistema', label: 'Ecosistema', icon: '📱',
    achievements: [
      { id: 'e1', name: 'Digital total', emoji: '📱', rarity: 'comun', condition: '3 métodos check-in' },
      { id: 'e2', name: 'Pagador digital', emoji: '💳', rarity: 'raro', condition: '5 pagos prepago' },
      { id: 'e3', name: 'Recargador frecuente', emoji: '🔋', rarity: 'comun', condition: '3 recargas' },
      { id: 'e4', name: 'Perfil completo', emoji: '✨', rarity: 'comun', condition: 'Perfil 100%' },
      { id: 'e5', name: 'Reservador confiable', emoji: '📅', rarity: 'raro', condition: '5 reservas sin cancelar' },
      { id: 'e6', name: 'Early adopter', emoji: '🚀', rarity: 'unico', condition: 'Registro temprano' },
    ],
  },
];

const RARITY_CONFIG = [
  { key: 'comun', label: 'Común', emoji: '⚪', color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200', ring: 'ring-gray-300', badgeClass: 'bg-gray-100 text-gray-600' },
  { key: 'raro', label: 'Raro', emoji: '🔵', color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200', ring: 'ring-blue-300', badgeClass: 'bg-blue-100 text-blue-600' },
  { key: 'epico', label: 'Épico', emoji: '🟣', color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200', ring: 'ring-purple-300', badgeClass: 'bg-purple-100 text-purple-600' },
  { key: 'legendario', label: 'Legendario', emoji: '🟡', color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200', ring: 'ring-amber-300', badgeClass: 'bg-amber-100 text-amber-600' },
  { key: 'unico', label: 'Único', emoji: '🔴', color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-200', ring: 'ring-rose-300', badgeClass: 'bg-rose-100 text-rose-600' },
];

const RARITY_COLORS = {
  comun: 'bg-gray-100 text-gray-600',
  raro: 'bg-blue-100 text-blue-600',
  epico: 'bg-purple-100 text-purple-600',
  legendario: 'bg-amber-100 text-amber-600',
  unico: 'bg-rose-100 text-rose-600',
};

const RARITY_BORDER = {
  comun: 'border-gray-200',
  raro: 'border-blue-200',
  epico: 'border-purple-200',
  legendario: 'border-amber-200',
  unico: 'border-rose-200',
};

const AVAILABLE_ICONS = [
  '🏆','🥇','🥈','🥉','⭐','🌟','💫','✨','🎯','🎖️',
  '🏅','🎗️','🔥','💎','👑','🦁','🦋','🚀','⚡','🌈',
  '🎪','🎠','🎡','🎢','🎭','🎨','🎬','🎤','🎵','🎶',
  '🌺','🌸','🌼','🌻','🍀','🌿','🌱','🌳','🦄','🐉',
  '💪','🤝','👏','🙌','✌️','🤞','💡','🔑','🗝️','🎁',
  '🎀','🎊','🎉','🎈','🎆','🎇','🧨','🪄','🔮','🧿',
  '🦅','🦉','🦚','🦜','🐬','🐋','🦈','🦊','🐺','🦝',
  '🍕','🍔','🍣','🍜','🍩','🍪','🎂','🍰','🧁','🍫',
  '⚽','🏀','🏈','⚾','🎾','🏐','🏉','🎱','🏓','🥊',
  '🚗','✈️','🚀','🛸','⛵','🚂','🏍️','🚁','🛺','🚀',
  '🌍','🌊','🏔️','🌋','🏝️','🌅','🌄','🌠','🌌','🌙',
  '💰','💵','💴','💶','💷','💸','🏦','💳','🪙','💹',
  '🔬','🔭','🧬','⚗️','🧪','🧫','💊','🩺','🩻','🧲',
  '📚','📖','✏️','🖊️','📝','📋','📌','📍','🗂️','📁',
  '🏠','🏰','🏯','🗼','🗽','⛩️','🕌','🕍','⛪','🏛️',
  '🎮','🕹️','🎲','🎰','🃏','🀄','🎴','🧩','🪀','🪁',
  '🌹','🌷','💐','🌾','🍁','🍂','🍃','🌵','🎋','🎍',
  '🦋','🐝','🐞','🦗','🕷️','🦂','🐛','🦟','🪲','🪳',
  '🧠','👁️','👂','👃','🫀','🫁','🦷','🦴','💀','👻',
];

// Criteria types for custom achievements
const CRITERIA_TYPES = [
  { id: 'visitas', label: 'Visitas', icon: '📍', description: 'Número de visitas al establecimiento', unit: 'visitas' },
  { id: 'referidos', label: 'Referidos', icon: '🤝', description: 'Clientes referidos exitosamente', unit: 'referidos' },
  { id: 'resenas', label: 'Reseñas', icon: '⭐', description: 'Reseñas publicadas', unit: 'reseñas' },
  { id: 'antiguedad', label: 'Antigüedad', icon: '📅', description: 'Días como cliente registrado', unit: 'días' },
  { id: 'lealtad', label: 'Lealtad (Punch Cards)', icon: '🎴', description: 'Tarjetas de sellos completadas', unit: 'punch cards completadas' },
  { id: 'cupones', label: 'Cupones canjeados', icon: '🎟️', description: 'Cupones canjeados en el negocio', unit: 'cupones canjeados' },
  { id: 'promociones', label: 'Promociones canjeadas', icon: '🏷️', description: 'Promociones aprovechadas', unit: 'promociones canjeadas' },
  { id: 'horario', label: 'Visita a ciertas horas', icon: '🕐', description: 'Visitas en un rango de horario específico', unit: 'visitas en horario' },
];

const Toggle = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-primary' : 'bg-muted'}`}
  >
    <span
      className="absolute w-4 h-4 bg-white rounded-full shadow transition-all"
      style={{ left: value ? '24px' : '2px', top: '4px', transition: 'left 0.2s' }}
    />
  </button>
);

// ─── STEP 1: GENERAL ──────────────────────────────────────────────────────────
const StepGeneral = ({ config, onChange }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
      <span className="text-2xl">🏆</span>
      <p className="text-sm text-amber-800">
        Los <strong>Logros</strong> son badges permanentes que tus clientes coleccionan a lo largo de su relación contigo.
        A diferencia de las rachas, los logros no se pierden una vez obtenidos.
      </p>
    </div>
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="bg-muted/50 px-4 py-3">
        <p className="text-sm font-semibold text-foreground">Comportamiento del sistema</p>
        <p className="text-xs text-muted-foreground mt-0.5">Cómo se evalúan y entregan los logros</p>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Evaluación automática en tiempo real</p>
            <p className="text-xs text-muted-foreground mt-0.5">Los logros se evalúan automáticamente en cada visita, compra o acción del cliente.</p>
          </div>
          <Toggle value={config?.autoEval !== false} onChange={v => onChange('autoEval', v)} />
        </div>
        <div className="border-t border-border pt-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Conservar logros al desactivar el sistema</p>
            <p className="text-xs text-muted-foreground mt-0.5">Los logros ya obtenidos por los clientes se conservan aunque el sistema esté inactivo.</p>
          </div>
          <Toggle value={config?.preserveOnDeactivate !== false} onChange={v => onChange('preserveOnDeactivate', v)} />
        </div>
        <div className="border-t border-border pt-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Mostrar logros en perfil del cliente</p>
            <p className="text-xs text-muted-foreground mt-0.5">Los clientes pueden ver sus logros en la app B2C.</p>
          </div>
          <Toggle value={config?.showInProfile !== false} onChange={v => onChange('showInProfile', v)} />
        </div>
      </div>
    </div>
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="bg-muted/50 px-4 py-3">
        <p className="text-sm font-semibold text-foreground">Notificación de proximidad al logro</p>
        <p className="text-xs text-muted-foreground mt-0.5">Avisa al cliente cuando está cerca de desbloquear un logro.</p>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Notificar cuando el cliente está cerca de un logro</p>
            <p className="text-xs text-muted-foreground mt-0.5">Envía push automático cuando el cliente está a pocos pasos de desbloquear.</p>
          </div>
          <Toggle value={config?.nearNotify !== false} onChange={v => onChange('nearNotify', v)} />
        </div>
        {config?.nearNotify !== false && (
          <div className="pl-4 border-l-2 border-primary/30">
            <label className="text-sm font-medium text-foreground block mb-2">Notificar cuando falten:</label>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 5]?.map(n => (
                <button
                  key={n}
                  onClick={() => onChange('nearThreshold', n)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${(config?.nearThreshold || 3) === n ? 'bg-primary text-white border-primary' : 'border-border text-foreground hover:bg-muted/30'}`}
                >
                  {n} {n === 1 ? 'paso' : 'pasos'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

// ─── CRITERIA CONFIG FIELDS ───────────────────────────────────────────────────
const CriteriaConfigFields = ({ criteriaType, value, onChange }) => {
  if (criteriaType === 'horario') {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Hora inicio</label>
            <input
              type="time"
              value={value?.startTime || ''}
              onChange={e => onChange({ ...value, startTime: e?.target?.value })}
              className="w-full border border-border rounded-lg px-2.5 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Hora fin</label>
            <input
              type="time"
              value={value?.endTime || ''}
              onChange={e => onChange({ ...value, endTime: e?.target?.value })}
              className="w-full border border-border rounded-lg px-2.5 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Visitas requeridas en ese horario</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              placeholder="Ej: 5"
              value={value?.count || ''}
              onChange={e => onChange({ ...value, count: e?.target?.value })}
              className="w-28 border border-border rounded-lg px-2.5 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <span className="text-sm text-muted-foreground">visitas en ese horario</span>
          </div>
        </div>
      </div>
    );
  }

  const ct = CRITERIA_TYPES?.find(c => c?.id === criteriaType);
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="1"
        placeholder="Ej: 10"
        value={value?.count || ''}
        onChange={e => onChange({ ...value, count: e?.target?.value })}
        className="w-28 border border-border rounded-lg px-2.5 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <span className="text-sm text-muted-foreground">{ct?.unit || 'para desbloquear'}</span>
    </div>
  );
};

// Helper to build condition label for preview
const buildConditionLabel = (criteriaType, criteriaValue) => {
  if (!criteriaType || !criteriaValue) return '';
  if (criteriaType === 'horario') {
    const { startTime, endTime, count } = criteriaValue || {};
    if (count && startTime && endTime) return `${count} visitas entre ${startTime} y ${endTime}`;
    return '';
  }
  const ct = CRITERIA_TYPES?.find(c => c?.id === criteriaType);
  return criteriaValue?.count ? `${criteriaValue?.count} ${ct?.unit || ''}` : '';
};

// ─── STEP 2: CATÁLOGO ─────────────────────────────────────────────────────────
const StepCatalogo = ({ config, onChange }) => {
  const [achievements, setAchievements] = useState(() => {
    const map = {};
    CATALOG_CATEGORIES?.forEach(cat => cat?.achievements?.forEach(a => { map[a.id] = false; }));
    return map;
  });
  const [collapsed, setCollapsed] = useState({});
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customAchievements, setCustomAchievements] = useState([]);
  const [newCustom, setNewCustom] = useState({
    name: '', emoji: '🏆', rarity: 'comun',
    criteriaType: 'visitas', criteriaValue: { count: '' },
  });
  const [showIconPicker, setShowIconPicker] = useState(false);

  const toggleAch = (id) => {
    const next = { ...achievements, [id]: !achievements?.[id] };
    setAchievements(next);
    onChange('achievements', next);
  };

  const toggleAll = (catId, val) => {
    const cat = CATALOG_CATEGORIES?.find(c => c?.id === catId);
    const next = { ...achievements };
    cat?.achievements?.forEach(a => { next[a.id] = val; });
    setAchievements(next);
    onChange('achievements', next);
  };

  const addCustomAchievement = () => {
    const conditionLabel = buildConditionLabel(newCustom?.criteriaType, newCustom?.criteriaValue);
    if (!newCustom?.name || !conditionLabel) return;
    const id = `custom_${Date.now()}`;
    const created = { ...newCustom, id, isCustom: true, condition: conditionLabel };
    const updated = [...customAchievements, created];
    setCustomAchievements(updated);
    const nextAch = { ...achievements, [id]: true };
    setAchievements(nextAch);
    onChange('achievements', nextAch);
    onChange('customAchievements', updated);
    setNewCustom({ name: '', emoji: '🏆', rarity: 'comun', criteriaType: 'visitas', criteriaValue: { count: '' } });
    setShowCustomForm(false);
  };

  const removeCustom = (id) => {
    const updated = customAchievements?.filter(a => a?.id !== id);
    setCustomAchievements(updated);
    const nextAch = { ...achievements };
    delete nextAch?.[id];
    setAchievements(nextAch);
    onChange('achievements', nextAch);
    onChange('customAchievements', updated);
  };

  const selectedCatalog = CATALOG_CATEGORIES?.flatMap(cat =>
    cat?.achievements?.filter(a => achievements?.[a?.id])
  );
  const selectedCustom = customAchievements?.filter(a => achievements?.[a?.id]);
  const allSelected = [...selectedCatalog, ...selectedCustom];

  const conditionPreview = buildConditionLabel(newCustom?.criteriaType, newCustom?.criteriaValue);
  const selectedCriteriaInfo = CRITERIA_TYPES?.find(c => c?.id === newCustom?.criteriaType);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
        <Icon name="Info" size={16} className="text-blue-600 flex-shrink-0" />
        <p className="text-sm text-blue-800">Selecciona los logros que deseas activar. Ninguno está seleccionado por defecto — elige los que aplican a tu negocio.</p>
      </div>
      {/* Catalog categories */}
      {CATALOG_CATEGORIES?.map(cat => {
        const activeCount = cat?.achievements?.filter(a => achievements?.[a?.id])?.length;
        const isCollapsed = collapsed?.[cat?.id];
        return (
          <div key={cat?.id} className="border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
              <button
                onClick={() => setCollapsed(prev => ({ ...prev, [cat?.id]: !prev?.[cat?.id] }))}
                className="flex items-center gap-2 flex-1 min-w-0"
              >
                <span className="text-lg flex-shrink-0">{cat?.icon}</span>
                <span className="font-semibold text-foreground text-sm">{cat?.label}</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex-shrink-0">
                  {activeCount}/{cat?.achievements?.length} seleccionados
                </span>
                <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronDown'} size={14} className="text-muted-foreground flex-shrink-0" />
              </button>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <button onClick={() => toggleAll(cat?.id, true)} className="text-xs text-primary hover:underline">Todos</button>
                <span className="text-muted-foreground text-xs">·</span>
                <button onClick={() => toggleAll(cat?.id, false)} className="text-xs text-muted-foreground hover:text-foreground hover:underline">Ninguno</button>
              </div>
            </div>
            {!isCollapsed && (
              <div className="divide-y divide-border">
                {cat?.achievements?.map(ach => (
                  <div
                    key={ach?.id}
                    onClick={() => toggleAch(ach?.id)}
                    className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${achievements?.[ach?.id] ? 'bg-primary/5' : 'hover:bg-muted/10'}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl flex-shrink-0">{ach?.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{ach?.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${RARITY_COLORS?.[ach?.rarity]}`}>
                            {ach?.rarity?.charAt(0)?.toUpperCase() + ach?.rarity?.slice(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">{ach?.condition}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-3">
                      <Toggle value={achievements?.[ach?.id] || false} onChange={() => toggleAch(ach?.id)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {/* Custom achievements section */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-lg">✏️</span>
            <span className="font-semibold text-foreground text-sm">Logros personalizados</span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{customAchievements?.length} creados</span>
          </div>
          <button
            onClick={() => setShowCustomForm(!showCustomForm)}
            className="flex items-center gap-1.5 text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Icon name="Plus" size={12} />
            Crear logro
          </button>
        </div>

        {showCustomForm && (
          <div className="p-4 border-b border-border bg-muted/10 space-y-4">
            <p className="text-sm font-semibold text-foreground">Nuevo logro personalizado</p>

            {/* Icon picker */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">Ícono del logro</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="w-12 h-12 text-2xl border-2 border-dashed border-border rounded-xl flex items-center justify-center hover:border-primary transition-colors"
                >
                  {newCustom?.emoji}
                </button>
                <span className="text-xs text-muted-foreground">Haz clic para elegir un ícono</span>
              </div>
              {showIconPicker && (
                <div className="mt-2 p-3 border border-border rounded-xl bg-card">
                  <div className="grid grid-cols-10 gap-1">
                    {AVAILABLE_ICONS?.map(icon => (
                      <button
                        key={icon}
                        onClick={() => { setNewCustom(p => ({ ...p, emoji: icon })); setShowIconPicker(false); }}
                        className={`w-8 h-8 text-lg rounded-lg flex items-center justify-center hover:bg-muted transition-colors ${newCustom?.emoji === icon ? 'bg-primary/10 ring-1 ring-primary' : ''}`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Nombre del logro *</label>
              <input
                type="text"
                placeholder="Ej: Cliente estrella"
                value={newCustom?.name}
                onChange={e => setNewCustom(p => ({ ...p, name: e?.target?.value }))}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Criteria type selector */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">Criterio para desbloquear *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CRITERIA_TYPES?.map(ct => (
                  <button
                    key={ct?.id}
                    onClick={() => setNewCustom(p => ({ ...p, criteriaType: ct?.id, criteriaValue: { count: '' } }))}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition-all ${newCustom?.criteriaType === ct?.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border hover:border-primary/40 hover:bg-muted/20'}`}
                  >
                    <span className="text-xl">{ct?.icon}</span>
                    <span className="text-xs font-medium text-foreground leading-tight">{ct?.label}</span>
                  </button>
                ))}
              </div>
              {selectedCriteriaInfo && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                  <span>{selectedCriteriaInfo?.icon}</span>
                  {selectedCriteriaInfo?.description}
                </p>
              )}
            </div>

            {/* Criteria value config */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                {newCustom?.criteriaType === 'horario' ? 'Configurar horario y visitas' : 'Cantidad requerida *'}
              </label>
              <CriteriaConfigFields
                criteriaType={newCustom?.criteriaType}
                value={newCustom?.criteriaValue}
                onChange={val => setNewCustom(p => ({ ...p, criteriaValue: val }))}
              />
            </div>

            {/* Rarity */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Rareza</label>
              <div className="flex gap-2 flex-wrap">
                {RARITY_CONFIG?.map(r => (
                  <button
                    key={r?.key}
                    onClick={() => setNewCustom(p => ({ ...p, rarity: r?.key }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${newCustom?.rarity === r?.key ? 'border-primary bg-primary/10 text-primary' : `border-border ${r?.badgeClass}`}`}
                  >
                    {r?.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {newCustom?.name && conditionPreview && (
              <div className={`flex items-center gap-3 p-3 border rounded-xl ${RARITY_BORDER?.[newCustom?.rarity] || 'border-border'} bg-card`}>
                <span className="text-2xl">{newCustom?.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{newCustom?.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${RARITY_COLORS?.[newCustom?.rarity]}`}>
                      {newCustom?.rarity?.charAt(0)?.toUpperCase() + newCustom?.rarity?.slice(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">{conditionPreview}</span>
                    <span className="text-xs text-muted-foreground">
                      {selectedCriteriaInfo?.icon} {selectedCriteriaInfo?.label}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={addCustomAchievement}
                disabled={!newCustom?.name || !conditionPreview}
                className="flex items-center gap-1.5 text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="Plus" size={14} />
                Agregar logro
              </button>
              <button
                onClick={() => { setShowCustomForm(false); setShowIconPicker(false); }}
                className="text-sm text-muted-foreground border border-border px-4 py-2 rounded-lg hover:bg-muted/30 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {customAchievements?.length > 0 ? (
          <div className="divide-y divide-border">
            {customAchievements?.map(ach => {
              const ct = CRITERIA_TYPES?.find(c => c?.id === ach?.criteriaType);
              return (
                <div key={ach?.id} className={`flex items-center justify-between px-4 py-3 ${achievements?.[ach?.id] ? 'bg-primary/5' : 'hover:bg-muted/10'}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl flex-shrink-0">{ach?.emoji}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground">{ach?.name}</p>
                        <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">Personalizado</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${RARITY_COLORS?.[ach?.rarity]}`}>
                          {ach?.rarity?.charAt(0)?.toUpperCase() + ach?.rarity?.slice(1)}
                        </span>
                        {ct && <span className="text-xs text-muted-foreground">{ct?.icon} {ct?.label}</span>}
                        <span className="text-xs text-muted-foreground">· {ach?.condition}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <Toggle value={achievements?.[ach?.id] || false} onChange={() => toggleAch(ach?.id)} />
                    <button onClick={() => removeCustom(ach?.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !showCustomForm && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-muted-foreground">No hay logros personalizados aún.</p>
              <p className="text-xs text-muted-foreground mt-1">Haz clic en "Crear logro" para agregar uno.</p>
            </div>
          )
        )}
      </div>
      {/* Preview panel */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <Icon name="Eye" size={16} className="text-primary" />
            <span className="font-semibold text-foreground text-sm">Vista previa — Logros seleccionados</span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{allSelected?.length} logros</span>
          </div>
        </div>
        {allSelected?.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon name="Trophy" size={20} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Ningún logro seleccionado</p>
            <p className="text-xs text-muted-foreground mt-1">Activa logros del catálogo o crea personalizados para verlos aquí.</p>
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {allSelected?.map(ach => (
                <div key={ach?.id} className={`flex items-center gap-2.5 p-3 border rounded-xl bg-card ${RARITY_BORDER?.[ach?.rarity] || 'border-border'}`}>
                  <span className="text-2xl flex-shrink-0">{ach?.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{ach?.name}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${RARITY_COLORS?.[ach?.rarity]}`}>
                      {ach?.rarity?.charAt(0)?.toUpperCase() + ach?.rarity?.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── COMPLEMENT TYPES ─────────────────────────────────────────────────────────
const COMPLEMENT_TYPES = [
  { id: 'coupon', label: 'Cupón de descuento', icon: '🎟️', description: 'Otorga un cupón de descuento al desbloquear el logro' },
  { id: 'stamp_card', label: 'Tarjeta de sellos', icon: '🎴', description: 'Regala una tarjeta de sellos (punch card) completada o parcial' },
  { id: 'surprise', label: 'Sorpresa', icon: '🎁', description: 'Activa una sorpresa configurada en el módulo de sorpresas' },
  { id: 'free_product', label: 'Producto gratis', icon: '🛍️', description: 'Otorga un producto o servicio gratuito del catálogo' },
  { id: 'vip_upgrade', label: 'Upgrade VIP', icon: '👑', description: 'Sube automáticamente al cliente de nivel VIP' },
  { id: 'gift_card', label: 'Gift card', icon: '💳', description: 'Entrega una gift card con saldo predefinido' },
  { id: 'experience', label: 'Experiencia especial', icon: '🌟', description: 'Acceso a una experiencia o evento exclusivo' },
  { id: 'custom', label: 'Beneficio personalizado', icon: '✨', description: 'Define un beneficio personalizado con texto libre' },
];

// ─── COMPLEMENT DETAIL FIELDS ─────────────────────────────────────────────────
const ComplementDetailFields = ({ ctId, details, onUpdate }) => {
  if (ctId === 'coupon') return (
    <div className="space-y-2" onClick={e => e?.stopPropagation()}>
      <input type="text" placeholder="Nombre del cupón (ej: 10% descuento)" value={details?.name || ''} onChange={e => onUpdate('name', e?.target?.value)}
        className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
      <div className="flex gap-2">
        <input type="number" placeholder="% descuento" value={details?.discount || ''} onChange={e => onUpdate('discount', e?.target?.value)}
          className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
        <select value={details?.validity || '30'} onChange={e => onUpdate('validity', e?.target?.value)}
          className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none">
          <option value="7">7 días</option><option value="15">15 días</option><option value="30">30 días</option>
          <option value="60">60 días</option><option value="90">90 días</option>
        </select>
      </div>
    </div>
  );
  if (ctId === 'stamp_card') return (
    <div className="flex gap-2" onClick={e => e?.stopPropagation()}>
      <input type="number" placeholder="Sellos otorgados" value={details?.stamps || ''} onChange={e => onUpdate('stamps', e?.target?.value)}
        className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
      <input type="text" placeholder="Nombre de la tarjeta" value={details?.cardName || ''} onChange={e => onUpdate('cardName', e?.target?.value)}
        className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
    </div>
  );
  if (ctId === 'surprise') return (
    <input type="text" placeholder="Nombre de la sorpresa a activar" value={details?.surpriseName || ''} onChange={e => onUpdate('surpriseName', e?.target?.value)}
      className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" onClick={e => e?.stopPropagation()} />
  );
  if (ctId === 'free_product') return (
    <input type="text" placeholder="Nombre del producto o servicio" value={details?.productName || ''} onChange={e => onUpdate('productName', e?.target?.value)}
      className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" onClick={e => e?.stopPropagation()} />
  );
  if (ctId === 'vip_upgrade') return (
    <select value={details?.level || ''} onChange={e => onUpdate('level', e?.target?.value)}
      className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none" onClick={e => e?.stopPropagation()}>
      <option value="">Seleccionar nivel VIP</option>
      <option value="silver">Plata</option><option value="gold">Oro</option><option value="platinum">Platino</option>
    </select>
  );
  if (ctId === 'gift_card') return (
    <div className="flex gap-2" onClick={e => e?.stopPropagation()}>
      <input type="number" placeholder="Monto ($)" value={details?.amount || ''} onChange={e => onUpdate('amount', e?.target?.value)}
        className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
      <select value={details?.validity || '30'} onChange={e => onUpdate('validity', e?.target?.value)}
        className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none">
        <option value="30">30 días</option><option value="60">60 días</option><option value="90">90 días</option><option value="180">6 meses</option>
      </select>
    </div>
  );
  if (ctId === 'experience') return (
    <input type="text" placeholder="Nombre de la experiencia" value={details?.experienceName || ''} onChange={e => onUpdate('experienceName', e?.target?.value)}
      className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" onClick={e => e?.stopPropagation()} />
  );
  if (ctId === 'custom') return (
    <textarea placeholder="Describe el beneficio personalizado..." value={details?.description || ''} onChange={e => onUpdate('description', e?.target?.value)}
      rows={2} className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none" onClick={e => e?.stopPropagation()} />
  );
  return null;
};

// ─── RARITY REWARD BLOCK ──────────────────────────────────────────────────────
const RarityRewardBlock = ({ rarity, points, onPointsChange, enablePoints, enableComplements, selectedComplements, complementDetails, onToggleComplement, onUpdateComplementDetail }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`border rounded-xl overflow-hidden ${rarity?.border}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between px-4 py-3 ${rarity?.bg} hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{rarity?.emoji}</span>
          <div className="text-left">
            <p className={`font-semibold text-sm ${rarity?.color}`}>{rarity?.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {enablePoints ? `${points} pts bonus` : 'Sin puntos'}
              {enableComplements && selectedComplements?.length > 0
                ? ` · ${selectedComplements?.length} recompensa${selectedComplements?.length > 1 ? 's' : ''} extra`
                : ''}
            </p>
          </div>
        </div>
        <Icon name={expanded ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground flex-shrink-0" />
      </button>
      {expanded && (
        <div className="p-4 space-y-4 bg-card">
          {/* Points */}
          {enablePoints && (
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">Puntos bonus al obtener este logro</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={points}
                  onChange={e => onPointsChange(parseInt(e?.target?.value) || 0)}
                  className={`w-28 border rounded-lg px-3 py-2 text-sm bg-background text-foreground text-center font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 ${rarity?.border}`}
                />
                <span className="text-sm text-muted-foreground">puntos bonus</span>
              </div>
            </div>
          )}

          {/* Complementary rewards */}
          {enableComplements && (
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">Recompensas complementarias para nivel {rarity?.label}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COMPLEMENT_TYPES?.map(ct => {
                  const isSelected = selectedComplements?.includes(ct?.id);
                  return (
                    <div
                      key={ct?.id}
                      onClick={() => onToggleComplement(ct?.id)}
                      className={`border rounded-xl p-3 cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border hover:border-primary/40 hover:bg-muted/20'}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg flex-shrink-0">{ct?.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-semibold text-foreground">{ct?.label}</p>
                            {isSelected && (
                              <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                <Icon name="Check" size={8} className="text-white" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{ct?.description}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="mt-2 pt-2 border-t border-border/60" onClick={e => e?.stopPropagation()}>
                          <ComplementDetailFields
                            ctId={ct?.id}
                            details={complementDetails?.[ct?.id] || {}}
                            onUpdate={(field, val) => onUpdateComplementDetail(ct?.id, field, val)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!enablePoints && !enableComplements && (
            <p className="text-xs text-muted-foreground text-center py-2">Activa puntos o recompensas complementarias arriba para configurar este nivel.</p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── STEP 3: RECOMPENSAS ──────────────────────────────────────────────────────
const StepRecompensas = ({ config, onChange }) => {
  const rarityPoints = config?.rarityPoints || { comun: 0, raro: 50, epico: 150, legendario: 400, unico: 500 };
  const enablePoints = config?.enablePoints !== false;
  const enableComplements = config?.enableComplements || false;
  // Per-rarity complement selections: { comun: ['coupon'], raro: ['surprise'], ... }
  const rarityComplements = config?.rarityComplements || {};
  const rarityComplementDetails = config?.rarityComplementDetails || {};

  const updatePoints = (rarity, val) => {
    onChange('rarityPoints', { ...rarityPoints, [rarity]: val });
  };

  const toggleRarityComplement = (rarityKey, ctId) => {
    const current = rarityComplements?.[rarityKey] || [];
    const next = current?.includes(ctId) ? current?.filter(c => c !== ctId) : [...current, ctId];
    onChange('rarityComplements', { ...rarityComplements, [rarityKey]: next });
  };

  const updateRarityComplementDetail = (rarityKey, ctId, field, val) => {
    const prev = rarityComplementDetails?.[rarityKey] || {};
    const prevCt = prev?.[ctId] || {};
    onChange('rarityComplementDetails', {
      ...rarityComplementDetails,
      [rarityKey]: { ...prev, [ctId]: { ...prevCt, [field]: val } },
    });
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/50 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Configuración de recompensas</p>
          <p className="text-xs text-muted-foreground mt-0.5">Activa qué tipo de recompensas otorga el sistema al desbloquear logros</p>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground flex items-center gap-2"><span>⭐</span> Puntos por logro</p>
              <p className="text-xs text-muted-foreground mt-0.5">Otorga puntos de lealtad al desbloquear un logro según su rareza</p>
            </div>
            <Toggle value={enablePoints} onChange={v => onChange('enablePoints', v)} />
          </div>
          <div className="border-t border-border pt-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground flex items-center gap-2"><span>🎁</span> Recompensas complementarias</p>
              <p className="text-xs text-muted-foreground mt-0.5">Además de puntos, otorga otros beneficios al desbloquear logros</p>
            </div>
            <Toggle value={enableComplements} onChange={v => onChange('enableComplements', v)} />
          </div>
          {enablePoints && (
            <div className="border-t border-border pt-3 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Puntos individuales por logro</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Cada logro puede tener su propio valor de puntos además del bonus por rareza.</p>
                </div>
                <Toggle value={config?.individualPoints !== false} onChange={v => onChange('individualPoints', v)} />
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Mostrar puntos ganados en la notificación</p>
                  <p className="text-xs text-muted-foreground mt-0.5">El cliente ve cuántos puntos ganó al desbloquear el logro.</p>
                </div>
                <Toggle value={config?.showPointsInNotif !== false} onChange={v => onChange('showPointsInNotif', v)} />
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Per-rarity reward blocks */}
      {(enablePoints || enableComplements) && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="Layers" size={16} className="text-primary" />
            <p className="text-sm font-semibold text-foreground">Recompensas por rareza</p>
          </div>
          <p className="text-xs text-muted-foreground -mt-1">Configura los puntos y recompensas que recibirá el usuario al obtener un logro de cada nivel. Haz clic en cada nivel para expandir su configuración.</p>
          <div className="space-y-2">
            {RARITY_CONFIG?.map(rarity => (
              <RarityRewardBlock
                key={rarity?.key}
                rarity={rarity}
                points={rarityPoints?.[rarity?.key] ?? 0}
                onPointsChange={val => updatePoints(rarity?.key, val)}
                enablePoints={enablePoints}
                enableComplements={enableComplements}
                selectedComplements={rarityComplements?.[rarity?.key] || []}
                complementDetails={rarityComplementDetails?.[rarity?.key] || {}}
                onToggleComplement={ctId => toggleRarityComplement(rarity?.key, ctId)}
                onUpdateComplementDetail={(ctId, field, val) => updateRarityComplementDetail(rarity?.key, ctId, field, val)}
              />
            ))}
          </div>
        </div>
      )}
      {/* Summary example */}
      {(enablePoints || enableComplements) && (
        <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
          <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Icon name="Info" size={14} className="text-primary" />
            Ejemplo de recompensa
          </p>
          <p className="text-sm text-muted-foreground">
            Un cliente que desbloquea <strong>"Fan del negocio"</strong> (Épico, 50 visitas) recibirá:
          </p>
          <ul className="mt-2 space-y-1">
            {enablePoints && <li className="text-sm text-muted-foreground flex items-center gap-2"><span>⭐</span> <strong>{rarityPoints?.epico} pts bonus</strong></li>}
            {enableComplements && (rarityComplements?.epico || [])?.length > 0 && (rarityComplements?.epico)?.map(id => {
              const ct = COMPLEMENT_TYPES?.find(c => c?.id === id);
              return ct ? <li key={id} className="text-sm text-muted-foreground flex items-center gap-2"><span>{ct?.icon}</span> {ct?.label}</li> : null;
            })}
            {enableComplements && (rarityComplements?.epico || [])?.length === 0 && (
              <li className="text-sm text-muted-foreground flex items-center gap-2"><span>🎁</span> Configura recompensas para nivel Épico</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

// ─── STEP 4: NOTIFICACIONES ───────────────────────────────────────────────────
const StepNotificaciones = ({ config, onChange }) => (
  <div className="space-y-6">
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="bg-muted/50 px-4 py-3">
        <p className="text-sm font-semibold text-foreground">Notificación al desbloquear un logro</p>
        <p className="text-xs text-muted-foreground mt-0.5">Mensaje que recibe el cliente cuando obtiene un nuevo logro.</p>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Enviar push al desbloquear logro</p>
            <p className="text-xs text-muted-foreground mt-0.5">Notificación push automática cuando el cliente obtiene un nuevo badge.</p>
          </div>
          <Toggle value={config?.notifyUnlock !== false} onChange={v => onChange('notifyUnlock', v)} />
        </div>
        {config?.notifyUnlock !== false && (
          <div className="p-3 bg-muted/30 rounded-lg border border-border">
            <p className="text-xs font-medium text-muted-foreground mb-1">Vista previa del push:</p>
            <p className="text-sm text-foreground">
              🏆 ¡Nuevo logro desbloqueado! <strong>[Nombre del logro]</strong> — [Descripción del logro]. ¡Felicidades!
            </p>
          </div>
        )}
      </div>
    </div>
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="bg-muted/50 px-4 py-3">
        <p className="text-sm font-semibold text-foreground">Mensajes de celebración personalizados</p>
        <p className="text-xs text-muted-foreground mt-0.5">Cada logro puede tener su propio mensaje de celebración con variables dinámicas.</p>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Usar mensajes de celebración personalizados</p>
            <p className="text-xs text-muted-foreground mt-0.5">Usa los mensajes configurados en cada logro en lugar del mensaje genérico.</p>
          </div>
          <Toggle value={config?.customMessages !== false} onChange={v => onChange('customMessages', v)} />
        </div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-medium text-blue-800 mb-1">Variables disponibles:</p>
          <div className="flex flex-wrap gap-1.5">
            {['{nombre_cliente}', '{negocio}', '{logro}', '{puntos}', '{fecha}']?.map(v => (
              <span key={v} className="text-xs bg-white border border-blue-200 text-blue-700 px-2 py-0.5 rounded font-mono">{v}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="bg-muted/50 px-4 py-3">
        <p className="text-sm font-semibold text-foreground">Otras notificaciones</p>
      </div>
      <div className="p-4 space-y-3">
        {[
          { key: 'notifyNear', label: 'Notificar cuando el cliente está cerca de un logro', default: true },
          { key: 'notifyFirstAch', label: 'Notificación especial al primer logro del cliente', default: true },
          { key: 'notifyLegendary', label: 'Notificación especial para logros Legendarios y Únicos', default: true },
          { key: 'notifyWeekly', label: 'Resumen semanal de logros desbloqueados (para el admin)', default: false },
        ]?.map(item => (
          <label key={item?.key} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config?.[item?.key] !== undefined ? config?.[item?.key] : item?.default}
              onChange={e => onChange(item?.key, e?.target?.checked)}
              className="rounded accent-primary"
            />
            <span className="text-sm text-foreground">{item?.label}</span>
          </label>
        ))}
      </div>
    </div>
    {/* Summary */}
    <div className="border border-border rounded-xl p-5 bg-card">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <Icon name="CheckCircle" size={18} className="text-success" />
        Resumen de configuración
      </h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
          <span className="text-lg">🏆</span>
          <div>
            <p className="text-xs text-muted-foreground">Sistema</p>
            <p className="font-medium text-foreground">{config?.active !== false ? 'Activo' : 'Inactivo'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
          <Icon name="Bell" size={16} className="text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Notif. desbloqueo</p>
            <p className="font-medium text-foreground">{config?.notifyUnlock !== false ? 'Activada' : 'Desactivada'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
          <Icon name="Target" size={16} className="text-amber-500" />
          <div>
            <p className="text-xs text-muted-foreground">Notif. proximidad</p>
            <p className="font-medium text-foreground">{config?.nearNotify !== false ? `${config?.nearThreshold || 3} pasos antes` : 'Desactivada'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
          <Icon name="MessageSquare" size={16} className="text-purple-500" />
          <div>
            <p className="text-xs text-muted-foreground">Mensajes personalizados</p>
            <p className="font-medium text-foreground">{config?.customMessages !== false ? 'Activados' : 'Desactivados'}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── MAIN WIZARD PAGE ─────────────────────────────────────────────────────────
const AchievementsWizardPage = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState({
    active: true,
    autoEval: true,
    preserveOnDeactivate: true,
    showInProfile: true,
    nearNotify: true,
    nearThreshold: 3,
    enablePoints: true,
    individualPoints: true,
    showPointsInNotif: true,
    rarityPoints: { comun: 0, raro: 50, epico: 150, legendario: 400, unico: 500 },
    enableComplements: false,
    rarityComplements: {},
    rarityComplementDetails: {},
    notifyUnlock: true,
    customMessages: true,
    notifyNear: true,
    notifyFirstAch: true,
    notifyLegendary: true,
    notifyWeekly: false,
  });

  const user = { name: 'Carlos Mendoza', email: 'carlos@promospot.com', role: 'owner' };
  const handleChange = (field, value) => setConfig(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      navigate('/achievements-management');
    }, 1500);
  };

  const progress = Math.round(((currentStep + 1) / WIZARD_STEPS?.length) * 100);

  const stepComponents = [
    <StepGeneral config={config} onChange={handleChange} />,
    <StepCatalogo config={config} onChange={handleChange} />,
    <StepRecompensas config={config} onChange={handleChange} />,
    <StepNotificaciones config={config} onChange={handleChange} />,
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isMenuOpen={isSidebarOpen} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <main className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <div className="px-4 sm:px-6 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <button onClick={() => navigate('/achievements-management')} className="hover:text-foreground transition-colors">
              Logros
            </button>
            <Icon name="ChevronRight" size={14} />
            <span className="text-foreground font-medium">Configurar Logros</span>
          </nav>

          {/* Header */}
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Configurar Sistema de Logros</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Configura el sistema de logros paso a paso para premiar la fidelidad de tus clientes.
              </p>
            </div>
            <button
              onClick={() => navigate('/achievements-management')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-2 transition-colors flex-shrink-0"
            >
              <Icon name="X" size={14} />
              Cancelar
            </button>
          </div>

          {/* Progress bar + Step indicators */}
          <div className="bg-card border border-border rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Progreso del wizard</span>
                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                  {WIZARD_STEPS?.[currentStep]?.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground hidden sm:block">Paso {currentStep + 1} de {WIZARD_STEPS?.length}</span>
                <span className="text-sm font-bold text-primary">{progress}%</span>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Step indicators */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {WIZARD_STEPS?.map((step, idx) => {
                const isActive = idx === currentStep;
                const isPast = idx < currentStep;
                return (
                  <React.Fragment key={step?.id}>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(idx)}
                      title={step?.label}
                      className={`flex flex-col items-center gap-1 min-w-[72px] p-2 rounded-xl transition-all ${
                        isActive ? 'bg-primary/10 text-primary' : isPast ? 'text-green-600 hover:bg-green-50 cursor-pointer' : 'text-muted-foreground hover:bg-muted cursor-pointer'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                        isActive ? 'bg-primary text-white shadow-sm' : isPast ? 'bg-green-500 text-white' : 'bg-muted'
                      }`}>
                        {isPast ? (
                          <Icon name="Check" size={14} className="text-white" />
                        ) : (
                          <Icon name={step?.icon} size={14} className={isActive ? 'text-white' : 'text-muted-foreground'} />
                        )}
                      </div>
                      <span className="text-xs font-medium text-center leading-tight whitespace-nowrap">{step?.label?.split(' ')?.[0]}</span>
                    </button>
                    {idx < WIZARD_STEPS?.length - 1 && (
                      <div className={`flex-1 h-0.5 min-w-[6px] rounded-full transition-colors ${isPast ? 'bg-green-400' : 'bg-border'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Step content */}
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">{WIZARD_STEPS?.[currentStep]?.label}</h2>
              <p className="text-sm text-muted-foreground">{WIZARD_STEPS?.[currentStep]?.description}</p>
            </div>
            <div>
              {stepComponents?.[currentStep]}
            </div>
          </div>

          {/* Navigation footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <button
              onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : navigate('/achievements-management')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg px-4 py-2 transition-colors"
            >
              <Icon name="ChevronLeft" size={14} />
              {currentStep === 0 ? 'Cancelar' : 'Anterior'}
            </button>
            <div className="flex items-center gap-2">
              {WIZARD_STEPS?.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`w-2 h-2 rounded-full transition-colors ${idx === currentStep ? 'bg-primary' : idx < currentStep ? 'bg-success' : 'bg-muted'}`}
                />
              ))}
            </div>
            {currentStep < WIZARD_STEPS?.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex items-center gap-2 text-sm bg-primary text-white rounded-lg px-4 py-2 hover:bg-primary/90 transition-colors font-medium"
              >
                Siguiente
                <Icon name="ChevronRight" size={14} />
              </button>
            ) : (
              <Button onClick={handleSave} iconName={saved ? 'Check' : 'Save'}>
                {saved ? 'Guardado ✓' : 'Guardar Configuración'}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AchievementsWizardPage;
