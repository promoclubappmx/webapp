import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RewardTemplatesModal = ({ isOpen, onClose, onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState('popular');

  const rewardTemplates = {
    popular: [
      {
        id: 1,
        name: 'Café Gratis - 10 Visitas',
        description: 'Recompensa clásica para cafeterías y restaurantes',
        type: 'count',
        targetValue: 10,
        rewardType: 'free_item',
        rewardValue: 'Café gratis',
        icon: 'Coffee',
        category: 'Hostelería',
        usage: 89
      },
      {
        id: 2,
        name: 'Descuento 20% - €100 Gastados',
        description: 'Incentiva el gasto frecuente con descuentos atractivos',
        type: 'amount',
        targetValue: 100,
        rewardType: 'discount',
        rewardValue: '20% de descuento',
        icon: 'Percent',
        category: 'Retail',
        usage: 76
      },
      {
        id: 3,
        name: 'Puntos Dobles - 5 Compras',
        description: 'Programa de puntos para fidelización a largo plazo',
        type: 'count',
        targetValue: 5,
        rewardType: 'points',
        rewardValue: 'Puntos dobles por 30 días',
        icon: 'Star',
        category: 'General',
        usage: 65
      }
    ],
    retail: [
      {
        id: 4,
        name: 'Producto Gratis - €200 Compras',
        description: 'Perfecto para tiendas con productos de precio medio',
        type: 'amount',
        targetValue: 200,
        rewardType: 'free_item',
        rewardValue: 'Producto hasta €30 gratis',
        icon: 'Gift',
        category: 'Retail',
        usage: 54
      },
      {
        id: 5,
        name: 'Descuento Progresivo',
        description: 'Descuento que aumenta con cada compra',
        type: 'count',
        targetValue: 3,
        rewardType: 'discount',
        rewardValue: '5% primera, 10% segunda, 15% tercera',
        icon: 'TrendingUp',
        category: 'Retail',
        usage: 43
      }
    ],
    hospitality: [
      {
        id: 6,
        name: 'Cena Gratis - 12 Visitas',
        description: 'Para restaurantes que buscan fidelizar comensales',
        type: 'count',
        targetValue: 12,
        rewardType: 'free_item',
        rewardValue: 'Menú principal gratis',
        icon: 'Utensils',
        category: 'Hostelería',
        usage: 38
      },
      {
        id: 7,
        name: 'Mesa VIP - €500 Gastados',
        description: 'Experiencia premium para clientes de alto valor',
        type: 'amount',
        targetValue: 500,
        rewardType: 'exclusive_access',
        rewardValue: 'Mesa VIP por 3 meses',
        icon: 'Crown',
        category: 'Hostelería',
        usage: 29
      }
    ],
    services: [
      {
        id: 8,
        name: 'Servicio Gratis - 8 Sesiones',
        description: 'Ideal para salones de belleza y servicios personales',
        type: 'count',
        targetValue: 8,
        rewardType: 'free_item',
        rewardValue: 'Sesión de tratamiento gratis',
        icon: 'Scissors',
        category: 'Servicios',
        usage: 31
      },
      {
        id: 9,
        name: 'Membresía Premium - €300',
        description: 'Acceso a servicios exclusivos por tiempo limitado',
        type: 'amount',
        targetValue: 300,
        rewardType: 'exclusive_access',
        rewardValue: 'Membresía premium 6 meses',
        icon: 'Award',
        category: 'Servicios',
        usage: 22
      }
    ]
  };

  const categories = [
    { id: 'popular', label: 'Más Populares', icon: 'TrendingUp' },
    { id: 'retail', label: 'Retail', icon: 'ShoppingBag' },
    { id: 'hospitality', label: 'Hostelería', icon: 'Coffee' },
    { id: 'services', label: 'Servicios', icon: 'Wrench' }
  ];

  const handleSelectTemplate = (template) => {
    const templateData = {
      name: template?.name,
      description: template?.description,
      type: template?.type,
      targetValue: template?.targetValue,
      rewardType: template?.rewardType,
      rewardValue: template?.rewardValue,
      validityPeriod: '60', // Default 60 days
      isActive: true,
      customerLimit: '1'
    };

    onSelectTemplate(templateData);
    onClose();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Plantillas de Recompensas</h2>
            <p className="text-sm text-muted-foreground">
              Selecciona una plantilla predefinida para crear tu recompensa rápidamente
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="flex h-[600px]">
          {/* Categories Sidebar */}
          <div className="w-64 border-r border-border p-4">
            <h3 className="font-semibold text-foreground mb-4">Categorías</h3>
            <nav className="space-y-1">
              {categories?.map((category) => (
                <button
                  key={category?.id}
                  onClick={() => setSelectedCategory(category?.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedCategory === category?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted/50 text-foreground'
                  }`}
                >
                  <Icon name={category?.icon} size={16} />
                  <span className="text-sm font-medium">{category?.label}</span>
                </button>
              ))}
            </nav>

            {/* Category Stats */}
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="text-sm font-semibold text-foreground mb-3">Estadísticas</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total plantillas:</span>
                  <span className="text-foreground font-medium">
                    {Object.values(rewardTemplates)?.flat()?.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Más usada:</span>
                  <span className="text-foreground font-medium">Café Gratis</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Categorías:</span>
                  <span className="text-foreground font-medium">{categories?.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {categories?.find(c => c?.id === selectedCategory)?.label}
              </h3>
              <p className="text-sm text-muted-foreground">
                {rewardTemplates?.[selectedCategory]?.length} plantilla(s) disponible(s)
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {rewardTemplates?.[selectedCategory]?.map((template) => (
                <div
                  key={template?.id}
                  className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon name={template?.icon} size={24} className="text-primary" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {template?.name}
                        </h4>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Icon name="Users" size={12} />
                          <span>{template?.usage}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {template?.description}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                        <div className="bg-muted/30 rounded p-2">
                          <div className="flex items-center space-x-1 mb-1">
                            <Icon name="Target" size={12} className="text-muted-foreground" />
                            <span className="font-medium text-foreground">Objetivo</span>
                          </div>
                          <p className="text-muted-foreground">
                            {template?.type === 'count' 
                              ? `${template?.targetValue} visitas`
                              : formatCurrency(template?.targetValue)
                            }
                          </p>
                        </div>
                        
                        <div className="bg-muted/30 rounded p-2">
                          <div className="flex items-center space-x-1 mb-1">
                            <Icon name="Gift" size={12} className="text-muted-foreground" />
                            <span className="font-medium text-foreground">Recompensa</span>
                          </div>
                          <p className="text-muted-foreground">
                            {template?.rewardValue}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {template?.category}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="ArrowRight"
                          iconSize={14}
                        >
                          Usar Plantilla
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {rewardTemplates?.[selectedCategory]?.length === 0 && (
              <div className="text-center py-12">
                <Icon name="FileX" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No hay plantillas disponibles
                </h3>
                <p className="text-muted-foreground">
                  Esta categoría no tiene plantillas disponibles por el momento.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Icon name="Lightbulb" size={16} />
              <span>Tip: Puedes personalizar cualquier plantilla después de seleccionarla</span>
            </div>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardTemplatesModal;