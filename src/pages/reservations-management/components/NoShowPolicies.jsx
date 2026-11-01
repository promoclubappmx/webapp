import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const MOCK_NO_SHOW_STATS = {
  rate: 8.3,
  thisMonth: 12,
  lastMonth: 9,
  topOffenders: [
    { name: 'Carlos M.', count: 3, level: 'Bronce' },
    { name: 'Ana R.', count: 2, level: 'Plata' },
    { name: 'Luis G.', count: 2, level: 'Nuevo' },
  ],
  peakHours: [
    { hour: 'Viernes 20:00', rate: 24 },
    { hour: 'Sábado 21:00', rate: 19 },
    { hour: 'Domingo 14:00', rate: 15 },
  ],
  estimatedLoss: 4800,
};

const NoShowPolicies = ({ config, onChange }) => {
  const [activeSection, setActiveSection] = useState('policies');

  const toleranceCount = config?.toleranceCount ?? 3;
  const toleranceMonths = config?.toleranceMonths ?? 6;
  const noShowThresholdMinutes = config?.noShowThresholdMinutes ?? 15;
  const deductPoints = config?.deductPoints ?? false;
  const deductPointsAmount = config?.deductPointsAmount ?? 50;
  const prepayEnabled = config?.prepayEnabled ?? false;
  const prepayAmount = config?.prepayAmount ?? 200;
  const prepayRefundHours = config?.prepayRefundHours ?? 24;
  const rehabilitationEnabled = config?.rehabilitationEnabled ?? true;
  const rehabilitationDays = config?.rehabilitationDays ?? 60;

  const set = (field, val) => onChange({ ...config, [field]: val });

  const SECTIONS = [
    { id: 'policies', label: 'Políticas', icon: 'Shield' },
    { id: 'dashboard', label: 'Dashboard', icon: 'BarChart3' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl">
        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon name="UserX" size={18} className="text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">No-show y políticas</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Registra ausencias, aplica consecuencias progresivas y protege la capacidad de tu negocio contra reservaciones fantasma.</p>
        </div>
      </div>
      {/* Section tabs */}
      <div className="flex gap-2 border-b border-border">
        {SECTIONS?.map(s => (
          <button
            key={s?.id}
            onClick={() => setActiveSection(s?.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-colors ${
              activeSection === s?.id
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
            }`}
          >
            <Icon name={s?.icon} size={14} />
            {s?.label}
          </button>
        ))}
      </div>
      {activeSection === 'policies' && (
        <div className="space-y-5">
          {/* Auto mark threshold */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Icon name="Clock" size={15} className="text-red-600" />
              Umbral de no-show automático
            </h4>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground flex-1">Marcar como no-show si el cliente no hace check-in después de</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={noShowThresholdMinutes}
                  onChange={e => set('noShowThresholdMinutes', +e?.target?.value)}
                  className="w-16 text-sm border border-border rounded-lg px-2 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-red-400 text-center font-semibold"
                />
                <span className="text-sm text-muted-foreground">min</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground bg-red-50 border border-red-200 rounded-xl p-3">
              <Icon name="Info" size={12} className="inline mr-1 text-red-600" />
              El staff también puede marcar manualmente como no-show antes del umbral automático.
            </p>
          </div>

          {/* Tolerance */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Icon name="Scale" size={15} className="text-amber-600" />
              Tolerancia
            </h4>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-muted-foreground">Aplicar consecuencias después de</span>
              <input
                type="number"
                min="1"
                max="10"
                value={toleranceCount}
                onChange={e => set('toleranceCount', +e?.target?.value)}
                className="w-16 text-sm border border-border rounded-lg px-2 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-400 text-center font-semibold"
              />
              <span className="text-sm text-muted-foreground">no-shows en</span>
              <input
                type="number"
                min="1"
                max="24"
                value={toleranceMonths}
                onChange={e => set('toleranceMonths', +e?.target?.value)}
                className="w-16 text-sm border border-border rounded-lg px-2 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-400 text-center font-semibold"
              />
              <span className="text-sm text-muted-foreground">meses</span>
            </div>
            <p className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-xl p-3">
              <Icon name="Info" size={12} className="inline mr-1 text-amber-600" />
              Una tolerancia muy baja puede frustrar a clientes que tuvieron una emergencia legítima. Recomendamos 2–3 no-shows antes de aplicar restricciones.
            </p>
          </div>

          {/* Progressive consequences */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Icon name="TrendingUp" size={15} className="text-orange-600" />
              Consecuencias progresivas
            </h4>
            <div className="space-y-3">
              {[
                {
                  level: 1,
                  title: `No-show #${toleranceCount}`,
                  action: 'Advertencia',
                  description: 'Push al usuario: "Has faltado a [X] reservaciones. Tu próxima ausencia puede resultar en restricciones."',
                  color: 'text-amber-600',
                  bg: 'bg-amber-100',
                  border: 'border-amber-300',
                  icon: 'AlertTriangle',
                },
                {
                  level: 2,
                  title: `No-show #${toleranceCount + 1}`,
                  action: 'Restricción temporal',
                  description: 'El usuario no puede reservar en este negocio por un período configurable.',
                  color: 'text-orange-600',
                  bg: 'bg-orange-100',
                  border: 'border-orange-300',
                  icon: 'Ban',
                  extra: (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">Duración:</span>
                      <select
                        value={config?.restrictionDays ?? 14}
                        onChange={e => set('restrictionDays', +e?.target?.value)}
                        className="text-xs border border-border rounded-lg px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-orange-400"
                      >
                        {[7, 14, 21, 30]?.map(d => <option key={d} value={d}>{d} días</option>)}
                      </select>
                    </div>
                  ),
                },
                {
                  level: 3,
                  title: `No-show #${toleranceCount + 2}+`,
                  action: 'Confirmación obligatoria',
                  description: 'Las reservaciones de este usuario siempre requieren aprobación manual del negocio.',
                  color: 'text-red-600',
                  bg: 'bg-red-100',
                  border: 'border-red-300',
                  icon: 'ShieldAlert',
                },
              ]?.map(item => (
                <div key={item?.level} className={`flex gap-4 p-4 ${item?.bg} border ${item?.border} rounded-xl`}>
                  <div className={`w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Icon name={item?.icon} size={15} className={item?.color} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{item?.title}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-white ${item?.color}`}>{item?.action}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item?.description}</p>
                    {item?.extra}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Points penalty */}
          <div className={`bg-card border-2 rounded-2xl p-5 space-y-4 transition-colors ${deductPoints ? 'border-red-300' : 'border-border'}`}>
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <Icon name="MinusCircle" size={15} className="text-red-600" />
                Penalización de puntos (opcional)
              </h4>
              <button
                onClick={() => set('deductPoints', !deductPoints)}
                className={`relative w-10 h-5 rounded-full transition-colors ${deductPoints ? 'bg-red-600' : 'bg-muted'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${deductPoints ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {deductPoints && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Descontar</span>
                <input
                  type="number"
                  min="1"
                  value={deductPointsAmount}
                  onChange={e => set('deductPointsAmount', +e?.target?.value)}
                  className="w-20 text-sm border border-border rounded-lg px-2 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-red-400 text-center font-semibold"
                />
                <span className="text-sm text-muted-foreground">puntos por cada no-show</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground bg-red-50 border border-red-200 rounded-xl p-3">
              <Icon name="AlertTriangle" size={12} className="inline mr-1 text-red-600" />
              La penalización de puntos puede desmotivar al cliente. Recomendamos usarla solo como último recurso.
            </p>
          </div>

          {/* Pre-payment */}
          <div className={`bg-card border-2 rounded-2xl p-5 space-y-4 transition-colors ${prepayEnabled ? 'border-emerald-300' : 'border-border'}`}>
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <Icon name="CreditCard" size={15} className="text-emerald-600" />
                Pre-pago / Depósito como protección (opcional)
              </h4>
              <button
                onClick={() => set('prepayEnabled', !prepayEnabled)}
                className={`relative w-10 h-5 rounded-full transition-colors ${prepayEnabled ? 'bg-emerald-600' : 'bg-muted'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${prepayEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {prepayEnabled && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Depósito de</span>
                  <input
                    type="number"
                    min="0"
                    value={prepayAmount}
                    onChange={e => set('prepayAmount', +e?.target?.value)}
                    className="w-24 text-sm border border-border rounded-lg px-2 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-400 text-center font-semibold"
                  />
                  <span className="text-sm text-muted-foreground">MXN al reservar</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Reembolso total si cancela</span>
                  <input
                    type="number"
                    min="1"
                    value={prepayRefundHours}
                    onChange={e => set('prepayRefundHours', +e?.target?.value)}
                    className="w-16 text-sm border border-border rounded-lg px-2 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-400 text-center font-semibold"
                  />
                  <span className="text-sm text-muted-foreground">horas antes</span>
                </div>
                <p className="text-xs text-muted-foreground bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <Icon name="Info" size={12} className="inline mr-1 text-emerald-600" />
                  El pre-pago reduce los no-shows un 70% pero también reduce las reservaciones un 20%. Recomendamos solo si tu tasa de no-shows supera el 15%.
                </p>
              </div>
            )}
          </div>

          {/* Rehabilitation */}
          <div className={`bg-card border-2 rounded-2xl p-5 space-y-4 transition-colors ${rehabilitationEnabled ? 'border-blue-300' : 'border-border'}`}>
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <Icon name="RefreshCw" size={15} className="text-blue-600" />
                Rehabilitación automática
              </h4>
              <button
                onClick={() => set('rehabilitationEnabled', !rehabilitationEnabled)}
                className={`relative w-10 h-5 rounded-full transition-colors ${rehabilitationEnabled ? 'bg-blue-600' : 'bg-muted'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${rehabilitationEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {rehabilitationEnabled && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Levantar restricciones después de</span>
                <input
                  type="number"
                  min="7"
                  max="365"
                  value={rehabilitationDays}
                  onChange={e => set('rehabilitationDays', +e?.target?.value)}
                  className="w-16 text-sm border border-border rounded-lg px-2 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-400 text-center font-semibold"
                />
                <span className="text-sm text-muted-foreground">días sin no-shows adicionales</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded-xl p-3">
              <Icon name="Info" size={12} className="inline mr-1 text-blue-600" />
              Esto da una segunda oportunidad al cliente que mejoró su comportamiento.
            </p>
          </div>
        </div>
      )}
      {activeSection === 'dashboard' && (
        <div className="space-y-5">
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Tasa no-show', value: `${MOCK_NO_SHOW_STATS?.rate}%`, icon: 'TrendingDown', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
              { label: 'Este mes', value: MOCK_NO_SHOW_STATS?.thisMonth, icon: 'Calendar', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
              { label: 'Mes anterior', value: MOCK_NO_SHOW_STATS?.lastMonth, icon: 'CalendarDays', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
              { label: 'Ingreso perdido est.', value: `$${MOCK_NO_SHOW_STATS?.estimatedLoss?.toLocaleString()}`, icon: 'DollarSign', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
            ]?.map((kpi, i) => (
              <div key={i} className={`${kpi?.bg} border ${kpi?.border} rounded-2xl p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{kpi?.label}</span>
                  <Icon name={kpi?.icon} size={14} className={kpi?.color} />
                </div>
                <p className={`text-2xl font-bold ${kpi?.color}`}>{kpi?.value}</p>
              </div>
            ))}
          </div>

          {/* Top offenders */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h4 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
              <Icon name="AlertOctagon" size={15} className="text-red-600" />
              Clientes con más no-shows (últimos 6 meses)
            </h4>
            <div className="space-y-2">
              {MOCK_NO_SHOW_STATS?.topOffenders?.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-5 text-center">{i + 1}</span>
                    <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center">
                      <Icon name="User" size={13} className="text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{c?.name}</p>
                      <p className="text-xs text-muted-foreground">{c?.level}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-red-600">{c?.count} no-shows</span>
                </div>
              ))}
            </div>
          </div>

          {/* Peak no-show hours */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h4 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
              <Icon name="Clock" size={15} className="text-orange-600" />
              Horarios con más no-shows
            </h4>
            <div className="space-y-3">
              {MOCK_NO_SHOW_STATS?.peakHours?.map((h, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-foreground w-36">{h?.hour}</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${h?.rate}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-red-600 w-10 text-right">{h?.rate}%</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 bg-orange-50 border border-orange-200 rounded-xl p-3">
              <Icon name="Lightbulb" size={12} className="inline mr-1 text-orange-600" />
              Si los viernes por la noche tienen más del 15% de no-shows, considera activar pre-pago para esas franjas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoShowPolicies;
