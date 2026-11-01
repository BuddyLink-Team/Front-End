import { useCallback, useEffect, useState } from 'react';
import { ratingFeedbackApi } from '../api/ratingFeedbackApi';
import { APP_EVENTS } from '../../../constants/event.constants';

// Playdates only become completed by the host's action or the daily auto-close job, so a slow poll is enough;
// focus / tab visible still checks right away
const POLL_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Completed playdates the parent still has to rate (GET /playdates/ratings/pending).
 * Polls every 5 min, on focus / tab visible and after a rating is submitted anywhere in the app.
 * Errors are silent: the parent screen stays usable and the next poll retries.
 *
 * @param {boolean} enabled - Only signed-in parents are polled
 * @param {string} [userId] - Resets the list (and dismissed items) when the account changes
 */
export function usePendingRatings(enabled, userId) {
  const [pending, setPending] = useState([]);
  const [dismissed, setDismissed] = useState(() => new Set());

  useEffect(() => {
    setPending([]);
    setDismissed(new Set());
    if (!enabled) return undefined;
    let active = true, loading = false;
    const check = async () => {
      if (loading || document.visibilityState === 'hidden') return;
      loading = true;
      try {
        const response = await ratingFeedbackApi.getPending();
        if (active) setPending(response.data);
      } catch {
        // Keep the parent screen usable; retry on focus / the next poll.
      } finally { loading = false; }
    };
    void check();
    const timer = window.setInterval(check, POLL_INTERVAL_MS);
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', check);
    // A playdate rated elsewhere (e.g. the playdate list) must not pop up here again
    window.addEventListener(APP_EVENTS.PLAYDATE_RATING_SUBMITTED, check);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener(APP_EVENTS.PLAYDATE_RATING_SUBMITTED, check);
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', check);
    };
  }, [enabled, userId]);

  const dismiss = useCallback((playdateId) => setDismissed((previous) => new Set([...previous, playdateId])), []);
  const remove = useCallback((playdateId) => setPending((previous) => previous.filter((item) => item._id !== playdateId)), []);

  return {
    playdate: pending.find((item) => !dismissed.has(item._id)),
    dismiss,
    remove,
  };
}

export default usePendingRatings;
