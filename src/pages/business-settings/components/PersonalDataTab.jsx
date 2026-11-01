import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const PersonalDataTab = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    curp: '',
    roleInBusiness: ''
  });

  const roleOptions = [
    { value: 'propietario', label: 'Propietario' },
    { value: 'socio', label: 'Socio' },
    { value: 'gerente', label: 'Gerente' },
    { value: 'representante_legal', label: 'Representante Legal' },
    { value: 'encargado', label: 'Encargado' }
  ];

  useEffect(() => {
    loadPersonalData();
  }, [user]);

  const loadPersonalData = async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        ?.from('user_profiles')
        ?.select('first_name, last_name, phone, curp, role_in_business')
        ?.eq('id', user?.id)
        ?.single();
      if (!fetchError && data) {
        setFormData({
          firstName: data?.first_name || '',
          lastName: data?.last_name || '',
          phone: data?.phone || '',
          curp: data?.curp || '',
          roleInBusiness: data?.role_in_business || ''
        });
      }
    } catch (err) {
      console.error('Error loading personal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData?.firstName || formData?.firstName?.length < 2) newErrors.firstName = 'El nombre debe tener al menos 2 caracteres';
    if (!formData?.lastName || formData?.lastName?.length < 2) newErrors.lastName = 'Los apellidos deben tener al menos 2 caracteres';
    if (formData?.phone) {
      const cleanPhone = formData?.phone?.replace(/\s/g, '');
      if (!/^\+52\d{10}$/?.test(cleanPhone)) newErrors.phone = 'Formato inválido. Debe ser +52 seguido de 10 dígitos';
    }
    if (formData?.curp) {
      const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/;
      if (formData?.curp?.length !== 18) newErrors.curp = 'El CURP debe tener exactamente 18 caracteres';
      else if (!curpRegex?.test(formData?.curp)) newErrors.curp = 'Formato de CURP inválido';
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
      const { error: updateError } = await supabase
        ?.from('user_profiles')
        ?.update({
          first_name: formData?.firstName,
          last_name: formData?.lastName,
          full_name: `${formData?.firstName} ${formData?.lastName}`?.trim(),
          phone: formData?.phone,
          curp: formData?.curp?.toUpperCase(),
          role_in_business: formData?.roleInBusiness,
          updated_at: new Date()?.toISOString()
        })
        ?.eq('id', user?.id);
      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving personal data:', err);
      setError(err?.message || 'Error al guardar los datos');
    } finally {
      setSaving(false);
    }
  };

  const handlePhoneChange = (value) => {
    let formatted = value?.replace(/[^\d+]/g, '');
    if (!formatted?.startsWith('+52')) {
      formatted = '+52' + formatted?.replace(/^\+?52?/, '');
    }
    setFormData({ ...formData, phone: formatted });
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
        <h3 className="text-lg font-semibold text-foreground mb-1">Datos Personales</h3>
        <p className="text-sm text-muted-foreground">Información del propietario o representante del negocio</p>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nombre(s)"
          type="text"
          placeholder="Juan"
          value={formData?.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e?.target?.value })}
          error={errors?.firstName}
          required
        />
        <Input
          label="Apellidos"
          type="text"
          placeholder="Pérez García"
          value={formData?.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e?.target?.value })}
          error={errors?.lastName}
          required
        />
      </div>

      <Input
        label="Teléfono celular"
        type="tel"
        placeholder="+52 55 1234 5678"
        value={formData?.phone}
        onChange={(e) => handlePhoneChange(e?.target?.value)}
        error={errors?.phone}
        description="Formato: +52 seguido de 10 dígitos"
      />

      <Input
        label="CURP"
        type="text"
        placeholder="ABCD123456HDFRNN09"
        value={formData?.curp}
        onChange={(e) => setFormData({ ...formData, curp: e?.target?.value?.toUpperCase() })}
        error={errors?.curp}
        description="18 caracteres en mayúsculas"
        maxLength={18}
      />

      <Select
        label="Rol en el negocio"
        options={roleOptions}
        value={formData?.roleInBusiness}
        onChange={(value) => setFormData({ ...formData, roleInBusiness: value })}
        placeholder="Selecciona tu rol"
        error={errors?.roleInBusiness}
      />

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Guardando...</>
          ) : (
            <><Icon name="Save" size={16} className="mr-2" />Guardar Datos Personales</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PersonalDataTab;
