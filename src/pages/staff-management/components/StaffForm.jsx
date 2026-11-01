import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const CURP_REGEX = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9]{2}$/;

const StaffForm = ({ staff, onSave, onClose }) => {
  const { user: authUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: staff?.firstName || staff?.first_name || '',
    paternalSurname: staff?.paternalSurname || staff?.paternal_surname || '',
    maternalSurname: staff?.maternalSurname || staff?.maternal_surname || '',
    curp: staff?.curp || '',
    email: staff?.email || '',
    employeeId: staff?.employeeId || staff?.employee_id || '',
    staffRole: staff?.staffRole || staff?.staff_role || 'cashier',
    departmentId: staff?.departmentId || staff?.department_id || '',
    locationId: staff?.locationId || staff?.location_id || '',
    notes: staff?.notes || '',
    sendInvitation: !staff,
    photoFile: null,
    photoPreview: staff?.photoUrl || staff?.photo_url || null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [customRoles, setCustomRoles] = useState([]);

  useEffect(() => {
    fetchDepartments();
    fetchLocations();
    fetchRoles();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data } = await supabase
        ?.from('departments')
        ?.select('id, name')
        ?.eq('owner_id', authUser?.id)
        ?.eq('is_active', true)
        ?.order('name');
      setDepartments(data || []);
    } catch (e) {
      console.error('Error fetching departments:', e);
    }
  };

  const fetchLocations = async () => {
    try {
      const { data } = await supabase
        ?.from('business_locations')
        ?.select('id, name')
        ?.eq('user_id', authUser?.id)
        ?.order('name');
      setLocations(data || []);
    } catch (e) {
      console.error('Error fetching locations:', e);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data } = await supabase
        ?.from('custom_roles')
        ?.select('id, name, role_key')
        ?.eq('owner_id', authUser?.id)
        ?.eq('is_active', true)
        ?.order('name');
      setCustomRoles(data || []);
    } catch (e) {
      console.error('Error fetching roles:', e);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handlePhotoChange = (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    if (file?.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, photo: 'La imagen no debe superar 5MB' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData(prev => ({ ...prev, photoFile: file, photoPreview: ev?.target?.result }));
    };
    reader?.readAsDataURL(file);
    setErrors(prev => ({ ...prev, photo: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData?.firstName?.trim()) newErrors.firstName = 'El nombre es requerido';
    if (!formData?.paternalSurname?.trim()) newErrors.paternalSurname = 'El apellido paterno es requerido';
    if (!formData?.email?.trim()) newErrors.email = 'El email es requerido';
    if (!formData?.employeeId?.trim()) newErrors.employeeId = 'El ID de empleado es requerido';
    if (!formData?.staffRole) newErrors.staffRole = 'El rol es requerido';
    if (!formData?.locationId) newErrors.locationId = 'El establecimiento es requerido';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData?.email && !emailRegex?.test(formData?.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    if (formData?.curp) {
      const curpUpper = formData?.curp?.toUpperCase();
      if (curpUpper?.length !== 18) {
        newErrors.curp = 'La CURP debe tener exactamente 18 caracteres';
      } else if (!CURP_REGEX?.test(curpUpper)) {
        newErrors.curp = 'Formato de CURP inválido';
      }
    }

    return newErrors;
  };

  const uploadPhoto = async (file) => {
    if (!file) return null;
    const ext = file?.name?.split('.')?.pop();
    const path = `staff-photos/${authUser?.id}/${Date.now()}.${ext}`;
    const { data, error } = await supabase?.storage
      ?.from('staff-documents')
      ?.upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase?.storage?.from('staff-documents')?.getPublicUrl(path);
    return urlData?.publicUrl || null;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors)?.length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      let photoUrl = formData?.photoPreview && !formData?.photoFile ? formData?.photoPreview : null;
      if (formData?.photoFile) {
        photoUrl = await uploadPhoto(formData?.photoFile);
      }

      const fullName = [formData?.firstName, formData?.paternalSurname, formData?.maternalSurname]?.filter(Boolean)?.join(' ');

      await onSave({
        ...formData,
        fullName,
        photoUrl,
        curp: formData?.curp?.toUpperCase() || null,
      });
    } catch (error) {
      console.error('Error saving staff:', error);
      setErrors({ submit: error?.message || 'Error al guardar el personal' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            {staff ? 'Editar Personal' : 'Agregar Personal'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground" disabled={loading}>
            <Icon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Photo Upload */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-muted border-2 border-border overflow-hidden flex items-center justify-center">
                {formData?.photoPreview ? (
                  <img src={formData?.photoPreview} alt="Foto del empleado" className="w-full h-full object-cover" />
                ) : (
                  <Icon name="User" size={32} className="text-muted-foreground" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80">
                <Icon name="Camera" size={12} className="text-primary-foreground" />
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" disabled={loading} />
              </label>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Foto del empleado</p>
              <p className="text-xs text-muted-foreground">JPG, PNG hasta 5MB</p>
              {errors?.photo && <p className="text-xs text-red-500 mt-1">{errors?.photo}</p>}
            </div>
          </div>

          {/* Name fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Nombre(s)"
              value={formData?.firstName}
              onChange={(e) => handleChange('firstName', e?.target?.value)}
              error={errors?.firstName}
              required
              disabled={loading}
            />
            <Input
              label="Apellido Paterno"
              value={formData?.paternalSurname}
              onChange={(e) => handleChange('paternalSurname', e?.target?.value)}
              error={errors?.paternalSurname}
              required
              disabled={loading}
            />
            <Input
              label="Apellido Materno"
              value={formData?.maternalSurname}
              onChange={(e) => handleChange('maternalSurname', e?.target?.value)}
              disabled={loading}
            />
          </div>

          {/* CURP */}
          <div>
            <Input
              label="CURP (18 dígitos)"
              value={formData?.curp}
              onChange={(e) => handleChange('curp', e?.target?.value?.toUpperCase())}
              error={errors?.curp}
              maxLength={18}
              placeholder="AAAA000000HAAAAA00"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData?.curp?.length || 0}/18 caracteres
            </p>
          </div>

          {/* Email & Employee ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Email"
                type="email"
                value={formData?.email}
                onChange={(e) => handleChange('email', e?.target?.value)}
                error={errors?.email}
                required
                disabled={loading || !!staff}
              />
              {staff && (
                <p className="text-xs text-muted-foreground mt-1">El email no puede ser modificado</p>
              )}
            </div>
            <Input
              label="ID Empleado"
              value={formData?.employeeId}
              onChange={(e) => handleChange('employeeId', e?.target?.value)}
              error={errors?.employeeId}
              required
              disabled={loading}
            />
          </div>

          {/* Role & Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Rol <span className="text-red-500">*</span>
              </label>
              <select
                value={formData?.staffRole}
                onChange={(e) => handleChange('staffRole', e?.target?.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={loading}
              >
                {customRoles?.length > 0 ? (
                  customRoles?.map(r => (
                    <option key={r?.id} value={r?.role_key}>{r?.name}</option>
                  ))
                ) : (
                  <>
                    <option value="admin">Administrador</option>
                    <option value="manager">Gerente</option>
                    <option value="cashier">Cajero</option>
                  </>
                )}
              </select>
              {errors?.staffRole && <p className="text-sm text-red-500 mt-1">{errors?.staffRole}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Departamento
              </label>
              <select
                value={formData?.departmentId}
                onChange={(e) => handleChange('departmentId', e?.target?.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={loading}
              >
                <option value="">Sin departamento</option>
                {departments?.map(d => (
                  <option key={d?.id} value={d?.id}>{d?.name}</option>
                ))}
              </select>
              {departments?.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">Crea departamentos en la sección Organigrama</p>
              )}
            </div>
          </div>

          {/* Establishment - always visible */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Establecimiento <span className="text-red-500">*</span>
            </label>
            <select
              value={formData?.locationId}
              onChange={(e) => handleChange('locationId', e?.target?.value)}
              className={`w-full px-4 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors?.locationId ? 'border-red-500' : 'border-border'}`}
              disabled={loading}
            >
              <option value="">Seleccionar establecimiento...</option>
              {locations?.map(l => (
                <option key={l?.id} value={l?.id}>{l?.name}</option>
              ))}
            </select>
            {errors?.locationId && <p className="text-sm text-red-500 mt-1">{errors?.locationId}</p>}
            {locations?.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">No hay establecimientos registrados</p>
            )}
          </div>

          {/* Invitation checkbox for new staff */}
          {!staff && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="sendInvitation"
                  checked={formData?.sendInvitation}
                  onChange={(e) => handleChange('sendInvitation', e?.target?.checked)}
                  className="mt-1"
                  disabled={loading}
                />
                <div>
                  <label htmlFor="sendInvitation" className="text-sm font-medium text-foreground cursor-pointer">
                    Enviar invitación por correo electrónico
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    El empleado recibirá un enlace para confirmar su cuenta.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Notas</label>
            <textarea
              value={formData?.notes}
              onChange={(e) => handleChange('notes', e?.target?.value)}
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Notas adicionales..."
              disabled={loading}
            />
          </div>

          {errors?.submit && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{errors?.submit}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} type="button" disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : (staff ? 'Actualizar' : 'Agregar')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffForm;