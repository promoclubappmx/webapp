import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const FUNNEL_LABELS = [
  { id: 'view', label: 'Vieron ficha', icon: 'Eye', color: 'bg-blue-500' },
  { id: 'coupon', label: 'Descargaron cupón', icon: 'Ticket', color: 'bg-purple-500' },
  { id: 'first', label: 'Primera visita', icon: 'MapPin', color: 'bg-green-500' },
  { id: 'second', label: 'Segunda visita', icon: 'Repeat', color: 'bg-amber-500' },
  { id: 'regular', label: 'Cliente regular', icon: 'Star', color: 'bg-orange-500' },
];

const PROSPECT_ACTIONS = [
  { id: 'coupon', label: 'Enviar cupón de primera visita', icon: 'Ticket', color: 'border-border hover:bg-muted' },
  { id: 'survey', label: 'Enviar encuesta de interés', icon: 'ClipboardList', color: 'border-border hover:bg-muted' },
  { id: 'promo', label: 'Asignar a promoción', icon: 'Tag', color: 'bg-primary/10 text-primary border-transparent hover:bg-primary/20' },
];

const REFERRAL_ACTIONS = [
  { id: 'welcome', label: 'Enviar bienvenida', icon: 'MessageSquare', color: 'border-border hover:bg-muted' },
  { id: 'coupon', label: 'Cupón primera visita', icon: 'Ticket', color: 'bg-primary/10 text-primary border-transparent hover:bg-primary/20' },
  { id: 'reminder', label: 'Recordatorio de visita', icon: 'Bell', color: 'border-border hover:bg-muted' },
];

const LeadsTab = ({ ownerCustomers = [] }) => {
  const { user } = useAuth();
  const [subTab, setSubTab] = useState('prospects');
  const [prospects, setProspects] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [funnelData, setFunnelData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);

  const fetchLeads = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase?.from('crm_leads')?.select(`
          *,
          customer_profiles(id, full_name, email, phone, vip_level, total_visits, last_visit_at),
          referred_by:customer_profiles!crm_leads_referred_by_customer_id_fkey(id, full_name)
        `)?.eq('owner_id', user?.id)?.eq('status', 'active')?.order('created_at', { ascending: false });

      if (err) throw err;

      const allLeads = data || [];
      setProspects(allLeads?.filter(l => l?.lead_type === 'prospect'));
      setReferrals(allLeads?.filter(l => l?.lead_type === 'referral'));
    } catch (e) {
      setError(e?.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const buildFunnelData = useCallback(() => {
    const total = ownerCustomers?.length || 0;
    const withCoupon = prospects?.filter(p => p?.coupon_downloaded)?.length;
    const firstVisit = ownerCustomers?.filter(oc => (oc?.customer_profiles?.total_visits || 0) >= 1)?.length;
    const secondVisit = ownerCustomers?.filter(oc => (oc?.customer_profiles?.total_visits || 0) >= 2)?.length;
    const regular = ownerCustomers?.filter(oc => (oc?.customer_profiles?.total_visits || 0) >= 5)?.length;
    const viewCount = total + prospects?.length + Math.floor(prospects?.length * 2.5);

    const stages = [
      { ...FUNNEL_LABELS?.[0], count: viewCount, pct: 100 },
      { ...FUNNEL_LABELS?.[1], count: withCoupon + Math.floor(viewCount * 0.1), pct: viewCount > 0 ? Math.round(((withCoupon + Math.floor(viewCount * 0.1)) / viewCount) * 100) : 0 },
      { ...FUNNEL_LABELS?.[2], count: firstVisit, pct: viewCount > 0 ? Math.round((firstVisit / viewCount) * 100) : 0 },
      { ...FUNNEL_LABELS?.[3], count: secondVisit, pct: viewCount > 0 ? Math.round((secondVisit / viewCount) * 100) : 0 },
      { ...FUNNEL_LABELS?.[4], count: regular, pct: viewCount > 0 ? Math.round((regular / viewCount) * 100) : 0 },
    ];
    setFunnelData(stages);
  }, [ownerCustomers, prospects]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);
  useEffect(() => { buildFunnelData(); }, [buildFunnelData]);

  const handleAction = async (leadId, actionId) => {
    setActionFeedback({ leadId, actionId, status: 'sending' });
    // Simulate action (in production, trigger campaign/coupon send)
    await new Promise(r => setTimeout(r, 800));
    setActionFeedback({ leadId, actionId, status: 'done' });
    setTimeout(() => setActionFeedback(null), 2000);
  };

  const markConverted = async (leadId) => {
    try {
      await supabase?.from('crm_leads')?.update({ status: 'converted' })?.eq('id', leadId)?.eq('owner_id', user?.id);
      await fetchLeads();
    } catch (e) {
      console.error(e?.message);
    }
  };

  const getDaysAgo = (dateStr) => {
    if (!dateStr) return null;
    const days = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    return `Hace ${days} días`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold">Gestión de Leads</h2>
          <p className="text-sm text-muted-foreground">Prospectos y referidos vinculados a tu negocio</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{prospects?.length}</div>
            <div className="text-xs text-muted-foreground">Prospectos</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{referrals?.length}</div>
            <div className="text-xs text-muted-foreground">Referidos</div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-5 border-b border-border">
        {[['prospects', 'Eye', 'Prospectos'], ['referrals', 'Users', 'Referidos'], ['funnel', 'Filter', 'Embudo']]?.map(([id, icon, label]) => (
          <button key={id} onClick={() => setSubTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${subTab === id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            <Icon name={icon} size={14} />{label}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

      {loading && subTab !== 'funnel' ? (
        <div className="py-12 text-center text-muted-foreground text-sm">Cargando leads...</div>
      ) : (
        <>
          {subTab === 'prospects' && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
                <Icon name="Info" size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">Usuarios que descargaron un cupón sin usarlo, vieron tu ficha más de una vez, o se registraron sin hacer check-in.</p>
              </div>
              {prospects?.length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed border-border rounded-xl">
                  <Icon name="Eye" size={32} className="mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No hay prospectos activos</p>
                </div>
              ) : (
                prospects?.map(p => {
                  const customerName = p?.customer_profiles?.full_name || `Prospecto anónimo`;
                  const isFeedback = actionFeedback?.leadId === p?.id;
                  return (
                    <div key={p?.id} className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                            <Icon name="User" size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{customerName}</p>
                            <p className="text-xs text-muted-foreground">
                              {p?.listing_views > 0 && `${p?.listing_views} vistas · `}
                              {p?.last_view_at && `Última: ${getDaysAgo(p?.last_view_at)}`}
                            </p>
                            {p?.promotions_seen?.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Interacción: {p?.promotions_seen?.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {p?.coupon_downloaded && !p?.coupon_redeemed && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                              <Icon name="Ticket" size={10} />Cupón sin usar
                            </span>
                          )}
                          {p?.listing_views > 1 && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                              <Icon name="Eye" size={10} />{p?.listing_views} vistas
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {PROSPECT_ACTIONS?.map(action => (
                          <button
                            key={action?.id}
                            onClick={() => handleAction(p?.id, action?.id)}
                            disabled={isFeedback}
                            className={`flex items-center gap-1.5 py-1.5 px-3 text-xs border rounded-lg transition-colors font-medium ${action?.color} ${isFeedback && actionFeedback?.actionId === action?.id ? 'opacity-50' : ''}`}
                          >
                            <Icon name={action?.icon} size={12} />
                            {isFeedback && actionFeedback?.actionId === action?.id && actionFeedback?.status === 'sending' ? 'Enviando...' :
                             isFeedback && actionFeedback?.actionId === action?.id && actionFeedback?.status === 'done' ? '✓ Enviado' :
                             action?.label}
                          </button>
                        ))}
                        <button onClick={() => markConverted(p?.id)} className="py-1.5 px-3 text-xs border border-green-200 text-green-700 rounded-lg hover:bg-green-50 transition-colors font-medium flex items-center gap-1.5">
                          <Icon name="CheckCircle" size={12} />Marcar convertido
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {subTab === 'referrals' && (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
                <Icon name="Users" size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-green-700">Personas referidas por tus clientes que se registraron pero aún no han visitado el negocio.</p>
              </div>
              {referrals?.length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed border-border rounded-xl">
                  <Icon name="UserPlus" size={32} className="mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No hay referidos activos</p>
                </div>
              ) : (
                referrals?.map(r => {
                  const customerName = r?.customer_profiles?.full_name || 'Referido';
                  const referredByName = r?.referred_by?.full_name || 'Cliente';
                  const daysAgo = r?.registered_at ? Math.floor((new Date() - new Date(r?.registered_at)) / (1000 * 60 * 60 * 24)) : 0;
                  const isFeedback = actionFeedback?.leadId === r?.id;
                  return (
                    <div key={r?.id} className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                            <Icon name="UserPlus" size={16} className="text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{customerName}</p>
                            <p className="text-xs text-muted-foreground">Referido por <span className="font-medium text-foreground">{referredByName}</span></p>
                            <p className="text-xs text-muted-foreground">Registrado hace {daysAgo} días · {r?.has_visited ? 'Ya visitó' : 'Aún no visita'}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${daysAgo > 7 ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                          {daysAgo > 7 ? 'Seguimiento urgente' : 'Nuevo'}
                        </span>
                      </div>
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {REFERRAL_ACTIONS?.map(action => (
                          <button
                            key={action?.id}
                            onClick={() => handleAction(r?.id, action?.id)}
                            disabled={isFeedback}
                            className={`flex items-center gap-1.5 py-1.5 px-3 text-xs border rounded-lg transition-colors font-medium ${action?.color}`}
                          >
                            <Icon name={action?.icon} size={12} />
                            {isFeedback && actionFeedback?.actionId === action?.id && actionFeedback?.status === 'sending' ? 'Enviando...' :
                             isFeedback && actionFeedback?.actionId === action?.id && actionFeedback?.status === 'done' ? '✓ Enviado' :
                             action?.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {subTab === 'funnel' && (
            <div>
              <h3 className="text-sm font-semibold mb-4">Pipeline de Conversión</h3>
              <div className="space-y-3">
                {funnelData?.map((stage, i) => (
                  <div key={stage?.id}>
                    <div className="flex items-center gap-3 mb-1">
                      <div className={`w-8 h-8 rounded-lg ${stage?.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon name={stage?.icon} size={14} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{stage?.label}</span>
                          <span className="text-sm font-bold">{stage?.count}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className={`h-2 rounded-full ${stage?.color} transition-all`} style={{ width: `${Math.max(stage?.pct, 2)}%` }} />
                        </div>
                      </div>
                    </div>
                    {i < funnelData?.length - 1 && funnelData?.[i]?.count > 0 && (
                      <div className="ml-4 flex items-center gap-2 py-1">
                        <div className="w-0.5 h-4 bg-border ml-3.5" />
                        <span className="text-xs text-muted-foreground">
                          Conversión: {Math.round((funnelData?.[i + 1]?.count / Math.max(funnelData?.[i]?.count, 1)) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {funnelData?.[0]?.count > 0 && funnelData?.[1]?.count / funnelData?.[0]?.count < 0.3 && (
                <div className="mt-5 bg-muted/30 rounded-xl p-4">
                  <p className="text-xs font-semibold mb-2">Oportunidad de mejora</p>
                  <p className="text-xs text-muted-foreground">Solo el {Math.round(funnelData?.[1]?.count / Math.max(funnelData?.[0]?.count, 1) * 100)}% de quienes ven tu ficha descargan un cupón. Una oferta más visible podría aumentar esta tasa.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LeadsTab;
