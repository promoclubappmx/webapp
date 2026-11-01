import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { ITEM_COLORS } from './calendarData';

const colorMap = {
  flash_deal:  { bg: '#ef4444', text: '#fff', light: '#fee2e2' },
  happy_hour:  { bg: '#f59e0b', text: '#fff', light: '#fef3c7' },
  drop:        { bg: '#8b5cf6', text: '#fff', light: '#ede9fe' },
  promo:       { bg: '#38bdf8', text: '#fff', light: '#e0f2fe' },
  campaign:    { bg: '#1d4ed8', text: '#fff', light: '#dbeafe' },
  coupon:      { bg: '#22c55e', text: '#fff', light: '#dcfce7' },
  flow:        { bg: '#9ca3af', text: '#fff', light: '#f3f4f6' },
  punch_card:  { bg: '#f97316', text: '#fff', light: '#ffedd5' },
  push:        { bg: '#6366f1', text: '#fff', light: '#e0e7ff' },
  email:       { bg: '#14b8a6', text: '#fff', light: '#ccfbf1' },
  whatsapp:    { bg: '#25D366', text: '#fff', light: '#dcfce7' },
  social_post: { bg: '#ec4899', text: '#fff', light: '#fce7f3' },
  streak_risk: { bg: '#d97706', text: '#fff', light: '#fef3c7' },
};

const ItemPopover = ({ item, onClose }) => {
  const navigate = useNavigate();
  const colors = colorMap?.[item?.type] || colorMap?.promo;
  return (
    <div className="fixed z-[100] bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-64" style={{ pointerEvents: 'auto' }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: colors?.bg }} />
          <span className="text-sm font-semibold text-gray-900 leading-tight">{item?.title}</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-2">
          <Icon name="X" size={14} />
        </button>
      </div>
      <div className="space-y-1.5 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <Icon name="Tag" size={12} />
          <span>{ITEM_COLORS?.[item?.type]?.label || item?.type}</span>
          {item?.isSystemGenerated && <span className="px-1 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px]">Sistema</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="Calendar" size={12} />
          <span>{item?.startDate} → {item?.endDate}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="Activity" size={12} />
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
            item?.status === 'active' ? 'bg-green-100 text-green-700' :
            item?.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
          }`}>{item?.status === 'active' ? 'Activa' : item?.status === 'scheduled' ? 'Programada' : 'Finalizada'}</span>
        </div>
        {item?.metrics && (
          <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
            {item?.metrics?.canjes > 0 && <span>🎯 {item?.metrics?.canjes} canjes</span>}
            {item?.metrics?.revenue > 0 && <span>💰 ${item?.metrics?.revenue?.toLocaleString()}</span>}
          </div>
        )}
        {item?.description && (
          <p className="text-[10px] text-gray-400 pt-1 border-t border-gray-100">{item?.description}</p>
        )}
      </div>
      {!item?.isSystemGenerated && (
        <button
          onClick={() => navigate(item?.origin)}
          className="mt-3 w-full text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1"
        >
          Ver en módulo <Icon name="ExternalLink" size={11} />
        </button>
      )}
    </div>
  );
};

const SuggestionBlock = ({ suggestion, date, onAction, onDismiss }) => (
  <div
    className="relative flex items-center gap-1 px-2 py-1 rounded border-2 border-dashed border-amber-300 bg-amber-50 cursor-pointer hover:bg-amber-100 transition-colors group"
    onClick={() => onAction(suggestion, date)}
    title={suggestion?.message}
  >
    <Icon name="Lightbulb" size={11} className="text-amber-500 flex-shrink-0" />
    <span className="text-[10px] text-amber-700 truncate">{suggestion?.message}</span>
    <button
      onClick={e => { e?.stopPropagation(); onDismiss(suggestion?.keyDateId); }}
      className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gray-400 rounded-full text-white text-[8px] hidden group-hover:flex items-center justify-center"
    >×</button>
  </div>
);

// Saturation indicator
const SaturationBar = ({ count }) => {
  const level = count === 0 ? 'empty' : count <= 1 ? 'low' : count <= 3 ? 'medium' : 'high';
  const colors = { empty: 'bg-gray-100', low: 'bg-green-400', medium: 'bg-amber-400', high: 'bg-red-500' };
  const widths = { empty: 'w-0', low: 'w-1/3', medium: 'w-2/3', high: 'w-full' };
  return (
    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mt-0.5" title={`${count} comunicaciones este día`}>
      <div className={`h-full rounded-full transition-all ${colors?.[level]} ${widths?.[level]}`} />
    </div>
  );
};

const MonthlyView = ({ year, month, items, keyDates, suggestions, dismissedSuggestions, activeCategories, statusFilter, onSuggestionAction, onDismissSuggestion, onDayClick, onItemDrop }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredItemRect, setHoveredItemRect] = useState(null);
  const [dragItem, setDragItem] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);
  const [dropConfirm, setDropConfirm] = useState(null);
  const navigate = useNavigate();

  const getDaysInMonth = () => new Date(year, month + 1, 0)?.getDate();
  const getFirstDayOfMonth = () => {
    const d = new Date(year, month, 1)?.getDay();
    return d === 0 ? 6 : d - 1;
  };

  const today = new Date();
  const isToday = (day) => today?.getFullYear() === year && today?.getMonth() === month && today?.getDate() === day;

  const getItemsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1)?.padStart(2, '0')}-${String(day)?.padStart(2, '0')}`;
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

  const getKeyDatesForDay = (day) => {
    const dateStr = `${year}-${String(month + 1)?.padStart(2, '0')}-${String(day)?.padStart(2, '0')}`;
    return keyDates?.filter(kd => kd?.startDate <= dateStr && kd?.endDate >= dateStr);
  };

  const getSuggestionsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1)?.padStart(2, '0')}-${String(day)?.padStart(2, '0')}`;
    return suggestions?.filter(s => {
      if (dismissedSuggestions?.includes(s?.keyDateId)) return false;
      return s?.date === dateStr;
    });
  };

  // Detect conflicts: same type same day
  const getConflicts = (dayItems) => {
    const typeCount = {};
    dayItems?.forEach(item => { typeCount[item?.type] = (typeCount?.[item?.type] || 0) + 1; });
    return Object.entries(typeCount)?.filter(([, count]) => count > 1)?.map(([type]) => type);
  };

  const handleDragStart = (e, item) => {
    if (item?.status === 'active' || item?.status === 'finished' || item?.isSystemGenerated) return;
    setDragItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e, day) => {
    e?.preventDefault();
    if (!dragItem) return;
    const newDateStr = `${year}-${String(month + 1)?.padStart(2, '0')}-${String(day)?.padStart(2, '0')}`;
    const oldStart = new Date(dragItem.startDate);
    const oldEnd = new Date(dragItem.endDate);
    const duration = Math.round((oldEnd - oldStart) / (1000 * 60 * 60 * 24));
    const newStart = new Date(newDateStr);
    const newEnd = new Date(newStart);
    newEnd?.setDate(newEnd?.getDate() + duration);
    setDropConfirm({
      item: dragItem,
      newStart: newDateStr,
      newEnd: `${newEnd?.getFullYear()}-${String(newEnd?.getMonth() + 1)?.padStart(2, '0')}-${String(newEnd?.getDate())?.padStart(2, '0')}`,
    });
    setDragItem(null);
    setDragOverDate(null);
  };

  const confirmDrop = () => {
    if (dropConfirm && onItemDrop) {
      onItemDrop(dropConfirm?.item?.id, dropConfirm?.newStart, dropConfirm?.newEnd);
    }
    setDropConfirm(null);
  };

  const daysInMonth = getDaysInMonth();
  const firstDay = getFirstDayOfMonth();
  const totalCells = Math.ceil((daysInMonth + firstDay) / 7) * 7;
  const totalRows = totalCells / 7;

  const handleItemMouseEnter = (e, item) => {
    const rect = e?.currentTarget?.getBoundingClientRect();
    setHoveredItem(item?.id);
    setHoveredItemRect(rect);
  };

  const handleItemMouseLeave = () => {
    setHoveredItem(null);
    setHoveredItemRect(null);
  };

  const getPopoverStyle = () => {
    if (!hoveredItemRect) return {};
    const popoverWidth = 256;
    const popoverHeight = 220;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let left = hoveredItemRect?.right + 8;
    let top = hoveredItemRect?.top;
    if (left + popoverWidth > viewportWidth - 16) left = hoveredItemRect?.left - popoverWidth - 8;
    if (top + popoverHeight > viewportHeight - 16) top = viewportHeight - popoverHeight - 16;
    if (top < 8) top = 8;
    if (left < 8) left = 8;
    return { top, left };
  };

  return (
    <div className="flex-1 overflow-auto flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 flex-shrink-0 rounded-t-xl overflow-hidden">
        {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']?.map(d => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-cols-7" style={{ gridTemplateRows: `repeat(${totalRows}, minmax(100px, 1fr))` }}>
        {Array.from({ length: totalCells })?.map((_, cellIdx) => {
          const day = cellIdx - firstDay + 1;
          const isCurrentMonth = day >= 1 && day <= daysInMonth;
          const dayItems = isCurrentMonth ? getItemsForDay(day) : [];
          const dayKeyDates = isCurrentMonth ? getKeyDatesForDay(day) : [];
          const daySuggestions = isCurrentMonth ? getSuggestionsForDay(day) : [];
          const isDragOver = dragOverDate === day && isCurrentMonth;
          const conflicts = isCurrentMonth ? getConflicts(dayItems) : [];
          const hasConflict = conflicts?.length > 0;

          return (
            <div
              key={cellIdx}
              className={`border-b border-r border-gray-100 p-1 relative overflow-hidden min-h-[100px] ${
                !isCurrentMonth ? 'bg-gray-50/50' : 'hover:bg-gray-50/20 cursor-pointer'
              } ${isDragOver ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-300' : ''}`}
              onDragOver={e => { e?.preventDefault(); if (isCurrentMonth) setDragOverDate(day); }}
              onDragLeave={() => setDragOverDate(null)}
              onDrop={e => isCurrentMonth && handleDrop(e, day)}
              onClick={() => isCurrentMonth && dayItems?.length === 0 && onDayClick && onDayClick(day)}
            >
              {/* Key date background */}
              {dayKeyDates?.length > 0 && (
                <div className="absolute inset-0 bg-yellow-50/40 pointer-events-none" />
              )}

              {/* Day number + saturation */}
              <div className="flex items-start justify-between mb-0.5">
                <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 ${
                  isToday(day) ? 'bg-indigo-600 text-white' : isCurrentMonth ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  {isCurrentMonth ? day : ''}
                </span>
                {isCurrentMonth && hasConflict && (
                  <span title="Conflicto detectado: múltiples eventos del mismo tipo" className="text-xs">⚠️</span>
                )}
              </div>

              {/* Saturation bar */}
              {isCurrentMonth && <SaturationBar count={dayItems?.length} />}

              {/* Key date emojis */}
              {dayKeyDates?.length > 0 && (
                <div className="flex gap-0.5 mt-0.5 flex-wrap">
                  {dayKeyDates?.slice(0, 2)?.map(kd => (
                    <span key={kd?.id} title={kd?.name} className="text-[10px]">{kd?.emoji}</span>
                  ))}
                </div>
              )}

              {/* Items */}
              <div className="space-y-0.5 mt-0.5">
                {dayItems?.slice(0, 3)?.map(item => {
                  const colors = colorMap?.[item?.type] || colorMap?.promo;
                  const isConflict = conflicts?.includes(item?.type);
                  return (
                    <div
                      key={item?.id}
                      draggable={item?.status === 'scheduled' && !item?.isSystemGenerated}
                      onDragStart={e => handleDragStart(e, item)}
                      onMouseEnter={e => handleItemMouseEnter(e, item)}
                      onMouseLeave={handleItemMouseLeave}
                      onClick={e => { e?.stopPropagation(); navigate(item?.origin); }}
                      className={`relative flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium cursor-pointer hover:opacity-90 transition-opacity ${
                        item?.type === 'flow' || item?.type === 'streak_risk' || item?.type === 'punch_card' ?'border border-dashed' :''
                      } ${isConflict ? 'ring-1 ring-yellow-400' : ''}`}
                      style={{
                        backgroundColor: item?.type === 'flow' || item?.type === 'streak_risk' || item?.type === 'punch_card'
                          ? colors?.light
                          : colors?.bg,
                        color: item?.type === 'flow' || item?.type === 'streak_risk' || item?.type === 'punch_card'
                          ? colors?.bg
                          : colors?.text,
                        borderColor: colors?.bg,
                      }}
                    >
                      {isConflict && <span className="text-[8px]">⚠️</span>}
                      <span className="truncate">{item?.title}</span>
                    </div>
                  );
                })}
                {dayItems?.length > 3 && (
                  <div className="text-[10px] text-gray-400 px-1">+{dayItems?.length - 3} más</div>
                )}
              </div>

              {/* Suggestions */}
              {daySuggestions?.length > 0 && (
                <div className="mt-0.5 space-y-0.5">
                  {daySuggestions?.map(s => (
                    <SuggestionBlock
                      key={s?.keyDateId}
                      suggestion={s}
                      date={`${year}-${String(month + 1)?.padStart(2, '0')}-${String(day)?.padStart(2, '0')}`}
                      onAction={onSuggestionAction}
                      onDismiss={onDismissSuggestion}
                    />
                  ))}
                </div>
              )}

              {/* Click to create hint */}
              {isCurrentMonth && dayItems?.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="text-[10px] text-gray-300 flex items-center gap-0.5">
                    <Icon name="Plus" size={10} />
                    Crear
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hover popover */}
      {hoveredItem && hoveredItemRect && (() => {
        const item = items?.find(i => i?.id === hoveredItem);
        if (!item) return null;
        return (
          <div style={{ position: 'fixed', zIndex: 100, ...getPopoverStyle() }}>
            <ItemPopover item={item} onClose={() => setHoveredItem(null)} />
          </div>
        );
      })()}

      {/* Drop confirm modal */}
      {dropConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-80">
            <h3 className="text-base font-semibold text-gray-900 mb-2">¿Mover evento?</h3>
            <p className="text-sm text-gray-600 mb-4">
              ¿Mover <strong>"{dropConfirm?.item?.title}"</strong> al {dropConfirm?.newStart}?
            </p>
            <div className="flex gap-2">
              <button onClick={confirmDrop} className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                Confirmar
              </button>
              <button onClick={() => setDropConfirm(null)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyView;
