import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import GeofenceHeader from './components/GeofenceHeader';
import GeofenceRadiusConfigurator from './components/GeofenceRadiusConfigurator';
import GeofenceActionsConfig from './components/GeofenceActionsConfig';
import { supabase } from '../../lib/supabase';

const BRANCHES = [
  { value: 'all', label: 'Ver todas' },
  { value: 'centro', label: 'Sucursal Centro' },
  { value: 'norte', label: 'Sucursal Norte' },
  { value: 'sur', label: 'Sucursal Sur' },
];

const GeofenceConfiguration = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [geofenceActive, setGeofenceActive] = useState(true);
  const [radius, setRadius] = useState(200);
  const [showToast, setShowToast] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('centro');
  const [businessLat, setBusinessLat] = useState(null);
  const [businessLng, setBusinessLng] = useState(null);
  const [locationBadge, setLocationBadge] = useState(null); // 'loaded' | 'not_found'

  const user = {
    name: 'Carlos Mendoza',
    email: 'carlos@promospot.com',
    role: 'owner',
  };

  const handleSave = () => {
    setShowToast(true);
    setHasUnsavedChanges(false);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDiscard = () => {
    if (hasUnsavedChanges) {
      setShowDiscardModal(true);
    }
  };

  const handleChange = () => {
    setHasUnsavedChanges(true);
  };

  // Load saved business location on mount
  useEffect(() => {
    const loadLocation = async () => {
      try {
        const { data, error } = await supabase?.from('business_locations')?.select('latitude,longitude')?.limit(1)?.maybeSingle();
        if (!error && data?.latitude && data?.longitude) {
          setBusinessLat(parseFloat(data?.latitude));
          setBusinessLng(parseFloat(data?.longitude));
          setLocationBadge('loaded');
        } else {
          setLocationBadge('not_found');
        }
      } catch {
        setLocationBadge('not_found');
      }
    };
    loadLocation();
  }, []);

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
        <div className="p-4 md:p-6 max-w-7xl mx-auto">

          {/* Page Header with Branch Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Mi Geofence
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Define la zona alrededor de tu negocio donde se activan notificaciones automáticas.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-sm min-w-[200px]">
              <Icon name="MapPin" size={16} className="text-primary shrink-0" />
              <select
                value={selectedBranch}
                onChange={(e) => { setSelectedBranch(e?.target?.value); handleChange(); }}
                className="flex-1 bg-transparent text-sm font-medium text-foreground focus:outline-none cursor-pointer"
              >
                {BRANCHES?.map(b => (
                  <option key={b?.value} value={b?.value}>{b?.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-border mb-6">
            <nav className="flex space-x-1 overflow-x-auto">
              {[
                { label: '🗺️ Mi Geofence', path: '/geofence-config', active: true },
                { label: '🔔 Notificaciones', path: '/geofence-notifications', active: false },
                { label: '📊 Actividad', path: '/geofence-activity', active: false },
              ]?.map((tab) => (
                <a
                  key={tab?.path}
                  href={tab?.path}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-200 ${
                    tab?.active
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  {tab?.label}
                </a>
              ))}
            </nav>
          </div>

          <GeofenceHeader
            geofenceActive={geofenceActive}
            onToggle={() => { setGeofenceActive(!geofenceActive); handleChange(); }}
          />

          {/* Location badge */}
          {locationBadge === 'loaded' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl mb-4">
              <Icon name="MapPin" size={14} className="text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">Centrado en tu negocio</span>
            </div>
          )}
          {locationBadge === 'not_found' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl mb-4">
              <Icon name="AlertTriangle" size={14} className="text-amber-600" />
              <span className="text-xs font-medium text-amber-700">Guarda primero la ubicación de tu negocio en la pestaña Ubicación</span>
            </div>
          )}
          <GeofenceRadiusConfigurator
            radius={radius}
            onRadiusChange={(val) => { setRadius(val); handleChange(); }}
            geofenceActive={geofenceActive}
            businessLat={businessLat}
            businessLng={businessLng}
          />

          <GeofenceActionsConfig
            geofenceActive={geofenceActive}
            onChange={handleChange}
          />

          {/* Footer */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={handleDiscard}
              className="px-6 py-2.5 text-sm font-medium text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Descartar cambios
            </button>
            <button
              onClick={handleSave}
              className="w-full sm:w-auto px-8 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Guardar configuración
            </button>
          </div>
        </div>
      </main>
      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fadeIn">
          <Icon name="CheckCircle" size={18} />
          <span className="text-sm font-medium">✓ Geofence configurado correctamente</span>
        </div>
      )}
      {/* Discard Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-2">¿Descartar cambios?</h3>
            <p className="text-sm text-muted-foreground mb-5">Perderás todos los cambios no guardados.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDiscardModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => { setShowDiscardModal(false); setHasUnsavedChanges(false); }}
                className="flex-1 px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
              >
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeofenceConfiguration;
