import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const MESSAGES = [
  { trigger: 'welcome', label: 'Bienvenida', desc: 'Al suscribirse', customizable: true },
  { trigger: 'renewal_confirmation', label: 'Confirmación de renovación', desc: 'Al renovarse exitosamente' },
  { trigger: 'payment_failed', label: 'Fallo de pago', desc: 'Si Stripe falla el cobro', recommended: true },
  { trigger: 'cancellation_reminder', label: 'Recordatorio de cancelación', desc: '3 días antes de que venza' },
  { trigger: 'daily_limit_reached', label: 'Límite diario agotado', desc: 'Al usar el último consumo del día' },
  { trigger: 'monthly_quota_80', label: 'Cuota mensual al 80%', desc: 'Cuando quedan 20% de usos del mes' },
];

const VARIABLES = ['[Nombre Cliente]', '[Nombre Membresía]', '[Fecha Renovación]'];

const MembershipCommunicationConfig = ({ data, onChange }) => {
  const [expandedMsg, setExpandedMsg] = useState('welcome');

  const toggleMessage = (trigger, enabled) => {
    const updated = { ...data, [trigger]: { ...(data?.[trigger] || {}), enabled } };
    onChange(updated);
  };

  const updateText = (trigger, text) => {
    const updated = { ...data, [trigger]: { ...(data?.[trigger] || {}), customText: text } };
    onChange(updated);
  };

  const defaultText = 'Hola [Nombre Cliente], bienvenido a [Nombre Membresía]. Tu próxima renovación es el [Fecha Renovación]. ¡Gracias por ser parte de nuestra comunidad!';

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h2 className="text-base font-semibold text-foreground mb-5">Mensajes automáticos a suscriptores</h2>
      <div className="space-y-3">
        {MESSAGES?.map(msg => {
          const msgData = data?.[msg?.trigger] || {};
          const isEnabled = msgData?.enabled !== false;
          const isExpanded = expandedMsg === msg?.trigger;

          return (
            <div key={msg?.trigger} className="border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => setExpandedMsg(isExpanded ? null : msg?.trigger)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{msg?.label}</p>
                        {msg?.recommended && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Recomendado</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{msg?.desc}</p>
                    </div>
                  </button>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() => toggleMessage(msg?.trigger, !isEnabled)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${isEnabled ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${isEnabled ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
              {isExpanded && msg?.customizable && (
                <div className="px-4 pb-4 border-t border-border pt-4 bg-muted/20">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {VARIABLES?.map(v => (
                      <button
                        key={v}
                        onClick={() => {
                          const current = msgData?.customText || defaultText;
                          updateText(msg?.trigger, current + ' ' + v);
                        }}
                        className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-mono"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={msgData?.customText || defaultText}
                    onChange={e => updateText(msg?.trigger, e?.target?.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700 font-medium mb-1">Preview:</p>
                    <p className="text-xs text-blue-800">
                      {(msgData?.customText || defaultText)?.replace('[Nombre Cliente]', 'María García')?.replace('[Nombre Membresía]', 'Club Café Premium')?.replace('[Fecha Renovación]', '15 abr 2025')}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={msgData?.whatsapp || false}
                      onChange={e => {
                        const updated = { ...data, [msg?.trigger]: { ...msgData, whatsapp: e?.target?.checked } };
                        onChange(updated);
                      }}
                      className="text-primary rounded"
                    />
                    <span className="text-sm text-foreground flex items-center gap-1.5">
                      <Icon name="MessageCircle" size={14} className="text-emerald-600" />
                      También enviar por WhatsApp
                    </span>
                  </label>
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
