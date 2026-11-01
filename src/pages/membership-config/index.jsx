import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import MembershipGeneralConfig from './components/MembershipGeneralConfig';
import MembershipPricingConfig from './components/MembershipPricingConfig';
import MembershipBenefitsBuilder from './components/MembershipBenefitsBuilder';
import MembershipCommunicationConfig from './components/MembershipCommunicationConfig';
import MembershipPreview from './components/MembershipPreview';
import { supabase } from '../../lib/supabase';

const user = {
  name: 'Carlos Mendoza',
  email: 'carlos@promospot.com',
  role: 'owner',
};

const MembershipConfig = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [toast, setToast] = useState(null);

  const [program, setProgram] = useState(null);
  const [generalData, setGeneralData] = useState({
    name: 'Club Café Premium',
    description: 'Todo lo que necesitas para tu café diario por una cuota fija mensual.',
    accentColor: '#3B82F6',
    hasMaxSubscribers: false,
    maxSubscribers: null,
  });
  const [pricingData, setPricingData] = useState({
    monthlyPrice: '299',
    hasAnnualPlan: true,
    annualPrice: '2988',
    hasTrial: true,
    trialDays: 7,
    cancellationPolicy: 'end_of_period',
  });
  const [benefits, setBenefits] = useState([
    { type: 'quantity_included', model: 'daily_limit', itemName: 'Café Americano', quantity: 1, limitAction: 'special_price', specialPrice: '35' },
    { type: 'discount_percent', discountPercent: 20, appliesTo: 0, stackable: false },
    { type: 'points_multiplier', multiplier: 2, multiplierAppliesTo: 0 },
  ]);
  const [messagesData, setMessagesData] = useState({});

  useEffect(() => {
    fetchProgram();
  }, []);

  const fetchProgram = async () => {
    try {
      const { data: { user: authUser } } = await supabase?.auth?.getUser();
      if (!authUser) { setLoading(false); return; }

      const { data, error } = await supabase?.from('membership_programs')?.select('*, membership_benefits(*), membership_messages(*)')?.eq('business_id', authUser?.id)?.single();

      if (data && !error) {
        setProgram(data);
        setGeneralData({
          name: data?.name,
          description: data?.description || '',
          accentColor: data?.accent_color || '#3B82F6',
          coverImage: data?.cover_image,
          hasMaxSubscribers: !!data?.max_subscribers,
          maxSubscribers: data?.max_subscribers,
        });
        setPricingData({
          monthlyPrice: data?.monthly_price?.toString() || '',
          hasAnnualPlan: !!data?.annual_price,
          annualPrice: data?.annual_price?.toString() || '',
          hasTrial: data?.trial_days > 0,
          trialDays: data?.trial_days || 7,
          cancellationPolicy: data?.cancellation_policy || 'end_of_period',
        });
        if (data?.membership_benefits?.length > 0) {
          setBenefits(data?.membership_benefits?.map(b => ({
            type: b?.benefit_type,
            model: b?.model,
            itemName: b?.item_name,
            quantity: b?.quantity,
            discountPercent: b?.discount_percent,
            multiplier: b?.multiplier,
            ...b?.config,
          })));
        }
      }
    } catch (err) {
      console.error('Error fetching program:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const { data: { user: authUser } } = await supabase?.auth?.getUser();
      if (!authUser) return;

      const payload = {
        business_id: authUser?.id,
        name: generalData?.name,
        description: generalData?.description,
        accent_color: generalData?.accentColor,
        monthly_price: parseFloat(pricingData?.monthlyPrice) || null,
        annual_price: pricingData?.hasAnnualPlan ? parseFloat(pricingData?.annualPrice) || null : null,
        trial_days: pricingData?.hasTrial ? pricingData?.trialDays : 0,
        cancellation_policy: pricingData?.cancellationPolicy,
        max_subscribers: generalData?.hasMaxSubscribers ? generalData?.maxSubscribers : null,
        status: 'draft',
      };

      let progId;
      if (program?.id) {
        const { error } = await supabase?.from('membership_programs')?.update(payload)?.eq('id', program?.id);
        if (error) throw error;
        progId = program?.id;
      } else {
        const { data, error } = await supabase?.from('membership_programs')?.insert(payload)?.select()?.single();
        if (error) throw error;
        setProgram(data);
        progId = data?.id;
      }

      showToast('Borrador guardado correctamente');
    } catch (err) {
      showToast('Error al guardar: ' + err?.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (program?.status === 'active') {
      setShowPauseModal(true);
    } else {
      try {
        const { error } = await supabase?.from('membership_programs')?.update({ status: 'active' })?.eq('id', program?.id);
        if (!error) {
          setProgram({ ...program, status: 'active' });
          showToast('Membresía activada');
        }
      } catch (err) {
        showToast('Error: ' + err?.message, 'error');
      }
    }
  };

  const handlePauseConfirm = async () => {
    try {
      const { error } = await supabase?.from('membership_programs')?.update({ status: 'paused' })?.eq('id', program?.id);
      if (!error) {
        setProgram({ ...program, status: 'paused' });
        setShowPauseModal(false);
        showToast('Membresía pausada');
      }
    } catch (err) {
      showToast('Error: ' + err?.message, 'error');
    }
  };

  const TABS = [
    { id: 'info', label: 'Información', icon: 'FileText' },
    { id: 'pricing', label: 'Precio', icon: 'DollarSign' },
    { id: 'benefits', label: 'Beneficios', icon: 'Gift' },
    { id: 'messages', label: 'Mensajes', icon: 'MessageCircle' },
  ];

  const statusConfig = {
    active: { label: 'Activa', color: 'bg-emerald-100 text-emerald-700' },
    draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-600' },
    paused: { label: 'Pausada', color: 'bg-amber-100 text-amber-700' },
  };

  const currentStatus = program?.status || 'draft';
  const statusInfo = statusConfig?.[currentStatus] || statusConfig?.draft;

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
        className={`pt-16 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}
      >
        <div className="p-6">

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>Mi Membresía</h1>
                {program && (
                  <>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusInfo?.color}`}>
                      {statusInfo?.label}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-semibold">
                      {program?.active_subscribers || 47} suscriptores activos
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Configura tu programa de membresía y beneficios exclusivos</p>
            </div>

            {program && (
              <div className={`flex items-center gap-4 px-5 py-3 rounded-2xl border-2 ${
                currentStatus === 'active' ? 'bg-emerald-50 border-emerald-200' : 'bg-muted/30 border-border'
              }`}>
                <div>
                  <p className="text-sm font-semibold text-foreground">Membresía</p>
                  <p className={`text-xs font-medium ${currentStatus === 'active' ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                    {currentStatus === 'active' ? '● ACTIVA' : currentStatus === 'paused' ? '⏸ PAUSADA' : '○ BORRADOR'}
                  </p>
                </div>
                <button
                  onClick={handleToggleStatus}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    currentStatus === 'active' ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                    currentStatus === 'active' ? 'left-[26px]' : 'left-[2px]'
                  }`} />
                </button>
              </div>
            )}
          </div>

          {/* No membership CTA */}
          {!loading && !program && (
            <div className="bg-card border border-border rounded-2xl p-10 text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon name="Crown" size={32} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Crea tu programa de membresía</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                Cobra una cuota mensual o anual y ofrece beneficios exclusivos a tus clientes más fieles.
              </p>
              <button
                onClick={() => setProgram({ status: 'draft', active_subscribers: 0 })}
                className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Crear mi membresía
              </button>
            </div>
          )}

          {/* Tabs */}
          {(program || loading) && (
            <>
              <div className="border-b border-border mb-6">
                <nav className="flex space-x-1 overflow-x-auto">
                  {TABS?.map(tab => (
                    <button
                      key={tab?.id}
                      onClick={() => setActiveTab(tab?.id)}
                      className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                        activeTab === tab?.id
                          ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                      }`}
                    >
                      <Icon name={tab?.icon} size={16} />
                      {tab?.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-12">
                <div className="xl:col-span-2 space-y-6">
                  {activeTab === 'info' && (
                    <MembershipGeneralConfig data={generalData} onChange={setGeneralData} />
                  )}
                  {activeTab === 'pricing' && (
                    <MembershipPricingConfig data={pricingData} onChange={setPricingData} />
                  )}
                  {activeTab === 'benefits' && (
                    <MembershipBenefitsBuilder
                      benefits={benefits}
                      onAdd={b => setBenefits([...benefits, b])}
                      onRemove={idx => setBenefits(benefits?.filter((_, i) => i !== idx))}
                    />
                  )}
                  {activeTab === 'messages' && (
                    <MembershipCommunicationConfig data={messagesData} onChange={setMessagesData} />
                  )}

                  {/* Footer */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveDraft}
                      disabled={saving}
                      className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Guardando...' : 'Guardar borrador'}
                    </button>
                    <button
                      onClick={() => setShowActivateModal(true)}
                      className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Activar membresía
                    </button>
                  </div>
                </div>

                <div className="xl:col-span-1">
                  <MembershipPreview data={generalData} benefits={benefits} />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      {/* Pause Modal */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Icon name="PauseCircle" size={24} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">¿Pausar membresía?</h3>
                <p className="text-sm text-muted-foreground">No se aceptarán nuevas suscripciones</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Los suscriptores actuales mantienen su acceso hasta el fin de su período vigente.
              No se aceptarán nuevas suscripciones mientras la membresía esté pausada.
            </p>
            <div className="flex gap-3">
              <button onClick={handlePauseConfirm} className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl font-medium text-sm hover:bg-amber-600 transition-colors">
                Sí, pausar
              </button>
              <button onClick={() => setShowPauseModal(false)} className="flex-1 py-2.5 border border-border rounded-xl font-medium text-sm hover:bg-muted/50 transition-colors text-foreground">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Activate Modal */}
      {showActivateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Activar membresía</h3>
              <button onClick={() => setShowActivateModal(false)} className="p-1.5 hover:bg-muted rounded-lg">
                <Icon name="X" size={18} />
              </button>
            </div>
            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-2 text-sm">
                <Icon name="CheckCircle" size={16} className={benefits?.length > 0 ? 'text-emerald-500' : 'text-muted-foreground'} />
                <span className={benefits?.length > 0 ? 'text-foreground' : 'text-muted-foreground'}>
                  {benefits?.length > 0 ? `${benefits?.length} beneficio(s) configurado(s)` : 'Al menos 1 beneficio requerido'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Icon name="CheckCircle" size={16} className={pricingData?.monthlyPrice ? 'text-emerald-500' : 'text-muted-foreground'} />
                <span className={pricingData?.monthlyPrice ? 'text-foreground' : 'text-muted-foreground'}>
                  {pricingData?.monthlyPrice ? `Precio mensual: $${pricingData?.monthlyPrice} MXN` : 'Precio mensual requerido'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Icon name="AlertCircle" size={16} className="text-amber-500" />
                <span className="text-foreground">Stripe Connect: <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Requiere Stripe</span></span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  await handleSaveDraft();
                  setShowActivateModal(false);
                  showToast('Membresía activada correctamente');
                }}
                disabled={benefits?.length === 0 || !pricingData?.monthlyPrice}
                className="flex-1 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar y activar
              </button>
              <button onClick={() => setShowActivateModal(false)} className="px-4 py-2.5 border border-border rounded-xl text-sm hover:bg-muted/50 transition-colors text-foreground">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast?.type === 'error' ? 'bg-destructive text-white' : 'bg-emerald-600 text-white'
        }`}>
          <Icon name={toast?.type === 'error' ? 'AlertCircle' : 'CheckCircle'} size={16} />
          {toast?.msg}
        </div>
      )}
    </div>
  );
};

export default MembershipConfig;
