import { describe, it, expect } from 'vitest';
import { formatCurrency, getInitials, removeAccents, formatDate } from '../../utils/formatters';

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
});
