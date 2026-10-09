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
