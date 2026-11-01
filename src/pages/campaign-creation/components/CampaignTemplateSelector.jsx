import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const TEMPLATES = {
  adquisicion: [
    {
      id: 'conquista-zona',
      nombre: 'Conquista tu zona',
      descripcion: 'Flash deal + push + story + cupón primera visita',
      resultado: '+24% nuevos clientes',
      duracion: '7 días',
      pasos: 4,
    },
    {
      id: 'apertura-relanzamiento',
      nombre: 'Apertura / Relanzamiento',
      descripcion: 'Secuencia de 7 días con reveal progresivo',
      resultado: '+31% alcance',
      duracion: '7 días',
      pasos: 5,
    },
    {
      id: 'evento-local',
      nombre: 'Evento local',
      descripcion: 'Previo + durante + post evento',
      resultado: '+18% asistencia',
      duracion: '5 días',
      pasos: 3,
    },
  ],
  reactivacion: [
    {
      id: 'te-extranamos',
      nombre: 'Te extrañamos',
      descripcion: 'Secuencia escalada de 3 pasos con descuento creciente',
      resultado: '+18% clientes recuperados',
      duracion: '14 días',
      pasos: 3,
    },
    {
      id: 'reconquista-vips',
      nombre: 'Reconquista VIPs dormidos',
      descripcion: 'Oferta exclusiva + reconocimiento personalizado',
      resultado: '+28% reactivación VIP',
      duracion: '10 días',
      pasos: 4,
    },
    {
      id: 'campana-regreso',
      nombre: 'Campaña de regreso',
      descripcion: 'Push + email + WhatsApp en 14 días',
      resultado: '+22% retorno',
      duracion: '14 días',
      pasos: 4,
    },
  ],
  upsell: [
    {
      id: 'sube-ticket',
      nombre: 'Sube tu ticket',
      descripcion: 'Combo + puntos dobles en productos de mayor margen',
      resultado: '+15% ticket promedio',
      duracion: '7 días',
      pasos: 3,
    },
    {
      id: 'prueba-algo-nuevo',
      nombre: 'Prueba algo nuevo',
      descripcion: 'Descuento en categoría que el cliente no ha probado',
      resultado: '+20% cross-sell',
      duracion: '5 días',
      pasos: 2,
    },
    {
      id: 'bundle-temporada',
      nombre: 'Bundle de temporada',
      descripcion: 'Paquete especial con productos complementarios',
      resultado: '+19% valor por visita',
      duracion: '10 días',
      pasos: 3,
    },
  ],
  retencion: [
    {
      id: 'premia-mejores',
      nombre: 'Premia a tus mejores',
      descripcion: 'Experiencia exclusiva VIP con acceso anticipado',
      resultado: '-12% churn VIP',
      duracion: '30 días',
      pasos: 4,
    },
    {
      id: 'racha-visitas',
      nombre: 'Racha de visitas',
      descripcion: 'Puntos multiplicados por visitas consecutivas',
      resultado: '+35% frecuencia',
      duracion: '21 días',
      pasos: 3,
    },
    {
      id: 'aniversario-cliente',
      nombre: 'Aniversario del cliente',
      descripcion: 'Regalo especial por antigüedad como cliente',
      resultado: '+40% satisfacción',
      duracion: '3 días',
      pasos: 2,
    },
  ],
};

const OBJ_CONFIG = {
  adquisicion: { label: 'Adquisición', color: 'bg-blue-100 text-blue-700', icon: 'UserPlus' },
  reactivacion: { label: 'Reactivación', color: 'bg-amber-100 text-amber-700', icon: 'RefreshCw' },
  upsell: { label: 'Upsell', color: 'bg-green-100 text-green-700', icon: 'TrendingUp' },
  retencion: { label: 'Retención', color: 'bg-rose-100 text-rose-700', icon: 'Heart' },
};

const CampaignTemplateSelector = ({ selectedObjective, onSelectTemplate }) => {
  const [activeTab, setActiveTab] = useState(selectedObjective || 'adquisicion');

  const templates = TEMPLATES?.[activeTab] || [];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Icon name="LayoutTemplate" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Plantillas pre-diseñadas</h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Basado en negocios similares</span>
      </div>
      {/* Tabs por objetivo */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {Object.entries(OBJ_CONFIG)?.map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === key ? cfg?.color + ' ring-2 ring-current/30' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Icon name={cfg?.icon} size={12} />
            {cfg?.label}
          </button>
        ))}
      </div>
      {/* Grid de templates */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {templates?.map(template => {
          const cfg = OBJ_CONFIG?.[activeTab];
          return (
            <button
              key={template?.id}
              onClick={() => onSelectTemplate({ ...template, objective: activeTab })}
              className="flex flex-col items-start p-4 bg-card border border-border rounded-xl hover:border-primary hover:shadow-md transition-all text-left group"
            >
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${cfg?.color}`}>
                {cfg?.label}
              </span>
              <p className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                {template?.nombre}
              </p>
              <p className="text-xs text-muted-foreground mb-3 flex-1">{template?.descripcion}</p>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1">
                  <Icon name="TrendingUp" size={11} className="text-green-500" />
                  <span className="text-xs text-green-600 font-medium">{template?.resultado}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-0.5"><Icon name="Clock" size={10} /> {template?.duracion}</span>
                  <span className="flex items-center gap-0.5"><Icon name="Layers" size={10} /> {template?.pasos} pasos</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CampaignTemplateSelector;
