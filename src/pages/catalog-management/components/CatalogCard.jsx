import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

import { supabase } from '../../../lib/supabase';
import { useCurrency } from '../../../contexts/CurrencyContext';

const CatalogCard = ({ item, type, viewMode = 'grid', onEdit, onDelete, onToggleStatus, onToggleFeatured }) => {
  const [linkedFeatures, setLinkedFeatures] = useState([]);
  const [showLinkedFeatures, setShowLinkedFeatures] = useState(false);
  const [loadingFeatures, setLoadingFeatures] = useState(false);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (showLinkedFeatures && type !== 'categories' && !loadingFeatures) {
      fetchLinkedFeatures();
    }
  }, [showLinkedFeatures, item?.id]);

  const fetchLinkedFeatures = async () => {
    setLoadingFeatures(true);
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!item?.id || !uuidRegex?.test(item?.id)) {
        setLinkedFeatures([]);
        return;
      }
      const { data, error } = await supabase?.rpc('get_catalog_item_engagement_features', { item_uuid: item?.id });
      if (error) throw error;
      setLinkedFeatures(data || []);
    } catch (error) {
      console.error('Error fetching linked features:', error);
      setLinkedFeatures([]);
    } finally {
      setLoadingFeatures(false);
    }
  };

  const getFeatureIcon = (featureType) => {
    switch (featureType) {
      case 'promotion': return 'Megaphone';
      case 'coupon': return 'Ticket';
      case 'reward': return 'Gift';
      case 'loyalty': return 'Star';
      default: return 'Tag';
    }
  };

  const getFeatureLabel = (featureType) => {
    switch (featureType) {
      case 'promotion': return 'Promoción';
      case 'coupon': return 'Cupón';
      case 'reward': return 'Recompensa';
      case 'loyalty': return 'Puntos';
      default: return featureType;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700';
      case 'inactive': return 'bg-gray-100 text-gray-600';
      case 'draft': return 'bg-amber-100 text-amber-700';
      case 'discontinued': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'draft': return 'Borrador';
      case 'discontinued': return 'Descontinuado';
      default: return 'Inactivo';
    }
  };

  const hasSalePrice = item?.salePrice && parseFloat(item?.salePrice) > 0 && parseFloat(item?.salePrice) < parseFloat(item?.price || 0);

  if (type === 'categories') {
    return (
      <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: item?.color || '#3B82F6' }}
            >
              <Icon name={item?.iconName || 'Tag'} size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{item?.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">{item?.description}</p>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
            item?.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {item?.isActive ? 'Activa' : 'Inactiva'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{item?.itemCount || 0} elementos</span>
          <div className="flex items-center gap-1">
            <button onClick={() => onEdit(item?.id)} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
              <Icon name="Edit" size={14} className="text-muted-foreground" />
            </button>
            <button onClick={() => onDelete(item?.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
              <Icon name="Trash2" size={14} className="text-red-500" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- LIST VIEW ----
  if (viewMode === 'list') {
    return (
      <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-sm transition-shadow duration-200">
        <div className="flex items-center gap-3 p-3">
          {/* Small image */}
          <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
            {item?.imageUrl ? (
              <img
                src={item?.imageUrl}
                alt={item?.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon name={item?.businessType === 'service' ? 'Wrench' : 'Package'} size={20} className="text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm font-semibold text-foreground truncate">{item?.name}</h3>
              {item?.isFeatured && (
                <span className="flex-shrink-0 bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded text-xs font-medium flex items-center gap-0.5">
                  <Icon name="Star" size={10} />
                  Dest.
                </span>
              )}
              {hasSalePrice && (
                <span className="flex-shrink-0 bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-xs font-medium">
                  Oferta
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getStatusColor(item?.status)}`}>
                {getStatusLabel(item?.status)}
              </span>
              <span>{item?.categoryName || 'Sin categoría'}</span>
              {item?.sku && <span>SKU: {item?.sku}</span>}
            </div>
          </div>

          {/* Price */}
          <div className="text-right flex-shrink-0 mr-2">
            {hasSalePrice ? (
              <>
                <p className="text-sm font-bold text-red-600">{formatPrice(item?.salePrice)}</p>
                <p className="text-xs text-muted-foreground line-through">{formatPrice(item?.price)}</p>
              </>
            ) : (
              <p className="text-sm font-bold text-foreground">{item?.price ? formatPrice(item?.price) : '—'}</p>
            )}
          </div>

          {/* Actions horizontal */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onToggleFeatured(item?.id)}
              title={item?.isFeatured ? 'Quitar destacado' : 'Destacar'}
              className={`p-1.5 rounded-lg transition-colors ${item?.isFeatured ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'hover:bg-muted text-muted-foreground'}`}
            >
              <Icon name="Star" size={14} />
            </button>
            <button
              onClick={() => onEdit(item?.id)}
              title="Editar"
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            >
              <Icon name="Edit" size={14} />
            </button>
            <button
              onClick={() => onToggleStatus(item?.id)}
              title={item?.status === 'active' ? 'Desactivar' : 'Activar'}
              className={`p-1.5 rounded-lg transition-colors ${item?.status === 'active' ? 'hover:bg-amber-50 text-amber-600' : 'hover:bg-emerald-50 text-emerald-600'}`}
            >
              <Icon name={item?.status === 'active' ? 'Pause' : 'Play'} size={14} />
            </button>
            <button
              onClick={() => onDelete(item?.id)}
              title="Eliminar"
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
            >
              <Icon name="Trash2" size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- GRID VIEW ----
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col">
      {/* Action buttons on top */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b border-border">
        <div className="flex items-center gap-1">
          {item?.isFeatured && (
            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
              <Icon name="Star" size={10} />
              Destacado
            </span>
          )}
          {hasSalePrice && (
            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-medium">
              Oferta
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onToggleFeatured(item?.id)}
            title={item?.isFeatured ? 'Quitar destacado' : 'Destacar'}
            className={`p-1.5 rounded-lg transition-colors text-xs ${item?.isFeatured ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'hover:bg-muted text-muted-foreground'}`}
          >
            <Icon name="Star" size={13} />
          </button>
          <button
            onClick={() => onEdit(item?.id)}
            title="Editar"
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            <Icon name="Edit" size={13} />
          </button>
          <button
            onClick={() => onToggleStatus(item?.id)}
            title={item?.status === 'active' ? 'Desactivar' : 'Activar'}
            className={`p-1.5 rounded-lg transition-colors ${item?.status === 'active' ? 'hover:bg-amber-50 text-amber-600' : 'hover:bg-emerald-50 text-emerald-600'}`}
          >
            <Icon name={item?.status === 'active' ? 'Pause' : 'Play'} size={13} />
          </button>
          <button
            onClick={() => onDelete(item?.id)}
            title="Eliminar"
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
          >
            <Icon name="Trash2" size={13} />
          </button>
        </div>
      </div>

      {/* Product Image */}
      <div className="relative h-36 bg-muted">
        {item?.imageUrl ? (
          <img
            src={item?.imageUrl}
            alt={item?.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name={item?.businessType === 'service' ? 'Wrench' : 'Package'} size={32} className="text-muted-foreground opacity-40" />
          </div>
        )}
        <div className="absolute bottom-2 right-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item?.status)}`}>
            {getStatusLabel(item?.status)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="text-sm font-semibold text-foreground mb-1 line-clamp-1">{item?.name}</h3>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2 flex-1">{item?.description}</p>

        <div className="flex items-center justify-between mt-auto">
          <div>
            {hasSalePrice ? (
              <div>
                <span className="text-sm font-bold text-red-600">{formatPrice(item?.salePrice)}</span>
                <span className="text-xs text-muted-foreground line-through ml-1">{formatPrice(item?.price)}</span>
              </div>
            ) : (
              <span className="text-sm font-bold text-foreground">{item?.price ? formatPrice(item?.price) : '—'}</span>
            )}
          </div>
          <span className="text-xs text-muted-foreground truncate ml-2">{item?.categoryName || 'Sin cat.'}</span>
        </div>

        {/* Tags */}
        {item?.tags && item?.tags?.length > 0 && (
          <div className="mt-2 flex gap-1 flex-wrap">
            {item?.tags?.slice(0, 2)?.map(tag => (
              <span key={tag} className="px-1.5 py-0.5 bg-muted text-xs rounded text-muted-foreground">
                {tag}
              </span>
            ))}
            {item?.tags?.length > 2 && (
              <span className="px-1.5 py-0.5 bg-muted text-xs rounded text-muted-foreground">
                +{item?.tags?.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Low stock warning */}
        {item?.businessType === 'product' && item?.stockQuantity <= item?.minStockLevel && item?.minStockLevel > 0 && (
          <div className="mt-2 flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs">
            <Icon name="AlertTriangle" size={12} />
            <span>Stock bajo</span>
          </div>
        )}

        {/* Linked Engagement Features */}
        <div className="mt-2 pt-2 border-t border-border">
          <button
            onClick={() => setShowLinkedFeatures(!showLinkedFeatures)}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <Icon name={showLinkedFeatures ? 'ChevronUp' : 'ChevronDown'} size={12} />
            <span>Engagement vinculado</span>
            {linkedFeatures?.length > 0 && (
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                {linkedFeatures?.length}
              </span>
            )}
          </button>
          {showLinkedFeatures && (
            <div className="mt-2 space-y-1">
              {loadingFeatures ? (
                <div className="flex items-center justify-center py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              ) : linkedFeatures?.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Sin engagement vinculado</p>
              ) : (
                linkedFeatures?.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 p-1.5 bg-muted/50 rounded text-xs">
                    <Icon name={getFeatureIcon(feature?.feature_type)} size={12} className="text-primary" />
                    <span className="flex-1 truncate">{feature?.feature_name}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogCard;