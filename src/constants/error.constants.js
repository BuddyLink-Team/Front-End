/**
 * Error codes the backend returns from shared middlewares (auth, role, rate limit, validation,
 * global error handler) for every module, plus the client-side network codes set by apiClient.
 * Module maps (modules/<module>/constants) hold the module-specific codes and take precedence.
 */
export const CLIENT_ERROR_CODES = Object.freeze({
  NETWORK_ERROR: 'NETWORK_ERROR',
  REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
});

export const COMMON_ERROR_MESSAGES = Object.freeze({
  // apiClient (no response from the server)
  [CLIENT_ERROR_CODES.NETWORK_ERROR]: 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng và thử lại.',
  [CLIENT_ERROR_CODES.REQUEST_TIMEOUT]: 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.',

  // auth.middleware / role.middleware
  AUTHENTICATION_REQUIRED: 'Vui lòng đăng nhập để tiếp tục.',
  INVALID_ACCESS_TOKEN: 'Phiên làm việc không hợp lệ. Vui lòng đăng nhập lại!',
  ACCESS_TOKEN_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  ACCOUNT_DISABLED: 'Tài khoản của bạn tạm thời bị khóa. Vui lòng liên hệ quản trị viên!',
  USER_NOT_FOUND: 'Không tìm thấy thông tin tài khoản người dùng.',
  INSUFFICIENT_PERMISSIONS: 'Bạn không có quyền thực hiện thao tác này.',

  // app.js / rate-limit.middleware
  TOO_MANY_REQUESTS: 'Bạn thao tác quá nhanh hoặc quá nhiều lần. Vui lòng thử lại sau ít phút!',

  // validate.middleware
  VALIDATION_ERROR: 'Dữ liệu nhập vào chưa đúng định dạng. Vui lòng kiểm tra lại!',

  // error.middleware
  BAD_REQUEST: 'Yêu cầu không hợp lệ. Vui lòng thử lại.',
  INVALID_RESOURCE_ID: 'Mã định danh không hợp lệ.',
  DUPLICATE_FIELD: 'Thông tin này đã tồn tại trong hệ thống.',
  DATABASE_VALIDATION_ERROR: 'Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại!',
  ROUTE_NOT_FOUND: 'Chức năng không tồn tại hoặc đã thay đổi.',
  INTERNAL_SERVER_ERROR: 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.',
  SERVER_CONFIGURATION_ERROR: 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.',
});
