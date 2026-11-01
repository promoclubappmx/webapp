import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ZONE_PROGRAM = {
  id: 'zona-centro',
  name: 'Puntos Centro Histórico',
  zone: 'Centro Histórico, CDMX',
  radius: '500m',
  coordinator: 'PromoClub',
  businesses: [
    { id: 1, name: 'Sushi Maz', category: 'Restaurante', points: 1240, distance: '80m', active: true, logo: 'S' },
    { id: 2, name: 'Café Colón', category: 'Cafetería', points: 890, distance: '120m', active: true, logo: 'C' },
    { id: 3, name: 'Panadería El Sol', category: 'Panadería', points: 560, distance: '200m', active: true, logo: 'P' },
    { id: 4, name: 'Librería Babel', category: 'Librería', points: 320, distance: '350m', active: false, logo: 'L' },
  ],
  totalPoints: 48320,
  activeUsers: 1847,
  monthlyRedemptions: 423,
};

const ZONE_CAMPAIGNS = [
  {
    id: 1,
    businessName: 'Café Colón',
    businessLogo: 'C',
    businessCategory: 'Cafetería',
    distance: '120m',
    name: '2x1 en bebidas calientes',
    description: 'Paga 1 café americano y llévate 2. Válido de lunes a viernes de 8am a 12pm.',
    type: 'descuento',
    status: 'active',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    pointsBonus: 50,
    redemptions: 134,
    channels: ['qr', 'nfc'],
    tags: ['bebidas', 'mañana'],
    crossPromo: true,
  },
  {
    id: 2,
    businessName: 'Sushi Maz',
    businessLogo: 'S',
    businessCategory: 'Restaurante',
    distance: '80m',
    name: 'Martes de Sushi -20%',
    description: '20% de descuento en toda la carta los martes. Acumula puntos de zona dobles.',
    type: 'descuento',
    status: 'active',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    pointsBonus: 100,
    redemptions: 89,
    channels: ['qr', 'geofence'],
    tags: ['comida', 'martes'],
    crossPromo: true,
  },
  {
    id: 3,
    businessName: 'Panadería El Sol',
    businessLogo: 'P',
    businessCategory: 'Panadería',
    distance: '200m',
    name: 'Pan del día a precio especial',
    description: 'Lleva 3 piezas de pan dulce y paga solo 2. Todos los días hasta agotar existencias.',
    type: 'combo',
    status: 'active',
    startDate: '2026-03-05',
    endDate: '2026-03-20',
    pointsBonus: 30,
    redemptions: 201,
    channels: ['manual', 'qr'],
    tags: ['panadería', 'diario'],
    crossPromo: false,
  },
  {
    id: 4,
    businessName: 'Librería Babel',
    businessLogo: 'L',
    businessCategory: 'Librería',
    distance: '350m',
    name: 'Feria del libro de primavera',
    description: 'Descuentos del 15% al 30% en títulos seleccionados. Presenta tu tarjeta de zona.',
    type: 'evento',
    status: 'scheduled',
    startDate: '2026-03-15',
    endDate: '2026-03-22',
    pointsBonus: 75,
    redemptions: 0,
    channels: ['qr'],
    tags: ['libros', 'evento'],
    crossPromo: false,
  },
];

const STATUS_CONFIG = {
  active: { label: 'Activa', color: 'bg-emerald-100 text-emerald-700' },
  scheduled: { label: 'Programada', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Finalizada', color: 'bg-muted text-muted-foreground' },
};

const TYPE_CONFIG = {
  descuento: { label: 'Descuento', icon: 'Tag' },
  combo: { label: 'Combo', icon: 'Package' },
  evento: { label: 'Evento', icon: 'Calendar' },
  puntos: { label: 'Puntos extra', icon: 'Star' },
};

const CHANNEL_ICONS = {
  qr: 'QrCode',
  nfc: 'Wifi',
  geofence: 'MapPin',
  manual: 'Hash',
  tpv: 'CreditCard',
};

const CampaignZoneCard = ({ campaign, onCrossPromoToggle }) => {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG?.[campaign?.status] || STATUS_CONFIG?.active;
  const type = TYPE_CONFIG?.[campaign?.type] || TYPE_CONFIG?.descuento;
  const daysLeft = Math.max(0, Math.ceil((new Date(campaign?.endDate) - new Date()) / (1000 * 60 * 60 * 24)));

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${campaign?.crossPromo ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'}`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-primary">{campaign?.businessLogo}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="text-xs text-muted-foreground">
                  {campaign?.businessName} · <span className="text-primary font-medium">{campaign?.distance}</span>
                </p>
                <h4 className="text-sm font-semibold text-foreground mt-0.5 leading-tight">{campaign?.name}</h4>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status?.color}`}>
                  {status?.label}
                </span>
                {campaign?.crossPromo && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">Cross-promo</span>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{campaign?.description}</p>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <div className="flex items-center gap-1">
                <Icon name={type?.icon} size={12} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{type?.label}</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon name="Star" size={12} className="text-amber-500" />
                <span className="text-xs text-muted-foreground">+{campaign?.pointsBonus} pts bonus</span>
              </div>
              {campaign?.status === 'active' && (
                <div className="flex items-center gap-1">
                  <Icon name="Clock" size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {daysLeft === 0 ? 'Último día' : `${daysLeft} días restantes`}
                  </span>
                </div>
              )}
              {campaign?.status === 'scheduled' && (
                <div className="flex items-center gap-1">
                  <Icon name="CalendarClock" size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Inicia {new Date(campaign?.startDate)?.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                {campaign?.channels?.map(ch => (
                  <Icon key={ch} name={CHANNEL_ICONS?.[ch] || 'Globe'} size={12} className="text-muted-foreground" />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              <strong className="text-foreground">{campaign?.redemptions}</strong> canjes
            </span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              {expanded ? 'Ocultar' : 'Ver detalle'}
              <Icon name={expanded ? 'ChevronUp' : 'ChevronDown'} size={12} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Promover a mis clientes</span>
            <button
              onClick={() => onCrossPromoToggle?.(campaign?.id)}
              className={`relative w-9 h-5 rounded-full transition-colors ${campaign?.crossPromo ? 'bg-primary' : 'bg-slate-300'}`}
            >
              <span
                className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                style={{ left: campaign?.crossPromo ? '18px' : '2px' }}
              />
            </button>
          </div>
        </div>
        {expanded && (
          <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Inicio</p>
                <p className="text-xs font-medium text-foreground">
                  {new Date(campaign?.startDate)?.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="p-2 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Fin</p>
                <p className="text-xs font-medium text-foreground">
                  {new Date(campaign?.endDate)?.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="p-2 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Canales de acreditación</p>
              <div className="flex items-center gap-2 flex-wrap">
                {campaign?.channels?.map(ch => (
                  <span key={ch} className="flex items-center gap-1 px-2 py-0.5 bg-background border border-border rounded-md text-xs text-foreground">
                    <Icon name={CHANNEL_ICONS?.[ch] || 'Globe'} size={11} />
                    {ch?.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
            {campaign?.tags?.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {campaign?.tags?.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-muted rounded-full text-xs text-muted-foreground">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ZonaTab = () => {
  const [joined, setJoined] = useState(false);
  const [notifyMe, setNotifyMe] = useState(false);
  const [contribution, setContribution] = useState(5);
  const [zoneRewards, setZoneRewards] = useState([
    { id: 1, name: 'Café americano gratis', ownCost: 100, zoneCost: 150, active: true },
  ]);
  const [showAddReward, setShowAddReward] = useState(false);
  const [newReward, setNewReward] = useState({ name: '', ownCost: 0, zoneCost: 0 });
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [zoneCampaigns, setZoneCampaigns] = useState(ZONE_CAMPAIGNS);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const hasZoneProgram = true;

  const handleCrossPromoToggle = (campaignId) => {
    setZoneCampaigns(prev =>
      prev?.map(c => c?.id === campaignId ? { ...c, crossPromo: !c?.crossPromo } : c)
    );
  };

  const filteredCampaigns = zoneCampaigns?.filter(c => {
    if (campaignFilter === 'active') return c?.status === 'active';
    if (campaignFilter === 'scheduled') return c?.status === 'scheduled';
    if (campaignFilter === 'cross') return c?.crossPromo;
    return true;
  });

  const activeCampaignsCount = zoneCampaigns?.filter(c => c?.status === 'active')?.length;
  const crossPromoCount = zoneCampaigns?.filter(c => c?.crossPromo)?.length;

  if (!hasZoneProgram) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Icon name="MapPin" size={36} className="text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Sin programa de zona disponible</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          Aún no hay un programa de zona activo en tu área. PromoClub te notificará cuando se lance uno.
        </p>
        <Button
          onClick={() => setNotifyMe(true)}
          variant={notifyMe ? 'outline' : 'default'}
          iconName={notifyMe ? 'Check' : 'Bell'}
        >
          {notifyMe ? 'Te notificaremos' : 'Notificarme'}
        </Button>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="Globe" size={32} className="text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{ZONE_PROGRAM?.name}</h3>
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <Icon name="MapPin" size={14} />
              <span>{ZONE_PROGRAM?.zone} · Radio {ZONE_PROGRAM?.radius}</span>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-muted/30 rounded-xl">
                <p className="text-2xl font-bold text-foreground">{ZONE_PROGRAM?.businesses?.filter(b => b?.active)?.length}</p>
                <p className="text-xs text-muted-foreground">Negocios activos</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-xl">
                <p className="text-2xl font-bold text-foreground">{ZONE_PROGRAM?.totalPoints?.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Puntos en circulación</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-xl">
                <p className="text-2xl font-bold text-foreground">{ZONE_PROGRAM?.activeUsers?.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Usuarios activos</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="Megaphone" size={18} className="text-primary" />
                <p className="text-sm font-semibold text-foreground">Campañas activas en la zona</p>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                  {activeCampaignsCount} activas
                </span>
              </div>
              <div className="space-y-2">
                {ZONE_CAMPAIGNS?.filter(c => c?.status === 'active')?.slice(0, 2)?.map(c => (
                  <div key={c?.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">{c?.businessLogo}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c?.name}</p>
                      <p className="text-xs text-muted-foreground">{c?.businessName} · {c?.distance}</p>
                    </div>
                    <span className="text-xs font-medium text-emerald-600 flex-shrink-0">+{c?.pointsBonus} pts</span>
                  </div>
                ))}
                {activeCampaignsCount > 2 && (
                  <p className="text-xs text-muted-foreground text-center py-1">
                    +{activeCampaignsCount - 2} campañas más disponibles al unirte
                  </p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold text-foreground mb-3">Negocios participantes</p>
              <div className="space-y-2">
                {ZONE_PROGRAM?.businesses?.map(b => (
                  <div key={b?.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{b?.logo}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{b?.name}</p>
                        <p className="text-xs text-muted-foreground">{b?.category} · {b?.distance}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${b?.active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                        {b?.active ? 'Activo' : 'Inactivo'}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">{b?.points?.toLocaleString()} pts emitidos</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl mb-6">
              <p className="text-sm font-semibold text-foreground mb-2">¿Cómo funciona?</p>
              <ul className="space-y-1.5">
                {[
                  'Tus clientes ganan puntos de zona adicionales en cada visita.',
                  'Los puntos de zona se canjean en cualquier negocio participante.',
                  'Las campañas activas de negocios vecinos se muestran a tus clientes.',
                  'Genera descubrimiento cruzado y aumenta el tráfico de la zona.',
                ]?.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Icon name="Check" size={12} className="text-primary mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <Button onClick={() => setJoined(true)} iconName="Plus" className="w-full">
              Unirme al programa {ZONE_PROGRAM?.name}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Joined state
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
            <Icon name="Globe" size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{ZONE_PROGRAM?.name}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Icon name="MapPin" size={11} />
              <span>{ZONE_PROGRAM?.zone} · Radio {ZONE_PROGRAM?.radius}</span>
            </div>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">● Participando</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Puntos de zona emitidos (mes)', value: '1,240', icon: 'TrendingUp', color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Puntos de zona canjeados', value: '380', icon: 'Gift', color: 'text-purple-600 bg-purple-50' },
          { label: 'Clientes que canjearon', value: '47', icon: 'Users', color: 'text-blue-600 bg-blue-50' },
          { label: 'Campañas activas en zona', value: activeCampaignsCount?.toString(), icon: 'Megaphone', color: 'text-amber-600 bg-amber-50' },
        ]?.map(card => (
          <div key={card?.label} className="bg-card border border-border rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${card?.color}`}>
              <Icon name={card?.icon} size={18} />
            </div>
            <p className="text-2xl font-bold text-foreground">{card?.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card?.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl">
        <div className="p-5 border-b border-border">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Icon name="Megaphone" size={18} className="text-primary" />
                <h4 className="font-semibold text-foreground">Campañas activas en tu zona</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Campañas de negocios a menos de {ZONE_PROGRAM?.radius} de tu ubicación. Activa "Promover a mis clientes" para que aparezcan en la app de tus usuarios.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
                {activeCampaignsCount} activas
              </span>
              {crossPromoCount > 0 && (
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium">
                  {crossPromoCount} cross-promo
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 overflow-x-auto">
            {[
              { id: 'all', label: 'Todas', count: zoneCampaigns?.length },
              { id: 'active', label: 'Activas', count: activeCampaignsCount },
              { id: 'scheduled', label: 'Próximas', count: zoneCampaigns?.filter(c => c?.status === 'scheduled')?.length },
              { id: 'cross', label: 'Cross-promo', count: crossPromoCount },
            ]?.map(f => (
              <button
                key={f?.id}
                onClick={() => setCampaignFilter(f?.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${campaignFilter === f?.id ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
              >
                {f?.label}
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${campaignFilter === f?.id ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>
                  {f?.count}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="p-5">
          {filteredCampaigns?.length === 0 ? (
            <div className="text-center py-10">
              <Icon name="Megaphone" size={32} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No hay campañas en este filtro</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCampaigns?.map(campaign => (
                <CampaignZoneCard
                  key={campaign?.id}
                  campaign={campaign}
                  onCrossPromoToggle={handleCrossPromoToggle}
                />
              ))}
            </div>
          )}
        </div>
        {crossPromoCount > 0 && (
          <div className="mx-5 mb-5 p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-2">
            <Icon name="Info" size={14} className="text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">{crossPromoCount} campaña{crossPromoCount !== 1 ? 's' : ''}</strong> marcada{crossPromoCount !== 1 ? 's' : ''} como cross-promo
              aparecerán en la sección "Zona" de la app de tus clientes, generando tráfico cruzado hacia esos negocios.
            </p>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h4 className="font-semibold text-foreground mb-1">Contribución al programa de zona</h4>
        <p className="text-xs text-muted-foreground mb-4">
          Puntos de zona adicionales que tus clientes ganan en cada visita, sobre sus puntos propios.
        </p>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground block mb-2">
              Puntos de zona por visita: <strong>{contribution}</strong>
            </label>
            <input
              type="range" min="1" max="20" value={contribution}
              onChange={e => setContribution(parseInt(e?.target?.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1 pt</span><span>20 pts</span>
            </div>
          </div>
          <div className="p-4 bg-muted/30 rounded-xl text-center min-w-[80px]">
            <p className="text-xs text-muted-foreground mb-1">Por visita</p>
            <p className="text-2xl font-bold text-foreground">+{contribution}</p>
            <p className="text-xs text-muted-foreground">pts de zona</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Un cliente que visita tu negocio recibe sus puntos normales <strong>+</strong> {contribution} puntos de zona.
          Estos puntos se pueden canjear en cualquier negocio participante.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-foreground">Recompensas aceptadas con puntos de zona</h4>
          <Button size="sm" iconName="Plus" onClick={() => setShowAddReward(true)}>Agregar</Button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Define qué recompensas de tu negocio pueden pagarse (total o parcialmente) con puntos de zona.
        </p>
        <div className="space-y-3">
          {zoneRewards?.map(r => (
            <div key={r?.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">{r?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {r?.ownCost} pts propios <span className="mx-1">·</span> {r?.zoneCost} pts de zona
                </p>
              </div>
              <button
                onClick={() => setZoneRewards(prev => prev?.map(rw => rw?.id === r?.id ? { ...rw, active: !rw?.active } : rw))}
                className={`px-3 py-1 rounded-full text-xs font-medium ${r?.active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}
              >
                {r?.active ? 'Activo' : 'Inactivo'}
              </button>
            </div>
          ))}
        </div>
        {showAddReward && (
          <div className="mt-4 p-4 border border-border rounded-lg bg-muted/20 space-y-3">
            <input
              value={newReward?.name}
              onChange={e => setNewReward(p => ({ ...p, name: e?.target?.value }))}
              placeholder="Nombre de la recompensa"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
            />
            <div className="flex gap-3">
              <input
                type="number" value={newReward?.ownCost}
                onChange={e => setNewReward(p => ({ ...p, ownCost: parseInt(e?.target?.value) || 0 }))}
                placeholder="Pts propios"
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
              />
              <input
                type="number" value={newReward?.zoneCost}
                onChange={e => setNewReward(p => ({ ...p, zoneCost: parseInt(e?.target?.value) || 0 }))}
                placeholder="Pts de zona"
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => {
                if (newReward?.name) {
                  setZoneRewards(prev => [...prev, { ...newReward, id: Date.now(), active: true }]);
                  setNewReward({ name: '', ownCost: 0, zoneCost: 0 });
                  setShowAddReward(false);
                }
              }}>Guardar</Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddReward(false)}>Cancelar</Button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h4 className="font-semibold text-foreground mb-1">Negocios co-participantes</h4>
        <p className="text-xs text-muted-foreground mb-4">
          Negocios en tu zona que también participan en el programa compartido.
        </p>
        <div className="space-y-3">
          {ZONE_PROGRAM?.businesses?.map(b => {
            const bCampaigns = ZONE_CAMPAIGNS?.filter(c => c?.businessName === b?.name && c?.status === 'active');
            return (
              <div key={b?.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{b?.logo}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{b?.name}</p>
                    <p className="text-xs text-muted-foreground">{b?.category} · {b?.distance}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${b?.active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                    {b?.active ? 'Activo' : 'Inactivo'}
                  </span>
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    <span className="text-xs text-muted-foreground">{b?.points?.toLocaleString()} pts</span>
                    {bCampaigns?.length > 0 && (
                      <span className="text-xs text-primary font-medium">
                        {bCampaigns?.length} campaña{bCampaigns?.length !== 1 ? 's' : ''} activa{bCampaigns?.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          iconName="LogOut"
          onClick={() => setShowLeaveModal(true)}
          className="text-destructive border-destructive/30 hover:bg-destructive/5"
        >
          Salir del programa de zona
        </Button>
      </div>

      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Icon name="AlertTriangle" size={24} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">¿Salir del programa de zona?</h3>
                <p className="text-sm text-muted-foreground">Esta acción afecta a tus clientes</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Tus clientes dejarán de acumular puntos de zona y las campañas cross-promo se desactivarán.
              Los puntos de zona ya acumulados por tus clientes <strong>no se eliminarán</strong>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setJoined(false); setShowLeaveModal(false); }}
                className="flex-1 py-2.5 bg-destructive text-white rounded-xl font-medium text-sm hover:bg-destructive/90 transition-colors"
              >
                Sí, salir
              </button>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="flex-1 py-2.5 border border-border rounded-xl font-medium text-sm hover:bg-muted/50 transition-colors text-foreground"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZonaTab;
