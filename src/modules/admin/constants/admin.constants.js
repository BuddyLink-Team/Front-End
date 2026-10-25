export const USER_STATUS_CHIPS = [
  { id: '', label: 'Tất cả', value: '' },
  { id: 'true', label: 'Đang hoạt động', value: 'true' },
  { id: 'false', label: 'Đã khóa', value: 'false' },
];

export const VERIFICATION_FILTER_OPTIONS = [
  { label: 'Tất cả xác thực', value: '' },
  { label: 'Đã xác thực', value: 'true' },
  { label: 'Chưa xác thực', value: 'false' },
];

export const CHILD_STATUS_CHIPS = [
  { id: 'false', label: 'Đang hiển thị', value: 'false' },
  { id: 'true', label: 'Đã xóa bởi phụ huynh', value: 'true' },
  { id: '', label: 'Tất cả', value: '' },
];

export const GENDER_FILTER_OPTIONS = [
  { label: 'Tất cả giới tính', value: '' },
  { label: 'Bé trai', value: 'boy' },
  { label: 'Bé gái', value: 'girl' },
  { label: 'Khác', value: 'other' },
];

export const AGE_RANGE_OPTIONS = [
  { label: 'Mọi độ tuổi', value: '' },
  { label: '1 - 3 tuổi', value: '1-3', minAge: 1, maxAge: 3 },
  { label: '4 - 6 tuổi', value: '4-6', minAge: 4, maxAge: 6 },
  { label: '7 - 9 tuổi', value: '7-9', minAge: 7, maxAge: 9 },
  { label: '10 - 12 tuổi', value: '10-12', minAge: 10, maxAge: 12 },
];

export const SUBSCRIPTION_PLAN_NAMES = {
  free: 'Gói Miễn phí',
  premium_monthly: 'Gói Premium (1 Tháng)',
  premium_yearly: 'Gói Premium (1 Năm)',
};
