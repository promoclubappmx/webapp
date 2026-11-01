import React from 'react';
import Icon from '../../../components/AppIcon';

const FEE_PERCENT = 9.5;

const calcReceive = (price) => {
  if (!price || isNaN(price)) return 0;
  return price - (price * FEE_PERCENT / 100);
};

const calcFee = (price) => {
  if (!price || isNaN(price)) return 0;
  return price * FEE_PERCENT / 100;
};

const calcAnnualDiscount = (monthly, annual) => {
  if (!monthly || !annual) return 0;
  const monthlyEquiv = annual / 12;
  return Math.round(((monthly - monthlyEquiv) / monthly) * 100);
};

const MembershipPricingConfig = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange?.({ ...data, [field]: value });
  };

  const monthlyPrice = parseFloat(data?.monthly_price) || 0;
  const annualPrice = parseFloat(data?.annual_price) || 0;
  const annualDiscount = calcAnnualDiscount(monthlyPrice, annualPrice);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6">
      <h2 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
        <Icon name="DollarSign" size={18} className="text-primary" />
        Precio y periodicidad
      </h2>
      {/* PromoClub fee banner */}
      <div className="rounded-xl p-4 mb-6 flex items-start gap-3" style={{ backgroundColor: '#EEF2FF' }}>
        <Icon name="Info" size={16} className="text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-indigo-800">
          <strong>PromoClub cobra {FEE_PERCENT}% de cada cobro procesado.</strong>
          {' '}Si tu membresía cuesta $299/mes, el cliente paga $299 y tú recibes $299 menos el fee de plataforma.
          El fee se deduce automáticamente vía Stripe.
        </div>
      </div>
      <div className="space-y-6">
        {/* Monthly plan */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Calendar" size={16} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">Plan mensual</span>
            <span className="text-xs text-muted-foreground">(requerido)</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-medium text-muted-foreground">$</span>
            <input
              type="number"
              min={49}
              max={2999}
              value={data?.monthly_price || ''}
              onChange={e => handleChange('monthly_price', e?.target?.value)}
              placeholder="299"
              className="w-32 px-3 py-2 border border-border rounded-xl text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
            />
            <span className="text-sm text-muted-foreground">MXN / mes</span>
          </div>
          {monthlyPrice > 0 && (
            <div className="bg-muted/30 rounded-lg px-4 py-2.5 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-foreground">Cliente paga <strong>${monthlyPrice?.toFixed(2)}</strong></span>
              <span className="text-muted-foreground">·</span>
              <span className="text-emerald-600">Tú recibes <strong>${calcReceive(monthlyPrice)?.toFixed(2)}</strong></span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">Fee PromoClub <strong>${calcFee(monthlyPrice)?.toFixed(2)}</strong></span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium ml-auto">
                <Icon name="Zap" size={10} />
                Requiere Stripe
              </span>
            </div>
          )}
        </div>

        {/* Annual plan */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="CalendarDays" size={16} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">Plan anual</span>
              <span className="text-xs text-muted-foreground">(opcional)</span>
            </div>
            <button
              onClick={() => handleChange('offer_annual_plan', !data?.offer_annual_plan)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${data?.offer_annual_plan ? 'bg-primary' : 'bg-slate-300'}`}
            >
              <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300" style={{ left: data?.offer_annual_plan ? '22px' : '2px' }} />
            </button>
          </div>
          {data?.offer_annual_plan && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">$</span>
                <input
                  type="number"
                  min={1}
                  value={data?.annual_price || ''}
                  onChange={e => handleChange('annual_price', e?.target?.value)}
                  placeholder="2988"
                  className="w-32 px-3 py-2 border border-border rounded-xl text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                />
                <span className="text-sm text-muted-foreground">MXN / año</span>
                {annualDiscount > 0 && (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                    {annualDiscount}% descuento
                  </span>
                )}
              </div>
              {annualPrice > 0 && monthlyPrice > 0 && (
                <p className="text-xs text-muted-foreground">
                  Equivale a ${(annualPrice / 12)?.toFixed(2)}/mes · {annualDiscount}% de descuento vs mensual
                </p>
              )}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Texto sugerido (editable)</label>
                <input
                  type="text"
                  value={data?.savings_text || ''}
                  onChange={e => handleChange('savings_text', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          )}
        </div>

        {/* Trial period */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="Gift" size={16} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">Período de prueba gratuito</span>
            </div>
            <button
              onClick={() => handleChange('offer_trial', !data?.offer_trial)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${data?.offer_trial ? 'bg-primary' : 'bg-slate-300'}`}
            >
              <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300" style={{ left: data?.offer_trial ? '22px' : '2px' }} />
            </button>
          </div>
          {data?.offer_trial && (
            <div className="space-y-2">
              <div className="flex gap-2">
                {[3, 7, 14, 30]?.map(days => (
                  <button
                    key={days}
                    onClick={() => handleChange('trial_days', days)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${data?.trial_days === days ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:border-primary hover:text-primary'}`}
                  >
                    {days} días
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                El cliente no es cobrado durante el período de prueba. Al terminar, se cobra automáticamente si no cancela.
              </p>
            </div>
          )}
        </div>

        {/* Cancellation policy */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Icon name="XCircle" size={16} className="text-primary" />
            Política de cancelación
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { value: 'end_of_period', label: 'Al fin del período', desc: 'El acceso continúa hasta el fin del mes/año pagado', recommended: true },
              { value: 'immediate', label: 'Cancelación inmediata', desc: 'El acceso termina al cancelar', recommended: false },
            ]?.map(opt => (
              <button
                key={opt?.value}
                onClick={() => handleChange('cancellation_policy', opt?.value)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${data?.cancellation_policy === opt?.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${data?.cancellation_policy === opt?.value ? 'border-primary' : 'border-muted-foreground'}`}>
                    {data?.cancellation_policy === opt?.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <span className="text-sm font-medium text-foreground">{opt?.label}</span>
                  {opt?.recommended && <span className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">Recomendado</span>}
                </div>
                <p className="text-xs text-muted-foreground ml-6">{opt?.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipPricingConfig;
