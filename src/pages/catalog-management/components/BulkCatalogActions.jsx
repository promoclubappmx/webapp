import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const BulkCatalogActions = ({ 
  selectedItems, 
  onSelectAll, 
  onDeselectAll, 
  onBulkAction,
  totalItems,
  allSelected
}) => {
  const [bulkAction, setBulkAction] = useState('');

  const actionOptions = [
    { value: '', label: 'Seleccionar acción...' },
    { value: 'activate', label: 'Activar elementos' },
    { value: 'deactivate', label: 'Desactivar elementos' },
    { value: 'feature', label: 'Marcar como destacados' },
    { value: 'unfeature', label: 'Quitar de destacados' },
    { value: 'duplicate', label: 'Duplicar elementos' },
    { value: 'delete', label: 'Eliminar elementos' }
  ];

  const handleBulkAction = () => {
    if (bulkAction && selectedItems?.length > 0) {
      if (bulkAction === 'delete') {
        const confirmDelete = window.confirm(
          `¿Estás seguro de que quieres eliminar ${selectedItems?.length} elemento${selectedItems?.length > 1 ? 's' : ''}?`
        );
        if (!confirmDelete) return;
      }
      
      onBulkAction(bulkAction, selectedItems);
      setBulkAction('');
    }
  };

  const handleExport = () => {
    // Export functionality would be implemented here
    console.log('Exporting catalog items');
  };

  if (totalItems === 0) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={allSelected}
              indeterminate={selectedItems?.length > 0 && !allSelected}
              onChange={() => allSelected ? onDeselectAll() : onSelectAll()}
            />
            <span className="text-sm text-muted-foreground">
              {selectedItems?.length > 0 
                ? `${selectedItems?.length} elemento${selectedItems?.length > 1 ? 's' : ''} seleccionado${selectedItems?.length > 1 ? 's' : ''}`
                : `Seleccionar todos (${totalItems})`
              }
            </span>
          </div>

          {selectedItems?.length > 0 && (
            <div className="flex items-center gap-2">
              <Select
                options={actionOptions}
                value={bulkAction}
                onChange={setBulkAction}
                placeholder="Acción en lote"
                className="w-48"
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkAction}
                disabled={!bulkAction}
                iconName="Play"
                iconSize={14}
              >
                Aplicar
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            iconName="Download"
            iconSize={14}
          >
            Exportar
          </Button>
          
          {selectedItems?.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDeselectAll}
              iconName="X"
              iconSize={14}
            >
              Limpiar selección
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkCatalogActions;