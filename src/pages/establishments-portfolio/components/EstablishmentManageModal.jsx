import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import BasicInfoForm from '../../business-listings-management/components/BasicInfoForm';
import LocationForm from '../../business-listings-management/components/LocationForm';
import OperatingHoursForm from '../../business-listings-management/components/OperatingHoursForm';
import MediaGalleryForm from '../../business-listings-management/components/MediaGalleryForm';
import CommercialInfoForm from '../../business-listings-management/components/CommercialInfoForm';
import AmenitiesForm from '../../business-listings-management/components/AmenitiesForm';
import SecurityForm from '../../business-listings-management/components/SecurityForm';
import AdvancedForm from '../../business-listings-management/components/AdvancedForm';
import TrustCredibilityForm from '../../business-listings-management/components/TrustCredibilityForm';
import { supabase } from '../../../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const WIZARD_STEPS = [
  { id: 'analytics', label: 'Analytics', shortLabel: 'Analytics', icon: 'BarChart2', description: 'Métricas y rendimiento del establecimiento', group: 'Análisis', color: 'text-indigo-600', bg: 'bg-indigo-100', activeBg: 'bg-indigo-600', ringColor: 'ring-indigo-400' },
  { id: 'info', label: 'Información básica', shortLabel: 'Básico', icon: 'Building2', description: 'Nombre, categoría, descripción, contacto y redes sociales', group: 'Datos del negocio', color: 'text-blue-600', bg: 'bg-blue-100', activeBg: 'bg-blue-600', ringColor: 'ring-blue-400' },
  { id: 'ubicacion', label: 'Ubicación', shortLabel: 'Ubicación', icon: 'MapPin', description: 'Dirección, mapa y cómo llegar', group: 'Datos del negocio', color: 'text-emerald-600', bg: 'bg-emerald-100', activeBg: 'bg-emerald-600', ringColor: 'ring-emerald-400' },
  { id: 'horarios', label: 'Horarios', shortLabel: 'Horarios', icon: 'Clock', description: 'Días y horas de atención', group: 'Datos del negocio', color: 'text-amber-600', bg: 'bg-amber-100', activeBg: 'bg-amber-600', ringColor: 'ring-amber-400' },
  { id: 'medios', label: 'Fotos y medios', shortLabel: 'Medios', icon: 'Image', description: 'Logo, portada y galería de fotos', group: 'Presencia visual', color: 'text-violet-600', bg: 'bg-violet-100', activeBg: 'bg-violet-600', ringColor: 'ring-violet-400' },
  { id: 'comercial', label: 'Info comercial', shortLabel: 'Comercial', icon: 'ShoppingBag', description: 'Pagos, precios, catálogo y reservaciones', group: 'Presencia visual', color: 'text-teal-600', bg: 'bg-teal-100', activeBg: 'bg-teal-600', ringColor: 'ring-teal-400' },
  { id: 'amenidades', label: 'Amenidades', shortLabel: 'Amenidades', icon: 'Star', description: 'Instalaciones, servicios y características del local', group: 'Presencia visual', color: 'text-sky-600', bg: 'bg-sky-100', activeBg: 'bg-sky-600', ringColor: 'ring-sky-400' },
  { id: 'seguridad', label: 'Seguridad', shortLabel: 'Seguridad', icon: 'ShieldCheck', description: 'Características de seguridad del establecimiento', group: 'Configuración avanzada', color: 'text-blue-900', bg: 'bg-blue-100', activeBg: 'bg-blue-900', ringColor: 'ring-blue-700' },
  { id: 'avanzado', label: 'Web y SEO', shortLabel: 'Web/SEO', icon: 'Globe', description: 'Slug, meta tags, keywords y widget', group: 'Configuración avanzada', color: 'text-indigo-600', bg: 'bg-indigo-100', activeBg: 'bg-indigo-600', ringColor: 'ring-indigo-400' },
  { id: 'confianza', label: 'Confianza', shortLabel: 'Confianza', icon: 'Award', description: 'Certificaciones, equipo, FAQ y noticias', group: 'Configuración avanzada', color: 'text-amber-600', bg: 'bg-amber-100', activeBg: 'bg-amber-600', ringColor: 'ring-amber-400' },
];

const defaultFormData = () => ({
  businessName: '', shortDescription: '', longDescription: '', branchName: '',
  categoria_id: '', subcategoria_id: '', tipo_establecimiento_id: '', secondaryTags: [],
  phone: '', whatsapp: '', whatsappMessage: 'Hola, los encontré en PromoClub. Me gustaría...',
  contactEmail: '', website: '',
  socialLinks: { facebook: '', instagram: '', twitter: '', tiktok: '', youtube: '', linkedin: '', whatsapp: '', pinterest: '', snapchat: '', threads: '' },
  address: '', street: '', interiorNumber: '', colonia: '', city: '', state: '', postalCode: '',
  latitude: null, longitude: null, howToGet: '', floorLocal: '', hasDeliveryZone: false,
  locationWithin: '', multipleEntrances: [], serviceZoneEnabled: false, serviceZoneRadius: 10, branches: [],
  operatingHours: {
    lunes: { isOpen: true, shifts: [{ open: '09:00', close: '22:00' }] },
    martes: { isOpen: true, shifts: [{ open: '09:00', close: '22:00' }] },
    miercoles: { isOpen: true, shifts: [{ open: '09:00', close: '22:00' }] },
    jueves: { isOpen: true, shifts: [{ open: '09:00', close: '22:00' }] },
    viernes: { isOpen: true, shifts: [{ open: '09:00', close: '23:00' }] },
    sabado: { isOpen: true, shifts: [{ open: '09:00', close: '23:00' }] },
    domingo: { isOpen: true, shifts: [{ open: '10:00', close: '22:00' }] },
  },
  specialHours: [], serviceShifts: [], timezone: 'America/Mexico_City',
  temporarilyClosed: false, tempClosedNote: '', showLiveStats: true,
  occupancyStatus: 'tranquilo', occupancyManualMode: true, waitTime: 'none', nextAvailableSlot: '',
  logo: null, cover: null, gallery: [], ugcEnabled: true, ugcPending: [], ugcApproved: [],
  tour360Url: '', tour360Type: 'link', beforeAfterPairs: [],
  featuredProduct: { name: '', price: '', photo: null, description: '', rotationType: 'weekly' },
  videoTestimonials: [], rfc: '', verificationStatus: 'pending', slug: '',
  metaDescription: '', metaTitle: '', metaKeywords: '', ogTitle: '', ogDescription: '',
  ogImage: '', twitterCard: 'summary_large_image', canonicalUrl: '', searchKeywords: [],
  videoLinks: [], shortVideoLinks: [], nativeVideo: null, menuCategories: [],
  qrActions: { checkin: true, menu: true, review: false, points: false }, tableCount: 1,
  paymentMethods: {}, priceRange: 2, avgTicket: '', foundedYear: '', capacity: '',
  parkingType: '', parkingCost: '', parkingSpots: '', wifiEnabled: false, wifiPassword: '',
  amenities: {}, services: {}, reservationRequired: false, reservationAdvance: '',
  cancellationPolicy: '', certifications: [], awards: [], teamMembers: [], faqs: [],
  rules: [], news: [], quoteEnabled: false, quoteFormFields: ['name', 'phone', 'service', 'date'],
  sustainablePractices: {}, socialInitiatives: {}, socialDescription: '', productOrigins: {},
  inclusionBadges: {}, welcomeMessageEnabled: false,
  welcomeMessage: '¡Bienvenido a [nombre del negocio]! 👋 Conoce nuestros servicios, promociones y acumula puntos con cada visita. ¿En qué podemos ayudarte?',
  primaryCTA: 'whatsapp', quickReplies: {}, landingActive: true, widgetSize: 'medium',
  widgetTheme: 'light', pixelActive: false, brandPrimaryColor: '#7C3AED', brandSecondaryColor: '#F59E0B',
  brandFont: 'plus-jakarta', shortDescriptionEN: '', longDescriptionEN: '', howToGetEN: '',
  accessibilityFeatures: {}, acceptsGuideDogs: false, accessibilityAssessment: {}, securityFeatures: {},
  isPublished: false,
});

// ── Analytics Tab ─────────────────────────────────────────────────────────────
const AnalyticsTab = ({ establishment }) => {
  const [period, setPeriod] = useState('30d');

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const sparkData = (establishment?.kpis?.visitsWeek || [0,0,0,0,0,0,0])?.map((v, i) => ({ day: weekDays?.[i], visits: v }));

  const trafficSources = [
    { source: 'Búsqueda en app', visits: 512, pct: 41, icon: 'Search', color: '#3b82f6' },
    { source: 'Mapa', visits: 387, pct: 31, icon: 'Map', color: '#22c55e' },
    { source: 'Categoría', visits: 198, pct: 16, icon: 'Tag', color: '#a855f7' },
    { source: 'Link directo', visits: 87, pct: 7, icon: 'Link', color: '#f59e0b' },
    { source: 'QR', visits: 38, pct: 3, icon: 'QrCode', color: '#ef4444' },
    { source: 'Redes sociales', visits: 25, pct: 2, icon: 'Share2', color: '#ec4899' },
  ];

  const pieData = trafficSources?.map(s => ({ name: s?.source, value: s?.pct, fill: s?.color }));

  const kpiCards = [
    { label: 'Visitas este mes', value: (establishment?.kpis?.visitsMonth || 0)?.toLocaleString(), change: 18, icon: 'Users', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Revenue estimado', value: `$${(establishment?.kpis?.revenueMonth || 0)?.toLocaleString()}`, change: 12, icon: 'TrendingUp', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Clientes nuevos', value: (establishment?.kpis?.newCustomers || 0)?.toLocaleString(), change: 23, icon: 'UserPlus', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30' },
    { label: 'Clientes dormidos', value: (establishment?.kpis?.dormantCustomers || 0)?.toLocaleString(), change: -5, icon: 'UserMinus', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { label: 'Promos activas', value: (establishment?.metrics?.activePromos || 0)?.toString(), change: 0, icon: 'Megaphone', color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/30' },
    { label: 'Rating promedio', value: establishment?.metrics?.rating > 0 ? `⭐ ${establishment?.metrics?.rating}` : '—', change: 3, icon: 'Star', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  ];

  const suggestions = [
    { id: 1, priority: 'high', icon: 'ImagePlus', text: 'Sube 6 fotos más para alcanzar el mínimo recomendado de 10 fotos', impact: '+35% vistas' },
    { id: 2, priority: 'high', icon: 'HelpCircle', text: 'Agrega al menos 3 preguntas frecuentes (FAQ)', impact: '+18% conversión' },
    { id: 3, priority: 'medium', icon: 'Clock', text: 'Actualiza tus horarios especiales para los próximos festivos', impact: 'Evita visitas fallidas' },
    { id: 4, priority: 'medium', icon: 'CreditCard', text: 'Agrega métodos de pago para aparecer en filtros de la app', impact: '+12% clics' },
    { id: 5, priority: 'low', icon: 'Globe', text: 'Configura tu tour virtual 360° para destacar en búsquedas', impact: '+8% tiempo en ficha' },
  ];

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center gap-2">
        {[{ value: '7d', label: '7 días' }, { value: '30d', label: '30 días' }, { value: '90d', label: '90 días' }]?.map(p => (
          <button key={p?.value} onClick={() => setPeriod(p?.value)}
            className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors ${
              period === p?.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
            }`}>
            {p?.label}
          </button>
        ))}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {kpiCards?.map(kpi => (
          <div key={kpi?.label} className={`${kpi?.bg} border border-border rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              <Icon name={kpi?.icon} size={16} className={kpi?.color} />
              <span className={`text-xs font-medium ${kpi?.change > 0 ? 'text-emerald-600' : kpi?.change < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {kpi?.change > 0 ? `↑${kpi?.change}%` : kpi?.change < 0 ? `↓${Math.abs(kpi?.change)}%` : '—'}
              </span>
            </div>
            <p className="text-xl font-bold text-foreground">{kpi?.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi?.label}</p>
          </div>
        ))}
      </div>

      {/* Visits chart */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-sm font-semibold text-foreground mb-4">Visitas esta semana</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={sparkData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(v) => [v, 'Visitas']}
            />
            <Bar dataKey="visits" fill={establishment?.logoColor || '#7C3AED'} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Profile score + Traffic sources */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Profile score */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">Score de completitud</p>
            <span className="text-lg font-bold text-foreground">{establishment?.kpis?.profileScore || 0}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 mb-3">
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{
                width: `${establishment?.kpis?.profileScore || 0}%`,
                backgroundColor: (establishment?.kpis?.profileScore || 0) >= 80 ? '#22c55e' : (establishment?.kpis?.profileScore || 0) >= 50 ? '#f59e0b' : '#ef4444'
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {(establishment?.kpis?.profileScore || 0) >= 80
              ? '✅ Ficha bien optimizada'
              : (establishment?.kpis?.profileScore || 0) >= 50
              ? '⚠️ Completa más datos para mejorar visibilidad'
              : '❌ Ficha incompleta — pocas visitas esperadas'}
          </p>
        </div>

        {/* Pie chart traffic */}
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Fuentes de tráfico</p>
          <div className="flex items-center gap-3">
            <ResponsiveContainer width={90} height={90}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={25} outerRadius={42} dataKey="value" paddingAngle={2}>
                  {pieData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1">
              {trafficSources?.slice(0, 4)?.map(s => (
                <div key={s?.source} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s?.color }} />
                  <span className="text-xs text-muted-foreground truncate">{s?.source}</span>
                  <span className="text-xs font-medium text-foreground ml-auto">{s?.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Conversion rate */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-foreground">Conversión ficha → visita</p>
          <span className="text-xl font-bold text-primary">12.5%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5">
          <div className="bg-primary h-2.5 rounded-full" style={{ width: '12.5%' }} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">Basado en clics de "Cómo llegar" y check-ins</p>
      </div>

      {/* Optimization suggestions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-amber-500 rounded-full" />
          <p className="text-sm font-semibold text-foreground">Sugerencias de optimización</p>
          <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">{suggestions?.length}</span>
        </div>
        <div className="space-y-2.5">
          {suggestions?.map(suggestion => (
            <div key={suggestion?.id} className={`flex items-start gap-3 p-3 border rounded-xl ${
              suggestion?.priority === 'high' ? 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900' :
              suggestion?.priority === 'medium' ? 'border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900' : 'border-border bg-card'
            }`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                suggestion?.priority === 'high' ? 'bg-red-100 dark:bg-red-900/40' :
                suggestion?.priority === 'medium' ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-muted'
              }`}>
                <Icon name={suggestion?.icon} size={14} className={`${
                  suggestion?.priority === 'high' ? 'text-red-600' :
                  suggestion?.priority === 'medium' ? 'text-amber-600' : 'text-muted-foreground'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground leading-snug">{suggestion?.text}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Impacto: <strong>{suggestion?.impact}</strong></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Main Modal ────────────────────────────────────────────────────────────────
const EstablishmentManageModal = ({ establishment, onClose, onSaved }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(defaultFormData());
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const validateLocationRef = useRef(null);

  // Load establishment data from Supabase
  useEffect(() => {
    if (!establishment?.id) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          ?.from('business_settings')
          ?.select('*')
          ?.eq('id', establishment?.id)
          ?.single();

        if (error) throw error;

        if (data) {
          setFormData(prev => ({
            ...prev,
            businessName: data?.nombre_comercial || data?.business_name || '',
            shortDescription: data?.short_description || data?.business_description || '',
            longDescription: data?.long_description || '',
            branchName: data?.branch_name || '',
            categoria_id: data?.categoria_id || '',
            subcategoria_id: data?.subcategoria_id || '',
            tipo_establecimiento_id: data?.tipo_establecimiento_id || '',
            secondaryTags: data?.secondary_tags || [],
            phone: data?.contact_phone || data?.business_phone || '',
            whatsapp: data?.whatsapp || '',
            contactEmail: data?.contact_email || data?.business_email || '',
            website: data?.business_website || '',
            socialLinks: data?.social_links || prev?.socialLinks,
            address: data?.business_address || '',
            street: data?.street || data?.business_address || '',
            interiorNumber: data?.interior_number || '',
            colonia: data?.colonia || '',
            city: data?.business_city || '',
            state: data?.business_state || '',
            postalCode: data?.business_postal_code || '',
            latitude: data?.latitude || null,
            longitude: data?.longitude || null,
            howToGet: data?.how_to_get || '',
            operatingHours: data?.operating_hours || prev?.operatingHours,
            specialHours: data?.special_hours || [],
            temporarilyClosed: data?.temporarily_closed || false,
            tempClosedNote: data?.temp_closed_note || '',
            logo: data?.business_image_url ? { url: data?.business_image_url } : null,
            cover: data?.cover_image_url ? { url: data?.cover_image_url } : null,
            gallery: (data?.gallery_images || [])?.map(g => typeof g === 'string' ? { url: g } : g),
            paymentMethods: data?.payment_methods || {},
            priceRange: data?.price_range || 2,
            avgTicket: data?.avg_ticket || '',
            amenities: data?.amenities || {},
            services: data?.services || {},
            securityFeatures: data?.security_features || {},
            metaTitle: data?.meta_title || '',
            metaDescription: data?.meta_description || '',
            metaKeywords: data?.meta_keywords || '',
            searchKeywords: data?.search_keywords || [],
            slug: data?.slug || '',
            certifications: data?.certifications || [],
            faqs: data?.faqs || [],
            brandPrimaryColor: data?.brand_primary_color || '#7C3AED',
            brandSecondaryColor: data?.brand_secondary_color || '#F59E0B',
            isPublished: data?.is_published || false,
          }));
        }
      } catch (e) {
        console.error('Error loading establishment data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [establishment?.id]);

  const uploadFile = async (fileObj, userId, folder) => {
    if (!fileObj?.file) return fileObj?.url || null;
    try {
      const ext = fileObj?.name?.split('.')?.pop() || 'jpg';
      const path = `${userId}/${folder}/${Date.now()}.${ext}`;
      const { error } = await supabase?.storage
        ?.from('business-assets')
        ?.upload(path, fileObj?.file, { upsert: true, contentType: fileObj?.file?.type });
      if (error) return null;
      const { data: { publicUrl } } = supabase?.storage?.from('business-assets')?.getPublicUrl(path);
      return publicUrl;
    } catch {
      return null;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const { data: { user: supaUser } } = await supabase?.auth?.getUser();
      if (!supaUser) { setSaveError('No hay sesión activa.'); setIsSaving(false); return; }

      let businessImageUrl = formData?.logo?.url || null;
      let coverImageUrl = formData?.cover?.url || null;
      const galleryUrls = [];

      if (formData?.logo?.file) businessImageUrl = await uploadFile(formData?.logo, supaUser?.id, 'business-image');
      if (formData?.cover?.file) coverImageUrl = await uploadFile(formData?.cover, supaUser?.id, 'cover');

      for (const item of (formData?.gallery || [])) {
        if (item?.file) {
          const url = await uploadFile(item, supaUser?.id, 'gallery');
          if (url) galleryUrls?.push({ url, caption: item?.caption || '', alt: item?.alt || '' });
        } else if (item?.url) {
          galleryUrls?.push({ url: item?.url, caption: item?.caption || '', alt: item?.alt || '' });
        }
      }

      const payload = {
        business_name: formData?.businessName || '',
        nombre_comercial: formData?.businessName || '',
        business_description: formData?.shortDescription || '',
        short_description: formData?.shortDescription || '',
        long_description: formData?.longDescription || '',
        branch_name: formData?.branchName || '',
        business_phone: formData?.phone || '',
        contact_phone: formData?.phone || '',
        business_email: formData?.contactEmail || '',
        contact_email: formData?.contactEmail || '',
        business_website: formData?.website || '',
        business_address: formData?.address || formData?.street || '',
        business_city: formData?.city || '',
        business_state: formData?.state || '',
        business_postal_code: formData?.postalCode || '',
        categoria_id: formData?.categoria_id || null,
        subcategoria_id: formData?.subcategoria_id || null,
        tipo_establecimiento_id: formData?.tipo_establecimiento_id || null,
        slug: formData?.slug || '',
        brand_primary_color: formData?.brandPrimaryColor || '#7C3AED',
        brand_secondary_color: formData?.brandSecondaryColor || '#F59E0B',
        whatsapp: formData?.whatsapp || '',
        social_links: formData?.socialLinks || {},
        secondary_tags: formData?.secondaryTags || [],
        street: formData?.street || '',
        interior_number: formData?.interiorNumber || '',
        colonia: formData?.colonia || '',
        latitude: formData?.latitude || null,
        longitude: formData?.longitude || null,
        how_to_get: formData?.howToGet || '',
        operating_hours: formData?.operatingHours || {},
        special_hours: formData?.specialHours || [],
        temporarily_closed: formData?.temporarilyClosed || false,
        temp_closed_note: formData?.tempClosedNote || '',
        business_image_url: businessImageUrl,
        cover_image_url: coverImageUrl,
        gallery_images: galleryUrls?.length > 0 ? galleryUrls : (formData?.gallery?.filter(g => g?.url)?.map(g => ({ url: g?.url, caption: g?.caption || '', alt: g?.alt || '' })) || []),
        payment_methods: formData?.paymentMethods || {},
        price_range: formData?.priceRange || 2,
        avg_ticket: formData?.avgTicket || '',
        amenities: formData?.amenities || {},
        services: formData?.services || {},
        security_features: formData?.securityFeatures || {},
        meta_title: formData?.metaTitle || '',
        meta_description: formData?.metaDescription || '',
        meta_keywords: formData?.metaKeywords || '',
        search_keywords: formData?.searchKeywords || [],
        certifications: formData?.certifications || [],
        faqs: formData?.faqs || [],
        updated_at: new Date()?.toISOString(),
      };

      const { error } = await supabase
        ?.from('business_settings')
        ?.update(payload)
        ?.eq('id', establishment?.id)
        ?.eq('owner_id', supaUser?.id);

      if (error) { setSaveError(`Error al guardar: ${error?.message}`); setIsSaving(false); return; }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onSaved?.();
    } catch (e) {
      setSaveError('Error inesperado. Por favor intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors?.[field]) {
      setValidationErrors(prev => { const n = { ...prev }; delete n?.[field]; return n; });
    }
  };

  const step = WIZARD_STEPS?.[currentStep];
  const isAnalyticsStep = step?.id === 'analytics';

  const renderStepContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Icon name="Loader" size={32} className="animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Cargando datos del establecimiento...</p>
          </div>
        </div>
      );
    }
    switch (step?.id) {
      case 'analytics': return <AnalyticsTab establishment={establishment} />;
      case 'info': return <BasicInfoForm formData={formData} onChange={handleChange} errors={validationErrors} />;
      case 'ubicacion': return <LocationForm formData={formData} onChange={handleChange} errors={validationErrors} externalErrors={validationErrors} onValidate={(fn) => { validateLocationRef.current = fn; }} />;
      case 'horarios': return <OperatingHoursForm formData={formData} onChange={handleChange} errors={validationErrors} />;
      case 'medios': return <MediaGalleryForm formData={formData} onChange={handleChange} errors={validationErrors} />;
      case 'comercial': return <CommercialInfoForm formData={formData} onChange={handleChange} />;
      case 'amenidades': return <AmenitiesForm formData={formData} onChange={handleChange} />;
      case 'seguridad': return <SecurityForm formData={formData} onChange={handleChange} />;
      case 'avanzado': return <AdvancedForm formData={formData} onChange={handleChange} />;
      case 'confianza': return <TrustCredibilityForm formData={formData} onChange={handleChange} />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-background w-full max-w-4xl min-h-screen sm:min-h-0 sm:my-6 sm:rounded-2xl shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card sm:rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: establishment?.logoColor || '#7C3AED' }}
            >
              {establishment?.initial || establishment?.name?.[0] || '?'}
            </div>
            <div>
              <h2 className="font-bold text-foreground text-base">{establishment?.name}</h2>
              <p className="text-xs text-muted-foreground">{step?.label} · {step?.group}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                <Icon name="CheckCircle" size={13} /> Guardado
              </span>
            )}
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Icon name="X" size={18} />
            </button>
          </div>
        </div>

        {/* Step tabs */}
        <div className="px-4 pt-4 pb-0 bg-card border-b border-border overflow-x-auto">
          <div className="flex items-center gap-1 pb-3 min-w-max">
            {WIZARD_STEPS?.map((s, i) => {
              const isCurrent = i === currentStep;
              return (
                <button
                  key={s?.id}
                  onClick={() => setCurrentStep(i)}
                  className={`flex flex-col items-center gap-1 min-w-[56px] px-2 py-1.5 rounded-xl transition-all ${
                    isCurrent ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                    isCurrent ? `${s?.activeBg} text-white shadow-sm` : `${s?.bg}`
                  }`}>
                    <Icon name={s?.icon} size={14} className={isCurrent ? 'text-white' : s?.color} />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight whitespace-nowrap">{s?.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step header */}
        <div className="px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${step?.activeBg} flex items-center justify-center shadow-sm`}>
              <Icon name={step?.icon} size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{step?.label}</h3>
              <p className="text-xs text-muted-foreground">{step?.description}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Footer */}
        {!isAnalyticsStep && (
          <div className="border-t border-border px-6 py-4 bg-card sm:rounded-b-2xl sticky bottom-0 z-10">
            {saveError && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 mb-3">
                <Icon name="AlertCircle" size={14} />
                {saveError}
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                  className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card text-foreground text-sm font-medium rounded-xl hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Icon name="ChevronLeft" size={15} />
                  Anterior
                </button>
                {currentStep < WIZARD_STEPS?.length - 1 && (
                  <button
                    onClick={() => setCurrentStep(prev => Math.min(WIZARD_STEPS?.length - 1, prev + 1))}
                    className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card text-foreground text-sm font-medium rounded-xl hover:bg-muted transition-colors"
                  >
                    Siguiente
                    <Icon name="ChevronRight" size={15} />
                  </button>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
              >
                {isSaving ? <Icon name="Loader" size={15} className="animate-spin" /> : <Icon name="Save" size={15} />}
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstablishmentManageModal;
