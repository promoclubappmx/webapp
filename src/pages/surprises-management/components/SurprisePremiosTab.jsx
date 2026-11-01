import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const PRIZE_TYPES = [
  { key: 'points', label: 'Puntos extra', icon: 'Zap', color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'coupon', label: 'Cupón de descuento', icon: 'Ticket', color: 'text-purple-600', bg: 'bg-purple-50' },
  { key: 'product', label: 'Producto gratis', icon: 'Gift', color: 'text-green-600', bg: 'bg-green-50' },
  { key: 'cashback', label: 'Cashback', icon: 'DollarSign', color: 'text-amber-600', bg: 'bg-amber-50' },
  { key: 'experience', label: 'Experiencia', icon: 'Star', color: 'text-rose-600', bg: 'bg-rose-50' },
];

const PRIZE_COLORS = ['#3B82F6', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2'];

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-primary' : 'bg-muted'}`}
  >
    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const SurprisePremiosTab = ({ form, onChange }) => {
  const [showAddPrize, setShowAddPrize] = useState(false);
  const [newPrize, setNewPrize] = useState({
    name: '', type: 'points', value: '', probability: 10, color: PRIZE_COLORS?.[0],
  });

  const prizes = form?.prizes || [];
  const totalProb = prizes?.reduce((s, p) => s + (Number(p?.probability) || 0), 0);

  const addPrize = () => {
    if (!newPrize?.name) return;
    const updated = [...prizes, { ...newPrize, id: Date.now(), probability: Number(newPrize?.probability) || 10 }];
    onChange({ ...form, prizes: updated });
    setNewPrize({
      name: '', type: 'points', value: '', probability: 10,
      color: PRIZE_COLORS?.[updated?.length % PRIZE_COLORS?.length],
    });
    setShowAddPrize(false);
  };

  const removePrize = (id) => onChange({ ...form, prizes: prizes?.filter(p => p?.id !== id) });

  const updatePrize = (id, field, value) =>
    onChange({ ...form, prizes: prizes?.map(p => p?.id === id ? { ...p, [field]: value } : p) });

  return (
    <div className="space-y-6">
      {/* Distribution Mode */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <Icon name="Shuffle" size={16} className="text-blue-600" />
          </div>
          <h3 className="font-semibold text-foreground">Modo de distribución</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { value: 'probabilistic', label: '🎲 Probabilístico', desc: 'Cada juego es independiente. Distribución natural por azar.' },
            { value: 'guaranteed', label: '📊 Garantizado', desc: 'El sistema asegura que la distribución real coincida con las probabilidades configuradas.' },
          ]?.map(opt => (
            <label
              key={opt?.value}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form?.distributionMode === opt?.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
            >
              <input
                type="radio"
                name="distributionMode"
                value={opt?.value}
                checked={form?.distributionMode === opt?.value}
                onChange={() => onChange({ ...form, distributionMode: opt?.value })}
                className="mt-0.5 flex-shrink-0"
              />
              <div>
                <p className="text-sm font-medium text-foreground">{opt?.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt?.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Prize Pool */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Icon name="Trophy" size={16} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Pool de premios</h3>
              <p className="text-xs text-muted-foreground">Las probabilidades deben sumar 100%</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-semibold ${totalProb === 100 ? 'text-green-600' : totalProb > 100 ? 'text-destructive' : 'text-amber-600'}`}>
              {totalProb}% / 100%
            </span>
            <button
              onClick={() => setShowAddPrize(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              <Icon name="Plus" size={12} />
              Agregar premio
            </button>
          </div>
        </div>

        {prizes?.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
            <Icon name="Trophy" size={24} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Agrega al menos un premio al pool</p>
          </div>
        )}

        <div className="space-y-2">
          {prizes?.map((prize) => (
            <div key={prize?.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border">
              <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: prize?.color }} />
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={prize?.name}
                  onChange={e => updatePrize(prize?.id, 'name', e?.target?.value)}
                  className="w-full bg-transparent text-sm font-medium text-foreground focus:outline-none"
                  placeholder="Nombre del premio"
                />
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={prize?.probability}
                  onChange={e => updatePrize(prize?.id, 'probability', Number(e?.target?.value))}
                  className="w-16 px-2 py-1 border border-border rounded-lg bg-input text-foreground text-xs text-center focus:outline-none"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
              <button onClick={() => removePrize(prize?.id)} className="p-1 hover:bg-destructive/10 rounded-lg transition-colors flex-shrink-0">
                <Icon name="X" size={14} className="text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>

        {showAddPrize && (
          <div className="border-2 border-primary/30 rounded-xl p-4 space-y-3 bg-primary/5">
            <h4 className="text-sm font-semibold text-foreground">Nuevo premio</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Nombre del premio</label>
                <input
                  type="text"
                  placeholder="Ej: 10 puntos extra"
                  value={newPrize?.name}
                  onChange={e => setNewPrize({ ...newPrize, name: e?.target?.value })}
                  className="w-full px-2.5 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Tipo</label>
                <select
                  value={newPrize?.type}
                  onChange={e => setNewPrize({ ...newPrize, type: e?.target?.value })}
                  className="w-full px-2.5 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                >
                  {PRIZE_TYPES?.map(t => <option key={t?.key} value={t?.key}>{t?.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Valor</label>
                <input
                  type="text"
                  placeholder="Ej: 10 pts, 15%, 1 café"
                  value={newPrize?.value}
                  onChange={e => setNewPrize({ ...newPrize, value: e?.target?.value })}
                  className="w-full px-2.5 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Probabilidad (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newPrize?.probability}
                  onChange={e => setNewPrize({ ...newPrize, probability: Number(e?.target?.value) })}
                  className="w-full px-2.5 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Color en la ruleta</label>
              <div className="flex gap-2">
                {PRIZE_COLORS?.map(c => (
                  <button
                    key={c}
                    onClick={() => setNewPrize({ ...newPrize, color: c })}
                    className={`w-7 h-7 rounded-full transition-all ${newPrize?.color === c ? 'ring-2 ring-offset-2 ring-foreground scale-110' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={addPrize} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors">
                Agregar
              </button>
              <button onClick={() => setShowAddPrize(false)} className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs font-medium hover:bg-muted/80 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Limits per user */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-violet-500/10 rounded-lg flex items-center justify-center">
            <Icon name="Shield" size={16} className="text-violet-600" />
          </div>
          <h3 className="font-semibold text-foreground">Límites por usuario</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Máximo por día</label>
            <input
              type="number"
              min="1"
              value={form?.maxPerUserDay || 1}
              onChange={e => onChange({ ...form, maxPerUserDay: parseInt(e?.target?.value) })}
              className="w-full px-3 py-2.5 border border-border rounded-xl bg-input text-foreground text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Máximo por mes</label>
            <input
              type="number"
              min="1"
              value={form?.maxPerUserMonth || 5}
              onChange={e => onChange({ ...form, maxPerUserMonth: parseInt(e?.target?.value) })}
              className="w-full px-3 py-2.5 border border-border rounded-xl bg-input text-foreground text-sm focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Expiration */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
            <Icon name="Clock" size={16} className="text-orange-600" />
          </div>
          <h3 className="font-semibold text-foreground">Expiración de sorpresas pendientes</h3>
        </div>
        <p className="text-xs text-muted-foreground">¿Cuántos días permanece pendiente si el usuario no abre la app?</p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="1"
            max="30"
            value={form?.expirationDays || 7}
            onChange={e => onChange({ ...form, expirationDays: parseInt(e?.target?.value) })}
            className="w-20 px-3 py-2 border border-border rounded-xl bg-input text-foreground text-sm focus:outline-none"
          />
          <span className="text-sm text-muted-foreground">días antes de expirar</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
          <div>
            <p className="text-sm font-medium text-foreground">Notificar antes de expirar</p>
            <p className="text-xs text-muted-foreground">Enviar push recordatorio al usuario</p>
          </div>
          <Toggle
            checked={form?.notifyBeforeExpiry !== false}
            onChange={v => onChange({ ...form, notifyBeforeExpiry: v })}
          />
        </div>
      </div>
    </div>
  );
};

export default SurprisePremiosTab;
