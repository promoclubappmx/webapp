import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const METHODS = [
  {
    id: 'qr',
    name: 'QR en Mostrador',
    icon: 'QrCode',
    description: 'El cliente escanea un código QR con la app PromoSpot para registrar su visita.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    checkins: 1240,
    enabled: true,
    confidence: 'Alta',
    confidenceColor: 'bg-green-100 text-green-700',
    requiresHardware: false,
  },
  {
    id: 'geofence',
    name: 'Geofence Automático',
    icon: 'MapPin',
    description: 'Detecta automáticamente cuando el cliente entra al radio del negocio.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    checkins: 387,
    enabled: true,
    confidence: 'Media',
    confidenceColor: 'bg-yellow-100 text-yellow-700',
    requiresHardware: false,
  },
  {
    id: 'manual',
    name: 'Código Manual',
    icon: 'Keyboard',
    description: 'El cajero ingresa el código del cliente para registrar la visita manualmente.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    checkins: 156,
    enabled: true,
    confidence: 'Alta',
    confidenceColor: 'bg-green-100 text-green-700',
    requiresHardware: false,
  },
  {
    id: 'nfc',
    name: 'NFC / Tap',
    icon: 'Wifi',
    description: 'El cliente acerca su teléfono al tag NFC para registrar su visita instantáneamente.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    checkins: 89,
    enabled: false,
    confidence: 'Alta',
    confidenceColor: 'bg-green-100 text-green-700',
    requiresHardware: true,
  },
  {
    id: 'beacon',
    name: 'BLE Beacon',
    icon: 'Radio',
    description: 'Registro automático sin acción del usuario mediante dispositivo beacon Bluetooth.',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    checkins: 0,
    enabled: false,
    confidence: 'Alta',
    confidenceColor: 'bg-green-100 text-green-700',
    requiresHardware: true,
  },
];

const COOLDOWN_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hora' },
  { value: 120, label: '2 horas' },
  { value: 240, label: '4 horas' },
];

// ─── TOGGLE ───────────────────────────────────────────────────────────────────
const Toggle = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${value ? 'bg-primary' : 'bg-gray-200'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

// ─── QR GEOLOCATION MAP ───────────────────────────────────────────────────────
const QRGeolocationMap = ({ lat, lng, radius = 10, locationName }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleLayerAdded = useRef(false);

  useEffect(() => {
    if (!lat || !lng || !mapContainerRef?.current) return;

    const MAPBOX_TOKEN = import.meta.env?.VITE_MAPBOX_TOKEN;
    if (!MAPBOX_TOKEN) return;

    const initMap = async () => {
      try {
        const mapboxgl = (await import('mapbox-gl'))?.default;
        mapboxgl.accessToken = MAPBOX_TOKEN;

        if (mapRef?.current) {
          mapRef?.current?.remove();
          mapRef.current = null;
          circleLayerAdded.current = false;
        }

        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [lng, lat],
          zoom: 19,
          interactive: false,
        });

        mapRef.current = map;

        map?.on('load', () => {
          // Add radius circle source (10m radius approximated in degrees)
          const radiusDeg = radius / 111320;
          const steps = 64;
          const coords = [];
          for (let i = 0; i <= steps; i++) {
            const angle = (i / steps) * 2 * Math.PI;
            coords?.push([
              lng + radiusDeg * Math.cos(angle) / Math.cos((lat * Math.PI) / 180),
              lat + radiusDeg * Math.sin(angle),
            ]);
          }

          if (!circleLayerAdded?.current) {
            map?.addSource('qr-radius', {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: { type: 'Polygon', coordinates: [coords] },
              },
            });

            map?.addLayer({
              id: 'qr-radius-fill',
              type: 'fill',
              source: 'qr-radius',
              paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.15 },
            });

            map?.addLayer({
              id: 'qr-radius-border',
              type: 'line',
              source: 'qr-radius',
              paint: { 'line-color': '#3b82f6', 'line-width': 2, 'line-dasharray': [2, 2] },
            });

            circleLayerAdded.current = true;
          }

          // Add marker
          if (markerRef?.current) markerRef?.current?.remove();
          const el = document.createElement('div');
          el.className = 'w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center';
          el.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';

          markerRef.current = new mapboxgl.Marker({ element: el })?.setLngLat([lng, lat])?.addTo(map);
        });
      } catch (err) {
        console.error('Map init error:', err);
      }
    };

    initMap();

    return () => {
      if (mapRef?.current) {
        mapRef?.current?.remove();
        mapRef.current = null;
        circleLayerAdded.current = false;
      }
    };
  }, [lat, lng, radius]);

  if (!lat || !lng) return null;

  return (
    <div className="mt-4 rounded-xl overflow-hidden border border-border">
      <div className="bg-blue-50 border-b border-blue-100 px-3 py-2 flex items-center gap-2">
        <Icon name="MapPin" size={14} className="text-blue-600" />
        <span className="text-xs font-medium text-blue-700">
          Radio de validación: <strong>{radius} metros</strong> — {locationName}
        </span>
      </div>
      <div ref={mapContainerRef} style={{ height: '220px', width: '100%' }} />
      <div className="bg-blue-50/60 border-t border-blue-100 px-3 py-2">
        <p className="text-xs text-blue-700 flex items-center gap-1.5">
          <Icon name="Info" size={12} />
          El cliente debe estar dentro del área azul al escanear el QR para que el check-in sea válido.
        </p>
      </div>
    </div>
  );
};

// ─── GEOFENCE CONFIG SECTION ──────────────────────────────────────────────────
const GeofenceConfigSection = () => {
  const [radius, setRadius] = useState(150);
  const [dwellTime, setDwellTime] = useState(2);
  const [triggerOnEntry, setTriggerOnEntry] = useState(true);
  const [triggerOnExit, setTriggerOnExit] = useState(false);
  const [accuracyMode, setAccuracyMode] = useState('balanced');

  const RADIUS_PRESETS = [50, 100, 150, 200, 300, 500];

  const accuracyOptions = [
    { id: 'high', label: 'Alta precisión', desc: 'GPS activo, mayor consumo de batería', icon: 'Crosshair' },
    { id: 'balanced', label: 'Balanceado', desc: 'GPS + WiFi, consumo moderado', icon: 'Navigation' },
    { id: 'low', label: 'Bajo consumo', desc: 'Solo red, menor precisión', icon: 'Battery' },
  ];

  return (
    <div className="space-y-5">
      {/* Radius */}
      <div className="bg-muted/30 border border-border rounded-xl p-5">
        <h4 className="font-semibold text-foreground mb-1">Radio del perímetro</h4>
        <p className="text-xs text-muted-foreground mb-4">Define el área en metros alrededor del establecimiento donde se detecta la presencia del cliente.</p>

        {/* Slider */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Radio actual</span>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-primary">{radius}</span>
              <span className="text-sm text-muted-foreground font-medium">metros</span>
            </div>
          </div>
          <input
            type="range"
            min={30}
            max={1000}
            step={10}
            value={radius}
            onChange={e => setRadius(Number(e?.target?.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>30 m</span>
            <span>1000 m</span>
          </div>
        </div>

        {/* Presets */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Valores rápidos:</p>
          <div className="flex flex-wrap gap-2">
            {RADIUS_PRESETS?.map(r => (
              <button
                key={r}
                onClick={() => setRadius(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                  radius === r ? 'border-primary bg-primary text-white' : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                {r} m
              </button>
            ))}
          </div>
        </div>

        {/* Visual reference */}
        <div className="mt-4 p-3 bg-emerald-50/60 border border-emerald-100 rounded-lg flex items-start gap-2">
          <Icon name="Info" size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-emerald-700">
            Con <strong>{radius} m</strong> de radio, el check-in se activará cuando el cliente esté a menos de <strong>{radius} metros</strong> del establecimiento.
            {radius <= 50 && ' ⚠️ Radio muy pequeño: puede causar falsos negativos en interiores.'}
            {radius >= 500 && ' ⚠️ Radio muy grande: puede registrar visitas de clientes que pasen cerca sin entrar.'}
          </p>
        </div>
      </div>
      {/* Dwell Time */}
      <div className="bg-muted/30 border border-border rounded-xl p-5">
        <h4 className="font-semibold text-foreground mb-1">Tiempo mínimo de permanencia</h4>
        <p className="text-xs text-muted-foreground mb-3">El cliente debe permanecer dentro del perímetro al menos este tiempo antes de registrar el check-in.</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDwellTime(t => Math.max(1, t - 1))}
            className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors font-bold text-lg"
          >−</button>
          <div className="text-center min-w-[64px]">
            <span className="text-3xl font-bold text-primary">{dwellTime}</span>
            <p className="text-xs text-muted-foreground">minutos</p>
          </div>
          <button
            onClick={() => setDwellTime(t => Math.min(30, t + 1))}
            className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors font-bold text-lg"
          >+</button>
          <p className="text-xs text-muted-foreground flex-1">Evita registros accidentales de clientes que solo pasan frente al local.</p>
        </div>
      </div>
      {/* Trigger Events */}
      <div className="bg-muted/30 border border-border rounded-xl p-5">
        <h4 className="font-semibold text-foreground mb-3">Evento que dispara el check-in</h4>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-card rounded-xl border border-border cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Icon name="LogIn" size={15} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Al entrar al perímetro</p>
                <p className="text-xs text-muted-foreground">Se registra cuando el cliente ingresa al área definida.</p>
              </div>
            </div>
            <Toggle value={triggerOnEntry} onChange={setTriggerOnEntry} />
          </label>
          <label className="flex items-center justify-between p-3 bg-card rounded-xl border border-border cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Icon name="LogOut" size={15} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Al salir del perímetro</p>
                <p className="text-xs text-muted-foreground">Se registra cuando el cliente abandona el área (confirma visita completa).</p>
              </div>
            </div>
            <Toggle value={triggerOnExit} onChange={setTriggerOnExit} />
          </label>
        </div>
      </div>
      {/* Accuracy Mode */}
      <div className="bg-muted/30 border border-border rounded-xl p-5">
        <h4 className="font-semibold text-foreground mb-3">Modo de precisión GPS</h4>
        <div className="space-y-2">
          {accuracyOptions?.map(opt => (
            <button
              key={opt?.id}
              onClick={() => setAccuracyMode(opt?.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                accuracyMode === opt?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${accuracyMode === opt?.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                <Icon name={opt?.icon} size={17} />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{opt?.label}</p>
                <p className="text-xs text-muted-foreground">{opt?.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── QR CONFIG SECTION ────────────────────────────────────────────────────────
const QRConfigSection = () => {
  const [rotationEnabled, setRotationEnabled] = useState(true);
  const [rotationInterval, setRotationInterval] = useState(30);
  const [displayTime, setDisplayTime] = useState(60);
  const [qrSize, setQrSize] = useState('medium');
  const [showLogo, setShowLogo] = useState(true);
  const [requireScan, setRequireScan] = useState(true);

  const ROTATION_PRESETS = [15, 30, 60, 120, 300];
  const DISPLAY_PRESETS = [30, 60, 120, 300];

  const sizeOptions = [
    { id: 'small', label: 'Pequeño', desc: '200×200 px' },
    { id: 'medium', label: 'Mediano', desc: '300×300 px' },
    { id: 'large', label: 'Grande', desc: '400×400 px' },
  ];

  return (
    <div className="space-y-5">
      {/* QR Rotation */}
      <div className="bg-muted/30 border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-semibold text-foreground">Rotación automática del QR</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Regenera el código QR periódicamente para evitar capturas de pantalla.</p>
          </div>
          <Toggle value={rotationEnabled} onChange={setRotationEnabled} />
        </div>
        {rotationEnabled && (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-2">Intervalo de rotación:</p>
            <div className="flex flex-wrap gap-2">
              {ROTATION_PRESETS?.map(s => (
                <button
                  key={s}
                  onClick={() => setRotationInterval(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                    rotationInterval === s ? 'border-primary bg-primary text-white' : 'border-border text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  {s < 60 ? `${s} seg` : `${s / 60} min`}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">El QR actual expira en <strong>{rotationInterval < 60 ? `${rotationInterval} segundos` : `${rotationInterval / 60} minuto(s)`}</strong>.</p>
          </div>
        )}
      </div>
      {/* Display Time */}
      <div className="bg-muted/30 border border-border rounded-xl p-5">
        <h4 className="font-semibold text-foreground mb-1">Tiempo de visualización en pantalla</h4>
        <p className="text-xs text-muted-foreground mb-3">Cuánto tiempo permanece visible el QR en la pantalla del mostrador antes de requerir interacción.</p>
        <div className="flex flex-wrap gap-2">
          {DISPLAY_PRESETS?.map(s => (
            <button
              key={s}
              onClick={() => setDisplayTime(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                displayTime === s ? 'border-primary bg-primary text-white' : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              {s < 60 ? `${s} seg` : `${s / 60} min`}
            </button>
          ))}
          <button
            onClick={() => setDisplayTime(0)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
              displayTime === 0 ? 'border-primary bg-primary text-white' : 'border-border text-muted-foreground hover:border-primary/40'
            }`}
          >
            Siempre visible
          </button>
        </div>
      </div>
      {/* QR Appearance */}
      <div className="bg-muted/30 border border-border rounded-xl p-5">
        <h4 className="font-semibold text-foreground mb-3">Apariencia del QR</h4>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Tamaño del código:</p>
            <div className="flex gap-2">
              {sizeOptions?.map(opt => (
                <button
                  key={opt?.id}
                  onClick={() => setQrSize(opt?.id)}
                  className={`flex-1 py-2 px-3 rounded-xl border-2 text-center transition-all ${
                    qrSize === opt?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{opt?.label}</p>
                  <p className="text-xs text-muted-foreground">{opt?.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center justify-between p-3 bg-card rounded-xl border border-border cursor-pointer hover:bg-muted/30 transition-colors">
            <div>
              <p className="text-sm font-medium text-foreground">Mostrar logo del negocio</p>
              <p className="text-xs text-muted-foreground">Incrusta el logo en el centro del código QR.</p>
            </div>
            <Toggle value={showLogo} onChange={setShowLogo} />
          </label>
        </div>
      </div>
      {/* Scan Validation */}
      <div className="bg-muted/30 border border-border rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-foreground">Requerir confirmación del cliente</h4>
            <p className="text-xs text-muted-foreground mt-0.5">El cliente debe confirmar el check-in en su app después de escanear.</p>
          </div>
          <Toggle value={requireScan} onChange={setRequireScan} />
        </div>
      </div>
    </div>
  );
};

// ─── MANUAL CODE CONFIG SECTION ───────────────────────────────────────────────
const ManualCodeConfigSection = () => {
  const [codeLength, setCodeLength] = useState(6);
  const [codeType, setCodeType] = useState('numeric');
  const [codeExpiry, setCodeExpiry] = useState(5);
  const [requireStaffPin, setRequireStaffPin] = useState(false);
  const [allowPartialCode, setAllowPartialCode] = useState(false);
  const [showCodeHistory, setShowCodeHistory] = useState(true);

  const CODE_LENGTH_OPTIONS = [4, 5, 6, 8];
  const EXPIRY_OPTIONS = [
    { value: 0, label: 'Sin expiración' },
    { value: 2, label: '2 min' },
    { value: 5, label: '5 min' },
    { value: 10, label: '10 min' },
    { value: 30, label: '30 min' },
  ];

  const codeTypeOptions = [
    { id: 'numeric', label: 'Solo números', desc: 'Ej: 482951', icon: 'Hash' },
    { id: 'alphanumeric', label: 'Alfanumérico', desc: 'Ej: A3K7P2', icon: 'Type' },
    { id: 'phone_last4', label: 'Últimos 4 del teléfono', desc: 'Ej: 7823', icon: 'Phone' },
  ];

  return (
    <div className="space-y-5">
      {/* Code Type */}
      <div className="bg-muted/30 border border-border rounded-xl p-5">
        <h4 className="font-semibold text-foreground mb-3">Tipo de código del cliente</h4>
        <div className="space-y-2">
          {codeTypeOptions?.map(opt => (
            <button
              key={opt?.id}
              onClick={() => setCodeType(opt?.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                codeType === opt?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${codeType === opt?.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                <Icon name={opt?.icon} size={17} />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{opt?.label}</p>
                <p className="text-xs text-muted-foreground">{opt?.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Code Length */}
      {codeType !== 'phone_last4' && (
        <div className="bg-muted/30 border border-border rounded-xl p-5">
          <h4 className="font-semibold text-foreground mb-1">Longitud del código</h4>
          <p className="text-xs text-muted-foreground mb-3">Número de caracteres que debe ingresar el cajero.</p>
          <div className="flex gap-2">
            {CODE_LENGTH_OPTIONS?.map(len => (
              <button
                key={len}
                onClick={() => setCodeLength(len)}
                className={`flex-1 py-3 rounded-xl border-2 text-center font-bold text-lg transition-all ${
                  codeLength === len ? 'border-primary bg-primary text-white' : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                {len}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {'•'?.repeat(codeLength)} — {codeLength} dígitos
          </p>
        </div>
      )}
      {/* Code Expiry */}
      <div className="bg-muted/30 border border-border rounded-xl p-5">
        <h4 className="font-semibold text-foreground mb-1">Expiración del código temporal</h4>
        <p className="text-xs text-muted-foreground mb-3">Tiempo máximo para ingresar el código desde que el cliente lo solicita.</p>
        <div className="flex flex-wrap gap-2">
          {EXPIRY_OPTIONS?.map(opt => (
            <button
              key={opt?.value}
              onClick={() => setCodeExpiry(opt?.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                codeExpiry === opt?.value ? 'border-primary bg-primary text-white' : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              {opt?.label}
            </button>
          ))}
        </div>
      </div>
      {/* Staff Options */}
      <div className="bg-muted/30 border border-border rounded-xl p-5">
        <h4 className="font-semibold text-foreground mb-3">Opciones del cajero</h4>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-card rounded-xl border border-border cursor-pointer hover:bg-muted/30 transition-colors">
            <div>
              <p className="text-sm font-medium text-foreground">Requerir PIN del cajero</p>
              <p className="text-xs text-muted-foreground">El cajero debe autenticarse antes de registrar el check-in.</p>
            </div>
            <Toggle value={requireStaffPin} onChange={setRequireStaffPin} />
          </label>
          <label className="flex items-center justify-between p-3 bg-card rounded-xl border border-border cursor-pointer hover:bg-muted/30 transition-colors">
            <div>
              <p className="text-sm font-medium text-foreground">Mostrar historial reciente</p>
              <p className="text-xs text-muted-foreground">El cajero puede ver los últimos check-ins registrados en su turno.</p>
            </div>
            <Toggle value={showCodeHistory} onChange={setShowCodeHistory} />
          </label>
          <label className="flex items-center justify-between p-3 bg-card rounded-xl border border-border cursor-pointer hover:bg-muted/30 transition-colors">
            <div>
              <p className="text-sm font-medium text-foreground">Permitir búsqueda parcial</p>
              <p className="text-xs text-muted-foreground">Busca clientes aunque el código esté incompleto (mínimo 3 caracteres).</p>
            </div>
            <Toggle value={allowPartialCode} onChange={setAllowPartialCode} />
          </label>
        </div>
      </div>
    </div>
  );
};

// ─── METHOD CONFIG MODAL ──────────────────────────────────────────────────────
const MethodConfigModal = ({ method, onClose }) => {
  // Build sections based on method
  const getMethodSections = (methodId) => {
    const base = [
      { id: 'rewards', label: 'Recompensas', icon: 'Star' },
      { id: 'control', label: 'Control', icon: 'Shield' },
      { id: 'establishments', label: 'Establecimientos', icon: 'MapPin' },
    ];
    if (methodId === 'geofence') {
      return [{ id: 'perimeter', label: 'Perímetro', icon: 'CircleDot' }, ...base];
    }
    if (methodId === 'qr') {
      return [{ id: 'qr_config', label: 'QR', icon: 'QrCode' }, ...base];
    }
    if (methodId === 'manual') {
      return [{ id: 'code_config', label: 'Código', icon: 'Keyboard' }, ...base];
    }
    return base;
  };

  const sections = getMethodSections(method?.id);
  const [activeSection, setActiveSection] = useState(sections?.[0]?.id);

  // Rewards state
  const [rewardType, setRewardType] = useState('extra_points');
  const [basePoints, setBasePoints] = useState(10);
  const [multipliers, setMultipliers] = useState([
    { id: 1, type: 'day', condition: 'Martes', multiplier: 2, active: true },
  ]);
  const [showAddMultiplier, setShowAddMultiplier] = useState(false);
  const [newMultiplier, setNewMultiplier] = useState({ type: 'day', condition: '', multiplier: 2 });
  const [selectedCoupon, setSelectedCoupon] = useState('');
  const [couponCondition, setCouponCondition] = useState('always');
  const [couponNthVisit, setCouponNthVisit] = useState(5);
  const [couponMinAmount, setCouponMinAmount] = useState(200);
  const [stampCardEnabled, setStampCardEnabled] = useState(true);
  const [stampsPerCheckin, setStampsPerCheckin] = useState(1);

  // New reward type state
  const [selectedPromotion, setSelectedPromotion] = useState('');
  const [selectedSurprise, setSelectedSurprise] = useState('');
  const [selectedLoyaltyReward, setSelectedLoyaltyReward] = useState('');

  // Supabase data for selectors
  const [coupons, setCoupons] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [surprises, setSurprises] = useState([]);
  const [loyaltyRewards, setLoyaltyRewards] = useState([]);
  const [loadingRewardData, setLoadingRewardData] = useState(false);

  // Control state
  const [freqType, setFreqType] = useState('once_day');
  const [freqHours, setFreqHours] = useState(4);
  const [freqMax, setFreqMax] = useState(3);
  const [cooldown, setCooldown] = useState(30);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState(5);

  // Establishment state
  const [establishments, setEstablishments] = useState([]);
  const [loadingEstablishments, setLoadingEstablishments] = useState(false);
  const [selectedEstablishments, setSelectedEstablishments] = useState(['all']);

  // QR Geolocation state
  const [qrGeoConfig, setQrGeoConfig] = useState({
    enabled: true,
    lat: null,
    lng: null,
    locationName: '',
    locationId: null,
  });

  // Manual Geolocation state
  const [manualGeoConfig, setManualGeoConfig] = useState({
    enabled: true,
    lat: null,
    lng: null,
    locationName: '',
    locationId: null,
  });

  // Save state
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load reward-related data from Supabase
  useEffect(() => {
    const loadRewardData = async () => {
      setLoadingRewardData(true);
      try {
        const { data: { user } } = await supabase?.auth?.getUser();
        if (!user) return;

        // Load coupons (business_id is text)
        const { data: couponsData } = await supabase
          ?.from('coupons')
          ?.select('id, title, discount_type, discount_value, status')
          ?.eq('business_id', user?.id)
          ?.eq('status', 'active')
          ?.order('title', { ascending: true });
        setCoupons(couponsData || []);

        // Load promotions (user_id is uuid)
        const { data: promoData } = await supabase
          ?.from('promotions')
          ?.select('id, title, promotion_type, status')
          ?.eq('user_id', user?.id)
          ?.eq('status', 'active')
          ?.order('title', { ascending: true });
        setPromotions(promoData || []);

        // Load surprises (business_id is uuid)
        const { data: surpriseData } = await supabase
          ?.from('surprise_rewards_config')
          ?.select('id, mechanic, is_active')
          ?.eq('business_id', user?.id)
          ?.eq('is_active', true)
          ?.order('mechanic', { ascending: true });
        setSurprises(surpriseData || []);

        // Load loyalty rewards catalog (created_by is uuid)
        const { data: rewardsData } = await supabase
          ?.from('loyalty_rewards')
          ?.select('id, title, reward_type, status, points_cost')
          ?.eq('created_by', user?.id)
          ?.eq('status', 'active')
          ?.order('title', { ascending: true });
        setLoyaltyRewards(rewardsData || []);
      } catch (err) {
        console.error('Error loading reward data:', err);
      } finally {
        setLoadingRewardData(false);
      }
    };
    loadRewardData();
  }, []);

  // Load establishments from Supabase
  useEffect(() => {
    const loadEstablishments = async () => {
      setLoadingEstablishments(true);
      try {
        const { data: { user } } = await supabase?.auth?.getUser();
        if (!user) {
          setEstablishments([{ id: 'all', name: 'Todos los establecimientos', latitude: null, longitude: null }]);
          return;
        }
        const { data, error } = await supabase?.from('business_locations')?.select('id, branch_name, location_name, latitude, longitude, is_active')?.eq('is_active', true)?.order('branch_name', { ascending: true });

        if (error || !data?.length) {
          setEstablishments([{ id: 'all', name: 'Todos los establecimientos', latitude: null, longitude: null }]);
          return;
        }

        const mapped = data?.map(loc => ({
          id: loc?.id,
          name: loc?.branch_name || loc?.location_name || 'Sucursal',
          latitude: loc?.latitude,
          longitude: loc?.longitude,
        }));
        setEstablishments([{ id: 'all', name: 'Todos los establecimientos', latitude: null, longitude: null }, ...mapped]);
      } catch {
        setEstablishments([{ id: 'all', name: 'Todos los establecimientos', latitude: null, longitude: null }]);
      } finally {
        setLoadingEstablishments(false);
      }
    };
    loadEstablishments();
  }, []);

  // When establishment is selected for QR or Manual method, update geo config
  const handleEstablishmentToggle = useCallback((est) => {
    if (est?.id === 'all') {
      setSelectedEstablishments(['all']);
      if (method?.id === 'qr') {
        setQrGeoConfig(prev => ({ ...prev, lat: null, lng: null, locationName: '', locationId: null }));
      }
      if (method?.id === 'manual') {
        setManualGeoConfig(prev => ({ ...prev, lat: null, lng: null, locationName: '', locationId: null }));
      }
      return;
    }
    setSelectedEstablishments(prev => {
      const withoutAll = prev?.filter(e => e !== 'all');
      if (withoutAll?.includes(est?.id)) {
        const next = withoutAll?.filter(e => e !== est?.id);
        const remaining = next?.length === 0 ? ['all'] : next;
        // Update geo config to first remaining establishment
        if (method?.id === 'qr' || method?.id === 'manual') {
          const firstEst = establishments?.find(e => e?.id === remaining?.[0]);
          const setter = method?.id === 'qr' ? setQrGeoConfig : setManualGeoConfig;
          if (firstEst && firstEst?.id !== 'all' && firstEst?.latitude && firstEst?.longitude) {
            setter(prev => ({
              ...prev,
              lat: Number(firstEst?.latitude),
              lng: Number(firstEst?.longitude),
              locationName: firstEst?.name,
              locationId: firstEst?.id,
            }));
          } else {
            setter(prev => ({ ...prev, lat: null, lng: null, locationName: '', locationId: null }));
          }
        }
        return remaining;
      }
      // Adding this establishment
      if ((method?.id === 'qr' || method?.id === 'manual') && est?.latitude && est?.longitude) {
        const setter = method?.id === 'qr' ? setQrGeoConfig : setManualGeoConfig;
        setter(prev => ({
          ...prev,
          lat: Number(est?.latitude),
          lng: Number(est?.longitude),
          locationName: est?.name,
          locationId: est?.id,
        }));
      }
      return [...withoutAll, est?.id];
    });
  }, [establishments, method?.id]);

  const freqOptions = [
    { id: 'once_day', icon: 'Calendar', label: '1 vez al día', desc: 'El usuario puede hacer check-in una vez por día.' },
    { id: 'every_x_hours', icon: 'Clock', label: 'Cada X horas', desc: 'Permite varias visitas al día si pasan suficientes horas.' },
    { id: 'max_per_day', icon: 'Repeat', label: 'Hasta X veces al día', desc: 'Fija un máximo diario sin restricción de horas.' },
    { id: 'unlimited', icon: 'Infinity', label: 'Sin límite', desc: 'Sin restricciones. Solo para modelos con acceso ilimitado.' },
  ];

  const typeColors = {
    day: 'bg-blue-100 text-blue-700',
    time: 'bg-purple-100 text-purple-700',
    event: 'bg-orange-100 text-orange-700',
  };
  const typeLabels = { day: 'Día', time: 'Horario', event: 'Evento' };

  const handleAddMultiplier = () => {
    if (!newMultiplier?.condition) return;
    setMultipliers(prev => [...prev, { id: Date.now(), ...newMultiplier, active: true }]);
    setNewMultiplier({ type: 'day', condition: '', multiplier: 2 });
    setShowAddMultiplier(false);
  };

  // Save configuration to Supabase
  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) { setSaving(false); return; }

      // Build config object
      const configUpdate = {
        reward_type: rewardType,
        base_points: basePoints,
        multipliers,
        selected_coupon: selectedCoupon,
        coupon_condition: couponCondition,
        coupon_nth_visit: couponNthVisit,
        coupon_min_amount: couponMinAmount,
        stamp_card_enabled: stampCardEnabled,
        stamps_per_checkin: stampsPerCheckin,
        selected_promotion: selectedPromotion,
        selected_surprise: selectedSurprise,
        selected_loyalty_reward: selectedLoyaltyReward,
        freq_type: freqType,
        freq_hours: freqHours,
        freq_max: freqMax,
        cooldown_minutes: cooldown,
        alerts_enabled: alertsEnabled,
        alert_threshold: alertThreshold,
        establishments: selectedEstablishments,
      };

      // Map method id to method_type enum
      const methodTypeMap = {
        qr: 'qr_static',
        geofence: 'geofence',
        manual: 'manual',
        nfc: 'nfc',
        beacon: 'beacon',
      };

      const methodType = methodTypeMap?.[method?.id] || method?.id;

      // Check if method record exists
      const { data: existing } = await supabase?.from('checkin_methods')?.select('id')?.eq('business_id', user?.id)?.eq('method_type', methodType)?.single();

      if (existing) {
        const updatePayload = { config: configUpdate, updated_at: new Date()?.toISOString() };
        // For QR method, save geolocation columns (always enabled)
        if (method?.id === 'qr') {
          updatePayload.qr_geo_enabled = true;
          updatePayload.qr_geo_lat = qrGeoConfig?.lat || null;
          updatePayload.qr_geo_lng = qrGeoConfig?.lng || null;
          updatePayload.qr_geo_radius_meters = 10;
          updatePayload.qr_geo_location_id = qrGeoConfig?.locationId || null;
        }
        // For Manual method, save geolocation columns (always enabled)
        if (method?.id === 'manual') {
          updatePayload.qr_geo_enabled = true;
          updatePayload.qr_geo_lat = manualGeoConfig?.lat || null;
          updatePayload.qr_geo_lng = manualGeoConfig?.lng || null;
          updatePayload.qr_geo_radius_meters = 10;
          updatePayload.qr_geo_location_id = manualGeoConfig?.locationId || null;
        }
        await supabase?.from('checkin_methods')?.update(updatePayload)?.eq('id', existing?.id);
      } else {
        const insertPayload = {
          business_id: user?.id,
          method_type: methodType,
          is_active: true,
          config: configUpdate,
        };
        if (method?.id === 'qr') {
          insertPayload.qr_geo_enabled = true;
          insertPayload.qr_geo_lat = qrGeoConfig?.lat || null;
          insertPayload.qr_geo_lng = qrGeoConfig?.lng || null;
          insertPayload.qr_geo_radius_meters = 10;
          insertPayload.qr_geo_location_id = qrGeoConfig?.locationId || null;
        }
        if (method?.id === 'manual') {
          insertPayload.qr_geo_enabled = true;
          insertPayload.qr_geo_lat = manualGeoConfig?.lat || null;
          insertPayload.qr_geo_lng = manualGeoConfig?.lng || null;
          insertPayload.qr_geo_radius_meters = 10;
          insertPayload.qr_geo_location_id = manualGeoConfig?.locationId || null;
        }
        await supabase?.from('checkin_methods')?.insert(insertPayload);
      }

      setSaveSuccess(true);
      setTimeout(() => { setSaveSuccess(false); onClose(method?.id); }, 1200);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${method?.bg} flex items-center justify-center`}>
              <Icon name={method?.icon} size={20} className={method?.color} />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-lg">Configurar: {method?.name}</h2>
              <p className="text-xs text-muted-foreground">Recompensas, control y establecimientos donde aplica</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <Icon name="X" size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-border flex-shrink-0 overflow-x-auto">
          {sections?.map(s => (
            <button
              key={s?.id}
              onClick={() => setActiveSection(s?.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeSection === s?.id
                  ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={s?.icon} size={15} />
              {s?.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-6">

          {/* ── GEOFENCE PERIMETER ── */}
          {activeSection === 'perimeter' && <GeofenceConfigSection />}

          {/* ── QR CONFIG ── */}
          {activeSection === 'qr_config' && (
            <QRConfigSection />
          )}

          {/* ── MANUAL CODE CONFIG ── */}
          {activeSection === 'code_config' && <ManualCodeConfigSection />}

          {/* ── REWARDS ── */}
          {activeSection === 'rewards' && (
            <div className="space-y-5">
              {/* Reward Type Selector */}
              <div className="bg-muted/30 border border-border rounded-xl p-5">
                <h4 className="font-semibold text-foreground mb-1">Tipo de recompensa al hacer check-in</h4>
                <p className="text-xs text-muted-foreground mb-4">Elige qué tipo de recompensa recibirá el cliente al registrar su visita con este método.</p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'extra_points', icon: 'Star', label: 'Puntos extra por check-in', desc: 'Otorga puntos adicionales al programa de lealtad del cliente.', color: 'text-amber-600', bg: 'bg-amber-50' },
                    { id: 'multipliers', icon: 'Zap', label: 'Multiplicadores de puntos', desc: 'Multiplica los puntos según el día, horario o evento especial.', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { id: 'coupon', icon: 'Ticket', label: 'Activar cupón al hacer check-in', desc: 'Entrega automáticamente un cupón configurado al cliente.', color: 'text-violet-600', bg: 'bg-violet-50' },
                    { id: 'stamp', icon: 'Stamp', label: 'Sello automático en tarjeta de sello', desc: 'Agrega un sello a la tarjeta de punches activa del cliente.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { id: 'activate_promotion', icon: 'Tag', label: 'Activar promoción', desc: 'Activa una promoción registrada del negocio al hacer check-in.', color: 'text-orange-600', bg: 'bg-orange-50' },
                    { id: 'add_surprise', icon: 'Gift', label: 'Agregar sorpresa', desc: 'Asigna una sorpresa configurada del negocio al cliente.', color: 'text-pink-600', bg: 'bg-pink-50' },
                    { id: 'add_reward', icon: 'Award', label: 'Agregar recompensa', desc: 'Otorga una recompensa del catálogo de lealtad al cliente.', color: 'text-teal-600', bg: 'bg-teal-50' },
                  ]?.map(opt => (
                    <button
                      key={opt?.id}
                      onClick={() => setRewardType(opt?.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        rewardType === opt?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${rewardType === opt?.id ? 'bg-primary text-white' : `${opt?.bg} ${opt?.color}`}`}>
                        <Icon name={opt?.icon} size={17} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{opt?.label}</p>
                        <p className="text-xs text-muted-foreground">{opt?.desc}</p>
                      </div>
                      {rewardType === opt?.id && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <Icon name="Check" size={12} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Extra Points Config ── */}
              {rewardType === 'extra_points' && (
                <div className="bg-muted/30 border border-border rounded-xl p-5">
                  <h4 className="font-semibold text-foreground mb-4">Puntos extra por check-in</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setBasePoints(p => Math.max(1, p - 1))}
                        className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors font-bold text-lg"
                      >−</button>
                      <div className="text-center min-w-[56px]">
                        <span className="text-3xl font-bold text-primary">{basePoints}</span>
                        <p className="text-xs text-muted-foreground">puntos</p>
                      </div>
                      <button
                        onClick={() => setBasePoints(p => p + 1)}
                        className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors font-bold text-lg"
                      >+</button>
                    </div>
                    <div className="flex-1 bg-primary/5 border border-primary/20 rounded-xl p-3">
                      <p className="text-xs text-foreground">
                        Con <strong>{basePoints} pts</strong> extra por check-in, el cliente acumula más rápido hacia su siguiente recompensa.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Multipliers Config ── */}
              {rewardType === 'multipliers' && (
                <div className="bg-muted/30 border border-border rounded-xl p-5">
                  <h4 className="font-semibold text-foreground mb-3">Multiplicadores de puntos</h4>
                  <div className="space-y-2 mb-3">
                    {multipliers?.map(m => (
                      <div key={m?.id} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors?.[m?.type] || 'bg-gray-100 text-gray-600'}`}>
                            {typeLabels?.[m?.type]}
                          </span>
                          <span className="text-sm font-medium text-foreground">{m?.condition}</span>
                          <span className="text-sm text-primary font-semibold">×{m?.multiplier}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Toggle value={m?.active} onChange={val => setMultipliers(prev => prev?.map(x => x?.id === m?.id ? { ...x, active: val } : x))} />
                          <button onClick={() => setMultipliers(prev => prev?.filter(x => x?.id !== m?.id))} className="p-1 text-muted-foreground hover:text-red-500 transition-colors">
                            <Icon name="Trash2" size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {showAddMultiplier ? (
                    <div className="border border-border rounded-xl p-4 space-y-3 bg-card">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
                          <select value={newMultiplier?.type} onChange={e => setNewMultiplier(p => ({ ...p, type: e?.target?.value }))}
                            className="w-full border border-border rounded-lg px-2 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                            <option value="day">Día</option>
                            <option value="time">Horario</option>
                            <option value="event">Evento</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Condición</label>
                          <input type="text" placeholder="Ej: Lunes" value={newMultiplier?.condition}
                            onChange={e => setNewMultiplier(p => ({ ...p, condition: e?.target?.value }))}
                            className="w-full border border-border rounded-lg px-2 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Multiplicador</label>
                          <select value={newMultiplier?.multiplier} onChange={e => setNewMultiplier(p => ({ ...p, multiplier: Number(e?.target?.value) }))}
                            className="w-full border border-border rounded-lg px-2 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                            {[1.5, 2, 2.5, 3, 4, 5]?.map(v => <option key={v} value={v}>×{v}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleAddMultiplier} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Agregar</button>
                        <button onClick={() => setShowAddMultiplier(false)} className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setShowAddMultiplier(true)} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                      <Icon name="Plus" size={15} /> Agregar multiplicador
                    </button>
                  )}
                </div>
              )}

              {/* ── Coupon Config ── */}
              {rewardType === 'coupon' && (
                <div className="space-y-4">
                  <div className="bg-muted/30 border border-border rounded-xl p-5">
                    <h4 className="font-semibold text-foreground mb-1">Seleccionar cupón</h4>
                    <p className="text-xs text-muted-foreground mb-3">Elige el cupón que se activará automáticamente al hacer check-in.</p>
                    {loadingRewardData ? (
                      <div className="flex items-center gap-2 py-3 text-muted-foreground">
                        <Icon name="Loader2" size={15} className="animate-spin" />
                        <span className="text-sm">Cargando cupones...</span>
                      </div>
                    ) : coupons?.length === 0 ? (
                      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <Icon name="AlertCircle" size={15} className="text-amber-600 flex-shrink-0" />
                        <p className="text-xs text-amber-700">No tienes cupones activos registrados. Crea cupones en el módulo de Cupones para poder seleccionarlos aquí.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {coupons?.map(cup => (
                          <label key={cup?.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedCoupon === cup?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                          }`}>
                            <input
                              type="radio"
                              name="coupon_select"
                              value={cup?.id}
                              checked={selectedCoupon === cup?.id}
                              onChange={() => setSelectedCoupon(cup?.id)}
                              className="text-primary focus:ring-primary/30"
                            />
                            <div className="flex items-center gap-2 flex-1">
                              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Icon name="Ticket" size={15} className="text-violet-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{cup?.title}</p>
                                <span className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full capitalize">{cup?.discount_type === 'percentage' ? `${cup?.discount_value}% descuento` : cup?.discount_type === 'fixed_amount' ? `$${cup?.discount_value} descuento` : cup?.discount_type}</span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                    {!selectedCoupon && coupons?.length > 0 && (
                      <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                        <Icon name="AlertCircle" size={12} /> Selecciona un cupón para continuar.
                      </p>
                    )}
                  </div>
                  <div className="bg-muted/30 border border-border rounded-xl p-5">
                    <h4 className="font-semibold text-foreground mb-1">Condición de activación</h4>
                    <p className="text-xs text-muted-foreground mb-3">Define cuándo se entrega el cupón al cliente.</p>
                    <div className="space-y-2">
                      {[
                        { id: 'always', icon: 'CheckCircle', label: 'Siempre', desc: 'El cupón se entrega en cada check-in.' },
                        { id: 'first_visit', icon: 'Star', label: 'Solo en la primera visita', desc: 'El cupón se entrega únicamente la primera vez que el cliente hace check-in.' },
                        { id: 'nth_visit', icon: 'Hash', label: 'En la visita número N', desc: 'El cupón se entrega cuando el cliente alcanza un número específico de visitas.' },
                        { id: 'min_amount', icon: 'DollarSign', label: 'Con consumo mínimo', desc: 'El cupón se activa si el cliente tiene un consumo mínimo registrado.' },
                      ]?.map(cond => (
                        <button
                          key={cond?.id}
                          onClick={() => setCouponCondition(cond?.id)}
                          className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                            couponCondition === cond?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${couponCondition === cond?.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                            <Icon name={cond?.icon} size={15} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground text-sm">{cond?.label}</p>
                            <p className="text-xs text-muted-foreground">{cond?.desc}</p>
                            {couponCondition === cond?.id && cond?.id === 'nth_visit' && (
                              <div className="mt-2 flex items-center gap-2" onClick={e => e?.stopPropagation()}>
                                <span className="text-xs text-foreground">Visita número</span>
                                <input type="number" min={2} max={50} value={couponNthVisit}
                                  onChange={e => setCouponNthVisit(Number(e?.target?.value))}
                                  className="w-16 border border-border rounded-lg px-2 py-1 text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
                              </div>
                            )}
                            {couponCondition === cond?.id && cond?.id === 'min_amount' && (
                              <div className="mt-2 flex items-center gap-2" onClick={e => e?.stopPropagation()}>
                                <span className="text-xs text-foreground">Monto mínimo $</span>
                                <input type="number" min={1} value={couponMinAmount}
                                  onChange={e => setCouponMinAmount(Number(e?.target?.value))}
                                  className="w-20 border border-border rounded-lg px-2 py-1 text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Stamp Card Config ── */}
              {rewardType === 'stamp' && (
                <div className="bg-muted/30 border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground">Sello automático en tarjeta de sello</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Al hacer check-in se agrega automáticamente un sello a la tarjeta activa del cliente.</p>
                    </div>
                    <Toggle value={stampCardEnabled} onChange={setStampCardEnabled} />
                  </div>
                  {stampCardEnabled && (
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setStampsPerCheckin(p => Math.max(1, p - 1))}
                            className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors font-bold text-lg"
                          >−</button>
                          <div className="text-center min-w-[56px]">
                            <span className="text-3xl font-bold text-primary">{stampsPerCheckin}</span>
                            <p className="text-xs text-muted-foreground">{stampsPerCheckin === 1 ? 'sello' : 'sellos'}</p>
                          </div>
                          <button
                            onClick={() => setStampsPerCheckin(p => Math.min(5, p + 1))}
                            className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors font-bold text-lg"
                          >+</button>
                        </div>
                        <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                          <p className="text-xs text-emerald-700">
                            Se agregarán <strong>{stampsPerCheckin} sello{stampsPerCheckin > 1 ? 's' : ''}</strong> a la tarjeta de sello activa del cliente en cada check-in con este método.
                          </p>
                        </div>
                      </div>
                      <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg flex items-start gap-2">
                        <Icon name="Info" size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-700">
                          El sello se aplica a la tarjeta de punches activa del cliente. Si no tiene ninguna activa, se le asignará la tarjeta predeterminada del negocio.
                        </p>
                      </div>
                    </div>
                  )}
                  {!stampCardEnabled && (
                    <p className="text-sm text-muted-foreground">Activa para configurar los sellos automáticos por check-in.</p>
                  )}
                </div>
              )}

              {/* ── Activate Promotion Config ── */}
              {rewardType === 'activate_promotion' && (
                <div className="bg-muted/30 border border-border rounded-xl p-5">
                  <h4 className="font-semibold text-foreground mb-1">Seleccionar promoción</h4>
                  <p className="text-xs text-muted-foreground mb-3">Elige la promoción que se activará automáticamente al hacer check-in.</p>
                  {loadingRewardData ? (
                    <div className="flex items-center gap-2 py-3 text-muted-foreground">
                      <Icon name="Loader2" size={15} className="animate-spin" />
                      <span className="text-sm">Cargando promociones...</span>
                    </div>
                  ) : promotions?.length === 0 ? (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <Icon name="AlertCircle" size={15} className="text-amber-600 flex-shrink-0" />
                      <p className="text-xs text-amber-700">No tienes promociones activas registradas. Crea promociones en el módulo de Promociones para poder seleccionarlas aquí.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {promotions?.map(promo => (
                        <label key={promo?.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedPromotion === promo?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                        }`}>
                          <input
                            type="radio"
                            name="promotion_select"
                            value={promo?.id}
                            checked={selectedPromotion === promo?.id}
                            onChange={() => setSelectedPromotion(promo?.id)}
                            className="text-primary focus:ring-primary/30"
                          />
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Icon name="Tag" size={15} className="text-orange-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{promo?.title}</p>
                              <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full capitalize">{promo?.promotion_type?.replace(/_/g, ' ')}</span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                  {!selectedPromotion && promotions?.length > 0 && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <Icon name="AlertCircle" size={12} /> Selecciona una promoción para continuar.
                    </p>
                  )}
                </div>
              )}

              {/* ── Add Surprise Config ── */}
              {rewardType === 'add_surprise' && (
                <div className="bg-muted/30 border border-border rounded-xl p-5">
                  <h4 className="font-semibold text-foreground mb-1">Seleccionar sorpresa</h4>
                  <p className="text-xs text-muted-foreground mb-3">Elige la sorpresa configurada que se asignará al cliente al hacer check-in.</p>
                  {loadingRewardData ? (
                    <div className="flex items-center gap-2 py-3 text-muted-foreground">
                      <Icon name="Loader2" size={15} className="animate-spin" />
                      <span className="text-sm">Cargando sorpresas...</span>
                    </div>
                  ) : surprises?.length === 0 ? (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <Icon name="AlertCircle" size={15} className="text-amber-600 flex-shrink-0" />
                      <p className="text-xs text-amber-700">No tienes sorpresas activas configuradas. Crea sorpresas en el módulo de Sorpresas para poder seleccionarlas aquí.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {surprises?.map(surprise => {
                        const mechanicLabels = { wheel: 'Ruleta', scratch: 'Raspadito', chest: 'Cofre', envelope: 'Sobre' };
                        const mechanicIcons = { wheel: 'RotateCcw', scratch: 'Layers', chest: 'Package', envelope: 'Mail' };
                        return (
                          <label key={surprise?.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedSurprise === surprise?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                          }`}>
                            <input
                              type="radio"
                              name="surprise_select"
                              value={surprise?.id}
                              checked={selectedSurprise === surprise?.id}
                              onChange={() => setSelectedSurprise(surprise?.id)}
                              className="text-primary focus:ring-primary/30"
                            />
                            <div className="flex items-center gap-2 flex-1">
                              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Icon name={mechanicIcons?.[surprise?.mechanic] || 'Gift'} size={15} className="text-pink-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{mechanicLabels?.[surprise?.mechanic] || surprise?.mechanic}</p>
                                <span className="text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full">Sorpresa activa</span>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                  {!selectedSurprise && surprises?.length > 0 && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <Icon name="AlertCircle" size={12} /> Selecciona una sorpresa para continuar.
                    </p>
                  )}
                </div>
              )}

              {/* ── Add Loyalty Reward Config ── */}
              {rewardType === 'add_reward' && (
                <div className="bg-muted/30 border border-border rounded-xl p-5">
                  <h4 className="font-semibold text-foreground mb-1">Seleccionar recompensa del catálogo</h4>
                  <p className="text-xs text-muted-foreground mb-3">Elige la recompensa del catálogo de lealtad que se otorgará al cliente al hacer check-in.</p>
                  {loadingRewardData ? (
                    <div className="flex items-center gap-2 py-3 text-muted-foreground">
                      <Icon name="Loader2" size={15} className="animate-spin" />
                      <span className="text-sm">Cargando recompensas...</span>
                    </div>
                  ) : loyaltyRewards?.length === 0 ? (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <Icon name="AlertCircle" size={15} className="text-amber-600 flex-shrink-0" />
                      <p className="text-xs text-amber-700">No tienes recompensas activas en el catálogo. Crea recompensas en el módulo de Recompensas para poder seleccionarlas aquí.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {loyaltyRewards?.map(reward => (
                        <label key={reward?.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedLoyaltyReward === reward?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                        }`}>
                          <input
                            type="radio"
                            name="loyalty_reward_select"
                            value={reward?.id}
                            checked={selectedLoyaltyReward === reward?.id}
                            onChange={() => setSelectedLoyaltyReward(reward?.id)}
                            className="text-primary focus:ring-primary/30"
                          />
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Icon name="Award" size={15} className="text-teal-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{reward?.title}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full capitalize">{reward?.reward_type?.replace(/_/g, ' ')}</span>
                                <span className="text-xs text-muted-foreground">{reward?.points_cost} pts</span>
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                  {!selectedLoyaltyReward && loyaltyRewards?.length > 0 && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <Icon name="AlertCircle" size={12} /> Selecciona una recompensa para continuar.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── CONTROL ── */}
          {activeSection === 'control' && (
            <div className="space-y-5">
              {/* Frequency */}
              <div className="bg-muted/30 border border-border rounded-xl p-5">
                <h4 className="font-semibold text-foreground mb-4">Frecuencia máxima de check-in</h4>
                <div className="space-y-2">
                  {freqOptions?.map(opt => (
                    <button key={opt?.id} onClick={() => setFreqType(opt?.id)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        freqType === opt?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                      }`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${freqType === opt?.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                        <Icon name={opt?.icon} size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{opt?.label}</p>
                        <p className="text-xs text-muted-foreground">{opt?.desc}</p>
                        {freqType === opt?.id && opt?.id === 'every_x_hours' && (
                          <div className="mt-2 flex items-center gap-2" onClick={e => e?.stopPropagation()}>
                            <span className="text-xs text-foreground">Cada</span>
                            <input type="number" min={2} max={12} value={freqHours} onChange={e => setFreqHours(Number(e?.target?.value))}
                              className="w-14 border border-border rounded-lg px-2 py-1 text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            <span className="text-xs text-foreground">horas</span>
                          </div>
                        )}
                        {freqType === opt?.id && opt?.id === 'max_per_day' && (
                          <div className="mt-2 flex items-center gap-2" onClick={e => e?.stopPropagation()}>
                            <span className="text-xs text-foreground">Hasta</span>
                            <input type="number" min={2} max={10} value={freqMax} onChange={e => setFreqMax(Number(e?.target?.value))}
                              className="w-14 border border-border rounded-lg px-2 py-1 text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            <span className="text-xs text-foreground">veces al día</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cooldown */}
              <div className="bg-muted/30 border border-border rounded-xl p-5">
                <h4 className="font-semibold text-foreground mb-1">Cooldown entre check-ins</h4>
                <p className="text-xs text-muted-foreground mb-3">Tiempo mínimo entre dos check-ins del mismo usuario.</p>
                <div className="flex flex-wrap gap-2">
                  {COOLDOWN_OPTIONS?.map(opt => (
                    <button key={opt?.value} onClick={() => setCooldown(opt?.value)}
                      className={`flex-1 min-w-[60px] py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                        cooldown === opt?.value ? 'border-primary bg-primary text-white' : 'border-border text-muted-foreground hover:border-primary/40'
                      }`}>
                      {opt?.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alerts */}
              <div className="bg-muted/30 border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground">Alertas de intentos sospechosos</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Detecta patrones de abuso y notifica al Admin.</p>
                  </div>
                  <Toggle value={alertsEnabled} onChange={setAlertsEnabled} />
                </div>
                {alertsEnabled && (
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm text-foreground">Alertar si supera</span>
                    <input type="number" min={2} max={20} value={alertThreshold} onChange={e => setAlertThreshold(Number(e?.target?.value))}
                      className="w-16 border border-border rounded-lg px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <span className="text-sm text-foreground">intentos fallidos/día</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ESTABLISHMENTS ── */}
          {activeSection === 'establishments' && (
            <div className="space-y-4">
              <div className="bg-muted/30 border border-border rounded-xl p-5">
                <h4 className="font-semibold text-foreground mb-1">¿En qué establecimientos aplica este método?</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Selecciona los establecimientos donde este método de check-in estará disponible.
                  {(method?.id === 'qr' || method?.id === 'manual') && <span className="text-blue-600 font-medium"> Al seleccionar un establecimiento, se mostrará el mapa con el radio de validación de 10 metros.</span>}
                </p>

                {loadingEstablishments ? (
                  <div className="flex items-center gap-2 py-4 text-muted-foreground">
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    <span className="text-sm">Cargando establecimientos...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {establishments?.map(est => (
                      <label
                        key={est?.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedEstablishments?.includes(est?.id)
                            ? 'border-primary bg-primary/5' :'border-border hover:bg-muted/30'
                        }`}
                        onClick={() => handleEstablishmentToggle(est)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedEstablishments?.includes(est?.id)}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            selectedEstablishments?.includes(est?.id) ? 'bg-primary/20' : 'bg-primary/10'
                          }`}>
                            <Icon name={est?.id === 'all' ? 'Globe' : 'Store'} size={14} className="text-primary" />
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-foreground">{est?.name}</span>
                            {est?.latitude && est?.longitude && (
                              <p className="text-xs text-muted-foreground">
                                {Number(est?.latitude)?.toFixed(6)}, {Number(est?.longitude)?.toFixed(6)}
                              </p>
                            )}
                          </div>
                        </div>
                        {est?.id === 'all' && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Recomendado</span>
                        )}
                        {(method?.id === 'qr' || method?.id === 'manual') && est?.id !== 'all' && est?.latitude && est?.longitude && (
                          <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Icon name="MapPin" size={10} />
                            GPS
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}

                <div className="mt-4 p-3 bg-blue-50/60 border border-blue-100 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>{selectedEstablishments?.includes('all') ? 'Todos los establecimientos' : `${selectedEstablishments?.length} establecimiento(s)`}</strong> tendrán habilitado el método <strong>{method?.name}</strong>.
                  </p>
                </div>
              </div>

              {/* Geolocation validation — default for QR and Manual */}
              {(method?.id === 'qr' || method?.id === 'manual') && (() => {
                const geoConf = method?.id === 'qr' ? qrGeoConfig : manualGeoConfig;
                return (
                  <div className="bg-blue-50/40 border border-blue-200 rounded-xl overflow-hidden">
                    <div className="px-5 pt-4 pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon name="LocateFixed" size={16} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-foreground text-sm">Validación por geolocalización</h4>
                            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-medium">Activo · 10 m</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            El cliente debe estar dentro de los <strong>10 metros</strong> del establecimiento para que el check-in sea válido.
                          </p>
                        </div>
                      </div>
                    </div>

                    {geoConf?.lat && geoConf?.lng ? (
                      <QRGeolocationMap
                        lat={geoConf?.lat}
                        lng={geoConf?.lng}
                        radius={10}
                        locationName={geoConf?.locationName || 'Establecimiento seleccionado'}
                      />
                    ) : (
                      <div className="mx-5 mb-4 flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <Icon name="AlertCircle" size={18} className="text-amber-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">Sin establecimiento con GPS configurado</p>
                          <p className="text-xs text-amber-700 mt-0.5">Selecciona un establecimiento con coordenadas GPS en la lista de arriba para ver el mapa de validación de 10 metros.</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <><Icon name="Loader2" size={15} className="animate-spin" /> Guardando...</>
            ) : saveSuccess ? (
              <><Icon name="CheckCircle" size={15} /> ¡Guardado!</>
            ) : (
              <><Icon name="Save" size={15} /> Guardar configuración</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const CheckInConfigPage = () => {
  const navigate = useNavigate();
  const [methods, setMethods] = useState(METHODS);
  const [configuringMethod, setConfiguringMethod] = useState(null);
  const [configuredMethods, setConfiguredMethods] = useState(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [user] = useState({
    id: 1,
    name: 'Carlos Mendoza',
    email: 'carlos@restauranteeljardin.com',
    role: 'owner',
    business: 'Restaurante El Jardín',
  });

  // Load which methods already have saved config in Supabase
  useEffect(() => {
    const loadConfiguredMethods = async () => {
      try {
        const { data: { user: authUser } } = await supabase?.auth?.getUser();
        if (!authUser) return;
        const { data } = await supabase
          ?.from('checkin_methods')
          ?.select('method_type')
          ?.eq('business_id', authUser?.id);
        if (data?.length) {
          const methodTypeToId = {
            qr_static: 'qr',
            geofence: 'geofence',
            manual: 'manual',
            nfc: 'nfc',
            beacon: 'beacon',
          };
          const ids = data?.map(r => methodTypeToId?.[r?.method_type] || r?.method_type)?.filter(Boolean);
          setConfiguredMethods(new Set(ids));
        }
      } catch (err) {
        console.error('Error loading configured methods:', err);
      }
    };
    loadConfiguredMethods();
  }, []);

  const toggleMethod = (id, e) => {
    e?.stopPropagation();
    setMethods(prev => prev?.map(m => m?.id === id ? { ...m, enabled: !m?.enabled } : m));
  };

  const selectedMethod = methods?.find(m => m?.id === configuringMethod);

  const handleModalClose = (savedMethodId) => {
    if (savedMethodId) {
      setConfiguredMethods(prev => new Set([...prev, savedMethodId]));
    }
    setConfiguringMethod(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onMenuToggle={() => setIsSidebarOpen(p => !p)}
        isMenuOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(p => !p)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(p => !p)}
      />
      <main className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <button onClick={() => navigate('/check-in-module')} className="hover:text-foreground transition-colors">
              Check-in y Validación
            </button>
            <Icon name="ChevronRight" size={14} />
            <span className="text-foreground font-medium">Configurar Métodos</span>
          </div>

          {/* Page Header */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Configurar Métodos de Check-in</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Activa, desactiva y configura cada método de validación de visitas.</p>
            </div>
            <button
              onClick={() => navigate('/check-in-module')}
              className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              <Icon name="ArrowLeft" size={15} />
              Volver al resumen
            </button>
          </div>

          {/* Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {methods?.map(method => (
              <div
                key={method?.id}
                className={`bg-card rounded-2xl border-2 p-5 transition-all hover:shadow-md ${
                  method?.enabled ? 'border-border' : 'border-dashed border-border/60'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-11 h-11 rounded-xl ${method?.bg} flex items-center justify-center`}>
                      <Icon name={method?.icon} size={22} className={method?.color} />
                    </div>
                    {configuredMethods?.has(method?.id) && (
                      <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Icon name="CheckCircle2" size={12} />
                        Configurado
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      method?.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {method?.enabled ? 'Activo' : 'Inactivo'}
                    </span>
                    <Toggle value={method?.enabled} onChange={() => toggleMethod(method?.id, { stopPropagation: () => {} })} />
                  </div>
                </div>

                {/* Card Body */}
                <h3 className="font-semibold text-foreground mb-1">{method?.name}</h3>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{method?.description}</p>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-lg font-bold text-foreground">{method?.checkins?.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground ml-1">check-ins/mes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${method?.confidenceColor}`}>
                      Confianza {method?.confidence}
                    </span>
                    {method?.requiresHardware && (
                      <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                        Requiere hardware
                      </span>
                    )}
                  </div>
                </div>

                {/* Configure Button */}
                <button
                  onClick={() => setConfiguringMethod(method?.id)}
                  className={`w-full py-2.5 flex items-center justify-center gap-2 border rounded-xl text-sm font-medium transition-colors ${
                    configuredMethods?.has(method?.id)
                      ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700' :'bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary'
                  }`}
                >
                  <Icon name={configuredMethods?.has(method?.id) ? 'Settings2' : 'Settings2'} size={15} />
                  {configuredMethods?.has(method?.id) ? 'Editar configuración' : 'Configurar'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Method Config Modal */}
      {configuringMethod && selectedMethod && (
        <MethodConfigModal
          method={selectedMethod}
          onClose={(savedMethodId) => handleModalClose(savedMethodId)}
        />
      )}
    </div>
  );
};

export default CheckInConfigPage;
