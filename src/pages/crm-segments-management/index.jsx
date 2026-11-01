import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';

const autoSegments = [
  { id: 'nuevos', name: 'Nuevos', icon: 'Star', color: 'green', count: 5, variation: +3, description: 'Primera visita en los últimos 30 días', type: 'auto', threshold: '30 días' },
  { id: 'regulares', name: 'Regulares', icon: 'UserCheck', color: 'blue', count: 12, variation: +2, description: '3+ visitas en los últimos 90 días', type: 'auto', threshold: '3 visitas / 90 días' },
  { id: 'vips', name: 'VIPs', icon: 'Crown', color: 'yellow', count: 7, variation: +1, description: 'Nivel Plata o superior, o score > 80', type: 'auto', threshold: 'Plata+ o score > 80' },
  { id: 'dormidos', name: 'Dormidos', icon: 'Moon', color: 'orange', count: 6, variation: -1, description: 'Última visita hace 21 a 60 días', type: 'auto', threshold: '21-60 días' },
  { id: 'perdidos', name: 'Perdidos', icon: 'HelpCircle', color: 'red', count: 3, variation: +1, description: 'Última visita hace más de 60 días', type: 'auto', threshold: '60+ días' },
  { id: 'cumpleaneros', name: 'Cumpleañeros del mes', icon: 'Cake', color: 'pink', count: 2, variation: 0, description: 'Cumpleaños en el mes actual', type: 'auto', threshold: 'Mes actual' },
];

const retargetingSegments = [
  { id: 'vieron', name: 'Vieron pero no visitaron', icon: 'Eye', color: 'cyan', count: 18, variation: +5, description: 'Vieron la ficha en los últimos 14 días sin hacer check-in', suggestedAction: 'Enviar cupón de primera visita', type: 'retargeting' },
  { id: 'una-vez', name: 'Visitaron una vez y no volvieron', icon: 'RotateCcw', color: 'orange', count: 9, variation: -2, description: 'Una sola visita hace más de 14 días', suggestedAction: 'Encuesta + cupón de segunda visita', type: 'retargeting' },
  { id: 'dormidos-2', name: 'Dormidos 2+ semanas', icon: 'Moon', color: 'amber', count: 6, variation: +1, description: 'Clientes con 2+ visitas, inactivos 14-45 días', suggestedAction: 'Activar flow de reactivación', type: 'retargeting' },
  { id: 'dormidos-45', name: 'Dormidos 45+ días', icon: 'Hourglass', color: 'red', count: 3, variation: 0, description: 'Inactividad mayor a 45 días', suggestedAction: 'Oferta agresiva de reconquista', type: 'retargeting' },
  { id: 'cercanos', name: 'Cercanos frecuentes', icon: 'MapPin', color: 'green', count: 24, variation: +8, description: 'Pasan frecuentemente cerca sin entrar', suggestedAction: 'Push geolocalizado al estar en radio', type: 'retargeting' },
];

const initialCustomSegments = [
  { id: 'c1', name: 'Fans del café VIP', icon: 'Coffee', color: 'amber', count: 4, variation: +1, description: 'Tienen tag Fan del café + nivel Plata o superior', type: 'custom', criteria: [{ field: 'Tiene tag', op: 'es', value: 'Fan del café' }, { field: 'Nivel VIP', op: 'es', value: 'Plata' }] },
  { id: 'c2', name: 'Corporativos activos', icon: 'Briefcase', color: 'blue', count: 3, variation: 0, description: 'Tag Cliente corporativo + activos en últimos 30 días', type: 'custom', criteria: [{ field: 'Tiene tag', op: 'es', value: 'Cliente corporativo' }, { field: 'Última visita', op: 'menor que', value: '30 días' }] },
];

const colorMap = {
  green: { border: 'border-l-green-500', bg: 'bg-green-50', icon: 'text-green-600', badge: 'bg-green-100 text-green-700' },
  blue: { border: 'border-l-blue-500', bg: 'bg-blue-50', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
  yellow: { border: 'border-l-yellow-500', bg: 'bg-yellow-50', icon: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-700' },
  orange: { border: 'border-l-orange-500', bg: 'bg-orange-50', icon: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' },
  red: { border: 'border-l-red-500', bg: 'bg-red-50', icon: 'text-red-600', badge: 'bg-red-100 text-red-700' },
  pink: { border: 'border-l-pink-500', bg: 'bg-pink-50', icon: 'text-pink-600', badge: 'bg-pink-100 text-pink-700' },
  cyan: { border: 'border-l-cyan-500', bg: 'bg-cyan-50', icon: 'text-cyan-600', badge: 'bg-cyan-100 text-cyan-700' },
  amber: { border: 'border-l-amber-500', bg: 'bg-amber-50', icon: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
};

const PALETTE_COLORS = ['red', 'orange', 'amber', 'yellow', 'green', 'cyan', 'blue', 'indigo', 'purple', 'pink', 'rose', 'slate'];
const PALETTE_ICONS = ['Star', 'Users', 'Heart', 'Zap', 'Crown', 'Coffee', 'Briefcase', 'Gift', 'Target', 'Flame', 'Trophy', 'Award', 'Bookmark', 'Tag', 'Bell', 'ShoppingBag', 'MapPin', 'Moon', 'Sun', 'Sparkles'];
const CRITERIA_FIELDS = ['Visitas totales', 'Visitas en últimos X días', 'Score de engagement', 'Última visita (hace X días)', 'Primera visita (hace X días)', 'Nivel VIP', 'Tiene tag', 'No tiene tag', 'Saldo de puntos', 'Puntos acumulados', 'Tiene tarjeta prepago', 'Tiene WhatsApp', 'Ha dejado reseña', 'NPS (rango)', 'Cumpleaños en mes', 'Tipo de establecimiento'];
const CRITERIA_OPS = ['es', 'no es', 'mayor que', 'menor que', 'contiene', 'entre'];

const VIP_LEVELS = ['Bronce', 'Plata', 'Oro', 'Platino', 'Diamante'];
const DORMANCY_OPTIONS = ['Activo (< 14 días)', 'Dormido (14-30 días)', 'Dormido (30-60 días)', 'Perdido (60+ días)'];

const SuggestedActionModal = ({ segment, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/40" onClick={onClose} />
    <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Acción sugerida</h3>
        <button onClick={onClose} className="p-1 rounded hover:bg-muted"><Icon name="X" size={18} /></button>
      </div>
      <div className="bg-muted/40 rounded-xl p-4 mb-4">
        <p className="text-sm font-medium mb-1">{segment?.name}</p>
        <p className="text-xs text-muted-foreground">{segment?.description}</p>
        <p className="text-xs text-primary mt-2 font-medium">💡 {segment?.suggestedAction}</p>
      </div>
      <div className="space-y-3">
        <a href="/crm-clients-list" className="flex items-center gap-3 p-3 border border-border rounded-xl hover:bg-muted transition-colors cursor-pointer">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon name="MessageSquare" size={20} className="text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium">Enviar mensaje a este segmento</div>
            <div className="text-xs text-muted-foreground">Ir a Comunicar con segmento pre-seleccionado</div>
          </div>
          <Icon name="ChevronRight" size={16} className="ml-auto text-muted-foreground" />
        </a>
        <a href="/campaigns-management/new" className="flex items-center gap-3 p-3 border border-border rounded-xl hover:bg-muted transition-colors cursor-pointer">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Icon name="Megaphone" size={20} className="text-purple-600" />
          </div>
          <div>
            <div className="text-sm font-medium">Crear campaña para este segmento</div>
            <div className="text-xs text-muted-foreground">Ir al Campaign Builder con audiencia pre-seleccionada</div>
          </div>
          <Icon name="ChevronRight" size={16} className="ml-auto text-muted-foreground" />
        </a>
      </div>
    </div>
  </div>
);

const SegmentCard = ({ segment, onSuggestedAction }) => {
  const colors = colorMap?.[segment?.color] || colorMap?.blue;
  const isPositive = segment?.variation > 0;
  const isNegative = segment?.variation < 0;

  // Find tipo chips in criteria
  const tipoCriteria = segment?.criteria?.filter(c => c?.field === 'Tipo de establecimiento') || [];

  return (
    <div className={`bg-card rounded-xl border border-border border-l-4 ${colors?.border} p-5 hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${colors?.bg} flex items-center justify-center`}>
            <Icon name={segment?.icon} size={20} className={colors?.icon} />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">{segment?.name}</h3>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${segment?.type === 'auto' ? 'bg-slate-100 text-slate-600' : segment?.type === 'retargeting' ? 'bg-cyan-100 text-cyan-700' : 'bg-purple-100 text-purple-700'}`}>
              {segment?.type === 'auto' ? 'Automático' : segment?.type === 'retargeting' ? 'Retargeting' : 'Personalizado'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-foreground">{segment?.count}</div>
          <div className={`text-xs flex items-center justify-end gap-0.5 font-medium ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-muted-foreground'}`}>
            {isPositive && <Icon name="TrendingUp" size={12} />}
            {isNegative && <Icon name="TrendingDown" size={12} />}
            {segment?.variation > 0 ? '+' : ''}{segment?.variation !== 0 ? segment?.variation : '—'} vs mes anterior
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{segment?.description}</p>

      {/* Tipo de establecimiento chips in summary */}
      {tipoCriteria?.length > 0 && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Store" size={14} className="text-violet-600" />
            <span className="text-xs font-semibold text-violet-700">Tipos de establecimiento seleccionados</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tipoCriteria?.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-xs bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full font-medium border border-violet-200">
                <Icon name="Store" size={10} />
                {c?.value}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <a href="/crm-clients-list" className="flex-1 text-center text-xs py-2 border border-border rounded-lg hover:bg-muted transition-colors font-medium">Ver clientes</a>
        {segment?.type === 'retargeting' && (
          <button onClick={() => onSuggestedAction(segment)} className="flex-1 text-xs py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium">Acción sugerida</button>
        )}
      </div>
    </div>
  );
};

// Searchable tipo dropdown component
const TipoDropdown = ({ value, onChange, tipos, loading }) => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = tipos?.filter(t => t?.nombre?.toLowerCase()?.includes(search?.toLowerCase()));
  const selectedTipo = tipos?.find(t => t?.nombre === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between border border-border rounded-lg px-3 py-2 text-sm bg-background hover:border-primary/50 transition-colors"
      >
        {value ? (
          <span className="flex items-center gap-2 text-foreground">
            <Icon name="Store" size={14} className="text-violet-600" />
            {value}
          </span>
        ) : (
          <span className="text-muted-foreground">Seleccionar tipo de establecimiento...</span>
        )}
        <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={14} className="text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Icon name="Search" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={e => setSearch(e?.target?.value)}
                placeholder="Buscar tipo..."
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground">
                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Cargando tipos...
              </div>
            ) : filtered?.length === 0 ? (
              <div className="p-3 text-xs text-muted-foreground text-center">No se encontraron tipos</div>
            ) : (
              filtered?.map(t => (
                <button
                  key={t?.id}
                  type="button"
                  onClick={() => { onChange(t?.nombre); setOpen(false); setSearch(''); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2 ${value === t?.nombre ? 'bg-violet-50 text-violet-700 font-medium' : 'text-foreground'}`}
                >
                  {value === t?.nombre && <Icon name="Check" size={12} className="text-violet-600" />}
                  {t?.nombre}
                </button>
              ))
            )}
          </div>
          {value && (
            <div className="p-2 border-t border-border">
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false); }}
                className="w-full text-xs text-muted-foreground hover:text-destructive py-1 transition-colors"
              >
                Limpiar selección
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SegmentBuilderDrawer = ({ onClose, onSave, editSegment }) => {
  const [name, setName] = useState(editSegment?.name || '');
  const [color, setColor] = useState(editSegment?.color || 'blue');
  const [icon, setIcon] = useState(editSegment?.icon || 'Star');
  const [criteria, setCriteria] = useState(editSegment?.criteria || [{ field: CRITERIA_FIELDS?.[0], op: CRITERIA_OPS?.[0], value: '', logic: 'AND' }]);
  const [tipos, setTipos] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(false);

  // Load tipos from Supabase
  useEffect(() => {
    const fetchTipos = async () => {
      setLoadingTipos(true);
      try {
        const { data } = await supabase?.from('business_establishment_types')?.select('id, nombre')?.order('nombre', { ascending: true });
        setTipos(data || []);
      } catch {
        setTipos([]);
      } finally {
        setLoadingTipos(false);
      }
    };
    fetchTipos();
  }, []);

  const addCriteria = () => setCriteria(prev => [...prev, { field: CRITERIA_FIELDS?.[0], op: CRITERIA_OPS?.[0], value: '', logic: 'AND' }]);
  const removeCriteria = (i) => setCriteria(prev => prev?.filter((_, idx) => idx !== i));
  const updateCriteria = (i, key, val) => setCriteria(prev => prev?.map((c, idx) => idx === i ? {...c, [key]: val} : c));

  const estimatedCount = Math.max(1, Math.floor(Math.random() * 15 + criteria?.length * 2));
  const totalClients = 25;
  const pct = Math.round(estimatedCount / totalClients * 100);

  const colorDots = { red: 'bg-red-500', orange: 'bg-orange-500', amber: 'bg-amber-500', yellow: 'bg-yellow-500', green: 'bg-green-500', cyan: 'bg-cyan-500', blue: 'bg-blue-500', indigo: 'bg-indigo-500', purple: 'bg-purple-500', pink: 'bg-pink-500', rose: 'bg-rose-500', slate: 'bg-slate-500' };

  // Get chips for tipo criteria in summary
  const tipoCriteriaInSummary = criteria?.filter(c => c?.field === 'Tipo de establecimiento' && c?.value);

  const getValueInput = (c, i) => {
    if (c?.field === 'Nivel VIP') {
      return (
        <select className="flex-1 border border-border rounded-lg px-2 py-1.5 text-xs bg-background" value={c?.value} onChange={e => updateCriteria(i, 'value', e?.target?.value)}>
          <option value="">Seleccionar nivel...</option>
          {VIP_LEVELS?.map(v => <option key={v}>{v}</option>)}
        </select>
      );
    }
    if (c?.field === 'Tipo de establecimiento') {
      return (
        <div className="flex-1">
          <TipoDropdown
            value={c?.value}
            onChange={val => updateCriteria(i, 'value', val)}
            tipos={tipos}
            loading={loadingTipos}
          />
        </div>
      );
    }
    if (c?.field?.includes('Dormido') || c?.field === 'Última visita (hace X días)') {
      return (
        <select className="flex-1 border border-border rounded-lg px-2 py-1.5 text-xs bg-background" value={c?.value} onChange={e => updateCriteria(i, 'value', e?.target?.value)}>
          <option value="">Seleccionar estado...</option>
          {DORMANCY_OPTIONS?.map(d => <option key={d}>{d}</option>)}
        </select>
      );
    }
    return (
      <input className="flex-1 border border-border rounded-lg px-2 py-1.5 text-xs bg-background" placeholder="Valor" value={c?.value} onChange={e => updateCriteria(i, 'value', e?.target?.value)} />
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-card w-full max-w-lg h-full shadow-2xl overflow-y-auto border-l border-border flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold text-lg">{editSegment ? 'Editar segmento' : 'Nuevo segmento'}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted"><Icon name="X" size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Name */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Nombre del segmento</label>
            <input className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background" placeholder="Ej. Clientes frecuentes de fin de semana" value={name} onChange={e => setName(e?.target?.value)} />
          </div>

          {/* Color */}
          <div>
            <label className="text-sm font-medium mb-2 block">Color</label>
            <div className="flex flex-wrap gap-2">
              {PALETTE_COLORS?.map(c => (
                <button key={c} onClick={() => setColor(c)} className={`w-7 h-7 rounded-full ${colorDots?.[c]} transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-foreground scale-110' : ''}`} />
              ))}
            </div>
          </div>

          {/* Icon */}
          <div>
            <label className="text-sm font-medium mb-2 block">Ícono</label>
            <div className="grid grid-cols-10 gap-1.5">
              {PALETTE_ICONS?.map(ic => (
                <button key={ic} onClick={() => setIcon(ic)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${icon === ic ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}>
                  <Icon name={ic} size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Criteria */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Criterios de segmentación</label>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Combina con AND / OR</span>
            </div>
            <div className="space-y-3">
              {criteria?.map((c, i) => (
                <div key={i} className="bg-muted/30 rounded-xl p-3 space-y-2">
                  {/* Logic connector */}
                  {i > 0 && (
                    <div className="flex items-center gap-2 mb-1">
                      <button
                        type="button"
                        onClick={() => updateCriteria(i, 'logic', c?.logic === 'AND' ? 'OR' : 'AND')}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${c?.logic === 'OR' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                      >
                        {c?.logic || 'AND'}
                      </button>
                      <span className="text-xs text-muted-foreground">Haz clic para cambiar</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      {/* Field selector */}
                      <select
                        className="w-full border border-border rounded-lg px-2 py-1.5 text-xs bg-background"
                        value={c?.field}
                        onChange={e => updateCriteria(i, 'field', e?.target?.value)}
                      >
                        <optgroup label="Comportamiento">
                          {['Visitas totales', 'Visitas en últimos X días', 'Score de engagement', 'Última visita (hace X días)', 'Primera visita (hace X días)']?.map(f => <option key={f}>{f}</option>)}
                        </optgroup>
                        <optgroup label="Nivel y estado">
                          {['Nivel VIP', 'Última visita (hace X días)']?.map(f => <option key={f}>{f}</option>)}
                        </optgroup>
                        <optgroup label="Tipo de negocio">
                          <option>Tipo de establecimiento</option>
                        </optgroup>
                        <optgroup label="Otros">
                          {['Tiene tag', 'No tiene tag', 'Saldo de puntos', 'Puntos acumulados', 'Tiene tarjeta prepago', 'Tiene WhatsApp', 'Ha dejado reseña', 'NPS (rango)', 'Cumpleaños en mes']?.map(f => <option key={f}>{f}</option>)}
                        </optgroup>
                      </select>

                      {/* Op + Value row */}
                      <div className="flex items-center gap-2">
                        <select
                          className="w-24 border border-border rounded-lg px-2 py-1.5 text-xs bg-background flex-shrink-0"
                          value={c?.op}
                          onChange={e => updateCriteria(i, 'op', e?.target?.value)}
                        >
                          {CRITERIA_OPS?.map(o => <option key={o}>{o}</option>)}
                        </select>
                        {getValueInput(c, i)}
                      </div>
                    </div>
                    {criteria?.length > 1 && (
                      <button onClick={() => removeCriteria(i)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors mt-0.5 flex-shrink-0">
                        <Icon name="X" size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addCriteria} className="mt-2 flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
              <Icon name="Plus" size={16} />Agregar criterio
            </button>
          </div>

          {/* Tipo chips in summary */}
          {tipoCriteriaInSummary?.length > 0 && (
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Store" size={14} className="text-violet-600" />
                <span className="text-xs font-semibold text-violet-700">Tipos de establecimiento seleccionados</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tipoCriteriaInSummary?.map((c, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-xs bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full font-medium border border-violet-200">
                    <Icon name="Store" size={10} />
                    {c?.value}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Real-time count */}
          <div className="bg-muted/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Este segmento incluye</span>
              <span className="text-2xl font-bold text-primary">{estimatedCount} clientes</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="text-xs text-muted-foreground">{pct}% de tu base total de clientes</div>
            {estimatedCount < 5 && (
              <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                <Icon name="AlertTriangle" size={14} />
                Segmento muy pequeño — considera ampliar los criterios.
              </div>
            )}
            {estimatedCount >= totalClients && (
              <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 rounded-lg p-2">
                <Icon name="Info" size={14} />
                Este segmento incluye a todos tus clientes — es mejor si lo refinas.
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-border flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition-colors">Cancelar</button>
          <button onClick={() => { if (name) { onSave({ name, color, icon, criteria }); onClose(); } }} disabled={!name} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            Guardar segmento
          </button>
        </div>
      </div>
    </div>
  );
};

const CRMSegmentsManagement = () => {
  const [customSegments, setCustomSegments] = useState(initialCustomSegments);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editSegment, setEditSegment] = useState(null);
  const [suggestedActionSegment, setSuggestedActionSegment] = useState(null);

  const handleSave = (data) => {
    if (editSegment) {
      setCustomSegments(prev => prev?.map(s => s?.id === editSegment?.id ? {...s, ...data} : s));
    } else {
      setCustomSegments(prev => [...prev, { id: `c${Date.now()}`, ...data, count: Math.floor(Math.random() * 10 + 1), variation: 0, type: 'custom' }]);
    }
    setEditSegment(null);
  };

  const totalClients = 25;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center gap-3 mb-1">
          <a href="/crm-clients-list" className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="ArrowLeft" size={20} />
          </a>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Segmentos de Clientes</h1>
            <p className="text-sm text-muted-foreground">Agrupa y segmenta tu base de clientes para comunicaciones dirigidas</p>
          </div>
        </div>
        {/* Stats row */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm text-muted-foreground">{autoSegments?.length} segmentos automáticos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
            <span className="text-sm text-muted-foreground">{retargetingSegments?.length} de retargeting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-sm text-muted-foreground">{customSegments?.length} personalizados</span>
          </div>
          <div className="flex-1" />
          <button onClick={() => { setEditSegment(null); setShowBuilder(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
            <Icon name="Plus" size={16} />Nuevo segmento
          </button>
        </div>
      </div>
      <div className="p-6 space-y-8">
        {/* Automatic Segments */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Icon name="Zap" size={18} className="text-primary" />
              <h2 className="text-lg font-semibold">Segmentos Automáticos</h2>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">Se actualizan cada hora</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {autoSegments?.map(seg => (
              <SegmentCard key={seg?.id} segment={seg} onSuggestedAction={setSuggestedActionSegment} />
            ))}
          </div>
        </section>

        {/* Retargeting Segments */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Icon name="Target" size={18} className="text-cyan-600" />
              <h2 className="text-lg font-semibold">Retargeting</h2>
            </div>
            <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full font-medium">Recuperación de oportunidades</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {retargetingSegments?.map(seg => (
              <SegmentCard key={seg?.id} segment={seg} onSuggestedAction={setSuggestedActionSegment} />
            ))}
          </div>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
            <Icon name="Info" size={16} className="inline mr-2" />
            Estos segmentos se calculan automáticamente basados en la actividad de los usuarios en la app. El segmento "Vieron pero no visitaron" requiere que tu negocio tenga ficha publicada.
          </div>
        </section>

        {/* Custom Segments */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Icon name="Sliders" size={18} className="text-purple-600" />
                <h2 className="text-lg font-semibold">Segmentos Personalizados</h2>
              </div>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">{customSegments?.length} / 50</span>
            </div>
          </div>
          {customSegments?.length === 0 ? (
            <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center">
              <Icon name="Layers" size={40} className="mx-auto mb-3 text-muted-foreground/40" />
              <h3 className="font-medium mb-1">Sin segmentos personalizados</h3>
              <p className="text-sm text-muted-foreground mb-4">Crea segmentos basados en los criterios que más importan a tu negocio</p>
              <button onClick={() => { setEditSegment(null); setShowBuilder(true); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium">
                Crear primer segmento
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {customSegments?.map(seg => (
                <div key={seg?.id} className="relative group">
                  <SegmentCard segment={seg} onSuggestedAction={setSuggestedActionSegment} />
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button onClick={() => { setEditSegment(seg); setShowBuilder(true); }} className="p-1.5 bg-card border border-border rounded-lg hover:bg-muted shadow-sm">
                      <Icon name="Pencil" size={14} />
                    </button>
                    <button onClick={() => setCustomSegments(prev => prev?.filter(s => s?.id !== seg?.id))} className="p-1.5 bg-card border border-border rounded-lg hover:bg-red-50 hover:text-red-600 shadow-sm">
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={() => { setEditSegment(null); setShowBuilder(true); }} className="border-2 border-dashed border-border rounded-xl p-5 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary">
                <Icon name="Plus" size={24} />
                <span className="text-sm font-medium">Nuevo segmento</span>
              </button>
            </div>
          )}
        </section>

        {/* Summary stats */}
        <section className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Distribución de tu base de clientes</h3>
          <div className="space-y-3">
            {autoSegments?.map(seg => {
              const colors = colorMap?.[seg?.color] || colorMap?.blue;
              const pct = Math.round(seg?.count / totalClients * 100);
              return (
                <div key={seg?.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${colors?.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon name={seg?.icon} size={16} className={colors?.icon} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{seg?.name}</span>
                      <span className="text-sm text-muted-foreground">{seg?.count} clientes ({pct}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${colors?.border?.replace('border-l-', 'bg-')}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
      {showBuilder && (
        <SegmentBuilderDrawer
          onClose={() => { setShowBuilder(false); setEditSegment(null); }}
          onSave={handleSave}
          editSegment={editSegment}
        />
      )}
      {suggestedActionSegment && (
        <SuggestedActionModal segment={suggestedActionSegment} onClose={() => setSuggestedActionSegment(null)} />
      )}
    </div>
  );
};

export default CRMSegmentsManagement;
