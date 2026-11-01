import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { getAddressByPostalCode, getColoniasFromAddresses } from '../../../services/copomexService';
import { detectPersonType, validateRFC, getPersonTypeLabel } from '../../../utils/rfcUtils';
import { normalizeStateName } from '../../../utils/estadosMexico';

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
  { value: '616', label: '616 - Sin obligaciones fiscales', type: 'fisica' },
  { value: '620', label: '620 - Sociedades Cooperativas de Producción que optan por diferir sus ingresos', type: 'moral' },
  { value: '621', label: '621 - Incorporación Fiscal', type: 'fisica' },
  { value: '622', label: '622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras', type: 'both' },
  { value: '623', label: '623 - Opcional para Grupos de Sociedades', type: 'moral' },
  { value: '624', label: '624 - Coordinados', type: 'moral' },
  { value: '625', label: '625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas', type: 'fisica' },
  { value: '626', label: '626 - Régimen Simplificado de Confianza (RESICO)', type: 'both' }
];

const FiscalDataTab = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [personType, setPersonType] = useState(null);
  const [coloniaOptions, setColoniaOptions] = useState([]);
  const [isLoadingPostalCode, setIsLoadingPostalCode] = useState(false);
  const [businessId, setBusinessId] = useState(null);

  const [formData, setFormData] = useState({
    rfc: '',
    razonSocial: '',
    nombresContribuyente: '',
    apellidoPaternoContribuyente: '',
    apellidoMaternoContribuyente: '',
    regimenFiscal: '',
    codigoPostalFiscal: '',
    coloniaFiscal: '',
    calleNumeroFiscal: '',
    numeroExteriorFiscal: '',
    numeroInteriorFiscal: '',
    municipioFiscal: '',
    ciudadFiscal: '',
    estadoFiscal: ''
  });

  const filteredRegimenFiscalOptions = personType
    ? regimenFiscalOptions?.filter(o => o?.type === personType || o?.type === 'both')
    : regimenFiscalOptions;

  useEffect(() => {
    loadFiscalData();
  }, [user]);

  useEffect(() => {
    if (formData?.rfc) {
      const type = detectPersonType(formData?.rfc);
      setPersonType(type);
    } else {
      setPersonType(null);
    }
  }, [formData?.rfc]);

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
            setFormData(prev => ({
              ...prev,
              municipioFiscal: firstAddress?.municipio || prev?.municipioFiscal,
              ciudadFiscal: firstAddress?.ciudad || firstAddress?.municipio || prev?.ciudadFiscal,
              estadoFiscal: normalizeStateName(firstAddress?.estado) || prev?.estadoFiscal
            }));
          }
        } catch (err) {
          console.error('Error loading postal code:', err);
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

  const loadFiscalData = async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        ?.from('business_settings')
        ?.select('business_id, rfc, razon_social, regimen_fiscal, codigo_postal_fiscal, colonia, calle_numero, referencias')
        ?.eq('owner_id', user?.id)
        ?.single();
      if (!fetchError && data) {
        setBusinessId(data?.business_id);
        setFormData(prev => ({
          ...prev,
          rfc: data?.rfc || '',
          razonSocial: data?.razon_social || '',
          regimenFiscal: data?.regimen_fiscal || '',
          codigoPostalFiscal: data?.codigo_postal_fiscal || '',
          coloniaFiscal: data?.colonia || '',
          calleNumeroFiscal: data?.calle_numero || ''
        }));
      }
    } catch (err) {
      console.error('Error loading fiscal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    const rfcValidation = validateRFC(formData?.rfc);
    if (!rfcValidation?.valid) newErrors.rfc = rfcValidation?.message;
    if (personType === 'moral' && (!formData?.razonSocial || formData?.razonSocial?.length < 3)) {
      newErrors.razonSocial = 'La razón social debe tener al menos 3 caracteres';
    }
    if (personType === 'fisica' && !formData?.nombresContribuyente) {
      newErrors.nombresContribuyente = 'El nombre es obligatorio';
    }
    if (!formData?.regimenFiscal) newErrors.regimenFiscal = 'Selecciona un régimen fiscal SAT válido';
    if (!formData?.codigoPostalFiscal || !/^\d{5}$/?.test(formData?.codigoPostalFiscal)) {
      newErrors.codigoPostalFiscal = 'El código postal debe tener exactamente 5 dígitos';
    }
    if (!formData?.coloniaFiscal) newErrors.coloniaFiscal = 'La colonia es obligatoria';
    if (!formData?.calleNumeroFiscal) newErrors.calleNumeroFiscal = 'La calle es obligatoria';
    if (!formData?.numeroExteriorFiscal) newErrors.numeroExteriorFiscal = 'El número exterior es obligatorio';
    if (!formData?.municipioFiscal) newErrors.municipioFiscal = 'El municipio es obligatorio';
    if (!formData?.estadoFiscal) newErrors.estadoFiscal = 'El estado es obligatorio';
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
        rfc: formData?.rfc?.toUpperCase(),
        razon_social: formData?.razonSocial,
        regimen_fiscal: formData?.regimenFiscal,
        codigo_postal_fiscal: formData?.codigoPostalFiscal,
        colonia: formData?.coloniaFiscal,
        calle_numero: formData?.calleNumeroFiscal,
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
      console.error('Error saving fiscal data:', err);
      setError(err?.message || 'Error al guardar los datos fiscales');
    } finally {
      setSaving(false);
    }
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
        <h3 className="text-lg font-semibold text-foreground mb-1">Datos Fiscales</h3>
        <p className="text-sm text-muted-foreground">Información requerida para la emisión de CFDI</p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm flex items-center gap-2">
          <Icon name="AlertCircle" size={16} />{error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-center gap-2">
          <Icon name="CheckCircle" size={16} />Datos fiscales guardados exitosamente
        </div>
      )}

      {/* RFC */}
      <div className="space-y-4">
        <Input
          label="RFC"
          type="text"
          placeholder="ABC123456XYZ"
          value={formData?.rfc}
          onChange={(e) => setFormData({ ...formData, rfc: e?.target?.value?.toUpperCase() })}
          error={errors?.rfc}
          description="12 caracteres (Persona Moral) o 13 (Persona Física)"
          maxLength={13}
          required
        />
        {personType && (
          <div className={`p-4 rounded-lg border-2 ${
            personType === 'moral' ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center space-x-2">
              <Icon name={personType === 'moral' ? 'Building' : 'User'} size={20}
                className={personType === 'moral' ? 'text-purple-600' : 'text-blue-600'} />
              <p className={`text-sm font-semibold ${
                personType === 'moral' ? 'text-purple-900' : 'text-blue-900'
              }`}>
                Tipo de Persona: {getPersonTypeLabel(personType)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Persona Moral */}
      {personType === 'moral' && (
        <Input
          label="Razón Social"
          type="text"
          placeholder="Empresa S.A. de C.V."
          value={formData?.razonSocial}
          onChange={(e) => setFormData({ ...formData, razonSocial: e?.target?.value })}
          error={errors?.razonSocial}
          required
        />
      )}

      {/* Persona Física */}
      {personType === 'fisica' && (
        <div className="space-y-4">
          <Input
            label="Nombre(s)"
            type="text"
            placeholder="Juan"
            value={formData?.nombresContribuyente}
            onChange={(e) => setFormData({ ...formData, nombresContribuyente: e?.target?.value })}
            error={errors?.nombresContribuyente}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Apellido Paterno"
              type="text"
              placeholder="Pérez"
              value={formData?.apellidoPaternoContribuyente}
              onChange={(e) => setFormData({ ...formData, apellidoPaternoContribuyente: e?.target?.value })}
              error={errors?.apellidoPaternoContribuyente}
              required
            />
            <Input
              label="Apellido Materno"
              type="text"
              placeholder="García"
              value={formData?.apellidoMaternoContribuyente}
              onChange={(e) => setFormData({ ...formData, apellidoMaternoContribuyente: e?.target?.value })}
            />
          </div>
        </div>
      )}

      {/* Régimen Fiscal */}
      <Select
        label="Régimen Fiscal SAT"
        options={filteredRegimenFiscalOptions}
        value={formData?.regimenFiscal}
        onChange={(value) => setFormData({ ...formData, regimenFiscal: value })}
        placeholder="Selecciona tu régimen fiscal"
        error={errors?.regimenFiscal}
        searchable
        required
      />

      {/* Domicilio Fiscal */}
      <div className="border-t border-border pt-6">
        <h4 className="text-base font-semibold text-foreground mb-4 flex items-center">
          <Icon name="MapPin" size={18} className="mr-2 text-primary" />
          Domicilio Fiscal
        </h4>
        <div className="space-y-4">
          <Input
            label="Código Postal"
            type="text"
            placeholder="01000"
            value={formData?.codigoPostalFiscal}
            onChange={(e) => setFormData({ ...formData, codigoPostalFiscal: e?.target?.value?.replace(/\D/g, '') })}
            error={errors?.codigoPostalFiscal}
            description="Ingresa el CP para autocompletar estado, municipio y colonia"
            maxLength={5}
            required
          />
          {isLoadingPostalCode && (
            <div className="flex items-center space-x-2 text-sm text-primary">
              <div className="animate-spin"><Icon name="Loader" size={16} /></div>
              <span>Buscando información del código postal...</span>
            </div>
          )}
          {coloniaOptions?.length > 0 ? (
            <Select
              label="Colonia"
              options={coloniaOptions}
              value={formData?.coloniaFiscal}
              onChange={(value) => setFormData({ ...formData, coloniaFiscal: value })}
              placeholder="Selecciona tu colonia"
              error={errors?.coloniaFiscal}
              searchable
              required
            />
          ) : (
            <Input
              label="Colonia"
              type="text"
              placeholder="Centro"
              value={formData?.coloniaFiscal}
              onChange={(e) => setFormData({ ...formData, coloniaFiscal: e?.target?.value })}
              error={errors?.coloniaFiscal}
              required
            />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Calle"
              type="text"
              placeholder="Av. Reforma"
              value={formData?.calleNumeroFiscal}
              onChange={(e) => setFormData({ ...formData, calleNumeroFiscal: e?.target?.value })}
              error={errors?.calleNumeroFiscal}
              required
            />
            <Input
              label="Número Exterior"
              type="text"
              placeholder="123"
              value={formData?.numeroExteriorFiscal}
              onChange={(e) => setFormData({ ...formData, numeroExteriorFiscal: e?.target?.value })}
              error={errors?.numeroExteriorFiscal}
              required
            />
          </div>
          <Input
            label="Número Interior"
            type="text"
            placeholder="Depto. 4B (opcional)"
            value={formData?.numeroInteriorFiscal}
            onChange={(e) => setFormData({ ...formData, numeroInteriorFiscal: e?.target?.value })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Municipio/Delegación"
              type="text"
              placeholder="Miguel Hidalgo"
              value={formData?.municipioFiscal}
              onChange={(e) => setFormData({ ...formData, municipioFiscal: e?.target?.value })}
              error={errors?.municipioFiscal}
              required
              disabled={isLoadingPostalCode}
            />
            <Input
              label="Ciudad"
              type="text"
              placeholder="Ciudad de México"
              value={formData?.ciudadFiscal}
              onChange={(e) => setFormData({ ...formData, ciudadFiscal: e?.target?.value })}
              disabled={isLoadingPostalCode}
            />
          </div>
          <Input
            label="Estado"
            type="text"
            placeholder="Ciudad de México"
            value={formData?.estadoFiscal}
            onChange={(e) => setFormData({ ...formData, estadoFiscal: e?.target?.value })}
            error={errors?.estadoFiscal}
            required
            disabled={isLoadingPostalCode}
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Shield" size={18} className="text-blue-600 mt-0.5" />
          <p className="text-sm text-blue-800">
            Tus datos fiscales se utilizan únicamente para la emisión de CFDI y están protegidos conforme a la ley.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Guardando...</>
          ) : (
            <><Icon name="Save" size={16} className="mr-2" />Guardar Datos Fiscales</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default FiscalDataTab;
