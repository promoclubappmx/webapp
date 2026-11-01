import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import { togglePromotionStatus, subscribeToPromotionStatus,  } from '../../../services/campaignNotificationService';

const STATUS_CONFIG = {
  active: { label: 'Activa', color: 'text-success', bg: 'bg-success/10', dot: 'bg-success', icon: 'Play' },
  paused: { label: 'Pausada', color: 'text-warning', bg: 'bg-warning/10', dot: 'bg-warning', icon: 'Pause' },
  draft: { label: 'Borrador', color: 'text-muted-foreground', bg: 'bg-muted', dot: 'bg-muted-foreground', icon: 'FileText' },
  pending: { label: 'Pendiente', color: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500', icon: 'Clock' },
};

const PromotionSequenceControls = ({ campaignId, sequenceSteps = [] }) => {
  const [promoSteps, setPromoSteps] = useState([]);
  const [promotionStatuses, setPromotionStatuses] = useState({});
  const [togglingIds, setTogglingIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPromoSteps();
  }, [campaignId, sequenceSteps]);

  const loadPromoSteps = async () => {
    setIsLoading(true);
    try {
      // Get sequence steps that are promo type
      const promoActions = sequenceSteps?.filter(s => s?.action === 'promo' || s?.channel === 'promo');

      // Also try to load from DB
      const { data: dbSteps } = await supabase
        ?.from('sequence_promotion_steps')
        ?.select('*')
        ?.eq('campaign_id', campaignId || 'demo')
        ?.order('created_at', { ascending: true });

      const steps = dbSteps?.length > 0 ? dbSteps : promoActions?.map((s, idx) => ({
        id: s?.id || `step-${idx}`,
        campaign_id: campaignId,
        promotion_id: s?.promotionId || s?.promotion_id || null,
        promotion_title: s?.promotionTitle || s?.promotion_title || 'Promoción sin asignar',
        action_type: s?.promotionAction || 'activate',
        step_status: 'pending',
        scheduled_at: null,
      }));

      setPromoSteps(steps || []);

      // Load current status for each promotion
      const statusMap = {};
      for (const step of (steps || [])) {
        if (step?.promotion_id) {
          const { data: promo } = await supabase
            ?.from('promotions')
            ?.select('id, status, title')
            ?.eq('id', step?.promotion_id)
            ?.single();
          if (promo) {
            statusMap[step?.promotion_id] = promo?.status;
          }
        }
      }
      setPromotionStatuses(statusMap);
    } catch (err) {
      console.error('Error loading promo steps:', err);
      // Demo fallback
      setPromoSteps([
        { id: 'demo-1', campaign_id: campaignId, promotion_id: 'adv-1', promotion_title: 'Flash Deal Tarde — 40% OFF', action_type: 'activate', step_status: 'active', scheduled_at: null },
        { id: 'demo-2', campaign_id: campaignId, promotion_id: 'adv-2', promotion_title: 'Happy Hour 5-7pm', action_type: 'activate', step_status: 'pending', scheduled_at: null },
      ]);
      setPromotionStatuses({ 'adv-1': 'active', 'adv-2': 'paused' });
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to real-time promotion status changes
  useEffect(() => {
    const channels = [];
    promoSteps?.forEach(step => {
      if (step?.promotion_id) {
        const ch = subscribeToPromotionStatus(step?.promotion_id, (updatedPromo) => {
          setPromotionStatuses(prev => ({
            ...prev,
            [step?.promotion_id]: updatedPromo?.status,
          }));
        });
        if (ch) channels?.push(ch);
      }
    });
    return () => {
      channels?.forEach(ch => ch?.unsubscribe?.());
    };
  }, [promoSteps]);

  const handleToggle = async (step) => {
    const promoId = step?.promotion_id;
    if (!promoId || togglingIds?.includes(promoId)) return;

    const currentStatus = promotionStatuses?.[promoId] || 'paused';
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';

    setTogglingIds(prev => [...prev, promoId]);
    setPromotionStatuses(prev => ({ ...prev, [promoId]: newStatus }));

    const result = await togglePromotionStatus(promoId, newStatus);
    if (!result) {
      // Revert on failure
      setPromotionStatuses(prev => ({ ...prev, [promoId]: currentStatus }));
    }
    setTogglingIds(prev => prev?.filter(id => id !== promoId));
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Percent" size={18} className="text-orange-500" />
          <span className="font-semibold text-foreground">Promociones en secuencia</span>
        </div>
        <div className="space-y-3">
          {[1, 2]?.map(i => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (promoSteps?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Percent" size={18} className="text-orange-500" />
          <span className="font-semibold text-foreground">Promociones en secuencia</span>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Icon name="Percent" size={28} className="text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No hay pasos de promoción en esta campaña</p>
          <p className="text-xs text-muted-foreground mt-1">Agrega pasos de tipo "Activar promoción" en el constructor de secuencia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon name="Percent" size={18} className="text-orange-500" />
          <span className="font-semibold text-foreground">Promociones en secuencia</span>
          <span className="ml-1 flex items-center gap-1 text-xs text-success">
            <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
            Tiempo real
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{promoSteps?.length} promoción{promoSteps?.length !== 1 ? 'es' : ''}</span>
      </div>

      <div className="divide-y divide-border">
        {promoSteps?.map((step, idx) => {
          const promoId = step?.promotion_id;
          const currentStatus = promotionStatuses?.[promoId] || step?.step_status || 'pending';
          const statusCfg = STATUS_CONFIG?.[currentStatus] || STATUS_CONFIG?.pending;
          const isToggling = togglingIds?.includes(promoId);
          const isActive = currentStatus === 'active';

          return (
            <div key={step?.id} className="flex items-center gap-4 px-5 py-4">
              {/* Step number */}
              <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-orange-600">{idx + 1}</span>
              </div>

              {/* Promo info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {step?.promotion_title || 'Promoción'}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${statusCfg?.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg?.dot} ${isActive ? 'animate-pulse' : ''}`} />
                    {statusCfg?.label}
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {step?.action_type === 'activate' ? 'Activar' : 'Desactivar'}
                  </span>
                </div>
              </div>

              {/* Toggle control */}
              {promoId && (
                <button
                  onClick={() => handleToggle(step)}
                  disabled={isToggling}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isToggling ? 'opacity-50 cursor-not-allowed' :
                    isActive
                      ? 'bg-warning/10 text-warning hover:bg-warning/20 border border-warning/30' :'bg-success/10 text-success hover:bg-success/20 border border-success/30'
                  }`}
                >
                  {isToggling ? (
                    <Icon name="Loader2" size={12} className="animate-spin" />
                  ) : (
                    <Icon name={isActive ? 'Pause' : 'Play'} size={12} />
                  )}
                  {isToggling ? 'Actualizando...' : isActive ? 'Pausar' : 'Activar'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PromotionSequenceControls;
