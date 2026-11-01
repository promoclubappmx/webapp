import React, { useState } from 'react';
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

const STATUS_LABELS = {
  active: { label: 'Activa', cls: 'bg-green-100 text-green-700' },
  scheduled: { label: 'Programada', cls: 'bg-blue-100 text-blue-700' },
  finished: { label: 'Finalizada', cls: 'bg-gray-100 text-gray-600' },
  paused: { label: 'Pausada', cls: 'bg-amber-100 text-amber-700' },
};

const ListView = ({ items, keyDates, activeCategories, statusFilter, currentDate }) => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedItems, setSelectedItems] = useState([]);
  const [hoveredItem, setHoveredItem] = useState(null);

  const year = currentDate?.getFullYear();

  const filteredItems = items?.filter(item => {
    if (!activeCategories?.includes(item?.category)) return false;
    if (statusFilter !== 'all') {
      if (statusFilter === 'active' && item?.status !== 'active') return false;
      if (statusFilter === 'scheduled' && item?.status !== 'scheduled') return false;
      if (statusFilter === 'finished' && item?.status !== 'finished') return false;
    }
    return item?.startDate?.startsWith(String(year));
  });

  const sortedItems = [...filteredItems]?.sort((a, b) => {
    let valA, valB;
    if (sortBy === 'date') { valA = a?.startDate; valB = b?.startDate; }
    else if (sortBy === 'type') { valA = a?.type; valB = b?.type; }
    else if (sortBy === 'status') { valA = a?.status; valB = b?.status; }
    else if (sortBy === 'title') { valA = a?.title; valB = b?.title; }
    else { valA = a?.startDate; valB = b?.startDate; }
    const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const toggleSelect = (id) => {
    setSelectedItems(prev => prev?.includes(id) ? prev?.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedItems?.length === sortedItems?.length) setSelectedItems([]);
    else setSelectedItems(sortedItems?.map(i => i?.id));
  };

  const SortIcon = ({ col }) => (
    <Icon
      name={sortBy === col ? (sortDir === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'}
      size={12}
      className={sortBy === col ? 'text-indigo-600' : 'text-gray-300'}
    />
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Bulk actions bar */}
      {selectedItems?.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 border-b border-indigo-100">
          <span className="text-sm font-medium text-indigo-700">{selectedItems?.length} seleccionados</span>
          <div className="flex items-center gap-2">
            {[
              { label: 'Pausar todos', icon: 'Pause' },
              { label: 'Duplicar', icon: 'Copy' },
              { label: 'Mover al siguiente mes', icon: 'CalendarArrowRight' },
              { label: 'Eliminar', icon: 'Trash2', danger: true },
            ]?.map(action => (
              <button
                key={action?.label}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                  action?.danger
                    ? 'border-red-200 text-red-600 hover:bg-red-50' :'border-indigo-200 text-indigo-600 hover:bg-indigo-100'
                }`}
              >
                <Icon name={action?.icon} size={12} />
                {action?.label}
              </button>
            ))}
          </div>
          <button onClick={() => setSelectedItems([])} className="ml-auto text-gray-400 hover:text-gray-600">
            <Icon name="X" size={14} />
          </button>
        </div>
      )}
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedItems?.length === sortedItems?.length && sortedItems?.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              {[
                { key: 'date', label: 'Fecha' },
                { key: 'type', label: 'Tipo' },
                { key: 'title', label: 'Nombre' },
                { key: 'status', label: 'Estado' },
                { key: 'reach', label: 'Alcance estimado' },
              ]?.map(col => (
                <th
                  key={col?.key}
                  onClick={() => handleSort(col?.key)}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none"
                >
                  <div className="flex items-center gap-1">
                    {col?.label}
                    <SortIcon col={col?.key} />
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedItems?.map(item => {
              const colors = colorMap?.[item?.type] || colorMap?.promo;
              const statusInfo = STATUS_LABELS?.[item?.status] || STATUS_LABELS?.scheduled;
              const isSelected = selectedItems?.includes(item?.id);

              return (
                <tr
                  key={item?.id}
                  className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-indigo-50/50' : ''}`}
                  onMouseEnter={() => setHoveredItem(item?.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(item?.id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-700">{item?.startDate}</div>
                    {item?.startDate !== item?.endDate && (
                      <div className="text-xs text-gray-400">→ {item?.endDate}</div>
                    )}
                    <div className="text-xs text-gray-400">{item?.startHour}:00 – {item?.endHour}:00</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: colors?.bg }} />
                      <span className="text-xs font-medium text-gray-700">{ITEM_COLORS?.[item?.type]?.label || item?.type}</span>
                      {item?.isSystemGenerated && (
                        <span className="text-[9px] bg-gray-100 text-gray-500 px-1 rounded">Sistema</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{item?.title}</div>
                    {item?.description && (
                      <div className="text-xs text-gray-400 truncate max-w-[200px]">{item?.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo?.cls}`}>
                      {statusInfo?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {item?.metrics ? (
                      <div className="text-xs text-gray-600 space-y-0.5">
                        {item?.metrics?.canjes > 0 && <div>🎯 {item?.metrics?.canjes} canjes</div>}
                        {item?.metrics?.revenue > 0 && <div>💰 ${item?.metrics?.revenue?.toLocaleString()}</div>}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate(item?.origin)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Ver en módulo"
                      >
                        <Icon name="ExternalLink" size={14} />
                      </button>
                      {!item?.isSystemGenerated && (
                        <>
                          <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                            <Icon name="Pencil" size={14} />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                            <Icon name="Trash2" size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sortedItems?.length === 0 && (
          <div className="py-16 text-center">
            <Icon name="Calendar" size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-400">No hay eventos que coincidan con los filtros</p>
          </div>
        )}
      </div>
      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">{sortedItems?.length} eventos en {year}</span>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-white transition-colors">
          <Icon name="Download" size={12} />
          Exportar CSV
        </button>
      </div>
    </div>
  );
};

export default ListView;
