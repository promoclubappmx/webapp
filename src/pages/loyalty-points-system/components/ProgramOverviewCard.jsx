import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgramOverviewCard = ({ title, value, change, icon, color = 'primary' }) => {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 bg-${color}/10 rounded-lg flex items-center justify-center`}>
            <Icon name={icon} size={24} className={`text-${color}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>
        <div className={`flex items-center space-x-1 ${isPositive ? 'text-success' : 'text-destructive'}`}>
          <Icon name={isPositive ? 'TrendingUp' : 'TrendingDown'} size={16} />
          <span className="text-sm font-medium">{Math.abs(change)}%</span>
        </div>
      </div>
    </div>
  );
};

export default ProgramOverviewCard;