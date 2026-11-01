import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const userProfiles = [
  { id: 'new', label: 'Nuevo cliente', desc: 'Registrado hace 2 días, 0 visitas', icon: 'UserPlus', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'dormant', label: 'Cliente dormido 30d', desc: 'Sin visita en 32 días, 8 visitas previas', icon: 'UserX', color: 'bg-purple-100 text-purple-700' },
  { id: 'vip', label: 'Cliente VIP', desc: 'Nivel Oro, 47 visitas, alto valor', icon: 'Crown', color: 'bg-amber-100 text-amber-700' },
  { id: 'birthday', label: 'Cumpleañero', desc: 'Cumpleaños en 3 días, cliente frecuente', icon: 'Gift', color: 'bg-pink-100 text-pink-700' },
];

const flowSteps = [
  {
    id: 1, type: 'trigger', icon: 'Zap', name: 'Trigger: Nuevo registro',
    preview: null, waitNext: null, status: 'executed',
    detail: 'El usuario se registró en el sistema. Se inicia el flow de bienvenida.',
  },
  {
    id: 2, type: 'push', icon: 'Bell', name: 'Push de bienvenida',
    preview: { type: 'push', title: '¡Bienvenido a PromoSpot! 🎉', body: 'Te preparamos algo especial para tu primera visita. ¡Ven a conocernos!' },
    waitNext: null, status: 'executed',
    detail: 'Notificación push enviada inmediatamente al registro.',
  },
  {
    id: 3, type: 'action', icon: 'Star', name: 'Acreditar 50 puntos de bienvenida',
    preview: { type: 'points', amount: 50, message: 'Puntos de bienvenida acreditados en tu cuenta' },
    waitNext: '3 días', status: 'executed',
    detail: 'Se acreditan 50 puntos automáticamente al wallet del usuario.',
  },
  {
    id: 4, type: 'condition', icon: 'GitBranch', name: '¿El usuario visitó en 3 días?',
    preview: null, waitNext: null, status: 'pending',
    detail: 'Bifurcación: si el usuario realizó check-in en los últimos 3 días.',
    branches: [
      { label: 'Sí visitó', icon: 'CheckCircle', color: 'text-emerald-600', outcome: 'Salida exitosa del flow' },
      { label: 'No visitó', icon: 'XCircle', color: 'text-red-500', outcome: 'Continúa al paso 5' },
    ],
    selectedBranch: null,
  },
  {
    id: 5, type: 'coupon', icon: 'Ticket', name: 'Enviar cupón primera visita 15%',
    preview: { type: 'coupon', discount: '15%', code: 'BIENVENIDA15', expires: '14 días', business: 'PromoSpot Demo' },
    waitNext: '7 días', status: 'pending',
    detail: 'Cupón de descuento enviado al wallet del usuario.',
  },
  {
    id: 6, type: 'push', icon: 'Bell', name: 'Recordatorio: cupón por vencer',
    preview: { type: 'push', title: 'Tu cupón vence pronto ⏰', body: 'Tu descuento del 15% en PromoSpot vence en 3 días. ¡No lo dejes ir!' },
    waitNext: null, status: 'pending',
    detail: 'Push recordatorio enviado 3 días antes del vencimiento del cupón.',
  },
];

const PushPreview = ({ data }) => (
  <div className="bg-slate-800 rounded-2xl p-3 max-w-[240px] shadow-lg">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
        <Icon name="Bell" size={12} className="text-white" />
      </div>
      <span className="text-white text-xs font-medium">PromoSpot</span>
      <span className="text-slate-400 text-xs ml-auto">ahora</span>
    </div>
    <p className="text-white text-xs font-semibold">{data?.title}</p>
    <p className="text-slate-300 text-xs mt-0.5">{data?.body}</p>
  </div>
);

const CouponPreview = ({ data }) => (
  <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-4 max-w-[240px] shadow-lg text-white">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-medium opacity-80">{data?.business}</span>
      <Icon name="Ticket" size={16} />
    </div>
    <p className="text-3xl font-bold">{data?.discount}</p>
    <p className="text-xs opacity-80 mt-0.5">de descuento</p>
    <div className="mt-3 pt-3 border-t border-white/20">
      <p className="text-xs font-mono bg-white/20 rounded px-2 py-1 inline-block">{data?.code}</p>
      <p className="text-xs opacity-70 mt-1">Válido por {data?.expires}</p>
    </div>
  </div>
);

const PointsPreview = ({ data }) => (
  <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-4 max-w-[240px] shadow-lg text-white">
    <div className="flex items-center gap-2 mb-2">
      <Icon name="Star" size={16} />
      <span className="text-xs font-medium">Puntos acreditados</span>
    </div>
    <p className="text-3xl font-bold">+{data?.amount}</p>
    <p className="text-xs opacity-80 mt-1">{data?.message}</p>
  </div>
);

const FlowTestInterface = ({ isModal = false, onClose }) => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [simStarted, setSimStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState(flowSteps);
  const [branchChoices, setBranchChoices] = useState({});
  const [simComplete, setSimComplete] = useState(false);

  const handleStart = () => {
    if (!selectedProfile) return;
    setSimStarted(true);
    setCurrentStep(1);
    setSteps(flowSteps?.map((s, i) => ({ ...s, status: i === 0 ? 'executed' : 'pending' })));
    setSimComplete(false);
    setBranchChoices({});
  };

  const handleNext = () => {
    const nextIdx = currentStep;
    if (nextIdx >= steps?.length) { setSimComplete(true); return; }
    const step = steps?.[nextIdx];
    if (step?.type === 'condition') return; // need branch choice
    setSteps(prev => prev?.map((s, i) => i === nextIdx ? { ...s, status: 'executed' } : s));
    if (nextIdx + 1 >= steps?.length) setSimComplete(true);
    else setCurrentStep(nextIdx + 1);
  };

  const handleBranch = (stepId, branchLabel) => {
    setBranchChoices(prev => ({ ...prev, [stepId]: branchLabel }));
    const stepIdx = steps?.findIndex(s => s?.id === stepId);
    const skipped = branchLabel === 'Sí visitó';
    setSteps(prev => prev?.map((s, i) => {
      if (i === stepIdx) return { ...s, status: 'executed' };
      if (skipped && i > stepIdx) return { ...s, status: 'skipped' };
      return s;
    }));
    if (skipped) setSimComplete(true);
    else setCurrentStep(stepIdx + 1);
  };

  const handleReset = () => {
    setSimStarted(false);
    setCurrentStep(0);
    setSteps(flowSteps);
    setSimComplete(false);
    setBranchChoices({});
    setSelectedProfile(null);
  };

  const executedMessages = steps?.filter(s => s?.status === 'executed' && s?.preview);

  const stepStatusConfig = {
    executed: { cls: 'bg-emerald-500', icon: 'CheckCircle', label: 'Ejecutado' },
    pending: { cls: 'bg-slate-300', icon: 'Clock', label: 'Pendiente' },
    skipped: { cls: 'bg-slate-200', icon: 'MinusCircle', label: 'Omitido' },
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
            <Icon name="Play" size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Probar Flow</h2>
            <p className="text-xs text-muted-foreground">Simula el recorrido de un usuario</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <Icon name="X" size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Profile selector */}
        {!simStarted && (
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Selecciona perfil de usuario simulado</p>
            <div className="grid grid-cols-2 gap-2">
              {userProfiles?.map(p => (
                <button
                  key={p?.id}
                  onClick={() => setSelectedProfile(p?.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    selectedProfile === p?.id
                      ? 'border-primary bg-primary/5' :'border-border hover:border-primary/40 hover:bg-muted/30'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${p?.color}`}>
                    <Icon name={p?.icon} size={14} />
                  </div>
                  <p className="text-xs font-semibold text-foreground">{p?.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p?.desc}</p>
                </button>
              ))}
            </div>
            <button
              onClick={handleStart}
              disabled={!selectedProfile}
              className="mt-4 w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="Play" size={16} />
              Iniciar simulación
            </button>
          </div>
        )}

        {/* Timeline */}
        {simStarted && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-foreground">Recorrido del usuario</p>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                userProfiles?.find(p => p?.id === selectedProfile)?.color
              }`}>
                {userProfiles?.find(p => p?.id === selectedProfile)?.label}
              </span>
            </div>

            <div className="relative">
              {steps?.map((step, idx) => {
                const sc = stepStatusConfig?.[step?.status];
                const isActive = idx === currentStep && !simComplete;
                const isBranchStep = step?.type === 'condition' && step?.status === 'executed';
                return (
                  <div key={step?.id} className="flex gap-3 mb-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        step?.status === 'executed' ? 'bg-emerald-500 text-white' :
                        step?.status === 'skipped'? 'bg-slate-200 text-slate-400' : isActive ?'bg-primary text-white ring-4 ring-primary/20': 'bg-slate-100 text-slate-400'
                      }`}>
                        <Icon name={step?.icon} size={14} />
                      </div>
                      {idx < steps?.length - 1 && (
                        <div className={`w-0.5 flex-1 min-h-[16px] mt-1 ${
                          step?.status === 'executed' ? 'bg-emerald-300' : 'bg-border'
                        }`} />
                      )}
                    </div>
                    {/* Content */}
                    <div className={`flex-1 pb-4 ${
                      step?.status === 'skipped' ? 'opacity-40' : ''
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground">{step?.name}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          step?.status === 'executed' ? 'bg-emerald-100 text-emerald-700' :
                          step?.status === 'skipped'? 'bg-slate-100 text-slate-500' : isActive ?'bg-primary/10 text-primary': 'bg-slate-100 text-slate-500'
                        }`}>
                          {isActive ? 'Actual' : sc?.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{step?.detail}</p>

                      {/* Preview */}
                      {step?.preview && step?.status === 'executed' && (
                        <div className="mt-2">
                          {step?.preview?.type === 'push' && <PushPreview data={step?.preview} />}
                          {step?.preview?.type === 'coupon' && <CouponPreview data={step?.preview} />}
                          {step?.preview?.type === 'points' && <PointsPreview data={step?.preview} />}
                        </div>
                      )}

                      {/* Branch choice */}
                      {step?.type === 'condition' && isActive && (
                        <div className="mt-2 space-y-2">
                          <p className="text-xs font-medium text-foreground">¿El usuario realizó la acción?</p>
                          {step?.branches?.map(branch => (
                            <button
                              key={branch?.label}
                              onClick={() => handleBranch(step?.id, branch?.label)}
                              className="w-full flex items-center gap-2 p-2.5 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/30 text-left transition-all"
                            >
                              <Icon name={branch?.icon} size={16} className={branch?.color} />
                              <div>
                                <p className="text-xs font-medium text-foreground">{branch?.label}</p>
                                <p className="text-xs text-muted-foreground">{branch?.outcome}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Branch result */}
                      {step?.type === 'condition' && branchChoices?.[step?.id] && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Icon name="CornerDownRight" size={12} />
                          Rama tomada: <strong className="text-foreground">{branchChoices?.[step?.id]}</strong>
                        </div>
                      )}

                      {/* Wait indicator */}
                      {step?.waitNext && step?.status === 'executed' && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Icon name="Clock" size={12} />
                          Espera {step?.waitNext} antes del siguiente paso
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Controls */}
            {!simComplete && (
              <div className="flex gap-2 mt-2">
                {steps?.[currentStep]?.type !== 'condition' && (
                  <button
                    onClick={handleNext}
                    className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon name="ChevronRight" size={16} />
                    Siguiente paso
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                >
                  Reiniciar
                </button>
              </div>
            )}

            {/* Summary */}
            {simComplete && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="CheckCircle" size={18} className="text-emerald-600" />
                  <p className="text-sm font-semibold text-emerald-800">Simulación completada</p>
                </div>
                <p className="text-xs text-emerald-700 mb-3">El usuario recibiría {executedMessages?.length} mensaje(s):</p>
                <div className="space-y-2">
                  {executedMessages?.map((s, i) => (
                    <div key={s?.id} className="flex items-center gap-2 text-xs text-emerald-800">
                      <span className="w-5 h-5 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700 font-bold flex-shrink-0">{i + 1}</span>
                      <Icon name={s?.icon} size={12} />
                      {s?.name}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleReset}
                  className="mt-3 w-full py-2 border border-emerald-300 text-emerald-700 rounded-xl text-xs font-medium hover:bg-emerald-100 transition-colors"
                >
                  Nueva simulación
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
        <div className="bg-card rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl border border-border overflow-hidden">
          {content}
        </div>
      </div>
    );
  }

  return <div className="bg-card border border-border rounded-2xl overflow-hidden h-full flex flex-col">{content}</div>;
};

export default FlowTestInterface;
