import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const MOCK_SUBSCRIBERS = [
  { id: '1', name: 'María García', avatar: null, plan: 'monthly', price: 299, since: '2025-01-15', nextRenewal: '2025-04-15', daysLeft: 5, status: 'active', loyaltyLevel: 'Gold', consumoHoy: '1/1', email: 'maria@email.com' },
  { id: '2', name: 'Carlos López', avatar: null, plan: 'annual', price: 2988, since: '2024-10-20', nextRenewal: '2025-10-20', daysLeft: 193, status: 'active', loyaltyLevel: 'Platinum', consumoHoy: '0/1', email: 'carlos@email.com' },
  { id: '3', name: 'Ana Martínez', avatar: null, plan: 'monthly', price: 299, since: '2025-02-01', nextRenewal: '2025-04-01', daysLeft: 1, status: 'active', loyaltyLevel: 'Silver', consumoHoy: '1/1', email: 'ana@email.com' },
  { id: '4', name: 'Roberto Sánchez', avatar: null, plan: 'trial', price: 0, since: '2025-03-05', nextRenewal: '2025-03-12', daysLeft: 2, status: 'trial', loyaltyLevel: 'Bronze', consumoHoy: '0/1', email: 'roberto@email.com' },
  { id: '5', name: 'Laura Jiménez', avatar: null, plan: 'monthly', price: 299, since: '2025-01-10', nextRenewal: '2025-04-10', daysLeft: 3, status: 'active', loyaltyLevel: 'Gold', consumoHoy: '1/1', email: 'laura@email.com' },
  { id: '6', name: 'Diego Hernández', avatar: null, plan: 'annual', price: 2988, since: '2024-09-15', nextRenewal: '2025-09-15', daysLeft: 188, status: 'active', loyaltyLevel: 'Platinum', consumoHoy: '0/1', email: 'diego@email.com' },
  { id: '7', name: 'Sofía Torres', avatar: null, plan: 'monthly', price: 299, since: '2025-02-10', nextRenewal: '2025-03-10', daysLeft: -5, status: 'payment_failed', loyaltyLevel: 'Silver', consumoHoy: '—', email: 'sofia@email.com' },
  { id: '8', name: 'Miguel Flores', avatar: null, plan: 'monthly', price: 299, since: '2024-12-10', nextRenewal: null, daysLeft: null, status: 'cancelled', loyaltyLevel: 'Bronze', consumoHoy: '—', email: 'miguel@email.com' },
];

const STATUS_CONFIG = {
  active: { label: 'Activa', color: 'bg-emerald-100 text-emerald-700' },
  trial: { label: 'Prueba', color: 'bg-blue-100 text-blue-700' },
  payment_failed: { label: 'Fallo de pago', color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelada', color: 'bg-gray-100 text-gray-600' },
};

const PLAN_CONFIG = {
  monthly: { label: 'Mensual', color: 'bg-blue-100 text-blue-700' },
  annual: { label: 'Anual', color: 'bg-purple-100 text-purple-700' },
  trial: { label: 'Prueba gratis', color: 'bg-sky-100 text-sky-700' },
};

const LOYALTY_COLORS = {
  Platinum: 'text-purple-600',
  Gold: 'text-amber-600',
  Silver: 'text-gray-500',
  Bronze: 'text-orange-600',
};

const SubscribersTable = ({ onSelectSubscriber }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_SUBSCRIBERS?.filter(s => {
    if (statusFilter !== 'all' && s?.status !== statusFilter) return false;
    if (planFilter !== 'all' && s?.plan !== planFilter) return false;
    if (search && !s?.name?.toLowerCase()?.includes(search?.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e?.target?.value)}
            placeholder="Buscar por nombre..."
            className="w-full pl-9 pr-3 py-2 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'cancelled', 'trial', 'payment_failed']?.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s ? 'bg-primary text-white' : 'border border-border text-muted-foreground hover:border-primary hover:text-primary'
              }`}
            >
              {s === 'all' ? 'Todos' : STATUS_CONFIG?.[s]?.label || s}
            </button>
          ))}
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Cliente</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Plan</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Precio</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Suscrito desde</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Próx. renovación</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Estado</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Consumo hoy</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered?.map(sub => (
              <tr key={sub?.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">{sub?.name?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{sub?.name}</p>
                      <p className={`text-xs font-medium ${LOYALTY_COLORS?.[sub?.loyaltyLevel] || 'text-muted-foreground'}`}>
                        {sub?.loyaltyLevel}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_CONFIG?.[sub?.plan]?.color}`}>
                    {PLAN_CONFIG?.[sub?.plan]?.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-mono text-foreground">${sub?.price?.toLocaleString()}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    {new Date(sub.since)?.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {sub?.nextRenewal ? (
                    <div>
                      <p className="text-sm text-foreground">
                        {new Date(sub.nextRenewal)?.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                      </p>
                      <p className={`text-xs font-mono font-medium ${
                        sub?.daysLeft <= 3 ? 'text-amber-600' : 'text-muted-foreground'
                      }`}>
                        {sub?.daysLeft > 0 ? `${sub?.daysLeft}d` : 'Vencido'}
                      </p>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CONFIG?.[sub?.status]?.color}`}>
                    {STATUS_CONFIG?.[sub?.status]?.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-mono font-medium ${
                    sub?.consumoHoy === '1/1' ? 'text-emerald-600' : sub?.consumoHoy === '0/1' ? 'text-muted-foreground' : 'text-muted-foreground'
                  }`}>
                    {sub?.consumoHoy}
                    {sub?.consumoHoy === '1/1' && ' ✓'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSelectSubscriber(sub)}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Ver detalle"
                    >
                      <Icon name="Eye" size={15} />
                    </button>
                    {sub?.status === 'active' && (
                      <button
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Cancelar"
                      >
                        <Icon name="X" size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-border flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{filtered?.length} suscriptores</p>
        <div className="flex gap-1">
          <button className="px-3 py-1.5 border border-border rounded-lg text-xs text-muted-foreground hover:bg-muted/50">Anterior</button>
          <button className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium">1</button>
          <button className="px-3 py-1.5 border border-border rounded-lg text-xs text-muted-foreground hover:bg-muted/50">Siguiente</button>
        </div>
      </div>
    </div>
  );
};

export default SubscribersTable;
