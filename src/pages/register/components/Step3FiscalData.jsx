import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

import { getAddressByPostalCode, getColoniasFromAddresses } from '../../../services/copomexService';
import { detectPersonType, validateRFC, getPersonTypeLabel } from '../../../utils/rfcUtils';
import { normalizeStateName } from '../../../utils/estadosMexico';

const Step3FiscalData = ({ formData, updateFormData, onNext, onBack }) => {
  const [errors, setErrors] = useState({});
  const [personType, setPersonType] = useState(null);
  const [coloniaOptions, setColoniaOptions] = useState([]);
  const [isLoadingPostalCode, setIsLoadingPostalCode] = useState(false);
  const [isValidatingRfc, setIsValidatingRfc] = useState(false);
  const [rfcApiResult, setRfcApiResult] = useState(null);
  const [rfcApiError, setRfcApiError] = useState('');
  // nameFieldEnabled: false by default, true ONLY on connection/query error with Nubarium
  const [nameFieldEnabled, setNameFieldEnabled] = useState(false);
  // coloniaEnabled: false by default, true after RFC query is performed (success or failure)
  const [coloniaEnabled, setColoniaEnabled] = useState(false);
  // rfcQueryDone: tracks if RFC query was attempted
  const [rfcQueryDone, setRfcQueryDone] = useState(false);

  const regimenFiscalOptions = [
    { value: '601', label: '601 - General de Ley Personas Morales', type: 'moral' },
    { value: '603', label: '603 - Personas Morales con Fines no Lucrativos', type: 'moral' },
    { value: '605', label: '605 - Sueldos y Salarios e Ingresos Asimilados a Salarios', type: 'fisica' },
    { value: '606', label: '606 - Arrendamiento', type: 'fisica' },
    { value: '607', label: '607 - Régimen de Enajenación o Adquisición de Bienes', type: 'fisica' },
    { value: '608', label: '608 - Demás ingresos', type: 'fisica' },
    { value: '610', label: '610 - Residentes en el Extranjero sin Establecimiento Permanente en México', type: 'both' },
    { value: '611', label: '611 - Ingresos por Dividendos (socios y accionistas)', type: 'fisica' },
    { value: '612', label: '612 - Personas Físicas con Actividades Empresariales y Profesionales', type: 'fisica' },
    { value: '614', label: '614 - Ingresos por intereses', type: 'fisica' },
    { value: '615', label: '615 - Régimen de los ingresos por obtención de premios', type: 'fisica' },
    { value: '616', label: '616 - Sin obligaciones fiscales', type: 'fisica' },
    { value: '620', label: '620 - Sociedades Cooperativas de Producción que optan por diferir sus ingresos', type: 'moral' },
    { value: '621', label: '621 - Incorporación Fiscal', type: 'fisica' },
    { value: '622', label: '622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras', type: 'both' },
    { value: '623', label: '623 - Opcional para Grupos de Sociedades', type: 'moral' },
    { value: '624', label: '624 - Coordinados', type: 'moral' },
    { value: '625', label: '625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas', type: 'fisica' },
    { value: '626', label: '626 - Régimen Simplificado de Confianza (RESICO)', type: 'both' }
  ];

  const filteredRegimenFiscalOptions = personType
    ? regimenFiscalOptions?.filter(option => option?.type === personType || option?.type === 'both')
    : regimenFiscalOptions;

  // Detect person type when RFC changes
  useEffect(() => {
    if (formData?.tipoPersona === 'moral') {
      setPersonType('moral');
      // For moral, colonia is always enabled (no RFC query needed in step 3)
      setColoniaEnabled(true);
    } else if (formData?.rfc) {
      const type = detectPersonType(formData?.rfc);
      setPersonType(type);
    } else {
      setPersonType(null);
    }
  }, [formData?.rfc, formData?.tipoPersona]);

  // Load postal code data when codigoPostalFiscal changes
  useEffect(() => {
    const loadPostalCodeData = async () => {
      const cp = formData?.codigoPostalFiscal;
      if (cp && /^\d{5}$/?.test(cp)) {
        setIsLoadingPostalCode(true);
        try {
          const addresses = await getAddressByPostalCode(cp);
          if (addresses && addresses?.length > 0) {
            const colonias = getColoniasFromAddresses(addresses);
            setColoniaOptions(colonias?.map(col => ({ value: col, label: col })));
            const firstAddress = addresses?.[0];
            updateFormData({
              municipioFiscal: firstAddress?.municipio || '',
              ciudadFiscal: firstAddress?.ciudad || firstAddress?.municipio || '',
              estadoFiscal: normalizeStateName(firstAddress?.estado) || ''
            });
          }
        } catch (error) {
          console.error('Error loading postal code:', error);
          setColoniaOptions([]);
        } finally {
          setIsLoadingPostalCode(false);
        }
      } else {
        setColoniaOptions([]);
      }
    };
    loadPostalCodeData();
  }, [formData?.codigoPostalFiscal]);

  const handleRfcChange = (value) => {
    const upper = value?.toUpperCase();
    // Enforce max length based on person type from Step 2
    const maxLen = formData?.tipoPersona === 'moral' ? 12 : 13;
    updateFormData({ rfc: upper?.slice(0, maxLen) });
    setRfcApiResult(null);
    setRfcApiError('');
    // Reset name field and colonia when RFC changes
    setNameFieldEnabled(false);
    setColoniaEnabled(false);
    setRfcQueryDone(false);
  };

  const handleRfcBlur = async () => {
    const rfc = formData?.rfc;
    if (!rfc) return;

    const rfcValidation = validateRFC(rfc);
    if (!rfcValidation?.valid) return;

    setIsValidatingRfc(true);
    setRfcApiError('');
    setRfcApiResult(null);

    try {
      const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${SUPABASE_URL}/functions/v1/nubarium-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ action: 'validate_rfc', rfc })
      });

      const data = await response?.json();

      if (data?.estatus === 'OK' && data?.nombre) {
        setRfcApiResult(data);
        // RFC valid: pre-fill name fields and keep them DISABLED
        const detectedType = detectPersonType(rfc);
        if (detectedType === 'moral') {
          updateFormData({ razonSocial: data?.nombre });
        } else if (detectedType === 'fisica') {
          updateFormData({ nombresContribuyente: data?.nombre });
        }
        // Name field stays disabled (successful query)
        setNameFieldEnabled(false);
        // Enable colonia after successful RFC query
        setColoniaEnabled(true);
        setRfcQueryDone(true);
      } else {
        // RFC not found in SAT (invalid RFC): keep name fields DISABLED, enable colonia
        setRfcApiError('RFC no encontrado en el SAT. Verifica que tenga FIEL o CSD activo.');
        setNameFieldEnabled(false);
        setColoniaEnabled(true);
        setRfcQueryDone(true);
      }
    } catch (error) {
      console.error('Error validating RFC:', error);
      // Connection/query error: enable name fields for manual capture, enable colonia
      setRfcApiError('No se pudo validar el RFC. Puedes continuar ingresando los datos manualmente.');
      setNameFieldEnabled(true);
      setColoniaEnabled(true);
      setRfcQueryDone(true);
    } finally {
      setIsValidatingRfc(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // RFC validation only for persona moral (required) or if física provided a value
    if (formData?.tipoPersona === 'moral') {
      // moral: RFC is copied/disabled, no validation needed here
    } else if (formData?.tipoPersona !== 'fisica' && formData?.rfc) {
      // unknown type with RFC provided: validate format
      const rfcValidation = validateRFC(formData?.rfc);
      if (!rfcValidation?.valid) {
        newErrors.rfc = rfcValidation?.message;
      }
    } else if (formData?.tipoPersona !== 'fisica' && !formData?.tipoPersona) {
      // fallback: validate if RFC present
      if (formData?.rfc) {
        const rfcValidation = validateRFC(formData?.rfc);
        if (!rfcValidation?.valid) {
          newErrors.rfc = rfcValidation?.message;
        }
      }
    }

    // Régimen Fiscal: required for moral only
    if (formData?.tipoPersona === 'moral' && !formData?.regimenFiscal) {
      newErrors.regimenFiscal = 'Selecciona un régimen fiscal SAT válido';
    }

    if (!formData?.codigoPostalFiscal) {
      newErrors.codigoPostalFiscal = 'El código postal es obligatorio';
    } else if (!/^\d{5}$/?.test(formData?.codigoPostalFiscal)) {
      newErrors.codigoPostalFiscal = 'El código postal debe tener exactamente 5 dígitos';
    }

    if (!formData?.coloniaFiscal) {
      newErrors.coloniaFiscal = 'La colonia es obligatoria';
    }

    if (!formData?.calleNumeroFiscal) {
      newErrors.calleNumeroFiscal = 'La calle es obligatoria';
    }

    if (!formData?.numeroExteriorFiscal) {
      newErrors.numeroExteriorFiscal = 'El número exterior es obligatorio';
    }

    if (!formData?.municipioFiscal) {
      newErrors.municipioFiscal = 'El municipio es obligatorio';
    }

    if (!formData?.estadoFiscal) {
      newErrors.estadoFiscal = 'El estado es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Datos Fiscales y de domicilio</h3>
        <p className="text-gray-600">
          Información requerida para la emisión de CFDI
        </p>
      </div>

      {/* RFC and Person Type Detection */}
      <div className="space-y-4">
        <div className="relative">
          <Input
            label="RFC"
            type="text"
            placeholder=""
            value={formData?.tipoPersona === 'moral' ? (formData?.rfcMoral || '') : (formData?.rfc || '')}
            onChange={(e) => {
              if (formData?.tipoPersona !== 'moral') {
                handleRfcChange(e?.target?.value);
              }
            }}
            onBlur={formData?.tipoPersona !== 'moral' ? handleRfcBlur : undefined}
            error={errors?.rfc}
            description={
              formData?.tipoPersona === 'moral' ?'12 caracteres — Persona Moral (copiado del paso anterior)'
                : formData?.tipoPersona === 'fisica' ?'13 caracteres — Persona Física' :'12 caracteres (Persona Moral) o 13 (Persona Física)'
            }
            maxLength={formData?.tipoPersona === 'moral' ? 12 : 13}
            required={formData?.tipoPersona !== 'moral' && formData?.tipoPersona !== 'fisica'}
            disabled={formData?.tipoPersona === 'moral' || isValidatingRfc}
          />
          {isValidatingRfc && formData?.tipoPersona !== 'moral' && (
            <div className="absolute right-3 top-9 flex items-center space-x-2 text-blue-600">
              <div className="animate-spin">
                <Icon name="Loader" size={18} />
              </div>
            </div>
          )}
          {rfcApiError && !isValidatingRfc && formData?.tipoPersona !== 'moral' && (
            <p className="mt-1 text-sm text-amber-600 flex items-center space-x-1">
              <Icon name="AlertCircle" size={14} />
              <span>{rfcApiError}</span>
            </p>
          )}
          {rfcApiResult && !isValidatingRfc && formData?.tipoPersona !== 'moral' && (
            <p className="mt-1 text-sm text-green-600 flex items-center space-x-1">
              <Icon name="CheckCircle" size={14} />
              <span>RFC validado ante el SAT</span>
            </p>
          )}
        </div>

        {personType && (
          <div className={`p-4 rounded-lg border-2 ${
            personType === 'moral' ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center space-x-2">
              <Icon
                name={personType === 'moral' ? 'Building' : 'User'}
                size={20}
                className={personType === 'moral' ? 'text-purple-600' : 'text-blue-600'}
              />
              <p className={`text-sm font-semibold ${
                personType === 'moral' ? 'text-purple-900' : 'text-blue-900'
              }`}>
                Tipo de Persona: {getPersonTypeLabel(personType)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Régimen Fiscal */}
      <Select
        label="Régimen Fiscal SAT"
        options={filteredRegimenFiscalOptions}
        value={formData?.regimenFiscal}
        onChange={(value) => updateFormData({ regimenFiscal: value })}
        placeholder="Selecciona tu régimen fiscal"
        error={errors?.regimenFiscal}
        searchable
        required={formData?.tipoPersona === 'moral'}
        disabled={formData?.tipoPersona === 'fisica' && !formData?.rfc}
      />

      {/* Domicilio Fiscal Section */}
      <div className="border-t-2 border-gray-200 pt-6 mt-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Icon name="MapPin" size={20} className="mr-2 text-blue-600" />
          Domicilio Fiscal
        </h4>

        <div className="space-y-4">
          <Input
            label="Código Postal"
            type="text"
            placeholder=""
            value={formData?.codigoPostalFiscal || ''}
            onChange={(e) => updateFormData({ codigoPostalFiscal: e?.target?.value?.replace(/\D/g, '') })}
            error={errors?.codigoPostalFiscal}
            description="Ingresa el CP para autocompletar estado, municipio y colonia"
            maxLength={5}
            required
          />

          {isLoadingPostalCode && (
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <div className="animate-spin">
                <Icon name="Loader" size={16} />
              </div>
              <span>Buscando información del código postal...</span>
            </div>
          )}

          {/* Colonia: disabled until RFC query is done */}
          {coloniaOptions?.length > 0 ? (
            <Select
              label="Colonia"
              options={coloniaOptions}
              value={formData?.coloniaFiscal}
              onChange={(value) => updateFormData({ coloniaFiscal: value })}
              placeholder="Selecciona tu colonia"
              error={errors?.coloniaFiscal}
              searchable
              required
            />
          ) : (
            <Input
              label="Colonia"
              type="text"
              placeholder=""
              value={formData?.coloniaFiscal || ''}
              onChange={(e) => updateFormData({ coloniaFiscal: e?.target?.value })}
              error={errors?.coloniaFiscal}
              required
            />
          )}

          <Input
            label="Calle"
            type="text"
            placeholder=""
            value={formData?.calleNumeroFiscal || ''}
            onChange={(e) => updateFormData({ calleNumeroFiscal: e?.target?.value })}
            error={errors?.calleNumeroFiscal}
            required
          />

          {/* Número Exterior e Interior en la misma fila - 2 columnas */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Número Exterior"
              type="text"
              placeholder=""
              value={formData?.numeroExteriorFiscal || ''}
              onChange={(e) => updateFormData({ numeroExteriorFiscal: e?.target?.value })}
              error={errors?.numeroExteriorFiscal}
              required
            />
            <Input
              label="Número Interior"
              type="text"
              placeholder=""
              value={formData?.numeroInteriorFiscal || ''}
              onChange={(e) => updateFormData({ numeroInteriorFiscal: e?.target?.value })}
            />
          </div>

          {/* Municipio y Estado: siempre deshabilitados (se llenan automáticamente con CP) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Municipio/Delegación"
              type="text"
              placeholder=""
              value={formData?.municipioFiscal || ''}
              onChange={(e) => updateFormData({ municipioFiscal: e?.target?.value })}
              error={errors?.municipioFiscal}
              required
              disabled
            />

            <Input
              label="Estado"
              type="text"
              placeholder=""
              value={formData?.estadoFiscal || ''}
              onChange={(e) => updateFormData({ estadoFiscal: e?.target?.value })}
              error={errors?.estadoFiscal}
              required
              disabled
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Shield" size={20} className="text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900 mb-1">
              Nota de Privacidad
            </p>
            <p className="text-sm text-blue-800">
              Tus datos fiscales se utilizan únicamente para la emisión de CFDI y están protegidos conforme a la ley
            </p>
          </div>
        </div>
      </div>

      <div className="flex space-x-4 pt-6">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          iconName="ArrowLeft"
          iconPosition="left"
          className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
        >
          Atrás
        </Button>
        <Button
          type="button"
          variant="default"
          size="lg"
          onClick={handleNext}
          iconName="ArrowRight"
          iconPosition="right"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default Step3FiscalData;