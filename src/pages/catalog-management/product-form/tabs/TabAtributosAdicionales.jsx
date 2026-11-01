import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';

const TabAtributosAdicionales = ({ formData, onChange }) => {
  const { user } = useAuth();
  const [catalogAttributes, setCatalogAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // formData.customAttributes is an array of { id, attr_key, attr_value }
  const customAttributes = formData?.customAttributes || [];

  useEffect(() => {
    loadCatalogAttributes();
  }, [user?.id]);

  const loadCatalogAttributes = async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        ?.from('catalog_custom_attributes')
        ?.select('*')
        ?.eq('owner_id', user?.id)
        ?.order('created_at', { ascending: true });
      if (err) throw err;
      const attrs = data || [];
      setCatalogAttributes(attrs);

      // Pre-populate formData.customAttributes with catalog attrs if not already set
      // Merge: keep existing values, add missing attrs with empty value
      const existing = formData?.customAttributes || [];
      const merged = attrs?.map(attr => {
        const found = existing?.find(e => e?.id === attr?.id);
        return {
          id: attr?.id,
          attr_key: attr?.attr_key,
          attr_value: found ? found?.attr_value : (attr?.attr_value || '')
        };
      });
      onChange('customAttributes', merged);
    } catch (err) {
      console.error('Error loading catalog attributes:', err);
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (attrId, newValue) => {
    const updated = customAttributes?.map(attr =>
      attr?.id === attrId ? { ...attr, attr_value: newValue } : attr
    );
    onChange('customAttributes', updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-foreground">Atributos adicionales</h3>
        <p className="text-sm text-muted-foreground">
          Información adicional visible al cliente. Los nombres provienen de{' '}
          <a href="/catalog-settings" className="text-primary hover:underline">Ajustes del Catálogo</a>.
          Solo puedes editar el valor para este ítem.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {catalogAttributes?.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center">
          <Icon name="Tag" size={36} className="mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-sm font-medium text-muted-foreground">No hay atributos configurados</p>
          <p className="text-xs text-muted-foreground mt-1">
            Agrega atributos en{' '}
            <a href="/catalog-settings" className="text-primary hover:underline">
              Ajustes del Catálogo → Atributos personalizados
            </a>
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-0 border-b border-border bg-muted/40 px-5 py-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nombre</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Valor para este ítem</span>
            <span className="w-5" />
          </div>
          <div className="divide-y divide-border">
            {customAttributes?.map((attr) => (
              <div key={attr?.id} className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center px-5 py-3">
                {/* Name — read-only */}
                <div className="flex items-center gap-2">
                  <Icon name="Tag" size={14} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground">{attr?.attr_key}</span>
                </div>
                {/* Value — editable */}
                <input
                  type="text"
                  value={attr?.attr_value || ''}
                  onChange={(e) => handleValueChange(attr?.id, e?.target?.value)}
                  placeholder="Ej: 350 kcal"
                  className="w-full px-3 py-1.5 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground"
                />
                {/* Lock icon to indicate name is not editable */}
                <div title="El nombre se gestiona en Ajustes del Catálogo">
                  <Icon name="Lock" size={14} className="text-muted-foreground opacity-50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <Icon name="Info" size={16} className="text-primary mt-0.5 flex-shrink-0" />
        <p className="text-xs text-primary">
          Para agregar o eliminar atributos, ve a{' '}
          <a href="/catalog-settings" className="font-medium underline">
            Ajustes del Catálogo → Atributos personalizados
          </a>. Aquí solo puedes personalizar el valor para este ítem específico.
        </p>
      </div>
    </div>
  );
};

export default TabAtributosAdicionales;
