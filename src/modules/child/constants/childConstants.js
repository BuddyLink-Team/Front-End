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
 * Mapping of Backend Error Codes & Messages to Vietnamese User-friendly Messages for Child & Onboarding
 */
export const CHILD_ERROR_MESSAGES = {
  // Error codes
  CHILD_NOT_FOUND: 'Không tìm thấy hồ sơ trẻ em hoặc bạn không có quyền truy cập.',
  PARENT_NOT_FOUND: 'Không tìm thấy hồ sơ phụ huynh tương ứng.',
  VALIDATION_ERROR: 'Thông tin hồ sơ bé hoặc tiêu chí chưa hợp lệ. Vui lòng kiểm tra lại!',
  AUTHENTICATION_REQUIRED: 'Vui lòng đăng nhập để thực hiện thao tác.',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  TOO_MANY_REQUESTS: 'Thao tác quá thường xuyên. Vui lòng thử lại sau ít phút!',
  INVALID_CHILD_ID: 'Mã định danh hồ sơ bé không hợp lệ.',

  // Direct backend validation & service message mapping
  'Child display name is required': 'Vui lòng nhập tên của bé.',
  'Child display name must be between 2 and 50 characters': 'Tên của bé phải từ 2 đến 50 ký tự.',
  'Child date of birth is required': 'Vui lòng chọn ngày sinh của bé.',
  'Date of birth must be a valid date format (YYYY-MM-DD)': 'Ngày sinh không đúng định dạng.',
  'Date of birth cannot be in the future': 'Ngày sinh của bé không thể ở tương lai.',
  'Child gender is required': 'Vui lòng chọn giới tính của bé.',
  'Interests must be an array of strings': 'Danh sách sở thích chưa hợp lệ.',
  'Favorite activities must be an array of strings': 'Danh sách hoạt động ưa thích chưa hợp lệ.',
  'Personality traits must be an array of strings': 'Danh sách đặc điểm tính cách chưa hợp lệ.',
  'Invalid child ID format': 'Mã định danh hồ sơ bé không hợp lệ.',
  'Child profile not found': 'Không tìm thấy thông tin hồ sơ của bé.',
  'Parent profile not found': 'Không tìm thấy thông tin phụ huynh.',
  'Location must be an object': 'Thông tin vị trí chưa hợp lệ.',
  'Coordinates must be an array of [lng, lat]': 'Tọa độ vị trí không hợp lệ.',
  'Preferences must be an object': 'Thông tin tiêu chí chưa hợp lệ.',
  'maxDistanceKm must be a number': 'Khoảng cách tìm kiếm tối đa phải là số.',
};

