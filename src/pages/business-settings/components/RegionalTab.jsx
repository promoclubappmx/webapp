import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

const MEXICO_TIMEZONES = [
  { value: 'America/Mexico_City', label: 'Ciudad de México / Centro (UTC-6)' },
  { value: 'America/Cancun', label: 'Cancún / Sureste (UTC-5)' },
  { value: 'America/Tijuana', label: 'Tijuana / Noroeste (UTC-8)' },
  { value: 'America/Hermosillo', label: 'Hermosillo / Sonora (UTC-7)' },
  { value: 'America/Chihuahua', label: 'Chihuahua / Montaña (UTC-7)' },
  { value: 'America/Mazatlan', label: 'Mazatlán / Pacífico (UTC-7)' },
  { value: 'America/Monterrey', label: 'Monterrey / Noreste (UTC-6)' },
  { value: 'America/Merida', label: 'Mérida / Yucatán (UTC-6)' },
  { value: 'America/Bahia_Banderas', label: 'Bahía de Banderas (UTC-6)' },
  { value: 'America/Matamoros', label: 'Matamoros / Frontera Norte (UTC-6)' },
  { value: 'America/Ojinaga', label: 'Ojinaga / Chihuahua Frontera (UTC-7)' },
  { value: 'America/Santa_Isabel', label: 'Santa Isabel / Baja California Norte (UTC-8)' },
  { value: 'America/Ensenada', label: 'Ensenada / Baja California (UTC-8)' },
];

const CURRENCIES = [
  { code: 'MXN', name: 'Peso Mexicano', symbol: '$', locale: 'es-MX' },
  { code: 'USD', name: 'Dólar Estadounidense', symbol: '$', locale: 'en-US' },
];

const LANGUAGES = [
  { code: 'es-MX', name: 'Español (México)' },
  { code: 'en-US', name: 'English (US)' },
];

const RegionalTab = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [settings, setSettings] = useState({
    currency: 'MXN',
    timezone: 'America/Mexico_City',
    language: 'es-MX',
    numberFormat: 'MX',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    decimalPlaces: 2,
    currencyPosition: 'before',
    symbolSpace: false,
    showCurrencySymbol: true,
  });

  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return;
      try {
        const { data } = await supabase?.from('business_settings')?.select('regional_currency, regional_timezone, regional_language, regional_number_format, regional_thousands_separator, regional_decimal_separator, regional_decimal_places, regional_currency_position, regional_symbol_space, regional_show_currency_symbol')?.eq('owner_id', user?.id)?.maybeSingle();
        if (data && data?.regional_currency) {
          setSettings({
            currency: data?.regional_currency || 'MXN',
            timezone: data?.regional_timezone || 'America/Mexico_City',
            language: data?.regional_language || 'es-MX',
            numberFormat: data?.regional_number_format || 'MX',
            thousandsSeparator: data?.regional_thousands_separator ?? ',',
            decimalSeparator: data?.regional_decimal_separator ?? '.',
            decimalPlaces: data?.regional_decimal_places ?? 2,
            currencyPosition: data?.regional_currency_position || 'before',
            symbolSpace: data?.regional_symbol_space ?? false,
            showCurrencySymbol: data?.regional_show_currency_symbol ?? true,
          });
        }
      } catch (err) {
        console.error('Error loading regional settings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [user?.id]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      const { error } = await supabase?.from('business_settings')?.update({
          regional_currency: settings?.currency,
          regional_timezone: settings?.timezone,
          regional_language: settings?.language,
          regional_number_format: settings?.numberFormat,
          regional_thousands_separator: settings?.thousandsSeparator,
          regional_decimal_separator: settings?.decimalSeparator,
          regional_decimal_places: settings?.decimalPlaces,
          regional_currency_position: settings?.currencyPosition,
          regional_symbol_space: settings?.symbolSpace,
          regional_show_currency_symbol: settings?.showCurrencySymbol,
          updated_at: new Date()?.toISOString()
        })?.eq('owner_id', user?.id);
      if (error) throw error;
      setSaveMessage('Configuración regional guardada correctamente.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessage('Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const selectedCurrency = CURRENCIES?.find(c => c?.code === settings?.currency) || CURRENCIES?.[0];

  const formatPreview = () => {
    const amount = 1234.56;
    const sep = settings?.thousandsSeparator;
    const dec = settings?.decimalSeparator;
    const places = settings?.decimalPlaces;
    const intPart = '1' + sep + '234';
    const decPart = places > 0 ? dec + amount?.toFixed(places)?.split('.')?.[1] : '';
    const number = intPart + decPart;
    const symbol = settings?.showCurrencySymbol ? selectedCurrency?.symbol : '';
    const space = settings?.symbolSpace ? ' ' : '';
    return settings?.currencyPosition === 'before' ? `${symbol}${space}${number}` : `${number}${space}${symbol}`;
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Icon name="Loader" size={24} className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8">
      {/* Moneda Principal */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-foreground">Moneda Principal</h3>
            <p className="text-muted-foreground text-sm">Selecciona la moneda para toda la plataforma</p>
          </div>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {settings?.currency} Activo
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Moneda por Defecto</label>
            <select value={settings?.currency} onChange={e => { const c = CURRENCIES?.find(x => x?.code === e?.target?.value); setSettings(prev => ({ ...prev, currency: e?.target?.value })); }}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background">
              {CURRENCIES?.map(c => <option key={c?.code} value={c?.code}>{c?.code} - {c?.name} ({c?.symbol})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Decimales</label>
            <select value={settings?.decimalPlaces} onChange={e => setSettings(prev => ({ ...prev, decimalPlaces: parseInt(e?.target?.value) }))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background">
              <option value={0}>0 decimales</option>
              <option value={2}>2 decimales</option>
            </select>
          </div>
        </div>
        {/* Vista Previa del Formato */}
        <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
          <p className="text-sm font-medium text-foreground mb-2">Vista Previa del Formato</p>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-primary">{formatPreview()}</span>
            <span className="text-sm text-muted-foreground">— ejemplo con 1,234.56</span>
          </div>
        </div>
      </div>
      {/* Regional */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-6">Regional</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">País</label>
            <div className="relative">
              <input type="text" value="🇲🇽 México" disabled
                className="w-full px-3 py-2 border border-border rounded-lg bg-muted/50 text-muted-foreground cursor-not-allowed" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Icon name="Lock" size={14} className="text-muted-foreground" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Región fija — no modificable</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Zona Horaria</label>
            <select value={settings?.timezone} onChange={e => setSettings(prev => ({ ...prev, timezone: e?.target?.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background">
              {MEXICO_TIMEZONES?.map(tz => <option key={tz?.value} value={tz?.value}>{tz?.label}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <Icon name="Info" size={16} className="text-blue-600 mr-2" />
            <span className="text-blue-800 text-sm">
              Zona horaria actual: {new Date()?.toLocaleString('es-MX', { timeZone: settings?.timezone, timeZoneName: 'short' })}
            </span>
          </div>
        </div>
      </div>
      {/* Idioma */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-6">Idioma</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Idioma Principal</label>
            <select value={settings?.language} onChange={e => setSettings(prev => ({ ...prev, language: e?.target?.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background">
              {LANGUAGES?.map(l => <option key={l?.code} value={l?.code}>{l?.name}</option>)}
            </select>
          </div>
        </div>
      </div>
      {/* Formato de Fecha y Hora */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-foreground">Formato de Fecha y Hora</h3>
          <button disabled className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-lg text-muted-foreground cursor-not-allowed opacity-60">
            <Icon name="Settings" size={14} />
            Modificar configuración
          </button>
        </div>
        <div className="p-4 bg-muted/40 border border-border rounded-lg">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={18} className="text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Configuración actual del sistema</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                <div className="bg-card border border-border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Formato de Fecha</p>
                  <p className="text-sm font-semibold text-foreground">dd/mm/aaaa</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Formato de Hora</p>
                  <p className="text-sm font-semibold text-foreground">12 horas (AM/PM)</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Inicio de Semana</p>
                  <p className="text-sm font-semibold text-foreground">Lunes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Formato de Direcciones */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-foreground">Formato de Direcciones</h3>
          <button disabled className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-lg text-muted-foreground cursor-not-allowed opacity-60">
            <Icon name="Settings" size={14} />
            Modificar configuración
          </button>
        </div>
        <div className="p-4 bg-muted/40 border border-border rounded-lg">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={18} className="text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Configuración actual del sistema</p>
              <div className="mt-2 bg-card border border-border rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-2">Formato de dirección (México)</p>
                <p className="text-sm text-foreground font-mono">Calle y número, Colonia, C.P., Ciudad, Estado, País</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Save */}
      <div className="flex items-center justify-between pt-2">
        {saveMessage && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${saveMessage?.includes('Error') ? 'bg-destructive/10 border border-destructive text-destructive' : 'bg-green-50 border border-green-200 text-green-800'}`}>
            <Icon name={saveMessage?.includes('Error') ? 'AlertCircle' : 'CheckCircle'} size={16} />
            {saveMessage}
          </div>
        )}
        <div className="ml-auto flex gap-3">
          <Button variant="outline" onClick={() => {}}>Cancelar</Button>
          <Button onClick={handleSave} loading={saving} iconName="Save" iconPosition="left">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegionalTab;
