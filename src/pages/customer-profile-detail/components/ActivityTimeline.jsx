import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const timelineEvents = [
  { id: 1, type: 'checkin', icon: 'MapPin', color: 'bg-green-500', title: 'Check-in vía QR', detail: 'Verificado en sucursal principal', date: 'Hoy, 2:34 PM', group: 'Hoy' },
  { id: 2, type: 'points', icon: 'Coins', color: 'bg-amber-500', title: 'Acumuló 50 puntos', detail: 'Por visita — saldo: 1,240 puntos', date: 'Hoy, 2:34 PM', group: 'Hoy' },
  { id: 3, type: 'coupon', icon: 'Ticket', color: 'bg-blue-500', title: 'Canjeó cupón "Café gratis"', detail: 'Descuento de $45 — validado por QR', date: 'Hace 3 días, 11:20 AM', group: '01 Mar 2025' },
  { id: 4, type: 'review', icon: 'Star', color: 'bg-yellow-500', title: 'Dejó reseña: 5 estrellas', detail: '"Excelente servicio, siempre muy amables..."', date: 'Hace 3 días, 11:45 AM', group: '01 Mar 2025' },
  { id: 5, type: 'vip', icon: 'Crown', color: 'bg-yellow-600', title: 'Subió a nivel Oro', detail: 'Desbloqueó beneficios exclusivos de nivel Oro', date: 'Hace 7 días, 3:15 PM', group: '25 Feb 2025' },
  { id: 6, type: 'checkin', icon: 'MapPin', color: 'bg-green-500', title: 'Check-in vía NFC', detail: 'Verificado en sucursal principal', date: 'Hace 7 días, 3:14 PM', group: '25 Feb 2025' },
  { id: 7, type: 'points', icon: 'Coins', color: 'bg-amber-500', title: 'Acumuló 100 puntos', detail: 'Multiplicador x2 activo — saldo: 1,190 puntos', date: 'Hace 7 días, 3:14 PM', group: '25 Feb 2025' },
  { id: 8, type: 'automation', icon: 'Zap', color: 'bg-orange-500', title: 'Recibió push del flow "Reactivación"', detail: 'Flow: Reactivación de clientes dormidos', date: 'Hace 10 días, 9:00 AM', group: '22 Feb 2025' },
  { id: 9, type: 'coupon', icon: 'Ticket', color: 'bg-blue-500', title: 'Canjeó cupón "20% en bebidas"', detail: 'Descuento de $38 — validado por staff', date: 'Hace 14 días, 1:22 PM', group: '18 Feb 2025' },
  { id: 10, type: 'referral', icon: 'Users', color: 'bg-green-600', title: 'Refirió a Carlos Mendoza', detail: 'Referido registrado y verificado', date: 'Hace 14 días, 2:00 PM', group: '18 Feb 2025' },
  { id: 11, type: 'punchcard', icon: 'Stamp', color: 'bg-emerald-500', title: 'Sello 8 de 10 en "Café del mes"', detail: 'Punch card: Café del mes — 2 sellos para completar', date: 'Hace 18 días, 10:30 AM', group: '14 Feb 2025' },
  { id: 12, type: 'survey', icon: 'ClipboardList', color: 'bg-gray-500', title: 'Respondió encuesta — NPS: 9', detail: 'Promotor activo — comentario positivo', date: 'Hace 21 días, 4:00 PM', group: '11 Feb 2025' },
  { id: 13, type: 'giftcard', icon: 'Gift', color: 'bg-pink-500', title: 'Compró gift card de $500', detail: 'Gift card digital — código: GC-2025-0234', date: 'Hace 25 días, 12:00 PM', group: '07 Feb 2025' },
  { id: 14, type: 'note', icon: 'StickyNote', color: 'bg-gray-400', title: 'Nota del staff', detail: '"Le gusta su café sin azúcar, siempre pide lo mismo"', date: 'Hace 30 días, 9:00 AM', group: '02 Feb 2025' },
  { id: 15, type: 'reservation', icon: 'Calendar', color: 'bg-cyan-500', title: 'Reservó mesa para 4 personas', detail: 'Reservación para el 15 Feb a las 8:00 PM', date: 'Hace 32 días, 11:00 AM', group: '31 Ene 2025' },
];

const filterTypes = [
  { id: 'all', label: 'Todos' },
  { id: 'checkin', label: 'Visitas' },
  { id: 'coupon', label: 'Canjes' },
  { id: 'points', label: 'Puntos' },
  { id: 'review', label: 'Reseñas' },
  { id: 'automation', label: 'Automatizaciones' },
];

export default function ActivityTimeline() {
  const [activeFilters, setActiveFilters] = useState(['all']);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFilter = (filterId) => {
    if (filterId === 'all') {
      setActiveFilters(['all']);
      return;
    }
    setActiveFilters(prev => {
      const withoutAll = prev?.filter(f => f !== 'all');
      if (withoutAll?.includes(filterId)) {
        const next = withoutAll?.filter(f => f !== filterId);
        return next?.length === 0 ? ['all'] : next;
      }
      return [...withoutAll, filterId];
    });
  };

  const filteredEvents = timelineEvents?.filter(event => {
    const matchesFilter = activeFilters?.includes('all') || activeFilters?.includes(event?.type);
    const matchesSearch = !searchQuery || 
      event?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      event?.detail?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const groupedEvents = filteredEvents?.reduce((acc, event) => {
    if (!acc?.[event?.group]) acc[event.group] = [];
    acc?.[event?.group]?.push(event);
    return acc;
  }, {});

  return (
    <div>
      {/* Filters and Search */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex flex-wrap gap-1.5">
          {filterTypes?.map(f => (
            <button
              key={f?.id}
              onClick={() => toggleFilter(f?.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                activeFilters?.includes(f?.id)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {f?.label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar en timeline..."
            value={searchQuery}
            onChange={e => setSearchQuery(e?.target?.value)}
            className="pl-8 pr-4 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 w-48"
          />
        </div>
      </div>
      {/* Timeline */}
      <div className="relative">
        {Object.entries(groupedEvents)?.map(([group, events]) => (
          <div key={group} className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground bg-background px-2">{group}</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-3">
                {events?.map(event => (
                  <div key={event?.id} className="flex gap-4 pl-0">
                    <div className={`relative z-10 w-8 h-8 rounded-full ${event?.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon name={event?.icon} size={14} className="text-white" />
                    </div>
                    <div className="flex-1 bg-muted/30 rounded-xl p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-medium text-foreground">{event?.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{event?.detail}</div>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">{event?.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        {filteredEvents?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="Clock" size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No hay eventos que coincidan con los filtros</p>
          </div>
        )}
        {filteredEvents?.length > 0 && (
          <div className="text-center mt-4">
            <button className="text-sm text-primary hover:underline">Cargar más eventos</button>
          </div>
        )}
      </div>
    </div>
  );
}
