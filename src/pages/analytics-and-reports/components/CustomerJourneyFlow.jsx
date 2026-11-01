import React from 'react';
import Icon from '../../../components/AppIcon';

const CustomerJourneyFlow = ({ journeyData }) => {
  const stages = [
    {
      id: 'discovery',
      label: 'Descubrimiento',
      icon: 'Eye',
      description: 'Cliente descubre el negocio'
    },
    {
      id: 'engagement',
      label: 'Engagement',
      icon: 'Heart',
      description: 'Interacción con promociones'
    },
    {
      id: 'conversion',
      label: 'Conversión',
      icon: 'ShoppingCart',
      description: 'Primera compra'
    },
    {
      id: 'loyalty',
      label: 'Lealtad',
      icon: 'Star',
      description: 'Programa de fidelización'
    },
    {
      id: 'advocacy',
      label: 'Recomendación',
      icon: 'Share2',
      description: 'Cliente recomienda'
    }
  ];

  const getStageMetrics = (stageId) => {
    return journeyData?.find(stage => stage?.id === stageId) || { users: 0, conversionRate: 0 };
  };

  const getConversionRate = (currentStage, nextStage) => {
    const current = getStageMetrics(currentStage);
    const next = getStageMetrics(nextStage);
    
    if (current?.users === 0) return 0;
    return ((next?.users / current?.users) * 100)?.toFixed(1);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Customer Journey Analytics</h3>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Icon name="Info" size={14} />
          <span>Últimos 30 días</span>
        </div>
      </div>
      <div className="space-y-6">
        {stages?.map((stage, index) => {
          const metrics = getStageMetrics(stage?.id);
          const nextStage = stages?.[index + 1];
          const conversionRate = nextStage ? getConversionRate(stage?.id, nextStage?.id) : null;

          return (
            <div key={stage?.id} className="relative">
              {/* Stage Card */}
              <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon name={stage?.icon} size={20} className="text-primary" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground">{stage?.label}</h4>
                  <p className="text-xs text-muted-foreground">{stage?.description}</p>
                </div>
                
                <div className="flex-shrink-0 text-right">
                  <p className="text-lg font-bold text-foreground">
                    {metrics?.users?.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">usuarios</p>
                </div>
              </div>
              {/* Conversion Arrow */}
              {nextStage && (
                <div className="flex items-center justify-center py-2">
                  <div className="flex items-center space-x-2 bg-background border border-border rounded-full px-3 py-1">
                    <Icon name="ArrowDown" size={14} className="text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">
                      {conversionRate}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">
              {getConversionRate('discovery', 'advocacy')}%
            </p>
            <p className="text-xs text-muted-foreground">Conversión total</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">
              {journeyData?.reduce((sum, stage) => sum + stage?.users, 0)?.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Total usuarios</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">
              {(journeyData?.reduce((sum, stage) => sum + stage?.users, 0) / stages?.length)?.toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground">Promedio por etapa</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerJourneyFlow;