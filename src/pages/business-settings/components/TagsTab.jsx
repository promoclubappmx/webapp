import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const TagsTab = () => {
  const { user } = useAuth();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    color: '#3b82f6',
    description: ''
  });

  useEffect(() => {
    loadTags();
  }, [user]);

  const loadTags = async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        ?.from('catalog_tags')
        ?.select('*')
        ?.eq('owner_id', user?.id)
        ?.eq('is_active', true)
        ?.order('created_at', { ascending: false });
      if (err) throw err;
      setTags(data || []);
    } catch (err) {
      console.error('Error loading tags:', err);
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
        ?.from('catalog_tags')
        ?.insert({
          owner_id: user?.id,
          name: formData?.name?.trim(),
          slug,
          color: formData?.color,
          description: formData?.description?.trim() || null,
          is_active: true
        });
      if (err) throw err;
      setShowForm(false);
      setFormData({ name: '', slug: '', color: '#3b82f6', description: '' });
      loadTags();
    } catch (err) {
      console.error('Error saving tag:', err);
      setError(err?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const { error: err } = await supabase
        ?.from('catalog_tags')
        ?.update({ is_active: false })
        ?.eq('id', id)
        ?.eq('owner_id', user?.id);
      if (err) throw err;
      setTags(prev => prev?.filter(t => t?.id !== id));
    } catch (err) {
      console.error('Error deleting tag:', err);
      setError(err?.message);
    } finally {
      setDeletingId(null);
    }
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
          <h3 className="text-lg font-semibold text-foreground">Etiquetas del Catálogo</h3>
          <p className="text-sm text-muted-foreground">
            Etiquetas libres para clasificar productos: vegano, sin-azúcar, oferta-semana, favorito-local
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Icon name="Plus" size={16} className="mr-2" />
          Agregar Etiqueta
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h4 className="text-sm font-semibold text-foreground mb-4">Nueva Etiqueta</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre de la etiqueta *"
                value={formData?.name}
                onChange={(e) => {
                  const name = e?.target?.value;
                  const slug = name?.toLowerCase()?.normalize('NFD')?.replace(/[\u0300-\u036f]/g, '')?.replace(/[^a-z0-9]+/g, '-');
                  setFormData({ ...formData, name, slug });
                }}
                placeholder="Ej: vegano"
                required
              />
              <Input
                label="Slug"
                value={formData?.slug}
                onChange={(e) => setFormData({ ...formData, slug: e?.target?.value })}
                placeholder="vegano"
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Color</label>
                <input
                  type="color"
                  value={formData?.color}
                  onChange={(e) => setFormData({ ...formData, color: e?.target?.value })}
                  className="w-full h-10 rounded-lg border border-border cursor-pointer"
                />
              </div>
              <Input
                label="Descripción"
                value={formData?.description}
                onChange={(e) => setFormData({ ...formData, description: e?.target?.value })}
                placeholder="Descripción opcional"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </form>
        </div>
      )}

      {tags?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Icon name="Tag" size={48} className="mx-auto mb-3 opacity-30" />
          <p>No hay etiquetas aún. Crea la primera.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags?.map((tag) => (
            <div key={tag?.id} className="p-4 bg-card rounded-lg border border-border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: (tag?.color || '#3b82f6') + '20' }}
                  >
                    <Icon name="Tag" size={20} style={{ color: tag?.color || '#3b82f6' }} />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{tag?.name}</h4>
                    <p className="text-xs text-muted-foreground">{tag?.slug}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(tag?.id)}
                  disabled={deletingId === tag?.id}
                  className="p-1 hover:bg-muted rounded"
                >
                  <Icon name={deletingId === tag?.id ? 'Loader' : 'Trash2'} size={16} className="text-red-500" />
                </button>
              </div>
              {tag?.description && (
                <p className="text-xs text-muted-foreground">{tag?.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagsTab;