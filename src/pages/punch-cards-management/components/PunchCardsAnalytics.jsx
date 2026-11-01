import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell
} from 'recharts';

const STAMP_ICONS = [
  { id: 'circle', icon: '⭕' }, { id: 'star', icon: '⭐' }, { id: 'heart', icon: '❤️' },
  { id: 'diamond', icon: '💎' }, { id: 'flame', icon: '🔥' }, { id: 'lightning', icon: '⚡' },
  { id: 'leaf', icon: '🍃' }, { id: 'crown', icon: '👑' }, { id: 'coffee', icon: '☕' },
  { id: 'pizza', icon: '🍕' }, { id: 'scissors', icon: '✂️' }, { id: 'dumbbell', icon: '🏋️' },
  { id: 'bag', icon: '🛍️' }, { id: 'footprint', icon: '👣' }, { id: 'gift', icon: '🎁' }, { id: 'gem', icon: '💍' },
];
const getStampIcon = (id) => STAMP_ICONS?.find(s => s?.id === id)?.icon || '⭐';

const KPICard = ({ label, value, change, icon, color, bg }) => (
  <div className="bg-card border border-border rounded-xl p-4">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
        <Icon name={icon} size={20} className={color} />
      </div>
      {change && <span className={`text-xs font-medium ${change?.startsWith('+') ? 'text-success' : 'text-destructive'}`}>{change}</span>}
    </div>
    <p className="text-2xl font-bold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground mt-1">{label}</p>
  </div>
);

const CardAnalyticsDrawer = ({ card, onClose }) => {
  if (!card) return null;
  const stampIcon = getStampIcon(card?.stamp_icon);
  const stampCount = card?.stamp_count || 8;
  const activeClients = card?.active_clients || 0;
  const distribution = Array.from({ length: stampCount }, (_, i) => ({
    stamp: i + 1,
    clients: Math.max(1, Math.floor(activeClients * Math.exp(-i * 0.3))),
  }));
  const abandonPoint = distribution?.reduce((max, d, i) => {
    const drop = i > 0 ? distribution?.[i - 1]?.clients - d?.clients : 0;
    return drop > max?.drop ? { stamp: d?.stamp, drop } : max;
  }, { stamp: 0, drop: 0 });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="bg-card w-full max-w-lg h-full overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{stampIcon}</span>
            <div>
              <h3 className="font-bold text-foreground">{card?.name}</h3>
              <p className="text-sm text-muted-foreground">Analytics individual</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Tarjetas emitidas', value: activeClients, icon: 'CreditCard', color: 'text-primary' },
              { label: 'Tasa de completitud', value: `${card?.completion_rate || 0}%`, icon: 'CheckCircle', color: 'text-success' },
              { label: 'Progreso promedio', value: `${card?.avg_progress || 0} / ${stampCount}`, icon: 'TrendingUp', color: 'text-warning' },
              { label: 'Tiempo promedio', value: '6.2 sem', icon: 'Clock', color: 'text-muted-foreground' },
            ]?.map((kpi, i) => (
              <div key={i} className="bg-muted/30 rounded-xl p-4">
                <Icon name={kpi?.icon} size={18} className={`${kpi?.color} mb-2`} />
                <p className={`text-xl font-bold ${kpi?.color}`}>{kpi?.value}</p>
                <p className="text-xs text-muted-foreground">{kpi?.label}</p>
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-foreground text-sm">Distribución de progreso</h4>
              {abandonPoint?.stamp > 0 && (
                <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full">
                  Abandono en sello {abandonPoint?.stamp}
                </span>
              )}
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={distribution} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="stamp" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="clients" name="Clientes" radius={[3, 3, 0, 0]}>
                  {distribution?.map((d, i) => (
                    <Cell key={i} fill={d?.stamp === abandonPoint?.stamp ? '#F59E0B' : '#3B82F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {abandonPoint?.stamp > 0 && (
              <div className="mt-2 p-3 bg-warning/10 border border-warning/20 rounded-xl">
                <p className="text-xs text-warning font-medium">
                  ⚠️ Punto de abandono detectado en el sello {abandonPoint?.stamp}. Considera activar doble sello o enviar recordatorio a clientes con {abandonPoint?.stamp - 1}+ sellos.
                </p>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-foreground text-sm mb-3">Clientes que completaron</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 text-muted-foreground">Cliente</th>
                    <th className="text-left py-2 px-2 text-muted-foreground">Inicio</th>
                    <th className="text-left py-2 px-2 text-muted-foreground">Días</th>
                    <th className="text-left py-2 px-2 text-muted-foreground">Canjeó</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'María G.', start: '12 Mar', days: 28, claimed: true },
                    { name: 'Carlos L.', start: '18 Mar', days: 35, claimed: true },
                    { name: 'Ana M.', start: '25 Mar', days: 42, claimed: false },
                    { name: 'Luis H.', start: '2 Abr', days: 21, claimed: true },
                  ]?.map((c, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2 px-2 font-medium text-foreground">{c?.name}</td>
                      <td className="py-2 px-2 text-muted-foreground">{c?.start}</td>
                      <td className="py-2 px-2 text-foreground">{c?.days}</td>
                      <td className="py-2 px-2">
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${c?.claimed ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                          {c?.claimed ? 'Sí' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PunchCardsAnalytics = ({ cards }) => {
  const [analyticsCard, setAnalyticsCard] = useState(null);

  const totalActive = cards?.reduce((sum, c) => sum + (c?.active_clients || 0), 0);
  const avgCompletion = cards?.length > 0
    ? Math.round(cards?.reduce((sum, c) => sum + (c?.completion_rate || 0), 0) / cards?.length)
    : 0;
  const totalRewards = cards?.reduce((sum, c) => sum + Math.floor((c?.active_clients || 0) * (c?.completion_rate || 0) / 100), 0);
  const totalCost = cards?.reduce((sum, c) => {
    const completions = Math.floor((c?.active_clients || 0) * (c?.completion_rate || 0) / 100);
    return sum + completions * (parseFloat(c?.perceived_value) || 45);
  }, 0);

  const progressData = cards?.map(c => ({
    tarjeta: c?.name?.substring(0, 10) + (c?.name?.length > 10 ? '...' : ''),
    activas: c?.active_clients || 0,
    completadas: Math.floor((c?.active_clients || 0) * (c?.completion_rate || 0) / 100),
    tasa: c?.completion_rate || 0,
  }));

  const weeklyTrend = [
    { semana: 'S1', nuevas: 45, completadas: 12, vencidas: 3 },
    { semana: 'S2', nuevas: 62, completadas: 18, vencidas: 5 },
    { semana: 'S3', nuevas: 38, completadas: 22, vencidas: 4 },
    { semana: 'S4', nuevas: 71, completadas: 31, vencidas: 8 },
    { semana: 'S5', nuevas: 55, completadas: 28, vencidas: 6 },
    { semana: 'S6', nuevas: 89, completadas: 45, vencidas: 9 },
    { semana: 'S7', nuevas: 74, completadas: 38, vencidas: 7 },
    { semana: 'S8', nuevas: 92, completadas: 52, vencidas: 11 },
  ];

  const roi = totalCost > 0 ? ((totalActive * 250) / totalCost)?.toFixed(1) : '—';

  return (
    <div className="space-y-6">
      {/* Global KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Tarjetas activas en circulación" value={totalActive?.toLocaleString()} change="+124" icon="CreditCard" color="text-primary" bg="bg-primary/10" />
        <KPICard label="Tasa de completitud" value={`${avgCompletion}%`} change={avgCompletion >= 25 ? '+3.4%' : undefined} icon="TrendingUp" color={avgCompletion >= 25 ? 'text-success' : 'text-warning'} bg={avgCompletion >= 25 ? 'bg-success/10' : 'bg-warning/10'} />
        <KPICard label="Recompensas entregadas (mes)" value={totalRewards} change="+42" icon="Gift" color="text-purple-600" bg="bg-purple-100" />
        <KPICard label="Costo del programa (mes)" value={`$${totalCost?.toLocaleString()} MXN`} change={`ROI: ${roi}×`} icon="DollarSign" color="text-warning" bg="bg-warning/10" />
      </div>

      {/* Alerts */}
      {avgCompletion < 15 && (
        <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl flex items-start gap-3">
          <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warning">Tasa de completitud baja ({avgCompletion}%)</p>
            <p className="text-xs text-muted-foreground mt-0.5">Tus clientes no están completando las tarjetas. Considera reducir el número de sellos o mejorar la recompensa. El benchmark saludable es 25-35%.</p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 text-sm">Progreso por Tarjeta</h3>
          {progressData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={progressData} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="tarjeta" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="activas" name="Activas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completadas" name="Completadas" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Sin datos disponibles</div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 text-sm">Tendencia Mensual (últimas 8 semanas)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="semana" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="nuevas" name="Nuevas" stroke="#3B82F6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="completadas" name="Completadas" stroke="#059669" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="vencidas" name="Vencidas" stroke="#EF4444" strokeWidth={2} dot={false} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparative Table */}
      {cards?.length > 1 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 text-sm">Comparativa entre Tarjetas de Sello</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Tarjeta</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Emitidas</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Completadas</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Tasa</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Progreso avg</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Costo</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {cards?.map(card => {
                  const completions = Math.floor((card?.active_clients || 0) * (card?.completion_rate || 0) / 100);
                  const cost = completions * (parseFloat(card?.perceived_value) || 45);
                  const stampIcon = getStampIcon(card?.stamp_icon);
                  return (
                    <tr key={card?.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span>{stampIcon}</span>
                          <span className="font-medium text-foreground">{card?.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right text-foreground">{card?.active_clients || 0}</td>
                      <td className="py-2.5 px-3 text-right text-success font-medium">{completions}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`font-medium ${(card?.completion_rate || 0) >= 25 ? 'text-success' : 'text-warning'}`}>
                          {card?.completion_rate || 0}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-foreground">{card?.avg_progress || 0} / {card?.stamp_count}</td>
                      <td className="py-2.5 px-3 text-right text-muted-foreground">${cost?.toLocaleString()}</td>
                      <td className="py-2.5 px-3">
                        <button
                          type="button"
                          onClick={() => setAnalyticsCard(card)}
                          className="text-xs text-primary hover:underline"
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Time to complete */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4 text-sm">Tiempo Promedio de Completitud</h3>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">42</p>
            <p className="text-sm text-muted-foreground">días promedio</p>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 bg-muted rounded-full h-3">
                <div className="bg-primary h-3 rounded-full" style={{ width: '60%' }} />
              </div>
              <span className="text-xs text-muted-foreground w-20">Tu negocio: 42d</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-muted rounded-full h-3">
                <div className="bg-muted-foreground h-3 rounded-full" style={{ width: '50%' }} />
              </div>
              <span className="text-xs text-muted-foreground w-20">Benchmark: 35d</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Tus clientes tardan 7 días más que el promedio de tu categoría. Considera activar doble sello para acelerar la completitud.
            </p>
          </div>
        </div>
      </div>

      {analyticsCard && <CardAnalyticsDrawer card={analyticsCard} onClose={() => setAnalyticsCard(null)} />}
    </div>
  );
};

export default PunchCardsAnalytics;
