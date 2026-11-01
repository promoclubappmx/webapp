import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { LineChart, Line, BarChart, Bar, Funnel, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// ─── Conversion Funnel ───────────────────────────────────────────────────────
const ConversionFunnel = ({ data }) => {
  const steps = [
    { key: 'impressions', label: 'Impresiones', icon: 'Eye', color: '#6366f1' },
    { key: 'clicks', label: 'Clicks', icon: 'MousePointer', color: '#3b82f6' },
    { key: 'redemptions', label: 'Canjes', icon: 'Tag', color: '#10b981' },
    { key: 'visits', label: 'Visitas', icon: 'MapPin', color: '#f59e0b' },
    { key: 'revenue', label: 'Revenue', icon: 'DollarSign', color: '#ef4444' },
  ];

  const values = [
    data?.impressions || 45200,
    data?.clicks || 8340,
    data?.redemptions || 2180,
    data?.visits || 1640,
    data?.revenue || 1120,
  ];

  const maxVal = values?.[0] || 1;

  return (
    <div className="bg-muted/50 rounded-xl p-6">
      <h3 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
        <Icon name="Filter" size={18} className="text-primary" />
        Funnel de Conversión
      </h3>
      <div className="space-y-3">
        {steps?.map((step, i) => {
          const val = values?.[i];
          const prev = values?.[i - 1];
          const pct = maxVal > 0 ? ((val / maxVal) * 100)?.toFixed(1) : 0;
          const dropPct = prev ? (((prev - val) / prev) * 100)?.toFixed(1) : null;
          const barWidth = maxVal > 0 ? (val / maxVal) * 100 : 0;
          return (
            <div key={step?.key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: step?.color + '20' }}>
                    <Icon name={step?.icon} size={14} style={{ color: step?.color }} />
                  </div>
                  <span className="text-sm font-medium text-foreground">{step?.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  {dropPct && (
                    <span className="text-xs text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                      -{dropPct}%
                    </span>
                  )}
                  <span className="text-sm font-bold text-foreground">{val?.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground w-12 text-right">{pct}%</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${barWidth}%`, backgroundColor: step?.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">CTR</p>
          <p className="text-lg font-bold text-primary">{((values?.[1] / values?.[0]) * 100)?.toFixed(1)}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Tasa Canje</p>
          <p className="text-lg font-bold text-success">{((values?.[2] / values?.[1]) * 100)?.toFixed(1)}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Costo/Conv.</p>
          <p className="text-lg font-bold text-warning">${ data?.spent ? (data?.spent / values?.[2])?.toFixed(0) : '18' } MXN</p>
        </div>
      </div>
    </div>
  );
};

// ─── A/B Winner Analysis ─────────────────────────────────────────────────────
const ABWinnerAnalysis = ({ campaign }) => {
  const variants = [
    {
      id: 'A', label: 'Variante A',
      openRate: 22.4, redemptionRate: 8.1, visitRate: 5.3,
      revenue: 12400, costPerConversion: 24.5, users: 1200,
    },
    {
      id: 'B', label: 'Variante B',
      openRate: 31.7, redemptionRate: 14.8, visitRate: 9.6,
      revenue: 21800, costPerConversion: 16.2, users: 1200,
    },
  ];

  const winner = variants?.reduce((best, v) =>
    v?.redemptionRate > best?.redemptionRate ? v : best, variants?.[0]);

  const metrics = [
    { key: 'openRate', label: 'Tasa Apertura', unit: '%', icon: 'Mail', higherIsBetter: true },
    { key: 'redemptionRate', label: 'Tasa Canje', unit: '%', icon: 'Tag', higherIsBetter: true },
    { key: 'visitRate', label: 'Tasa Visita', unit: '%', icon: 'MapPin', higherIsBetter: true },
    { key: 'revenue', label: 'Revenue', unit: ' MXN', icon: 'DollarSign', higherIsBetter: true, format: (v) => `$${v?.toLocaleString()}` },
    { key: 'costPerConversion', label: 'Costo/Conv.', unit: ' MXN', icon: 'TrendingDown', higherIsBetter: false, format: (v) => `$${v}` },
  ];

  const chartData = metrics?.slice(0, 3)?.map(m => ({
    name: m?.label,
    A: variants?.[0]?.[m?.key],
    B: variants?.[1]?.[m?.key],
  }));

  return (
    <div className="bg-muted/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Icon name="GitBranch" size={18} className="text-primary" />
          Análisis A/B Testing
        </h3>
        <div className="flex items-center gap-2 bg-success/10 text-success px-3 py-1.5 rounded-full">
          <Icon name="Trophy" size={14} />
          <span className="text-xs font-semibold">Ganador: Variante {winner?.id}</span>
        </div>
      </div>
      {/* Recommendation */}
      <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-5">
        <div className="flex items-start gap-3">
          <Icon name="Lightbulb" size={18} className="text-success mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Recomendación Automática</p>
            <p className="text-sm text-muted-foreground mt-1">
              La Variante B tuvo <strong className="text-foreground">{(variants?.[1]?.redemptionRate / variants?.[0]?.redemptionRate)?.toFixed(1)}x más canjes</strong> que la A
              y un costo por conversión {((1 - variants?.[1]?.costPerConversion / variants?.[0]?.costPerConversion) * 100)?.toFixed(0)}% menor.
              ¿Deseas enviar la Variante B al resto de la audiencia?
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" className="text-xs">Enviar Variante B al resto</Button>
              <Button size="sm" variant="outline" className="text-xs">Guardar como aprendizaje</Button>
            </div>
          </div>
        </div>
      </div>
      {/* Metrics comparison table */}
      <div className="overflow-x-auto mb-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-muted-foreground font-medium">Métrica</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Variante A</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Variante B</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Delta</th>
            </tr>
          </thead>
          <tbody>
            {metrics?.map(m => {
              const vA = variants?.[0]?.[m?.key];
              const vB = variants?.[1]?.[m?.key];
              const delta = ((vB - vA) / vA * 100)?.toFixed(1);
              const bWins = m?.higherIsBetter ? vB > vA : vB < vA;
              const fmt = m?.format || ((v) => `${v}${m?.unit}`);
              return (
                <tr key={m?.key} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <Icon name={m?.icon} size={14} className="text-muted-foreground" />
                      <span className="text-foreground">{m?.label}</span>
                    </div>
                  </td>
                  <td className="text-center py-2.5 font-medium text-foreground">{fmt(vA)}</td>
                  <td className={`text-center py-2.5 font-bold ${bWins ? 'text-success' : 'text-foreground'}`}>
                    {fmt(vB)}
                    {bWins && <Icon name="Crown" size={12} className="inline ml-1 text-warning" />}
                  </td>
                  <td className="text-center py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      bWins ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                    }`}>
                      {delta > 0 ? '+' : ''}{delta}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Bar chart */}
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" fontSize={11} stroke="#64748B" />
            <YAxis fontSize={11} stroke="#64748B" />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="A" fill="#94a3b8" radius={[4,4,0,0]} name="Variante A" />
            <Bar dataKey="B" fill="#10b981" radius={[4,4,0,0]} name="Variante B" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ─── Control Group Impact ─────────────────────────────────────────────────────
const ControlGroupImpact = ({ campaign }) => {
  const data = [
    { week: 'Sem 1', campaign: 12, control: 8 },
    { week: 'Sem 2', campaign: 18, control: 9 },
    { week: 'Sem 3', campaign: 24, control: 10 },
    { week: 'Sem 4', campaign: 31, control: 11 },
  ];

  const campaignVisits = 1640;
  const controlVisits = 380;
  const controlPct = 15; // % of audience in control
  const campaignAudiencePct = 100 - controlPct;
  // Normalize control to same audience size
  const controlNormalized = Math.round(controlVisits * (campaignAudiencePct / controlPct));
  const incrementalVisits = campaignVisits - controlNormalized;
  const incrementalRevenue = incrementalVisits * 185; // avg ticket
  const campaignCost = campaign?.spent || 3200;
  const trueROI = campaignCost > 0 ? (((incrementalRevenue - campaignCost) / campaignCost) * 100)?.toFixed(0) : 0;
  const liftPct = controlNormalized > 0 ? (((campaignVisits - controlNormalized) / controlNormalized) * 100)?.toFixed(0) : 0;

  return (
    <div className="bg-muted/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Icon name="Users" size={18} className="text-primary" />
          Impacto del Grupo de Control
        </h3>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">Con medición de impacto</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Visitas Incrementales</p>
          <p className="text-2xl font-bold text-success">+{incrementalVisits?.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">vs. comportamiento orgánico</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Revenue Incremental</p>
          <p className="text-2xl font-bold text-success">${(incrementalRevenue / 1000)?.toFixed(1)}K</p>
          <p className="text-xs text-muted-foreground mt-1">atribuible a la campaña</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Lift de Campaña</p>
          <p className="text-2xl font-bold text-primary">+{liftPct}%</p>
          <p className="text-xs text-muted-foreground mt-1">campaña vs. control</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">ROI Real</p>
          <p className="text-2xl font-bold text-warning">{trueROI}%</p>
          <p className="text-xs text-muted-foreground mt-1">sobre visitas incrementales</p>
        </div>
      </div>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="week" fontSize={11} stroke="#64748B" />
            <YAxis fontSize={11} stroke="#64748B" />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line type="monotone" dataKey="campaign" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} name="Grupo Campaña" />
            <Line type="monotone" dataKey="control" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="Grupo Control" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 bg-muted/80 rounded-lg p-3 flex items-start gap-2">
        <Icon name="Info" size={14} className="text-muted-foreground mt-0.5" />
        <p className="text-xs text-muted-foreground">
          El grupo de control ({controlPct}% de la audiencia) no recibió ninguna comunicación.
          Las visitas incrementales representan el impacto real de la campaña, excluyendo el comportamiento orgánico.
        </p>
      </div>
    </div>
  );
};

// ─── Converted Users Table ────────────────────────────────────────────────────
const ConvertedUsersTable = () => {
  const users = [
    { name: 'Ana García', date: '2024-07-12', step: 'Cupón canjeado', value: '$340 MXN', type: 'Recuperado' },
    { name: 'Luis Martínez', date: '2024-07-11', step: 'Primera visita', value: '$180 MXN', type: 'Nuevo' },
    { name: 'María López', date: '2024-07-11', step: 'Push abierto', value: '$520 MXN', type: 'Recurrente' },
    { name: 'Carlos Ruiz', date: '2024-07-10', step: 'Email click', value: '$290 MXN', type: 'Recuperado' },
    { name: 'Sofia Torres', date: '2024-07-10', step: 'Cupón canjeado', value: '$410 MXN', type: 'Nuevo' },
  ];

  const typeColors = {
    Nuevo: 'bg-blue-100 text-blue-700',
    Recuperado: 'bg-amber-100 text-amber-700',
    Recurrente: 'bg-green-100 text-green-700',
  };

  return (
    <div className="bg-muted/50 rounded-xl p-6">
      <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
        <Icon name="UserCheck" size={18} className="text-primary" />
        Usuarios Convertidos
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-muted-foreground font-medium">Usuario</th>
              <th className="text-left py-2 text-muted-foreground font-medium">Fecha</th>
              <th className="text-left py-2 text-muted-foreground font-medium">Paso de conversión</th>
              <th className="text-right py-2 text-muted-foreground font-medium">Valor</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{u?.name?.[0]}</span>
                    </div>
                    <span className="font-medium text-foreground">{u?.name}</span>
                  </div>
                </td>
                <td className="py-2.5 text-muted-foreground">{u?.date}</td>
                <td className="py-2.5 text-foreground">{u?.step}</td>
                <td className="py-2.5 text-right font-semibold text-success">{u?.value}</td>
                <td className="py-2.5 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors?.[u?.type]}`}>{u?.type}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Export helpers ───────────────────────────────────────────────────────────
const exportCSV = (campaign) => {
  const rows = [
    ['Métrica', 'Valor'],
    ['Nombre', campaign?.name || ''],
    ['Estado', campaign?.status || ''],
    ['Impresiones', campaign?.metrics?.impressions || 45200],
    ['Clicks', campaign?.metrics?.clicks || 8340],
    ['Canjes', 2180],
    ['Visitas', 1640],
    ['Revenue (MXN)', 207600],
    ['CTR', '18.5%'],
    ['Tasa Canje', '26.1%'],
    ['ROI', '2.8x'],
    ['Visitas Incrementales', 1260],
    ['Revenue Incremental (MXN)', 233100],
    ['Lift vs Control', '+40%'],
  ];
  const csv = rows?.map(r => r?.join(','))?.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${campaign?.name || 'campaña'}_analytics.csv`;
  a?.click();
  URL.revokeObjectURL(url);
};

const exportPDF = (campaign) => {
  const content = `
RESUMEN DE PERFORMANCE — ${campaign?.name || 'Campaña'}
${'='?.repeat(50)}

FECHA DE REPORTE: ${new Date()?.toLocaleDateString('es-MX')}

FUNNEL DE CONVERSIÓN
  Impresiones:  45,200
  Clicks:        8,340  (CTR: 18.5%)
  Canjes:        2,180  (Tasa: 26.1%)
  Visitas:       1,640  (Tasa: 75.2%)
  Revenue:   $207,600 MXN

A/B TESTING — GANADOR: VARIANTE B
  Tasa Apertura  A: 22.4%  B: 31.7%  (+41.5%)
  Tasa Canje     A:  8.1%  B: 14.8%  (+82.7%)
  Tasa Visita    A:  5.3%  B:  9.6%  (+81.1%)
  Costo/Conv.    A: $24.5  B: $16.2  (-33.9%)

GRUPO DE CONTROL (15% audiencia)
  Visitas Incrementales:  +1,260
  Revenue Incremental:  $233,100 MXN
  Lift vs Control:         +40%
  ROI Real:               +6,184%

PRESUPUESTO
  Invertido: $${campaign?.spent?.toLocaleString() || '3,200'} MXN
  ROI:       ${campaign?.metrics?.roi || 2.8}x
`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${campaign?.name || 'campaña'}_reporte.txt`;
  a?.click();
  URL.revokeObjectURL(url);
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CampaignAnalytics = ({ campaign, onClose }) => {
  const [activeTab, setActiveTab] = useState('funnel');

  const tabs = [
    { id: 'funnel', label: 'Funnel', icon: 'Filter' },
    { id: 'ab', label: 'A/B Testing', icon: 'GitBranch' },
    { id: 'control', label: 'Grupo Control', icon: 'Users' },
    { id: 'users', label: 'Convertidos', icon: 'UserCheck' },
  ];

  const kpis = [
    { label: 'Impresiones', value: (campaign?.metrics?.impressions || 45200)?.toLocaleString(), icon: 'Eye', color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Clicks', value: (campaign?.metrics?.clicks || 8340)?.toLocaleString(), icon: 'MousePointer', color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Canjes', value: '2,180', icon: 'Tag', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Visitas', value: '1,640', icon: 'MapPin', color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Revenue', value: '$207.6K', icon: 'DollarSign', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'ROI', value: `${campaign?.metrics?.roi || 2.8}x`, icon: 'TrendingUp', color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold text-foreground">{campaign?.name}</h2>
            <p className="text-sm text-muted-foreground">Analytics de Campaña</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" iconName="FileText" iconSize={14} onClick={() => exportPDF(campaign)}>
              PDF
            </Button>
            <Button size="sm" variant="outline" iconName="Download" iconSize={14} onClick={() => exportCSV(campaign)}>
              CSV
            </Button>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors ml-1">
              <Icon name="X" size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {kpis?.map((k, i) => (
              <div key={i} className="bg-muted/50 rounded-lg p-3 text-center">
                <div className={`w-8 h-8 ${k?.bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                  <Icon name={k?.icon} size={16} className={k?.color} />
                </div>
                <p className="text-xs text-muted-foreground">{k?.label}</p>
                <p className="text-base font-bold text-foreground">{k?.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
            {tabs?.map(t => (
              <button
                key={t?.id}
                onClick={() => setActiveTab(t?.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  activeTab === t?.id
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={t?.icon} size={14} />
                {t?.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'funnel' && <ConversionFunnel data={campaign?.metrics} />}
          {activeTab === 'ab' && <ABWinnerAnalysis campaign={campaign} />}
          {activeTab === 'control' && <ControlGroupImpact campaign={campaign} />}
          {activeTab === 'users' && <ConvertedUsersTable />}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex items-center justify-between bg-card rounded-b-xl">
          <p className="text-xs text-muted-foreground">Datos actualizados: {new Date()?.toLocaleDateString('es-MX')}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cerrar</Button>
            <Button size="sm" iconName="Download" iconSize={14} onClick={() => exportCSV(campaign)}>Exportar CSV</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignAnalytics;