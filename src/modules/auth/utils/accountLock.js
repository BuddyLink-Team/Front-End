import { formatDateTime } from '../../../utils/formatters';

export const SUPPORT_EMAIL = 'hotro@buddylink.vn';

const CONTACT = `Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ ${SUPPORT_EMAIL}.`;

/**
 * What a locked parent is told when signing in is refused (ACCOUNT_DISABLED): suspended until a date,
 * banned for good, or locked by an admin, with the kind of violation and where to appeal.
 * @param {{ lockType?: 'suspended'|'banned'|'locked', suspensionUntil?: string|null, reason?: string|null }} [details]
 * @returns {string}
 */
export const describeAccountLock = (details = {}) => {
  const because = details?.reason
    ? ` do vi phạm quy chuẩn cộng đồng: ${details.reason}`
    : '';
  if (details?.lockType === 'suspended' && details.suspensionUntil) {
    return `Tài khoản của bạn đang bị tạm đình chỉ đến ${formatDateTime(details.suspensionUntil)}${because}. Bạn có thể đăng nhập lại sau thời điểm này. ${CONTACT}`;
  }
  if (details?.lockType === 'banned') {
    return `Tài khoản của bạn đã bị khóa vĩnh viễn${because}. ${CONTACT}`;
  }
  return `Tài khoản của bạn đã bị Quản trị viên khóa. Vui lòng liên hệ ${SUPPORT_EMAIL} để biết thêm chi tiết.`;
};

/**
 * Message of a sign-in error: the details of the lock for a locked account, null otherwise
 * @param {any} err - Rejected API error ({ error: { code, details } })
 * @returns {string|null}
 */
export const getAccountLockMessage = (err) =>
  err?.error?.code === 'ACCOUNT_DISABLED' ? describeAccountLock(err.error.details) : null;
