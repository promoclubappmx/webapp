import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const INCENTIVE_TYPES = [
  { id: 'points', label: 'Puntos PromoClub' },
  { id: 'coupon', label: 'Cupón de descuento' },
  { id: 'punch', label: 'Punch card stamp' },
];

const COUPONS = [
  { id: 'c1', label: 'Café gratis (válido 7 días)' },
  { id: 'c2', label: '10% descuento en tu próxima visita' },
  { id: 'c3', label: 'Postre gratis en tu próxima visita' },
];

const IncentiveConfig = () => {
  const [incentiveEnabled, setIncentiveEnabled] = useState(false);
  const [incentiveType, setIncentiveType] = useState('points');
  const [pointsAmount, setPointsAmount] = useState(10);
  const [selectedCoupon, setSelectedCoupon] = useState('c1');

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Incentivo por dejar reseña</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Ofrece un beneficio a los clientes que dejen una reseña</p>
        </div>
        <button
          onClick={() => setIncentiveEnabled(!incentiveEnabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${incentiveEnabled ? 'bg-primary' : 'bg-muted'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${incentiveEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
      {incentiveEnabled && (
        <>
          <div className="mb-5">
            <label className="block text-sm font-medium text-foreground mb-2">Tipo de incentivo</label>
            <div className="flex flex-wrap gap-2">
              {INCENTIVE_TYPES?.map(type => (
                <button
                  key={type?.id}
                  onClick={() => setIncentiveType(type?.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    incentiveType === type?.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {type?.label}
                </button>
              ))}
            </div>
          </div>

          {incentiveType === 'points' && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-foreground mb-2">Cantidad de puntos</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={pointsAmount}
                  onChange={e => setPointsAmount(Number(e?.target?.value))}
                  className="w-24 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-sm text-muted-foreground">puntos (mínimo 5, máximo 50)</span>
              </div>
            </div>
          )}

          {incentiveType === 'coupon' && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-foreground mb-2">Seleccionar cupón</label>
              <select
                value={selectedCoupon}
                onChange={e => setSelectedCoupon(e?.target?.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {COUPONS?.map(c => <option key={c?.id} value={c?.id}>{c?.label}</option>)}
              </select>
            </div>
          )}

          {incentiveType === 'punch' && (
            <div className="mb-5 p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-foreground">Se otorgará <strong>1 sello adicional</strong> en la punch card activa del cliente al dejar su reseña.</p>
            </div>
          )}

          {/* Regulatory warning */}
          <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-5">
            <div className="flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">Importante</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  El incentivo se otorga a todos los clientes que dejen reseña, independientemente de su calificación (positiva, negativa o neutral). No puedes condicionar el beneficio a un rating mínimo ni solicitar cambiar una reseña. Esto viola las políticas de PromoClub.
                </p>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Icon name="Eye" size={14} className="inline mr-1" />
              Preview del mensaje al cliente
            </label>
            <div className="bg-muted/30 border border-border rounded-xl p-4 max-w-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <Icon name="Star" size={14} className="text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">Deja tu reseña</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">¿Cómo fue tu experiencia en Sucursal Centro?</p>
              <div className="bg-primary/10 rounded-lg px-3 py-2 text-xs text-primary font-medium">
                🎁 Gana{' '}
                {incentiveType === 'points' && `${pointsAmount} puntos PromoClub`}
                {incentiveType === 'coupon' && COUPONS?.find(c => c?.id === selectedCoupon)?.label}
                {incentiveType === 'punch' && '1 sello en tu punch card'}
                {' '}por dejar tu reseña
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default IncentiveConfig;
