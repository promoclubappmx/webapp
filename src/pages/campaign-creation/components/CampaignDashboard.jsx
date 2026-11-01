import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MOCK_CHART_DATA = [
  { day: 'Día 1', conversiones: 4, proyeccion: 4 },
  { day: 'Día 2', conversiones: 9, proyeccion: 9 },
  { day: 'Día 3', conversiones: 15, proyeccion: 15 },
  { day: 'Día 4', conversiones: 22, proyeccion: 22 },
  { day: 'Día 5', conversiones: 28, proyeccion: 28 },
  { day: 'Día 6', conversiones: 32, proyeccion: 32 },
  { day: 'Día 7', conversiones: null, proyeccion: 38 },
  { day: 'Día 8', conversiones: null, proyeccion: 44 },
  { day: 'Día 9', conversiones: null, proyeccion: 50 },
];

const MOCK_CONVERTED_USERS = [
  { id: 1, name: 'María García', date: '2026-03-01', step: 'Paso 2 - Cupón', value: '$180', type: 'Nuevo' },
  { id: 2, name: 'Carlos López', date: '2026-03-01', step: 'Paso 1 - Push', value: '$240', type: 'Recuperado' },
  { id: 3, name: 'Ana Martínez', date: '2026-03-02', step: 'Paso 2 - Cupón', value: '$95', type: 'Nuevo' },
  { id: 4, name: 'Roberto Silva', date: '2026-03-02', step: 'Paso 3 - Email', value: '$320', type: 'Recuperado' },
  { id: 5, name: 'Laura Torres', date: '2026-03-03', step: 'Paso 1 - Push', value: '$150', type: 'Nuevo' },
];

const MOCK_STEPS = [
  { id: 1, name: 'Push Notification', status: 'completed', sent: 1240, opened: 387, converted: 89 },
  { id: 2, name: 'Cupón al wallet', status: 'active', sent: 851, opened: 312, converted: 45 },
  { id: 3, name: 'Email seguimiento', status: 'pending', sent: 0, opened: 0, converted: 0 },
];

const MOCK_AB_DATA = [
  { variant: 'A', sent: 620, opened: 198, redeemed: 52, visits: 89, revenue: 12400 },
  { variant: 'B', sent: 620, opened: 241, redeemed: 78, visits: 112, revenue: 18600 },
];

const CampaignDashboard = ({ campaign, onAction }) => {
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  const objective = campaign?.objective || 'adquisicion';
  const goalTarget = campaign?.goalTarget || 50;
  const goalCurrent = campaign?.goalCurrent || 32;
  const goalPercent = Math.min(Math.round((goalCurrent / goalTarget) * 100), 100);

  const objectiveLabels = {
    adquisicion: { label: 'Nuevos clientes', icon: 'UserPlus', color: 'text-blue-600', bg: 'bg-blue-50' },
    reactivacion: { label: 'Clientes recuperados', icon: 'RefreshCw', color: 'text-amber-600', bg: 'bg-amber-50' },
    upsell: { label: 'Incremento ticket', icon: 'TrendingUp', color: 'text-green-600', bg: 'bg-green-50' },
    retencion: { label: 'Retención activa', icon: 'Heart', color: 'text-rose-600', bg: 'bg-rose-50' },
  };

  const objConfig = objectiveLabels?.[objective] || objectiveLabels?.['adquisicion'];

  const stepStatusConfig = {
    completed: { color: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50', label: 'Completado', icon: 'CheckCircle' },
    active: { color: 'bg-blue-500 animate-pulse', text: 'text-blue-700', bg: 'bg-blue-50', label: 'En progreso', icon: 'Play' },
    pending: { color: 'bg-gray-300', text: 'text-gray-500', bg: 'bg-gray-50', label: 'Pendiente', icon: 'Clock' },
  };

  return (
    <div className="space-y-6">
      {/* Alertas contextuales */}
      <div className="space-y-2">
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <Icon name="AlertTriangle" size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">La tasa de apertura del paso 2 es 40% menor que el paso 1 — considera ajustar el mensaje.</p>
        </div>
        <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Icon name="Info" size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">La Variante B está ganando con 95% de confianza estadística. ¿Deseas enviarla al resto de la audiencia?</p>
        </div>
      </div>
      {/* Indicador principal de objetivo */}
      <div className={`${objConfig?.bg} border border-border rounded-xl p-5`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon name={objConfig?.icon} size={20} className={objConfig?.color} />
            <span className="font-semibold text-foreground">{objConfig?.label}</span>
          </div>
          <span className={`text-2xl font-bold ${objConfig?.color}`}>{goalPercent}%</span>
        </div>
        <div className="flex items-end justify-between mb-2">
          <span className="text-3xl font-bold text-foreground">{goalCurrent}</span>
          <span className="text-sm text-muted-foreground">de {goalTarget} objetivo</span>
        </div>
        <div className="w-full bg-white/60 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${objConfig?.color?.replace('text-', 'bg-')}`}
            style={{ width: `${goalPercent}%` }}
          />
        </div>
      </div>
      {/* Línea de tiempo de pasos */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Secuencia de pasos</h4>
        <div className="space-y-3">
          {MOCK_STEPS?.map((step, idx) => {
            const sc = stepStatusConfig?.[step?.status];
            return (
              <div key={step?.id} className={`${sc?.bg} border border-border rounded-xl p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${sc?.color}`} />
                    <span className="text-sm font-medium text-foreground">Paso {idx + 1}: {step?.name}</span>
                  </div>
                  <span className={`text-xs font-medium ${sc?.text} flex items-center gap-1`}>
                    <Icon name={sc?.icon} size={12} />
                    {sc?.label}
                  </span>
                </div>
                {step?.status !== 'pending' && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Enviados</p>
                      <p className="text-sm font-bold text-foreground">{step?.sent?.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Abrieron</p>
                      <p className="text-sm font-bold text-foreground">{step?.opened?.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{step?.sent > 0 ? Math.round((step?.opened / step?.sent) * 100) : 0}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Convirtieron</p>
                      <p className="text-sm font-bold text-success">{step?.converted?.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{step?.sent > 0 ? Math.round((step?.converted / step?.sent) * 100) : 0}%</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Gráfico de acumulación diaria */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Conversiones acumuladas</h4>
        <div className="bg-card border border-border rounded-xl p-4">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={MOCK_CHART_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="conversiones" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} name="Real" />
              <Line type="monotone" dataKey="proyeccion" stroke="var(--primary)" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Proyección" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Comparativa A/B */}
      {campaign?.abEnabled && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Comparativa A/B</h4>
          <div className="grid grid-cols-2 gap-3">
            {MOCK_AB_DATA?.map(v => (
              <div key={v?.variant} className={`border rounded-xl p-4 ${
                v?.variant === 'B' ? 'border-green-300 bg-green-50' : 'border-border bg-card'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-white ${
                    v?.variant === 'A' ? 'bg-blue-500' : 'bg-green-500'
                  }`}>{v?.variant}</span>
                  {v?.variant === 'B' && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Ganando</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Apertura</span>
                    <span className="font-medium text-foreground">{Math.round((v?.opened / v?.sent) * 100)}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Canje</span>
                    <span className="font-medium text-foreground">{Math.round((v?.redeemed / v?.sent) * 100)}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Visitas</span>
                    <span className="font-medium text-foreground">{v?.visits}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="font-medium text-success">${v?.revenue?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Tabla de usuarios convertidos */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Usuarios convertidos</h4>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Usuario</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Fecha</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Paso</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Valor</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_CONVERTED_USERS?.map(u => (
                  <tr key={u?.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-foreground">{u?.name}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{new Date(u?.date)?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">{u?.step}</td>
                    <td className="px-4 py-2.5 font-medium text-success">{u?.value}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        u?.type === 'Nuevo' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>{u?.type}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Botón de Acciones */}
      <div className="relative">
        <button
          onClick={() => setShowActionsMenu(v => !v)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          <Icon name="Settings" size={16} />
          Acciones de campaña
          <Icon name="ChevronDown" size={14} />
        </button>
        {showActionsMenu && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden">
            {[
              { id: 'pause', label: 'Pausar campaña', icon: 'Pause', color: 'text-amber-600' },
              { id: 'budget', label: 'Ajustar presupuesto', icon: 'DollarSign', color: 'text-blue-600' },
              { id: 'sequence', label: 'Modificar secuencia', icon: 'GitBranch', color: 'text-purple-600' },
              { id: 'extend', label: 'Extender fecha de fin', icon: 'Calendar', color: 'text-green-600' },
              { id: 'finish', label: 'Finalizar anticipadamente', icon: 'StopCircle', color: 'text-destructive' },
            ]?.map(action => (
              <button
                key={action?.id}
                onClick={() => { onAction?.(action?.id); setShowActionsMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
              >
                <Icon name={action?.icon} size={16} className={action?.color} />
                <span className={`text-sm font-medium ${action?.color}`}>{action?.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignDashboard;
