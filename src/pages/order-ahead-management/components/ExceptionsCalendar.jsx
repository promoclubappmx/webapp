import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const ExceptionsCalendar = ({ exceptions = [], onAdd, onRemove }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today?.getFullYear());
  const [viewMonth, setViewMonth] = useState(today?.getMonth());

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0)?.getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1)?.getDay();

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const formatDate = (y, m, d) => `${y}-${String(m + 1)?.padStart(2, '0')}-${String(d)?.padStart(2, '0')}`;

  const isException = (d) => exceptions?.some(e => e?.date === formatDate(viewYear, viewMonth, d));

  const toggleDay = (d) => {
    const dateStr = formatDate(viewYear, viewMonth, d);
    if (isException(d)) {
      onRemove?.(dateStr);
    } else {
      onAdd?.({ date: dateStr, isClosed: true, reason: '' });
    }
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Check for upcoming closures in next 7 days
  const upcomingClosures = exceptions?.filter(e => {
    let d = new Date(e.date);
    const diff = (d - today) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells?.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells?.push(d);

  return (
    <div className="space-y-4">
      {upcomingClosures?.length > 0 && (
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <Icon name="AlertTriangle" size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-800">Días cerrados próximos</p>
            <p className="text-xs text-amber-700">Tienes {upcomingClosures?.length} día(s) cerrado(s) en los próximos 7 días: {upcomingClosures?.map(e => e?.date)?.join(', ')}</p>
          </div>
        </div>
      )}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
          <button onClick={prevMonth} className="p-1 hover:bg-muted rounded-lg"><Icon name="ChevronLeft" size={16} /></button>
          <span className="text-sm font-semibold text-foreground">{MONTHS?.[viewMonth]} {viewYear}</span>
          <button onClick={nextMonth} className="p-1 hover:bg-muted rounded-lg"><Icon name="ChevronRight" size={16} /></button>
        </div>
        <div className="grid grid-cols-7 text-center">
          {['D','L','M','M','J','V','S']?.map((d, i) => (
            <div key={i} className="py-2 text-xs font-medium text-muted-foreground border-b border-border">{d}</div>
          ))}
          {cells?.map((d, i) => (
            <div key={i} className={`border-b border-r border-border/30 ${!d ? 'bg-muted/10' : ''}`}>
              {d && (
                <button
                  onClick={() => toggleDay(d)}
                  className={`w-full h-10 text-sm font-medium transition-colors ${
                    isException(d)
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' :'hover:bg-primary/10 text-foreground'
                  }`}
                >
                  {d}
                  {isException(d) && <div className="w-1 h-1 bg-red-500 rounded-full mx-auto mt-0.5" />}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-100 border border-red-300 rounded" /><span>Día cerrado</span></div>
        <span>Toca un día para marcarlo como cerrado o abierto</span>
      </div>
      {exceptions?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground">Excepciones configuradas ({exceptions?.length})</p>
          {exceptions?.map((e, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon name="XCircle" size={14} className="text-red-500" />
                <span className="text-xs text-foreground">{e?.date}</span>
                <span className="text-xs text-muted-foreground">— Cerrado</span>
              </div>
              <button onClick={() => onRemove?.(e?.date)} className="text-muted-foreground hover:text-destructive">
                <Icon name="X" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExceptionsCalendar;
