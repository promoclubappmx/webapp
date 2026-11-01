import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-primary' : 'bg-muted'}`}
  >
    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
  </button>
);

const SurpriseEstablecimientoTab = ({ form, onChange }) => {
  const { user: authUser } = useAuth();
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectedIds = form?.establishmentIds || [];
  const applyToAll = form?.applyToAll !== false;

  useEffect(() => {
    const fetchEstablishments = async () => {
      if (!authUser?.id) return;
      setLoading(true);
      try {
        const { data: profile } = await supabase?.from('user_profiles')?.select('user_id')?.eq('id', authUser?.id)?.single();
        const businessId = profile?.user_id || authUser?.id;
        const { data } = await supabase
          ?.from('business_locations')
          ?.select('id, location_name, location_code, is_active, address')
          ?.eq('business_id', businessId)
          ?.eq('is_active', true)
          ?.order('location_name');
        setEstablishments(data || []);
      } catch (err) {
        console.error('Error loading establishments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEstablishments();
  }, [authUser?.id]);

  const toggleEstablishment = (id) => {
    const newIds = selectedIds?.includes(id)
      ? selectedIds?.filter(x => x !== id)
      : [...selectedIds, id];
    onChange({ ...form, establishmentIds: newIds });
  };

  const selectAll = () => {
    onChange({ ...form, establishmentIds: establishments?.map(e => e?.id) });
  };

  const clearAll = () => {
    onChange({ ...form, establishmentIds: [] });
  };

  return (
    <div className="space-y-6">
      {/* Apply to all toggle */}
      <div className={`border-2 rounded-2xl p-5 transition-all ${applyToAll ? 'border-green-500 bg-green-500/5' : 'border-border'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
              <Icon name="Globe" size={20} className="text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Aplicar a todos los establecimientos</p>
              <p className="text-xs text-muted-foreground">La sorpresa estará disponible en todas las sucursales activas</p>
            </div>
          </div>
          <Toggle
            checked={applyToAll}
            onChange={v => onChange({ ...form, applyToAll: v, establishmentIds: v ? [] : selectedIds })}
          />
        </div>
      </div>

      {/* Individual selection */}
      {!applyToAll && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="Building2" size={16} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Seleccionar establecimientos</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedIds?.length === 0
                    ? 'Ningún establecimiento seleccionado'
                    : `${selectedIds?.length} de ${establishments?.length} seleccionado${selectedIds?.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="px-2.5 py-1 text-xs text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
              >
                Todos
              </button>
              <button
                onClick={clearAll}
                className="px-2.5 py-1 text-xs text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Ninguno
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : establishments?.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
              <Icon name="Building2" size={24} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No hay establecimientos registrados</p>
            </div>
          ) : (
            <div className="space-y-2">
              {establishments?.map(est => (
                <label
                  key={est?.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedIds?.includes(est?.id) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds?.includes(est?.id)}
                    onChange={() => toggleEstablishment(est?.id)}
                    className="flex-shrink-0 accent-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground text-sm">{est?.location_name}</p>
                      {est?.location_code && (
                        <span className="px-1.5 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">{est?.location_code}</span>
                      )}
                    </div>
                    {est?.address && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{est?.address}</p>
                    )}
                  </div>
                  {selectedIds?.includes(est?.id) && (
                    <Icon name="CheckCircle2" size={18} className="text-primary flex-shrink-0" />
                  )}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default SurpriseEstablecimientoTab;
