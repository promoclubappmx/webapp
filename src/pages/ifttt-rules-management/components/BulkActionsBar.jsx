import React from 'react';
import Icon from '../../../components/AppIcon';

const BulkActionsBar = ({ count, onActivate, onPause, onDelete, onClear }) => (
  <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-primary/10 border border-primary/20 rounded-xl">
    <div className="flex items-center gap-2 flex-1">
      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
        <span className="text-xs font-bold text-primary-foreground">{count}</span>
      </div>
      <span className="text-sm font-medium text-foreground">{count} regla{count !== 1 ? 's' : ''} seleccionada{count !== 1 ? 's' : ''}</span>
    </div>
    <div className="flex items-center gap-2">
      <button onClick={onActivate} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-success/10 text-success border border-success/20 rounded-lg hover:bg-success/20 transition-colors">
        <Icon name="Play" size={13} />
        Activar
      </button>
      <button onClick={onPause} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-warning/10 text-warning border border-warning/20 rounded-lg hover:bg-warning/20 transition-colors">
        <Icon name="Pause" size={13} />
        Pausar
      </button>
      <button onClick={onDelete} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 rounded-lg hover:bg-destructive/20 transition-colors">
        <Icon name="Trash2" size={13} />
        Eliminar
      </button>
      <button onClick={onClear} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
        <Icon name="X" size={16} />
      </button>
    </div>
  </div>
);

export default BulkActionsBar;
