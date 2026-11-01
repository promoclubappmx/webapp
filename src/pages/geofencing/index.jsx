import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';
import TabZona from './components/TabZona';
import TabAcciones from './components/TabAcciones';
import TabSimulador from './components/TabSimulador';
import TabActividad from './components/TabActividad';

const BRANCHES = [
  { value: 'centro', label: 'Sucursal Centro' },
  { value: 'norte', label: 'Sucursal Norte' },
  { value: 'sur', label: 'Sucursal Sur' },
];

const TABS = [
  { id: 'zona', label: '📍 Zona', icon: 'MapPin' },
  { id: 'acciones', label: '⚡ Acciones', icon: 'Zap' },
  { id: 'simulador', label: '▷ Simulador', icon: 'Play' },
  { id: 'actividad', label: '📊 Actividad', icon: 'BarChart3' },
];

const GeofencingModule = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('zona');
  const [selectedBranch, setSelectedBranch] = useState('centro');
  const [geofencingActive, setGeofencingActive] = useState(true);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [geofenceConfig, setGeofenceConfig] = useState(null);
  const [clientsInRadius, setClientsInRadius] = useState(87);
  const [activeRadius, setActiveRadius] = useState(200);

  const user = {
    name: 'Carlos Mendoza',
    email: 'carlos@promospot.com',
    role: 'owner',
  };

  useEffect(() => {
    const loadGeofenceConfig = async () => {
      try {
        const { data } = await supabase
          ?.from('business_geofences')
          ?.select('*')
          ?.eq('is_active', true)
          ?.limit(1)
          ?.maybeSingle();
        if (data) {
          setGeofenceConfig(data);
          setActiveRadius(data?.radius_meters || 200);
        }
      } catch (e) {
        // use defaults
      }
    };
    loadGeofenceConfig();
  }, [selectedBranch]);

  const handleToggleGeofencing = async () => {
    if (geofencingActive) {
      setShowDeactivateModal(true);
    } else {
      setGeofencingActive(true);
      try {
        await supabase
          ?.from('business_geofences')
          ?.update({ is_active: true, updated_at: new Date()?.toISOString() })
          ?.eq('is_primary', true);
      } catch (e) {
        // silently fail
      }
    }
  };

  const confirmDeactivate = async () => {
    setGeofencingActive(false);
    setShowDeactivateModal(false);
    try {
      await supabase
        ?.from('business_geofences')
        ?.update({ is_active: false, updated_at: new Date()?.toISOString() })
        ?.eq('is_active', true);
    } catch (e) {
      // silently fail — UI already updated
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        isSidebarOpen={isSidebarOpen}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        user={user}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
      />

      <main className="pt-16 lg:ml-72">
        {/* Module Header */}
        <div className="bg-card border-b border-border px-4 md:px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              {/* Title + metrics */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Icon name="MapPin" size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      Geofencing
                    </h1>
                    <p className="text-xs text-muted-foreground">
                      Detecta la presencia de tus clientes y actúa en el momento exacto.
                    </p>
                  </div>
                </div>
                {/* Inline metrics */}
                <div className="flex flex-wrap items-center gap-3 mt-3 ml-1">
                  {geofenceConfig ? (
                    <>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        {clientsInRadius} clientes en radio ahora
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
                        <Icon name="MapPin" size={11} />
                        Radio activo: {activeRadius}m
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                      Sin geofence configurado — configura tu zona en el tab Zona
                    </span>
                  )}
                </div>
              </div>

              {/* Right: branch selector + toggle */}
              <div className="flex flex-col sm:items-end gap-3">
                {/* Branch selector */}
                <div className="flex items-center gap-2 bg-muted border border-border rounded-xl px-3 py-2 min-w-[200px]">
                  <Icon name="Building2" size={15} className="text-primary shrink-0" />
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e?.target?.value)}
                    className="flex-1 bg-transparent text-sm font-medium text-foreground focus:outline-none cursor-pointer"
                  >
                    {BRANCHES?.map(b => (
                      <option key={b?.value} value={b?.value}>{b?.label}</option>
                    ))}
                  </select>
                  <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 font-medium whitespace-nowrap">
                    {BRANCHES?.find(b => b?.value === selectedBranch)?.label?.replace('Sucursal ', '')}
                  </span>
                </div>

                {/* Master toggle */}
                <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-2.5">
                  <span className="text-sm font-medium text-foreground">Geofencing:</span>
                  <button
                    onClick={handleToggleGeofencing}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                      geofencingActive ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        geofencingActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-semibold ${geofencingActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {geofencingActive ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="mt-4 border-b border-border -mb-px">
              <nav className="flex gap-1 overflow-x-auto">
                {TABS?.map(tab => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`px-5 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 ${
                      activeTab === tab?.id
                        ? 'border-primary text-primary bg-primary/5' :'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    {tab?.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto">
          {activeTab === 'zona' && (
            <TabZona
              selectedBranch={selectedBranch}
              geofencingActive={geofencingActive}
              onRadiusChange={setActiveRadius}
              onConfigSaved={setGeofenceConfig}
            />
          )}
          {activeTab === 'acciones' && (
            <TabAcciones
              selectedBranch={selectedBranch}
              geofencingActive={geofencingActive}
            />
          )}
          {activeTab === 'simulador' && (
            <TabSimulador
              selectedBranch={selectedBranch}
              geofenceConfig={geofenceConfig}
            />
          )}
          {activeTab === 'actividad' && (
            <TabActividad
              selectedBranch={selectedBranch}
            />
          )}
        </div>
      </main>

      {/* Deactivate Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-xl border border-border">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <Icon name="AlertTriangle" size={22} className="text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">¿Desactivar geofencing?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Las acciones automáticas dejarán de ejecutarse hasta que lo reactives. Tu configuración se conserva.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-border rounded-xl hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeactivate}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeofencingModule;
