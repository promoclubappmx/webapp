import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FLOW_STEPS = {
  welcome: [
    { type: 'trigger', icon: 'Zap', name: 'Trigger: Nuevo registro', desc: 'El usuario se registra en el negocio', wait: null, hasCondition: false, channel: null },
    { type: 'push', icon: 'Bell', name: 'Push de bienvenida', desc: 'Mensaje inmediato de bienvenida', wait: null, hasCondition: false, channel: 'push',
      preview: { title: '¡Bienvenido/a {nombre}! 🎉', body: 'Te preparamos algo especial para tu primera visita. ¡Ven a conocernos!', app: 'PromoSpot' } },
    { type: 'action', icon: 'Star', name: 'Acreditar 50 puntos', desc: 'Puntos de bienvenida al wallet', wait: null, hasCondition: false, channel: 'wallet',
      preview: { type: 'points', amount: 50, label: 'Puntos de bienvenida' } },
    { type: 'wait', icon: 'Clock', name: 'Esperar 3 días', desc: 'El sistema espera a que el usuario visite', wait: '3 días', hasCondition: true, channel: null,
      conditionLabel: '¿El usuario visitó el negocio?' },
    { type: 'coupon', icon: 'Ticket', name: 'Cupón primera visita', desc: 'Descuento del 15% para primera visita', wait: null, hasCondition: false, channel: 'wallet',
      preview: { type: 'coupon', discount: '15%', title: 'Cupón Primera Visita', expires: '14 días', code: 'BIENVENIDA15' } },
    { type: 'push', icon: 'Bell', name: 'Recordatorio cupón', desc: 'Recordatorio antes de que venza', wait: '7 días', hasCondition: false, channel: 'push',
      preview: { title: 'Tu cupón de bienvenida vence pronto ⏰', body: 'Tienes 7 días para usar tu 15% de descuento. ¡No lo dejes pasar!', app: 'PromoSpot' } },
  ],
  reactivation: [
    { type: 'trigger', icon: 'Zap', name: 'Trigger: 21 días sin visita', desc: 'Cliente sin actividad por 21 días', wait: null, hasCondition: false, channel: null },
    { type: 'push', icon: 'Bell', name: 'Push suave + 10% descuento', desc: 'Primer intento de reactivación', wait: null, hasCondition: false, channel: 'push',
      preview: { title: '¡Te extrañamos, {nombre}! 💙', body: 'Han pasado 21 días desde tu última visita. Aquí va un 10% de descuento para tu regreso.', app: 'PromoSpot' } },
    { type: 'wait', icon: 'Clock', name: 'Esperar 7 días', desc: 'Evalúa si el cliente respondió', wait: '7 días', hasCondition: true, channel: null,
      conditionLabel: '¿El cliente visitó o canjeó el cupón?' },
    { type: 'email', icon: 'Mail', name: 'Email con 20% descuento', desc: 'Segundo intento más agresivo', wait: null, hasCondition: false, channel: 'email',
      preview: { subject: 'Tenemos novedades para ti, {nombre}', body: 'Desde tu última visita hemos agregado nuevos productos. Aquí va un 20% de descuento exclusivo para ti.', from: 'hola@negocio.com' } },
    { type: 'wait', icon: 'Clock', name: 'Esperar 7 días más', desc: 'Última oportunidad', wait: '7 días', hasCondition: true, channel: null,
      conditionLabel: '¿El cliente respondió al email?' },
    { type: 'push', icon: 'Bell', name: 'Oferta final 25% (48h)', desc: 'Oferta de último recurso con urgencia', wait: null, hasCondition: false, channel: 'push',
      preview: { title: '🚨 Oferta final: 25% OFF — Solo 48 horas', body: 'Es nuestra última oferta especial para ti. Vence en 48 horas. ¡No la pierdas!', app: 'PromoSpot' } },
  ],
  birthday: [
    { type: 'trigger', icon: 'Zap', name: 'Trigger: 3 días antes del cumpleaños', desc: 'Sistema detecta cumpleaños próximo', wait: null, hasCondition: false, channel: null },
    { type: 'push', icon: 'Bell', name: 'Teaser misterioso', desc: 'Genera expectativa antes del día', wait: null, hasCondition: false, channel: 'push',
      preview: { title: 'Se acerca tu día especial 🎂', body: 'En tu negocio favorito te tenemos una sorpresa. ¡Espera noticias muy pronto!', app: 'PromoSpot' } },
    { type: 'coupon', icon: 'Gift', name: 'Regalo de cumpleaños (día D)', desc: 'Push + cupón especial el día del cumpleaños', wait: '3 días', hasCondition: false, channel: 'wallet',
      preview: { type: 'coupon', discount: 'Gratis', title: '🎂 Regalo de Cumpleaños', expires: '7 días', code: 'BDAY2024' } },
    { type: 'push', icon: 'Bell', name: 'Recordatorio (3 días después)', desc: 'Si no ha canjeado, recordatorio', wait: '3 días', hasCondition: true, channel: 'push',
      conditionLabel: '¿El usuario ya canjeó su regalo?',
      preview: { title: 'Tu regalo de cumpleaños te espera 🎁', body: 'Aún tienes 4 días para usar tu regalo especial. ¡Ven a celebrar con nosotros!', app: 'PromoSpot' } },
    { type: 'push', icon: 'Bell', name: 'Último recordatorio', desc: '1 día antes de que venza', wait: '3 días', hasCondition: false, channel: 'push',
      preview: { title: '⏰ Tu regalo vence mañana', body: '¡Último día para usar tu regalo de cumpleaños! No dejes que expire.', app: 'PromoSpot' } },
  ],
  'post-visit': [
    { type: 'trigger', icon: 'Zap', name: 'Trigger: Primera visita + 24h', desc: 'Primera visita completada, espera 24 horas', wait: null, hasCondition: false, channel: null },
    { type: 'push', icon: 'Bell', name: 'Encuesta NPS', desc: 'Mini-encuesta de satisfacción', wait: null, hasCondition: false, channel: 'push',
      preview: { title: '¿Cómo te fue en tu visita? ⭐', body: 'Califica tu experiencia del 1 al 10. Solo toma 10 segundos.', app: 'PromoSpot' } },
    { type: 'condition', icon: 'GitBranch', name: 'Bifurcación por NPS', desc: 'Rama según calificación del usuario', wait: null, hasCondition: true, channel: null,
      conditionLabel: '¿Qué calificación dio el usuario? (NPS 9-10 = Promotor)' },
    { type: 'coupon', icon: 'Ticket', name: 'Cupón segunda visita (NPS 7-8)', desc: 'Incentivo para volver', wait: null, hasCondition: false, channel: 'wallet',
      preview: { type: 'coupon', discount: '15%', title: 'Cupón Segunda Visita', expires: '21 días', code: 'REGRESA15' } },
  ],
};

const CHANNEL_COLORS = {
  push: 'bg-blue-100 text-blue-700 border-blue-200',
  email: 'bg-purple-100 text-purple-700 border-purple-200',
  wallet: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  null: 'bg-muted text-muted-foreground border-border',
};

const CHANNEL_LABELS = { push: 'Push', email: 'Email', wallet: 'Wallet', null: '' };

const PushPreview = ({ preview }) => (
  <div className="mt-2 bg-gray-900 rounded-xl p-3 text-white max-w-xs">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center">
        <Icon name="Bell" size={11} className="text-white" />
      </div>
      <span className="text-xs text-gray-400">{preview?.app}</span>
      <span className="text-xs text-gray-500 ml-auto">ahora</span>
    </div>
    <p className="text-xs font-semibold leading-tight mb-1">{preview?.title}</p>
    <p className="text-xs text-gray-300 leading-tight">{preview?.body}</p>
  </div>
);

const EmailPreview = ({ preview }) => (
  <div className="mt-2 bg-white border border-gray-200 rounded-xl p-3 max-w-xs">
    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
      <Icon name="Mail" size={14} className="text-purple-500" />
      <div>
        <p className="text-xs font-semibold text-gray-800">{preview?.subject}</p>
        <p className="text-xs text-gray-400">De: {preview?.from}</p>
      </div>
    </div>
    <p className="text-xs text-gray-600 leading-relaxed">{preview?.body}</p>
  </div>
);

const CouponPreview = ({ preview }) => (
  <div className="mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-3 max-w-xs text-white">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-medium opacity-80">Cupón Digital</span>
      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{preview?.expires}</span>
    </div>
    <p className="text-lg font-bold">{preview?.discount}</p>
    <p className="text-sm font-medium">{preview?.title}</p>
    <div className="mt-2 bg-white/20 rounded-lg px-3 py-1.5">
      <p className="text-xs font-mono font-bold tracking-widest">{preview?.code}</p>
    </div>
  </div>
);

const SimulationTimeline = ({ flow, persona, currentStep, stepConditions, onNextStep, onCondition }) => {
  const steps = FLOW_STEPS?.[flow?.id] || FLOW_STEPS?.welcome;

  const getStepStatus = (idx) => {
    if (idx < currentStep) return 'completed';
    if (idx === currentStep) return 'active';
    return 'pending';
  };

  const isSkipped = (idx) => {
    if (idx <= currentStep) return false;
    for (let i = 0; i < idx; i++) {
      if (steps?.[i]?.hasCondition && stepConditions?.[i] === false) return true;
    }
    return false;
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${flow?.color} flex items-center justify-center`}>
            <Icon name={flow?.icon} size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{flow?.name}</p>
            <p className="text-xs text-muted-foreground">Simulando como: <span className="font-medium text-foreground">{persona?.name}</span></p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Paso {Math.min(currentStep + 1, steps?.length)} de {steps?.length}
        </div>
      </div>
      <div className="p-5 space-y-0 max-h-[500px] overflow-y-auto">
        {steps?.map((step, idx) => {
          const status = getStepStatus(idx);
          const skipped = isSkipped(idx);
          const isActive = status === 'active';
          const isDone = status === 'completed';

          return (
            <div key={idx} className="relative">
              {/* Connector line */}
              {idx < steps?.length - 1 && (
                <div className={`absolute left-5 top-10 w-0.5 h-8 ${
                  isDone ? 'bg-success' : 'bg-border'
                }`} />
              )}
              <div className={`flex gap-4 pb-6 ${
                skipped ? 'opacity-40' : ''
              }`}>
                {/* Step indicator */}
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                  isDone ? 'bg-success border-success text-white' : isActive ?'bg-primary border-primary text-white animate-pulse': 'bg-muted border-border text-muted-foreground'
                }`}>
                  {isDone ? <Icon name="Check" size={16} /> : <Icon name={step?.icon} size={16} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-sm font-semibold ${
                      isActive ? 'text-primary' : isDone ? 'text-foreground' : 'text-muted-foreground'
                    }`}>{step?.name}</p>
                    {step?.channel && (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${CHANNEL_COLORS?.[step?.channel]}`}>
                        {CHANNEL_LABELS?.[step?.channel]}
                      </span>
                    )}
                    {step?.wait && (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-xs text-muted-foreground bg-muted rounded-full">
                        <Icon name="Clock" size={11} />
                        {step?.wait}
                      </span>
                    )}
                    {skipped && <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">Omitido</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{step?.desc}</p>

                  {/* Message Preview */}
                  {(isDone || isActive) && step?.preview && (
                    <div>
                      {step?.channel === 'push' && <PushPreview preview={step?.preview} />}
                      {step?.channel === 'email' && <EmailPreview preview={step?.preview} />}
                      {step?.channel === 'wallet' && step?.preview?.type === 'coupon' && <CouponPreview preview={step?.preview} />}
                      {step?.channel === 'wallet' && step?.preview?.type === 'points' && (
                        <div className="mt-2 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 max-w-xs">
                          <Icon name="Star" size={16} className="text-amber-500" />
                          <span className="text-sm font-bold text-amber-700">+{step?.preview?.amount} puntos</span>
                          <span className="text-xs text-amber-600">{step?.preview?.label}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Condition toggle */}
                  {isActive && step?.hasCondition && (
                    <div className="mt-3 bg-warning/5 border border-warning/20 rounded-xl p-3">
                      <p className="text-xs font-medium text-warning mb-2">Simular condición:</p>
                      <p className="text-xs text-foreground mb-3">{step?.conditionLabel}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onCondition(idx, true)}
                          className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${
                            stepConditions?.[idx] === true
                              ? 'bg-success text-white border-success' :'border-border hover:border-success hover:text-success'
                          }`}>
                          ✓ Sí
                        </button>
                        <button
                          onClick={() => onCondition(idx, false)}
                          className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${
                            stepConditions?.[idx] === false
                              ? 'bg-destructive text-white border-destructive' :'border-border hover:border-destructive hover:text-destructive'
                          }`}>
                          ✗ No
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Next Step button */}
                  {isActive && (!step?.hasCondition || stepConditions?.[idx] !== undefined) && (
                    <div className="mt-3">
                      <Button variant="default" size="sm" onClick={() => onNextStep(steps)} iconName="ChevronRight" iconPosition="right">
                        {idx === steps?.length - 1 ? 'Finalizar simulación' : 'Siguiente paso'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimulationTimeline;
