import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import EstablishmentCard from './EstablishmentCard';
import KPIsDrawer from './KPIsDrawer';

const SORT_OPTIONS = [
  { value: 'activity', label: 'Actividad reciente' },
  { value: 'name', label: 'Nombre A-Z' },
  { value: 'visits', label: 'Más visitas' },
  { value: 'revenue', label: 'Mayor revenue' },
  { value: 'created', label: 'Fecha de creación' },
];

const STATUS_FILTERS = ['Todos', 'Activos', 'En configuración', 'Pausados'];

const BulkActionsBar = ({ selectedIds, onActivate, onPause, onDelete, onDeselect }) => {
  const count = selectedIds?.length;
  if (count === 0) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-card border border-border shadow-2xl rounded-2xl px-5 py-3 animate-in slide-in-from-bottom-4 duration-200">
      <span className="text-sm font-bold text-foreground whitespace-nowrap">
        <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-bold mr-1.5">{count}</span>
        seleccionado{count !== 1 ? 's' : ''}
      </span>
      <div className="w-px h-6 bg-border" />
      <button
        onClick={onActivate}
        className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-3 py-1.5 rounded-xl transition-colors"
      >
        <Icon name="Play" size={14} />
        Activar todos
      </button>
      <button
        onClick={onPause}
        className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 px-3 py-1.5 rounded-xl transition-colors"
      >
        <Icon name="Pause" size={14} />
        Pausar todos
      </button>
      <button
        onClick={onDelete}
        className="flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-1.5 rounded-xl transition-colors"
      >
        <Icon name="Trash2" size={14} />
        Eliminar
      </button>
      <div className="w-px h-6 bg-border" />
      <button
        onClick={onDeselect}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-xl transition-colors"
      >
        <Icon name="X" size={13} />
        Deseleccionar
      </button>
    </div>
  );
};

const DeleteConfirmModal = ({ count, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-950/30 rounded-xl flex items-center justify-center">
          <Icon name="Trash2" size={20} className="text-red-500" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Eliminar establecimientos</h3>
          <p className="text-xs text-muted-foreground">Esta acción no se puede deshacer</p>
        </div>
      </div>
      <p className="text-sm text-foreground mb-6">
        ¿Estás seguro de que deseas eliminar <strong>{count} establecimiento{count !== 1 ? 's' : ''}</strong>? Se perderán todos los datos asociados.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          Eliminar definitivamente
        </button>
      </div>
    </div>
  </div>
);

const EstablishmentsGrid = ({ establishments, onKPIs, onManage }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [cityFilter, setCityFilter] = useState('Todas');
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [sortBy, setSortBy] = useState('activity');
  const [viewMode, setViewMode] = useState('grid');
  const [kpisEstablishment, setKpisEstablishment] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const handleKPIs = (est) => {
    if (onKPIs) {
      onKPIs(est);
    } else {
      setKpisEstablishment(est);
    }
  };

  // Extract unique cities
  const cities = useMemo(() => {
    const citySet = new Set(
      establishments?.map(e => e?.location?.split(',')?.[1]?.trim())?.filter(Boolean)
    );
    return ['Todas', ...Array.from(citySet)];
  }, [establishments]);

  // Extract unique categories
  const categories = useMemo(() => {
    const catSet = new Set(establishments?.map(e => e?.category)?.filter(Boolean));
    return Array.from(catSet);
  }, [establishments]);

  const filtered = useMemo(() => {
    let list = [...establishments];
    if (search) list = list?.filter(e => e?.name?.toLowerCase()?.includes(search?.toLowerCase()));
    if (statusFilter !== 'Todos') {
      const map = { 'Activos': 'published', 'En configuración': 'setup', 'Pausados': 'paused' };
      list = list?.filter(e => e?.status === map?.[statusFilter]);
    }
    if (cityFilter !== 'Todas') {
      list = list?.filter(e => e?.location?.includes(cityFilter));
    }
    if (categoryFilters?.length > 0) {
      list = list?.filter(e => categoryFilters?.includes(e?.category));
    }
    list?.sort((a, b) => {
      if (sortBy === 'name') return a?.name?.localeCompare(b?.name);
      if (sortBy === 'visits') return b?.metrics?.visitsToday - a?.metrics?.visitsToday;
      if (sortBy === 'revenue') return b?.revenueMonth - a?.revenueMonth;
      if (sortBy === 'created') return new Date(b.createdAt) - new Date(a.createdAt);
      return new Date(b.lastActivity) - new Date(a.lastActivity);
    });
    return list;
  }, [establishments, search, statusFilter, cityFilter, categoryFilters, sortBy]);

  const allFilteredIds = filtered?.map(e => e?.id);
  const allSelected = allFilteredIds?.length > 0 && allFilteredIds?.every(id => selectedIds?.includes(id));

  const toggleSelection = (id) => {
    setSelectedIds(prev =>
      prev?.includes(id) ? prev?.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(prev => prev?.filter(id => !allFilteredIds?.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...allFilteredIds])]);
    }
  };

  const handleDeselect = () => {
    setSelectedIds([]);
    setSelectionMode(false);
  };

  const handleBulkActivate = () => {
    // In real app: call API to activate selected
    setSelectedIds([]);
    setSelectionMode(false);
  };

  const handleBulkPause = () => {
    // In real app: call API to pause selected
    setSelectedIds([]);
    setSelectionMode(false);
  };

  const handleBulkDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    // In real app: call API to delete selected
    setShowDeleteModal(false);
    setSelectedIds([]);
    setSelectionMode(false);
  };

  const toggleCategory = (cat) => {
    setCategoryFilters(prev =>
      prev?.includes(cat) ? prev?.filter(c => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="space-y-4">
      {/* Controls row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar establecimiento..."
            value={search}
            onChange={e => setSearch(e?.target?.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* City filter */}
          <select
            value={cityFilter}
            onChange={e => setCityFilter(e?.target?.value)}
            className="text-sm bg-card border border-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
          >
            {cities?.map(c => <option key={c} value={c}>{c === 'Todas' ? 'Todas las ciudades' : c}</option>)}
          </select>

          {/* Category multi-select dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(prev => !prev)}
              className={`flex items-center gap-2 text-sm border rounded-xl px-3 py-2.5 transition-all cursor-pointer ${
                categoryFilters?.length > 0
                  ? 'bg-primary/10 border-primary text-primary' :'bg-card border-border text-foreground hover:bg-muted'
              }`}
            >
              <Icon name="Tag" size={14} />
              {categoryFilters?.length > 0 ? `${categoryFilters?.length} categoría${categoryFilters?.length !== 1 ? 's' : ''}` : 'Categorías'}
              <Icon name="ChevronDown" size={13} className={`transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showCategoryDropdown && (
              <div className="absolute top-full mt-1 right-0 z-30 bg-card border border-border rounded-xl shadow-xl w-52 py-2 overflow-hidden">
                <div className="px-3 pb-2 border-b border-border">
                  <button
                    onClick={() => setCategoryFilters([])}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Limpiar selección
                  </button>
                </div>
                {categories?.map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      categoryFilters?.includes(cat)
                        ? 'bg-primary border-primary' :'border-border'
                    }`}>
                      {categoryFilters?.includes(cat) && <Icon name="Check" size={10} className="text-primary-foreground" />}
                    </div>
                    <span className="truncate">{cat}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e?.target?.value)}
            className="text-sm bg-card border border-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
          >
            {SORT_OPTIONS?.map(o => <option key={o?.value} value={o?.value}>{o?.label}</option>)}
          </select>
          <div className="flex border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 transition-colors ${ viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted text-muted-foreground'}`}
            >
              <Icon name="LayoutGrid" size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 transition-colors ${ viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted text-muted-foreground'}`}
            >
              <Icon name="List" size={16} />
            </button>
          </div>
          {/* Selection mode toggle */}
          <button
            onClick={() => { setSelectionMode(prev => !prev); if (selectionMode) setSelectedIds([]); }}
            className={`flex items-center gap-1.5 text-sm border rounded-xl px-3 py-2.5 transition-all ${
              selectionMode
                ? 'bg-primary/10 border-primary text-primary' :'bg-card border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            <Icon name="CheckSquare" size={15} />
            Seleccionar
          </button>
        </div>
      </div>

      {/* Filter pills - status + select all */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS?.map(f => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
              statusFilter === f ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {f}
          </button>
        ))}
        {/* Select all toggle - shown when in selection mode or items are visible */}
        {(selectionMode || selectedIds?.length > 0) && filtered?.length > 0 && (
          <button
            onClick={toggleSelectAll}
            className={`ml-auto flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
              allSelected
                ? 'bg-primary/10 border-primary text-primary' :'border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
              allSelected ? 'bg-primary border-primary' : 'border-current'
            }`}>
              {allSelected && <Icon name="Check" size={9} className="text-primary-foreground" />}
            </div>
            {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
          </button>
        )}
      </div>

      {/* Grid view */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered?.map(e => (
            <div key={e?.id} className="relative group">
              {/* Checkbox overlay */}
              {(selectionMode || selectedIds?.includes(e?.id)) && (
                <button
                  onClick={() => toggleSelection(e?.id)}
                  className="absolute top-3 left-3 z-20"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shadow-sm transition-all ${
                    selectedIds?.includes(e?.id)
                      ? 'bg-primary border-primary' :'bg-card/90 border-border hover:border-primary'
                  }`}>
                    {selectedIds?.includes(e?.id) && <Icon name="Check" size={11} className="text-primary-foreground" />}
                  </div>
                </button>
              )}
              {/* Hover checkbox (non-selection mode) */}
              {!selectionMode && !selectedIds?.includes(e?.id) && (
                <button
                  onClick={() => { setSelectionMode(true); toggleSelection(e?.id); }}
                  className="absolute top-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="w-5 h-5 rounded border-2 bg-card/90 border-border hover:border-primary shadow-sm transition-all" />
                </button>
              )}
              <div className={`transition-all duration-150 ${
                selectedIds?.includes(e?.id) ? 'ring-2 ring-primary ring-offset-1 rounded-xl' : ''
              }`}>
                <EstablishmentCard establishment={e} onKPIs={handleKPIs} onManage={onManage} />
              </div>
            </div>
          ))}
          {/* Add new card */}
          <button
            onClick={() => navigate('/business-listing-wizard')}
            className="min-h-[280px] border-2 border-dashed border-border hover:border-primary/50 rounded-xl flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-primary transition-all duration-200 group"
          >
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icon name="Plus" size={24} />
            </div>
            <span className="text-sm font-semibold">Agregar establecimiento</span>
          </button>
        </div>
      ) : (
        /* List view */
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {/* Checkbox column */}
                <th className="px-4 py-3 w-10">
                  <button onClick={toggleSelectAll}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                      allSelected ? 'bg-primary border-primary' : 'border-border hover:border-primary'
                    }`}>
                      {allSelected && <Icon name="Check" size={9} className="text-primary-foreground" />}
                    </div>
                  </button>
                </th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Negocio</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden md:table-cell">Categoría</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden md:table-cell">Ciudad</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Estado</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Visitas hoy</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3 hidden lg:table-cell">Rating</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered?.map(e => (
                <tr key={e?.id} className={`hover:bg-muted/30 transition-colors ${
                  selectedIds?.includes(e?.id) ? 'bg-primary/5' : ''
                }`}>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSelection(e?.id)}>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                        selectedIds?.includes(e?.id)
                          ? 'bg-primary border-primary' :'border-border hover:border-primary'
                      }`}>
                        {selectedIds?.includes(e?.id) && <Icon name="Check" size={9} className="text-primary-foreground" />}
                      </div>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: e?.logoColor }}>
                        {e?.initial}
                      </div>
                      <span className="text-sm font-semibold text-foreground">{e?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">{e?.category}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">{e?.location?.split(',')?.[1]?.trim() || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${
                      e?.status === 'published' ? 'text-emerald-600' : e?.status === 'setup' ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      {e?.status === 'published' ? '✅ Publicado' : e?.status === 'setup' ? '⚙️ Config.' : '⏸ Pausado'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-semibold ${ e?.metrics?.visitsToday > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                      {e?.metrics?.visitsToday}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell">
                    <span className="text-sm text-foreground">{e?.metrics?.rating > 0 ? `⭐ ${e?.metrics?.rating}` : '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate('/business-listings-management')}
                      className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Administrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!onKPIs && kpisEstablishment && (
        <KPIsDrawer establishment={kpisEstablishment} onClose={() => setKpisEstablishment(null)} />
      )}

      {/* Bulk actions floating bar */}
      <BulkActionsBar
        selectedIds={selectedIds}
        onActivate={handleBulkActivate}
        onPause={handleBulkPause}
        onDelete={handleBulkDelete}
        onDeselect={handleDeselect}
      />

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          count={selectedIds?.length}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {/* Click outside to close category dropdown */}
      {showCategoryDropdown && (
        <div className="fixed inset-0 z-20" onClick={() => setShowCategoryDropdown(false)} />
      )}
    </div>
  );
};

export default EstablishmentsGrid;
