// ============================================================
// MARKETING CALENDAR DATA & CONSTANTS
// ============================================================

export const ITEM_COLORS = {
  flash_deal:   { bg: 'bg-red-500',    text: 'text-red-700',    light: 'bg-red-100',    border: 'border-red-400',    hex: '#ef4444', label: 'Flash Deal' },
  happy_hour:   { bg: 'bg-amber-500',  text: 'text-amber-700',  light: 'bg-amber-100',  border: 'border-amber-400',  hex: '#f59e0b', label: 'Happy Hour' },
  drop:         { bg: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-100', border: 'border-purple-400', hex: '#8b5cf6', label: 'Drop Limitado' },
  promo:        { bg: 'bg-sky-400',    text: 'text-sky-700',    light: 'bg-sky-100',    border: 'border-sky-400',    hex: '#38bdf8', label: 'Promo Estándar' },
  campaign:     { bg: 'bg-blue-700',   text: 'text-blue-800',   light: 'bg-blue-100',   border: 'border-blue-600',   hex: '#1d4ed8', label: 'Campaña' },
  coupon:       { bg: 'bg-green-500',  text: 'text-green-700',  light: 'bg-green-100',  border: 'border-green-400',  hex: '#22c55e', label: 'Cupón' },
  flow:         { bg: 'bg-gray-400',   text: 'text-gray-600',   light: 'bg-gray-100',   border: 'border-gray-400',   hex: '#9ca3af', label: 'Flow Activo' },
  key_date:     { bg: 'bg-yellow-400', text: 'text-yellow-700', light: 'bg-yellow-50',  border: 'border-yellow-400', hex: '#facc15', label: 'Fecha Clave' },
  // New types
  punch_card:   { bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-100', border: 'border-orange-400', hex: '#f97316', label: 'Punch Card' },
  push:         { bg: 'bg-indigo-500', text: 'text-indigo-700', light: 'bg-indigo-100', border: 'border-indigo-400', hex: '#6366f1', label: 'Push' },
  email:        { bg: 'bg-teal-500',   text: 'text-teal-700',   light: 'bg-teal-100',   border: 'border-teal-400',   hex: '#14b8a6', label: 'Email' },
  whatsapp:     { bg: 'bg-green-500',  text: 'text-green-700',  light: 'bg-green-100',  border: 'border-green-400',  hex: '#25D366', label: 'WhatsApp' },
  social_post:  { bg: 'bg-pink-500',   text: 'text-pink-700',   light: 'bg-pink-100',   border: 'border-pink-400',   hex: '#ec4899', label: 'Post/Story' },
  streak_risk:  { bg: 'bg-amber-600',  text: 'text-amber-800',  light: 'bg-amber-50',   border: 'border-amber-500',  hex: '#d97706', label: 'Racha en Riesgo' },
};

export const CATEGORY_LABELS = {
  promotion: 'Promociones',
  campaign: 'Campañas',
  coupon: 'Cupones',
  flow: 'Flows',
  punch_card: 'Punch Cards',
  push: 'Push',
  email: 'Email',
  whatsapp: 'WhatsApp',
  social_post: 'Posts/Stories',
  streak_risk: 'Rachas',
};

// Mexican key dates pre-loaded
export const getMexicanKeyDates = (year) => [
  { id: 'kd-1',  name: 'Reyes Magos',              emoji: '👑', category: 'comercial',  startDate: `${year}-01-06`, endDate: `${year}-01-06`, color: 'gold', isGlobal: true },
  { id: 'kd-2',  name: 'Día del Amor y la Amistad', emoji: '💕', category: 'comercial',  startDate: `${year}-02-14`, endDate: `${year}-02-14`, color: 'gold', isGlobal: true },
  { id: 'kd-3',  name: 'Día del Niño',              emoji: '🧒', category: 'familiar',   startDate: `${year}-04-30`, endDate: `${year}-04-30`, color: 'gold', isGlobal: true },
  { id: 'kd-4',  name: 'Día de las Madres',         emoji: '💐', category: 'familiar',   startDate: `${year}-05-10`, endDate: `${year}-05-10`, color: 'gold', isGlobal: true },
  { id: 'kd-5',  name: 'Hot Sale',                  emoji: '🔥', category: 'comercial',  startDate: `${year}-05-26`, endDate: `${year}-05-31`, color: 'gold', isGlobal: true },
  { id: 'kd-6',  name: 'Día del Padre',             emoji: '👨', category: 'familiar',   startDate: `${year}-06-15`, endDate: `${year}-06-15`, color: 'gold', isGlobal: true },
  { id: 'kd-7',  name: 'Temporada Verano',          emoji: '☀️', category: 'estacional', startDate: `${year}-07-01`, endDate: `${year}-08-31`, color: 'gold', isGlobal: true },
  { id: 'kd-8',  name: 'Regreso a Clases',          emoji: '📚', category: 'estacional', startDate: `${year}-08-01`, endDate: `${year}-08-20`, color: 'gold', isGlobal: true },
  { id: 'kd-9',  name: 'Independencia',             emoji: '🇲🇽', category: 'cultural',  startDate: `${year}-09-15`, endDate: `${year}-09-16`, color: 'gold', isGlobal: true },
  { id: 'kd-10', name: 'Día de Muertos',            emoji: '💀', category: 'cultural',   startDate: `${year}-11-01`, endDate: `${year}-11-02`, color: 'gold', isGlobal: true },
  { id: 'kd-11', name: 'Buen Fin',                  emoji: '🛍️', category: 'comercial',  startDate: `${year}-11-14`, endDate: `${year}-11-17`, color: 'gold', isGlobal: true },
  { id: 'kd-12', name: 'Revolución',                emoji: '⚔️', category: 'cultural',   startDate: `${year}-11-17`, endDate: `${year}-11-17`, color: 'gold', isGlobal: true },
  { id: 'kd-13', name: 'Black Friday',              emoji: '🖤', category: 'comercial',  startDate: `${year}-11-28`, endDate: `${year}-11-28`, color: 'gold', isGlobal: true },
  { id: 'kd-14', name: 'Navidad',                   emoji: '🎄', category: 'comercial',  startDate: `${year}-12-15`, endDate: `${year}-12-25`, color: 'gold', isGlobal: true },
  { id: 'kd-15', name: 'Año Nuevo',                 emoji: '🎆', category: 'comercial',  startDate: `${year}-12-27`, endDate: `${year}-12-31`, color: 'gold', isGlobal: true },
  { id: 'kd-16', name: 'Semana Santa',              emoji: '✝️', category: 'cultural',   startDate: `${year}-04-13`, endDate: `${year}-04-20`, color: 'gold', isGlobal: true },
];

export const getMockCalendarItems = (year) => [
  { id: 'item-1',  title: 'Flash Deal Tarde — 40% OFF',         type: 'flash_deal',  category: 'promotion',   startDate: `${year}-03-01`, endDate: `${year}-03-31`, status: 'active',    startHour: 14, endHour: 17, metrics: { canjes: 23, revenue: 4800 },   description: 'Promoción ultra-corta', origin: '/promotions-management' },
  { id: 'item-2',  title: 'Happy Hour 5-7pm',                   type: 'happy_hour',  category: 'promotion',   startDate: `${year}-03-05`, endDate: `${year}-03-25`, status: 'active',    startHour: 17, endHour: 19, metrics: { canjes: 45, revenue: 9200 },   description: 'Descuento horario bajo', origin: '/promotions-management' },
  { id: 'item-3',  title: 'Drop Edición Limitada Marzo',        type: 'drop',        category: 'promotion',   startDate: `${year}-03-10`, endDate: `${year}-03-12`, status: 'scheduled', startHour: 10, endHour: 22, metrics: null,                            description: 'Producto exclusivo', origin: '/promotions-management' },
  { id: 'item-4',  title: 'Promo Fin de Semana',                type: 'promo',       category: 'promotion',   startDate: `${year}-03-15`, endDate: `${year}-03-16`, status: 'scheduled', startHour: 9,  endHour: 21, metrics: null,                            description: 'Descuento fin de semana', origin: '/promotions-management' },
  { id: 'item-5',  title: 'Campaña Primavera 2026',             type: 'campaign',    category: 'campaign',    startDate: `${year}-03-20`, endDate: `${year}-04-30`, status: 'active',    startHour: 9,  endHour: 18, metrics: { canjes: 87, revenue: 18400 },  description: 'Campaña multi-canal', origin: '/campaigns-management' },
  { id: 'item-6',  title: 'Cupón Bienvenida 15%',               type: 'coupon',      category: 'coupon',      startDate: `${year}-03-01`, endDate: `${year}-03-31`, status: 'active',    startHour: 0,  endHour: 23, metrics: { canjes: 34, revenue: 6800 },   description: 'Cupón nuevos clientes', origin: '/coupons-management' },
  { id: 'item-7',  title: 'Flow Bienvenida Nuevos Clientes',    type: 'flow',        category: 'flow',        startDate: `${year}-01-01`, endDate: `${year}-12-31`, status: 'active',    startHour: 0,  endHour: 23, metrics: { canjes: 234, revenue: 46800 }, description: 'Automatización bienvenida', origin: '/engagement-automation' },
  // New content types
  { id: 'item-8',  title: '🎴 Punch Cards próximas a completar', type: 'punch_card',  category: 'punch_card',  startDate: `${year}-06-21`, endDate: `${year}-06-21`, status: 'scheduled', startHour: 9,  endHour: 10, metrics: { canjes: 12, revenue: 0 },      description: '12 clientes completan punch card esta semana', origin: '/punch-cards-management', isSystemGenerated: true },
  { id: 'item-9',  title: '🔔 Push: Oferta especial fin de mes', type: 'push',        category: 'push',        startDate: `${year}-06-28`, endDate: `${year}-06-28`, status: 'scheduled', startHour: 10, endHour: 11, metrics: null,                            description: 'Push suelto programado', origin: '/campaigns-management' },
  { id: 'item-10', title: '📧 Newsletter Junio',                 type: 'email',       category: 'email',       startDate: `${year}-06-25`, endDate: `${year}-06-25`, status: 'scheduled', startHour: 9,  endHour: 10, metrics: null,                            description: 'Email mensual programado', origin: '/campaigns-management' },
  { id: 'item-11', title: '💬 WhatsApp: Recordatorio promo',    type: 'whatsapp',    category: 'whatsapp',    startDate: `${year}-06-22`, endDate: `${year}-06-22`, status: 'scheduled', startHour: 11, endHour: 12, metrics: null,                            description: 'Mensaje WhatsApp Business', origin: '/campaigns-management' },
  { id: 'item-12', title: '📸 Post Instagram: Promo verano',    type: 'social_post', category: 'social_post', startDate: `${year}-06-23`, endDate: `${year}-06-23`, status: 'scheduled', startHour: 12, endHour: 13, metrics: null,                            description: 'Post programado Content Studio', origin: '/campaigns-management' },
  { id: 'item-13', title: '🔥 Rachas en riesgo hoy',            type: 'streak_risk', category: 'streak_risk', startDate: `${year}-06-21`, endDate: `${year}-06-21`, status: 'scheduled', startHour: 8,  endHour: 9,  metrics: { canjes: 8, revenue: 0 },       description: '8 clientes romperán racha hoy', origin: '/visit-streaks-management', isSystemGenerated: true },
];

export const SUGGESTION_TEMPLATES = [
  { keyDateId: 'kd-11', keyDateName: 'Buen Fin',           message: '¿Preparas tu promo de Buen Fin?',           detail: 'Los negocios que preparan promos con 2 semanas de anticipación tienen 3x más canjes.', suggestedType: 'flash_deal', benchmark: 'Los restaurantes en tu zona generan en promedio $8,500 durante Buen Fin.' },
  { keyDateId: 'kd-4',  keyDateName: 'Día de las Madres',  message: '¿Preparas algo para el Día de las Madres?', detail: 'Las gift cards son el regalo más popular para mamá.', suggestedType: 'promo', benchmark: 'Los negocios con promo activa el 10 de mayo tienen 2.5x más visitas.' },
  { keyDateId: 'kd-5',  keyDateName: 'Hot Sale',           message: '¿Tienes algo planeado para Hot Sale?',      detail: 'Crea un flash deal o cupón con descuento agresivo.', suggestedType: 'flash_deal', benchmark: 'Los negocios con promo Hot Sale aumentan sus ventas 60% esa semana.' },
  { keyDateId: 'kd-13', keyDateName: 'Black Friday',       message: '¿Preparas tu oferta de Black Friday?',     detail: 'Black Friday tiene alta influencia en norte de México.', suggestedType: 'flash_deal', benchmark: 'Negocios con promo Black Friday reportan 45% más transacciones.' },
];
