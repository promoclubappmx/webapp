import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DeleteConfirmModal = ({ rule, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
      <div className="p-6">
        <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Trash2" size={24} className="text-destructive" />
        </div>
        <h3 className="text-lg font-bold text-foreground text-center mb-2">Eliminar regla</h3>
        <p className="text-sm text-muted-foreground text-center mb-1">¿Estás seguro de que deseas eliminar la regla?</p>
        <p className="text-sm font-medium text-foreground text-center mb-6">"{rule?.name}"</p>
        <p className="text-xs text-muted-foreground text-center mb-6">Esta acción no se puede deshacer. La regla dejará de ejecutarse inmediatamente.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors">Cancelar</button>
          <Button variant="destructive" className="flex-1" onClick={onConfirm} iconName="Trash2" iconPosition="left">Eliminar</Button>
        </div>
      </div>
    </div>
  </div>
);

export default DeleteConfirmModal;
