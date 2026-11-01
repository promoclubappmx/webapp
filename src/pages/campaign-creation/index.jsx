import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';

import ObjectiveSelector from './components/ObjectiveSelector';
import CampaignBasicForm from './components/CampaignBasicForm';
import SequenceBuilder from './components/SequenceBuilder';
import ABTestingPanel from './components/ABTestingPanel';
import ControlGroupPanel from './components/ControlGroupPanel';
import CampaignTemplateSelector from './components/CampaignTemplateSelector';


const STEPS = [
  { id: 1, label: 'Objetivo', icon: 'Target' },
  { id: 2, label: 'Información', icon: 'FileText' },
  { id: 3, label: 'Audiencia', icon: 'Users' },
  { id: 4, label: 'Secuencia', icon: 'GitBranch' },
  { id: 5, label: 'Avanzado', icon: 'FlaskConical' },
];

const defaultFormData = {
  name: '',
  description: '',
  objective: null,
  startDate: '',
  endDate: '',
  budget: 0,
  categoryTag: '',
  status: 'draft',
};

const defaultSequence = [
  { id: Date.now(), action: 'push', message: '', timingType: 'immediate', waitDays: 0, waitAction: 'visited', waitDate: '', branchYes: '', branchNo: '' },
];

const defaultAdvanced = {
  abEnabled: false,
  variants: [{ title: '', discount: '', cta: '' }, { title: '', discount: '', cta: '' }],
  variantCount: 2,
  audienceSplit: '50-50',
  testDuration: 7,
  controlGroupEnabled: false,
  controlGroupPercent: 10,
};

const CampaignCreationPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const isDuplicate = searchParams?.get('duplicate') === 'true';
  const showDashboard = searchParams?.get('dashboard') === 'true';

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showTemplates, setShowTemplates] = useState(!isEdit && !isDuplicate);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState(defaultFormData);
  const [audienceData, setAudienceData] = useState({ filters: [], savedName: '' });
  const [sequence, setSequence] = useState(defaultSequence);
  const [advancedData, setAdvancedData] = useState(defaultAdvanced);

  const user = { id: 1, name: 'Carlos Mendoza', email: 'carlos@mirestaurante.com', role: 'owner' };

  useEffect(() => {
    if (isEdit && id) {
      loadCampaign(id);
    }
  }, [id]);

  const loadCampaign = async (campaignId) => {
    setIsLoading(true);
    try {
      const { data, error: err } = await supabase?.from('campaign_objectives')?.select('*')?.eq('campaign_id', campaignId)?.maybeSingle();

      if (err) console.error('Error loading campaign:', err?.message);

      if (data) {
        setFormData(prev => ({
          ...prev,
          name: isDuplicate ? `${data?.name || ''} (Copia)` : (data?.name || ''),
          description: data?.description || '',
          objective: data?.objective || null,
          startDate: isDuplicate ? '' : (data?.start_date || ''),
          endDate: isDuplicate ? '' : (data?.end_date || ''),
          budget: data?.budget || 0,
          categoryTag: data?.category_tag || '',
          status: isDuplicate ? 'draft' : (data?.status || 'draft'),
        }));
        setShowTemplates(false);
      }
    } catch (e) {
      console.error('Error:', e?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = (template) => {
    setFormData(prev => ({
      ...prev,
      objective: template?.objective || null,
      name: template?.nombre || '',
    }));
    setShowTemplates(false);
    setCurrentStep(1);
  };

  const handleSave = async (asDraft = false) => {
    if (!formData?.name?.trim()) {
      setError('El nombre de la campaña es requerido.');
      setCurrentStep(2);
      return;
    }
    if (!formData?.objective) {
      setError('Selecciona un objetivo para la campaña.');
      setCurrentStep(1);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const campaignPayload = {
        campaign_id: isEdit && !isDuplicate ? id : `camp_${Date.now()}`,
        name: formData?.name,
        description: formData?.description,
        objective: formData?.objective,
        start_date: formData?.startDate || null,
        end_date: formData?.endDate || null,
        budget: formData?.budget || null,
        category_tag: formData?.categoryTag || null,
        status: asDraft ? 'draft' : (formData?.status || 'draft'),
        ab_enabled: advancedData?.abEnabled,
        control_group_enabled: advancedData?.controlGroupEnabled,
        control_group_percent: advancedData?.controlGroupEnabled ? advancedData?.controlGroupPercent : null,
      };

      const { data: savedCampaign, error: saveError } = await supabase?.from('campaign_objectives')?.upsert(campaignPayload, { onConflict: 'campaign_id' })?.select()?.single();

      if (saveError) throw saveError;

      // Save sequences
      if (sequence?.length > 0 && savedCampaign) {
        await supabase?.from('campaign_sequences')?.delete()?.eq('campaign_id', savedCampaign?.campaign_id);

        const seqPayload = sequence?.map((step, idx) => ({
          campaign_id: savedCampaign?.campaign_id,
          step_order: idx + 1,
          channel: step?.action,
          message: step?.message || '',
          delay_days: step?.timingType === 'wait_time' ? (step?.waitDays || 0) : 0,
          timing_type: step?.timingType || 'immediate',
        }));

        await supabase?.from('campaign_sequences')?.insert(seqPayload);
      }

      // Save A/B test
      if (advancedData?.abEnabled && savedCampaign) {
        await supabase?.from('campaign_ab_tests')?.delete()?.eq('campaign_id', savedCampaign?.campaign_id);

        const abPayload = (advancedData?.variants || [])?.slice(0, advancedData?.variantCount || 2)?.map((v, idx) => ({
          campaign_id: savedCampaign?.campaign_id,
          variant_label: ['A', 'B', 'C']?.[idx],
          title: v?.title || '',
          discount_value: v?.discount || '',
          cta_text: v?.cta || '',
          audience_split: advancedData?.audienceSplit || '50-50',
        }));

        await supabase?.from('campaign_ab_tests')?.insert(abPayload);
      }

      navigate('/campaigns-management');
    } catch (e) {
      setError(e?.message || 'Error al guardar la campaña.');
    } finally {
      setIsSaving(false);
    }
  };

  const canAdvance = () => {
    if (currentStep === 1) return !!formData?.objective;
    if (currentStep === 2) return !!formData?.name?.trim() && !!formData?.startDate && !!formData?.endDate;
    return true;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando campaña...</p>
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

      <main
        className={`pt-16 transition-all duration-500 ease-in-out ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
      >
        <div className="p-6">

          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/campaigns-management')}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Icon name="ArrowLeft" size={20} className="text-muted-foreground" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {isEdit ? (isDuplicate ? 'Duplicar Campaña' : 'Editar Campaña') : 'Nueva Campaña'}
                </h1>
                <p className="text-sm text-muted-foreground">Campaign Builder — Organiza múltiples acciones bajo un objetivo medible</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => handleSave(true)} disabled={isSaving}>
                Guardar borrador
              </Button>
              <Button onClick={() => handleSave(false)} disabled={isSaving} iconName={isSaving ? undefined : 'Check'} iconSize={16}>
                {isSaving ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear campaña')}
              </Button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <Icon name="AlertCircle" size={16} className="text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto">
                <Icon name="X" size={14} className="text-destructive" />
              </button>
            </div>
          )}

          {/* Templates selector (only on new campaign) */}
          {showTemplates && (
            <div className="mb-8 bg-card border border-border rounded-2xl p-6">
              <CampaignTemplateSelector
                selectedObjective={formData?.objective}
                onSelectTemplate={handleSelectTemplate}
              />
              <div className="mt-4 pt-4 border-t border-border">
                <button
                  onClick={() => setShowTemplates(false)}
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                >
                  <Icon name="Plus" size={14} />
                  Crear desde cero sin plantilla
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Left: Steps navigation */}
            <div className="xl:col-span-1">
              <div className="bg-card border border-border rounded-2xl p-4 sticky top-24">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Pasos</p>
                <div className="space-y-1">
                  {STEPS?.map((step, idx) => (
                    <button
                      key={step?.id}
                      onClick={() => setCurrentStep(step?.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                        currentStep === step?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        currentStep === step?.id
                          ? 'bg-white/20 text-primary-foreground'
                          : currentStep > step?.id
                          ? 'bg-primary/10 text-primary' :'bg-muted text-muted-foreground'
                      }`}>
                        {currentStep > step?.id ? <Icon name="Check" size={12} /> : step?.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          currentStep === step?.id ? 'text-primary-foreground' : 'text-foreground'
                        }`}>{step?.label}</p>
                      </div>
                      <Icon name={step?.icon} size={14} className={currentStep === step?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'} />
                    </button>
                  ))}
                </div>

                {/* Dashboard link if editing active campaign */}
                {isEdit && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <button
                      onClick={() => navigate(`/campaigns-management`)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-left"
                    >
                      <Icon name="BarChart2" size={16} className="text-primary" />
                      <span className="text-sm font-medium text-foreground">Ver dashboard</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Step content */}
            <div className="xl:col-span-3">
              <div className="bg-card border border-border rounded-2xl p-6">
                {/* Step 1: Objective */}
                {currentStep === 1 && (
                  <ObjectiveSelector
                    selected={formData?.objective}
                    onSelect={val => setFormData(prev => ({ ...prev, objective: val }))}
                  />
                )}

                {/* Step 2: Basic Info */}
                {currentStep === 2 && (
                  <CampaignBasicForm
                    data={formData}
                    onChange={setFormData}
                  />
                )}

                {/* Step 3: Audience */}
                {currentStep === 3 && (
                  <AudienceStep
                    data={audienceData}
                    onChange={setAudienceData}
                    objective={formData?.objective}
                  />
                )}

                {/* Step 4: Sequence */}
                {currentStep === 4 && (
                  <SequenceBuilder
                    steps={sequence}
                    onChange={setSequence}
                  />
                )}

                {/* Step 5: Advanced (A/B + Control Group) */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">Configuración avanzada</h3>
                      <p className="text-sm text-muted-foreground">Optimiza el rendimiento con pruebas A/B y grupos de control.</p>
                    </div>
                    <ABTestingPanel data={advancedData} onChange={setAdvancedData} />
                    <ControlGroupPanel data={advancedData} onChange={setAdvancedData} />
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => currentStep > 1 ? setCurrentStep(s => s - 1) : navigate('/campaigns-management')}
                    iconName="ChevronLeft"
                    iconSize={16}
                  >
                    {currentStep === 1 ? 'Cancelar' : 'Anterior'}
                  </Button>
                  {currentStep < STEPS?.length ? (
                    <Button
                      onClick={() => setCurrentStep(s => s + 1)}
                      disabled={!canAdvance()}
                      iconName="ChevronRight"
                      iconSize={16}
                    >
                      Siguiente
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSave(false)}
                      disabled={isSaving}
                      iconName="Check"
                      iconSize={16}
                    >
                      {isSaving ? 'Guardando...' : (isEdit ? 'Actualizar campaña' : 'Crear campaña')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Inline Audience Step component
const AUDIENCE_FILTERS = {
  relacion: {
    label: 'Relación con el negocio',
    icon: 'Users',
    options: [
      { id: 'todos', label: 'Todos los que conocen el negocio', count: '~1,240' },
      { id: 'al_menos_una_visita', label: 'Al menos una visita', count: '~980' },
      { id: 'nuevos_30d', label: 'Clientes nuevos (primera visita últimos 30 días)', count: '~180' },
      { id: 'recurrentes_3', label: 'Clientes recurrentes (3+ visitas)', count: '~420' },
      { id: 'dormidos', label: 'Clientes dormidos (sin visita en X días)', count: '~310' },
      { id: 'perdidos_60d', label: 'Clientes perdidos (sin visita 60+ días)', count: '~195' },
      { id: 'nunca_visitaron', label: 'Nunca han visitado pero están cerca', count: '~2,100' },
    ],
  },
  vip: {
    label: 'Nivel VIP',
    icon: 'Star',
    options: [
      { id: 'bronce', label: 'Bronce', count: '~340' },
      { id: 'plata', label: 'Plata', count: '~180' },
      { id: 'oro', label: 'Oro', count: '~65' },
      { id: 'sin_nivel', label: 'Sin nivel VIP', count: '~655' },
    ],
  },
  comportamiento: {
    label: 'Comportamiento',
    icon: 'Activity',
    options: [
      { id: 'canjeo_cupon', label: 'Han canjeado cupón en últimos X días', count: '~220' },
      { id: 'dejo_resena', label: 'Han dejado reseña', count: '~145' },
      { id: 'refirieron', label: 'Han referido a alguien', count: '~78' },
      { id: 'puntos_sin_canjear', label: 'Tienen puntos acumulados sin canjear', count: '~390' },
      { id: 'punch_incompleto', label: 'Punch card activo sin completar', count: '~210' },
      { id: 'vio_sin_visitar', label: 'Vieron la ficha sin visitar (intent)', count: '~480' },
      { id: 'suscrito_notif', label: 'Suscritos a notificaciones', count: '~720' },
    ],
  },
  demografia: {
    label: 'Demografía',
    icon: 'UserCheck',
    options: [
      { id: 'cumple_mes', label: 'Cumpleaños este mes', count: '~85' },
      { id: 'edad_18_25', label: 'Edad 18-25 años', count: '~230' },
      { id: 'edad_26_40', label: 'Edad 26-40 años', count: '~410' },
      { id: 'edad_40_plus', label: 'Edad 40+ años', count: '~280' },
    ],
  },
  ubicacion: {
    label: 'Ubicación',
    icon: 'MapPin',
    options: [
      { id: 'radio_1km', label: 'Radio 1 km del negocio', count: '~340' },
      { id: 'radio_3km', label: 'Radio 3 km del negocio', count: '~890' },
      { id: 'radio_5km', label: 'Radio 5 km del negocio', count: '~1,450' },
      { id: 'radio_10km', label: 'Radio 10 km del negocio', count: '~2,800' },
    ],
  },
  crm: {
    label: 'Segmento CRM',
    icon: 'Tag',
    options: [
      { id: 'fans_cafe', label: 'Fans del café', count: '~120' },
      { id: 'clientes_corp', label: 'Clientes corporativos', count: '~45' },
      { id: 'mamas', label: 'Mamás', count: '~88' },
    ],
  },
  canal: {
    label: 'Canal de comunicación',
    icon: 'Send',
    options: [
      { id: 'push_habilitado', label: 'Push habilitado', count: '~720' },
      { id: 'email_registrado', label: 'Email registrado', count: '~890' },
      { id: 'whatsapp_vinculado', label: 'WhatsApp vinculado', count: '~340' },
    ],
  },
};

const AudienceStep = ({ data, onChange, objective }) => {
  const [expandedSections, setExpandedSections] = useState({ relacion: true, vip: false, comportamiento: false, demografia: false, ubicacion: false, crm: false, canal: false });
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const selectedFilters = data?.filters || [];

  const toggleFilter = (filterId) => {
    const newFilters = selectedFilters?.includes(filterId)
      ? selectedFilters?.filter(f => f !== filterId)
      : [...selectedFilters, filterId];
    onChange({ ...data, filters: newFilters });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev?.[section] }));
  };

  // Estimate audience count
  const estimatedCount = selectedFilters?.length === 0 ? 0 :
    selectedFilters?.reduce((sum, filterId) => {
      for (const cat of Object.values(AUDIENCE_FILTERS)) {
        const opt = cat?.options?.find(o => o?.id === filterId);
        if (opt) {
          const num = parseInt(opt?.count?.replace(/[~,]/g, '')) || 0;
          return sum + num;
        }
      }
      return sum;
    }, 0);

  const isTooSmall = selectedFilters?.length > 0 && estimatedCount < 10;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Seleccionar audiencia</h3>
          <p className="text-sm text-muted-foreground">Combina filtros con lógica AND para definir tu audiencia objetivo.</p>
        </div>
        {/* Estimado en tiempo real */}
        <div className={`text-center px-4 py-2 rounded-xl border-2 ${
          isTooSmall ? 'border-destructive bg-destructive/5' :
          selectedFilters?.length > 0 ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'
        }`}>
          <p className={`text-2xl font-bold ${
            isTooSmall ? 'text-destructive' : selectedFilters?.length > 0 ? 'text-primary' : 'text-muted-foreground'
          }`}>
            ~{estimatedCount?.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">usuarios estimados</p>
        </div>
      </div>
      {isTooSmall && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
          <Icon name="AlertTriangle" size={16} className="text-destructive" />
          <p className="text-sm text-destructive">Audiencia muy pequeña (menos de 10 usuarios). Considera ampliar los filtros.</p>
        </div>
      )}
      {selectedFilters?.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {selectedFilters?.map(filterId => {
            let label = filterId;
            for (const cat of Object.values(AUDIENCE_FILTERS)) {
              const opt = cat?.options?.find(o => o?.id === filterId);
              if (opt) { label = opt?.label; break; }
            }
            return (
              <span key={filterId} className="flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/30 rounded-full px-2 py-1">
                {label}
                <button onClick={() => toggleFilter(filterId)}><Icon name="X" size={10} /></button>
              </span>
            );
          })}
        </div>
      )}
      {/* Filtros por categoría */}
      <div className="space-y-2">
        {Object.entries(AUDIENCE_FILTERS)?.map(([key, cat]) => (
          <div key={key} className="border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection(key)}
              className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon name={cat?.icon} size={16} className="text-primary" />
                <span className="text-sm font-medium text-foreground">{cat?.label}</span>
                {cat?.options?.filter(o => selectedFilters?.includes(o?.id))?.length > 0 && (
                  <span className="text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
                    {cat?.options?.filter(o => selectedFilters?.includes(o?.id))?.length}
                  </span>
                )}
              </div>
              <Icon name={expandedSections?.[key] ? 'ChevronUp' : 'ChevronDown'} size={14} className="text-muted-foreground" />
            </button>
            {expandedSections?.[key] && (
              <div className="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {cat?.options?.map(opt => (
                  <button
                    key={opt?.id}
                    onClick={() => toggleFilter(opt?.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                      selectedFilters?.includes(opt?.id)
                        ? 'border-primary bg-primary/5' :'border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedFilters?.includes(opt?.id) ? 'bg-primary border-primary' : 'border-border'
                      }`}>
                        {selectedFilters?.includes(opt?.id) && <Icon name="Check" size={10} className="text-primary-foreground" />}
                      </div>
                      <span className="text-xs text-foreground">{opt?.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{opt?.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Guardar como template */}
      <div className="mt-4 border border-dashed border-border rounded-xl p-4">
        <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
          <Icon name="Bookmark" size={14} className="text-primary" />
          Guardar audiencia como template reutilizable
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={templateName}
            onChange={e => setTemplateName(e?.target?.value)}
            placeholder='Ej: "Mis VIPs dormidos", "Zona Centro sin visita"'
            className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={() => {
              if (templateName?.trim()) {
                onChange({ ...data, savedTemplateName: templateName });
                setSavingTemplate(true);
                setTimeout(() => setSavingTemplate(false), 1500);
              }
            }}
            disabled={!templateName?.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {savingTemplate ? '✓ Guardado' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignCreationPage;
