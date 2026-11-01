import React, { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import Icon from '../../../../components/AppIcon';

import { useAuth } from '../../../../contexts/AuthContext';
import { supabase } from '../../../../lib/supabase';

const TabPaquete = ({ formData, errors, touched, onChange, onBlur }) => {
  const { user } = useAuth();
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const { data, error } = await supabase
          ?.from('catalog_items')
          ?.select('id, name, sku, price, status, business_type')
          ?.eq('user_id', user?.id)
          ?.eq('status', 'active')
          ?.order('name');
        if (!error && data?.length > 0) {
          setAvailableProducts(data?.map(item => ({
            id: item?.id,
            name: item?.name,
            sku: item?.sku || '',
            price: item?.price || 0,
            type: item?.business_type || 'product',
          })));
        } else {
          setAvailableProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setAvailableProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    if (user?.id) {
      fetchProducts();
    }
  }, [user?.id]);

  const addProductToBundle = (product) => {
    const bundleProducts = formData?.bundleProducts || [];
    const exists = bundleProducts?.find(p => p?.productId === product?.id);
    
    if (!exists) {
      onChange('bundleProducts', [
        ...bundleProducts,
        {
          productId: product?.id,
          productName: product?.name,
          productSku: product?.sku,
          quantity: 1,
          price: product?.price,
          discount: 0
        }
      ]);
    }
    setShowProductSelector(false);
    setSearchTerm('');
  };

  const removeProductFromBundle = (productId) => {
    const bundleProducts = formData?.bundleProducts || [];
    onChange('bundleProducts', bundleProducts?.filter(p => p?.productId !== productId));
  };

  const updateBundleProduct = (productId, field, value) => {
    const bundleProducts = formData?.bundleProducts || [];
    onChange(
      'bundleProducts',
      bundleProducts?.map(p => 
        p?.productId === productId ? { ...p, [field]: value } : p
      )
    );
  };

  const calculateBundleTotal = () => {
    const bundleProducts = formData?.bundleProducts || [];
    return bundleProducts?.reduce((total, product) => {
      const subtotal = (parseFloat(product?.price) || 0) * (parseInt(product?.quantity) || 0);
      const discount = parseFloat(product?.discount) || 0;
      return total + (subtotal - discount);
    }, 0);
  };

  const filteredProducts = availableProducts?.filter(product => 
    product?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    product?.sku?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-2">
          <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">Componentes del paquete</p>
            <p className="text-xs text-blue-700">
              Selecciona los productos o servicios que formarán parte de este paquete. Puedes configurar cantidades, precios y descuentos individuales.
            </p>
          </div>
        </div>
      </div>
      {/* Add Product Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Productos en el paquete ({formData?.bundleProducts?.length || 0})
        </h3>
        <Button
          size="sm"
          variant="outline"
          iconName="Plus"
          iconPosition="left"
          onClick={() => setShowProductSelector(!showProductSelector)}
        >
          Agregar Producto
        </Button>
      </div>
      {/* Product Selector Modal */}
      {showProductSelector && (
        <div className="border border-border rounded-lg p-4 bg-muted/50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-foreground">Seleccionar producto</h4>
            <button
              type="button"
              onClick={() => {
                setShowProductSelector(false);
                setSearchTerm('');
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <Icon name="X" size={16} />
            </button>
          </div>
          <Input
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="mb-4"
          />
          {loadingProducts ? (
            <div className="flex items-center gap-2 text-muted-foreground py-4">
              <Icon name="Loader2" size={16} className="animate-spin" />
              <span className="text-sm">Cargando productos...</span>
            </div>
          ) : filteredProducts?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No se encontraron productos
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredProducts?.map(product => (
                <button
                  key={product?.id}
                  type="button"
                  onClick={() => addProductToBundle(product)}
                  className="w-full flex items-center justify-between p-3 border border-border rounded-lg hover:bg-background transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{product?.name}</p>
                    <p className="text-xs text-muted-foreground">SKU: {product?.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">${product?.price}</p>
                    <p className="text-xs text-muted-foreground capitalize">{product?.type}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Bundle Products List */}
      {(!formData?.bundleProducts || formData?.bundleProducts?.length === 0) ? (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <Icon name="Package2" size={32} className="mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground mb-1">No hay productos en el paquete</p>
          <p className="text-xs text-muted-foreground">
            Haz clic en "Agregar Producto" para comenzar a construir tu paquete
          </p>
          {touched?.bundleProducts && errors?.bundleProducts && (
            <p className="text-xs text-red-500 mt-2">{errors?.bundleProducts}</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {formData?.bundleProducts?.map((product, index) => (
            <div key={product?.productId} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground">{product?.productName}</h4>
                  <p className="text-xs text-muted-foreground">SKU: {product?.productSku}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeProductFromBundle(product?.productId)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Icon name="Trash2" size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Cantidad"
                  type="number"
                  min="1"
                  value={product?.quantity}
                  onChange={(e) => updateBundleProduct(product?.productId, 'quantity', e?.target?.value)}
                  placeholder="1"
                />
                <Input
                  label="Precio unitario (MXN)"
                  type="number"
                  step="0.01"
                  value={product?.price}
                  onChange={(e) => updateBundleProduct(product?.productId, 'price', e?.target?.value)}
                  placeholder="0.00"
                />
                <Input
                  label="Descuento (MXN)"
                  type="number"
                  step="0.01"
                  value={product?.discount}
                  onChange={(e) => updateBundleProduct(product?.productId, 'discount', e?.target?.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Subtotal:</span>
                <span className="text-sm font-semibold text-foreground">
                  ${((parseFloat(product?.price) || 0) * (parseInt(product?.quantity) || 0) - (parseFloat(product?.discount) || 0))?.toFixed(2)}
                </span>
              </div>
            </div>
          ))}

          {/* Bundle Total */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-foreground">Total del paquete</p>
                <p className="text-xs text-muted-foreground">
                  {formData?.bundleProducts?.length} producto(s) incluido(s)
                </p>
              </div>
              <p className="text-2xl font-bold text-primary">
                ${calculateBundleTotal()?.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-2">
              <Icon name="AlertTriangle" size={16} className="text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900 mb-1">Precio del paquete</p>
                <p className="text-xs text-yellow-700">
                  El precio final del paquete se configura en la pestaña "Precios". El total calculado aquí es solo referencial.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabPaquete;