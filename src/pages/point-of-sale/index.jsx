import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Button from '../../components/ui/Button';



import PaymentModal from './components/PaymentModal';
import ReceiptPreviewModal from './components/ReceiptPreviewModal';
import POSSidebar from './components/POSSidebar';
import POSHistoryScreen from './components/POSHistoryScreen';
import POSMetricsScreen from './components/POSMetricsScreen';
import POSFullScreen from './components/POSFullScreen';
import TerminalsTable from './components/TerminalsTable';
import OpenCashRegisterModal from './components/OpenCashRegisterModal';
import CloseCashRegisterModal from './components/CloseCashRegisterModal';
import CashWithdrawalsSection from './components/CashWithdrawalsSection';
import PDVDashboard from './components/PDVDashboard';
import { supabase } from '../../lib/supabase';
import Icon from '../../components/AppIcon';

const PointOfSale = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('pos');
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [cart, setCart] = useState([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [cashRegisterSession, setCashRegisterSession] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState(null);

  // Auth
  const [authUser, setAuthUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Establishments
  const [establishments, setEstablishments] = useState([]);
  const [selectedEstablishment, setSelectedEstablishment] = useState('all');

  // Terminals
  const [selectedTerminal, setSelectedTerminal] = useState(null);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showPOSFullScreen, setShowPOSFullScreen] = useState(false);
  const [activeSession, setActiveSession] = useState(null);

  // POS sub-view (within 'pos' view)
  const [posSubView, setPosSubView] = useState('terminals'); // 'terminals' | 'withdrawals'

  const user = {
    id: authUser?.id,
    name: userProfile?.full_name || authUser?.email || 'Usuario',
    email: authUser?.email,
    role: 'owner',
  };

  // Load auth user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user: au } } = await supabase?.auth?.getUser();
        if (!au) return;
        setAuthUser(au);
        const { data: profile } = await supabase?.from('user_profiles')?.select('id, full_name, email')?.eq('id', au?.id)?.maybeSingle();
        if (profile) setUserProfile(profile);
      } catch (err) {
        console.error('Error loading user:', err);
      }
    };
    loadUser();
  }, []);

  // Load establishments
  useEffect(() => {
    const loadEstablishments = async () => {
      if (!authUser) return;
      try {
        const { data, error } = await supabase?.from('business_locations')?.select('id, name, address')?.eq('user_id', authUser?.id)?.eq('is_active', true)?.order('name');
        if (!error && data) {
          setEstablishments(data);
          if (data?.length > 0) setSelectedEstablishment(data?.[0]?.id);
        }
      } catch (err) {
        console.error('Error loading establishments:', err);
      }
    };
    loadEstablishments();
  }, [authUser]);

  // Real-time subscription for POS transactions
  useEffect(() => {
    const channel = supabase?.channel('pos_transactions_changes')?.on('postgres_changes', { event: '*', schema: 'public', table: 'pos_transactions' },
        () => setRefreshTrigger(prev => prev + 1))?.subscribe();
    return () => { supabase?.removeChannel(channel); };
  }, []);

  const handleCustomerIdentified = (customer) => setCurrentCustomer(customer);

  const handleAddToCart = (item) => {
    const existingItem = cart?.find(cartItem => cartItem?.id === item?.id);
    if (existingItem) {
      setCart(cart?.map(cartItem =>
        cartItem?.id === item?.id ? { ...cartItem, quantity: cartItem?.quantity + 1 } : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const handleUpdateCartItem = (itemId, quantity) => {
    if (quantity <= 0) {
      setCart(cart?.filter(item => item?.id !== itemId));
    } else {
      setCart(cart?.map(item => item?.id === itemId ? { ...item, quantity } : item));
    }
  };

  const handleRemoveFromCart = (itemId) => setCart(cart?.filter(item => item?.id !== itemId));
  const handleClearCart = () => setCart([]);

  const handleOpenPayment = () => {
    if (cart?.length === 0) { alert('El carrito está vacío'); return; }
    if (!currentCustomer) { alert('Debe identificar al cliente primero'); return; }
    if (!activeSession || activeSession?.status !== 'open') { alert('Debe abrir la caja registradora primero'); return; }
    setIsPaymentModalOpen(true);
  };

  const handlePaymentComplete = (paymentData) => {
    const transaction = {
      transaction_number: `TXN-${Date.now()}`,
      business_id: selectedEstablishment,
      customer: currentCustomer,
      items: cart,
      subtotal: cart?.reduce((sum, item) => sum + (item?.price * item?.quantity), 0),
      tax_amount: cart?.reduce((sum, item) => sum + (item?.price * item?.quantity), 0) * 0.10,
      discount_amount: paymentData?.discountAmount || 0,
      total_amount: paymentData?.totalAmount,
      payment_method: paymentData?.paymentMethod,
      points_earned: paymentData?.pointsEarned || 0,
      points_redeemed: paymentData?.pointsRedeemed || 0,
      created_at: new Date()?.toISOString(),
      created_by: user?.name,
    };
    setCompletedTransaction(transaction);
    setCart([]);
    setCurrentCustomer(null);
    setIsPaymentModalOpen(false);
    setShowReceiptModal(true);
  };

  const handleClearCustomer = () => { setCurrentCustomer(null); setCart([]); };

  // Terminal actions
  const handleOpenTerminal = (terminal) => {
    setSelectedTerminal(terminal);
    if (terminal?.session_status === 'open') {
      // Terminal is open — show close modal or go to POS
      setActiveSession({
        id: terminal?.session_id,
        terminal_id: terminal?.terminal_id,
        status: 'open',
        opening_amount: terminal?.opening_amount || 0,
        total_sales: terminal?.total_sales || 0,
        opened_at: terminal?.opened_at,
      });
      setShowCloseModal(true);
    } else {
      setShowOpenModal(true);
    }
  };

  const handleSessionOpened = (session) => {
    setActiveSession(session);
    setCashRegisterSession({ ...session, status: 'open', openedAt: session?.opened_at });
    setShowOpenModal(false);
    setShowPOSFullScreen(true);
  };

  const handleSessionClosed = (result) => {
    setActiveSession(null);
    setCashRegisterSession(null);
    setShowCloseModal(false);
    setShowPOSFullScreen(false);
    setRefreshTrigger(prev => prev + 1);
    if (result?.cutType === 'final') {
      alert(`Corte Final del Día\n\nMonto Esperado: $${result?.expectedAmount?.toFixed(2)}\nEfectivo Contado: $${result?.closingAmount?.toFixed(2)}\nDiferencia: ${result?.difference >= 0 ? '+' : ''}$${result?.difference?.toFixed(2)}\n\nLa caja ha sido bloqueada por el resto del día.`);
    }
  };

  const handleGoToPOS = () => {
    if (!activeSession || activeSession?.status !== 'open') {
      alert('Primero debes abrir una caja para acceder al punto de venta');
      return;
    }
    setShowPOSFullScreen(true);
  };

  const viewTitles = {
    pos: { title: 'Terminales PDV', desc: 'Gestiona tus terminales y opera tu punto de venta' },
    history: { title: 'Historial de Transacciones', desc: 'Consulta el registro completo de ventas y transacciones' },
    metrics: { title: 'Métricas de Ventas', desc: 'Analiza el rendimiento de tu punto de venta' },
  };

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

        <main className={`flex-1 overflow-hidden flex flex-col pt-20 transition-all duration-500 ease-in-out ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}>
          {/* Page Header */}
          <div className="px-6 py-4 border-b border-border bg-background shrink-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{viewTitles?.[activeView]?.title}</h1>
                <p className="text-muted-foreground text-sm mt-0.5">{viewTitles?.[activeView]?.desc}</p>
              </div>
              {activeView === 'pos' && activeSession?.status === 'open' && (
                <Button
                  onClick={handleGoToPOS}
                  iconName="ShoppingCart"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                >
                  Ir al POS
                </Button>
              )}
            </div>

            {/* Establishment Selector — inventory-management style */}
            <div className="mt-4 bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Icon name="Building2" size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Establecimiento</span>
                {establishments?.length === 0 && authUser && (
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
                    {est?.name}
                  </button>
                ))}
                {establishments?.length === 0 && !authUser && (
                  <p className="text-sm text-muted-foreground">No hay establecimientos registrados</p>
                )}
              </div>
              {selectedEstablishment !== 'all' && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Icon name="Info" size={12} />
                  Mostrando terminales de: <span className="font-medium text-foreground ml-1">{establishments?.find(e => e?.id === selectedEstablishment)?.name}</span>
                </p>
              )}
            </div>
          </div>

          {/* Content Area with POS Sidebar */}
          <div className="flex-1 overflow-hidden flex">
            {/* POS Lateral Sidebar */}
            <POSSidebar
              activeView={activeView}
              onViewChange={setActiveView}
              cashRegisterSession={cashRegisterSession}
            />

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="max-w-[1600px] mx-auto space-y-6">

                {/* POS View — Terminals + Withdrawals */}
                {activeView === 'pos' && (
                  <div className="space-y-6">
                    {/* Sub-nav tabs */}
                    <div className="flex items-center gap-1 border-b border-border pb-0">
                      <button
                        onClick={() => setPosSubView('terminals')}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                          posSubView === 'terminals' ?'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon name="Monitor" size={14} />
                          Terminales
                        </span>
                      </button>
                      <button
                        onClick={() => setPosSubView('dashboard')}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                          posSubView === 'dashboard' ?'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon name="LayoutDashboard" size={14} />
                          Dashboard
                        </span>
                      </button>
                      <button
                        onClick={() => setPosSubView('withdrawals')}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                          posSubView === 'withdrawals' ?'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon name="Wallet" size={14} />
                          Retiros de Efectivo
                        </span>
                      </button>
                    </div>

                    {posSubView === 'terminals' && (
                      <TerminalsTable
                        key={refreshTrigger}
                        userId={authUser?.id || null}
                        establishments={establishments}
                        selectedEstablishment={selectedEstablishment}
                        onOpenTerminal={handleOpenTerminal}
                      />
                    )}

                    {posSubView === 'dashboard' && (
                      <PDVDashboard
                        userId={authUser?.id || null}
                        establishments={establishments}
                        selectedEstablishment={selectedEstablishment}
                        onOpenTerminal={handleOpenTerminal}
                      />
                    )}

                    {posSubView === 'withdrawals' && (
                      <CashWithdrawalsSection
                        session={activeSession}
                        userId={authUser?.id}
                        onWithdrawalAdded={() => setRefreshTrigger(prev => prev + 1)}
                      />
                    )}
                  </div>
                )}

                {/* History View */}
                {activeView === 'history' && (
                  <POSHistoryScreen
                    selectedEstablishment={selectedEstablishment}
                    establishments={establishments}
                  />
                )}

                {/* Metrics View */}
                {activeView === 'metrics' && (
                  <POSMetricsScreen
                    selectedEstablishment={selectedEstablishment}
                    establishments={establishments}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* POS Full Screen Overlay */}
      {showPOSFullScreen && (
        <POSFullScreen
          businessId={selectedEstablishment !== 'all' ? selectedEstablishment : undefined}
          cart={cart}
          currentCustomer={currentCustomer}
          cashRegisterSession={activeSession}
          onAddToCart={handleAddToCart}
          onUpdateCartItem={handleUpdateCartItem}
          onRemoveFromCart={handleRemoveFromCart}
          onClearCart={handleClearCart}
          onCheckout={handleOpenPayment}
          onCustomerIdentified={handleCustomerIdentified}
          onClearCustomer={handleClearCustomer}
          onBack={() => setShowPOSFullScreen(false)}
        />
      )}
      {/* Open Cash Register Modal */}
      {showOpenModal && selectedTerminal && (
        <OpenCashRegisterModal
          terminal={selectedTerminal}
          userId={authUser?.id}
          onClose={() => setShowOpenModal(false)}
          onOpened={handleSessionOpened}
        />
      )}
      {/* Close Cash Register Modal */}
      {showCloseModal && selectedTerminal && activeSession && (
        <CloseCashRegisterModal
          terminal={selectedTerminal}
          session={activeSession}
          userId={authUser?.id}
          onClose={() => setShowCloseModal(false)}
          onClosed={handleSessionClosed}
        />
      )}
      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <PaymentModal
          cart={cart}
          customer={currentCustomer}
          onClose={() => setIsPaymentModalOpen(false)}
          onComplete={handlePaymentComplete}
        />
      )}
      {/* Receipt Preview Modal */}
      {showReceiptModal && completedTransaction && (
        <ReceiptPreviewModal
          transaction={completedTransaction}
          onClose={() => { setShowReceiptModal(false); setCompletedTransaction(null); }}
          onPrint={() => { console.log('Receipt printed'); }}
        />
      )}
    </div>
  );
};

export default PointOfSale;