import { supabase } from '../lib/supabase';

// Milestone types
export const MILESTONE_TYPES = {
  GOAL_50: 'goal_50_percent',
  GOAL_75: 'goal_75_percent',
  GOAL_100: 'goal_100_percent',
  AB_WINNER: 'ab_winner_declared',
  BUDGET_50: 'budget_threshold_50',
  BUDGET_75: 'budget_threshold_75',
  BUDGET_90: 'budget_threshold_90',
  CONTROL_COMPLETE: 'control_group_complete',
};

export const MILESTONE_CONFIG = {
  [MILESTONE_TYPES?.GOAL_50]: {
    icon: 'Target',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    label: '50% del objetivo alcanzado',
  },
  [MILESTONE_TYPES?.GOAL_75]: {
    icon: 'TrendingUp',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    label: '75% del objetivo alcanzado',
  },
  [MILESTONE_TYPES?.GOAL_100]: {
    icon: 'CheckCircle',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    label: '¡Objetivo completado!',
  },
  [MILESTONE_TYPES?.AB_WINNER]: {
    icon: 'Award',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    label: 'Ganador A/B declarado (95% confianza)',
  },
  [MILESTONE_TYPES?.BUDGET_50]: {
    icon: 'DollarSign',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    label: '50% del presupuesto utilizado',
  },
  [MILESTONE_TYPES?.BUDGET_75]: {
    icon: 'AlertTriangle',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    label: '75% del presupuesto utilizado',
  },
  [MILESTONE_TYPES?.BUDGET_90]: {
    icon: 'AlertOctagon',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    label: '90% del presupuesto utilizado — ¡Atención!',
  },
  [MILESTONE_TYPES?.CONTROL_COMPLETE]: {
    icon: 'Shield',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    label: 'Grupo de control completado',
  },
};

// Fetch campaign notifications
export const fetchCampaignNotifications = async (campaignId, businessId) => {
  try {
    if (!businessId) return [];
    let query = supabase
      ?.from('campaign_notifications')
      ?.select('*')
      ?.order('created_at', { ascending: false })
      ?.limit(50);

    if (campaignId) {
      query = query?.eq('campaign_id', campaignId);
    } else if (businessId) {
      query = query?.eq('business_id', businessId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    // Only log non-network errors to avoid noise when table doesn't exist
    if (err?.message && !err?.message?.includes('Failed to fetch') && !err?.message?.includes('relation') && !err?.message?.includes('does not exist')) {
      console.warn('Campaign notifications unavailable:', err?.message);
    }
    return [];
  }
};

// Fetch unread count
export const fetchUnreadCampaignNotificationsCount = async (businessId) => {
  try {
    const { count, error } = await supabase
      ?.from('campaign_notifications')
      ?.select('id', { count: 'exact', head: true })
      ?.eq('business_id', businessId || '1')
      ?.eq('is_read', false);
    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error('Error fetching unread count:', err);
    return 0;
  }
};

// Mark notification as read
export const markCampaignNotificationRead = async (notificationId) => {
  try {
    const { error } = await supabase
      ?.from('campaign_notifications')
      ?.update({ is_read: true, updated_at: new Date()?.toISOString() })
      ?.eq('id', notificationId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error marking notification as read:', err);
    return false;
  }
};

// Mark all as read for a campaign
export const markAllCampaignNotificationsRead = async (campaignId) => {
  try {
    const { error } = await supabase
      ?.from('campaign_notifications')
      ?.update({ is_read: true, updated_at: new Date()?.toISOString() })
      ?.eq('campaign_id', campaignId)
      ?.eq('is_read', false);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error marking all as read:', err);
    return false;
  }
};

// Create a campaign notification (milestone)
export const createCampaignNotification = async ({ campaignId, businessId, milestoneType, milestoneValue, campaignName, metadata }) => {
  const config = MILESTONE_CONFIG?.[milestoneType];
  if (!config) return null;

  const titles = {
    [MILESTONE_TYPES?.GOAL_50]: `${campaignName || 'Campaña'}: 50% del objetivo alcanzado`,
    [MILESTONE_TYPES?.GOAL_75]: `${campaignName || 'Campaña'}: 75% del objetivo alcanzado`,
    [MILESTONE_TYPES?.GOAL_100]: `${campaignName || 'Campaña'}: ¡Objetivo completado!`,
    [MILESTONE_TYPES?.AB_WINNER]: `${campaignName || 'Campaña'}: Ganador A/B declarado`,
    [MILESTONE_TYPES?.BUDGET_50]: `${campaignName || 'Campaña'}: 50% del presupuesto utilizado`,
    [MILESTONE_TYPES?.BUDGET_75]: `${campaignName || 'Campaña'}: 75% del presupuesto utilizado`,
    [MILESTONE_TYPES?.BUDGET_90]: `${campaignName || 'Campaña'}: Presupuesto al 90% — Acción requerida`,
    [MILESTONE_TYPES?.CONTROL_COMPLETE]: `${campaignName || 'Campaña'}: Grupo de control completado`,
  };

  const messages = {
    [MILESTONE_TYPES?.GOAL_50]: `La campaña ha alcanzado el 50% de su objetivo. Sigue así, vas por buen camino.`,
    [MILESTONE_TYPES?.GOAL_75]: `¡Excelente! La campaña está al 75% de su objetivo. Considera reforzar las acciones.`,
    [MILESTONE_TYPES?.GOAL_100]: `¡Felicidades! La campaña ha completado su objetivo. Revisa el dashboard para ver el impacto total.`,
    [MILESTONE_TYPES?.AB_WINNER]: `La prueba A/B tiene un ganador con 95% de confianza estadística. Revisa los resultados y despliega la variante ganadora.`,
    [MILESTONE_TYPES?.BUDGET_50]: `Se ha utilizado el 50% del presupuesto asignado a esta campaña.`,
    [MILESTONE_TYPES?.BUDGET_75]: `Atención: el 75% del presupuesto ha sido utilizado. Monitorea el ritmo de gasto.`,
    [MILESTONE_TYPES?.BUDGET_90]: `¡Alerta crítica! El 90% del presupuesto ha sido consumido. Considera ajustar o pausar la campaña.`,
    [MILESTONE_TYPES?.CONTROL_COMPLETE]: `El grupo de control ha completado el período de observación. Los datos de impacto incremental ya están disponibles.`,
  };

  try {
    const { data, error } = await supabase
      ?.from('campaign_notifications')
      ?.insert({
        campaign_id: campaignId,
        business_id: businessId || '1',
        milestone_type: milestoneType,
        milestone_value: milestoneValue,
        title: titles?.[milestoneType],
        message: messages?.[milestoneType],
        is_read: false,
        metadata: metadata || {},
      })
      ?.select()
      ?.single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating campaign notification:', err);
    return null;
  }
};

// Check and fire milestone notifications based on campaign metrics
export const checkAndFireMilestones = async (campaign, previousMetrics, currentMetrics) => {
  const notifications = [];
  const campaignId = campaign?.id || campaign?.campaign_id;
  const businessId = campaign?.business_id || '1';
  const campaignName = campaign?.name;

  // Goal milestones
  const goalTarget = campaign?.goal_target || campaign?.meta || 50;
  const prevGoalPct = goalTarget > 0 ? ((previousMetrics?.conversions || 0) / goalTarget) * 100 : 0;
  const currGoalPct = goalTarget > 0 ? ((currentMetrics?.conversions || 0) / goalTarget) * 100 : 0;

  if (prevGoalPct < 50 && currGoalPct >= 50) {
    const n = await createCampaignNotification({ campaignId, businessId, milestoneType: MILESTONE_TYPES?.GOAL_50, milestoneValue: 50, campaignName });
    if (n) notifications?.push(n);
  }
  if (prevGoalPct < 75 && currGoalPct >= 75) {
    const n = await createCampaignNotification({ campaignId, businessId, milestoneType: MILESTONE_TYPES?.GOAL_75, milestoneValue: 75, campaignName });
    if (n) notifications?.push(n);
  }
  if (prevGoalPct < 100 && currGoalPct >= 100) {
    const n = await createCampaignNotification({ campaignId, businessId, milestoneType: MILESTONE_TYPES?.GOAL_100, milestoneValue: 100, campaignName });
    if (n) notifications?.push(n);
  }

  // Budget milestones
  const budget = campaign?.budget || 0;
  if (budget > 0) {
    const prevBudgetPct = ((previousMetrics?.spent || 0) / budget) * 100;
    const currBudgetPct = ((currentMetrics?.spent || 0) / budget) * 100;

    if (prevBudgetPct < 50 && currBudgetPct >= 50) {
      const n = await createCampaignNotification({ campaignId, businessId, milestoneType: MILESTONE_TYPES?.BUDGET_50, milestoneValue: 50, campaignName });
      if (n) notifications?.push(n);
    }
    if (prevBudgetPct < 75 && currBudgetPct >= 75) {
      const n = await createCampaignNotification({ campaignId, businessId, milestoneType: MILESTONE_TYPES?.BUDGET_75, milestoneValue: 75, campaignName });
      if (n) notifications?.push(n);
    }
    if (prevBudgetPct < 90 && currBudgetPct >= 90) {
      const n = await createCampaignNotification({ campaignId, businessId, milestoneType: MILESTONE_TYPES?.BUDGET_90, milestoneValue: 90, campaignName });
      if (n) notifications?.push(n);
    }
  }

  return notifications;
};

// Subscribe to campaign notifications via Supabase Realtime
export const subscribeToCampaignNotifications = (campaignId, businessId, onNotification) => {
  const channelName = campaignId
    ? `campaign-notifications-${campaignId}`
    : `business-notifications-${businessId}`;

  const channel = supabase
    ?.channel(channelName)
    ?.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'campaign_notifications',
        filter: campaignId
          ? `campaign_id=eq.${campaignId}`
          : `business_id=eq.${businessId || '1'}`,
      },
      (payload) => {
        onNotification?.(payload?.new);
      }
    )
    ?.subscribe();

  return channel;
};

// Subscribe to campaign_objectives changes for real-time metric updates
export const subscribeToCampaignMetrics = (campaignId, onUpdate) => {
  const channel = supabase
    ?.channel(`campaign-metrics-${campaignId}`)
    ?.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'campaign_objectives',
        filter: `campaign_id=eq.${campaignId}`,
      },
      (payload) => {
        onUpdate?.(payload?.new);
      }
    )
    ?.subscribe();

  return channel;
};

// Fetch promotions for sequence builder
export const fetchAvailablePromotions = async () => {
  try {
    // Try to get from Supabase first
    const { data, error } = await supabase
      ?.from('promotions')
      ?.select('id, title, status, promo_type, discount_value, discount_type')
      ?.in('status', ['active', 'draft', 'paused'])
      ?.order('created_at', { ascending: false })
      ?.limit(50);

    if (!error && data?.length > 0) return data;

    // Fallback mock data
    return [
      { id: 'adv-1', title: 'Flash Deal Tarde — 40% OFF', status: 'active', promo_type: 'flash_deal', discount_value: 40, discount_type: 'percentage' },
      { id: 'adv-2', title: 'Happy Hour 5-7pm', status: 'active', promo_type: 'happy_hour', discount_value: 25, discount_type: 'percentage' },
      { id: 'adv-3', title: 'Drop Limitado — Edición Especial', status: 'draft', promo_type: 'limited_drop', discount_value: 0, discount_type: 'special_price' },
      { id: 'adv-4', title: 'Oferta de Cumpleaños', status: 'active', promo_type: 'birthday', discount_value: 30, discount_type: 'percentage' },
      { id: 'adv-5', title: 'Cupón VIP Exclusivo', status: 'paused', promo_type: 'vip', discount_value: 20, discount_type: 'percentage' },
    ];
  } catch (err) {
    console.error('Error fetching promotions:', err);
    return [];
  }
};

// Toggle promotion status (activate/deactivate)
export const togglePromotionStatus = async (promotionId, newStatus) => {
  try {
    const { data, error } = await supabase
      ?.from('promotions')
      ?.update({ status: newStatus, updated_at: new Date()?.toISOString() })
      ?.eq('id', promotionId)
      ?.select()
      ?.single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error toggling promotion status:', err);
    return null;
  }
};

// Subscribe to promotion status changes
export const subscribeToPromotionStatus = (promotionId, onUpdate) => {
  const channel = supabase
    ?.channel(`promotion-status-${promotionId}`)
    ?.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'promotions',
        filter: `id=eq.${promotionId}`,
      },
      (payload) => {
        onUpdate?.(payload?.new);
      }
    )
    ?.subscribe();

  return channel;
};

export default {
  fetchCampaignNotifications,
  fetchUnreadCampaignNotificationsCount,
  markCampaignNotificationRead,
  markAllCampaignNotificationsRead,
  createCampaignNotification,
  checkAndFireMilestones,
  subscribeToCampaignNotifications,
  subscribeToCampaignMetrics,
  fetchAvailablePromotions,
  togglePromotionStatus,
  subscribeToPromotionStatus,
};
