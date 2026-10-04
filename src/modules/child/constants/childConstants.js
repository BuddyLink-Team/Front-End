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
  { value: 'indoor', label: 'Khu thể thao trong nhà' },
  { value: 'outdoor', label: 'Khu vui chơi ngoài trời' },
  { value: 'home', label: 'Giao lưu tại nhà' },
];

/**
 * Mapping of Backend Error Codes to Vietnamese User-friendly Messages for Child & Onboarding
 */
export const CHILD_ERROR_MESSAGES = {
  CHILD_NOT_FOUND: 'Không tìm thấy hồ sơ trẻ em hoặc bạn không có quyền truy cập.',
  PARENT_NOT_FOUND: 'Không tìm thấy hồ sơ phụ huynh tương ứng.',
  VALIDATION_ERROR: 'Thông tin hồ sơ bé hoặc tiêu chí chưa hợp lệ. Vui lòng kiểm tra lại!',
  AUTHENTICATION_REQUIRED: 'Vui lòng đăng nhập để thực hiện thao tác.',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  TOO_MANY_REQUESTS: 'Thao tác quá thường xuyên. Vui lòng thử lại sau ít phút!',
};

