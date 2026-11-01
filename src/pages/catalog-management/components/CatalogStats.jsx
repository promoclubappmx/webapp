import React from 'react';
import Icon from '../../../components/AppIcon';

const CatalogStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Productos',
      value: stats?.totalProducts || 0,
      icon: 'Package',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Servicios',
      value: stats?.totalServices || 0,
      icon: 'Wrench',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Elementos Activos',
      value: stats?.activeItems || 0,
      icon: 'CheckCircle',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Destacados',
      value: stats?.featuredItems || 0,
      icon: 'Star',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Categorías',
      value: stats?.totalCategories || 0,
      icon: 'Tag',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Stock Bajo',
      value: stats?.lowStockItems || 0,
      icon: 'AlertTriangle',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {statCards?.map((stat, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{stat?.title}</p>
              <p className="text-2xl font-bold text-foreground">{stat?.value}</p>
            </div>
            <div className={`w-10 h-10 rounded-full ${stat?.bgColor} flex items-center justify-center`}>
              <Icon name={stat?.icon} size={20} className={stat?.color} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CatalogStats;