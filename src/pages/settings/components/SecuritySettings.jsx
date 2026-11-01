import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const SecuritySettings = () => {
  const [passwordSettings, setPasswordSettings] = useState({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: false,
    passwordExpiry: 90,
    preventReuse: 5
  });

  const [twoFactorSettings, setTwoFactorSettings] = useState({
    enabled: false,
    method: 'totp', // totp, sms, email
    backupCodes: [],
    lastUsed: null
  });

  const [sessionSettings, setSessionSettings] = useState({
    sessionTimeout: 120, // minutes
    maxConcurrentSessions: 3,
    allowRememberMe: true,
    requireReauthForSensitive: true
  });

  const [auditSettings, setAuditSettings] = useState({
    logLoginAttempts: true,
    logDataChanges: true,
    logConfigChanges: true,
    retentionDays: 365,
    alertFailedLogins: 5
  });

  const [accessSettings, setAccessSettings] = useState({
    allowedIpRanges: [''],
    blockVpn: false,
    blockTor: true,
    geoBlocking: false,
    allowedCountries: ['MX']
  });

  const handlePasswordChange = (key, value) => {
    setPasswordSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTwoFactorChange = (key, value) => {
    setTwoFactorSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSessionChange = (key, value) => {
    setSessionSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAuditChange = (key, value) => {
    setAuditSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAccessChange = (key, value) => {
    setAccessSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const SecurityToggle = ({ checked, onChange, disabled = false }) => (
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

  const generateBackupCodes = () => {
    const codes = Array.from({ length: 8 }, () => {
      return Math.random()?.toString(36)?.substr(2, 8)?.toUpperCase();
    });
    setTwoFactorSettings(prev => ({
      ...prev,
      backupCodes: codes
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Configuración de Seguridad</h2>
        <p className="text-muted-foreground mt-1">
          Configura las políticas de seguridad y autenticación
        </p>
      </div>
      {/* Password Policy */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-6">Política de Contraseñas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Longitud Mínima
            </label>
            <select
              value={passwordSettings?.minLength}
              onChange={(e) => handlePasswordChange('minLength', parseInt(e?.target?.value))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              <option value={6}>6 caracteres</option>
              <option value={8}>8 caracteres</option>
              <option value={10}>10 caracteres</option>
              <option value={12}>12 caracteres</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Expiración de Contraseña (días)
            </label>
            <select
              value={passwordSettings?.passwordExpiry}
              onChange={(e) => handlePasswordChange('passwordExpiry', parseInt(e?.target?.value))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              <option value={30}>30 días</option>
              <option value={60}>60 días</option>
              <option value={90}>90 días</option>
              <option value={180}>180 días</option>
              <option value={0}>Nunca expira</option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Requerir Mayúsculas</div>
              <div className="text-xs text-muted-foreground">Al menos una letra mayúscula</div>
            </div>
            <SecurityToggle
              checked={passwordSettings?.requireUppercase}
              onChange={(value) => handlePasswordChange('requireUppercase', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Requerir Minúsculas</div>
              <div className="text-xs text-muted-foreground">Al menos una letra minúscula</div>
            </div>
            <SecurityToggle
              checked={passwordSettings?.requireLowercase}
              onChange={(value) => handlePasswordChange('requireLowercase', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Requerir Números</div>
              <div className="text-xs text-muted-foreground">Al menos un dígito</div>
            </div>
            <SecurityToggle
              checked={passwordSettings?.requireNumbers}
              onChange={(value) => handlePasswordChange('requireNumbers', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Requerir Símbolos</div>
              <div className="text-xs text-muted-foreground">Al menos un carácter especial</div>
            </div>
            <SecurityToggle
              checked={passwordSettings?.requireSymbols}
              onChange={(value) => handlePasswordChange('requireSymbols', value)}
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <Icon name="Info" size={16} className="text-blue-600 mr-2" />
            <div className="text-blue-800 text-sm">
              <strong>Ejemplo de contraseña válida:</strong> MiContra123
            </div>
          </div>
        </div>
      </div>
      {/* Two-Factor Authentication */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-6">Autenticación de Dos Factores</h3>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm font-medium text-foreground">Habilitar 2FA</div>
            <div className="text-xs text-muted-foreground">
              Añade una capa extra de seguridad a tu cuenta
            </div>
          </div>
          <SecurityToggle
            checked={twoFactorSettings?.enabled}
            onChange={(value) => handleTwoFactorChange('enabled', value)}
          />
        </div>

        {twoFactorSettings?.enabled && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Método de Verificación
              </label>
              <select
                value={twoFactorSettings?.method}
                onChange={(e) => handleTwoFactorChange('method', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              >
                <option value="totp">Aplicación Autenticadora (TOTP)</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-foreground">Códigos de Respaldo</h4>
                  <p className="text-sm text-muted-foreground">
                    Úsalos si no tienes acceso a tu método principal de 2FA
                  </p>
                </div>
                <button
                  onClick={generateBackupCodes}
                  className="bg-secondary text-secondary-foreground px-3 py-1 rounded-lg hover:bg-secondary/80 transition-colors duration-200"
                >
                  Generar Códigos
                </button>
              </div>

              {twoFactorSettings?.backupCodes?.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {twoFactorSettings?.backupCodes?.map((code, index) => (
                    <div
                      key={index}
                      className="bg-muted p-2 rounded text-center font-mono text-sm"
                    >
                      {code}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Session Management */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-6">Gestión de Sesiones</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tiempo de Sesión (minutos)
            </label>
            <select
              value={sessionSettings?.sessionTimeout}
              onChange={(e) => handleSessionChange('sessionTimeout', parseInt(e?.target?.value))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={60}>1 hora</option>
              <option value={120}>2 horas</option>
              <option value={480}>8 horas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Sesiones Concurrentes
            </label>
            <select
              value={sessionSettings?.maxConcurrentSessions}
              onChange={(e) => handleSessionChange('maxConcurrentSessions', parseInt(e?.target?.value))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              <option value={1}>1 sesión</option>
              <option value={2}>2 sesiones</option>
              <option value={3}>3 sesiones</option>
              <option value={5}>5 sesiones</option>
              <option value={0}>Ilimitado</option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Permitir "Recordarme"</div>
              <div className="text-xs text-muted-foreground">Los usuarios pueden mantener sesiones extendidas</div>
            </div>
            <SecurityToggle
              checked={sessionSettings?.allowRememberMe}
              onChange={(value) => handleSessionChange('allowRememberMe', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Reautenticación para Acciones Sensibles</div>
              <div className="text-xs text-muted-foreground">Requerir contraseña para cambios críticos</div>
            </div>
            <SecurityToggle
              checked={sessionSettings?.requireReauthForSensitive}
              onChange={(value) => handleSessionChange('requireReauthForSensitive', value)}
            />
          </div>
        </div>
      </div>
      {/* Audit & Monitoring */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-6">Auditoría y Monitoreo</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Retención de Logs (días)
            </label>
            <select
              value={auditSettings?.retentionDays}
              onChange={(e) => handleAuditChange('retentionDays', parseInt(e?.target?.value))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              <option value={30}>30 días</option>
              <option value={90}>90 días</option>
              <option value={180}>180 días</option>
              <option value={365}>1 año</option>
              <option value={730}>2 años</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Alertar tras Intentos Fallidos
            </label>
            <select
              value={auditSettings?.alertFailedLogins}
              onChange={(e) => handleAuditChange('alertFailedLogins', parseInt(e?.target?.value))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              <option value={3}>3 intentos</option>
              <option value={5}>5 intentos</option>
              <option value={10}>10 intentos</option>
              <option value={0}>Deshabilitado</option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Registrar Intentos de Inicio de Sesión</div>
              <div className="text-xs text-muted-foreground">Guarda todos los intentos exitosos y fallidos</div>
            </div>
            <SecurityToggle
              checked={auditSettings?.logLoginAttempts}
              onChange={(value) => handleAuditChange('logLoginAttempts', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Registrar Cambios de Datos</div>
              <div className="text-xs text-muted-foreground">Audita modificaciones en promociones, cupones, etc.</div>
            </div>
            <SecurityToggle
              checked={auditSettings?.logDataChanges}
              onChange={(value) => handleAuditChange('logDataChanges', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Registrar Cambios de Configuración</div>
              <div className="text-xs text-muted-foreground">Audita cambios en configuraciones del sistema</div>
            </div>
            <SecurityToggle
              checked={auditSettings?.logConfigChanges}
              onChange={(value) => handleAuditChange('logConfigChanges', value)}
            />
          </div>
        </div>
      </div>
      {/* Access Control */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-6">Control de Acceso</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Rangos de IP Permitidos
            </label>
            <input
              type="text"
              value={accessSettings?.allowedIpRanges?.[0]}
              onChange={(e) => handleAccessChange('allowedIpRanges', [e?.target?.value])}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              placeholder="192.168.1.0/24 o dejar vacío para permitir todas"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Usar notación CIDR. Dejar vacío permite acceso desde cualquier IP.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-foreground">Bloquear VPN</div>
                <div className="text-xs text-muted-foreground">Impedir acceso desde servicios VPN conocidos</div>
              </div>
              <SecurityToggle
                checked={accessSettings?.blockVpn}
                onChange={(value) => handleAccessChange('blockVpn', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-foreground">Bloquear Tor</div>
                <div className="text-xs text-muted-foreground">Impedir acceso desde la red Tor</div>
              </div>
              <SecurityToggle
                checked={accessSettings?.blockTor}
                onChange={(value) => handleAccessChange('blockTor', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-foreground">Restricción Geográfica</div>
                <div className="text-xs text-muted-foreground">Limitar acceso por ubicación geográfica</div>
              </div>
              <SecurityToggle
                checked={accessSettings?.geoBlocking}
                onChange={(value) => handleAccessChange('geoBlocking', value)}
              />
            </div>
          </div>

          {accessSettings?.geoBlocking && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Países Permitidos
              </label>
              <select
                multiple
                value={accessSettings?.allowedCountries}
                onChange={(e) => {
                  const values = Array.from(e?.target?.selectedOptions, option => option?.value);
                  handleAccessChange('allowedCountries', values);
                }}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                size={4}
              >
                <option value="MX">🇲🇽 México</option>
                <option value="US">🇺🇸 Estados Unidos</option>
                <option value="CA">🇨🇦 Canadá</option>
                <option value="ES">🇪🇸 España</option>
                <option value="AR">🇦🇷 Argentina</option>
                <option value="CO">🇨🇴 Colombia</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples países
              </p>
            </div>
          )}
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

export default SecuritySettings;