import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useCurrency } from '../../../contexts/CurrencyContext';

const DiscrepancyModal = ({ items, supplierEmail, supplierName, onNotifySupplier, onClose, isNotifying }) => {
  const { formatPrice } = useCurrency();

  const discrepancies = items?.filter(item => {
    const ordered = parseFloat(item?.quantity_ordered) || 0;
    const received = parseFloat(item?.quantity_received) || 0;
    const rejected = parseFloat(item?.quantity_rejected) || 0;
    return received < ordered || rejected > 0;
  }) || [];

  const missing = discrepancies?.filter(i => (parseFloat(i?.quantity_received) || 0) < (parseFloat(i?.quantity_ordered) || 0) && (parseFloat(i?.quantity_rejected) || 0) === 0);
  const rejected = discrepancies?.filter(i => (parseFloat(i?.quantity_rejected) || 0) > 0);
  const surplus = items?.filter(i => (parseFloat(i?.quantity_received) || 0) > (parseFloat(i?.quantity_ordered) || 0)) || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl border border-border max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Icon name="AlertTriangle" size={18} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Registro de Discrepancias</h3>
              <p className="text-xs text-muted-foreground">{discrepancies?.length + surplus?.length} discrepancia(s) encontrada(s)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-orange-600">{missing?.length}</p>
              <p className="text-xs text-orange-700 font-medium">Faltantes</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{rejected?.length}</p>
              <p className="text-xs text-red-700 font-medium">Defectuosos</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{surplus?.length}</p>
              <p className="text-xs text-blue-700 font-medium">Sobrantes</p>
            </div>
          </div>

          {/* Missing items */}
          {missing?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-orange-700 mb-2 flex items-center gap-1.5">
                <Icon name="PackageMinus" size={14} /> Productos Faltantes
              </h4>
              <div className="space-y-2">
                {missing?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item?.product_name}</p>
                      {item?.sku && <p className="text-xs text-muted-foreground">SKU: {item?.sku}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-orange-600">
                        -{(parseFloat(item?.quantity_ordered) || 0) - (parseFloat(item?.quantity_received) || 0)} uds
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(((parseFloat(item?.quantity_ordered) || 0) - (parseFloat(item?.quantity_received) || 0)) * (parseFloat(item?.unit_cost) || 0))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rejected items */}
          {rejected?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1.5">
                <Icon name="XCircle" size={14} /> Productos Rechazados / Defectuosos
              </h4>
              <div className="space-y-2">
                {rejected?.map((item, i) => (
                  <div key={i} className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item?.product_name}</p>
                        {item?.sku && <p className="text-xs text-muted-foreground">SKU: {item?.sku}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">{parseFloat(item?.quantity_rejected) || 0} uds rechazadas</p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice((parseFloat(item?.quantity_rejected) || 0) * (parseFloat(item?.unit_cost) || 0))}
                        </p>
                      </div>
                    </div>
                    {item?.rejection_reason && (
                      <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                        <Icon name="AlertCircle" size={11} /> Motivo: {item?.rejection_reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Surplus items */}
          {surplus?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-1.5">
                <Icon name="PackagePlus" size={14} /> Productos Sobrantes
              </h4>
              <div className="space-y-2">
                {surplus?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item?.product_name}</p>
                      {item?.sku && <p className="text-xs text-muted-foreground">SKU: {item?.sku}</p>}
                    </div>
                    <p className="text-sm font-bold text-blue-600">
                      +{(parseFloat(item?.quantity_received) || 0) - (parseFloat(item?.quantity_ordered) || 0)} uds extra
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {discrepancies?.length === 0 && surplus?.length === 0 && (
            <div className="text-center py-8">
              <Icon name="CheckCircle" size={40} className="text-green-500 mx-auto mb-2" />
              <p className="text-muted-foreground">No hay discrepancias registradas</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-5 border-t border-border">
          <Button variant="outline" onClick={onClose} className="flex-1">Cerrar</Button>
          {(discrepancies?.length > 0 || surplus?.length > 0) && supplierEmail && (
            <Button
              onClick={onNotifySupplier}
              isLoading={isNotifying}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Icon name="Send" size={14} className="mr-1" />
              Notificar a {supplierName || 'Proveedor'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscrepancyModal;
