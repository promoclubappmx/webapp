import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';

const STATUS_CONFIG = {
  requested: { label: 'Solicitado', color: 'bg-blue-100 text-blue-700', icon: 'Clock' },
  approved: { label: 'Aprobado', color: 'bg-yellow-100 text-yellow-700', icon: 'CheckCircle' },
  in_transit: { label: 'En Tránsito', color: 'bg-orange-100 text-orange-700', icon: 'Truck' },
  received: { label: 'Recibido', color: 'bg-green-100 text-green-700', icon: 'PackageCheck' },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-500', icon: 'X' }
};

const TRANSFER_REASONS = [
  'Rebalanceo de stock',
  'Demanda estacional',
  'Cierre temporal de sucursal',
  'Exceso de inventario',
  'Urgencia de stock',
  'Auditoría de inventario',
  'Otro'
];

const InventoryTransfers = () => {
  const { user: authUser } = useAuth();
  const { formatPrice } = useCurrency();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [transfers, setTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isSaving, setIsSaving] = useState(false);

  // Establishments
  const [establishments, setEstablishments] = useState([]);
  const [loadingEstablishments, setLoadingEstablishments] = useState(false);
  const [selectedEstablishment, setSelectedEstablishment] = useState('all');

  const user = {
    id: authUser?.id,
    name: authUser?.user_metadata?.full_name || 'Admin',
    email: authUser?.email || '',
    role: 'owner'
  };

  const [form, setForm] = useState({
    source_location_id: '',
    destination_location_id: '',
    reason: '',
    notes: '',
    items: [{ product_id: '', product_name: '', quantity: 1, unit_cost: 0, batch_number: '', expiry_date: '' }]
  });

  // Load establishments
  useEffect(() => {
    const fetchEstablishments = async () => {
      if (!authUser?.id) return;
      setLoadingEstablishments(true);
      try {
        const { data: profile } = await supabase
          ?.from('user_profiles')
          ?.select('user_id')
          ?.eq('id', authUser?.id)
          ?.single();
        const businessId = profile?.user_id || authUser?.id;
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
    fetchEstablishments();
  }, [authUser?.id]);

  useEffect(() => {
    if (authUser?.id) {
      fetchTransfers();
      fetchProducts();
    }
  }, [authUser?.id, selectedEstablishment]);

  // Real-time subscriptions for inventory transfers
  useEffect(() => {
    if (!authUser?.id) return;
    const channel = supabase
      ?.channel('inventory_transfers_realtime')
      ?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory_transfers' },
        () => {
          fetchTransfers();
        }
      )
      ?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory_transfer_items' },
        () => {
          fetchTransfers();
        }
      )
      ?.subscribe();
    return () => { supabase?.removeChannel(channel); };
  }, [authUser?.id, selectedEstablishment]);

  const fetchTransfers = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        ?.from('inventory_transfers')
        ?.select('*, inventory_transfer_items(*)')
        ?.eq('user_id', authUser?.id)
        ?.order('created_at', { ascending: false });

      if (selectedEstablishment !== 'all') {
        query = query?.or(`source_location_id.eq.${selectedEstablishment},destination_location_id.eq.${selectedEstablishment}`);
      }

      const { data } = await query;
      setTransfers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      let query = supabase
        ?.from('catalog_items')
        ?.select('id, name, sku, stock_quantity, cost, business_location_id, metadata')
        ?.eq('user_id', authUser?.id)
        ?.eq('status', 'active')
        ?.eq('business_type', 'product');

      if (selectedEstablishment !== 'all') {
        query = query?.eq('business_location_id', selectedEstablishment);
      }

      const { data } = await query;
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const generateTransferNumber = () => {
    const d = new Date();
    return `TRF-${d?.getFullYear()}${String(d?.getMonth()+1)?.padStart(2,'0')}${String(d?.getDate())?.padStart(2,'0')}-${Math.floor(Math.random()*9000)+1000}`;
  };

  const getLocationName = (locationId) => {
    return establishments?.find(e => e?.id === locationId)?.location_name || locationId || '—';
  };

  const handleAddItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev?.items, { product_id: '', product_name: '', quantity: 1, unit_cost: 0, batch_number: '', expiry_date: '' }]
    }));
  };

  const handleRemoveItem = (idx) => {
    setForm(prev => ({ ...prev, items: prev?.items?.filter((_, i) => i !== idx) }));
  };

  const handleItemChange = (idx, field, value) => {
    setForm(prev => {
      const items = [...prev?.items];
      items[idx] = { ...items?.[idx], [field]: value };
      if (field === 'product_id') {
        const prod = products?.find(p => p?.id === value);
        if (prod) {
          items[idx].product_name = prod?.name;
          items[idx].unit_cost = prod?.cost || prod?.metadata?.cost || 0;
        }
      }
      return { ...prev, items };
    });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form?.source_location_id || !form?.destination_location_id || !form?.reason) {
      alert('Completa establecimiento origen, destino y motivo');
      return;
    }
    if (form?.source_location_id === form?.destination_location_id) {
      alert('El establecimiento origen y destino deben ser diferentes');
      return;
    }
    setIsSaving(true);
    try {
      const transferNumber = generateTransferNumber();
      const totalCost = form?.items?.reduce((sum, i) => sum + (parseFloat(i?.unit_cost)||0) * (parseInt(i?.quantity)||0), 0);

      const sourceLocation = establishments?.find(e => e?.id === form?.source_location_id);
      const destLocation = establishments?.find(e => e?.id === form?.destination_location_id);

      const { data: transfer, error: tErr } = await supabase
        ?.from('inventory_transfers')
        ?.insert({
          user_id: authUser?.id,
          transfer_number: transferNumber,
          source_warehouse: sourceLocation?.location_name || form?.source_location_id,
          destination_warehouse: destLocation?.location_name || form?.destination_location_id,
          source_location_id: form?.source_location_id,
          destination_location_id: form?.destination_location_id,
          reason: form?.reason,
          notes: form?.notes,
          status: 'requested',
          total_cost_adjustment: totalCost,
          requested_by: authUser?.email
        })
        ?.select()
        ?.single();

      if (tErr) throw tErr;

      const items = form?.items?.filter(i => i?.product_id)?.map(i => ({
        transfer_id: transfer?.id,
        catalog_item_id: i?.product_id,
        product_name: i?.product_name,
        quantity: parseInt(i?.quantity) || 1,
        unit_cost: parseFloat(i?.unit_cost) || 0,
        batch_number: i?.batch_number || null,
        expiry_date: i?.expiry_date || null
      }));

      if (items?.length > 0) {
        await supabase?.from('inventory_transfer_items')?.insert(items);
      }

      await fetchTransfers();
      setShowForm(false);
      setForm({
        source_location_id: '', destination_location_id: '', reason: '', notes: '',
        items: [{ product_id: '', product_name: '', quantity: 1, unit_cost: 0, batch_number: '', expiry_date: '' }]
      });
    } catch (err) {
      console.error(err);
      alert('Error al crear transferencia: ' + err?.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (transferId, newStatus) => {
    try {
      const updateData = { status: newStatus, updated_at: new Date()?.toISOString() };
      if (newStatus === 'approved') updateData.approved_by = authUser?.email;
      if (newStatus === 'in_transit') updateData.shipped_at = new Date()?.toISOString();
      if (newStatus === 'received') {
        updateData.received_at = new Date()?.toISOString();
        const transfer = transfers?.find(t => t?.id === transferId);
        if (transfer?.inventory_transfer_items) {
          for (const item of transfer?.inventory_transfer_items) {
            if (item?.catalog_item_id) {
              const { data: ci } = await supabase
                ?.from('catalog_items')
                ?.select('stock_quantity')
                ?.eq('id', item?.catalog_item_id)
                ?.single();
              if (ci) {
                await supabase?.from('catalog_items')
                  ?.update({ stock_quantity: Math.max(0, (ci?.stock_quantity || 0) - item?.quantity) })
                  ?.eq('id', item?.catalog_item_id);
              }
            }
          }
        }
      }
      await supabase?.from('inventory_transfers')?.update(updateData)?.eq('id', transferId);
      await fetchTransfers();
    } catch (err) {
      console.error(err);
      alert('Error al actualizar estado');
    }
  };

  const filteredTransfers = transfers?.filter(t =>
    filterStatus === 'all' || t?.status === filterStatus
  );

  const stats = {
    total: transfers?.length,
    requested: transfers?.filter(t => t?.status === 'requested')?.length,
    inTransit: transfers?.filter(t => t?.status === 'in_transit')?.length,
    received: transfers?.filter(t => t?.status === 'received')?.length,
    totalCost: transfers?.filter(t => t?.status !== 'cancelled')?.reduce((s, t) => s + (t?.total_cost_adjustment || 0), 0)
  };

  const getNextStatus = (current) => {
    const flow = { requested: 'approved', approved: 'in_transit', in_transit: 'received' };
    return flow?.[current] || null;
  };

  const getNextStatusLabel = (current) => {
    const labels = { requested: 'Aprobar', approved: 'Iniciar Tránsito', in_transit: 'Marcar Recibido' };
    return labels?.[current] || null;
  };

  const selectedEstablishmentName = selectedEstablishment === 'all' ?'Todos los establecimientos'
    : establishments?.find(e => e?.id === selectedEstablishment)?.location_name || '';

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className={`pt-16 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <div className="p-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Link to="/catalog-management" className="hover:text-foreground transition-colors">
                  <span>Catálogo</span>
                </Link>
                <Icon name="ChevronRight" size={14} />
                <span className="text-foreground font-medium">Transferencias de Inventario</span>
              </nav>
              <h1 className="text-2xl font-bold text-foreground">Transferencias de Inventario</h1>
              <p className="text-muted-foreground">Mueve stock entre establecimientos con trazabilidad completa</p>
            </div>
            <Button variant="default" onClick={() => setShowForm(true)} iconName="Plus" iconPosition="left">
              Nueva Transferencia
            </Button>
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
                Mostrando transferencias de: <span className="font-medium text-foreground">{selectedEstablishmentName}</span>
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[
              { label: 'Total', value: stats?.total, icon: 'ArrowLeftRight', color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Solicitadas', value: stats?.requested, icon: 'Clock', color: 'text-yellow-600', bg: 'bg-yellow-50' },
              { label: 'En Tránsito', value: stats?.inTransit, icon: 'Truck', color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'Recibidas', value: stats?.received, icon: 'PackageCheck', color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Valor Total', value: formatPrice(stats?.totalCost), icon: 'DollarSign', color: 'text-purple-600', bg: 'bg-purple-50' }
            ]?.map((s, i) => (
              <div key={i} className={`${s?.bg} rounded-xl p-3 border border-border`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon name={s?.icon} size={14} className={s?.color} />
                  <span className="text-xs text-muted-foreground">{s?.label}</span>
                </div>
                <p className={`text-lg font-bold ${s?.color}`}>{s?.value}</p>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div className="flex items-center gap-3 mb-6">
            <label className="text-sm text-muted-foreground">Estado:</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e?.target?.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
            >
              <option value="all">Todos</option>
              {Object.entries(STATUS_CONFIG)?.map(([val, cfg]) => (
                <option key={val} value={val}>{cfg?.label}</option>
              ))}
            </select>
          </div>

          {/* Transfers List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Icon name="Loader2" size={32} className="animate-spin text-primary" />
            </div>
          ) : filteredTransfers?.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="ArrowLeftRight" size={24} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No hay transferencias</h3>
              <p className="text-muted-foreground mb-4">
                {selectedEstablishment !== 'all' ?'No hay transferencias para este establecimiento' :'Crea tu primera transferencia de inventario'}
              </p>
              <Button variant="default" onClick={() => setShowForm(true)} iconName="Plus" iconPosition="left">Nueva Transferencia</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransfers?.map(transfer => {
                const statusCfg = STATUS_CONFIG?.[transfer?.status] || STATUS_CONFIG?.requested;
                const nextStatus = getNextStatus(transfer?.status);
                const nextLabel = getNextStatusLabel(transfer?.status);
                const sourceName = transfer?.source_location_id
                  ? getLocationName(transfer?.source_location_id)
                  : transfer?.source_warehouse;
                const destName = transfer?.destination_location_id
                  ? getLocationName(transfer?.destination_location_id)
                  : transfer?.destination_warehouse;
                return (
                  <div key={transfer?.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon name="ArrowLeftRight" size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{transfer?.transfer_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transfer.created_at)?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusCfg?.color}`}>
                        {statusCfg?.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Origen</p>
                        <p className="text-sm font-medium text-foreground flex items-center gap-1">
                          <Icon name="Building2" size={12} className="text-muted-foreground" />
                          {sourceName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Destino</p>
                        <p className="text-sm font-medium text-foreground flex items-center gap-1">
                          <Icon name="Building2" size={12} className="text-primary" />
                          {destName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Motivo</p>
                        <p className="text-sm font-medium text-foreground">{transfer?.reason}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Ajuste de Costo</p>
                        <p className="text-sm font-medium text-purple-600">{formatPrice(transfer?.total_cost_adjustment || 0)}</p>
                      </div>
                    </div>
                    {transfer?.inventory_transfer_items?.length > 0 && (
                      <div className="bg-muted/50 rounded-lg p-3 mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Productos ({transfer?.inventory_transfer_items?.length})</p>
                        <div className="space-y-1">
                          {transfer?.inventory_transfer_items?.slice(0, 3)?.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="text-foreground">{item?.product_name}</span>
                              <div className="flex items-center gap-3">
                                {item?.batch_number && <span className="text-muted-foreground">Lote: {item?.batch_number}</span>}
                                <span className="font-medium">x{item?.quantity}</span>
                              </div>
                            </div>
                          ))}
                          {transfer?.inventory_transfer_items?.length > 3 && (
                            <p className="text-xs text-muted-foreground">+{transfer?.inventory_transfer_items?.length - 3} más</p>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {transfer?.requested_by && <span>Solicitado por: {transfer?.requested_by}</span>}
                        {transfer?.approved_by && <span>• Aprobado por: {transfer?.approved_by}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {nextStatus && transfer?.status !== 'cancelled' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleUpdateStatus(transfer?.id, nextStatus)}
                            iconName={STATUS_CONFIG?.[nextStatus]?.icon}
                            iconPosition="left"
                          >
                            {nextLabel}
                          </Button>
                        )}
                        {transfer?.status === 'requested' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(transfer?.id, 'cancelled')}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* New Transfer Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-3xl my-4">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Nueva Transferencia de Inventario</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-muted rounded-lg">
                <Icon name="X" size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Establecimiento Origen *</label>
                  <select
                    value={form?.source_location_id}
                    onChange={e => setForm(prev => ({ ...prev, source_location_id: e?.target?.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                    required
                  >
                    <option value="">Seleccionar origen...</option>
                    {establishments?.map(est => (
                      <option key={est?.id} value={est?.id}>{est?.location_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Establecimiento Destino *</label>
                  <select
                    value={form?.destination_location_id}
                    onChange={e => setForm(prev => ({ ...prev, destination_location_id: e?.target?.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                    required
                  >
                    <option value="">Seleccionar destino...</option>
                    {establishments?.filter(est => est?.id !== form?.source_location_id)?.map(est => (
                      <option key={est?.id} value={est?.id}>{est?.location_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Motivo de Transferencia *</label>
                <select
                  value={form?.reason}
                  onChange={e => setForm(prev => ({ ...prev, reason: e?.target?.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                  required
                >
                  <option value="">Seleccionar motivo...</option>
                  {TRANSFER_REASONS?.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Notas adicionales</label>
                <textarea
                  value={form?.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e?.target?.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm resize-none"
                  placeholder="Observaciones opcionales..."
                />
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-foreground">Productos a Transferir</label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddItem} iconName="Plus" iconPosition="left">Agregar</Button>
                </div>
                {products?.length === 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm flex items-center gap-2 mb-3">
                    <Icon name="AlertTriangle" size={15} />
                    {selectedEstablishment !== 'all' ?'No hay productos activos en el establecimiento seleccionado' :'No hay productos activos en tu catálogo'}
                  </div>
                )}
                <div className="space-y-3">
                  {form?.items?.map((item, idx) => (
                    <div key={idx} className="bg-muted/50 rounded-lg p-3">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-2">
                        <div className="md:col-span-2">
                          <label className="block text-xs text-muted-foreground mb-1">Producto</label>
                          <select
                            value={item?.product_id}
                            onChange={e => handleItemChange(idx, 'product_id', e?.target?.value)}
                            className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm"
                          >
                            <option value="">Seleccionar producto...</option>
                            {products?.map(p => (
                              <option key={p?.id} value={p?.id}>{p?.name} (Stock: {p?.stock_quantity || 0})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Cantidad</label>
                          <input
                            type="number"
                            min="1"
                            value={item?.quantity}
                            onChange={e => handleItemChange(idx, 'quantity', e?.target?.value)}
                            className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Costo Unitario</label>
                          <input
                            type="number"
                            step="0.01"
                            value={item?.unit_cost}
                            onChange={e => handleItemChange(idx, 'unit_cost', e?.target?.value)}
                            className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Número de Lote</label>
                          <input
                            type="text"
                            value={item?.batch_number}
                            onChange={e => handleItemChange(idx, 'batch_number', e?.target?.value)}
                            className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm"
                            placeholder="Ej: LOT-001"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Fecha Caducidad</label>
                          <input
                            type="date"
                            value={item?.expiry_date}
                            onChange={e => handleItemChange(idx, 'expiry_date', e?.target?.value)}
                            className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm"
                          />
                        </div>
                      </div>
                      {form?.items?.length > 1 && (
                        <button type="button" onClick={() => handleRemoveItem(idx)} className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                          <Icon name="Trash2" size={12} /> Eliminar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" variant="default" disabled={isSaving} iconName={isSaving ? 'Loader2' : 'Send'} iconPosition="left">
                  {isSaving ? 'Creando...' : 'Crear Transferencia'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTransfers;
