import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { getAddressByPostalCode, getColoniasFromAddresses } from '../../../services/copomexService';
import { normalizeStateName } from '../../../utils/estadosMexico';

const LocationTab = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [coloniaOptions, setColoniaOptions] = useState([]);
  const [isLoadingPostalCode, setIsLoadingPostalCode] = useState(false);
  const [usarDomicilioFiscal, setUsarDomicilioFiscal] = useState(false);
  const [businessId, setBusinessId] = useState(null);
  const [fiscalData, setFiscalData] = useState(null);

  const [formData, setFormData] = useState({
    codigoPostal: '',
    colonia: '',
    calleNumero: '',
    numeroExterior: '',
    numeroInterior: '',
    ciudad: '',
    estado: '',
    municipio: '',
    referencias: '',
    latitude: null,
    longitude: null
  });

  useEffect(() => {
    loadLocationData();
  }, [user]);

  useEffect(() => {
    if (usarDomicilioFiscal && fiscalData) {
      setFormData(prev => ({
        ...prev,
        codigoPostal: fiscalData?.codigo_postal_fiscal || '',
        colonia: fiscalData?.colonia || '',
        calleNumero: fiscalData?.calle_numero || '',
        ciudad: fiscalData?.ciudad || '',
        estado: fiscalData?.estado || '',
        municipio: fiscalData?.municipio || ''
      }));
    }
  }, [usarDomicilioFiscal, fiscalData]);

  useEffect(() => {
    const loadPostalCodeData = async () => {
      const cp = formData?.codigoPostal;
      if (cp && /^\d{5}$/?.test(cp) && !usarDomicilioFiscal) {
        setIsLoadingPostalCode(true);
        try {
          const addresses = await getAddressByPostalCode(cp);
          if (addresses && addresses?.length > 0) {
            const colonias = getColoniasFromAddresses(addresses);
            setColoniaOptions(colonias?.map(col => ({ value: col, label: col })));
            const firstAddress = addresses?.[0];
            setFormData(prev => ({
              ...prev,
              municipio: firstAddress?.municipio || prev?.municipio,
              ciudad: firstAddress?.ciudad || firstAddress?.municipio || prev?.ciudad,
              estado: normalizeStateName(firstAddress?.estado) || prev?.estado
            }));
          }
        } catch (err) {
          console.error('Error loading postal code:', err);
          setColoniaOptions([]);
        } finally {
          setIsLoadingPostalCode(false);
        }
      } else if (!usarDomicilioFiscal) {
        setColoniaOptions([]);
      }
    };
    loadPostalCodeData();
  }, [formData?.codigoPostal, usarDomicilioFiscal]);

  const loadLocationData = async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        ?.from('business_settings')
        ?.select('business_id, business_address, business_city, business_state, business_postal_code, calle_numero, colonia, referencias, latitude, longitude, codigo_postal_fiscal')
        ?.eq('owner_id', user?.id)
        ?.single();
      if (!fetchError && data) {
        setBusinessId(data?.business_id);
        setFiscalData(data);
        setFormData({
          codigoPostal: data?.business_postal_code || '',
          colonia: data?.colonia || '',
          calleNumero: data?.calle_numero || data?.business_address || '',
          numeroExterior: '',
          numeroInterior: '',
          ciudad: data?.business_city || '',
          estado: data?.business_state || '',
          municipio: '',
          referencias: data?.referencias || '',
          latitude: data?.latitude || null,
          longitude: data?.longitude || null
        });
      }
    } catch (err) {
      console.error('Error loading location data:', err);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData?.calleNumero || formData?.calleNumero?.length < 5) newErrors.calleNumero = 'La dirección debe tener al menos 5 caracteres';
    if (!formData?.colonia || formData?.colonia?.length < 3) newErrors.colonia = 'La colonia debe tener al menos 3 caracteres';
    if (!formData?.codigoPostal || !/^\d{5}$/?.test(formData?.codigoPostal)) newErrors.codigoPostal = 'El código postal debe tener exactamente 5 dígitos';
    if (!formData?.ciudad || formData?.ciudad?.length < 3) newErrors.ciudad = 'La ciudad debe tener al menos 3 caracteres';
    if (!formData?.estado) newErrors.estado = 'El estado es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const upsertData = {
        business_address: formData?.calleNumero,
        business_city: formData?.ciudad,
        business_state: formData?.estado,
        business_postal_code: formData?.codigoPostal,
        calle_numero: formData?.calleNumero,
        colonia: formData?.colonia,
        referencias: formData?.referencias,
        latitude: formData?.latitude,
        longitude: formData?.longitude,
        owner_id: user?.id,
        updated_at: new Date()?.toISOString()
      };
      if (businessId) {
        const { error: updateError } = await supabase
          ?.from('business_settings')
          ?.update(upsertData)
          ?.eq('business_id', businessId);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          ?.from('business_settings')
          ?.insert({ ...upsertData, business_id: user?.id, business_name: '' });
        if (insertError) throw insertError;
        setBusinessId(user?.id);
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving location:', err);
      setError(err?.message || 'Error al guardar la ubicación');
    } finally {
      setSaving(false);
    }
  };

  const handleMapClick = () => {
    const mockLat = 19.4326 + (Math.random() - 0.5) * 0.1;
    const mockLng = -99.1332 + (Math.random() - 0.5) * 0.1;
    setFormData(prev => ({ ...prev, latitude: mockLat, longitude: mockLng }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Ubicación</h3>
        <p className="text-sm text-muted-foreground">Dirección del establecimiento de tu negocio</p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm flex items-center gap-2">
          <Icon name="AlertCircle" size={16} />{error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-center gap-2">
          <Icon name="CheckCircle" size={16} />Ubicación guardada exitosamente
        </div>
      )}

      {/* Usar Domicilio Fiscal Toggle */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <label className="text-sm font-semibold text-foreground mb-1 block flex items-center">
              <Icon name="Copy" size={18} className="mr-2 text-blue-600" />
              ¿Usar el mismo domicilio fiscal?
            </label>
            <p className="text-xs text-muted-foreground">Copia automáticamente los datos del domicilio fiscal</p>
          </div>
          <button type="button" onClick={() => setUsarDomicilioFiscal(!usarDomicilioFiscal)}
            className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              usarDomicilioFiscal ? 'bg-blue-600' : 'bg-gray-300'
            }`}>
            <span className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              usarDomicilioFiscal ? 'translate-x-6' : 'translate-x-0'
            }`} />
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
          placeholder="01000"
          value={formData?.codigoPostal}
          onChange={(e) => setFormData({ ...formData, codigoPostal: e?.target?.value?.replace(/\D/g, '') })}
          error={errors?.codigoPostal}
          description="Ingresa el CP para autocompletar estado, municipio y colonia"
          maxLength={5}
          required
          disabled={usarDomicilioFiscal}
        />

        {isLoadingPostalCode && (
          <div className="flex items-center space-x-2 text-sm text-primary">
            <div className="animate-spin"><Icon name="Loader" size={16} /></div>
            <span>Buscando información del código postal...</span>
          </div>
        )}

        {coloniaOptions?.length > 0 && !usarDomicilioFiscal ? (
          <Select
            label="Colonia"
            options={coloniaOptions}
            value={formData?.colonia}
            onChange={(value) => setFormData({ ...formData, colonia: value })}
            placeholder="Selecciona tu colonia"
            error={errors?.colonia}
            searchable
            required
          />
        ) : (
          <Input
            label="Colonia"
            type="text"
            placeholder="Centro"
            value={formData?.colonia}
            onChange={(e) => setFormData({ ...formData, colonia: e?.target?.value })}
            error={errors?.colonia}
            required
            disabled={usarDomicilioFiscal}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Calle"
            type="text"
            placeholder="Av. Reforma"
            value={formData?.calleNumero}
            onChange={(e) => setFormData({ ...formData, calleNumero: e?.target?.value })}
            error={errors?.calleNumero}
            required
            disabled={usarDomicilioFiscal}
          />
          <Input
            label="Número Exterior"
            type="text"
            placeholder="123"
            value={formData?.numeroExterior}
            onChange={(e) => setFormData({ ...formData, numeroExterior: e?.target?.value })}
            disabled={usarDomicilioFiscal}
          />
        </div>

        <Input
          label="Número Interior"
          type="text"
          placeholder="Depto. 4B (opcional)"
          value={formData?.numeroInterior}
          onChange={(e) => setFormData({ ...formData, numeroInterior: e?.target?.value })}
          disabled={usarDomicilioFiscal}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Ciudad"
            type="text"
            placeholder="Ciudad de México"
            value={formData?.ciudad}
            onChange={(e) => setFormData({ ...formData, ciudad: e?.target?.value })}
            error={errors?.ciudad}
            required
            disabled={isLoadingPostalCode || usarDomicilioFiscal}
          />
          <Input
            label="Estado"
            type="text"
            placeholder="Estado"
            value={formData?.estado}
            onChange={(e) => setFormData({ ...formData, estado: e?.target?.value })}
            error={errors?.estado}
            required
            disabled={isLoadingPostalCode || usarDomicilioFiscal}
          />
        </div>

        <Input
          label="Municipio/Delegación"
          type="text"
          placeholder="Miguel Hidalgo"
          value={formData?.municipio}
          onChange={(e) => setFormData({ ...formData, municipio: e?.target?.value })}
          disabled={isLoadingPostalCode || usarDomicilioFiscal}
        />

        <Input
          label="Referencias / Entre Calles"
          type="text"
          placeholder="Entre Juárez y Hidalgo, edificio azul"
          value={formData?.referencias}
          onChange={(e) => setFormData({ ...formData, referencias: e?.target?.value })}
          description="Opcional"
        />
      </div>

      {/* Map Section */}
      <div className="border-t border-border pt-6">
        <h4 className="text-base font-semibold text-foreground mb-2 flex items-center">
          <Icon name="Map" size={18} className="mr-2 text-primary" />
          Pin en Mapa (Ubicación Exacta)
        </h4>
        <p className="text-sm text-muted-foreground mb-4">Selecciona la ubicación exacta de tu negocio en el mapa</p>
        <div
          onClick={handleMapClick}
          className="w-full h-56 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-dashed border-blue-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:from-blue-100 hover:to-blue-200 transition-all duration-200"
        >
          <Icon name="MapPin" size={40} className="text-blue-600 mb-3" />
          <p className="text-sm font-semibold text-foreground mb-1">
            {formData?.latitude && formData?.longitude ? '📍 Ubicación seleccionada' : 'Haz clic para seleccionar ubicación'}
          </p>
          {formData?.latitude && formData?.longitude && (
            <p className="text-xs text-muted-foreground font-mono">
              Lat: {formData?.latitude?.toFixed(6)}, Lng: {formData?.longitude?.toFixed(6)}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">Mapa interactivo (Demo)</p>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Guardando...</>
          ) : (
            <><Icon name="Save" size={16} className="mr-2" />Guardar Ubicación</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default LocationTab;
