import { describe, it, expect } from 'vitest';
import { parentInfoSchema, changePasswordSchema } from './parentValidation';

describe('parentInfoSchema validation', () => {
  it('should validate valid parent info', () => {
    const validData = {
      fullName: 'Nguyen Van A',
      bio: 'Phụ huynh yêu thích các hoạt động ngoài trời',
      city: 'TP. Hồ Chí Minh',
      area: 'Quận 1',
      address: '123 Le Loi',
    };

    const result = parentInfoSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail when fullName is too short', () => {
    const invalidData = {
      fullName: 'A',
      city: 'Hà Nội',
      area: 'Cầu Giấy',
    };

    const result = parentInfoSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('tối thiểu 2 ký tự');
  });

  it('should fail when city or area is empty', () => {
    const invalidData = {
      fullName: 'Nguyen Van A',
      city: '',
      area: '',
    };

    const result = parentInfoSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('changePasswordSchema validation', () => {
  it('should validate matching passwords', () => {
    const validData = {
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
      confirmNewPassword: 'NewPassword123!',
    };

    const result = changePasswordSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail when confirm password does not match', () => {
    const invalidData = {
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
      confirmNewPassword: 'DifferentPassword123!',
    };

    const result = changePasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('không khớp');
  });

  it('should fail when new password is the same as current password', () => {
    const invalidData = {
      currentPassword: 'SamePassword123!',
      newPassword: 'SamePassword123!',
      confirmNewPassword: 'SamePassword123!',
    };

    const result = changePasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('không được trùng');
  });
});
