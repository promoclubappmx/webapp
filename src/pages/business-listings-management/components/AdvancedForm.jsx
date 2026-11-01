import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import PrintableQRForm from './PrintableQRForm';

const AdvancedForm = ({ formData, onChange }) => {
  const [activeSection, setActiveSection] = useState('videos');
  const [keywordInput, setKeywordInput] = useState('');
  const [copiedField, setCopiedField] = useState(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoUrlError, setVideoUrlError] = useState('');
  const [shortVideoInput, setShortVideoInput] = useState('');
  const [shortVideoError, setShortVideoError] = useState('');

  // Auto-navigate to QR section if requested via sessionStorage
  useEffect(() => {
    const section = sessionStorage?.getItem('blm_section');
    if (section === 'qr') {
      setActiveSection('qr');
      sessionStorage?.removeItem('blm_section');
    }
  }, []);

  // Auto-generate slug from business name
  useEffect(() => {
    if (formData?.businessName && !formData?.slug) {
      const autoSlug = formData?.businessName
        ?.toLowerCase()
        ?.normalize('NFD')
        ?.replace(/[\u0300-\u036f]/g, '')
        ?.replace(/[^a-z0-9\s-]/g, '')
        ?.replace(/[\s_-]+/g, '-')
        ?.replace(/^-+|-+$/g, '');
      onChange('slug', autoSlug);
    }
  }, [formData?.businessName]);

  // Auto-generate meta description from captured data
  const generateMetaDescription = () => {
    const parts = [];
    if (formData?.businessName) parts?.push(formData?.businessName);
    if (formData?.shortDescription) parts?.push(formData?.shortDescription);
    else {
      if (formData?.city) parts?.push(`en ${formData?.city}`);
      if (formData?.tipo_establecimiento_id) parts?.push('');
    }
    const desc = parts?.join(' — ')?.slice(0, 160);
    onChange('metaDescription', desc);
  };

  const slug = formData?.slug || '';
  const metaDesc = formData?.metaDescription || '';
  const keywords = formData?.searchKeywords || [];
  const videos = formData?.videoLinks || [];
  const shortVideos = formData?.shortVideoLinks || [];

  const metaTitle = formData?.metaTitle || '';
  const metaKeywords = formData?.metaKeywords || '';
  const ogTitle = formData?.ogTitle || '';
  const ogDescription = formData?.ogDescription || '';
  const ogImage = formData?.ogImage || '';
  const twitterCard = formData?.twitterCard || 'summary_large_image';
  const canonicalUrl = formData?.canonicalUrl || '';

  const widgetSize = formData?.widgetSize || 'medium';
  const widgetTheme = formData?.widgetTheme || 'light';

  const handleKeyword = (e) => {
    if ((e?.key === 'Enter' || e?.key === ',') && keywordInput?.trim() && keywords?.length < 10) {
      e?.preventDefault();
      onChange('searchKeywords', [...keywords, keywordInput?.trim()]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw) => onChange('searchKeywords', keywords?.filter(k => k !== kw));

  // Detect video platform
  const detectPlatform = (url) => {
    if (!url) return null;
    if (url?.includes('youtube.com') || url?.includes('youtu.be')) return 'YouTube';
    if (url?.includes('vimeo.com')) return 'Vimeo';
    return null;
  };

  // Detect short video platform
  const detectShortPlatform = (url) => {
    if (!url) return null;
    if (url?.includes('instagram.com')) return 'Instagram';
    if (url?.includes('tiktok.com')) return 'TikTok';
    return null;
  };

  // Get YouTube embed ID
  const getYoutubeId = (url) => {
    const match = url?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match?.[1] || null;
  };

  // Get Vimeo embed ID
  const getVimeoId = (url) => {
    const match = url?.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match?.[1] || null;
  };

  const handleAddVideo = () => {
    setVideoUrlError('');
    const url = videoUrlInput?.trim();
    if (!url) { setVideoUrlError('Ingresa una URL'); return; }
    const platform = detectPlatform(url);
    if (!platform) { setVideoUrlError('Solo se aceptan URLs de YouTube o Vimeo'); return; }
    if (videos?.length >= 3) { setVideoUrlError('Máximo 3 videos permitidos'); return; }
    onChange('videoLinks', [...videos, { id: Date.now(), url, platform }]);
    setVideoUrlInput('');
    setVideoModalOpen(false);
  };

  const handleAddShortVideo = () => {
    setShortVideoError('');
    const url = shortVideoInput?.trim();
    if (!url) { setShortVideoError('Ingresa una URL'); return; }
    const platform = detectShortPlatform(url);
    if (!platform) { setShortVideoError('Solo se aceptan URLs de Instagram o TikTok'); return; }
    onChange('shortVideoLinks', [...shortVideos, { id: Date.now(), url, platform }]);
    setShortVideoInput('');
  };

  const removeVideo = (id) => onChange('videoLinks', videos?.filter(v => v?.id !== id));
  const removeShortVideo = (id) => onChange('shortVideoLinks', shortVideos?.filter(v => v?.id !== id));

  const copyToClipboard = (text, field) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Sections — Web y SEO moved to last
  const sections = [
    { id: 'videos', label: 'Videos', icon: 'Video', color: 'text-rose-700', bg: 'bg-rose-100', activeBg: 'bg-rose-600', hoverBg: 'hover:bg-rose-50', btn: 'bg-rose-600 hover:bg-rose-700 text-white' },
    { id: 'widget', label: 'Widget', icon: 'Code', color: 'text-violet-700', bg: 'bg-violet-100', activeBg: 'bg-violet-600', hoverBg: 'hover:bg-violet-50', btn: 'bg-violet-600 hover:bg-violet-700 text-white' },
    { id: 'qr', label: 'QR Imprimible', icon: 'QrCode', color: 'text-emerald-700', bg: 'bg-emerald-100', activeBg: 'bg-emerald-600', hoverBg: 'hover:bg-emerald-50', btn: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
    { id: 'web', label: 'Web y SEO', icon: 'Globe', color: 'text-sky-700', bg: 'bg-sky-100', activeBg: 'bg-sky-600', hoverBg: 'hover:bg-sky-50', btn: 'bg-sky-600 hover:bg-sky-700 text-white' },
  ];

  const activeSecObj = sections?.find(s => s?.id === activeSection) || sections?.[0];

  const appProfileUrl = `https://promoclub.mx/negocio/${slug || 'tu-negocio'}`;
  const widgetCode = `<!-- Widget PromoClub: lleva a la ficha en la app -->
<div id="promoclub-widget-${slug || 'tu-negocio'}"></div>
<script>
  (function(w,d,s,o,f,js,fjs){
    w['PromoclubWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];
    js.id='promoclub-wjs';js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','pcw','https://promoclub.mx/widget.js'));
  pcw('init', { business: '${slug || 'tu-negocio'}', size: '${widgetSize}', theme: '${widgetTheme}', target: 'app' });
</script>`;

  return (
    <div className="space-y-0">
      {/* Sub-nav */}
      <div className="border-b border-border bg-muted/5 overflow-x-auto mb-6">
        <div className="flex items-center gap-2 px-1 py-3 min-w-max">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2">Sección:</span>
          {sections?.map(s => {
            const isActive = activeSection === s?.id;
            return (
              <button key={s?.id} onClick={() => setActiveSection(s?.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                  isActive
                    ? `${s?.activeBg} text-white shadow-md ring-2 ring-offset-1 ring-current`
                    : `${s?.bg} ${s?.color} ${s?.hoverBg} hover:shadow-sm`
                }`}>
                <Icon name={s?.icon} size={13} className={isActive ? 'text-white' : s?.color} />
                {s?.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Videos */}
      {activeSection === 'videos' && (
        <div className="space-y-6">
          {/* YouTube / Vimeo */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Videos externos (YouTube / Vimeo)</h3>
                <p className="text-xs text-muted-foreground">Máximo 3 videos. Se mostrarán en tu ficha pública.</p>
              </div>
              {videos?.length < 3 && (
                <button onClick={() => { setVideoUrlInput(''); setVideoUrlError(''); setVideoModalOpen(true); }}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activeSecObj?.btn}`}>
                  <Icon name="Plus" size={14} /> Agregar video
                </button>
              )}
            </div>

            {/* Video URL Modal */}
            {videoModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                      <Icon name="Youtube" size={20} className="text-rose-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">Agregar video</h3>
                      <p className="text-xs text-muted-foreground">YouTube o Vimeo</p>
                    </div>
                    <button onClick={() => setVideoModalOpen(false)} className="ml-auto p-1.5 text-muted-foreground hover:text-foreground">
                      <Icon name="X" size={18} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">URL del video</label>
                      <input
                        type="url"
                        autoFocus
                        value={videoUrlInput}
                        onChange={e => { setVideoUrlInput(e?.target?.value); setVideoUrlError(''); }}
                        onKeyDown={e => e?.key === 'Enter' && handleAddVideo()}
                        placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
                        className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      {videoUrlError && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                          <Icon name="AlertCircle" size={12} /> {videoUrlError}
                        </p>
                      )}
                    </div>
                    {/* Preview if valid YouTube */}
                    {videoUrlInput && detectPlatform(videoUrlInput) === 'YouTube' && getYoutubeId(videoUrlInput) && (
                      <div className="rounded-xl overflow-hidden border border-border">
                        <iframe
                          src={`https://www.youtube.com/embed/${getYoutubeId(videoUrlInput)}`}
                          className="w-full h-40"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="Video preview"
                        />
                      </div>
                    )}
                    {videoUrlInput && detectPlatform(videoUrlInput) === 'Vimeo' && getVimeoId(videoUrlInput) && (
                      <div className="rounded-xl overflow-hidden border border-border">
                        <iframe
                          src={`https://player.vimeo.com/video/${getVimeoId(videoUrlInput)}`}
                          className="w-full h-40"
                          frameBorder="0"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                          title="Video preview"
                        />
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => setVideoModalOpen(false)}
                        className="flex-1 px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                        Cancelar
                      </button>
                      <button onClick={handleAddVideo}
                        className={`flex-1 px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${activeSecObj?.btn}`}>
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {videos?.length === 0 ? (
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                <Icon name="Youtube" size={32} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-1">Agrega videos de YouTube o Vimeo</p>
                <p className="text-xs text-muted-foreground mb-3">Se mostrarán en tu ficha pública de PromoClub</p>
                <button onClick={() => { setVideoUrlInput(''); setVideoUrlError(''); setVideoModalOpen(true); }}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeSecObj?.btn}`}>
                  + Agregar video
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {videos?.map(v => {
                  const ytId = v?.platform === 'YouTube' ? getYoutubeId(v?.url) : null;
                  const vimeoId = v?.platform === 'Vimeo' ? getVimeoId(v?.url) : null;
                  return (
                    <div key={v?.id} className="border border-border rounded-xl overflow-hidden">
                      {ytId && (
                        <div className="relative w-full" style={{ paddingTop: '40%' }}>
                          <iframe
                            src={`https://www.youtube.com/embed/${ytId}`}
                            className="absolute inset-0 w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={v?.url}
                          />
                        </div>
                      )}
                      {vimeoId && (
                        <div className="relative w-full" style={{ paddingTop: '40%' }}>
                          <iframe
                            src={`https://player.vimeo.com/video/${vimeoId}`}
                            className="absolute inset-0 w-full h-full"
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            title={v?.url}
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-3 p-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${v?.platform === 'YouTube' ? 'bg-red-100' : 'bg-blue-100'}`}>
                          <Icon name={v?.platform === 'YouTube' ? 'Youtube' : 'Video'} size={16} className={v?.platform === 'YouTube' ? 'text-red-600' : 'text-blue-600'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground">{v?.platform}</p>
                          <p className="text-xs text-muted-foreground truncate">{v?.url}</p>
                        </div>
                        <button onClick={() => removeVideo(v?.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                          <Icon name="Trash2" size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Short video (Instagram / TikTok) */}
          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 bg-rose-500 rounded-full" />
              <h3 className="text-sm font-semibold text-foreground">Video corto (tipo Reel)</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Agrega la URL de un Reel de Instagram o un video de TikTok. El contenido se carga directamente desde la red social.
            </p>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="url"
                    value={shortVideoInput}
                    onChange={e => { setShortVideoInput(e?.target?.value); setShortVideoError(''); }}
                    onKeyDown={e => e?.key === 'Enter' && handleAddShortVideo()}
                    placeholder="https://www.instagram.com/reel/... o https://www.tiktok.com/@..."
                    className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  {shortVideoInput && detectShortPlatform(shortVideoInput) && (
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-0.5 rounded-full ${
                      detectShortPlatform(shortVideoInput) === 'Instagram' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {detectShortPlatform(shortVideoInput)}
                    </span>
                  )}
                </div>
                <button onClick={handleAddShortVideo}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${activeSecObj?.btn} flex-shrink-0`}>
                  <Icon name="Plus" size={16} />
                </button>
              </div>
              {shortVideoError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <Icon name="AlertCircle" size={12} /> {shortVideoError}
                </p>
              )}
              {/* Platform icons */}
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg">
                  <Icon name="Instagram" size={14} className="text-white" />
                  <span className="text-xs font-medium text-white">Instagram Reels</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-lg">
                  <Icon name="Music" size={14} className="text-white" />
                  <span className="text-xs font-medium text-white">TikTok</span>
                </div>
              </div>
              {shortVideos?.length > 0 && (
                <div className="space-y-2">
                  {shortVideos?.map(v => (
                    <div key={v?.id} className="flex items-center gap-3 border border-border rounded-xl p-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        v?.platform === 'Instagram' ? 'bg-gradient-to-br from-pink-500 to-purple-600' : 'bg-gray-900'
                      }`}>
                        <Icon name={v?.platform === 'Instagram' ? 'Instagram' : 'Music'} size={15} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{v?.platform}</p>
                        <p className="text-xs text-muted-foreground truncate">{v?.url}</p>
                      </div>
                      <a href={v?.url} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                        <Icon name="ExternalLink" size={14} />
                      </a>
                      <button onClick={() => removeShortVideo(v?.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Widget — functional */}
      {activeSection === 'widget' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Widget de ficha en PromoClub</h3>
            <p className="text-xs text-muted-foreground">
              Genera un widget para incrustar en tu sitio web que lleva a los visitantes directamente a tu ficha en la app de PromoClub.
            </p>
          </div>

          {/* Widget config */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-2">Tamaño del widget</label>
              <div className="flex gap-2">
                {['small','medium','large']?.map(s => (
                  <button key={s} onClick={() => onChange('widgetSize', s)}
                    className={`flex-1 py-1.5 text-xs font-medium border rounded-lg transition-colors ${
                      widgetSize === s ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-border text-muted-foreground hover:bg-muted'
                    }`}>
                    {s === 'small' ? 'Pequeño' : s === 'medium' ? 'Mediano' : 'Grande'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-2">Estilo visual</label>
              <div className="flex gap-2">
                {['light','dark']?.map(t => (
                  <button key={t} onClick={() => onChange('widgetTheme', t)}
                    className={`flex-1 py-1.5 text-xs font-medium border rounded-lg transition-colors ${
                      widgetTheme === t ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-border text-muted-foreground hover:bg-muted'
                    }`}>
                    {t === 'light' ? 'Claro' : 'Oscuro'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Widget live preview */}
          <div>
            <p className="text-xs font-medium text-foreground mb-3">Vista previa del widget:</p>
            <div className={`border border-border rounded-xl p-4 ${widgetTheme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name="Building2" size={22} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${widgetTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formData?.businessName || 'Tu negocio'}
                  </p>
                  <div className="flex items-center gap-1 text-yellow-500 text-xs mt-0.5">
                    ★★★★☆ <span className={`ml-1 ${widgetTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>4.2 reseñas</span>
                  </div>
                  <p className={`text-xs mt-0.5 truncate ${widgetTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formData?.shortDescription || 'Descripción de tu negocio'}
                  </p>
                </div>
                <a
                  href={appProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors flex-shrink-0"
                >
                  <Icon name="Smartphone" size={13} />
                  Ver en app
                </a>
              </div>
              <div className={`mt-3 pt-3 border-t ${widgetTheme === 'dark' ? 'border-gray-700' : 'border-gray-100'} flex items-center gap-2`}>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center">
                    <Icon name="Star" size={11} className="text-white" />
                  </div>
                  <span className={`text-xs ${widgetTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>PromoClub</span>
                </div>
                <span className={`text-xs ${widgetTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>·</span>
                <span className={`text-xs ${widgetTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  promoclub.mx/negocio/{slug || 'tu-negocio'}
                </span>
              </div>
            </div>
          </div>

          {/* App profile link */}
          <div className="flex items-center gap-3 p-4 bg-violet-50 border border-violet-200 rounded-xl">
            <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon name="Smartphone" size={18} className="text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-violet-800">Ficha en la app PromoClub</p>
              <p className="text-xs text-violet-600 truncate">{appProfileUrl}</p>
            </div>
            <button
              onClick={() => copyToClipboard(appProfileUrl, 'app-url')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
            >
              <Icon name={copiedField === 'app-url' ? 'Check' : 'Copy'} size={13} />
              {copiedField === 'app-url' ? 'Copiado' : 'Copiar link'}
            </button>
          </div>

          {/* Embed code */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-foreground">Código para incrustar en tu sitio web</p>
              <button
                onClick={() => copyToClipboard(widgetCode, 'widget')}
                className="flex items-center gap-1.5 px-2 py-1 bg-card border border-border rounded-lg text-xs hover:bg-muted transition-colors"
              >
                <Icon name={copiedField === 'widget' ? 'Check' : 'Copy'} size={12} />
                {copiedField === 'widget' ? 'Copiado' : 'Copiar código'}
              </button>
            </div>
            <pre className="bg-muted/50 border border-border rounded-xl p-4 text-xs text-foreground overflow-x-auto whitespace-pre-wrap break-all">{widgetCode}</pre>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700">
            <Icon name="Info" size={14} className="inline mr-1" />
            Al hacer clic en el widget, los usuarios son dirigidos a tu ficha completa en PromoClub donde pueden ver tus promociones, acumular puntos y dejar reseñas.
          </div>
        </div>
      )}

      {/* QR Imprimible */}
      {activeSection === 'qr' && (
        <PrintableQRForm formData={formData} onChange={onChange} />
      )}

      {/* Web y SEO — moved to last */}
      {activeSection === 'web' && (
        <div className="space-y-8">
          {/* SEO Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-sky-500 rounded-full" />
              <h3 className="text-base font-semibold text-foreground">SEO y Posicionamiento</h3>
            </div>
            <div className="space-y-5">
              {/* Slug — auto-generated */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">URL del negocio (slug)</label>
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <span className="px-3 py-2 bg-muted text-muted-foreground text-sm border-r border-border">promoclub.mx/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => onChange('slug', e?.target?.value?.toLowerCase()?.replace(/[^a-z0-9-]/g,''))}
                    placeholder="cafe-roma"
                    className="flex-1 px-3 py-2 bg-background text-foreground text-sm focus:outline-none"
                  />
                  {formData?.businessName && (
                    <button
                      onClick={() => {
                        const autoSlug = formData?.businessName
                          ?.toLowerCase()
                          ?.normalize('NFD')
                          ?.replace(/[\u0300-\u036f]/g, '')
                          ?.replace(/[^a-z0-9\s-]/g, '')
                          ?.replace(/[\s_-]+/g, '-')
                          ?.replace(/^-+|-+$/g, '');
                        onChange('slug', autoSlug);
                      }}
                      className="px-3 py-2 bg-sky-50 text-sky-700 text-xs font-medium border-l border-border hover:bg-sky-100 transition-colors whitespace-nowrap"
                    >
                      <Icon name="RefreshCw" size={12} className="inline mr-1" />
                      Auto
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">URL completa: <span className="text-primary">promoclub.mx/{slug || 'tu-negocio'}</span></p>
                {!slug && formData?.businessName && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <Icon name="Info" size={11} /> Se generará automáticamente desde el nombre del negocio
                  </p>
                )}
              </div>

              {/* Meta description — auto-generated */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-foreground">Meta descripción</label>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${ metaDesc?.length > 160 ? 'text-destructive' : 'text-muted-foreground'}`}>{metaDesc?.length}/160</span>
                    <button
                      onClick={generateMetaDescription}
                      className="flex items-center gap-1 text-xs px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-full hover:bg-sky-100 transition-colors"
                    >
                      <Icon name="Sparkles" size={10} /> Generar automáticamente
                    </button>
                  </div>
                </div>
                <textarea
                  maxLength={160}
                  rows={3}
                  value={metaDesc}
                  onChange={e => onChange('metaDescription', e?.target?.value)}
                  placeholder="Descripción optimizada para Google (máx. 160 caracteres)"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
                {/* Google preview */}
                <div className="mt-3 border border-border rounded-xl p-4 bg-white">
                  <p className="text-xs text-muted-foreground mb-2">Vista previa en Google:</p>
                  <p className="text-blue-700 text-sm font-medium">{formData?.businessName || 'Nombre del negocio'} | PromoClub</p>
                  <p className="text-green-700 text-xs">promoclub.mx/{slug || 'tu-negocio'}</p>
                  <p className="text-gray-600 text-xs mt-1">{metaDesc || 'La meta descripción aparecerá aquí...'}</p>
                </div>
              </div>

              {/* Keywords with info icon */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <label className="text-sm font-medium text-foreground">Keywords de búsqueda interna</label>
                    <div className="relative group">
                      <button type="button" className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                        <Icon name="Info" size={10} />
                      </button>
                      <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <p className="font-semibold mb-1">¿Para qué sirven?</p>
                        <p>Estas palabras clave se usan en el buscador interno de PromoClub para que los usuarios encuentren tu negocio. No afectan directamente a Google, pero mejoran tu visibilidad dentro de la plataforma.</p>
                        <p className="mt-1 text-gray-300">Ej: pizza, delivery, sin gluten, terraza</p>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{keywords?.length}/10</span>
                </div>
                <input
                  type="text"
                  value={keywordInput}
                  onChange={e => setKeywordInput(e?.target?.value)}
                  onKeyDown={handleKeyword}
                  disabled={keywords?.length >= 10}
                  placeholder="Escribe y presiona Enter para agregar..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                />
                {keywords?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {keywords?.map(kw => (
                      <span key={kw} className="inline-flex items-center gap-1 px-3 py-1 bg-muted text-foreground text-xs rounded-full">
                        {kw}
                        <button onClick={() => removeKeyword(kw)} className="hover:text-destructive"><Icon name="X" size={10} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-blue-500 rounded-full" />
              <h3 className="text-base font-semibold text-foreground">Meta Tags y Open Graph</h3>
            </div>
            <div className="space-y-5">
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
                    Palabras clave <span className="text-muted-foreground font-normal">(separadas por coma)</span>
                  </label>
                  <input type="text" value={metaKeywords} onChange={e => onChange('metaKeywords', e?.target?.value)}
                    placeholder="restaurante, comida italiana, pizza, delivery, CDMX"
                    className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">URL canónica</label>
                  <input type="url" value={canonicalUrl} onChange={e => onChange('canonicalUrl', e?.target?.value)}
                    placeholder={`https://promoclub.mx/${slug}`}
                    className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>

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
                    placeholder={metaDesc || 'Descripción para compartir en redes sociales...'} rows={2}
                    className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    OG Image URL <span className="text-muted-foreground font-normal">(recomendado: 1200×630 px)</span>
                  </label>
                  <input type="url" value={ogImage} onChange={e => onChange('ogImage', e?.target?.value)}
                    placeholder="https://ejemplo.com/imagen-compartir.jpg"
                    className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
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
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{ogDescription || metaDesc || 'Descripción del negocio'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

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
                        className={`p-3 border rounded-xl text-left transition-all ${twitterCard === opt?.value ? 'border-violet-400 bg-violet-50' : 'border-border hover:bg-muted/30'}`}>
                        <p className={`text-xs font-semibold ${twitterCard === opt?.value ? 'text-sky-700' : 'text-foreground'}`}>{opt?.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{opt?.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-foreground">Código meta generado</p>
                  <button onClick={() => copyToClipboard(
                    `<meta name="title" content="${metaTitle || formData?.businessName || ''}" />\n<meta name="description" content="${metaDesc}" />\n<meta name="keywords" content="${metaKeywords}" />\n<meta property="og:title" content="${ogTitle || metaTitle || ''}" />\n<meta property="og:description" content="${ogDescription || metaDesc || ''}" />\n<meta property="og:image" content="${ogImage}" />\n<meta name="twitter:card" content="${twitterCard}" />`,
                    'meta-code'
                  )} className="flex items-center gap-1.5 px-2 py-1 bg-card border border-border rounded-lg text-xs hover:bg-muted transition-colors">
                    <Icon name={copiedField === 'meta-code' ? 'Check' : 'Copy'} size={12} />
                    {copiedField === 'meta-code' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <pre className="bg-muted/50 border border-border rounded-xl p-4 text-xs text-foreground overflow-x-auto whitespace-pre-wrap break-all">
{`<meta name="title" content="${metaTitle || formData?.businessName || 'Nombre del negocio'}" />
<meta name="description" content="${metaDesc || 'Descripción del negocio'}" />
<meta name="keywords" content="${metaKeywords || 'palabras, clave'}" />
<meta property="og:title" content="${ogTitle || metaTitle || 'Título OG'}" />
<meta property="og:description" content="${ogDescription || metaDesc || 'Descripción OG'}" />
<meta property="og:image" content="${ogImage || 'https://promoclub.mx/og-default.jpg'}" />
<meta name="twitter:card" content="${twitterCard}" />`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedForm;
