import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import { Checkbox } from './Checkbox';
import { supabase } from '../../lib/supabase';
import { useCurrency } from '../../contexts/CurrencyContext';

const CatalogItemSelector = ({ 
  selectedItems = [], 
  onChange, 
  businessType = 'all', // 'all', 'product', 'service'
  categoryId = null,
  label = 'Productos/Servicios Aplicables',
  description = 'Selecciona los productos o servicios donde se aplicará',
  error = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [catalogItems, setCatalogItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState(businessType);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (isOpen) {
      fetchCatalogItems();
      fetchCategories();
    }
  }, [isOpen, filterCategory, filterType]);

  const fetchCategories = async () => {
    try {
      let query = supabase?.from('categories')?.select('*')?.eq('is_active', true);
      
      if (businessType !== 'all') {
        query = query?.eq('business_type', businessType);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCatalogItems = async () => {
    setIsLoading(true);
    try {
      let query = supabase?.from('catalog_items')?.select('*')?.in('status', ['active', 'draft']);
      
      if (filterType !== 'all') {
        query = query?.eq('business_type', filterType);
      }
      
      if (filterCategory !== 'all') {
        query = query?.eq('category_id', filterCategory);
      }
      
      const { data, error } = await query?.order('name');
      
      if (error) throw error;
      setCatalogItems(data || []);
    } catch (error) {
      console.error('Error fetching catalog items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = catalogItems?.filter(item => 
    item?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    item?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  const handleToggleItem = (itemId) => {
    const newSelection = selectedItems?.includes(itemId)
      ? selectedItems?.filter(id => id !== itemId)
      : [...selectedItems, itemId];
    onChange(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedItems?.length === filteredItems?.length) {
      onChange([]);
    } else {
      onChange(filteredItems?.map(item => item?.id));
    }
  };

  const selectedItemsData = catalogItems?.filter(item => selectedItems?.includes(item?.id));

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {description && (
          <span className="block text-xs text-muted-foreground font-normal mt-1">
            {description}
          </span>
        )}
      </label>

      {/* Selected items display */}
      {selectedItems?.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg border border-border">
          {selectedItemsData?.map(item => (
            <div
              key={item?.id}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
            >
              <span>{item?.name}</span>
              <button
                type="button"
                onClick={() => handleToggleItem(item?.id)}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <Icon name="X" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Open selector button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        iconName="Package"
        className="w-full justify-center"
      >
        {selectedItems?.length > 0 
          ? `${selectedItems?.length} seleccionado(s) - Modificar selección`
          : 'Seleccionar productos/servicios'
        }
      </Button>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                Seleccionar Productos/Servicios
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>

            {/* Filters */}
            <div className="p-4 border-b border-border space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e?.target?.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                {businessType === 'all' && (
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e?.target?.value)}
                    className="px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="all">Todos los tipos</option>
                    <option value="product">Productos</option>
                    <option value="service">Servicios</option>
                  </select>
                )}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e?.target?.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">Todas las categorías</option>
                  {categories?.map(cat => (
                    <option key={cat?.id} value={cat?.id}>{cat?.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedItems?.length} de {filteredItems?.length} seleccionados
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedItems?.length === filteredItems?.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </Button>
              </div>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredItems?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="Package" size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No se encontraron productos o servicios</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredItems?.map(item => (
                    <div
                      key={item?.id}
                      onClick={() => handleToggleItem(item?.id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedItems?.includes(item?.id)
                          ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedItems?.includes(item?.id)}
                          onChange={() => handleToggleItem(item?.id)}
                        />
                        {item?.image_url && (
                          <img
                            src={item?.image_url}
                            alt={item?.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground text-sm truncate">
                            {item?.name}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {item?.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-semibold text-primary">
                              {formatPrice(item?.price)}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {item?.business_type === 'product' ? 'Producto' : 'Servicio'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => setIsOpen(false)}
              >
                Confirmar Selección ({selectedItems?.length})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogItemSelector;