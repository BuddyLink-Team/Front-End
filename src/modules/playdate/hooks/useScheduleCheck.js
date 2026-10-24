import { useMemo } from 'react';
import { fetchBusyTimes } from '../redux/playdateSlice';
import { useDebouncedQuery } from './useDebouncedQuery';
import { findScheduleConflicts, findNextFreeTime } from '../utils/scheduleConflicts';

// Busy times follow the picked date quickly
const BUSY_TIMES_DEBOUNCE_MS = 200;

/**
 * Check a schedule against the children's other playdates while the parent picks it, instead of waiting
 * for the 409 SCHEDULE_CONFLICT on submit.
 *
 * @param {Object} input
 * @param {string} input.childId - The caller's own child (host child, or the invited child answering)
 * @param {string[]} [input.participantChildIds] - Other families' children to check too
 * @param {string} input.date - "YYYY-MM-DD"
 * @param {string} input.time - "HH:mm"
 * @param {number} input.durationMinutes
 * @param {string} [input.excludePlaydateId] - The playdate being rescheduled / answered
 * @returns {{ busy: Array, ownConflicts: Array, otherConflicts: Array, freeTime: string|null, isLoading: boolean }}
 */
export const useScheduleCheck = ({ childId, participantChildIds = [], date, time, durationMinutes, excludePlaydateId }) => {
  const childrenKey = [...participantChildIds].sort().join(',');
  const params = useMemo(
    () =>
      childId && date
        ? {
            childId,
            date,
            ...(childrenKey ? { participantChildIds: childrenKey } : {}),
            ...(excludePlaydateId ? { excludePlaydateId } : {}),
          }
        : null,
    [childId, date, childrenKey, excludePlaydateId],
  );
  const { items: busy, isLoading, isRefreshing } = useDebouncedQuery(fetchBusyTimes, params, 'busy', BUSY_TIMES_DEBOUNCE_MS);

  return useMemo(() => {
    const conflicts = findScheduleConflicts(busy, date, time, durationMinutes);
    const ownBusy = busy.filter((b) => b.isOwnChild);
    return {
      busy,
      ownConflicts: conflicts.filter((b) => b.isOwnChild),
      otherConflicts: conflicts.filter((b) => !b.isOwnChild),
      // Earliest start from the picked time that keeps the own child free
      freeTime: conflicts.some((b) => b.isOwnChild) ? findNextFreeTime(ownBusy, date, time, durationMinutes) : null,
      isLoading: isLoading || isRefreshing,
    };
  }, [busy, date, time, durationMinutes, isLoading, isRefreshing]);
};

export default useScheduleCheck;
