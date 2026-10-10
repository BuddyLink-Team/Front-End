import { PLAN_CODES } from '../constants/subscriptionConstants';

// Same plans as the backend SUBSCRIPTION_PLAN_DEFAULTS (SubscriptionDTO.toPlanResponse shape)
export const MOCK_PLANS = [
  {
    planCode: PLAN_CODES.FREE,
    name: 'Gói Miễn Phí (Free)',
    price: 0,
    currency: 'VND',
    durationMonths: 0,
    billingCycle: 'none',
    features: {
      childProfilesLimit: 1,
      discoveryViewLimitPerDay: 5,
      connectionRequestsLimitPerMonth: 5,
      playdatesLimitPerMonth: 3,
      playdateParticipationLimitPerMonth: 3,
      aiAssistantLimitPerMonth: 5,
    },
  },
  {
    planCode: PLAN_CODES.PREMIUM_MONTHLY,
    name: 'Gói Cao Cấp 1 Tháng (Premium Monthly)',
    price: 99000,
    currency: 'VND',
    durationMonths: 1,
    billingCycle: 'monthly',
    features: {
      childProfilesLimit: -1,
      discoveryViewLimitPerDay: -1,
      connectionRequestsLimitPerMonth: -1,
      playdatesLimitPerMonth: -1,
      playdateParticipationLimitPerMonth: -1,
      aiAssistantLimitPerMonth: -1,
    },
  },
  {
    planCode: PLAN_CODES.PREMIUM_YEARLY,
    name: 'Gói Cao Cấp 1 Năm (Premium Yearly)',
    price: 990000,
    currency: 'VND',
    durationMonths: 12,
    billingCycle: 'yearly',
    features: {
      childProfilesLimit: -1,
      discoveryViewLimitPerDay: -1,
      connectionRequestsLimitPerMonth: -1,
      playdatesLimitPerMonth: -1,
      playdateParticipationLimitPerMonth: -1,
      aiAssistantLimitPerMonth: -1,
    },
  },
];

// Free parent with 1 child (the Free child limit is reached)
export const INITIAL_MOCK_SUBSCRIPTION_STATE = {
  subscription: {
    _id: 'mock-subscription-1',
    planCode: PLAN_CODES.FREE,
    status: 'active',
    startDate: '2026-09-01T02:00:00.000Z',
    endDate: null,
    calendarAnchorAt: null,
    purchasedMonths: 0,
  },
  usage: {
    child_profiles: { limit: 1, used: 1, remaining: 0, periodType: null, resetAt: null },
    discovery_swipes: { limit: 5, used: 2, remaining: 3, periodType: 'daily', resetAt: null },
    playdates_created: { limit: 3, used: 1, remaining: 2, periodType: 'monthly', resetAt: null },
  },
  payments: [],
};

// Mock checkouts are paid automatically after this delay (no real bank transfer)
export const MOCK_AUTO_PAY_AFTER_MS = 10000;
