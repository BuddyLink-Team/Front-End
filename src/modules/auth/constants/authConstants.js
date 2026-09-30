export const AUTH_MODES = {
  LOGIN: 'login',
  REGISTER: 'register',
};

export const AUTH_VALIDATION_MESSAGES = {
  FULL_NAME_REQUIRED: 'Vui lòng nhập họ và tên phụ huynh',
  FULL_NAME_MIN: 'Họ và tên tối thiểu 2 ký tự',
  EMAIL_REQUIRED: 'Vui lòng nhập địa chỉ email',
  EMAIL_INVALID: 'Địa chỉ email không đúng định dạng',
  PASSWORD_REQUIRED: 'Vui lòng nhập mật khẩu',
  PASSWORD_MIN: 'Mật khẩu phải có tối thiểu 6 ký tự',
  PASSWORD_MISMATCH: 'Mật khẩu xác nhận không trùng khớp',
  PHONE_REQUIRED: 'Vui lòng nhập số điện thoại',
  PHONE_INVALID: 'Số điện thoại không hợp lệ (từ 9 đến 15 chữ số)',
};

/**
 * Mapping of Backend Error Codes to Vietnamese User-friendly Messages
 */
export const AUTH_ERROR_MESSAGES = {
  EMAIL_ALREADY_EXISTS: 'Địa chỉ email này đã được đăng ký tài khoản. Vui lòng đăng nhập!',
  PHONE_ALREADY_EXISTS: 'Số điện thoại này đã được sử dụng. Vui lòng dùng số khác!',
  PHONE_IN_USE: 'Số điện thoại này đã được liên kết với một tài khoản khác.',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!',
  'Invalid email or password': 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!',
  ACCOUNT_DISABLED: 'Tài khoản của bạn tạm thời bị khóa. Vui lòng liên hệ quản trị viên!',
  'User account is disabled': 'Tài khoản của bạn tạm thời bị khóa. Vui lòng liên hệ quản trị viên!',
  FORBIDDEN: 'Bạn không có quyền truy cập vào chức năng này.',
  AUTHENTICATION_REQUIRED: 'Vui lòng đăng nhập để tiếp tục.',
  INVALID_ACCESS_TOKEN: 'Phiên làm việc không hợp lệ. Vui lòng đăng nhập lại!',
  ACCESS_TOKEN_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng tải lại trang hoặc đăng nhập lại.',
  USER_NOT_FOUND: 'Không tìm thấy thông tin tài khoản người dùng.',
  PARENT_NOT_FOUND: 'Không tìm thấy hồ sơ phụ huynh tương ứng.',
  INVALID_OTP: 'Mã xác thực OTP không chính xác hoặc đã hết hạn. Vui lòng thử lại!',
  INVALID_FIREBASE_TOKEN: 'Mã xác thực Firebase không hợp lệ hoặc đã hết hạn.',
  INVALID_RESET_TOKEN: 'Mã hoặc liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.',
  INVALID_GOOGLE_TOKEN: 'Xác thực Google không thành công. Vui lòng thử lại!',
  REFRESH_TOKEN_REQUIRED: 'Yêu cầu phiên làm việc bị thiếu. Vui lòng đăng nhập lại.',
  INVALID_REFRESH_TOKEN: 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
  TOKEN_REVOKED: 'Phiên đăng nhập đã bị thu hồi hoặc đã đăng xuất từ nơi khác.',
  USER_INACTIVE: 'Tài khoản hiện đang không hoạt động.',
  VALIDATION_ERROR: 'Dữ liệu nhập vào chưa đúng định dạng. Vui lòng kiểm tra lại!',
  TOO_MANY_REQUESTS: 'Bạn đã thao tác quá nhanh hoặc quá nhiều lần. Vui lòng thử lại sau ít phút!',
  // Password & Profile Error Codes
  PASSWORD_MISMATCH: 'Mật khẩu xác nhận không trùng khớp với mật khẩu mới.',
  INVALID_CURRENT_PASSWORD: 'Mật khẩu hiện tại không chính xác. Vui lòng kiểm tra lại!',
  SAME_AS_OLD_PASSWORD: 'Mật khẩu mới không được trùng với mật khẩu hiện tại.',
  SOCIAL_ACCOUNT_NO_PASSWORD: 'Tài khoản đăng nhập qua Google không thể đổi mật khẩu theo cách này.',
  NO_PASSWORD_CONFIGURED: 'Tài khoản chưa được thiết lập mật khẩu.',
  AVATAR_FILE_REQUIRED: 'Vui lòng chọn tệp ảnh để tải lên làm ảnh đại diện.',
  INVALID_FILE_TYPE: 'Định dạng tệp không hợp lệ. Chỉ chấp nhận ảnh (JPG, PNG, WebP).',
  UPLOAD_BUFFER_EMPTY: 'Tệp tải lên không hợp lệ hoặc rỗng.',
  STORAGE_UPLOAD_ERROR: 'Tải ảnh lên hệ thống thất bại. Vui lòng thử lại sau.',
  // Firebase specific error codes
  'auth/invalid-verification-code': 'Mã OTP không đúng hoặc đã hết hiệu lực. Vui lòng kiểm tra lại!',
  'auth/code-expired': 'Mã OTP đã hết hạn, vui lòng bấm gửi lại mã mới!',
  'auth/invalid-phone-number': 'Số điện thoại không hợp lệ.',
  'auth/too-many-requests': 'Bạn đã yêu cầu gửi mã quá nhiều lần. Vui lòng thử lại sau ít phút!',
  'auth/quota-exceeded': 'Hạn mức tin nhắn SMS hôm nay đã vượt quá giới hạn.',
  'auth/user-disabled': 'Tài khoản này đã bị khóa.',
  'auth/popup-closed-by-user': 'Cửa sổ đăng nhập đã bị đóng trước khi hoàn tất.',
  'auth/cancelled-popup-request': 'Thao tác đăng nhập đã bị hủy.',
};

