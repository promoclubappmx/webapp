import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';

const MAPBOX_TOKEN = import.meta.env?.VITE_MAPBOX_TOKEN;
const LAYERS = ['Heatmap', 'Entradas', 'Salidas', 'Solo geofence'];

// CDMX mock entry/exit points
const ENTRY_POINTS = [
  { lat: 19.4180, lng: -99.1700 },
  { lat: 19.4150, lng: -99.1760 },
  { lat: 19.4100, lng: -99.1680 },
  { lat: 19.4200, lng: -99.1720 },
  { lat: 19.4090, lng: -99.1750 },
  { lat: 19.4160, lng: -99.1640 },
  { lat: 19.4175, lng: -99.1710 },
  { lat: 19.4135, lng: -99.1695 },
  { lat: 19.4115, lng: -99.1740 },
  { lat: 19.4195, lng: -99.1680 },
];
const EXIT_POINTS = [
  { lat: 19.4070, lng: -99.1790 },
  { lat: 19.4220, lng: -99.1660 },
  { lat: 19.4130, lng: -99.1810 },
  { lat: 19.4060, lng: -99.1720 },
  { lat: 19.4240, lng: -99.1700 },
  { lat: 19.4110, lng: -99.1640 },
  { lat: 19.4085, lng: -99.1770 },
  { lat: 19.4145, lng: -99.1820 },
  { lat: 19.4055, lng: -99.1745 },
];

const CENTER_LAT = 19.4126;
const CENTER_LNG = -99.1732;
const GEOFENCE_RADIUS_M = 200;

const GeofenceActivityMap = ({ period }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [activeLayers, setActiveLayers] = useState(['Heatmap', 'Entradas', 'Salidas']);
  const [mapPeriod, setMapPeriod] = useState('today');
  const [mapLoaded, setMapLoaded] = useState(false);
  const hasToken = MAPBOX_TOKEN && MAPBOX_TOKEN !== 'your-mapbox-public-token-here';

  const toggleLayer = (layer) => {
    setActiveLayers(prev =>
      prev?.includes(layer) ? prev?.filter(l => l !== layer) : [...prev, layer]
    );
  };

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainerRef?.current || mapRef?.current || !hasToken) return;

    import('mapbox-gl')?.then((module) => {
      const mapboxgl = module.default;
      mapboxgl.accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [CENTER_LNG, CENTER_LAT],
        zoom: 14,
      });

      map?.on('error', (e) => {
        if (e?.error?.message?.toLowerCase()?.includes('access token') ||
            e?.error?.message?.toLowerCase()?.includes('invalid token') ||
            e?.error?.status === 401 || e?.error?.status === 403) {
          map?.remove();
          mapRef.current = null;
          setMapLoaded(false);
        }
      });

      map?.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

      map?.on('load', () => {
        setMapLoaded(true);

        // ── Blue density heatmap (all events) ──
        const allPoints = [...ENTRY_POINTS, ...EXIT_POINTS];
        const heatmapGeoJSON = {
          type: 'FeatureCollection',
          features: allPoints?.map((p) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [p?.lng, p?.lat] },
            properties: { weight: 1 },
          })),
        };
        map?.addSource('activity-heatmap', { type: 'geojson', data: heatmapGeoJSON });
        map?.addLayer({
          id: 'activity-heatmap-layer',
          type: 'heatmap',
          source: 'activity-heatmap',
          paint: {
            'heatmap-weight': 1,
            'heatmap-intensity': 1.5,
            'heatmap-radius': 25,
            'heatmap-color': [
              'interpolate', ['linear'], ['heatmap-density'],
              0, 'rgba(26,63,224,0)',
              0.4, 'rgba(26,63,224,0.4)',
              1, '#1A3FE0',
            ],
            'heatmap-opacity': 0.8,
          },
        });

        // ── Entry heatmap layer (green gradient) ──
        const entryHeatGeoJSON = {
          type: 'FeatureCollection',
          features: ENTRY_POINTS?.map((p) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [p?.lng, p?.lat] },
            properties: { weight: 1 },
          })),
        };
        map?.addSource('entry-heatmap', { type: 'geojson', data: entryHeatGeoJSON });
        map?.addLayer({
          id: 'entry-heatmap-layer',
          type: 'heatmap',
          source: 'entry-heatmap',
          paint: {
            'heatmap-weight': 1,
            'heatmap-intensity': 2,
            'heatmap-radius': 30,
            'heatmap-color': [
              'interpolate', ['linear'], ['heatmap-density'],
              0, 'rgba(34,197,94,0)',
              0.3, 'rgba(34,197,94,0.3)',
              0.6, 'rgba(34,197,94,0.6)',
              1, '#16a34a',
            ],
            'heatmap-opacity': 0.85,
          },
        });

        // ── Exit heatmap layer (red gradient) ──
        const exitHeatGeoJSON = {
          type: 'FeatureCollection',
          features: EXIT_POINTS?.map((p) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [p?.lng, p?.lat] },
            properties: { weight: 1 },
          })),
        };
        map?.addSource('exit-heatmap', { type: 'geojson', data: exitHeatGeoJSON });
        map?.addLayer({
          id: 'exit-heatmap-layer',
          type: 'heatmap',
          source: 'exit-heatmap',
          paint: {
            'heatmap-weight': 1,
            'heatmap-intensity': 2,
            'heatmap-radius': 30,
            'heatmap-color': [
              'interpolate', ['linear'], ['heatmap-density'],
              0, 'rgba(239,68,68,0)',
              0.3, 'rgba(239,68,68,0.3)',
              0.6, 'rgba(239,68,68,0.6)',
              1, '#dc2626',
            ],
            'heatmap-opacity': 0.85,
          },
        });

        // ── Entry circle markers ──
        const entryGeoJSON = {
          type: 'FeatureCollection',
          features: ENTRY_POINTS?.map((p) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [p?.lng, p?.lat] },
            properties: { type: 'entry' },
          })),
        };
        map?.addSource('entry-points', { type: 'geojson', data: entryGeoJSON });
        map?.addLayer({
          id: 'entry-circles',
          type: 'circle',
          source: 'entry-points',
          paint: {
            'circle-radius': 7,
            'circle-color': '#22c55e',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.9,
          },
        });

        // ── Exit circle markers ──
        const exitGeoJSON = {
          type: 'FeatureCollection',
          features: EXIT_POINTS?.map((p) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [p?.lng, p?.lat] },
            properties: { type: 'exit' },
          })),
        };
        map?.addSource('exit-points', { type: 'geojson', data: exitGeoJSON });
        map?.addLayer({
          id: 'exit-circles',
          type: 'circle',
          source: 'exit-points',
          paint: {
            'circle-radius': 7,
            'circle-color': '#ef4444',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.9,
          },
        });

        // ── Geofence circle ──
        import('@turf/turf')?.then((turf) => {
          const center = turf?.point([CENTER_LNG, CENTER_LAT]);
          const circle = turf?.circle(center, GEOFENCE_RADIUS_M / 1000, { steps: 64, units: 'kilometers' });
          map?.addSource('geofence-activity', { type: 'geojson', data: circle });
          map?.addLayer({
            id: 'geofence-activity-fill',
            type: 'fill',
            source: 'geofence-activity',
            paint: { 'fill-color': '#1A3FE0', 'fill-opacity': 0.08 },
          });
          map?.addLayer({
            id: 'geofence-activity-line',
            type: 'line',
            source: 'geofence-activity',
            paint: { 'line-color': '#1A3FE0', 'line-width': 2 },
          });
        });

        // ── Business pin ──
        const el = document.createElement('div');
        el.style.cssText = `
          width: 36px; height: 36px; border-radius: 50%;
          background: #1A3FE0; border: 3px solid white;
          box-shadow: 0 2px 8px rgba(26,63,224,0.6);
          display: flex; align-items: center; justify-content: center; z-index: 10;
        `;
        el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M20 7H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 12H4V9h16v10zM12 3L2 8h20L12 3z"/></svg>`;
        new mapboxgl.Marker({ element: el })?.setLngLat([CENTER_LNG, CENTER_LAT])?.addTo(map);
      });

      mapRef.current = map;
    })?.catch(() => {});

    return () => {
      if (mapRef?.current) {
        mapRef?.current?.remove();
        mapRef.current = null;
        setMapLoaded(false);
      }
    };
  }, [hasToken]);

  // Toggle layer visibility
  useEffect(() => {
    if (!mapRef?.current || !mapLoaded) return;
    const layerMap = {
      'Heatmap': ['activity-heatmap-layer'],
      'Entradas': ['entry-heatmap-layer', 'entry-circles'],
      'Salidas': ['exit-heatmap-layer', 'exit-circles'],
    };
    Object.entries(layerMap)?.forEach(([name, layerIds]) => {
      layerIds?.forEach((layerId) => {
        try {
          mapRef?.current?.setLayoutProperty(
            layerId,
            'visibility',
            activeLayers?.includes(name) ? 'visible' : 'none'
          );
        } catch (e) {}
      });
    });
  }, [activeLayers, mapLoaded]);

  const handleExport = () => {
    if (mapRef?.current) {
      const dataUrl = mapRef?.current?.getCanvas()?.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'geofence-activity-map.png';
      a?.click();
    } else {
      alert('Exportando imagen del mapa...');
    }
  };

  const layerConfig = [
    { name: 'Heatmap', color: 'bg-blue-500', label: 'Densidad general' },
    { name: 'Entradas', color: 'bg-green-500', label: `Entradas (${ENTRY_POINTS?.length})` },
    { name: 'Salidas', color: 'bg-red-500', label: `Salidas (${EXIT_POINTS?.length})` },
    { name: 'Solo geofence', color: 'bg-blue-300', label: 'Solo geofence' },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-base font-semibold text-foreground">Mapa de actividad</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={mapPeriod}
            onChange={(e) => setMapPeriod(e?.target?.value)}
            className="text-xs px-3 py-1.5 border border-border rounded-lg bg-background text-foreground"
          >
            <option value="today">Hoy</option>
            <option value="7days">Últimos 7 días</option>
            <option value="month">Este mes</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
          >
            <Icon name="Download" size={12} />
            Exportar
          </button>
        </div>
      </div>

      {/* Layer toggles */}
      <div className="flex gap-2 flex-wrap mb-3">
        {layerConfig?.map(({ name, color }) => (
          <button
            key={name}
            onClick={() => toggleLayer(name)}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-full border transition-colors ${
              activeLayers?.includes(name)
                ? 'border-primary bg-primary/10 text-primary font-medium' :'border-border text-muted-foreground hover:border-primary/40'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${color} flex-shrink-0`} />
            {name}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="relative w-full rounded-xl overflow-hidden" style={{ height: '400px' }}>
        {hasToken ? (
          <>
            <div ref={mapContainerRef} className="w-full h-full" />
            {/* Legend */}
            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm rounded-xl p-3 shadow-md text-xs space-y-1.5 z-10">
              {activeLayers?.includes('Heatmap') && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
                  <span className="text-white">Densidad general</span>
                </div>
              )}
              {activeLayers?.includes('Entradas') && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
                  <span className="text-white">Entradas ({ENTRY_POINTS?.length}) — heatmap verde</span>
                </div>
              )}
              {activeLayers?.includes('Salidas') && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                  <span className="text-white">Salidas ({EXIT_POINTS?.length}) — heatmap rojo</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center rounded-xl">
            <div className="text-center">
              <Icon name="Map" size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Configura VITE_MAPBOX_TOKEN para ver el mapa de actividad</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeofenceActivityMap;
