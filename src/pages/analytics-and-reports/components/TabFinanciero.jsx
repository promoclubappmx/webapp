import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import Icon from '../../../components/AppIcon';

const pnlData = {
  ingresos: [
    { label: 'Visitas generadas por promos', value: 8500, detail: '42 visitas × $200 ticket promedio' },
    { label: 'Valor visitas recurrentes', value: 12400, detail: '62 visitas recurrentes × $200' },
    { label: 'Order Ahead completado', value: 3200, detail: '16 pedidos × $200 promedio' },
  ],
  inversion: [
    { label: 'Costo descuentos en cupones', value: -1800, detail: '12 cupones × $150 descuento promedio' },
    { label: 'Costo puntos emitidos', value: -2100, detail: '10,500 puntos × $0.20 por punto' },
    { label: 'Costo promos activas', value: -1200, detail: '3 promos × $400 costo estimado' },
    { label: 'Fee membresías PromoClub', value: -840, detail: '47 suscriptores × $17.87 fee' },
    { label: 'Boosts y visibilidad pagados', value: -600, detail: '2 boosts activos' },
  ],
};

const donutData = [
  { name: 'Cupones', value: 1800, color: '#1A3FE0' },
  { name: 'Puntos', value: 2100, color: '#3B82F6' },
  { name: 'Promos', value: 1200, color: '#60A5FA' },
  { name: 'Membresías', value: 840, color: '#93C5FD' },
  { name: 'Boosts', value: 600, color: '#BFDBFE' },
];

const netMensual = [
  { mes: 'Oct', neto: 12400 },
  { mes: 'Nov', neto: 13800 },
  { mes: 'Dic', neto: 15200 },
  { mes: 'Ene', neto: 14100 },
  { mes: 'Feb', neto: 16300 },
  { mes: 'Mar', neto: 17560 },
];

const TabFinanciero = () => {
  const [ticketPromedio, setTicketPromedio] = useState(200);
  const [expandedRows, setExpandedRows] = useState({});
  const [presupuesto, setPresupuesto] = useState('');
  const [presupuestoInput, setPresupuestoInput] = useState('');
  const [showPresupuestoInput, setShowPresupuestoInput] = useState(false);

  const totalIngresos = pnlData?.ingresos?.reduce((s, r) => s + r?.value, 0);
  const totalInversion = pnlData?.inversion?.reduce((s, r) => s + r?.value, 0);
  const resultadoNeto = totalIngresos + totalInversion;
  const roi = Math.round((resultadoNeto / Math.abs(totalInversion)) * 100);

  const totalInversionAbs = Math.abs(totalInversion);
  const presupuestoNum = Number(presupuesto);
  const gastoPct = presupuestoNum > 0 ? Math.round((totalInversionAbs / presupuestoNum) * 100) : 0;
  const diasRestantes = 12;
  const proyeccion = presupuestoNum > 0 ? Math.round(totalInversionAbs * (30 / 18)) : 0;

  const toggleRow = (key) => setExpandedRows(p => ({ ...p, [key]: !p?.[key] }));

  return (
    <div className="space-y-6">
      {/* P&L */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
          <h3 className="text-base font-semibold text-foreground">P&L simplificado de marketing</h3>
          <button
            onClick={() => alert('Generando P&L PDF...')}
            className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-muted transition-colors"
          >
            <Icon name="FileText" size={14} />
            Exportar P&L PDF
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Cuánto estás invirtiendo en marketing PromoClub y cuánto está generando. Solo incluye actividad medible dentro de la plataforma.</p>
        <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-muted/50 border border-border">
          <Icon name="Info" size={14} className="text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground">Los ingresos atribuidos se calculan multiplicando las visitas verificadas por tu ticket promedio configurado.</p>
          <div className="flex items-center gap-1 ml-auto border border-border rounded-lg px-2 py-1 bg-background">
            <span className="text-xs text-muted-foreground">Ticket:</span>
            <span className="text-xs text-muted-foreground">$</span>
            <input
              type="number"
              value={ticketPromedio}
              onChange={e => setTicketPromedio(Number(e?.target?.value))}
              className="w-14 text-xs font-semibold text-foreground bg-transparent focus:outline-none"
            />
            <span className="text-xs text-muted-foreground">MXN</span>
          </div>
        </div>

        {/* P&L Table */}
        <div className="space-y-1">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-2 border-b border-border">
            INGRESOS ATRIBUIDOS A PROMOCLUB
          </div>
          {pnlData?.ingresos?.map((row, i) => (
            <div key={i}>
              <div
                className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => toggleRow(`i${i}`)}
              >
                <div className="flex items-center gap-2">
                  <Icon name={expandedRows?.[`i${i}`] ? 'ChevronDown' : 'ChevronRight'} size={14} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">{row?.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-green-600">↑ +8%</span>
                  <span className="text-sm font-semibold text-foreground" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    ${row?.value?.toLocaleString()} MXN
                  </span>
                </div>
              </div>
              {expandedRows?.[`i${i}`] && (
                <div className="ml-8 mb-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">{row?.detail}</div>
              )}
            </div>
          ))}
          <div className="flex justify-between py-2 px-2 border-t border-border font-bold">
            <span className="text-sm text-foreground">SUBTOTAL INGRESOS ATRIBUIDOS</span>
            <span className="text-sm text-green-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>${totalIngresos?.toLocaleString()} MXN</span>
          </div>

          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-2 border-b border-border mt-3">
            INVERSIÓN EN HERRAMIENTAS
          </div>
          {pnlData?.inversion?.map((row, i) => (
            <div key={i}>
              <div
                className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => toggleRow(`inv${i}`)}
              >
                <div className="flex items-center gap-2">
                  <Icon name={expandedRows?.[`inv${i}`] ? 'ChevronDown' : 'ChevronRight'} size={14} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">{row?.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">↔ 0%</span>
                  <span className="text-sm font-semibold text-red-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    (${Math.abs(row?.value)?.toLocaleString()} MXN)
                  </span>
                </div>
              </div>
              {expandedRows?.[`inv${i}`] && (
                <div className="ml-8 mb-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">{row?.detail}</div>
              )}
            </div>
          ))}
          <div className="flex justify-between py-2 px-2 border-t border-border font-bold">
            <span className="text-sm text-foreground">SUBTOTAL INVERSIÓN</span>
            <span className="text-sm text-red-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>(${totalInversionAbs?.toLocaleString()} MXN)</span>
          </div>

          <div className="flex justify-between py-3 px-2 border-t-2 border-foreground mt-2">
            <span className="text-base font-bold text-foreground">RESULTADO NETO DE MARKETING</span>
            <span className="text-base font-bold text-green-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>${resultadoNeto?.toLocaleString()} MXN</span>
          </div>
          <div className="flex justify-between py-1 px-2">
            <span className="text-sm font-bold text-foreground">ROI GENERAL</span>
            <span className="text-sm font-bold text-green-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{roi}%</span>
          </div>
        </div>

        {/* Mini bar chart */}
        <div className="mt-6">
          <p className="text-xs text-muted-foreground mb-2">Resultado neto últimos 6 meses</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={netMensual} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`$${v?.toLocaleString()} MXN`, 'Resultado neto']} />
              <Bar dataKey="neto" fill="#1A3FE0" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Breakdown inversión */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">Breakdown de inversión por herramienta</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={2}>
                  {donutData?.map((entry, index) => (
                    <Cell key={index} fill={entry?.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`$${v?.toLocaleString()} MXN`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">Herramienta</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Inversión</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">ROI</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">%</th>
                </tr>
              </thead>
              <tbody>
                {donutData?.map((row, i) => {
                  const pct = Math.round((row?.value / totalInversionAbs) * 100);
                  return (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm" style={{ background: row?.color }} />
                          <span className="text-foreground">{row?.name}</span>
                        </div>
                      </td>
                      <td className="py-2 text-right font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>${row?.value?.toLocaleString()}</td>
                      <td className="py-2 text-right text-green-600 font-semibold">{[445, 87, 312, 178, 234]?.[i]}%</td>
                      <td className="py-2 text-right text-muted-foreground">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Budget tracker */}
        <div className="mt-4 border-t border-border pt-4">
          {presupuesto ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Presupuesto mensual</span>
                <button onClick={() => setPresupuesto('')} className="text-xs text-muted-foreground hover:text-foreground">Editar</button>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all ${gastoPct > 90 ? 'bg-red-500' : gastoPct > 70 ? 'bg-yellow-500' : 'bg-primary'}`}
                  style={{ width: `${Math.min(gastoPct, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>${totalInversionAbs?.toLocaleString()} MXN de ${Number(presupuesto)?.toLocaleString()} MXN presupuestado · {gastoPct}% usado · Quedan {diasRestantes} días del mes</span>
              </div>
              {proyeccion > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Proyección: A este ritmo cerrarás el mes en ${proyeccion?.toLocaleString()} MXN
                  {proyeccion <= presupuestoNum ? ' (dentro del presupuesto ✓)' : ' (excede el presupuesto ⚠️)'}
                </p>
              )}
            </div>
          ) : (
            <div>
              {!showPresupuestoInput ? (
                <button
                  onClick={() => setShowPresupuestoInput(true)}
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <Icon name="Plus" size={14} />
                  Configurar presupuesto mensual
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Presupuesto mensual: $</span>
                  <input
                    type="number"
                    value={presupuestoInput}
                    onChange={e => setPresupuestoInput(e?.target?.value)}
                    placeholder="12000"
                    className="w-28 text-sm border border-border rounded-lg px-2 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="text-sm text-muted-foreground">MXN</span>
                  <button
                    onClick={() => { setPresupuesto(presupuestoInput); setShowPresupuestoInput(false); }}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
                  >
                    Guardar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabFinanciero;
