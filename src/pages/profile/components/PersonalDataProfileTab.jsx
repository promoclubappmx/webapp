import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY;

const roleOptions = [
  { value: 'propietario', label: 'Propietario' },
  { value: 'socio', label: 'Socio' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'representante_legal', label: 'Representante Legal' },
  { value: 'encargado', label: 'Encargado' }
];

const PersonalDataProfileTab = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [tipoPersona, setTipoPersona] = useState(null);

  // Persona física fields
  const [formFisica, setFormFisica] = useState({
    curp: '',
    firstName: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    phone: '',
    roleInBusiness: '',
    email: '',
  });

  // Persona moral fields
  const [formMoral, setFormMoral] = useState({
    rfcMoral: '',
    razonSocialMoral: '',
    repCurp: '',
    repFirstName: '',
    repApellidoPaterno: '',
    repApellidoMaterno: '',
    phone: '',
    roleInBusiness: '',
    email: '',
  });

  // CURP validation states
  const [isCurpLoading, setIsCurpLoading] = useState(false);
  const [curpApiError, setCurpApiError] = useState('');
  const [curpValidated, setCurpValidated] = useState(false);
  const [isRepCurpLoading, setIsRepCurpLoading] = useState(false);
  const [repCurpApiError, setRepCurpApiError] = useState('');
  const [repCurpValidated, setRepCurpValidated] = useState(false);
  const [isRfcLoading, setIsRfcLoading] = useState(false);
  const [rfcApiError, setRfcApiError] = useState('');
  const [rfcValidated, setRfcValidated] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        ?.from('user_profiles')
        ?.select('tipo_persona, first_name, last_name, apellido_materno, curp, phone, role_in_business, email, rfc_moral, razon_social_moral, rep_curp, rep_first_name, rep_apellido_paterno, rep_apellido_materno')
        ?.eq('id', user?.id)
        ?.single();

      if (!fetchError && data) {
        setTipoPersona(data?.tipo_persona || null);
        if (data?.tipo_persona === 'fisica') {
          setFormFisica({
            curp: data?.curp || '',
            firstName: data?.first_name || '',
            apellidoPaterno: data?.last_name || '',
            apellidoMaterno: data?.apellido_materno || '',
            phone: data?.phone || '',
            roleInBusiness: data?.role_in_business || '',
            email: data?.email || user?.email || '',
          });
        } else if (data?.tipo_persona === 'moral') {
          setFormMoral({
            rfcMoral: data?.rfc_moral || '',
            razonSocialMoral: data?.razon_social_moral || '',
            repCurp: data?.rep_curp || '',
            repFirstName: data?.rep_first_name || '',
            repApellidoPaterno: data?.rep_apellido_paterno || '',
            repApellidoMaterno: data?.rep_apellido_materno || '',
            phone: data?.phone || '',
            roleInBusiness: data?.role_in_business || '',
            email: data?.email || user?.email || '',
          });
        } else {
          // No tipo_persona set yet, load basic fields
          setFormFisica(prev => ({
            ...prev,
            firstName: data?.first_name || '',
            apellidoPaterno: data?.last_name || '',
            apellidoMaterno: data?.apellido_materno || '',
            curp: data?.curp || '',
            phone: data?.phone || '',
            roleInBusiness: data?.role_in_business || '',
            email: data?.email || user?.email || '',
          }));
        }
      }
    } catch (err) {
      console.error('Error loading personal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateCurpFormat = (curp) => {
    const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/;
    return curp?.length === 18 && curpRegex?.test(curp);
  };

  const callNubariumCurp = async (curp) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller?.abort(), 15000);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/nubarium-proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ action: 'validate_curp', curp }),
        signal: controller?.signal
      });
      if (!response?.ok) throw new Error(`Error del servidor: ${response.status}`);
      return response?.json();
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const handleValidateCurp = async () => {
    const curp = formFisica?.curp;
    if (!curp || !validateCurpFormat(curp)) return;
    setIsCurpLoading(true);
    setCurpApiError('');
    try {
      const data = await callNubariumCurp(curp);
      if (data?.estatus === 'OK') {
        setFormFisica(prev => ({ ...prev, firstName: data?.nombre || prev?.firstName, apellidoPaterno: data?.apellidoPaterno || prev?.apellidoPaterno, apellidoMaterno: data?.apellidoMaterno || prev?.apellidoMaterno }));
        setCurpValidated(true);
      } else {
        setCurpApiError('CURP no encontrada. Puedes editar los datos manualmente.');
      }
    } catch (err) {
      setCurpApiError('No se pudo validar la CURP. Puedes editar los datos manualmente.');
    } finally {
      setIsCurpLoading(false);
    }
  };

  const handleValidateRepCurp = async () => {
    const curp = formMoral?.repCurp;
    if (!curp || !validateCurpFormat(curp)) return;
    setIsRepCurpLoading(true);
    setRepCurpApiError('');
    try {
      const data = await callNubariumCurp(curp);
      if (data?.estatus === 'OK') {
        setFormMoral(prev => ({ ...prev, repFirstName: data?.nombre || prev?.repFirstName, repApellidoPaterno: data?.apellidoPaterno || prev?.repApellidoPaterno, repApellidoMaterno: data?.apellidoMaterno || prev?.repApellidoMaterno }));
        setRepCurpValidated(true);
      } else {
        setRepCurpApiError('CURP no encontrada. Puedes editar los datos manualmente.');
      }
    } catch (err) {
      setRepCurpApiError('No se pudo validar la CURP. Puedes editar los datos manualmente.');
    } finally {
      setIsRepCurpLoading(false);
    }
  };

  const handleValidateRfc = async () => {
    const rfc = formMoral?.rfcMoral;
    if (!rfc || rfc?.length < 12) return;
    setIsRfcLoading(true);
    setRfcApiError('');
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/nubarium-proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ action: 'validate_rfc', rfc })
      });
      const data = await response?.json();
      if (data?.estatus === 'OK' && data?.nombre) {
        setFormMoral(prev => ({ ...prev, razonSocialMoral: data?.nombre }));
        setRfcValidated(true);
      } else {
        setRfcApiError('RFC no encontrado en el SAT. Puedes editar la razón social manualmente.');
      }
    } catch (err) {
      setRfcApiError('No se pudo validar el RFC. Puedes editar los datos manualmente.');
    } finally {
      setIsRfcLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (tipoPersona === 'fisica') {
      if (!formFisica?.firstName || formFisica?.firstName?.length < 2) newErrors.firstName = 'El nombre debe tener al menos 2 caracteres';
      if (!formFisica?.apellidoPaterno || formFisica?.apellidoPaterno?.length < 2) newErrors.apellidoPaterno = 'El apellido paterno es obligatorio';
      if (formFisica?.curp && !validateCurpFormat(formFisica?.curp)) newErrors.curp = 'Formato de CURP inválido (18 caracteres)';
    } else if (tipoPersona === 'moral') {
      if (!formMoral?.rfcMoral || formMoral?.rfcMoral?.length < 12) newErrors.rfcMoral = 'El RFC debe tener 12 caracteres';
      if (!formMoral?.razonSocialMoral) newErrors.razonSocialMoral = 'La razón social es obligatoria';
      if (!formMoral?.repFirstName) newErrors.repFirstName = 'El nombre del representante es obligatorio';
      if (!formMoral?.repApellidoPaterno) newErrors.repApellidoPaterno = 'El apellido paterno del representante es obligatorio';
    }
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      let updateData = {};
      if (tipoPersona === 'fisica') {
        updateData = {
          tipo_persona: 'fisica',
          first_name: formFisica?.firstName,
          last_name: formFisica?.apellidoPaterno,
          apellido_materno: formFisica?.apellidoMaterno,
          full_name: `${formFisica?.firstName} ${formFisica?.apellidoPaterno} ${formFisica?.apellidoMaterno}`?.trim(),
          curp: formFisica?.curp?.toUpperCase(),
          phone: formFisica?.phone,
          role_in_business: formFisica?.roleInBusiness,
          updated_at: new Date()?.toISOString()
        };
      } else if (tipoPersona === 'moral') {
        updateData = {
          tipo_persona: 'moral',
          rfc_moral: formMoral?.rfcMoral?.toUpperCase(),
          razon_social_moral: formMoral?.razonSocialMoral,
          rep_curp: formMoral?.repCurp?.toUpperCase(),
          rep_first_name: formMoral?.repFirstName,
          rep_apellido_paterno: formMoral?.repApellidoPaterno,
          rep_apellido_materno: formMoral?.repApellidoMaterno,
          full_name: `${formMoral?.repFirstName} ${formMoral?.repApellidoPaterno} ${formMoral?.repApellidoMaterno}`?.trim(),
          phone: formMoral?.phone,
          role_in_business: formMoral?.roleInBusiness,
          updated_at: new Date()?.toISOString()
        };
      }
      const { error: updateError } = await supabase?.from('user_profiles')?.update(updateData)?.eq('id', user?.id);
      if (updateError) throw updateError;
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving personal data:', err);
      setError(err?.message || 'Error al guardar los datos');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    setError(null);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Datos Personales</h3>
          <p className="text-sm text-muted-foreground mt-1">Información del propietario o representante del negocio</p>
        </div>
      </div>

      {/* Tipo de persona badge */}
      {tipoPersona && (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${tipoPersona === 'fisica' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
          <Icon name={tipoPersona === 'fisica' ? 'User' : 'Building2'} size={15} />
          {tipoPersona === 'fisica' ? 'Persona Física' : 'Persona Moral'}
        </div>
      )}

      {!tipoPersona && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <Icon name="AlertCircle" size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Tipo de persona no definido</p>
            <p className="text-xs text-amber-700 mt-1">El tipo de persona se establece durante el registro. Contacta a soporte si necesitas actualizarlo.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm flex items-center gap-2">
          <Icon name="AlertCircle" size={16} />
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-center gap-2">
          <Icon name="CheckCircle" size={16} />
          Datos personales guardados exitosamente
        </div>
      )}

      {/* ── PERSONA FÍSICA ── */}
      {(tipoPersona === 'fisica' || !tipoPersona) && (
        <div className="space-y-5">
          <div className={`p-5 rounded-xl border space-y-4 ${tipoPersona === 'fisica' ? 'bg-blue-50/50 border-blue-200' : 'bg-muted/30 border-border'}`}>
            {tipoPersona === 'fisica' && (
              <h4 className="font-semibold text-blue-900 flex items-center gap-2 text-sm">
                <Icon name="User" size={15} className="text-blue-600" />
                Datos de Persona Física
              </h4>
            )}

            {/* CURP row */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label="CURP"
                  type="text"
                  value={formFisica?.curp || ''}
                  onChange={(e) => setFormFisica(prev => ({ ...prev, curp: e?.target?.value?.toUpperCase() }))}
                  disabled={!isEditing}
                  error={errors?.curp}
                  description="18 caracteres en mayúsculas"
                  maxLength={18}
                />
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleValidateCurp}
                  disabled={isCurpLoading || !formFisica?.curp || formFisica?.curp?.length !== 18}
                  className="mb-0.5 px-3 py-2 text-sm font-semibold rounded-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1.5"
                >
                  {isCurpLoading ? <><div className="animate-spin"><Icon name="Loader" size={14} /></div> Validando…</> : <><Icon name="ShieldCheck" size={14} /> Validar</>}
                </button>
              )}
            </div>
            {curpApiError && <p className="text-sm text-amber-600 flex items-center gap-1"><Icon name="AlertCircle" size={14} />{curpApiError}</p>}
            {curpValidated && !curpApiError && <p className="text-sm text-green-600 flex items-center gap-1"><Icon name="CheckCircle" size={14} />Datos precargados desde RENAPO</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre(s)"
                type="text"
                value={formFisica?.firstName || ''}
                onChange={(e) => setFormFisica(prev => ({ ...prev, firstName: e?.target?.value }))}
                disabled={!isEditing}
                error={errors?.firstName}
                required
              />
              <Input
                label="Apellido Paterno"
                type="text"
                value={formFisica?.apellidoPaterno || ''}
                onChange={(e) => setFormFisica(prev => ({ ...prev, apellidoPaterno: e?.target?.value }))}
                disabled={!isEditing}
                error={errors?.apellidoPaterno}
                required
              />
              <Input
                label="Apellido Materno"
                type="text"
                value={formFisica?.apellidoMaterno || ''}
                onChange={(e) => setFormFisica(prev => ({ ...prev, apellidoMaterno: e?.target?.value }))}
                disabled={!isEditing}
                description="Opcional"
              />
              <Input
                label="Teléfono"
                type="tel"
                value={formFisica?.phone || ''}
                onChange={(e) => setFormFisica(prev => ({ ...prev, phone: e?.target?.value }))}
                disabled={!isEditing}
                description="Formato: +52 seguido de 10 dígitos"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Correo Electrónico</label>
              <Input type="email" value={formFisica?.email || user?.email || ''} disabled className="opacity-70" />
              <p className="text-xs text-muted-foreground mt-1">El correo no puede modificarse desde aquí</p>
            </div>

            <Select
              label="Rol en el negocio"
              options={roleOptions}
              value={formFisica?.roleInBusiness}
              onChange={(value) => setFormFisica(prev => ({ ...prev, roleInBusiness: value }))}
              placeholder="Selecciona tu rol"
              disabled={!isEditing}
              error={errors?.roleInBusiness}
            />
          </div>
        </div>
      )}

      {/* ── PERSONA MORAL ── */}
      {tipoPersona === 'moral' && (
        <div className="space-y-5">
          <div className="p-5 rounded-xl border bg-purple-50/50 border-purple-200 space-y-4">
            <h4 className="font-semibold text-purple-900 flex items-center gap-2 text-sm">
              <Icon name="Building2" size={15} className="text-purple-600" />
              Datos de la Empresa
            </h4>

            {/* RFC row */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label="RFC de la Empresa"
                  type="text"
                  value={formMoral?.rfcMoral || ''}
                  onChange={(e) => setFormMoral(prev => ({ ...prev, rfcMoral: e?.target?.value?.toUpperCase() }))}
                  disabled={!isEditing}
                  error={errors?.rfcMoral}
                  description="12 caracteres para persona moral"
                  maxLength={12}
                  required
                />
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleValidateRfc}
                  disabled={isRfcLoading || !formMoral?.rfcMoral || formMoral?.rfcMoral?.length < 12}
                  className="mb-0.5 px-3 py-2 text-sm font-semibold rounded-lg border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1.5"
                >
                  {isRfcLoading ? <><div className="animate-spin"><Icon name="Loader" size={14} /></div> Validando…</> : <><Icon name="ShieldCheck" size={14} /> Validar</>}
                </button>
              )}
            </div>
            {rfcApiError && <p className="text-sm text-amber-600 flex items-center gap-1"><Icon name="AlertCircle" size={14} />{rfcApiError}</p>}
            {rfcValidated && !rfcApiError && <p className="text-sm text-green-600 flex items-center gap-1"><Icon name="CheckCircle" size={14} />RFC validado ante el SAT</p>}

            <Input
              label="Razón Social"
              type="text"
              value={formMoral?.razonSocialMoral || ''}
              onChange={(e) => setFormMoral(prev => ({ ...prev, razonSocialMoral: e?.target?.value }))}
              disabled={!isEditing}
              error={errors?.razonSocialMoral}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Teléfono"
                type="tel"
                value={formMoral?.phone || ''}
                onChange={(e) => setFormMoral(prev => ({ ...prev, phone: e?.target?.value }))}
                disabled={!isEditing}
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Correo Electrónico</label>
                <Input type="email" value={formMoral?.email || user?.email || ''} disabled className="opacity-70" />
              </div>
            </div>

            <Select
              label="Rol en el negocio"
              options={roleOptions}
              value={formMoral?.roleInBusiness}
              onChange={(value) => setFormMoral(prev => ({ ...prev, roleInBusiness: value }))}
              placeholder="Selecciona tu rol"
              disabled={!isEditing}
            />
          </div>

          {/* Representante Legal */}
          <div className="p-5 rounded-xl border bg-purple-50/30 border-purple-200 space-y-4">
            <h4 className="font-semibold text-purple-900 flex items-center gap-2 text-sm">
              <Icon name="UserCheck" size={15} className="text-purple-600" />
              Representante Legal
            </h4>

            {/* Rep CURP row */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label="CURP del Representante Legal"
                  type="text"
                  value={formMoral?.repCurp || ''}
                  onChange={(e) => setFormMoral(prev => ({ ...prev, repCurp: e?.target?.value?.toUpperCase() }))}
                  disabled={!isEditing}
                  error={errors?.repCurp}
                  description="18 caracteres en mayúsculas"
                  maxLength={18}
                />
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleValidateRepCurp}
                  disabled={isRepCurpLoading || !formMoral?.repCurp || formMoral?.repCurp?.length !== 18}
                  className="mb-0.5 px-3 py-2 text-sm font-semibold rounded-lg border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1.5"
                >
                  {isRepCurpLoading ? <><div className="animate-spin"><Icon name="Loader" size={14} /></div> Validando…</> : <><Icon name="ShieldCheck" size={14} /> Validar</>}
                </button>
              )}
            </div>
            {repCurpApiError && <p className="text-sm text-amber-600 flex items-center gap-1"><Icon name="AlertCircle" size={14} />{repCurpApiError}</p>}
            {repCurpValidated && !repCurpApiError && <p className="text-sm text-green-600 flex items-center gap-1"><Icon name="CheckCircle" size={14} />Datos precargados desde RENAPO</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre(s) del Representante"
                type="text"
                value={formMoral?.repFirstName || ''}
                onChange={(e) => setFormMoral(prev => ({ ...prev, repFirstName: e?.target?.value }))}
                disabled={!isEditing}
                error={errors?.repFirstName}
                required
              />
              <Input
                label="Apellido Paterno"
                type="text"
                value={formMoral?.repApellidoPaterno || ''}
                onChange={(e) => setFormMoral(prev => ({ ...prev, repApellidoPaterno: e?.target?.value }))}
                disabled={!isEditing}
                error={errors?.repApellidoPaterno}
                required
              />
              <Input
                label="Apellido Materno"
                type="text"
                value={formMoral?.repApellidoMaterno || ''}
                onChange={(e) => setFormMoral(prev => ({ ...prev, repApellidoMaterno: e?.target?.value }))}
                disabled={!isEditing}
                description="Opcional"
              />
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="flex space-x-4 pt-4 border-t border-border">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Guardando...</>
            ) : (
              <><Icon name="Save" size={16} className="mr-2" />Guardar Datos Personales</>
            )}
          </Button>
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            <Icon name="X" size={16} className="mr-2" />
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
};

export default PersonalDataProfileTab;
