import { getLocalDateString } from '../../../utils/formatters';

/** Booking window and gap between two playdates of a family (BE PLAYDATE_RULES) */
export const PLAYDATE_BOOKING_RULES = Object.freeze({
  MIN_LEAD_HOURS: 2,
  MAX_ADVANCE_DAYS: 30,
  MIN_GAP_MINUTES: 30,
});

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

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

/**
 * Last day a playdate can be booked on (the date inputs' max)
 * @param {Date} [now]
 * @returns {string} "YYYY-MM-DD"
 */
export const getMaxPlaydateDateString = (now = new Date()) =>
  getLocalDateString(new Date(now.getTime() + PLAYDATE_BOOKING_RULES.MAX_ADVANCE_DAYS * DAY_MS));

/**
 * Where a start time stands against the booking window [now + 2h, now + 30 days], like the API
 * @param {string|Date} scheduledDate
 * @param {string} time
 * @param {Date} [now]
 * @returns {'past'|'too_soon'|'too_far'|null} null = can be booked
 */
export const getPlaydateStartIssue = (scheduledDate, time, now = new Date()) => {
  const start = getPlaydateStart(scheduledDate, time);
  if (!start) return null;
  const ahead = start.getTime() - now.getTime();
  if (ahead <= 0) return 'past';
  if (ahead < PLAYDATE_BOOKING_RULES.MIN_LEAD_HOURS * HOUR_MS) return 'too_soon';
  if (ahead > PLAYDATE_BOOKING_RULES.MAX_ADVANCE_DAYS * DAY_MS) return 'too_far';
  return null;
};

const pad = (value) => String(value).padStart(2, '0');

/**
 * Earliest start that can be booked: now + 2 hours, rounded up to 5 minutes
 * @param {Date} [now]
 * @returns {Date}
 */
export const getEarliestBookableStart = (now = new Date()) => {
  const step = 5 * 60 * 1000;
  return new Date(Math.ceil((now.getTime() + PLAYDATE_BOOKING_RULES.MIN_LEAD_HOURS * HOUR_MS) / step) * step);
};

/**
 * Form message of getPlaydateStartIssue, with the field it belongs to
 * @param {'past'|'too_soon'|'too_far'} issue
 * @param {Date} [now]
 * @returns {{ field: 'date'|'time', message: string }}
 */
export const getStartIssueMessage = (issue, now = new Date()) => {
  const earliest = getEarliestBookableStart(now);
  const earliestText =
    getLocalDateString(earliest) === getLocalDateString(now)
      ? `từ ${pad(earliest.getHours())}:${pad(earliest.getMinutes())} hôm nay`
      : 'từ ngày mai';
  if (issue === 'past') {
    return {
      field: 'time',
      message: `Giờ này đã qua. Buổi hẹn cần bắt đầu sau thời điểm hiện tại ít nhất ${PLAYDATE_BOOKING_RULES.MIN_LEAD_HOURS} tiếng, bạn chọn ${earliestText} trở đi nhé.`,
    };
  }
  if (issue === 'too_soon') {
    return {
      field: 'time',
      message: `Buổi hẹn cần được đặt trước ít nhất ${PLAYDATE_BOOKING_RULES.MIN_LEAD_HOURS} tiếng để các gia đình kịp sắp xếp, bạn chọn ${earliestText} trở đi nhé.`,
    };
  }
  return {
    field: 'date',
    message: `Chỉ có thể đặt lịch trong vòng ${PLAYDATE_BOOKING_RULES.MAX_ADVANCE_DAYS} ngày tới (đến hết ngày ${getMaxPlaydateDateString(now).split('-').reverse().join('/')}), bạn chọn ngày gần hơn nhé.`,
  };
};

/** Start time chips of the playdate forms */
export const TIME_PRESETS = Object.freeze(['08:00', '09:00', '15:00', '16:30']);

/**
 * Start time chips; on the picked date, the ones that cannot be booked (past, less than 2 hours away) are disabled
 * @param {string} [date] - "YYYY-MM-DD"
 * @param {Date} [now]
 * @returns {Array<{ id: string, label: string, disabled: boolean, title?: string }>}
 */
export const getTimePresetOptions = (date, now = new Date()) =>
  TIME_PRESETS.map((preset) => {
    const issue = date ? getPlaydateStartIssue(date, preset, now) : null;
    const disabled = issue === 'past' || issue === 'too_soon';
    return {
      id: preset,
      label: preset,
      disabled,
      title: disabled ? `Giờ này chưa đủ ${PLAYDATE_BOOKING_RULES.MIN_LEAD_HOURS} tiếng kể từ bây giờ` : undefined,
    };
  });
