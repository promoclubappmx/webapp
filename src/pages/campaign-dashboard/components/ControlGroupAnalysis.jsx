import React from 'react';
import Icon from '../../../components/AppIcon';

const ControlGroupAnalysis = ({ campaign }) => {
  const campana = { visitas: 38, revenue: 12400, usuarios: 378 };
  const control = { visitas: 22, revenue: 7200, usuarios: 42 };
  const visitasIncrementales = campana?.visitas - control?.visitas;
  const revenueIncremental = campana?.revenue - control?.revenue;
  const impactoVisitas = Math.round(((campana?.visitas - control?.visitas) / control?.visitas) * 100);

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Icon name="Shield" size={18} className="text-primary" />
          Análisis de Grupo de Control
        </h3>
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
          <Icon name="Shield" size={11} />
          Con medición de impacto
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1">
            <Icon name="Megaphone" size={12} />
            Grupo Campaña
          </p>
          <p className="text-2xl font-bold text-foreground">{campana?.visitas}%</p>
          <p className="text-xs text-muted-foreground">tasa de visita</p>
          <p className="text-sm font-medium text-foreground mt-1">${campana?.revenue?.toLocaleString()} MXN</p>
          <p className="text-xs text-muted-foreground">{campana?.usuarios} usuarios</p>
        </div>
        <div className="bg-muted/50 border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
            <Icon name="EyeOff" size={12} />
            Grupo Control
          </p>
          <p className="text-2xl font-bold text-foreground">{control?.visitas}%</p>
          <p className="text-xs text-muted-foreground">tasa de visita</p>
          <p className="text-sm font-medium text-foreground mt-1">${control?.revenue?.toLocaleString()} MXN</p>
          <p className="text-xs text-muted-foreground">{control?.usuarios} usuarios</p>
        </div>
      </div>
      <div className="bg-success/10 border border-success/30 rounded-xl p-4">
        <p className="text-sm font-semibold text-success mb-2">Impacto incremental real</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-2xl font-bold text-success">+{visitasIncrementales}%</p>
            <p className="text-xs text-muted-foreground">visitas incrementales</p>
            <p className="text-xs text-success">{impactoVisitas}% más que sin campaña</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-success">+${revenueIncremental?.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">revenue incremental</p>
            <p className="text-xs text-success">Revenue que no habría ocurrido</p>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1">
        <Icon name="Info" size={12} className="flex-shrink-0 mt-0.5" />
        El {control?.usuarios} usuarios del grupo control no recibieron ninguna comunicación. La diferencia en comportamiento representa el impacto causal real de la campaña.
      </p>
    </div>
  );
};

export default ControlGroupAnalysis;
