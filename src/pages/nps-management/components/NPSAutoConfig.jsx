import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
      checked ? 'bg-primary' : 'bg-slate-300'
    }`}
  >
    <span
      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300"
      style={{ left: checked ? '22px' : '2px' }}
    />
  </button>
);

const triggers = [
  { id: 'checkin', label: 'Post check-in', delays: ['15 min', '30 min', '1 hora'] },
  { id: 'coupon', label: 'Post canje de cupón/promo', delays: ['Inmediato', '15 min', '30 min'] },
  { id: 'order', label: 'Post Order Ahead completado', delays: ['30 min', '1 hora', '2 horas'] },
  { id: 'reservation', label: 'Post reservación cumplida', delays: ['1 hora', '2 horas', 'Al día siguiente'] },
];

const NPSAutoConfig = () => {
  const [masterActive, setMasterActive] = useState(true);
  const [triggerStates, setTriggerStates] = useState({
    checkin: { active: true, delay: '30 min' },
    coupon: { active: true, delay: 'Inmediato' },
    order: { active: false, delay: '1 hora' },
    reservation: { active: true, delay: '2 horas' },
  });
  const [followUpActive, setFollowUpActive] = useState(true);
  const [incentiveActive, setIncentiveActive] = useState(false);
  const [incentiveType, setIncentiveType] = useState('points');

  const updateTrigger = (id, field, value) => {
    setTriggerStates(prev => ({ ...prev, [id]: { ...prev?.[id], [field]: value } }));
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">Configuración del NPS automático</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Controla cuándo y cómo se envían las solicitudes de NPS</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">
            {masterActive ? 'NPS activo' : 'NPS inactivo'}
          </span>
          <Toggle checked={masterActive} onChange={setMasterActive} />
        </div>
      </div>
      {!masterActive && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
          <Icon name="AlertTriangle" size={16} className="text-amber-600" />
          <p className="text-sm text-amber-700">El NPS automático está inactivo. No se enviarán solicitudes.</p>
        </div>
      )}
      {/* Triggers table */}
      <div className="overflow-x-auto mb-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Trigger</th>
              <th className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Activo</th>
              <th className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Delay</th>
            </tr>
          </thead>
          <tbody>
            {triggers?.map(trigger => (
              <tr key={trigger?.id} className="border-b border-border/50">
                <td className="py-3 px-3 font-medium text-foreground">{trigger?.label}</td>
                <td className="py-3 px-3 text-center">
                  <Toggle
                    checked={triggerStates?.[trigger?.id]?.active}
                    onChange={val => updateTrigger(trigger?.id, 'active', val)}
                  />
                </td>
                <td className="py-3 px-3 text-center">
                  <select
                    value={triggerStates?.[trigger?.id]?.delay}
                    onChange={e => updateTrigger(trigger?.id, 'delay', e?.target?.value)}
                    disabled={!triggerStates?.[trigger?.id]?.active}
                    className="text-xs border border-border rounded-lg px-2 py-1.5 bg-card text-foreground focus:outline-none disabled:opacity-40"
                  >
                    {trigger?.delays?.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* NPS Question */}
      <div className="p-4 bg-muted/30 rounded-xl border border-border mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="MessageSquare" size={14} className="text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase">Pregunta NPS estándar (no editable)</span>
        </div>
        <p className="text-sm font-medium text-foreground mb-3">
          ¿Qué tan probable es que recomiendes <strong>PromoSpot</strong> a un amigo o familiar?
        </p>
        <div className="flex gap-1">
          {Array.from({ length: 11 }, (_, i) => (
            <div key={i} className="flex-1 text-center">
              <div className={`h-8 rounded flex items-center justify-center text-xs font-bold ${
                i <= 6 ? 'bg-red-100 text-red-700' : i <= 8 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>{i}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0 = Nada probable</span>
          <span>10 = Muy probable</span>
        </div>
      </div>
      {/* Follow-up question */}
      <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border mb-4">
        <div>
          <p className="text-sm font-medium text-foreground">Pregunta de seguimiento</p>
          <p className="text-xs text-muted-foreground">¿Por qué nos diste esa puntuación? → campo abierto</p>
        </div>
        <Toggle checked={followUpActive} onChange={setFollowUpActive} />
      </div>
      {/* Incentive */}
      <div className="p-4 bg-muted/20 rounded-xl border border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-foreground">Ofrecer incentivo por responder</p>
            <p className="text-xs text-muted-foreground">Se otorga independientemente de la puntuación</p>
          </div>
          <Toggle checked={incentiveActive} onChange={setIncentiveActive} />
        </div>
        {incentiveActive && (
          <div className="flex gap-2 mt-2">
            {['points', 'coupon', 'stamp']?.map(type => (
              <button
                key={type}
                onClick={() => setIncentiveType(type)}
                className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  incentiveType === type
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:bg-muted/50'
                }`}
              >
                {type === 'points' ? '⭐ Puntos' : type === 'coupon' ? '🎟️ Cupón' : '🥊 Stamp'}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NPSAutoConfig;
