import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { useCurrency } from '../../../contexts/CurrencyContext';

const PlanComparison = ({ currentPlan, onSelectPlan }) => {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      description: 'Ficha básica para comenzar',
      features: [
        { name: 'Perfil de negocio básico', included: true },
        { name: 'Hasta 10 productos en catálogo', included: true },
        { name: 'Estadísticas básicas', included: true },
        { name: 'Soporte por email', included: true },
        { name: 'Productos ilimitados', included: false },
        { name: 'Sistema de promociones', included: false },
        { name: 'Programa de puntos', included: false },
        { name: 'Geofencing', included: false },
        { name: 'Análisis predictivo', included: false }
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 499,
      description: 'Promociones + Puntos + Cupones',
      recommended: true,
      features: [
        { name: 'Perfil de negocio básico', included: true },
        { name: 'Hasta 10 productos en catálogo', included: true },
        { name: 'Estadísticas básicas', included: true },
        { name: 'Soporte por email', included: true },
        { name: 'Productos ilimitados', included: true },
        { name: 'Sistema de promociones', included: true },
        { name: 'Programa de puntos', included: true },
        { name: 'Geofencing', included: false },
        { name: 'Análisis predictivo', included: false }
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 1299,
      description: 'Geofencing + Boosts + Heatmaps',
      features: [
        { name: 'Perfil de negocio básico', included: true },
        { name: 'Hasta 10 productos en catálogo', included: true },
        { name: 'Estadísticas básicas', included: true },
        { name: 'Soporte por email', included: true },
        { name: 'Productos ilimitados', included: true },
        { name: 'Sistema de promociones', included: true },
        { name: 'Programa de puntos', included: true },
        { name: 'Geofencing', included: true },
        { name: 'Análisis predictivo', included: true }
      ]
    }
  ];

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    if (onSelectPlan) {
      onSelectPlan(planId);
    }
  };

  const { formatPrice } = useCurrency();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Comparación de Planes</h3>
        <p className="text-gray-600">Elige el plan que mejor se adapte a tu negocio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans?.map((plan) => (
          <div
            key={plan?.id}
            className={`relative border-2 rounded-xl p-6 transition-all duration-200 ${
              selectedPlan === plan?.id
                ? 'border-blue-600 bg-blue-50 shadow-lg'
                : 'border-gray-200 hover:border-blue-300'
            } ${
              currentPlan === plan?.id ? 'ring-2 ring-green-500' : ''
            }`}
          >
            {plan?.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold px-3 py-1 rounded-full">
                  ⭐ Recomendado
                </span>
              </div>
            )}

            {currentPlan === plan?.id && (
              <div className="absolute -top-3 right-4">
                <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                  <Icon name="CheckCircle" size={12} />
                  <span>Actual</span>
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">{plan?.name}</h4>
              <p className="text-sm text-gray-600 mb-4">{plan?.description}</p>
              <div className="flex items-baseline justify-center space-x-1">
                <span className="text-4xl font-bold text-gray-900">{formatPrice(plan?.price)}</span>
                <span className="text-gray-600">MXN/mes</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {plan?.features?.map((feature, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <Icon
                    name={feature?.included ? 'Check' : 'X'}
                    size={18}
                    className={feature?.included ? 'text-green-600 mt-0.5' : 'text-gray-300 mt-0.5'}
                  />
                  <span className={`text-sm ${
                    feature?.included ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                    {feature?.name}
                  </span>
                </div>
              ))}
            </div>

            <Button
              variant={selectedPlan === plan?.id ? 'default' : 'outline'}
              className="w-full"
              onClick={() => handleSelectPlan(plan?.id)}
              disabled={currentPlan === plan?.id}
            >
              {currentPlan === plan?.id ? (
                'Plan Actual'
              ) : currentPlan === 'free' && plan?.id !== 'free' ? (
                <>Actualizar a {plan?.name}</>
              ) : plan?.id === 'free' ? (
                'Cambiar a Free'
              ) : (
                <>Cambiar a {plan?.name}</>
              )}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">Información sobre cambios de plan</p>
            <p className="text-sm text-blue-800">
              Los cambios de plan se aplican inmediatamente. Si actualizas, se te cobrará la diferencia prorrateada.
              Si reduces tu plan, el cambio se aplicará al final del período de facturación actual.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanComparison;