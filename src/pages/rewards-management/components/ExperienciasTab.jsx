import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { fetchExperiences, createExperience, restockExperience, POINTS_RULES, pointsToMXN } from '../../../services/rewardsService';

const CreateExperienceForm = ({ onClose, onSave, saving }) => {
  const [formData, setFormData] = useState({
    name: '', description: '', inventory: 5, duration: '60', durationUnit: 'minutos',
    accessType: 'level', accessLevel: 'gold', accessPoints: 500, accessVisits: 25,
    perceivedValue: '', hasDate: false, eventDate: '', eventTime: '',
    emoji: '⭐'
  });

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }));
  const emojis = ['⭐', '☕', '✂️', '🍷', '🏋️', '💆', '🎨', '🍕', '🎭', '🌿', '💎', '🏆'];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-4xl my-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Nueva Experiencia Exclusiva</h2>
            <p className="text-sm text-muted-foreground">Crea un premio aspiracional de alto valor</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        <div className="flex gap-0">
          {/* Form */}
          <div className="flex-1 p-6 space-y-5 overflow-y-auto max-h-[75vh]">
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
          </div>

          {/* Preview */}
          <div className="w-72 border-l border-border p-6 bg-muted/20">
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
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">{formData?.accessLevel === 'gold' ? 'Oro' : formData?.accessLevel === 'silver' ? 'Plata' : 'Bronce'}+</span>
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
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/20">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={() => onSave({ ...formData })} disabled={saving || !formData?.name}>
            {saving ? (
              <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Guardando...</>
            ) : (
              <><Icon name="Zap" size={16} className="mr-2" />Publicar experiencia</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ExperienciasTab = ({ businessId, onDataChange, onCreateNew }) => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showTriggersSection, setShowTriggersSection] = useState(false);
  const [globalTriggers, setGlobalTriggers] = useState({
    on_claim: true,
    on_waitlist_join: false,
    on_reminder_24h: true,
    on_review_request: false,
  });
  const [globalActions, setGlobalActions] = useState({
    sendConfirmation: true,
    confirmationChannel: 'push',
    bonusPoints: false,
    bonusPointsAmount: 100,
    requestReview: false,
    specialReferral: false,
  });

  useEffect(() => {
    if (businessId) loadExperiences();
    else setLoading(false);
  }, [businessId]);

  const loadExperiences = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchExperiences(businessId);
      setExperiences(data);
    } catch (err) {
      setError('Error al cargar las experiencias');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    if (!businessId) return;
    try {
      setSaving(true);
      await createExperience(businessId, formData);
      await loadExperiences();
      onDataChange?.();
      setShowCreate(false);
    } catch (err) {
      setError('Error al guardar la experiencia');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleRestock = async (id) => {
    try {
      await restockExperience(id, 5);
      await loadExperiences();
    } catch (err) {
      console.error('Error restocking experience:', err);
    }
  };

  const getAccessLabel = (exp) => {
    if (exp?.accessType === 'all') return 'Todos';
    if (exp?.accessType === 'level') return `Nivel ${exp?.accessLevel === 'gold' ? 'Oro' : exp?.accessLevel === 'silver' ? 'Plata' : 'Bronce'}+`;
    if (exp?.accessType === 'points') return `${exp?.accessPoints} pts = $${pointsToMXN(exp?.accessPoints || 0)} MXN`;
    if (exp?.accessType === 'visits') return `${exp?.accessVisits} visitas`;
    return 'Requisito especial';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Icon name="Loader2" size={32} className="text-primary animate-spin" />
        <span className="ml-3 text-muted-foreground">Cargando experiencias...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
          <Icon name="AlertCircle" size={16} className="text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
          <button onClick={loadExperiences} className="ml-auto text-xs text-destructive underline">Reintentar</button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Experiencias Exclusivas</h3>
          <p className="text-sm text-muted-foreground">Premios aspiracionales de alto valor percibido</p>
        </div>
        <Button onClick={() => onCreateNew ? onCreateNew() : setShowCreate(true)}>
          <Icon name="Plus" size={16} className="mr-2" />
          Nueva Experiencia
        </Button>
      </div>
      {/* Points rule reminder */}
      <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
        <span className="text-lg">📐</span>
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Regla de puntos:</strong> ${POINTS_RULES?.MXN_PER_POINT} MXN = 1 punto · 1 punto = ${POINTS_RULES?.POINT_VALUE_MXN} MXN. Los requisitos de acceso en puntos se calculan con esta equivalencia.
        </p>
      </div>
      {experiences?.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">✨</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No hay experiencias</h3>
          <p className="text-muted-foreground mb-6">Crea tu primera experiencia exclusiva</p>
          <Button onClick={() => onCreateNew ? onCreateNew() : setShowCreate(true)}>
            <Icon name="Plus" size={16} className="mr-2" />
            Crear experiencia
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {experiences?.map(exp => {
            const inventoryLeft = (exp?.inventory || 0) - (exp?.inventoryUsed || 0);
            const inventoryPct = exp?.inventory > 0 ? (inventoryLeft / exp?.inventory) * 100 : 0;
            const isSoldOut = exp?.status === 'sold_out' || inventoryLeft <= 0;

            return (
              <div key={exp?.id} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-xl relative">
                {isSoldOut && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 rounded-2xl">
                    <div className="text-center">
                      <p className="text-white font-bold text-xl">AGOTADA</p>
                      <button
                        onClick={() => handleRestock(exp?.id)}
                        className="mt-2 px-4 py-1.5 bg-white text-gray-900 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
                      >
                        Reabastecer +5
                      </button>
                    </div>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-4xl">{exp?.emoji}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      isSoldOut ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {isSoldOut ? 'Agotada' : 'Activa'}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-base mb-2">{exp?.name}</h4>
                  <p className="text-gray-400 text-xs mb-4 line-clamp-2">{exp?.description}</p>

                  {/* Inventory bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Inventario</span>
                      <span className="text-xs text-white font-medium">{inventoryLeft} de {exp?.inventory}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          inventoryPct > 50 ? 'bg-green-500' : inventoryPct > 20 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.max(inventoryPct, 0)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/20">
                      {getAccessLabel(exp)}
                    </span>
                    <span className="text-xs text-gray-400">{exp?.duration}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <p className="text-white font-bold">{exp?.claimed || 0}</p>
                      <p className="text-xs text-gray-400">Reclamadas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-bold">{exp?.waitlist || 0}</p>
                      <p className="text-xs text-gray-400">En espera</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-bold">${exp?.perceivedValue ? parseInt(exp?.perceivedValue)?.toLocaleString() : '—'}</p>
                      <p className="text-xs text-gray-400">Valor MXN</p>
                    </div>
                  </div>

                  {exp?.hasDate && exp?.eventDate && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                      <Icon name="Calendar" size={12} />
                      <span>{new Date(exp.eventDate)?.toLocaleDateString('es-MX')} {exp?.eventTime && `— ${exp?.eventTime}`}</span>
                    </div>
                  )}

                  {exp?.perceivedValue && (
                    <div className="mb-3 px-2 py-1 bg-white/5 rounded-lg">
                      <p className="text-xs text-gray-300">≈ {Math.round(parseFloat(exp?.perceivedValue) / POINTS_RULES?.POINT_VALUE_MXN)?.toLocaleString()} puntos equivalentes</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors flex items-center justify-center gap-1">
                      <Icon name="Edit" size={12} />
                      Editar
                    </button>
                    {!isSoldOut && (
                      <button
                        onClick={() => handleRestock(exp?.id)}
                        className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Icon name="Plus" size={12} />
                        Reabastecer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ⚡ Triggers y Automatizaciones Globales */}
      <div className="border border-border rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowTriggersSection(!showTriggersSection)}
          className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-purple-500/5 to-transparent hover:from-purple-500/10 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Icon name="Zap" size={18} className="text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">⚡ Triggers y Automatizaciones</p>
              <p className="text-xs text-muted-foreground">Configura qué sucede automáticamente al reclamar una experiencia</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-purple-500/10 text-purple-600 text-xs font-medium rounded-full border border-purple-500/20">
              {Object.values(globalTriggers)?.filter(Boolean)?.length} trigger{Object.values(globalTriggers)?.filter(Boolean)?.length !== 1 ? 's' : ''} activo{Object.values(globalTriggers)?.filter(Boolean)?.length !== 1 ? 's' : ''}
            </span>
            <Icon name={showTriggersSection ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground" />
          </div>
        </button>

        {showTriggersSection && (
          <div className="p-5 border-t border-border space-y-6">
            {/* Trigger Events */}
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Icon name="Zap" size={16} className="text-purple-600" />
                ¿Cuándo se dispara la automatización?
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { id: 'on_claim', label: 'Al reclamar la experiencia', desc: 'Confirmación inmediata al momento de la reclamación', icon: '🎟️', est: 'Principal' },
                  { id: 'on_waitlist_join', label: 'Al unirse a lista de espera', desc: 'Cuando el inventario está agotado y el cliente se registra', icon: '📋', est: 'Espera' },
                  { id: 'on_reminder_24h', label: 'Recordatorio 24h antes', desc: 'Si la experiencia tiene fecha, envía recordatorio previo', icon: '⏰', est: 'Recordatorio' },
                  { id: 'on_review_request', label: 'Solicitar reseña post-experiencia', desc: '24 horas después de la fecha del evento', icon: '⭐', est: 'Feedback' },
                ]?.map(trigger => (
                  <label
                    key={trigger?.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      globalTriggers?.[trigger?.id] ? 'border-purple-500 bg-purple-500/5' : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={globalTriggers?.[trigger?.id] || false}
                      onChange={e => setGlobalTriggers(prev => ({ ...prev, [trigger?.id]: e?.target?.checked }))}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>{trigger?.icon}</span>
                        <span className="font-medium text-foreground text-sm">{trigger?.label}</span>
                        <span className="px-1.5 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">{trigger?.est}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{trigger?.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Global Actions */}
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Icon name="Settings" size={16} className="text-purple-600" />
                Acciones automáticas globales
              </h4>
              <div className="space-y-3">
                {/* Send confirmation */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-medium text-foreground">Enviar confirmación y detalles</p>
                    <p className="text-xs text-muted-foreground">Mensaje de confirmación inmediato al reclamar</p>
                  </div>
                  <button
                    onClick={() => setGlobalActions(p => ({ ...p, sendConfirmation: !p?.sendConfirmation }))}
                    className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                      globalActions?.sendConfirmation ? 'bg-purple-600' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${
                      globalActions?.sendConfirmation ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                {globalActions?.sendConfirmation && (
                  <div className="ml-4 p-3 bg-card border border-border rounded-xl">
                    <label className="block text-xs font-medium text-foreground mb-1">Canal de confirmación</label>
                    <select
                      value={globalActions?.confirmationChannel || 'push'}
                      onChange={e => setGlobalActions(p => ({ ...p, confirmationChannel: e?.target?.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                    >
                      <option value="push">Push notification</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="email">Email</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">Variables: {'{nombre}'} {'{experiencia}'} {'{fecha}'}</p>
                  </div>
                )}

                {/* Bonus points */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-medium text-foreground">Acreditar puntos bonus post-experiencia</p>
                    <p className="text-xs text-muted-foreground">Puntos adicionales por vivir la experiencia</p>
                  </div>
                  <button
                    onClick={() => setGlobalActions(p => ({ ...p, bonusPoints: !p?.bonusPoints }))}
                    className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                      globalActions?.bonusPoints ? 'bg-purple-600' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${
                      globalActions?.bonusPoints ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                {globalActions?.bonusPoints && (
                  <div className="ml-4 p-3 bg-card border border-border rounded-xl">
                    <label className="block text-xs font-medium text-foreground mb-1">Puntos bonus</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number" min="1"
                        value={globalActions?.bonusPointsAmount || 100}
                        onChange={e => setGlobalActions(p => ({ ...p, bonusPointsAmount: parseInt(e?.target?.value) }))}
                        className="w-28 px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                      />
                      <span className="text-xs text-muted-foreground">puntos</span>
                      {(globalActions?.bonusPointsAmount || 100) > 0 && (
                        <span className="text-sm font-semibold text-success">= ${pointsToMXN(globalActions?.bonusPointsAmount || 100)} MXN</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">1 pto = ${POINTS_RULES?.POINT_VALUE_MXN} MXN</p>
                  </div>
                )}

                {/* Request review */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-medium text-foreground">Solicitar reseña 24h después</p>
                    <p className="text-xs text-muted-foreground">Encuesta post-experiencia para medir satisfacción</p>
                  </div>
                  <button
                    onClick={() => setGlobalActions(p => ({ ...p, requestReview: !p?.requestReview }))}
                    className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                      globalActions?.requestReview ? 'bg-purple-600' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${
                      globalActions?.requestReview ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {/* Special referral */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-medium text-foreground">Activar referral especial post-experiencia</p>
                    <p className="text-xs text-muted-foreground">El cliente puede referir con beneficio mejorado después de vivir la experiencia</p>
                  </div>
                  <button
                    onClick={() => setGlobalActions(p => ({ ...p, specialReferral: !p?.specialReferral }))}
                    className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                      globalActions?.specialReferral ? 'bg-purple-600' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${
                      globalActions?.specialReferral ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
              <Icon name="Info" size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Automatizaciones por experiencia</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cada experiencia también puede tener sus propias automatizaciones configuradas individualmente al crearla. Las reglas globales aquí aplican a <strong>todas</strong> las experiencias activas.
                </p>
                <p className="text-xs text-primary mt-1">Regla: ${POINTS_RULES?.MXN_PER_POINT} MXN = 1 punto · 1 punto = ${POINTS_RULES?.POINT_VALUE_MXN} MXN</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreate && !onCreateNew && <CreateExperienceForm onClose={() => setShowCreate(false)} onSave={handleSave} saving={saving} />}
    </div>
  );
};

export default ExperienciasTab;
