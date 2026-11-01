import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
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
const HOUR_HEIGHT = 60;

const DayView = ({ currentDate, items, keyDates, activeCategories, statusFilter }) => {
  const navigate = useNavigate();
  const [nowPosition, setNowPosition] = useState(0);
  const [hoveredItem, setHoveredItem] = useState(null);
  const containerRef = useRef(null);

  const today = new Date();
  const isToday = currentDate?.getFullYear() === today?.getFullYear() &&
    currentDate?.getMonth() === today?.getMonth() &&
    currentDate?.getDate() === today?.getDate();

  const dateStr = `${currentDate?.getFullYear()}-${String(currentDate?.getMonth() + 1)?.padStart(2, '0')}-${String(currentDate?.getDate())?.padStart(2, '0')}`;

  useEffect(() => {
    const updateNow = () => {
      const now = new Date();
      setNowPosition(((now?.getHours() * 60 + now?.getMinutes()) / 60) * HOUR_HEIGHT);
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

  const dayItems = items?.filter(item => {
    if (!activeCategories?.includes(item?.category)) return false;
    if (statusFilter !== 'all') {
      if (statusFilter === 'active' && item?.status !== 'active') return false;
      if (statusFilter === 'scheduled' && item?.status !== 'scheduled') return false;
      if (statusFilter === 'finished' && item?.status !== 'finished') return false;
    }
    return item?.startDate <= dateStr && item?.endDate >= dateStr;
  });

  const dayKeyDates = keyDates?.filter(kd => kd?.startDate <= dateStr && kd?.endDate >= dateStr);

  const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const DAYS = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Day header */}
      <div className={`px-6 py-4 border-b border-gray-200 flex items-center justify-between ${isToday ? 'bg-indigo-50' : 'bg-white'}`}>
        <div>
          <h3 className={`text-2xl font-bold ${isToday ? 'text-indigo-700' : 'text-gray-900'}`}>
            {DAYS?.[currentDate?.getDay()]}, {currentDate?.getDate()} de {MONTHS?.[currentDate?.getMonth()]} {currentDate?.getFullYear()}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">{dayItems?.length} eventos programados</p>
        </div>
        {dayKeyDates?.length > 0 && (
          <div className="flex items-center gap-2">
            {dayKeyDates?.map(kd => (
              <div key={kd?.id} className="flex items-center gap-1 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="text-sm">{kd?.emoji}</span>
                <span className="text-xs font-medium text-yellow-700">{kd?.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div ref={containerRef} className="flex-1 overflow-y-auto">
        <div className="flex" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
          {/* Hour labels */}
          <div className="w-20 flex-shrink-0 relative border-r border-gray-100">
            {HOURS?.map(h => (
              <div key={h} className="absolute left-0 right-0 flex items-start justify-end pr-3" style={{ top: `${h * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}>
                <span className="text-xs text-gray-400 -mt-2">{h === 0 ? '' : `${String(h)?.padStart(2, '0')}:00`}</span>
              </div>
            ))}
          </div>

          {/* Main column */}
          <div className={`flex-1 relative ${isToday ? 'bg-indigo-50/20' : ''}`}>
            {HOURS?.map(h => (
              <div key={h} className={`absolute left-0 right-0 ${h % 2 === 0 ? 'border-t border-gray-100' : 'border-t border-gray-50'}`} style={{ top: `${h * HOUR_HEIGHT}px` }} />
            ))}

            {/* Now line */}
            {isToday && (
              <div className="absolute left-0 right-0 z-20 flex items-center" style={{ top: `${nowPosition}px` }}>
                <div className="w-3 h-3 rounded-full bg-red-500 -ml-1.5 flex-shrink-0" />
                <div className="flex-1 h-0.5 bg-red-500" />
                <span className="text-xs text-red-500 pr-2 font-medium bg-white px-1 rounded">
                  {new Date()?.getHours()}:{String(new Date()?.getMinutes())?.padStart(2, '0')}
                </span>
              </div>
            )}

            {/* Items */}
            {dayItems?.map((item, idx) => {
              const colors = colorMap?.[item?.type] || colorMap?.promo;
              const startH = item?.startHour || 9;
              const endH = item?.endHour || 18;
              const top = startH * HOUR_HEIGHT;
              const height = Math.max((endH - startH) * HOUR_HEIGHT, 40);
              const isDashed = item?.type === 'flow' || item?.type === 'streak_risk' || item?.type === 'punch_card';

              return (
                <div
                  key={item?.id}
                  className="absolute left-2 right-4 rounded-lg px-3 py-2 cursor-pointer hover:shadow-lg transition-all group"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    backgroundColor: colors?.bg,
                    color: colors?.text,
                    zIndex: 10 + idx,
                    ...(isDashed ? { border: '2px dashed rgba(255,255,255,0.5)' } : {})
                  }}
                  onMouseEnter={() => setHoveredItem(item?.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => navigate(item?.origin)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold">{item?.title}</div>
                      <div className="text-xs opacity-80 mt-0.5">{startH}:00 – {endH}:00</div>
                      {item?.description && <div className="text-xs opacity-70 mt-1">{item?.description}</div>}
                    </div>
                    {item?.isSystemGenerated && (
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-medium">Sistema</span>
                    )}
                  </div>
                  {item?.metrics && (
                    <div className="flex items-center gap-3 mt-2 text-xs opacity-90">
                      {item?.metrics?.canjes > 0 && <span>🎯 {item?.metrics?.canjes} canjes</span>}
                      {item?.metrics?.revenue > 0 && <span>💰 ${item?.metrics?.revenue?.toLocaleString()}</span>}
                    </div>
                  )}

                  {/* Hover tooltip */}
                  {hoveredItem === item?.id && (
                    <div className="absolute left-full top-0 ml-2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-3 w-56 pointer-events-none">
                      <div className="text-xs font-semibold text-gray-900 mb-1">{item?.title}</div>
                      <div className="text-[10px] text-gray-500 space-y-0.5">
                        <div>Tipo: {ITEM_COLORS?.[item?.type]?.label || item?.type}</div>
                        <div>Estado: {item?.status}</div>
                        {item?.metrics?.canjes > 0 && <div>🎯 Canjes: {item?.metrics?.canjes}</div>}
                        {item?.metrics?.revenue > 0 && <div>💰 Revenue: ${item?.metrics?.revenue?.toLocaleString()}</div>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {dayItems?.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-300">
                  <Icon name="Calendar" size={40} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No hay eventos este día</p>
                  <p className="text-xs mt-1">Haz click en cualquier hora para crear uno</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayView;
