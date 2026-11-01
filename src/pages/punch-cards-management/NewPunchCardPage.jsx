import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { createPunchCard, updatePunchCard, POINTS_RULES, pointsToMXN } from '../../services/rewardsService';
import StampCardBuilderModal, { defaultDesign } from './components/StampCardBuilderModal';
import Breadcrumb from '../../components/ui/Breadcrumb';

const DAYS_OF_WEEK = [
  { id: 'mon', label: 'Lun' }, { id: 'tue', label: 'Mar' }, { id: 'wed', label: 'Mié' },
  { id: 'thu', label: 'Jue' }, { id: 'fri', label: 'Vie' }, { id: 'sat', label: 'Sáb' }, { id: 'sun', label: 'Dom' },
];

const Toggle = ({ value, onChange, label, desc }) => (
  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
    <div className="flex-1 pr-4">
      <p className="font-medium text-foreground text-sm">{label}</p>
      {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 relative ${value ? 'bg-primary' : 'bg-muted'}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  </div>
);

const SectionHeader = ({ number, title, subtitle }) => (
  <div className="mb-5">
    <h3 className="font-semibold text-foreground flex items-center gap-2 text-base">
      <span className="w-7 h-7 bg-primary text-white rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0">{number}</span>
      {title}
    </h3>
    {subtitle && <p className="text-xs text-muted-foreground mt-1 ml-9">{subtitle}</p>}
  </div>
);

// ── LIVE PREVIEW ──────────────────────────────────────────────────────────────

const CARD_ICONS_MAP = {
  star: '⭐', coffee: '☕', fire: '🔥', heart: '❤️', crown: '👑', diamond: '💎',
  pizza: '🍕', taco: '🌮', burger: '🍔', sushi: '🍣', cake: '🎂', icecream: '🍦',
  scissors: '✂️', flower: '🌸', leaf: '🌿', wave: '🌊', muscle: '💪', yoga: '🧘',
  ring: '💍', bag: '👜', music: '🎵', palette: '🎨', rocket: '🚀', trophy: '🏆',
  car: '🚗', book: '📚', camera: '📷', gem: '💠', sun: '☀️', moon: '🌙',
  lightning: '⚡', snowflake: '❄️', rainbow: '🌈', butterfly: '🦋', paw: '🐾',
  anchor: '⚓', compass: '🧭', key: '🔑', lock: '🔒', bell: '🔔', gift: '🎁',
  balloon: '🎈', medal: '🥇', shield: '🛡️', target: '🎯', dice: '🎲', chess: '♟️',
  wine: '🍷', beer: '🍺', cocktail: '🍹', tea: '🍵', bread: '🥐', donut: '🍩',
  cookie: '🍪', candy: '🍬', chocolate: '🍫', fruit: '🍓', avocado: '🥑',
  noodles: '🍜', shrimp: '🦐', fish: '🐟', crab: '🦀', steak: '🥩',
  spa: '💆', nail: '💅', lipstick: '💋', dress: '👗', shoe: '👠',
  hat: '🎩', glasses: '👓', watch: '⌚', bike: '🚲', gym: '🏋️',
  soccer: '⚽', basketball: '🏀', golf: '⛳', bowling: '🎳',
  game: '🎮', puzzle: '🧩', laptop: '💻', phone: '📱', headphones: '🎧',
  plant: '🪴', tree: '🌳', sparkle: '✨', money: '💰', ticket: '🎫',
};

const STAMP_FULL_BG = {
  gold: 'radial-gradient(circle, #FFE082, #D4A853, #A0762A)',
  white: 'rgba(255,255,255,0.95)',
  'neon-red': 'radial-gradient(circle, #FF6B8A, #E94560)',
  pink: 'radial-gradient(circle, #F48FB1, #AD1457)',
  amber: 'radial-gradient(circle, #FFDE7D, #FFB627, #E09000)',
  green: 'radial-gradient(circle, #81C784, #2E7D32)',
  cyan: 'radial-gradient(circle, #80FFFF, #00F5FF, #00BCD4)',
  black: 'radial-gradient(circle, #424242, #1A1A1A)',
  teal: 'radial-gradient(circle, #B2DFDB, #4DB6AC, #00897B)',
  blue: 'radial-gradient(circle, #90CAF9, #1A3FE0, #0D2A9E)',
  purple: 'radial-gradient(circle, #CE93D8, #7B1FA2)',
  red: 'radial-gradient(circle, #EF9A9A, #C62828)',
};

const getCardBorderStylePreview = (borderStyle, customColor) => {
  if (borderStyle === 'Borde personalizado') return { border: `2px solid ${customColor || '#D4A853'}` };
  const map = {
    'Sin borde': {}, 'Borde dorado': { border: '2px solid #D4A853' },
    'Borde blanco sutil': { border: '1px solid rgba(255,255,255,0.3)' },
    'Borde neón rojo': { border: '2px solid #E94560' }, 'Borde rosa': { border: '2px solid #AD1457' },
    'Borde ámbar': { border: '2px solid #FFB627' }, 'Borde verde sage': { border: '2px solid #2E7D32' },
    'Borde cyan neón': { border: '2px solid #00F5FF' }, 'Doble borde negro': { border: '3px double #1A1A1A' },
    'Borde teal': { border: '2px solid #94D2BD' }, 'Borde azul': { border: '2px solid #1A3FE0' },
  };
  return map?.[borderStyle] || {};
};

const getCardShapeBorderRadius = (cardShape, borderRadius) => {
  if (cardShape === 'square') return 4;
  if (cardShape === 'circle-card') return 9999;
  if (cardShape === 'pill') return 40;
  return borderRadius || 14;
};

const LivePreview = ({ formData, cardDesign }) => {
  const [filledStamps, setFilledStamps] = useState(3);
  const count = parseInt(formData?.stampCount || cardDesign?.stampCount) || 8;
  const d = cardDesign || defaultDesign;

  const getBgStylePreview = (d) => {
    if (d?.templateImageUrl) return { backgroundImage: `url(${d?.templateImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    if (d?.bgType === 'gradient2') return { background: `linear-gradient(135deg, ${d?.grad2c1 || '#1B4332'}, ${d?.grad2c2 || '#2D6A4F'})` };
    if (d?.bgType === 'gradient3') return { background: `linear-gradient(135deg, ${d?.grad3c1 || '#0D0221'}, ${d?.grad3c2 || '#190535'}, ${d?.grad3c3 || '#0D0221'})` };
    return { background: d?.solidColor || '#7C3AED' };
  };

  const bgStyle = getBgStylePreview(d);
  const accentColor = d?.accentColor || '#D4A853';
  const textColor = d?.textColor || '#FFFFFF';
  const borderStyle = getCardBorderStylePreview(d?.borderStyle, d?.customBorderColor);
  const computedBorderRadius = getCardShapeBorderRadius(d?.cardShape, d?.borderRadius);
  // Use design orientation if set, otherwise default horizontal
  const isVertical = d?.orientation === 'vertical';

  // Real card aspect ratios: CR80 standard — 85.6mm × 54mm
  // Horizontal: width=340px, height=214px  |  Vertical: width=214px, height=340px
  const CARD_W_H = 340;
  const CARD_H_H = 214;
  const CARD_W_V = 214;
  const CARD_H_V = 340;

  const cardW = isVertical ? CARD_W_V : CARD_W_H;
  const cardH = isVertical ? CARD_H_V : CARD_H_H;

  const getIconDisplay = () => {
    if (d?.businessLogoUrl) return <img src={d?.businessLogoUrl} alt="logo" className="h-7 object-contain" />;
    if (d?.customIconUrl) return <img src={d?.customIconUrl} alt="icon" className="w-7 h-7 object-cover rounded" />;
    return <span style={{ fontSize: 22 }}>{CARD_ICONS_MAP?.[d?.cardIcon] || '⭐'}</span>;
  };

  const getStampBg = (i) => {
    if (i < filledStamps) {
      if (d?.stampFullStyle === 'custom') {
        const c = d?.customStampColor || '#FFD700';
        return { background: `radial-gradient(circle, ${c}dd, ${c})` };
      }
      return { background: STAMP_FULL_BG?.[d?.stampFullStyle] || 'rgba(255,255,255,0.9)' };
    }
    if (d?.stampEmptyStyle === 'border-custom') {
      return { background: 'rgba(255,255,255,0.05)', border: `2px solid ${d?.customEmptyBorderColor || accentColor}` };
    }
    return { background: 'rgba(255,255,255,0.1)', border: `2px solid ${accentColor}` };
  };

  const rewardDisplay = d?.rewardText || formData?.rewardValue || 'Premio al completar';

  // Stamp size scaled to card
  const stampSize = isVertical ? 28 : 26;
  const maxStampsVisible = isVertical ? 10 : 12;

  return (
    <div className="space-y-3">
      {/* Card with real proportions */}
      <div className="flex justify-center">
        <div
          className="shadow-2xl relative overflow-hidden flex-shrink-0"
          style={{
            ...bgStyle,
            ...borderStyle,
            borderRadius: d?.cardShape === 'circle-card' ? 9999 : computedBorderRadius,
            color: textColor,
            width: cardW,
            height: cardH,
            display: 'flex',
            flexDirection: 'column',
            padding: isVertical ? '14px 14px' : '14px 18px',
            boxSizing: 'border-box',
          }}
        >
          {d?.heroImageUrl && (
            <div className="absolute inset-x-0 top-0" style={{ height: isVertical ? 90 : 70 }}>
              <img src={d?.heroImageUrl} alt="hero" className="w-full h-full object-cover" style={{ borderTopLeftRadius: computedBorderRadius, borderTopRightRadius: computedBorderRadius }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.4))' }} />
            </div>
          )}
          {d?.badgeEnabled && d?.badgeText && (
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-widest z-10"
              style={{ background: accentColor, color: '#000', fontSize: 8 }}>
              {d?.badgeText}
            </div>
          )}

          {/* Top section */}
          <div className={`flex items-start justify-between ${d?.heroImageUrl ? (isVertical ? 'mt-24' : 'mt-16') : ''} flex-shrink-0`}>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 9, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>PromoClub</p>
              <h4 className="font-bold leading-tight truncate" style={{ color: textColor, fontSize: isVertical ? 13 : 14 }}>
                {formData?.name || 'Nombre de la tarjeta'}
              </h4>
              {formData?.description && (
                <p className="opacity-70 truncate" style={{ fontSize: 10, marginTop: 2 }}>{formData?.description}</p>
              )}
            </div>
            <div className="ml-2 flex-shrink-0">{getIconDisplay()}</div>
          </div>

          {d?.separatorEnabled && (
            <div className="my-1.5 text-center opacity-40" style={{ fontSize: 9 }}>
              {d?.separatorType === 'line' && <div style={{ borderTop: `1px solid ${accentColor}` }} />}
              {d?.separatorType === 'ornament' && '✦ ✦ ✦'}
              {d?.separatorType === 'dots' && '· · · · ·'}
              {d?.separatorType === 'wave' && '〜〜〜〜〜'}
            </div>
          )}

          {/* Stamps area — grows to fill space */}
          <div className="flex-1 flex items-center">
            <div className="flex flex-wrap gap-1 w-full">
              {Array.from({ length: Math.min(count, maxStampsVisible) })?.map((_, i) => (
                <button key={i} type="button"
                  onClick={() => setFilledStamps(i < filledStamps ? i : i + 1)}
                  className="rounded-full flex items-center justify-center transition-all"
                  style={{ width: stampSize, height: stampSize, ...getStampBg(i), flexShrink: 0 }}>
                  {i < filledStamps && (
                    d?.customIconUrl
                      ? <img src={d?.customIconUrl} alt="stamp" className="object-cover rounded-full" style={{ width: stampSize * 0.55, height: stampSize * 0.55 }} />
                      : <span style={{ fontSize: stampSize * 0.45 }}>{CARD_ICONS_MAP?.[d?.cardIcon] || '⭐'}</span>
                  )}
                </button>
              ))}
              {count > maxStampsVisible && <span className="text-xs opacity-70 self-center">+{count - maxStampsVisible}</span>}
              <div className="rounded-full border-2 flex items-center justify-center"
                style={{ width: stampSize, height: stampSize, borderColor: accentColor, background: 'rgba(255,215,0,0.15)', flexShrink: 0 }}>
                <span style={{ fontSize: stampSize * 0.45 }}>{d?.rewardEmoji || '🎁'}</span>
              </div>
            </div>
          </div>

          {/* Bottom reward bar */}
          <div className="flex-shrink-0 border-t pt-1.5" style={{ borderColor: `${accentColor}40` }}>
            <p style={{ fontSize: 9, opacity: 0.6 }}>Recompensa</p>
            <p className="font-semibold truncate" style={{ color: accentColor, fontSize: 11 }}>{d?.rewardEmoji || '🎁'} {rewardDisplay}</p>
          </div>
        </div>
      </div>

      {filledStamps >= count && (
        <div className="bg-success/10 border border-success/20 rounded-xl p-2 text-center">
          <p className="text-base mb-0.5">🎉</p>
          <p className="font-bold text-success text-xs">¡Tarjeta completada!</p>
        </div>
      )}
      <div className="flex items-center justify-center gap-3">
        <p className="text-xs text-muted-foreground">Toca los sellos · {filledStamps}/{count}</p>
        <span className="text-xs text-muted-foreground opacity-50">·</span>
        <p className="text-xs text-muted-foreground">{isVertical ? '📱 Vertical' : '💳 Horizontal'} · {cardW}×{cardH}px</p>
      </div>
    </div>
  );
};

// ── WIZARD TABS CONFIG ────────────────────────────────────────────────────────

const TABS = [
  { id: 'identity', label: 'Identidad', icon: 'User', short: '1' },
  { id: 'stamp-rule', label: 'Regla de Sello', icon: 'Stamp', short: '2' },
  { id: 'reward', label: 'Meta y Recompensa', icon: 'Gift', short: '3' },
  { id: 'validity', label: 'Vigencia', icon: 'Calendar', short: '4' },
  { id: 'builder', label: 'Constructor', icon: 'Palette', short: '5' },
  { id: 'advanced', label: 'Opciones Avanzadas', icon: 'Settings', short: '6' },
  { id: 'establishments', label: 'Establecimientos', icon: 'MapPin', short: '7' },
  { id: 'distribution', label: 'Distribución', icon: 'Share2', short: '8' },
];

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

const NewPunchCardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const editCard = location?.state?.editCard || null;
  const isEdit = !!editCard;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [establishments, setEstablishments] = useState([]);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('identity');
  const [cardDesign, setCardDesign] = useState(
    editCard?.card_design ? (typeof editCard?.card_design === 'string' ? JSON.parse(editCard?.card_design) : editCard?.card_design) : null
  );

  // Data for new reward types
  const [surprises, setSurprises] = useState([]);
  const [vipLevels, setVipLevels] = useState([]);
  const [memberships, setMemberships] = useState([]);

  const [formData, setFormData] = useState({
    name: editCard?.name || '',
    description: editCard?.description || '',
    // Stamp rules
    stampRule: editCard?.stamp_rule || 'visit',
    stampAmount: editCard?.stamp_amount || '',
    stampProduct: editCard?.stamp_product || '',
    stampCategory: editCard?.stamp_category || '',
    stampLimitPerVisit: editCard?.stamp_limit_per_visit || 1,
    cumulativeStamps: editCard?.cumulative_stamps || false,
    doubleConditionEnabled: editCard?.double_condition_enabled || false,
    doubleConditionAmount: editCard?.double_condition_amount || '',
    // Reward
    stampCount: editCard?.stamp_count || 8,
    rewardType: editCard?.reward_type || 'free_item',
    rewardValue: editCard?.reward_value || '',
    rewardDiscount: editCard?.reward_discount || '',
    rewardDiscountMax: editCard?.reward_discount_max || '',
    rewardPoints: editCard?.reward_points || '',
    rewardExpiryDays: editCard?.reward_expiry_days || 30,
    perceivedValue: editCard?.perceived_value || '',
    celebrationMessage: editCard?.celebration_message || '¡Felicidades {nombre_cliente}! Tu {recompensa} está lista. 🎉',
    rewardCombination: editCard?.reward_combination || [],
    // New reward type fields
    surpriseId: editCard?.surprise_id || '',
    rewardDiscountProducts: editCard?.reward_discount_products || '',
    rewardDiscountServices: editCard?.reward_discount_services || '',
    rewardDiscountSpecificPct: editCard?.reward_discount_specific_pct || 20,
    rewardDiscountSpecificFixed: editCard?.reward_discount_specific_fixed || '',
    rewardDiscountSpecificType: editCard?.reward_discount_specific_type || 'pct',
    vipLevelId: editCard?.vip_level_id || '',
    membershipId: editCard?.membership_id || '',
    // Validity
    validityType: editCard?.validity_type || 'none',
    validityDays: editCard?.validity_days || 90,
    validityDate: editCard?.validity_date || '',
    gracePeriodEnabled: editCard?.grace_period_enabled || false,
    gracePeriodDays: editCard?.grace_period_days || 3,
    expiryNotif14: editCard?.expiry_notif_14 !== false,
    expiryNotif7: editCard?.expiry_notif_7 !== false,
    expiryNotif1: editCard?.expiry_notif_1 !== false,
    expiryNotif14Text: editCard?.expiry_notif_14_text || 'Tu tarjeta {nombre_tarjeta} en {negocio} vence en 14 días. Llevas {sellos_actuales} de {sellos_total} sellos. ¡No la dejes ir!',
    expiryNotif7Text: editCard?.expiry_notif_7_text || 'Tu tarjeta {nombre_tarjeta} vence en 7 días. ¡Visítanos pronto!',
    expiryNotif1Text: editCard?.expiry_notif_1_text || '¡Último día! Tu tarjeta {nombre_tarjeta} vence mañana.',
    // Advanced
    autoRenew: editCard?.auto_renew !== false,
    showProgress: editCard?.show_progress !== false,
    progressChannel: editCard?.progress_channel || 'push',
    welcomeStampEnabled: editCard?.welcome_stamp_enabled || false,
    welcomeStampCount: editCard?.welcome_stamp_count || 1,
    doubleStampEnabled: editCard?.double_stamp_enabled || false,
    doubleStampDays: editCard?.double_stamp_days || [],
    doubleStampStartTime: editCard?.double_stamp_start_time || '',
    doubleStampEndTime: editCard?.double_stamp_end_time || '',
    scheduleRestrictionEnabled: editCard?.schedule_restriction_enabled || false,
    scheduleDays: editCard?.schedule_days || [],
    scheduleStartTime: editCard?.schedule_start_time || '',
    scheduleEndTime: editCard?.schedule_end_time || '',
    compatibilityEnabled: editCard?.compatibility_enabled !== false,
    audience: editCard?.audience || 'all',
    streakEnabled: editCard?.streak_enabled || false,
    streakCount: editCard?.streak_count || 3,
    streakBonusStamps: editCard?.streak_bonus_stamps || 1,
    nearCompleteEnabled: editCard?.near_complete_enabled !== false,
    nearCompleteStamps: editCard?.near_complete_stamps || 2,
    publicVisibility: editCard?.public_visibility !== false,
    // Bonus rules
    e1StreakBonusEnabled: editCard?.e1_streak_bonus_enabled || false,
    e1StreakMinVisits: editCard?.e1_streak_min_visits || 5,
    e1StreakBonusStamps: editCard?.e1_streak_bonus_stamps || 1,
    firstVisitMonthBonusEnabled: editCard?.first_visit_month_bonus_enabled || false,
    firstVisitMonthBonusStamps: editCard?.first_visit_month_bonus_stamps || 1,
    // Establishments & distribution
    distributionMode: editCard?.distribution_mode || 'auto_checkin',
    selectedEstablishments: editCard?.establishment_ids || [],
    // Distribution extra config
    vipActivationLevel: editCard?.vip_activation_level || '',
    visitMilestoneCount: editCard?.visit_milestone_count || 10,
    highTicketAmount: editCard?.high_ticket_amount || 500,
  });

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }));
  const toggleDay = (arr, day) => arr?.includes(day) ? arr?.filter(d => d !== day) : [...arr, day];
  const count = parseInt(formData?.stampCount || cardDesign?.stampCount) || 8;
  const weeksEstimate = Math.ceil(count / 2);

  const userDisplay = {
    name: user?.user_metadata?.full_name || user?.email || 'Usuario',
    email: user?.email || '',
    role: user?.user_metadata?.role || 'owner',
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        const { data: profile } = await supabase?.from('user_profiles')?.select('user_id')?.eq('id', user?.id)?.single();
        const businessId = profile?.user_id || user?.id;

        // Establishments
        const { data: estData } = await supabase?.from('business_locations')?.select('id, location_name, location_code, is_active')?.eq('business_id', businessId)?.eq('is_active', true)?.order('location_name', { ascending: true });
        setEstablishments(estData || []);

        // Surprises
        const { data: surprisesData } = await supabase?.from('surprises')?.select('id, name, description, surprise_type')?.eq('business_id', businessId)?.eq('is_active', true)?.order('name', { ascending: true });
        setSurprises(surprisesData || []);

        // VIP levels
        const { data: vipData } = await supabase?.from('vip_levels')?.select('id, name, level_order, min_points')?.eq('business_id', businessId)?.order('level_order', { ascending: true });
        setVipLevels(vipData || []);

        // Memberships
        const { data: membershipData } = await supabase?.from('membership_programs')?.select('id, name, description, price')?.eq('business_id', businessId)?.eq('status', 'active')?.order('name', { ascending: true });
        setMemberships(membershipData || []);
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };
    fetchData();
  }, [user?.id]);

  const handleBuilderSave = (design) => {
    setCardDesign(design);
    if (design?.stampCount) set('stampCount', design?.stampCount);
    setBuilderOpen(false);
  };

  const handleSave = async (status = 'active') => {
    if (!user?.id || !formData?.name?.trim()) return;
    try {
      setSaving(true);
      setError(null);
      const payload = {
        name: formData?.name,
        description: formData?.description,
        stampIcon: cardDesign?.cardIcon || 'star',
        cardColor: cardDesign?.solidColor || '#7C3AED',
        cardColorSecondary: cardDesign?.grad2c2 || '#2563EB',
        cardGradientType: cardDesign?.bgType === 'gradient2' || cardDesign?.bgType === 'gradient3' ? 'gradient' : 'solid',
        gradientDirection: '135deg',
        nameFont: cardDesign?.font || 'font-sans',
        rewardImage: '',
        cardDesign: cardDesign ? JSON.stringify(cardDesign) : null,
        stampRule: formData?.stampRule,
        stampAmount: formData?.stampAmount,
        stampProduct: formData?.stampProduct,
        stampCategory: formData?.stampCategory,
        stampLimitPerVisit: formData?.stampLimitPerVisit,
        cumulativeStamps: formData?.cumulativeStamps,
        doubleConditionEnabled: formData?.doubleConditionEnabled,
        doubleConditionAmount: formData?.doubleConditionAmount,
        stampCount: cardDesign?.stampCount || formData?.stampCount,
        rewardType: formData?.rewardType,
        rewardValue: cardDesign?.rewardText || formData?.rewardValue,
        rewardDiscount: formData?.rewardDiscount,
        rewardDiscountMax: formData?.rewardDiscountMax,
        rewardPoints: formData?.rewardPoints,
        rewardExpiryDays: formData?.rewardExpiryDays,
        perceivedValue: formData?.perceivedValue,
        celebrationMessage: formData?.celebrationMessage,
        surpriseId: formData?.surpriseId,
        rewardDiscountProducts: formData?.rewardDiscountProducts,
        rewardDiscountServices: formData?.rewardDiscountServices,
        rewardDiscountSpecificPct: formData?.rewardDiscountSpecificPct,
        rewardDiscountSpecificFixed: formData?.rewardDiscountSpecificFixed,
        rewardDiscountSpecificType: formData?.rewardDiscountSpecificType,
        vipLevelId: formData?.vipLevelId,
        membershipId: formData?.membershipId,
        validityType: formData?.validityType,
        validityDays: formData?.validityDays,
        validityDate: formData?.validityDate,
        gracePeriodEnabled: formData?.gracePeriodEnabled,
        gracePeriodDays: formData?.gracePeriodDays,
        expiryNotif14: formData?.expiryNotif14,
        expiryNotif7: formData?.expiryNotif7,
        expiryNotif1: formData?.expiryNotif1,
        expiryNotif14Text: formData?.expiryNotif14Text,
        expiryNotif7Text: formData?.expiryNotif7Text,
        expiryNotif1Text: formData?.expiryNotif1Text,
        autoRenew: formData?.autoRenew,
        showProgress: formData?.showProgress,
        progressChannel: formData?.progressChannel,
        welcomeStampEnabled: formData?.welcomeStampEnabled,
        welcomeStampCount: formData?.welcomeStampCount,
        doubleStampEnabled: formData?.doubleStampEnabled,
        doubleStampDays: formData?.doubleStampDays,
        doubleStampStartTime: formData?.doubleStampStartTime,
        doubleStampEndTime: formData?.doubleStampEndTime,
        scheduleRestrictionEnabled: formData?.scheduleRestrictionEnabled,
        scheduleDays: formData?.scheduleDays,
        scheduleStartTime: formData?.scheduleStartTime,
        scheduleEndTime: formData?.scheduleEndTime,
        compatibilityEnabled: formData?.compatibilityEnabled,
        audience: formData?.audience,
        streakEnabled: formData?.streakEnabled,
        streakCount: formData?.streakCount,
        streakBonusStamps: formData?.streakBonusStamps,
        nearCompleteEnabled: formData?.nearCompleteEnabled,
        nearCompleteStamps: formData?.nearCompleteStamps,
        publicVisibility: formData?.publicVisibility,
        e1StreakBonusEnabled: formData?.e1StreakBonusEnabled,
        e1StreakMinVisits: formData?.e1StreakMinVisits,
        e1StreakBonusStamps: formData?.e1StreakBonusStamps,
        firstVisitMonthBonusEnabled: formData?.firstVisitMonthBonusEnabled,
        firstVisitMonthBonusStamps: formData?.firstVisitMonthBonusStamps,
        distributionMode: formData?.distributionMode,
        establishmentIds: formData?.selectedEstablishments,
        status,
      };
      if (isEdit) {
        await updatePunchCard(editCard?.id, payload);
      } else {
        await createPunchCard(user?.id, payload);
      }
      navigate('/punch-cards-management');
    } catch (err) {
      console.error('Error saving tarjeta de sello:', err);
      setError(err?.message || 'Error al guardar la tarjeta de sello');
    } finally {
      setSaving(false);
    }
  };

  const mainClasses = `pt-16 transition-all duration-500 ease-in-out relative z-10 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`;

  const currentTabIndex = TABS?.findIndex(t => t?.id === activeTab);
  const canGoNext = currentTabIndex < TABS?.length - 1;
  const canGoPrev = currentTabIndex > 0;

  // ── TAB CONTENT RENDERERS ─────────────────────────────────────────────────

  const renderIdentityTab = () => (
    <div className="space-y-5">
      <SectionHeader number="1" title="Identidad" subtitle="Nombre y descripción de tu tarjeta de sello" />
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Nombre de la tarjeta de sello <span className="text-destructive">*</span>
        </label>
        <input
          type="text" maxLength={40}
          value={formData?.name}
          onChange={e => set('name', e?.target?.value)}
          placeholder="Ej: Tarjeta de Café, Club de Visitas, Tarjeta Fidelidad"
          className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">{formData?.name?.length}/40 caracteres</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Descripción corta</label>
        <input
          type="text" maxLength={100}
          value={formData?.description}
          onChange={e => set('description', e?.target?.value)}
          placeholder="Ej: Acumula sellos en cada visita y obtén tu café gratis"
          className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
        />
      </div>
    </div>
  );

  const renderStampRuleTab = () => (
    <div className="space-y-5">
      <SectionHeader number="2" title="Regla de Sello" subtitle="Define cómo el cliente gana sellos" />

      {/* Base rules */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Regla base de acumulación</p>
        <div className="space-y-3">
          {[
            { id: 'visit', label: 'Cada visita = 1 sello', desc: 'El cliente gana un sello cada vez que hace check-in, sin importar cuánto gaste. Ideal para premiar la frecuencia.', icon: '📍' },
            { id: 'amount', label: 'Compra mínima = 1 sello', desc: 'El cliente gana un sello cuando su compra alcanza un monto mínimo. Ideal para premiar el gasto.', icon: '💵' },
            { id: 'product', label: 'Producto específico = 1 sello', desc: 'El cliente gana un sello solo al comprar un producto determinado. Ideal para incentivar un producto en particular.', icon: '🏷️' },
            { id: 'category', label: 'Categoría de producto = 1 sello', desc: 'El cliente gana un sello al comprar cualquier producto de una categoría definida. Ej: "Cualquier bebida caliente" o "Cualquier postre". Útil para catálogos amplios.', icon: '📂' },
          ]?.map(opt => (
            <label
              key={opt?.id}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData?.stampRule === opt?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}
            >
              <input type="radio" name="stampRule" value={opt?.id} checked={formData?.stampRule === opt?.id} onChange={e => set('stampRule', e?.target?.value)} className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span>{opt?.icon}</span>
                  <span className="font-medium text-foreground text-sm">{opt?.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{opt?.desc}</p>
                {formData?.stampRule === opt?.id && opt?.id === 'amount' && (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">Monto mínimo:</span>
                      <input
                        type="number" min="1"
                        value={formData?.stampAmount}
                        onChange={e => set('stampAmount', e?.target?.value)}
                        placeholder="100"
                        className="w-24 px-2 py-1 border border-border rounded bg-input text-foreground text-sm focus:outline-none"
                      />
                      <span className="text-xs text-muted-foreground">MXN</span>
                    </div>
                    {/* Cumulative toggle */}
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 pr-3">
                          <p className="text-xs font-semibold text-foreground">Sellos acumulativos por monto</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Al activar: compra de ${(parseFloat(formData?.stampAmount) || 100) * 3} MXN = 3 sellos en lugar de 1. El gasto escala directamente con el progreso.
                          </p>
                        </div>
                        <button type="button" onClick={() => set('cumulativeStamps', !formData?.cumulativeStamps)}
                          className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 relative ${formData?.cumulativeStamps ? 'bg-primary' : 'bg-muted'}`}>
                          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData?.cumulativeStamps ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                      {formData?.cumulativeStamps && (
                        <div className="mt-2 p-2 bg-primary/10 rounded-lg">
                          <p className="text-xs text-primary font-medium">
                            Ejemplo: Con mínimo de ${formData?.stampAmount || 100} MXN, una compra de ${(parseFloat(formData?.stampAmount) || 100) * 3} MXN da 3 sellos automáticamente.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {formData?.stampRule === opt?.id && opt?.id === 'product' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={formData?.stampProduct}
                      onChange={e => set('stampProduct', e?.target?.value)}
                      placeholder="Ej: Café americano, Latte, Cappuccino"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                    />
                  </div>
                )}
                {formData?.stampRule === opt?.id && opt?.id === 'category' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={formData?.stampCategory}
                      onChange={e => set('stampCategory', e?.target?.value)}
                      placeholder="Ej: Bebidas calientes, Postres, Platillos del día"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Escribe el nombre de la categoría tal como aparece en tu catálogo de productos.</p>
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Double condition */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">🔗</span>
              <p className="text-sm font-semibold text-foreground">Condición doble (visita + gasto mínimo)</p>
            </div>
            <p className="text-xs text-muted-foreground">
              El cliente debe cumplir DOS condiciones para ganar el sello: hacer check-in Y gastar al menos un monto mínimo. Evita que un cliente haga check-in sin consumir nada.
            </p>
          </div>
          <button type="button" onClick={() => set('doubleConditionEnabled', !formData?.doubleConditionEnabled)}
            className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 relative mt-0.5 ${formData?.doubleConditionEnabled ? 'bg-amber-500' : 'bg-muted'}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData?.doubleConditionEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
        {formData?.doubleConditionEnabled && (
          <div className="mt-3 p-3 bg-white dark:bg-background rounded-lg border border-amber-200 dark:border-amber-800/40">
            <p className="text-xs font-medium text-foreground mb-2">Y además gasta al menos:</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">$</span>
              <input
                type="number" min="1"
                value={formData?.doubleConditionAmount}
                onChange={e => set('doubleConditionAmount', e?.target?.value)}
                className="w-28 px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
              />
              <span className="text-xs text-muted-foreground">MXN en la visita</span>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              Ejemplo: "El cliente debe hacer check-in Y gastar al menos ${formData?.doubleConditionAmount || 150} MXN para ganar un sello."
            </p>
          </div>
        )}
      </div>

      {/* Stamp limit */}
      <div className="p-3 bg-muted/30 rounded-xl">
        <label className="block text-xs font-medium text-foreground mb-1">Límite de sellos por visita</label>
        <select
          value={formData?.stampLimitPerVisit}
          onChange={e => set('stampLimitPerVisit', parseInt(e?.target?.value))}
          className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none"
        >
          <option value={1}>1 sello por visita (recomendado)</option>
          <option value={2}>2 sellos por visita</option>
          <option value={3}>3 sellos por visita</option>
          <option value={0}>Sin límite</option>
        </select>
        <p className="text-xs text-muted-foreground mt-1">Controla cuántos sellos máximos puede dar en una sola visita. Sin límite puede llenar la tarjeta en una sola compra grande.</p>
      </div>

      {/* Bonus rules */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Reglas de Bonus (sellos extra)</p>
        <p className="text-xs text-muted-foreground mb-3">Estas reglas se suman sobre la regla base — no la reemplazan.</p>
        <div className="space-y-3">

          {/* Welcome stamp */}
          <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 rounded-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">🎁</span>
                  <p className="text-sm font-semibold text-foreground">Sello de bienvenida al activar la tarjeta</p>
                </div>
                <p className="text-xs text-muted-foreground">Al activarse la tarjeta por primera vez, el cliente recibe sellos de regalo. Hace que sienta progreso inmediato desde el primer momento.</p>
              </div>
              <button type="button" onClick={() => set('welcomeStampEnabled', !formData?.welcomeStampEnabled)}
                className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 relative mt-0.5 ${formData?.welcomeStampEnabled ? 'bg-green-500' : 'bg-muted'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData?.welcomeStampEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {formData?.welcomeStampEnabled && (
              <div className="mt-3 flex items-center gap-3 p-3 bg-white dark:bg-background rounded-lg border border-green-200 dark:border-green-800/40">
                <label className="text-xs font-medium text-foreground">Sellos de bienvenida:</label>
                <input type="number" min="1" max="3" value={formData?.welcomeStampCount}
                  onChange={e => set('welcomeStampCount', parseInt(e?.target?.value))}
                  className="w-20 px-2 py-1 border border-border rounded bg-input text-foreground text-sm" />
                <span className="text-xs text-muted-foreground">(máx. 3)</span>
              </div>
            )}
          </div>

          {/* Double stamp days */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 rounded-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">✌️</span>
                  <p className="text-sm font-semibold text-foreground">Doble sello en días/horarios específicos</p>
                </div>
                <p className="text-xs text-muted-foreground">En los días/horas seleccionados, cada acción que da 1 sello da 2. Incentiva visitas en días de baja afluencia.</p>
              </div>
              <button type="button" onClick={() => set('doubleStampEnabled', !formData?.doubleStampEnabled)}
                className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 relative mt-0.5 ${formData?.doubleStampEnabled ? 'bg-blue-500' : 'bg-muted'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData?.doubleStampEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {formData?.doubleStampEnabled && (
              <div className="mt-3 p-3 bg-white dark:bg-background rounded-lg border border-blue-200 dark:border-blue-800/40 space-y-3">
                <div>
                  <p className="text-xs font-medium text-foreground mb-2">Días de doble sello</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {DAYS_OF_WEEK?.map(d => (
                      <button key={d?.id} type="button" onClick={() => set('doubleStampDays', toggleDay(formData?.doubleStampDays, d?.id))}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${formData?.doubleStampDays?.includes(d?.id) ? 'bg-blue-500 text-white border-blue-500' : 'bg-muted text-muted-foreground border-border'}`}>
                        {d?.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Horario:</span>
                  <input type="time" value={formData?.doubleStampStartTime} onChange={e => set('doubleStampStartTime', e?.target?.value)} className="px-2 py-1 border border-border rounded bg-input text-foreground text-xs" />
                  <span className="text-xs text-muted-foreground">a</span>
                  <input type="time" value={formData?.doubleStampEndTime} onChange={e => set('doubleStampEndTime', e?.target?.value)} className="px-2 py-1 border border-border rounded bg-input text-foreground text-xs" />
                </div>
              </div>
            )}
          </div>

          {/* E1 Streak bonus */}
          <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 rounded-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">🔥</span>
                  <p className="text-sm font-semibold text-foreground">Sello bonus por racha activa (E1)</p>
                  <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs rounded font-medium">Conecta con Puntos</span>
                </div>
                <p className="text-xs text-muted-foreground">Si el cliente tiene racha activa en el programa de puntos (E1), cada visita con racha activa da un sello extra. Conecta tarjetas de sello con el sistema de rachas de E1 e incentiva la consistencia en ambos sistemas.</p>
              </div>
              <button type="button" onClick={() => set('e1StreakBonusEnabled', !formData?.e1StreakBonusEnabled)}
                className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 relative mt-0.5 ${formData?.e1StreakBonusEnabled ? 'bg-purple-500' : 'bg-muted'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData?.e1StreakBonusEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {formData?.e1StreakBonusEnabled && (
              <div className="mt-3 p-3 bg-white dark:bg-background rounded-lg border border-purple-200 dark:border-purple-800/40 space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-foreground">Racha mínima requerida:</label>
                  <input type="number" min="2" max="30" value={formData?.e1StreakMinVisits}
                    onChange={e => set('e1StreakMinVisits', parseInt(e?.target?.value))}
                    className="w-20 px-2 py-1 border border-border rounded bg-input text-foreground text-sm" />
                  <span className="text-xs text-muted-foreground">visitas consecutivas</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-foreground">Sellos bonus por visita con racha:</label>
                  <input type="number" min="1" max="3" value={formData?.e1StreakBonusStamps}
                    onChange={e => set('e1StreakBonusStamps', parseInt(e?.target?.value))}
                    className="w-20 px-2 py-1 border border-border rounded bg-input text-foreground text-sm" />
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Ejemplo: "Si tu racha es de {formData?.e1StreakMinVisits}+ visitas consecutivas, cada check-in da {1 + formData?.e1StreakBonusStamps} sellos en lugar de 1."
                </p>
              </div>
            )}
          </div>

          {/* First visit of month bonus */}
          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/40 rounded-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">📅</span>
                  <p className="text-sm font-semibold text-foreground">Sello bonus por primera visita del mes</p>
                </div>
                <p className="text-xs text-muted-foreground">La primera visita de cada mes calendario da un sello extra automático. Reinicia el 1 de cada mes. Premia la recurrencia mensual sin requerir que el cliente sea tan frecuente como para acumular racha.</p>
              </div>
              <button type="button" onClick={() => set('firstVisitMonthBonusEnabled', !formData?.firstVisitMonthBonusEnabled)}
                className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 relative mt-0.5 ${formData?.firstVisitMonthBonusEnabled ? 'bg-orange-500' : 'bg-muted'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData?.firstVisitMonthBonusEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {formData?.firstVisitMonthBonusEnabled && (
              <div className="mt-3 p-3 bg-white dark:bg-background rounded-lg border border-orange-200 dark:border-orange-800/40">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-foreground">Sellos bonus en primera visita del mes:</label>
                  <input type="number" min="1" max="3" value={formData?.firstVisitMonthBonusStamps}
                    onChange={e => set('firstVisitMonthBonusStamps', parseInt(e?.target?.value))}
                    className="w-20 px-2 py-1 border border-border rounded bg-input text-foreground text-sm" />
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                  Ejemplo: "Tu primera visita de cada mes te da {1 + formData?.firstVisitMonthBonusStamps} sellos." Se reinicia automáticamente el 1 de cada mes.
                </p>
              </div>
            )}
          </div>

          {/* Streak of stamps */}
          <div className="p-4 bg-muted/30 rounded-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">⚡</span>
                  <p className="text-sm font-semibold text-foreground">Racha de sellos (streak de punch card)</p>
                </div>
                <p className="text-xs text-muted-foreground">Si el cliente sella N visitas consecutivas en esta tarjeta, recibe un sello bonus. Diferente al streak de E1: este es específico de esta tarjeta.</p>
              </div>
              <button type="button" onClick={() => set('streakEnabled', !formData?.streakEnabled)}
                className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 relative mt-0.5 ${formData?.streakEnabled ? 'bg-primary' : 'bg-muted'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData?.streakEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {formData?.streakEnabled && (
              <div className="mt-3 p-3 bg-card border border-border rounded-xl space-y-2">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-foreground">Sellos consecutivos:</label>
                  <input type="number" min="2" max="10" value={formData?.streakCount} onChange={e => set('streakCount', parseInt(e?.target?.value))}
                    className="w-20 px-2 py-1 border border-border rounded bg-input text-foreground text-sm" />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-foreground">Sellos bonus al lograr racha:</label>
                  <input type="number" min="1" max="3" value={formData?.streakBonusStamps} onChange={e => set('streakBonusStamps', parseInt(e?.target?.value))}
                    className="w-20 px-2 py-1 border border-border rounded bg-input text-foreground text-sm" />
                </div>
                <p className="text-xs text-muted-foreground">Ej: {formData?.streakCount} sellos consecutivos = {formData?.streakBonusStamps} sello bonus</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderRewardTab = () => (
    <div className="space-y-5">
      <SectionHeader number="3" title="Meta y Recompensa" subtitle="Define cuántos sellos se necesitan y qué gana el cliente" />
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Sellos necesarios para completar: <span className="text-primary font-bold text-lg">{count}</span>
        </label>
        <input type="range" min="3" max="30" value={formData?.stampCount}
          onChange={e => set('stampCount', parseInt(e?.target?.value))} className="w-full accent-primary" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>3</span><span>30</span></div>
        <div className="mt-2 p-3 bg-muted/40 rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 Con {count} sellos, la tarjeta se completaría en aproximadamente <strong>{weeksEstimate} semanas</strong> (visitando 2 veces/semana).
          </p>
          <p className="text-xs text-muted-foreground mt-1">📊 Benchmark: Cafeterías 8-10 · Salones 5-6 · Gimnasios 10-12</p>
        </div>
      </div>

      {/* Reward type selector */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">Tipo de recompensa</label>
        <div className="grid grid-cols-1 gap-2">
          {[
            { id: 'free_item', label: 'Producto gratis', icon: '🎁', desc: 'Un producto o servicio sin costo al completar la tarjeta.' },
            { id: 'surprise', label: 'Llevar una sorpresa', icon: '🎲', desc: 'El cliente recibe una sorpresa vinculada a las configuradas en tu programa.' },
            { id: 'discount_specific', label: 'Descuento en producto(s) o servicio(s) específico(s)', icon: '🏷️', desc: 'Descuento aplicable solo a productos o servicios que definas.' },
            { id: 'discount_pct', label: 'Descuento porcentaje (%)', icon: '💯', desc: 'Porcentaje de descuento sobre el total de la compra.' },
            { id: 'discount_fixed', label: 'Descuento monto fijo ($)', icon: '💵', desc: 'Monto fijo de descuento sobre la compra.' },
            { id: 'vip_upgrade', label: 'Upgrade de nivel VIP', icon: '👑', desc: 'El cliente sube automáticamente a un nivel VIP al completar la tarjeta.' },
            { id: 'free_membership', label: 'Membresía gratuita', icon: '🌟', desc: 'El cliente recibe una membresía de las que tienes generadas, sin costo.' },
            { id: 'points', label: 'Puntos bonus', icon: '⭐', desc: 'Puntos adicionales al programa de lealtad.' },
            { id: 'experience', label: 'Experiencia exclusiva', icon: '✨', desc: 'Acceso a una experiencia especial o exclusiva.' },
            { id: 'combination', label: 'Combinación (hasta 2 recompensas)', icon: '🎯', desc: 'Combina dos tipos de recompensa.' },
          ]?.map(opt => (
            <label key={opt?.id}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData?.rewardType === opt?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50'}`}>
              <input type="radio" name="rewardType" value={opt?.id} checked={formData?.rewardType === opt?.id} onChange={e => set('rewardType', e?.target?.value)} className="flex-shrink-0" />
              <span className="text-lg flex-shrink-0">{opt?.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{opt?.label}</p>
                <p className="text-xs text-muted-foreground">{opt?.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Surprise config */}
      {formData?.rewardType === 'surprise' && (
        <div className="p-4 bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800/40 rounded-xl space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">🎲</span>
            <p className="text-sm font-semibold text-foreground">Selecciona la sorpresa vinculada</p>
          </div>
          {surprises?.length > 0 ? (
            <div className="space-y-2">
              {surprises?.map(s => (
                <label key={s?.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${formData?.surpriseId === s?.id ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-border hover:border-muted-foreground/50 bg-card'}`}>
                  <input type="radio" name="surpriseId" value={s?.id} checked={formData?.surpriseId === s?.id} onChange={e => set('surpriseId', e?.target?.value)} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{s?.name}</p>
                    {s?.description && <p className="text-xs text-muted-foreground">{s?.description}</p>}
                    {s?.surprise_type && <span className="text-xs px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded">{s?.surprise_type}</span>}
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-muted/30 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">No hay sorpresas configuradas. Ve a <strong>Gestión de Sorpresas</strong> para crear una.</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Descripción para el cliente (opcional)</label>
            <input type="text" value={formData?.rewardValue} onChange={e => set('rewardValue', e?.target?.value)}
              placeholder="Ej: ¡Llévate una sorpresa especial al completar tu tarjeta!"
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none" />
          </div>
        </div>
      )}

      {/* Discount on specific products/services */}
      {formData?.rewardType === 'discount_specific' && (
        <div className="p-4 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/40 rounded-xl space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">🏷️</span>
            <p className="text-sm font-semibold text-foreground">Descuento en productos o servicios específicos</p>
          </div>
          {/* Discount amount */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Tipo de descuento</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => set('rewardDiscountSpecificType', 'pct')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${formData?.rewardDiscountSpecificType === 'pct' ? 'border-teal-500 bg-teal-500 text-white' : 'border-border text-muted-foreground hover:border-muted-foreground'}`}>
                Porcentaje (%)
              </button>
              <button type="button" onClick={() => set('rewardDiscountSpecificType', 'fixed')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${formData?.rewardDiscountSpecificType === 'fixed' ? 'border-teal-500 bg-teal-500 text-white' : 'border-border text-muted-foreground hover:border-muted-foreground'}`}>
                Monto fijo ($)
              </button>
            </div>
          </div>
          {formData?.rewardDiscountSpecificType === 'pct' ? (
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-foreground">Descuento:</label>
              <input type="range" min="5" max="100" value={formData?.rewardDiscountSpecificPct}
                onChange={e => set('rewardDiscountSpecificPct', parseInt(e?.target?.value))} className="flex-1 accent-teal-500" />
              <span className="text-sm font-bold text-teal-600 w-12">{formData?.rewardDiscountSpecificPct}%</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">$</span>
              <input type="number" min="1" value={formData?.rewardDiscountSpecificFixed}
                onChange={e => set('rewardDiscountSpecificFixed', e?.target?.value)}
                placeholder="50" className="w-28 px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none" />
              <span className="text-xs text-muted-foreground">MXN de descuento</span>
            </div>
          )}
          {/* Products */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Productos aplicables</label>
            <textarea value={formData?.rewardDiscountProducts} onChange={e => set('rewardDiscountProducts', e?.target?.value)}
              rows={2} placeholder="Ej: Café americano, Cappuccino, Latte — separa con comas"
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none resize-none" />
            <p className="text-xs text-muted-foreground mt-1">Escribe los nombres de los productos separados por comas. Deja vacío si aplica a servicios únicamente.</p>
          </div>
          {/* Services */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Servicios aplicables</label>
            <textarea value={formData?.rewardDiscountServices} onChange={e => set('rewardDiscountServices', e?.target?.value)}
              rows={2} placeholder="Ej: Corte de cabello, Manicure, Clase de yoga — separa con comas"
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none resize-none" />
            <p className="text-xs text-muted-foreground mt-1">Escribe los nombres de los servicios separados por comas. Deja vacío si aplica a productos únicamente.</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Descripción para el cliente</label>
            <input type="text" value={formData?.rewardValue} onChange={e => set('rewardValue', e?.target?.value)}
              placeholder="Ej: 20% de descuento en cualquier bebida caliente"
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none" />
          </div>
        </div>
      )}

      {/* VIP Upgrade */}
      {formData?.rewardType === 'vip_upgrade' && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800/40 rounded-xl space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">👑</span>
            <p className="text-sm font-semibold text-foreground">Selecciona el nivel VIP al que sube el cliente</p>
          </div>
          {vipLevels?.length > 0 ? (
            <div className="space-y-2">
              {vipLevels?.map(v => (
                <label key={v?.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${formData?.vipLevelId === v?.id ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'border-border hover:border-muted-foreground/50 bg-card'}`}>
                  <input type="radio" name="vipLevelId" value={v?.id} checked={formData?.vipLevelId === v?.id} onChange={e => set('vipLevelId', e?.target?.value)} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">👑 {v?.name}</p>
                    {v?.min_points != null && <p className="text-xs text-muted-foreground">Nivel {v?.level_order} · Mínimo {v?.min_points?.toLocaleString()} puntos</p>}
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-muted/30 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">No hay niveles VIP configurados. Ve a <strong>Niveles VIP</strong> para crear uno.</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Descripción para el cliente</label>
            <input type="text" value={formData?.rewardValue} onChange={e => set('rewardValue', e?.target?.value)}
              placeholder="Ej: ¡Sube al nivel Gold y disfruta beneficios exclusivos!"
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none" />
          </div>
        </div>
      )}

      {/* Free Membership */}
      {formData?.rewardType === 'free_membership' && (
        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 rounded-xl space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">🌟</span>
            <p className="text-sm font-semibold text-foreground">Selecciona la membresía gratuita</p>
          </div>
          {memberships?.length > 0 ? (
            <div className="space-y-2">
              {memberships?.map(m => (
                <label key={m?.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${formData?.membershipId === m?.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-border hover:border-muted-foreground/50 bg-card'}`}>
                  <input type="radio" name="membershipId" value={m?.id} checked={formData?.membershipId === m?.id} onChange={e => set('membershipId', e?.target?.value)} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">🌟 {m?.name}</p>
                    {m?.description && <p className="text-xs text-muted-foreground">{m?.description}</p>}
                    {m?.price != null && (
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                        Valor: ${parseFloat(m?.price)?.toLocaleString()} MXN — el cliente la recibe gratis
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-muted/30 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">No hay membresías activas configuradas. Ve a <strong>Configuración de Membresía</strong> para crear una.</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Descripción para el cliente</label>
            <input type="text" value={formData?.rewardValue} onChange={e => set('rewardValue', e?.target?.value)}
              placeholder="Ej: ¡Recibe 1 mes de membresía Premium completamente gratis!"
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none" />
          </div>
        </div>
      )}

      {formData?.rewardType === 'discount_pct' && (
        <div className="p-4 bg-muted/30 rounded-xl space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-foreground w-24">Descuento:</label>
            <input type="range" min="5" max="100" value={formData?.rewardDiscount || 20}
              onChange={e => set('rewardDiscount', e?.target?.value)} className="flex-1 accent-primary" />
            <span className="text-sm font-bold text-primary w-12">{formData?.rewardDiscount || 20}%</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-foreground">Tope máximo (opcional):</label>
            <input type="number" min="0" value={formData?.rewardDiscountMax} onChange={e => set('rewardDiscountMax', e?.target?.value)}
              placeholder="200" className="w-24 px-2 py-1 border border-border rounded bg-input text-foreground text-sm" />
            <span className="text-xs text-muted-foreground">MXN</span>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Descripción de la recompensa</label>
            <input type="text" value={formData?.rewardValue} onChange={e => set('rewardValue', e?.target?.value)}
              placeholder="Ej: 20% de descuento en tu próxima compra"
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none" />
          </div>
        </div>
      )}
      {formData?.rewardType === 'discount_fixed' && (
        <div className="space-y-3 p-4 bg-muted/30 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">$</span>
            <input type="number" min="1" value={formData?.rewardDiscount} onChange={e => set('rewardDiscount', e?.target?.value)}
              placeholder="50" className="w-28 px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none" />
            <span className="text-sm text-muted-foreground">MXN de descuento</span>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Descripción de la recompensa</label>
            <input type="text" value={formData?.rewardValue} onChange={e => set('rewardValue', e?.target?.value)}
              placeholder="Ej: $50 de descuento en tu próxima compra"
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none" />
          </div>
        </div>
      )}
      {formData?.rewardType === 'points' && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <input type="number" min="1" value={formData?.rewardPoints} onChange={e => set('rewardPoints', e?.target?.value)}
              placeholder="200" className="w-28 px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none" />
            <span className="text-xs text-muted-foreground">puntos</span>
            {formData?.rewardPoints && (
              <span className="text-xs font-semibold text-success">= ${pointsToMXN(parseInt(formData?.rewardPoints))} MXN</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">1 punto = ${POINTS_RULES?.POINT_VALUE_MXN} MXN · ${POINTS_RULES?.MXN_PER_POINT} MXN = 1 punto</p>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Descripción de la recompensa</label>
            <input type="text" value={formData?.rewardValue} onChange={e => set('rewardValue', e?.target?.value)}
              placeholder="Ej: 200 puntos bonus en tu cuenta"
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none" />
          </div>
        </div>
      )}
      {formData?.rewardType === 'free_item' && (
        <div className="p-4 bg-muted/30 rounded-xl">
          <label className="block text-xs font-medium text-foreground mb-1">Descripción de la recompensa</label>
          <input type="text" value={formData?.rewardValue} onChange={e => set('rewardValue', e?.target?.value)}
            placeholder="Ej: Café americano gratis"
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      )}
      {formData?.rewardType === 'experience' && (
        <div className="p-4 bg-muted/30 rounded-xl">
          <label className="block text-xs font-medium text-foreground mb-1">Descripción de la recompensa</label>
          <input type="text" value={formData?.rewardValue} onChange={e => set('rewardValue', e?.target?.value)}
            placeholder="Ej: Cata privada con el barista"
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      )}
      {formData?.rewardType === 'combination' && (
        <div className="p-4 bg-muted/30 rounded-xl space-y-3">
          <p className="text-xs font-medium text-foreground">Combina hasta 2 tipos de recompensa:</p>
          <div className="grid grid-cols-2 gap-2">
            {['free_item', 'discount_pct', 'discount_fixed', 'points', 'experience', 'vip_upgrade', 'free_membership', 'surprise']?.map(t => {
              const labels = { free_item: 'Producto gratis', discount_pct: 'Descuento %', discount_fixed: 'Descuento $', points: 'Puntos bonus', experience: 'Experiencia', vip_upgrade: 'Upgrade VIP', free_membership: 'Membresía gratis', surprise: 'Sorpresa' };
              const selected = formData?.rewardCombination?.includes(t);
              const maxReached = formData?.rewardCombination?.length >= 2 && !selected;
              return (
                <button key={t} type="button" disabled={maxReached}
                  onClick={() => {
                    if (selected) set('rewardCombination', formData?.rewardCombination?.filter(x => x !== t));
                    else if (!maxReached) set('rewardCombination', [...(formData?.rewardCombination || []), t]);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${selected ? 'border-primary bg-primary/10 text-primary' : maxReached ? 'border-border text-muted-foreground opacity-40 cursor-not-allowed' : 'border-border text-muted-foreground hover:border-muted-foreground'}`}>
                  {labels?.[t]}
                </button>
              );
            })}
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Descripción de la recompensa</label>
            <input type="text" value={formData?.rewardValue} onChange={e => set('rewardValue', e?.target?.value)}
              placeholder="Describe la combinación de recompensas..."
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Valor percibido (interno)</label>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">$</span>
            <input type="number" min="0" value={formData?.perceivedValue} onChange={e => set('perceivedValue', e?.target?.value)}
              placeholder="45" className="flex-1 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none" />
            <span className="text-xs text-muted-foreground">MXN</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Días para canjear recompensa</label>
          <input type="number" min="1" max="365" value={formData?.rewardExpiryDays} onChange={e => set('rewardExpiryDays', e?.target?.value)}
            className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none" />
          <p className="text-xs text-muted-foreground mt-1">⚠️ Tiempo para usar el premio <em>después de completar</em>.</p>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Mensaje de celebración</label>
        <p className="text-xs text-muted-foreground mb-2">
          Variables: <code className="bg-muted px-1 rounded">{'{nombre_cliente}'}</code> <code className="bg-muted px-1 rounded">{'{nombre_tarjeta}'}</code> <code className="bg-muted px-1 rounded">{'{recompensa}'}</code>
        </p>
        <textarea value={formData?.celebrationMessage} onChange={e => set('celebrationMessage', e?.target?.value)} rows={2}
          placeholder="¡Felicidades {nombre_cliente}! Tu {recompensa} está lista. 🎉"
          className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
      </div>
    </div>
  );

  const renderValidityTab = () => (
    <div className="space-y-5">
      <SectionHeader number="4" title="Vigencia de la Tarjeta" subtitle="Define cuánto tiempo tiene el cliente para completar la tarjeta" />
      <div className="space-y-3">
        {[
          { id: 'none', label: 'Sin vigencia', desc: 'La tarjeta nunca expira. Recomendado para negocios con baja frecuencia de visita.', icon: '∞', border: 'border-success/40' },
          { id: 'from_activation', label: 'Vigencia desde primer sello', desc: 'La tarjeta expira X días después del primer sello.', icon: '⏱', border: 'border-warning/40' },
          { id: 'fixed_date', label: 'Vigencia por calendario', desc: 'Todas las tarjetas vencen en una fecha específica. Ideal para campañas estacionales.', icon: '📅', border: 'border-cyan-500/40' },
        ]?.map(opt => (
          <label key={opt?.id}
            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData?.validityType === opt?.id ? `${opt?.border} bg-muted/30` : 'border-border hover:border-muted-foreground'}`}>
            <input type="radio" name="validityType" value={opt?.id} checked={formData?.validityType === opt?.id} onChange={e => set('validityType', e?.target?.value)} className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{opt?.icon}</span>
                <span className="font-medium text-foreground text-sm">{opt?.label}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{opt?.desc}</p>
              {formData?.validityType === opt?.id && opt?.id === 'from_activation' && (
                <div className="mt-2 flex items-center gap-2">
                  <input type="range" min="15" max="365" value={formData?.validityDays}
                    onChange={e => set('validityDays', parseInt(e?.target?.value))} className="flex-1 accent-primary" />
                  <span className="text-sm font-bold text-primary w-20">{formData?.validityDays} días</span>
                </div>
              )}
              {formData?.validityType === opt?.id && opt?.id === 'fixed_date' && (
                <input type="date" value={formData?.validityDate} onChange={e => set('validityDate', e?.target?.value)}
                  className="mt-2 px-3 py-1.5 border border-border rounded-lg bg-input text-foreground text-sm" />
              )}
            </div>
          </label>
        ))}
      </div>
      {formData?.validityType !== 'none' && (
        <>
          <div className="p-4 bg-muted/30 rounded-xl space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">Notificaciones de Vencimiento</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Variables: <code className="bg-muted px-1 rounded text-xs">{'{nombre_cliente}'}</code> <code className="bg-muted px-1 rounded text-xs">{'{nombre_tarjeta}'}</code> <code className="bg-muted px-1 rounded text-xs">{'{sellos_actuales}'}</code> <code className="bg-muted px-1 rounded text-xs">{'{sellos_total}'}</code> <code className="bg-muted px-1 rounded text-xs">{'{dias_restantes}'}</code> <code className="bg-muted px-1 rounded text-xs">{'{negocio}'}</code>
              </p>
              {[
                { key: 'expiryNotif14', textKey: 'expiryNotif14Text', label: '14 días antes', icon: '📅' },
                { key: 'expiryNotif7', textKey: 'expiryNotif7Text', label: '7 días antes', icon: '⏰' },
                { key: 'expiryNotif1', textKey: 'expiryNotif1Text', label: '1 día antes', icon: '🚨' },
              ]?.map(n => (
                <div key={n?.key} className="space-y-2 mb-3">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => set(n?.key, !formData?.[n?.key])}
                      className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${formData?.[n?.key] ? 'bg-primary' : 'bg-muted'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData?.[n?.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                    <span className="text-sm font-medium text-foreground">{n?.icon} {n?.label}</span>
                  </div>
                  {formData?.[n?.key] && (
                    <textarea value={formData?.[n?.textKey]} onChange={e => set(n?.textKey, e?.target?.value)} rows={2}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                  )}
                </div>
              ))}
            </div>
          </div>
          <Toggle value={formData?.gracePeriodEnabled} onChange={v => set('gracePeriodEnabled', v)}
            label="Período de gracia post-vencimiento"
            desc="Si el cliente visita después de vencer, la tarjeta se reactiva durante el período de gracia" />
          {formData?.gracePeriodEnabled && (
            <div className="ml-4 p-3 bg-card border border-border rounded-xl flex items-center gap-3">
              <label className="text-xs font-medium text-foreground">Período de gracia:</label>
              <input type="number" min="1" max="30" value={formData?.gracePeriodDays}
                onChange={e => set('gracePeriodDays', parseInt(e?.target?.value))}
                className="w-20 px-2 py-1 border border-border rounded bg-input text-foreground text-sm" />
              <span className="text-xs text-muted-foreground">días</span>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderBuilderTab = () => (
    <div className="space-y-5">
      <SectionHeader number="5" title="Constructor de Tarjeta" subtitle="Diseña visualmente tu tarjeta de sellos con plantillas, colores, sellos, layout y más" />
      <button type="button" onClick={() => setBuilderOpen(true)}
        className="w-full flex items-center justify-between p-5 rounded-xl border-2 border-dashed transition-all hover:border-primary hover:bg-primary/5 group"
        style={{ borderColor: cardDesign ? 'var(--primary)' : undefined }}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${cardDesign ? 'bg-primary/10' : 'bg-muted group-hover:bg-primary/10'}`}>
            <Icon name="Palette" size={22} className={cardDesign ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'} />
          </div>
          <div className="text-left">
            <p className={`text-sm font-semibold transition-colors ${cardDesign ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>
              {cardDesign ? '✅ Diseño configurado — Editar tarjeta de sello' : 'Construye la tarjeta de sello'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {cardDesign
                ? `Plantilla · Identidad · Color · Sellos · Layout · Fuente · Extras`
                : 'Diseña visualmente con plantillas, colores, sellos, layout y más'}
            </p>
          </div>
        </div>
        <Icon name="ChevronRight" size={18} className={`transition-colors ${cardDesign ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
      </button>
      {!cardDesign && (
        <p className="text-xs text-muted-foreground text-center">Opcional — puedes publicar sin diseño personalizado</p>
      )}
      {cardDesign && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <p className="text-sm font-semibold text-primary mb-2">✅ Diseño configurado</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <span>Fuente: {cardDesign?.font || 'Default'}</span>
            <span>Layout: {cardDesign?.layout || 'Grid'}</span>
            {cardDesign?.orientation && <span>Orientación: {cardDesign?.orientation === 'vertical' ? 'Vertical' : 'Horizontal'}</span>}
            {cardDesign?.cardShape && <span>Forma: {cardDesign?.cardShape}</span>}
            {cardDesign?.bgType && <span>Fondo: {cardDesign?.bgType === 'solid' ? 'Color sólido' : cardDesign?.bgType === 'gradient2' ? 'Gradiente 2pts' : 'Gradiente 3pts'}</span>}
          </div>
        </div>
      )}
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-3">
      <SectionHeader number="6" title="Opciones Avanzadas" subtitle="Configuraciones adicionales de comportamiento" />
      <Toggle value={formData?.autoRenew} onChange={v => set('autoRenew', v)} label="Auto-renovación al completar" desc="Al canjear la recompensa, se activa una nueva tarjeta idéntica automáticamente" />
      <Toggle value={formData?.showProgress} onChange={v => set('showProgress', v)} label="Mostrar progreso al hacer check-in" desc="Al hacer check-in, se muestra el avance del sello al cajero y al usuario" />
      {formData?.showProgress && (
        <div className="ml-4 p-3 bg-card border border-border rounded-xl">
          <label className="block text-xs font-medium text-foreground mb-2">Canal de notificación del progreso</label>
          <div className="space-y-1.5">
            {[
              { id: 'push', label: 'Push notification con el avance' },
              { id: 'app_only', label: 'Solo en la app (sin push)' },
              { id: 'screen_animation', label: 'Animación en pantalla del cajero' },
            ]?.map(ch => (
              <label key={ch?.id} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="progressChannel" value={ch?.id} checked={formData?.progressChannel === ch?.id} onChange={e => set('progressChannel', e?.target?.value)} />
                <span className="text-xs text-foreground">{ch?.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      <Toggle value={formData?.scheduleRestrictionEnabled} onChange={v => set('scheduleRestrictionEnabled', v)} label="Restricción de horario" desc="La tarjeta solo acumula sellos en ciertos días/horarios" />
      {formData?.scheduleRestrictionEnabled && (
        <div className="ml-4 p-3 bg-card border border-border rounded-xl space-y-3">
          <div>
            <p className="text-xs font-medium text-foreground mb-2">Días activos</p>
            <div className="flex gap-1.5 flex-wrap">
              {DAYS_OF_WEEK?.map(d => (
                <button key={d?.id} type="button" onClick={() => set('scheduleDays', toggleDay(formData?.scheduleDays, d?.id))}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${formData?.scheduleDays?.includes(d?.id) ? 'bg-primary text-white border-primary' : 'bg-muted text-muted-foreground border-border'}`}>
                  {d?.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Horario:</span>
            <input type="time" value={formData?.scheduleStartTime} onChange={e => set('scheduleStartTime', e?.target?.value)} className="px-2 py-1 border border-border rounded bg-input text-foreground text-xs" />
            <span className="text-xs text-muted-foreground">a</span>
            <input type="time" value={formData?.scheduleEndTime} onChange={e => set('scheduleEndTime', e?.target?.value)} className="px-2 py-1 border border-border rounded bg-input text-foreground text-xs" />
          </div>
        </div>
      )}
      <Toggle value={formData?.compatibilityEnabled} onChange={v => set('compatibilityEnabled', v)} label="Compatible con otras tarjetas activas" desc="Un check-in puede avanzar esta tarjeta Y otras tarjetas activas simultáneamente" />
      <Toggle value={formData?.nearCompleteEnabled} onChange={v => set('nearCompleteEnabled', v)} label='Notificación "cerca de completar"' desc="Notifica al cliente cuando le falten pocos sellos para completar" />
      {formData?.nearCompleteEnabled && (
        <div className="ml-4 p-3 bg-card border border-border rounded-xl flex items-center gap-3">
          <label className="text-xs font-medium text-foreground">Notificar cuando falten:</label>
          <input type="number" min="1" max="5" value={formData?.nearCompleteStamps} onChange={e => set('nearCompleteStamps', parseInt(e?.target?.value))}
            className="w-20 px-2 py-1 border border-border rounded bg-input text-foreground text-sm" />
          <span className="text-xs text-muted-foreground">sellos</span>
        </div>
      )}
      <Toggle value={formData?.publicVisibility} onChange={v => set('publicVisibility', v)} label="Publicar en ficha pública" desc="Si activo, los usuarios que ven la ficha del negocio en la app pueden ver esta tarjeta de sello y unirse. Si desactivado, solo para clientes que ya visitaron." />
      <div className="p-4 bg-muted/30 rounded-xl">
        <label className="block text-sm font-medium text-foreground mb-2">Audiencia</label>
        <select value={formData?.audience} onChange={e => set('audience', e?.target?.value)}
          className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none">
          <option value="all">Todos los clientes</option>
          <option value="new">Solo nuevos clientes (primera visita)</option>
          <option value="vip">Solo nivel VIP</option>
          <option value="segment">Solo segmento CRM específico</option>
        </select>
      </div>
    </div>
  );

  const renderEstablishmentsTab = () => (
    <div className="space-y-5">
      <SectionHeader number="7" title="Establecimientos" subtitle="Selecciona en qué establecimientos se visualizará y aplicará esta tarjeta de sello" />
      {establishments?.length === 0 ? (
        <div className="p-4 bg-muted/30 rounded-xl text-center">
          <p className="text-sm text-muted-foreground">No hay establecimientos registrados. La tarjeta de sello aplicará globalmente.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all border-border hover:border-muted-foreground">
            <input type="checkbox" checked={formData?.selectedEstablishments?.length === 0} onChange={() => set('selectedEstablishments', [])} className="w-4 h-4 rounded" />
            <div>
              <p className="text-sm font-medium text-foreground">Todos los establecimientos</p>
              <p className="text-xs text-muted-foreground">La tarjeta de sello aplica en todos los establecimientos activos</p>
            </div>
          </label>
          {establishments?.map(est => {
            const isSelected = formData?.selectedEstablishments?.includes(est?.id);
            return (
              <label key={est?.id}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}>
                <input type="checkbox" checked={isSelected}
                  onChange={() => {
                    if (isSelected) set('selectedEstablishments', formData?.selectedEstablishments?.filter(id => id !== est?.id));
                    else set('selectedEstablishments', [...(formData?.selectedEstablishments || []), est?.id]);
                  }} className="w-4 h-4 rounded" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{est?.location_name}</p>
                  {est?.location_code && <p className="text-xs text-muted-foreground">Código: {est?.location_code}</p>}
                </div>
                {isSelected && <Icon name="Check" size={14} className="text-primary" />}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderDistributionTab = () => (
    <div className="space-y-5">
      <SectionHeader number="8" title="Distribución y Canal" subtitle="Define cómo llega la tarjeta de sello al cliente" />
      <div className="space-y-3">
        {[
          { id: 'auto_checkin', label: 'Automática al primer check-in', desc: 'La tarjeta de sello se activa automáticamente cuando el cliente hace su primer check-in en el negocio. (Recomendado)', icon: '⚡' },
          { id: 'manual_cashier', label: 'Solo si el cajero la activa manualmente', desc: 'El cajero debe activar la tarjeta de sello para cada cliente de forma manual desde el punto de venta.', icon: '🧑‍💼' },
          { id: 'crm_invitation', label: 'Por invitación desde el CRM', desc: 'Se envía a un segmento específico de clientes desde el CRM. Ideal para campañas dirigidas.', icon: '📧' },
          { id: 'qr_scan', label: 'Al escanear un QR específico del negocio', desc: 'El cliente escanea un QR físico en el negocio para activar la tarjeta de sello.', icon: '📱' },
          {
            id: 'profile_complete',
            label: 'Al completar el perfil en la app',
            desc: 'La punch card se activa automáticamente cuando el usuario completa el 100% de su perfil en la app B2C (nombre, foto, fecha de nacimiento, preferencias, permisos de notificación). Incentiva la calidad de datos del CRM y funciona como recompensa por completar el onboarding.',
            icon: '👤',
            badge: 'Onboarding',
          },
          {
            id: 'referral',
            label: 'Al referir a un amigo registrado',
            desc: 'La punch card se activa para el cliente que refiere cuando el amigo completa su registro. Es una punch card especial para el referidor como agradecimiento por traer a alguien nuevo. Puede tener reglas especiales (menos sellos necesarios, recompensa mayor) que reconocen el valor de la adquisición.',
            icon: '🤝',
            badge: 'Referidos',
          },
          {
            id: 'vip_level',
            label: 'Al alcanzar un nivel VIP específico',
            desc: 'La punch card se desbloquea automáticamente cuando el cliente sube a Bronce, Plata u Oro. Es una punch card exclusiva disponible solo para ese nivel. Ejemplo: "Punch card VIP Oro — 5 visitas = experiencia exclusiva". Al bajar de nivel, la punch card se pausa (los sellos se conservan pero no acumula más).',
            icon: '👑',
            badge: 'VIP',
          },
          {
            id: 'visit_milestone',
            label: 'Al cumplir un hito de visitas en el negocio',
            desc: 'La punch card se activa automáticamente cuando el cliente alcanza su visita número X en el negocio. Ejemplo: "Al llegar a tu visita número 10, se activa tu Tarjeta Premium." Es una punch card de segundo nivel: el cliente primero demuestra lealtad básica y luego desbloquea la tarjeta de mayor valor.',
            icon: '🏆',
            badge: 'Hito',
          },
          {
            id: 'high_ticket_purchase',
            label: 'Al realizar su primera compra por encima de un monto',
            desc: 'La punch card se activa cuando el cliente hace una compra que supera un umbral definido por el negocio. Ejemplo: "Gasta más de $500 en una visita y activa tu Tarjeta Gourmet." Identifica a clientes de alto ticket y los mete en un programa diferenciado.',
            icon: '💰',
            badge: 'Alto Ticket',
          },
        ]?.map(opt => (
          <label key={opt?.id}
            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData?.distributionMode === opt?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}>
            <input type="radio" name="distributionMode" value={opt?.id} checked={formData?.distributionMode === opt?.id} onChange={e => set('distributionMode', e?.target?.value)} className="mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span>{opt?.icon}</span>
                <span className="font-medium text-foreground text-sm">{opt?.label}</span>
                {opt?.badge && (
                  <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary">{opt?.badge}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{opt?.desc}</p>
              {/* Extra config for vip_level */}
              {opt?.id === 'vip_level' && formData?.distributionMode === 'vip_level' && (
                <div className="mt-3 p-3 bg-muted/40 rounded-lg">
                  <label className="block text-xs font-medium text-foreground mb-1">Nivel VIP requerido para activar</label>
                  <select
                    value={formData?.vipActivationLevel || ''}
                    onChange={e => set('vipActivationLevel', e?.target?.value)}
                    className="w-full px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    onClick={e => e?.stopPropagation()}
                  >
                    <option value="">Selecciona un nivel VIP</option>
                    <option value="bronze">🥉 Bronce</option>
                    <option value="silver">🥈 Plata</option>
                    <option value="gold">🥇 Oro</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">Al bajar de nivel, la punch card se pausa (los sellos se conservan).</p>
                </div>
              )}
              {/* Extra config for visit_milestone */}
              {opt?.id === 'visit_milestone' && formData?.distributionMode === 'visit_milestone' && (
                <div className="mt-3 p-3 bg-muted/40 rounded-lg">
                  <label className="block text-xs font-medium text-foreground mb-1">Número de visita que activa la tarjeta</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number" min={1} max={500}
                      value={formData?.visitMilestoneCount || 10}
                      onChange={e => set('visitMilestoneCount', parseInt(e?.target?.value) || 10)}
                      className="w-24 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                      onClick={e => e?.stopPropagation()}
                    />
                    <span className="text-xs text-muted-foreground">visita(s) acumuladas en el negocio</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Ejemplo: "Al llegar a tu visita número {formData?.visitMilestoneCount || 10}, se activa tu tarjeta."</p>
                </div>
              )}
              {/* Extra config for high_ticket_purchase */}
              {opt?.id === 'high_ticket_purchase' && formData?.distributionMode === 'high_ticket_purchase' && (
                <div className="mt-3 p-3 bg-muted/40 rounded-lg">
                  <label className="block text-xs font-medium text-foreground mb-1">Monto mínimo de compra para activar</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium">$</span>
                    <input
                      type="number" min={1}
                      value={formData?.highTicketAmount || 500}
                      onChange={e => set('highTicketAmount', parseFloat(e?.target?.value) || 500)}
                      className="w-32 px-2 py-1.5 border border-border rounded-lg bg-input text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                      onClick={e => e?.stopPropagation()}
                    />
                    <span className="text-xs text-muted-foreground">MXN en una sola visita</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Ejemplo: "Gasta más de ${formData?.highTicketAmount || 500} en una visita y activa tu tarjeta."</p>
                </div>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'identity': return renderIdentityTab();
      case 'stamp-rule': return renderStampRuleTab();
      case 'reward': return renderRewardTab();
      case 'validity': return renderValidityTab();
      case 'builder': return renderBuilderTab();
      case 'advanced': return renderAdvancedTab();
      case 'establishments': return renderEstablishmentsTab();
      case 'distribution': return renderDistributionTab();
      default: return renderIdentityTab();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} user={userDisplay} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={userDisplay} onCollapse={setIsSidebarCollapsed} />
      <main className={mainClasses}>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <Breadcrumb items={[
            { label: 'Tarjetas de Sellos', href: '/punch-cards-management' },
            { label: isEdit ? 'Editar Tarjeta de Sello' : 'Nueva Tarjeta de Sello' }
          ]} />

          {/* Page Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{isEdit ? 'Editar Tarjeta de Sello' : 'Nueva Tarjeta de Sello'}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Configura tu tarjeta de sellos digital</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/punch-cards-management')} disabled={saving}>
              Cancelar
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
              <Icon name="AlertCircle" size={16} className="text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* ── TOP ROW: LIVE PREVIEW + PROGRESS ── */}
          <div className="flex gap-5 mb-5 items-start">
            {/* Live Preview */}
            <div className="flex-1 bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Vista Previa en Vivo</h3>
                {cardDesign && (
                  <span className="ml-auto text-xs text-primary font-medium">✅ Diseño configurado</span>
                )}
              </div>
              <div className="flex justify-center">
                <LivePreview formData={formData} cardDesign={cardDesign} />
              </div>
              {cardDesign && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {cardDesign?.font} · {cardDesign?.layout}
                  {cardDesign?.orientation && ` · ${cardDesign?.orientation === 'vertical' ? 'Vertical' : 'Horizontal'}`}
                </p>
              )}
            </div>

            {/* Progress panel beside preview */}
            <div className="w-56 flex-shrink-0 hidden lg:block">
              <div className="bg-card border border-border rounded-2xl p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Progreso del formulario</p>
                <div className="space-y-1">
                  {TABS?.map((tab, idx) => {
                    const isActive = activeTab === tab?.id;
                    const isPast = currentTabIndex > idx;
                    return (
                      <button key={tab?.id} type="button" onClick={() => setActiveTab(tab?.id)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all text-left ${isActive ? 'bg-primary/10 text-primary font-medium' : isPast ? 'text-success' : 'text-muted-foreground hover:text-foreground'}`}>
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${isActive ? 'bg-primary text-white' : isPast ? 'bg-success/20 text-success' : 'bg-muted'}`}>
                          {isPast ? '✓' : idx + 1}
                        </span>
                        {tab?.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            {/* ── LEFT: WIZARD FORM ── */}
            <div className="flex-1 min-w-0">
              {/* ── WIZARD PROGRESS BAR (business-listing style) ── */}
              <div className="bg-card border border-border rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">Progreso del wizard</span>
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                      {TABS?.[currentTabIndex]?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground hidden sm:block">Paso {currentTabIndex + 1} de {TABS?.length}</span>
                    <span className="text-sm font-bold text-primary">{Math.round(((currentTabIndex + 1) / TABS?.length) * 100)}%</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-4">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(((currentTabIndex + 1) / TABS?.length) * 100)}%` }}
                  />
                </div>
                {/* Step indicators with icons, connectors and labels */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {TABS?.map((tab, idx) => {
                    const isActive = activeTab === tab?.id;
                    const isPast = idx < currentTabIndex;
                    const isAccessible = idx <= currentTabIndex || isPast;
                    return (
                      <React.Fragment key={tab?.id}>
                        <button
                          onClick={() => setActiveTab(tab?.id)}
                          title={tab?.label}
                          className={`flex flex-col items-center gap-1 min-w-[56px] p-2 rounded-xl transition-all relative ${
                            isActive
                              ? 'bg-primary/10 text-primary'
                              : isPast
                              ? 'text-green-600 hover:bg-green-50 cursor-pointer' :'text-muted-foreground hover:bg-muted cursor-pointer'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                            isActive
                              ? 'bg-primary text-white shadow-sm'
                              : isPast
                              ? 'bg-green-500 text-white' :'bg-muted'
                          }`}>
                            {isPast ? (
                              <Icon name="Check" size={14} className="text-white" />
                            ) : (
                              <Icon name={tab?.icon} size={14} className={isActive ? 'text-white' : 'text-muted-foreground'} />
                            )}
                          </div>
                          <span className="text-xs font-medium text-center leading-tight whitespace-nowrap">{tab?.label?.split(' ')?.[0]}</span>
                        </button>
                        {idx < TABS?.length - 1 && (
                          <div className={`flex-1 h-0.5 min-w-[6px] rounded-full transition-colors ${
                            isPast ? 'bg-green-400' : 'bg-border'
                          }`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Tab content */}
              <div className="bg-card border border-border rounded-2xl p-6">
                {renderTabContent()}

                {/* Navigation buttons */}
                <div className="flex items-center justify-between mt-8 pt-5 border-t border-border">
                  <button type="button" onClick={() => canGoPrev && setActiveTab(TABS?.[currentTabIndex - 1]?.id)}
                    disabled={!canGoPrev}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${canGoPrev ? 'text-foreground hover:bg-muted' : 'text-muted-foreground cursor-not-allowed opacity-40'}`}>
                    <Icon name="ChevronLeft" size={16} />
                    Anterior
                  </button>

                  {/* Horizontal progress indicator */}
                  <div className="flex items-center gap-1">
                    {TABS?.map((tab, idx) => {
                      const isActive = activeTab === tab?.id;
                      const isPast = currentTabIndex > idx;
                      return (
                        <button key={tab?.id} type="button" onClick={() => setActiveTab(tab?.id)}
                          title={tab?.label}
                          className={`rounded-full transition-all ${isActive ? 'w-6 h-2 bg-primary' : isPast ? 'w-2 h-2 bg-success' : 'w-2 h-2 bg-muted hover:bg-muted-foreground'}`} />
                      );
                    })}
                  </div>

                  {canGoNext ? (
                    <button type="button" onClick={() => setActiveTab(TABS?.[currentTabIndex + 1]?.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-all">
                      Siguiente
                      <Icon name="ChevronRight" size={16} />
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => handleSave('draft')} disabled={saving || !formData?.name?.trim()}>
                        <Icon name="Save" size={14} className="mr-1.5" />
                        Borrador
                      </Button>
                      <Button onClick={() => handleSave('active')} disabled={saving || !formData?.name?.trim()}>
                        {saving ? (
                          <><Icon name="Loader2" size={14} className="mr-1.5 animate-spin" />Guardando...</>
                        ) : (
                          <><Icon name="Zap" size={14} className="mr-1.5" />{isEdit ? 'Guardar cambios' : 'Publicar'}</>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Global footer actions */}
              <div className="flex items-center justify-between py-4">
                <Button variant="outline" onClick={() => navigate('/punch-cards-management')} disabled={saving}>
                  Cancelar
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => handleSave('draft')} disabled={saving || !formData?.name?.trim()}>
                    <Icon name="Save" size={15} className="mr-2" />
                    Guardar borrador
                  </Button>
                  <Button onClick={() => handleSave('active')} disabled={saving || !formData?.name?.trim()}>
                    {saving ? (
                      <><Icon name="Loader2" size={15} className="mr-2 animate-spin" />Guardando...</>
                    ) : (
                      <><Icon name="Zap" size={15} className="mr-2" />{isEdit ? 'Guardar cambios' : 'Publicar tarjeta de sello'}</>
                    )}
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      {/* Builder Modal */}
      <StampCardBuilderModal
        isOpen={builderOpen}
        onClose={() => setBuilderOpen(false)}
        onSave={handleBuilderSave}
        initialName={formData?.name}
        initialDescription={formData?.description}
        initialDesign={cardDesign}
        externalRewardValue={formData?.rewardValue}
      />
    </div>
  );
};

export default NewPunchCardPage;
