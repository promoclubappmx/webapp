import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PromotionPreview = ({ promotion, onClose }) => {
  const [previewMode, setPreviewMode] = useState('mobile');
  const [theme, setTheme] = useState('light');

  if (!promotion) return null;

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDiscountText = () => {
    if (promotion?.discountType === 'percentage') {
      return `${promotion?.discountValue}% de descuento`;
    } else if (promotion?.discountType === 'fixed') {
      return `€${promotion?.discountValue} de descuento`;
    } else if (promotion?.discountType === 'buy_one_get_one') {
      return `2x1 - Compra 1, lleva 2`;
    } else if (promotion?.discountType === 'bulk_discount') {
      return `${promotion?.discountValue}% descuento por volumen`;
    }
    return `€${promotion?.discountValue} de descuento`;
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Preview Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-foreground">Vista Previa - App Cliente</h3>
            <div className="flex items-center gap-2">
              <Button
                variant={previewMode === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('desktop')}
                iconName="Monitor"
                iconSize={16}
              >
                Escritorio
              </Button>
              <Button
                variant={previewMode === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('mobile')}
                iconName="Smartphone"
                iconSize={16}
              >
                Móvil
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                iconName="Sun"
                iconSize={16}
              >
                Claro
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                iconName="Moon"
                iconSize={16}
              >
                Oscuro
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            iconName="X"
            iconSize={16}
          />
        </div>

        {/* Preview Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className={`mx-auto transition-all duration-300 ${
            previewMode === 'mobile' ? 'max-w-sm' : 'max-w-2xl'
          }`}>
            <div className={`rounded-lg border p-6 ${
              theme === 'dark' ?'bg-slate-900 border-slate-700 text-white' :'bg-white border-slate-200 text-slate-900'
            }`}>
              {/* Business Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
                }`}>
                  <Icon name="Store" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold">Mi Negocio</h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Restaurante · Abierto hasta las 22:00
                  </p>
                </div>
              </div>

              {/* Promotion Card */}
              <div className={`rounded-lg overflow-hidden mb-4 ${
                theme === 'dark' ?'bg-gradient-to-r from-blue-900 to-purple-900 border border-slate-700' :'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
              }`}>
                
                {/* Promotion Image */}
                {promotion?.imageUrl && (
                  <div className="relative">
                    <img
                      src={promotion?.imageUrl}
                      alt={promotion?.title}
                      className="w-full h-48 object-cover"
                    />
                    {/* Overlay with type badge */}
                    <div className="absolute top-2 left-2">
                      <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                        <Icon name={getBusinessTypeIcon(promotion?.businessType)} size={12} />
                        <span className="text-xs font-medium text-slate-900">{getBusinessTypeLabel(promotion?.businessType)}</span>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        theme === 'dark' ?'bg-blue-900 text-blue-200' :'bg-blue-100 text-blue-800'
                      }`}>
                        OFERTA ESPECIAL
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      {!promotion?.imageUrl && (
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="Tag" size={16} className="text-blue-600" />
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            theme === 'dark' ?'bg-blue-900 text-blue-200' :'bg-blue-100 text-blue-800'
                          }`}>
                            OFERTA ESPECIAL
                          </span>
                          <div className="flex items-center gap-1 text-xs">
                            <Icon name={getBusinessTypeIcon(promotion?.businessType)} size={12} />
                            <span>{getBusinessTypeLabel(promotion?.businessType)}</span>
                          </div>
                        </div>
                      )}
                      
                      <h5 className="font-bold text-lg mb-2">{promotion?.title}</h5>
                      <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                        {promotion?.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {getDiscountText()}
                      </div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        Válido hasta {formatDate(promotion?.endDate)}
                      </div>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Usar Oferta
                    </Button>
                  </div>

                  {promotion?.minPurchaseAmount && (
                    <div className={`text-xs mt-3 pt-3 border-t ${
                      theme === 'dark' ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'
                    }`}>
                      * Compra mínima de €{promotion?.minPurchaseAmount}
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-1">
                    <Icon name="Clock" size={12} />
                    <span>Disponible de {promotion?.startTime} a {promotion?.endTime}</span>
                  </div>
                </div>
                
                {promotion?.targetDays && promotion?.targetDays?.length > 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    <Icon name="Calendar" size={12} />
                    <span>Días: {promotion?.targetDays?.join(', ')}</span>
                  </div>
                )}

                {promotion?.usageLimit && (
                  <div className="flex items-center gap-1 mb-2">
                    <Icon name="Users" size={12} />
                    <span>Límite: {promotion?.usageLimit} usos</span>
                  </div>
                )}

                {/* Category and business type info */}
                <div className="flex items-center gap-4 mt-3 pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-1">
                    <Icon name={getBusinessTypeIcon(promotion?.businessType)} size={12} />
                    <span>Tipo: {getBusinessTypeLabel(promotion?.businessType)}</span>
                  </div>
                  {promotion?.categoryName && (
                    <div className="flex items-center gap-1">
                      <Icon name="Tag" size={12} />
                      <span>Categoría: {promotion?.categoryName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionPreview;