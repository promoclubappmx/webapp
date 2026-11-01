import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const MODULES = [
  { key: 'staff', label: 'Gestión de Personal', icon: 'Users', description: 'Crear, editar y gestionar empleados' },
  { key: 'reports', label: 'Reportes y Analíticas', icon: 'BarChart3', description: 'Ver reportes y estadísticas' },
  { key: 'inventory', label: 'Inventario', icon: 'Package', description: 'Gestionar stock y productos' },
  { key: 'pos', label: 'Punto de Venta', icon: 'ShoppingCart', description: 'Procesar ventas y transacciones' },
  { key: 'catalog', label: 'Catálogo', icon: 'BookOpen', description: 'Gestionar catálogo de productos' },
  { key: 'promotions', label: 'Promociones', icon: 'Tag', description: 'Crear y gestionar promociones' },
  { key: 'campaigns', label: 'Campañas y Marketing', icon: 'Megaphone', description: 'Gestionar campañas de marketing' },
  { key: 'crm', label: 'CRM / Clientes', icon: 'UserCheck', description: 'Gestionar clientes y segmentos' },
  { key: 'loyalty', label: 'Fidelización', icon: 'Star', description: 'Puntos, recompensas y membresías' },
  { key: 'reservations', label: 'Reservaciones', icon: 'Calendar', description: 'Gestionar reservas y citas' },
  { key: 'purchases', label: 'Compras', icon: 'Truck', description: 'Órdenes de compra y proveedores' },
  { key: 'settings', label: 'Configuración', icon: 'Settings', description: 'Configuración del sistema' },
];

const ROLE_ICONS = [
  'Shield', 'ShieldCheck', 'Star', 'Crown', 'Award', 'Briefcase',
  'UserCheck', 'Users', 'Settings', 'Key', 'Lock', 'Eye',
  'BarChart3', 'TrendingUp', 'Zap', 'Target', 'Layers', 'Grid',
];

const DEFAULT_ROLES = [
  { role_key: 'admin', name: 'Administrador', description: 'Acceso completo al sistema', is_default: true, color: 'purple', icon: 'ShieldCheck' },
  { role_key: 'manager', name: 'Gerente', description: 'Gestión operativa y supervisión', is_default: true, color: 'blue', icon: 'Briefcase' },
  { role_key: 'cashier', name: 'Cajero', description: 'Operaciones de caja y ventas', is_default: true, color: 'teal', icon: 'ShoppingCart' },
];

const DEFAULT_PERMS = {
  admin: { all: true },
  manager: { staff: false, reports: true, inventory: true, pos: true, catalog: false, promotions: false, campaigns: false, crm: true, loyalty: true, reservations: true, purchases: false, settings: false },
  cashier: { staff: false, reports: false, inventory: false, pos: true, catalog: false, promotions: false, campaigns: false, crm: false, loyalty: false, reservations: false, purchases: false, settings: false },
};

const RoleForm = ({ role, onSave, onClose }) => {
  const [name, setName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [roleKey, setRoleKey] = useState(role?.role_key || '');
  const [selectedIcon, setSelectedIcon] = useState(role?.icon || 'Shield');
  const [modulePerms, setModulePerms] = useState(() => {
    const initial = {};
    MODULES?.forEach(m => { initial[m?.key] = false; });
    return initial;
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleToggleModule = (moduleKey) => {
    setModulePerms(prev => ({ ...prev, [moduleKey]: !prev?.[moduleKey] }));
  };

  const handleSelectAll = () => {
    const allOn = MODULES?.every(m => modulePerms?.[m?.key]);
    const updated = {};
    MODULES?.forEach(m => { updated[m?.key] = !allOn; });
    setModulePerms(updated);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const errs = {};
    if (!name?.trim()) errs.name = 'El nombre es requerido';
    if (!roleKey?.trim()) errs.roleKey = 'La clave del rol es requerida';
    if (Object.keys(errs)?.length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      await onSave({
        name: name?.trim(),
        description: description?.trim(),
        role_key: roleKey?.trim()?.toLowerCase()?.replace(/\s+/g, '_'),
        icon: selectedIcon,
        module_permissions: modulePerms,
      });
    } catch (err) {
      setErrors({ submit: err?.message });
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = MODULES?.filter(m => modulePerms?.[m?.key])?.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">{role ? 'Editar Rol' : 'Nuevo Rol'}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><Icon name="X" size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Icon selector */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Ícono del Rol</label>
            <div className="flex flex-wrap gap-2">
              {ROLE_ICONS?.map(iconName => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setSelectedIcon(iconName)}
                  className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${
                    selectedIcon === iconName ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                  title={iconName}
                >
                  <Icon name={iconName} size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Name & Key */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nombre del Rol" value={name} onChange={e => setName(e?.target?.value)} error={errors?.name} required disabled={loading} />
            <Input label="Clave del Rol" value={roleKey} onChange={e => setRoleKey(e?.target?.value)} error={errors?.roleKey} required disabled={loading || !!role}
              placeholder="ej: supervisor" description="Identificador único, sin espacios" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Descripción</label>
            <textarea value={description} onChange={e => setDescription(e?.target?.value)} rows={2}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={loading} />
          </div>

          {/* Modules */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-foreground">
                Módulos con acceso
                <span className="ml-2 text-xs text-muted-foreground">({selectedCount}/{MODULES?.length} seleccionados)</span>
              </label>
              <button type="button" onClick={handleSelectAll} className="text-xs text-primary hover:underline">
                {MODULES?.every(m => modulePerms?.[m?.key]) ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-border rounded-lg p-3">
              {MODULES?.map(module => (
                <label key={module?.key} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  modulePerms?.[module?.key] ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted/50'
                }`}>
                  <input
                    type="checkbox"
                    checked={modulePerms?.[module?.key] || false}
                    onChange={() => handleToggleModule(module?.key)}
                    className="rounded border-border text-primary focus:ring-primary"
                    disabled={loading}
                  />
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon name={module?.icon} size={16} className={modulePerms?.[module?.key] ? 'text-primary' : 'text-muted-foreground'} />
                    <span className="text-sm font-medium text-foreground truncate">{module?.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {errors?.submit && <p className="text-sm text-red-500">{errors?.submit}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar Rol'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RolesPermisosSection = () => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('roles');
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        ?.from('custom_roles')
        ?.select('*')
        ?.eq('owner_id', authUser?.id)
        ?.order('is_default', { ascending: false });
      if (error) throw error;

      let allRoles = data || [];
      if (allRoles?.length === 0) {
        const inserts = DEFAULT_ROLES?.map(r => ({ ...r, owner_id: authUser?.id }));
        const { data: inserted } = await supabase?.from('custom_roles')?.insert(inserts)?.select();
        allRoles = inserted || DEFAULT_ROLES?.map((r, i) => ({ ...r, id: `default-${i}`, owner_id: authUser?.id }));
      }
      setRoles(allRoles);
      if (!selectedRole) setSelectedRole(allRoles?.[0]);
    } catch (e) {
      console.error('Error fetching roles:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async (roleKey) => {
    try {
      const { data } = await supabase
        ?.from('role_module_permissions')
        ?.select('*')
        ?.eq('owner_id', authUser?.id)
        ?.eq('role_key', roleKey);

      const permsMap = {};
      MODULES?.forEach(m => {
        const existing = data?.find(p => p?.module_key === m?.key);
        if (existing) {
          permsMap[m?.key] = { view: existing?.can_view, create: existing?.can_create, edit: existing?.can_edit, delete: existing?.can_delete };
        } else {
          const def = DEFAULT_PERMS?.[roleKey];
          const hasAccess = def?.all || def?.[m?.key] || false;
          permsMap[m?.key] = { view: hasAccess, create: hasAccess, edit: hasAccess, delete: hasAccess };
        }
      });
      setPermissions(permsMap);
    } catch (e) {
      console.error('Error fetching permissions:', e);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  useEffect(() => {
    if (selectedRole?.role_key) fetchPermissions(selectedRole?.role_key);
  }, [selectedRole]);

  const handleSaveRole = async (data) => {
    try {
      const { module_permissions, ...roleData } = data;
      if (editingRole) {
        const { error } = await supabase?.from('custom_roles')?.update({ ...roleData, updated_at: new Date()?.toISOString() })?.eq('id', editingRole?.id);
        if (error) throw error;
        showNotif('Rol actualizado');
      } else {
        const { error } = await supabase?.from('custom_roles')?.insert({ ...roleData, owner_id: authUser?.id });
        if (error) throw error;

        // Save initial module permissions
        if (module_permissions) {
          const upserts = MODULES?.map(m => ({
            owner_id: authUser?.id,
            role_key: roleData?.role_key,
            module_key: m?.key,
            can_view: module_permissions?.[m?.key] || false,
            can_create: module_permissions?.[m?.key] || false,
            can_edit: module_permissions?.[m?.key] || false,
            can_delete: module_permissions?.[m?.key] || false,
          }));
          await supabase?.from('role_module_permissions')?.upsert(upserts, { onConflict: 'owner_id,role_key,module_key' });
        }
        showNotif('Rol creado');
      }
      setShowRoleForm(false);
      setEditingRole(null);
      fetchRoles();
    } catch (e) {
      throw e;
    }
  };

  const handleDeleteRole = async (role) => {
    if (role?.is_default) { showNotif('No se pueden eliminar los roles predeterminados', 'error'); return; }
    if (!confirm(`¿Eliminar el rol "${role?.name}"?`)) return;
    try {
      const { error } = await supabase?.from('custom_roles')?.delete()?.eq('id', role?.id);
      if (error) throw error;
      showNotif('Rol eliminado');
      if (selectedRole?.id === role?.id) setSelectedRole(roles?.[0]);
      fetchRoles();
    } catch (e) {
      showNotif(e?.message, 'error');
    }
  };

  const handlePermissionChange = (moduleKey, permType) => {
    if (selectedRole?.role_key === 'admin') return;
    setPermissions(prev => ({
      ...prev,
      [moduleKey]: { ...prev?.[moduleKey], [permType]: !prev?.[moduleKey]?.[permType] }
    }));
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      const upserts = MODULES?.map(m => ({
        owner_id: authUser?.id,
        role_key: selectedRole?.role_key,
        module_key: m?.key,
        can_view: permissions?.[m?.key]?.view || false,
        can_create: permissions?.[m?.key]?.create || false,
        can_edit: permissions?.[m?.key]?.edit || false,
        can_delete: permissions?.[m?.key]?.delete || false,
        updated_at: new Date()?.toISOString(),
      }));

      const { error } = await supabase?.from('role_module_permissions')?.upsert(upserts, { onConflict: 'owner_id,role_key,module_key' });
      if (error) throw error;
      showNotif('Permisos guardados exitosamente');
    } catch (e) {
      showNotif(e?.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const getRoleColor = (roleKey) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
      manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      cashier: 'bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400'
    };
    return colors?.[roleKey] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
  };

  const getRoleIcon = (role) => {
    if (role?.icon) return role?.icon;
    const defaults = { admin: 'ShieldCheck', manager: 'Briefcase', cashier: 'ShoppingCart' };
    return defaults?.[role?.role_key] || 'Shield';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          notification?.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {notification?.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Roles y Permisos</h2>
          <p className="text-sm text-muted-foreground mt-1">Gestiona los roles y configura permisos por módulo</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {[{ key: 'roles', label: 'Roles', icon: 'Shield' }, { key: 'permisos', label: 'Permisos', icon: 'Lock' }]?.map(tab => (
          <button key={tab?.key} onClick={() => setActiveTab(tab?.key)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab?.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}>
            <Icon name={tab?.icon} size={16} />
            {tab?.label}
          </button>
        ))}
      </div>

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setEditingRole(null); setShowRoleForm(true); }} iconName="Plus">Agregar Rol</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles?.map(role => (
              <div key={role?.id} className={`bg-card border rounded-xl p-5 cursor-pointer transition-all hover:shadow-md ${
                selectedRole?.id === role?.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'
              }`} onClick={() => { setSelectedRole(role); setActiveTab('permisos'); }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getRoleColor(role?.role_key)}`}>
                      <Icon name={getRoleIcon(role)} size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{role?.name}</p>
                      {role?.is_default && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Default</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!role?.is_default && (
                      <>
                        <button onClick={e => { e?.stopPropagation(); setEditingRole(role); setShowRoleForm(true); }}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                          <Icon name="Edit" size={14} />
                        </button>
                        <button onClick={e => { e?.stopPropagation(); handleDeleteRole(role); }}
                          className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Icon name="Trash2" size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{role?.description}</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-primary">
                  <Icon name="Settings" size={12} />
                  <span>Ver permisos</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permisos Tab */}
      {activeTab === 'permisos' && (
        <div className="space-y-4">
          {/* Role selector */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-foreground">Rol:</span>
            {roles?.map(role => (
              <button key={role?.id} onClick={() => setSelectedRole(role)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedRole?.id === role?.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'
                }`}>
                <Icon name={getRoleIcon(role)} size={14} />
                {role?.name}
              </button>
            ))}
          </div>

          {selectedRole?.role_key === 'admin' && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 flex items-center gap-3">
              <Icon name="ShieldCheck" size={20} className="text-purple-600 dark:text-purple-400" />
              <p className="text-sm text-purple-700 dark:text-purple-300">
                El rol <strong>Administrador</strong> tiene acceso completo a todos los módulos del sistema.
              </p>
            </div>
          )}

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-muted/50 px-6 py-3 grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="col-span-5">Módulo</div>
              <div className="col-span-1 text-center">Ver</div>
              <div className="col-span-2 text-center">Crear</div>
              <div className="col-span-2 text-center">Editar</div>
              <div className="col-span-2 text-center">Eliminar</div>
            </div>
            <div className="divide-y divide-border">
              {MODULES?.map(module => {
                const perms = permissions?.[module?.key] || {};
                const isAdmin = selectedRole?.role_key === 'admin';
                return (
                  <div key={module?.key} className="px-6 py-4 grid grid-cols-12 gap-2 items-center hover:bg-muted/20 transition-colors">
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon name={module?.icon} size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{module?.label}</p>
                        <p className="text-xs text-muted-foreground hidden md:block">{module?.description}</p>
                      </div>
                    </div>
                    {['view', 'create', 'edit', 'delete']?.map(permType => (
                      <div key={permType} className={`${permType === 'view' ? 'col-span-1' : 'col-span-2'} flex justify-center`}>
                        <button
                          onClick={() => handlePermissionChange(module?.key, permType)}
                          disabled={isAdmin}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                            isAdmin || perms?.[permType]
                              ? 'bg-primary border-primary' : 'border-border hover:border-primary/50'
                          } ${isAdmin ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {(isAdmin || perms?.[permType]) && <Icon name="Check" size={12} className="text-primary-foreground" />}
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {selectedRole?.role_key !== 'admin' && (
            <div className="flex justify-end">
              <Button onClick={handleSavePermissions} disabled={saving} iconName="Save">
                {saving ? 'Guardando...' : 'Guardar Permisos'}
              </Button>
            </div>
          )}
        </div>
      )}

      {showRoleForm && (
        <RoleForm
          role={editingRole}
          onSave={handleSaveRole}
          onClose={() => { setShowRoleForm(false); setEditingRole(null); }}
        />
      )}
    </div>
  );
};

export default RolesPermisosSection;
