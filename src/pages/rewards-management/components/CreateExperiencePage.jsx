import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { createExperience, POINTS_RULES, pointsToMXN } from '../../../services/rewardsService';

const CreateExperiencePage = ({ businessId, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    name: '', description: '', inventory: 5, duration: '60', durationUnit: 'minutos',
    accessType: 'level', accessLevel: 'gold', accessPoints: 500, accessVisits: 25,
    perceivedValue: '', hasDate: false, eventDate: '', eventTime: '',
    emoji: '⭐'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }));
  const emojis = ['⭐', '☕', '✂️', '🍷', '🏋️', '💆', '🎨', '🍕', '🎭', '🌿', '💎', '🏆'];

  const handleSave = async () => {
    if (!businessId || !formData?.name) return;
    try {
      setSaving(true);
      setError(null);
      await createExperience(businessId, { ...formData });
      onSaved?.();
    } catch (err) {
      console.error('Error saving experience:', err);
      setError('Error al guardar la experiencia. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <Icon name="ArrowLeft" size={20} className="text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nueva Experiencia Exclusiva</h1>
          <p className="text-sm text-muted-foreground">Crea un premio aspiracional de alto valor</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
          <Icon name="AlertCircle" size={16} className="text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex gap-6">
        {/* Form */}
        <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-6 space-y-5">
            {/* Identidad */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center">1</span>
                Identidad
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Emoji representativo</label>
                  <div className="flex gap-2 flex-wrap">
                    {emojis?.map(e => (
                      <button
                        key={e}
                        onClick={() => set('emoji', e)}
                        className={`w-10 h-10 rounded-xl border-2 text-xl transition-all ${
                          formData?.emoji === e ? 'border-primary bg-primary/10 scale-110' : 'border-border hover:border-muted-foreground'
                        }`}
                      >{e}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Nombre de la experiencia <span className="text-destructive">*</span></label>
                  <input
                    type="text" maxLength={60}
                    value={formData?.name}
                    onChange={e => set('name', e?.target?.value)}
                    placeholder="Ej: Cata privada con el barista"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Descripción</label>
                  <textarea
                    maxLength={500}
                    value={formData?.description}
                    onChange={e => set('description', e?.target?.value)}
                    placeholder="Describe qué incluye la experiencia, duración, qué esperar..."
                    rows={4}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{formData?.description?.length}/500</p>
                </div>
              </div>
            </div>

            {/* Logística */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center">2</span>
                Logística
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Unidades disponibles</label>
                  <input
                    type="number" min="1" max="100"
                    value={formData?.inventory}
                    onChange={e => set('inventory', parseInt(e?.target?.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">El contador baja con cada reclamación</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Duración</label>
                  <div className="flex gap-2">
                    <input
                      type="number" min="1"
                      value={formData?.duration}
                      onChange={e => set('duration', e?.target?.value)}
                      className="w-20 px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                    />
                    <select
                      value={formData?.durationUnit}
                      onChange={e => set('durationUnit', e?.target?.value)}
                      className="flex-1 px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                    >
                      <option value="minutos">Minutos</option>
                      <option value="horas">Horas</option>
                      <option value="días">Días</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData?.hasDate}
                    onChange={e => set('hasDate', e?.target?.checked)}
                  />
                  <span className="text-sm font-medium text-foreground">Tiene fecha y hora específica</span>
                </label>
                {formData?.hasDate && (
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={formData?.eventDate}
                      onChange={e => set('eventDate', e?.target?.value)}
                      className="px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                    />
                    <input
                      type="time"
                      value={formData?.eventTime}
                      onChange={e => set('eventTime', e?.target?.value)}
                      className="px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Acceso */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center">3</span>
                Requisitos de acceso
              </h3>
              <div className="space-y-3">
                {[
                  { id: 'all', label: 'Sin requisito', desc: 'Disponible para todos los clientes' },
                  { id: 'level', label: 'Por nivel VIP', desc: 'Solo clientes de cierto nivel o superior' },
                  { id: 'points', label: 'Por puntos', desc: `El cliente canjea puntos para acceder (1 pto = $${POINTS_RULES?.POINT_VALUE_MXN} MXN)` },
                  { id: 'visits', label: 'Por visitas', desc: 'Requiere un número de visitas acumuladas' },
                  { id: 'punch', label: 'Por punch card', desc: 'Disponible al completar una punch card' },
                ]?.map(opt => (
                  <label
                    key={opt?.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      formData?.accessType === opt?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <input type="radio" name="accessType" value={opt?.id} checked={formData?.accessType === opt?.id} onChange={e => set('accessType', e?.target?.value)} className="mt-1" />
                    <div className="flex-1">
                      <span className="font-medium text-foreground text-sm">{opt?.label}</span>
                      <p className="text-xs text-muted-foreground">{opt?.desc}</p>
                      {formData?.accessType === opt?.id && opt?.id === 'level' && (
                        <select
                          value={formData?.accessLevel}
                          onChange={e => set('accessLevel', e?.target?.value)}
                          className="mt-2 px-2 py-1 border border-border rounded bg-input text-foreground text-xs"
                        >
                          <option value="bronze">Bronce+</option>
                          <option value="silver">Plata+</option>
                          <option value="gold">Oro+</option>
                        </select>
                      )}
                      {formData?.accessType === opt?.id && opt?.id === 'points' && (
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="number" min="1"
                            value={formData?.accessPoints}
                            onChange={e => set('accessPoints', parseInt(e?.target?.value))}
                            className="w-24 px-2 py-1 border border-border rounded bg-input text-foreground text-xs"
                          />
                          <span className="text-xs text-muted-foreground">puntos</span>
                          {formData?.accessPoints > 0 && (
                            <span className="text-xs text-primary font-medium">= ${pointsToMXN(formData?.accessPoints || 0)} MXN</span>
                          )}
                        </div>
                      )}
                      {formData?.accessType === opt?.id && opt?.id === 'visits' && (
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="number" min="1"
                            value={formData?.accessVisits}
                            onChange={e => set('accessVisits', parseInt(e?.target?.value))}
                            className="w-24 px-2 py-1 border border-border rounded bg-input text-foreground text-xs"
                          />
                          <span className="text-xs text-muted-foreground">visitas acumuladas</span>
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Valor */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center">4</span>
                Valor percibido
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Valor estimado</span>
                <input
                  type="number" min="0"
                  value={formData?.perceivedValue}
                  onChange={e => set('perceivedValue', e?.target?.value)}
                  placeholder="800"
                  className="w-32 px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                />
                <span className="text-sm text-muted-foreground">MXN</span>
                {formData?.perceivedValue && (
                  <span className="text-sm text-primary font-medium">≈ {Math.round(parseFloat(formData?.perceivedValue) / POINTS_RULES?.POINT_VALUE_MXN)?.toLocaleString()} puntos equivalentes</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Se muestra en la app: "Experiencia valorada en $X MXN"</p>
            </div>

            {/* Removed step 5 Automatizaciones - now managed from ExperienciasTab */}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between p-6 border-t border-border bg-muted/20">
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !formData?.name}>
              {saving ? (
                <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Guardando...</>
              ) : (
                <><Icon name="Zap" size={16} className="mr-2" />Publicar experiencia</>
              )}
            </Button>
          </div>
        </div>

        {/* Preview - right side */}
        <div className="w-72 flex-shrink-0">
          <div className="sticky top-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Vista Previa</h3>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
              <div className="text-4xl mb-3 text-center">{formData?.emoji}</div>
              <h4 className="font-bold text-base text-center mb-2">{formData?.name || 'Nombre de la experiencia'}</h4>
              <p className="text-xs text-gray-300 text-center mb-4 line-clamp-3">{formData?.description || 'Descripción de la experiencia...'}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                  Exclusiva — Solo {formData?.inventory} disponibles
                </span>
              </div>
              {formData?.accessType === 'level' && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-400">Requiere:</span>
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">Nivel {formData?.accessLevel === 'gold' ? 'Oro' : formData?.accessLevel === 'silver' ? 'Plata' : 'Bronce'}+</span>
                </div>
              )}
              {formData?.accessType === 'points' && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-400">Canjea:</span>
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">{formData?.accessPoints} pts = ${pointsToMXN(formData?.accessPoints || 0)} MXN</span>
                </div>
              )}
              {formData?.perceivedValue && (
                <p className="text-xs text-gray-400 text-center mb-3">Valorada en ${parseInt(formData?.perceivedValue)?.toLocaleString()} MXN</p>
              )}
              <button className="w-full py-2 bg-white text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors">
                Reservar experiencia
              </button>
            </div>
            <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
              <p className="text-xs font-semibold text-primary mb-1">📐 Reglas de puntos</p>
              <p className="text-xs text-muted-foreground">${POINTS_RULES?.MXN_PER_POINT} MXN = 1 punto · 1 punto = ${POINTS_RULES?.POINT_VALUE_MXN} MXN</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateExperiencePage;
