import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useRealtimeData
 * Generic hook for subscribing to Supabase real-time postgres_changes
 * on one or more tables. Calls onRefresh whenever any subscribed table changes.
 *
 * @param {object} options
 * @param {string}   options.channelName  - Unique channel identifier
 * @param {string[]} options.tables       - Array of table names to watch
 * @param {string}   [options.schema]     - DB schema (default: 'public')
 * @param {string[]} [options.events]     - Events to watch: INSERT | UPDATE | DELETE | * (default: ['*'])
 * @param {function} options.onRefresh    - Callback invoked on any change: (payload) => void
 * @param {boolean}  [options.enabled]    - Whether subscription is active (default: true)
 */
const useRealtimeData = ({
  channelName,
  tables = [],
  schema = 'public',
  events = ['*'],
  onRefresh,
  enabled = true,
} = {}) => {
  const channelRef = useRef(null);
  const onRefreshRef = useRef(onRefresh);

  // Keep callback ref fresh without re-subscribing
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  const cleanup = useCallback(() => {
    if (channelRef?.current) {
      try {
        supabase?.removeChannel(channelRef?.current);
      } catch (_) {}
      channelRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled || !channelName || tables?.length === 0) return;

    cleanup();

    let channel = supabase?.channel(channelName);

    tables?.forEach((table) => {
      events?.forEach((event) => {
        channel = channel?.on(
          'postgres_changes',
          { event, schema, table },
          (payload) => {
            onRefreshRef?.current?.(payload);
          }
        );
      });
    });

    channelRef.current = channel?.subscribe();

    return cleanup;
  }, [channelName, enabled, schema, tables?.join(','), events?.join(','), cleanup]);

  return { cleanup };
};

export default useRealtimeData;
