import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';

// Tabs shown when creating a new supplier
const TABS_NEW = [
  { id: 'general', label: 'Información General', icon: 'Building2' },
  { id: 'domicilio', label: 'Domicilio', icon: 'MapPin' },
  { id: 'fiscal', label: 'Datos Fiscales', icon: 'FileText' },
];

// All tabs shown when viewing/editing an existing supplier
const TABS_ALL = [
  { id: 'general', label: 'Información General', icon: 'Building2' },
  { id: 'domicilio', label: 'Domicilio', icon: 'MapPin' },
  { id: 'fiscal', label: 'Datos Fiscales', icon: 'FileText' },
  { id: 'productos', label: 'Productos / Servicios', icon: 'Package' },
  { id: 'pedidos', label: 'Pedidos', icon: 'ShoppingCart' },
  { id: 'recepciones', label: 'Recepciones', icon: 'PackageCheck' },
  { id: 'pagos', label: 'Pagos', icon: 'CreditCard' },
  { id: 'notas', label: 'Notas', icon: 'StickyNote' },
];

const PAYMENT_TERMS = [
  { value: 'immediate', label: 'Pago inmediato' },
  { value: 'net15', label: 'Neto 15 días' },
  { value: 'net30', label: 'Neto 30 días' },
  { value: 'net45', label: 'Neto 45 días' },
  { value: 'net60', label: 'Neto 60 días' },
];

const CFDI_USES = [
  { value: 'G01', label: 'G01 - Adquisición de mercancias' },
  { value: 'G03', label: 'G03 - Gastos en general' },
  { value: 'I01', label: 'I01 - Construcciones' },
  { value: 'I02', label: 'I02 - Mobilario y equipo de oficina' },
  { value: 'I04', label: 'I04 - Equipo de computo y accesorios' },
  { value: 'I06', label: 'I06 - Comunicaciones telefónicas' },
  { value: 'P01', label: 'P01 - Por definir' },
];

const TAX_REGIMES = [
  '601 - General de Ley Personas Morales',
  '603 - Personas Morales con Fines no Lucrativos',
  '605 - Sueldos y Salarios e Ingresos Asimilados a Salarios',
  '606 - Arrendamiento',
  '608 - Demás ingresos',
  '609 - Consolidación',
  '610 - Residentes en el Extranjero sin Establecimiento Permanente en México',
  '611 - Ingresos por Dividendos (socios y accionistas)',
  '612 - Personas Físicas con Actividades Empresariales y Profesionales',
  '614 - Ingresos por intereses',
  '616 - Sin obligaciones fiscales',
  '620 - Sociedades Cooperativas de Producción que optan por diferir sus ingresos',
  '621 - Incorporación Fiscal',
  '622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras',
  '623 - Opcional para Grupos de Sociedades',
  '624 - Coordinados',
  '628 - Hidrocarburos',
  '607 - Régimen de Enajenación o Adquisición de Bienes',
  '629 - De los Regímenes Fiscales Preferentes y de las Empresas Multinacionales',
  '630 - Enajenación de acciones en bolsa de valores',
  '615 - Régimen de los ingresos por obtención de premios',
  '625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas',
  '626 - Régimen Simplificado de Confianza',
];

const PAYMENT_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  partial: 'bg-orange-100 text-orange-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-600',
  cancelled: 'bg-gray-100 text-gray-600',
};

const SupplierFullForm = () => {
  const { user: authUser } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const { id: supplierId } = useParams();
  const isEditing = !!supplierId;

  const TABS = isEditing ? TABS_ALL : TABS_NEW;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Establishments
  const [establishments, setEstablishments] = useState([]);
  const [selectedEstablishment, setSelectedEstablishment] = useState('all');

  // Related data
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [goodsReceipts, setGoodsReceipts] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [categories, setCategories] = useState([]);

  // Fiscal address same as supplier address
  const [sameAddressAsFiscal, setSameAddressAsFiscal] = useState(false);

  // Payment management state
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [paymentNote, setPaymentNote] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [form, setForm] = useState({
    name: '',
    business_name: '',
    contact_name: '',
    email: '',
    phone: '',
    website: '',
    category: '',
    category_id: '',
    is_active: true,
    rating: 0,
    // Domicilio
    street: '',
    ext_number: '',
    int_number: '',
    neighborhood: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'México',
    // Fiscal
    rfc: '',
    tax_regime: '',
    fiscal_address: '',
    fiscal_street: '',
    fiscal_ext_number: '',
    fiscal_int_number: '',
    fiscal_neighborhood: '',
    fiscal_city: '',
    fiscal_state: '',
    fiscal_postal_code: '',
    fiscal_country: 'México',
    cfdi_use: 'G03',
    payment_method: 'PUE',
    payment_terms: 'net30',
    delivery_days: '',
    currency: 'MXN',
    credit_limit: '',
    discount_percentage: '',
    bank_name: '',
    bank_account: '',
    bank_clabe: '',
    notes: '',
    location_id: '',
  });

  const user = {
    id: authUser?.id,
    name: authUser?.user_metadata?.full_name || 'Admin',
    email: authUser?.email || '',
    role: 'owner',
  };

  // Load establishments
  useEffect(() => {
    const fetchEstablishments = async () => {
      if (!authUser?.id) return;
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
          ?.order('location_name');
        setEstablishments(data || []);
      } catch (err) {
        console.error('Error loading establishments:', err);
      }
    };
    fetchEstablishments();
  }, [authUser?.id]);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await supabase
          ?.from('product_categories')
          ?.select('id, name')
          ?.eq('is_active', true)
          ?.order('name');
        setCategories(data || []);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Load supplier if editing
  useEffect(() => {
    if (!isEditing || !authUser?.id) return;
    const fetchSupplier = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          ?.from('suppliers')
          ?.select('*')
          ?.eq('id', supplierId)
          ?.eq('user_id', authUser?.id)
          ?.single();
        if (error) throw error;
        if (data) {
          setForm({
            name: data?.name || '',
            business_name: data?.business_name || '',
            contact_name: data?.contact_name || '',
            email: data?.email || '',
            phone: data?.phone || '',
            website: data?.website || '',
            category: data?.category || '',
            category_id: data?.category_id || '',
            is_active: data?.is_active !== false,
            rating: data?.rating || 0,
            street: data?.street || '',
            ext_number: data?.ext_number || '',
            int_number: data?.int_number || '',
            neighborhood: data?.neighborhood || '',
            city: data?.city || '',
            state: data?.state || '',
            postal_code: data?.postal_code || '',
            country: data?.country || 'México',
            rfc: data?.rfc || '',
            tax_regime: data?.tax_regime || '',
            fiscal_address: data?.fiscal_address || '',
            fiscal_street: data?.fiscal_street || '',
            fiscal_ext_number: data?.fiscal_ext_number || '',
            fiscal_int_number: data?.fiscal_int_number || '',
            fiscal_neighborhood: data?.fiscal_neighborhood || '',
            fiscal_city: data?.fiscal_city || '',
            fiscal_state: data?.fiscal_state || '',
            fiscal_postal_code: data?.fiscal_postal_code || '',
            fiscal_country: data?.fiscal_country || 'México',
            cfdi_use: data?.cfdi_use || 'G03',
            payment_method: data?.payment_method || 'PUE',
            payment_terms: data?.payment_terms || 'net30',
            delivery_days: data?.delivery_days || '',
            currency: data?.currency || 'MXN',
            credit_limit: data?.credit_limit || '',
            discount_percentage: data?.discount_percentage || '',
            bank_name: data?.bank_name || '',
            bank_account: data?.bank_account || '',
            bank_clabe: data?.bank_clabe || '',
            notes: data?.notes || '',
            location_id: data?.location_id || '',
          });
        }
      } catch (err) {
        console.error('Error loading supplier:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSupplier();
  }, [supplierId, authUser?.id, isEditing]);

  // Load related data when editing
  const fetchRelatedData = useCallback(async () => {
    if (!isEditing || !authUser?.id) return;
    try {
      const [productsRes, ordersRes, receiptsRes, notesRes] = await Promise.all([
        supabase
          ?.from('supplier_products')
          ?.select('*, catalog_items(id, name, sku, stock_quantity, price, business_location_id)')
          ?.eq('supplier_id', supplierId)
          ?.order('created_at', { ascending: false }),
        supabase
          ?.from('purchase_orders')
          ?.select('*')
          ?.eq('supplier_id', supplierId)
          ?.order('created_at', { ascending: false })
          ?.limit(50),
        supabase
          ?.from('goods_receipts')
          ?.select('*, goods_receipt_items(*)')
          ?.eq('supplier_id', supplierId)
          ?.order('received_date', { ascending: false })
          ?.limit(50),
        supabase
          ?.from('supplier_notes')
          ?.select('*')
          ?.eq('supplier_id', supplierId)
          ?.order('created_at', { ascending: false }),
      ]);
      setSupplierProducts(productsRes?.data || []);
      setPurchaseOrders(ordersRes?.data || []);
      setGoodsReceipts(receiptsRes?.data || []);
      setNotes(notesRes?.data || []);
    } catch (err) {
      console.error('Error loading related data:', err);
    }
  }, [supplierId, authUser?.id, isEditing]);

  useEffect(() => {
    fetchRelatedData();
  }, [fetchRelatedData]);

  // Real-time subscriptions for related data
  useEffect(() => {
    if (!isEditing || !supplierId) return;
    const channel = supabase
      ?.channel(`supplier_detail_${supplierId}`)
      ?.on('postgres_changes', { event: '*', schema: 'public', table: 'supplier_notes', filter: `supplier_id=eq.${supplierId}` }, fetchRelatedData)
      ?.on('postgres_changes', { event: '*', schema: 'public', table: 'purchase_orders', filter: `supplier_id=eq.${supplierId}` }, fetchRelatedData)
      ?.on('postgres_changes', { event: '*', schema: 'public', table: 'goods_receipts', filter: `supplier_id=eq.${supplierId}` }, fetchRelatedData)
      ?.subscribe();
    return () => { supabase?.removeChannel(channel); };
  }, [supplierId, isEditing, fetchRelatedData]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (fieldErrors?.[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Validate required fields — returns errors object
  const validateRequiredFields = () => {
    const errors = {};
    if (!form?.name?.trim()) errors.name = 'El nombre del proveedor es obligatorio';
    return errors;
  };

  const handleSave = async () => {
    const errors = validateRequiredFields();
    if (Object.keys(errors)?.length > 0) {
      setFieldErrors(errors);
      setActiveTab('general');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...form,
        delivery_days: form?.delivery_days ? parseInt(form?.delivery_days) : null,
        credit_limit: form?.credit_limit ? parseFloat(form?.credit_limit) : 0,
        discount_percentage: form?.discount_percentage ? parseFloat(form?.discount_percentage) : 0,
        updated_at: new Date()?.toISOString(),
      };

      if (isEditing) {
        const { error } = await supabase
          ?.from('suppliers')
          ?.update(payload)
          ?.eq('id', supplierId)
          ?.eq('user_id', authUser?.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          ?.from('suppliers')
          ?.insert({ ...payload, user_id: authUser?.id });
        if (error) throw error;
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (!isEditing) {
        navigate('/suppliers');
      }
    } catch (err) {
      console.error('Error saving supplier:', err);
      alert('Error al guardar el proveedor: ' + err?.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote?.trim() || !authUser?.id) return;
    setIsSavingNote(true);
    try {
      const { error } = await supabase?.from('supplier_notes')?.insert({
        supplier_id: supplierId,
        user_id: authUser?.id,
        content: newNote?.trim(),
        note_type: 'general',
      });
      if (error) throw error;
      setNewNote('');
      fetchRelatedData();
    } catch (err) {
      console.error('Error adding note:', err);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('¿Eliminar esta nota?')) return;
    try {
      await supabase?.from('supplier_notes')?.delete()?.eq('id', noteId);
      fetchRelatedData();
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const handleProcessPayment = async (order) => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Ingresa un monto válido');
      return;
    }
    setIsProcessingPayment(true);
    try {
      const amount = parseFloat(paymentAmount);
      const total = order?.total_amount || 0;
      const newStatus = amount >= total ? 'paid' : 'partial';
      await supabase
        ?.from('purchase_orders')
        ?.update({
          payment_status: newStatus,
          paid_amount: amount,
          payment_date: new Date()?.toISOString(),
          payment_notes: paymentNote || null,
          updated_at: new Date()?.toISOString(),
        })
        ?.eq('id', order?.id);
      setPayingOrderId(null);
      setPaymentAmount('');
      setPaymentMethod('transfer');
      setPaymentNote('');
      fetchRelatedData();
    } catch (err) {
      console.error('Error processing payment:', err);
      alert('Error al registrar el pago: ' + err?.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const filteredProducts = selectedEstablishment === 'all'
    ? supplierProducts
    : supplierProducts?.filter(p => p?.catalog_items?.business_location_id === selectedEstablishment);

  const filteredOrders = selectedEstablishment === 'all'
    ? purchaseOrders
    : purchaseOrders?.filter(o => o?.location_id === selectedEstablishment || o?.business_location_id === selectedEstablishment);

  const filteredReceipts = selectedEstablishment === 'all'
    ? goodsReceipts
    : goodsReceipts?.filter(r => r?.location_id === selectedEstablishment || r?.business_location_id === selectedEstablishment);

  // Pending payment orders: not fully paid
  const pendingPaymentOrders = purchaseOrders?.filter(o =>
    o?.status !== 'cancelled' && o?.payment_status !== 'paid'
  );

  const formatDate = (d) => d ? new Date(d)?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const STATUS_COLORS = {
    draft: 'bg-gray-100 text-gray-600',
    sent: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-yellow-100 text-yellow-700',
    partial: 'bg-orange-100 text-orange-700',
    received: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
    pending: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
  };

  const isSaveDisabled = isSaving || !form?.name?.trim();

  // Wizard navigation helpers (for new supplier)
  const currentTabIndex = TABS_NEW?.findIndex(t => t?.id === activeTab);
  const canGoPrev = !isEditing && currentTabIndex > 0;
  const canGoNext = !isEditing && currentTabIndex < TABS_NEW?.length - 1;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Icon name="Loader2" size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={user}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className={`pt-16 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'} flex-1 overflow-y-auto`}>
          <div className="p-6 max-w-[1400px] mx-auto">

            {/* Breadcrumb + Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                  <button onClick={() => navigate('/suppliers')} className="hover:text-foreground transition-colors">
                    Proveedores
                  </button>
                  <Icon name="ChevronRight" size={14} />
                  <span className="text-foreground font-medium">
                    {isEditing ? (form?.name || 'Editar Proveedor') : 'Nuevo Proveedor'}
                  </span>
                </nav>
                <h1 className="text-2xl font-bold text-foreground">
                  {isEditing ? form?.name || 'Editar Proveedor' : 'Nuevo Proveedor'}
                </h1>
                {isEditing && form?.category && (
                  <span className="text-sm text-muted-foreground">{form?.category}</span>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {saveSuccess && (
                  <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                    <Icon name="CheckCircle" size={16} />
                    Guardado
                  </span>
                )}
                <Button variant="outline" onClick={() => navigate('/suppliers')} iconName="ArrowLeft" iconPosition="left">
                  Volver
                </Button>
                <Button
                  variant="default"
                  onClick={handleSave}
                  disabled={isSaveDisabled}
                  iconName={isSaving ? 'Loader2' : 'Save'}
                  iconPosition="left"
                  title={!form?.name?.trim() ? 'Completa los campos obligatorios para guardar' : ''}
                >
                  {isSaving ? 'Guardando...' : 'Guardar Proveedor'}
                </Button>
              </div>
            </div>

            {/* Supplier Summary Card (top info) — only in edit mode */}
            {isEditing && (
              <div className="bg-card border border-border rounded-xl p-5 mb-6">
                <div className="flex flex-col md:flex-row md:items-center gap-5">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon name="Truck" size={28} className="text-primary" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Nombre del proveedor</p>
                      <p className="text-sm font-semibold text-foreground">{form?.name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Contacto principal</p>
                      <p className="text-sm text-foreground">{form?.contact_name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                      <p className="text-sm text-foreground">{form?.email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Teléfono</p>
                      <p className="text-sm text-foreground">{form?.phone || '—'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleChange('is_active', !form?.is_active)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        form?.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${form?.is_active ? 'bg-green-500' : 'bg-red-400'}`} />
                      {form?.is_active ? 'Activo' : 'Inactivo'}
                    </button>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Pedidos totales</p>
                      <p className="text-sm font-bold text-foreground">{form?.total_orders || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Wizard progress indicator for new supplier */}
            {!isEditing && (
              <div className="bg-card border border-border rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">Progreso del wizard</span>
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                      {TABS_NEW?.[currentTabIndex]?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground hidden sm:block">Paso {currentTabIndex + 1} de {TABS_NEW?.length}</span>
                    <span className="text-sm font-bold text-primary">{Math.round(((currentTabIndex + 1) / TABS_NEW?.length) * 100)}%</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-4">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(((currentTabIndex + 1) / TABS_NEW?.length) * 100)}%` }}
                  />
                </div>
                {/* Step indicators with icons, connectors and labels */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {TABS_NEW?.map((tab, idx) => {
                    const isActive = activeTab === tab?.id;
                    const isPast = idx < currentTabIndex;
                    return (
                      <React.Fragment key={tab?.id}>
                        <button
                          type="button"
                          onClick={() => setActiveTab(tab?.id)}
                          title={tab?.label}
                          className={`flex flex-col items-center gap-1 min-w-[72px] p-2 rounded-xl transition-all ${
                            isActive
                              ? 'bg-primary/10 text-primary'
                              : isPast
                              ? 'text-green-600 hover:bg-green-50 cursor-pointer' :'text-muted-foreground hover:bg-muted cursor-pointer'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                            isActive
                              ? 'bg-primary text-white shadow-sm'
                              : isPast
                              ? 'bg-green-500 text-white' :'bg-muted'
                          }`}>
                            {isPast ? (
                              <Icon name="Check" size={14} className="text-white" />
                            ) : (
                              <Icon name={tab?.icon} size={14} className={isActive ? 'text-white' : 'text-muted-foreground'} />
                            )}
                          </div>
                          <span className="text-xs font-medium text-center leading-tight whitespace-nowrap">{tab?.label?.split(' ')?.[0]}</span>
                        </button>
                        {idx < TABS_NEW?.length - 1 && (
                          <div className={`flex-1 h-0.5 min-w-[8px] rounded-full transition-colors ${
                            isPast ? 'bg-green-400' : 'bg-border'
                          }`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
                {!form?.name?.trim() && (
                  <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
                    <Icon name="AlertCircle" size={12} />
                    Completa el <strong>Nombre del proveedor</strong> para poder guardar
                  </p>
                )}
              </div>
            )}

            {/* Tabs */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {/* Tab bar — shown only in edit mode */}
              {isEditing && (
                <div className="border-b border-border overflow-x-auto">
                  <div className="flex min-w-max">
                    {TABS?.map(tab => (
                      <button
                        key={tab?.id}
                        onClick={() => setActiveTab(tab?.id)}
                        className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === tab?.id
                            ? 'border-primary text-primary bg-primary/5' :'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                        }`}
                      >
                        <Icon name={tab?.icon} size={15} />
                        {tab?.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab content */}
              <div className="p-6">

                {/* TAB: Información General */}
                {activeTab === 'general' && (
                  <div className="space-y-5">
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <Icon name="Building2" size={16} className="text-primary" />
                      Información General del Proveedor
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Nombre del proveedor */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          Nombre del proveedor <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form?.name}
                          onChange={e => handleChange('name', e?.target?.value)}
                          placeholder="Nombre comercial del proveedor"
                          className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                            fieldErrors?.name ? 'border-red-400 focus:ring-red-200' : 'border-border'
                          }`}
                        />
                        {fieldErrors?.name && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <Icon name="AlertCircle" size={12} />
                            {fieldErrors?.name}
                          </p>
                        )}
                      </div>

                      {/* Contacto principal */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Contacto principal</label>
                        <input
                          type="text"
                          value={form?.contact_name}
                          onChange={e => handleChange('contact_name', e?.target?.value)}
                          placeholder="Nombre del contacto"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                        <input
                          type="email"
                          value={form?.email}
                          onChange={e => handleChange('email', e?.target?.value)}
                          placeholder="contacto@proveedor.com"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      {/* Teléfono */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Teléfono</label>
                        <input
                          type="text"
                          value={form?.phone}
                          onChange={e => handleChange('phone', e?.target?.value)}
                          placeholder="+52 55 1234 5678"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      {/* Razón social */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Razón social</label>
                        <input
                          type="text"
                          value={form?.business_name}
                          onChange={e => handleChange('business_name', e?.target?.value)}
                          placeholder="Razón social del proveedor"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      {/* Sitio web */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Sitio web</label>
                        <input
                          type="url"
                          value={form?.website}
                          onChange={e => handleChange('website', e?.target?.value)}
                          placeholder="https://proveedor.com"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      {/* Categoría */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Categoría</label>
                        <select
                          value={form?.category_id}
                          onChange={e => {
                            const cat = categories?.find(c => c?.id === e?.target?.value);
                            handleChange('category_id', e?.target?.value);
                            handleChange('category', cat?.name || '');
                          }}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="">Sin categoría</option>
                          {categories?.map(c => (
                            <option key={c?.id} value={c?.id}>{c?.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Notas internas */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Notas internas</label>
                      <textarea
                        value={form?.notes}
                        onChange={e => handleChange('notes', e?.target?.value)}
                        rows={3}
                        placeholder="Condiciones especiales, observaciones..."
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    {/* Navigation buttons for new supplier wizard */}
                    {!isEditing && (
                      <div className="flex justify-between pt-4 border-t border-border">
                        <div />
                        <Button
                          variant="default"
                          onClick={() => {
                            const errors = validateRequiredFields();
                            if (errors?.name) {
                              setFieldErrors(errors);
                              return;
                            }
                            setActiveTab('domicilio');
                          }}
                          iconName="ChevronRight"
                          iconPosition="right"
                        >
                          Siguiente
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: Domicilio */}
                {activeTab === 'domicilio' && (
                  <div className="space-y-6">
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <Icon name="MapPin" size={16} className="text-primary" />
                      Domicilio del Proveedor
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      <div className="lg:col-span-3">
                        <label className="block text-sm font-medium text-foreground mb-1.5">Calle</label>
                        <input
                          type="text"
                          value={form?.street}
                          onChange={e => handleChange('street', e?.target?.value)}
                          placeholder="Nombre de la calle"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Número exterior</label>
                        <input
                          type="text"
                          value={form?.ext_number}
                          onChange={e => handleChange('ext_number', e?.target?.value)}
                          placeholder="123"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Número interior</label>
                        <input
                          type="text"
                          value={form?.int_number}
                          onChange={e => handleChange('int_number', e?.target?.value)}
                          placeholder="A, 2B, etc."
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Colonia</label>
                        <input
                          type="text"
                          value={form?.neighborhood}
                          onChange={e => handleChange('neighborhood', e?.target?.value)}
                          placeholder="Nombre de la colonia"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Código postal</label>
                        <input
                          type="text"
                          value={form?.postal_code}
                          onChange={e => handleChange('postal_code', e?.target?.value)}
                          placeholder="06600"
                          maxLength={5}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Ciudad / Municipio</label>
                        <input
                          type="text"
                          value={form?.city}
                          onChange={e => handleChange('city', e?.target?.value)}
                          placeholder="Ciudad de México"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Estado</label>
                        <input
                          type="text"
                          value={form?.state}
                          onChange={e => handleChange('state', e?.target?.value)}
                          placeholder="CDMX"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">País</label>
                        <input
                          type="text"
                          value={form?.country}
                          onChange={e => handleChange('country', e?.target?.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    {/* Wizard navigation */}
                    {!isEditing && (
                      <div className="flex justify-between pt-4 border-t border-border">
                        <Button variant="outline" onClick={() => setActiveTab('general')} iconName="ChevronLeft" iconPosition="left">
                          Anterior
                        </Button>
                        <Button variant="default" onClick={() => setActiveTab('fiscal')} iconName="ChevronRight" iconPosition="right">
                          Siguiente
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: Datos Fiscales */}
                {activeTab === 'fiscal' && (
                  <div className="space-y-6">
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <Icon name="FileText" size={16} className="text-primary" />
                      Datos Fiscales y Bancarios
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">RFC</label>
                        <input
                          type="text"
                          value={form?.rfc}
                          onChange={e => handleChange('rfc', e?.target?.value?.toUpperCase())}
                          placeholder="ABC123456789"
                          maxLength={13}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-1.5">Régimen fiscal</label>
                        <select
                          value={form?.tax_regime}
                          onChange={e => handleChange('tax_regime', e?.target?.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="">Seleccionar régimen</option>
                          {TAX_REGIMES?.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Términos de pago</label>
                        <select
                          value={form?.payment_terms}
                          onChange={e => handleChange('payment_terms', e?.target?.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          {PAYMENT_TERMS?.map(pt => (
                            <option key={pt?.value} value={pt?.value}>{pt?.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Días de entrega promedio</label>
                        <input
                          type="number"
                          value={form?.delivery_days}
                          onChange={e => handleChange('delivery_days', e?.target?.value)}
                          placeholder="3"
                          min="0"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Moneda</label>
                        <select
                          value={form?.currency}
                          onChange={e => handleChange('currency', e?.target?.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="MXN">MXN - Peso Mexicano</option>
                          <option value="USD">USD - Dólar Americano</option>
                          <option value="EUR">EUR - Euro</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Límite de crédito</label>
                        <input
                          type="number"
                          value={form?.credit_limit}
                          onChange={e => handleChange('credit_limit', e?.target?.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Descuento (%)</label>
                        <input
                          type="number"
                          value={form?.discount_percentage}
                          onChange={e => handleChange('discount_percentage', e?.target?.value)}
                          placeholder="0"
                          min="0"
                          max="100"
                          step="0.01"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    <div className="border-t border-border pt-5">
                      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Icon name="CreditCard" size={15} className="text-primary" />
                        Datos Bancarios
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Banco</label>
                          <input
                            type="text"
                            value={form?.bank_name}
                            onChange={e => handleChange('bank_name', e?.target?.value)}
                            placeholder="BBVA, Banamex, etc."
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Número de cuenta</label>
                          <input
                            type="text"
                            value={form?.bank_account}
                            onChange={e => handleChange('bank_account', e?.target?.value)}
                            placeholder="0000000000"
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">CLABE interbancaria</label>
                          <input
                            type="text"
                            value={form?.bank_clabe}
                            onChange={e => handleChange('bank_clabe', e?.target?.value)}
                            placeholder="000000000000000000"
                            maxLength={18}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Domicilio Fiscal */}
                    <div className="border-t border-border pt-5">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Icon name="MapPin" size={15} className="text-primary" />
                          Domicilio Fiscal
                        </h4>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={sameAddressAsFiscal}
                            onChange={e => {
                              const checked = e?.target?.checked;
                              setSameAddressAsFiscal(checked);
                              if (checked) {
                                handleChange('fiscal_street', form?.street);
                                handleChange('fiscal_ext_number', form?.ext_number);
                                handleChange('fiscal_int_number', form?.int_number);
                                handleChange('fiscal_neighborhood', form?.neighborhood);
                                handleChange('fiscal_city', form?.city);
                                handleChange('fiscal_state', form?.state);
                                handleChange('fiscal_postal_code', form?.postal_code);
                                handleChange('fiscal_country', form?.country);
                              }
                            }}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                          />
                          <span className="text-sm text-muted-foreground">Mismos datos del domicilio del proveedor</span>
                        </label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div className="lg:col-span-3">
                          <label className="block text-sm font-medium text-foreground mb-1.5">Calle</label>
                          <input
                            type="text"
                            value={form?.fiscal_street}
                            onChange={e => { setSameAddressAsFiscal(false); handleChange('fiscal_street', e?.target?.value); }}
                            placeholder="Nombre de la calle"
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Número exterior</label>
                          <input
                            type="text"
                            value={form?.fiscal_ext_number}
                            onChange={e => { setSameAddressAsFiscal(false); handleChange('fiscal_ext_number', e?.target?.value); }}
                            placeholder="123"
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Número interior</label>
                          <input
                            type="text"
                            value={form?.fiscal_int_number}
                            onChange={e => { setSameAddressAsFiscal(false); handleChange('fiscal_int_number', e?.target?.value); }}
                            placeholder="A, 2B, etc."
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Colonia</label>
                          <input
                            type="text"
                            value={form?.fiscal_neighborhood}
                            onChange={e => { setSameAddressAsFiscal(false); handleChange('fiscal_neighborhood', e?.target?.value); }}
                            placeholder="Nombre de la colonia"
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Código postal</label>
                          <input
                            type="text"
                            value={form?.fiscal_postal_code}
                            onChange={e => { setSameAddressAsFiscal(false); handleChange('fiscal_postal_code', e?.target?.value); }}
                            placeholder="06600"
                            maxLength={5}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Ciudad / Municipio</label>
                          <input
                            type="text"
                            value={form?.fiscal_city}
                            onChange={e => { setSameAddressAsFiscal(false); handleChange('fiscal_city', e?.target?.value); }}
                            placeholder="Ciudad de México"
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Estado</label>
                          <input
                            type="text"
                            value={form?.fiscal_state}
                            onChange={e => { setSameAddressAsFiscal(false); handleChange('fiscal_state', e?.target?.value); }}
                            placeholder="CDMX"
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">País</label>
                          <input
                            type="text"
                            value={form?.fiscal_country}
                            onChange={e => { setSameAddressAsFiscal(false); handleChange('fiscal_country', e?.target?.value); }}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Wizard navigation */}
                    {!isEditing && (
                      <div className="flex justify-between pt-4 border-t border-border">
                        <Button variant="outline" onClick={() => setActiveTab('domicilio')} iconName="ChevronLeft" iconPosition="left">
                          Anterior
                        </Button>
                        <Button
                          variant="default"
                          onClick={handleSave}
                          disabled={isSaveDisabled}
                          iconName={isSaving ? 'Loader2' : 'Save'}
                          iconPosition="left"
                        >
                          {isSaving ? 'Guardando...' : 'Guardar Proveedor'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: Productos / Servicios — only in edit mode */}
                {activeTab === 'productos' && isEditing && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Icon name="Package" size={16} className="text-primary" />
                        Productos / Servicios Asociados
                      </h3>
                      <div className="flex items-center gap-2">
                        <Icon name="Building2" size={14} className="text-muted-foreground" />
                        <select
                          value={selectedEstablishment}
                          onChange={e => setSelectedEstablishment(e?.target?.value)}
                          className="px-3 py-1.5 border border-border rounded-lg bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="all">Todos los establecimientos</option>
                          {establishments?.map(est => (
                            <option key={est?.id} value={est?.id}>{est?.location_name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {filteredProducts?.length === 0 ? (
                      <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border">
                        <Icon name="Package" size={32} className="text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm font-medium text-foreground mb-1">Sin productos asociados</p>
                        <p className="text-xs text-muted-foreground">Los productos vinculados a este proveedor aparecerán aquí</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-muted/40 border-b border-border">
                              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Producto</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">SKU</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Stock</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Precio</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Establecimiento</th>
                              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {filteredProducts?.map(sp => {
                              const item = sp?.catalog_items;
                              const est = establishments?.find(e => e?.id === item?.business_location_id);
                              return (
                                <tr key={sp?.id} className="hover:bg-muted/20 transition-colors">
                                  <td className="px-4 py-3">
                                    <p className="text-sm font-medium text-foreground">{item?.name || sp?.product_name || '—'}</p>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="text-xs font-mono text-muted-foreground">{item?.sku || '—'}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`text-sm font-medium ${(item?.stock_quantity || 0) === 0 ? 'text-red-600' : (item?.stock_quantity || 0) < 5 ? 'text-orange-600' : 'text-green-600'}`}>
                                      {item?.stock_quantity ?? '—'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="text-sm text-foreground">{item?.price ? formatPrice(item?.price) : '—'}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="text-xs text-muted-foreground">{est?.location_name || 'General'}</span>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <button
                                      onClick={() => navigate('/inventory-management')}
                                      className="text-xs text-primary hover:underline"
                                    >
                                      Ver stock
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: Pedidos — only in edit mode */}
                {activeTab === 'pedidos' && isEditing && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Icon name="ShoppingCart" size={16} className="text-primary" />
                        Pedidos al Proveedor
                      </h3>
                      <div className="flex items-center gap-3">
                        <select
                          value={selectedEstablishment}
                          onChange={e => setSelectedEstablishment(e?.target?.value)}
                          className="px-3 py-1.5 border border-border rounded-lg bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="all">Todos los establecimientos</option>
                          {establishments?.map(est => (
                            <option key={est?.id} value={est?.id}>{est?.location_name}</option>
                          ))}
                        </select>
                        <Button
                          variant="default"
                          size="sm"
                          iconName="Plus"
                          iconPosition="left"
                          onClick={() => navigate('/purchase-orders')}
                        >
                          Nuevo Pedido
                        </Button>
                      </div>
                    </div>

                    {filteredOrders?.length === 0 ? (
                      <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border">
                        <Icon name="ShoppingCart" size={32} className="text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm font-medium text-foreground mb-1">Sin pedidos registrados</p>
                        <p className="text-xs text-muted-foreground mb-4">Los pedidos a este proveedor aparecerán aquí</p>
                        <Button variant="default" size="sm" iconName="Plus" iconPosition="left" onClick={() => navigate('/purchase-orders')}>
                          Crear Pedido
                        </Button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-muted/40 border-b border-border">
                              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Pedido</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Fecha</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Estado</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Total</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Entrega esperada</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {filteredOrders?.map(order => (
                              <tr key={order?.id} className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => navigate('/purchase-orders')}>
                                <td className="px-4 py-3">
                                  <p className="text-sm font-medium text-foreground">{order?.order_number || order?.id?.slice(0, 8)}</p>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm text-muted-foreground">{formatDate(order?.created_at)}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS?.[order?.status] || 'bg-gray-100 text-gray-600'}`}>
                                    {order?.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm font-medium text-foreground">{formatPrice(order?.total_amount || 0)}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm text-muted-foreground">{formatDate(order?.expected_delivery_date)}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: Recepciones — only in edit mode */}
                {activeTab === 'recepciones' && isEditing && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Icon name="PackageCheck" size={16} className="text-primary" />
                        Recepciones de Mercancía
                      </h3>
                      <div className="flex items-center gap-3">
                        <select
                          value={selectedEstablishment}
                          onChange={e => setSelectedEstablishment(e?.target?.value)}
                          className="px-3 py-1.5 border border-border rounded-lg bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="all">Todos los establecimientos</option>
                          {establishments?.map(est => (
                            <option key={est?.id} value={est?.id}>{est?.location_name}</option>
                          ))}
                        </select>
                        <Button variant="outline" size="sm" iconName="Plus" iconPosition="left" onClick={() => navigate('/goods-receipt')}>
                          Nueva Recepción
                        </Button>
                      </div>
                    </div>

                    {filteredReceipts?.length === 0 ? (
                      <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border">
                        <Icon name="PackageCheck" size={32} className="text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm font-medium text-foreground mb-1">Sin recepciones registradas</p>
                        <p className="text-xs text-muted-foreground">Las recepciones de mercancía de este proveedor aparecerán aquí</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredReceipts?.map(receipt => (
                          <div key={receipt?.id} className="bg-muted/20 rounded-xl border border-border p-4 hover:shadow-sm transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="text-sm font-semibold text-foreground">{receipt?.receipt_number}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(receipt?.received_date)}</p>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS?.[receipt?.status] || 'bg-gray-100 text-gray-600'}`}>
                                {receipt?.status}
                              </span>
                            </div>
                            {receipt?.goods_receipt_items?.length > 0 && (
                              <div className="space-y-1">
                                {receipt?.goods_receipt_items?.slice(0, 3)?.map((item, i) => (
                                  <div key={i} className="flex items-center justify-between text-xs">
                                    <span className="text-foreground">{item?.product_name}</span>
                                    <span className="text-muted-foreground">x{item?.quantity_received}</span>
                                  </div>
                                ))}
                                {receipt?.goods_receipt_items?.length > 3 && (
                                  <p className="text-xs text-muted-foreground">+{receipt?.goods_receipt_items?.length - 3} más</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: Pagos — only in edit mode */}
                {activeTab === 'pagos' && isEditing && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Icon name="CreditCard" size={16} className="text-primary" />
                        Gestión de Pagos
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon name="AlertCircle" size={14} className="text-amber-500" />
                        <span>{pendingPaymentOrders?.length} pedido(s) pendiente(s) de pago</span>
                      </div>
                    </div>

                    {/* Summary cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <p className="text-xs text-amber-600 font-medium mb-1">Pendiente de pago</p>
                        <p className="text-xl font-bold text-amber-700">
                          {formatPrice(pendingPaymentOrders?.reduce((sum, o) => sum + (o?.total_amount || 0) - (o?.paid_amount || 0), 0))}
                        </p>
                        <p className="text-xs text-amber-600 mt-1">{pendingPaymentOrders?.length} pedido(s)</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <p className="text-xs text-green-600 font-medium mb-1">Total pagado</p>
                        <p className="text-xl font-bold text-green-700">
                          {formatPrice(purchaseOrders?.filter(o => o?.payment_status === 'paid')?.reduce((sum, o) => sum + (o?.paid_amount || o?.total_amount || 0), 0))}
                        </p>
                        <p className="text-xs text-green-600 mt-1">{purchaseOrders?.filter(o => o?.payment_status === 'paid')?.length} pedido(s)</p>
                      </div>
                      <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-xs text-muted-foreground font-medium mb-1">Total de pedidos</p>
                        <p className="text-xl font-bold text-foreground">
                          {formatPrice(purchaseOrders?.reduce((sum, o) => sum + (o?.total_amount || 0), 0))}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{purchaseOrders?.length} pedido(s)</p>
                      </div>
                    </div>

                    {/* Pending payment orders list */}
                    {pendingPaymentOrders?.length === 0 ? (
                      <div className="text-center py-12 bg-green-50 rounded-xl border border-green-200">
                        <Icon name="CheckCircle" size={32} className="text-green-500 mx-auto mb-3" />
                        <p className="text-sm font-medium text-green-700">¡Todo al día!</p>
                        <p className="text-xs text-green-600">No hay pedidos pendientes de pago</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingPaymentOrders?.map(order => (
                          <div key={order?.id} className="bg-card border border-border rounded-xl overflow-hidden">
                            <div className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-semibold text-foreground">
                                      {order?.order_number || `Pedido #${order?.id?.slice(0, 8)}`}
                                    </p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PAYMENT_STATUS_COLORS?.[order?.payment_status || 'pending']}`}>
                                      {order?.payment_status === 'partial' ? 'Pago parcial' : order?.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS?.[order?.status] || 'bg-gray-100 text-gray-600'}`}>
                                      {order?.status}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Icon name="Calendar" size={11} />
                                      {formatDate(order?.created_at)}
                                    </span>
                                    {order?.expected_delivery_date && (
                                      <span className="flex items-center gap-1">
                                        <Icon name="Truck" size={11} />
                                        Entrega: {formatDate(order?.expected_delivery_date)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-xs text-muted-foreground">Total</p>
                                  <p className="text-base font-bold text-foreground">{formatPrice(order?.total_amount || 0)}</p>
                                  {order?.paid_amount > 0 && (
                                    <p className="text-xs text-green-600">Pagado: {formatPrice(order?.paid_amount)}</p>
                                  )}
                                  <p className="text-xs text-amber-600 font-medium">
                                    Pendiente: {formatPrice((order?.total_amount || 0) - (order?.paid_amount || 0))}
                                  </p>
                                </div>
                              </div>

                              {/* Payment form inline */}
                              {payingOrderId === order?.id ? (
                                <div className="mt-4 pt-4 border-t border-border bg-muted/20 rounded-lg p-4 space-y-3">
                                  <p className="text-sm font-medium text-foreground">Registrar pago</p>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                      <label className="block text-xs text-muted-foreground mb-1">Monto a pagar <span className="text-red-500">*</span></label>
                                      <input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={e => setPaymentAmount(e?.target?.value)}
                                        placeholder={`Máx. ${formatPrice((order?.total_amount || 0) - (order?.paid_amount || 0))}`}
                                        min="0.01"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-muted-foreground mb-1">Método de pago</label>
                                      <select
                                        value={paymentMethod}
                                        onChange={e => setPaymentMethod(e?.target?.value)}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                      >
                                        <option value="transfer">Transferencia bancaria</option>
                                        <option value="cash">Efectivo</option>
                                        <option value="check">Cheque</option>
                                        <option value="card">Tarjeta</option>
                                        <option value="other">Otro</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs text-muted-foreground mb-1">Referencia / Nota</label>
                                      <input
                                        type="text"
                                        value={paymentNote}
                                        onChange={e => setPaymentNote(e?.target?.value)}
                                        placeholder="Número de referencia..."
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 justify-end">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => { setPayingOrderId(null); setPaymentAmount(''); setPaymentNote(''); }}
                                    >
                                      Cancelar
                                    </Button>
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => handleProcessPayment(order)}
                                      disabled={isProcessingPayment || !paymentAmount}
                                      iconName={isProcessingPayment ? 'Loader2' : 'CheckCircle'}
                                      iconPosition="left"
                                    >
                                      {isProcessingPayment ? 'Procesando...' : 'Confirmar pago'}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-3 flex justify-end">
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => {
                                      setPayingOrderId(order?.id);
                                      setPaymentAmount(String((order?.total_amount || 0) - (order?.paid_amount || 0)));
                                    }}
                                    iconName="CreditCard"
                                    iconPosition="left"
                                  >
                                    Registrar pago
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* All orders payment history */}
                    {purchaseOrders?.filter(o => o?.payment_status === 'paid')?.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Icon name="History" size={14} className="text-muted-foreground" />
                          Historial de pagos
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-muted/40 border-b border-border">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Pedido</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Fecha pago</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Monto</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Estado</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {purchaseOrders?.filter(o => o?.payment_status === 'paid')?.map(order => (
                                <tr key={order?.id} className="hover:bg-muted/20 transition-colors">
                                  <td className="px-4 py-3">
                                    <p className="text-sm font-medium text-foreground">{order?.order_number || order?.id?.slice(0, 8)}</p>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="text-sm text-muted-foreground">{formatDate(order?.payment_date)}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="text-sm font-medium text-foreground">{formatPrice(order?.paid_amount || order?.total_amount || 0)}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">Pagado</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: Notas — only in edit mode */}
                {activeTab === 'notas' && isEditing && (
                  <div className="space-y-5">
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <Icon name="StickyNote" size={16} className="text-primary" />
                      Notas del Proveedor
                    </h3>

                    {/* Add note */}
                    <div className="bg-muted/20 rounded-xl border border-border p-4">
                      <label className="block text-sm font-medium text-foreground mb-2">Nueva nota</label>
                      <textarea
                        value={newNote}
                        onChange={e => setNewNote(e?.target?.value)}
                        rows={3}
                        placeholder="Escribe una nota sobre este proveedor..."
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 mb-3"
                      />
                      <div className="flex justify-end">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleAddNote}
                          disabled={!newNote?.trim() || isSavingNote}
                          iconName={isSavingNote ? 'Loader2' : 'Plus'}
                          iconPosition="left"
                        >
                          {isSavingNote ? 'Guardando...' : 'Agregar nota'}
                        </Button>
                      </div>
                    </div>

                    {/* Notes list */}
                    {notes?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No hay notas aún. Agrega la primera nota arriba.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {notes?.map(note => (
                          <div key={note?.id} className="bg-card border border-border rounded-xl p-4">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm text-foreground flex-1 whitespace-pre-wrap">{note?.content}</p>
                              <button
                                onClick={() => handleDeleteNote(note?.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors flex-shrink-0"
                                title="Eliminar nota"
                              >
                                <Icon name="Trash2" size={14} />
                              </button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDate(note?.created_at)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Wizard navigation buttons — only for new supplier */}
                {!isEditing && (
                  <div className="flex items-center justify-between mt-8 pt-5 border-t border-border">
                    <button
                      type="button"
                      onClick={() => canGoPrev && setActiveTab(TABS_NEW?.[currentTabIndex - 1]?.id)}
                      disabled={!canGoPrev}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${canGoPrev ? 'text-foreground hover:bg-muted' : 'text-muted-foreground cursor-not-allowed opacity-40'}`}
                    >
                      <Icon name="ChevronLeft" size={16} />
                      Anterior
                    </button>

                    {/* Dot progress indicator */}
                    <div className="flex items-center gap-1">
                      {TABS_NEW?.map((tab, idx) => {
                        const isActive = activeTab === tab?.id;
                        const isPast = currentTabIndex > idx;
                        return (
                          <button
                            key={tab?.id}
                            type="button"
                            onClick={() => setActiveTab(tab?.id)}
                            title={tab?.label}
                            className={`rounded-full transition-all ${isActive ? 'w-6 h-2 bg-primary' : isPast ? 'w-2 h-2 bg-green-500' : 'w-2 h-2 bg-muted hover:bg-muted-foreground'}`}
                          />
                        );
                      })}
                    </div>

                    {canGoNext ? (
                      <button
                        type="button"
                        onClick={() => setActiveTab(TABS_NEW?.[currentTabIndex + 1]?.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-all"
                      >
                        Siguiente
                        <Icon name="ChevronRight" size={16} />
                      </button>
                    ) : (
                      <Button
                        variant="default"
                        onClick={handleSave}
                        disabled={isSaveDisabled}
                        iconName={isSaving ? 'Loader2' : 'Save'}
                        iconPosition="left"
                      >
                        {isSaving ? 'Guardando...' : 'Guardar Proveedor'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom save bar */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => navigate('/suppliers')}>Cancelar</Button>
              <Button
                variant="default"
                onClick={handleSave}
                disabled={isSaveDisabled}
                iconName={isSaving ? 'Loader2' : 'Save'}
                iconPosition="left"
                title={!form?.name?.trim() ? 'Completa los campos obligatorios para guardar' : ''}
              >
                {isSaving ? 'Guardando...' : 'Guardar Proveedor'}
              </Button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default SupplierFullForm;
