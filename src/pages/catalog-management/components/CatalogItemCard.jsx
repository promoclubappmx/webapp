import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CatalogItemCard = ({ 
  item, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onToggleFeatured,
  viewMode = 'grid' 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'platos-principales': return 'UtensilsCrossed';
      case 'entrantes': return 'Salad';
      case 'postres': return 'Cake';
      case 'bebidas': return 'Coffee';
      case 'bebidas-alcoholicas': return 'Wine';
      case 'menu-infantil': return 'Baby';
      case 'servicios': return 'Wrench';
      case 'eventos': return 'Calendar';
      case 'catering': return 'ChefHat';
      default: return 'Package';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    })?.format(price);
  };

  const formatCategory = (category) => {
    const categories = {
      'platos-principales': 'Platos Principales',
      'entrantes': 'Entrantes',
      'postres': 'Postres',
      'bebidas': 'Bebidas',
      'bebidas-alcoholicas': 'Bebidas Alcohólicas',
      'menu-infantil': 'Menú Infantil',
      'servicios': 'Servicios',
      'eventos': 'Eventos',
      'catering': 'Catering',
      'otros': 'Otros'
    };
    return categories?.[category] || category;
  };

  if (viewMode === 'table') {
    return (
      <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          {item?.images?.[0] ? (
            <img 
              src={item?.images?.[0]} 
              alt={item?.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon name="ImageIcon" size={20} className="text-muted-foreground" />
            </div>
          )}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">{item?.name}</h3>
                {item?.featured && (
                  <Icon name="Star" size={14} className="text-yellow-500 fill-current" />
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {item?.description}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Icon name={getCategoryIcon(item?.category)} size={12} />
                  <span className="text-muted-foreground">{formatCategory(item?.category)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name={item?.itemType === 'producto' ? 'Package' : 'Wrench'} size={12} />
                  <span className="text-muted-foreground capitalize">{item?.itemType}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 ml-4">
              <div className="text-right">
                <div className="font-bold text-lg text-foreground">{formatPrice(item?.price)}</div>
                <div className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(item?.status)}`}>
                  {item?.status === 'active' ? 'Activo' : 'Borrador'}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit?.(item?.id)}
                  iconName="Edit"
                  iconSize={14}
                />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleStatus?.(item?.id)}
                  iconName={item?.status === 'active' ? 'Pause' : 'Play'}
                  iconSize={14}
                />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleFeatured?.(item?.id)}
                  iconName="Star"
                  iconSize={14}
                  className={item?.featured ? 'text-yellow-500' : ''}
                />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete?.(item?.id)}
                  iconName="Trash2"
                  iconSize={14}
                  className="text-destructive hover:text-destructive"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative">
        <div className="w-full h-48 bg-muted">
          {item?.images?.[0] ? (
            <img 
              src={item?.images?.[0]} 
              alt={item?.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon name="ImageIcon" size={32} className="text-muted-foreground" />
            </div>
          )}
        </div>
        
        {/* Status Badge */}
        <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item?.status)}`}>
          {item?.status === 'active' ? 'Activo' : 'Borrador'}
        </div>
        
        {/* Featured Badge */}
        {item?.featured && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Icon name="Star" size={12} />
            Destacado
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute bottom-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full font-bold">
          {formatPrice(item?.price)}
        </div>
      </div>
      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
            {item?.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item?.description}
          </p>
        </div>

        {/* Category and Type */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
            <Icon name={getCategoryIcon(item?.category)} size={12} />
            <span>{formatCategory(item?.category)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
            <Icon name={item?.itemType === 'producto' ? 'Package' : 'Wrench'} size={12} />
            <span className="capitalize">{item?.itemType}</span>
          </div>
        </div>

        {/* Product/Service specific info */}
        <div className="text-xs text-muted-foreground">
          {item?.itemType === 'producto' ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Icon name="Package2" size={10} />
                <span>SKU: {item?.sku}</span>
              </div>
              {item?.inventory !== undefined && (
                <div className="flex items-center gap-1">
                  <Icon name="Archive" size={10} />
                  <span>Stock: {item?.inventory}</span>
                </div>
              )}
              {item?.preparationTime && (
                <div className="flex items-center gap-1">
                  <Icon name="Clock" size={10} />
                  <span>{item?.preparationTime}min</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {item?.serviceDetails?.duration && (
                <div className="flex items-center gap-1">
                  <Icon name="Clock" size={10} />
                  <span>{item?.serviceDetails?.duration}</span>
                </div>
              )}
              {item?.serviceDetails?.minPeople && item?.serviceDetails?.maxPeople && (
                <div className="flex items-center gap-1">
                  <Icon name="Users" size={10} />
                  <span>{item?.serviceDetails?.minPeople}-{item?.serviceDetails?.maxPeople} personas</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ingredients or Service includes preview */}
        {item?.itemType === 'producto' && item?.ingredients?.length > 0 && (
          <div className="text-xs">
            <span className="text-muted-foreground">Ingredientes: </span>
            <span>{item?.ingredients?.slice(0, 3)?.join(', ')}</span>
            {item?.ingredients?.length > 3 && <span className="text-muted-foreground">...</span>}
          </div>
        )}

        {item?.itemType === 'servicio' && item?.serviceDetails?.includes?.length > 0 && (
          <div className="text-xs">
            <span className="text-muted-foreground">Incluye: </span>
            <span>{item?.serviceDetails?.includes?.slice(0, 2)?.join(', ')}</span>
            {item?.serviceDetails?.includes?.length > 2 && <span className="text-muted-foreground">...</span>}
          </div>
        )}

        {/* Allergens */}
        {item?.allergens?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item?.allergens?.slice(0, 3)?.map(allergen => (
              <span 
                key={allergen}
                className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded"
              >
                {allergen}
              </span>
            ))}
            {item?.allergens?.length > 3 && (
              <span className="text-xs bg-muted px-1 py-0.5 rounded">
                +{item?.allergens?.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(item?.id)}
            iconName="Edit"
            iconSize={14}
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus?.(item?.id)}
            iconName={item?.status === 'active' ? 'Pause' : 'Play'}
            iconSize={14}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleFeatured?.(item?.id)}
            iconName="Star"
            iconSize={14}
            className={item?.featured ? 'text-yellow-500' : ''}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete?.(item?.id)}
            iconName="Trash2"
            iconSize={14}
            className="ml-auto text-destructive hover:text-destructive"
          />
        </div>
      </div>
    </div>
  );
};

export default CatalogItemCard;