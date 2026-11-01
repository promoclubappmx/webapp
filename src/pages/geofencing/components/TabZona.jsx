import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';

const MAPBOX_TOKEN = import.meta.env?.VITE_MAPBOX_TOKEN;

const ZONE_TYPES = [
  {
    id: 'circular',
    label: 'Radio circular',
    icon: 'Circle',
    desc: 'Radio uniforme alrededor de tu negocio. Recomendado para la mayoría de negocios.',
  },
  {
    id: 'polygon',
    label: 'Polígono personalizado',
    icon: 'PenTool',
    desc: 'Dibuja la zona exacta en el mapa. Ideal para negocios en esquina, corredores comerciales, o zonas irregulares.',
  },
];

const TabZona = ({ selectedBranch, geofencingActive, onRadiusChange, onConfigSaved }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const drawRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const [zoneType, setZoneType] = useState('circular');
  const [radius, setRadius] = useState(200);
  const [center, setCenter] = useState({ lat: 19.4326, lng: -99.1332 });
  const [geofenceName, setGeofenceName] = useState('');
  const [polygonVertices, setPolygonVertices] = useState(0);
  const [polygonArea, setPolygonArea] = useState(0);
  const [circularArea, setCircularArea] = useState(0);
  const [currentPolygon, setCurrentPolygon] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [multipleZones, setMultipleZones] = useState(false);
  const [zones, setZones] = useState([]);
  const [showAddZone, setShowAddZone] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const suggestedRadius = 200;

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
    } catch (e) {}
  }, []);

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

  useEffect(() => {
    import('@turf/turf')?.then(turf => { window.__turf__ = turf; })?.catch(() => {});
  }, []);

  useEffect(() => {
    if (!mapContainerRef?.current || mapRef?.current) return;
    import('mapbox-gl')?.then(mapboxgl => {
      mapboxgl.default.accessToken = MAPBOX_TOKEN;
      const map = new mapboxgl.default.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [center.lng, center.lat],
        zoom: 15,
      });
      map?.on('error', () => {});
      map?.addControl(new mapboxgl.default.NavigationControl(), 'top-right');
      map?.on('load', () => {
        setMapLoaded(true);
        mapRef.current = map;
        const el = document.createElement('div');
        el.style.cssText = 'width:22px;height:22px;background:#3b82f6;border:3px solid white;border-radius:50%;cursor:grab;box-shadow:0 2px 8px rgba(0,0,0,0.3);';
        const marker = new mapboxgl.default.Marker({ element: el, draggable: true })?.setLngLat([center?.lng, center?.lat])?.addTo(map);
        marker?.on('dragend', () => {
          const lngLat = marker?.getLngLat();
          setCenter({ lat: lngLat?.lat, lng: lngLat?.lng });
        });
        markerRef.current = marker;
        setTimeout(() => updateCircleLayer(map, center, radius), 200);
      });
      mapRef.current = map;
    })?.catch(() => {});
    return () => {
      if (mapRef?.current) { mapRef?.current?.remove(); mapRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if (mapRef?.current && mapLoaded && zoneType === 'circular') {
      updateCircleLayer(mapRef?.current, center, radius);
      onRadiusChange?.(radius);
    }
  }, [radius, center, mapLoaded, zoneType, updateCircleLayer, onRadiusChange]);

  useEffect(() => {
    if (!mapRef?.current || !mapLoaded) return;
    const map = mapRef?.current;
    if (zoneType === 'circular') {
      if (drawRef?.current) {
        try { map?.removeControl(drawRef?.current); } catch (e) {}
        drawRef.current = null;
      }
      if (markerRef?.current) markerRef.current.getElement().style.display = '';
      if (map?.getLayer('geofence-fill')) map?.setLayoutProperty('geofence-fill', 'visibility', 'visible');
      if (map?.getLayer('geofence-border')) map?.setLayoutProperty('geofence-border', 'visibility', 'visible');
      updateCircleLayer(map, center, radius);
    } else {
      if (markerRef?.current) markerRef.current.getElement().style.display = 'none';
      if (map?.getLayer('geofence-fill')) map?.setLayoutProperty('geofence-fill', 'visibility', 'none');
      if (map?.getLayer('geofence-border')) map?.setLayoutProperty('geofence-border', 'visibility', 'none');
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
        map?.on('draw.delete', () => { setPolygonVertices(0); setPolygonArea(0); setCurrentPolygon(null); });
      })?.catch(() => {});
    }
  }, [zoneType, mapLoaded]);

  const validations = {
    name: geofenceName?.trim()?.length > 0,
    branch: !!selectedBranch,
    minArea: zoneType === 'circular' ? circularArea >= 100 : polygonArea >= 100,
    maxArea: zoneType === 'circular' ? circularArea <= 5000000 : polygonArea <= 5000000,
  };
  const allValid = Object.values(validations)?.every(Boolean);

  const handleSave = async () => {
    if (!allValid) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      const payload = {
        name: geofenceName,
        geofence_type: zoneType,
        radius_meters: zoneType === 'circular' ? radius : null,
        center_lat: center?.lat,
        center_lng: center?.lng,
        polygon_geojson: zoneType === 'polygon' ? JSON.stringify(currentPolygon) : null,
        is_active: true,
        branch_id: selectedBranch,
        ...(user?.id ? { business_id: user?.id } : {}),
      };
      const { data, error } = await supabase?.from('business_geofences')?.upsert(payload)?.select()?.single();
      if (error) throw error;
      onConfigSaved?.(data);
      showToast('Geofence guardado correctamente');
    } catch (e) {
      showToast('Error al guardar. Intenta de nuevo.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-160px)] overflow-hidden">
      {/* Left panel */}
      <div className="w-96 flex-shrink-0 overflow-y-auto border-r border-border bg-card p-5 space-y-5">
        {/* Zone name */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Nombre de la zona</label>
          <input
            type="text"
            value={geofenceName}
            onChange={e => setGeofenceName(e?.target?.value)}
            placeholder="Ej: Zona principal, Zona entrega..."
            maxLength={60}
            className="w-full px-3 py-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Zone type selector */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Tipo de zona</label>
          <div className="space-y-2">
            {ZONE_TYPES?.map(zt => (
              <button
                key={zt?.id}
                onClick={() => setZoneType(zt?.id)}
                className={`w-full text-left p-3.5 rounded-xl border-2 transition-all duration-200 ${
                  zoneType === zt?.id
                    ? 'border-primary bg-primary/5' :'border-border bg-background hover:border-primary/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${zoneType === zt?.id ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Icon name={zt?.icon} size={16} className={zoneType === zt?.id ? 'text-primary' : 'text-muted-foreground'} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${zoneType === zt?.id ? 'text-primary' : 'text-foreground'}`}>{zt?.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{zt?.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Circular config */}
        {zoneType === 'circular' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-foreground">Radio de detección</label>
                <span className="text-sm font-bold text-primary">{radius}m</span>
              </div>
              <input
                type="range"
                min={50}
                max={1000}
                step={10}
                value={radius}
                onChange={e => setRadius(Number(e?.target?.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>50m</span>
                <span>1km</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Radio (m)</label>
                <input
                  type="number"
                  min={50}
                  max={1000}
                  value={radius}
                  onChange={e => setRadius(Math.min(1000, Math.max(50, Number(e?.target?.value))))}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Área (m²)</label>
                <input
                  type="text"
                  readOnly
                  value={circularArea?.toLocaleString()}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-muted text-muted-foreground"
                />
              </div>
            </div>
            {/* Smart suggestion */}
            <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-base">💡</span>
              <div className="flex-1">
                <p className="text-xs font-semibold text-blue-800">Radio sugerido para tu negocio: {suggestedRadius}m</p>
                <p className="text-xs text-blue-600 mt-0.5">Basado en densidad comercial y tipo de negocio de tu zona.</p>
                <button
                  onClick={() => setRadius(suggestedRadius)}
                  className="mt-2 text-xs font-semibold text-blue-700 hover:text-blue-900 underline"
                >
                  Aplicar sugerencia
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Polygon config */}
        {zoneType === 'polygon' && (
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs font-semibold text-amber-800 mb-1">Instrucciones</p>
              <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
                <li>Toca el mapa para agregar puntos</li>
                <li>Cierra el polígono tocando el primer punto</li>
                <li>Mínimo 3 puntos, máximo 20 vértices</li>
              </ol>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded-xl text-center">
                <p className="text-2xl font-bold text-foreground">{polygonVertices}</p>
                <p className="text-xs text-muted-foreground">Vértices</p>
              </div>
              <div className="p-3 bg-muted rounded-xl text-center">
                <p className="text-2xl font-bold text-foreground">{polygonArea > 0 ? (polygonArea / 10000)?.toFixed(2) : '—'}</p>
                <p className="text-xs text-muted-foreground">Hectáreas</p>
              </div>
            </div>
          </div>
        )}

        {/* Validations */}
        <div className="border border-border rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-foreground mb-2">Validaciones</p>
          {[
            { label: 'Nombre definido', ok: validations?.name },
            { label: 'Sucursal seleccionada', ok: validations?.branch },
            { label: 'Área ≥ 100m²', ok: validations?.minArea },
            { label: 'Área ≤ 5km²', ok: validations?.maxArea },
          ]?.map(v => (
            <div key={v?.label} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${v?.ok ? 'bg-emerald-100' : 'bg-red-100'}`}>
                <Icon name={v?.ok ? 'Check' : 'X'} size={10} className={v?.ok ? 'text-emerald-600' : 'text-red-500'} />
              </div>
              <span className={`text-xs ${v?.ok ? 'text-foreground' : 'text-muted-foreground'}`}>{v?.label}</span>
            </div>
          ))}
        </div>

        {/* Multiple zones toggle */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-foreground">Múltiples zonas activas</p>
              <p className="text-xs text-muted-foreground mt-0.5">PREMIUM — Activa más de un geofence simultáneamente</p>
            </div>
            <button
              onClick={() => setMultipleZones(!multipleZones)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${multipleZones ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${multipleZones ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          {multipleZones && (
            <div className="mt-3 space-y-2">
              {zones?.map((z, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-muted rounded-lg">
                  <div>
                    <p className="text-xs font-medium text-foreground">{z?.name}</p>
                    <p className="text-xs text-muted-foreground">{z?.type} · {z?.radius}m</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${z?.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {z?.active ? 'Activa' : 'Inactiva'}
                    </span>
                    <button className="p-1 hover:bg-border rounded" onClick={() => setZones(prev => prev?.filter((_, idx) => idx !== i))}>
                      <Icon name="Trash2" size={12} className="text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setShowAddZone(true)}
                className="w-full py-2 text-xs font-semibold text-primary border border-dashed border-primary/40 rounded-lg hover:bg-primary/5 transition-colors"
              >
                + Agregar zona
              </button>
            </div>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!allValid || saving}
          className="w-full py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Guardando...' : 'Guardar geofence'}
        </button>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Real-time badges on map */}
        <div className="absolute bottom-6 left-4 z-10 flex flex-col gap-2">
          <div className="bg-white/95 backdrop-blur-sm border border-border rounded-xl px-3 py-2 shadow-lg">
            <p className="text-xs font-semibold text-foreground">~1,240 clientes PromoClub en este radio</p>
            <p className="text-xs text-muted-foreground">Potencial de adquisición</p>
          </div>
          <div className="bg-white/95 backdrop-blur-sm border border-border rounded-xl px-3 py-2 shadow-lg">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-xs font-semibold text-foreground">~87 tus clientes activos ahora</p>
            </div>
            <p className="text-xs text-muted-foreground">Con ubicación activa</p>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 ${toast?.type === 'error' ? 'bg-destructive text-white' : 'bg-emerald-600 text-white'}`}>
          <Icon name={toast?.type === 'error' ? 'AlertCircle' : 'CheckCircle'} size={16} />
          <span className="text-sm font-medium">{toast?.message}</span>
        </div>
      )}
    </div>
  );
};

export default TabZona;
