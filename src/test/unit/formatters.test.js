import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  getInitials,
  removeAccents,
  formatDate,
  formatDateTime,
  formatChildAge,
  formatPercent,
  formatTimeRange,
} from '../../utils/formatters';

describe('formatters utility', () => {
  it('formats currency correctly into VND', () => {
    const result = formatCurrency(100000);
    expect(result).toContain('100.000');
  });

  it('extracts correct name initials', () => {
    expect(getInitials('Nguyễn Văn An')).toBe('NA');
    expect(getInitials('Lan')).toBe('L');
    expect(getInitials('')).toBe('U');
  });

  it('removes Vietnamese accents safely', () => {
    expect(removeAccents('Hà Nội')).toBe('Ha Noi');
    expect(removeAccents('Đà Nẵng')).toBe('Da Nang');
  });

  it('formats valid date correctly', () => {
    const date = new Date('2026-09-27');
    expect(formatDate(date)).toBeTruthy();
  });

  it('formats a date with its time', () => {
    expect(formatDateTime(new Date(2026, 9, 23, 14, 5))).toBe('23/10/2026 14:05');
    expect(formatDateTime(null)).toBe('');
    expect(formatDateTime('not a date')).toBe('');
  });

  it('formats a child age in years, or in months below 1 year old', () => {
    const now = new Date(2026, 9, 23);
    expect(formatChildAge(new Date(2021, 3, 1), now)).toBe('5 tuổi');
    expect(formatChildAge(new Date(2026, 1, 10), now)).toBe('8 tháng');
    expect(formatChildAge(new Date(2026, 9, 20), now)).toBe('1 tháng');
    expect(formatChildAge('')).toBe('');
  });

  it('formats a ratio as a percentage', () => {
    expect(formatPercent(0.125)).toBe('12,5%');
    expect(formatPercent(0.5, 0)).toBe('50%');
    expect(formatPercent(null)).toBe('-');
    expect(formatPercent('abc')).toBe('-');
  });

  it('formatTimeRange formats a start time and a duration as a range', () => {
    expect(formatTimeRange('10:00', 120)).toBe('10:00 - 12:00');
    expect(formatTimeRange('23:30', 60)).toBe('23:30 - 00:30');
    expect(formatTimeRange('10:00')).toBe('10:00');
    expect(formatTimeRange('')).toBe('');
  });
});
