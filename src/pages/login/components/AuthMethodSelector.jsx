import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const AuthMethodSelector = ({ selectedMethod, onMethodChange, onSubmit, isLoading }) => {
  const authMethods = [
    {
      id: 'otp',
      label: 'Código OTP',
      description: 'Recibe un código por SMS',
      icon: 'Smartphone'
    },
    {
      id: 'magic-link',
      label: 'Enlace Mágico',
      description: 'Recibe un enlace por email',
      icon: 'Mail'
    }
  ];

  const oauthProviders = [
    {
      id: 'google',
      label: 'Google',
      icon: 'Chrome',
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      id: 'microsoft',
      label: 'Microsoft',
      icon: 'Square',
      color: 'bg-blue-500 hover:bg-blue-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Primary Auth Methods */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground mb-3">
          Método de Autenticación
        </h3>
        {authMethods?.map((method) => (
          <button
            key={method?.id}
            type="button"
            onClick={() => onMethodChange(method?.id)}
            className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              selectedMethod === method?.id
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                selectedMethod === method?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Icon name={method?.icon} size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{method?.label}</p>
                <p className="text-sm text-muted-foreground">{method?.description}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedMethod === method?.id
                  ? 'border-primary bg-primary' :'border-muted-foreground'
              }`}>
                {selectedMethod === method?.id && (
                  <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
      {/* Submit Button */}
      <Button
        type="submit"
        variant="default"
        size="lg"
        fullWidth
        loading={isLoading}
        onClick={onSubmit}
        className="mt-6"
      >
        {selectedMethod === 'otp' ? 'Enviar Código' : 'Enviar Enlace'}
      </Button>
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background text-muted-foreground">
            O continúa con
          </span>
        </div>
      </div>
      {/* OAuth Providers */}
      <div className="grid grid-cols-2 gap-3">
        {oauthProviders?.map((provider) => (
          <Button
            key={provider?.id}
            type="button"
            variant="outline"
            size="default"
            iconName={provider?.icon}
            iconPosition="left"
            className="justify-center"
            onClick={() => {
              console.log(`Authenticating with ${provider?.label}...`);
            }}
          >
            {provider?.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AuthMethodSelector;