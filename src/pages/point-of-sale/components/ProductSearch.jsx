import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ProductSearch = ({ businessId, onAddToCart, disabled }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list'

  // Mock categories
  const categories = [
    { id: 'all', name: 'Todos', icon: 'LayoutGrid' },
    { id: 'cat1', name: 'Comida', icon: 'UtensilsCrossed' },
    { id: 'cat2', name: 'Bebidas', icon: 'Coffee' },
    { id: 'cat3', name: 'Servicios', icon: 'Utensils' }
  ];

  // Mock products
  const mockProducts = [
    {
      id: 'prod1',
      name: 'Paella Valenciana',
      description: 'Auténtica paella valenciana con mariscos frescos',
      businessType: 'product',
      categoryId: 'cat1',
      price: 18.50,
      imageUrl: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400&h=300&fit=crop',
      stockQuantity: 100,
      status: 'active',
      isFeatured: true
    },
    {
      id: 'prod2',
      name: 'Sangría de la Casa',
      description: 'Refrescante sangría con frutas naturales',
      businessType: 'product',
      categoryId: 'cat2',
      price: 8.50,
      imageUrl: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&h=300&fit=crop',
      stockQuantity: 50,
      status: 'active',
      isFeatured: false
    },
    {
      id: 'prod3',
      name: 'Tapas Variadas',
      description: 'Selección de tapas españolas tradicionales',
      businessType: 'product',
      categoryId: 'cat1',
      price: 12.00,
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
      stockQuantity: 75,
      status: 'active',
      isFeatured: true
    },
    {
      id: 'prod4',
      name: 'Café Espresso',
      description: 'Café espresso italiano premium',
      businessType: 'product',
      categoryId: 'cat2',
      price: 2.50,
      imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=300&fit=crop',
      stockQuantity: 200,
      status: 'active',
      isFeatured: false
    },
    {
      id: 'serv1',
      name: 'Reserva de Mesa',
      description: 'Servicio de reserva de mesa premium',
      businessType: 'service',
      categoryId: 'cat3',
      price: 5.00,
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
      stockQuantity: null,
      status: 'active',
      isFeatured: false
    },
    {
      id: 'prod5',
      name: 'Tortilla Española',
      description: 'Tortilla de patatas casera',
      businessType: 'product',
      categoryId: 'cat1',
      price: 6.50,
      imageUrl: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400&h=300&fit=crop',
      stockQuantity: 30,
      status: 'active',
      isFeatured: true
    },
    {
      id: 'prod6',
      name: 'Cerveza Artesanal',
      description: 'Cerveza artesanal local',
      businessType: 'product',
      categoryId: 'cat2',
      price: 4.50,
      imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop',
      stockQuantity: 120,
      status: 'active',
      isFeatured: false
    },
    {
      id: 'prod7',
      name: 'Gazpacho Andaluz',
      description: 'Sopa fría tradicional andaluza',
      businessType: 'product',
      categoryId: 'cat1',
      price: 5.50,
      imageUrl: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=400&h=300&fit=crop',
      stockQuantity: 40,
      status: 'active',
      isFeatured: false
    }
  ];

  // Filter products
  const filteredProducts = mockProducts?.filter(product => {
    const matchesSearch = product?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                         product?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product?.categoryId === selectedCategory;
    return matchesSearch && matchesCategory && product?.status === 'active';
  });

  const handleAddToCart = (product) => {
    if (disabled) {
      alert('Debe identificar al cliente primero');
      return;
    }
    onAddToCart(product);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Icon name="Search" size={24} className="text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Catálogo de Productos</h2>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            iconName="LayoutGrid"
          />
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            iconName="List"
          />
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Buscar productos o servicios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e?.target?.value)}
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories?.map(category => (
          <Button
            key={category?.id}
            variant={selectedCategory === category?.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category?.id)}
            iconName={category?.icon}
          >
            {category?.name}
          </Button>
        ))}
      </div>

      {/* Products Grid/List */}
      {disabled && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <Icon name="AlertTriangle" size={20} className="text-warning" />
            <p className="text-sm text-warning-foreground">Identifica al cliente para comenzar a agregar productos</p>
          </div>
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts?.map(product => (
            <div
              key={product?.id}
              className={`bg-muted/50 border border-border rounded-lg overflow-hidden transition-all hover:shadow-md ${disabled ? 'opacity-50' : ''}`}
            >
              <div className="relative h-40 bg-muted">
                <img
                  src={product?.imageUrl}
                  alt={product?.name}
                  className="w-full h-full object-cover"
                />
                {product?.isFeatured && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    Destacado
                  </div>
                )}
                {product?.businessType === 'service' && (
                  <div className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full">
                    Servicio
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-1 truncate">{product?.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product?.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">€{product?.price?.toFixed(2)}</span>
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    iconName="Plus"
                    disabled={disabled}
                  >
                    Agregar
                  </Button>
                </div>
                {product?.stockQuantity !== null && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Stock: {product?.stockQuantity} unidades
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts?.map(product => (
            <div
              key={product?.id}
              className={`bg-muted/50 border border-border rounded-lg p-4 flex items-center gap-4 transition-all hover:shadow-md ${disabled ? 'opacity-50' : ''}`}
            >
              <img
                src={product?.imageUrl}
                alt={product?.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{product?.name}</h3>
                  {product?.isFeatured && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                      Destacado
                    </span>
                  )}
                  {product?.businessType === 'service' && (
                    <span className="bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full">
                      Servicio
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{product?.description}</p>
                {product?.stockQuantity !== null && (
                  <p className="text-xs text-muted-foreground">
                    Stock: {product?.stockQuantity} unidades
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xl font-bold text-primary">€{product?.price?.toFixed(2)}</span>
                <Button
                  onClick={() => handleAddToCart(product)}
                  iconName="Plus"
                  disabled={disabled}
                >
                  Agregar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredProducts?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Package" size={64} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No se encontraron productos</p>
        </div>
      )}
    </div>
  );
};

export default ProductSearch;