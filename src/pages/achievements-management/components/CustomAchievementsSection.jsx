import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { AchievementBadge, RarityPill } from './AchievementCard';

const RARITY_OPTIONS = [
  { value: 'comun', label: 'Común' },
  { value: 'raro', label: 'Raro' },
  { value: 'epico', label: 'Épico' },
  { value: 'legendario', label: 'Legendario' },
  { value: 'unico', label: 'Único' },
];

const COLOR_SWATCHES = [
  '#10B981', '#CD7F32', '#9E9E9E', '#FFB300', '#FF6B35', '#D4A853',
  '#059669', '#0891B2', '#7C3AED', '#6366F1', '#F59E0B', '#EF4444',
  '#EC4899', '#BE185D', '#D97706', '#1A3FE0',
];

const EMOJI_QUICK = ['🏆', '🥇', '🎖️', '⭐', '🌟', '💎', '👑', '🎯', '🚀', '🦋', '🎉', '💪', '🤝', '🌱', '🔥', '✨'];

const EXAMPLES = [
  { name: 'Cliente del mes', condition: 'Otorgado mensualmente al cliente que más impresionó al staff.' },
  { name: 'Primera compra especial', condition: 'Primera vez que un cliente hizo un pedido de alto valor.' },
  { name: 'Mejor reseña', condition: 'La reseña más detallada y útil del mes.' },
  { name: 'Ayudó en evento', condition: 'Cliente que participó como voluntario en un evento del negocio.' },
];

const emptyForm = {
  name: '',
  description_locked: '',
  description_unlocked: '',
  emoji: '🏆',
  color: '#D4A853',
  rarity: 'raro',
  internal_condition: '',
  reward_points: 0,
  celebration_message: '',
};

const CustomAchievementsSection = ({ customAchievements, onAdd, onEdit, onToggle }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form?.name?.trim()) return;
    setSaving(true);
    await onAdd(form);
    setForm(emptyForm);
    setShowForm(false);
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <Icon name="Sparkles" size={18} className="text-purple-500" />
            Logros Personalizados
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Logros que el staff otorga manualmente desde el CRM. El sistema no los evalúa automáticamente.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Icon name="Plus" size={14} />
          Crear logro personalizado
        </button>
      </div>
      {/* Info note */}
      <div className="flex items-start gap-3 p-3 bg-violet-50 border border-violet-200 rounded-xl">
        <Icon name="Info" size={16} className="text-violet-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-violet-800">
            Los logros personalizados se otorgan manualmente desde el perfil del cliente en el CRM. El sistema no los evalúa automáticamente.
          </p>
          <button className="text-xs text-violet-700 font-semibold underline mt-1 hover:text-violet-900">
            Ir a CRM para otorgar logros →
          </button>
        </div>
      </div>
      {/* Examples */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">Ejemplos de uso:</p>
        <div className="grid grid-cols-2 gap-2">
          {EXAMPLES?.map((ex, i) => (
            <div key={i} className="p-2.5 bg-muted/30 border border-border rounded-lg">
              <p className="text-xs font-semibold text-foreground">{ex?.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{ex?.condition}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Creation form */}
      {showForm && (
        <div className="border border-primary/30 rounded-xl p-5 bg-primary/5 space-y-4">
          <h4 className="text-sm font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>Nuevo logro personalizado</h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Nombre <span className="text-muted-foreground font-normal">(máx. 30)</span></label>
              <input
                value={form?.name}
                maxLength={30}
                onChange={e => set('name', e?.target?.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                placeholder="Cliente del mes"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Rareza</label>
              <select
                value={form?.rarity}
                onChange={e => set('rarity', e?.target?.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
              >
                {RARITY_OPTIONS?.map(r => (
                  <option key={r?.value} value={r?.value}>{r?.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Descripción para el cliente <span className="text-muted-foreground font-normal">(máx. 100)</span></label>
            <textarea
              value={form?.description_locked}
              maxLength={100}
              rows={2}
              onChange={e => set('description_locked', e?.target?.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground resize-none"
              placeholder="Descripción visible para el cliente"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Condición interna <span className="text-muted-foreground font-normal">(para el staff)</span></label>
            <textarea
              value={form?.internal_condition}
              rows={2}
              onChange={e => set('internal_condition', e?.target?.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground resize-none"
              placeholder="Cuándo y cómo otorgar este logro al cliente..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Emoji</label>
              <div className="flex flex-wrap gap-1">
                {EMOJI_QUICK?.map(e => (
                  <button
                    key={e}
                    onClick={() => set('emoji', e)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-base hover:bg-muted transition-colors ${form?.emoji === e ? 'bg-primary/10 ring-1 ring-primary' : ''}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Color</label>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_SWATCHES?.slice(0, 8)?.map(c => (
                  <button
                    key={c}
                    onClick={() => set('color', c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${form?.color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Puntos de recompensa <span className="text-muted-foreground font-normal">(opcional)</span></label>
            <input
              type="number"
              min="0"
              value={form?.reward_points}
              onChange={e => set('reward_points', parseInt(e?.target?.value) || 0)}
              className="w-28 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Mensaje de celebración <span className="text-muted-foreground font-normal">(máx. 160)</span></label>
            <textarea
              value={form?.celebration_message}
              maxLength={160}
              rows={2}
              onChange={e => set('celebration_message', e?.target?.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground resize-none"
              placeholder="¡Felicidades! Has ganado este logro especial 🏆"
            />
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
            <AchievementBadge emoji={form?.emoji} color={form?.color} rarity={form?.rarity} size={48} />
            <div>
              <p className="text-sm font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>{form?.name || 'Nombre del logro'}</p>
              <RarityPill rarity={form?.rarity} />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setShowForm(false); setForm(emptyForm); }}
              className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !form?.name?.trim()}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Crear logro'}
            </button>
          </div>
        </div>
      )}
      {/* Existing custom achievements */}
      {customAchievements?.length > 0 && (
        <div className="space-y-2">
          {customAchievements?.map(ach => (
            <div key={ach?.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
              <AchievementBadge emoji={ach?.emoji} color={ach?.color} rarity={ach?.rarity} size={44} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{ach?.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{ach?.internal_condition}</p>
                <div className="flex items-center gap-2 mt-1">
                  <RarityPill rarity={ach?.rarity} />
                  {ach?.reward_points > 0 && (
                    <span className="text-xs text-amber-600 font-medium">+{ach?.reward_points} pts</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onEdit(ach)}
                className="px-2.5 py-1 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
              >
                Editar
              </button>
            </div>
          ))}
        </div>
      )}
      {customAchievements?.length === 0 && !showForm && (
        <div className="text-center py-8 text-muted-foreground">
          <Icon name="Sparkles" size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Aún no hay logros personalizados</p>
          <p className="text-xs mt-1">Crea logros únicos que el staff puede otorgar manualmente</p>
        </div>
      )}
    </div>
  );
};

export default CustomAchievementsSection;
