import React from 'react';
import Icon from '../../../components/AppIcon';

const SubscribersDashboardHeader = ({ mrr = 14053, mrrGrowth = 2100, mrrGrowthPct = 17.5, arr = 168636 }) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Suscriptores
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-4xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
            ${mrr?.toLocaleString('es-MX')} MXN
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
            <Icon name="Zap" size={10} />
            Requiere Stripe
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Ingresos recurrentes mensuales (neto después de fee PromoClub)</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
            <Icon name="TrendingUp" size={14} />
            +${mrrGrowth?.toLocaleString('es-MX')} ↑{mrrGrowthPct}%
          </span>
          <span className="text-sm text-muted-foreground">vs mes anterior</span>
          <span className="text-sm text-muted-foreground">·</span>
          <span className="text-sm text-muted-foreground">ARR estimado: <strong>${arr?.toLocaleString('es-MX')} MXN</strong></span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <select className="px-3 py-2 border border-border rounded-xl text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option>Todas las sucursales</option>
          <option>Sucursal Centro</option>
          <option>Sucursal Norte</option>
        </select>
      </div>
    </div>
  );
};

export default SubscribersDashboardHeader;
