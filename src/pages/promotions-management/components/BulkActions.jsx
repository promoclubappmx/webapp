import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const BulkActions = ({ 
  selectedPromotions, 
  onSelectAll, 
  onDeselectAll, 
  onBulkAction,
  totalPromotions,
  allSelected 
}) => {
  const [bulkAction, setBulkAction] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const bulkActionOptions = [
    { value: '', label: 'Seleccionar acción...' },
    { value: 'activate', label: 'Activar seleccionadas' },
    { value: 'pause', label: 'Pausar seleccionadas' },
    { value: 'delete', label: 'Eliminar seleccionadas' },
    { value: 'duplicate', label: 'Duplicar seleccionadas' },
    { value: 'export', label: 'Exportar seleccionadas' }
  ];

  const handleBulkAction = () => {
    if (!bulkAction || selectedPromotions?.length === 0) return;

    if (bulkAction === 'delete') {
      setShowConfirmation(true);
    } else {
      onBulkAction(bulkAction, selectedPromotions);
      setBulkAction('');
    }
  };

  const confirmBulkAction = () => {
    onBulkAction(bulkAction, selectedPromotions);
    setBulkAction('');
    setShowConfirmation(false);
  };

  const getActionText = () => {
    switch (bulkAction) {
      case 'activate':
        return 'activar';
      case 'pause':
        return 'pausar';
      case 'delete':
        return 'eliminar';
      case 'duplicate':
        return 'duplicar';
      case 'export':
        return 'exportar';
      default:
        return 'procesar';
    }
  };

  if (selectedPromotions?.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Checkbox
              checked={allSelected}
              onChange={allSelected ? onDeselectAll : onSelectAll}
              label={`${selectedPromotions?.length} de ${totalPromotions} seleccionadas`}
            />
          </div>

          <div className="flex items-center gap-3">
            <Select
              placeholder="Acciones en lote"
              options={bulkActionOptions}
              value={bulkAction}
              onChange={setBulkAction}
              className="min-w-48"
            />

            <Button
              variant="default"
              size="sm"
              onClick={handleBulkAction}
              disabled={!bulkAction}
              iconName="Play"
              iconSize={16}
            >
              Ejecutar
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onDeselectAll}
              iconName="X"
              iconSize={16}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Confirmar Acción</h3>
                <p className="text-sm text-muted-foreground">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>

            <p className="text-sm text-foreground mb-6">
              ¿Estás seguro de que quieres {getActionText()} {selectedPromotions?.length} promociones seleccionadas?
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmBulkAction}
                iconName="Trash2"
                iconSize={16}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActions;