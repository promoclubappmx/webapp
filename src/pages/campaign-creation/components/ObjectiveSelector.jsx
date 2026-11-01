import React from 'react';
import Icon from '../../../components/AppIcon';

const OBJECTIVES = [
  {
    id: 'adquisicion',
    nombre: 'Adquisición',
    descripcion: 'Atraer clientes que nunca han visitado el negocio',
    metricaNorte: 'Nuevos clientes atribuidos',
    icono: 'UserPlus',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    ring: 'ring-blue-200',
    accionesTipicas: ['Promo de primera visita', 'Flash deal con push', 'Cupón de bienvenida', 'Story patrocinada'],
    audienciaSugerida: 'Usuarios cercanos que nunca han visitado',
  },
  {
    id: 'reactivacion',
    nombre: 'Reactivación',
    descripcion: 'Recuperar clientes que dejaron de venir',
    metricaNorte: 'Clientes dormidos recuperados',
    icono: 'RefreshCw',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-500',
    ring: 'ring-amber-200',
    accionesTipicas: ['Cupón de recuperación escalado', 'Push personalizado "Te extrañamos"', 'Email con novedades', 'WhatsApp con oferta final'],
    audienciaSugerida: 'Clientes sin visita en 30+ días',
  },
  {
    id: 'upsell',
    nombre: 'Upsell',
    descripcion: 'Aumentar el ticket promedio de clientes actuales',
    metricaNorte: 'Incremento en ticket promedio',
    icono: 'TrendingUp',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-500',
    ring: 'ring-green-200',
    accionesTipicas: ['Promo de combo o bundle', 'Puntos dobles en productos premium', 'Sugerencia de upgrade', 'Cross-sell con negocio cercano'],
    audienciaSugerida: 'Clientes recurrentes con ticket menor al promedio',
  },
  {
    id: 'retencion',
    nombre: 'Retención',
    descripcion: 'Mantener a los mejores clientes activos y contentos',
    metricaNorte: 'Churn rate del segmento',
    icono: 'Heart',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-500',
    ring: 'ring-rose-200',
    accionesTipicas: ['Acceso anticipado VIP', 'Experiencia exclusiva', 'Puntos bonus por racha', 'Reconocimiento social'],
    audienciaSugerida: 'Clientes con 5+ visitas en los últimos 60 días',
  },
];

const ObjectiveSelector = ({ selected, onSelect }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-1">¿Cuál es el objetivo de tu campaña?</h3>
      <p className="text-sm text-muted-foreground mb-6">El objetivo determina las métricas, audiencia sugerida y templates disponibles.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {OBJECTIVES?.map(obj => (
          <button
            key={obj?.id}
            onClick={() => onSelect(obj?.id)}
            className={`flex flex-col gap-3 p-5 rounded-xl border-2 text-left transition-all ${
              selected === obj?.id
                ? `${obj?.border} ${obj?.bg} ring-4 ${obj?.ring}`
                : 'border-border hover:border-primary/40 bg-card hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 rounded-xl ${obj?.bg} flex items-center justify-center flex-shrink-0 border ${selected === obj?.id ? obj?.border : 'border-transparent'}`}>
                <Icon name={obj?.icono} size={24} className={obj?.color} />
              </div>
              {selected === obj?.id && (
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${obj?.bg} ${obj?.border} border-2`}>
                  <Icon name="Check" size={14} className={obj?.color} />
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-foreground text-base">{obj?.nombre}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{obj?.descripcion}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon name="Target" size={13} className="text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Métrica norte:</span> {obj?.metricaNorte}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Users" size={13} className="text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Audiencia:</span> {obj?.audienciaSugerida}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/50">
              {obj?.accionesTipicas?.map((accion, i) => (
                <span key={i} className="text-xs bg-background border border-border rounded-full px-2 py-0.5 text-muted-foreground">{accion}</span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export { OBJECTIVES };
export default ObjectiveSelector;
