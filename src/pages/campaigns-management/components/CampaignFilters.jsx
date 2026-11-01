import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const CampaignFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  onExport,
  totalCampaigns = 0 
}) => {
  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activas' },
    { value: 'scheduled', label: 'Programadas' },
    { value: 'draft', label: 'Borradores' },
    { value: 'completed', label: 'Completadas' }
  ];

  const typeOptions = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'seasonal', label: 'Estacional' },
    { value: 'event', label: 'Evento' },
    { value: 'product_launch', label: 'Lanzamiento' },
    { value: 'loyalty', label: 'Fidelización' },
    { value: 'promotional', label: 'Promocional' }
  ];

  const channelOptions = [
    { value: 'all', label: 'Todos los canales' },
    { value: 'email', label: 'Email' },
    { value: 'social', label: 'Redes Sociales' },
    { value: 'sms', label: 'SMS' },
    { value: 'push', label: 'Push' }
  ];

  const sortOptions = [
    { value: 'created_desc', label: 'Más recientes' },
    { value: 'created_asc', label: 'Más antiguas' },
    { value: 'name_asc', label: 'Nombre A-Z' },
    { value: 'name_desc', label: 'Nombre Z-A' },
    { value: 'budget_desc', label: 'Mayor presupuesto' },
    { value: 'budget_asc', label: 'Menor presupuesto' }
  ];

  const hasActiveFilters = () => {
    return filters?.search || 
           filters?.status !== 'all' || 
           filters?.type !== 'all' ||
           filters?.channel !== 'all' ||
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
            {totalCampaigns} campañas
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
          placeholder="Buscar campañas..."
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
          placeholder="Tipo de campaña"
          options={typeOptions}
          value={filters?.type}
          onChange={(value) => onFilterChange('type', value)}
        />

        <Select
          placeholder="Canal"
          options={channelOptions}
          value={filters?.channel}
          onChange={(value) => onFilterChange('channel', value)}
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
      </div>

      <div className="flex items-center justify-end mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          disabled={!hasActiveFilters()}
          iconName="X"
          iconSize={16}
        >
          Limpiar Filtros
        </Button>
      </div>
    </div>
  );
};

export default CampaignFilters;