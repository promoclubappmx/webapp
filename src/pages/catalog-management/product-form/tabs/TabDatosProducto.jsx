import React, { useState, useEffect } from 'react';
import Input from '../../../../components/ui/Input';


import Button from '../../../../components/ui/Button';
import Icon from '../../../../components/AppIcon';
import { useCurrency } from '../../../../contexts/CurrencyContext';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';

const FALLBACK_IVA_RATES = [
  { id: 'general', label: 'IVA General 16%', rate: 16 },
  { id: 'frontera', label: 'IVA Zona Fronteriza 8%', rate: 8 },
  { id: 'tasa0', label: 'Tasa 0%', rate: 0 }
];

const TabDatosProducto = ({ formData, errors, touched, onChange, onBlur, activeSubTab, onSave, isLoading }) => {
  const { formatPrice, currencySettings } = useCurrency();
  const { user } = useAuth();
  const decimalPlaces = currencySettings?.decimalPlaces ?? 2;
  const currencyCode = currencySettings?.defaultCurrency || 'MXN';

  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');
  const [editingAttrIndex, setEditingAttrIndex] = useState(null);
  const [editAttrKey, setEditAttrKey] = useState('');
  const [editAttrValue, setEditAttrValue] = useState('');

  const [relatedSearch, setRelatedSearch] = useState('');
  const [crossSellSearch, setCrossSellSearch] = useState('');
  const [relatedResults, setRelatedResults] = useState([]);
  const [crossSellResults, setCrossSellResults] = useState([]);
  const [searchingRelated, setSearchingRelated] = useState(false);
  const [searchingCrossSell, setSearchingCrossSell] = useState(false);

  const [newTimeStart, setNewTimeStart] = useState('09:00');
  const [newTimeEnd, setNewTimeEnd] = useState('18:00');
  const [newTimeDay, setNewTimeDay] = useState('all');

  // IVA rates loaded from business-settings (tax_rates table)
  const [availableIvaRates, setAvailableIvaRates] = useState([]);
  const [loadingIva, setLoadingIva] = useState(false);

  useEffect(() => {
    const fetchIvaRates = async () => {
      if (!user?.id) return;
      setLoadingIva(true);
      try {
        const { data, error } = await supabase
          ?.from('tax_rates')
          ?.select('id, name, rate')
          ?.eq('owner_id', user?.id)
          ?.eq('is_active', true)
          ?.order('rate', { ascending: false });
        if (!error && data?.length > 0) {
          setAvailableIvaRates(data?.map(r => ({ id: r?.id, label: r?.name, rate: r?.rate })));
        } else {
          const enabledRateIds = currencySettings?.taxSettings?.selectedRates || ['general'];
          const fallback = FALLBACK_IVA_RATES?.filter(r => enabledRateIds?.includes(r?.id));
          setAvailableIvaRates(fallback?.length > 0 ? fallback : FALLBACK_IVA_RATES);
        }
      } catch {
        setAvailableIvaRates(FALLBACK_IVA_RATES);
      } finally {
        setLoadingIva(false);
      }
    };
    fetchIvaRates();
  }, [user?.id]);

  const DAYS_OF_WEEK = [
    { key: 'lunes', label: 'Lunes' },
    { key: 'martes', label: 'Martes' },
    { key: 'miercoles', label: 'Miércoles' },
    { key: 'jueves', label: 'Jueves' },
    { key: 'viernes', label: 'Viernes' },
    { key: 'sabado', label: 'Sábado' },
    { key: 'domingo', label: 'Domingo' },
  ];

  const getScheduleForDay = (day) => {
    const slots = formData?.availableTimeSlots || [];
    return slots?.filter(s => s?.day === day);
  };

  const addScheduleSlot = (day) => {
    const slots = formData?.availableTimeSlots || [];
    const newSlot = { day, start: '09:00', end: '18:00', id: `${day}-${Date.now()}` };
    onChange('availableTimeSlots', [...slots, newSlot]);
  };

  const updateScheduleSlot = (id, field, value) => {
    const slots = (formData?.availableTimeSlots || [])?.map(s =>
      s?.id === id ? { ...s, [field]: value } : s
    );
    onChange('availableTimeSlots', slots);
  };

  const removeScheduleSlot = (id) => {
    onChange('availableTimeSlots', (formData?.availableTimeSlots || [])?.filter(s => s?.id !== id));
  };

  const toggleDayEnabled = (day) => {
    const slots = formData?.availableTimeSlots || [];
    const daySlots = slots?.filter(s => s?.day === day);
    if (daySlots?.length > 0) {
      onChange('availableTimeSlots', slots?.filter(s => s?.day !== day));
    } else {
      addScheduleSlot(day);
    }
  };

  const [offerTimeStart, setOfferTimeStart] = useState('');
  const [offerTimeEnd, setOfferTimeEnd] = useState('');
  const [useTimeRange, setUseTimeRange] = useState(false);

  const validatePriceField = (value, fieldName) => {
    if (!value && value !== 0) return null;
    const num = parseFloat(value);
    if (isNaN(num)) return 'Ingresa un número válido';
    if (num < 0) return 'El precio no puede ser negativo';
    const decimalRegex = new RegExp(`^\\d+(\\.\\d{0,${decimalPlaces}})?$`);
    if (!decimalRegex?.test(String(value))) return `Máximo ${decimalPlaces} decimales permitidos`;
    if (fieldName === 'regularPrice' && num === 0) return 'El precio regular debe ser mayor a 0';
    if (fieldName === 'salePrice' && formData?.regularPrice) {
      if (num >= parseFloat(formData?.regularPrice)) return 'El precio de oferta debe ser menor al precio regular';
    }
    return null;
  };

  const getPriceError = (fieldName) => {
    if (touched?.[fieldName] && errors?.[fieldName]) return errors?.[fieldName];
    if (touched?.[fieldName] && formData?.[fieldName] !== undefined && formData?.[fieldName] !== '') {
      return validatePriceField(formData?.[fieldName], fieldName);
    }
    return null;
  };

  const hasSaleOffer = formData?.enableSaleOffer || false;
  const isService = formData?.productOrService === 'service';
  const itemLabel = isService ? 'servicio' : 'producto';
  const ItemLabel = isService ? 'Servicio' : 'Producto';

  const renderPreciosSubTab = () => {
    const selectedIvaId = formData?.taxRates?.[0];
    const taxIncluded = currencySettings?.taxSettings?.taxIncludedInPrice ?? true;
    const FALLBACK_RATES = { general: 16, frontera: 8, tasa0: 0 };
    let ivaRate = null;
    let ivaLabel = null;

    if (selectedIvaId) {
      // Try to find in loaded rates first
      const loadedRate = availableIvaRates?.find(r => r?.id === selectedIvaId);
      if (loadedRate) {
        ivaRate = loadedRate?.rate;
        ivaLabel = loadedRate?.label;
      } else {
        const knownRate = FALLBACK_RATES?.[selectedIvaId];
        if (knownRate !== undefined) {
          ivaRate = knownRate;
          ivaLabel = selectedIvaId === 'general' ? 'IVA General 16%' : selectedIvaId === 'frontera' ? 'IVA Zona Fronteriza 8%' : 'Tasa 0%';
        } else {
          const taxSettings = currencySettings?.taxSettings;
          if (taxSettings?.useCustomRate) {
            ivaRate = parseFloat(taxSettings?.customRate) || 0;
            ivaLabel = `Tasa personalizada ${ivaRate}%`;
          }
        }
      }
    }

    const regularPrice = parseFloat(formData?.regularPrice) || 0;
    let finalPrice = null;
    let ivaAmount = null;

    if (regularPrice > 0 && ivaRate !== null) {
      if (taxIncluded) {
        finalPrice = regularPrice;
        ivaAmount = regularPrice - regularPrice / (1 + ivaRate / 100);
      } else {
        ivaAmount = regularPrice * (ivaRate / 100);
        finalPrice = regularPrice + ivaAmount;
      }
    }

    return (
      <div className="space-y-6">
        {/* IVA Rates Section — from business-settings */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Tasas de IVA aplicables <span className="text-red-500">*</span>
          </label>
          {touched?.taxRates && errors?.taxRates && (
            <p className="text-xs text-red-500 mb-2">{errors?.taxRates}</p>
          )}
          <p className="text-xs text-muted-foreground mb-3">
            Selecciona la tasa de IVA para este {itemLabel}. Las tasas se configuran en <a href="/business-settings?tab=fiscal" className="text-primary hover:underline">Configuración del Negocio → Datos Fiscales</a>.
          </p>
          {loadingIva ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon name="Loader2" size={14} className="animate-spin" />
              <span className="text-xs">Cargando tasas de IVA...</span>
            </div>
          ) : availableIvaRates?.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-700">No hay tasas de IVA configuradas. Ve a <a href="/business-settings?tab=fiscal" className="text-yellow-800 underline">Configuración del Negocio → Datos Fiscales</a> para habilitarlas.</p>
            </div>
          ) : (
            <div className="border border-border rounded-lg p-3 space-y-2">
              {availableIvaRates?.map(rate => {
                const isSelected = selectedIvaId === rate?.id;
                return (
                  <div
                    key={rate?.id}
                    onClick={() => onChange('taxRates', [rate?.id])}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/5 border border-primary/30' : 'hover:bg-muted/30 border border-transparent'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'border-primary' : 'border-muted-foreground'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-sm font-medium text-foreground">{rate?.label}</span>
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

        {currencySettings?.taxSettings && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Icon name="Info" size={14} className="text-blue-600 shrink-0" />
            <p className="text-xs text-blue-700">
              <strong>IVA {currencySettings?.taxSettings?.activeRegion === 'frontera' ? '8%' : currencySettings?.taxSettings?.activeRegion === 'exento' ? '0%' : '16%'}</strong>
              {' — '}{currencySettings?.taxSettings?.taxIncludedInPrice ? 'Precios con IVA incluido' : 'IVA se agrega al precio base'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <div className="flex items-center gap-4 mb-2">
              <label className="text-sm font-medium text-foreground">
                Precio regular del {itemLabel} ({currencyCode}) <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => onChange('enableSaleOffer', !hasSaleOffer)}
                className="flex items-center gap-2 cursor-pointer select-none ml-auto"
              >
                <div className={`relative w-10 h-5 rounded-full transition-colors ${hasSaleOffer ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${hasSaleOffer ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <span className="text-sm text-muted-foreground">Agregar precio de oferta</span>
              </button>
            </div>
            <Input
              type="number"
              value={formData?.regularPrice}
              onChange={(e) => onChange('regularPrice', e?.target?.value)}
              onBlur={() => onBlur?.('regularPrice')}
              error={getPriceError('regularPrice')}
              placeholder="0.00"
              step={`0.${'0'?.repeat(decimalPlaces - 1)}1`}
              helperText={`Formato: ${formatPrice(1234.5)} — No puede ser negativo`}
            />

            {regularPrice > 0 && selectedIvaId && ivaRate !== null && (
              <div className="mt-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="Calculator" size={14} className="text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-800">Precio final con IVA aplicado</span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                  <span className="text-muted-foreground">Tasa seleccionada:</span>
                  <span className="font-medium text-foreground">{ivaLabel} ({ivaRate}%)</span>
                  <span className="text-muted-foreground">{taxIncluded ? 'Precio ingresado (IVA incluido):' : 'Precio base (sin IVA):'}</span>
                  <span className="font-medium text-foreground">{formatPrice(regularPrice)}</span>
                  <span className="text-muted-foreground">Monto IVA:</span>
                  <span className="font-medium text-foreground">{formatPrice(ivaAmount)}</span>
                  <span className="text-muted-foreground font-semibold">Precio final al cliente:</span>
                  <span className="font-bold text-emerald-700 text-sm">{formatPrice(finalPrice)}</span>
                </div>
                {ivaRate === 0 && (
                  <p className="text-xs text-emerald-700 mt-2 italic">Este {itemLabel} aplica Tasa 0% — no se agrega IVA adicional.</p>
                )}
              </div>
            )}

            {regularPrice > 0 && !selectedIvaId && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                <Icon name="AlertTriangle" size={14} className="text-yellow-600 shrink-0" />
                <p className="text-xs text-yellow-700">Selecciona una tasa de IVA arriba para ver el precio final con IVA.</p>
              </div>
            )}
          </div>

          {hasSaleOffer && (
            <div className="md:col-span-2 border border-primary/30 bg-primary/5 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="Tag" size={16} className="text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Configuración de oferta del {itemLabel}</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={`Precio de oferta (${currencyCode})`}
                  type="number"
                  value={formData?.salePrice}
                  onChange={(e) => onChange('salePrice', e?.target?.value)}
                  onBlur={() => onBlur?.('salePrice')}
                  error={getPriceError('salePrice')}
                  placeholder="0.00"
                  step={`0.${'0'?.repeat(decimalPlaces - 1)}1`}
                  helperText={formData?.regularPrice ? `Debe ser menor a ${formatPrice(formData?.regularPrice)}` : `Ingresa el precio regular del ${itemLabel} primero`}
                />
                <div />
                <Input label="Fecha inicio oferta" type="date" value={formData?.saleDateStart} onChange={(e) => onChange('saleDateStart', e?.target?.value)} />
                <Input label="Fecha fin oferta" type="date" value={formData?.saleDateEnd} onChange={(e) => onChange('saleDateEnd', e?.target?.value)} />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer select-none mb-3">
                  <input type="checkbox" checked={useTimeRange} onChange={(e) => setUseTimeRange(e?.target?.checked)} className="w-4 h-4 text-primary rounded" />
                  <span className="text-sm text-foreground">Definir rango de hora para la oferta (opcional)</span>
                </label>
                {useTimeRange && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Hora inicio</label>
                      <input type="time" value={offerTimeStart} onChange={(e) => setOfferTimeStart(e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Hora fin</label>
                      <input type="time" value={offerTimeEnd} onChange={(e) => setOfferTimeEnd(e?.target?.value)} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm" />
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white border border-primary/20 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="Info" size={14} className="text-primary" />
                  <span className="text-xs font-semibold text-primary">Resumen de la configuración de oferta</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-foreground">
                  <span className="text-muted-foreground">Precio regular:</span>
                  <span className="font-medium">{formData?.regularPrice ? formatPrice(formData?.regularPrice) : '—'}</span>
                  <span className="text-muted-foreground">Precio de oferta:</span>
                  <span className="font-medium text-green-700">{formData?.salePrice ? formatPrice(formData?.salePrice) : '—'}</span>
                  {formData?.regularPrice && formData?.salePrice && parseFloat(formData?.salePrice) < parseFloat(formData?.regularPrice) && (
                    <>
                      <span className="text-muted-foreground">Descuento:</span>
                      <span className="font-medium text-green-700">{Math.round((1 - parseFloat(formData?.salePrice) / parseFloat(formData?.regularPrice)) * 100)}% off</span>
                    </>
                  )}
                  <span className="text-muted-foreground">Fecha inicio:</span>
                  <span className="font-medium">{formData?.saleDateStart || '—'}</span>
                  <span className="text-muted-foreground">Fecha fin:</span>
                  <span className="font-medium">{formData?.saleDateEnd || '—'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderInventarioSubTab = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <input type="checkbox" id="manageInventory" checked={formData?.manageInventory} onChange={(e) => onChange('manageInventory', e?.target?.checked)} className="w-4 h-4 text-primary rounded" />
        <div>
          <label htmlFor="manageInventory" className="text-sm font-semibold text-foreground cursor-pointer">Gestionar inventario del {itemLabel}</label>
          <p className="text-xs text-muted-foreground mt-0.5">Activa para habilitar la pestaña de Inventario con stock, costos y proveedor</p>
        </div>
      </div>

      {formData?.manageInventory && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex gap-2">
            <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900 mb-1">Inventario activado</p>
              <p className="text-xs text-green-700">La pestaña <strong>Inventario</strong> está disponible. Configura stock mínimo, máximo, óptimo, costos y proveedor.</p>
            </div>
          </div>
        </div>
      )}

      {formData?.manageInventory && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label={`Stock actual del ${itemLabel} (unidades) *`} type="number" value={formData?.stockQuantity} onChange={(e) => onChange('stockQuantity', e?.target?.value)} onBlur={() => onBlur?.('stockQuantity')} error={touched?.stockQuantity && errors?.stockQuantity} placeholder="0" />
          <Input label="Umbral de stock bajo" type="number" value={formData?.lowStockThreshold} onChange={(e) => onChange('lowStockThreshold', e?.target?.value)} placeholder="5" helperText="Alerta interna cuando el stock sea menor" />

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">Política sin stock</label>
            <div className="flex gap-4">
              {[{ value: 'block', label: 'Bloquear compra' }, { value: 'allow', label: 'Permitir' }, { value: 'hide', label: `Ocultar ${itemLabel}` }]?.map(policy => (
                <label key={policy?.value} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="outOfStockPolicy" value={policy?.value} checked={formData?.outOfStockPolicy === policy?.value} onChange={(e) => onChange('outOfStockPolicy', e?.target?.value)} className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">{policy?.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="soldIndividually" checked={formData?.soldIndividually} onChange={(e) => onChange('soldIndividually', e?.target?.checked)} className="w-4 h-4 text-primary rounded" />
              <label htmlFor="soldIndividually" className="text-sm font-medium text-foreground cursor-pointer">Vendido individualmente (solo 1 por pedido)</label>
            </div>
          </div>

          <Input label="Lote mínimo de compra" type="number" value={formData?.minPurchaseQuantity} onChange={(e) => onChange('minPurchaseQuantity', e?.target?.value)} placeholder="1" />
          <Input label="Lote máximo de compra" type="number" value={formData?.maxPurchaseQuantity} onChange={(e) => onChange('maxPurchaseQuantity', e?.target?.value)} placeholder="Sin límite" />
        </div>
      )}

      {!formData?.manageInventory && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-2">
            <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">Inventario desactivado</p>
              <p className="text-xs text-blue-700">Este {itemLabel} no gestionará inventario. Activa la opción "Gestionar inventario" para habilitar el control de stock.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderVariantesSubTab = () => (
    <div className="space-y-6">
      {formData?.itemType === 'variable' ? (
        <>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Atributos globales del {itemLabel}</h4>
            <p className="text-xs text-muted-foreground mb-4">Define los atributos (Talla, Color, Sabor) y sus valores (S, M, L)</p>
            <Button size="sm" variant="outline" iconName="Plus" iconPosition="left">Agregar Atributo</Button>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Tabla de variantes</h4>
            <p className="text-xs text-muted-foreground mb-4">Cada combinación de atributos genera una variante con su propio precio, stock, SKU e imagen</p>
            <div className="border border-border rounded-lg p-4 text-center text-muted-foreground">
              <Icon name="Grid3X3" size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Agrega atributos para generar variantes automáticamente</p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Icon name="Info" size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Las variantes solo están disponibles para {itemLabel}s de tipo "Variable"</p>
        </div>
      )}
    </div>
  );

  const renderServicioSubTab = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Icon name="Info" size={14} className="text-blue-600 shrink-0" />
        <p className="text-xs text-blue-700">
          Configura cómo se entrega o ejecuta este {itemLabel}. Esta información se guarda en Supabase junto con el {itemLabel} al hacer clic en <strong className="ml-1">Guardar {ItemLabel}</strong> en la pestaña Avanzado.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-2">Modalidad de entrega del {itemLabel}</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: 'in_store', label: 'En establecimiento', icon: 'Store' },
              { value: 'at_home', label: 'A domicilio', icon: 'Home' },
              { value: 'digital', label: 'Digital / Online', icon: 'Monitor' },
              { value: 'mixed', label: 'Mixto', icon: 'Shuffle' },
            ]?.map(opt => (
              <button
                key={opt?.value}
                type="button"
                onClick={() => onChange('deliveryType', opt?.value)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center ${
                  formData?.deliveryType === opt?.value ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/40 text-muted-foreground'
                }`}
              >
                <Icon name={opt?.icon} size={20} />
                <span className="text-xs font-medium leading-tight">{opt?.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Tiempo estimado de ejecución del {itemLabel}</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={formData?.preparationTime || ''}
              onChange={(e) => onChange('preparationTime', e?.target?.value)}
              placeholder="30"
              min="1"
              className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
            />
            <select
              value={formData?.preparationTimeUnit || 'minutes'}
              onChange={(e) => onChange('preparationTimeUnit', e?.target?.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
            >
              <option value="minutes">Minutos</option>
              <option value="hours">Horas</option>
              <option value="days">Días</option>
            </select>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Duración aproximada del {itemLabel}</p>
        </div>

        {(formData?.deliveryType === 'at_home' || formData?.deliveryType === 'mixed') && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Radio máximo de cobertura (km)</label>
            <input
              type="number"
              value={formData?.maxDeliveryRadius || ''}
              onChange={(e) => onChange('maxDeliveryRadius', e?.target?.value)}
              placeholder="10"
              min="1"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">Distancia máxima desde el establecimiento</p>
          </div>
        )}

        <div className="md:col-span-2">
          <div
            className="flex items-start gap-3 p-4 bg-muted/30 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onChange('requiresAppointment', !formData?.requiresAppointment)}
          >
            <input
              type="checkbox"
              checked={formData?.requiresAppointment || false}
              onChange={(e) => { e?.stopPropagation(); onChange('requiresAppointment', e?.target?.checked); }}
              className="w-4 h-4 text-primary rounded mt-0.5 cursor-pointer"
            />
            <div>
              <label className="text-sm font-semibold text-foreground cursor-pointer">Requiere cita previa</label>
              <p className="text-xs text-muted-foreground mt-0.5">El cliente deberá agendar una cita para recibir este {itemLabel}</p>
            </div>
            {formData?.requiresAppointment && (
              <span className="ml-auto flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full font-medium shrink-0">
                <Icon name="Calendar" size={12} />
                Cita requerida
              </span>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-2">Instrucciones / Notas del {itemLabel}</label>
          <textarea
            value={formData?.deliveryNotes || ''}
            onChange={(e) => onChange('deliveryNotes', e?.target?.value)}
            placeholder={`Ej: El cliente debe traer identificación oficial. El ${itemLabel} incluye materiales.`}
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground resize-none text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">Instrucciones visibles para el cliente al contratar el {itemLabel}</p>
        </div>

        {(formData?.deliveryType || formData?.preparationTime) && (
          <div className="md:col-span-2 p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="ClipboardList" size={16} className="text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Resumen de entrega del {itemLabel}</h4>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
              <span className="text-muted-foreground">Modalidad:</span>
              <span className="font-medium text-foreground">
                {formData?.deliveryType === 'in_store' ? 'En establecimiento' :
                 formData?.deliveryType === 'at_home' ? 'A domicilio' :
                 formData?.deliveryType === 'digital' ? 'Digital / Online' : 'Mixto'}
              </span>
              {formData?.preparationTime && (
                <>
                  <span className="text-muted-foreground">Duración estimada:</span>
                  <span className="font-medium text-foreground">
                    {formData?.preparationTime} {formData?.preparationTimeUnit === 'minutes' ? 'min' : formData?.preparationTimeUnit === 'hours' ? 'hr' : 'días'}
                  </span>
                </>
              )}
              {formData?.maxDeliveryRadius && (
                <>
                  <span className="text-muted-foreground">Radio de cobertura:</span>
                  <span className="font-medium text-foreground">{formData?.maxDeliveryRadius} km</span>
                </>
              )}
              <span className="text-muted-foreground">Requiere cita:</span>
              <span className={`font-medium ${formData?.requiresAppointment ? 'text-primary' : 'text-muted-foreground'}`}>
                {formData?.requiresAppointment ? 'Sí' : 'No'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <Icon name="Save" size={12} />
              Esta configuración se guardará en Supabase al hacer clic en <strong className="ml-1">Guardar {ItemLabel}</strong> en la pestaña Avanzado.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const searchProducts = async (query, type) => {
    if (!query?.trim() || query?.length < 2) {
      if (type === 'related') setRelatedResults([]);
      else setCrossSellResults([]);
      return;
    }
    if (type === 'related') setSearchingRelated(true);
    else setSearchingCrossSell(true);
    try {
      const { data, error } = await supabase?.from('catalog_items')?.select('id, name, sku, image_url')?.eq('user_id', user?.id)?.ilike('name', `%${query}%`)?.limit(8);
      if (!error) {
        if (type === 'related') setRelatedResults(data || []);
        else setCrossSellResults(data || []);
      }
    } catch (err) {
      console.error('Error searching products:', err);
    } finally {
      if (type === 'related') setSearchingRelated(false);
      else setSearchingCrossSell(false);
    }
  };

  const addLinkedProduct = (product, type) => {
    const field = type === 'related' ? 'relatedProducts' : 'crossSellProducts';
    const current = formData?.[field] || [];
    if (current?.find(p => p?.id === product?.id)) return;
    onChange(field, [...current, { id: product?.id, name: product?.name, sku: product?.sku, image: product?.image_url }]);
    if (type === 'related') { setRelatedSearch(''); setRelatedResults([]); }
    else { setCrossSellSearch(''); setCrossSellResults([]); }
  };

  const removeLinkedProduct = (productId, type) => {
    const field = type === 'related' ? 'relatedProducts' : 'crossSellProducts';
    onChange(field, (formData?.[field] || [])?.filter(p => p?.id !== productId));
  };

  const renderVinculacionSubTab = () => (
    <div className="space-y-8">
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-1">Productos y servicios relacionados</h4>
        <p className="text-xs text-muted-foreground mb-3">Se muestran en la ficha pública del producto ("También te puede interesar")</p>
        <div className="relative mb-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={relatedSearch}
                onChange={(e) => { setRelatedSearch(e?.target?.value); searchProducts(e?.target?.value, 'related'); }}
                placeholder="Buscar producto o servicio por nombre..."
                className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
              />
              {searchingRelated && <Icon name="Loader2" size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />}
            </div>
          </div>
          {relatedResults?.length > 0 && (
            <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {relatedResults?.map(product => (
                <button key={product?.id} type="button" onClick={() => addLinkedProduct(product, 'related')} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted text-left transition-colors">
                  {product?.image_url ? (
                    <img src={product?.image_url} alt={product?.name} className="w-8 h-8 object-cover rounded" />
                  ) : (
                    <div className="w-8 h-8 bg-muted rounded flex items-center justify-center"><Icon name="Package" size={14} className="text-muted-foreground" /></div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{product?.name}</p>
                    {product?.sku && <p className="text-xs text-muted-foreground">SKU: {product?.sku}</p>}
                  </div>
                  <Icon name="Plus" size={14} className="ml-auto text-primary" />
                </button>
              ))}
            </div>
          )}
        </div>
        {formData?.relatedProducts?.length > 0 ? (
          <div className="space-y-2">
            {formData?.relatedProducts?.map(product => (
              <div key={product?.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg border border-border">
                {product?.image ? <img src={product?.image} alt={product?.name} className="w-8 h-8 object-cover rounded" /> : <div className="w-8 h-8 bg-muted rounded flex items-center justify-center"><Icon name="Package" size={14} className="text-muted-foreground" /></div>}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{product?.name}</p>
                  {product?.sku && <p className="text-xs text-muted-foreground">SKU: {product?.sku}</p>}
                </div>
                <button type="button" onClick={() => removeLinkedProduct(product?.id, 'related')} className="p-1 text-muted-foreground hover:text-red-500 transition-colors">
                  <Icon name="X" size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">No hay productos y servicios relacionados seleccionados</p>
        )}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-1">Productos y servicios complementarios</h4>
        <p className="text-xs text-muted-foreground mb-3">Se muestran en el carrito de compra ("Completa tu pedido con...")</p>
        <div className="relative mb-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={crossSellSearch}
                onChange={(e) => { setCrossSellSearch(e?.target?.value); searchProducts(e?.target?.value, 'crossSell'); }}
                placeholder="Buscar producto o servicio por nombre..."
                className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
              />
              {searchingCrossSell && <Icon name="Loader2" size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />}
            </div>
          </div>
          {crossSellResults?.length > 0 && (
            <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {crossSellResults?.map(product => (
                <button key={product?.id} type="button" onClick={() => addLinkedProduct(product, 'crossSell')} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted text-left transition-colors">
                  {product?.image_url ? (
                    <img src={product?.image_url} alt={product?.name} className="w-8 h-8 object-cover rounded" />
                  ) : (
                    <div className="w-8 h-8 bg-muted rounded flex items-center justify-center"><Icon name="Package" size={14} className="text-muted-foreground" /></div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{product?.name}</p>
                    {product?.sku && <p className="text-xs text-muted-foreground">SKU: {product?.sku}</p>}
                  </div>
                  <Icon name="Plus" size={14} className="ml-auto text-primary" />
                </button>
              ))}
            </div>
          )}
        </div>
        {formData?.crossSellProducts?.length > 0 ? (
          <div className="space-y-2">
            {formData?.crossSellProducts?.map(product => (
              <div key={product?.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg border border-border">
                {product?.image ? <img src={product?.image} alt={product?.name} className="w-8 h-8 object-cover rounded" /> : <div className="w-8 h-8 bg-muted rounded flex items-center justify-center"><Icon name="Package" size={14} className="text-muted-foreground" /></div>}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{product?.name}</p>
                  {product?.sku && <p className="text-xs text-muted-foreground">SKU: {product?.sku}</p>}
                </div>
                <button type="button" onClick={() => removeLinkedProduct(product?.id, 'crossSell')} className="p-1 text-muted-foreground hover:text-red-500 transition-colors">
                  <Icon name="X" size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">No hay productos y servicios complementarios seleccionados</p>
        )}
      </div>
    </div>
  );

  const addAttribute = () => {
    if (!newAttrKey?.trim() || !newAttrValue?.trim()) return;
    const current = formData?.customAttributes || [];
    onChange('customAttributes', [...current, { key: newAttrKey?.trim(), value: newAttrValue?.trim() }]);
    setNewAttrKey('');
    setNewAttrValue('');
  };

  const removeAttribute = (index) => {
    const updated = (formData?.customAttributes || [])?.filter((_, i) => i !== index);
    onChange('customAttributes', updated);
  };

  const startEditAttribute = (index) => {
    const attr = formData?.customAttributes?.[index];
    setEditingAttrIndex(index);
    setEditAttrKey(attr?.key || '');
    setEditAttrValue(attr?.value || '');
  };

  const saveEditAttribute = () => {
    if (!editAttrKey?.trim() || !editAttrValue?.trim()) return;
    const updated = (formData?.customAttributes || [])?.map((attr, i) =>
      i === editingAttrIndex ? { key: editAttrKey?.trim(), value: editAttrValue?.trim() } : attr
    );
    onChange('customAttributes', updated);
    setEditingAttrIndex(null);
    setEditAttrKey('');
    setEditAttrValue('');
  };

  const renderAtributosSubTab = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-1">Atributos personalizados del {itemLabel}</h4>
        <p className="text-xs text-muted-foreground mb-4">Información adicional visible al cliente (Calorías: 350 kcal, Origen: Sinaloa, Sin gluten: Sí, etc.)</p>

        <div className="bg-muted/30 border border-border rounded-xl p-4 mb-4">
          <p className="text-xs font-medium text-foreground mb-3">Agregar nuevo atributo al {itemLabel}</p>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-foreground mb-1">Nombre (clave)</label>
              <input type="text" value={newAttrKey} onChange={(e) => setNewAttrKey(e?.target?.value)} onKeyDown={(e) => { if (e?.key === 'Enter') { e?.preventDefault(); addAttribute(); } }} placeholder="Ej: Calorías" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-foreground mb-1">Valor</label>
              <input type="text" value={newAttrValue} onChange={(e) => setNewAttrValue(e?.target?.value)} onKeyDown={(e) => { if (e?.key === 'Enter') { e?.preventDefault(); addAttribute(); } }} placeholder="Ej: 350 kcal" className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm" />
            </div>
            <Button size="sm" variant="default" iconName="Plus" iconPosition="left" onClick={addAttribute} disabled={!newAttrKey?.trim() || !newAttrValue?.trim()}>Agregar</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Presiona Enter o el botón para agregar</p>
        </div>

        {formData?.customAttributes?.length > 0 ? (
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Nombre</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Valor</th>
                  <th className="px-4 py-2 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {formData?.customAttributes?.map((attr, index) => (
                  <tr key={index} className="hover:bg-muted/30 transition-colors">
                    {editingAttrIndex === index ? (
                      <>
                        <td className="px-4 py-2"><input type="text" value={editAttrKey} onChange={(e) => setEditAttrKey(e?.target?.value)} className="w-full px-2 py-1 border border-primary rounded bg-background text-foreground text-sm" autoFocus /></td>
                        <td className="px-4 py-2"><input type="text" value={editAttrValue} onChange={(e) => setEditAttrValue(e?.target?.value)} onKeyDown={(e) => { if (e?.key === 'Enter') saveEditAttribute(); if (e?.key === 'Escape') setEditingAttrIndex(null); }} className="w-full px-2 py-1 border border-primary rounded bg-background text-foreground text-sm" /></td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1 justify-end">
                            <button type="button" onClick={saveEditAttribute} className="p-1 text-green-600 hover:bg-green-50 rounded"><Icon name="Check" size={14} /></button>
                            <button type="button" onClick={() => setEditingAttrIndex(null)} className="p-1 text-muted-foreground hover:bg-muted rounded"><Icon name="X" size={14} /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2 font-medium text-foreground">{attr?.key}</td>
                        <td className="px-4 py-2 text-muted-foreground">{attr?.value}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1 justify-end">
                            <button type="button" onClick={() => startEditAttribute(index)} className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"><Icon name="Pencil" size={14} /></button>
                            <button type="button" onClick={() => removeAttribute(index)} className="p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Icon name="Trash2" size={14} /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-dashed border-border rounded-xl p-8 text-center">
            <Icon name="Tag" size={32} className="mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No hay atributos personalizados para este {itemLabel}</p>
            <p className="text-xs text-muted-foreground mt-1">Agrega información adicional como calorías, origen, alérgenos, etc.</p>
          </div>
        )}

        <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Icon name="Info" size={14} className="text-blue-600 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700">Los atributos se indexan para búsqueda y filtrado. Son visibles en la ficha pública del {itemLabel}.</p>
        </div>
      </div>
    </div>
  );

  const addTimeSlot = () => {
    if (!newTimeStart || !newTimeEnd) return;
    const current = formData?.availableTimeSlots || [];
    const dayLabel = newTimeDay === 'all' ? 'Todos los días' :
      ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']?.[parseInt(newTimeDay)];
    onChange('availableTimeSlots', [...current, { day: newTimeDay, dayLabel, start: newTimeStart, end: newTimeEnd }]);
  };

  const removeTimeSlot = (index) => {
    onChange('availableTimeSlots', (formData?.availableTimeSlots || [])?.filter((_, i) => i !== index));
  };

  const renderAvanzadoSubTab = () => {
    return (
      <div className="space-y-6">
        {/* Reviews Checkbox */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="reviewsEnabled"
              checked={formData?.reviewsEnabled !== false}
              onChange={(e) => onChange('reviewsEnabled', e?.target?.checked)}
              className="w-4 h-4 text-primary rounded cursor-pointer"
            />
            <div className="flex-1">
              <label htmlFor="reviewsEnabled" className="text-sm font-semibold text-foreground cursor-pointer">
                Habilitar reseñas del {itemLabel}
              </label>
              <p className="text-xs text-muted-foreground mt-0.5">Permite que los clientes dejen reseñas y calificaciones en este {itemLabel}</p>
            </div>
          </div>
          {formData?.reviewsEnabled !== false && (
            <div className="mt-3 flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
              <Icon name="Star" size={14} className="text-green-600" />
              <p className="text-xs text-green-700">Los clientes podrán calificar y comentar este {itemLabel} en la ficha pública</p>
            </div>
          )}
        </div>

        {/* Purchase Note */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Nota de compra del {itemLabel}</label>
          <p className="text-xs text-muted-foreground mb-2">Mensaje que se muestra al cliente tras canjear o comprar este {itemLabel}</p>
          <textarea
            value={formData?.purchaseNote || ''}
            onChange={(e) => onChange('purchaseNote', e?.target?.value)}
            placeholder={isService ? `Ej: Gracias por contratar nuestro ${itemLabel}. Nos pondremos en contacto contigo en breve.` : `Ej: Gracias por tu compra. Presenta este código en caja para canjear tu ${itemLabel}.`}
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground resize-none text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">{(formData?.purchaseNote?.length || 0)}/500 caracteres</p>
        </div>

        {/* Age Restriction Checkbox */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              id="ageRestriction"
              checked={formData?.ageRestriction || false}
              onChange={(e) => onChange('ageRestriction', e?.target?.checked)}
              className="w-4 h-4 text-primary rounded cursor-pointer"
            />
            <div className="flex-1">
              <label htmlFor="ageRestriction" className="text-sm font-semibold text-foreground cursor-pointer">
                Restricción de edad
              </label>
              <p className="text-xs text-muted-foreground mt-0.5">Requiere verificación de edad para adquirir este {itemLabel}</p>
            </div>
          </div>
          {formData?.ageRestriction && (
            <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-4">
              <div className="flex items-center gap-2">
                <Icon name="ShieldAlert" size={16} className="text-amber-600 shrink-0" />
                <p className="text-xs font-medium text-amber-800">Configuración de restricción de edad para este {itemLabel}</p>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Edad mínima requerida</label>
                  <div className="flex items-center gap-2">
                    <input type="number" value={formData?.minAge || 18} onChange={(e) => onChange('minAge', parseInt(e?.target?.value) || 18)} min="1" max="99" className="w-20 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm text-center font-semibold" />
                    <span className="text-sm text-muted-foreground">años</span>
                  </div>
                </div>
                <div className="flex-1 p-3 bg-white border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700">Se solicitará verificación de edad <strong>+{formData?.minAge || 18}</strong> al momento de la compra o canje de este {itemLabel}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[13, 16, 18, 21, 25]?.map(age => (
                  <button key={age} type="button" onClick={() => onChange('minAge', age)} className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors ${(formData?.minAge || 18) === age ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-50'}`}>
                    +{age} años
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Time Restriction Checkbox */}
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              id="timeRestriction"
              checked={formData?.timeRestriction || false}
              onChange={(e) => onChange('timeRestriction', e?.target?.checked)}
              className="w-4 h-4 text-primary rounded cursor-pointer"
            />
            <div className="flex-1">
              <label htmlFor="timeRestriction" className="text-sm font-semibold text-foreground cursor-pointer">
                Restricción horaria
              </label>
              <p className="text-xs text-muted-foreground mt-0.5">Este {itemLabel} solo estará disponible en los horarios configurados</p>
            </div>
          </div>

          {formData?.timeRestriction && (
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Icon name="Clock" size={14} className="text-blue-600 shrink-0" />
                <p className="text-xs text-blue-700">Activa los días y configura los rangos de hora en que este {itemLabel} estará disponible</p>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-[140px_1fr_auto] bg-muted/50 border-b border-border px-4 py-2">
                  <span className="text-xs font-semibold text-muted-foreground">Día</span>
                  <span className="text-xs font-semibold text-muted-foreground">Horarios disponibles</span>
                  <span className="text-xs font-semibold text-muted-foreground">Agregar</span>
                </div>
                {DAYS_OF_WEEK?.map((day, idx) => {
                  const daySlots = getScheduleForDay(day?.key);
                  const isEnabled = daySlots?.length > 0;
                  return (
                    <div key={day?.key} className={`grid grid-cols-[140px_1fr_auto] items-start px-4 py-3 gap-3 ${idx < DAYS_OF_WEEK?.length - 1 ? 'border-b border-border' : ''} ${isEnabled ? 'bg-background' : 'bg-muted/20'}`}>
                      <div className="flex items-center gap-2 pt-1">
                        <button type="button" onClick={() => toggleDayEnabled(day?.key)} className="flex items-center gap-2 cursor-pointer select-none">
                          <div className={`relative w-9 h-5 rounded-full transition-colors ${isEnabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                          </div>
                          <span className={`text-sm font-medium ${isEnabled ? 'text-foreground' : 'text-muted-foreground'}`}>{day?.label}</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {isEnabled ? (
                          daySlots?.length > 0 ? (
                            daySlots?.map(slot => (
                              <div key={slot?.id} className="flex items-center gap-2">
                                <input type="time" value={slot?.start} onChange={(e) => updateScheduleSlot(slot?.id, 'start', e?.target?.value)} className="px-2 py-1 border border-border rounded-lg bg-background text-foreground text-xs w-28" />
                                <span className="text-xs text-muted-foreground">–</span>
                                <input type="time" value={slot?.end} onChange={(e) => updateScheduleSlot(slot?.id, 'end', e?.target?.value)} className="px-2 py-1 border border-border rounded-lg bg-background text-foreground text-xs w-28" />
                                <button type="button" onClick={() => removeScheduleSlot(slot?.id)} className="p-1 text-muted-foreground hover:text-red-500 transition-colors">
                                  <Icon name="X" size={12} />
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground italic pt-1">Sin horarios — agrega uno</p>
                          )
                        ) : (
                          <p className="text-xs text-muted-foreground italic pt-1">No disponible</p>
                        )}
                      </div>

                      <div className="pt-0.5">
                        {isEnabled && (
                          <button type="button" onClick={() => addScheduleSlot(day?.key)} className="flex items-center gap-1 px-2 py-1 text-xs text-primary border border-primary/40 rounded-lg hover:bg-primary/5 transition-colors">
                            <Icon name="Plus" size={12} />
                            Agregar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {formData?.availableTimeSlots?.length > 0 ? (
                <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <Icon name="CheckCircle" size={14} className="text-green-600 shrink-0" />
                  <p className="text-xs text-green-700">
                    {formData?.availableTimeSlots?.length} franja{formData?.availableTimeSlots?.length !== 1 ? 's' : ''} horaria{formData?.availableTimeSlots?.length !== 1 ? 's' : ''} configurada{formData?.availableTimeSlots?.length !== 1 ? 's' : ''} en {[...new Set(formData?.availableTimeSlots?.map(s => s?.day))]?.length} día{[...new Set(formData?.availableTimeSlots?.map(s => s?.day))]?.length !== 1 ? 's' : ''}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <Icon name="AlertTriangle" size={14} className="text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700">Activa al menos un día y configura sus horarios para que el {itemLabel} esté disponible</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  switch (activeSubTab) {
    case 'precios':
      return renderPreciosSubTab();
    case 'inventario':
      return renderInventarioSubTab();
    case 'variantes':
      return renderVariantesSubTab();
    case 'servicio':
      return renderServicioSubTab();
    case 'vinculacion':
      return renderVinculacionSubTab();
    case 'atributos':
      return renderAtributosSubTab();
    case 'avanzado':
      return renderAvanzadoSubTab();
    default:
      return renderPreciosSubTab();
  }
};

export default TabDatosProducto;