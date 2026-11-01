import React, { useState, useEffect, useRef } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const CatalogItemForm = ({ item = null, onSave, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    itemType: 'producto',
    status: 'draft',
    images: [],
    sku: '',
    inventory: '',
    ingredients: [],
    allergens: [],
    nutritionalInfo: {
      calories: '',
      protein: '',
      carbs: '',
      fat: ''
    },
    preparationTime: '',
    serviceDetails: {
      duration: '',
      minPeople: '',
      maxPeople: '',
      includes: []
    },
    featured: false
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [ingredientInput, setIngredientInput] = useState('');
  const [allergenInput, setAllergenInput] = useState('');
  const [includeInput, setIncludeInput] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        nutritionalInfo: item?.nutritionalInfo || {
          calories: '',
          protein: '',
          carbs: '',
          fat: ''
        },
        serviceDetails: item?.serviceDetails || {
          duration: '',
          minPeople: '',
          maxPeople: '',
          includes: []
        },
        ingredients: item?.ingredients || [],
        allergens: item?.allergens || []
      });
      setImagePreview(item?.images || []);
    }
  }, [item]);

  const categoryOptions = [
    { value: 'platos-principales', label: 'Platos Principales' },
    { value: 'entrantes', label: 'Entrantes' },
    { value: 'postres', label: 'Postres' },
    { value: 'bebidas', label: 'Bebidas' },
    { value: 'bebidas-alcoholicas', label: 'Bebidas Alcohólicas' },
    { value: 'menu-infantil', label: 'Menú Infantil' },
    { value: 'servicios', label: 'Servicios' },
    { value: 'eventos', label: 'Eventos' },
    { value: 'catering', label: 'Catering' },
    { value: 'otros', label: 'Otros' }
  ];

  const itemTypeOptions = [
    { value: 'producto', label: 'Producto' },
    { value: 'servicio', label: 'Servicio' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Activo' },
    { value: 'draft', label: 'Borrador' }
  ];

  const commonAllergens = [
    'Gluten', 'Huevos', 'Lácteos', 'Frutos secos', 'Cacahuetes', 
    'Soja', 'Pescado', 'Mariscos', 'Apio', 'Mostaza', 'Sésamo', 'Sulfitos'
  ];

  const handleInputChange = (field, value) => {
    if (field?.includes('.')) {
      const [parent, child] = field?.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev?.[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleImageClick = () => {
    fileInputRef?.current?.click();
  };

  const handleImageChange = async (event) => {
    const files = Array.from(event?.target?.files || []);
    if (files?.length === 0) return;

    setImageUploading(true);
    
    try {
      const newImages = [];
      
      for (const file of files) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes?.includes(file?.type)) {
          continue;
        }

        // Validate file size (5MB max)
        if (file?.size > 5 * 1024 * 1024) {
          continue;
        }

        // Create preview
        const reader = new FileReader();
        const imageData = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
        
        newImages?.push(imageData);
      }

      setImagePreview(prev => [...prev, ...newImages]);
      setFormData(prev => ({
        ...prev,
        images: [...prev?.images, ...newImages]
      }));

    } catch (error) {
      console.error('Error uploading images:', error);
      setErrors(prev => ({
        ...prev,
        images: 'Error al subir las imágenes'
      }));
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setImagePreview(prev => prev?.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev?.images?.filter((_, i) => i !== index)
    }));
  };

  const handleAddIngredient = () => {
    if (ingredientInput?.trim()) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev?.ingredients, ingredientInput?.trim()]
      }));
      setIngredientInput('');
    }
  };

  const handleRemoveIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev?.ingredients?.filter((_, i) => i !== index)
    }));
  };

  const handleAddAllergen = (allergen) => {
    if (!formData?.allergens?.includes(allergen)) {
      setFormData(prev => ({
        ...prev,
        allergens: [...prev?.allergens, allergen]
      }));
    }
  };

  const handleRemoveAllergen = (allergen) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev?.allergens?.filter(a => a !== allergen)
    }));
  };

  const handleAddInclude = () => {
    if (includeInput?.trim()) {
      setFormData(prev => ({
        ...prev,
        serviceDetails: {
          ...prev?.serviceDetails,
          includes: [...prev?.serviceDetails?.includes, includeInput?.trim()]
        }
      }));
      setIncludeInput('');
    }
  };

  const handleRemoveInclude = (index) => {
    setFormData(prev => ({
      ...prev,
      serviceDetails: {
        ...prev?.serviceDetails,
        includes: prev?.serviceDetails?.includes?.filter((_, i) => i !== index)
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData?.description?.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }

    if (!formData?.price || formData?.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (!formData?.category) {
      newErrors.category = 'La categoría es obligatoria';
    }

    if (!formData?.sku?.trim()) {
      newErrors.sku = 'El SKU es obligatorio';
    }

    if (formData?.itemType === 'producto' && formData?.inventory && formData?.inventory < 0) {
      newErrors.inventory = 'El inventario no puede ser negativo';
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
    <div className="bg-card border border-border rounded-lg p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          {item ? 'Editar Elemento' : 'Nuevo Elemento'}
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
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Información Básica</h3>
          
          <Input
            label="Nombre"
            type="text"
            placeholder="Ej: Paella Valenciana"
            value={formData?.name}
            onChange={(e) => handleInputChange('name', e?.target?.value)}
            error={errors?.name}
            required
          />

          <Input
            label="Descripción"
            type="text"
            placeholder="Describe el producto o servicio"
            value={formData?.description}
            onChange={(e) => handleInputChange('description', e?.target?.value)}
            error={errors?.description}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Precio (€)"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData?.price}
              onChange={(e) => handleInputChange('price', e?.target?.value)}
              error={errors?.price}
              required
            />

            <Select
              label="Categoría"
              options={categoryOptions}
              value={formData?.category}
              onChange={(value) => handleInputChange('category', value)}
              error={errors?.category}
              required
            />

            <Select
              label="Tipo"
              options={itemTypeOptions}
              value={formData?.itemType}
              onChange={(value) => handleInputChange('itemType', value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="SKU"
              type="text"
              placeholder="Ej: PAE001"
              value={formData?.sku}
              onChange={(e) => handleInputChange('sku', e?.target?.value)}
              error={errors?.sku}
              required
            />

            <Select
              label="Estado"
              options={statusOptions}
              value={formData?.status}
              onChange={(value) => handleInputChange('status', value)}
            />
          </div>

          <Checkbox
            label="Elemento Destacado"
            checked={formData?.featured}
            onChange={(e) => handleInputChange('featured', e?.target?.checked)}
            description="Aparecerá destacado en la aplicación"
          />
        </div>

        {/* Image Upload Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Imágenes</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {imagePreview?.map((image, index) => (
              <div key={index} className="relative group">
                <img 
                  src={image} 
                  alt={`Preview ${index + 1}`} 
                  className="w-full h-24 object-cover rounded-lg border border-border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveImage(index)}
                  iconName="X"
                  iconSize={12}
                />
              </div>
            ))}
            
            <div 
              className="w-full h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
              onClick={handleImageClick}
            >
              {imageUploading ? (
                <Icon name="Loader2" size={20} className="text-muted-foreground animate-spin" />
              ) : (
                <div className="text-center">
                  <Icon name="ImagePlus" size={20} className="text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">Añadir</p>
                </div>
              )}
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />
          
          <p className="text-xs text-muted-foreground">
            Sube hasta 5 imágenes. Formatos: JPG, PNG, WebP. Max: 5MB cada una.
          </p>
        </div>

        {/* Product-specific fields */}
        {formData?.itemType === 'producto' && (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Información del Producto</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Inventario"
                  type="number"
                  placeholder="0"
                  value={formData?.inventory}
                  onChange={(e) => handleInputChange('inventory', e?.target?.value)}
                  error={errors?.inventory}
                />

                <Input
                  label="Tiempo de Preparación (min)"
                  type="number"
                  placeholder="0"
                  value={formData?.preparationTime}
                  onChange={(e) => handleInputChange('preparationTime', e?.target?.value)}
                />
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Ingredientes
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    type="text"
                    placeholder="Añadir ingrediente"
                    value={ingredientInput}
                    onChange={(e) => setIngredientInput(e?.target?.value)}
                    onKeyPress={(e) => e?.key === 'Enter' && (e?.preventDefault(), handleAddIngredient())}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddIngredient}
                    iconName="Plus"
                    iconSize={14}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData?.ingredients?.map((ingredient, index) => (
                    <span 
                      key={index}
                      className="bg-muted text-muted-foreground px-2 py-1 rounded text-sm flex items-center gap-1"
                    >
                      {ingredient}
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(index)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Icon name="X" size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Allergens */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Alérgenos
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                  {commonAllergens?.map(allergen => (
                    <Checkbox
                      key={allergen}
                      label={allergen}
                      checked={formData?.allergens?.includes(allergen)}
                      onChange={() => 
                        formData?.allergens?.includes(allergen)
                          ? handleRemoveAllergen(allergen)
                          : handleAddAllergen(allergen)
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Nutritional Info */}
              <div>
                <h4 className="text-md font-medium text-foreground mb-2">Información Nutricional</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Input
                    label="Calorías"
                    type="number"
                    placeholder="0"
                    value={formData?.nutritionalInfo?.calories}
                    onChange={(e) => handleInputChange('nutritionalInfo.calories', e?.target?.value)}
                  />
                  <Input
                    label="Proteínas (g)"
                    type="number"
                    placeholder="0"
                    value={formData?.nutritionalInfo?.protein}
                    onChange={(e) => handleInputChange('nutritionalInfo.protein', e?.target?.value)}
                  />
                  <Input
                    label="Carbohidratos (g)"
                    type="number"
                    placeholder="0"
                    value={formData?.nutritionalInfo?.carbs}
                    onChange={(e) => handleInputChange('nutritionalInfo.carbs', e?.target?.value)}
                  />
                  <Input
                    label="Grasas (g)"
                    type="number"
                    placeholder="0"
                    value={formData?.nutritionalInfo?.fat}
                    onChange={(e) => handleInputChange('nutritionalInfo.fat', e?.target?.value)}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Service-specific fields */}
        {formData?.itemType === 'servicio' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Detalles del Servicio</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Duración"
                type="text"
                placeholder="Ej: 2-3 horas"
                value={formData?.serviceDetails?.duration}
                onChange={(e) => handleInputChange('serviceDetails.duration', e?.target?.value)}
              />
              <Input
                label="Mín. Personas"
                type="number"
                placeholder="1"
                value={formData?.serviceDetails?.minPeople}
                onChange={(e) => handleInputChange('serviceDetails.minPeople', e?.target?.value)}
              />
              <Input
                label="Máx. Personas"
                type="number"
                placeholder="100"
                value={formData?.serviceDetails?.maxPeople}
                onChange={(e) => handleInputChange('serviceDetails.maxPeople', e?.target?.value)}
              />
            </div>

            {/* Service Includes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Qué Incluye
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  type="text"
                  placeholder="Ej: Mesa preferente"
                  value={includeInput}
                  onChange={(e) => setIncludeInput(e?.target?.value)}
                  onKeyPress={(e) => e?.key === 'Enter' && (e?.preventDefault(), handleAddInclude())}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddInclude}
                  iconName="Plus"
                  iconSize={14}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {formData?.serviceDetails?.includes?.map((include, index) => (
                  <span 
                    key={index}
                    className="bg-muted text-muted-foreground px-2 py-1 rounded text-sm flex items-center gap-1"
                  >
                    {include}
                    <button
                      type="button"
                      onClick={() => handleRemoveInclude(index)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Icon name="X" size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

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
            type="button"
            variant="secondary"
            onClick={() => handleInputChange('status', 'draft')}
            disabled={isLoading}
            iconName="Save"
            iconPosition="left"
          >
            Guardar Borrador
          </Button>
          <Button
            type="submit"
            variant="default"
            loading={isLoading}
            iconName="Save"
            iconPosition="left"
          >
            {item ? 'Actualizar Elemento' : 'Crear Elemento'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CatalogItemForm;