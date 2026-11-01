/**
 * Constants & Options for Parent Profile & Settings
 */

export const PROFILE_TABS = {
  INFO: 'info',
  PREFERENCES: 'preferences',
  SECURITY: 'security',
};

import { User, Sliders, Shield } from 'lucide-react';

export const TAB_CONFIGS = [
  { id: PROFILE_TABS.INFO, label: 'Thông tin cá nhân', icon: User },
  { id: PROFILE_TABS.PREFERENCES, label: 'Tiêu chí hẹn chơi', icon: Sliders },
  {
    id: PROFILE_TABS.SECURITY,
    label: 'Bảo mật & Quyền riêng tư',
    icon: Shield,
  },
];

export const CONNECTION_PRIVACY_OPTIONS = [
  { value: 'everyone', label: 'Tất cả phụ huynh trong khu vực', desc: 'Mọi phụ huynh phù hợp đều có thể gửi lời mời kết nối.' },
  { value: 'nobody', label: 'Tạm khóa kết nối mới', desc: 'Chỉ duy trì trò chuyện với những phụ huynh đã kết nối trước đó.' },
];

/**
 * Codes returned by the /user/me endpoints the profile page uses (user.service, parent.service,
 * upload middleware, storage adapter); shared middleware codes are in constants/error.constants.js.
 */
export const PARENT_ERROR_MESSAGES = Object.freeze({
  PARENT_NOT_FOUND: 'Không tìm thấy hồ sơ phụ huynh tương ứng.',
  PHONE_ALREADY_EXISTS: 'Số điện thoại này đã được sử dụng. Vui lòng dùng số khác!',
  INVALID_PREFERENCES: 'Tiêu chí chưa hợp lệ: độ tuổi tối thiểu phải nhỏ hơn hoặc bằng tối đa và bán kính từ 1 đến 100km.',
  INVALID_COORDINATES: 'Tọa độ vị trí không hợp lệ.',
  OPERATION_NOT_SUPPORTED: 'Chỉ tài khoản phụ huynh mới cập nhật được ảnh đại diện.',
  // Password
  PASSWORD_MISMATCH: 'Mật khẩu xác nhận không trùng khớp với mật khẩu mới.',
  INVALID_CURRENT_PASSWORD: 'Mật khẩu hiện tại không chính xác.',
  SAME_AS_OLD_PASSWORD: 'Mật khẩu mới không được trùng với mật khẩu hiện tại.',
  SOCIAL_ACCOUNT_NO_PASSWORD: 'Tài khoản đăng nhập qua Google không thể đổi mật khẩu tại đây.',
  // Avatar upload (file type / size / storage codes: COMMON_ERROR_MESSAGES)
  AVATAR_FILE_REQUIRED: 'Vui lòng chọn tệp hình ảnh để tải lên.',
});

// Must match the backend upload limit (upload.middleware.js)
export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
