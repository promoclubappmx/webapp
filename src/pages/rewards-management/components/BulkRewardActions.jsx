import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BulkRewardActions = ({ selectedRewards, onBulkAction, onClearSelection }) => {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const bulkActions = [
    {
      id: 'activate',
      label: 'Activar Seleccionados',
      icon: 'Play',
      color: 'text-success',
      description: 'Activar las recompensas seleccionadas'
    },
    {
      id: 'pause',
      label: 'Pausar Seleccionados',
      icon: 'Pause',
      color: 'text-warning',
      description: 'Pausar las recompensas seleccionadas'
    },
    {
      id: 'extend',
      label: 'Extender Validez',
      icon: 'Calendar',
      color: 'text-primary',
      description: 'Extender fecha de validez por 30 días'
    },
    {
      id: 'duplicate',
      label: 'Duplicar Recompensas',
      icon: 'Copy',
      color: 'text-primary',
      description: 'Crear copias de las recompensas seleccionadas'
    },
    {
      id: 'export',
      label: 'Exportar Datos',
      icon: 'Download',
      color: 'text-muted-foreground',
      description: 'Exportar datos de las recompensas seleccionadas'
    },
    {
      id: 'delete',
      label: 'Eliminar Seleccionados',
      icon: 'Trash2',
      color: 'text-destructive',
      description: 'Eliminar permanentemente las recompensas seleccionadas',
      requiresConfirmation: true
    }
  ];

  const handleAction = (actionId) => {
    const action = bulkActions?.find(a => a?.id === actionId);
    
    if (action?.requiresConfirmation) {
      setConfirmAction(action);
    } else {
      onBulkAction(actionId, selectedRewards);
      setIsActionsOpen(false);
    }
  };

  const handleConfirmAction = () => {
    if (confirmAction) {
      onBulkAction(confirmAction?.id, selectedRewards);
      setConfirmAction(null);
      setIsActionsOpen(false);
    }
  };

  const getActionStats = () => {
    const activeCount = selectedRewards?.filter(r => r?.status === 'active')?.length || 0;
    const pausedCount = selectedRewards?.filter(r => r?.status === 'paused')?.length || 0;
    const expiredCount = selectedRewards?.filter(r => r?.status === 'expired')?.length || 0;

    return { activeCount, pausedCount, expiredCount };
  };

  const stats = getActionStats();

  if (!selectedRewards || selectedRewards?.length === 0) return null;

  return (
    <>
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Icon name="CheckSquare" size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {selectedRewards?.length} recompensa(s) seleccionada(s)
              </h3>
              <p className="text-sm text-muted-foreground">
                {stats?.activeCount} activa(s), {stats?.pausedCount} pausada(s), {stats?.expiredCount} expirada(s)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Button
                onClick={() => setIsActionsOpen(!isActionsOpen)}
                iconName="ChevronDown"
                iconPosition="right"
              >
                Acciones en Lote
              </Button>

              {isActionsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    <div className="text-xs font-medium text-muted-foreground px-3 py-2">
                      ACCIONES DISPONIBLES
                    </div>
                    {bulkActions?.map((action) => (
                      <button
                        key={action?.id}
                        onClick={() => handleAction(action?.id)}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-muted/50 rounded-lg transition-colors"
                        disabled={
                          (action?.id === 'activate' && stats?.activeCount === selectedRewards?.length) ||
                          (action?.id === 'pause' && stats?.pausedCount === selectedRewards?.length)
                        }
                      >
                        <Icon name={action?.icon} size={16} className={action?.color} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{action?.label}</p>
                          <p className="text-xs text-muted-foreground">{action?.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={onClearSelection}
              iconName="X"
              iconSize={16}
            >
              Deseleccionar Todo
            </Button>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('activate')}
            disabled={stats?.activeCount === selectedRewards?.length}
            iconName="Play"
            iconSize={14}
          >
            Activar ({selectedRewards?.length - stats?.activeCount})
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('pause')}
            disabled={stats?.pausedCount === selectedRewards?.length}
            iconName="Pause"
            iconSize={14}
          >
            Pausar ({selectedRewards?.length - stats?.pausedCount})
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('extend')}
            iconName="Calendar"
            iconSize={14}
          >
            Extender Validez
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('export')}
            iconName="Download"
            iconSize={14}
          >
            Exportar
          </Button>
        </div>
      </div>
      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <Icon name={confirmAction?.icon} size={24} className="text-destructive" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Confirmar Acción</h3>
                  <p className="text-sm text-muted-foreground">{confirmAction?.label}</p>
                </div>
              </div>

              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
                <p className="text-sm text-foreground">
                  ¿Estás seguro de que deseas <strong>{confirmAction?.label?.toLowerCase()}</strong>?
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Esta acción afectará a {selectedRewards?.length} recompensa(s) y no se puede deshacer.
                </p>
              </div>

              {/* List of selected rewards */}
              <div className="max-h-32 overflow-y-auto mb-4">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  RECOMPENSAS SELECCIONADAS:
                </div>
                <div className="space-y-1">
                  {selectedRewards?.slice(0, 5)?.map((reward) => (
                    <div key={reward?.id} className="text-sm text-foreground bg-muted/30 rounded px-2 py-1">
                      {reward?.name}
                    </div>
                  ))}
                  {selectedRewards?.length > 5 && (
                    <div className="text-xs text-muted-foreground">
                      Y {selectedRewards?.length - 5} más...
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <Button variant="outline" onClick={() => setConfirmAction(null)}>
                  Cancelar
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleConfirmAction}
                  iconName={confirmAction?.icon}
                  iconPosition="left"
                >
                  {confirmAction?.label}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Click outside to close dropdown */}
      {isActionsOpen && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setIsActionsOpen(false)}
        />
      )}
    </>
  );
};

export default BulkRewardActions;