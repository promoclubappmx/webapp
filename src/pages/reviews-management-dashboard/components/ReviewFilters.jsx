import React from 'react';
import Icon from '../../../components/AppIcon';

const ReviewFilters = ({ filters, onFiltersChange }) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 mb-5 space-y-3">
      <div className="flex flex-wrap gap-3">
        {/* Rating filter */}
        <div className="flex items-center gap-1 bg-muted/40 rounded-xl p-1">
          {['Todas', '5★', '4★', '3★', '2★', '1★']?.map((r, i) => (
            <button
              key={r}
              onClick={() => onFiltersChange({ ...filters, rating: i === 0 ? 'all' : String(6 - i) })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                (i === 0 && filters?.rating === 'all') || (i > 0 && filters?.rating === String(6 - i))
                  ? 'bg-card shadow-sm text-foreground' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Origin filter */}
        <select
          value={filters?.origin}
          onChange={e => onFiltersChange({ ...filters, origin: e?.target?.value })}
          className="px-3 py-2 bg-muted/40 border-0 rounded-xl text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
        >
          <option value="all">Todos los orígenes</option>
          <option value="checkin">Check-in</option>
          <option value="coupon_redeem">Cupón / Promo</option>
          <option value="order_completed">Order Ahead</option>
          <option value="reservation_completed">Reservación</option>
          <option value="geofence_visit">Visita geofence</option>
        </select>

        {/* Status filter */}
        <select
          value={filters?.status}
          onChange={e => onFiltersChange({ ...filters, status: e?.target?.value })}
          className="px-3 py-2 bg-muted/40 border-0 rounded-xl text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
        >
          <option value="all">Todos los estados</option>
          <option value="pending_reply">Sin responder</option>
          <option value="replied">Respondidas</option>
          <option value="reported">Reportadas</option>
        </select>

        {/* Period filter */}
        <select
          value={filters?.period}
          onChange={e => onFiltersChange({ ...filters, period: e?.target?.value })}
          className="px-3 py-2 bg-muted/40 border-0 rounded-xl text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
        >
          <option value="7d">Últimos 7 días</option>
          <option value="month">Este mes</option>
          <option value="prev_month">Mes anterior</option>
          <option value="custom">Personalizado</option>
        </select>

        {/* Sort */}
        <select
          value={filters?.sort}
          onChange={e => onFiltersChange({ ...filters, sort: e?.target?.value })}
          className="px-3 py-2 bg-muted/40 border-0 rounded-xl text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
        >
          <option value="recent">Más recientes</option>
          <option value="worst">Peor rating primero</option>
          <option value="unreplied">Sin responder primero</option>
        </select>
      </div>
      {/* Search */}
      <div className="relative">
        <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por comentario o nombre del cliente..."
          value={filters?.search}
          onChange={e => onFiltersChange({ ...filters, search: e?.target?.value })}
          className="w-full pl-9 pr-4 py-2.5 bg-muted/40 border-0 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {filters?.search && (
          <button onClick={() => onFiltersChange({ ...filters, search: '' })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <Icon name="X" size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ReviewFilters;
