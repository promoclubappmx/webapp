import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const WebPresenceForm = ({ formData, onChange }) => {
  const [activeSection, setActiveSection] = useState('landing');
  const [copiedField, setCopiedField] = useState(null);
  const slug = formData?.slug || 'tu-negocio';
  const landingActive = formData?.landingActive !== false;
  const pixelActive = formData?.pixelActive || false;
  const widgetSize = formData?.widgetSize || 'medium';
  const widgetTheme = formData?.widgetTheme || 'light';

  // Meta tags state
  const metaTitle = formData?.metaTitle || '';
  const metaDescription = formData?.metaDescription || '';
  const metaKeywords = formData?.metaKeywords || '';
  const ogTitle = formData?.ogTitle || '';
  const ogDescription = formData?.ogDescription || '';
  const ogImage = formData?.ogImage || '';
  const twitterCard = formData?.twitterCard || 'summary_large_image';
  const canonicalUrl = formData?.canonicalUrl || '';

  // Favicon state
  const faviconUrl = formData?.faviconUrl || '';

  // Social links state
  const socialLinks = formData?.socialLinks || {
    facebook: '', instagram: '', twitter: '', tiktok: '',
    youtube: '', linkedin: '', whatsapp: '', pinterest: '',
    snapchat: '', threads: '',
  };

  const sections = [
    { id: 'landing', label: 'Página web', icon: 'Globe' },
    { id: 'meta', label: 'Meta Tags', icon: 'Tag' },
    { id: 'favicon', label: 'Favicon', icon: 'Image' },
    { id: 'social', label: 'Redes sociales', icon: 'Share2' },
    { id: 'seo', label: 'SEO Google', icon: 'Search' },
    { id: 'widget', label: 'Widget', icon: 'Code' },
    { id: 'pixel', label: 'Pixel', icon: 'Activity' },
  ];

  const widgetCode = `<script src="https://promoclub.mx/widget.js" data-business="${slug}" data-size="${widgetSize}" data-theme="${widgetTheme}"></script>`;
  const pixelCode = `<img src="https://promoclub.mx/pixel/${slug}.gif" width="1" height="1" style="display:none" />`;

  const copyToClipboard = (text, field) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const updateSocialLink = (platform, value) => {
    onChange('socialLinks', { ...socialLinks, [platform]: value });
  };

  const socialPlatforms = [
    { key: 'facebook', label: 'Facebook', icon: 'Facebook', placeholder: 'https://facebook.com/tu-negocio', color: 'text-blue-600' },
    { key: 'instagram', label: 'Instagram', icon: 'Instagram', placeholder: 'https://instagram.com/tu-negocio', color: 'text-pink-600' },
    { key: 'twitter', label: 'X / Twitter', icon: 'Twitter', placeholder: 'https://x.com/tu-negocio', color: 'text-sky-500' },
    { key: 'tiktok', label: 'TikTok', icon: 'Music', placeholder: 'https://tiktok.com/@tu-negocio', color: 'text-gray-900' },
    { key: 'youtube', label: 'YouTube', icon: 'Youtube', placeholder: 'https://youtube.com/@tu-negocio', color: 'text-red-600' },
    { key: 'linkedin', label: 'LinkedIn', icon: 'Linkedin', placeholder: 'https://linkedin.com/company/tu-negocio', color: 'text-blue-700' },
    { key: 'whatsapp', label: 'WhatsApp Business', icon: 'MessageCircle', placeholder: 'https://wa.me/521234567890', color: 'text-green-600' },
    { key: 'pinterest', label: 'Pinterest', icon: 'Pin', placeholder: 'https://pinterest.com/tu-negocio', color: 'text-red-500' },
    { key: 'snapchat', label: 'Snapchat', icon: 'Camera', placeholder: 'https://snapchat.com/add/tu-negocio', color: 'text-yellow-500' },
    { key: 'threads', label: 'Threads', icon: 'AtSign', placeholder: 'https://threads.net/@tu-negocio', color: 'text-gray-800' },
  ];

  const filledSocialCount = Object.values(socialLinks)?.filter(v => v?.trim())?.length;

  return (
    <div className="space-y-0">
      <div className="flex gap-1 mb-6 bg-muted/50 p-1 rounded-xl overflow-x-auto">
        {sections?.map(s => (
          <button key={s?.id} onClick={() => setActiveSection(s?.id)}
            className={`flex-shrink-0 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
              activeSection === s?.id ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}>
            <Icon name={s?.icon} size={14} />
            <span>{s?.label}</span>
          </button>
        ))}
      </div>
      {/* ── Página web ── */}
      {activeSection === 'landing' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Página web pública auto-generada</h3>
              <p className="text-xs text-muted-foreground mt-1">PromoClub genera automáticamente una página web para tu negocio en <span className="text-primary">promoclub.mx/{slug}</span></p>
            </div>
            <button onClick={() => onChange('landingActive', !landingActive)}
              className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${landingActive ? 'bg-primary' : 'bg-muted'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${landingActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="bg-muted/30 border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white border border-border rounded-lg px-3 py-1 text-xs text-muted-foreground">
                promoclub.mx/{slug}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 space-y-3">
              <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-xs text-muted-foreground">Foto de portada</span>
              </div>
              <div>
                <div className="h-4 bg-foreground/10 rounded w-1/2 mb-2" />
                <div className="h-3 bg-foreground/5 rounded w-3/4" />
              </div>
              <div className="flex gap-2">
                {['Horarios','Ubicación','Menú','Promos']?.map(t => (
                  <div key={t} className="px-2 py-1 bg-primary/10 rounded text-xs text-primary">{t}</div>
                ))}
              </div>
              <div className="flex items-center justify-center">
                <div className="px-4 py-2 bg-primary text-primary-foreground text-xs rounded-lg">Descarga PromoClub</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700">
            <Icon name="Info" size={14} className="inline mr-1" />
            El contenido se actualiza automáticamente cuando modificas tu ficha. No necesitas editar la página web por separado.
          </div>
        </div>
      )}
      {/* ── Meta Tags ── */}
      {activeSection === 'meta' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Meta Tags para SEO y redes sociales</h3>
            <p className="text-xs text-muted-foreground">Controla cómo aparece tu negocio en buscadores y cuando se comparte en redes sociales.</p>
          </div>

          {/* Basic Meta */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full" />
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Meta básicos</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Meta Title <span className="text-muted-foreground font-normal">(recomendado: 50–60 caracteres)</span>
              </label>
              <input type="text" value={metaTitle} onChange={e => onChange('metaTitle', e?.target?.value)}
                placeholder={`${formData?.businessName || 'Nombre del negocio'} | PromoClub`} maxLength={70}
                className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-muted-foreground">Aparece en la pestaña del navegador y en Google</p>
                <span className={`text-xs ${metaTitle?.length > 60 ? 'text-red-500' : 'text-muted-foreground'}`}>{metaTitle?.length}/70</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Meta Description <span className="text-muted-foreground font-normal">(recomendado: 150–160 caracteres)</span>
              </label>
              <textarea value={metaDescription} onChange={e => onChange('metaDescription', e?.target?.value)}
                placeholder="Describe tu negocio en 1-2 oraciones para que los usuarios sepan qué ofreces..."
                maxLength={200} rows={3}
                className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-muted-foreground">Descripción que aparece bajo el título en Google</p>
                <span className={`text-xs ${metaDescription?.length > 160 ? 'text-amber-500' : 'text-muted-foreground'}`}>{metaDescription?.length}/200</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Palabras clave <span className="text-muted-foreground font-normal">(separadas por coma)</span>
              </label>
              <input type="text" value={metaKeywords} onChange={e => onChange('metaKeywords', e?.target?.value)}
                placeholder="restaurante, comida italiana, pizza, delivery, CDMX"
                className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <p className="text-xs text-muted-foreground mt-1">Google no las usa directamente, pero ayudan a organizar tu contenido</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">URL canónica</label>
              <input type="url" value={canonicalUrl} onChange={e => onChange('canonicalUrl', e?.target?.value)}
                placeholder={`https://promoclub.mx/${slug}`}
                className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <p className="text-xs text-muted-foreground mt-1">Evita contenido duplicado indicando la URL principal</p>
            </div>
          </div>

          {/* Open Graph */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-500 rounded-full" />
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Open Graph (Facebook, WhatsApp, LinkedIn)</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">OG Title</label>
              <input type="text" value={ogTitle} onChange={e => onChange('ogTitle', e?.target?.value)}
                placeholder={metaTitle || `${formData?.businessName || 'Nombre del negocio'}`}
                className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">OG Description</label>
              <textarea value={ogDescription} onChange={e => onChange('ogDescription', e?.target?.value)}
                placeholder={metaDescription || 'Descripción para compartir en redes sociales...'} rows={2}
                className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                OG Image URL <span className="text-muted-foreground font-normal">(recomendado: 1200×630 px)</span>
              </label>
              <input type="url" value={ogImage} onChange={e => onChange('ogImage', e?.target?.value)}
                placeholder="https://ejemplo.com/imagen-compartir.jpg"
                className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <p className="text-xs text-muted-foreground mt-1">Imagen que aparece al compartir el link en redes sociales</p>
            </div>
            {(ogTitle || metaTitle || formData?.businessName) && (
              <div className="border border-border rounded-xl overflow-hidden">
                <p className="text-xs font-medium text-muted-foreground px-3 py-2 bg-muted/30 border-b border-border">Vista previa al compartir</p>
                <div className="bg-white">
                  <div className="h-28 bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center overflow-hidden">
                    {ogImage
                      ? <img src={ogImage} alt="OG preview" className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />
                      : <Icon name="Image" size={32} className="text-muted-foreground/40" />
                    }
                  </div>
                  <div className="p-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 uppercase">promoclub.mx</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{ogTitle || metaTitle || formData?.businessName || 'Título del negocio'}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{ogDescription || metaDescription || 'Descripción del negocio'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Twitter Card */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-sky-500 rounded-full" />
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Twitter / X Card</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-2">Tipo de tarjeta</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'summary', label: 'Summary', desc: 'Imagen pequeña + texto' },
                  { value: 'summary_large_image', label: 'Large Image', desc: 'Imagen grande destacada' },
                ]?.map(opt => (
                  <button key={opt?.value} onClick={() => onChange('twitterCard', opt?.value)}
                    className={`p-3 border rounded-xl text-left transition-all ${twitterCard === opt?.value ? 'border-sky-400 bg-sky-50' : 'border-border hover:bg-muted/30'}`}>
                    <p className={`text-xs font-semibold ${twitterCard === opt?.value ? 'text-sky-700' : 'text-foreground'}`}>{opt?.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt?.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generated code */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-foreground">Código generado automáticamente</p>
              <button onClick={() => copyToClipboard(
                `<meta name="title" content="${metaTitle || formData?.businessName || ''}" />\n<meta name="description" content="${metaDescription}" />\n<meta name="keywords" content="${metaKeywords}" />\n<meta property="og:title" content="${ogTitle || metaTitle || ''}" />\n<meta property="og:description" content="${ogDescription || metaDescription || ''}" />\n<meta property="og:image" content="${ogImage}" />\n<meta name="twitter:card" content="${twitterCard}" />`,
                'meta-code'
              )} className="flex items-center gap-1.5 px-2 py-1 bg-card border border-border rounded-lg text-xs hover:bg-muted transition-colors">
                <Icon name={copiedField === 'meta-code' ? 'Check' : 'Copy'} size={12} />
                {copiedField === 'meta-code' ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <pre className="bg-muted/50 border border-border rounded-xl p-4 text-xs text-foreground overflow-x-auto whitespace-pre-wrap break-all">
{`<meta name="title" content="${metaTitle || formData?.businessName || 'Nombre del negocio'}" />
<meta name="description" content="${metaDescription || 'Descripción del negocio'}" />
<meta name="keywords" content="${metaKeywords || 'palabras, clave'}" />
<meta property="og:title" content="${ogTitle || metaTitle || 'Título OG'}" />
<meta property="og:description" content="${ogDescription || metaDescription || 'Descripción OG'}" />
<meta property="og:image" content="${ogImage || 'https://promoclub.mx/og-default.jpg'}" />
<meta name="twitter:card" content="${twitterCard}" />`}
            </pre>
          </div>
        </div>
      )}
      {/* ── Favicon ── */}
      {activeSection === 'favicon' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Favicon del negocio</h3>
            <p className="text-xs text-muted-foreground">El favicon es el pequeño ícono que aparece en la pestaña del navegador y en marcadores.</p>
          </div>
          <div className="flex items-center gap-4 p-4 border border-border rounded-xl bg-muted/20">
            <div className="w-16 h-16 border-2 border-dashed border-border rounded-xl flex items-center justify-center bg-white overflow-hidden flex-shrink-0">
              {faviconUrl
                ? <img src={faviconUrl} alt="Favicon preview" className="w-12 h-12 object-contain" onError={e => { e.target.style.display='none'; }} />
                : <Icon name="Globe" size={24} className="text-muted-foreground/40" />
              }
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Vista previa del favicon</p>
              <p className="text-xs text-muted-foreground mt-0.5">Aparece en la pestaña del navegador</p>
              <div className="flex items-center gap-1.5 mt-2 px-2 py-1 bg-white border border-gray-200 rounded-lg w-fit">
                <div className="w-4 h-4 bg-primary/20 rounded-sm flex items-center justify-center overflow-hidden">
                  {faviconUrl
                    ? <img src={faviconUrl} alt="tab favicon" className="w-full h-full object-contain" />
                    : <div className="w-3 h-3 bg-primary/40 rounded-sm" />
                  }
                </div>
                <span className="text-xs text-gray-600">{formData?.businessName || 'Tu negocio'}</span>
                <span className="text-gray-300">×</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">URL del favicon</label>
              <div className="flex gap-2">
                <input type="url" value={faviconUrl} onChange={e => onChange('faviconUrl', e?.target?.value)}
                  placeholder="https://ejemplo.com/favicon.ico"
                  className="flex-1 px-3 py-2 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                {faviconUrl && (
                  <button onClick={() => onChange('faviconUrl', '')}
                    className="px-3 py-2 border border-border rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                    <Icon name="X" size={16} />
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Ingresa la URL de tu favicon existente</p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground">o sube un archivo</span></div>
            </div>
            <label className="block border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer">
              <input type="file" accept=".ico,.png,.svg" className="hidden"
                onChange={e => {
                  const file = e?.target?.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = ev => onChange('faviconUrl', ev?.target?.result);
                    reader?.readAsDataURL(file);
                  }
                }} />
              <Icon name="Upload" size={24} className="mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm font-medium text-foreground">Arrastra o haz clic para subir</p>
              <p className="text-xs text-muted-foreground mt-1">Formatos: .ico, .png, .svg · Tamaño recomendado: 32×32 px o 64×64 px</p>
            </label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { size: '16×16', use: 'Navegadores', icon: 'Monitor' },
              { size: '32×32', use: 'Escritorio', icon: 'Laptop' },
              { size: '180×180', use: 'Apple Touch', icon: 'Smartphone' },
            ]?.map(item => (
              <div key={item?.size} className="p-3 border border-border rounded-xl text-center">
                <Icon name={item?.icon} size={18} className="mx-auto text-muted-foreground mb-1.5" />
                <p className="text-xs font-semibold text-foreground">{item?.size}</p>
                <p className="text-xs text-muted-foreground">{item?.use}</p>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
            <Icon name="AlertTriangle" size={14} className="inline mr-1" />
            PromoClub genera automáticamente un favicon con el logo de tu negocio. Sube uno personalizado solo si deseas reemplazarlo.
          </div>
        </div>
      )}
      {/* ── Redes Sociales ── */}
      {activeSection === 'social' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Links de redes sociales</h3>
              <p className="text-xs text-muted-foreground">Agrega los perfiles de tu negocio en redes sociales. Aparecerán en tu página web y ficha pública.</p>
            </div>
            {filledSocialCount > 0 && (
              <span className="text-xs font-medium px-2.5 py-1 bg-primary/10 text-primary rounded-full">{filledSocialCount} conectadas</span>
            )}
          </div>
          <div className="space-y-3">
            {socialPlatforms?.map(platform => (
              <div key={platform?.key} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl border border-border bg-white flex items-center justify-center flex-shrink-0 ${platform?.color}`}>
                  <Icon name={platform?.icon} size={18} />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-foreground mb-1">{platform?.label}</label>
                  <div className="flex items-center gap-2">
                    <input type="url" value={socialLinks?.[platform?.key] || ''} onChange={e => updateSocialLink(platform?.key, e?.target?.value)}
                      placeholder={platform?.placeholder}
                      className="flex-1 px-3 py-2 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    {socialLinks?.[platform?.key] && (
                      <a href={socialLinks?.[platform?.key]} target="_blank" rel="noopener noreferrer"
                        className="p-2 border border-border rounded-xl text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
                        <Icon name="ExternalLink" size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filledSocialCount > 0 && (
            <div className="p-4 border border-border rounded-xl bg-muted/20">
              <p className="text-xs font-medium text-foreground mb-3">Vista previa en tu ficha pública:</p>
              <div className="flex flex-wrap gap-2">
                {socialPlatforms?.filter(p => socialLinks?.[p?.key]?.trim())?.map(platform => (
                  <a key={platform?.key} href={socialLinks?.[platform?.key]} target="_blank" rel="noopener noreferrer"
                    className={`flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border rounded-full text-xs font-medium hover:shadow-sm transition-all ${platform?.color}`}>
                    <Icon name={platform?.icon} size={13} />
                    {platform?.label}
                  </a>
                ))}
              </div>
            </div>
          )}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700">
            <Icon name="Info" size={14} className="inline mr-1" />
            Los links de redes sociales también se incluyen en el structured data (JSON-LD) de tu página para mejorar el SEO.
          </div>
        </div>
      )}
      {/* ── QR imprimible ── */}
      {activeSection === 'qr' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">QR que lleva a tu página web</h3>
            <p className="text-xs text-muted-foreground">Al escanearse abre <span className="text-primary">promoclub.mx/{slug}</span>. Únelo en tarjetas, flyers, facturas y empaques.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex-shrink-0 border border-border rounded-xl p-6 bg-white">
              <div className="w-32 h-32 bg-foreground rounded-xl flex items-center justify-center">
                <div className="w-28 h-28 bg-white rounded-lg flex items-center justify-center">
                  <Icon name="QrCode" size={64} className="text-foreground" />
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">promoclub.mx/{slug}</p>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-3">Formatos descargables</p>
              <div className="space-y-2">
                {[
                  { label: 'QR solo (PNG)', icon: 'Image', desc: 'Para diseñadores' },
                  { label: 'QR solo (SVG)', icon: 'Code', desc: 'Vectorial, escalable' },
                  { label: 'Tarjeta de presentación (PDF A7)', icon: 'CreditCard', desc: 'QR + info del negocio' },
                  { label: 'Poster (PDF A4)', icon: 'FileText', desc: 'Para imprimir en tienda' },
                  { label: 'Sticker cuadrado (PDF 5×5cm)', icon: 'Sticker', desc: 'Para empaques y mesas' },
                ]?.map(item => (
                  <button key={item?.label}
                    className="w-full flex items-center gap-3 px-4 py-3 border border-border rounded-xl hover:bg-muted/30 transition-colors text-left">
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name={item?.icon} size={16} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{item?.label}</p>
                      <p className="text-xs text-muted-foreground">{item?.desc}</p>
                    </div>
                    <Icon name="Download" size={16} className="text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ── SEO Google ── */}
      {activeSection === 'seo' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">SEO optimizado para Google local</h3>
            <p className="text-xs text-muted-foreground">Tu página incluye automáticamente structured data (JSON-LD) para que Google la indexe como negocio local.</p>
          </div>
          <div className="space-y-3">
            {[
              { label: 'LocalBusiness schema', status: 'active', desc: 'Tipo de negocio, nombre, dirección, coordenadas' },
              { label: 'OpeningHoursSpecification', status: 'active', desc: 'Horarios de operación en formato Google' },
              { label: 'AggregateRating', status: formData?.hasReviews ? 'active' : 'pending', desc: 'Reseñas agregadas (requiere reseñas)' },
              { label: 'Menu schema', status: formData?.menuCategories?.length > 0 ? 'active' : 'pending', desc: 'Menú digital (requiere menú configurado)' },
              { label: 'ImageObject', status: formData?.cover ? 'active' : 'pending', desc: 'Fotos del negocio (requiere fotos)' },
              { label: 'SameAs (redes sociales)', status: filledSocialCount > 0 ? 'active' : 'pending', desc: `${filledSocialCount} redes sociales vinculadas` },
            ]?.map(item => (
              <div key={item?.label} className="flex items-center gap-3 p-3 border border-border rounded-xl">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item?.status === 'active' ? 'bg-green-500' : 'bg-amber-400'}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item?.label}</p>
                  <p className="text-xs text-muted-foreground">{item?.desc}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${item?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {item?.status === 'active' ? 'Activo' : 'Pendiente'}
                </span>
              </div>
            ))}
          </div>
          <div className="bg-muted/30 border border-border rounded-xl p-4">
            <p className="text-xs font-medium text-foreground mb-2">Cómo te ve Google (Knowledge Panel):</p>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-xs space-y-2">
              <p className="font-semibold text-gray-900">{formData?.businessName || 'Nombre del negocio'}</p>
              <p className="text-gray-500">{formData?.subcategory || formData?.vertical || 'Categoría'}</p>
              <div className="flex items-center gap-1 text-yellow-500">★★★★☆ <span className="text-gray-500">4.2 (128 reseñas)</span></div>
              <p className="text-gray-600">{formData?.street || 'Dirección del negocio'}, {formData?.city || 'Ciudad'}</p>
              <p className="text-green-600">Abierto ahora</p>
            </div>
          </div>
        </div>
      )}
      {/* ── Widget ── */}
      {activeSection === 'widget' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Widget embebible para tu sitio web</h3>
            <p className="text-xs text-muted-foreground">Copia y pega este código en tu sitio web para mostrar tu presencia en PromoClub.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-2">Tamaño</label>
              <div className="flex gap-2">
                {['small','medium','large']?.map(s => (
                  <button key={s} onClick={() => onChange('widgetSize', s)}
                    className={`flex-1 py-1.5 text-xs font-medium border rounded-lg transition-colors ${
                      widgetSize === s ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
                    }`}>
                    {s === 'small' ? 'Pequeño' : s === 'medium' ? 'Mediano' : 'Grande'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-2">Estilo</label>
              <div className="flex gap-2">
                {['light','dark']?.map(t => (
                  <button key={t} onClick={() => onChange('widgetTheme', t)}
                    className={`flex-1 py-1.5 text-xs font-medium border rounded-lg transition-colors ${
                      widgetTheme === t ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
                    }`}>
                    {t === 'light' ? 'Claro' : 'Oscuro'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Widget preview */}
          <div className={`border border-border rounded-xl p-4 ${ widgetTheme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Icon name="Building2" size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${ widgetTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formData?.businessName || 'Tu negocio'}</p>
                <div className="flex items-center gap-1 text-yellow-500 text-xs">★★★★☆ <span className={widgetTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>4.2</span></div>
              </div>
              <div className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-lg">Ver en PromoClub</div>
            </div>
          </div>
          <div className="relative">
            <pre className="bg-muted/50 border border-border rounded-xl p-4 text-xs text-foreground overflow-x-auto whitespace-pre-wrap break-all">{widgetCode}</pre>
            <button onClick={() => copyToClipboard(widgetCode, 'widget')}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-card border border-border rounded-lg text-xs hover:bg-muted transition-colors">
              <Icon name={copiedField === 'widget' ? 'Check' : 'Copy'} size={12} />
              {copiedField === 'widget' ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>
      )}
      {/* ── Pixel ── */}
      {activeSection === 'pixel' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Pixel de tracking</h3>
              <p className="text-xs text-muted-foreground mt-1">Mide cuántos visitantes de tu web luego visitan tu negocio físico.</p>
            </div>
            <button onClick={() => onChange('pixelActive', !pixelActive)}
              className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${pixelActive ? 'bg-primary' : 'bg-muted'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${pixelActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          {pixelActive && (
            <>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Visitas web', value: '247', icon: 'Globe', color: 'text-blue-600 bg-blue-50' },
                  { label: 'Visitas físicas', value: '31', icon: 'MapPin', color: 'text-green-600 bg-green-50' },
                  { label: 'Conversión', value: '12.6%', icon: 'TrendingUp', color: 'text-primary bg-primary/10' },
                ]?.map(stat => (
                  <div key={stat?.label} className="border border-border rounded-xl p-4 text-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${stat?.color}`}>
                      <Icon name={stat?.icon} size={20} />
                    </div>
                    <p className="text-xl font-bold text-foreground">{stat?.value}</p>
                    <p className="text-xs text-muted-foreground">{stat?.label}</p>
                  </div>
                ))}
              </div>
              <div className="relative">
                <pre className="bg-muted/50 border border-border rounded-xl p-4 text-xs text-foreground overflow-x-auto whitespace-pre-wrap break-all">{pixelCode}</pre>
                <button onClick={() => copyToClipboard(pixelCode, 'pixel')}
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-card border border-border rounded-lg text-xs hover:bg-muted transition-colors">
                  <Icon name={copiedField === 'pixel' ? 'Check' : 'Copy'} size={12} />
                  {copiedField === 'pixel' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default WebPresenceForm;
