import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const VIEWS = [
  { key: 'day',   label: 'Día' },
  { key: 'week',  label: 'Semana' },
  { key: 'month', label: 'Mes' },
  { key: 'list',  label: 'Lista' },
];

// Category filters aligned with legend — Posts removed per request
const CATEGORY_FILTERS = [
  { key: 'all',         label: 'Todas',         color: '#6b7280', isAll: true },
  { key: 'promotion',   label: 'Promos',        color: '#ef4444', group: ['flash_deal','happy_hour','drop','promo'] },
  { key: 'campaign',    label: 'Campañas',      color: '#1d4ed8' },
  { key: 'coupon',      label: 'Cupones',       color: '#22c55e' },
  { key: 'flow',        label: 'Flows',         color: '#9ca3af' },
  { key: 'push',        label: 'Push 🔔',       color: '#6366f1' },
  { key: 'email',       label: 'Email 📧',      color: '#14b8a6' },
  { key: 'whatsapp',    label: 'WhatsApp 💬',   color: '#25D366' },
  { key: 'punch_card',  label: 'Punch Card 🎴', color: '#f97316' },
  { key: 'streak_risk', label: 'Rachas 🔥',     color: '#d97706' },
];

const LEGEND_ITEMS = [
  { key: 'flash_deal',  label: 'Flash Deal',        color: '#ef4444', icon: '⚡', group: 'Promos' },
  { key: 'happy_hour',  label: 'Happy Hour',         color: '#f59e0b', icon: '🍹', group: 'Promos' },
  { key: 'drop',        label: 'Drop Limitado',      color: '#8b5cf6', icon: '💎', group: 'Promos' },
  { key: 'promo',       label: 'Promo Estándar',     color: '#38bdf8', icon: '🏷️', group: 'Promos' },
  { key: 'campaign',    label: 'Campaña',            color: '#1d4ed8', icon: '📣' },
  { key: 'coupon',      label: 'Cupón',              color: '#22c55e', icon: '🎟️' },
  { key: 'flow',        label: 'Flow',               color: '#9ca3af', icon: '⚙️', dotted: true },
  { key: 'push',        label: 'Push 🔔',            color: '#6366f1', icon: '🔔' },
  { key: 'email',       label: 'Email 📧',           color: '#14b8a6', icon: '📧' },
  { key: 'whatsapp',    label: 'WhatsApp 💬',        color: '#25D366', icon: '💬' },
  { key: 'social_post', label: 'Post/Story 📸',      color: '#ec4899', icon: '📸' },
  { key: 'punch_card',  label: 'Punch Card 🎴',      color: '#f97316', icon: '🎴', system: true, dotted: true },
  { key: 'streak_risk', label: 'Racha en Riesgo 🔥', color: '#d97706', icon: '🔥', dotted: true, system: true },
  { key: 'key_date',    label: 'Fecha Clave ⭐',     color: '#facc15', icon: '⭐', isKeyDate: true },
];

const ALL_CATEGORIES = ['promotion', 'campaign', 'coupon', 'flow', 'punch_card', 'push', 'email', 'whatsapp', 'social_post', 'streak_risk'];

const CalendarHeader = ({
  currentView,
  onViewChange,
  currentDate,
  onNavigate,
  onToday,
  activeCategories,
  onToggleCategory,
  statusFilter,
  onStatusFilter,
  showPrevYear,
  onTogglePrevYear,
  calendarMode,
  onCalendarModeChange,
  onExport,
  onSaveTemplate,
  onQuickAction,
  hasSystemItems,
  allCategories,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const isAllSelected = activeCategories?.length === (allCategories || ALL_CATEGORIES)?.length;

  // Check if currently viewing today (for disabling "Ir a hoy" in day view)
  const isViewingToday = (() => {
    if (currentView !== 'day') return false;
    const today = new Date();
    return (currentDate?.getFullYear() === today?.getFullYear() &&
    currentDate?.getMonth() === today?.getMonth() && currentDate?.getDate() === today?.getDate());
  })();

  const getTitle = () => {
    const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    if (currentView === 'month') return `${months?.[currentDate?.getMonth()]} ${currentDate?.getFullYear()}`;
    if (currentView === 'week') {
      const start = new Date(currentDate);
      const day = start?.getDay();
      const diff = start?.getDate() - day + (day === 0 ? -6 : 1);
      start?.setDate(diff);
      const end = new Date(start);
      end?.setDate(start?.getDate() + 6);
      return `${start?.getDate()} – ${end?.getDate()} ${months?.[end?.getMonth()]} ${end?.getFullYear()}`;
    }
    if (currentView === 'day') {
      const days = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
      return `${days?.[currentDate?.getDay()]}, ${currentDate?.getDate()} de ${months?.[currentDate?.getMonth()]} ${currentDate?.getFullYear()}`;
    }
    if (currentView === 'list') return `Lista — ${currentDate?.getFullYear()}`;
    return '';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

      {/* ── CAPA 1: Modo Planificación / Operación ── */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Modo:</span>
          <div className="flex bg-white border border-gray-200 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => onCalendarModeChange?.('planning')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                calendarMode === 'planning' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ✨ Planificación
            </button>
            <button
              onClick={() => onCalendarModeChange?.('operation')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                calendarMode === 'operation' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ⚡ Operación
            </button>
          </div>
        </div>
      </div>

      {/* ── CAPA 2: Navegación temporal — su propia fila ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <button
          onClick={() => onNavigate(-1)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Período anterior"
        >
          <Icon name="ChevronLeft" size={18} />
        </button>

        <h2 className="text-base font-semibold text-gray-900 min-w-[200px] text-center">{getTitle()}</h2>

        <button
          onClick={() => onNavigate(1)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Período siguiente"
        >
          <Icon name="ChevronRight" size={18} />
        </button>

        {/* Ir a hoy — disabled when already viewing today in day view */}
        <button
          onClick={isViewingToday ? undefined : onToday}
          disabled={isViewingToday}
          title={isViewingToday ? 'Ya estás viendo el día de hoy' : 'Volver al período actual'}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
            isViewingToday
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' :'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 cursor-pointer'
          }`}
        >
          <Icon name="CalendarDays" size={14} />
          Ir a hoy
        </button>
      </div>

      {/* ── CAPA 3: Tipo de vista ── */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100">
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {VIEWS?.map(v => (
            <button
              key={v?.key}
              onClick={() => onViewChange(v?.key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                currentView === v?.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {v?.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CAPA 4: Filtros de contenido ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {CATEGORY_FILTERS?.map(cat => {
            const isActive = cat?.isAll ? isAllSelected : activeCategories?.includes(cat?.key);
            return (
              <button
                key={cat?.key}
                onClick={() => onToggleCategory?.(cat?.isAll ? 'all' : cat?.key)}
                title={cat?.isAll ? 'Mostrar todos los tipos' : `Filtrar por ${cat?.label}`}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  isActive
                    ? 'border-transparent text-white shadow-sm'
                    : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
                style={isActive ? { backgroundColor: cat?.color, borderColor: cat?.color } : {}}
              >
                <span className="hidden sm:inline">{cat?.label}</span>
                <span className="w-2 h-2 rounded-full sm:hidden" style={{ backgroundColor: cat?.color }} />
              </button>
            );
          })}
          {/* Clear filters — shown when not all selected */}
          {!isAllSelected && (
            <button
              onClick={() => onToggleCategory?.('all')}
              className="px-2.5 py-1.5 text-xs font-medium text-gray-400 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* ── CAPA 5: Leyenda ── */}
      <div className="flex items-start gap-3 px-4 py-2 bg-gray-50 flex-wrap">
        <span className="text-xs text-gray-400 font-medium mt-0.5">Leyenda:</span>
        {/* Promos group */}
        <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-lg px-2 py-1">
          <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wide">Promos:</span>
          {LEGEND_ITEMS?.filter(i => i?.group === 'Promos')?.map(item => (
            <div key={item?.key} className="flex items-center gap-0.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item?.color }} />
              <span className="text-[10px] text-gray-500">{item?.label}</span>
            </div>
          ))}
        </div>
        {/* Other items */}
        {LEGEND_ITEMS?.filter(i => !i?.group)?.map(item => (
          <div key={item?.key} className="flex items-center gap-1">
            {item?.dotted ? (
              <div className="w-5 h-2 border-2 border-dashed rounded" style={{ borderColor: item?.color }} />
            ) : item?.isKeyDate ? (
              <div className="w-3 h-3 rounded-sm border-2" style={{ borderColor: item?.color, backgroundColor: 'rgba(250,204,21,0.15)' }} />
            ) : (
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item?.color }} />
            )}
            <span className={`text-xs ${item?.system ? 'text-gray-400 italic' : 'text-gray-500'}`}>{item?.label}</span>
          </div>
        ))}
        {/* Italic note — only shown when system items exist */}
        {hasSystemItems && (
          <span className="text-[10px] text-gray-300 italic ml-1">* cursiva = generado por sistema</span>
        )}
      </div>
    </div>
  );
};

export default CalendarHeader;
