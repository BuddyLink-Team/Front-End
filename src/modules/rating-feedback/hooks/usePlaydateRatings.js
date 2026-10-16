import { useCallback, useEffect, useState } from 'react';
import { ratingFeedbackApi } from '../api/ratingFeedbackApi';
import { APP_EVENTS } from '../../../constants/event.constants';

const EMPTY_RATINGS = { summary: { count: 0, average: 0 }, ratings: [], canRate: false };

/**
 * Ratings & feedback of one playdate (GET /playdates/:id/ratings).
 * Reloads whenever a rating is submitted anywhere in the app.
 */
export function usePlaydateRatings(playdateId, enabled = true) {
  const [data, setData] = useState(EMPTY_RATINGS);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRatings = useCallback(async () => {
    if (!playdateId || !enabled) return;
    setIsLoading(true);
    try {
      const response = await ratingFeedbackApi.getByPlaydate(playdateId);
      setData(response?.data || EMPTY_RATINGS);
    } catch {
      setData(EMPTY_RATINGS);
    } finally {
      setIsLoading(false);
    }
  }, [playdateId, enabled]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  useEffect(() => {
    window.addEventListener(APP_EVENTS.PLAYDATE_RATING_SUBMITTED, fetchRatings);
    return () => window.removeEventListener(APP_EVENTS.PLAYDATE_RATING_SUBMITTED, fetchRatings);
  }, [fetchRatings]);

  return { ...data, isLoading, refetch: fetchRatings };
}

export default usePlaydateRatings;
