import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import StaffTable from './StaffTable';
import StaffForm from './StaffForm';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const PersonalSection = () => {
  const { user: authUser, userProfile } = useAuth();
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [locations, setLocations] = useState([]);
  const [customRoles, setCustomRoles] = useState([]);
  const [notification, setNotification] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchLocations = async () => {
    if (!authUser?.id) return;
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
    if (!authUser?.id) return;
    try {
      const { data } = await supabase
        ?.from('custom_roles')
        ?.select('id, name, role_key')
        ?.eq('owner_id', authUser?.id)
        ?.eq('is_active', true);
      setCustomRoles(data || []);
    } catch (e) {
      console.error('Error fetching roles:', e);
    }
  };

  const fetchStaff = async () => {
    if (!authUser?.id) return;
    try {
      setLoading(true);
      let query = supabase
        ?.from('staff_members')
        ?.select('*')
        ?.or(`owner_id.eq.${authUser?.id},created_by.eq.${authUser?.id}`)
        ?.order('created_at', { ascending: false });

      if (selectedLocation !== 'all') {
        query = query?.eq('location_id', selectedLocation);
      }

      const { data, error } = await query;
      if (error) throw error;

      const formatted = data?.map(s => ({
        id: s?.id,
        firstName: s?.first_name,
        paternalSurname: s?.paternal_surname,
        maternalSurname: s?.maternal_surname,
        fullName: s?.full_name || [s?.first_name, s?.paternal_surname, s?.maternal_surname]?.filter(Boolean)?.join(' '),
        email: s?.email,
        phone: s?.phone,
        employeeId: s?.employee_id,
        staffRole: s?.staff_role,
        departmentId: s?.department_id,
        locationId: s?.location_id,
        photoUrl: s?.photo_url,
        curp: s?.curp,
        isActive: s?.is_active,
        status: s?.status || 'pending',
        emailConfirmed: s?.email_confirmed,
        authUserId: s?.auth_user_id,
        invitationSentAt: s?.invitation_sent_at,
        confirmedAt: s?.confirmed_at,
        notes: s?.notes,
        createdAt: s?.created_at,
      })) || [];

      setStaffMembers(formatted);
    } catch (e) {
      console.error('Error fetching staff:', e);
      showNotif('Error al cargar el personal', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchRoles();
  }, []);

  useEffect(() => { fetchStaff(); }, [refreshTrigger, selectedLocation]);

  const handleSaveStaff = async (staffData) => {
    try {
      if (editingStaff) {
        const { error } = await supabase?.from('staff_members')?.update({
          first_name: staffData?.firstName,
          paternal_surname: staffData?.paternalSurname,
          maternal_surname: staffData?.maternalSurname,
          full_name: staffData?.fullName,
          curp: staffData?.curp,
          phone: staffData?.phone,
          employee_id: staffData?.employeeId,
          staff_role: staffData?.staffRole,
          department_id: staffData?.departmentId || null,
          location_id: staffData?.locationId || null,
          photo_url: staffData?.photoUrl,
          notes: staffData?.notes,
          updated_at: new Date()?.toISOString(),
        })?.eq('id', editingStaff?.id);
        if (error) throw error;
        showNotif('Personal actualizado exitosamente');
      } else {
        // Generate invitation token (stand-by for email implementation)
        const invitationToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))?.map(b => b?.toString(16)?.padStart(2, '0'))?.join('');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)?.toISOString();

        const { error } = await supabase?.from('staff_members')?.insert({
          owner_id: authUser?.id,
          created_by: authUser?.id,
          first_name: staffData?.firstName,
          paternal_surname: staffData?.paternalSurname,
          maternal_surname: staffData?.maternalSurname,
          full_name: staffData?.fullName,
          curp: staffData?.curp,
          email: staffData?.email,
          phone: staffData?.phone,
          employee_id: staffData?.employeeId,
          staff_role: staffData?.staffRole,
          department_id: staffData?.departmentId || null,
          location_id: staffData?.locationId || null,
          photo_url: staffData?.photoUrl,
          notes: staffData?.notes,
          is_active: false,
          email_confirmed: false,
          status: 'pending',
          invitation_token: invitationToken,
          invitation_sent_at: new Date()?.toISOString(),
          invitation_expires_at: expiresAt,
          business_id: userProfile?.business_name || 'default',
        });
        if (error) throw error;
        showNotif('Personal agregado. Estado: Pendiente de confirmación. El envío de email se activará próximamente.');
      }
      setShowForm(false);
      setEditingStaff(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (e) {
      throw e;
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este miembro del personal?')) return;
    try {
      const { error } = await supabase?.from('staff_members')?.delete()?.eq('id', id);
      if (error) throw error;
      showNotif('Personal eliminado');
      setRefreshTrigger(prev => prev + 1);
    } catch (e) {
      showNotif(e?.message, 'error');
    }
  };

  const handleResendInvitation = async (staffId) => {
    // Stand-by: email not yet configured
    // Token is already generated on creation; this prepares it for when email is ready
    try {
      const newToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))?.map(b => b?.toString(16)?.padStart(2, '0'))?.join('');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)?.toISOString();

      const { error } = await supabase?.from('staff_members')?.update({
        invitation_token: newToken,
        invitation_sent_at: new Date()?.toISOString(),
        invitation_expires_at: expiresAt,
        updated_at: new Date()?.toISOString(),
      })?.eq('id', staffId);

      if (error) throw error;
      showNotif('Token de invitación renovado. El envío de email se activará cuando se configure el servicio de correo.');
    } catch (e) {
      showNotif('Error al renovar el token', 'error');
    }
  };

  const filteredStaff = staffMembers?.filter(s => {
    const matchesSearch = !searchTerm ||
      s?.fullName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      s?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      s?.employeeId?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesRole = filterRole === 'all' || s?.staffRole === filterRole;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && s?.status === 'active') ||
      (filterStatus === 'inactive' && (s?.status === 'inactive' || s?.status === 'pending'));
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = [
    { label: 'Total', value: staffMembers?.length, icon: 'Users', color: 'text-blue-600' },
    { label: 'Activos', value: staffMembers?.filter(s => s?.status === 'active')?.length, icon: 'UserCheck', color: 'text-green-600' },
    { label: 'Pendientes', value: staffMembers?.filter(s => s?.status === 'pending')?.length, icon: 'Clock', color: 'text-amber-600' },
    { label: 'Con cuenta', value: staffMembers?.filter(s => s?.authUserId)?.length, icon: 'ShieldCheck', color: 'text-indigo-600' },
  ];

  return (
    <div className="space-y-6">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          notification?.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {notification?.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Personal</h2>
          <p className="text-sm text-muted-foreground mt-1">Gestiona los miembros de tu equipo</p>
        </div>
        <Button onClick={() => { setEditingStaff(null); setShowForm(true); }} iconName="UserPlus">
          Agregar Personal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats?.map(stat => (
          <div key={stat?.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
              <Icon name={stat?.icon} size={20} className={stat?.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat?.value}</p>
              <p className="text-xs text-muted-foreground">{stat?.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <Input placeholder="Buscar personal..." value={searchTerm} onChange={e => setSearchTerm(e?.target?.value)} iconName="Search" />
        </div>
        {/* Establishment filter */}
        <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-background">
          <Icon name="Building2" size={16} className="text-muted-foreground" />
          <select value={selectedLocation} onChange={e => setSelectedLocation(e?.target?.value)}
            className="bg-transparent text-foreground text-sm focus:outline-none">
            <option value="all">Todos los establecimientos</option>
            {locations?.map(l => (
              <option key={l?.id} value={l?.id}>{l?.name}</option>
            ))}
          </select>
        </div>
        {/* Status filter */}
        <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-background">
          <Icon name="Filter" size={16} className="text-muted-foreground" />
          <select value={filterStatus} onChange={e => setFilterStatus(e?.target?.value)}
            className="bg-transparent text-foreground text-sm focus:outline-none">
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="pending">Pendientes de confirmación</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
        {/* Role filter */}
        <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-background">
          <Icon name="Shield" size={16} className="text-muted-foreground" />
          <select value={filterRole} onChange={e => setFilterRole(e?.target?.value)}
            className="bg-transparent text-foreground text-sm focus:outline-none">
            <option value="all">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="manager">Gerente</option>
            <option value="cashier">Cajero</option>
            <option value="clerk">Empleado</option>
            {customRoles?.map(r => (
              <option key={r?.id} value={r?.role_key}>{r?.name}</option>
            ))}
          </select>
        </div>
      </div>

      <StaffTable
        staffMembers={filteredStaff}
        onEdit={staff => { setEditingStaff(staff); setShowForm(true); }}
        onDelete={handleDelete}
        onResendInvitation={handleResendInvitation}
        loading={loading}
      />

      {showForm && (
        <StaffForm
          staff={editingStaff}
          onSave={handleSaveStaff}
          onClose={() => { setShowForm(false); setEditingStaff(null); }}
        />
      )}
    </div>
  );
};

export default PersonalSection;
