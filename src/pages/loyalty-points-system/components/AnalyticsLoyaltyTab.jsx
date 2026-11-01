import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';

const POINT_VALUE_MXN = 0.15;

const MONTHLY_DATA = [
  { month: 'Abr', emitted: 8420, redeemed: 3200, cost: 480, revenue: 42000 },
  { month: 'May', emitted: 9870, redeemed: 4100, cost: 615, revenue: 49350 },
  { month: 'Jun', emitted: 11230, redeemed: 5200, cost: 780, revenue: 56150 },
  { month: 'Jul', emitted: 10450, redeemed: 4800, cost: 720, revenue: 52250 },
  { month: 'Ago', emitted: 13200, redeemed: 6100, cost: 915, revenue: 66000 },
  { month: 'Sep', emitted: 14800, redeemed: 7200, cost: 1080, revenue: 74000 },
  { month: 'Oct', emitted: 16300, redeemed: 8400, cost: 1260, revenue: 81500 },
  { month: 'Nov', emitted: 18900, redeemed: 9800, cost: 1470, revenue: 94500 },
  { month: 'Dic', emitted: 22400, redeemed: 12100, cost: 1815, revenue: 112000 },
  { month: 'Ene', emitted: 15600, redeemed: 7900, cost: 1185, revenue: 78000 },
  { month: 'Feb', emitted: 17200, redeemed: 8800, cost: 1320, revenue: 86000 },
  { month: 'Mar', emitted: 19400, redeemed: 9600, cost: 1440, revenue: 97000 },
];

const TIER_DATA = [
  { name: 'Bronce', value: 45, color: '#92400e' },
  { name: 'Plata', value: 30, color: '#6b7280' },
  { name: 'Oro', value: 20, color: '#d97706' },
  { name: 'Platino', value: 5, color: '#7c3aed' },
];

const BALANCE_HISTOGRAM = [
  { range: '0-50', clients: 320 },
  { range: '51-100', clients: 480 },
  { range: '101-200', clients: 620 },
  { range: '201-500', clients: 540 },
  { range: '501-1000', clients: 380 },
  { range: '1001-2000', clients: 210 },
  { range: '2000+', clients: 97 },
];

const TOP_REWARDS = [
  { name: 'Café americano gratis', redeemed: 234, cost: 100 },
  { name: '30% de descuento', redeemed: 156, cost: 200 },
  { name: 'Desayuno completo', redeemed: 89, cost: 300 },
  { name: 'Upgrade de bebida', redeemed: 67, cost: 150 },
  { name: 'Experiencia de cata', redeemed: 12, cost: 1000 },
];

const KPICard = ({ label, value, sub, icon, color, trend }) => (
  <div className="bg-card border border-border rounded-xl p-5">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon name={icon} size={20} />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-medium flex items-center gap-1 ${
          trend >= 0 ? 'text-emerald-600' : 'text-destructive'
        }`}>
          <Icon name={trend >= 0 ? 'TrendingUp' : 'TrendingDown'} size={12} />
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-foreground">{value}</p>
    <p className="text-sm text-muted-foreground mt-1">{label}</p>
    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

const AnalyticsLoyaltyTab = () => {
  const [period, setPeriod] = useState('12m');

  const totalEmitted = MONTHLY_DATA?.reduce((s, d) => s + d?.emitted, 0);
  const totalRedeemed = MONTHLY_DATA?.reduce((s, d) => s + d?.redeemed, 0);
  const redemptionRate = Math.round((totalRedeemed / totalEmitted) * 100);
  const totalCost = MONTHLY_DATA?.reduce((s, d) => s + d?.cost, 0);
  const totalRevenue = MONTHLY_DATA?.reduce((s, d) => s + d?.revenue, 0);
  const costPct = ((totalCost / totalRevenue) * 100)?.toFixed(1);
  const circulation = totalEmitted - totalRedeemed;
  const breakage = Math.round(circulation * 0.12);

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Analytics del programa</h3>
        <div className="flex gap-2">
          {['3m', '6m', '12m']?.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === p ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/70'
              }`}>
              {p === '3m' ? '3 meses' : p === '6m' ? '6 meses' : '12 meses'}
            </button>
          ))}
        </div>
      </div>
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Puntos emitidos" value={totalEmitted?.toLocaleString()} sub="Últimos 12 meses" icon="TrendingUp" color="text-emerald-600 bg-emerald-50" trend={12.5} />
        <KPICard label="Tasa de canje" value={`${redemptionRate}%`} sub={`${totalRedeemed?.toLocaleString()} pts canjeados`} icon="Gift" color="text-purple-600 bg-purple-50" trend={-2.1} />
        <KPICard label="Costo del programa" value={`${totalCost?.toLocaleString()}`} sub={`${costPct}% del revenue`} icon="DollarSign" color="text-amber-600 bg-amber-50" trend={3.2} />
        <KPICard label="Breakage estimado" value={`${breakage?.toLocaleString()} pts`} sub={`${(breakage * POINT_VALUE_MXN)?.toFixed(0)} MXN no canjeados`} icon="AlertTriangle" color="text-blue-600 bg-blue-50" trend={0} />
      </div>
      {/* Emitted vs Redeemed chart */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h4 className="font-semibold text-foreground mb-4">Puntos emitidos vs canjeados (12 meses)</h4>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={MONTHLY_DATA}>
            <defs>
              <linearGradient id="emittedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="redeemedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
            <YAxis stroke="#64748B" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
            <Legend />
            <Area type="monotone" dataKey="emitted" stroke="#059669" fill="url(#emittedGrad)" strokeWidth={2} name="Emitidos" />
            <Area type="monotone" dataKey="redeemed" stroke="#7c3aed" fill="url(#redeemedGrad)" strokeWidth={2} name="Canjeados" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Two-column charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier distribution */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h4 className="font-semibold text-foreground mb-4">Distribución por nivel</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={TIER_DATA} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100)?.toFixed(0)}%`}
              >
                {TIER_DATA?.map((entry, i) => <Cell key={i} fill={entry?.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Balance histogram */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h4 className="font-semibold text-foreground mb-4">Distribución de saldos (clientes)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={BALANCE_HISTOGRAM}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="range" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
              <Bar dataKey="clients" fill="#2563EB" name="Clientes" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Top rewards */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h4 className="font-semibold text-foreground mb-4">Top recompensas canjeadas</h4>
        <div className="space-y-3">
          {TOP_REWARDS?.map((r, i) => (
            <div key={r?.name} className="flex items-center gap-4">
              <span className="text-sm font-bold text-muted-foreground w-5">#{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{r?.name}</span>
                  <span className="text-sm text-muted-foreground">{r?.redeemed} canjes</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(r?.redeemed / TOP_REWARDS?.[0]?.redeemed) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground w-16 text-right">{r?.cost} pts</span>
            </div>
          ))}
        </div>
      </div>
      {/* LTV comparison */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h4 className="font-semibold text-foreground mb-4">LTV: Clientes con programa vs sin programa</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="Star" size={18} className="text-emerald-600" />
              <span className="font-semibold text-emerald-800">Con programa activo</span>
            </div>
            <p className="text-3xl font-bold text-emerald-700 mb-1">$4,280</p>
            <p className="text-sm text-emerald-600">LTV promedio estimado</p>
            <div className="mt-3 space-y-1 text-xs text-emerald-700">
              <p>Ticket promedio: $185 MXN</p>
              <p>Frecuencia: 3.2 visitas/mes</p>
              <p>Relación estimada: 7.2 meses</p>
            </div>
          </div>
          <div className="p-5 bg-muted/30 border border-border rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="User" size={18} className="text-muted-foreground" />
              <span className="font-semibold text-foreground">Sin programa</span>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">$1,640</p>
            <p className="text-sm text-muted-foreground">LTV promedio estimado</p>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <p>Ticket promedio: $162 MXN</p>
              <p>Frecuencia: 1.4 visitas/mes</p>
              <p>Relación estimada: 4.1 meses</p>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm text-foreground">
            <strong>+161% LTV</strong> para clientes con programa activo vs sin programa.
            El programa de puntos genera <strong>$2,640 MXN adicionales</strong> por cliente en promedio.
          </p>
        </div>
      </div>
      {/* Cost vs Revenue */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h4 className="font-semibold text-foreground mb-4">Costo del programa vs Revenue generado</h4>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={MONTHLY_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
            <YAxis stroke="#64748B" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }}
              formatter={(val, name) => [`$${val?.toLocaleString()}`, name]}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#059669" name="Revenue ($MXN)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cost" fill="#dc2626" name="Costo descuentos ($MXN)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsLoyaltyTab;
