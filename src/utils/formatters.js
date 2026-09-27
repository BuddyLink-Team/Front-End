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
export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN');
};
