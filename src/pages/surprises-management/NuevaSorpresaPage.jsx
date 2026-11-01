import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import SurpriseConfigGeneralTab from './components/SurpriseConfigGeneralTab';
import SurprisePremiosTab from './components/SurprisePremiosTab';
import SurpriseTriggersTab from './components/SurpriseTriggersTab';
import SurpriseEstablecimientoTab from './components/SurpriseEstablecimientoTab';
import SurpriseAudienciaTab from './components/SurpriseAudienciaTab';

// ─── Wizard Tabs ──────────────────────────────────────────────────────────────
const WIZARD_TABS = [
  { id: 'mecanica', label: 'Mecánica', icon: 'Gamepad2', short: '1' },
  { id: 'premios', label: 'Premios y Reglas', icon: 'Trophy', short: '2' },
  { id: 'triggers', label: 'Triggers', icon: 'Zap', short: '3' },
  { id: 'establecimiento', label: 'Establecimiento', icon: 'MapPin', short: '4' },
  { id: 'audiencia', label: 'Audiencia', icon: 'Users', short: '5' },
];

const MECHANIC_ICONS = {
  wheel: '🎡', scratch: '🎫', chest: '📦', envelope: '✉️', dice: '🎲',
  balloon: '🎈', loteria: '🃏', fishing: '🎣', gacha: '🎰', tree: '🌳', vending: '🏧',
  ruleta: '🎡', raspa: '🎟️', cofre: '📦', sobre: '✉️', caja: '🎁',
};
const MECHANIC_LABELS = {
  wheel: 'Ruleta', scratch: 'Raspa y Gana', chest: 'Cofre Misterioso', envelope: 'Sobre Sorpresa',
  dice: 'Dados', balloon: 'Globo', loteria: 'Lotería Mexicana', fishing: 'Pesca',
  gacha: 'Cápsula Gacha', tree: 'Árbol Sacudidor', vending: 'Máquina Expendedora',
  ruleta: 'Ruleta', raspa: 'Raspa y Gana', cofre: 'Cofre Misterioso', sobre: 'Sobre Sorpresa', caja: 'Caja Ciega',
};

// ─── Preview Panel ────────────────────────────────────────────────────────────
const SurprisePreview = ({ form }) => {
  const prizes = form?.prizes || [];
  const activeTriggerCount = Object.values(form?.activeTriggers || {})?.filter(Boolean)?.length;
  const mechanic = form?.mechanic || '';
  const totalProb = prizes?.reduce((s, p) => s + (Number(p?.probability) || 0), 0);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-5 sticky top-6">
      <div className="flex items-center gap-2 mb-1">
        <Icon name="Eye" size={16} className="text-muted-foreground" />
        <h3 className="font-semibold text-foreground text-sm">Vista previa</h3>
      </div>
      {/* Mechanic preview */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5 text-center">
        <div className="text-5xl mb-3">{MECHANIC_ICONS?.[mechanic] || '🎁'}</div>
        <h4 className="font-bold text-foreground text-base">
          {form?.name || 'Nueva Sorpresa'}
        </h4>
        <p className="text-xs text-muted-foreground mt-1">
          {MECHANIC_LABELS?.[mechanic] || '—'}
        </p>
        {form?.endDate && (
          <p className="text-xs text-muted-foreground mt-2">
            Válida hasta: <span className="font-medium">{form?.endDate}</span>
          </p>
        )}
      </div>
      {/* Stats summary */}
      <div className="space-y-2">
        <div className="flex items-center justify-between py-2 border-b border-border">
          <span className="text-xs text-muted-foreground">Premios configurados</span>
          <span className={`text-xs font-semibold ${prizes?.length > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
            {prizes?.length} premio{prizes?.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-border">
          <span className="text-xs text-muted-foreground">Probabilidad total</span>
          <span className={`text-xs font-semibold ${totalProb === 100 ? 'text-green-600' : totalProb > 100 ? 'text-destructive' : 'text-amber-600'}`}>
            {totalProb}%
          </span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-border">
          <span className="text-xs text-muted-foreground">Triggers activos</span>
          <span className={`text-xs font-semibold ${activeTriggerCount > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
            {activeTriggerCount} trigger{activeTriggerCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-xs text-muted-foreground">Establecimientos</span>
          <span className="text-xs font-semibold text-foreground">
            {form?.applyToAll !== false ? 'Todos' : `${(form?.establishmentIds || [])?.length} seleccionado${(form?.establishmentIds || [])?.length !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>
      {/* Prize pool mini */}
      {prizes?.length > 0 && (
        <div>
          <p className="text-xs font-medium text-foreground mb-2">Pool de premios</p>
          <div className="space-y-1.5">
            {prizes?.slice(0, 5)?.map(prize => (
              <div key={prize?.id} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: prize?.color || '#3B82F6' }} />
                <span className="text-xs text-foreground flex-1 truncate">{prize?.name}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0">{prize?.probability}%</span>
              </div>
            ))}
            {prizes?.length > 5 && (
              <p className="text-xs text-muted-foreground">+{prizes?.length - 5} más…</p>
            )}
          </div>
        </div>
      )}
      {/* Validation checklist */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground">Checklist</p>
        {[
          { label: 'Nombre definido', ok: !!form?.name },
          { label: 'Mecánica seleccionada', ok: !!form?.mechanic },
          { label: 'Al menos 1 premio', ok: prizes?.length > 0 },
          { label: 'Probabilidades = 100%', ok: totalProb === 100 },
          { label: 'Al menos 1 trigger', ok: activeTriggerCount > 0 },
        ]?.map(item => (
          <div key={item?.label} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${item?.ok ? 'bg-green-100' : 'bg-muted'}`}>
              <Icon name={item?.ok ? 'Check' : 'Minus'} size={10} className={item?.ok ? 'text-green-600' : 'text-muted-foreground'} />
            </div>
            <span className={`text-xs ${item?.ok ? 'text-foreground' : 'text-muted-foreground'}`}>{item?.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Preview Placeholder (no mechanic selected) ───────────────────────────────
const PreviewPlaceholder = () => (
  <div className="bg-card border border-dashed border-border rounded-2xl p-8 text-center sticky top-6">
    <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
      <Icon name="Gamepad2" size={24} className="text-muted-foreground" />
    </div>
    <h3 className="font-semibold text-foreground text-sm mb-1">Vista previa</h3>
    <p className="text-xs text-muted-foreground leading-relaxed">
      Selecciona una mecánica de juego para activar la vista previa de tu sorpresa.
    </p>
    <div className="mt-4 flex items-center justify-center gap-1.5">
      <div className="w-2 h-2 rounded-full bg-muted animate-pulse" />
      <div className="w-2 h-2 rounded-full bg-muted animate-pulse" style={{ animationDelay: '0.2s' }} />
      <div className="w-2 h-2 rounded-full bg-muted animate-pulse" style={{ animationDelay: '0.4s' }} />
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const NuevaSorpresaPage = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('mecanica');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    mechanic: '',
    mechanicConfig: {},
    distributionMode: 'probabilistic',
    prizes: [],
    expirationDays: 7,
    notifyBeforeExpiry: true,
    activeTriggers: {},
    triggerConfigs: {},
    maxPerUserDay: 1,
    maxPerUserMonth: 5,
    applyToAll: true,
    establishmentIds: [],
    audienceRestriction: 'all',
    startDate: '',
    endDate: '',
  });

  const user = {
    name: authUser?.user_metadata?.full_name || authUser?.email || 'Usuario',
    email: authUser?.email || '',
    role: authUser?.user_metadata?.role || 'owner',
  };

  const prizes = form?.prizes || [];
  const totalProb = prizes?.reduce((s, p) => s + (Number(p?.probability) || 0), 0);
  const activeTriggerCount = Object.values(form?.activeTriggers || {})?.filter(Boolean)?.length;
  const isValid = form?.name && form?.mechanic && prizes?.length > 0 && totalProb === 100 && activeTriggerCount > 0;
  const hasMechanic = !!form?.mechanic;

  const handleSave = async (asDraft = false) => {
    if (!asDraft && !isValid) return;
    setSaving(true);
    try {
      const { data: profile } = await supabase?.from('user_profiles')?.select('user_id')?.eq('id', authUser?.id)?.single();
      const businessId = profile?.user_id || authUser?.id;

      const payload = {
        business_id: businessId,
        name: form?.name,
        description: form?.description,
        mechanic: form?.mechanic,
        distribution_mode: form?.distributionMode,
        prizes: form?.prizes,
        expiration_days: form?.expirationDays,
        notify_before_expiry: form?.notifyBeforeExpiry,
        active_triggers: form?.activeTriggers,
        trigger_configs: form?.triggerConfigs,
        max_per_user_day: form?.maxPerUserDay,
        max_per_user_month: form?.maxPerUserMonth,
        apply_to_all: form?.applyToAll,
        establishment_ids: form?.establishmentIds,
        audience_restriction: form?.audienceRestriction,
        start_date: form?.startDate || null,
        end_date: form?.endDate || null,
        status: asDraft ? 'draft' : 'active',
        created_at: new Date()?.toISOString(),
      };

      await supabase?.from('surprise_configs')?.insert(payload);
      navigate('/surprises-management');
    } catch (err) {
      console.error('Error saving surprise:', err);
    } finally {
      setSaving(false);
    }
  };

  const currentTabIndex = WIZARD_TABS?.findIndex(t => t?.id === activeTab);
  const canGoPrev = currentTabIndex > 0;
  const canGoNext = currentTabIndex < WIZARD_TABS?.length - 1;

  const mainClasses = `pt-16 transition-all duration-500 ease-in-out relative z-10 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`;

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} user={user} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} onCollapse={setIsSidebarCollapsed} />
      <main className={mainClasses}>
        <div className="p-6 max-w-7xl mx-auto">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm mb-4">
            <button onClick={() => navigate('/surprises-management')} className="text-muted-foreground hover:text-foreground transition-colors">
              Sorpresas
            </button>
            <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
            <span className="text-foreground font-medium">Nueva Sorpresa</span>
          </nav>

          {/* Page Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Nueva Sorpresa</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Configura una sorpresa paso a paso</p>
            </div>
            <button
              onClick={() => navigate('/surprises-management')}
              className="px-4 py-2 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
          </div>

          {/* Two-column layout: Wizard (left) + Preview (right) */}
          <div className="flex gap-6 items-start">
            {/* Wizard Form */}
            <div className="flex-1 min-w-0">
              {/* Progress Bar */}
              <div className="bg-card border border-border rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">Progreso del wizard</span>
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                      {WIZARD_TABS?.[currentTabIndex]?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground hidden sm:block">Paso {currentTabIndex + 1} de {WIZARD_TABS?.length}</span>
                    <span className="text-sm font-bold text-primary">{Math.round(((currentTabIndex + 1) / WIZARD_TABS?.length) * 100)}%</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-4">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(((currentTabIndex + 1) / WIZARD_TABS?.length) * 100)}%` }}
                  />
                </div>
                {/* Step indicators */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {WIZARD_TABS?.map((tab, idx) => {
                    const isActive = activeTab === tab?.id;
                    const isPast = idx < currentTabIndex;
                    return (
                      <React.Fragment key={tab?.id}>
                        <button
                          type="button"
                          onClick={() => setActiveTab(tab?.id)}
                          title={tab?.label}
                          className={`flex flex-col items-center gap-1 min-w-[72px] p-2 rounded-xl transition-all ${
                            isActive ? 'bg-primary/10 text-primary' : isPast ? 'text-green-600 hover:bg-green-50 cursor-pointer' : 'text-muted-foreground hover:bg-muted cursor-pointer'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                            isActive ? 'bg-primary text-white shadow-sm' : isPast ? 'bg-green-500 text-white' : 'bg-muted'
                          }`}>
                            {isPast ? (
                              <Icon name="Check" size={14} className="text-white" />
                            ) : (
                              <Icon name={tab?.icon} size={14} className={isActive ? 'text-white' : 'text-muted-foreground'} />
                            )}
                          </div>
                          <span className="text-xs font-medium text-center leading-tight whitespace-nowrap">{tab?.label?.split(' ')?.[0]}</span>
                        </button>
                        {idx < WIZARD_TABS?.length - 1 && (
                          <div className={`flex-1 h-0.5 min-w-[6px] rounded-full transition-colors ${isPast ? 'bg-green-400' : 'bg-border'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-6">
                  {activeTab === 'mecanica' && (
                    <SurpriseConfigGeneralTab form={form} onChange={setForm} />
                  )}
                  {activeTab === 'premios' && (
                    <SurprisePremiosTab form={form} onChange={setForm} />
                  )}
                  {activeTab === 'triggers' && (
                    <SurpriseTriggersTab form={form} onChange={setForm} />
                  )}
                  {activeTab === 'establecimiento' && (
                    <SurpriseEstablecimientoTab form={form} onChange={setForm} />
                  )}
                  {activeTab === 'audiencia' && (
                    <SurpriseAudienciaTab form={form} onChange={setForm} />
                  )}

                  {/* Navigation buttons */}
                  <div className="flex items-center justify-between mt-8 pt-5 border-t border-border">
                    <button
                      type="button"
                      onClick={() => canGoPrev && setActiveTab(WIZARD_TABS?.[currentTabIndex - 1]?.id)}
                      disabled={!canGoPrev}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${canGoPrev ? 'text-foreground hover:bg-muted' : 'text-muted-foreground cursor-not-allowed opacity-40'}`}
                    >
                      <Icon name="ChevronLeft" size={16} />
                      Anterior
                    </button>

                    {/* Dot progress */}
                    <div className="flex items-center gap-1">
                      {WIZARD_TABS?.map((tab, idx) => {
                        const isActive = activeTab === tab?.id;
                        const isPast = currentTabIndex > idx;
                        return (
                          <button key={tab?.id} type="button" onClick={() => setActiveTab(tab?.id)} title={tab?.label}
                            className={`rounded-full transition-all ${isActive ? 'w-6 h-2 bg-primary' : isPast ? 'w-2 h-2 bg-green-500' : 'w-2 h-2 bg-muted hover:bg-muted-foreground'}`} />
                        );
                      })}
                    </div>

                    {canGoNext && (
                      <button
                        type="button"
                        onClick={() => setActiveTab(WIZARD_TABS?.[currentTabIndex + 1]?.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-all"
                      >
                        Siguiente
                        <Icon name="ChevronRight" size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-between py-4">
                <button
                  onClick={() => navigate('/surprises-management')}
                  className="px-4 py-2 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSave(true)}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    <Icon name="Save" size={15} />
                    Guardar borrador
                  </button>
                  <button
                    onClick={() => handleSave(false)}
                    disabled={!isValid || saving}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      isValid && !saving ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Icon name="Save" size={15} />
                    )}
                    Guardar Sorpresa
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Panel — right side, sticky, only visible when mechanic selected */}
            <div className="w-72 flex-shrink-0 hidden lg:block">
              {hasMechanic ? (
                <SurprisePreview form={form} />
              ) : (
                <PreviewPlaceholder />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NuevaSorpresaPage;
