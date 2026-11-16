import { getPlaydateStart, PLAYDATE_TIME_REGEX, PLAYDATE_BOOKING_RULES } from './playdateTime';

const MINUTE_MS = 60 * 1000;
// Two playdates of a family: at least this long from the end of one to the start of the next
const GAP_MS = PLAYDATE_BOOKING_RULES.MIN_GAP_MINUTES * MINUTE_MS;
// A free time found later than this is not offered (too late for a playdate with children)
const LATEST_START = '21:00';

const pad = (value) => String(value).padStart(2, '0');
const toClock = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

/**
 * Busy intervals (GET /playdates/busy-times) too close to a schedule: overlapping it or less than 30 minutes
 * before / after it (10:00-12:00 then 12:30 is fine, 12:15 is not), like the Back-End check.
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
  return busy.filter((b) => Date.parse(b.startsAt) < end + GAP_MS && start - GAP_MS < Date.parse(b.endsAt));
};

// Suggested times are rounded up to this many minutes ("10:07" -> "10:10")
const ROUND_MINUTES = 5;

const roundUpToClock = (date) => {
  const step = ROUND_MINUTES * MINUTE_MS;
  return new Date(Math.ceil(date.getTime() / step) * step);
};

/**
 * Earliest start at or after the picked time, the same day, that can be booked: at least 2 hours from now
 * (at most 30 days ahead) and at least 30 minutes away from the busy intervals
 * @param {Array<{ startsAt: string, endsAt: string }>} busy
 * @param {string} date - "YYYY-MM-DD"
 * @param {string} time - "HH:mm"
 * @param {number} durationMinutes
 * @param {Date} [now]
 * @returns {string|null} "HH:mm", null when no time is left that day
 */
export const findNextFreeTime = (busy, date, time, durationMinutes, now = new Date()) => {
  if (!date || !PLAYDATE_TIME_REGEX.test(time || '')) return null;
  const dayStart = getPlaydateStart(date, '00:00');
  const earliest = roundUpToClock(new Date(now.getTime() + PLAYDATE_BOOKING_RULES.MIN_LEAD_HOURS * 60 * MINUTE_MS));
  const latest = now.getTime() + PLAYDATE_BOOKING_RULES.MAX_ADVANCE_DAYS * 24 * 60 * MINUTE_MS;

  let start = getPlaydateStart(date, time);
  for (let i = 0; i <= (busy?.length || 0) + 1; i += 1) {
    // Too soon: move to the first time that can be booked
    if (start < earliest) start = earliest;
    const candidate = toClock(start);
    // Past midnight, too late for children, or beyond the booking window: no time left that day
    if (start.getDate() !== dayStart.getDate() || candidate > LATEST_START || start.getTime() > latest) return null;

    const conflicts = findScheduleConflicts(busy, date, candidate, durationMinutes);
    if (!conflicts.length) return candidate;
    start = roundUpToClock(new Date(Math.max(...conflicts.map((b) => Date.parse(b.endsAt))) + GAP_MS));
  }
  return null;
};
