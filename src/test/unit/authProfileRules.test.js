import { describe, it, expect, beforeEach } from 'vitest';
import { isParentVerified, needsVerification } from '../../modules/auth/utils/verification';
import { registerSchema, resetPasswordSchema } from '../../modules/auth/validation/authValidation';
import { criteriaSchema, getFieldErrors } from '../../modules/child/validation/onboardingValidation';
import authReducer, { updateParentInfo, setTokens } from '../../modules/auth/redux/authSlice';
import { STORAGE_KEYS } from '../../constants/storage.constants';
import tokenStore from '../../services/tokenStore';

describe('verification helpers', () => {
  const verified = { verification: { isPhoneVerified: true, isEmailVerified: true } };
  const phoneOnly = { verification: { isPhoneVerified: true, isEmailVerified: false } };

  it('requires both phone and email to be verified', () => {
    expect(isParentVerified(verified)).toBe(true);
    expect(isParentVerified(phoneOnly)).toBe(false);
    expect(isParentVerified(null)).toBe(false);
  });

  it('only parents need verification', () => {
    expect(needsVerification({ role: 'parent' }, phoneOnly)).toBe(true);
    expect(needsVerification({ role: 'parent' }, verified)).toBe(false);
    expect(needsVerification({ role: 'admin' }, null)).toBe(false);
  });
});

describe('registerSchema phone rule', () => {
  const base = { fullName: 'Me Lan', email: 'a@b.com', password: '123456', confirmPassword: '123456' };

  it.each(['0901234567', '+84901234567', '84901234567'])('accepts %s', (phone) => {
    expect(registerSchema.safeParse({ ...base, phone }).success).toBe(true);
  });

  it.each(['x0901234567', '0901234567999', '0201234567', '09|1234567'])('rejects %s', (phone) => {
    expect(registerSchema.safeParse({ ...base, phone }).success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  const valid = { email: 'a@b.com', token: '123456', newPassword: 'secret1', confirmNewPassword: 'secret1' };

  it('accepts a 6-digit code with matching passwords', () => {
    expect(resetPasswordSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects non-numeric codes and mismatched confirmation', () => {
    expect(resetPasswordSchema.safeParse({ ...valid, token: '12ab56' }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ ...valid, confirmNewPassword: 'other' }).success).toBe(false);
  });
});

describe('onboarding criteriaSchema', () => {
  const valid = {
    preferredPlaydateDays: ['weekend'],
    preferredTimeSlots: ['morning'],
    preferredLocations: ['park'],
    maxDistanceKm: 10,
    ageMin: 2,
    ageMax: 8,
    city: 'Hà Nội',
    area: 'Cầu Giấy',
  };

  it('requires the parent to enter city and area (no pre-filled location)', () => {
    const errors = getFieldErrors(criteriaSchema, { ...valid, city: '', area: '' });
    expect(errors.city).toBeDefined();
    expect(errors.area).toBeDefined();
  });

  it('rejects an inverted age range on ageMax', () => {
    const errors = getFieldErrors(criteriaSchema, { ...valid, ageMin: 9, ageMax: 3 });
    expect(errors.ageMax).toBeDefined();
  });

  it('returns no errors for valid criteria', () => {
    expect(getFieldErrors(criteriaSchema, valid)).toEqual({});
  });
});

describe('authSlice session sync', () => {
  beforeEach(() => localStorage.clear());

  const loggedIn = {
    user: { id: 'u1', role: 'parent' },
    parent: { id: 'p1', fullName: 'Cũ', avatarUrl: '', verification: { isPhoneVerified: true, isEmailVerified: true } },
    isAuthenticated: true,
    sessionStatus: 'authenticated',
    isLoading: false,
    error: null,
  };

  it('updateParentInfo merges profile changes and persists them', () => {
    const next = authReducer(
      loggedIn,
      updateParentInfo({ fullName: 'Mới', avatarUrl: 'https://x/a.png', verification: { isPhoneVerified: false } }),
    );

    expect(next.parent.fullName).toBe('Mới');
    expect(next.parent.avatarUrl).toBe('https://x/a.png');
    expect(next.parent.verification).toEqual({ isPhoneVerified: false, isEmailVerified: true });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.PARENT_INFO)).fullName).toBe('Mới');
  });

  it('setTokens persists the new token pair', () => {
    authReducer(loggedIn, setTokens({ accessToken: 'new-access', refreshToken: 'new-refresh' }));

    expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBe('new-access');
    expect(tokenStore.getRefreshToken()).toBe('new-refresh');
  });
});
