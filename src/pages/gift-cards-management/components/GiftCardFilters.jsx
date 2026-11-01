import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const GiftCardFilters = ({ onFiltersChange, onReset }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    sortBy: 'issued_desc'
  });

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activas' },
    { value: 'used', label: 'Usadas' },
    { value: 'expired', label: 'Expiradas' },
    { value: 'cancelled', label: 'Canceladas' }
  ];

  const sortOptions = [
    { value: 'issued_desc', label: 'Más recientes' },
    { value: 'issued_asc', label: 'Más antiguas' },
    { value: 'value_desc', label: 'Mayor valor' },
    { value: 'value_asc', label: 'Menor valor' },
    { value: 'balance_desc', label: 'Mayor balance' },
    { value: 'balance_asc', label: 'Menor balance' }
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
      sortBy: 'issued_desc'
    };
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
    onReset();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters?.search) count++;
    if (filters?.status !== 'all') count++;
    return count;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="md:col-span-1">
          <Input
            type="search"
            placeholder="Buscar por código, nombre o email..."
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

        {/* Sort By */}
        <Select
          placeholder="Ordenar por"
          options={sortOptions}
          value={filters?.sortBy}
          onChange={(value) => handleFilterChange('sortBy', value)}
        />
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
        <Button
          variant={filters?.status === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('status', filters?.status === 'active' ? 'all' : 'active')}
        >
          Activas
        </Button>
        <Button
          variant={filters?.status === 'used' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('status', filters?.status === 'used' ? 'all' : 'used')}
        >
          Canjeadas
        </Button>
        <Button
          variant={filters?.status === 'expired' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('status', filters?.status === 'expired' ? 'all' : 'expired')}
        >
          Expiradas
        </Button>
      </div>
    </div>
  );
};

export default GiftCardFilters;