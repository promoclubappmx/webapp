import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

// ─── ALL FILTER CATEGORIES WITH EXPANDED OPTIONS ──────────────────────────────
const FILTER_CATEGORIES = {
  relacion: {
    label: 'Relación con el negocio',
    icon: 'Users',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    options: [
      { id: 'todos', label: 'Todos los que conocen el negocio', count: 1240 },
      { id: 'al_menos_una_visita', label: 'Al menos una visita', count: 980 },
      { id: 'nuevos_30d', label: 'Clientes nuevos (primera visita últimos 30 días)', count: 180 },
      { id: 'primera_visita_semana', label: 'Primera visita hoy o esta semana', count: 35 },
      { id: 'activos_7d', label: 'Clientes activos (visitaron en los últimos 7 días)', count: 210 },
      { id: 'recurrentes_3', label: 'Clientes recurrentes (3+ visitas)', count: 420 },
      { id: 'en_riesgo_dormirse', label: 'En riesgo de dormirse (15-20 días sin visita)', count: 145 },
      { id: 'dormidos_30d', label: 'Clientes dormidos (sin visita 30+ días)', count: 310 },
      { id: 'dormidos_60d', label: 'Clientes dormidos (sin visita 60+ días)', count: 195 },
      { id: 'recuperados_30d', label: 'Clientes recuperados (estuvieron dormidos y regresaron)', count: 68 },
      { id: 'nunca_visitaron', label: 'Nunca han visitado pero están cerca', count: 2100 },
      { id: 'visitas_5_plus', label: 'Clientes con 5+ visitas (configurable)', count: 380 },
      { id: 'visitas_20_plus', label: 'Clientes con 20+ visitas', count: 95 },
    ],
  },
  vip: {
    label: 'Nivel VIP',
    icon: 'Star',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    options: [
      { id: 'bronce', label: 'Bronce', count: 340 },
      { id: 'plata', label: 'Plata', count: 180 },
      { id: 'oro', label: 'Oro', count: 65 },
      { id: 'sin_nivel', label: 'Sin nivel VIP', count: 655 },
      { id: 'proximos_subir_nivel', label: 'Próximos a subir de nivel (1-2 visitas/puntos)', count: 120 },
      { id: 'nivel_bajo_recientemente', label: 'Nivel VIP bajó recientemente (últimos 30 días)', count: 28 },
      { id: 'membresia_vip_activa', label: 'Membresía VIP de pago activa', count: 42 },
      { id: 'membresia_vip_por_vencer', label: 'Membresía VIP próxima a vencer (7-30 días)', count: 15 },
    ],
  },
  comportamiento: {
    label: 'Comportamiento',
    icon: 'Activity',
    color: 'text-green-600',
    bg: 'bg-green-50',
    options: [
      { id: 'canjeo_cupon', label: 'Han canjeado cupón en últimos 30 días', count: 220 },
      { id: 'nunca_canjeo_cupon', label: 'Nunca han canjeado un cupón', count: 430 },
      { id: 'puntos_sin_canjear', label: 'Tienen puntos acumulados sin canjear', count: 390 },
      { id: 'puntos_suficientes_recompensa', label: 'Tienen puntos suficientes para una recompensa', count: 185 },
      { id: 'punch_incompleto', label: 'Punch card activo sin completar', count: 210 },
      { id: 'punch_completado_30d', label: 'Completaron punch card recientemente (30 días)', count: 78 },
      { id: 'dejo_resena', label: 'Han dejado reseña', count: 145 },
      { id: 'refirieron', label: 'Han referido a alguien', count: 78 },
      { id: 'vio_sin_visitar', label: 'Vieron la ficha sin visitar (intent)', count: 480 },
      { id: 'suscrito_notif', label: 'Suscritos a notificaciones', count: 720 },
      { id: 'reservacion_proxima', label: 'Tienen reservación próxima (7 días)', count: 55 },
      { id: 'no_show_reciente', label: 'Tuvieron no-show recientemente', count: 32 },
      { id: 'perfil_completo', label: 'Completaron su perfil en la app', count: 540 },
      { id: 'nps_promotor', label: 'NPS Promotor (9-10)', count: 180 },
      { id: 'nps_pasivo', label: 'NPS Pasivo (7-8)', count: 220 },
      { id: 'nps_detractor', label: 'NPS Detractor (0-6)', count: 95 },
      { id: 'racha_activa_5', label: 'Racha activa de 5+ visitas', count: 88 },
      { id: 'racha_en_riesgo', label: 'Racha en riesgo de romperse hoy o mañana', count: 24 },
      { id: 'logro_desbloqueado', label: 'Desbloquearon un logro específico', count: 145 },
      { id: 'chat_negocio', label: 'Han usado el chat del negocio', count: 210 },
    ],
  },
  demografia: {
    label: 'Demografía',
    icon: 'UserCheck',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    options: [
      { id: 'cumple_mes', label: 'Cumpleaños este mes', count: 85 },
      { id: 'cumple_semana', label: 'Cumpleaños esta semana', count: 22 },
      { id: 'cumple_proximos_7d', label: 'Cumpleaños en los próximos 7 días', count: 28 },
      { id: 'edad_18_25', label: 'Edad 18-25 años', count: 230 },
      { id: 'edad_26_40', label: 'Edad 26-40 años', count: 410 },
      { id: 'edad_40_plus', label: 'Edad 40+ años', count: 280 },
      { id: 'genero_femenino', label: 'Género femenino (si registrado)', count: 520 },
      { id: 'genero_masculino', label: 'Género masculino (si registrado)', count: 480 },
      { id: 'idioma_espanol', label: 'Idioma preferido: Español', count: 890 },
      { id: 'idioma_ingles', label: 'Idioma preferido: Inglés', count: 145 },
      { id: 'perfil_incompleto', label: 'Perfil incompleto (falta fecha de nacimiento o permisos)', count: 320 },
      { id: 'antiguedad_6m', label: 'Cuenta registrada hace más de 6 meses', count: 680 },
      { id: 'antiguedad_1a', label: 'Cuenta registrada hace más de 1 año', count: 420 },
    ],
  },
  ubicacion: {
    label: 'Ubicación',
    icon: 'MapPin',
    color: 'text-red-600',
    bg: 'bg-red-50',
    options: [
      { id: 'radio_05km', label: 'Radio 0.5 km del negocio', count: 120 },
      { id: 'radio_1km', label: 'Radio 1 km del negocio', count: 340 },
      { id: 'radio_3km', label: 'Radio 3 km del negocio', count: 890 },
      { id: 'radio_5km', label: 'Radio 5 km del negocio', count: 1450 },
      { id: 'radio_10km', label: 'Radio 10 km del negocio', count: 2800 },
      { id: 'zona_centro', label: 'Colonia/Zona: Centro Histórico', count: 380 },
      { id: 'zona_dorada', label: 'Colonia/Zona: Zona Dorada', count: 290 },
      { id: 'zona_norte', label: 'Colonia/Zona: Zona Norte', count: 210 },
      { id: 'gps_tiempo_real', label: 'Ubicación actual ahora mismo (GPS tiempo real)', count: 45 },
      { id: 'cerca_competencia', label: 'Cerca de la competencia (geofencing competitivo)', count: 120 },
    ],
  },
  crm: {
    label: 'Segmento CRM',
    icon: 'Tag',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    options: [
      { id: 'fans_cafe', label: 'Fans del café', count: 120 },
      { id: 'clientes_corp', label: 'Clientes corporativos', count: 45 },
      { id: 'mamas', label: 'Mamás', count: 88 },
      { id: 'estudiantes', label: 'Estudiantes', count: 165 },
      { id: 'score_alto', label: 'Score de engagement alto (70+)', count: 210 },
      { id: 'score_cayendo', label: 'Score de engagement cayendo (-20% en 30 días)', count: 85 },
      { id: 'ltv_alto', label: 'LTV estimado alto (top 20%)', count: 95 },
      { id: 'tiene_nota_interna', label: 'Clientes con nota interna del staff', count: 68 },
    ],
  },
  canal: {
    label: 'Canal de comunicación',
    icon: 'Send',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    options: [
      { id: 'push_habilitado', label: 'Solo push notifications activas', count: 720 },
      { id: 'email_registrado', label: 'Solo email disponible (sin push)', count: 195 },
      { id: 'whatsapp_vinculado', label: 'Solo WhatsApp disponible', count: 145 },
      { id: 'todos_canales', label: 'Push + Email + WhatsApp disponibles', count: 88 },
      { id: 'sin_canal', label: 'Sin ningún canal activo', count: 210 },
      { id: 'canal_preferido', label: 'Canal preferido detectado por el sistema', count: 540 },
    ],
  },
  actividad_app: {
    label: 'Actividad en la App',
    icon: 'Smartphone',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    options: [
      { id: 'abrio_app_7d', label: 'Abrieron la app en los últimos 7 días', count: 480 },
      { id: 'no_abrio_app_30d', label: 'No abren la app en 30+ días', count: 290 },
      { id: 'abrio_ficha_sin_visitar', label: 'Abrieron la ficha del negocio sin visitar (7 días)', count: 145 },
      { id: 'abrio_push_sin_visitar', label: 'Abrieron un push del negocio sin visitar', count: 88 },
      { id: 'app_abierta_ultimo_push', label: 'Tenían la app abierta al recibir el último push', count: 65 },
    ],
  },
  gasto: {
    label: 'Historial de Gasto',
    icon: 'DollarSign',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    options: [
      { id: 'ticket_alto', label: 'Ticket promedio alto (> $300 MXN configurable)', count: 185 },
      { id: 'ticket_bajo', label: 'Ticket promedio bajo (< $100 MXN)', count: 220 },
      { id: 'gasto_total_alto', label: 'Gasto total acumulado > $5,000 MXN', count: 95 },
      { id: 'gasto_cayendo', label: 'Gasto cayendo en los últimos 3 meses', count: 120 },
    ],
  },
  puntos: {
    label: 'Puntos y Recompensas',
    icon: 'Coins',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    options: [
      { id: 'puntos_80_120', label: 'Saldo de puntos entre 80 y 120 pts', count: 145 },
      { id: 'nunca_canjeo_recompensa', label: 'Nunca han canjeado una recompensa del catálogo', count: 380 },
      { id: 'recompensa_favorita', label: 'Han canjeado la misma recompensa 3+ veces', count: 68 },
      { id: 'puntos_por_vencer', label: 'Puntos vencen en los próximos 30 días', count: 95 },
    ],
  },
};

const TEMPLATE_CATEGORIES = {
  retencion: 'Retención',
  adquisicion: 'Adquisición',
  lealtad: 'Lealtad',
  campanas: 'Campañas',
  personalizada: 'Personalizada',
};

const WIZARD_TABS = [
  { id: 'informacion', label: 'Información', icon: 'FileText' },
  { id: 'filtros', label: 'Filtros', icon: 'Filter' },
  { id: 'configuracion', label: 'Configuración', icon: 'Settings' },
  { id: 'revisar', label: 'Revisar', icon: 'CheckCircle' },
];

// ─── Live Preview Panel ───────────────────────────────────────────────────────

const AudienceLivePreview = ({ form, estimatedCount, channelBreakdown }) => {
  const totalMax = 4890;
  const pct = totalMax > 0 ? Math.min(Math.round((estimatedCount / totalMax) * 100), 100) : 0;
  const barColor = pct < 30 ? 'bg-blue-500' : pct <= 70 ? 'bg-emerald-500' : 'bg-amber-500';
  const barTextColor = pct < 30 ? 'text-blue-600' : pct <= 70 ? 'text-emerald-600' : 'text-amber-600';

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
          <Icon name="Eye" size={15} className="text-primary" />
          Vista previa de audiencia
        </h3>
        <span className="text-xs text-muted-foreground">En tiempo real</span>
      </div>

      <div className="flex gap-4 flex-wrap">
        {/* Audience card */}
        <div className="rounded-2xl overflow-hidden shadow-lg border border-border flex-1 min-w-[220px] max-w-xs bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                <Icon name="Users" size={22} className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-lg leading-tight">
                  {form?.name || 'Nueva plantilla'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {TEMPLATE_CATEGORIES?.[form?.category] || 'Personalizada'}
                </p>
              </div>
            </div>
            <div className="text-center py-3 bg-card rounded-xl mb-3 border border-border">
              <p className="text-3xl font-bold text-primary font-mono">~{estimatedCount?.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-0.5">usuarios estimados</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Alcance del total</span>
                <span className={`font-bold ${barTextColor}`}>{pct}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className={`h-2 rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">{pct < 30 ? 'Audiencia segmentada' : pct <= 70 ? 'Alcance equilibrado' : 'Audiencia amplia — considera refinar'}</p>
            </div>
          </div>
        </div>

        {/* Right side: channel breakdown + filters summary */}
        <div className="flex-1 min-w-[200px] space-y-3">
          {/* Channel breakdown */}
          <div className="bg-card border border-border rounded-xl p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Alcance por canal</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: 'Bell', label: 'Push', count: channelBreakdown?.push, color: 'text-blue-600', bg: 'bg-blue-50' },
                { icon: 'Mail', label: 'Email', count: channelBreakdown?.email, color: 'text-purple-600', bg: 'bg-purple-50' },
                { icon: 'MessageCircle', label: 'WhatsApp', count: channelBreakdown?.whatsapp, color: 'text-green-600', bg: 'bg-green-50' },
                { icon: 'Layers', label: 'Todos', count: channelBreakdown?.all, color: 'text-amber-600', bg: 'bg-amber-50' },
              ]?.map(ch => (
                <div key={ch?.label} className={`flex items-center gap-2 p-2 rounded-lg ${ch?.bg}`}>
                  <Icon name={ch?.icon} size={13} className={ch?.color} />
                  <div>
                    <p className={`text-sm font-bold ${ch?.color}`}>{ch?.count?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{ch?.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active filters summary */}
          <div className="bg-card border border-border rounded-xl p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Filtros activos
              {form?.selectedFilters?.length > 0 && (
                <span className="ml-1.5 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs font-bold">
                  {form?.selectedFilters?.length}
                </span>
              )}
            </p>
            {form?.selectedFilters?.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Sin filtros seleccionados</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {form?.selectedFilters?.slice(0, 4)?.map(filterId => {
                  let label = filterId;
                  for (const cat of Object.values(FILTER_CATEGORIES)) {
                    const opt = cat?.options?.find(o => o?.id === filterId);
                    if (opt) { label = opt?.label; break; }
                  }
                  return (
                    <span key={filterId} className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 truncate max-w-[120px]" title={label}>
                      {label?.length > 20 ? label?.substring(0, 18) + '…' : label}
                    </span>
                  );
                })}
                {form?.selectedFilters?.length > 4 && (
                  <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                    +{form?.selectedFilters?.length - 4} más
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Audience type badge */}
          <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${
            form?.audienceType === 'dynamic' ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'
          }`}>
            <Icon
              name={form?.audienceType === 'dynamic' ? 'Zap' : 'Lock'}
              size={14}
              className={form?.audienceType === 'dynamic' ? 'text-blue-600' : 'text-amber-600'}
            />
            <div>
              <p className={`text-xs font-semibold ${form?.audienceType === 'dynamic' ? 'text-blue-700' : 'text-amber-700'}`}>
                {form?.audienceType === 'dynamic' ? 'Audiencia dinámica' : 'Audiencia estática'}
              </p>
              <p className="text-xs text-muted-foreground">
                {form?.audienceType === 'dynamic' ? 'Se recalcula automáticamente' : 'Lista congelada al guardar'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Wizard Component ────────────────────────────────────────────────────

const AudienceWizard = ({ onSave, onCancel, initialData = null }) => {
  const [activeTab, setActiveTab] = useState('informacion');
  const [form, setForm] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || 'personalizada',
    objective: initialData?.objective || 'campana_push',
    audienceType: initialData?.audienceType || 'dynamic',
    updateFrequency: 'realtime',
    expiry: 'none',
    expiryDate: '',
    preferredChannel: 'todos',
    selectedFilters: initialData?.filters || [],
    groupOperator: 'AND',
    excludedFilters: [],
    tags: initialData?.tags || [],
  });
  const [expandedSections, setExpandedSections] = useState({ relacion: true });
  const [saving, setSaving] = useState(false);

  const currentTabIndex = WIZARD_TABS?.findIndex(t => t?.id === activeTab);
  const canGoPrev = currentTabIndex > 0;
  const canGoNext = currentTabIndex < WIZARD_TABS?.length - 1;

  const toggleFilter = (filterId) => {
    setForm(prev => ({
      ...prev,
      selectedFilters: prev?.selectedFilters?.includes(filterId)
        ? prev?.selectedFilters?.filter(f => f !== filterId)
        : [...prev?.selectedFilters, filterId],
    }));
  };

  const toggleExclude = (filterId) => {
    setForm(prev => ({
      ...prev,
      excludedFilters: prev?.excludedFilters?.includes(filterId)
        ? prev?.excludedFilters?.filter(f => f !== filterId)
        : [...prev?.excludedFilters, filterId],
    }));
  };

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev?.[key] }));
  };

  const estimatedCount = form?.selectedFilters?.length === 0 ? 0 :
    form?.selectedFilters?.reduce((sum, filterId) => {
      for (const cat of Object.values(FILTER_CATEGORIES)) {
        const opt = cat?.options?.find(o => o?.id === filterId);
        if (opt) return sum + opt?.count;
      }
      return sum;
    }, 0);

  const isTooSmall = form?.selectedFilters?.length > 0 && estimatedCount < 10;
  const isTooBig = form?.selectedFilters?.length > 0 && estimatedCount > 5000;

  const channelBreakdown = {
    push: Math.round(estimatedCount * 0.72),
    email: Math.round(estimatedCount * 0.68),
    whatsapp: Math.round(estimatedCount * 0.34),
    all: Math.round(estimatedCount * 0.18),
  };

  const getFilterLabel = (filterId) => {
    for (const cat of Object.values(FILTER_CATEGORIES)) {
      const opt = cat?.options?.find(o => o?.id === filterId);
      if (opt) return opt?.label;
    }
    return filterId;
  };

  const getFilterCatColor = (filterId) => {
    for (const cat of Object.values(FILTER_CATEGORIES)) {
      const opt = cat?.options?.find(o => o?.id === filterId);
      if (opt) return cat?.color;
    }
    return 'text-primary';
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave?.({
        name: form?.name,
        description: form?.description,
        category: form?.category,
        audienceType: form?.audienceType,
        filters: form?.selectedFilters,
        excludedFilters: form?.excludedFilters,
        estimatedCount,
        tags: form?.tags,
      });
    } finally {
      setSaving(false);
    }
  };

  // ─── Step renderers ───────────────────────────────────────────────────────

  const renderInformacionTab = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-foreground mb-0.5">Información de la plantilla</h3>
        <p className="text-sm text-muted-foreground">Dale un nombre claro para identificarla fácilmente.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Nombre de la plantilla <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={form?.name}
            onChange={e => setForm(p => ({ ...p, name: e?.target?.value }))}
            placeholder="Ej: VIPs dormidos con puntos"
            maxLength={40}
            className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <p className="text-xs text-muted-foreground mt-1">{form?.name?.length}/40 caracteres</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Descripción (opcional)</label>
          <textarea
            value={form?.description}
            onChange={e => setForm(p => ({ ...p, description: e?.target?.value }))}
            placeholder="¿Para qué sirve esta audiencia? (máx. 100 caracteres)"
            maxLength={100}
            rows={2}
            className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">{form?.description?.length}/100 caracteres</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Categoría de la plantilla</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(TEMPLATE_CATEGORIES)?.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setForm(p => ({ ...p, category: key }))}
                className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  form?.category === key
                    ? 'border-primary bg-primary/5 text-primary' :'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Objetivo de uso</label>
          <select
            value={form?.objective}
            onChange={e => setForm(p => ({ ...p, objective: e?.target?.value }))}
            className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="campana_push">Campaña de push</option>
            <option value="email_marketing">Email marketing</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="promo_dirigida">Promo dirigida</option>
            <option value="cupon_segmentado">Cupón segmentado</option>
            <option value="analisis">Análisis</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderFiltrosTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground mb-0.5">Selecciona los filtros</h3>
          <p className="text-sm text-muted-foreground">Combina filtros para definir tu audiencia exacta.</p>
        </div>
        {/* AND/OR toggle */}
        <div className="flex items-center gap-1.5 bg-muted rounded-lg p-1">
          {['AND', 'OR']?.map(op => (
            <button
              key={op}
              type="button"
              onClick={() => setForm(p => ({ ...p, groupOperator: op }))}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                form?.groupOperator === op ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {op}
            </button>
          ))}
        </div>
      </div>

      {/* Active filters pills */}
      {form?.selectedFilters?.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">
              {form?.selectedFilters?.length} filtro{form?.selectedFilters?.length !== 1 ? 's' : ''} activo{form?.selectedFilters?.length !== 1 ? 's' : ''} — lógica {form?.groupOperator}
            </p>
            <button
              type="button"
              onClick={() => setForm(p => ({ ...p, selectedFilters: [] }))}
              className="text-xs text-destructive hover:underline"
            >
              Limpiar todo
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {form?.selectedFilters?.map(filterId => (
              <span
                key={filterId}
                className={`flex items-center gap-1 text-xs bg-card ${getFilterCatColor(filterId)} border border-border rounded-full px-2.5 py-1`}
              >
                {getFilterLabel(filterId)?.length > 30
                  ? getFilterLabel(filterId)?.substring(0, 28) + '…'
                  : getFilterLabel(filterId)}
                <button
                  type="button"
                  onClick={() => toggleFilter(filterId)}
                  className="ml-0.5 hover:opacity-70"
                >
                  <Icon name="X" size={10} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filter sections */}
      <div className="space-y-2">
        {Object.entries(FILTER_CATEGORIES)?.map(([key, cat]) => {
          const activeCount = cat?.options?.filter(o => form?.selectedFilters?.includes(o?.id))?.length;
          return (
            <div key={key} className="bg-card border border-border rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection(key)}
                className="w-full flex items-center justify-between p-3.5 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${cat?.bg} rounded-lg flex items-center justify-center`}>
                    <Icon name={cat?.icon} size={15} className={cat?.color} />
                  </div>
                  <span className="font-medium text-foreground text-sm">{cat?.label}</span>
                  {activeCount > 0 && (
                    <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-medium">
                      {activeCount}
                    </span>
                  )}
                </div>
                <Icon name={expandedSections?.[key] ? 'ChevronUp' : 'ChevronDown'} size={15} className="text-muted-foreground" />
              </button>
              {expandedSections?.[key] && (
                <div className="px-3.5 pb-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {cat?.options?.map(opt => (
                    <button
                      key={opt?.id}
                      type="button"
                      onClick={() => toggleFilter(opt?.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border-2 text-left transition-all ${
                        form?.selectedFilters?.includes(opt?.id)
                          ? 'border-primary bg-primary/5' :'border-border hover:border-primary/40 hover:bg-muted/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          form?.selectedFilters?.includes(opt?.id) ? 'bg-primary border-primary' : 'border-border'
                        }`}>
                          {form?.selectedFilters?.includes(opt?.id) && (
                            <Icon name="Check" size={10} className="text-primary-foreground" />
                          )}
                        </div>
                        <span className="text-xs text-foreground leading-tight">{opt?.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground ml-2 flex-shrink-0 font-medium">~{opt?.count?.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Warnings */}
      {isTooSmall && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-2">
          <Icon name="AlertTriangle" size={15} className="text-destructive flex-shrink-0" />
          <p className="text-xs text-destructive">Audiencia muy pequeña. Amplía los filtros para mejores resultados.</p>
        </div>
      )}
      {isTooBig && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
          <Icon name="Info" size={15} className="text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-700">Audiencia muy amplia. Considera agregar más filtros para mejor ROI.</p>
        </div>
      )}
    </div>
  );

  const renderConfiguracionTab = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-foreground mb-0.5">Configuración avanzada</h3>
        <p className="text-sm text-muted-foreground">Define cómo se comportará esta audiencia.</p>
      </div>

      {/* Dynamic vs Static */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
          <Icon name="RefreshCw" size={15} className="text-primary" />
          Tipo de audiencia
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              key: 'dynamic',
              label: 'Dinámica',
              icon: 'Zap',
              desc: 'Se recalcula automáticamente. Los nuevos clientes que cumplan los criterios entran automáticamente.',
              color: 'text-blue-600',
              bg: 'bg-blue-50',
            },
            {
              key: 'static',
              label: 'Estática',
              icon: 'Lock',
              desc: 'Se congela la lista en el momento de guardar. Útil para campañas donde quieres el mismo grupo siempre.',
              color: 'text-amber-600',
              bg: 'bg-amber-50',
            },
          ]?.map(type => (
            <button
              key={type?.key}
              type="button"
              onClick={() => setForm(p => ({ ...p, audienceType: type?.key }))}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                form?.audienceType === type?.key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
              }`}
            >
              <div className={`w-8 h-8 ${type?.bg} rounded-xl flex items-center justify-center mb-2.5`}>
                <Icon name={type?.icon} size={16} className={type?.color} />
              </div>
              <p className="font-semibold text-foreground text-sm mb-1">{type?.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{type?.desc}</p>
              {form?.audienceType === type?.key && (
                <div className="mt-2 flex items-center gap-1 text-primary">
                  <Icon name="CheckCircle" size={13} />
                  <span className="text-xs font-medium">Seleccionado</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Update frequency (only for dynamic) */}
      {form?.audienceType === 'dynamic' && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h4 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
            <Icon name="Clock" size={15} className="text-primary" />
            Frecuencia de actualización
          </h4>
          <div className="space-y-2">
            {[
              { key: 'realtime', label: 'Actualizar en tiempo real', desc: 'Siempre al día' },
              { key: 'daily', label: 'Actualizar diariamente', desc: 'Una vez al día' },
              { key: 'weekly', label: 'Actualizar semanalmente', desc: 'Una vez por semana' },
            ]?.map(opt => (
              <button
                key={opt?.key}
                type="button"
                onClick={() => setForm(p => ({ ...p, updateFrequency: opt?.key }))}
                className={`w-full flex items-center justify-between p-3 rounded-lg border-2 text-left transition-all ${
                  form?.updateFrequency === opt?.key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{opt?.label}</p>
                  <p className="text-xs text-muted-foreground">{opt?.desc}</p>
                </div>
                {form?.updateFrequency === opt?.key && (
                  <Icon name="CheckCircle" size={16} className="text-primary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Vigencia */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h4 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
          <Icon name="Calendar" size={15} className="text-primary" />
          Vigencia de la plantilla
        </h4>
        <div className="space-y-2">
          {[
            { key: 'none', label: 'Sin vencimiento', desc: 'La plantilla siempre estará disponible' },
            { key: 'date', label: 'Vence en una fecha específica', desc: 'Útil para plantillas de temporada' },
          ]?.map(opt => (
            <button
              key={opt?.key}
              type="button"
              onClick={() => setForm(p => ({ ...p, expiry: opt?.key }))}
              className={`w-full flex items-center justify-between p-3 rounded-lg border-2 text-left transition-all ${
                form?.expiry === opt?.key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
              }`}
            >
              <div>
                <p className="text-sm font-medium text-foreground">{opt?.label}</p>
                <p className="text-xs text-muted-foreground">{opt?.desc}</p>
              </div>
              {form?.expiry === opt?.key && (
                <Icon name="CheckCircle" size={16} className="text-primary flex-shrink-0" />
              )}
            </button>
          ))}
          {form?.expiry === 'date' && (
            <input
              type="date"
              value={form?.expiryDate}
              onChange={e => setForm(p => ({ ...p, expiryDate: e?.target?.value }))}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 mt-2"
            />
          )}
        </div>
      </div>

      {/* Canal preferido */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h4 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
          <Icon name="Share2" size={15} className="text-primary" />
          Canal de comunicación preferido
        </h4>
        <select
          value={form?.preferredChannel}
          onChange={e => setForm(p => ({ ...p, preferredChannel: e?.target?.value }))}
          className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="push">Push notifications</option>
          <option value="email">Email</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="todos">Todos los disponibles</option>
          <option value="mayor_alcance">El de mayor alcance para cada usuario</option>
        </select>
      </div>

      {/* Exclusion filters */}
      {form?.selectedFilters?.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2 text-sm">
            <Icon name="MinusCircle" size={15} className="text-destructive" />
            Filtros de exclusión
          </h4>
          <p className="text-xs text-muted-foreground mb-3">Excluye clientes que cumplan alguno de los filtros activos.</p>
          <div className="flex flex-wrap gap-2">
            {form?.selectedFilters?.map(filterId => (
              <button
                key={filterId}
                type="button"
                onClick={() => toggleExclude(filterId)}
                className={`flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1 border transition-all ${
                  form?.excludedFilters?.includes(filterId)
                    ? 'bg-destructive/10 border-destructive text-destructive' :'bg-muted border-border text-muted-foreground hover:border-destructive/40'
                }`}
              >
                {form?.excludedFilters?.includes(filterId) && <Icon name="X" size={10} />}
                {getFilterLabel(filterId)?.length > 25
                  ? getFilterLabel(filterId)?.substring(0, 23) + '…'
                  : getFilterLabel(filterId)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
          <Icon name="Hash" size={15} className="text-primary" />
          Etiquetas (opcional)
        </h4>
        <div className="flex flex-wrap gap-2">
          {['reactivación', 'vip', 'cumpleaños', 'puntos', 'push', 'whatsapp', 'urgente', 'temporada']?.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => setForm(p => ({
                ...p,
                tags: p?.tags?.includes(tag) ? p?.tags?.filter(t => t !== tag) : [...p?.tags, tag],
              }))}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                form?.tags?.includes(tag)
                  ? 'bg-primary/10 border-primary text-primary' :'bg-muted border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRevisarTab = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-foreground mb-0.5">Revisar y guardar</h3>
        <p className="text-sm text-muted-foreground">Confirma los detalles antes de guardar la plantilla.</p>
      </div>

      {/* Summary card */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-bold text-foreground text-base">{form?.name || 'Sin nombre'}</h4>
            {form?.description && <p className="text-sm text-muted-foreground mt-0.5">{form?.description}</p>}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
              {TEMPLATE_CATEGORIES?.[form?.category]}
            </span>
            <span className={`text-xs rounded-full px-2 py-0.5 ${
              form?.audienceType === 'dynamic' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {form?.audienceType === 'dynamic' ? '⚡ Dinámica' : '🔒 Estática'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
          <div className="text-center p-3 bg-primary/5 rounded-xl">
            <p className="text-2xl font-bold text-primary">~{estimatedCount?.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">usuarios estimados</p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-xl">
            <p className="text-2xl font-bold text-foreground">{form?.selectedFilters?.length}</p>
            <p className="text-xs text-muted-foreground">filtros activos</p>
          </div>
        </div>

        {/* Filters list */}
        {form?.selectedFilters?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Filtros incluidos</p>
            <div className="flex flex-wrap gap-1.5">
              {form?.selectedFilters?.map(filterId => (
                <span key={filterId} className={`text-xs bg-primary/10 ${getFilterCatColor(filterId)} border border-primary/20 rounded-full px-2.5 py-1`}>
                  {getFilterLabel(filterId)}
                </span>
              ))}
            </div>
          </div>
        )}

        {form?.excludedFilters?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Filtros excluidos</p>
            <div className="flex flex-wrap gap-1.5">
              {form?.excludedFilters?.map(filterId => (
                <span key={filterId} className="text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-full px-2.5 py-1">
                  ✕ {getFilterLabel(filterId)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Channel breakdown */}
        {estimatedCount > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Alcance por canal</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: 'Bell', label: 'Push', count: channelBreakdown?.push, color: 'text-blue-600 bg-blue-50' },
                { icon: 'Mail', label: 'Email', count: channelBreakdown?.email, color: 'text-purple-600 bg-purple-50' },
                { icon: 'MessageCircle', label: 'WhatsApp', count: channelBreakdown?.whatsapp, color: 'text-green-600 bg-green-50' },
                { icon: 'Layers', label: 'Todos los canales', count: channelBreakdown?.all, color: 'text-amber-600 bg-amber-50' },
              ]?.map(ch => (
                <div key={ch?.label} className={`flex items-center gap-2 p-2.5 rounded-lg ${ch?.color?.split(' ')?.[1]}`}>
                  <Icon name={ch?.icon} size={14} className={ch?.color?.split(' ')?.[0]} />
                  <div>
                    <p className={`text-sm font-bold ${ch?.color?.split(' ')?.[0]}`}>{ch?.count?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{ch?.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {form?.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
            {form?.tags?.map(tag => (
              <span key={tag} className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
        <Icon name="CheckCircle" size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-emerald-700">Listo para guardar</p>
          <p className="text-xs text-emerald-600 mt-0.5">
            La plantilla quedará disponible en "Mis Plantillas" y podrás usarla en cualquier campaña.
          </p>
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'informacion': return renderInformacionTab();
      case 'filtros': return renderFiltrosTab();
      case 'configuracion': return renderConfiguracionTab();
      case 'revisar': return renderRevisarTab();
      default: return renderInformacionTab();
    }
  };

  const canProceedFromCurrent = () => {
    if (activeTab === 'informacion') return form?.name?.trim()?.length > 0;
    if (activeTab === 'filtros') return form?.selectedFilters?.length > 0;
    return true;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm mb-4">
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
          Constructor de Audiencia
        </button>
        <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
        <span className="text-foreground font-medium">
          {initialData ? 'Editar plantilla' : 'Nueva plantilla de audiencia'}
        </span>
      </nav>
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {initialData ? 'Editar plantilla de audiencia' : 'Nueva plantilla de audiencia'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {initialData ? 'Actualiza los filtros y configuración de la plantilla' : 'Define los criterios de segmentación para esta audiencia reutilizable'}
          </p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
      {/* ── LIVE PREVIEW ── */}
      <div className="mb-5">
        <AudienceLivePreview
          form={form}
          estimatedCount={estimatedCount}
          channelBreakdown={channelBreakdown}
        />
      </div>
      {/* ── WIZARD FORM ── */}
      <div>
        {/* ── WIZARD PROGRESS BAR ── */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">Progreso del wizard</span>
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                {WIZARD_TABS?.find(t => t?.id === activeTab)?.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:block">
                Paso {currentTabIndex + 1} de {WIZARD_TABS?.length}
              </span>
              <span className="text-sm font-bold text-primary">
                {Math.round(((currentTabIndex + 1) / WIZARD_TABS?.length) * 100)}%
              </span>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mb-4">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.round(((currentTabIndex + 1) / WIZARD_TABS?.length) * 100)}%` }}
            />
          </div>
          {/* Step indicators with icons, connectors and labels */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {WIZARD_TABS?.map((tab, idx) => {
              const isActive = activeTab === tab?.id;
              const isPast = idx < currentTabIndex;
              return (
                <React.Fragment key={tab?.id}>
                  <button
                    type="button"
                    onClick={() => isPast && setActiveTab(tab?.id)}
                    title={tab?.label}
                    className={`flex flex-col items-center gap-1 min-w-[64px] p-2 rounded-xl transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : isPast
                        ? 'text-green-600 hover:bg-green-50 cursor-pointer' :'text-muted-foreground cursor-default'
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
                    <span className="text-xs font-medium text-center leading-tight whitespace-nowrap">{tab?.label}</span>
                  </button>
                  {idx < WIZARD_TABS?.length - 1 && (
                    <div className={`flex-1 h-0.5 min-w-[6px] rounded-full transition-colors ${
                      isPast ? 'bg-green-400' : 'bg-border'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ── WIZARD FORM CONTENT ── */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-6">
            {renderActiveTab()}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-border">
              <button
                type="button"
                onClick={() => canGoPrev && setActiveTab(WIZARD_TABS?.[currentTabIndex - 1]?.id)}
                disabled={!canGoPrev}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  canGoPrev
                    ? 'text-foreground hover:bg-muted'
                    : 'text-muted-foreground cursor-not-allowed opacity-40'
                }`}
              >
                <Icon name="ChevronLeft" size={16} />
                Anterior
              </button>

              {/* Dot progress indicator */}
              <div className="flex items-center gap-1">
                {WIZARD_TABS?.map((tab, idx) => {
                  const isActive = activeTab === tab?.id;
                  const isPast = currentTabIndex > idx;
                  return (
                    <button
                      key={tab?.id}
                      type="button"
                      onClick={() => setActiveTab(tab?.id)}
                      title={tab?.label}
                      className={`rounded-full transition-all ${
                        isActive ? 'w-6 h-2 bg-primary' : isPast ? 'w-2 h-2 bg-green-500' : 'w-2 h-2 bg-muted hover:bg-muted-foreground'
                      }`}
                    />
                  );
                })}
              </div>

              {canGoNext ? (
                <button
                  type="button"
                  onClick={() => canProceedFromCurrent() && setActiveTab(WIZARD_TABS?.[currentTabIndex + 1]?.id)}
                  disabled={!canProceedFromCurrent()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    canProceedFromCurrent()
                      ? 'bg-primary text-white hover:bg-primary/90' :'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                  }`}
                >
                  Siguiente
                  <Icon name="ChevronRight" size={16} />
                </button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving || !form?.name?.trim()}
                    iconName={saving ? 'Loader2' : 'Save'}
                    iconPosition="left"
                  >
                    {saving ? 'Guardando...' : 'Guardar plantilla'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudienceWizard;
