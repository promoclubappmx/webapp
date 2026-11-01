import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import SubscriptionCharts from './components/SubscriptionCharts';
import SubscribersTable from './components/SubscribersTable';
import SubscriberDetailDrawer from './components/SubscriberDetailDrawer';

const user = {
  name: 'Carlos Mendoza',
  email: 'carlos@promospot.com',
  role: 'owner',
};

const KPICard = ({ title, value, sub, sub2, badge, badgeColor, icon, iconColor, trend, trendLabel }) => (
  <div className="bg-card border border-border rounded-2xl p-5">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor || 'bg-primary/10'}`}>
        <Icon name={icon} size={20} className="text-primary" />
      </div>
      {badge !== undefined && (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor || 'bg-muted text-muted-foreground'}`}>
          {badge}
        </span>
      )}
    </div>
    <p className="text-xs text-muted-foreground mb-1">{title}</p>
    <p className="text-2xl font-bold text-foreground font-mono">{value}</p>
    {sub !== undefined && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    {sub2 !== undefined && <p className="text-xs text-muted-foreground">{sub2}</p>}
    {trend !== undefined && (
      <p className={`text-xs font-medium mt-1 ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% {trendLabel || ''}
      </p>
    )}
  </div>
);

const MembershipSubscribers = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [chartPeriod, setChartPeriod] = useState('6m');
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className={`pt-16 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <div className="p-6">

          {/* Header with MRR */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>Suscriptores</h1>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-5xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>$14,053</span>
                  <span className="text-lg text-muted-foreground">MXN</span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium self-center">Requiere Stripe</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Ingresos recurrentes mensuales (neto después de fee PromoClub)</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm font-semibold text-emerald-600">↑ +$2,100 · 17.5% vs mes anterior</span>
                  <span className="text-sm text-muted-foreground">ARR estimado: <strong>$168,636 MXN</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard
              title="Suscriptores activos"
              value="47"
              sub="35 mensual · 12 anual"
              sub2={undefined}
              badge={undefined}
              badgeColor={undefined}
              trend={3}
              trendLabel="este mes"
              icon="Users"
              iconColor="bg-blue-100"
            />
            <KPICard
              title="Churn rate"
              value="4.2%"
              sub="Media de categoría: 6.8%"
              sub2={undefined}
              badge="↓ Bajo"
              badgeColor="bg-emerald-100 text-emerald-700"
              trend={undefined}
              trendLabel={undefined}
              icon="TrendingDown"
              iconColor="bg-emerald-100"
            />
            <KPICard
              title="Próximas renovaciones"
              value="12"
              sub="Esta semana · $3,588 MXN"
              sub2={undefined}
              badge={undefined}
              badgeColor={undefined}
              trend={undefined}
              trendLabel={undefined}
              icon="Calendar"
              iconColor="bg-purple-100"
            />
            <KPICard
              title="Fallos de pago"
              value="2"
              badge="Pendientes"
              badgeColor="bg-red-100 text-red-700"
              sub="Gestionar →"
              sub2={undefined}
              trend={undefined}
              trendLabel={undefined}
              icon="AlertCircle"
              iconColor="bg-red-100"
            />
          </div>

          {/* Payment Failures Banner */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <Icon name="AlertCircle" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">2 fallos de pago pendientes</p>
              <p className="text-xs text-red-700 mt-0.5">Sofía Torres · $299 MXN · Fallo hace 5 días · Reintento pendiente</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors">
                Gestionar
              </button>
            </div>
          </div>

          {/* Charts + Table */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="xl:col-span-1">
              <SubscriptionCharts period={chartPeriod} onPeriodChange={setChartPeriod} />
            </div>
            <div className="xl:col-span-2">
              <SubscribersTable onSelectSubscriber={setSelectedSubscriber} />
            </div>
          </div>
        </div>
      </main>

      {selectedSubscriber && (
        <SubscriberDetailDrawer
          subscriber={selectedSubscriber}
          onClose={() => setSelectedSubscriber(null)}
        />
      )}
    </div>
  );
};

export default MembershipSubscribers;
