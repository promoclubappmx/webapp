import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, LineChart, Line, Cell, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import { fetchAtribucionData } from '../../../services/analyticsService';

const funnelColors = ['#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#1A3FE0'];
const fuenteChips = ['Todas las fuentes', 'Cupones', 'Promociones', 'Geofencing', 'Push', 'Order Ahead'];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ h = 'h-40' }) => (
  <div className={`${h} bg-[#F7F8FC] rounded-xl animate-pulse`} />
);

const TabAtribucion = ({ period = 'month', businessId }) => {
  const [selectedFuente, setSelectedFuente] = useState('Todas las fuentes');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerStep, setDrawerStep] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) { setLoading(false); return; }
    setLoading(true);
    fetchAtribucionData(businessId, period)?.then(result => {
      setData(result);
      setLoading(false);
    });
  }, [businessId, period]);

  const handleFunnelClick = (step) => {
    setDrawerStep(step);
    setDrawerOpen(true);
  };

  const funnelData = data?.funnelData || [
    { name: 'Impresiones', value: 0, pct: 100 },
    { name: 'Click / interacción', value: 0, pct: 0 },
    { name: 'Visita verificada', value: 0, pct: 0 },
    { name: 'Canje completado', value: 0, pct: 0 },
    { name: 'Segunda visita', value: 0, pct: 0 },
  ];

  const toolROIData = data?.toolROIData || [];
  const cacCrcData = data?.cacCrcData || [];

  const maxFunnelVal = Math.max(...funnelData?.map(f => f?.value), 1);

  // Find biggest drop in funnel
  let biggestDropStep = null;
  let biggestDrop = 0;
  for (let i = 1; i < funnelData?.length; i++) {
    const drop = 100 - (funnelData?.[i]?.pct || 0);
    if (drop > biggestDrop) {
      biggestDrop = drop;
      biggestDropStep = funnelData?.[i]?.name;
    }
  }

  return (
    <div className="space-y-6">
      {/* Funnel */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">Funnel de atribución completa</h3>
        <div className="flex gap-2 mb-4 flex-wrap">
          {fuenteChips?.map(f => (
            <button
              key={f}
              onClick={() => setSelectedFuente(f)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedFuente === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        {loading ? (
          <Skeleton h="h-48" />
        ) : (
          <>
            <div className="space-y-2">
              {funnelData?.map((step, i) => {
                const widthPct = (step?.value / maxFunnelVal) * 100;
                return (
                  <div
                    key={i}
                    className="cursor-pointer group"
                    onClick={() => handleFunnelClick(step)}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm text-muted-foreground w-40 truncate">{step?.name}</span>
                      <span className="text-sm font-bold text-foreground" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {step?.value?.toLocaleString()}
                      </span>
                      {i > 0 && (
                        <span className="text-xs text-muted-foreground">({step?.pct}% del paso anterior)</span>
                      )}
                    </div>
                    <div
                      className="h-10 rounded-lg transition-all group-hover:opacity-80"
                      style={{ width: `${Math.max(widthPct, 4)}%`, background: funnelColors?.[i], minWidth: '60px' }}
                    />
                  </div>
                );
              })}
            </div>
            {biggestDropStep && (
              <div className="mt-4 p-3 rounded-lg flex items-start gap-2" style={{ background: '#EEF2FF' }}>
                <Icon name="Lightbulb" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-primary">
                  Tu mayor pérdida está en <strong>{biggestDropStep}</strong> ({biggestDrop}% drop). Considera reducir la fricción del canje o agregar recordatorio push.
                </p>
              </div>
            )}
            {!biggestDropStep && funnelData?.[0]?.value === 0 && (
              <div className="mt-4 p-3 rounded-lg flex items-start gap-2" style={{ background: '#F7F8FC' }}>
                <Icon name="Info" size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">Sin datos de atribución para el período seleccionado.</p>
              </div>
            )}
          </>
        )}
      </div>
      {/* ROI por herramienta */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">ROI por tipo de herramienta</h3>
        {loading ? (
          <Skeleton h="h-64" />
        ) : toolROIData?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Icon name="BarChart2" size={32} className="text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Sin datos de ROI para el período seleccionado.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {toolROIData?.map((tool, i) => (
                <div key={i} className="border border-border rounded-xl p-4 relative">
                  {tool?.badge === 'mejor' && (
                    <span className="absolute top-3 right-3 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Mejor ROI</span>
                  )}
                  {tool?.badge === 'revisar' && (
                    <span className="absolute top-3 right-3 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">Revisar</span>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name={tool?.icon} size={16} className="text-primary" />
                    </div>
                    <span className="font-semibold text-foreground text-sm">{tool?.tool}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Inversión</span>
                      <span className="font-medium">${tool?.inversion?.toLocaleString()} MXN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Visitas atribuidas</span>
                      <span className="font-medium">{tool?.visitas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ROI</span>
                      <span className={`font-bold ${tool?.roi > 100 ? 'text-green-600' : 'text-red-500'}`}>{tool?.roi}%</span>
                    </div>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${tool?.roi > 100 ? 'bg-primary' : 'bg-red-400'}`}
                      style={{ width: `${Math.min(tool?.roi / 10, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={toolROIData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="tool" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v}%`, 'ROI']} />
                <ReferenceLine y={100} stroke="#F59E0B" strokeDasharray="4 2" label={{ value: 'Equilibrio 100%', position: 'right', fontSize: 11, fill: '#F59E0B' }} />
                <Bar dataKey="roi" radius={[4, 4, 0, 0]}>
                  {toolROIData?.map((entry, index) => (
                    <Cell key={index} fill={entry?.roi > 100 ? '#1A3FE0' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
      {/* CAC vs CRC */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">Costo de adquisición vs retención</h3>
        {loading ? (
          <Skeleton h="h-64" />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="text-center p-4 border border-border rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Costo de Adquisición (CAC)</p>
                <p className="text-xs text-muted-foreground mb-3">Inversión total en promos de adquisición / Nuevos clientes del período</p>
                <p className="text-4xl font-bold text-foreground" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  ${cacCrcData?.[cacCrcData?.length - 1]?.cac?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">MXN por cliente nuevo</p>
              </div>
              <div className="text-center p-4 border border-border rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Costo de Retención (CRC)</p>
                <p className="text-xs text-muted-foreground mb-3">Inversión total en promos de retención / Clientes retenidos del período</p>
                <p className="text-4xl font-bold text-foreground" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  ${cacCrcData?.[cacCrcData?.length - 1]?.crc?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">MXN por cliente retenido</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center mb-6">
              <p className="text-sm font-semibold text-primary">Retener un cliente cuesta menos que adquirir uno nuevo.</p>
              <p className="text-xs text-muted-foreground mt-1">PromoClub recomienda balancear tu presupuesto: 30% adquisición · 70% retención.</p>
            </div>
            {cacCrcData?.length > 0 && (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={cacCrcData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v, n) => [`$${v} MXN`, n === 'cac' ? 'CAC' : 'CRC']} />
                  <Line type="monotone" dataKey="cac" stroke="#1A3FE0" strokeWidth={2.5} dot={{ r: 4 }} name="cac" />
                  <Line type="monotone" dataKey="crc" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} name="crc" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </>
        )}
      </div>
      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="relative bg-card w-80 h-full shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-foreground">{drawerStep?.name}</h4>
              <button onClick={() => setDrawerOpen(false)} className="p-1 hover:bg-muted rounded-lg">
                <Icon name="X" size={18} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{drawerStep?.value?.toLocaleString()} clientes en este paso</p>
            <div className="flex flex-col items-center justify-center py-8">
              <Icon name="Users" size={32} className="text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground text-center">
                {drawerStep?.value > 0
                  ? `${drawerStep?.value?.toLocaleString()} registros en este paso del funnel.`
                  : 'Sin datos para este paso del funnel.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabAtribucion;
