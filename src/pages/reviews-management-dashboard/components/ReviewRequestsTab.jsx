import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TRIGGER_CONFIG = [
  { key: 'checkin', label: 'Post check-in', delays: ['Inmediato', '30 min', '1 hora'] },
  { key: 'coupon', label: 'Post canje de cupón / promo', delays: ['Inmediato', '30 min', '1 hora'] },
  { key: 'order', label: 'Post Order Ahead completado', delays: ['30 min', '1 hora', '2 horas'] },
  { key: 'reservation', label: 'Post reservación cumplida', delays: ['1 hora', '2 horas', 'Al día siguiente'] },
  { key: 'geofence', label: 'Post visita por geofence', delays: ['30 min', '1 hora', '2 horas'] },
];

const MOCK_CHART_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  solicitudes: Math.floor(Math.random() * 15) + 5,
  resenas: Math.floor(Math.random() * 8) + 1,
}));

const MOCK_MANUAL_HISTORY = [
  { customer: 'Pedro Q.', date: 'Hace 2 días', status: 'completed' },
  { customer: 'Laura F.', date: 'Hace 3 días', status: 'viewed' },
  { customer: 'Marco I.', date: 'Hace 4 días', status: 'sent' },
  { customer: 'Diana K.', date: 'Hace 5 días', status: 'completed' },
  { customer: 'Oscar W.', date: 'Hace 6 días', status: 'sent' },
];

const STATUS_LABELS = { sent: { label: 'Enviada', color: 'bg-blue-100 text-blue-700' }, viewed: { label: 'Vista', color: 'bg-amber-100 text-amber-700' }, completed: { label: 'Reseña dejada', color: 'bg-emerald-100 text-emerald-700' } };

const Toggle = ({ checked, onChange }) => (
  <button onClick={() => onChange(!checked)} className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-slate-300'}`}>
    <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: checked ? '22px' : '2px' }} />
  </button>
);

const ReviewRequestsTab = () => {
  const [masterToggle, setMasterToggle] = useState(true);
  const [triggers, setTriggers] = useState({
    checkin: { enabled: true, delay: 'Inmediato' },
    coupon: { enabled: true, delay: 'Inmediato' },
    order: { enabled: true, delay: '30 min' },
    reservation: { enabled: true, delay: '1 hora' },
    geofence: { enabled: true, delay: '1 hora' },
  });
  const [incentiveEnabled, setIncentiveEnabled] = useState(true);
  const [incentiveType, setIncentiveType] = useState('points');
  const [pointsValue, setPointsValue] = useState(15);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [manualSent, setManualSent] = useState(0);

  const MOCK_CUSTOMERS = [
    { id: '1', name: 'Pedro Q.', phone: '+52 55 3456 7890', lastVisit: 'hace 3 días', reviewCount: 1 },
    { id: '2', name: 'Laura F.', phone: '+52 55 4567 8901', lastVisit: 'hace 5 días', reviewCount: 0 },
    { id: '3', name: 'Marco I.', phone: '+52 55 5678 9012', lastVisit: 'hace 1 día', reviewCount: 2 },
    { id: '4', name: 'Diana K.', phone: '+52 55 6789 0123', lastVisit: 'hace 7 días', reviewCount: 0 },
  ];

  const filteredCustomers = MOCK_CUSTOMERS?.filter(c =>
    c?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) || c?.phone?.includes(searchQuery)
  );

  const handleSendManual = () => {
    if (!selectedCustomer || manualSent >= 10) return;
    setManualSent(p => p + 1);
    setSelectedCustomer(null);
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Auto requests config */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-foreground">Solicitudes automáticas</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Configura cuándo y cómo se envían las solicitudes de reseña</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">Solicitar reseñas automáticamente</span>
            <Toggle checked={masterToggle} onChange={setMasterToggle} />
          </div>
        </div>

        {/* Triggers table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">Trigger</th>
                <th className="text-center py-3 px-2 text-xs font-medium text-muted-foreground">Activo</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">Delay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {TRIGGER_CONFIG?.map(t => (
                <tr key={t?.key} className={!masterToggle ? 'opacity-50' : ''}>
                  <td className="py-3 px-2 text-sm text-foreground">{t?.label}</td>
                  <td className="py-3 px-2 text-center">
                    <Toggle
                      checked={triggers?.[t?.key]?.enabled && masterToggle}
                      onChange={v => masterToggle && setTriggers(prev => ({ ...prev, [t?.key]: { ...prev?.[t?.key], enabled: v } }))}
                    />
                  </td>
                  <td className="py-3 px-2">
                    <select
                      value={triggers?.[t?.key]?.delay}
                      onChange={e => setTriggers(prev => ({ ...prev, [t?.key]: { ...prev?.[t?.key], delay: e?.target?.value } }))}
                      disabled={!masterToggle || !triggers?.[t?.key]?.enabled}
                      className="px-3 py-1.5 bg-muted/40 border-0 rounded-lg text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 cursor-pointer"
                    >
                      {t?.delays?.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Anti-spam rules */}
        <div className="mt-5 space-y-2">
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <Icon name="Info" size={15} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">No enviaremos más de 1 solicitud por cliente cada 7 días para este negocio</p>
          </div>
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <Icon name="Info" size={15} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">Si el cliente ignora 3 solicitudes seguidas, pausamos el envío por 30 días</p>
          </div>
        </div>
      </div>
      {/* Incentive config */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-foreground">Incentivo por reseña</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Ofrece un beneficio a los clientes que dejen reseña</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">Ofrecer incentivo por dejar reseña</span>
            <Toggle checked={incentiveEnabled} onChange={setIncentiveEnabled} />
          </div>
        </div>

        {incentiveEnabled && (
          <div className="space-y-4">
            {/* Type selector */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'points', label: 'Puntos PromoClub', icon: 'Star' },
                { key: 'coupon', label: 'Cupón de descuento', icon: 'Ticket' },
                { key: 'punch', label: 'Punch card stamp', icon: 'Stamp' },
              ]?.map(opt => (
                <button
                  key={opt?.key}
                  onClick={() => setIncentiveType(opt?.key)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${incentiveType === opt?.key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                >
                  <Icon name={opt?.icon} size={18} className={incentiveType === opt?.key ? 'text-primary mb-1.5' : 'text-muted-foreground mb-1.5'} />
                  <p className="text-xs font-medium text-foreground">{opt?.label}</p>
                </button>
              ))}
            </div>

            {incentiveType === 'points' && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-foreground">Puntos a otorgar:</label>
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={pointsValue}
                  onChange={e => setPointsValue(Math.min(50, Math.max(5, Number(e?.target?.value))))}
                  className="w-20 px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <span className="text-xs text-muted-foreground">(mínimo 5, máximo 50)</span>
              </div>
            )}

            {/* Regulatory warning */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <span className="text-lg flex-shrink-0">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-amber-800 mb-1">Importante</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  El incentivo se otorga a todos los clientes que dejen reseña, independientemente de su calificación (positiva, negativa o neutral).
                  No puedes condicionar el beneficio a un rating mínimo ni solicitar cambiar una reseña. Esto viola las políticas de PromoClub.
                </p>
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 bg-muted/30 border border-border rounded-xl">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <Icon name="Eye" size={13} />Preview del mensaje al cliente
              </p>
              <div className="bg-card border border-border rounded-xl p-3">
                <p className="text-sm text-foreground">
                  {incentiveType === 'points' && `🎁 Deja tu reseña y gana ${pointsValue} puntos PromoClub automáticamente`}
                  {incentiveType === 'coupon' && '🎁 Deja tu reseña y recibe un cupón de descuento especial'}
                  {incentiveType === 'punch' && '🎁 Deja tu reseña y obtén un sello extra en tu punch card'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">El beneficio se otorga independientemente de tu calificación</p>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Manual requests */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Solicitudes manuales</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Envía solicitudes a clientes específicos con interacción verificada</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/40 rounded-xl">
            <Icon name="Send" size={13} className="text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">{manualSent}/10 hoy</span>
          </div>
        </div>

        <div className="relative mb-3">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar cliente por nombre o teléfono..."
            value={searchQuery}
            onChange={e => setSearchQuery(e?.target?.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-muted/40 border-0 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {searchQuery && (
          <div className="mb-4 bg-muted/20 border border-border rounded-xl overflow-hidden">
            {filteredCustomers?.map(c => (
              <button
                key={c?.id}
                onClick={() => { setSelectedCustomer(c); setSearchQuery(c?.name); }}
                className="w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors border-b border-border last:border-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{c?.name}</p>
                    <p className="text-xs text-muted-foreground">{c?.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Última visita: {c?.lastVisit}</p>
                    <p className="text-xs text-muted-foreground">{c?.reviewCount} reseña{c?.reviewCount !== 1 ? 's' : ''} en este negocio</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedCustomer && (
          <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{selectedCustomer?.name}</p>
              <p className="text-xs text-muted-foreground">Última visita: {selectedCustomer?.lastVisit} · Ya tiene {selectedCustomer?.reviewCount} reseña{selectedCustomer?.reviewCount !== 1 ? 's' : ''} en este negocio</p>
            </div>
            <button
              onClick={handleSendManual}
              disabled={manualSent >= 10}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Icon name="Send" size={13} />Enviar solicitud
            </button>
          </div>
        )}

        {/* History */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Historial de solicitudes manuales</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Cliente</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Fecha</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {MOCK_MANUAL_HISTORY?.map((h, i) => (
                  <tr key={i}>
                    <td className="py-2.5 px-2 text-sm text-foreground">{h?.customer}</td>
                    <td className="py-2.5 px-2 text-xs text-muted-foreground">{h?.date}</td>
                    <td className="py-2.5 px-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_LABELS?.[h?.status]?.color}`}>
                        {STATUS_LABELS?.[h?.status]?.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Stats mini-dashboard */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">Estadísticas de solicitudes</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Solicitudes este mes', value: '87', icon: 'Send' },
            { label: 'Tasa de conversión', value: '34%', icon: 'TrendingUp' },
            { label: 'Con incentivo', value: '61%', icon: 'Gift' },
            { label: 'Sin incentivo', value: '18%', icon: 'MessageSquare' },
          ]?.map((stat, i) => (
            <div key={i} className="p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Icon name={stat?.icon} size={15} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{stat?.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{stat?.value}</p>
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-3">Solicitudes enviadas vs Reseñas recibidas (últimos 30 días)</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={MOCK_CHART_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="solicitudes" stroke="var(--primary)" strokeWidth={2} dot={false} name="Solicitudes" />
              <Line type="monotone" dataKey="resenas" stroke="#10b981" strokeWidth={2} dot={false} name="Reseñas" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ReviewRequestsTab;
