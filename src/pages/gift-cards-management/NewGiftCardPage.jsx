import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useCurrency } from '../../contexts/CurrencyContext';
import { supabase } from '../../lib/supabase';
import GiftCardConfigForm from './components/GiftCardConfigForm';
import GiftCardWalletPreview from './components/GiftCardWalletPreview';

const NewGiftCardPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { formatPrice } = useCurrency();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  const [saveError, setSaveError] = useState(null);

  const [config, setConfig] = useState({
    businessId: '',
    isActive: false,
    denominations: [100, 250, 500],
    allowCustomAmount: false,
    customAmountMin: 50,
    customAmountMax: 5000,
    selectedTemplate: 'birthday-1',
    businessMessage: '',
    validityDays: 365,
    useFixedExpiry: false,
    fixedExpiryDate: '',
    allowPartialUse: true,
    minPurchaseAmount: '',
    appliesToAllCatalog: true,
    restrictedCategories: [],
    combinableWithPromos: true,
  });

  const user = { name: 'Carlos Mendoza', email: 'carlos@promospot.mx', role: 'owner' };

  useEffect(() => {
    if (id) loadConfig(id);
  }, [id]);

  const loadConfig = async (businessId) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase?.from('gift_card_config')?.select('*')?.eq('business_id', businessId)?.single();
      if (error && error?.code !== 'PGRST116') throw error;
      if (data) {
        setConfig({
          businessId: data?.business_id,
          isActive: data?.is_active,
          denominations: data?.denominations || [100, 250, 500],
          allowCustomAmount: data?.allow_custom_amount,
          customAmountMin: data?.custom_amount_min,
          customAmountMax: data?.custom_amount_max,
          selectedTemplate: data?.selected_template || 'birthday-1',
          businessMessage: data?.business_message || '',
          validityDays: data?.validity_days || 365,
          useFixedExpiry: data?.use_fixed_expiry,
          fixedExpiryDate: data?.fixed_expiry_date || '',
          allowPartialUse: data?.allow_partial_use,
          minPurchaseAmount: data?.min_purchase_amount || '',
          appliesToAllCatalog: data?.applies_to_all_catalog,
          restrictedCategories: data?.restricted_categories || [],
          combinableWithPromos: data?.combinable_with_promos,
        });
      }
    } catch (err) {
      setSaveError(err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config?.businessId) {
      setSaveError('Debes seleccionar un negocio');
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload = {
        business_id: config?.businessId,
        is_active: config?.isActive,
        denominations: config?.denominations,
        allow_custom_amount: config?.allowCustomAmount,
        custom_amount_min: config?.customAmountMin,
        custom_amount_max: config?.customAmountMax,
        selected_template: config?.selectedTemplate,
        business_message: config?.businessMessage,
        validity_days: config?.validityDays,
        use_fixed_expiry: config?.useFixedExpiry,
        fixed_expiry_date: config?.fixedExpiryDate || null,
        allow_partial_use: config?.allowPartialUse,
        min_purchase_amount: config?.minPurchaseAmount || null,
        applies_to_all_catalog: config?.appliesToAllCatalog,
        restricted_categories: config?.restrictedCategories,
        combinable_with_promos: config?.combinableWithPromos,
        updated_at: new Date()?.toISOString(),
      };
      const { error } = await supabase?.from('gift_card_config')?.upsert(payload, { onConflict: 'business_id' });
      if (error) throw error;
      navigate('/gift-cards-management');
    } catch (err) {
      setSaveError(err?.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} userRole={user?.role}
        isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <Header user={user} onMenuClick={() => setIsSidebarOpen(true)} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto">
          {/* Top bar */}
          <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/gift-cards-management')}>
                <Icon name="ArrowLeft" size={18} />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  {id ? 'Editar Configuración de Gift Cards' : 'Nueva Configuración de Gift Cards'}
                </h1>
                <p className="text-xs text-muted-foreground">Funcionalidad #76 — Gift Cards Digitales</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Active toggle */}
              <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
                <span className="text-sm font-medium text-foreground">Gift Cards activas</span>
                <button
                  onClick={() => setConfig(p => ({ ...p, isActive: !p?.isActive }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config?.isActive ? 'bg-success' : 'bg-muted'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    config?.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                <span className={`text-xs font-medium ${config?.isActive ? 'text-success' : 'text-muted-foreground'}`}>
                  {config?.isActive ? 'Activas' : 'Inactivas'}
                </span>
              </div>
              <Button variant="outline" onClick={() => navigate('/gift-cards-management')}>Cancelar</Button>
              <Button onClick={handleSave} loading={isSaving} iconName="Save" iconPosition="left">
                Guardar configuración
              </Button>
            </div>
          </div>

          {saveError && (
            <div className="mx-6 mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {saveError}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="flex h-full">
              {/* Left: Form 60% */}
              <div className="flex-1 overflow-y-auto p-6 border-r border-border" style={{ flexBasis: '60%' }}>
                <div className="max-w-2xl">
                  <div className="mt-4">
                    <GiftCardConfigForm config={config} onChange={setConfig} />
                  </div>
                </div>
              </div>
              {/* Right: Preview 40% */}
              <div className="overflow-y-auto p-6 bg-muted/20" style={{ flexBasis: '40%' }}>
                <div className="sticky top-6">
                  <GiftCardWalletPreview config={config} formatPrice={formatPrice} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default NewGiftCardPage;
