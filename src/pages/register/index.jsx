import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Step1EmailOTP from './components/Step1EmailOTP';
import Step2PersonalData from './components/Step2PersonalData';
import Step3FiscalData from './components/Step3FiscalData';
import Step4BusinessData from './components/Step4BusinessData';
import Step5PlanSelection from './components/Step6PlanSelection';
import StepPassword from './components/StepPassword';
import Step6Confirmation from './components/Step7Confirmation';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const TOTAL_STEPS = 7;

const Register = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    email: '',
    acceptTerms: false,
    acceptPrivacy: false,
    // Step 2
    tipoPersona: '', // 'fisica' or 'moral'
    // Persona física
    firstName: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    curp: '',
    // Persona moral
    rfcMoral: '',
    razonSocialMoral: '',
    // Representante legal (moral)
    repCurp: '',
    repFirstName: '',
    repApellidoPaterno: '',
    repApellidoMaterno: '',
    // Common Step 2
    roleInBusiness: '',
    // Step 3
    rfc: '',
    razonSocial: '',
    nombresContribuyente: '',
    regimenFiscal: '',
    codigoPostalFiscal: '',
    coloniaFiscal: '',
    calleNumeroFiscal: '',
    numeroExteriorFiscal: '',
    numeroInteriorFiscal: '',
    municipioFiscal: '',
    ciudadFiscal: '',
    estadoFiscal: '',
    // Step 4
    nombreComercial: '',
    logoNegocio: null,
    logoFileName: null,
    categoria_id: '',
    categoria_nombre: '',
    contactPhone: '',
    contactEmail: '',
    // Step 5 (Plan)
    subscriptionPlan: 'free',
    // Step 6 (Password)
    password: '',
    passwordConfirm: ''
  });

  const updateFormData = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1EmailOTP
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <Step2PersonalData
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <Step3FiscalData
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <Step4BusinessData
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <Step5PlanSelection
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 6:
        return (
          <StepPassword
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 7:
        return (
          <Step6Confirmation
            formData={formData}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Panel - Branding (Dark Blue) */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
        {/* Decorative Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-0 left-0 w-full h-64">
            <svg viewBox="0 0 1200 400" className="w-full h-full">
              <defs>
                <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="3" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="1200" height="400" fill="url(#dots)" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 py-16 w-full">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-8">
              <img 
                src="/assets/images/promoclubblanco-1771809219409.png" 
                alt="PromoClub Logo" 
                className="w-32 h-32 object-contain"
              />
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              Registra tu negocio
            </h1>
            <p className="text-blue-200 text-lg">
              Únete a la plataforma que impulsa negocios locales con promociones inteligentes y programas de lealtad
            </p>
          </div>

          {/* Floating Benefit Cards */}
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="TrendingUp" size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Aumenta tus ventas</h3>
                  <p className="text-sm text-blue-200">Atrae más clientes con promociones personalizadas y ofertas exclusivas</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Users" size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Fideliza clientes</h3>
                  <p className="text-sm text-blue-200">Programa de puntos y recompensas que mantiene a tus clientes regresando</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="BarChart" size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Analítica en tiempo real</h3>
                  <p className="text-sm text-blue-200">Toma decisiones informadas con métricas detalladas de tu negocio</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form (White) */}
      <div className="flex-1 flex flex-col">
        {/* Header with Login Link */}
        <div className="flex justify-end items-center px-8 py-6 border-b border-gray-200">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600">¿Ya tienes cuenta?</span>
            <Button
              variant="link"
              onClick={handleLoginRedirect}
              className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-700"
            >
              Iniciar sesión
            </Button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
          <div className="w-full max-w-2xl">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">
                  Paso {currentStep} de {TOTAL_STEPS}
                </span>
                <span className="text-sm font-medium text-blue-600">
                  {Math.round((currentStep / TOTAL_STEPS) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
                />
              </div>
            </div>

            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;