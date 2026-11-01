import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RegionalSettings = () => {
  const [settings, setSettings] = useState({
    country: 'MX',
    timezone: 'America/Mexico_City',
    language: 'es-MX',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    weekStartsOn: 'monday',
    phoneFormat: 'mexican',
    addressFormat: 'mexican'
  });
  const [originalSettings] = useState({
    country: 'MX',
    timezone: 'America/Mexico_City',
    language: 'es-MX',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    weekStartsOn: 'monday',
    phoneFormat: 'mexican',
    addressFormat: 'mexican'
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const countries = [
    { code: 'MX', name: 'México', flag: '🇲🇽' },
    { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
    { code: 'ES', name: 'España', flag: '🇪🇸' }
  ];

  const timezones = [
    { value: 'America/Mexico_City', label: 'Ciudad de México (UTC-6)' },
    { value: 'America/Cancun', label: 'Cancún (UTC-5)' },
    { value: 'America/Tijuana', label: 'Tijuana (UTC-8)' },
    { value: 'America/Hermosillo', label: 'Hermosillo (UTC-7)' }
  ];

  const languages = [
    { code: 'es-MX', name: 'Español (México)' },
    { code: 'en-US', name: 'English (US)' },
    { code: 'es-ES', name: 'Español (España)' }
  ];

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => {
    setSettings(originalSettings);
  };

  const formatPreviewDate = () => {
    const now = new Date();
    switch (settings?.dateFormat) {
      case 'DD/MM/YYYY':
        return now?.toLocaleDateString('es-MX');
      case 'MM/DD/YYYY':
        return now?.toLocaleDateString('en-US');
      case 'YYYY-MM-DD':
        return now?.toISOString()?.split('T')?.[0];
      default:
        return now?.toLocaleDateString('es-MX');
    }
  };

  const formatPreviewTime = () => {
    const now = new Date();
    if (settings?.timeFormat === '24h') {
      return now?.toLocaleTimeString('es-MX', { hour12: false });
    }
    return now?.toLocaleTimeString('es-MX', { hour12: true });
  };

  return (
    <div className="space-y-8">
      {/* Location Settings Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-6">Ubicación y Zona Horaria</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              País
            </label>
            <select
              value={settings?.country}
              onChange={(e) => handleSettingChange('country', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              {countries?.map((country) => (
                <option key={country?.code} value={country?.code}>
                  {country?.flag} {country?.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Zona Horaria
            </label>
            <select
              value={settings?.timezone}
              onChange={(e) => handleSettingChange('timezone', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              {timezones?.map((tz) => (
                <option key={tz?.value} value={tz?.value}>
                  {tz?.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <Icon name="Info" size={16} className="text-blue-600 mr-2" />
            <span className="text-blue-800 text-sm">
              Zona horaria actual: {new Date()?.toLocaleString('es-MX', { 
                timeZone: settings?.timezone,
                timeZoneName: 'short' 
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Language Settings Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-6">Idioma y Localización</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Idioma Principal
            </label>
            <select
              value={settings?.language}
              onChange={(e) => handleSettingChange('language', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              {languages?.map((lang) => (
                <option key={lang?.code} value={lang?.code}>
                  {lang?.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Formato de Teléfono
            </label>
            <select
              value={settings?.phoneFormat}
              onChange={(e) => handleSettingChange('phoneFormat', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              <option value="mexican">México (+52) 55-1234-5678</option>
              <option value="international">Internacional +52-55-1234-5678</option>
              <option value="local">Local 55-1234-5678</option>
            </select>
          </div>
        </div>
      </div>

      {/* Date & Time Format Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-6">Formato de Fecha y Hora</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Formato de Fecha
            </label>
            <select
              value={settings?.dateFormat}
              onChange={(e) => handleSettingChange('dateFormat', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (Mexicano)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (Americano)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Formato de Hora
            </label>
            <select
              value={settings?.timeFormat}
              onChange={(e) => handleSettingChange('timeFormat', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              <option value="24h">24 Horas (14:30)</option>
              <option value="12h">12 Horas (2:30 PM)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Inicio de Semana
            </label>
            <select
              value={settings?.weekStartsOn}
              onChange={(e) => handleSettingChange('weekStartsOn', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              <option value="sunday">Domingo</option>
              <option value="monday">Lunes</option>
            </select>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-foreground">Fecha:</span>
              <span className="ml-2 text-foreground">{formatPreviewDate()}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">Hora:</span>
              <span className="ml-2 text-foreground">{formatPreviewTime()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Address Format Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-6">Formato de Direcciones</h3>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Formato de Dirección
          </label>
          <select
            value={settings?.addressFormat}
            onChange={(e) => handleSettingChange('addressFormat', e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
          >
            <option value="mexican">México (Calle, Número, Colonia, CP, Ciudad, Estado)</option>
            <option value="us">Estados Unidos (Street, City, State, ZIP)</option>
            <option value="international">Internacional</option>
          </select>
        </div>

        {settings?.addressFormat === 'mexican' && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Formato Mexicano:</h4>
            <div className="text-sm text-blue-700">
              <div>Calle y Número Exterior e Interior</div>
              <div>Colonia, Delegación/Municipio</div>
              <div>Código Postal, Ciudad, Estado</div>
            </div>
          </div>
        )}
      </div>

      {/* Save / Cancel */}
      <div className="flex items-center justify-between pt-2">
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-green-50 border border-green-200 text-green-800">
            <Icon name="CheckCircle" size={16} />
            Configuración regional guardada
          </div>
        )}
        <div className="ml-auto flex gap-3">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
            iconName={saved ? 'Check' : 'Save'}
            iconPosition="left"
            variant={saved ? 'secondary' : 'default'}
          >
            {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegionalSettings;