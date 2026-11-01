import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import MembershipConfigHeader from './components/MembershipConfigHeader';
import MembershipGeneralConfig from './components/MembershipGeneralConfig';
import MembershipPricingConfig from './components/MembershipPricingConfig';
import MembershipBenefitsBuilder from './components/MembershipBenefitsBuilder';
import MembershipCommunicationConfig from './components/MembershipCommunicationConfig';
import MembershipPreviewPanel from './components/MembershipPreviewPanel';
import { supabase } from '../../lib/supabase';

const INITIAL_PROGRAM = {
  name: '',
  description: '',
  cover_image: '',
  accent_color: '#6366F1',
  monthly_price: '',
  annual_price: '',
  trial_days: 7,
  cancellation_policy: 'end_of_period',
  status: 'draft',
  max_subscribers: null,
  offer_annual_plan: false,
  offer_trial: false,
  savings_text: '¡Ahorra $600 al año!',
};

const MembershipConfiguration = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [program, setProgram] = useState(null);
  const [benefits, setBenefits] = useState([]);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const user = { name: 'Carlos Mendoza', email: 'carlos@promospot.com', role: 'owner' };

  useEffect(() => {
    loadProgram();
  }, []);

  const loadProgram = async () => {
    try {
      setLoading(true);
      const { data: programs } = await supabase?.from('membership_programs')?.select('*')?.limit(1);

      if (programs && programs?.length > 0) {
        const prog = programs?.[0];
        setProgram(prog);

        const { data: bens } = await supabase?.from('membership_benefits')?.select('*')?.eq('program_id', prog?.id)?.order('sort_order');
        setBenefits(bens || []);

        const { data: msgs } = await supabase?.from('membership_messages')?.select('*')?.eq('program_id', prog?.id);
        const msgMap = {};
        (msgs || [])?.forEach(m => { msgMap[m.trigger_type] = m; });
        setMessages(msgMap);
      } else {
        setIsNew(true);
        setProgram(INITIAL_PROGRAM);
      }
    } catch (err) {
      console.error('Error loading program:', err);
      setIsNew(true);
      setProgram(INITIAL_PROGRAM);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const payload = { ...program, status: 'draft', updated_at: new Date()?.toISOString() };
      if (isNew || !program?.id) {
        const { data } = await supabase?.from('membership_programs')?.insert([payload])?.select()?.single();
        if (data) { setProgram(data); setIsNew(false); }
      } else {
        await supabase?.from('membership_programs')?.update(payload)?.eq('id', program?.id);
      }
    } catch (err) {
      console.error('Error saving:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async () => {
    const errors = [];
    if (benefits?.length === 0) errors?.push('Al menos 1 beneficio configurado');
    if (!program?.monthly_price || parseFloat(program?.monthly_price) <= 0) errors?.push('Precio mensual definido');
    if (errors?.length > 0) {
      alert('Completa los siguientes campos:\n' + errors?.map(e => '• ' + e)?.join('\n'));
      return;
    }
    setShowActivateModal(true);
  };

  const handleConfirmActivate = async () => {
    setSaving(true);
    try {
      const payload = { ...program, status: 'active', updated_at: new Date()?.toISOString() };
      if (isNew || !program?.id) {
        const { data } = await supabase?.from('membership_programs')?.insert([payload])?.select()?.single();
        if (data) { setProgram(data); setIsNew(false); }
      } else {
        await supabase?.from('membership_programs')?.update(payload)?.eq('id', program?.id);
        setProgram(prev => ({ ...prev, status: 'active' }));
      }
      setShowActivateModal(false);
    } catch (err) {
      console.error('Error activating:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (newStatus) => {
    try {
      if (program?.id) {
        await supabase?.from('membership_programs')?.update({ status: newStatus })?.eq('id', program?.id);
      }
      setProgram(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleAddBenefit = (benefit) => {
    setBenefits(prev => [...prev, benefit]);
  };

  const handleRemoveBenefit = (idx) => {
    setBenefits(prev => prev?.filter((_, i) => i !== idx));
  };

  const handleToggleMessage = (trigger, enabled) => {
    setMessages(prev => ({ ...prev, [trigger]: { ...(prev?.[trigger] || {}), enabled } }));
  };

  const handleUpdateMessageText = (trigger, text) => {
    setMessages(prev => ({ ...prev, [trigger]: { ...(prev?.[trigger] || {}), custom_text: text } }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">Cargando membresía...</span>
        </div>
      </div>
    );
  }

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
      <main className={`pt-16 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <div className="p-6">
          {/* Header */}
          <MembershipConfigHeader
            program={program?.id ? program : null}
            onToggleStatus={handleToggleStatus}
            subscriberCount={47}
          />

          {/* Empty state */}
          {isNew && !program?.name && (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon name="Crown" size={32} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Crea tu programa de membresía</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                Cobra una cuota mensual o anual y ofrece beneficios exclusivos a tus clientes más fieles.
              </p>
              <button
                onClick={() => setIsNew(false)}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Crear mi membresía
              </button>
            </div>
          )}

          {/* Main content */}
          {(!isNew || program?.name !== undefined) && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left: Config */}
              <div className="xl:col-span-2 space-y-0">
                <MembershipGeneralConfig data={program} onChange={setProgram} />
                <MembershipPricingConfig data={program} onChange={setProgram} />
                <MembershipBenefitsBuilder
                  benefits={benefits}
                  onAdd={handleAddBenefit}
                  onRemove={handleRemoveBenefit}
                />
                <MembershipCommunicationConfig
                  data={program}
                  onChange={setProgram}
                  messages={messages}
                  onToggle={handleToggleMessage}
                  onUpdateText={handleUpdateMessageText}
                />

                {/* Footer actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-8">
                  <button
                    onClick={handleSaveDraft}
                    disabled={saving}
                    className="flex-1 py-3 border-2 border-border rounded-xl font-semibold text-sm text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : 'Guardar borrador'}
                  </button>
                  <button
                    onClick={handleActivate}
                    disabled={saving}
                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    Activar membresía
                  </button>
                </div>
              </div>

              {/* Right: Preview */}
              <div className="xl:col-span-1">
                <MembershipPreviewPanel program={program} benefits={benefits} />
              </div>
            </div>
          )}
        </div>
      </main>
      {/* Activate confirmation modal */}
      {showActivateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Icon name="CheckCircle" size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Activar membresía</h3>
                <p className="text-sm text-muted-foreground">Revisa el resumen antes de activar</p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Icon name="Check" size={16} className="text-emerald-500" />
                <span className="text-foreground">{benefits?.length} beneficio(s) configurado(s)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Icon name="Check" size={16} className="text-emerald-500" />
                <span className="text-foreground">Precio mensual: ${program?.monthly_price} MXN</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Icon name="AlertCircle" size={16} className="text-amber-500" />
                <span className="text-foreground">Fee PromoClub: {program?.promoclub_fee_percent || 9.5}% por cobro procesado</span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                <Icon name="Zap" size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  <strong>Conectar Stripe para activar cobros.</strong> Los cobros recurrentes requieren Stripe Connect.
                  Puedes activar la membresía ahora y conectar Stripe después.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmActivate}
                disabled={saving}
                className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Activando...' : 'Confirmar y activar'}
              </button>
              <button
                onClick={() => setShowActivateModal(false)}
                className="flex-1 py-2.5 border border-border rounded-xl font-medium text-sm hover:bg-muted/50 transition-colors text-foreground"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipConfiguration;
