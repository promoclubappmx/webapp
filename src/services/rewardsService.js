import { supabase } from '../lib/supabase';

// Business Rules Constants
export const POINTS_RULES = {
  MXN_PER_POINT: 5,        // $5 MXN = 1 punto
  POINT_VALUE_MXN: 0.15,   // 1 punto = $0.15 MXN
};

export const pointsToMXN = (points) => (points * POINTS_RULES?.POINT_VALUE_MXN)?.toFixed(2);
export const mxnToPoints = (mxn) => Math.floor(mxn / POINTS_RULES?.MXN_PER_POINT);

// ─── PUNCH CARDS ─────────────────────────────────────────────────────────────

export const fetchPunchCards = async (businessId) => {
  const { data, error } = await supabase?.from('punch_cards')?.select('*')?.eq('business_id', businessId)?.order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
};

export const createPunchCard = async (businessId, cardData) => {
  const { data, error } = await supabase?.from('punch_cards')?.insert({
      business_id: businessId,
      name: cardData?.name,
      description: cardData?.description || null,
      stamp_icon: cardData?.stampIcon,
      card_color: cardData?.cardColor,
      card_color_secondary: cardData?.cardColorSecondary || null,
      card_gradient_type: cardData?.cardGradientType || 'solid',
      card_gradient_direction: cardData?.cardGradientDirection || 'diagonal',
      stamp_rule: cardData?.stampRule,
      stamp_amount: cardData?.stampAmount ? parseFloat(cardData?.stampAmount) : null,
      stamp_product: cardData?.stampProduct || null,
      stamp_limit_per_visit: cardData?.stampLimitPerVisit || 1,
      cumulative_stamps: cardData?.cumulativeStamps || false,
      stamp_count: parseInt(cardData?.stampCount),
      reward_type: cardData?.rewardType,
      reward_value: cardData?.rewardValue,
      reward_discount: cardData?.rewardDiscount ? parseFloat(cardData?.rewardDiscount) : null,
      reward_discount_type: cardData?.rewardDiscountType || 'percentage',
      reward_discount_max: cardData?.rewardDiscountMax ? parseFloat(cardData?.rewardDiscountMax) : null,
      reward_points: cardData?.rewardPoints ? parseInt(cardData?.rewardPoints) : null,
      reward_expiry_days: cardData?.rewardExpiryDays ? parseInt(cardData?.rewardExpiryDays) : 30,
      perceived_value: cardData?.perceivedValue ? parseFloat(cardData?.perceivedValue) : null,
      validity_type: cardData?.validityType,
      validity_days: cardData?.validityDays ? parseInt(cardData?.validityDays) : null,
      validity_date: cardData?.validityDate || null,
      auto_renew: cardData?.autoRenew,
      show_progress: cardData?.showProgress,
      welcome_stamp_enabled: cardData?.welcomeStampEnabled || false,
      welcome_stamp_count: cardData?.welcomeStampCount || 1,
      double_stamp_enabled: cardData?.doubleStampEnabled || false,
      double_stamp_days: cardData?.doubleStampDays || [],
      double_stamp_start_time: cardData?.doubleStampStartTime || null,
      double_stamp_end_time: cardData?.doubleStampEndTime || null,
      schedule_restriction_enabled: cardData?.scheduleRestrictionEnabled || false,
      schedule_days: cardData?.scheduleDays || [],
      schedule_start_time: cardData?.scheduleStartTime || null,
      schedule_end_time: cardData?.scheduleEndTime || null,
      compatibility_enabled: cardData?.compatibilityEnabled !== false,
      audience: cardData?.audience || 'all',
      is_seasonal: cardData?.isSeasonal || false,
      season_start: cardData?.seasonStart || null,
      season_end: cardData?.seasonEnd || null,
      status: cardData?.status || 'draft',
      sort_order: cardData?.sortOrder || 0,
    })?.select()?.single();
  if (error) throw error;
  return data;
};

export const updatePunchCard = async (cardId, updates) => {
  const payload = {};
  if (updates?.name !== undefined) payload.name = updates?.name;
  if (updates?.description !== undefined) payload.description = updates?.description;
  if (updates?.stampIcon !== undefined) payload.stamp_icon = updates?.stampIcon;
  if (updates?.cardColor !== undefined) payload.card_color = updates?.cardColor;
  if (updates?.cardColorSecondary !== undefined) payload.card_color_secondary = updates?.cardColorSecondary;
  if (updates?.cardGradientType !== undefined) payload.card_gradient_type = updates?.cardGradientType;
  if (updates?.cardGradientDirection !== undefined) payload.card_gradient_direction = updates?.cardGradientDirection;
  if (updates?.status !== undefined) payload.status = updates?.status;
  if (updates?.sortOrder !== undefined) payload.sort_order = updates?.sortOrder;
  if (updates?.autoRenew !== undefined) payload.auto_renew = updates?.autoRenew;
  if (updates?.showProgress !== undefined) payload.show_progress = updates?.showProgress;
  if (updates?.stampRule !== undefined) payload.stamp_rule = updates?.stampRule;
  if (updates?.stampAmount !== undefined) payload.stamp_amount = updates?.stampAmount ? parseFloat(updates?.stampAmount) : null;
  if (updates?.stampProduct !== undefined) payload.stamp_product = updates?.stampProduct;
  if (updates?.stampLimitPerVisit !== undefined) payload.stamp_limit_per_visit = updates?.stampLimitPerVisit;
  if (updates?.cumulativeStamps !== undefined) payload.cumulative_stamps = updates?.cumulativeStamps;
  if (updates?.stampCount !== undefined) payload.stamp_count = parseInt(updates?.stampCount);
  if (updates?.rewardType !== undefined) payload.reward_type = updates?.rewardType;
  if (updates?.rewardValue !== undefined) payload.reward_value = updates?.rewardValue;
  if (updates?.rewardDiscount !== undefined) payload.reward_discount = updates?.rewardDiscount ? parseFloat(updates?.rewardDiscount) : null;
  if (updates?.rewardDiscountType !== undefined) payload.reward_discount_type = updates?.rewardDiscountType;
  if (updates?.rewardDiscountMax !== undefined) payload.reward_discount_max = updates?.rewardDiscountMax ? parseFloat(updates?.rewardDiscountMax) : null;
  if (updates?.rewardPoints !== undefined) payload.reward_points = updates?.rewardPoints ? parseInt(updates?.rewardPoints) : null;
  if (updates?.rewardExpiryDays !== undefined) payload.reward_expiry_days = updates?.rewardExpiryDays ? parseInt(updates?.rewardExpiryDays) : 30;
  if (updates?.perceivedValue !== undefined) payload.perceived_value = updates?.perceivedValue ? parseFloat(updates?.perceivedValue) : null;
  if (updates?.validityType !== undefined) payload.validity_type = updates?.validityType;
  if (updates?.validityDays !== undefined) payload.validity_days = updates?.validityDays ? parseInt(updates?.validityDays) : null;
  if (updates?.validityDate !== undefined) payload.validity_date = updates?.validityDate || null;
  if (updates?.welcomeStampEnabled !== undefined) payload.welcome_stamp_enabled = updates?.welcomeStampEnabled;
  if (updates?.welcomeStampCount !== undefined) payload.welcome_stamp_count = updates?.welcomeStampCount;
  if (updates?.doubleStampEnabled !== undefined) payload.double_stamp_enabled = updates?.doubleStampEnabled;
  if (updates?.doubleStampDays !== undefined) payload.double_stamp_days = updates?.doubleStampDays;
  if (updates?.doubleStampStartTime !== undefined) payload.double_stamp_start_time = updates?.doubleStampStartTime;
  if (updates?.doubleStampEndTime !== undefined) payload.double_stamp_end_time = updates?.doubleStampEndTime;
  if (updates?.scheduleRestrictionEnabled !== undefined) payload.schedule_restriction_enabled = updates?.scheduleRestrictionEnabled;
  if (updates?.scheduleDays !== undefined) payload.schedule_days = updates?.scheduleDays;
  if (updates?.scheduleStartTime !== undefined) payload.schedule_start_time = updates?.scheduleStartTime;
  if (updates?.scheduleEndTime !== undefined) payload.schedule_end_time = updates?.scheduleEndTime;
  if (updates?.compatibilityEnabled !== undefined) payload.compatibility_enabled = updates?.compatibilityEnabled;
  if (updates?.audience !== undefined) payload.audience = updates?.audience;
  if (updates?.stampLayout !== undefined) payload.stamp_layout = updates?.stampLayout;
  if (updates?.stampSize !== undefined) payload.stamp_size = updates?.stampSize;
  if (updates?.stampEffect !== undefined) payload.stamp_effect = updates?.stampEffect;
  if (updates?.fontStyle !== undefined) payload.font_style = updates?.fontStyle;
  if (updates?.showLogo !== undefined) payload.show_logo = updates?.showLogo;
  if (updates?.accentColor !== undefined) payload.accent_color = updates?.accentColor;

  const { data, error } = await supabase?.from('punch_cards')?.update(payload)?.eq('id', cardId)?.select()?.single();
  if (error) throw error;
  return data;
};

export const deletePunchCard = async (cardId) => {
  const { error } = await supabase?.from('punch_cards')?.delete()?.eq('id', cardId);
  if (error) throw error;
};

// ─── VIP LEVELS ───────────────────────────────────────────────────────────────

export const fetchVIPConfig = async (businessId) => {
  const { data, error } = await supabase?.from('vip_levels_config')?.select('*')?.eq('business_id', businessId)?.maybeSingle();
  if (error) throw error;
  return data;
};

export const upsertVIPConfig = async (businessId, config) => {
  const { data, error } = await supabase?.from('vip_levels_config')?.upsert({
      business_id: businessId,
      criterion: config?.criterion,
      criterion_secondary: config?.criterionSecondary || null,
      evaluation_type: config?.evaluationType,
      eval_frequency_months: config?.evalFrequency,
      send_warning: config?.sendWarning,
      warning_days: config?.warningDays,
      eval_min_activity: config?.evalMinActivity || {},
      warning_days_before: config?.warningDaysBefore || 14,
      grace_period_enabled: config?.gracePeriodEnabled || false,
      grace_period_days: config?.gracePeriodDays || 30,
      combo_visits_threshold: config?.comboVisitsThreshold || 8,
      combo_points_threshold: config?.comboPointsThreshold || 300,
      engagement_score_bronze_max: config?.engagementBronzeMax || 40,
      engagement_score_silver_min: config?.engagementSilverMin || 40,
      engagement_score_silver_max: config?.engagementSilverMax || 70,
      engagement_score_gold_min: config?.engagementGoldMin || 70,
      period_window_days: config?.periodWindowDays || 30,
      period_min_visits: config?.periodMinVisits || 3,
      updated_at: new Date()?.toISOString(),
    }, { onConflict: 'business_id' })?.select()?.single();
  if (error) throw error;
  return data;
};

export const fetchVIPLevels = async (businessId) => {
  const { data, error } = await supabase?.from('vip_levels')?.select('*, vip_level_benefits(*)')?.eq('business_id', businessId)?.order('sort_order', { ascending: true });
  if (error) throw error;
  return (data || [])?.map(level => ({
    id: level?.id,
    name: level?.name,
    icon: level?.icon,
    color: level?.color,
    threshold: level?.threshold,
    sortOrder: level?.sort_order,
    clients: level?.clients_count,
    benefits: (level?.vip_level_benefits || [])?.map(b => ({
      id: b?.id,
      type: b?.benefit_type,
      value: b?.benefit_value,
    })),
    automation: level?.automation_config || {},
    maintenanceTrigger: level?.maintenance_trigger_config || {},
    downgradeTrigger: level?.downgrade_trigger_config || {},
    proximityTrigger: level?.proximity_trigger_config || {},
    timeTrigger: level?.time_trigger_config || {},
  }));
};

export const saveVIPLevels = async (businessId, levels) => {
  // Delete existing levels and re-insert (simplest approach for kanban reorder)
  const { error: delError } = await supabase?.from('vip_levels')?.delete()?.eq('business_id', businessId);
  if (delError) throw delError;

  for (let i = 0; i < levels?.length; i++) {
    const level = levels?.[i];
    const { data: lvlData, error: lvlError } = await supabase?.from('vip_levels')?.insert({
        business_id: businessId,
        name: level?.name,
        icon: level?.icon,
        color: level?.color,
        threshold: level?.threshold,
        sort_order: i + 1,
        clients_count: level?.clients || 0,
        automation_config: level?.automation || {},
        maintenance_trigger_config: level?.maintenanceTrigger || {},
        downgrade_trigger_config: level?.downgradeTrigger || {},
        proximity_trigger_config: level?.proximityTrigger || {},
        time_trigger_config: level?.timeTrigger || {},
      })?.select()?.single();
    if (lvlError) throw lvlError;

    if (level?.benefits && level?.benefits?.length > 0) {
      const benefitsPayload = level?.benefits?.map((b, bi) => ({
        vip_level_id: lvlData?.id,
        business_id: businessId,
        benefit_type: b?.type,
        benefit_value: b?.value,
        sort_order: bi + 1,
      }));
      const { error: bError } = await supabase?.from('vip_level_benefits')?.insert(benefitsPayload);
      if (bError) throw bError;
    }
  }
};

export const fetchVIPGlobalTriggers = async (businessId) => {
  const { data, error } = await supabase?.from('vip_global_triggers')?.select('*')?.eq('business_id', businessId)?.maybeSingle();
  if (error) throw error;
  return data;
};

export const upsertVIPGlobalTriggers = async (businessId, triggers) => {
  const { data, error } = await supabase?.from('vip_global_triggers')?.upsert({
    business_id: businessId,
    on_level_up: triggers?.onLevelUp !== false,
    on_level_down: triggers?.onLevelDown || false,
    on_points_milestone: triggers?.onPointsMilestone || false,
    on_anniversary: triggers?.onAnniversary || false,
    on_risk_downgrade: triggers?.onRiskDowngrade || false,
    on_sustained_loyalty: triggers?.onSustainedLoyalty || false,
    on_near_next_level: triggers?.onNearNextLevel || false,
    near_level_threshold_pct: triggers?.nearLevelThresholdPct || 20,
    notify_staff: triggers?.notifyStaff !== false,
    send_congrats: triggers?.sendCongrats !== false,
    congrats_channel: triggers?.congratsChannel || 'push',
    automation_flow: triggers?.automationFlow || false,
    flow_id: triggers?.flowId || null,
    updated_at: new Date()?.toISOString(),
  }, { onConflict: 'business_id' })?.select()?.single();
  if (error) throw error;
  return data;
};

export const fetchVIPEconomicConfig = async (businessId) => {
  const { data, error } = await supabase?.from('vip_economic_simulator_config')?.select('*')?.eq('business_id', businessId)?.maybeSingle();
  if (error) throw error;
  return data;
};

export const upsertVIPEconomicConfig = async (businessId, config) => {
  const { data, error } = await supabase?.from('vip_economic_simulator_config')?.upsert({
    business_id: businessId,
    avg_ticket_mxn: config?.avgTicketMxn || 150,
    avg_visits_per_month: config?.avgVisitsPerMonth || 4,
    updated_at: new Date()?.toISOString(),
  }, { onConflict: 'business_id' })?.select()?.single();
  if (error) throw error;
  return data;
};

// ─── SURPRISE REWARDS ─────────────────────────────────────────────────────────

export const fetchSurpriseConfig = async (businessId) => {
  const { data, error } = await supabase?.from('surprise_rewards_config')?.select('*')?.eq('business_id', businessId)?.maybeSingle();
  if (error) throw error;
  return data;
};

export const upsertSurpriseConfig = async (businessId, config) => {
  const { data, error } = await supabase?.from('surprise_rewards_config')?.upsert({
      business_id: businessId,
      mechanic: config?.mechanic,
      prizes: config?.prizes,
      triggers: config?.triggers,
      frequency: config?.frequency,
      budget_enabled: config?.budgetEnabled,
      monthly_budget: config?.monthlyBudget ? parseFloat(config?.monthlyBudget) : null,
      is_active: config?.isActive !== false,
    }, { onConflict: 'business_id' })?.select()?.single();
  if (error) throw error;
  return data;
};

// ─── EXCLUSIVE EXPERIENCES ────────────────────────────────────────────────────

export const fetchExperiences = async (businessId) => {
  const { data, error } = await supabase?.from('exclusive_experiences')?.select('*')?.eq('business_id', businessId)?.order('created_at', { ascending: false });
  if (error) throw error;
  return (data || [])?.map(exp => ({
    id: exp?.id,
    name: exp?.name,
    description: exp?.description,
    emoji: exp?.emoji,
    inventory: exp?.inventory,
    inventoryUsed: exp?.inventory_used,
    duration: exp?.duration,
    accessType: exp?.access_type,
    accessLevel: exp?.access_level,
    accessPoints: exp?.access_points,
    accessVisits: exp?.access_visits,
    perceivedValue: exp?.perceived_value,
    hasDate: exp?.has_date,
    eventDate: exp?.event_date,
    eventTime: exp?.event_time,
    status: exp?.status,
    claimed: exp?.claimed,
    waitlist: exp?.waitlist,
  }));
};

export const createExperience = async (businessId, expData) => {
  const { data, error } = await supabase?.from('exclusive_experiences')?.insert({
      business_id: businessId,
      name: expData?.name,
      description: expData?.description,
      emoji: expData?.emoji,
      inventory: parseInt(expData?.inventory),
      inventory_used: 0,
      duration: `${expData?.duration} ${expData?.durationUnit}`,
      access_type: expData?.accessType,
      access_level: expData?.accessLevel || null,
      access_points: expData?.accessPoints ? parseInt(expData?.accessPoints) : null,
      access_visits: expData?.accessVisits ? parseInt(expData?.accessVisits) : null,
      perceived_value: expData?.perceivedValue ? parseFloat(expData?.perceivedValue) : null,
      has_date: expData?.hasDate,
      event_date: expData?.eventDate || null,
      event_time: expData?.eventTime || null,
      status: 'active',
      claimed: 0,
      waitlist: 0,
    })?.select()?.single();
  if (error) throw error;
  return data;
};

export const restockExperience = async (expId, addAmount = 5) => {
  const { data: current, error: fetchError } = await supabase?.from('exclusive_experiences')?.select('inventory')?.eq('id', expId)?.single();
  if (fetchError) throw fetchError;

  const { data, error } = await supabase?.from('exclusive_experiences')?.update({ inventory: current?.inventory + addAmount, status: 'active' })?.eq('id', expId)?.select()?.single();
  if (error) throw error;
  return data;
};

// ─── AUTOMATION RULES ─────────────────────────────────────────────────────────

export const fetchAutomationRules = async (businessId) => {
  const { data, error } = await supabase
    ?.from('rewards_automation_rules')
    ?.select('*')
    ?.eq('business_id', businessId)
    ?.order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createAutomationRule = async (businessId, rule) => {
  const { data, error } = await supabase
    ?.from('rewards_automation_rules')
    ?.insert({
      business_id: businessId,
      rule_name: rule?.ruleName,
      trigger_type: rule?.triggerType,
      trigger_source_id: rule?.triggerSourceId || null,
      trigger_source_name: rule?.triggerSourceName || null,
      source_module: rule?.sourceModule,
      action_type: rule?.actionType,
      action_config: rule?.actionConfig || {},
      is_active: rule?.isActive !== false,
    })
    ?.select()
    ?.single();
  if (error) throw error;
  return data;
};

export const updateAutomationRule = async (ruleId, updates) => {
  const payload = {};
  if (updates?.isActive !== undefined) payload.is_active = updates?.isActive;
  if (updates?.actionConfig !== undefined) payload.action_config = updates?.actionConfig;
  if (updates?.ruleName !== undefined) payload.rule_name = updates?.ruleName;

  const { data, error } = await supabase
    ?.from('rewards_automation_rules')
    ?.update(payload)
    ?.eq('id', ruleId)
    ?.select()
    ?.single();
  if (error) throw error;
  return data;
};

export const deleteAutomationRule = async (ruleId) => {
  const { error } = await supabase
    ?.from('rewards_automation_rules')
    ?.delete()
    ?.eq('id', ruleId);
  if (error) throw error;
};

export const toggleAutomationRule = async (ruleId, isActive) => {
  const { data, error } = await supabase
    ?.from('rewards_automation_rules')
    ?.update({ is_active: isActive })
    ?.eq('id', ruleId)
    ?.select()
    ?.single();
  if (error) throw error;
  return data;
};

export const fetchAutomationRulesByModule = async (businessId, sourceModule) => {
  const { data, error } = await supabase
    ?.from('rewards_automation_rules')
    ?.select('*')
    ?.eq('business_id', businessId)
    ?.eq('source_module', sourceModule)
    ?.order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

// ─── ANALYTICS ────────────────────────────────────────────────────────────────

export const fetchRewardsAnalytics = async (businessId) => {
  const [punchCardsRes, experiencesRes, vipLevelsRes] = await Promise.all([
    supabase?.from('punch_cards')?.select('*')?.eq('business_id', businessId),
    supabase?.from('exclusive_experiences')?.select('*')?.eq('business_id', businessId),
    supabase?.from('vip_levels')?.select('*')?.eq('business_id', businessId),
  ]);

  const punchCards = punchCardsRes?.data || [];
  const experiences = experiencesRes?.data || [];
  const vipLevels = vipLevelsRes?.data || [];

  const totalPunchCardClients = punchCards?.reduce((s, c) => s + (c?.active_clients || 0), 0);
  const totalVIPClients = vipLevels?.reduce((s, l) => s + (l?.clients_count || 0), 0);
  const totalExperiencesClaimed = experiences?.reduce((s, e) => s + (e?.claimed || 0), 0);
  const totalWaitlist = experiences?.reduce((s, e) => s + (e?.waitlist || 0), 0);

  return {
    punchCards,
    experiences,
    vipLevels,
    summary: {
      totalPunchCardClients,
      totalVIPClients,
      totalExperiencesClaimed,
      totalWaitlist,
      activePunchCards: punchCards?.filter(c => c?.status === 'active')?.length,
      activeExperiences: experiences?.filter(e => e?.status === 'active')?.length,
    },
  };
};
