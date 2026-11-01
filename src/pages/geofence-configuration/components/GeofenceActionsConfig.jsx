import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 ${checked ? 'bg-primary' : 'bg-muted'}`}
  >
    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const CollapsibleAction = ({ title, icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-card hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground" />
      </button>
      {open && <div className="px-5 pb-5 pt-3 bg-card border-t border-border space-y-4">{children}</div>}
    </div>
  );
};

const GeofenceActionsConfig = ({ geofenceActive, onChange }) => {
  // Action 1 state
  const [notifyEntry, setNotifyEntry] = useState(true);
  const [linkPromo, setLinkPromo] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState('');
  const [linkCoupon, setLinkCoupon] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState('');
  const [entryAudience, setEntryAudience] = useState('all');
  const [inactiveDays, setInactiveDays] = useState(30);

  // Action 2 state
  const [notifyExit, setNotifyExit] = useState(false);
  const [exitDelay, setExitDelay] = useState('immediate');
  const [exitCondition, setExitCondition] = useState('always');
  const [exitCoupon, setExitCoupon] = useState(false);

  // Action 3 state
  const [autoCheckin, setAutoCheckin] = useState(false);
  const [checkinRadius, setCheckinRadius] = useState(100);

  // Action 4 state
  const [reviewTrigger, setReviewTrigger] = useState(false);
  const [reviewType, setReviewType] = useState('review');
  const [reviewCondition, setReviewCondition] = useState('checkin');
  const [reviewDelay, setReviewDelay] = useState('30min');

  const promos = ['Café gratis en tu primera visita', '2x1 en bebidas calientes', 'Descuento 20% en desayuno'];
  const coupons = ['Cupón 15% descuento', 'Bebida gratis', 'Postre de regalo'];

  const handleChange = () => onChange?.();

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6">
      <h2 className="text-base font-semibold text-foreground mb-2">¿Qué pasa cuando un cliente entra o sale de tu zona?</h2>
      <p className="text-sm text-muted-foreground mb-4">Configura las acciones automáticas para cada evento de proximidad.</p>
      <div className="space-y-3">
        {/* Action 1 - Entry notification */}
        <CollapsibleAction title="Notificación de bienvenida al entrar" icon="👋" defaultOpen={true}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Notificación al entrar al radio</p>
              <p className="text-xs text-muted-foreground">Envía un mensaje cuando el cliente entra a tu zona</p>
            </div>
            <Toggle checked={notifyEntry} onChange={(v) => { setNotifyEntry(v); handleChange(); }} />
          </div>

          {notifyEntry && (
            <div className="space-y-4 pt-2 border-t border-border">
              {/* Link promo */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">Vincular a una promoción activa</p>
                  <Toggle checked={linkPromo} onChange={(v) => { setLinkPromo(v); handleChange(); }} />
                </div>
                {linkPromo && (
                  <select
                    value={selectedPromo}
                    onChange={(e) => { setSelectedPromo(e?.target?.value); handleChange(); }}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="">Seleccionar promoción...</option>
                    {promos?.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                )}
              </div>

              {/* Link coupon */}
              {!linkPromo && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">Vincular cupón</p>
                    <Toggle checked={linkCoupon} onChange={(v) => { setLinkCoupon(v); handleChange(); }} />
                  </div>
                  {linkCoupon && (
                    <select
                      value={selectedCoupon}
                      onChange={(e) => { setSelectedCoupon(e?.target?.value); handleChange(); }}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
                    >
                      <option value="">Seleccionar cupón...</option>
                      {coupons?.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  )}
                </div>
              )}

              {/* Audience */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Segmentación de audiencia</p>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'Todos los clientes PromoClub cercanos' },
                    { value: 'known', label: 'Solo mis clientes conocidos' },
                    { value: 'inactive', label: 'Clientes que no visitan hace más de X días' },
                    { value: 'loyalty', label: 'Por nivel de lealtad' },
                  ]?.map(opt => (
                    <label key={opt?.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="entry-audience"
                        value={opt?.value}
                        checked={entryAudience === opt?.value}
                        onChange={() => { setEntryAudience(opt?.value); handleChange(); }}
                        className="accent-primary"
                      />
                      <span className="text-sm text-foreground">{opt?.label}</span>
                      {opt?.value === 'inactive' && entryAudience === 'inactive' && (
                        <input
                          type="number"
                          value={inactiveDays}
                          onChange={(e) => setInactiveDays(e?.target?.value)}
                          className="w-16 px-2 py-0.5 text-sm border border-border rounded-lg bg-background text-foreground font-mono"
                        />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl text-blue-700 text-xs">
                <Icon name="Info" size={14} className="flex-shrink-0 mt-0.5" />
                <span>PromoClub limita las notificaciones de proximidad a <strong>1 por día por negocio</strong> para no saturar a tus clientes.</span>
              </div>

              <a href="/geofence-notifications" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                <Icon name="Eye" size={12} />
                Ver preview del mensaje →
              </a>
            </div>
          )}
        </CollapsibleAction>

        {/* Action 2 - Exit notification */}
        <CollapsibleAction title="Notificación de despedida al salir" icon="👋">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Notificación al salir del radio</p>
              <p className="text-xs text-muted-foreground">Ideal para entregar un cupón de regreso mientras tu negocio está fresco en su memoria.</p>
            </div>
            <Toggle checked={notifyExit} onChange={(v) => { setNotifyExit(v); handleChange(); }} />
          </div>

          {notifyExit && (
            <div className="space-y-4 pt-2 border-t border-border">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Delay post-salida</p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: 'immediate', label: 'Inmediato' },
                    { value: '5min', label: '5 minutos' },
                    { value: '15min', label: '15 minutos' },
                  ]?.map(opt => (
                    <button
                      key={opt?.value}
                      onClick={() => { setExitDelay(opt?.value); handleChange(); }}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${exitDelay === opt?.value ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border text-muted-foreground hover:border-primary/40'}`}
                    >
                      {opt?.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Un pequeño delay evita falsos positivos si el cliente solo pasó momentáneamente.</p>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-2">Condición de envío</p>
                <div className="space-y-2">
                  {[
                    { value: 'always', label: 'Siempre al salir' },
                    { value: 'no-checkin', label: 'Solo si no hizo check-in' },
                    { value: 'checkin', label: 'Solo si hizo check-in' },
                  ]?.map(opt => (
                    <label key={opt?.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="exit-condition"
                        value={opt?.value}
                        checked={exitCondition === opt?.value}
                        onChange={() => { setExitCondition(opt?.value); handleChange(); }}
                        className="accent-primary"
                      />
                      <span className="text-sm text-foreground">{opt?.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">Vincular cupón de regreso</p>
                  <Toggle checked={exitCoupon} onChange={(v) => { setExitCoupon(v); handleChange(); }} />
                </div>
                {exitCoupon && (
                  <select className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground">
                    <option value="">Seleccionar cupón...</option>
                    {coupons?.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                )}
              </div>
            </div>
          )}
        </CollapsibleAction>

        {/* Action 3 - Auto check-in */}
        <CollapsibleAction title="Check-in automático al entrar" icon="📍">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Check-in automático por geofence</p>
              <p className="text-xs text-muted-foreground">El cliente recibe sus puntos automáticamente al entrar a tu zona sin necesidad de escanear ningún código.</p>
            </div>
            <Toggle checked={autoCheckin} onChange={(v) => { setAutoCheckin(v); handleChange(); }} />
          </div>

          {autoCheckin && (
            <div className="space-y-4 pt-2 border-t border-border">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Radio de check-in automático</p>
                <div className="flex gap-2 flex-wrap">
                  {[50, 100, 150, 200]?.map(r => (
                    <button
                      key={r}
                      onClick={() => { setCheckinRadius(r); handleChange(); }}
                      className={`px-3 py-1.5 text-xs rounded-lg border font-mono transition-colors ${checkinRadius === r ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border text-muted-foreground hover:border-primary/40'}`}
                    >
                      {r}m
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Para check-in automático recomendamos un radio más pequeño (50-100m) para asegurar que el cliente realmente está en tu negocio.</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                <div>
                  <p className="text-xs font-medium text-foreground">Puntos por check-in automático</p>
                  <p className="text-xs text-muted-foreground">Hereda la configuración del módulo de Lealtad</p>
                </div>
                <a href="/loyalty-points-system" className="text-xs text-primary font-medium hover:underline">Configurar →</a>
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl text-blue-700 text-xs">
                <Icon name="Info" size={14} className="flex-shrink-0 mt-0.5" />
                <span>El cliente debe haber otorgado permisos de ubicación en background. Solo aplica para usuarios con esos permisos activos.</span>
              </div>
            </div>
          )}
        </CollapsibleAction>

        {/* Action 4 - Review trigger */}
        <CollapsibleAction title="Trigger de encuesta o reseña post-visita" icon="⭐">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Solicitar reseña o encuesta al salir</p>
              <p className="text-xs text-muted-foreground">Aprovecha que el cliente acaba de estar en tu negocio para pedirle su opinión mientras la experiencia está fresca.</p>
            </div>
            <Toggle checked={reviewTrigger} onChange={(v) => { setReviewTrigger(v); handleChange(); }} />
          </div>

          {reviewTrigger && (
            <div className="space-y-4 pt-2 border-t border-border">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">¿Qué solicitar?</p>
                <div className="space-y-2">
                  {[
                    { value: 'review', label: 'Reseña', desc: 'Conecta con módulo de Reseñas' },
                    { value: 'nps', label: 'Encuesta NPS', desc: 'Conecta con módulo de Encuestas' },
                    { value: 'custom', label: 'Encuesta personalizada', desc: 'Selecciona una encuesta activa' },
                  ]?.map(opt => (
                    <label key={opt?.value} className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="review-type"
                        value={opt?.value}
                        checked={reviewType === opt?.value}
                        onChange={() => { setReviewType(opt?.value); handleChange(); }}
                        className="accent-primary mt-0.5"
                      />
                      <div>
                        <span className="text-sm text-foreground font-medium">{opt?.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">{opt?.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-2">Condición</p>
                <div className="space-y-2">
                  {[
                    { value: 'checkin', label: 'Solo si hizo check-in verificado (recomendado)' },
                    { value: 'always', label: 'Siempre al salir del radio' },
                  ]?.map(opt => (
                    <label key={opt?.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="review-condition"
                        value={opt?.value}
                        checked={reviewCondition === opt?.value}
                        onChange={() => { setReviewCondition(opt?.value); handleChange(); }}
                        className="accent-primary"
                      />
                      <span className="text-sm text-foreground">{opt?.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-2">Delay post-salida</p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: '30min', label: '30 min' },
                    { value: '1h', label: '1 hora' },
                    { value: '2h', label: '2 horas' },
                  ]?.map(opt => (
                    <button
                      key={opt?.value}
                      onClick={() => { setReviewDelay(opt?.value); handleChange(); }}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${reviewDelay === opt?.value ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border text-muted-foreground hover:border-primary/40'}`}
                    >
                      {opt?.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-xs">
                <Icon name="AlertTriangle" size={14} className="flex-shrink-0 mt-0.5 text-yellow-600" />
                <span>⚠️ Ya tienes configurada una solicitud de reseña post check-in en el módulo de Reseñas. Activar este trigger puede duplicar solicitudes al mismo cliente. Considera desactivar uno de los dos.</span>
              </div>
            </div>
          )}
        </CollapsibleAction>
      </div>
    </div>
  );
};

export default GeofenceActionsConfig;
