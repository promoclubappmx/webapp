import React from 'react';
import Icon from '../../../components/AppIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const RARITY_COLORS = {
  comun: '#6B7280',
  raro: '#0891B2',
  epico: '#7C3AED',
  legendario: '#D4A853',
  unico: '#BE185D',
};

const AchievementsAnalytics = ({ stats }) => {
  const kpis = [
    { label: 'Logros activos', value: stats?.activeCount || '0', sub: `de ${stats?.totalCount || 0} disponibles`, icon: 'Trophy', color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Desbloqueados este mes', value: stats?.unlockedThisMonth || '0', change: '+18%', icon: 'Unlock', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Clientes con ≥1 logro', value: `${stats?.clientsWithAchievement || 0}%`, sub: 'del total de clientes', icon: 'Users', color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Logro más popular', value: stats?.mostPopular || '—', sub: 'este mes', icon: 'Star', color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  const monthlyData = [
    { month: 'Ene', logros: 89, clientes: 72 },
    { month: 'Feb', logros: 104, clientes: 88 },
    { month: 'Mar', logros: 142, clientes: 115 },
    { month: 'Abr', logros: 98, clientes: 82 },
    { month: 'May', logros: 118, clientes: 96 },
    { month: 'Jun', logros: 127, clientes: 104 },
  ];

  const rarityDistribution = [
    { name: 'Común', value: 180, color: RARITY_COLORS?.comun },
    { name: 'Raro', value: 95, color: RARITY_COLORS?.raro },
    { name: 'Épico', value: 48, color: RARITY_COLORS?.epico },
    { name: 'Legendario', value: 15, color: RARITY_COLORS?.legendario },
    { name: 'Único', value: 4, color: RARITY_COLORS?.unico },
  ];

  const categoryData = [
    { name: 'Visitas', count: 142 },
    { name: 'Gasto', count: 67 },
    { name: 'Antigüedad', count: 89 },
    { name: 'Social', count: 34 },
    { name: 'Lealtad', count: 56 },
    { name: 'Momentos', count: 28 },
    { name: 'Ecosistema', count: 19 },
  ];

  const nearbyClients = [
    { name: 'María García', current: 47, target: 50, remaining: 3, achievement: 'Fan del negocio' },
    { name: 'Carlos López', current: 23, target: 25, remaining: 2, achievement: 'Cliente frecuente' },
    { name: 'Ana Martínez', current: 96, target: 100, remaining: 4, achievement: 'Centenario' },
    { name: 'Luis Hernández', current: 8, target: 10, remaining: 2, achievement: 'Primera decena' },
    { name: 'Sofia Torres', current: 21, target: 25, remaining: 4, achievement: 'Cliente frecuente' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis?.map((kpi, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className={`w-10 h-10 ${kpi?.bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon name={kpi?.icon} size={20} className={kpi?.color} />
            </div>
            <p className="text-xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>{kpi?.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi?.label}</p>
            {kpi?.change && <p className="text-xs text-emerald-600 font-medium mt-1">{kpi?.change} vs mes anterior</p>}
            {kpi?.sub && <p className="text-xs text-muted-foreground mt-0.5">{kpi?.sub}</p>}
          </div>
        ))}
      </div>
      {/* Monthly chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Logros desbloqueados por mes</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="logros" name="Logros desbloqueados" fill="#7C3AED" radius={[4, 4, 0, 0]} />
            <Bar dataKey="clientes" name="Clientes únicos" fill="#C4B5FD" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rarity distribution */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Distribución por rareza</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={rarityDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value">
                {rarityDistribution?.map((entry, i) => (
                  <Cell key={i} fill={entry?.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} clientes`]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category distribution */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Logros por categoría</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={70} />
              <Tooltip />
              <Bar dataKey="count" name="Desbloqueados" fill="#0891B2" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Clients near next achievement */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
          <Icon name="Target" size={16} className="text-amber-500" />
          Clientes cerca de su próximo logro
        </h3>
        <div className="space-y-3">
          {nearbyClients?.map((c, i) => (
            <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{c?.name}</p>
                  <p className="text-xs text-muted-foreground">{c?.achievement}</p>
                </div>
                <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  {c?.remaining} más
                </span>
              </div>
              <div className="w-full bg-amber-100 rounded-full h-1.5">
                <div
                  className="bg-amber-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${(c?.current / c?.target) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{c?.current}/{c?.target}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AchievementsAnalytics;
