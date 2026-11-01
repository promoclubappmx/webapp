import React from 'react';
import Icon from '../../../components/AppIcon';

const getBenefitLabel = (benefit) => {
  switch (benefit?.type) {
    case 'quantity_included':
      if (benefit?.model === 'daily_limit') return `✓ ${benefit?.quantity || 1} ${benefit?.itemName || 'ítem'} disponible hoy`;
      if (benefit?.model === 'monthly_quota') return `✓ ${benefit?.quantity || 1} ${benefit?.itemName || 'ítem'} al mes`;
      return `✓ ${benefit?.itemName || 'ítem'} ilimitado`;
    case 'discount_percent':
      return `✓ Descuento ${benefit?.discountPercent || 20}% en toda la compra`;
    case 'catalog_price':
      return `✓ Precios especiales en catálogo`;
    case 'points_multiplier':
      return `✓ ${benefit?.multiplier || 2}x puntos en esta visita`;
    case 'exclusive_access':
      return `✓ Beneficios exclusivos de socio`;
    default:
      return `✓ Beneficio incluido`;
  }
};

const MembershipPreview = ({ data, benefits }) => {
  const accentColor = data?.accentColor || '#3B82F6';

  return (
    <div className="bg-card border border-border rounded-2xl p-5 sticky top-24">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="Eye" size={16} className="text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">Vista previa del cliente</p>
      </div>
      {/* Card */}
      <div className="rounded-2xl overflow-hidden shadow-lg">
        {/* Cover */}
        <div
          className="h-28 flex items-center justify-center text-white font-bold text-xl relative"
          style={{ backgroundColor: accentColor }}
        >
          {data?.coverImage ? (
            <img src={data?.coverImage} alt="Portada" className="w-full h-full object-cover" />
          ) : (
            <span className="drop-shadow">{data?.name || 'Mi Membresía'}</span>
          )}
          <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-xs font-semibold text-white">SOCIO</span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white p-4">
          <h3 className="font-bold text-gray-900 text-base">{data?.name || 'Nombre de la membresía'}</h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{data?.description || 'Descripción de tu membresía'}</p>

          {/* Pricing */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              ${data?.monthlyPrice || '---'}
            </span>
            <span className="text-sm text-gray-500">/mes</span>
            {data?.hasAnnualPlan && data?.annualPrice && (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium ml-1">
                Plan anual disponible
              </span>
            )}
          </div>

          {/* Benefits */}
          {benefits?.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {benefits?.slice(0, 4)?.map((b, i) => (
                <p key={i} className="text-xs text-gray-600">{getBenefitLabel(b)}</p>
              ))}
              {benefits?.length > 4 && (
                <p className="text-xs text-gray-400">+{benefits?.length - 4} beneficios más</p>
              )}
            </div>
          )}

          {/* CTA */}
          <button
            className="w-full mt-4 py-2.5 rounded-xl text-white text-sm font-semibold"
            style={{ backgroundColor: accentColor }}
          >
            {data?.hasTrial ? `Prueba gratis ${data?.trialDays || 7} días` : 'Suscribirme ahora'}
          </button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-3">
        Así verá el cliente tu membresía en la app
      </p>
    </div>
  );
};

export default MembershipPreview;
