import React from 'react';
import Icon from '../../../components/AppIcon';

const ControlGroupPanel = ({ data, onChange }) => {
  const handleToggle = () => {
    onChange({ ...data, controlGroupEnabled: !data?.controlGroupEnabled });
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Header toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
            <Icon name="ShieldCheck" size={18} className="text-purple-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">Grupo de control</p>
              {data?.controlGroupEnabled && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Con medición de impacto</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Mide el impacto real separando correlación de causalidad</p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            data?.controlGroupEnabled ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            data?.controlGroupEnabled ? 'translate-x-6' : 'translate-x-0'
          }`} />
        </button>
      </div>

      {data?.controlGroupEnabled && (
        <div className="p-4 space-y-4">
          {/* Explicación */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-xs text-purple-700">Este grupo no recibirá la campaña, lo que nos permite medir el impacto real de tus acciones. Los usuarios del control no saben que están en él — simplemente no reciben comunicaciones de esta campaña.</p>
          </div>

          {/* Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Porcentaje sin campaña</label>
              <span className="text-lg font-bold text-primary">{data?.controlGroupPercent || 10}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={20}
              step={5}
              value={data?.controlGroupPercent || 10}
              onChange={e => onChange({ ...data, controlGroupPercent: parseInt(e?.target?.value) })}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>10% (recomendado)</span>
              <span>20% (máximo)</span>
            </div>
          </div>

          {/* Visualización */}
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs font-medium text-foreground mb-2">Distribución de audiencia</p>
            <div className="flex rounded-full overflow-hidden h-4">
              <div
                className="bg-primary flex items-center justify-center"
                style={{ width: `${100 - (data?.controlGroupPercent || 10)}%` }}
              >
                <span className="text-xs text-white font-medium">{100 - (data?.controlGroupPercent || 10)}%</span>
              </div>
              <div
                className="bg-purple-400 flex items-center justify-center"
                style={{ width: `${data?.controlGroupPercent || 10}%` }}
              >
                <span className="text-xs text-white font-medium">{data?.controlGroupPercent || 10}%</span>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Reciben campaña</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-purple-400" />
                <span className="text-xs text-muted-foreground">Grupo de control</span>
              </div>
            </div>
          </div>

          {/* Métricas que se medirán */}
          <div>
            <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
              <Icon name="TrendingUp" size={12} className="text-primary" />
              Al finalizar verás
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Visitas incrementales', icon: 'Users', color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Revenue incremental', icon: 'DollarSign', color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Impacto real vs orgánico', icon: 'BarChart2', color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'ROI verdadero', icon: 'Target', color: 'text-orange-600', bg: 'bg-orange-50' },
              ]?.map(m => (
                <div key={m?.label} className={`flex items-center gap-2 p-2 ${m?.bg} rounded-lg`}>
                  <Icon name={m?.icon} size={14} className={m?.color} />
                  <span className={`text-xs font-medium ${m?.color}`}>{m?.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlGroupPanel;
