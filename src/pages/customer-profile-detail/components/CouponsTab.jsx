import React from 'react';
import Icon from '../../../components/AppIcon';

const coupons = [
  { id: 1, name: 'Café gratis en tu próxima visita', status: 'activo', discount: 'Producto gratis', expires: '15 Mar 2025', redeemed: null },
  { id: 2, name: '20% en bebidas especiales', status: 'activo', discount: '20% descuento', expires: '31 Mar 2025', redeemed: null },
  { id: 3, name: 'Postre de temporada gratis', status: 'canjeado', discount: 'Producto gratis', expires: '28 Feb 2025', redeemed: '22 Feb 2025' },
  { id: 4, name: '15% en tu segunda visita', status: 'canjeado', discount: '15% descuento', expires: '15 Feb 2025', redeemed: '10 Feb 2025' },
  { id: 5, name: 'Happy hour 2x1', status: 'vencido', discount: '2x1 bebidas', expires: '31 Ene 2025', redeemed: null },
  { id: 6, name: 'Descuento de cumpleaños', status: 'canjeado', discount: '25% descuento', expires: '10 Ene 2025', redeemed: '05 Ene 2025' },
];

const statusConfig = {
  activo: { label: 'Activo', class: 'bg-green-100 text-green-700', icon: 'CheckCircle' },
  canjeado: { label: 'Canjeado', class: 'bg-blue-100 text-blue-700', icon: 'Check' },
  vencido: { label: 'Vencido', class: 'bg-gray-100 text-gray-500', icon: 'Clock' },
};

export default function CouponsTab() {
  const active = coupons?.filter(c => c?.status === 'activo');
  const redeemed = coupons?.filter(c => c?.status === 'canjeado');
  const expired = coupons?.filter(c => c?.status === 'vencido');

  const CouponCard = ({ coupon }) => {
    const config = statusConfig?.[coupon?.status];
    return (
      <div className={`border border-border rounded-xl p-4 ${ coupon?.status === 'vencido' ? 'opacity-60' : '' }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              coupon?.status === 'activo' ? 'bg-green-100' : coupon?.status === 'canjeado' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Icon name="Ticket" size={18} className={coupon?.status === 'activo' ? 'text-green-600' : coupon?.status === 'canjeado' ? 'text-blue-600' : 'text-gray-400'} />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">{coupon?.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{coupon?.discount}</div>
              {coupon?.redeemed && (
                <div className="text-xs text-muted-foreground mt-0.5">Canjeado: {coupon?.redeemed}</div>
              )}
              {!coupon?.redeemed && coupon?.status !== 'vencido' && (
                <div className="text-xs text-muted-foreground mt-0.5">Vence: {coupon?.expires}</div>
              )}
              {coupon?.status === 'vencido' && (
                <div className="text-xs text-muted-foreground mt-0.5">Venció: {coupon?.expires}</div>
              )}
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${config?.class}`}>
            {config?.label}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {active?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Activos ({active?.length})
          </h4>
          <div className="space-y-2">
            {active?.map(c => <CouponCard key={c?.id} coupon={c} />)}
          </div>
        </div>
      )}
      {redeemed?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
            Canjeados ({redeemed?.length})
          </h4>
          <div className="space-y-2">
            {redeemed?.map(c => <CouponCard key={c?.id} coupon={c} />)}
          </div>
        </div>
      )}
      {expired?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            Vencidos ({expired?.length})
          </h4>
          <div className="space-y-2">
            {expired?.map(c => <CouponCard key={c?.id} coupon={c} />)}
          </div>
        </div>
      )}
    </div>
  );
}
