import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const CategoriesTab = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: 'Tag',
    isSubcategory: false,
    parent_category_id: ''
  });

  useEffect(() => {
    loadCategories();
  }, [user]);

  const loadCategories = async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        ?.from('product_categories')
        ?.select('*')
        ?.eq('owner_id', user?.id)
        ?.eq('is_active', true)
        ?.order('display_order');
      if (err) throw err;
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
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
      const payload = {
        owner_id: user?.id,
        name: formData?.name?.trim(),
        description: formData?.description?.trim() || null,
        color: formData?.color,
        icon: formData?.icon,
        is_active: true,
        parent_category_id: formData?.isSubcategory && formData?.parent_category_id
          ? formData?.parent_category_id
          : null
      };

      const { error: err } = await supabase
        ?.from('product_categories')
        ?.insert(payload);

      if (err) throw err;

      setShowForm(false);
      setFormData({ name: '', description: '', color: '#3b82f6', icon: 'Tag', isSubcategory: false, parent_category_id: '' });
      loadCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      setError(err?.message);
    } finally {
      setSaving(false);
    }
  };

  // Build a tree structure for display
  const buildTree = (items, parentId = null) => {
    return items
      ?.filter(item => (item?.parent_category_id || null) === parentId)
      ?.map(item => ({
        ...item,
        children: buildTree(items, item?.id)
      }));
  };

  const tree = buildTree(categories);

  // Top-level categories for parent selector
  const topLevelCategories = categories?.filter(c => !c?.parent_category_id);

  const renderCategory = (category, depth = 0) => (
    <div key={category?.id}>
      <div
        className="p-4 bg-card rounded-lg border border-border hover:shadow-md transition-shadow"
        style={{ marginLeft: depth > 0 ? `${depth * 20}px` : 0 }}
      >
        <div className="flex items-center gap-3">
          {depth > 0 && (
            <Icon name="CornerDownRight" size={14} className="text-muted-foreground flex-shrink-0" />
          )}
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: (category?.color || '#3b82f6') + '20' }}
          >
            <Icon name={category?.icon || 'Tag'} size={18} style={{ color: category?.color || '#3b82f6' }} />
          </div>
          <div className="min-w-0">
            <h4 className="font-medium text-foreground truncate">{category?.name}</h4>
            {category?.description && (
              <p className="text-xs text-muted-foreground truncate">{category?.description}</p>
            )}
            {depth > 0 && (
              <span className="text-xs text-primary/70 font-medium">Subcategoría</span>
            )}
          </div>
        </div>
      </div>
      {category?.children?.length > 0 && (
        <div className="mt-2 space-y-2">
          {category?.children?.map(child => renderCategory(child, depth + 1))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Categorías de Productos</h3>
          <p className="text-sm text-muted-foreground">Organiza tus productos en categorías y subcategorías anidadas</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Icon name="Plus" size={16} className="mr-2" />Agregar Categoría
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-sm font-semibold text-foreground mb-4">Nueva Categoría</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre *"
                value={formData?.name}
                onChange={(e) => setFormData({ ...formData, name: e?.target?.value })}
                placeholder="Ej: Bebidas"
                required
              />
              <Input
                label="Descripción"
                value={formData?.description}
                onChange={(e) => setFormData({ ...formData, description: e?.target?.value })}
                placeholder="Descripción opcional"
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
            </div>

            {/* Subcategory toggle */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isSubcategory: !formData?.isSubcategory, parent_category_id: '' })}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all w-full text-left ${
                formData?.isSubcategory
                  ? 'border-primary bg-primary/10' :'border-border bg-muted/30 hover:border-primary/40'
              }`}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                formData?.isSubcategory ? 'border-primary bg-primary' : 'border-muted-foreground/40 bg-background'
              }`}>
                {formData?.isSubcategory && (
                  <Icon name="Check" size={12} className="text-white" />
                )}
              </div>
              <div>
                <p className={`text-sm font-medium ${formData?.isSubcategory ? 'text-primary' : 'text-foreground'}`}>Es subcategoría</p>
                <p className="text-xs text-muted-foreground">Pertenece a una categoría padre</p>
              </div>
            </button>

            {formData?.isSubcategory && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Categoría padre *</label>
                <select
                  value={formData?.parent_category_id}
                  onChange={(e) => setFormData({ ...formData, parent_category_id: e?.target?.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                  required={formData?.isSubcategory}
                >
                  <option value="">Selecciona una categoría padre...</option>
                  {categories?.map(cat => (
                    <option key={cat?.id} value={cat?.id}>
                      {cat?.parent_category_id
                        ? `↳ ${categories?.find(c => c?.id === cat?.parent_category_id)?.name || ''} › ${cat?.name}`
                        : cat?.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar categoría'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                  setFormData({ name: '', description: '', color: '#3b82f6', icon: 'Tag', isSubcategory: false, parent_category_id: '' });
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {categories?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Icon name="FolderTree" size={48} className="mx-auto mb-3 opacity-30" />
          <p>No hay categorías aún. Crea la primera.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tree?.map(category => renderCategory(category, 0))}
        </div>
      )}
    </div>
  );
};

export default CategoriesTab;
