import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const performanceData = [
  { mes: 'Oct', emitidos: 45, canjeados: 8, recuperados: 6 },
  { mes: 'Nov', emitidos: 62, canjeados: 11, recuperados: 9 },
  { mes: 'Dic', emitidos: 78, canjeados: 15, recuperados: 12 },
  { mes: 'Ene', emitidos: 55, canjeados: 9, recuperados: 7 },
  { mes: 'Feb', emitidos: 91, canjeados: 18, recuperados: 15 },
  { mes: 'Mar', emitidos: 104, canjeados: 22, recuperados: 18 },
];

const recentCoupons = [
  { client: 'María García', days: 24, issued: '2026-02-28', status: 'canjeado', returned: true },
  { client: 'Carlos López', days: 31, issued: '2026-02-25', status: 'vencido', returned: false },
  { client: 'Ana Martínez', days: 19, issued: '2026-03-01', status: 'emitido', returned: false },
  { client: 'Roberto Silva', days: 28, issued: '2026-02-20', status: 'canjeado', returned: true },
  { client: 'Laura Torres', days: 22, issued: '2026-03-03', status: 'emitido', returned: false },
];

const statusCls = {
  emitido: 'bg-blue-100 text-blue-700',
  canjeado: 'bg-green-100 text-green-700',
  vencido: 'bg-red-100 text-red-600',
};

const RecuperacionTab = () => {
  const [configured, setConfigured] = useState(false);
  const [active, setActive] = useState(false);
  const [inactivityDays, setInactivityDays] = useState(21);
  const [benefitType, setBenefitType] = useState('percentage');
  const [benefitValue, setBenefitValue] = useState(20);
  const [couponValidity, setCouponValidity] = useState(7);
  const [channels, setChannels] = useState({ push: true, wallet: true, email: false, whatsapp: false });
  const [message, setMessage] = useState('¡Te extrañamos en {nombre_negocio}! Aquí va un {beneficio} para tu regreso. Válido hasta {fecha_vencimiento}.');
  const [repeatEnabled, setRepeatEnabled] = useState(true);
  const [maxRepeat, setMaxRepeat] = useState(3);
  const [budget, setBudget] = useState('');

  const toggleChannel = (ch) => setChannels(prev => ({ ...prev, [ch]: !prev?.[ch] }));

  const clientsAtRisk = Math.round(inactivityDays * 3.2);

  const totalEmitted = performanceData?.reduce((s, d) => s + d?.emitidos, 0);
  const totalRedeemed = performanceData?.reduce((s, d) => s + d?.canjeados, 0);
  const totalRecovered = performanceData?.reduce((s, d) => s + d?.recuperados, 0);
  const redemptionRate = Math.round((totalRedeemed / totalEmitted) * 100);
  const lowRate = redemptionRate < 10;

  if (!configured) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center max-w-lg mx-auto">
        <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mb-6">
          <Icon name="UserX" size={40} className="text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">Cupón de recuperación</h2>
        <p className="text-muted-foreground mb-4">
          El cupón de recuperación trae de vuelta a clientes que dejaron de visitarte.
          Configúralo una vez y funciona automáticamente.
        </p>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-sm text-orange-800">
          <Icon name="TrendingUp" size={16} className="inline mr-1" />
          Los negocios con cupón de recuperación activo recuperan en promedio <strong>18%</strong> de sus clientes dormidos.
        </div>
        <Button onClick={() => setConfigured(true)} iconName="Settings" iconPosition="left" className="px-8">
          Configurar cupón de recuperación
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Low rate alert */}
      {active && lowRate && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <Icon name="AlertTriangle" size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>Baja tasa de canje ({redemptionRate}%).</strong> Tu cupón de recuperación tiene baja tasa de canje.
            Considera aumentar el descuento o reducir la vigencia para generar más urgencia.
          </div>
        </div>
      )}
      {/* ZONE 1: Configuration */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Configuración</h3>
            <p className="text-sm text-muted-foreground">Se activa automáticamente cuando un cliente cumple el criterio</p>
          </div>
          {/* Main toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">Cupón de recuperación</span>
            <button
              onClick={() => setActive(!active)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                active ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                active ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
            <span className={`text-sm font-semibold ${active ? 'text-green-600' : 'text-muted-foreground'}`}>
              {active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-5">
            {/* Inactivity slider */}
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1">
                Días sin visita para activar: <span className="text-primary">{inactivityDays} días</span>
              </label>
              <input
                type="range" min={7} max={90} value={inactivityDays}
                onChange={e => setInactivityDays(Number(e?.target?.value))}
                className="w-full accent-primary mb-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mb-2"><span>7 días</span><span>90 días</span></div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-800">
                <Icon name="Users" size={14} className="inline mr-1" />
                Actualmente <strong>{clientsAtRisk}</strong> clientes cumplen este criterio
              </div>
              <div className="flex gap-2 mt-2">
                {[{ label: '14 días (agresivo)', val: 14 }, { label: '21 días (recomendado)', val: 21 }, { label: '30 días (conservador)', val: 30 }]?.map(s => (
                  <button
                    key={s?.val}
                    onClick={() => setInactivityDays(s?.val)}
                    className={`text-xs px-2 py-1 rounded-full border transition-all ${
                      inactivityDays === s?.val ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                    }`}
                  >{s?.label}</button>
                ))}
              </div>
            </div>

            {/* Benefit */}
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Beneficio del cupón</label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[{ key: 'percentage', label: '% Descuento' }, { key: 'fixed', label: 'Monto fijo' }, { key: 'free_product', label: 'Producto gratis' }]?.map(bt => (
                  <button
                    key={bt?.key}
                    onClick={() => setBenefitType(bt?.key)}
                    className={`p-2 rounded-lg border text-sm transition-all ${
                      benefitType === bt?.key ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border text-muted-foreground hover:border-muted-foreground/60'
                    }`}
                  >{bt?.label}</button>
                ))}
              </div>
              {(benefitType === 'percentage' || benefitType === 'fixed') && (
                <div className="space-y-1">
                  <Input
                    label={benefitType === 'percentage' ? 'Porcentaje (%)' : 'Monto (MXN)'}
                    type="number"
                    value={benefitValue}
                    onChange={e => setBenefitValue(Number(e?.target?.value))}
                  />
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                    Para recuperar clientes dormidos, recomendamos al menos 15-20% de descuento.
                  </p>
                </div>
              )}
            </div>

            {/* Validity */}
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1">
                Vigencia del cupón: <span className="text-primary">{couponValidity} días</span>
              </label>
              <input
                type="range" min={3} max={30} value={couponValidity}
                onChange={e => setCouponValidity(Number(e?.target?.value))}
                className="w-full accent-primary mb-1"
              />
              <p className="text-xs text-muted-foreground">Cupones con vigencia corta (3-7 días) tienen mayor tasa de canje porque generan urgencia.</p>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Channels */}
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Canal de envío</label>
              <div className="space-y-2">
                {[{ key: 'push', label: 'Push notification', icon: 'Bell' },
                  { key: 'wallet', label: 'Wallet automático', icon: 'Wallet', disabled: true },
                  { key: 'email', label: 'Email', icon: 'Mail' },
                  { key: 'whatsapp', label: 'WhatsApp Business', icon: 'MessageCircle' }]?.map(ch => (
                  <label key={ch?.key} className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all ${
                    channels?.[ch?.key] ? 'border-primary bg-primary/5' : 'border-border'
                  } ${ch?.disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
                    <input
                      type="checkbox"
                      checked={channels?.[ch?.key]}
                      onChange={() => !ch?.disabled && toggleChannel(ch?.key)}
                      disabled={ch?.disabled}
                      className="accent-primary"
                    />
                    <Icon name={ch?.icon} size={14} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{ch?.label}</span>
                    {ch?.disabled && <span className="text-xs text-muted-foreground ml-auto">Siempre activo</span>}
                  </label>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1">Mensaje personalizable</label>
              <textarea
                value={message}
                onChange={e => setMessage(e?.target?.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">Variables: {'{nombre_cliente}'}, {'{nombre_negocio}'}, {'{beneficio}'}, {'{fecha_vencimiento}'}</p>
            </div>

            {/* Repeat behavior */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={repeatEnabled} onChange={e => setRepeatEnabled(e?.target?.checked)} className="accent-primary" />
                <span className="text-sm font-medium text-foreground">Enviar de nuevo si el cliente vuelve a dormirse</span>
              </label>
              {repeatEnabled && (
                <Input label="Máximo de envíos por cliente" type="number" min={1} max={10} value={maxRepeat} onChange={e => setMaxRepeat(Number(e?.target?.value))} />
              )}
            </div>

            {/* Budget */}
            <Input
              label="Presupuesto mensual máximo (MXN, opcional)"
              type="number"
              placeholder="Sin límite"
              value={budget}
              onChange={e => setBudget(e?.target?.value)}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => setConfigured(false)} className="flex-1">Cancelar</Button>
          <Button onClick={() => setActive(true)} className="flex-1">Guardar configuración</Button>
        </div>
      </div>
      {/* ZONE 2: Performance */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-5">Rendimiento del cupón de recuperación</h3>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Cupones emitidos', value: totalEmitted, icon: 'Send', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
            { label: 'Tasa de canje', value: `${redemptionRate}%`, icon: 'Percent', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
            { label: 'Clientes recuperados', value: totalRecovered, icon: 'UserCheck', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
            { label: 'Revenue recuperado', value: `$${(totalRecovered * 285)?.toLocaleString()} MXN`, icon: 'TrendingUp', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
          ]?.map((m, i) => (
            <div key={i} className={`rounded-xl border p-4 ${m?.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{m?.label}</span>
                <Icon name={m?.icon} size={16} className={m?.color} />
              </div>
              <div className={`text-2xl font-bold ${m?.color}`}>{m?.value}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="h-52 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="mes" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="emitidos" stroke="#2563EB" strokeWidth={2} dot={false} name="Emitidos" />
              <Line type="monotone" dataKey="canjeados" stroke="#059669" strokeWidth={2} dot={false} name="Canjeados" />
              <Line type="monotone" dataKey="recuperados" stroke="#7C3AED" strokeWidth={2} dot={false} name="Recuperados" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent table */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Últimos cupones de recuperación emitidos</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Cliente', 'Días inactivo', 'Fecha emisión', 'Estado', '¿Volvió?']?.map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentCoupons?.map((r, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2 px-3 font-medium text-foreground">{r?.client}</td>
                    <td className="py-2 px-3 text-muted-foreground">{r?.days} días</td>
                    <td className="py-2 px-3 text-muted-foreground">{new Date(r.issued)?.toLocaleDateString('es-MX')}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusCls?.[r?.status]}`}>{r?.status}</span>
                    </td>
                    <td className="py-2 px-3">
                      {r?.returned
                        ? <span className="flex items-center gap-1 text-green-600 text-xs"><Icon name="CheckCircle" size={12} />Sí</span>
                        : <span className="flex items-center gap-1 text-muted-foreground text-xs"><Icon name="Clock" size={12} />Pendiente</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecuperacionTab;
