import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';

const MAPBOX_TOKEN = import.meta.env?.VITE_MAPBOX_TOKEN;

const GeofenceSimulator = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const markerElRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isInside, setIsInside] = useState(false);
  const [geofence, setGeofence] = useState(null);
  const [events, setEvents] = useState([]);
  const [timeInside, setTimeInside] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);
  const lastStateRef = useRef(null);
  const [userPos, setUserPos] = useState({ lat: 19.4326, lng: -99.1332 });

  // Load geofence from Supabase
  useEffect(() => {
    const loadGeofence = async () => {
      try {
        const { data } = await supabase?.from('business_geofences')?.select('*')?.eq('is_active', true)?.limit(1)?.single();
        if (data) setGeofence(data);
      } catch (e) {
        // Use default mock geofence
        setGeofence({
          center_lat: 19.4326,
          center_lng: -99.1332,
          radius_meters: 300,
          geofence_type: 'circle',
          name: 'Geofence de prueba',
        });
      }
    };
    loadGeofence();
  }, []);

  // Timer
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setTimeInside(t => t + 1), 1000);
    } else {
      clearInterval(timerRef?.current);
    }
    return () => clearInterval(timerRef?.current);
  }, [timerActive]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m)?.padStart(2, '0')}:${String(sec)?.padStart(2, '0')}`;
  };

  const checkInsideGeofence = useCallback((lat, lng) => {
    if (!geofence || !window.__turf__) return false;
    try {
      const point = window.__turf__?.point([lng, lat]);
      if (geofence?.geofence_type === 'circle' || geofence?.radius_meters) {
        const circle = window.__turf__?.circle(
          [geofence?.center_lng, geofence?.center_lat],
          (geofence?.radius_meters || 300) / 1000,
          { steps: 64, units: 'kilometers' }
        );
        return window.__turf__?.booleanPointInPolygon(point, circle);
      }
      return false;
    } catch (e) {
      return false;
    }
  }, [geofence]);

  const updateMarkerColor = useCallback((inside) => {
    if (!markerElRef?.current) return;
    markerElRef.current.style.background = inside ? '#22c55e' : '#ef4444';
    markerElRef.current.style.borderColor = inside ? '#16a34a' : '#dc2626';
  }, []);

  const addEvent = useCallback((type, lat, lng) => {
    const actions = type === 'ENTRADA'
      ? ['🔔 Notificación de bienvenida se enviaría', '✓ Check-in automático se acreditaría']
      : ['🎁 Cupón de despedida se enviaría', '⭐ Solicitud de reseña en 30 min'];
    const newEvent = {
      id: Date.now(),
      timestamp: new Date()?.toLocaleTimeString('es-MX'),
      type,
      lat: lat?.toFixed(6),
      lng: lng?.toFixed(6),
      action: actions?.[0],
      status: 'Simulado',
    };
    setEvents(prev => [newEvent, ...prev]?.slice(0, 50));
  }, []);

  const handlePositionChange = useCallback((lat, lng) => {
    setUserPos({ lat, lng });
    const inside = checkInsideGeofence(lat, lng);
    setIsInside(inside);
    updateMarkerColor(inside);

    if (lastStateRef?.current !== null && lastStateRef?.current !== inside) {
      const type = inside ? 'ENTRADA' : 'SALIDA';
      addEvent(type, lat, lng);
      if (inside) {
        setTimerActive(true);
      } else {
        setTimerActive(false);
      }
    }
    lastStateRef.current = inside;
  }, [checkInsideGeofence, updateMarkerColor, addEvent]);

  // Init map
  useEffect(() => {
    if (!mapContainerRef?.current || mapRef?.current) return;

    Promise.all([
      import('mapbox-gl'),
      import('@turf/turf'),
    ])?.then(([mapboxgl, turf]) => {
      window.__turf__ = turf;
      mapboxgl.default.accessToken = MAPBOX_TOKEN;

      const centerLng = geofence?.center_lng || -99.1332;
      const centerLat = geofence?.center_lat || 19.4326;

      const map = new mapboxgl.default.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [centerLng, centerLat],
        zoom: 14,
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

        // Draw geofence zone
        if (geofence) {
          const circle = turf?.circle(
            [geofence?.center_lng || centerLng, geofence?.center_lat || centerLat],
            (geofence?.radius_meters || 300) / 1000,
            { steps: 64, units: 'kilometers' }
          );
          map?.addSource('geofence-zone', { type: 'geojson', data: circle });
          map?.addLayer({ id: 'geofence-zone-fill', type: 'fill', source: 'geofence-zone', paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.12 } });
          map?.addLayer({ id: 'geofence-zone-border', type: 'line', source: 'geofence-zone', paint: { 'line-color': '#3b82f6', 'line-width': 2 } });
        }

        // User marker (orange person icon)
        const el = document.createElement('div');
        el.style.cssText = 'width:32px;height:32px;background:#f97316;border:3px solid #ea580c;border-radius:50%;cursor:grab;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.3);font-size:16px;transition:background 0.3s,border-color 0.3s;';
        el.innerHTML = '👤';
        markerElRef.current = el;

        const userMarker = new mapboxgl.default.Marker({ element: el, draggable: true })?.setLngLat([centerLng + 0.004, centerLat])?.addTo(map);

        userMarker?.on('drag', () => {
          const lngLat = userMarker?.getLngLat();
          handlePositionChange(lngLat?.lat, lngLat?.lng);
        });

        userMarker?.on('dragend', () => {
          const lngLat = userMarker?.getLngLat();
          handlePositionChange(lngLat?.lat, lngLat?.lng);
        });

        userMarkerRef.current = userMarker;
        // Initial check
        handlePositionChange(centerLat, centerLng + 0.004);
      });
    })?.catch(console.error);

    return () => {
      if (mapRef?.current) { mapRef?.current?.remove(); mapRef.current = null; }
    };
  }, [geofence]);

  const simulateEntry = () => {
    if (!userMarkerRef?.current || !mapRef?.current || !geofence) return;
    const centerLng = geofence?.center_lng || -99.1332;
    const centerLat = geofence?.center_lat || 19.4326;
    userMarkerRef?.current?.setLngLat([centerLng, centerLat]);
    mapRef?.current?.flyTo({ center: [centerLng, centerLat], zoom: 15, duration: 1500 });
    handlePositionChange(centerLat, centerLng);
  };

  const simulateExit = () => {
    if (!userMarkerRef?.current || !mapRef?.current || !geofence) return;
    const centerLng = geofence?.center_lng || -99.1332;
    const centerLat = geofence?.center_lat || 19.4326;
    const offset = ((geofence?.radius_meters || 300) / 111000) * 2;
    userMarkerRef?.current?.setLngLat([centerLng + offset, centerLat + offset]);
    mapRef?.current?.flyTo({ center: [centerLng + offset, centerLat + offset], zoom: 14, duration: 1500 });
    handlePositionChange(centerLat + offset, centerLng + offset);
  };

  const exportCSV = () => {
    const header = 'Timestamp,Tipo,Latitud,Longitud,Acción,Estado\n';
    const rows = events?.map(e => `${e?.timestamp},${e?.type},${e?.lat},${e?.lng},"${e?.action}",${e?.status}`)?.join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'geofence-log.csv'; a?.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 lg:left-72 z-30 bg-card border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
            <Icon name="Play" size={18} className="text-orange-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Simulador de Geofence</h1>
            <p className="text-xs text-muted-foreground">Prueba la detección de entrada y salida en tiempo real</p>
          </div>
        </div>
      </div>
      <div className="pt-20 lg:ml-72 flex h-[calc(100vh-80px)]">
        {/* Map 60% */}
        <div className="flex-1 relative">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Sim buttons */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-3">
            <button
              onClick={simulateEntry}
              className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <Icon name="LogIn" size={15} />
              Simular entrada
            </button>
            <button
              onClick={simulateExit}
              className="px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Icon name="LogOut" size={15} />
              Simular salida
            </button>
          </div>

          {/* Drag hint */}
          <div className="absolute top-4 left-4 z-10 bg-card/90 backdrop-blur border border-border rounded-lg px-3 py-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span>👤</span>
              Arrastra el marcador naranja para simular movimiento
            </p>
          </div>
        </div>

        {/* Right panel 40% */}
        <div className="w-96 bg-card border-l border-border flex flex-col overflow-hidden">
          {/* Status */}
          <div className={`p-5 border-b border-border ${isInside ? 'bg-emerald-50' : 'bg-red-50'}`}>
            <p className="text-xs font-medium text-muted-foreground mb-2">Estado actual</p>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-black ${isInside ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
              <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              {isInside ? 'DENTRO' : 'FUERA'}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {geofence?.name || 'Geofence activo'} • Radio: {geofence?.radius_meters || 300}m
            </p>

            {/* Timer */}
            <div className="mt-3 flex items-center gap-2">
              <Icon name="Timer" size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Tiempo dentro:</span>
              <span className={`text-sm font-mono font-bold ${isInside ? 'text-emerald-700' : 'text-muted-foreground'}`}>
                {formatTime(timeInside)}
              </span>
            </div>
          </div>

          {/* Triggered actions */}
          <div className="p-4 border-b border-border">
            <p className="text-xs font-semibold text-foreground mb-3">Acciones que se dispararían</p>
            <div className="space-y-2">
              {(isInside ? [
                { icon: '🔔', text: 'Notificación de bienvenida se enviaría' },
                { icon: '✓', text: 'Check-in automático se acreditaría' },
              ] : [
                { icon: '🎁', text: 'Cupón de despedida se enviaría' },
                { icon: '⭐', text: 'Solicitud de reseña en 30 min' },
              ])?.map((a, i) => (
                <div key={i} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs ${isInside ? 'bg-emerald-50 text-emerald-800' : 'bg-orange-50 text-orange-800'}`}>
                  <span>{a?.icon}</span>
                  <span>{a?.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Event log */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="text-xs font-semibold text-foreground">Log de eventos ({events?.length})</p>
              <div className="flex gap-2">
                <button onClick={() => setEvents([])} className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted transition-colors flex items-center gap-1">
                  <Icon name="Trash2" size={12} />
                  Limpiar
                </button>
                <button onClick={exportCSV} disabled={events?.length === 0} className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1 disabled:opacity-40">
                  <Icon name="Download" size={12} />
                  CSV
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {events?.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="Activity" size={32} className="text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Mueve el marcador para generar eventos</p>
                </div>
              ) : (
                events?.map((ev) => (
                  <div
                    key={ev?.id}
                    className={`p-3 rounded-xl border text-xs animate-fadeIn ${ev?.type === 'ENTRADA' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${ev?.type === 'ENTRADA' ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'}`}>
                        {ev?.type}
                      </span>
                      <span className="text-muted-foreground">{ev?.timestamp}</span>
                    </div>
                    <p className="text-muted-foreground">📍 {ev?.lat}, {ev?.lng}</p>
                    <p className="text-foreground mt-0.5">{ev?.action}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 bg-muted rounded text-muted-foreground text-xs">{ev?.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeofenceSimulator;
