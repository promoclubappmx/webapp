import React from 'react';
import Icon from '../../../components/AppIcon';

const PLANTILLAS = [
  {
    id: 'reactiva-dormidos',
    nombre: 'Reactiva clientes dormidos',
    objetivo: 'Reactivación',
    objetivoColor: 'bg-amber-100 text-amber-700',
    descripcion: 'Recupera clientes que no han visitado en más de 30 días con una oferta especial.',
    resultado: '+18% canjes',
    icono: 'RefreshCw',
    iconoBg: 'bg-amber-50',
    iconoColor: 'text-amber-500',
    data: {
      objetivo: 'reactivacion',
      segmentos: ['dormidos'],
      secuencia: [
        { id: 1, canal: 'push', mensaje: '¡Te extrañamos! Vuelve y obtén un descuento especial.', retraso: 0 },
        { id: 2, canal: 'cupon', mensaje: 'Cupón 20% de descuento en tu próxima visita.', retraso: 3 },
      ],
    },
  },
  {
    id: 'atrae-nuevos',
    nombre: 'Atrae clientes nuevos',
    objetivo: 'Adquisición',
    objetivoColor: 'bg-blue-100 text-blue-700',
    descripcion: 'Capta la atención de clientes potenciales con una primera oferta irresistible.',
    resultado: '+24% nuevos registros',
    icono: 'UserPlus',
    iconoBg: 'bg-blue-50',
    iconoColor: 'text-blue-500',
    data: {
      objetivo: 'adquisicion',
      segmentos: ['nuevos'],
      secuencia: [
        { id: 1, canal: 'push', mensaje: '¡Bienvenido! Disfruta tu primera visita con un regalo especial.', retraso: 0 },
        { id: 2, canal: 'email', mensaje: 'Conoce todos los beneficios de ser parte de nuestra comunidad.', retraso: 2 },
      ],
    },
  },
  {
    id: 'aumenta-ticket',
    nombre: 'Aumenta tu ticket promedio',
    objetivo: 'Upsell',
    objetivoColor: 'bg-green-100 text-green-700',
    descripcion: 'Incentiva a tus clientes actuales a gastar más con ofertas de productos premium.',
    resultado: '+15% ticket promedio',
    icono: 'TrendingUp',
    iconoBg: 'bg-green-50',
    iconoColor: 'text-green-500',
    data: {
      objetivo: 'upsell',
      segmentos: ['todos'],
      secuencia: [
        { id: 1, canal: 'push', mensaje: 'Descubre nuestros productos premium con descuento exclusivo.', retraso: 0 },
        { id: 2, canal: 'cupon', mensaje: 'Cupón especial: 2x1 en productos seleccionados.', retraso: 5 },
      ],
    },
  },
  {
    id: 'cumpleanos',
    nombre: 'Campaña de cumpleaños',
    objetivo: 'Fidelización',
    objetivoColor: 'bg-purple-100 text-purple-700',
    descripcion: 'Sorprende a tus clientes en su día especial con un regalo personalizado.',
    resultado: '+32% satisfacción',
    icono: 'Gift',
    iconoBg: 'bg-purple-50',
    iconoColor: 'text-purple-500',
    data: {
      objetivo: 'adquisicion',
      segmentos: ['vip'],
      secuencia: [
        { id: 1, canal: 'push', mensaje: '¡Feliz cumpleaños! Tienes un regalo especial esperándote.', retraso: 0 },
        { id: 2, canal: 'cupon', mensaje: 'Cupón de regalo de cumpleaños — válido por 7 días.', retraso: 0 },
      ],
    },
  },
];

const CampaignTemplates = ({ onSelectTemplate }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="LayoutTemplate" size={20} className="text-primary" />
        <h2 className="text-base font-semibold text-foreground">Plantillas de campaña</h2>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Basado en negocios similares</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANTILLAS?.map(plantilla => (
          <button
            key={plantilla?.id}
            onClick={() => onSelectTemplate(plantilla)}
            className="flex flex-col items-start p-4 bg-card border border-border rounded-xl hover:border-primary hover:shadow-md transition-all text-left group"
          >
            <div className={`w-10 h-10 rounded-xl ${plantilla?.iconoBg} flex items-center justify-center mb-3`}>
              <Icon name={plantilla?.icono} size={20} className={plantilla?.iconoColor} />
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${plantilla?.objetivoColor}`}>
              {plantilla?.objetivo}
            </span>
            <p className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
              {plantilla?.nombre}
            </p>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{plantilla?.descripcion}</p>
            <div className="flex items-center gap-1 mt-auto">
              <Icon name="TrendingUp" size={12} className="text-green-500" />
              <span className="text-xs text-green-600 font-medium">{plantilla?.resultado}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CampaignTemplates;
