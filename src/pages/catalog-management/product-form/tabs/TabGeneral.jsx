import React, { useState, useEffect } from 'react';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';
import Icon from '../../../../components/AppIcon';

const UNIT_TYPE_OPTIONS = [
  { value: '', label: '— Selecciona una unidad —' },
  { value: 'pieza', label: 'Pieza (pza)' },
  { value: 'kg', label: 'Kilogramo (kg)' },
  { value: 'g', label: 'Gramo (g)' },
  { value: 'litro', label: 'Litro (L)' },
  { value: 'ml', label: 'Mililitro (ml)' },
  { value: 'metro', label: 'Metro (m)' },
  { value: 'cm', label: 'Centímetro (cm)' },
  { value: 'caja', label: 'Caja' },
  { value: 'paquete', label: 'Paquete' },
  { value: 'docena', label: 'Docena' },
  { value: 'par', label: 'Par' },
  { value: 'hora', label: 'Hora (hr)' },
  { value: 'dia', label: 'Día' },
  { value: 'servicio', label: 'Servicio' },
  { value: 'porcion', label: 'Porción' },
  { value: 'rollo', label: 'Rollo' },
  { value: 'unidad', label: 'Unidad (u)' },
];

const PRODUCT_UNIT_OPTIONS = [
  { value: '', label: '— Selecciona una unidad —' },
  { value: 'pieza', label: 'Pieza (pza)' },
  { value: 'kg', label: 'Kilogramo (kg)' },
  { value: 'g', label: 'Gramo (g)' },
  { value: 'litro', label: 'Litro (L)' },
  { value: 'ml', label: 'Mililitro (ml)' },
  { value: 'metro', label: 'Metro (m)' },
  { value: 'cm', label: 'Centímetro (cm)' },
  { value: 'caja', label: 'Caja' },
  { value: 'paquete', label: 'Paquete' },
  { value: 'docena', label: 'Docena' },
  { value: 'par', label: 'Par' },
  { value: 'porcion', label: 'Porción' },
  { value: 'rollo', label: 'Rollo' },
  { value: 'unidad', label: 'Unidad (u)' },
];

const SERVICE_UNIT_OPTIONS = [
  { value: '', label: '— Selecciona una unidad —' },
  { value: 'hora', label: 'Hora (hr)' },
  { value: 'dia', label: 'Día' },
  { value: 'servicio', label: 'Servicio' },
  { value: 'sesion', label: 'Sesión' },
  { value: 'consulta', label: 'Consulta' },
  { value: 'visita', label: 'Visita' },
  { value: 'proyecto', label: 'Proyecto' },
  { value: 'mes', label: 'Mes' },
  { value: 'semana', label: 'Semana' },
];

const TabGeneral = ({ formData, errors, touched, onChange, onBlur }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);

  const statusOptions = [
    { value: 'draft', label: 'Borrador' },
    { value: 'active', label: 'Activo' },
    { value: 'archived', label: 'Archivado' }
  ];

  const visibilityOptions = [
    { value: 'public', label: 'Público' },
    { value: 'link_only', label: 'Solo con link' },
    { value: 'private', label: 'Privado' }
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const { data, error } = await supabase
          ?.from('product_categories')
          ?.select('*')
          ?.eq('owner_id', user?.id)
          ?.eq('is_active', true)
          ?.order('display_order');
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    const fetchTags = async () => {
      setLoadingTags(true);
      try {
        const { data, error } = await supabase
          ?.from('catalog_tags')
          ?.select('*')
          ?.eq('owner_id', user?.id)
          ?.eq('is_active', true)
          ?.order('name');
        if (!error && data?.length > 0) {
          setAvailableTags(data);
        } else {
          setAvailableTags([]);
        }
      } catch {
        setAvailableTags([]);
      } finally {
        setLoadingTags(false);
      }
    };

    if (user?.id) {
      fetchCategories();
      fetchTags();
    }
  }, [user?.id]);

  // Build hierarchical structure
  const buildHierarchy = (items, parentId = null, level = 0) => {
    return items
      ?.filter(item => (item?.parent_category_id || null) === parentId)
      ?.map(item => ({
        ...item,
        level,
        children: buildHierarchy(items, item?.id, level + 1)
      }));
  };

  const hierarchicalCategories = buildHierarchy(categories);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev =>
      prev?.includes(categoryId)
        ? prev?.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const isCategorySelected = (categoryId) => {
    return formData?.categories?.includes(categoryId);
  };

  const toggleCategorySelection = (categoryId) => {
    const selected = formData?.categories || [];
    if (selected?.includes(categoryId)) {
      onChange('categories', selected?.filter(id => id !== categoryId));
    } else {
      onChange('categories', [...selected, categoryId]);
    }
  };

  const renderCategoryTree = (items) => {
    return items?.map(category => {
      const hasChildren = category?.children?.length > 0;
      const isExpanded = expandedCategories?.includes(category?.id);
      const isSelected = isCategorySelected(category?.id);

      return (
        <div key={category?.id} className="ml-0">
          <div
            className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-muted transition-colors ${
              isSelected ? 'bg-primary/10 border border-primary/30' : ''
            }`}
            style={{ marginLeft: `${category?.level * 20}px` }}
          >
            {hasChildren && (
              <button
                type="button"
                onClick={() => toggleCategory(category?.id)}
                className="p-1 hover:bg-muted rounded"
              >
                <Icon
                  name={isExpanded ? 'ChevronDown' : 'ChevronRight'}
                  size={16}
                  className="text-muted-foreground"
                />
              </button>
            )}
            {!hasChildren && <div className="w-6" />}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleCategorySelection(category?.id)}
              className="w-4 h-4 text-primary rounded"
            />
            <label
              onClick={() => toggleCategorySelection(category?.id)}
              className="flex-1 text-sm text-foreground cursor-pointer"
            >
              {category?.name || category?.category_name}
            </label>
          </div>
          {hasChildren && isExpanded && (
            <div className="mt-1">
              {renderCategoryTree(category?.children)}
            </div>
          )}
        </div>
      );
    });
  };

  // Tags helpers
  const selectedTags = formData?.tags || [];

  const toggleTag = (tag) => {
    const exists = selectedTags?.find(t => t?.id === tag?.id);
    if (exists) {
      onChange('tags', selectedTags?.filter(t => t?.id !== tag?.id));
    } else {
      onChange('tags', [...selectedTags, tag]);
    }
  };

  const removeTag = (tagId) => {
    onChange('tags', selectedTags?.filter(t => t?.id !== tagId));
  };

  const isService = formData?.productOrService === 'service';
  const unitOptions = isService ? SERVICE_UNIT_OPTIONS : PRODUCT_UNIT_OPTIONS;
  const itemLabel = isService ? 'servicio' : 'producto';
  const ItemLabel = isService ? 'Servicio' : 'Producto';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Input
            label={`Nombre del ${itemLabel} *`}
            value={formData?.name}
            onChange={(e) => onChange('name', e?.target?.value)}
            onBlur={() => onBlur?.('name')}
            error={touched?.name && errors?.name}
            placeholder={isService ? 'Ej: Consultoría de Marketing' : 'Ej: Paella Valenciana'}
          />
        </div>

        <Input
          label="Slug / URL-friendly"
          value={formData?.slug}
          onChange={(e) => onChange('slug', e?.target?.value)}
          placeholder={isService ? 'consultoria-marketing' : 'paella-valenciana'}
          helperText="Se genera automáticamente, pero puedes editarlo"
        />

        <Select
          label="Estado *"
          value={formData?.status}
          onChange={(val) => onChange('status', val)}
          options={statusOptions}
          error={touched?.status && errors?.status}
        />

        <Select
          label="Visibilidad *"
          value={formData?.visibility}
          onChange={(val) => onChange('visibility', val)}
          options={visibilityOptions}
          error={touched?.visibility && errors?.visibility}
        />

        <Input
          label={`SKU (código interno del ${itemLabel})`}
          value={formData?.sku}
          onChange={(e) => onChange('sku', e?.target?.value)}
          placeholder={isService ? 'SERV-001' : 'PAELLA-001'}
          helperText="Código único por negocio"
        />

        <Input
          label="Código de barras (EAN/UPC)"
          value={formData?.barcode}
          onChange={(e) => onChange('barcode', e?.target?.value)}
          placeholder="1234567890123"
          helperText="Para escaneo en TPV"
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Tipo de unidad <span className="text-red-500">*</span>
          </label>
          <select
            value={formData?.unitType || ''}
            onChange={(e) => onChange('unitType', e?.target?.value)}
            onBlur={() => onBlur?.('unitType')}
            className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm ${
              touched?.unitType && errors?.unitType ? 'border-red-500' : 'border-border'
            }`}
          >
            {unitOptions?.map(opt => (
              <option key={opt?.value} value={opt?.value}>{opt?.label}</option>
            ))}
          </select>
          {touched?.unitType && errors?.unitType && (
            <p className="text-xs text-red-500 mt-1">{errors?.unitType}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">Unidad de medida para este {itemLabel}</p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-2">
            Descripción corta <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData?.shortDescription}
            onChange={(e) => onChange('shortDescription', e?.target?.value)}
            onBlur={() => onBlur?.('shortDescription')}
            placeholder={`Descripción breve del ${itemLabel} que aparece en la ficha pública (máximo 160 caracteres)`}
            maxLength={160}
            rows={2}
            className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground resize-none ${
              touched?.shortDescription && errors?.shortDescription ? 'border-red-500' : 'border-border'
            }`}
          />
          <div className="flex justify-between items-center mt-1">
            <p className={`text-xs ${
              touched?.shortDescription && errors?.shortDescription ? 'text-red-500' : 'text-muted-foreground'
            }`}>
              {(touched?.shortDescription && errors?.shortDescription) || `Aparece en ficha pública del ${itemLabel}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {formData?.shortDescription?.length || 0}/160
            </p>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-2">
            Descripción larga
          </label>
          <textarea
            value={formData?.longDescription}
            onChange={(e) => onChange('longDescription', e?.target?.value)}
            placeholder={`Descripción detallada del ${itemLabel} con toda la información relevante`}
            rows={6}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {isService ? 'Puedes incluir alcance, beneficios, metodología, etc.' : 'Puedes incluir ingredientes, características, beneficios, etc.'}
          </p>
        </div>

        {/* Hierarchical Categories */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-2">
            Categorías (jerárquicas) <span className="text-red-500">*</span>
          </label>
          {touched?.categories && errors?.categories && (
            <p className="text-xs text-red-500 mb-2">{errors?.categories}</p>
          )}
          <p className="text-xs text-muted-foreground mb-3">
            Las categorías se gestionan desde <a href="/business-settings?tab=categories" className="text-primary hover:underline">Configuración del Negocio → Categorías</a>. Estructura jerárquica a X subniveles.
          </p>
          {loadingCategories ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon name="Loader2" size={16} className="animate-spin" />
              <span className="text-sm">Cargando categorías...</span>
            </div>
          ) : categories?.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-2">
                <Icon name="AlertTriangle" size={16} className="text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900 mb-1">No hay categorías disponibles</p>
                  <p className="text-xs text-yellow-700">
                    Crea categorías desde <a href="/business-settings?tab=categories" className="text-yellow-800 underline">Configuración del Negocio → Categorías</a> para organizar tu catálogo.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-border rounded-lg p-3 max-h-80 overflow-y-auto">
              {renderCategoryTree(hierarchicalCategories)}
            </div>
          )}
          {formData?.categories?.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {formData?.categories?.length} categoría(s) seleccionada(s)
            </p>
          )}
        </div>

        {/* Tags — preloaded from business-settings */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-2">
            Etiquetas <span className="text-red-500">*</span>
          </label>
          {touched?.tags && errors?.tags && (
            <p className="text-xs text-red-500 mb-2">{errors?.tags}</p>
          )}
          <p className="text-xs text-muted-foreground mb-3">
            Etiquetas precargadas desde <a href="/business-settings?tab=tags" className="text-primary hover:underline">Configuración del Negocio → Etiquetas</a>. Administra tus etiquetas desde ahí.
          </p>

          {loadingTags ? (
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Icon name="Loader2" size={14} className="animate-spin" />
              <span className="text-xs">Cargando etiquetas...</span>
            </div>
          ) : availableTags?.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-3">
              {availableTags?.map(tag => {
                const isSelected = selectedTags?.find(t => t?.id === tag?.id);
                return (
                  <button
                    key={tag?.id}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? 'text-white border-transparent shadow-sm'
                        : 'bg-background text-foreground border-border hover:border-primary/50'
                    }`}
                    style={isSelected ? { backgroundColor: tag?.color || '#6b7280', borderColor: tag?.color || '#6b7280' } : {}}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.7)' : (tag?.color || '#6b7280') }}
                    />
                    {tag?.name}
                    {isSelected && <Icon name="Check" size={10} className="text-white" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
              <p className="text-xs text-yellow-700">
                No hay etiquetas registradas. Crea etiquetas desde <a href="/business-settings?tab=tags" className="text-yellow-800 underline">Configuración del Negocio → Etiquetas</a>.
              </p>
            </div>
          )}

          {/* Selected tags display */}
          {selectedTags?.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border border-border">
              <span className="text-xs text-muted-foreground self-center mr-1">Seleccionadas:</span>
              {selectedTags?.map(tag => (
                <span
                  key={tag?.id}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: tag?.color || '#6b7280' }}
                >
                  {tag?.name}
                  <button
                    type="button"
                    onClick={() => removeTag(tag?.id)}
                    className="hover:opacity-70 transition-opacity"
                  >
                    <Icon name="X" size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* IVA Tax Rates — moved to Precios tab */}

        {/* Gestionar inventario - solo para productos simples y variables */}
        {formData?.productOrService !== 'service' && formData?.itemType !== 'bundle' && (
          <div className="md:col-span-2">
            <div
              className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-100/70 transition-colors"
              onClick={() => onChange('manageInventory', !formData?.manageInventory)}
            >
              <input
                type="checkbox"
                id="manageInventory"
                checked={formData?.manageInventory || false}
                onChange={(e) => {
                  e?.stopPropagation();
                  onChange('manageInventory', e?.target?.checked);
                }}
                className="w-4 h-4 text-primary rounded mt-0.5 cursor-pointer"
              />
              <div>
                <label htmlFor="manageInventory" className="text-sm font-semibold text-foreground cursor-pointer">
                  Gestionar inventario
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Activa para habilitar la pestaña de Inventario con stock, costos y proveedor
                </p>
              </div>
              {formData?.manageInventory && (
                <span className="ml-auto flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full font-medium">
                  <Icon name="CheckCircle" size={12} />
                  Pestaña Inventario habilitada
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabGeneral;