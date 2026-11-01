import React, { useEffect, useRef, useState, useCallback } from 'react';
import Icon from '../../../components/AppIcon';

const MAPBOX_TOKEN = import.meta.env?.VITE_MAPBOX_TOKEN;
const GEOCODING_BASE = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
const DEFAULT_CENTER = { lat: 23.6345, lng: -102.5528 };
const DEFAULT_ZOOM = 5;

const ESTADOS_MX_MAP = {
  'aguascalientes': 'Aguascalientes', 'baja california': 'Baja California',
  'baja california sur': 'Baja California Sur', 'campeche': 'Campeche',
  'chiapas': 'Chiapas', 'chihuahua': 'Chihuahua',
  'ciudad de méxico': 'Ciudad de México', 'cdmx': 'Ciudad de México',
  'coahuila': 'Coahuila', 'colima': 'Colima', 'durango': 'Durango',
  'guanajuato': 'Guanajuato', 'guerrero': 'Guerrero', 'hidalgo': 'Hidalgo',
  'jalisco': 'Jalisco', 'méxico': 'México', 'estado de méxico': 'México',
  'michoacán': 'Michoacán', 'morelos': 'Morelos', 'nayarit': 'Nayarit',
  'nuevo león': 'Nuevo León', 'oaxaca': 'Oaxaca', 'puebla': 'Puebla',
  'querétaro': 'Querétaro', 'quintana roo': 'Quintana Roo',
  'san luis potosí': 'San Luis Potosí', 'sinaloa': 'Sinaloa',
  'sonora': 'Sonora', 'tabasco': 'Tabasco', 'tamaulipas': 'Tamaulipas',
  'tlaxcala': 'Tlaxcala', 'veracruz': 'Veracruz', 'yucatán': 'Yucatán',
  'zacatecas': 'Zacatecas',
};

/**
 * Parse Mapbox feature context to extract address components
 */
const parseMapboxFeature = (feature) => {
  const context = feature?.context || [];
  const result = {
    street: '',
    colonia: '',
    city: '',
    state: '',
    postalCode: '',
  };

  // Street: from feature text + address number
  if (feature?.place_type?.includes('address')) {
    const streetNum = feature?.address || '';
    const streetName = feature?.text || '';
    result.street = streetNum ? `${streetName} ${streetNum}` : streetName;
  } else if (feature?.place_type?.includes('poi')) {
    // For POI, try to get address from properties
    result.street = feature?.properties?.address || feature?.text || '';
  }

  context?.forEach((c) => {
    const id = c?.id || '';
    const text = c?.text || '';
    const textLower = text?.toLowerCase();

    // Colonia: neighborhood, locality, or district (Mexico uses these for colonias)
    if (
      id?.startsWith('neighborhood') ||
      id?.startsWith('locality') ||
      id?.startsWith('district')
    ) {
      if (!result?.colonia) result.colonia = text;
    } else if (id?.startsWith('postcode')) {
      result.postalCode = text;
    } else if (id?.startsWith('place')) {
      if (!result?.city) result.city = text;
    } else if (id?.startsWith('region')) {
      // Map to official state name
      const mapped = ESTADOS_MX_MAP?.[textLower];
      result.state = mapped || text;
    }
  });

  return result;
};

const BusinessLocationMap = ({ formData, onChange }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [addressQuery, setAddressQuery] = useState(formData?.address || '');
  const [suggestions, setSuggestions] = useState([]);
  const [rawFeatures, setRawFeatures] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [manualEdit, setManualEdit] = useState(false);
  const [pinAdjusted, setPinAdjusted] = useState(!!(formData?.latitude && formData?.longitude));
  const searchTimeoutRef = useRef(null);

  const lat = formData?.latitude || DEFAULT_CENTER?.lat;
  const lng = formData?.longitude || DEFAULT_CENTER?.lng;

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainerRef?.current || mapRef?.current) return;
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your-mapbox-public-token-here') {
      setMapError(true);
      return;
    }

    let mapboxgl;
    import('mapbox-gl')?.then((module) => {
      mapboxgl = module.default;
      mapboxgl.accessToken = MAPBOX_TOKEN;

      let tokenErrorCaught = false;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lng, lat],
        zoom: formData?.latitude ? 16 : DEFAULT_ZOOM,
      });

      map?.on('error', (e) => {
        if (e?.error?.message?.toLowerCase()?.includes('access token') ||
            e?.error?.message?.toLowerCase()?.includes('invalid token') ||
            e?.error?.status === 401 || e?.error?.status === 403) {
          if (!tokenErrorCaught) {
            tokenErrorCaught = true;
            setMapError(true);
            map?.remove();
            mapRef.current = null;
          }
        }
      });

      map?.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

      map?.on('load', () => {
        setMapLoaded(true);

        const el = document.createElement('div');
        el.className = 'business-map-marker';
        el.style.cssText = `
          width: 36px; height: 36px; border-radius: 50%;
          background: #1A3FE0; border: 3px solid white;
          box-shadow: 0 2px 8px rgba(26,63,224,0.5);
          cursor: grab; display: flex; align-items: center; justify-content: center;
        `;
        el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;

        const marker = new mapboxgl.Marker({ element: el, draggable: true })?.setLngLat([lng, lat])?.addTo(map);

        marker?.on('dragend', () => {
          const lngLat = marker?.getLngLat();
          const newLat = parseFloat(lngLat?.lat?.toFixed(6));
          const newLng = parseFloat(lngLat?.lng?.toFixed(6));
          onChange('latitude', newLat);
          onChange('longitude', newLng);
          setPinAdjusted(true);
          // Reverse geocode to update address fields
          reverseGeocode(newLat, newLng);
        });

        markerRef.current = marker;
      });

      mapRef.current = map;
    })?.catch(() => setMapError(true));

    return () => {
      if (mapRef?.current) {
        mapRef?.current?.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update marker position when lat/lng changes externally
  useEffect(() => {
    if (!mapLoaded || !markerRef?.current || !formData?.latitude || !formData?.longitude) return;
    markerRef?.current?.setLngLat([formData?.longitude, formData?.latitude]);
  }, [formData?.latitude, formData?.longitude, mapLoaded]);

  // Fly to location
  const flyTo = useCallback((newLat, newLng, zoom = 16) => {
    if (!mapRef?.current || !mapLoaded) return;
    mapRef?.current?.flyTo({ center: [newLng, newLat], zoom, essential: true });
    if (markerRef?.current) {
      markerRef?.current?.setLngLat([newLng, newLat]);
    }
  }, [mapLoaded]);

  // Geocode using Mapbox directly to get raw features
  const geocodeWithMapbox = async (query) => {
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your-mapbox-public-token-here') return [];
    try {
      const encoded = encodeURIComponent(query?.trim());
      const url = `${GEOCODING_BASE}/${encoded}.json?access_token=${MAPBOX_TOKEN}&country=mx&language=es&limit=5&types=address,place,poi,neighborhood,locality`;
      const res = await fetch(url);
      if (!res?.ok) return [];
      const data = await res?.json();
      return data?.features || [];
    } catch {
      return [];
    }
  };

  // Handle address search with debounce
  const handleAddressChange = (e) => {
    const val = e?.target?.value;
    setAddressQuery(val);
    onChange('address', val);
    clearTimeout(searchTimeoutRef?.current);
    if (val?.length >= 4) {
      searchTimeoutRef.current = setTimeout(async () => {
        setIsGeocoding(true);
        const features = await geocodeWithMapbox(val);
        setRawFeatures(features);
        const mapped = features?.map((f) => ({
          label: f?.place_name,
          lat: f?.center?.[1],
          lng: f?.center?.[0],
          id: f?.id,
        }));
        setSuggestions(mapped);
        setShowSuggestions(mapped?.length > 0);
        setIsGeocoding(false);
      }, 600);
    } else {
      setSuggestions([]);
      setRawFeatures([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (s, index) => {
    setAddressQuery(s?.label);
    onChange('address', s?.label);
    onChange('latitude', parseFloat(s?.lat?.toFixed(6)));
    onChange('longitude', parseFloat(s?.lng?.toFixed(6)));

    // Auto-fill detailed address fields from Mapbox feature context
    const feature = rawFeatures?.[index];
    if (feature) {
      const parsed = parseMapboxFeature(feature);
      if (parsed?.street) onChange('street', parsed?.street);
      if (parsed?.colonia) onChange('colonia', parsed?.colonia);
      if (parsed?.city) onChange('city', parsed?.city);
      if (parsed?.state) onChange('state', parsed?.state);
      if (parsed?.postalCode) onChange('postalCode', parsed?.postalCode);
    }

    setSuggestions([]);
    setRawFeatures([]);
    setShowSuggestions(false);
    setPinAdjusted(false);
    flyTo(s?.lat, s?.lng, 16);
  };

  // Reverse geocode coordinates to fill address fields
  const reverseGeocode = async (lat, lng) => {
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your-mapbox-public-token-here') return;
    try {
      const url = `${GEOCODING_BASE}/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&country=mx&language=es&types=address,place,poi,neighborhood,locality`;
      const res = await fetch(url);
      if (!res?.ok) return;
      const data = await res?.json();
      const feature = data?.features?.[0];
      if (!feature) return;

      // Set address query to the full place name
      setAddressQuery(feature?.place_name || '');
      onChange('address', feature?.place_name || '');

      // Parse and fill detailed fields
      const parsed = parseMapboxFeature(feature);
      if (parsed?.street) onChange('street', parsed?.street);
      if (parsed?.colonia) onChange('colonia', parsed?.colonia);
      if (parsed?.city) onChange('city', parsed?.city);
      if (parsed?.state) onChange('state', parsed?.state);
      if (parsed?.postalCode) onChange('postalCode', parsed?.postalCode);
    } catch {
      // silently fail
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation?.getCurrentPosition(async (pos) => {
      const newLat = parseFloat(pos?.coords?.latitude?.toFixed(6));
      const newLng = parseFloat(pos?.coords?.longitude?.toFixed(6));
      onChange('latitude', newLat);
      onChange('longitude', newLng);
      setPinAdjusted(true);
      flyTo(newLat, newLng, 16);
      // Reverse geocode to fill address fields
      await reverseGeocode(newLat, newLng);
    });
  };

  const handleCenterMap = () => {
    if (formData?.latitude && formData?.longitude) {
      flyTo(formData?.latitude, formData?.longitude, 16);
    }
  };

  return (
    <div className="space-y-4">
      {/* Address search */}
      <div className="relative">
        <label className="block text-sm font-medium text-foreground mb-1">
          Buscar dirección <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          {isGeocoding && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
          <input
            type="text"
            value={addressQuery}
            onChange={handleAddressChange}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onFocus={() => suggestions?.length > 0 && setShowSuggestions(true)}
            placeholder="Escribe tu dirección para ver sugerencias..."
            className="w-full pl-9 pr-9 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        {showSuggestions && suggestions?.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-30 bg-card border border-border rounded-lg shadow-lg mt-1 overflow-hidden">
            {suggestions?.map((s, i) => (
              <button
                key={i}
                onMouseDown={() => selectSuggestion(s, i)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center gap-2"
              >
                <Icon name="MapPin" size={14} className="text-primary flex-shrink-0" />
                <span className="truncate">{s?.label}</span>
              </button>
            ))}
          </div>
        )}
        {suggestions?.length > 0 && !showSuggestions && (
          <p className="text-xs text-success mt-1 flex items-center gap-1">
            <Icon name="CheckCircle" size={12} className="text-green-600" />
            <span className="text-green-600">Dirección seleccionada — los campos de abajo se completaron automáticamente</span>
          </p>
        )}
      </div>

      {/* Map container */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h3 className="text-sm font-semibold text-foreground">Mapa interactivo</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCenterMap}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <Icon name="Crosshair" size={12} />
              Centrar
            </button>
            <button
              onClick={handleGetCurrentLocation}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
            >
              <Icon name="Navigation" size={12} />
              Mi ubicación
            </button>
          </div>
        </div>

        {mapError ? (
          <div className="border border-border rounded-xl overflow-hidden bg-muted flex items-center justify-center" style={{ height: '380px' }}>
            <div className="text-center p-6">
              <Icon name="MapPin" size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Configura VITE_MAPBOX_TOKEN para ver el mapa interactivo</p>
            </div>
          </div>
        ) : (
          <div
            ref={mapContainerRef}
            className="border border-border rounded-xl overflow-hidden"
            style={{ height: '380px' }}
          />
        )}

        {/* Pin status */}
        <div className={`flex items-center gap-2 mt-2 text-xs px-3 py-2 rounded-lg ${
          pinAdjusted
            ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}>
          <Icon name="MapPin" size={14} />
          {pinAdjusted
            ? '📍 Ubicación ajustada manualmente — Pin en posición exacta' :'📍 Arrastra el pin azul para ajustar la ubicación exacta del negocio'}
        </div>
      </div>

      {/* Lat/Lng fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            Latitud <span className="text-muted-foreground">(6 decimales)</span>
          </label>
          <input
            type="number"
            step="0.000001"
            value={formData?.latitude || ''}
            readOnly={!manualEdit}
            onChange={(e) => {
              if (manualEdit) {
                onChange('latitude', parseFloat(parseFloat(e?.target?.value)?.toFixed(6)));
                setPinAdjusted(true);
              }
            }}
            className={`w-full px-3 py-2 border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono ${
              manualEdit ? 'bg-background' : 'bg-muted/50 cursor-default'
            }`}
            placeholder="19.432608"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            Longitud <span className="text-muted-foreground">(6 decimales)</span>
          </label>
          <input
            type="number"
            step="0.000001"
            value={formData?.longitude || ''}
            readOnly={!manualEdit}
            onChange={(e) => {
              if (manualEdit) {
                onChange('longitude', parseFloat(parseFloat(e?.target?.value)?.toFixed(6)));
                setPinAdjusted(true);
              }
            }}
            className={`w-full px-3 py-2 border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono ${
              manualEdit ? 'bg-background' : 'bg-muted/50 cursor-default'
            }`}
            placeholder="-99.133209"
          />
        </div>
      </div>
      <button
        onClick={() => setManualEdit((v) => !v)}
        className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
      >
        <Icon name={manualEdit ? 'Lock' : 'Edit3'} size={12} />
        {manualEdit ? 'Bloquear edición manual' : 'Ajustar manualmente lat/lng'}
      </button>
    </div>
  );
};

export default BusinessLocationMap;
