import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const FONTS = [
  { value: 'plus-jakarta', label: 'Plus Jakarta Sans', class: 'font-sans', sample: 'Aa' },
  { value: 'dm-sans', label: 'DM Sans', class: 'font-sans', sample: 'Aa' },
  { value: 'manrope', label: 'Manrope', class: 'font-sans', sample: 'Aa' },
  { value: 'crimson', label: 'Crimson Text', class: 'font-serif', sample: 'Aa' },
  { value: 'fraunces', label: 'Fraunces', class: 'font-serif', sample: 'Aa' },
  { value: 'jetbrains', label: 'JetBrains Mono', class: 'font-mono', sample: 'Aa' },
  { value: 'general-sans', label: 'General Sans', class: 'font-sans', sample: 'Aa' },
  { value: 'satoshi', label: 'Satoshi', class: 'font-sans', sample: 'Aa' },
  { value: 'cabinet', label: 'Cabinet Grotesk', class: 'font-sans', sample: 'Aa' },
  { value: 'ibm-plex', label: 'IBM Plex Mono', class: 'font-mono', sample: 'Aa' },
];

const LOGO_VARIANTS = [
  { key: 'logoHorizontal', label: 'Logo horizontal', desc: 'Para encabezados y emails', bg: 'bg-white', darkBg: false },
  { key: 'logoIsotipo', label: 'Isotipo (solo ícono)', desc: 'Para apps y favicons', bg: 'bg-white', darkBg: false },
  { key: 'logoBlanco', label: 'Logo blanco', desc: 'Para fondos oscuros', bg: 'bg-gray-900', darkBg: true },
];

const PRESET_PALETTES = [
  { name: 'Violeta', primary: '#7C3AED', secondary: '#F59E0B' },
  { name: 'Azul', primary: '#2563EB', secondary: '#10B981' },
  { name: 'Rojo', primary: '#DC2626', secondary: '#F97316' },
  { name: 'Verde', primary: '#059669', secondary: '#0EA5E9' },
  { name: 'Rosa', primary: '#DB2777', secondary: '#8B5CF6' },
  { name: 'Naranja', primary: '#EA580C', secondary: '#EAB308' },
  { name: 'Teal', primary: '#0D9488', secondary: '#6366F1' },
  { name: 'Índigo', primary: '#4F46E5', secondary: '#EC4899' },
];

// ─── Material Preview Components ──────────────────────────────────────────────

const CouponPreview = ({ primary, secondary, brandName, logoUrl }) => (
  <div className="w-full rounded-xl overflow-hidden border-2 shadow-sm" style={{ borderColor: primary }}>
    <div className="flex items-center gap-2 px-3 py-2" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
      {logoUrl
        ? <img src={logoUrl} alt={brandName} className="h-6 object-contain" />
        : <span className="text-white font-bold text-xs truncate">{brandName || 'Mi Negocio'}</span>}
    </div>
    <div className="bg-white px-3 py-2 flex items-center justify-between">
      <div>
        <p className="text-xs font-bold" style={{ color: primary }}>20% DESCUENTO</p>
        <p className="text-xs text-gray-500">Válido hoy</p>
      </div>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: primary + '20' }}>
        <Icon name="Ticket" size={18} style={{ color: primary }} />
      </div>
    </div>
    <div className="px-3 py-1.5 border-t border-dashed" style={{ borderColor: primary + '40' }}>
      <p className="text-xs text-center font-mono text-gray-400">PROMO-2024</p>
    </div>
  </div>
);

const QRCardPreview = ({ primary, secondary, brandName, logoUrl }) => (
  <div className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
    <div className="h-10 flex items-center justify-center px-3" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
      {logoUrl
        ? <img src={logoUrl} alt={brandName} className="h-7 object-contain" />
        : <span className="text-white font-bold text-xs">{brandName || 'Mi Negocio'}</span>}
    </div>
    <div className="p-3 flex flex-col items-center gap-1.5">
      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
        <Icon name="QrCode" size={32} className="text-gray-400" />
      </div>
      <p className="text-xs font-semibold text-center" style={{ color: primary }}>¡Escanéame!</p>
    </div>
  </div>
);

const EmailPreview = ({ primary, brandName, logoUrl }) => (
  <div className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
    <div className="h-10 flex items-center justify-center px-3" style={{ backgroundColor: primary }}>
      {logoUrl
        ? <img src={logoUrl} alt={brandName} className="h-7 object-contain" />
        : <span className="text-white font-bold text-xs">{brandName || 'Mi Negocio'}</span>}
    </div>
    <div className="p-3 space-y-1.5">
      <p className="text-xs font-bold text-gray-800">¡Tienes una oferta especial!</p>
      <p className="text-xs text-gray-500 leading-relaxed">Hola, tenemos algo especial para ti hoy...</p>
      <div className="pt-1">
        <span className="text-xs px-3 py-1 rounded-full text-white font-medium" style={{ backgroundColor: primary }}>Ver oferta</span>
      </div>
    </div>
  </div>
);

const GiftCardPreview = ({ primary, secondary, brandName, logoUrl }) => (
  <div className="w-full rounded-xl overflow-hidden shadow-sm" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        {logoUrl
          ? <img src={logoUrl} alt={brandName} className="h-6 object-contain" />
          : <span className="text-white font-bold text-xs">{brandName || 'Mi Negocio'}</span>}
        <Icon name="Gift" size={16} className="text-white opacity-80" />
      </div>
      <p className="text-white text-lg font-bold">$500</p>
      <p className="text-white text-xs opacity-80">Tarjeta de regalo</p>
      <div className="mt-2 pt-2 border-t border-white/20">
        <p className="text-white text-xs font-mono opacity-70">•••• •••• •••• 1234</p>
      </div>
    </div>
  </div>
);

const StoryPreview = ({ primary, secondary, brandName, logoUrl }) => (
  <div className="w-full rounded-xl overflow-hidden shadow-sm relative" style={{ background: `linear-gradient(160deg, ${primary}CC, ${secondary}CC)`, minHeight: 96 }}>
    <div className="absolute inset-0 flex flex-col items-center justify-center p-3 gap-1.5">
      {logoUrl
        ? <img src={logoUrl} alt={brandName} className="h-8 object-contain" />
        : <span className="text-white font-bold text-sm text-center">{brandName || 'Mi Negocio'}</span>}
      <div className="mt-1 px-3 py-1 rounded-full bg-white/20 border border-white/40">
        <p className="text-white text-xs font-medium">Ver más →</p>
      </div>
    </div>
  </div>
);

const NotificationPreview = ({ primary, brandName, logoUrl }) => (
  <div className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
    <div className="flex items-start gap-2 p-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: primary }}>
        {logoUrl
          ? <img src={logoUrl} alt={brandName} className="w-6 h-6 object-contain rounded" />
          : <Icon name="Bell" size={14} className="text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800 truncate">{brandName || 'Mi Negocio'}</p>
        <p className="text-xs text-gray-500 leading-tight">¡Tienes puntos nuevos!</p>
      </div>
      <p className="text-xs text-gray-400 flex-shrink-0">ahora</p>
    </div>
  </div>
);

const MATERIAL_PREVIEWS = [
  { label: 'Cupón', icon: 'Ticket', Component: CouponPreview },
  { label: 'QR de mesa', icon: 'QrCode', Component: QRCardPreview },
  { label: 'Email', icon: 'Mail', Component: EmailPreview },
  { label: 'Gift card', icon: 'Gift', Component: GiftCardPreview },
  { label: 'Story', icon: 'Instagram', Component: StoryPreview },
  { label: 'Notificación', icon: 'Bell', Component: NotificationPreview },
];

// ─── Main Component ────────────────────────────────────────────────────────────

const BrandTab = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [uploadingVariant, setUploadingVariant] = useState(null);
  const [businessId, setBusinessId] = useState(null);
  const [activePreviewTab, setActivePreviewTab] = useState('materiales');
  const fileInputRefs = useRef({});

  // Brand data loaded from Supabase (name/slogan read-only, not editable here)
  const [brandData, setBrandData] = useState({
    brandName: '',
    brandSlogan: '',
    brandPrimaryColor: '#7C3AED',
    brandSecondaryColor: '#F59E0B',
    brandFont: 'plus-jakarta',
    logoHorizontal: null,
    logoIsotipo: null,
    logoBlanco: null,
  });

  const primaryColor = brandData?.brandPrimaryColor || '#7C3AED';
  const secondaryColor = brandData?.brandSecondaryColor || '#F59E0B';
  const selectedFont = brandData?.brandFont || 'plus-jakarta';
  const brandName = brandData?.brandName || '';
  const logoUrl = brandData?.logoHorizontal?.url || brandData?.logoIsotipo?.url || null;

  useEffect(() => {
    loadBrandData();
  }, [user]);

  const loadBrandData = async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase
        ?.from('business_settings')
        ?.select('business_id, brand_primary_color, brand_secondary_color, brand_font, brand_name, brand_slogan, logo_horizontal_url, logo_isotipo_url, logo_blanco_url')
        ?.eq('owner_id', user?.id)
        ?.single();
      if (data) {
        setBusinessId(data?.business_id);
        setBrandData(prev => ({
          ...prev,
          brandName: data?.brand_name || prev?.brandName,
          brandSlogan: data?.brand_slogan || prev?.brandSlogan,
          brandPrimaryColor: data?.brand_primary_color || prev?.brandPrimaryColor,
          brandSecondaryColor: data?.brand_secondary_color || prev?.brandSecondaryColor,
          brandFont: data?.brand_font || prev?.brandFont,
          logoHorizontal: data?.logo_horizontal_url ? { url: data?.logo_horizontal_url } : null,
          logoIsotipo: data?.logo_isotipo_url ? { url: data?.logo_isotipo_url } : null,
          logoBlanco: data?.logo_blanco_url ? { url: data?.logo_blanco_url } : null,
        }));
      }
    } catch (err) {
      console.error('Error loading brand data:', err);
    }
  };

  const handleChange = (field, value) => {
    setBrandData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (variantKey, file) => {
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file?.size > maxSize) { setSaveError('La imagen no debe superar 5MB'); return; }
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowed?.includes(file?.type)) { setSaveError('Formato no válido. Usa JPG, PNG, WEBP o SVG'); return; }
    setSaveError(null);
    setUploadingVariant(variantKey);
    try {
      const localUrl = URL.createObjectURL(file);
      handleChange(variantKey, { url: localUrl, file, name: file?.name });
      if (user?.id) {
        const ext = file?.name?.split('.')?.pop();
        const path = `${user?.id}/brand/${variantKey}.${ext}`;
        const { error: uploadErr } = await supabase?.storage
          ?.from('business-logos')
          ?.upload(path, file, { upsert: true });
        if (!uploadErr) {
          const { data: urlData } = supabase?.storage?.from('business-logos')?.getPublicUrl(path);
          if (urlData?.publicUrl) handleChange(variantKey, { url: urlData?.publicUrl, name: file?.name });
        }
      }
    } catch (err) {
      console.error('Error uploading logo variant:', err);
    } finally {
      setUploadingVariant(null);
    }
  };

  const handleRemoveVariant = (variantKey) => {
    handleChange(variantKey, null);
    if (fileInputRefs?.current?.[variantKey]) fileInputRefs.current[variantKey].value = '';
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const updateData = {
        brand_primary_color: primaryColor,
        brand_secondary_color: secondaryColor,
        brand_font: selectedFont,
        logo_horizontal_url: brandData?.logoHorizontal?.url || null,
        logo_isotipo_url: brandData?.logoIsotipo?.url || null,
        logo_blanco_url: brandData?.logoBlanco?.url || null,
        updated_at: new Date()?.toISOString(),
      };
      if (businessId) {
        const { error } = await supabase?.from('business_settings')?.update(updateData)?.eq('business_id', businessId);
        if (error) throw error;
      } else if (user?.id) {
        const { error } = await supabase?.from('business_settings')?.upsert({ ...updateData, owner_id: user?.id, business_id: user?.id });
        if (error) throw error;
        setBusinessId(user?.id);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving brand:', err);
      setSaveError(err?.message || 'Error al guardar la identidad de marca');
    } finally {
      setSaving(false);
    }
  };

  const previewProps = { primary: primaryColor, secondary: secondaryColor, brandName, logoUrl };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Identidad de Marca</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Define colores, tipografía y logos que se aplican en todos los materiales</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {saving
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
            : <><Icon name="Save" size={15} /> Guardar marca</>}
        </button>
      </div>
      {saveError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <Icon name="AlertCircle" size={15} />{saveError}
        </div>
      )}
      {saveSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
          <Icon name="CheckCircle" size={15} />Identidad de marca guardada exitosamente
        </div>
      )}
      {/* Info banner - brand name/slogan managed elsewhere */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Icon name="Info" size={18} className="text-blue-700" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-blue-800">Nombre y slogan de marca</p>
          <p className="text-xs text-blue-600">El nombre y slogan de tu marca están registrados en el Perfil de Negocio y se aplican automáticamente en todos los materiales.</p>
        </div>
      </div>
      {/* QR Link Banner */}
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <Icon name="QrCode" size={18} className="text-emerald-700" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-emerald-800">Los datos de marca se aplican automáticamente en QR Imprimibles</p>
          <p className="text-xs text-emerald-600">Logo, colores y fuente se usan en las plantillas de QR</p>
        </div>
      </div>
      {/* Colores */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="text-sm font-semibold text-foreground">Colores de marca</h3>
        </div>

        {/* Preset palettes */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Paletas predefinidas:</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_PALETTES?.map(palette => (
              <button
                key={palette?.name}
                onClick={() => { handleChange('brandPrimaryColor', palette?.primary); handleChange('brandSecondaryColor', palette?.secondary); }}
                title={palette?.name}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded-lg text-xs transition-all ${
                  primaryColor === palette?.primary ? 'border-primary ring-1 ring-primary/30 bg-primary/5' : 'border-border hover:bg-muted/30'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full border border-white/50 shadow-sm" style={{ backgroundColor: palette?.primary }} />
                <span className="w-3.5 h-3.5 rounded-full border border-white/50 shadow-sm" style={{ backgroundColor: palette?.secondary }} />
                <span className="text-foreground">{palette?.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Color primario</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={e => handleChange('brandPrimaryColor', e?.target?.value)}
                className="w-12 h-12 rounded-xl border border-border cursor-pointer p-1 bg-background"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={primaryColor}
                  onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/?.test(e?.target?.value)) handleChange('brandPrimaryColor', e?.target?.value); }}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <p className="text-xs text-muted-foreground mt-1">Acento principal en todos los materiales</p>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">Color secundario <span className="text-muted-foreground">(opcional)</span></label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={secondaryColor}
                onChange={e => handleChange('brandSecondaryColor', e?.target?.value)}
                className="w-12 h-12 rounded-xl border border-border cursor-pointer p-1 bg-background"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/?.test(e?.target?.value)) handleChange('brandSecondaryColor', e?.target?.value); }}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <p className="text-xs text-muted-foreground mt-1">Complemento o degradado</p>
              </div>
            </div>
          </div>
        </div>

        {/* Color palette preview */}
        <div className="mt-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg shadow-sm border border-white/20" style={{ backgroundColor: primaryColor }} title="Primario" />
          <div className="w-10 h-10 rounded-lg shadow-sm border border-white/20" style={{ backgroundColor: secondaryColor }} title="Secundario" />
          <div className="w-10 h-10 rounded-lg shadow-sm border border-border bg-white" title="Blanco" />
          <div className="w-10 h-10 rounded-lg shadow-sm border border-border bg-gray-900" title="Negro" />
          <div className="flex-1 h-10 rounded-lg shadow-sm" style={{ background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})` }} title="Degradado" />
        </div>
      </div>
      {/* Variantes de logo */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="text-sm font-semibold text-foreground">Variantes de logo</h3>
          <span className="text-xs text-muted-foreground">— JPG, PNG, WEBP o SVG hasta 5MB</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {LOGO_VARIANTS?.map(variant => {
            const existing = brandData?.[variant?.key];
            const isUploading = uploadingVariant === variant?.key;
            return (
              <div key={variant?.key} className="border border-border rounded-xl overflow-hidden">
                <div className={`h-28 ${variant?.bg} flex items-center justify-center relative`}>
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <p className="text-xs text-muted-foreground">Subiendo...</p>
                    </div>
                  ) : existing?.url ? (
                    <div className="relative w-full h-full flex items-center justify-center p-3">
                      <img src={existing?.url} alt={variant?.label} className="max-h-20 max-w-full object-contain" />
                      <button
                        onClick={() => handleRemoveVariant(variant?.key)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                      >
                        <Icon name="X" size={12} />
                      </button>
                    </div>
                  ) : logoUrl && variant?.key !== 'logoHorizontal' ? (
                    <img src={logoUrl} alt="Logo base" className="max-h-16 max-w-full object-contain opacity-25" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Icon name="Image" size={28} className={variant?.darkBg ? 'text-gray-600' : 'text-gray-300'} />
                      <p className={`text-xs ${variant?.darkBg ? 'text-gray-500' : 'text-gray-400'}`}>Sin imagen</p>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-background">
                  <p className="text-xs font-medium text-foreground">{variant?.label}</p>
                  <p className="text-xs text-muted-foreground mb-2">{variant?.desc}</p>
                  <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer w-full">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      className="hidden"
                      ref={el => fileInputRefs.current[variant?.key] = el}
                      onChange={e => { const f = e?.target?.files?.[0]; if (f) handleLogoUpload(variant?.key, f); }}
                    />
                    <Icon name="Upload" size={12} />
                    {existing?.url ? 'Cambiar imagen' : 'Subir imagen'}
                  </label>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <Icon name="Info" size={12} />
          Las imágenes se guardan en la nube y se usan en todos los materiales de marca
        </p>
      </div>
      {/* Tipografía */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="text-sm font-semibold text-foreground">Tipografía</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {FONTS?.map(font => (
            <button
              key={font?.value}
              onClick={() => handleChange('brandFont', font?.value)}
              className={`p-3 border rounded-xl text-left transition-all ${
                selectedFont === font?.value ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border hover:bg-muted/30'
              }`}
            >
              <p className={`text-xl font-bold text-foreground mb-1 ${font?.class}`}>{font?.sample}</p>
              <p className="text-xs text-muted-foreground leading-tight">{font?.label}</p>
              {selectedFont === font?.value && (
                <div className="mt-1 flex items-center gap-1">
                  <Icon name="Check" size={10} className="text-primary" />
                  <span className="text-xs text-primary font-medium">Activa</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
      {/* Preview de materiales */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="text-sm font-semibold text-foreground">Preview en vivo de materiales</h3>
        </div>

        {/* Preview tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { id: 'materiales', label: 'Todos los materiales', icon: 'LayoutGrid' },
            { id: 'qr', label: 'Templates QR', icon: 'QrCode' },
          ]?.map(tab => (
            <button
              key={tab?.id}
              onClick={() => setActivePreviewTab(tab?.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activePreviewTab === tab?.id ? 'bg-primary text-white' : 'border border-border text-muted-foreground hover:bg-muted/30'
              }`}
            >
              <Icon name={tab?.icon} size={12} />
              {tab?.label}
            </button>
          ))}
        </div>

        {activePreviewTab === 'materiales' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MATERIAL_PREVIEWS?.map(mat => (
              <div key={mat?.label} className="border border-border rounded-xl overflow-hidden">
                <div className="p-3 bg-muted/10 border-b border-border flex items-center gap-2">
                  <Icon name={mat?.icon} size={14} className="text-muted-foreground" />
                  <p className="text-xs font-medium text-foreground">{mat?.label}</p>
                </div>
                <div className="p-3">
                  <mat.Component {...previewProps} />
                </div>
              </div>
            ))}
          </div>
        )}

        {activePreviewTab === 'qr' && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">Vista previa de cómo se verán las plantillas QR con tu marca actual:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Tarjeta A7 */}
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="p-2 bg-muted/10 border-b border-border">
                  <p className="text-xs font-medium text-foreground">Tarjeta A7</p>
                </div>
                <div className="p-3 flex justify-center">
                  <div className="w-40 rounded-xl overflow-hidden shadow-sm border border-border">
                    <div className="h-12 flex items-center justify-center px-3" style={{ backgroundColor: primaryColor }}>
                      {logoUrl
                        ? <img src={logoUrl} alt={brandName} className="h-8 object-contain" />
                        : <p className="text-white font-bold text-xs text-center">{brandName || 'Mi Negocio'}</p>}
                    </div>
                    <div className="bg-white p-3 flex flex-col items-center gap-1.5">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                        <Icon name="QrCode" size={28} className="text-gray-400" />
                      </div>
                      <p className="text-xs font-semibold text-center" style={{ color: primaryColor }}>¡Escanéame!</p>
                      <p className="text-xs text-gray-400">promoclub.mx/negocio</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Tent card */}
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="p-2 bg-muted/10 border-b border-border">
                  <p className="text-xs font-medium text-foreground">Tent card de mesa</p>
                </div>
                <div className="p-3">
                  <div className="rounded-xl overflow-hidden shadow-sm" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                    <div className="flex items-center gap-3 p-3">
                      <div className="bg-white rounded-lg p-1.5 flex-shrink-0">
                        <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center">
                          <Icon name="QrCode" size={24} className="text-gray-400" />
                        </div>
                      </div>
                      <div className="flex-1 text-white">
                        {logoUrl
                          ? <img src={logoUrl} alt={brandName} className="h-6 object-contain mb-1" />
                          : <p className="text-sm font-bold mb-0.5">{brandName || 'Mi Negocio'}</p>}
                        <p className="text-xs font-semibold">¡Escanéame!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Sticker */}
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="p-2 bg-muted/10 border-b border-border">
                  <p className="text-xs font-medium text-foreground">Sticker 5×5cm</p>
                </div>
                <div className="p-3 flex justify-center">
                  <div
                    className="w-28 h-28 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-md border-4"
                    style={{ borderColor: primaryColor, background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)` }}
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Icon name="QrCode" size={28} className="text-gray-400" />
                    </div>
                    <p className="text-xs font-bold text-center leading-tight" style={{ color: primaryColor }}>{brandName || 'Negocio'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
          <Icon name="Info" size={12} />
          Configura una vez y todos los materiales heredan tu identidad de marca automáticamente.
        </p>
      </div>
      {/* Save button bottom */}
      <div className="flex justify-end pt-2 border-t border-border">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {saving
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
            : <><Icon name="Save" size={15} /> Guardar identidad de marca</>}
        </button>
      </div>
    </div>
  );
};

export default BrandTab;
