import React from 'react';
import Icon from '../../../components/AppIcon';

const KPICard = ({ title, value, subtitle = null, evolution = null, badge = null, cta = null, onCta = null, stripeRequired = false, colorClass = 'text-foreground' }) => (
  <div className="bg-card border border-border rounded-2xl p-5">
    <div className="flex items-start justify-between mb-3">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {stripeRequired && (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
          <Icon name="Zap" size={9} />
          Stripe
        </span>
      )}
      {badge && (
        <span className="px-2 py-0.5 bg-destructive/10 text-destructive rounded-full text-xs font-semibold">{badge}</span>
      )}
    </div>
    <p className={`text-3xl font-bold mb-1 ${colorClass}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
      {value}
    </p>
    {subtitle && <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>}
    {evolution && (
      <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
        <Icon name="TrendingUp" size={12} />
        {evolution}
      </p>
    )}
    {cta && (
      <button onClick={onCta} className="mt-2 text-xs text-primary font-medium hover:underline flex items-center gap-1">
        {cta} <Icon name="ArrowRight" size={12} />
      </button>
    )}
  </div>
);

KPICard.defaultProps = {
  subtitle: null,
  evolution: null,
  badge: null,
  cta: null,
  onCta: null,
  stripeRequired: false,
  colorClass: 'text-foreground'
};

const SubscriptionKPIs = ({ stats = {} }) => {
  const { activeTotal = 47, activeMonthly = 35, activeAnnual = 12, churnRate = 4.2, churnBenchmark = 6.8, upcomingRenewals = 12, upcomingMRR = 3588, paymentFailures = 2 } = stats;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <KPICard
        title="Suscriptores activos"
        value={activeTotal}
        subtitle={`${activeMonthly} mensual · ${activeAnnual} anual`}
        evolution="+3 este mes"
      />
      <KPICard
        title="Churn rate"
        value={`${churnRate}%`}
        subtitle={`Benchmark categoría: ${churnBenchmark}%`}
        colorClass={churnRate < churnBenchmark ? 'text-emerald-600' : 'text-destructive'}
      />
      <KPICard
        title="Próximas renovaciones"
        value={upcomingRenewals}
        subtitle={`$${upcomingMRR?.toLocaleString('es-MX')} MXN próximos 7 días`}
        cta="Ver lista"
      />
      <KPICard
        title="Fallos de pago"
        value={paymentFailures}
        badge={paymentFailures > 0 ? `${paymentFailures} pendientes` : null}
        cta="Gestionar"
        stripeRequired
        colorClass={paymentFailures > 0 ? 'text-destructive' : 'text-foreground'}
      />
    </div>
  );
};

export default SubscriptionKPIs;
