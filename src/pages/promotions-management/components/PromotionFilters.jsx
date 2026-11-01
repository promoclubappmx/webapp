import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const PromotionFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  onExport,
  totalPromotions = 0 
}) => {
  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activas' },
    { value: 'scheduled', label: 'Programadas' },
    { value: 'draft', label: 'Borradores' },
    { value: 'expired', label: 'Expiradas' }
  ];

  const sortOptions = [
    { value: 'created_desc', label: 'Más recientes' },
    { value: 'created_asc', label: 'Más antiguas' },
    { value: 'title_asc', label: 'Título A-Z' },
    { value: 'title_desc', label: 'Título Z-A' },
    { value: 'start_date_desc', label: 'Fecha inicio (desc)' },
    { value: 'start_date_asc', label: 'Fecha inicio (asc)' },
    { value: 'usage_desc', label: 'Más utilizadas' },
    { value: 'usage_asc', label: 'Menos utilizadas' }
  ];

  const discountTypeOptions = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'percentage', label: 'Porcentaje' },
    { value: 'fixed', label: 'Cantidad fija' }
  ];

  const hasActiveFilters = () => {
    return filters?.search || 
           filters?.status !== 'all' || 
           filters?.discountType !== 'all' ||
           filters?.dateFrom ||
           filters?.dateTo;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon name="Filter" size={20} className="text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground">Filtros</h3>
          {hasActiveFilters() && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              Activos
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {totalPromotions} promociones
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            iconName="Download"
            iconSize={16}
          >
            Exportar
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Input
          type="search"
          placeholder="Buscar promociones..."
          value={filters?.search}
          onChange={(e) => onFilterChange('search', e?.target?.value)}
          className="col-span-1 md:col-span-2"
        />

        <Select
          placeholder="Estado"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => onFilterChange('status', value)}
        />

        <Select
          placeholder="Ordenar por"
          options={sortOptions}
          value={filters?.sortBy}
          onChange={(value) => onFilterChange('sortBy', value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          placeholder="Tipo de descuento"
          options={discountTypeOptions}
          value={filters?.discountType}
          onChange={(value) => onFilterChange('discountType', value)}
        />

        <Input
          type="date"
          label="Desde"
          value={filters?.dateFrom}
          onChange={(e) => onFilterChange('dateFrom', e?.target?.value)}
        />

        <Input
          type="date"
          label="Hasta"
          value={filters?.dateTo}
          onChange={(e) => onFilterChange('dateTo', e?.target?.value)}
        />

        <div className="flex items-end">
          <Button
            variant="outline"
            size="default"
            onClick={onClearFilters}
            disabled={!hasActiveFilters()}
            iconName="X"
            iconSize={16}
            fullWidth
          >
            Limpiar Filtros
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PromotionFilters;