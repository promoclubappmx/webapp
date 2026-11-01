import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const PlanesTab = ({ plans = [], subscription, onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selecting, setSelecting] = useState(null);

  const currentPlanSlug = subscription?.plan_slug || 'free';

  const handleSelect = async (plan) => {
    if (plan?.slug === currentPlanSlug) return;
    setSelecting(plan?.id);
    await onSelectPlan?.(plan, billingCycle);
    setSelecting(null);
  };

  const getPrice = (plan) => {
    if (billingCycle === 'annual') return plan?.price_annual;
    return plan?.price_monthly;
  };

  const getSavings = (plan) => {
    if (!plan?.price_monthly || !plan?.price_annual) return 0;
    const annualMonthly = plan?.price_annual / 12;
    const savings = ((plan?.price_monthly - annualMonthly) / plan?.price_monthly) * 100;
    return Math.round(savings);
  };

  const planColors = {
    free: { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-600', btn: 'bg-gray-600 hover:bg-gray-700 text-white' },
    starter: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', btn: 'bg-blue-600 hover:bg-blue-700 text-white' },
    pro: { bg: 'bg-primary/5', border: 'border-primary/30', badge: 'bg-primary text-white', btn: 'bg-primary hover:bg-primary/90 text-white' },
    enterprise: { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700', btn: 'bg-purple-600 hover:bg-purple-700 text-white' },
  };

  return (
    <div>
      {/* Billing cycle toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center bg-muted rounded-xl p-1 gap-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              billingCycle === 'monthly' ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              billingCycle === 'annual' ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Anual
            <span className="text-xs bg-success/15 text-success px-2 py-0.5 rounded-full font-semibold">Ahorra hasta 17%</span>
          </button>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {plans?.map((plan) => {
          const colors = planColors?.[plan?.slug] || planColors?.free;
          const isCurrentPlan = plan?.slug === currentPlanSlug;
          const price = getPrice(plan);
          const savings = getSavings(plan);
          const features = Array.isArray(plan?.features) ? plan?.features : [];

          return (
            <div
              key={plan?.id}
              className={`relative rounded-xl border-2 p-6 flex flex-col transition-all duration-200 ${colors?.bg} ${
                isCurrentPlan ? colors?.border + ' shadow-md' : 'border-border hover:border-primary/30 hover:shadow-sm'
              } ${plan?.is_popular ? 'ring-2 ring-primary ring-offset-2' : ''}`}
            >
              {plan?.is_popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    Más Popular
                  </span>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute top-3 right-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colors?.badge}`}>
                    Plan Actual
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-bold text-foreground mb-1">{plan?.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{plan?.description}</p>
              </div>

              <div className="mb-5">
                {price === 0 ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-foreground">Gratis</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm text-muted-foreground">$</span>
                      <span className="text-3xl font-extrabold text-foreground">
                        {billingCycle === 'annual' ? Math.round(price / 12)?.toLocaleString('es-MX') : price?.toLocaleString('es-MX')}
                      </span>
                      <span className="text-sm text-muted-foreground">/mes</span>
                    </div>
                    {billingCycle === 'annual' && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ${price?.toLocaleString('es-MX')} MXN/año
                        {savings > 0 && <span className="text-success font-medium ml-1">· Ahorras {savings}%</span>}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {features?.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <Icon name="Check" size={15} className="text-success mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelect(plan)}
                disabled={isCurrentPlan || selecting === plan?.id}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isCurrentPlan
                    ? 'bg-muted text-muted-foreground cursor-default'
                    : colors?.btn
                } disabled:opacity-60`}
              >
                {selecting === plan?.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    Procesando...
                  </span>
                ) : isCurrentPlan ? (
                  'Plan Actual'
                ) : plan?.slug === 'enterprise' ? (
                  'Contactar Ventas'
                ) : (
                  'Seleccionar Plan'
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Info note */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg flex items-start gap-3">
        <Icon name="Info" size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          Los cambios de plan se aplican de forma inmediata. Para planes de pago, se requiere configurar un método de pago válido. 
          Puedes cancelar en cualquier momento desde esta sección.
        </p>
      </div>
    </div>
  );
};

export default PlanesTab;
