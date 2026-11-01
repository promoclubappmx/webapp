import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import BasicInfoForm from './components/BasicInfoForm';
import LocationForm from './components/LocationForm';
import OperatingHoursForm from './components/OperatingHoursForm';
import MediaGalleryForm from './components/MediaGalleryForm';
import AdvancedForm from './components/AdvancedForm';
import LivePreview from './components/LivePreview';
import CommercialInfoForm from './components/CommercialInfoForm';
import TrustCredibilityForm from './components/TrustCredibilityForm';
import AmenitiesForm from './components/AmenitiesForm';
import AnalyticsDashboardForm from './components/AnalyticsDashboardForm';
import SecurityForm from './components/SecurityForm';

// Color map by tab — reusable across all components
export const COLOR_MAP = {
  basico:         { btn: 'bg-blue-600 hover:bg-blue-700 text-white',     icon: 'text-blue-600',    bar: 'bg-blue-600',    border: 'border-blue-600' },
  comercial:      { btn: 'bg-emerald-600 hover:bg-emerald-700 text-white', icon: 'text-emerald-600', bar: 'bg-emerald-600', border: 'border-emerald-600' },
  amenidades:     { btn: 'bg-sky-600 hover:bg-sky-700 text-white',        icon: 'text-sky-600',     bar: 'bg-sky-600',     border: 'border-sky-600' },
  seguridad:      { btn: 'bg-blue-900 hover:bg-blue-950 text-white',      icon: 'text-blue-900',    bar: 'bg-blue-900',    border: 'border-blue-900' },
  avanzado:       { btn: 'bg-violet-600 hover:bg-violet-700 text-white',  icon: 'text-violet-600',  bar: 'bg-violet-600',  border: 'border-violet-600' },
  confianza:      { btn: 'bg-amber-600 hover:bg-amber-700 text-white',    icon: 'text-amber-600',   bar: 'bg-amber-600',   border: 'border-amber-600' },
  analytics:      { btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',  icon: 'text-indigo-600',  bar: 'bg-indigo-600',  border: 'border-indigo-600' },
};

const TABS = [
  { id: 'basico', label: 'Básico', icon: 'Building2', color: 'text-blue-600', bg: 'bg-blue-100', activeBg: 'bg-blue-600', plan: null },
  { id: 'comercial', label: 'Comercial', icon: 'ShoppingBag', color: 'text-emerald-600', bg: 'bg-emerald-100', activeBg: 'bg-emerald-600', plan: null },
  { id: 'amenidades', label: 'Amenidades', icon: 'Star', color: 'text-sky-600', bg: 'bg-sky-100', activeBg: 'bg-sky-600', plan: null },
  { id: 'seguridad', label: 'Seguridad', icon: 'ShieldCheck', color: 'text-blue-900', bg: 'bg-blue-100', activeBg: 'bg-blue-900', plan: null },
  { id: 'avanzado', label: 'Avanzado', icon: 'Layers', color: 'text-violet-600', bg: 'bg-violet-100', activeBg: 'bg-violet-600', plan: null },
  { id: 'confianza', label: 'Confianza', icon: 'ShieldCheck', color: 'text-amber-600', bg: 'bg-amber-100', activeBg: 'bg-amber-600', plan: null },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart2', color: 'text-indigo-600', bg: 'bg-indigo-100', activeBg: 'bg-indigo-600', plan: null },
];

const BASIC_SUBTABS = [
  { id: 'info', label: 'Información', icon: 'Info', color: 'text-blue-700', bg: 'bg-blue-100', activeBg: 'bg-blue-600', hoverBg: 'hover:bg-blue-50' },
  { id: 'ubicacion', label: 'Ubicación', icon: 'MapPin', color: 'text-emerald-700', bg: 'bg-emerald-100', activeBg: 'bg-emerald-600', hoverBg: 'hover:bg-emerald-50' },
  { id: 'horarios', label: 'Horarios', icon: 'Clock', color: 'text-amber-700', bg: 'bg-amber-100', activeBg: 'bg-amber-600', hoverBg: 'hover:bg-amber-50' },
  { id: 'medios', label: 'Medios', icon: 'Image', color: 'text-violet-700', bg: 'bg-violet-100', activeBg: 'bg-violet-600', hoverBg: 'hover:bg-violet-50' },
];

const defaultFormData = () => ({
  businessName: '',
  shortDescription: '',
  longDescription: '',
  vertical: '',
  subcategory: '',
  secondaryTags: [],
  phone: '',
  whatsapp: '',
  whatsappMessage: 'Hola, los encontré en PromoClub. Me gustaría...',
  contactEmail: '',
  website: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  // Location
  address: '',
  street: '',
  interiorNumber: '',
  colonia: '',
  city: '',
  state: '',
  postalCode: '',
  latitude: null,
  longitude: null,
  howToGet: '',
  floorLocal: '',
  hasDeliveryZone: false,
  locationWithin: '',
  multipleEntrances: [],
  serviceZoneEnabled: false,
  serviceZoneRadius: 10,
  branches: [],
  // Hours
  operatingHours: {
    lunes: { isOpen: true, shifts: [{ open: '09:00', close: '22:00' }] },
    martes: { isOpen: true, shifts: [{ open: '09:00', close: '22:00' }] },
    miercoles: { isOpen: true, shifts: [{ open: '09:00', close: '22:00' }] },
    jueves: { isOpen: true, shifts: [{ open: '09:00', close: '22:00' }] },
    viernes: { isOpen: true, shifts: [{ open: '09:00', close: '23:00' }] },
    sabado: { isOpen: true, shifts: [{ open: '09:00', close: '23:00' }] },
    domingo: { isOpen: true, shifts: [{ open: '10:00', close: '22:00' }] },
  },
  specialHours: [],
  serviceShifts: [],
  timezone: 'America/Mexico_City',
  temporarilyClosed: false,
  tempClosedNote: '',
  occupancyStatus: 'tranquilo',
  occupancyManualMode: true,
  waitTime: 'none',
  nextAvailableSlot: '',
  // Media
  logo: null,
  cover: null,
  gallery: [],
  ugcEnabled: true,
  ugcPending: [],
  ugcApproved: [],
  // Advanced media
  tour360Url: '',
  tour360Type: 'link',
  beforeAfterPairs: [],
  featuredProduct: { name: '', price: '', photo: null, description: '', rotationType: 'weekly' },
  videoTestimonials: [],
  // Verification
  rfc: '',
  verificationStatus: 'pending',
  // Advanced
  slug: '',
  metaDescription: '',
  searchKeywords: [],
  videoLinks: [],
  nativeVideo: null,
  menuCategories: [],
  qrActions: { checkin: true, menu: true, review: false, points: false },
  tableCount: 1,
  // Commercial
  paymentMethods: {},
  priceRange: 2,
  avgTicket: '',
  foundedYear: '',
  capacity: '',
  parkingType: '',
  parkingCost: '',
  parkingSpots: '',
  wifiEnabled: false,
  wifiPassword: '',
  amenities: {},
  services: {},
  reservationRequired: false,
  reservationAdvance: '',
  cancellationPolicy: '',
  // Trust & Credibility
  certifications: [],
  awards: [],
  teamMembers: [],
  faqs: [],
  rules: [],
  news: [],
  quoteEnabled: false,
  quoteFormFields: ['name', 'phone', 'service', 'date'],
  // Sustainability
  sustainablePractices: {},
  socialInitiatives: {},
  socialDescription: '',
  productOrigins: {},
  inclusionBadges: {},
  // Communication
  welcomeMessageEnabled: false,
  welcomeMessage: '¡Bienvenido a [nombre del negocio]! 👋 Conoce nuestros servicios, promociones y acumula puntos con cada visita. ¿En qué podemos ayudarte?',
  primaryCTA: 'whatsapp',
  quickReplies: {},
  // Web
  landingActive: true,
  widgetSize: 'medium',
  widgetTheme: 'light',
  pixelActive: false,
  // Brand
  brandPrimaryColor: '#7C3AED',
  brandSecondaryColor: '#F59E0B',
  brandFont: 'plus-jakarta',
  // Languages
  shortDescriptionEN: '',
  longDescriptionEN: '',
  howToGetEN: '',
  // Accessibility
  accessibilityFeatures: {},
  acceptsGuideDogs: false,
  accessibilityAssessment: {},
  // Security
  securityFeatures: {},
  // Status
  isPublished: false,
});

const BusinessListingsManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('basico');
  const [activeSubTab, setActiveSubTab] = useState('info');
  const [formData, setFormData] = useState(defaultFormData());
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const userPlan = 'FREE'; // FREE | PRO | PREMIUM
  const validateLocationRef = useRef(null);

  // Handle URL params for direct navigation (e.g., from business-settings brand section)
  useEffect(() => {
    const params = new URLSearchParams(location?.search);
    const tab = params?.get('tab');
    const section = params?.get('section');
    if (tab && TABS?.find(t => t?.id === tab)) {
      setActiveTab(tab);
      // If section=qr, AdvancedForm will handle it via its own state
      // We store it so AdvancedForm can read it
      if (section) {
        sessionStorage?.setItem('blm_section', section);
      }
    }
  }, [location?.search]);

  const user = {
    name: 'Carlos Mendoza',
    email: 'carlos@minegocio.com',
    role: 'owner'
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Completeness score
  const completenessFields = [
    { key: 'businessName', label: 'Nombre', weight: 10 },
    { key: 'shortDescription', label: 'Descripción', weight: 5 },
    { key: 'longDescription', label: 'Descripción larga', weight: 5 },
    { key: 'categoria_id', label: 'Categoría', weight: 8 },
    { key: 'subcategoria_id', label: 'Subcategoría', weight: 4 },
    { key: 'tipo_establecimiento_id', label: 'Tipo', weight: 3 },
    { key: 'phone', label: 'Teléfono', weight: 5 },
    { key: 'street', label: 'Dirección', weight: 8 },
    { key: 'latitude', label: 'Coordenadas', weight: 4 },
    { key: 'logo', label: 'Logo', weight: 5 },
    { key: 'cover', label: 'Portada', weight: 8 },
    { key: 'operatingHours', label: 'Horarios', weight: 8 },
    { key: 'rfc', label: 'RFC', weight: 5 },
    { key: 'slug', label: 'URL (slug)', weight: 5 },
    { key: 'metaDescription', label: 'Meta descripción', weight: 3 },
    { key: 'searchKeywords', label: 'Keywords', weight: 3 },
    { key: 'paymentMethods', label: 'Métodos de pago', weight: 5 },
    { key: 'foundedYear', label: 'Año fundación', weight: 2 },
    { key: 'socialLinks', label: 'Redes sociales', weight: 5 },
    { key: 'amenities', label: 'Amenidades', weight: 3 },
    { key: 'securityFeatures', label: 'Seguridad', weight: 3 },
    { key: 'certifications', label: 'Certificaciones', weight: 2 },
  ];

  const completenessScore = completenessFields?.reduce((acc, f) => {
    const val = formData?.[f?.key];
    let filled = false;
    if (val === null || val === undefined || val === '') {
      filled = false;
    } else if (typeof val === 'string') {
      filled = val?.trim()?.length > 0;
    } else if (Array.isArray(val)) {
      filled = val?.length > 0;
    } else if (typeof val === 'object') {
      filled = Object.keys(val)?.length > 0 && Object.values(val)?.some(v => v);
    } else {
      filled = true;
    }
    return acc + (filled ? f?.weight : 0);
  }, 0);

  const completenessGroups = [
    { label: 'Datos', key: 'businessName', tab: 'basico', subTab: 'info' },
    { label: 'Categoría', key: 'categoria_id', tab: 'basico', subTab: 'info' },
    { label: 'Contacto', key: 'phone', tab: 'basico', subTab: 'info' },
    { label: 'Redes', key: 'socialLinks', tab: 'basico', subTab: 'info' },
    { label: 'Ubicación', key: 'street', tab: 'basico', subTab: 'ubicacion' },
    { label: 'Horarios', key: 'operatingHours', tab: 'basico', subTab: 'horarios' },
    { label: 'Logo', key: 'logo', tab: 'basico', subTab: 'medios' },
    { label: 'Portada', key: 'cover', tab: 'basico', subTab: 'medios' },
    { label: 'Pagos', key: 'paymentMethods', tab: 'comercial', subTab: null },
    { label: 'Amenidades', key: 'amenities', tab: 'amenidades', subTab: null },
    { label: 'Seguridad', key: 'securityFeatures', tab: 'seguridad', subTab: null },
    { label: 'SEO/Web', key: 'slug', tab: 'avanzado', subTab: null },
  ];

  const canPublish = formData?.businessName && formData?.vertical && formData?.street && formData?.cover && Object.keys(formData?.operatingHours || {})?.length > 0;

  const handleSave = async () => {
    // Validate location form if on ubicacion subtab
    if (activeTab === 'basico' && activeSubTab === 'ubicacion') {
      if (validateLocationRef?.current) {
        const isValid = validateLocationRef?.current();
        if (!isValid) return;
      }
    }
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePublishToggle = () => {
    if (!canPublish && !formData?.isPublished) return;
    handleChange('isPublished', !formData?.isPublished);
  };

  const scoreColor = completenessScore >= 80 ? 'text-green-600' : completenessScore >= 50 ? 'text-amber-600' : 'text-red-500';
  const scoreBarColor = completenessScore >= 80 ? 'bg-green-500' : completenessScore >= 50 ? 'bg-amber-500' : 'bg-red-500';

  const renderTabContent = () => {
    if (activeTab === 'basico') {
      switch (activeSubTab) {
        case 'info': return <BasicInfoForm formData={formData} onChange={handleChange} errors={{}} />;
        case 'ubicacion': return <LocationForm formData={formData} onChange={handleChange} errors={{}} externalErrors={{}} onValidate={(fn) => { validateLocationRef.current = fn; }} />;
        case 'horarios': return <OperatingHoursForm formData={formData} onChange={handleChange} errors={{}} />;
        case 'medios': return <MediaGalleryForm formData={formData} onChange={handleChange} errors={{}} />;
        default: return null;
      }
    }
    if (activeTab === 'comercial') return <CommercialInfoForm formData={formData} onChange={handleChange} />;
    if (activeTab === 'amenidades') return <AmenitiesForm formData={formData} onChange={handleChange} />;
    if (activeTab === 'seguridad') return <SecurityForm formData={formData} onChange={handleChange} />;
    if (activeTab === 'avanzado') return <AdvancedForm formData={formData} onChange={handleChange} />;
    if (activeTab === 'confianza') return <TrustCredibilityForm formData={formData} onChange={handleChange} />;
    if (activeTab === 'analytics') return <AnalyticsDashboardForm formData={formData} onChange={handleChange} />;
    return null;
  };

  const isTabLocked = (_tab) => false;

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        user={user}
      />
      <main
        className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
      >
        <div className="p-4 lg:p-6 max-w-6xl mx-auto">

          {/* Page header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div>
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                <button
                  onClick={() => navigate('/establishments-portfolio')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Icon name="LayoutGrid" size={14} />
                  Establecimientos
                </button>
                <Icon name="ChevronRight" size={14} className="text-muted-foreground/50" />
                <span className="text-foreground font-medium">Mi Establecimiento</span>
              </nav>
              <h1 className="text-2xl font-bold text-foreground">Mi Establecimiento</h1>
              <p className="text-sm text-muted-foreground mt-1">Configura cómo te ven los clientes en PromoClub</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Save success */}
              {saveSuccess && (
                <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                  <Icon name="CheckCircle" size={14} /> Guardado
                </span>
              )}
              {/* Publish toggle */}
              <div className={`flex items-center gap-2 px-4 py-2 border rounded-xl ${
                formData?.isPublished ? 'border-green-300 bg-green-50' : 'border-border bg-card'
              }`}>
                <span className="text-xs font-medium text-foreground">Ficha:</span>
                <button
                  onClick={handlePublishToggle}
                  disabled={!canPublish && !formData?.isPublished}
                  className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 disabled:opacity-40 ${
                    formData?.isPublished ? 'bg-green-500' : 'bg-muted'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    formData?.isPublished ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
                <span className={`text-xs font-semibold ${ formData?.isPublished ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {formData?.isPublished ? 'PUBLICADA' : 'NO PUBLICADA'}
                </span>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors disabled:opacity-60 ${
                  COLOR_MAP?.[activeTab]?.btn || 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {isSaving ? <Icon name="Loader" size={16} className="animate-spin" /> : <Icon name="Save" size={16} />}
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-xl hover:bg-muted transition-colors"
              >
                <Icon name="Eye" size={16} />
                Vista previa
              </button>
            </div>
          </div>

          {/* Completeness header */}
          <div className="bg-card border border-border rounded-2xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Gauge */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3.5" className="text-muted/30" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3.5"
                      strokeDasharray={`${completenessScore} ${100 - completenessScore}`}
                      strokeLinecap="round"
                      className={scoreColor}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-sm font-bold ${scoreColor}`}>{completenessScore}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Tu ficha está {completenessScore}% completa</p>
                  <p className="text-xs text-muted-foreground">Completa todos los campos para máxima visibilidad</p>
                </div>
              </div>
              {/* Breakdown */}
              <div className="flex flex-wrap gap-2 sm:ml-auto">
                {completenessGroups?.map(g => {
                  const val = formData?.[g?.key];
                  let filled = false;
                  if (val === null || val === undefined || val === '') {
                    filled = false;
                  } else if (typeof val === 'string') {
                    filled = val?.trim()?.length > 0;
                  } else if (Array.isArray(val)) {
                    filled = val?.length > 0;
                  } else if (typeof val === 'object') {
                    filled = Object.keys(val)?.length > 0 && Object.values(val)?.some(v => v);
                  } else {
                    filled = true;
                  }
                  return (
                    <button
                      key={g?.key}
                      onClick={() => {
                        setActiveTab(g?.tab);
                        if (g?.subTab) setActiveSubTab(g?.subTab);
                        else if (g?.tab === 'basico') setActiveSubTab('info');
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        filled ? 'border-green-200 bg-green-50 text-green-700' : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon name={filled ? 'CheckCircle' : 'Circle'} size={12} />
                      {g?.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {!canPublish && (
              <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
                <Icon name="AlertTriangle" size={12} />
                Para publicar necesitas: nombre, categoría, dirección, foto de portada y al menos un horario.
              </p>
            )}
          </div>

          {/* Main tabs */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Tab bar - matches promotions-management style with colored icon accents */}
            <div className="border-b border-border bg-muted/10 overflow-x-auto">
              <nav className="flex min-w-max px-3 py-2.5 gap-1">
                {TABS?.map(tab => {
                  const isActive = activeTab === tab?.id;
                  return (
                    <button
                      key={tab?.id}
                      onClick={() => { setActiveTab(tab?.id); if (tab?.id === 'basico') setActiveSubTab('info'); }}
                      className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                        isActive
                          ? `${tab?.activeBg} text-white shadow-sm`
                          : `text-muted-foreground hover:bg-muted hover:text-foreground`
                      }`}
                    >
                      <span className={`flex items-center justify-center w-5 h-5 rounded-md flex-shrink-0 ${
                        isActive ? 'bg-white/20' : tab?.bg
                      }`}>
                        <Icon name={tab?.icon} size={12} className={isActive ? 'text-white' : tab?.color} />
                      </span>
                      {tab?.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Sub-tabs for Básico - visually prominent colored pill buttons */}
            {activeTab === 'basico' && (
              <div className="border-b border-border bg-muted/5 overflow-x-auto">
                <div className="flex items-center gap-2 px-4 py-3 min-w-max">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2">Sección:</span>
                  {BASIC_SUBTABS?.map(sub => {
                    const isSubActive = activeSubTab === sub?.id;
                    return (
                      <button
                        key={sub?.id}
                        onClick={() => setActiveSubTab(sub?.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                          isSubActive
                            ? `${sub?.activeBg} text-white shadow-md ring-2 ring-offset-1 ring-current`
                            : `${sub?.bg} ${sub?.color} ${sub?.hoverBg} hover:shadow-sm`
                        }`}
                      >
                        <Icon name={sub?.icon} size={13} className={isSubActive ? 'text-white' : sub?.color} />
                        {sub?.label}
                        {sub?.id === 'verificacion' && formData?.verificationStatus === 'approved' && (
                          <Icon name="BadgeCheck" size={12} className="text-green-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </main>
      {/* Live Preview Drawer */}
      <LivePreview
        formData={formData}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        activeTab={activeTab}
      />
    </div>
  );
};

export default BusinessListingsManagement;