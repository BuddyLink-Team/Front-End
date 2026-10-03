import { describe, it, expect } from 'vitest';
import { childSchema } from './onboardingValidation';

describe('childSchema validation', () => {
  it('should validate valid child data', () => {
    const validChild = {
      displayName: 'Bé Su',
      dateOfBirth: '2020-01-01',
      gender: 'girl',
      interests: ['Lego & Lắp ráp', 'Vẽ & Hội họa'],
      favoriteActivities: ['Bơi lội'],
      personality: ['Năng động & Thích vận động'],
    };

    const result = childSchema.safeParse(validChild);
    expect(result.success).toBe(true);
  });

  it('should fail when displayName is too short', () => {
    const invalidChild = {
      displayName: 'B',
      dateOfBirth: '2020-01-01',
      gender: 'boy',
      interests: ['Lego'],
      favoriteActivities: ['Bơi'],
      personality: ['Ngoan'],
    };

    const result = childSchema.safeParse(invalidChild);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('ít nhất 2 ký tự');
  });

  it('should fail when interests array is empty', () => {
    const invalidChild = {
      displayName: 'Bé Bo',
      dateOfBirth: '2021-05-10',
      gender: 'boy',
      interests: [],
      favoriteActivities: ['Bơi'],
      personality: ['Ngoan'],
    };

    const result = childSchema.safeParse(invalidChild);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('ít nhất 1 sở thích');
  });

  it('should fail when dateOfBirth is in the future', () => {
    const futureDate = '2099-01-01';
    const invalidChild = {
      displayName: 'Bé Bo',
      dateOfBirth: futureDate,
      gender: 'boy',
      interests: ['Lego'],
      favoriteActivities: ['Bơi'],
      personality: ['Ngoan'],
    };

    const result = childSchema.safeParse(invalidChild);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('trước thời điểm hiện tại');
  });
});
