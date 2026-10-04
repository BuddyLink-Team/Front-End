/**
 * Playdate Constants & Tab Definitions
 */

export const PLAYDATE_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'confirmed', label: 'Đã xác nhận' },
  { id: 'pending', label: 'Chờ phản hồi' },
  { id: 'completed', label: 'Đã hoàn thành' },
  { id: 'cancelled', label: 'Đã hủy' },
];

export const PLAYDATE_VIEW_MODES = {
  LIST: 'list',
  CALENDAR: 'calendar',
};

export const PLAYDATE_STATUS_KEYS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const PLAYDATE_STATUS_META = {
  pending: {
    label: 'Chờ phản hồi',
    badgeClass: 'bg-tertiary-fixed/30 text-tertiary-dark border-tertiary-fixed/50',
    dotColor: '#F6D186',
  },
  confirmed: {
    label: 'Đã xác nhận',
    badgeClass: 'bg-primary/10 text-primary-dark border-primary/20',
    dotColor: '#7BAE7F',
  },
  completed: {
    label: 'Đã hoàn thành',
    badgeClass: 'bg-secondary-container/40 text-secondary-dark border-secondary-container',
    dotColor: '#92C5DE',
  },
  cancelled: {
    label: 'Đã hủy',
    badgeClass: 'bg-surface-subtle text-text-muted border-hairline',
    dotColor: '#CBD5E1',
  },
};
