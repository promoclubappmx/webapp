import React, { useState, useEffect } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import BusinessSelector from '../../../components/BusinessSelector';
import CatalogItemSelector from '../../../components/ui/CatalogItemSelector';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { supabase } from '../../../lib/supabase';

const PromotionForm = ({ promotion = null, onSave, onCancel, isLoading = false }) => {
  const { formatPrice, currencySettings } = useCurrency();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '21:00',
    usageLimit: '',
    targetDays: [],
    targetAudience: 'all',
    minPurchaseAmount: '',
    maxDiscountAmount: '',
    isRecurring: false,
    recurringType: 'weekly',
    status: 'draft',
    categoryId: '',
    businessType: 'product',
    imageUrl: '',
    imagePath: '',
    businessId: 'all',
    catalogItemIds: [] // NEW: Selected catalog items
  });

  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageSource, setImageSource] = useState('custom'); // 'product' | 'custom'
  const [productImageUrl, setProductImageUrl] = useState(null);

  // Mock categories data (in a real app, this would come from an API)
  const [categories] = useState([
    { value: 'cat1', label: 'Comida', type: 'product' },
    { value: 'cat2', label: 'Bebidas', type: 'product' },
    { value: 'cat3', label: 'Servicios', type: 'service' },
    { value: 'cat4', label: 'Eventos', type: 'service' }
  ]);

  useEffect(() => {
    if (promotion) {
      setFormData({
        ...promotion,
        startDate: promotion?.startDate ? new Date(promotion.startDate)?.toISOString()?.split('T')?.[0] : '',
        endDate: promotion?.endDate ? new Date(promotion.endDate)?.toISOString()?.split('T')?.[0] : '',
        targetDays: promotion?.targetDays || [],
        categoryId: promotion?.categoryId || '',
        businessType: promotion?.businessType || 'product',
        imageUrl: promotion?.imageUrl || '',
        imagePath: promotion?.imagePath || '',
        businessId: promotion?.businessId || 'all',
        catalogItemIds: promotion?.catalogItemIds || [] // NEW: Load existing selections
      });
      
      if (promotion?.imageUrl) {
        setImagePreview(promotion?.imageUrl);
      }
    }
  }, [promotion]);

  // Fetch first selected catalog item's image when catalogItemIds changes
  useEffect(() => {
    const fetchProductImage = async () => {
      if (formData?.catalogItemIds?.length > 0) {
        try {
          const { data } = await supabase
            ?.from('catalog_items')
            ?.select('image_url, name')
            ?.eq('id', formData?.catalogItemIds?.[0])
            ?.single();
          setProductImageUrl(data?.image_url || null);
        } catch {
          setProductImageUrl(null);
        }
      } else {
        setProductImageUrl(null);
        if (imageSource === 'product') {
          setImageSource('custom');
        }
      }
    };
    fetchProductImage();
  }, [formData?.catalogItemIds]);

  const discountTypeOptions = [
    { value: 'percentage', label: 'Porcentaje (%)' },
    { value: 'fixed', label: `Cantidad fija (${currencySettings?.currencySymbol || '$'})` },
    { value: 'buy_one_get_one', label: '2x1 (Compra 1, lleva 2)' },
    { value: 'bulk_discount', label: 'Descuento por volumen' }
  ];

  const targetAudienceOptions = [
    { value: 'all', label: 'Todos los clientes' },
    { value: 'new', label: 'Clientes nuevos' },
    { value: 'returning', label: 'Clientes recurrentes' },
    { value: 'vip', label: 'Clientes VIP' }
  ];

  const recurringTypeOptions = [
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' },
    { value: 'seasonal', label: 'Estacional' }
  ];

  const businessTypeOptions = [
    { value: 'product', label: 'Producto' },
    { value: 'service', label: 'Servicio' }
  ];

  const daysOfWeek = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miércoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
    { value: 'sábado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' }
  ];

  // Filter categories based on business type
  const filteredCategories = categories?.filter(cat => cat?.type === formData?.businessType);

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

    // Reset category when business type changes
    if (field === 'businessType') {
      setFormData(prev => ({
        ...prev,
        categoryId: ''
      }));
    }
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      targetDays: prev?.targetDays?.includes(day)
        ? prev?.targetDays?.filter(d => d !== day)
        : [...prev?.targetDays, day]
    }));
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

  const uploadImageToSupabase = async (file) => {
    // Simulate Supabase storage upload
    setUploadingImage(true);
    
    try {
      // In a real implementation, this would upload to Supabase storage
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock URL and path
      const fileName = `promotion_${Date.now()}_${file?.name}`;
      const imagePath = `promotions/${fileName}`;
      const imageUrl = `https://via.placeholder.com/400x300?text=${encodeURIComponent(formData?.title || 'Promoción')}`;
      
      return { imageUrl, imagePath };
    } catch (error) {
      throw new Error('Error al subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const decimalPlaces = currencySettings?.decimalPlaces ?? 2;
    const decimalRegex = new RegExp(`^\\d+(\\.\\d{0,${decimalPlaces}})?$`);

    if (!formData?.title?.trim()) {
      newErrors.title = 'El título es obligatorio';
    }

    if (!formData?.description?.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }

    if (!formData?.discountValue && formData?.discountValue !== 0) {
      newErrors.discountValue = 'El valor del descuento es obligatorio';
    } else {
      const val = parseFloat(formData?.discountValue);
      if (isNaN(val) || val < 0) {
        newErrors.discountValue = 'El descuento no puede ser negativo';
      } else if (val === 0) {
        newErrors.discountValue = 'El valor del descuento debe ser mayor a 0';
      } else if (formData?.discountType === 'percentage') {
        if (val > 100) newErrors.discountValue = 'El porcentaje no puede ser mayor a 100%';
        if (val < 0.01) newErrors.discountValue = 'El porcentaje mínimo es 0.01%';
        const pctRegex = /^\d+(\.\d{0,2})?$/;
        if (!pctRegex?.test(String(formData?.discountValue))) {
          newErrors.discountValue = 'Máximo 2 decimales para porcentaje';
        }
      } else if (formData?.discountType === 'fixed') {
        if (val < 0.01) newErrors.discountValue = `El monto mínimo es ${formatPrice(0.01)}`;
        if (!decimalRegex?.test(String(formData?.discountValue))) {
          newErrors.discountValue = `Máximo ${decimalPlaces} decimales permitidos`;
        }
      }
    }

    if (formData?.minPurchaseAmount) {
      const minVal = parseFloat(formData?.minPurchaseAmount);
      if (isNaN(minVal) || minVal < 0) {
        newErrors.minPurchaseAmount = 'La compra mínima no puede ser negativa';
      } else if (!decimalRegex?.test(String(formData?.minPurchaseAmount))) {
        newErrors.minPurchaseAmount = `Máximo ${decimalPlaces} decimales permitidos`;
      }
    }

    if (formData?.maxDiscountAmount) {
      const maxVal = parseFloat(formData?.maxDiscountAmount);
      if (isNaN(maxVal) || maxVal < 0) {
        newErrors.maxDiscountAmount = 'El descuento máximo no puede ser negativo';
      } else if (!decimalRegex?.test(String(formData?.maxDiscountAmount))) {
        newErrors.maxDiscountAmount = `Máximo ${decimalPlaces} decimales permitidos`;
      } else if (formData?.discountValue && maxVal < parseFloat(formData?.discountValue)) {
        newErrors.maxDiscountAmount = 'El descuento máximo debe ser mayor al valor del descuento';
      }
    }

    if (!formData?.startDate) {
      newErrors.startDate = 'La fecha de inicio es obligatoria';
    }

    if (!formData?.endDate) {
      newErrors.endDate = 'La fecha de fin es obligatoria';
    }

    if (formData?.startDate && formData?.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    if (formData?.usageLimit && formData?.usageLimit <= 0) {
      newErrors.usageLimit = 'El límite de uso debe ser mayor a 0';
    }

    if (!formData?.businessType) {
      newErrors.businessType = 'Selecciona el tipo de negocio';
    }

    if (!formData?.businessId) {
      newErrors.businessId = 'Selecciona el negocio donde aplicar la promoción';
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
          {promotion ? 'Editar Promoción' : 'Nueva Promoción'}
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
          
          <BusinessSelector
            label="Aplicar a"
            value={formData?.businessId}
            onChange={(value) => handleInputChange('businessId', value)}
            error={errors?.businessId}
            required
          />
          
          <Input
            label="Título de la Promoción"
            type="text"
            placeholder="Ej: Descuento de Verano 2024"
            value={formData?.title}
            onChange={(e) => handleInputChange('title', e?.target?.value)}
            error={errors?.title}
            required
          />

          <Input
            label="Descripción"
            type="text"
            placeholder="Describe los detalles de la promoción"
            value={formData?.description}
            onChange={(e) => handleInputChange('description', e?.target?.value)}
            error={errors?.description}
            required
          />

          {/* Image Upload Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              Imagen de la Promoción
            </label>

            {/* Image source selector - only show when a catalog item is selected */}
            {formData?.catalogItemIds?.length > 0 && (
              <div className="flex gap-2 p-1 bg-muted rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setImageSource('product');
                    if (productImageUrl) {
                      setImagePreview(productImageUrl);
                      setFormData(prev => ({ ...prev, imageUrl: productImageUrl }));
                    }
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    imageSource === 'product' ?'bg-card shadow text-foreground' :'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon name="Package" size={15} />
                  Usar imagen del producto
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImageSource('custom');
                    setImagePreview(null);
                    setImageFile(null);
                    setFormData(prev => ({ ...prev, imageUrl: '', imagePath: '' }));
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    imageSource === 'custom' ?'bg-card shadow text-foreground' :'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon name="Upload" size={15} />
                  Imagen personalizada
                </button>
              </div>
            )}

            {/* Product image preview */}
            {imageSource === 'product' && formData?.catalogItemIds?.length > 0 && (
              <div className="rounded-lg border border-border overflow-hidden">
                {productImageUrl ? (
                  <div className="relative">
                    <img
                      src={productImageUrl}
                      alt="Imagen del producto"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-3 py-1.5 flex items-center gap-1.5">
                      <Icon name="Package" size={12} />
                      Imagen del producto/servicio seleccionado
                    </div>
                  </div>
                ) : (
                  <div className="h-32 flex flex-col items-center justify-center bg-muted/50 text-muted-foreground gap-2">
                    <Icon name="ImageOff" size={28} />
                    <p className="text-sm">El producto seleccionado no tiene imagen</p>
                    <button
                      type="button"
                      onClick={() => setImageSource('custom')}
                      className="text-xs text-primary underline"
                    >
                      Subir imagen personalizada
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Custom image upload - shown when imageSource is 'custom' or no catalog items selected */}
            {(imageSource === 'custom' || formData?.catalogItemIds?.length === 0) && (
              <>
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
              </>
            )}
            
            {errors?.image && (
              <p className="text-sm text-destructive">{errors?.image}</p>
            )}
          </div>
        </div>

        {/* Category and Type Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Categoría y Tipo</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Tipo de Negocio"
              options={businessTypeOptions}
              value={formData?.businessType}
              onChange={(value) => handleInputChange('businessType', value)}
            />

            <Select
              label="Categoría"
              options={filteredCategories}
              value={formData?.categoryId}
              onChange={(value) => handleInputChange('categoryId', value)}
              placeholder="Selecciona una categoría"
            />
          </div>

          {/* NEW: Catalog Item Selector */}
          <CatalogItemSelector
            selectedItems={formData?.catalogItemIds}
            onChange={(items) => handleInputChange('catalogItemIds', items)}
            businessType={formData?.businessType}
            categoryId={formData?.categoryId}
            label="Productos/Servicios Aplicables"
            description="Selecciona los productos o servicios donde se aplicará esta promoción (opcional: dejar vacío para aplicar a todos)"
          />
        </div>

        {/* Discount Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Configuración del Descuento</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Tipo de Descuento"
              options={discountTypeOptions}
              value={formData?.discountType}
              onChange={(value) => handleInputChange('discountType', value)}
            />

            <Input
              label="Valor del Descuento"
              type="number"
              placeholder={formData?.discountType === 'percentage' ? '10' : '5.00'}
              value={formData?.discountValue}
              onChange={(e) => handleInputChange('discountValue', e?.target?.value)}
              error={errors?.discountValue}
              required
              helperText={formData?.discountType === 'percentage' ? 'Entre 0.01% y 100%' : `Mínimo ${formatPrice(0.01)}`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={`Compra Mínima (${currencySettings?.currencySymbol || '$'})`}
              type="number"
              placeholder="0.00"
              value={formData?.minPurchaseAmount}
              onChange={(e) => handleInputChange('minPurchaseAmount', e?.target?.value)}
              error={errors?.minPurchaseAmount}
              description="Opcional: monto mínimo para aplicar el descuento"
            />

            {formData?.discountType === 'percentage' && (
              <Input
                label={`Descuento Máximo (${currencySettings?.currencySymbol || '$'})`}
                type="number"
                placeholder="50.00"
                value={formData?.maxDiscountAmount}
                onChange={(e) => handleInputChange('maxDiscountAmount', e?.target?.value)}
                error={errors?.maxDiscountAmount}
                description="Opcional: límite máximo del descuento"
              />
            )}
          </div>
        </div>

        {/* Schedule Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Programación</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Fecha de Inicio"
              type="date"
              value={formData?.startDate}
              onChange={(e) => handleInputChange('startDate', e?.target?.value)}
              error={errors?.startDate}
              required
            />

            <Input
              label="Fecha de Fin"
              type="date"
              value={formData?.endDate}
              onChange={(e) => handleInputChange('endDate', e?.target?.value)}
              error={errors?.endDate}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Hora de Inicio"
              type="time"
              value={formData?.startTime}
              onChange={(e) => handleInputChange('startTime', e?.target?.value)}
            />

            <Input
              label="Hora de Fin"
              type="time"
              value={formData?.endTime}
              onChange={(e) => handleInputChange('endTime', e?.target?.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Días de la Semana (Opcional)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {daysOfWeek?.map(day => (
                <Checkbox
                  key={day?.value}
                  label={day?.label}
                  checked={formData?.targetDays?.includes(day?.value)}
                  onChange={() => handleDayToggle(day?.value)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Opciones Avanzadas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Audiencia Objetivo"
              options={targetAudienceOptions}
              value={formData?.targetAudience}
              onChange={(value) => handleInputChange('targetAudience', value)}
            />

            <Input
              label="Límite de Uso"
              type="number"
              placeholder="100"
              value={formData?.usageLimit}
              onChange={(e) => handleInputChange('usageLimit', e?.target?.value)}
              error={errors?.usageLimit}
              description="Opcional: número máximo de usos"
            />
          </div>

          <Checkbox
            label="Promoción Recurrente"
            checked={formData?.isRecurring}
            onChange={(e) => handleInputChange('isRecurring', e?.target?.checked)}
            description="La promoción se repetirá automáticamente"
          />

          {formData?.isRecurring && (
            <Select
              label="Tipo de Recurrencia"
              options={recurringTypeOptions}
              value={formData?.recurringType}
              onChange={(value) => handleInputChange('recurringType', value)}
            />
          )}
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
            iconName="Send"
            iconPosition="left"
          >
            {uploadingImage ? 'Subiendo imagen...' : promotion ? 'Actualizar Promoción' : 'Crear Promoción'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PromotionForm;