import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import AudienceAnalyticsTab from './components/AudienceAnalyticsTab';
import AudienceWizard from './components/AudienceWizard';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const TABS = [
  { id: 'templates', label: 'Mis Plantillas', icon: 'LayoutTemplate' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
];

const CATEGORY_LABELS = {
  retencion: 'Retención',
  adquisicion: 'Adquisición',
  lealtad: 'Lealtad',
  campanas: 'Campañas',
  personalizada: 'Personalizada',
};

const CATEGORY_COLORS = {
  retencion: 'bg-red-50 text-red-600 border-red-200',
  adquisicion: 'bg-blue-50 text-blue-600 border-blue-200',
  lealtad: 'bg-amber-50 text-amber-600 border-amber-200',
  campanas: 'bg-purple-50 text-purple-600 border-purple-200',
  personalizada: 'bg-gray-50 text-gray-600 border-gray-200',
};

const TemplateCard = ({ template, onEdit, onDuplicate, onDelete, onUse }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const isPromoClub = template?.template_type === 'promoclub_suggested';

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all group relative">
      {isPromoClub && (
        <div className="absolute top-3 right-3">
          <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-medium flex items-center gap-1">
            <Icon name="Sparkles" size={10} />
            PromoClub
          </span>
        </div>
      )}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon name="Users" size={18} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0 pr-8">
          <h3 className="font-semibold text-foreground text-sm leading-tight">{template?.name}</h3>
          {template?.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{template?.description}</p>
          )}
        </div>
      </div>
      {/* Category + type badges */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`text-xs border rounded-full px-2 py-0.5 font-medium ${CATEGORY_COLORS?.[template?.category] || CATEGORY_COLORS?.personalizada}`}>
          {CATEGORY_LABELS?.[template?.category] || 'Personalizada'}
        </span>
        <span className={`text-xs rounded-full px-2 py-0.5 ${
          template?.audience_type === 'dynamic' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
        }`}>
          {template?.audience_type === 'dynamic' ? '⚡ Dinámica' : '🔒 Estática'}
        </span>
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-muted/30 rounded-lg">
          <p className="text-sm font-bold text-foreground">~{(template?.estimated_count || 0)?.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">usuarios</p>
        </div>
        <div className="text-center p-2 bg-muted/30 rounded-lg">
          <p className="text-sm font-bold text-foreground">{template?.times_used || 0}</p>
          <p className="text-xs text-muted-foreground">usos</p>
        </div>
        <div className="text-center p-2 bg-muted/30 rounded-lg">
          <p className="text-sm font-bold text-emerald-600">
            {template?.avg_conversion_rate > 0 ? `${template?.avg_conversion_rate}%` : '—'}
          </p>
          <p className="text-xs text-muted-foreground">conversión</p>
        </div>
      </div>
      {/* Filters preview */}
      {template?.filters && Array.isArray(template?.filters) && template?.filters?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {template?.filters?.slice(0, 3)?.map((f, i) => (
            <span key={i} className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">{f}</span>
          ))}
          {template?.filters?.length > 3 && (
            <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">+{template?.filters?.length - 3} más</span>
          )}
        </div>
      )}
      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="flex-1 text-xs"
          onClick={() => onUse?.(template)}
          iconName="Play"
          iconSize={12}
        >
          Usar en campaña
        </Button>
        {!isPromoClub && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(p => !p)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Icon name="MoreVertical" size={16} className="text-muted-foreground" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 bottom-full mb-1 bg-card border border-border rounded-xl shadow-lg z-20 min-w-[160px] py-1">
                <button onClick={() => { onEdit?.(template); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors">
                  <Icon name="Edit3" size={14} className="text-muted-foreground" /> Editar
                </button>
                <button onClick={() => { onDuplicate?.(template); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors">
                  <Icon name="Copy" size={14} className="text-muted-foreground" /> Duplicar
                </button>
                <div className="border-t border-border my-1" />
                <button onClick={() => { onDelete?.(template?.id); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors">
                  <Icon name="Trash2" size={14} /> Eliminar
                </button>
              </div>
            )}
          </div>
        )}
        {isPromoClub && (
          <button
            onClick={() => onDuplicate?.(template)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Duplicar como propia"
          >
            <Icon name="Copy" size={16} className="text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
};

const AudienceBuilder = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  const [showWizard, setShowWizard] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const user = {
    id: authUser?.id,
    name: authUser?.user_metadata?.full_name || 'Admin',
    email: authUser?.email || '',
    role: 'owner',
  };

  const fetchTemplates = async () => {
    if (!authUser?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        ?.from('audience_templates')
        ?.select('*')
        ?.or(`business_id.eq.${authUser?.id},template_type.eq.promoclub_suggested`)
        ?.eq('is_active', true)
        ?.order('created_at', { ascending: false });
      if (!error) setTemplates(data || []);
    } catch (err) {
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [authUser?.id]);

  const handleSaveTemplate = async (formData) => {
    setSaving(true);
    try {
      if (editingTemplate && editingTemplate?.template_type !== 'promoclub_suggested') {
        const { error } = await supabase
          ?.from('audience_templates')
          ?.update({
            name: formData?.name,
            description: formData?.description,
            category: formData?.category,
            audience_type: formData?.audienceType,
            filters: formData?.filters,
            estimated_count: formData?.estimatedCount,
            tags: formData?.tags,
            updated_at: new Date()?.toISOString(),
          })
          ?.eq('id', editingTemplate?.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          ?.from('audience_templates')
          ?.insert({
            business_id: authUser?.id,
            name: formData?.name,
            description: formData?.description,
            category: formData?.category,
            template_type: 'user_created',
            audience_type: formData?.audienceType,
            filters: formData?.filters,
            estimated_count: formData?.estimatedCount,
            tags: formData?.tags,
          });
        if (error) throw error;
      }
      await fetchTemplates();
      setShowWizard(false);
      setEditingTemplate(null);
      setSuccessMsg(editingTemplate ? 'Plantilla actualizada correctamente' : 'Plantilla guardada correctamente');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error saving template:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (template) => {
    try {
      const { error } = await supabase
        ?.from('audience_templates')
        ?.insert({
          business_id: authUser?.id,
          name: `${template?.name} (copia)`,
          description: template?.description,
          category: template?.category,
          template_type: 'user_created',
          audience_type: template?.audience_type,
          filters: template?.filters,
          estimated_count: template?.estimated_count,
          tags: template?.tags || [],
        });
      if (!error) {
        await fetchTemplates();
        setSuccessMsg('Plantilla duplicada correctamente');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Error duplicating template:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        ?.from('audience_templates')
        ?.update({ is_active: false })
        ?.eq('id', id)
        ?.eq('business_id', authUser?.id);
      if (!error) {
        setTemplates(prev => prev?.filter(t => t?.id !== id));
        setSuccessMsg('Plantilla eliminada');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Error deleting template:', err);
    }
  };

  const handleUse = (template) => {
    navigate('/campaign-creation', { state: { audienceTemplate: template } });
  };

  const filteredTemplates = templates?.filter(t => {
    const matchesCategory = filterCategory === 'all' || t?.category === filterCategory;
    const matchesSearch = !searchQuery || t?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const myTemplates = filteredTemplates?.filter(t => t?.template_type === 'user_created');
  const suggestedTemplates = filteredTemplates?.filter(t => t?.template_type === 'promoclub_suggested');

  // If wizard is open, render it full-page
  if (showWizard) {
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
          <AudienceWizard
            onSave={handleSaveTemplate}
            onCancel={() => { setShowWizard(false); setEditingTemplate(null); }}
            initialData={editingTemplate}
          />
        </main>
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
      <main className={`pt-16 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <div className="p-6 max-w-[1920px] mx-auto space-y-6">

          {/* Success toast */}
          {successMsg && (
            <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-right">
              <Icon name="CheckCircle" size={16} />
              <span className="text-sm font-medium">{successMsg}</span>
            </div>
          )}

          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Constructor de Audiencias</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Crea y gestiona plantillas de segmentación para tus campañas
              </p>
            </div>
            <Button
              onClick={() => { setEditingTemplate(null); setShowWizard(true); }}
              iconName="Plus"
              iconSize={16}
            >
              Crear plantilla
            </Button>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Mis plantillas', value: templates?.filter(t => t?.template_type === 'user_created')?.length || 0, icon: 'LayoutTemplate', color: 'text-indigo-600 bg-indigo-50' },
              { label: 'Sugeridas PromoClub', value: templates?.filter(t => t?.template_type === 'promoclub_suggested')?.length || 0, icon: 'Sparkles', color: 'text-primary bg-primary/10' },
              { label: 'Usos totales', value: templates?.reduce((s, t) => s + (t?.times_used || 0), 0), icon: 'Play', color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Conversión prom.', value: '27.1%', icon: 'Target', color: 'text-amber-600 bg-amber-50' },
            ]?.map((stat, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${stat?.color}`}>
                  <Icon name={stat?.icon} size={18} />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{stat?.value}</p>
                  <p className="text-xs text-muted-foreground">{stat?.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tab navigation */}
          <div className="border-b border-border">
            <nav className="flex gap-0 -mb-px">
              {TABS?.map(tab => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                    activeTab === tab?.id
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  {tab?.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab content */}
          {activeTab === 'analytics' && <AudienceAnalyticsTab />}

          {activeTab === 'templates' && (
            <div className="space-y-6">
              {/* Filters bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                  <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e?.target?.value)}
                    placeholder="Buscar plantillas..."
                    className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {[
                    { key: 'all', label: 'Todas' },
                    { key: 'retencion', label: 'Retención' },
                    { key: 'adquisicion', label: 'Adquisición' },
                    { key: 'lealtad', label: 'Lealtad' },
                    { key: 'campanas', label: 'Campañas' },
                    { key: 'personalizada', label: 'Personalizadas' },
                  ]?.map(cat => (
                    <button
                      key={cat?.key}
                      onClick={() => setFilterCategory(cat?.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        filterCategory === cat?.key
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                      }`}
                    >
                      {cat?.label}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Icon name="Loader2" size={20} className="animate-spin" />
                    <span className="text-sm">Cargando plantillas...</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* My templates */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-semibold text-foreground flex items-center gap-2">
                        <Icon name="LayoutTemplate" size={18} className="text-primary" />
                        Mis plantillas
                        <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">{myTemplates?.length}</span>
                      </h2>
                    </div>

                    {myTemplates?.length === 0 ? (
                      <div className="bg-card border border-dashed border-border rounded-xl p-10 text-center">
                        <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                          <Icon name="LayoutTemplate" size={24} className="text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">No tienes plantillas aún</h3>
                        <p className="text-sm text-muted-foreground mb-4">Crea tu primera plantilla de audiencia para segmentar tus campañas.</p>
                        <Button onClick={() => { setEditingTemplate(null); setShowWizard(true); }} iconName="Plus" iconSize={14}>
                          Crear primera plantilla
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {myTemplates?.map(template => (
                          <TemplateCard
                            key={template?.id}
                            template={template}
                            onEdit={(t) => { setEditingTemplate(t); setShowWizard(true); }}
                            onDuplicate={handleDuplicate}
                            onDelete={handleDelete}
                            onUse={handleUse}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* PromoClub suggested */}
                  {suggestedTemplates?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <h2 className="font-semibold text-foreground flex items-center gap-2">
                          <Icon name="Sparkles" size={18} className="text-primary" />
                          Sugeridas por PromoClub
                          <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">{suggestedTemplates?.length}</span>
                        </h2>
                        <span className="text-xs text-muted-foreground">Plantillas pre-construidas con los criterios más efectivos</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {suggestedTemplates?.map(template => (
                          <TemplateCard
                            key={template?.id}
                            template={template}
                            onEdit={() => {}}
                            onDelete={() => {}}
                            onDuplicate={handleDuplicate}
                            onUse={handleUse}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AudienceBuilder;
