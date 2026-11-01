import React from 'react';
import Icon from '../../../components/AppIcon';

const PromotionStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Promociones Activas',
      value: stats?.active,
      icon: 'Play',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Programadas',
      value: stats?.scheduled,
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'Borradores',
      value: stats?.drafts,
      icon: 'FileText',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted'
    },
    {
      title: 'Total Conversiones',
      value: stats?.totalConversions,
      icon: 'TrendingUp',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statCards?.map((stat, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat?.title}</p>
              <p className="text-2xl font-bold text-foreground">{stat?.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg ${stat?.bgColor} flex items-center justify-center`}>
              <Icon name={stat?.icon} size={24} className={stat?.color} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PromotionStats;