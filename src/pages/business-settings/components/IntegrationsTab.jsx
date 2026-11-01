import React from 'react';
import Icon from '../../../components/AppIcon';

const IntegrationsTab = () => {
  const integrationGroups = [
    {
      title: 'Redes Sociales',
      items: [
        { name: 'WhatsApp Business', desc: 'Envía promociones y cupones por WhatsApp', icon: 'MessageCircle', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
        { name: 'Facebook', desc: 'Sincroniza promociones con tu página de Facebook', icon: 'Facebook', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
        { name: 'Instagram', desc: 'Comparte promociones en Instagram Business', icon: 'Instagram', iconBg: 'bg-pink-100', iconColor: 'text-pink-600' },
      ]
    },
    {
      title: 'Marketing y Analíticas',
      items: [
        { name: 'Google Analytics', desc: 'Rastrea el comportamiento de los usuarios', icon: 'BarChart3', iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
        { name: 'Google Ads', desc: 'Rastrea conversiones de anuncios', icon: 'Target', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
      ]
    },
    {
      title: 'Pagos',
      items: [
        { name: 'Stripe', desc: 'Procesa pagos de promociones premium', icon: 'CreditCard', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
      ]
    },
    {
      title: 'Webhooks',
      items: [
        { name: 'Promoción Creada', desc: 'Se activa cuando se publica una nueva promoción', icon: 'Megaphone', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
        { name: 'Cupón Canjeado', desc: 'Se activa cuando un cliente canjea un cupón', icon: 'Ticket', iconBg: 'bg-teal-100', iconColor: 'text-teal-600' },
        { name: 'Pago Procesado', desc: 'Se activa cuando se procesa un pago exitoso', icon: 'DollarSign', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
        { name: 'Cliente Registrado', desc: 'Se activa cuando un nuevo cliente se registra', icon: 'UserPlus', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
      ]
    },
  ];

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <Icon name="Info" size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Integraciones no disponibles</p>
          <p className="text-xs text-amber-700 mt-0.5">Las integraciones con servicios externos estarán disponibles próximamente. Mantente al tanto de las actualizaciones de la plataforma.</p>
        </div>
      </div>

      {integrationGroups?.map(group => (
        <div key={group?.title} className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">{group?.title}</h3>
          <div className="space-y-3">
            {group?.items?.map(item => (
              <div key={item?.name} className="border border-border rounded-lg p-4 opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${item?.iconBg} rounded-lg flex items-center justify-center`}>
                      <Icon name={item?.icon} size={20} className={item?.iconColor} />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground text-sm">{item?.name}</h4>
                      <p className="text-xs text-muted-foreground">{item?.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                      Próximamente
                    </span>
                    {/* Disabled toggle */}
                    <div className="relative inline-flex items-center opacity-50 cursor-not-allowed">
                      <div className="w-11 h-6 bg-muted rounded-full">
                        <div className="absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default IntegrationsTab;
