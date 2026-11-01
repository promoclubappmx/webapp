import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { ITEM_COLORS } from './calendarData';

const colorMap = {
  flash_deal:  { bg: '#ef4444', text: '#fff' },
  happy_hour:  { bg: '#f59e0b', text: '#fff' },
  drop:        { bg: '#8b5cf6', text: '#fff' },
  promo:       { bg: '#38bdf8', text: '#fff' },
  campaign:    { bg: '#1d4ed8', text: '#fff' },
  coupon:      { bg: '#22c55e', text: '#fff' },
  flow:        { bg: '#9ca3af', text: '#fff' },
  punch_card:  { bg: '#f97316', text: '#fff' },
  push:        { bg: '#6366f1', text: '#fff' },
  email:       { bg: '#14b8a6', text: '#fff' },
  whatsapp:    { bg: '#25D366', text: '#fff' },
  social_post: { bg: '#ec4899', text: '#fff' },
  streak_risk: { bg: '#d97706', text: '#fff' },
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 56;

const WeeklyView = ({ weekStart, items, keyDates, activeCategories, statusFilter }) => {
  const navigate = useNavigate();
  const [nowPosition, setNowPosition] = useState(0);
  const [hoveredItem, setHoveredItem] = useState(null);
  const containerRef = useRef(null);

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d?.setDate(weekStart?.getDate() + i);
      days?.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const today = new Date();

  useEffect(() => {
    const updateNow = () => {
      const now = new Date();
      const minutes = now?.getHours() * 60 + now?.getMinutes();
      setNowPosition((minutes / 60) * HOUR_HEIGHT);
    };
    updateNow();
    const interval = setInterval(updateNow, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (containerRef?.current) {
      containerRef.current.scrollTop = Math.max(0, nowPosition - 200);
    }
  }, [nowPosition]);

  const getItemsForDay = (date) => {
    const dateStr = `${date?.getFullYear()}-${String(date?.getMonth() + 1)?.padStart(2, '0')}-${String(date?.getDate())?.padStart(2, '0')}`;
    return items?.filter(item => {
      if (!activeCategories?.includes(item?.category)) return false;
      if (statusFilter !== 'all') {
        if (statusFilter === 'active' && item?.status !== 'active') return false;
        if (statusFilter === 'scheduled' && item?.status !== 'scheduled') return false;
        if (statusFilter === 'finished' && item?.status !== 'finished') return false;
      }
      return item?.startDate <= dateStr && item?.endDate >= dateStr;
    });
  };

  const getKeyDatesForDay = (date) => {
    const dateStr = `${date?.getFullYear()}-${String(date?.getMonth() + 1)?.padStart(2, '0')}-${String(date?.getDate())?.padStart(2, '0')}`;
    return keyDates?.filter(kd => kd?.startDate <= dateStr && kd?.endDate >= dateStr);
  };

  // Saturation count
  const getSaturationLevel = (dayItems) => {
    const n = dayItems?.length;
    if (n === 0) return 'empty';
    if (n <= 1) return 'low';
    if (n <= 3) return 'medium';
    return 'high';
  };

  const saturationColors = { empty: 'bg-gray-100', low: 'bg-green-400', medium: 'bg-amber-400', high: 'bg-red-500' };

  const isToday = (date) => date?.getFullYear() === today?.getFullYear() && date?.getMonth() === today?.getMonth() && date?.getDate() === today?.getDate();
  const isPast = (date) => date < today && !isToday(date);

  const getItemStyle = (item) => {
    const startH = item?.startHour || 9;
    const endH = item?.endHour || 18;
    const top = startH * HOUR_HEIGHT;
    const height = Math.max((endH - startH) * HOUR_HEIGHT, 28);
    return { top: `${top}px`, height: `${height}px` };
  };

  const DAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const MONTHS_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Day headers */}
      <div className="flex border-b border-gray-200 bg-white flex-shrink-0 rounded-t-xl overflow-hidden">
        <div className="w-16 flex-shrink-0 border-r border-gray-100" />
        {weekDays?.map((day, i) => {
          const kds = getKeyDatesForDay(day);
          const dayItems = getItemsForDay(day);
          const satLevel = getSaturationLevel(dayItems);
          return (
            <div key={i} className={`flex-1 py-2 px-1 text-center border-l border-gray-200 ${isToday(day) ? 'bg-indigo-50' : ''}`}>
              <div className="text-xs text-gray-500 font-medium">{DAYS_SHORT?.[i]}</div>
              <div className={`text-xl font-bold leading-tight ${isToday(day) ? 'text-indigo-600' : 'text-gray-800'}`}>
                {day?.getDate()}
              </div>
              <div className="text-[10px] text-gray-400">{MONTHS_SHORT?.[day?.getMonth()]}</div>
              {/* Saturation bar */}
              <div className="mx-2 mt-1 h-1 bg-gray-100 rounded-full overflow-hidden" title={`${dayItems?.length} eventos`}>
                <div className={`h-full rounded-full ${saturationColors?.[satLevel]}`} style={{ width: Math.min(100, dayItems?.length * 20) + '%' }} />
              </div>
              {kds?.length > 0 && (
                <div className="flex justify-center gap-0.5 mt-0.5">
                  {kds?.slice(0, 2)?.map(kd => (
                    <span key={kd?.id} title={kd?.name} className="text-xs">{kd?.emoji}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Timeline grid */}
      <div ref={containerRef} className="flex-1 overflow-y-auto">
        <div className="flex" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
          {/* Hour labels */}
          <div className="w-16 flex-shrink-0 relative border-r border-gray-100">
            {HOURS?.map(h => (
              <div key={h} className="absolute left-0 right-0 flex items-start justify-end pr-2" style={{ top: `${h * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}>
                <span className="text-[10px] text-gray-400 -mt-2">{h === 0 ? '' : `${String(h)?.padStart(2, '0')}:00`}</span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays?.map((day, dayIdx) => {
            const dayItems = getItemsForDay(day);
            const past = isPast(day);
            const todayCol = isToday(day);

            return (
              <div key={dayIdx} className={`flex-1 relative border-l border-gray-100 ${todayCol ? 'bg-indigo-50/30' : past ? 'bg-gray-50/50' : ''}`}>
                {HOURS?.map(h => (
                  <div key={h} className={`absolute left-0 right-0 ${h % 2 === 0 ? 'border-t border-gray-100' : 'border-t border-gray-50'}`} style={{ top: `${h * HOUR_HEIGHT}px` }} />
                ))}

                {/* Now line */}
                {todayCol && (
                  <div className="absolute left-0 right-0 z-20 flex items-center" style={{ top: `${nowPosition}px` }}>
                    <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 flex-shrink-0" />
                    <div className="flex-1 h-0.5 bg-red-500" />
                    <span className="text-[9px] text-red-500 pr-1 font-medium">
                      {new Date()?.getHours()}:{String(new Date()?.getMinutes())?.padStart(2, '0')}
                    </span>
                  </div>
                )}

                {/* Items */}
                {dayItems?.map((item, itemIdx) => {
                  const colors = colorMap?.[item?.type] || colorMap?.promo;
                  const style = getItemStyle(item);
                  const isItemPast = past || (todayCol && (item?.endHour || 18) * HOUR_HEIGHT < nowPosition);
                  const isDashed = item?.type === 'flow' || item?.type === 'streak_risk' || item?.type === 'punch_card';
                  return (
                    <div
                      key={item?.id}
                      className="absolute left-1 right-1 rounded-md px-1.5 py-1 cursor-pointer transition-all hover:opacity-100 hover:shadow-md overflow-hidden group"
                      style={{
                        ...style,
                        backgroundColor: colors?.bg,
                        color: colors?.text,
                        opacity: isItemPast ? 0.45 : 0.9,
                        zIndex: 10 + itemIdx,
                        ...(isDashed ? {
                          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(255,255,255,0.4) 6px, rgba(255,255,255,0.4) 12px)',
                          border: '1px dashed rgba(0,0,0,0.2)'
                        } : {})
                      }}
                      onMouseEnter={() => setHoveredItem(item?.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      onClick={() => navigate(item?.origin)}
                      title={item?.title}
                    >
                      <div className="text-[10px] font-semibold truncate">{item?.title}</div>
                      <div className="text-[9px] opacity-80">{item?.startHour}:00 – {item?.endHour}:00</div>
                      {item?.isSystemGenerated && <div className="text-[8px] opacity-70">Sistema</div>}

                      {/* Hover tooltip */}
                      {hoveredItem === item?.id && (
                        <div className="absolute left-full top-0 ml-2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-3 w-52 pointer-events-none">
                          <div className="text-xs font-semibold text-gray-900 mb-1">{item?.title}</div>
                          <div className="text-[10px] text-gray-500 space-y-0.5">
                            <div>Tipo: {ITEM_COLORS?.[item?.type]?.label || item?.type}</div>
                            <div>Estado: {item?.status}</div>
                            {item?.metrics?.canjes > 0 && <div>🎯 Canjes: {item?.metrics?.canjes}</div>}
                            {item?.metrics?.revenue > 0 && <div>💰 Revenue: ${item?.metrics?.revenue?.toLocaleString()}</div>}
                            {item?.description && <div className="text-gray-400 italic">{item?.description}</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeeklyView;
