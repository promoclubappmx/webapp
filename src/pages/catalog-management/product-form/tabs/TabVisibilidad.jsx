import React, { useEffect, useState } from 'react';
import Icon from '../../../../components/AppIcon';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';

const TabVisibilidad = ({ formData, onChange }) => {
  const { user } = useAuth();
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

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
          // Initialize visibilityEstablishments if not set
          if (!formData?.visibilityEstablishments || formData?.visibilityEstablishments?.length === 0) {
            const initial = data?.map(loc => ({
              locationId: loc?.id,
              locationName: loc?.branch_name || loc?.location_name || 'Establecimiento',
              visible: true,
            }));
            onChange('visibilityEstablishments', initial);
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

  const visibilityEstablishments = formData?.visibilityEstablishments || [];

  const toggleAll = (visible) => {
    const updated = visibilityEstablishments?.map(v => ({ ...v, visible }));
    onChange('visibilityEstablishments', updated);
  };

  const toggleLocation = (locationId) => {
    const updated = visibilityEstablishments?.map(v =>
      v?.locationId === locationId ? { ...v, visible: !v?.visible } : v
    );
    onChange('visibilityEstablishments', updated);
  };

  const visibleCount = visibilityEstablishments?.filter(v => v?.visible)?.length;
  const totalCount = visibilityEstablishments?.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
          <Icon name="Eye" size={18} className="text-primary" />
          Visibilidad por Establecimiento
        </h3>
        <p className="text-sm text-muted-foreground">
          Indica en qué establecimientos estará visible este{' '}
          {formData?.productOrService === 'service' ? 'servicio' : 'producto'}.
          Solo los establecimientos marcados podrán mostrarlo a los clientes.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <Icon name="Info" size={16} className="text-blue-600 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700">
          Como no gestionas inventario para este{' '}
          {formData?.productOrService === 'service' ? 'servicio' : 'producto'}, puedes controlar
          manualmente en qué establecimientos aparecerá visible.
        </p>
      </div>

      {loadingLocations ? (
        <div className="flex items-center gap-2 text-muted-foreground py-6">
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
        <div className="space-y-4">
          {/* Summary + bulk actions */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{visibleCount}</span> de{' '}
              <span className="font-semibold text-foreground">{totalCount}</span> establecimientos visibles
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleAll(true)}
                className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-foreground"
              >
                Activar todos
              </button>
              <button
                type="button"
                onClick={() => toggleAll(false)}
                className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-foreground"
              >
                Desactivar todos
              </button>
            </div>
          </div>

          {/* Establishments list */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 bg-muted/50 px-4 py-2 border-b border-border">
              <div className="col-span-8 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Establecimiento</div>
              <div className="col-span-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Visible</div>
            </div>
            <div className="divide-y divide-border">
              {locations?.map((loc) => {
                const entry = visibilityEstablishments?.find(v => v?.locationId === loc?.id);
                const isVisible = entry?.visible ?? true;
                return (
                  <div key={loc?.id} className="grid grid-cols-12 px-4 py-3 items-center hover:bg-muted/20 transition-colors">
                    <div className="col-span-8">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isVisible ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {loc?.branch_name || loc?.location_name || 'Establecimiento'}
                          </p>
                          {(loc?.city || loc?.address) && (
                            <p className="text-xs text-muted-foreground">
                              {[loc?.address, loc?.city]?.filter(Boolean)?.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-4 flex justify-center">
                      <button
                        type="button"
                        onClick={() => toggleLocation(loc?.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          isVisible ? 'bg-primary' : 'bg-gray-200'
                        }`}
                        aria-label={isVisible ? 'Desactivar visibilidad' : 'Activar visibilidad'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            isVisible ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {visibleCount === 0 && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3">
              <Icon name="AlertTriangle" size={15} className="text-orange-600 shrink-0" />
              <p className="text-sm text-orange-700">
                Este {formData?.productOrService === 'service' ? 'servicio' : 'producto'} no estará visible en ningún establecimiento.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TabVisibilidad;
