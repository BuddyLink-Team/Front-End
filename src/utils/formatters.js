import dayjs from 'dayjs';

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

/**
 * Format a number into VND currency representation.
 *
 * @param {number|string} value - The numeric value to format.
 * @returns {string} Formatted currency string or '-' if invalid.
 */
export const formatCurrency = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? vndFormatter.format(number) : '-';
};

/**
 * Extract up to two uppercase initials from a person's name for fallback avatars.
 *
 * @param {string} [name=''] - The full name.
 * @returns {string} First and last initials (e.g. "Lan Anh" -> "LA", "Bo" -> "B", empty -> "U").
 */
export const getInitials = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

/**
 * Convert Vietnamese diacritics into ASCII-safe characters.
 * Useful for accent-insensitive search queries and string normalization.
 *
 * @param {string} str - Input text with diacritics.
 * @returns {string} Accent-removed string.
 */
export const removeAccents = (str) =>
  String(str ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');

/**
 * Format a date object or timestamp to localized date string.
 *
 * @param {Date|string|number} date - Date value to format.
 * @param {string} [format='DD/MM/YYYY'] - Target date format.
 * @returns {string} Formatted date string or empty string if falsy.
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN');
};

/**
 * Format a date with its time (e.g. "23/10/2026 14:05").
 *
 * @param {Date|string|number} date - Date value to format.
 * @returns {string} "DD/MM/YYYY HH:mm", or an empty string when falsy or invalid.
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  const d = dayjs(date);
  return d.isValid() ? d.format('DD/MM/YYYY HH:mm') : '';
};

/**
 * Format a start time and a duration as a time range (e.g. "10:00 - 12:00").
 *
 * @param {string} time - Start time "HH:mm"
 * @param {number} [durationMinutes]
 * @returns {string} The range, the start time alone without a valid duration, or an empty string.
 */
export const formatTimeRange = (time, durationMinutes) => {
  if (!time) return '';
  const start = dayjs(`2000-01-01T${time}`);
  if (!start.isValid() || !(durationMinutes > 0)) return time;
  return `${start.format('HH:mm')} - ${start.add(durationMinutes, 'minute').format('HH:mm')}`;
};

/**
 * Format a child's age from their date of birth: years from 1 year old, months below.
 *
 * @param {Date|string|number} dateOfBirth
 * @param {Date|string|number} [now=new Date()] - Reference date (for tests)
 * @returns {string} e.g. "5 tuổi", "8 tháng", or an empty string when falsy or invalid.
 */
export const formatChildAge = (dateOfBirth, now = new Date()) => {
  if (!dateOfBirth) return '';
  const birth = dayjs(dateOfBirth);
  if (!birth.isValid()) return '';
  const years = dayjs(now).diff(birth, 'year');
  if (years >= 1) return `${years} tuổi`;
  return `${Math.max(1, dayjs(now).diff(birth, 'month'))} tháng`;
};

/**
 * Format an age already computed in whole years (e.g. by the API) when the date of birth is not available.
 *
 * @param {number|null|undefined} age
 * @returns {string} e.g. "5 tuổi", "Dưới 1 tuổi", or an empty string when unknown.
 */
export const formatAgeYears = (age) => {
  if (typeof age !== 'number' || Number.isNaN(age) || age < 0) return '';
  return age >= 1 ? `${age} tuổi` : 'Dưới 1 tuổi';
};

/**
 * Format a count with Vietnamese digit grouping (1248 -> "1.248").
 *
 * @param {number|string} value
 * @returns {string} Formatted count or '-' if invalid.
 */
export const formatCount = (value) => {
  const number = Number(value);
  if (value === null || value === undefined || value === '' || !Number.isFinite(number)) return '-';
  return new Intl.NumberFormat('vi-VN').format(number);
};

const compactFormatter = new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 });

/**
 * Format a number in short form for chart axes (1500000 -> "1,5 Tr").
 *
 * @param {number|string} value
 * @returns {string} Short number or '-' if invalid.
 */
export const formatCompactNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? compactFormatter.format(number) : '-';
};

/**
 * Format a ratio as a Vietnamese percentage (0.125 -> "12,5%").
 *
 * @param {number|string} value - Ratio between 0 and 1.
 * @param {number} [digits=1] - Maximum fraction digits.
 * @returns {string} Formatted percentage or '-' if invalid.
 */
export const formatPercent = (value, digits = 1) => {
  const number = Number(value);
  if (value === null || value === undefined || value === '' || !Number.isFinite(number)) return '-';
  return new Intl.NumberFormat('vi-VN', { style: 'percent', maximumFractionDigits: digits }).format(number);
};

/**
 * Format total seconds into MM:SS display string.
 *
 * @param {number} seconds - Number of seconds remaining.
 * @returns {string} Formatted string "MM:SS".
 */
export const formatTimer = (seconds) => {
  const mins = Math.floor(Math.max(0, seconds) / 60);
  const secs = Math.max(0, seconds) % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Mask a phone number for privacy display (e.g. +84 908 ••• 321).
 *
 * @param {string} phone - Raw phone number.
 * @returns {string} Masked phone number.
 */
export const maskPhone = (phone) => {
  if (!phone) return '+84 908 ••• 321';
  const clean = String(phone).replace(/\s+/g, '');
  if (clean.length < 8) return phone;
  const prefix = clean.slice(0, 4);
  const suffix = clean.slice(-3);
  return `${prefix} ••• ${suffix}`;
};

/**
 * Mask an email address for privacy display (e.g. ph***@gmail.com).
 *
 * @param {string} email - Raw email address.
 * @returns {string} Masked email.
 */
export const maskEmail = (email) => {
  if (!email) return 'ph***@buddylink.vn';
  const [name, domain] = String(email).split('@');
  if (!domain) return email;
  const maskedName = name.length > 2 ? `${name.slice(0, 2)}***` : `${name}***`;
  return `${maskedName}@${domain}`;
};

/**
 * Return date in local YYYY-MM-DD format (avoids UTC timezone shift issues).
 *
 * @param {Date|string|number} [date=new Date()]
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const getLocalDateString = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
