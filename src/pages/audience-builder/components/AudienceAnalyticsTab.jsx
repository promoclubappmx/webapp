import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

const usageData = [
  { mes: 'Ene', usos: 4, conversion: 18 },
  { mes: 'Feb', usos: 7, conversion: 22 },
  { mes: 'Mar', usos: 5, conversion: 19 },
  { mes: 'Abr', usos: 9, conversion: 28 },
  { mes: 'May', usos: 12, conversion: 31 },
  { mes: 'Jun', usos: 8, conversion: 26 },
];

const categoryData = [
  { name: 'Retención', value: 38 },
  { name: 'Lealtad', value: 27 },
  { name: 'Campañas', value: 18 },
  { name: 'Adquisición', value: 12 },
  { name: 'Personalizadas', value: 5 },
];

const topTemplates = [
  { name: 'VIPs dormidos con puntos', usos: 14, apertura: 52.1, conversion: 31.4, categoria: 'Retención' },
  { name: 'Cumpleaños próximos', usos: 11, apertura: 67.3, conversion: 44.2, categoria: 'Campañas' },
  { name: 'Candidatos a subir nivel', usos: 9, apertura: 41.7, conversion: 22.8, categoria: 'Lealtad' },
  { name: 'Máximo potencial conversión', usos: 8, apertura: 48.3, conversion: 27.1, categoria: 'Lealtad' },
  { name: 'Clientes a punto de dormirse', usos: 6, apertura: 34.5, conversion: 18.2, categoria: 'Retención' },
];

const KPICard = ({ label, value, sub, icon, color, trend }) => (
  <div className="bg-card border border-border rounded-xl p-5">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon name={icon} size={20} />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-medium flex items-center gap-1 ${trend >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
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

const AudienceAnalyticsTab = () => {
  const [period, setPeriod] = useState('6m');

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Analytics de Audiencias</h2>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {['1m', '3m', '6m', '1a']?.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                period === p ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Plantillas creadas" value="12" sub="Activas en uso" icon="LayoutTemplate" color="text-indigo-600 bg-indigo-50" trend={20} />
        <KPICard label="Usos totales" value="53" sub="Últimos 6 meses" icon="Play" color="text-amber-600 bg-amber-50" trend={15.3} />
        <KPICard label="Tasa apertura prom." value="43.8%" sub="Promedio de plantillas" icon="Mail" color="text-emerald-600 bg-emerald-50" trend={4.2} />
        <KPICard label="Conversión prom." value="27.1%" sub="Promedio de plantillas" icon="Target" color="text-purple-600 bg-purple-50" trend={8.7} />
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage over time */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon name="BarChart3" size={16} className="text-primary" />
            Usos y conversión por mes
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={usageData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="usos" name="Usos" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="conversion" name="Conversión %" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category distribution */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon name="PieChart" size={16} className="text-primary" />
            Por categoría
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {categoryData?.map((_, i) => <Cell key={i} fill={COLORS?.[i % COLORS?.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {categoryData?.map((item, i) => (
              <div key={item?.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS?.[i % COLORS?.length] }} />
                  <span className="text-muted-foreground">{item?.name}</span>
                </div>
                <span className="font-medium text-foreground">{item?.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Top templates table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Icon name="Trophy" size={16} className="text-amber-500" />
            Plantillas con mejor rendimiento
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3">Plantilla</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Categoría</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Usos</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Apertura</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Conversión</th>
              </tr>
            </thead>
            <tbody>
              {topTemplates?.map((t, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-primary/10 text-primary text-xs rounded-full flex items-center justify-center font-bold">{i + 1}</span>
                      <span className="text-sm font-medium text-foreground">{t?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">{t?.categoria}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-foreground">{t?.usos}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold text-emerald-600">{t?.apertura}%</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold text-primary">{t?.conversion}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: 'Lightbulb', color: 'text-amber-600 bg-amber-50', title: 'Mejor momento', desc: 'Las audiencias de cumpleaños enviadas 3 días antes tienen 67% de apertura vs 41% el mismo día.' },
          { icon: 'TrendingUp', color: 'text-emerald-600 bg-emerald-50', title: 'Segmento estrella', desc: 'Los clientes VIP dormidos con puntos tienen la mayor tasa de conversión (31.4%) de todas tus plantillas.' },
          { icon: 'AlertCircle', color: 'text-blue-600 bg-blue-50', title: 'Oportunidad', desc: '38 clientes están a 1-2 visitas de subir de Bronce a Plata. Activa la plantilla de empujón ahora.' },
        ]?.map((insight, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${insight?.color}`}>
              <Icon name={insight?.icon} size={18} />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">{insight?.title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{insight?.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AudienceAnalyticsTab;
