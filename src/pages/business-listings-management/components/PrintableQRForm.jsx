import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const QR_ACTIONS = [
  { id: 'perfil', label: 'Perfil del negocio', icon: 'Building2', desc: 'Abre tu página en PromoClub', color: '#7C3AED' },
  { id: 'checkin', label: 'Check-in', icon: 'MapPin', desc: 'Registra visita y acumula puntos', color: '#059669' },
  { id: 'menu', label: 'Menú / Catálogo', icon: 'BookOpen', desc: 'Muestra tu catálogo digital', color: '#D97706' },
  { id: 'review', label: 'Dejar reseña', icon: 'Star', desc: 'Solicita reseña al cliente', color: '#DC2626' },
  { id: 'whatsapp', label: 'WhatsApp directo', icon: 'MessageCircle', desc: 'Abre chat de WhatsApp', color: '#25D366' },
  { id: 'wifi', label: 'Conectar WiFi', icon: 'Wifi', desc: 'Comparte contraseña WiFi', color: '#0EA5E9' },
];

const TEMPLATES = [
  {
    id: 'tarjeta',
    label: 'Tarjeta de presentación',
    size: 'A7 (74×105mm)',
    icon: 'CreditCard',
    desc: 'Ideal para entregar a clientes',
    orientation: 'portrait',
    w: 210,
    h: 297,
  },
  {
    id: 'poster_a4',
    label: 'Póster A4',
    size: 'A4 (210×297mm)',
    icon: 'FileText',
    desc: 'Para imprimir y colocar en tienda',
    orientation: 'portrait',
    w: 210,
    h: 297,
  },
  {
    id: 'sticker',
    label: 'Sticker cuadrado',
    size: '5×5 cm',
    icon: 'Square',
    desc: 'Para empaques y mesas',
    orientation: 'square',
    w: 150,
    h: 150,
  },
  {
    id: 'tent_card',
    label: 'Tent card de mesa',
    size: '10×15 cm',
    icon: 'Triangle',
    desc: 'Para mesas de restaurante',
    orientation: 'landscape',
    w: 297,
    h: 210,
  },
  {
    id: 'flyer',
    label: 'Flyer media carta',
    size: 'Media carta (140×216mm)',
    icon: 'Layout',
    desc: 'Para volantear o repartir',
    orientation: 'portrait',
    w: 210,
    h: 297,
  },
];

const QR_FORMATS = [
  { id: 'png', label: 'PNG', icon: 'Image', desc: 'Para diseñadores' },
  { id: 'svg', label: 'SVG', icon: 'Code', desc: 'Vectorial, escalable' },
];

const PrintableQRForm = ({ formData, onChange }) => {
  const { user } = useAuth();
  const [selectedAction, setSelectedAction] = useState('perfil');
  const [selectedTemplate, setSelectedTemplate] = useState('tarjeta');
  const [selectedFormat, setSelectedFormat] = useState('png');
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#FFFFFF');
  const [customText, setCustomText] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [logoOnQr, setLogoOnQr] = useState(false);
  const [uploadedLogo, setUploadedLogo] = useState(null);
  const [uploadedLogoFile, setUploadedLogoFile] = useState(null);
  const [loadingBrand, setLoadingBrand] = useState(false);
  const [brandData, setBrandData] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const canvasRef = useRef(null);
  const printRef = useRef(null);

  // ── Load brand data from Supabase ──────────────────────────────────────────
  useEffect(() => {
    loadBrandFromSupabase();
  }, [user]);

  const loadBrandFromSupabase = async () => {
    setLoadingBrand(true);
    try {
      if (user?.id) {
        const { data } = await supabase
          ?.from('business_settings')
          ?.select('brand_primary_color, brand_secondary_color, brand_name, brand_slogan, logo_horizontal_url, logo_isotipo_url, business_name, slug')
          ?.eq('owner_id', user?.id)
          ?.single();
        if (data) {
          setBrandData(data);
          // Pre-fill QR color with brand primary
          if (data?.brand_primary_color) setQrColor(data?.brand_primary_color);
        }
      }
    } catch (err) {
      console.error('Error loading brand for QR:', err);
    } finally {
      setLoadingBrand(false);
    }
  };

  // ── Resolved brand values (Supabase > formData > defaults) ────────────────
  const slug = brandData?.slug || formData?.slug || 'tu-negocio';
  const businessName = brandData?.brand_name || brandData?.business_name || formData?.businessName || formData?.brandName || 'Mi Negocio';
  const brandPrimary = brandData?.brand_primary_color || formData?.brandPrimaryColor || '#7C3AED';
  const brandSecondary = brandData?.brand_secondary_color || formData?.brandSecondaryColor || '#F59E0B';
  const brandLogo = uploadedLogo || brandData?.logo_horizontal_url || brandData?.logo_isotipo_url || formData?.logoHorizontal?.url || formData?.logoIsotipo?.url || formData?.logo?.url || null;
  const brandSlogan = brandData?.brand_slogan || formData?.brandSlogan || '';

  const getQrUrl = useCallback(() => {
    const action = QR_ACTIONS?.find(a => a?.id === selectedAction);
    const base = `https://promoclub.mx/${slug}`;
    switch (selectedAction) {
      case 'perfil': return base;
      case 'checkin': return `${base}?action=checkin`;
      case 'menu': return `${base}?action=menu`;
      case 'review': return `${base}?action=review`;
      case 'whatsapp': return whatsappNumber ? `https://wa.me/${whatsappNumber?.replace(/\D/g, '')}` : `https://wa.me/52`;
      case 'wifi': return wifiSsid ? `WIFI:T:WPA;S:${wifiSsid};P:${wifiPassword};;` : base;
      default: return base;
    }
  }, [selectedAction, slug, whatsappNumber, wifiSsid, wifiPassword]);

  const generateQR = useCallback(async () => {
    setGenerating(true);
    try {
      const QRCode = (await import('qrcode'))?.default;
      const url = getQrUrl();
      const canvas = canvasRef?.current;
      if (!canvas) return;
      await QRCode?.toCanvas(canvas, url, {
        width: 300,
        margin: 2,
        color: { dark: qrColor, light: qrBgColor },
        errorCorrectionLevel: logoOnQr ? 'H' : 'M',
      });

      // Overlay logo on QR if enabled
      if (logoOnQr && (uploadedLogo || brandLogo)) {
        const ctx = canvas?.getContext('2d');
        const logoSrc = uploadedLogo || brandLogo;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const logoSize = canvas?.width * 0.22;
          const x = (canvas?.width - logoSize) / 2;
          const y = (canvas?.height - logoSize) / 2;
          // White background for logo
          ctx.fillStyle = '#FFFFFF';
          ctx?.beginPath();
          ctx?.roundRect(x - 6, y - 6, logoSize + 12, logoSize + 12, 8);
          ctx?.fill();
          ctx?.drawImage(img, x, y, logoSize, logoSize);
          setQrDataUrl(canvas?.toDataURL('image/png'));
        };
        img.onerror = () => setQrDataUrl(canvas?.toDataURL('image/png'));
        img.src = logoSrc;
      } else {
        setQrDataUrl(canvas?.toDataURL('image/png'));
      }
    } catch (err) {
      console.error('Error generating QR:', err);
    } finally {
      setGenerating(false);
    }
  }, [getQrUrl, qrColor, qrBgColor, logoOnQr, uploadedLogo, brandLogo]);

  useEffect(() => {
    if (!loadingBrand) generateQR();
  }, [generateQR, loadingBrand]);

  const handleLogoUpload = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedLogo(url);
    setUploadedLogoFile(file);
  };

  const downloadQrPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qr-${selectedAction}-${slug}.png`;
    a?.click();
  };

  const downloadQrSvg = async () => {
    try {
      const QRCode = (await import('qrcode'))?.default;
      const url = getQrUrl();
      const svgString = await QRCode?.toString(url, {
        type: 'svg',
        color: { dark: qrColor, light: qrBgColor },
        errorCorrectionLevel: 'M',
        margin: 2,
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `qr-${selectedAction}-${slug}.svg`;
      a?.click();
    } catch (err) {
      console.error('Error generating SVG:', err);
    }
  };

  const handlePrint = () => {
    setPrintPreviewOpen(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const currentTemplate = TEMPLATES?.find(t => t?.id === selectedTemplate) || TEMPLATES?.[0];
  const currentAction = QR_ACTIONS?.find(a => a?.id === selectedAction) || QR_ACTIONS?.[0];

  return (
    <div className="space-y-6">
      {/* Hidden canvas for QR generation */}
      <canvas ref={canvasRef} className="hidden" />
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">QR Imprimibles</h3>
          <p className="text-xs text-muted-foreground">
            Genera códigos QR personalizados con tu marca para imprimir en tarjetas, pósters, stickers y más.
          </p>
        </div>
        {loadingBrand ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-lg text-xs text-muted-foreground">
            <div className="w-3 h-3 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
            Cargando marca...
          </div>
        ) : brandData?.brand_name ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
            {brandLogo && <img src={brandLogo} alt={businessName} className="w-5 h-5 object-contain rounded" />}
            <div className="w-3 h-3 rounded-full border border-white/30" style={{ backgroundColor: brandPrimary }} />
            <p className="text-xs text-emerald-700 font-medium">{businessName}</p>
            <Icon name="CheckCircle" size={13} className="text-emerald-600" />
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            <Icon name="AlertCircle" size={13} />
            Configura tu marca en Ajustes → Marca
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Configuration */}
        <div className="space-y-5">
          {/* Step 1: Select action */}
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">1</span>
              ¿A dónde lleva el QR?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {QR_ACTIONS?.map(action => (
                <button
                  key={action?.id}
                  onClick={() => setSelectedAction(action?.id)}
                  className={`flex items-start gap-2.5 p-3 border rounded-xl text-left transition-all ${
                    selectedAction === action?.id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20' :'border-border hover:bg-muted/30'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: action?.color + '20' }}
                  >
                    <Icon name={action?.icon} size={14} style={{ color: action?.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground leading-tight">{action?.label}</p>
                    <p className="text-xs text-muted-foreground leading-tight mt-0.5">{action?.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional fields */}
          {selectedAction === 'whatsapp' && (
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Número de WhatsApp</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={e => setWhatsappNumber(e?.target?.value)}
                placeholder="+52 55 1234 5678"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}
          {selectedAction === 'wifi' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Nombre de red (SSID)</label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={e => setWifiSsid(e?.target?.value)}
                  placeholder="MiRedWiFi"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Contraseña</label>
                <input
                  type="text"
                  value={wifiPassword}
                  onChange={e => setWifiPassword(e?.target?.value)}
                  placeholder="Contraseña del WiFi"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          )}

          {/* Step 2: Select template */}
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">2</span>
              Plantilla imprimible
            </p>
            <div className="space-y-2">
              {TEMPLATES?.map(tpl => (
                <button
                  key={tpl?.id}
                  onClick={() => setSelectedTemplate(tpl?.id)}
                  className={`w-full flex items-center gap-3 p-3 border rounded-xl text-left transition-all ${
                    selectedTemplate === tpl?.id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20' :'border-border hover:bg-muted/30'
                  }`}
                >
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name={tpl?.icon} size={16} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{tpl?.label}</p>
                    <p className="text-xs text-muted-foreground">{tpl?.size} — {tpl?.desc}</p>
                  </div>
                  {selectedTemplate === tpl?.id && <Icon name="Check" size={14} className="text-primary flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Customize */}
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">3</span>
              Personalización
            </p>
            <div className="space-y-4 p-4 border border-border rounded-xl bg-muted/5">
              {/* QR Colors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Color del QR</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={qrColor} onChange={e => setQrColor(e?.target?.value)}
                      className="w-9 h-9 rounded-lg border border-border cursor-pointer p-0.5 bg-background" />
                    <input type="text" value={qrColor} onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/?.test(e?.target?.value)) setQrColor(e?.target?.value); }}
                      className="flex-1 px-2 py-1.5 border border-border rounded-lg bg-background text-foreground text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary/30" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Fondo del QR</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={qrBgColor} onChange={e => setQrBgColor(e?.target?.value)}
                      className="w-9 h-9 rounded-lg border border-border cursor-pointer p-0.5 bg-background" />
                    <input type="text" value={qrBgColor} onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/?.test(e?.target?.value)) setQrBgColor(e?.target?.value); }}
                      className="flex-1 px-2 py-1.5 border border-border rounded-lg bg-background text-foreground text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary/30" />
                  </div>
                </div>
              </div>

              {/* Use brand colors shortcut */}
              <button
                onClick={() => { setQrColor(brandPrimary); setQrBgColor('#FFFFFF'); }}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Icon name="Palette" size={11} /> Usar colores de mi marca
              </button>

              {/* Custom text */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Texto personalizado <span className="text-muted-foreground">(opcional)</span></label>
                <input
                  type="text"
                  value={customText}
                  onChange={e => setCustomText(e?.target?.value)}
                  placeholder="Ej. ¡Escanéame y gana puntos!"
                  maxLength={60}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>

              {/* Logo on QR */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-foreground">Logo en el centro del QR</label>
                  <button
                    onClick={() => setLogoOnQr(!logoOnQr)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${logoOnQr ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${logoOnQr ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                {logoOnQr && (
                  <div className="space-y-2">
                    {brandLogo && (
                      <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                        <img src={brandLogo} alt="Logo de marca" className="w-8 h-8 object-contain rounded" />
                        <div className="flex-1">
                          <p className="text-xs text-foreground font-medium">Logo de marca</p>
                          <p className="text-xs text-muted-foreground">
                            {brandData?.logo_horizontal_url ? 'Cargado desde Ajustes → Marca' : 'Configurado en Identidad de Marca'}
                          </p>
                        </div>
                        {uploadedLogo && (
                          <button onClick={() => { setUploadedLogo(null); setUploadedLogoFile(null); }} className="text-xs text-muted-foreground hover:text-destructive">
                            <Icon name="X" size={12} />
                          </button>
                        )}
                      </div>
                    )}
                    <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-dashed border-border rounded-lg hover:bg-muted transition-colors cursor-pointer w-full justify-center">
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" className="hidden"
                        onChange={e => { const f = e?.target?.files?.[0]; if (f) handleLogoUpload(f); }} />
                      <Icon name="Upload" size={12} />
                      {uploadedLogo ? 'Cambiar logo personalizado' : 'Subir logo personalizado'}
                    </label>
                    {uploadedLogo && (
                      <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <img src={uploadedLogo} alt="Logo personalizado" className="w-8 h-8 object-contain rounded" />
                        <p className="text-xs text-green-700">Logo personalizado cargado</p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Icon name="Info" size={11} />
                      El logo reduce la legibilidad. Se usa corrección de error alta (H).
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">4</span>
            Vista previa
          </p>

          {/* Template Preview */}
          <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm">
            <PrintTemplate
              template={currentTemplate}
              businessName={businessName}
              brandSlogan={brandSlogan}
              brandPrimary={brandPrimary}
              brandSecondary={brandSecondary}
              brandLogo={brandLogo}
              qrDataUrl={qrDataUrl}
              actionLabel={currentAction?.label}
              customText={customText}
              generating={generating}
              slug={slug}
            />
          </div>

          {/* URL info */}
          <div className="p-3 bg-muted/30 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-1">URL del QR:</p>
            <p className="text-xs font-mono text-primary break-all">{getQrUrl()}</p>
          </div>

          {/* Download buttons */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Descargar QR solo:</p>
            <div className="flex gap-2">
              <button
                onClick={downloadQrPng}
                disabled={!qrDataUrl || generating}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
              >
                <Icon name="Image" size={14} /> PNG
              </button>
              <button
                onClick={downloadQrSvg}
                disabled={generating}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
              >
                <Icon name="Code" size={14} /> SVG
              </button>
            </div>

            <button
              onClick={handlePrint}
              disabled={!qrDataUrl || generating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Icon name="Printer" size={15} />
              Imprimir plantilla — {currentTemplate?.label}
            </button>

            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
              <Icon name="Info" size={11} />
              Se abrirá el diálogo de impresión del navegador
            </p>
          </div>

          {/* Regenerate */}
          <button
            onClick={generateQR}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            {generating ? (
              <><div className="w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" /> Generando...</>
            ) : (
              <><Icon name="RefreshCw" size={13} /> Regenerar QR</>
            )}
          </button>
        </div>
      </div>
      {/* Print styles */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          .print-template-wrapper { display: block !important; }
        }
      `}</style>
    </div>
  );
};

// Template renderer component
const PrintTemplate = ({
  template, businessName, brandSlogan, brandPrimary, brandSecondary,
  brandLogo, qrDataUrl, actionLabel, customText, generating, slug
}) => {
  if (template?.id === 'sticker') {
    return (
      <div className="p-4 flex items-center justify-center min-h-40">
        <div
          className="w-36 h-36 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-md border-4"
          style={{ borderColor: brandPrimary, background: `linear-gradient(135deg, ${brandPrimary}15, ${brandSecondary}15)` }}
        >
          {generating ? (
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          ) : qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code" className="w-20 h-20 object-contain" />
          ) : (
            <Icon name="QrCode" size={48} className="text-muted-foreground" />
          )}
          <p className="text-xs font-bold text-center leading-tight" style={{ color: brandPrimary }}>{businessName}</p>
        </div>
      </div>
    );
  }

  if (template?.id === 'tent_card') {
    return (
      <div className="p-4">
        <div
          className="rounded-xl overflow-hidden shadow-sm"
          style={{ background: `linear-gradient(135deg, ${brandPrimary}, ${brandSecondary})` }}
        >
          <div className="flex items-center gap-4 p-5">
            <div className="bg-white rounded-xl p-2 flex-shrink-0">
              {generating ? (
                <div className="w-20 h-20 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" className="w-20 h-20 object-contain" />
              ) : (
                <div className="w-20 h-20 flex items-center justify-center">
                  <Icon name="QrCode" size={40} className="text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 text-white">
              {brandLogo ? (
                <img src={brandLogo} alt={businessName} className="h-8 object-contain mb-2" />
              ) : (
                <p className="text-lg font-bold mb-1">{businessName}</p>
              )}
              {brandSlogan && <p className="text-xs opacity-80 mb-2">{brandSlogan}</p>}
              <p className="text-sm font-semibold">{customText || '¡Escanéame!'}</p>
              <p className="text-xs opacity-70 mt-1">promoclub.mx/{slug}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (template?.id === 'tarjeta') {
    return (
      <div className="p-4 flex justify-center">
        <div className="w-56 rounded-xl overflow-hidden shadow-sm border border-border">
          <div className="h-16 flex items-center justify-center px-4" style={{ backgroundColor: brandPrimary }}>
            {brandLogo ? (
              <img src={brandLogo} alt={businessName} className="h-10 object-contain" />
            ) : (
              <p className="text-white font-bold text-base">{businessName}</p>
            )}
          </div>
          <div className="bg-white p-4 flex flex-col items-center gap-2">
            {generating ? (
              <div className="w-24 h-24 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="w-24 h-24 object-contain" />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center bg-muted rounded-lg">
                <Icon name="QrCode" size={40} className="text-muted-foreground" />
              </div>
            )}
            <p className="text-xs font-semibold text-center" style={{ color: brandPrimary }}>
              {customText || actionLabel || '¡Escanéame!'}
            </p>
            <p className="text-xs text-muted-foreground">promoclub.mx/{slug}</p>
          </div>
        </div>
      </div>
    );
  }

  // Default: poster / flyer
  return (
    <div className="p-4 flex justify-center">
      <div className="w-52 rounded-xl overflow-hidden shadow-sm border border-border">
        {/* Header */}
        <div className="h-20 flex flex-col items-center justify-center px-4 gap-1" style={{ background: `linear-gradient(135deg, ${brandPrimary}, ${brandSecondary})` }}>
          {brandLogo ? (
            <img src={brandLogo} alt={businessName} className="h-10 object-contain" />
          ) : (
            <p className="text-white font-bold text-base text-center">{businessName}</p>
          )}
          {brandSlogan && <p className="text-white text-xs opacity-80">{brandSlogan}</p>}
        </div>
        {/* Body */}
        <div className="bg-white p-4 flex flex-col items-center gap-2">
          {generating ? (
            <div className="w-28 h-28 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code" className="w-28 h-28 object-contain" />
          ) : (
            <div className="w-28 h-28 flex items-center justify-center bg-muted rounded-lg">
              <Icon name="QrCode" size={48} className="text-muted-foreground" />
            </div>
          )}
          <p className="text-sm font-bold text-center" style={{ color: brandPrimary }}>
            {customText || '¡Escanéame y gana puntos!'}
          </p>
          <p className="text-xs text-muted-foreground text-center">{actionLabel}</p>
          <div className="w-full border-t border-border pt-2 mt-1">
            <p className="text-xs text-center text-muted-foreground">promoclub.mx/{slug}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableQRForm;
