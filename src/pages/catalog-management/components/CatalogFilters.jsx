import React from 'react';


import Icon from '../../../components/AppIcon';

const StyledSelect = ({ value, onChange, options, placeholder }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e?.target?.value)}
      className="w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 pr-9 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors cursor-pointer hover:border-primary/60"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options?.map(opt => (
        <option key={opt?.value} value={opt?.value}>{opt?.label}</option>
      ))}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-muted-foreground">
      <Icon name="ChevronDown" size={14} />
    </div>
  </div>
);

const CatalogFilters = ({ filters, onFilterChange, onClearFilters, categories = [], activeTab }) => {
  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' },
    { value: 'draft', label: 'Borradores' },
    { value: 'discontinued', label: 'Descontinuados' }
  ];

  const featuredOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'featured', label: 'Destacados' },
    { value: 'not_featured', label: 'No destacados' }
  ];

  const sortOptions = [
    { value: 'created_desc', label: 'Más recientes primero' },
    { value: 'created_asc', label: 'Más antiguos primero' },
    { value: 'name_asc', label: 'Nombre A-Z' },
    { value: 'name_desc', label: 'Nombre Z-A' },
    { value: 'price_asc', label: 'Precio menor a mayor' },
    { value: 'price_desc', label: 'Precio mayor a menor' }
  ];

  const getFilteredCategories = () => {
    if (activeTab === 'categories') return [];
    const businessType = activeTab === 'products' ? 'product' : activeTab === 'services' ? 'service' : null;
    if (!businessType) return categories;
    return categories?.filter(cat => cat?.businessType === businessType);
  };

  const filteredCategories = getFilteredCategories();
  const categoryOptions = [
    { value: 'all', label: 'Todas las categorías' },
    ...filteredCategories?.map(cat => ({ value: cat?.id, label: cat?.name }))
  ];

  const hasActiveFilters =
    filters?.search ||
    filters?.category !== 'all' ||
    filters?.status !== 'all' ||
    filters?.featured !== 'all';

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="SlidersHorizontal" size={14} className="text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Filtros</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
          >
            <Icon name="X" size={12} />
            Limpiar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative xl:col-span-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
            <Icon name="Search" size={14} />
          </div>
          <input
            type="text"
            placeholder={`Buscar ${
              activeTab === 'products' ? 'productos' :
              activeTab === 'services' ? 'servicios' : 'categorías'
            }...`}
            value={filters?.search}
            onChange={(e) => onFilterChange('search', e?.target?.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        {/* Category Filter */}
        {activeTab !== 'categories' && (
          <StyledSelect
            options={categoryOptions}
            value={filters?.category}
            onChange={(value) => onFilterChange('category', value)}
            placeholder="Todas las categorías"
          />
        )}

        {/* Status Filter */}
        <StyledSelect
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => onFilterChange('status', value)}
          placeholder="Todos los estados"
        />

        {/* Featured Filter */}
        {activeTab !== 'categories' && (
          <StyledSelect
            options={featuredOptions}
            value={filters?.featured}
            onChange={(value) => onFilterChange('featured', value)}
            placeholder="Todos"
          />
        )}

        {/* Sort */}
        <StyledSelect
          options={sortOptions}
          value={filters?.sortBy}
          onChange={(value) => onFilterChange('sortBy', value)}
          placeholder="Ordenar por"
        />
      </div>

      {/* Active filters indicator */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">Activos:</span>
            {filters?.search && (
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                <Icon name="Search" size={10} />
                "{filters?.search}"
              </span>
            )}
            {filters?.category !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                <Icon name="Tag" size={10} />
                {filteredCategories?.find(c => c?.id === filters?.category)?.name}
              </span>
            )}
            {filters?.status !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                <Icon name="Circle" size={10} />
                {statusOptions?.find(s => s?.value === filters?.status)?.label}
              </span>
            )}
            {filters?.featured !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                <Icon name="Star" size={10} />
                {featuredOptions?.find(f => f?.value === filters?.featured)?.label}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogFilters;