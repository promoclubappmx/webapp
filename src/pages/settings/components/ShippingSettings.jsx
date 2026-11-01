import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useCurrency } from '../../../contexts/CurrencyContext';

const DEFAULT_ZONES = [
  {
    id: 'local',
    name: 'Local',
    description: 'Entrega en la misma ciudad',
    states: ['Ciudad de México', 'CDMX'],
    postalCodes: [],
    rateType: 'fixed',
    fixedRate: 50,
    weightRate: 0,
    minWeight: 0,
    maxWeight: 0,
    freeShippingThreshold: 500,
    taxOnShipping: true,
    enabled: true
  },
  {
    id: 'nacional',
    name: 'Nacional',
    description: 'Envío a todo el territorio nacional',
    states: [],
    postalCodes: [],
    rateType: 'fixed',
    fixedRate: 120,
    weightRate: 15,
    minWeight: 0,
    maxWeight: 0,
    freeShippingThreshold: 1000,
    taxOnShipping: true,
    enabled: true
  },
  {
    id: 'frontera',
    name: 'Zona Fronteriza',
    description: 'Baja California, Sonora frontera, Chihuahua frontera',
    states: ['Baja California', 'Sonora', 'Chihuahua', 'Tamaulipas'],
    postalCodes: [],
    rateType: 'fixed',
    fixedRate: 150,
    weightRate: 20,
    minWeight: 0,
    maxWeight: 0,
    freeShippingThreshold: 1200,
    taxOnShipping: true,
    enabled: false
  }
];

const ShippingSettings = () => {
  const { formatPrice, currencySettings, updateCurrencySettings } = useCurrency();
  const [zones, setZones] = useState(DEFAULT_ZONES);
  const [editingZone, setEditingZone] = useState(null);
  const [showAddZone, setShowAddZone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [globalConfig, setGlobalConfig] = useState({
    enableShipping: true,
    defaultZone: 'nacional',
    taxOnShipping: true,
    shippingTaxRate: 16,
    showShippingInCart: true,
    showShippingInInvoice: true,
    shippingLabel: 'Envío'
  });

  const [newZone, setNewZone] = useState({
    id: '',
    name: '',
    description: '',
    states: [],
    postalCodes: [],
    rateType: 'fixed',
    fixedRate: 0,
    weightRate: 0,
    freeShippingThreshold: 0,
    taxOnShipping: true,
    enabled: true
  });

  const [stateInput, setStateInput] = useState('');
  const [postalInput, setPostalInput] = useState('');

  useEffect(() => {
    if (currencySettings?.shippingSettings) {
      const s = currencySettings?.shippingSettings;
      if (s?.zones) setZones(s?.zones);
      if (s?.globalConfig) setGlobalConfig(prev => ({ ...prev, ...s?.globalConfig }));
    }
  }, [currencySettings]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      await updateCurrencySettings({
        shippingSettings: { zones, globalConfig }
      });
      setSaveMessage('Configuración de envío guardada correctamente.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('Error saving shipping settings:', err);
      setSaveMessage('Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleZone = (zoneId) => {
    setZones(prev => prev?.map(z => z?.id === zoneId ? { ...z, enabled: !z?.enabled } : z));
  };

  const handleEditZone = (zone) => {
    setEditingZone({ ...zone });
  };

  const handleSaveZoneEdit = () => {
    setZones(prev => prev?.map(z => z?.id === editingZone?.id ? editingZone : z));
    setEditingZone(null);
  };

  const handleDeleteZone = (zoneId) => {
    setZones(prev => prev?.filter(z => z?.id !== zoneId));
  };

  const handleAddZone = () => {
    if (!newZone?.name?.trim()) return;
    const id = newZone?.name?.toLowerCase()?.replace(/\s+/g, '_') + '_' + Date.now();
    setZones(prev => [...prev, { ...newZone, id }]);
    setNewZone({ id: '', name: '', description: '', states: [], postalCodes: [], rateType: 'fixed', fixedRate: 0, weightRate: 0, freeShippingThreshold: 0, taxOnShipping: true, enabled: true });
    setShowAddZone(false);
  };

  const addStateToZone = (zone, setter) => {
    if (!stateInput?.trim()) return;
    setter(prev => ({ ...prev, states: [...(prev?.states || []), stateInput?.trim()] }));
    setStateInput('');
  };

  const removeStateFromZone = (state, zone, setter) => {
    setter(prev => ({ ...prev, states: prev?.states?.filter(s => s !== state) }));
  };

  const addPostalToZone = (zone, setter) => {
    if (!postalInput?.trim()) return;
    setter(prev => ({ ...prev, postalCodes: [...(prev?.postalCodes || []), postalInput?.trim()] }));
    setPostalInput('');
  };

  const removePostalFromZone = (code, zone, setter) => {
    setter(prev => ({ ...prev, postalCodes: prev?.postalCodes?.filter(c => c !== code) }));
  };

  const calculateShipping = (zone, orderTotal, weight = 0) => {
    if (!zone?.enabled) return null;
    if (zone?.freeShippingThreshold > 0 && orderTotal >= zone?.freeShippingThreshold) return 0;
    if (zone?.rateType === 'fixed') return zone?.fixedRate;
    if (zone?.rateType === 'weight') return zone?.weightRate * weight;
    return zone?.fixedRate;
  };

  const ZoneForm = ({ zone, setZone, onSave, onCancel, title }) => (
    <div className="bg-muted/30 border border-border rounded-lg p-5 space-y-4">
      <h4 className="font-semibold text-foreground">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Nombre de Zona *</label>
          <Input
            value={zone?.name}
            onChange={e => setZone(prev => ({ ...prev, name: e?.target?.value }))}
            placeholder="Ej: Zona Norte"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Descripción</label>
          <Input
            value={zone?.description}
            onChange={e => setZone(prev => ({ ...prev, description: e?.target?.value }))}
            placeholder="Descripción de la zona"
          />
        </div>
      </div>

      {/* Rate Type */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Tipo de Tarifa</label>
        <div className="flex gap-3">
          {[{ id: 'fixed', label: 'Tarifa Fija' }, { id: 'weight', label: 'Por Peso' }]?.map(rt => (
            <button
              key={rt?.id}
              onClick={() => setZone(prev => ({ ...prev, rateType: rt?.id }))}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                zone?.rateType === rt?.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary'
              }`}
            >
              {rt?.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zone?.rateType === 'fixed' ? (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Tarifa Fija ({currencySettings?.currencySymbol || '$'})</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={zone?.fixedRate}
              onChange={e => setZone(prev => ({ ...prev, fixedRate: parseFloat(e?.target?.value) || 0 }))}
              placeholder="0.00"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Tarifa por Kg ({currencySettings?.currencySymbol || '$'}/kg)</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={zone?.weightRate}
              onChange={e => setZone(prev => ({ ...prev, weightRate: parseFloat(e?.target?.value) || 0 }))}
              placeholder="0.00"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Envío Gratis desde ({currencySettings?.currencySymbol || '$'})</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={zone?.freeShippingThreshold}
            onChange={e => setZone(prev => ({ ...prev, freeShippingThreshold: parseFloat(e?.target?.value) || 0 }))}
            placeholder="0 = desactivado"
          />
          <p className="text-xs text-muted-foreground mt-1">0 = sin envío gratis</p>
        </div>
      </div>

      {/* Tax on Shipping */}
      <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
        <div>
          <p className="text-sm font-medium text-foreground">Aplicar IVA al envío</p>
          <p className="text-xs text-muted-foreground">Calcular impuesto sobre el costo de envío</p>
        </div>
        <button
          onClick={() => setZone(prev => ({ ...prev, taxOnShipping: !prev?.taxOnShipping }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            zone?.taxOnShipping ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            zone?.taxOnShipping ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {/* States */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Estados/Regiones</label>
        <div className="flex gap-2 mb-2">
          <Input
            value={stateInput}
            onChange={e => setStateInput(e?.target?.value)}
            placeholder="Ej: Jalisco"
            onKeyDown={e => e?.key === 'Enter' && addStateToZone(zone, setZone)}
          />
          <Button variant="outline" size="sm" onClick={() => addStateToZone(zone, setZone)}>Agregar</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {zone?.states?.map(state => (
            <span key={state} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
              {state}
              <button onClick={() => removeStateFromZone(state, zone, setZone)} className="hover:text-destructive"><Icon name="X" size={10} /></button>
            </span>
          ))}
        </div>
      </div>

      {/* Postal Codes */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Códigos Postales</label>
        <div className="flex gap-2 mb-2">
          <Input
            value={postalInput}
            onChange={e => setPostalInput(e?.target?.value)}
            placeholder="Ej: 06600"
            onKeyDown={e => e?.key === 'Enter' && addPostalToZone(zone, setZone)}
          />
          <Button variant="outline" size="sm" onClick={() => addPostalToZone(zone, setZone)}>Agregar</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {zone?.postalCodes?.map(code => (
            <span key={code} className="flex items-center gap-1 bg-muted text-foreground text-xs px-2 py-1 rounded-full">
              {code}
              <button onClick={() => removePostalFromZone(code, zone, setZone)} className="hover:text-destructive"><Icon name="X" size={10} /></button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button onClick={onSave} iconName="Save">Guardar Zona</Button>
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Global Config */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Icon name="Settings" size={18} className="text-primary" />
          Configuración General
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { field: 'enableShipping', label: 'Habilitar envío', desc: 'Mostrar opciones de envío en carrito y factura' },
            { field: 'taxOnShipping', label: 'IVA sobre envío', desc: 'Aplicar impuesto al costo de envío por defecto' },
            { field: 'showShippingInCart', label: 'Mostrar en carrito', desc: 'Mostrar costo de envío en el carrito POS' },
            { field: 'showShippingInInvoice', label: 'Mostrar en factura', desc: 'Incluir desglose de envío en facturas' }
          ]?.map(item => (
            <div key={item?.field} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">{item?.label}</p>
                <p className="text-xs text-muted-foreground">{item?.desc}</p>
              </div>
              <button
                onClick={() => setGlobalConfig(prev => ({ ...prev, [item?.field]: !prev?.[item?.field] }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  globalConfig?.[item?.field] ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  globalConfig?.[item?.field] ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Etiqueta de Envío</label>
            <Input
              value={globalConfig?.shippingLabel}
              onChange={e => setGlobalConfig(prev => ({ ...prev, shippingLabel: e?.target?.value }))}
              placeholder="Envío"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Zona por Defecto</label>
            <select
              value={globalConfig?.defaultZone}
              onChange={e => setGlobalConfig(prev => ({ ...prev, defaultZone: e?.target?.value }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {zones?.filter(z => z?.enabled)?.map(z => (
                <option key={z?.id} value={z?.id}>{z?.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* Shipping Zones */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Icon name="MapPin" size={18} className="text-primary" />
            Zonas de Envío
          </h3>
          <Button variant="outline" size="sm" iconName="Plus" onClick={() => setShowAddZone(true)}>
            Nueva Zona
          </Button>
        </div>

        {showAddZone && (
          <ZoneForm
            zone={newZone}
            setZone={setNewZone}
            onSave={handleAddZone}
            onCancel={() => setShowAddZone(false)}
            title="Nueva Zona de Envío"
          />
        )}

        <div className="space-y-3">
          {zones?.map(zone => (
            <div key={zone?.id}>
              {editingZone?.id === zone?.id ? (
                <ZoneForm
                  zone={editingZone}
                  setZone={setEditingZone}
                  onSave={handleSaveZoneEdit}
                  onCancel={() => setEditingZone(null)}
                  title={`Editar: ${zone?.name}`}
                />
              ) : (
                <div className={`border rounded-lg p-4 transition-colors ${
                  zone?.enabled ? 'border-border bg-card' : 'border-border/50 bg-muted/20'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`w-2 h-2 rounded-full ${
                          zone?.enabled ? 'bg-success' : 'bg-muted-foreground'
                        }`} />
                        <h4 className="font-medium text-foreground">{zone?.name}</h4>
                        {zone?.rateType === 'fixed' ? (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Tarifa Fija</span>
                        ) : (
                          <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full">Por Peso</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{zone?.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-foreground">
                          <span className="text-muted-foreground">Tarifa: </span>
                          <strong>{zone?.rateType === 'fixed' ? formatPrice(zone?.fixedRate) : `${formatPrice(zone?.weightRate)}/kg`}</strong>
                        </span>
                        {zone?.freeShippingThreshold > 0 && (
                          <span className="text-success">
                            <Icon name="Truck" size={12} className="inline mr-1" />
                            Gratis desde {formatPrice(zone?.freeShippingThreshold)}
                          </span>
                        )}
                        {zone?.taxOnShipping && (
                          <span className="text-muted-foreground">
                            <Icon name="Receipt" size={12} className="inline mr-1" />
                            IVA incluido
                          </span>
                        )}
                      </div>
                      {zone?.states?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {zone?.states?.map(s => (
                            <span key={s} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleToggleZone(zone?.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          zone?.enabled ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          zone?.enabled ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                      </button>
                      <Button variant="ghost" size="sm" iconName="Edit" onClick={() => handleEditZone(zone)} />
                      <Button variant="ghost" size="sm" iconName="Trash2" onClick={() => handleDeleteZone(zone?.id)} className="text-destructive hover:text-destructive" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Preview */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
          <Icon name="Eye" size={18} className="text-primary" />
          Vista Previa de Cálculo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {zones?.filter(z => z?.enabled)?.map(zone => {
            const exampleOrder = 800;
            const shipping = calculateShipping(zone, exampleOrder);
            const taxRate = (currencySettings?.taxSettings?.useCustomRate
              ? parseFloat(currencySettings?.taxSettings?.customRate) || 16
              : currencySettings?.taxSettings?.activeRegion === 'frontera' ? 8
              : currencySettings?.taxSettings?.activeRegion === 'exento' ? 0
              : 16) / 100;
            const shippingTax = zone?.taxOnShipping && shipping > 0 ? shipping * taxRate : 0;
            return (
              <div key={zone?.id} className="bg-muted/30 rounded-lg p-4">
                <p className="font-medium text-foreground mb-3">{zone?.name}</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pedido ejemplo:</span>
                    <span>{formatPrice(exampleOrder)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{globalConfig?.shippingLabel}:</span>
                    <span className={shipping === 0 ? 'text-success font-medium' : ''}>
                      {shipping === 0 ? 'GRATIS' : formatPrice(shipping)}
                    </span>
                  </div>
                  {shippingTax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IVA envío:</span>
                      <span>{formatPrice(shippingTax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold border-t border-border pt-1 mt-1">
                    <span>Total envío:</span>
                    <span className="text-primary">{shipping === 0 ? 'GRATIS' : formatPrice(shipping + shippingTax)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save / Cancel */}
      <div className="flex items-center justify-between pt-2">
        {saveMessage && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
            saveMessage?.includes('Error')
              ? 'bg-destructive/10 border border-destructive text-destructive' :'bg-green-50 border border-green-200 text-green-800'
          }`}>
            <Icon name={saveMessage?.includes('Error') ? 'AlertCircle' : 'CheckCircle'} size={16} />
            {saveMessage}
          </div>
        )}
        <div className="ml-auto flex gap-3">
          <Button variant="outline" onClick={() => setZones(DEFAULT_ZONES)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
            iconName="Save"
            iconPosition="left"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShippingSettings;
