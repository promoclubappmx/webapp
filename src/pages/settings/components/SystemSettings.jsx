import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const SystemSettings = () => {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'PromoSpot',
    siteUrl: 'https://promospot.mx',
    adminEmail: 'admin@promospot.mx',
    supportEmail: 'soporte@promospot.mx',
    maintenanceMode: false,
    maintenanceMessage: 'Sitio en mantenimiento. Volvemos pronto.',
    debugMode: false,
    logLevel: 'info'
  });

  const [performanceSettings, setPerformanceSettings] = useState({
    cacheEnabled: true,
    cacheTimeout: 3600,
    compressionEnabled: true,
    imageOptimization: true,
    lazyLoading: true,
    cdnEnabled: false,
    cdnUrl: ''
  });

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    lastBackup: '2024-10-09 03:00:00',
    backupLocation: 'cloud',
    encryptBackups: true
  });

  const [apiSettings, setApiSettings] = useState({
    rateLimit: 1000,
    rateLimitWindow: 3600,
    apiVersion: 'v1',
    corsEnabled: true,
    allowedOrigins: ['https://promospot.mx'],
    apiDocumentation: true
  });

  const [storageSettings, setStorageSettings] = useState({
    maxFileSize: 10, // MB
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf'],
    storageQuota: 1000, // MB
    currentUsage: 245, // MB
    autoCleanup: true,
    cleanupDays: 90
  });

  const handleGeneralChange = (key, value) => {
    setGeneralSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePerformanceChange = (key, value) => {
    setPerformanceSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleBackupChange = (key, value) => {
    setBackupSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApiChange = (key, value) => {
    setApiSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleStorageChange = (key, value) => {
    setStorageSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const SystemToggle = ({ checked, onChange, disabled = false }) => (
    <label className={`relative inline-flex items-center cursor-pointer ${disabled ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e?.target?.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-disabled:opacity-50"></div>
    </label>
  );

  const triggerBackup = () => {
    // Mock backup function
    alert('Respaldo manual iniciado. Recibirás una notificación cuando termine.');
  };

  const clearCache = () => {
    // Mock cache clear function
    alert('Caché del sistema limpiado exitosamente.');
  };

  const getStorageUsagePercentage = () => {
    return (storageSettings?.currentUsage / storageSettings?.storageQuota) * 100;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Configuración del Sistema</h2>
        <p className="text-muted-foreground mt-1">
          Configura los ajustes generales del sistema y rendimiento
        </p>
      </div>
      {/* General Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-6">Configuración General</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nombre del Sitio
            </label>
            <input
              type="text"
              value={generalSettings?.siteName}
              onChange={(e) => handleGeneralChange('siteName', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              URL del Sitio
            </label>
            <input
              type="url"
              value={generalSettings?.siteUrl}
              onChange={(e) => handleGeneralChange('siteUrl', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email del Administrador
            </label>
            <input
              type="email"
              value={generalSettings?.adminEmail}
              onChange={(e) => handleGeneralChange('adminEmail', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email de Soporte
            </label>
            <input
              type="email"
              value={generalSettings?.supportEmail}
              onChange={(e) => handleGeneralChange('supportEmail', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Modo Mantenimiento</div>
              <div className="text-xs text-muted-foreground">Bloquea el acceso al sitio para usuarios</div>
            </div>
            <SystemToggle
              checked={generalSettings?.maintenanceMode}
              onChange={(value) => handleGeneralChange('maintenanceMode', value)}
            />
          </div>

          {generalSettings?.maintenanceMode && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mensaje de Mantenimiento
              </label>
              <textarea
                value={generalSettings?.maintenanceMessage}
                onChange={(e) => handleGeneralChange('maintenanceMessage', e?.target?.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Modo Debug</div>
              <div className="text-xs text-muted-foreground">Muestra información detallada de errores</div>
            </div>
            <SystemToggle
              checked={generalSettings?.debugMode}
              onChange={(value) => handleGeneralChange('debugMode', value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nivel de Registro
            </label>
            <select
              value={generalSettings?.logLevel}
              onChange={(e) => handleGeneralChange('logLevel', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>
        </div>
      </div>
      {/* Performance Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-6">Rendimiento</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tiempo de Caché (segundos)
            </label>
            <select
              value={performanceSettings?.cacheTimeout}
              onChange={(e) => handlePerformanceChange('cacheTimeout', parseInt(e?.target?.value))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              disabled={!performanceSettings?.cacheEnabled}
            >
              <option value={300}>5 minutos</option>
              <option value={900}>15 minutos</option>
              <option value={1800}>30 minutos</option>
              <option value={3600}>1 hora</option>
              <option value={7200}>2 horas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              URL del CDN
            </label>
            <input
              type="url"
              value={performanceSettings?.cdnUrl}
              onChange={(e) => handlePerformanceChange('cdnUrl', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              disabled={!performanceSettings?.cdnEnabled}
              placeholder="https://cdn.tudominio.com"
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Habilitar Caché</div>
              <div className="text-xs text-muted-foreground">Mejora la velocidad de carga</div>
            </div>
            <SystemToggle
              checked={performanceSettings?.cacheEnabled}
              onChange={(value) => handlePerformanceChange('cacheEnabled', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Compresión</div>
              <div className="text-xs text-muted-foreground">Comprime archivos para transferir menos datos</div>
            </div>
            <SystemToggle
              checked={performanceSettings?.compressionEnabled}
              onChange={(value) => handlePerformanceChange('compressionEnabled', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Optimización de Imágenes</div>
              <div className="text-xs text-muted-foreground">Reduce automáticamente el tamaño de las imágenes</div>
            </div>
            <SystemToggle
              checked={performanceSettings?.imageOptimization}
              onChange={(value) => handlePerformanceChange('imageOptimization', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Carga Diferida</div>
              <div className="text-xs text-muted-foreground">Carga el contenido solo cuando es necesario</div>
            </div>
            <SystemToggle
              checked={performanceSettings?.lazyLoading}
              onChange={(value) => handlePerformanceChange('lazyLoading', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">CDN</div>
              <div className="text-xs text-muted-foreground">Red de distribución de contenido</div>
            </div>
            <SystemToggle
              checked={performanceSettings?.cdnEnabled}
              onChange={(value) => handlePerformanceChange('cdnEnabled', value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={clearCache}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors duration-200 flex items-center"
          >
            <Icon name="RotateCcw" size={16} className="mr-2" />
            Limpiar Caché
          </button>
        </div>
      </div>
      {/* Backup Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-6">Respaldos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Frecuencia
            </label>
            <select
              value={backupSettings?.backupFrequency}
              onChange={(e) => handleBackupChange('backupFrequency', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              disabled={!backupSettings?.autoBackup}
            >
              <option value="hourly">Cada hora</option>
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Retención (días)
            </label>
            <select
              value={backupSettings?.backupRetention}
              onChange={(e) => handleBackupChange('backupRetention', parseInt(e?.target?.value))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              <option value={7}>7 días</option>
              <option value={14}>14 días</option>
              <option value={30}>30 días</option>
              <option value={90}>90 días</option>
              <option value={365}>1 año</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Ubicación
            </label>
            <select
              value={backupSettings?.backupLocation}
              onChange={(e) => handleBackupChange('backupLocation', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              <option value="local">Local</option>
              <option value="cloud">Nube</option>
              <option value="both">Ambos</option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Respaldo Automático</div>
              <div className="text-xs text-muted-foreground">Crea respaldos según la frecuencia configurada</div>
            </div>
            <SystemToggle
              checked={backupSettings?.autoBackup}
              onChange={(value) => handleBackupChange('autoBackup', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Encriptar Respaldos</div>
              <div className="text-xs text-muted-foreground">Protege los respaldos con encriptación</div>
            </div>
            <SystemToggle
              checked={backupSettings?.encryptBackups}
              onChange={(value) => handleBackupChange('encryptBackups', value)}
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Último Respaldo</div>
              <div className="text-xs text-muted-foreground">{backupSettings?.lastBackup}</div>
            </div>
            <button
              onClick={triggerBackup}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 flex items-center"
            >
              <Icon name="Database" size={16} className="mr-2" />
              Respaldar Ahora
            </button>
          </div>
        </div>
      </div>
      {/* Storage Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-6">Almacenamiento</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tamaño Máximo de Archivo (MB)
            </label>
            <select
              value={storageSettings?.maxFileSize}
              onChange={(e) => handleStorageChange('maxFileSize', parseInt(e?.target?.value))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              <option value={1}>1 MB</option>
              <option value={5}>5 MB</option>
              <option value={10}>10 MB</option>
              <option value={25}>25 MB</option>
              <option value={50}>50 MB</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Días para Limpieza Automática
            </label>
            <select
              value={storageSettings?.cleanupDays}
              onChange={(e) => handleStorageChange('cleanupDays', parseInt(e?.target?.value))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              disabled={!storageSettings?.autoCleanup}
            >
              <option value={30}>30 días</option>
              <option value={60}>60 días</option>
              <option value={90}>90 días</option>
              <option value={180}>180 días</option>
              <option value={365}>1 año</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Tipos de Archivo Permitidos
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt']?.map((type) => (
              <label key={type} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={storageSettings?.allowedFileTypes?.includes(type)}
                  onChange={(e) => {
                    if (e?.target?.checked) {
                      handleStorageChange('allowedFileTypes', [...storageSettings?.allowedFileTypes, type]);
                    } else {
                      handleStorageChange('allowedFileTypes', storageSettings?.allowedFileTypes?.filter(t => t !== type));
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm text-foreground uppercase">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Limpieza Automática</div>
              <div className="text-xs text-muted-foreground">Elimina archivos temporales automáticamente</div>
            </div>
            <SystemToggle
              checked={storageSettings?.autoCleanup}
              onChange={(value) => handleStorageChange('autoCleanup', value)}
            />
          </div>
        </div>

        {/* Storage Usage */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Uso de Almacenamiento</span>
            <span className="text-sm text-foreground">
              {storageSettings?.currentUsage} MB / {storageSettings?.storageQuota} MB
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                getStorageUsagePercentage() > 80 ? 'bg-red-500' :
                getStorageUsagePercentage() > 60 ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              style={{ width: `${getStorageUsagePercentage()}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {getStorageUsagePercentage()?.toFixed(1)}% utilizado
          </p>
        </div>
      </div>
      {/* API Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-6">Configuración de API</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Límite de Peticiones
            </label>
            <select
              value={apiSettings?.rateLimit}
              onChange={(e) => handleApiChange('rateLimit', parseInt(e?.target?.value))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              <option value={100}>100 por hora</option>
              <option value={500}>500 por hora</option>
              <option value={1000}>1000 por hora</option>
              <option value={5000}>5000 por hora</option>
              <option value={0}>Sin límite</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Ventana de Tiempo (segundos)
            </label>
            <select
              value={apiSettings?.rateLimitWindow}
              onChange={(e) => handleApiChange('rateLimitWindow', parseInt(e?.target?.value))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              <option value={60}>1 minuto</option>
              <option value={300}>5 minutos</option>
              <option value={900}>15 minutos</option>
              <option value={3600}>1 hora</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Versión de API
            </label>
            <select
              value={apiSettings?.apiVersion}
              onChange={(e) => handleApiChange('apiVersion', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              <option value="v1">v1</option>
              <option value="v2">v2</option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">CORS Habilitado</div>
              <div className="text-xs text-muted-foreground">Permite peticiones desde otros dominios</div>
            </div>
            <SystemToggle
              checked={apiSettings?.corsEnabled}
              onChange={(value) => handleApiChange('corsEnabled', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Documentación de API</div>
              <div className="text-xs text-muted-foreground">Expone la documentación automática</div>
            </div>
            <SystemToggle
              checked={apiSettings?.apiDocumentation}
              onChange={(value) => handleApiChange('apiDocumentation', value)}
            />
          </div>
        </div>
      </div>
      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-border">
        <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 flex items-center">
          <Icon name="Save" size={16} className="mr-2" />
          Guardar Configuración
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;