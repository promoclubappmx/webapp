import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Icon from '../../../components/AppIcon';

const MAPBOX_TOKEN = import.meta.env?.VITE_MAPBOX_TOKEN;

const cohortData = [
  { cohort: 'Ene 2025', m0: 100, m1: 42, m2: 31, m3: 28, m4: 24 },
  { cohort: 'Feb 2025', m0: 100, m1: 38, m2: 29, m3: 25, m4: null },
  { cohort: 'Mar 2025', m0: 100, m1: 45, m2: 33, m3: null, m4: null },
  { cohort: 'Abr 2025', m0: 100, m1: 41, m2: null, m3: null, m4: null },
];

const avgCohort = { cohort: 'Promedio', m0: 100, m1: 41.5, m2: 31, m3: 26.5, m4: 24 };

const getCohortColor = (val) => {
  if (val === null) return 'bg-muted text-muted-foreground';
  if (val > 50) return 'bg-green-700 text-white';
  if (val >= 20) return 'bg-green-200 text-green-900';
  return 'bg-gray-100 text-gray-500';
};

// CDMX-area mock heatmap points for demo
const CDMX_HEATMAP_POINTS = [
  { lat: 19.4126, lng: -99.1732 },
  { lat: 19.4200, lng: -99.1650 },
  { lat: 19.4050, lng: -99.1800 },
  { lat: 19.4300, lng: -99.1600 },
  { lat: 19.4000, lng: -99.1900 },
  { lat: 19.4150, lng: -99.1550 },
  { lat: 19.4250, lng: -99.1750 },
  { lat: 19.4080, lng: -99.1680 },
  { lat: 19.4180, lng: -99.1820 },
  { lat: 19.4320, lng: -99.1700 },
  { lat: 19.3950, lng: -99.1850 },
  { lat: 19.4100, lng: -99.1620 },
];

const MARKET_HEATMAP_POINTS = [
  { lat: 19.4350, lng: -99.1400 },
  { lat: 19.4450, lng: -99.1500 },
  { lat: 19.3900, lng: -99.2000 },
  { lat: 19.4500, lng: -99.1600 },
  { lat: 19.3850, lng: -99.1750 },
  { lat: 19.4400, lng: -99.1350 },
];

const CustomerOriginHeatmap = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapMode, setMapMode] = useState('solo');
  const [mapLoaded, setMapLoaded] = useState(false);
  const hasToken = MAPBOX_TOKEN && MAPBOX_TOKEN !== 'your-mapbox-public-token-here';

  const CENTER_LAT = 19.4126;
  const CENTER_LNG = -99.1732;

  useEffect(() => {
    if (!mapContainerRef?.current || mapRef?.current || !hasToken) return;

    import('mapbox-gl')?.then((module) => {
      const mapboxgl = module.default;
      mapboxgl.accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [CENTER_LNG, CENTER_LAT],
        zoom: 13,
      });

      map?.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

      map?.on('load', () => {
        setMapLoaded(true);

        // Build GeoJSON for heatmap
        const buildGeoJSON = (points) => ({
          type: 'FeatureCollection',
          features: points?.map((p) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [p?.lng, p?.lat] },
            properties: { weight: 1 },
          })),
        });

        // My business heatmap layer
        map?.addSource('heatmap-my', { type: 'geojson', data: buildGeoJSON(CDMX_HEATMAP_POINTS) });
        map?.addLayer({
          id: 'heatmap-my-layer',
          type: 'heatmap',
          source: 'heatmap-my',
          paint: {
            'heatmap-weight': 1,
            'heatmap-intensity': 1.5,
            'heatmap-radius': 30,
            'heatmap-color': [
              'interpolate', ['linear'], ['heatmap-density'],
              0, 'rgba(26,63,224,0)',
              0.5, 'rgba(26,63,224,0.5)',
              1, '#1A3FE0',
            ],
            'heatmap-opacity': 0.85,
          },
        });

        // Market comparison heatmap layer (hidden by default)
        map?.addSource('heatmap-market', { type: 'geojson', data: buildGeoJSON(MARKET_HEATMAP_POINTS) });
        map?.addLayer({
          id: 'heatmap-market-layer',
          type: 'heatmap',
          source: 'heatmap-market',
          paint: {
            'heatmap-weight': 1,
            'heatmap-intensity': 1.2,
            'heatmap-radius': 35,
            'heatmap-color': [
              'interpolate', ['linear'], ['heatmap-density'],
              0, 'rgba(245,158,11,0)',
              0.5, 'rgba(245,158,11,0.5)',
              1, '#F59E0B',
            ],
            'heatmap-opacity': 0.7,
          },
          layout: { visibility: 'none' },
        });

        // Reference circles using turf
        import('@turf/turf')?.then((turf) => {
          const center = turf?.point([CENTER_LNG, CENTER_LAT]);
          const radii = [500, 1000, 2000, 5000];
          radii?.forEach((r, i) => {
            const circle = turf?.circle(center, r / 1000, { steps: 64, units: 'kilometers' });
            map?.addSource(`ref-circle-${i}`, { type: 'geojson', data: circle });
            map?.addLayer({
              id: `ref-circle-line-${i}`,
              type: 'line',
              source: `ref-circle-${i}`,
              paint: { 'line-color': '#1A3FE0', 'line-width': 1, 'line-dasharray': [4, 2], 'line-opacity': 0.5 },
            });
          });
        });

        // Business pin
        const el = document.createElement('div');
        el.style.cssText = `
          width: 32px; height: 32px; border-radius: 50%;
          background: #1A3FE0; border: 3px solid white;
          box-shadow: 0 2px 8px rgba(26,63,224,0.6);
          display: flex; align-items: center; justify-content: center;
        `;
        el.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
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

  // Toggle market layer visibility
  useEffect(() => {
    if (!mapRef?.current || !mapLoaded) return;
    try {
      mapRef?.current?.setLayoutProperty(
        'heatmap-market-layer',
        'visibility',
        mapMode === 'mercado' ? 'visible' : 'none'
      );
    } catch (e) {}
  }, [mapMode, mapLoaded]);

  const handleExportImage = () => {
    if (mapRef?.current) {
      const dataUrl = mapRef?.current?.getCanvas()?.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'heatmap-clientes.png';
      a?.click();
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-base font-semibold text-foreground mb-4">Heatmap de origen de clientes</h3>
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setMapMode('solo')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mapMode === 'solo' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
        >
          Solo mi negocio
        </button>
        <span className="text-muted-foreground">←→</span>
        <button
          onClick={() => setMapMode('mercado')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mapMode === 'mercado' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
        >
          vs Mercado
        </button>
      </div>
      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Map */}
        <div className="flex-1 relative rounded-xl overflow-hidden border border-border" style={{ height: '450px' }}>
          {hasToken ? (
            <>
              <div ref={mapContainerRef} className="w-full h-full" />
              {mapMode === 'mercado' && (
                <div className="absolute top-3 right-3 bg-black/70 rounded-lg p-2 text-xs space-y-1 z-10">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500 opacity-80" /><span className="text-white">Tus clientes</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" /><span className="text-white">Promedio categoría</span></div>
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-black/60 rounded-lg px-2 py-1 text-xs text-white z-10 flex gap-2">
                <span>500m</span><span>1km</span><span>2km</span><span>5km</span>
              </div>
            </>
          ) : (
            /* Fallback SVG map */
            (<div className="w-full h-full flex items-center justify-center bg-muted">
              <div className="text-center">
                <Icon name="Map" size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Configura VITE_MAPBOX_TOKEN para ver el heatmap</p>
              </div>
            </div>)
          )}
        </div>

        {/* Panel lateral */}
        <div className="w-full lg:w-56 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Distribución por radio</h4>
            <div className="space-y-2">
              {[
                { label: '< 500m', pct: 34 },
                { label: '500m – 1km', pct: 33 },
                { label: '1km – 3km', pct: 22 },
                { label: '> 3km', pct: 11 },
              ]?.map((r, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{r?.label}</span>
                    <span className="font-semibold text-foreground">{r?.pct}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${r?.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <button
              onClick={handleExportImage}
              className="w-full flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
            >
              <Icon name="Image" size={14} />
              Exportar imagen
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors">
              <Icon name="Download" size={14} />
              Exportar CSV
            </button>
          </div>
        </div>
      </div>
      <div className="mt-4 p-3 rounded-lg flex items-start gap-2" style={{ background: '#EEF2FF' }}>
        <Icon name="Lightbulb" size={16} className="text-primary mt-0.5 flex-shrink-0" />
        <p className="text-sm text-primary">El 67% de tus clientes vienen de menos de 1km. Tu categoría atrae clientes hasta 3km. Hay oportunidad de alcance.</p>
      </div>
    </div>
  );
};

const TabClientes = () => {
  const [granularity, setGranularity] = useState('mes');
  const [ltvMetric, setLtvMetric] = useState('LTV');

  const ltvMetricOptions = ['LTV', 'Visitas', 'Ticket promedio', 'Duración'];

  const getBarData = () => {
    if (ltvMetric === 'LTV') return [{ name: 'LTV', promoclub: 2840, noPromoclub: 680 }];
    if (ltvMetric === 'Visitas') return [{ name: 'Visitas', promoclub: 14.2, noPromoclub: 3.4 }];
    if (ltvMetric === 'Ticket promedio') return [{ name: 'Ticket', promoclub: 200, noPromoclub: 200 }];
    return [{ name: 'Duración (m)', promoclub: 8.3, noPromoclub: 2.1 }];
  };

  return (
    <div className="space-y-6">
      {/* Cohortes */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
          <h3 className="text-base font-semibold text-foreground">Análisis de cohortes</h3>
          <div className="flex gap-2">
            {['mes', 'semana']?.map(g => (
              <button
                key={g}
                onClick={() => setGranularity(g)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  granularity === g ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Por {g}
              </button>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Muestra qué % de clientes que llegaron en un mes siguen visitándote meses después. Mide la verdadera lealtad.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-max">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Cohorte</th>
                {['M+0', 'M+1', 'M+2', 'M+3', 'M+4']?.map(m => (
                  <th key={m} className="text-center py-2 px-3 text-muted-foreground font-medium">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohortData?.map((row, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium text-foreground whitespace-nowrap">{row?.cohort}</td>
                  {[row?.m0, row?.m1, row?.m2, row?.m3, row?.m4]?.map((val, j) => (
                    <td key={j} className="py-2 px-3 text-center">
                      {val !== null ? (
                        <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold ${getCohortColor(val)}`}>
                          {val}%
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-muted/30">
                <td className="py-2 pr-4 font-bold text-foreground">Promedio</td>
                {[avgCohort?.m0, avgCohort?.m1, avgCohort?.m2, avgCohort?.m3, avgCohort?.m4]?.map((val, j) => (
                  <td key={j} className="py-2 px-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold ${getCohortColor(val)}`}>
                      {val !== null ? `${val}%` : '—'}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-3 rounded-lg flex items-start gap-2" style={{ background: '#EEF2FF' }}>
          <Icon name="Lightbulb" size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-primary">Tu cohorte de febrero tiene 7% menos retención a M+1 que la de enero. Coincide con que pausaste el programa de puntos ese mes.</p>
        </div>
      </div>

      {/* LTV */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-base font-semibold text-foreground mb-1">LTV clientes PromoClub vs no-PromoClub</h3>
        <p className="text-sm text-muted-foreground mb-4">LTV (Lifetime Value) = valor total que un cliente genera durante toda su relación con tu negocio.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div className="border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="font-semibold text-foreground">Clientes PromoClub</span>
            </div>
            <p className="text-4xl font-bold text-primary mb-3" style={{ fontFamily: 'JetBrains Mono, monospace' }}>$2,840</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Visitas promedio</span><span className="font-medium">14.2 visitas</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Ticket promedio</span><span className="font-medium">$200 MXN</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tiempo de vida</span><span className="font-medium">8.3 meses</span></div>
            </div>
          </div>
          <div className="border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-muted-foreground" />
              <span className="font-semibold text-foreground">Sin PromoClub</span>
            </div>
            <p className="text-4xl font-bold text-muted-foreground mb-3" style={{ fontFamily: 'JetBrains Mono, monospace' }}>$680</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Visitas promedio</span><span className="font-medium">3.4 visitas</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Ticket promedio</span><span className="font-medium">$200 MXN</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tiempo de vida</span><span className="font-medium">2.1 meses</span></div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center mb-4">
          <p className="text-sm font-bold text-green-700">Los clientes PromoClub generan 4.2x más valor que los clientes regulares</p>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Los clientes "sin PromoClub" son aquellos que visitaron pero no interactuaron con ninguna herramienta de la plataforma.</p>
        <div className="flex gap-2 mb-3 flex-wrap">
          {ltvMetricOptions?.map(m => (
            <button
              key={m}
              onClick={() => setLtvMetric(m)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                ltvMetric === m ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={getBarData()} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="promoclub" name="PromoClub" fill="#1A3FE0" radius={[4, 4, 0, 0]} />
            <Bar dataKey="noPromoclub" name="Sin PromoClub" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Heatmap origen - Mapbox */}
      <CustomerOriginHeatmap />
    </div>
  );
};

export default TabClientes;
