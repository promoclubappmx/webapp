import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const FilterPanel = ({ onFiltersChange, activeFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(activeFilters || {});

  const filterOptions = {
    businessLocation: {
      label: 'Ubicación del negocio',
      options: [
        { id: 'madrid', label: 'Madrid Centro' },
        { id: 'barcelona', label: 'Barcelona Eixample' },
        { id: 'valencia', label: 'Valencia Ciudad' },
        { id: 'sevilla', label: 'Sevilla Centro' }
      ]
    },
    customerDemographics: {
      label: 'Demografía de clientes',
      options: [
        { id: '18-25', label: '18-25 años' },
        { id: '26-35', label: '26-35 años' },
        { id: '36-45', label: '36-45 años' },
        { id: '46+', label: '46+ años' }
      ]
    },
    promotionTypes: {
      label: 'Tipos de promoción',
      options: [
        { id: 'discount', label: 'Descuentos' },
        { id: 'bogo', label: '2x1 / BOGO' },
        { id: 'loyalty', label: 'Puntos de lealtad' },
        { id: 'seasonal', label: 'Promociones estacionales' }
      ]
    },
    campaignStatus: {
      label: 'Estado de campaña',
      options: [
        { id: 'active', label: 'Activas' },
        { id: 'paused', label: 'Pausadas' },
        { id: 'completed', label: 'Completadas' },
        { id: 'draft', label: 'Borradores' }
      ]
    }
  };

  const handleFilterChange = (category, optionId) => {
    setLocalFilters(prev => {
      const categoryFilters = prev?.[category] || [];
      const newCategoryFilters = categoryFilters?.includes(optionId)
        ? categoryFilters?.filter(id => id !== optionId)
        : [...categoryFilters, optionId];
      
      return {
        ...prev,
        [category]: newCategoryFilters
      };
    });
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    return Object.values(localFilters)?.reduce((count, filters) => count + (filters?.length || 0), 0);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        iconName="Filter"
        iconPosition="left"
      >
        Filtros
        {getActiveFilterCount() > 0 && (
          <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
            {getActiveFilterCount()}
          </span>
        )}
      </Button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-foreground">Filtros Avanzados</h4>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-muted rounded-md transition-colors duration-150"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>

              <div className="space-y-6">
                {Object.entries(filterOptions)?.map(([category, config]) => (
                  <div key={category}>
                    <h5 className="text-sm font-medium text-foreground mb-3">
                      {config?.label}
                    </h5>
                    <div className="space-y-2">
                      {config?.options?.map((option) => (
                        <Checkbox
                          key={option?.id}
                          label={option?.label}
                          checked={localFilters?.[category]?.includes(option?.id) || false}
                          onChange={() => handleFilterChange(category, option?.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2 mt-6 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  size="sm"
                  className="flex-1"
                >
                  Limpiar
                </Button>
                <Button
                  onClick={handleApplyFilters}
                  size="sm"
                  className="flex-1"
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FilterPanel;