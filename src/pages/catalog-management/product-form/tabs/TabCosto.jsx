import React from 'react';
import Input from '../../../../components/ui/Input';
import Icon from '../../../../components/AppIcon';
import { useCurrency } from '../../../../contexts/CurrencyContext';

const TAX_OPTIONS = [
  { value: '', label: 'Sin impuesto sobre costo' },
  { value: '0', label: 'Tasa 0%' },
  { value: '8', label: 'IVA Zona Fronteriza 8%' },
  { value: '16', label: 'IVA General 16%' },
];

const TabCosto = ({ formData, errors, touched, onChange, onBlur, suppliers = [] }) => {
  const { formatPrice, currencySettings } = useCurrency();
  const currencyCode = currencySettings?.defaultCurrency || 'MXN';
  const currencySymbol = currencySettings?.currencySymbol || '$';

  const purchaseCost = parseFloat(formData?.purchaseCost) || 0;
  const costTaxRate = formData?.costTaxRate ? parseFloat(formData?.costTaxRate) : null;
  const costTaxAmount = costTaxRate !== null ? purchaseCost * (costTaxRate / 100) : 0;
  const totalCostWithTax = purchaseCost + costTaxAmount;
  const regularPrice = parseFloat(formData?.regularPrice) || 0;
  const margin = regularPrice > 0 && purchaseCost > 0
    ? ((regularPrice - totalCostWithTax) / regularPrice * 100)?.toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Icon name="ShoppingCart" size={18} className="text-primary" />
        <h3 className="text-base font-semibold text-foreground">Costo del producto</h3>
      </div>
      <p className="text-xs text-muted-foreground -mt-4">
        Esta información es interna y no se muestra al cliente. Sirve para calcular márgenes y rentabilidad.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Purchase cost */}
        <Input
          label={`Costo de compra (${currencyCode})`}
          type="number"
          value={formData?.purchaseCost}
          onChange={(e) => onChange('purchaseCost', e?.target?.value)}
          onBlur={() => onBlur?.('purchaseCost')}
          placeholder="0.00"
          step="0.01"
          helperText="Precio al que adquieres el producto"
        />

        {/* Tax on cost */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Impuesto sobre el costo
          </label>
          <select
            value={formData?.costTaxRate ?? ''}
            onChange={(e) => onChange('costTaxRate', e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
          >
            {TAX_OPTIONS?.map(opt => (
              <option key={opt?.value} value={opt?.value}>{opt?.label}</option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground mt-1">
            Tasa de impuesto aplicada al costo de compra
          </p>
        </div>

        {/* Supplier selector */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-2">
            Proveedor
          </label>
          {suppliers?.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-2">
                <Icon name="AlertTriangle" size={16} className="text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900 mb-1">No hay proveedores registrados</p>
                  <p className="text-xs text-yellow-700">
                    Agrega proveedores desde{' '}
                    <a href="/suppliers" className="text-yellow-800 underline">Gestión de Proveedores</a>{' '}
                    para poder asignarlos a tus productos.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <select
              value={formData?.supplierId ?? ''}
              onChange={(e) => onChange('supplierId', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
            >
              <option value="">— Sin proveedor asignado —</option>
              {suppliers?.map(supplier => (
                <option key={supplier?.id} value={supplier?.id}>
                  {supplier?.name}
                </option>
              ))}
            </select>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Proveedor principal de este producto. Los proveedores se gestionan en{' '}
            <a href="/suppliers" className="text-primary hover:underline">Gestión de Proveedores</a>.
          </p>
        </div>
      </div>

      {/* Cost summary box */}
      {purchaseCost > 0 && (
        <div className="bg-muted/30 border border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="BarChart2" size={15} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">Resumen de costos y margen</span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <span className="text-muted-foreground">Costo de compra:</span>
            <span className="font-medium">{formatPrice(purchaseCost)}</span>

            {costTaxRate !== null && costTaxRate !== '' && (
              <>
                <span className="text-muted-foreground">Impuesto ({costTaxRate}%):</span>
                <span className="font-medium">{formatPrice(costTaxAmount)}</span>
                <span className="text-muted-foreground">Costo total con impuesto:</span>
                <span className="font-semibold text-foreground">{formatPrice(totalCostWithTax)}</span>
              </>
            )}

            {regularPrice > 0 && (
              <>
                <span className="text-muted-foreground">Precio de venta:</span>
                <span className="font-medium">{formatPrice(regularPrice)}</span>
                <span className="text-muted-foreground">Ganancia bruta:</span>
                <span className={`font-semibold ${regularPrice - totalCostWithTax >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                  {formatPrice(regularPrice - totalCostWithTax)}
                </span>
                {margin !== null && (
                  <>
                    <span className="text-muted-foreground">Margen:</span>
                    <span className={`font-bold text-base ${parseFloat(margin) >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                      {margin}%
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TabCosto;
