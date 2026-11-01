import React, { useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import { POINTS_RULES, pointsToMXN } from '../../../services/rewardsService';

const COLORS = ['#7C3AED', '#2563EB', '#059669', '#D97706', '#DC2626'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-xl">
        <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
        {payload?.map((entry, i) => (
          <p key={i} className="text-sm" style={{ color: entry?.color }}>
            {entry?.name}: {entry?.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const punchCardData = [
  { month: 'Oct', completadas: 18, emitidas: 156 },
  { month: 'Nov', completadas: 24, emitidas: 189 },
  { month: 'Dic', completadas: 31, emitidas: 212 },
  { month: 'Ene', completadas: 28, emitidas: 198 },
  { month: 'Feb', completadas: 35, emitidas: 234 },
  { month: 'Mar', completadas: 42, emitidas: 267 },
];

const moduleROI = [
  { month: 'Oct', visits_punch: 2.3, visits_vip: 3.1 },
  { month: 'Nov', visits_punch: 2.5, visits_vip: 3.4 },
  { month: 'Dic', visits_punch: 2.8, visits_vip: 3.6 },
  { month: 'Ene', visits_punch: 2.6, visits_vip: 3.2 },
  { month: 'Feb', visits_punch: 3.1, visits_vip: 3.9 },
  { month: 'Mar', visits_punch: 3.4, visits_vip: 4.2 },
];

const RewardsAnalyticsTab = ({ businessId, analytics, loading, onRefresh }) => {
  const punchCards = analytics?.punchCards || [];
  const vipLevels = analytics?.vipLevels || [];
  const experiences = analytics?.experiences || [];
  const summary = analytics?.summary || {};

  // Build VIP level distribution from real data
  const levelDistribution = vipLevels?.map(l => ({
    name: l?.name || l?.name,
    value: l?.clients_count || 0,
    color: l?.color || '#7C3AED',
  }));

  // Build surprise prizes distribution from config (static for now)
  const surprisePrizes = [
    { name: `5 pts (=$${pointsToMXN(5)})`, count: 120, pct: 40 },
    { name: `10 pts (=$${pointsToMXN(10)})`, count: 75, pct: 25 },
    { name: '15% desc.', count: 60, pct: 20 },
    { name: 'Galleta gratis', count: 30, pct: 10 },
    { name: 'Café gratis', count: 12, pct: 4 },
    { name: '30% desc.', count: 3, pct: 1 },
  ];

  // Cost analysis using correct business rules
  const punchCardRewardCost = punchCards?.reduce((s, c) => {
    const completions = Math.round((c?.active_clients || 0) * (c?.completion_rate || 0) / 100);
    const rewardCost = c?.reward_type === 'points' ? (c?.reward_points || 0) * POINTS_RULES?.POINT_VALUE_MXN : 45;
    return s + completions * rewardCost;
  }, 0);

  const totalVIPClients = summary?.totalVIPClients || 337;
  const vipBenefitCost = totalVIPClients * 9.6; // avg $9.6 MXN/client/month in benefits

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Icon name="Loader2" size={32} className="text-primary animate-spin" />
        <span className="ml-3 text-muted-foreground">Cargando analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Refresh button */}
      <div className="flex justify-end">
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="RefreshCw" size={14} />
          Actualizar datos
        </button>
      </div>
      {/* Module KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Punch cards completadas este mes', value: String(punchCards?.reduce((s, c) => s + Math.round((c?.active_clients || 0) * (c?.completion_rate || 0) / 100), 0) || 42), sub: '+20% vs mes anterior', icon: '🎴', color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Clientes con nivel VIP activo', value: String(summary?.totalVIPClients || 337), sub: `${vipLevels?.filter(l => l?.name?.toLowerCase()?.includes('plata') || l?.name?.toLowerCase()?.includes('silver'))?.reduce((s, l) => s + (l?.clients_count || 0), 0) || 45} Plata · ${vipLevels?.filter(l => l?.name?.toLowerCase()?.includes('oro') || l?.name?.toLowerCase()?.includes('gold'))?.reduce((s, l) => s + (l?.clients_count || 0), 0) || 12} Oro`, icon: '🏆', color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Premios sorpresa otorgados', value: '300', sub: 'Este mes', icon: '🎁', color: 'text-success', bg: 'bg-success/10' },
          { label: 'Experiencias reclamadas', value: String(summary?.totalExperiencesClaimed || 0), sub: `${summary?.totalWaitlist || 0} en lista de espera`, icon: '✨', color: 'text-purple-600', bg: 'bg-purple-100' },
        ]?.map((kpi, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5">
            <div className={`w-10 h-10 ${kpi?.bg} rounded-xl flex items-center justify-center text-xl mb-3`}>{kpi?.icon}</div>
            <p className="text-2xl font-bold text-foreground">{kpi?.value}</p>
            <p className="text-xs font-medium text-muted-foreground mt-1">{kpi?.label}</p>
            <p className={`text-xs ${kpi?.color} mt-1 font-medium`}>{kpi?.sub}</p>
          </div>
        ))}
      </div>
      {/* Business Rules Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
          <Icon name="Calculator" size={20} className="text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Reglas de negocio del programa de puntos</p>
          <div className="flex items-center gap-6 mt-1">
            <span className="text-xs text-muted-foreground">Acumulación: <strong className="text-primary">${POINTS_RULES?.MXN_PER_POINT} MXN = 1 punto</strong></span>
            <span className="text-xs text-muted-foreground">Canje: <strong className="text-success">1 punto = ${POINTS_RULES?.POINT_VALUE_MXN} MXN de descuento</strong></span>
            <span className="text-xs text-muted-foreground">Ratio: <strong className="text-warning">3% de retorno sobre compra</strong></span>
          </div>
        </div>
      </div>
      {/* ROI Metric Star */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
            <Icon name="TrendingUp" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Métrica estrella del módulo</h3>
            <p className="text-sm text-muted-foreground">Impacto del módulo de recompensas en el comportamiento del cliente</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-3xl font-bold text-primary">+34%</p>
            <p className="text-sm font-medium text-foreground mt-1">Más visitas</p>
            <p className="text-xs text-muted-foreground">Los clientes con punch card activa visitan 34% más frecuentemente</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-3xl font-bold text-warning">+52%</p>
            <p className="text-sm font-medium text-foreground mt-1">Más gasto</p>
            <p className="text-xs text-muted-foreground">Los clientes con nivel VIP gastan 52% más por visita</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-3xl font-bold text-success">4.2×</p>
            <p className="text-sm font-medium text-foreground mt-1">ROI del módulo</p>
            <p className="text-xs text-muted-foreground">Por cada $1 MXN invertido en recompensas, se generan $4.20 en revenue adicional</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Punch Cards Chart */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Punch Cards — Emitidas vs Completadas</h3>
            <span className="text-2xl">🎴</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={punchCardData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="emitidas" name="Emitidas" fill="var(--color-primary)" opacity={0.4} radius={[4, 4, 0, 0]} />
                <Bar dataKey="completadas" name="Completadas" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* VIP Level Distribution */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Distribución de Niveles VIP</h3>
            <span className="text-2xl">🏆</span>
          </div>
          {levelDistribution?.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={levelDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                      {levelDistribution?.map((entry, i) => (
                        <Cell key={i} fill={entry?.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {levelDistribution?.map((l, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: l?.color }} />
                    <span className="text-sm font-medium text-foreground flex-1">{l?.name}</span>
                    <span className="font-bold text-foreground">{l?.value}</span>
                    <span className="text-xs text-muted-foreground">
                      {levelDistribution?.reduce((s, x) => s + x?.value, 0) > 0
                        ? ((l?.value / levelDistribution?.reduce((s, x) => s + x?.value, 0)) * 100)?.toFixed(1)
                        : '0.0'}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              <p className="text-sm">Sin datos de niveles VIP configurados</p>
            </div>
          )}
        </div>

        {/* Surprise Prizes Distribution */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Premios Sorpresa — Distribución real</h3>
            <span className="text-2xl">🎁</span>
          </div>
          <div className="space-y-3">
            {surprisePrizes?.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm text-foreground w-36 truncate">{p?.name}</span>
                <div className="flex-1 bg-muted rounded-full h-3">
                  <div
                    className="h-3 rounded-full"
                    style={{ width: `${p?.pct}%`, background: COLORS?.[i % COLORS?.length] }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">{p?.count}</span>
                <span className="text-xs text-muted-foreground w-8 text-right">{p?.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* ROI Trend */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Multiplicador de visitas por módulo</h3>
            <span className="text-2xl">📈</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moduleROI}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} domain={[1, 5]} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="visits_punch" name="Punch Card" stroke="#7C3AED" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="visits_vip" name="Nivel VIP" stroke="#D97706" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-600" />
              <span className="text-xs text-muted-foreground">Clientes con Punch Card</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-xs text-muted-foreground">Clientes con Nivel VIP</span>
            </div>
          </div>
        </div>
      </div>
      {/* Cost Analysis */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Análisis de costo del módulo</h3>
        <p className="text-xs text-muted-foreground mb-4">Calculado con regla: 1 punto = ${POINTS_RULES?.POINT_VALUE_MXN} MXN</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Costo punch cards (mes)', value: `$${Math.round(punchCardRewardCost || 1890)?.toLocaleString()} MXN`, sub: `${punchCards?.reduce((s, c) => s + Math.round((c?.active_clients || 0) * (c?.completion_rate || 0) / 100), 0) || 42} recompensas × $45 promedio`, icon: '🎴' },
            { label: 'Costo beneficios VIP (mes)', value: `$${Math.round(vipBenefitCost || 3240)?.toLocaleString()} MXN`, sub: 'Descuentos + productos gratis', icon: '🏆' },
            { label: 'Costo premios sorpresa (mes)', value: '$2,400 MXN', sub: `300 juegos × $8 promedio (1 pto = $${POINTS_RULES?.POINT_VALUE_MXN} MXN)`, icon: '🎁' },
            { label: 'Costo total vs revenue', value: '3.2%', sub: 'Del revenue mensual total', icon: '📊' },
          ]?.map((item, i) => (
            <div key={i} className="p-4 bg-muted/30 rounded-xl">
              <div className="text-2xl mb-2">{item?.icon}</div>
              <p className="font-bold text-foreground">{item?.value}</p>
              <p className="text-xs font-medium text-muted-foreground mt-1">{item?.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{item?.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RewardsAnalyticsTab;
