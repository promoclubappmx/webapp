import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const CouponFilters = ({ onFiltersChange, onReset }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    discountType: 'all',
    customerSegment: 'all',
    dateRange: 'all',
    sortBy: 'created_desc'
  });

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activos' },
    { value: 'expired', label: 'Expirados' },
    { value: 'paused', label: 'Pausados' }
  ];

  const discountTypeOptions = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'percentage', label: 'Porcentaje' },
    { value: 'fixed', label: 'Cantidad fija' }
  ];

  const customerSegmentOptions = [
    { value: 'all', label: 'Todos los segmentos' },
    { value: 'new', label: 'Nuevos clientes' },
    { value: 'returning', label: 'Clientes recurrentes' },
    { value: 'vip', label: 'Clientes VIP' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'Todas las fechas' },
    { value: 'active', label: 'Activos ahora' },
    { value: 'expiring_soon', label: 'Expiran pronto' },
    { value: 'this_week', label: 'Esta semana' },
    { value: 'this_month', label: 'Este mes' },
    { value: 'custom', label: 'Rango personalizado' }
  ];

  const sortOptions = [
    { value: 'created_desc', label: 'Más recientes' },
    { value: 'created_asc', label: 'Más antiguos' },
    { value: 'usage_desc', label: 'Más usados' },
    { value: 'usage_asc', label: 'Menos usados' },
    { value: 'expiry_asc', label: 'Expiran primero' },
    { value: 'expiry_desc', label: 'Expiran último' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      status: 'all',
      discountType: 'all',
      customerSegment: 'all',
      dateRange: 'all',
      sortBy: 'created_desc'
    };
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
    onReset();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters?.search) count++;
    if (filters?.status !== 'all') count++;
    if (filters?.discountType !== 'all') count++;
    if (filters?.customerSegment !== 'all') count++;
    if (filters?.dateRange !== 'all') count++;
    return count;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-foreground">Filtros</h3>
        <div className="flex items-center gap-2">
          {getActiveFiltersCount() > 0 && (
            <span className="text-sm text-muted-foreground">
              {getActiveFiltersCount()} filtro{getActiveFiltersCount() > 1 ? 's' : ''} activo{getActiveFiltersCount() > 1 ? 's' : ''}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            iconName="X"
            iconPosition="left"
          >
            Limpiar
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Search */}
        <div className="xl:col-span-2">
          <Input
            type="search"
            placeholder="Buscar por título o código..."
            value={filters?.search}
            onChange={(e) => handleFilterChange('search', e?.target?.value)}
          />
        </div>

        {/* Status Filter */}
        <Select
          placeholder="Estado"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => handleFilterChange('status', value)}
        />

        {/* Discount Type Filter */}
        <Select
          placeholder="Tipo de descuento"
          options={discountTypeOptions}
          value={filters?.discountType}
          onChange={(value) => handleFilterChange('discountType', value)}
        />

        {/* Customer Segment Filter */}
        <Select
          placeholder="Segmento"
          options={customerSegmentOptions}
          value={filters?.customerSegment}
          onChange={(value) => handleFilterChange('customerSegment', value)}
        />

        {/* Sort By */}
        <Select
          placeholder="Ordenar por"
          options={sortOptions}
          value={filters?.sortBy}
          onChange={(value) => handleFilterChange('sortBy', value)}
        />
      </div>
      {/* Date Range Filter */}
      <div className="mt-4">
        <Select
          label="Rango de fechas"
          options={dateRangeOptions}
          value={filters?.dateRange}
          onChange={(value) => handleFilterChange('dateRange', value)}
          className="max-w-xs"
        />
      </div>
      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
        <Button
          variant={filters?.status === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('status', filters?.status === 'active' ? 'all' : 'active')}
        >
          Activos
        </Button>
        <Button
          variant={filters?.dateRange === 'expiring_soon' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('dateRange', filters?.dateRange === 'expiring_soon' ? 'all' : 'expiring_soon')}
        >
          Expiran Pronto
        </Button>
        <Button
          variant={filters?.sortBy === 'usage_desc' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('sortBy', filters?.sortBy === 'usage_desc' ? 'created_desc' : 'usage_desc')}
        >
          Más Populares
        </Button>
        <Button
          variant={filters?.customerSegment === 'new' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('customerSegment', filters?.customerSegment === 'new' ? 'all' : 'new')}
        >
          Nuevos Clientes
        </Button>
      </div>
    </div>
  );
};

export default CouponFilters;