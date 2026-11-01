import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '../../../components/AppIcon';


const MAPBOX_TOKEN = import.meta.env?.VITE_MAPBOX_TOKEN;

const SIMULATED_ACTIONS = [
  { id: 'push_welcome', label: 'Push de bienvenida', trigger: 'entry', icon: '🔔' },
  { id: 'checkin_auto', label: 'Check-in automático (5 min)', trigger: 'dwell', icon: '✅' },
  { id: 'coupon_exit', label: 'Cupón de regreso', trigger: 'exit', icon: '🎁' },
  { id: 'review_request', label: 'Solicitud de reseña', trigger: 'exit', icon: '⭐' },
];

const TabSimulador = ({ selectedBranch, geofenceConfig }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const markerElRef = useRef(null);
  const timerRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [isInside, setIsInside] = useState(false);
  const [timeInside, setTimeInside] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [events, setEvents] = useState([]);
  const [actionStates, setActionStates] = useState({});
  const lastStateRef = useRef(null);

  const geofence = geofenceConfig || {
    center_lat: 19.4326,
    center_lng: -99.1332,
    radius_meters: 200,
    geofence_type: 'circle',
    name: 'Zona principal',
  };

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimeInside(t => {
          const newT = t + 1;
          // Auto check-in at 5 min
          if (newT === 300) {
            setActionStates(prev => ({ ...prev, checkin_auto: { status: 'fired', time: new Date()?.toLocaleTimeString('es-MX') } }));
            addEventLog('Check-in automático se habría acreditado (5 min dentro)');
          }
          return newT;
        });
      }, 1000);
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

  const addEventLog = useCallback((msg) => {
    setEvents(prev => [{
      id: Date.now() + Math.random(),
      time: new Date()?.toLocaleTimeString('es-MX'),
      msg,
    }, ...prev]?.slice(0, 100));
  }, []);

  const checkInsideGeofence = useCallback((lat, lng) => {
    if (!window.__turf__) return false;
    try {
      const point = window.__turf__?.point([lng, lat]);
      const circle = window.__turf__?.circle(
        [geofence?.center_lng, geofence?.center_lat],
        (geofence?.radius_meters || 200) / 1000,
        { steps: 64, units: 'kilometers' }
      );
      return window.__turf__?.booleanPointInPolygon(point, circle);
    } catch (e) {
      return false;
    }
  }, [geofence]);

  const handlePositionChange = useCallback((lat, lng) => {
    const inside = checkInsideGeofence(lat, lng);
    setIsInside(inside);
    if (markerElRef?.current) {
      markerElRef.current.style.background = inside ? '#22c55e' : '#f97316';
      markerElRef.current.style.borderColor = inside ? '#16a34a' : '#ea580c';
    }
    if (lastStateRef?.current !== null && lastStateRef?.current !== inside) {
      if (inside) {
        setTimerActive(true);
        setTimeInside(0);
        setActionStates(prev => ({ ...prev, push_welcome: { status: 'fired', time: new Date()?.toLocaleTimeString('es-MX') } }));
        addEventLog('Marcador entró al radio');
        addEventLog('Push de bienvenida se habría enviado');
      } else {
        setTimerActive(false);
        setActionStates(prev => ({
          ...prev,
          coupon_exit: { status: 'fired', time: new Date()?.toLocaleTimeString('es-MX') },
          review_request: { status: 'fired', time: new Date()?.toLocaleTimeString('es-MX') },
        }));
        addEventLog('Marcador salió del radio');
        addEventLog('Cupón de regreso se habría generado');
        addEventLog('Solicitud de reseña se habría enviado');
      }
    }
    lastStateRef.current = inside;
  }, [checkInsideGeofence, addEventLog]);

  useEffect(() => {
    if (!mapContainerRef?.current || mapRef?.current) return;
    Promise.all([import('mapbox-gl'), import('@turf/turf')])?.then(([mapboxgl, turf]) => {
      window.__turf__ = turf;
      mapboxgl.default.accessToken = MAPBOX_TOKEN;
      const centerLng = geofence?.center_lng;
      const centerLat = geofence?.center_lat;
      const map = new mapboxgl.default.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [centerLng, centerLat],
        zoom: 15,
      });
      map?.on('error', () => {});
      map?.addControl(new mapboxgl.default.NavigationControl(), 'top-right');
      map?.on('load', () => {
        setMapLoaded(true);
        mapRef.current = map;
        // Draw geofence zone
        const circle = turf?.circle([centerLng, centerLat], (geofence?.radius_meters || 200) / 1000, { steps: 64, units: 'kilometers' });
        map?.addSource('sim-zone', { type: 'geojson', data: circle });
        map?.addLayer({ id: 'sim-zone-fill', type: 'fill', source: 'sim-zone', paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.12 } });
        map?.addLayer({ id: 'sim-zone-border', type: 'line', source: 'sim-zone', paint: { 'line-color': '#3b82f6', 'line-width': 2 } });
        // User marker
        const el = document.createElement('div');
        el.style.cssText = 'width:34px;height:34px;background:#f97316;border:3px solid #ea580c;border-radius:50%;cursor:grab;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.3);font-size:16px;transition:background 0.3s,border-color 0.3s;';
        el.innerHTML = '👤';
        markerElRef.current = el;
        const offset = ((geofence?.radius_meters || 200) / 111000) * 2.5;
        const userMarker = new mapboxgl.default.Marker({ element: el, draggable: true })?.setLngLat([centerLng + offset, centerLat])?.addTo(map);
        userMarker?.on('drag', () => {
          const lngLat = userMarker?.getLngLat();
          handlePositionChange(lngLat?.lat, lngLat?.lng);
        });
        userMarker?.on('dragend', () => {
          const lngLat = userMarker?.getLngLat();
          handlePositionChange(lngLat?.lat, lngLat?.lng);
        });
        userMarkerRef.current = userMarker;
        handlePositionChange(centerLat, centerLng + offset);
      });
    })?.catch(() => {});
    return () => {
      if (mapRef?.current) { mapRef?.current?.remove(); mapRef.current = null; }
    };
  }, []);

  const simulateEntry = () => {
    if (!userMarkerRef?.current || !mapRef?.current) return;
    const { center_lng: lng, center_lat: lat } = geofence;
    userMarkerRef?.current?.setLngLat([lng, lat]);
    mapRef?.current?.flyTo({ center: [lng, lat], zoom: 16, duration: 1200 });
    handlePositionChange(lat, lng);
  };

  const simulateExit = () => {
    if (!userMarkerRef?.current || !mapRef?.current) return;
    const { center_lng: lng, center_lat: lat, radius_meters: r } = geofence;
    const offset = ((r || 200) / 111000) * 3;
    userMarkerRef?.current?.setLngLat([lng + offset, lat + offset]);
    mapRef?.current?.flyTo({ center: [lng + offset, lat + offset], zoom: 14, duration: 1200 });
    handlePositionChange(lat + offset, lng + offset);
  };

  const clearLog = () => {
    setEvents([]);
    setActionStates({});
    setTimeInside(0);
    setTimerActive(false);
    lastStateRef.current = null;
  };

  const exportLog = () => {
    const header = 'Hora,Evento\n';
    const rows = events?.map(e => `${e?.time},"${e?.msg}"`)?.join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'simulacion-geofence.csv'; a?.click();
    URL.revokeObjectURL(url);
  };

  const getActionStatus = (action) => {
    const state = actionStates?.[action?.id];
    if (!state) {
      if (action?.trigger === 'entry') return { label: '🟡 Se enviaría al entrar', color: 'text-amber-600 bg-amber-50 border-amber-200' };
      if (action?.trigger === 'dwell') return { label: '⏱ Se activará en 5 min', color: 'text-blue-600 bg-blue-50 border-blue-200' };
      if (action?.trigger === 'exit') return { label: '⏳ Se enviará al salir', color: 'text-gray-600 bg-gray-50 border-gray-200' };
    }
    return { label: `✅ Se disparó — ${state?.time}`, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  };

  return (
    <div className="flex h-[calc(100vh-160px)] overflow-hidden">
      {/* Map 70% */}
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="w-full h-full" />
        {/* Instruction overlay */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/95 backdrop-blur-sm border border-border rounded-xl px-4 py-2 shadow-md">
          <p className="text-xs font-medium text-foreground text-center">Arrastra el marcador 👤 naranja para simular el movimiento del cliente</p>
        </div>
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
            className="px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold shadow-lg hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            <Icon name="LogOut" size={15} />
            Simular salida
          </button>
        </div>
      </div>

      {/* Right panel 30% */}
      <div className="w-80 flex-shrink-0 overflow-y-auto border-l border-border bg-card flex flex-col">
        {/* Status */}
        <div className="p-4 border-b border-border">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold mb-3 ${isInside ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
            <span className={`w-2 h-2 rounded-full ${isInside ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            {isInside ? 'DENTRO' : 'FUERA'}
          </div>
          <p className="text-xs text-muted-foreground">Geofence activo · Radio: {geofence?.radius_meters || 200}m</p>
          {isInside && (
            <div className="mt-2 flex items-center gap-2">
              <Icon name="Clock" size={13} className="text-muted-foreground" />
              <span className="text-sm font-mono font-semibold text-foreground">Tiempo dentro: {formatTime(timeInside)}</span>
            </div>
          )}
        </div>

        {/* Actions that would fire */}
        <div className="p-4 border-b border-border">
          <p className="text-xs font-bold text-foreground mb-3 uppercase tracking-wide">Acciones que se dispararían</p>
          <div className="space-y-2">
            {SIMULATED_ACTIONS?.map(action => {
              const status = getActionStatus(action);
              return (
                <div key={action?.id} className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs ${status?.color}`}>
                  <span className="text-base flex-shrink-0">{action?.icon}</span>
                  <div>
                    <p className="font-semibold">{action?.label}</p>
                    <p className="mt-0.5 opacity-80">{status?.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Event log */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-foreground uppercase tracking-wide">Log de eventos</p>
            <div className="flex gap-2">
              <button onClick={clearLog} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Limpiar</button>
              <button onClick={exportLog} className="text-xs text-primary hover:text-primary/80 transition-colors">Exportar</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1.5">
            {events?.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">Mueve el marcador para ver eventos aquí</p>
            ) : (
              events?.map(e => (
                <div key={e?.id} className="flex gap-2 text-xs">
                  <span className="text-muted-foreground font-mono flex-shrink-0">{e?.time}</span>
                  <span className="text-foreground">{e?.msg}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5 leading-relaxed">
            El simulador no envía notificaciones reales ni acredita puntos reales. Todo es una simulación de lo que ocurriría con un cliente real.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TabSimulador;
