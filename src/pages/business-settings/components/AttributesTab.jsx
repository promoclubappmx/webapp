import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const AttributesTab = () => {
  const { user } = useAuth();
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    values: [],
    description: ''
  });
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
        ?.from('catalog_attributes')
        ?.select('*')
        ?.eq('owner_id', user?.id)
        ?.eq('is_active', true)
        ?.order('created_at', { ascending: false });
      if (err) throw err;
      setAttributes(data || []);
    } catch (err) {
      console.error('Error loading attributes:', err);
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!formData?.name?.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const slug = formData?.slug?.trim() ||
        formData?.name?.toLowerCase()?.normalize('NFD')?.replace(/[\u0300-\u036f]/g, '')?.replace(/[^a-z0-9]+/g, '-');
      const { error: err } = await supabase
        ?.from('catalog_attributes')
        ?.insert({
          owner_id: user?.id,
          name: formData?.name?.trim(),
          slug,
          attr_type: 'select',
          values: formData?.values,
          description: formData?.description?.trim() || null,
          is_active: true
        });
      if (err) throw err;
      setShowForm(false);
      setFormData({ name: '', slug: '', values: [], description: '' });
      setValueInput('');
      loadAttributes();
    } catch (err) {
      console.error('Error saving attribute:', err);
      setError(err?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const { error: err } = await supabase
        ?.from('catalog_attributes')
        ?.update({ is_active: false })
        ?.eq('id', id)
        ?.eq('owner_id', user?.id);
      if (err) throw err;
      setAttributes(prev => prev?.filter(a => a?.id !== id));
    } catch (err) {
      console.error('Error deleting attribute:', err);
      setError(err?.message);
    } finally {
      setDeletingId(null);
    }
  };

  const addValue = () => {
    if (valueInput?.trim() && !formData?.values?.includes(valueInput?.trim())) {
      setFormData({ ...formData, values: [...formData?.values, valueInput?.trim()] });
      setValueInput('');
    }
  };

  const removeValue = (value) => {
    setFormData({ ...formData, values: formData?.values?.filter(v => v !== value) });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Variantes Globales</h3>
          <p className="text-sm text-muted-foreground">
            Variantes reutilizables para productos variables: Talla, Color, Sabor, etc.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Icon name="Plus" size={16} className="mr-2" />
          Agregar variante
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h4 className="text-sm font-semibold text-foreground mb-4">Nueva Variante</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre de la variante *"
                value={formData?.name}
                onChange={(e) => {
                  const name = e?.target?.value;
                  const slug = name?.toLowerCase()?.normalize('NFD')?.replace(/[\u0300-\u036f]/g, '')?.replace(/[^a-z0-9]+/g, '-');
                  setFormData({ ...formData, name, slug });
                }}
                placeholder="Ej: Talla"
                required
              />
              <Input
                label="Slug"
                value={formData?.slug}
                onChange={(e) => setFormData({ ...formData, slug: e?.target?.value })}
                placeholder="talla"
              />
              <Input
                label="Descripción"
                value={formData?.description}
                onChange={(e) => setFormData({ ...formData, description: e?.target?.value })}
                placeholder="Descripción opcional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Valores predefinidos</label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={valueInput}
                  onChange={(e) => setValueInput(e?.target?.value)}
                  placeholder="Ej: S, M, L"
                  onKeyDown={(e) => {
                    if (e?.key === 'Enter') { e?.preventDefault(); addValue(); }
                  }}
                />
                <Button type="button" size="sm" onClick={addValue} iconName="Plus" />
              </div>
              <div className="flex flex-wrap gap-2">
                {formData?.values?.map((value, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {value}
                    <button type="button" onClick={() => removeValue(value)} className="hover:text-primary/70">
                      <Icon name="X" size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => { setShowForm(false); setFormData({ name: '', slug: '', values: [], description: '' }); setValueInput(''); }}>Cancelar</Button>
            </div>
          </form>
        </div>
      )}

      {attributes?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Icon name="List" size={48} className="mx-auto mb-3 opacity-30" />
          <p>No hay variantes aún. Crea la primera.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attributes?.map((attr) => (
            <div key={attr?.id} className="p-4 bg-card rounded-lg border border-border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon name="List" size={20} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{attr?.name}</h4>
                    <p className="text-xs text-muted-foreground">{attr?.slug}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(attr?.id)}
                  disabled={deletingId === attr?.id}
                  className="p-1 hover:bg-muted rounded"
                >
                  <Icon name={deletingId === attr?.id ? 'Loader' : 'Trash2'} size={16} className="text-red-500" />
                </button>
              </div>
              {attr?.values?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {attr?.values?.map((value, index) => (
                    <span key={index} className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">{value}</span>
                  ))}
                </div>
              )}
              {attr?.description && (
                <p className="text-xs text-muted-foreground mt-2">{attr?.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttributesTab;