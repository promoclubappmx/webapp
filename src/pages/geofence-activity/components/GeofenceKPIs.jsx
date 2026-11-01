import React from 'react';
import Icon from '../../../components/AppIcon';

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Hoy' },
  { value: '7days', label: 'Últimos 7 días' },
  { value: 'month', label: 'Este mes' },
  { value: 'custom', label: 'Personalizado' },
];

const kpiData = {
  today: {
    detections: { value: 87, change: '+12%', up: true },
    notifications: { value: 64, rate: '94%', label: 'entregadas' },
    openRate: { value: '48%', benchmark: '41%', above: true },
    conversions: { value: 23, desc: 'en 2h' },
    bounceRate: { value: '18%', change: '-3%', improving: true },
  },
  '7days': {
    detections: { value: 543, change: '+8%', up: true },
    notifications: { value: 412, rate: '93%', label: 'entregadas' },
    openRate: { value: '51%', benchmark: '41%', above: true },
    conversions: { value: 142, desc: 'en 2h' },
    bounceRate: { value: '21%', change: '+2%', improving: false },
  },
  month: {
    detections: { value: 2140, change: '-3%', up: false },
    notifications: { value: 1687, rate: '95%', label: 'entregadas' },
    openRate: { value: '46%', benchmark: '41%', above: true },
    conversions: { value: 587, desc: 'en 2h' },
    bounceRate: { value: '16%', change: '-5%', improving: true },
  },
  custom: {
    detections: { value: 1240, change: '+5%', up: true },
    notifications: { value: 987, rate: '94%', label: 'entregadas' },
    openRate: { value: '49%', benchmark: '41%', above: true },
    conversions: { value: 312, desc: 'en 2h' },
    bounceRate: { value: '19%', change: '-1%', improving: true },
  },
};

const GeofenceKPIs = ({ period, onPeriodChange }) => {
  const data = kpiData?.[period] || kpiData?.today;

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-foreground">Resumen de actividad</h2>
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {PERIOD_OPTIONS?.map(opt => (
            <button
              key={opt?.value}
              onClick={() => onPeriodChange(opt?.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                period === opt?.value
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt?.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Detections */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <Icon name="MapPin" size={18} className="text-blue-600" />
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${data?.detections?.up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {data?.detections?.change} {data?.detections?.up ? '↑' : '↓'}
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{data?.detections?.value?.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">Detecciones</p>
          <p className="text-xs text-muted-foreground">vs. período anterior</p>
        </div>

        {/* Notifications */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
              <Icon name="Bell" size={18} className="text-orange-600" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
              {data?.notifications?.rate}
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{data?.notifications?.value?.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">Notificaciones enviadas</p>
          <p className="text-xs text-muted-foreground">{data?.notifications?.rate} {data?.notifications?.label}</p>
        </div>

        {/* Open Rate */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
              <Icon name="Eye" size={18} className="text-purple-600" />
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${data?.openRate?.above ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {data?.openRate?.above ? '↑ benchmark' : '↓ benchmark'}
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{data?.openRate?.value}</p>
          <p className="text-xs text-muted-foreground mt-1">Tasa de apertura</p>
          <p className="text-xs text-muted-foreground">Benchmark: {data?.openRate?.benchmark}</p>
        </div>

        {/* Conversions */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <Icon name="TrendingUp" size={18} className="text-green-600" />
            </div>
            <Icon name="Info" size={14} className="text-muted-foreground" title="Notificación → check-in o canje en 2 horas" />
          </div>
          <p className="text-2xl font-bold text-foreground" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{data?.conversions?.value?.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">Conversiones</p>
          <p className="text-xs text-muted-foreground">notif → visita/canje {data?.conversions?.desc}</p>
        </div>

        {/* Bounce Rate — Tasa de Rebote */}
        <div className="bg-card border border-border rounded-2xl p-5 relative">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Icon name="LogOut" size={18} className="text-yellow-600" />
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                data?.bounceRate?.improving ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {data?.bounceRate?.change} {data?.bounceRate?.improving ? '↓' : '↑'}
            </span>
          </div>
          <p
            className="text-2xl font-bold text-foreground"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {data?.bounceRate?.value}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Tasa de Rebote</p>
          <p className="text-xs text-muted-foreground">salida &lt;2 min sin check-in</p>
          {/* Tooltip hint */}
          <div className="absolute top-3 right-3 group">
            <Icon name="HelpCircle" size={13} className="text-muted-foreground cursor-help" />
            <div className="absolute right-0 top-5 w-52 bg-foreground text-background text-xs p-2.5 rounded-xl shadow-xl z-20 hidden group-hover:block">
              % de usuarios que entraron al geofence pero salieron en menos de 2 minutos sin realizar un check-in o conversión. Menor es mejor.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeofenceKPIs;
