import React from 'react';
import { CATEGORY_LABELS } from './calendarData';

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const CATEGORIES = ['promotion','campaign','coupon','event','flow'];

const AnnualView = ({ year, items, keyDates, activeCategories, onMonthClick, showPrevYear, prevYearItems }) => {
  const getDaysInMonth = (month) => new Date(year, month + 1, 0)?.getDate();

  const getItemsForMonthCategory = (month, category) => {
    return items?.filter(item => {
      if (!activeCategories?.includes(item?.category)) return false;
      if (item?.category !== category) return false;
      const start = new Date(item.startDate);
      const end = new Date(item.endDate);
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      return start <= monthEnd && end >= monthStart;
    });
  };

  const getKeyDatesForMonth = (month) => {
    return keyDates?.filter(kd => {
      const start = new Date(kd.startDate);
      return start?.getMonth() === month;
    });
  };

  const getBarStyle = (item, month) => {
    const daysInMonth = getDaysInMonth(month);
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const itemStart = new Date(item.startDate);
    const itemEnd = new Date(item.endDate);
    const effectiveStart = itemStart < monthStart ? monthStart : itemStart;
    const effectiveEnd = itemEnd > monthEnd ? monthEnd : itemEnd;
    const startDay = effectiveStart?.getDate();
    const endDay = effectiveEnd?.getDate();
    const left = ((startDay - 1) / daysInMonth) * 100;
    const width = ((endDay - startDay + 1) / daysInMonth) * 100;
    return { left: `${left}%`, width: `${Math.max(width, 8)}%` };
  };

  const colorMap = {
    flash_deal: '#ef4444', happy_hour: '#f59e0b', drop: '#8b5cf6',
    promo: '#38bdf8', campaign: '#1d4ed8', coupon: '#22c55e',
    event: '#ec4899', flow: '#9ca3af',
  };

  return (
    <div className="overflow-auto">
      <div className="min-w-[900px]">
        {/* Month headers */}
        <div className="grid grid-cols-[120px_repeat(12,1fr)] border-b border-gray-200 bg-gray-50">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoría</div>
          {MONTHS?.map((m, i) => (
            <button
              key={i}
              onClick={() => onMonthClick(i)}
              className="px-2 py-2 text-xs font-semibold text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-center border-l border-gray-200"
            >
              {m}
            </button>
          ))}
        </div>

        {/* Category rows */}
        {CATEGORIES?.filter(cat => activeCategories?.includes(cat))?.map(category => (
          <div key={category} className="grid grid-cols-[120px_repeat(12,1fr)] border-b border-gray-100 hover:bg-gray-50/50">
            {/* Category label */}
            <div className="px-3 py-3 flex items-center">
              <span className="text-xs font-medium text-gray-600">{CATEGORY_LABELS?.[category]}</span>
            </div>

            {/* Month cells */}
            {MONTHS?.map((_, monthIdx) => {
              const monthItems = getItemsForMonthCategory(monthIdx, category);
              const kds = getKeyDatesForMonth(monthIdx);
              return (
                <div
                  key={monthIdx}
                  className="relative border-l border-gray-100 py-1 px-0.5 min-h-[52px] cursor-pointer hover:bg-indigo-50/30 transition-colors"
                  onClick={() => onMonthClick(monthIdx)}
                >
                  {/* Key date background */}
                  {kds?.length > 0 && (
                    <div className="absolute inset-0 bg-yellow-50/60 pointer-events-none" />
                  )}
                  {/* Item bars */}
                  <div className="relative h-full flex flex-col gap-0.5 pt-0.5">
                    {monthItems?.slice(0, 3)?.map(item => (
                      <div
                        key={item?.id}
                        className="absolute h-4 rounded-sm opacity-90 flex items-center px-1"
                        style={{
                          ...getBarStyle(item, monthIdx),
                          backgroundColor: colorMap?.[item?.type] || '#9ca3af',
                          top: `${monthItems?.indexOf(item) * 18 + 4}px`,
                          ...(item?.type === 'flow' ? { backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(255,255,255,0.5) 4px, rgba(255,255,255,0.5) 8px)' } : {})
                        }}
                        title={item?.title}
                      >
                        <span className="text-white text-[9px] truncate leading-none">{item?.title}</span>
                      </div>
                    ))}
                    {monthItems?.length > 3 && (
                      <div className="absolute bottom-0.5 right-1 text-[9px] text-gray-400">+{monthItems?.length - 3}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Key dates row */}
        <div className="grid grid-cols-[120px_repeat(12,1fr)] border-b border-gray-100 bg-yellow-50/30">
          <div className="px-3 py-3 flex items-center">
            <span className="text-xs font-medium text-yellow-700">Fechas Clave</span>
          </div>
          {MONTHS?.map((_, monthIdx) => {
            const kds = getKeyDatesForMonth(monthIdx);
            return (
              <div key={monthIdx} className="border-l border-gray-100 py-1 px-1 min-h-[40px]">
                {kds?.slice(0, 2)?.map(kd => (
                  <div key={kd?.id} className="flex items-center gap-0.5 mb-0.5">
                    <span className="text-xs">{kd?.emoji}</span>
                    <span className="text-[9px] text-yellow-700 truncate">{kd?.name}</span>
                  </div>
                ))}
                {kds?.length > 2 && (
                  <span className="text-[9px] text-yellow-600">+{kds?.length - 2} más</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Previous year overlay */}
        {showPrevYear && prevYearItems && (
          <div className="mt-2 border-t border-dashed border-gray-300 pt-2">
            <div className="px-3 py-1">
              <span className="text-xs text-gray-400 font-medium">Año anterior (referencia)</span>
            </div>
            {CATEGORIES?.filter(cat => activeCategories?.includes(cat))?.map(category => (
              <div key={category} className="grid grid-cols-[120px_repeat(12,1fr)] border-b border-gray-100 opacity-40">
                <div className="px-3 py-2 flex items-center">
                  <span className="text-xs text-gray-400">{CATEGORY_LABELS?.[category]}</span>
                </div>
                {MONTHS?.map((_, monthIdx) => {
                  const monthItems = prevYearItems?.filter(item => {
                    if (item?.category !== category) return false;
                    const start = new Date(item.startDate);
                    return start?.getMonth() === monthIdx;
                  });
                  return (
                    <div key={monthIdx} className="border-l border-gray-100 py-1 px-0.5 min-h-[36px]">
                      {monthItems?.slice(0, 2)?.map(item => (
                        <div
                          key={item?.id}
                          className="h-3 rounded-sm mb-0.5"
                          style={{ backgroundColor: colorMap?.[item?.type] || '#9ca3af' }}
                          title={item?.title}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnualView;
