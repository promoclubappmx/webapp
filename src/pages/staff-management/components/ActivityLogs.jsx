import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const ActivityLogs = ({ userRole }) => {
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('today');

  // Mock activity logs
  const activityLogs = [
    {
      id: 'log1',
      staffName: 'María González',
      activityType: 'login',
      description: 'Inicio de sesión exitoso',
      timestamp: '2024-12-17T10:30:00Z',
      ipAddress: '192.168.1.100',
      metadata: {}
    },
    {
      id: 'log2',
      staffName: 'Juan Pérez',
      activityType: 'sale',
      description: 'Procesó venta #TXN-20241217-000045',
      timestamp: '2024-12-17T10:25:00Z',
      ipAddress: '192.168.1.101',
      metadata: { amount: 125.50, transactionId: 'TXN-20241217-000045' }
    },
    {
      id: 'log3',
      staffName: 'Ana Martínez',
      activityType: 'inventory_adjustment',
      description: 'Ajustó inventario: Paella Valenciana (+20 unidades)',
      timestamp: '2024-12-17T09:15:00Z',
      ipAddress: '192.168.1.102',
      metadata: { itemName: 'Paella Valenciana', quantity: 20 }
    },
    {
      id: 'log4',
      staffName: 'Juan Pérez',
      activityType: 'refund',
      description: 'Procesó reembolso #TXN-20241217-000042',
      timestamp: '2024-12-17T08:45:00Z',
      ipAddress: '192.168.1.101',
      metadata: { amount: 35.00, transactionId: 'TXN-20241217-000042' }
    },
    {
      id: 'log5',
      staffName: 'María González',
      activityType: 'permission_change',
      description: 'Modificó permisos del rol Manager',
      timestamp: '2024-12-17T08:00:00Z',
      ipAddress: '192.168.1.100',
      metadata: { role: 'manager' }
    }
  ];

  const getActivityIcon = (type) => {
    const icons = {
      login: 'LogIn',
      logout: 'LogOut',
      sale: 'ShoppingCart',
      refund: 'RotateCcw',
      inventory_adjustment: 'Package',
      permission_change: 'Shield',
      other: 'Activity'
    };
    return icons?.[type] || icons?.other;
  };

  const getActivityColor = (type) => {
    const colors = {
      login: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
      logout: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20',
      sale: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
      refund: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
      inventory_adjustment: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
      permission_change: 'text-red-600 bg-red-100 dark:bg-red-900/20',
      other: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    };
    return colors?.[type] || colors?.other;
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString)?.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredLogs = activityLogs?.filter(log => {
    const matchesType = filterType === 'all' || log?.activityType === filterType;
    const matchesSearch = log?.staffName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         log?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar en actividad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            iconName="Search"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e?.target?.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
        >
          <option value="all">Todas las actividades</option>
          <option value="login">Inicio de sesión</option>
          <option value="logout">Cierre de sesión</option>
          <option value="sale">Ventas</option>
          <option value="refund">Reembolsos</option>
          <option value="inventory_adjustment">Ajustes de inventario</option>
          <option value="permission_change">Cambios de permisos</option>
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e?.target?.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
        >
          <option value="today">Hoy</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
          <option value="all">Todo el tiempo</option>
        </select>
      </div>
      {/* Activity Timeline */}
      <div className="space-y-3">
        {filteredLogs?.map((log) => (
          <div key={log?.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                getActivityColor(log?.activityType)
              }`}>
                <Icon name={getActivityIcon(log?.activityType)} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{log?.staffName}</p>
                    <p className="text-sm text-muted-foreground mt-1">{log?.description}</p>
                    {log?.metadata && Object.keys(log?.metadata)?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {log?.metadata?.amount && (
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            Monto: ${log?.metadata?.amount?.toFixed(2)}
                          </span>
                        )}
                        {log?.metadata?.transactionId && (
                          <span className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {log?.metadata?.transactionId}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-muted-foreground">{formatDateTime(log?.timestamp)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{log?.ipAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredLogs?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Activity" size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No se encontró actividad</p>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;