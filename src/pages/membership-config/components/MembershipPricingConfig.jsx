import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const PROMOCLUB_FEE = 0.094; // 9.4%

const MembershipPricingConfig = ({ data, onChange }) => {
  const handleChange = (field, value) => onChange({ ...data, [field]: value });

  const monthlyPrice = parseFloat(data?.monthlyPrice) || 0;
  const annualPrice = parseFloat(data?.annualPrice) || 0;
  const monthlyFee = monthlyPrice * PROMOCLUB_FEE;
  const monthlyNet = monthlyPrice - monthlyFee;
  const annualFee = annualPrice * PROMOCLUB_FEE;
  const annualNet = annualPrice - annualFee;
  const annualEquivMonthly = annualPrice / 12;
  const annualDiscount = monthlyPrice > 0 ? Math.round((1 - annualEquivMonthly / monthlyPrice) * 100) : 0;

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h2 className="text-base font-semibold text-foreground mb-5">Precio y periodicidad</h2>
      {/* Fee Banner */}
      <div className="bg-[#EEF2FF] border border-indigo-200 rounded-xl p-4 mb-5 flex items-start gap-3">
        <Icon name="Info" size={16} className="text-indigo-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-indigo-800">
          PromoClub cobra <strong>{(PROMOCLUB_FEE * 100)?.toFixed(1)}%</strong> de cada cobro procesado.
          Si tu membresía cuesta $299/mes, el cliente paga $299 y tú recibes $299 menos el fee de plataforma.
          El fee se deduce automáticamente vía Stripe.
        </p>
      </div>
      <div className="space-y-6">
        {/* Monthly Plan */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Calendar" size={16} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">Plan mensual</span>
            <span className="text-xs text-muted-foreground">(requerido)</span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-muted-foreground">$</span>
            <input
              type="number"
              min={49}
              max={2999}
              value={data?.monthlyPrice || ''}
              onChange={e => handleChange('monthlyPrice', e?.target?.value)}
              placeholder="299"
              className="w-32 px-3 py-2 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <span className="text-sm text-muted-foreground">MXN / mes</span>
          </div>
          {monthlyPrice > 0 && (
            <div className="bg-muted/40 rounded-lg px-3 py-2 text-xs text-muted-foreground">
              Cliente paga <strong className="text-foreground">${monthlyPrice?.toFixed(2)}</strong> ·
              Tú recibes <strong className="text-emerald-600">${monthlyNet?.toFixed(2)}</strong> ·
              Fee PromoClub <strong className="text-orange-600">${monthlyFee?.toFixed(2)}</strong>
            </div>
          )}
        </div>

        {/* Annual Plan */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="CalendarDays" size={16} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">Plan anual</span>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Requiere Stripe</span>
            </div>
            <button
              onClick={() => handleChange('hasAnnualPlan', !data?.hasAnnualPlan)}
              className={`relative w-10 h-5 rounded-full transition-colors ${data?.hasAnnualPlan ? 'bg-primary' : 'bg-muted'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${data?.hasAnnualPlan ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
          {data?.hasAnnualPlan && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">$</span>
                <input
                  type="number"
                  value={data?.annualPrice || ''}
                  onChange={e => handleChange('annualPrice', e?.target?.value)}
                  placeholder="2988"
                  className="w-32 px-3 py-2 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <span className="text-sm text-muted-foreground">MXN / año</span>
                {annualDiscount > 0 && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                    {annualDiscount}% descuento
                  </span>
                )}
              </div>
              {annualPrice > 0 && (
                <>
                  <div className="bg-muted/40 rounded-lg px-3 py-2 text-xs text-muted-foreground">
                    Equivale a <strong className="text-foreground">${annualEquivMonthly?.toFixed(2)}/mes</strong> ·
                    Tú recibes <strong className="text-emerald-600">${annualNet?.toFixed(2)}</strong> ·
                    Fee <strong className="text-orange-600">${annualFee?.toFixed(2)}</strong>
                  </div>
                  <input
                    type="text"
                    value={data?.annualSavingsText || `¡Ahorra $${(monthlyPrice * 12 - annualPrice)?.toFixed(0)} al año!`}
                    onChange={e => handleChange('annualSavingsText', e?.target?.value)}
                    className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="¡Ahorra $600 al año!"
                  />
                </>
              )}
            </div>
          )}
        </div>

        {/* Trial Period */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="Gift" size={16} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">Período de prueba gratuito</span>
            </div>
            <button
              onClick={() => handleChange('hasTrial', !data?.hasTrial)}
              className={`relative w-10 h-5 rounded-full transition-colors ${data?.hasTrial ? 'bg-primary' : 'bg-muted'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${data?.hasTrial ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
          {data?.hasTrial && (
            <div>
              <div className="flex gap-2">
                {[3, 7, 14, 30]?.map(days => (
                  <button
                    key={days}
                    onClick={() => handleChange('trialDays', days)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      data?.trialDays === days
                        ? 'bg-primary text-white border-primary' :'border-border text-muted-foreground hover:border-primary hover:text-primary'
                    }`}
                  >
                    {days} días
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                El cliente no es cobrado durante el período de prueba. Al terminar, se cobra automáticamente si no cancela.
              </p>
            </div>
          )}
        </div>

        {/* Cancellation Policy */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">Política de cancelación</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { value: 'immediate', label: 'Cancelación inmediata', desc: 'El acceso termina al cancelar' },
              { value: 'end_of_period', label: 'Al fin del período', desc: 'El acceso continúa hasta el fin del mes/año pagado (recomendado)' }
            ]?.map(opt => (
              <button
                key={opt?.value}
                onClick={() => handleChange('cancellationPolicy', opt?.value)}
                className={`text-left p-4 rounded-xl border-2 transition-colors ${
                  (data?.cancellationPolicy || 'end_of_period') === opt?.value
                    ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                }`}
              >
                <p className="text-sm font-medium text-foreground">{opt?.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{opt?.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipPricingConfig;
