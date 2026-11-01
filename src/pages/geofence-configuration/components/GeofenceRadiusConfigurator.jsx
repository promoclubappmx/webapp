import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';

const MAPBOX_TOKEN = import.meta.env?.VITE_MAPBOX_TOKEN;
const RADIUS_VALUES = [50, 100, 200, 300, 500, 1000];
const formatRadius = (val) => val >= 1000 ? `${val / 1000}km` : `${val}m`;

const GeofenceRadiusConfigurator = ({ radius, onRadiusChange, geofenceActive, businessLat, businessLng }) => {
  const [geofenceType, setGeofenceType] = useState('circle');
  const [suggestionApplied, setSuggestionApplied] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geofenceSourceRef = useRef(false);
  const mapLoadedRef = useRef(false);

  const SUGGESTED_RADIUS = 200;
  const centerLat = businessLat || 19.4126;
  const centerLng = businessLng || -99.1732;

  const handleApplySuggestion = () => {
    onRadiusChange(SUGGESTED_RADIUS);
    setSuggestionApplied(true);
    setTimeout(() => setSuggestionApplied(false), 2000);
  };

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainerRef?.current || mapRef?.current) return;
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your-mapbox-public-token-here') return;

    import('mapbox-gl')?.then((module) => {
      const mapboxgl = module.default;
      mapboxgl.accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [centerLng, centerLat],
        zoom: 15,
      });

      map?.on('error', (e) => {
        if (e?.error?.message?.toLowerCase()?.includes('access token') ||
            e?.error?.message?.toLowerCase()?.includes('invalid token') ||
            e?.error?.status === 401 || e?.error?.status === 403) {
          map?.remove();
          mapRef.current = null;
        }
      });

      map?.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

      map?.on('load', () => {
        mapLoadedRef.current = true;

        // Business pin
        const el = document.createElement('div');
        el.style.cssText = `
          width: 36px; height: 36px; border-radius: 50%;
          background: #1A3FE0; border: 3px solid white;
          box-shadow: 0 2px 8px rgba(26,63,224,0.5);
          display: flex; align-items: center; justify-content: center;
        `;
        el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M20 7H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 12H4V9h16v10zM12 3L2 8h20L12 3z"/></svg>`;

        const marker = new mapboxgl.Marker({ element: el })?.setLngLat([centerLng, centerLat])?.addTo(map);
        markerRef.current = marker;

        // Add geofence circle source and layers
        import('@turf/turf')?.then((turf) => {
          const center = turf?.point([centerLng, centerLat]);
          const circle = turf?.circle(center, radius / 1000, { steps: 64, units: 'kilometers' });

          map?.addSource('geofence-circle', { type: 'geojson', data: circle });
          map?.addLayer({
            id: 'geofence-fill',
            type: 'fill',
            source: 'geofence-circle',
            paint: { 'fill-color': '#1A3FE0', 'fill-opacity': 0.15 },
          });
          map?.addLayer({
            id: 'geofence-line',
            type: 'line',
            source: 'geofence-circle',
            paint: { 'line-color': '#1A3FE0', 'line-width': 2 },
          });

          // Cardinal labels using turf.destination
          const addCardinalLabel = (bearing, labelId) => {
            const dest = turf?.destination(turf?.point([centerLng, centerLat]), radius / 1000, bearing, { units: 'kilometers' });
            map?.addSource(labelId, { type: 'geojson', data: dest });
            map?.addLayer({
              id: labelId,
              type: 'symbol',
              source: labelId,
              layout: {
                'text-field': formatRadius(radius),
                'text-size': 11,
                'text-anchor': 'center',
              },
              paint: {
                'text-color': '#1A3FE0',
                'text-halo-color': '#ffffff',
                'text-halo-width': 2,
              },
            });
          };

          addCardinalLabel(0, 'label-n');
          addCardinalLabel(90, 'label-e');
          addCardinalLabel(180, 'label-s');
          addCardinalLabel(270, 'label-w');

          geofenceSourceRef.current = true;
        });
      });

      mapRef.current = map;
    })?.catch(() => {});

    return () => {
      if (mapRef?.current) {
        mapRef?.current?.remove();
        mapRef.current = null;
        geofenceSourceRef.current = false;
        mapLoadedRef.current = false;
      }
    };
  }, []);

  // Update geofence circle when radius changes
  useEffect(() => {
    if (!mapRef?.current || !geofenceSourceRef?.current || !mapLoadedRef?.current) return;

    import('@turf/turf')?.then((turf) => {
      const center = turf?.point([centerLng, centerLat]);
      const circle = turf?.circle(center, radius / 1000, { steps: 64, units: 'kilometers' });

      const src = mapRef?.current?.getSource('geofence-circle');
      if (src) src?.setData(circle);

      // Update cardinal labels
      const bearings = [{ id: 'label-n', b: 0 }, { id: 'label-e', b: 90 }, { id: 'label-s', b: 180 }, { id: 'label-w', b: 270 }];
      bearings?.forEach(({ id, b }) => {
        const dest = turf?.destination(turf?.point([centerLng, centerLat]), radius / 1000, b, { units: 'kilometers' });
        const labelSrc = mapRef?.current?.getSource(id);
        if (labelSrc) {
          labelSrc?.setData(dest);
          mapRef?.current?.setLayoutProperty(id, 'text-field', formatRadius(radius));
        }
      });
    });
  }, [radius]);

  const handleCenterMap = () => {
    if (mapRef?.current) {
      mapRef?.current?.flyTo({ center: [centerLng, centerLat], zoom: 15, essential: true });
    }
  };

  const hasToken = MAPBOX_TOKEN && MAPBOX_TOKEN !== 'your-mapbox-public-token-here';

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6">
      <h2 className="text-base font-semibold text-foreground mb-4">Configurador de radio</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Controls */}
        <div className="space-y-5">
          {/* Radius Slider */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-3">Radio de detección</label>
            <div className="flex items-center gap-3 mb-3">
              <input
                type="range"
                min={0}
                max={RADIUS_VALUES?.length - 1}
                value={RADIUS_VALUES?.indexOf(radius) !== -1 ? RADIUS_VALUES?.indexOf(radius) : 2}
                onChange={(e) => onRadiusChange(RADIUS_VALUES?.[parseInt(e?.target?.value)])}
                className="flex-1 h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
              />
              <input
                type="number"
                value={radius}
                onChange={(e) => {
                  const val = Math.max(50, Math.min(1000, parseInt(e?.target?.value) || 50));
                  onRadiusChange(val);
                }}
                className="w-20 px-2 py-1.5 text-sm border border-border rounded-lg bg-background text-foreground text-center font-mono"
              />
              <span className="text-xs text-muted-foreground">m</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground font-mono">
              {RADIUS_VALUES?.map((v) => (
                <button
                  key={v}
                  onClick={() => onRadiusChange(v)}
                  className={`px-1 py-0.5 rounded transition-colors ${radius === v ? 'text-primary font-semibold' : 'hover:text-foreground'}`}
                >
                  {formatRadius(v)}
                </button>
              ))}
            </div>
          </div>

          {/* Suggestion Card */}
          <div className="p-4 rounded-xl border-2" style={{ background: '#EEF2FF', borderColor: '#1A3FE0' }}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Icon name="Lightbulb" size={16} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900">Radio sugerido para tu negocio: 200m</p>
                <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                  Basado en la densidad comercial de tu zona y el tipo de negocio, 200m maximiza el alcance sin saturar a clientes que no están realmente cerca.
                </p>
                <button
                  onClick={handleApplySuggestion}
                  className="mt-2 text-xs font-semibold text-blue-700 hover:text-blue-900 underline transition-colors"
                >
                  {suggestionApplied ? '✓ Aplicado' : 'Aplicar sugerencia'}
                </button>
              </div>
            </div>
          </div>

          {/* Geofence Type */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Tipo de geofence</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setGeofenceType('circle')}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  geofenceType === 'circle' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                }`}
              >
                <Icon name="Circle" size={18} className={geofenceType === 'circle' ? 'text-primary' : 'text-muted-foreground'} />
                <p className="text-sm font-medium mt-1 text-foreground">Círculo</p>
                <p className="text-xs text-muted-foreground">Radio uniforme</p>
              </button>
              <button
                disabled
                className="p-3 rounded-xl border-2 border-dashed border-border text-left opacity-60 cursor-not-allowed"
              >
                <Icon name="Pentagon" size={18} className="text-muted-foreground" />
                <p className="text-sm font-medium mt-1 text-foreground">Polígono</p>
                <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">Próximamente</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Mapbox Map */}
        <div>
          {hasToken ? (
            <div className="relative w-full rounded-xl overflow-hidden" style={{ height: '320px' }}>
              <div ref={mapContainerRef} className="w-full h-full" />
              {/* Center button */}
              <button
                onClick={handleCenterMap}
                className="absolute bottom-3 left-3 text-xs bg-white/90 px-2 py-1 rounded-lg shadow-sm border border-border hover:bg-muted transition-colors text-foreground z-10"
              >
                <Icon name="Crosshair" size={12} className="inline mr-1" />
                Centrar
              </button>
              {/* Global geofence tooltip */}
              <div className="absolute top-3 right-3 text-xs text-gray-500 bg-white/90 px-2 py-1 rounded-lg shadow-sm border border-gray-200 z-10">
                <span className="w-2 h-2 inline-block rounded-full border border-dashed border-gray-400 mr-1" />
                Zona comercial: Galerías
              </div>
            </div>
          ) : (
            /* Fallback SVG map when no token */
            (<div
              className="relative w-full rounded-xl overflow-hidden"
              style={{
                height: '320px',
                background: 'linear-gradient(135deg, #e8edf5 0%, #d4dce8 30%, #c8d4e4 60%, #d0dae8 100%)',
              }}
            >
              <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6b7280" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Icon name="Map" size={32} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Configura VITE_MAPBOX_TOKEN para ver el mapa</p>
                </div>
              </div>
            </div>)
          )}

          {/* Metrics */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/40 rounded-xl">
              <p className="text-xs text-muted-foreground">Clientes PromoClub estimados</p>
              <p className="text-lg font-bold text-foreground font-mono mt-0.5">~1,240</p>
              <p className="text-xs text-muted-foreground">en este radio</p>
            </div>
            <div className="p-3 bg-muted/40 rounded-xl">
              <p className="text-xs text-muted-foreground">Tus clientes con ubicación activa</p>
              <p className="text-lg font-bold text-foreground font-mono mt-0.5">~87</p>
              <p className="text-xs text-muted-foreground">usuarios activos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeofenceRadiusConfigurator;
