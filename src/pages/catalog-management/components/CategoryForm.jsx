import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const CategoryForm = ({ category = null, onSave, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    businessType: 'product',
    iconName: 'Tag',
    color: '#3B82F6',
    isActive: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (category) {
      setFormData({
        name: category?.name || '',
        description: category?.description || '',
        businessType: category?.businessType || 'product',
        iconName: category?.iconName || 'Tag',
        color: category?.color || '#3B82F6',
        isActive: category?.isActive !== undefined ? category?.isActive : true
      });
    }
  }, [category]);

  const businessTypeOptions = [
    { value: 'product', label: 'Productos' },
    { value: 'service', label: 'Servicios' }
  ];

  const iconOptions = [
    { value: 'Tag', label: 'Etiqueta' },
    { value: 'Package', label: 'Paquete' },
    { value: 'Wrench', label: 'Herramienta' },
    { value: 'UtensilsCrossed', label: 'Utensilios Cruzados' },
    { value: 'Coffee', label: 'Café' },
    { value: 'Utensils', label: 'Utensilios' },
    { value: 'ShoppingCart', label: 'Carrito' },
    { value: 'Gift', label: 'Regalo' },
    { value: 'Heart', label: 'Corazón' },
    { value: 'Star', label: 'Estrella' },
    { value: 'Zap', label: 'Rayo' },
    { value: 'Shield', label: 'Escudo' },
    { value: 'Award', label: 'Premio' },
    { value: 'Bookmark', label: 'Marcador' }
  ];

  const colorOptions = [
    { value: '#3B82F6', label: 'Azul', color: '#3B82F6' },
    { value: '#EF4444', label: 'Rojo', color: '#EF4444' },
    { value: '#10B981', label: 'Verde', color: '#10B981' },
    { value: '#F59E0B', label: 'Amarillo', color: '#F59E0B' },
    { value: '#8B5CF6', label: 'Púrpura', color: '#8B5CF6' },
    { value: '#EC4899', label: 'Rosa', color: '#EC4899' },
    { value: '#6B7280', label: 'Gris', color: '#6B7280' },
    { value: '#14B8A6', label: 'Turquesa', color: '#14B8A6' },
    { value: '#F97316', label: 'Naranja', color: '#F97316' },
    { value: '#84CC16', label: 'Lima', color: '#84CC16' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData?.description?.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }

    if (!formData?.businessType) {
      newErrors.businessType = 'Selecciona el tipo de negocio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          {category ? 'Editar Categoría' : 'Nueva Categoría'}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          iconName="X"
          iconSize={16}
        />
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Preview */}
        <div className="flex items-center justify-center p-6 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: formData?.color }}
            >
              <Icon name={formData?.iconName} size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {formData?.name || 'Nombre de la categoría'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {formData?.description || 'Descripción de la categoría'}
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Información Básica</h3>
          
          <Input
            label="Nombre de la Categoría"
            type="text"
            placeholder="Ej: Comida, Bebidas, Servicios"
            value={formData?.name}
            onChange={(e) => handleInputChange('name', e?.target?.value)}
            error={errors?.name}
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Descripción
            </label>
            <textarea
              placeholder="Describe qué tipo de productos o servicios incluye esta categoría"
              value={formData?.description}
              onChange={(e) => handleInputChange('description', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={3}
              required
            />
            {errors?.description && (
              <p className="text-sm text-destructive">{errors?.description}</p>
            )}
          </div>

          <Select
            label="Tipo de Negocio"
            options={businessTypeOptions}
            value={formData?.businessType}
            onChange={(value) => handleInputChange('businessType', value)}
            error={errors?.businessType}
            required
          />
        </div>

        {/* Visual Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Configuración Visual</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Icono
              </label>
              <select
                value={formData?.iconName}
                onChange={(e) => handleInputChange('iconName', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {iconOptions?.map(option => (
                  <option key={option?.value} value={option?.value}>
                    {option?.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {colorOptions?.map(option => (
                  <button
                    key={option?.value}
                    type="button"
                    onClick={() => handleInputChange('color', option?.value)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData?.color === option?.value ? 'border-foreground' : 'border-border'
                    }`}
                    style={{ backgroundColor: option?.color }}
                    title={option?.label}
                  />
                ))}
              </div>
              <Input
                type="color"
                value={formData?.color}
                onChange={(e) => handleInputChange('color', e?.target?.value)}
                className="w-full h-8"
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Estado</h3>
          
          <Checkbox
            label="Categoría activa"
            checked={formData?.isActive}
            onChange={(e) => handleInputChange('isActive', e?.target?.checked)}
            description="Las categorías inactivas no aparecerán en los formularios"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="default"
            loading={isLoading}
            iconName="Save"
            iconPosition="left"
          >
            {category ? 'Actualizar Categoría' : 'Crear Categoría'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;