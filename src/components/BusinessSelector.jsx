import React, { useState, useEffect } from 'react';
import Select from './ui/Select';
import Icon from './AppIcon';

const BusinessSelector = ({ value, onChange, label = "Negocio", error, required = false }) => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock businesses data - in a real app, this would come from the database
  useEffect(() => {
    const mockBusinesses = [
      {
        id: 'all',
        name: 'Todos los negocios',
        type: 'all',
        description: 'Aplicar a todos los negocios registrados'
      },
      {
        id: '1',
        name: 'Restaurante El Jardín',
        type: 'restaurant',
        description: 'Restaurante mexicano - Centro'
      },
      {
        id: '2',
        name: 'Café Premium',
        type: 'cafe',
        description: 'Cafetería especializada - Zona Norte'
      },
      {
        id: '3',
        name: 'Boutique Fashion',
        type: 'retail',
        description: 'Tienda de ropa - Plaza comercial'
      },
      {
        id: '4',
        name: 'Gimnasio Fitness Pro',
        type: 'gym',
        description: 'Centro de entrenamiento - Colonia del Valle'
      },
      {
        id: '5',
        name: 'Spa Relajante',
        type: 'spa',
        description: 'Centro de bienestar - Zona Rosa'
      }
    ];

    // Simulate API call
    setTimeout(() => {
      setBusinesses(mockBusinesses);
      setLoading(false);
    }, 500);
  }, []);

  const getBusinessIcon = (type) => {
    const icons = {
      all: 'Building2',
      restaurant: 'UtensilsCrossed',
      cafe: 'Coffee',
      retail: 'ShoppingBag',
      gym: 'Dumbbell',
      spa: 'Flower'
    };
    return icons?.[type] || 'Building';
  };

  const businessOptions = businesses?.map(business => ({
    value: business?.id,
    label: business?.name,
    description: business?.description,
    icon: getBusinessIcon(business?.type)
  }));

  const CustomOption = ({ option, isSelected }) => (
    <div className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
      isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
    }`}>
      <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary-foreground/20' : 'bg-muted'}`}>
        <Icon name={option?.icon} size={16} />
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
          {option?.label}
        </p>
        {option?.description && (
          <p className={`text-xs ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
            {option?.description}
          </p>
        )}
      </div>
      {option?.value === 'all' && (
        <div className={`px-2 py-1 text-xs rounded-full ${
          isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary text-primary-foreground'
        }`}>
          Global
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
        <div className="flex items-center space-x-2 p-3 border border-border rounded-lg">
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
          <span className="text-sm text-muted-foreground">Cargando negocios...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      
      <Select
        options={businessOptions}
        value={value}
        onChange={onChange}
        placeholder="Selecciona un negocio"
        error={error}
        customOptionRenderer={CustomOption}
        className="w-full"
      />
      
      <div className="text-xs text-muted-foreground">
        <Icon name="Info" size={12} className="inline mr-1" />
        {value === 'all' ?'Esta configuración se aplicará a todos tus negocios registrados' :'Esta configuración se aplicará únicamente al negocio seleccionado'
        }
      </div>
      
      {error && (
        <p className="text-sm text-destructive flex items-center space-x-1">
          <Icon name="AlertCircle" size={14} />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default BusinessSelector;