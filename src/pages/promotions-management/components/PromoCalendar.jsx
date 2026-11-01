import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';


const MEXICO_DATES = [
  { month: 2, day: 14, label: 'Día del Amor', emoji: '❤️' },
  { month: 3, day: 21, label: 'Primavera', emoji: '🌸' },
  { month: 4, day: 30, label: 'Día del Niño', emoji: '🧨' },
  { month: 5, day: 10, label: 'Día de las Madres', emoji: '💐' },
  { month: 6, day: 15, label: 'Hot Sale', emoji: '🔥' },
  { month: 9, day: 15, label: 'Independencia', emoji: '🇲🇽' },
  { month: 11, day: 15, label: 'Buen Fin', emoji: '🛠️' },
  { month: 12, day: 12, label: 'Virgen de Guadalupe', emoji: '🕏' },
  { month: 12, day: 25, label: 'Navidad', emoji: '🎄' }
];

const TYPE_COLORS = {
  standard: '#3b82f6', flash_deal: '#ef4444', happy_hour: '#f59e0b',
  limited_drop: '#8b5cf6', birthday: '#ec4899', first_visit: '#22c55e',
  weather: '#06b6d4', inverse_demand: '#f97316', advent: '#eab308', vip_access: '#1f2937'
};

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const PromoCalendar = ({ promotions, onCreatePromo }) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [viewMode, setViewMode] = useState('month'); // month | week
  const [hoveredPromo, setHoveredPromo] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);

  const year = currentDate?.getFullYear();
  const month = currentDate?.getMonth();

  const daysInMonth = new Date(year, month + 1, 0)?.getDate();
  const firstDayOfMonth = new Date(year, month, 1)?.getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const getPromosForDay = (day) => {
    const date = new Date(year, month, day);
    return (promotions || [])?.filter(p => {
      if (!p?.startDate) return false;
      const start = new Date(p?.startDate);
      const end = p?.endDate ? new Date(p?.endDate) : start;
      return date >= start && date <= end;
    });
  };

  const getMexicoDatesForDay = (day) => {
    return MEXICO_DATES?.filter(d => d?.month === month + 1 && d?.day === day);
  };

  const isToday = (day) => {
    return today?.getDate() === day && today?.getMonth() === month && today?.getFullYear() === year;
  };

  const isPast = (day) => new Date(year, month, day) < new Date(today?.getFullYear(), today?.getMonth(), today?.getDate());
  const isFuture = (day) => new Date(year, month, day) > new Date(today?.getFullYear(), today?.getMonth(), today?.getDate());

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = [];
  for (let i = 0; i < startOffset; i++) days?.push(null);
  for (let i = 1; i <= daysInMonth; i++) days?.push(i);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-lg">
            <Icon name="ChevronLeft" size={18} className="text-muted-foreground" />
          </button>
          <h3 className="text-lg font-bold text-foreground">{MONTHS?.[month]} {year}</h3>
          <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-lg">
            <Icon name="ChevronRight" size={18} className="text-muted-foreground" />
          </button>
          <button onClick={() => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full hover:bg-primary/20">
            Hoy
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            {['month', 'week']?.map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === mode ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'
                }`}>
                {mode === 'month' ? 'Mes' : 'Semana'}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-muted/20 flex-wrap">
        {Object.entries(TYPE_COLORS)?.slice(0, 6)?.map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-xs text-muted-foreground capitalize">{type?.replace('_', ' ')}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-yellow-400" />
          <span className="text-xs text-muted-foreground">Fechas clave MX</span>
        </div>
      </div>
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']?.map(d => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground">{d}</div>
        ))}
      </div>
      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days?.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="min-h-[90px] border-b border-r border-border bg-muted/10" />;
          const dayPromos = getPromosForDay(day);
          const mexicoDates = getMexicoDatesForDay(day);
          const todayDay = isToday(day);
          const pastDay = isPast(day);
          const futureDay = isFuture(day);

          return (
            <div
              key={day}
              onClick={() => onCreatePromo && onCreatePromo(new Date(year, month, day))}
              className={`min-h-[90px] border-b border-r border-border p-1.5 cursor-pointer transition-colors hover:bg-muted/30 ${
                todayDay ? 'bg-primary/5' : pastDay ? 'bg-muted/10' : ''
              }`}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                  todayDay ? 'bg-primary text-primary-foreground' : pastDay ? 'text-muted-foreground' : 'text-foreground'
                }`}>{day}</span>
                {mexicoDates?.length > 0 && (
                  <span title={mexicoDates?.[0]?.label} className="text-sm">{mexicoDates?.[0]?.emoji}</span>
                )}
              </div>

              {/* Mexico date suggestion */}
              {mexicoDates?.length > 0 && (
                <div className="text-xs text-yellow-600 bg-yellow-50 rounded px-1 py-0.5 mb-1 truncate">
                  {mexicoDates?.[0]?.label}
                </div>
              )}

              {/* Promos */}
              <div className="space-y-0.5">
                {dayPromos?.slice(0, 3)?.map((promo, i) => {
                  const color = TYPE_COLORS?.[promo?.promoType] || '#3b82f6';
                  const isPastPromo = promo?.endDate && new Date(promo?.endDate) < today;
                  const isFuturePromo = promo?.startDate && new Date(promo?.startDate) > today;
                  return (
                    <div
                      key={i}
                      onClick={e => { e?.stopPropagation(); setHoveredPromo(promo); }}
                      className={`text-xs px-1.5 py-0.5 rounded truncate cursor-pointer transition-opacity ${
                        isPastPromo ? 'opacity-40' : isFuturePromo ? 'opacity-70' : ''
                      }`}
                      style={{ backgroundColor: color + '20', color, border: isFuturePromo ? `1px dashed ${color}` : `1px solid ${color}40` }}
                    >
                      {promo?.title}
                    </div>
                  );
                })}
                {dayPromos?.length > 3 && (
                  <div className="text-xs text-muted-foreground pl-1">+{dayPromos?.length - 3} más</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Promo Popover */}
      {hoveredPromo && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setHoveredPromo(null)}>
          <div className="bg-card border border-border rounded-xl shadow-xl p-5 max-w-sm w-full" onClick={e => e?.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-foreground">{hoveredPromo?.title}</h4>
              <button onClick={() => setHoveredPromo(null)} className="p-1 hover:bg-muted rounded">
                <Icon name="X" size={16} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{hoveredPromo?.description}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted-foreground">Tipo:</span> <span className="font-medium">{hoveredPromo?.promoTypeLabel || 'Estándar'}</span></div>
              <div><span className="text-muted-foreground">Estado:</span> <span className="font-medium capitalize">{hoveredPromo?.status}</span></div>
              <div><span className="text-muted-foreground">Inicio:</span> <span className="font-medium">{hoveredPromo?.startDate}</span></div>
              <div><span className="text-muted-foreground">Fin:</span> <span className="font-medium">{hoveredPromo?.endDate || 'Sin fecha'}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCalendar;
