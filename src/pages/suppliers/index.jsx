import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';
import SupplierForm from './components/SupplierForm';

const paymentTermsLabel = {
  immediate: 'Pago inmediato',
  net15: 'Neto 15 días',
  net30: 'Neto 30 días',
  net45: 'Neto 45 días',
  net60: 'Neto 60 días'
};

const SuppliersManagement = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  // Establishments
  const [establishments, setEstablishments] = useState([]);
  const [loadingEstablishments, setLoadingEstablishments] = useState(false);
  const [selectedEstablishment, setSelectedEstablishment] = useState('all');

  useEffect(() => {
    if (user?.id) {
      fetchEstablishments();
      fetchSuppliers();
    } else {
      setSuppliers([]);
      setIsLoading(false);
    }
  }, [user?.id]);

  const fetchEstablishments = async () => {
    if (!user?.id) return;
    setLoadingEstablishments(true);
    try {
      const { data: profile } = await supabase
        ?.from('user_profiles')
        ?.select('user_id')
        ?.eq('id', user?.id)
        ?.single();
      const businessId = profile?.user_id || user?.id;
      const { data } = await supabase
        ?.from('business_locations')
        ?.select('id, location_name, location_code, is_active')
        ?.eq('business_id', businessId)
        ?.eq('is_active', true)
        ?.order('location_name', { ascending: true });
      setEstablishments(data || []);
    } catch (err) {
      console.error('Error loading establishments:', err);
    } finally {
      setLoadingEstablishments(false);
    }
  };

  const fetchSuppliers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase?.from('suppliers')?.select('*')?.eq('user_id', user?.id)?.order('name');
      if (err) throw err;
      setSuppliers(data || []);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setSuppliers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time subscription for suppliers
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      ?.channel('suppliers_realtime')
      ?.on('postgres_changes', { event: '*', schema: 'public', table: 'suppliers' }, () => {
        fetchSuppliers();
      })
      ?.subscribe();
    return () => { supabase?.removeChannel(channel); };
  }, [user?.id]);

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      if (editingSupplier) {
        const { error: err } = await supabase?.from('suppliers')?.update({ ...formData, updated_at: new Date()?.toISOString() })?.eq('id', editingSupplier?.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase?.from('suppliers')?.insert({ ...formData, user_id: user?.id });
        if (err) throw err;
      }
      await fetchSuppliers();
      setShowForm(false);
      setEditingSupplier(null);
    } catch (err) {
      console.error('Error saving supplier:', err);
      alert('Error al guardar el proveedor');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetInactive = async (id) => {
    if (!window.confirm('¿Marcar este proveedor como inactivo?')) return;
    try {
      const { error: err } = await supabase?.from('suppliers')?.update({ is_active: false, updated_at: new Date()?.toISOString() })?.eq('id', id);
      if (err) throw err;
      await fetchSuppliers();
    } catch (err) {
      console.error('Error setting supplier inactive:', err);
    }
  };

  const handleViewDetail = (supplier) => {
    navigate(`/supplier-full-form/${supplier?.id}`);
  };

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const categories = ['all', ...Array.from(new Set(suppliers?.map(s => s?.category).filter(Boolean)))];

  const filteredSuppliers = suppliers?.filter(s => {
    const matchSearch = !search ||
      s?.name?.toLowerCase()?.includes(search?.toLowerCase()) ||
      s?.contact_name?.toLowerCase()?.includes(search?.toLowerCase()) ||
      s?.rfc?.toLowerCase()?.includes(search?.toLowerCase()) ||
      s?.email?.toLowerCase()?.includes(search?.toLowerCase());
    const matchActive = filterActive === 'all' || (filterActive === 'active' ? s?.is_active : !s?.is_active);
    const matchCategory = filterCategory === 'all' || s?.category === filterCategory;
    const matchEstablishment = selectedEstablishment === 'all' || s?.location_id === selectedEstablishment || s?.business_location_id === selectedEstablishment;
    return matchSearch && matchActive && matchCategory && matchEstablishment;
  })?.sort((a, b) => {
    let aVal = a?.[sortField] ?? '';
    let bVal = b?.[sortField] ?? '';
    if (typeof aVal === 'string') aVal = aVal?.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal?.toLowerCase();
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const stats = {
    total: suppliers?.length,
    active: suppliers?.filter(s => s?.is_active)?.length,
    inactive: suppliers?.filter(s => !s?.is_active)?.length,
    totalPurchased: suppliers?.reduce((sum, s) => sum + (s?.total_purchased || 0), 0),
    avgDelivery: suppliers?.length > 0 ? Math.round(suppliers?.reduce((sum, s) => sum + (s?.delivery_days || 0), 0) / suppliers?.length) : 0,
    totalOrders: suppliers?.reduce((sum, s) => sum + (s?.total_orders || 0), 0)
  };

  const SortIcon = ({ field }) => (
    <Icon
      name={sortField === field ? (sortDir === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'}
      size={14}
      className={sortField === field ? 'text-primary' : 'text-muted-foreground'}
    />
  );

  const RatingStars = ({ rating }) => (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5]?.map(star => (
        <Icon key={star} name="Star" size={12}
          className={star <= (rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'} />
      ))}
    </div>
  );

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
        user={user}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main
        className={`pt-16 transition-all duration-500 ease-in-out relative z-10 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
      >
        <div className="p-6 max-w-[1920px] mx-auto space-y-6">

          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Proveedores</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Gestiona tus proveedores, contactos y productos asociados</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" iconName="Download" iconPosition="left" size="sm">Exportar</Button>
              <Button variant="default" onClick={() => navigate('/supplier-full-form/new')} iconName="Plus" iconPosition="left">
                Nuevo Proveedor
              </Button>
            </div>
          </div>

          {/* Establishment Selector */}
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Icon name="Building2" size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Establecimiento</span>
              {loadingEstablishments && (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedEstablishment('all')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedEstablishment === 'all' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                Todos los establecimientos
              </button>
              {establishments?.map(est => (
                <button
                  key={est?.id}
                  onClick={() => setSelectedEstablishment(est?.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedEstablishment === est?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  {est?.location_name}
                  {est?.location_code && (
                    <span className="ml-1.5 opacity-70 text-xs">({est?.location_code})</span>
                  )}
                </button>
              ))}
              {!loadingEstablishments && establishments?.length === 0 && (
                <p className="text-sm text-muted-foreground">No hay establecimientos registrados</p>
              )}
            </div>
            {selectedEstablishment !== 'all' && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Icon name="Info" size={12} />
                Mostrando proveedores de: <span className="font-medium text-foreground ml-1">{establishments?.find(e => e?.id === selectedEstablishment)?.location_name || ''}</span>
              </p>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {[
              { label: 'Total', value: stats?.total, icon: 'Truck', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
              { label: 'Activos', value: stats?.active, icon: 'CheckCircle', color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
              { label: 'Inactivos', value: stats?.inactive, icon: 'XCircle', color: 'text-red-500', bg: 'bg-red-50 border-red-100' },
              { label: 'Total comprado', value: formatPrice(stats?.totalPurchased), icon: 'TrendingUp', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
              { label: 'Pedidos totales', value: stats?.totalOrders, icon: 'ShoppingCart', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
              { label: 'Entrega prom.', value: `${stats?.avgDelivery} días`, icon: 'Clock', color: 'text-teal-600', bg: 'bg-teal-50 border-teal-100' }
            ]?.map((stat, i) => (
              <div key={i} className={`${stat?.bg} rounded-xl p-4 border`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon name={stat?.icon} size={14} className={stat?.color} />
                  <span className="text-xs text-muted-foreground">{stat?.label}</span>
                </div>
                <p className={`text-lg font-bold ${stat?.color}`}>{stat?.value}</p>
              </div>
            ))}
          </div>

          {/* Filters Bar */}
          <div className="bg-card border border-border rounded-xl p-4 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e?.target?.value)}
                  placeholder="Buscar por nombre, RFC, contacto..."
                  className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {/* Status filter */}
              <div className="flex gap-1 border border-border rounded-lg p-1 bg-muted/30">
                {[['all', 'Todos'], ['active', 'Activos'], ['inactive', 'Inactivos']]?.map(([val, label]) => (
                  <button key={val} onClick={() => setFilterActive(val)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      filterActive === val ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:bg-muted'
                    }`}>{label}</button>
                ))}
              </div>
              {/* Category filter */}
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e?.target?.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {categories?.map(cat => (
                  <option key={cat} value={cat}>{cat === 'all' ? 'Todas las categorías' : cat}</option>
                ))}
              </select>
              {/* View toggle */}
              <div className="flex gap-1 border border-border rounded-lg p-1 bg-muted/30 ml-auto">
                <button onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded transition-colors ${viewMode === 'table' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>
                  <Icon name="List" size={16} />
                </button>
                <button onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>
                  <Icon name="LayoutGrid" size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">
              Mostrando <span className="font-semibold text-foreground">{filteredSuppliers?.length}</span> de <span className="font-semibold text-foreground">{suppliers?.length}</span> proveedores
            </p>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Icon name="Loader2" size={32} className="animate-spin text-primary" />
            </div>
          ) : filteredSuppliers?.length === 0 ? (
            <div className="text-center py-20 bg-card border border-border rounded-xl">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Truck" size={24} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No se encontraron proveedores</h3>
              <p className="text-muted-foreground mb-4">Intenta ajustar los filtros o agrega un nuevo proveedor</p>
              <Button variant="default" onClick={() => { setEditingSupplier(null); setShowForm(true); }} iconName="Plus" iconPosition="left">
                Nuevo Proveedor
              </Button>
            </div>
          ) : viewMode === 'table' ? (
            /* TABLE VIEW */
            (<div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border">
                      <th className="text-left px-4 py-3">
                        <button onClick={() => handleSort('name')} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground">
                          Proveedor <SortIcon field="name" />
                        </button>
                      </th>
                      <th className="text-left px-4 py-3">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contacto</span>
                      </th>
                      <th className="text-left px-4 py-3">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">RFC</span>
                      </th>
                      <th className="text-left px-4 py-3">
                        <button onClick={() => handleSort('payment_terms')} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground">
                          Términos <SortIcon field="payment_terms" />
                        </button>
                      </th>
                      <th className="text-left px-4 py-3">
                        <button onClick={() => handleSort('delivery_days')} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground">
                          Entrega <SortIcon field="delivery_days" />
                        </button>
                      </th>
                      <th className="text-left px-4 py-3">
                        <button onClick={() => handleSort('total_purchased')} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground">
                          Total comprado <SortIcon field="total_purchased" />
                        </button>
                      </th>
                      <th className="text-left px-4 py-3">
                        <button onClick={() => handleSort('rating')} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground">
                          Calificación <SortIcon field="rating" />
                        </button>
                      </th>
                      <th className="text-left px-4 py-3">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estado</span>
                      </th>
                      <th className="text-right px-4 py-3">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredSuppliers?.map((supplier, idx) => (
                      <tr
                        key={supplier?.id}
                        onClick={() => handleViewDetail(supplier)}
                        className={`hover:bg-muted/20 transition-colors cursor-pointer ${idx % 2 === 0 ? '' : 'bg-muted/5'}`}
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Icon name="Truck" size={16} className="text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground leading-tight">{supplier?.name}</p>
                              {supplier?.category && (
                                <span className="text-xs text-muted-foreground">{supplier?.category}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-sm text-foreground">{supplier?.contact_name || '—'}</p>
                          {supplier?.email && (
                            <p className="text-xs text-muted-foreground">{supplier?.email}</p>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-sm font-mono text-foreground">{supplier?.rfc || '—'}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-sm text-foreground">{paymentTermsLabel?.[supplier?.payment_terms] || supplier?.payment_terms || '—'}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Icon name="Clock" size={13} className="text-muted-foreground" />
                            <span className="text-sm text-foreground">{supplier?.delivery_days ? `${supplier?.delivery_days} días` : '—'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{formatPrice(supplier?.total_purchased || 0)}</p>
                            <p className="text-xs text-muted-foreground">{supplier?.total_orders || 0} pedidos</p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <RatingStars rating={supplier?.rating} />
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            supplier?.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${supplier?.is_active ? 'bg-green-500' : 'bg-red-400'}`} />
                            {supplier?.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleViewDetail(supplier)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors"
                              title="Ver detalle"
                            >
                              <Icon name="Eye" size={15} />
                            </button>
                            <button
                              onClick={(e) => { e?.stopPropagation(); navigate(`/supplier-full-form/${supplier?.id}`); }}
                              className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                              title="Editar"
                            >
                              <Icon name="Pencil" size={15} />
                            </button>
                            <button
                              onClick={(e) => { e?.stopPropagation(); handleSetInactive(supplier?.id); }}
                              className="p-1.5 rounded-lg hover:bg-orange-50 text-muted-foreground hover:text-orange-600 transition-colors"
                              title="Marcar inactivo"
                            >
                              <Icon name="EyeOff" size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>)
          ) : (
            /* GRID VIEW */
            (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSuppliers?.map(supplier => (
                <div
                  key={supplier?.id}
                  onClick={() => handleViewDetail(supplier)}
                  className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all duration-200 hover:border-primary/30 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Icon name="Truck" size={20} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm leading-tight">{supplier?.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{supplier?.contact_name}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      supplier?.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${supplier?.is_active ? 'bg-green-500' : 'bg-red-400'}`} />
                      {supplier?.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="space-y-1.5 mb-4">
                    {supplier?.email && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Icon name="Mail" size={12} />
                        <span className="truncate">{supplier?.email}</span>
                      </div>
                    )}
                    {supplier?.phone && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Icon name="Phone" size={12} />
                        <span>{supplier?.phone}</span>
                      </div>
                    )}
                    {supplier?.rfc && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Icon name="FileText" size={12} />
                        <span className="font-mono">RFC: {supplier?.rfc}</span>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-muted/40 rounded-lg p-2.5">
                      <p className="text-xs text-muted-foreground">Términos de pago</p>
                      <p className="text-xs font-semibold text-foreground mt-0.5">{paymentTermsLabel?.[supplier?.payment_terms] || '—'}</p>
                    </div>
                    <div className="bg-muted/40 rounded-lg p-2.5">
                      <p className="text-xs text-muted-foreground">Entrega</p>
                      <p className="text-xs font-semibold text-foreground mt-0.5">{supplier?.delivery_days ? `${supplier?.delivery_days} días` : '—'}</p>
                    </div>
                    <div className="bg-muted/40 rounded-lg p-2.5">
                      <p className="text-xs text-muted-foreground">Total comprado</p>
                      <p className="text-xs font-semibold text-foreground mt-0.5">{formatPrice(supplier?.total_purchased || 0)}</p>
                    </div>
                    <div className="bg-muted/40 rounded-lg p-2.5">
                      <p className="text-xs text-muted-foreground">Pedidos</p>
                      <p className="text-xs font-semibold text-foreground mt-0.5">{supplier?.total_orders || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <RatingStars rating={supplier?.rating} />
                    {supplier?.category && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{supplier?.category}</span>
                    )}
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-border">
                    <Button variant="outline" size="sm" onClick={(e) => { e?.stopPropagation(); handleViewDetail(supplier); }} iconName="Eye" iconPosition="left" className="flex-1 text-xs">
                      Ver detalle
                    </Button>
                    <Button variant="outline" size="sm" onClick={(e) => { e?.stopPropagation(); navigate(`/supplier-full-form/${supplier?.id}`); }} iconName="Pencil" iconPosition="left" className="flex-1 text-xs">
                      Editar
                    </Button>
                    <button onClick={(e) => { e?.stopPropagation(); handleSetInactive(supplier?.id); }} className="p-2 rounded-lg border border-border hover:bg-orange-50 hover:border-orange-200 transition-colors" title="Marcar inactivo">
                      <Icon name="EyeOff" size={14} className="text-orange-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>)
          )}
        </div>
      </main>
      {/* Form Modal - kept for quick edit fallback */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl">
            <SupplierForm
              supplier={editingSupplier}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingSupplier(null); }}
              isLoading={isSaving}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersManagement;
