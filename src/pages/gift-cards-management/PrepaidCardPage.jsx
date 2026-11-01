import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';

import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useCurrency } from '../../contexts/CurrencyContext';
import { supabase } from '../../lib/supabase';

const MEMBERSHIP_TEMPLATES = [
  { id: 'membership-1', label: 'Clásica', color: 'from-slate-600 to-slate-800', icon: '💳' },
  { id: 'membership-2', label: 'Premium', color: 'from-amber-500 to-yellow-600', icon: '⭐' },
  { id: 'membership-3', label: 'Moderna', color: 'from-blue-600 to-indigo-700', icon: '🔷' },
  { id: 'membership-4', label: 'Elegante', color: 'from-purple-600 to-violet-700', icon: '💜' },
  { id: 'membership-5', label: 'Natural', color: 'from-green-600 to-emerald-700', icon: '🌿' },
  { id: 'membership-6', label: 'Vibrante', color: 'from-orange-500 to-red-600', icon: '🔥' },
];

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const mockChartData = MONTHS?.map((m) => ({
  mes: m,
  recargas: Math.floor(Math.random() * 50 + 10) * 1000,
  consumos: Math.floor(Math.random() * 40 + 8) * 1000,
}));

const Section = ({ title, icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden mb-4">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-card hover:bg-muted/40 transition-colors">
        <div className="flex items-center gap-3">
          <Icon name={icon} size={18} className="text-primary" />
          <span className="font-semibold text-foreground">{title}</span>
        </div>
        <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground" />
      </button>
      {open && <div className="px-5 py-4 bg-card border-t border-border">{children}</div>}
    </div>
  );
};

const Toggle = ({ checked, onChange, label, description, tooltip }) => (
  <div className="flex items-start justify-between gap-4 py-2">
    <div className="flex-1">
      <div className="flex items-center gap-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {tooltip && (
          <div className="relative group">
            <Icon name="HelpCircle" size={13} className="text-muted-foreground cursor-help" />
            <div className="absolute left-0 bottom-5 w-56 bg-popover border border-border rounded-lg p-2 text-xs text-muted-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
    <button onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const PrepaidCardPage = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('config');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [config, setConfig] = useState({
    isActive: false,
    cardName: 'Tarjeta Prepago',
    selectedTemplate: 'membership-1',
    reloadAmounts: [100, 200, 500],
    allowCustomReload: false,
    customReloadMin: 50,
    customReloadMax: 5000,
    maxBalance: 5000,
    welcomeBalanceEnabled: false,
    welcomeBalanceAmount: 25,
    combinableWithOtherMethods: true,
    balanceExpires: false,
    balanceExpiryMonths: 12,
    balanceRefundable: false,
  });

  const user = { name: 'Carlos Mendoza', email: 'carlos@promospot.mx', role: 'owner' };
  const update = (field, value) => setConfig(prev => ({ ...prev, [field]: value }));

  const addReloadAmount = () => {
    if (config?.reloadAmounts?.length >= 6) return;
    update('reloadAmounts', [...config?.reloadAmounts, 100]);
  };
  const removeReloadAmount = (idx) => update('reloadAmounts', config?.reloadAmounts?.filter((_, i) => i !== idx));
  const updateReloadAmount = (idx, val) => {
    const updated = [...config?.reloadAmounts];
    updated[idx] = parseFloat(val) || 0;
    update('reloadAmounts', updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload = {
        business_id: 'demo-business',
        is_active: config?.isActive,
        card_name: config?.cardName,
        selected_template: config?.selectedTemplate,
        reload_amounts: config?.reloadAmounts,
        allow_custom_reload: config?.allowCustomReload,
        custom_reload_min: config?.customReloadMin,
        custom_reload_max: config?.customReloadMax,
        max_balance: config?.maxBalance,
        welcome_balance_enabled: config?.welcomeBalanceEnabled,
        welcome_balance_amount: config?.welcomeBalanceAmount,
        combinable_with_other_methods: config?.combinableWithOtherMethods,
        balance_expires: config?.balanceExpires,
        balance_expiry_months: config?.balanceExpiryMonths,
        balance_refundable: config?.balanceRefundable,
        updated_at: new Date()?.toISOString(),
      };
      const { error } = await supabase?.from('prepaid_card_config')?.upsert(payload, { onConflict: 'business_id' });
      if (error) throw error;
    } catch (err) {
      setSaveError(err?.message);
    } finally {
      setIsSaving(false);
    }
  };

  const template = MEMBERSHIP_TEMPLATES?.find(t => t?.id === config?.selectedTemplate) || MEMBERSHIP_TEMPLATES?.[0];

  const mockPrepaidUsers = [
    { name: 'María García', activatedAt: '2025-01-10', balance: 350, lastReload: '2025-02-20', lastUsed: '2025-03-01', totalReloaded: 1200, totalConsumed: 850 },
    { name: 'Carlos Ruiz', activatedAt: '2025-01-15', balance: 0, lastReload: '2025-01-15', lastUsed: '2025-01-20', totalReloaded: 200, totalConsumed: 200 },
    { name: 'Ana Torres', activatedAt: '2024-12-01', balance: 1500, lastReload: '2025-02-28', lastUsed: '2025-03-02', totalReloaded: 3000, totalConsumed: 1500 },
    { name: 'Luis Martínez', activatedAt: '2025-02-01', balance: 75, lastReload: '2025-02-01', lastUsed: '2024-12-15', totalReloaded: 500, totalConsumed: 425 },
  ];

  const dormantBalance = mockPrepaidUsers?.filter(u => new Date(u.lastUsed) < new Date(Date.now() - 60 * 24 * 60 * 60 * 1000))?.reduce((sum, u) => sum + u?.balance, 0);

  const dormantCount = mockPrepaidUsers?.filter(u => new Date(u.lastUsed) < new Date(Date.now() - 60 * 24 * 60 * 60 * 1000))?.length;

  const breadcrumbItems = [
    { label: 'Panel de Control', href: '/dashboard-overview' },
    { label: 'Tarjetas de Regalo', href: '/gift-cards-management' },
    { label: 'Tarjeta Prepago' },
  ];

  const TABS = [
    { id: 'config', label: 'Configuración', icon: 'Settings' },
    { id: 'dashboard', label: 'Dashboard', icon: 'BarChart3' },
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} userRole={user?.role}
        isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <Header user={user} onMenuClick={() => setIsSidebarOpen(true)} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto">
          {/* Top bar */}
          <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/gift-cards-management')}>
                <Icon name="ArrowLeft" size={18} />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Tarjeta Prepago Recargable</h1>
                <p className="text-xs text-muted-foreground">Funcionalidad #78 — Monedero digital del negocio</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
                <span className="text-sm font-medium text-foreground">Tarjeta activa</span>
                <button onClick={() => update('isActive', !config?.isActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config?.isActive ? 'bg-primary' : 'bg-muted'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config?.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <Button variant="outline" onClick={() => navigate('/gift-cards-management')}>Cancelar</Button>
              <Button onClick={handleSave} loading={isSaving} iconName="Save" iconPosition="left">Guardar</Button>
            </div>
          </div>

          {saveError && (
            <div className="mx-6 mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">{saveError}</div>
          )}

          {/* Tabs */}
          <div className="px-6 pt-4">
            <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
              {TABS?.map(tab => (
                <button key={tab?.id} onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab?.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}>
                  <Icon name={tab?.icon} size={15} />{tab?.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'config' && (
            <div className="flex">
              {/* Left 60% */}
              <div className="flex-1 overflow-y-auto p-6 border-r border-border" style={{ flexBasis: '60%' }}>
                <div className="max-w-2xl space-y-2">
                  {/* Identidad */}
                  <Section title="Identidad de la Tarjeta" icon="CreditCard" defaultOpen={true}>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-sm font-medium text-foreground">Nombre de la tarjeta</label>
                          <span className="text-xs text-muted-foreground">{config?.cardName?.length}/30</span>
                        </div>
                        <input
                          type="text" maxLength={30} value={config?.cardName}
                          onChange={(e) => update('cardName', e?.target?.value)}
                          placeholder="Ej: Tarjeta Café Roma"
                          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">Diseño de la tarjeta</p>
                        <div className="grid grid-cols-3 gap-3">
                          {MEMBERSHIP_TEMPLATES?.map(t => (
                            <button key={t?.id} onClick={() => update('selectedTemplate', t?.id)}
                              className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                                config?.selectedTemplate === t?.id ? 'border-primary shadow-md scale-105' : 'border-transparent hover:border-border'
                              }`}>
                              <div className={`bg-gradient-to-br ${t?.color} h-14 flex items-center justify-center`}>
                                <span className="text-2xl">{t?.icon}</span>
                              </div>
                              <div className="bg-card px-2 py-1">
                                <p className="text-xs text-center text-foreground">{t?.label}</p>
                              </div>
                              {config?.selectedTemplate === t?.id && (
                                <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                                  <Icon name="Check" size={10} className="text-white" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Section>

                  {/* Recargas */}
                  <Section title="Montos de Recarga" icon="RefreshCw" defaultOpen={true}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Opciones de recarga disponibles</p>
                        <button onClick={addReloadAmount} disabled={config?.reloadAmounts?.length >= 6}
                          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 disabled:opacity-40 font-medium">
                          <Icon name="Plus" size={14} /> Agregar
                        </button>
                      </div>
                      {config?.reloadAmounts?.map((amount, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">$</span>
                          <input type="number" min="50" value={amount}
                            onChange={(e) => updateReloadAmount(idx, e?.target?.value)}
                            className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                          <span className="text-xs text-muted-foreground">MXN</span>
                          <button onClick={() => removeReloadAmount(idx)} className="text-muted-foreground hover:text-destructive">
                            <Icon name="X" size={14} />
                          </button>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-border">
                        <Toggle checked={config?.allowCustomReload} onChange={(v) => update('allowCustomReload', v)}
                          label="Monto libre de recarga" description="El usuario elige cuánto recargar" tooltip="" />
                        {config?.allowCustomReload && (
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Mínimo (MXN)</label>
                              <input type="number" min="50" value={config?.customReloadMin}
                                onChange={(e) => update('customReloadMin', parseFloat(e?.target?.value) || 50)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Máximo (MXN)</label>
                              <input type="number" min="50" value={config?.customReloadMax}
                                onChange={(e) => update('customReloadMax', parseFloat(e?.target?.value) || 5000)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="pt-2 border-t border-border">
                        <label className="text-sm font-medium text-foreground mb-1 block">Saldo máximo en tarjeta (MXN)</label>
                        <input type="number" min="100" value={config?.maxBalance}
                          onChange={(e) => update('maxBalance', parseFloat(e?.target?.value) || 5000)}
                          className="w-40 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Icon name="Lightbulb" size={14} className="text-blue-500 mt-0.5 shrink-0" />
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            Tu ticket promedio estimado es $250 MXN. Recomendamos opciones de recarga entre $500 y $1,250 MXN.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Section>

                  {/* Bienvenida */}
                  <Section title="Saldo de Bienvenida" icon="Gift" defaultOpen={false}>
                    <div className="space-y-4">
                      <Toggle checked={config?.welcomeBalanceEnabled} onChange={(v) => update('welcomeBalanceEnabled', v)}
                        label="Saldo de bienvenida al activar"
                        description="Se acredita automáticamente la primera vez que el usuario activa su tarjeta"
                        tooltip="" />
                      {config?.welcomeBalanceEnabled && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">Monto de bienvenida (MXN)</label>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">$</span>
                              <input type="number" min="1" value={config?.welcomeBalanceAmount}
                                onChange={(e) => update('welcomeBalanceAmount', parseFloat(e?.target?.value) || 0)}
                                className="w-28 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                              <span className="text-sm text-muted-foreground">MXN</span>
                            </div>
                          </div>
                          <div className="bg-muted/50 border border-border rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Preview del mensaje al usuario:</p>
                            <p className="text-sm text-foreground italic">
                              "¡Activaste tu {config?.cardName}! Te regalamos ${config?.welcomeBalanceAmount} de saldo. Recarga más para seguir disfrutando."
                            </p>
                          </div>
                          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <Icon name="Info" size={14} className="text-amber-600 mt-0.5 shrink-0" />
                              <p className="text-xs text-amber-700 dark:text-amber-300">
                                El saldo de bienvenida se acredita una sola vez por usuario. Costo estimado mensual: ${config?.welcomeBalanceAmount * 30} MXN basado en ~30 activaciones promedio.
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </Section>

                  {/* Condiciones */}
                  <Section title="Condiciones de Uso" icon="FileText" defaultOpen={false}>
                    <div className="divide-y divide-border">
                      <Toggle checked={config?.combinableWithOtherMethods} onChange={(v) => update('combinableWithOtherMethods', v)}
                        label="Combinable con otros métodos de pago"
                        description="El usuario puede pagar parte con saldo prepago y el resto con otro método"
                        tooltip="Recomendado: activado. Permite mayor flexibilidad al usuario y reduce fricción en el pago." />
                      <div className="pt-2">
                        <Toggle checked={config?.balanceExpires} onChange={(v) => update('balanceExpires', v)}
                          label="El saldo vence"
                          description="Por defecto el saldo no vence. Activar solo si es necesario."
                          tooltip="Legal en México si se declara claramente en las condiciones. Sin vencimiento es más atractivo para el usuario." />
                        {config?.balanceExpires && (
                          <div className="mt-2 flex items-center gap-2">
                            <input type="number" min="1" value={config?.balanceExpiryMonths}
                              onChange={(e) => update('balanceExpiryMonths', parseInt(e?.target?.value) || 12)}
                              className="w-20 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                            <span className="text-sm text-muted-foreground">meses de inactividad</span>
                          </div>
                        )}
                      </div>
                      <div className="pt-2">
                        <Toggle checked={config?.balanceRefundable} onChange={(v) => update('balanceRefundable', v)}
                          label="El saldo es reembolsable"
                          description="Permite al usuario solicitar reembolso del saldo no usado"
                          tooltip="Recomendado: desactivado. El saldo solo es gastable en el negocio. Legal en México mientras se declare en las condiciones." />
                      </div>
                    </div>
                  </Section>

                  {/* Nueva Promo */}
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">Promos de Recarga</h3>
                        <p className="text-sm text-muted-foreground mt-1">Crea ofertas tipo "Carga $500, obtén $600" para incentivar recargas</p>
                      </div>
                      <Button onClick={() => navigate('/gift-cards-management/prepaid/promo/new')} iconName="Plus" iconPosition="left">
                        + Nueva Promo de Recarga
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 40% - Preview */}
              <div className="overflow-y-auto p-6 bg-muted/20" style={{ flexBasis: '40%' }}>
                <div className="sticky top-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Icon name="Smartphone" size={16} className="text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">Preview — Wallet del usuario</h3>
                  </div>
                  {/* Phone mockup */}
                  <div className="mx-auto w-64 bg-slate-900 rounded-3xl p-3 shadow-2xl">
                    <div className="flex items-center justify-between px-2 py-1 mb-2">
                      <span className="text-white text-xs">9:41</span>
                      <div className="flex items-center gap-1">
                        <Icon name="Signal" size={10} className="text-white" />
                        <Icon name="Battery" size={10} className="text-white" />
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl overflow-hidden">
                      <div className="bg-slate-100 px-3 py-2 flex items-center gap-2">
                        <Icon name="Wallet" size={14} className="text-slate-600" />
                        <span className="text-xs font-semibold text-slate-700">Mi Tarjeta</span>
                      </div>
                      <div className="p-3">
                        <div className={`bg-gradient-to-br ${template?.color} rounded-xl p-4`}>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                              <Icon name="Store" size={10} className="text-white" />
                            </div>
                            <span className="text-white text-xs font-medium">{config?.cardName || 'Tu Tarjeta'}</span>
                          </div>
                          <p className="text-white/70 text-xs">Saldo disponible</p>
                          <p className="text-white text-2xl font-bold">{formatPrice ? formatPrice(350) : '$350 MXN'}</p>
                          <p className="text-white/60 text-xs mt-1">Toca para recargar</p>
                        </div>
                        <button className={`mt-2 w-full bg-gradient-to-r ${template?.color} text-white text-xs font-semibold py-2 rounded-lg`}>
                          Recargar
                        </button>
                        {config?.reloadAmounts?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {config?.reloadAmounts?.map((a, i) => (
                              <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">${a}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="p-6 space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Tarjetas Activas', value: '142', icon: 'CreditCard', color: 'primary', trend: '+8%', up: true },
                  { label: 'Saldo en Circulación', value: formatPrice ? formatPrice(87500) : '$87,500', icon: 'Wallet', color: 'warning', trend: '+15%', up: true, note: 'liability actual' },
                  { label: 'Recargas del Mes', value: formatPrice ? formatPrice(32000) : '$32,000', icon: 'RefreshCw', color: 'success', trend: '+22%', up: true },
                  { label: 'Consumos del Mes', value: formatPrice ? formatPrice(28500) : '$28,500', icon: 'ShoppingBag', color: 'primary', trend: '+18%', up: true },
                ]?.map((kpi, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{kpi?.label}</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{kpi?.value}</p>
                        {kpi?.note && <p className="text-xs text-muted-foreground mt-0.5">{kpi?.note}</p>}
                      </div>
                      <div className={`p-2.5 bg-${kpi?.color}/10 rounded-lg`}>
                        <Icon name={kpi?.icon} size={20} className={`text-${kpi?.color}`} />
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${kpi?.up ? 'text-success' : 'text-destructive'}`}>
                      <Icon name={kpi?.up ? 'TrendingUp' : 'TrendingDown'} size={12} />
                      <span>{kpi?.trend} vs mes anterior</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-base font-semibold text-foreground mb-4">Recargas vs Consumos — Últimos 12 meses</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={mockChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 1000)?.toFixed(0)}k`} />
                    <Tooltip formatter={(v) => formatPrice ? formatPrice(v) : `$${v}`} />
                    <Legend />
                    <Line type="monotone" dataKey="recargas" name="Recargas" stroke="#2563eb" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="consumos" name="Consumos" stroke="#16a34a" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Dormant balance alert */}
              {dormantBalance > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Icon name="AlertTriangle" size={20} className="text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-amber-800 dark:text-amber-200">Saldo Dormido</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                          Tienes {formatPrice ? formatPrice(dormantBalance) : `$${dormantBalance}`} en saldo dormido en {dormantCount} tarjetas sin uso en 60+ días.
                          Envía un recordatorio para que vuelvan.
                        </p>
                      </div>
                    </div>
                    <Button size="sm" iconName="Send" iconPosition="left">Conectar CRM</Button>
                  </div>
                </div>
              )}

              {/* Users table */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Tarjetas por Usuario</h3>
                  <div className="flex gap-2">
                    <select className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none">
                      <option>Todos los saldos</option>
                      <option>Saldo alto (+$500)</option>
                      <option>Saldo medio ($100-$500)</option>
                      <option>Saldo bajo (-$100)</option>
                      <option>Saldo cero</option>
                    </select>
                    <select className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none">
                      <option>Toda actividad</option>
                      <option>Activos (30 días)</option>
                      <option>Inactivos 30+ días</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        {['Usuario','Activación','Saldo Actual','Última Recarga','Último Uso','Total Recargado','Total Consumido']?.map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {mockPrepaidUsers?.map((u, i) => (
                        <tr key={i} className="hover:bg-muted/30">
                          <td className="px-4 py-3 text-sm font-medium text-foreground">{u?.name}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{u?.activatedAt}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-foreground">{formatPrice ? formatPrice(u?.balance) : `$${u?.balance}`}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{u?.lastReload}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{u?.lastUsed}</td>
                          <td className="px-4 py-3 text-xs text-foreground">{formatPrice ? formatPrice(u?.totalReloaded) : `$${u?.totalReloaded}`}</td>
                          <td className="px-4 py-3 text-xs text-foreground">{formatPrice ? formatPrice(u?.totalConsumed) : `$${u?.totalConsumed}`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PrepaidCardPage;
