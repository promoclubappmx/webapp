import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Components
import CatalogCard from './components/CatalogCard';
import CatalogForm from './components/CatalogForm';
import CategoryForm from './components/CategoryForm';
import CatalogFilters from './components/CatalogFilters';
import CatalogStats from './components/CatalogStats';
import RoleGuard from '../../components/ui/RoleGuard';


const CatalogManagement = () => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('products');

  const user = {
    id: authUser?.id || 1,
    name: authUser?.user_metadata?.full_name || "Admin",
    email: authUser?.email || "",
    role: "owner"
  };

  // Categories from Supabase
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Catalog items from Supabase
  const [catalogItems, setCatalogItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const [establishments, setEstablishments] = useState([]);
  const [loadingEstablishments, setLoadingEstablishments] = useState(false);

  // Load establishments from Supabase
  useEffect(() => {
    const fetchEstablishments = async () => {
      if (!authUser?.id) return;
      setLoadingEstablishments(true);
      try {
        // Get business_id from user_profiles
        const { data: profile } = await supabase
          ?.from('user_profiles')
          ?.select('user_id')
          ?.eq('id', authUser?.id)
          ?.single();

        const businessId = profile?.user_id || authUser?.id;

        const { data, error } = await supabase
          ?.from('business_locations')
          ?.select('id, location_name, location_code, is_active')
          ?.eq('business_id', businessId)
          ?.eq('is_active', true)
          ?.order('location_name', { ascending: true });
        if (error) throw error;
        setEstablishments(data || []);
      } catch (err) {
        console.error('Error loading establishments:', err);
        setEstablishments([]);
      } finally {
        setLoadingEstablishments(false);
      }
    };
    fetchEstablishments();
  }, [authUser?.id]);

  // Load categories from Supabase
  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      let query = supabase
        ?.from('categories')
        ?.select('id, name, description, icon_name, color, business_type, is_active')
        ?.eq('is_active', true)
        ?.order('name', { ascending: true });

      if (authUser?.id) {
        query = query?.eq('user_id', authUser?.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      const mapped = (data || [])?.map(cat => ({
        id: cat?.id,
        name: cat?.name,
        description: cat?.description,
        businessType: cat?.business_type,
        iconName: cat?.icon_name,
        color: cat?.color,
        isActive: cat?.is_active,
        itemCount: 0
      }));
      setCategories(mapped);
    } catch (err) {
      console.error('Error loading categories:', err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, [authUser?.id]);

  // Load catalog items from Supabase
  const fetchCatalogItems = useCallback(async () => {
    setLoadingItems(true);
    try {
      let query = supabase
        ?.from('catalog_items')
        ?.select('id, name, description, business_type, category_id, price, cost, sku, barcode, image_url, image_path, status, is_featured, stock_quantity, min_stock_level, weight, tags, metadata, business_location_id, created_at, updated_at')
        ?.order('created_at', { ascending: false });

      if (authUser?.id) {
        query = query?.eq('user_id', authUser?.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      const mapped = (data || [])?.map(item => ({
        id: item?.id,
        name: item?.name,
        description: item?.description,
        businessType: item?.business_type,
        categoryId: item?.category_id,
        categoryName: '',
        price: item?.price,
        cost: item?.cost,
        sku: item?.sku,
        barcode: item?.barcode,
        imageUrl: item?.image_url,
        imagePath: item?.image_path,
        status: item?.status || 'draft',
        isFeatured: item?.is_featured || false,
        stockQuantity: item?.stock_quantity || 0,
        minStockLevel: item?.min_stock_level || 0,
        weight: item?.weight,
        tags: item?.tags || [],
        metadata: item?.metadata || {},
        businessLocationId: item?.business_location_id,
        createdAt: item?.created_at,
        updatedAt: item?.updated_at
      }));
      setCatalogItems(mapped);
    } catch (err) {
      console.error('Error loading catalog items:', err);
      setCatalogItems([]);
    } finally {
      setLoadingItems(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    fetchCategories();
    fetchCatalogItems();
  }, [fetchCategories, fetchCatalogItems]);

  // Enrich items with category names once both are loaded
  useEffect(() => {
    if (categories?.length > 0 && catalogItems?.length > 0) {
      setCatalogItems(prev => prev?.map(item => ({
        ...item,
        categoryName: categories?.find(c => c?.id === item?.categoryId)?.name || ''
      })));
    }
  }, [categories]);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'all',
    businessType: 'product',
    featured: 'all',
    establishment: 'all',
    sortBy: 'created_desc'
  });

  // Calculate stats
  const stats = {
    totalProducts: catalogItems?.filter(item => item?.businessType === 'product')?.length || 0,
    totalServices: catalogItems?.filter(item => item?.businessType === 'service')?.length || 0,
    activeItems: catalogItems?.filter(item => item?.status === 'active')?.length || 0,
    featuredItems: catalogItems?.filter(item => item?.isFeatured)?.length || 0,
    totalCategories: categories?.filter(cat => cat?.isActive)?.length || 0,
    lowStockItems: catalogItems?.filter(item =>
      item?.businessType === 'product' &&
      item?.stockQuantity <= item?.minStockLevel
    )?.length || 0
  };

  // Update business type filter when tab changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      businessType: activeTab === 'products' ? 'product' : activeTab === 'services' ? 'service' : 'all'
    }));
  }, [activeTab]);

  // Filter items based on current tab and filters
  const getFilteredItems = () => {
    return catalogItems?.filter(item => {
      if (activeTab === 'products' && item?.businessType !== 'product') return false;
      if (activeTab === 'services' && item?.businessType !== 'service') return false;

      if (filters?.search &&
          !item?.name?.toLowerCase()?.includes(filters?.search?.toLowerCase()) &&
          !item?.description?.toLowerCase()?.includes(filters?.search?.toLowerCase()) &&
          !item?.sku?.toLowerCase()?.includes(filters?.search?.toLowerCase())) {
        return false;
      }

      if (filters?.category !== 'all' && item?.categoryId !== filters?.category) {
        return false;
      }

      if (filters?.status !== 'all' && item?.status !== filters?.status) {
        return false;
      }

      if (filters?.featured !== 'all') {
        if (filters?.featured === 'featured' && !item?.isFeatured) return false;
        if (filters?.featured === 'not_featured' && item?.isFeatured) return false;
      }

      if (filters?.establishment !== 'all' && item?.businessLocationId !== filters?.establishment) {
        return false;
      }

      return true;
    })?.sort((a, b) => {
      switch (filters?.sortBy) {
        case 'name_asc':
          return a?.name?.localeCompare(b?.name);
        case 'name_desc':
          return b?.name?.localeCompare(a?.name);
        case 'price_asc':
          return (a?.price || 0) - (b?.price || 0);
        case 'price_desc':
          return (b?.price || 0) - (a?.price || 0);
        case 'created_desc':
          return new Date(b?.createdAt) - new Date(a?.createdAt);
        case 'created_asc':
          return new Date(a?.createdAt) - new Date(b?.createdAt);
        default:
          return 0;
      }
    });
  };

  const filteredData = getFilteredItems();

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      status: 'all',
      businessType: activeTab === 'products' ? 'product' : activeTab === 'services' ? 'service' : 'all',
      featured: 'all',
      establishment: 'all',
      sortBy: 'created_desc'
    });
  };

  const handleCreateItem = () => {
    setEditingItem(null);
    setShowItemForm(true);
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowCategoryForm(true);
  };

  const handleEditItem = (itemId) => {
    navigate(`/catalog-management/product/${itemId}`);
  };

  const handleEditCategory = (categoryId) => {
    const category = categories?.find(c => c?.id === categoryId);
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleSaveItem = async (formData) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    // Reload from Supabase to get the latest data
    await fetchCatalogItems();
    setIsLoading(false);
    setShowItemForm(false);
    setEditingItem(null);
  };

  const handleSaveCategory = async (formData) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    await fetchCategories();
    setIsLoading(false);
    setShowCategoryForm(false);
    setEditingCategory(null);
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
      try {
        const { error } = await supabase?.from('catalog_items')?.delete()?.eq('id', itemId);
        if (error) throw error;
        setCatalogItems(prev => prev?.filter(item => item?.id !== itemId));
      } catch (err) {
        console.error('Error deleting item:', err);
        setCatalogItems(prev => prev?.filter(item => item?.id !== itemId));
      }
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      try {
        const { error } = await supabase?.from('categories')?.delete()?.eq('id', categoryId);
        if (error) throw error;
        setCategories(prev => prev?.filter(cat => cat?.id !== categoryId));
      } catch (err) {
        console.error('Error deleting category:', err);
        setCategories(prev => prev?.filter(cat => cat?.id !== categoryId));
      }
    }
  };

  const handleToggleStatus = async (itemId) => {
    const item = catalogItems?.find(i => i?.id === itemId);
    if (!item) return;
    const newStatus = item?.status === 'active' ? 'inactive' : 'active';
    try {
      await supabase?.from('catalog_items')?.update({ status: newStatus })?.eq('id', itemId);
    } catch (err) {
      console.error('Error toggling status:', err);
    }
    setCatalogItems(prev => prev?.map(i =>
      i?.id === itemId ? { ...i, status: newStatus } : i
    ));
  };

  const handleToggleFeatured = async (itemId) => {
    const item = catalogItems?.find(i => i?.id === itemId);
    if (!item) return;
    const newFeatured = !item?.isFeatured;
    try {
      await supabase?.from('catalog_items')?.update({ is_featured: newFeatured })?.eq('id', itemId);
    } catch (err) {
      console.error('Error toggling featured:', err);
    }
    setCatalogItems(prev => prev?.map(i =>
      i?.id === itemId ? { ...i, isFeatured: newFeatured } : i
    ));
  };

  const establishmentOptions = [
    { value: 'all', label: 'Todos los establecimientos' },
    ...establishments?.map(est => ({
      value: est?.id,
      label: est?.location_name + (est?.location_code ? ` (${est?.location_code})` : '')
    }))
  ];

  const isPageLoading = loadingItems || loadingCategories;

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onToggleCollapse={() => {}}
        user={user}
      />
      <main
        className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
        style={{
          transitionProperty: 'margin-left',
          transitionDuration: '500ms',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="p-6">
          <RoleGuard allowedRoles={['owner', 'admin', 'staff']} userRole={user?.role} module="catalog">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Catálogo de Productos y Servicios</h1>
                <p className="text-muted-foreground">
                  Gestiona tu inventario de productos y servicios
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    iconName="Grid3X3"
                    iconSize={16}
                  />
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    iconName="List"
                    iconSize={16}
                  />
                </div>

                <Button
                  variant="default"
                  onClick={() => window.location.href = '/catalog-management/product/new'}
                  iconName="Plus"
                  iconPosition="left"
                >
                  Nuevo {activeTab === 'products' ? 'Producto' : 'Servicio'}
                </Button>
              </div>
            </div>

            {/* Establishment filter — below header, outside filters section */}
            <div className="bg-card border border-border rounded-lg p-4 mb-5">
              <div className="flex items-center gap-3 mb-3">
                <Icon name="Building2" size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Establecimiento</span>
                {loadingEstablishments && (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFilterChange('establishment', 'all')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters?.establishment === 'all' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  Todos los establecimientos
                </button>
                {establishments?.map(est => (
                  <button
                    key={est?.id}
                    onClick={() => handleFilterChange('establishment', est?.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      filters?.establishment === est?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    }`}
                  >
                    {est?.location_name}
                    {est?.location_code && (
                      <span className="ml-1.5 opacity-70 text-xs">({est?.location_code})</span>
                    )}
                  </button>
                ))}
                {!loadingEstablishments && establishments?.length === 0 && (
                  <p className="text-sm text-muted-foreground">No hay establecimientos registrados</p>
                )}
              </div>
              {filters?.establishment !== 'all' && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Icon name="Info" size={12} />
                  Mostrando catálogo de: <span className="font-medium text-foreground">{establishments?.find(e => e?.id === filters?.establishment)?.location_name || ''}</span>
                </p>
              )}
            </div>

            <CatalogStats stats={stats} />

            {/* Tabs */}
            <div className="flex items-center gap-4 mb-6 border-b border-border">
              <Button
                variant={activeTab === 'products' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('products')}
                iconName="Package"
                iconPosition="left"
                className="rounded-b-none"
              >
                Productos ({stats?.totalProducts})
              </Button>
              <Button
                variant={activeTab === 'services' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('services')}
                iconName="Wrench"
                iconPosition="left"
                className="rounded-b-none"
              >
                Servicios ({stats?.totalServices})
              </Button>
            </div>

            <CatalogFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              categories={categories}
              activeTab={activeTab}
            />

            {isPageLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <Icon name="Loader2" size={32} className="animate-spin text-primary" />
                  <p className="text-muted-foreground text-sm">Cargando catálogo...</p>
                </div>
              </div>
            ) : filteredData?.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon
                    name={activeTab === 'products' ? 'Package' : 'Wrench'}
                    size={24}
                    className="text-muted-foreground"
                  />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No se encontraron {activeTab === 'products' ? 'productos' : 'servicios'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {filters?.search || filters?.category !== 'all' || filters?.status !== 'all' ?'Intenta ajustar los filtros para ver más resultados.'
                    : `Comienza creando tu primer${activeTab === 'products' ? ' producto' : ' servicio'}.`
                  }
                </p>
                {(!filters?.search && filters?.category === 'all' && filters?.status === 'all') && (
                  <Button
                    variant="default"
                    onClick={() => navigate('/catalog-management/product/new')}
                    iconName="Plus"
                    iconPosition="left"
                  >
                    Crear {activeTab === 'products' ? 'Primer Producto' : 'Primer Servicio'}
                  </Button>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid'
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-2"
              }>
                {filteredData?.map(item => (
                  <CatalogCard
                    key={item?.id}
                    item={item}
                    type={activeTab}
                    viewMode={viewMode}
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                    onToggleStatus={handleToggleStatus}
                    onToggleFeatured={handleToggleFeatured}
                  />
                ))}
              </div>
            )}
          </RoleGuard>
        </div>
      </main>
      {/* Forms */}
      {showItemForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto">
            <CatalogForm
              item={editingItem}
              categories={categories}
              businessType={activeTab === 'products' ? 'product' : 'service'}
              onSave={handleSaveItem}
              onCancel={() => {
                setShowItemForm(false);
                setEditingItem(null);
              }}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <CategoryForm
              category={editingCategory}
              onSave={handleSaveCategory}
              onCancel={() => {
                setShowCategoryForm(false);
                setEditingCategory(null);
              }}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogManagement;