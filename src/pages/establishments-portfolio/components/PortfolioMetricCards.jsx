import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const MOCK_ANALYTICS = {
  views: 1247,
  mapImpressions: 3892,
  contactClicks: 89,
  directionsClicks: 156,
  conversionRate: 12.5,
  period: '30 días',
  vsLastPeriod: { views: +18, mapImpressions: +7, contactClicks: +23, directionsClicks: +11 },
  categoryAvgViews: 856,
  categoryAvgMapImpressions: 2100,
  trafficSources: [
    { source: 'Búsqueda en app', visits: 512, pct: 41, icon: 'Search', color: 'bg-blue-500' },
    { source: 'Mapa', visits: 387, pct: 31, icon: 'Map', color: 'bg-green-500' },
    { source: 'Categoría', visits: 198, pct: 16, icon: 'Tag', color: 'bg-purple-500' },
    { source: 'Link directo', visits: 87, pct: 7, icon: 'Link', color: 'bg-amber-500' },
    { source: 'QR', visits: 38, pct: 3, icon: 'QrCode', color: 'bg-red-500' },
    { source: 'Redes sociales', visits: 25, pct: 2, icon: 'Share2', color: 'bg-pink-500' },
  ],
  suggestions: [
    { id: 1, priority: 'high', icon: 'ImagePlus', text: 'Sube 6 fotos más para alcanzar el mínimo recomendado de 10 fotos', action: 'Ir a Medios', impact: '+35% vistas' },
    { id: 2, priority: 'high', icon: 'HelpCircle', text: 'Agrega al menos 3 preguntas frecuentes (FAQ)', action: 'Ir a FAQ', impact: '+18% conversión' },
    { id: 3, priority: 'medium', icon: 'Clock', text: 'Actualiza tus horarios especiales para los próximos festivos', action: 'Ir a Horarios', impact: 'Evita visitas fallidas' },
    { id: 4, priority: 'medium', icon: 'CreditCard', text: 'Agrega métodos de pago para aparecer en filtros de la app', action: 'Ir a Pagos', impact: '+12% clics' },
    { id: 5, priority: 'low', icon: 'Globe', text: 'Configura tu tour virtual 360° para destacar en búsquedas', action: 'Ir a Medios avanzados', impact: '+8% tiempo en ficha' },
  ],
};

const PortfolioMetricCards = ({ metrics, establishments, categoryFilter }) => {
  const [period, setPeriod] = useState('30d');
  const data = MOCK_ANALYTICS;

  // Compute KPIs from filtered establishments
  const totalVisits = establishments?.reduce((sum, e) => sum + (e?.kpis?.visitsMonth || 0), 0);
  const totalRevenue = establishments?.reduce((sum, e) => sum + (e?.revenueMonth || 0), 0);
  const totalCustomers = establishments?.reduce((sum, e) => sum + (e?.metrics?.activeCustomers30d || 0), 0);
  const avgRating = establishments?.filter(e => e?.metrics?.rating > 0)?.length > 0
    ? (establishments?.filter(e => e?.metrics?.rating > 0)?.reduce((sum, e) => sum + e?.metrics?.rating, 0) / establishments?.filter(e => e?.metrics?.rating > 0)?.length)?.toFixed(1)
    : '—';

  const viewsVsCategory = data?.views > data?.categoryAvgViews
    ? `+${Math.round(((data?.views - data?.categoryAvgViews) / data?.categoryAvgViews) * 100)}% más vistas que el promedio de tu categoría en tu zona`
    : `${Math.round(((data?.categoryAvgViews - data?.views) / data?.categoryAvgViews) * 100)}% menos vistas que el promedio`;

  const isAboveAvg = data?.views > data?.categoryAvgViews;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h3 className="text-base font-semibold text-foreground">
              Dashboard de performance
              {categoryFilter && categoryFilter !== 'Todos' && (
                <span className="ml-2 text-sm font-normal text-primary">— {categoryFilter}</span>
              )}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            {establishments?.length} establecimiento{establishments?.length !== 1 ? 's' : ''} · Datos anónimos y agregados. Actualización diaria.
          </p>
        </div>
        <div className="flex gap-2">
          {[{ value: '7d', label: '7 días' }, { value: '30d', label: '30 días' }, { value: '90d', label: '90 días' }]?.map(p => (
            <button key={p?.value} onClick={() => setPeriod(p?.value)}
              className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors ${
                period === p?.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
              }`}>
              {p?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Aggregated KPI Cards from filtered establishments */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Visitas del mes', value: totalVisits?.toLocaleString(), icon: 'Users', color: 'text-blue-600', bg: 'bg-blue-50', change: +8 },
          { label: 'Revenue del mes', value: `$${(totalRevenue / 1000)?.toFixed(0)}k`, icon: 'DollarSign', color: 'text-green-600', bg: 'bg-green-50', change: +12 },
          { label: 'Clientes activos', value: totalCustomers?.toLocaleString(), icon: 'UserCheck', color: 'text-purple-600', bg: 'bg-purple-50', change: +5 },
          { label: 'Rating promedio', value: avgRating, icon: 'Star', color: 'text-amber-600', bg: 'bg-amber-50', change: 0 },
        ]?.map(kpi => (
          <div key={kpi?.label} className="bg-card border border-border rounded-xl p-4">
            <div className={`w-8 h-8 ${kpi?.bg} rounded-lg flex items-center justify-center mb-2`}>
              <Icon name={kpi?.icon} size={16} className={kpi?.color} />
            </div>
            <p className="text-xl font-bold text-foreground">{kpi?.value}</p>
            <p className="text-xs text-muted-foreground">{kpi?.label}</p>
            {kpi?.change !== 0 && (
              <p className={`text-xs font-medium mt-1 ${kpi?.change > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {kpi?.change > 0 ? '↑' : '↓'} {Math.abs(kpi?.change)}% vs período anterior
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Vistas de ficha KPI Cards (from analytics) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Vistas de ficha', value: data?.views?.toLocaleString(), change: data?.vsLastPeriod?.views, icon: 'Eye', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Impresiones en mapa', value: data?.mapImpressions?.toLocaleString(), change: data?.vsLastPeriod?.mapImpressions, icon: 'Map', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Clics en contacto', value: data?.contactClicks?.toLocaleString(), change: data?.vsLastPeriod?.contactClicks, icon: 'Phone', color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Clics "Cómo llegar"', value: data?.directionsClicks?.toLocaleString(), change: data?.vsLastPeriod?.directionsClicks, icon: 'Navigation', color: 'text-amber-600', bg: 'bg-amber-50' },
        ]?.map(kpi => (
          <div key={kpi?.label} className="bg-card border border-border rounded-xl p-4">
            <div className={`w-8 h-8 ${kpi?.bg} rounded-lg flex items-center justify-center mb-2`}>
              <Icon name={kpi?.icon} size={16} className={kpi?.color} />
            </div>
            <p className="text-xl font-bold text-foreground">{kpi?.value}</p>
            <p className="text-xs text-muted-foreground">{kpi?.label}</p>
            <p className={`text-xs font-medium mt-1 ${ kpi?.change > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {kpi?.change > 0 ? '↑' : '↓'} {Math.abs(kpi?.change)}% vs período anterior
            </p>
          </div>
        ))}
      </div>

      {/* Conversión */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground">Conversión ficha → visita estimada</p>
          <span className="text-2xl font-bold text-primary">{data?.conversionRate}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-primary h-2 rounded-full" style={{ width: `${data?.conversionRate}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">Basado en clics de "Cómo llegar" y check-ins registrados</p>
      </div>

      {/* Comparativa vs categoría */}
      <div className={`border rounded-xl p-4 ${ isAboveAvg ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${ isAboveAvg ? 'bg-green-100' : 'bg-amber-100'}`}>
            <Icon name={isAboveAvg ? 'TrendingUp' : 'TrendingDown'} size={20} className={isAboveAvg ? 'text-green-600' : 'text-amber-600'} />
          </div>
          <div>
            <p className={`text-sm font-semibold ${ isAboveAvg ? 'text-green-700' : 'text-amber-700'}`}>Comparativa vs tu categoría en tu zona</p>
            <p className={`text-xs mt-1 ${ isAboveAvg ? 'text-green-600' : 'text-amber-600'}`}>
              Tu ficha tiene <strong>{viewsVsCategory}</strong> (comparación anónima)
            </p>
          </div>
        </div>
      </div>

      {/* Fuentes de tráfico + Sugerencias en grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuentes de tráfico */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h3 className="text-sm font-semibold text-foreground">Fuentes de tráfico</h3>
          </div>
          <div className="space-y-3">
            {data?.trafficSources?.map(source => (
              <div key={source?.source} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name={source?.icon} size={14} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground">{source?.source}</span>
                    <span className="text-xs text-muted-foreground">{source?.visits} visitas ({source?.pct}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className={`${source?.color} h-1.5 rounded-full`} style={{ width: `${source?.pct}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sugerencias de optimización */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-amber-500 rounded-full" />
            <h3 className="text-sm font-semibold text-foreground">Sugerencias de optimización</h3>
            <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">{data?.suggestions?.length} pendientes</span>
          </div>
          <div className="space-y-3">
            {data?.suggestions?.map(suggestion => (
              <div key={suggestion?.id} className={`flex items-start gap-3 p-3 border rounded-xl ${
                suggestion?.priority === 'high' ? 'border-red-200 bg-red-50' :
                suggestion?.priority === 'medium' ? 'border-amber-200 bg-amber-50' : 'border-border bg-background'
              }`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  suggestion?.priority === 'high' ? 'bg-red-100' :
                  suggestion?.priority === 'medium' ? 'bg-amber-100' : 'bg-muted'
                }`}>
                  <Icon name={suggestion?.icon} size={14} className={`${
                    suggestion?.priority === 'high' ? 'text-red-600' :
                    suggestion?.priority === 'medium' ? 'text-amber-600' : 'text-muted-foreground'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground leading-snug">{suggestion?.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Impacto: <strong>{suggestion?.impact}</strong></p>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                  suggestion?.priority === 'high' ? 'bg-red-100 text-red-700' :
                  suggestion?.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'
                }`}>
                  {suggestion?.priority === 'high' ? 'Alta' : suggestion?.priority === 'medium' ? 'Media' : 'Baja'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioMetricCards;
