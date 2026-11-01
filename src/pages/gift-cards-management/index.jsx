import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line,
} from 'recharts';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import BusinessSelector from '../../components/BusinessSelector';
import GiftCardCard from './components/GiftCardCard';
import GiftCardFilters from './components/GiftCardFilters';
import GiftCardAnalytics from './components/GiftCardAnalytics';
import { useCurrency } from '../../contexts/CurrencyContext';
import { supabase } from '../../lib/supabase';

/* ─── shared helpers ─── */
const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

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

const Toggle = ({ checked, onChange, label, description, tooltip = null }) => (
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

/* ─── prepaid templates ─── */
const MEMBERSHIP_TEMPLATES = [
  { id: 'membership-1', label: 'Clásica', color: 'from-slate-600 to-slate-800', icon: '💳' },
  { id: 'membership-2', label: 'Premium', color: 'from-amber-500 to-yellow-600', icon: '⭐' },
  { id: 'membership-3', label: 'Moderna', color: 'from-blue-600 to-indigo-700', icon: '🔷' },
  { id: 'membership-4', label: 'Elegante', color: 'from-purple-600 to-violet-700', icon: '💜' },
  { id: 'membership-5', label: 'Natural', color: 'from-green-600 to-emerald-700', icon: '🌿' },
  { id: 'membership-6', label: 'Vibrante', color: 'from-orange-500 to-red-600', icon: '🔥' },
];

const mockChartDataBar = MONTHS?.map((m) => ({
  mes: m,
  vendidas: Math.floor(Math.random() * 80 + 20) * 500,
  canjeadas: Math.floor(Math.random() * 60 + 10) * 500,
}));

const mockChartDataLine = MONTHS?.map((m) => ({
  mes: m,
  recargas: Math.floor(Math.random() * 50 + 10) * 1000,
  consumos: Math.floor(Math.random() * 40 + 8) * 1000,
}));

const mockPrepaidUsers = [
  { name: 'María García', activatedAt: '2025-01-10', balance: 350, lastReload: '2025-02-20', lastUsed: '2025-03-01', totalReloaded: 1200, totalConsumed: 850 },
  { name: 'Carlos Ruiz', activatedAt: '2025-01-15', balance: 0, lastReload: '2025-01-15', lastUsed: '2025-01-20', totalReloaded: 200, totalConsumed: 200 },
  { name: 'Ana Torres', activatedAt: '2024-12-01', balance: 1500, lastReload: '2025-02-28', lastUsed: '2025-03-02', totalReloaded: 3000, totalConsumed: 1500 },
  { name: 'Luis Martínez', activatedAt: '2025-02-01', balance: 75, lastReload: '2025-02-01', lastUsed: '2024-12-15', totalReloaded: 500, totalConsumed: 425 },
];

const MOCK_CORP_ORDERS = [
  { id: 1, company: 'Grupo Mazatlán', quantity: 50, total: 23750, discount: 5, status: 'paid', date: '2025-02-10' },
  { id: 2, company: 'Corporativo Norteño', quantity: 120, total: 27000, discount: 10, status: 'distributed', date: '2025-01-28' },
  { id: 3, company: 'Empresa Ejemplo SA', quantity: 20, total: 20000, discount: 0, status: 'pending', date: '2025-02-20' },
];

const CORP_STATUS = {
  pending: { label: 'Pendiente', color: 'bg-warning/10 text-warning' },
  paid: { label: 'Pagada', color: 'bg-blue-100 text-blue-600' },
  distributed: { label: 'Distribuida', color: 'bg-success/10 text-success' },
  cancelled: { label: 'Cancelada', color: 'bg-destructive/10 text-destructive' },
};

const GIFT_STATUS_LABELS = { active: 'Activa', used: 'Usada', expired: 'Vencida', cancelled: 'Cancelada' };
const GIFT_STATUS_COLORS = { active: 'bg-success/10 text-success', used: 'bg-muted text-muted-foreground', expired: 'bg-destructive/10 text-destructive', cancelled: 'bg-warning/10 text-warning' };

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const GiftCardsManagement = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState('all');
  const [filters, setFilters] = useState({});

  /* ── gift cards list state ── */
  const [giftCards] = useState([
    { id: 1, businessId: '1', code: 'GC-2024-001', initialValue: 50, currentBalance: 50, status: 'active', issuedDate: '2024-12-11', expiryDate: '2025-03-11', recipientName: 'María García', recipientEmail: 'maria.garcia@email.com', recipientPhone: '+52 612 345 678', notes: 'Tarjeta de regalo para cliente frecuente' },
    { id: 2, businessId: '1', code: 'GC-2024-002', initialValue: 100, currentBalance: 35.5, status: 'active', issuedDate: '2024-12-01', expiryDate: '2025-02-28', recipientName: 'Juan Martínez', recipientEmail: 'juan.martinez@email.com', recipientPhone: '+52 623 456 789', notes: 'Regalo de cumpleaños', transactions: [{ date: '2024-12-06', type: 'redeemed', amount: 30, balance: 70, location: 'Sucursal Centro' }] },
    { id: 3, businessId: '2', code: 'GC-2024-003', initialValue: 75, currentBalance: 0, status: 'used', issuedDate: '2024-11-16', expiryDate: '2025-02-14', redeemedDate: '2024-12-06', recipientName: 'Ana López', recipientEmail: 'ana.lopez@email.com', recipientPhone: '+52 634 567 890', notes: 'Promoción especial' },
    { id: 4, businessId: '3', code: 'GC-2024-004', initialValue: 200, currentBalance: 0, status: 'used', issuedDate: '2024-11-01', expiryDate: '2025-01-30', redeemedDate: '2024-11-26', recipientName: 'Carlos Ruiz', recipientEmail: 'carlos.ruiz@email.com', recipientPhone: '+52 645 678 901', notes: 'Cliente VIP' },
    { id: 5, businessId: '1', code: 'GC-2024-005', initialValue: 50, currentBalance: 0, status: 'expired', issuedDate: '2024-08-18', expiryDate: '2024-11-16', recipientName: 'Laura Fernández', recipientEmail: 'laura.fernandez@email.com', recipientPhone: '+52 656 789 012', notes: 'Tarjeta expirada sin uso' },
    { id: 6, businessId: '2', code: 'GC-2024-006', initialValue: 150, currentBalance: 150, status: 'active', issuedDate: '2024-12-14', expiryDate: '2025-03-13', recipientName: 'Pedro Sánchez', recipientEmail: 'pedro.sanchez@email.com', recipientPhone: '+52 667 890 123', notes: 'Tarjeta corporativa' },
  ]);

  /* ── dashboard (gift cards) state ── */
  const [dashStatusFilter, setDashStatusFilter] = useState('all');
  const dashCards = [
    { code: 'ABCD-****-1234', purchaseDate: '2025-01-15', amount: 500, balance: 350, status: 'active', buyer: 'María García', beneficiary: 'Juan López', expiryDate: '2026-01-15' },
    { code: 'EFGH-****-5678', purchaseDate: '2025-02-01', amount: 250, balance: 0, status: 'used', buyer: 'Carlos Ruiz', beneficiary: 'Carlos Ruiz', expiryDate: '2026-02-01' },
    { code: 'IJKL-****-9012', purchaseDate: '2024-11-20', amount: 1000, balance: 1000, status: 'expired', buyer: 'Ana Torres', beneficiary: 'Pedro Sánchez', expiryDate: '2025-02-20' },
    { code: 'MNOP-****-3456', purchaseDate: '2025-03-01', amount: 100, balance: 75, status: 'active', buyer: 'Luis Martínez', beneficiary: 'Luis Martínez', expiryDate: '2026-03-01' },
  ];
  const dashFiltered = dashStatusFilter === 'all' ? dashCards : dashCards?.filter(c => c?.status === dashStatusFilter);
  const dashKpis = [
    { label: 'Gift Cards Vendidas', value: '247', trend: '+12%', up: true, icon: 'CreditCard', color: 'primary' },
    { label: 'Valor Total Vendido', value: formatPrice(123500), trend: '+18%', up: true, icon: 'TrendingUp', color: 'success' },
    { label: 'Valor Canjeado', value: formatPrice(89200), trend: '+8%', up: true, icon: 'CheckCircle', color: 'warning' },
    { label: 'Saldo Pendiente', value: formatPrice(34300), trend: '-3%', up: false, icon: 'Wallet', color: 'destructive', note: 'liability actual' },
  ];

  /* ── prepaid state ── */
  const [prepaidSubTab, setPrepaidSubTab] = useState('config');
  const [prepaidSaving, setPrepaidSaving] = useState(false);
  const [prepaidError, setPrepaidError] = useState(null);
  const [prepaidConfig, setPrepaidConfig] = useState({
    isActive: false, cardName: 'Tarjeta Prepago', selectedTemplate: 'membership-1',
    reloadAmounts: [100, 200, 500], allowCustomReload: false, customReloadMin: 50, customReloadMax: 5000,
    maxBalance: 5000, welcomeBalanceEnabled: false, welcomeBalanceAmount: 25,
    combinableWithOtherMethods: true, balanceExpires: false, balanceExpiryMonths: 12, balanceRefundable: false,
  });
  const updatePrepaid = (field, value) => setPrepaidConfig(prev => ({ ...prev, [field]: value }));
  const addReloadAmount = () => { if (prepaidConfig?.reloadAmounts?.length >= 6) return; updatePrepaid('reloadAmounts', [...prepaidConfig?.reloadAmounts, 100]); };
  const removeReloadAmount = (idx) => updatePrepaid('reloadAmounts', prepaidConfig?.reloadAmounts?.filter((_, i) => i !== idx));
  const updateReloadAmount = (idx, val) => { const u = [...prepaidConfig?.reloadAmounts]; u[idx] = parseFloat(val) || 0; updatePrepaid('reloadAmounts', u); };
  const prepaidTemplate = MEMBERSHIP_TEMPLATES?.find(t => t?.id === prepaidConfig?.selectedTemplate) || MEMBERSHIP_TEMPLATES?.[0];
  const dormantBalance = mockPrepaidUsers?.filter(u => new Date(u.lastUsed) < new Date(Date.now() - 60 * 24 * 60 * 60 * 1000))?.reduce((sum, u) => sum + u?.balance, 0);
  const dormantCount = mockPrepaidUsers?.filter(u => new Date(u.lastUsed) < new Date(Date.now() - 60 * 24 * 60 * 60 * 1000))?.length;

  const handleSavePrepaid = async () => {
    setPrepaidSaving(true); setPrepaidError(null);
    try {
      const { error } = await supabase?.from('prepaid_card_config')?.upsert({
        business_id: 'demo-business', is_active: prepaidConfig?.isActive, card_name: prepaidConfig?.cardName,
        selected_template: prepaidConfig?.selectedTemplate, reload_amounts: prepaidConfig?.reloadAmounts,
        allow_custom_reload: prepaidConfig?.allowCustomReload, custom_reload_min: prepaidConfig?.customReloadMin,
        custom_reload_max: prepaidConfig?.customReloadMax, max_balance: prepaidConfig?.maxBalance,
        welcome_balance_enabled: prepaidConfig?.welcomeBalanceEnabled, welcome_balance_amount: prepaidConfig?.welcomeBalanceAmount,
        combinable_with_other_methods: prepaidConfig?.combinableWithOtherMethods, balance_expires: prepaidConfig?.balanceExpires,
        balance_expiry_months: prepaidConfig?.balanceExpiryMonths, balance_refundable: prepaidConfig?.balanceRefundable,
        updated_at: new Date()?.toISOString(),
      }, { onConflict: 'business_id' });
      if (error) throw error;
    } catch (err) { setPrepaidError(err?.message); } finally { setPrepaidSaving(false); }
  };

  /* ── corporate state ── */
  const [corpSubTab, setCorpSubTab] = useState('config');
  const [corpSaving, setCorpSaving] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [corpConfig, setCorpConfig] = useState({
    isActive: false,
    volumePackages: [
      { minQty: 10, maxQty: 49, discount: 0, name: 'Equipo' },
      { minQty: 50, maxQty: 99, discount: 5, name: 'Empresa' },
      { minQty: 100, maxQty: 499, discount: 10, name: 'Corporativo' },
      { minQty: 500, maxQty: null, discount: null, name: 'Enterprise' },
    ],
    logoPosition: 'top_right', allowCustomMessage: true, useCorporateDesign: false,
    acceptSpei: true, defaultDistribution: 'excel',
  });
  const setCorpField = (key, val) => setCorpConfig(prev => ({ ...prev, [key]: val }));
  const updateCorpPackage = (idx, field, val) => { const pkgs = [...corpConfig?.volumePackages]; pkgs[idx] = { ...pkgs?.[idx], [field]: val }; setCorpField('volumePackages', pkgs); };
  const addCorpPackage = () => setCorpField('volumePackages', [...corpConfig?.volumePackages, { minQty: 0, maxQty: null, discount: 0, name: 'Nuevo paquete' }]);
  const removeCorpPackage = (idx) => setCorpField('volumePackages', corpConfig?.volumePackages?.filter((_, i) => i !== idx));
  const calcSaving = (pkg, unitAmt = 500) => { if (!pkg?.discount) return null; const total = pkg?.minQty * unitAmt; const discount = total * (pkg?.discount / 100); return { total: total - discount, saving: discount, qty: pkg?.minQty }; };
  const handleSaveCorp = async () => {
    setCorpSaving(true);
    try {
      await supabase?.from('gift_card_corporate_config')?.upsert({
        business_id: 'default', is_active: corpConfig?.isActive, volume_packages: corpConfig?.volumePackages,
        logo_position: corpConfig?.logoPosition, allow_custom_message: corpConfig?.allowCustomMessage,
        use_corporate_design: corpConfig?.useCorporateDesign, accept_spei: corpConfig?.acceptSpei,
        default_distribution: corpConfig?.defaultDistribution, updated_at: new Date()?.toISOString(),
      }, { onConflict: 'business_id' });
    } catch (e) { console.error(e); } finally { setCorpSaving(false); }
  };

  /* ── list helpers ── */
  const filterCards = () => {
    let f = giftCards;
    if (selectedBusinessId && selectedBusinessId !== 'all') f = f?.filter(c => c?.businessId === selectedBusinessId);
    if (filters?.search) f = f?.filter(c => c?.code?.toLowerCase()?.includes(filters?.search?.toLowerCase()) || c?.recipientName?.toLowerCase()?.includes(filters?.search?.toLowerCase()));
    if (filters?.status && filters?.status !== 'all') f = f?.filter(c => c?.status === filters?.status);
    if (filters?.sortBy) {
      f = [...f]?.sort((a, b) => {
        switch (filters?.sortBy) {
          case 'issued_desc': return new Date(b?.issuedDate) - new Date(a?.issuedDate);
          case 'issued_asc': return new Date(a?.issuedDate) - new Date(b?.issuedDate);
          case 'value_desc': return b?.initialValue - a?.initialValue;
          case 'value_asc': return a?.initialValue - b?.initialValue;
          default: return 0;
        }
      });
    }
    return f;
  };

  const getMetrics = () => {
    const fc = filterCards();
    const totalIssued = fc?.length;
    const totalRedeemed = fc?.filter(c => c?.status === 'used')?.length;
    const activeCards = fc?.filter(c => c?.status === 'active')?.length;
    const expiredCards = fc?.filter(c => c?.status === 'expired')?.length;
    const totalValue = fc?.reduce((sum, c) => sum + c?.initialValue, 0);
    const totalBalance = fc?.filter(c => c?.status === 'active')?.reduce((sum, c) => sum + c?.currentBalance, 0);
    const redemptionRate = totalIssued > 0 ? ((totalRedeemed / totalIssued) * 100)?.toFixed(1) : 0;
    return { totalIssued, totalRedeemed, activeCards, expiredCards, totalValue, totalBalance, redemptionRate };
  };

  const handleDeleteCard = (cardId) => { if (window.confirm('¿Eliminar esta tarjeta?')) {} };
  const handleViewAnalytics = (cardId) => { setSelectedCard(giftCards?.find(c => c?.id === cardId)); setActiveTab('analytics'); };
  const handleViewTransactions = (cardId) => { setSelectedCard(giftCards?.find(c => c?.id === cardId)); };

  const metrics = getMetrics();
  const filteredCards = filterCards();
  const user = { name: 'Carlos Mendoza', email: 'carlos@promospot.mx', role: 'owner' };

  const TABS = [
    { id: 'list', label: 'Tarjetas', icon: 'CreditCard' },
    { id: 'dashboard', label: 'Dashboard', icon: 'BarChart3' },
    { id: 'prepaid', label: 'Tarjeta Prepago', icon: 'Wallet' },
    { id: 'corporate', label: 'Corporativas', icon: 'Building2' },
  ];

  const mainClasses = `pt-16 transition-all duration-300 ${
    isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
  }`;

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} userRole={user?.role}
        isCollapsed={isSidebarCollapsed} onCollapse={setIsSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <main className={mainClasses}>

          {/* ── Page header ── */}
          <div className="px-6 pt-6 pb-4 border-b border-border bg-background">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Tarjetas de Regalo</h1>
                  <p className="text-muted-foreground text-sm mt-0.5">Gestiona gift cards digitales, corporativas y tarjetas prepago</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" iconName="Download" iconPosition="left">Exportar</Button>
                  <Button onClick={() => navigate('/gift-cards-management/new')} iconName="Plus" iconPosition="left">Nueva Configuración</Button>
                </div>
              </div>
              {/* Tabs */}
              <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit overflow-x-auto">
                {TABS?.map(tab => (
                  <button key={tab?.id} onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab?.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                    <Icon name={tab?.icon} size={15} />{tab?.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════
              TAB: TARJETAS (list)
          ══════════════════════════════════════════ */}
          {activeTab === 'list' && (
            <div className="p-6 max-w-7xl mx-auto space-y-6">
              <div className="bg-card border border-border rounded-lg p-4">
                <BusinessSelector value={selectedBusinessId} onChange={setSelectedBusinessId} label="Filtrar por establecimiento" error="" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-lg p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Tarjetas Emitidas</p><p className="text-3xl font-bold text-foreground mt-1">{metrics?.totalIssued}</p></div><div className="p-3 bg-primary/10 rounded-lg"><Icon name="CreditCard" size={24} className="text-primary" /></div></div></div>
                <div className="bg-card border border-border rounded-lg p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Tarjetas Canjeadas</p><p className="text-3xl font-bold text-success mt-1">{metrics?.totalRedeemed}</p><p className="text-xs text-muted-foreground mt-1">Tasa: {metrics?.redemptionRate}%</p></div><div className="p-3 bg-success/10 rounded-lg"><Icon name="CheckCircle" size={24} className="text-success" /></div></div></div>
                <div className="bg-card border border-border rounded-lg p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Tarjetas Activas</p><p className="text-3xl font-bold text-primary mt-1">{metrics?.activeCards}</p><p className="text-xs text-muted-foreground mt-1">Balance: {formatPrice(metrics?.totalBalance)}</p></div><div className="p-3 bg-primary/10 rounded-lg"><Icon name="Zap" size={24} className="text-primary" /></div></div></div>
                <div className="bg-card border border-border rounded-lg p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Valor Total Emitido</p><p className="text-3xl font-bold text-foreground mt-1">{formatPrice(metrics?.totalValue)}</p></div><div className="p-3 bg-warning/10 rounded-lg"><Icon name="DollarSign" size={24} className="text-warning" /></div></div></div>
              </div>
              <GiftCardFilters onFiltersChange={f => setFilters(f)} onReset={() => setFilters({})} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCards?.map(card => (
                  <GiftCardCard key={card?.id} card={card}
                    onEdit={(id) => navigate(`/gift-cards-management/edit/${id}`)}
                    onDelete={handleDeleteCard}
                    onViewAnalytics={handleViewAnalytics}
                    onViewTransactions={handleViewTransactions}
                  />
                ))}
              </div>
              {filteredCards?.length === 0 && (
                <div className="text-center py-12">
                  <Icon name="CreditCard" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No se encontraron tarjetas de regalo</h3>
                  <p className="text-muted-foreground mb-4">Comienza creando tu primera configuración de gift cards</p>
                  <Button onClick={() => navigate('/gift-cards-management/new')} iconName="Plus" iconPosition="left">Nueva Configuración</Button>
                </div>
              )}
            </div>
          )}

          {/* analytics sub-view */}
          {activeTab === 'analytics' && selectedCard && (
            <div className="p-6 max-w-7xl mx-auto">
              <GiftCardAnalytics card={selectedCard} onClose={() => setActiveTab('list')} />
            </div>
          )}

          {/* ══════════════════════════════════════════
              TAB: DASHBOARD
          ══════════════════════════════════════════ */}
          {activeTab === 'dashboard' && (
            <div className="p-6 max-w-7xl mx-auto space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashKpis?.map((kpi, i) => (
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
                <h3 className="text-base font-semibold text-foreground mb-4">Ventas vs Canjes — Últimos 12 meses</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={mockChartDataBar} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 1000)?.toFixed(0)}k`} />
                    <Tooltip formatter={(v) => formatPrice(v)} />
                    <Legend />
                    <Bar dataKey="vendidas" name="Vendidas" fill="#2563eb" radius={[4,4,0,0]} />
                    <Bar dataKey="canjeadas" name="Canjeadas" fill="#16a34a" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Table */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Gift Cards Individuales</h3>
                  <div className="flex items-center gap-2">
                    <select value={dashStatusFilter} onChange={(e) => setDashStatusFilter(e?.target?.value)}
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="all">Todos los estados</option>
                      <option value="active">Activas</option>
                      <option value="used">Usadas</option>
                      <option value="expired">Vencidas</option>
                      <option value="cancelled">Canceladas</option>
                    </select>
                    <Button variant="outline" size="sm" iconName="Download" iconPosition="left">Excel</Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>{['Código','Fecha Compra','Monto','Saldo','Estado','Comprador','Beneficiario','Vencimiento']?.map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {dashFiltered?.map((card, i) => (
                        <tr key={i} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-foreground">{card?.code}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{card?.purchaseDate}</td>
                          <td className="px-4 py-3 text-xs font-medium text-foreground">{formatPrice(card?.amount)}</td>
                          <td className="px-4 py-3 text-xs font-medium text-foreground">{formatPrice(card?.balance)}</td>
                          <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${GIFT_STATUS_COLORS?.[card?.status]}`}>{GIFT_STATUS_LABELS?.[card?.status]}</span></td>
                          <td className="px-4 py-3 text-xs text-foreground">{card?.buyer}</td>
                          <td className="px-4 py-3 text-xs text-foreground">{card?.beneficiary}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{card?.expiryDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {dashFiltered?.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">No hay gift cards con ese filtro</div>}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              TAB: TARJETA PREPAGO
          ══════════════════════════════════════════ */}
          {activeTab === 'prepaid' && (
            <div className="flex-1">
              {/* Prepaid sub-header */}
              <div className="px-6 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1 bg-background border border-border p-1 rounded-lg">
                    {[{ id: 'config', label: 'Configuración', icon: 'Settings' }, { id: 'dashboard', label: 'Dashboard', icon: 'BarChart3' }]?.map(t => (
                      <button key={t?.id} onClick={() => setPrepaidSubTab(t?.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${prepaidSubTab === t?.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                        <Icon name={t?.icon} size={13} />{t?.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5">
                    <span className="text-xs font-medium text-foreground">Tarjeta activa</span>
                    <button onClick={() => updatePrepaid('isActive', !prepaidConfig?.isActive)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${prepaidConfig?.isActive ? 'bg-primary' : 'bg-muted'}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${prepaidConfig?.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
                <Button onClick={handleSavePrepaid} loading={prepaidSaving} iconName="Save" iconPosition="left" size="sm">Guardar</Button>
              </div>

              {prepaidError && <div className="mx-6 mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">{prepaidError}</div>}

              {prepaidSubTab === 'config' && (
                <div className="flex" style={{ minHeight: 'calc(100vh - 220px)' }}>
                  {/* Left 60% */}
                  <div className="flex-1 overflow-y-auto p-6 border-r border-border" style={{ flexBasis: '60%' }}>
                    <div className="max-w-2xl space-y-2">
                      <Section title="Identidad de la Tarjeta" icon="CreditCard">
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-sm font-medium text-foreground">Nombre de la tarjeta</label>
                              <span className="text-xs text-muted-foreground">{prepaidConfig?.cardName?.length}/30</span>
                            </div>
                            <input type="text" maxLength={30} value={prepaidConfig?.cardName}
                              onChange={(e) => updatePrepaid('cardName', e?.target?.value)}
                              placeholder="Ej: Tarjeta Café Roma"
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground mb-2">Diseño de la tarjeta</p>
                            <div className="grid grid-cols-3 gap-3">
                              {MEMBERSHIP_TEMPLATES?.map(t => (
                                <button key={t?.id} onClick={() => updatePrepaid('selectedTemplate', t?.id)}
                                  className={`relative rounded-xl overflow-hidden border-2 transition-all ${prepaidConfig?.selectedTemplate === t?.id ? 'border-primary shadow-md scale-105' : 'border-transparent hover:border-border'}`}>
                                  <div className={`bg-gradient-to-br ${t?.color} h-14 flex items-center justify-center`}>
                                    <span className="text-2xl">{t?.icon}</span>
                                  </div>
                                  <div className="bg-card px-2 py-1"><p className="text-xs text-center text-foreground">{t?.label}</p></div>
                                  {prepaidConfig?.selectedTemplate === t?.id && (
                                    <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5"><Icon name="Check" size={10} className="text-white" /></div>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Section>

                      <Section title="Montos de Recarga" icon="RefreshCw">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Opciones de recarga disponibles</p>
                            <button onClick={addReloadAmount} disabled={prepaidConfig?.reloadAmounts?.length >= 6}
                              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 disabled:opacity-40 font-medium">
                              <Icon name="Plus" size={14} /> Agregar
                            </button>
                          </div>
                          {prepaidConfig?.reloadAmounts?.map((amount, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">$</span>
                              <input type="number" min="50" value={amount} onChange={(e) => updateReloadAmount(idx, e?.target?.value)}
                                className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                              <span className="text-xs text-muted-foreground">MXN</span>
                              <button onClick={() => removeReloadAmount(idx)} className="text-muted-foreground hover:text-destructive"><Icon name="X" size={14} /></button>
                            </div>
                          ))}
                          <div className="pt-2 border-t border-border">
                            <Toggle checked={prepaidConfig?.allowCustomReload} onChange={(v) => updatePrepaid('allowCustomReload', v)}
                              label="Monto libre de recarga" description="El usuario elige cuánto recargar" />
                            {prepaidConfig?.allowCustomReload && (
                              <div className="grid grid-cols-2 gap-3 mt-2">
                                <div>
                                  <label className="text-xs text-muted-foreground mb-1 block">Mínimo (MXN)</label>
                                  <input type="number" min="50" value={prepaidConfig?.customReloadMin}
                                    onChange={(e) => updatePrepaid('customReloadMin', parseFloat(e?.target?.value) || 50)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                                </div>
                                <div>
                                  <label className="text-xs text-muted-foreground mb-1 block">Máximo (MXN)</label>
                                  <input type="number" min="50" value={prepaidConfig?.customReloadMax}
                                    onChange={(e) => updatePrepaid('customReloadMax', parseFloat(e?.target?.value) || 5000)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="pt-2 border-t border-border">
                            <label className="text-sm font-medium text-foreground mb-1 block">Saldo máximo en tarjeta (MXN)</label>
                            <input type="number" min="100" value={prepaidConfig?.maxBalance}
                              onChange={(e) => updatePrepaid('maxBalance', parseFloat(e?.target?.value) || 5000)}
                              className="w-40 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                          </div>
                        </div>
                      </Section>

                      <Section title="Saldo de Bienvenida" icon="Gift" defaultOpen={false}>
                        <div className="space-y-4">
                          <Toggle checked={prepaidConfig?.welcomeBalanceEnabled} onChange={(v) => updatePrepaid('welcomeBalanceEnabled', v)}
                            label="Saldo de bienvenida al activar"
                            description="Se acredita automáticamente la primera vez que el usuario activa su tarjeta" />
                          {prepaidConfig?.welcomeBalanceEnabled && (
                            <div>
                              <label className="text-sm font-medium text-foreground mb-1 block">Monto de bienvenida (MXN)</label>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">$</span>
                                <input type="number" min="1" value={prepaidConfig?.welcomeBalanceAmount}
                                  onChange={(e) => updatePrepaid('welcomeBalanceAmount', parseFloat(e?.target?.value) || 0)}
                                  className="w-28 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                                <span className="text-sm text-muted-foreground">MXN</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </Section>

                      <Section title="Condiciones de Uso" icon="FileText" defaultOpen={false}>
                        <div className="divide-y divide-border">
                          <Toggle checked={prepaidConfig?.combinableWithOtherMethods} onChange={(v) => updatePrepaid('combinableWithOtherMethods', v)}
                            label="Combinable con otros métodos de pago"
                            description="El usuario puede pagar parte con saldo prepago y el resto con otro método" />
                          <div className="pt-2">
                            <Toggle checked={prepaidConfig?.balanceExpires} onChange={(v) => updatePrepaid('balanceExpires', v)}
                              label="El saldo vence" description="Por defecto el saldo no vence. Activar solo si es necesario." />
                            {prepaidConfig?.balanceExpires && (
                              <div className="mt-2 flex items-center gap-2">
                                <input type="number" min="1" value={prepaidConfig?.balanceExpiryMonths}
                                  onChange={(e) => updatePrepaid('balanceExpiryMonths', parseInt(e?.target?.value) || 12)}
                                  className="w-20 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                                <span className="text-sm text-muted-foreground">meses de inactividad</span>
                              </div>
                            )}
                          </div>
                          <div className="pt-2">
                            <Toggle checked={prepaidConfig?.balanceRefundable} onChange={(v) => updatePrepaid('balanceRefundable', v)}
                              label="El saldo es reembolsable" description="Permite al usuario solicitar reembolso del saldo no usado" />
                          </div>
                        </div>
                      </Section>

                      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">Promos de Recarga</h3>
                            <p className="text-sm text-muted-foreground mt-1">Crea ofertas tipo "Carga $500, obtén $600"</p>
                          </div>
                          <Button onClick={() => navigate('/gift-cards-management/prepaid/promo/new')} iconName="Plus" iconPosition="left">+ Nueva Promo</Button>
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
                            <div className={`bg-gradient-to-br ${prepaidTemplate?.color} rounded-xl p-4`}>
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                                  <Icon name="Store" size={10} className="text-white" />
                                </div>
                                <span className="text-white text-xs font-medium">{prepaidConfig?.cardName || 'Tu Tarjeta'}</span>
                              </div>
                              <p className="text-white/70 text-xs">Saldo disponible</p>
                              <p className="text-white text-2xl font-bold">{formatPrice(350)}</p>
                              <p className="text-white/60 text-xs mt-1">Toca para recargar</p>
                            </div>
                            <button className={`mt-2 w-full bg-gradient-to-r ${prepaidTemplate?.color} text-white text-xs font-semibold py-2 rounded-lg`}>Recargar</button>
                            {prepaidConfig?.reloadAmounts?.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {prepaidConfig?.reloadAmounts?.map((a, i) => (
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

              {prepaidSubTab === 'dashboard' && (
                <div className="p-6 max-w-7xl mx-auto space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Tarjetas Activas', value: '142', icon: 'CreditCard', color: 'primary', trend: '+8%', up: true },
                      { label: 'Saldo en Circulación', value: formatPrice(87500), icon: 'Wallet', color: 'warning', trend: '+15%', up: true, note: 'liability actual' },
                      { label: 'Recargas del Mes', value: formatPrice(32000), icon: 'RefreshCw', color: 'success', trend: '+22%', up: true },
                      { label: 'Consumos del Mes', value: formatPrice(28500), icon: 'ShoppingBag', color: 'primary', trend: '+18%', up: true },
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
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="text-base font-semibold text-foreground mb-4">Recargas vs Consumos — Últimos 12 meses</h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={mockChartDataLine}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 1000)?.toFixed(0)}k`} />
                        <Tooltip formatter={(v) => formatPrice(v)} />
                        <Legend />
                        <Line type="monotone" dataKey="recargas" name="Recargas" stroke="#2563eb" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="consumos" name="Consumos" stroke="#16a34a" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  {dormantBalance > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <Icon name="AlertTriangle" size={20} className="text-amber-600 mt-0.5 shrink-0" />
                          <div>
                            <h4 className="font-semibold text-amber-800 dark:text-amber-200">Saldo Dormido</h4>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                              Tienes {formatPrice(dormantBalance)} en saldo dormido en {dormantCount} tarjetas sin uso en 60+ días.
                            </p>
                          </div>
                        </div>
                        <Button size="sm" iconName="Send" iconPosition="left">Conectar CRM</Button>
                      </div>
                    </div>
                  )}
                  <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-border"><h3 className="font-semibold text-foreground">Tarjetas por Usuario</h3></div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>{['Usuario','Activación','Saldo Actual','Última Recarga','Último Uso','Total Recargado','Total Consumido']?.map(h => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                          ))}</tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {mockPrepaidUsers?.map((u, i) => (
                            <tr key={i} className="hover:bg-muted/30">
                              <td className="px-4 py-3 text-sm font-medium text-foreground">{u?.name}</td>
                              <td className="px-4 py-3 text-xs text-muted-foreground">{u?.activatedAt}</td>
                              <td className="px-4 py-3 text-sm font-semibold text-foreground">{formatPrice(u?.balance)}</td>
                              <td className="px-4 py-3 text-xs text-muted-foreground">{u?.lastReload}</td>
                              <td className="px-4 py-3 text-xs text-muted-foreground">{u?.lastUsed}</td>
                              <td className="px-4 py-3 text-xs text-foreground">{formatPrice(u?.totalReloaded)}</td>
                              <td className="px-4 py-3 text-xs text-foreground">{formatPrice(u?.totalConsumed)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════
              TAB: CORPORATIVAS
          ══════════════════════════════════════════ */}
          {activeTab === 'corporate' && (
            <div className="flex-1">
              {/* Corporate sub-header */}
              <div className="px-6 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1 bg-background border border-border p-1 rounded-lg">
                    {[{ id: 'config', label: 'Configuración', icon: 'Settings' }, { id: 'orders', label: 'Pedidos', icon: 'ShoppingBag' }]?.map(t => (
                      <button key={t?.id} onClick={() => setCorpSubTab(t?.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${corpSubTab === t?.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                        <Icon name={t?.icon} size={13} />{t?.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5">
                    <span className="text-xs font-medium text-foreground">Canal corporativo activo</span>
                    <button onClick={() => setCorpField('isActive', !corpConfig?.isActive)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${corpConfig?.isActive ? 'bg-primary' : 'bg-muted'}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${corpConfig?.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
                {corpSubTab === 'config' && <Button onClick={handleSaveCorp} loading={corpSaving} iconName="Save" iconPosition="left" size="sm">Guardar</Button>}
              </div>

              {corpSubTab === 'config' && (
                <div className="p-6 max-w-5xl mx-auto space-y-4">
                  <Section title="Paquetes por volumen" icon="Package">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b border-border">
                          {['Cantidad mínima','Cantidad máxima','Descuento (%)','Nombre del paquete','Cálculo ejemplo ($500 c/u)','']?.map(h => (
                            <th key={h} className="text-left pb-2 pr-4 text-xs text-muted-foreground font-medium">{h}</th>
                          ))}
                        </tr></thead>
                        <tbody className="divide-y divide-border">
                          {corpConfig?.volumePackages?.map((pkg, idx) => {
                            const calc = calcSaving(pkg);
                            return (
                              <tr key={idx}>
                                <td className="py-2 pr-4"><input type="number" value={pkg?.minQty} onChange={e => updateCorpPackage(idx, 'minQty', Number(e?.target?.value))} className="w-20 rounded border border-input bg-background px-2 py-1 text-sm" /></td>
                                <td className="py-2 pr-4"><input type="number" value={pkg?.maxQty || ''} onChange={e => updateCorpPackage(idx, 'maxQty', e?.target?.value ? Number(e?.target?.value) : null)} placeholder="Sin límite" className="w-24 rounded border border-input bg-background px-2 py-1 text-sm" /></td>
                                <td className="py-2 pr-4">{pkg?.discount === null ? <span className="text-xs text-muted-foreground italic">Personalizado</span> : <input type="number" value={pkg?.discount} onChange={e => updateCorpPackage(idx, 'discount', Number(e?.target?.value))} className="w-16 rounded border border-input bg-background px-2 py-1 text-sm" />}</td>
                                <td className="py-2 pr-4"><input type="text" value={pkg?.name} onChange={e => updateCorpPackage(idx, 'name', e?.target?.value)} className="w-32 rounded border border-input bg-background px-2 py-1 text-sm" /></td>
                                <td className="py-2 pr-4">{calc ? <span className="text-xs text-muted-foreground">{calc?.qty} cards → <span className="text-foreground font-medium">{formatPrice(calc?.total)}</span><span className="text-success ml-1">(ahorro {formatPrice(calc?.saving)})</span></span> : <span className="text-xs text-muted-foreground">Cotización directa</span>}</td>
                                <td className="py-2"><button type="button" onClick={() => removeCorpPackage(idx)} className="p-1 text-destructive hover:bg-destructive/10 rounded"><Icon name="Trash2" size={14} /></button></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <button type="button" onClick={addCorpPackage} className="flex items-center gap-2 text-primary text-sm hover:underline mt-2"><Icon name="Plus" size={16} /> Agregar paquete</button>
                  </Section>

                  <Section title="Personalización corporativa" icon="Layers">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Posición del logo corporativo</label>
                        <select value={corpConfig?.logoPosition} onChange={e => setCorpField('logoPosition', e?.target?.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                          <option value="top_right">Esquina superior derecha</option>
                          <option value="top_left">Esquina superior izquierda</option>
                          <option value="bottom_right">Esquina inferior derecha</option>
                          <option value="beside_logo">Al lado del logo del negocio</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        {[{ key: 'allowCustomMessage', label: 'Mensaje personalizable de la empresa' }, { key: 'useCorporateDesign', label: 'Diseño específico para corporativos' }]?.map(item => (
                          <div key={item?.key} className="flex items-center justify-between">
                            <p className="text-sm text-foreground">{item?.label}</p>
                            <button type="button" onClick={() => setCorpField(item?.key, !corpConfig?.[item?.key])}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${corpConfig?.[item?.key] ? 'bg-primary' : 'bg-muted'}`}>
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${corpConfig?.[item?.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl p-5 relative overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-white/20 rounded-lg px-3 py-1.5"><p className="text-white text-xs font-bold">Tu Negocio</p></div>
                        {corpConfig?.logoPosition === 'top_right' && <div className="bg-white/20 rounded-lg px-3 py-1.5"><p className="text-white text-xs">Logo Empresa</p></div>}
                      </div>
                      <p className="text-white font-bold text-xl">$500.00 MXN</p>
                      <p className="text-white/70 text-xs mt-1">Gift Card Corporativa</p>
                      {corpConfig?.allowCustomMessage && <p className="text-white/60 text-xs mt-2 italic">"Felices fiestas — Tu equipo de RH"</p>}
                    </div>
                  </Section>

                  <Section title="Facturación y Distribución" icon="FileText">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div><p className="text-sm font-medium text-foreground">Aceptar pago por transferencia SPEI</p><p className="text-xs text-muted-foreground">El pedido se procesa cuando el pago se confirma</p></div>
                        <button type="button" onClick={() => setCorpField('acceptSpei', !corpConfig?.acceptSpei)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${corpConfig?.acceptSpei ? 'bg-primary' : 'bg-muted'}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${corpConfig?.acceptSpei ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Método de distribución por defecto</label>
                        <select value={corpConfig?.defaultDistribution} onChange={e => setCorpField('defaultDistribution', e?.target?.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                          <option value="excel">Archivo Excel con códigos</option>
                          <option value="email_individual">Envío individual por email</option>
                          <option value="qr_printable">Códigos QR imprimibles</option>
                        </select>
                      </div>
                      <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                        <Icon name="Info" size={16} className="text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-700 dark:text-amber-300">Cada pedido corporativo se gestiona desde la bandeja de pedidos. Las compras corporativas generan una sola factura CFDI por el total del lote.</p>
                      </div>
                    </div>
                  </Section>
                </div>
              )}

              {corpSubTab === 'orders' && (
                <div className="p-6 max-w-5xl mx-auto space-y-4">
                  {selectedOrder ? (
                    <div className="bg-card border border-border rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <button type="button" onClick={() => setSelectedOrder(null)} className="p-2 rounded-lg hover:bg-muted"><Icon name="ArrowLeft" size={18} className="text-muted-foreground" /></button>
                        <h2 className="text-lg font-semibold text-foreground">Pedido — {selectedOrder?.company}</h2>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {[{ label: 'Empresa', value: selectedOrder?.company }, { label: 'Cantidad', value: `${selectedOrder?.quantity} gift cards` }, { label: 'Total', value: formatPrice(selectedOrder?.total) }, { label: 'Estado', value: CORP_STATUS?.[selectedOrder?.status]?.label }]?.map(item => (
                          <div key={item?.label} className="bg-muted/30 rounded-lg p-3"><p className="text-xs text-muted-foreground">{item?.label}</p><p className="font-semibold text-foreground mt-0.5">{item?.value}</p></div>
                        ))}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" iconName="CheckCircle" iconPosition="left">Confirmar pago</Button>
                        <Button size="sm" variant="outline" iconName="FileText" iconPosition="left">Generar CFDI</Button>
                        <Button size="sm" variant="outline" iconName="Send" iconPosition="left">Distribuir códigos</Button>
                        <Button size="sm" variant="outline" iconName="X" iconPosition="left" className="text-destructive border-destructive/30">Cancelar pedido</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                      <div className="p-4 border-b border-border"><h2 className="text-lg font-semibold text-foreground">Pedidos corporativos</h2></div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50"><tr>{['Empresa','Cantidad','Monto total','Descuento','Estado','Fecha','']?.map(h => <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>)}</tr></thead>
                          <tbody className="divide-y divide-border">
                            {MOCK_CORP_ORDERS?.map(order => (
                              <tr key={order?.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3 font-medium text-foreground">{order?.company}</td>
                                <td className="px-4 py-3 text-muted-foreground">{order?.quantity}</td>
                                <td className="px-4 py-3 font-medium text-foreground">{formatPrice(order?.total)}</td>
                                <td className="px-4 py-3 text-success">{order?.discount > 0 ? `${order?.discount}%` : '—'}</td>
                                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CORP_STATUS?.[order?.status]?.color}`}>{CORP_STATUS?.[order?.status]?.label}</span></td>
                                <td className="px-4 py-3 text-muted-foreground">{order?.date}</td>
                                <td className="px-4 py-3"><button type="button" onClick={() => setSelectedOrder(order)} className="text-primary text-xs hover:underline">Ver detalle</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </main>
    </div>
  );
};

export default GiftCardsManagement;