import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY;

const Step2PersonalData = ({ formData, updateFormData, onNext, onBack }) => {
  const [errors, setErrors] = useState({});

  // Persona física states
  const [isCurpLoading, setIsCurpLoading] = useState(false);
  const [curpApiError, setCurpApiError] = useState('');
  const [curpPreloaded, setCurpPreloaded] = useState(false);
  const [curpValidated, setCurpValidated] = useState(false);
  const [nameFieldsEnabled, setNameFieldsEnabled] = useState(false);

  // Persona moral states
  const [isRfcLoading, setIsRfcLoading] = useState(false);
  const [rfcApiError, setRfcApiError] = useState('');
  const [rfcValidated, setRfcValidated] = useState(false);
  const [rfcNameEnabled, setRfcNameEnabled] = useState(false);

  // Representante legal CURP states (for moral)
  const [isRepCurpLoading, setIsRepCurpLoading] = useState(false);
  const [repCurpApiError, setRepCurpApiError] = useState('');
  const [repCurpPreloaded, setRepCurpPreloaded] = useState(false);
  const [repCurpValidated, setRepCurpValidated] = useState(false);
  const [repNameFieldsEnabled, setRepNameFieldsEnabled] = useState(false);

  // Duplicate check states
  const [isDuplicateChecking, setIsDuplicateChecking] = useState(false);
  const [duplicateError, setDuplicateError] = useState('');

  const tipoPersonaOptions = [
    { value: 'fisica', label: 'Persona Física' },
    { value: 'moral', label: 'Persona Moral' },
  ];

  const roleOptions = [
    { value: 'propietario', label: 'Propietario' },
    { value: 'socio', label: 'Socio' },
    { value: 'gerente', label: 'Gerente' },
    { value: 'representante_legal', label: 'Representante Legal' },
    { value: 'encargado', label: 'Encargado' }
  ];

  const tipoPersona = formData?.tipoPersona || '';

  // ─── CURP validation helper (física) ────────────────────────────────────
  const validateCurpFormat = (curp) => {
    const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/;
    return curp?.length === 18 && curpRegex?.test(curp);
  };

  const callNubariumCurp = async (curp) => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Servicio de validación no disponible. Captura los datos manualmente.');
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller?.abort(), 15000);
    try {
      let response = await fetch(`${SUPABASE_URL}/functions/v1/nubarium-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ action: 'validate_curp', curp }),
        signal: controller?.signal
      });
      if (!response?.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      return response?.json();
    } finally {
      clearTimeout(timeoutId);
    }
  };

  // ─── Persona Física: CURP handlers ──────────────────────────────────────
  const handleCurpChange = (value) => {
    const upper = value?.toUpperCase();
    updateFormData({ curp: upper });
    setCurpApiError('');
    setDuplicateError('');
    if (curpPreloaded || nameFieldsEnabled) {
      setCurpPreloaded(false);
      setCurpValidated(false);
      setNameFieldsEnabled(false);
      updateFormData({ firstName: '', apellidoPaterno: '', apellidoMaterno: '' });
    }
  };

  const handleCurpBlur = async () => {
    const curp = formData?.curp;
    if (!curp || !validateCurpFormat(curp)) return;

    setIsCurpLoading(true);
    setCurpApiError('');

    try {
      const data = await callNubariumCurp(curp);

      if (data?.estatus === 'OK') {
        updateFormData({
          firstName: data?.nombre || '',
          apellidoPaterno: data?.apellidoPaterno || '',
          apellidoMaterno: data?.apellidoMaterno || ''
        });
        setCurpPreloaded(true);
        setCurpValidated(true);
        setNameFieldsEnabled(false);
        setErrors(prev => ({ ...prev, curp: '', firstName: '', apellidoPaterno: '' }));
      } else {
        setCurpApiError('CURP no encontrada o inválida. Puedes capturar los datos manualmente.');
        setCurpPreloaded(false);
        setCurpValidated(false);
        setNameFieldsEnabled(true);
      }
    } catch (err) {
      console.error('Error validating CURP:', err?.message || err);
      const isAbort = err?.name === 'AbortError';
      setCurpApiError(
        isAbort
          ? 'La validación tardó demasiado. Puedes capturar los datos manualmente.'
          : 'No se pudo validar la CURP. Puedes capturar los datos manualmente.'
      );
      setCurpPreloaded(false);
      setCurpValidated(false);
      setNameFieldsEnabled(true);
    } finally {
      setIsCurpLoading(false);
    }
  };

  // ─── Persona Moral: RFC handlers ─────────────────────────────────────────
  const handleRfcChange = (value) => {
    const upper = value?.toUpperCase();
    updateFormData({ rfcMoral: upper });
    setRfcApiError('');
    setRfcValidated(false);
    setRfcNameEnabled(false);
    setDuplicateError('');
    updateFormData({ razonSocialMoral: '' });
  };

  const handleRfcBlur = async () => {
    const rfc = formData?.rfcMoral;
    if (!rfc || rfc?.length < 12) return;

    setIsRfcLoading(true);
    setRfcApiError('');

    try {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error('Servicio de validación no disponible.');
      }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller?.abort(), 15000);
      let response;
      try {
        response = await fetch(`${SUPABASE_URL}/functions/v1/nubarium-proxy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ action: 'validate_rfc', rfc }),
          signal: controller?.signal
        });
      } finally {
        clearTimeout(timeoutId);
      }
      if (!response?.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      const data = await response?.json();

      if (data?.estatus === 'OK' && data?.nombre) {
        updateFormData({ razonSocialMoral: data?.nombre });
        setRfcValidated(true);
        setRfcNameEnabled(false);
        setErrors(prev => ({ ...prev, rfcMoral: '', razonSocialMoral: '' }));
      } else {
        setRfcApiError('RFC no encontrado en el SAT. Puedes capturar la razón social manualmente.');
        setRfcValidated(false);
        setRfcNameEnabled(true);
      }
    } catch (err) {
      console.error('Error validating RFC:', err?.message || err);
      const isAbort = err?.name === 'AbortError';
      setRfcApiError(
        isAbort
          ? 'La validación tardó demasiado. Puedes capturar los datos manualmente.'
          : 'No se pudo validar el RFC. Puedes capturar los datos manualmente.'
      );
      setRfcValidated(false);
      setRfcNameEnabled(true);
    } finally {
      setIsRfcLoading(false);
    }
  };

  // ─── Representante Legal CURP handlers (moral) ───────────────────────────
  const handleRepCurpChange = (value) => {
    const upper = value?.toUpperCase();
    updateFormData({ repCurp: upper });
    setRepCurpApiError('');
    if (repCurpPreloaded || repNameFieldsEnabled) {
      setRepCurpPreloaded(false);
      setRepCurpValidated(false);
      setRepNameFieldsEnabled(false);
      updateFormData({ repFirstName: '', repApellidoPaterno: '', repApellidoMaterno: '' });
    }
  };

  const handleRepCurpBlur = async () => {
    const curp = formData?.repCurp;
    if (!curp || !validateCurpFormat(curp)) return;

    setIsRepCurpLoading(true);
    setRepCurpApiError('');

    try {
      const data = await callNubariumCurp(curp);

      if (data?.estatus === 'OK') {
        updateFormData({
          repFirstName: data?.nombre || '',
          repApellidoPaterno: data?.apellidoPaterno || '',
          repApellidoMaterno: data?.apellidoMaterno || ''
        });
        setRepCurpPreloaded(true);
        setRepCurpValidated(true);
        setRepNameFieldsEnabled(false);
        setErrors(prev => ({ ...prev, repCurp: '', repFirstName: '', repApellidoPaterno: '' }));
      } else {
        setRepCurpApiError('CURP no encontrada o inválida. Puedes capturar los datos manualmente.');
        setRepCurpPreloaded(false);
        setRepCurpValidated(false);
        setRepNameFieldsEnabled(true);
      }
    } catch (err) {
      console.error('Error validating rep CURP:', err?.message || err);
      const isAbort = err?.name === 'AbortError';
      setRepCurpApiError(
        isAbort
          ? 'La validación tardó demasiado. Puedes capturar los datos manualmente.'
          : 'No se pudo validar la CURP. Puedes capturar los datos manualmente.'
      );
      setRepCurpPreloaded(false);
      setRepCurpValidated(false);
      setRepNameFieldsEnabled(true);
    } finally {
      setIsRepCurpLoading(false);
    }
  };

  // ─── Validation ──────────────────────────────────────────────────────────
  const validateForm = () => {
    const newErrors = {};

    if (!tipoPersona) {
      newErrors.tipoPersona = 'Selecciona el tipo de persona';
    }

    if (tipoPersona === 'fisica') {
      if (!formData?.curp) {
        newErrors.curp = 'El CURP es obligatorio';
      } else if (!validateCurpFormat(formData?.curp)) {
        newErrors.curp = 'Formato de CURP inválido (18 caracteres)';
      }

      if (!formData?.firstName) {
        newErrors.firstName = 'El nombre es obligatorio';
      }

      if (!formData?.apellidoPaterno) {
        newErrors.apellidoPaterno = 'El apellido paterno es obligatorio';
      }
    }

    if (tipoPersona === 'moral') {
      if (!formData?.rfcMoral) {
        newErrors.rfcMoral = 'El RFC es obligatorio';
      } else if (formData?.rfcMoral?.length !== 12) {
        newErrors.rfcMoral = 'El RFC de persona moral debe tener 12 caracteres';
      }

      if (!formData?.razonSocialMoral) {
        newErrors.razonSocialMoral = 'La razón social es obligatoria';
      }

      if (!formData?.repCurp) {
        newErrors.repCurp = 'El CURP del representante legal es obligatorio';
      } else if (!validateCurpFormat(formData?.repCurp)) {
        newErrors.repCurp = 'Formato de CURP inválido (18 caracteres)';
      }

      if (!formData?.repFirstName) {
        newErrors.repFirstName = 'El nombre del representante legal es obligatorio';
      }

      if (!formData?.repApellidoPaterno) {
        newErrors.repApellidoPaterno = 'El apellido paterno del representante es obligatorio';
      }
    }

    if (!formData?.roleInBusiness) {
      newErrors.roleInBusiness = 'Selecciona tu rol en el negocio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) return;

    setIsDuplicateChecking(true);
    setDuplicateError('');

    try {
      if (tipoPersona === 'fisica') {
        const email = formData?.email?.trim()?.toLowerCase();
        if (email) {
          const { data, error } = await supabase?.from('user_profiles')?.select('id')?.eq('email', email)?.maybeSingle();
          if (error) throw error;
          if (data) {
            setDuplicateError('Este correo electrónico ya está registrado en el sistema. Si ya tienes una cuenta, inicia sesión.');
            setIsDuplicateChecking(false);
            return;
          }
        }
      }

      if (tipoPersona === 'moral') {
        const rfc = formData?.rfcMoral?.trim()?.toUpperCase();
        const { data, error } = await supabase?.from('user_profiles')?.select('id')?.eq('rfc_moral', rfc)?.maybeSingle();

        if (error) throw error;

        if (data) {
          setDuplicateError('Este RFC ya está registrado en el sistema. Si ya tienes una cuenta, inicia sesión.');
          setIsDuplicateChecking(false);
          return;
        }
      }

      onNext();
    } catch (err) {
      console.error('Error checking duplicates:', err?.message || err);
      // On error, allow proceeding (don't block registration due to check failure)
      onNext();
    } finally {
      setIsDuplicateChecking(false);
    }
  };

  const handleTipoPersonaChange = (value) => {
    updateFormData({
      tipoPersona: value,
      // Reset all person-type-specific fields
      curp: '', firstName: '', apellidoPaterno: '', apellidoMaterno: '',
      rfcMoral: '', razonSocialMoral: '',
      repCurp: '', repFirstName: '', repApellidoPaterno: '', repApellidoMaterno: ''
    });
    setCurpPreloaded(false); setCurpValidated(false); setNameFieldsEnabled(false); setCurpApiError('');
    setRfcValidated(false); setRfcNameEnabled(false); setRfcApiError('');
    setRepCurpPreloaded(false); setRepCurpValidated(false); setRepNameFieldsEnabled(false); setRepCurpApiError('');
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Datos Personales</h3>
        <p className="text-gray-600">
          Información del propietario o representante del negocio
        </p>
      </div>
      {/* Tipo de Persona Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Tipo de Persona <span className="text-red-600">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {tipoPersonaOptions?.map((opt) => (
            <button
              key={opt?.value}
              type="button"
              onClick={() => handleTipoPersonaChange(opt?.value)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all font-medium text-sm gap-2 ${
                tipoPersona === opt?.value
                  ? 'border-blue-600 bg-blue-50 text-blue-700' :'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <Icon
                name={opt?.value === 'fisica' ? 'User' : 'Building2'}
                size={24}
                className={tipoPersona === opt?.value ? 'text-blue-600' : 'text-gray-400'}
              />
              {opt?.label}
            </button>
          ))}
        </div>
        {errors?.tipoPersona && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <Icon name="AlertCircle" size={14} />
            {errors?.tipoPersona}
          </p>
        )}
      </div>
      {/* ── PERSONA FÍSICA ── */}
      {tipoPersona === 'fisica' && (
        <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h4 className="font-semibold text-blue-900 flex items-center gap-2">
            <Icon name="User" size={16} className="text-blue-600" />
            Datos de Persona Física
          </h4>

          {/* CURP */}
          <div>
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Input
                  label="CURP"
                  type="text"
                  placeholder=""
                  value={formData?.curp || ''}
                  onChange={(e) => handleCurpChange(e?.target?.value)}
                  error={errors?.curp}
                  description="18 caracteres en mayúsculas"
                  maxLength={18}
                  required
                  disabled={isCurpLoading}
                />
                {isCurpLoading && (
                  <div className="absolute right-3 top-9 flex items-center space-x-2 text-blue-600">
                    <div className="animate-spin"><Icon name="Loader" size={18} /></div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleCurpBlur}
                disabled={isCurpLoading || !formData?.curp || formData?.curp?.length !== 18}
                className="mb-0.5 px-3 py-2 text-sm font-semibold rounded-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1.5"
              >
                {isCurpLoading ? (
                  <><div className="animate-spin"><Icon name="Loader" size={14} /></div> Validando…</>
                ) : (
                  <><Icon name="ShieldCheck" size={14} /> Validar CURP</>
                )}
              </button>
            </div>

            {/* Help text */}
            <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
              <Icon name="HelpCircle" size={12} className="text-gray-400 flex-shrink-0" />
              ¿No conoces tu CURP? Consúltala en{' '}
              <a
                href="https://www.gob.mx/curp/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800 font-medium"
              >
                RENAPO
              </a>
            </p>

            {curpApiError && !isCurpLoading && (
              <p className="mt-1 text-sm text-amber-600 flex items-center gap-1">
                <Icon name="AlertCircle" size={14} />{curpApiError}
              </p>
            )}
            {!isCurpLoading && curpValidated && !curpApiError && (
              <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                <Icon name="CheckCircle" size={14} />Datos precargados desde RENAPO
              </p>
            )}
          </div>

          {curpPreloaded && !nameFieldsEnabled && (
            <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
              <Icon name="Info" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                Los campos de nombre fueron precargados desde RENAPO. Modifica el CURP para habilitarlos.
              </p>
            </div>
          )}

          <Input
            label="Nombre(s)"
            type="text"
            value={formData?.firstName || ''}
            onChange={(e) => updateFormData({ firstName: e?.target?.value })}
            error={errors?.firstName}
            required
            disabled={!nameFieldsEnabled && !curpPreloaded ? true : curpPreloaded && !nameFieldsEnabled}
          />
          <Input
            label="Apellido Paterno"
            type="text"
            value={formData?.apellidoPaterno || ''}
            onChange={(e) => updateFormData({ apellidoPaterno: e?.target?.value })}
            error={errors?.apellidoPaterno}
            required
            disabled={!nameFieldsEnabled && !curpPreloaded ? true : curpPreloaded && !nameFieldsEnabled}
          />
          <Input
            label="Apellido Materno"
            type="text"
            value={formData?.apellidoMaterno || ''}
            onChange={(e) => updateFormData({ apellidoMaterno: e?.target?.value })}
            description="Opcional"
            disabled={!nameFieldsEnabled && !curpPreloaded ? true : curpPreloaded && !nameFieldsEnabled}
          />
        </div>
      )}
      {/* ── PERSONA MORAL ── */}
      {tipoPersona === 'moral' && (
        <div className="space-y-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
          <h4 className="font-semibold text-purple-900 flex items-center gap-2">
            <Icon name="Building2" size={16} className="text-purple-600" />
            Datos de Persona Moral
          </h4>

          {/* RFC */}
          <div>
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Input
                  label="RFC de la Empresa"
                  type="text"
                  placeholder=""
                  value={formData?.rfcMoral || ''}
                  onChange={(e) => handleRfcChange(e?.target?.value)}
                  error={errors?.rfcMoral}
                  description="12 caracteres para persona moral"
                  maxLength={12}
                  required
                  disabled={isRfcLoading}
                />
                {isRfcLoading && (
                  <div className="absolute right-3 top-9 flex items-center space-x-2 text-purple-600">
                    <div className="animate-spin"><Icon name="Loader" size={18} /></div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleRfcBlur}
                disabled={isRfcLoading || !formData?.rfcMoral || formData?.rfcMoral?.length < 12}
                className="mb-0.5 px-3 py-2 text-sm font-semibold rounded-lg border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1.5"
              >
                {isRfcLoading ? (
                  <><div className="animate-spin"><Icon name="Loader" size={14} /></div> Validando…</>
                ) : (
                  <><Icon name="ShieldCheck" size={14} /> Validar RFC</>
                )}
              </button>
            </div>

            {rfcApiError && !isRfcLoading && (
              <p className="mt-1 text-sm text-amber-600 flex items-center gap-1">
                <Icon name="AlertCircle" size={14} />{rfcApiError}
              </p>
            )}
            {rfcValidated && !isRfcLoading && !rfcApiError && (
              <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                <Icon name="CheckCircle" size={14} />RFC validado ante el SAT
              </p>
            )}
          </div>

          {/* Razón Social */}
          <Input
            label="Razón Social"
            type="text"
            value={formData?.razonSocialMoral || ''}
            onChange={(e) => updateFormData({ razonSocialMoral: e?.target?.value })}
            error={errors?.razonSocialMoral}
            required
            disabled={!rfcNameEnabled && !rfcValidated ? true : rfcValidated && !rfcNameEnabled}
          />

          {/* Representante Legal */}
          <div className="border-t border-purple-200 pt-4 mt-2">
            <h5 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
              <Icon name="UserCheck" size={15} className="text-purple-600" />
              Representante Legal
            </h5>

            {/* Rep CURP */}
            <div className="mb-4">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <Input
                    label="CURP del Representante Legal"
                    type="text"
                    placeholder=""
                    value={formData?.repCurp || ''}
                    onChange={(e) => handleRepCurpChange(e?.target?.value)}
                    error={errors?.repCurp}
                    description="18 caracteres en mayúsculas"
                    maxLength={18}
                    required
                    disabled={isRepCurpLoading}
                  />
                  {isRepCurpLoading && (
                    <div className="absolute right-3 top-9 flex items-center space-x-2 text-purple-600">
                      <div className="animate-spin"><Icon name="Loader" size={18} /></div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleRepCurpBlur}
                  disabled={isRepCurpLoading || !formData?.repCurp || formData?.repCurp?.length !== 18}
                  className="mb-0.5 px-3 py-2 text-sm font-semibold rounded-lg border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1.5"
                >
                  {isRepCurpLoading ? (
                    <><div className="animate-spin"><Icon name="Loader" size={14} /></div> Validando…</>
                  ) : (
                    <><Icon name="ShieldCheck" size={14} /> Validar CURP</>
                  )}
                </button>
              </div>
              {repCurpApiError && !isRepCurpLoading && (
                <p className="mt-1 text-sm text-amber-600 flex items-center gap-1">
                  <Icon name="AlertCircle" size={14} />{repCurpApiError}
                </p>
              )}
              {!isRepCurpLoading && repCurpValidated && !repCurpApiError && (
                <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                  <Icon name="CheckCircle" size={14} />Datos precargados desde RENAPO
                </p>
              )}
            </div>

            {repCurpPreloaded && !repNameFieldsEnabled && (
              <div className="bg-purple-100 border border-purple-200 rounded-lg p-3 flex items-start gap-2 mb-4">
                <Icon name="Info" size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-purple-800">
                  Los campos del representante fueron precargados desde RENAPO.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Nombre(s) del Representante"
                type="text"
                value={formData?.repFirstName || ''}
                onChange={(e) => updateFormData({ repFirstName: e?.target?.value })}
                error={errors?.repFirstName}
                required
                disabled={!repNameFieldsEnabled && !repCurpPreloaded ? true : repCurpPreloaded && !repNameFieldsEnabled}
              />
              <Input
                label="Apellido Paterno del Representante"
                type="text"
                value={formData?.repApellidoPaterno || ''}
                onChange={(e) => updateFormData({ repApellidoPaterno: e?.target?.value })}
                error={errors?.repApellidoPaterno}
                required
                disabled={!repNameFieldsEnabled && !repCurpPreloaded ? true : repCurpPreloaded && !repNameFieldsEnabled}
              />
              <Input
                label="Apellido Materno del Representante"
                type="text"
                value={formData?.repApellidoMaterno || ''}
                onChange={(e) => updateFormData({ repApellidoMaterno: e?.target?.value })}
                description="Opcional"
                disabled={!repNameFieldsEnabled && !repCurpPreloaded ? true : repCurpPreloaded && !repNameFieldsEnabled}
              />
            </div>
          </div>
        </div>
      )}
      {/* Rol en el negocio */}
      {tipoPersona && (
        <Select
          label="Rol en el negocio"
          options={roleOptions}
          value={formData?.roleInBusiness}
          onChange={(value) => updateFormData({ roleInBusiness: value })}
          placeholder="Selecciona tu rol"
          error={errors?.roleInBusiness}
          required
        />
      )}

      {/* Duplicate error */}
      {duplicateError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <Icon name="AlertCircle" size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{duplicateError}</p>
        </div>
      )}

      <div className="flex space-x-4 pt-6">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          iconName="ArrowLeft"
          iconPosition="left"
          className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
          disabled={isDuplicateChecking}
        >
          Atrás
        </Button>
        <Button
          type="button"
          variant="default"
          size="lg"
          onClick={handleNext}
          iconName={isDuplicateChecking ? 'Loader' : 'ArrowRight'}
          iconPosition="right"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          disabled={isDuplicateChecking}
        >
          {isDuplicateChecking ? 'Verificando…' : 'Continuar'}
        </Button>
      </div>
    </div>
  );
};

export default Step2PersonalData;