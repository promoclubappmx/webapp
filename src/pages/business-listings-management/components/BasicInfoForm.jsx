import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import useCategorias from '../../../hooks/useCategorias';

const SECONDARY_TAGS = [
  { group: 'Ambiente', tags: ['Terraza','Romántico','Familiar','Pet-friendly','Íntimo','Moderno','Rústico','Al aire libre'] },
  { group: 'Servicio', tags: ['Delivery','Para llevar','Estacionamiento','WiFi','Reservaciones','Servicio a domicilio','24 horas'] },
  { group: 'Especialidad', tags: ['Orgánico','Vegano','Sin gluten','Coctelería','Brunch','Mariscos frescos','Horno de leña','Keto'] }
];

const ALL_TAGS = SECONDARY_TAGS?.flatMap(g => g?.tags);

// Category icons mapping
const CATEGORY_ICONS = {
  'Restaurantes y comida': { icon: 'UtensilsCrossed', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-800', emoji: '🍴' },
  'Bares y vida nocturna': { icon: 'Wine', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800', emoji: '🍸' },
  'Compras y retail': { icon: 'ShoppingBag', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', emoji: '🛍️' },
  'Salud y medicina': { icon: 'Heart', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800', emoji: '🏥' },
  'Belleza y cuidado personal': { icon: 'Sparkles', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-950/30', border: 'border-pink-200 dark:border-pink-800', emoji: '💅' },
  'Entretenimiento': { icon: 'Clapperboard', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200 dark:border-yellow-800', emoji: '🎬' },
  'Deporte y fitness': { icon: 'Dumbbell', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800', emoji: '💪' },
  'Servicios automotrices': { icon: 'Car', color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-950/30', border: 'border-slate-200 dark:border-slate-800', emoji: '🚗' },
  'Servicios profesionales': { icon: 'Briefcase', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/30', border: 'border-indigo-200 dark:border-indigo-800', emoji: '💼' },
  'Turismo y hospedaje': { icon: 'MapPin', color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-950/30', border: 'border-teal-200 dark:border-teal-800', emoji: '🏨' },
  'Educación': { icon: 'GraduationCap', color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/30', border: 'border-cyan-200 dark:border-cyan-800', emoji: '🎓' },
  'Mascotas': { icon: 'PawPrint', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', emoji: '🐾' },
  'Servicios generales': { icon: 'Wrench', color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-950/30', border: 'border-gray-200 dark:border-gray-800', emoji: '🔧' },
};

const DEFAULT_ICON = { icon: 'Store', color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/20', emoji: '🏪' };

// Subcategory icons mapping — contextual icons per subcategory name
const SUBCATEGORY_ICONS = {
  // Restaurantes
  'Comida mexicana': { icon: 'UtensilsCrossed', color: 'text-orange-500' },
  'Comida rápida': { icon: 'Zap', color: 'text-yellow-500' },
  'Mariscos': { icon: 'Fish', color: 'text-blue-500' },
  'Panadería y pastelería': { icon: 'Cookie', color: 'text-amber-500' },
  'Café y bebidas': { icon: 'Coffee', color: 'text-brown-500' },
  'Comida internacional': { icon: 'Globe', color: 'text-teal-500' },
  'Comida saludable': { icon: 'Leaf', color: 'text-green-500' },
  'Postres y helados': { icon: 'IceCream', color: 'text-pink-500' },
  // Bares
  'Bar de cócteles': { icon: 'Wine', color: 'text-purple-500' },
  'Cantina': { icon: 'Beer', color: 'text-amber-600' },
  'Club nocturno': { icon: 'Music', color: 'text-violet-500' },
  'Karaoke': { icon: 'Mic', color: 'text-pink-500' },
  // Retail
  'Moda y ropa': { icon: 'ShoppingBag', color: 'text-blue-500' },
  'Electrónica': { icon: 'Smartphone', color: 'text-slate-500' },
  'Hogar y decoración': { icon: 'Home', color: 'text-amber-500' },
  'Libros y papelería': { icon: 'BookOpen', color: 'text-cyan-500' },
  'Joyería y accesorios': { icon: 'Gem', color: 'text-pink-500' },
  'Farmacia': { icon: 'Pill', color: 'text-red-500' },
  'Supermercado': { icon: 'ShoppingCart', color: 'text-green-500' },
  // Salud
  'Medicina general': { icon: 'Stethoscope', color: 'text-red-500' },
  'Odontología': { icon: 'Smile', color: 'text-blue-500' },
  'Psicología': { icon: 'Brain', color: 'text-purple-500' },
  'Nutrición': { icon: 'Apple', color: 'text-green-500' },
  'Fisioterapia': { icon: 'Activity', color: 'text-teal-500' },
  'Laboratorio': { icon: 'FlaskConical', color: 'text-indigo-500' },
  // Belleza
  'Salón de belleza': { icon: 'Sparkles', color: 'text-pink-500' },
  'Barbería': { icon: 'Scissors', color: 'text-slate-500' },
  'Spa': { icon: 'Flower', color: 'text-rose-500' },
  'Uñas y estética': { icon: 'Star', color: 'text-fuchsia-500' },
  // Deporte
  'Gimnasio': { icon: 'Dumbbell', color: 'text-green-500' },
  'Yoga y meditación': { icon: 'Wind', color: 'text-teal-500' },
  'Artes marciales': { icon: 'Shield', color: 'text-red-500' },
  'Natación': { icon: 'Waves', color: 'text-blue-500' },
  // Automotriz
  'Taller mecánico': { icon: 'Wrench', color: 'text-slate-500' },
  'Lavado de autos': { icon: 'Droplets', color: 'text-blue-500' },
  'Refaccionaria': { icon: 'Settings', color: 'text-gray-500' },
  // Servicios
  'Contabilidad': { icon: 'Calculator', color: 'text-indigo-500' },
  'Legal': { icon: 'Scale', color: 'text-slate-500' },
  'Diseño': { icon: 'Palette', color: 'text-violet-500' },
  'Tecnología': { icon: 'Code', color: 'text-blue-500' },
  // Turismo
  'Hotel': { icon: 'Building', color: 'text-teal-500' },
  'Hostal': { icon: 'BedDouble', color: 'text-amber-500' },
  'Tours': { icon: 'Map', color: 'text-green-500' },
  // Educación
  'Escuela': { icon: 'GraduationCap', color: 'text-cyan-500' },
  'Idiomas': { icon: 'Languages', color: 'text-blue-500' },
  'Música': { icon: 'Music', color: 'text-purple-500' },
  // Mascotas
  'Veterinaria': { icon: 'PawPrint', color: 'text-amber-500' },
  'Grooming': { icon: 'Scissors', color: 'text-pink-500' },
  'Tienda de mascotas': { icon: 'Heart', color: 'text-red-500' },
};

const DEFAULT_SUBCATEGORY_ICON = { icon: 'Tag', color: 'text-primary' };

const getSubcategoryIcon = (nombre) => {
  if (!nombre) return DEFAULT_SUBCATEGORY_ICON;
  const key = Object.keys(SUBCATEGORY_ICONS)?.find(k => nombre?.toLowerCase()?.includes(k?.toLowerCase()) || k?.toLowerCase()?.includes(nombre?.toLowerCase()));
  return key ? SUBCATEGORY_ICONS?.[key] : DEFAULT_SUBCATEGORY_ICON;
};

// Emoji map for tipo de establecimiento based on category context
const TIPO_EMOJIS = {
  // Restaurantes
  'Restaurante': '🍽️', 'Taquería': '🌮', 'Pizzería': '🍕', 'Sushi': '🍣', 'Hamburguesas': '🍔',
  'Mariscos': '🦞', 'Panadería': '🥐', 'Pastelería': '🎂', 'Café': '☕', 'Heladería': '🍦',
  'Comida rápida': '🍟', 'Buffet': '🍱', 'Fonda': '🥘', 'Cocina mexicana': '🇲🇽',
  // Bares
  'Bar': '🍺', 'Cantina': '🥃', 'Club nocturno': '🎵', 'Karaoke': '🎤', 'Lounge': '🛋️',
  // Retail
  'Tienda de ropa': '👗', 'Zapatería': '👟', 'Joyería': '💍', 'Electrónica': '📱', 'Librería': '📚',
  'Farmacia': '💊', 'Supermercado': '🛒', 'Ferretería': '🔨', 'Floristería': '💐',
  // Salud
  'Clínica': '🏥', 'Dentista': '🦷', 'Óptica': '👓', 'Laboratorio': '🔬', 'Psicología': '🧠',
  'Fisioterapia': '🏃', 'Nutrición': '🥗', 'Medicina general': '👨‍⚕️',
  // Belleza
  'Salón de belleza': '💇', 'Barbería': '✂️', 'Spa': '🧖', 'Uñas': '💅', 'Estética': '🪞',
  // Deporte
  'Gimnasio': '🏋️', 'Yoga': '🧘', 'Natación': '🏊', 'Artes marciales': '🥋', 'Crossfit': '⚡',
  // Automotriz
  'Taller mecánico': '🔧', 'Lavado de autos': '🚿', 'Refaccionaria': '⚙️', 'Llantas': '🛞',
  // Servicios
  'Notaría': '📜', 'Contador': '📊', 'Abogado': '⚖️', 'Arquitecto': '📐', 'Diseño': '🎨',
  // Default
  'default': '🏪',
};

const getTipoEmoji = (nombre) => {
  if (!nombre) return '🏪';
  const key = Object.keys(TIPO_EMOJIS)?.find(k => nombre?.toLowerCase()?.includes(k?.toLowerCase()));
  return key ? TIPO_EMOJIS?.[key] : TIPO_EMOJIS?.['default'];
};

const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: 'Instagram', placeholder: 'https://instagram.com/tu-negocio', color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-300', activeBg: 'bg-pink-600' },
  { key: 'facebook', label: 'Facebook', icon: 'Facebook', placeholder: 'https://facebook.com/tu-negocio', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-300', activeBg: 'bg-blue-600' },
  { key: 'tiktok', label: 'TikTok', icon: 'Music', placeholder: 'https://tiktok.com/@tu-negocio', color: 'text-gray-900', bg: 'bg-gray-50', border: 'border-gray-300', activeBg: 'bg-gray-900' },
  { key: 'twitter', label: 'X / Twitter', icon: 'Twitter', placeholder: 'https://x.com/tu-negocio', color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-300', activeBg: 'bg-sky-500' },
  { key: 'youtube', label: 'YouTube', icon: 'Youtube', placeholder: 'https://youtube.com/@tu-negocio', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-300', activeBg: 'bg-red-600' },
  { key: 'linkedin', label: 'LinkedIn', icon: 'Linkedin', placeholder: 'https://linkedin.com/company/tu-negocio', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-400', activeBg: 'bg-blue-700' },
  { key: 'whatsapp', label: 'WhatsApp', icon: 'MessageCircle', placeholder: 'https://wa.me/521234567890', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-300', activeBg: 'bg-green-600' },
  { key: 'pinterest', label: 'Pinterest', icon: 'Pin', placeholder: 'https://pinterest.com/tu-negocio', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-300', activeBg: 'bg-red-500' },
  { key: 'snapchat', label: 'Snapchat', icon: 'Camera', placeholder: 'https://snapchat.com/add/tu-negocio', color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-300', activeBg: 'bg-yellow-500' },
  { key: 'threads', label: 'Threads', icon: 'AtSign', placeholder: 'https://threads.net/@tu-negocio', color: 'text-gray-800', bg: 'bg-gray-50', border: 'border-gray-300', activeBg: 'bg-gray-800' },
];

const BasicInfoForm = ({ formData, onChange, errors }) => {
  const [tagInput, setTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [sameWhatsApp, setSameWhatsApp] = useState(false);
  const [categoriaSearch, setCategoriaSearch] = useState('');
  const [tipoSearch, setTipoSearch] = useState('');
  const [activeSocialKey, setActiveSocialKey] = useState(null);

  const { 
    categorias, 
    subcategorias, 
    tipos,
    loadingCategorias,
    loadingSubcategorias,
    loadingTipos
  } = useCategorias(formData?.categoria_id || null, formData?.subcategoria_id || null);

  const selectedTags = formData?.secondaryTags || [];

  const handleChange = (field, value) => onChange(field, value);

  const handleNameChange = (value) => {
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/u;
    if (emojiRegex?.test(value)) return;
    onChange('businessName', value);
    const slug = value?.toLowerCase()?.normalize('NFD')?.replace(/[\u0300-\u036f]/g,'')?.replace(/[^a-z0-9\s-]/g,'')?.replace(/[\s_-]+/g,'-')?.replace(/^-+|-+$/g,'');
    onChange('slug', slug);
  };

  const isAllCaps = (str) => str && str?.length > 3 && str === str?.toUpperCase() && /[A-Z]/?.test(str);

  const handleTagInput = (val) => {
    setTagInput(val);
    if (val?.length > 0) {
      const filtered = ALL_TAGS?.filter(t => t?.toLowerCase()?.includes(val?.toLowerCase()) && !selectedTags?.includes(t));
      setTagSuggestions(filtered?.slice(0, 6));
    } else {
      setTagSuggestions([]);
    }
  };

  const addTag = (tag) => {
    if (selectedTags?.length >= 3) return;
    onChange('secondaryTags', [...selectedTags, tag]);
    setTagInput('');
    setTagSuggestions([]);
  };

  const removeTag = (tag) => {
    onChange('secondaryTags', selectedTags?.filter(t => t !== tag));
  };

  const handleSameWhatsApp = (checked) => {
    setSameWhatsApp(checked);
    if (checked) onChange('whatsapp', formData?.phone || '');
    else onChange('whatsapp', '');
  };

  const handleCategoriaChange = (categoriaId) => {
    onChange('categoria_id', categoriaId);
    onChange('subcategoria_id', '');
    onChange('tipo_establecimiento_id', '');
    setCategoriaSearch('');
    setTipoSearch('');
  };

  const handleSubcategoriaChange = (subcategoriaId) => {
    onChange('subcategoria_id', subcategoriaId);
    onChange('tipo_establecimiento_id', '');
    setTipoSearch('');
  };

  // Reset from a completed step
  const handleResetFromStep = (step) => {
    if (step === 1) {
      onChange('categoria_id', '');
      onChange('subcategoria_id', '');
      onChange('tipo_establecimiento_id', '');
      setCategoriaSearch('');
      setTipoSearch('');
    } else if (step === 2) {
      onChange('subcategoria_id', '');
      onChange('tipo_establecimiento_id', '');
      setTipoSearch('');
    }
  };

  // Filtered categorias based on search
  const filteredCategorias = useMemo(() => {
    if (!categoriaSearch?.trim()) return categorias;
    return categorias?.filter(c => c?.nombre?.toLowerCase()?.includes(categoriaSearch?.toLowerCase()));
  }, [categorias, categoriaSearch]);

  // Filtered tipos based on search
  const filteredTipos = useMemo(() => {
    if (!tipoSearch?.trim()) return tipos;
    return tipos?.filter(t => t?.nombre?.toLowerCase()?.includes(tipoSearch?.toLowerCase()));
  }, [tipos, tipoSearch]);

  // Selected names for breadcrumb display
  const selectedCategoria = categorias?.find(c => c?.id === formData?.categoria_id);
  const selectedSubcategoria = subcategorias?.find(s => s?.id === formData?.subcategoria_id);
  const selectedTipo = tipos?.find(t => t?.id === formData?.tipo_establecimiento_id);

  const getCategoryStyle = (nombre) => CATEGORY_ICONS?.[nombre] || DEFAULT_ICON;

  // Get the parent category style for use in tipo cards
  const parentCategoryStyle = selectedCategoria ? getCategoryStyle(selectedCategoria?.nombre) : DEFAULT_ICON;

  // Determine current active step
  const currentStep = !formData?.categoria_id ? 1 : !formData?.subcategoria_id ? 2 : !formData?.tipo_establecimiento_id ? 3 : 'done';

  return (
    <div className="space-y-8">
      {/* Sección Tu Negocio */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="text-base font-semibold text-foreground">Tu Negocio</h3>
        </div>
        <div className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Nombre del negocio <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={60}
                value={formData?.businessName || ''}
                onChange={e => handleNameChange(e?.target?.value)}
                placeholder='Ej: Café Roma'
                className={`w-full px-3 py-2 pr-16 border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                  errors?.businessName ? 'border-destructive' : 'border-border'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {(formData?.businessName || '')?.length}/60
              </span>
            </div>
            {isAllCaps(formData?.businessName) && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <Icon name="AlertTriangle" size={12} /> Sugerencia: usa formato título (Ej: Café Roma, no CAFÉ ROMA)
              </p>
            )}
            {errors?.businessName && <p className="text-xs text-destructive mt-1">{errors?.businessName}</p>}
            <p className="text-xs text-muted-foreground mt-1">El nombre comercial tal como lo conocen tus clientes. No uses razón social.</p>
          </div>

          {/* Descripción corta */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-foreground">
                Descripción corta <span className="text-destructive">*</span>
              </label>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Visible en búsquedas y mapa</span>
            </div>
            <div className="relative">
              <input
                type="text"
                maxLength={120}
                value={formData?.shortDescription || ''}
                onChange={e => handleChange('shortDescription', e?.target?.value)}
                placeholder='Ej: El mejor café de especialidad en el Centro Histórico'
                className={`w-full px-3 py-2 pr-16 border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                  errors?.shortDescription ? 'border-destructive' : 'border-border'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {(formData?.shortDescription || '')?.length}/120
              </span>
            </div>
            {errors?.shortDescription && <p className="text-xs text-destructive mt-1">{errors?.shortDescription}</p>}
          </div>

          {/* Descripción larga */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-foreground">Descripción larga</label>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Visible en tu ficha completa</span>
            </div>
            <div className="relative">
              <textarea
                maxLength={1000}
                rows={5}
                value={formData?.longDescription || ''}
                onChange={e => handleChange('longDescription', e?.target?.value)}
                placeholder="Cuéntale a tus clientes qué hace especial a tu negocio. ¿Desde cuándo existen? ¿Cuál es tu especialidad? ¿Qué experiencia pueden esperar?"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <span className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                {(formData?.longDescription || '')?.length}/1000
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Solo texto plano. No se permite HTML, negritas ni links.</p>
          </div>

          {/* Nombre de sucursal */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Nombre de sucursal <span className="text-muted-foreground text-xs">(opcional)</span>
            </label>
            <div className="relative">
              <Icon name="GitBranch" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                maxLength={80}
                value={formData?.branchName || ''}
                onChange={e => handleChange('branchName', e?.target?.value)}
                placeholder='Ej: Sucursal Norte, Plaza Centro, Matriz'
                className="w-full pl-9 pr-16 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {(formData?.branchName || '')?.length}/80
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
              <Icon name="Info" size={11} className="mt-0.5 flex-shrink-0 text-primary/60" />
              Sirve para distinguir entre sucursales del mismo negocio (ej. Sucursal Norte, Plaza Centro).
            </p>
          </div>
        </div>
      </div>
      {/* ===== Sección Categoría - 3-Step Wizard ===== */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="text-base font-semibold text-foreground">Categoría</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4 ml-3">Clasifica tu negocio para que los clientes te encuentren fácilmente.</p>

        {/* Wizard Step Indicators */}
        <div className="flex items-center gap-0 mb-5">
          {[
            { step: 1, label: 'Categoría', done: !!formData?.categoria_id },
            { step: 2, label: 'Subcategoría', done: !!formData?.subcategoria_id },
            { step: 3, label: 'Tipo', done: !!formData?.tipo_establecimiento_id },
          ]?.map((s, idx) => {
            const isActive = currentStep === s?.step;
            const isDone = s?.done;
            const isReachable = s?.step === 1 || (s?.step === 2 && !!formData?.categoria_id) || (s?.step === 3 && !!formData?.subcategoria_id);
            return (
              <React.Fragment key={s?.step}>
                <button
                  type="button"
                  disabled={!isReachable && !isDone}
                  onClick={() => isDone && s?.step < 3 ? handleResetFromStep(s?.step) : null}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    isDone ? 'cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/20' : isActive ?'cursor-default' : 'cursor-not-allowed opacity-40'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                    isDone ? 'bg-emerald-500 text-white' : isActive ?'bg-primary text-white': 'bg-muted text-muted-foreground'
                  }`}>
                    {isDone ? <Icon name="Check" size={11} /> : s?.step}
                  </span>
                  <span className={`text-xs font-medium hidden sm:block ${
                    isDone ? 'text-emerald-600' : isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}>{s?.label}</span>
                  {isDone && s?.step < 3 && (
                    <Icon name="Pencil" size={10} className="text-emerald-500 hidden sm:block" />
                  )}
                </button>
                {idx < 2 && (
                  <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${
                    (idx === 0 && formData?.categoria_id) || (idx === 1 && formData?.subcategoria_id)
                      ? 'bg-emerald-400' : 'bg-border'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="space-y-0">
          {/* STEP 1: Categoría - Card Grid with Search */}
          {(!formData?.categoria_id || currentStep === 1) && (
            <div className="border border-border rounded-xl p-4 bg-card">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">1</span>
                <label className="text-sm font-semibold text-foreground">
                  Selecciona la categoría principal <span className="text-destructive">*</span>
                </label>
              </div>

              {loadingCategorias ? (
                <div className="flex items-center gap-2 py-4 text-muted-foreground text-sm">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Cargando categorías...
                </div>
              ) : (
                <>
                  {/* Search input */}
                  <div className="relative mb-3">
                    <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={categoriaSearch}
                      onChange={e => setCategoriaSearch(e?.target?.value)}
                      placeholder="Buscar categoría..."
                      className="w-full pl-8 pr-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    {categoriaSearch && (
                      <button onClick={() => setCategoriaSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        <Icon name="X" size={12} />
                      </button>
                    )}
                  </div>

                  {/* Category cards grid — all same size */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {filteredCategorias?.map(cat => {
                      const style = getCategoryStyle(cat?.nombre);
                      const isSelected = formData?.categoria_id === cat?.id;
                      return (
                        <button
                          key={cat?.id}
                          type="button"
                          onClick={() => handleCategoriaChange(cat?.id)}
                          className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-center cursor-pointer hover:shadow-sm h-24 ${
                            isSelected
                              ? `${style?.bg} ${style?.border} shadow-sm ring-2 ring-primary/30`
                              : 'border-border bg-card hover:border-primary/30 hover:bg-muted/30'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? style?.bg : 'bg-muted'}`}>
                            <Icon name={style?.icon} size={20} className={isSelected ? style?.color : 'text-muted-foreground'} />
                          </div>
                          <span className={`text-xs font-medium leading-tight line-clamp-2 ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {cat?.nombre}
                          </span>
                        </button>
                      );
                    })}
                    {filteredCategorias?.length === 0 && (
                      <div className="col-span-full py-6 text-center text-sm text-muted-foreground">
                        <Icon name="SearchX" size={20} className="mx-auto mb-1 opacity-50" />
                        No se encontraron categorías para "{categoriaSearch}"
                      </div>
                    )}
                  </div>
                </>
              )}
              {errors?.categoria_id && <p className="text-xs text-destructive mt-2 flex items-center gap-1"><Icon name="AlertCircle" size={12} />{errors?.categoria_id}</p>}
            </div>
          )}

          {/* Completed Step 1 summary (when moving to step 2+) */}
          {formData?.categoria_id && currentStep !== 1 && (
            <div
              className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl mb-3 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-950/30 transition-colors"
              onClick={() => handleResetFromStep(1)}
            >
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                <Icon name="Check" size={11} />
              </span>
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Categoría:</span>
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">{selectedCategoria?.nombre}</span>
              </div>
              <span className="text-xs text-emerald-600 flex items-center gap-1">
                <Icon name="Pencil" size={11} /> Cambiar
              </span>
            </div>
          )}

          {/* STEP 2: Subcategoría - Card Grid (same size/structure as Step 1) */}
          {formData?.categoria_id && (!formData?.subcategoria_id || currentStep === 2) && (
            <div className="border border-border rounded-xl p-4 bg-card mt-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">2</span>
                <label className="text-sm font-semibold text-foreground">
                  Selecciona la subcategoría <span className="text-destructive">*</span>
                </label>
              </div>

              {loadingSubcategorias ? (
                <div className="flex items-center gap-2 py-3 text-muted-foreground text-sm">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Cargando subcategorías...
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {subcategorias?.map(sub => {
                    const isSelected = formData?.subcategoria_id === sub?.id;
                    const subIcon = getSubcategoryIcon(sub?.nombre);
                    return (
                      <button
                        key={sub?.id}
                        type="button"
                        onClick={() => handleSubcategoriaChange(sub?.id)}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-center cursor-pointer hover:shadow-sm h-24 ${
                          isSelected
                            ? 'bg-primary/5 border-primary shadow-sm ring-2 ring-primary/30'
                            : 'border-border bg-card hover:border-primary/30 hover:bg-muted/30'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-primary/10' : 'bg-muted'}`}>
                          <Icon name={subIcon?.icon} size={20} className={isSelected ? subIcon?.color : 'text-muted-foreground'} />
                        </div>
                        <span className={`text-xs font-medium leading-tight line-clamp-2 ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {sub?.nombre}
                        </span>
                      </button>
                    );
                  })}
                  {subcategorias?.length === 0 && (
                    <div className="col-span-full py-6 text-center text-sm text-muted-foreground">
                      <Icon name="FolderOpen" size={20} className="mx-auto mb-1 opacity-50" />
                      No hay subcategorías disponibles
                    </div>
                  )}
                </div>
              )}
              {errors?.subcategoria_id && <p className="text-xs text-destructive mt-2 flex items-center gap-1"><Icon name="AlertCircle" size={12} />{errors?.subcategoria_id}</p>}
            </div>
          )}

          {/* Completed Step 2 summary */}
          {formData?.subcategoria_id && currentStep !== 2 && currentStep !== 1 && (
            <div
              className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl mb-3 mt-3 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-950/30 transition-colors"
              onClick={() => handleResetFromStep(2)}
            >
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                <Icon name="Check" size={11} />
              </span>
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Subcategoría:</span>
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">{selectedSubcategoria?.nombre}</span>
              </div>
              <span className="text-xs text-emerald-600 flex items-center gap-1">
                <Icon name="Pencil" size={11} /> Cambiar
              </span>
            </div>
          )}

          {/* STEP 3: Tipo de establecimiento - Card Grid (same size/structure as Step 1, using parent category icon) */}
          {formData?.subcategoria_id && (
            <div className="border border-border rounded-xl p-4 bg-card mt-3">
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${formData?.tipo_establecimiento_id ? 'bg-emerald-500 text-white' : 'bg-primary text-white'}`}>
                  {formData?.tipo_establecimiento_id ? <Icon name="Check" size={11} /> : '3'}
                </span>
                <label className="text-sm font-semibold text-foreground">
                  Tipo de establecimiento <span className="text-destructive">*</span>
                </label>
              </div>

              {loadingTipos ? (
                <div className="flex items-center gap-2 py-3 text-muted-foreground text-sm">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Cargando tipos...
                </div>
              ) : (
                <>
                  {tipos?.length > 6 && (
                    <div className="relative mb-3">
                      <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={tipoSearch}
                        onChange={e => setTipoSearch(e?.target?.value)}
                        placeholder="Buscar tipo de establecimiento..."
                        className="w-full pl-8 pr-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      {tipoSearch && (
                        <button onClick={() => setTipoSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          <Icon name="X" size={12} />
                        </button>
                      )}
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {filteredTipos?.map(tipo => {
                      const isSelected = formData?.tipo_establecimiento_id === tipo?.id;
                      return (
                        <button
                          key={tipo?.id}
                          type="button"
                          onClick={() => handleChange('tipo_establecimiento_id', tipo?.id)}
                          className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-center cursor-pointer hover:shadow-sm h-24 ${
                            isSelected
                              ? `${parentCategoryStyle?.bg} ${parentCategoryStyle?.border} shadow-sm ring-2 ring-primary/30`
                              : 'border-border bg-card hover:border-primary/30 hover:bg-muted/30'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? parentCategoryStyle?.bg : 'bg-muted'}`}>
                            <Icon name={parentCategoryStyle?.icon} size={20} className={isSelected ? parentCategoryStyle?.color : 'text-muted-foreground'} />
                          </div>
                          <span className={`text-xs font-medium leading-tight line-clamp-2 ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {tipo?.nombre}
                          </span>
                        </button>
                      );
                    })}
                    {filteredTipos?.length === 0 && tipoSearch && (
                      <div className="col-span-full py-4 text-center text-sm text-muted-foreground">
                        <Icon name="SearchX" size={20} className="mx-auto mb-1 opacity-50" />
                        No se encontraron tipos para "{tipoSearch}"
                      </div>
                    )}
                    {filteredTipos?.length === 0 && !tipoSearch && (
                      <div className="col-span-full py-4 text-center text-sm text-muted-foreground">
                        <Icon name="FolderOpen" size={20} className="mx-auto mb-1 opacity-50" />
                        No hay tipos disponibles
                      </div>
                    )}
                  </div>
                </>
              )}
              {errors?.tipo_establecimiento_id && <p className="text-xs text-destructive mt-2 flex items-center gap-1"><Icon name="AlertCircle" size={12} />{errors?.tipo_establecimiento_id}</p>}

              {/* Completion banner */}
              {formData?.tipo_establecimiento_id && (
                <div className="mt-3 flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <Icon name="CheckCircle" size={16} className="text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">¡Clasificación completa!</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500">
                      {selectedCategoria?.nombre} → {selectedSubcategoria?.nombre} → {selectedTipo?.nombre}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Sección Contacto */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="text-base font-semibold text-foreground">Contacto</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Teléfono
              <span className="text-muted-foreground text-xs ml-1">(recomendado)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🇲🇽</span>
              <input
                type="tel"
                maxLength={10}
                value={formData?.phone || ''}
                onChange={e => { const v = e?.target?.value?.replace(/\D/g,''); handleChange('phone', v); if(sameWhatsApp) handleChange('whatsapp', v); }}
                placeholder="10 dígitos"
                className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Este teléfono es visible para los usuarios de PromoClub.</p>
          </div>

          {/* WhatsApp */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-foreground">
                WhatsApp <span className="text-muted-foreground text-xs">(opcional)</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                <input type="checkbox" checked={sameWhatsApp} onChange={e => handleSameWhatsApp(e?.target?.checked)}
                  className="w-3 h-3 rounded" />
                Mismo que el principal
              </label>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 text-sm">💬</span>
              <input
                type="tel"
                maxLength={10}
                value={formData?.whatsapp || ''}
                onChange={e => handleChange('whatsapp', e?.target?.value?.replace(/\D/g,''))}
                disabled={sameWhatsApp}
                placeholder="10 dígitos"
                className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
              />
            </div>
            {formData?.whatsapp && (
              <div className="mt-2">
                <label className="block text-xs font-medium text-foreground mb-1">Mensaje pre-llenado de WhatsApp</label>
                <input
                  type="text"
                  value={formData?.whatsappMessage || 'Hola, los encontré en PromoClub. Me gustaría...'}
                  onChange={e => handleChange('whatsappMessage', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Email de contacto <span className="text-muted-foreground text-xs">(opcional)</span>
            </label>
            <input
              type="email"
              value={formData?.contactEmail || ''}
              onChange={e => handleChange('contactEmail', e?.target?.value)}
              placeholder="contacto@minegocio.com"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Sitio web */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Sitio web <span className="text-muted-foreground text-xs">(opcional)</span>
            </label>
            <input
              type="url"
              value={formData?.website || ''}
              onChange={e => handleChange('website', e?.target?.value)}
              placeholder="https://www.minegocio.com"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Redes sociales */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-foreground">Redes sociales</label>
            {(() => {
              const socialLinks = formData?.socialLinks || {};
              const count = Object.values(socialLinks)?.filter(v => v?.trim())?.length;
              return count > 0 ? (
                <span className="text-xs font-medium px-2.5 py-1 bg-primary/10 text-primary rounded-full">{count} conectadas</span>
              ) : null;
            })()}
          </div>
          <p className="text-xs text-muted-foreground mb-3">Toca el ícono de la red social para agregar su URL.</p>
          {/* Icon grid */}
          <div className="flex flex-wrap gap-2 mb-4">
            {SOCIAL_PLATFORMS?.map(platform => {
              const socialLinks = formData?.socialLinks || {};
              const hasValue = !!(socialLinks?.[platform?.key]?.trim());
              const isActive = activeSocialKey === platform?.key;
              return (
                <button
                  key={platform?.key}
                  type="button"
                  title={platform?.label}
                  onClick={() => setActiveSocialKey(isActive ? null : platform?.key)}
                  className={`relative w-11 h-11 rounded-xl border-2 flex items-center justify-center transition-all shadow-sm hover:scale-105 ${
                    isActive
                      ? `${platform?.activeBg} border-transparent text-white shadow-md`
                      : hasValue
                      ? `${platform?.bg} ${platform?.border} ${platform?.color}`
                      : 'bg-card border-border text-muted-foreground hover:border-primary/30 hover:bg-muted/30'
                  }`}
                >
                  <Icon name={platform?.icon} size={18} />
                  {hasValue && !isActive && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-card rounded-full flex items-center justify-center">
                      <Icon name="Check" size={8} className="text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {/* Inline URL input for selected platform */}
          {activeSocialKey && (() => {
            const platform = SOCIAL_PLATFORMS?.find(p => p?.key === activeSocialKey);
            if (!platform) return null;
            const socialLinks = formData?.socialLinks || {};
            const updateSocialLink = (key, value) => {
              onChange('socialLinks', { ...socialLinks, [key]: value });
            };
            return (
              <div className={`border-2 ${platform?.border} rounded-xl p-4 ${platform?.bg} transition-all`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg ${platform?.activeBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon name={platform?.icon} size={14} className="text-white" />
                  </div>
                  <span className={`text-sm font-semibold ${platform?.color}`}>{platform?.label}</span>
                  {socialLinks?.[platform?.key] && (
                    <a
                      href={socialLinks?.[platform?.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto p-1.5 border border-border rounded-lg text-muted-foreground hover:text-primary transition-colors bg-white"
                    >
                      <Icon name="ExternalLink" size={13} />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveSocialKey(null)}
                    className="ml-auto p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    autoFocus
                    value={socialLinks?.[platform?.key] || ''}
                    onChange={e => updateSocialLink(platform?.key, e?.target?.value)}
                    placeholder={platform?.placeholder}
                    className="flex-1 px-3 py-2 border border-border rounded-xl bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  {socialLinks?.[platform?.key] && (
                    <button
                      type="button"
                      onClick={() => { updateSocialLink(platform?.key, ''); }}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors border border-border rounded-xl bg-white"
                    >
                      <Icon name="Trash2" size={14} />
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">Pega la URL completa de tu perfil en {platform?.label}</p>
              </div>
            );
          })()}
          {/* Connected networks preview */}
          {(() => {
            const socialLinks = formData?.socialLinks || {};
            const filledPlatforms = SOCIAL_PLATFORMS?.filter(p => socialLinks?.[p?.key]?.trim());
            if (filledPlatforms?.length === 0) return null;
            return (
              <div className="mt-3 p-4 border border-border rounded-xl bg-muted/20">
                <p className="text-xs font-medium text-foreground mb-3">Vista previa en tu ficha pública:</p>
                <div className="flex flex-wrap gap-2">
                  {filledPlatforms?.map(platform => (
                    <a
                      key={platform?.key}
                      href={socialLinks?.[platform?.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border rounded-full text-xs font-medium hover:shadow-sm transition-all ${platform?.color}`}
                    >
                      <Icon name={platform?.icon} size={13} />
                      {platform?.label}
                    </a>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default BasicInfoForm;