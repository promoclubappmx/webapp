import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const RewardFiltersPanel = ({ filters, onFiltersChange, onClearFilters, isOpen, onToggle }) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const statusOptions = [
    { value: 'all', label: 'Todos los Estados' },
    { value: 'active', label: 'Activo' },
    { value: 'paused', label: 'Pausado' },
    { value: 'expired', label: 'Expirado' }
  ];

  const typeOptions = [
    { value: 'all', label: 'Todos los Tipos' },
    { value: 'count', label: 'Basado en Visitas' },
    { value: 'amount', label: 'Basado en Gasto' }
  ];

  const rewardTypeOptions = [
    { value: 'all', label: 'Todas las Recompensas' },
    { value: 'discount', label: 'Descuentos' },
    { value: 'free_item', label: 'Productos Gratis' },
    { value: 'points', label: 'Puntos de Lealtad' },
    { value: 'exclusive_access', label: 'Acceso Exclusivo' }
  ];

  const performanceOptions = [
    { value: 'all', label: 'Todos los Rendimientos' },
    { value: 'high', label: 'Alto Rendimiento (>30%)' },
    { value: 'medium', label: 'Rendimiento Medio (10-30%)' },
    { value: 'low', label: 'Bajo Rendimiento (<10%)' }
  ];

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters?.search) count++;
    if (filters?.status !== 'all') count++;
    if (filters?.type !== 'all') count++;
    if (filters?.rewardType !== 'all') count++;
    if (filters?.performance !== 'all') count++;
    if (filters?.dateRange?.start || filters?.dateRange?.end) count++;
    return count;
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={20} className="text-primary" />
          <h3 className="font-semibold text-foreground">Filtros</h3>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
              {getActiveFiltersCount()}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {getActiveFiltersCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              iconName="X"
              iconSize={14}
            >
              Limpiar
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="lg:hidden"
          >
            <Icon name={isOpen ? 'ChevronUp' : 'ChevronDown'} size={16} />
          </Button>
        </div>
      </div>

      <div className={`p-4 space-y-4 ${!isOpen ? 'hidden lg:block' : ''}`}>
        {/* Search */}
        <div>
          <Input
            label="Buscar Recompensas"
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={filters?.search || ''}
            onChange={(e) => handleFilterChange('search', e?.target?.value)}
            icon="Search"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Estado
          </label>
          <select
            value={filters?.status || 'all'}
            onChange={(e) => handleFilterChange('status', e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {statusOptions?.map((option) => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Tipo de Objetivo
          </label>
          <select
            value={filters?.type || 'all'}
            onChange={(e) => handleFilterChange('type', e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {typeOptions?.map((option) => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reward Type Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Tipo de Recompensa
          </label>
          <select
            value={filters?.rewardType || 'all'}
            onChange={(e) => handleFilterChange('rewardType', e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {rewardTypeOptions?.map((option) => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Performance Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Rendimiento
          </label>
          <select
            value={filters?.performance || 'all'}
            onChange={(e) => handleFilterChange('performance', e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {performanceOptions?.map((option) => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Rango de Fechas
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              type="date"
              placeholder="Fecha inicial"
              value={filters?.dateRange?.start || ''}
              onChange={(e) => handleFilterChange('dateRange', {
                ...filters?.dateRange,
                start: e?.target?.value
              })}
            />
            <Input
              type="date"
              placeholder="Fecha final"
              value={filters?.dateRange?.end || ''}
              onChange={(e) => handleFilterChange('dateRange', {
                ...filters?.dateRange,
                end: e?.target?.value
              })}
            />
          </div>
        </div>

        {/* Participation Range */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Número de Participantes
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Mínimo"
              value={filters?.participantsRange?.min || ''}
              onChange={(e) => handleFilterChange('participantsRange', {
                ...filters?.participantsRange,
                min: e?.target?.value
              })}
              min="0"
            />
            <Input
              type="number"
              placeholder="Máximo"
              value={filters?.participantsRange?.max || ''}
              onChange={(e) => handleFilterChange('participantsRange', {
                ...filters?.participantsRange,
                max: e?.target?.value
              })}
              min="0"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Filtros Rápidos
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters?.quickFilter === 'expiring_soon' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('quickFilter', 
                filters?.quickFilter === 'expiring_soon' ? null : 'expiring_soon'
              )}
              iconName="Clock"
              iconSize={14}
            >
              Próximos a Vencer
            </Button>
            <Button
              variant={filters?.quickFilter === 'high_engagement' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('quickFilter', 
                filters?.quickFilter === 'high_engagement' ? null : 'high_engagement'
              )}
              iconName="TrendingUp"
              iconSize={14}
            >
              Alto Engagement
            </Button>
            <Button
              variant={filters?.quickFilter === 'low_redemption' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('quickFilter', 
                filters?.quickFilter === 'low_redemption' ? null : 'low_redemption'
              )}
              iconName="AlertTriangle"
              iconSize={14}
            >
              Bajo Canje
            </Button>
            <Button
              variant={filters?.quickFilter === 'newly_created' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('quickFilter', 
                filters?.quickFilter === 'newly_created' ? null : 'newly_created'
              )}
              iconName="Plus"
              iconSize={14}
            >
              Recién Creados
            </Button>
          </div>
        </div>

        {/* Apply Filters Button - Mobile */}
        <div className="lg:hidden pt-4">
          <Button
            onClick={onToggle}
            className="w-full"
            iconName="Check"
            iconPosition="left"
          >
            Aplicar Filtros ({getActiveFiltersCount()})
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RewardFiltersPanel;