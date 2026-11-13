import { describe, it, expect } from 'vitest';
import { describeAccountLock, getAccountLockMessage } from '../../modules/auth/utils/accountLock';
import { formatDateTime } from '../../utils/formatters';

describe('describeAccountLock', () => {
  it('says until when a suspended account is locked, why, and where to appeal', () => {
    const until = '2026-11-20T07:00:00.000Z';
    const message = describeAccountLock({ lockType: 'suspended', suspensionUntil: until, reason: 'quấy rối hoặc đe dọa người khác' });

    expect(message).toContain(`tạm đình chỉ đến ${formatDateTime(until)}`);
    expect(message).toContain('do vi phạm quy chuẩn cộng đồng: quấy rối hoặc đe dọa người khác');
    expect(message).toContain('Bạn có thể đăng nhập lại sau thời điểm này');
    expect(message).toContain('hotro@buddylink.vn');
  });

  it('tells a banned account it is for good', () => {
    const message = describeAccountLock({ lockType: 'banned', reason: 'tin rác' });

    expect(message).toContain('khóa vĩnh viễn do vi phạm quy chuẩn cộng đồng: tin rác');
    expect(message).not.toContain('đăng nhập lại');
  });

  it('falls back to a lock by an admin without a reason', () => {
    expect(describeAccountLock({ lockType: 'locked' })).toContain('đã bị Quản trị viên khóa');
    expect(describeAccountLock()).toContain('đã bị Quản trị viên khóa');
  });

  it('only answers for a locked account', () => {
    expect(getAccountLockMessage({ error: { code: 'INVALID_CREDENTIALS' } })).toBeNull();
    expect(getAccountLockMessage({ error: { code: 'ACCOUNT_DISABLED', details: { lockType: 'banned' } } })).toContain('khóa vĩnh viễn');
  });
});
