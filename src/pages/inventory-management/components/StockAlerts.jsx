import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const StockAlerts = ({ items, onAdjust }) => {
  const lowStockItems = items?.filter(item => 
    item?.stockQuantity < item?.minStockLevel && item?.stockQuantity > 0
  );
  const outOfStockItems = items?.filter(item => item?.stockQuantity === 0);

  const AlertCard = ({ item, type }) => {
    const isOutOfStock = type === 'out';
    return (
      <div className={`border rounded-lg p-4 ${
        isOutOfStock 
          ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800' :'bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isOutOfStock
              ? 'bg-red-100 dark:bg-red-900/20' :'bg-orange-100 dark:bg-orange-900/20'
          }`}>
            <Icon 
              name={isOutOfStock ? 'XCircle' : 'AlertTriangle'} 
              size={24} 
              className={isOutOfStock ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{item?.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">SKU: {item?.sku}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className={isOutOfStock ? 'text-red-700 dark:text-red-300' : 'text-orange-700 dark:text-orange-300'}>
                    <span className="font-semibold">Stock actual: {item?.stockQuantity}</span>
                  </div>
                  <div className="text-muted-foreground">
                    Mínimo requerido: {item?.minStockLevel}
                  </div>
                </div>
                {isOutOfStock && (
                  <p className="text-sm text-red-700 dark:text-red-300 mt-2 font-medium">
                    ⚠️ Producto agotado - Requiere reabastecimiento inmediato
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAdjust(item)}
                iconName="Plus"
              >
                Reabastecer
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Out of Stock Section */}
      {outOfStockItems?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Icon name="XCircle" size={20} className="text-red-600" />
            <h3 className="text-lg font-semibold text-foreground">Sin Stock ({outOfStockItems?.length})</h3>
          </div>
          <div className="space-y-3">
            {outOfStockItems?.map(item => (
              <AlertCard key={item?.id} item={item} type="out" />
            ))}
          </div>
        </div>
      )}

      {/* Low Stock Section */}
      {lowStockItems?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Icon name="AlertTriangle" size={20} className="text-orange-600" />
            <h3 className="text-lg font-semibold text-foreground">Stock Bajo ({lowStockItems?.length})</h3>
          </div>
          <div className="space-y-3">
            {lowStockItems?.map(item => (
              <AlertCard key={item?.id} item={item} type="low" />
            ))}
          </div>
        </div>
      )}

      {/* No Alerts */}
      {outOfStockItems?.length === 0 && lowStockItems?.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircle" size={32} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">¡Todo en orden!</h3>
          <p className="text-muted-foreground">
            No hay alertas de inventario en este momento. Todos los productos tienen stock suficiente.
          </p>
        </div>
      )}
    </div>
  );
};

export default StockAlerts;