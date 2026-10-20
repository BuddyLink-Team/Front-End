import { describe, it, expect } from 'vitest';
import {
  formatRelativeTime,
  formatFullDateTime,
} from '../../modules/notification/utils/notificationFormatters';

describe('notificationFormatters', () => {
  it('returns empty string when date is null or undefined', () => {
    expect(formatRelativeTime(null)).toBe('');
    expect(formatRelativeTime(undefined)).toBe('');
    expect(formatFullDateTime(null)).toBe('');
  });

  it('formats recent timestamps as "Vừa xong"', () => {
    const justNow = new Date(Date.now() - 10 * 1000).toISOString();
    expect(formatRelativeTime(justNow)).toBe('Vừa xong');
  });

  it('formats minutes ago properly', () => {
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(fiveMinsAgo)).toBe('5 phút trước');
  });

  it('formats hours ago properly', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
    expect(formatRelativeTime(twoHoursAgo)).toBe('2 giờ trước');
  });

  it('formats full date time properly', () => {
    const date = new Date(2026, 9, 25, 9, 30);
    const result = formatFullDateTime(date);
    expect(result).toContain('09:30');
    expect(result).toContain('25/10/2026');
  });
});
