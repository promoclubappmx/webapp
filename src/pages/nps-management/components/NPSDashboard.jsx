import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import Icon from '../../../components/AppIcon';

const sparklineData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  nps: 30 + Math.round(Math.sin(i * 0.4) * 12 + Math.random() * 8),
}));

const trendData = [
  { date: '1 Jun', nps: 38, event: null },
  { date: '5 Jun', nps: 42, event: 'Campaña verano' },
  { date: '10 Jun', nps: 40, event: null },
  { date: '15 Jun', nps: 45, event: null },
  { date: '20 Jun', nps: 43, event: null },
  { date: '25 Jun', nps: 47, event: 'Promo 2x1' },
  { date: '30 Jun', nps: 42, event: null },
];

const responses = [
  { id: 1, name: 'Carlos M.', avatar: 'CM', score: 9, trigger: 'Check-in verificado', date: 'Hace 2 horas', comment: 'Excelente servicio, siempre muy amables.', anonymous: false, level: 'Oro' },
  { id: 2, name: 'Anónimo', avatar: '?', score: 3, trigger: 'Canje: Café gratis', date: 'Hace 4 horas', comment: 'El tiempo de espera fue muy largo.', anonymous: true, level: null },
  { id: 3, name: 'María L.', avatar: 'ML', score: 10, trigger: 'Check-in verificado', date: 'Hace 6 horas', comment: 'Los recomendaría sin dudarlo.', anonymous: false, level: 'Plata' },
  { id: 4, name: 'Roberto G.', avatar: 'RG', score: 7, trigger: 'Post reservación', date: 'Ayer', comment: '', anonymous: false, level: null },
  { id: 5, name: 'Ana P.', avatar: 'AP', score: 2, trigger: 'Order Ahead #042', date: 'Ayer', comment: 'El pedido llegó incompleto y frío.', anonymous: false, level: 'Bronce' },
  { id: 6, name: 'Luis F.', avatar: 'LF', score: 9, trigger: 'Check-in verificado', date: 'Hace 2 días', comment: 'Siempre un placer visitar este lugar.', anonymous: false, level: 'Oro' },
  { id: 7, name: 'Sofía R.', avatar: 'SR', score: 8, trigger: 'Canje: Descuento 20%', date: 'Hace 2 días', comment: '', anonymous: false, level: null },
  { id: 8, name: 'Anónimo', avatar: '?', score: 1, trigger: 'Check-in verificado', date: 'Hace 3 días', comment: 'Pésima atención, no vuelvo.', anonymous: true, level: null },
  { id: 9, name: 'Diego H.', avatar: 'DH', score: 10, trigger: 'Post reservación', date: 'Hace 3 días', comment: 'La mejor experiencia que he tenido.', anonymous: false, level: 'Plata' },
  { id: 10, name: 'Valentina C.', avatar: 'VC', score: 6, trigger: 'Order Ahead #039', date: 'Hace 4 días', comment: 'Podría mejorar la presentación.', anonymous: false, level: null },
];

const getScoreColor = (s) => {
  if (s >= 9) return { text: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Promotor' };
  if (s >= 7) return { text: 'text-amber-600', bg: 'bg-amber-100', label: 'Neutro' };
  return { text: 'text-red-600', bg: 'bg-red-100', label: 'Detractor' };
};

const NPSDashboard = () => {
  const [period, setPeriod] = useState('month');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [triggerFilter, setTriggerFilter] = useState('all');

  const periods = [
    { value: '7d', label: '7 días' },
    { value: 'month', label: 'Este mes' },
    { value: 'prev', label: 'Mes anterior' },
    { value: '3m', label: '3 meses' },
  ];

  const filteredResponses = responses?.filter(r => {
    if (segmentFilter === 'promoters' && r?.score < 9) return false;
    if (segmentFilter === 'neutrals' && (r?.score < 7 || r?.score > 8)) return false;
    if (segmentFilter === 'detractors' && r?.score >= 7) return false;
    return true;
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const point = trendData?.find(d => d?.date === label);
      return (
        <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-sm">
          <p className="font-semibold text-foreground">{label}</p>
          <p className="text-primary font-medium">NPS: {payload?.[0]?.value}</p>
          {point?.event && <p className="text-xs text-muted-foreground mt-1">📌 {point?.event}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Period selector */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground">Dashboard NPS</h2>
        <div className="flex rounded-lg border border-border overflow-hidden">
          {periods?.map(p => (
            <button
              key={p?.value}
              onClick={() => setPeriod(p?.value)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                period === p?.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-muted/50'
              }`}
            >
              {p?.label}
            </button>
          ))}
        </div>
      </div>
      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* NPS actual */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">NPS Actual</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-emerald-600" style={{ fontFamily: 'Outfit, sans-serif' }}>42</span>
            <span className="text-sm font-semibold text-emerald-600 mb-1">+5 ↑</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">vs período anterior</p>
        </div>

        {/* Respuestas */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Respuestas</p>
          <div className="text-4xl font-bold text-foreground mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>234</div>
          <p className="text-xs text-muted-foreground">34% tasa de respuesta</p>
        </div>

        {/* Distribución */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Distribución</p>
          <div className="space-y-1.5">
            <div>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-emerald-600 font-medium">🟢 Promotores</span>
                <span className="font-semibold">62%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '62%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-amber-600 font-medium">🟡 Neutros</span>
                <span className="font-semibold">23%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '23%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-red-600 font-medium">🔴 Detractores</span>
                <span className="font-semibold">15%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '15%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Tendencia 30 días</p>
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={sparklineData}>
              <Line type="monotone" dataKey="nps" stroke="#1A3FE0" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Trend chart */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Tendencia NPS</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
            <YAxis domain={[0, 70]} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={42} stroke="#9CA3AF" strokeDasharray="4 4" label={{ value: 'Promedio', position: 'right', fontSize: 10, fill: '#9CA3AF' }} />
            <Line type="monotone" dataKey="nps" stroke="#1A3FE0" strokeWidth={2.5} dot={{ r: 4, fill: '#1A3FE0' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Individual responses */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-sm font-semibold text-foreground">Respuestas individuales</h3>
          <div className="flex flex-wrap gap-2">
            <select
              value={segmentFilter}
              onChange={e => setSegmentFilter(e?.target?.value)}
              className="text-xs border border-border rounded-lg px-2 py-1.5 bg-card text-foreground focus:outline-none"
            >
              <option value="all">Todos</option>
              <option value="promoters">Promotores</option>
              <option value="neutrals">Neutros</option>
              <option value="detractors">Detractores</option>
            </select>
            <select
              value={triggerFilter}
              onChange={e => setTriggerFilter(e?.target?.value)}
              className="text-xs border border-border rounded-lg px-2 py-1.5 bg-card text-foreground focus:outline-none"
            >
              <option value="all">Todos los triggers</option>
              <option value="checkin">Check-in</option>
              <option value="coupon">Cupón</option>
              <option value="order">Order Ahead</option>
              <option value="reservation">Reservación</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredResponses?.map(r => {
            const sc = getScoreColor(r?.score);
            return (
              <div key={r?.id} className="flex items-start gap-3 p-4 bg-muted/20 rounded-xl border border-border/50">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${sc?.bg} ${sc?.text}`}>
                  {r?.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">{r?.name}</span>
                    {r?.level && (
                      <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">{r?.level}</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc?.bg} ${sc?.text}`}>{sc?.label}</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">{r?.trigger}</span>
                    <span className="text-xs text-muted-foreground">{r?.date}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-2xl font-bold ${sc?.text}`} style={{ fontFamily: 'Outfit, sans-serif' }}>{r?.score}</span>
                    <span className="text-xs text-muted-foreground">/ 10</span>
                  </div>
                  {r?.comment && <p className="text-sm text-muted-foreground">{r?.comment}</p>}
                  {!r?.anonymous && (
                    <button className="mt-1 text-xs text-primary hover:underline flex items-center gap-1">
                      <Icon name="ExternalLink" size={11} />
                      Ver perfil en CRM
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Comments panel */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Icon name="MessageSquare" size={16} className="text-primary" />
            Comentarios de seguimiento
          </h3>
          <button className="flex items-center gap-1.5 text-xs font-medium text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors">
            <Icon name="Download" size={12} />
            Exportar CSV
          </button>
        </div>

        {/* Word cloud mock */}
        <div className="p-4 bg-muted/20 rounded-xl border border-border mb-4 flex flex-wrap gap-2 min-h-[80px] items-center justify-center">
          {[
            { word: 'servicio', size: 'text-xl', color: 'text-blue-600' },
            { word: 'rápido', size: 'text-base', color: 'text-emerald-600' },
            { word: 'espera', size: 'text-lg', color: 'text-red-500' },
            { word: 'amable', size: 'text-xl', color: 'text-blue-500' },
            { word: 'limpio', size: 'text-sm', color: 'text-emerald-500' },
            { word: 'precio', size: 'text-base', color: 'text-amber-600' },
            { word: 'calidad', size: 'text-lg', color: 'text-blue-600' },
            { word: 'recomiendo', size: 'text-xl', color: 'text-emerald-600' },
            { word: 'lento', size: 'text-sm', color: 'text-red-500' },
            { word: 'excelente', size: 'text-2xl', color: 'text-emerald-700' },
            { word: 'mejorar', size: 'text-sm', color: 'text-amber-500' },
            { word: 'frío', size: 'text-xs', color: 'text-red-400' },
          ]?.map((item, i) => (
            <span key={i} className={`font-semibold ${item?.size} ${item?.color}`}>{item?.word}</span>
          ))}
        </div>

        <div className="space-y-2">
          {responses?.filter(r => r?.comment)?.map(r => {
            const sc = getScoreColor(r?.score);
            return (
              <div key={r?.id} className="flex items-start gap-3 p-3 bg-muted/10 rounded-lg">
                <span className={`text-lg font-bold flex-shrink-0 ${sc?.text}`}>{r?.score}</span>
                <p className="text-sm text-foreground">{r?.comment}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NPSDashboard;
