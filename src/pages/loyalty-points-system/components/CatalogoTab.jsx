import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const POINT_VALUE_MXN = 0.15;

const REWARD_TYPES = [
  { id: 'free_product', label: 'Producto gratis', icon: 'Gift', color: 'text-purple-600 bg-purple-50' },
  { id: 'pct_discount', label: '% Descuento', icon: 'Percent', color: 'text-blue-600 bg-blue-50' },
  { id: 'fixed_discount', label: 'Monto fijo', icon: 'DollarSign', color: 'text-green-600 bg-green-50' },
  { id: 'experience', label: 'Experiencia', icon: 'Star', color: 'text-amber-600 bg-amber-50' },
  { id: 'upgrade', label: 'Upgrade', icon: 'ArrowUp', color: 'text-cyan-600 bg-cyan-50' },
  { id: 'other', label: 'Otro', icon: 'MoreHorizontal', color: 'text-gray-600 bg-gray-50' },
];

const VIP_LEVELS = [
  { id: 'all', label: 'Disponible para todos' },
  { id: 'bronze', label: 'Solo Bronce+' },
  { id: 'silver', label: 'Solo Plata+' },
  { id: 'gold', label: 'Solo Oro' },
];

const INITIAL_REWARDS = [
  { id: 1, name: 'Café americano gratis', description: 'Un café americano regular en cualquier presentación.', type: 'free_product', cost: 100, status: 'active', totalRedeemed: 234, inventory: null, vipLevel: 'all' },
  { id: 2, name: 'Desayuno completo', description: 'Desayuno completo con bebida incluida.', type: 'free_product', cost: 300, status: 'active', totalRedeemed: 89, inventory: null, vipLevel: 'all' },
  { id: 3, name: '30% de descuento', description: 'Descuento del 30% en tu próxima visita.', type: 'pct_discount', cost: 200, status: 'active', totalRedeemed: 156, inventory: null, vipLevel: 'all' },
  { id: 4, name: 'Experiencia de cata con el chef', description: 'Acceso exclusivo a cata privada con el chef.', type: 'experience', cost: 1000, status: 'active', totalRedeemed: 12, inventory: 5, vipLevel: 'gold' },
];

const EMPTY_FORM = {
  name: '', description: '', type: 'free_product', cost: 100,
  status: 'active', inventory: null, hasInventory: false,
  vipLevel: 'all', alwaysAvailable: true,
};

const typeInfo = (type) => REWARD_TYPES?.find(t => t?.id === type) || REWARD_TYPES?.[0];

const RewardCard = ({ reward, onEdit, onToggle, onDelete, basePointsPerVisit = 10 }) => {
  const info = typeInfo(reward?.type);
  const visitsNeeded = basePointsPerVisit > 0 ? Math.ceil(reward?.cost / basePointsPerVisit) : '—';
  const valueMXN = (reward?.cost * POINT_VALUE_MXN)?.toFixed(2);
  return (
    <div className={`bg-card border rounded-xl overflow-hidden transition-all ${
      reward?.status === 'active' ? 'border-border' : 'border-border opacity-60'
    }`}>
      <div className="h-28 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${info?.color}`}>
          <Icon name={info?.icon} size={28} />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-foreground text-sm leading-tight">{reward?.name}</h4>
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
            reward?.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
            reward?.status === 'paused' ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'
          }`}>
            {reward?.status === 'active' ? 'Activo' : reward?.status === 'paused' ? 'Pausado' : 'Archivado'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{reward?.description}</p>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Icon name="Star" size={14} className="text-amber-500" />
            <span className="text-lg font-bold text-foreground">{reward?.cost?.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">pts</span>
          </div>
          <span className="text-xs text-muted-foreground">${valueMXN} MXN</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span>{reward?.totalRedeemed} canjes</span>
          <span>{visitsNeeded} visitas para alcanzar</span>
        </div>
        {reward?.inventory !== null && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Inventario</span>
              <span className="font-medium text-foreground">{reward?.inventory} disponibles</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full" style={{ width: `${Math.min(100, (reward?.inventory / 20) * 100)}%` }} />
            </div>
          </div>
        )}
        {reward?.vipLevel !== 'all' && (
          <div className="flex items-center gap-1 mb-3">
            <Icon name="Crown" size={12} className="text-amber-500" />
            <span className="text-xs text-amber-600">{VIP_LEVELS?.find(v => v?.id === reward?.vipLevel)?.label}</span>
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={() => onEdit(reward)} className="flex-1 text-xs py-1.5 border border-border rounded-lg hover:bg-muted/50 text-foreground transition-colors">
            Editar
          </button>
          <button onClick={() => onToggle(reward?.id)} className="flex-1 text-xs py-1.5 border border-border rounded-lg hover:bg-muted/50 text-foreground transition-colors">
            {reward?.status === 'active' ? 'Pausar' : 'Activar'}
          </button>
          <button onClick={() => onDelete(reward?.id)} className="px-2 py-1.5 border border-destructive/30 rounded-lg hover:bg-destructive/5 text-destructive transition-colors">
            <Icon name="Trash2" size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

const B2CPreview = ({ form }) => {
  const info = typeInfo(form?.type);
  return (
    <div className="sticky top-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Preview en app B2C</p>
      <div className="bg-slate-900 rounded-2xl p-4 max-w-xs mx-auto">
        <div className="bg-slate-800 rounded-xl overflow-hidden">
          <div className="h-24 bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${info?.color}`}>
              <Icon name={info?.icon} size={24} />
            </div>
          </div>
          <div className="p-3">
            <p className="font-semibold text-white text-sm mb-1">{form?.name || 'Nombre de la recompensa'}</p>
            <p className="text-xs text-slate-400 mb-3">{form?.description || 'Descripción de la recompensa'}</p>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                <Icon name="Star" size={14} className="text-amber-400" />
                <span className="text-lg font-bold text-white">{(form?.cost || 0)?.toLocaleString()}</span>
                <span className="text-xs text-slate-400">pts</span>
              </div>
              <span className="text-xs text-slate-400">${((form?.cost || 0) * POINT_VALUE_MXN)?.toFixed(2)} MXN</span>
            </div>
            <button className="w-full py-2 bg-primary rounded-lg text-white text-sm font-medium">
              Canjear
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-500 text-center mt-3">Vista del usuario en su wallet</p>
      </div>
    </div>
  );
};

const RewardForm = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-5">
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Nombre <span className="text-destructive">*</span></label>
          <input value={form?.name} onChange={e => set('name', e?.target?.value)} maxLength={60}
            placeholder="Ej: Café americano gratis"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
          <p className="text-xs text-muted-foreground mt-1">{form?.name?.length}/60</p>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Descripción</label>
          <textarea value={form?.description} onChange={e => set('description', e?.target?.value)} maxLength={200} rows={2}
            placeholder="Detalle de la recompensa..."
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground resize-none" />
          <p className="text-xs text-muted-foreground mt-1">{form?.description?.length}/200</p>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Tipo de recompensa</label>
          <div className="grid grid-cols-3 gap-2">
            {REWARD_TYPES?.map(t => (
              <button key={t?.id} onClick={() => set('type', t?.id)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  form?.type === t?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                }`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 ${t?.color}`}>
                  <Icon name={t?.icon} size={14} />
                </div>
                <p className="text-xs font-medium text-foreground">{t?.label}</p>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Costo en puntos <span className="text-destructive">*</span></label>
          <input type="number" min="1" value={form?.cost} onChange={e => set('cost', parseInt(e?.target?.value) || 0)}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
          <p className="text-xs text-muted-foreground mt-1">Equivale a ${(form?.cost * POINT_VALUE_MXN)?.toFixed(2)} MXN en valor de recompensa</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Nivel VIP requerido</label>
            <select value={form?.vipLevel} onChange={e => set('vipLevel', e?.target?.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground">
              {VIP_LEVELS?.map(v => <option key={v?.id} value={v?.id}>{v?.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Estado</label>
            <select value={form?.status} onChange={e => set('status', e?.target?.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground">
              <option value="active">Activo</option>
              <option value="paused">Pausado</option>
              <option value="archived">Archivado</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form?.hasInventory} onChange={e => set('hasInventory', e?.target?.checked)} className="rounded" />
            <span className="text-foreground">Inventario limitado</span>
          </label>
          {form?.hasInventory && (
            <input type="number" min="1" value={form?.inventory || 10} onChange={e => set('inventory', parseInt(e?.target?.value))}
              placeholder="Unidades"
              className="w-28 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
          )}
        </div>
        <div className="flex gap-3 pt-2">
          <Button onClick={() => onSave(form)} iconName="Save">Guardar recompensa</Button>
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        </div>
      </div>
      <div className="lg:col-span-2">
        <B2CPreview form={form} />
      </div>
    </div>
  );
};

const CatalogoTab = () => {
  const navigate = useNavigate();
  const [rewards, setRewards] = useState(INITIAL_REWARDS);
  const [showForm, setShowForm] = useState(false);
  const [editingReward, setEditingReward] = useState(null);

  const handleSave = (form) => {
    if (editingReward) {
      setRewards(prev => prev?.map(r => r?.id === editingReward?.id ? { ...form, id: editingReward?.id, totalRedeemed: editingReward?.totalRedeemed } : r));
    } else {
      setRewards(prev => [...prev, { ...form, id: Date.now(), totalRedeemed: 0 }]);
    }
    setShowForm(false);
    setEditingReward(null);
  };

  const handleEdit = (reward) => { setEditingReward(reward); setShowForm(true); };
  const handleToggle = (id) => setRewards(prev => prev?.map(r => r?.id === id ? { ...r, status: r?.status === 'active' ? 'paused' : 'active' } : r));
  const handleDelete = (id) => setRewards(prev => prev?.filter(r => r?.id !== id));

  const active = rewards?.filter(r => r?.status === 'active');
  const minCost = active?.length > 0 ? Math.min(...active?.map(r => r?.cost)) : 0;
  const maxCost = active?.length > 0 ? Math.max(...active?.map(r => r?.cost)) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Catálogo de recompensas</h3>
          <p className="text-sm text-muted-foreground">{rewards?.length} recompensas · {active?.length} activas</p>
        </div>
        {!showForm && (
          <Button onClick={() => navigate('/loyalty-points-system/catalogo/nueva-recompensa')} iconName="Plus">
            Nueva recompensa
          </Button>
        )}
      </div>
      {/* Structure indicator */}
      {!showForm && active?.length > 0 && (
        <div className="p-4 bg-muted/30 border border-border rounded-xl">
          <div className="flex items-start gap-3">
            <Icon name="BarChart2" size={18} className="text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Estructura del catálogo</p>
              <p className="text-sm text-muted-foreground">
                {active?.length} recompensas activas · Rango: <strong>{minCost?.toLocaleString()}</strong> a <strong>{maxCost?.toLocaleString()}</strong> puntos.
                {active?.length < 3 && ' Recomendación: incluye al menos 3 recompensas con costos escalonados (bajo, medio, alto).'}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Form */}
      {showForm && (
        <div className="border border-border rounded-xl p-6 bg-card">
          <h4 className="font-semibold text-foreground mb-5">{editingReward ? 'Editar recompensa' : 'Nueva recompensa'}</h4>
          <RewardForm
            initial={editingReward}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingReward(null); }}
          />
        </div>
      )}
      {/* Grid */}
      {!showForm && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rewards?.map(reward => (
            <RewardCard
              key={reward?.id}
              reward={reward}
              onEdit={handleEdit}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
          {rewards?.length === 0 && (
            <div className="col-span-full text-center py-16">
              <Icon name="Gift" size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Sin recompensas configuradas</p>
              <p className="text-sm text-muted-foreground mt-1">Crea tu primera recompensa para que los clientes puedan canjear sus puntos.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CatalogoTab;
