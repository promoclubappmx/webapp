import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const CatalogCustomAttributesTab = () => {
  const { user } = useAuth();
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [keyInput, setKeyInput] = useState('');
  const [valueInput, setValueInput] = useState('');

  useEffect(() => {
    loadAttributes();
  }, [user]);

  const loadAttributes = async () => {
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
      setAttributes(data || []);
    } catch (err) {
      console.error('Error loading custom attributes:', err);
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!keyInput?.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const { error: err } = await supabase
        ?.from('catalog_custom_attributes')
        ?.insert({
          owner_id: user?.id,
          attr_key: keyInput?.trim(),
          attr_value: valueInput?.trim() || ''
        });
      if (err) throw err;
      setKeyInput('');
      setValueInput('');
      loadAttributes();
    } catch (err) {
      console.error('Error saving custom attribute:', err);
      setError(err?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e?.key === 'Enter') {
      e?.preventDefault();
      handleAdd();
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const { error: err } = await supabase
        ?.from('catalog_custom_attributes')
        ?.delete()
        ?.eq('id', id)
        ?.eq('owner_id', user?.id);
      if (err) throw err;
      setAttributes(prev => prev?.filter(a => a?.id !== id));
    } catch (err) {
      console.error('Error deleting custom attribute:', err);
      setError(err?.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-foreground">Atributos personalizados</h3>
        <p className="text-sm text-primary">
          Información adicional visible al cliente (Calorías: 350 kcal, Origen: Sinaloa, Sin gluten: Sí, etc.)
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Add Form */}
      <div className="border border-border rounded-lg p-5 bg-card">
        <p className="text-sm font-medium text-foreground mb-4">Agregar nuevo atributo</p>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm text-muted-foreground mb-1">
              Nombre (clave) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e?.target?.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ej: Calorías"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-muted-foreground mb-1">
              Valor <span className="text-muted-foreground text-xs">(opcional)</span>
            </label>
            <input
              type="text"
              value={valueInput}
              onChange={(e) => setValueInput(e?.target?.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ej: 350 kcal"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={saving || !keyInput?.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {saving ? (
              <Icon name="Loader" size={16} className="animate-spin" />
            ) : (
              <Icon name="Plus" size={16} />
            )}
            Agregar
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Presiona Enter o el botón para agregar</p>
      </div>

      {/* Attributes List */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : attributes?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Icon name="Tag" size={40} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">No hay atributos personalizados</p>
            <p className="text-xs mt-1">Agrega información adicional como calorías, origen, alérgenos, etc.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {attributes?.map((attr) => (
              <div key={attr?.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-medium text-foreground truncate">{attr?.attr_key}</span>
                  <span className="text-muted-foreground text-sm">:</span>
                  <span className="text-sm text-muted-foreground truncate">{attr?.attr_value}</span>
                </div>
                <button
                  onClick={() => handleDelete(attr?.id)}
                  disabled={deletingId === attr?.id}
                  className="ml-4 p-1.5 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                  title="Eliminar atributo"
                >
                  <Icon
                    name={deletingId === attr?.id ? 'Loader' : 'Trash2'}
                    size={15}
                    className={`${deletingId === attr?.id ? 'animate-spin text-muted-foreground' : 'text-red-500'}`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <Icon name="Info" size={16} className="text-primary mt-0.5 flex-shrink-0" />
        <p className="text-xs text-primary">
          Los atributos se indexan para búsqueda y filtrado. Son visibles en la ficha pública del producto.
        </p>
      </div>
    </div>
  );
};

export default CatalogCustomAttributesTab;
