import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useCurrency } from '../../../contexts/CurrencyContext';
import GiftCardWalletPreviewModal from './GiftCardWalletPreviewModal';

const CONFIGURED_CARDS = [
  {
    id: 'gc-digital-1',
    type: 'digital',
    name: 'Gift Card Digital — Cumpleaños',
    template: 'birthday',
    templateLabel: 'Cumpleaños',
    status: 'active',
    denominations: [100, 250, 500, 1000],
    freeAmount: false,
    validityDays: 365,
    message: 'Gracias por elegirnos — Café Roma',
    gradient: 'from-pink-500 to-rose-600',
    icon: 'Gift',
    metrics: {
      sold: 87,
      totalSold: 43500,
      redeemed: 31200,
      pending: 12300,
      redemptionRate: 71.7,
    },
    customers: [
      { name: 'María García', date: '2025-02-15', amount: 500, balance: 350, status: 'active' },
      { name: 'Carlos Ruiz', date: '2025-02-10', amount: 250, balance: 0, status: 'used' },
      { name: 'Ana Torres', date: '2025-01-28', amount: 1000, balance: 1000, status: 'active' },
      { name: 'Luis Martínez', date: '2025-01-20', amount: 100, balance: 75, status: 'active' },
      { name: 'Sofia Herrera', date: '2025-01-05', amount: 500, balance: 0, status: 'used' },
    ],
  },
  {
    id: 'gc-digital-2',
    type: 'digital',
    name: 'Gift Card Digital — Amor y Amistad',
    template: 'love',
    templateLabel: 'Amor / Amistad',
    status: 'active',
    denominations: [200, 500],
    freeAmount: true,
    freeMin: 50,
    freeMax: 2000,
    validityDays: 180,
    message: 'Con cariño — Café Roma',
    gradient: 'from-red-400 to-pink-600',
    icon: 'Heart',
    metrics: {
      sold: 42,
      totalSold: 18900,
      redeemed: 11400,
      pending: 7500,
      redemptionRate: 60.3,
    },
    customers: [
      { name: 'Daniela Vega', date: '2025-02-20', amount: 500, balance: 200, status: 'active' },
      { name: 'Roberto Díaz', date: '2025-02-14', amount: 200, balance: 0, status: 'used' },
      { name: 'Paola Reyes', date: '2025-02-14', amount: 500, balance: 500, status: 'active' },
    ],
  },
  {
    id: 'gc-corporate-1',
    type: 'corporate',
    name: 'Gift Cards Corporativas',
    template: 'corporate',
    templateLabel: 'Corporativo',
    status: 'active',
    denominations: [500, 1000, 2000],
    freeAmount: false,
    validityDays: 365,
    message: 'Gracias por su preferencia — Café Roma',
    gradient: 'from-slate-600 to-slate-800',
    icon: 'Building2',
    metrics: {
      sold: 156,
      totalSold: 156000,
      redeemed: 98400,
      pending: 57600,
      redemptionRate: 63.1,
    },
    customers: [
      { name: 'Grupo Mazatlán S.A.', date: '2025-02-01', amount: 50000, balance: 32000, status: 'active' },
      { name: 'Tech Solutions MX', date: '2025-01-15', amount: 25000, balance: 8000, status: 'active' },
      { name: 'Distribuidora Norte', date: '2024-12-20', amount: 15000, balance: 0, status: 'used' },
    ],
  },
  {
    id: 'prepaid-1',
    type: 'prepaid',
    name: 'Tarjeta Prepago Recargable',
    template: 'membership',
    templateLabel: 'Membresía',
    status: 'active',
    denominations: [100, 200, 500],
    freeAmount: true,
    freeMin: 50,
    freeMax: 5000,
    validityDays: null,
    message: 'Tu monedero digital — Café Roma',
    gradient: 'from-violet-500 to-purple-700',
    icon: 'Wallet',
    metrics: {
      sold: 234,
      totalSold: 117000,
      redeemed: 89300,
      pending: 27700,
      redemptionRate: 76.3,
    },
    customers: [
      { name: 'Fernando López', date: '2025-01-10', amount: 500, balance: 320, status: 'active' },
      { name: 'Claudia Morales', date: '2025-01-08', amount: 200, balance: 200, status: 'active' },
      { name: 'Jorge Castillo', date: '2024-12-15', amount: 1000, balance: 450, status: 'active' },
      { name: 'Valeria Núñez', date: '2024-12-01', amount: 100, balance: 0, status: 'used' },
    ],
  },
  {
    id: 'promo-recarga-1',
    type: 'promo',
    name: 'Promo Recarga — Carga $500, obtén $600',
    template: 'promo',
    templateLabel: 'Promo Recarga',
    status: 'active',
    denominations: [200, 500, 1000],
    bonusTiers: [
      { load: 200, bonus: 20, total: 220 },
      { load: 500, bonus: 100, total: 600 },
      { load: 1000, bonus: 300, total: 1300 },
    ],
    validityDays: 30,
    message: '¡Recarga con bonus extra esta semana!',
    gradient: 'from-amber-400 to-orange-500',
    icon: 'Zap',
    metrics: {
      sold: 63,
      totalSold: 38500,
      redeemed: 22100,
      pending: 16400,
      redemptionRate: 57.4,
    },
    customers: [
      { name: 'Alejandro Soto', date: '2025-02-25', amount: 500, balance: 600, status: 'active' },
      { name: 'Mariana Cruz', date: '2025-02-22', amount: 1000, balance: 1300, status: 'active' },
      { name: 'Héctor Vargas', date: '2025-02-18', amount: 200, balance: 0, status: 'used' },
    ],
  },
  {
    id: 'gc-navidad',
    type: 'digital',
    name: 'Gift Card — Navidad / Fin de Año',
    template: 'christmas',
    templateLabel: 'Navidad',
    status: 'paused',
    denominations: [250, 500, 1000],
    freeAmount: false,
    validityDays: 90,
    message: '¡Felices fiestas! — Café Roma',
    gradient: 'from-green-600 to-emerald-700',
    icon: 'Star',
    metrics: {
      sold: 31,
      totalSold: 15500,
      redeemed: 14200,
      pending: 1300,
      redemptionRate: 91.6,
    },
    customers: [
      { name: 'Patricia Ibarra', date: '2024-12-24', amount: 500, balance: 0, status: 'used' },
      { name: 'Miguel Ángel Ríos', date: '2024-12-20', amount: 1000, balance: 800, status: 'active' },
    ],
  },
];

const STATUS_CONFIG = {
  active: { label: 'Activa', color: 'bg-success/15 text-success border border-success/20' },
  paused: { label: 'Pausada', color: 'bg-warning/15 text-warning border border-warning/20' },
  draft: { label: 'Borrador', color: 'bg-muted text-muted-foreground border border-border' },
};

const CUSTOMER_STATUS = {
  active: { label: 'Activa', color: 'text-success' },
  used: { label: 'Usada', color: 'text-muted-foreground' },
  expired: { label: 'Vencida', color: 'text-destructive' },
};

const TYPE_LABELS = {
  digital: 'Gift Card Digital',
  corporate: 'Corporativa',
  prepaid: 'Tarjeta Prepago',
  promo: 'Promo Recarga',
};

const ConfiguredCardsGrid = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [expandedCustomers, setExpandedCustomers] = useState({});
  const [previewCard, setPreviewCard] = useState(null);
  const [cardStatuses, setCardStatuses] = useState(
    Object.fromEntries(CONFIGURED_CARDS?.map(c => [c?.id, c?.status]))
  );
  const [cards, setCards] = useState(CONFIGURED_CARDS);

  const toggleCustomers = (id) => {
    setExpandedCustomers(prev => ({ ...prev, [id]: !prev?.[id] }));
  };

  const toggleStatus = (id) => {
    setCardStatuses(prev => ({
      ...prev,
      [id]: prev?.[id] === 'active' ? 'paused' : 'active',
    }));
  };

  const handleDuplicate = (card) => {
    const newCard = {
      ...card,
      id: `${card?.id}-copy-${Date.now()}`,
      name: `${card?.name} (Copia)`,
      status: 'draft',
      metrics: { sold: 0, totalSold: 0, redeemed: 0, pending: 0, redemptionRate: 0 },
      customers: [],
    };
    setCards(prev => [...prev, newCard]);
    setCardStatuses(prev => ({ ...prev, [newCard?.id]: 'draft' }));
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar esta configuración de tarjeta?')) {
      setCards(prev => prev?.filter(c => c?.id !== id));
    }
  };

  const getEditRoute = (card) => {
    if (card?.type === 'prepaid') return '/gift-cards-management/prepaid';
    if (card?.type === 'promo') return '/gift-cards-management/prepaid';
    return '/gift-cards-management/new';
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Tarjetas Configuradas</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{cards?.length} configuraciones activas bajo el nuevo esquema</p>
          </div>
          <Button onClick={() => navigate('/gift-cards-management/new')} iconName="Plus" iconPosition="left" size="sm">
            Nueva Configuración
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {cards?.map((card) => {
            const status = cardStatuses?.[card?.id] || card?.status;
            const isExpanded = expandedCustomers?.[card?.id];
            const statusCfg = STATUS_CONFIG?.[status] || STATUS_CONFIG?.draft;

            return (
              <div key={card?.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Card Header with visual */}
                <div className={`bg-gradient-to-r ${card?.gradient} p-5 relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-white/30" />
                    <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/20" />
                  </div>
                  <div className="relative flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Icon name={card?.icon} size={22} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white/70 uppercase tracking-wider">{TYPE_LABELS?.[card?.type]}</p>
                        <h3 className="text-base font-bold text-white leading-tight mt-0.5">{card?.name}</h3>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg?.color} bg-white/90`}>
                      {statusCfg?.label}
                    </span>
                  </div>
                  <div className="relative mt-3 flex items-center gap-4">
                    <div className="text-white/80 text-xs">
                      <span className="font-medium text-white">{card?.templateLabel}</span> · {card?.validityDays ? `${card?.validityDays} días` : 'Sin vencimiento'}
                    </div>
                    {card?.denominations && (
                      <div className="flex gap-1 flex-wrap">
                        {card?.denominations?.slice(0, 3)?.map(d => (
                          <span key={d} className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">${d}</span>
                        ))}
                        {card?.denominations?.length > 3 && (
                          <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">+{card?.denominations?.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {/* Metrics */}
                <div className="p-4 border-b border-border">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{card?.metrics?.sold}</p>
                      <p className="text-xs text-muted-foreground leading-tight">Vendidas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{formatPrice(card?.metrics?.totalSold)}</p>
                      <p className="text-xs text-muted-foreground leading-tight">Total vendido</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-success">{formatPrice(card?.metrics?.redeemed)}</p>
                      <p className="text-xs text-muted-foreground leading-tight">Canjeado</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-warning">{formatPrice(card?.metrics?.pending)}</p>
                      <p className="text-xs text-muted-foreground leading-tight">Pendiente</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Tasa de canje</span>
                      <span className="font-medium text-foreground">{card?.metrics?.redemptionRate}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all"
                        style={{ width: `${card?.metrics?.redemptionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
                {/* Customers section */}
                <div className="px-4 py-3 border-b border-border">
                  <button
                    onClick={() => toggleCustomers(card?.id)}
                    className="w-full flex items-center justify-between text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Icon name="Users" size={14} className="text-muted-foreground" />
                      Clientes que adquirieron
                      <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{card?.customers?.length}</span>
                    </span>
                    <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={14} className="text-muted-foreground" />
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-2">
                      <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground px-1 pb-1 border-b border-border">
                        <span>Cliente</span>
                        <span>Fecha</span>
                        <span>Monto</span>
                        <span>Saldo / Estado</span>
                      </div>
                      {card?.customers?.map((customer, idx) => (
                        <div key={idx} className="grid grid-cols-4 gap-2 text-xs py-1.5 px-1 rounded-lg hover:bg-muted/40 transition-colors">
                          <span className="font-medium text-foreground truncate">{customer?.name}</span>
                          <span className="text-muted-foreground">{customer?.date}</span>
                          <span className="text-foreground font-medium">{formatPrice(customer?.amount)}</span>
                          <span className={`font-medium ${CUSTOMER_STATUS?.[customer?.status]?.color}`}>
                            {customer?.status === 'active' ? formatPrice(customer?.balance) : CUSTOMER_STATUS?.[customer?.status]?.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Actions */}
                <div className="p-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      iconName="Edit"
                      iconPosition="left"
                      onClick={() => navigate(getEditRoute(card))}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      iconName="Eye"
                      iconPosition="left"
                      onClick={() => setPreviewCard(card)}
                    >
                      Vista Previa
                    </Button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleStatus(card?.id)}
                      title={status === 'active' ? 'Pausar' : 'Activar'}
                      className={`p-2 rounded-lg transition-colors ${
                        status === 'active' ?'text-warning hover:bg-warning/10' :'text-success hover:bg-success/10'
                      }`}
                    >
                      <Icon name={status === 'active' ? 'PauseCircle' : 'PlayCircle'} size={16} />
                    </button>
                    <button
                      onClick={() => handleDuplicate(card)}
                      title="Duplicar"
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Icon name="Copy" size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(card?.id)}
                      title="Eliminar"
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Icon name="Trash2" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {previewCard && (
        <GiftCardWalletPreviewModal
          card={previewCard}
          onClose={() => setPreviewCard(null)}
        />
      )}
    </>
  );
};

export default ConfiguredCardsGrid;
