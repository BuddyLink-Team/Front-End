import { getPlaydateStart, PLAYDATE_TIME_REGEX } from './playdateTime';

const MINUTE_MS = 60 * 1000;
// A free time found later than this is not offered (too late for a playdate with children)
const LATEST_START = '21:00';

const pad = (value) => String(value).padStart(2, '0');
const toClock = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

/**
 * Busy intervals (GET /playdates/busy-times) overlapping a schedule. Touching edges do not overlap
 * (10:00-12:00 then 12:00-14:00 is fine), like the Back-End check.
 * @param {Array<{ startsAt: string, endsAt: string }>} busy
 * @param {string} date - "YYYY-MM-DD"
 * @param {string} time - "HH:mm"
 * @param {number} durationMinutes
 * @returns {Array}
 */
export const findScheduleConflicts = (busy, date, time, durationMinutes) => {
  if (!busy?.length || !date || !PLAYDATE_TIME_REGEX.test(time || '')) return [];
  const start = getPlaydateStart(date, time).getTime();
  const end = start + durationMinutes * MINUTE_MS;
  return busy.filter((b) => Date.parse(b.startsAt) < end && start < Date.parse(b.endsAt));
};

/**
 * Earliest start at or after the picked time, the same day, that overlaps none of the busy intervals
 * @returns {string|null} "HH:mm", null when the rest of the day is taken
 */
export const findNextFreeTime = (busy, date, time, durationMinutes) => {
  let candidate = time;
  for (let i = 0; i <= busy.length; i += 1) {
    const conflicts = findScheduleConflicts(busy, date, candidate, durationMinutes);
    if (!conflicts.length) return candidate;
    const latestEnd = new Date(Math.max(...conflicts.map((b) => Date.parse(b.endsAt))));
    const next = toClock(latestEnd);
    // Past midnight or too late: no free time that day
    if (latestEnd.getDate() !== getPlaydateStart(date, '00:00').getDate() || next > LATEST_START) return null;
    candidate = next;
  }
  return null;
};
