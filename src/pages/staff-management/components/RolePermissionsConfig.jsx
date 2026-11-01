import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import RoleGuard from '../../../components/ui/RoleGuard';
import { supabase } from '../../../lib/supabase';

const RolePermissionsConfig = ({ userRole }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rolePermissions, setRolePermissions] = useState([
    {
      role: 'admin',
      label: 'Administrador',
      color: 'purple',
      description: 'Acceso completo excepto gestión de personal',
      permissions: {
        canManageStaff: false,
        canViewReports: true,
        canManageInventory: true,
        canProcessSales: true,
        canProcessRefunds: true,
        canManagePromotions: true,
        canManageCatalog: true,
        canOpenCloseRegister: true,
        canAdjustPrices: true,
        canDeleteTransactions: false
      }
    },
    {
      role: 'manager',
      label: 'Gerente',
      color: 'blue',
      description: 'Gestión operativa y supervisión',
      permissions: {
        canManageStaff: false,
        canViewReports: true,
        canManageInventory: true,
        canProcessSales: true,
        canProcessRefunds: true,
        canManagePromotions: false,
        canManageCatalog: false,
        canOpenCloseRegister: true,
        canAdjustPrices: false,
        canDeleteTransactions: false
      }
    },
    {
      role: 'cashier',
      label: 'Cajero',
      color: 'orange',
      description: 'Operaciones de caja y ventas',
      permissions: {
        canManageStaff: false,
        canViewReports: false,
        canManageInventory: false,
        canProcessSales: true,
        canProcessRefunds: true,
        canManagePromotions: false,
        canManageCatalog: false,
        canOpenCloseRegister: true,
        canAdjustPrices: false,
        canDeleteTransactions: false
      }
    },
    {
      role: 'clerk',
      label: 'Empleado',
      color: 'gray',
      description: 'Operaciones básicas de ventas',
      permissions: {
        canManageStaff: false,
        canViewReports: false,
        canManageInventory: false,
        canProcessSales: true,
        canProcessRefunds: false,
        canManagePromotions: false,
        canManageCatalog: false,
        canOpenCloseRegister: false,
        canAdjustPrices: false,
        canDeleteTransactions: false
      }
    }
  ]);

  const permissionCategories = [
    {
      name: 'Gestión de Personal',
      key: 'canManageStaff',
      icon: 'Users',
      description: 'Crear, editar y eliminar miembros del personal'
    },
    {
      name: 'Reportes',
      key: 'canViewReports',
      icon: 'BarChart3',
      description: 'Acceso a reportes y análisis'
    },
    {
      name: 'Inventario',
      key: 'canManageInventory',
      icon: 'Package',
      description: 'Gestionar stock y productos'
    },
    {
      name: 'Ventas',
      key: 'canProcessSales',
      icon: 'ShoppingCart',
      description: 'Procesar transacciones de venta'
    },
    {
      name: 'Reembolsos',
      key: 'canProcessRefunds',
      icon: 'RefreshCw',
      description: 'Procesar devoluciones y reembolsos'
    },
    {
      name: 'Promociones',
      key: 'canManagePromotions',
      icon: 'Tag',
      description: 'Crear y gestionar promociones'
    },
    {
      name: 'Catálogo',
      key: 'canManageCatalog',
      icon: 'BookOpen',
      description: 'Gestionar catálogo de productos'
    },
    {
      name: 'Caja',
      key: 'canOpenCloseRegister',
      icon: 'DollarSign',
      description: 'Abrir y cerrar caja registradora'
    },
    {
      name: 'Ajuste de Precios',
      key: 'canAdjustPrices',
      icon: 'TrendingUp',
      description: 'Modificar precios de productos'
    },
    {
      name: 'Eliminación de Transacciones',
      key: 'canDeleteTransactions',
      icon: 'Trash2',
      description: 'Eliminar transacciones del sistema'
    }
  ];

  // Load permissions from database
  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        ?.from('staff_permissions')
        ?.select('*')
        ?.in('staff_role', ['admin', 'manager', 'cashier', 'clerk']);

      if (error) throw error;

      if (data && data?.length > 0) {
        const updatedPermissions = rolePermissions?.map(role => {
          const dbPermission = data?.find(p => p?.staff_role === role?.role);
          if (dbPermission) {
            return {
              ...role,
              permissions: {
                canManageStaff: dbPermission?.can_manage_staff,
                canViewReports: dbPermission?.can_view_reports,
                canManageInventory: dbPermission?.can_manage_inventory,
                canProcessSales: dbPermission?.can_process_sales,
                canProcessRefunds: dbPermission?.can_process_refunds,
                canManagePromotions: dbPermission?.can_manage_promotions,
                canManageCatalog: dbPermission?.can_manage_catalog,
                canOpenCloseRegister: dbPermission?.can_open_close_register,
                canAdjustPrices: dbPermission?.can_adjust_prices,
                canDeleteTransactions: dbPermission?.can_delete_transactions
              }
            };
          }
          return role;
        });
        setRolePermissions(updatedPermissions);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (roleIndex, permissionKey) => {
    const updatedPermissions = [...rolePermissions];
    updatedPermissions[roleIndex].permissions[permissionKey] = 
      !updatedPermissions?.[roleIndex]?.permissions?.[permissionKey];
    setRolePermissions(updatedPermissions);
  };

  const handleSavePermissions = async () => {
    setSaving(true);
    try {
      // Update each role's permissions in database
      for (const role of rolePermissions) {
        const { error } = await supabase
          ?.from('staff_permissions')
          ?.upsert({
            staff_role: role?.role,
            can_manage_staff: role?.permissions?.canManageStaff,
            can_view_reports: role?.permissions?.canViewReports,
            can_manage_inventory: role?.permissions?.canManageInventory,
            can_process_sales: role?.permissions?.canProcessSales,
            can_process_refunds: role?.permissions?.canProcessRefunds,
            can_manage_promotions: role?.permissions?.canManagePromotions,
            can_manage_catalog: role?.permissions?.canManageCatalog,
            can_open_close_register: role?.permissions?.canOpenCloseRegister,
            can_adjust_prices: role?.permissions?.canAdjustPrices,
            can_delete_transactions: role?.permissions?.canDeleteTransactions,
            updated_at: new Date()?.toISOString()
          }, {
            onConflict: 'staff_role'
          });

        if (error) throw error;
      }

      alert('✅ Permisos actualizados exitosamente');
    } catch (error) {
      console.error('Error saving permissions:', error);
      alert('❌ Error al guardar permisos: ' + error?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (confirm('¿Está seguro de restaurar los permisos predeterminados? Esta acción no se puede deshacer.')) {
      setRolePermissions([
        {
          role: 'admin',
          label: 'Administrador',
          color: 'purple',
          description: 'Acceso completo excepto gestión de personal',
          permissions: {
            canManageStaff: false,
            canViewReports: true,
            canManageInventory: true,
            canProcessSales: true,
            canProcessRefunds: true,
            canManagePromotions: true,
            canManageCatalog: true,
            canOpenCloseRegister: true,
            canAdjustPrices: true,
            canDeleteTransactions: false
          }
        },
        {
          role: 'manager',
          label: 'Gerente',
          color: 'blue',
          description: 'Gestión operativa y supervisión',
          permissions: {
            canManageStaff: false,
            canViewReports: true,
            canManageInventory: true,
            canProcessSales: true,
            canProcessRefunds: true,
            canManagePromotions: false,
            canManageCatalog: false,
            canOpenCloseRegister: true,
            canAdjustPrices: false,
            canDeleteTransactions: false
          }
        },
        {
          role: 'cashier',
          label: 'Cajero',
          color: 'orange',
          description: 'Operaciones de caja y ventas',
          permissions: {
            canManageStaff: false,
            canViewReports: false,
            canManageInventory: false,
            canProcessSales: true,
            canProcessRefunds: true,
            canManagePromotions: false,
            canManageCatalog: false,
            canOpenCloseRegister: true,
            canAdjustPrices: false,
            canDeleteTransactions: false
          }
        },
        {
          role: 'clerk',
          label: 'Empleado',
          color: 'gray',
          description: 'Operaciones básicas de ventas',
          permissions: {
            canManageStaff: false,
            canViewReports: false,
            canManageInventory: false,
            canProcessSales: true,
            canProcessRefunds: false,
            canManagePromotions: false,
            canManageCatalog: false,
            canOpenCloseRegister: false,
            canAdjustPrices: false,
            canDeleteTransactions: false
          }
        }
      ]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Configuración de Permisos por Rol</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Configure permisos personalizados para cada rol del personal. El rol de Propietario tiene permisos completos y no puede ser modificado.
          </p>
        </div>
        <RoleGuard allowedRoles={['owner']} userRole={userRole} showFallback={false} module="permissions">
          <div className="flex gap-2">
            <Button 
              onClick={handleResetToDefaults} 
              variant="outline"
              iconName="RotateCcw"
            >
              Restaurar Predeterminados
            </Button>
            <Button 
              onClick={handleSavePermissions} 
              iconName="Save"
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </RoleGuard>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Información Importante</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 mt-1 space-y-1 list-disc list-inside">
              <li>Los cambios se aplican automáticamente a todos los miembros del personal con el rol correspondiente</li>
              <li>Solo los propietarios pueden modificar la configuración de permisos</li>
              <li>El rol de Propietario/Owner tiene acceso completo y no aparece en esta configuración</li>
              <li>Se recomienda revisar cuidadosamente antes de otorgar permisos críticos</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Role Cards with Permissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rolePermissions?.map((role, roleIndex) => (
          <div key={role?.role} className="bg-card border border-border rounded-lg overflow-hidden">
            {/* Role Header */}
            <div className={`bg-${role?.color}-100 dark:bg-${role?.color}-900/20 border-b border-border p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`text-lg font-semibold text-${role?.color}-900 dark:text-${role?.color}-100`}>
                    {role?.label}
                  </h4>
                  <p className={`text-sm text-${role?.color}-700 dark:text-${role?.color}-300 mt-1`}>
                    {role?.description}
                  </p>
                </div>
                <div className={`w-12 h-12 bg-${role?.color}-200 dark:bg-${role?.color}-800 rounded-full flex items-center justify-center`}>
                  <Icon name="Shield" size={24} className={`text-${role?.color}-700 dark:text-${role?.color}-300`} />
                </div>
              </div>
            </div>

            {/* Permissions List */}
            <div className="p-4 space-y-3">
              {permissionCategories?.map((category) => (
                <div key={category?.key} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <Icon name={category?.icon} size={18} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{category?.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{category?.description}</p>
                      </div>
                      <RoleGuard allowedRoles={['owner']} userRole={userRole} showFallback={false} module="permissions">
                        <Checkbox
                          checked={role?.permissions?.[category?.key]}
                          onChange={() => handlePermissionToggle(roleIndex, category?.key)}
                        />
                      </RoleGuard>
                      <RoleGuard allowedRoles={['owner']} userRole={userRole} showFallback={false} module="permissions" fallback={
                        <div className="flex items-center justify-center">
                          {role?.permissions?.[category?.key] ? (
                            <Icon name="Check" size={20} className="text-green-600" />
                          ) : (
                            <Icon name="X" size={20} className="text-red-600" />
                          )}
                        </div>
                      } />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Permissions Summary */}
            <div className="bg-muted/50 border-t border-border p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Permisos activos:</span>
                <span className="font-semibold text-foreground">
                  {Object.values(role?.permissions)?.filter(Boolean)?.length} / {permissionCategories?.length}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Warning for Critical Permissions */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="AlertTriangle" size={20} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100">Permisos Críticos</h4>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              Los permisos de <strong>Ajuste de Precios</strong> y <strong>Eliminación de Transacciones</strong> son críticos. 
              Otórguelos solo a personal de máxima confianza y supervisión.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionsConfig;