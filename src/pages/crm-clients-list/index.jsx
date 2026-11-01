import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import SegmentsTab from './components/SegmentsTab';
import ConsentPrivacyTab from './components/ConsentPrivacyTab';
import LeadsTab from './components/LeadsTab';
import CRMAnalyticsTab from './components/CRMAnalyticsTab';
import CRMAlertsBar from './components/CRMAlertsBar';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import useRealtimeData from '../../hooks/useRealtimeData';

const getStatusBadge = (status) => {
  const styles = {
    'activo': 'bg-green-100 text-green-700',
    'suspendido': 'bg-orange-100 text-orange-700',
    'eliminado': 'bg-red-100 text-red-700',
    'Activo': 'bg-green-100 text-green-700',
    'Dormido': 'bg-orange-100 text-orange-700',
    'Perdido': 'bg-red-100 text-red-700',
    'Nuevo': 'bg-blue-100 text-blue-700',
  };
  return styles?.[status] || 'bg-gray-100 text-gray-700';
};

const getVipBadge = (level) => {
  const styles = {
    'Oro': 'bg-yellow-100 text-yellow-700 border border-yellow-300',
    'Plata': 'bg-slate-100 text-slate-600 border border-slate-300',
    'Bronce': 'bg-amber-100 text-amber-700 border border-amber-300',
    'Nuevo': 'bg-blue-50 text-blue-600 border border-blue-200',
  };
  return styles?.[level] || 'bg-gray-100 text-gray-600';
};

const getRelativeDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`;
  return `Hace ${Math.floor(diffDays / 30)} mes`;
};

// ---- Search & Link Customer Modal ----
const AddClientModal = ({ onClose, onLinked, ownerId, locations }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [linking, setLinking] = useState(null);
  const [error, setError] = useState(null);
  const [searchError, setSearchError] = useState(null);

  const handleSearch = async () => {
    if (!search?.trim() || search?.trim()?.length < 3) {
      setSearchError('Ingresa al menos 3 caracteres para buscar');
      return;
    }
    setSearchError(null);
    setSearching(true);
    setError(null);
    try {
      const { data, error: err } = await supabase?.rpc('search_customers_by_contact', {
        p_search: search?.trim(),
        p_owner_id: ownerId,
      });
      if (err) throw err;
      setResults(data || []);
    } catch (e) {
      setError(e?.message);
    } finally {
      setSearching(false);
    }
  };

  const handleLink = async (customer) => {
    if (customer?.already_linked) return;
    setLinking(customer?.id);
    setError(null);
    try {
      const { error: err } = await supabase?.from('owner_customers')?.insert({
        owner_id: ownerId,
        customer_id: customer?.id,
        location_id: selectedLocation || null,
        linked_by: ownerId,
      });
      if (err) throw err;
      setResults(prev => prev?.map(r => r?.id === customer?.id ? { ...r, already_linked: true } : r));
      onLinked?.();
    } catch (e) {
      setError(e?.message);
    } finally {
      setLinking(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">Agregar cliente existente</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Busca por teléfono o correo electrónico</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted"><Icon name="X" size={18} /></button>
        </div>

        {locations?.length > 0 && (
          <div className="mb-3">
            <label className="text-sm font-medium mb-1 block">Establecimiento (opcional)</label>
            <select value={selectedLocation} onChange={e => setSelectedLocation(e?.target?.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background">
              <option value="">Sin establecimiento específico</option>
              {locations?.map(loc => <option key={loc?.id} value={loc?.id}>{loc?.business_name || loc?.name || loc?.id}</option>)}
            </select>
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm bg-background"
              placeholder="Teléfono o correo electrónico..."
              value={search}
              onChange={e => { setSearch(e?.target?.value); setSearchError(null); }}
              onKeyDown={e => e?.key === 'Enter' && handleSearch()}
            />
          </div>
          <button onClick={handleSearch} disabled={searching} className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
            {searching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {searchError && <p className="text-xs text-amber-600 mb-3">{searchError}</p>}
        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

        {results?.length > 0 ? (
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="bg-muted/30 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {results?.length} resultado{results?.length !== 1 ? 's' : ''} encontrado{results?.length !== 1 ? 's' : ''}
            </div>
            <div className="divide-y divide-border max-h-64 overflow-y-auto">
              {results?.map(customer => (
                <div key={customer?.id} className="flex items-center gap-3 p-3 hover:bg-muted/20 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                    {customer?.full_name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{customer?.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{customer?.email || customer?.phone || '—'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getVipBadge(customer?.vip_level)}`}>{customer?.vip_level || 'Nuevo'}</span>
                      <span className="text-xs text-muted-foreground">{customer?.total_visits || 0} visitas</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleLink(customer)}
                    disabled={customer?.already_linked || linking === customer?.id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                      customer?.already_linked
                        ? 'bg-green-100 text-green-700 cursor-default' :'bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50'
                    }`}
                  >
                    {linking === customer?.id ? 'Vinculando...' : customer?.already_linked ? '✓ Vinculado' : 'Vincular'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : search?.length >= 3 && !searching && (
          <div className="py-8 text-center border-2 border-dashed border-border rounded-xl">
            <Icon name="UserX" size={28} className="mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No se encontraron clientes registrados</p>
            <p className="text-xs text-muted-foreground mt-1">Los clientes deben estar registrados en la plataforma</p>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

// CRM Lateral Menu items
const crmMenuItems = [
  { id: 'clientes', label: 'Clientes', icon: 'Users' },
  { id: 'segmentos', label: 'Segmentos', icon: 'Layers' },
  { id: 'leads', label: 'Leads', icon: 'UserPlus' },
  { id: 'privacidad', label: 'Privacidad', icon: 'Shield' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart2' },
];

// Main CRM Component
const CRMClientsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('clientes');
  const [search, setSearch] = useState('');
  const [showAddClient, setShowAddClient] = useState(false);
  const [selectedClients, setSelectedClients] = useState([]);
  const [sortField, setSortField] = useState('full_name');
  const [sortDir, setSortDir] = useState('asc');
  const [filters, setFilters] = useState({ locationId: '', vipLevel: '', status: '' });
  const [clientMenuId, setClientMenuId] = useState(null);
  const [realtimeIndicator, setRealtimeIndicator] = useState(false);

  // Data state
  const [ownerCustomers, setOwnerCustomers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 25;

  const fetchLocations = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase?.from('business_locations')?.select('id, business_name, name')?.eq('user_id', user?.id);
      setLocations(data || []);
    } catch (e) {
      console.error('Error fetching locations:', e?.message);
    }
  }, [user?.id]);

  const fetchOwnerCustomers = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      let query = supabase?.from('owner_customers')?.select(`
          id,
          owner_id,
          customer_id,
          location_id,
          linked_at,
          customer_profiles(
            id, full_name, email, phone, vip_level, account_status,
            engagement_score, total_visits, last_visit_at, first_visit_at,
            loyalty_points, tags, has_whatsapp, has_prepaid
          )
        `)?.eq('owner_id', user?.id);

      if (filters?.locationId) {
        query = query?.eq('location_id', filters?.locationId);
      }

      const { data, error: err } = await query?.order('linked_at', { ascending: false });
      if (err) throw err;
      setOwnerCustomers(data || []);
    } catch (e) {
      setError(e?.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, filters?.locationId]);

  useEffect(() => {
    if (user?.id) {
      fetchLocations();
      fetchOwnerCustomers();
    }
  }, [user?.id, fetchLocations, fetchOwnerCustomers]);

  // Real-time: refresh customer list when owner_customers or customer_profiles change
  const handleRealtimeChange = useCallback(() => {
    setRealtimeIndicator(true);
    setTimeout(() => setRealtimeIndicator(false), 2000);
    fetchOwnerCustomers();
  }, [fetchOwnerCustomers]);

  useRealtimeData({
    channelName: `crm_realtime_${user?.id}`,
    tables: ['owner_customers', 'customer_profiles', 'customer_vip_levels', 'loyalty_points'],
    events: ['INSERT', 'UPDATE', 'DELETE'],
    onRefresh: handleRealtimeChange,
    enabled: !!user?.id,
  });

  // Derived: unique VIP levels from data
  const availableVipLevels = useMemo(() => {
    const levels = new Set(ownerCustomers?.map(oc => oc?.customer_profiles?.vip_level)?.filter(Boolean));
    return Array.from(levels);
  }, [ownerCustomers]);

  // Filtered & sorted clients
  const filteredClients = useMemo(() => {
    let list = ownerCustomers?.filter(oc => {
      const cp = oc?.customer_profiles;
      if (!cp) return false;
      const searchLower = search?.toLowerCase();
      if (searchLower && !cp?.full_name?.toLowerCase()?.includes(searchLower) && !cp?.email?.toLowerCase()?.includes(searchLower) && !cp?.phone?.includes(search)) return false;
      if (filters?.vipLevel && cp?.vip_level !== filters?.vipLevel) return false;
      if (filters?.status && (cp?.account_status || 'activo') !== filters?.status) return false;
      return true;
    });

    list?.sort((a, b) => {
      const cpA = a?.customer_profiles;
      const cpB = b?.customer_profiles;
      let av = cpA?.[sortField] ?? '';
      let bv = cpB?.[sortField] ?? '';
      if (typeof av === 'string') av = av?.toLowerCase();
      if (typeof bv === 'string') bv = bv?.toLowerCase();
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return list;
  }, [ownerCustomers, search, filters, sortField, sortDir]);

  const paginatedClients = useMemo(() => {
    return filteredClients?.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  }, [filteredClients, page]);

  const totalPages = Math.ceil(filteredClients?.length / PAGE_SIZE);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const toggleSelectAll = () => {
    if (selectedClients?.length === paginatedClients?.length) setSelectedClients([]);
    else setSelectedClients(paginatedClients?.map(oc => oc?.customer_id));
  };

  const toggleSelect = (id) => setSelectedClients(prev => prev?.includes(id) ? prev?.filter(x => x !== id) : [...prev, id]);

  const hasActiveFilters = filters?.locationId || filters?.vipLevel || filters?.status;

  const SortIcon = ({ field }) => (
    <Icon name={sortField === field ? (sortDir === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} size={14} className="ml-1 inline opacity-50" />
  );

  const headerUser = { id: user?.id, name: user?.email, email: user?.email, role: 'owner' };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={headerUser}
        onMenuToggle={() => setIsSidebarOpen(prev => !prev)}
        isMenuOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={headerUser}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
      />
      <main className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        {/* Page header */}
        <div className="p-6 pb-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">CRM</h1>
            <p className="text-muted-foreground">Gestión de relaciones con clientes</p>
          </div>
        </div>

        {/* Layout: lateral menu + content */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* CRM Lateral Menu */}
              <div className="lg:w-64 flex-shrink-0">
                <div className="bg-card rounded-lg border border-border p-4 sticky top-20">
                  <nav className="space-y-1">
                    {crmMenuItems?.map(item => (
                      <button
                        key={item?.id}
                        onClick={() => setActiveSection(item?.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${
                          activeSection === item?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <Icon name={item?.icon} size={20} className="flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{item?.label}</p>
                        </div>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Main content area */}
              <div className="flex-1 min-w-0">
                {activeSection === 'clientes' && (
                  <div>
                    <CRMAlertsBar ownerId={user?.id} />
                    {/* Top bar: title + search + inline filters + add */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <h2 className="text-lg font-semibold">Clientes</h2>
                        <span className="text-sm text-muted-foreground">({filteredClients?.length} de {ownerCustomers?.length})</span>
                      </div>
                      <div className="flex-1" />
                      {/* Search box */}
                      <div className="relative">
                        <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-background w-52"
                          placeholder="Nombre, email o tel..."
                          value={search}
                          onChange={e => { setSearch(e?.target?.value); setPage(0); }}
                        />
                      </div>
                      {/* Inline filter: Establecimiento */}
                      {locations?.length > 0 && (
                        <select
                          value={filters?.locationId}
                          onChange={e => { setFilters(f => ({ ...f, locationId: e?.target?.value })); setPage(0); }}
                          className={`py-2 pl-3 pr-8 border rounded-lg text-sm bg-background appearance-none cursor-pointer ${filters?.locationId ? 'border-primary text-primary' : 'border-border'}`}
                        >
                          <option value="">Establecimiento</option>
                          {locations?.map(loc => <option key={loc?.id} value={loc?.id}>{loc?.business_name || loc?.name}</option>)}
                        </select>
                      )}
                      {/* Inline filter: Nivel VIP */}
                      <select
                        value={filters?.vipLevel}
                        onChange={e => { setFilters(f => ({ ...f, vipLevel: e?.target?.value })); setPage(0); }}
                        className={`py-2 pl-3 pr-8 border rounded-lg text-sm bg-background appearance-none cursor-pointer ${filters?.vipLevel ? 'border-primary text-primary' : 'border-border'}`}
                      >
                        <option value="">Nivel VIP</option>
                        {(availableVipLevels?.length > 0 ? availableVipLevels : ['Nuevo', 'Bronce', 'Plata', 'Oro'])?.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                      {/* Inline filter: Estado */}
                      <select
                        value={filters?.status}
                        onChange={e => { setFilters(f => ({ ...f, status: e?.target?.value })); setPage(0); }}
                        className={`py-2 pl-3 pr-8 border rounded-lg text-sm bg-background appearance-none cursor-pointer ${filters?.status ? 'border-primary text-primary' : 'border-border'}`}
                      >
                        <option value="">Estado</option>
                        <option value="activo">Activo</option>
                        <option value="suspendido">Suspendido</option>
                        <option value="eliminado">Eliminado</option>
                      </select>
                      {/* Clear filters */}
                      {hasActiveFilters && (
                        <button
                          onClick={() => { setFilters({ locationId: '', vipLevel: '', status: '' }); setPage(0); }}
                          className="flex items-center gap-1 px-2 py-2 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                          title="Limpiar filtros"
                        >
                          <Icon name="X" size={14} />
                        </button>
                      )}
                      <button onClick={() => setShowAddClient(true)} className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex-shrink-0">
                        <Icon name="UserPlus" size={16} />Agregar
                      </button>
                    </div>

                    {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

                    {/* Table */}
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-muted/30 border-b border-border">
                              <th className="w-10 py-3 px-4">
                                <input type="checkbox" checked={selectedClients?.length === paginatedClients?.length && paginatedClients?.length > 0} onChange={toggleSelectAll} className="rounded" />
                              </th>
                              <th className="text-left py-3 px-4 cursor-pointer select-none" onClick={() => toggleSort('full_name')}>
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cliente<SortIcon field="full_name" /></span>
                              </th>
                              <th className="text-left py-3 px-4">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nivel VIP</span>
                              </th>
                              <th className="text-left py-3 px-4">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estado</span>
                              </th>
                              <th className="text-left py-3 px-4 cursor-pointer select-none" onClick={() => toggleSort('total_visits')}>
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Visitas<SortIcon field="total_visits" /></span>
                              </th>
                              <th className="text-left py-3 px-4 cursor-pointer select-none" onClick={() => toggleSort('last_visit_at')}>
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Última visita<SortIcon field="last_visit_at" /></span>
                              </th>
                              <th className="text-left py-3 px-4 cursor-pointer select-none" onClick={() => toggleSort('loyalty_points')}>
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Puntos<SortIcon field="loyalty_points" /></span>
                              </th>
                              <th className="w-10 py-3 px-4"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {loading ? (
                              <tr>
                                <td colSpan={8} className="py-16 text-center text-muted-foreground text-sm">
                                  <Icon name="Loader2" size={24} className="mx-auto mb-2 animate-spin" />
                                  Cargando clientes...
                                </td>
                              </tr>
                            ) : paginatedClients?.map(oc => {
                              const cp = oc?.customer_profiles;
                              if (!cp) return null;
                              return (
                                <tr key={oc?.id} className="border-b border-border hover:bg-muted/20 cursor-pointer transition-colors group" onClick={() => navigate(`/customer-profile-detail/${cp?.id}`)}>
                                  <td className="py-3 px-4" onClick={e => { e?.stopPropagation(); toggleSelect(cp?.id); }}>
                                    <input type="checkbox" checked={selectedClients?.includes(cp?.id)} onChange={() => {}} className="rounded" />
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                                        {cp?.full_name?.charAt(0) || '?'}
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium text-foreground">{cp?.full_name}</div>
                                        <div className="text-xs text-muted-foreground">{cp?.email || cp?.phone || '—'}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getVipBadge(cp?.vip_level || 'Nuevo')}`}>{cp?.vip_level || 'Nuevo'}</span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${getStatusBadge(cp?.account_status || 'activo')}`}>{cp?.account_status || 'activo'}</span>
                                  </td>
                                  <td className="py-3 px-4 text-sm font-medium">{cp?.total_visits || 0}</td>
                                  <td className="py-3 px-4 text-sm text-muted-foreground">{getRelativeDate(cp?.last_visit_at)}</td>
                                  <td className="py-3 px-4 text-sm font-medium">{(cp?.loyalty_points || 0)?.toLocaleString()}</td>
                                  <td className="py-3 px-4 relative" onClick={e => e?.stopPropagation()}>
                                    <button
                                      onClick={() => setClientMenuId(clientMenuId === cp?.id ? null : cp?.id)}
                                      className="p-1.5 rounded hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                      <Icon name="MoreVertical" size={15} />
                                    </button>
                                    {clientMenuId === cp?.id && (
                                      <div className="absolute right-4 top-full mt-1 bg-card border border-border rounded-xl shadow-xl w-44 z-50 overflow-hidden">
                                        <button onClick={() => { navigate(`/customer-profile-detail/${cp?.id}`); setClientMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                                          <Icon name="User" size={15} className="text-muted-foreground" />Ver cliente
                                        </button>
                                        <button onClick={() => setClientMenuId(null)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                                          <Icon name="MessageSquare" size={15} className="text-muted-foreground" />Enviar mensaje
                                        </button>
                                        <button onClick={() => setClientMenuId(null)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                                          <Icon name="Download" size={15} className="text-muted-foreground" />Exportar perfil
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      {!loading && filteredClients?.length === 0 && (
                        <div className="py-16 text-center">
                          <Icon name="Users" size={40} className="mx-auto mb-3 text-muted-foreground/40" />
                          <p className="text-muted-foreground">
                            {ownerCustomers?.length === 0 ? 'Aún no tienes clientes vinculados. Usa "Agregar" para buscar y vincular clientes.' : 'No se encontraron clientes con los filtros actuales'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-muted-foreground">Mostrando {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredClients?.length)} de {filteredClients?.length}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 border border-border rounded text-sm hover:bg-muted disabled:opacity-50">Anterior</button>
                          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                            <button key={i} onClick={() => setPage(i)} className={`px-3 py-1.5 rounded text-sm ${page === i ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'}`}>{i + 1}</button>
                          ))}
                          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1.5 border border-border rounded text-sm hover:bg-muted disabled:opacity-50">Siguiente</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeSection === 'segmentos' && <SegmentsTab ownerCustomers={ownerCustomers} />}
                {activeSection === 'leads' && <LeadsTab ownerCustomers={ownerCustomers} />}
                {activeSection === 'privacidad' && <ConsentPrivacyTab ownerCustomers={ownerCustomers} />}
                {activeSection === 'analytics' && <CRMAnalyticsTab ownerCustomers={ownerCustomers} />}
              </div>
            </div>
          </div>

          {/* Bulk actions bar */}
          {selectedClients?.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-border shadow-2xl rounded-2xl px-6 py-3 flex items-center gap-4 z-40">
              <span className="text-sm font-medium">{selectedClients?.length} clientes seleccionados</span>
              <div className="w-px h-5 bg-border" />
              <button className="flex items-center gap-2 text-sm hover:text-primary transition-colors"><Icon name="MessageSquare" size={16} />Enviar mensaje</button>
              <button className="flex items-center gap-2 text-sm hover:text-primary transition-colors"><Icon name="Layers" size={16} />Mover a segmento</button>
              <button className="flex items-center gap-2 text-sm hover:text-primary transition-colors"><Icon name="Megaphone" size={16} />Asignar a campaña</button>
              <button className="flex items-center gap-2 text-sm hover:text-primary transition-colors"><Icon name="Download" size={16} />Exportar selección</button>
              <button onClick={() => setSelectedClients([])} className="p-1 hover:bg-muted rounded"><Icon name="X" size={16} /></button>
            </div>
          )}

          {/* Close client context menu on outside click */}
          {clientMenuId && <div className="fixed inset-0 z-40" onClick={() => setClientMenuId(null)} />}

          {showAddClient && user?.id && (
            <AddClientModal
              onClose={() => setShowAddClient(false)}
              onLinked={() => { fetchOwnerCustomers(); }}
              ownerId={user?.id}
              locations={locations}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default CRMClientsList;
