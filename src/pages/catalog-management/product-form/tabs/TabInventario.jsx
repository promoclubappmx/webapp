import React, { useEffect, useState } from 'react';
import Input from '../../../../components/ui/Input';
import Icon from '../../../../components/AppIcon';
import { useCurrency } from '../../../../contexts/CurrencyContext';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';

const TAX_REGIONS_MX = [
  { id: 'general', name: 'IVA General', rate: 16 },
  { id: 'frontera', name: 'IVA Zona Fronteriza', rate: 8 },
  { id: 'tasa0', name: 'Tasa 0%', rate: 0 }
];

const TabInventario = ({ formData, errors, touched, onChange, onBlur, suppliers = [] }) => {
  const { formatPrice, currencySettings } = useCurrency();
  const { user } = useAuth();
  const currencyCode = currencySettings?.defaultCurrency || 'MXN';

  const [catalogTaxRates, setCatalogTaxRates] = useState([]);
  const [loadingTaxes, setLoadingTaxes] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Load business locations
  useEffect(() => {
    if (!user?.id) return;
    const fetchLocations = async () => {
      setLoadingLocations(true);
      try {
        const { data, error } = await supabase
          ?.from('business_locations')
          ?.select('id, branch_name, location_name, location_code, address, city')
          ?.eq('business_id', user?.id)
          ?.eq('is_active', true)
          ?.order('branch_name');
        if (!error && data) {
          setLocations(data);
          // Initialize locationStocks if not set
          if (!formData?.locationStocks || formData?.locationStocks?.length === 0) {
            const initial = data?.map(loc => ({
              locationId: loc?.id,
              locationName: loc?.branch_name || loc?.location_name || 'Establecimiento',
              stock: ''
            }));
            onChange('locationStocks', initial);
          }
        }
      } catch {
        // silent
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchLocations();
  }, [user?.id]);

  // Load tax rates from catalog-settings (currencySettings.taxSettings.selectedRates)
  useEffect(() => {
    const selectedRateIds = currencySettings?.taxSettings?.selectedRates || [];
    if (selectedRateIds?.length > 0) {
      const rates = TAX_REGIONS_MX?.filter(r => selectedRateIds?.includes(r?.id));
      setCatalogTaxRates(rates);
    } else {
      // fallback: load from tax_rates table
      const fetchTaxRates = async () => {
        setLoadingTaxes(true);
        try {
          const { data } = await supabase
            ?.from('tax_rates')
            ?.select('id, name, rate')
            ?.eq('owner_id', user?.id)
            ?.eq('is_active', true)
            ?.order('rate');
          if (data?.length > 0) {
            setCatalogTaxRates(data?.map(r => ({ id: r?.id, name: r?.name, rate: r?.rate })));
          } else {
            setCatalogTaxRates(TAX_REGIONS_MX);
          }
        } catch {
          setCatalogTaxRates(TAX_REGIONS_MX);
        } finally {
          setLoadingTaxes(false);
        }
      };
      if (user?.id) fetchTaxRates();
    }
  }, [currencySettings?.taxSettings?.selectedRates, user?.id]);

  const purchaseCost = parseFloat(formData?.purchaseCost || 0);
  const regularPrice = parseFloat(formData?.regularPrice || 0);
  const margin = regularPrice > 0 && purchaseCost > 0
    ? (((regularPrice - purchaseCost) / regularPrice) * 100)?.toFixed(2)
    : null;

  const supplierOptions = [
    { value: '', label: 'Sin proveedor asignado' },
    ...suppliers?.map(s => ({ value: s?.id, label: s?.name }))
  ];

  return (
    <div className="space-y-8">
      {/* Stock Levels */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="BarChart3" size={18} className="text-primary" />
          Niveles de Stock
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stock Actual — disabled, auto-updated from inventory */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="block text-xs font-semibold text-blue-700 mb-1 uppercase tracking-wide">
              Stock Actual
            </label>
            <input
              type="number"
              value={formData?.stockQuantity || '0'}
              disabled
              readOnly
              className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-blue-100 text-blue-700 text-sm cursor-not-allowed opacity-70"
            />
            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
              <Icon name="Lock" size={10} />
              Se actualiza automáticamente desde inventario
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <label className="block text-xs font-semibold text-red-700 mb-1 uppercase tracking-wide">
              Stock Mínimo <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData?.minStockLevel || ''}
              onChange={(e) => onChange('minStockLevel', e?.target?.value)}
              onBlur={() => onBlur?.('minStockLevel')}
              min="0"
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm ${
                touched?.minStockLevel && errors?.minStockLevel ? 'border-red-500' : 'border-red-200'
              }`}
            />
            {touched?.minStockLevel && errors?.minStockLevel && (
              <p className="text-xs text-red-500 mt-1">{errors?.minStockLevel}</p>
            )}
            <p className="text-xs text-red-600 mt-1">Genera alerta y pedido automático</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <label className="block text-xs font-semibold text-green-700 mb-1 uppercase tracking-wide">
              Stock Óptimo <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData?.optimalStockLevel || ''}
              onChange={(e) => onChange('optimalStockLevel', e?.target?.value)}
              onBlur={() => onBlur?.('optimalStockLevel')}
              min="0"
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm ${
                touched?.optimalStockLevel && errors?.optimalStockLevel ? 'border-red-500' : 'border-green-200'
              }`}
            />
            {touched?.optimalStockLevel && errors?.optimalStockLevel && (
              <p className="text-xs text-red-500 mt-1">{errors?.optimalStockLevel}</p>
            )}
            <p className="text-xs text-green-600 mt-1">Nivel ideal de operación</p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <label className="block text-xs font-semibold text-orange-700 mb-1 uppercase tracking-wide">
              Stock Máximo <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData?.maxStockLevel || ''}
              onChange={(e) => onChange('maxStockLevel', e?.target?.value)}
              onBlur={() => onBlur?.('maxStockLevel')}
              min="0"
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm ${
                touched?.maxStockLevel && errors?.maxStockLevel ? 'border-red-500' : 'border-orange-200'
              }`}
            />
            {touched?.maxStockLevel && errors?.maxStockLevel && (
              <p className="text-xs text-red-500 mt-1">{errors?.maxStockLevel}</p>
            )}
            <p className="text-xs text-orange-600 mt-1">Límite de capacidad en almacén</p>
          </div>
        </div>

        {/* Stock status indicator */}
        {formData?.stockQuantity !== '' && formData?.minStockLevel !== '' && (
          <div className={`mt-3 flex items-center gap-2 p-3 rounded-lg border ${
            parseInt(formData?.stockQuantity) <= 0
              ? 'bg-red-50 border-red-200 text-red-700'
              : parseInt(formData?.stockQuantity) <= parseInt(formData?.minStockLevel)
              ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :'bg-green-50 border-green-200 text-green-700'
          }`}>
            <Icon
              name={parseInt(formData?.stockQuantity) <= 0 ? 'XCircle' : parseInt(formData?.stockQuantity) <= parseInt(formData?.minStockLevel) ? 'AlertTriangle' : 'CheckCircle'}
              size={16}
            />
            <span className="text-sm font-medium">
              {parseInt(formData?.stockQuantity) <= 0
                ? 'Sin stock — Se generará pedido automático'
                : parseInt(formData?.stockQuantity) <= parseInt(formData?.minStockLevel)
                ? 'Stock bajo — Se generará alerta de pedido'
                : 'Stock en nivel normal'}
            </span>
          </div>
        )}
      </div>

      {/* Stock por Establecimiento */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
          <Icon name="Store" size={18} className="text-primary" />
          Stock por Establecimiento
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Asigna la cantidad de stock disponible para cada uno de tus establecimientos.
        </p>

        {loadingLocations ? (
          <div className="flex items-center gap-2 text-muted-foreground py-4">
            <Icon name="Loader2" size={16} className="animate-spin" />
            <span className="text-sm">Cargando establecimientos...</span>
          </div>
        ) : locations?.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-2">
              <Icon name="AlertTriangle" size={16} className="text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900 mb-1">No hay establecimientos registrados</p>
                <p className="text-xs text-yellow-700">
                  Ve a{' '}
                  <a href="/multi-location" className="text-yellow-800 underline">
                    Multi-Ubicación
                  </a>{' '}
                  para agregar tus establecimientos.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 bg-muted/50 px-4 py-2 border-b border-border">
              <div className="col-span-7 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Establecimiento</div>
              <div className="col-span-5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stock asignado</div>
            </div>
            <div className="divide-y divide-border">
              {locations?.map((loc) => {
                const locationStocks = formData?.locationStocks || [];
                const entry = locationStocks?.find(ls => ls?.locationId === loc?.id);
                const stockValue = entry?.stock ?? '';
                const displayName = loc?.branch_name || loc?.location_name || 'Establecimiento';
                const subLabel = [loc?.city, loc?.location_code]?.filter(Boolean)?.join(' · ');

                return (
                  <div key={loc?.id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-muted/20 transition-colors">
                    <div className="col-span-7 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon name="MapPin" size={14} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{displayName}</p>
                        {subLabel && (
                          <p className="text-xs text-muted-foreground">{subLabel}</p>
                        )}
                      </div>
                    </div>
                    <div className="col-span-5">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={stockValue}
                          onChange={(e) => {
                            const current = formData?.locationStocks || [];
                            const exists = current?.find(ls => ls?.locationId === loc?.id);
                            let updated;
                            if (exists) {
                              updated = current?.map(ls =>
                                ls?.locationId === loc?.id
                                  ? { ...ls, stock: e?.target?.value }
                                  : ls
                              );
                            } else {
                              updated = [
                                ...current,
                                { locationId: loc?.id, locationName: displayName, stock: e?.target?.value }
                              ];
                            }
                            onChange('locationStocks', updated);
                          }}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">uds.</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Total row */}
            {(() => {
              const total = (formData?.locationStocks || [])?.reduce((sum, ls) => sum + (parseInt(ls?.stock) || 0), 0);
              return (
                <div className="grid grid-cols-12 items-center px-4 py-3 bg-muted/30 border-t border-border">
                  <div className="col-span-7 text-sm font-semibold text-foreground">Total stock asignado</div>
                  <div className="col-span-5">
                    <span className="text-sm font-bold text-primary">{total} uds.</span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Costs & Margin */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="DollarSign" size={18} className="text-primary" />
          Costos y Margen
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Costo de compra unitario ({currencyCode}) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData?.purchaseCost || ''}
              onChange={(e) => onChange('purchaseCost', e?.target?.value)}
              onBlur={() => onBlur?.('purchaseCost')}
              step="0.01"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm ${
                touched?.purchaseCost && errors?.purchaseCost ? 'border-red-500' : 'border-border'
              }`}
            />
            {touched?.purchaseCost && errors?.purchaseCost && (
              <p className="text-xs text-red-500 mt-1">{errors?.purchaseCost}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Precio al que compras al proveedor</p>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">Margen de ganancia calculado</label>
            <div className={`flex items-center gap-3 p-3 rounded-lg border ${
              margin === null ? 'bg-muted border-border' :
              parseFloat(margin) < 0 ? 'bg-red-50 border-red-200' :
              parseFloat(margin) < 20 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
            }`}>
              <Icon
                name={margin === null ? 'Minus' : parseFloat(margin) < 0 ? 'TrendingDown' : 'TrendingUp'}
                size={20}
                className={margin === null ? 'text-muted-foreground' : parseFloat(margin) < 0 ? 'text-red-600' : parseFloat(margin) < 20 ? 'text-yellow-600' : 'text-green-600'}
              />
              <div>
                <p className={`text-xl font-bold ${
                  margin === null ? 'text-muted-foreground' :
                  parseFloat(margin) < 0 ? 'text-red-700' :
                  parseFloat(margin) < 20 ? 'text-yellow-700' : 'text-green-700'
                }`}>
                  {margin !== null ? `${margin}%` : '—'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {margin !== null
                    ? `Ganancia: ${formatPrice(regularPrice - purchaseCost)} por unidad`
                    : 'Ingresa costo de compra y precio regular'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supplier */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="Truck" size={18} className="text-primary" />
          Proveedor
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Proveedor asociado <span className="text-red-500">*</span>
            </label>
            <select
              value={formData?.supplierId || ''}
              onChange={(e) => onChange('supplierId', e?.target?.value)}
              onBlur={() => onBlur?.('supplierId')}
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm ${
                touched?.supplierId && errors?.supplierId ? 'border-red-500' : 'border-border'
              }`}
            >
              {supplierOptions?.map(opt => (
                <option key={opt?.value} value={opt?.value}>{opt?.label}</option>
              ))}
            </select>
            {touched?.supplierId && errors?.supplierId && (
              <p className="text-xs text-red-500 mt-1">{errors?.supplierId}</p>
            )}
            {suppliers?.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                <a href="/suppliers" className="text-primary hover:underline">Crear proveedores</a> para asociarlos a productos
              </p>
            )}
          </div>

          <Input
            label="Número de lote"
            value={formData?.lotNumber || ''}
            onChange={(e) => onChange('lotNumber', e?.target?.value)}
            placeholder="LOT-2024-001"
            helperText="Número de lote del proveedor"
          />

          <Input
            label="Fecha de caducidad"
            type="date"
            value={formData?.expiryDate || ''}
            onChange={(e) => onChange('expiryDate', e?.target?.value)}
          />

          <Input
            label="Ubicación en almacén"
            value={formData?.warehouseLocation || ''}
            onChange={(e) => onChange('warehouseLocation', e?.target?.value)}
            placeholder="Pasillo A, Estante 3"
            helperText="Referencia física de ubicación"
          />
        </div>
      </div>

      {/* Taxes — from catalog-settings */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="Receipt" size={18} className="text-primary" />
          Impuestos
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Selecciona los impuestos configurados en{' '}
          <a href="/catalog-settings?tab=taxes" className="text-primary hover:underline">
            Ajustes del Catálogo → Impuestos
          </a>.
        </p>

        {loadingTaxes ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon name="Loader2" size={16} className="animate-spin" />
            <span className="text-sm">Cargando impuestos...</span>
          </div>
        ) : catalogTaxRates?.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-2">
              <Icon name="AlertTriangle" size={16} className="text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900 mb-1">No hay impuestos configurados</p>
                <p className="text-xs text-yellow-700">
                  Ve a <a href="/catalog-settings?tab=taxes" className="text-yellow-800 underline">Ajustes del Catálogo → Impuestos</a> para configurarlos.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-border rounded-lg p-3 space-y-2">
            {catalogTaxRates?.map(rate => {
              const selectedTaxes = formData?.inventoryTaxes || [];
              const isChecked = selectedTaxes?.includes(rate?.id);
              return (
                <div
                  key={rate?.id}
                  onClick={() => {
                    const current = formData?.inventoryTaxes || [];
                    if (current?.includes(rate?.id)) {
                      onChange('inventoryTaxes', current?.filter(id => id !== rate?.id));
                    } else {
                      onChange('inventoryTaxes', [...current, rate?.id]);
                    }
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    isChecked ? 'bg-primary/5 border border-primary/30' : 'hover:bg-muted/30 border border-transparent'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isChecked ? 'border-primary bg-primary' : 'border-muted-foreground'
                  }`}>
                    {isChecked && <Icon name="Check" size={10} className="text-white" />}
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm font-medium text-foreground">{rate?.name}</span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      rate?.rate === 0 ? 'bg-green-100 text-green-700' :
                      rate?.rate === 8 ? 'bg-yellow-100 text-yellow-700' : 'bg-primary/10 text-primary'
                    }`}>{rate?.rate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TabInventario;
