import React from 'react';
import Icon from '../../../components/AppIcon';

const CatalogCategories = ({ selectedCategory, onCategoryChange, items }) => {
  const categories = [
    {
      id: 'all',
      name: 'Todas las Categorías',
      icon: 'Grid3X3',
      count: items?.length || 0
    },
    {
      id: 'platos-principales',
      name: 'Platos Principales',
      icon: 'UtensilsCrossed',
      count: items?.filter(item => item?.category === 'platos-principales')?.length || 0
    },
    {
      id: 'entrantes',
      name: 'Entrantes',
      icon: 'Salad',
      count: items?.filter(item => item?.category === 'entrantes')?.length || 0
    },
    {
      id: 'postres',
      name: 'Postres',
      icon: 'Cake',
      count: items?.filter(item => item?.category === 'postres')?.length || 0
    },
    {
      id: 'bebidas',
      name: 'Bebidas',
      icon: 'Coffee',
      count: items?.filter(item => item?.category === 'bebidas')?.length || 0
    },
    {
      id: 'bebidas-alcoholicas',
      name: 'Bebidas Alcohólicas',
      icon: 'Wine',
      count: items?.filter(item => item?.category === 'bebidas-alcoholicas')?.length || 0
    },
    {
      id: 'menu-infantil',
      name: 'Menú Infantil',
      icon: 'Baby',
      count: items?.filter(item => item?.category === 'menu-infantil')?.length || 0
    },
    {
      id: 'servicios',
      name: 'Servicios',
      icon: 'Wrench',
      count: items?.filter(item => item?.category === 'servicios')?.length || 0
    },
    {
      id: 'eventos',
      name: 'Eventos',
      icon: 'Calendar',
      count: items?.filter(item => item?.category === 'eventos')?.length || 0
    },
    {
      id: 'catering',
      name: 'Catering',
      icon: 'ChefHat',
      count: items?.filter(item => item?.category === 'catering')?.length || 0
    },
    {
      id: 'otros',
      name: 'Otros',
      icon: 'MoreHorizontal',
      count: items?.filter(item => item?.category === 'otros')?.length || 0
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">Categorías</h3>
      <div className="space-y-2">
        {categories?.map(category => (
          <button
            key={category?.id}
            onClick={() => onCategoryChange(category?.id)}
            className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
              selectedCategory === category?.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon 
                name={category?.icon} 
                size={16} 
                className={selectedCategory === category?.id ? 'text-primary-foreground' : 'text-muted-foreground'}
              />
              <span className="text-sm font-medium">{category?.name}</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              selectedCategory === category?.id 
                ? 'bg-primary-foreground/20 text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {category?.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CatalogCategories;