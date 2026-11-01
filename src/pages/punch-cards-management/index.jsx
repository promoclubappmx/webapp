import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { fetchPunchCards, updatePunchCard, createPunchCard, pointsToMXN } from '../../services/rewardsService';
import PunchCardVisualDesigner from './components/PunchCardVisualDesigner';
import PunchCardsAnalytics from './components/PunchCardsAnalytics';


const STAMP_ICONS = [
  { id: 'circle', icon: '⭕' }, { id: 'star', icon: '⭐' }, { id: 'heart', icon: '❤️' },
  { id: 'diamond', icon: '💎' }, { id: 'flame', icon: '🔥' }, { id: 'lightning', icon: '⚡' },
  { id: 'leaf', icon: '🍃' }, { id: 'crown', icon: '👑' }, { id: 'coffee', icon: '☕' },
  { id: 'pizza', icon: '🍕' }, { id: 'scissors', icon: '✂️' }, { id: 'dumbbell', icon: '🏋️' },
  { id: 'bag', icon: '🛍️' }, { id: 'footprint', icon: '👣' }, { id: 'gift', icon: '🎁' }, { id: 'gem', icon: '💍' },
];
const getStampIcon = (id) => STAMP_ICONS?.find(s => s?.id === id)?.icon || '⭐';

const getStatusBadge = (status, isSeasonal) => {
  if (isSeasonal) return { label: 'Estacional', cls: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' };
  const map = {
    active: { label: 'Activa', cls: 'bg-success/10 text-success border-success/20' },
    draft: { label: 'Borrador', cls: 'bg-muted/50 text-muted-foreground border-border' },
    paused: { label: 'Pausada', cls: 'bg-warning/10 text-warning border-warning/20' },
    expired: { label: 'Vencida', cls: 'bg-destructive/10 text-destructive border-destructive/20' },
  };
  return map?.[status] || map?.draft;
};

const PunchCardGrid = ({ cards, loading, onCreateNew, onEdit, onDesign, onToggle, onDuplicate, onAnalytics, selectedEstablishment }) => {
  const [filter, setFilter] = useState('all');
  const [selectedCards, setSelectedCards] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);

  const [activeCount, setActiveCount] = useState(0);

  const filters = [
    { id: 'all', label: 'Todas', count: cards?.length },
    { id: 'active', label: 'Activas', count: cards?.filter(c => c?.status === 'active')?.length },
    { id: 'draft', label: 'Borradores', count: cards?.filter(c => c?.status === 'draft')?.length },
    { id: 'paused', label: 'Pausadas', count: cards?.filter(c => c?.status === 'paused')?.length },
    { id: 'expired', label: 'Archivadas', count: cards?.filter(c => c?.status === 'expired')?.length },
  ];

  const filteredCards = filter === 'all' ? cards : cards?.filter(c => c?.status === filter);

  const toggleSelect = (id) => {
    setSelectedCards(prev => prev?.includes(id) ? prev?.filter(x => x !== id) : [...prev, id]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Icon name="Loader2" size={32} className="text-primary animate-spin" />
        <span className="ml-3 text-muted-foreground">Cargando tarjetas de sello...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Filter pills + button in same row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters?.map(f => (
            <button
              key={f?.id}
              type="button"
              onClick={() => setFilter(f?.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === f?.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {f?.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f?.id ? 'bg-white/20' : 'bg-muted-foreground/20'}`}>
                {f?.count}
              </span>
            </button>
          ))}
        </div>
        <Button onClick={onCreateNew} className="shrink-0">
          <Icon name="Plus" size={15} className="mr-2" />
          Nueva Tarjeta de Sello
        </Button>
      </div>

      {/* Bulk actions */}
      {selectedCards?.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
          <span className="text-sm font-medium text-primary">{selectedCards?.length} seleccionadas</span>
          <Button variant="outline" size="sm" onClick={() => setSelectedCards([])}>Cancelar</Button>
          <Button variant="outline" size="sm">Pausar seleccionadas</Button>
          <Button variant="outline" size="sm">Archivar seleccionadas</Button>
        </div>
      )}

      {/* Empty state */}
      {cards?.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎴</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Aún no tienes tarjetas de sello</h3>
          <p className="text-muted-foreground mb-2 max-w-md mx-auto">
            Las tarjetas de sello premian a tus clientes frecuentes con recompensas tangibles. Los negocios con tarjetas de sello activas tienen <strong>2.4× más visitas repetidas</strong>.
          </p>
          <p className="text-sm text-muted-foreground mb-6">¿No sabes por dónde empezar? Elige un template según tu tipo de negocio.</p>
          <Button onClick={onCreateNew}>
            <Icon name="Plus" size={15} className="mr-2" />
            Crear mi primera Tarjeta de Sello
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCards?.map(card => {
            const stampIcon = getStampIcon(card?.stamp_icon);
            const statusBadge = getStatusBadge(card?.status, card?.is_seasonal);
            const bgStyle = card?.card_gradient_type === 'gradient' && card?.card_color_secondary
              ? { background: `linear-gradient(135deg, ${card?.card_color || '#7C3AED'}, ${card?.card_color_secondary})` }
              : { background: card?.card_color || '#7C3AED' };
            const isSelected = selectedCards?.includes(card?.id);

            return (
              <div
                key={card?.id}
                className={`bg-card border-2 rounded-2xl overflow-hidden hover:shadow-lg transition-all ${isSelected ? 'border-primary' : 'border-border'}`}
              >
                {/* Card Header - Visual Preview */}
                <div className="p-5 text-white relative" style={bgStyle}>
                  <div className="absolute top-3 left-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(card?.id)}
                      className="w-4 h-4 rounded"
                      onClick={e => e?.stopPropagation()}
                    />
                  </div>
                  <div className="flex items-start justify-between pt-2">
                    <div>
                      <p className="text-xs opacity-60">Tarjeta de Sello</p>
                      <h4 className="font-bold text-base leading-tight">{card?.name}</h4>
                      {card?.description && <p className="text-xs opacity-70 mt-0.5">{card?.description}</p>}
                    </div>
                    <span className="text-3xl">{stampIcon}</span>
                  </div>
                  <div className="flex gap-1 mt-3 flex-wrap">
                    {Array.from({ length: Math.min(card?.stamp_count || 8, 10) })?.map((_, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full border border-white/40 flex items-center justify-center"
                        style={{ background: i < 3 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)' }}
                      >
                        {i < 3 && <span style={{ fontSize: '10px' }}>{stampIcon}</span>}
                      </div>
                    ))}
                    {(card?.stamp_count || 8) > 10 && <span className="text-xs opacity-70">+{(card?.stamp_count || 8) - 10}</span>}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge?.cls}`}>
                      {statusBadge?.label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {/* Stamp rule badge */}
                      <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                        {card?.stamp_rule === 'visit' ? '📍 Por visita' : card?.stamp_rule === 'amount' ? `💵 $${card?.stamp_amount}+` : `🏷️ Producto`}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">
                    {card?.stamp_count} sellos → {card?.reward_value || 'Premio'}
                    {card?.reward_type === 'points' && card?.reward_points && ` (+${card?.reward_points} pts = $${pointsToMXN(card?.reward_points)} MXN)`}
                  </p>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{card?.active_clients || 0}</p>
                      <p className="text-xs text-muted-foreground">Activas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-primary">{card?.avg_progress || 0}</p>
                      <p className="text-xs text-muted-foreground">Avg sellos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-success">{card?.completion_rate || 0}%</p>
                      <p className="text-xs text-muted-foreground">Completan</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 pt-3 border-t border-border relative">
                    <button
                      type="button"
                      onClick={() => onEdit(card)}
                      className="flex-1 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Icon name="Pencil" size={12} />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDesign(card)}
                      className="flex-1 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Icon name="Palette" size={12} />
                      Diseño
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggle(card)}
                      className="flex-1 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Icon name={card?.status === 'active' ? 'Pause' : 'Play'} size={12} />
                      {card?.status === 'active' ? 'Pausar' : 'Activar'}
                    </button>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setMenuOpen(menuOpen === card?.id ? null : card?.id)}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                      >
                        <Icon name="MoreHorizontal" size={14} />
                      </button>
                      {menuOpen === card?.id && (
                        <div className="absolute right-0 bottom-8 bg-card border border-border rounded-xl shadow-lg z-10 w-40 py-1">
                          <button
                            type="button"
                            onClick={() => { onAnalytics(card); setMenuOpen(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                          >
                            <Icon name="BarChart3" size={13} />
                            Ver analytics
                          </button>
                          <button
                            type="button"
                            onClick={() => { setMenuOpen(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                          >
                            <Icon name="Copy" size={13} />
                            Duplicar
                          </button>
                          <button
                            type="button"
                            onClick={() => setMenuOpen(null)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-muted transition-colors"
                          >
                            <Icon name="Archive" size={13} />
                            Archivar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Create new card */}
          <button
            type="button"
            onClick={onCreateNew}
            className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all min-h-[280px] border-border hover:border-primary hover:bg-primary/5 cursor-pointer"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="Plus" size={22} className="text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">Nueva Tarjeta de Sello</p>
            <p className="text-xs text-muted-foreground text-center">Crea una nueva tarjeta de sellos para tu negocio</p>
          </button>
        </div>
      )}
    </div>
  );
};

const GlobalConfigTab = ({ cards }) => {
  const [compatibilityGlobal, setCompatibilityGlobal] = useState(true);
  const [notifTexts, setNotifTexts] = useState({
    day14: 'Tu tarjeta {nombre_tarjeta} en {negocio} vence en 14 días. Llevas {sellos_actuales} de {sellos_total} sellos. ¡No la dejes ir!',
    day7: 'Tu tarjeta {nombre_tarjeta} vence en 7 días. ¡Visítanos pronto!',
    day1: '¡Último día! Tu tarjeta {nombre_tarjeta} vence mañana.',
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Compatibilidad Global</h3>
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
          <div>
            <p className="font-medium text-foreground text-sm">Compatibilidad entre tarjetas activas</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {compatibilityGlobal
                ? 'Un check-in puede avanzar múltiples tarjetas simultáneamente' :'Solo avanza la tarjeta de mayor prioridad (orden en el grid)'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCompatibilityGlobal(!compatibilityGlobal)}
            className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${compatibilityGlobal ? 'bg-primary' : 'bg-muted'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${compatibilityGlobal ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
        {!compatibilityGlobal && cards?.length > 1 && (
          <div className="mt-3 p-3 bg-muted/30 rounded-xl">
            <p className="text-xs font-medium text-foreground mb-2">Orden de prioridad (arrastra para reordenar)</p>
            <div className="space-y-2">
              {cards?.filter(c => c?.status === 'active')?.map((card, i) => (
                <div key={card?.id} className="flex items-center gap-2 p-2 bg-card rounded-lg border border-border">
                  <Icon name="GripVertical" size={14} className="text-muted-foreground" />
                  <span className="w-5 h-5 bg-primary/10 text-primary text-xs rounded-full flex items-center justify-center font-bold">{i + 1}</span>
                  <span className="text-sm text-foreground">{card?.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Notificaciones de Vencimiento</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Variables disponibles: <code className="bg-muted px-1 rounded text-xs">{'{nombre_cliente}'}</code> <code className="bg-muted px-1 rounded text-xs">{'{nombre_tarjeta}'}</code> <code className="bg-muted px-1 rounded text-xs">{'{sellos_actuales}'}</code> <code className="bg-muted px-1 rounded text-xs">{'{sellos_total}'}</code> <code className="bg-muted px-1 rounded text-xs">{'{dias_restantes}'}</code> <code className="bg-muted px-1 rounded text-xs">{'{negocio}'}</code>
        </p>
        <div className="space-y-4">
          {[
            { key: 'day14', label: '14 días antes', icon: '📅' },
            { key: 'day7', label: '7 días antes', icon: '⏰' },
            { key: 'day1', label: '1 día antes', icon: '🚨' },
          ]?.map(n => (
            <div key={n?.key}>
              <label className="block text-sm font-medium text-foreground mb-1">{n?.icon} {n?.label}</label>
              <textarea
                value={notifTexts?.[n?.key]}
                onChange={e => setNotifTexts(p => ({ ...p, [n?.key]: e?.target?.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button size="sm">
            <Icon name="Save" size={14} className="mr-1.5" />
            Guardar configuración
          </Button>
        </div>
      </div>
    </div>
  );
};

const PunchCardsManagement = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('cards');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [designCard, setDesignCard] = useState(null);
  const [analyticsCard, setAnalyticsCard] = useState(null);
  const { user } = useAuth();

  // Establishments
  const [establishments, setEstablishments] = useState([]);
  const [loadingEstablishments, setLoadingEstablishments] = useState(false);
  const [selectedEstablishment, setSelectedEstablishment] = useState('all');

  const userDisplay = {
    name: user?.user_metadata?.full_name || user?.email || 'Usuario',
    email: user?.email || '',
    role: user?.user_metadata?.role || 'owner',
  };

  // Load establishments
  useEffect(() => {
    const fetchEstablishments = async () => {
      if (!user?.id) return;
      setLoadingEstablishments(true);
      try {
        const { data: profile } = await supabase
          ?.from('user_profiles')
          ?.select('user_id')
          ?.eq('id', user?.id)
          ?.single();
        const businessId = profile?.user_id || user?.id;
        const { data } = await supabase
          ?.from('business_locations')
          ?.select('id, location_name, location_code, is_active')
          ?.eq('business_id', businessId)
          ?.eq('is_active', true)
          ?.order('location_name', { ascending: true });
        setEstablishments(data || []);
      } catch (err) {
        console.error('Error loading establishments:', err);
      } finally {
        setLoadingEstablishments(false);
      }
    };
    fetchEstablishments();
  }, [user?.id]);

  const loadCards = async () => {
    if (!user?.id) { setLoading(false); return; }
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPunchCards(user?.id);
      setCards(data || []);
    } catch (err) {
      console.error('Error loading tarjetas de sello:', err);
      setError(err?.message || 'Error al cargar las tarjetas de sello');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, [user?.id]);

  const handleToggle = async (card) => {
    try {
      const newStatus = card?.status === 'active' ? 'paused' : 'active';
      await updatePunchCard(card?.id, { status: newStatus });
      setCards(prev => prev?.map(c => c?.id === card?.id ? { ...c, status: newStatus } : c));
    } catch (err) {
      console.error('Error toggling tarjeta de sello:', err);
    }
  };

  const activeCount = cards?.filter(c => c?.status === 'active')?.length;
  const totalClients = cards?.reduce((sum, c) => sum + (c?.active_clients || 0), 0);
  const avgCompletion = cards?.length > 0
    ? Math.round(cards?.reduce((sum, c) => sum + (c?.completion_rate || 0), 0) / cards?.length)
    : 0;

  const selectedEstablishmentName = selectedEstablishment === 'all' ?'Todos los establecimientos'
    : establishments?.find(e => e?.id === selectedEstablishment)?.location_name || '';

  const tabs = [
    { id: 'cards', label: 'Mis Tarjetas', icon: 'CreditCard' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
  ];

  const mainClasses = `pt-16 transition-all duration-500 ease-in-out relative z-10 ${
    isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
  }`;

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} user={userDisplay} />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={userDisplay}
        onCollapse={setIsSidebarCollapsed}
      />
      <main className={mainClasses}>
        <div className="p-6 max-w-[1920px] mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tarjeta de Sellos</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Tarjetas de sellos digitales para fidelizar clientes con recompensas tangibles</p>
            </div>
            {cards?.length > 0 && (
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Icon name="CreditCard" size={14} className="text-primary" />
                  <strong className="text-foreground">{activeCount}</strong> tarjetas activas
                </span>
                <span className="text-border">·</span>
                <span className="flex items-center gap-1.5">
                  <Icon name="Users" size={14} className="text-primary" />
                  <strong className="text-foreground">{totalClients?.toLocaleString()}</strong> clientes con tarjeta
                </span>
                <span className="text-border">·</span>
                <span className="flex items-center gap-1.5">
                  <Icon name="TrendingUp" size={14} className="text-primary" />
                  <strong className="text-foreground">{avgCompletion}%</strong> tasa de completitud
                </span>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
              <Icon name="AlertCircle" size={16} className="text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
              <button type="button" onClick={loadCards} className="ml-auto text-xs text-destructive underline">Reintentar</button>
            </div>
          )}

          {/* Establishment Selector */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Icon name="Building2" size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Establecimiento</span>
              {loadingEstablishments && (
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
                  {est?.location_name}
                  {est?.location_code && (
                    <span className="ml-1.5 opacity-70 text-xs">({est?.location_code})</span>
                  )}
                </button>
              ))}
              {!loadingEstablishments && establishments?.length === 0 && (
                <p className="text-sm text-muted-foreground">No hay establecimientos registrados</p>
              )}
            </div>
            {selectedEstablishment !== 'all' && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Icon name="Info" size={12} />
                Mostrando tarjetas de sello de: <span className="font-medium text-foreground ml-1">{selectedEstablishmentName}</span>
              </p>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-border">
            <nav className="flex gap-0 -mb-px">
              {tabs?.map(tab => (
                <button
                  key={tab?.id}
                  type="button"
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
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

          {/* Tab Content */}
          {activeTab === 'cards' && (
            <PunchCardGrid
              cards={cards}
              loading={loading}
              onCreateNew={() => navigate('/punch-cards-management/new')}
              onEdit={(card) => navigate('/punch-cards-management/new', { state: { editCard: card } })}
              onDesign={(card) => setDesignCard(card)}
              onToggle={handleToggle}
              selectedEstablishment={selectedEstablishment}
              onDuplicate={async (card) => {
                try {
                  await createPunchCard(user?.id, {
                    name: `${card?.name} (Copia)`,
                    stampIcon: card?.stamp_icon,
                    cardColor: card?.card_color,
                    stampRule: card?.stamp_rule,
                    stampAmount: card?.stamp_amount,
                    stampProduct: card?.stamp_product,
                    stampCount: card?.stamp_count,
                    rewardType: card?.reward_type,
                    rewardValue: card?.reward_value,
                    validityType: card?.validity_type,
                    validityDays: card?.validity_days,
                    autoRenew: card?.auto_renew,
                    showProgress: card?.show_progress,
                    status: 'draft',
                  });
                  await loadCards();
                } catch (err) {
                  console.error('Error duplicating:', err);
                }
              }}
              onAnalytics={(card) => setAnalyticsCard(card)}
            />
          )}
          {activeTab === 'analytics' && (
            <PunchCardsAnalytics cards={cards} />
          )}
        </div>
      </main>

      {/* Modals */}
      {designCard && (
        <PunchCardVisualDesigner
          card={designCard}
          onClose={() => setDesignCard(null)}
          onSaved={() => { setDesignCard(null); loadCards(); }}
        />
      )}
    </div>
  );
};

export default PunchCardsManagement;
