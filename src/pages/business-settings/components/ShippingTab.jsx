import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

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
    freeShippingThreshold: 1000,
    taxOnShipping: true,
    enabled: true
  }
];

const ShippingTab = () => {
  const { user } = useAuth();
  const [zones, setZones] = useState(DEFAULT_ZONES);
  const [editingZone, setEditingZone] = useState(null);
  const [showAddZone, setShowAddZone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');
  const [globalConfig, setGlobalConfig] = useState({
    enableShipping: true,
    defaultZone: 'nacional',
    taxOnShipping: true,
    showShippingInCart: true,
    showShippingInInvoice: true,
    shippingLabel: 'Envío'
  });
  const [newZone, setNewZone] = useState({
    id: '', name: '', description: '', states: [], postalCodes: [],
    rateType: 'fixed', fixedRate: 0, weightRate: 0, freeShippingThreshold: 0,
    taxOnShipping: true, enabled: true
  });
  const [stateInput, setStateInput] = useState('');
  const [postalInput, setPostalInput] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return;
      try {
        const { data } = await supabase?.from('business_settings')?.select('shipping_zones, shipping_enabled, shipping_label, shipping_default_zone, shipping_tax_on_shipping, shipping_show_in_cart, shipping_show_in_invoice')?.eq('owner_id', user?.id)?.maybeSingle();
        if (data) {
          if (data?.shipping_zones?.length) setZones(data?.shipping_zones);
          setGlobalConfig({
            enableShipping: data?.shipping_enabled ?? true,
            defaultZone: data?.shipping_default_zone ?? 'nacional',
            taxOnShipping: data?.shipping_tax_on_shipping ?? true,
            showShippingInCart: data?.shipping_show_in_cart ?? true,
            showShippingInInvoice: data?.shipping_show_in_invoice ?? true,
            shippingLabel: data?.shipping_label ?? 'Envío'
          });
        }
      } catch (err) {
        console.error('Error loading shipping settings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [user?.id]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      const { error } = await supabase?.from('business_settings')?.update({
          shipping_zones: zones,
          shipping_enabled: globalConfig?.enableShipping,
          shipping_label: globalConfig?.shippingLabel,
          shipping_default_zone: globalConfig?.defaultZone,
          shipping_tax_on_shipping: globalConfig?.taxOnShipping,
          shipping_show_in_cart: globalConfig?.showShippingInCart,
          shipping_show_in_invoice: globalConfig?.showShippingInInvoice,
          updated_at: new Date()?.toISOString()
        })?.eq('owner_id', user?.id);
      if (error) throw error;
      setSaveMessage('Configuración de envío guardada correctamente.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessage('Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleZone = (zoneId) => {
    setZones(prev => prev?.map(z => z?.id === zoneId ? { ...z, enabled: !z?.enabled } : z));
  };

  const handleAddZone = () => {
    if (!newZone?.name?.trim()) return;
    const id = newZone?.name?.toLowerCase()?.replace(/\s+/g, '_') + '_' + Date.now();
    setZones(prev => [...prev, { ...newZone, id }]);
    setNewZone({ id: '', name: '', description: '', states: [], postalCodes: [], rateType: 'fixed', fixedRate: 0, weightRate: 0, freeShippingThreshold: 0, taxOnShipping: true, enabled: true });
    setShowAddZone(false);
  };

  const addStateToZone = (setter) => {
    if (!stateInput?.trim()) return;
    setter(prev => ({ ...prev, states: [...(prev?.states || []), stateInput?.trim()] }));
    setStateInput('');
  };

  const removeStateFromZone = (state, setter) => {
    setter(prev => ({ ...prev, states: prev?.states?.filter(s => s !== state) }));
  };

  const addPostalToZone = (setter) => {
    if (!postalInput?.trim()) return;
    setter(prev => ({ ...prev, postalCodes: [...(prev?.postalCodes || []), postalInput?.trim()] }));
    setPostalInput('');
  };

  const removePostalFromZone = (code, setter) => {
    setter(prev => ({ ...prev, postalCodes: prev?.postalCodes?.filter(c => c !== code) }));
  };

  const ZoneForm = ({ zone, setZone, onSave, onCancel, title }) => (
    <div className="bg-muted/30 border border-border rounded-lg p-5 space-y-4">
      <h4 className="font-semibold text-foreground">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Nombre de Zona *</label>
          <Input value={zone?.name} onChange={e => setZone(prev => ({ ...prev, name: e?.target?.value }))} placeholder="Ej: Zona Norte" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Descripción</label>
          <Input value={zone?.description} onChange={e => setZone(prev => ({ ...prev, description: e?.target?.value }))} placeholder="Descripción de la zona" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Tipo de Tarifa</label>
        <div className="flex gap-3">
          {[{ id: 'fixed', label: 'Tarifa Fija' }, { id: 'weight', label: 'Por Peso' }]?.map(rt => (
            <button key={rt?.id} onClick={() => setZone(prev => ({ ...prev, rateType: rt?.id }))}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${zone?.rateType === rt?.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary'}`}>
              {rt?.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zone?.rateType === 'fixed' ? (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Tarifa Fija ($)</label>
            <Input type="number" min="0" step="0.01" value={zone?.fixedRate} onChange={e => setZone(prev => ({ ...prev, fixedRate: parseFloat(e?.target?.value) || 0 }))} placeholder="0.00" />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Tarifa por Kg ($/kg)</label>
            <Input type="number" min="0" step="0.01" value={zone?.weightRate} onChange={e => setZone(prev => ({ ...prev, weightRate: parseFloat(e?.target?.value) || 0 }))} placeholder="0.00" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Envío Gratis desde ($)</label>
          <Input type="number" min="0" step="0.01" value={zone?.freeShippingThreshold} onChange={e => setZone(prev => ({ ...prev, freeShippingThreshold: parseFloat(e?.target?.value) || 0 }))} placeholder="0 = desactivado" />
          <p className="text-xs text-muted-foreground mt-1">0 = sin envío gratis</p>
        </div>
      </div>
      <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
        <div>
          <p className="text-sm font-medium text-foreground">Aplicar IVA al envío</p>
          <p className="text-xs text-muted-foreground">Calcular impuesto sobre el costo de envío</p>
        </div>
        <button onClick={() => setZone(prev => ({ ...prev, taxOnShipping: !prev?.taxOnShipping }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${zone?.taxOnShipping ? 'bg-primary' : 'bg-muted'}`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${zone?.taxOnShipping ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Estados/Regiones</label>
        <div className="flex gap-2 mb-2">
          <Input value={stateInput} onChange={e => setStateInput(e?.target?.value)} placeholder="Ej: Jalisco" onKeyDown={e => e?.key === 'Enter' && addStateToZone(setZone)} />
          <Button variant="outline" size="sm" onClick={() => addStateToZone(setZone)}>Agregar</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {zone?.states?.map(state => (
            <span key={state} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
              {state}
              <button onClick={() => removeStateFromZone(state, setZone)} className="hover:text-destructive"><Icon name="X" size={10} /></button>
            </span>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Códigos Postales</label>
        <div className="flex gap-2 mb-2">
          <Input value={postalInput} onChange={e => setPostalInput(e?.target?.value)} placeholder="Ej: 06600" onKeyDown={e => e?.key === 'Enter' && addPostalToZone(setZone)} />
          <Button variant="outline" size="sm" onClick={() => addPostalToZone(setZone)}>Agregar</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {zone?.postalCodes?.map(code => (
            <span key={code} className="flex items-center gap-1 bg-muted text-foreground text-xs px-2 py-1 rounded-full">
              {code}
              <button onClick={() => removePostalFromZone(code, setZone)} className="hover:text-destructive"><Icon name="X" size={10} /></button>
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

  if (loading) return <div className="flex items-center justify-center py-12"><Icon name="Loader" size={24} className="animate-spin text-primary" /></div>;

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
              <button onClick={() => setGlobalConfig(prev => ({ ...prev, [item?.field]: !prev?.[item?.field] }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${globalConfig?.[item?.field] ? 'bg-primary' : 'bg-muted'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${globalConfig?.[item?.field] ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Etiqueta de Envío</label>
            <Input value={globalConfig?.shippingLabel} onChange={e => setGlobalConfig(prev => ({ ...prev, shippingLabel: e?.target?.value }))} placeholder="Envío" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Zona por Defecto</label>
            <select value={globalConfig?.defaultZone} onChange={e => setGlobalConfig(prev => ({ ...prev, defaultZone: e?.target?.value }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
              {zones?.filter(z => z?.enabled)?.map(z => <option key={z?.id} value={z?.id}>{z?.name}</option>)}
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
          <Button variant="outline" size="sm" iconName="Plus" onClick={() => setShowAddZone(true)}>Nueva Zona</Button>
        </div>
        {showAddZone && <ZoneForm zone={newZone} setZone={setNewZone} onSave={handleAddZone} onCancel={() => setShowAddZone(false)} title="Nueva Zona de Envío" />}
        <div className="space-y-3">
          {zones?.map(zone => (
            <div key={zone?.id}>
              {editingZone?.id === zone?.id ? (
                <ZoneForm zone={editingZone} setZone={setEditingZone}
                  onSave={() => { setZones(prev => prev?.map(z => z?.id === editingZone?.id ? editingZone : z)); setEditingZone(null); }}
                  onCancel={() => setEditingZone(null)} title={`Editar: ${zone?.name}`} />
              ) : (
                <div className={`border rounded-lg p-4 transition-colors ${zone?.enabled ? 'border-border bg-card' : 'border-border/50 bg-muted/20'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`w-2 h-2 rounded-full ${zone?.enabled ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                        <h4 className="font-medium text-foreground">{zone?.name}</h4>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{zone?.rateType === 'fixed' ? 'Tarifa Fija' : 'Por Peso'}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{zone?.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-foreground">
                          <span className="text-muted-foreground">Tarifa: </span>
                          <strong>${zone?.rateType === 'fixed' ? zone?.fixedRate : `${zone?.weightRate}/kg`}</strong>
                        </span>
                        {zone?.freeShippingThreshold > 0 && (
                          <span className="text-green-600"><Icon name="Truck" size={12} className="inline mr-1" />Gratis desde ${zone?.freeShippingThreshold}</span>
                        )}
                      </div>
                      {zone?.states?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {zone?.states?.map(s => <span key={s} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{s}</span>)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button onClick={() => handleToggleZone(zone?.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${zone?.enabled ? 'bg-primary' : 'bg-muted'}`}>
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${zone?.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                      <Button variant="ghost" size="sm" iconName="Edit" onClick={() => setEditingZone({ ...zone })} />
                      <Button variant="ghost" size="sm" iconName="Trash2" onClick={() => setZones(prev => prev?.filter(z => z?.id !== zone?.id))} className="text-destructive hover:text-destructive" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Save */}
      <div className="flex items-center justify-between pt-2">
        {saveMessage && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${saveMessage?.includes('Error') ? 'bg-destructive/10 border border-destructive text-destructive' : 'bg-green-50 border border-green-200 text-green-800'}`}>
            <Icon name={saveMessage?.includes('Error') ? 'AlertCircle' : 'CheckCircle'} size={16} />
            {saveMessage}
          </div>
        )}
        <div className="ml-auto flex gap-3">
          <Button variant="outline" onClick={() => { setZones(DEFAULT_ZONES); }}>Cancelar</Button>
          <Button onClick={handleSave} loading={saving} iconName="Save" iconPosition="left">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShippingTab;
