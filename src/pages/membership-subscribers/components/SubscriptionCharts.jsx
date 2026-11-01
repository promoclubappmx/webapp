import React from 'react';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const subscriberData = [
  { month: 'Oct', nuevos: 8, cancelaciones: 1 },
  { month: 'Nov', nuevos: 12, cancelaciones: 2 },
  { month: 'Dic', nuevos: 18, cancelaciones: 1 },
  { month: 'Ene', nuevos: 6, cancelaciones: 3 },
  { month: 'Feb', nuevos: 9, cancelaciones: 2 },
  { month: 'Mar', nuevos: 11, cancelaciones: 1 },
];

const mrrData = [
  { month: 'Oct', mrr: 8200 },
  { month: 'Nov', mrr: 9800 },
  { month: 'Dic', mrr: 11500 },
  { month: 'Ene', mrr: 12100 },
  { month: 'Feb', mrr: 11953 },
  { month: 'Mar', mrr: 14053 },
  { month: 'Abr', mrr: 15200, projected: true },
  { month: 'May', mrr: 16800, projected: true },
  { month: 'Jun', mrr: 18100, projected: true },
];

const planData = [
  { name: 'Mensual', value: 35, color: '#3B82F6' },
  { name: 'Anual', value: 12, color: '#8B5CF6' },
];

const SubscriptionCharts = ({ period, onPeriodChange }) => {
  return (
    <div className="space-y-6">
      {/* Chart 1: Subscriber Evolution */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Evolución de suscriptores</h3>
            <p className="text-xs text-muted-foreground">Nuevos vs cancelaciones</p>
          </div>
          <div className="flex gap-1">
            {['3m', '6m', '1año']?.map(p => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  period === p ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={subscriberData}>
            <defs>
              <linearGradient id="colorNuevos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCancelaciones" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area type="monotone" dataKey="nuevos" stroke="#3B82F6" fill="url(#colorNuevos)" name="Nuevos" strokeWidth={2} />
            <Area type="monotone" dataKey="cancelaciones" stroke="#EF4444" fill="url(#colorCancelaciones)" name="Cancelaciones" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Chart 2: MRR */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">MRR en el tiempo</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Ingresos recurrentes mensuales netos
              <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded font-medium ml-1">Requiere Stripe</span>
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={mrrData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000)?.toFixed(0)}k`} />
            <Tooltip formatter={v => [`$${v?.toLocaleString()} MXN`, 'MRR']} />
            <Line
              type="monotone"
              dataKey="mrr"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 3 }}
              strokeDasharray={(d) => d?.projected ? '5 5' : '0'}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <span className="inline-block w-6 border-t-2 border-dashed border-muted-foreground" />
          Proyección 3 meses basada en tasa de churn actual
        </p>
      </div>
      {/* Chart 3: Plan Distribution */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Distribución de planes</h3>
            <p className="text-xs text-muted-foreground">Mensual vs Anual</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie data={planData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                {planData?.map((entry, index) => (
                  <Cell key={index} fill={entry?.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1">
            {planData?.map((p, i) => (
              <div key={i} className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p?.color }} />
                  <span className="text-sm text-foreground">{p?.name}</span>
                </div>
                <span className="text-sm font-semibold text-foreground font-mono">{p?.value}</span>
              </div>
            ))}
            <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs text-purple-800">
                💡 Los suscriptores anuales tienen <strong>3x menos churn</strong>. Considera promocionar el plan anual.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCharts;
