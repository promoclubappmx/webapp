import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const AdjustmentHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock adjustment history
  const adjustments = [
    {
      id: 'adj1',
      itemName: 'Paella Valenciana',
      sku: 'PAE001',
      adjustmentType: 'increase',
      quantityChange: 50,
      previousQuantity: 45,
      newQuantity: 95,
      reason: 'Reabastecimiento',
      adjustedBy: 'Carlos Mendoza',
      createdAt: '2024-12-17T10:30:00Z'
    },
    {
      id: 'adj2',
      itemName: 'Sangría de la Casa',
      sku: 'BEB001',
      adjustmentType: 'decrease',
      quantityChange: -7,
      previousQuantity: 15,
      newQuantity: 8,
      reason: 'Venta manual',
      adjustedBy: 'Juan Pérez',
      createdAt: '2024-12-17T09:15:00Z'
    },
    {
      id: 'adj3',
      itemName: 'Tarta de Santiago',
      sku: 'POST001',
      adjustmentType: 'damage',
      quantityChange: -5,
      previousQuantity: 5,
      newQuantity: 0,
      reason: 'Producto dañado',
      adjustedBy: 'Ana Martínez',
      createdAt: '2024-12-17T08:00:00Z'
    },
    {
      id: 'adj4',
      itemName: 'Jamón Ibérico',
      sku: 'TAP001',
      adjustmentType: 'correction',
      quantityChange: 5,
      previousQuantity: 20,
      newQuantity: 25,
      reason: 'Corrección de error',
      adjustedBy: 'Carlos Mendoza',
      createdAt: '2024-12-16T16:45:00Z'
    }
  ];

  const getAdjustmentIcon = (type) => {
    const icons = {
      increase: 'Plus',
      decrease: 'Minus',
      correction: 'Edit',
      damage: 'AlertTriangle',
      theft: 'ShieldAlert',
      return: 'RotateCcw'
    };
    return icons?.[type] || icons?.correction;
  };

  const getAdjustmentColor = (type) => {
    const colors = {
      increase: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
      decrease: 'text-red-600 bg-red-100 dark:bg-red-900/20',
      correction: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
      damage: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
      theft: 'text-red-600 bg-red-100 dark:bg-red-900/20',
      return: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20'
    };
    return colors?.[type] || colors?.correction;
  };

  const getAdjustmentLabel = (type) => {
    const labels = {
      increase: 'Incremento',
      decrease: 'Disminución',
      correction: 'Corrección',
      damage: 'Daño',
      theft: 'Robo',
      return: 'Devolución'
    };
    return labels?.[type] || type;
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString)?.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAdjustments = adjustments?.filter(adj => {
    const matchesSearch = adj?.itemName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         adj?.sku?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         adj?.adjustedBy?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesType = filterType === 'all' || adj?.adjustmentType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar en historial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            iconName="Search"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e?.target?.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
        >
          <option value="all">Todos los tipos</option>
          <option value="increase">Incrementos</option>
          <option value="decrease">Disminuciones</option>
          <option value="correction">Correcciones</option>
          <option value="damage">Daños</option>
          <option value="theft">Robos</option>
          <option value="return">Devoluciones</option>
        </select>
      </div>
      {/* History Timeline */}
      <div className="space-y-3">
        {filteredAdjustments?.map((adjustment) => (
          <div key={adjustment?.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                getAdjustmentColor(adjustment?.adjustmentType)
              }`}>
                <Icon name={getAdjustmentIcon(adjustment?.adjustmentType)} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-foreground">{adjustment?.itemName}</h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        getAdjustmentColor(adjustment?.adjustmentType)
                      }`}>
                        {getAdjustmentLabel(adjustment?.adjustmentType)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">SKU: {adjustment?.sku}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Cantidad:</span>
                        <span className="font-mono font-semibold">
                          {adjustment?.previousQuantity} → {adjustment?.newQuantity}
                        </span>
                        <span className={adjustment?.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}>
                          ({adjustment?.quantityChange > 0 ? '+' : ''}{adjustment?.quantityChange})
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      <Icon name="FileText" size={14} className="inline mr-1" />
                      {adjustment?.reason}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Icon name="User" size={12} className="inline mr-1" />
                      Ajustado por: {adjustment?.adjustedBy}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-muted-foreground">{formatDateTime(adjustment?.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredAdjustments?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="History" size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No se encontraron ajustes</p>
        </div>
      )}
    </div>
  );
};

export default AdjustmentHistory;