export const CHILD_GENDERS = Object.freeze({
  BOY: 'boy',
  GIRL: 'girl',
  OTHER: 'other',
});

export const GENDER_OPTIONS = [
  { value: 'boy', label: 'Bé trai' },
  { value: 'girl', label: 'Bé gái' },
  { value: 'other', label: 'Khác' },
];

export const POPULAR_INTERESTS = [
  'Lego & Lắp ráp',
  'Vẽ & Hội họa',
  'Khủng long',
  'Âm nhạc & Đàn',
  'Khoa học & Không gian',
  'Đọc sách & Truyện tranh',
  'Siêu anh hùng',
  'Nấu ăn tí hon',
  'Thủ công & Đất nặn',
  'Xe cộ & Tàu hỏa',
  'Búp bê & Thời trang',
  'Cờ vua & Board game',
];

export const POPULAR_ACTIVITIES = [
  'Đạp xe công viên',
  'Bơi lội',
  'Khu vui chơi trong nhà (Kids Cafe)',
  'Dã ngoại ngoài trời',
  'Trượt patin',
  'Bóng đá / Thể thao',
  'Thư viện / Đọc sách',
  'Ghé thăm viện bảo tàng',
  'Trò chơi tương tác / Board games',
  'Thủ công sáng tạo',
];

export const PERSONALITY_TRAITS = [
  'Năng động & Thích vận động',
  'Sáng tạo & Giàu trí tưởng tượng',
  'Điềm tĩnh & Thích quan sát',
  'Hòa đồng & Dễ kết bạn',
  'Tò mò & Thích khám phá',
  'Nhạy cảm & Biết lắng nghe',
  'Hài hước & Vui vẻ',
  'Cẩn thận & Kiên nhẫn',
];

export const PLAYDATE_DAY_OPTIONS = [
  { value: 'weekend', label: 'Cuối tuần (Thứ 7 & Chủ nhật)' },
  { value: 'weekday', label: 'Các ngày trong tuần (T2 - T6)' },
];

export const TIME_SLOT_OPTIONS = [
  { value: 'morning', label: 'Buổi sáng (8h00 - 11h30)' },
  { value: 'afternoon', label: 'Buổi chiều (14h00 - 17h30)' },
  { value: 'evening', label: 'Buổi tối (18h00 - 20h30)' },
];

export const LOCATION_PREFERENCE_OPTIONS = [
  { value: 'park', label: 'Công viên cây xanh' },
  { value: 'kids_cafe', label: 'Khu vui chơi / Kids Cafe' },
  { value: 'indoor', label: 'Khu vui chơi trong nhà' },
  { value: 'outdoor', label: 'Khu vui chơi ngoài trời' },
  { value: 'home', label: 'Giao lưu tại nhà' },
  { value: 'library', label: 'Thư viện / Nhà sách thiếu nhi' },
  { value: 'museum', label: 'Bảo tàng / Triển lãm trải nghiệm' },
  { value: 'mall', label: 'Trung tâm thương mại' },
  { value: 'sports_center', label: 'Trung tâm thể thao / Sân bóng' },
  { value: 'pool', label: 'Hồ bơi / Công viên nước' },
];

/**
 * Codes returned by the /children endpoints and the onboarding preferences endpoint
 * (child.service, subscription quota, parent.service); shared middleware codes are in
 * constants/error.constants.js.
 */
export const CHILD_ERROR_CODES = Object.freeze({
  CHILD_QUOTA_EXCEEDED: 'CHILD_QUOTA_EXCEEDED',
});

export const CHILD_ERROR_MESSAGES = Object.freeze({
  CHILD_NOT_FOUND: 'Không tìm thấy hồ sơ trẻ em hoặc bạn không có quyền truy cập.',
  PARENT_NOT_FOUND: 'Không tìm thấy hồ sơ phụ huynh tương ứng.',
  [CHILD_ERROR_CODES.CHILD_QUOTA_EXCEEDED]:
    'Gói hiện tại đã đạt giới hạn số hồ sơ bé. Nâng cấp lên gói Premium để quản lý không giới hạn hồ sơ của con và mở khóa đầy đủ tính năng kết nối!',
  INVALID_PREFERENCES: 'Tiêu chí chưa hợp lệ: độ tuổi tối thiểu phải nhỏ hơn hoặc bằng tối đa và bán kính từ 1 đến 100km.',
  INVALID_COORDINATES: 'Tọa độ vị trí không hợp lệ.',
  VALIDATION_ERROR: 'Thông tin hồ sơ bé hoặc tiêu chí chưa hợp lệ. Vui lòng kiểm tra lại!',
});

