import React, { useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Funnel } from 'recharts';
import Icon from '../../../components/AppIcon';

const trendData = [
  { mes: 'Abr', emitidos: 210, canjeados: 38 },
  { mes: 'May', emitidos: 285, canjeados: 52 },
  { mes: 'Jun', emitidos: 320, canjeados: 71 },
  { mes: 'Jul', emitidos: 298, canjeados: 65 },
  { mes: 'Ago', emitidos: 410, canjeados: 89 },
  { mes: 'Sep', emitidos: 375, canjeados: 82 },
  { mes: 'Oct', emitidos: 445, canjeados: 98 },
  { mes: 'Nov', emitidos: 520, canjeados: 115 },
  { mes: 'Dic', emitidos: 680, canjeados: 142 },
  { mes: 'Ene', emitidos: 390, canjeados: 87 },
  { mes: 'Feb', emitidos: 460, canjeados: 102 },
  { mes: 'Mar', emitidos: 510, canjeados: 118 },
];

const funnelData = [
  { name: 'Emitidos', value: 1240, fill: '#2563EB' },
  { name: 'En wallet', value: 980, fill: '#3B82F6' },
  { name: 'Vistos', value: 720, fill: '#60A5FA' },
  { name: 'Canjeados', value: 310, fill: '#93C5FD' },
];

const topCoupons = [
  { name: '20% en tu próxima visita', type: 'percentage', emitted: 340, redeemed: 87, rate: 25.6, revenue: 24650, cost: 4930 },
  { name: '$50 de descuento', type: 'fixed', emitted: 120, redeemed: 34, rate: 28.3, revenue: 8500, cost: 1700 },
  { name: 'Café americano gratis', type: 'free_product', emitted: 200, redeemed: 112, rate: 56.0, revenue: 11200, cost: 2240 },
  { name: '2×1 en smoothies', type: 'bogo', emitted: 80, redeemed: 28, rate: 35.0, revenue: 5600, cost: 1120 },
  { name: 'Acceso zona VIP', type: 'vip_access', emitted: 50, redeemed: 18, rate: 36.0, revenue: 9000, cost: 0 },
];

const allCoupons = [
  { name: '20% en tu próxima visita', type: '% Descuento', status: 'active', emitted: 340, redeemed: 87, rate: 25.6, revenue: 24650, cost: 4930 },
  { name: '$50 de descuento', type: 'Monto fijo', status: 'active', emitted: 120, redeemed: 34, rate: 28.3, revenue: 8500, cost: 1700 },
  { name: 'Café americano gratis', type: 'Producto gratis', status: 'active', emitted: 200, redeemed: 112, rate: 56.0, revenue: 11200, cost: 2240 },
  { name: '2×1 en smoothies', type: '2×1 / 3×2', status: 'scheduled', emitted: 80, redeemed: 28, rate: 35.0, revenue: 5600, cost: 1120 },
  { name: 'Acceso zona VIP', type: 'Acceso VIP', status: 'active', emitted: 50, redeemed: 18, rate: 36.0, revenue: 9000, cost: 0 },
  { name: '15% descuento bienvenida', type: '% Descuento', status: 'expired', emitted: 500, redeemed: 203, rate: 40.6, revenue: 40600, cost: 8120 },
];

const statusCls = {
  active: 'bg-green-100 text-green-700',
  scheduled: 'bg-blue-100 text-blue-700',
  expired: 'bg-red-100 text-red-600',
  paused: 'bg-yellow-100 text-yellow-700',
  draft: 'bg-gray-100 text-gray-600',
};
const statusLabel = { active: 'Activo', scheduled: 'Programado', expired: 'Vencido', paused: 'Pausado', draft: 'Borrador' };

const AnalyticsTab = () => {
  const [expandedCoupon, setExpandedCoupon] = useState(null);
  const [sortBy, setSortBy] = useState('redeemed');
  const [filterStatus, setFilterStatus] = useState('all');

  const totalEmitted = trendData?.reduce((s, d) => s + d?.emitidos, 0);
  const totalRedeemed = trendData?.reduce((s, d) => s + d?.canjeados, 0);
  const globalRate = Math.round((totalRedeemed / totalEmitted) * 100);
  const totalRevenue = allCoupons?.reduce((s, c) => s + c?.revenue, 0);
  const totalCost = allCoupons?.reduce((s, c) => s + c?.cost, 0);
  const activeCoupons = allCoupons?.filter(c => c?.status === 'active')?.reduce((s, c) => s + (c?.emitted - c?.redeemed), 0);

  const gapGrowing = trendData?.slice(-3)?.every((d, i, arr) => i === 0 || (d?.emitidos - d?.canjeados) > (arr?.[i-1]?.emitidos - arr?.[i-1]?.canjeados));

  const filtered = allCoupons?.filter(c => filterStatus === 'all' || c?.status === filterStatus)?.sort((a, b) => b?.[sortBy] - a?.[sortBy]);

  return (
    <div className="space-y-6">
      {/* Gap alert */}
      {gapGrowing && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <Icon name="AlertTriangle" size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">
            Estás emitiendo más cupones de los que se canjean. Revisa si las condiciones son demasiado restrictivas.
          </p>
        </div>
      )}
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Cupones activos en wallets', value: activeCoupons?.toLocaleString(), icon: 'Wallet', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', sub: 'sin canjear ni vencer' },
          { label: 'Tasa de canje global', value: `${globalRate}%`, icon: 'Percent', color: 'text-green-600', bg: 'bg-green-50 border-green-200', sub: 'benchmark: 15-25%' },
          { label: 'Revenue atribuido', value: `$${totalRevenue?.toLocaleString()}`, icon: 'TrendingUp', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', sub: 'MXN estimado' },
          { label: 'Costo de descuentos', value: `$${totalCost?.toLocaleString()}`, icon: 'Tag', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', sub: `ROI: ${Math.round(totalRevenue / totalCost)}x` },
        ]?.map((m, i) => (
          <div key={i} className={`rounded-xl border p-4 ${m?.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{m?.label}</span>
              <Icon name={m?.icon} size={16} className={m?.color} />
            </div>
            <div className={`text-2xl font-bold ${m?.color} mb-0.5`}>{m?.value}</div>
            <div className="text-xs text-muted-foreground">{m?.sub}</div>
          </div>
        ))}
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Funnel */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Embudo de conversión</h3>
          <div className="space-y-2">
            {funnelData?.map((step, i) => {
              const pct = Math.round((step?.value / funnelData?.[0]?.value) * 100);
              const convPct = i > 0 ? Math.round((step?.value / funnelData?.[i-1]?.value) * 100) : 100;
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{step?.name}</span>
                    <span>{step?.value?.toLocaleString()} {i > 0 && <span className="text-muted-foreground">({convPct}%)</span>}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-6 overflow-hidden">
                    <div
                      className="h-6 rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${pct}%`, backgroundColor: step?.fill }}
                    >
                      <span className="text-white text-xs font-medium">{pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trend */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Tendencia 12 meses</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="mes" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="emitidos" stroke="#2563EB" strokeWidth={2} dot={false} name="Emitidos" />
                <Line type="monotone" dataKey="canjeados" stroke="#059669" strokeWidth={2} dot={false} name="Canjeados" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-blue-600" /><span className="text-xs text-muted-foreground">Emitidos</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-green-600" /><span className="text-xs text-muted-foreground">Canjeados</span></div>
          </div>
        </div>
      </div>
      {/* Top 5 */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Top 5 cupones por canjes</h3>
        <div className="space-y-3">
          {topCoupons?.map((c, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-muted text-muted-foreground'
              }`}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground truncate">{c?.name}</span>
                  <span className="text-sm font-bold text-primary ml-2 flex-shrink-0">{c?.redeemed} canjes</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-primary" style={{ width: `${c?.rate}%` }} />
                </div>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0 w-12 text-right">{c?.rate}%</span>
            </div>
          ))}
        </div>
      </div>
      {/* Detailed table */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Todos los cupones</h3>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e?.target?.value)}
              className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background text-foreground focus:outline-none"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="expired">Vencidos</option>
              <option value="scheduled">Programados</option>
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e?.target?.value)}
              className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background text-foreground focus:outline-none"
            >
              <option value="redeemed">Ordenar: Más canjeados</option>
              <option value="rate">Ordenar: Mayor tasa</option>
              <option value="revenue">Ordenar: Mayor revenue</option>
              <option value="emitted">Ordenar: Más emitidos</option>
            </select>
            <button className="flex items-center gap-1.5 text-sm border border-border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors">
              <Icon name="Download" size={14} />
              Exportar
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Cupón', 'Tipo', 'Estado', 'Emitidos', 'Canjeados', 'Tasa', 'Revenue', 'Costo', '']?.map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered?.map((c, i) => (
                <React.Fragment key={i}>
                  <tr
                    className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => setExpandedCoupon(expandedCoupon === i ? null : i)}
                  >
                    <td className="py-2.5 px-3 font-medium text-foreground max-w-[180px] truncate">{c?.name}</td>
                    <td className="py-2.5 px-3 text-muted-foreground text-xs">{c?.type}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusCls?.[c?.status]}`}>
                        {statusLabel?.[c?.status]}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">{c?.emitted}</td>
                    <td className="py-2.5 px-3 font-medium text-foreground">{c?.redeemed}</td>
                    <td className="py-2.5 px-3">
                      <span className={`font-semibold ${
                        c?.rate >= 25 ? 'text-green-600' : c?.rate >= 15 ? 'text-yellow-600' : 'text-red-500'
                      }`}>{c?.rate}%</span>
                    </td>
                    <td className="py-2.5 px-3 text-foreground">${c?.revenue?.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">${c?.cost?.toLocaleString()}</td>
                    <td className="py-2.5 px-3">
                      <Icon name={expandedCoupon === i ? 'ChevronUp' : 'ChevronDown'} size={14} className="text-muted-foreground" />
                    </td>
                  </tr>
                  {expandedCoupon === i && (
                    <tr className="bg-muted/20">
                      <td colSpan={9} className="px-4 py-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-card rounded-lg p-3 border border-border">
                            <div className="text-xs text-muted-foreground mb-1">Canjes por método</div>
                            <div className="space-y-1">
                              {[{ m: 'QR', v: 58 }, { m: 'Código', v: 28 }, { m: 'NFC', v: 14 }]?.map(m => (
                                <div key={m?.m} className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">{m?.m}</span>
                                  <span className="font-medium text-foreground">{m?.v}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="bg-card rounded-lg p-3 border border-border">
                            <div className="text-xs text-muted-foreground mb-1">Horario pico</div>
                            <div className="text-lg font-bold text-foreground">2-5 PM</div>
                            <div className="text-xs text-muted-foreground">Lunes a viernes</div>
                          </div>
                          <div className="bg-card rounded-lg p-3 border border-border">
                            <div className="text-xs text-muted-foreground mb-1">ROI del cupón</div>
                            <div className="text-lg font-bold text-green-600">{Math.round(c?.revenue / (c?.cost || 1))}x</div>
                            <div className="text-xs text-muted-foreground">${c?.revenue?.toLocaleString()} / ${c?.cost?.toLocaleString()}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
