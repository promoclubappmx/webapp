import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';

const Step1EmailOTP = ({ formData, updateFormData, onNext }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = () => {
    const newErrors = {};

    if (!formData?.email) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    if (!formData?.acceptTerms) {
      newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
    }

    if (!formData?.acceptPrivacy) {
      newErrors.acceptPrivacy = 'Debes aceptar la política de privacidad';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleContinue = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Check for duplicate email in user_profiles (owners)
      const { data, error } = await supabase?.from('user_profiles')?.select('id')?.eq('email', formData?.email)?.maybeSingle();

      if (error && error?.code !== 'PGRST116') {
        console.error('Error checking email:', error);
        // If table doesn't exist or other non-critical error, allow to proceed
        onNext();
        return;
      }

      if (data) {
        setErrors({ email: 'Este correo electrónico ya está registrado. ¿Ya tienes cuenta?' });
        return;
      }

      // Email is not duplicated, proceed to Step 2
      onNext();
    } catch (err) {
      console.error('Unexpected error:', err);
      // On unexpected error, allow to proceed
      onNext();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Crea tu cuenta</h3>
        <p className="text-gray-600">
          Ingresa tu correo electrónico para comenzar el registro
        </p>
      </div>

      {/* Email Field */}
      <div>
        <Input
          label="Correo electrónico"
          type="email"
          placeholder="tu@correo.com"
          value={formData?.email || ''}
          onChange={(e) => {
            updateFormData({ email: e?.target?.value });
            setErrors({});
          }}
          error={errors?.email}
          required
          disabled={isLoading}
        />
      </div>

      {/* Terms and Privacy */}
      <div className="space-y-3">
        <div>
          <Checkbox
            id="acceptTerms"
            checked={formData?.acceptTerms || false}
            onChange={(checked) => updateFormData({ acceptTerms: checked })}
            label={
              <span className="text-sm text-gray-700">
                Acepto los{' '}
                <a href="#" className="text-blue-600 hover:underline font-medium">
                  Términos y Condiciones
                </a>
              </span>
            }
          />
          {errors?.acceptTerms && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <Icon name="AlertCircle" size={14} />
              {errors?.acceptTerms}
            </p>
          )}
        </div>

        <div>
          <Checkbox
            id="acceptPrivacy"
            checked={formData?.acceptPrivacy || false}
            onChange={(checked) => updateFormData({ acceptPrivacy: checked })}
            label={
              <span className="text-sm text-gray-700">
                Acepto la{' '}
                <a href="#" className="text-blue-600 hover:underline font-medium">
                  Política de Privacidad
                </a>
              </span>
            }
          />
          {errors?.acceptPrivacy && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <Icon name="AlertCircle" size={14} />
              {errors?.acceptPrivacy}
            </p>
          )}
        </div>
      </div>

      <Button
        type="button"
        variant="default"
        size="lg"
        onClick={handleContinue}
        disabled={isLoading}
        iconName={isLoading ? 'Loader' : 'ArrowRight'}
        iconPosition="right"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
      >
        {isLoading ? 'Verificando...' : 'Continuar'}
      </Button>
    </div>
  );
};

export default Step1EmailOTP;