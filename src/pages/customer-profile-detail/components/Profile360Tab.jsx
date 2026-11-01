import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const mockMarketingHistory = [
  { id: 1, date: '2026-03-01', type: 'push', campaign: 'Reactivación Dormidos', subject: '¡Te extrañamos! Aquí va un cupón especial...', opened: true, clicked: true, converted: true },
  { id: 2, date: '2026-02-25', type: 'whatsapp', campaign: 'VIPs Exclusivo', subject: 'Hola, como cliente VIP tienes acceso exclusivo...', opened: true, clicked: false, converted: false },
  { id: 3, date: '2026-02-20', type: 'email', campaign: 'Newsletter Febrero', subject: '¡Novedades de febrero en PromoSpot!', opened: false, clicked: false, converted: false },
  { id: 4, date: '2026-02-15', type: 'push', campaign: 'Flow Bienvenida', subject: 'Automatización: Bienvenida día 7', opened: true, clicked: true, converted: false },
  { id: 5, date: '2026-02-10', type: 'push', campaign: 'Puntos Dobles', subject: 'Puntos dobles este fin de semana', opened: true, clicked: false, converted: false },
];

const ChurnSemaphore = ({ score, daysSinceVisit, avgFrequency }) => {
  const daysBeyond = daysSinceVisit - avgFrequency;
  let level, color, bgColor, borderColor, label, description;
  if (score >= 70) {
    level = 'low'; color = 'text-green-700'; bgColor = 'bg-green-50'; borderColor = 'border-green-200';
    label = 'Riesgo Bajo'; description = `Visita regularmente. Patrón estable.`;
  } else if (score >= 40) {
    level = 'medium'; color = 'text-yellow-700'; bgColor = 'bg-yellow-50'; borderColor = 'border-yellow-200';
    label = 'Riesgo Medio'; description = `Solía venir cada ${avgFrequency} días, lleva ${daysSinceVisit} sin visitar.`;
  } else {
    level = 'high'; color = 'text-red-700'; bgColor = 'bg-red-50'; borderColor = 'border-red-200';
    label = 'Riesgo Alto'; description = `Solía venir cada ${avgFrequency} días, lleva ${daysSinceVisit} sin visitar. Patrón decreciente.`;
  }
  const dots = ['bg-red-500', 'bg-yellow-500', 'bg-green-500'];
  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} p-4`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Predicción de Churn</span>
          </div>
          <div className={`text-lg font-bold ${color} mb-1`}>{label}</div>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>
        <div className="flex flex-col gap-1.5 items-center ml-4">
          {dots?.map((dot, i) => (
            <div key={i} className={`w-4 h-4 rounded-full transition-all ${
              (level === 'high' && i === 0) || (level === 'medium' && i === 1) || (level === 'low' && i === 2)
                ? dot + ' shadow-lg scale-125' :'bg-gray-200'
            }`} />
          ))}
        </div>
      </div>
      {level !== 'low' && (
        <button className={`mt-3 w-full py-2 rounded-lg text-xs font-semibold border ${borderColor} ${color} hover:opacity-80 transition-opacity flex items-center justify-center gap-2`}>
          <Icon name="Send" size={13} />Enviar oferta de recuperación
        </button>
      )}
    </div>
  );
};

const LTVCard = ({ visits, avgTicket, monthsRelation }) => {
  const ltv = Math.round(avgTicket * (visits / Math.max(monthsRelation, 1)) * 12);
  const ltvFormatted = ltv?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon name="TrendingUp" size={16} className="text-blue-600" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">LTV Estimado</span>
      </div>
      <div className="text-2xl font-bold text-foreground">{ltvFormatted}</div>
      <p className="text-xs text-muted-foreground mt-1">Ticket prom. ${avgTicket} × {(visits / Math.max(monthsRelation, 1))?.toFixed(1)} vis/mes × 12 meses</p>
    </div>
  );
};

const PreferredChannelCard = ({ channels }) => {
  const best = channels?.reduce((a, b) => a?.openRate > b?.openRate ? a : b);
  const channelIcons = { whatsapp: 'MessageCircle', push: 'Bell', email: 'Mail' };
  const channelColors = { whatsapp: 'text-green-600 bg-green-50', push: 'text-blue-600 bg-blue-50', email: 'text-purple-600 bg-purple-50' };
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="Radio" size={16} className="text-primary" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Canal Preferido</span>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${channelColors?.[best?.name]}`}>
          <Icon name={channelIcons?.[best?.name]} size={16} />
        </div>
        <div>
          <div className="text-sm font-bold capitalize">{best?.name}</div>
          <div className="text-xs text-green-600 font-medium">{best?.openRate}% apertura</div>
        </div>
      </div>
      <div className="space-y-2">
        {channels?.map(ch => (
          <div key={ch?.name} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-16 capitalize">{ch?.name}</span>
            <div className="flex-1 bg-muted rounded-full h-1.5">
              <div className={`h-1.5 rounded-full transition-all ${ch?.name === best?.name ? 'bg-primary' : 'bg-muted-foreground/30'}`} style={{ width: `${ch?.openRate}%` }} />
            </div>
            <span className="text-xs font-medium w-10 text-right">{ch?.openRate}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const DetectedPreferences = ({ preferences }) => (
  <div className="bg-card border border-border rounded-xl p-4">
    <div className="flex items-center gap-2 mb-3">
      <Icon name="Sparkles" size={16} className="text-amber-500" />
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Preferencias Detectadas</span>
      <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium ml-auto">IA</span>
    </div>
    <div className="space-y-2">
      {preferences?.map((pref, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
          <p className="text-xs text-foreground leading-relaxed">{pref}</p>
        </div>
      ))}
    </div>
  </div>
);

const MarketingHistorySection = ({ history }) => {
  const [filter, setFilter] = useState('all');
  const channelIcon = { push: 'Bell', whatsapp: 'MessageCircle', email: 'Mail' };
  const channelColor = { push: 'text-blue-600 bg-blue-50', whatsapp: 'text-green-600 bg-green-50', email: 'text-purple-600 bg-purple-50' };
  const filtered = filter === 'all' ? history : history?.filter(h => h?.type === filter);
  const thisWeek = history?.filter(h => {
    const d = new Date(h.date);
    const now = new Date('2026-03-05');
    return (now - d) / (1000 * 60 * 60 * 24) <= 7;
  })?.length;
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon name="Megaphone" size={16} className="text-muted-foreground" />
          <span className="text-sm font-semibold">Historial de Marketing</span>
        </div>
        {thisWeek >= 3 && (
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <Icon name="AlertTriangle" size={11} />{thisWeek} mensajes esta semana
          </span>
        )}
      </div>
      <div className="flex gap-1 mb-3">
        {['all', 'push', 'whatsapp', 'email']?.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}>
            {f === 'all' ? 'Todos' : f?.charAt(0)?.toUpperCase() + f?.slice(1)}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered?.map(item => (
          <div key={item?.id} className="flex items-start gap-3 p-3 bg-muted/20 rounded-xl border border-border">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${channelColor?.[item?.type]}`}>
              <Icon name={channelIcon?.[item?.type]} size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold text-foreground truncate">{item?.campaign}</span>
                <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">{item?.date}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{item?.subject}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className={`text-xs flex items-center gap-1 ${item?.opened ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <Icon name={item?.opened ? 'Eye' : 'EyeOff'} size={10} />{item?.opened ? 'Abierto' : 'No abierto'}
                </span>
                {item?.clicked && <span className="text-xs text-blue-600 flex items-center gap-1"><Icon name="MousePointer" size={10} />Click</span>}
                {item?.converted && <span className="text-xs text-emerald-600 flex items-center gap-1"><Icon name="CheckCircle" size={10} />Convertido</span>}
              </div>
            </div>
          </div>
        ))}
        {filtered?.length === 0 && (
          <div className="py-6 text-center">
            <Icon name="Inbox" size={24} className="mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">Sin comunicaciones de este canal</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Profile360Tab = ({ client }) => {
  const avgTicket = Math.round((client?.estimatedSpend || 4500) / Math.max(client?.visits || 1, 1));
  const firstVisit = new Date(client?.firstVisit || '2025-03-15');
  const now = new Date('2026-03-05');
  const monthsRelation = Math.max(1, Math.round((now - firstVisit) / (1000 * 60 * 60 * 24 * 30)));
  const daysSinceVisit = Math.floor((now - new Date(client?.lastVisit || '2026-03-01')) / (1000 * 60 * 60 * 24));
  const avgFrequency = Math.max(1, Math.round((monthsRelation * 30) / Math.max(client?.visits || 1, 1)));

  const channels = [
    { name: 'whatsapp', openRate: client?.hasWhatsApp ? 82 : 12 },
    { name: 'push', openRate: 34 },
    { name: 'email', openRate: 48 },
  ]?.sort((a, b) => b?.openRate - a?.openRate);

  const preferences = [
    `Suele visitar los ${['lunes', 'martes', 'miércoles', 'jueves', 'viernes']?.[client?.id % 5]} entre 1–3 PM`,
    client?.couponsRedeemed > 3 ? 'Canjea cupones de % OFF pero ignora los de 2×1' : 'Responde mejor a ofertas de regalo gratis',
    client?.hasWhatsApp ? 'Siempre usa NFC, nunca QR' : 'Prefiere QR sobre NFC',
    `Ticket promedio de $${avgTicket} por visita`,
    client?.vipLevel === 'Oro' ? 'Comparte experiencias en redes sociales' : 'Visita principalmente en horario de comida',
  ];

  return (
    <div className="space-y-5">
      {/* Top row: Churn + LTV */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChurnSemaphore score={client?.score} daysSinceVisit={daysSinceVisit} avgFrequency={avgFrequency} />
        <LTVCard visits={client?.visits || 1} avgTicket={avgTicket} monthsRelation={monthsRelation} />
      </div>
      {/* Preferred channel */}
      <PreferredChannelCard channels={channels} />
      {/* Detected preferences */}
      <DetectedPreferences preferences={preferences} />
      {/* Marketing history */}
      <MarketingHistorySection history={mockMarketingHistory} />
    </div>
  );
};

export default Profile360Tab;
