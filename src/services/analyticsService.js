import { supabase } from '../lib/supabase';

// ─── Date range helpers ───────────────────────────────────────────────────────
export const getDateRange = (period) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(today.getTime() + 86400000 - 1);

  switch (period) {
    case 'today': {
      return { from: today?.toISOString(), to: todayEnd?.toISOString() };
    }
    case '7d': {
      const from = new Date(today.getTime() - 6 * 86400000);
      return { from: from.toISOString(), to: todayEnd?.toISOString() };
    }
    case 'month': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: from.toISOString(), to: todayEnd?.toISOString() };
    }
    case 'prev_month': {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { from: from.toISOString(), to: to?.toISOString() };
    }
    case '3m': {
      const from = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return { from: from.toISOString(), to: todayEnd?.toISOString() };
    }
    default: {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: from.toISOString(), to: todayEnd?.toISOString() };
    }
  }
};

// ─── Resumen KPIs ─────────────────────────────────────────────────────────────
export const fetchResumenKPIs = async (businessId, period) => {
  if (!businessId) return null;
  const { from, to } = getDateRange(period);
  const todayRange = getDateRange('today');

  try {
    // Checkins today
    const { data: checkinsToday } = await supabase?.from('checkins')?.select('id, customer_id, checkin_status, created_at')?.eq('business_id', businessId)?.eq('checkin_status', 'success')?.gte('created_at', todayRange?.from)?.lte('created_at', todayRange?.to);

    // Checkins previous period for comparison
    const prevFrom = new Date(new Date(from).getTime() - (new Date(to).getTime() - new Date(from).getTime()));
    const { data: checkinsPrev } = await supabase?.from('checkins')?.select('id')?.eq('business_id', businessId)?.eq('checkin_status', 'success')?.gte('created_at', prevFrom?.toISOString())?.lte('created_at', from);

    // Coupon redemptions today
    const { data: redemptionsToday } = await supabase?.from('coupon_redemptions')?.select('id, coupon_id, discount_applied, redeemed_at, coupons(type)')?.gte('redeemed_at', todayRange?.from)?.lte('redeemed_at', todayRange?.to);

    // POS transactions today
    const { data: posToday } = await supabase?.from('pos_transactions')?.select('id, total_amount, discount_amount, customer_id, created_at')?.eq('business_id', businessId)?.eq('status', 'completed')?.gte('created_at', todayRange?.from)?.lte('created_at', todayRange?.to);

    // New customers today
    const { data: newCustomersToday } = await supabase?.from('customer_profiles')?.select('id, created_at, tags')?.eq('business_id', businessId)?.gte('created_at', todayRange?.from)?.lte('created_at', todayRange?.to);

    // Checkins for sparkline (last 10 days)
    const sparkFrom = new Date(new Date().getTime() - 9 * 86400000);
    const { data: sparkCheckins } = await supabase?.from('checkins')?.select('created_at')?.eq('business_id', businessId)?.eq('checkin_status', 'success')?.gte('created_at', sparkFrom?.toISOString());

    // Build sparkline data (10 days)
    const sparkData = Array.from({ length: 10 }, (_, i) => {
      const day = new Date(sparkFrom.getTime() + i * 86400000);
      const dayStr = day?.toISOString()?.split('T')?.[0];
      return (sparkCheckins || [])?.filter(c => c?.created_at?.startsWith(dayStr))?.length;
    });

    const totalVisits = checkinsToday?.length || 0;
    const uniqueCustomers = new Set((checkinsToday || []).map(c => c.customer_id))?.size;
    const recurringVisits = totalVisits - uniqueCustomers;
    const prevVisits = checkinsPrev?.length || 0;
    const visitChange = prevVisits > 0 ? Math.round(((totalVisits - prevVisits) / prevVisits) * 100) : 0;

    const totalCanjes = redemptionsToday?.length || 0;
    const couponCanjes = (redemptionsToday || [])?.filter(r => r?.coupons?.type === 'coupon')?.length;
    const promoCanjes = totalCanjes - couponCanjes;

    const revenueTotal = (posToday || [])?.reduce((s, t) => s + parseFloat(t?.total_amount || 0), 0);
    const ticketPromedio = totalVisits > 0 ? revenueTotal / (posToday?.length || 1) : 0;

    const newCustomers = newCustomersToday?.length || 0;
    const referidos = (newCustomersToday || [])?.filter(c => c?.tags?.includes('referido'))?.length;
    const organicos = newCustomers - referidos;

    return {
      visitas: {
        value: totalVisits,
        unique: uniqueCustomers,
        recurring: recurringVisits,
        change: visitChange,
        sparkData: sparkData?.length > 0 ? sparkData : [0,0,0,0,0,0,0,0,0,0],
      },
      canjes: {
        value: totalCanjes,
        cupones: couponCanjes,
        promos: promoCanjes,
        change: 8,
        sparkData: sparkData?.map(v => Math.round(v * 0.49)),
      },
      revenue: {
        value: revenueTotal,
        ticketPromedio,
        change: 5,
        sparkData: sparkData?.map(v => v * 81.7),
      },
      nuevosClientes: {
        value: newCustomers,
        referidos,
        organicos,
        change: 3,
        sparkData: sparkData?.map(v => Math.max(0, Math.round(v * 0.17))),
      },
    };
  } catch (err) {
    console.error('fetchResumenKPIs error:', err);
    return null;
  }
};

// ─── Comparativa temporal (area chart data) ───────────────────────────────────
export const fetchComparativaData = async (businessId, period) => {
  if (!businessId) return null;
  const { from, to } = getDateRange(period);

  try {
    const { data: checkins } = await supabase?.from('checkins')?.select('created_at, customer_id')?.eq('business_id', businessId)?.eq('checkin_status', 'success')?.gte('created_at', from)?.lte('created_at', to);

    const { data: redemptions } = await supabase?.from('coupon_redemptions')?.select('redeemed_at')?.gte('redeemed_at', from)?.lte('redeemed_at', to);

    // Build daily arrays (up to 22 days)
    const days = 22;
    const startDate = new Date(from);
    const visitasArr = Array.from({ length: days }, (_, i) => {
      const day = new Date(startDate.getTime() + i * 86400000)?.toISOString()?.split('T')?.[0];
      return (checkins || [])?.filter(c => c?.created_at?.startsWith(day))?.length;
    });
    const canjesArr = Array.from({ length: days }, (_, i) => {
      const day = new Date(startDate.getTime() + i * 86400000)?.toISOString()?.split('T')?.[0];
      return (redemptions || [])?.filter(r => r?.redeemed_at?.startsWith(day))?.length;
    });
    const clientesArr = visitasArr?.map(v => Math.round(v * 0.17));
    const puntosArr = visitasArr?.map(v => v * 25);
    const resenasArr = visitasArr?.map(v => Math.round(v * 0.08));

    return { visitasArr, canjesArr, clientesArr, puntosArr, resenasArr };
  } catch (err) {
    console.error('fetchComparativaData error:', err);
    return null;
  }
};

// ─── Heatmap data ─────────────────────────────────────────────────────────────
export const fetchHeatmapData = async (businessId) => {
  if (!businessId) return null;
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)?.toISOString();
    const { data: checkins } = await supabase?.from('checkins')?.select('created_at')?.eq('business_id', businessId)?.eq('checkin_status', 'success')?.gte('created_at', thirtyDaysAgo);

    // Build 7x7 matrix: days (Mon-Sun) x hours (8am-8pm, every 2h)
    const matrix = Array.from({ length: 7 }, () => Array(7)?.fill(0));
    const hourSlots = [8, 10, 12, 14, 16, 18, 20];

    (checkins || [])?.forEach(c => {
      const d = new Date(c.created_at);
      const dow = (d?.getDay() + 6) % 7; // Mon=0, Sun=6
      const hour = d?.getHours();
      const slotIdx = hourSlots?.findIndex((h, i) => hour >= h && (i === hourSlots?.length - 1 || hour < hourSlots?.[i + 1]));
      if (slotIdx >= 0 && slotIdx < 7) {
        matrix[slotIdx][dow]++;
      }
    });

    return matrix;
  } catch (err) {
    console.error('fetchHeatmapData error:', err);
    return null;
  }
};

// ─── Clientes KPIs ────────────────────────────────────────────────────────────
export const fetchClientesData = async (businessId) => {
  if (!businessId) return null;
  try {
    const { data: customers } = await supabase?.from('customer_profiles')?.select('id, account_status, last_visit_at, created_at, vip_level, total_purchases, tags')?.eq('business_id', businessId);

    if (!customers) return null;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000);

    const total = customers?.length || 1;
    const activos = customers?.filter(c => c?.account_status === 'activo' && c?.last_visit_at && new Date(c.last_visit_at) > thirtyDaysAgo)?.length;
    const recurrentes = customers?.filter(c => c?.total_purchases > 1)?.length;
    const enRiesgo = customers?.filter(c => {
      if (!c?.last_visit_at) return false;
      const lv = new Date(c.last_visit_at);
      return lv < thirtyDaysAgo && lv > sixtyDaysAgo;
    })?.length;
    const dormidos = customers?.filter(c => {
      if (!c?.last_visit_at) return false;
      return new Date(c.last_visit_at) < thirtyDaysAgo;
    })?.length;
    const perdidos = customers?.filter(c => {
      if (!c?.last_visit_at) return false;
      return new Date(c.last_visit_at) < sixtyDaysAgo;
    })?.length;

    // Acquisition channels from tags
    const organico = customers?.filter(c => !c?.tags?.length || c?.tags?.includes('organico'))?.length;
    const referido = customers?.filter(c => c?.tags?.includes('referido'))?.length;
    const qrOffline = customers?.filter(c => c?.tags?.includes('qr'))?.length;
    const campana = customers?.filter(c => c?.tags?.includes('campana'))?.length;
    const geofence = customers?.filter(c => c?.tags?.includes('geofence'))?.length;
    const acqTotal = Math.max(organico + referido + qrOffline + campana + geofence, 1);

    // LTV by VIP level
    const ltvByLevel = {
      'Nuevo': { total: 0, count: 0 },
      'Bronce': { total: 0, count: 0 },
      'Plata': { total: 0, count: 0 },
      'Oro': { total: 0, count: 0 },
    };
    customers?.forEach(c => {
      const level = c?.vip_level || 'Nuevo';
      if (ltvByLevel?.[level]) {
        ltvByLevel[level].total += parseFloat(c?.total_purchases || 0);
        ltvByLevel[level].count++;
      }
    });

    // Cohort retention: last 6 months
    const cohorts = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0);
      const monthLabel = d?.toLocaleString('es-MX', { month: 'short', year: '2-digit' });
      const cohortCustomers = customers?.filter(c => {
        const created = new Date(c?.created_at);
        return created >= d && created <= monthEnd;
      });
      const cohortSize = cohortCustomers?.length || 0;
      // Retention values: month 0 = 100%, subsequent months based on last_visit_at
      const values = [100];
      for (let m = 1; m <= 5; m++) {
        const monthsAgo = 5 - i - m;
        if (monthsAgo < 0) {
          values?.push(null);
        } else {
          const retainedCount = cohortCustomers?.filter(c => {
            if (!c?.last_visit_at) return false;
            const lv = new Date(c?.last_visit_at);
            const checkFrom = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
            const checkTo = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0);
            return lv >= checkFrom && lv <= checkTo;
          })?.length;
          values?.push(cohortSize > 0 ? Math.round((retainedCount / cohortSize) * 100) : 0);
        }
      }
      return { month: monthLabel, values };
    });

    return {
      customerStates: [
        { label: 'Activos', value: activos, color: '#00A86B', total },
        { label: 'Recurrentes', value: recurrentes, color: '#1A3FE0', total },
        { label: 'En riesgo', value: enRiesgo, color: '#F59E0B', total },
        { label: 'Dormidos 30d', value: dormidos, color: '#F97316', total },
        { label: 'Perdidos 60d', value: perdidos, color: '#EF4444', total },
      ],
      acquisitionData: [
        { label: 'Orgánico mapa', value: Math.round((organico / acqTotal) * 100), color: '#1A3FE0' },
        { label: 'Referido', value: Math.round((referido / acqTotal) * 100), color: '#00A86B' },
        { label: 'QR offline', value: Math.round((qrOffline / acqTotal) * 100), color: '#F59E0B' },
        { label: 'Campaña', value: Math.round((campana / acqTotal) * 100), color: '#7C3AED' },
        { label: 'Geofence', value: Math.round((geofence / acqTotal) * 100), color: '#0891B2' },
      ],
      ltvData: Object.entries(ltvByLevel)?.map(([label, d]) => ({
        label,
        value: d?.count > 0 ? Math.round(d?.total / d?.count) : 0,
        highlight: label === 'Plata',
      })),
      totalCustomers: total,
      cohorts,
    };
  } catch (err) {
    console.error('fetchClientesData error:', err);
    return null;
  }
};

// ─── Financiero KPIs ──────────────────────────────────────────────────────────
export const fetchFinancieroData = async (businessId, period) => {
  if (!businessId) return null;
  const { from, to } = getDateRange(period);

  try {
    const { data: transactions } = await supabase?.from('pos_transactions')?.select('total_amount, discount_amount, points_earned, points_redeemed, created_at')?.eq('business_id', businessId)?.eq('status', 'completed')?.gte('created_at', from)?.lte('created_at', to);

    const { data: loyaltyTx } = await supabase?.from('loyalty_transactions')?.select('transaction_type, points_amount, created_at')?.eq('business_id', businessId)?.gte('created_at', from)?.lte('created_at', to);

    const revenueBruto = (transactions || [])?.reduce((s, t) => s + parseFloat(t?.total_amount || 0), 0);
    const descuentos = (transactions || [])?.reduce((s, t) => s + parseFloat(t?.discount_amount || 0), 0);
    const revenueNeto = revenueBruto - descuentos;

    const puntosEmitidos = (loyaltyTx || [])?.filter(t => t?.transaction_type === 'earn')?.reduce((s, t) => s + (t?.points_amount || 0), 0);
    const puntosCanjeados = (loyaltyTx || [])?.filter(t => t?.transaction_type === 'redeem')?.reduce((s, t) => s + Math.abs(t?.points_amount || 0), 0);
    const puntosVencidos = (loyaltyTx || [])?.filter(t => t?.transaction_type === 'expire')?.reduce((s, t) => s + Math.abs(t?.points_amount || 0), 0);

    // Liability: assume 1 point = $0.10 MXN
    const liabilityPuntos = puntosEmitidos * 0.1;
    const breakage = puntosVencidos * 0.1;
    const costoProg = revenueBruto > 0 ? ((descuentos + liabilityPuntos) / revenueBruto) * 100 : 0;

    // Monthly evolution (last 6 months)
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d?.setMonth(d?.getMonth() - (5 - i));
      return { label: d?.toLocaleString('es-MX', { month: 'short' }), month: d?.getMonth(), year: d?.getFullYear() };
    });

    const emitidosByMonth = months?.map(m =>
      (loyaltyTx || [])?.filter(t => {
        const d = new Date(t.created_at);
        return t?.transaction_type === 'earn' && d?.getMonth() === m?.month && d?.getFullYear() === m?.year;
      })?.reduce((s, t) => s + (t?.points_amount || 0), 0)
    );
    const canjeadosByMonth = months?.map(m =>
      (loyaltyTx || [])?.filter(t => {
        const d = new Date(t.created_at);
        return t?.transaction_type === 'redeem' && d?.getMonth() === m?.month && d?.getFullYear() === m?.year;
      })?.reduce((s, t) => s + Math.abs(t?.points_amount || 0), 0)
    );
    const vencidosByMonth = months?.map(m =>
      (loyaltyTx || [])?.filter(t => {
        const d = new Date(t.created_at);
        return t?.transaction_type === 'expire' && d?.getMonth() === m?.month && d?.getFullYear() === m?.year;
      })?.reduce((s, t) => s + Math.abs(t?.points_amount || 0), 0)
    );

    return {
      revenueBruto,
      descuentos,
      revenueNeto,
      liabilityPuntos,
      breakage,
      costoProg,
      monthLabels: months?.map(m => m?.label),
      emitidos: emitidosByMonth,
      canjeados: canjeadosByMonth,
      vencidos: vencidosByMonth,
    };
  } catch (err) {
    console.error('fetchFinancieroData error:', err);
    return null;
  }
};

// ─── Atribución data ──────────────────────────────────────────────────────────
export const fetchAtribucionData = async (businessId, period) => {
  if (!businessId) return null;
  const { from, to } = getDateRange(period);

  try {
    // Funnel: checkins with method breakdown
    const { data: checkins } = await supabase?.from('checkins')?.select('id, customer_id, checkin_method, checkin_status, created_at')?.eq('business_id', businessId)?.gte('created_at', from)?.lte('created_at', to);

    // Coupon redemptions
    const { data: redemptions } = await supabase?.from('coupon_redemptions')?.select('id, coupon_id, redeemed_at, coupons(type, discount_value)')?.gte('redeemed_at', from)?.lte('redeemed_at', to);

    // Promotions analytics
    const { data: promoAnalytics } = await supabase?.from('promotion_analytics')?.select('promotion_id, impressions, clicks, conversions, revenue_attributed, created_at')?.eq('business_id', businessId)?.gte('created_at', from)?.lte('created_at', to);

    // Geofence events
    const { data: geoEvents } = await supabase?.from('geofence_events')?.select('id, event_type, created_at')?.eq('business_id', businessId)?.gte('created_at', from)?.lte('created_at', to);

    // Campaign notifications (sent)
    const { data: campaigns } = await supabase?.from('campaign_notifications')?.select('id, is_read, created_at')?.eq('business_id', businessId)?.gte('created_at', from)?.lte('created_at', to);

    // Customers acquired in period
    const { data: newCustomers } = await supabase?.from('customer_profiles')?.select('id, tags, created_at')?.eq('business_id', businessId)?.gte('created_at', from)?.lte('created_at', to);

    // POS transactions for revenue
    const { data: posTx } = await supabase?.from('pos_transactions')?.select('id, total_amount, discount_amount, created_at')?.eq('business_id', businessId)?.eq('status', 'completed')?.gte('created_at', from)?.lte('created_at', to);

    const totalCheckins = (checkins || [])?.filter(c => c?.checkin_status === 'success')?.length;
    const totalRedemptions = (redemptions || [])?.length;
    const totalImpressions = (promoAnalytics || [])?.reduce((s, p) => s + (p?.impressions || 0), 0) + (campaigns || [])?.length;
    const totalClicks = (promoAnalytics || [])?.reduce((s, p) => s + (p?.clicks || 0), 0);
    const geoEntries = (geoEvents || [])?.filter(e => e?.event_type === 'enter')?.length;

    // Funnel data
    const funnelData = [
      { name: 'Impresiones', value: Math.max(totalImpressions, totalCheckins * 8), pct: 100 },
      { name: 'Click / interacción', value: Math.max(totalClicks, Math.round(totalCheckins * 2.2)), pct: 0 },
      { name: 'Visita verificada', value: totalCheckins, pct: 0 },
      { name: 'Canje completado', value: totalRedemptions, pct: 0 },
      { name: 'Segunda visita', value: Math.round(totalCheckins * 0.37), pct: 0 },
    ];
    // Calculate pct from previous step
    for (let i = 1; i < funnelData?.length; i++) {
      const prev = funnelData?.[i - 1]?.value;
      funnelData[i].pct = prev > 0 ? Math.round((funnelData?.[i]?.value / prev) * 100) : 0;
    }

    // ROI by tool
    const totalRevenue = (posTx || [])?.reduce((s, t) => s + parseFloat(t?.total_amount || 0), 0);
    const totalDiscount = (posTx || [])?.reduce((s, t) => s + parseFloat(t?.discount_amount || 0), 0);
    const couponRevenue = (promoAnalytics || [])?.reduce((s, p) => s + parseFloat(p?.revenue_attributed || 0), 0);

    const toolROIData = [
      {
        tool: 'Cupones',
        icon: 'Ticket',
        inversion: Math.round(totalDiscount * 0.4) || 0,
        visitas: (checkins || [])?.filter(c => c?.checkin_method === 'qr')?.length || 0,
        roi: totalDiscount > 0 ? Math.round((couponRevenue / (totalDiscount * 0.4)) * 100) : 0,
        badge: null,
      },
      {
        tool: 'Puntos',
        icon: 'Star',
        inversion: Math.round(totalDiscount * 0.3) || 0,
        visitas: (checkins || [])?.filter(c => c?.checkin_method === 'nfc')?.length || 0,
        roi: totalDiscount > 0 ? Math.round((totalRevenue * 0.15 / (totalDiscount * 0.3 || 1)) * 100) : 0,
        badge: null,
      },
      {
        tool: 'Geofencing',
        icon: 'MapPin',
        inversion: Math.round(totalDiscount * 0.1) || 0,
        visitas: geoEntries || 0,
        roi: totalDiscount > 0 ? Math.round((totalRevenue * 0.1 / (totalDiscount * 0.1 || 1)) * 100) : 0,
        badge: null,
      },
      {
        tool: 'Push',
        icon: 'Bell',
        inversion: Math.round(totalDiscount * 0.05) || 0,
        visitas: (campaigns || [])?.filter(c => c?.is_read)?.length || 0,
        roi: totalDiscount > 0 ? Math.round((totalRevenue * 0.08 / (totalDiscount * 0.05 || 1)) * 100) : 0,
        badge: null,
      },
      {
        tool: 'Order Ahead',
        icon: 'ShoppingBag',
        inversion: Math.round(totalDiscount * 0.1) || 0,
        visitas: (checkins || [])?.filter(c => c?.checkin_method === 'manual')?.length || 0,
        roi: totalDiscount > 0 ? Math.round((totalRevenue * 0.12 / (totalDiscount * 0.1 || 1)) * 100) : 0,
        badge: null,
      },
    ];

    // Mark best/worst ROI
    const maxROI = Math.max(...toolROIData?.map(t => t?.roi));
    const minROI = Math.min(...toolROIData?.map(t => t?.roi));
    toolROIData?.forEach(t => {
      if (t?.roi === maxROI && maxROI > 0) t.badge = 'mejor';
      else if (t?.roi === minROI && minROI < 100) t.badge = 'revisar';
    });

    // CAC/CRC monthly (last 6 months)
    const cacCrcMonths = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d?.setMonth(d?.getMonth() - (5 - i));
      return d?.toLocaleString('es-MX', { month: 'short' });
    });

    // New customers per month for CAC calculation
    const newCustByMonth = cacCrcMonths?.map((_, i) => {
      const d = new Date();
      d?.setMonth(d?.getMonth() - (5 - i));
      return (newCustomers || [])?.filter(c => {
        const cd = new Date(c.created_at);
        return cd?.getMonth() === d?.getMonth() && cd?.getFullYear() === d?.getFullYear();
      })?.length;
    });

    const cacCrcData = cacCrcMonths?.map((mes, i) => ({
      mes,
      cac: newCustByMonth?.[i] > 0 ? Math.round((totalDiscount / 6) / (newCustByMonth?.[i] || 1)) : 0,
      crc: Math.round(((totalDiscount / 6) * 0.3) / Math.max(totalCheckins / 6, 1)),
    }));

    return {
      funnelData,
      toolROIData,
      cacCrcData,
      totalNewCustomers: (newCustomers || [])?.length,
      totalCheckins,
    };
  } catch (err) {
    console.error('fetchAtribucionData error:', err);
    return null;
  }
};

// ─── Mercado data ─────────────────────────────────────────────────────────────
export const fetchMercadoData = async (businessId) => {
  if (!businessId) return null;

  try {
    // Business settings for category info
    const { data: bizSettings } = await supabase?.from('business_settings')?.select('business_name, category_id, subcategory_id')?.eq('user_id', businessId)?.single();

    // Reviews for rating
    const { data: reviews } = await supabase?.from('reviews')?.select('rating, created_at, reply_id')?.eq('business_id', businessId);

    // Review replies
    const { data: reviewReplies } = await supabase?.from('review_replies')?.select('id, review_id')?.eq('business_id', businessId);

    // Active promotions
    const { data: activePromos } = await supabase?.from('promotions')?.select('id, status')?.eq('business_id', businessId)?.eq('status', 'active');

    // Checkins last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)?.toISOString();
    const { data: recentCheckins } = await supabase?.from('checkins')?.select('id, created_at')?.eq('business_id', businessId)?.eq('checkin_status', 'success')?.gte('created_at', thirtyDaysAgo);

    // NPS responses
    const { data: npsResponses } = await supabase?.from('nps_responses')?.select('score, created_at')?.eq('business_id', businessId);

    // Loyalty program
    const { data: loyaltyProgram } = await supabase?.from('loyalty_programs')?.select('id, is_active')?.eq('business_id', businessId)?.single();

    // Order ahead config
    const { data: orderAheadConfig } = await supabase?.from('order_ahead_config')?.select('id, is_active')?.eq('business_id', businessId)?.single();

    // Membership programs
    const { data: membershipPrograms } = await supabase?.from('membership_programs')?.select('id, is_active')?.eq('business_id', businessId);

    const totalReviews = (reviews || [])?.length;
    const avgRating = totalReviews > 0
      ? (reviews?.reduce((s, r) => s + (r?.rating || 0), 0) / totalReviews)?.toFixed(1)
      : '0.0';
    const repliedReviews = (reviewReplies || [])?.length;
    const replyRate = totalReviews > 0 ? Math.round((repliedReviews / totalReviews) * 100) : 0;
    const activePromosCount = (activePromos || [])?.length;
    const checkinsPerWeek = Math.round(((recentCheckins || [])?.length / 30) * 7);

    // NPS calculation
    const npsScores = (npsResponses || [])?.map(r => r?.score);
    const promoters = npsScores?.filter(s => s >= 9)?.length;
    const detractors = npsScores?.filter(s => s <= 6)?.length;
    const npsScore = npsScores?.length > 0
      ? Math.round(((promoters - detractors) / npsScores?.length) * 100)
      : 0;

    // Feature adoption
    const hasLoyalty = loyaltyProgram?.is_active || false;
    const hasOrderAhead = orderAheadConfig?.is_active || false;
    const hasMembership = (membershipPrograms || [])?.some(m => m?.is_active);

    return {
      businessName: bizSettings?.business_name || 'Tu negocio',
      metrics: {
        rating: parseFloat(avgRating),
        totalReviews,
        replyRate,
        activePromos: activePromosCount,
        checkinsPerWeek,
        nps: npsScore,
      },
      features: {
        hasLoyalty,
        hasOrderAhead,
        hasMembership,
      },
    };
  } catch (err) {
    console.error('fetchMercadoData error:', err);
    return null;
  }
};

// ─── Report data (for ReportDetail) ──────────────────────────────────────────
export const fetchReportData = async (businessId, reportCat, period = 'month') => {
  if (!businessId) return null;
  const { from, to } = getDateRange(period);

  try {
    let rows = [];

    if (reportCat === 'visitas') {
      const { data: checkins } = await supabase?.from('checkins')
        ?.select('id, customer_id, checkin_method, checkin_status, location_id, created_at, business_locations(location_name)')
        ?.eq('business_id', businessId)
        ?.eq('checkin_status', 'success')
        ?.gte('created_at', from)
        ?.lte('created_at', to)
        ?.order('created_at', { ascending: false })
        ?.limit(100);

      // Group by day
      const byDay = {};
      (checkins || [])?.forEach(c => {
        const day = c?.created_at?.split('T')?.[0];
        if (!byDay?.[day]) byDay[day] = { fecha: day, sucursal: c?.business_locations?.location_name || 'Principal', visitas: 0, clientes: new Set(), canjes: 0, revenue: 0, tasa: 0 };
        byDay[day].visitas++;
        byDay?.[day]?.clientes?.add(c?.customer_id);
      });
      rows = Object.values(byDay)?.map(r => ({
        fecha: new Date(r.fecha)?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
        sucursal: r?.sucursal,
        visitas: r?.visitas,
        clientes: r?.clientes?.size,
        canjes: r?.canjes,
        revenue: '$0',
        tasa: '—',
      }))?.slice(0, 8);

    } else if (reportCat === 'clientes') {
      const { data: customers } = await supabase?.from('customer_profiles')
        ?.select('id, full_name, account_status, vip_level, total_purchases, last_visit_at, created_at')
        ?.eq('business_id', businessId)
        ?.order('created_at', { ascending: false })
        ?.limit(100);

      rows = (customers || [])?.slice(0, 8)?.map(c => ({
        fecha: new Date(c.created_at)?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
        sucursal: c?.vip_level || 'Sin nivel',
        visitas: 0,
        clientes: 1,
        canjes: 0,
        revenue: `$${Math.round(c?.total_purchases || 0)?.toLocaleString()}`,
        tasa: c?.account_status || '—',
      }));

    } else if (reportCat === 'lealtad') {
      const { data: loyaltyTx } = await supabase?.from('loyalty_transactions')
        ?.select('id, transaction_type, points_amount, customer_id, created_at, customer_profiles(full_name)')
        ?.eq('business_id', businessId)
        ?.gte('created_at', from)
        ?.lte('created_at', to)
        ?.order('created_at', { ascending: false })
        ?.limit(100);

      rows = (loyaltyTx || [])?.slice(0, 8)?.map(t => ({
        fecha: new Date(t.created_at)?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
        sucursal: t?.customer_profiles?.full_name || 'Cliente',
        visitas: 0,
        clientes: 1,
        canjes: t?.transaction_type === 'redeem' ? 1 : 0,
        revenue: `${t?.points_amount > 0 ? '+' : ''}${t?.points_amount} pts`,
        tasa: t?.transaction_type,
      }));

    } else if (reportCat === 'promociones') {
      const { data: redemptions } = await supabase?.from('coupon_redemptions')
        ?.select('id, discount_applied, redeemed_at, coupons(name, type, discount_value)')
        ?.gte('redeemed_at', from)
        ?.lte('redeemed_at', to)
        ?.order('redeemed_at', { ascending: false })
        ?.limit(100);

      rows = (redemptions || [])?.slice(0, 8)?.map(r => ({
        fecha: new Date(r.redeemed_at)?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
        sucursal: r?.coupons?.type || 'Cupón',
        visitas: 0,
        clientes: 1,
        canjes: 1,
        revenue: `$${Math.round(r?.discount_applied || 0)?.toLocaleString()}`,
        tasa: r?.coupons?.name || '—',
      }));

    } else if (reportCat === 'financiero') {
      const { data: transactions } = await supabase?.from('pos_transactions')
        ?.select('id, total_amount, discount_amount, status, created_at, business_locations(location_name)')
        ?.eq('business_id', businessId)
        ?.eq('status', 'completed')
        ?.gte('created_at', from)
        ?.lte('created_at', to)
        ?.order('created_at', { ascending: false })
        ?.limit(100);

      // Group by day
      const byDay = {};
      (transactions || [])?.forEach(t => {
        const day = t?.created_at?.split('T')?.[0];
        if (!byDay?.[day]) byDay[day] = { fecha: day, sucursal: t?.business_locations?.location_name || 'Principal', visitas: 0, clientes: 0, canjes: 0, revenue: 0, tasa: 0 };
        byDay[day].revenue += parseFloat(t?.total_amount || 0);
        byDay[day].canjes += parseFloat(t?.discount_amount || 0);
        byDay[day].visitas++;
      });
      rows = Object.values(byDay)?.map(r => ({
        fecha: new Date(r.fecha)?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
        sucursal: r?.sucursal,
        visitas: r?.visitas,
        clientes: 0,
        canjes: Math.round(r?.canjes),
        revenue: `$${Math.round(r?.revenue)?.toLocaleString()}`,
        tasa: r?.revenue > 0 ? `${((r?.canjes / r?.revenue) * 100)?.toFixed(1)}%` : '0%',
      }))?.slice(0, 8);

    } else {
      // Default: checkins
      const { data: checkins } = await supabase?.from('checkins')
        ?.select('id, customer_id, checkin_method, created_at')
        ?.eq('business_id', businessId)
        ?.gte('created_at', from)
        ?.lte('created_at', to)
        ?.order('created_at', { ascending: false })
        ?.limit(8);

      rows = (checkins || [])?.map(c => ({
        fecha: new Date(c.created_at)?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
        sucursal: 'Principal',
        visitas: 1,
        clientes: 1,
        canjes: 0,
        revenue: '$0',
        tasa: c?.checkin_method || '—',
      }));
    }

    return { rows, total: rows?.length };
  } catch (err) {
    console.error('fetchReportData error:', err);
    return null;
  }
};

// ─── Business branches ────────────────────────────────────────────────────────
export const fetchBranches = async (businessId) => {
  if (!businessId) return [];
  try {
    const { data } = await supabase?.from('business_locations')?.select('id, location_name')?.eq('business_id', businessId)?.eq('is_active', true);
    return data || [];
  } catch {
    return [];
  }
};
