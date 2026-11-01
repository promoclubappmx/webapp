import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import RoleGuard from '../../../components/ui/RoleGuard';
import { useCurrency } from '../../../contexts/CurrencyContext';

const InventoryTable = ({ items, onAdjust, userRole }) => {
  const { formatPrice } = useCurrency();
  const getStockStatus = (item) => {
    if (item?.stockQuantity === 0) {
      return { label: 'Sin Stock', color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400', icon: 'XCircle' };
    }
    if (item?.stockQuantity < item?.minStockLevel) {
      return { label: 'Stock Bajo', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400', icon: 'AlertTriangle' };
    }
    return { label: 'Normal', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400', icon: 'CheckCircle' };
  };

  const getStockPercentage = (item) => {
    if (item?.maxStockLevel === 0) return 0;
    return (item?.stockQuantity / item?.maxStockLevel) * 100;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString)?.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!items?.length) {
    return (
      <div className="text-center py-12">
        <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No se encontraron productos</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Producto</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">SKU</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Categoría</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Stock Actual</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nivel Mínimo</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Último Ajuste</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items?.map((item) => {
            const status = getStockStatus(item);
            const percentage = getStockPercentage(item);
            return (
              <tr key={item?.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    {item?.imageUrl ? (
                      <img 
                        src={item?.imageUrl} 
                        alt={item?.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <Icon name="Package" size={20} className="text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">{item?.name}</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(item?.price)}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="font-mono text-sm text-foreground">{item?.sku}</span>
                </td>
                <td className="py-4 px-4 text-sm text-muted-foreground">
                  {item?.category}
                </td>
                <td className="py-4 px-4">
                  <div>
                    <p className="font-semibold text-foreground">{item?.stockQuantity}</p>
                    <div className="w-24 h-2 bg-muted rounded-full mt-1 overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          percentage < 25 ? 'bg-red-500' : 
                          percentage < 50 ? 'bg-orange-500': 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-muted-foreground">
                  {item?.minStockLevel}
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    status?.color
                  }`}>
                    <Icon name={status?.icon} size={12} className="mr-1" />
                    {status?.label}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-muted-foreground">
                  {formatDate(item?.lastAdjustment)}
                </td>
                <td className="py-4 px-4">
                  <RoleGuard allowedRoles={['owner', 'admin', 'staff']} userRole={userRole} module="inventory" showFallback={false}>
                    <div className="flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAdjust(item)}
                        iconName="Edit"
                      >
                        Ajustar
                      </Button>
                    </div>
                  </RoleGuard>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;