import { useMemo } from 'react';
import { fetchTimeCheck } from '../redux/playdateSlice';
import { useDebouncedQuery } from './useDebouncedQuery';
import { TIME_ISSUE_SEVERITY } from '../constants/playdate.constants';

const TIME_CHECK_DEBOUNCE_MS = 300;

/**
 * Time rules of the picked time (BUD-49 C): the same rules as the suggested times and the AI plans
 * (nap time, school hours, too late for the youngest child, opening hours of the chosen place...).
 * A `block` rule (place closed, time passed) stops the form; the others are notes for the parent.
 * @param {{ childId: string, participantChildIds?: string[], date: string, time: string, durationMinutes: number, placeId?: string|null }} input
 */
export const useTimeCheck = ({ childId, participantChildIds = [], date, time, durationMinutes, placeId }) => {
  const childrenKey = [...participantChildIds].sort().join(',');
  const params = useMemo(
    () =>
      childId && date && /^\d{2}:\d{2}$/.test(time || '')
        ? {
            childId,
            date,
            time,
            durationMinutes,
            ...(childrenKey ? { participantChildIds: childrenKey } : {}),
            ...(placeId ? { placeId } : {}),
          }
        : null,
    [childId, date, time, durationMinutes, childrenKey, placeId],
  );
  const { items: issues, isLoading, isRefreshing } = useDebouncedQuery(fetchTimeCheck, params, 'issues', TIME_CHECK_DEBOUNCE_MS);

  return useMemo(
    () => ({
      issues,
      blocking: issues.filter((issue) => issue.severity === TIME_ISSUE_SEVERITY.BLOCK),
      isLoading: isLoading || isRefreshing,
    }),
    [issues, isLoading, isRefreshing],
  );
};

export default useTimeCheck;
