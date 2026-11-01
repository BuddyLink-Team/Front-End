import { describe, it, expect } from 'vitest';
import { isPremiumActive } from '../../modules/subscription/utils/premiumStatus';

const DAY = 24 * 60 * 60 * 1000;
const premium = (endInMs) => ({
  planCode: 'premium_monthly',
  status: 'active',
  endDate: new Date(Date.now() + endInMs).toISOString(),
});

describe('isPremiumActive', () => {
  it('is Premium for a paid active subscription before its end date', () => {
    expect(isPremiumActive(premium(DAY))).toBe(true);
    expect(isPremiumActive(premium(DAY), true)).toBe(true);
  });

  it('is no longer Premium once the end date has passed, even with a stale stored flag', () => {
    expect(isPremiumActive(premium(-1000), true)).toBe(false);
    expect(isPremiumActive(premium(-1000))).toBe(false);
  });

  it('is not Premium on the Free plan', () => {
    expect(isPremiumActive({ planCode: 'free', status: 'active', endDate: null })).toBe(false);
    expect(isPremiumActive(null)).toBe(false);
  });

  it('trusts the stored flag when no subscription is loaded', () => {
    expect(isPremiumActive(null, true)).toBe(true);
  });
});
