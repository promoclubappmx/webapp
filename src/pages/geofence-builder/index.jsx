import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';
import BusinessSelector from '../../components/BusinessSelector';

const MAPBOX_TOKEN = import.meta.env?.VITE_MAPBOX_TOKEN;

// Load saved business location from business_locations table
const getBusinessLocation = async (businessId) => {
  try {
    let query = supabase?.from('business_locations')?.select('latitude,longitude')?.limit(1);
    if (businessId) query = query?.eq('business_id', businessId);
    const { data, error } = await query?.maybeSingle();
    if (error || !data) return null;
    if (data?.latitude && data?.longitude) {
      return { lat: parseFloat(data?.latitude), lng: parseFloat(data?.longitude) };
    }
    return null;
  } catch {
    return null;
  }
};

const GeofenceBuilder = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const drawRef = useRef(null);
  const markerRef = useRef(null);
  const circleLayerRef = useRef(null);

  const [mode, setMode] = useState('circular'); // 'circular' | 'polygon'
  const [radius, setRadius] = useState(300);
  const [center, setCenter] = useState({ lat: 19.4326, lng: -99.1332 });
  const [geofenceName, setGeofenceName] = useState('');
  const [polygonVertices, setPolygonVertices] = useState(0);
  const [polygonArea, setPolygonArea] = useState(0);
  const [circularArea, setCircularArea] = useState(0);
  const [currentPolygon, setCurrentPolygon] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [businessLocationBadge, setBusinessLocationBadge] = useState(null); // 'loaded' | 'not_found'

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load saved business location and center map
  const loadAndCenterOnBusinessLocation = useCallback(async (businessId) => {
    const location = await getBusinessLocation(businessId);
    if (location) {
      setCenter(location);
      setBusinessLocationBadge('loaded');
      // Fly map to saved location if map is ready
      if (mapRef?.current && mapLoaded) {
        mapRef?.current?.flyTo({ center: [location?.lng, location?.lat], zoom: 16, essential: true });
        if (markerRef?.current) {
          markerRef?.current?.setLngLat([location?.lng, location?.lat]);
        }
      }
    } else {
      setBusinessLocationBadge('not_found');
    }
  }, [mapLoaded]);

  // Load location when component mounts (no specific business) or when business changes
  useEffect(() => {
    loadAndCenterOnBusinessLocation(selectedBusiness?.id || selectedBusiness || null);
  }, []);

  // When business selector changes, reload location
  useEffect(() => {
    if (selectedBusiness) {
      const id = selectedBusiness?.id || selectedBusiness;
      loadAndCenterOnBusinessLocation(id);
    }
  }, [selectedBusiness]);

  // When map loads and we have a center from business location, fly to it
  useEffect(() => {
    if (mapLoaded && mapRef?.current) {
      mapRef?.current?.flyTo({ center: [center?.lng, center?.lat], zoom: 16, essential: true });
      if (markerRef?.current) {
        markerRef?.current?.setLngLat([center?.lng, center?.lat]);
      }
    }
  }, [mapLoaded]);

  const updatePolygonStats = useCallback(() => {
    if (!drawRef?.current || !window.__turf__) return;
    const data = drawRef?.current?.getAll();
    if (data?.features?.length > 0) {
      const feature = data?.features?.[0];
      setCurrentPolygon(feature);
      const coords = feature?.geometry?.coordinates?.[0] || [];
      setPolygonVertices(Math.max(0, coords?.length - 1));
      try {
        const area = window.__turf__?.area(feature);
        setPolygonArea(Math.round(area));
      } catch (e) {}
    }
  }, []);

  const updateCircleLayer = useCallback((map, centerCoords, radiusMeters) => {
    if (!map || !map?.isStyleLoaded()) return;
    try {
      const turf = window.__turf__;
      if (!turf) return;
      const circle = turf?.circle([centerCoords?.lng, centerCoords?.lat], radiusMeters / 1000, { steps: 64, units: 'kilometers' });
      const area = turf?.area(circle);
      setCircularArea(Math.round(area));

      if (map?.getSource('geofence-circle')) {
        map?.getSource('geofence-circle')?.setData(circle);
      } else {
        map?.addSource('geofence-circle', { type: 'geojson', data: circle });
        map?.addLayer({ id: 'geofence-fill', type: 'fill', source: 'geofence-circle', paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.15 } });
        map?.addLayer({ id: 'geofence-border', type: 'line', source: 'geofence-circle', paint: { 'line-color': '#3b82f6', 'line-width': 2, 'line-dasharray': [2, 1] } });
      }
    } catch (e) {
      console.error('Circle update error:', e);
    }
  }, []);

  useEffect(() => {
    // Load turf
    import('@turf/turf')?.then(turf => {
      window.__turf__ = turf;
    })?.catch(() => {});
  }, []);

  useEffect(() => {
    if (!mapContainerRef?.current || mapRef?.current) return;

    import('mapbox-gl')?.then(mapboxgl => {
      mapboxgl.default.accessToken = MAPBOX_TOKEN;
      const map = new mapboxgl.default.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [center.lng, center.lat],
        zoom: 16,
      });

      map?.on('error', (e) => {
        if (e?.error?.message?.toLowerCase()?.includes('access token') ||
            e?.error?.message?.toLowerCase()?.includes('invalid token') ||
            e?.error?.status === 401 || e?.error?.status === 403) {
          map?.remove();
          mapRef.current = null;
        }
      });

      map?.addControl(new mapboxgl.default.NavigationControl(), 'top-right');

      map?.on('load', () => {
        setMapLoaded(true);
        mapRef.current = map;

        // Draggable center marker
        const el = document.createElement('div');
        el.className = 'geofence-center-marker';
        el.style.cssText = 'width:24px;height:24px;background:#3b82f6;border:3px solid white;border-radius:50%;cursor:grab;box-shadow:0 2px 8px rgba(0,0,0,0.3);';
        const marker = new mapboxgl.default.Marker({ element: el, draggable: true })?.setLngLat([center?.lng, center?.lat])?.addTo(map);

        marker?.on('dragend', () => {
          const lngLat = marker?.getLngLat();
          setCenter({ lat: lngLat?.lat, lng: lngLat?.lng });
        });
        markerRef.current = marker;

        // Initial circle
        setTimeout(() => {
          updateCircleLayer(map, center, radius);
        }, 200);
      });

      mapRef.current = map;
    })?.catch(console.error);

    return () => {
      if (mapRef?.current) {
        mapRef?.current?.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update circle when radius or center changes
  useEffect(() => {
    if (mapRef?.current && mapLoaded && mode === 'circular') {
      updateCircleLayer(mapRef?.current, center, radius);
      if (markerRef?.current) {
        markerRef?.current?.setLngLat([center?.lng, center?.lat]);
      }
    }
  }, [radius, center, mapLoaded, mode, updateCircleLayer]);

  // Switch modes
  useEffect(() => {
    if (!mapRef?.current || !mapLoaded) return;
    const map = mapRef?.current;

    if (mode === 'circular') {
      // Remove draw if exists
      if (drawRef?.current) {
        try { map?.removeControl(drawRef?.current); } catch (e) {}
        drawRef.current = null;
      }
      // Show circle layers
      if (markerRef?.current) markerRef.current.getElement().style.display = '';
      updateCircleLayer(map, center, radius);
    } else {
      // Hide circle layers
      if (markerRef?.current) markerRef.current.getElement().style.display = 'none';
      if (map?.getLayer('geofence-fill')) map?.setLayoutProperty('geofence-fill', 'visibility', 'none');
      if (map?.getLayer('geofence-border')) map?.setLayoutProperty('geofence-border', 'visibility', 'none');

      // Add Mapbox Draw
      import('@mapbox/mapbox-gl-draw')?.then(MapboxDrawModule => {
        const MapboxDraw = MapboxDrawModule?.default;
        const draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: { polygon: true, trash: true },
          defaultMode: 'draw_polygon',
        });
        map?.addControl(draw, 'top-left');
        drawRef.current = draw;

        map?.on('draw.create', updatePolygonStats);
        map?.on('draw.update', updatePolygonStats);
        map?.on('draw.delete', () => {
          setPolygonVertices(0);
          setPolygonArea(0);
          setCurrentPolygon(null);
        });
      })?.catch(console.error);
    }
  }, [mode, mapLoaded, updatePolygonStats, updateCircleLayer, center, radius]);

  const validateAndSave = async () => {
    if (!geofenceName?.trim()) { showToast('Ingresa un nombre para el geofence', 'error'); return; }
    if (!selectedBusiness) { showToast('Selecciona una sucursal', 'error'); return; }

    if (mode === 'polygon') {
      if (!currentPolygon) { showToast('Dibuja un polígono primero', 'error'); return; }
      if (polygonVertices < 3) { showToast('El polígono necesita al menos 3 vértices', 'error'); return; }
      if (polygonArea < 100) { showToast('El área mínima es 100 m²', 'error'); return; }
      if (polygonArea > 5000000) { showToast('El área máxima es 5 km²', 'error'); return; }
      if (window.__turf__) {
        try {
          const valid = window.__turf__?.booleanValid(currentPolygon);
          if (!valid) { showToast('La geometría del polígono no es válida', 'error'); return; }
        } catch (e) {}
      }
    }

    if (mode === 'circular') {
      if (circularArea < 100) { showToast('El área mínima es 100 m²', 'error'); return; }
      if (circularArea > 5000000) { showToast('El área máxima es 5 km²', 'error'); return; }
    }

    setSaving(true);
    try {
      const businessId = selectedBusiness?.id || selectedBusiness;
      const payload = {
        business_id: businessId,
        name: geofenceName?.trim(),
        geofence_type: mode === 'circular' ? 'circle' : 'polygon',
        radius_meters: mode === 'circular' ? radius : null,
        center_lat: center?.lat,
        center_lng: center?.lng,
        is_active: true,
        updated_at: new Date()?.toISOString(),
      };

      const { error } = await supabase?.from('business_geofences')?.upsert(payload, { onConflict: 'business_id' });

      if (error) throw error;
      showToast('Geofence guardado exitosamente ✓');
      setGeofenceName('');
    } catch (err) {
      console.error(err);
      showToast('Error al guardar el geofence', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatArea = (m2) => {
    if (m2 >= 1000000) return `${(m2 / 1000000)?.toFixed(2)} km²`;
    if (m2 >= 10000) return `${(m2 / 10000)?.toFixed(2)} ha`;
    return `${m2?.toLocaleString()} m²`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 lg:left-72 z-30 bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <Icon name="PenTool" size={18} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Constructor de Geofence</h1>
              <p className="text-xs text-muted-foreground">Define la zona geográfica de tu negocio</p>
            </div>
          </div>
          <div className="w-56">
            <BusinessSelector
              value={selectedBusiness}
              onChange={setSelectedBusiness}
              placeholder="Seleccionar sucursal"
              error={undefined}
            />
          </div>
        </div>
      </div>

      {/* Business location badge */}
      {businessLocationBadge === 'loaded' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-full shadow-lg">
          <Icon name="MapPin" size={13} />
          Centrado en tu negocio
        </div>
      )}
      {businessLocationBadge === 'not_found' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-xs font-semibold rounded-xl shadow-lg max-w-xs text-center">
          <Icon name="AlertTriangle" size={13} className="flex-shrink-0" />
          Guarda primero la ubicación de tu negocio en la pestaña Ubicación
        </div>
      )}

      <div className="pt-20 lg:ml-72 flex h-[calc(100vh-80px)]">
        {/* Map */}
        <div className="flex-1 relative">
          {/* Mode tabs */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-card border border-border rounded-xl shadow-lg flex overflow-hidden">
            <button
              onClick={() => setMode('circular')}
              className={`px-5 py-2.5 text-sm font-semibold transition-all flex items-center gap-2 ${mode === 'circular' ? 'bg-blue-600 text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon name="Circle" size={15} />
              Radio circular
            </button>
            <button
              onClick={() => setMode('polygon')}
              className={`px-5 py-2.5 text-sm font-semibold transition-all flex items-center gap-2 ${mode === 'polygon' ? 'bg-blue-600 text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon name="Pentagon" size={15} />
              Polígono personalizado
            </button>
          </div>

          {mode === 'polygon' && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-card/90 backdrop-blur border border-border rounded-xl px-4 py-3 text-center shadow-lg max-w-xs">
              <p className="text-xs text-muted-foreground">
                <Icon name="MousePointer" size={12} className="inline mr-1" />
                Haz clic en el mapa para dibujar los vértices de tu zona. Cierra el polígono haciendo doble clic.
              </p>
            </div>
          )}

          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        {/* Side panel */}
        <div className="w-80 bg-card border-l border-border flex flex-col overflow-y-auto">
          <div className="p-5 space-y-5">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Nombre del geofence</label>
              <input
                type="text"
                value={geofenceName}
                onChange={e => setGeofenceName(e?.target?.value)}
                placeholder="Ej: Zona principal sucursal centro"
                className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            {/* Type badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Tipo activo:</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${mode === 'circular' ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'}`}>
                {mode === 'circular' ? '⭕ Radio circular' : '⬡ Polígono personalizado'}
              </span>
            </div>

            {/* Circular config */}
            {mode === 'circular' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-4">
                <p className="text-xs font-semibold text-blue-700">Configuración de radio</p>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-foreground">Radio</span>
                    <span className="text-sm font-bold text-blue-700">{radius >= 1000 ? `${(radius / 1000)?.toFixed(1)} km` : `${radius} m`}</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={1000}
                    step={50}
                    value={radius}
                    onChange={e => setRadius(parseInt(e?.target?.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>50 m</span>
                    <span>1 km</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 text-center border border-blue-100">
                    <p className="text-xs text-muted-foreground mb-1">Radio</p>
                    <p className="text-sm font-bold text-foreground">{radius} m</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border border-blue-100">
                    <p className="text-xs text-muted-foreground mb-1">Área</p>
                    <p className="text-sm font-bold text-foreground">{formatArea(circularArea)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Polygon stats */}
            {mode === 'polygon' && (
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-violet-700">Estadísticas del polígono</p>
                {currentPolygon ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 text-center border border-violet-100">
                      <p className="text-xs text-muted-foreground mb-1">Vértices</p>
                      <p className="text-sm font-bold text-foreground">{polygonVertices}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border border-violet-100">
                      <p className="text-xs text-muted-foreground mb-1">Área</p>
                      <p className="text-sm font-bold text-foreground">{formatArea(polygonArea)}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">Dibuja un polígono en el mapa para ver las estadísticas</p>
                )}
              </div>
            )}

            {/* Validations */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">Validaciones</p>
              {[
                { label: 'Nombre definido', ok: geofenceName?.trim()?.length > 0 },
                { label: 'Sucursal seleccionada', ok: !!selectedBusiness },
                ...(mode === 'polygon' ? [
                  { label: 'Polígono dibujado', ok: !!currentPolygon },
                  { label: 'Mínimo 3 vértices', ok: polygonVertices >= 3 },
                  { label: 'Área ≥ 100 m²', ok: polygonArea >= 100 },
                  { label: 'Área ≤ 5 km²', ok: polygonArea <= 5000000 && polygonArea > 0 },
                ] : [
                  { label: 'Área ≥ 100 m²', ok: circularArea >= 100 },
                  { label: 'Área ≤ 5 km²', ok: circularArea <= 5000000 },
                ]),
              ]?.map((v, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${v?.ok ? 'bg-emerald-100' : 'bg-muted'}`}>
                    <Icon name={v?.ok ? 'Check' : 'Minus'} size={10} className={v?.ok ? 'text-emerald-600' : 'text-muted-foreground'} />
                  </div>
                  <span className={`text-xs ${v?.ok ? 'text-foreground' : 'text-muted-foreground'}`}>{v?.label}</span>
                </div>
              ))}
            </div>

            <button
              onClick={validateAndSave}
              disabled={saving}
              className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {saving ? <><Icon name="Loader" size={16} className="animate-spin" />Guardando...</> : <><Icon name="Save" size={16} />Guardar geofence</>}
            </button>
          </div>
        </div>
      </div>
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 animate-fadeIn ${toast?.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
          <Icon name={toast?.type === 'error' ? 'AlertCircle' : 'CheckCircle'} size={16} />
          {toast?.message}
        </div>
      )}
    </div>
  );
};

export default GeofenceBuilder;
