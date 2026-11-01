import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { COLOR_MAP } from '../index';

const MAPBOX_TOKEN = import.meta.env?.VITE_MAPBOX_TOKEN;

const LivePreview = ({ formData, isOpen, onClose, activeTab }) => {
  const [viewMode, setViewMode] = useState('mobile');
  const [previewTab, setPreviewTab] = useState('card');
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geofenceLayerRef = useRef(false);

  const name = formData?.businessName || 'Nombre del negocio';
  const shortDesc = formData?.shortDescription || 'Descripción corta del negocio';
  const longDesc = formData?.longDescription || '';
  const cover = formData?.cover?.url || null;
  const logo = formData?.logo?.url || null;
  const gallery = formData?.gallery || [];
  const phone = formData?.phone || '';
  const whatsapp = formData?.whatsapp || '';
  const website = formData?.website || '';
  const instagram = formData?.instagram || '';
  const vertical = formData?.vertical || '';
  const subcategory = formData?.subcategory || '';
  const secondaryTags = formData?.secondaryTags || [];
  const city = formData?.city || '';
  const street = formData?.street || '';
  const primaryColor = formData?.brandPrimaryColor || '#7C3AED';
  const lat = formData?.latitude;
  const lng = formData?.longitude;
  const geofenceRadius = formData?.geofenceRadius || null;

  const fields = [
    { key: 'businessName', label: 'Nombre', weight: 15 },
    { key: 'shortDescription', label: 'Descripción corta', weight: 10 },
    { key: 'longDescription', label: 'Descripción larga', weight: 8 },
    { key: 'vertical', label: 'Categoría', weight: 12 },
    { key: 'phone', label: 'Teléfono', weight: 8 },
    { key: 'street', label: 'Dirección', weight: 12 },
    { key: 'latitude', label: 'Ubicación en mapa', weight: 8 },
    { key: 'logo', label: 'Logo', weight: 10 },
    { key: 'cover', label: 'Foto de portada', weight: 10 },
    { key: 'operatingHours', label: 'Horarios', weight: 7 },
  ];

  const score = fields?.reduce((acc, f) => {
    const val = formData?.[f?.key];
    const filled = val && (typeof val === 'string' ? val?.trim() : typeof val === 'object' ? Object.keys(val)?.length > 0 : true);
    return acc + (filled ? f?.weight : 0);
  }, 0);

  const missingFields = fields?.filter(f => {
    const val = formData?.[f?.key];
    return !val || (typeof val === 'string' && !val?.trim()) || (typeof val === 'object' && Object.keys(val)?.length === 0);
  });

  const scoreColor = score >= 80 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-500';
  const scoreBarColor = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';

  const getCurrentStatus = () => {
    const hours = formData?.operatingHours;
    if (!hours) return { open: false, text: 'Horario no configurado' };
    const now = new Date();
    const dayKeys = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
    const todayKey = dayKeys?.[now?.getDay()];
    const today = hours?.[todayKey];
    if (!today?.isOpen) return { open: false, text: 'Cerrado hoy' };
    const cur = `${String(now?.getHours())?.padStart(2,'0')}:${String(now?.getMinutes())?.padStart(2,'0')}`;
    for (const s of (today?.shifts || [])) {
      if (cur >= s?.open && cur <= s?.close) return { open: true, text: `Abierto — Cierra ${s?.close}` };
    }
    return { open: false, text: 'Cerrado ahora' };
  };

  const status = getCurrentStatus();

  // Initialize Mapbox map for preview tab
  useEffect(() => {
    if (!isOpen || previewTab !== 'full') return;
    if (!mapContainerRef?.current || mapRef?.current) return;
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your-mapbox-public-token-here') return;
    if (!lat || !lng) return;

    let mapboxgl;
    import('mapbox-gl')?.then((module) => {
      mapboxgl = module.default;
      mapboxgl.accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lng, lat],
        zoom: 15,
        interactive: false,
      });

      map?.on('load', () => {
        // Custom marker with logo
        const el = document.createElement('div');
        el.style.cssText = `
          width: 40px; height: 40px; border-radius: 50%;
          border: 3px solid white; overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          background: ${primaryColor};
          display: flex; align-items: center; justify-content: center;
        `;
        if (logo) {
          const img = document.createElement('img');
          img.src = logo;
          img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
          el?.appendChild(img);
        } else {
          el.innerHTML = `<span style="color:white;font-weight:bold;font-size:14px">${name?.[0] || '?'}</span>`;
        }

        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })?.setHTML(`<div style="font-size:12px;font-weight:600;padding:4px 8px">${name}</div>`);

        const marker = new mapboxgl.Marker({ element: el })?.setLngLat([lng, lat])?.setPopup(popup)?.addTo(map);

        el?.addEventListener('mouseenter', () => marker?.togglePopup());
        el?.addEventListener('mouseleave', () => marker?.togglePopup());

        markerRef.current = marker;

        // Add geofence circle if radius is set
        if (geofenceRadius && geofenceRadius > 0) {
          import('@turf/turf')?.then((turf) => {
            const center = turf?.point([lng, lat]);
            const circle = turf?.circle(center, geofenceRadius / 1000, { steps: 64, units: 'kilometers' });

            if (!map?.getSource('geofence-preview')) {
              map?.addSource('geofence-preview', { type: 'geojson', data: circle });
              map?.addLayer({
                id: 'geofence-fill-preview',
                type: 'fill',
                source: 'geofence-preview',
                paint: { 'fill-color': '#1A3FE0', 'fill-opacity': 0.15 },
              });
              map?.addLayer({
                id: 'geofence-line-preview',
                type: 'line',
                source: 'geofence-preview',
                paint: { 'line-color': '#1A3FE0', 'line-width': 2 },
              });
              geofenceLayerRef.current = true;
            }
          });
        }
      });

      mapRef.current = map;
    })?.catch(() => {});

    return () => {
      if (mapRef?.current) {
        mapRef?.current?.remove();
        mapRef.current = null;
        markerRef.current = null;
        geofenceLayerRef.current = false;
      }
    };
  }, [isOpen, previewTab, lat, lng]);

  // Update geofence circle in real time
  useEffect(() => {
    if (!mapRef?.current || !geofenceLayerRef?.current || !lat || !lng) return;
    if (!geofenceRadius) return;

    import('@turf/turf')?.then((turf) => {
      const center = turf?.point([lng, lat]);
      const circle = turf?.circle(center, geofenceRadius / 1000, { steps: 64, units: 'kilometers' });
      const src = mapRef?.current?.getSource('geofence-preview');
      if (src) src?.setData(circle);
    });
  }, [geofenceRadius, lat, lng]);

  if (!isOpen) return null;

  const tabColor = COLOR_MAP?.[activeTab] || COLOR_MAP?.basico;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-md bg-background border-l border-border flex flex-col h-full shadow-2xl">
        <div className={`h-[3px] w-full ${tabColor?.bar}`} />
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <Icon name="Eye" size={18} className={tabColor?.icon} />
            <h3 className="text-sm font-semibold text-foreground">Vista previa</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-muted rounded-lg p-0.5">
              <button onClick={() => setViewMode('mobile')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'mobile' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
                <Icon name="Smartphone" size={14} />
              </button>
              <button onClick={() => setViewMode('desktop')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'desktop' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
                <Icon name="Monitor" size={14} />
              </button>
            </div>
            <div className="flex bg-muted rounded-lg p-0.5">
              <button onClick={() => setPreviewTab('card')}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${previewTab === 'card' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
                Card
              </button>
              <button onClick={() => setPreviewTab('full')}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${previewTab === 'full' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
                Ficha
              </button>
            </div>
            <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="X" size={18} />
            </button>
          </div>
        </div>

        <div className="px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Completitud de ficha</span>
            <span className={`text-sm font-bold ${scoreColor}`}>{score}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${scoreBarColor}`} style={{ width: `${score}%` }} />
          </div>
          {missingFields?.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1.5">
              Falta: {missingFields?.slice(0, 3)?.map(f => f?.label)?.join(', ')}{missingFields?.length > 3 ? ` +${missingFields?.length - 3} más` : ''}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className={`mx-auto ${viewMode === 'mobile' ? 'max-w-xs' : 'max-w-full'}`}>
            {viewMode === 'mobile' && (
              <div className="border-4 border-foreground/20 rounded-3xl overflow-hidden shadow-xl">
                <div className="h-6 bg-foreground/10 flex items-center justify-center">
                  <div className="w-16 h-1.5 bg-foreground/20 rounded-full" />
                </div>
                <div className="bg-background">
                  {previewTab === 'card'
                    ? <CardPreview {...{name, shortDesc, logo, cover, vertical, subcategory, status, city, primaryColor, score}} />
                    : <FullPreview {...{name, shortDesc, longDesc, logo, cover, gallery, phone, whatsapp, website, instagram, vertical, subcategory, secondaryTags, status, city, street, primaryColor, lat, lng, mapContainerRef}} />
                  }
                </div>
              </div>
            )}
            {viewMode === 'desktop' && (
              <div className="border border-border rounded-xl overflow-hidden shadow-lg">
                {previewTab === 'card'
                  ? <CardPreview {...{name, shortDesc, logo, cover, vertical, subcategory, status, city, primaryColor, score}} />
                  : <FullPreview {...{name, shortDesc, longDesc, logo, cover, gallery, phone, whatsapp, website, instagram, vertical, subcategory, secondaryTags, status, city, street, primaryColor, lat, lng, mapContainerRef}} />
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CardPreview = ({ name, shortDesc, logo, cover, vertical, subcategory, status, city, primaryColor, score }) => (
  <div className="p-3">
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <div className="h-28 bg-muted relative overflow-hidden">
        {cover ? (
          <Image src={cover} alt={`Portada de ${name}`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="Image" size={24} className="text-muted-foreground" />
          </div>
        )}
        <div className="absolute bottom-2 left-3">
          <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-muted shadow">
            {logo ? <Image src={logo} alt={`Logo de ${name}`} className="w-full h-full object-cover" /> : (
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                <span className="text-white text-sm font-bold">{name?.[0] || '?'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground">{name}</h3>
            <p className="text-xs text-muted-foreground">{subcategory || vertical || 'Categoría'}</p>
          </div>
          <div className="flex items-center gap-1 text-yellow-500">
            <Icon name="Star" size={12} />
            <span className="text-xs text-foreground">4.8</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{shortDesc}</p>
        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs font-medium ${status?.open ? 'text-green-600' : 'text-red-500'}`}>{status?.text}</span>
          <span className="text-xs text-muted-foreground">{city || '0.3 km'}</span>
        </div>
      </div>
    </div>
    {score < 100 && (
      <p className="text-xs text-muted-foreground text-center mt-3">Completa tu ficha al 100% para mejor visibilidad</p>
    )}
  </div>
);

const FullPreview = ({ name, shortDesc, longDesc, logo, cover, gallery, phone, whatsapp, website, instagram, vertical, subcategory, secondaryTags, status, city, street, primaryColor, lat, lng, mapContainerRef }) => (
  <div className="bg-background">
    <div className="h-40 bg-muted relative overflow-hidden">
      {cover ? (
        <Image src={cover} alt={`Portada de ${name}`} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
          <Icon name="Image" size={32} className="text-muted-foreground" />
        </div>
      )}
    </div>
    <div className="px-4 py-3">
      <div className="flex items-end gap-3 -mt-8 mb-3">
        <div className="w-14 h-14 rounded-xl border-2 border-white overflow-hidden bg-muted shadow-lg flex-shrink-0">
          {logo ? <Image src={logo} alt={`Logo de ${name}`} className="w-full h-full object-cover" /> : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
              <span className="text-white text-xl font-bold">{name?.[0] || '?'}</span>
            </div>
          )}
        </div>
        <div className="pb-1">
          <h2 className="text-base font-bold text-foreground">{name}</h2>
          <p className="text-xs text-muted-foreground">{subcategory || vertical}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status?.open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {status?.text}
        </span>
        {secondaryTags?.slice(0, 2)?.map(tag => (
          <span key={tag} className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">{tag}</span>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mb-3 line-clamp-3">{shortDesc}</p>

      {/* Live map preview */}
      {lat && lng ? (
        <div className="mb-3">
          <p className="text-xs font-medium text-foreground mb-1 flex items-center gap-1">
            <Icon name="MapPin" size={12} className="text-primary" />
            Ubicación en mapa
          </p>
          <div
            ref={mapContainerRef}
            className="w-full rounded-xl overflow-hidden border border-border"
            style={{ height: '160px' }}
          />
        </div>
      ) : (
        <div className="mb-3 h-24 bg-muted rounded-xl flex items-center justify-center">
          <div className="text-center">
            <Icon name="MapPin" size={20} className="text-muted-foreground mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Agrega ubicación para ver el mapa</p>
          </div>
        </div>
      )}

      {street && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Icon name="MapPin" size={12} />
          <span>{street}{city ? `, ${city}` : ''}</span>
        </div>
      )}
    </div>
  </div>
);

export default LivePreview;
