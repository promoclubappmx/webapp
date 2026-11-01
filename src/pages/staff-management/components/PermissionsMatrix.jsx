import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import RoleGuard from '../../../components/ui/RoleGuard';

const PermissionsMatrix = ({ userRole }) => {
  const [permissions, setPermissions] = useState([
    {
      role: 'admin',
      label: 'Administrador',
      color: 'purple',
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
      label: 'Manager',
      color: 'blue',
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

  const permissionLabels = {
    canManageStaff: 'Gestionar Personal',
    canViewReports: 'Ver Reportes',
    canManageInventory: 'Gestionar Inventario',
    canProcessSales: 'Procesar Ventas',
    canProcessRefunds: 'Procesar Reembolsos',
    canManagePromotions: 'Gestionar Promociones',
    canManageCatalog: 'Gestionar Catálogo',
    canOpenCloseRegister: 'Abrir/Cerrar Caja',
    canAdjustPrices: 'Ajustar Precios',
    canDeleteTransactions: 'Eliminar Transacciones'
  };

  const handlePermissionChange = (roleIndex, permissionKey) => {
    const newPermissions = [...permissions];
    newPermissions[roleIndex].permissions[permissionKey] = 
      !newPermissions?.[roleIndex]?.permissions?.[permissionKey];
    setPermissions(newPermissions);
  };

  const handleSavePermissions = () => {
    // In real app, save to database
    alert('Permisos actualizados exitosamente');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Matriz de Permisos por Rol</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Configure los permisos para cada rol de personal
          </p>
        </div>
        <RoleGuard allowedRoles={['owner']} userRole={userRole} module="permissions" showFallback={false}>
          <Button onClick={handleSavePermissions} iconName="Save">
            Guardar Cambios
          </Button>
        </RoleGuard>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border border-border rounded-lg">
          <thead>
            <tr className="bg-muted">
              <th className="text-left py-3 px-4 text-sm font-medium text-foreground border-b border-border">
                Permiso
              </th>
              {permissions?.map((role) => (
                <th key={role?.role} className="text-center py-3 px-4 text-sm font-medium text-foreground border-b border-l border-border">
                  <div className="flex flex-col items-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${role?.color}-100 text-${role?.color}-700 dark:bg-${role?.color}-900/20 dark:text-${role?.color}-400`}>
                      {role?.label}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.keys(permissionLabels)?.map((permissionKey, index) => (
              <tr key={permissionKey} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                <td className="py-3 px-4 text-sm text-foreground border-b border-border">
                  {permissionLabels?.[permissionKey]}
                </td>
                {permissions?.map((role, roleIndex) => (
                  <td key={`${role?.role}-${permissionKey}`} className="text-center py-3 px-4 border-b border-l border-border">
                    <RoleGuard allowedRoles={['owner']} userRole={userRole} module="permissions" showFallback={false}>
                      <Checkbox
                        checked={role?.permissions?.[permissionKey]}
                        onChange={() => handlePermissionChange(roleIndex, permissionKey)}
                      />
                    </RoleGuard>
                    <RoleGuard allowedRoles={['owner']} userRole={userRole} module="permissions" showFallback={false} fallback={
                      <div className="flex items-center justify-center">
                        {role?.permissions?.[permissionKey] ? (
                          <Icon name="Check" size={20} className="text-green-600" />
                        ) : (
                          <Icon name="X" size={20} className="text-red-600" />
                        )}
                      </div>
                    } />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Información sobre Permisos</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Los permisos se aplican automáticamente a todos los miembros del personal con el rol correspondiente.
              Solo los propietarios pueden modificar la matriz de permisos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsMatrix;