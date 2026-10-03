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
    badgeClass: 'bg-[#fef7e6] text-[#755a1b] border-[#fae4b2]',
    dotColor: '#F6D186',
  },
  confirmed: {
    label: 'Đã xác nhận',
    badgeClass: 'bg-[#eaf3ec] text-[#3d6841] border-[#d2e7d7]',
    dotColor: '#7BAE7F',
  },
  completed: {
    label: 'Đã hoàn thành',
    badgeClass: 'bg-[#e7eeff] text-[#30647b] border-[#b1e4fe]',
    dotColor: '#92C5DE',
  },
  cancelled: {
    label: 'Đã hủy',
    badgeClass: 'bg-[#edf2f0] text-[#718096] border-[#d9e2de]',
    dotColor: '#CBD5E1',
  },
};
