/**
 * Playdate Constants & Tab Definitions
 * Styled according to Stitch Playdates Reference Layout
 */

export const PLAYDATE_TABS = [
  { id: 'upcoming', label: 'Sắp tới' },
  { id: 'completed', label: 'Lịch sử đã chơi' },
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ phản hồi' },
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
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    dotColor: '#F59E0B',
  },
  confirmed: {
    label: 'Đã xác nhận',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotColor: '#10B981',
  },
  completed: {
    label: 'Đã hoàn thành',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
    dotColor: '#0EA5E9',
  },
  cancelled: {
    label: 'Đã hủy',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    dotColor: '#94A3B8',
  },
};
