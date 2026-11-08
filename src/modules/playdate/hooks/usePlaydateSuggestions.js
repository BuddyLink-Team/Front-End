import { useMemo } from 'react';
import {
  fetchTimeSlotSuggestions,
  fetchPlaceSuggestions,
  fetchActivitySuggestions,
} from '../redux/playdateSlice';
import { useDebouncedQuery } from './useDebouncedQuery';

/**
 * Planning suggestions for a new playdate, for the host child and the invited children:
 * - time slots: reloaded when the children, the duration or the chosen place change (only the times the
 *   place is open and that break no time rule are offered);
 * - places: reloaded when the children or the picked time change (places closed then come last);
 * - activities: reloaded when the children change only.
 *
 * @param {Object} input
 * @param {string} input.childId - Host child
 * @param {string[]} input.participantChildIds - Other own children and invited children
 * @param {number} input.durationMinutes
 * @param {string} [input.date] - Picked day
 * @param {string} [input.time] - Picked start time
 * @param {string|null} [input.placeId] - Chosen place (OpenStreetMap id)
 */
export const usePlaydateSuggestions = ({ childId, participantChildIds, durationMinutes, date, time, placeId }) => {
  const childrenKey = [...participantChildIds].sort().join(',');

  const groupParams = useMemo(
    () => (childId ? { childId, ...(childrenKey ? { participantChildIds: childrenKey } : {}) } : null),
    [childId, childrenKey],
  );
  const slotParams = useMemo(
    () => (groupParams ? { ...groupParams, durationMinutes, ...(placeId ? { placeId } : {}) } : null),
    [groupParams, durationMinutes, placeId],
  );
  const hasTime = Boolean(date && /^\d{2}:\d{2}$/.test(time || ''));
  const placeParams = useMemo(
    () => (groupParams && hasTime ? { ...groupParams, date, time, durationMinutes } : groupParams),
    [groupParams, hasTime, date, time, durationMinutes],
  );

  const timeSlots = useDebouncedQuery(fetchTimeSlotSuggestions, slotParams, 'slots');
  const places = useDebouncedQuery(fetchPlaceSuggestions, placeParams, 'places');
  const activities = useDebouncedQuery(fetchActivitySuggestions, groupParams, 'activities');

  return { timeSlots, places, activities };
};

export default usePlaydateSuggestions;
