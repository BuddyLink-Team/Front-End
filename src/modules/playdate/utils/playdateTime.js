// A playdate starts at a 'HH:mm' time (24h) and lasts durationMinutes (end time computed by the API)
export const PLAYDATE_TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * "09:00 - 11:00", or just the start time for an old playdate without an end time
 * @param {{ time?: string, endTime?: string }} playdate
 * @returns {string}
 */
export const formatPlaydateTimeRange = ({ time, endTime } = {}) =>
  [time, endTime].filter(Boolean).join(' - ');

/**
 * End time of a start "HH:mm" plus some minutes, past midnight wraps ("23:00" + 120 -> "01:00")
 * @param {string} time
 * @param {number} minutes
 * @returns {string|null}
 */
export const addMinutesToTime = (time, minutes) => {
  if (!PLAYDATE_TIME_REGEX.test(time || '')) return null;
  const [hours, mins] = time.split(':').map(Number);
  const total = (((hours * 60 + mins + minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

/**
 * Start instant of a playdate: its calendar date (local time) combined with the 'HH:mm' time.
 * @param {string|Date} scheduledDate
 * @param {string} time
 * @returns {Date|null}
 */
export const getPlaydateStart = (scheduledDate, time) => {
  if (!scheduledDate) return null;
  const start = new Date(scheduledDate);
  if (Number.isNaN(start.getTime())) return null;
  const [hours = 0, minutes = 0] = String(time || '').split(':').map(Number);
  start.setHours(hours || 0, minutes || 0, 0, 0);
  return start;
};

/**
 * True once the start time has passed (the host may then mark the playdate completed).
 * @param {string|Date} scheduledDate
 * @param {string} time
 * @param {Date} [now]
 */
export const hasPlaydateStarted = (scheduledDate, time, now = new Date()) => {
  const start = getPlaydateStart(scheduledDate, time);
  return Boolean(start) && start.getTime() <= now.getTime();
};
