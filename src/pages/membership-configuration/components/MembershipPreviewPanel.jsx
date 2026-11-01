import React from 'react';
import Icon from '../../../components/AppIcon';

const MembershipPreviewPanel = ({ program, benefits = [] }) => {
  const accentColor = program?.accent_color || '#6366F1';

  const getBenefitPreview = (benefit) => {
    switch (benefit?.type) {
      case 'quantity_included':
        return `✓ ${benefit?.quantity} ${benefit?.item_name} ${benefit?.model === 'daily_limit' ? 'por día' : benefit?.model === 'monthly_quota' ? 'por mes' : 'ilimitados'}`;
      case 'discount_percent':
        return `✓ ${benefit?.discount_percent}% de descuento en todas las compras`;
      case 'points_multiplier':
        return `✓ ${benefit?.multiplier}x puntos por visita/compra`;
      case 'exclusive_access':
        return `✓ Beneficios exclusivos de suscriptor`;
      default:
        return `✓ Beneficio incluido`;
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden sticky top-6">
      <div className="p-4 border-b border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <Icon name="Eye" size={14} />
          Vista previa del cliente
        </p>
      </div>
      {/* Card preview */}
      <div className="p-4">
        {/* Cover image / color block */}
        <div
          className="w-full h-28 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden"
          style={{ backgroundColor: accentColor }}
        >
          {program?.cover_image ? (
            <img src={program?.cover_image} alt="Portada" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-white">
              <Icon name="Crown" size={28} className="mx-auto mb-1 opacity-80" />
              <p className="text-sm font-bold opacity-90">{program?.name || 'Mi Membresía'}</p>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
              MIEMBRO
            </span>
          </div>
        </div>

        {/* Program info */}
        <div className="mb-4">
          <h3 className="font-bold text-foreground text-base">{program?.name || 'Nombre de la membresía'}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {program?.description || 'Descripción de la membresía aparecerá aquí'}
          </p>
        </div>

        {/* Pricing */}
        <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: accentColor + '15' }}>
          {program?.monthly_price > 0 ? (
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">${program?.monthly_price}</span>
                <span className="text-sm text-muted-foreground">/mes</span>
              </div>
              {program?.offer_annual_plan && program?.annual_price > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">${program?.annual_price}/año</span>
                  <span className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                    {program?.savings_text || '¡Ahorra al año!'}
                  </span>
                </div>
              )}
              {program?.offer_trial && program?.trial_days > 0 && (
                <p className="text-xs text-emerald-600 mt-1 font-medium">
                  🎁 {program?.trial_days} días gratis
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Precio por definir</p>
          )}
        </div>

        {/* Benefits list */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Incluye</p>
          {benefits?.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">Sin beneficios configurados aún</p>
          ) : (
            <div className="space-y-1.5">
              {benefits?.map((b, i) => (
                <p key={i} className="text-xs text-foreground">{getBenefitPreview(b)}</p>
              ))}
            </div>
          )}
        </div>

        {/* CTA button */}
        <button
          className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: accentColor }}
        >
          Suscribirme ahora
        </button>
      </div>
    </div>
  );
};

export default MembershipPreviewPanel;
