import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useCurrency } from '../../contexts/CurrencyContext';
import { supabase } from '../../lib/supabase';

const Section = ({ title, icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden mb-4">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-card hover:bg-muted/40 transition-colors">
        <div className="flex items-center gap-3">
          <Icon name={icon} size={18} className="text-primary" />
          <span className="font-semibold text-foreground">{title}</span>
        </div>
        <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground" />
      </button>
      {open && <div className="px-5 py-4 bg-card border-t border-border">{children}</div>}
    </div>
  );
};

const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-start justify-between gap-4 py-2">
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
    <button onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const PrepaidPromoPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { formatPrice } = useCurrency();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [estimatedClients, setEstimatedClients] = useState(50);

  const [promo, setPromo] = useState({
    name: 'Promo de Recarga',
    tiers: [
      { reloadAmount: 200, bonus: 20 },
      { reloadAmount: 500, bonus: 100 },
      { reloadAmount: 1000, bonus: 300 },
    ],
    businessMargin: 40,
    startDate: '',
    endDate: '',
    isPermanent: false,
    urgencyMessage: '',
    limitPerUser: true,
    usesPerTier: 1,
    limitTotal: false,
    totalLimit: 100,
    showInBusinessProfile: true,
    showInWallet: true,
    sendPushToClients: false,
  });

  const user = { name: 'Carlos Mendoza', email: 'carlos@promospot.mx', role: 'owner' };
  const update = (field, value) => setPromo(prev => ({ ...prev, [field]: value }));

  const addTier = () => {
    if (promo?.tiers?.length >= 5) return;
    update('tiers', [...promo?.tiers, { reloadAmount: 300, bonus: 30 }]);
  };

  const removeTier = (idx) => update('tiers', promo?.tiers?.filter((_, i) => i !== idx));

  const updateTier = (idx, field, value) => {
    const updated = [...promo?.tiers];
    updated[idx] = { ...updated?.[idx], [field]: parseFloat(value) || 0 };
    update('tiers', updated);
  };

  const calcRealCost = (bonus) => {
    return bonus * (1 - promo?.businessMargin / 100);
  };

  const handleSave = async (status = 'draft') => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload = {
        business_id: 'demo-business',
        name: promo?.name,
        tiers: promo?.tiers,
        business_margin_pct: promo?.businessMargin,
        start_date: promo?.startDate || null,
        end_date: promo?.endDate || null,
        is_permanent: promo?.isPermanent,
        urgency_message: promo?.urgencyMessage,
        limit_per_user: promo?.limitPerUser,
        uses_per_tier: promo?.usesPerTier,
        limit_total: promo?.limitTotal,
        total_limit: promo?.totalLimit,
        show_in_business_profile: promo?.showInBusinessProfile,
        show_in_wallet: promo?.showInWallet,
        send_push_to_clients: promo?.sendPushToClients,
        status,
        updated_at: new Date()?.toISOString(),
      };
      const { error } = await supabase?.from('prepaid_reload_promos')?.upsert(payload);
      if (error) throw error;
      navigate('/gift-cards-management/prepaid');
    } catch (err) {
      setSaveError(err?.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Analysis calculations for the biggest tier
  const biggestTier = promo?.tiers?.reduce((max, t) => t?.reloadAmount > max?.reloadAmount ? t : max, promo?.tiers?.[0] || { reloadAmount: 0, bonus: 0 });
  const totalCashIn = estimatedClients * biggestTier?.reloadAmount;
  const totalBonusCost = estimatedClients * calcRealCost(biggestTier?.bonus);
  const futureVisitsValue = estimatedClients * (biggestTier?.reloadAmount + biggestTier?.bonus);

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
              <Button variant="ghost" size="icon" onClick={() => navigate('/gift-cards-management/prepaid')}>
                <Icon name="ArrowLeft" size={18} />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{id ? 'Editar Promo de Recarga' : 'Nueva Promo de Recarga'}</h1>
                <p className="text-xs text-muted-foreground">Funcionalidad #79 — Promoción de Prepago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate('/gift-cards-management/prepaid')}>Cancelar</Button>
              <Button variant="outline" onClick={() => handleSave('draft')} loading={isSaving} iconName="Save" iconPosition="left">Guardar borrador</Button>
              <Button onClick={() => handleSave('active')} loading={isSaving} iconName="Zap" iconPosition="left">Activar promo</Button>
            </div>
          </div>

          {saveError && (
            <div className="mx-6 mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">{saveError}</div>
          )}

          <div className="flex">
            {/* Left: Form */}
            <div className="flex-1 overflow-y-auto p-6 border-r border-border" style={{ flexBasis: '60%' }}>
              <div className="max-w-2xl">
                <div className="mt-4 mb-4">
                  <label className="text-sm font-medium text-foreground mb-1 block">Nombre de la promoción</label>
                  <input type="text" value={promo?.name} onChange={(e) => update('name', e?.target?.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>

                {/* Tiers */}
                <Section title="Tiers de Bonus" icon="TrendingUp" defaultOpen={true}>
                  <div className="space-y-4">
                    {/* Margin slider */}
                    <div className="bg-muted/40 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-foreground">Margen promedio de tu negocio</label>
                        <span className="text-primary font-bold text-lg">{promo?.businessMargin}%</span>
                      </div>
                      <input type="range" min={20} max={80} value={promo?.businessMargin} onChange={(e) => update('businessMargin', parseInt(e?.target?.value))} className="w-full accent-primary" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>20%</span><span>Mientras más alto tu margen, más barato es ofrecer bonus</span><span>80%</span>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            {['Recarga ($)','Bonus ($)','Total recibe','Costo real est.','']?.map(h => (
                              <th key={h} className="text-left pb-2 text-xs font-medium text-muted-foreground pr-3">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {promo?.tiers?.map((tier, idx) => (
                            <tr key={idx}>
                              <td className="py-2 pr-3">
                                <input type="number" min="50" value={tier?.reloadAmount} onChange={(e) => updateTier(idx, 'reloadAmount', e?.target?.value)} className="w-24 h-8 rounded border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
                              </td>
                              <td className="py-2 pr-3">
                                <input type="number" min="1" value={tier?.bonus} onChange={(e) => updateTier(idx, 'bonus', e?.target?.value)} className="w-20 h-8 rounded border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
                              </td>
                              <td className="py-2 pr-3">
                                <span className="text-sm font-bold text-success">
                                  {formatPrice ? formatPrice(tier?.reloadAmount + tier?.bonus) : `$${tier?.reloadAmount + tier?.bonus}`}
                                </span>
                              </td>
                              <td className="py-2 pr-3">
                                <span className="text-xs text-muted-foreground">
                                  ~{formatPrice ? formatPrice(calcRealCost(tier?.bonus)) : `$${calcRealCost(tier?.bonus)?.toFixed(0)}`}
                                </span>
                              </td>
                              <td className="py-2">
                                <button onClick={() => removeTier(idx)} className="text-muted-foreground hover:text-destructive">
                                  <Icon name="X" size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button onClick={addTier} disabled={promo?.tiers?.length >= 5} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 disabled:opacity-40 font-medium">
                      <Icon name="Plus" size={14} /> Agregar tier
                    </button>
                  </div>
                </Section>

                {/* Vigencia */}
                <Section title="Vigencia" icon="Calendar" defaultOpen={false}>
                  <div className="space-y-4">
                    <Toggle checked={promo?.isPermanent} onChange={(v) => update('isPermanent', v)} label="Promo permanente" description="Sin fecha de fin, disponible indefinidamente" />
                    {!promo?.isPermanent && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">Fecha de inicio</label>
                          <input type="date" value={promo?.startDate} onChange={(e) => update('startDate', e?.target?.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">Fecha de fin</label>
                          <input type="date" value={promo?.endDate} onChange={(e) => update('endDate', e?.target?.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium text-foreground">Mensaje de urgencia</label>
                        <span className="text-xs text-muted-foreground">{promo?.urgencyMessage?.length}/80</span>
                      </div>
                      <input type="text" maxLength={80} value={promo?.urgencyMessage} onChange={(e) => update('urgencyMessage', e?.target?.value)} placeholder='Ej: "¡Últimos 3 días! Recarga con bonus extra"' className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  </div>
                </Section>

                {/* Límites */}
                <Section title="Límites" icon="Shield" defaultOpen={false}>
                  <div className="divide-y divide-border">
                    <div className="py-2">
                      <Toggle checked={promo?.limitPerUser} onChange={(v) => update('limitPerUser', v)} label="Limitar por usuario" description="Controla cuántas veces puede usar la promo cada usuario" />
                      {promo?.limitPerUser && (
                        <div className="mt-2 flex items-center gap-2">
                          <input type="number" min="1" value={promo?.usesPerTier} onChange={(e) => update('usesPerTier', parseInt(e?.target?.value) || 1)} className="w-20 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                          <span className="text-sm text-muted-foreground">veces por tier por usuario</span>
                        </div>
                      )}
                    </div>
                    <div className="py-2">
                      <Toggle checked={promo?.limitTotal} onChange={(v) => update('limitTotal', v)} label="Limitar total de recargas con bonus" description="Genera urgencia al mostrar cuántas quedan disponibles" />
                      {promo?.limitTotal && (
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-2">
                            <input type="number" min="1" value={promo?.totalLimit} onChange={(e) => update('totalLimit', parseInt(e?.target?.value) || 100)} className="w-24 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                            <span className="text-sm text-muted-foreground">recargas con bonus en total</span>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Usadas: 0</span><span>Disponibles: {promo?.totalLimit}</span></div>
                            <div className="w-full bg-muted rounded-full h-2"><div className="bg-primary h-2 rounded-full transition-all" style={{ width: '0%' }} /></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground">
                        {promo?.limitTotal ? 'Con límite total, se genera urgencia cuando quedan pocas disponibles.' : 'Sin límite total, el bonus está disponible para todos tus clientes.'}
                      </p>
                    </div>
                  </div>
                </Section>

                {/* Visibilidad */}
                <Section title="Visibilidad" icon="Eye" defaultOpen={false}>
                  <div className="divide-y divide-border">
                    <Toggle checked={promo?.showInBusinessProfile} onChange={(v) => update('showInBusinessProfile', v)} label="Mostrar en ficha del negocio" description="Aparece como banner en tu perfil de la app B2C" />
                    <div className="pt-2">
                      <Toggle checked={promo?.showInWallet} onChange={(v) => update('showInWallet', v)} label="Mostrar en wallet del usuario" description="Call-to-action de recarga en el wallet de usuarios con tarjeta activa" />
                    </div>
                    <div className="pt-2">
                      <Toggle checked={promo?.sendPushToClients} onChange={(v) => update('sendPushToClients', v)} label="Enviar push a clientes con tarjeta" description="Notificación push a todos los usuarios con tarjeta prepago activa" />
                    </div>
                  </div>
                </Section>

                {/* Análisis */}
                <Section title="Análisis de Costo-Beneficio" icon="BarChart3" defaultOpen={true}>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        ¿Cuántos clientes estimas que usarán la promo?
                      </label>
                      <input type="number" min="1" value={estimatedClients} onChange={(e) => setEstimatedClients(parseInt(e?.target?.value) || 1)} className="w-32 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-5 space-y-3">
                      <h4 className="font-semibold text-foreground">Resumen del escenario</h4>
                      <p className="text-sm text-muted-foreground">
                        Si {estimatedClients} clientes aprovechan la promo del tier de {formatPrice ? formatPrice(biggestTier?.reloadAmount) : `$${biggestTier?.reloadAmount}`}:
                      </p>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center justify-between bg-card rounded-lg p-3">
                          <span className="text-sm text-muted-foreground">Recibes en efectivo hoy</span>
                          <span className="text-lg font-bold text-success">{formatPrice ? formatPrice(totalCashIn) : `$${totalCashIn}`}</span>
                        </div>
                        <div className="flex items-center justify-between bg-card rounded-lg p-3">
                          <span className="text-sm text-muted-foreground">Costo real del bonus (~{promo?.businessMargin}% margen)</span>
                          <span className="text-lg font-bold text-warning">{formatPrice ? formatPrice(totalBonusCost) : `$${totalBonusCost?.toFixed(0)}`}</span>
                        </div>
                        <div className="flex items-center justify-between bg-card rounded-lg p-3">
                          <span className="text-sm text-muted-foreground">Visitas futuras garantizadas</span>
                          <span className="text-lg font-bold text-primary">{formatPrice ? formatPrice(futureVisitsValue) : `$${futureVisitsValue}`}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        A cambio de un costo real de {formatPrice ? formatPrice(totalBonusCost) : `$${totalBonusCost?.toFixed(0)}`}, recibes {formatPrice ? formatPrice(totalCashIn) : `$${totalCashIn}`} en efectivo hoy y generas {formatPrice ? formatPrice(futureVisitsValue) : `$${futureVisitsValue}`} en visitas futuras garantizadas.
                      </p>
                    </div>
                  </div>
                </Section>
              </div>
            </div>

            {/* Right: Preview */}
            <div className="overflow-y-auto p-6 bg-muted/20" style={{ flexBasis: '40%' }}>
              <div className="sticky top-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Icon name="Smartphone" size={16} className="text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">Preview — Como lo ve el usuario</h3>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Promos de Recarga</h4>
                  {promo?.tiers?.map((tier, idx) => (
                    <div key={idx} className="border border-border rounded-xl p-4 hover:border-primary/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Recarga</p>
                          <p className="text-xl font-bold text-foreground">{formatPrice ? formatPrice(tier?.reloadAmount) : `$${tier?.reloadAmount}`}</p>
                        </div>
                        <Icon name="ArrowRight" size={18} className="text-muted-foreground" />
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Recibe</p>
                          <p className="text-xl font-bold text-success">{formatPrice ? formatPrice(tier?.reloadAmount + tier?.bonus) : `$${tier?.reloadAmount + tier?.bonus}`}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full font-medium">
                          +{formatPrice ? formatPrice(tier?.bonus) : `$${tier?.bonus}`} bonus
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({((tier?.bonus / tier?.reloadAmount) * 100)?.toFixed(0)}% extra)
                        </span>
                      </div>
                    </div>
                  ))}
                  {promo?.tiers?.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Agrega tiers para ver el preview</p>
                  )}
                  {promo?.urgencyMessage && (
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                      <p className="text-xs text-warning font-medium">⏰ {promo?.urgencyMessage}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PrepaidPromoPage;
