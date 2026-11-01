import React, { useState } from 'react';
import Input from '../../../components/ui/Input';

import Icon from '../../../components/AppIcon';

const LoginForm = ({ email, onEmailChange, onSubmit, isLoading, error }) => {
  const [emailError, setEmailError] = useState('');

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError('El email es requerido');
      return false;
    }
    if (!emailRegex?.test(value)) {
      setEmailError('Por favor ingresa un email válido');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (e) => {
    const value = e?.target?.value;
    onEmailChange(value);
    if (value) {
      validateEmail(value);
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateEmail(email)) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Input
          type="email"
          label="Correo Electrónico"
          placeholder="tu@empresa.com"
          value={email}
          onChange={handleEmailChange}
          error={emailError || error}
          required
          disabled={isLoading}
          className="w-full"
        />
      </div>

      {/* Demo Credentials Info */}
      <div className="bg-muted/50 border border-border rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={16} className="text-primary mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground mb-1">
              Credenciales de Demostración
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Propietario:</strong> owner@promospot.com</p>
              <p><strong>Administrador:</strong> admin@promospot.com</p>
              <p><strong>Staff:</strong> staff@promospot.com</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
            />
            <span className="text-muted-foreground">Recordarme</span>
          </label>
          <a
            href="#"
            className="text-primary hover:text-primary/80 transition-colors duration-150"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;