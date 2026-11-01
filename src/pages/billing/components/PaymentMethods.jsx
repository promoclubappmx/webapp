import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const PaymentMethods = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      type: 'card',
      cardBrand: 'Visa',
      last4: '4242',
      expiryMonth: '12',
      expiryYear: '2025',
      isDefault: true,
      holderName: 'Juan Pérez'
    },
    {
      id: '2',
      type: 'card',
      cardBrand: 'Mastercard',
      last4: '8888',
      expiryMonth: '06',
      expiryYear: '2026',
      isDefault: false,
      holderName: 'María González'
    }
  ]);

  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  const handleAddCard = () => {
    // Validación básica
    if (!newCard?.cardNumber || newCard?.cardNumber?.length < 13) {
      alert('Por favor ingresa un número de tarjeta válido');
      return;
    }
    if (!newCard?.cardName || newCard?.cardName?.trim() === '') {
      alert('Por favor ingresa el nombre del titular');
      return;
    }
    if (!newCard?.expiryMonth || !newCard?.expiryYear) {
      alert('Por favor ingresa la fecha de expiración');
      return;
    }
    if (!newCard?.cvv || newCard?.cvv?.length < 3) {
      alert('Por favor ingresa un CVV válido');
      return;
    }

    // Determinar marca de tarjeta
    const firstDigit = newCard?.cardNumber?.charAt(0);
    let cardBrand = 'Visa';
    if (firstDigit === '5') cardBrand = 'Mastercard';
    else if (firstDigit === '3') cardBrand = 'American Express';

    const last4 = newCard?.cardNumber?.slice(-4);
    const newMethod = {
      id: Date.now()?.toString(),
      type: 'card',
      cardBrand,
      last4,
      expiryMonth: newCard?.expiryMonth,
      expiryYear: newCard?.expiryYear,
      isDefault: paymentMethods?.length === 0,
      holderName: newCard?.cardName
    };
    
    setPaymentMethods([...paymentMethods, newMethod]);
    setShowAddForm(false);
    setNewCard({ cardNumber: '', cardName: '', expiryMonth: '', expiryYear: '', cvv: '' });
    alert('✅ Tarjeta agregada exitosamente');
  };

  const handleRemoveCard = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este método de pago?')) {
      setPaymentMethods(paymentMethods?.filter(method => method?.id !== id));
      alert('✅ Tarjeta eliminada exitosamente');
    }
  };

  const handleSetDefault = (id) => {
    setPaymentMethods(
      paymentMethods?.map(method => ({
        ...method,
        isDefault: method?.id === id
      }))
    );
    alert('✅ Tarjeta establecida como predeterminada');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Métodos de Pago</h3>
          <p className="text-gray-600 text-sm mt-1">Gestiona tus tarjetas y métodos de pago</p>
        </div>
        {!showAddForm && (
          <Button
            variant="default"
            onClick={() => setShowAddForm(true)}
          >
            <Icon name="Plus" size={18} className="mr-2" />
            Agregar Método
          </Button>
        )}
      </div>

      {/* Add Card Form */}
      {showAddForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Agregar Tarjeta</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Número de Tarjeta"
                placeholder="1234 5678 9012 3456"
                value={newCard?.cardNumber}
                onChange={(e) => setNewCard({ ...newCard, cardNumber: e?.target?.value })}
                maxLength={16}
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Nombre en la Tarjeta"
                placeholder="Juan Pérez"
                value={newCard?.cardName}
                onChange={(e) => setNewCard({ ...newCard, cardName: e?.target?.value })}
              />
            </div>
            <div>
              <Input
                label="Mes de Expiración"
                placeholder="MM"
                value={newCard?.expiryMonth}
                onChange={(e) => setNewCard({ ...newCard, expiryMonth: e?.target?.value })}
                maxLength={2}
              />
            </div>
            <div>
              <Input
                label="Año de Expiración"
                placeholder="YYYY"
                value={newCard?.expiryYear}
                onChange={(e) => setNewCard({ ...newCard, expiryYear: e?.target?.value })}
                maxLength={4}
              />
            </div>
            <div>
              <Input
                label="CVV"
                placeholder="123"
                type="password"
                value={newCard?.cvv}
                onChange={(e) => setNewCard({ ...newCard, cvv: e?.target?.value })}
                maxLength={3}
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <Button variant="default" onClick={handleAddCard}>
              Guardar Tarjeta
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Payment Methods List */}
      <div className="space-y-4">
        {paymentMethods?.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <Icon name="CreditCard" size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No hay métodos de pago registrados</p>
            <p className="text-gray-500 text-sm mt-1">Agrega una tarjeta para comenzar</p>
          </div>
        ) : (
          paymentMethods?.map((method) => (
            <div
              key={method?.id}
              className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="CreditCard" size={24} className="text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-gray-900">
                      {method?.cardBrand} •••• {method?.last4}
                    </p>
                    {method?.isDefault && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                        Predeterminada
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {method?.holderName}
                  </p>
                  <p className="text-sm text-gray-500">
                    Expira {method?.expiryMonth}/{method?.expiryYear}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!method?.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(method?.id)}
                  >
                    Establecer como predeterminada
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveCard(method?.id)}
                  className="text-red-600 hover:bg-red-50 border-red-200"
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Lock" size={20} className="text-yellow-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-900 mb-1">Seguridad de pagos</p>
            <p className="text-sm text-yellow-800">
              Todos los pagos están protegidos con encriptación SSL de 256 bits. No almacenamos información completa de tarjetas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;