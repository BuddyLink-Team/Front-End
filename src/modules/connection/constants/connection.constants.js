/**
 * Connection module — status enums & BE error-code → Vietnamese message map.
 * Usage: import { CONNECTION_STATUS, CONNECTION_ERROR_MAP } from '../constants/connection.constants';
 */

/** Mirrors BE connection.constants.js */
export const CONNECTION_STATUS = Object.freeze({
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  REMOVED: 'removed',
});

/**
 * Maps backend error codes (AppError.errorCode) to user-facing Vietnamese strings.
 * Consumed exclusively by useConnections via getApiErrorMsg().
 */
export const CONNECTION_ERROR_MAP = Object.freeze({
  // request errors
  INVALID_CONNECTION_REQUEST: 'Không thể gửi lời mời kết nối tới chính mình.',
  CONNECTION_ALREADY_PENDING: 'Lời mời kết nối đang chờ phản hồi, vui lòng đợi.',
  ALREADY_CONNECTED: 'Hai bạn đã kết nối với nhau rồi.',
  ACTION_BLOCKED: 'Không thể kết nối với người dùng này.',
  // quota
  QUOTA_EXCEEDED: 'Bạn đã dùng hết 5 lời mời kết nối miễn phí trong tháng. Nâng cấp Premium để tiếp tục.',
  // accept / decline / remove
  CONNECTION_NOT_FOUND: 'Không tìm thấy kết nối này.',
  UNAUTHORIZED_ACTION: 'Bạn không có quyền thực hiện thao tác này.',
  INVALID_CONNECTION_STATE: 'Trạng thái kết nối không hợp lệ cho thao tác này.',
  // parent resolution
  PARENT_NOT_FOUND: 'Không tìm thấy hồ sơ phụ huynh. Vui lòng thiết lập hồ sơ trước.',
});
