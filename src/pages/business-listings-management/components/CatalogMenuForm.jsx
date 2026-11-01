import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';

// ─── Order Ahead Status Banner ────────────────────────────────────────────────
const OrderAheadBanner = ({ isActive, onToggle }) => (
  <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
    isActive ? 'border-emerald-400 bg-emerald-50' : 'border-border bg-muted/20'
  }`}>
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isActive ? 'bg-emerald-600' : 'bg-muted'
      }`}>
        <Icon name="ShoppingCart" size={20} className={isActive ? 'text-white' : 'text-muted-foreground'} />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">Order Ahead</p>
        <p className="text-xs text-muted-foreground">
          {isActive
            ? '✅ Activo — los clientes pueden hacer pedidos anticipados'
            : 'Inactivo — los clientes no pueden hacer pedidos anticipados'}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
        isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
      }`}>
        {isActive ? 'ACTIVO' : 'INACTIVO'}
      </span>
      <button
        onClick={onToggle}
        className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
          isActive ? 'bg-emerald-500' : 'bg-muted'
        }`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          isActive ? 'translate-x-6' : 'translate-x-0.5'
        }`} />
      </button>
    </div>
  </div>
);

// ─── Product Search Dropdown ──────────────────────────────────────────────────
const ProductSearchDropdown = ({ selectedItems, onAdd }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(e?.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!search?.trim()) { setResults([]); return; }
    const timer = setTimeout(() => fetchItems(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchItems = async (q) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        ?.from('catalog_items')
        ?.select('id, name, price, category, description, image_url, type')
        ?.eq('business_id', user?.id)
        ?.ilike('name', `%${q}%`)
        ?.limit(20);
      setResults(data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const isSelected = (id) => selectedItems?.some(i => i?.id === id);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 bg-background focus-within:ring-2 focus-within:ring-emerald-300/40 focus-within:border-emerald-400">
        <Icon name="Search" size={16} className="text-muted-foreground flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e?.target?.value); setShowDropdown(true); }}
          onFocus={() => search?.trim() && setShowDropdown(true)}
          placeholder="Buscar producto o servicio del catálogo..."
          className="flex-1 bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground"
        />
        {loading && <Icon name="Loader" size={14} className="text-muted-foreground animate-spin flex-shrink-0" />}
        {search && !loading && (
          <button onClick={() => { setSearch(''); setResults([]); setShowDropdown(false); }}
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
            <Icon name="X" size={14} />
          </button>
        )}
      </div>
      {showDropdown && search?.trim() && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-xl shadow-xl max-h-72 overflow-y-auto">
          {results?.length === 0 && !loading ? (
            <div className="p-6 text-center">
              <Icon name="PackageSearch" size={28} className="mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No se encontraron productos o servicios</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Verifica que existan en tu catálogo</p>
            </div>
          ) : (
            results?.map(item => {
              const selected = isSelected(item?.id);
              return (
                <button
                  key={item?.id}
                  onClick={() => {
                    if (!selected) {
                      onAdd(item);
                      setSearch('');
                      setResults([]);
                      setShowDropdown(false);
                    }
                  }}
                  disabled={selected}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border last:border-0 ${
                    selected ? 'opacity-40 cursor-not-allowed bg-muted/20' : 'hover:bg-muted/40'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item?.image_url
                      ? <img src={item?.image_url} alt={item?.name} className="w-full h-full object-cover rounded-lg" />
                      : <Icon name={item?.type === 'service' ? 'Briefcase' : 'Package'} size={16} className="text-emerald-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item?.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item?.category && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          <Icon name="Tag" size={10} />
                          {item?.category}
                        </span>
                      )}
                      {item?.type && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          item?.type === 'service' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item?.type === 'service' ? 'Servicio' : 'Producto'}
                        </span>
                      )}
                    </div>
                  </div>
                  {item?.price != null && (
                    <span className="text-sm font-semibold text-emerald-600 flex-shrink-0">${item?.price}</span>
                  )}
                  {selected && <span className="text-xs text-muted-foreground flex-shrink-0">Ya agregado</span>}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const CatalogMenuForm = ({ formData, onChange }) => {
  const [orderAheadActive, setOrderAheadActive] = useState(formData?.orderAheadActive || false);
  const [catalogItems, setCatalogItems] = useState(formData?.catalogItems || []);
  const [activeFilter, setActiveFilter] = useState('all');

  // Sync with formData
  useEffect(() => {
    if (formData?.catalogItems) setCatalogItems(formData?.catalogItems);
  }, []);

  const updateItems = (updated) => {
    setCatalogItems(updated);
    onChange('catalogItems', updated);
  };

  const addItem = (item) => {
    const newItem = {
      ...item,
      catalogItemId: `${item?.id}_${Date.now()}`,
      available: true,
      featured: false,
      saleMode: 'catalog', // 'online' | 'catalog'
    };
    updateItems([...catalogItems, newItem]);
  };

  const removeItem = (catalogItemId) => {
    updateItems(catalogItems?.filter(i => i?.catalogItemId !== catalogItemId));
  };

  const toggleField = (catalogItemId, field) => {
    updateItems(catalogItems?.map(i =>
      i?.catalogItemId === catalogItemId ? { ...i, [field]: !i?.[field] } : i
    ));
  };

  const setSaleMode = (catalogItemId, mode) => {
    updateItems(catalogItems?.map(i =>
      i?.catalogItemId === catalogItemId ? { ...i, saleMode: mode } : i
    ));
  };

  // Group items by category for display
  const categories = [...new Set(catalogItems?.map(i => i?.category || 'Sin categoría'))];

  const filteredItems = activeFilter === 'all'
    ? catalogItems
    : activeFilter === 'online'
      ? catalogItems?.filter(i => i?.saleMode === 'online')
      : activeFilter === 'catalog'
        ? catalogItems?.filter(i => i?.saleMode === 'catalog')
        : catalogItems?.filter(i => i?.category === activeFilter || (!i?.category && activeFilter === 'Sin categoría'));

  const onlineCount = catalogItems?.filter(i => i?.saleMode === 'online')?.length;
  const catalogCount = catalogItems?.filter(i => i?.saleMode === 'catalog')?.length;

  return (
    <div className="space-y-6">
      {/* ── Order Ahead Banner ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-emerald-500 rounded-full" />
          <h3 className="text-base font-semibold text-foreground">Venta en línea</h3>
        </div>
        <OrderAheadBanner
          isActive={orderAheadActive}
          onToggle={() => {
            const next = !orderAheadActive;
            setOrderAheadActive(next);
            onChange('orderAheadActive', next);
          }}
        />
        {orderAheadActive && (
          <div className="mt-3 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <Icon name="Info" size={15} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              Order Ahead activo. Los productos marcados como <strong>Venta en línea</strong> estarán disponibles para pedidos anticipados.
              Configura los detalles en{' '}
              <a href="/order-ahead-management" className="font-semibold underline hover:text-blue-900">Gestión de Order Ahead</a>.
            </p>
          </div>
        )}
      </div>
      {/* ── Catálogo / Menú ── */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-emerald-500 rounded-full" />
            <h3 className="text-base font-semibold text-foreground">Catálogo / Menú</h3>
          </div>
          {catalogItems?.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {catalogItems?.length} items
              </span>
              {onlineCount > 0 && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                  {onlineCount} en línea
                </span>
              )}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Busca y selecciona los productos o servicios de tu catálogo. La categoría se muestra automáticamente. Elige si cada item se vende en línea o solo aparece como catálogo.
        </p>

        {/* Search */}
        <div className="mb-5">
          <ProductSearchDropdown
            selectedItems={catalogItems}
            onAdd={addItem}
          />
        </div>

        {/* Filter tabs */}
        {catalogItems?.length > 0 && (
          <div className="flex gap-1 mb-4 bg-muted/40 p-1 rounded-xl overflow-x-auto">
            {[
              { id: 'all', label: `Todos (${catalogItems?.length})` },
              { id: 'online', label: `Venta en línea (${onlineCount})` },
              { id: 'catalog', label: `Solo catálogo (${catalogCount})` },
              ...categories?.map(cat => ({ id: cat, label: cat })),
            ]?.map(tab => (
              <button
                key={tab?.id}
                onClick={() => setActiveFilter(tab?.id)}
                className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  activeFilter === tab?.id
                    ? 'bg-card shadow text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab?.label}
              </button>
            ))}
          </div>
        )}

        {/* Items list */}
        {catalogItems?.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-2xl p-10 text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="PackageSearch" size={28} className="text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">Sin productos aún</p>
            <p className="text-xs text-muted-foreground">Usa el buscador para agregar productos o servicios de tu catálogo</p>
          </div>
        ) : filteredItems?.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-8 text-center">
            <Icon name="Filter" size={24} className="mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No hay items con este filtro</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems?.map(item => (
              <div
                key={item?.catalogItemId}
                className={`border rounded-2xl overflow-hidden transition-all ${
                  item?.saleMode === 'online' ?'border-emerald-200 bg-emerald-50/30' :'border-border bg-card'
                }`}
              >
                <div className="flex items-center gap-3 p-3">
                  {/* Image */}
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item?.image_url
                      ? <img src={item?.image_url} alt={item?.name} className="w-full h-full object-cover rounded-xl" />
                      : <Icon name={item?.type === 'service' ? 'Briefcase' : 'Package'} size={18} className="text-emerald-600" />
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground truncate">{item?.name}</p>
                      {item?.featured && (
                        <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">⭐ Destacado</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {/* Category badge — auto from catalog */}
                      {item?.category && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          <Icon name="Tag" size={10} />
                          {item?.category}
                        </span>
                      )}
                      {item?.type && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          item?.type === 'service' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item?.type === 'service' ? 'Servicio' : 'Producto'}
                        </span>
                      )}
                      {item?.price != null && (
                        <span className="text-xs font-bold text-emerald-600">${item?.price}</span>
                      )}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Featured star */}
                    <button
                      onClick={() => toggleField(item?.catalogItemId, 'featured')}
                      title={item?.featured ? 'Quitar destacado' : 'Marcar como destacado'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        item?.featured ? 'text-amber-500 bg-amber-50' : 'text-muted-foreground hover:text-amber-500 hover:bg-amber-50'
                      }`}
                    >
                      <Icon name="Star" size={15} className={item?.featured ? 'fill-amber-400' : ''} />
                    </button>

                    {/* Available toggle */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground hidden md:block">Disponible</span>
                      <button
                        onClick={() => toggleField(item?.catalogItemId, 'available')}
                        className={`relative w-9 h-5 rounded-full transition-colors ${item?.available ? 'bg-emerald-500' : 'bg-muted'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${item?.available ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item?.catalogItemId)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                    >
                      <Icon name="Trash2" size={15} />
                    </button>
                  </div>
                </div>

                {/* Sale mode selector */}
                <div className="px-3 pb-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSaleMode(item?.catalogItemId, 'online')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                        item?.saleMode === 'online' ?'border-emerald-400 bg-emerald-600 text-white shadow-sm' :'border-border text-muted-foreground hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <Icon name="ShoppingCart" size={13} />
                      Venta en línea
                    </button>
                    <button
                      onClick={() => setSaleMode(item?.catalogItemId, 'catalog')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                        item?.saleMode === 'catalog' ?'border-blue-400 bg-blue-600 text-white shadow-sm' :'border-border text-muted-foreground hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                    >
                      <Icon name="BookOpen" size={13} />
                      Solo catálogo
                    </button>
                  </div>
                  {item?.saleMode === 'online' && !orderAheadActive && (
                    <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                      <Icon name="AlertTriangle" size={11} />
                      Activa Order Ahead para habilitar la venta en línea
                    </p>
                  )}
                  {item?.saleMode === 'catalog' && (
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                      <Icon name="Eye" size={11} />
                      El precio y producto se muestran en la app como catálogo
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Summary */}
      {catalogItems?.length > 0 && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="CheckCircle" size={16} className="text-emerald-600" />
            <p className="text-sm font-semibold text-emerald-700">Resumen del catálogo</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-3 text-center border border-emerald-100">
              <p className="text-xl font-bold text-foreground">{catalogItems?.length}</p>
              <p className="text-xs text-muted-foreground">Total items</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-emerald-100">
              <p className="text-xl font-bold text-emerald-600">{onlineCount}</p>
              <p className="text-xs text-muted-foreground">Venta en línea</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-emerald-100">
              <p className="text-xl font-bold text-blue-600">{catalogCount}</p>
              <p className="text-xs text-muted-foreground">Solo catálogo</p>
            </div>
          </div>
          {categories?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-emerald-700 mb-2">Categorías presentes:</p>
              <div className="flex flex-wrap gap-1.5">
                {categories?.map(cat => (
                  <span key={cat} className="text-xs px-2.5 py-1 bg-white border border-emerald-200 text-emerald-700 rounded-full font-medium">
                    {cat} ({catalogItems?.filter(i => (i?.category || 'Sin categoría') === cat)?.length})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CatalogMenuForm;
