import React from 'react';
import Icon from '../../../components/AppIcon';

const STATUS_CONFIG = {
  pending: {
    label: 'Pendiente de confirmación',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
    icon: 'Clock',
    iconClass: 'text-amber-500',
  },
  active: {
    label: 'Activo',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    icon: 'CheckCircle',
    iconClass: 'text-green-500',
  },
  inactive: {
    label: 'Inactivo',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    icon: 'XCircle',
    iconClass: 'text-gray-400',
  },
};

const ROLE_CONFIG = {
  admin: { label: 'Administrador', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' },
  manager: { label: 'Gerente', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
  cashier: { label: 'Cajero', className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400' },
  clerk: { label: 'Empleado', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' },
};

const StaffTable = ({ staffMembers, onEdit, onDelete, onResendInvitation, loading }) => {
  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG?.[status] || STATUS_CONFIG?.inactive;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config?.className}`}>
        <Icon name={config?.icon} size={11} className={config?.iconClass} />
        {config?.label}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const config = ROLE_CONFIG?.[role] || ROLE_CONFIG?.clerk;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.className}`}>
        {config?.label}
      </span>
    );
  };

  const getAccountTypeBadge = (staff) => {
    // Show employee account badge if linked to auth account
    if (staff?.authUserId) {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
          <Icon name="UserCheck" size={10} />
          Cuenta empleado
        </span>
      );
    }
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString)?.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">Cargando personal...</p>
      </div>
    );
  }

  if (!staffMembers || staffMembers?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No hay miembros del personal registrados</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Empleado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                ID Empleado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Cuenta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {staffMembers?.map((staff) => (
              <tr key={staff?.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                      {staff?.photoUrl ? (
                        <img src={staff?.photoUrl} alt={`Foto de ${staff?.fullName}`} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-primary font-medium text-sm">
                          {staff?.fullName?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-foreground">
                        {staff?.fullName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {staff?.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRoleBadge(staff?.staffRole)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1.5">
                    {getStatusBadge(staff?.status)}
                    {staff?.status === 'pending' && (
                      <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Icon name="Mail" size={10} />
                        Esperando confirmación de email
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {staff?.employeeId || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    {getAccountTypeBadge(staff)}
                    {!staff?.authUserId && staff?.status !== 'pending' && (
                      <span className="text-xs text-muted-foreground">Sin cuenta</span>
                    )}
                    {staff?.status === 'pending' && !staff?.authUserId && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        <Icon name="Hourglass" size={10} />
                        Pendiente
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    {staff?.status === 'pending' && (
                      <button
                        onClick={() => onResendInvitation?.(staff?.id)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Preparar invitación (email pendiente de configurar)"
                      >
                        <Icon name="Mail" size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit?.(staff)}
                      className="text-primary hover:text-primary/80"
                      title="Editar"
                    >
                      <Icon name="Edit" size={18} />
                    </button>
                    <button
                      onClick={() => onDelete?.(staff?.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      title="Eliminar"
                    >
                      <Icon name="Trash2" size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffTable;