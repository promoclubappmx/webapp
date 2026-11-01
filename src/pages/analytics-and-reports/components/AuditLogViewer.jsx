import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AuditLogViewer = ({ auditLogs }) => {
  const [selectedLog, setSelectedLog] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const logTypes = [
    { value: 'all', label: 'Todos los eventos', icon: 'List' },
    { value: 'user', label: 'Actividad de usuario', icon: 'User' },
    { value: 'system', label: 'Eventos del sistema', icon: 'Settings' },
    { value: 'business', label: 'Cambios de negocio', icon: 'Building2' },
    { value: 'promotion', label: 'Promociones', icon: 'Megaphone' }
  ];

  const getLogIcon = (type) => {
    const iconMap = {
      user: 'User',
      system: 'Settings',
      business: 'Building2',
      promotion: 'Megaphone',
      coupon: 'Ticket',
      loyalty: 'Star'
    };
    return iconMap?.[type] || 'Activity';
  };

  const getLogColor = (severity) => {
    const colorMap = {
      info: 'text-primary',
      warning: 'text-warning',
      error: 'text-destructive',
      success: 'text-success'
    };
    return colorMap?.[severity] || 'text-muted-foreground';
  };

  const filteredLogs = filterType === 'all' 
    ? auditLogs 
    : auditLogs?.filter(log => log?.type === filterType);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp)?.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Registro de Auditoría</h3>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" iconName="Download">
              Exportar
            </Button>
            <Button variant="outline" size="sm" iconName="RefreshCw">
              Actualizar
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          {logTypes?.map((type) => (
            <button
              key={type?.value}
              onClick={() => setFilterType(type?.value)}
              className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                filterType === type?.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={type?.icon} size={16} />
              <span className="hidden sm:inline">{type?.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {filteredLogs?.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="FileX" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay eventos para mostrar</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredLogs?.map((log) => (
              <div
                key={log?.id}
                className="p-4 hover:bg-muted/50 cursor-pointer transition-colors duration-150"
                onClick={() => setSelectedLog(log)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    log?.severity === 'error' ? 'bg-destructive/10' :
                    log?.severity === 'warning' ? 'bg-warning/10' :
                    log?.severity === 'success'? 'bg-success/10' : 'bg-primary/10'
                  }`}>
                    <Icon 
                      name={getLogIcon(log?.type)} 
                      size={16} 
                      className={getLogColor(log?.severity)}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground truncate">
                        {log?.action}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(log?.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      {log?.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-muted-foreground">
                        Usuario: {log?.user}
                      </span>
                      {log?.ipAddress && (
                        <span className="text-xs text-muted-foreground">
                          IP: {log?.ipAddress}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        log?.severity === 'error' ? 'bg-destructive/10 text-destructive' :
                        log?.severity === 'warning' ? 'bg-warning/10 text-warning' :
                        log?.severity === 'success'? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                      }`}>
                        {log?.severity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Log Detail Modal */}
      {selectedLog && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSelectedLog(null)}
          />
          <div className="fixed inset-4 md:inset-8 bg-popover border border-border rounded-lg z-50 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h4 className="text-lg font-semibold text-foreground">Detalle del Evento</h4>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-muted rounded-md transition-colors duration-150"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Acción</label>
                  <p className="text-foreground">{selectedLog?.action}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                  <p className="text-foreground">{selectedLog?.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Usuario</label>
                    <p className="text-foreground">{selectedLog?.user}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                    <p className="text-foreground">{formatTimestamp(selectedLog?.timestamp)}</p>
                  </div>
                </div>
                
                {selectedLog?.metadata && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Metadatos</label>
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                      {JSON.stringify(selectedLog?.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AuditLogViewer;