import React, { useState, useEffect } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import Icon from '../../../components/AppIcon';
import { fetchMercadoData } from '../../../services/analyticsService';

const dias = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
const diasLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const getDemandColor = (val) => {
  if (val < 5) return '#DBEAFE';
  if (val < 10) return '#93C5FD';
  if (val < 16) return '#3B82F6';
  if (val < 22) return '#1D4ED8';
  return '#1A3FE0';
};

const demandaData = [
  { hora: '6AM', lun: 2, mar: 1, mie: 3, jue: 2, vie: 4, sab: 5, dom: 3 },
  { hora: '8AM', lun: 8, mar: 7, mie: 9, jue: 8, vie: 12, sab: 15, dom: 10 },
  { hora: '10AM', lun: 12, mar: 10, mie: 14, jue: 11, vie: 16, sab: 20, dom: 14 },
  { hora: '12PM', lun: 18, mar: 15, mie: 20, jue: 17, vie: 22, sab: 25, dom: 18 },
  { hora: '2PM', lun: 14, mar: 12, mie: 16, jue: 13, vie: 18, sab: 22, dom: 15 },
  { hora: '4PM', lun: 10, mar: 8, mie: 12, jue: 9, vie: 15, sab: 18, dom: 12 },
  { hora: '6PM', lun: 16, mar: 14, mie: 18, jue: 15, vie: 28, sab: 24, dom: 16 },
  { hora: '8PM', lun: 12, mar: 10, mie: 14, jue: 11, vie: 22, sab: 20, dom: 12 },
  { hora: '10PM', lun: 6, mar: 5, mie: 7, jue: 6, vie: 10, sab: 12, dom: 7 },
];

const Skeleton = ({ h = 'h-40' }) => (
  <div className={`${h} bg-[#F7F8FC] rounded-xl animate-pulse`} />
);

const TabMercado = ({ businessId }) => {
  const [radio, setRadio] = useState('3km');
  const [rankingMetric, setRankingMetric] = useState('Rating');
  const [showAlertasModal, setShowAlertasModal] = useState(false);
  const [alertaToggles, setAlertaToggles] = useState({ alta: true, media: true, info: true });
  const [alertaCanal, setAlertaCanal] = useState({ email: true, push: true, whatsapp: false });
  const [alertaFrecuencia, setAlertaFrecuencia] = useState('diaria');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const radios = ['500m', '1km', '3km', '5km', '10km'];
  const rankingMetrics = ['Rating', 'Visitas estimadas', 'Engagement', 'Reseñas'];

  useEffect(() => {
    if (!businessId) { setLoading(false); return; }
    setLoading(true);
    fetchMercadoData(businessId)?.then(result => {
      setData(result);
      setLoading(false);
    });
  }, [businessId]);

  const metrics = data?.metrics || {};
  const features = data?.features || {};

  // Build radar data from real metrics
  const radarData = [
    { subject: 'Rating', negocio: Math.round((metrics?.rating || 0) * 20), categoria: 84 },
    { subject: 'Reseñas', negocio: Math.min(Math.round((metrics?.totalReviews || 0) / 3), 100), categoria: 60 },
    { subject: 'Engagement', negocio: Math.min(metrics?.checkinsPerWeek || 0, 100), categoria: 65 },
    { subject: 'Promos', negocio: Math.min((metrics?.activePromos || 0) * 20, 100), categoria: 68 },
    { subject: 'Visitas', negocio: Math.min(metrics?.checkinsPerWeek || 0, 100), categoria: 55 },
    { subject: 'NPS', negocio: Math.max(metrics?.nps || 0, 0), categoria: 67 },
  ];

  // Build metrics comparison table from real data
  const metricsData = [
    {
      metrica: 'Rating promedio',
      negocio: `${metrics?.rating || '0.0'} ★`,
      categoria: '4.2 ★',
      diff: metrics?.rating ? `${(metrics?.rating - 4.2)?.toFixed(1) > 0 ? '+' : ''}${(metrics?.rating - 4.2)?.toFixed(1)}` : '—',
      positive: (metrics?.rating || 0) >= 4.2,
    },
    {
      metrica: 'Reseñas totales',
      negocio: String(metrics?.totalReviews || 0),
      categoria: '89',
      diff: metrics?.totalReviews ? `${metrics?.totalReviews > 89 ? '+' : ''}${metrics?.totalReviews - 89}` : '—',
      positive: (metrics?.totalReviews || 0) >= 89,
    },
    {
      metrica: 'Tasa de respuesta reseñas',
      negocio: `${metrics?.replyRate || 0}%`,
      categoria: '52%',
      diff: `${(metrics?.replyRate || 0) - 52 > 0 ? '+' : ''}${(metrics?.replyRate || 0) - 52}pp`,
      positive: (metrics?.replyRate || 0) >= 52,
    },
    {
      metrica: 'Promos activas hoy',
      negocio: String(metrics?.activePromos || 0),
      categoria: '3.4',
      diff: `${(metrics?.activePromos || 0) - 3.4 > 0 ? '+' : ''}${((metrics?.activePromos || 0) - 3.4)?.toFixed(1)}`,
      positive: (metrics?.activePromos || 0) >= 3.4,
    },
    {
      metrica: 'Check-ins estimados/sem',
      negocio: String(metrics?.checkinsPerWeek || 0),
      categoria: '98',
      diff: `${(metrics?.checkinsPerWeek || 0) - 98 > 0 ? '+' : ''}${(metrics?.checkinsPerWeek || 0) - 98}`,
      positive: (metrics?.checkinsPerWeek || 0) >= 98,
    },
    {
      metrica: 'NPS estimado',
      negocio: String(metrics?.nps || 0),
      categoria: '54',
      diff: `${(metrics?.nps || 0) - 54 > 0 ? '+' : ''}${(metrics?.nps || 0) - 54}`,
      positive: (metrics?.nps || 0) >= 54,
    },
  ];

  // Build alerts from real data
  const alertas = [];
  if ((metrics?.activePromos || 0) < 3) {
    alertas?.push({ urgencia: 'alta', icon: '🔴', texto: `Tu competencia tiene en promedio 3.4 promos activas hoy. Tú tienes ${metrics?.activePromos || 0}.`, cta: 'Crear promoción', ctaPath: '/promotions-management' });
  }
  if ((metrics?.replyRate || 0) > 50) {
    alertas?.push({ urgencia: 'info', icon: '🟢', texto: `Tu tasa de respuesta a reseñas (${metrics?.replyRate || 0}%) supera a tu categoría (52%). ¡Sigue así!`, cta: 'Ver reseñas', ctaPath: '/reviews-management-dashboard' });
  }
  if (!features?.hasOrderAhead) {
    alertas?.push({ urgencia: 'media', icon: '🟡', texto: 'Tu categoría está adoptando Order Ahead (60% lo tiene activo). Tú no.', cta: 'Activar Order Ahead', ctaPath: '/order-ahead-management' });
  }
  if (!features?.hasMembership) {
    alertas?.push({ urgencia: 'media', icon: '🟡', texto: '+23% de negocios activaron membresías recurrentes este mes.', cta: 'Crear membresía', ctaPath: '/membership-config' });
  }
  if ((metrics?.nps || 0) > 50) {
    alertas?.push({ urgencia: 'info', icon: '🟢', texto: `Tu NPS está ${(metrics?.nps || 0) - 54} puntos por encima del promedio. Buen momento para pedir más reseñas.`, cta: 'Solicitar reseñas', ctaPath: '/review-requests-management' });
  }
  if (alertas?.length === 0) {
    alertas?.push({ urgencia: 'info', icon: '🟢', texto: 'Sin alertas competitivas activas para el período seleccionado.', cta: null, ctaPath: null });
  }

  const gapFeatures = [
    { icon: '📅', name: 'Reservaciones', pct: 62, activo: false, path: '/reservations-management' },
    { icon: '⭐', name: 'Programa de puntos', pct: 78, activo: features?.hasLoyalty || false, path: null },
    { icon: '📱', name: 'Order Ahead', pct: 45, activo: features?.hasOrderAhead || false, path: '/order-ahead-management' },
    { icon: '💬', name: 'Respuesta a reseñas', pct: 52, activo: (metrics?.replyRate || 0) > 0, path: null },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <span className="text-lg">🔒</span>
        <p className="text-sm text-blue-800">
          <strong>Todos los datos son anónimos.</strong> Nunca verás el nombre de negocios competidores. Se requieren mínimo 5 negocios de tu categoría en la zona para mostrar cualquier métrica.
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center gap-4">
        <div className="flex gap-2 flex-wrap">
          {radios?.map(r => (
            <button
              key={r}
              onClick={() => setRadio(r)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                radio === r ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <span className="text-sm text-muted-foreground ml-auto">
          Comparando con <strong className="text-foreground">negocios</strong> de tu categoría en radio de {radio}
        </span>
      </div>

      {/* Comparativa métricas */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">Comparativa de métricas</h3>
        {loading ? (
          <Skeleton h="h-64" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">Métrica</th>
                    <th className="text-center py-2 text-muted-foreground font-medium">Tu negocio</th>
                    <th className="text-center py-2 text-muted-foreground font-medium">Promedio cat.</th>
                    <th className="text-center py-2 text-muted-foreground font-medium">Diferencia</th>
                  </tr>
                </thead>
                <tbody>
                  {metricsData?.map((row, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 text-foreground">{row?.metrica}</td>
                      <td className="py-2 text-center font-semibold text-foreground">{row?.negocio}</td>
                      <td className="py-2 text-center text-muted-foreground">{row?.categoria}</td>
                      <td className={`py-2 text-center font-bold ${row?.positive ? 'text-green-600' : 'text-red-500'}`}>
                        {row?.diff} {row?.positive ? '↑' : '↓'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <Radar name="Tu negocio" dataKey="negocio" stroke="#1A3FE0" fill="#1A3FE0" fillOpacity={0.3} />
                  <Radar name="Promedio categoría" dataKey="categoria" stroke="#9CA3AF" fill="#9CA3AF" fillOpacity={0.2} strokeDasharray="5 3" />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Alertas competitivas */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">Alertas competitivas</h3>
          <button
            onClick={() => setShowAlertasModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-muted transition-colors"
          >
            <Icon name="Settings" size={14} />
            Configurar alertas
          </button>
        </div>
        {loading ? (
          <Skeleton h="h-32" />
        ) : (
          <div className="space-y-3">
            {alertas?.map((a, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${
                a?.urgencia === 'alta' ? 'bg-red-50 border-red-200' :
                a?.urgencia === 'media' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
              }`}>
                <span className="text-lg flex-shrink-0">{a?.icon}</span>
                <p className={`text-sm flex-1 ${
                  a?.urgencia === 'alta' ? 'text-red-800' :
                  a?.urgencia === 'media' ? 'text-yellow-800' : 'text-green-800'
                }`}>{a?.texto}</p>
                {a?.cta && (
                  <a
                    href={a?.ctaPath}
                    className={`text-xs font-semibold px-2 py-1 rounded-lg whitespace-nowrap ${
                      a?.urgencia === 'alta' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                      a?.urgencia === 'media' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                    } transition-colors`}
                  >
                    {a?.cta} →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gap de funcionalidades */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">Gap de funcionalidades vs categoría</h3>
        {loading ? (
          <Skeleton h="h-32" />
        ) : (
          <div className="space-y-3">
            {gapFeatures?.map((f, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-xl w-7 flex-shrink-0">{f?.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{f?.name}</span>
                    <span className="text-xs text-muted-foreground">{f?.pct}% de negocios lo tienen</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${f?.pct}%` }} />
                  </div>
                </div>
                {f?.activo ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">Activo ✓</span>
                ) : f?.path ? (
                  <a
                    href={f?.path}
                    className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold flex-shrink-0 hover:bg-primary/20 transition-colors"
                  >
                    Activar →
                  </a>
                ) : (
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full flex-shrink-0">Inactivo</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Demanda de la zona */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">Demanda de la zona por hora</h3>
        <p className="text-sm text-muted-foreground mb-4">Estimación de demanda de tu categoría en el radio seleccionado</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 400 }}>
            <thead>
              <tr>
                <th className="text-left py-2 pr-3 text-muted-foreground font-medium text-xs">Hora</th>
                {diasLabels?.map(d => (
                  <th key={d} className="text-center py-2 text-muted-foreground font-medium text-xs">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {demandaData?.map((row, ri) => (
                <tr key={ri}>
                  <td className="py-1 pr-3 text-xs text-muted-foreground whitespace-nowrap">{row?.hora}</td>
                  {dias?.map(d => (
                    <td key={d} className="py-1 px-1">
                      <div
                        className="w-8 h-6 rounded flex items-center justify-center mx-auto text-xs font-bold"
                        style={{
                          background: getDemandColor(row?.[d]),
                          color: row?.[d] >= 16 ? '#fff' : '#1e3a8a',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 10,
                        }}
                      >
                        {row?.[d]}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertas modal */}
      {showAlertasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAlertasModal(false)} />
          <div className="relative bg-card rounded-2xl shadow-2xl p-6 w-96 max-w-full">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-foreground">Configurar alertas competitivas</h4>
              <button onClick={() => setShowAlertasModal(false)} className="p-1 hover:bg-muted rounded-lg">
                <Icon name="X" size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Tipos de alerta</p>
                {[
                  { key: 'alta', label: 'Alertas urgentes (rojas)' },
                  { key: 'media', label: 'Alertas de atención (amarillas)' },
                  { key: 'info', label: 'Alertas informativas (verdes)' },
                ]?.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertaToggles?.[key]}
                      onChange={() => setAlertaToggles(prev => ({ ...prev, [key]: !prev?.[key] }))}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: '#1A3FE0' }}
                    />
                    <span className="text-sm text-foreground">{label}</span>
                  </label>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Canal de notificación</p>
                {[
                  { key: 'email', label: 'Email' },
                  { key: 'push', label: 'Push notification' },
                  { key: 'whatsapp', label: 'WhatsApp' },
                ]?.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertaCanal?.[key]}
                      onChange={() => setAlertaCanal(prev => ({ ...prev, [key]: !prev?.[key] }))}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: '#1A3FE0' }}
                    />
                    <span className="text-sm text-foreground">{label}</span>
                  </label>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Frecuencia</p>
                <select
                  value={alertaFrecuencia}
                  onChange={e => setAlertaFrecuencia(e?.target?.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="diaria">Diaria</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                </select>
              </div>
              <button
                onClick={() => setShowAlertasModal(false)}
                className="w-full py-2 rounded-lg text-white text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: '#1A3FE0' }}
              >
                Guardar configuración
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabMercado;
