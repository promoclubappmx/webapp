import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine,
  BarChart, Bar
} from 'recharts';

const RATING_COLORS = { 5: '#166534', 4: '#16a34a', 3: '#ca8a04', 2: '#ea580c', 1: '#dc2626' };

const DONUT_DATA = [
  { name: '5★', value: 98, color: '#166534' },
  { name: '4★', value: 72, color: '#16a34a' },
  { name: '3★', value: 34, color: '#ca8a04' },
  { name: '2★', value: 18, color: '#ea580c' },
  { name: '1★', value: 12, color: '#dc2626' },
];

const TREND_DATA = Array.from({ length: 90 }, (_, i) => ({
  day: i + 1,
  score: +(4.2 + Math.sin(i / 10) * 0.3 + Math.random() * 0.2)?.toFixed(2),
  event: i === 30 ? 'Campaña verano' : i === 60 ? 'Promo café' : null,
}));

const TRIGGER_BAR_DATA = [
  { name: 'Check-in', checkin: 98, coupon: 0, order: 0, reservation: 0, geofence: 0 },
  { name: 'Cupón', checkin: 0, coupon: 62, order: 0, reservation: 0, geofence: 0 },
  { name: 'Order', checkin: 0, coupon: 0, order: 34, reservation: 0, geofence: 0 },
  { name: 'Reserv.', checkin: 0, coupon: 0, order: 0, reservation: 28, geofence: 0 },
  { name: 'Geofence', checkin: 0, coupon: 0, order: 0, reservation: 0, geofence: 12 },
];

const SENTIMENT_TOPICS = [
  { topic: 'Servicio al cliente', positive: 89, mentions: 45 },
  { topic: 'Calidad del café', positive: 92, mentions: 78 },
  { topic: 'Tiempo de espera', positive: 34, mentions: 23 },
  { topic: 'Ambiente y decoración', positive: 87, mentions: 56 },
  { topic: 'Precio / valor', positive: 61, mentions: 31 },
];

const WORD_CLOUD_WORDS = [
  { word: 'excelente', sentiment: 'positive', size: 'text-2xl' },
  { word: 'café', sentiment: 'neutral', size: 'text-xl' },
  { word: 'servicio', sentiment: 'positive', size: 'text-lg' },
  { word: 'espera', sentiment: 'negative', size: 'text-base' },
  { word: 'ambiente', sentiment: 'positive', size: 'text-xl' },
  { word: 'precio', sentiment: 'neutral', size: 'text-base' },
  { word: 'barista', sentiment: 'positive', size: 'text-lg' },
  { word: 'lento', sentiment: 'negative', size: 'text-sm' },
  { word: 'limpio', sentiment: 'positive', size: 'text-base' },
  { word: 'recomiendo', sentiment: 'positive', size: 'text-xl' },
  { word: 'frío', sentiment: 'negative', size: 'text-sm' },
  { word: 'delicioso', sentiment: 'positive', size: 'text-lg' },
  { word: 'wifi', sentiment: 'neutral', size: 'text-sm' },
  { word: 'pasteles', sentiment: 'positive', size: 'text-base' },
  { word: 'ruido', sentiment: 'negative', size: 'text-sm' },
];

const SENTIMENT_COLORS = { positive: 'text-blue-600', negative: 'text-red-500', neutral: 'text-slate-400' };

const BRANCH_DATA = [
  { branch: 'Sucursal Centro', score: 4.7, total: 156, responseRate: 87, unreplied: 3, best: true, attention: false },
  { branch: 'Sucursal Norte', score: 4.1, total: 78, responseRate: 62, unreplied: 12, best: false, attention: true },
];

const ALERTS = [
  { level: 'red', icon: '🔴', message: 'Tienes 8 reseñas sin responder de hace más de 7 días', cta: 'Responder ahora', ctaIcon: 'MessageSquare' },
  { level: 'yellow', icon: '🟡', message: 'Tu score bajó 0.3 puntos este mes', cta: 'Ver reseñas negativas', ctaIcon: 'AlertTriangle' },
  { level: 'green', icon: '🟢', message: '¡Tu tasa de respuesta es 95%! Por encima del 62% de tu categoría', cta: null },
  { level: 'red', icon: '🔴', message: '3 reseñas de 1★ en los últimos 3 días. Patrón inusual detectado', cta: 'Revisar', ctaIcon: 'Eye' },
];

const TREND_PERIODS = ['90 días', '6 meses', '1 año'];

const ReviewsDashboardTab = () => {
  const [trendPeriod, setTrendPeriod] = useState('90 días');
  const [executiveSummary] = useState(
    'Este mes, el negocio mantiene una sólida reputación con un score promedio de 4.7 estrellas, impulsado principalmente por elogios al servicio al cliente y la calidad del café. Se detectó un leve descenso en la satisfacción relacionado con los tiempos de espera en horas pico. Las reseñas provenientes de check-in representan el mayor volumen, con una tasa de conversión del 34% en solicitudes automatizadas.'
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(executiveSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const trendData = trendPeriod === '90 días' ? TREND_DATA : trendPeriod === '6 meses' ? TREND_DATA?.slice(0, 60) : TREND_DATA;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs text-muted-foreground mb-2">Score promedio</p>
          <p className="font-bold text-foreground leading-none mb-2" style={{ fontSize: '48px', fontFamily: 'Outfit, sans-serif' }}>4.7</p>
          <div className="flex items-center gap-1">
            <Icon name="TrendingUp" size={14} className="text-emerald-500" />
            <span className="text-sm font-medium text-emerald-600">+0.2 vs mes anterior</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs text-muted-foreground mb-2">Total de reseñas</p>
          <p className="text-4xl font-bold text-foreground mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>234</p>
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">✓ 170 positivas</span>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">34 neutras</span>
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">30 negativas</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs text-muted-foreground mb-2">Tasa de respuesta</p>
          <p className="text-4xl font-bold text-foreground mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>87%</p>
          <div className="flex items-center gap-1.5">
            <Icon name="Info" size={13} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Media de tu categoría: 62%</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs text-muted-foreground mb-2">Solicitud → Reseña</p>
          <p className="text-4xl font-bold text-foreground mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>34%</p>
          <div className="flex items-center gap-1">
            <Icon name="TrendingUp" size={14} className="text-emerald-500" />
            <span className="text-sm font-medium text-emerald-600">+5% vs mes anterior</span>
          </div>
        </div>
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut chart */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Distribución de ratings</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={DONUT_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {DONUT_DATA?.map((entry, i) => <Cell key={i} fill={entry?.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v} reseñas`, n]} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }} />
              <Legend formatter={(v, entry) => `${v} — ${entry?.payload?.value} (${Math.round(entry?.payload?.value / 234 * 100)}%)`} iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Trigger bar chart */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Reseñas por origen</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { name: 'Check-in', value: 98 },
              { name: 'Cupón', value: 62 },
              { name: 'Order Ahead', value: 34 },
              { name: 'Reservación', value: 28 },
              { name: 'Geofence', value: 12 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }} />
              <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} name="Reseñas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Trend chart */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Tendencia del score</h3>
          <div className="flex items-center gap-1 bg-muted/40 rounded-xl p-1">
            {TREND_PERIODS?.map(p => (
              <button key={p} onClick={() => setTrendPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${trendPeriod === p ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis domain={[3.5, 5]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }} />
            {trendData?.filter(d => d?.event)?.map((d, i) => (
              <ReferenceLine key={i} x={d?.day} stroke="#6366f1" strokeDasharray="4 4" label={{ value: d?.event, position: 'top', fontSize: 10, fill: '#6366f1' }} />
            ))}
            <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2.5} dot={false} name="Score" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Sentiment analysis */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Análisis de sentimiento</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Word cloud */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3">Términos más mencionados</p>
            <div className="flex flex-wrap gap-2 p-4 bg-muted/20 rounded-xl min-h-[120px] items-center">
              {WORD_CLOUD_WORDS?.map((w, i) => (
                <span key={i} className={`font-semibold cursor-default select-none ${w?.size} ${SENTIMENT_COLORS?.[w?.sentiment]}`}>
                  {w?.word}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1 text-xs text-blue-600"><span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />Positivo</span>
              <span className="flex items-center gap-1 text-xs text-red-500"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Negativo</span>
              <span className="flex items-center gap-1 text-xs text-slate-400"><span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />Neutro</span>
            </div>
          </div>

          {/* Topics */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3">Temas recurrentes</p>
            <div className="space-y-2.5">
              {SENTIMENT_TOPICS?.map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground truncate">{t?.topic}</span>
                      <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{t?.mentions} menciones</span>
                    </div>
                    <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${t?.positive >= 70 ? 'bg-blue-500' : t?.positive >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${t?.positive}%` }}
                      />
                    </div>
                  </div>
                  <span className={`ml-3 text-xs font-medium flex-shrink-0 ${t?.positive >= 70 ? 'text-blue-600' : t?.positive >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                    {t?.positive}% {t?.positive >= 70 ? 'positivo' : t?.positive >= 50 ? 'mixto' : 'negativo'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Executive summary */}
        <div className="mt-5 p-4 bg-muted/20 border border-border rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <span>✨</span>Resumen ejecutivo generado por IA
            </p>
            <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-foreground hover:bg-muted/50 transition-colors">
              <Icon name={copied ? 'Check' : 'Copy'} size={12} />
              {copied ? 'Copiado' : 'Copiar resumen'}
            </button>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{executiveSummary}</p>
        </div>
      </div>
      {/* Branch comparison */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Comparativa por sucursal</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">Sucursal</th>
                <th className="text-center py-3 px-3 text-xs font-medium text-muted-foreground">Score</th>
                <th className="text-center py-3 px-3 text-xs font-medium text-muted-foreground">Total</th>
                <th className="text-center py-3 px-3 text-xs font-medium text-muted-foreground">Tasa respuesta</th>
                <th className="text-center py-3 px-3 text-xs font-medium text-muted-foreground">Sin responder</th>
                <th className="py-3 px-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {BRANCH_DATA?.map((b, i) => (
                <tr key={i} className="hover:bg-muted/20 cursor-pointer transition-colors">
                  <td className="py-3 px-3 text-sm font-medium text-foreground">{b?.branch}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-sm font-bold text-foreground">⭐ {b?.score}</span>
                  </td>
                  <td className="py-3 px-3 text-center text-sm text-foreground">{b?.total}</td>
                  <td className="py-3 px-3 text-center text-sm text-foreground">{b?.responseRate}%</td>
                  <td className="py-3 px-3 text-center text-sm text-foreground">{b?.unreplied}</td>
                  <td className="py-3 px-3 text-right">
                    {b?.best && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Mejor sucursal</span>}
                    {b?.attention && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">Necesita atención</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Alerts */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Alertas inteligentes</h3>
        <div className="space-y-3">
          {ALERTS?.map((alert, i) => (
            <div key={i} className={`flex items-start justify-between gap-3 p-4 rounded-xl border ${
              alert?.level === 'red' ? 'bg-red-50 border-red-100' :
              alert?.level === 'yellow'? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'
            }`}>
              <div className="flex items-start gap-2.5">
                <span className="text-base flex-shrink-0 mt-0.5">{alert?.icon}</span>
                <p className={`text-sm font-medium ${
                  alert?.level === 'red' ? 'text-red-800' :
                  alert?.level === 'yellow'? 'text-amber-800' : 'text-emerald-800'
                }`}>{alert?.message}</p>
              </div>
              {alert?.cta && (
                <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium flex-shrink-0 transition-colors ${
                  alert?.level === 'red' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-amber-600 text-white hover:bg-amber-700'
                }`}>
                  <Icon name={alert?.ctaIcon} size={12} />
                  {alert?.cta}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewsDashboardTab;
