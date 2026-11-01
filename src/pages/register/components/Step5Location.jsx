import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { getAddressByPostalCode, getColoniasFromAddresses } from '../../../services/copomexService';
import { normalizeStateName } from '../../../utils/estadosMexico';

const Step5Location = ({ formData, updateFormData, onNext, onBack }) => {
  const [errors, setErrors] = useState({});
  const [usarDomicilioFiscal, setUsarDomicilioFiscal] = useState(false);
  const [coloniaOptions, setColoniaOptions] = useState([]);
  const [isLoadingPostalCode, setIsLoadingPostalCode] = useState(false);

  const estadosMXOptions = [
    { value: 'aguascalientes', label: 'Aguascalientes' },
    { value: 'baja_california', label: 'Baja California' },
    { value: 'baja_california_sur', label: 'Baja California Sur' },
    { value: 'campeche', label: 'Campeche' },
    { value: 'chiapas', label: 'Chiapas' },
    { value: 'chihuahua', label: 'Chihuahua' },
    { value: 'coahuila', label: 'Coahuila' },
    { value: 'colima', label: 'Colima' },
    { value: 'cdmx', label: 'Ciudad de México' },
    { value: 'durango', label: 'Durango' },
    { value: 'guanajuato', label: 'Guanajuato' },
    { value: 'guerrero', label: 'Guerrero' },
    { value: 'hidalgo', label: 'Hidalgo' },
    { value: 'jalisco', label: 'Jalisco' },
    { value: 'mexico', label: 'Estado de México' },
    { value: 'michoacan', label: 'Michoacán' },
    { value: 'morelos', label: 'Morelos' },
    { value: 'nayarit', label: 'Nayarit' },
    { value: 'nuevo_leon', label: 'Nuevo León' },
    { value: 'oaxaca', label: 'Oaxaca' },
    { value: 'puebla', label: 'Puebla' },
    { value: 'queretaro', label: 'Querétaro' },
    { value: 'quintana_roo', label: 'Quintana Roo' },
    { value: 'san_luis_potosi', label: 'San Luis Potosí' },
    { value: 'sinaloa', label: 'Sinaloa' },
    { value: 'sonora', label: 'Sonora' },
    { value: 'tabasco', label: 'Tabasco' },
    { value: 'tamaulipas', label: 'Tamaulipas' },
    { value: 'tlaxcala', label: 'Tlaxcala' },
    { value: 'veracruz', label: 'Veracruz' },
    { value: 'yucatan', label: 'Yucatán' },
    { value: 'zacatecas', label: 'Zacatecas' }
  ];

  // Copy fiscal address when toggle is activated
  useEffect(() => {
    if (usarDomicilioFiscal) {
      updateFormData({
        codigoPostal: formData?.codigoPostalFiscal || '',
        colonia: formData?.coloniaFiscal || '',
        calleNumero: formData?.calleNumeroFiscal || '',
        numeroInterior: formData?.numeroInteriorFiscal || '',
        ciudad: formData?.ciudadFiscal || '',
        estado: formData?.estadoFiscal || '',
        municipio: formData?.municipioFiscal || ''
      });
    }
  }, [usarDomicilioFiscal]);

  // Load postal code data when codigoPostal changes
  useEffect(() => {
    const loadPostalCodeData = async () => {
      const cp = formData?.codigoPostal;
      if (cp && /^\d{5}$/?.test(cp) && !usarDomicilioFiscal) {
        setIsLoadingPostalCode(true);
        try {
          const addresses = await getAddressByPostalCode(cp);
          if (addresses && addresses?.length > 0) {
            // Extract colonias
            const colonias = getColoniasFromAddresses(addresses);
            setColoniaOptions(colonias?.map(col => ({ value: col, label: col })));

            // Auto-fill other fields from first result
            const firstAddress = addresses?.[0];
            updateFormData({
              municipio: firstAddress?.municipio || '',
              ciudad: firstAddress?.ciudad || firstAddress?.municipio || '',
              estado: normalizeStateName(firstAddress?.estado) || ''
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
  }, [formData?.codigoPostal, usarDomicilioFiscal]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.calleNumero) {
      newErrors.calleNumero = 'La calle y número son obligatorios';
    } else if (formData?.calleNumero?.length < 5) {
      newErrors.calleNumero = 'La dirección debe tener al menos 5 caracteres';
    }

    if (!formData?.colonia) {
      newErrors.colonia = 'La colonia es obligatoria';
    } else if (formData?.colonia?.length < 3) {
      newErrors.colonia = 'La colonia debe tener al menos 3 caracteres';
    }

    if (!formData?.codigoPostal) {
      newErrors.codigoPostal = 'El código postal es obligatorio';
    } else if (!/^\d{5}$/?.test(formData?.codigoPostal)) {
      newErrors.codigoPostal = 'El código postal debe tener exactamente 5 dígitos';
    }

    if (!formData?.ciudad) {
      newErrors.ciudad = 'La ciudad es obligatoria';
    } else if (formData?.ciudad?.length < 3) {
      newErrors.ciudad = 'La ciudad debe tener al menos 3 caracteres';
    }

    if (!formData?.estado) {
      newErrors.estado = 'El estado es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const handleMapClick = () => {
    // Simulated map pin selection
    const mockLat = 19.4326 + (Math.random() - 0.5) * 0.1;
    const mockLng = -99.1332 + (Math.random() - 0.5) * 0.1;
    updateFormData({ 
      latitude: mockLat, 
      longitude: mockLng 
    });
  };

  const handleUsarDomicilioFiscalToggle = () => {
    setUsarDomicilioFiscal(!usarDomicilioFiscal);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Ubicación</h3>
        <p className="text-gray-600">
          Ayuda a tus clientes a encontrarte
        </p>
      </div>
      {/* Usar Domicilio Fiscal Toggle */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-900 mb-1 block flex items-center">
              <Icon name="Copy" size={18} className="mr-2 text-blue-600" />
              ¿Usar el mismo domicilio fiscal?
            </label>
            <p className="text-xs text-gray-600">
              Copia automáticamente los datos del domicilio fiscal del paso anterior
            </p>
          </div>
          <button
            type="button"
            onClick={handleUsarDomicilioFiscalToggle}
            className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              usarDomicilioFiscal ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                usarDomicilioFiscal ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        {usarDomicilioFiscal && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800 flex items-center">
              <Icon name="CheckCircle" size={14} className="mr-1" />
              Domicilio fiscal copiado. Puedes modificar los campos si es necesario.
            </p>
          </div>
        )}
      </div>

      {/* Address Fields */}
      <div className="space-y-4">
        <Input
          label="Código Postal"
          type="text"
          placeholder=""
          value={formData?.codigoPostal}
          onChange={(e) => updateFormData({ codigoPostal: e?.target?.value?.replace(/\D/g, '') })}
          error={errors?.codigoPostal}
          description="Ingresa el CP para autocompletar estado, municipio y colonia"
          maxLength={5}
          required
          disabled={usarDomicilioFiscal}
        />

        {isLoadingPostalCode && (
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <div className="animate-spin">
              <Icon name="Loader" size={16} />
            </div>
            <span>Buscando información del código postal...</span>
          </div>
        )}

        {coloniaOptions?.length > 0 && !usarDomicilioFiscal ? (
          <Select
            label="Colonia"
            options={coloniaOptions}
            value={formData?.colonia}
            onChange={(value) => updateFormData({ colonia: value })}
            placeholder="Selecciona tu colonia"
            error={errors?.colonia}
            searchable
            required
          />
        ) : (
          <Input
            label="Colonia"
            type="text"
            placeholder=""
            value={formData?.colonia}
            onChange={(e) => updateFormData({ colonia: e?.target?.value })}
            error={errors?.colonia}
            required
            disabled={usarDomicilioFiscal}
          />
        )}

        <Input
          label="Calle y Número"
          type="text"
          placeholder=""
          value={formData?.calleNumero}
          onChange={(e) => updateFormData({ calleNumero: e?.target?.value })}
          error={errors?.calleNumero}
          required
          disabled={usarDomicilioFiscal}
        />

        <Input
          label="Número Interior"
          type="text"
          placeholder=""
          value={formData?.numeroInterior}
          onChange={(e) => updateFormData({ numeroInterior: e?.target?.value })}
          disabled={usarDomicilioFiscal}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Ciudad"
            type="text"
            placeholder=""
            value={formData?.ciudad}
            onChange={(e) => updateFormData({ ciudad: e?.target?.value })}
            error={errors?.ciudad}
            required
            disabled={isLoadingPostalCode || usarDomicilioFiscal}
          />

          <Input
            label="Estado"
            type="text"
            placeholder=""
            value={formData?.estado}
            onChange={(e) => updateFormData({ estado: e?.target?.value })}
            error={errors?.estado}
            required
            disabled={isLoadingPostalCode || usarDomicilioFiscal}
          />
        </div>

        <Input
          label="Referencias / Entre Calles"
          type="text"
          placeholder=""
          value={formData?.referencias}
          onChange={(e) => updateFormData({ referencias: e?.target?.value })}
          description="Opcional"
        />
      </div>

      {/* Interactive Map Section */}
      <div className="border-t-2 border-gray-200 pt-6 mt-6">
        <h4 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
          <Icon name="Map" size={20} className="mr-2 text-blue-600" />
          Pin en Mapa (Ubicación Exacta)
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Selecciona la ubicación exacta de tu negocio en el mapa para extraer coordenadas precisas
        </p>

        <div className="space-y-4">
          {/* Map Placeholder */}
          <div 
            onClick={handleMapClick}
            className="w-full h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-dashed border-blue-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:from-blue-100 hover:to-blue-200 transition-all duration-200"
          >
            <Icon name="MapPin" size={48} className="text-blue-600 mb-4" />
            <p className="text-base font-semibold text-gray-900 mb-1">
              {formData?.latitude && formData?.longitude
                ? `📍 Ubicación seleccionada`
                : 'Haz clic para seleccionar ubicación'}
            </p>
            {formData?.latitude && formData?.longitude && (
              <p className="text-sm text-gray-600 font-mono">
                Lat: {formData?.latitude?.toFixed(6)}, Lng: {formData?.longitude?.toFixed(6)}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Mapa interactivo (Demo)
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Herramienta Adicional
                </p>
                <p className="text-sm text-blue-800">
                  Usa el mapa para seleccionar la ubicación exacta de tu negocio. Las coordenadas se extraerán automáticamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-4 pt-4">
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

export default Step5Location;