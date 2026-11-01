import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString)?.toLocaleString('es-ES', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const ActivityTab = ({ selectedLocation }) => {
  const { user: authUser } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('today');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let query = supabase
        ?.from('staff_activity_logs')
        ?.select('*')
        ?.order('created_at', { ascending: false })
        ?.limit(100);

      if (selectedLocation && selectedLocation !== 'all') {
        query = query?.eq('business_id', selectedLocation);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLogs(data || []);
    } catch (e) {
      console.error('Error fetching activity logs:', e);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [selectedLocation]);

  const getActivityIcon = (type) => {
    const icons = { login: 'LogIn', logout: 'LogOut', sale: 'ShoppingCart', refund: 'RotateCcw', inventory_adjustment: 'Package', permission_change: 'Shield', other: 'Activity' };
    return icons?.[type] || icons?.other;
  };

  const getActivityColor = (type) => {
    const colors = { login: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20', logout: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20', sale: 'text-green-600 bg-green-100 dark:bg-green-900/20', refund: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20', inventory_adjustment: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20', permission_change: 'text-red-600 bg-red-100 dark:bg-red-900/20', other: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20' };
    return colors?.[type] || colors?.other;
  };

  const filteredLogs = logs?.filter(log => {
    const matchesType = filterType === 'all' || log?.activity_type === filterType;
    const matchesSearch = !searchTerm ||
      log?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <Input placeholder="Buscar en actividad..." value={searchTerm} onChange={e => setSearchTerm(e?.target?.value)} iconName="Search" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e?.target?.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none">
          <option value="all">Todas las actividades</option>
          <option value="login">Inicio de sesión</option>
          <option value="logout">Cierre de sesión</option>
          <option value="sale">Ventas</option>
          <option value="refund">Reembolsos</option>
          <option value="inventory_adjustment">Ajustes de inventario</option>
          <option value="permission_change">Cambios de permisos</option>
        </select>
        <select value={dateRange} onChange={e => setDateRange(e?.target?.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none">
          <option value="today">Hoy</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
          <option value="all">Todo el tiempo</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredLogs?.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="Activity" size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No se encontró actividad</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs?.map(log => (
            <div key={log?.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityColor(log?.activity_type)}`}>
                  <Icon name={getActivityIcon(log?.activity_type)} size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{log?.description || 'Actividad registrada'}</p>
                      <p className="text-xs text-muted-foreground mt-1">{log?.activity_type}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-muted-foreground">{formatDateTime(log?.created_at)}</p>
                      {log?.ip_address && <p className="text-xs text-muted-foreground mt-1">{log?.ip_address}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AuditTab = ({ selectedLocation }) => {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAudits = async () => {
    try {
      setLoading(true);
      let query = supabase
        ?.from('permission_audits')
        ?.select('*')
        ?.order('created_at', { ascending: false })
        ?.limit(100);

      if (selectedLocation && selectedLocation !== 'all') {
        query = query?.eq('business_id', selectedLocation);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAudits(data || []);
    } catch (e) {
      console.error('Error fetching audits:', e);
      setAudits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAudits(); }, [selectedLocation]);

  const getStatusBadge = (status) => {
    const cfg = {
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    };
    const labels = { approved: 'Aprobado', pending: 'Pendiente', rejected: 'Rechazado' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg?.[status] || cfg?.pending}`}>
        {labels?.[status] || status}
      </span>
    );
  };

  const filteredAudits = audits?.filter(a => {
    const matchesRole = filterRole === 'all' || a?.staff_role === filterRole;
    const matchesStatus = filterStatus === 'all' || a?.approval_status === filterStatus;
    const matchesSearch = !searchTerm ||
      a?.permission_field?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      a?.staff_role?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <Input placeholder="Buscar en auditoría..." value={searchTerm} onChange={e => setSearchTerm(e?.target?.value)} iconName="Search" />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e?.target?.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none">
          <option value="all">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="manager">Gerente</option>
          <option value="cashier">Cajero</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e?.target?.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none">
          <option value="all">Todos los estados</option>
          <option value="approved">Aprobado</option>
          <option value="pending">Pendiente</option>
          <option value="rejected">Rechazado</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredAudits?.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="ClipboardList" size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No hay registros de auditoría</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  {['Rol', 'Permiso', 'Cambio', 'Estado', 'Fecha']?.map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAudits?.map(audit => (
                  <tr key={audit?.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-sm text-foreground">{audit?.staff_role}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{audit?.permission_field}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="text-red-500">{String(audit?.old_value)}</span>
                      <Icon name="ArrowRight" size={12} className="inline mx-1 text-muted-foreground" />
                      <span className="text-green-500">{String(audit?.new_value)}</span>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(audit?.approval_status)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTime(audit?.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const ActividadAuditoriaSection = () => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('actividad');
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');

  useEffect(() => {
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
    fetchLocations();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Actividad y Auditoría</h2>
          <p className="text-sm text-muted-foreground mt-1">Monitorea la actividad del personal y los cambios de permisos</p>
        </div>
        {/* Establishment filter */}
        <div className="flex items-center gap-2">
          <Icon name="Building2" size={16} className="text-muted-foreground" />
          <select value={selectedLocation} onChange={e => setSelectedLocation(e?.target?.value)}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="all">Todos los establecimientos</option>
            {locations?.map(l => (
              <option key={l?.id} value={l?.id}>{l?.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Horizontal tabs */}
      <div className="flex border-b border-border">
        {[{ key: 'actividad', label: 'Actividad', icon: 'Activity' }, { key: 'auditoria', label: 'Auditoría', icon: 'ClipboardList' }]?.map(tab => (
          <button key={tab?.key} onClick={() => setActiveTab(tab?.key)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab?.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}>
            <Icon name={tab?.icon} size={16} />
            {tab?.label}
          </button>
        ))}
      </div>

      {activeTab === 'actividad' && <ActivityTab selectedLocation={selectedLocation} />}
      {activeTab === 'auditoria' && <AuditTab selectedLocation={selectedLocation} />}
    </div>
  );
};

export default ActividadAuditoriaSection;
