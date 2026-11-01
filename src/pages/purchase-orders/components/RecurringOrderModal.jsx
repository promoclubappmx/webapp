import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { supabase } from '../../../lib/supabase';

const FREQUENCIES = [
  { value: 'daily', label: 'Diario', icon: 'Sun', description: 'Cada día' },
  { value: 'weekly', label: 'Semanal', icon: 'Calendar', description: 'Cada semana' },
  { value: 'biweekly', label: 'Quincenal', icon: 'Calendar', description: 'Cada 15 días' },
  { value: 'monthly', label: 'Mensual', icon: 'CalendarDays', description: 'Cada mes' },
  { value: 'quarterly', label: 'Trimestral', icon: 'CalendarRange', description: 'Cada 3 meses' }
];

const FREQ_LABELS = {
  daily: 'Diario', weekly: 'Semanal', biweekly: 'Quincenal',
  monthly: 'Mensual', quarterly: 'Trimestral'
};

const RecurringOrderModal = ({ isEnabled, userId, establishments = [], onSave, onClose }) => {
  const [activeTab, setActiveTab] = useState('config');
  const [frequency, setFrequency] = useState('weekly');
  const [scope, setScope] = useState('all'); // 'all' | 'establishment'
  const [selectedEstablishment, setSelectedEstablishment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [supplierCount, setSupplierCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [savedConfigs, setSavedConfigs] = useState([]);
  const [loadingConfigs, setLoadingConfigs] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'configs') fetchSavedConfigs();
  }, [activeTab]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const { data } = await supabase?.rpc('get_low_stock_items_by_supplier', { p_user_id: userId });
      const items = data || [];
      const uniqueSuppliers = new Set(items?.map(i => i?.supplier_id));
      setLowStockCount(items?.length);
      setSupplierCount(uniqueSuppliers?.size);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchSavedConfigs = async () => {
    setLoadingConfigs(true);
    try {
      const { data, error } = await supabase
        ?.from('recurring_order_configs')
        ?.select('*, business_locations(branch_name, location_name)')
        ?.eq('user_id', userId)
        ?.order('created_at', { ascending: false });
      if (!error) setSavedConfigs(data || []);
    } catch (err) {
      // Table may not exist yet — show empty state gracefully
      setSavedConfigs([]);
    } finally {
      setLoadingConfigs(false);
    }
  };

  const handleActivate = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 300));
    const locationId = scope === 'establishment' ? selectedEstablishment || null : null;
    onSave({ is_enabled: true, frequency, scope, location_id: locationId });
    // Optimistically add to saved configs list
    const estName = scope === 'all' ?'Todos los establecimientos'
      : establishments?.find(e => e?.id === selectedEstablishment)?.branch_name
        || establishments?.find(e => e?.id === selectedEstablishment)?.location_name
        || 'Establecimiento';
    setSavedConfigs(prev => [
      {
        id: Date.now(),
        frequency,
        scope,
        location_id: locationId,
        is_enabled: true,
        establishment_name: estName,
        created_at: new Date()?.toISOString()
      },
      ...prev
    ]);
    setIsSaving(false);
  };

  const handleDeactivate = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 300));
    onSave({ is_enabled: false, frequency });
    setIsSaving(false);
  };

  const handleDeleteConfig = async (configId) => {
    setDeletingId(configId);
    try {
      await supabase?.from('recurring_order_configs')?.delete()?.eq('id', configId);
      setSavedConfigs(prev => prev?.filter(c => c?.id !== configId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleConfig = async (config) => {
    try {
      await supabase?.from('recurring_order_configs')
        ?.update({ is_enabled: !config?.is_enabled })
        ?.eq('id', config?.id);
      setSavedConfigs(prev => prev?.map(c => c?.id === config?.id ? { ...c, is_enabled: !c?.is_enabled } : c));
    } catch (err) {
      setSavedConfigs(prev => prev?.map(c => c?.id === config?.id ? { ...c, is_enabled: !c?.is_enabled } : c));
    }
  };

  const selected = FREQUENCIES?.find(f => f?.value === frequency);
  const canActivate = scope === 'all' || (scope === 'establishment' && selectedEstablishment);

  return (
    <div className="bg-card rounded-xl shadow-xl w-full max-w-lg my-4 flex flex-col max-h-[90vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEnabled ? 'bg-purple-100' : 'bg-primary/10'}`}>
            <Icon name="RefreshCw" size={20} className={isEnabled ? 'text-purple-600' : 'text-primary'} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Pedidos Recurrentes</h2>
            <p className="text-sm text-muted-foreground">Automatización de órdenes de compra</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><Icon name="X" size={20} /></button>
      </div>
      {/* Tabs */}
      <div className="flex border-b border-border flex-shrink-0">
        <button
          onClick={() => setActiveTab('config')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === 'config' ?'text-primary border-b-2 border-primary bg-primary/5' :'text-muted-foreground hover:text-foreground hover:bg-muted/30'
          }`}
        >
          <Icon name="Settings" size={15} />
          Configuración
        </button>
        <button
          onClick={() => setActiveTab('configs')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === 'configs' ?'text-primary border-b-2 border-primary bg-primary/5' :'text-muted-foreground hover:text-foreground hover:bg-muted/30'
          }`}
        >
          <Icon name="List" size={15} />
          Configuraciones Guardadas
          {savedConfigs?.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
              {savedConfigs?.length}
            </span>
          )}
        </button>
      </div>
      {/* Tab Content */}
      <div className="overflow-y-auto flex-1">
        {activeTab === 'config' ? (
          <div className="p-6 space-y-5">
            {/* Status Banner */}
            {isEnabled ? (
              <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <Icon name="CheckCircle" size={18} className="text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-purple-800 mb-1">Pedidos recurrentes automáticos ACTIVOS</p>
                  <p className="text-sm text-purple-700 leading-relaxed">
                    El sistema está generando pedidos automáticamente para los proveedores con productos en stock bajo o cero.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <Icon name="Zap" size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-800 mb-1">Generación automática de pedidos recurrentes</p>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    Al activar, el sistema generará pedidos automáticamente para los proveedores que tengan productos con stock 0 o por debajo del límite mínimo.
                  </p>
                </div>
              </div>
            )}

            {/* Stats */}
            {!loadingStats && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/30 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">{supplierCount}</div>
                  <div className="text-xs text-muted-foreground mt-1">Proveedores con stock bajo</div>
                </div>
                <div className="bg-muted/30 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
                  <div className="text-xs text-muted-foreground mt-1">Productos a reponer</div>
                </div>
              </div>
            )}

            {/* Scope Selector */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">Aplicar configuración</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setScope('all')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    scope === 'all' ?'border-primary bg-primary/5 shadow-sm' :'border-border hover:border-primary/40 hover:bg-muted/30'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${scope === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <Icon name="Globe" size={18} />
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-semibold ${scope === 'all' ? 'text-primary' : 'text-foreground'}`}>Todos los establecimientos</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Aplica a toda la red</p>
                  </div>
                  {scope === 'all' && <Icon name="CheckCircle" size={16} className="text-primary" />}
                </button>

                <button
                  type="button"
                  onClick={() => setScope('establishment')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    scope === 'establishment' ?'border-primary bg-primary/5 shadow-sm' :'border-border hover:border-primary/40 hover:bg-muted/30'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${scope === 'establishment' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <Icon name="Store" size={18} />
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-semibold ${scope === 'establishment' ? 'text-primary' : 'text-foreground'}`}>Por establecimiento</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Configuración específica</p>
                  </div>
                  {scope === 'establishment' && <Icon name="CheckCircle" size={16} className="text-primary" />}
                </button>
              </div>

              {/* Establishment selector */}
              {scope === 'establishment' && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Seleccionar establecimiento</label>
                  {establishments?.length === 0 ? (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                      <Icon name="AlertTriangle" size={14} />
                      No hay establecimientos disponibles.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {establishments?.map(est => {
                        const name = est?.branch_name || est?.location_name || 'Establecimiento';
                        const isSelected = selectedEstablishment === est?.id;
                        return (
                          <button
                            key={est?.id}
                            type="button"
                            onClick={() => setSelectedEstablishment(est?.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                              isSelected
                                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/30 hover:bg-muted/20'
                            }`}
                          >
                            <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                              <Icon name="Store" size={14} />
                            </div>
                            <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>{name}</span>
                            {isSelected && <Icon name="Check" size={15} className="text-primary ml-auto" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Frequency Selector */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">Frecuencia de revisión y generación</label>
              <div className="grid grid-cols-1 gap-2">
                {FREQUENCIES?.map(f => (
                  <button
                    key={f?.value}
                    type="button"
                    onClick={() => setFrequency(f?.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      frequency === f?.value
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/40 hover:bg-muted/30'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      frequency === f?.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon name={f?.icon} size={16} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${frequency === f?.value ? 'text-primary' : 'text-foreground'}`}>{f?.label}</p>
                      <p className="text-xs text-muted-foreground">{f?.description}</p>
                    </div>
                    {frequency === f?.value && (
                      <Icon name="CheckCircle" size={18} className="text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {selected && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" size={16} className="text-primary" />
                  <p className="text-sm font-medium text-foreground">
                    Frecuencia: <span className="text-primary font-bold">{selected?.label}</span>
                    {scope === 'establishment' && selectedEstablishment && (
                      <span className="text-muted-foreground font-normal ml-2">
                        — {establishments?.find(e => e?.id === selectedEstablishment)?.branch_name
                          || establishments?.find(e => e?.id === selectedEstablishment)?.location_name}
                      </span>
                    )}
                    {scope === 'all' && (
                      <span className="text-muted-foreground font-normal ml-2">— Todos los establecimientos</span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Saved Configurations Tab */
          (<div className="p-6">
            {loadingConfigs ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="Loader2" size={24} className="animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Cargando configuraciones...</span>
              </div>
            ) : savedConfigs?.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="ClipboardList" size={24} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">Sin configuraciones guardadas</p>
                <p className="text-xs text-muted-foreground">Las configuraciones que actives aparecerán aquí.</p>
                <button
                  onClick={() => setActiveTab('config')}
                  className="mt-4 text-xs text-primary hover:underline font-medium"
                >
                  Ir a Configuración →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground mb-4">
                  {savedConfigs?.length} configuración(es) guardada(s)
                </p>
                {savedConfigs?.map(config => {
                  const estName = config?.scope === 'all' || !config?.location_id ?'Todos los establecimientos'
                    : config?.business_locations?.branch_name
                      || config?.business_locations?.location_name
                      || config?.establishment_name
                      || 'Establecimiento';
                  const freqLabel = FREQ_LABELS?.[config?.frequency] || config?.frequency;
                  const createdAt = config?.created_at
                    ? new Date(config?.created_at)?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '';

                  return (
                    <div
                      key={config?.id}
                      className={`border rounded-xl p-4 transition-all ${config?.is_enabled ? 'border-purple-200 bg-purple-50/40' : 'border-border bg-muted/20'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${config?.is_enabled ? 'bg-purple-100' : 'bg-muted'}`}>
                            <Icon
                              name={config?.scope === 'all' || !config?.location_id ? 'Globe' : 'Store'}
                              size={16}
                              className={config?.is_enabled ? 'text-purple-600' : 'text-muted-foreground'}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{estName}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                <Icon name="RefreshCw" size={10} />
                                {freqLabel}
                              </span>
                              {config?.is_enabled ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                  <Icon name="CheckCircle" size={10} />
                                  Activo
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                                  <Icon name="PauseCircle" size={10} />
                                  Inactivo
                                </span>
                              )}
                            </div>
                            {createdAt && (
                              <p className="text-xs text-muted-foreground mt-1">Creado: {createdAt}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleToggleConfig(config)}
                            title={config?.is_enabled ? 'Desactivar' : 'Activar'}
                            className={`p-1.5 rounded-lg transition-colors ${config?.is_enabled ? 'hover:bg-orange-100 text-orange-500' : 'hover:bg-green-100 text-green-600'}`}
                          >
                            <Icon name={config?.is_enabled ? 'PauseCircle' : 'PlayCircle'} size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteConfig(config?.id)}
                            disabled={deletingId === config?.id}
                            title="Eliminar"
                            className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors disabled:opacity-50"
                          >
                            {deletingId === config?.id
                              ? <Icon name="Loader2" size={16} className="animate-spin" />
                              : <Icon name="Trash2" size={16} />
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>)
        )}
      </div>
      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-border flex-shrink-0">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        {activeTab === 'config' && (
          isEnabled ? (
            <Button
              variant="outline"
              onClick={handleDeactivate}
              disabled={isSaving}
              iconName={isSaving ? 'Loader2' : 'XCircle'}
              iconPosition="left"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              {isSaving ? 'Desactivando...' : 'Desactivar'}
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={handleActivate}
              disabled={isSaving || !canActivate}
              iconName={isSaving ? 'Loader2' : 'Zap'}
              iconPosition="left"
              className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600 disabled:opacity-50"
            >
              {isSaving ? 'Activando...' : 'Activar Pedidos Recurrentes'}
            </Button>
          )
        )}
      </div>
    </div>
  );
};

export default RecurringOrderModal;
