import React from 'react';
import Icon from '../AppIcon';
import { useAuth } from '../../contexts/AuthContext';

/**
 * RoleGuard - Guards content based on user role OR employee module permissions.
 * 
 * For owner accounts: uses allowedRoles prop (legacy behavior).
 * For employee accounts: uses hasPermission() from AuthContext based on module/action.
 * 
 * Props:
 * - allowedRoles: string[] - roles allowed (for owner-based checks)
 * - userRole: string - current user role
 * - module: string - module name to check employee permissions (e.g. 'staff', 'inventory')
 * - action: string - permission action ('canView', 'canCreate', 'canEdit', 'canDelete')
 * - fallback: ReactNode - custom fallback UI
 * - showFallback: boolean - whether to show fallback or null
 */
const RoleGuard = ({ 
  children, 
  allowedRoles = [], 
  userRole, 
  module,
  action = 'canView',
  fallback = null,
  showFallback = true 
}) => {
  const { hasPermission, isEmployee, permissionsLoading } = useAuth();

  const hasAccess = () => {
    // If employee account and module specified, check employee permissions
    if (isEmployee && module) {
      if (permissionsLoading) return false; // Wait for permissions to load
      return hasPermission(module, action);
    }
    // Legacy role-based check (for owners or when no module specified)
    if (!allowedRoles?.length) return true;
    if (!userRole) return false;
    return allowedRoles?.includes(userRole);
  };

  if (permissionsLoading && isEmployee && module) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (hasAccess()) {
    return children;
  }

  if (!showFallback) {
    return null;
  }

  if (fallback) {
    return fallback;
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Icon name="Lock" size={24} className="text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Acceso Restringido
      </h3>
      <p className="text-muted-foreground max-w-md">
        No tienes permisos para acceder a esta sección. Contacta con tu empleador si necesitas acceso.
      </p>
    </div>
  );
};

export default RoleGuard;