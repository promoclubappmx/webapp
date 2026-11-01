import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import TabGeneral from './tabs/TabGeneral';
import TabDatosProducto from './tabs/TabDatosProducto';
import TabMedios from './tabs/TabMedios';
import TabPaquete from './tabs/TabPaquete';
import TabInventario from './tabs/TabInventario';
import TabAtributosAdicionales from './tabs/TabAtributosAdicionales';
import TabVisibilidad from './tabs/TabVisibilidad';
import Button from '../../../components/ui/Button';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import { Link } from 'react-router-dom';


const ProductForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('datos-producto');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [touched, setTouched] = useState({});
  const [suppliers, setSuppliers] = useState([]);
  const [successMessage, setSuccessMessage] = useState(false);
  const [tabErrors, setTabErrors] = useState({}); // per-tab error messages

  // Establishments
  const [establishments, setEstablishments] = useState([]);
  const [loadingEstablishments, setLoadingEstablishments] = useState(false);

  const isEditMode = id && id !== 'new';
  const itemType = searchParams?.get('type') || 'products';

  const [formData, setFormData] = useState({
    productOrService: '',
    itemType: '',
    selectedBusinesses: [],
    visibilityEstablishments: [],
    businessLocationId: '', // establishment this product belongs to
    name: '',
    slug: '',
    status: 'draft',
    visibility: 'public',
    sku: '',
    barcode: '',
    shortDescription: '',
    longDescription: '',
    categories: [],
    regularPrice: '',
    salePrice: '',
    saleDateStart: '',
    saleDateEnd: '',
    unitPrice: '',
    unitType: '',
    priceType: 'fixed',
    manageInventory: false,
    stockQuantity: '',
    lowStockThreshold: '',
    outOfStockPolicy: 'block',
    soldIndividually: false,
    minPurchaseQuantity: '',
    maxPurchaseQuantity: '',
    minStockLevel: '',
    maxStockLevel: '',
    optimalStockLevel: '',
    purchaseCost: '',
    supplierId: '',
    lotNumber: '',
    expiryDate: '',
    warehouseLocation: '',
    taxRegion: 'general',
    inventoryTaxes: [],
    locationStocks: [],
    enableSaleOffer: false,
    attributes: [],
    variants: [],
    defaultVariant: null,
    deliveryType: 'in_store',
    preparationTime: '',
    preparationTimeUnit: 'minutes',
    maxDeliveryRadius: '',
    requiresAppointment: false,
    deliveryNotes: '',
    relatedProducts: [],
    crossSellProducts: [],
    includedInBundles: [],
    linkedPromotion: null,
    linkedCoupon: null,
    accumulatesPoints: false,
    pointsAmount: '',
    customAttributes: [],
    purchaseNote: '',
    menuPosition: '',
    reviewsEnabled: true,
    ageRestriction: false,
    minAge: 18,
    timeRestriction: false,
    availableTimeSlots: [],
    mainImage: null,
    mainImageAlt: '',
    gallery: [],
    videoUrl: '',
    bundleProducts: [],
    tags: [],
    metaTitle: '',
    metaDescription: '',
    focusKeyword: '',
    schemaType: 'Product',
    indexable: true,
  });

  const tabs = [
    { 
      id: 'datos-producto', 
      label: formData?.itemType === 'bundle' ?'Datos del paquete' 
        : (formData?.productOrService === 'service' ? 'Datos del servicio' : 'Datos del producto'), 
      icon: 'FileText',
      visible: !!(formData?.productOrService && formData?.itemType)
    },
    { 
      id: 'medios', 
      label: 'Medios', 
      icon: 'Image',
      visible: !!(formData?.productOrService && formData?.itemType)
    },
    { 
      id: 'precios', 
      label: 'Precios', 
      icon: 'DollarSign',
      visible: !!(formData?.productOrService && formData?.itemType)
    },
    { 
      id: 'inventario', 
      label: 'Inventario', 
      icon: 'Package',
      visible: !!(formData?.productOrService && formData?.itemType) && formData?.manageInventory && formData?.productOrService !== 'service' && formData?.itemType !== 'bundle'
    },
    { 
      id: 'visibilidad', 
      label: 'Visibilidad', 
      icon: 'Eye',
      visible: !!(formData?.productOrService && formData?.itemType) && !formData?.manageInventory
    },
    { 
      id: 'variantes', 
      label: 'Variantes', 
      icon: 'Grid3X3',
      visible: formData?.itemType === 'variable'
    },
    { 
      id: 'servicio', 
      label: 'Servicio/Entrega', 
      icon: 'Truck',
      visible: formData?.productOrService === 'service' || formData?.itemType === 'service'
    },
    { 
      id: 'paquete', 
      label: 'Componentes del paquete', 
      icon: 'Package2',
      visible: formData?.itemType === 'bundle'
    },
    { 
      id: 'vinculacion', 
      label: 'Vinculación', 
      icon: 'Link',
      visible: !!(formData?.productOrService && formData?.itemType)
    },
    { 
      id: 'atributos', 
      label: 'Atributos adicionales', 
      icon: 'Tag',
      visible: !!(formData?.productOrService && formData?.itemType)
    },
    { 
      id: 'avanzado', 
      label: 'Avanzado', 
      icon: 'Settings',
      visible: !!(formData?.productOrService && formData?.itemType)
    }
  ];

  const getVisibleTabs = () => {
    return tabs?.filter(tab => tab?.visible);
  };

  // Load establishments
  useEffect(() => {
    if (!user?.id) return;
    const fetchEstablishments = async () => {
      setLoadingEstablishments(true);
      try {
        const { data, error } = await supabase
          ?.from('business_locations')
          ?.select('id, location_name, branch_name, location_code, is_active')
          ?.eq('business_id', user?.id)
          ?.eq('is_active', true)
          ?.order('location_name');
        if (!error) setEstablishments(data || []);
      } catch (err) {
        console.error('Error fetching establishments:', err);
      } finally {
        setLoadingEstablishments(false);
      }
    };
    fetchEstablishments();
  }, [user?.id]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const { data, error } = await supabase?.from('suppliers')?.select('id, name')?.eq('user_id', user?.id)?.eq('is_active', true)?.order('name');
        if (!error) setSuppliers(data || []);
      } catch (err) {
        console.error('Error fetching suppliers:', err);
      }
    };

    if (user?.id) {
      fetchSuppliers();
    }
  }, [user?.id]);

  // Load existing item in edit mode
  useEffect(() => {
    if (!isEditMode || !user?.id) return;
    const loadItem = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          ?.from('catalog_items')
          ?.select('*')
          ?.eq('id', id)
          ?.eq('user_id', user?.id)
          ?.single();
        if (error) throw error;
        if (!data) return;
        const meta = data?.metadata || {};
        setFormData(prev => ({
          ...prev,
          productOrService: data?.business_type || '',
          itemType: meta?.itemType || '',
          selectedBusinesses: meta?.selectedBusinesses || [],
          businessLocationId: data?.business_location_id || '',
          name: data?.name || '',
          slug: meta?.slug || '',
          status: data?.status || 'draft',
          visibility: meta?.visibility || 'public',
          sku: data?.sku || '',
          barcode: data?.barcode || '',
          shortDescription: meta?.shortDescription || '',
          longDescription: data?.description || '',
          categories: data?.category_id ? [data?.category_id] : [],
          regularPrice: data?.price != null ? String(data?.price) : '',
          salePrice: meta?.salePrice || '',
          saleDateStart: meta?.saleDateStart || '',
          saleDateEnd: meta?.saleDateEnd || '',
          unitPrice: '',
          unitType: meta?.unitType || '',
          priceType: meta?.priceType || 'fixed',
          taxRates: meta?.taxRates || [],
          taxRegion: meta?.taxRegion || 'general',
          manageInventory: meta?.manageInventory || false,
          stockQuantity: data?.stock_quantity != null ? String(data?.stock_quantity) : '',
          lowStockThreshold: meta?.lowStockThreshold || '',
          outOfStockPolicy: meta?.outOfStockPolicy || 'block',
          soldIndividually: meta?.soldIndividually || false,
          minPurchaseQuantity: meta?.minPurchaseQuantity || '',
          maxPurchaseQuantity: meta?.maxPurchaseQuantity || '',
          minStockLevel: data?.min_stock_level != null ? String(data?.min_stock_level) : '',
          maxStockLevel: data?.max_stock_level != null ? String(data?.max_stock_level) : '',
          optimalStockLevel: meta?.optimalStockLevel || '',
          purchaseCost: data?.cost != null ? String(data?.cost) : '',
          supplierId: meta?.supplierId || '',
          lotNumber: meta?.lotNumber || '',
          expiryDate: meta?.expiryDate || '',
          warehouseLocation: meta?.warehouseLocation || '',
          taxRegion: meta?.taxRegion || 'general',
          inventoryTaxes: meta?.inventoryTaxes || [],
          locationStocks: meta?.locationStocks || [],
          visibilityEstablishments: meta?.visibilityEstablishments || [],
          enableSaleOffer: meta?.enableSaleOffer || false,
          attributes: meta?.attributes || [],
          variants: meta?.variants || [],
          defaultVariant: meta?.defaultVariant || null,
          deliveryType: meta?.deliveryType || 'in_store',
          preparationTime: meta?.preparationTime || '',
          preparationTimeUnit: meta?.preparationTimeUnit || 'minutes',
          maxDeliveryRadius: meta?.maxDeliveryRadius || '',
          requiresAppointment: meta?.requiresAppointment || false,
          deliveryNotes: meta?.deliveryNotes || '',
          relatedProducts: meta?.relatedProducts || [],
          crossSellProducts: meta?.crossSellProducts || [],
          includedInBundles: meta?.includedInBundles || [],
          linkedPromotion: meta?.linkedPromotion || null,
          linkedCoupon: meta?.linkedCoupon || null,
          accumulatesPoints: meta?.accumulatesPoints || false,
          pointsAmount: meta?.pointsAmount || '',
          customAttributes: meta?.customAttributes || [],
          purchaseNote: meta?.purchaseNote || null,
          menuPosition: meta?.menuPosition || null,
          reviewsEnabled: meta?.reviewsEnabled !== false,
          ageRestriction: meta?.ageRestriction || false,
          minAge: meta?.minAge || 18,
          timeRestriction: data?.time_restriction || meta?.timeRestriction || false,
          availableTimeSlots: data?.available_time_slots || meta?.availableTimeSlots || [],
          mainImage: data?.image_url || null,
          mainImageAlt: meta?.mainImageAlt || '',
          gallery: meta?.gallery || [],
          videoUrl: meta?.videoUrl || '',
          bundleProducts: meta?.bundleProducts || [],
          tags: (data?.tags || [])?.map((name, i) => ({ id: `tag-${i}`, name, slug: name?.toLowerCase()?.replace(/\s+/g, '-'), color: '#6b7280' })),
          metaTitle: meta?.metaTitle || '',
          metaDescription: meta?.metaDescription || '',
          focusKeyword: meta?.focusKeyword || '',
          schemaType: meta?.schemaType || 'Product',
          indexable: meta?.indexable !== false,
        }));
      } catch (err) {
        console.error('Error loading item:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadItem();
  }, [isEditMode, id, user?.id]);

  useEffect(() => {
    if (formData?.name && !isEditMode) {
      const slug = formData?.name?.toLowerCase()?.normalize('NFD')?.replace(/[\u0300-\u036f]/g, '')?.replace(/[^a-z0-9]+/g, '-')?.replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData?.name, isEditMode]);

  const validateField = (field, value) => {
    let error = '';
    switch (field) {
      case 'productOrService':
        if (!value) error = 'Debes seleccionar qué deseas agregar';
        break;
      case 'itemType':
        if (!value) error = 'Debes seleccionar el tipo de ítem';
        break;
      case 'businessLocationId':
        if (!value) error = 'Debes seleccionar un establecimiento';
        break;
      case 'name':
        if (!value?.trim()) error = 'El nombre es obligatorio';
        else if (value?.length < 3) error = 'El nombre debe tener al menos 3 caracteres';
        break;
      case 'status':
        if (!value) error = 'El estado es obligatorio';
        break;
      case 'visibility':
        if (!value) error = 'La visibilidad es obligatoria';
        break;
      case 'shortDescription':
        if (!value?.trim()) error = 'La descripción corta es obligatoria';
        else if (value?.length > 160) error = 'La descripción corta no puede exceder 160 caracteres';
        break;
      case 'categories':
        if (!value || value?.length === 0) error = 'Debes seleccionar al menos una categoría';
        break;
      case 'tags':
        if (!value || value?.length === 0) error = 'Debes agregar al menos una etiqueta';
        break;
      case 'taxRates':
        if (!value || value?.length === 0) error = 'Debes seleccionar al menos una tasa de IVA';
        break;
      case 'regularPrice':
        if (!value || parseFloat(value) <= 0) error = 'El precio regular es obligatorio y debe ser mayor a 0';
        break;
      case 'unitType':
        if (!value || !value?.trim()) error = 'El tipo de unidad es obligatorio';
        break;
      case 'salePrice':
        if (value && parseFloat(value) >= parseFloat(formData?.regularPrice)) error = 'El precio de oferta debe ser menor al precio regular';
        break;
      case 'stockQuantity':
        if (formData?.manageInventory && (!value || parseInt(value) < 0)) error = 'El stock debe ser un número válido mayor o igual a 0';
        break;
      case 'pointsAmount':
        if (formData?.accumulatesPoints && (!value || parseInt(value) <= 0)) error = 'La cantidad de puntos debe ser mayor a 0';
        break;
      case 'bundleProducts':
        if (formData?.itemType === 'bundle' && (!value || value?.length === 0)) error = 'Debes agregar al menos un producto al paquete';
        break;
      case 'mainImage':
        if (!value) error = 'La imagen principal es obligatoria';
        break;
      case 'purchaseCost':
        if (formData?.manageInventory && (!value || parseFloat(value) <= 0)) error = 'El costo de compra unitario es obligatorio';
        break;
      case 'supplierId':
        if (formData?.manageInventory && !value) error = 'El proveedor asociado es obligatorio';
        break;
      case 'minStockLevel':
        if (formData?.manageInventory && (value === '' || value === null || value === undefined)) error = 'El stock mínimo es obligatorio';
        break;
      case 'optimalStockLevel':
        if (formData?.manageInventory && (value === '' || value === null || value === undefined)) error = 'El stock óptimo es obligatorio';
        break;
      case 'maxStockLevel':
        if (formData?.manageInventory && (value === '' || value === null || value === undefined)) error = 'El stock máximo es obligatorio';
        break;
    }
    return error;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    let error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    let error = validateField(field, formData?.[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // Validate fields for a specific tab, return error map
  const validateTabFields = (tabId) => {
    const newErrors = {};
    const markTouched = {};

    if (tabId === 'datos-producto') {
      const fields = ['name', 'status', 'visibility', 'shortDescription', 'categories', 'tags', 'unitType'];
      fields?.forEach(field => {
        const err = validateField(field, formData?.[field]);
        if (err) newErrors[field] = err;
        markTouched[field] = true;
      });
    }

    if (tabId === 'medios') {
      const err = validateField('mainImage', formData?.mainImage);
      if (err) newErrors.mainImage = err;
      markTouched.mainImage = true;
    }

    if (tabId === 'precios') {
      const fields = ['taxRates', 'regularPrice'];
      fields?.forEach(field => {
        const err = validateField(field, formData?.[field]);
        if (err) newErrors[field] = err;
        markTouched[field] = true;
      });
    }

    if (tabId === 'inventario') {
      if (formData?.manageInventory) {
        ['purchaseCost', 'supplierId', 'minStockLevel', 'optimalStockLevel', 'maxStockLevel']?.forEach(field => {
          const err = validateField(field, formData?.[field]);
          if (err) newErrors[field] = err;
          markTouched[field] = true;
        });
      }
    }

    if (tabId === 'paquete') {
      const err = validateField('bundleProducts', formData?.bundleProducts);
      if (err) newErrors.bundleProducts = err;
      markTouched.bundleProducts = true;
    }

    setTouched(prev => ({ ...prev, ...markTouched }));
    setErrors(prev => ({ ...prev, ...newErrors }));
    return newErrors;
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['productOrService', 'itemType', 'businessLocationId', 'name', 'status', 'visibility', 'shortDescription', 'categories', 'tags', 'taxRates', 'regularPrice', 'unitType'];
    requiredFields?.forEach(field => {
      let error = validateField(field, formData?.[field]);
      if (error) newErrors[field] = error;
    });
    if (formData?.manageInventory) {
      ['purchaseCost', 'supplierId', 'minStockLevel', 'optimalStockLevel', 'maxStockLevel']?.forEach(field => {
        let error = validateField(field, formData?.[field]);
        if (error) newErrors[field] = error;
      });
    }
    if (formData?.accumulatesPoints) {
      const pointsError = validateField('pointsAmount', formData?.pointsAmount);
      if (pointsError) newErrors.pointsAmount = pointsError;
    }
    if (formData?.itemType === 'bundle') {
      const bundleError = validateField('bundleProducts', formData?.bundleProducts);
      if (bundleError) newErrors.bundleProducts = bundleError;
    }
    const imageError = validateField('mainImage', formData?.mainImage);
    if (imageError) newErrors.mainImage = imageError;
    setErrors(newErrors);
    const allTouched = {};
    Object.keys(formData)?.forEach(key => { allTouched[key] = true; });
    setTouched(allTouched);
    return { isValid: Object.keys(newErrors)?.length === 0, newErrors };
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    const { isValid, newErrors } = validateForm();
    if (!isValid) {
      const errorFields = Object.keys(newErrors);
      if (errorFields?.includes('businessLocationId')) {
        // scroll to top to show establishment error
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (errorFields?.includes('name') || errorFields?.includes('shortDescription') || errorFields?.includes('categories') || errorFields?.includes('tags') || errorFields?.includes('unitType')) {
        setActiveTab('datos-producto');
      } else if (errorFields?.includes('regularPrice') || errorFields?.includes('salePrice') || errorFields?.includes('taxRates')) {
        setActiveTab('precios');
      } else if (errorFields?.includes('stockQuantity') || errorFields?.includes('purchaseCost') || errorFields?.includes('supplierId') || errorFields?.includes('minStockLevel')) {
        setActiveTab('inventario');
      } else if (errorFields?.includes('bundleProducts')) {
        setActiveTab('paquete');
      } else if (errorFields?.includes('mainImage')) {
        setActiveTab('medios');
      }
      return;
    }

    setIsLoading(true);
    try {
      const tagNames = (formData?.tags || [])?.map(t => t?.name || t)?.filter(Boolean);

      const itemPayload = {
        name: formData?.name,
        description: formData?.longDescription || formData?.shortDescription || null,
        business_type: formData?.productOrService || null,
        category_id: formData?.categories?.[0] || null,
        price: formData?.regularPrice ? parseFloat(formData?.regularPrice) : null,
        cost: formData?.purchaseCost ? parseFloat(formData?.purchaseCost) : null,
        sku: formData?.sku || null,
        barcode: formData?.barcode || null,
        image_url: formData?.mainImage || null,
        status: 'active',
        stock_quantity: formData?.stockQuantity !== '' && formData?.stockQuantity !== undefined ? parseInt(formData?.stockQuantity) : 0,
        min_stock_level: formData?.minStockLevel !== '' && formData?.minStockLevel !== undefined ? parseInt(formData?.minStockLevel) : 0,
        max_stock_level: formData?.maxStockLevel !== '' && formData?.maxStockLevel !== undefined ? parseInt(formData?.maxStockLevel) : null,
        tags: tagNames?.length > 0 ? tagNames : null,
        user_id: user?.id,
        business_location_id: formData?.businessLocationId || null,
        metadata: {
          slug: formData?.slug || null,
          visibility: formData?.visibility || 'public',
          shortDescription: formData?.shortDescription || null,
          mainImageAlt: formData?.mainImageAlt || '',
          gallery: formData?.gallery || [],
          videoUrl: formData?.videoUrl || '',
          itemType: formData?.itemType || null,
          selectedBusinesses: formData?.selectedBusinesses || [],
          salePrice: formData?.salePrice || null,
          saleDateStart: formData?.saleDateStart || null,
          saleDateEnd: formData?.saleDateEnd || null,
          enableSaleOffer: formData?.enableSaleOffer || false,
          unitType: formData?.unitType || null,
          priceType: formData?.priceType || 'fixed',
          taxRates: formData?.taxRates || [],
          taxRegion: formData?.taxRegion || 'general',
          manageInventory: formData?.manageInventory || false,
          lowStockThreshold: formData?.lowStockThreshold || null,
          outOfStockPolicy: formData?.outOfStockPolicy || 'block',
          soldIndividually: formData?.soldIndividually || false,
          minPurchaseQuantity: formData?.minPurchaseQuantity || null,
          maxPurchaseQuantity: formData?.maxPurchaseQuantity || null,
          optimalStockLevel: formData?.optimalStockLevel || null,
          supplierId: formData?.supplierId || null,
          lotNumber: formData?.lotNumber || null,
          expiryDate: formData?.expiryDate || null,
          warehouseLocation: formData?.warehouseLocation || null,
          inventoryTaxes: formData?.inventoryTaxes || [],
          locationStocks: formData?.locationStocks || [],
          visibilityEstablishments: formData?.visibilityEstablishments || [],
          deliveryType: formData?.deliveryType || 'in_store',
          preparationTime: formData?.preparationTime || null,
          preparationTimeUnit: formData?.preparationTimeUnit || 'minutes',
          maxDeliveryRadius: formData?.maxDeliveryRadius || null,
          requiresAppointment: formData?.requiresAppointment || false,
          deliveryNotes: formData?.deliveryNotes || null,
          relatedProducts: formData?.relatedProducts || [],
          crossSellProducts: formData?.crossSellProducts || [],
          includedInBundles: formData?.includedInBundles || [],
          linkedPromotion: formData?.linkedPromotion || null,
          linkedCoupon: formData?.linkedCoupon || null,
          accumulatesPoints: formData?.accumulatesPoints || false,
          pointsAmount: formData?.pointsAmount || null,
          customAttributes: formData?.customAttributes || [],
          purchaseNote: formData?.purchaseNote || null,
          menuPosition: formData?.menuPosition || null,
          reviewsEnabled: formData?.reviewsEnabled !== false,
          ageRestriction: formData?.ageRestriction || false,
          minAge: formData?.minAge || 18,
          timeRestriction: formData?.timeRestriction || false,
          availableTimeSlots: formData?.availableTimeSlots || [],
          bundleProducts: formData?.bundleProducts || [],
          attributes: formData?.attributes || [],
          variants: formData?.variants || [],
          defaultVariant: formData?.defaultVariant || null,
          metaTitle: formData?.metaTitle || null,
          metaDescription: formData?.metaDescription || null,
          focusKeyword: formData?.focusKeyword || null,
          schemaType: formData?.schemaType || 'Product',
          indexable: formData?.indexable !== false,
        },
        updated_at: new Date()?.toISOString(),
        time_restriction: formData?.timeRestriction || false,
        available_time_slots: formData?.availableTimeSlots?.length > 0 ? formData?.availableTimeSlots : [],
      };

      let savedItem;
      if (isEditMode) {
        const { data, error } = await supabase
          ?.from('catalog_items')
          ?.update(itemPayload)
          ?.eq('id', id)
          ?.eq('user_id', user?.id)
          ?.select()
          ?.single();
        if (error) throw error;
        savedItem = data;
      } else {
        const { data, error } = await supabase
          ?.from('catalog_items')
          ?.insert({ ...itemPayload, created_at: new Date()?.toISOString() })
          ?.select()
          ?.single();
        if (error) throw error;
        savedItem = data;
      }

      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
        navigate('/catalog-management');
      }, 2500);
    } catch (error) {
      console.error('Error saving product:', error);
      alert(`Error al guardar: ${error?.message || 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/catalog-management');
  };

  const handleNextTab = () => {
    // Validate current tab before advancing
    const tabErrors = validateTabFields(activeTab);
    if (Object.keys(tabErrors)?.length > 0) {
      // Stay on current tab — errors are shown
      return;
    }

    const visibleTabs = getVisibleTabs();
    const currentIndex = visibleTabs?.findIndex(tab => tab?.id === activeTab);
    if (currentIndex < visibleTabs?.length - 1) setActiveTab(visibleTabs?.[currentIndex + 1]?.id);
  };

  const handlePreviousTab = () => {
    const visibleTabs = getVisibleTabs();
    const currentIndex = visibleTabs?.findIndex(tab => tab?.id === activeTab);
    if (currentIndex > 0) setActiveTab(visibleTabs?.[currentIndex - 1]?.id);
  };

  const getItemTypeOptions = () => {
    if (formData?.productOrService === 'product') {
      return [
        { value: 'simple', label: 'Producto simple', description: 'Un artículo con precio fijo', icon: 'Package' },
        { value: 'bundle', label: 'Paquete/Bundle', description: 'Conjunto de ítems con precio especial', icon: 'Package2' }
      ];
    } else {
      return [
        { value: 'service', label: 'Servicio', description: 'Sin inventario, sin envío', icon: 'Wrench' },
        { value: 'bundle', label: 'Paquete/Bundle', description: 'Conjunto de servicios con precio especial', icon: 'Package2' }
      ];
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'datos-producto':
        return (
          <TabGeneral
            formData={formData}
            errors={errors}
            touched={touched}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
        );
      case 'precios':
        return (
          <TabDatosProducto
            formData={formData}
            errors={errors}
            touched={touched}
            onChange={handleInputChange}
            onBlur={handleBlur}
            activeSubTab="precios"
            onSave={handleSave}
            isLoading={isLoading}
          />
        );
      case 'inventario':
        return (
          <TabInventario
            formData={formData}
            errors={errors}
            touched={touched}
            onChange={handleInputChange}
            onBlur={handleBlur}
            suppliers={suppliers}
          />
        );
      case 'variantes':
        return (
          <TabVariantes
            formData={formData}
            errors={errors}
            touched={touched}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
        );
      case 'servicio':
        return (
          <TabDatosProducto
            formData={formData}
            errors={errors}
            touched={touched}
            onChange={handleInputChange}
            onBlur={handleBlur}
            activeSubTab="servicio"
            onSave={handleSave}
            isLoading={isLoading}
          />
        );
      case 'paquete':
        return (
          <TabPaquete
            formData={formData}
            errors={errors}
            touched={touched}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
        );
      case 'vinculacion':
        return (
          <TabDatosProducto
            formData={formData}
            errors={errors}
            touched={touched}
            onChange={handleInputChange}
            onBlur={handleBlur}
            activeSubTab="vinculacion"
            onSave={handleSave}
            isLoading={isLoading}
          />
        );
      case 'visibilidad':
        return (
          <TabVisibilidad
            formData={formData}
            onChange={handleInputChange}
          />
        );
      case 'atributos':
        return (
          <TabAtributosAdicionales
            formData={formData}
            onChange={handleInputChange}
          />
        );
      case 'avanzado':
        return (
          <TabDatosProducto
            formData={formData}
            errors={errors}
            touched={touched}
            onChange={handleInputChange}
            onBlur={handleBlur}
            activeSubTab="avanzado"
            onSave={handleSave}
            isLoading={isLoading}
          />
        );
      case 'medios':
        return (
          <TabMedios
            formData={formData}
            errors={errors}
            touched={touched}
            onChange={handleInputChange}
            onBlur={handleBlur}
            isLoading={isLoading}
          />
        );
      case 'costo':
        return null;
      default:
        return null;
    }
  };

  const breadcrumbItems = [
    { label: 'Catálogo', href: '/catalog-management' },
    { label: isEditMode ? 'Editar Producto o Servicio' : 'Nuevo Producto o Servicio' }
  ];

  const selectedEstablishment = establishments?.find(e => e?.id === formData?.businessLocationId);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar onClose={() => setSidebarOpen(false)} user={user} />
      <main className="flex-1 overflow-y-auto pt-16 transition-all duration-500 ease-in-out lg:ml-72">
        <Header user={user} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="p-6">

          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbItems} />

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isEditMode ? 'Editar Producto o Servicio' : 'Nuevo Producto o Servicio'}
              </h1>
              <p className="text-muted-foreground">
                {isEditMode ? 'Actualiza la información del producto o servicio' : 'Completa la información del nuevo producto o servicio'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                onClick={handleSave}
                disabled={isLoading}
                iconName={isLoading ? 'Loader2' : 'Save'}
                iconPosition="left"
              >
                {isLoading ? 'Guardando...' : (formData?.productOrService === 'service' ? 'Guardar Servicio' : 'Guardar Producto')}
              </Button>
            </div>
          </div>

          {/* Product or Service Selector — only shown in create mode */}
          {!isEditMode && (
          <div className="bg-card rounded-lg border border-border p-6 mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-1">
              ¿Qué deseas agregar? <span className="text-red-500">*</span>
            </h3>
            {touched?.productOrService && errors?.productOrService && (
              <p className="text-xs text-red-500 mb-2">{errors?.productOrService}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => {
                  handleInputChange('productOrService', 'product');
                  handleInputChange('itemType', '');
                }}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  formData?.productOrService === 'product' ?'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                }`}
              >
                <Icon name="Package" size={24} className="mb-2 text-primary" />
                <h4 className="font-semibold text-foreground mb-1">Producto</h4>
                <p className="text-xs text-muted-foreground">Artículos físicos con inventario y envío</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleInputChange('productOrService', 'service');
                  handleInputChange('itemType', '');
                }}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  formData?.productOrService === 'service' ?'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                }`}
              >
                <Icon name="Wrench" size={24} className="mb-2 text-primary" />
                <h4 className="font-semibold text-foreground mb-1">Servicio</h4>
                <p className="text-xs text-muted-foreground">Servicios sin inventario físico</p>
              </button>
            </div>

            {/* Item Type Selector — only visible after selecting Producto/Servicio */}
            {formData?.productOrService && (
              <>
                <h3 className="text-lg font-semibold text-foreground mb-1 mt-6">
                  Tipo de Ítem <span className="text-red-500">*</span>
                </h3>
                {touched?.itemType && errors?.itemType && (
                  <p className="text-xs text-red-500 mb-2">{errors?.itemType}</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getItemTypeOptions()?.map(type => (
                    <button
                      key={type?.value}
                      type="button"
                      onClick={() => handleInputChange('itemType', type?.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData?.itemType === type?.value
                          ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                      }`}
                    >
                      <Icon name={type?.icon} size={24} className="mb-2 text-primary" />
                      <h4 className="font-semibold text-foreground mb-1">{type?.label}</h4>
                      <p className="text-xs text-muted-foreground">{type?.description}</p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          )}

          {/* Tabs — visible when both productOrService and itemType are selected, or always in edit mode */}
          {!!(formData?.productOrService && formData?.itemType) && (
          <div className="bg-card rounded-lg border border-border">
            <div className="flex items-center gap-2 border-b border-border p-2 overflow-x-auto">
              {getVisibleTabs()?.map(tab => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === tab?.id
                      ? 'bg-primary text-white' :'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  <span className="text-sm font-medium">{tab?.label}</span>
                </button>
              ))}
            </div>

            <div className="p-6">
              {renderTabContent()}
            </div>

            {/* Tab Navigation Buttons */}
            <div className="flex items-center justify-between border-t border-border p-4">
              <Button
                variant="outline"
                onClick={handlePreviousTab}
                disabled={activeTab === getVisibleTabs()?.[0]?.id}
                iconName="ChevronLeft"
                iconPosition="left"
              >
                Anterior
              </Button>
              {activeTab === 'avanzado' ? (
                <Button
                  variant="default"
                  onClick={handleSave}
                  disabled={isLoading}
                  iconName={isLoading ? 'Loader2' : 'Save'}
                  iconPosition="left"
                >
                  {isLoading ? 'Guardando...' : (formData?.productOrService === 'service' ? 'Guardar Servicio' : 'Guardar Producto')}
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={handleNextTab}
                  iconName="ChevronRight"
                  iconPosition="right"
                >
                  Siguiente
                </Button>
              )}
            </div>
          </div>
          )}
        </div>
      </main>

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom-4">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Icon name="CheckCircle" size={20} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm">
              {formData?.productOrService === 'service' ? 'Servicio' : 'Producto'} {isEditMode ? 'actualizado' : 'creado'} exitosamente
            </p>
            <p className="text-xs text-green-100">Redirigiendo al catálogo...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Inline TabVariantes component for variable products using catalog-settings attributes
const TabVariantes = ({ formData, onChange }) => {
  const { user } = useAuth();
  const [catalogAttributes, setCatalogAttributes] = useState([]);
  const [loadingAttrs, setLoadingAttrs] = useState(false);
  const [selectedAttrs, setSelectedAttrs] = useState([]);

  const mockAttributes = [
    { id: 1, name: 'Talla', slug: 'talla', type: 'select', values: ['S', 'M', 'L', 'XL'] },
    { id: 2, name: 'Color', slug: 'color', type: 'select', values: ['Rojo', 'Azul', 'Verde', 'Negro'] },
    { id: 3, name: 'Sabor', slug: 'sabor', type: 'select', values: ['Chocolate', 'Vainilla', 'Fresa'] },
    { id: 4, name: 'Calorías', slug: 'calorias', type: 'text', values: [] }
  ];

  useEffect(() => {
    const fetchAttributes = async () => {
      setLoadingAttrs(true);
      try {
        const { data, error } = await supabase?.from('product_attributes')?.select('*')?.eq('business_id', user?.id)?.order('name');
        if (!error && data?.length > 0) {
          setCatalogAttributes(data);
        } else {
          setCatalogAttributes(mockAttributes);
        }
      } catch {
        setCatalogAttributes(mockAttributes);
      } finally {
        setLoadingAttrs(false);
      }
    };
    if (user?.id) fetchAttributes();
    else setCatalogAttributes(mockAttributes);
  }, [user?.id]);

  const toggleAttr = (attr) => {
    const exists = selectedAttrs?.find(a => a?.id === attr?.id);
    if (exists) {
      setSelectedAttrs(prev => prev?.filter(a => a?.id !== attr?.id));
    } else {
      setSelectedAttrs(prev => [...prev, { ...attr, selectedValues: [...(attr?.values || [])] }]);
    }
  };

  const toggleAttrValue = (attrId, value) => {
    setSelectedAttrs(prev => prev?.map(a => {
      if (a?.id !== attrId) return a;
      const has = a?.selectedValues?.includes(value);
      return { ...a, selectedValues: has ? a?.selectedValues?.filter(v => v !== value) : [...a?.selectedValues, value] };
    }));
  };

  const generateVariants = () => {
    if (selectedAttrs?.length === 0) return [];
    const combinations = selectedAttrs?.reduce((acc, attr) => {
      if (acc?.length === 0) return attr?.selectedValues?.map(v => ({ [attr?.name]: v }));
      return acc?.flatMap(combo => attr?.selectedValues?.map(v => ({ ...combo, [attr?.name]: v })));
    }, []);
    return combinations;
  };

  const variants = generateVariants();

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-1">Atributos del catálogo</h4>
        <p className="text-xs text-muted-foreground mb-4">
          Selecciona los atributos configurados en <a href="/catalog-settings?tab=attributes" className="text-primary hover:underline">Ajustes del Catálogo</a> para generar variantes automáticamente.
        </p>

        {loadingAttrs ? (
          <div className="flex items-center gap-2 text-muted-foreground py-4">
            <Icon name="Loader2" size={16} className="animate-spin" />
            <span className="text-sm">Cargando atributos...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {catalogAttributes?.map(attr => {
              const isSelected = selectedAttrs?.find(a => a?.id === attr?.id);
              return (
                <div key={attr?.id} className={`border rounded-lg p-4 transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      checked={!!isSelected}
                      onChange={() => toggleAttr(attr)}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <span className="text-sm font-medium text-foreground">{attr?.name}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{attr?.type === 'select' ? 'Selección' : 'Texto'}</span>
                  </div>
                  {isSelected && attr?.values?.length > 0 && (
                    <div className="ml-7 flex flex-wrap gap-2">
                      {attr?.values?.map(val => {
                        const selAttr = selectedAttrs?.find(a => a?.id === attr?.id);
                        const isValSelected = selAttr?.selectedValues?.includes(val);
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => toggleAttrValue(attr?.id, val)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                              isValSelected ? 'bg-primary text-white border-primary' : 'bg-background text-foreground border-border hover:border-primary'
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {variants?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">
            Tabla de variantes generadas ({variants?.length})
          </h4>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {selectedAttrs?.map(a => (
                    <th key={a?.id} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{a?.name}</th>
                  ))}
                  <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Precio</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Stock</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">SKU</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {variants?.map((combo, idx) => (
                  <tr key={idx} className="hover:bg-muted/30">
                    {selectedAttrs?.map(a => (
                      <td key={a?.id} className="px-4 py-2 text-foreground font-medium">{combo?.[a?.name]}</td>
                    ))}
                    <td className="px-4 py-2">
                      <input type="number" placeholder="0.00" className="w-24 px-2 py-1 border border-border rounded bg-background text-foreground text-xs" />
                    </td>
                    <td className="px-4 py-2">
                      <input type="number" placeholder="0" className="w-20 px-2 py-1 border border-border rounded bg-background text-foreground text-xs" />
                    </td>
                    <td className="px-4 py-2">
                      <input type="text" placeholder={`VAR-${idx + 1}`} className="w-28 px-2 py-1 border border-border rounded bg-background text-foreground text-xs" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedAttrs?.length === 0 && (
        <div className="border border-dashed border-border rounded-xl p-8 text-center">
          <Icon name="Grid3X3" size={32} className="mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">Selecciona atributos para generar variantes automáticamente</p>
          <p className="text-xs text-muted-foreground mt-1">
            Puedes configurar más atributos en{' '}
            <a href="/catalog-settings?tab=attributes" className="text-primary hover:underline">Ajustes del Catálogo → Atributos</a>
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductForm;