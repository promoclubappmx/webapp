import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const PaymentTestInterface = ({ onSimulatePayment }) => {
  const [isDevMode, setIsDevMode] = useState(
    import.meta.env?.MODE === 'development' || localStorage.getItem('devPaymentMode') === 'true'
  );
  const [selectedScenario, setSelectedScenario] = useState('success');
  const [testResults, setTestResults] = useState([]);

  // Only show in development mode
  if (!isDevMode) {
    return null;
  }

  const scenarios = [
    {
      id: 'success',
      name: 'Cargo Exitoso',
      description: 'Simula un pago procesado correctamente',
      icon: 'CheckCircle',
      color: 'green',
      result: {
        status: 'success',
        message: 'Pago procesado exitosamente',
        transactionId: `TXN-${Date.now()}`,
        amount: 499,
        currency: 'MXN'
      }
    },
    {
      id: 'insufficient_funds',
      name: 'Fondos Insuficientes',
      description: 'Simula rechazo por falta de fondos',
      icon: 'XCircle',
      color: 'red',
      result: {
        status: 'failed',
        message: 'Fondos insuficientes en la tarjeta',
        errorCode: 'INSUFFICIENT_FUNDS',
        transactionId: null
      }
    },
    {
      id: 'card_declined',
      name: 'Tarjeta Rechazada',
      description: 'Simula rechazo por el banco emisor',
      icon: 'AlertCircle',
      color: 'orange',
      result: {
        status: 'failed',
        message: 'Tarjeta rechazada por el banco emisor',
        errorCode: 'CARD_DECLINED',
        transactionId: null
      }
    },
    {
      id: 'expired_card',
      name: 'Tarjeta Expirada',
      description: 'Simula tarjeta con fecha de expiración vencida',
      icon: 'Clock',
      color: 'yellow',
      result: {
        status: 'failed',
        message: 'La tarjeta ha expirado',
        errorCode: 'EXPIRED_CARD',
        transactionId: null
      }
    },
    {
      id: 'network_error',
      name: 'Error de Red',
      description: 'Simula error de conexión con el procesador',
      icon: 'WifiOff',
      color: 'gray',
      result: {
        status: 'error',
        message: 'Error de conexión. Intenta nuevamente',
        errorCode: 'NETWORK_ERROR',
        transactionId: null
      }
    },
    {
      id: 'renewal_success',
      name: 'Renovación Exitosa',
      description: 'Simula renovación automática de suscripción',
      icon: 'RefreshCw',
      color: 'blue',
      result: {
        status: 'success',
        message: 'Suscripción renovada automáticamente',
        transactionId: `RNW-${Date.now()}`,
        amount: 499,
        currency: 'MXN',
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)?.toISOString()
      }
    },
    {
      id: 'renewal_failed',
      name: 'Renovación Fallida',
      description: 'Simula fallo en renovación automática',
      icon: 'AlertTriangle',
      color: 'red',
      result: {
        status: 'failed',
        message: 'No se pudo renovar la suscripción. Actualiza tu método de pago',
        errorCode: 'RENEWAL_FAILED',
        transactionId: null
      }
    }
  ];

  const handleSimulate = (scenario) => {
    const result = {
      ...scenario?.result,
      timestamp: new Date()?.toISOString(),
      scenarioName: scenario?.name
    };

    setTestResults([result, ...testResults]?.slice(0, 5));

    if (onSimulatePayment) {
      onSimulatePayment(result);
    }

    // Show notification
    alert(`Simulación: ${scenario?.name}\n\nEstado: ${result?.status}\nMensaje: ${result?.message}`);
  };

  const getColorClasses = (color) => {
    const colors = {
      green: 'bg-blue-50 border-blue-200 text-blue-900',
      red: 'bg-red-50 border-red-200 text-red-900',
      orange: 'bg-orange-50 border-orange-200 text-orange-900',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      gray: 'bg-gray-50 border-gray-200 text-gray-900',
      blue: 'bg-blue-50 border-blue-200 text-blue-900'
    };
    return colors?.[color] || colors?.gray;
  };

  const getIconColor = (color) => {
    const colors = {
      green: 'text-green-600',
      red: 'text-red-600',
      orange: 'text-orange-600',
      yellow: 'text-yellow-600',
      gray: 'text-gray-600',
      blue: 'text-blue-600'
    };
    return colors?.[color] || colors?.gray;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-white border-2 border-purple-500 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="TestTube2" size={20} className="text-white" />
              <h3 className="text-white font-bold text-sm">Payment Test Interface</h3>
            </div>
            <button
              onClick={() => setIsDevMode(false)}
              className="text-white hover:text-purple-200 transition-colors"
            >
              <Icon name="X" size={18} />
            </button>
          </div>
          <p className="text-purple-100 text-xs mt-1">Development Mode Only</p>
        </div>

        {/* Scenarios */}
        <div className="p-4 max-h-96 overflow-y-auto space-y-2">
          {scenarios?.map((scenario) => (
            <div
              key={scenario?.id}
              className={`border-2 rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                selectedScenario === scenario?.id
                  ? getColorClasses(scenario?.color)
                  : 'bg-white border-gray-200'
              }`}
              onClick={() => setSelectedScenario(scenario?.id)}
            >
              <div className="flex items-start space-x-3">
                <Icon
                  name={scenario?.icon}
                  size={20}
                  className={selectedScenario === scenario?.id ? getIconColor(scenario?.color) : 'text-gray-400'}
                />
                <div className="flex-1">
                  <h4 className="text-sm font-bold mb-1">{scenario?.name}</h4>
                  <p className="text-xs text-gray-600">{scenario?.description}</p>
                </div>
              </div>
              {selectedScenario === scenario?.id && (
                <Button
                  variant="default"
                  size="sm"
                  fullWidth
                  onClick={(e) => {
                    e?.stopPropagation();
                    handleSimulate(scenario);
                  }}
                  className="mt-3"
                >
                  Simular Escenario
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Test Results */}
        {testResults?.length > 0 && (
          <div className="border-t-2 border-gray-200 p-4 bg-gray-50">
            <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center space-x-1">
              <Icon name="History" size={14} />
              <span>Últimas Simulaciones</span>
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {testResults?.map((result, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded p-2 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">{result?.scenarioName}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        result?.status === 'success' ?'bg-blue-100 text-blue-800' :'bg-red-100 text-red-800'
                      }`}
                    >
                      {result?.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs">{result?.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-purple-50 border-t-2 border-purple-200 p-3">
          <div className="flex items-start space-x-2">
            <Icon name="Info" size={14} className="text-purple-600 mt-0.5" />
            <p className="text-xs text-purple-800">
              Esta interfaz solo está disponible en modo desarrollo. No procesa pagos reales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentTestInterface;
