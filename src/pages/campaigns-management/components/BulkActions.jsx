import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BulkActions = ({ selectedCount, onAction, onClear }) => {
  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon name="CheckSquare" size={20} className="text-primary" />
        <span className="text-sm font-medium text-foreground">
          {selectedCount} campaña{selectedCount !== 1 ? 's' : ''} seleccionada{selectedCount !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction('activate')}
          iconName="Play"
          iconSize={14}
        >
          Activar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction('pause')}
          iconName="Pause"
          iconSize={14}
        >
          Pausar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction('duplicate')}
          iconName="Copy"
          iconSize={14}
        >
          Duplicar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction('delete')}
          iconName="Trash2"
          iconSize={14}
        >
          Eliminar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          iconName="X"
          iconSize={14}
        >
          Limpiar
        </Button>
      </div>
    </div>
  );
};

export default BulkActions;