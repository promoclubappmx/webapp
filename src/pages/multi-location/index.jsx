import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';




const MultiLocation = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [businessId, setBusinessId] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'inventory', 'staff', 'sales'
  const [loading, setLoading] = useState(true);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const navigate = useNavigate();

  // Location form state
  const [locationForm, setLocationForm] = useState({
    location_name: '',
    location_code: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'España',
    phone: '',
    email: '',
    timezone: 'Europe/Madrid'
  });

  // Get business ID
  useEffect(() => {
    const fetchBusinessId = async () => {
      const { data: { session } } = await supabase?.auth?.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        ?.from('user_profiles')
        ?.select('user_id')
        ?.eq('id', session?.user?.id)
        ?.single();

      if (profile?.user_id) {
        setBusinessId(profile?.user_id);
      }
    };

    fetchBusinessId();
  }, [navigate]);

  // Fetch locations
  useEffect(() => {
    if (!businessId) return;

    const fetchLocations = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          ?.from('business_locations')
          ?.select(`
            *,
            manager:staff_members(full_name)
          `)
          ?.eq('business_id', businessId)
          ?.order('created_at', { ascending: false });

        if (error) throw error;
        setLocations(data || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [businessId]);

  // Real-time subscription
  useEffect(() => {
    if (!businessId) return;

    const channel = supabase
      ?.channel('business_locations_changes')
      ?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'business_locations',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          console.log('Location change detected:', payload);
          if (payload?.eventType === 'INSERT') {
            setLocations(prev => [payload?.new, ...prev]);
          } else if (payload?.eventType === 'UPDATE') {
            setLocations(prev => prev?.map(loc => 
              loc?.id === payload?.new?.id ? payload?.new : loc
            ));
          } else if (payload?.eventType === 'DELETE') {
            setLocations(prev => prev?.filter(loc => loc?.id !== payload?.old?.id));
          }
        }
      )
      ?.subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [businessId]);

  const handleSaveLocation = async () => {
    try {
      const { data: { session } } = await supabase?.auth?.getSession();
      
      const locationData = {
        ...locationForm,
        business_id: businessId,
        created_by: session?.user?.id
      };

      if (editingLocation) {
        const { error } = await supabase
          ?.from('business_locations')
          ?.update(locationData)
          ?.eq('id', editingLocation?.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          ?.from('business_locations')
          ?.insert([locationData]);

        if (error) throw error;
      }

      setShowLocationForm(false);
      setEditingLocation(null);
      setLocationForm({
        location_name: '',
        location_code: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'España',
        phone: '',
        email: '',
        timezone: 'Europe/Madrid'
      });
    } catch (error) {
      console.error('Error saving location:', error);
      alert('Error al guardar la ubicación');
    }
  };

  const handleEditLocation = (location) => {
    setEditingLocation(location);
    setLocationForm({
      location_name: location?.location_name || '',
      location_code: location?.location_code || '',
      address: location?.address || '',
      city: location?.city || '',
      state: location?.state || '',
      postal_code: location?.postal_code || '',
      country: location?.country || 'España',
      phone: location?.phone || '',
      email: location?.email || '',
      timezone: location?.timezone || 'Europe/Madrid'
    });
    setShowLocationForm(true);
  };

  const handleDeleteLocation = async (locationId) => {
    if (!confirm('¿Estás seguro de eliminar esta ubicación?')) return;

    try {
      const { error } = await supabase
        ?.from('business_locations')
        ?.delete()
        ?.eq('id', locationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('Error al eliminar la ubicación');
    }
  };

  const locationOptions = [
    { value: 'all', label: 'Todas las ubicaciones' },
    ...locations?.map(loc => ({
      value: loc?.id,
      label: `${loc?.location_name} (${loc?.location_code})`
    }))
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        user={{ name: 'Usuario', role: 'owner' }}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={{ name: 'Usuario', role: 'owner' }}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${
          isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}>
          <div className="p-6 space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <Icon name="Building2" size={32} className="text-primary" />
                  Gestión Multi-Ubicación
                </h1>
                <p className="text-muted-foreground mt-1">
                  Administra inventario, personal y ventas en todas tus sucursales
                </p>
              </div>

              <Button
                onClick={() => {
                  setEditingLocation(null);
                  setShowLocationForm(true);
                }}
                iconName="Plus"
              >
                Nueva Ubicación
              </Button>
            </div>

            {/* Location Selector */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-4">
                <Icon name="MapPin" size={20} className="text-primary" />
                <div className="flex-1">
                  <Select
                    options={locationOptions}
                    value={selectedLocation}
                    onChange={setSelectedLocation}
                    placeholder="Selecciona una ubicación"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {locations?.length} ubicación(es) registrada(s)
                </div>
              </div>
            </div>

            {/* Location Form Modal */}
            {showLocationForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-border flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">
                      {editingLocation ? 'Editar Ubicación' : 'Nueva Ubicación'}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowLocationForm(false);
                        setEditingLocation(null);
                      }}
                      iconName="X"
                    />
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Nombre de la Ubicación"
                        type="text"
                        placeholder="Sucursal Centro"
                        value={locationForm?.location_name}
                        onChange={(e) => setLocationForm({ ...locationForm, location_name: e?.target?.value })}
                        required
                      />
                      <Input
                        label="Código de Ubicación"
                        type="text"
                        placeholder="SUC-001"
                        value={locationForm?.location_code}
                        onChange={(e) => setLocationForm({ ...locationForm, location_code: e?.target?.value })}
                        required
                      />
                    </div>

                    <Input
                      label="Dirección"
                      type="text"
                      placeholder="Calle Mayor, 123"
                      value={locationForm?.address}
                      onChange={(e) => setLocationForm({ ...locationForm, address: e?.target?.value })}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Ciudad"
                        type="text"
                        placeholder="Madrid"
                        value={locationForm?.city}
                        onChange={(e) => setLocationForm({ ...locationForm, city: e?.target?.value })}
                      />
                      <Input
                        label="Provincia"
                        type="text"
                        placeholder="Madrid"
                        value={locationForm?.state}
                        onChange={(e) => setLocationForm({ ...locationForm, state: e?.target?.value })}
                      />
                      <Input
                        label="Código Postal"
                        type="text"
                        placeholder="28001"
                        value={locationForm?.postal_code}
                        onChange={(e) => setLocationForm({ ...locationForm, postal_code: e?.target?.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Teléfono"
                        type="tel"
                        placeholder="+34 91 123 4567"
                        value={locationForm?.phone}
                        onChange={(e) => setLocationForm({ ...locationForm, phone: e?.target?.value })}
                      />
                      <Input
                        label="Email"
                        type="email"
                        placeholder="sucursal@negocio.com"
                        value={locationForm?.email}
                        onChange={(e) => setLocationForm({ ...locationForm, email: e?.target?.value })}
                      />
                    </div>
                  </div>

                  <div className="p-6 border-t border-border flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowLocationForm(false);
                        setEditingLocation(null);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveLocation}>
                      {editingLocation ? 'Actualizar' : 'Crear'} Ubicación
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-card border border-border rounded-lg">
              <div className="border-b border-border">
                <div className="flex overflow-x-auto">
                  {[
                    { id: 'overview', label: 'Resumen', icon: 'LayoutDashboard' },
                    { id: 'inventory', label: 'Inventario', icon: 'Package' },
                    { id: 'staff', label: 'Personal', icon: 'Users' },
                    { id: 'sales', label: 'Ventas', icon: 'TrendingUp' }
                  ]?.map(tab => (
                    <button
                      key={tab?.id}
                      onClick={() => setActiveTab(tab?.id)}
                      className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                        activeTab === tab?.id
                          ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon name={tab?.icon} size={18} />
                      {tab?.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <OverviewTab
                    locations={locations}
                    selectedLocation={selectedLocation}
                    businessId={businessId}
                    onEdit={handleEditLocation}
                    onDelete={handleDeleteLocation}
                  />
                )}
                {activeTab === 'inventory' && (
                  <InventoryTab
                    selectedLocation={selectedLocation}
                    businessId={businessId}
                  />
                )}
                {activeTab === 'staff' && (
                  <StaffTab
                    selectedLocation={selectedLocation}
                    businessId={businessId}
                  />
                )}
                {activeTab === 'sales' && (
                  <SalesTab
                    selectedLocation={selectedLocation}
                    businessId={businessId}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ locations, selectedLocation, onEdit, onDelete }) => {
  const filteredLocations = selectedLocation === 'all' 
    ? locations 
    : locations?.filter(loc => loc?.id === selectedLocation);

  if (filteredLocations?.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon name="Building2" size={48} className="mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No hay ubicaciones registradas</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredLocations?.map(location => (
        <div key={location?.id} className="bg-muted/30 border border-border rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Icon name="MapPin" size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">{location?.location_name}</h3>
                <p className="text-sm text-muted-foreground">{location?.location_code}</p>
              </div>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              location?.is_active
                ? 'bg-blue-100 text-blue-800' :'bg-gray-100 text-gray-800'
            }`}>
              {location?.is_active ? 'Activa' : 'Inactiva'}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            {location?.address && (
              <div className="flex items-start gap-2 text-sm">
                <Icon name="MapPin" size={16} className="text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">
                  {location?.address}, {location?.city}
                </span>
              </div>
            )}
            {location?.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Icon name="Phone" size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">{location?.phone}</span>
              </div>
            )}
            {location?.email && (
              <div className="flex items-center gap-2 text-sm">
                <Icon name="Mail" size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">{location?.email}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(location)}
              iconName="Edit"
              className="flex-1"
            >
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(location?.id)}
              iconName="Trash2"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Inventory Tab Component
const InventoryTab = ({ selectedLocation, businessId }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) return;

    const fetchInventory = async () => {
      setLoading(true);
      try {
        let query = supabase
          ?.from('location_inventory')
          ?.select(`
            *,
            location:business_locations(location_name, location_code),
            item:catalog_items(name, sku, price)
          `)
          ?.eq('business_id', businessId);

        if (selectedLocation !== 'all') {
          query = query?.eq('location_id', selectedLocation);
        }

        const { data, error } = await query;
        if (error) throw error;
        setInventory(data || []);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [businessId, selectedLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (inventory?.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No hay inventario registrado</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Ubicación</th>
            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Producto</th>
            <th className="text-right p-4 text-sm font-medium text-muted-foreground">Cantidad</th>
            <th className="text-right p-4 text-sm font-medium text-muted-foreground">Mínimo</th>
            <th className="text-center p-4 text-sm font-medium text-muted-foreground">Estado</th>
          </tr>
        </thead>
        <tbody>
          {inventory?.map(item => {
            const isLowStock = item?.quantity <= item?.min_quantity;
            return (
              <tr key={item?.id} className="border-b border-border hover:bg-muted/30">
                <td className="p-4">
                  <div>
                    <p className="font-medium text-foreground">{item?.location?.location_name}</p>
                    <p className="text-xs text-muted-foreground">{item?.location?.location_code}</p>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <p className="font-medium text-foreground">{item?.item?.name}</p>
                    <p className="text-xs text-muted-foreground">{item?.item?.sku}</p>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <span className={`font-semibold ${
                    isLowStock ? 'text-orange-600' : 'text-foreground'
                  }`}>
                    {item?.quantity}
                  </span>
                </td>
                <td className="p-4 text-right text-muted-foreground">
                  {item?.min_quantity}
                </td>
                <td className="p-4 text-center">
                  {isLowStock ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                      <Icon name="AlertTriangle" size={12} />
                      Stock Bajo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      <Icon name="Check" size={12} />
                      Normal
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Staff Tab Component
const StaffTab = ({ selectedLocation, businessId }) => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) return;

    const fetchStaff = async () => {
      setLoading(true);
      try {
        let query = supabase
          ?.from('location_staff_assignments')
          ?.select(`
            *,
            location:business_locations(location_name, location_code),
            staff:staff_members(full_name, email, staff_role, is_active)
          `)
          ?.eq('business_id', businessId);

        if (selectedLocation !== 'all') {
          query = query?.eq('location_id', selectedLocation);
        }

        const { data, error } = await query;
        if (error) throw error;
        setStaff(data || []);
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [businessId, selectedLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (staff?.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No hay personal asignado</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Ubicación</th>
            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Personal</th>
            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Rol</th>
            <th className="text-center p-4 text-sm font-medium text-muted-foreground">Principal</th>
            <th className="text-center p-4 text-sm font-medium text-muted-foreground">Estado</th>
          </tr>
        </thead>
        <tbody>
          {staff?.map(assignment => (
            <tr key={assignment?.id} className="border-b border-border hover:bg-muted/30">
              <td className="p-4">
                <div>
                  <p className="font-medium text-foreground">{assignment?.location?.location_name}</p>
                  <p className="text-xs text-muted-foreground">{assignment?.location?.location_code}</p>
                </div>
              </td>
              <td className="p-4">
                <div>
                  <p className="font-medium text-foreground">{assignment?.staff?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{assignment?.staff?.email}</p>
                </div>
              </td>
              <td className="p-4">
                <span className="capitalize text-foreground">{assignment?.staff?.staff_role}</span>
              </td>
              <td className="p-4 text-center">
                {assignment?.is_primary_location && (
                  <Icon name="Star" size={16} className="text-yellow-500 mx-auto" />
                )}
              </td>
              <td className="p-4 text-center">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  assignment?.staff?.is_active
                    ? 'bg-blue-100 text-blue-800' :'bg-gray-100 text-gray-800'
                }`}>
                  {assignment?.staff?.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Sales Tab Component
const SalesTab = ({ selectedLocation, businessId }) => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7days');

  useEffect(() => {
    if (!businessId) return;

    const fetchSalesData = async () => {
      setLoading(true);
      try {
        const now = new Date();
        let startDate = new Date();
        
        if (dateRange === '7days') {
          startDate?.setDate(now?.getDate() - 7);
        } else if (dateRange === '30days') {
          startDate?.setDate(now?.getDate() - 30);
        } else if (dateRange === '90days') {
          startDate?.setDate(now?.getDate() - 90);
        }

        let query = supabase
          ?.from('location_sales_summary')
          ?.select(`
            *,
            location:business_locations(location_name, location_code)
          `)
          ?.eq('business_id', businessId)
          ?.gte('summary_date', startDate?.toISOString()?.split('T')?.[0])
          ?.order('summary_date', { ascending: false });

        if (selectedLocation !== 'all') {
          query = query?.eq('location_id', selectedLocation);
        }

        const { data, error } = await query;
        if (error) throw error;
        setSalesData(data || []);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [businessId, selectedLocation, dateRange]);

  const dateRangeOptions = [
    { value: '7days', label: 'Últimos 7 días' },
    { value: '30days', label: 'Últimos 30 días' },
    { value: '90days', label: 'Últimos 90 días' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select
          options={dateRangeOptions}
          value={dateRange}
          onChange={setDateRange}
          placeholder="Rango de fecha"
        />
      </div>

      {salesData?.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="TrendingUp" size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No hay datos de ventas disponibles</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Fecha</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Ubicación</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Ventas Totales</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Transacciones</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Ticket Promedio</th>
              </tr>
            </thead>
            <tbody>
              {salesData?.map(summary => (
                <tr key={summary?.id} className="border-b border-border hover:bg-muted/30">
                  <td className="p-4 text-foreground">
                    {new Date(summary?.summary_date)?.toLocaleDateString('es-ES')}
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-foreground">{summary?.location?.location_name}</p>
                      <p className="text-xs text-muted-foreground">{summary?.location?.location_code}</p>
                    </div>
                  </td>
                  <td className="p-4 text-right font-semibold text-foreground">
                    €{summary?.total_sales?.toFixed(2)}
                  </td>
                  <td className="p-4 text-right text-foreground">
                    {summary?.total_transactions}
                  </td>
                  <td className="p-4 text-right text-muted-foreground">
                    €{summary?.average_transaction_value?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MultiLocation;