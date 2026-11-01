import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

// ─── AMENIDADES DEL ESTABLECIMIENTO ─────────────────────────────────────────
const AMENITIES_ESTABLECIMIENTO = [
  {
    id: 'estacionamiento',
    label: 'Estacionamiento',
    icon: 'Car',
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    items: [
      { key: 'est_parkingFree', label: 'Estacionamiento gratuito', icon: 'Car' },
      { key: 'est_parkingPrivate', label: 'Estacionamiento privado', icon: 'Lock' },
      { key: 'est_parkingPaid', label: 'Estacionamiento de pago', icon: 'CreditCard' },
      { key: 'est_parkingStreet', label: 'Estacionamiento en la calle', icon: 'MapPin' },
      { key: 'est_parkingValet', label: 'Valet parking', icon: 'KeyRound' },
      { key: 'est_parkingBike', label: 'Estacionamiento para bicicletas', icon: 'Bike' },
      { key: 'est_parkingMoto', label: 'Estacionamiento para motocicletas', icon: 'Zap' },
      { key: 'est_parkingCovered', label: 'Estacionamiento cubierto', icon: 'Umbrella' },
      { key: 'est_parkingGuarded', label: 'Estacionamiento con vigilancia', icon: 'Shield' },
    ],
  },
  {
    id: 'accesibilidad',
    label: 'Accesibilidad',
    icon: 'Accessibility',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    items: [
      { key: 'est_wheelchairAccess', label: 'Acceso para silla de ruedas', icon: 'Accessibility' },
      { key: 'est_accessibleEntrance', label: 'Entrada accesible', icon: 'DoorOpen' },
      { key: 'est_accessibleBathroom', label: 'Baños accesibles', icon: 'Droplets' },
      { key: 'est_ramp', label: 'Rampas de acceso', icon: 'ArrowUpRight' },
      { key: 'est_elevator', label: 'Elevador', icon: 'ArrowUpDown' },
      { key: 'est_brailleSignage', label: 'Señalización braille', icon: 'BookOpen' },
      { key: 'est_guideDogs', label: 'Perros guía', icon: 'Heart' },
      { key: 'est_accessibleMenu', label: 'Menú accesible', icon: 'FileText' },
      { key: 'est_wideAisles', label: 'Pasillos amplios', icon: 'MoveHorizontal' },
      { key: 'est_accessibleRest', label: 'Área de descanso accesible', icon: 'Armchair' },
      { key: 'est_disabilityAssist', label: 'Asistencia para discapacidad', icon: 'HandHelping' },
    ],
  },
  {
    id: 'instalaciones',
    label: 'Instalaciones generales',
    icon: 'Building2',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    items: [
      { key: 'est_restrooms', label: 'Baños', icon: 'Droplets' },
      { key: 'est_familyBathroom', label: 'Baños familiares', icon: 'Baby' },
      { key: 'est_neutralBathroom', label: 'Baños de género neutro', icon: 'Users' },
      { key: 'est_ac', label: 'Aire acondicionado', icon: 'Wind' },
      { key: 'est_heating', label: 'Calefacción', icon: 'Flame' },
      { key: 'est_kidsArea', label: 'Área infantil', icon: 'Baby' },
      { key: 'est_loungeArea', label: 'Área lounge', icon: 'Sofa' },
      { key: 'est_waitingRoom', label: 'Sala de espera', icon: 'Armchair' },
      { key: 'est_terraza', label: 'Terraza', icon: 'Umbrella' },
      { key: 'est_garden', label: 'Jardín', icon: 'Leaf' },
      { key: 'est_patio', label: 'Patio', icon: 'Sun' },
      { key: 'est_balcony', label: 'Balcón', icon: 'Building' },
    ],
  },
  {
    id: 'espacios',
    label: 'Espacios especializados',
    icon: 'LayoutDashboard',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    items: [
      { key: 'est_eventRoom', label: 'Sala de eventos', icon: 'CalendarCheck' },
      { key: 'est_privateRoom', label: 'Salón privado', icon: 'DoorClosed' },
      { key: 'est_coworking', label: 'Área de coworking', icon: 'Briefcase' },
      { key: 'est_studyArea', label: 'Área de estudio', icon: 'BookOpen' },
      { key: 'est_meetingRoom', label: 'Sala de reuniones', icon: 'Users' },
      { key: 'est_trainingRoom', label: 'Sala de capacitación', icon: 'GraduationCap' },
      { key: 'est_vipArea', label: 'Área VIP', icon: 'Star' },
    ],
  },
  {
    id: 'movilidad',
    label: 'Movilidad',
    icon: 'Navigation',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    items: [
      { key: 'est_publicTransport', label: 'Acceso cercano a transporte público', icon: 'Bus' },
      { key: 'est_streetAccess', label: 'Acceso directo desde calle', icon: 'MapPin' },
      { key: 'est_pedestrianAccess', label: 'Acceso peatonal', icon: 'Footprints' },
      { key: 'est_bikeAccess', label: 'Acceso para bicicletas', icon: 'Bike' },
    ],
  },
  {
    id: 'conectividad',
    label: 'Conectividad',
    icon: 'Wifi',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    items: [
      { key: 'est_wifiFree', label: 'WiFi gratuito', icon: 'Wifi' },
      { key: 'est_wifiClients', label: 'WiFi para clientes', icon: 'Wifi' },
      { key: 'est_wifiHigh', label: 'WiFi de alta velocidad', icon: 'Zap' },
      { key: 'est_chargingStations', label: 'Estaciones de carga', icon: 'BatteryCharging' },
      { key: 'est_laptopPlugs', label: 'Enchufes para laptop', icon: 'Plug' },
      { key: 'est_workZone', label: 'Zona de trabajo', icon: 'Monitor' },
    ],
  },
  {
    id: 'mascotas',
    label: 'Mascotas',
    icon: 'Heart',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    items: [
      { key: 'est_petFriendly', label: 'Pet friendly', icon: 'Heart' },
      { key: 'est_petArea', label: 'Área para mascotas', icon: 'MapPin' },
      { key: 'est_petWater', label: 'Bebederos para mascotas', icon: 'Droplets' },
      { key: 'est_petRest', label: 'Zona de descanso para mascotas', icon: 'Armchair' },
    ],
  },
  {
    id: 'ambiente',
    label: 'Ambiente',
    icon: 'Sparkles',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    items: [
      { key: 'est_familyAmbience', label: 'Ambiente familiar', icon: 'Users' },
      { key: 'est_romanticAmbience', label: 'Ambiente romántico', icon: 'Heart' },
      { key: 'est_casualAmbience', label: 'Ambiente casual', icon: 'Coffee' },
      { key: 'est_elegantAmbience', label: 'Ambiente elegante', icon: 'Star' },
      { key: 'est_quietAmbience', label: 'Ambiente tranquilo', icon: 'VolumeX' },
      { key: 'est_youthAmbience', label: 'Ambiente juvenil', icon: 'Zap' },
    ],
  },
  {
    id: 'entretenimiento',
    label: 'Entretenimiento en sitio',
    icon: 'Music',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    items: [
      { key: 'est_liveMusic', label: 'Música en vivo', icon: 'Music' },
      { key: 'est_dj', label: 'DJ', icon: 'Disc3' },
      { key: 'est_sportsScreen', label: 'Pantallas deportivas', icon: 'Tv' },
      { key: 'est_karaoke', label: 'Karaoke', icon: 'Mic' },
      { key: 'est_liveShows', label: 'Shows en vivo', icon: 'Theater' },
    ],
  },
];

// ─── AMENIDADES DEL SERVICIO ─────────────────────────────────────────────────
const AMENITIES_SERVICIO = [
  {
    id: 'atencion',
    label: 'Atención',
    icon: 'UserCheck',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    items: [
      { key: 'svc_counterService', label: 'Atención en mostrador', icon: 'Store' },
      { key: 'svc_tableService', label: 'Atención en mesa', icon: 'UtensilsCrossed' },
      { key: 'svc_personalService', label: 'Atención personalizada', icon: 'UserCheck' },
      { key: 'svc_onlineService', label: 'Atención en línea', icon: 'Globe' },
      { key: 'svc_phoneService', label: 'Atención telefónica', icon: 'Phone' },
    ],
  },
  {
    id: 'modalidad',
    label: 'Modalidad de servicio',
    icon: 'Truck',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    items: [
      { key: 'svc_delivery', label: 'Servicio a domicilio', icon: 'Truck' },
      { key: 'svc_takeout', label: 'Servicio para llevar', icon: 'ShoppingBag' },
      { key: 'svc_homeService', label: 'Servicio a domicilio (visita)', icon: 'Home' },
      { key: 'svc_driveThru', label: 'Servicio a auto', icon: 'Car' },
      { key: 'svc_curbside', label: 'Recolección en puerta', icon: 'MapPin' },
      { key: 'svc_catering', label: 'Catering / Eventos', icon: 'UtensilsCrossed' },
      { key: 'svc_nationalShipping', label: 'Envío nacional', icon: 'Package' },
    ],
  },
  {
    id: 'reservaciones',
    label: 'Reservaciones',
    icon: 'CalendarCheck',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    items: [
      { key: 'svc_appointment', label: 'Citas previas', icon: 'CalendarCheck' },
      { key: 'svc_walkIn', label: 'Atención sin cita', icon: 'UserPlus' },
      { key: 'svc_waitlist', label: 'Lista de espera', icon: 'Clock' },
    ],
  },
  {
    id: 'tecnologia',
    label: 'Tecnología',
    icon: 'Smartphone',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    items: [
      { key: 'svc_digitalMenu', label: 'Menú digital', icon: 'Tablet' },
      { key: 'svc_onlineOrders', label: 'Pedidos en línea', icon: 'ShoppingCart' },
      { key: 'svc_digitalCheckin', label: 'Check-in digital', icon: 'QrCode' },
      { key: 'svc_onlineReservations', label: 'Reservas en línea', icon: 'CalendarCheck' },
      { key: 'svc_eBilling', label: 'Facturación electrónica', icon: 'FileText' },
      { key: 'svc_selfServiceKiosk', label: 'Kiosco de autoservicio', icon: 'Monitor' },
      { key: 'svc_turnSystem', label: 'Sistema de turnos', icon: 'Hash' },
    ],
  },
  {
    id: 'conveniencia',
    label: 'Conveniencia',
    icon: 'Zap',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    items: [
      { key: 'svc_express', label: 'Servicio exprés', icon: 'Zap' },
      { key: 'svc_sameDay', label: 'Entrega el mismo día', icon: 'Clock' },
      { key: 'svc_fastService', label: 'Atención rápida', icon: 'Timer' },
      { key: 'svc_scheduled', label: 'Servicio programado', icon: 'Calendar' },
      { key: 'svc_b2b', label: 'Servicio a empresas', icon: 'Building2' },
    ],
  },
  {
    id: 'eventos',
    label: 'Eventos y experiencias',
    icon: 'CalendarDays',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    items: [
      { key: 'svc_privateEvents', label: 'Eventos privados', icon: 'Lock' },
      { key: 'svc_corporateEvents', label: 'Eventos corporativos', icon: 'Briefcase' },
    ],
  },
  {
    id: 'soporte',
    label: 'Soporte al cliente',
    icon: 'Headphones',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    items: [
      { key: 'svc_serviceWarranty', label: 'Garantía de servicio', icon: 'ShieldCheck' },
      { key: 'svc_returns', label: 'Devoluciones', icon: 'RotateCcw' },
      { key: 'svc_exchanges', label: 'Cambios de producto', icon: 'RefreshCw' },
      { key: 'svc_aftersales', label: 'Soporte postventa', icon: 'Headphones' },
    ],
  },
  {
    id: 'idiomas',
    label: 'Idiomas',
    icon: 'Globe',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    items: [
      { key: 'svc_spanish', label: 'Español', icon: 'Globe' },
      { key: 'svc_english', label: 'Inglés', icon: 'Globe' },
      { key: 'svc_french', label: 'Francés', icon: 'Globe' },
      { key: 'svc_german', label: 'Alemán', icon: 'Globe' },
      { key: 'svc_italian', label: 'Italiano', icon: 'Globe' },
      { key: 'svc_portuguese', label: 'Portugués', icon: 'Globe' },
      { key: 'svc_japanese', label: 'Japonés', icon: 'Globe' },
      { key: 'svc_chinese', label: 'Chino', icon: 'Globe' },
    ],
  },
];

// ─── AMENIDADES DEL PRODUCTO ─────────────────────────────────────────────────
const AMENITIES_PRODUCTO = [
  {
    id: 'alimentarias',
    label: 'Opciones alimentarias',
    icon: 'UtensilsCrossed',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    items: [
      { key: 'prd_vegetarian', label: 'Opciones vegetarianas', icon: 'Leaf' },
      { key: 'prd_vegan', label: 'Opciones veganas', icon: 'Sprout' },
      { key: 'prd_glutenFree', label: 'Opciones sin gluten', icon: 'Wheat' },
      { key: 'prd_keto', label: 'Opciones keto', icon: 'Flame' },
      { key: 'prd_kidsMenu', label: 'Menú infantil', icon: 'Baby' },
      { key: 'prd_healthyMenu', label: 'Menú saludable', icon: 'Heart' },
    ],
  },
  {
    id: 'origen_calidad',
    label: 'Origen y calidad del producto',
    icon: 'Award',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    items: [
      { key: 'prd_organic', label: 'Productos orgánicos', icon: 'Leaf' },
      { key: 'prd_local', label: 'Productos locales', icon: 'MapPin' },
      { key: 'prd_premium', label: 'Ingredientes premium', icon: 'Star' },
      { key: 'prd_fairTrade', label: 'Comercio justo', icon: 'Handshake' },
      { key: 'prd_artisan', label: 'Producción artesanal', icon: 'Hammer' },
      { key: 'prd_originLocal', label: 'Insumos de origen local', icon: 'MapPin' },
      { key: 'prd_originImported', label: 'Insumos importados', icon: 'Globe' },
      { key: 'prd_originNational', label: 'Producción nacional', icon: 'Flag' },
      { key: 'prd_originOrganic', label: 'Insumos orgánicos certificados', icon: 'Sprout' },
      { key: 'prd_originArtisan', label: 'Insumos artesanales', icon: 'Hammer' },
    ],
  },
  {
    id: 'variedad',
    label: 'Variedad',
    icon: 'LayoutGrid',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    items: [
      { key: 'prd_tasting', label: 'Menú degustación', icon: 'UtensilsCrossed' },
      { key: 'prd_buffet', label: 'Buffet', icon: 'LayoutGrid' },
      { key: 'prd_seasonal', label: 'Productos de temporada', icon: 'Calendar' },
      { key: 'prd_limited', label: 'Ediciones limitadas', icon: 'Tag' },
    ],
  },
  {
    id: 'bebidas',
    label: 'Bebidas',
    icon: 'Wine',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    items: [
      { key: 'prd_alcohol', label: 'Bebidas alcohólicas', icon: 'Wine' },
      { key: 'prd_craftBeer', label: 'Cerveza artesanal', icon: 'Beer' },
      { key: 'prd_wines', label: 'Vinos', icon: 'Wine' },
      { key: 'prd_cocktails', label: 'Coctelería', icon: 'GlassWater' },
      { key: 'prd_specialtyCoffee', label: 'Café de especialidad', icon: 'Coffee' },
      { key: 'prd_nonAlcoholic', label: 'Bebidas sin alcohol', icon: 'GlassWater' },
    ],
  },
  {
    id: 'retail',
    label: 'Retail',
    icon: 'ShoppingBag',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    items: [
      { key: 'prd_exclusive', label: 'Productos exclusivos', icon: 'Star' },
      { key: 'prd_imported', label: 'Productos importados', icon: 'Globe' },
      { key: 'prd_specialEditions', label: 'Ediciones especiales', icon: 'Tag' },
      { key: 'prd_custom', label: 'Productos personalizados', icon: 'Pencil' },
    ],
  },
  {
    id: 'adicionales',
    label: 'Servicios adicionales del producto',
    icon: 'Gift',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    items: [
      { key: 'prd_giftWrap', label: 'Empaque de regalo', icon: 'Gift' },
      { key: 'prd_customization', label: 'Personalización de productos', icon: 'Pencil' },
      { key: 'prd_presale', label: 'Preventa de productos', icon: 'Clock' },
      { key: 'prd_layaway', label: 'Apartado de productos', icon: 'Package' },
    ],
  },
];

const AMENITY_SUBTABS = [
  { id: 'establecimiento', label: 'Amenidades del Establecimiento', icon: 'Building2', color: 'text-blue-700', bg: 'bg-blue-100', activeBg: 'bg-blue-600', hoverBg: 'hover:bg-blue-50', countColor: 'bg-blue-100 text-blue-700' },
  { id: 'servicio', label: 'Amenidades del Servicio', icon: 'Settings', color: 'text-emerald-700', bg: 'bg-emerald-100', activeBg: 'bg-emerald-600', hoverBg: 'hover:bg-emerald-50', countColor: 'bg-emerald-100 text-emerald-700' },
  { id: 'producto', label: 'Amenidades del Producto', icon: 'ShoppingBag', color: 'text-violet-700', bg: 'bg-violet-100', activeBg: 'bg-violet-600', hoverBg: 'hover:bg-violet-50', countColor: 'bg-violet-100 text-violet-700' },
];

const AmenityGroup = ({ sg, amenities, onChange }) => {
  const sgSelected = sg?.items?.filter(i => amenities?.[i?.key])?.length;
  return (
    <div className={`border rounded-xl overflow-hidden ${sg?.border}`}>
      <div className={`flex items-center justify-between px-4 py-2.5 ${sg?.bg}`}>
        <div className="flex items-center gap-2">
          <Icon name={sg?.icon} size={14} className={sg?.color} />
          <span className={`text-xs font-semibold ${sg?.color}`}>{sg?.label}</span>
        </div>
        {sgSelected > 0 && (
          <span className={`text-xs px-2 py-0.5 rounded-full bg-white/70 font-medium ${sg?.color}`}>
            {sgSelected}/{sg?.items?.length}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-card">
        {sg?.items?.map(item => (
          <button
            key={item?.key}
            onClick={() => onChange('amenities', { ...amenities, [item?.key]: !amenities?.[item?.key] })}
            className={`flex items-center gap-2 p-2.5 border rounded-lg text-left transition-all ${
              amenities?.[item?.key] ? 'border-emerald-500 bg-emerald-50' : 'border-border hover:bg-muted/30'
            }`}
          >
            <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
              amenities?.[item?.key] ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'
            }`}>
              <Icon name={item?.icon} size={13} />
            </div>
            <span className="text-xs font-medium text-foreground leading-tight">{item?.label}</span>
            {amenities?.[item?.key] && <Icon name="Check" size={11} className="text-emerald-600 ml-auto flex-shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );
};

const AmenitiesForm = ({ formData, onChange }) => {
  const [activeSubTab, setActiveSubTab] = useState('establecimiento');
  const amenities = formData?.amenities || {};

  const getCount = (list) => list?.reduce((acc, sg) => acc + sg?.items?.filter(i => amenities?.[i?.key])?.length, 0);

  const countMap = {
    establecimiento: getCount(AMENITIES_ESTABLECIMIENTO),
    servicio: getCount(AMENITIES_SERVICIO),
    producto: getCount(AMENITIES_PRODUCTO),
  };

  const listMap = {
    establecimiento: AMENITIES_ESTABLECIMIENTO,
    servicio: AMENITIES_SERVICIO,
    producto: AMENITIES_PRODUCTO,
  };

  const descMap = {
    establecimiento: 'Infraestructura del lugar. Se muestran en tu ficha y son filtrables en la app.',
    servicio: 'Cómo opera el negocio. Se muestran en tu ficha y son filtrables en la app.',
    producto: 'Características de lo que venden. Se muestran en tu ficha y son filtrables en la app.',
  };

  const activeTab = AMENITY_SUBTABS?.find(t => t?.id === activeSubTab);

  return (
    <div className="space-y-0">
      {/* Sub-tab nav */}
      <div className="border-b border-border bg-muted/5 overflow-x-auto mb-6">
        <div className="flex items-center gap-2 px-1 py-3 min-w-max">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2">Tipo:</span>
          {AMENITY_SUBTABS?.map(tab => {
            const isActive = activeSubTab === tab?.id;
            const count = countMap?.[tab?.id];
            return (
              <button
                key={tab?.id}
                onClick={() => setActiveSubTab(tab?.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                  isActive
                    ? `${tab?.activeBg} text-white shadow-md ring-2 ring-offset-1 ring-current`
                    : `${tab?.bg} ${tab?.color} ${tab?.hoverBg} hover:shadow-sm`
                }`}
              >
                <Icon name={tab?.icon} size={13} className={isActive ? 'text-white' : tab?.color} />
                {tab?.label}
                {count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                    isActive ? 'bg-white/20 text-white' : tab?.countColor
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h3 className="text-base font-semibold text-foreground">{activeTab?.label}</h3>
            </div>
            {countMap?.[activeSubTab] > 0 && (
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${activeTab?.countColor}`}>
                {countMap?.[activeSubTab]} seleccionadas
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-4">{descMap?.[activeSubTab]}</p>
          <div className="space-y-4">
            {listMap?.[activeSubTab]?.map(sg => (
              <AmenityGroup key={sg?.id} sg={sg} amenities={amenities} onChange={onChange} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmenitiesForm;
