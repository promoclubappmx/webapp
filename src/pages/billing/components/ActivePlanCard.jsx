import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { useCurrency } from '../../../contexts/CurrencyContext';

const ActivePlanCard = ({ currentPlan, planStartDate, autoRenew, onChangePlan }) => {
  const planDetails = {
    free: {
      name: 'Free',
      price: 0,
      color: 'bg-gray-100',
      textColor: 'text-gray-900',
      icon: 'Package'
    },
    pro: {
      name: 'Pro',
      price: 499,
      color: 'bg-blue-100',
      textColor: 'text-blue-900',
      icon: 'Zap'
    },
    premium: {
      name: 'Premium',
      price: 1299,
      color: 'bg-purple-100',
      textColor: 'text-purple-900',
      icon: 'Crown'
    }
  };

  const plan = planDetails?.[currentPlan] || planDetails?.free;
  const formattedDate = planStartDate 
    ? new Date(planStartDate)?.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date('2024-01-15')?.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

  const nextBillingDate = planStartDate
    ? new Date(new Date(planStartDate).setMonth(new Date(planStartDate).getMonth() + 1))?.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date('2024-02-15')?.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

  const { formatPrice } = useCurrency();

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8 text-white shadow-lg">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Icon name={plan?.icon} size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Plan {plan?.name}</h3>
              <p className="text-blue-100 text-sm">Plan actual</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold">{formatPrice(plan?.price)}</div>
          <div className="text-blue-100 text-sm">MXN/mes</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="Calendar" size={16} className="text-blue-200" />
            <span className="text-sm text-blue-100">Fecha de inicio</span>
          </div>
          <p className="font-semibold">{formattedDate}</p>
        </div>

        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="RefreshCw" size={16} className="text-blue-200" />
            <span className="text-sm text-blue-100">Próxima renovación</span>
          </div>
          <p className="font-semibold">{nextBillingDate}</p>
        </div>

        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="CheckCircle" size={16} className="text-blue-200" />
            <span className="text-sm text-blue-100">Estado</span>
          </div>
          <p className="font-semibold">Activo</p>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          variant="default"
          onClick={onChangePlan}
          className="flex-1 bg-white text-blue-600 hover:bg-blue-50"
        >
          <Icon name="TrendingUp" size={18} className="mr-2" />
          Cambiar Plan
        </Button>
        <Button
          variant="outline"
          className="border-white/30 text-white hover:bg-white/10"
        >
          <Icon name="Download" size={18} className="mr-2" />
          Descargar Factura
        </Button>
      </div>
    </div>
  );
};

export default ActivePlanCard;