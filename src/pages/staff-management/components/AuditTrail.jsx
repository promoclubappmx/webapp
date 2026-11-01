import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';


const AuditTrail = ({ userRole }) => {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterChangeType, setFilterChangeType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [expandedAudit, setExpandedAudit] = useState(null);

  useEffect(() => {
    fetchAudits();
    
    // Real-time subscription for new audit entries
    const channel = supabase?.channel('permission_audits_changes')?.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'permission_audits'
      },
      (payload) => {
        console.log('Audit change:', payload);
        fetchAudits();
      }
    )?.subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      
      let query = supabase?.from('permission_audits')?.select(`
          *,
          changed_by_user:user_profiles!permission_audits_changed_by_fkey(full_name, email),
          approved_by_user:user_profiles!permission_audits_approved_by_fkey(full_name, email),
          staff_member:staff_members(full_name, email)
        `)?.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        if (isSchemaError(error)) {
          console.error('Schema error:', error?.message);
          throw error;
        } else {
          console.log('Fetch audits error:', error?.message);
          setAudits([]);
          return;
        }
      }

      setAudits(data || []);
    } catch (error) {
      console.error('Error fetching audits:', error);
      setAudits([]);
    } finally {
      setLoading(false);
    }
  };

  const isSchemaError = (error) => {
    if (!error) return false;
    
    if (error?.code && typeof error?.code === 'string') {
      const errorClass = error?.code?.substring(0, 2);
      if (errorClass === '42' || errorClass === '08') {
        return true;
      }
    }
    
    if (error?.message) {
      const schemaErrorPatterns = [
        /relation.*does not exist/i,
        /column.*does not exist/i,
        /function.*does not exist/i,
      ];
      return schemaErrorPatterns?.some(pattern => pattern?.test(error?.message));
    }
    
    return false;
  };

  const handleApprove = async (auditId) => {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      if (!user) {
        console.log('User not authenticated');
        return;
      }

      const { error } = await supabase?.from('permission_audits')?.update({
          approval_status: 'approved',
          approved_by: user?.id,
          approved_at: new Date()?.toISOString()
        })?.eq('id', auditId);

      if (error) {
        if (isSchemaError(error)) {
          throw error;
        } else {
          console.log('Approve error:', error?.message);
        }
      } else {
        fetchAudits();
      }
    } catch (error) {
      console.error('Error approving audit:', error);
    }
  };

  const handleReject = async (auditId) => {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      if (!user) {
        console.log('User not authenticated');
        return;
      }

      const { error } = await supabase?.from('permission_audits')?.update({
          approval_status: 'rejected',
          approved_by: user?.id,
          approved_at: new Date()?.toISOString()
        })?.eq('id', auditId);

      if (error) {
        if (isSchemaError(error)) {
          throw error;
        } else {
          console.log('Reject error:', error?.message);
        }
      } else {
        fetchAudits();
      }
    } catch (error) {
      console.error('Error rejecting audit:', error);
    }
  };

  const filteredAudits = audits?.filter(audit => {
    const matchesRole = filterRole === 'all' || audit?.staff_role === filterRole;
    const matchesStatus = filterStatus === 'all' || audit?.approval_status === filterStatus;
    const matchesChangeType = filterChangeType === 'all' || audit?.change_type === filterChangeType;
    const matchesSearch = !searchTerm || 
      audit?.permission_field?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      audit?.staff_role?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      audit?.notes?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    
    let matchesDate = true;
    if (dateRange?.start) {
      matchesDate = matchesDate && new Date(audit?.created_at) >= new Date(dateRange?.start);
    }
    if (dateRange?.end) {
      matchesDate = matchesDate && new Date(audit?.created_at) <= new Date(dateRange?.end);
    }

    return matchesRole && matchesStatus && matchesChangeType && matchesSearch && matchesDate;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', label: 'Aprobado' },
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400', label: 'Pendiente' },
      rejected: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', label: 'Rechazado' }
    };
    const config = statusConfig?.[status] || statusConfig?.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.bg} ${config?.text}`}>
        {config?.label}
      </span>
    );
  };

  const getRoleLabel = (role) => {
    const roleLabels = {
      admin: 'Administrador',
      manager: 'Gerente',
      cashier: 'Cajero',
      clerk: 'Empleado'
    };
    return roleLabels?.[role] || role;
  };

  const getPermissionLabel = (field) => {
    const labels = {
      can_manage_staff: 'Gestión de Personal',
      can_view_reports: 'Ver Reportes',
      can_manage_inventory: 'Gestión de Inventario',
      can_process_sales: 'Procesar Ventas',
      can_process_refunds: 'Procesar Reembolsos',
      can_manage_promotions: 'Gestión de Promociones',
      can_manage_catalog: 'Gestión de Catálogo',
      can_open_close_register: 'Abrir/Cerrar Caja',
      can_adjust_prices: 'Ajustar Precios',
      can_delete_transactions: 'Eliminar Transacciones'
    };
    return labels?.[field] || field;
  };

  const getChangeTypeLabel = (type) => {
    const labels = {
      role_config_update: 'Configuración de Rol',
      individual_permission_update: 'Permiso Individual',
      role_assignment: 'Asignación de Rol'
    };
    return labels?.[type] || type;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date?.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Buscar</label>
            <Input
              placeholder="Buscar por permiso, rol, notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              iconName="Search"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Rol</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e?.target?.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="all">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="manager">Gerente</option>
              <option value="cashier">Cajero</option>
              <option value="clerk">Empleado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Estado</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e?.target?.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="all">Todos los estados</option>
              <option value="approved">Aprobado</option>
              <option value="pending">Pendiente</option>
              <option value="rejected">Rechazado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tipo de Cambio</label>
            <select
              value={filterChangeType}
              onChange={(e) => setFilterChangeType(e?.target?.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="all">Todos los tipos</option>
              <option value="role_config_update">Configuración de Rol</option>
              <option value="individual_permission_update">Permiso Individual</option>
              <option value="role_assignment">Asignación de Rol</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Fecha Inicio</label>
            <input
              type="date"
              value={dateRange?.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e?.target?.value })}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Fecha Fin</label>
            <input
              type="date"
              value={dateRange?.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e?.target?.value })}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Cambios</p>
              <p className="text-2xl font-bold text-foreground">{filteredAudits?.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Icon name="FileText" size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {filteredAudits?.filter(a => a?.approval_status === 'pending')?.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={24} className="text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Aprobados</p>
              <p className="text-2xl font-bold text-blue-600">
                {filteredAudits?.filter(a => a?.approval_status === 'approved')?.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Icon name="CheckCircle" size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>
      {/* Audit Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Permiso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Cambio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredAudits?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-muted-foreground">
                    <Icon name="FileText" size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No se encontraron registros de auditoría</p>
                  </td>
                </tr>
              ) : (
                filteredAudits?.map((audit) => (
                  <React.Fragment key={audit?.id}>
                    <tr className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {formatDate(audit?.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="font-medium text-foreground">{getRoleLabel(audit?.staff_role)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {getPermissionLabel(audit?.permission_field)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded text-xs">
                            {audit?.old_value === 'true' || audit?.old_value === true ? 'Sí' : 'No'}
                          </span>
                          <Icon name="ArrowRight" size={14} className="text-muted-foreground" />
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-xs">
                            {audit?.new_value === 'true' || audit?.new_value === true ? 'Sí' : 'No'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {audit?.changed_by_user?.full_name || 'Sistema'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getStatusBadge(audit?.approval_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedAudit(expandedAudit === audit?.id ? null : audit?.id)}
                            className="text-primary hover:text-primary/80 transition-colors"
                            title="Ver detalles"
                          >
                            <Icon name={expandedAudit === audit?.id ? "ChevronUp" : "ChevronDown"} size={18} />
                          </button>
                          {audit?.approval_status === 'pending' && userRole === 'owner' && (
                            <>
                              <button
                                onClick={() => handleApprove(audit?.id)}
                                className="text-green-600 hover:text-green-700 transition-colors"
                                title="Aprobar"
                              >
                                <Icon name="CheckCircle" size={18} />
                              </button>
                              <button
                                onClick={() => handleReject(audit?.id)}
                                className="text-red-600 hover:text-red-700 transition-colors"
                                title="Rechazar"
                              >
                                <Icon name="XCircle" size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedAudit === audit?.id && (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 bg-muted/30">
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Tipo de Cambio</p>
                                <p className="text-sm text-foreground">{getChangeTypeLabel(audit?.change_type)}</p>
                              </div>
                              {audit?.staff_member && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Miembro del Personal</p>
                                  <p className="text-sm text-foreground">{audit?.staff_member?.full_name}</p>
                                  <p className="text-xs text-muted-foreground">{audit?.staff_member?.email}</p>
                                </div>
                              )}
                            </div>
                            {audit?.notes && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Notas</p>
                                <p className="text-sm text-foreground">{audit?.notes}</p>
                              </div>
                            )}
                            {audit?.approved_by_user && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Aprobado/Rechazado por</p>
                                <p className="text-sm text-foreground">{audit?.approved_by_user?.full_name}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(audit?.approved_at)}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditTrail;