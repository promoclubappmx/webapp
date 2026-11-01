import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';

const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'Todos los clientes PromoClub cercanos' },
  { value: 'known', label: 'Solo mis clientes conocidos' },
  { value: 'dormant', label: 'Clientes que no visitaron en más de 30 días' },
  { value: 'vip', label: 'Por nivel de lealtad' },
];

const FREQUENCY_OPTIONS = [1, 2, 3];

const TriggerSection = ({ id, icon, title, subtitle, children, defaultOpen = false, badgeNew = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const [active, setActive] = useState(false);

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-200 ${active ? 'border-primary/40 bg-primary/2' : 'border-border bg-card'}`}>
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${active ? 'bg-primary/10' : 'bg-muted'}`}>
            <span className="text-lg">{icon}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{title}</p>
              {badgeNew && (
                <span className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">Nuevo</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2" onClick={e => e?.stopPropagation()}>
            <span className="text-xs text-muted-foreground">{active ? 'Activo' : 'Inactivo'}</span>
            <button
              onClick={() => setActive(!active)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${active ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${active ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground" />
        </div>
      </div>
      {open && (
        <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

const ToggleRow = ({ label, desc = undefined, value, onChange }) => (
  <div className="flex items-start justify-between gap-3">
    <div className="flex-1">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
    </div>
    <button
      onClick={() => onChange?.(!value)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 mt-0.5 ${value ? 'bg-primary' : 'bg-gray-300'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  </div>
);

const TabAcciones = ({ selectedBranch, geofencingActive }) => {
  // Trigger 1 state
  const [pushWelcome, setPushWelcome] = useState(true);
  const [welcomeMsg, setWelcomeMsg] = useState('¡Hola {nombre_cliente}! Estás cerca de {negocio}. {promo_activa}');
  const [linkPromo, setLinkPromo] = useState(false);
  const [linkCoupon, setLinkCoupon] = useState(false);
  const [autoCheckin, setAutoCheckin] = useState(false);
  const [checkinMinutes, setCheckinMinutes] = useState(5);
  const [audience, setAudience] = useState('all');
  const [restrictHours, setRestrictHours] = useState(false);
  // New T1 actions
  const [surpriseReward, setSurpriseReward] = useState(false);
  const [surpriseMechanic, setSurpriseMechanic] = useState('ruleta');
  const [whatsappFallback, setWhatsappFallback] = useState(false);
  const [inAppContent, setInAppContent] = useState(false);

  // Trigger 2 state
  const [dwellMinutes, setDwellMinutes] = useState(10);
  const [dwellPush, setDwellPush] = useState(false);
  const [dwellCoupon, setDwellCoupon] = useState(false);
  const [dwellPoints, setDwellPoints] = useState(false);
  const [dwellBonusPoints, setDwellBonusPoints] = useState(false);
  const [dwellBonusAmount, setDwellBonusAmount] = useState(10);
  const [dwellBonusMinutes, setDwellBonusMinutes] = useState(15);
  const [dwellAfluencia, setDwellAfluencia] = useState(false);

  // Trigger 3 state
  const [exitPush, setExitPush] = useState(true);
  const [exitMsg, setExitMsg] = useState('¡Hasta pronto! Tu cupón de regreso ya está en tu wallet.');
  const [exitCoupon, setExitCoupon] = useState(false);
  const [exitCouponDays, setExitCouponDays] = useState(7);
  const [exitReview, setExitReview] = useState(false);
  const [exitReviewMinutes, setExitReviewMinutes] = useState(5);
  const [exitPostVisitFlow, setExitPostVisitFlow] = useState(false);
  const [exitPostVisitMinReq, setExitPostVisitMinReq] = useState(5);
  const [exitUpdateStreak, setExitUpdateStreak] = useState(false);

  // Trigger 4 state
  const [alertThreshold, setAlertThreshold] = useState(20);
  const [alertPush, setAlertPush] = useState(true);
  const [alertEmail, setAlertEmail] = useState(false);

  // Trigger 5: Approaching (new)
  const [approachMeters, setApproachMeters] = useState(500);
  const [approachMsg, setApproachMsg] = useState('{negocio} está a {distancia}. Tu {favorito} te espera.');

  // Trigger 6: First time ever (new)
  const [firstTimeMsg, setFirstTimeMsg] = useState('¡Bienvenido/a por primera vez a {negocio}! Tenemos una oferta especial para ti.');
  const [firstTimeCoupon, setFirstTimeCoupon] = useState(false);

  // Trigger 7: Return after inactivity (new)
  const [inactivityDays, setInactivityDays] = useState(30);
  const [inactivityMsg, setInactivityMsg] = useState('¡Te extrañamos! Estás cerca de {negocio} — tenemos algo especial para tu regreso.');
  const [inactivityCoupon, setInactivityCoupon] = useState(false);

  // Trigger 8: Low traffic hours (new)
  const [lowTrafficMsg, setLowTrafficMsg] = useState('¡Hora perfecta para visitarnos! Menos espera y atención personalizada te esperan.');
  const [lowTrafficCoupon, setLowTrafficCoupon] = useState(false);
  const [lowTrafficPoints, setLowTrafficPoints] = useState(false);

  // Frequency control
  const [maxActionsPerDay, setMaxActionsPerDay] = useState(1);
  const [respectHours, setRespectHours] = useState(true);
  const [maxActionsPerWeek, setMaxActionsPerWeek] = useState(3);
  const [gracePeriodHours, setGracePeriodHours] = useState(4);
  const [crossChannelExclusion, setCrossChannelExclusion] = useState(false);
  const [crossChannelHours, setCrossChannelHours] = useState(6);

  // Geo-conquesting
  const [geoConquesting, setGeoConquesting] = useState(false);
  const [conquestRadius, setConquestRadius] = useState(100);
  const [conquestMsg, setConquestMsg] = useState('¡Hola {nombre}! Tenemos tu favorito esperándote. ¿Nos visitas hoy?');

  const [saving, setSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(null);
  const [geofenceId, setGeofenceId] = useState(null);

  const showSaveToast = (msg, type = 'success') => {
    setSaveToast({ msg, type });
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Load active geofence id and existing trigger config
  const loadTriggerConfig = useCallback(async () => {
    try {
      const { data: gf } = await supabase
        ?.from('business_geofences')
        ?.select('id')
        ?.eq('is_active', true)
        ?.limit(1)
        ?.maybeSingle();

      if (gf?.id) {
        setGeofenceId(gf?.id);

        const { data: triggers } = await supabase
          ?.from('geofence_triggers')
          ?.select('*')
          ?.eq('geofence_id', gf?.id);

        for (const trig of (triggers || [])) {
          const cfg = trig?.config || {};
          if (trig?.trigger_type === 'entry') {
            if (cfg?.push_welcome !== undefined) setPushWelcome(cfg?.push_welcome);
            if (cfg?.welcome_message) setWelcomeMsg(cfg?.welcome_message);
            if (cfg?.link_promo !== undefined) setLinkPromo(cfg?.link_promo);
            if (cfg?.link_coupon !== undefined) setLinkCoupon(cfg?.link_coupon);
            if (cfg?.auto_checkin !== undefined) setAutoCheckin(cfg?.auto_checkin);
            if (cfg?.checkin_minutes) setCheckinMinutes(cfg?.checkin_minutes);
            if (cfg?.audience) setAudience(cfg?.audience);
            if (cfg?.restrict_hours !== undefined) setRestrictHours(cfg?.restrict_hours);
            if (cfg?.surprise_reward !== undefined) setSurpriseReward(cfg?.surprise_reward);
            if (cfg?.surprise_mechanic) setSurpriseMechanic(cfg?.surprise_mechanic);
            if (cfg?.whatsapp_fallback !== undefined) setWhatsappFallback(cfg?.whatsapp_fallback);
            if (cfg?.in_app_content !== undefined) setInAppContent(cfg?.in_app_content);
          }
          if (trig?.trigger_type === 'dwell') {
            if (cfg?.dwell_minutes) setDwellMinutes(cfg?.dwell_minutes);
            if (cfg?.dwell_push !== undefined) setDwellPush(cfg?.dwell_push);
            if (cfg?.dwell_coupon !== undefined) setDwellCoupon(cfg?.dwell_coupon);
            if (cfg?.dwell_points !== undefined) setDwellPoints(cfg?.dwell_points);
            if (cfg?.dwell_bonus_points !== undefined) setDwellBonusPoints(cfg?.dwell_bonus_points);
            if (cfg?.dwell_bonus_amount) setDwellBonusAmount(cfg?.dwell_bonus_amount);
            if (cfg?.dwell_bonus_minutes) setDwellBonusMinutes(cfg?.dwell_bonus_minutes);
            if (cfg?.dwell_afluencia !== undefined) setDwellAfluencia(cfg?.dwell_afluencia);
          }
          if (trig?.trigger_type === 'exit') {
            if (cfg?.exit_push !== undefined) setExitPush(cfg?.exit_push);
            if (cfg?.exit_message) setExitMsg(cfg?.exit_message);
            if (cfg?.exit_coupon !== undefined) setExitCoupon(cfg?.exit_coupon);
            if (cfg?.exit_coupon_days) setExitCouponDays(cfg?.exit_coupon_days);
            if (cfg?.exit_review !== undefined) setExitReview(cfg?.exit_review);
            if (cfg?.exit_review_minutes) setExitReviewMinutes(cfg?.exit_review_minutes);
            if (cfg?.exit_post_visit_flow !== undefined) setExitPostVisitFlow(cfg?.exit_post_visit_flow);
            if (cfg?.exit_post_visit_min_req) setExitPostVisitMinReq(cfg?.exit_post_visit_min_req);
            if (cfg?.exit_update_streak !== undefined) setExitUpdateStreak(cfg?.exit_update_streak);
          }
          if (trig?.trigger_type === 'business_alert') {
            if (cfg?.alert_threshold) setAlertThreshold(cfg?.alert_threshold);
            if (cfg?.alert_push !== undefined) setAlertPush(cfg?.alert_push);
            if (cfg?.alert_email !== undefined) setAlertEmail(cfg?.alert_email);
          }
          if (trig?.trigger_type === 'approach') {
            if (cfg?.approach_meters) setApproachMeters(cfg?.approach_meters);
            if (cfg?.approach_message) setApproachMsg(cfg?.approach_message);
          }
          if (trig?.trigger_type === 'first_time') {
            if (cfg?.first_time_message) setFirstTimeMsg(cfg?.first_time_message);
            if (cfg?.first_time_coupon !== undefined) setFirstTimeCoupon(cfg?.first_time_coupon);
          }
          if (trig?.trigger_type === 'return_inactivity') {
            if (cfg?.inactivity_days) setInactivityDays(cfg?.inactivity_days);
            if (cfg?.inactivity_message) setInactivityMsg(cfg?.inactivity_message);
            if (cfg?.inactivity_coupon !== undefined) setInactivityCoupon(cfg?.inactivity_coupon);
          }
          if (trig?.trigger_type === 'low_traffic') {
            if (cfg?.low_traffic_message) setLowTrafficMsg(cfg?.low_traffic_message);
            if (cfg?.low_traffic_coupon !== undefined) setLowTrafficCoupon(cfg?.low_traffic_coupon);
            if (cfg?.low_traffic_points !== undefined) setLowTrafficPoints(cfg?.low_traffic_points);
          }
        }

        // Load frequency config
        const { data: freqCfg } = await supabase
          ?.from('geofence_frequency_config')
          ?.select('*')
          ?.maybeSingle();

        if (freqCfg) {
          if (freqCfg?.max_actions_per_day) setMaxActionsPerDay(freqCfg?.max_actions_per_day);
          if (freqCfg?.max_actions_per_week) setMaxActionsPerWeek(freqCfg?.max_actions_per_week);
          if (freqCfg?.grace_period_hours !== undefined) setGracePeriodHours(freqCfg?.grace_period_hours);
          if (freqCfg?.cross_channel_exclusion !== undefined) setCrossChannelExclusion(freqCfg?.cross_channel_exclusion);
          if (freqCfg?.cross_channel_hours) setCrossChannelHours(freqCfg?.cross_channel_hours);
          if (freqCfg?.respect_business_hours !== undefined) setRespectHours(freqCfg?.respect_business_hours);
          if (freqCfg?.geo_conquesting_enabled !== undefined) setGeoConquesting(freqCfg?.geo_conquesting_enabled);
          if (freqCfg?.geo_conquesting_radius_meters) setConquestRadius(freqCfg?.geo_conquesting_radius_meters);
          if (freqCfg?.geo_conquesting_message) setConquestMsg(freqCfg?.geo_conquesting_message);
        }
      }
    } catch (e) {
      // silently fail — use defaults
    }
  }, [selectedBranch]);

  useEffect(() => {
    loadTriggerConfig();
  }, [loadTriggerConfig]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const triggersPayload = [
        {
          trigger_type: 'entry',
          is_active: pushWelcome || linkPromo || linkCoupon || autoCheckin || surpriseReward || whatsappFallback || inAppContent,
          config: {
            push_welcome: pushWelcome,
            welcome_message: welcomeMsg,
            link_promo: linkPromo,
            link_coupon: linkCoupon,
            auto_checkin: autoCheckin,
            checkin_minutes: checkinMinutes,
            audience,
            restrict_hours: restrictHours,
            surprise_reward: surpriseReward,
            surprise_mechanic: surpriseMechanic,
            whatsapp_fallback: whatsappFallback,
            in_app_content: inAppContent,
          },
        },
        {
          trigger_type: 'dwell',
          is_active: dwellPush || dwellCoupon || dwellPoints || dwellBonusPoints || dwellAfluencia,
          config: {
            dwell_minutes: dwellMinutes,
            dwell_push: dwellPush,
            dwell_coupon: dwellCoupon,
            dwell_points: dwellPoints,
            dwell_bonus_points: dwellBonusPoints,
            dwell_bonus_amount: dwellBonusAmount,
            dwell_bonus_minutes: dwellBonusMinutes,
            dwell_afluencia: dwellAfluencia,
          },
        },
        {
          trigger_type: 'exit',
          is_active: exitPush || exitCoupon || exitReview || exitPostVisitFlow || exitUpdateStreak,
          config: {
            exit_push: exitPush,
            exit_message: exitMsg,
            exit_coupon: exitCoupon,
            exit_coupon_days: exitCouponDays,
            exit_review: exitReview,
            exit_review_minutes: exitReviewMinutes,
            exit_post_visit_flow: exitPostVisitFlow,
            exit_post_visit_min_req: exitPostVisitMinReq,
            exit_update_streak: exitUpdateStreak,
          },
        },
        {
          trigger_type: 'business_alert',
          is_active: alertPush || alertEmail,
          config: { alert_threshold: alertThreshold, alert_push: alertPush, alert_email: alertEmail },
        },
        {
          trigger_type: 'approach',
          is_active: true,
          config: { approach_meters: approachMeters, approach_message: approachMsg },
        },
        {
          trigger_type: 'first_time',
          is_active: true,
          config: { first_time_message: firstTimeMsg, first_time_coupon: firstTimeCoupon },
        },
        {
          trigger_type: 'return_inactivity',
          is_active: true,
          config: { inactivity_days: inactivityDays, inactivity_message: inactivityMsg, inactivity_coupon: inactivityCoupon },
        },
        {
          trigger_type: 'low_traffic',
          is_active: lowTrafficCoupon || lowTrafficPoints,
          config: { low_traffic_message: lowTrafficMsg, low_traffic_coupon: lowTrafficCoupon, low_traffic_points: lowTrafficPoints },
        },
      ];

      if (geofenceId) {
        // Save triggers
        for (const trig of triggersPayload) {
          await supabase
            ?.from('geofence_triggers')
            ?.upsert({
              geofence_id: geofenceId,
              trigger_type: trig?.trigger_type,
              is_active: trig?.is_active,
              config: trig?.config,
              updated_at: new Date()?.toISOString(),
            }, { onConflict: 'geofence_id,trigger_type' });
        }
      }

      // Save frequency config
      const { data: { user } } = await supabase?.auth?.getUser();
      if (user?.id) {
        await supabase
          ?.from('geofence_frequency_config')
          ?.upsert({
            business_id: user?.id,
            max_actions_per_day: maxActionsPerDay,
            max_actions_per_week: maxActionsPerWeek,
            grace_period_hours: gracePeriodHours,
            cross_channel_exclusion: crossChannelExclusion,
            cross_channel_hours: crossChannelHours,
            respect_business_hours: respectHours,
            geo_conquesting_enabled: geoConquesting,
            geo_conquesting_radius_meters: conquestRadius,
            geo_conquesting_message: conquestMsg,
            updated_at: new Date()?.toISOString(),
          }, { onConflict: 'business_id' });
      }

      showSaveToast('Configuración guardada correctamente');
    } catch (e) {
      showSaveToast('Error al guardar. Intenta de nuevo.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const msgLength = welcomeMsg?.length;

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-3xl mx-auto">
      {saveToast && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${saveToast?.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
          <Icon name={saveToast?.type === 'error' ? 'AlertCircle' : 'CheckCircle'} size={16} />
          {saveToast?.msg}
        </div>
      )}
      {!geofencingActive && (
        <div className="flex items-center gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
          <Icon name="AlertTriangle" size={16} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700">El geofencing está inactivo. Actívalo en el header para que estas acciones se ejecuten.</p>
        </div>
      )}
      {/* Section label */}
      <div className="flex items-center gap-2">
        <Icon name="Zap" size={15} className="text-primary" />
        <h2 className="text-sm font-bold text-foreground">Triggers de evento</h2>
        <span className="text-xs text-muted-foreground ml-1">8 disponibles</span>
      </div>
      {/* Trigger 1: Entry */}
      <TriggerSection id="entry" icon="🔔" title="Al entrar al radio" subtitle="Acciones cuando un cliente entra a tu zona" defaultOpen={true}>
        <ToggleRow
          label="Notificación push de bienvenida"
          value={pushWelcome}
          onChange={setPushWelcome}
        />
        {pushWelcome && (
          <div className="ml-0 space-y-3 p-3 bg-muted/50 rounded-xl">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-foreground">Mensaje personalizable</label>
                <span className={`text-xs ${msgLength > 130 ? 'text-destructive' : 'text-muted-foreground'}`}>{msgLength}/140</span>
              </div>
              <textarea
                value={welcomeMsg}
                onChange={e => setWelcomeMsg(e?.target?.value)}
                maxLength={140}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {['{nombre_cliente}', '{negocio}', '{promo_activa}', '{distancia}']?.map(v => (
                  <button
                    key={v}
                    onClick={() => setWelcomeMsg(prev => prev + v)}
                    className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            {/* Preview */}
            <div className="p-3 bg-gray-900 rounded-xl">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Bell" size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">PromoClub</p>
                  <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{welcomeMsg?.replace('{nombre_cliente}', 'María')?.replace('{negocio}', 'Café Roma')?.replace('{promo_activa}', '20% off hoy')?.replace('{distancia}', '150m')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <ToggleRow label="Vincular a una promoción activa" value={linkPromo} onChange={setLinkPromo} />
        {linkPromo && (
          <select className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none">
            <option>Seleccionar promoción activa...</option>
            <option>2x1 en bebidas — hasta el viernes</option>
            <option>Flash Deal: 30% off — hoy</option>
          </select>
        )}

        <ToggleRow label="Vincular a un cupón" value={linkCoupon} onChange={setLinkCoupon} />
        {linkCoupon && (
          <select className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none">
            <option>Seleccionar cupón activo...</option>
            <option>Cupón bienvenida — 15% off</option>
            <option>Cupón fidelidad — café gratis</option>
          </select>
        )}

        <ToggleRow
          label="Check-in automático al entrar"
          desc="Registra un check-in automático cuando el cliente lleva N minutos dentro del radio."
          value={autoCheckin}
          onChange={setAutoCheckin}
        />
        {autoCheckin && (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
            <span className="text-sm text-foreground">Check-in automático después de</span>
            <input
              type="number"
              min={1}
              max={60}
              value={checkinMinutes}
              onChange={e => setCheckinMinutes(Number(e?.target?.value))}
              className="w-16 px-2 py-1.5 text-sm border border-border rounded-lg bg-background text-center focus:outline-none"
            />
            <span className="text-sm text-foreground">minutos</span>
          </div>
        )}

        {/* NEW: Surprise reward */}
        <ToggleRow
          label="Activar recompensa sorpresa"
          desc="El cliente recibe una mecánica de juego al entrar al radio — atrae al local para canjear."
          value={surpriseReward}
          onChange={setSurpriseReward}
        />
        {surpriseReward && (
          <div className="p-3 bg-muted/50 rounded-xl space-y-2">
            <label className="text-xs font-medium text-foreground block">Mecánica de juego</label>
            <div className="flex gap-2">
              {['ruleta', 'scratch', 'sobre']?.map(m => (
                <button
                  key={m}
                  onClick={() => setSurpriseMechanic(m)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors capitalize ${surpriseMechanic === m ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border hover:border-primary/40'}`}
                >
                  {m === 'ruleta' ? '🎡 Ruleta' : m === 'scratch' ? '🎟 Scratch' : '✉️ Sobre'}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Diferente al trigger de sorpresa post check-in — este se activa por proximidad antes de entrar al negocio.</p>
          </div>
        )}

        {/* NEW: WhatsApp fallback */}
        <ToggleRow
          label="Enviar también por WhatsApp"
          desc="Canal de respaldo para clientes con push desactivado."
          value={whatsappFallback}
          onChange={setWhatsappFallback}
        />
        {whatsappFallback && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-sm">💬</span>
              <p className="text-xs text-green-700">Se enviará por WhatsApp solo si el cliente tiene push desactivado y tiene WhatsApp disponible en la plataforma.</p>
            </div>
          </div>
        )}

        {/* NEW: In-app content */}
        <ToggleRow
          label="Mostrar contenido especial al abrir la app"
          desc="Si el cliente está en el radio y abre la app, muestra un banner o modal especial antes de la pantalla principal."
          value={inAppContent}
          onChange={setInAppContent}
        />
        {inAppContent && (
          <div className="p-3 bg-muted/50 rounded-xl space-y-2">
            <label className="text-xs font-medium text-foreground block">Tipo de contenido</label>
            <select className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none">
              <option>Banner superior</option>
              <option>Modal de bienvenida</option>
              <option>Pantalla splash personalizada</option>
            </select>
            <p className="text-xs text-muted-foreground">No es un push — es una experiencia dentro de la app cuando el cliente ya la tiene abierta mientras está cerca.</p>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Segmentación de audiencia</label>
          <div className="space-y-1.5">
            {AUDIENCE_OPTIONS?.map(opt => (
              <label key={opt?.value} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="audience"
                  value={opt?.value}
                  checked={audience === opt?.value}
                  onChange={() => setAudience(opt?.value)}
                  className="accent-primary"
                />
                <span className="text-sm text-foreground">{opt?.label}</span>
              </label>
            ))}
          </div>
        </div>

        <ToggleRow label="Restringir horario" desc="La acción solo se ejecuta en el horario configurado." value={restrictHours} onChange={setRestrictHours} />
        {restrictHours && (
          <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-xl">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Hora inicio</label>
              <input type="time" defaultValue="09:00" className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Hora fin</label>
              <input type="time" defaultValue="21:00" className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none" />
            </div>
          </div>
        )}
      </TriggerSection>
      {/* Trigger 2: Dwell */}
      <TriggerSection id="dwell" icon="🕐" title="Al permanecer X minutos" subtitle="Acciones cuando el cliente permanece en tu zona">
        <div className="flex items-center gap-3">
          <span className="text-sm text-foreground">Activar si el cliente permanece más de</span>
          <input
            type="number"
            min={2}
            max={60}
            value={dwellMinutes}
            onChange={e => setDwellMinutes(Number(e?.target?.value))}
            className="w-16 px-2 py-1.5 text-sm border border-border rounded-lg bg-background text-center focus:outline-none"
          />
          <span className="text-sm text-foreground">minutos</span>
        </div>
        <ToggleRow label="Push de enganche" desc='Ej: "¿Ya conociste nuestro menú del día?"' value={dwellPush} onChange={setDwellPush} />
        <ToggleRow label="Entregar cupón de permanencia" value={dwellCoupon} onChange={setDwellCoupon} />
        <ToggleRow label="Acreditar puntos bonus por permanencia" value={dwellPoints} onChange={setDwellPoints} />

        {/* NEW: Bonus points for dwell */}
        <ToggleRow
          label="Puntos bonus adicionales por tiempo"
          desc="Independiente del check-in. Premia el tiempo de consumo, no solo la entrada."
          value={dwellBonusPoints}
          onChange={setDwellBonusPoints}
        />
        {dwellBonusPoints && (
          <div className="p-3 bg-muted/50 rounded-xl space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-foreground">+</span>
              <input
                type="number"
                min={1}
                max={500}
                value={dwellBonusAmount}
                onChange={e => setDwellBonusAmount(Number(e?.target?.value))}
                className="w-20 px-2 py-1.5 text-sm border border-border rounded-lg bg-background text-center focus:outline-none"
              />
              <span className="text-sm text-foreground">puntos bonus por permanecer</span>
              <input
                type="number"
                min={5}
                max={120}
                value={dwellBonusMinutes}
                onChange={e => setDwellBonusMinutes(Number(e?.target?.value))}
                className="w-16 px-2 py-1.5 text-sm border border-border rounded-lg bg-background text-center focus:outline-none"
              />
              <span className="text-sm text-foreground">minutos</span>
            </div>
          </div>
        )}

        {/* NEW: Afluencia indicator */}
        <ToggleRow
          label="Actualizar indicador de afluencia del negocio"
          desc="Si 3+ clientes están en el radio más de 5 min, el negocio aparece como 'Muy visitado' en el mapa de otros usuarios."
          value={dwellAfluencia}
          onChange={setDwellAfluencia}
        />
        {dwellAfluencia && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 text-sm">📍</span>
              <p className="text-xs text-blue-700">No es una acción hacia el cliente — actualiza el estado del negocio en la plataforma B2C para otros usuarios que estén explorando el mapa.</p>
            </div>
          </div>
        )}
      </TriggerSection>
      {/* Trigger 3: Exit */}
      <TriggerSection id="exit" icon="👋" title="Al salir de la zona" subtitle="Acciones cuando el cliente sale de tu radio">
        <ToggleRow label="Notificación de despedida" value={exitPush} onChange={setExitPush} />
        {exitPush && (
          <textarea
            value={exitMsg}
            onChange={e => setExitMsg(e?.target?.value)}
            maxLength={140}
            rows={2}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none resize-none"
          />
        )}
        <ToggleRow
          label="Cupón de regreso"
          desc="Alta tasa de conversión — el cliente ya conoce el negocio."
          value={exitCoupon}
          onChange={setExitCoupon}
        />
        {exitCoupon && (
          <div className="space-y-2 p-3 bg-muted/50 rounded-xl">
            <select className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none">
              <option>Seleccionar cupón...</option>
              <option>Cupón regreso — 10% off próxima visita</option>
            </select>
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground">Válido por</span>
              <input
                type="number"
                min={1}
                max={30}
                value={exitCouponDays}
                onChange={e => setExitCouponDays(Number(e?.target?.value))}
                className="w-16 px-2 py-1.5 text-sm border border-border rounded-lg bg-background text-center focus:outline-none"
              />
              <span className="text-sm text-foreground">días</span>
            </div>
          </div>
        )}
        <ToggleRow
          label="Solicitar reseña o NPS post-visita"
          desc="Solo si el cliente estuvo dentro de la zona por N minutos antes de salir."
          value={exitReview}
          onChange={setExitReview}
        />
        {exitReview && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
            <span className="text-sm text-foreground">Solicitar si estuvo más de</span>
            <input
              type="number"
              min={1}
              max={60}
              value={exitReviewMinutes}
              onChange={e => setExitReviewMinutes(Number(e?.target?.value))}
              className="w-16 px-2 py-1.5 text-sm border border-border rounded-lg bg-background text-center focus:outline-none"
            />
            <span className="text-sm text-foreground">minutos</span>
          </div>
        )}

        {/* NEW: Post-visit flow */}
        <ToggleRow
          label="Activar flow de post-visita"
          desc="Al salir después de una visita verificada, activa el flow configurado: feedback → referido → siguiente visita."
          value={exitPostVisitFlow}
          onChange={setExitPostVisitFlow}
        />
        {exitPostVisitFlow && (
          <div className="p-3 bg-muted/50 rounded-xl space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-foreground">Verificar visita si estuvo más de</span>
              <input
                type="number"
                min={1}
                max={60}
                value={exitPostVisitMinReq}
                onChange={e => setExitPostVisitMinReq(Number(e?.target?.value))}
                className="w-16 px-2 py-1.5 text-sm border border-border rounded-lg bg-background text-center focus:outline-none"
              />
              <span className="text-sm text-foreground">minutos dentro</span>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Flow a activar</label>
              <select className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none">
                <option>Seleccionar flow del módulo B4...</option>
                <option>Flow post-visita estándar</option>
                <option>Flow de referidos</option>
                <option>Flow de reactivación</option>
              </select>
            </div>
            <p className="text-xs text-muted-foreground">Conecta el geofencing con el módulo de Automation Flows.</p>
          </div>
        )}

        {/* NEW: Update streak */}
        <ToggleRow
          label="Actualizar nivel de racha al salir"
          desc="Notifica al cliente en el momento de salida si su racha sigue activa."
          value={exitUpdateStreak}
          onChange={setExitUpdateStreak}
        />
        {exitUpdateStreak && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="flex items-start gap-2">
              <span className="text-orange-500 text-sm mt-0.5">🔥</span>
              <div>
                <p className="text-xs text-orange-700 font-medium">Ejemplo de notificación al salir:</p>
                <p className="text-xs text-orange-600 mt-0.5">"🔥 Visita registrada — tu racha sigue activa. Llevas 5 días seguidos."</p>
                <p className="text-xs text-orange-500 mt-1">El momento de salida es más natural para esta notificación que el momento de entrada.</p>
              </div>
            </div>
          </div>
        )}
      </TriggerSection>
      {/* Trigger 4: Business alert */}
      <TriggerSection id="alert" icon="📊" title="Alerta de usuarios cercanos (para ti)" subtitle="Notificación al Owner cuando hay pico de clientes en tu radio">
        <div className="flex items-center gap-3">
          <span className="text-sm text-foreground">Notificarme cuando haya más de</span>
          <input
            type="number"
            min={5}
            max={500}
            value={alertThreshold}
            onChange={e => setAlertThreshold(Number(e?.target?.value))}
            className="w-20 px-2 py-1.5 text-sm border border-border rounded-lg bg-background text-center focus:outline-none"
          />
          <span className="text-sm text-foreground">clientes en mi radio</span>
        </div>
        <div className="space-y-2">
          <ToggleRow label="Push al Owner" value={alertPush} onChange={setAlertPush} />
          <ToggleRow label="Email al Owner" value={alertEmail} onChange={setAlertEmail} />
        </div>
      </TriggerSection>
      {/* ─── NEW TRIGGERS ─── */}
      <div className="flex items-center gap-2 pt-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground px-2 font-medium">Triggers avanzados</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      {/* Trigger 5: Approaching */}
      <TriggerSection id="approach" icon="🚶" title="Al acercarse (zona de aproximación)" subtitle="Se activa antes de que el cliente entre al radio — trigger anticipatorio" badgeNew={true}>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl mb-2">
          <p className="text-xs text-blue-700">
            <strong>Mayor conversión:</strong> actúa en el momento de decisión de hacia dónde ir. Ej: "Café Roma está a 2 minutos caminando. Tu latte favorito te espera."
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-foreground">Activar cuando el cliente esté a</span>
          <input
            type="number"
            min={100}
            max={1000}
            step={50}
            value={approachMeters}
            onChange={e => setApproachMeters(Number(e?.target?.value))}
            className="w-20 px-2 py-1.5 text-sm border border-border rounded-lg bg-background text-center focus:outline-none"
          />
          <span className="text-sm text-foreground">metros fuera de mi zona</span>
        </div>
        <p className="text-xs text-muted-foreground">Rango: 100m a 1km adicional al radio del geofence. El cliente aún no ha entrado.</p>
        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Mensaje de aproximación</label>
          <textarea
            value={approachMsg}
            onChange={e => setApproachMsg(e?.target?.value)}
            maxLength={140}
            rows={2}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none resize-none"
          />
          <div className="flex flex-wrap gap-1 mt-1.5">
            {['{negocio}', '{distancia}', '{favorito}', '{nombre_cliente}']?.map(v => (
              <button
                key={v}
                onClick={() => setApproachMsg(prev => prev + v)}
                className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </TriggerSection>
      {/* Trigger 6: First time ever */}
      <TriggerSection id="firsttime" icon="⭐" title="Primera vez histórica en la zona" subtitle="Cliente de PromoClub que nunca había estado físicamente cerca de este negocio" badgeNew={true}>
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl mb-2">
          <p className="text-xs text-purple-700">
            <strong>Solo se activa una vez por cliente para siempre.</strong> Diferente al trigger de entrada regular — detecta la primera presencia física histórica, aunque el cliente ya tenga cuenta hace tiempo.
          </p>
        </div>
        <div className="p-3 bg-muted/50 rounded-xl space-y-2">
          <p className="text-xs text-muted-foreground italic">Caso de uso: María tiene PromoClub hace 1 año pero nunca había pasado por el Centro Histórico. Hoy pasa por primera vez — trigger especial con oferta más agresiva que la bienvenida normal.</p>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Mensaje de primera vez</label>
          <textarea
            value={firstTimeMsg}
            onChange={e => setFirstTimeMsg(e?.target?.value)}
            maxLength={140}
            rows={2}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none resize-none"
          />
        </div>
        <ToggleRow
          label="Entregar cupón de primera vez"
          desc="Oferta más agresiva que la bienvenida normal — solo se usa una vez."
          value={firstTimeCoupon}
          onChange={setFirstTimeCoupon}
        />
        {firstTimeCoupon && (
          <select className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none">
            <option>Seleccionar cupón de primera vez...</option>
            <option>Cupón primera visita — 25% off</option>
            <option>Bebida gratis en primera visita</option>
          </select>
        )}
      </TriggerSection>
      {/* Trigger 7: Return after inactivity */}
      <TriggerSection id="inactivity" icon="🔄" title="Al regresar después de inactividad" subtitle="Cliente que visitó previamente y regresa después de N días sin visitar" badgeNew={true}>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-2">
          <p className="text-xs text-amber-700">
            <strong>Momento de oro:</strong> el cliente ya está cerca — actúa en ese instante. Diferente al cupón de recuperación que se envía proactivamente sin saber si el cliente está cerca.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-foreground">Activar si el cliente no visitó en los últimos</span>
          <input
            type="number"
            min={7}
            max={365}
            value={inactivityDays}
            onChange={e => setInactivityDays(Number(e?.target?.value))}
            className="w-20 px-2 py-1.5 text-sm border border-border rounded-lg bg-background text-center focus:outline-none"
          />
          <span className="text-sm text-foreground">días y ahora está en mi radio</span>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Mensaje de reactivación</label>
          <textarea
            value={inactivityMsg}
            onChange={e => setInactivityMsg(e?.target?.value)}
            maxLength={140}
            rows={2}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none resize-none"
          />
          <div className="flex flex-wrap gap-1 mt-1.5">
            {['{nombre_cliente}', '{negocio}', '{dias_sin_visitar}']?.map(v => (
              <button
                key={v}
                onClick={() => setInactivityMsg(prev => prev + v)}
                className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <ToggleRow
          label="Entregar cupón de reactivación"
          desc="Incentivo inmediato para convertir la visita potencial en real."
          value={inactivityCoupon}
          onChange={setInactivityCoupon}
        />
        {inactivityCoupon && (
          <select className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none">
            <option>Seleccionar cupón de reactivación...</option>
            <option>Cupón regreso — 20% off</option>
            <option>Postre gratis al regresar</option>
          </select>
        )}
      </TriggerSection>
      {/* Trigger 8: Low traffic hours */}
      <TriggerSection id="lowtraffic" icon="🌙" title="Al entrar durante horario de baja afluencia" subtitle="Combinación de presencia física + contexto temporal + datos de tráfico histórico" badgeNew={true}>
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl mb-2">
          <p className="text-xs text-indigo-700">
            <strong>Diferente al "Restringir horario"</strong> — este trigger existe <em>precisamente</em> para los horarios muertos. El sistema detecta que el cliente entró en una hora de baja afluencia histórica y dispara una acción especial para convertir esa visita potencial en real.
          </p>
        </div>
        <div className="p-3 bg-muted/50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="BarChart2" size={14} className="text-muted-foreground" />
            <p className="text-xs font-medium text-foreground">Horas de baja afluencia detectadas automáticamente</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['Lun 3–5 PM', 'Mar 2–4 PM', 'Mié 3–5 PM', 'Jue 2–4 PM']?.map(h => (
              <span key={h} className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">{h}</span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Calculado con base en el historial de tráfico de tu negocio. Se actualiza semanalmente.</p>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Mensaje para hora muerta</label>
          <textarea
            value={lowTrafficMsg}
            onChange={e => setLowTrafficMsg(e?.target?.value)}
            maxLength={140}
            rows={2}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none resize-none"
          />
        </div>
        <ToggleRow label="Entregar cupón de hora muerta" value={lowTrafficCoupon} onChange={setLowTrafficCoupon} />
        {lowTrafficCoupon && (
          <select className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none">
            <option>Seleccionar cupón...</option>
            <option>Happy Hour — 2x1 en bebidas</option>
            <option>Descuento hora tranquila — 15% off</option>
          </select>
        )}
        <ToggleRow
          label="Puntos dobles en hora de baja afluencia"
          desc="Incentivo adicional para visitar en horarios poco concurridos."
          value={lowTrafficPoints}
          onChange={setLowTrafficPoints}
        />
      </TriggerSection>
      {/* Frequency control */}
      <div className="border border-border rounded-2xl p-5 bg-card space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="Shield" size={18} className="text-primary" />
          <h3 className="text-sm font-bold text-foreground">Control de frecuencia</h3>
        </div>

        {/* Daily limit */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Límite diario</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-foreground">Un cliente puede recibir máximo</span>
            <div className="flex gap-1.5">
              {FREQUENCY_OPTIONS?.map(n => (
                <button
                  key={n}
                  onClick={() => setMaxActionsPerDay(n)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${maxActionsPerDay === n ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-primary/10'}`}
                >
                  {n}
                </button>
              ))}
            </div>
            <span className="text-sm text-foreground">acciones de geofencing por día</span>
          </div>
        </div>

        {/* NEW: Weekly limit */}
        <div className="border-t border-border pt-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Límite semanal</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-foreground">Máximo</span>
            <div className="flex gap-1.5">
              {[3, 5, 7, 10]?.map(n => (
                <button
                  key={n}
                  onClick={() => setMaxActionsPerWeek(n)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${maxActionsPerWeek === n ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-primary/10'}`}
                >
                  {n}
                </button>
              ))}
            </div>
            <span className="text-sm text-foreground">acciones por semana</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">Evita que el límite diario se acumule en 7 días seguidos de notificaciones.</p>
        </div>

        {/* NEW: Grace period */}
        <div className="border-t border-border pt-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Período de gracia entre acciones</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-foreground">Después de ejecutar una acción, esperar</span>
            <input
              type="number"
              min={1}
              max={48}
              value={gracePeriodHours}
              onChange={e => setGracePeriodHours(Number(e?.target?.value))}
              className="w-16 px-2 py-1.5 text-sm border border-border rounded-lg bg-background text-center focus:outline-none"
            />
            <span className="text-sm text-foreground">horas antes de ejecutar otra</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">Diferente al límite diario — es un cooldown entre acciones individuales. Un cliente que entró a las 10 AM no recibirá otro trigger si regresa a las 11 AM.</p>
        </div>

        {/* NEW: Cross-channel exclusion */}
        <div className="border-t border-border pt-4">
          <ToggleRow
            label="Excluir clientes con comunicación reciente"
            desc="No ejecutar si el cliente recibió una comunicación de este negocio recientemente por cualquier canal."
            value={crossChannelExclusion}
            onChange={setCrossChannelExclusion}
          />
          {crossChannelExclusion && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-foreground">No ejecutar si recibió comunicación en las últimas</span>
                <input
                  type="number"
                  min={1}
                  max={72}
                  value={crossChannelHours}
                  onChange={e => setCrossChannelHours(Number(e?.target?.value))}
                  className="w-16 px-2 py-1.5 text-sm border border-border rounded-lg bg-background text-center focus:outline-none"
                />
                <span className="text-sm text-foreground">horas</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Push', 'Email', 'WhatsApp', 'SMS']?.map(ch => (
                  <label key={ch} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-primary" />
                    <span className="text-xs text-foreground">{ch}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5">
                Evita la saturación cross-canal: si el negocio ya mandó un email hoy, el geofence no dispara un push adicional.
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5">
          PromoClub limita las notificaciones de proximidad a 1 por día por negocio para no saturar a tus clientes. Puedes configurar un límite más restrictivo.
        </p>
        <ToggleRow
          label="Respetar horario de operación del negocio"
          desc="Ningún trigger se ejecuta fuera del horario de apertura configurado en tu ficha."
          value={respectHours}
          onChange={setRespectHours}
        />
      </div>
      {/* Geo-conquesting */}
      <div className="border border-border rounded-2xl p-5 bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Target" size={18} className="text-orange-500" />
            <div>
              <h3 className="text-sm font-bold text-foreground">Geo-conquesting</h3>
              <p className="text-xs text-muted-foreground">PREMIUM — Notifica a tus clientes cuando estén cerca de la competencia</p>
            </div>
          </div>
          <button
            onClick={() => setGeoConquesting(!geoConquesting)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${geoConquesting ? 'bg-orange-500' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${geoConquesting ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </button>
        </div>
        {geoConquesting && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-foreground">Radio de detección de competencia:</span>
              <input
                type="number"
                min={50}
                max={500}
                value={conquestRadius}
                onChange={e => setConquestRadius(Number(e?.target?.value))}
                className="w-20 px-2 py-1.5 text-sm border border-border rounded-lg bg-background text-center focus:outline-none"
              />
              <span className="text-sm text-foreground">m</span>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Mensaje personalizable</label>
              <textarea
                value={conquestMsg}
                onChange={e => setConquestMsg(e?.target?.value)}
                maxLength={140}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none resize-none"
              />
            </div>
            <p className="text-xs text-muted-foreground bg-orange-50 border border-orange-200 rounded-lg p-2.5">
              Solo aplica a tus clientes existentes — no a clientes de la competencia. PromoClub detecta la zona usando datos de categoría de negocio de la plataforma.
            </p>
          </div>
        )}
      </div>
      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Guardando...
          </>
        ) : (
          'Guardar configuración de acciones'
        )}
      </button>
    </div>
  );
};

export default TabAcciones;
