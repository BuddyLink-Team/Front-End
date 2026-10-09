// A playdate has a single start time 'HH:mm' (24h), no end time
export const PLAYDATE_TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

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
