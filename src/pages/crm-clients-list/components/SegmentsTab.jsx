import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const AUTO_SEGMENTS = [
  { id: 'nuevos', name: 'Nuevos', icon: 'Star', color: 'green', description: 'Primera visita en los últimos 30 días', type: 'auto', filter: { days: 30, minVisits: 1, maxVisits: 2 } },
  { id: 'regulares', name: 'Regulares', icon: 'UserCheck', color: 'blue', description: '3+ visitas en los últimos 90 días', type: 'auto', filter: { days: 90, minVisits: 3 } },
  { id: 'vips', name: 'VIPs', icon: 'Crown', color: 'yellow', description: 'Nivel Plata o superior, o score > 80', type: 'auto', filter: { vipLevels: ['Plata', 'Oro'] } },
  { id: 'dormidos', name: 'Dormidos', icon: 'Moon', color: 'orange', description: 'Última visita hace 21 a 60 días', type: 'auto', filter: { inactiveDays: [21, 60] } },
  { id: 'perdidos', name: 'Perdidos', icon: 'HelpCircle', color: 'red', description: 'Última visita hace más de 60 días', type: 'auto', filter: { inactiveDaysMin: 60 } },
];

const RETARGETING_SEGMENTS = [
  { id: 'vieron', name: 'Vieron pero no visitaron', icon: 'Eye', color: 'cyan', description: 'Vieron la ficha en los últimos 14 días sin hacer check-in', suggestedAction: 'Enviar cupón de primera visita', type: 'retargeting' },
  { id: 'una-vez', name: 'Visitaron una vez y no volvieron', icon: 'RotateCcw', color: 'orange', description: 'Una sola visita hace más de 14 días', suggestedAction: 'Encuesta + cupón de segunda visita', type: 'retargeting' },
  { id: 'dormidos-2', name: 'Dormidos 2+ semanas', icon: 'Moon', color: 'amber', description: 'Clientes con 2+ visitas, inactivos 14-45 días', suggestedAction: 'Activar flow de reactivación', type: 'retargeting' },
  { id: 'dormidos-45', name: 'Dormidos 45+ días', icon: 'Hourglass', color: 'red', description: 'Inactividad mayor a 45 días', suggestedAction: 'Oferta agresiva de reconquista', type: 'retargeting' },
];

const colorMap = {
  green: { border: 'border-l-green-500', bg: 'bg-green-50', icon: 'text-green-600' },
  blue: { border: 'border-l-blue-500', bg: 'bg-blue-50', icon: 'text-blue-600' },
  yellow: { border: 'border-l-yellow-500', bg: 'bg-yellow-50', icon: 'text-yellow-600' },
  orange: { border: 'border-l-orange-500', bg: 'bg-orange-50', icon: 'text-orange-600' },
  red: { border: 'border-l-red-500', bg: 'bg-red-50', icon: 'text-red-600' },
  pink: { border: 'border-l-pink-500', bg: 'bg-pink-50', icon: 'text-pink-600' },
  cyan: { border: 'border-l-cyan-500', bg: 'bg-cyan-50', icon: 'text-cyan-600' },
  amber: { border: 'border-l-amber-500', bg: 'bg-amber-50', icon: 'text-amber-600' },
  purple: { border: 'border-l-purple-500', bg: 'bg-purple-50', icon: 'text-purple-600' },
  indigo: { border: 'border-l-indigo-500', bg: 'bg-indigo-50', icon: 'text-indigo-600' },
  slate: { border: 'border-l-slate-500', bg: 'bg-slate-50', icon: 'text-slate-600' },
  rose: { border: 'border-l-rose-500', bg: 'bg-rose-50', icon: 'text-rose-600' },
};

const PALETTE_COLORS = ['red', 'orange', 'amber', 'yellow', 'green', 'cyan', 'blue', 'indigo', 'purple', 'pink', 'rose', 'slate'];
const PALETTE_ICONS = ['Star', 'Users', 'Heart', 'Zap', 'Crown', 'Coffee', 'Briefcase', 'Gift', 'Target', 'Flame', 'Trophy', 'Award', 'Bookmark', 'Tag', 'Bell', 'ShoppingBag', 'MapPin', 'Moon', 'Sun', 'Sparkles'];
const CRITERIA_FIELDS = ['Visitas totales', 'Visitas en últimos X días', 'Score de engagement', 'Última visita (hace X días)', 'Nivel VIP', 'Tiene tag', 'No tiene tag', 'Saldo de puntos', 'Puntos acumulados', 'Estado'];
const CRITERIA_OPS = ['es', 'no es', 'mayor que', 'menor que', 'contiene', 'entre'];

const SegmentCard = ({ segment, onSuggestedAction, onEdit, onDelete, totalClients }) => {
  const colors = colorMap?.[segment?.color] || colorMap?.blue;
  const isPositive = (segment?.variation || 0) > 0;
  const isNegative = (segment?.variation || 0) < 0;
  return (
    <div className={`bg-card rounded-xl border border-border border-l-4 ${colors?.border} p-5 hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${colors?.bg} flex items-center justify-center`}>
            <Icon name={segment?.icon || 'Star'} size={20} className={colors?.icon} />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">{segment?.name}</h3>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
              segment?.type === 'auto' ? 'bg-slate-100 text-slate-600' :
              segment?.type === 'retargeting'? 'bg-cyan-100 text-cyan-700' : 'bg-purple-100 text-purple-700'
            }`}>
              {segment?.type === 'auto' ? 'Automático' : segment?.type === 'retargeting' ? 'Retargeting' : 'Personalizado'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-foreground">{segment?.count ?? 0}</div>
          {segment?.variation !== undefined && (
            <div className={`text-xs flex items-center justify-end gap-0.5 font-medium ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-muted-foreground'}`}>
              {isPositive && <Icon name="TrendingUp" size={12} />}
              {isNegative && <Icon name="TrendingDown" size={12} />}
              {(segment?.variation || 0) > 0 ? '+' : ''}{segment?.variation !== 0 ? segment?.variation : '—'}
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{segment?.description}</p>
      <div className="flex gap-2">
        <button className="flex-1 text-center text-xs py-2 border border-border rounded-lg hover:bg-muted transition-colors font-medium">Ver clientes</button>
        {segment?.type === 'retargeting' && (
          <button onClick={() => onSuggestedAction?.(segment)} className="flex-1 text-xs py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium">Acción sugerida</button>
        )}
        {segment?.type === 'custom' && (
          <div className="flex gap-1">
            <button onClick={() => onEdit?.(segment)} className="px-3 py-2 text-xs border border-border rounded-lg hover:bg-muted transition-colors">
              <Icon name="Pencil" size={12} />
            </button>
            <button onClick={() => onDelete?.(segment?.id)} className="px-3 py-2 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
              <Icon name="Trash2" size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const NewSegmentModal = ({ onClose, onSave, editSegment }) => {
  const [name, setName] = useState(editSegment?.name || '');
  const [color, setColor] = useState(editSegment?.color || 'blue');
  const [icon, setIcon] = useState(editSegment?.icon || 'Star');
  const [description, setDescription] = useState(editSegment?.description || '');
  const [criteria, setCriteria] = useState(editSegment?.criteria?.length ? editSegment?.criteria : [{ field: CRITERIA_FIELDS?.[0], op: CRITERIA_OPS?.[0], value: '' }]);
  const [saving, setSaving] = useState(false);

  const addCriteria = () => setCriteria(prev => [...prev, { field: CRITERIA_FIELDS?.[0], op: CRITERIA_OPS?.[0], value: '' }]);
  const removeCriteria = (i) => setCriteria(prev => prev?.filter((_, idx) => idx !== i));
  const updateCriteria = (i, key, val) => setCriteria(prev => prev?.map((c, idx) => idx === i ? { ...c, [key]: val } : c));

  const colorDots = { red: 'bg-red-500', orange: 'bg-orange-500', amber: 'bg-amber-500', yellow: 'bg-yellow-500', green: 'bg-green-500', cyan: 'bg-cyan-500', blue: 'bg-blue-500', indigo: 'bg-indigo-500', purple: 'bg-purple-500', pink: 'bg-pink-500', rose: 'bg-rose-500', slate: 'bg-slate-500' };

  const handleSave = async () => {
    if (!name?.trim()) return;
    setSaving(true);
    await onSave?.({ name: name?.trim(), color, icon, description, criteria });
    setSaving(false);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <h3 className="font-semibold text-lg">{editSegment ? 'Editar segmento' : 'Nuevo segmento'}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted"><Icon name="X" size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Nombre del segmento *</label>
            <input className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background" placeholder="Ej. Clientes frecuentes de fin de semana" value={name} onChange={e => setName(e?.target?.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Descripción</label>
            <input className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background" placeholder="Describe brevemente este segmento" value={description} onChange={e => setDescription(e?.target?.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Color</label>
            <div className="flex flex-wrap gap-2">
              {PALETTE_COLORS?.map(c => (
                <button key={c} onClick={() => setColor(c)} className={`w-7 h-7 rounded-full ${colorDots?.[c]} transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-foreground scale-110' : ''}`} />
              ))}
            </div>
          </div>
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
          <div>
            <label className="text-sm font-medium mb-2 block">Criterios <span className="text-muted-foreground font-normal">(lógica AND)</span></label>
            <div className="space-y-2">
              {criteria?.map((c, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/30 rounded-xl p-3">
                  {i > 0 && <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">Y</span>}
                  <select className="flex-1 border border-border rounded-lg px-2 py-1.5 text-xs bg-background" value={c?.field} onChange={e => updateCriteria(i, 'field', e?.target?.value)}>
                    {CRITERIA_FIELDS?.map(f => <option key={f}>{f}</option>)}
                  </select>
                  <select className="border border-border rounded-lg px-2 py-1.5 text-xs bg-background" value={c?.op} onChange={e => updateCriteria(i, 'op', e?.target?.value)}>
                    {CRITERIA_OPS?.map(o => <option key={o}>{o}</option>)}
                  </select>
                  <input className="w-20 border border-border rounded-lg px-2 py-1.5 text-xs bg-background" placeholder="Valor" value={c?.value} onChange={e => updateCriteria(i, 'value', e?.target?.value)} />
                  {criteria?.length > 1 && (
                    <button onClick={() => removeCriteria(i)} className="p-1 text-muted-foreground hover:text-destructive transition-colors"><Icon name="X" size={14} /></button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addCriteria} className="mt-2 flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
              <Icon name="Plus" size={16} />Agregar criterio
            </button>
          </div>
        </div>
        <div className="p-5 border-t border-border flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={!name?.trim() || saving} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar segmento'}
          </button>
        </div>
      </div>
    </div>
  );
};

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
        <a href="/coupons-management" className="flex items-center gap-3 p-3 border border-border rounded-xl hover:bg-muted transition-colors cursor-pointer">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Icon name="Ticket" size={20} className="text-green-600" />
          </div>
          <div>
            <div className="text-sm font-medium">Enviar cupón a este segmento</div>
            <div className="text-xs text-muted-foreground">Seleccionar cupón existente y enviar</div>
          </div>
          <Icon name="ChevronRight" size={16} className="ml-auto text-muted-foreground" />
        </a>
      </div>
    </div>
  </div>
);

const SegmentsTab = ({ ownerCustomers = [] }) => {
  const { user } = useAuth();
  const [customSegments, setCustomSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSegment, setEditSegment] = useState(null);
  const [suggestedActionSegment, setSuggestedActionSegment] = useState(null);
  const [error, setError] = useState(null);

  // Compute auto segment counts from ownerCustomers
  const computeAutoSegments = useCallback(() => {
    const now = new Date();
    return AUTO_SEGMENTS?.map(seg => {
      let count = 0;
      if (seg?.id === 'nuevos') {
        count = ownerCustomers?.filter(oc => {
          const linked = new Date(oc?.linked_at);
          const days = (now - linked) / (1000 * 60 * 60 * 24);
          return days <= 30;
        })?.length;
      } else if (seg?.id === 'regulares') {
        count = ownerCustomers?.filter(oc => (oc?.customer_profiles?.total_visits || 0) >= 3)?.length;
      } else if (seg?.id === 'vips') {
        count = ownerCustomers?.filter(oc => ['Plata', 'Oro']?.includes(oc?.customer_profiles?.vip_level || ''))?.length;
      } else if (seg?.id === 'dormidos') {
        count = ownerCustomers?.filter(oc => {
          const last = oc?.customer_profiles?.last_visit_at ? new Date(oc?.customer_profiles?.last_visit_at) : null;
          if (!last) return false;
          const days = (now - last) / (1000 * 60 * 60 * 24);
          return days >= 21 && days <= 60;
        })?.length;
      } else if (seg?.id === 'perdidos') {
        count = ownerCustomers?.filter(oc => {
          const last = oc?.customer_profiles?.last_visit_at ? new Date(oc?.customer_profiles?.last_visit_at) : null;
          if (!last) return false;
          const days = (now - last) / (1000 * 60 * 60 * 24);
          return days > 60;
        })?.length;
      } else {
        count = 0;
      }
      return { ...seg, count };
    });
  }, [ownerCustomers]);

  const computeRetargetingSegments = useCallback(() => {
    const now = new Date();
    return RETARGETING_SEGMENTS?.map(seg => {
      let count = 0;
      if (seg?.id === 'una-vez') {
        count = ownerCustomers?.filter(oc => (oc?.customer_profiles?.total_visits || 0) === 1)?.length;
      } else if (seg?.id === 'dormidos-2') {
        count = ownerCustomers?.filter(oc => {
          const last = oc?.customer_profiles?.last_visit_at ? new Date(oc?.customer_profiles?.last_visit_at) : null;
          if (!last) return false;
          const days = (now - last) / (1000 * 60 * 60 * 24);
          return days >= 14 && days <= 45 && (oc?.customer_profiles?.total_visits || 0) >= 2;
        })?.length;
      } else if (seg?.id === 'dormidos-45') {
        count = ownerCustomers?.filter(oc => {
          const last = oc?.customer_profiles?.last_visit_at ? new Date(oc?.customer_profiles?.last_visit_at) : null;
          if (!last) return false;
          const days = (now - last) / (1000 * 60 * 60 * 24);
          return days > 45;
        })?.length;
      } else {
        count = 0;
      }
      return { ...seg, count };
    });
  }, [ownerCustomers]);

  const fetchCustomSegments = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase?.from('crm_segments')?.select('*')?.eq('owner_id', user?.id)?.order('created_at', { ascending: false });
      if (err) throw err;
      setCustomSegments(data || []);
    } catch (e) {
      setError(e?.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchCustomSegments(); }, [fetchCustomSegments]);

  const handleSave = async (data) => {
    if (!user?.id) return;
    try {
      if (editSegment) {
        const { error: err } = await supabase?.from('crm_segments')?.update({ ...data, updated_at: new Date()?.toISOString() })?.eq('id', editSegment?.id)?.eq('owner_id', user?.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase?.from('crm_segments')?.insert({ ...data, owner_id: user?.id, segment_type: 'custom' });
        if (err) throw err;
      }
      setEditSegment(null);
      await fetchCustomSegments();
    } catch (e) {
      console.error('Error saving segment:', e?.message);
    }
  };

  const handleDelete = async (segId) => {
    if (!user?.id || !segId) return;
    try {
      const { error: err } = await supabase?.from('crm_segments')?.delete()?.eq('id', segId)?.eq('owner_id', user?.id);
      if (err) throw err;
      await fetchCustomSegments();
    } catch (e) {
      console.error('Error deleting segment:', e?.message);
    }
  };

  const autoSegs = computeAutoSegments();
  const retargetingSegs = computeRetargetingSegments();
  const totalClients = ownerCustomers?.length || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm text-muted-foreground">{AUTO_SEGMENTS?.length} segmentos automáticos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
            <span className="text-sm text-muted-foreground">{RETARGETING_SEGMENTS?.length} retargeting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-sm text-muted-foreground">{customSegments?.length} personalizados</span>
          </div>
        </div>
        <button onClick={() => { setEditSegment(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Icon name="Plus" size={16} />Nuevo segmento
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {/* Auto segments */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Segmentos automáticos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {autoSegs?.map(seg => (
            <SegmentCard key={seg?.id} segment={seg} totalClients={totalClients} onSuggestedAction={() => {}} onEdit={(s) => { setEditSegment(s); setShowModal(true); }} onDelete={handleDelete} />
          ))}
        </div>
      </div>

      {/* Retargeting segments */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Retargeting</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {retargetingSegs?.map(seg => (
            <SegmentCard key={seg?.id} segment={seg} onSuggestedAction={setSuggestedActionSegment} totalClients={totalClients} onEdit={(s) => { setEditSegment(s); setShowModal(true); }} onDelete={handleDelete} />
          ))}
        </div>
      </div>

      {/* Custom segments */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Segmentos personalizados</h3>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground text-sm">Cargando segmentos...</div>
        ) : customSegments?.length === 0 ? (
          <div className="py-10 text-center border-2 border-dashed border-border rounded-xl">
            <Icon name="Layers" size={32} className="mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No tienes segmentos personalizados aún</p>
            <button onClick={() => { setEditSegment(null); setShowModal(true); }} className="mt-3 text-sm text-primary hover:underline">Crear el primero</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {customSegments?.map(seg => (
              <SegmentCard
                key={seg?.id}
                segment={{ ...seg, type: 'custom', count: seg?.customer_count || 0 }}
                onEdit={(s) => { setEditSegment(s); setShowModal(true); }}
                onDelete={handleDelete}
                totalClients={totalClients}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <NewSegmentModal
          onClose={() => { setShowModal(false); setEditSegment(null); }}
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

export default SegmentsTab;
