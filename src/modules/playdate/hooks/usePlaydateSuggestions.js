import { useMemo } from 'react';
import {
  fetchTimeSlotSuggestions,
  fetchPlaceSuggestions,
  fetchActivitySuggestions,
} from '../redux/playdateSlice';
import { useDebouncedQuery } from './useDebouncedQuery';

/**
 * Planning suggestions for a new playdate, for the host child and the invited children:
 * - time slots: reloaded when the children or the duration change;
 * - places and activities: reloaded when the children change only.
 *
 * @param {Object} input
 * @param {string} input.childId - Host child
 * @param {string[]} input.participantChildIds - Invited children
 * @param {number} input.durationMinutes
 */
export const usePlaydateSuggestions = ({ childId, participantChildIds, durationMinutes }) => {
  const childrenKey = [...participantChildIds].sort().join(',');

  const groupParams = useMemo(
    () => (childId ? { childId, ...(childrenKey ? { participantChildIds: childrenKey } : {}) } : null),
    [childId, childrenKey],
  );
  const slotParams = useMemo(
    () => (groupParams ? { ...groupParams, durationMinutes } : null),
    [groupParams, durationMinutes],
  );

  const timeSlots = useDebouncedQuery(fetchTimeSlotSuggestions, slotParams, 'slots');
  const places = useDebouncedQuery(fetchPlaceSuggestions, groupParams, 'places');
  const activities = useDebouncedQuery(fetchActivitySuggestions, groupParams, 'activities');

  return { timeSlots, places, activities };
};

export default usePlaydateSuggestions;
