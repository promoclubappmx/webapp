import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const NextActionsPanel = ({ checklist = [], planInfo = {} }) => {
  const navigate = useNavigate();

  // Define action mappings for each checklist item
  const actionMappings = {
    'complete_business_profile': {
      title: 'Completar Perfil de Negocio',
      description: 'Agrega descripción, fotos y datos de contacto',
      icon: 'Building',
      link: '/business-listings-management',
      priority: 'high'
    },
    'add_catalog_items': {
      title: 'Agregar Productos/Servicios',
      description: 'Sube tu catálogo completo al sistema',
      icon: 'Package',
      link: '/catalog-management',
      priority: 'high'
    },
    'configure_payment_method': {
      title: 'Configurar Método de Pago',
      description: 'Actualiza tu información de facturación',
      icon: 'CreditCard',
      link: '/billing',
      priority: 'medium'
    },
    'setup_business_hours': {
      title: 'Configurar Horarios',
      description: 'Define tu horario de atención',
      icon: 'Clock',
      link: '/business-settings',
      priority: 'medium'
    },
    'add_business_location': {
      title: 'Agregar Ubicación',
      description: 'Configura la ubicación de tu negocio',
      icon: 'MapPin',
      link: '/business-listings-management',
      priority: 'high'
    },
    'configure_loyalty_program': {
      title: 'Configurar Programa de Puntos',
      description: 'Define cómo tus clientes ganan puntos',
      icon: 'Star',
      link: '/loyalty-points-system',
      priority: 'low'
    },
    'create_first_promotion': {
      title: 'Crear Primera Promoción',
      description: 'Atrae clientes con ofertas exclusivas',
      icon: 'Megaphone',
      link: '/promotions-management',
      priority: 'low'
    },
    'setup_staff_accounts': {
      title: 'Configurar Cuentas de Personal',
      description: 'Invita a tu equipo a la plataforma',
      icon: 'Users',
      link: '/staff-management',
      priority: 'low'
    }
  };

  // Get pending actions from checklist
  const pendingActions = checklist
    ?.filter(item => !item?.completed)
    ?.map(item => ({
      ...item,
      ...actionMappings?.[item?.id],
      checklistId: item?.id
    }))
    ?.filter(action => action?.link); // Only include items with valid links

  // Sort by priority: high > medium > low
  const priorityOrder = { high: 1, medium: 2, low: 3 };
  const sortedActions = pendingActions?.sort((a, b) => {
    return (priorityOrder?.[a?.priority] || 999) - (priorityOrder?.[b?.priority] || 999);
  });

  // Get top 3 priority actions
  const topActions = sortedActions?.slice(0, 3);

  // Additional quick links based on plan
  const planQuickLinks = planInfo?.nextSteps || [];

  const getPriorityBadge = (priority) => {
    const configs = {
      high: { label: 'Urgente', color: 'bg-red-100 text-red-700 border-red-300' },
      medium: { label: 'Importante', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      low: { label: 'Opcional', color: 'bg-blue-100 text-blue-700 border-blue-300' }
    };
    return configs?.[priority] || configs?.medium;
  };

  const handleActionClick = (link) => {
    navigate(link);
  };

  if (topActions?.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-8 text-center">
        <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="CheckCircle" size={40} className="text-white" />
        </div>
        <h3 className="text-2xl font-bold text-blue-900 mb-2">
          ¡Todo Listo!
        </h3>
        <p className="text-blue-700 mb-4">
          Has completado todas las tareas de configuración inicial.
        </p>
        <Button
          variant="default"
          onClick={() => navigate('/dashboard-overview')}
          iconName="ArrowRight"
          iconPosition="right"
        >
          Ir al Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Priority Actions */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <Icon name="Zap" size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Próximas Acciones Requeridas</h2>
              <p className="text-sm text-gray-600">Tareas prioritarias para activar tu negocio</p>
            </div>
          </div>
          <div className="bg-orange-100 px-3 py-1 rounded-full">
            <span className="text-sm font-bold text-orange-700">{topActions?.length} pendientes</span>
          </div>
        </div>

        <div className="space-y-3">
          {topActions?.map((action, index) => {
            const priorityBadge = getPriorityBadge(action?.priority);
            
            return (
              <div
                key={action?.checklistId || index}
                className="group relative flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => handleActionClick(action?.link)}
              >
                {/* Priority Number */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-lg">{index + 1}</span>
                  </div>
                </div>

                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name={action?.icon} size={24} className="text-primary" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors">
                      {action?.title}
                    </h3>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border flex-shrink-0 ${
                      priorityBadge?.color
                    }`}>
                      {priorityBadge?.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {action?.description}
                  </p>
                  {action?.estimated_time && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Icon name="Clock" size={12} />
                      <span>{action?.estimated_time}</span>
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icon name="ArrowRight" size={24} className="text-primary" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Links Section */}
      {planQuickLinks?.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Icon name="Rocket" size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-900">Enlaces Rápidos</h3>
              <p className="text-sm text-blue-700">Accesos directos a funciones clave</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {planQuickLinks?.map((link, index) => (
              <button
                key={index}
                onClick={() => handleActionClick(link?.link)}
                className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all text-left group"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                  <Icon name={link?.icon} size={20} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-blue-900 group-hover:text-blue-700">
                    {link?.title}
                  </h4>
                  <p className="text-xs text-blue-600 truncate">
                    {link?.description}
                  </p>
                </div>
                <Icon name="ExternalLink" size={16} className="text-blue-500 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="HelpCircle" size={24} className="text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">¿Necesitas Ayuda?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Si tienes dudas sobre cómo completar estas tareas, consulta nuestra guía o contacta a soporte.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                iconName="Book"
                onClick={() => window.open('https://help.promoclub.com', '_blank')}
              >
                Ver Guía
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="MessageCircle"
                onClick={() => navigate('/settings')}
              >
                Contactar Soporte
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NextActionsPanel;