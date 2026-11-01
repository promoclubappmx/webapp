import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useGamificationRealtime
 * Subscribes to real-time changes on gamification tables:
 * customer_achievements, loyalty_points, loyalty_transactions,
 * customer_vip_levels, checkins
 *
 * @param {object} options
 * @param {string} options.userId - authenticated user id (business owner)
 * @param {function} options.onAchievementChange - called when customer_achievements changes
 * @param {function} options.onLoyaltyChange - called when loyalty_points or loyalty_transactions changes
 * @param {function} options.onVIPChange - called when customer_vip_levels changes
 * @param {function} options.onCheckinChange - called when checkins changes
 */
const useGamificationRealtime = ({
  userId,
  onAchievementChange,
  onLoyaltyChange,
  onVIPChange,
  onCheckinChange,
} = {}) => {
  const channelsRef = useRef([]);

  const cleanup = useCallback(() => {
    channelsRef?.current?.forEach(ch => {
      try { supabase?.removeChannel(ch); } catch (_) {}
    });
    channelsRef.current = [];
  }, []);

  useEffect(() => {
    if (!userId) return;

    cleanup();

    // ── Customer Achievements ──────────────────────────────────────────────
    if (onAchievementChange) {
      const achChannel = supabase?.channel(`customer_achievements_${userId}`)?.on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'customer_achievements' },
          (payload) => {
            onAchievementChange(payload);
          }
        )?.subscribe();
      channelsRef?.current?.push(achChannel);
    }

    // ── Loyalty Points ─────────────────────────────────────────────────────
    if (onLoyaltyChange) {
      const loyaltyChannel = supabase?.channel(`loyalty_points_${userId}`)?.on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'loyalty_points' },
          (payload) => {
            onLoyaltyChange({ type: 'points', payload });
          }
        )?.on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'loyalty_transactions' },
          (payload) => {
            onLoyaltyChange({ type: 'transaction', payload });
          }
        )?.subscribe();
      channelsRef?.current?.push(loyaltyChannel);
    }

    // ── VIP Levels ─────────────────────────────────────────────────────────
    if (onVIPChange) {
      const vipChannel = supabase?.channel(`customer_vip_levels_${userId}`)?.on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'customer_vip_levels' },
          (payload) => {
            onVIPChange(payload);
          }
        )?.subscribe();
      channelsRef?.current?.push(vipChannel);
    }

    // ── Check-ins (streak triggers) ────────────────────────────────────────
    if (onCheckinChange) {
      const checkinChannel = supabase?.channel(`checkins_${userId}`)?.on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'checkins' },
          (payload) => {
            onCheckinChange(payload);
          }
        )?.subscribe();
      channelsRef?.current?.push(checkinChannel);
    }

    return cleanup;
  }, [userId, onAchievementChange, onLoyaltyChange, onVIPChange, onCheckinChange, cleanup]);

  return { cleanup };
};

export default useGamificationRealtime;
