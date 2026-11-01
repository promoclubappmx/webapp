import React from 'react';
import Icon from '../../../components/AppIcon';

const MESSAGE_TRIGGERS = [
  { trigger: 'welcome', label: 'Bienvenida', desc: 'Al suscribirse', icon: 'Smile', editable: true },
  { trigger: 'renewal_confirmation', label: 'Confirmación de renovación', desc: 'Al renovarse exitosamente', icon: 'RefreshCw', editable: false },
  { trigger: 'payment_failed', label: 'Fallo de pago', desc: 'Si Stripe falla el cobro', icon: 'AlertCircle', editable: false, recommended: true },
  { trigger: 'cancellation_reminder', label: 'Recordatorio de cancelación', desc: '3 días antes de que venza', icon: 'Bell', editable: false },
  { trigger: 'daily_limit_reached', label: 'Límite diario agotado', desc: 'Al usar el último consumo del día', icon: 'Clock', editable: false },
  { trigger: 'monthly_quota_80', label: 'Cuota mensual al 80%', desc: 'Cuando quedan 20% de usos del mes', icon: 'TrendingDown', editable: false },
];

const VARIABLES = ['[Nombre Cliente]', '[Nombre Membresía]', '[Fecha Renovación]'];

const MembershipCommunicationConfig = ({ messages = {}, onToggle, onUpdateText }) => {
  const getMsg = (trigger) => messages?.[trigger] || { enabled: trigger === 'payment_failed', custom_text: '', whatsapp_enabled: false };

  const defaultWelcomeText = 'Hola [Nombre Cliente], bienvenido a [Nombre Membresía]. Tu membresía está activa y se renovará el [Fecha Renovación]. ¡Disfruta tus beneficios!';

  const previewText = (text) => {
    return (text || defaultWelcomeText)?.replace('[Nombre Cliente]', 'Ana García')?.replace('[Nombre Membresía]', 'Club Café Premium')?.replace('[Fecha Renovación]', '15 abr 2025');
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6">
      <h2 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
        <Icon name="MessageCircle" size={18} className="text-primary" />
        Mensajes automáticos a suscriptores
      </h2>
      <div className="space-y-3">
        {MESSAGE_TRIGGERS?.map(({ trigger, label, desc, icon, editable, recommended }) => {
          const msg = getMsg(trigger);
          return (
            <div key={trigger} className="border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name={icon} size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    {recommended && (
                      <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">Recomendado</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground hidden sm:block">Push</span>
                  <button
                    onClick={() => onToggle?.(trigger, !msg?.enabled)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${msg?.enabled ? 'bg-primary' : 'bg-slate-300'}`}
                  >
                    <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300" style={{ left: msg?.enabled ? '22px' : '2px' }} />
                  </button>
                </div>
              </div>
              {/* Welcome message customization */}
              {editable && msg?.enabled && (
                <div className="border-t border-border p-4 bg-muted/20">
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Personalizar mensaje de bienvenida</label>
                  <textarea
                    rows={3}
                    value={msg?.custom_text || defaultWelcomeText}
                    onChange={e => onUpdateText?.(trigger, e?.target?.value)}
                    className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-xs text-muted-foreground">Variables:</span>
                    {VARIABLES?.map(v => (
                      <button
                        key={v}
                        onClick={() => {
                          const current = msg?.custom_text || defaultWelcomeText;
                          onUpdateText?.(trigger, current + ' ' + v);
                        }}
                        className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors font-mono"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  {/* Preview */}
                  <div className="mt-3 p-3 bg-card border border-border rounded-xl">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Vista previa:</p>
                    <p className="text-sm text-foreground">{previewText(msg?.custom_text)}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MembershipCommunicationConfig;
