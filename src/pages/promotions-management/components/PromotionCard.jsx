import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useCurrency } from '../../../contexts/CurrencyContext';

const PromotionCard = ({ promotion, onEdit, onDelete, onToggleStatus, onViewAnalytics }) => {
  const { formatPrice } = useCurrency();
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'scheduled':
        return 'bg-warning text-warning-foreground';
      case 'draft':
        return 'bg-muted text-muted-foreground';
      case 'expired':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getBusinessTypeIcon = (type) => {
    switch (type) {
      case 'product':
        return 'Package';
      case 'service':
        return 'Wrench';
      default:
        return 'Tag';
    }
  };

  const getBusinessTypeLabel = (type) => {
    switch (type) {
      case 'product':
        return 'Producto';
      case 'service':
        return 'Servicio';
      default:
        return 'General';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining(promotion?.endDate);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Promotion Image */}
      {promotion?.imageUrl && (
        <div className="relative h-48">
          <img
            src={promotion?.imageUrl}
            alt={promotion?.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(promotion?.status)}`}>
              {promotion?.status === 'active' ? 'Activa' : 
               promotion?.status === 'scheduled' ? 'Programada' :
               promotion?.status === 'draft' ? 'Borrador' : 'Expirada'}
            </span>
          </div>
          {/* Business Type Badge */}
          <div className="absolute top-2 left-2">
            <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
              <Icon name={getBusinessTypeIcon(promotion?.businessType)} size={12} />
              <span className="text-xs font-medium">{getBusinessTypeLabel(promotion?.businessType)}</span>
            </div>
          </div>
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-foreground">{promotion?.title}</h3>
              {!promotion?.imageUrl && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(promotion?.status)}`}>
                  {promotion?.status === 'active' ? 'Activa' : 
                   promotion?.status === 'scheduled' ? 'Programada' :
                   promotion?.status === 'draft' ? 'Borrador' : 'Expirada'}
                </span>
              )}
            </div>
            
            {/* Business Type and Category Info */}
            {!promotion?.imageUrl && (
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Icon name={getBusinessTypeIcon(promotion?.businessType)} size={14} />
                  <span>{getBusinessTypeLabel(promotion?.businessType)}</span>
                </div>
                {promotion?.categoryName && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Icon name="Tag" size={14} />
                    <span>{promotion?.categoryName}</span>
                  </div>
                )}
              </div>
            )}
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{promotion?.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Inicio:</span>
                <span className="ml-2 text-foreground">{formatDate(promotion?.startDate)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Fin:</span>
                <span className="ml-2 text-foreground">{formatDate(promotion?.endDate)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Descuento:</span>
                <span className="ml-2 text-foreground font-medium">
                  {promotion?.discountType === 'percentage' ? `${promotion?.discountValue}%` : 
                   promotion?.discountType === 'fixed' ? formatPrice(promotion?.discountValue) :
                   promotion?.discountType === 'buy_one_get_one' ? '2x1' :
                   `${promotion?.discountValue}% vol.`}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Usos:</span>
                <span className="ml-2 text-foreground">{promotion?.usageCount}/{promotion?.usageLimit || '∞'}</span>
              </div>
            </div>

            {promotion?.status === 'active' && daysRemaining <= 7 && daysRemaining > 0 && (
              <div className="mt-3 flex items-center gap-2 text-warning">
                <Icon name="Clock" size={16} />
                <span className="text-sm">Expira en {daysRemaining} días</span>
              </div>
            )}

            {promotion?.targetDays && promotion?.targetDays?.length > 0 && (
              <div className="mt-3">
                <span className="text-xs text-muted-foreground">Días objetivo:</span>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {promotion?.targetDays?.map(day => (
                    <span key={day} className="px-2 py-1 bg-muted text-xs rounded">
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewAnalytics(promotion?.id)}
              iconName="BarChart3"
              iconSize={16}
            >
              Analíticas
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(promotion?.id)}
              iconName="Edit"
              iconSize={16}
            >
              Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStatus(promotion?.id)}
              iconName={promotion?.status === 'active' ? 'Pause' : 'Play'}
              iconSize={16}
            >
              {promotion?.status === 'active' ? 'Pausar' : 'Activar'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(promotion?.id)}
              iconName="Trash2"
              iconSize={16}
              className="text-destructive hover:text-destructive"
            >
              Eliminar
            </Button>
          </div>
        </div>
        
        {promotion?.performance && (
          <div className="border-t border-border pt-4 mt-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-foreground">{promotion?.performance?.views}</div>
                <div className="text-xs text-muted-foreground">Visualizaciones</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground">{promotion?.performance?.clicks}</div>
                <div className="text-xs text-muted-foreground">Clics</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground">{promotion?.performance?.conversions}</div>
                <div className="text-xs text-muted-foreground">Conversiones</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionCard;