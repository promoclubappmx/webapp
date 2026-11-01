import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const StepPassword = ({ formData, updateFormData, onNext, onBack }) => {
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password?.length >= 8) score++;
    if (/[A-Z]/?.test(password)) score++;
    if (/[0-9]/?.test(password)) score++;
    if (/[^A-Za-z0-9]/?.test(password)) score++;

    const levels = [
      { score: 0, label: '', color: '' },
      { score: 1, label: 'Muy débil', color: 'bg-red-500' },
      { score: 2, label: 'Débil', color: 'bg-orange-400' },
      { score: 3, label: 'Buena', color: 'bg-yellow-400' },
      { score: 4, label: 'Fuerte', color: 'bg-green-500' },
    ];
    return levels?.[score];
  };

  const validate = () => {
    const newErrors = {};
    const password = formData?.password || '';
    const confirm = formData?.passwordConfirm || '';

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password?.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
    } else if (!/[A-Z]/?.test(password)) {
      newErrors.password = 'Debe incluir al menos una mayúscula';
    } else if (!/[0-9]/?.test(password)) {
      newErrors.password = 'Debe incluir al menos un número';
    }

    if (!confirm) {
      newErrors.passwordConfirm = 'Confirma tu contraseña';
    } else if (password !== confirm) {
      newErrors.passwordConfirm = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  const strength = getPasswordStrength(formData?.password || '');
  const strengthBars = [1, 2, 3, 4];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Crea tu contraseña</h3>
        <p className="text-gray-600">
          Esta contraseña te permitirá acceder a tu cuenta en PromoClub
        </p>
      </div>
      {/* Password Field */}
      <div>
        <div className="relative">
          <Input
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            placeholder="Mínimo 8 caracteres"
            value={formData?.password || ''}
            onChange={(e) => {
              updateFormData({ password: e?.target?.value });
              setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={errors?.password}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
          </button>
        </div>

        {/* Strength Indicator */}
        {(formData?.password || '')?.length > 0 && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {strengthBars?.map((bar) => (
                <div
                  key={bar}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    strength?.score >= bar ? strength?.color : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            {strength?.label && (
              <p className="text-xs text-gray-500">
                Seguridad: <span className="font-medium">{strength?.label}</span>
              </p>
            )}
          </div>
        )}
      </div>
      {/* Password Requirements */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <p className="text-xs font-medium text-gray-600 mb-2">Requisitos:</p>
        {[
          { test: (formData?.password || '')?.length >= 8, label: 'Mínimo 8 caracteres' },
          { test: /[A-Z]/?.test(formData?.password || ''), label: 'Al menos una mayúscula' },
          { test: /[0-9]/?.test(formData?.password || ''), label: 'Al menos un número' },
          { test: /[^A-Za-z0-9]/?.test(formData?.password || ''), label: 'Carácter especial (recomendado)' },
        ]?.map((req, i) => (
          <div key={i} className="flex items-center gap-2">
            <Icon
              name={req?.test ? 'CheckCircle' : 'Circle'}
              size={14}
              className={req?.test ? 'text-green-500' : 'text-gray-300'}
            />
            <span className={`text-xs ${req?.test ? 'text-green-700' : 'text-gray-500'}`}>
              {req?.label}
            </span>
          </div>
        ))}
      </div>
      {/* Confirm Password */}
      <div className="relative">
        <Input
          label="Confirmar contraseña"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Repite tu contraseña"
          value={formData?.passwordConfirm || ''}
          onChange={(e) => {
            updateFormData({ passwordConfirm: e?.target?.value });
            setErrors((prev) => ({ ...prev, passwordConfirm: undefined }));
          }}
          error={errors?.passwordConfirm}
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
        >
          <Icon name={showConfirm ? 'EyeOff' : 'Eye'} size={18} />
        </button>
      </div>
      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" size="lg" onClick={onBack} className="flex-1">
          Regresar
        </Button>
        <Button variant="default" size="lg" onClick={handleNext} className="flex-1">
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default StepPassword;
