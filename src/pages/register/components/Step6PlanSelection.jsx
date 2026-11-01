import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import {
  luhnCheck,
  detectCardType,
  formatCardNumber,
  validateExpiry,
  validateCVV,
  validateCardholderName
} from '../../../utils/cardValidation';

const Step6PlanSelection = ({ formData, updateFormData, onNext, onBack }) => {
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  const [paymentErrors, setPaymentErrors] = useState({});
  const [cardType, setCardType] = useState({ type: 'Unknown', icon: 'CreditCard', maxLength: 16, cvvLength: 3 });
  const [realTimeValidation, setRealTimeValidation] = useState({
    cardNumber: null,
    cardName: null,
    expiry: null,
    cvv: null
  });

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'MXN',
      description: 'Ficha básica para comenzar',
      features: [
        'Perfil de negocio básico',
        'Hasta 10 productos en catálogo',
        'Estadísticas básicas',
        'Soporte por email'
      ],
      color: 'bg-muted',
      textColor: 'text-foreground',
      borderColor: 'border-border'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 499,
      currency: 'MXN',
      period: '/mes',
      description: 'Promociones + Puntos + Cupones',
      features: [
        'Todo lo de Free',
        'Productos ilimitados',
        'Sistema de promociones',
        'Programa de puntos de lealtad',
        'Cupones y descuentos',
        'Estadísticas avanzadas',
        'Soporte prioritario'
      ],
      color: 'bg-primary/10',
      textColor: 'text-primary',
      borderColor: 'border-primary',
      recommended: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 1299,
      currency: 'MXN',
      period: '/mes',
      description: 'Geofencing + Boosts + Heatmaps',
      features: [
        'Todo lo de Pro',
        'Geofencing y notificaciones por ubicación',
        'Boosts de visibilidad',
        'Mapas de calor de clientes',
        'Análisis predictivo',
        'Múltiples ubicaciones',
        'API personalizada',
        'Soporte 24/7'
      ],
      color: 'bg-secondary/10',
      textColor: 'text-secondary',
      borderColor: 'border-secondary'
    }
  ];

  // Real-time card type detection
  useEffect(() => {
    if (paymentData?.cardNumber) {
      const detected = detectCardType(paymentData?.cardNumber);
      setCardType(detected);
    }
  }, [paymentData?.cardNumber]);

  const handleSelectPlan = (planId) => {
    updateFormData({ subscriptionPlan: planId });
    // Show payment form for paid plans
    if (planId === 'pro' || planId === 'premium') {
      setShowPaymentForm(true);
    } else {
      setShowPaymentForm(false);
    }
  };

  const validatePaymentForm = () => {
    const newErrors = {};

    // Card Number Validation with Luhn
    if (!paymentData?.cardNumber) {
      newErrors.cardNumber = 'El número de tarjeta es obligatorio';
    } else {
      const cleaned = paymentData?.cardNumber?.replace(/\s/g, '');
      if (!/^\d+$/?.test(cleaned)) {
        newErrors.cardNumber = 'El número de tarjeta debe contener solo dígitos';
      } else if (cleaned?.length < 13 || cleaned?.length > 19) {
        newErrors.cardNumber = 'Longitud de tarjeta inválida';
      } else if (!luhnCheck(cleaned)) {
        newErrors.cardNumber = 'Número de tarjeta inválido (verificación Luhn falló)';
      }
    }

    // Cardholder Name Validation
    const nameValidation = validateCardholderName(paymentData?.cardName);
    if (!nameValidation?.isValid) {
      newErrors.cardName = nameValidation?.error;
    }

    // Expiry Validation
    const expiryValidation = validateExpiry(paymentData?.expiryMonth, paymentData?.expiryYear);
    if (!expiryValidation?.isValid) {
      newErrors.expiry = expiryValidation?.error;
    }

    // CVV Validation
    const cvvValidation = validateCVV(paymentData?.cvv, paymentData?.cardNumber);
    if (!cvvValidation?.isValid) {
      newErrors.cvv = cvvValidation?.error;
    }

    setPaymentErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleNext = () => {
    if (!formData?.subscriptionPlan) {
      alert('Por favor selecciona un plan');
      return;
    }

    // Validate payment for paid plans
    if ((formData?.subscriptionPlan === 'pro' || formData?.subscriptionPlan === 'premium') && showPaymentForm) {
      if (!validatePaymentForm()) {
        return;
      }
      // Store payment data in formData
      updateFormData({ paymentMethod: paymentData });
    }

    onNext();
  };

  const toggleExpand = (planId) => {
    setExpandedPlan(expandedPlan === planId ? null : planId);
  };

  const handleCardNumberChange = (value) => {
    const cleaned = value?.replace(/\D/g, '');
    const maxLength = cardType?.maxLength || 16;
    const truncated = cleaned?.slice(0, maxLength);
    setPaymentData({ ...paymentData, cardNumber: truncated });
    
    // Real-time validation
    if (truncated?.length >= 13) {
      const isValid = luhnCheck(truncated);
      setRealTimeValidation(prev => ({
        ...prev,
        cardNumber: isValid ? 'valid' : 'invalid'
      }));
    } else {
      setRealTimeValidation(prev => ({ ...prev, cardNumber: null }));
    }
  };

  const handleCardNameChange = (value) => {
    setPaymentData({ ...paymentData, cardName: value });
    
    // Real-time validation
    const validation = validateCardholderName(value);
    setRealTimeValidation(prev => ({
      ...prev,
      cardName: validation?.isValid ? 'valid' : (value?.length > 0 ? 'invalid' : null)
    }));
  };

  const handleExpiryMonthChange = (value) => {
    const cleaned = value?.replace(/\D/g, '')?.slice(0, 2);
    setPaymentData({ ...paymentData, expiryMonth: cleaned });
    
    // Real-time validation
    if (cleaned?.length === 2 && paymentData?.expiryYear?.length === 4) {
      const validation = validateExpiry(cleaned, paymentData?.expiryYear);
      setRealTimeValidation(prev => ({
        ...prev,
        expiry: validation?.isValid ? 'valid' : 'invalid'
      }));
    } else {
      setRealTimeValidation(prev => ({ ...prev, expiry: null }));
    }
  };

  const handleExpiryYearChange = (value) => {
    const cleaned = value?.replace(/\D/g, '')?.slice(0, 4);
    setPaymentData({ ...paymentData, expiryYear: cleaned });
    
    // Real-time validation
    if (cleaned?.length === 4 && paymentData?.expiryMonth?.length === 2) {
      const validation = validateExpiry(paymentData?.expiryMonth, cleaned);
      setRealTimeValidation(prev => ({
        ...prev,
        expiry: validation?.isValid ? 'valid' : 'invalid'
      }));
    } else {
      setRealTimeValidation(prev => ({ ...prev, expiry: null }));
    }
  };

  const handleCvvChange = (value) => {
    const cleaned = value?.replace(/\D/g, '');
    const maxLength = cardType?.cvvLength || 4;
    const truncated = cleaned?.slice(0, maxLength);
    setPaymentData({ ...paymentData, cvv: truncated });
    
    // Real-time validation
    const validation = validateCVV(truncated, paymentData?.cardNumber);
    setRealTimeValidation(prev => ({
      ...prev,
      cvv: validation?.isValid ? 'valid' : (truncated?.length > 0 ? 'invalid' : null)
    }));
  };

  const getValidationIcon = (field) => {
    if (realTimeValidation?.[field] === 'valid') {
      return <Icon name="CheckCircle" size={20} className="text-green-600" />;
    }
    if (realTimeValidation?.[field] === 'invalid') {
      return <Icon name="XCircle" size={20} className="text-red-600" />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Selecciona tu Plan</h3>
        <p className="text-gray-600">
          Elige el plan que mejor se adapte a las necesidades de tu negocio
        </p>
      </div>

      <div className="space-y-4">
        {plans?.map((plan) => (
          <div
            key={plan?.id}
            className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
              formData?.subscriptionPlan === plan?.id
                ? 'border-blue-600 bg-blue-50 shadow-lg'
                : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
            }`}
            onClick={() => handleSelectPlan(plan?.id)}
          >
            {plan?.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                  ⭐ Recomendado
                </span>
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-2xl font-bold text-gray-900">
                    {plan?.name}
                  </h4>
                  {formData?.subscriptionPlan === plan?.id && (
                    <Icon name="CheckCircle" size={24} className="text-blue-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {plan?.description}
                </p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan?.price?.toLocaleString()}
                  </span>
                  <span className="text-base text-gray-600 font-medium">
                    {plan?.currency}{plan?.period || ''}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e?.stopPropagation();
                toggleExpand(plan?.id);
              }}
              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-semibold mb-3"
            >
              <span>{expandedPlan === plan?.id ? 'Ocultar' : 'Ver'} características</span>
              <Icon 
                name={expandedPlan === plan?.id ? 'ChevronUp' : 'ChevronDown'} 
                size={16} 
              />
            </button>

            {expandedPlan === plan?.id && (
              <div className="space-y-2 pt-4 border-t border-gray-200">
                {plan?.features?.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Icon name="Check" size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Payment Form for Paid Plans */}
      {showPaymentForm && (formData?.subscriptionPlan === 'pro' || formData?.subscriptionPlan === 'premium') && (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-bold text-gray-900">Método de Pago</h4>
            <div className="flex items-center space-x-2">
              <Icon name="Lock" size={18} className="text-green-600" />
              <span className="text-sm text-green-600 font-medium">Pago Seguro</span>
            </div>
          </div>

          {/* Card Number */}
          <div className="relative">
            <Input
              label="Número de Tarjeta"
              placeholder=""
              value={formatCardNumber(paymentData?.cardNumber)}
              onChange={(e) => handleCardNumberChange(e?.target?.value)}
              error={paymentErrors?.cardNumber}
              required
            />
            <div className="absolute right-3 top-9 flex items-center space-x-2">
              {getValidationIcon('cardNumber')}
              {cardType?.type !== 'Unknown' && (
                <span className="text-xs font-semibold text-gray-600 bg-gray-200 px-2 py-1 rounded">
                  {cardType?.type}
                </span>
              )}
            </div>
          </div>

          {/* Cardholder Name */}
          <div className="relative">
            <Input
              label="Nombre del Titular"
              placeholder=""
              value={paymentData?.cardName}
              onChange={(e) => handleCardNameChange(e?.target?.value)}
              error={paymentErrors?.cardName}
              required
            />
            <div className="absolute right-3 top-9">
              {getValidationIcon('cardName')}
            </div>
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-3 gap-4">
            <div className="relative">
              <Input
                label="Mes"
                placeholder=""
                value={paymentData?.expiryMonth}
                onChange={(e) => handleExpiryMonthChange(e?.target?.value)}
                error={paymentErrors?.expiry}
                maxLength={2}
                required
              />
              <div className="absolute right-3 top-9">
                {getValidationIcon('expiry')}
              </div>
            </div>
            <div>
              <Input
                label="Año"
                placeholder=""
                value={paymentData?.expiryYear}
                onChange={(e) => handleExpiryYearChange(e?.target?.value)}
                maxLength={4}
                required
              />
            </div>
            <div className="relative">
              <Input
                label="CVV"
                placeholder=""
                type="password"
                value={paymentData?.cvv}
                onChange={(e) => handleCvvChange(e?.target?.value)}
                error={paymentErrors?.cvv}
                maxLength={cardType?.cvvLength}
                required
              />
              <div className="absolute right-3 top-9">
                {getValidationIcon('cvv')}
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <div className="flex items-start space-x-3">
              <Icon name="Shield" size={20} className="text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Seguridad de Pagos
                </p>
                <p className="text-sm text-blue-800">
                  Todos los pagos están protegidos con encriptación SSL de 256 bits. No almacenamos información completa de tarjetas.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex space-x-4 pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          iconName="ArrowLeft"
          iconPosition="left"
          className="flex-1"
        >
          Atrás
        </Button>
        <Button
          variant="default"
          onClick={handleNext}
          iconName="ArrowRight"
          iconPosition="right"
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default Step6PlanSelection;