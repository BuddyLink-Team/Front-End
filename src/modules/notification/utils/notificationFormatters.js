import dayjs from 'dayjs';

/**
 * Format relative time in Vietnamese
 * @param {string|Date} dateString
 * @returns {string}
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = dayjs(dateString);
  const now = dayjs();
  const diffInSeconds = now.diff(date, 'second');

  if (diffInSeconds < 60) {
    return 'Vừa xong';
  }

  const diffInMinutes = now.diff(date, 'minute');
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = now.diff(date, 'hour');
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  if (date.isSame(now.subtract(1, 'day'), 'day')) {
    return `Hôm qua lúc ${date.format('HH:mm')}`;
  }

  const diffInDays = now.diff(date, 'day');
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  }

  return date.format('DD/MM/YYYY [lúc] HH:mm');
};

/**
 * Format full date and time
 * @param {string|Date} dateString
 * @returns {string}
 */
export const formatFullDateTime = (dateString) => {
  if (!dateString) return '';
  return dayjs(dateString).format('HH:mm • DD/MM/YYYY');
};
