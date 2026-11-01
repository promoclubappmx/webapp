import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Profile360Tab from './components/Profile360Tab';
import NPSProfileSection from './components/NPSProfileSection';
import QuickActionsDrawer from './components/QuickActionsDrawer';

// ---- Helpers ----
const getScoreLevel = (score) => {
  if (score >= 90) return { label: 'Superfan', color: '#10b981' };
  if (score >= 70) return { label: 'Comprometido', color: '#22c55e' };
  if (score >= 40) return { label: 'Casual', color: '#eab308' };
  if (score >= 20) return { label: 'Dormido', color: '#f97316' };
  return { label: 'Perdido', color: '#ef4444' };
};

const getVipBadge = (level) => {
  const styles = { 'Oro': 'bg-yellow-100 text-yellow-700 border border-yellow-300', 'Plata': 'bg-slate-100 text-slate-600 border border-slate-300', 'Bronce': 'bg-amber-100 text-amber-700 border border-amber-300', 'Nuevo': 'bg-blue-50 text-blue-600 border border-blue-200' };
  return styles?.[level] || 'bg-gray-100 text-gray-600';
};

const getStatusBadge = (status) => {
  const styles = { 'activo': 'bg-green-100 text-green-700', 'suspendido': 'bg-orange-100 text-orange-700', 'eliminado': 'bg-red-100 text-red-700' };
  return styles?.[status] || 'bg-gray-100 text-gray-700';
};

const getRelativeDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  return `Hace ${Math.floor(diffDays / 30)} meses`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const d = new Date(dateStr);
  return `${months?.[d?.getMonth()]} ${d?.getFullYear()}`;
};

const eventColors = {
  checkin: 'bg-green-100 text-green-600',
  points: 'bg-amber-100 text-amber-600',
  coupon: 'bg-blue-100 text-blue-600',
  coupon_download: 'bg-indigo-100 text-indigo-600',
  review: 'bg-yellow-100 text-yellow-600',
  vip: 'bg-yellow-100 text-yellow-700',
  automation: 'bg-orange-100 text-orange-600',
  points_redeem: 'bg-purple-100 text-purple-600',
  punch: 'bg-green-100 text-green-700',
  note: 'bg-gray-100 text-gray-500',
  referral: 'bg-green-100 text-green-600',
  survey: 'bg-gray-100 text-gray-500',
  reservation: 'bg-cyan-100 text-cyan-600',
  pos: 'bg-blue-100 text-blue-600',
};

const filterTypes = [
  { id: 'all', label: 'Todos' },
  { id: 'checkin', label: 'Visitas' },
  { id: 'coupon', label: 'Canjes' },
  { id: 'points', label: 'Puntos' },
  { id: 'review', label: 'Reseñas' },
  { id: 'automation', label: 'Automatizaciones' },
];

// Sparkline mini chart
const Sparkline = ({ color = '#3b82f6' }) => {
  const points = Array.from({ length: 12 }, (_, i) => Math.sin(i * 0.5) * 15 + 25);
  const max = Math.max(...points);
  const h = 32, w = 80;
  const pts = points?.map((v, i) => `${(i / (points?.length - 1)) * w},${h - (v / max) * h}`)?.join(' ');
  return (
    <svg width={w} height={h} className="opacity-70">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// Score Gauge
const ScoreGauge = ({ score, showTooltip, onMouseEnter, onMouseLeave, breakdown }) => {
  const level = getScoreLevel(score);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  return (
    <div className="relative" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <svg width="72" height="72" className="-rotate-90">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="6" />
        <circle cx="36" cy="36" r={radius} fill="none" stroke={level?.color} strokeWidth="6"
          strokeDasharray={`${progress} ${circumference}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.5s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold" style={{ color: level?.color }}>{score}</span>
      </div>
      {showTooltip && breakdown && Object.keys(breakdown)?.length > 0 && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-card border border-border rounded-xl shadow-xl p-4 w-56 z-50">
          <div className="text-xs font-semibold mb-3 text-foreground">Desglose del score</div>
          {Object.entries(breakdown)?.map(([key, val]) => (
            <div key={key} className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="capitalize text-muted-foreground">{key}</span>
                <span className="font-semibold">{val}/100</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-primary" style={{ width: `${val}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---- Timeline Tab ----
const TimelineTab = ({ customerId, ownerId }) => {
  const [activeFilters, setActiveFilters] = useState(['all']);
  const [search, setSearch] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTimeline = useCallback(async () => {
    if (!customerId || !ownerId) return;
    setLoading(true);
    const allEvents = [];

    try {
      // Check-ins
      const { data: checkins } = await supabase?.from('check_ins')?.select('id, created_at, method, location_id, business_locations(business_name)')?.eq('customer_id', customerId)?.eq('owner_id', ownerId)?.order('created_at', { ascending: false })?.limit(50);

      checkins?.forEach(ci => {
        allEvents?.push({
          id: `ci-${ci?.id}`,
          type: 'checkin',
          icon: 'MapPin',
          title: `Check-in vía ${ci?.method || 'QR'}`,
          detail: ci?.business_locations?.business_name ? `En: ${ci?.business_locations?.business_name}` : 'Check-in registrado',
          date: ci?.created_at,
        });
      });

      // Coupon redemptions
      const { data: coupons } = await supabase?.from('coupon_redemptions')?.select('id, redeemed_at, coupons(name, discount_value, discount_type)')?.eq('customer_id', customerId)?.eq('owner_id', ownerId)?.order('redeemed_at', { ascending: false })?.limit(30);

      coupons?.forEach(cr => {
        allEvents?.push({
          id: `cr-${cr?.id}`,
          type: 'coupon',
          icon: 'Ticket',
          title: `Canjeó cupón "${cr?.coupons?.name || 'Cupón'}"`,
          detail: cr?.coupons?.discount_value ? `Descuento: ${cr?.coupons?.discount_type === 'percentage' ? cr?.coupons?.discount_value + '%' : '$' + cr?.coupons?.discount_value}` : 'Cupón canjeado',
          date: cr?.redeemed_at,
        });
      });

      // Points transactions
      const { data: pointsTx } = await supabase?.from('loyalty_transactions')?.select('id, created_at, points, transaction_type, description')?.eq('customer_id', customerId)?.eq('owner_id', ownerId)?.order('created_at', { ascending: false })?.limit(30);

      pointsTx?.forEach(pt => {
        const isRedeem = pt?.transaction_type === 'redeem' || pt?.points < 0;
        allEvents?.push({
          id: `pt-${pt?.id}`,
          type: isRedeem ? 'points_redeem' : 'points',
          icon: isRedeem ? 'Gift' : 'Coins',
          title: isRedeem ? `Canjeó ${Math.abs(pt?.points)} puntos` : `Acumuló ${pt?.points} puntos`,
          detail: pt?.description || (isRedeem ? 'Canje de puntos' : 'Puntos por visita'),
          date: pt?.created_at,
        });
      });

      // Reviews
      const { data: reviews } = await supabase?.from('reviews')?.select('id, created_at, rating, comment, business_locations(business_name)')?.eq('customer_id', customerId)?.eq('owner_id', ownerId)?.order('created_at', { ascending: false })?.limit(20);

      reviews?.forEach(rv => {
        allEvents?.push({
          id: `rv-${rv?.id}`,
          type: 'review',
          icon: 'Star',
          title: `Dejó reseña: ${rv?.rating} estrella${rv?.rating !== 1 ? 's' : ''}`,
          detail: rv?.comment ? `"${rv?.comment?.substring(0, 80)}${rv?.comment?.length > 80 ? '...' : ''}"` : 'Sin comentario',
          date: rv?.created_at,
        });
      });

      // Communication history
      const { data: comms } = await supabase?.from('crm_communication_history')?.select('id, sent_at, channel, subject, campaign_name, opened, clicked, converted')?.eq('customer_id', customerId)?.eq('owner_id', ownerId)?.order('sent_at', { ascending: false })?.limit(20);

      comms?.forEach(cm => {
        allEvents?.push({
          id: `cm-${cm?.id}`,
          type: 'automation',
          icon: 'Zap',
          title: `Recibió ${cm?.channel || 'mensaje'}: "${cm?.campaign_name || cm?.subject || 'Campaña'}"`,
          detail: [cm?.opened && 'Abierto', cm?.clicked && 'Click', cm?.converted && 'Convertido']?.filter(Boolean)?.join(' · ') || 'Enviado',
          date: cm?.sent_at,
        });
      });

      // Sort all events by date desc
      allEvents?.sort((a, b) => new Date(b?.date) - new Date(a?.date));
    } catch (e) {
      console.error('Timeline error:', e?.message);
    } finally {
      setLoading(false);
    }

    setEvents(allEvents);
  }, [customerId, ownerId]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  const toggleFilter = (id) => {
    if (id === 'all') { setActiveFilters(['all']); return; }
    setActiveFilters(prev => {
      const without = prev?.filter(f => f !== 'all');
      if (without?.includes(id)) { const next = without?.filter(f => f !== id); return next?.length === 0 ? ['all'] : next; }
      return [...without, id];
    });
  };

  const filtered = events?.filter(e => {
    if (!activeFilters?.includes('all')) {
      const typeMap = { checkin: 'checkin', coupon: 'coupon', coupon_download: 'coupon', points: 'points', points_redeem: 'points', review: 'review', automation: 'automation' };
      if (!activeFilters?.some(f => typeMap?.[e?.type] === f || e?.type === f)) return false;
    }
    if (search && !e?.title?.toLowerCase()?.includes(search?.toLowerCase()) && !e?.detail?.toLowerCase()?.includes(search?.toLowerCase())) return false;
    return true;
  });

  // Group by date
  const groups = filtered?.reduce((acc, e) => {
    const d = new Date(e?.date);
    const label = d?.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!acc?.[label]) acc[label] = [];
    acc?.[label]?.push(e);
    return acc;
  }, {});

  if (loading) return (
    <div className="py-12 text-center">
      <Icon name="Loader2" size={24} className="mx-auto mb-2 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Cargando actividad...</p>
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <Icon name="Search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input className="pl-8 pr-3 py-1.5 border border-border rounded-lg text-xs bg-background w-44" placeholder="Buscar en timeline..." value={search} onChange={e => setSearch(e?.target?.value)} />
        </div>
        <div className="flex flex-wrap gap-1">
          {filterTypes?.map(f => (
            <button key={f?.id} onClick={() => toggleFilter(f?.id)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                activeFilters?.includes(f?.id) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}>{f?.label}</button>
          ))}
        </div>
      </div>
      <div className="relative">
        {Object.entries(groups)?.map(([group, evts]) => (
          <div key={group}>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-semibold text-muted-foreground bg-background px-2">{group}</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="relative pl-10 space-y-3 mb-4">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              {evts?.map(event => (
                <div key={event?.id} className="relative flex items-start gap-3">
                  <div className={`absolute -left-6 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${eventColors?.[event?.type] || 'bg-gray-100 text-gray-500'}`}>
                    <Icon name={event?.icon} size={14} />
                  </div>
                  <div className="flex-1 bg-card border border-border rounded-xl p-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{event?.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{event?.detail}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                        {new Date(event?.date)?.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {filtered?.length === 0 && (
          <div className="py-10 text-center">
            <Icon name="Clock" size={32} className="mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No hay eventos que coincidan con los filtros</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ---- Loyalty Tab ----
const LoyaltyTab = ({ client, ownerId }) => {
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [punchCards, setPunchCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!client?.id || !ownerId) return;
      setLoading(true);
      try {
        // Loyalty summary from owner_customers
        const { data: oc } = await supabase?.from('owner_customers')?.select('loyalty_points_earned, loyalty_points_redeemed, loyalty_points_balance')?.eq('customer_id', client?.id)?.eq('owner_id', ownerId)?.single();

        setLoyaltyData(oc);

        // Punch cards
        const { data: pc } = await supabase?.from('punch_card_progress')?.select('id, current_punches, punch_cards(name, required_punches, reward_description)')?.eq('customer_id', client?.id)?.eq('owner_id', ownerId);

        setPunchCards(pc || []);
      } catch (e) {
        console.error('Loyalty fetch error:', e?.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [client?.id, ownerId]);

  const vipLevels = ['Bronce', 'Plata', 'Oro'];
  const currentIdx = vipLevels?.indexOf(client?.vip_level);
  const nextLevel = vipLevels?.[currentIdx + 1];
  const progressPct = currentIdx === 0 ? 72 : currentIdx === 1 ? 45 : 100;

  const pointsBalance = loyaltyData?.loyalty_points_balance ?? client?.loyalty_points ?? 0;
  const pointsEarned = loyaltyData?.loyalty_points_earned ?? 0;
  const pointsRedeemed = loyaltyData?.loyalty_points_redeemed ?? 0;

  if (loading) return (
    <div className="py-12 text-center">
      <Icon name="Loader2" size={24} className="mx-auto mb-2 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Programa de Lealtad</h3>
            <p className="text-sm text-muted-foreground">Nivel actual: <span className={`font-semibold ${client?.vip_level === 'Oro' ? 'text-yellow-600' : client?.vip_level === 'Plata' ? 'text-slate-600' : 'text-amber-600'}`}>{client?.vip_level || 'Nuevo'}</span></p>
          </div>
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Icon name="Crown" size={24} className="text-yellow-600" />
          </div>
        </div>
        {nextLevel && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">{progressPct}% hacia {nextLevel}</span>
              <span className="font-medium">{Math.ceil((100 - progressPct) / 10)} visitas más</span>
            </div>
            <div className="w-full bg-yellow-100 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">{pointsBalance?.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">Saldo actual</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{pointsEarned?.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">Acumulados</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{pointsRedeemed?.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">Canjeados</div>
        </div>
      </div>

      {punchCards?.length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-3">Punch Cards activos</h4>
          <div className="space-y-3">
            {punchCards?.map(pc => {
              const required = pc?.punch_cards?.required_punches || 10;
              const current = pc?.current_punches || 0;
              return (
                <div key={pc?.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">{pc?.punch_cards?.name || 'Punch Card'}</span>
                    <span className="text-xs text-muted-foreground">{current} / {required} sellos</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {Array.from({ length: required }, (_, i) => (
                      <div key={i} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${i < current ? 'bg-amber-500 border-amber-500' : 'border-border'}`}>
                        {i < current && <Icon name="Check" size={12} className="text-white" />}
                      </div>
                    ))}
                  </div>
                  {pc?.punch_cards?.reward_description && (
                    <p className="text-xs text-muted-foreground mt-2">Recompensa: {pc?.punch_cards?.reward_description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ---- Coupons Tab ----
const CouponsTab = ({ customerId, ownerId }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!customerId || !ownerId) return;
      setLoading(true);
      try {
        const { data } = await supabase?.from('coupon_redemptions')?.select('id, redeemed_at, status, coupons(id, name, discount_value, discount_type, valid_until)')?.eq('customer_id', customerId)?.eq('owner_id', ownerId)?.order('redeemed_at', { ascending: false });

        // Also get active (downloaded but not redeemed) coupons
        const { data: downloads } = await supabase?.from('coupon_downloads')?.select('id, downloaded_at, used, coupons(id, name, discount_value, discount_type, valid_until)')?.eq('customer_id', customerId)?.eq('owner_id', ownerId)?.eq('used', false)?.order('downloaded_at', { ascending: false });

        const redeemed = (data || [])?.map(r => ({
          id: `r-${r?.id}`,
          name: r?.coupons?.name || 'Cupón',
          status: 'canjeado',
          date: r?.redeemed_at,
          discount: r?.coupons?.discount_type === 'percentage' ? `${r?.coupons?.discount_value}%` : `$${r?.coupons?.discount_value}`,
        }));

        const active = (downloads || [])?.map(d => ({
          id: `d-${d?.id}`,
          name: d?.coupons?.name || 'Cupón',
          status: 'activo',
          date: null,
          discount: d?.coupons?.discount_type === 'percentage' ? `${d?.coupons?.discount_value}%` : `$${d?.coupons?.discount_value}`,
          validUntil: d?.coupons?.valid_until,
        }));

        setCoupons([...active, ...redeemed]);
      } catch (e) {
        console.error('Coupons fetch error:', e?.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [customerId, ownerId]);

  if (loading) return (
    <div className="py-12 text-center">
      <Icon name="Loader2" size={24} className="mx-auto mb-2 animate-spin text-muted-foreground" />
    </div>
  );

  if (coupons?.length === 0) return (
    <div className="py-12 text-center">
      <Icon name="Ticket" size={32} className="mx-auto mb-2 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">Sin cupones registrados</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {coupons?.map(coupon => (
        <div key={coupon?.id} className="flex items-center gap-4 bg-card border border-border rounded-xl p-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            coupon?.status === 'activo' ? 'bg-green-100' : coupon?.status === 'canjeado' ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <Icon name="Ticket" size={20} className={coupon?.status === 'activo' ? 'text-green-600' : coupon?.status === 'canjeado' ? 'text-blue-600' : 'text-gray-400'} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{coupon?.name}</p>
            <p className="text-xs text-muted-foreground">
              {coupon?.discount} de descuento
              {coupon?.date ? ` · Canjeado el ${new Date(coupon?.date)?.toLocaleDateString('es-MX')}` : ''}
              {coupon?.validUntil ? ` · Válido hasta ${new Date(coupon?.validUntil)?.toLocaleDateString('es-MX')}` : ''}
            </p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            coupon?.status === 'activo' ? 'bg-green-100 text-green-700' : coupon?.status === 'canjeado' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
          }`}>{coupon?.status}</span>
        </div>
      ))}
    </div>
  );
};

// ---- Tags & Notes Tab ----
const TagsNotesTab = ({ client, ownerId }) => {
  const allSuggestions = ['Fan del café', 'Alérgico a nueces', 'Cliente corporativo', 'Cumpleaños diciembre', 'Influencer local', 'Prefiere terraza', 'Viene con niños', 'Paga en efectivo'];
  const tagColors = ['bg-red-100 text-red-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700', 'bg-pink-100 text-pink-700', 'bg-cyan-100 text-cyan-700', 'bg-orange-100 text-orange-700'];

  const [tags, setTags] = useState(client?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [notes, setNotes] = useState([]);
  const [noteInput, setNoteInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!client?.id || !ownerId) return;
      const { data } = await supabase?.from('customer_notes')?.select('id, note, created_at, author_name')?.eq('customer_id', client?.id)?.eq('owner_id', ownerId)?.order('created_at', { ascending: false });
      setNotes(data || []);
    };
    fetchNotes();
  }, [client?.id, ownerId]);

  const getTagColor = (tag) => tagColors?.[Math.abs(tag?.split('')?.reduce((a, c) => a + c?.charCodeAt(0), 0)) % tagColors?.length];
  const suggestions = allSuggestions?.filter(t => !tags?.includes(t) && t?.toLowerCase()?.includes(tagInput?.toLowerCase()));

  const addTag = async (tag) => {
    if (tags?.includes(tag)) return;
    const newTags = [...tags, tag];
    setTags(newTags);
    setTagInput('');
    setShowSuggestions(false);
    await supabase?.from('customer_profiles')?.update({ tags: newTags })?.eq('id', client?.id);
  };

  const removeTag = async (tag) => {
    const newTags = tags?.filter(t => t !== tag);
    setTags(newTags);
    await supabase?.from('customer_profiles')?.update({ tags: newTags })?.eq('id', client?.id);
  };

  const addNote = async () => {
    if (!noteInput?.trim() || !ownerId) return;
    setSaving(true);
    const { data, error } = await supabase?.from('customer_notes')?.insert({
      customer_id: client?.id,
      owner_id: ownerId,
      note: noteInput?.trim(),
      author_name: 'Admin',
    })?.select()?.single();
    if (!error && data) setNotes(prev => [data, ...prev]);
    setNoteInput('');
    setSaving(false);
  };

  const removeNote = async (id) => {
    await supabase?.from('customer_notes')?.delete()?.eq('id', id);
    setNotes(prev => prev?.filter(n => n?.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-sm mb-3">Tags del cliente</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {tags?.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Sin tags. Agrega tags para organizar a este cliente.</p>
          ) : (
            tags?.map(tag => (
              <span key={tag} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium ${getTagColor(tag)}`}>
                {tag}
                <button onClick={() => removeTag(tag)} className="ml-1 hover:opacity-70 transition-opacity">×</button>
              </span>
            ))
          )}
        </div>
        <div className="relative">
          <input
            className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background"
            placeholder="Agregar tag..."
            value={tagInput}
            onChange={e => { setTagInput(e?.target?.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={e => { if (e?.key === 'Enter' && tagInput?.trim()) addTag(tagInput?.trim()); }}
          />
          {showSuggestions && tagInput && suggestions?.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden">
              {suggestions?.map(s => (
                <button key={s} onClick={() => addTag(s)} className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors">{s}</button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-sm mb-3">Notas internas <span className="text-xs text-muted-foreground font-normal">(solo el staff las ve)</span></h3>
        <div className="flex gap-2 mb-4">
          <textarea
            className="flex-1 border border-border rounded-xl px-3 py-2 text-sm bg-background resize-none"
            rows={2}
            maxLength={500}
            placeholder="Agregar nota interna... (máx. 500 caracteres)"
            value={noteInput}
            onChange={e => setNoteInput(e?.target?.value)}
          />
          <button onClick={addNote} disabled={!noteInput?.trim() || saving} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 self-start mt-0.5">
            {saving ? '...' : 'Agregar'}
          </button>
        </div>
        <div className="space-y-3">
          {notes?.map(note => (
            <div key={note?.id} className="group bg-muted/30 rounded-xl p-4 relative">
              <p className="text-sm text-foreground mb-2">{note?.note}</p>
              <p className="text-xs text-muted-foreground">— {note?.author_name || 'Admin'}, {getRelativeDate(note?.created_at)}</p>
              <button onClick={() => removeNote(note?.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive">
                <Icon name="Trash2" size={14} />
              </button>
            </div>
          ))}
          {notes?.length === 0 && <p className="text-sm text-muted-foreground italic">Sin notas. Las notas son privadas y solo las ve el staff.</p>}
        </div>
      </div>
    </div>
  );
};

// ---- Main Component ----
const CustomerProfileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('actividad');
  const [showScoreTooltip, setShowScoreTooltip] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Customer data state
  const [client, setClient] = useState(null);
  const [ownerLink, setOwnerLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomer = useCallback(async () => {
    if (!id || !user?.id) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch customer profile
      const { data: cp, error: cpErr } = await supabase?.from('customer_profiles')?.select('*')?.eq('id', id)?.single();

      if (cpErr) throw cpErr;
      setClient(cp);

      // Fetch owner-customer link (for owner-specific data)
      const { data: oc } = await supabase?.from('owner_customers')?.select('id, linked_at, location_id, loyalty_points_earned, loyalty_points_redeemed, loyalty_points_balance, business_locations(business_name)')?.eq('customer_id', id)?.eq('owner_id', user?.id)?.single();

      setOwnerLink(oc);
    } catch (e) {
      setError(e?.message);
    } finally {
      setLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const tabs = [
    { id: 'actividad', label: 'Actividad', icon: 'Clock' },
    { id: 'perfil360', label: 'Perfil 360°', icon: 'Sparkles' },
    { id: 'lealtad', label: 'Lealtad', icon: 'Star' },
    { id: 'cupones', label: 'Cupones', icon: 'Ticket' },
    { id: 'tags', label: 'Tags y Notas', icon: 'Tag' },
  ];

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Icon name="Loader2" size={32} className="mx-auto mb-3 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Cargando perfil del cliente...</p>
      </div>
    </div>
  );

  if (error || !client) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Icon name="UserX" size={40} className="mx-auto mb-3 text-muted-foreground/40" />
        <p className="text-muted-foreground mb-4">{error || 'Cliente no encontrado'}</p>
        <button onClick={() => navigate('/crm-clients-list')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">
          Volver al CRM
        </button>
      </div>
    </div>
  );

  const score = client?.engagement_score || 0;
  const scoreLevel = getScoreLevel(score);
  const scoreBreakdown = client?.score_breakdown || {};

  // Build client-like object for sub-components that expect old shape
  const clientCompat = {
    id: client?.id,
    name: client?.full_name,
    email: client?.email,
    phone: client?.phone,
    vipLevel: client?.vip_level || 'Nuevo',
    vip_level: client?.vip_level || 'Nuevo',
    status: client?.account_status || 'activo',
    score,
    visits: client?.total_visits || 0,
    lastVisit: client?.last_visit_at,
    firstVisit: client?.first_visit_at || ownerLink?.linked_at,
    points: client?.loyalty_points || 0,
    loyalty_points: client?.loyalty_points || 0,
    pointsEarned: ownerLink?.loyalty_points_earned || 0,
    pointsRedeemed: ownerLink?.loyalty_points_redeemed || 0,
    couponsRedeemed: 0,
    estimatedSpend: client?.estimated_spend || 0,
    hasWhatsApp: client?.has_whatsapp || false,
    hasPrepaid: client?.has_prepaid || false,
    prepaidBalance: client?.prepaid_balance || 0,
    tags: client?.tags || [],
    scoreBreakdown,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-6 py-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/crm-clients-list')} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Icon name="ArrowLeft" size={20} />
            </button>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center text-2xl font-bold border-2 border-white/20">
              {client?.full_name?.charAt(0) || '?'}
            </div>
            <div>
              <h1 className="text-xl font-bold">{client?.full_name}</h1>
              <p className="text-sm text-slate-300 mt-0.5">
                Cliente desde {formatDate(clientCompat?.firstVisit)} · {client?.total_visits || 0} visitas · Última visita: {getRelativeDate(client?.last_visit_at)}
              </p>
              {ownerLink?.business_locations?.business_name && (
                <p className="text-xs text-slate-400 mt-0.5">
                  <Icon name="MapPin" size={11} className="inline mr-1" />
                  {ownerLink?.business_locations?.business_name}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${getVipBadge(client?.vip_level || 'Nuevo')}`}>{client?.vip_level || 'Nuevo'}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${getStatusBadge(client?.account_status || 'activo')}`}>{client?.account_status || 'activo'}</span>
                <span className="text-xs bg-blue-900/50 text-blue-300 border border-blue-700 px-2 py-0.5 rounded font-medium">LFPDPPP</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ScoreGauge
              score={score}
              showTooltip={showScoreTooltip}
              onMouseEnter={() => setShowScoreTooltip(true)}
              onMouseLeave={() => setShowScoreTooltip(false)}
              breakdown={scoreBreakdown}
            />
            <div className="flex items-center gap-2">
              <button onClick={() => setShowQuickActions(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                <Icon name="Zap" size={15} />Acciones
              </button>
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <Icon name="MoreVertical" size={20} />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-xl w-44 z-50 overflow-hidden">
                    {[['StickyNote', 'Agregar nota'], ['Tag', 'Editar tags'], ['MessageSquare', 'Enviar mensaje'], ['Download', 'Exportar perfil']]?.map(([icon, label]) => (
                      <button key={label} onClick={() => setShowMenu(false)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                        <Icon name={icon} size={16} className="text-muted-foreground" />{label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="flex items-center gap-6 mt-4 ml-14 text-sm text-slate-300 flex-wrap">
          {client?.email && <span className="flex items-center gap-1.5"><Icon name="Mail" size={14} />{client?.email}</span>}
          {client?.phone && <span className="flex items-center gap-1.5"><Icon name="Phone" size={14} />{client?.phone}</span>}
          <span className={`flex items-center gap-1.5 ${client?.has_whatsapp ? 'text-green-400' : 'text-slate-500'}`}>
            <Icon name="MessageCircle" size={14} />WhatsApp: {client?.has_whatsapp ? 'Vinculado' : 'No vinculado'}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-4 bg-card border-b border-border">
        {[
          { label: 'Total visitas', value: client?.total_visits || 0, icon: 'MapPin', color: 'text-green-600', sparkColor: '#22c55e' },
          { label: 'Gasto estimado', value: client?.estimated_spend > 0 ? `$${(client?.estimated_spend || 0)?.toLocaleString()}` : '—', icon: 'DollarSign', color: 'text-blue-600', sparkColor: '#3b82f6' },
          { label: 'Saldo de puntos', value: (client?.loyalty_points || 0)?.toLocaleString(), icon: 'Coins', color: 'text-amber-600', sparkColor: '#f59e0b' },
          { label: 'Nivel de engagement', value: `${score}/100`, icon: 'TrendingUp', color: 'text-purple-600', sparkColor: '#a855f7' },
        ]?.map(kpi => (
          <div key={kpi?.label} className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Icon name={kpi?.icon} size={16} className={kpi?.color} />
                <span className="text-xs text-muted-foreground">{kpi?.label}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{kpi?.value}</div>
            </div>
            <Sparkline color={kpi?.sparkColor} />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-card overflow-x-auto">
        <div className="flex gap-1 min-w-max px-6">
          {tabs?.map(tab => (
            <button key={tab?.id} onClick={() => setActiveTab(tab?.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab?.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}>
              <Icon name={tab?.icon} size={15} />{tab?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6 w-full">
        {activeTab === 'actividad' && <TimelineTab customerId={client?.id} ownerId={user?.id} />}
        {activeTab === 'perfil360' && (
          <div className="space-y-5">
            <Profile360Tab client={clientCompat} />
            <NPSProfileSection client={clientCompat} />
          </div>
        )}
        {activeTab === 'lealtad' && <LoyaltyTab client={client} ownerId={user?.id} />}
        {activeTab === 'cupones' && <CouponsTab customerId={client?.id} ownerId={user?.id} />}
        {activeTab === 'tags' && <TagsNotesTab client={client} ownerId={user?.id} />}
      </div>

      {showQuickActions && <QuickActionsDrawer client={clientCompat} onClose={() => setShowQuickActions(false)} />}
    </div>
  );
};

export default CustomerProfileDetail;
