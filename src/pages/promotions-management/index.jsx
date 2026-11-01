import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { supabase } from '../../lib/supabase';
import useRealtimeData from '../../hooks/useRealtimeData';

// Import components


import PromotionPreview from './components/PromotionPreview';
import BulkActions from './components/BulkActions';
import AdvancedPromotionCard from './components/AdvancedPromotionCard';

import RoleGuard from '../../components/ui/RoleGuard';
import PromotionAnalyticsModal from './components/PromotionAnalyticsModal';

// ── ANALYTICS DATA ─────────────────────────────────────────────────────────
const analyticsMonthly = [
  { mes: 'Ene', impresiones: 4200, clics: 980, canjes: 312, revenue: 18400 },
  { mes: 'Feb', impresiones: 5100, clics: 1230, canjes: 410, revenue: 22100 },
  { mes: 'Mar', impresiones: 6800, clics: 1540, canjes: 520, revenue: 29800 },
  { mes: 'Abr', impresiones: 5900, clics: 1320, canjes: 445, revenue: 25600 },
  { mes: 'May', impresiones: 7200, clics: 1780, canjes: 601, revenue: 34200 },
  { mes: 'Jun', impresiones: 8100, clics: 2010, canjes: 680, revenue: 38900 },
];

const typeDistribution = [
  { name: 'Estándar', value: 38, color: '#2563EB' },
  { name: 'Flash Deal', value: 22, color: '#DC2626' },
  { name: 'Happy Hour', value: 18, color: '#D97706' },
  { name: 'Drop Limitado', value: 12, color: '#7C3AED' },
  { name: 'Otros', value: 10, color: '#6B7280' },
];

const topPromos = [
  { title: 'Happy Hour 5-7pm', canjes: 156, revenue: 9360, roi: '312%', tipo: 'Happy Hour' },
  { title: 'Flash Deal Tarde 40%', canjes: 87, revenue: 5220, roi: '248%', tipo: 'Flash Deal' },
  { title: 'Bienvenida Primera Visita', canjes: 67, revenue: 4020, roi: '201%', tipo: 'Primera Visita' },
  { title: 'Descuento Verano 2024', canjes: 156, revenue: 9360, roi: '187%', tipo: 'Estándar' },
  { title: 'Menú del Día Especial', canjes: 89, revenue: 5340, roi: '165%', tipo: 'Estándar' },
];

const ESTABLISHMENTS = [
  { id: 'all', label: 'Todos los establecimientos' },
  { id: 'est-1', label: 'Sucursal Centro' },
  { id: 'est-2', label: 'Sucursal Norte' },
  { id: 'est-3', label: 'Sucursal Sur' },
];

// ── ANALYTICS TAB ──────────────────────────────────────────────────────────
const AnalyticsTab = ({ selectedEstablishment }) => {
  const [dateRange, setDateRange] = useState('6m');

  const kpis = [
    { label: 'Impresiones totales', value: '37,300', change: '+18%', icon: 'Eye', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Clics totales', value: '8,860', change: '+22%', icon: 'MousePointerClick', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Canjes totales', value: '2,968', change: '+31%', icon: 'Ticket', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Revenue atribuido', value: '$168,900', change: '+27%', icon: 'DollarSign', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'CTR promedio', value: '23.7%', change: '+4.2pp', icon: 'TrendingUp', color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Tasa de canje', value: '33.5%', change: '+6.1pp', icon: 'BarChart2', color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Date range selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Rendimiento de Promociones</h2>
        <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
          {[
            { id: '1m', label: '1 mes' },
            { id: '3m', label: '3 meses' },
            { id: '6m', label: '6 meses' },
            { id: '1y', label: '1 año' },
          ]?.map(r => (
            <button
              key={r?.id}
              onClick={() => setDateRange(r?.id)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${dateRange === r?.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
            >
              {r?.label}
            </button>
          ))}
        </div>
      </div>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis?.map((kpi, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg ${kpi?.bg} flex items-center justify-center mb-3`}>
              <Icon name={kpi?.icon} size={18} className={kpi?.color} />
            </div>
            <div className="text-xl font-bold text-foreground">{kpi?.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{kpi?.label}</div>
            <div className="text-xs text-green-600 font-medium mt-1">{kpi?.change} vs periodo anterior</div>
          </div>
        ))}
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Tendencia mensual</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={analyticsMonthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="impresiones" stroke="#2563EB" strokeWidth={2} dot={false} name="Impresiones" />
              <Line type="monotone" dataKey="clics" stroke="#7C3AED" strokeWidth={2} dot={false} name="Clics" />
              <Line type="monotone" dataKey="canjes" stroke="#059669" strokeWidth={2} dot={false} name="Canjes" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Type distribution */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Distribución por tipo</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={typeDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                {typeDistribution?.map((entry, i) => (
                  <Cell key={i} fill={entry?.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {typeDistribution?.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item?.color }} />
                  <span className="text-muted-foreground">{item?.name}</span>
                </div>
                <span className="font-medium text-foreground">{item?.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Revenue bar chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Revenue atribuido por mes (MXN)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={analyticsMonthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000)?.toFixed(0)}k`} />
            <Tooltip formatter={v => [`$${v?.toLocaleString()}`, 'Revenue']} />
            <Bar dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Top promotions table */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Top 5 Promociones por Rendimiento</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Promoción</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Tipo</th>
                <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Canjes</th>
                <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Revenue</th>
                <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">ROI</th>
              </tr>
            </thead>
            <tbody>
              {topPromos?.map((p, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-foreground">{p?.title}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{p?.tipo}</td>
                  <td className="py-2.5 px-3 text-right text-foreground">{p?.canjes}</td>
                  <td className="py-2.5 px-3 text-right text-foreground">${p?.revenue?.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-green-600 font-semibold">{p?.roi}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ── ESTABLISHMENT SELECTOR ─────────────────────────────────────────────────
const EstablishmentSelector = ({ selected, onChange }) => (
  <div className="bg-card border border-border rounded-xl p-4 mb-4">
    <div className="flex items-center gap-2 mb-3">
      <Icon name="Building2" size={16} className="text-muted-foreground" />
      <span className="text-sm font-medium text-foreground">Establecimiento</span>
    </div>
    <div className="flex items-center gap-2 flex-wrap">
      {ESTABLISHMENTS?.map(est => (
        <button
          key={est?.id}
          onClick={() => onChange(est?.id)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === est?.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {est?.label}
        </button>
      ))}
      {selected !== 'all' && (
        <span className="text-sm text-muted-foreground">
          {ESTABLISHMENTS?.find(e => e?.id === selected)?.label || ''}
        </span>
      )}
    </div>
  </div>
);

// ── INLINE FILTERS (no "Filtros" bar header) ───────────────────────────────
const InlineFilters = ({ filters, onFilterChange, onClearFilters, totalPromotions }) => {
  const hasActiveFilters = filters?.search || filters?.status !== 'all' || filters?.discountType !== 'all' || filters?.dateFrom || filters?.dateTo;

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{totalPromotions} promociones</span>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button onClick={onClearFilters} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Icon name="X" size={12} />
              Limpiar filtros
            </button>
          )}
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5">
            <Icon name="Download" size={13} />
            Exportar
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar promociones..."
          value={filters?.search || ''}
          onChange={e => onFilterChange('search', e?.target?.value)}
          className="flex-1 min-w-[180px] px-3 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <select
          value={filters?.status || 'all'}
          onChange={e => onFilterChange('status', e?.target?.value)}
          className="px-3 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activa</option>
          <option value="draft">Borrador</option>
          <option value="scheduled">Programada</option>
          <option value="paused">Pausada</option>
          <option value="expired">Expirada</option>
        </select>
        <select
          value={filters?.sortBy || 'created_desc'}
          onChange={e => onFilterChange('sortBy', e?.target?.value)}
          className="px-3 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="created_desc">Más recientes</option>
          <option value="created_asc">Más antiguos</option>
          <option value="title_asc">A-Z</option>
          <option value="usage_desc">Más canjes</option>
        </select>
        <select
          value={filters?.discountType || 'all'}
          onChange={e => onFilterChange('discountType', e?.target?.value)}
          className="px-3 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">Todos los tipos</option>
          <option value="percentage">% Descuento</option>
          <option value="fixed">Monto fijo</option>
          <option value="2x1">2x1</option>
          <option value="free_product">Producto gratis</option>
        </select>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Desde</span>
          <input
            type="date"
            value={filters?.dateFrom || ''}
            onChange={e => onFilterChange('dateFrom', e?.target?.value)}
            className="px-2 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="text-xs text-muted-foreground">Hasta</span>
          <input
            type="date"
            value={filters?.dateTo || ''}
            onChange={e => onFilterChange('dateTo', e?.target?.value)}
            className="px-2 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
    </div>
  );
};

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
const PromotionsManagement = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedPromotions, setSelectedPromotions] = useState([]);
  const [previewPromotion, setPreviewPromotion] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [mainTab, setMainTab] = useState('mis-promociones');
  const [statusTab, setStatusTab] = useState('active');
  const [selectedEstablishment, setSelectedEstablishment] = useState('all');
  const [analyticsPromotion, setAnalyticsPromotion] = useState(null);
  const [realtimeIndicator, setRealtimeIndicator] = useState(false);

  // Supabase state
  const [allPromotions, setAllPromotions] = useState([]);
  const [loadingPromotions, setLoadingPromotions] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const user = {
    id: 1,
    name: 'Carlos Mendoza',
    email: 'carlos@mirestaurante.com',
    role: 'owner'
  };

  // ── TOAST HELPER ──────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // ── FETCH PROMOTIONS FROM SUPABASE ────────────────────────────────────────
  const fetchPromotions = useCallback(async () => {
    setLoadingPromotions(true);
    try {
      const { data, error } = await supabase?.from('promotions')?.select('*')?.order('created_at', { ascending: false });

      if (error) throw error;

      // Map DB snake_case → component camelCase
      const mapped = (data || [])?.map(p => ({
        id: p?.id,
        title: p?.title,
        description: p?.description,
        promoType: p?.promo_type || 'standard',
        discountType: p?.discount_type || p?.promotion_type || 'percentage',
        discountValue: Number(p?.discount_value || 0),
        startDate: p?.start_date,
        endDate: p?.end_date,
        status: p?.status || 'draft',
        usageCount: p?.usage_count || 0,
        totalLimit: p?.usage_limit || p?.total_limit || null,
        targetAudience: p?.target_audience || 'all',
        imageUrl: p?.image_url,
        performance: p?.performance || { views: 0, clicks: 0, conversions: 0 },
        internalName: p?.internal_name,
        tags: p?.tags || [],
        locationId: p?.location_id,
      }));

      setAllPromotions(mapped);
    } catch (err) {
      console.error('Error fetching promotions:', err);
    } finally {
      setLoadingPromotions(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // Real-time: refresh promotions list on any change
  const handleRealtimeChange = useCallback(() => {
    setRealtimeIndicator(true);
    setTimeout(() => setRealtimeIndicator(false), 2000);
    fetchPromotions();
  }, [fetchPromotions]);

  useRealtimeData({
    channelName: 'promotions_realtime',
    tables: ['promotions', 'promotion_analytics', 'coupon_redemptions'],
    events: ['INSERT', 'UPDATE', 'DELETE'],
    onRefresh: handleRealtimeChange,
    enabled: true,
  });

  const [filters, setFilters] = useState({
    search: '',
    discountType: 'all',
    businessType: 'all',
    category: 'all',
    sortBy: 'created_desc',
    dateFrom: '',
    dateTo: ''
  });

  // Counts per status tab
  const statusCounts = {
    active: allPromotions?.filter(p => p?.status === 'active')?.length,
    scheduled: allPromotions?.filter(p => p?.status === 'scheduled')?.length,
    draft: allPromotions?.filter(p => p?.status === 'draft')?.length,
    expired: allPromotions?.filter(p => p?.status === 'expired' || p?.status === 'paused')?.length,
  };

  // Filter promotions by active status tab
  const filteredByStatus = allPromotions?.filter(p => {
    if (statusTab === 'active') return p?.status === 'active';
    if (statusTab === 'scheduled') return p?.status === 'scheduled';
    if (statusTab === 'draft') return p?.status === 'draft';
    if (statusTab === 'expired') return p?.status === 'expired' || p?.status === 'paused';
    return true;
  });

  const filteredPromotions = filteredByStatus?.filter(p => {
    if (p?.status === 'archived') return false;
    if (filters?.search && !p?.title?.toLowerCase()?.includes(filters?.search?.toLowerCase()) &&
        !p?.description?.toLowerCase()?.includes(filters?.search?.toLowerCase())) return false;
    if (filters?.discountType !== 'all' && p?.discountType !== filters?.discountType) return false;
    if (filters?.dateFrom && p?.startDate && new Date(p.startDate) < new Date(filters.dateFrom)) return false;
    if (filters?.dateTo && p?.endDate && new Date(p.endDate) > new Date(filters.dateTo)) return false;
    return true;
  })?.sort((a, b) => {
    switch (filters?.sortBy) {
      case 'created_desc': return new Date(b?.startDate || 0) - new Date(a?.startDate || 0);
      case 'created_asc': return new Date(a?.startDate || 0) - new Date(b?.startDate || 0);
      case 'title_asc': return a?.title?.localeCompare(b?.title);
      case 'title_desc': return b?.title?.localeCompare(a?.title);
      case 'usage_desc': return (b?.performance?.conversions || 0) - (a?.performance?.conversions || 0);
      default: return 0;
    }
  });

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  const handleEdit = (id) => navigate(`/promotions-management/edit/${id}`);

  // ── DELETE ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta promoción?')) return;
    setActionLoading(id);
    try {
      const { error } = await supabase?.from('promotions')?.delete()?.eq('id', id);
      if (error) throw error;
      setAllPromotions(prev => prev?.filter(p => p?.id !== id));
      showToast('Promoción eliminada');
    } catch (err) {
      showToast('Error al eliminar: ' + err?.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ── TOGGLE STATUS (pause / activate) ──────────────────────────────────────
  const handleToggleStatus = async (id, newStatus) => {
    const promo = allPromotions?.find(p => p?.id === id);
    const next = newStatus || (promo?.status === 'active' ? 'paused' : 'active');
    setActionLoading(id);
    try {
      const { error } = await supabase?.from('promotions')?.update({ status: next, updated_at: new Date()?.toISOString() })?.eq('id', id);
      if (error) throw error;
      setAllPromotions(prev => prev?.map(p => p?.id === id ? { ...p, status: next } : p));
      showToast(`Promoción ${next === 'active' ? 'activada' : 'pausada'}`);
    } catch (err) {
      showToast('Error al actualizar estado: ' + err?.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ── DUPLICATE ──────────────────────────────────────────────────────────────
  const handleDuplicate = async (id) => {
    const promo = allPromotions?.find(p => p?.id === id);
    if (!promo) return;
    setActionLoading(id);
    try {
      const { data: authData } = await supabase?.auth?.getUser();
      const userId = authData?.user?.id;

      const { data, error } = await supabase?.from('promotions')?.insert({
          title: `${promo?.title} (Copia)`,
          description: promo?.description,
          promotion_type: promo?.discountType === 'percentage' ? 'percentage' : 'fixed_amount',
          discount_value: promo?.discountValue,
          start_date: promo?.startDate,
          end_date: promo?.endDate,
          status: 'draft',
          usage_count: 0,
          usage_limit: promo?.totalLimit,
          target_audience: promo?.targetAudience,
          image_url: promo?.imageUrl,
          performance: { views: 0, clicks: 0, conversions: 0 },
          promo_type: promo?.promoType,
          discount_type: promo?.discountType,
          internal_name: promo?.internalName,
          tags: promo?.tags,
          user_id: userId,
        })?.select()?.single();

      if (error) throw error;

      const mapped = {
        id: data?.id,
        title: data?.title,
        description: data?.description,
        promoType: data?.promo_type || 'standard',
        discountType: data?.discount_type || 'percentage',
        discountValue: Number(data?.discount_value || 0),
        startDate: data?.start_date,
        endDate: data?.end_date,
        status: 'draft',
        usageCount: 0,
        totalLimit: data?.usage_limit,
        targetAudience: data?.target_audience || 'all',
        imageUrl: data?.image_url,
        performance: { views: 0, clicks: 0, conversions: 0 },
        tags: data?.tags || [],
      };

      setAllPromotions(prev => [mapped, ...prev]);
      showToast('Promoción duplicada como borrador');
    } catch (err) {
      showToast('Error al duplicar: ' + err?.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ── VIEW ANALYTICS ─────────────────────────────────────────────────────────
  const handleViewAnalytics = (id) => {
    const promo = allPromotions?.find(p => p?.id === id);
    if (promo) setAnalyticsPromotion(promo);
  };

  const handlePromotionSelect = (id) => {
    setSelectedPromotions(prev =>
      prev?.includes(id) ? prev?.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => setSelectedPromotions(filteredPromotions?.map(p => p?.id));
  const handleDeselectAll = () => setSelectedPromotions([]);

  const handleBulkAction = async (action, ids) => {
    try {
      switch (action) {
        case 'activate': await supabase?.from('promotions')?.update({ status: 'active' })?.in('id', ids);
          setAllPromotions(prev => prev?.map(p => ids?.includes(p?.id) ? { ...p, status: 'active' } : p));
          showToast(`${ids?.length} promociones activadas`);
          break;
        case 'pause': await supabase?.from('promotions')?.update({ status: 'paused' })?.in('id', ids);
          setAllPromotions(prev => prev?.map(p => ids?.includes(p?.id) ? { ...p, status: 'paused' } : p));
          showToast(`${ids?.length} promociones pausadas`);
          break;
        case 'delete':
          await supabase?.from('promotions')?.delete()?.in('id', ids);
          setAllPromotions(prev => prev?.filter(p => !ids?.includes(p?.id)));
          showToast(`${ids?.length} promociones eliminadas`);
          break;
        case 'duplicate':
          for (const id of ids) {
            await handleDuplicate(id);
          }
          break;
      }
    } catch (err) {
      showToast('Error en acción masiva: ' + err?.message, 'error');
    }
    setSelectedPromotions([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        user={user}
      />
      <main
        className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
      >
        <div className="p-6">
          <RoleGuard allowedRoles={['owner', 'admin', 'staff']} userRole={user?.role} module="promotions">
            {/* Toast notification */}
            {toastMsg && (
              <div className={`fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
                toastMsg?.type === 'error' ? 'bg-destructive text-destructive-foreground' : 'bg-green-600 text-white'
              }`}>
                <Icon name={toastMsg?.type === 'error' ? 'AlertCircle' : 'CheckCircle'} size={16} />
                {toastMsg?.msg}
              </div>
            )}

            {/* Page header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gestión de Promociones</h1>
                <p className="text-muted-foreground">
                  Crea y gestiona promociones para atraer más clientes a tu negocio
                </p>
              </div>
              <Button
                variant="default"
                onClick={() => navigate('/promotions-management/new')}
                iconName="Plus"
                iconPosition="left"
              >
                Nueva Promoción
              </Button>
            </div>

            {/* Main tabs: Mis Promociones | Analytics */}
            <div className="flex items-center gap-0 border-b border-border mb-6">
              {[
                { id: 'mis-promociones', label: 'Mis Promociones', icon: 'Megaphone' },
                { id: 'analytics', label: 'Analytics', icon: 'BarChart2' },
              ]?.map(tab => (
                <button
                  key={tab?.id}
                  onClick={() => setMainTab(tab?.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                    mainTab === tab?.id
                      ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  {tab?.label}
                </button>
              ))}
            </div>

            {/* ── ANALYTICS TAB ── */}
            {mainTab === 'analytics' && (
              <>
                <EstablishmentSelector selected={selectedEstablishment} onChange={setSelectedEstablishment} />
                <AnalyticsTab selectedEstablishment={selectedEstablishment} />
              </>
            )}

            {/* ── MIS PROMOCIONES TAB ── */}
            {mainTab === 'mis-promociones' && (
              <>
                {/* Establishment selector */}
                <EstablishmentSelector selected={selectedEstablishment} onChange={setSelectedEstablishment} />

                {/* Status tabs row + view toggle */}
                <div className="flex items-center justify-between mb-5">
                  {/* Status tabs with counters */}
                  <div className="flex items-center border-b border-border -mb-px">
                    {[
                      { id: 'active', label: 'Activos', count: statusCounts?.active },
                      { id: 'scheduled', label: 'Programados', count: statusCounts?.scheduled },
                      { id: 'draft', label: 'Borradores', count: statusCounts?.draft },
                      { id: 'expired', label: 'Vencidos / Agotados', count: statusCounts?.expired },
                    ]?.map(tab => (
                      <button
                        key={tab?.id}
                        onClick={() => { setStatusTab(tab?.id); setSelectedPromotions([]); }}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 transition-all ${
                          statusTab === tab?.id
                            ? 'border-primary text-foreground font-semibold' :'border-transparent text-muted-foreground font-normal hover:text-foreground hover:border-muted-foreground/40'
                        }`}
                      >
                        {tab?.label}
                        {tab?.count !== undefined && (
                          <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold ${
                            statusTab === tab?.id
                              ? 'bg-primary text-white' :'text-muted-foreground'
                          }`}>
                            {tab?.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* View mode toggle */}
                  <div className="flex items-center border border-border rounded-lg">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      iconName="Grid3X3"
                      iconSize={16}
                    />
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                      iconName="List"
                      iconSize={16}
                    />
                  </div>
                </div>

                <BulkActions
                  selectedPromotions={selectedPromotions}
                  onSelectAll={handleSelectAll}
                  onDeselectAll={handleDeselectAll}
                  onBulkAction={handleBulkAction}
                  totalPromotions={filteredPromotions?.length}
                  allSelected={selectedPromotions?.length === filteredPromotions?.length && filteredPromotions?.length > 0}
                />

                {loadingPromotions ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-muted-foreground">Cargando promociones...</span>
                    </div>
                  </div>
                ) : filteredPromotions?.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon name="Megaphone" size={24} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No se encontraron promociones</h3>
                    <p className="text-muted-foreground mb-4">
                      {statusTab === 'active' && 'No tienes promociones activas en este momento.'}
                      {statusTab === 'scheduled' && 'No tienes promociones programadas.'}
                      {statusTab === 'draft' && 'No tienes borradores guardados.'}
                      {statusTab === 'expired' && 'No tienes promociones vencidas o agotadas.'}
                    </p>
                    {statusTab === 'draft' && (
                      <Button
                        variant="default"
                        onClick={() => navigate('/promotions-management/new')}
                        iconName="Plus"
                        iconPosition="left"
                      >
                        Crear Primera Promoción
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-3'}>
                    {filteredPromotions?.map(promotion => (
                      <div key={promotion?.id} className="relative">
                        {selectedPromotions?.length > 0 && (
                          <div className="absolute top-4 left-4 z-10">
                            <Checkbox
                              checked={selectedPromotions?.includes(promotion?.id)}
                              onChange={() => handlePromotionSelect(promotion?.id)}
                            />
                          </div>
                        )}
                        <AdvancedPromotionCard
                          promotion={promotion}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onToggleStatus={handleToggleStatus}
                          onDuplicate={handleDuplicate}
                          onViewAnalytics={handleViewAnalytics}
                          onArchive={(id) => handleToggleStatus(id, 'archived')}
                          viewMode={viewMode}
                          actionLoading={actionLoading}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </RoleGuard>
        </div>
      </main>
      {previewPromotion && (
        <PromotionPreview
          promotion={previewPromotion}
          onClose={() => setPreviewPromotion(null)}
        />
      )}
      {/* Analytics Modal */}
      {analyticsPromotion && (
        <PromotionAnalyticsModal
          promotion={analyticsPromotion}
          onClose={() => setAnalyticsPromotion(null)}
        />
      )}
    </div>
  );
};

export default PromotionsManagement;