import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { NUMBER_FORMAT_PRESETS, formatCurrency } from '../../../utils/currencyFormatter';
import Button from '../../../components/ui/Button';

const CurrencySettings = () => {
  const { currencySettings, updateCurrencySettings } = useCurrency();
  const [settings, setSettings] = useState(currencySettings);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [previewAmount] = useState(1234.56);

  const currencies = [
    { code: 'MXN', name: 'Peso Mexicano', symbol: '$' },
    { code: 'USD', name: 'Dólar Estadounidense', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'Libra Esterlina', symbol: '£' },
    { code: 'COP', name: 'Peso Colombiano', symbol: '$' },
    { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
    { code: 'CLP', name: 'Peso Chileno', symbol: '$' },
    { code: 'PEN', name: 'Sol Peruano', symbol: 'S/' },
    { code: 'BRL', name: 'Real Brasileño', symbol: 'R$' },
  ];

  useEffect(() => {
    setSettings(currencySettings);
  }, [currencySettings]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleNumberFormatChange = (formatKey) => {
    const preset = NUMBER_FORMAT_PRESETS?.[formatKey];
    if (preset) {
      setSettings(prev => ({
        ...prev,
        numberFormat: formatKey,
        thousandsSeparator: preset?.thousandsSeparator,
        decimalSeparator: preset?.decimalSeparator
      }));
    }
  };

  const handleCurrencyChange = (code) => {
    const currency = currencies?.find(c => c?.code === code);
    setSettings(prev => ({
      ...prev,
      defaultCurrency: code,
      currencySymbol: currency?.symbol || '$'
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');
    const { error } = await updateCurrencySettings(settings);
    setSaving(false);
    if (error) {
      setSaveMessage('Error al guardar. Intenta de nuevo.');
    } else {
      setSaveMessage('Configuración guardada correctamente.');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const previewFormatted = formatCurrency(previewAmount, settings);

  return (
    <div className="space-y-8">
      {/* Currency Selection Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-foreground">Moneda Principal</h3>
            <p className="text-muted-foreground text-sm">Selecciona la moneda y símbolo para toda la plataforma</p>
          </div>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {settings?.defaultCurrency} Activo
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Moneda por Defecto</label>
            <select
              value={settings?.defaultCurrency}
              onChange={(e) => handleCurrencyChange(e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              {currencies?.map((currency) => (
                <option key={currency?.code} value={currency?.code}>
                  {currency?.code} - {currency?.name} ({currency?.symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Símbolo de Moneda</label>
            <input
              type="text"
              value={settings?.currencySymbol || '$'}
              onChange={(e) => handleSettingChange('currencySymbol', e?.target?.value)}
              maxLength={5}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              placeholder="$"
            />
            <p className="text-xs text-muted-foreground mt-1">Puedes personalizar el símbolo</p>
          </div>
        </div>
      </div>
      {/* Number Format Presets */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-2">Formato de Números</h3>
        <p className="text-muted-foreground text-sm mb-6">Selecciona el formato regional para mostrar los números</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {Object.entries(NUMBER_FORMAT_PRESETS)?.map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handleNumberFormatChange(key)}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                settings?.numberFormat === key
                  ? 'border-primary bg-primary/5 text-primary' :'border-border hover:border-primary/50 text-foreground'
              }`}
            >
              <div className="font-bold text-sm mb-1">{key}</div>
              <div className="text-xs text-muted-foreground">{preset?.label}</div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Separador de Miles</label>
            <select
              value={settings?.thousandsSeparator}
              onChange={(e) => handleSettingChange('thousandsSeparator', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              <option value=",">Coma (,) — 1,234</option>
              <option value=".">Punto (.) — 1.234</option>
              <option value=" ">Espacio ( ) — 1 234</option>
              <option value="">Sin separador — 1234</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Separador Decimal</label>
            <select
              value={settings?.decimalSeparator}
              onChange={(e) => handleSettingChange('decimalSeparator', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              <option value=".">Punto (.) — 1.56</option>
              <option value=",">Coma (,) — 1,56</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Decimales</label>
            <select
              value={settings?.decimalPlaces}
              onChange={(e) => handleSettingChange('decimalPlaces', parseInt(e?.target?.value))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              <option value={0}>0 decimales</option>
              <option value={1}>1 decimal</option>
              <option value={2}>2 decimales</option>
              <option value={3}>3 decimales</option>
            </select>
          </div>
        </div>
      </div>
      {/* Symbol Position Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-6">Posición del Símbolo</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Posición del Símbolo de Moneda</label>
            <select
              value={settings?.currencyPosition}
              onChange={(e) => handleSettingChange('currencyPosition', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              <option value="before">Antes del monto ($1,234.56)</option>
              <option value="after">Después del monto (1,234.56 $)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Espacio entre Símbolo y Número</label>
            <select
              value={settings?.symbolSpace ? 'yes' : 'no'}
              onChange={(e) => handleSettingChange('symbolSpace', e?.target?.value === 'yes')}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            >
              <option value="no">Sin espacio ($1,234.56)</option>
              <option value="yes">Con espacio ($ 1,234.56)</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-foreground">Mostrar Símbolo de Moneda</label>
            <p className="text-xs text-muted-foreground">Mostrar el símbolo junto a los precios</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings?.showCurrencySymbol}
              onChange={(e) => handleSettingChange('showCurrencySymbol', e?.target?.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>
      {/* Tax Settings Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-6">Configuración de Impuestos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-foreground">Precios incluyen impuestos (IVA)</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.taxIncluded}
                  onChange={(e) => handleSettingChange('taxIncluded', e?.target?.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <p className="text-xs text-muted-foreground">Los precios mostrados incluirán el IVA</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tasa de IVA (%)</label>
            <input
              type="number"
              value={settings?.taxRate}
              onChange={(e) => handleSettingChange('taxRate', parseFloat(e?.target?.value) || 0)}
              min="0" max="100" step="0.1"
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              placeholder="16"
            />
            <p className="text-xs text-muted-foreground mt-1">Tasa de IVA estándar en México: 16%</p>
          </div>
        </div>
      </div>
      {/* Preview Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-4">Vista Previa del Formato</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground mb-2">Precio normal</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(1234.56, settings)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground mb-2">Precio pequeño</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(9.99, settings)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground mb-2">Precio grande</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(1250000, settings)}</p>
          </div>
        </div>
      </div>
      {/* Save Button */}
      <div className="flex items-center justify-between pt-2">
        {saveMessage && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
            saveMessage?.includes('Error')
              ? 'bg-destructive/10 border border-destructive text-destructive' :'bg-green-50 border border-green-200 text-green-800'
          }`}>
            <Icon name={saveMessage?.includes('Error') ? 'AlertCircle' : 'CheckCircle'} size={16} />
            {saveMessage}
          </div>
        )}
        <div className="ml-auto flex gap-3">
          <Button
            variant="outline"
            onClick={() => setSettings(currencySettings)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
            iconName="Save"
            iconPosition="left"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CurrencySettings;