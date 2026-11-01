import React, { useState, useEffect, useRef } from 'react';
import { QrCode, MapPin, Keyboard, Wifi, Radio, CheckCircle, XCircle, AlertTriangle, Plus, Download, Settings, Clock, TrendingUp, ChevronDown, ChevronUp, Scan, RefreshCw, Smartphone, Monitor, Printer, Search, Calendar, FileDown, Zap, Shield, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Icon from '../../components/AppIcon';


const CheckInMethodsConfiguration = () => {
  const [activeTab, setActiveTab] = useState('methods');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [methods, setMethods] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [rules, setRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayCount, setTodayCount] = useState(0);
  const [weekCount, setWeekCount] = useState(0);
  const [topMethod, setTopMethod] = useState({ name: 'QR', pct: 68 });
  const [manualCode, setManualCode] = useState('');
  const [manualFeedback, setManualFeedback] = useState(null);
  const [historyFilter, setHistoryFilter] = useState({ method: 'all', search: '' });
  const [nfcTags, setNfcTags] = useState([]);
  const [beacons, setBeacons] = useState([]);
  const [showNfcModal, setShowNfcModal] = useState(false);
  const [nfcStep, setNfcStep] = useState(1);
  const [nfcForm, setNfcForm] = useState({ name: '', location: 'mostrador', action: 'checkin_only' });
  const [rulesConfig, setRulesConfig] = useState({ frequencyType: 'once_per_day', frequencyValue: 1, cooldown: 30, alertsEnabled: true, alertThreshold: 5 });
  const [qrConfig, setQrConfig] = useState({ type: 'static', rotationMinutes: 5, location: 'mostrador', tableCount: 5, requireStaff: false });
  const [geofenceConfig, setGeofenceConfig] = useState({ radius: 50, permanence: 2, notifyUser: true, message: '¡Bienvenido! Tu visita fue registrada 🎉' });
  const manualInputRef = useRef(null);

  const weekSparkline = [12, 18, 15, 22, 19, 25, 21];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [methodsRes, checkinsRes, rulesRes, tagsRes, beaconsRes] = await Promise.all([
        supabase?.from('checkin_methods')?.select('*')?.order('created_at'),
        supabase?.from('checkins')?.select('*')?.order('created_at', { ascending: false })?.limit(100),
        supabase?.from('checkin_rules')?.select('*')?.limit(1),
        supabase?.from('nfc_tags')?.select('*')?.order('created_at'),
        supabase?.from('ble_beacons')?.select('*')?.order('created_at')
      ]);

      const methodsData = methodsRes?.data || [];
      const checkinsData = checkinsRes?.data || [];

      setMethods(methodsData?.length > 0 ? methodsData : getDefaultMethods());
      setCheckins(checkinsData?.length > 0 ? checkinsData : getMockCheckins());
      setRules(rulesRes?.data?.[0] || null);
      setNfcTags(tagsRes?.data || getMockNfcTags());
      setBeacons(beaconsRes?.data || getMockBeacons());

      const today = new Date()?.toDateString();
      const todayCheckins = checkinsData?.filter(c => new Date(c?.created_at)?.toDateString() === today);
      setTodayCount(todayCheckins?.length || 8);
      setWeekCount(checkinsData?.length || 156);

      if (rulesRes?.data?.[0]) {
        const r = rulesRes?.data?.[0];
        setRulesConfig({
          frequencyType: r?.frequency_type || 'once_per_day',
          frequencyValue: r?.frequency_value || 1,
          cooldown: r?.cooldown_minutes || 30,
          alertsEnabled: r?.abuse_alerts_enabled ?? true,
          alertThreshold: r?.abuse_threshold || 5
        });
      }
    } catch (err) {
      console.error('Error fetching check-in data:', err);
      setMethods(getDefaultMethods());
      setCheckins(getMockCheckins());
      setNfcTags(getMockNfcTags());
      setBeacons(getMockBeacons());
      setTodayCount(8);
      setWeekCount(156);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultMethods = () => [
    { id: '1', method_type: 'qr_static', is_active: true, checkins_this_month: 142, config: {} },
    { id: '2', method_type: 'qr_dynamic', is_active: true, checkins_this_month: 89, config: {} },
    { id: '3', method_type: 'geofence', is_active: true, checkins_this_month: 67, config: {} },
    { id: '4', method_type: 'manual', is_active: true, checkins_this_month: 23, config: {} },
    { id: '5', method_type: 'nfc', is_active: false, checkins_this_month: 0, config: {} },
    { id: '6', method_type: 'beacon', is_active: false, checkins_this_month: 0, config: {} },
  ];

  const getMockCheckins = () => [
    { id: '1', customer_name: 'María García', method: 'qr_static', points_awarded: 10, checkin_status: 'success', created_at: new Date(Date.now() - 7200000)?.toISOString() },
    { id: '2', customer_name: 'Carlos López', method: 'manual', points_awarded: 5, validated_by: 'Ana (Cajera)', checkin_status: 'success', created_at: new Date(Date.now() - 10800000)?.toISOString() },
    { id: '3', customer_name: 'Sofia Martínez', method: 'geofence', points_awarded: 5, checkin_status: 'success', created_at: new Date(Date.now() - 14400000)?.toISOString() },
    { id: '4', customer_name: 'Roberto Hernández', method: 'qr_dynamic', points_awarded: 10, checkin_status: 'success', created_at: new Date(Date.now() - 18000000)?.toISOString() },
    { id: '5', customer_name: 'Laura Sánchez', method: 'nfc', points_awarded: 15, checkin_status: 'success', created_at: new Date(Date.now() - 21600000)?.toISOString() },
    { id: '6', customer_name: 'Diego Torres', method: 'qr_static', points_awarded: 10, checkin_status: 'success', created_at: new Date(Date.now() - 86400000)?.toISOString() },
    { id: '7', customer_name: 'Ana Flores', method: 'manual', points_awarded: 5, validated_by: 'Pedro (Admin)', checkin_status: 'success', created_at: new Date(Date.now() - 90000000)?.toISOString() },
    { id: '8', customer_name: 'Miguel Ramírez', method: 'geofence', points_awarded: 0, checkin_status: 'suspicious', created_at: new Date(Date.now() - 93600000)?.toISOString() },
    { id: '9', customer_name: 'Carmen Jiménez', method: 'qr_static', points_awarded: 10, checkin_status: 'success', created_at: new Date(Date.now() - 172800000)?.toISOString() },
    { id: '10', customer_name: 'José Morales', method: 'qr_dynamic', points_awarded: 10, checkin_status: 'success', created_at: new Date(Date.now() - 176400000)?.toISOString() },
    { id: '11', customer_name: 'Patricia Ruiz', method: 'nfc', points_awarded: 15, checkin_status: 'success', created_at: new Date(Date.now() - 180000000)?.toISOString() },
    { id: '12', customer_name: 'Fernando Castro', method: 'manual', points_awarded: 0, validated_by: 'Ana (Cajera)', checkin_status: 'rejected', created_at: new Date(Date.now() - 259200000)?.toISOString() },
  ];

  const getMockNfcTags = () => [
    { id: '1', tag_uid: 'NFC-A1B2C3D4', tag_name: 'Tag Mostrador', location: 'mostrador', action_type: 'checkin_only', is_active: true, taps_this_month: 45 },
    { id: '2', tag_uid: 'NFC-E5F6G7H8', tag_name: 'Tag Mesa 1', location: 'Mesa 1', action_type: 'checkin_menu', is_active: true, taps_this_month: 23 },
    { id: '3', tag_uid: 'NFC-I9J0K1L2', tag_name: 'Tag Entrada', location: 'entrada', action_type: 'checkin_coupon', is_active: true, taps_this_month: 67 },
  ];

  const getMockBeacons = () => [
    { id: '1', beacon_id: 'BLE-001', beacon_name: 'Beacon Entrada', location: 'Entrada principal', sensitivity: 'medium', min_presence_minutes: 2, is_active: true, battery_level: 87, checkins_this_month: 156, dwell_time_avg_minutes: 18, last_signal_at: new Date(Date.now() - 300000)?.toISOString() },
    { id: '2', beacon_id: 'BLE-002', beacon_name: 'Beacon Terraza', location: 'Zona terraza', sensitivity: 'low', min_presence_minutes: 5, is_active: true, battery_level: 45, checkins_this_month: 89, dwell_time_avg_minutes: 25, last_signal_at: new Date(Date.now() - 7200000)?.toISOString() },
  ];

  const methodInfo = {
    qr_static: { label: 'QR en Mostrador (Estático)', icon: QrCode, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', desc: 'Código QR fijo imprimible. Funciona siempre sin internet.' },
    qr_dynamic: { label: 'QR Dinámico', icon: RefreshCw, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', desc: 'Código que rota cada X minutos. Más seguro, requiere pantalla.' },
    geofence: { label: 'Geofence Automático', icon: MapPin, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', desc: 'Detecta al usuario al entrar al radio del negocio.' },
    manual: { label: 'Código Manual', icon: Keyboard, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', desc: 'El cajero ingresa el código del cliente manualmente.' },
    nfc: { label: 'NFC / Tap', icon: Wifi, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', desc: 'El cliente acerca su teléfono al tag NFC. Requiere hardware.' },
    beacon: { label: 'BLE Beacon', icon: Radio, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', desc: 'Registro automático por Bluetooth. Máxima automatización.' },
  };

  const toggleMethod = async (methodId, currentState) => {
    setMethods(prev => prev?.map(m => m?.id === methodId ? { ...m, is_active: !currentState } : m));
    try {
      await supabase?.from('checkin_methods')?.update({ is_active: !currentState })?.eq('id', methodId);
    } catch (err) {
      console.error('Error toggling method:', err);
    }
  };

  const handleManualCheckin = () => {
    if (!manualCode?.trim()) return;
    const code = manualCode?.trim()?.toUpperCase();
    const validCodes = ['MGA-001', 'CLO-002', 'SMA-003', 'RHE-004', 'LSA-005', 'DTO-006', 'AFL-007'];
    if (validCodes?.includes(code)) {
      const names = { 'MGA-001': 'María García', 'CLO-002': 'Carlos López', 'SMA-003': 'Sofia Martínez', 'RHE-004': 'Roberto Hernández', 'LSA-005': 'Laura Sánchez', 'DTO-006': 'Diego Torres', 'AFL-007': 'Ana Flores' };
      setManualFeedback({ type: 'success', name: names?.[code], points: 10, level: 'Plata', coupons: 1 });
    } else if (code === 'LIMIT') {
      setManualFeedback({ type: 'limit', nextTime: 'mañana a las 8:00 AM' });
    } else {
      setManualFeedback({ type: 'error' });
    }
    setTimeout(() => {
      setManualFeedback(null);
      setManualCode('');
      if (manualInputRef?.current) manualInputRef?.current?.focus();
    }, 3000);
  };

  const saveRules = async () => {
    try {
      const payload = {
        frequency_type: rulesConfig?.frequencyType,
        frequency_value: rulesConfig?.frequencyValue,
        cooldown_minutes: rulesConfig?.cooldown,
        abuse_alerts_enabled: rulesConfig?.alertsEnabled,
        abuse_threshold: rulesConfig?.alertThreshold,
      };
      if (rules?.id) {
        await supabase?.from('checkin_rules')?.update(payload)?.eq('id', rules?.id);
      } else {
        await supabase?.from('checkin_rules')?.insert(payload);
      }
    } catch (err) {
      console.error('Error saving rules:', err);
    }
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)}h`;
    return `Hace ${Math.floor(diff / 86400000)} días`;
  };

  const getMethodBadge = (method) => {
    const badges = {
      qr_static: { label: 'QR Estático', color: 'bg-blue-100 text-blue-700' },
      qr_dynamic: { label: 'QR Dinámico', color: 'bg-indigo-100 text-indigo-700' },
      geofence: { label: 'Geofence', color: 'bg-green-100 text-green-700' },
      manual: { label: 'Manual', color: 'bg-amber-100 text-amber-700' },
      nfc: { label: 'NFC', color: 'bg-purple-100 text-purple-700' },
      beacon: { label: 'Beacon', color: 'bg-rose-100 text-rose-700' },
    };
    return badges?.[method] || { label: method, color: 'bg-gray-100 text-gray-700' };
  };

  const getStatusBadge = (status) => {
    if (status === 'success') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle size={10} />Exitoso</span>;
    if (status === 'rejected') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"><XCircle size={10} />Rechazado</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><AlertTriangle size={10} />Sospechoso</span>;
  };

  const filteredCheckins = checkins?.filter(c => {
    if (historyFilter?.method !== 'all' && c?.method !== historyFilter?.method) return false;
    if (historyFilter?.search && !c?.customer_name?.toLowerCase()?.includes(historyFilter?.search?.toLowerCase())) return false;
    return true;
  });

  const tabs = [
    { id: 'methods', label: 'Métodos', icon: QrCode },
    { id: 'rewards', label: 'Recompensas', icon: TrendingUp },
    { id: 'control', label: 'Control', icon: Shield },
    { id: 'history', label: 'Historial', icon: Activity },
    { id: 'validate', label: 'Validar', icon: Scan },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Cargando módulo de Check-in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Check-in y Validación</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Gestiona cómo tus clientes registran su visita</p>
          </div>
          {/* KPI Cards */}
          <div className="flex gap-3 flex-wrap">
            <div className="bg-background border border-border rounded-xl px-4 py-3 min-w-[130px]">
              <p className="text-xs text-muted-foreground mb-1">Check-ins hoy</p>
              <p className="text-2xl font-bold text-foreground">{todayCount}</p>
              <p className="text-xs text-green-600 mt-0.5">+3 vs ayer</p>
            </div>
            <div className="bg-background border border-border rounded-xl px-4 py-3 min-w-[160px]">
              <p className="text-xs text-muted-foreground mb-1">Esta semana</p>
              <p className="text-2xl font-bold text-foreground">{weekCount}</p>
              <div className="flex items-end gap-0.5 mt-1 h-6">
                {weekSparkline?.map((v, i) => (
                  <div key={i} className="flex-1 bg-primary/60 rounded-sm" style={{ height: `${(v / 25) * 100}%` }} />
                ))}
              </div>
            </div>
            <div className="bg-background border border-border rounded-xl px-4 py-3 min-w-[140px]">
              <p className="text-xs text-muted-foreground mb-1">Método más usado</p>
              <p className="text-base font-bold text-foreground">QR Estático</p>
              <p className="text-xs text-primary mt-0.5">68% del total</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-5 border-b border-border -mb-5 overflow-x-auto">
          {tabs?.map(tab => (
            <button
              key={tab?.id}
              onClick={() => { setActiveTab(tab?.id); setSelectedMethod(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab?.id
                  ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon size={15} />
              {tab?.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        {/* TAB: METHODS */}
        {activeTab === 'methods' && !selectedMethod && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {methods?.map(method => {
              const info = methodInfo?.[method?.method_type];
              if (!info) return null;
              const Icon = info?.icon;
              const needsHardware = ['nfc', 'beacon']?.includes(method?.method_type);
              return (
                <div
                  key={method?.id}
                  className={`bg-card rounded-xl border-2 transition-all duration-200 ${
                    needsHardware && !method?.is_active
                      ? 'border-dashed border-border' : method?.is_active ?'border-border hover:border-primary/40' : 'border-border opacity-60'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg ${info?.bg} flex items-center justify-center`}>
                        <Icon size={20} className={info?.color} />
                      </div>
                      <button
                        onClick={() => toggleMethod(method?.id, method?.is_active)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          method?.is_active ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          method?.is_active ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">{info?.label}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{info?.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{method?.checkins_this_month || 0}</span> check-ins este mes
                      </span>
                      {needsHardware && !method?.is_active ? (
                        <button
                          onClick={() => setSelectedMethod(method?.method_type)}
                          className="text-xs text-primary font-medium hover:underline"
                        >
                          Configurar →
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedMethod(method?.method_type)}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Settings size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* METHOD DETAIL: QR */}
        {activeTab === 'methods' && (selectedMethod === 'qr_static' || selectedMethod === 'qr_dynamic') && (
          <QRMethodConfig qrConfig={qrConfig} setQrConfig={setQrConfig} onBack={() => setSelectedMethod(null)} />
        )}

        {/* METHOD DETAIL: GEOFENCE */}
        {activeTab === 'methods' && selectedMethod === 'geofence' && (
          <GeofenceMethodConfig config={geofenceConfig} setConfig={setGeofenceConfig} onBack={() => setSelectedMethod(null)} />
        )}

        {/* METHOD DETAIL: MANUAL */}
        {activeTab === 'methods' && selectedMethod === 'manual' && (
          <ManualMethodConfig onBack={() => setSelectedMethod(null)} />
        )}

        {/* METHOD DETAIL: NFC */}
        {activeTab === 'methods' && selectedMethod === 'nfc' && (
          <NFCMethodConfig tags={nfcTags} setTags={setNfcTags} showModal={showNfcModal} setShowModal={setShowNfcModal} nfcStep={nfcStep} setNfcStep={setNfcStep} nfcForm={nfcForm} setNfcForm={setNfcForm} onBack={() => setSelectedMethod(null)} />
        )}

        {/* METHOD DETAIL: BEACON */}
        {activeTab === 'methods' && selectedMethod === 'beacon' && (
          <BeaconMethodConfig beacons={beacons} setBeacons={setBeacons} onBack={() => setSelectedMethod(null)} />
        )}

        {/* TAB: REWARDS */}
        {activeTab === 'rewards' && (
          <RewardsTab />
        )}

        {/* TAB: CONTROL */}
        {activeTab === 'control' && (
          <ControlTab rulesConfig={rulesConfig} setRulesConfig={setRulesConfig} onSave={saveRules} />
        )}

        {/* TAB: HISTORY */}
        {activeTab === 'history' && (
          <HistoryTab checkins={filteredCheckins} filter={historyFilter} setFilter={setHistoryFilter} formatTime={formatTime} getMethodBadge={getMethodBadge} getStatusBadge={getStatusBadge} />
        )}

        {/* TAB: VALIDATE */}
        {activeTab === 'validate' && (
          <ValidateTab manualCode={manualCode} setManualCode={setManualCode} manualFeedback={manualFeedback} onSubmit={handleManualCheckin} inputRef={manualInputRef} todayCheckins={checkins?.filter(c => new Date(c?.created_at)?.toDateString() === new Date()?.toDateString())} formatTime={formatTime} getMethodBadge={getMethodBadge} />
        )}
      </div>
    </div>
  );
};

// QR Method Config Component
const QRMethodConfig = ({ qrConfig, setQrConfig, onBack }) => {
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
        ← Volver a Métodos
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Config */}
        <div className="lg:col-span-3 space-y-5">
          {/* QR Type */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Tipo de QR</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setQrConfig(p => ({ ...p, type: 'static' }))}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  qrConfig?.type === 'static' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                }`}
              >
                <Printer size={20} className="text-blue-600 mb-2" />
                <p className="font-medium text-sm text-foreground">QR Estático</p>
                <p className="text-xs text-muted-foreground mt-1">Imprime una vez, funciona siempre. Ideal para negocios sin pantalla digital.</p>
              </button>
              <button
                onClick={() => setQrConfig(p => ({ ...p, type: 'dynamic' }))}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  qrConfig?.type === 'dynamic' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                }`}
              >
                <Monitor size={20} className="text-indigo-600 mb-2" />
                <p className="font-medium text-sm text-foreground">QR Dinámico</p>
                <p className="text-xs text-muted-foreground mt-1">Cambia cada X minutos. Más seguro, requiere tablet o pantalla.</p>
              </button>
            </div>
            {qrConfig?.type === 'dynamic' && (
              <div className="mt-4">
                <p className="text-sm font-medium text-foreground mb-2">Intervalo de rotación</p>
                <div className="flex gap-2">
                  {[1, 5, 15, 30]?.map(min => (
                    <button
                      key={min}
                      onClick={() => setQrConfig(p => ({ ...p, rotationMinutes: min }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                        qrConfig?.rotationMinutes === min ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      {min} min
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">💡 Recomendado: 5 minutos. Intervalos cortos son más seguros pero pueden ser incómodos si hay fila.</p>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Ubicación del QR</h3>
            <select
              value={qrConfig?.location}
              onChange={e => setQrConfig(p => ({ ...p, location: e?.target?.value }))}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="mostrador">Mostrador / Caja</option>
              <option value="mesas">Cada mesa (QR único por mesa)</option>
              <option value="entrada">Entrada del local</option>
              <option value="vitrina">Display / Poster en vitrina</option>
            </select>
            {qrConfig?.location === 'mesas' && (
              <div className="mt-3">
                <label className="text-sm font-medium text-foreground">¿Cuántas mesas tienes?</label>
                <input
                  type="number"
                  value={qrConfig?.tableCount}
                  onChange={e => setQrConfig(p => ({ ...p, tableCount: parseInt(e?.target?.value) || 1 }))}
                  className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  min={1} max={100}
                />
                <p className="text-xs text-muted-foreground mt-1">Generaremos {qrConfig?.tableCount} QR únicos, uno por mesa. Esto te permitirá ver qué mesas generan más check-ins.</p>
              </div>
            )}
          </div>

          {/* Staff Validation */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Validación del staff</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Si está activo, un miembro del equipo debe aprobar cada check-in.</p>
              </div>
              <button
                onClick={() => setQrConfig(p => ({ ...p, requireStaff: !p?.requireStaff }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  qrConfig?.requireStaff ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  qrConfig?.requireStaff ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          {/* Staff View Mockup */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-3">Vista del staff</h3>
            <p className="text-xs text-muted-foreground mb-3">Así se verá la notificación cuando un cliente escanee el QR:</p>
            <div className="bg-gray-900 rounded-xl p-4 max-w-xs">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <QrCode size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">PromoSpot Admin</p>
                  <p className="text-gray-400 text-xs">ahora</p>
                </div>
              </div>
              <p className="text-white text-sm">María García quiere hacer check-in</p>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 bg-green-500 text-white text-xs py-1.5 rounded-lg font-medium">✓ Confirmar</button>
                <button className="flex-1 bg-red-500 text-white text-xs py-1.5 rounded-lg font-medium">✗ Rechazar</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: QR Preview */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-5 sticky top-6">
            <h3 className="font-semibold text-foreground mb-4">Vista previa del QR</h3>
            <div className="flex flex-col items-center">
              <div className="w-48 h-48 bg-white border-2 border-border rounded-xl flex items-center justify-center relative">
                <div className="grid grid-cols-7 gap-0.5 p-3">
                  {Array.from({ length: 49 })?.map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-sm ${Math.random() > 0.5 ? 'bg-gray-900' : 'bg-white'}`} />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <QrCode size={18} className="text-white" />
                  </div>
                </div>
              </div>
              {qrConfig?.type === 'dynamic' && (
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <RefreshCw size={12} className="animate-spin" />
                  Este QR se actualiza cada {qrConfig?.rotationMinutes} minutos
                </div>
              )}
              <div className="mt-4 w-full space-y-2">
                <button className="w-full flex items-center justify-center gap-2 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors">
                  <Download size={14} /> Poster A4 (PDF)
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors">
                  <Download size={14} /> Tent card mesas (PDF)
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors">
                  <Download size={14} /> Instrucciones usuario (PDF)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Geofence Method Config
const GeofenceMethodConfig = ({ config, setConfig, onBack }) => {
  const permanenceOptions = [
    { value: 0, label: 'Instantáneo', note: 'Mayor alcance, puede generar falsos positivos' },
    { value: 2, label: '2 minutos', note: 'Recomendado para la mayoría' },
    { value: 5, label: '5 minutos', note: 'Para zonas peatonales concurridas' },
    { value: 10, label: '10 minutos', note: 'Para negocios donde el cliente permanece tiempo' },
  ];
  const getRadiusDesc = (r) => {
    if (r <= 25) return 'Solo dentro de tu local';
    if (r <= 50) return 'Tu local y la acera inmediata';
    if (r <= 75) return 'Aproximadamente media cuadra';
    return 'Aproximadamente una cuadra completa';
  };
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">← Volver a Métodos</button>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Radio de activación</h3>
            <input type="range" min={20} max={100} step={5} value={config?.radius} onChange={e => setConfig(p => ({ ...p, radius: parseInt(e?.target?.value) }))} className="w-full accent-primary" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              {[20, 30, 50, 75, 100]?.map(v => <span key={v}>{v}m</span>)}
            </div>
            <p className="text-sm text-foreground mt-3">Radio actual: <span className="font-semibold">{config?.radius}m</span> — {getRadiusDesc(config?.radius)}</p>
            <p className="text-xs text-muted-foreground mt-1">💡 En zonas urbanas densas, radios menores a 30m reducen falsos positivos de negocios vecinos.</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Tiempo mínimo de permanencia</h3>
            <div className="space-y-2">
              {permanenceOptions?.map(opt => (
                <button key={opt?.value} onClick={() => setConfig(p => ({ ...p, permanence: opt?.value }))} className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                  config?.permanence === opt?.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                }`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    config?.permanence === opt?.value ? 'border-primary' : 'border-muted-foreground'
                  }`}>
                    {config?.permanence === opt?.value && <div className="w-2 h-2 bg-primary rounded-full" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{opt?.label}</p>
                    <p className="text-xs text-muted-foreground">{opt?.note}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Notificación al usuario</h3>
              <button onClick={() => setConfig(p => ({ ...p, notifyUser: !p?.notifyUser }))} className={`relative w-11 h-6 rounded-full transition-colors ${config?.notifyUser ? 'bg-primary' : 'bg-muted'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${config?.notifyUser ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            {config?.notifyUser && (
              <div>
                <input type="text" value={config?.message} onChange={e => setConfig(p => ({ ...p, message: e?.target?.value?.slice(0, 100) }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <p className="text-xs text-muted-foreground mt-1">{config?.message?.length}/100 caracteres</p>
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-5 sticky top-6">
            <h3 className="font-semibold text-foreground mb-4">Zona de check-in</h3>
            <div className="relative bg-green-50 rounded-xl overflow-hidden" style={{ height: 280 }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="rounded-full border-2 border-green-400 bg-green-100/50 flex items-center justify-center" style={{ width: config?.radius * 2.5, height: config?.radius * 2.5, maxWidth: 220, maxHeight: 220 }}>
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                      <MapPin size={16} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-3 left-3 right-3 bg-white/90 rounded-lg p-2 text-xs text-center text-gray-600">
                Radio: {config?.radius}m · Permanencia: {config?.permanence === 0 ? 'Instantáneo' : `${config?.permanence} min`}
              </div>
            </div>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">📊 <span className="font-semibold">73%</span> de tus clientes tienen permisos de ubicación activos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Manual Method Config
const ManualMethodConfig = ({ onBack }) => {
  const [roles, setRoles] = useState({ owner: true, admin: true, cashier: true, viewer: false });
  const [requireReason, setRequireReason] = useState(false);
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">← Volver a Métodos</button>
      <div className="max-w-2xl space-y-5">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-1">Código del usuario</h3>
          <p className="text-sm text-muted-foreground mb-3">Cada cliente tiene un código personal de 6 caracteres (formato ABC-123) visible en su perfil de la app.</p>
          <div className="bg-muted rounded-lg p-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Keyboard size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Ejemplo: MGA-001</p>
              <p className="text-xs text-muted-foreground">El cajero teclea o escanea el código del cliente</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3">Roles con permiso de check-in manual</h3>
          <div className="space-y-2">
            {Object.entries(roles)?.map(([role, enabled]) => (
              <div key={role} className="flex items-center justify-between py-2">
                <span className="text-sm text-foreground capitalize">{role === 'cashier' ? 'Cajero' : role === 'viewer' ? 'Viewer (solo lectura)' : role?.charAt(0)?.toUpperCase() + role?.slice(1)}</span>
                <button onClick={() => setRoles(p => ({ ...p, [role]: !p?.[role] }))} className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-muted'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Requiere motivo</h3>
              <p className="text-xs text-muted-foreground mt-0.5">El staff debe seleccionar por qué usa check-in manual</p>
            </div>
            <button onClick={() => setRequireReason(!requireReason)} className={`relative w-11 h-6 rounded-full transition-colors ${requireReason ? 'bg-primary' : 'bg-muted'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${requireReason ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          {requireReason && (
            <div className="mt-3 space-y-1">
              {['QR no disponible', 'Teléfono del cliente sin cámara', 'Cliente dictó su código', 'Registro retroactivo', 'Otro (especificar)']?.map(r => (
                <div key={r} className="flex items-center gap-2 py-1.5 px-3 bg-muted rounded-lg text-sm text-foreground">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  {r}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// NFC Method Config
const NFCMethodConfig = ({ tags, setTags, showModal, setShowModal, nfcStep, setNfcStep, nfcForm, setNfcForm, onBack }) => {
  const actionLabels = { checkin_only: 'Solo check-in', checkin_coupon: 'Check-in + Cupón', checkin_menu: 'Check-in + Menú', promo_only: 'Solo promo' };
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">← Volver a Métodos</button>
      {tags?.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wifi size={28} className="text-purple-600" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Sin tags NFC registrados</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">Los tags NFC eliminan la fricción del check-in. El usuario solo toca su teléfono.</p>
          <div className="flex gap-3 justify-center">
            <button className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors">Comprar tags NFC en tienda PromoSpot</button>
            <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Ya tengo tags, registrar</button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Tags NFC registrados ({tags?.length})</h3>
            <button onClick={() => { setShowModal(true); setNfcStep(1); }} className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus size={14} /> Registrar nuevo tag
            </button>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  {['Nombre', 'Ubicación', 'Acción', 'Taps este mes', 'Estado']?.map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tags?.map(tag => (
                  <tr key={tag?.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{tag?.tag_name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{tag?.location}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">{actionLabels?.[tag?.action_type] || tag?.action_type}</span></td>
                    <td className="px-4 py-3 text-sm text-foreground font-medium">{tag?.taps_this_month}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        tag?.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>{tag?.is_active ? '● Activo' : '○ Inactivo'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Los tags NFC funcionan con iPhone (iOS 13+) y Android (4.0+). Actualmente <span className="font-semibold">89%</span> de tus clientes tienen dispositivos compatibles.</p>
        </div>
      )}
      {/* NFC Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-foreground">Registrar tag NFC</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="flex gap-2 mb-6">
              {[1, 2, 3]?.map(s => (
                <div key={s} className={`flex-1 h-1.5 rounded-full ${nfcStep >= s ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
            {nfcStep === 1 && (
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Smartphone size={32} className="text-purple-600" />
                </div>
                <p className="font-medium text-foreground mb-2">Acerca tu teléfono al tag NFC</p>
                <p className="text-sm text-muted-foreground">Mantén el teléfono a menos de 4cm del tag que quieres registrar</p>
                <button onClick={() => setNfcStep(2)} className="mt-6 w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Simular detección</button>
              </div>
            )}
            {nfcStep === 2 && (
              <div>
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg mb-4">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-sm text-green-700 font-medium">Tag detectado: NFC-X9Y8Z7W6</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">Nombre del tag</label>
                    <input value={nfcForm?.name} onChange={e => setNfcForm(p => ({ ...p, name: e?.target?.value }))} placeholder="Ej: Tag Mostrador" className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Ubicación</label>
                    <select value={nfcForm?.location} onChange={e => setNfcForm(p => ({ ...p, location: e?.target?.value }))} className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="mostrador">Mostrador</option>
                      <option value="mesa">Mesa</option>
                      <option value="entrada">Entrada</option>
                      <option value="vitrina">Vitrina</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Acción</label>
                    <select value={nfcForm?.action} onChange={e => setNfcForm(p => ({ ...p, action: e?.target?.value }))} className="mt-1 w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="checkin_only">Solo check-in</option>
                      <option value="checkin_coupon">Check-in + Cupón</option>
                      <option value="checkin_menu">Check-in + Menú</option>
                      <option value="promo_only">Solo promo</option>
                    </select>
                  </div>
                </div>
                <button onClick={() => setNfcStep(3)} className="mt-4 w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Registrar tag</button>
              </div>
            )}
            {nfcStep === 3 && (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={28} className="text-green-600" />
                </div>
                <p className="font-semibold text-foreground mb-1">Tag '{nfcForm?.name || 'Nuevo Tag'}' registrado</p>
                <p className="text-sm text-muted-foreground">El tag está activo y listo para recibir taps</p>
                <button onClick={() => { setShowModal(false); setNfcStep(1); setTags(p => [...p, { id: Date.now()?.toString(), tag_uid: 'NFC-X9Y8Z7W6', tag_name: nfcForm?.name || 'Nuevo Tag', location: nfcForm?.location, action_type: nfcForm?.action, is_active: true, taps_this_month: 0 }]); }} className="mt-5 w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Listo</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Beacon Method Config
const BeaconMethodConfig = ({ beacons, setBeacons, onBack }) => {
  const [selectedBeacon, setSelectedBeacon] = useState(null);
  const getBatteryColor = (level) => level > 60 ? 'text-green-600' : level > 30 ? 'text-amber-600' : 'text-red-600';
  const getStatusColor = (beacon) => {
    if (!beacon?.is_active) return 'bg-gray-400';
    if (beacon?.battery_level < 20) return 'bg-red-500';
    const lastSignal = new Date(beacon?.last_signal_at);
    if (Date.now() - lastSignal > 86400000) return 'bg-gray-400';
    return 'bg-green-500';
  };
  const hourlyData = [2, 5, 8, 12, 15, 18, 22, 25, 20, 18, 15, 12, 10, 8, 12, 18, 22, 28, 25, 20, 15, 10, 6, 3];
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">← Volver a Métodos</button>
      {/* Alert banner */}
      {beacons?.some(b => b?.battery_level < 30) && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-5">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700">Tu beacon '<span className="font-semibold">{beacons?.find(b => b?.battery_level < 30)?.beacon_name}</span>' tiene batería baja ({beacons?.find(b => b?.battery_level < 30)?.battery_level}%). Considera reemplazarla pronto.</p>
        </div>
      )}
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{beacons?.filter(b => b?.is_active)?.length}</p>
          <p className="text-xs text-muted-foreground">Beacons activos</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">0</p>
          <p className="text-xs text-muted-foreground">Alertas</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{beacons?.reduce((s, b) => s + (b?.checkins_this_month || 0), 0)}</p>
          <p className="text-xs text-muted-foreground">Check-ins esta semana</p>
        </div>
      </div>
      {beacons?.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Radio size={28} className="text-rose-600" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Sin beacons registrados</h3>
          <p className="text-sm text-muted-foreground mb-2 max-w-sm mx-auto">Los beacons BLE registran visitas automáticamente sin que el cliente haga nada.</p>
          <p className="text-xs text-muted-foreground mb-5">$299/mes incluye beacon + servicio de gestión</p>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Comprar beacons en tienda PromoSpot</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {beacons?.map(beacon => (
            <div key={beacon?.id} onClick={() => setSelectedBeacon(selectedBeacon?.id === beacon?.id ? null : beacon)} className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-primary/40 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(beacon)} animate-pulse`} />
                  <h4 className="font-semibold text-foreground">{beacon?.beacon_name}</h4>
                </div>
                <span className={`text-xs font-medium ${getBatteryColor(beacon?.battery_level)}`}>🔋 {beacon?.battery_level}%</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{beacon?.location}</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">Check-ins este mes</p>
                  <p className="text-lg font-bold text-foreground">{beacon?.checkins_this_month}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Dwell time promedio</p>
                  <p className="text-lg font-bold text-foreground">{beacon?.dwell_time_avg_minutes} min</p>
                </div>
              </div>
              {/* Mini hourly chart */}
              <div className="flex items-end gap-0.5 h-8">
                {hourlyData?.slice(0, 12)?.map((v, i) => (
                  <div key={i} className="flex-1 bg-rose-200 rounded-sm" style={{ height: `${(v / 28) * 100}%` }} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Check-ins por hora (últimas 12h)</p>

              {selectedBeacon?.id === beacon?.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-semibold text-foreground mb-2">Configuración</p>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Sensibilidad</label>
                      <div className="flex gap-2 mt-1">
                        {['high', 'medium', 'low']?.map(s => (
                          <button key={s} className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${
                            beacon?.sensitivity === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'
                          }`}>{s === 'high' ? 'Alta' : s === 'medium' ? 'Media' : 'Baja'}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Tiempo mínimo de presencia: {beacon?.min_presence_minutes} min</label>
                      <input type="range" min={1} max={15} value={beacon?.min_presence_minutes} className="w-full accent-primary mt-1" readOnly />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Rewards Tab (simplified inline)
const RewardsTab = () => {
  const [basePoints, setBasePoints] = useState(10);
  const [differentiateByMethod, setDifferentiateByMethod] = useState(false);
  const [multipliersOpen, setMultipliersOpen] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);
  const [streakEnabled, setStreakEnabled] = useState(true);
  const [multipliers, setMultipliers] = useState([
    { id: 1, type: 'day', condition: 'Martes', multiplier: 2.0, active: true },
    { id: 2, type: 'time', condition: '14:00-17:00', multiplier: 1.5, active: true },
  ]);
  const [streakBonuses, setStreakBonuses] = useState([
    { visit: 2, bonus: 5 }, { visit: 3, bonus: 10 }, { visit: 5, bonus: 25 }, { visit: 7, bonus: 35 }, { visit: 10, bonus: 50 }
  ]);
  const methodPoints = { qr_static: 10, qr_dynamic: 10, geofence: 5, manual: 5, nfc: 15, beacon: 10 };
  const confidenceBadge = (method) => {
    if (['qr_static', 'qr_dynamic', 'nfc', 'beacon']?.includes(method)) return <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">Alta</span>;
    if (method === 'geofence') return <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">Media</span>;
    return <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">Manual</span>;
  };
  const methodLabels = { qr_static: 'QR Estático', qr_dynamic: 'QR Dinámico', geofence: 'Geofence', manual: 'Manual', nfc: 'NFC', beacon: 'Beacon' };
  const visitsNeeded = Math.ceil(100 / basePoints);
  return (
    <div className="max-w-3xl space-y-5">
      {/* Base Points */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Puntos base por check-in</h3>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button onClick={() => setBasePoints(p => Math.max(1, p - 1))} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors">−</button>
            <span className="text-4xl font-bold text-foreground w-16 text-center">{basePoints}</span>
            <button onClick={() => setBasePoints(p => p + 1)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors">+</button>
          </div>
          <span className="text-muted-foreground text-sm">puntos por check-in</span>
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-800">Con <span className="font-bold">{basePoints}</span> puntos por check-in, un cliente necesita <span className="font-bold">{visitsNeeded}</span> visitas para su primera recompensa. El mes pasado, tu cliente promedio visitó <span className="font-bold">4</span> veces.</p>
        </div>
      </div>
      {/* Points by Method */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <button onClick={() => setDifferentiateByMethod(!differentiateByMethod)} className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-foreground">Puntos por método</h3>
            {differentiateByMethod && <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">Activo</span>}
          </div>
          {differentiateByMethod ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </button>
        {differentiateByMethod && (
          <div className="px-5 pb-5 border-t border-border">
            <p className="text-xs text-muted-foreground mt-3 mb-3">Configura puntos diferentes por método para incentivar los que prefieres</p>
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="text-left pb-2">Método</th>
                  <th className="text-left pb-2">Confianza</th>
                  <th className="text-right pb-2">Puntos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Object.entries(methodPoints)?.map(([method, pts]) => (
                  <tr key={method}>
                    <td className="py-2 text-sm text-foreground">{methodLabels?.[method]}</td>
                    <td className="py-2">{confidenceBadge(method)}</td>
                    <td className="py-2 text-right">
                      <input type="number" defaultValue={pts} className="w-16 border border-border rounded-lg px-2 py-1 text-sm text-right bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" min={0} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Multipliers */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <button onClick={() => setMultipliersOpen(!multipliersOpen)} className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
          <h3 className="font-semibold text-foreground">Multiplicadores</h3>
          {multipliersOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </button>
        {multipliersOpen && (
          <div className="px-5 pb-5 border-t border-border">
            <div className="mt-3 space-y-2">
              {multipliers?.map(m => (
                <div key={m?.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <button onClick={() => setMultipliers(p => p?.map(x => x?.id === m?.id ? { ...x, active: !x?.active } : x))} className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${m?.active ? 'bg-primary' : 'bg-muted'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${m?.active ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                  <span className="text-xs text-muted-foreground capitalize">{m?.type === 'day' ? 'Día' : 'Horario'}</span>
                  <span className="text-sm text-foreground font-medium flex-1">{m?.condition}</span>
                  <span className="text-sm font-bold text-primary">×{m?.multiplier}</span>
                </div>
              ))}
            </div>
            <button className="mt-3 flex items-center gap-2 text-sm text-primary hover:underline">
              <Plus size={14} /> Agregar multiplicador
            </button>
          </div>
        )}
      </div>
      {/* Streak */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <button onClick={() => setStreakOpen(!streakOpen)} className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-foreground">Puntos bonus por racha</h3>
            <button onClick={e => { e?.stopPropagation(); setStreakEnabled(!streakEnabled); }} className={`relative w-9 h-5 rounded-full transition-colors ${streakEnabled ? 'bg-primary' : 'bg-muted'}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${streakEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>
          {streakOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </button>
        {streakOpen && streakEnabled && (
          <div className="px-5 pb-5 border-t border-border">
            <table className="w-full mt-3">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="text-left pb-2">Visita consecutiva #</th>
                  <th className="text-right pb-2">Bonus extra (pts)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {streakBonuses?.map((s, i) => (
                  <tr key={i}>
                    <td className="py-2 text-sm text-foreground">Visita {s?.visit}</td>
                    <td className="py-2 text-right">
                      <input type="number" value={s?.bonus} onChange={e => setStreakBonuses(p => p?.map((x, j) => j === i ? { ...x, bonus: parseInt(e?.target?.value) || 0 } : x))} className="w-16 border border-border rounded-lg px-2 py-1 text-sm text-right bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" min={0} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3">
              <label className="text-sm font-medium text-foreground">Ventana de racha (días sin visitar antes de romper)</label>
              <input type="number" defaultValue={7} className="mt-1 w-24 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" min={1} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Tu cliente más constante visitó <span className="font-semibold">12 veces en racha</span> el mes pasado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Control Tab
const ControlTab = ({ rulesConfig, setRulesConfig, onSave }) => {
  const [methodRulesOpen, setMethodRulesOpen] = useState(false);
  const frequencyOptions = [
    { type: 'once_per_day', label: '1 vez al día', icon: Calendar, badge: 'Más popular', desc: 'El usuario puede hacer check-in una vez por día. Ideal para la mayoría de negocios.' },
    { type: 'every_x_hours', label: 'Cada X horas', icon: Clock, badge: null, desc: 'Permite varias visitas al día si pasan suficientes horas entre cada una.' },
    { type: 'x_per_day', label: 'Hasta X veces al día', icon: RefreshCw, badge: null, desc: 'Fija un máximo diario sin restricción de horas entre check-ins.' },
    { type: 'unlimited', label: 'Sin límite', icon: Zap, badge: 'No recomendado', desc: 'Sin restricciones. Solo recomendado para modelos de negocio con acceso ilimitado.' },
  ];
  const cooldownOptions = [15, 30, 60, 120, 240];
  const cooldownLabel = (v) => v < 60 ? `${v} min` : `${v / 60}h`;
  const summaryText = () => {
    let freq = '';
    if (rulesConfig?.frequencyType === 'once_per_day') freq = '1 vez al día';
    else if (rulesConfig?.frequencyType === 'every_x_hours') freq = `cada ${rulesConfig?.frequencyValue} horas`;
    else if (rulesConfig?.frequencyType === 'x_per_day') freq = `hasta ${rulesConfig?.frequencyValue} veces al día`;
    else freq = 'sin límite';
    return `Configuración actual: cada usuario puede hacer check-in ${freq}, con un mínimo de ${rulesConfig?.cooldown} minutos entre check-ins. Se recibirán alertas si un usuario intenta más de ${rulesConfig?.alertThreshold} veces en un día.`;
  };
  return (
    <div className="max-w-3xl space-y-5">
      {/* Frequency */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Frecuencia máxima de check-in</h3>
        <div className="space-y-2">
          {frequencyOptions?.map(opt => (
            <button key={opt?.type} onClick={() => setRulesConfig(p => ({ ...p, frequencyType: opt?.type }))} className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              rulesConfig?.frequencyType === opt?.type ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
            }`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                rulesConfig?.frequencyType === opt?.type ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <opt.icon size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-foreground">{opt?.label}</span>
                  {opt?.badge && <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    opt?.badge === 'Más popular' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>{opt?.badge}</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{opt?.desc}</p>
              </div>
              {(opt?.type === 'every_x_hours' || opt?.type === 'x_per_day') && rulesConfig?.frequencyType === opt?.type && (
                <input type="number" value={rulesConfig?.frequencyValue} onChange={e => setRulesConfig(p => ({ ...p, frequencyValue: parseInt(e?.target?.value) || 1 }))} className="w-16 border border-border rounded-lg px-2 py-1.5 text-sm text-center bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" min={1} max={opt?.type === 'every_x_hours' ? 12 : 10} onClick={e => e?.stopPropagation()} />
              )}
            </button>
          ))}
        </div>
      </div>
      {/* Cooldown */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-1">Cooldown entre check-ins</h3>
        <p className="text-xs text-muted-foreground mb-4">Tiempo mínimo entre dos check-ins del mismo usuario. Previene dobles registros accidentales.</p>
        <div className="flex gap-2">
          {cooldownOptions?.map(v => (
            <button key={v} onClick={() => setRulesConfig(p => ({ ...p, cooldown: v }))} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
              rulesConfig?.cooldown === v ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'
            }`}>{cooldownLabel(v)}</button>
          ))}
        </div>
      </div>
      {/* Method Rules */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <button onClick={() => setMethodRulesOpen(!methodRulesOpen)} className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
          <div>
            <h3 className="font-semibold text-foreground">Reglas por método (avanzado)</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Configura reglas diferentes para cada método de check-in</p>
          </div>
          {methodRulesOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </button>
        {methodRulesOpen && (
          <div className="px-5 pb-5 border-t border-border">
            <p className="text-xs text-muted-foreground mt-3 mb-3">Por defecto, todos los métodos heredan la regla global. Activa para configurar individualmente.</p>
            {['QR Estático', 'QR Dinámico', 'Geofence', 'Manual', 'NFC', 'Beacon']?.map(method => (
              <div key={method} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-foreground">{method}</span>
                <span className="text-xs text-muted-foreground">Hereda regla global</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Alerts */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground">Alertas de intentos sospechosos</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Detecta patrones de abuso automáticamente</p>
          </div>
          <button onClick={() => setRulesConfig(p => ({ ...p, alertsEnabled: !p?.alertsEnabled }))} className={`relative w-11 h-6 rounded-full transition-colors ${rulesConfig?.alertsEnabled ? 'bg-primary' : 'bg-muted'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${rulesConfig?.alertsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
        {rulesConfig?.alertsEnabled && (
          <div>
            <label className="text-sm font-medium text-foreground">Alertar si un usuario intenta más de</label>
            <div className="flex items-center gap-2 mt-1">
              <input type="number" value={rulesConfig?.alertThreshold} onChange={e => setRulesConfig(p => ({ ...p, alertThreshold: parseInt(e?.target?.value) || 1 }))} className="w-16 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" min={1} />
              <span className="text-sm text-muted-foreground">check-ins fallidos en un día</span>
            </div>
            <div className="mt-3 space-y-1">
              {['Intentos muy por encima del límite', 'Check-ins desde ubicaciones inconsistentes', 'Velocidad de viaje imposible entre sucursales']?.map(p => (
                <div key={p} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  {p}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">{summaryText()}</p>
      </div>
      <button onClick={onSave} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
        Guardar configuración
      </button>
    </div>
  );
};

// History Tab
const HistoryTab = ({ checkins, filter, setFilter, formatTime, getMethodBadge, getStatusBadge }) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={filter?.search} onChange={e => setFilter(p => ({ ...p, search: e?.target?.value }))} placeholder="Buscar por nombre..." className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <select value={filter?.method} onChange={e => setFilter(p => ({ ...p, method: e?.target?.value }))} className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="all">Todos los métodos</option>
          <option value="qr_static">QR Estático</option>
          <option value="qr_dynamic">QR Dinámico</option>
          <option value="geofence">Geofence</option>
          <option value="manual">Manual</option>
          <option value="nfc">NFC</option>
          <option value="beacon">Beacon</option>
        </select>
        <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors">
          <FileDown size={14} /> Exportar Excel
        </button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {['Fecha/Hora', 'Usuario', 'Método', 'Puntos', 'Validado por', 'Estado']?.map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {checkins?.map(c => {
              const badge = getMethodBadge(c?.method);
              return (
                <tr key={c?.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{formatTime(c?.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-xs font-semibold text-primary">{c?.customer_name?.charAt(0)}</div>
                      <span className="text-sm font-medium text-foreground">{c?.customer_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge?.color}`}>{badge?.label}</span></td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">+{c?.points_awarded}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{c?.validated_by || '—'}</td>
                  <td className="px-4 py-3">{getStatusBadge(c?.checkin_status)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {checkins?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">No se encontraron check-ins con los filtros actuales</div>
        )}
      </div>
    </div>
  );
};

// Validate Tab
const ValidateTab = ({ manualCode, setManualCode, manualFeedback, onSubmit, inputRef, todayCheckins, formatTime, getMethodBadge }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card border border-border rounded-xl p-6 mb-5">
        <h3 className="font-semibold text-foreground mb-1 text-center">Validar Check-in Manual</h3>
        <p className="text-xs text-muted-foreground text-center mb-5">Ingresa el código del cliente (formato ABC-123)</p>

        {!manualFeedback ? (
          <div className="flex gap-3">
            <input
              ref={inputRef}
              value={manualCode}
              onChange={e => setManualCode(e?.target?.value?.toUpperCase())}
              onKeyDown={e => e?.key === 'Enter' && onSubmit()}
              placeholder="Ingresa el código del cliente"
              className="flex-1 border-2 border-border rounded-xl px-4 py-3 text-lg font-mono text-center bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              autoFocus
            />
            <button onClick={onSubmit} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
              Registrar
            </button>
          </div>
        ) : (
          <div className={`rounded-xl p-6 text-center transition-all ${
            manualFeedback?.type === 'success' ? 'bg-green-500' :
            manualFeedback?.type === 'limit' ? 'bg-amber-500' : 'bg-red-500'
          }`}>
            {manualFeedback?.type === 'success' && (
              <>
                <CheckCircle size={40} className="text-white mx-auto mb-3" />
                <p className="text-white text-xl font-bold">¡Check-in registrado!</p>
                <p className="text-white/90 text-lg">{manualFeedback?.name}</p>
                <p className="text-white text-2xl font-bold mt-1">+{manualFeedback?.points} puntos</p>
                <p className="text-white/80 text-sm mt-1">Nivel: {manualFeedback?.level}</p>
                {manualFeedback?.coupons > 0 && (
                  <p className="text-white/90 text-sm mt-2 bg-white/20 rounded-lg py-1 px-3">{manualFeedback?.name?.split(' ')?.[0]} tiene {manualFeedback?.coupons} cupón activo</p>
                )}
              </>
            )}
            {manualFeedback?.type === 'error' && (
              <>
                <XCircle size={40} className="text-white mx-auto mb-3" />
                <p className="text-white text-lg font-bold">Código no encontrado</p>
                <p className="text-white/80 text-sm">Verifica e intenta de nuevo</p>
              </>
            )}
            {manualFeedback?.type === 'limit' && (
              <>
                <AlertTriangle size={40} className="text-white mx-auto mb-3" />
                <p className="text-white text-lg font-bold">Ya registró su visita hoy</p>
                <p className="text-white/80 text-sm">Próximo check-in: {manualFeedback?.nextTime}</p>
              </>
            )}
          </div>
        )}
      </div>
      {/* Today's history */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h4 className="font-semibold text-foreground mb-3">Últimas validaciones del día ({todayCheckins?.length})</h4>
        {todayCheckins?.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Sin check-ins hoy todavía</p>
        ) : (
          <div className="space-y-2">
            {todayCheckins?.slice(0, 10)?.map(c => {
              const badge = getMethodBadge(c?.method);
              return (
                <div key={c?.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">{c?.customer_name?.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c?.customer_name}</p>
                    <span className={`px-1.5 py-0.5 rounded text-xs ${badge?.color}`}>{badge?.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTime(c?.created_at)}</span>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    c?.checkin_status === 'success' ? 'bg-green-500' : c?.checkin_status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
                  }`} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckInMethodsConfiguration;
