export const ADMIN_PLAYDATE_STATUS_OPTIONS = [
  { id: '', value: '', label: 'Tất cả' },
  { id: 'upcoming', value: 'upcoming', label: 'Sắp diễn ra' },
  { id: 'completed', value: 'completed', label: 'Đã hoàn thành' },
  { id: 'cancelled', value: 'cancelled', label: 'Đã hủy' },
];

export const ADMIN_CONNECTION_STATUS_OPTIONS = [
  { id: '', value: '', label: 'Tất cả' },
  { id: 'pending', value: 'pending', label: 'Đang chờ' },
  { id: 'accepted', value: 'accepted', label: 'Đã kết nối' },
  { id: 'declined', value: 'declined', label: 'Đã từ chối' },
  { id: 'removed', value: 'removed', label: 'Đã gỡ' },
];

export const CONNECTION_STATUS_CONFIG = {
  pending: { label: 'Đang chờ', tone: 'warning' },
  accepted: { label: 'Đã kết nối', tone: 'success' },
  declined: { label: 'Đã từ chối', tone: 'danger' },
  removed: { label: 'Đã gỡ', tone: 'neutral' },
};
