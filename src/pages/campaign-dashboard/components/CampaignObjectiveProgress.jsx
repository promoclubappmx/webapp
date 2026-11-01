import React from 'react';
import Icon from '../../../components/AppIcon';

const OBJETIVO_CONFIG = {
  adquisicion: { label: 'Adquisición', color: 'text-blue-600', bg: 'bg-blue-50', bar: 'bg-blue-500', icono: 'UserPlus', metrica: 'nuevos clientes' },
  reactivacion: { label: 'Reactivación', color: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-500', icono: 'RefreshCw', metrica: 'clientes recuperados' },
  upsell: { label: 'Upsell', color: 'text-green-600', bg: 'bg-green-50', bar: 'bg-green-500', icono: 'TrendingUp', metrica: 'incremento ticket' },
  retencion: { label: 'Retención', color: 'text-rose-600', bg: 'bg-rose-50', bar: 'bg-rose-500', icono: 'Heart', metrica: 'clientes retenidos' },
};

const CampaignObjectiveProgress = ({ campaign }) => {
  const config = OBJETIVO_CONFIG?.[campaign?.objetivo || campaign?.type] || OBJETIVO_CONFIG?.adquisicion;
  const meta = campaign?.meta || 50;
  const actual = campaign?.conversiones || campaign?.metrics?.conversions || 0;
  const porcentaje = Math.min(Math.round((actual / meta) * 100), 100);

  return (
    <div className={`${config?.bg} rounded-2xl p-6 border border-border`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center shadow-sm`}>
            <Icon name={config?.icono} size={24} className={config?.color} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Objetivo: {config?.label}</p>
            <p className="text-xs text-muted-foreground">{config?.metrica}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-foreground">{porcentaje}%</p>
          <p className="text-xs text-muted-foreground">completado</p>
        </div>
      </div>
      <div className="mb-3">
        <div className="flex items-end justify-between mb-2">
          <span className="text-4xl font-bold text-foreground">{actual?.toLocaleString()}</span>
          <span className="text-lg text-muted-foreground">/ {meta.toLocaleString()} {config?.metrica}</span>
        </div>
        <div className="w-full bg-white/60 rounded-full h-4 overflow-hidden">
          <div
            className={`${config?.bar} h-4 rounded-full transition-all duration-700 relative overflow-hidden`}
            style={{ width: `${porcentaje}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-white/60 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-foreground">{campaign?.metrics?.impressions?.toLocaleString() || '0'}</p>
          <p className="text-xs text-muted-foreground">Alcanzados</p>
        </div>
        <div className="bg-white/60 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-foreground">{campaign?.metrics?.clicks?.toLocaleString() || '0'}</p>
          <p className="text-xs text-muted-foreground">Interacciones</p>
        </div>
        <div className="bg-white/60 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-success">{campaign?.metrics?.roi || '0'}x</p>
          <p className="text-xs text-muted-foreground">ROI</p>
        </div>
      </div>
    </div>
  );
};

export default CampaignObjectiveProgress;
