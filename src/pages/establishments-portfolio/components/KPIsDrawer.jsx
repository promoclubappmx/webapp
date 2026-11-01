import React from 'react';
import Icon from '../../../components/AppIcon';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const KPIsDrawer = ({ establishment, onClose }) => {
  if (!establishment) return null;

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const sparkData = (establishment?.kpis?.visitsWeek || [])?.map((v, i) => ({ day: weekDays?.[i], visits: v }));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card w-full max-w-md h-full shadow-2xl overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: establishment?.logoColor }}
            >
              {establishment?.initial}
            </div>
            <div>
              <h3 className="font-bold text-foreground">{establishment?.name}</h3>
              <p className="text-xs text-muted-foreground">Dashboard ejecutivo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5 flex-1">
          {/* Visits chart */}
          <div className="bg-muted/30 rounded-xl p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Visitas esta semana</p>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={sparkData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(v) => [v, 'Visitas']}
                />
                <Bar dataKey="visits" fill={establishment?.logoColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* KPI grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Visitas este mes', value: (establishment?.kpis?.visitsMonth || 0)?.toLocaleString(), icon: 'Users' },
              { label: 'Revenue estimado', value: `$${(establishment?.kpis?.revenueMonth || 0)?.toLocaleString()} MXN`, icon: 'TrendingUp' },
              { label: 'Clientes nuevos', value: (establishment?.kpis?.newCustomers || 0)?.toLocaleString(), icon: 'UserPlus' },
              { label: 'Clientes dormidos', value: (establishment?.kpis?.dormantCustomers || 0)?.toLocaleString(), icon: 'UserMinus' },
            ]?.map((kpi, i) => (
              <div key={i} className="bg-muted/30 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name={kpi?.icon} size={14} className="text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{kpi?.label}</p>
                </div>
                <p className="text-lg font-bold text-foreground">{kpi?.value}</p>
              </div>
            ))}
          </div>

          {/* Top promo */}
          {establishment?.kpis?.topPromo && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Top promo activa</p>
              <p className="text-sm font-semibold text-foreground">{establishment?.kpis?.topPromo}</p>
            </div>
          )}

          {/* Profile score */}
          <div className="bg-muted/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Score de completitud de ficha</p>
              <span className="text-sm font-bold text-foreground">{establishment?.kpis?.profileScore || 0}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${establishment?.kpis?.profileScore || 0}%`,
                  backgroundColor: (establishment?.kpis?.profileScore || 0) >= 80 ? '#22c55e' : (establishment?.kpis?.profileScore || 0) >= 50 ? '#f59e0b' : '#ef4444'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPIsDrawer;
