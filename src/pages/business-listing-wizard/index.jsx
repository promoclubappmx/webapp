import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import BasicInfoForm from '../business-listings-management/components/BasicInfoForm';
import LocationForm from '../business-listings-management/components/LocationForm';
import OperatingHoursForm from '../business-listings-management/components/OperatingHoursForm';
import MediaGalleryForm from '../business-listings-management/components/MediaGalleryForm';
import CommercialInfoForm from '../business-listings-management/components/CommercialInfoForm';
import AmenitiesForm from '../business-listings-management/components/AmenitiesForm';
import SecurityForm from '../business-listings-management/components/SecurityForm';
import AdvancedForm from '../business-listings-management/components/AdvancedForm';
import TrustCredibilityForm from '../business-listings-management/components/TrustCredibilityForm';
import LivePreview from '../business-listings-management/components/LivePreview';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const WIZARD_STEPS = [
  {
    id: 'info',
    label: 'Información básica',
    shortLabel: 'Básico',
    icon: 'Building2',
    description: 'Nombre, categoría, descripción, contacto y redes sociales',
    group: 'Datos del negocio',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    activeBg: 'bg-blue-600',
    ringColor: 'ring-blue-400',
  },
  {
    id: 'ubicacion',
    label: 'Ubicación',
    shortLabel: 'Ubicación',
    icon: 'MapPin',
    description: 'Dirección, mapa y cómo llegar',
    group: 'Datos del negocio',
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    activeBg: 'bg-emerald-600',
    ringColor: 'ring-emerald-400',
  },
  {
    id: 'horarios',
    label: 'Horarios',
    shortLabel: 'Horarios',
    icon: 'Clock',
    description: 'Días y horas de atención',
    group: 'Datos del negocio',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    activeBg: 'bg-amber-600',
    ringColor: 'ring-amber-400',
  },
  {
    id: 'medios',
    label: 'Fotos y medios',
    shortLabel: 'Medios',
    icon: 'Image',
    description: 'Logo, portada y galería de fotos',
    group: 'Presencia visual',
    color: 'text-violet-600',
    bg: 'bg-violet-100',
    activeBg: 'bg-violet-600',
    ringColor: 'ring-violet-400',
  },
  {
    id: 'comercial',
    label: 'Info comercial',
    shortLabel: 'Comercial',
    icon: 'ShoppingBag',
    description: 'Pagos, precios, catálogo y reservaciones',
    group: 'Presencia visual',
    color: 'text-teal-600',
    bg: 'bg-teal-100',
    activeBg: 'bg-teal-600',
    ringColor: 'ring-teal-400',
  },
  {
    id: 'amenidades',
    label: 'Amenidades',
    shortLabel: 'Amenidades',
    icon: 'Star',
    description: 'Instalaciones, servicios y características del local',
    group: 'Presencia visual',
    color: 'text-sky-600',
    bg: 'bg-sky-100',
    activeBg: 'bg-sky-600',
    ringColor: 'ring-sky-400',
  },
  {
    id: 'seguridad',
    label: 'Seguridad',
    shortLabel: 'Seguridad',
    icon: 'ShieldCheck',
    description: 'Características de seguridad del establecimiento',
    group: 'Configuración avanzada',
    color: 'text-blue-900',
    bg: 'bg-blue-100',
    activeBg: 'bg-blue-900',
    ringColor: 'ring-blue-700',
  },
  {
    id: 'avanzado',
    label: 'Web y SEO',
    shortLabel: 'Web/SEO',
    icon: 'Globe',
    description: 'Slug, meta tags, keywords y widget',
    group: 'Configuración avanzada',
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
    activeBg: 'bg-indigo-600',
    ringColor: 'ring-indigo-400',
  },
  {
    id: 'confianza',
    label: 'Confianza',
    shortLabel: 'Confianza',
    icon: 'Award',
    description: 'Certificaciones, equipo, FAQ y noticias',
    group: 'Configuración avanzada',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    activeBg: 'bg-amber-600',
    ringColor: 'ring-amber-400',
  },
];

const defaultFormData = () => ({
  businessName: '',
  shortDescription: '',
  longDescription: '',
  branchName: '',
  categoria_id: '',
  subcategoria_id: '',
  tipo_establecimiento_id: '',
  secondaryTags: [],
  phone: '',
  whatsapp: '',
  whatsappMessage: 'Hola, los encontré en PromoClub. Me gustaría...',
  contactEmail: '',
  website: '',
  socialLinks: { facebook: '', instagram: '', twitter: '', tiktok: '', youtube: '', linkedin: '', whatsapp: '', pinterest: '', snapchat: '', threads: '' },
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
  showLiveStats: true,
  occupancyStatus: 'tranquilo',
  occupancyManualMode: true,
  waitTime: 'none',
  nextAvailableSlot: '',
  logo: null,
  cover: null,
  gallery: [],
  ugcEnabled: true,
  ugcPending: [],
  ugcApproved: [],
  tour360Url: '',
  tour360Type: 'link',
  beforeAfterPairs: [],
  featuredProduct: { name: '', price: '', photo: null, description: '', rotationType: 'weekly' },
  videoTestimonials: [],
  rfc: '',
  verificationStatus: 'pending',
  slug: '',
  metaDescription: '',
  metaTitle: '',
  metaKeywords: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  twitterCard: 'summary_large_image',
  canonicalUrl: '',
  searchKeywords: [],
  videoLinks: [],
  shortVideoLinks: [],
  nativeVideo: null,
  menuCategories: [],
  qrActions: { checkin: true, menu: true, review: false, points: false },
  tableCount: 1,
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
  certifications: [],
  awards: [],
  teamMembers: [],
  faqs: [],
  rules: [],
  news: [],
  quoteEnabled: false,
  quoteFormFields: ['name', 'phone', 'service', 'date'],
  sustainablePractices: {},
  socialInitiatives: {},
  socialDescription: '',
  productOrigins: {},
  inclusionBadges: {},
  welcomeMessageEnabled: false,
  welcomeMessage: '¡Bienvenido a [nombre del negocio]! 👋 Conoce nuestros servicios, promociones y acumula puntos con cada visita. ¿En qué podemos ayudarte?',
  primaryCTA: 'whatsapp',
  quickReplies: {},
  landingActive: true,
  widgetSize: 'medium',
  widgetTheme: 'light',
  pixelActive: false,
  brandPrimaryColor: '#7C3AED',
  brandSecondaryColor: '#F59E0B',
  brandFont: 'plus-jakarta',
  shortDescriptionEN: '',
  longDescriptionEN: '',
  howToGetEN: '',
  accessibilityFeatures: {},
  acceptsGuideDogs: false,
  accessibilityAssessment: {},
  securityFeatures: {},
  isPublished: false,
});

const STEP_REQUIRED_FIELDS = {
  info: ['businessName'],
  ubicacion: ['street'],
  horarios: [],
  medios: [],
  comercial: [],
  amenidades: [],
  seguridad: [],
  avanzado: [],
  confianza: [],
};

const stepHasData = (stepId, formData) => {
  const checks = {
    info: () => !!formData?.businessName,
    ubicacion: () => !!formData?.street || !!formData?.city,
    horarios: () => !!formData?.operatingHours,
    medios: () => !!formData?.logo || (formData?.gallery?.length > 0),
    comercial: () => Object.keys(formData?.paymentMethods || {})?.some(k => formData?.paymentMethods?.[k]),
    amenidades: () => Object.keys(formData?.amenities || {})?.some(k => formData?.amenities?.[k]),
    seguridad: () => Object.keys(formData?.securityFeatures || {})?.some(k => formData?.securityFeatures?.[k]),
    avanzado: () => !!formData?.slug || (formData?.searchKeywords?.length > 0),
    confianza: () => (formData?.certifications?.length > 0) || (formData?.faqs?.length > 0),
  };
  return checks?.[stepId]?.() || false;
};

const DraftResumeModal = ({ draft, onResume, onStartFresh }) => {
  const date = draft?.updated_at
    ? new Date(draft?.updated_at)?.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '';
  const stepLabel = WIZARD_STEPS?.[draft?.current_step]?.label || 'Paso 1';
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Icon name="FileText" size={20} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Tienes un borrador guardado</h3>
            <p className="text-xs text-muted-foreground">del {date}</p>
          </div>
        </div>
        <p className="text-sm text-foreground mb-2">
          Encontramos un borrador guardado en el paso <strong>{stepLabel}</strong>.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          ¿Deseas continuar donde lo dejaste o empezar de nuevo?
        </p>
        <div className="flex gap-3">
          <button onClick={onStartFresh} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">
            Empezar de nuevo
          </button>
          <button onClick={onResume} className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-semibold transition-colors">
            Continuar borrador
          </button>
        </div>
      </div>
    </div>
  );
};

// Success screen shown after completing the wizard
const SuccessScreen = ({ formData, onGoToPortfolio, onGoToListing }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <Icon name="CheckCircle" size={36} className="text-white" />
          </div>
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-md">
          <Icon name="Star" size={16} className="text-white" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-2">¡Establecimiento registrado!</h2>
      <p className="text-muted-foreground text-sm max-w-md mb-2">
        Tu ficha <strong className="text-foreground">{formData?.businessName || 'tu negocio'}</strong> ha sido creada exitosamente en PromoClub.
      </p>
      <p className="text-muted-foreground text-xs max-w-md mb-8">
        Ahora puedes completar los detalles adicionales, publicar tu ficha y comenzar a atraer clientes.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl mb-8">
        {[
          { icon: 'Building2', label: 'Nombre', value: formData?.businessName || '—', color: 'text-blue-600 bg-blue-50' },
          { icon: 'MapPin', label: 'Dirección', value: formData?.city || formData?.street || '—', color: 'text-emerald-600 bg-emerald-50' },
          { icon: 'Clock', label: 'Horarios', value: formData?.operatingHours ? 'Configurados' : 'Pendiente', color: 'text-amber-600 bg-amber-50' },
          { icon: 'Image', label: 'Fotos', value: formData?.cover ? 'Subidas' : 'Pendiente', color: 'text-violet-600 bg-violet-50' },
        ]?.map(item => (
          <div key={item?.label} className="border border-border rounded-xl p-3 text-center">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2 ${item?.color}`}>
              <Icon name={item?.icon} size={18} />
            </div>
            <p className="text-xs text-muted-foreground">{item?.label}</p>
            <p className="text-xs font-semibold text-foreground mt-0.5 truncate">{item?.value}</p>
          </div>
        ))}
      </div>

      <div className="w-full max-w-2xl bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-left">
        <p className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <Icon name="Lightbulb" size={16} />
          Próximos pasos recomendados
        </p>
        <div className="space-y-2">
          {[
            { icon: 'Image', text: 'Sube más fotos de tu negocio para aumentar visitas', done: !!formData?.cover },
            { icon: 'CreditCard', text: 'Configura tus métodos de pago en la pestaña Comercial', done: Object.keys(formData?.paymentMethods || {})?.some(k => formData?.paymentMethods?.[k]) },
            { icon: 'Globe', text: 'Personaliza tu URL (slug) en la pestaña Avanzado', done: !!formData?.slug },
            { icon: 'Star', text: 'Agrega amenidades para destacar en búsquedas', done: Object.keys(formData?.amenities || {})?.some(k => formData?.amenities?.[k]) },
          ]?.map((step, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${step?.done ? 'bg-green-500' : 'bg-blue-200'}`}>
                <Icon name={step?.done ? 'Check' : 'Circle'} size={11} className={step?.done ? 'text-white' : 'text-blue-600'} />
              </div>
              <p className={`text-xs ${step?.done ? 'text-green-700 line-through' : 'text-blue-700'}`}>{step?.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <button
          onClick={onGoToListing}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-colors"
        >
          <Icon name="Pencil" size={18} />
          Completar ficha
        </button>
        <button
          onClick={onGoToPortfolio}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-border bg-card text-foreground font-medium rounded-xl hover:bg-muted transition-colors"
        >
          <Icon name="LayoutGrid" size={18} />
          Ver mis establecimientos
        </button>
      </div>
    </div>
  );
};

const STEP_TIPS = {
  0: 'Un nombre claro y una descripción atractiva aumentan hasta un 40% las visitas a tu ficha.',
  1: 'Agrega coordenadas exactas para aparecer en el mapa de PromoClub y facilitar que los clientes te encuentren.',
  2: 'Los negocios con horarios completos reciben 3x más visitas. Incluye horarios especiales para festivos.',
  3: 'Las fichas con 10+ fotos reciben 35% más vistas. Sube fotos de alta calidad de tu local y productos.',
  4: 'Indica tus métodos de pago y rango de precios para aparecer en los filtros de búsqueda de la app.',
  5: 'Las amenidades ayudan a los clientes a elegir tu negocio. ¡Más amenidades = más visitas!',
  6: 'Mostrar tus características de seguridad genera confianza y aumenta la conversión.',
  7: 'Un slug personalizado y palabras clave relevantes mejoran tu posicionamiento en búsquedas.',
  8: 'Las fichas con FAQ resuelven dudas antes de la visita y aumentan la conversión un 18%.',
};

const BusinessListingWizard = () => {
  const navigate = useNavigate();
  const { user: authUser, userProfile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(defaultFormData());
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveProgressSuccess, setSaveProgressSuccess] = useState(false);
  const [existingDraft, setExistingDraft] = useState(null);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftId, setDraftId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const validateLocationRef = useRef(null);

  // ── Preload business name and category from business_settings ──────────────
  useEffect(() => {
    const preloadBusinessData = async () => {
      try {
        const { data: { user: supaUser } } = await supabase?.auth?.getUser();
        if (!supaUser) return;
        const { data: settings } = await supabase
          ?.from('business_settings')
          ?.select('business_name, nombre_comercial, categoria_nombre, categoria_id, contact_phone, contact_email, business_phone, business_email')
          ?.eq('owner_id', supaUser?.id)
          ?.maybeSingle();
        if (settings) {
          setFormData(prev => ({
            ...prev,
            businessName: prev?.businessName || settings?.nombre_comercial || settings?.business_name || '',
            categoria_id: prev?.categoria_id || settings?.categoria_id || '',
            phone: prev?.phone || settings?.contact_phone || settings?.business_phone || '',
            contactEmail: prev?.contactEmail || settings?.contact_email || settings?.business_email || '',
          }));
        }
      } catch (e) {
        // Silently fail
      }
    };
    preloadBusinessData();
  }, []);

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const { data: { user: supaUser } } = await supabase?.auth?.getUser();
        if (!supaUser) return;
        const { data, error } = await supabase?.from('business_listing_drafts')?.select('*')?.eq('owner_id', supaUser?.id)?.maybeSingle();
        if (error) return;
        if (data) {
          setExistingDraft(data);
          setDraftId(data?.id);
          setShowDraftModal(true);
        }
      } catch (e) {
        // Silently fail if no auth
      }
    };
    loadDraft();
  }, []);

  const handleResumeDraft = () => {
    if (!existingDraft) return;
    setFormData(prev => ({ ...prev, ...(existingDraft?.form_data || {}) }));
    setCurrentStep(existingDraft?.current_step || 0);
    const completed = new Set();
    for (let i = 0; i < (existingDraft?.current_step || 0); i++) {
      completed?.add(WIZARD_STEPS?.[i]?.id);
    }
    setCompletedSteps(completed);
    setShowDraftModal(false);
  };

  const handleStartFresh = () => {
    setShowDraftModal(false);
    setExistingDraft(null);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field when user types
    if (validationErrors?.[field]) {
      setValidationErrors(prev => { const n = { ...prev }; delete n?.[field]; return n; });
    }
  };

  const validateCurrentStep = () => {
    const step = WIZARD_STEPS?.[currentStep];
    const required = STEP_REQUIRED_FIELDS?.[step?.id] || [];
    const errors = {};

    required?.forEach(field => {
      const value = formData?.[field];
      if (!value || (typeof value === 'string' && !value?.trim())) {
        errors[field] = 'Este campo es obligatorio';
      }
    });

    // Special case for ubicacion: street OR city must be filled
    if (step?.id === 'ubicacion') {
      if (!formData?.street?.trim() && !formData?.city?.trim()) {
        errors['street'] = 'Ingresa al menos la calle o ciudad';
      } else {
        delete errors?.['street'];
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors)?.length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    const step = WIZARD_STEPS?.[currentStep];
    setCompletedSteps(prev => new Set([...prev, step?.id]));
    if (currentStep < WIZARD_STEPS?.length - 1) {
      setCurrentStep(prev => prev + 1);
      setValidationErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (index) => {
    if (index <= currentStep || completedSteps?.has(WIZARD_STEPS?.[index]?.id)) {
      setCurrentStep(index);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveProgress = async () => {
    setIsSavingProgress(true);
    try {
      const { data: { user: supaUser } } = await supabase?.auth?.getUser();
      if (supaUser) {
        const sanitized = JSON.parse(JSON.stringify(formData, (key, value) => {
          if (value instanceof File || value instanceof Blob) return null;
          return value;
        }));
        const { data, error } = await supabase?.from('business_listing_drafts')?.upsert(
            { owner_id: supaUser?.id, current_step: currentStep, form_data: sanitized, updated_at: new Date()?.toISOString() },
            { onConflict: 'owner_id' }
          )?.select()?.single();
        if (!error && data) setDraftId(data?.id);
      }
    } catch (e) {
      // Silently handle
    } finally {
      setIsSavingProgress(false);
      setSaveProgressSuccess(true);
      setTimeout(() => setSaveProgressSuccess(false), 3000);
    }
  };

  // ── Upload a file to Supabase Storage ─────────────────────────────────────
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

  const handleSaveAndFinish = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const { data: { user: supaUser } } = await supabase?.auth?.getUser();
      if (!supaUser) {
        setSaveError('No hay sesión activa. Por favor inicia sesión.');
        setIsSaving(false);
        return;
      }

      // Upload images to Supabase Storage
      let businessImageUrl = null;
      let coverImageUrl = null;
      const galleryUrls = [];

      if (formData?.logo?.file) {
        businessImageUrl = await uploadFile(formData?.logo, supaUser?.id, 'business-image');
      } else if (typeof formData?.logo === 'string') {
        businessImageUrl = formData?.logo;
      }

      if (formData?.cover?.file) {
        coverImageUrl = await uploadFile(formData?.cover, supaUser?.id, 'cover');
      } else if (typeof formData?.cover === 'string') {
        coverImageUrl = formData?.cover;
      }

      for (const item of (formData?.gallery || [])) {
        if (item?.file) {
          const url = await uploadFile(item, supaUser?.id, 'gallery');
          if (url) galleryUrls?.push({ url, caption: item?.caption || '', alt: item?.alt || '' });
        } else if (item?.url) {
          galleryUrls?.push({ url: item?.url, caption: item?.caption || '', alt: item?.alt || '' });
        }
      }

      // Sanitize formData for JSON storage
      const sanitized = JSON.parse(JSON.stringify(formData, (key, value) => {
        if (value instanceof File || value instanceof Blob) return null;
        return value;
      }));

      // Build the business_settings update payload
      const settingsPayload = {
        owner_id: supaUser?.id,
        business_name: formData?.businessName || '',
        nombre_comercial: formData?.businessName || '',
        business_description: formData?.shortDescription || '',
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
        short_description: formData?.shortDescription || '',
        long_description: formData?.longDescription || '',
        branch_name: formData?.branchName || '',
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
        gallery_images: galleryUrls,
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
        is_published: true,
        wizard_completed_at: new Date()?.toISOString(),
        wizard_step: WIZARD_STEPS?.length - 1,
        updated_at: new Date()?.toISOString(),
      };

      // Upsert business_settings
      const { error: settingsError } = await supabase
        ?.from('business_settings')
        ?.upsert(settingsPayload, { onConflict: 'owner_id' });

      if (settingsError) {
        console.error('Error saving business settings:', settingsError);
        setSaveError(`Error al guardar: ${settingsError?.message}`);
        setIsSaving(false);
        return;
      }

      // Save draft as completed
      await supabase?.from('business_listing_drafts')?.upsert(
        {
          owner_id: supaUser?.id,
          current_step: WIZARD_STEPS?.length - 1,
          form_data: { ...sanitized, isPublished: true, completedAt: new Date()?.toISOString() },
          updated_at: new Date()?.toISOString(),
        },
        { onConflict: 'owner_id' }
      );

    } catch (e) {
      console.error('Save error:', e);
      setSaveError('Error inesperado. Por favor intenta de nuevo.');
      setIsSaving(false);
      return;
    }
    setIsSaving(false);
    setShowSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const { data: { user: supaUser } } = await supabase?.auth?.getUser();
      if (supaUser) {
        const sanitized = JSON.parse(JSON.stringify(formData, (key, value) => {
          if (value instanceof File || value instanceof Blob) return null;
          return value;
        }));
        await supabase?.from('business_listing_drafts')?.upsert(
          { owner_id: supaUser?.id, current_step: currentStep, form_data: sanitized, updated_at: new Date()?.toISOString() },
          { onConflict: 'owner_id' }
        );
      }
    } catch (e) {
      // Silently handle
    } finally {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const step = WIZARD_STEPS?.[currentStep];
  const isLastStep = currentStep === WIZARD_STEPS?.length - 1;
  const isFirstStep = currentStep === 0;
  const progressPct = Math.round(((currentStep + 1) / WIZARD_STEPS?.length) * 100);

  const renderStepContent = () => {
    switch (step?.id) {
      case 'info':
        return <BasicInfoForm formData={formData} onChange={handleChange} errors={validationErrors} />;
      case 'ubicacion':
        return <LocationForm formData={formData} onChange={handleChange} externalErrors={validationErrors} onValidate={(fn) => { validateLocationRef.current = fn; }} />;
      case 'horarios':
        return <OperatingHoursForm formData={formData} onChange={handleChange} errors={validationErrors} />;
      case 'medios':
        return <MediaGalleryForm formData={formData} onChange={handleChange} errors={validationErrors} />;
      case 'comercial':
        return <CommercialInfoForm formData={formData} onChange={handleChange} />;
      case 'amenidades':
        return <AmenitiesForm formData={formData} onChange={handleChange} />;
      case 'seguridad':
        return <SecurityForm formData={formData} onChange={handleChange} />;
      case 'avanzado':
        return <AdvancedForm formData={formData} onChange={handleChange} />;
      case 'confianza':
        return <TrustCredibilityForm formData={formData} onChange={handleChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={authUser}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={authUser}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main
        className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
      >
        <div className="p-6 max-w-7xl mx-auto">

          {/* Page header with breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                <button
                  onClick={() => navigate('/establishments-portfolio')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Icon name="LayoutGrid" size={14} />
                  Establecimientos
                </button>
                <Icon name="ChevronRight" size={14} className="text-muted-foreground/50" />
                <span className="text-foreground font-medium">Nuevo establecimiento</span>
              </nav>
              <h1 className="text-xl font-bold text-foreground">
                {formData?.businessName ? formData?.businessName : 'Nuevo establecimiento'}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">Completa los pasos para publicar tu ficha en PromoClub</p>
            </div>
            {!showSuccess && (
              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                    <Icon name="CheckCircle" size={14} /> Guardado
                  </span>
                )}
                <button
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 border border-border bg-card text-foreground text-sm font-medium rounded-xl hover:bg-muted transition-colors disabled:opacity-60"
                >
                  <Icon name="Save" size={15} />
                  Guardar borrador
                </button>
                <button
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-border bg-card text-foreground text-sm font-medium rounded-xl hover:bg-muted transition-colors"
                >
                  <Icon name="Eye" size={15} />
                  Vista previa
                </button>
              </div>
            )}
          </div>

          {/* Success screen */}
          {showSuccess ? (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <SuccessScreen
                formData={formData}
                onGoToPortfolio={() => navigate('/establishments-portfolio')}
                onGoToListing={() => navigate('/business-listings-management')}
              />
            </div>
          ) : (
            <>
              {/* Progress bar */}
              <div className="bg-card border border-border rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">Progreso del wizard</span>
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">{step?.group}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground hidden sm:block">Paso {currentStep + 1} de {WIZARD_STEPS?.length}</span>
                    <span className="text-sm font-bold text-primary">{progressPct}%</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-4">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {/* Step indicators */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {WIZARD_STEPS?.map((s, i) => {
                    const isCompleted = completedSteps?.has(s?.id);
                    const isCurrent = i === currentStep;
                    const isAccessible = i <= currentStep || isCompleted;
                    const hasSavedData = stepHasData(s?.id, formData);
                    return (
                      <React.Fragment key={s?.id}>
                        <button
                          onClick={() => handleStepClick(i)}
                          disabled={!isAccessible}
                          title={s?.label}
                          className={`flex flex-col items-center gap-1 min-w-[56px] p-2 rounded-xl transition-all relative ${
                            isCurrent
                              ? 'bg-primary/10 text-primary'
                              : isCompleted
                              ? 'text-green-600 hover:bg-green-50 cursor-pointer'
                              : isAccessible
                              ? 'text-muted-foreground hover:bg-muted cursor-pointer'
                              : 'text-muted-foreground/40 cursor-not-allowed'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 relative transition-all ${
                            isCurrent
                              ? 'bg-primary text-white shadow-sm'
                              : isCompleted
                              ? 'bg-green-500 text-white' :'bg-muted'
                          }`}>
                            {isCompleted && !isCurrent ? (
                              <Icon name="Check" size={14} className="text-white" />
                            ) : (
                              <Icon name={s?.icon} size={14} className={isCurrent ? 'text-white' : 'text-muted-foreground'} />
                            )}
                            {hasSavedData && !isCurrent && (
                              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-card rounded-full" />
                            )}
                          </div>
                          <span className="text-xs font-medium text-center leading-tight whitespace-nowrap">{s?.shortLabel}</span>
                        </button>
                        {i < WIZARD_STEPS?.length - 1 && (
                          <div className={`flex-1 h-0.5 min-w-[6px] rounded-full transition-colors ${
                            completedSteps?.has(s?.id) ? 'bg-green-400' : 'bg-border'
                          }`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Main content */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                {/* Step header */}
                <div className="border-b border-border px-6 py-4 bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm`}>
                      <Icon name={step?.icon} size={20} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-foreground">{step?.label}</h2>
                      <p className="text-xs text-muted-foreground">{step?.description}</p>
                    </div>
                  </div>
                </div>

                {/* Form content */}
                <div className="p-6">
                  {renderStepContent()}
                </div>

                {/* Navigation footer */}
                <div className="border-t border-border px-6 py-4 bg-muted/10 flex flex-col gap-2">
                  {saveError && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                      <Icon name="AlertCircle" size={14} />
                      {saveError}
                    </div>
                  )}
                  {Object.keys(validationErrors)?.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                      <Icon name="AlertCircle" size={14} />
                      Por favor completa los campos obligatorios marcados con * antes de continuar.
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={handleBack}
                      disabled={isFirstStep}
                      className="flex items-center gap-2 px-4 py-2.5 border border-border bg-card text-foreground text-sm font-medium rounded-xl hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Icon name="ChevronLeft" size={16} />
                      Anterior
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveProgress}
                        disabled={isSavingProgress}
                        className={`flex items-center gap-1.5 px-3 py-2.5 border rounded-xl text-sm font-medium transition-all ${
                          saveProgressSuccess
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-700' :'border-border bg-card text-foreground hover:bg-muted'
                        } disabled:opacity-60`}
                      >
                        {isSavingProgress ? (
                          <Icon name="Loader" size={14} className="animate-spin" />
                        ) : saveProgressSuccess ? (
                          <Icon name="CheckCircle" size={14} />
                        ) : (
                          <Icon name="CloudUpload" size={14} />
                        )}
                        <span className="hidden sm:inline">
                          {saveProgressSuccess ? 'Progreso guardado' : 'Guardar progreso'}
                        </span>
                      </button>

                      {isLastStep ? (
                        <button
                          onClick={handleSaveAndFinish}
                          disabled={isSaving}
                          className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
                        >
                          {isSaving ? (
                            <Icon name="Loader" size={16} className="animate-spin" />
                          ) : (
                            <Icon name="CheckCircle" size={16} />
                          )}
                          {isSaving ? 'Guardando...' : 'Finalizar y publicar'}
                        </button>
                      ) : (
                        <button
                          onClick={handleNext}
                          className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors"
                        >
                          Siguiente
                          <Icon name="ChevronRight" size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tip card */}
              <div className="mt-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Lightbulb" size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">Consejo</p>
                  <p className="text-xs text-blue-600 dark:text-blue-500 mt-0.5">
                    {STEP_TIPS?.[currentStep] || 'Completa todos los campos para maximizar la visibilidad de tu negocio.'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      {/* Live Preview Drawer */}
      <LivePreview
        formData={formData}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        activeTab="preview"
      />
      {/* Draft resume modal */}
      {showDraftModal && existingDraft && (
        <DraftResumeModal
          draft={existingDraft}
          onResume={handleResumeDraft}
          onStartFresh={handleStartFresh}
        />
      )}
    </div>
  );
};

export default BusinessListingWizard;
