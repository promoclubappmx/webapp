import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const TAX_REGIONS_MX = [
  {
    id: 'general',
    name: 'IVA General',
    description: 'Tasa estándar para la mayoría del territorio nacional',
    rate: 16,
    zone: 'Nacional'
  },
  {
    id: 'frontera',
    name: 'IVA Zona Fronteriza',
    description: 'Franja fronteriza norte y sur (Baja California, Sonora frontera, etc.)',
    rate: 8,
    zone: 'Fronteriza'
  },
  {
    id: 'tasa0',
    name: 'Tasa 0%',
    description: 'Alimentos no procesados, medicamentos, agua potable, libros y servicios médicos',
    rate: 0,
    zone: 'Nacional'
  }
];

const TaxSettings = () => {
  const { currencySettings, updateCurrencySettings, formatPrice } = useCurrency();
  const { user } = useAuth();

  const [taxConfig, setTaxConfig] = useState({
    selectedRates: [],
    taxIncludedInPrice: true,
    showTaxInCatalog: true,
    showTaxInCart: true,
    showTaxInOrders: true,
    showTaxInShipping: false,
    taxLabel: 'IVA',
    customRate: '',
    useCustomRate: false
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (currencySettings?.taxSettings) {
      const loaded = { ...currencySettings?.taxSettings };
      if (!loaded?.selectedRates) {
        loaded.selectedRates = loaded?.activeRegion ? [loaded?.activeRegion] : [];
      }
      if (loaded?.showTaxInInvoice !== undefined && loaded?.showTaxInOrders === undefined) {
        loaded.showTaxInOrders = loaded?.showTaxInInvoice;
      }
      setTaxConfig(prev => ({ ...prev, ...loaded }));
    } else {
      setTaxConfig(prev => ({
        ...prev,
        taxIncludedInPrice: currencySettings?.taxIncluded ?? true
      }));
    }
  }, [currencySettings]);

  const selectedRates = taxConfig?.selectedRates || [];

  const handleRateToggle = (regionId) => {
    setTaxConfig(prev => {
      const current = prev?.selectedRates || [];
      if (current?.includes(regionId)) {
        return { ...prev, selectedRates: current?.filter(id => id !== regionId) };
      } else {
        return { ...prev, selectedRates: [...current, regionId] };
      }
    });
  };

  const handleToggle = (field) => {
    setTaxConfig(prev => ({ ...prev, [field]: !prev?.[field] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const primaryRegion = TAX_REGIONS_MX?.find(r => r?.id === selectedRates?.[0]);
      const effectiveRate = taxConfig?.useCustomRate
        ? parseFloat(taxConfig?.customRate) || 0
        : primaryRegion?.rate ?? 16;

      await updateCurrencySettings({
        taxIncluded: taxConfig?.taxIncludedInPrice,
        taxRate: effectiveRate,
        taxSettings: taxConfig
      });

      // Persist each selected rate to tax_rates table linked to owner
      if (user?.id) {
        const ratesToSave = taxConfig?.useCustomRate
          ? [{ id: 'custom', name: 'Tasa personalizada', rate: effectiveRate, zone: 'Personalizada' }]
          : TAX_REGIONS_MX?.filter(r => selectedRates?.includes(r?.id));

        for (const region of ratesToSave) {
          const rateName = `${region?.name} (${region?.rate}%)`;
          const { data: existing } = await supabase
            ?.from('tax_rates')
            ?.select('id')
            ?.eq('owner_id', user?.id)
            ?.eq('name', rateName)
            ?.maybeSingle();

          if (existing?.id) {
            await supabase
              ?.from('tax_rates')
              ?.update({
                rate: region?.rate,
                description: taxConfig?.taxLabel || 'IVA',
                is_active: true,
                is_default: selectedRates?.[0] === region?.id,
                updated_at: new Date()?.toISOString()
              })
              ?.eq('id', existing?.id);
          } else {
            await supabase
              ?.from('tax_rates')
              ?.insert({
                owner_id: user?.id,
                created_by: user?.id,
                name: rateName,
                rate: region?.rate,
                description: taxConfig?.taxLabel || 'IVA',
                is_active: true,
                is_default: selectedRates?.[0] === region?.id
              });
          }
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving tax settings:', err);
    } finally {
      setSaving(false);
    }
  };

  // Build preview calculations for ALL selected rates
  const samplePrice = 100;
  const previewRates = taxConfig?.useCustomRate
    ? [{ id: 'custom', name: 'Tasa personalizada', rate: parseFloat(taxConfig?.customRate) || 0, zone: 'Personalizada' }]
    : TAX_REGIONS_MX?.filter(r => selectedRates?.includes(r?.id));

  const getCalc = (rate) => {
    const taxAmount = taxConfig?.taxIncludedInPrice
      ? samplePrice - samplePrice / (1 + rate / 100)
      : samplePrice * (rate / 100);
    const totalWithTax = taxConfig?.taxIncludedInPrice ? samplePrice : samplePrice + taxAmount;
    const basePrice = taxConfig?.taxIncludedInPrice ? samplePrice - taxAmount : samplePrice;
    return { taxAmount, totalWithTax, basePrice };
  };

  // Primary rate for legacy references
  const primaryRegion = TAX_REGIONS_MX?.find(r => r?.id === selectedRates?.[0]);
  const effectiveRate = taxConfig?.useCustomRate
    ? parseFloat(taxConfig?.customRate) || 0
    : primaryRegion?.rate ?? 0;
  const { taxAmount, totalWithTax, basePrice } = getCalc(effectiveRate);

  // Whether desglose section should be disabled
  const desgloseDisabled = taxConfig?.taxIncludedInPrice;

  return (
    <div className="space-y-6">
      {/* Regional IVA Tax Rates — multi-select */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="MapPin" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Tasas Regionales de IVA — México</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Selecciona una o más tasas aplicables a tu negocio conforme al SAT. Puedes seleccionar múltiples tasas simultáneamente.
        </p>

        <div className="space-y-3">
          {TAX_REGIONS_MX?.map(region => {
            const isSelected = selectedRates?.includes(region?.id);
            return (
              <div
                key={region?.id}
                onClick={() => handleRateToggle(region?.id)}
                className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5' :'border-border hover:border-primary/40 hover:bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                  }`}>
                    {isSelected && (
                      <Icon name="Check" size={12} className="text-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{region?.name}</span>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        region?.rate === 0
                          ? 'bg-success/10 text-success'
                          : region?.rate === 8
                          ? 'bg-warning/10 text-warning' :'bg-primary/10 text-primary'
                      }`}>
                        {region?.rate}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{region?.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-foreground">{region?.rate}%</span>
                  <p className="text-xs text-muted-foreground">{region?.zone}</p>
                </div>
              </div>
            );
          })}
        </div>

        {selectedRates?.length > 1 && (
          <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-xs text-primary font-medium">
              <Icon name="Info" size={12} className="inline mr-1" />
              {selectedRates?.length} tasas seleccionadas: {selectedRates?.map(id => {
                const r = TAX_REGIONS_MX?.find(x => x?.id === id);
                return `${r?.name} (${r?.rate}%)`;
              })?.join(', ')}. La vista previa mostrará el cálculo para cada tasa.
            </p>
          </div>
        )}

        {/* Custom Rate */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              id="useCustomRate"
              checked={taxConfig?.useCustomRate}
              onChange={() => handleToggle('useCustomRate')}
              className="w-4 h-4 text-primary rounded"
            />
            <label htmlFor="useCustomRate" className="text-sm font-medium text-foreground cursor-pointer">
              Usar tasa personalizada
            </label>
          </div>
          {taxConfig?.useCustomRate && (
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={taxConfig?.customRate}
                onChange={(e) => setTaxConfig(prev => ({ ...prev, customRate: e?.target?.value }))}
                placeholder="0.00"
                className="w-32 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          )}
        </div>
      </div>

      {/* Opción impuesto incluido (formerly Reglas de Cálculo Automático) */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Calculator" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Opción impuesto incluido</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex-1 pr-4">
              <p className="font-medium text-foreground">Los precios mostrados ya incluyen IVA</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {taxConfig?.taxIncludedInPrice
                  ? 'Precio final en productos, servicios, envíos con el IVA incluido sin desglosar'
                  : 'El IVA se agrega al precio base al momento del cobro'}
              </p>
              {taxConfig?.taxIncludedInPrice && (
                <p className="text-xs text-warning mt-1 font-medium">
                  <Icon name="AlertTriangle" size={12} className="inline mr-1" />
                  Las opciones de desglose están deshabilitadas mientras esta opción esté activa.
                </p>
              )}
            </div>
            <button
              onClick={() => handleToggle('taxIncludedInPrice')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                taxConfig?.taxIncludedInPrice ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                taxConfig?.taxIncludedInPrice ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Opciones de desglose (formerly Opciones de Visualización) */}
      <div className={`bg-card border rounded-lg p-6 transition-opacity ${
        desgloseDisabled ? 'border-border opacity-50 pointer-events-none' : 'border-border'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <Icon name="Eye" size={20} className={desgloseDisabled ? 'text-muted-foreground' : 'text-primary'} />
          <h3 className="text-lg font-semibold text-foreground">Opciones de desglose</h3>
          {desgloseDisabled && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
              Deshabilitado
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-5">Controla dónde y cómo se muestra el desglose del impuesto.</p>

        <div className="space-y-3">
          {[
            { field: 'showTaxInCatalog', label: 'Mostrar IVA en Catálogo', desc: 'Indica el IVA en la ficha de cada producto/servicio', icon: 'Package' },
            { field: 'showTaxInCart', label: 'Mostrar IVA en Carrito POS', desc: 'Desglose de IVA en el resumen del carrito', icon: 'ShoppingCart' },
            { field: 'showTaxInOrders', label: 'Mostrar IVA en pedidos', desc: 'Muestra desglose de IVA en pedidos de compra y recepción de mercancía', icon: 'ClipboardList' },
            { field: 'showTaxInShipping', label: 'Mostrar IVA en costos de envío', desc: 'Muestra el desglose de IVA aplicado a los costos de envío', icon: 'Truck' }
          ]?.map(item => (
            <div key={item?.field} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name={item?.icon} size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item?.label}</p>
                  <p className="text-xs text-muted-foreground">{item?.desc}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle(item?.field)}
                disabled={desgloseDisabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  taxConfig?.[item?.field] && !desgloseDisabled ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  taxConfig?.[item?.field] && !desgloseDisabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Live Preview — shows ALL selected rates */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Receipt" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Vista Previa de Cálculo</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Ejemplo con precio de {formatPrice(samplePrice)} — {previewRates?.length > 1 ? `${previewRates?.length} tasas seleccionadas` : `Tasa activa: ${previewRates?.[0]?.rate ?? effectiveRate}% ${taxConfig?.taxLabel}`}
        </p>

        <div className="space-y-6">
          {previewRates?.map((region) => {
            const calc = getCalc(region?.rate);
            return (
              <div key={region?.id}>
                {previewRates?.length > 1 && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      region?.rate === 0
                        ? 'bg-success/10 text-success'
                        : region?.rate === 8
                        ? 'bg-warning/10 text-warning' :'bg-primary/10 text-primary'
                    }`}>
                      {region?.rate}%
                    </span>
                    <span className="text-sm font-semibold text-foreground">{region?.name}</span>
                    <span className="text-xs text-muted-foreground">— {region?.zone}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Catalog display */}
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon name="Package" size={16} className="text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Catálogo</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">{formatPrice(samplePrice)}</p>
                    {taxConfig?.showTaxInCatalog && !desgloseDisabled && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {taxConfig?.taxIncludedInPrice
                          ? `${taxConfig?.taxLabel} incluido (${formatPrice(calc?.taxAmount)})`
                          : `+ ${taxConfig?.taxLabel} ${region?.rate}%`}
                      </p>
                    )}
                  </div>

                  {/* Cart display */}
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon name="ShoppingCart" size={16} className="text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Carrito POS</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatPrice(calc?.basePrice)}</span>
                      </div>
                      {taxConfig?.showTaxInCart && !desgloseDisabled && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{taxConfig?.taxLabel} ({region?.rate}%)</span>
                          <span>{formatPrice(calc?.taxAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold border-t border-border pt-1">
                        <span>Total</span>
                        <span>{formatPrice(calc?.totalWithTax)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Orders display */}
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon name="ClipboardList" size={16} className="text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pedidos</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Precio base</span>
                        <span>{formatPrice(calc?.basePrice)}</span>
                      </div>
                      {taxConfig?.showTaxInOrders && !desgloseDisabled && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{taxConfig?.taxLabel} {region?.rate}%</span>
                          <span>{formatPrice(calc?.taxAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold border-t border-border pt-1">
                        <span>Total</span>
                        <span>{formatPrice(calc?.totalWithTax)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {previewRates?.length > 1 && previewRates?.indexOf(region) < previewRates?.length - 1 && (
                  <div className="border-t border-dashed border-border mt-4" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Icon name="Info" size={18} className="text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">Información fiscal México (SAT)</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• <strong>16%</strong> — Tasa general aplicable en todo el territorio nacional</li>
              <li>• <strong>8%</strong> — Zona fronteriza norte/sur (Decreto DOF 31/12/2018)</li>
              <li>• <strong>0%</strong> — Alimentos no procesados, medicamentos, agua potable, libros</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Save / Cancel */}
      <div className="flex items-center justify-between pt-2">
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-green-50 border border-green-200 text-green-800">
            <Icon name="CheckCircle" size={16} />
            Configuración de impuestos guardada
          </div>
        )}
        <div className="ml-auto flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              if (currencySettings?.taxSettings) {
                const loaded = { ...currencySettings?.taxSettings };
                if (!loaded?.selectedRates) loaded.selectedRates = ['general'];
                setTaxConfig(prev => ({ ...prev, ...loaded }));
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
            iconName={saved ? 'Check' : 'Save'}
            iconPosition="left"
            variant={saved ? 'secondary' : 'default'}
          >
            {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaxSettings;
