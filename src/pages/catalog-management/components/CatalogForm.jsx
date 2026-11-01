import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const CatalogForm = ({ item = null, categories = [], businessType = 'product', onSave, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    businessType: businessType,
    categoryId: '',
    price: '',
    cost: '',
    sku: '',
    barcode: '',
    imageUrl: '',
    imagePath: '',
    status: 'draft',
    isFeatured: false,
    stockQuantity: '',
    minStockLevel: '',
    maxStockLevel: '',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    tags: []
  });

  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        categoryId: item?.categoryId || '',
        price: item?.price || '',
        cost: item?.cost || '',
        stockQuantity: item?.stockQuantity || '',
        minStockLevel: item?.minStockLevel || '',
        maxStockLevel: item?.maxStockLevel || '',
        weight: item?.weight || '',
        dimensions: item?.dimensions || { length: '', width: '', height: '' },
        tags: item?.tags || []
      });
      
      if (item?.imageUrl) {
        setImagePreview(item?.imageUrl);
      }
    } else {
      setFormData(prev => ({ ...prev, businessType }));
    }
  }, [item, businessType]);

  const statusOptions = [
    { value: 'draft', label: 'Borrador' },
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'discontinued', label: 'Descontinuado' }
  ];

  // Filter categories by business type
  const filteredCategories = categories?.filter(cat => cat?.businessType === formData?.businessType) || [];
  const categoryOptions = filteredCategories?.map(cat => ({ value: cat?.id, label: cat?.name }));

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

  const handleImageSelect = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      // Validate file type
      if (!file?.type?.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          image: 'Por favor selecciona un archivo de imagen válido'
        }));
        return;
      }

      // Validate file size (5MB max)
      if (file?.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: 'El archivo no puede ser mayor a 5MB'
        }));
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e?.target?.result);
      };
      reader?.readAsDataURL(file);

      // Clear any previous errors
      setErrors(prev => ({
        ...prev,
        image: ''
      }));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      imageUrl: '',
      imagePath: ''
    }));
  };

  const handleAddTag = () => {
    if (tagInput?.trim() && !formData?.tags?.includes(tagInput?.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev?.tags, tagInput?.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev?.tags?.filter(tag => tag !== tagToRemove)
    }));
  };

  const uploadImageToSupabase = async (file) => {
    setUploadingImage(true);
    
    try {
      // In a real implementation, this would upload to Supabase storage
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock URL and path
      const fileName = `catalog_${Date.now()}_${file?.name}`;
      const imagePath = `catalog/${fileName}`;
      const imageUrl = `https://via.placeholder.com/400x300?text=${encodeURIComponent(formData?.name || 'Producto')}`;
      
      return { imageUrl, imagePath };
    } catch (error) {
      throw new Error('Error al subir la imagen');
    } finally {
      setUploadingImage(false);
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

    if (formData?.price && formData?.price < 0) {
      newErrors.price = 'El precio no puede ser negativo';
    }

    if (formData?.businessType === 'product') {
      if (formData?.cost && formData?.cost < 0) {
        newErrors.cost = 'El costo no puede ser negativo';
      }

      if (formData?.stockQuantity && formData?.stockQuantity < 0) {
        newErrors.stockQuantity = 'La cantidad en stock no puede ser negativa';
      }

      if (formData?.minStockLevel && formData?.minStockLevel < 0) {
        newErrors.minStockLevel = 'El nivel mínimo de stock no puede ser negativo';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;

    try {
      let finalFormData = { ...formData };

      // Upload image if a new one was selected
      if (imageFile) {
        const { imageUrl, imagePath } = await uploadImageToSupabase(imageFile);
        finalFormData = {
          ...finalFormData,
          imageUrl,
          imagePath
        };
      }

      // Convert string numbers to actual numbers
      finalFormData = {
        ...finalFormData,
        price: formData?.price ? parseFloat(formData?.price) : null,
        cost: formData?.cost ? parseFloat(formData?.cost) : null,
        stockQuantity: formData?.stockQuantity ? parseInt(formData?.stockQuantity) : 0,
        minStockLevel: formData?.minStockLevel ? parseInt(formData?.minStockLevel) : 0,
        maxStockLevel: formData?.maxStockLevel ? parseInt(formData?.maxStockLevel) : null,
        weight: formData?.weight ? parseFloat(formData?.weight) : null
      };

      onSave(finalFormData);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        image: error?.message || 'Error al procesar la imagen'
      }));
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          {item ? `Editar ${businessType === 'product' ? 'Producto' : 'Servicio'}` : `Nuevo ${businessType === 'product' ? 'Producto' : 'Servicio'}`}
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
            placeholder={`Nombre del ${businessType === 'product' ? 'producto' : 'servicio'}`}
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
              placeholder="Describe detalladamente el producto o servicio"
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
            label="Categoría"
            options={categoryOptions}
            value={formData?.categoryId}
            onChange={(value) => handleInputChange('categoryId', value)}
            placeholder="Selecciona una categoría"
          />

          {/* Image Upload Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              Imagen
            </label>
            
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="w-full h-48 object-cover rounded-lg border border-border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2"
                  iconName="X"
                  iconSize={16}
                >
                  Quitar
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Icon name="Upload" size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Arrastra una imagen aquí o haz clic para seleccionar
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  Seleccionar Imagen
                </Button>
              </div>
            )}
            
            {errors?.image && (
              <p className="text-sm text-destructive">{errors?.image}</p>
            )}
          </div>
        </div>

        {/* Pricing and Inventory */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Precios y Stock</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Precio de Venta (€)"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData?.price}
              onChange={(e) => handleInputChange('price', e?.target?.value)}
              error={errors?.price}
            />

            {businessType === 'product' && (
              <Input
                label="Costo (€)"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData?.cost}
                onChange={(e) => handleInputChange('cost', e?.target?.value)}
                error={errors?.cost}
                description="Costo de adquisición o producción"
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="SKU"
              type="text"
              placeholder="Ej: PROD001"
              value={formData?.sku}
              onChange={(e) => handleInputChange('sku', e?.target?.value)}
              description="Código único del producto"
            />

            {businessType === 'product' && (
              <Input
                label="Código de Barras"
                type="text"
                placeholder="Ej: 1234567890123"
                value={formData?.barcode}
                onChange={(e) => handleInputChange('barcode', e?.target?.value)}
              />
            )}
          </div>

          {businessType === 'product' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Cantidad en Stock"
                type="number"
                placeholder="0"
                value={formData?.stockQuantity}
                onChange={(e) => handleInputChange('stockQuantity', e?.target?.value)}
                error={errors?.stockQuantity}
              />

              <Input
                label="Stock Mínimo"
                type="number"
                placeholder="5"
                value={formData?.minStockLevel}
                onChange={(e) => handleInputChange('minStockLevel', e?.target?.value)}
                error={errors?.minStockLevel}
                description="Nivel de reorden"
              />

              <Input
                label="Stock Máximo"
                type="number"
                placeholder="100"
                value={formData?.maxStockLevel}
                onChange={(e) => handleInputChange('maxStockLevel', e?.target?.value)}
                description="Nivel máximo de inventario"
              />
            </div>
          )}
        </div>

        {/* Physical Properties (for products) */}
        {businessType === 'product' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Propiedades Físicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Peso (kg)"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData?.weight}
                onChange={(e) => handleInputChange('weight', e?.target?.value)}
              />

              <Input
                label="Largo (cm)"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={formData?.dimensions?.length}
                onChange={(e) => handleInputChange('dimensions.length', e?.target?.value)}
              />

              <Input
                label="Ancho (cm)"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={formData?.dimensions?.width}
                onChange={(e) => handleInputChange('dimensions.width', e?.target?.value)}
              />

              <Input
                label="Alto (cm)"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={formData?.dimensions?.height}
                onChange={(e) => handleInputChange('dimensions.height', e?.target?.value)}
              />
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Etiquetas</h3>
          
          <div className="flex gap-2">
            <Input
              placeholder="Agregar etiqueta"
              value={tagInput}
              onChange={(e) => setTagInput(e?.target?.value)}
              onKeyPress={(e) => {
                if (e?.key === 'Enter') {
                  e?.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddTag}
              iconName="Plus"
              iconSize={16}
            />
          </div>

          {formData?.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData?.tags?.map(tag => (
                <span key={tag} className="bg-muted px-2 py-1 rounded-md text-sm flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-muted-foreground hover:text-foreground ml-1"
                  >
                    <Icon name="X" size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Status and Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Estado y Opciones</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Estado"
              options={statusOptions}
              value={formData?.status}
              onChange={(value) => handleInputChange('status', value)}
            />

            <div className="flex items-center pt-6">
              <Checkbox
                label="Producto destacado"
                checked={formData?.isFeatured}
                onChange={(e) => handleInputChange('isFeatured', e?.target?.checked)}
                description="Aparecerá en secciones destacadas"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading || uploadingImage}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleInputChange('status', 'draft')}
            disabled={isLoading || uploadingImage}
            iconName="Save"
            iconPosition="left"
          >
            Guardar Borrador
          </Button>
          <Button
            type="submit"
            variant="default"
            loading={isLoading || uploadingImage}
            iconName="Save"
            iconPosition="left"
          >
            {uploadingImage ? 'Subiendo imagen...' : item ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CatalogForm;