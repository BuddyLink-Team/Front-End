/**
 * Connection module: statuses, tabs and backend error code -> Vietnamese message map.
 */

/** Mirrors BE connection.constants.js */
export const CONNECTION_STATUS = Object.freeze({
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  REMOVED: 'removed',
});

/** `direction` of a pending request, seen from the current parent */
export const CONNECTION_DIRECTION = Object.freeze({
  INCOMING: 'incoming',
  OUTGOING: 'outgoing',
});

/** Lists of the connections page (one tab each) */
export const CONNECTION_LISTS = Object.freeze({
  ACCEPTED: 'accepted',
  INCOMING: 'incoming',
  OUTGOING: 'outgoing',
});

/** GET /connections filters of each list */
export const CONNECTION_LIST_QUERIES = Object.freeze({
  [CONNECTION_LISTS.ACCEPTED]: { status: CONNECTION_STATUS.ACCEPTED },
  [CONNECTION_LISTS.INCOMING]: { status: CONNECTION_STATUS.PENDING, direction: CONNECTION_DIRECTION.INCOMING },
  [CONNECTION_LISTS.OUTGOING]: { status: CONNECTION_STATUS.PENDING, direction: CONNECTION_DIRECTION.OUTGOING },
});

/** Connections per page (GET /connections?page=&limit=) */
export const CONNECTION_PAGE_SIZE = 10;

export const CONNECTION_TABS = Object.freeze([
  { id: CONNECTION_LISTS.ACCEPTED, label: 'Bạn bè đã kết nối' },
  { id: CONNECTION_LISTS.INCOMING, label: 'Lời mời kết nối' },
  { id: CONNECTION_LISTS.OUTGOING, label: 'Lời mời đã gửi' },
]);

/** Confirm dialog content per action (ui_architecture_spec: confirm accept / decline) */
export const CONNECTION_ACTIONS = Object.freeze({
  ACCEPT: 'accept',
  DECLINE: 'decline',
  REMOVE: 'remove',
  CANCEL: 'cancel',
  BLOCK: 'block',
});

export const CONNECTION_CONFIRM = Object.freeze({
  [CONNECTION_ACTIONS.ACCEPT]: {
    title: 'Chấp nhận lời mời kết nối',
    description: (name) => `Kết nối với ${name}? Hai gia đình sẽ có thể nhắn tin và mời nhau hẹn chơi.`,
    confirmLabel: 'Chấp nhận',
    variant: 'info',
  },
  [CONNECTION_ACTIONS.DECLINE]: {
    title: 'Từ chối lời mời kết nối',
    description: (name) => `Từ chối lời mời của ${name}? Phụ huynh này vẫn có thể gửi lại lời mời sau.`,
    confirmLabel: 'Từ chối',
    variant: 'warning',
  },
  [CONNECTION_ACTIONS.REMOVE]: {
    title: 'Hủy kết nối',
    description: (name) => `Hủy kết nối với ${name}? Hai bên sẽ không thể tiếp tục nhắn tin trực tiếp.`,
    confirmLabel: 'Hủy kết nối',
    variant: 'danger',
  },
  [CONNECTION_ACTIONS.CANCEL]: {
    title: 'Thu hồi lời mời',
    description: (name) => `Thu hồi lời mời kết nối đã gửi tới ${name}?`,
    confirmLabel: 'Thu hồi',
    variant: 'warning',
  },
  [CONNECTION_ACTIONS.BLOCK]: {
    title: 'Chặn người dùng',
    description: (name) => `Chặn ${name}? Hai bên sẽ không thể kết nối, nhắn tin hay mời nhau hẹn chơi.`,
    confirmLabel: 'Chặn',
    variant: 'danger',
  },
});

/**
 * Backend error codes -> user-facing Vietnamese strings (getApiErrorMsg)
 */
export const CONNECTION_ERROR_MAP = Object.freeze({
  // request errors (connectionService.validateConnectionRequest)
  SELF_CONNECTION_NOT_ALLOWED: 'Không thể gửi lời mời kết nối tới chính mình.',
  TARGET_PARENT_NOT_FOUND: 'Không tìm thấy phụ huynh này.',
  CONNECTION_NOT_ALLOWED: 'Phụ huynh này hiện không nhận lời mời kết nối.',
  BLOCKED_INTERACTION: 'Không thể kết nối với người dùng này.',
  // quota (the PaywallModal also opens, see services/apiClient.js)
  QUOTA_EXCEEDED: 'Bạn đã dùng hết lượt gửi lời mời kết nối trong tháng. Nâng cấp Premium để tiếp tục.',
  // accept / decline / remove
  CONNECTION_NOT_FOUND: 'Không tìm thấy kết nối này.',
  UNAUTHORIZED_ACTION: 'Bạn không có quyền thực hiện thao tác này.',
  INVALID_CONNECTION_STATE: 'Lời mời này đã được xử lý trước đó.',
  // direct chat
  CONNECTION_REQUIRED: 'Chỉ có thể nhắn tin với phụ huynh đã kết nối.',
  USER_BLOCKED: 'Không thể nhắn tin với người dùng này.',
  // parent resolution
  PARENT_NOT_FOUND: 'Không tìm thấy hồ sơ phụ huynh. Vui lòng thiết lập hồ sơ trước.',
});
