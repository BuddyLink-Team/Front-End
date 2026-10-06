import { describe, it, expect } from 'vitest';
import { getApiErrorMsg } from '../../utils/errorUtils';
import { COMMON_ERROR_MESSAGES } from '../../constants/error.constants';

describe('getApiErrorMsg', () => {
  const moduleMap = { USER_BLOCKED: 'Đã chặn', TOO_MANY_REQUESTS: 'Riêng module' };
  const apiError = (code, message = 'English message') => ({ success: false, message, error: { code, details: [] } });

  it('maps by module code first, then the common map', () => {
    expect(getApiErrorMsg(moduleMap, apiError('USER_BLOCKED'))).toBe('Đã chặn');
    expect(getApiErrorMsg(moduleMap, apiError('TOO_MANY_REQUESTS'))).toBe('Riêng module');
    expect(getApiErrorMsg(moduleMap, apiError('INTERNAL_SERVER_ERROR'))).toBe(COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  });

  it('reads the code of socket acks and network errors', () => {
    expect(getApiErrorMsg(moduleMap, { success: false, error: 'Blocked by user', code: 'USER_BLOCKED' })).toBe('Đã chặn');
    expect(getApiErrorMsg({}, apiError('NETWORK_ERROR', 'Network Error'))).toBe(COMMON_ERROR_MESSAGES.NETWORK_ERROR);
  });

  it('never shows the English backend message', () => {
    expect(getApiErrorMsg(moduleMap, apiError('SOMETHING_NEW', 'Raw english'), 'Dự phòng')).toBe('Dự phòng');
    expect(getApiErrorMsg(moduleMap, { message: 'Raw english' }, 'Dự phòng')).toBe('Dự phòng');
  });
});
