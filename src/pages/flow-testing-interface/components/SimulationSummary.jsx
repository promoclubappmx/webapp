import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SimulationSummary = ({ flow, persona, stepConditions, onReset }) => {
  const messages = [
    { time: 'Inmediato', channel: 'push', icon: 'Bell', color: 'bg-blue-500', label: 'Push notification enviada' },
    { time: 'Inmediato', channel: 'wallet', icon: 'Star', color: 'bg-amber-500', label: 'Puntos acreditados al wallet' },
    { time: 'Día 3', channel: 'push', icon: 'Ticket', color: 'bg-emerald-500', label: 'Cupón enviado al wallet' },
    { time: 'Día 10', channel: 'push', icon: 'Bell', color: 'bg-blue-500', label: 'Recordatorio de cupón' },
  ];

  const predictions = [
    { label: 'Probabilidad de apertura', value: '72%', icon: 'Eye', color: 'text-blue-600' },
    { label: 'Probabilidad de canje', value: '38%', icon: 'Ticket', color: 'text-emerald-600' },
    { label: 'Tiempo estimado de conversión', value: '4.2 días', icon: 'Clock', color: 'text-purple-600' },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-success/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-success/20 rounded-xl flex items-center justify-center">
            <Icon name="CheckCircle" size={22} className="text-success" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Simulación completada</p>
            <p className="text-xs text-muted-foreground">{persona?.name} completó el recorrido del {flow?.name}</p>
          </div>
        </div>
      </div>
      <div className="p-5 space-y-5">
        {/* Message sequence */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Mensajes que recibiría {persona?.name}</p>
          <div className="space-y-2">
            {messages?.map((msg, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                <div className={`w-8 h-8 ${msg?.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon name={msg?.icon} size={15} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{msg?.label}</p>
                  <p className="text-xs text-muted-foreground">{msg?.channel === 'push' ? 'Notificación push' : msg?.channel === 'wallet' ? 'Wallet digital' : 'Email'}</p>
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-lg">{msg?.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Predictions */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Predicciones de engagement</p>
          <div className="grid grid-cols-3 gap-3">
            {predictions?.map((p, i) => (
              <div key={i} className="bg-muted/30 rounded-xl p-3 text-center">
                <Icon name={p?.icon} size={18} className={`${p?.color} mx-auto mb-1`} />
                <p className={`text-lg font-bold ${p?.color}`}>{p?.value}</p>
                <p className="text-xs text-muted-foreground leading-tight">{p?.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Persona summary */}
        <div className="bg-muted/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${flow?.color} flex items-center justify-center`}>
              <span className="text-sm font-bold text-white">{persona?.avatar}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{persona?.name}</p>
              <p className="text-xs text-muted-foreground">{persona?.type} · {persona?.desc}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onReset} iconName="RotateCcw" iconPosition="left">
            Nueva simulación
          </Button>
          <Button variant="default" className="flex-1" iconName="Zap" iconPosition="left">
            Activar flow
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimulationSummary;
