import React from 'react';
import Icon from '../../../components/AppIcon';

const FeatureHighlights = () => {
  const features = [
    {
      icon: 'Megaphone',
      title: 'Promociones Inteligentes',
      description: 'Crea y gestiona campañas promocionales con targeting avanzado y programación automática'
    },
    {
      icon: 'Ticket',
      title: 'Cupones Digitales',
      description: 'Genera cupones con códigos QR, seguimiento de uso y análisis de rendimiento en tiempo real'
    },
    {
      icon: 'Star',
      title: 'Sistema de Lealtad',
      description: 'Implementa programas de puntos y recompensas para fidelizar a tus clientes'
    },
    {
      icon: 'BarChart3',
      title: 'Analíticas Detalladas',
      description: 'Obtén insights valiosos sobre el comportamiento de tus clientes y el rendimiento de tus campañas'
    },
    {
      icon: 'Smartphone',
      title: 'Vista Previa en Vivo',
      description: 'Visualiza cómo se verá tu negocio en dispositivos móviles y desktop antes de publicar'
    },
    {
      icon: 'Shield',
      title: 'Moderación Integrada',
      description: 'Sistema de aprobación y moderación de contenido para mantener la calidad de tu marca'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-foreground">
          Todo lo que necesitas para hacer crecer tu negocio
        </h3>
        <p className="text-muted-foreground">
          Herramientas profesionales para gestionar promociones y fidelizar clientes
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features?.map((feature, index) => (
          <div
            key={index}
            className="flex items-start space-x-3 p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow duration-200"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon name={feature?.icon} size={20} className="text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground">{feature?.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {feature?.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Icon name="Zap" size={16} className="text-primary" />
          <span className="text-sm font-semibold text-primary">Configuración Rápida</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Configura tu negocio en menos de 5 minutos y comienza a recibir clientes inmediatamente
        </p>
      </div>
    </div>
  );
};

export default FeatureHighlights;