import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const RegistrationForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    contactName: '',
    phone: '',
    role: 'owner',
    acceptTerms: false,
    acceptPrivacy: false
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const roleOptions = [
    { value: 'owner', label: 'Propietario del Negocio' },
    { value: 'admin', label: 'Administrador' },
    { value: 'staff', label: 'Personal/Empleado' }
  ];

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData?.email) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    // Password validation
    if (!formData?.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData?.password?.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    // Confirm password validation
    if (!formData?.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData?.password !== formData?.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Business name validation
    if (!formData?.businessName) {
      newErrors.businessName = 'El nombre del negocio es obligatorio';
    }

    // Contact name validation
    if (!formData?.contactName) {
      newErrors.contactName = 'El nombre de contacto es obligatorio';
    }

    // Phone validation
    if (!formData?.phone) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (!/^[+]?[\d\s-()]{9,}$/?.test(formData?.phone)) {
      newErrors.phone = 'Formato de teléfono inválido';
    }

    // Terms validation
    if (!formData?.acceptTerms) {
      newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
    }

    // Privacy validation
    if (!formData?.acceptPrivacy) {
      newErrors.acceptPrivacy = 'Debes aceptar la política de privacidad';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Account Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Información de la Cuenta</h3>
        
        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          value={formData?.email}
          onChange={(e) => handleInputChange('email', e?.target?.value)}
          error={errors?.email}
          required
        />

        <div className="relative">
          <Input
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            placeholder="Mínimo 8 caracteres"
            value={formData?.password}
            onChange={(e) => handleInputChange('password', e?.target?.value)}
            error={errors?.password}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
          </button>
        </div>

        <div className="relative">
          <Input
            label="Confirmar Contraseña"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Repite tu contraseña"
            value={formData?.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e?.target?.value)}
            error={errors?.confirmPassword}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
          >
            <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={20} />
          </button>
        </div>
      </div>
      {/* Business Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Información del Negocio</h3>
        
        <Input
          label="Nombre del Negocio"
          type="text"
          placeholder="Ej: Restaurante El Buen Sabor"
          value={formData?.businessName}
          onChange={(e) => handleInputChange('businessName', e?.target?.value)}
          error={errors?.businessName}
          required
        />

        <Input
          label="Nombre de Contacto"
          type="text"
          placeholder="Tu nombre completo"
          value={formData?.contactName}
          onChange={(e) => handleInputChange('contactName', e?.target?.value)}
          error={errors?.contactName}
          required
        />

        <Input
          label="Teléfono"
          type="tel"
          placeholder="+34 600 123 456"
          value={formData?.phone}
          onChange={(e) => handleInputChange('phone', e?.target?.value)}
          error={errors?.phone}
          required
        />

        <Select
          label="Rol en el Negocio"
          options={roleOptions}
          value={formData?.role}
          onChange={(value) => handleInputChange('role', value)}
          placeholder="Selecciona tu rol"
        />
      </div>
      {/* Terms and Privacy */}
      <div className="space-y-4">
        <Checkbox
          label="Acepto los términos y condiciones"
          checked={formData?.acceptTerms}
          onChange={(e) => handleInputChange('acceptTerms', e?.target?.checked)}
          error={errors?.acceptTerms}
          required
        />

        <Checkbox
          label="Acepto la política de privacidad"
          checked={formData?.acceptPrivacy}
          onChange={(e) => handleInputChange('acceptPrivacy', e?.target?.checked)}
          error={errors?.acceptPrivacy}
          required
        />
      </div>
      {/* Submit Button */}
      <Button
        type="submit"
        variant="default"
        size="lg"
        fullWidth
        loading={isLoading}
        iconName="UserPlus"
        iconPosition="left"
      >
        Crear Cuenta
      </Button>
    </form>
  );
};

export default RegistrationForm;