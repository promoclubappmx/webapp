import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';

const Step7Confirmation = ({ formData, onBack }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(5);

  const planNames = {
    free: 'Free',
    pro: 'Pro',
    premium: 'Premium'
  };

  const planPrices = {
    free: 0,
    pro: 499,
    premium: 1299
  };

  // Auto-redirect countdown after success
  useEffect(() => {
    if (isSuccess && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isSuccess && countdown === 0) {
      navigate('/first-time-experience');
    }
  }, [isSuccess, countdown, navigate]);

  const handleSubmitRegistration = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Try to get existing session first
      let user = null;
      const { data: { user: existingUser } } = await supabase?.auth?.getUser();

      if (existingUser) {
        user = existingUser;
      } else {
        // Step 2: No session — create a new Supabase auth user with the user-chosen password
        const userPassword = formData?.password;
        if (!userPassword) {
          throw new Error('No se encontró la contraseña. Por favor regresa y crea una contraseña.');
        }

        const fullNameForAuth = [formData?.firstName, formData?.apellidoPaterno, formData?.apellidoMaterno]
          ?.filter(Boolean)?.join(' ') || formData?.firstName || '';

        const { data: signUpData, error: signUpError } = await supabase?.auth?.signUp({
          email: formData?.email,
          password: userPassword,
          options: {
            data: {
              full_name: fullNameForAuth,
            }
          }
        });

        if (signUpError) {
          if (signUpError?.message?.includes('already registered') || signUpError?.status === 422) {
            throw new Error('Este correo ya está registrado. Por favor inicia sesión.');
          }
          throw signUpError;
        }

        if (!signUpData?.user) {
          throw new Error('No se pudo crear la cuenta. Intenta de nuevo.');
        }

        user = signUpData?.user;
      }

      // Build full name
      const fullName = [
        formData?.firstName,
        formData?.apellidoPaterno,
        formData?.apellidoMaterno
      ]?.filter(Boolean)?.join(' ') || formData?.firstName || '';

      // Step 3: Upsert user_profiles with all registration data
      const profilePayload = {
        id: user?.id,
        email: formData?.email,
        full_name: fullName,
        first_name: formData?.firstName || '',
        last_name: formData?.apellidoPaterno || '',
        apellido_materno: formData?.apellidoMaterno || '',
        phone: formData?.contactPhone || formData?.phone || '',
        role: 'owner',
        role_in_business: formData?.roleInBusiness || '',
        tipo_persona: formData?.tipoPersona || '',
        updated_at: new Date()?.toISOString()
      };

      // Add CURP based on person type
      if (formData?.tipoPersona === 'fisica') {
        profilePayload.curp = formData?.curp || '';
      } else if (formData?.tipoPersona === 'moral') {
        profilePayload.rfc_moral = formData?.rfcMoral || '';
        profilePayload.razon_social_moral = formData?.razonSocialMoral || '';
        profilePayload.rep_curp = formData?.repCurp || '';
        profilePayload.rep_first_name = formData?.repFirstName || '';
        profilePayload.rep_apellido_paterno = formData?.repApellidoPaterno || '';
        profilePayload.rep_apellido_materno = formData?.repApellidoMaterno || '';
      }

      const { error: profileError } = await supabase?.from('user_profiles')?.upsert(
        profilePayload,
        { onConflict: 'id' }
      );

      if (profileError) {
        console.warn('Profile upsert warning:', profileError);
      }

      // Step 4: Determine RFC and razon social based on person type
      const rfc = formData?.tipoPersona === 'moral'
        ? (formData?.rfcMoral || '')
        : (formData?.rfc || '');

      const razonSocial = formData?.tipoPersona === 'moral'
        ? (formData?.razonSocialMoral || '')
        : (formData?.razonSocial || formData?.nombresContribuyente || '');

      // Step 5: Build business address from Step 5 location data
      const businessAddress = [
        formData?.calleNumero,
        formData?.colonia
      ]?.filter(Boolean)?.join(', ') || '';

      // Step 6: Insert business_settings with all data
      const businessPayload = {
        business_id: `BIZ-${user?.id?.slice(0, 8) || Date.now()}`,
        business_name: formData?.nombreComercial || '',
        business_email: formData?.contactEmail || formData?.email || '',
        business_phone: formData?.contactPhone || '',
        business_address: businessAddress,
        business_city: formData?.ciudad || formData?.ciudadFiscal || '',
        business_state: formData?.estado || formData?.estadoFiscal || '',
        business_postal_code: formData?.codigoPostal || '',
        business_country: 'México',
        tax_id: rfc,
        rfc: rfc,
        razon_social: razonSocial,
        regimen_fiscal: formData?.regimenFiscal || '',
        nombre_comercial: formData?.nombreComercial || '',
        categoria_nombre: formData?.categoria_nombre || formData?.categoria || '',
        contact_phone: formData?.contactPhone || '',
        contact_email: formData?.contactEmail || formData?.email || '',
        logo_negocio: formData?.logoNegocio || null,
        subscription_plan: formData?.subscriptionPlan || 'free',
        subscription_status: 'active',
        subscription_price: planPrices?.[formData?.subscriptionPlan] || 0,
        owner_id: user?.id,
        default_currency: 'MXN',
        default_language: 'es',
        timezone: 'America/Mexico_City',
        enable_promotions: true
      };

      const { error: businessError } = await supabase?.from('business_settings')?.insert(businessPayload);

      if (businessError) {
        // If duplicate business_id, try with timestamp fallback
        if (businessError?.code === '23505') {
          businessPayload.business_id = `BIZ-${Date.now()}`;
          const { error: retryError } = await supabase?.from('business_settings')?.insert(businessPayload);
          if (retryError) throw retryError;
        } else {
          throw businessError;
        }
      }

      // Step 7: Update user_profiles with business_id and business_name
      await supabase?.from('user_profiles')?.update({
        business_id: businessPayload?.business_id,
        business_name: formData?.nombreComercial || ''
      })?.eq('id', user?.id);

      setIsSuccess(true);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err?.message || 'Error al completar el registro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    navigate('/first-time-experience');
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="text-center space-y-6 py-12">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Creando tu cuenta...
          </h3>
          <p className="text-sm text-gray-500">
            Estamos configurando tu negocio en PromoClub
          </p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <Icon name="AlertCircle" size={32} className="text-red-500" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Error al Completar el Registro
          </h3>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            {onBack && (
              <Button variant="outline" size="lg" onClick={onBack}>
                Regresar
              </Button>
            )}
            <Button variant="default" size="lg" onClick={handleSubmitRegistration}>
              Intentar Nuevamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="space-y-6">
        {/* Success Animation */}
        <div className="relative flex items-center justify-center py-8">
          <div className="absolute w-32 h-32 bg-blue-100 rounded-full animate-ping opacity-75" />
          <div className="absolute w-28 h-28 bg-blue-200 rounded-full animate-pulse" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
            <Icon name="CheckCircle" size={56} className="text-white" />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Cuenta Creada Exitosamente!
          </h2>
          <p className="text-gray-600 text-lg">
            Bienvenido a PromoClub, {formData?.firstName}
          </p>
        </div>

        {/* Account Status */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <Icon name="CheckCircle" size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-900">Estado de Cuenta</h3>
              <p className="text-sm text-blue-700">Tu negocio está activo y listo para usar</p>
            </div>
          </div>

          <div className="space-y-2 bg-white rounded-lg p-4">
            <div className="flex justify-between items-center py-2 border-b border-blue-200">
              <span className="text-sm text-gray-600 font-medium">Negocio:</span>
              <span className="text-sm font-bold text-gray-900">{formData?.nombreComercial}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-blue-200">
              <span className="text-sm text-gray-600 font-medium">Plan Activo:</span>
              <span className="text-sm font-bold text-blue-600">{planNames?.[formData?.subscriptionPlan]}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600 font-medium">Estado:</span>
              <span className="inline-flex items-center space-x-1 text-sm font-bold text-green-600">
                <Icon name="CheckCircle" size={16} />
                <span>Activo</span>
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center space-x-2">
            <Icon name="Compass" size={20} />
            <span>Próximos Pasos</span>
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
              <div>
                <p className="text-sm font-semibold text-blue-900">Accede a tu Panel de Control</p>
                <p className="text-sm text-blue-700">Serás redirigido automáticamente en {countdown} segundos</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
              <div>
                <p className="text-sm font-semibold text-blue-900">Completa tu Perfil de Negocio</p>
                <p className="text-sm text-blue-700">Agrega fotos, horarios y más información</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
              <div>
                <p className="text-sm font-semibold text-blue-900">Crea tu Primera Promoción</p>
                <p className="text-sm text-blue-700">Atrae clientes con ofertas exclusivas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Onboarding Checklist */}
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Icon name="ListChecks" size={20} />
            <span>Checklist de Onboarding</span>
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Cuenta creada', done: true },
              { label: 'Datos fiscales registrados', done: !!(formData?.rfc || formData?.rfcMoral) },
              { label: 'Negocio configurado', done: !!formData?.nombreComercial },
              { label: 'Plan seleccionado', done: !!formData?.subscriptionPlan },
            ]?.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${item?.done ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <Icon name="Check" size={14} className="text-white" />
                </div>
                <span className={`text-sm ${item?.done ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  {item?.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="default"
          size="lg"
          onClick={handleGoToDashboard}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          Ir al Panel de Control
        </Button>
      </div>
    );
  }

  // ── Review / Confirmation screen (default) ────────────────────────────────
  const fullName = [formData?.firstName, formData?.apellidoPaterno, formData?.apellidoMaterno]
    ?.filter(Boolean)?.join(' ') || formData?.firstName || '';

  const rfc = formData?.tipoPersona === 'moral' ? formData?.rfcMoral : formData?.rfc;
  const razonSocial = formData?.tipoPersona === 'moral'
    ? formData?.razonSocialMoral
    : (formData?.razonSocial || formData?.nombresContribuyente);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="ClipboardCheck" size={32} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Confirma tu Registro</h2>
        <p className="text-sm text-gray-500">Revisa que toda la información sea correcta antes de finalizar</p>
      </div>

      {/* Personal Data */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Icon name="User" size={16} className="text-blue-500" />
          Datos Personales
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Nombre completo</span>
            <span className="text-sm font-medium text-gray-900">{fullName || '—'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Correo electrónico</span>
            <span className="text-sm font-medium text-gray-900">{formData?.email || '—'}</span>
          </div>
          {formData?.tipoPersona && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Tipo de persona</span>
              <span className="text-sm font-medium text-gray-900">
                {formData?.tipoPersona === 'fisica' ? 'Persona Física' : 'Persona Moral'}
              </span>
            </div>
          )}
          {formData?.curp && formData?.tipoPersona === 'fisica' && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">CURP</span>
              <span className="text-sm font-medium text-gray-900">{formData?.curp}</span>
            </div>
          )}
          {formData?.roleInBusiness && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Rol</span>
              <span className="text-sm font-medium text-gray-900 capitalize">{formData?.roleInBusiness}</span>
            </div>
          )}
        </div>
      </div>

      {/* Fiscal Data */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Icon name="FileText" size={16} className="text-blue-500" />
          Datos Fiscales
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">RFC</span>
            <span className="text-sm font-medium text-gray-900">{rfc || '—'}</span>
          </div>
          {razonSocial && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Razón Social / Nombre</span>
              <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">{razonSocial}</span>
            </div>
          )}
          {formData?.regimenFiscal && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Régimen Fiscal</span>
              <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">{formData?.regimenFiscal}</span>
            </div>
          )}
          {formData?.codigoPostalFiscal && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">C.P. Fiscal</span>
              <span className="text-sm font-medium text-gray-900">{formData?.codigoPostalFiscal}</span>
            </div>
          )}
        </div>
      </div>

      {/* Business Data */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Icon name="Store" size={16} className="text-blue-500" />
          Datos del Negocio
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Nombre Comercial</span>
            <span className="text-sm font-medium text-gray-900">{formData?.nombreComercial || '—'}</span>
          </div>
          {formData?.categoria_nombre && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Categoría</span>
              <span className="text-sm font-medium text-gray-900">{formData?.categoria_nombre}</span>
            </div>
          )}
          {formData?.contactPhone && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Teléfono</span>
              <span className="text-sm font-medium text-gray-900">{formData?.contactPhone}</span>
            </div>
          )}
          {(formData?.ciudad || formData?.estado) && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Ubicación</span>
              <span className="text-sm font-medium text-gray-900">
                {[formData?.ciudad, formData?.estado]?.filter(Boolean)?.join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Plan */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Icon name="CreditCard" size={16} className="text-blue-500" />
          Plan Seleccionado
        </h3>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Plan</span>
          <span className="text-sm font-bold text-blue-700">
            {planNames?.[formData?.subscriptionPlan] || 'Free'}
            {planPrices?.[formData?.subscriptionPlan] > 0
              ? ` — $${planPrices?.[formData?.subscriptionPlan]?.toLocaleString('es-MX')}/mes`
              : ' — Gratis'}
          </span>
        </div>
      </div>

      {/* Terms reminder */}
      <p className="text-xs text-gray-400 text-center">
        Al confirmar aceptas los Términos de Servicio y la Política de Privacidad de PromoClub.
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        {onBack && (
          <Button
            variant="outline"
            size="lg"
            onClick={onBack}
            className="flex-1"
          >
            <Icon name="ChevronLeft" size={18} className="mr-1" />
            Regresar
          </Button>
        )}
        <Button
          variant="default"
          size="lg"
          onClick={handleSubmitRegistration}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          <Icon name="CheckCircle" size={18} className="mr-2" />
          Confirmar Registro
        </Button>
      </div>
    </div>
  );
};

export default Step7Confirmation;