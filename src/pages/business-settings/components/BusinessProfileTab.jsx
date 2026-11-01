import React, { useState, useEffect, useMemo } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import FileUpload from '../../../components/ui/FileUpload';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { validateImageFile, fileToDataURL } from '../../../utils/fileUtils';
import useCategorias from '../../../hooks/useCategorias';

// ─── Category icons mapping ──────────────────────────────────────────────────
const CATEGORY_ICONS = {
  'Restaurantes y comida': { icon: 'UtensilsCrossed', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
  'Bares y vida nocturna': { icon: 'Wine', color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
  'Compras y retail': { icon: 'ShoppingBag', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
  'Salud y medicina': { icon: 'Heart', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
  'Belleza y cuidado personal': { icon: 'Sparkles', color: 'text-pink-500', bg: 'bg-pink-50', border: 'border-pink-200' },
  'Entretenimiento': { icon: 'Film', color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  'Deporte y fitness': { icon: 'Dumbbell', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
  'Servicios automotrices': { icon: 'Car', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
  'Servicios profesionales': { icon: 'Briefcase', color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  'Turismo y hospedaje': { icon: 'MapPin', color: 'text-teal-500', bg: 'bg-teal-50', border: 'border-teal-200' },
  'Educación': { icon: 'GraduationCap', color: 'text-cyan-500', bg: 'bg-cyan-50', border: 'border-cyan-200' },
  'Mascotas': { icon: 'PawPrint', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
  'Servicios generales': { icon: 'Wrench', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' },
};
const DEFAULT_ICON = { icon: 'Store', color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/20' };

const SUBCATEGORY_ICONS = {
  'Comida mexicana': { icon: 'UtensilsCrossed', color: 'text-orange-500' },
  'Comida rápida': { icon: 'Zap', color: 'text-yellow-500' },
  'Mariscos': { icon: 'Fish', color: 'text-blue-500' },
  'Panadería y pastelería': { icon: 'Cookie', color: 'text-amber-500' },
  'Café y bebidas': { icon: 'Coffee', color: 'text-amber-700' },
  'Comida internacional': { icon: 'Globe', color: 'text-teal-500' },
  'Comida saludable': { icon: 'Leaf', color: 'text-green-500' },
  'Postres y helados': { icon: 'IceCream', color: 'text-pink-500' },
  'Bar de cócteles': { icon: 'Wine', color: 'text-purple-500' },
  'Cantina': { icon: 'Beer', color: 'text-amber-600' },
  'Club nocturno': { icon: 'Music', color: 'text-violet-500' },
  'Karaoke': { icon: 'Mic', color: 'text-pink-500' },
  'Moda y ropa': { icon: 'ShoppingBag', color: 'text-blue-500' },
  'Electrónica': { icon: 'Smartphone', color: 'text-slate-500' },
  'Hogar y decoración': { icon: 'Home', color: 'text-amber-500' },
  'Farmacia': { icon: 'Pill', color: 'text-red-500' },
  'Supermercado': { icon: 'ShoppingCart', color: 'text-green-500' },
  'Medicina general': { icon: 'Stethoscope', color: 'text-red-500' },
  'Odontología': { icon: 'Smile', color: 'text-blue-500' },
  'Psicología': { icon: 'Brain', color: 'text-purple-500' },
  'Nutrición': { icon: 'Apple', color: 'text-green-500' },
  'Fisioterapia': { icon: 'Activity', color: 'text-teal-500' },
  'Laboratorio': { icon: 'FlaskConical', color: 'text-indigo-500' },
  'Salón de belleza': { icon: 'Sparkles', color: 'text-pink-500' },
  'Barbería': { icon: 'Scissors', color: 'text-slate-500' },
  'Spa': { icon: 'Flower', color: 'text-rose-500' },
  'Uñas y estética': { icon: 'Star', color: 'text-fuchsia-500' },
  'Gimnasio': { icon: 'Dumbbell', color: 'text-green-500' },
  'Yoga y meditación': { icon: 'Wind', color: 'text-teal-500' },
  'Artes marciales': { icon: 'Shield', color: 'text-red-500' },
  'Natación': { icon: 'Waves', color: 'text-blue-500' },
  'Taller mecánico': { icon: 'Wrench', color: 'text-slate-500' },
  'Lavado de autos': { icon: 'Droplets', color: 'text-blue-500' },
  'Contabilidad': { icon: 'Calculator', color: 'text-indigo-500' },
  'Legal': { icon: 'Scale', color: 'text-slate-500' },
  'Diseño': { icon: 'Palette', color: 'text-violet-500' },
  'Tecnología': { icon: 'Code', color: 'text-blue-500' },
  'Hotel': { icon: 'Building', color: 'text-teal-500' },
  'Tours': { icon: 'Map', color: 'text-green-500' },
  'Escuela': { icon: 'GraduationCap', color: 'text-cyan-500' },
  'Idiomas': { icon: 'Languages', color: 'text-blue-500' },
  'Veterinaria': { icon: 'PawPrint', color: 'text-amber-500' },
  'Grooming': { icon: 'Scissors', color: 'text-pink-500' },
};
const DEFAULT_SUBCATEGORY_ICON = { icon: 'Tag', color: 'text-primary' };

const getSubcategoryIcon = (nombre) => {
  if (!nombre) return DEFAULT_SUBCATEGORY_ICON;
  const key = Object.keys(SUBCATEGORY_ICONS)?.find(k =>
    nombre?.toLowerCase()?.includes(k?.toLowerCase()) || k?.toLowerCase()?.includes(nombre?.toLowerCase())
  );
  return key ? SUBCATEGORY_ICONS?.[key] : DEFAULT_SUBCATEGORY_ICON;
};

// ─── Social platforms ────────────────────────────────────────────────────────
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

const BusinessProfileTab = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [businessId, setBusinessId] = useState(null);
  const [activeSocialKey, setActiveSocialKey] = useState(null);

  // The locked category name (from registration)
  const [lockedCategoriaNombre, setLockedCategoriaNombre] = useState('');

  const [formData, setFormData] = useState({
    nombreComercial: '',
    descripcionBreve: '',
    categoriaId: '',
    subcategoriaId: '',
    tipoEstablecimientoId: '',
    telefonoNegocio: '',
    whatsapp: '',
    email: '',
    sitioWeb: '',
    socialLinks: {},
    logoUrl: ''
  });

  const { categorias, subcategorias, tipos, loadingCategorias, loadingSubcategorias, loadingTipos } = useCategorias(
    formData?.categoriaId || null,
    formData?.subcategoriaId || null
  );

  // Determine current wizard step (only subcategory and tipo are editable)
  const currentStep = !formData?.subcategoriaId ? 2 : !formData?.tipoEstablecimientoId ? 3 : 'done';

  const selectedSubcategoria = subcategorias?.find(s => s?.id === formData?.subcategoriaId);
  const selectedTipo = tipos?.find(t => t?.id === formData?.tipoEstablecimientoId);
  const selectedCategoria = categorias?.find(c => c?.id === formData?.categoriaId);
  const parentCategoryStyle = selectedCategoria ? (CATEGORY_ICONS?.[selectedCategoria?.nombre] || DEFAULT_ICON) : DEFAULT_ICON;

  const filteredTipos = useMemo(() => tipos, [tipos]);

  useEffect(() => {
    loadBusinessProfile();
  }, [user]);

  const loadBusinessProfile = async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        ?.from('business_settings')
        ?.select('business_id, nombre_comercial, descripcion_breve, business_phone, business_website, business_logo_url, business_image_url, categoria_id, subcategoria_id, tipo_establecimiento_id, contact_email, contact_whatsapp, contact_facebook, contact_instagram, contact_twitter, contact_tiktok, contact_youtube, contact_linkedin, social_links')
        ?.eq('owner_id', user?.id)
        ?.maybeSingle();

      if (!fetchError && data) {
        setBusinessId(data?.business_id);

        // Resolve category name
        if (data?.categoria_id) {
          const { data: catData } = await supabase
            ?.from('business_categories')
            ?.select('nombre')
            ?.eq('id', data?.categoria_id)
            ?.maybeSingle();
          if (catData?.nombre) setLockedCategoriaNombre(catData?.nombre);
        }

        // Build social links from both old fields and new social_links object
        const existingSocialLinks = data?.social_links || {};
        const mergedSocialLinks = {
          facebook: existingSocialLinks?.facebook || data?.contact_facebook || '',
          instagram: existingSocialLinks?.instagram || data?.contact_instagram || '',
          twitter: existingSocialLinks?.twitter || data?.contact_twitter || '',
          tiktok: existingSocialLinks?.tiktok || data?.contact_tiktok || '',
          youtube: existingSocialLinks?.youtube || data?.contact_youtube || '',
          linkedin: existingSocialLinks?.linkedin || data?.contact_linkedin || '',
          whatsapp: existingSocialLinks?.whatsapp || '',
          pinterest: existingSocialLinks?.pinterest || '',
          snapchat: existingSocialLinks?.snapchat || '',
          threads: existingSocialLinks?.threads || '',
        };

        setFormData({
          nombreComercial: data?.nombre_comercial || '',
          descripcionBreve: data?.descripcion_breve || '',
          categoriaId: data?.categoria_id || '',
          subcategoriaId: data?.subcategoria_id || '',
          tipoEstablecimientoId: data?.tipo_establecimiento_id || '',
          telefonoNegocio: data?.business_phone || '',
          whatsapp: data?.contact_whatsapp || '',
          email: data?.contact_email || '',
          sitioWeb: data?.business_website || '',
          socialLinks: mergedSocialLinks,
          logoUrl: data?.business_logo_url || data?.business_image_url || ''
        });

        const logoSrc = data?.business_logo_url || data?.business_image_url;
        if (logoSrc) setLogoPreview(logoSrc);
      } else {
        // Pre-load from user_profiles (registration data)
        const { data: profile } = await supabase
          ?.from('user_profiles')
          ?.select('phone, email, business_phone, business_email, contact_phone, contact_email')
          ?.eq('id', user?.id)
          ?.maybeSingle();
        if (profile) {
          setFormData(prev => ({
            ...prev,
            telefonoNegocio: profile?.business_phone || profile?.contact_phone || profile?.phone || '',
            email: profile?.business_email || profile?.contact_email || profile?.email || user?.email || ''
          }));
        }
      }
    } catch (err) {
      console.error('Error loading business profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData?.nombreComercial || formData?.nombreComercial?.length < 3) {
      newErrors.nombreComercial = 'El nombre debe tener al menos 3 caracteres';
    }
    if (!formData?.categoriaId) newErrors.categoriaId = 'Selecciona una categoría';
    if (!formData?.descripcionBreve || formData?.descripcionBreve?.length < 10) {
      newErrors.descripcionBreve = 'La descripción debe tener al menos 10 caracteres';
    }
    if (formData?.sitioWeb) {
      const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;
      if (!urlRegex?.test(formData?.sitioWeb)) newErrors.sitioWeb = 'URL inválida. Debe comenzar con http:// o https://';
    }
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      let logoUrl = formData?.logoUrl;
      if (logoFile) {
        const fileExt = logoFile?.name?.split('.')?.pop();
        const fileName = `${user?.id}/logo.${fileExt}`;
        const { error: uploadError } = await supabase?.storage
          ?.from('business-logos')
          ?.upload(fileName, logoFile, { upsert: true });
        if (!uploadError) {
          const { data: urlData } = supabase?.storage?.from('business-logos')?.getPublicUrl(fileName);
          logoUrl = urlData?.publicUrl || logoUrl;
        }
      }

      const upsertData = {
        nombre_comercial: formData?.nombreComercial,
        business_name: formData?.nombreComercial,
        descripcion_breve: formData?.descripcionBreve,
        categoria_id: formData?.categoriaId || null,
        subcategoria_id: formData?.subcategoriaId || null,
        tipo_establecimiento_id: formData?.tipoEstablecimientoId || null,
        business_phone: formData?.telefonoNegocio,
        business_website: formData?.sitioWeb,
        business_logo_url: logoUrl,
        contact_email: formData?.email,
        contact_whatsapp: formData?.whatsapp,
        contact_facebook: formData?.socialLinks?.facebook || '',
        contact_instagram: formData?.socialLinks?.instagram || '',
        contact_twitter: formData?.socialLinks?.twitter || '',
        contact_tiktok: formData?.socialLinks?.tiktok || '',
        contact_youtube: formData?.socialLinks?.youtube || '',
        contact_linkedin: formData?.socialLinks?.linkedin || '',
        social_links: formData?.socialLinks,
        owner_id: user?.id,
        updated_at: new Date()?.toISOString()
      };

      if (businessId) {
        const { error: updateError } = await supabase
          ?.from('business_settings')
          ?.update(upsertData)
          ?.eq('business_id', businessId);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          ?.from('business_settings')
          ?.insert({ ...upsertData, business_id: user?.id });
        if (insertError) throw insertError;
        setBusinessId(user?.id);
      }
      setFormData(prev => ({ ...prev, logoUrl }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving business profile:', err);
      setError(err?.message || 'Error al guardar el perfil del negocio');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (file) => {
    const validation = validateImageFile(file, 2);
    if (!validation?.valid) { setErrors({ ...errors, logo: validation?.message }); return; }
    setLogoFile(file);
    setErrors({ ...errors, logo: '' });
    try {
      const dataURL = await fileToDataURL(file);
      setLogoPreview(dataURL);
    } catch (err) {
      console.error('Error creating preview:', err);
    }
  };

  const handleLogoRemove = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setFormData({ ...formData, logoUrl: '' });
  };

  const handleSubcategoriaChange = (subcategoriaId) => {
    setFormData(prev => ({ ...prev, subcategoriaId, tipoEstablecimientoId: '' }));
  };

  const updateSocialLink = (key, value) => {
    setFormData(prev => ({ ...prev, socialLinks: { ...prev?.socialLinks, [key]: value } }));
  };

  const charCount = formData?.descripcionBreve?.length || 0;
  const charLimit = 300;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm flex items-center gap-2">
          <Icon name="AlertCircle" size={16} />{error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-center gap-2">
          <Icon name="CheckCircle" size={16} />Perfil del negocio guardado exitosamente
        </div>
      )}
      {/* ── SECCIÓN: Logotipo del Negocio ── */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="Image" size={18} className="text-primary" />
          Logotipo del Negocio
        </h3>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {logoPreview ? (
                <div className="relative">
                  <img src={logoPreview} alt="Logo del negocio" className="w-24 h-24 rounded-lg object-cover border-2 border-white shadow-md" />
                  <button type="button" onClick={handleLogoRemove}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md">
                    <Icon name="X" size={14} />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg bg-white border-2 border-dashed border-blue-300 flex items-center justify-center">
                  <Icon name="Image" size={32} className="text-blue-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-3">Sube el logo de tu negocio para personalizar tu perfil público</p>
              {!logoPreview && (
                <FileUpload
                  label="Subir Logo"
                  accept=".jpg,.jpeg,.png,.webp"
                  maxSizeMB={2}
                  file={logoFile}
                  onChange={handleLogoUpload}
                  onRemove={handleLogoRemove}
                  error={errors?.logo}
                  description="JPG, PNG o WEBP hasta 2MB"
                  icon="Upload"
                />
              )}
              {errors?.logo && <p className="text-sm text-destructive mt-1">{errors?.logo}</p>}
            </div>
          </div>
        </div>
      </div>
      {/* ── SECCIÓN: Tu Negocio ── */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="Building2" size={18} className="text-primary" />
          Tu Negocio
        </h3>
        <div className="space-y-4">
          <Input
            label="Nombre Comercial"
            type="text"
            placeholder="Mi Negocio"
            value={formData?.nombreComercial}
            onChange={(e) => setFormData({ ...formData, nombreComercial: e?.target?.value })}
            error={errors?.nombreComercial}
            required
          />
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Descripción Breve <span className="text-red-600">*</span>
            </label>
            <textarea
              placeholder="Describe tu negocio en pocas palabras..."
              value={formData?.descripcionBreve}
              onChange={(e) => setFormData({ ...formData, descripcionBreve: e?.target?.value })}
              className="flex min-h-[100px] w-full rounded-lg border border-border bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all"
              maxLength={charLimit}
            />
            <div className="flex justify-between items-center mt-1">
              {errors?.descripcionBreve ? (
                <p className="text-sm text-destructive">{errors?.descripcionBreve}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Máximo 300 caracteres</p>
              )}
              <p className={`text-xs font-medium ${charCount > charLimit ? 'text-destructive' : charCount > charLimit * 0.9 ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                {charCount}/{charLimit}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* ── SECCIÓN: Categoría (3-step wizard, category locked) ── */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
          <Icon name="Tag" size={18} className="text-primary" />
          Categoría
        </h3>
        <p className="text-xs text-muted-foreground mb-4 ml-6">La categoría principal fue definida durante el registro. Puedes cambiar la subcategoría y el tipo.</p>

        {/* Step indicators */}
        <div className="flex items-center gap-0 mb-5">
          {[
            { step: 1, label: 'Categoría', done: !!formData?.categoriaId },
            { step: 2, label: 'Subcategoría', done: !!formData?.subcategoriaId },
            { step: 3, label: 'Tipo', done: !!formData?.tipoEstablecimientoId },
          ]?.map((s, idx) => {
            const isActive = currentStep === s?.step;
            const isDone = s?.done;
            return (
              <React.Fragment key={s?.step}>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${s?.step === 1 ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {isDone ? <Icon name="Check" size={11} /> : s?.step}
                  </span>
                  <span className={`text-xs font-medium hidden sm:block ${
                    isDone ? 'text-emerald-600' : isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}>{s?.label}</span>
                  {s?.step === 1 && (
                    <Icon name="Lock" size={10} className="text-muted-foreground hidden sm:block" />
                  )}
                </div>
                {idx < 2 && (
                  <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${
                    (idx === 0 && formData?.categoriaId) || (idx === 1 && formData?.subcategoriaId)
                      ? 'bg-emerald-400' : 'bg-border'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="space-y-3">
          {/* STEP 1: Categoría - LOCKED (read-only display) */}
          <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
              <Icon name="Check" size={11} />
            </span>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-emerald-700 font-medium">Categoría:</span>
              <span className="text-xs font-semibold text-emerald-800">
                {lockedCategoriaNombre || selectedCategoria?.nombre || 'Categoría registrada'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Icon name="Lock" size={11} />
              <span className="hidden sm:inline">Bloqueada</span>
            </div>
          </div>

          {/* STEP 2: Subcategoría */}
          {formData?.categoriaId && (!formData?.subcategoriaId || currentStep === 2) && (
            <div className="border border-border rounded-xl p-4 bg-card">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">2</span>
                <label className="text-sm font-semibold text-foreground">Selecciona la subcategoría</label>
              </div>
              {loadingSubcategorias ? (
                <div className="flex items-center gap-2 py-3 text-muted-foreground text-sm">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Cargando subcategorías...
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {subcategorias?.map(sub => {
                    const isSelected = formData?.subcategoriaId === sub?.id;
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
            </div>
          )}

          {/* Completed Step 2 summary */}
          {formData?.subcategoriaId && currentStep !== 2 && (
            <div
              className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl cursor-pointer hover:bg-emerald-100 transition-colors"
              onClick={() => setFormData(prev => ({ ...prev, subcategoriaId: '', tipoEstablecimientoId: '' }))}
            >
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                <Icon name="Check" size={11} />
              </span>
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs text-emerald-700 font-medium">Subcategoría:</span>
                <span className="text-xs font-semibold text-emerald-800">{selectedSubcategoria?.nombre}</span>
              </div>
              <span className="text-xs text-emerald-600 flex items-center gap-1">
                <Icon name="Pencil" size={11} /> Cambiar
              </span>
            </div>
          )}

          {/* STEP 3: Tipo de establecimiento */}
          {formData?.subcategoriaId && (
            <div className="border border-border rounded-xl p-4 bg-card">
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${formData?.tipoEstablecimientoId ? 'bg-emerald-500 text-white' : 'bg-primary text-white'}`}>
                  {formData?.tipoEstablecimientoId ? <Icon name="Check" size={11} /> : '3'}
                </span>
                <label className="text-sm font-semibold text-foreground">Tipo de establecimiento</label>
              </div>
              {loadingTipos ? (
                <div className="flex items-center gap-2 py-3 text-muted-foreground text-sm">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Cargando tipos...
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {filteredTipos?.map(tipo => {
                    const isSelected = formData?.tipoEstablecimientoId === tipo?.id;
                    return (
                      <button
                        key={tipo?.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tipoEstablecimientoId: tipo?.id }))}
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
                  {filteredTipos?.length === 0 && (
                    <div className="col-span-full py-4 text-center text-sm text-muted-foreground">
                      <Icon name="FolderOpen" size={20} className="mx-auto mb-1 opacity-50" />
                      No hay tipos disponibles
                    </div>
                  )}
                </div>
              )}
              {formData?.tipoEstablecimientoId && (
                <div className="mt-3 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <Icon name="CheckCircle" size={16} className="text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-700">¡Clasificación completa!</p>
                    <p className="text-xs text-emerald-600">
                      {lockedCategoriaNombre || selectedCategoria?.nombre} → {selectedSubcategoria?.nombre} → {selectedTipo?.nombre}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* ── SECCIÓN: Contacto ── */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="Phone" size={18} className="text-primary" />
          Contacto
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Teléfono del Negocio <span className="text-muted-foreground text-xs">(recomendado)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🇲🇽</span>
                <input
                  type="tel"
                  value={formData?.telefonoNegocio}
                  onChange={(e) => setFormData({ ...formData, telefonoNegocio: e?.target?.value })}
                  placeholder="10 dígitos"
                  className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Este teléfono es visible para los usuarios de PromoClub.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                WhatsApp <span className="text-muted-foreground text-xs">(opcional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 text-sm">💬</span>
                <input
                  type="tel"
                  value={formData?.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e?.target?.value })}
                  placeholder="10 dígitos"
                  className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email de contacto <span className="text-muted-foreground text-xs">(opcional)</span>
              </label>
              <input
                type="email"
                value={formData?.email}
                onChange={(e) => setFormData({ ...formData, email: e?.target?.value })}
                placeholder="contacto@minegocio.com"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Sitio Web <span className="text-muted-foreground text-xs">(opcional)</span>
              </label>
              <input
                type="url"
                value={formData?.sitioWeb}
                onChange={(e) => setFormData({ ...formData, sitioWeb: e?.target?.value })}
                placeholder="https://www.minegocio.com"
                className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors?.sitioWeb ? 'border-destructive' : 'border-border'}`}
              />
              {errors?.sitioWeb && <p className="text-xs text-destructive mt-1">{errors?.sitioWeb}</p>}
            </div>
          </div>
        </div>
      </div>
      {/* ── SECCIÓN: Redes Sociales ── */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="Share2" size={18} className="text-primary" />
          Redes Sociales
        </h3>
        <div className="border border-border rounded-xl p-4 bg-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">Redes sociales</p>
            {(() => {
              const count = Object.values(formData?.socialLinks || {})?.filter(v => v?.trim())?.length;
              return count > 0 ? (
                <span className="text-xs font-medium px-2.5 py-1 bg-primary/10 text-primary rounded-full">{count} conectadas</span>
              ) : null;
            })()}
          </div>
          <p className="text-xs text-muted-foreground mb-3">Toca el ícono de la red social para agregar su URL.</p>

          {/* Icon grid */}
          <div className="flex flex-wrap gap-2 mb-4">
            {SOCIAL_PLATFORMS?.map(platform => {
              const hasValue = !!(formData?.socialLinks?.[platform?.key]?.trim());
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
            return (
              <div className={`border-2 ${platform?.border} rounded-xl p-4 ${platform?.bg} transition-all`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg ${platform?.activeBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon name={platform?.icon} size={14} className="text-white" />
                  </div>
                  <span className={`text-sm font-semibold ${platform?.color}`}>{platform?.label}</span>
                  {formData?.socialLinks?.[platform?.key] && (
                    <a
                      href={formData?.socialLinks?.[platform?.key]}
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
                    value={formData?.socialLinks?.[platform?.key] || ''}
                    onChange={e => updateSocialLink(platform?.key, e?.target?.value)}
                    placeholder={platform?.placeholder}
                    className="flex-1 px-3 py-2 border border-border rounded-xl bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  {formData?.socialLinks?.[platform?.key] && (
                    <button
                      type="button"
                      onClick={() => updateSocialLink(platform?.key, '')}
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
            const filledPlatforms = SOCIAL_PLATFORMS?.filter(p => formData?.socialLinks?.[p?.key]?.trim());
            if (filledPlatforms?.length === 0) return null;
            return (
              <div className="mt-3 p-4 border border-border rounded-xl bg-muted/20">
                <p className="text-xs font-medium text-foreground mb-3">Vista previa en tu ficha pública:</p>
                <div className="flex flex-wrap gap-2">
                  {filledPlatforms?.map(platform => (
                    <a
                      key={platform?.key}
                      href={formData?.socialLinks?.[platform?.key]}
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
      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Guardando...</>
          ) : (
            <><Icon name="Save" size={16} className="mr-2" />Guardar Perfil del Negocio</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BusinessProfileTab;
