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
 * Mapping of Backend Error Codes to Vietnamese User-friendly Messages for Parent Profile
 */
export const PARENT_ERROR_MESSAGES = {
  PARENT_NOT_FOUND: 'Không tìm thấy hồ sơ phụ huynh tương ứng.',
  USER_NOT_FOUND: 'Không tìm thấy thông tin tài khoản người dùng.',
  VALIDATION_ERROR: 'Dữ liệu nhập vào chưa đúng định dạng. Vui lòng kiểm tra lại!',
  AUTHENTICATION_REQUIRED: 'Vui lòng đăng nhập lại để tiếp tục.',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  AVATAR_FILE_REQUIRED: 'Vui lòng chọn tệp hình ảnh để tải lên.',
  INVALID_FILE_TYPE: 'Chỉ chấp nhận các định dạng ảnh: JPG, PNG, WebP.',
  UPLOAD_BUFFER_EMPTY: 'Tệp tải lên không hợp lệ hoặc bị lỗi.',
  STORAGE_UPLOAD_ERROR: 'Tải ảnh lên máy chủ thất bại. Vui lòng thử lại sau!',
  PASSWORD_MISMATCH: 'Mật khẩu xác nhận không trùng khớp với mật khẩu mới.',
  INVALID_CURRENT_PASSWORD: 'Mật khẩu hiện tại không chính xác.',
  SAME_AS_OLD_PASSWORD: 'Mật khẩu mới không được trùng với mật khẩu hiện tại.',
  SOCIAL_ACCOUNT_NO_PASSWORD: 'Tài khoản đăng nhập qua Google không thể đổi mật khẩu tại đây.',
  TOO_MANY_REQUESTS: 'Bạn thao tác quá thường xuyên. Vui lòng thử lại sau ít phút!',
};
